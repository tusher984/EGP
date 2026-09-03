/* e-GP WATCH — the tools tab: four ways into the same 1,155 records.
   ------------------------------------------------------------------
   This tab is the part an editor uses. Nothing here summarises: every view
   ends at a named tender, the page of the PDF the figure was read from, and a
   link to that PDF. Four tools, each behind its own disclosure so the tab
   opens quickly and a reader takes only the one they want:

     · search        — every word in every extracted document section
     · tenders       — filter the 1,155 and open any record in full
     · firms         — the 304 winning firms, and what each one won
     · clause reuse  — eligibility wording that recurs across tenders

   Two rules hold everywhere in here. Labels are translated; evidence is not.
   A firm's name, a tender number, a clause as printed and a PDF filename are
   quoted exactly as the document has them, in both editions, because an
   editor has to be able to match the string on the screen to the string in
   the file. And no view invents a value: where the record is blank the cell
   says what is missing, never zero. */

import {
  el, t, n, pct, cr, taka, takaBoth, ratio, digits, date, dash, fill, fillText, href, human, clear,
  stop, ofTotal,
} from "./core.js";
import { figure, table, barsH, hue } from "./charts.js";
import { UI, LABELS } from "./content.js";

const W = {
  intro: {
    en: "Four tools over the same records. Labels here are translated; the evidence is not — a firm's name, a tender number and a clause as printed are quoted exactly as the document has them, so the string on your screen matches the string in the file.",
    bn: "একই নথির ওপর চারটি টুল। এখানে লেবেল অনুবাদ করা, প্রমাণ নয় — প্রতিষ্ঠানের নাম, দরপত্র নম্বর ও ছাপা ধারা হুবহু নথির মতোই রাখা হয়েছে, যাতে পর্দার লেখা আর ফাইলের লেখা মিলিয়ে দেখা যায়।",
  },
  searchTool: { en: "Search every document", bn: "সব নথিতে খুঁজুন" },
  searchNote: {
    en: "Words, phrases, tender numbers, firm names, clause text",
    bn: "শব্দ, বাক্যাংশ, দরপত্র নম্বর, প্রতিষ্ঠানের নাম, ধারার লেখা",
  },
  tenderTool: { en: "Filter the tenders", bn: "দরপত্র ছেঁকে দেখুন" },
  tenderNote: { en: "All {{counts.tenders|n}}, filtered and sorted, each openable in full", bn: "সব {{counts.tenders|n}}টি, ছেঁকে ও সাজিয়ে, প্রতিটি পূর্ণভাবে খোলা যায়" },
  firmTool: { en: "The winning firms", bn: "বিজয়ী প্রতিষ্ঠানগুলো" },
  firmNote: { en: "Who won, how much, and where", bn: "কে জিতেছে, কত, কোথায়" },
  clauseTool: { en: "Eligibility wording that recurs", bn: "পুনরাবৃত্ত যোগ্যতার ভাষা" },
  clauseNote: { en: "The same sentence in more than one tender", bn: "একাধিক দরপত্রে একই বাক্য" },

  q: { en: "Search", bn: "খোঁজ" },
  qHint: { en: "e.g. reputed · \"liquid assets\" · agency:CDA bids:1 · signed:2023", bn: "যেমন reputed · \"liquid assets\" · agency:CDA bids:1 · signed:2023" },
  syntax: { en: "What you can type", bn: "কী কী লেখা যায়" },
  fuzzy: { en: "No document contains", bn: "কোনো নথিতে নেই" },
  fuzzyTo: { en: "searched instead for", bn: "বদলে খোঁজা হয়েছে" },
  noHits: { en: "Nothing in the documents matches that.", bn: "নথিতে এর সঙ্গে কিছু মেলেনি।" },
  /* English inflects on one; Bangla does not, so both Bangla strings are the
     same word and the pair still exists — a caller should not have to know
     which languages inflect. */
  hits: { en: "tenders match", bn: "টি দরপত্র মিলেছে" },
  hits1: { en: "tender matches", bn: "টি দরপত্র মিলেছে" },
  order: { en: "Ordered by how often the words appear, then by contract value.", bn: "শব্দ কতবার এসেছে সেই অনুসারে, তারপর চুক্তিমূল্য অনুসারে সাজানো।" },
  openRecord: { en: "Open the full record", bn: "পূর্ণ নথি খুলুন" },
  sort: { en: "Order by", bn: "সাজান" },
  onlyDev: { en: "Only tenders with a deviation", bn: "কেবল বিচ্যুতিসহ দরপত্র" },
  onlySingle: { en: "Only one responsive bid", bn: "কেবল একটি গ্রহণযোগ্য দর" },
  onlyAward: { en: "Only awarded contracts", bn: "কেবল প্রদত্ত চুক্তি" },
  minWins: { en: "At least this many contracts", bn: "অন্তত এতটি চুক্তি" },
  firmName: { en: "Firm name contains", bn: "প্রতিষ্ঠানের নামে আছে" },
  notice: { en: "What the notice says", bn: "বিজ্ঞপ্তিতে যা আছে" },
  dates: { en: "Dates", bn: "তারিখ" },
  bidsHead: { en: "Bids", bn: "দরপত্র" },
  askedHead: { en: "What a bidder had to have", bn: "দরদাতার যা থাকতে হতো" },
  awardHead: { en: "The award", bn: "চুক্তি প্রদান" },
  signals: { en: "Signals recorded on this tender", bn: "এই দরপত্রে চিহ্নিত সংকেত" },
  rulesHead: { en: "Rules tested on this tender", bn: "এই দরপত্রে পরীক্ষিত নিয়ম" },
  excerptHead: { en: "The wording, as extracted", bn: "উদ্ধৃত ভাষা, যেভাবে পাওয়া গেছে" },
  whereHead: { en: "Where this was read", bn: "কোথা থেকে পড়া হয়েছে" },
  readerHead: { en: "For a reporter", bn: "সাংবাদিকের জন্য" },
  gapsHead: { en: "Not in these documents", bn: "এই নথিতে নেই" },
  hypothesis: { en: "A hypothesis, not a finding", bn: "একটি অনুমান, সিদ্ধান্ত নয়" },
  nextStep: { en: "What would settle it", bn: "কী দিয়ে নিশ্চিত হওয়া যাবে" },
  caveat: { en: "The caveat on every rule citation", bn: "প্রতিটি নিয়ম উদ্ধৃতির সতর্কতা" },
  contracts: { en: "The contracts this firm won", bn: "এই প্রতিষ্ঠান যে চুক্তিগুলো পেয়েছে" },
  spellings: { en: "How the documents spell it", bn: "নথিতে যেভাবে লেখা" },
  owners: { en: "Owner named on the award notice", bn: "চুক্তিপত্রে উল্লিখিত মালিক" },
  usedIn: { en: "Tenders using this wording", bn: "এই ভাষা ব্যবহার করা দরপত্র" },
  /* The clause tool's count line, in the two halves the sentence needs. The
     Bangla opens with the classifier because a numeral comes immediately before
     it, and the tender count that closes the sentence carries one for the same
     reason — sentences take the classifier here, compact metadata lines do not. */
  sentence1: { en: "distinct sentence, shared across ", bn: "টি আলাদা বাক্য, মিলিয়ে " },
  sentences: { en: "distinct sentences, shared across ", bn: "টি আলাদা বাক্য, মিলিয়ে " },
  acrossOne: { en: "tender", bn: "টি দরপত্র" },
  acrossMany: { en: "tenders", bn: "টি দরপত্র" },
};

/* ------------------------------------------------------------------ helpers */

function lab(map, key) {
  const m = LABELS[map] || {};
  return m[key] === undefined ? human(key) : t(m[key]);
}

/** A key-value row. Absent values print what is missing, never a zero. */
function kv(k, v) {
  return [el("dt", { text: t(k) }), el("dd", null, v === null || v === undefined || v === "" ? dash() : v)];
}

/** A row that is omitted rather than dashed when there is nothing to say. Used
    where the absence is not itself the point — the notice's own spelling of a
    firm is worth showing when it differs from the one on the rest of the site,
    and worth no row at all when it does not. */
function kvIf(k, v) {
  return v === null || v === undefined || v === "" ? [] : kv(k, v);
}

function pill(text, kind) {
  return el("span", { class: "pill" + (kind ? " pill-" + kind : ""), text: text });
}

/** The gap between a numeral and the word after it: none where the Bangla word
    opens with the classifier টি — ২২৬টি, never ২২৬ টি — and a space otherwise,
    which is every English word and every bare Bangla noun. Separate from unit()
    below because a call site that emphasises the numeral in its own element
    needs the separator on its own. */
function sep(word) { return word.indexOf("টি") === 0 ? "" : " "; }

/** A count and the noun it counts. English inflects on one and Bangla does not,
    so the two forms are chosen here rather than at each call site — a summary
    line that reads "1 bids" is the kind of thing a reader stops trusting the
    page over. Both members of a Bangla pair are normally the same word. */
function unit(v, one, many) {
  const word = t(v === 1 ? one : many);
  return n(v) + sep(word) + word;
}

/** The list of PDFs a tender was read from, as links. */
function pdfLinks(r) {
  const out = [];
  if (r.notice && r.notice.file) {
    out.push(el("a", { href: href(r.notice.dir, r.notice.file), text: t(UI.words.noticePdf) }));
  }
  if (r.award && r.award.file) {
    if (out.length) out.push(el("span", { text: " · " }));
    out.push(el("a", { href: href(r.award.dir, r.award.file), text: t(UI.words.awardPdf) }));
  }
  return out.length ? out : dash();
}

function splitList(s) {
  if (!s) return [];
  if (Array.isArray(s)) return s.filter(Boolean);
  return String(s).split(/[;,]\s*/).map((x) => x.trim()).filter((x) => x && x !== "none");
}
/** deviations.json stores its long strings once in a shared table and puts an
    index in the row, with −1 for "no such string". Unpack a tender's rows back
    into named fields so the record can read them like any other object. */
function devRows(ctx, id) {
  const D = ctx.deviations;
  const interned = new Set(D.interned);
  return (D.byTender[id] || []).map((row) => {
    const out = {};
    D.fields.forEach((f, i) => {
      const v = row[i];
      out[f] = interned.has(i) ? (v >= 0 ? D.strings[v] : "") : v;
    });
    return out;
  });
}

/* ------------------------------------------------------------- one record
   Everything the three CSVs hold on one tender, in the order an editor reads
   it: what was advertised, when, how many bid, what was required, who won,
   what was flagged, which rules were tested, the wording itself, and finally
   where each of those was read from. */

function recNotice(r) {
  return [
    el("h4", { text: t(W.notice) }),
    el("dl", { class: "kv" }, [
      ...kv({ en: "Tender number", bn: "দরপত্র নম্বর" }, digits(r.tender_id)),
      ...kv({ en: "Reference", bn: "রেফারেন্স" }, r.tender_reference),
      ...kv(UI.words.agency, r.organization || r.agency),
      ...kv({ en: "Procuring entity", bn: "ক্রয়কারী কর্তৃপক্ষ" }, r.procuring_entity),
      ...kv({ en: "District", bn: "জেলা" }, r.pe_district),
      ...kv({ en: "Project", bn: "প্রকল্প" }, r.project_name),
      ...kv({ en: "Package", bn: "প্যাকেজ" }, r.package_description),
      ...kv({ en: "Kind of procurement", bn: "ক্রয়ের ধরন" }, r.procurement_nature),
      ...kv({ en: "Method", bn: "পদ্ধতি" }, r.procurement_method),
      ...kv({ en: "Evaluation", bn: "মূল্যায়ন" }, r.evaluation_type),
      ...kv({ en: "Source of funds", bn: "অর্থের উৎস" }, r.source_of_funds),
      ...kv({ en: "Status", bn: "অবস্থা" }, r.tender_status),
      ...kv({ en: "Reading order", bn: "পড়ার ক্রম" }, lab("priority", r.investigative_priority_band)),
    ]),
  ];
}
function recDates(r) {
  return [
    el("h4", { text: t(W.dates) }),
    el("dl", { class: "kv" }, [
      ...kv(UI.words.published, r.pub ? date(r.pub) : r.publication_date),
      ...kv({ en: "Closing", bn: "শেষ তারিখ" }, r.close ? date(r.close) : r.closing_date),
      ...kv({ en: "Opening", bn: "খোলার তারিখ" }, r.opening_date),
      ...kv({ en: "Notified of award", bn: "চুক্তির নোটিফিকেশন" }, r.noa_date),
      ...kv(UI.words.signed, r.sign ? date(r.sign) : r.signing_date),
      ...kv({ en: "Days from notification to signing", bn: "নোটিফিকেশন থেকে স্বাক্ষরে দিন" },
        r.days_noa_to_signing === null || r.days_noa_to_signing === "" ? null : digits(r.days_noa_to_signing)),
      ...kv({ en: "Against the signing band", bn: "স্বাক্ষরের সীমার তুলনায়" }, human(r.signing_within_legal_band)),
    ]),
  ];
}

function recBids(r, d) {
  const out = [
    el("h4", { text: t(W.bidsHead) }),
    el("dl", { class: "kv" }, [
      ...kv({ en: "Documents sold", bn: "বিক্রীত দস্তাবেজ" }, r.documents_sold === null ? null : n(r.documents_sold)),
      ...kv(UI.words.bids, r.total_bids_received === null ? null : n(r.total_bids_received)),
      ...kv(UI.words.responsive, r.responsive_bids === null ? null : n(r.responsive_bids)),
      ...kv({ en: "Ruled out", bn: "বাদ পড়েছে" }, r.bidders_rejected_count === null ? null : n(r.bidders_rejected_count)),
      ...kv({ en: "Share ruled responsive", bn: "গ্রহণযোগ্য হওয়ার হার" },
        r.responsive_bid_rate_pct === null ? null : pct(r.responsive_bid_rate_pct)),
      ...kv({ en: "Competition", bn: "প্রতিযোগিতা" }, lab("competition", r.competition_level)),
      ...kv({ en: "Middle bid count at this authority", bn: "এই সংস্থায় দরের মাঝের মান" },
        r.peer_median_bids === null ? null : n(r.peer_median_bids)),
    ]),
  ];
  if (d && d.gaps) {
    out.push(el("aside", { class: "note" }, [
      el("p", { class: "note-title", text: t(W.gapsHead) }),
      el("p", { text: d.gaps }),
    ]));
  }
  return out;
}
function recAsked(r) {
  /* Record surface: the reading and the exact figure, because these are the
     numbers the eligibility findings rest on and each one is checked against a
     sentence on a page that prints all of its digits. */
  const num = (v) => (v === null || v === undefined || v === "" ? null : takaBoth(v));
  const rel = (v) => (v === null || v === undefined || v === "" ? null : ratio(v));
  return [
    el("h4", { text: t(W.askedHead) }),
    el("dl", { class: "kv" }, [
      ...kv({ en: "Years of general experience", bn: "সাধারণ অভিজ্ঞতার বছর" },
        r.minimum_years_experience === null ? null : digits(r.minimum_years_experience)),
      ...kv({ en: "Similar contracts completed", bn: "সম্পন্ন সমজাতীয় চুক্তি" },
        r.minimum_similar_projects === null ? null : digits(r.minimum_similar_projects)),
      ...kv({ en: "Value of one similar contract", bn: "একটি সমজাতীয় চুক্তির মূল্য" }, num(r.minimum_similar_project_value_bdt)),
      ...kv({ en: "Annual turnover", bn: "বার্ষিক টার্নওভার" }, num(r.required_turnover_bdt)),
      ...kv({ en: "Liquid assets or credit line", bn: "নগদ সম্পদ বা ঋণসীমা" }, num(r.required_liquid_assets_bdt)),
      ...kv({ en: "Financial bar in all", bn: "মোট আর্থিক শর্ত" }, num(r.financial_capacity_requirement_bdt)),
      ...kv({ en: "Turnover ÷ contract value", bn: "টার্নওভার ÷ চুক্তিমূল্য" }, rel(r.turnover_to_contract_value_ratio)),
      ...kv({ en: "Similar-work value ÷ contract value", bn: "সমজাতীয় কাজের মূল্য ÷ চুক্তিমূল্য" }, rel(r.similar_project_value_to_contract_value_ratio)),
      ...kv({ en: "Financial bar ÷ contract value", bn: "আর্থিক শর্ত ÷ চুক্তিমূল্য" }, rel(r.financial_bar_to_contract_value_ratio)),
      ...kv({ en: "How the criteria were published", bn: "শর্ত যেভাবে প্রকাশিত" }, human(r.eligibility_published)),
      ...kv({ en: "How restrictive they read", bn: "কতটা সীমাবদ্ধ মনে হয়" }, lab("restriction", r.eligibility_restriction_level)),
    ]),
  ];
}

function recAward(r) {
  return [
    el("h4", { text: t(W.awardHead) }),
    el("dl", { class: "kv" }, [
      ...kv(UI.words.winner, r.winner_name),
      ...kvIf({ en: "Name as this notice spells it", bn: "এই বিজ্ঞপ্তিতে ছাপা নাম" }, r.winner_printed),
      ...kv({ en: "Joint venture", bn: "যৌথ উদ্যোগ" }, r.winner_is_joint_venture ? lab("yesno", r.winner_is_joint_venture) : null),
      ...kv({ en: "Address as printed", bn: "ছাপা ঠিকানা" }, r.winner_location),
      ...kv(UI.words.value, r.contract_value_bdt === null ? null : takaBoth(r.contract_value_bdt)),
      ...kv({ en: "Tender security", bn: "দরপত্র জামানত" }, r.tender_security_bdt === null ? null : takaBoth(r.tender_security_bdt)),
      ...kv({ en: "Owner named on the notice", bn: "বিজ্ঞপ্তিতে মালিকের নাম" },
        r.beneficial_ownership_disclosed ? lab("yesno", r.beneficial_ownership_disclosed) : null),
      ...kv({ en: "This winner elsewhere", bn: "এই বিজয়ী অন্যত্র" }, r.repeated_winner_pattern ? lab("repeat", r.repeated_winner_pattern) : null),
    ]),
  ];
}
/* The flags are descriptions of wording, not verdicts on it, so they are shown
   as plain pills with the standing caveat printed beneath them. */
function recSignals(r, d) {
  const flags = splitList(r.flags);
  const out = [el("h4", { text: t(W.signals) })];
  if (flags.length) {
    out.push(el("div", { class: "chips" }, flags.map((f) => pill(lab("flags", f)))));
  }
  out.push(el("dl", { class: "kv" }, [
    ...kv({ en: "Stages of the theory met", bn: "তত্ত্বের যে ধাপগুলো মিলেছে" },
      d && d.stages_met ? splitList(d.stages_met).map(human).join(" · ") : null),
    ...kv({ en: "Pattern before the bidding", bn: "দরপত্রের আগের ধরন" },
      r.potential_preselection_pattern ? lab("preselection", r.potential_preselection_pattern) : null),
    ...kv({ en: "Against this authority’s own price norm", bn: "এই সংস্থার দামের রীতির তুলনায়" },
      r.price_anomaly_flag ? lab("price", r.price_anomaly_flag) : null),
    ...kv({ en: "Re-tendered", bn: "পুনঃদরপত্র" }, r.retender_flag ? lab("retender", r.retender_flag) : null),
    ...kv({ en: "Amendments", bn: "সংশোধনী" }, r.amendment_count === null ? null : digits(r.amendment_count)),
    ...kv({ en: "An amendment changed the criteria", bn: "সংশোধনীতে শর্ত বদলেছে" },
      r.amendment_touched_eligibility ? lab("yesno", r.amendment_touched_eligibility) : null),
  ]));
  if (flags.length) {
    out.push(el("p", { class: "src", text: t({
      en: "Each of these is a description of something the notice says. None of them is a finding of wrongdoing.",
      bn: "এগুলোর প্রতিটি বিজ্ঞপ্তিতে থাকা কোনো কিছুর বর্ণনা। কোনোটিই অন্যায়ের প্রমাণ নয়।",
    }) }));
  }
  return out;
}

function recRules(ctx, id) {
  const rows = devRows(ctx, id);
  if (!rows.length) return [];
  return [
    el("h4", { text: t(W.rulesHead) }),
    table(
      [{ en: "Rule", bn: "নিয়ম" }, { en: "Outcome", bn: "ফলাফল" },
        { en: "What the document shows", bn: "নথিতে যা আছে" }, { en: "What the clause asks", bn: "ধারা যা চায়" },
        UI.words.page],
      rows.map((x) => [x.code, lab("results", x.result), x.observed || dash(),
        x.required || dash(), x.page ? digits(x.page) : dash()]),
      { textCols: true }
    ),
  ];
}
/* The extracted wording, verbatim and untranslated, behind a disclosure because
   an eligibility clause can run to a page. */
function recExcerpts(ctx, id) {
  const parts = ctx.doctext[id] || [];
  if (!parts.length) return [];
  return [el("details", { class: "open" }, [
    el("summary", null, [
      el("span", { text: t(W.excerptHead) }),
      el("span", { class: "open-note", text: unit(parts.length,
        { en: "passage", bn: "অংশ" }, { en: "passages", bn: "অংশ" }) }),
    ]),
    el("div", { class: "open-body" }, parts.map(([sec, txt]) => el("div", { class: "exhibit" }, [
      el("p", { class: "exhibit-label", text: lab("sections", sec) }),
      el("p", { class: "quote-cell", text: txt }),
    ]))),
  ])];
}

function recWhere(r, d) {
  return [
    el("h4", { text: t(W.whereHead) }),
    el("dl", { class: "kv" }, [
      ...kv({ en: "Pages each figure was read from", bn: "প্রতিটি সংখ্যা যে পৃষ্ঠা থেকে" }, d ? d.evidence_pages : null),
      ...kv({ en: "How the text was extracted", bn: "লেখা যেভাবে তোলা হয়েছে" }, d ? human(d.extraction) : null),
      ...kv({ en: "Confidence in the reading", bn: "পাঠে আস্থা" }, lab("extraction", r.extraction_confidence)),
      ...kv({ en: "Notice", bn: "বিজ্ঞপ্তি" }, r.notice && r.notice.file
        ? el("code", { text: r.notice.file }) : null),
      ...kv({ en: "Award notice", bn: "চুক্তির নথি" }, r.award && r.award.file
        ? el("code", { text: r.award.file }) : null),
      ...kv({ en: "Open the source", bn: "মূল নথি খুলুন" }, pdfLinks(r)),
    ]),
  ];
}

function recReporter(d) {
  if (!d) return [];
  const out = [el("h4", { text: t(W.readerHead) })];
  if (d.fact) out.push(el("p", { text: d.fact }));
  if (d.hypothesis) {
    out.push(el("aside", { class: "note" }, [
      el("p", { class: "note-title", text: t(W.hypothesis) }),
      el("p", { text: d.hypothesis }),
    ]));
  }
  if (d.next_step) {
    out.push(el("p", { class: "note-title", text: t(W.nextStep) }));
    out.push(el("p", { text: d.next_step }));
  }
  if (d.citation_caveat) {
    out.push(el("details", { class: "open" }, [
      el("summary", null, t(W.caveat)),
      el("div", { class: "open-body" }, el("p", { class: "src", text: d.citation_caveat })),
    ]));
  }
  return out;
}
/** The whole record for one tender. Built on demand — 1,155 of these at once
    would be a page nobody can scroll. */
export function tenderRecord(r, ctx) {
  const d = ctx.details[r.tender_id];
  return el("div", { class: "record" }, [
    ...recNotice(r),
    ...recDates(r),
    ...recBids(r, d),
    ...recAsked(r),
    ...recAward(r),
    ...recSignals(r, d),
    ...recRules(ctx, r.tender_id),
    ...recExcerpts(ctx, r.tender_id),
    ...recWhere(r, d),
    ...recReporter(d),
  ]);
}

/** A hit or a row in any of the three lists: one line of identity, one of
    numbers, and a disclosure that builds the record the first time it opens. */
function tenderItem(r, ctx, extra) {
  const meta = [
    r.agency,
    r.contract_value_bdt ? taka(r.contract_value_bdt) : t({ en: "no award record", bn: "চুক্তির নথি নেই" }),
    r.total_bids_received === null || r.total_bids_received === undefined
      ? t({ en: "bid count not published", bn: "দরের সংখ্যা প্রকাশিত নয়" })
      : unit(r.total_bids_received, { en: "bid", bn: "দর" }, { en: "bids", bn: "দর" }) +
        (r.responsive_bids === null ? "" : ", " + n(r.responsive_bids) + " " + t({ en: "responsive", bn: "গ্রহণযোগ্য" })),
    r.rule_deviation_count
      ? unit(r.rule_deviation_count, { en: "deviation", bn: "বিচ্যুতি" }, { en: "deviations", bn: "বিচ্যুতি" })
      : null,
  ].filter(Boolean).join("  ·  ");

  const body = el("div", { class: "open-body" });
  const disc = el("details", { class: "open" }, [
    el("summary", null, t(W.openRecord)), body,
  ]);
  disc.addEventListener("toggle", () => {
    if (disc.open && !body.firstChild) body.appendChild(tenderRecord(r, ctx));
  }, { once: false });

  return el("li", { class: "hit-item" }, [
    el("p", { class: "hit-title", text: digits(r.tender_id) + " — " + (r.package_description || r.project_name || dash()) }),
    el("p", { class: "hit-meta", text: meta }),
    extra || null,
    disc,
  ]);
}
/* --------------------------------------------------------------------- search
   A real index over the extracted text, built once on the first query. The
   normalisation step is what makes it OCR-tolerant: mojibake left by the
   extraction (Â), soft hyphens and the not-sign that broke "electro-¬mechanical"
   in one notice, and the four kinds of curly quote are all folded away before
   anything is compared, and Bengali digits are folded to ASCII so a Bangla
   reader can type a tender number in Bengali and still find it. */

function normalise(s) {
  return String(s === null || s === undefined ? "" : s).toLowerCase()
    .replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6))
    .replace(/[­¬Â​‌‍]/g, "")
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[‐-―]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/* The fields a query may name. Text fields match on a substring; number fields
   take >, <, >=, <= and a..b; date fields take a year, a full date, or a range.
   crore is the same column as value, divided, because a reader thinks in crore
   and the CSV records taka. */
const FIELDS = {
  id: { col: "tender_id", kind: "text" },
  ref: { col: "tender_reference", kind: "text" },
  agency: { col: "agency", kind: "text", also: "organization" },
  district: { col: "pe_district", kind: "text" },
  entity: { col: "procuring_entity", kind: "text" },
  project: { col: "project_name", kind: "text" },
  package: { col: "package_description", kind: "text" },
  nature: { col: "procurement_nature", kind: "text" },
  method: { col: "procurement_method", kind: "text" },
  status: { col: "tender_status", kind: "text" },
  winner: { col: "winner_name", kind: "text" },
  rule: { col: "rule_deviation_codes", kind: "text" },
  flag: { col: "flags", kind: "text" },
  competition: { col: "competition_level", kind: "text" },
  restriction: { col: "eligibility_restriction_level", kind: "text" },
  priority: { col: "investigative_priority_band", kind: "text" },
  bids: { col: "total_bids_received", kind: "num" },
  responsive: { col: "responsive_bids", kind: "num" },
  rejected: { col: "bidders_rejected_count", kind: "num" },
  deviations: { col: "rule_deviation_count", kind: "num" },
  value: { col: "contract_value_bdt", kind: "num" },
  crore: { col: "contract_value_bdt", kind: "num", scale: 1e7 },
  turnover: { col: "required_turnover_bdt", kind: "num" },
  years: { col: "minimum_years_experience", kind: "num" },
  published: { col: "pub", kind: "date" },
  closed: { col: "close", kind: "date" },
  signed: { col: "sign", kind: "date" },
};
function numOk(v, spec, scale) {
  if (v === null || v === undefined || v === "" || Number.isNaN(+v)) return false;
  const x = +v / (scale || 1);
  let m = /^(>=|<=|>|<)\s*(-?\d+(?:\.\d+)?)$/.exec(spec);
  if (m) {
    const y = +m[2];
    return m[1] === ">" ? x > y : m[1] === "<" ? x < y : m[1] === ">=" ? x >= y : x <= y;
  }
  m = /^(-?\d+(?:\.\d+)?)\.\.(-?\d+(?:\.\d+)?)$/.exec(spec);
  if (m) return x >= +m[1] && x <= +m[2];
  if (Number.isNaN(+spec)) return false;
  return Math.abs(x - +spec) < 1e-9;
}

function dateOk(v, spec) {
  if (!v) return false;
  const parts = spec.split("..");
  if (parts.length === 2) return String(v) >= parts[0] && String(v) <= parts[1] + "￿";
  return String(v).startsWith(spec);
}

/* Edit distance with an early exit, used only when a typed word appears in no
   document at all. The substitutions are shown to the reader rather than applied
   silently: a search that quietly changed the question would be a lie. */
function within(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return false;
  let prev = new Array(b.length + 1);
  let cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return false;
    const swap = prev; prev = cur; cur = swap;
  }
  return prev[b.length] <= max;
}

function nearWords(term, vocab, limit) {
  const max = term.length >= 8 ? 2 : 1;
  const out = [];
  for (const word of vocab) {
    if (within(term, word, max)) {
      out.push(word);
      if (out.length >= (limit || 4)) break;
    }
  }
  return out;
}
/** One index entry per tender: the passages it can be found in, kept separate
    so a hit can be quoted back with its section named, plus one normalised
    haystack for matching, plus the vocabulary every fuzzy fallback searches. */
function buildIndex(ctx) {
  if (ctx.index) return ctx.index;
  const vocab = new Set();
  const byTender = biddersByTender(ctx);

  const rows = ctx.tenders.map((r) => {
    const parts = [];
    parts.push(["tender", [r.tender_id, r.tender_reference, r.package_description,
      r.project_name].filter(Boolean).join(" · ")]);
    parts.push(["who", [r.organization, r.procuring_entity, r.pe_district,
      r.ministry, r.procurement_nature, r.procurement_method, r.tender_status]
      .filter(Boolean).join(" · ")]);
    if (r.winner_name) {
      parts.push(["winner", [r.winner_name, r.winner_printed, r.winner_location]
        .filter(Boolean).join(" — ")]);
    }
    for (const b of byTender.get(r.tender_id) || []) {
      parts.push(["bidder", [b.name, b.printed, b.owner, b.owner_role, b.country, b.excerpt]
        .filter(Boolean).join(" · ")]);
    }
    for (const pair of ctx.doctext[r.tender_id] || []) parts.push(pair);
    const dev = devRows(ctx, r.tender_id)
      .map((x) => x.fact).filter(Boolean).join("  ");
    if (dev) parts.push(["rules", dev]);
    for (const f of splitList(r.flags)) parts.push(["flag", f.replace(/_/g, " ")]);

    const hay = normalise(parts.map((p) => p[1]).join("  "));
    for (const word of hay.split(/[^a-z0-9ঀ-৿]+/)) {
      if (word.length >= 3) vocab.add(word);
    }
    return { r: r, parts: parts, hay: hay };
  });

  ctx.index = { rows: rows, vocab: vocab };
  return ctx.index;
}
function rawTokens(q) {
  const out = [];
  const re = /"([^"]*)"|(\S+)/g;
  let m;
  while ((m = re.exec(q)) !== null) {
    if (m[1] !== undefined) { if (m[1].trim()) out.push({ phrase: true, s: m[1].trim() }); }
    else out.push({ phrase: false, s: m[2] });
  }
  return out;
}

/** Terms are AND by default; "or" joins the previous term into a group; a
    leading − or ! excludes; quotes make a phrase; field:value constrains a
    column. An unrecognised field name is not an error — the whole token is
    searched as text, and the tab says which name it did not recognise. */
function parseQuery(q) {
  const plan = { groups: [], not: [], fields: [], unknown: [], fuzzy: [] };
  let pendingOr = false;
  for (const tok of rawTokens(normalise(q))) {
    const s = tok.s;
    if (!tok.phrase && (s === "or" || s === "|")) { pendingOr = true; continue; }
    if (!tok.phrase && (s === "and" || s === "&")) continue;
    if (!tok.phrase && (s[0] === "-" || s[0] === "!") && s.length > 1) { plan.not.push(s.slice(1)); continue; }
    const colon = tok.phrase ? -1 : s.indexOf(":");
    if (colon > 0) {
      const key = s.slice(0, colon), spec = s.slice(colon + 1);
      if (FIELDS[key] && spec) { plan.fields.push({ key: key, spec: spec }); continue; }
      if (!FIELDS[key] && plan.unknown.indexOf(key) < 0) plan.unknown.push(key);
    }
    if (pendingOr && plan.groups.length) plan.groups[plan.groups.length - 1].push(s);
    else plan.groups.push([s]);
    pendingOr = false;
  }
  return plan;
}

function vocabHas(term, vocab) {
  for (const word of vocab) if (word.indexOf(term) >= 0) return true;
  return false;
}

/** Any word nobody wrote down gets one chance at a near spelling, and the swap
    is reported back so the reader knows the question changed. */
function relaxPlan(plan, vocab) {
  for (const group of plan.groups) {
    for (let i = 0; i < group.length; i++) {
      const term = group[i];
      if (term.length < 4 || term.indexOf(" ") >= 0) continue;
      if (vocabHas(term, vocab)) continue;
      const near = nearWords(term, vocab, 4);
      if (!near.length) continue;
      plan.fuzzy.push({ from: term, to: near });
      group.splice(i, 1, ...near);
      i += near.length - 1;
    }
  }
  return plan;
}
function count(hay, term) {
  if (!term) return 0;
  let i = 0, c = 0;
  while ((i = hay.indexOf(term, i)) >= 0) { c++; i += term.length; }
  return c;
}

function fieldOk(r, f) {
  const def = FIELDS[f.key];
  if (def.kind === "num") return numOk(r[def.col], f.spec, def.scale);
  if (def.kind === "date") return dateOk(r[def.col], f.spec);
  if (normalise(r[def.col]).indexOf(f.spec) >= 0) return true;
  return def.also ? normalise(r[def.also]).indexOf(f.spec) >= 0 : false;
}

function runQuery(index, plan) {
  const hits = [];
  for (const row of index.rows) {
    let bad = false;
    for (const nt of plan.not) if (row.hay.indexOf(nt) >= 0) { bad = true; break; }
    if (bad) continue;
    for (const f of plan.fields) if (!fieldOk(row.r, f)) { bad = true; break; }
    if (bad) continue;
    let score = 0;
    for (const group of plan.groups) {
      let got = 0;
      for (const term of group) got += count(row.hay, term);
      if (!got) { bad = true; break; }
      score += got;
    }
    if (bad) continue;
    hits.push({ row: row, score: score });
  }
  hits.sort((a, b) => b.score - a.score ||
    (b.row.r.contract_value_bdt || 0) - (a.row.r.contract_value_bdt || 0) ||
    String(a.row.r.tender_id).localeCompare(String(b.row.r.tender_id)));
  return hits;
}

/** The first place a searched word actually appears, quoted with its section
    named and the word marked. Verbatim: the passage is not translated. */
function snippet(row, plan) {
  const terms = plan.groups.flat().filter((x) => x.length >= 2);
  for (const [sec, text] of row.parts) {
    const low = String(text).toLowerCase();
    for (const term of terms) {
      const at = low.indexOf(term);
      if (at < 0) continue;
      const from = Math.max(0, at - 110);
      const to = Math.min(text.length, at + term.length + 190);
      return el("p", { class: "hit-snip" }, [
        el("span", { class: "pill pill-na", text: lab("sections", sec) }),
        (from > 0 ? "… " : "") + text.slice(from, at),
        el("mark", { text: text.slice(at, at + term.length) }),
        text.slice(at + term.length, to) + (to < text.length ? " …" : ""),
      ]);
    }
  }
  return null;
}
const EXAMPLES = [
  ["reputed", { en: "every document with that word in it", bn: "যে নথিতে এই শব্দ আছে" }],
  ["\"liquid assets\"", { en: "the exact phrase, in quotes", bn: "উদ্ধৃতিচিহ্নে হুবহু বাক্যাংশ" }],
  ["bank or credit", { en: "either word", bn: "যেকোনো একটি শব্দ" }],
  ["brand -equivalent", { en: "has the first, not the second", bn: "প্রথমটি আছে, দ্বিতীয়টি নেই" }],
  ["agency:CDA", { en: "one column only", bn: "কেবল একটি কলামে" }],
  ["bids:1", { en: "a number exactly", bn: "ঠিক এই সংখ্যা" }],
  ["bids:2..5", { en: "a range of numbers", bn: "সংখ্যার একটি পরিসর" }],
  ["crore:>10", { en: "contract value above ten crore", bn: "দশ কোটির বেশি চুক্তিমূল্য" }],
  ["signed:2023", { en: "signed in that year", bn: "সেই বছরে স্বাক্ষরিত" }],
  ["signed:2023-01..2023-06", { en: "signed between two dates", bn: "দুই তারিখের মধ্যে স্বাক্ষরিত" }],
  ["rule:R08", { en: "deviated from that test", bn: "সেই পরীক্ষায় বিচ্যুত" }],
  ["flag:incumbent", { en: "carries that signal", bn: "সেই সংকেত আছে" }],
];

function syntaxHelp() {
  return el("details", { class: "open" }, [
    el("summary", null, [
      el("span", { text: t(W.syntax) }),
      el("span", { class: "open-note", text: t({ en: "phrases, columns, ranges, misspellings", bn: "বাক্যাংশ, কলাম, পরিসর, ভুল বানান" }) }),
    ]),
    el("div", { class: "open-body" }, [
      el("ul", { class: "dl-list" }, EXAMPLES.map(([q, note]) => el("li", { class: "dl-row" }, [
        el("span", { class: "dl-what" }, el("code", { text: q })),
        el("span", { class: "dl-note", text: t(note) }),
      ]))),
      el("p", { class: "src", text: t({
        en: "Column names you can use: " + Object.keys(FIELDS).join(", ") +
          ". A word that appears in no document at all is retried at one letter's difference, and the swap is printed above the results — the search never changes your question quietly. Bengali digits are read as digits, so ৩৬০৪২৩ finds 360423.",
        bn: "যে কলামের নাম ব্যবহার করা যায়: " + Object.keys(FIELDS).join(", ") +
          "। কোনো নথিতে নেই এমন শব্দ এক অক্ষরের ব্যবধানে আবার খোঁজা হয়, এবং সেই বদল ফলাফলের ওপরে লেখা থাকে — খোঁজ কখনো চুপচাপ আপনার প্রশ্ন বদলায় না। বাংলা অঙ্ক অঙ্ক হিসেবেই পড়া হয়, তাই ৩৬০৪২৩ দিয়ে 360423 পাওয়া যায়।",
      }) }),
    ]),
  ]);
}
const PAGE = 40;

function searchTool(ctx) {
  const input = el("input", {
    type: "search", id: "tool-q", placeholder: t(W.qHint),
    autocomplete: "off", spellcheck: "false",
  });
  const status = el("p", { class: "result-count" });
  const note = el("p", { class: "src" });
  const list = el("ul", { class: "hit-list" });
  const more = el("button", { class: "btn btn-quiet hide", type: "button", text: t(UI.words.more) });
  let hits = [], shown = 0;

  function draw() {
    const slice = hits.slice(shown, shown + PAGE);
    for (const hit of slice) {
      list.appendChild(tenderItem(hit.row.r, ctx, snippet(hit.row, hit.plan)));
    }
    shown += slice.length;
    more.classList.toggle("hide", shown >= hits.length);
    more.textContent = t(UI.words.more) + " (" + n(hits.length - shown) + ")";
  }

  function run() {
    const raw = input.value.trim();
    clear(list); clear(note); hits = []; shown = 0;
    more.classList.add("hide");
    if (!raw) {
      status.textContent = fillText(t({
        en: "Type something to search {{counts.tenders|n}} tenders.",
        bn: "{{counts.tenders|n}}টি দরপত্রে খুঁজতে কিছু লিখুন।",
      }), ctx.corpus);
      return;
    }
    const index = buildIndex(ctx);
    const plan = relaxPlan(parseQuery(raw), index.vocab);
    if (!plan.groups.length && !plan.fields.length) {
      status.textContent = t({ en: "That query has nothing to search for.", bn: "এই প্রশ্নে খোঁজার কিছু নেই।" });
      return;
    }
    hits = runQuery(index, plan).map((hit) => ({ row: hit.row, score: hit.score, plan: plan }));
    clear(status);
    const word = t(hits.length === 1 ? W.hits1 : W.hits);
    status.appendChild(el("b", { text: n(hits.length) }));
    status.appendChild(document.createTextNode(
      sep(word) + word + stop() + " " + t(W.order)));
    if (plan.fuzzy.length) {
      note.appendChild(document.createTextNode(plan.fuzzy.map((f) =>
        t(W.fuzzy) + " “" + f.from + "” — " + t(W.fuzzyTo) + " " +
        f.to.map((x) => "“" + x + "”").join(", ")).join(stop() + " ") + stop()));
    }
    if (plan.unknown.length) {
      note.appendChild(document.createTextNode(" " + t({
        en: "Not a column name, so searched as text: ", bn: "কলামের নাম নয়, তাই লেখা হিসেবে খোঁজা হয়েছে: ",
      }) + plan.unknown.join(", ") + stop()));
    }
    if (!hits.length) status.appendChild(document.createTextNode(" " + t(W.noHits)));
    else draw();
  }
  let timer = 0;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(run, 220);
  });
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") { ev.preventDefault(); clearTimeout(timer); run(); }
  });
  more.addEventListener("click", draw);

  const go = el("button", { class: "btn", type: "button", text: t(UI.words.search) });
  go.addEventListener("click", () => { clearTimeout(timer); run(); });
  const reset = el("button", { class: "btn btn-quiet", type: "button", text: t(UI.words.reset) });
  reset.addEventListener("click", () => { input.value = ""; run(); input.focus(); });

  run();
  return el("div", null, [
    syntaxHelp(),
    el("div", { class: "controls" }, [
      el("div", { class: "ctl ctl-grow" }, [
        el("label", { for: "tool-q", text: t(W.q) }), input,
      ]),
      el("div", { class: "ctl" }, go),
      el("div", { class: "ctl" }, reset),
    ]),
    status, note, list,
    el("div", { class: "chips" }, more),
  ]);
}

/* ------------------------------------------------------------------ explorer
   The whole set, filtered. Every option in every menu is read off the data, so
   a value that does not occur is never offered and a new value cannot be
   missed. The count of what survives the filter is always on screen. */

function pick(id, labelPair, options) {
  const sel = el("select", { id: id });
  for (const opt of options) sel.appendChild(el("option", { value: opt.value, text: opt.label }));
  return {
    sel: sel,
    node: el("div", { class: "ctl" }, [el("label", { for: id, text: t(labelPair) }), sel]),
  };
}

/** Distinct values of one column, most common first, each with its own count,
    plus an "All" row. Blank values become one honest row, not an empty option. */
function optionsFor(rows, col, map, blankLabel) {
  const tally = new Map();
  for (const r of rows) {
    const key = r[col] === null || r[col] === undefined ? "" : String(r[col]);
    tally.set(key, (tally.get(key) || 0) + 1);
  }
  const out = [{ value: "", label: t(UI.words.all) + " (" + n(rows.length) + ")" }];
  const keys = [...tally.keys()].sort((a, b) => tally.get(b) - tally.get(a));
  for (const key of keys) {
    const words = key === "" ? t(blankLabel || UI.words.none) : (map ? lab(map, key) : key);
    out.push({ value: key === "" ? " " : key, label: words + " (" + n(tally.get(key)) + ")" });
  }
  return out;
}

const SORTS = [
  { value: "money", label: { en: "Contract value, largest first", bn: "চুক্তিমূল্য, বড় আগে" },
    fn: (a, b) => (b.contract_value_bdt || -1) - (a.contract_value_bdt || -1) },
  { value: "bidsUp", label: { en: "Fewest bids first", bn: "কম দর আগে" },
    fn: (a, b) => (a.total_bids_received === null ? 99 : a.total_bids_received) -
      (b.total_bids_received === null ? 99 : b.total_bids_received) },
  { value: "dev", label: { en: "Most deviations first", bn: "বেশি বিচ্যুতি আগে" },
    fn: (a, b) => (b.rule_deviation_count || 0) - (a.rule_deviation_count || 0) },
  { value: "score", label: { en: "Reading order for a reporter", bn: "সাংবাদিকের পড়ার ক্রম" },
    fn: (a, b) => (b.investigative_priority_score || 0) - (a.investigative_priority_score || 0) },
  { value: "signed", label: { en: "Most recently signed", bn: "সাম্প্রতিক স্বাক্ষর আগে" },
    fn: (a, b) => String(b.sign || "").localeCompare(String(a.sign || "")) },
  { value: "pub", label: { en: "Most recently published", bn: "সাম্প্রতিক প্রকাশ আগে" },
    fn: (a, b) => String(b.pub || "").localeCompare(String(a.pub || "")) },
];

function toggleChip(labelPair) {
  const btn = el("button", { class: "chip", type: "button", "aria-pressed": "false", text: t(labelPair) });
  btn.addEventListener("click", () => {
    btn.setAttribute("aria-pressed", btn.getAttribute("aria-pressed") === "true" ? "false" : "true");
  });
  return btn;
}

function explorerTool(ctx) {
  const rows = ctx.tenders;
  const agency = pick("x-agency", UI.words.agency, optionsFor(rows, "agency"));
  const comp = pick("x-comp", { en: "Competition", bn: "প্রতিযোগিতা" },
    optionsFor(rows, "competition_level", "competition"));
  const restr = pick("x-restr", { en: "How the criteria read", bn: "শর্ত কেমন" },
    optionsFor(rows, "eligibility_restriction_level", "restriction"));
  const prio = pick("x-prio", { en: "Reading order", bn: "পড়ার ক্রম" },
    optionsFor(rows, "investigative_priority_band", "priority"));
  const order = pick("x-sort", W.sort, SORTS.map((s) => ({ value: s.value, label: t(s.label) })));

  const cDev = toggleChip(W.onlyDev);
  const cSingle = toggleChip(W.onlySingle);
  const cAward = toggleChip(W.onlyAward);

  const status = el("p", { class: "result-count" });
  const list = el("ul", { class: "hit-list" });
  const more = el("button", { class: "btn btn-quiet hide", type: "button", text: t(UI.words.more) });
  let kept = [], shown = 0;

  function draw() {
    const slice = kept.slice(shown, shown + PAGE);
    for (const r of slice) list.appendChild(tenderItem(r, ctx));
    shown += slice.length;
    more.classList.toggle("hide", shown >= kept.length);
    more.textContent = t(UI.words.more) + " (" + n(kept.length - shown) + ")";
  }

  function on(chip) { return chip.getAttribute("aria-pressed") === "true"; }

  /* An empty menu value means "no filter"; a single space is the option that
     stands for a blank cell, which is a filter like any other. */
  function want(sel) {
    const v = sel.value;
    if (!v) return null;
    return v === " " ? "" : v;
  }

  function run() {
    const fa = want(agency.sel), fc = want(comp.sel), fr = want(restr.sel), fp = want(prio.sel);
    kept = rows.filter((r) => {
      if (fa !== null && String(r.agency || "") !== fa) return false;
      if (fc !== null && String(r.competition_level || "") !== fc) return false;
      if (fr !== null && String(r.eligibility_restriction_level || "") !== fr) return false;
      if (fp !== null && String(r.investigative_priority_band || "") !== fp) return false;
      if (on(cDev) && !r.rule_deviation_count) return false;
      if (on(cSingle) && r.responsive_bids !== 1) return false;
      if (on(cAward) && !r.contract_value_bdt) return false;
      return true;
    });
    const sorter = SORTS.find((s) => s.value === order.sel.value) || SORTS[0];
    kept = kept.slice().sort(sorter.fn);
    clear(list); shown = 0;
    clear(status);
    status.appendChild(ofTotal(kept.length, rows.length, UI.words.tenders));
    if (!kept.length) list.appendChild(el("li", { class: "tbl-empty", text: t(W.noHits) }));
    else draw();
  }

  for (const ctl of [agency, comp, restr, prio, order]) ctl.sel.addEventListener("change", run);
  for (const chip of [cDev, cSingle, cAward]) chip.addEventListener("click", run);
  more.addEventListener("click", draw);
  run();

  return el("div", null, [
    el("div", { class: "controls" }, [agency.node, comp.node, restr.node, prio.node, order.node]),
    el("div", { class: "chips" }, [cDev, cSingle, cAward]),
    status, list,
    el("div", { class: "chips" }, more),
  ]);
}

/* --------------------------------------------------------------------- firms
   304 firms hold the 645 contracts. This tool answers "what did this firm
   win" and nothing more: a firm appearing often is a fact about the register,
   not a finding about the firm. Names are printed exactly as the award notices
   print them, including the spelling variants, so an editor can see what was
   merged and what was not. */

function firmFigure(ctx) {
  const top = ctx.winners.slice().sort((a, b) => b.crore - a.crore).slice(0, 15);
  const con = ctx.corpus.concentration;
  return figure({
    title: { en: "The fifteen firms holding the most money", bn: "সবচেয়ে বেশি অর্থ পাওয়া পনেরোটি প্রতিষ্ঠান" },
    deck: {
      en: n(con.distinct_winners) + " firms hold the " + n(ctx.corpus.counts.awarded) +
        " contracts in this set. The largest holds " + pct(con.top1.share) +
        " of the money on " + n(con.top1.contracts) + " contracts.",
      bn: n(con.distinct_winners) + "টি প্রতিষ্ঠান এই সেটের " + n(ctx.corpus.counts.awarded) +
        "টি চুক্তি পেয়েছে। সবচেয়ে বড়টি " + n(con.top1.contracts) + "টি চুক্তিতে অর্থের " +
        pct(con.top1.share) + " পেয়েছে।",
    },
    plot: barsH(top.map((firm) => ({ label: firm.name, value: firm.crore })), {
      labelW: 250, valueW: 96, rowH: 26, color: hue(0), fmt: (v) => cr(v, 0),
      alt: t({ en: "The fifteen largest winning firms by money.", bn: "অর্থ অনুসারে সবচেয়ে বড় পনেরোটি বিজয়ী প্রতিষ্ঠান।" }),
    }),
    table: table(
      [{ en: "Firm", bn: "প্রতিষ্ঠান" }, UI.words.contracts, UI.words.money, UI.words.share],
      top.map((firm) => [firm.name, n(firm.contracts), cr(firm.crore), pct(firm.share)])
    ),
    source: {
      en: t(UI.words.source) + ": <code>investigation_output/master_tender_investigation.csv</code>, grouped on <code>winner_name_normalised</code> and shown under a spelling the award notices print.",
      bn: t(UI.words.source) + ": <code>investigation_output/master_tender_investigation.csv</code>, <code>winner_name_normalised</code> অনুসারে দলবদ্ধ, আর চুক্তি-বিজ্ঞপ্তিতে ছাপা বানানে দেখানো।",
    },
  });
}

/** Bidder rows grouped by tender, built once per session. Several surfaces need
    the same grouping, so it is memoised on the context rather than rebuilt. */
function biddersByTender(ctx) {
  if (!ctx.byBidder) {
    ctx.byBidder = new Map();
    for (const b of ctx.bidders) {
      if (!ctx.byBidder.has(b.tender_id)) ctx.byBidder.set(b.tender_id, []);
      ctx.byBidder.get(b.tender_id).push(b);
    }
  }
  return ctx.byBidder;
}

/** The owners an award notice discloses for a winning firm. Each is a record —
    a person, the office they hold, the share and the country — so it is listed
    as one, not flattened into a string. The share and the country are printed
    only when the notice printed them. */
function ownerList(owners) {
  const rows = (owners || []).filter((o) => o && o.name);
  if (!rows.length) return null;
  const ul = el("ul", { class: "plain-list" });
  for (const o of rows) {
    const tail = [o.role, o.share ? pct(parseFloat(o.share)) : null, o.country]
      .filter(Boolean).join(" · ");
    ul.appendChild(el("li", null, [
      el("span", { class: "owner-name", text: o.name }),
      tail ? el("span", { class: "owner-role", text: " — " + tail }) : null,
    ].filter(Boolean)));
  }
  return ul;
}

function firmRecord(firm, ctx) {
  /* The supplier field of the award notice, quoted. It is here because the name
     on this record is a spelling chosen from several, and because on a handful of
     notices the field does not hold a company name at all — the reader should be
     able to see what the government printed without opening the PDF. */
  const byT = biddersByTender(ctx);
  const printed = [];
  for (const id of firm.tenders || []) {
    for (const b of byT.get(id) || []) {
      if (b.record_type === "AWARDED_BIDDER" && b.excerpt &&
          printed.indexOf(b.excerpt) < 0) printed.push(b.excerpt);
    }
  }
  const body = [
    el("dl", { class: "kv" }, [
      ...kv(UI.words.contracts, n(firm.contracts)),
      ...kv(UI.words.money, takaBoth(firm.taka)),
      ...kv(UI.words.share, pct(firm.share)),
      ...kv({ en: "Authorities", bn: "সংস্থা" }, (firm.agencies || []).join(", ")),
      ...kv({ en: "Districts as printed", bn: "ছাপা জেলা" }, (firm.districts || []).join(", ")),
      ...kv({ en: "Won where the field was thin", bn: "কম প্রতিযোগিতায় জিতেছে" }, n(firm.thin_wins)),
      ...kv({ en: "Won as a joint venture", bn: "যৌথ উদ্যোগে জিতেছে" }, n(firm.jv_awards)),
      ...kv(W.owners, ownerList(firm.owners)),
      ...kv(W.spellings, (firm.verbatim || []).join(" · ")),
      ...kvIf({ en: "Grouping key", bn: "দলবদ্ধ করার সূত্র" },
        firm.key && firm.key !== firm.name ? el("code", { text: firm.key }) : null),
      ...kvIf({ en: "The supplier field, as printed", bn: "সরবরাহকারীর ঘর, যেভাবে ছাপা" },
        printed.length
          ? el("div", null, printed.slice(0, 4).map(
              (x) => el("p", { class: "quote-cell", text: x })))
          : null),
      ...kv({ en: "Name-variant check", bn: "নামের রূপভেদ পরীক্ষা" },
        (firm.variants || []).map(human).join(", ")),
    ]),
    el("h4", { text: t(W.contracts) }),
  ];
  const list = el("ul", { class: "hit-list" });
  for (const id of firm.tenders || []) {
    const row = ctx.byId[id];
    if (row) list.appendChild(tenderItem(row, ctx));
    else list.appendChild(el("li", { class: "hit-item" },
      el("p", { class: "hit-meta", text: digits(id) + " — " + dash() })));
  }
  body.push(list);
  return el("div", { class: "record" }, body);
}

const FIRM_SORTS = [
  { value: "money", label: { en: "Money, largest first", bn: "অর্থ, বড় আগে" }, fn: (a, b) => b.crore - a.crore },
  { value: "count", label: { en: "Number of contracts", bn: "চুক্তির সংখ্যা" }, fn: (a, b) => b.contracts - a.contracts || b.crore - a.crore },
  { value: "thin", label: { en: "Wins where the field was thin", bn: "কম প্রতিযোগিতায় জয়" }, fn: (a, b) => b.thin_wins - a.thin_wins || b.crore - a.crore },
  { value: "name", label: { en: "Name", bn: "নাম" }, fn: (a, b) => a.name.localeCompare(b.name) },
];

function firmItem(firm, ctx) {
  const meta = [
    unit(firm.contracts, { en: "contract", bn: "চুক্তি" }, { en: "contracts", bn: "চুক্তি" }),
    cr(firm.crore),
    pct(firm.share) + " " + t({ en: "of the money", bn: "অর্থের" }),
    (firm.agencies || []).join(", "),
    firm.thin_wins ? n(firm.thin_wins) + " " + t({ en: "won with a thin field", bn: "কম প্রতিযোগিতায় জেতা" }) : null,
  ].filter(Boolean).join("  ·  ");

  const body = el("div", { class: "open-body" });
  const disc = el("details", { class: "open" }, [
    el("summary", null, t({ en: "Open what this firm won", bn: "এই প্রতিষ্ঠান যা পেয়েছে খুলুন" })), body,
  ]);
  disc.addEventListener("toggle", () => {
    if (disc.open && !body.firstChild) body.appendChild(firmRecord(firm, ctx));
  });

  return el("li", { class: "hit-item" }, [
    el("p", { class: "hit-title", text: firm.name }),
    el("p", { class: "hit-meta", text: meta }),
    disc,
  ]);
}

function firmsTool(ctx) {
  const input = el("input", { type: "search", id: "f-name", autocomplete: "off", spellcheck: "false" });
  const minSel = el("select", { id: "f-min" });
  for (const k of [1, 2, 3, 4, 5]) {
    minSel.appendChild(el("option", { value: String(k), text: digits(k) }));
  }
  const order = el("select", { id: "f-sort" });
  for (const s of FIRM_SORTS) order.appendChild(el("option", { value: s.value, text: t(s.label) }));

  const status = el("p", { class: "result-count" });
  const list = el("ul", { class: "hit-list" });
  const more = el("button", { class: "btn btn-quiet hide", type: "button", text: t(UI.words.more) });
  let kept = [], shown = 0;

  function draw() {
    const slice = kept.slice(shown, shown + PAGE);
    for (const firm of slice) list.appendChild(firmItem(firm, ctx));
    shown += slice.length;
    more.classList.toggle("hide", shown >= kept.length);
    more.textContent = t(UI.words.more) + " (" + n(kept.length - shown) + ")";
  }

  function run() {
    const q = normalise(input.value);
    const min = +minSel.value;
    kept = ctx.winners.filter((firm) => {
      if (firm.contracts < min) return false;
      if (!q) return true;
      /* Searchable by the name shown, by the grouping key the CSVs use, by every
         spelling a notice printed, and by a disclosed owner. */
      if (normalise(firm.name).indexOf(q) >= 0) return true;
      if (firm.key && normalise(firm.key).indexOf(q) >= 0) return true;
      if ((firm.owners || []).some((o) => normalise(o.name || "").indexOf(q) >= 0)) return true;
      return (firm.verbatim || []).some((v) => normalise(v).indexOf(q) >= 0);
    });
    const sorter = FIRM_SORTS.find((s) => s.value === order.value) || FIRM_SORTS[0];
    kept = kept.slice().sort(sorter.fn);
    clear(list); clear(status); shown = 0;
    status.appendChild(ofTotal(kept.length, ctx.winners.length,
      { en: "firms", bn: "প্রতিষ্ঠান" }));
    if (!kept.length) list.appendChild(el("li", { class: "tbl-empty", text: t(W.noHits) }));
    else draw();
  }

  let timer = 0;
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(run, 220); });
  minSel.addEventListener("change", run);
  order.addEventListener("change", run);
  more.addEventListener("click", draw);
  run();

  return el("div", null, [
    firmFigure(ctx),
    el("div", { class: "controls" }, [
      el("div", { class: "ctl ctl-grow" }, [el("label", { for: "f-name", text: t(W.firmName) }), input]),
      el("div", { class: "ctl" }, [el("label", { for: "f-min", text: t(W.minWins) }), minSel]),
      el("div", { class: "ctl" }, [el("label", { for: "f-sort", text: t(W.sort) }), order]),
    ]),
    status, list,
    el("div", { class: "chips" }, more),
  ]);
}

/* -------------------------------------------------------------- clause reuse
   The same eligibility sentence appearing in many tenders. Worth showing and
   worth stating plainly: procurement runs on standard wording, so a sentence
   recurring is ordinary in itself. What it does let a reader do is see which
   sentences the authorities in this set share, and read them.

   The groups are built by grouping the per-tender records themselves rather
   than reading the pre-joined list in the CSV, because that column truncates
   long lists with "+54 more" and a truncated list cannot be opened. */

function clauseGroups(ctx) {
  if (ctx.clauses) return ctx.clauses;
  const byText = new Map();
  for (const id of Object.keys(ctx.details)) {
    const text = ctx.details[id].reused_clause;
    if (!text || text === "none") continue;
    if (!byText.has(text)) byText.set(text, []);
    byText.get(text).push(id);
  }
  const out = [...byText.entries()].map(([text, ids]) => ({ text: text, ids: ids }));
  out.sort((a, b) => b.ids.length - a.ids.length || a.text.localeCompare(b.text));
  ctx.clauses = out;
  return out;
}

function clauseItem(group, ctx) {
  const body = el("div", { class: "open-body" });
  const disc = el("details", { class: "open" }, [
    el("summary", null, [
      el("span", { text: t(W.usedIn) }),
      el("span", { class: "open-note",
        text: unit(group.ids.length, UI.words.tender1, UI.words.tenders) }),
    ]),
    body,
  ]);
  disc.addEventListener("toggle", () => {
    if (!disc.open || body.firstChild) return;
    const list = el("ul", { class: "hit-list" });
    for (const id of group.ids) {
      const row = ctx.byId[id];
      if (row) list.appendChild(tenderItem(row, ctx));
    }
    body.appendChild(list);
  });

  const agencies = [...new Set(group.ids
    .map((id) => (ctx.byId[id] || {}).agency).filter(Boolean))].sort();

  return el("li", { class: "hit-item" }, [
    el("p", { class: "hit-title", text: unit(group.ids.length, UI.words.tender1, UI.words.tenders) +
      "  ·  " + agencies.join(", ") }),
    el("p", { class: "quote-cell", text: group.text }),
    disc,
  ]);
}

function clauseTool(ctx) {
  const groups = clauseGroups(ctx);
  const input = el("input", { type: "search", id: "c-q", autocomplete: "off", spellcheck: "false" });
  const minSel = el("select", { id: "c-min" });
  for (const k of [2, 5, 10, 20, 50]) {
    minSel.appendChild(el("option", { value: String(k), text: digits(k) }));
  }
  const status = el("p", { class: "result-count" });
  const list = el("ul", { class: "hit-list" });
  const more = el("button", { class: "btn btn-quiet hide", type: "button", text: t(UI.words.more) });
  let kept = [], shown = 0;

  function draw() {
    const slice = kept.slice(shown, shown + 20);
    for (const group of slice) list.appendChild(clauseItem(group, ctx));
    shown += slice.length;
    more.classList.toggle("hide", shown >= kept.length);
    more.textContent = t(UI.words.more) + " (" + n(kept.length - shown) + ")";
  }

  function run() {
    const q = normalise(input.value);
    const min = +minSel.value;
    kept = groups.filter((g) => g.ids.length >= min && (!q || normalise(g.text).indexOf(q) >= 0));
    clear(list); clear(status); shown = 0;
    const head = t(kept.length === 1 ? W.sentence1 : W.sentences);
    const across = kept.reduce((s, g) => s + g.ids.length, 0);
    status.appendChild(el("b", { text: n(kept.length) }));
    status.appendChild(document.createTextNode(
      sep(head) + head + unit(across, W.acrossOne, W.acrossMany) + stop()));
    if (!kept.length) list.appendChild(el("li", { class: "tbl-empty", text: t(W.noHits) }));
    else draw();
  }

  let timer = 0;
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(run, 220); });
  minSel.addEventListener("change", run);
  more.addEventListener("click", draw);
  run();

  return el("div", null, [
    el("aside", { class: "note" }, [
      el("p", { class: "note-title", text: t({ en: "Read this first", bn: "আগে এটি পড়ুন" }) }),
      el("p", { text: t({
        en: "Public procurement runs on standard wording, and most of these sentences are boilerplate copied from a standard document. A sentence recurring is not evidence of anything on its own. What it shows is which requirements the six authorities in this set have in common, and which are unusual enough to be worth reading.",
        bn: "সরকারি ক্রয় চলে আদর্শ ভাষায়, আর এই বাক্যগুলোর বেশিরভাগই আদর্শ দস্তাবেজ থেকে হুবহু নেওয়া। কোনো বাক্যের পুনরাবৃত্তি নিজে থেকে কোনো কিছুর প্রমাণ নয়। এটি যা দেখায় তা হলো, এই সেটের ছয়টি সংস্থার শর্তে কী কী মিল আছে, আর কোনগুলো এতটাই অস্বাভাবিক যে পড়ে দেখা দরকার।",
      }) }),
    ]),
    el("div", { class: "controls" }, [
      el("div", { class: "ctl ctl-grow" }, [
        el("label", { for: "c-q", text: t({ en: "Wording contains", bn: "ভাষায় আছে" }) }), input,
      ]),
      el("div", { class: "ctl" }, [
        el("label", { for: "c-min", text: t({ en: "Used in at least", bn: "অন্তত এতটিতে ব্যবহৃত" }) }), minSel,
      ]),
    ]),
    status, list,
    el("div", { class: "chips" }, more),
  ]);
}

/* ------------------------------------------------------------------- the tab
   Four disclosures. Search is open on arrival because it is the one an editor
   reaches for; the other three build themselves the first time they are
   opened, so the tab is usable immediately even though the whole register sits
   in memory behind it. */

function toolBlock(id, title, note, build, open, corpus) {
  const body = el("div", { class: "open-body" });
  const disc = el("details", { class: "open", id: "tool-" + id }, [
    el("summary", null, [
      el("span", { text: t(title) }),
      el("span", { class: "open-note", html: fill(t(note), corpus) }),
    ]),
    body,
  ]);
  const build1 = () => { if (!body.firstChild) body.appendChild(build()); };
  disc.addEventListener("toggle", () => { if (disc.open) build1(); });
  if (open) { disc.setAttribute("open", "true"); build1(); }
  return disc;
}

/** Build the tools tab into `root`. `data` carries the payloads this tab needs:
    the register, the per-tender notes, the rule rows, the bidder rows, the
    winning firms and the extracted document text. */
export function renderTools(root, corpus, data) {
  const ctx = {
    corpus: corpus,
    tenders: data.tenders,
    details: data.details,
    deviations: data.deviations,
    bidders: data.bidders,
    winners: data.winners,
    doctext: data.doctext,
    byId: {},
    index: null,
    clauses: null,
  };
  for (const r of ctx.tenders) ctx.byId[String(r.tender_id)] = r;

  root.appendChild(el("div", { class: "measure" }, [
    el("p", { html: fill(t(W.intro), corpus) }),
    el("p", {
      html: fill(t({
        en: "{{counts.tenders}} tenders, {{counts.bidder_rows}} named bidder and award rows, {{counts.deviation_rows}} rule tests, and every passage of eligibility text that could be read out of the notices. Nothing is summarised here: each of the four opens onto a full record with the page it was read from and a link to the PDF.",
        bn: "{{counts.tenders}}টি দরপত্র, {{counts.bidder_rows}}টি নামসহ দরদাতা ও চুক্তির সারি, {{counts.deviation_rows}}টি নিয়ম-পরীক্ষা, এবং বিজ্ঞপ্তি থেকে পড়া যোগ্যতার প্রতিটি অংশ। এখানে কিছু সংক্ষেপ করা হয়নি: চারটির প্রতিটি খুললে পূর্ণ নথি, যে পৃষ্ঠা থেকে পড়া হয়েছে, আর পিডিএফের লিংক পাওয়া যায়।",
      }), corpus),
    }),
  ]));

  root.appendChild(el("div", { class: "open-stack" }, [
    toolBlock("search", W.searchTool, W.searchNote, () => searchTool(ctx), true, corpus),
    toolBlock("tenders", W.tenderTool, W.tenderNote, () => explorerTool(ctx), false, corpus),
    toolBlock("firms", W.firmTool, W.firmNote, () => firmsTool(ctx), false, corpus),
    toolBlock("clauses", W.clauseTool, W.clauseNote, () => clauseTool(ctx), false, corpus),
  ]));

  root.appendChild(el("p", { class: "src", html: t({
    en: "Everything in these four tools is read from the files the analysis wrote: <code>master_tender_investigation.csv</code>, <code>bidder_detail.csv</code>, <code>rule_deviations.csv</code>, the extracted document text and the per-tender notes. No value on this page is computed from anything outside the supplied PDFs.",
    bn: "এই চারটি টুলের সবকিছু বিশ্লেষণে তৈরি ফাইল থেকে পড়া: <code>master_tender_investigation.csv</code>, <code>bidder_detail.csv</code>, <code>rule_deviations.csv</code>, নথি থেকে তোলা লেখা, এবং দরপত্রপ্রতি টীকা। এই পাতার কোনো সংখ্যা সরবরাহ করা পিডিএফের বাইরের কিছু থেকে গোনা হয়নি।",
  }) }));

  return root;
}














