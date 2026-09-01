/* The table explorer and the downloads.

   Eighteen CSVs are the dataset. This section is the plainest possible thing: pick a
   table, read it, sort it, filter it, take it away. The file a reader downloads is the
   same file the site itself parsed — it is not regenerated for the download — so a
   number checked here is a number checked in the published data. */

import {
  el, num, clear, dataTable, chip, cite, PDF_BASE,
} from "../components/ui.js";
import {
  TABLES, table, tableHref, dataHref, summary,
} from "./data.js";

/* Which columns carry a file name and a page, per table, so the explorer can turn
   them into a link to the page instead of printing a path. Read off the CSV headers. */
const SOURCE_COLUMNS = [
  ["source_file", "page"],
  ["evidence_file", "evidence_page"],
  ["first_source_file", "first_page"],
  ["file", null],
  ["first_document", "first_page"],
];

function sourcePair(columns) {
  for (const [f, p] of SOURCE_COLUMNS) {
    if (columns.includes(f)) return [f, p && columns.includes(p) ? p : null];
  }
  return [null, null];
}

export function tableExplorer() {
  const pick = el("select", { "aria-label": "which table to open" });
  const about = el("p", { class: "note" });
  const host = el("div");
  let counts = {};

  const build = (name) => {
    const meta = TABLES.find((t) => t[0] === name);
    const c = counts[`${name}.csv`];
    about.textContent = `${meta ? meta[1] : name}`
      + (c ? ` — ${num(c.rows)} rows, ${num(c.columns)} columns.` : ".");
    clear(host);
    host.append(el("p", { class: "loading" }, `Reading ${name}.csv`));
    table(name).then((t) => {
      clear(host);
      const [fileCol, pageCol] = sourcePair(t.columns);
      host.append(dataTable({
        columns: t.columns.map((k) => ({
          key: k,
          label: k.replace(/_/g, " "),
          num: t.rows.length > 0 && t.rows.some((r) => r[k] !== "")
            && t.rows.every((r) => r[k] === "" || !Number.isNaN(+r[k])),
          wrap: k === "text" || k.endsWith("_text") || k.includes("name")
            || k.includes("detail") || k.includes("reason"),
          cell: k === fileCol
            ? (r) => (r[k] ? cite(r[k], pageCol ? +r[pageCol] || null : null) : "")
            : (k === "label" || k === "type"
              ? (r) => (r[k] ? chip(r[k]) : "")
              : undefined),
        })),
        rows: t.rows, per: 25, filename: `${name}_filtered.csv`,
        caption: `${name}.csv, exactly as the pipeline wrote it. Filtering and sorting `
          + "happen in your browser; the download button hands back the rows you can see.",
      }));
    }).catch((e) => { clear(host); host.append(el("p", { class: "warn" }, e.message)); });
  };

  for (const [name] of TABLES) pick.append(el("option", { value: name }, `${name}.csv`));
  pick.addEventListener("change", () => build(pick.value));
  summary().then((s) => {
    counts = Object.fromEntries((s.counts.tables || []).map((t) => [t.table, t]));
    build(pick.value);
  }).catch(() => build(pick.value));

  return el("section", { class: "band", id: "tables" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, "The dataset itself"),
      el("h2", "Every table, open to read"),
      el("div", { class: "prose" },
        el("p", "These eighteen files are the whole dataset this investigation was "
          + "written from. Nothing on this site is calculated from anything that is not "
          + "in them, and every one of them was written by the parser out of the PDFs. "
          + "Columns that name a document open that document at the page in question.")),
      el("div", { class: "tablebar" },
        el("label", { class: "field" }, el("span", { class: "sr" }, "Choose a table"), pick),
        about),
      host));
}

/* ---- the downloads ----

   One rule governs this section: a reader downloads the same bytes the site read.
   Nothing here is regenerated, re-serialised or trimmed for the download, so a figure
   checked in a spreadsheet is the figure the article was written from.

   File sizes are asked of the server with a HEAD request rather than written into this
   file, because a rebuilt dataset would leave a written-down size quietly wrong. */

const bytes = (n) => {
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} bytes`;
};

function sized(href, note) {
  const span = el("span", { class: "note" }, note || "");
  fetch(href, { method: "HEAD", cache: "no-store" }).then((r) => {
    if (!r.ok) {
      span.textContent = note ? `${note} — not on this server` : "not on this server";
      span.classList.add("warn");
      return;
    }
    const n = +r.headers.get("content-length");
    if (!n) return;
    span.textContent = note ? `${bytes(n)} — ${note}` : bytes(n);
  }).catch(() => {});
  return span;
}

/* download= names the saved file; without it a browser may navigate to the JSON
   instead of saving it, which on a 5 MB file is a wasted click. */
function fileRow(href, name, note) {
  return el("li", { class: "filerow" },
    el("a", { href, download: name, class: "file" }, name),
    sized(href, note));
}

function group(title, blurb, items) {
  return el("div", { class: "downgroup" },
    el("h3", title),
    el("p", { class: "note" }, blurb),
    el("ul", { class: "files" }, ...items));
}
export function downloads() {
  const tables = el("ul", { class: "files" },
    ...TABLES.map(([name, about]) =>
      fileRow(tableHref(name), `${name}.csv`, about)));

  /* The three rows whose note is a count, rather than a description of the file. No
     count is written into this file: a rebuilt dataset would leave a written-down
     number quietly wrong, and a wrong number in the download section is worse than
     none at all. */
  const masterCsv = fileRow(dataHref("master_dataset.csv"), "master_dataset.csv",
    "one row per procurement, notice joined to award");
  const eligJson = fileRow(dataHref("eligibility_rows.json"), "eligibility_rows.json",
    "every condition of entry, with the text it is printed in");

  /* Row and column counts come from dataset_summary.json, which the pipeline writes
     by counting the files it has just written. */
  summary().then((s) => {
    const by = Object.fromEntries((s.counts.tables || []).map((t) => [t.table, t]));
    [...tables.children].forEach((li, i) => {
      const c = by[`${TABLES[i][0]}.csv`];
      if (!c) return;
      li.append(el("span", { class: "note" },
        `${num(c.rows)} rows × ${num(c.columns)} columns`));
    });
    const m = by["master_dataset.csv"];
    if (m) {
      masterCsv.append(el("span", { class: "note" },
        `${num(m.rows)} rows × ${num(m.columns)} columns`));
    }
    const e = by["eligibility_criteria.csv"];
    if (e) eligJson.append(el("span", { class: "note" }, `${num(e.rows)} rows`));
  }).catch(() => {});

  const groups = el("div", { class: "downloads" },
    el("div", { class: "downgroup" },
      el("h3", "The eighteen tables"),
      el("p", { class: "note" }, "One row per thing counted. These are the files the "
        + "explorer above reads."),
      tables),
    group("The whole archive in one row per tender",
      "Every notice joined to its award, its lots, its bid count and its eligibility "
      + "clauses, so one row is one procurement from start to finish.", [
        masterCsv,
        fileRow(dataHref("master_dataset.json"), "master_dataset.json",
          "the same rows, nested rather than flattened"),
      ]),
    group("What the analysis worked out",
      "Every number on this site is in one of these files. story.json is what the "
      + "article loads; analysis.json is the same thing with the two long row lists "
      + "left in place.", [
        fileRow(dataHref("analysis.json"), "analysis.json",
          "every finding and every aggregate, complete"),
        fileRow(dataHref("story.json"), "story.json",
          "analysis.json without the two long lists"),
        eligJson,
        fileRow(dataHref("signals_rows.json"), "signals_rows.json",
          "the per-tender ledger, one row per tender"),
        fileRow(dataHref("dataset_summary.json"), "dataset_summary.json",
          "what was written, counted after writing it"),
        fileRow(dataHref("audit_report.json"), "audit_report.json",
          "the pipeline checking its own work"),
      ]),
    group("The evidence trail",
      "The matrix is the editor's file: one row per finding, with the page it rests on "
      + "and the arithmetic that produced it.", [
        fileRow(`${PDF_BASE}EVIDENCE_MATRIX.csv`, "EVIDENCE_MATRIX.csv",
          "finding, type, source PDF, page, quoted evidence, calculation, confidence"),
        fileRow(`${PDF_BASE}EDITOR_QA_REPORT.md`, "EDITOR_QA_REPORT.md",
          "what was checked, what failed, what remains open"),
        fileRow("../evidence/evidence_index.json", "evidence_index.json",
          "every citation on this site, keyed file#page"),
      ]),
    group("The extraction, before any analysis touched it",
      "If you want to start where this investigation started, start here: what was "
      + "found in the folder, and what was read off each page.", [
        fileRow(dataHref("inventory.json"), "inventory.json",
          "every PDF found, with its hash, size and page count"),
        fileRow(dataHref("extracted.json"), "extracted.json",
          "every field read out of every document, each with its page"),
        fileRow(dataHref("raw_pages.json"), "raw_pages.json",
          "the text layer of every page, as extracted"),
      ]),
    group("How to read all of it",
      "What every column of every table holds, what the search box accepts, and how the "
      + "whole thing is rebuilt. The first two are written out of the built dataset "
      + "itself, so they cannot drift from the files above.", [
        fileRow("../documentation/data_dictionary.md", "data_dictionary.md",
          "every column of all eighteen tables: kind, how often filled, an example"),
        fileRow("../documentation/search_reference.md", "search_reference.md",
          "the query grammar, the scopes, the numeric and date fields"),
        fileRow("../documentation/pipeline.md", "pipeline.md",
          "what each stage reads and writes, and what to re-run after a change"),
      ]),
    group("The search index",
      "The search box on this site is these three files and search.js. Nothing is "
      + "queried over the network.", [
        fileRow("../search/records.json", "records.json",
          "one record per searchable thing, repeated values interned"),
        fileRow("../search/postings.json", "postings.json",
          "token to record lists, delta encoded"),
        fileRow("../search/text.json", "text.json",
          "the snippet each result shows"),
      ]));

  /* The count of PDFs is asked of dataset_summary.json for the same reason the file
     sizes are asked of the server: a number written into this file would survive a
     rebuilt dataset and be quietly wrong. */
  const howMany = el("span", "they");
  summary().then((s) => {
    if (s.counts.documents) howMany.textContent = `there are ${num(s.counts.documents)} of them and they`;
  }).catch(() => {});

  return el("section", { class: "band alt", id: "downloads" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, "Take it away"),
      el("h2", "Every file this investigation was built from"),
      el("div", { class: "prose" },
        el("p", "These are not exports. They are the files the site itself fetched "
          + "while you read it, handed over unchanged, so anything checked in a "
          + "spreadsheet is checked against what the article was written from."),
        el("p", "The PDFs are not listed here, because ", howMany,
          " sit in the same folder as this site. Every citation, every row in "
          + "the document browser and every document column in the tables above "
          + "opens the PDF itself at the page in question. The page-by-page text of "
          + "each one is in investigation/public/pages/, one small file per document.")),
      groups));
}
