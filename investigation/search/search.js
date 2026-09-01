/* The search engine's runtime half. Its other half — the index — is built by
   investigation/parser/06_search.py, and the contract between them is the
   how_to_read string shipped inside postings.json.

   What a reader can type:

     two words              both must appear (AND is the default)
     "exactly this"         the words in this order, verified against the text
     rajuk OR cda           either
     lift -tender           NOT: the second must not appear ("NOT tender" also works)
     (a OR b) c             grouped
     company:spectra        a scoped field; 25 scopes are in the index
     amount:10000000..50000000    a numeric range; 16 numeric fields
     closing:2024-01-01..2024-06-30   a date range; 10 date fields
     kind:clause label:UNUSUAL        the record's own kind and label
     signal:S-ONE-RESPONSIVE          the tenders an observation applies to

   A word with no exact match is retried two ways: against an OCR-loose spelling
   map (0 for o, 1 and i for l, 5 for s, 8 for b, 2 for z), and against every token
   in the index within a bounded edit distance. Both are reported to the reader as
   what they are, so nobody mistakes a near miss for a hit. */

import { records, postings, texts, pageShard } from "../app/data.js";

const TOK = /[ঀ-৿]+|[a-z0-9]+/g;
export const tokens = (s) => String(s || "").toLowerCase().match(TOK) || [];

const LOOSE = { 0: "o", 1: "l", i: "l", 5: "s", 8: "b", 2: "z" };
const loosen = (w) => w.replace(/[015i82]/g, (c) => LOOSE[c] || c);

/* how much a hit is worth. A word in a record's own name is worth far more than the
   same word on page 40 of a rulebook, and a near miss is worth a fraction of a hit. */
const W_STRONG = 8, W_BODY = 1.5, W_FIELD = 6, W_RANGE = 4, W_PHRASE = 14;
const W_FUZZY = 0.45, W_LOOSE = 0.6, W_TITLE = 5;

const KIND_WEIGHT = {
  finding: 1.35, rule: 1.25, signal: 1.2, tender: 1.12, contract: 1.1,
  company: 1.1, person: 1.08, organisation: 1.05, project: 1.05, amendment: 1.02,
  clause: 1, owner: 1, lot: .95, document: .95, location: .85,
};

function decode(list) {
  const out = new Array(list.length);
  let at = 0;
  for (let i = 0; i < list.length; i++) { at += list[i]; out[i] = at; }
  return out;
}

function bounded(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return false;
  let prev = new Array(b.length + 1);
  let cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let best = cur[0];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return false;
    [prev, cur] = [cur, prev];
  }
  return prev[b.length] <= max;
}

/* ---- the query, read left to right ----
   A small recursive-descent parser rather than a regular expression, because
   parentheses nest and a regular expression cannot count them. */
function lex(q) {
  const out = [];
  const re = /"([^"]*)"|(\()|(\))|([^\s()]+)/g;
  let m;
  while ((m = re.exec(q))) {
    if (m[1] !== undefined) out.push({ t: "phrase", v: m[1] });
    else if (m[2]) out.push({ t: "(" });
    else if (m[3]) out.push({ t: ")" });
    else {
      const w = m[4];
      const up = w.toUpperCase();
      if (up === "OR" || w === "|") out.push({ t: "or" });
      else if (up === "AND" || w === "&") out.push({ t: "and" });
      else if (up === "NOT") out.push({ t: "not" });
      else if (w.startsWith("-") && w.length > 1) {
        out.push({ t: "not" });
        out.push({ t: "word", v: w.slice(1) });
      } else out.push({ t: "word", v: w });
    }
  }
  return out;
}

function parse(q, fields) {
  const ts = lex(q);
  let i = 0;
  const peek = () => ts[i];
  const eat = () => ts[i++];

  function atom() {
    const t = eat();
    if (!t) return null;
    if (t.t === "(") {
      const e = expr();
      if (peek() && peek().t === ")") eat();
      return e;
    }
    if (t.t === "not") { const k = atom(); return k ? { t: "not", kid: k } : null; }
    if (t.t === "phrase") return { t: "phrase", words: tokens(t.v), raw: t.v };
    if (t.t === "word") {
      const c = t.v.indexOf(":");
      if (c > 0) {
        const name = t.v.slice(0, c).toLowerCase();
        const rest = t.v.slice(c + 1);
        const f = fields.get(name);
        if (f === "num" || f === "date") {
          const [lo, hi] = rest.includes("..") ? rest.split("..") : [rest, rest];
          return { t: "range", name, lo, hi, mode: f, raw: t.v };
        }
        if (f === "scope") return { t: "field", name, value: rest, raw: t.v };
      }
      return { t: "term", word: t.v.toLowerCase(), raw: t.v };
    }
    return atom();
  }

  function seq() {
    const kids = [];
    while (peek() && peek().t !== ")" && peek().t !== "or") {
      if (peek().t === "and") { eat(); continue; }
      const a = atom();
      if (a) kids.push(a);
    }
    return kids.length === 1 ? kids[0] : { t: "all", kids };
  }

  function expr() {
    const kids = [seq()];
    while (peek() && peek().t === "or") { eat(); kids.push(seq()); }
    return kids.length === 1 ? kids[0] : { t: "any", kids };
  }

  const tree = expr();
  return tree && tree.kids && !tree.kids.length ? null : tree;
}

let built = null;
export function engine() {
  if (!built) built = build();
  return built;
}

async function build() {
  const [rec, post, text] = await Promise.all([records(), postings(), texts()]);
  const fields = new Map();
  for (const s of rec.scopes) fields.set(s, "scope");
  for (const n of rec.numeric) fields.set(n, "num");
  for (const d of rec.dates) fields.set(d, "date");
  fields.set("kind", "scope");

  const strongCache = new Map(), bodyCache = new Map();
  const ids = (map, cache, w) => {
    if (cache.has(w)) return cache.get(w);
    const raw = map[w];
    const out = raw ? decode(raw) : null;
    cache.set(w, out);
    return out;
  };
  const titleWords = new Map();
  const titleSet = (r) => {
    let s = titleWords.get(r.i);
    if (!s) { s = new Set(tokens(r.t)); titleWords.set(r.i, s); }
    return s;
  };

  const vocab = post.vocab;
  const byPrefix = (w) => vocab.filter((v) => v.length > w.length && v.startsWith(w));
  const byDistance = (w) => {
    const max = w.length <= 4 ? 1 : 2;
    const out = [];
    for (const v of vocab) {
      if (Math.abs(v.length - w.length) > max) continue;
      if (v === w) continue;
      if (bounded(w, v, max)) out.push(v);
      if (out.length >= 12) break;
    }
    return out;
  };

  /* one word, with every fallback tried in order and the fallback reported */
  function term(word, notes) {
    const hits = new Map();
    const bump = (list, weight, wordUsed) => {
      if (!list) return 0;
      for (const id of list) {
        const r = rec.byId.get(id);
        if (!r) continue;
        const extra = titleSet(r).has(wordUsed) ? W_TITLE : 0;
        hits.set(id, (hits.get(id) || 0) + weight + extra);
      }
      return list.length;
    };
    let found = bump(ids(post.strong, strongCache, word), W_STRONG, word)
      + bump(ids(post.body, bodyCache, word), W_BODY, word);
    if (found) return hits;

    const pre = byPrefix(word).slice(0, 24);
    if (pre.length) {
      for (const p of pre) {
        bump(ids(post.strong, strongCache, p), W_STRONG * .8, p);
        bump(ids(post.body, bodyCache, p), W_BODY * .8, p);
      }
      notes.push(`“${word}” was read as the start of a word: ${pre.slice(0, 6).join(", ")}`
        + (pre.length > 6 ? ` and ${pre.length - 6} more` : ""));
      return hits;
    }

    const lw = loosen(word);
    const alt = (post.loose[lw] || []).filter((v) => v !== word);
    if (alt.length) {
      for (const a of alt) {
        bump(ids(post.strong, strongCache, a), W_STRONG * W_LOOSE, a);
        bump(ids(post.body, bodyCache, a), W_BODY * W_LOOSE, a);
      }
      notes.push(`“${word}” shares an OCR-loose spelling with ${alt.join(", ")}`);
      return hits;
    }

    const near = byDistance(word);
    if (near.length) {
      for (const n of near) {
        bump(ids(post.strong, strongCache, n), W_STRONG * W_FUZZY, n);
        bump(ids(post.body, bodyCache, n), W_BODY * W_FUZZY, n);
      }
      notes.push(`“${word}” is not in the index; the closest words that are: `
        + near.slice(0, 6).join(", "));
      return hits;
    }
    notes.push(`“${word}” appears nowhere in the `
      + `${((rec.kinds || {}).document || 0).toLocaleString("en-GB")} documents `
      + "or the dataset built from them");
    return hits;
  }

  function field(name, value, notes) {
    const want = value.toLowerCase();
    const hits = new Map();
    for (const r of rec.records) {
      const v = name === "kind" ? r.k : r.f[name];
      if (v === undefined || v === null) continue;
      const s = String(v).toLowerCase();
      if (s === want) hits.set(r.i, W_FIELD * 1.6);
      else if (s.includes(want)) hits.set(r.i, W_FIELD);
    }
    if (!hits.size) notes.push(`no record has ${name} matching “${value}”`);
    return hits;
  }

  function range(name, lo, hi, mode, notes) {
    const hits = new Map();
    const numeric = mode === "num";
    const a = numeric ? (lo === "" || lo === "*" ? -Infinity : +lo) : lo;
    const b = numeric ? (hi === "" || hi === "*" ? Infinity : +hi) : hi;
    if (numeric && (Number.isNaN(a) || Number.isNaN(b))) {
      notes.push(`${name}:${lo}..${hi} is not a pair of numbers`);
      return hits;
    }
    for (const r of rec.records) {
      const v = numeric ? r.n[name] : r.d[name];
      if (v === undefined || v === null || v === "") continue;
      const ok = numeric ? (+v >= a && +v <= b) : (String(v) >= a && String(v) <= b);
      if (ok) hits.set(r.i, W_RANGE);
    }
    if (!hits.size) notes.push(`nothing in the dataset has ${name} between ${lo} and ${hi}`);
    return hits;
  }

  /* the words of a phrase must all be present before it is worth checking the text */
  function phraseCandidates(words) {
    let acc = null;
    for (const w of words) {
      const set = new Set([...(ids(post.strong, strongCache, w) || []),
        ...(ids(post.body, bodyCache, w) || [])]);
      acc = acc === null ? set : new Set([...acc].filter((x) => set.has(x)));
      if (!acc.size) break;
    }
    return acc || new Set();
  }

  const haystack = (r) => `${r.t} ${r.s} ${text[r.i] || ""}`.toLowerCase()
    .replace(/\s+/g, " ");

  function evaluate(node, notes) {
    if (!node) return { map: new Map(), neg: false };
    switch (node.t) {
      case "term": return { map: term(node.word, notes), neg: false };
      case "field": return { map: field(node.name, node.value, notes), neg: false };
      case "range": return { map: range(node.name, node.lo, node.hi, node.mode, notes),
        neg: false };
      case "phrase": {
        const map = new Map(node.confirmed || []);
        return { map, neg: false };
      }
      case "not": {
        const k = evaluate(node.kid, notes);
        return { map: k.map, neg: true };
      }
      case "all": case "any": {
        const parts = node.kids.map((k) => evaluate(k, notes));
        const pos = parts.filter((p) => !p.neg);
        const neg = parts.filter((p) => p.neg);
        let map;
        if (!pos.length) {
          map = new Map(rec.records.map((r) => [r.i, 1]));
        } else if (node.t === "any") {
          map = new Map();
          for (const p of pos) for (const [k, v] of p.map) map.set(k, (map.get(k) || 0) + v);
        } else {
          const sorted = pos.slice().sort((a, b) => a.map.size - b.map.size);
          map = new Map();
          for (const [k, v] of sorted[0].map) {
            let total = v, all = true;
            for (let i = 1; i < sorted.length; i++) {
              const w = sorted[i].map.get(k);
              if (w === undefined) { all = false; break; }
              total += w;
            }
            if (all) map.set(k, total);
          }
        }
        for (const n of neg) for (const k of n.map.keys()) map.delete(k);
        return { map, neg: false };
      }      default: return { map: new Map(), neg: false };
    }
  }

  function collect(node, out) {
    if (!node) return out;
    if (node.t === "phrase") { out.push(node); return out; }
    if (node.t === "not") return collect(node.kid, out);
    for (const k of node.kids || []) collect(k, out);
    return out;
  }

  /* A phrase is only a hit if the words really do sit next to each other. For a
     record built out of fields that can be checked here; for a document the words
     may be anywhere in its pages, so the page file is fetched and read. That is
     bounded: past PAGE_LIMIT documents the reader is told how many were not
     checked rather than being made to wait. */
  const PAGE_LIMIT = 60;
  async function resolve(node, notes) {
    const cand = phraseCandidates(node.words);
    const want = node.words.join(" ");
    node.confirmed = new Map();
    node.pages = new Map();
    const docs = [];
    let droppedRecords = 0;
    for (const id of cand) {
      const r = rec.byId.get(id);
      if (!r) continue;
      if (haystack(r).includes(want)) node.confirmed.set(id, W_PHRASE + W_STRONG);
      else if (r.k === "document") docs.push(r);
      else droppedRecords++;
    }
    const check = docs.slice(0, PAGE_LIMIT);
    await Promise.all(check.map(async (r) => {
      try {
        const shard = await pageShard(r.key);
        for (const p of shard.pages) {
          if (String(p.text).toLowerCase().replace(/\s+/g, " ").includes(want)) {
            node.confirmed.set(r.i, W_PHRASE);
            node.pages.set(r.i, p.n);
            break;
          }
        }
      } catch { /* a page file that will not load is reported below, not guessed at */ }
    }));
    if (docs.length > PAGE_LIMIT) {
      notes.push(`“${node.raw}”: ${docs.length - PAGE_LIMIT} more documents hold all `
        + `of these words somewhere; only the first ${PAGE_LIMIT} were opened to check `
        + `whether the words sit together`);
    }
    if (droppedRecords) {
      notes.push(`“${node.raw}”: ${droppedRecords} records hold all of these words but `
        + `not in this order, and are left out`);
    }
  }

  function snippet(r, words) {
    const flat = `${r.s} ${text[r.i] || ""}`.replace(/\s+/g, " ").trim();
    if (!flat) return "";
    const low = flat.toLowerCase();
    let at = -1;
    for (const w of words) { at = low.indexOf(w); if (at >= 0) break; }
    const from = at < 0 ? 0 : Math.max(0, at - 80);
    let cut = flat.slice(from, from + 220);
    if (from > 0) cut = `… ${cut}`;
    if (from + 220 < flat.length) cut = `${cut} …`;
    let html = cut.replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    for (const w of new Set(words)) {
      if (w.length < 2) continue;
      html = html.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
        "<mark>$1</mark>");
    }
    return html;
  }

  async function search(q, opts = {}) {
    const notes = [];
    const tree = parse(q, fields);
    if (!tree) return { query: q, total: 0, results: [], notes, kinds: {} };
    for (const p of collect(tree, [])) await resolve(p, notes);
    const top = evaluate(tree, notes);
    /* a query that is nothing but an exclusion still has to mean something: it is
       everything in the index that the exclusion does not name */
    let map = top.map;
    if (top.neg) {
      const all = new Map(rec.records.map((r) => [r.i, 1]));
      for (const k of map.keys()) all.delete(k);
      map = all;
      notes.push("this query only says what to leave out, so everything else is listed");
    }
    const words = [];
    (function terms(n) {
      if (!n) return;
      if (n.t === "term") words.push(n.word);
      if (n.t === "phrase") words.push(...n.words);
      for (const k of n.kids || []) terms(k);
      if (n.kid) terms(n.kid);
    })(tree);

    const kinds = {};
    const scored = [];
    for (const [id, base] of map) {
      const r = rec.byId.get(id);
      if (!r) continue;
      if (opts.kind && r.k !== opts.kind) continue;
      kinds[r.k] = (kinds[r.k] || 0) + 1;
      scored.push({ r, score: base * (KIND_WEIGHT[r.k] || 1) });
    }
    scored.sort((a, b) => b.score - a.score || a.r.i - b.r.i);
    const page = scored.slice(0, opts.limit || 40);
    for (const hit of page) hit.snippet = snippet(hit.r, words);
    return { query: q, total: scored.length, results: page, notes, kinds, words };
  }

  return { search, records: rec, fields, vocab, kinds: rec.kinds };
}
