/* The article.

   Every sentence here is built out of investigation/data/story.json, which
   04_analysis.py wrote from the CSVs, which 03_dataset.py wrote from the 1,805 PDFs.
   No number below is typed in by hand: if a figure changes upstream, the sentence
   changes with it, and if the pipeline cannot establish something the sentence says
   so rather than filling the gap.

   This module holds the structure and none of the prose. Each paragraph names a key
   and hands over the values its sentence needs; investigation/i18n/en.js and
   investigation/i18n/bn.js write the sentence. That is what makes the two editions
   impossible to drift apart in shape — there is only one shape — and it is why a
   paragraph below reads as a key and a bag of numbers rather than as English.

   Each chapter carries its own findings and its own figures. There is no gallery of
   charts at the end, because a chart away from the paragraph it belongs to is
   decoration; three of the findings are better served by a table of the source
   pages than by any chart, and those are tables. */

import {
  el, num, pct, taka, exact, decimal, cite, quote, tiles, disclosure, figure, legend,
  dataTable, chip, clear,
} from "../components/ui.js";
import {
  barsH, barsV, funnel, dumbbell, bandStrip, SEQ, CAT, step,
} from "../charts/charts.js";
import { findingCard } from "../evidence/evidence.js";
import { analysis, evidence, audit, eligibilityRows, signalRows } from "./data.js";
import { t, word, dataText } from "../i18n/i18n.js";
import { tableHref, dataHref, siteHref } from "./data.js";
import { PDF_BASE } from "../components/ui.js";

/* ---- the shapes a chapter is made of ---- */

function band(id, kicker, title, ...kids) {
  return el("section", { class: "band", id },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, kicker),
      el("h2", title),
      kids));
}

const prose = (...paras) => el("div", { class: "prose" },
  paras.map((p) => (typeof p === "string" ? el("p", { html: p }) : p)));

/* Every figure on this site has the same numbers underneath it as a table that can
   be read, sorted and downloaded. The chart is the quick read; the table is the
   check. */
function plot(opts) {
  const f = figure(opts);
  if (opts.table) {
    f.append(disclosure(t("fig.asTable"), () => dataTable(opts.table)));
  }
  return f;
}

const findingsFor = (a, index, ids) => el("div", { class: "findings" },
  ids.map((id) => {
    const f = a.findings.find((x) => x.id === id);
    return f ? findingCard(f, index) : null;
  }));

/* The reporter's name is not translated, for the same reason no other name on this site
   is: it is a name. Everything around it is. It is written once and read by both the
   masthead's byline and the footer. */
export const BYLINE = "AL AMIN TUSHER";

/* ---- the top of the story ----
   Each headline figure links to the chapter that explains it. A number without a way
   into the reasoning behind it is a number a reader has to take on trust, which is the
   one thing this site is built not to ask for. */
function hero(a) {
  const c = a.dataset_counts;
  return el("header", { class: "hero", id: "top" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, t("hero.kicker")),
      el("h1", t("hero.title")),
      el("p", { class: "standfirst" }, t("hero.standfirst", {
        documents: num(c.documents),
        tenders: num(c.tenders),
        awards: num(c.bid_rows_with_counts),
        money: taka(c.contract_value_total_taka),
      })),
      el("p", { class: "byline" },
        el("span", { class: "who" }, t("hero.by", { name: BYLINE })),
        el("span", { class: "sep" }, "·"),
        el("span", t("hero.sourced")),
        el("span", { class: "sep" }, "·"),
        el("span", t("hero.built", { date: String(c.generated).slice(0, 10) })),
        el("span", { class: "sep" }, "·"),
        el("span", { class: "mono" }, t("hero.links", {
          links: num(c.relationships), events: num(c.timeline_events) }))),
      tiles([
        { value: num(c.documents), label: t("hero.tile.docs"), href: "#documents" },
        { value: num(c.tenders), label: t("hero.tile.tenders"), href: "#outcomes" },
        { value: num(c.eligibility_criteria), label: t("hero.tile.criteria"),
          href: "#eligibility" },
        { value: taka(c.contract_value_total_taka), label: t("hero.tile.money"),
          title: exact(c.contract_value_total_taka), href: "#money" },
        { value: num(a.money.companies), label: t("hero.tile.firms"), href: "#money" },
        { value: num(a.funnel.one_responsive), label: t("hero.tile.oneResponsive"),
          href: "#funnel" },
      ])));
}

/* ---- what the whole thing found, before any of the detail ---- */
function summary(a) {
  const f = a.funnel, s = f.stages, e = a.eligibility.tally;
  const withSignal = Object.entries(a.signals.distribution)
    .filter(([k]) => +k > 0).reduce((total, [, v]) => total + v, 0);
  const strong = (e["HIGHLY SPECIFIC"] || 0) + (e["RESTRICTIVE-LOOKING PATTERN"] || 0);
  return band("summary", t("sum.kicker"), t("sum.title"),
    prose(
      t("sum.p1", { notices: num(a.amendments.notices),
        contracts: num(a.dataset_counts.contracts) }),
      t("sum.p2", { criteria: num(a.dataset_counts.eligibility_criteria),
        common: num(e.COMMON), unusual: num(e.UNUSUAL), strong: num(strong),
        undetermined: num(e.UNDETERMINED) }),
      t("sum.p3", { sold: num(s.documents_sold), received: num(s.bids_received),
        responsive: num(s.bids_responsive), signed: num(s.contracts_signed),
        aside: num(s.bids_received - s.bids_responsive) }),
      t("sum.p4", { oneResponsive: num(f.one_responsive),
        oneBid: num(f.one_bid_received) }),
      t("sum.p5", { withSignal: num(withSignal), rows: num(a.signals.rows_count),
        kinds: num(a.signals.definitions.length),
        four: num(a.signals.distribution["4"] || 0) })),
    el("p", { class: "note prose" }, t("sum.note")));
}

/* ---- the reader's instructions, and an honest map of the gaps ----
   The chain is the spine of the investigation. Printing which links the archive
   actually holds is the single most useful thing this page can tell an editor.

   The second element of each row is a token, not a label: the stylesheet colours the
   left edge of each step by matching on it, so it stays in English in both editions
   and the words a reader sees come out of the pack. */
const CHAIN = [
  ["rules", "in the archive, with a caveat"],
  ["entry", "in the archive"],
  ["entered", "counts only"],
  ["responsive", "counts only"],
  ["rejected", "not in the archive"],
  ["evaluated", "not in the archive"],
  ["won", "in the archive"],
  ["money", "in the archive"],
  ["connect", "partly in the archive"],
];

const STATE_KEY = {
  "in the archive": "here",
  "in the archive, with a caveat": "caveat",
  "counts only": "counts",
  "partly in the archive": "partly",
  "not in the archive": "absent",
};

function howToRead(a) {
  const c = a.dataset_counts;
  const vars = {
    refs: num(a.rules.reference_documents.length),
    quoted: num(a.rules.quoted.length),
    criteria: num(c.eligibility_criteria),
    deferred: num(c.eligibility_criteria_deferred),
    awards: num(a.funnel.notices_with_counts),
    bidderDocs: num(c.bidder_level_records_in_archive),
    contracts: num(c.contracts),
    money: taka(c.contract_value_total_taka),
    noValue: num(c.contracts_without_a_printed_value),
    withOwner: num(a.connections.firms_declaring_an_owner),
    firms: num(a.connections.firms),
    addresses: num(a.connections.addresses_shared),
  };
  return band("how-to-read", t("htr.kicker"), t("htr.title"),
    prose(t("htr.labelsIntro")),
    el("ul", { class: "prose labels" }, Object.entries(a.label_kinds).map(([k, v]) =>
      el("li", chip(k), " ", el("span", word(`labelMeaning.${k}`, v))))),
    prose(t("htr.eligIntro")),
    el("ul", { class: "prose labels" }, Object.entries(a.eligibility.label_meaning)
      .map(([k, v]) => el("li", chip(k), " ",
        el("span", word(`eligMeaning.${k}`, v))))),
    prose(t("htr.chainIntro")),
    el("ol", { class: "chainmap" }, CHAIN.map(([key, state]) =>
      el("li", { "data-state": state },
        el("h4", t(`htr.step.${key}`),
          el("span", { class: "state" }, t(`htr.state.${STATE_KEY[state]}`))),
        el("p", t(`htr.detail.${key}`, vars))))),
    prose(t("htr.outro")),
    /* The last thing the reader's instructions say, because it is the first thing a
       reader of either edition needs in order to trust what follows: a string that came
       off a page is copied, not rewritten. In Bangla that is also the explanation for
       why so much of the page below is in the other script. */
    el("p", { class: "note prose", html: t("bn.note.words") }));
}

/* ---- chapter one: the rules ----
   No chart. Fourteen rules and the page each is printed on is a table of links, and a
   chart of fourteen quotations would be a chart of nothing. The quoted wording itself
   is never translated — it is what the page says. */
function rules(a, index) {
  const r = a.rules;
  const min = r.minimum_tenderer_phrases;
  const figTitle = t("ch1.fig.title");
  return band("rules", t("ch1.kicker"), t("ch1.title"),
    prose(
      t("ch1.p1", { refs: num(r.reference_documents.length),
        pages: num(r.reference_pages) }),
      t("ch1.p2", { quoted: num(r.quoted.length) })),
    plot({
      id: "fig-rules",
      title: figTitle,
      note: t("ch1.fig.note"),
      build: (p) => p.append(dataTable({
        columns: [
          { key: "id", label: t("ch1.col.rule") },
          { key: "reads_on", label: t("ch1.col.decides"), wrap: true,
            cell: (row) => word(`readsOn.${row.reads_on}`, row.reads_on) },
          { key: "page", label: t("col.page"), num: true },
          { key: "file", label: t("col.printedIn"),
            cell: (row) => cite(row.file, row.page) },
        ],
        rows: r.quoted, sort: "id", dir: "asc", per: 14, filter: false,
        filename: "rules_quoted.csv", label: figTitle,
      })),
    }),
    disclosure(t("ch1.readAll"), () =>
      el("div", { class: "prose" }, r.quoted.map((q) => el("div", { class: "rulequote" },
        el("h4", q.id, el("span", { class: "note" },
          word(`readsOn.${q.reads_on}`, q.reads_on))),
        quote(q.text, q.file, q.page))))),
    prose(
      t("ch1.p3"),
      min.length ? t("ch1.minFound") : t("ch1.minAbsent")),
    min.length ? el("div", { class: "prose" },
      min.map((m) => quote(m.text, m.file, m.page))) : null,
    findingsFor(a, index, ["F-RULES-01", "F-RULES-02", "F-RULES-03"]));
}

/* A source line that names a file. The pack writes the whole sentence and marks with
   {file} where the filename belongs, so Bengali can put it where Bengali puts it; the
   filename itself is dropped in unchanged, in the monospaced face, because it is a
   filename in this repository and not a word in either language. */
function sourceLine(key, file, vars) {
  const parts = String(t(key, { ...(vars || {}), file: "\u0000" })).split("\u0000");
  return el("span", parts[0], el("span", { class: "mono" }, file), parts[1] || "");
}

/* ---- chapter two: the clock ---- */
function clock(a, index) {
  const k = a.clock, o = k.open_days;
  const [vlo, vhi] = k.validity_band;
  const vb = { vlo: num(vlo), vhi: num(vhi) };
  const vrows = Object.entries(k.validity_days).map(([days, n]) => ({
    label: days, value: n, tick: true,
    color: +days > vhi || +days < vlo ? CAT[1] : SEQ[4],
    note: +days > vhi ? t("ch2.note.above", vb) : t("ch2.note.inside", vb),
  }));
  const nature = Object.entries(k.by_nature)
    .sort((x, y) => y[1].tenders - x[1].tenders)
    .map(([name, v]) => ({ label: name, value: v.median_days,
      note: t("ch2.natureNote", { n: num(v.tenders) }), color: SEQ[4] }));
  const cleared = Object.values(k.security_margin_days).reduce((s, v) => s + v, 0);
  return band("clock", t("ch2.kicker"), t("ch2.title"),
    prose(
      t("ch2.p1"),
      t("ch2.p2", { median: num(o.median), n: num(o.n), q1: num(o.q1), q3: num(o.q3),
        min: num(o.min), max: num(o.max) }),
      t("ch2.p3", { cleared: num(cleared), short: num(k.security_short_of_minimum) })),
    plot({
      id: "fig-open-days",
      title: t("ch2.fig1.title"),
      note: t("ch2.fig1.note"),
      source: sourceLine("ch2.fig1.source", "timeline.csv"),
      build: (p) => barsH(p, { rows: nature, labelWidth: 230,
        valueLabel: t("ch2.axis.medianDays"), fmt: (v) => t("ch2.days", { n: num(v) }) }),
      table: { columns: [{ key: "label", label: t("ch2.col.nature") },
        { key: "value", label: t("ch2.col.medianOpen"), num: true },
        { key: "note", label: t("col.tenders") }], rows: nature, per: 5, filter: false,
      filename: "open_days_by_nature.csv" },
    }),
    plot({
      id: "fig-validity",
      title: t("ch2.fig2.title"),
      note: t("ch2.fig2.note", { ...vb, above: num(k.validity_above_band) }),
      legend: legend([{ color: SEQ[4], label: t("ch2.legend.inside", vb) },
        { color: CAT[1], label: t("ch2.legend.above") }]),
      build: (p) => barsV(p, { rows: vrows, height: 250, valueLabel: t("axis.notices"),
        labelPrefix: t("ch2.fig2.prefix"), axisLabel: t("ch2.fig2.axis") }),
      table: { columns: [{ key: "label", label: t("ch2.col.validityDays"), num: true },
        { key: "value", label: t("col.notices"), num: true },
        { key: "note", label: t("ch2.col.againstBand"), wrap: true }],
      rows: vrows, sort: "label", dir: "asc", per: 10, filter: false,
      filename: "validity_days.csv" },
    }),
    findingsFor(a, index, ["F-TIME-01", "F-TIME-02", "F-TIME-03", "F-TIME-04"]));
}

/* ---- chapter three: the amendments ----
   The field names in the change tables are the portal's own form labels — "Completion
   Date(Lot No : 1)", "TDS/PDS--C. Qualification Criteria--" — and they stay exactly as
   the portal printed them, in both editions, because an editor checking a row has to
   find the same label on the page. */
function amendments(a, index) {
  const m = a.amendments;
  const dates = m.dates.map((d) => ({ label: d.field, from: d.median_days,
    to: d.longest_days, note: t("ch3.dateNote", { n: num(d.changes) }) }));
  const fields = m.fields.slice()
    .sort((x, y) => y.listed - x.listed || y.value_changed - x.value_changed);
  const top = fields.slice(0, 12).map((f) => ({ label: f.field, from: f.value_changed,
    to: f.listed, note: f.listed === f.value_changed ? t("ch3.allReal")
      : t("ch3.someUnmoved", { n: num(f.listed - f.value_changed) }) }));
  const pairs = Object.entries(m.clause_pairs)
    .map(([k, v]) => t("ch3.pair", { n: num(v), kind: word(`clausePair.${k}`, k) }))
    .join(t("list.sep"));
  return band("amendments", t("ch3.kicker"), t("ch3.title"),
    prose(
      t("ch3.p1", { amended: num(m.notices_amended), notices: num(m.notices),
        withTable: num(m.with_a_change_table), lines: num(m.changes_listed),
        unmoved: num(m.rows_with_no_change_in_value) }),
      t("ch3.p2", { changes: num(m.date_changes), earlier: num(m.moved_earlier),
        tenders: num(m.tenders_whose_closing_date_moved),
        gained: num(m.net_days_added_median),
        first: num(m.window_as_first_published),
        after: num(m.window_after_amendment),
        grounds: m.grounds_printed.length === 0 ? t("ch3.noGrounds")
          : t("ch3.someGrounds", { n: num(m.grounds_printed.length),
            amended: num(m.notices_amended) }) })),
    plot({
      id: "fig-amend-dates",
      title: t("ch3.fig1.title"),
      note: t("ch3.fig1.note"),
      legend: legend([{ color: CAT[0], label: t("ch3.legend.median") },
        { color: CAT[1], label: t("ch3.legend.longest") }]),
      build: (p) => dumbbell(p, { rows: dates, labelWidth: 300,
        fromLabel: t("ch3.axis.medianMove"), toLabel: t("ch3.axis.longestMove") }),
      table: { columns: [{ key: "field", label: t("ch3.col.date") },
        { key: "changes", label: t("ch3.col.changes"), num: true },
        { key: "moved_later", label: t("ch3.col.later"), num: true },
        { key: "moved_earlier", label: t("ch3.col.earlier"), num: true },
        { key: "median_days", label: t("ch3.col.medianDays"), num: true },
        { key: "longest_days", label: t("ch3.col.longest"), num: true }],
      rows: m.dates, per: 6, filter: false, filename: "amendment_dates.csv" },
    }),
    plot({
      id: "fig-amend-fields",
      title: t("ch3.fig2.title"),
      note: t("ch3.fig2.note", { fields: num(m.fields.length) }),
      legend: legend([{ color: CAT[0], label: t("ch3.legend.reallyChanged") },
        { color: CAT[1], label: t("ch3.legend.listed") }]),
      build: (p) => dumbbell(p, { rows: top, labelWidth: 300,
        fromLabel: t("ch3.axis.reallyChanged"), toLabel: t("ch3.axis.timesListed") }),
      table: { columns: [{ key: "field", label: t("ch3.col.field") },
        { key: "listed", label: t("ch3.col.timesListed"), num: true },
        { key: "value_changed", label: t("ch3.col.reallyChanged"), num: true }],
      rows: fields, sort: "listed", per: 26, filename: "amendment_fields.csv" },
    }),
    prose(t("ch3.p3", { tenders: num(m.eligibility_tenders), pairs })),
    plot({
      id: "fig-amend-thresholds",
      title: t("ch3.fig3.title"),
      note: t("ch3.fig3.note"),
      build: (p) => p.append(dataTable({
        columns: [
          { key: "tender_id", label: t("col.tender") },
          { key: "figure_was", label: t("ch3.col.was") },
          { key: "figure_now", label: t("ch3.col.now") },
          { key: "direction", label: t("ch3.col.direction"),
            cell: (r) => word(`direction.${r.direction}`, r.direction) },
          { key: "times", label: t("ch3.col.times"), num: true,
            cell: (r) => (r.times === null ? t("ch3.unreadable")
              : t("num.times", { n: num(r.times) })) },
          { key: "read", label: t("ch3.col.read"), wrap: true,
            cell: (r) => dataText(r.read) },
          { key: "page", label: t("col.source"),
            cell: (r) => cite(r.source_file, +r.page || null) },
        ],
        rows: m.thresholds, per: 10, filter: false,
        filename: "amendment_thresholds.csv", label: t("ch3.fig3.title"),
      })),
    }),
    findingsFor(a, index,
      ["F-AMEND-01", "F-AMEND-02", "F-AMEND-03", "F-AMEND-04", "F-AMEND-05"]));
}

/* ---- chapter four: the conditions of entry ----
   The five labels are the analysis's own classification. Their words are translated;
   the token stays English inside data-label so the stylesheet keeps colouring them. */
function eligibility(a, index) {
  const e = a.eligibility;
  const order = ["RESTRICTIVE-LOOKING PATTERN", "HIGHLY SPECIFIC", "UNUSUAL",
    "COMMON", "UNDETERMINED"];
  const tally = order.filter((k) => e.tally[k] !== undefined).map((k, i) => ({
    label: word(`label.${k}`, k), value: e.tally[k],
    color: step(1 - i / (order.length - 1)),
    note: word(`eligMeaning.${k}`, e.label_meaning[k]),
  }));
  const shares = Object.entries(e.share_of_notices)
    .sort((x, y) => y[1] - x[1])
    .map(([k, v]) => ({ label: word(`elig.${k}`, k.replace(/_/g, " ")), value: v,
      color: step(v / 100), note: t("ch4.shareNote") }));
  return band("eligibility", t("ch4.kicker"), t("ch4.title"),
    prose(
      t("ch4.p1", { clauses: num(e.rows_count) }),
      t("ch4.p2", { clauses: num(e.rows_count), years: num(e.years_cut),
        contracts: num(e.contract_count_cut),
        turnover: taka(e.top_decile_cut.financial_turnover),
        liquid: taka(e.top_decile_cut.financial_liquid) }),
      t("ch4.p3"),
      t("ch4.p4", { undetermined: num(e.tally.UNDETERMINED) })),
    plot({
      id: "fig-elig-tally",
      title: t("ch4.fig1.title", { clauses: num(e.rows_count) }),
      note: t("ch4.fig1.note"),
      build: (p) => barsH(p, { rows: tally, labelWidth: 250,
        valueLabel: t("axis.clauses") }),
      table: { columns: [{ key: "label", label: t("col.label") },
        { key: "value", label: t("col.clauses"), num: true },
        { key: "note", label: t("ch4.col.meaning"), wrap: true }],
      rows: tally, per: 5, filter: false, filename: "eligibility_labels.csv" },
    }),
    plot({
      id: "fig-elig-shares",
      title: t("ch4.fig2.title"),
      note: t("ch4.fig2.note"),
      build: (p) => barsH(p, { rows: shares, labelWidth: 210, ticks: 4,
        valueLabel: t("axis.shareOfNotices"), fmt: (v) => pct(v) }),
      table: { columns: [{ key: "label", label: t("ch4.col.kind") },
        { key: "value", label: t("ch4.col.sharePct"), num: true }],
      rows: shares, sort: "value", per: 25, filename: "eligibility_shares.csv" },
    }),
    clauseExplorer(e),
    findingsFor(a, index, ["F-ELIG-01", "F-ELIG-02", "F-ELIG-03"]));
}

/* Every clause, searchable, with the page it is printed on. 3,239 rows is too much to
   send to a reader who did not ask for it, so it arrives when this is opened. The clause
   text itself is printed exactly as the notice printed it, in both editions. */
function clauseExplorer(e) {
  return disclosure(t("ch4.readAll", { n: num(e.rows_count) }), () => {
    const box = el("div", el("p", { class: "loading" }, t("ch4.loading")));
    eligibilityRows().then((rows) => {
      clear(box);
      box.append(dataTable({
        columns: [
          { key: "tender_id", label: t("col.tender") },
          { key: "label", label: t("col.label"), cell: (r) => chip(r.label) },
          { key: "categories", label: t("ch4.col.asksAbout"), wrap: true,
            cell: (r) => String(r.categories).split(";")
              .map((c) => word(`elig.${c}`, c.replace(/_/g, " "))).join(t("list.sep")) },
          { key: "money_original", label: t("ch4.col.moneyPrinted"), wrap: true },
          { key: "text", label: t("ch4.col.clause"), wrap: true },
          { key: "reasons", label: t("ch4.col.whyLabel"), wrap: true,
            cell: (r) => (r.reasons || []).map((x) => dataText(x)).join("; ") },
          { key: "page", label: t("col.source"),
            cell: (r) => cite(r.source_file, +r.page || null) },
        ],
        rows, per: 25, sort: "tender_id", dir: "asc",
        filename: "eligibility_criteria_filtered.csv",
        caption: t("ch4.tableCaption"),
      }));
    }).catch((err) => { clear(box); box.append(el("p", { class: "warn" }, err.message)); });
    return box;
  });
}

/* ---- chapter five: the funnel ---- */
function drop(a, index) {
  const f = a.funnel, s = f.stages;
  const stages = [
    { label: t("ch5.stage.sold"), value: s.documents_sold, note: t("ch5.stage.soldNote") },
    { label: t("ch5.stage.received"), value: s.bids_received,
      note: t("ch5.stage.receivedNote") },
    { label: t("ch5.stage.responsive"), value: s.bids_responsive,
      note: t("ch5.stage.responsiveNote") },
    { label: t("ch5.stage.signed"), value: s.contracts_signed,
      note: t("ch5.stage.signedNote") },
  ];
  /* One hue, light to dark, keyed to the number on the axis: no bids set aside is the
     lightest step and the 54-bid tender the darkest. The zero bar is not lifted out of
     the ramp, because a mid-ramp step on it would read as a middling number of bids set
     aside; what it means is spelled out in its own hover note instead. */
  const aside = Object.entries(f.set_aside_distribution)
    .map(([k, v]) => ({ label: k, value: v, tick: +k < 12,
      color: step(Math.min(1, +k / 11)),
      note: +k === 0 ? t("ch5.aside.none")
        : t(+k === 1 ? "ch5.aside.one" : "ch5.aside.many", { n: num(k) }) }))
    .sort((x, y) => +x.label - +y.label);
  const worst = aside[aside.length - 1];
  return band("funnel", t("ch5.kicker"), t("ch5.title"),
    prose(
      t("ch5.p1", { withCounts: num(f.notices_with_counts),
        withoutCounts: num(f.notices_without_counts) }),
      t("ch5.p2", { sold: num(s.documents_sold), received: num(s.bids_received),
        noBid: num(s.documents_sold - s.bids_received),
        responsive: num(s.bids_responsive),
        aside: num(s.bids_received - s.bids_responsive),
        signed: num(s.contracts_signed) }),
      t("ch5.p3", { aside: num(s.bids_received - s.bids_responsive) }),
      t("ch5.p4", { oneResponsive: num(f.one_responsive),
        oneBid: num(f.one_bid_received) })),
    plot({
      id: "fig-funnel", wide: true,
      title: t("ch5.fig1.title"),
      note: t("ch5.fig1.note"),
      source: sourceLine("ch5.fig1.source", "bids.csv"),
      build: (p) => funnel(p, { rows: stages, valueLabel: t("axis.count") }),
      table: { columns: [{ key: "label", label: t("ch5.col.step") },
        { key: "value", label: t("col.count"), num: true },
        { key: "note", label: t("ch5.col.stepMeans"), wrap: true }],
      rows: stages, per: 4, filter: false, filename: "funnel_stages.csv" },
    }),
    plot({
      id: "fig-set-aside",
      title: t("ch5.fig2.title"),
      note: t("ch5.fig2.note", { worst: num(worst.label) }),
      build: (p) => barsV(p, { rows: aside, height: 260, valueLabel: t("axis.tenders"),
        labelPrefix: t("ch5.fig2.prefix"), axisLabel: t("ch5.fig2.axis") }),
      table: { columns: [{ key: "label", label: t("ch5.col.setAside"), num: true },
        { key: "value", label: t("col.tenders"), num: true },
        { key: "note", label: t("ch5.col.reading"), wrap: true }],
      rows: aside, sort: "label", dir: "asc", per: 15, filter: false,
      filename: "bids_set_aside.csv" },
    }),
    findingsFor(a, index,
      ["F-FUNNEL-01", "F-FUNNEL-02", "F-FUNNEL-03", "F-FUNNEL-04"]));
}

/* ---- chapter six: the rule of entry against the result ----
   The chapter the whole investigation exists for, and the one that has to be most
   careful: the two tests below do not reach significance, and the prose says so. */
function chainChapter(a, index) {
  const c = a.chain;
  const rows = c.by_label.map((r) => ({ label: word(`label.${r.label}`, r.label),
    from: r.median_responsive, to: r.median_received, tenders: r.tenders,
    share_one_responsive: r.share_one_responsive,
    share_dropped_someone: r.share_dropped_someone,
    median_received: r.median_received, median_responsive: r.median_responsive,
    note: t("ch6.rowNote", { n: num(r.tenders),
      share: pct(r.share_one_responsive) }) }));
  const one = rows.map((r) => ({ label: r.label, value: r.share_one_responsive,
    color: step(r.share_one_responsive / 100),
    note: t("ch6.groupNote", { n: num(r.tenders) }) }));
  const tests = c.tests;
  const test = (x) => t("ch6.test", { strong: num(x.strong), strongOf: num(x.strong_of),
    strongShare: pct(x.strong_share), other: num(x.other), otherOf: num(x.other_of),
    otherShare: pct(x.other_share), p: decimal(x.p_two_sided) });
  return band("chain", t("ch6.kicker"), t("ch6.title"),
    prose(
      t("ch6.p1", { tenders: num(c.tenders_with_counts) }),
      t("ch6.p2"),
      t("ch6.p3", { dropped: test(tests.dropped_someone),
        one: test(tests.one_responsive),
        strongOf: num(tests.dropped_someone.strong_of) })),
    plot({
      id: "fig-chain-bids",
      title: t("ch6.fig1.title"),
      note: t("ch6.fig1.note"),
      legend: legend([{ color: CAT[0], label: t("ch6.legend.responsive") },
        { color: CAT[1], label: t("ch6.legend.received") }]),
      build: (p) => dumbbell(p, { rows, labelWidth: 250,
        fromLabel: t("ch6.axis.medianResponsive"), toLabel: t("ch6.axis.medianReceived") }),
      table: { columns: [{ key: "label", label: t("ch6.col.strongestInNotice") },
        { key: "tenders", label: t("col.tenders"), num: true },
        { key: "median_received", label: t("ch6.col.medianReceived"), num: true },
        { key: "median_responsive", label: t("ch6.col.medianResponsive"), num: true },
        { key: "share_one_responsive", label: t("ch6.col.oneResponsivePct"), num: true },
        { key: "share_dropped_someone", label: t("ch6.col.someoneAsidePct"), num: true }],
      rows, per: 6, filter: false, filename: "chain_by_label.csv" },
    }),
    plot({
      id: "fig-chain-one",
      title: t("ch6.fig2.title"),
      note: t("ch6.fig2.note", { tenders: num(c.tenders_with_counts),
        labelled: num(c.labelled) }),
      build: (p) => barsH(p, { rows: one, labelWidth: 250, max: 100, ticks: 4,
        valueLabel: t("axis.shareOfTenders"), fmt: (v) => pct(v) }),
      table: { columns: [{ key: "label", label: t("ch6.col.strongest") },
        { key: "value", label: t("ch6.col.oneResponsivePct"), num: true },
        { key: "note", label: t("ch6.col.groupSize"), wrap: true }],
      rows: one, per: 6, filter: false, filename: "chain_one_responsive.csv" },
    }),
    bandFigures(c),
    prose(t("ch6.p4", { clauses: num(c.unreadable_figures.clauses),
      notices: num(c.unreadable_figures.notices.length) })),
    findingsFor(a, index, ["F-CHAIN-01", "F-CHAIN-02"]));
}

/* The only two conditions of entry the folder puts a recommended size on. Each dot is
   one tender: what it demanded, divided by the contract it eventually signed. The
   uppercasing of the first letter is a no-op in Bengali, which has no letter case, so
   the same line serves both editions. */
function bandFigures(c) {
  const box = el("div");
  for (const [id, b] of Object.entries(c.bands)) {
    const reads = word(`readsOn.${b.reads_on}`, b.reads_on);
    box.append(el("div", { class: "prose" },
      el("h3", `${reads.slice(0, 1).toUpperCase()}${reads.slice(1)}`),
      el("p", t("ch6.band.intro", { low: pct(b.band_low * 100),
        high: pct(b.band_high * 100) })),
      quote(b.quote, b.file, b.page),
      el("p", t("ch6.band.numbers", { tenders: num(b.tenders), median: decimal(b.median),
        within: num(b.within_band), above: num(b.above_band),
        aboveShare: pct(b.above_band_share), max: decimal(b.max) }))));
    box.append(plot({
      id: `fig-band-${id.toLowerCase()}`, wide: true,
      title: t("ch6.band.figTitle", { reads }),
      note: t("ch6.band.figNote", {
        beyond: num(b.all_ratios.filter((x) => x > 2).length) }),
      source: t("ch6.band.figSource"),
      build: (p) => bandStrip(p, { values: b.all_ratios, bandLow: b.band_low,
        bandHigh: b.band_high, median: b.median, cap: 2, bin: 0.05,
        bandLabel: t("ch6.band.stripLabel", { low: pct(b.band_low * 100),
          high: pct(b.band_high * 100) }) }),
      table: { columns: [{ key: "tender_id", label: t("col.tender") },
        { key: "demanded", label: t("ch6.col.demanded"), num: true,
          cell: (r) => taka(r.demanded) },
        { key: "contract_value", label: t("ch6.col.contractSigned"), num: true,
          cell: (r) => taka(r.contract_value) },
        { key: "ratio", label: t("ch6.col.timesContract"), num: true,
          cell: (r) => t("num.times", { n: num(Math.round(r.ratio * 100) / 100) }) },
        { key: "source_file", label: t("col.source"),
          cell: (r) => cite(r.source_file, null) }],
      rows: b.highest, per: 5, filter: false,
      filename: `${id.toLowerCase()}_highest.csv`,
      caption: t("ch6.band.tableCaption") },
    }));
  }
  return box;
}

/* ---- chapter seven: how the tenders ended ----
   The status words are the portal's own — "Contract Awarded", "Re-Tendered" — and are
   printed exactly as the notice prints them in both editions. The one string that is
   translated is the parser's own stand-in for a notice that prints no status at all. */
function outcomes(a, index) {
  const o = a.outcomes;
  const rows = o.by_status.map((r) => ({ ...r, label: r.status === "(not printed)"
    ? t("ch7.noStatus") : r.status, value: r.tenders, color: SEQ[4],
  note: r.with_award_notice
    ? t("ch7.someBacked", { n: num(r.with_award_notice),
      share: pct(r.share_with_award_notice) })
    : t("ch7.noneBacked") }));
  return band("outcomes", t("ch7.kicker"), t("ch7.title"),
    prose(
      t("ch7.p1", { notices: num(o.notices), awards: num(o.award_notices) }),
      t("ch7.p2", { orphans: num(o.said_awarded_without_award_notice) }),
      t("ch7.p3", { ended: num(o.ended_without_a_contract) })),
    plot({
      id: "fig-outcomes",
      title: t("ch7.fig.title"),
      note: t("ch7.fig.note"),
      build: (p) => barsH(p, { rows, labelWidth: 230, valueLabel: t("axis.tenders") }),
      table: { columns: [{ key: "status", label: t("ch7.col.statusPrinted") },
        { key: "tenders", label: t("col.tenders"), num: true },
        { key: "with_award_notice", label: t("ch7.col.withAward"), num: true },
        { key: "share_with_award_notice", label: t("ch7.col.sharePct"), num: true }],
      rows: o.by_status, sort: "tenders", per: 10, filter: false,
      filename: "outcomes_by_status.csv" },
    }),
    findingsFor(a, index, ["F-OUT-01", "F-OUT-02"]));
}

/* ---- chapter eight: the money ----
   Firm names are printed exactly as the award notices print them, joint-venture partner
   shares and all, in both editions: the printed string is what an editor checks. */
function money(a, index) {
  const m = a.money;
  const short = (s) => (s.length > 44 ? `${s.slice(0, 42).replace(/[\s,(]+$/, "")}…` : s);
  const rows = m.top_ten.map((r, i) => ({ label: short(r.name), value: r.taka,
    color: step(1 - i / (m.top_ten.length - 1)), name: r.name, contracts: r.contracts,
    taka: r.taka,
    note: t(r.contracts === 1 ? "ch8.barNote.one" : "ch8.barNote.many",
      { name: r.name, n: num(r.contracts), taka: exact(r.taka) }) }));
  const half = m.firms_taking_half;
  return band("money", t("ch8.kicker"), t("ch8.title"),
    prose(
      t("ch8.p1", { firms: num(m.companies), money: taka(m.total_taka),
        exact: exact(m.total_taka) }),
      t(half === 1 ? "ch8.p2.one" : "ch8.p2.many", { half: num(half),
        repeat: num(m.won_more_than_one),
        acrossEntities: num(m.firms_across_more_than_one_entity) }),
      t("ch8.p3")),
    plot({
      id: "fig-money",
      title: t("ch8.fig.title"),
      note: t("ch8.fig.note"),
      source: sourceLine("ch8.fig.source", "companies.csv"),
      build: (p) => barsH(p, { rows, labelWidth: 260, rightPad: 96,
        valueLabel: t("axis.signedContracts"), fmt: (v) => taka(v) }),
      table: { columns: [{ key: "name", label: t("ch8.col.firm"), wrap: true },
        { key: "contracts", label: t("col.contracts"), num: true },
        { key: "taka", label: t("ch8.col.totalSigned"), num: true,
          cell: (r) => exact(r.taka) }],
      rows: m.top_ten, sort: "taka", per: 10, filter: false,
      filename: "top_ten_by_value.csv", caption: t("ch8.tableCaption") },
    }),
    findingsFor(a, index, ["F-MONEY-01", "F-MONEY-02"]));
}

/* ---- chapter nine: the connections ----
   No chart. Ten groups of firms sharing an address is a list of names and pages; a
   network diagram of ten nodes would hide the names to show the shape. The addresses
   and the firm names are printed as the documents print them. */
function connections(a, index) {
  const c = a.connections;
  return band("connections", t("ch9.kicker"), t("ch9.title"),
    prose(
      t(c.people_owning_more_than_one_firm === 1 ? "ch9.p1.one" : "ch9.p1.many",
        { withOwner: num(c.firms_declaring_an_owner), firms: num(c.firms),
          people: num(c.people_named),
          multi: num(c.people_owning_more_than_one_firm) }),
      t("ch9.p2", { addresses: num(c.addresses_shared) }),
      t("ch9.p3", { pairs: num(c.name_pairs), merged: num(c.name_pairs_merged) })),
    el("div", { class: "prose" },
      el("h3", t("ch9.groupsTitle")),
      el("ol", { class: "groups" }, c.address_groups.map((g) =>
        el("li",
          el("h4", g.address,
            el("span", { class: "note" }, g.involves_a_joint_venture === "yes"
              ? t("ch9.jvYes") : t("ch9.jvNo"))),
          el("ul", g.firms.map((n) => el("li", n))))))),
    findingsFor(a, index, ["F-CONN-01", "F-CONN-02", "F-CONN-03"]));
}

/* ---- chapter ten: the per-tender ledger ----
   Ten observations, each of which can be re-run mechanically against every tender. Their
   wording is mine, so it is translated; their codes are not, because the codes are what
   the ledger, the CSV and the search index all key on. */
function signals(a, index) {
  const s = a.signals;
  const most = Math.max(...Object.values(s.by_signal));
  const defs = s.definitions.map((d) => ({ ...d,
    label: word(`signal.${d.id}.short`, d.short), value: s.by_signal[d.id] || 0,
    color: step((s.by_signal[d.id] || 0) / most),
    means: word(`signal.${d.id}.means`, d.means),
    note: word(`signal.${d.id}.means`, d.means) }));
  /* Same rule as the set-aside chart: the ramp runs monotonically with the number on
     the axis, so none is the lightest step rather than a mid one. */
  const dist = Object.entries(s.distribution).map(([k, v]) => ({ label: k, value: v,
    tick: true, color: step(+k / 4),
    note: +k === 0 ? t("ch10.dist.none")
      : t("ch10.dist.some", { n: num(k), of: num(s.definitions.length) }) }));
  const withAny = Object.entries(s.distribution).filter(([k]) => +k > 0)
    .reduce((total, [, v]) => total + v, 0);
  return band("signals", t("ch10.kicker"), t("ch10.title"),
    prose(
      t("ch10.p1", { kinds: num(s.definitions.length), rows: num(s.rows_count) }),
      t("ch10.p2"),
      t("ch10.p3", { withAny: num(withAny), none: num(s.distribution["0"] || 0) })),
    plot({
      id: "fig-signals",
      title: t("ch10.fig1.title"),
      note: t("ch10.fig1.note"),
      build: (p) => barsH(p, { rows: defs, labelWidth: 280,
        valueLabel: t("axis.tenders") }),
      table: { columns: [{ key: "id", label: t("ch10.col.code") },
        { key: "label", label: t("ch10.col.observation") },
        { key: "value", label: t("col.tenders"), num: true },
        { key: "means", label: t("ch10.col.theTest"), wrap: true }],
      rows: defs, sort: "value", per: 10, filter: false, filename: "signals.csv" },
    }),
    plot({
      id: "fig-signal-dist",
      title: t("ch10.fig2.title", { of: num(s.definitions.length) }),
      build: (p) => barsV(p, { rows: dist, height: 220, valueLabel: t("axis.tenders"),
        labelPrefix: t("ch10.fig2.prefix"), axisLabel: t("ch10.fig2.axis") }),
      table: { columns: [{ key: "label", label: t("ch10.col.howMany"), num: true },
        { key: "value", label: t("col.tenders"), num: true },
        { key: "note", label: t("ch5.col.reading"), wrap: true }],
      rows: dist, sort: "label", dir: "asc", per: 6, filter: false,
      filename: "signals_per_tender.csv" },
    }),
    ledger(s),
    findingsFor(a, index, ["F-SIGNAL-01"]));
}

/* The ledger itself: one row per tender, fetched when a reader opens it. The tender
   number, the procuring entity, the district and the printed status are all as the
   documents print them. */
function ledger(s) {
  return disclosure(t("ch10.openLedger", { n: num(s.rows_count) }), () => {
    const box = el("div", el("p", { class: "loading" }, t("ch10.loading")));
    signalRows().then((rows) => {
      clear(box);
      box.append(dataTable({
        columns: [
          { key: "tender_id", label: t("col.tender") },
          { key: "count", label: t("ch10.col.observations"), num: true },
          { key: "signals", label: t("ch10.col.whichOnes"), wrap: true,
            cell: (r) => (r.signals || []).map((id) => chip(id, {
              short: word(`signal.${id}.short`,
                (s.definitions.find((d) => d.id === id) || {}).short || id) })) },
          { key: "strongest_clause", label: t("ch10.col.strongestClause"),
            cell: (r) => (r.strongest_clause ? chip(r.strongest_clause)
              : el("span", { class: "note" }, t("ch10.nonePrinted"))) },
          { key: "open_days", label: t("ch10.col.daysOpen"), num: true },
          { key: "status", label: t("col.status") },
          { key: "procuring_entity", label: t("col.entity"), wrap: true },
          { key: "district", label: t("col.district") },
          { key: "notice_file", label: t("ch10.col.notice"),
            cell: (r) => (r.notice_in_archive === "yes" ? cite(r.notice_file, 1)
              : el("span", { class: "note" }, t("ch10.notHere"))) },
        ],
        rows, per: 25, sort: "count",
        filename: "per_tender_ledger_filtered.csv",
        caption: t("ch10.tableCaption"),
      }));
    }).catch((err) => { clear(box); box.append(el("p", { class: "warn" }, err.message)); });
    return box;
  });
}

/* ---- how it was done ----
   The nine filenames are filenames. They are not translated, in either edition, because
   a reader who wants to check a number opens that file in this repository. */
const STAGES = [
  ["01_inventory.py", "inventory"],
  ["02_extract.py", "extract"],
  ["03_dataset.py", "dataset"],
  ["03_audit.py", "audit"],
  ["04_analysis.py", "analysis"],
  ["05_evidence.py", "evidence"],
  ["06_search.py", "search"],
  ["split_payload.py", "split"],
];

function methodology(a, au) {
  const c = a.dataset_counts;
  const ds = au.district_spelling_evidence || {};
  const spellings = Object.keys(ds.district_spellings || {}).length;
  const stageVars = { checks: num(au.checks_run), failed: num(au.checks_failed.length),
    cells: num(au.award_cells_compared_with_the_earlier_parser) };
  const blankCols = Object.values(au.blank_reasons)
    .reduce((total, cols) => total + Object.keys(cols).length, 0);
  return band("methodology", t("meth.kicker"), t("meth.title"),
    prose(
      t("meth.p1"),
      t("meth.p2", { seconds: num(c.seconds), documents: num(c.documents),
        tables: num(c.tables.length), rows: num(c.master_rows),
        links: num(c.relationships), events: num(c.timeline_events) })),
    el("ol", { class: "prose stages" }, STAGES.map(([file, key]) =>
      el("li", el("span", { class: "mono" }, file), " ",
        el("span", t(`meth.stage.${key}`, stageVars))))),
    prose(
      t("meth.p3", { applied: num(c.normalisations_applied),
        rules: num(c.normalisation_rules.length),
        logged: num(c.normalisations_logged),
        ruleList: c.normalisation_rules.map((r) => word(`normRule.${r}`, r))
          .join(t("list.sep")) }),
      t("meth.p4", { pairs: num(c.name_candidate_pairs),
        merged: num(c.names_merged_on_resemblance) }),
      t("meth.p5", { spellings: num(spellings),
        offices: num((ds.offices_printing_more_than_one || []).length) }),
      t("meth.p6"),
      t("meth.p7", { columns: num(blankCols) })),
    toolLinks(),
    disclosure(t("meth.readNotes"), () =>
      el("ul", { class: "prose" }, au.notes.map((n) => el("li", dataText(n))))));
}

/* ---- the way into the tools, and into the files themselves ----
   The methodology is where a reader who has just been told how a number was made wants
   to open the thing that made it. The first list is the six tools on this page; the
   second opens the actual files, in a new tab, so nothing here has to be taken on
   trust. The hrefs are built by data.js and ui.js from their own module URLs, so they
   resolve the same whether the site was opened from the repository root or from
   inside investigation/. */
const FILE_LINKS = [
  ["file.tables", () => dataHref("tables/")],
  ["file.master", () => dataHref("master_dataset.csv")],
  ["file.analysis", () => dataHref("analysis.json")],
  ["file.audit", () => dataHref("audit_report.json")],
  ["file.matrix", () => `${PDF_BASE}EVIDENCE_MATRIX.csv`],
  ["file.qa", () => `${PDF_BASE}EDITOR_QA_REPORT.md`],
  ["file.pages", () => siteHref("public/pages/")],
  ["file.dictionary", () => siteHref("documentation/data_dictionary.md")],
  ["file.pipeline", () => siteHref("documentation/pipeline.md")],
  ["file.searchRef", () => siteHref("documentation/search_reference.md")],
];

function toolLinks() {
  return el("nav", { class: "contents inset", "aria-label": t("meth.toolsAria") },
    el("p", { class: "kicker" }, t("meth.toolsTitle")),
    el("ol", { class: "cont-tools" }, [...TOOLS, ...TAIL].map(([id, key, blurb]) =>
      el("li", el("a", { href: `#${id}` }, t(key)),
        blurb ? el("span", { class: "note" }, t(blurb)) : null))),
    el("p", { class: "kicker" }, t("meth.filesTitle")),
    el("ul", { class: "cont-tools files" }, FILE_LINKS.map(([key, href]) =>
      el("li", el("a", { href: href(), target: "_blank", rel: "noopener" }, t(key)),
        el("span", { class: "note" }, t(`${key}.what`))))),
    el("p", { class: "note" }, t("meth.filesNote")));
}

/* ---- what this cannot tell you ----
   Written as flatly as possible. A limitations section that reads like a disclaimer is
   a limitations section nobody reads. Ten limits, each a heading and a paragraph; the
   pack writes both, and the numbers inside them come from the same analysis as the
   chapters above. */
const LIMITS = ["reasons", "losers", "estimate", "draft", "undetermined", "smallGroups",
  "orphans", "unreadable", "ownership", "oneBuyer"];

function limits(a) {
  const c = a.dataset_counts, o = a.outcomes, ch = a.chain;
  const vars = {
    aside: num(a.funnel.stages.bids_received - a.funnel.stages.bids_responsive),
    bidderDocs: num(c.bidder_level_records_in_archive),
    undetermined: num(a.eligibility.tally.UNDETERMINED),
    strongOf: num(ch.tests.dropped_someone.strong_of),
    otherOf: num(ch.tests.dropped_someone.other_of),
    orphans: num(o.said_awarded_without_award_notice),
    figures: num(ch.unreadable_figures.clauses),
    strings: num(ch.unreadable_figures.printed_strings.length),
    withOwner: num(a.connections.firms_declaring_an_owner),
    firms: num(a.connections.firms),
  };
  return band("limits", t("lim.kicker"), t("lim.title"),
    prose(t("lim.intro")),
    el("ol", { class: "prose limits" }, LIMITS.map((key) =>
      el("li", el("h4", t(`lim.${key}.head`, vars)),
        el("p", t(`lim.${key}.detail`, vars))))),
    disclosure(t("lim.openStrings", { n: vars.strings }), () =>
      el("div", { class: "prose" },
        el("ul", { class: "mono strings" },
          ch.unreadable_figures.printed_strings.map((s) => el("li", s))),
        el("p", { class: "note" }, t("lim.stringsNote", {
          notices: num(ch.unreadable_figures.notices.length),
          list: ch.unreadable_figures.notices.join(", ") })))));
}

/* ---- the order the story is told in ----
   Each entry carries a one-line description as well as a title, because a contents
   block that only lists ten titles asks a reader to guess which chapter answers their
   question. The id is the anchor; the two keys are written by the language pack. */
export const CHAPTERS = [
  ["summary", "toc.summary", "toc.summary.what"],
  ["how-to-read", "toc.howToRead", "toc.howToRead.what"],
  ["rules", "toc.rules", "toc.rules.what"],
  ["clock", "toc.clock", "toc.clock.what"],
  ["amendments", "toc.amendments", "toc.amendments.what"],
  ["eligibility", "toc.eligibility", "toc.eligibility.what"],
  ["funnel", "toc.funnel", "toc.funnel.what"],
  ["chain", "toc.chain", "toc.chain.what"],
  ["outcomes", "toc.outcomes", "toc.outcomes.what"],
  ["money", "toc.money", "toc.money.what"],
  ["connections", "toc.connections", "toc.connections.what"],
  ["signals", "toc.signals", "toc.signals.what"],
];

/* The half of the site that exists so a reader does not have to take the other half
   on trust. It sits after the story on the page and before the methodology. */
export const TOOLS = [
  ["search", "toc.search", "toc.search.what"],
  ["entities", "toc.entities", "toc.entities.what"],
  ["network", "toc.network", "toc.network.what"],
  ["documents", "toc.documents", "toc.documents.what"],
  ["tables", "toc.tables", "toc.tables.what"],
  ["downloads", "toc.downloads", "toc.downloads.what"],
];

export const TAIL = [
  ["methodology", "toc.methodology", "toc.methodology.what"],
  ["limits", "toc.limits", "toc.limits.what"],
];

/* The four files a reader is most likely to want straight away. The other six are
   listed in full under the methodology, next to the scripts that wrote them. */
const QUICK_FILES = ["file.tables", "file.master", "file.matrix", "file.qa"];

/* ---- the contents, which is also the site's map ----
   Three groups, and every line in all three opens something: the chapters of the
   article, the six tools that check the article and the two closing sections, and the
   files the whole thing was built from. */
function contents() {
  const hrefOf = Object.fromEntries(FILE_LINKS);
  return el("nav", { class: "band contents", "aria-label": t("toc.aria") },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, t("toc.storyTitle")),
      el("ol", CHAPTERS.map(([id, key, blurb]) =>
        el("li", el("a", { href: `#${id}` }, t(key)),
          el("span", { class: "note" }, t(blurb))))),
      el("p", { class: "kicker" }, t("toc.checkTitle")),
      el("ol", { class: "cont-tools" }, [...TOOLS, ...TAIL].map(([id, key, blurb]) =>
        el("li", el("a", { href: `#${id}` }, t(key)),
          el("span", { class: "note" }, t(blurb))))),
      el("p", { class: "kicker" }, t("toc.filesTitle")),
      el("ul", { class: "cont-tools files" }, QUICK_FILES.map((key) =>
        el("li", el("a", { href: hrefOf[key](), target: "_blank", rel: "noopener" },
          t(key)), el("span", { class: "note" }, t(`${key}.what`))))),
      el("p", { class: "note" }, t("toc.filesNote"))));
}

/* ---- the article ----
   The chapters, and then the two closing sections separately, because the tools that
   let a reader check the chapters belong between them: read the story, check it, then
   read how it was made and what it cannot tell you. */
export async function renderStory(root) {
  const [a, index, au] = await Promise.all([analysis(), evidence(), audit()]);
  root.append(
    hero(a),
    contents(),
    summary(a),
    howToRead(a),
    rules(a, index),
    clock(a, index),
    amendments(a, index),
    eligibility(a, index),
    drop(a, index),
    chainChapter(a, index),
    outcomes(a, index),
    money(a, index),
    connections(a, index),
    signals(a, index));
  return { a, index, audit: au };
}

export function renderTail(root, a, au) {
  root.append(methodology(a, au), limits(a));
}



