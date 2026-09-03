/* e-GP WATCH — the rules tab: eighteen tests, shown so they can be argued with.
   ------------------------------------------------------------------
   This tab exists because a deviation count is worthless on its own. For each
   test it shows the clause as it is worded in the standard document, which file
   and page that wording came from, how much weight the clause carries, what
   was actually compared, how many tenders deviated, and — first, not buried —
   the limit on the finding.

   Two of those matter more than the count. FORCE distinguishes a "shall" from a
   recommended band, and SCOPE records which standard document the clause was
   found in relative to the tender it is applied to. Where the clause postdates
   the tender, the row says so. A reader who disagrees with a test can see
   exactly what it did and dismiss it, which is the point. */

import { el, t, n, pct, cr, digits, dash, fill, href, human, cite } from "./core.js";
import { figure, table, barsH, columns, hue, SEQ } from "./charts.js";
import { UI, LABELS, RULE_TITLES } from "./content.js";

const W = {
  intro: {
    en: "{{counts.rules|n}} rules, drawn only from the standard tender documents in this folder, tested against every tender they could apply to. Open any one to see the clause, the test, the count and the limit.",
    bn: "এই ফোল্ডারের আদর্শ দরপত্র দস্তাবেজ থেকে নেওয়া {{counts.rules|n}}টি নিয়ম, প্রযোজ্য প্রতিটি দরপত্রে পরীক্ষা করা হয়েছে। যেকোনোটি খুললে ধারা, পরীক্ষা, গণনা ও সীমা দেখা যাবে।",
  },
  clause: { en: "Clause", bn: "ধারা" },
  weight: { en: "Weight of the clause", bn: "ধারার ওজন" },
  basis: { en: "Basis in the documents", bn: "নথিতে ভিত্তি" },
  severity: { en: "Severity, as classified here", bn: "গুরুত্ব, এখানে যেভাবে শ্রেণিবদ্ধ" },
  quote: { en: "The clause, as printed", bn: "ধারাটি, যেভাবে ছাপা" },
  test: { en: "What was compared", bn: "কী মিলিয়ে দেখা হয়েছে" },
  limit: { en: "The limit on this finding", bn: "এই ফলাফলের সীমা" },
  outcomes: { en: "Outcomes", bn: "ফলাফল" },
  byAgency: { en: "Deviations by authority", bn: "সংস্থা অনুযায়ী বিচ্যুতি" },
  scope: { en: "Which standard document the clause came from", bn: "ধারাটি কোন আদর্শ দস্তাবেজ থেকে" },
  sample: { en: "Examples from the data", bn: "ডেটা থেকে উদাহরণ" },
  observed: { en: "What the document shows", bn: "নথিতে যা আছে" },
  required: { en: "What the clause asks for", bn: "ধারা যা চায়" },
  worked: { en: "A worked example", bn: "একটি বিশ্লেষিত উদাহরণ" },
  timing: { en: "Rows citing a clause dated after the event", bn: "ঘটনার পরের তারিখের ধারা উদ্ধৃত করা সারি" },
  noDev: { en: "No deviation is scored for this test.", bn: "এই পরীক্ষায় কোনো বিচ্যুতি ধরা হয়নি।" },
};
/* ------------------------------------------------------------------ helpers */

function lab(map, key) {
  const m = LABELS[map] || {};
  return m[key] === undefined ? human(key) : t(m[key]);
}

/** A labelled key-value line. Used for the four attributes that decide how much
    a deviation count is worth, so they read the same on every rule. */
function kv(k, v) {
  return [el("dt", { text: t(k) }), el("dd", null, v)];
}

/* ------------------------------------------------------------------ one rule */

function ruleBlock(r, corpus) {
  const body = [];

  /* The four attributes that govern the count, before the count. */
  body.push(el("dl", { class: "kv" }, [
    ...kv(W.clause, [
      el("span", { text: r.clause }),
      el("br"),
      el("span", { class: "src" }, cite({
        printed: r.printed_page, pdf: r.pdf_page, file: r.source_file,
      })),
    ]),
    ...kv(W.weight, el("span", { class: "pill pill-dev", text: lab("force", r.force) })),
    ...kv(W.basis, el("span", { text: lab("certainty", r.certainty) })),
    ...kv(W.severity, el("span", { text: lab("severity", r.severity) })),
  ]));

  /* The clause itself, as printed, spelling and all. */
  body.push(el("div", { class: "exhibit" }, [
    el("p", { class: "exhibit-label", text: t(W.quote) }),
    el("blockquote", null, el("p", { text: r.quote })),
  ]));

  /* What was actually compared. */
  body.push(el("dl", { class: "kv" }, kv(W.test, el("span", { text: r.test }))));

  /* The count, with its outcomes, and the timing caveat on the same line. */
  const outcomes = table(
    [W.outcomes, { en: "Tenders", bn: "দরপত্র" }, { en: "Share of the tests", bn: "পরীক্ষার হার" }],
    (r.results || []).map((x) => [lab("results", x.key), n(x.n), pct((x.n / r.tested) * 100)])
  );

  /* Where a rule scored no deviation there is nothing to plot, and the outcome
     table is the figure. A table gets the same title, deck and source line a
     chart does, so nothing about the shape changes. */
  const hasBars = !!(r.by_agency && r.by_agency.length);

  body.push(figure({
    title: { en: "Outcome of this test", bn: "এই পরীক্ষার ফলাফল" },
    deck: {
      en: n(r.tested) + " tenders tested. " + (r.deviations
        ? n(r.deviations) + " deviate, on contracts worth " + cr(r.deviation_crore, 0) + "."
        : t(W.noDev)) +
        (r.postdates_event ? " " + t(W.timing) + ": " + n(r.postdates_event) + "." : ""),
      bn: n(r.tested) + "টি দরপত্র পরীক্ষা করা হয়েছে। " + (r.deviations
        ? n(r.deviations) + "টিতে বিচ্যুতি, চুক্তিমূল্য " + cr(r.deviation_crore, 0) + "।"
        : t(W.noDev)) +
        (r.postdates_event ? " " + t(W.timing) + ": " + n(r.postdates_event) + "।" : ""),
    },
    plot: hasBars
      ? barsH(r.by_agency.map((a) => ({ label: a.key, value: a.n })), {
        labelW: 90, valueW: 60, rowH: 26, color: hue(1),
        alt: t({ en: "Deviations by authority.", bn: "সংস্থা অনুযায়ী বিচ্যুতি।" }),
      })
      : outcomes,
    table: hasBars ? outcomes : null,
    source: {
      en: t(UI.words.source) + ": <code>investigation_output/rule_deviations.csv</code>, rows where <code>rule_code</code> is " +
        r.code + ".",
      bn: t(UI.words.source) + ": <code>investigation_output/rule_deviations.csv</code>, যে সারিগুলোতে <code>rule_code</code> " +
        r.code + "।",
    },
  }));
  /* Which standard document the clause was found in. Not a footnote: it is the
     reason several of these counts cannot be read as breaches. */
  if (r.scope && r.scope.length) {
    body.push(el("p", { class: "note-title", text: t(W.scope) }));
    body.push(el("ul", { class: "dl-list" }, r.scope.map((s) => el("li", { class: "dl-row" }, [
      el("span", { class: "dl-what", text: lab("scope", s.key) }),
      el("span", { class: "dl-size", text: n(s.n) }),
    ]))));
  }

  /* The limit, in the analyst's own words, in a box a reader cannot miss. */
  if (r.limit) {
    body.push(el("aside", { class: "note" }, [
      el("p", { class: "note-title", text: t(W.limit) }),
      el("p", { text: r.limit }),
    ]));
  }

  /* Named examples, so the test can be checked against a real document. */
  if (r.observed_sample && r.observed_sample.length) {
    body.push(el("p", { class: "note-title", text: t(W.sample) }));
    body.push(table(
      [UI.words.tender, W.observed, W.required],
      r.observed_sample.map((s) => [digits(s.tender_id), s.observed, s.required]),
      { textCols: true }
    ));
  }

  /* One worked example, cited the same way as everything else on the site. */
  if (r.example_tender) {
    const links = r.example_file
      ? [el("a", { href: href("Tender Notice_PDFs", r.example_file), text: t(UI.words.open) })]
      : [];
    body.push(el("div", { class: "exhibit" }, [
      el("p", { class: "exhibit-label", text: t(W.worked) }),
      r.example_excerpt ? el("blockquote", null, el("p", { text: r.example_excerpt })) : null,
      el("p", { class: "src" }, cite({
        tender: r.example_tender, page: r.example_page, links: links,
      })),
    ].filter(Boolean)));
  }

  const head = el("summary", null, [
    el("span", { class: "rule-code", text: r.code }),
    el("span", { class: "rule-line", text: t(RULE_TITLES[r.code] || { en: human(r.short), bn: human(r.short) }) }),
    el("span", { class: "rule-count", text: n(r.deviations) + " / " + n(r.tested) }),
  ]);

  return el("details", { class: "open", id: "rule-" + r.code }, [head,
    el("div", { class: "open-body" }, body)]);
}
/* --------------------------------------------------------------- the whole tab
   The distribution first — how many tests each tender fell foul of — then the
   eighteen in code order. Code order, not deviation order: ranking them by size
   would put the largest number at the top of the page, and the largest number
   here is the one with the weakest legal footing. */

function spread(corpus) {
  const rs = corpus.rules_summary;
  const cats = ["0"];
  const values = [rs.tenders_with_none];
  for (const row of rs.per_tender) { cats.push(row.key); values.push(row.n); }
  return figure({
    title: { en: "How many of the " + n(corpus.counts.rules) + " tests each tender deviated from",
      bn: "প্রতিটি দরপত্র " + n(corpus.counts.rules) + "টি পরীক্ষার কতটিতে বিচ্যুত" },
    deck: {
      en: "All " + n(corpus.counts.tenders) + " tenders. " + n(rs.tenders_with_none) +
        " deviate from none of the tests; " + n(rs.tenders_with_any) + " deviate from at least one.",
      bn: "সব " + n(corpus.counts.tenders) + "টি দরপত্র। " + n(rs.tenders_with_none) +
        "টিতে কোনো বিচ্যুতি নেই; " + n(rs.tenders_with_any) + "টিতে অন্তত একটি।",
    },
    plot: columns(cats, values, {
      height: 210, padL: 44, color: hue(0),
      label: { en: "Tenders", bn: "দরপত্র" },
      alt: t({ en: "Distribution of deviations per tender.", bn: "দরপত্রপ্রতি বিচ্যুতির বিন্যাস।" }),
    }),
    table: table(
      [{ en: "Tests deviated from", bn: "যতটি পরীক্ষায় বিচ্যুতি" }, { en: "Tenders", bn: "দরপত্র" }],
      cats.map((c, i) => [digits(c), n(values[i])])
    ),
    source: {
      en: t(UI.words.source) + ": <code>investigation_output/master_tender_investigation.csv</code>, column <code>rule_deviation_count</code>.",
      bn: t(UI.words.source) + ": <code>investigation_output/master_tender_investigation.csv</code>, <code>rule_deviation_count</code> কলাম।",
    },
  });
}

/** Build the rules tab into `root`. `rules` is site/data/rules.json. */
export function renderRules(root, corpus, rules) {
  const rs = corpus.rules_summary;

  root.appendChild(el("div", { class: "measure" }, [
    el("p", { html: fill(t(W.intro), corpus) }),
    el("p", {
      html: fill(t({
        en: "{{rules_summary.tested_rows}} tests were run in all. {{rules_summary.deviation_rows}} recorded a deviation, across {{rules_summary.tenders_with_any}} tenders. Of those deviation rows, {{rules_summary.mandatory_clause}} cite a clause worded as an obligation and {{rules_summary.recommended_band}} a recommended band — the two are counted separately here and should stay separate anywhere else.",
        bn: "মোট {{rules_summary.tested_rows}}টি পরীক্ষা চালানো হয়েছে। {{rules_summary.deviation_rows}}টিতে বিচ্যুতি ধরা পড়েছে, {{rules_summary.tenders_with_any}}টি দরপত্রে। ওই সারিগুলোর {{rules_summary.mandatory_clause}}টিতে উদ্ধৃত ধারা বাধ্যবাধকতা হিসেবে লেখা, আর {{rules_summary.recommended_band}}টিতে সুপারিশকৃত সীমা — এখানে দুটি আলাদা গোনা হয়েছে, অন্য কোথাওও আলাদা থাকা উচিত।",
      }), corpus),
    }),
  ]));

  root.appendChild(spread(corpus));

  const ordered = rules.slice().sort((a, b) => a.code.localeCompare(b.code));
  root.appendChild(el("div", { class: "open-stack" }, ordered.map((r) => ruleBlock(r, corpus))));

  root.appendChild(el("p", { class: "src", html: fill(t({
    en: "Every row behind these counts is in <code>investigation_output/rule_deviations.csv</code> — {{counts.deviation_rows}} rows, one per test, each carrying the excerpt it was read from, its page, and the timing and scope flags shown above.",
    bn: "এই গণনার প্রতিটি সারি আছে <code>investigation_output/rule_deviations.csv</code>-এ — {{counts.deviation_rows}}টি সারি, প্রতি পরীক্ষায় একটি, প্রতিটিতে যে উদ্ধৃতি থেকে পড়া হয়েছে, তার পৃষ্ঠা, এবং উপরে দেখানো সময় ও পরিধির চিহ্ন।",
  }), corpus) }));

  return root;
}
