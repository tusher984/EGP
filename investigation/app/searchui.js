/* The search box, and what a result looks like.

   The engine is in search/search.js; this file is only its face. Two things about
   that face are deliberate. First, every note the engine emits is printed: if a word
   was not found and a near spelling was tried instead, the reader is told, because a
   near miss dressed up as a hit is how a search box lies. Second, every result
   carries the page it was printed on, so a hit is never the end of the trail.

   Nine million characters of index sit behind this box. None of it is fetched until
   a reader searches for the first time. */

import {
  el, num, clear, chip, cite, disclosure, downloadCsv,
} from "../components/ui.js";
import { engine } from "../search/search.js";
import { showEntity } from "./entities.js";

/* The kinds a record can be, in the order a reader is likely to want them. Any kind
   the index holds that is not named here still appears, at the end. */
const KIND_ORDER = ["finding", "tender", "contract", "clause", "company", "person",
  "organisation", "project", "document", "amendment", "lot", "owner", "rule",
  "signal", "location"];

const ENTITY_KIND = { company: 1, person: 1, organisation: 1, project: 1 };

/* What a reader may type. Each row is [what to type, what it does] and every one of
   them is answered by the parser in search.js. */
const HELP = [
  ["lift maintenance", "both words, anywhere in a record"],
  ['"single largest contract"', "those words in that order, checked against the text"],
  ["rajuk OR cda", "either one"],
  ["lift -tender", "the first, without the second"],
  ["(lift OR escalator) rajuk", "grouped"],
  ["company:niaz", "a named field; the whole list of them is below"],
  ["tender:1001782", "everything the archive holds on one tender"],
  ["amount:10000000..50000000", "a number between two bounds"],
  ["closing:2024-01-01..2024-06-30", "a date between two bounds"],
  ["label:UNUSUAL", "the label the analysis gave a record"],
  ["kind:clause", "one kind of record only"],
  ["ra1uk", "a misreading: the box retries it against OCR-style confusions"],
];

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

  const foot = el("p", { class: "hitfoot" });
  for (const k of ["tender", "company", "person", "agency", "district", "label",
    "status", "finding", "rule"]) {
    if (!r.f || !r.f[k]) continue;
    const v = String(r.f[k]).split(";")[0];
    foot.append(el("a", { class: "tag",
      href: `#q=${encodeURIComponent(`${k}:${v}`)}` }, `${k}: ${v}`), " ");
  }
  if (r.r && r.r.file) foot.append(cite(r.r.file, r.r.page || null));
  else foot.append(el("span", { class: "note" },
    "worked out from the dataset, not printed on a page"));
  li.append(foot);
  return li;
}

function helpPanel(eng) {
  const scopes = [...eng.fields.entries()];
  const group = (kind) => scopes.filter(([, k]) => k === kind).map(([n]) => n).sort();
  return el("div", { class: "helpgrid" },
    el("table", { class: "grid" },
      el("caption", "Everything this box understands"),
      el("thead", el("tr", el("th", { scope: "col" }, "type this"),
        el("th", { scope: "col" }, "and it means"))),
      el("tbody", HELP.map(([a, b]) =>
        el("tr", el("td", el("code", a)), el("td", b))))),
    el("dl", { class: "fields" },
      el("dt", "named fields"),
      el("dd", group("scope").join(", ")),
      el("dt", "fields that take a number range"),
      el("dd", group("num").join(", ")),
      el("dt", "fields that take a date range"),
      el("dd", group("date").join(", ")),
      el("dt", "kinds of record"),
      el("dd", Object.entries(eng.kinds || {})
        .map(([k, n]) => `${k} (${num(n)})`).join(", "))));
}

/* The router hands queries in here. One panel exists per page, so one reference is
   enough, and a query arriving from a link behaves exactly like one typed by hand. */
let RUN = null;
export function runQuery(q) { if (RUN) return RUN(q); return null; }

export function searchPanel() {
  const input = el("input", { type: "search", class: "bigsearch", autocomplete: "off",
    placeholder: "A firm, a tender number, a phrase in quotes, company:niaz…",
    "aria-label": "search every word in the archive" });
  const kindSel = el("select", { "aria-label": "narrow to one kind of record" },
    el("option", { value: "" }, "every kind of record"));
  const status = el("p", { class: "note", role: "status", "aria-live": "polite" },
    "The index is fetched the first time you search, and not before.");
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
      status.textContent = "Type anything above. Everything this box understands is "
        + "listed under the box.";
      return;
    }
    if (running) return;
    running = true;
    status.textContent = built ? `Searching for ${q}` : "Fetching the index, once";
    let eng;
    try {
      eng = await engine();
    } catch (e) {
      running = false;
      status.textContent = "";
      clear(out);
      out.append(el("li", { class: "warn" }, `The index did not load: ${e.message}`));
      return;
    }
    if (!built) {
      built = true;
      docs = (eng.kinds || {}).document || 0;
      for (const k of [...Object.keys(eng.kinds || {})].sort((a, b) =>
        KIND_ORDER.indexOf(a) - KIND_ORDER.indexOf(b))) {
        kindSel.append(el("option", { value: k },
          `${k} · ${num(eng.kinds[k])} records`));
      }
      helpHost.append(disclosure("How to search this archive",
        () => helpPanel(eng)));
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
      ? `${num(res.total)} records match, showing ${num(shown)}`
      : "Nothing in the archive matches that.";
    for (const n of res.notes) notes.append(el("li", n));
    if (!res.total) {
      notes.append(el("li", "A word the archive does not print is not a finding about "
        + `the world. It means these ${num(docs)} documents do not use it.`));
    }

    /* the kinds the whole match set falls into, as a way to narrow it */
    const byKind = Object.entries(res.kinds || {})
      .sort((a, b) => KIND_ORDER.indexOf(a[0]) - KIND_ORDER.indexOf(b[0]));
    if (kindSel.value) {
      facets.append(el("button", { class: "linky", type: "button", onclick: () => {
        kindSel.value = ""; limit = 40; run(last);
      } }, `showing ${kindSel.value} records only — show every kind again`));
    } else if (byKind.length > 1) {
      facets.append(el("span", { class: "note" }, "narrow to: "));
      for (const [k, n] of byKind) {
        facets.append(el("button", { class: "linky", type: "button", onclick: () => {
          kindSel.value = k; limit = 40; run(last);
        } }, `${k} (${num(n)})`));
      }
    }
    for (const hit of res.results) out.append(hitNode(hit));

    if (res.total > shown) {
      actions.append(el("button", { class: "act", type: "button", onclick: () => {
        limit = shown + 40; run(last);
      } }, `Show the next ${num(Math.min(40, res.total - shown))}`));
    }
    if (shown) {
      actions.append(el("button", { class: "act ghost", type: "button", onclick: () =>
        downloadCsv("search_results.csv", [
          { key: "kind", label: "kind" }, { key: "name", label: "name" },
          { key: "line", label: "line beneath the name" },
          { key: "fields", label: "fields" },
          { key: "file", label: "source file" }, { key: "page", label: "page" },
        ], res.results.map((h) => flat(h.r))) },
      "Download these results (CSV)"));
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
      el("p", { class: "kicker" }, "Look for anything yourself"),
      el("h2", "Search every word the archive prints"),
      el("div", { class: "prose" },
        el("p", "This box reads an index built from the documents themselves: every "
          + "field the parser lifted, every clause of every condition of entry, every "
          + "name, and the text of every page. It runs entirely in your browser. "
          + "Nothing you type is sent anywhere, because there is nowhere for it to go "
          + "— the site has no server behind it."),
        el("p", "A word the documents do not use returns nothing, and says so. Where "
          + "an exact match fails, the box retries the word as a prefix, then against "
          + "the confusions a scanner makes, then within one or two letters, and it "
          + "tells you which of those it did. A near miss is never presented as a hit.")),
      el("div", { class: "searchbar" },
        el("label", { class: "field grow" },
          el("span", { class: "sr" }, "Search the archive"), input),
        el("label", { class: "field" },
          el("span", { class: "sr" }, "Narrow to one kind"), kindSel)),
      status, facets, notes, out, actions, helpHost));
}
