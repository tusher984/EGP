/* The article. Every sentence here is built out of investigation/data/story.json,
   which 04_analysis.py wrote from the CSVs, which 03_dataset.py wrote from the
   1,805 PDFs. No number below is typed in by hand: if a figure changes upstream,
   the sentence changes with it, and if the pipeline cannot establish something the
   sentence says so rather than filling the gap.

   Each chapter carries its own findings and its own figures. There is no gallery of
   charts at the end, because a chart away from the paragraph it belongs to is
   decoration; three of the findings are better served by a table of the source
   pages than by any chart, and those are tables. */

import {
  el, num, pct, taka, exact, cite, quote, tiles, disclosure, figure, legend,
  dataTable, chip, clear,
} from "../components/ui.js";
import {
  barsH, barsV, funnel, dumbbell, bandStrip, SEQ, CAT, step,
} from "../charts/charts.js";
import { findingCard } from "../evidence/evidence.js";
import { analysis, evidence, audit, eligibilityRows, signalRows } from "./data.js";

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
    f.append(disclosure("Read these numbers as a table", () => dataTable(opts.table)));
  }
  return f;
}

const findingsFor = (a, index, ids) => el("div", { class: "findings" },
  ids.map((id) => {
    const f = a.findings.find((x) => x.id === id);
    return f ? findingCard(f, index) : null;
  }));

/* ---- the top of the story ---- */
function hero(a) {
  const c = a.dataset_counts;
  return el("header", { class: "hero", id: "top" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, "An investigation built only from the government's "
        + "own published documents"),
      el("h1", "Who was allowed to compete"),
      el("p", { class: "standfirst" },
        `${num(c.documents)} notices and award letters published by Bangladesh's `
        + "electronic government procurement portal for Chattogram Development "
        + "Authority work, read end to end. They record "
        + `${num(c.tenders)} tenders, ${num(c.bid_rows_with_counts)} awards that print `
        + "how many firms took part, and "
        + `${taka(c.contract_value_total_taka)} of taka in signed contracts. `
        + "They also record who could enter each race before it started."),
      el("p", { class: "byline" },
        el("span", "Reported from the documents in this folder and nothing else"),
        el("span", { class: "sep" }, "·"),
        el("span", `Dataset built ${String(c.generated).slice(0, 10)}`),
        el("span", { class: "sep" }, "·"),
        el("span", { class: "mono" }, `${num(c.relationships)} recorded links, `
          + `${num(c.timeline_events)} dated events`)),
      tiles([
        { value: num(c.documents), label: "PDFs read, every page of every one" },
        { value: num(c.tenders), label: "tender notices" },
        { value: num(c.eligibility_criteria),
          label: "printed requirements to enter, each classified" },
        { value: taka(c.contract_value_total_taka), label: "taka in contracts signed" },
        { value: num(a.money.companies), label: "firms named as winners" },
        { value: num(a.funnel.one_responsive),
          label: "awards where one bid remained standing" },
      ])));
}

/* ---- what the whole thing found, before any of the detail ---- */
function summary(a) {
  const f = a.funnel, s = f.stages, e = a.eligibility.tally;
  const withSignal = Object.entries(a.signals.distribution)
    .filter(([k]) => +k > 0).reduce((t, [, v]) => t + v, 0);
  const strong = (e["HIGHLY SPECIFIC"] || 0) + (e["RESTRICTIVE-LOOKING PATTERN"] || 0);
  return band("summary", "In short", "What these documents show",
    prose(
      "A public tender is a race with the rules printed at the start. The notice says "
      + "what a firm must already have to enter — years of experience, a past contract "
      + "of a certain size, cash in the bank — and any firm that meets them may bid. "
      + "This archive lets those rules be read beside the result of the race, because "
      + `the portal published both: the ${num(a.amendments.notices)} notices that set `
      + `the conditions, and the ${num(a.dataset_counts.contracts)} award letters that `
      + "say how it ended.",

      `The notices print ${num(a.dataset_counts.eligibility_criteria)} separate `
      + "conditions of entry. Measured against each other, most are ordinary: "
      + `${num(e.COMMON)} ask for something at least a fifth of the archive asks for. `
      + `${num(e.UNUSUAL)} stand out on one measure. ${num(strong)} either name a `
      + "brand, a model, an origin or a named manufacturer's authorisation, or stack "
      + "two or more such things together. And "
      + `${num(e.UNDETERMINED)} state no requirement that can be measured at all: they `
      + "point at a document the portal does not publish, so what they demanded cannot "
      + "be read here by anyone, including the firms deciding whether to bid.",

      `Where the awards print counts, ${num(s.documents_sold)} sets of tender documents `
      + `were sold, ${num(s.bids_received)} bids arrived, ${num(s.bids_responsive)} were `
      + `recorded as responsive, and ${num(s.contracts_signed)} contracts were signed. `
      + `The largest single drop is between arriving and remaining: `
      + `${num(s.bids_received - s.bids_responsive)} bids were set aside. `
      + "<b>No document in this archive gives a reason for any of them.</b> Not one "
      + "rejection letter, evaluation report or minute is in the folder.",

      `In ${num(f.one_responsive)} awards exactly one bid was left standing at the end. `
      + `In ${num(f.one_bid_received)} only one ever arrived. Both are outcomes a `
      + "procurement system is allowed to reach; the documents record that they were "
      + "reached, and do not record why.",

      "This site does not conclude that any tender was steered, and the documents do "
      + "not establish it. What it does is put the rule of entry, the number of bidders, "
      + "the number that survived and the money next to each other for every tender, "
      + "with the page of the PDF each figure was read from, and mark the places where "
      + "the record contradicts itself or stops short. "
      + `${num(withSignal)} of the ${num(a.signals.rows_count)} tenders carry at least `
      + `one of ${num(a.signals.definitions.length)} such observations; `
      + `${num(a.signals.distribution["4"] || 0)} carry four or more.`),
    el("p", { class: "note prose" }, "Every figure in this paragraph is linked to its "
      + "source further down the page. Nothing on this site is asserted without the "
      + "document it came from."));
}

/* ---- the reader's instructions, and an honest map of the gaps ----
   The chain is the spine of the investigation. Printing which links the archive
   actually holds is the single most useful thing this page can tell an editor. */
function howToRead(a) {
  const c = a.dataset_counts;
  const chain = [
    ["The rules", "in the archive, with a caveat",
      `${a.rules.reference_documents.length} reference documents, `
      + `${a.rules.quoted.length} rules quoted from them. The standard tender document `
      + "among them is marked on its own first page as a preliminary working draft, and "
      + "no notice says which standard document it was written from."],
    ["Who could enter", "in the archive",
      `${num(c.eligibility_criteria)} conditions printed across the notices, each one `
      + `classified and each one linked to its page. A further ${num(c.eligibility_criteria_deferred)} `
      + "clauses point at a document the portal does not publish."],
    ["Who entered", "counts only",
      `${num(a.funnel.notices_with_counts)} awards print how many bids arrived. `
      + `${num(c.bidder_level_records_in_archive)} documents in this folder name a losing `
      + "bidder, so who entered a tender cannot be known from this archive — only how many."],
    ["Who stayed responsive", "counts only",
      "the same awards print a responsive count. Which bids they were is not printed."],
    ["Who was rejected, and why", "not in the archive",
      "no rejection letter, no evaluation report, no committee minute, no reason for a "
      + "single bid being set aside. This is the largest hole in the record and no "
      + "amount of analysis can fill it."],
    ["How bids were evaluated", "not in the archive",
      "no score, no comparison sheet, no evaluation criteria beyond the conditions of "
      + "entry printed in the notice."],
    ["Who won", "in the archive",
      `${num(c.contracts)} award notices naming a winner, a value and a date.`],
    ["How much money", "in the archive",
      `${taka(c.contract_value_total_taka)} of taka across those awards; `
      + `${num(c.contracts_without_a_printed_value)} of them print no value.`],
    ["Which entities connect", "partly in the archive",
      `${num(a.connections.firms_declaring_an_owner)} of ${num(a.connections.firms)} firms `
      + `declare an owner. ${num(a.connections.addresses_shared)} printed addresses are `
      + "shared by more than one firm. Everything else about who owns what is absent."],
  ];
  return band("how-to-read", "Before you start", "How to read this investigation",
    prose("Four labels are used on every statement, and they mean exactly what they say:"),
    el("ul", { class: "prose labels" }, Object.entries(a.label_kinds).map(([k, v]) =>
      el("li", chip(k), " ", el("span", v)))),
    prose("The conditions of entry carry a second set of labels. These are descriptions "
      + "of how a clause compares with the rest of this archive, and nothing more. "
      + "<b>An unusual requirement is not evidence of wrongdoing.</b> A big project "
      + "needs a big contractor, and the documents rarely say which case they are:"),
    el("ul", { class: "prose labels" }, Object.entries(a.eligibility.label_meaning)
      .map(([k, v]) => el("li", chip(k), " ", el("span", v)))),
    prose("An investigation is only as good as the parts of the story its documents "
      + "reach. This is the chain from rule to money, and what this folder holds of it:"),
    el("ol", { class: "chainmap" }, chain.map(([step, state, detail]) =>
      el("li", { "data-state": state },
        el("h4", step, el("span", { class: "state" }, state)),
        el("p", detail)))),
    prose("Every number on this site carries the file it came from and the page it was "
      + "printed on. Clicking one opens that PDF at that page in your own browser. "
      + "Where a page could not be read cleanly, the text is shown exactly as the "
      + "parser saw it rather than tidied, so you can see what it had to work with."));
}

/* ---- chapter one: the rules ----
   No chart. Fourteen rules and the page each is printed on is a table of links, and a
   chart of fourteen quotations would be a chart of nothing. */
function rules(a, index) {
  const r = a.rules;
  const min = r.minimum_tenderer_phrases;
  return band("rules", "Chapter one", "The rules of the race",
    prose(
      "Before any tender in this archive opened, the procedure it was meant to follow "
      + "was already written down. The folder holds "
      + `${r.reference_documents.length} documents that state it, `
      + `${num(r.reference_pages)} pages in all. They are the only statements of `
      + "procedure here, and this investigation quotes them rather than describing them.",
      `${r.quoted.length} of those rules can be checked against the notices — they put a `
      + "number on something the notices also print: how long bidding must stay open, "
      + "how long a tender security must last, how much cash a firm may be asked to "
      + "hold, how big a past contract may be demanded, when a price is too low to "
      + "accept. Each one below opens the page it is printed on."),
    plot({
      id: "fig-rules",
      title: "The fourteen rules this investigation can test, and where they are printed",
      note: "Every row opens the PDF at that page. The wording is quoted, not "
        + "paraphrased; where a page is set in two columns the extracted line can "
        + "carry a heading from the margin, and it is left in.",
      build: (p) => p.append(dataTable({
        columns: [
          { key: "id", label: "Rule" },
          { key: "reads_on", label: "What it decides", wrap: true },
          { key: "page", label: "Page", num: true },
          { key: "file", label: "Printed in",
            cell: (row) => cite(row.file, row.page) },
        ],
        rows: r.quoted, sort: "id", dir: "asc", per: 14, filter: false,
        filename: "rules_quoted.csv",
        label: "The fourteen rules this investigation can test, and where they are printed",
      })),
    }),
    disclosure("Read all fourteen rules exactly as they are printed", () =>
      el("div", { class: "prose" }, r.quoted.map((q) => el("div", { class: "rulequote" },
        el("h4", q.id, el("span", { class: "note" }, q.reads_on)),
        quote(q.text, q.file, q.page))))),
    prose("Two of the rules matter more than the rest for what follows, because they are "
      + "the only two that put a recommended <i>size</i> on a condition of entry — how "
      + "much cash a firm may be asked to have, and how big a past contract it may be "
      + "asked to have finished. Those two are measured against the notices in "
      + "<a href=\"#chain\">chapter six</a>.",
      min.length
        ? "One more question has an answer that is not in the folder: how many firms must "
          + "bid before a tender may proceed. The phrase below is the closest the "
          + "reference documents come, and it is about a different situation."
        : "One more question has no answer in the folder at all: how many firms must bid "
          + "before a tender may proceed. No page in the reference documents states a "
          + "minimum."),
    min.length ? el("div", { class: "prose" },
      min.map((m) => quote(m.text, m.file, m.page))) : null,
    findingsFor(a, index, ["F-RULES-01", "F-RULES-02", "F-RULES-03"]));
}

/* ---- chapter two: the clock ---- */
function clock(a, index) {
  const k = a.clock, o = k.open_days;
  const [vlo, vhi] = k.validity_band;
  const vrows = Object.entries(k.validity_days).map(([days, n]) => ({
    label: days, value: n, tick: true,
    color: +days > vhi || +days < vlo ? CAT[1] : SEQ[4],
    note: +days > vhi ? `longer than the ${vlo}–${vhi} day band the folder calls normal`
      : `inside the ${vlo}–${vhi} day band`,
  }));
  const nature = Object.entries(k.by_nature)
    .sort((x, y) => y[1].tenders - x[1].tenders)
    .map(([name, v]) => ({ label: name, value: v.median_days,
      note: `${num(v.tenders)} tenders`, color: SEQ[4] }));
  return band("clock", "Chapter two", "The clock",
    prose(
      "The first thing a notice fixes is time. A firm that hears about a tender late, or "
      + "that needs three weeks to assemble a bid and is given two, is out of the race "
      + "without anyone rejecting it.",
      `The typical tender in this archive was open for ${num(o.median)} days. `
      + `Half of the ${num(o.n)} that print both dates fall between ${num(o.q1)} and `
      + `${num(o.q3)} days; the shortest was ${num(o.min)} days and the longest `
      + `${num(o.max)}. Nothing in the folder sets a minimum for a national tender, so `
      + "these numbers can be compared with each other but not measured against a rule.",
      `One rule can be re-run from end to end. The reference documents say the tender `
      + "security must stay valid for a stretch beyond the closing date; every one of "
      + `the ${num(Object.values(k.security_margin_days).reduce((s, v) => s + v, 0))} `
      + "notices that print both dates clears it, and "
      + `${num(k.security_short_of_minimum)} fall short.`),
    plot({
      id: "fig-open-days",
      title: "How long bidding stayed open, by what was being bought",
      note: "Median days between the published date and closing. The three natures of "
        + "procurement are the ones the notices themselves print.",
      source: el("span", "Read from the tender notices; the underlying dates are in ",
        el("span", { class: "mono" }, "timeline.csv"), "."),
      build: (p) => barsH(p, { rows: nature, labelWidth: 230, valueLabel: "median days",
        fmt: (v) => `${num(v)} days` }),
      table: { columns: [{ key: "label", label: "Nature of procurement" },
        { key: "value", label: "Median days open", num: true },
        { key: "note", label: "Tenders" }], rows: nature, per: 5, filter: false,
      filename: "open_days_by_nature.csv" },
    }),
    plot({
      id: "fig-validity",
      title: "How long each tender asked its bidders to hold their price",
      note: `The standard tender document calls ${vlo} to ${vhi} days normal for a `
        + `national tender. ${num(k.validity_above_band)} notices print longer, and no `
        + "authorisation for the longer period is printed with them.",
      legend: legend([{ color: SEQ[4], label: `inside the ${vlo}–${vhi} day band` },
        { color: CAT[1], label: "longer than the band" }]),
      build: (p) => barsV(p, { rows: vrows, height: 250, valueLabel: "notices",
        labelPrefix: "validity", axisLabel: "days of tender validity, as printed" }),
      table: { columns: [{ key: "label", label: "Days of validity", num: true },
        { key: "value", label: "Notices", num: true },
        { key: "note", label: "Against the band", wrap: true }],
      rows: vrows, sort: "label", dir: "asc", per: 10, filter: false,
      filename: "validity_days.csv" },
    }),
    findingsFor(a, index, ["F-TIME-01", "F-TIME-02", "F-TIME-03", "F-TIME-04"]));
}

/* ---- chapter three: the amendments ---- */
function amendments(a, index) {
  const m = a.amendments;
  const dates = m.dates.map((d) => ({ label: d.field, from: d.median_days,
    to: d.longest_days, note: `${num(d.changes)} changes, all of them later` }));
  const fields = m.fields.slice()
    .sort((x, y) => y.listed - x.listed || y.value_changed - x.value_changed);
  const top = fields.slice(0, 12).map((f) => ({ label: f.field, from: f.value_changed,
    to: f.listed, note: f.listed === f.value_changed ? "every listing was a real change"
      : `${num(f.listed - f.value_changed)} listed with the same value on both sides` }));
  const pairs = Object.entries(m.clause_pairs);
  return band("amendments", "Chapter three", "What was rewritten after the starting gun",
    prose(
      `${num(m.notices_amended)} of the ${num(m.notices)} notices were amended after `
      + `publication, and ${num(m.with_a_change_table)} of those print a table of what `
      + `changed: the old value in one column, the new value in the next. `
      + `${num(m.changes_listed)} lines are printed across them. `
      + `${num(m.rows_with_no_change_in_value)} of those lines print the same value twice, `
      + "so the field was listed as amended without its value moving.",
      `Every one of the ${num(m.date_changes)} date changes moves the date later. `
      + `${num(m.moved_earlier)} move it earlier. For the `
      + `${num(m.tenders_whose_closing_date_moved)} tenders whose closing date moved, the `
      + `median tender gained ${num(m.net_days_added_median)} days; a bidding window that `
      + `was ${num(m.window_as_first_published)} days as first published became `
      + `${num(m.window_after_amendment)} days. Extending a deadline is ordinary and is `
      + "usually done because bidders asked for more time — but "
      + `${m.grounds_printed.length === 0 ? "no amendment in this archive prints a reason"
        : `only ${m.grounds_printed.length} of the ${num(m.notices_amended)} amended `
          + "notices print any reason at all"}.`),
    plot({
      id: "fig-amend-dates",
      title: "When a date moved, how far it moved",
      note: "The median move and the longest single move, for each date the change "
        + "tables list. One axis, in days; the four dates are the ones the portal's own "
        + "amendment form names.",
      legend: legend([{ color: CAT[0], label: "median move" },
        { color: CAT[1], label: "longest single move" }]),
      build: (p) => dumbbell(p, { rows: dates, labelWidth: 300,
        fromLabel: "median move (days)", toLabel: "longest move (days)" }),
      table: { columns: [{ key: "field", label: "Date" },
        { key: "changes", label: "Changes", num: true },
        { key: "moved_later", label: "Moved later", num: true },
        { key: "moved_earlier", label: "Moved earlier", num: true },
        { key: "median_days", label: "Median days", num: true },
        { key: "longest_days", label: "Longest move", num: true }],
      rows: m.dates, per: 6, filter: false, filename: "amendment_dates.csv" },
    }),
    plot({
      id: "fig-amend-fields",
      title: "Which parts of a notice were listed as amended, and how often the value "
        + "really changed",
      note: `The twelve most-listed fields of ${num(m.fields.length)}. The gap between `
        + "the two markers is the number of lines that print the same value in the old "
        + "column and the new one.",
      legend: legend([{ color: CAT[0], label: "value really changed" },
        { color: CAT[1], label: "listed in a change table" }]),
      build: (p) => dumbbell(p, { rows: top, labelWidth: 300,
        fromLabel: "value really changed", toLabel: "times listed" }),
      table: { columns: [{ key: "field", label: "Field" },
        { key: "listed", label: "Times listed", num: true },
        { key: "value_changed", label: "Value really changed", num: true }],
      rows: fields, sort: "listed", per: 26, filename: "amendment_fields.csv" },
    }),
    prose(`${num(m.eligibility_tenders)} tenders had a condition of entry rewritten after `
      + `the notice was published: ${pairs.map(([k, v]) => `${num(v)} ${k}`).join(", ")}. `
      + "A rewritten condition of entry is worth reading in full, because it changes who "
      + "is allowed to bid after some firms have already decided not to. The table below "
      + "prints the money figure on both sides of every such change and opens the page.",
    ),
    plot({
      id: "fig-amend-thresholds",
      title: "Every money threshold an amendment moved, old figure beside new",
      note: "Read straight from the change tables. Where the printed scale word is not "
        + "one the parser recognises, the sums are left unread and the row says so "
        + "rather than guessing which was meant.",
      build: (p) => p.append(dataTable({
        columns: [
          { key: "tender_id", label: "Tender" },
          { key: "figure_was", label: "Was" },
          { key: "figure_now", label: "Now" },
          { key: "direction", label: "Direction" },
          { key: "times", label: "Times", num: true,
            cell: (r) => (r.times === null ? "cannot be read" : `${num(r.times)}×`) },
          { key: "read", label: "What could be read", wrap: true },
          { key: "page", label: "Source",
            cell: (r) => cite(r.source_file, +r.page || null) },
        ],
        rows: m.thresholds, per: 10, filter: false,
        filename: "amendment_thresholds.csv",
        label: "Every money threshold an amendment moved, old figure beside new",
      })),
    }),
    findingsFor(a, index,
      ["F-AMEND-01", "F-AMEND-02", "F-AMEND-03", "F-AMEND-04", "F-AMEND-05"]));
}

/* ---- chapter four: the conditions of entry ---- */
function eligibility(a, index) {
  const e = a.eligibility;
  const order = ["RESTRICTIVE-LOOKING PATTERN", "HIGHLY SPECIFIC", "UNUSUAL",
    "COMMON", "UNDETERMINED"];
  const tally = order.filter((k) => e.tally[k] !== undefined).map((k, i) => ({
    label: k, value: e.tally[k], color: step(1 - i / (order.length - 1)),
    note: e.label_meaning[k],
  }));
  const shares = Object.entries(e.share_of_notices)
    .sort((x, y) => y[1] - x[1])
    .map(([k, v]) => ({ label: k.replace(/_/g, " "), value: v,
      color: step(v / 100), note: "share of the notices that print a clause of this kind" }));
  return band("eligibility", "Chapter four", "Who was allowed to enter",
    prose(
      "This is the part of a tender that decides the field before a single price is "
      + "opened. Each notice prints its conditions of entry as numbered clauses, and "
      + `this archive holds ${num(e.rows_count)} of them.`,
      "Reading them one at a time tells you very little. Reading all of them against "
      + "each other tells you which demands are the archive's normal and which are not. "
      + "That is all the labels below do: they compare a clause with the other "
      + `${num(e.rows_count)}. `
      + `A clause is marked UNUSUAL when one thing about it sits outside nine in ten of `
      + `its peers — more than ${num(e.years_cut)} years of experience, more than `
      + `${num(e.contract_count_cut)} past contracts, a turnover demand above `
      + `${taka(e.top_decile_cut.financial_turnover)} or a cash demand above `
      + `${taka(e.top_decile_cut.financial_liquid)}.`,
      "<b>None of these labels is an allegation.</b> A large, complex job needs a "
      + "capable contractor, and a demand that looks steep in the abstract may be "
      + "exactly right for the work. The labels mark where to look, not what was found.",
      `The largest group is the one that cannot be measured at all. ${num(e.tally.UNDETERMINED)} `
      + "clauses state no requirement a reader can check: they refer the bidder to the "
      + "tender document, which this portal does not publish. For those tenders the "
      + "condition of entry is, to the public and to this investigation, unknown."),
    plot({
      id: "fig-elig-tally",
      title: `How the ${num(e.rows_count)} printed conditions of entry compare with each other`,
      note: "Darker is further from the archive's own normal. Hover or focus any bar for "
        + "the rule that put a clause in that group.",
      build: (p) => barsH(p, { rows: tally, labelWidth: 250, valueLabel: "clauses" }),
      table: { columns: [{ key: "label", label: "Label" },
        { key: "value", label: "Clauses", num: true },
        { key: "note", label: "What the label means", wrap: true }],
      rows: tally, per: 5, filter: false, filename: "eligibility_labels.csv" },
    }),
    plot({
      id: "fig-elig-shares",
      title: "What the notices ask for, and how often",
      note: "Share of the tender notices that print at least one clause of each kind. A "
        + "notice usually prints several kinds, so these do not add to 100.",
      build: (p) => barsH(p, { rows: shares, labelWidth: 210, ticks: 4,
        valueLabel: "share of notices", fmt: (v) => pct(v) }),
      table: { columns: [{ key: "label", label: "Kind of requirement" },
        { key: "value", label: "Share of notices (%)", num: true }],
      rows: shares, sort: "value", per: 25, filename: "eligibility_shares.csv" },
    }),
    clauseExplorer(e),
    findingsFor(a, index, ["F-ELIG-01", "F-ELIG-02", "F-ELIG-03"]));
}

/* Every clause, searchable, with the page it is printed on. 3,239 rows is too much to
   send to a reader who did not ask for it, so it arrives when this is opened. */
function clauseExplorer(e) {
  return disclosure(`Read all ${num(e.rows_count)} conditions of entry, one clause per row`,
    () => {
      const box = el("div", el("p", { class: "loading" }, "Reading the clauses"));
      eligibilityRows().then((rows) => {
        clear(box);
        box.append(dataTable({
          columns: [
            { key: "tender_id", label: "Tender" },
            { key: "label", label: "Label", cell: (r) => chip(r.label) },
            { key: "categories", label: "Asks about", wrap: true,
              cell: (r) => r.categories.replace(/;/g, ", ").replace(/_/g, " ") },
            { key: "money_original", label: "Money as printed", wrap: true },
            { key: "text", label: "The clause, as printed", wrap: true },
            { key: "reasons", label: "Why this label", wrap: true,
              cell: (r) => (r.reasons || []).join("; ") },
            { key: "page", label: "Source",
              cell: (r) => cite(r.source_file, +r.page || null) },
          ],
          rows, per: 25, sort: "tender_id", dir: "asc",
          filename: "eligibility_criteria_filtered.csv",
          caption: "Filter by tender number, by label, or by any word in the clause.",
        }));
      }).catch((err) => { clear(box); box.append(el("p", { class: "warn" }, err.message)); });
      return box;
    });
}

/* ---- chapter five: the funnel ---- */
function drop(a, index) {
  const f = a.funnel, s = f.stages;
  const stages = [
    { label: "sets of tender documents sold", value: s.documents_sold,
      note: "a firm that buys the documents has declared an interest in bidding" },
    { label: "bids received", value: s.bids_received,
      note: "as counted on the award notices themselves" },
    { label: "bids recorded responsive", value: s.bids_responsive,
      note: "the count the award notice prints; which bids they were is not printed" },
    { label: "contracts signed", value: s.contracts_signed,
      note: "one contract per award notice that prints a count" },
  ];
  /* One hue, light to dark, keyed to the number on the axis: no bids set aside is the
     lightest step and the 54-bid tender the darkest. The zero bar is not lifted out of
     the ramp, because a mid-ramp step on it would read as a middling number of bids set
     aside; what it means is spelled out in its own hover note instead. */
  const aside = Object.entries(f.set_aside_distribution)
    .map(([k, v]) => ({ label: k, value: v, tick: +k < 12,
      color: step(Math.min(1, +k / 11)),
      note: +k === 0 ? "every bid that arrived was recorded responsive"
        : `${k} bid${+k === 1 ? "" : "s"} arrived and was not recorded responsive` }))
    .sort((x, y) => +x.label - +y.label);
  const worst = aside[aside.length - 1];
  return band("funnel", "Chapter five", "Where the bids dropped out",
    prose(
      "Now the race itself. An award notice in this archive prints three counts and no "
      + "names: how many sets of documents were sold, how many bids arrived, and how many "
      + "were responsive. Responsive means the bid was complete and conforming enough to "
      + `be considered. ${num(f.notices_with_counts)} awards print these counts; `
      + `${num(f.notices_without_counts)} print none.`,
      `Read together they make a funnel. ${num(s.documents_sold)} sets of documents were `
      + `bought. ${num(s.bids_received)} bids came back — `
      + `${num(s.documents_sold - s.bids_received)} firms bought the papers and did not `
      + `bid. ${num(s.bids_responsive)} bids were recorded responsive, so `
      + `${num(s.bids_received - s.bids_responsive)} were set aside. `
      + `${num(s.contracts_signed)} contracts were signed.`,
      "<b>The middle step is the one to look at, and it is the one the archive cannot "
      + `explain.</b> ${num(s.bids_received - s.bids_responsive)} bids were set aside and `
      + "not a single document in this folder gives a reason for any of them. A bid can be "
      + "set aside for entirely proper reasons — a missing signature, an expired licence, "
      + "an arithmetic error in the price schedule. The point is not that the reasons are "
      + "bad. The point is that they are not published, so nobody outside the evaluation "
      + "room can tell a proper reason from an improper one.",
      `In ${num(f.one_responsive)} of those awards exactly one bid was left standing. In `
      + `${num(f.one_bid_received)} only one bid ever arrived, which is a different `
      + "situation with a different explanation, and the two are counted separately here."),
    plot({
      id: "fig-funnel", wide: true,
      title: "From interest to contract, across every award that prints its counts",
      note: "Bars against a common baseline rather than a tapering ribbon, so each step "
        + "can be read as a number. The label above each bar is how many were lost at "
        + "that step.",
      source: el("span", "Counted from the award notices; every count is in ",
        el("span", { class: "mono" }, "bids.csv"), " with the page it was read from."),
      build: (p) => funnel(p, { rows: stages, valueLabel: "count" }),
      table: { columns: [{ key: "label", label: "Step" },
        { key: "value", label: "Count", num: true },
        { key: "note", label: "What the step means", wrap: true }],
      rows: stages, per: 4, filter: false, filename: "funnel_stages.csv" },
    }),
    plot({
      id: "fig-set-aside",
      title: "How many bids were set aside in a single tender",
      note: `Each bar is a number of tenders. The far right of the axis is a single `
        + `tender in which ${worst.label} bids arrived and were not recorded responsive, `
        + "the most in the archive; no document in the folder says why any of them was "
        + "set aside.",
      build: (p) => barsV(p, { rows: aside, height: 260, valueLabel: "tenders",
        labelPrefix: "bids set aside:",
        axisLabel: "bids that arrived and were not recorded responsive" }),
      table: { columns: [{ key: "label", label: "Bids set aside", num: true },
        { key: "value", label: "Tenders", num: true },
        { key: "note", label: "Reading", wrap: true }],
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
  const rows = c.by_label.map((r) => ({ label: r.label, from: r.median_responsive,
    to: r.median_received, tenders: r.tenders,
    share_one_responsive: r.share_one_responsive,
    share_dropped_someone: r.share_dropped_someone,
    median_received: r.median_received, median_responsive: r.median_responsive,
    note: `${num(r.tenders)} tenders; one responsive in ${pct(r.share_one_responsive)}` }));
  const one = rows.map((r) => ({ label: r.label, value: r.share_one_responsive,
    color: step(r.share_one_responsive / 100),
    note: `${num(r.tenders)} tenders carry this as their strongest clause` }));
  const t = c.tests;
  const test = (x) => `${num(x.strong)} of ${num(x.strong_of)} (${pct(x.strong_share)}) `
    + `against ${num(x.other)} of ${num(x.other_of)} (${pct(x.other_share)}), `
    + `p = ${x.p_two_sided}`;
  return band("chain", "Chapter six", "The rule of entry, against the result",
    prose(
      "Chapter four showed which conditions of entry stand out. Chapter five showed where "
      + "bids disappeared. This chapter puts them side by side for the "
      + `${num(c.tenders_with_counts)} tenders that have both: a printed condition of `
      + "entry and printed counts of who bid.",
      "If a stiff condition of entry thinned the field, tenders with the stiffest clauses "
      + "should show fewer bidders and more bids set aside. In this archive they do lean "
      + "that way — and <b>the lean is not large enough to be distinguished from chance "
      + "at this sample size.</b> Both tests are printed below with their p-values so a "
      + "reader can see exactly how weak the signal is.",
      `Whether at least one bid was set aside: ${test(t.dropped_someone)}. `
      + `Whether exactly one bid remained responsive: ${test(t.one_responsive)}. `
      + "Neither reaches the conventional threshold. The strongest-clause group holds only "
      + `${num(t.dropped_someone.strong_of)} tenders, which is too few to settle the `
      + "question either way. <b>This investigation does not claim that unusual conditions "
      + "of entry reduced competition in this archive.</b> It claims that the archive "
      + "cannot answer the question, and shows the arithmetic."),
    plot({
      id: "fig-chain-bids",
      title: "Bids that arrived and bids that survived, grouped by the strongest "
        + "condition of entry in the notice",
      note: "Median counts per tender. One axis, in bids. The gap between the markers is "
        + "the median number of bids set aside in that group.",
      legend: legend([{ color: CAT[0], label: "median bids recorded responsive" },
        { color: CAT[1], label: "median bids received" }]),
      build: (p) => dumbbell(p, { rows, labelWidth: 250,
        fromLabel: "median responsive", toLabel: "median received" }),
      table: { columns: [{ key: "label", label: "Strongest clause in the notice" },
        { key: "tenders", label: "Tenders", num: true },
        { key: "median_received", label: "Median received", num: true },
        { key: "median_responsive", label: "Median responsive", num: true },
        { key: "share_one_responsive", label: "One responsive (%)", num: true },
        { key: "share_dropped_someone", label: "Someone set aside (%)", num: true }],
      rows, per: 6, filter: false, filename: "chain_by_label.csv" },
    }),
    plot({
      id: "fig-chain-one",
      title: "Share of tenders that ended with exactly one responsive bid",
      note: `Across all ${num(c.tenders_with_counts)} tenders with counts, `
        + `${num(c.labelled)} could be grouped by their strongest clause. The differences `
        + "between these bars are within the range chance produces at these group sizes.",
      build: (p) => barsH(p, { rows: one, labelWidth: 250, max: 100, ticks: 4,
        valueLabel: "share of tenders", fmt: (v) => pct(v) }),
      table: { columns: [{ key: "label", label: "Strongest clause" },
        { key: "value", label: "One responsive bid (%)", num: true },
        { key: "note", label: "Group size", wrap: true }],
      rows: one, per: 6, filter: false, filename: "chain_one_responsive.csv" },
    }),
    bandFigures(c),
    prose(`${num(c.unreadable_figures.clauses)} clauses print a money figure this pipeline `
      + `cannot resolve into a number, across ${c.unreadable_figures.notices.length} `
      + "notices — a scale word that is not a scale word, a figure with no unit, a number "
      + "split across a line break. They are excluded from every ratio above and listed "
      + "in the methodology rather than guessed at."),
    findingsFor(a, index, ["F-CHAIN-01", "F-CHAIN-02"]));
}

/* The only two conditions of entry the folder puts a recommended size on. Each dot is
   one tender: what it demanded, divided by the contract it eventually signed. */
function bandFigures(c) {
  const box = el("div");
  for (const [id, b] of Object.entries(c.bands)) {
    box.append(el("div", { class: "prose" },
      el("h3", `${b.reads_on[0].toUpperCase()}${b.reads_on.slice(1)}`),
      el("p", "The standard tender document in this folder recommends a size for this "
        + `requirement: between ${pct(b.band_low * 100)} and ${pct(b.band_high * 100)} of `
        + "the estimated cost of the work. The estimate is not published, so the contract "
        + "value that was actually signed is used in its place — a substitute, and a "
        + "reader should hold it as one: a contract signed below the estimate makes the "
        + "ratio look higher than the drafters meant, and a contract signed above it makes "
        + "the ratio look lower."),
      quote(b.quote, b.file, b.page),
      el("p", `${num(b.tenders)} tenders print both the demand and a signed value. The `
        + `median demanded ${b.median}× the contract value. ${num(b.within_band)} sit `
        + `inside the recommended band; ${num(b.above_band)} (${pct(b.above_band_share)}) `
        + `sit above it, the highest at ${b.max}×.`)));
    box.append(plot({
      id: `fig-band-${id.toLowerCase()}`, wide: true,
      title: `${b.reads_on}: what each tender demanded, against the contract it signed`,
      note: "One dot per tender, stacked where dots would overlap. The shaded strip is "
        + "the band the standard tender document recommends. Dots to the right of it "
        + `demanded more than recommended; the axis stops at 2× and the `
        + `${num(b.all_ratios.filter((x) => x > 2).length)} tenders beyond it are stacked `
        + "in the last column.",
      source: el("span", "Demands read from the eligibility clauses; contract values from "
        + "the award notices. The five highest open their pages below."),
      build: (p) => bandStrip(p, { values: b.all_ratios, bandLow: b.band_low,
        bandHigh: b.band_high, median: b.median, cap: 2, bin: 0.05,
        bandLabel: `the band the folder recommends (${pct(b.band_low * 100)}–${pct(b.band_high * 100)})` }),
      table: { columns: [{ key: "tender_id", label: "Tender" },
        { key: "demanded", label: "Demanded", num: true, cell: (r) => taka(r.demanded) },
        { key: "contract_value", label: "Contract signed", num: true,
          cell: (r) => taka(r.contract_value) },
        { key: "ratio", label: "Times the contract value", num: true,
          cell: (r) => `${Math.round(r.ratio * 100) / 100}×` },
        { key: "source_file", label: "Source",
          cell: (r) => cite(r.source_file, null) }],
      rows: b.highest, per: 5, filter: false,
      filename: `${id.toLowerCase()}_highest.csv`,
      caption: "The five tenders that demanded the most, relative to the contract signed." },
    }));
  }
  return box;
}

/* ---- chapter seven: how the tenders ended ---- */
function outcomes(a, index) {
  const o = a.outcomes;
  const rows = o.by_status.map((r) => ({ ...r, label: r.status === "(not printed)"
    ? "no status printed" : r.status, value: r.tenders, color: SEQ[4],
  note: r.with_award_notice
    ? `${num(r.with_award_notice)} have an award notice in this archive (${pct(r.share_with_award_notice)})`
    : "no award notice in this archive for any of them" }));
  return band("outcomes", "Chapter seven", "How the tenders ended",
    prose(
      `Each notice carries a status. ${num(o.notices)} notices print one, and the archive `
      + `holds ${num(o.award_notices)} award notices to check them against.`,
      `${num(o.said_awarded_without_award_notice)} notices say a contract was awarded and `
      + "no award notice for them is in this folder. That is a gap in what was collected, "
      + "or a gap in what was published; from inside the archive the two cannot be told "
      + `apart. One award notice runs the other way: it names a tender whose notice is not `
      + "here at all.",
      `${num(o.ended_without_a_contract)} tenders ended without a contract — re-tendered, `
      + "cancelled, rejected, or still being processed. The documents give no reason for "
      + "any of these outcomes either."),
    plot({
      id: "fig-outcomes",
      title: "The status each notice prints, and whether an award notice backs it up",
      note: "Hover or focus a bar for how many tenders in that status have an award "
        + "notice in this archive.",
      build: (p) => barsH(p, { rows, labelWidth: 230, valueLabel: "tenders" }),
      table: { columns: [{ key: "status", label: "Status as printed" },
        { key: "tenders", label: "Tenders", num: true },
        { key: "with_award_notice", label: "With an award notice here", num: true },
        { key: "share_with_award_notice", label: "Share (%)", num: true }],
      rows: o.by_status, sort: "tenders", per: 10, filter: false,
      filename: "outcomes_by_status.csv" },
    }),
    findingsFor(a, index, ["F-OUT-01", "F-OUT-02"]));
}

/* ---- chapter eight: the money ---- */
function money(a, index) {
  const m = a.money;
  const short = (s) => (s.length > 44 ? `${s.slice(0, 42).replace(/[\s,(]+$/, "")}…` : s);
  const rows = m.top_ten.map((r, i) => ({ label: short(r.name), value: r.taka,
    color: step(1 - i / (m.top_ten.length - 1)), name: r.name, contracts: r.contracts,
    taka: r.taka, note: `${r.name} — ${num(r.contracts)} contract`
      + `${r.contracts === 1 ? "" : "s"}, ${exact(r.taka)}` }));
  const half = m.firms_taking_half;
  return band("money", "Chapter eight", "The money, and who received it",
    prose(
      `${num(m.companies)} firms are named as winners across this archive, and the awards `
      + `total ${taka(m.total_taka)} of taka — ${exact(m.total_taka)} as the notices print `
      + "it.",
      `${num(half)} firm${half === 1 ? "" : "s"} account for half of that money. `
      + `${num(m.won_more_than_one)} firms won more than one contract, and `
      + `${num(m.firms_across_more_than_one_entity)} won work from more than one procuring `
      + "entity. Concentration on its own says nothing about how it came about: there may "
      + "be very few firms in Bangladesh able to build a fourteen-storey structure, and "
      + "the same few will win that work wherever it is tendered.",
      "The names below are printed in the government's own award notices. They are "
      + "reproduced exactly as printed, including the joint-venture partner shares, "
      + "because the printed string is what can be checked against the page."),
    plot({
      id: "fig-money",
      title: "The ten firms with the largest total of signed contracts",
      note: "Names are shortened here to fit the axis and printed in full in the table "
        + "below. Hover or focus a bar for the full printed name and the exact sum.",
      source: el("span", "Read from the award notices; every row is in ",
        el("span", { class: "mono" }, "companies.csv"), " with the tenders it came from."),
      build: (p) => barsH(p, { rows, labelWidth: 260, rightPad: 96,
        valueLabel: "signed contracts", fmt: (v) => taka(v) }),
      table: { columns: [{ key: "name", label: "Firm, exactly as printed", wrap: true },
        { key: "contracts", label: "Contracts", num: true },
        { key: "taka", label: "Total signed", num: true, cell: (r) => exact(r.taka) }],
      rows: m.top_ten, sort: "taka", per: 10, filter: false,
      filename: "top_ten_by_value.csv",
      caption: "The joint ventures are printed with their partner shares, as the award "
        + "notices print them." },
    }),
    findingsFor(a, index, ["F-MONEY-01", "F-MONEY-02"]));
}

/* ---- chapter nine: the connections ----
   No chart. Ten groups of firms sharing an address is a list of names and pages; a
   network diagram of ten nodes would hide the names to show the shape. */
function connections(a, index) {
  const c = a.connections;
  return band("connections", "Chapter nine", "What connects the firms",
    prose(
      "Procurement investigations usually turn on ownership: the same person behind two "
      + "firms that bid against each other, a director who also sits on the buying side. "
      + "<b>This archive cannot support that kind of finding, and it is important to say "
      + `so plainly.</b> Only ${num(c.firms_declaring_an_owner)} of the ${num(c.firms)} `
      + `firms declare an owner anywhere in these documents. ${num(c.people_named)} people `
      + `are named as owners, and ${num(c.people_owning_more_than_one_firm)} of them is `
      + "named as the owner of more than one firm. There is no company register in this "
      + "folder, so for the other firms ownership is simply not in evidence.",
      `What the documents do print is addresses. ${num(c.addresses_shared)} addresses are `
      + "printed for more than one named firm. A shared address is a question, not an "
      + "answer: firms share buildings, agents and accountants, and a joint venture "
      + "naturally prints one address for both partners. Each group below is marked for "
      + "whether a joint venture explains it.",
      `A further caution about names. ${num(c.name_pairs)} pairs of firm names in this `
      + "archive resemble each other closely enough that they might be the same firm "
      + `spelled two ways. ${num(c.name_pairs_merged)} of them were merged. Merging names `
      + "on resemblance would invent relationships that the documents do not state, so "
      + "every printed name is kept as its own record and the resembling pairs are "
      + "published as a table for a reader to judge."),
    el("div", { class: "prose" },
      el("h3", "The addresses printed for more than one firm"),
      el("ol", { class: "groups" }, c.address_groups.map((g) =>
        el("li",
          el("h4", g.address,
            el("span", { class: "note" }, g.involves_a_joint_venture === "yes"
              ? "a joint venture accounts for this grouping"
              : "no joint venture printed among these firms")),
          el("ul", g.firms.map((n) => el("li", n))))))),
    findingsFor(a, index, ["F-CONN-01", "F-CONN-02", "F-CONN-03"]));
}

/* ---- chapter ten: the per-tender ledger ---- */
function signals(a, index) {
  const s = a.signals;
  const defs = s.definitions.map((d) => ({ ...d,
    label: d.short, value: s.by_signal[d.id] || 0, color: step((s.by_signal[d.id] || 0)
      / Math.max(...Object.values(s.by_signal))), note: d.means }));
  /* Same rule as the set-aside chart: the ramp runs monotonically with the number on
     the axis, so none is the lightest step rather than a mid one. */
  const dist = Object.entries(s.distribution).map(([k, v]) => ({ label: k, value: v,
    tick: true, color: step(+k / 4),
    note: +k === 0 ? "nothing on this list applies to these tenders"
      : `${k} of the ${num(s.definitions.length)} observations apply` }));
  return band("signals", "Chapter ten", "What to look at, tender by tender",
    prose(
      "Everything above is the archive in aggregate. An editor works the other way round, "
      + "one tender at a time, and needs to know which ones repay the effort. "
      + `${num(s.definitions.length)} of the observations in this investigation can be `
      + `checked mechanically against every tender, and the ledger below records which of `
      + `them apply to each of the ${num(s.rows_count)} tenders.`,
      "<b>These are questions to ask, not findings.</b> Every one of them has an innocent "
      + "explanation available, and for most tenders the innocent explanation is almost "
      + "certainly the right one. A tender carrying three or four of them is not thereby "
      + "suspect; it is simply the one an editor should open first, because there is more "
      + "in the record to check.",
      `${num(Object.entries(s.distribution).filter(([k]) => +k > 0)
        .reduce((t, [, v]) => t + v, 0))} tenders carry at least one. `
      + `${num(s.distribution["0"] || 0)} carry none.`),
    plot({
      id: "fig-signals",
      title: "How often each observation applies",
      note: "Each bar is a count of tenders. Hover or focus a bar for the exact test that "
        + "was applied.",
      build: (p) => barsH(p, { rows: defs, labelWidth: 280, valueLabel: "tenders" }),
      table: { columns: [{ key: "id", label: "Code" },
        { key: "short", label: "Observation" },
        { key: "value", label: "Tenders", num: true },
        { key: "means", label: "The test, exactly", wrap: true }],
      rows: defs, sort: "value", per: 10, filter: false, filename: "signals.csv" },
    }),
    plot({
      id: "fig-signal-dist",
      title: "How many of the ten apply to a single tender",
      build: (p) => barsV(p, { rows: dist, height: 220, valueLabel: "tenders",
        labelPrefix: "carrying", axisLabel: "observations that apply to one tender" }),
      table: { columns: [{ key: "label", label: "Observations that apply", num: true },
        { key: "value", label: "Tenders", num: true },
        { key: "note", label: "Reading", wrap: true }],
      rows: dist, sort: "label", dir: "asc", per: 6, filter: false,
      filename: "signals_per_tender.csv" },
    }),
    ledger(s),
    findingsFor(a, index, ["F-SIGNAL-01"]));
}

/* The ledger itself: one row per tender, fetched when a reader opens it. */
function ledger(s) {
  return disclosure(`Open the ledger: all ${num(s.rows_count)} tenders, one row each`,
    () => {
      const box = el("div", el("p", { class: "loading" }, "Reading the ledger"));
      signalRows().then((rows) => {
        clear(box);
        box.append(dataTable({
          columns: [
            { key: "tender_id", label: "Tender" },
            { key: "count", label: "Observations", num: true },
            { key: "signals", label: "Which ones", wrap: true,
              cell: (r) => (r.signals || []).map((id) => chip(id, {
                short: (s.definitions.find((d) => d.id === id) || {}).short || id })) },
            { key: "strongest_clause", label: "Strongest clause",
              cell: (r) => (r.strongest_clause ? chip(r.strongest_clause) : "none printed") },
            { key: "open_days", label: "Days open", num: true },
            { key: "status", label: "Status" },
            { key: "procuring_entity", label: "Procuring entity", wrap: true },
            { key: "district", label: "District" },
            { key: "notice_file", label: "Notice",
              cell: (r) => (r.notice_in_archive === "yes" ? cite(r.notice_file, 1)
                : el("span", { class: "note" }, "not in this archive")) },
          ],
          rows, per: 25, sort: "count",
          filename: "per_tender_ledger_filtered.csv",
          caption: "Filter by tender number, district, procuring entity, status or "
            + "observation code. Sort by the observation count to bring the fullest "
            + "records to the top.",
        }));
      }).catch((err) => { clear(box); box.append(el("p", { class: "warn" }, err.message)); });
      return box;
    });
}

/* ---- how it was done ---- */
function methodology(a, au) {
  const c = a.dataset_counts;
  const ds = au.district_spelling_evidence || {};
  const spellings = Object.keys(ds.district_spellings || {}).length;
  const stages = [
    ["01_inventory.py", "walks the project folder and lists every PDF in it, with its "
      + "size and checksum, before anything is read. A document that cannot be opened "
      + "is recorded as unreadable rather than dropped."],
    ["02_extract.py", "reads every page of every PDF twice, with two different "
      + "extractors, and records whether the two agree. Where a page is laid out in "
      + "columns the change table is read by word coordinates instead of linearly."],
    ["03_dataset.py", "turns the extracted text into the eighteen tables, keeping the "
      + "original printed string beside every value it normalises."],
    ["03_audit.py", `re-checks the tables against the extracted text: `
      + `${au.checks_run} checks, ${au.checks_failed.length} of them failing. It also `
      + `compares ${num(au.award_cells_compared_with_the_earlier_parser)} award cells `
      + "against an earlier independent parser of the same PDFs."],
    ["04_analysis.py", "does every calculation on this site and writes them, with the "
      + "arithmetic printed beside each one, to analysis.json."],
    ["05_evidence.py", "walks back from every finding to the page it rests on and reads "
      + "the value off that page again, to catch a number that drifted between stages."],
    ["06_search.py", "builds the search index and the per-document page files."],
    ["split_payload.py", "lifts the two long row lists out of analysis.json so opening "
      + "the article does not download them."],
  ];
  return band("methodology", "Behind the work", "How this was made",
    prose(
      "Every number on this site was produced by a script in "
      + "<span class=\"mono\">investigation/parser/</span>, run over the PDFs in this "
      + "folder and nothing else. No external dataset, no register, no news report and no "
      + "prior knowledge has been used, and there is no hand-entered statistic anywhere in "
      + "the site: each figure is read out of the pipeline's own output when the page "
      + "loads, so a change upstream changes the sentence.",
      `The tables were rebuilt in ${c.seconds} seconds from `
      + `${num(c.documents)} documents into ${c.tables.length} CSVs, `
      + `${num(c.master_rows)} rows of master dataset, ${num(c.relationships)} recorded `
      + `links and ${num(c.timeline_events)} dated events.`),
    el("ol", { class: "prose stages" }, stages.map(([f, what]) =>
      el("li", el("span", { class: "mono" }, f), " ", el("span", what)))),
    prose(
      `<b>Normalising without losing the original.</b> ${num(c.normalisations_applied)} `
      + `values were normalised under ${c.normalisation_rules.length} rules, and `
      + `${num(c.normalisations_logged)} of them are logged individually with the original `
      + "string, the new value, the rule and the page. The rules are "
      + `${c.normalisation_rules.join(", ")}. Nothing is normalised silently.`,
      `<b>Names were not merged on resemblance.</b> ${num(c.name_candidate_pairs)} pairs of `
      + `names in this archive look alike; ${num(c.names_merged_on_resemblance)} were `
      + "merged. Two firms with similar names may be one firm or two, and this folder "
      + "holds no register that could settle it. The pairs are published as a table so a "
      + "reader with better information can judge them.",
      `<b>Place names likewise.</b> The documents print ${num(spellings)} district `
      + `spellings, and ${(ds.offices_printing_more_than_one || []).length} offices print `
      + "more than one spelling for their own district. None has been merged, for the same "
      + "reason: the only evidence permitted here is the archive, and the archive prints "
      + "both.",
      "<b>Where two extractors disagreed</b> the disagreement is recorded on the "
      + "document's own row rather than resolved by preference, and the document browser "
      + "prints it. Every page of extracted text is published exactly as the parser read "
      + "it, mistakes and all, so a reader can see what the numbers were read from.",
      `<b>Blank cells are explained, not left blank.</b> The audit records a reason for `
      + `every column that has any empty cell — ${num(Object.values(au.blank_reasons)
        .reduce((t, cols) => t + Object.keys(cols).length, 0))} columns across the `
      + "eighteen tables — so an empty cell can be told from a missing document."),
    disclosure("Read the audit's own notes, exactly as it wrote them", () =>
      el("ul", { class: "prose" }, au.notes.map((n) => el("li", n)))));
}

/* ---- what this cannot tell you ----
   Written as flatly as possible. A limitations section that reads like a disclaimer is
   a limitations section nobody reads. */
function limits(a) {
  const c = a.dataset_counts, o = a.outcomes, ch = a.chain;
  const items = [
    ["No document says why any bid was set aside.",
      `${num(a.funnel.stages.bids_received - a.funnel.stages.bids_responsive)} bids were `
      + "set aside across this archive and the folder holds no rejection letter, no "
      + "evaluation report and no committee minute. Any statement about why a bid failed "
      + "would be invention."],
    ["Losing bidders are not named.",
      `${num(c.bidder_level_records_in_archive)} documents here name a firm that bid and `
      + "did not win. Who competed for a tender cannot be established from this archive — "
      + "only how many did."],
    ["The estimate is not published.",
      "Two rules in the folder size a requirement against the estimated cost of the work. "
      + "No notice prints that estimate, so the contract value signed is used in its "
      + "place throughout. Every ratio on this site inherits that substitution."],
    ["The standard tender document here is a draft.",
      "The copy in this folder is marked on its own first page as a preliminary working "
      + "draft, and no notice in the archive names the standard document it was written "
      + "from. The rules quoted describe the procedure as the supplied copies state it, "
      + "not the procedure proved to have governed any particular tender."],
    [`${num(a.eligibility.tally.UNDETERMINED)} conditions of entry cannot be read at all.`,
      "They refer the bidder to a tender document the portal does not publish. Every "
      + "comparison of conditions of entry on this site is therefore a comparison of the "
      + "conditions that were published, not of all the conditions that applied."],
    ["The strongest-clause groups are small.",
      `The two tests in chapter six compare ${num(ch.tests.dropped_someone.strong_of)} `
      + "tenders against "
      + `${num(ch.tests.dropped_someone.other_of)}. Neither reaches significance, and no `
      + "amount of care in the arithmetic can make a group of that size settle the "
      + "question."],
    [`${num(o.said_awarded_without_award_notice)} awarded tenders have no award notice here.`,
      "Their money, their winner and their bid counts are missing from every total on "
      + "this site. Whether the notice was never published or simply not collected cannot "
      + "be told from inside the archive."],
    [`${num(ch.unreadable_figures.clauses)} money figures could not be read.`,
      "A scale word that is not a scale word, a figure with no unit, a number broken "
      + "across a line. They are excluded from the ratios rather than guessed at, and the "
      + `${ch.unreadable_figures.printed_strings.length} printed strings are listed below `
      + "so a reader can see exactly what defeated the parser."],
    ["Ownership is almost entirely absent.",
      `${num(a.connections.firms_declaring_an_owner)} of ${num(a.connections.firms)} firms `
      + "declare an owner anywhere in these documents, and no company register is in the "
      + "folder. Shared addresses are the only connection the documents themselves print."],
    ["This is one buyer, not a country.",
      "The archive is the work of Chattogram Development Authority as published on the "
      + "portal. Nothing here supports a statement about Bangladeshi public procurement "
      + "in general, and none is made."],
  ];
  return band("limits", "The honest part", "What this investigation cannot tell you",
    prose("Every one of these is a limit of the documents, not of the analysis. They are "
      + "listed first-class rather than in a footnote because an editor needs them before "
      + "deciding what can be published."),
    el("ol", { class: "prose limits" }, items.map(([head, detail]) =>
      el("li", el("h4", head), el("p", detail)))),
    disclosure(`The ${ch.unreadable_figures.printed_strings.length} money figures the `
      + "parser could not read, exactly as printed", () =>
      el("div", { class: "prose" },
        el("ul", { class: "mono strings" },
          ch.unreadable_figures.printed_strings.map((s) => el("li", s))),
        el("p", { class: "note" }, "Printed in "
          + `${ch.unreadable_figures.notices.length} notices: `
          + `${ch.unreadable_figures.notices.join(", ")}.`))));
}

/* ---- the order the story is told in ---- */
export const CHAPTERS = [
  ["summary", "What these documents show"],
  ["how-to-read", "How to read this investigation"],
  ["rules", "One · The rules of the race"],
  ["clock", "Two · The clock"],
  ["amendments", "Three · What was rewritten"],
  ["eligibility", "Four · Who was allowed to enter"],
  ["funnel", "Five · Where the bids dropped out"],
  ["chain", "Six · The rule of entry, against the result"],
  ["outcomes", "Seven · How the tenders ended"],
  ["money", "Eight · The money"],
  ["connections", "Nine · What connects the firms"],
  ["signals", "Ten · What to look at, tender by tender"],
];

/* The half of the site that exists so a reader does not have to take the other half
   on trust. It sits after the story on the page and before the methodology. */
export const TOOLS = [
  ["search", "Search every word in the archive"],
  ["entities", "Every name the archive prints"],
  ["network", "Follow one printed line at a time"],
  ["documents", "Open any document, page by page"],
  ["tables", "Every table, open to read"],
  ["downloads", "Take the whole dataset away"],
];

export const TAIL = [
  ["methodology", "How this was made"],
  ["limits", "What this cannot tell you"],
];

function contents() {
  return el("nav", { class: "band contents", "aria-label": "the chapters of this story" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, "The story, in order"),
      el("ol", CHAPTERS.map(([id, label]) =>
        el("li", el("a", { href: `#${id}` }, label)))),
      el("p", { class: "kicker" }, "Then check it yourself"),
      el("ol", { class: "cont-tools" }, [...TOOLS, ...TAIL].map(([id, label]) =>
        el("li", el("a", { href: `#${id}` }, label))))));
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
