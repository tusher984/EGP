/* e-GP WATCH — the story tab: the article itself.
   ------------------------------------------------------------------
   This module turns the STORY array in content.js into the page. It holds no
   words of its own and no figures of its own: prose comes from content.js,
   numbers come from corpus.json through fill(), and each chart is built from
   the corpus rows at render time. Change the CSVs, re-run build.py, and both
   the sentence and the chart beside it move together.

   Every figure carries a source line naming the file it was computed from, so
   an editor can go from a bar on the screen to a column in a CSV without
   asking anyone. Where the corpus counts a subset — awarded tenders only, or
   only those whose bid count was published — the source line says which
   subset, because a denominator left unstated is a claim left unchecked. */

import { el, t, n, pct, cr, digits, dash, fill, fillText, href, human, cite } from "./core.js";
import {
  figure, table, barsH, lines, percentileStrip, stripLegend, stackedShare,
  funnel, hue, SEQ,
} from "./charts.js";
import { UI, HEAD, STORY, DOORS, LABELS, EXHIBIT_WORDS } from "./content.js";

/* ------------------------------------------------------------------ helpers */

/** A translated, figure-resolved HTML string. Everything reader-facing goes
    through here, so a {{token}} can never reach the page unresolved. */
function T(pair, corpus) { return fill(t(pair), corpus); }

/** The same for attribute contexts, where markup would show through. */
function A(pair, corpus) { return fillText(t(pair), corpus); }

/** A machine token turned into its written label, or — if no label has been
    written for it — into readable words rather than a silent blank. */
function label(map, key) {
  const m = LABELS[map] || {};
  return m[key] === undefined ? human(key) : t(m[key]);
}

/* Source lines. The name of the file and the subset, nothing decorative. */
const F = {
  master: "<code>investigation_output/master_tender_investigation.csv</code>",
  dev: "<code>investigation_output/rule_deviations.csv</code>",
  bidder: "<code>investigation_output/bidder_detail.csv</code>",
};

function src(en, bn) {
  return {
    en: t(UI.words.source) + ": " + en,
    bn: t(UI.words.source) + ": " + bn,
  };
}
/* -------------------------------------------------------------------- tiles
   The four figures the whole investigation rests on, at the top, before any
   argument is made. Each is a count from the corpus with its unit written out;
   the zero is deliberately one of them, because the zero is the finding. */

function tiles(corpus) {
  const rows = [
    {
      v: n(corpus.counts.pdfs),
      u: { en: "documents read", bn: "নথি পড়া হয়েছে" },
      l: { en: "every page of every PDF in the folder", bn: "ফোল্ডারের প্রতিটি পিডিএফের প্রতিটি পৃষ্ঠা" },
    },
    {
      v: cr(corpus.money.crore, 0),
      u: { en: "in signed contracts", bn: "স্বাক্ষরিত চুক্তিতে" },
      l: { en: "across " + n(corpus.counts.awarded) + " awards", bn: n(corpus.counts.awarded) + "টি চুক্তিতে" },
    },
    {
      v: n(corpus.field.lost),
      u: { en: "bids rejected", bn: "দর বাতিল" },
      l: { en: "out of " + n(corpus.field.submitted) + " submitted", bn: "জমা পড়া " + n(corpus.field.submitted) + "টির মধ্যে" },
    },
    {
      v: n(corpus.field.reasons_published),
      u: { en: "reasons published", bn: "কারণ প্রকাশিত" },
      l: { en: "in the whole set — not one", bn: "এই নথিগুলোর কোথাও — একটিও নয়" },
      hero: true,
    },
  ];

  return el("div", { class: "tiles" }, rows.map((r) => el("div", { class: "tile" }, [
    el("div", { class: "tile-n" + (r.hero ? " hero-n" : ""), text: r.v }),
    el("div", { class: "tile-u", text: t(r.u) }),
    el("div", { class: "tile-l", text: t(r.l) }),
  ])));
}
/* ------------------------------------------------------------------- figures
   One builder per figure id used in STORY. Each returns figure({...}), which is
   the only path a chart takes to the page: title, deck, plot, legend where
   there is more than one series, a table view, and the source line last. */

const FIGS = {

  /* Where the published record stops. Same unit — bids — the whole way down,
     so the three zeros sit on the same scale as the 2,749 and cannot be read
     as anything other than zero. */
  funnel(corpus) {
    const f = corpus.field;
    const rows = [
      { label: { en: "Bids submitted", bn: "জমা পড়া দর" }, value: f.submitted },
      { label: { en: "Ruled responsive", bn: "গ্রহণযোগ্য বিবেচিত" }, value: f.responsive },
      { label: { en: "Rejected", bn: "বাতিল" }, value: f.lost },
      { label: { en: "Rejection reasons published", bn: "বাতিলের কারণ প্রকাশিত" }, value: f.reasons_published },
      { label: { en: "Losing bidders named", bn: "পরাজিত দরদাতার নাম প্রকাশিত" }, value: f.losers_named },
      { label: { en: "Losing prices published", bn: "পরাজিত দর প্রকাশিত" }, value: f.losing_amounts_published },
    ];
    return figure({
      title: { en: "Where the published record stops", bn: "প্রকাশিত নথি যেখানে থেমে যায়" },
      deck: {
        en: "Bids counted across the " + n(corpus.counts.with_bid_counts) +
          " tenders whose bid count was published. The last three lines are zero.",
        bn: "যেসব দরপত্রে দরের সংখ্যা প্রকাশিত হয়েছে, সেই " + n(corpus.counts.with_bid_counts) +
          "টিতে গোনা দর। শেষ তিনটি সারি শূন্য।",
      },
      plot: funnel(rows, { labelW: 210, alt: A({ en: "Bids fall from " + n(f.submitted) + " submitted to zero published reasons.", bn: "জমা পড়া " + n(f.submitted) + " দর থেকে শূন্য প্রকাশিত কারণে নেমে আসা।" }, corpus) }),
      table: table(
        [{ en: "Stage", bn: "ধাপ" }, { en: "Bids", bn: "দর" }],
        rows.map((r) => [t(r.label), n(r.value)])
      ),
      source: src(F.master + " — columns <code>total_bids_received</code>, <code>responsive_bids</code>, <code>bidders_rejected_count</code>, <code>rejection_reason</code>, <code>lowest_bid</code>.",
        F.master + " — <code>total_bids_received</code>, <code>responsive_bids</code>, <code>bidders_rejected_count</code>, <code>rejection_reason</code>, <code>lowest_bid</code> কলাম।"),
    });
  },
  /* Money, not tenders, on the plot — the point of the figure is that the two
     do not track each other, and putting both on one axis would hide it. The
     tender counts are in the table beside it. */
  competition(corpus) {
    const rows = corpus.competition.map((r) => ({
      key: r.key, label: label("competition", r.key), value: r.crore, n: r.n, share: r.share,
    }));
    return figure({
      title: { en: "How much money each level of competition carried", bn: "কোন মাত্রার প্রতিযোগিতায় কত টাকা" },
      deck: {
        en: "Signed contract value by the number of bids the notice attracted, across the " +
          n(corpus.counts.awarded) + " tenders with an award record. Two bids carried more money than any other level.",
        bn: "বিজ্ঞপ্তিতে কতটি দর পড়েছে, সেই অনুযায়ী স্বাক্ষরিত চুক্তিমূল্য — চুক্তির নথি আছে এমন " +
          n(corpus.counts.awarded) + "টি দরপত্রে। অন্য যেকোনো মাত্রার চেয়ে দুটি দরে বেশি টাকা গেছে।",
      },
      plot: barsH(rows, {
        labelW: 200, valueW: 128, fmt: (v) => cr(v, 0),
        color: hue(0), alt: A({ en: "Contract value by bid count.", bn: "দরের সংখ্যা অনুযায়ী চুক্তিমূল্য।" }, corpus),
      }),
      table: table(
        [{ en: "Bids received", bn: "প্রাপ্ত দর" }, { en: "Tenders", bn: "দরপত্র" },
         { en: "Contract value", bn: "চুক্তিমূল্য" }, { en: "Share of the money", bn: "অর্থের অংশ" }],
        rows.map((r) => [r.label, n(r.n), cr(r.value), pct(r.share)])
      ),
      source: src(F.master + " — <code>competition_level</code> against <code>contract_value_bdt</code>. Bid-count bands are read off <code>total_bids_received</code>: one bid, two, three, four to five, six or more.",
        F.master + " — <code>competition_level</code> ও <code>contract_value_bdt</code>। দরের সংখ্যার ভাগগুলো <code>total_bids_received</code> থেকে পড়া: এক, দুই, তিন, চার-পাঁচ, ছয় বা তার বেশি।"),
    });
  },

  /* One bar per authority, one unit: the share of that authority's notices
     that published no eligibility criteria at all. */
  agencies(corpus) {
    const rows = corpus.agencies.map((a) => ({
      label: a.key, value: a.no_criteria_pct, a,
    }));
    return figure({
      title: { en: "Share of notices that set no published bar", bn: "যেসব বিজ্ঞপ্তিতে প্রকাশিত কোনো শর্ত নেই, তার হার" },
      deck: {
        en: "By authority, across all " + n(corpus.counts.tenders) +
          " notices. Counted here is every notice that carries no substantive criteria: it refers the bidder to a tender data sheet that is not in this document set, or is blank, or the portal refused access.",
        bn: "সংস্থা অনুযায়ী, সব " + n(corpus.counts.tenders) +
          "টি বিজ্ঞপ্তিতে। এখানে গোনা হয়েছে সেই সব বিজ্ঞপ্তি, যেখানে মূল শর্তের কোনো লেখা নেই: হয় দরদাতাকে এমন একটি ডেটা শিটে পাঠানো হয়েছে যা এই নথিগুলোর মধ্যে নেই, নয়তো ঘরটি ফাঁকা, নয়তো পোর্টাল প্রবেশ দেয়নি।",
      },
      plot: barsH(rows, {
        labelW: 96, valueW: 84, max: 100, fmt: (v) => pct(v, 0),
        color: hue(1), alt: A({ en: "Share of notices with no published criteria, by authority.", bn: "সংস্থা অনুযায়ী শর্তহীন বিজ্ঞপ্তির হার।" }, corpus),
      }),
      table: table(
        [{ en: "Authority", bn: "সংস্থা" }, { en: "Notices", bn: "বিজ্ঞপ্তি" },
         { en: "No published bar", bn: "প্রকাশিত শর্ত নেই" }, { en: "Share", bn: "হার" },
         { en: "Middle bid count", bn: "দরের মাঝের মান" }, { en: "Contract value", bn: "চুক্তিমূল্য" }],
        rows.map((r) => [r.a.organization, n(r.a.tenders), n(r.a.no_criteria),
          pct(r.a.no_criteria_pct), r.a.median_bids === null ? dash() : n(r.a.median_bids), cr(r.a.crore)])
      ),
      source: src(F.master + " — <code>eligibility_published</code> grouped by <code>agency</code>; a notice counts as publishing a bar only where the column reads <code>SUBSTANTIVE_TEXT_PUBLISHED</code>. The middle value is from <code>total_bids_received</code>.",
        F.master + " — <code>agency</code> অনুযায়ী <code>eligibility_published</code>; কলামে <code>SUBSTANTIVE_TEXT_PUBLISHED</code> থাকলেই কেবল ধরা হয়েছে শর্ত প্রকাশিত হয়েছে। মাঝের মান <code>total_bids_received</code> থেকে।"),
    });
  },
  /* The figure that argues against our own starting theory. Median bids on the
     plot — one unit — with the single-responsive share in the table, because
     the two are different quantities and stacking them on one axis would let a
     reader take the comparison for a trend. */
  restriction(corpus) {
    const rows = corpus.restriction.map((r) => ({
      label: label("restriction", r.key), value: r.median_bids, r,
    }));
    return figure({
      title: { en: "Bids received, against how restrictive the criteria looked", bn: "শর্ত কতটা সীমাবদ্ধকারী মনে হয়েছে, তার বিপরীতে প্রাপ্ত দর" },
      deck: {
        en: "The middle bid count per tender for each restriction band, across the " +
          n(corpus.counts.with_bid_counts) + " tenders whose bid count was published. If tight criteria thinned the field, the bars would fall from top to bottom. They do not.",
        bn: "প্রতিটি সীমাবদ্ধতার স্তরে দরপত্রপ্রতি দরের মাঝের মান — দরের সংখ্যা প্রকাশিত হয়েছে এমন " +
          n(corpus.counts.with_bid_counts) + "টি দরপত্রে। কঠিন শর্ত যদি প্রতিযোগিতা কমাত, তবে দণ্ডগুলো উপর থেকে নিচে ছোট হতো। হয়নি।",
      },
      plot: barsH(rows, {
        labelW: 250, valueW: 60, rowH: 34, fmt: (v) => n(v),
        color: hue(2), alt: A({ en: "Middle bid count by restriction band.", bn: "সীমাবদ্ধতার স্তর অনুযায়ী দরের মাঝের মান।" }, corpus),
      }),
      table: table(
        [{ en: "Restriction band", bn: "সীমাবদ্ধতার স্তর" }, { en: "Tenders", bn: "দরপত্র" },
         { en: "Middle bid count", bn: "দরের মাঝের মান" }, { en: "Average bids", bn: "দরের গড়" },
         { en: "One responsive bid", bn: "একটিই গ্রহণযোগ্য দর" }, { en: "Share", bn: "হার" }],
        rows.map((x) => [x.label, n(x.r.n), n(x.r.median_bids), n(x.r.mean_bids, 2),
          n(x.r.single_responsive), pct(x.r.single_responsive_pct)])
      ),
      source: src(F.master + " — <code>eligibility_restriction_level</code> against <code>total_bids_received</code> and <code>responsive_bids</code>. The bands are this investigation's own classification of the published criteria, not a finding by any authority.",
        F.master + " — <code>eligibility_restriction_level</code> এবং <code>total_bids_received</code>, <code>responsive_bids</code>। স্তরগুলো প্রকাশিত শর্তের ভিত্তিতে এই অনুসন্ধানের নিজস্ব শ্রেণিবিভাগ, কোনো সংস্থার সিদ্ধান্ত নয়।"),
    });
  },

  /* Six requirements, but only the three measured as a multiple of the contract
     value share a scale, so only those three are plotted. The other three are
     in the table with their units written into the row label. A reference line
     marks one times the contract value. */
  bars(corpus) {
    const b = corpus.bars;
    const keys = ["turnover", "financial", "specific"];
    const rows = keys.map((k) => Object.assign({ label: LABELS.barsShort[k] }, b[k]));
    const all = ["turnover", "financial", "specific", "security", "years", "projects"];
    return figure({
      wide: true,
      title: { en: "What the notices demanded, measured against the job", bn: "বিজ্ঞপ্তিতে যা দাবি করা হয়েছে, কাজের তুলনায়" },
      deck: {
        en: "Each requirement as a multiple of the contract it was attached to. The line marks one times the contract value: to the right of it, a notice asked a bidder to be larger than the work.",
        bn: "প্রতিটি শর্ত, সংশ্লিষ্ট চুক্তিমূল্যের গুণিতকে। রেখাটি চুক্তিমূল্যের সমান মাত্রা দেখায়: তার ডানদিকে গেলে বিজ্ঞপ্তি দরদাতাকে কাজের চেয়ে বড় হতে বলেছে।",
      },
      plot: percentileStrip(rows, {
        labelW: 210, reference: 1, min: 0,
        alt: A({ en: "Requirement size as a multiple of contract value.", bn: "চুক্তিমূল্যের গুণিতকে শর্তের আকার।" }, corpus),
      }),
      legend: stripLegend(),
      table: table(
        [{ en: "Requirement", bn: "শর্ত" }, { en: "Notices", bn: "বিজ্ঞপ্তি" },
         { en: "Lowest", bn: "সর্বনিম্ন" }, { en: "10th pct", bn: "১০ম পার্সেন্টাইল" },
         { en: "Middle value", bn: "মাঝের মান" }, { en: "90th pct", bn: "৯০তম পার্সেন্টাইল" },
         { en: "Highest", bn: "সর্বোচ্চ" }],
        all.map((k) => [t(LABELS.bars[k]), n(b[k].n), n(b[k].min, 2), n(b[k].p10, 2),
          n(b[k].median, 2), n(b[k].p90, 2), n(b[k].max, 2)])
      ),
      source: src(F.master + " — <code>turnover_to_contract_value_ratio</code>, <code>financial_bar_to_contract_value_ratio</code>, <code>similar_project_value_to_contract_value_ratio</code>, <code>security_to_contract_value_ratio</code>, <code>minimum_years_experience</code>, <code>minimum_similar_projects</code>. Only notices that published the figure are counted, so each row has its own denominator.",
        F.master + " — <code>turnover_to_contract_value_ratio</code>, <code>financial_bar_to_contract_value_ratio</code>, <code>similar_project_value_to_contract_value_ratio</code>, <code>security_to_contract_value_ratio</code>, <code>minimum_years_experience</code>, <code>minimum_similar_projects</code>। কেবল যেসব বিজ্ঞপ্তিতে সংখ্যাটি প্রকাশিত, সেগুলোই গোনা — তাই প্রতিটি সারির নিজস্ব হর।"),
    });
  },
  /* Two series, one unit — tenders — so they belong on one axis. Money moves on
     a different scale entirely and stays in the table. */
  timeline(corpus) {
    const rows = corpus.timeline;
    const cats = rows.map((r) => r.year);
    const series = [
      { label: { en: "Notices published", bn: "প্রকাশিত বিজ্ঞপ্তি" }, values: rows.map((r) => r.published), color: hue(0) },
      { label: { en: "Contracts signed", bn: "স্বাক্ষরিত চুক্তি" }, values: rows.map((r) => r.signed), color: hue(1) },
    ];
    return figure({
      title: { en: "Notices published and contracts signed, by year", bn: "বছর অনুযায়ী প্রকাশিত বিজ্ঞপ্তি ও স্বাক্ষরিত চুক্তি" },
      deck: {
        en: "Counted on the dates printed in the documents. The gap between the two lines is the " +
          n(corpus.counts.no_award_record) + " notices in this set with no award record attached.",
        bn: "নথিতে ছাপা তারিখ অনুযায়ী গোনা। দুই রেখার মধ্যেকার ফাঁক হলো এই সম্ভারের সেই " +
          n(corpus.counts.no_award_record) + "টি বিজ্ঞপ্তি, যেগুলোর সঙ্গে চুক্তির নথি নেই।",
      },
      plot: lines(cats, series, {
        height: 250, padL: 40,
        alt: A({ en: "Notices and signings per year.", bn: "বছরপ্রতি বিজ্ঞপ্তি ও চুক্তি।" }, corpus),
      }),
      legend: series.map((s) => ({ label: s.label, color: s.color })),
      table: table(
        [{ en: "Year", bn: "বছর" }, { en: "Notices published", bn: "প্রকাশিত বিজ্ঞপ্তি" },
         { en: "Contracts signed", bn: "স্বাক্ষরিত চুক্তি" }, { en: "Contract value", bn: "চুক্তিমূল্য" },
         { en: "Two or fewer bids", bn: "দুই বা কম দর" }],
        rows.map((r) => [digits(r.year), n(r.published), n(r.signed), cr(r.crore), n(r.thin_field)])
      ),
      source: src(F.master + " — <code>publication_date</code> and <code>signing_date</code>, grouped by year; value from <code>contract_value_bdt</code>.",
        F.master + " — বছর অনুযায়ী <code>publication_date</code> ও <code>signing_date</code>; মূল্য <code>contract_value_bdt</code> থেকে।"),
    });
  },

  /* One whole divided. The bands are cumulative shares from the corpus, so the
     parts are subtractions of published numbers and nothing else. */
  winners(corpus) {
    const c = corpus.concentration;
    const top1 = c.top1.share;
    const parts = [
      { label: { en: "The single largest firm", bn: "একক বৃহত্তম প্রতিষ্ঠান" }, value: top1 },
      { label: { en: "Firms 2–5", bn: "২–৫ নম্বর প্রতিষ্ঠান" }, value: c.top5_share - top1 },
      { label: { en: "Firms 6–10", bn: "৬–১০ নম্বর" }, value: c.top10_share - c.top5_share },
      { label: { en: "Firms 11–20", bn: "১১–২০ নম্বর" }, value: c.top20_share - c.top10_share },
      {
        label: { en: "The other " + n(c.distinct_winners - 20) + " firms", bn: "বাকি " + n(c.distinct_winners - 20) + "টি প্রতিষ্ঠান" },
        value: 100 - c.top20_share,
      },
    ];
    return figure({
      wide: true,
      title: { en: "How the money divides between the winning firms", bn: "বিজয়ী প্রতিষ্ঠানগুলোর মধ্যে অর্থ যেভাবে ভাগ হয়েছে" },
      deck: {
        en: cr(corpus.money.crore, 0) + " went to " + n(c.distinct_winners) +
          " firms. Twenty of them hold " + pct(c.top20_share) + " of it, and one holds " + pct(top1) + " on " + n(c.top1.contracts) + " contracts.",
        bn: cr(corpus.money.crore, 0) + " গেছে " + n(c.distinct_winners) +
          "টি প্রতিষ্ঠানে। তার " + pct(c.top20_share) + " আছে কুড়িটির হাতে, আর একটি প্রতিষ্ঠানের হাতে " + n(c.top1.contracts) + "টি চুক্তিতে " + pct(top1) + "।",
      },
      plot: stackedShare(parts, { alt: A({ en: "Share of contract value by firm rank.", bn: "প্রতিষ্ঠানের ক্রম অনুযায়ী চুক্তিমূল্যের অংশ।" }, corpus) }),
      table: table(
        [{ en: "Firms", bn: "প্রতিষ্ঠান" }, { en: "Share of the money", bn: "অর্থের অংশ" }],
        parts.map((p) => [t(p.label), pct(p.value)])
      ),
      source: src(F.master + " — <code>winner_name_normalised</code> against <code>contract_value_bdt</code>. The bands are the cumulative top-1, top-5, top-10 and top-20 shares of all awarded value, differenced. Firms are grouped on that column and never merged on a resemblance; the name shown is a spelling the award notices print.",
        F.master + " — <code>contract_value_bdt</code>-এর বিপরীতে <code>winner_name_normalised</code>। স্তরগুলো ক্রমযোজিত শীর্ষ-১, ৫, ১০ ও ২০-এর অংশের বিয়োগফল। প্রতিষ্ঠানগুলো ওই কলাম ধরে দলবদ্ধ, মিল দেখে কখনো এক করা হয়নি; যে নাম দেখানো হয় তা চুক্তি-বিজ্ঞপ্তিতে ছাপা বানান।"),
    });
  },
  /* Eight outcomes over one set of tests, one unit. The ramp is ordered by
     lightness so the order survives any colour vision, and the outcome is
     written out in words on every bar — the colour carries nothing alone. */
  rules(corpus) {
    const rs = corpus.rules_summary;
    const rows = rs.results.map((r, i) => ({
      label: label("results", r.key), value: r.n,
      color: SEQ[Math.max(0, SEQ.length - 1 - i)],
    }));
    /* The share of tests that could not be run is read off the outcome the
       build recorded, not estimated from the chart. If that outcome ever stops
       being present the deck says nothing about it rather than guessing. */
    const absentRow = rs.results.find((r) => r.key === "NOT_TESTABLE_DATA_ABSENT");
    const absent = absentRow ? absentRow.n : 0;
    return figure({
      wide: true,
      title: { en: "What happened when " + n(corpus.counts.rules) + " rules met every tender",
        bn: n(corpus.counts.rules) + "টি নিয়ম প্রতিটি দরপত্রে প্রয়োগ করলে যা দেখা গেল" },
      deck: {
        en: n(rs.tested_rows) + " tests, being " + n(corpus.counts.rules) + " rules against " +
          n(corpus.counts.tenders) + " tenders wherever the rule applied. " + n(absent) + " of them — " +
          pct((absent / rs.tested_rows) * 100) + " — could not be run at all, because the document leaves the field the rule needs empty.",
        bn: n(rs.tested_rows) + "টি পরীক্ষা — প্রযোজ্য ক্ষেত্রে " + n(corpus.counts.tenders) +
          "টি দরপত্রে " + n(corpus.counts.rules) + "টি নিয়ম। এর " + n(absent) + "টি (" +
          pct((absent / rs.tested_rows) * 100) + ") চালানোই যায়নি, কারণ নিয়মটির যে ঘর দরকার তা নথিতে ফাঁকা।",
      },
      plot: barsH(rows, {
        labelW: 320, valueW: 70, rowH: 32,
        alt: A({ en: "Outcomes of the rule tests.", bn: "নিয়ম পরীক্ষার ফলাফল।" }, corpus),
      }),
      table: table(
        [{ en: "Outcome", bn: "ফলাফল" }, { en: "Tests", bn: "পরীক্ষা" }, { en: "Share", bn: "হার" }],
        rs.results.map((r) => [label("results", r.key), n(r.n), pct((r.n / rs.tested_rows) * 100)])
      ),
      source: src(F.dev + " — " + n(rs.tested_rows) + " rows, column <code>test_result</code>. Of the " +
        n(rs.deviation_rows) + " deviation rows, " + n(rs.postdates_event) +
        " cite an instrument dated after the event tested and " + n(rs.plausibly_in_force) +
        " one plausibly in force at the time; the timing flag is on every row.",
        F.dev + " — " + n(rs.tested_rows) + "টি সারি, <code>test_result</code> কলাম। " +
        n(rs.deviation_rows) + "টি বিচ্যুতির সারির " + n(rs.postdates_event) +
        "টিতে উদ্ধৃত দস্তাবেজের তারিখ পরীক্ষিত ঘটনার পরের, আর " + n(rs.plausibly_in_force) +
        "টিতে তখন বলবৎ থাকা সম্ভব ছিল; প্রতিটি সারিতে সময়-চিহ্ন আছে।"),
    });
  },
};

/* ------------------------------------------------------------------ exhibits
   Four documents quoted as they are printed, misspellings included, each with
   the page it sits on and a link to the PDF. The reading beside a quote says
   what the document does say and stops there; where a document names no one,
   the reading says so rather than filling the gap.

   The caption and the reading are ours, so they come from EXHIBIT_WORDS and
   switch language with the page. The build's own English caption is the
   fallback. The quote never switches: it is the document. */

function exhibitBlock(corpus) {
  return el("div", { class: "open-stack" }, corpus.exhibits.map((x) => {
    const links = [];
    if (x.notice && x.notice.file) {
      links.push(el("a", { href: href(x.notice.dir, x.notice.file), text: t(UI.words.noticePdf) }));
    }
    if (x.award && x.award.file) {
      links.push(el("a", { href: href(x.award.dir, x.award.file), text: t(UI.words.awardPdf) }));
    }
    const words = EXHIBIT_WORDS[x.tender_id + "|" + x.column] || {};
    return el("div", { class: "exhibit" }, [
      el("p", { class: "exhibit-label", text: t(words.label || x.label) }),
      el("blockquote", null, el("p", { text: x.quote })),
      el("p", { class: "exhibit-read", text: t(words.reading || x.reading) }),
      el("p", { class: "src" }, cite({
        entity: x.agency,
        tender: x.tender_id,
        page: x.page,
        column: x.column,
        links: links,
      })),
    ]);
  }));
}

/* --------------------------------------------------------------------- doors
   The end of the article hands over the working material. These are ordinary
   links to the tab ids, so they work with the keyboard, in a new window and
   with JavaScript still loading. */

function doorBlock(corpus) {
  return el("ul", { class: "dl-list" }, DOORS.map((d) => el("li", { class: "dl-row" }, [
    el("a", { class: "dl-what", href: "#" + d.tab, text: t(d.label) }),
    el("span", { class: "dl-note", html: T(d.note, corpus) }),
  ])));
}
/* ------------------------------------------------------------------- article
   One pass over STORY. Every branch is a block kind that content.js actually
   uses; an unknown kind is dropped rather than guessed at, and a figure id with
   no builder says so on the page instead of leaving a hole. */

function block(b, corpus) {
  switch (b.k) {
    case "tiles":
      return tiles(corpus);

    case "lede":
      return el("p", { class: "lede", html: T(b, corpus) });

    case "p":
      return el("p", { html: T(b, corpus) });

    case "h2":
      return el("h2", { html: T(b, corpus) });

    case "fig": {
      const build = FIGS[b.id];
      if (!build) return el("p", { class: "unresolved", text: "[missing figure: " + b.id + "]" });
      return build(corpus);
    }

    case "finding":
      return el("section", { class: "finding" }, [
        el("div", { class: "finding-head" }, [
          el("span", { class: "tag tag-" + b.tag, text: t(UI.tags[b.tag]) }),
          el("h3", { html: T(b.h, corpus) }),
        ]),
        ...b.p.map((p) => el("p", { html: T(p, corpus) })),
      ]);

    case "note":
      return el("aside", { class: "note" }, [
        el("p", { class: "note-title", html: T(b.title, corpus) }),
        ...b.p.map((p) => el("p", { html: T(p, corpus) })),
      ]);

    case "exhibits":
      return exhibitBlock(corpus);

    case "doors":
      return doorBlock(corpus);

    default:
      return null;
  }
}

/** The byline portrait: the photograph, with the reporter's initials behind it
    as the fallback if the file is ever missing. Hidden from assistive software
    because the name is set in text immediately beside it — a portrait carries
    nothing a screen reader can read out. */
function bylineMark() {
  const mark = el("span", { class: "byline-mark", "aria-hidden": "true" }, [
    el("span", { class: "byline-initials", text: HEAD.initials }),
  ]);
  const photo = el("img", {
    class: "byline-photo",
    src: HEAD.portrait,
    alt: "",
    width: "320",
    height: "320",
    decoding: "async",
    on: { error: () => photo.remove() },
  });
  mark.appendChild(photo);
  return mark;
}

/** Build the header and the article into `root`. Called once, on first paint of
    the story tab, and again whenever the language changes. */
export function renderStory(root, corpus) {
  const head = el("header", { class: "story-head" }, [
    el("p", { class: "kicker", html: T(HEAD.kicker, corpus) }),
    el("h1", { class: "hed", html: T(HEAD.hed, corpus) }),
    el("p", { class: "dek", html: T(HEAD.dek, corpus) }),
    el("div", { class: "byline" }, [
      bylineMark(),
      el("span", null, [
        el("span", { class: "byline-who", text: t(HEAD.byline) }),
        el("span", { class: "byline-what", html: T(HEAD.role, corpus) }),
      ]),
    ]),
  ]);

  const body = el("div", { class: "prose" }, STORY.map((b) => block(b, corpus)).filter(Boolean));

  root.appendChild(head);
  root.appendChild(body);
  return root;
}
