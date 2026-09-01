/* The table explorer and the downloads.

   Eighteen CSVs are the dataset. This section is the plainest possible thing: pick a
   table, read it, sort it, filter it, take it away. The file a reader downloads is the
   same file the site itself parsed — it is not regenerated for the download — so a
   number checked here is a number checked in the published data. */

import {
  el, num, clear, dataTable, chip, cite, PDF_BASE,
} from "../components/ui.js";
import { t, word } from "../i18n/i18n.js";
import {
  TABLES, tableAbout, table, tableHref, dataHref, siteHref, summary,
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
  const pick = el("select", { "aria-label": t("tab.pickAria") });
  const about = el("p", { class: "note" });
  const host = el("div");
  let counts = {};

  /* A column heading is the CSV's own header with the underscores taken out, unless the
     pack names it. csvcol.* is a namespace of its own rather than the col.* the figures
     use, because a figure's "Page" heading and a CSV's page column are not the same
     thing and must be free to read differently. The English pack names none of them:
     word() then prints the header as the file itself carries it. */
  const build = (name) => {
    const c = counts[`${name}.csv`];
    about.textContent = tableAbout(name)
      + (c ? t("tab.rowsCols", { rows: num(c.rows), cols: num(c.columns) }) : ".");
    clear(host);
    host.append(el("p", { class: "loading" }, t("tab.reading", { name })));
    table(name).then((parsed) => {
      clear(host);
      const [fileCol, pageCol] = sourcePair(parsed.columns);
      host.append(dataTable({
        columns: parsed.columns.map((k) => ({
          key: k,
          label: word(`csvcol.${k}`, k.replace(/_/g, " ")),
          num: parsed.rows.length > 0 && parsed.rows.some((r) => r[k] !== "")
            && parsed.rows.every((r) => r[k] === "" || !Number.isNaN(+r[k])),
          wrap: k === "text" || k.endsWith("_text") || k.includes("name")
            || k.includes("detail") || k.includes("reason"),
          cell: k === fileCol
            ? (r) => (r[k] ? cite(r[k], pageCol ? +r[pageCol] || null : null) : "")
            : (k === "label" || k === "type"
              ? (r) => (r[k] ? chip(r[k]) : "")
              : undefined),
        })),
        rows: parsed.rows, per: 25, filename: `${name}_filtered.csv`,
        caption: t("tab.caption", { name }),
      }));
    }).catch((e) => { clear(host); host.append(el("p", { class: "warn" }, e.message)); });
  };

  for (const name of TABLES) pick.append(el("option", { value: name }, `${name}.csv`));
  pick.addEventListener("change", () => build(pick.value));
  summary().then((s) => {
    counts = Object.fromEntries((s.counts.tables || []).map((r) => [r.table, r]));
    build(pick.value);
  }).catch(() => build(pick.value));

  return el("section", { class: "band", id: "tables" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, t("tab.kicker")),
      el("h2", t("tab.title")),
      el("div", { class: "prose" }, el("p", t("tab.p1"))),
      el("div", { class: "tablebar" },
        el("label", { class: "field" },
          el("span", { class: "sr" }, t("tab.chooseLabel")), pick),
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
  if (n >= 1048576) return t("down.mb", { n: num(Math.round(n / 104857.6) / 10) });
  if (n >= 1024) return t("down.kb", { n: num(Math.round(n / 1024)) });
  return t("down.bytes", { n: num(n) });
};

function sized(href, note) {
  const span = el("span", { class: "note" }, note || "");
  fetch(href, { method: "HEAD", cache: "no-store" }).then((r) => {
    if (!r.ok) {
      span.textContent = note
        ? t("down.missingWith", { note }) : t("down.missing");
      span.classList.add("warn");
      return;
    }
    const n = +r.headers.get("content-length");
    if (!n) return;
    span.textContent = note ? t("down.sizeWith", { size: bytes(n), note }) : bytes(n);
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

function group(key, items) {
  return el("div", { class: "downgroup" },
    el("h3", t(`down.${key}.title`)),
    el("p", { class: "note" }, t(`down.${key}.blurb`)),
    el("ul", { class: "files" }, ...items));
}

/* Every row below names a file and says what is in it. The filename is the file's own
   name and is never translated; the sentence beside it is. down.f.<slug> keeps the two
   apart, so a translated note can never be mistaken for the name to download. */
const note = (slug) => t(`down.f.${slug}`);

export function downloads() {
  const tables = el("ul", { class: "files" },
    ...TABLES.map((name) => fileRow(tableHref(name), `${name}.csv`, tableAbout(name))));

  /* The rows whose note is a count, rather than a description of the file. No count is
     written into this file: a rebuilt dataset would leave a written-down number quietly
     wrong, and a wrong number in the download section is worse than none at all. */
  const masterCsv = fileRow(dataHref("master_dataset.csv"), "master_dataset.csv",
    note("masterCsv"));
  const eligJson = fileRow(dataHref("eligibility_rows.json"), "eligibility_rows.json",
    note("eligRows"));

  /* Row and column counts come from dataset_summary.json, which the pipeline writes
     by counting the files it has just written. */
  summary().then((s) => {
    const by = Object.fromEntries((s.counts.tables || []).map((r) => [r.table, r]));
    [...tables.children].forEach((li, i) => {
      const c = by[`${TABLES[i]}.csv`];
      if (!c) return;
      li.append(el("span", { class: "note" },
        t("down.shape", { rows: num(c.rows), cols: num(c.columns) })));
    });
    const m = by["master_dataset.csv"];
    if (m) {
      masterCsv.append(el("span", { class: "note" },
        t("down.shape", { rows: num(m.rows), cols: num(m.columns) })));
    }
    const e = by["eligibility_criteria.csv"];
    if (e) eligJson.append(el("span", { class: "note" }, t("down.rows", { rows: num(e.rows) })));
  }).catch(() => {});

  const groups = el("div", { class: "downloads" },
    el("div", { class: "downgroup" },
      el("h3", t("down.tables.title")),
      el("p", { class: "note" }, t("down.tables.blurb")),
      tables),
    group("master", [
      masterCsv,
      fileRow(dataHref("master_dataset.json"), "master_dataset.json", note("masterJson")),
    ]),
    group("analysis", [
      fileRow(dataHref("analysis.json"), "analysis.json", note("analysis")),
      fileRow(dataHref("story.json"), "story.json", note("story")),
      eligJson,
      fileRow(dataHref("signals_rows.json"), "signals_rows.json", note("signalRows")),
      fileRow(dataHref("dataset_summary.json"), "dataset_summary.json", note("summary")),
      fileRow(dataHref("audit_report.json"), "audit_report.json", note("audit")),
    ]),
    group("evidence", [
      fileRow(`${PDF_BASE}EVIDENCE_MATRIX.csv`, "EVIDENCE_MATRIX.csv", note("matrix")),
      fileRow(`${PDF_BASE}EDITOR_QA_REPORT.md`, "EDITOR_QA_REPORT.md", note("qa")),
      fileRow(siteHref("evidence/evidence_index.json"), "evidence_index.json",
        note("evidenceIndex")),
    ]),
    group("extraction", [
      fileRow(dataHref("inventory.json"), "inventory.json", note("inventory")),
      fileRow(dataHref("extracted.json"), "extracted.json", note("extracted")),
      fileRow(dataHref("raw_pages.json"), "raw_pages.json", note("rawPages")),
    ]),
    group("docs", [
      fileRow(siteHref("documentation/data_dictionary.md"), "data_dictionary.md",
        note("dictionary")),
      fileRow(siteHref("documentation/search_reference.md"), "search_reference.md",
        note("searchRef")),
      fileRow(siteHref("documentation/pipeline.md"), "pipeline.md", note("pipeline")),
    ]),
    group("index", [
      fileRow(siteHref("search/records.json"), "records.json", note("records")),
      fileRow(siteHref("search/postings.json"), "postings.json", note("postings")),
      fileRow(siteHref("search/text.json"), "text.json", note("text")),
    ]));

  /* The count of PDFs is asked of dataset_summary.json for the same reason the file
     sizes are asked of the server: a number written into this file would survive a
     rebuilt dataset and be quietly wrong. Until it arrives the sentence reads without
     a count rather than with a wrong one. */
  const howMany = el("span", t("down.themBare"));
  summary().then((s) => {
    if (s.counts.documents) {
      howMany.textContent = t("down.themCounted", { n: num(s.counts.documents) });
    }
  }).catch(() => {});

  return el("section", { class: "band alt", id: "downloads" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, t("down.kicker")),
      el("h2", t("down.title")),
      el("div", { class: "prose" },
        el("p", t("down.p1")),
        el("p", t("down.p2a"), howMany, t("down.p2b"))),
      groups));
}
