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

import {
  el, t, n, pct, cr, taka, date, digits, dash, fill, fillText, href, human, cite,
  agencyName, bodyName, placeName, firmName,
} from "./core.js";
import {
  figure, table, barsH, lines, columns, percentileStrip, stripLegend, stackedShare,
  funnel, matrix, matrixLegend,
  hue, SEQ, wideCanvas, scrollCanvas,
} from "./charts.js";
import {
  UI, HEAD, CASE, CASES, STORY, LIMITS, CHECK, DOORS, LABELS, EXHIBIT_WORDS,
  RULE_TITLES, RULE_SHORT,
} from "./content.js";

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

/* Source lines. What a figure was computed from, named the way a reader can
   place it: an analysis of the tender and award notices the e-GP portal itself
   publishes. The repository's CSV is not the source — it is one machine-readable
   copy of the source, made by this investigation — so it no longer stands where
   the source belongs.

   The column names stay. They are the machine trail, not the provenance: an
   editor re-derives the figure from those, and dropping them would leave the
   line unable to be checked. Each entry is a pair rather than a string, so the
   Bangla edition names the source in Bangla instead of borrowing the English. */
const F = {
  master: {
    en: "e-GP portal data analysis — tender notices and contract award notices",
    bn: "ই-জিপি পোর্টালের তথ্য বিশ্লেষণ — দরপত্র বিজ্ঞপ্তি ও চুক্তি বিজ্ঞপ্তি",
  },
  dev: {
    en: "e-GP portal data analysis — the clause tests, run notice by notice",
    bn: "ই-জিপি পোর্টালের তথ্য বিশ্লেষণ — ধারা-পরীক্ষা, বিজ্ঞপ্তি ধরে ধরে",
  },
};

function src(en, bn) {
  return {
    en: t(UI.words.source) + ": " + en,
    bn: t(UI.words.source) + ": " + bn,
  };
}
/* -------------------------------------------------------------------- tiles
   The three figures that establish the size of what was read, at the top,
   before any argument is made: how many documents, how much money, how many
   bids set aside. Each is a count from the corpus with its unit written out.

   The zero — no published reason, not once — is not a tile. It is the headline
   and the last three bars of the funnel, and a stat tile whose number is 0 asks
   a reader to work out what is missing from a number that looks like nothing. */

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
      v: n(corpus.estimate.lowest_price_test.tested),
      u: { en: "contracts with no benchmark", bn: "মানদণ্ডহীন চুক্তি" },
      l: {
        en: "the official cost estimate is in none of the documents",
        bn: "সরকারি প্রাক্কলিত ব্যয় কোনো নথিতেই নেই",
      },
    },
  ];

  return el("div", { class: "tiles" }, rows.map((r) => el("div", { class: "tile" }, [
    el("div", { class: "tile-n", text: r.v }),
    el("div", { class: "tile-u", text: t(r.u) }),
    el("div", { class: "tile-l", text: t(r.l) }),
  ])));
}
/* ------------------------------------------------------------------- figures
   One builder per figure id used in STORY. Each returns figure({...}), which is
   the only path a chart takes to the page: title, deck, plot, legend where
   there is more than one series, a table view, and the source line last. */

const FIGS = {

  /* The rejection stage, watched from outside it.

     No document in this set says why a bid was rejected. But every notice that
     publishes a bid count also publishes how many of those bids were found
     responsive, so the stage can still be measured: group the tenders by how
     many companies bid, and read off what share of the field survived. Both
     numbers are published columns and the population is the same 591 notices in
     every band, so no bar here is a different population from its neighbour.

     One series, one unit, so no legend — the title names the measure. The money
     each band carried is deliberately NOT on this plot: it is the competition
     figure further down, because a second axis would turn two separate findings
     into one apparent trend. */
  filter(corpus) {
    const f = corpus.filter;
    const cats = f.rows.map((r) => r.key);
    return figure({
      title: {
        en: "Where one company bid, it was never ruled out",
        bn: "যেখানে একটিই প্রতিষ্ঠান দর দিয়েছে, সেখানে কেউ বাদ পড়েনি",
      },
      deck: {
        en: "The share of submitted bids found responsive, by how many bids the tender drew, across the " +
          n(f.n) + " tenders that publish both numbers. In the " + n(f.bottom_band.n) +
          " tenders with a single bid, that bid was accepted every time. In the " +
          n(f.top_band.n) + " that drew ten or more, under half survived.",
        bn: "কতটি দর পড়েছে সেই অনুযায়ী জমা পড়া দরের কত অংশ গ্রহণযোগ্য বিবেচিত হয়েছে — দুটি সংখ্যাই প্রকাশিত এমন " +
          n(f.n) + "টি দরপত্রে। একটিমাত্র দর পড়া " + n(f.bottom_band.n) +
          "টি দরপত্রে সেই দরটি প্রতিবারই গৃহীত হয়েছে। দশ বা তার বেশি দর পড়া " +
          n(f.top_band.n) + "টিতে অর্ধেকের কমই টিকেছে।",
      },
      plot: columns(cats, f.rows.map((r) => r.share), {
        max: 100, fmt: (v) => pct(v, 0), color: hue(0), height: 250,
        label: { en: "Found responsive", bn: "গ্রহণযোগ্য বিবেচিত" },
        alt: A({ en: "Share of bids found responsive falls as the number of bids rises.", bn: "দরের সংখ্যা বাড়লে গ্রহণযোগ্য বিবেচিত দরের হার কমে।" }, corpus),
      }),
      table: table(
        [{ en: "Bids received", bn: "প্রাপ্ত দর" }, { en: "Tenders", bn: "দরপত্র" },
         { en: "Bids submitted", bn: "জমা পড়া দর" }, { en: "Found responsive", bn: "গ্রহণযোগ্য" },
         { en: "Rejected", bn: "বাতিল" }, { en: "Share responsive", bn: "গ্রহণযোগ্যের হার" },
         { en: "One responsive bid", bn: "একটিই গ্রহণযোগ্য দর" },
         { en: "Contract value", bn: "চুক্তিমূল্য" }],
        f.rows.map((r) => [digits(r.key), n(r.n), n(r.submitted), n(r.responsive),
          n(r.lost), pct(r.share), n(r.one_resp), cr(r.crore)])
      ),
      source: src(F.master.en + " — <code>responsive_bids</code> over <code>total_bids_received</code>, banded by the same column.",
        F.master.bn + " — <code>total_bids_received</code>-এর বিপরীতে <code>responsive_bids</code>, ভাগগুলোও একই কলাম থেকে।"),
    });
  },

  /* Which kind of clause the thin field travels with.

     Two kinds sit in these notices: clauses about who may enter, and clauses
     about how the bids already in the box are to be treated. Both are counted
     against one outcome — one responsive bidder left — on the same denominator
     rule, and the baseline for all 591 tenders is drawn through the bars so a
     reader can see which are above it and which are not.

     Colour carries the family, which is the finding, so it needs a legend. Rows
     measured on fewer than the corpus floor of notices are drawn in the muted
     step and labelled in the table: the rate is still shown, because hiding it
     would be a choice about which findings a reader may check, but nothing in
     the article quotes one. */
  clause(corpus) {
    const c = corpus.clause;
    const fam = {
      rejection: { en: "Decides how a bid already received is treated", bn: "জমা পড়া দর নিয়ে কী হবে, তা ঠিক করে" },
      entry: { en: "Decides who is allowed to bid at all", bn: "কে আদৌ দর দিতে পারবে, তা ঠিক করে" },
    };
    const rows = c.rows.map((r) => ({
      label: label("clause", r.key),
      value: r.one_resp_pct || 0,
      color: r.reportable ? (r.family === "rejection" ? hue(0) : hue(1)) : SEQ[1],
      note: {
        en: n(r.one_resp) + " of " + n(r.with_bids) + " notices with a bid count" +
          (r.reportable ? "" : " — too few to quote"),
        bn: "দরের সংখ্যা আছে এমন " + n(r.with_bids) + "টির " + n(r.one_resp) + "টিতে" +
          (r.reportable ? "" : " — উদ্ধৃত করার মতো যথেষ্ট নয়"),
      },
      r,
    }));
    return figure({
      title: {
        en: "The clauses a one-bidder finish travels with are the ones about rejection",
        bn: "একজন দরদাতায় শেষ হওয়া যে শর্তগুলোর সঙ্গে মেলে, সেগুলো বাতিল করা নিয়ে",
      },
      deck: {
        en: "For each clause, the share of its notices that ended with exactly one responsive bidder. Across all " +
          n(c.baseline.with_bids) + " tenders with a bid count that share is " +
          pct(c.baseline.one_resp_pct) + ". The two clauses that govern how bids are treated sit well above it; the requirements about who may enter straddle it, and one of them has no single-bidder finish at all. Bars measured on fewer than " +
          n(c.floor) + " notices are muted and are not quoted in the article. Association across published notices, not cause.",
        bn: "প্রতিটি শর্তের ক্ষেত্রে, তার কত অংশ বিজ্ঞপ্তি ঠিক একজন গ্রহণযোগ্য দরদাতা দিয়ে শেষ হয়েছে। দরের সংখ্যা আছে এমন সব " +
          n(c.baseline.with_bids) + "টি দরপত্রে ওই হার " + pct(c.baseline.one_resp_pct) +
          "। জমা পড়া দর নিয়ে কী হবে তা ঠিক করে দেওয়া দুটি শর্ত এর অনেক উপরে; কে দর দিতে পারবে সেই শর্তগুলো এর দুই পাশেই ছড়ানো, আর একটিতে একজন দরদাতায় শেষ হওয়ার ঘটনাই নেই। " +
          n(c.floor) + "টির কম বিজ্ঞপ্তিতে মাপা দণ্ডগুলো হালকা রঙে, আর সেগুলো লেখায় উদ্ধৃত হয়নি। এটি প্রকাশিত বিজ্ঞপ্তির মধ্যে মিল, কারণ নয়।",
      },
      plot: barsH(rows, {
        labelW: 330, valueW: 60, rowH: 28, max: 100, fmt: (v) => pct(v, 0),
        alt: A({ en: "Share of notices ending with one responsive bidder, by clause.", bn: "শর্ত অনুযায়ী একজন গ্রহণযোগ্য দরদাতায় শেষ হওয়া বিজ্ঞপ্তির হার।" }, corpus),
      }),
      legend: [
        { color: hue(0), label: fam.rejection },
        { color: hue(1), label: fam.entry },
        { color: SEQ[1], label: { en: "Fewer than " + n(c.floor) + " notices — not quoted", bn: n(c.floor) + "টির কম বিজ্ঞপ্তি — উদ্ধৃত নয়" } },
      ],
      table: table(
        [{ en: "Clause", bn: "শর্ত" }, { en: "What it governs", bn: "কী নিয়ন্ত্রণ করে" },
         { en: "Notices", bn: "বিজ্ঞপ্তি" }, { en: "With a bid count", bn: "দরের সংখ্যা আছে" },
         { en: "One responsive bid", bn: "একটিই গ্রহণযোগ্য দর" }, { en: "Share", bn: "হার" },
         { en: "Middle bid count", bn: "দরের মাঝের মান" }, { en: "Contract value", bn: "চুক্তিমূল্য" }],
        rows.map((x) => [t(x.label), t(fam[x.r.family]), n(x.r.n), n(x.r.with_bids),
          n(x.r.one_resp), x.r.with_bids ? pct(x.r.one_resp_pct) : dash(),
          x.r.median_bids === null ? dash() : n(x.r.median_bids), cr(x.r.crore)])
          .concat([[t({ en: "All tenders with a bid count", bn: "দরের সংখ্যা আছে এমন সব দরপত্র" }),
            dash(), n(c.baseline.n), n(c.baseline.with_bids), n(c.baseline.one_resp),
            pct(c.baseline.one_resp_pct), n(c.baseline.median_bids), cr(corpus.money.crore)]])
      ),
      source: src(F.master.en + " — each clause column against <code>responsive_bids</code>.",
        F.master.bn + " — প্রতিটি শর্তের কলাম <code>responsive_bids</code>-এর বিপরীতে।"),
    });
  },

  /* The round that was run twice.

     A retender is the buying office recording in its own notice that the first
     attempt produced no contract. Where the second notice names the first in
     retendered_from_id, the abandoned round can be looked up and read — and it
     turns out to publish nothing at all about what happened in it. Same unit,
     notices, all the way down, and every line a subset of the one above, so the
     three zeros at the bottom are on the same scale as the 100. */
  retender(corpus) {
    const rt = corpus.retender;
    const rows = [
      { label: { en: "First rounds a later notice names as its predecessor", bn: "পরের বিজ্ঞপ্তি যেগুলোকে নিজের পূর্ববর্তী বলে নাম দিয়েছে" }, value: rt.linked },
      { label: { en: "Identical package description on both notices", bn: "দুই বিজ্ঞপ্তিতে প্যাকেজের বিবরণ অক্ষরে অক্ষরে এক" }, value: rt.same_package },
      { label: { en: "Bid count published", bn: "দরের সংখ্যা প্রকাশিত" }, value: rt.first_with_bids },
      { label: { en: "Any bidder named", bn: "কোনো দরদাতার নাম প্রকাশিত" }, value: rt.first_with_winner },
      { label: { en: "Any price published", bn: "কোনো দর প্রকাশিত" }, value: rt.first_with_value },
    ];
    return figure({
      title: {
        en: "The abandoned round leaves no record of itself",
        bn: "পরিত্যক্ত পর্বটি নিজের কোনো নথি রেখে যায় না",
      },
      deck: {
        en: n(rt.flagged) + " of the " + n(corpus.counts.tenders) +
          " notices record a retender — " + n(rt.first) +
          " saying the package would be tendered again, " + n(rt.second) +
          " that are the second attempt. " + n(rt.linked) +
          " of the second notices name the first outright, which makes the pair checkable. The first round publishes nothing about itself.",
        bn: n(corpus.counts.tenders) + "টি বিজ্ঞপ্তির " + n(rt.flagged) +
          "টিতে পুনঃদরপত্রের কথা আছে — " + n(rt.first) +
          "টিতে বলা হয়েছে প্যাকেজটি আবার ডাকা হবে, " + n(rt.second) +
          "টি দ্বিতীয় দফা। পরের বিজ্ঞপ্তির " + n(rt.linked) +
          "টি প্রথমটির নাম সরাসরি লিখেছে, ফলে জোড়াটি মিলিয়ে দেখা যায়। প্রথম পর্বটি নিজের সম্পর্কে কিছুই প্রকাশ করে না।",
      },
      plot: funnel(rows, { labelW: 330, alt: A({ en: "The abandoned first round publishes no bid count, no bidder and no price.", bn: "পরিত্যক্ত প্রথম পর্বে দরের সংখ্যা, দরদাতা বা দর কিছুই প্রকাশিত নয়।" }, corpus) }),
      table: table(
        [{ en: "Second attempt", bn: "দ্বিতীয় দফা" }, { en: "First attempt", bn: "প্রথম দফা" },
         { en: "Authority", bn: "সংস্থা" }, { en: "Package", bn: "প্যাকেজ" },
         { en: "Bids", bn: "দর" }, { en: "Responsive", bn: "গ্রহণযোগ্য" },
         { en: "Contract value", bn: "চুক্তিমূল্য" }, { en: "Winner", bn: "বিজয়ী" }],
        rt.rows.map((r) => [digits(r.second_id), digits(r.first_id), agencyName(r.agency),
          r.package || dash(), r.bids === null ? dash() : n(r.bids),
          r.responsive === null ? dash() : n(r.responsive),
          r.value ? cr(r.crore) : dash(), r.winner ? firmName(r.winner) : dash()])
      ),
      source: src(F.master.en + " — <code>retender_flag</code> and <code>retendered_from_id</code> joined back onto the same table.",
        F.master.bn + " — <code>retender_flag</code> ও <code>retendered_from_id</code> একই তালিকার সঙ্গে জোড়া।"),
    });
  },

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
      source: src(F.master.en + " — columns <code>total_bids_received</code>, <code>responsive_bids</code>, <code>bidders_rejected_count</code>, <code>rejection_reason</code>, <code>lowest_bid</code>.",
        F.master.bn + " — <code>total_bids_received</code>, <code>responsive_bids</code>, <code>bidders_rejected_count</code>, <code>rejection_reason</code>, <code>lowest_bid</code> কলাম।"),
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
      source: src(F.master.en + " — <code>competition_level</code> against <code>contract_value_bdt</code>, with the bid-count bands read off <code>total_bids_received</code>.",
        F.master.bn + " — <code>competition_level</code> ও <code>contract_value_bdt</code>, দরের সংখ্যার ভাগগুলো <code>total_bids_received</code> থেকে পড়া।"),
    });
  },

  /* One bar per authority, one unit: the share of that authority's notices
     that published no eligibility criteria at all. */
  agencies(corpus) {
    const rows = corpus.agencies.map((a) => ({
      label: agencyName(a.key), value: a.no_criteria_pct, a,
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
        rows.map((r) => [bodyName(r.a.organization), n(r.a.tenders), n(r.a.no_criteria),
          pct(r.a.no_criteria_pct), r.a.median_bids === null ? dash() : n(r.a.median_bids), cr(r.a.crore)])
      ),
      source: src(F.master.en + " — <code>eligibility_published</code> grouped by <code>agency</code>, counting a notice as publishing a bar only where that column reads <code>SUBSTANTIVE_TEXT_PUBLISHED</code>.",
        F.master.bn + " — <code>agency</code> অনুযায়ী <code>eligibility_published</code>, আর কলামে <code>SUBSTANTIVE_TEXT_PUBLISHED</code> থাকলেই কেবল ধরা হয়েছে শর্ত প্রকাশিত হয়েছে।"),
    });
  },
  /* One row per authority, one column per measure, one bar per cell, and a count
     at the end. Six measures on six honest denominators is the answer to "which
     one is worse" that these documents can carry; a single weighted index would
     be an answer this investigation invented, because no document in the folder
     printed it.

     Each column is scaled to its own highest value, because the six measures are
     in six different units and share no axis; one drawn across them would be a
     lie. The upright is the middle of the six on that column, so "above the
     middle" is something a reader can see rather than take on trust. The last
     column counts those placements. That count is ours, it weights nothing, and
     the article says so where it prints it. */
  authority(corpus) {
    const au = corpus.authority, M = au.measures;

    /* "49 of 96", in the order each language reads it. */
    const outOf = (part, whole) => t({
      en: n(part) + " of " + n(whole),
      bn: n(whole) + "টির মধ্যে " + n(part),
    });

    /* The parts behind a share, in the unit that share is made of: five of the
       six are documents counted, the sixth is money. */
    const parts = (k, m) => (k === "top1"
      ? t({ en: cr(m.crore) + " of " + cr(m.of_crore),
            bn: cr(m.of_crore) + "-এর মধ্যে " + cr(m.crore) })
      : outOf(m.n, m.of));

    const cols = au.order.map((k) => ({
      head: LABELS.authorityHead[k],
      max: M[k].max, middle: M[k].middle, fmt: (v) => pct(v),
    }));

    const rows = au.rows.map((r) => ({
      label: agencyName(r.key),
      sub: placeName(r.district),
      cells: au.order.map((k) => {
        const m = r.m[k];
        return {
          v: m ? m.pct : null,
          tip: bodyName(r.organization) + " — " + label("authority", k) + ": " +
            (m ? pct(m.pct) + " (" + parts(k, m) + ")" : dash()),
        };
      }),
      tail: n(r.above) + "/" + n(r.measured),
    }));
    return figure({
      wide: true,
      title: {
        en: "The six authorities, measured six ways",
        bn: "ছয় সংস্থা, ছয় মাপে",
      },
      deck: {
        en: "One row per authority, one column per measure, and each column scaled to its own highest value, because the six are in six different units and share no axis. The upright on a bar is the middle of the six on that measure. The last column counts how many of the six this body sits above that middle on — a count of placements, weighting nothing, and ours rather than any authority's. Under each name is the district its own notices print most often.",
        bn: "প্রতি সারিতে একটি সংস্থা, প্রতি কলামে একটি মাপ; প্রতিটি কলাম নিজের সর্বোচ্চ মানে মাপা, কারণ ছয়টি মাপ ছয় রকম এককে — কারও সঙ্গে কারও অক্ষ মেলে না। দণ্ডের খাড়া দাগটি ওই মাপে ছয়টির মাঝের মান। শেষ কলামটি গোনে, ছয়টির কতটিতে এই সংস্থা ওই মাঝের মানের উপরে — নিছক গোনা, কোনো ভার দেওয়া নেই, আর এটি আমাদের হিসাব, কোনো সংস্থার নয়। নামের নিচে সেই জেলা, যেটি ওই সংস্থার বিজ্ঞপ্তিতেই সবচেয়ে বেশিবার ছাপা হয়েছে।",
      },
      plot: el("div", { class: "tbl-scroll" }, matrix(rows, cols, {
        /* Drawn to the column, and only held wider than it — behind a scroller —
           where the column is too narrow for six columns of bars beside a name
           and a tail. 700 units is that width: below it the columns are under
           60 units each and the bars stop being comparable. */
        width: scrollCanvas(700), labelW: 120, tailW: 96,
        tail: [{ en: "Above the", bn: "মাঝের মানের" }, { en: "middle on", bn: "উপরে" }],
        absent: dash(),
        alt: A({
          en: "Six authorities against six measures, each column scaled to its own highest value. The figures are in the table below.",
          bn: "ছয়টি সংস্থা ছয়টি মাপের বিপরীতে, প্রতিটি কলাম নিজের সর্বোচ্চ মানে মাপা। সংখ্যাগুলো নিচের টেবিলে আছে।",
        }, corpus),
      })),
      legend: matrixLegend(),
      table: table(
        [{ en: "Authority", bn: "সংস্থা" },
         { en: "District printed most often", bn: "সবচেয়ে বেশি ছাপা জেলা" },
         { en: "Notices", bn: "বিজ্ঞপ্তি" }, { en: "Contract value", bn: "চুক্তিমূল্য" }]
          .concat(au.order.map((k) => LABELS.authority[k]))
          .concat([{ en: "Above the middle on", bn: "মাঝের মানের উপরে" }]),
        au.rows.map((r) => [bodyName(r.organization),
          placeName(r.district) + " " + n(r.district_n), n(r.tenders), cr(r.crore)]
          .concat(au.order.map((k) => (r.m[k]
            ? pct(r.m[k].pct) + " (" + parts(k, r.m[k]) + ")" : dash())))
          .concat([n(r.above) + "/" + n(r.measured)]))
      ),
      source: src(
        F.master.en + ", with the sixth measure from the clause tests — " +
        "<code>eligibility_published</code>; <code>responsive_bids</code> against " +
        "<code>total_bids_received</code>; <code>price_band_nonresponsive_clause</code>; " +
        "<code>signing_within_legal_band</code>; <code>contract_value_bdt</code> grouped by " +
        "<code>winner_name_normalised</code>; <code>clause_force</code> with " +
        "<code>instrument_timing_vs_this_tender</code>; and place from <code>pe_district</code> " +
        "as printed.",
        F.master.bn + ", ষষ্ঠ মাপটি ধারা-পরীক্ষা থেকে — " +
        "<code>eligibility_published</code>; <code>total_bids_received</code>-এর বিপরীতে " +
        "<code>responsive_bids</code>; <code>price_band_nonresponsive_clause</code>; " +
        "<code>signing_within_legal_band</code>; <code>winner_name_normalised</code> অনুযায়ী " +
        "<code>contract_value_bdt</code>; <code>clause_force</code> ও " +
        "<code>instrument_timing_vs_this_tender</code>; আর জেলা <code>pe_district</code> " +
        "থেকে, যেমন ছাপা হয়েছে তেমনই।"),
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
      source: src(F.master.en + " — <code>eligibility_restriction_level</code> against <code>total_bids_received</code> and <code>responsive_bids</code>.",
        F.master.bn + " — <code>eligibility_restriction_level</code> এবং <code>total_bids_received</code>, <code>responsive_bids</code>।"),
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
        en: "Each requirement as a multiple of the contract it was attached to. The line marks one times the contract value: to the right of it, a notice asked a bidder to be larger than the work. The money row takes whichever figure the notice set higher — yearly turnover, or cash and credit.",
        bn: "প্রতিটি শর্ত, সংশ্লিষ্ট চুক্তিমূল্যের গুণিতকে। রেখাটি চুক্তিমূল্যের সমান মাত্রা দেখায়: তার ডানদিকে গেলে বিজ্ঞপ্তি দরদাতাকে কাজের চেয়ে বড় হতে বলেছে। অর্থের সারিটি নেয় বিজ্ঞপ্তি যেটি বেশি ধরেছে — বার্ষিক লেনদেন, নয়তো নগদ ও ঋণসীমা।",
      },
      plot: percentileStrip(rows, {
        labelW: 210, reference: 1, min: 0, width: wideCanvas(),
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
      source: src(F.master.en + " — <code>turnover_to_contract_value_ratio</code>, <code>financial_bar_to_contract_value_ratio</code>, <code>similar_project_value_to_contract_value_ratio</code>, <code>security_to_contract_value_ratio</code>, <code>minimum_years_experience</code> and <code>minimum_similar_projects</code>, each row counting only the notices that published that figure.",
        F.master.bn + " — <code>turnover_to_contract_value_ratio</code>, <code>financial_bar_to_contract_value_ratio</code>, <code>similar_project_value_to_contract_value_ratio</code>, <code>security_to_contract_value_ratio</code>, <code>minimum_years_experience</code> ও <code>minimum_similar_projects</code>, প্রতিটি সারিতে কেবল সেসব বিজ্ঞপ্তিই গোনা যেগুলোতে ওই সংখ্যাটি প্রকাশিত।"),
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
      source: src(F.master.en + " — <code>publication_date</code> and <code>signing_date</code>, grouped by year; value from <code>contract_value_bdt</code>.",
        F.master.bn + " — বছর অনুযায়ী <code>publication_date</code> ও <code>signing_date</code>; মূল্য <code>contract_value_bdt</code> থেকে।"),
    });
  },

  /* Every award notice, sorted by what it says about its own deadline against
     what its own two dates show. The four rows are exhaustive and sum to the
     awarded set, so the reader can see the unanswered notices too rather than
     having them quietly dropped out of the denominator. */
  portal(corpus) {
    const p = corpus.portal;
    const rows = [
      { label: { en: "Says yes, and its dates agree", bn: "হ্যাঁ লেখা, তারিখও মেলে" },
        value: p.yes_within, color: hue(0) },
      { label: { en: "Says yes, but its dates run past the window", bn: "হ্যাঁ লেখা, অথচ তারিখ সময়সীমা ছাড়িয়ে গেছে" },
        value: p.over_cap, color: hue(1) },
      { label: { en: "Says no", bn: "না লেখা" }, value: p.no, color: hue(2) },
      { label: { en: "Does not answer", bn: "উত্তর নেই" }, value: p.blank, color: SEQ[1] },
    ];
    return figure({
      title: { en: "What the award notice says about its own deadline", bn: "চুক্তির বিজ্ঞপ্তি তার নিজের সময়সীমা নিয়ে কী বলে" },
      deck: {
        en: "Each of the " + n(corpus.counts.awarded) + " award notices answers one question — was the contract signed in due time? — and prints the two dates that settle it. On " +
          n(p.over_cap) + " of them, worth " + cr(p.over_crore) + ", the answer is yes and the dates are not.",
        bn: "চুক্তির " + n(corpus.counts.awarded) + "টি বিজ্ঞপ্তির প্রত্যেকটিতে একটি প্রশ্নের উত্তর আছে — চুক্তি কি যথাসময়ে স্বাক্ষরিত হয়েছে? — আর সেই সঙ্গে ছাপা আছে মীমাংসাকারী দুটি তারিখ। এর মধ্যে " +
          n(p.over_cap) + "টিতে, যার মূল্য " + cr(p.over_crore) + ", উত্তর হ্যাঁ, তারিখ দুটি নয়।",
      },
      /* The gutter fits the longest of the four labels, which is the English
         "Says yes, but its dates run past the window" at 279 of the 820 canvas
         units. The labels are right-aligned against it, so the three shorter
         ones simply leave whitespace to their left and the width costs nothing. */
      plot: barsH(rows, {
        labelW: 300, valueW: 60, rowH: 34, fmt: (v) => n(v),
        alt: A({ en: "Award notices by what they record about the signing deadline.", bn: "স্বাক্ষরের সময়সীমা নিয়ে কী লেখা, সেই অনুযায়ী চুক্তির বিজ্ঞপ্তি।" }, corpus),
      }),
      table: table(
        [{ en: "What the notice records", bn: "বিজ্ঞপ্তিতে যা লেখা" }, { en: "Notices", bn: "বিজ্ঞপ্তি" },
         { en: "Share of award notices", bn: "চুক্তির বিজ্ঞপ্তির হার" }],
        rows.map((r) => [r.label, n(r.value), pct((r.value / corpus.counts.awarded) * 100)])
      ),
      source: src(F.master.en + " — <code>portal_self_certified_signed_in_due_time</code> against <code>noa_date</code> and <code>signing_date</code>, tested at the window the contract's own value allows.",
        F.master.bn + " — <code>portal_self_certified_signed_in_due_time</code>-এর বিপরীতে <code>noa_date</code> ও <code>signing_date</code>, চুক্তির নিজের মূল্য অনুযায়ী প্রাপ্য সময়সীমায় পরীক্ষা করা।"),
    });
  },

  /* The seven conditions, counted per notice. This is the one figure in the
     article built entirely from our own tests rather than from a field the
     documents print, so the deck says so before the reader reads a bar. */
  stack(corpus) {
    const rows = corpus.preselection.stages;
    return figure({
      title: { en: "How many of the seven conditions each notice meets", bn: "প্রতিটি বিজ্ঞপ্তি সাতটি শর্তের কতটি পূরণ করে" },
      deck: {
        en: "Seven conditions, tested one after another on every notice in the set: a restrictive-looking requirement, few bids, documents sold that never came back as bids, bidders ruled non-responsive, a single responsive bidder, a winner that wins repeatedly, and a winner whose wins come in thin fields. Meeting several is not evidence of anything. It is where a reporter would start.",
        bn: "সাতটি শর্ত, সম্ভারের প্রতিটি বিজ্ঞপ্তিতে একের পর এক পরীক্ষা করা: সীমাবদ্ধকারী বলে মনে হওয়া কোনো শর্ত, অল্প দর, বিক্রি হওয়া দলিল যা দর হয়ে ফেরেনি, অগ্রহণযোগ্য বিবেচিত দরদাতা, একটিই গ্রহণযোগ্য দর, বারবার জেতা বিজয়ী, এবং যে বিজয়ীর জয় আসে পাতলা প্রতিযোগিতায়। একাধিক শর্ত মেলা কোনো কিছুর প্রমাণ নয়। এটি সেই জায়গা, যেখান থেকে একজন প্রতিবেদক শুরু করবেন।",
      },
      plot: columns(rows.map((r) => r.key), rows.map((r) => r.n), {
        height: 230, padL: 44, color: hue(3),
        label: { en: "Notices", bn: "বিজ্ঞপ্তি" },
        alt: A({ en: "Notices by how many of the seven conditions they meet.", bn: "সাতটি শর্তের কতটি পূরণ করে, সেই অনুযায়ী বিজ্ঞপ্তি।" }, corpus),
      }),
      table: table(
        [{ en: "Conditions met", bn: "পূরণ হওয়া শর্ত" }, { en: "Notices", bn: "বিজ্ঞপ্তি" },
         { en: "Share of the set", bn: "সম্ভারের হার" }],
        rows.map((r) => [digits(r.key), n(r.n), pct((r.n / corpus.counts.tenders) * 100)])
      ),
      source: src(F.master.en + " — <code>preselection_stage_count</code> and <code>preselection_stages_met</code>.",
        F.master.bn + " — <code>preselection_stage_count</code> ও <code>preselection_stages_met</code>।"),
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
      plot: stackedShare(parts, { width: wideCanvas(), alt: A({ en: "Share of contract value by firm rank.", bn: "প্রতিষ্ঠানের ক্রম অনুযায়ী চুক্তিমূল্যের অংশ।" }, corpus) }),
      table: table(
        [{ en: "Firms", bn: "প্রতিষ্ঠান" }, { en: "Share of the money", bn: "অর্থের অংশ" }],
        parts.map((p) => [t(p.label), pct(p.value)])
      ),
      source: src(F.master.en + " — <code>winner_name_normalised</code> against <code>contract_value_bdt</code>, the bands being the cumulative top-1, top-5, top-10 and top-20 shares of all awarded value, differenced.",
        F.master.bn + " — <code>contract_value_bdt</code>-এর বিপরীতে <code>winner_name_normalised</code>, আর স্তরগুলো ক্রমযোজিত শীর্ষ-১, ৫, ১০ ও ২০-এর অংশের বিয়োগফল।"),
    });
  },
  /* The nine rules that recorded a mismatch, counted only where the document
     cited can be placed at or before the tender's own year, and coloured by the
     one distinction that decides what the count is worth: whether the clause is
     worded as a duty or as a figure the document recommends. The colour carries
     an attribute of the rule, never its rank, and the same distinction is
     written out in the table, so nothing here rests on colour alone. */
  violations(corpus) {
    const v = corpus.violations;
    if (!v) return null;
    const rows = v.rules.slice().sort((a, b) => b.in_force - a.in_force);
    const DUTY = { en: "Worded as a duty", bn: "বাধ্যতা হিসেবে লেখা" };
    const BAND = { en: "A recommended band, a ceiling in a note, or guidance",
      bn: "সুপারিশকৃত সীমা, নোটে দেওয়া সর্বোচ্চ সীমা, বা নির্দেশনা" };

    return figure({
      wide: true,
      title: { en: "The mismatches that survive the timing check, rule by rule",
        bn: "সময়ের পরীক্ষা টিকে যাওয়া বিচ্যুতি, নিয়ম ধরে ধরে" },
      deck: {
        en: n(v.in_force) + " of the " + n(corpus.rules_summary.deviation_rows) +
          " recorded mismatches cite a document that can be placed at or before the year of the tender's own event. " +
          n(v.duty_in_force) + " of those are against a clause worded as a duty and " +
          n(v.band_in_force) + " against a band, a ceiling in a note or guidance. " +
          "Bars count the surviving tests; the full count is in the table.",
        bn: "নথিভুক্ত " + n(corpus.rules_summary.deviation_rows) + "টি বিচ্যুতির " +
          n(v.in_force) + "টিতে উদ্ধৃত দস্তাবেজটিকে দরপত্রের নিজের ঘটনার বছরে বা তার আগে বসানো যায়। এর " +
          n(v.duty_in_force) + "টি বাধ্যতা হিসেবে লেখা ধারার বিপরীতে, আর " +
          n(v.band_in_force) + "টি সুপারিশকৃত সীমা, নোটের সর্বোচ্চ সীমা বা নির্দেশনার বিপরীতে। " +
          "দণ্ডগুলো টিকে যাওয়া পরীক্ষা গোনে; পুরো সংখ্যা টেবিলে আছে।",
      },
      plot: barsH(rows.map((r) => ({
        label: t(RULE_SHORT[r.code] || { en: human(r.short), bn: human(r.short) }),
        value: r.in_force,
        color: r.duty ? hue(0) : hue(1),
        note: RULE_TITLES[r.code],
      })), {
        labelW: 340, valueW: 60, rowH: 32, width: wideCanvas(),
        alt: A({ en: "Mismatches per rule where the cited document was plausibly in force.",
          bn: "যেসব নিয়মে উদ্ধৃত দস্তাবেজ তখন বলবৎ থাকা সম্ভব ছিল, সেখানকার বিচ্যুতি।" }, corpus),
      }),
      legend: [{ color: hue(0), label: DUTY }, { color: hue(1), label: BAND }],
      table: table(
        [{ en: "Rule", bn: "নিয়ম" }, { en: "What it tests", bn: "যা পরীক্ষা করে" },
          { en: "How the clause is worded", bn: "ধারাটি যেভাবে লেখা" },
          { en: "Mismatches", bn: "বিচ্যুতি" },
          { en: "Of those, cited document in force", bn: "এর মধ্যে উদ্ধৃত দস্তাবেজ বলবৎ" }],
        rows.map((r) => [
          digits(r.code),
          t(RULE_TITLES[r.code] || { en: human(r.short), bn: human(r.short) }),
          label("force", r.force),
          n(r.deviations),
          n(r.in_force),
        ]),
        { textCols: true }
      ),
      source: src(F.dev.en + " — columns <code>rule_code</code>, <code>clause_force</code> and " +
        "<code>instrument_timing_vs_this_tender</code>, each bar counting only the rows whose " +
        "timing flag reads <code>INSTRUMENT_PLAUSIBLY_IN_FORCE</code>.",
        F.dev.bn + " — <code>rule_code</code>, <code>clause_force</code> ও " +
        "<code>instrument_timing_vs_this_tender</code> কলাম, আর প্রতিটি দণ্ড কেবল সেই সারিগুলোই গোনে " +
        "যেগুলোর সময়-চিহ্নে <code>INSTRUMENT_PLAUSIBLY_IN_FORCE</code> লেখা।"),
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
        labelW: 320, valueW: 70, rowH: 32, width: wideCanvas(),
        alt: A({ en: "Outcomes of the rule tests.", bn: "নিয়ম পরীক্ষার ফলাফল।" }, corpus),
      }),
      table: table(
        [{ en: "Outcome", bn: "ফলাফল" }, { en: "Tests", bn: "পরীক্ষা" }, { en: "Share", bn: "হার" }],
        rs.results.map((r) => [label("results", r.key), n(r.n), pct((r.n / rs.tested_rows) * 100)])
      ),
      source: src(F.dev.en + " — " + n(rs.tested_rows) + " rows, column <code>test_result</code>, with " +
        n(rs.postdates_event) + " of the " + n(rs.deviation_rows) +
        " deviation rows citing an instrument dated after the event tested and " +
        n(rs.plausibly_in_force) + " one plausibly in force at the time.",
        F.dev.bn + " — " + n(rs.tested_rows) + "টি সারি, <code>test_result</code> কলাম, আর " +
        n(rs.deviation_rows) + "টি বিচ্যুতির সারির " + n(rs.postdates_event) +
        "টিতে উদ্ধৃত দস্তাবেজের তারিখ পরীক্ষিত ঘটনার পরের, " + n(rs.plausibly_in_force) +
        "টিতে তখন বলবৎ থাকা সম্ভব ছিল।"),
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
        entity: agencyName(x.agency),
        tender: x.tender_id,
        page: x.page,
        column: x.column,
        links: links,
      })),
    ]);
  }));
}

/* ---------------------------------------------------------------- the opening
   The article opens on one tender, because 1,155 of them is not a thing a
   reader can picture and one road is. Which tender is not a taste decision:
   build.py picks it with a published rule — the largest contract where a real
   field of bidders narrowed to one — and the rule and the size of the pool it
   was picked from are printed with the scene, so a reader can see the case was
   selected and not shopped for.

   Returned as a fragment rather than a wrapper, so every piece lands as a
   direct child of .prose and inherits the measure, the spacing, the drop cap
   and the exhibit and source components the rest of the article uses. The case
   study needs no box: it is the first scene of the story, not an aside.

   The scene is prose about one specific road, so it is the one place in this
   article where the words are pinned to an id rather than filled from a row. If
   the corpus ever moves under it and the rule returns a different tender, the
   page prints the mismatch where the scene would have been and names both ids.
   Silence would be a lie: the paragraphs would still read as fact. */

function caseBlock(corpus) {
  const c = corpus.case;
  if (!c) return null;
  const w = CASE.words;

  if (String(c.tender_id) !== String(CASE.tender)) return drifted(CASE.tender, c);

  const frag = document.createDocumentFragment();

  frag.appendChild(caseWhere(c, false));

  CASE.open.forEach((p, i) => frag.appendChild(
    el("p", { class: i ? null : "lede", html: T(p, corpus) })));

  /* The eligibility clause as the page prints it, with the one figure the scene
     reads out of it marked inside the quotation, so our sentence and the words
     it rests on can be checked against each other in a single glance. */
  frag.appendChild(el("div", { class: "exhibit" }, [
    el("p", { class: "exhibit-label", text: t(w.quoteLabel) }),
    quoted(c.mark, c.quote_experience),
    el("p", { class: "exhibit-read", html: T(w.quoteRead, corpus) }),
    el("p", { class: "case-note", text: t(w.markNote) }),
  ]));

  CASE.after.forEach((p) => frag.appendChild(el("p", { html: T(p, corpus) })));

  frag.appendChild(caseRec(c, ["bids", "responsive", "value", "signed"]));
  frag.appendChild(caseSrc(c));
  frag.appendChild(caseRule(c));

  CASE.close.forEach((p) => frag.appendChild(el("p", { html: T(p, corpus) })));
  return frag;
}

/* ------------------------------------------------------- the case studies
   The same scene at two lengths, at the places where the article changes
   subject. A transition study has to do two jobs at once — leave the aggregate,
   and set up the count that follows — so it is built from the pieces below in a
   fixed order and given a hairline above it, which is the whole of its
   decoration.

   `compact` is the form the article uses now: the tender named, the passage from
   its own page with the operative words marked, the figures that passage turns
   on, the two PDFs and the selection rule — and none of the scene's paragraphs.
   It is the evidence without the essay, which is what lets every one of these
   twelve cases sit inside a thousand-word article at the finding it belongs to
   rather than in a long version at the foot of the page. The full form, with the
   paragraphs, is still what the opening scene draws.

   Each is pinned to an id like the opening, and drifts the same way: if the
   published rule stops returning the tender the paragraphs describe, the page
   prints the mismatch rather than a scene about the wrong road. */

function sceneBlock(corpus, id, compact) {
  const c = (corpus.cases || {})[id];
  const spec = CASES[id];
  if (!c || !spec) return null;
  if (String(c.tender_id) !== String(spec.tender)) return drifted(spec.tender, c);

  const frag = document.createDocumentFragment();
  frag.appendChild(caseWhere(c, true));
  if (!compact) spec.p.forEach((p) => frag.appendChild(el("p", { html: T(p, corpus) })));

  if (c.mark) {
    frag.appendChild(el("div", { class: "exhibit" }, [
      /* Two of these labels quote a figure — the peer middle, the reuse count —
         so the label goes through the same resolution as the prose around it.
         It is a text slot, so it takes the tag-free form. */
      el("p", { class: "exhibit-label", text: A(spec.markLabel, corpus) }),
      quoted(c.mark, ""),
      el("p", { class: "exhibit-read", html: T(spec.markRead, corpus) }),
      el("p", { class: "case-note", text: t(CASE.words.markNote) }),
    ]));
  }

  frag.appendChild(caseRec(c, spec.rec));
  frag.appendChild(caseSrc(c));
  frag.appendChild(caseRule(c));
  if (!compact) spec.after.forEach((p) => frag.appendChild(el("p", { html: T(p, corpus) })));
  return frag;
}

/* ------------------------------------------------- the parts a scene is made of

   Where and what, above the first line, the way a report opens on a place. */
function caseWhere(c, turn) {
  return el("p", { class: turn ? "case-where case-turn" : "case-where" },
    [placeName(c.district), t(UI.words.tender) + " " + digits(c.tender_id),
      bodyName(c.organization)].filter(Boolean).join(" · "));
}

/** A quotation with the operative words marked. `mark` is built by build.py from
    the extracted page text and splits the passage in three; when the pattern
    found nothing it hands back the whole passage as the hit, and when there is
    no passage at all the fallback text is printed unmarked. Highlighted document
    text is the strongest evidence this environment can render: the page's own
    words, with the part being read marked, one click from the PDF. */
function quoted(mark, fallback) {
  if (!mark) return el("blockquote", null, el("p", { text: fallback }));
  return el("blockquote", null, el("p", null, [
    mark.before || null, el("mark", { text: mark.hit }), mark.after || null,
  ]));
}

/** The figures a scene turns on, named by the scene so the strip carries what
    this particular case is about. Formatting stays here, in one place. */
const REC = {
  sold: (c) => [CASE.words.sold, n(c.sold)],
  bids: (c) => [CASE.words.bids, n(c.bids)],
  responsive: (c) => [CASE.words.responsive, n(c.responsive)],
  rejected: (c) => [CASE.words.rejected, n(c.rejected)],
  value: (c) => [UI.words.value, taka(c.value)],
  liquid: (c) => [CASE.words.liquid, taka(c.liquid)],
  noa: (c) => [CASE.words.noa, date(c.noa)],
  signed: (c) => [CASE.words.signed, date(c.signed)],
  days: (c) => [CASE.words.days, n(c.days)],
  overrun: (c) => [CASE.words.overrun, n(c.overrun)],
  winnerRec: (c) => [CASE.words.winnerRec, firmName(c.winner) || dash()],

  /* The rows the transition studies added. Each is a field the case already
     carries, formatted once here so a scene names the figure and never the
     format. `certified` is the portal's own one-word answer, printed as a word
     rather than as the string the column holds, so the Bangla edition can print
     it in Bangla; `share` is this contract measured against every taka in the
     awarded set, which is the only row on any scene that is relative. */
  peerSize: (c) => [CASE.words.peerSize, n(c.peer_size)],
  peerMedian: (c) => [CASE.words.peerMedian, n(c.peer_median)],
  shared: (c) => [CASE.words.shared, n(c.shared_clauses)],
  reuse: (c) => [CASE.words.reuse, n(c.reuse)],
  cap: (c) => [CASE.words.cap, n(c.cap)],
  certified: (c) => [CASE.words.certified,
    t(c.certified === "yes" ? CASE.words.yes
      : c.certified === "no" ? CASE.words.no : CASE.words.unanswered)],
  share: (c) => [CASE.words.share, pct(c.value_share, 2)],
  stages: (c) => [CASE.words.stages, n(c.stages)],
  score: (c) => [CASE.words.score, n(c.score, 1)],
  rejectRate: (c) => [CASE.words.rejectRate, pct(c.reject_rate)],
};

function caseRec(c, keys) {
  return el("dl", { class: "case-rec" }, keys.map((k) => {
    const [label, value] = REC[k](c);
    return el("div", null, [el("dt", { text: t(label) }), el("dd", { text: value })]);
  }));
}

/* The invitation reference is deliberately not passed as pkg: cite() prints the
   word "package" in front of it, and a tender's package number is not its
   reference number. */
function caseSrc(c) {
  const links = [];
  if (c.notice && c.notice.file) {
    links.push(el("a", { href: href(c.notice.dir, c.notice.file), text: t(UI.words.noticePdf) }));
  }
  if (c.award && c.award.file) {
    links.push(el("a", { href: href(c.award.dir, c.award.file), text: t(UI.words.awardPdf) }));
  }
  return el("p", { class: "src" },
    cite({ entity: agencyName(c.agency), tender: c.tender_id, page: c.page, links: links }));
}

/* The selection rule as build.py states it, column names and all, so an editor
   can re-run the choice rather than take the paragraph's word for it. The column
   names are wrapped in <code> in the corpus, which is why this one renders as
   html: an identifier is set as an identifier in both editions, so the Bangla
   article carries no loose English words. */
function caseRule(c) {
  return el("p", { class: "case-rule",
    html: "<b>" + t(CASE.words.ruleLabel) + ": </b>" + t(c.rule) });
}

function drifted(pinned, c) {
  return el("p", { class: "unresolved" },
    t(CASE.words.mismatch) + " " + digits(String(pinned)) + " → " + digits(String(c.tender_id)));
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

    /* The opening scene carries no id and draws in full. Every other case is
       named and draws as evidence: the document, the figures and the links,
       without the paragraphs. */
    case "case":
      return b.id ? sceneBlock(corpus, b.id) : caseBlock(corpus);

    case "evidence":
      return b.id ? sceneBlock(corpus, b.id, true) : null;

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
    the story tab, and again whenever the language changes.

    `doc` is the parsed site/story.md when that file was readable — the article a
    reader sees is written there, so it can be edited, retranslated or reordered
    without touching any JavaScript. When the file is missing or unparseable the
    argument is null and the copy compiled into content.js is drawn instead, so
    the page is never blank because a text file moved. The byline never comes
    from the file: the reporter, the portrait and the role belong to the
    publication, not to the story. */
export function renderStory(root, corpus, doc) {
  const h = (doc && doc.head) || {};
  const head = el("header", { class: "story-head" }, [
    el("p", { class: "kicker", html: T(h.kicker || HEAD.kicker, corpus) }),
    el("h1", { class: "hed", html: T(h.hed || HEAD.hed, corpus) }),
    el("p", { class: "dek", html: T(h.dek || HEAD.dek, corpus) }),
    el("div", { class: "byline" }, [
      bylineMark(),
      el("span", null, [
        el("span", { class: "byline-who", text: t(HEAD.byline) }),
        el("span", { class: "byline-what", html: T(HEAD.role, corpus) }),
      ]),
    ]),
  ]);

  const blocks = doc && doc.blocks && doc.blocks.length ? doc.blocks : STORY;
  const body = el("div", { class: "prose" }, blocks.map((b) => block(b, corpus)).filter(Boolean));

  root.appendChild(head);
  root.appendChild(body);
  return root;
}

/* -------------------------------------------------------- the closing sections
   What the documents cannot tell us, and how to check the article — the same
   writing, drawn by the same builders, in the stack at the foot of the page
   instead of at the end of the article. Neither carries a heading of its own:
   the section it opens out of is its heading. Neither is drawn on arrival
   either, which is the point of moving them — a reader who wants the caveats or
   the doors opens them, and a reader who has finished the story is finished. */

function closing(root, corpus, blocks) {
  root.appendChild(el("div", { class: "prose" },
    blocks.map((b) => block(b, corpus)).filter(Boolean)));
  return root;
}

export function renderLimits(root, corpus) { return closing(root, corpus, LIMITS); }

export function renderCheck(root, corpus) { return closing(root, corpus, CHECK); }
