/* The search box, and what a result looks like.

   The engine is in search/search.js; this file is only its face. Two things about
   that face are deliberate. First, every note the engine emits is printed: if a word
   was not found and a near spelling was tried instead, the reader is told, because a
   near miss dressed up as a hit is how a search box lies. Second, every result
   carries the page it was printed on, so a hit is never the end of the trail.

   Nine million characters of index sit behind this box. None of it is fetched until
   a reader searches for the first time.

   The examples in the help table are queries, not sentences: what to type stays in
   Latin script in both editions, because it is what the index is keyed on and typing
   the translation would find nothing. What each one does is a sentence, and is
   translated. */

import {
  el, num, clear, chip, cite, disclosure, downloadCsv,
} from "../components/ui.js";
import { t, word } from "../i18n/i18n.js";
import { engine } from "../search/search.js";
import { showEntity } from "./entities.js";

/* The kinds a record can be, in the order a reader is likely to want them. Any kind
   the index holds that is not named here still appears, at the end. */
const KIND_ORDER = ["finding", "tender", "contract", "clause", "company", "person",
  "organisation", "project", "document", "amendment", "lot", "owner", "rule",
  "signal", "location"];

const ENTITY_KIND = { company: 1, person: 1, organisation: 1, project: 1 };

/* What a reader may type. The left column is the query itself; the right is the key
   of the sentence explaining it. Every one of them is answered by the parser in
   search.js. */
const HELP = [
  ["lift maintenance", "help.bothWords"],
  ['"single largest contract"', "help.phrase"],
  ["rajuk OR cda", "help.either"],
  ["lift -tender", "help.without"],
  ["(lift OR escalator) rajuk", "help.grouped"],
  ["company:niaz", "help.scope"],
  ["tender:1001782", "help.tender"],
  ["amount:10000000..50000000", "help.numRange"],
  ["closing:2024-01-01..2024-06-30", "help.dateRange"],
  ["label:UNUSUAL", "help.label"],
  ["kind:clause", "help.kind"],
  ["ra1uk", "help.ocr"],
];

/* The CSV a reader takes away carries the raw values, so its headers are the field
   names rather than translated captions — a spreadsheet formula written against one
   edition has to work against the other. */
const flat = (r) => ({
  kind: r.k, name: r.t, line: r.s,
  file: r.r && r.r.file ? r.r.file : "",
  page: r.r && r.r.page ? r.r.page : "",
  fields: Object.entries(r.f || {}).map(([k, v]) => `${k}=${v}`).join("; "),
});

/* One result. The name is a link where a link can lead somewhere useful — an entity
   to its profile, anything printed to its page — and plain text where it cannot. */
function hitNode(hit) {
  const r = hit.r;
  const head = el("p", { class: "hithead" }, chip(r.k, { square: true }), " ");
  if (ENTITY_KIND[r.k] && r.key) {
    head.append(el("button", { class: "linky", type: "button",
      onclick: () => { window.location.hash = `entity=${r.key}`; showEntity(r.key); } },
    r.t));
  } else if (r.f && r.f.tender && r.k !== "document") {
    head.append(el("a", { href: `#q=${encodeURIComponent(`tender:${r.f.tender}`)}` }, r.t));
  } else {
    head.append(el("b", r.t));
  }

  const li = el("li", { class: "hit" }, head);
  if (hit.snippet) li.append(el("p", { class: "snip", html: hit.snippet }));
  else if (r.s) li.append(el("p", { class: "snip" }, r.s));

  /* A tag is a query as much as a label: it reads scope:value because clicking it
     runs exactly that. The scope keeps its indexed name; the value is the record's. */
  const foot = el("p", { class: "hitfoot" });
  for (const k of ["tender", "company", "person", "agency", "district", "label",
    "status", "finding", "rule"]) {
    if (!r.f || !r.f[k]) continue;
    const v = String(r.f[k]).split(";")[0];
    foot.append(el("a", { class: "tag",
      href: `#q=${encodeURIComponent(`${k}:${v}`)}` }, `${k}: ${v}`), " ");
  }
  if (r.r && r.r.file) foot.append(cite(r.r.file, r.r.page || null));
  else foot.append(el("span", { class: "note" }, t("srch.notOnAPage")));
  li.append(foot);
  return li;
}

function helpPanel(eng) {
  const scopes = [...eng.fields.entries()];
  const group = (kind) => scopes.filter(([, k]) => k === kind).map(([n]) => n).sort();
  return el("div", { class: "helpgrid" },
    el("table", { class: "grid" },
      el("caption", t("srch.helpCaption")),
      el("thead", el("tr", el("th", { scope: "col" }, t("srch.typeThis")),
        el("th", { scope: "col" }, t("srch.andItMeans")))),
      el("tbody", HELP.map(([q, key]) =>
        el("tr", el("td", el("code", q)), el("td", t(key)))))),
    el("dl", { class: "fields" },
      el("dt", t("srch.namedFields")),
      el("dd", group("scope").join(", ")),
      el("dt", t("srch.numFields")),
      el("dd", group("num").join(", ")),
      el("dt", t("srch.dateFields")),
      el("dd", group("date").join(", ")),
      el("dt", t("srch.recordKinds")),
      el("dd", Object.entries(eng.kinds || {})
        .map(([k, n]) => t("srch.kindCount",
          { kind: word(`label.${k}`, k), n: num(n) })).join(", "))));
}

/* The router hands queries in here. One panel exists per page, so one reference is
   enough, and a query arriving from a link behaves exactly like one typed by hand. */
let RUN = null;
export function runQuery(q) { if (RUN) return RUN(q); return null; }

export function searchPanel() {
  const input = el("input", { type: "search", class: "bigsearch", autocomplete: "off",
    placeholder: t("srch.placeholder"), "aria-label": t("srch.boxAria") });
  const kindSel = el("select", { "aria-label": t("srch.kindAria") },
    el("option", { value: "" }, t("srch.everyKind")));
  const status = el("p", { class: "note", role: "status", "aria-live": "polite" },
    t("srch.idle"));
  const notes = el("ul", { class: "searchnotes" });
  const out = el("ol", { class: "hits" });
  const actions = el("div", { class: "tablebar" });
  const helpHost = el("div");
  const facets = el("div", { class: "chiprow" });
  let limit = 40, last = "", built = false, running = false, docs = 0;

  async function run(q) {
    input.value = q;
    last = q;
    clear(notes);
    if (!q.trim()) {
      clear(out); clear(actions); clear(facets);
      status.textContent = t("srch.emptyQuery");
      return;
    }
    if (running) return;
    running = true;
    status.textContent = built ? t("srch.searching", { q }) : t("srch.fetching");
    let eng;
    try {
      eng = await engine();
    } catch (e) {
      running = false;
      status.textContent = "";
      clear(out);
      out.append(el("li", { class: "warn" },
        t("srch.indexFailed", { message: e.message })));
      return;
    }
    if (!built) {
      built = true;
      docs = (eng.kinds || {}).document || 0;
      for (const k of [...Object.keys(eng.kinds || {})].sort((a, b) =>
        KIND_ORDER.indexOf(a) - KIND_ORDER.indexOf(b))) {
        kindSel.append(el("option", { value: k },
          t("srch.kindOption", { kind: word(`label.${k}`, k), n: num(eng.kinds[k]) })));
      }
      helpHost.append(disclosure(t("srch.howTo"), () => helpPanel(eng)));
    }
    const res = await eng.search(q, { limit, kind: kindSel.value || undefined });
    running = false;
    paint(res);
    if (last !== q) run(last);
  }

  function paint(res) {
    clear(out); clear(actions); clear(facets); clear(notes);
    const shown = res.results.length;
    status.textContent = res.total
      ? t("srch.matchCount", { n: num(res.total), shown: num(shown) })
      : t("srch.noMatch");
    for (const n of res.notes) notes.append(el("li", n));
    if (!res.total) notes.append(el("li", t("srch.notPrinted", { documents: num(docs) })));

    /* the kinds the whole match set falls into, as a way to narrow it */
    const byKind = Object.entries(res.kinds || {})
      .sort((a, b) => KIND_ORDER.indexOf(a[0]) - KIND_ORDER.indexOf(b[0]));
    if (kindSel.value) {
      facets.append(el("button", { class: "linky", type: "button", onclick: () => {
        kindSel.value = ""; limit = 40; run(last);
      } }, t("srch.onlyKind", { kind: word(`label.${kindSel.value}`, kindSel.value) })));
    } else if (byKind.length > 1) {
      facets.append(el("span", { class: "note" }, t("srch.narrowTo")));
      for (const [k, n] of byKind) {
        facets.append(el("button", { class: "linky", type: "button", onclick: () => {
          kindSel.value = k; limit = 40; run(last);
        } }, t("srch.kindCount", { kind: word(`label.${k}`, k), n: num(n) })));
      }
    }
    for (const hit of res.results) out.append(hitNode(hit));

    if (res.total > shown) {
      actions.append(el("button", { class: "act", type: "button", onclick: () => {
        limit = shown + 40; run(last);
      } }, t("srch.showNext", { n: num(Math.min(40, res.total - shown)) })));
    }
    /* The column headings of the file a reader takes away are the dataset's own field
       names, in both editions, for the reason given at flat() above. */
    if (shown) {
      actions.append(el("button", { class: "act ghost", type: "button", onclick: () =>
        downloadCsv("search_results.csv", [
          { key: "kind", label: "kind" }, { key: "name", label: "name" },
          { key: "line", label: "line beneath the name" },
          { key: "fields", label: "fields" },
          { key: "file", label: "source file" }, { key: "page", label: "page" },
        ], res.results.map((h) => flat(h.r))) },
      t("srch.downloadCsv")));
    }
  }

  let timer = null;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = input.value;
      history.replaceState(null, "", q.trim() ? `#q=${encodeURIComponent(q)}` : "#search");
      run(q);
    }, 260);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    clearTimeout(timer);
    history.replaceState(null, "", `#q=${encodeURIComponent(input.value)}`);
    run(input.value);
  });
  kindSel.addEventListener("change", () => { limit = 40; if (last) run(last); });
  RUN = run;

  return el("section", { class: "band", id: "search" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, t("srch.kicker")),
      el("h2", t("srch.title")),
      el("div", { class: "prose" },
        el("p", t("srch.p1")),
        el("p", t("srch.p2"))),
      el("div", { class: "searchbar" },
        el("label", { class: "field grow" },
          el("span", { class: "sr" }, t("srch.srBox")), input),
        el("label", { class: "field" },
          el("span", { class: "sr" }, t("srch.srKind")), kindSel)),
      status, facets, notes, out, actions, helpHost));
}
