/* Everything the site reads, and the one place it is read.

   The page loads with the story's own file only. The search index, the evidence
   index and the eighteen tables are fetched the first time a reader asks for
   something that needs them, and kept after that. A reader who only reads the
   article never downloads the nine megabytes behind the search box. */

import { t } from "../i18n/i18n.js";

/* Every file below is addressed relative to this module rather than to the page that
   loaded it, so the entry document can sit at the repository root and the paths still
   resolve. import.meta.url is this file's own URL; "../" from investigation/app/ is
   investigation/. Nothing here depends on where index.html lives. */
const BASE = new URL("../", import.meta.url).href;
const cache = new Map();
const inflight = new Map();

function once(key, make) {
  if (cache.has(key)) return Promise.resolve(cache.get(key));
  if (inflight.has(key)) return inflight.get(key);
  const p = make().then((v) => { cache.set(key, v); inflight.delete(key); return v; });
  inflight.set(key, p);
  return p;
}

/* A failed fetch is the one message from this module a reader ever sees, so it is a
   sentence from the pack. The path inside it is not: it is the file that is missing. */
async function json(path) {
  const r = await fetch(BASE + path, { cache: "force-cache" });
  if (!r.ok) throw new Error(t("err.file", { path, status: r.status }));
  return r.json();
}

/* The story's own file is analysis.json with its two long row lists lifted out, so
   opening the article costs 160 KB rather than 2.6 MB. The lists come back when a
   reader opens the section that pages through them. investigation/scripts/
   split_payload.py does the lifting and records it inside story.json. */
export const analysis = () => once("analysis", () => json("data/story.json"));
export const eligibilityRows = () => once("elig", () =>
  json("data/eligibility_rows.json").then((d) => d.rows));
export const signalRows = () => once("signals", () =>
  json("data/signals_rows.json").then((d) => d.rows));
export const evidence = () => once("evidence", () => json("evidence/evidence_index.json"));
export const postings = () => once("postings", () => json("search/postings.json"));
export const texts = () => once("texts", () =>
  json("search/text.json").then((d) => d.text));
export const summary = () => once("summary", () => json("data/dataset_summary.json"));
export const audit = () => once("audit", () => json("data/audit_report.json"));

/* records.json interns its repeated values into a strings list to keep the file
   small enough to fetch on a phone. Unpacking is done once, here, so no caller has
   to know about it. */
export const records = () => once("records", async () => {
  const d = await json("search/records.json");
  const s = d.strings;
  for (const r of d.records) {
    const f = {};
    for (const [k, v] of Object.entries(r.f)) f[k] = s[v];
    r.f = f;
    if (r.r && r.r.file !== undefined) r.r = { file: s[r.r.file], page: r.r.page };
  }
  d.byId = new Map(d.records.map((r) => [r.i, r]));
  return d;
});

/* One document's pages, as extracted. 1,805 small files rather than one large one:
   a reader opens one document at a time. */
export const pageShard = (documentId) =>
  once(`page:${documentId}`, () => json(`public/pages/${encodeURIComponent(documentId)}.json`));

/* ---- the tables ----
   The eighteen CSVs the parser writes are the dataset. They are parsed here rather
   than converted to JSON at build time so that the file a reader downloads from the
   downloads section is byte for byte the file the site itself read.

   The names are the filenames the parser wrote and are never translated — a reader
   who downloads companies.csv and a reader who opens it here are looking at the same
   file. What each one holds is a sentence, so it lives in the language pack under
   tbl.<name> and is fetched with tableAbout(). */
export const TABLES = [
  "documents", "tenders", "lots", "contracts", "bids", "eligibility_criteria",
  "amendments", "amendment_changes", "companies", "people", "organizations",
  "projects", "beneficial_owners", "locations", "relationships", "timeline",
  "normalization", "name_candidate_pairs",
];
export const tableAbout = (name) => t(`tbl.${name}`);

/* RFC 4180: quoted fields may hold commas, quotes and newlines, and several of
   these columns do. A split on commas would quietly corrupt the clause text. */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false, i = 0;
  if (text.charCodeAt(0) === 0xfeff) i = 1;
  for (; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const head = rows.shift() || [];
  return {
    columns: head,
    rows: rows.map((r) => {
      const o = {};
      head.forEach((h, j) => { o[h] = r[j] ?? ""; });
      return o;
    }),
  };
}

export const table = (name) => once(`table:${name}`, async () => {
  const r = await fetch(`${BASE}data/tables/${name}.csv`, { cache: "force-cache" });
  if (!r.ok) throw new Error(t("err.file", { path: `${name}.csv`, status: r.status }));
  return parseCsv(await r.text());
});

export const tableHref = (name) => `${BASE}data/tables/${name}.csv`;
export const dataHref = (file) => `${BASE}data/${file}`;
/* Anything else inside investigation/ — the search index, the evidence index, the
   generated documentation. Same reason as BASE: the caller must not have to know how
   deep the page that loaded it happens to sit. */
export const siteHref = (path) => `${BASE}${path}`;
