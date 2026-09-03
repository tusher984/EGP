/* e-GP WATCH — the data & method tab: how the figures were made, and the
   limits on them.
   ------------------------------------------------------------------
   This tab is written for the reader who does not believe the site, which is
   the right way to read it. It gives the files with their checksums, the steps
   between a PDF and a number, the things the documents never say, the two
   figures a fact checker could not reproduce, and the four values that were
   corrected after they were first computed.

   The limits are not at the bottom. Two of them govern how the whole rules tab
   should be read: the only standard document in the folder that states a
   testable clause is dated December 2025 and marked a preliminary draft, and
   the corpus contains no Public Procurement Rules text at all. Any reader who
   takes the deviation counts as breaches of law has been misled, so the tab
   says it before it says anything else. */

import { el, t, n, digits, date, dash, taka, href, fill, fillText, cite } from "./core.js";
import { figure, table } from "./charts.js";
import { UI, LABELS } from "./content.js";

/* A label or note that prints a count. The count is resolved here, against the
   corpus, rather than typed into the string: no figure on this tab — not even
   one inside a link's description — is written by hand. The row builders below
   take the result as a plain string, which t() passes through untouched. */
function withCount(pair, corpus) { return fillText(t(pair), corpus); }

const W = {
  intro: {
    en: "Every number on this site comes from four files, built from {{counts.pdfs|n}} PDFs by scripts in this repository. This section gives you the files, the steps, the corrections and the limits — enough to rebuild any figure or to throw it out.",
    bn: "এই সাইটের প্রতিটি সংখ্যা চারটি ফাইল থেকে এসেছে, যেগুলো {{counts.pdfs|n}}টি পিডিএফ থেকে এই রিপোজিটরির স্ক্রিপ্টে তৈরি। এই অংশে আছে ফাইল, ধাপ, সংশোধন ও সীমাবদ্ধতা — যেকোনো সংখ্যা আবার তৈরি করার, বা বাতিল করার মতো যথেষ্ট।",
  },
  firstHead: { en: "Read this before any deviation count", bn: "যেকোনো বিচ্যুতির হিসাব পড়ার আগে" },
  chainHead: { en: "From a PDF to a number", bn: "পিডিএফ থেকে সংখ্যা পর্যন্ত" },
  filesHead: { en: "The files, with their checksums", bn: "ফাইলগুলো, চেকসাম সহ" },
  payloadHead: { en: "What this site loads", bn: "এই সাইট যা লোড করে" },
  scriptsHead: { en: "The scripts that produce every figure", bn: "প্রতিটি সংখ্যা তৈরি করা স্ক্রিপ্ট" },
  toolsHead: { en: "The tools, opened directly", bn: "টুলগুলো, সরাসরি" },
  gapsHead: { en: "What these documents never say", bn: "এই নথিগুলো যা কখনো বলে না" },
  qaHead: { en: "Corrections made after the first computation", bn: "প্রথম গণনার পরে করা সংশোধন" },
  notesHead: { en: "Where the fact check disagreed with the analysis", bn: "যেখানে তথ্য-যাচাই বিশ্লেষণের সঙ্গে একমত হয়নি" },
  confHead: { en: "How confident each reading is", bn: "প্রতিটি পাঠে কতটা আস্থা" },
  quoteHead: { en: "Why a quote may not grep", bn: "উদ্ধৃতি কেন হুবহু খুঁজে না-ও মিলতে পারে" },
  citeHead: { en: "How to read a source line", bn: "সূত্র-রেখা কীভাবে পড়বেন" },
  citeNote: {
    en: "Every source line on this site is written in the order a procurement file is cited in Bangladesh, which is not the order a footnote uses. A footnote starts with the author. A procurement citation starts with the office answerable for the document and ends with the machine trail, so the reader can both write to a person and re-run a number.",
    bn: "এই সাইটের প্রতিটি সূত্র-রেখা বাংলাদেশে যেভাবে ক্রয়সংক্রান্ত নথি উদ্ধৃত করা হয় সেই ক্রমে লেখা — পাদটীকার ক্রমে নয়। পাদটীকা শুরু হয় লেখক দিয়ে। ক্রয়সংক্রান্ত উদ্ধৃতি শুরু হয় নথির জন্য জবাবদিহি করা অফিস দিয়ে আর শেষ হয় যন্ত্রের পথ দিয়ে, যাতে পাঠক একজন মানুষকে চিঠিও লিখতে পারেন আর সংখ্যাটি আবার চালিয়েও দেখতে পারেন।",
  },
  citeWorked: { en: "The same order, on a document in this folder", bn: "একই ক্রম, এই ফোল্ডারের একটি নথিতে" },
  citeScript: {
    en: "A clause number and a filename stay in Latin script in both editions, because they are typed into a search box rather than read aloud. Page numbers and tender IDs are prose and take Bengali digits in the Bangla edition.",
    bn: "ধারার নম্বর আর ফাইলের নাম দুই সংস্করণেই ল্যাটিন হরফে থাকে, কারণ সেগুলো পড়ে শোনানোর জিনিস নয় — খোঁজের ঘরে টাইপ করার জিনিস। পৃষ্ঠা নম্বর আর দরপত্র আইডি বাক্যের অংশ, তাই বাংলা সংস্করণে সেগুলো বাংলা অঙ্কে।",
  },
  before: { en: "First computed as", bn: "প্রথমে গণনা হয়েছিল" },
  after: { en: "Corrected to", bn: "সংশোধিত হয়ে" },
  because: { en: "Because the notice reads", bn: "কারণ বিজ্ঞপ্তিতে লেখা" },
  claimed: { en: "The analysis said", bn: "বিশ্লেষণ বলেছিল" },
  instead: { en: "This site prints instead", bn: "এই সাইট বদলে যা ছাপে" },
  rows: { en: "rows", bn: "সারি" },
  cols: { en: "columns", bn: "কলাম" },
  built: { en: "Built", bn: "তৈরি" },
  byline: { en: "Reporting and analysis", bn: "প্রতিবেদন ও বিশ্লেষণ" },
};

/* ------------------------------------------------------------------ helpers */

function mb(bytes) {
  if (!bytes) return dash();
  const v = bytes / 1048576;
  return digits(v >= 10 ? v.toFixed(0) : v.toFixed(1)) + " MB";
}

/** A download row: what the file is, what is in it, and a link that opens it.
    The checksum is printed because a reader who rebuilds a figure needs to know
    they have the same file, and it is the first sixteen hex digits of the
    sha256 as the build recorded it. */
function fileRow(src) {
  const bits = [t(W.rows) + ": " + (src.rows === null ? dash() : n(src.rows))];
  if (src.cols) bits.push(t(W.cols) + ": " + n(src.cols));
  bits.push("sha256 " + src.sha256);
  return el("li", { class: "dl-row" }, [
    el("span", { class: "dl-what" },
      el("a", { href: href("investigation_output", src.name) }, el("code", { text: src.name }))),
    el("span", { class: "dl-note", text: bits.join("  ·  ") }),
    el("span", { class: "dl-size", text: mb(src.bytes) }),
  ]);
}

function linkRow(path, note, size) {
  return el("li", { class: "dl-row" }, [
    el("span", { class: "dl-what" },
      el("a", { href: path.split("/").map(encodeURIComponent).join("/") },
        el("code", { text: path.split("/").pop() }))),
    el("span", { class: "dl-note", text: t(note) }),
    el("span", { class: "dl-size", text: size || "" }),
  ]);
}

/** A jump to one of the site's own tabs. The tabs are hash-routed, so an
    ordinary link is all this needs to be. */
function tabRow(hash, label, note) {
  return el("li", { class: "dl-row" }, [
    el("span", { class: "dl-what" }, el("a", { href: hash, text: t(label) })),
    el("span", { class: "dl-note", text: t(note) }),
    el("span", { class: "dl-size", text: "" }),
  ]);
}

/* ------------------------------------------------------------------- the chain
   Seven steps, each one a place a figure could go wrong. Stating them in order
   is how a reader decides which of the numbers to trust. */

const CHAIN = [
  {
    step: { en: "1 · Read every file", bn: "১ · প্রতিটি ফাইল পড়া" },
    note: {
      en: "All {{counts.pdfs|n}} PDFs in the folder were opened and their text layer extracted with layout preserved, so a table stays a table and a column of figures does not collapse into one line. Every file carried a text layer: {{counts.ocr_used|n}} needed optical character recognition, which means no number on this site was guessed from a picture of a page.",
      bn: "ফোল্ডারের {{counts.pdfs|n}}টি পিডিএফ খুলে বিন্যাস রেখে লেখা তোলা হয়েছে, যাতে টেবিল টেবিলই থাকে আর সংখ্যার কলাম এক লাইনে মিশে না যায়। প্রতিটি ফাইলেই লেখার স্তর ছিল: {{counts.ocr_used|n}}টিতে ওসিআর লেগেছে, অর্থাৎ এই সাইটের কোনো সংখ্যা পৃষ্ঠার ছবি দেখে অনুমান করা হয়নি।",
    },
  },
  {
    step: { en: "2 · Give each value a name and a page", bn: "২ · প্রতিটি মানকে নাম ও পৃষ্ঠা দেওয়া" },
    note: {
      en: "Each tender became one row of {{counts.columns|n}} named fields. Alongside the value, the row keeps the page it was read from and the passage it was read out of, which is why every record on this site can show its own evidence.",
      bn: "প্রতিটি দরপত্র হয়েছে {{counts.columns|n}}টি নামযুক্ত ঘরের একটি সারি। মানের পাশে সারিটি রাখে কোন পৃষ্ঠা থেকে পড়া হয়েছে আর কোন অংশ থেকে — সে কারণেই এই সাইটের প্রতিটি নথি নিজের প্রমাণ দেখাতে পারে।",
    },
  },
  {
    step: { en: "3 · Keep the original spelling", bn: "৩ · মূল বানান রাখা" },
    note: {
      en: "Firm names were grouped into {{concentration.distinct_winners|n}} firms, but the original spelling of every name is kept beside the grouped one and is shown in the firms tool. Two firms were never merged because their names looked similar — the variants each grouping used are printed so a reader can disagree with any of them.",
      bn: "প্রতিষ্ঠানের নাম {{concentration.distinct_winners|n}}টি প্রতিষ্ঠানে দলবদ্ধ হয়েছে, কিন্তু প্রতিটি নামের মূল বানান পাশে রাখা আছে এবং টুলে দেখা যায়। নাম দেখতে একরকম বলে দুটি প্রতিষ্ঠান কখনো এক করা হয়নি — প্রতিটি দলে যে রূপভেদ ধরা হয়েছে তা ছাপা আছে, যাতে পাঠক দ্বিমত করতে পারেন।",
    },
  },
  {
    step: { en: "4 · Test the clauses", bn: "৪ · ধারাগুলো পরীক্ষা করা" },
    note: {
      en: "{{counts.rules|n}} clauses were taken from the standard documents in the folder and tested against every tender they could apply to — {{rules_summary.tested_rows|n}} tests, of which {{rules_summary.deviation_rows|n}} recorded a deviation. Each test records the clause's own wording, the file and page it came from, and whether the clause is an obligation or a recommended band.",
      bn: "ফোল্ডারের আদর্শ দস্তাবেজ থেকে {{counts.rules|n}}টি ধারা নিয়ে প্রযোজ্য প্রতিটি দরপত্রে পরীক্ষা করা হয়েছে — {{rules_summary.tested_rows|n}}টি পরীক্ষা, তার {{rules_summary.deviation_rows|n}}টিতে বিচ্যুতি। প্রতিটি পরীক্ষা ধারার নিজের ভাষা, যে ফাইল ও পৃষ্ঠা থেকে নেওয়া, এবং ধারাটি বাধ্যবাধকতা না সুপারিশ — সব লিখে রাখে।",
    },
  },
  {
    step: { en: "5 · Rank what to read first, not what is wrong", bn: "৫ · কী আগে পড়তে হবে, ভুল কী নয়" },
    note: {
      en: "Each tender carries a reading-order score: {{priority.bands.key=HIGH.n|n}} high, {{priority.bands.key=MEDIUM.n|n}} medium, {{priority.bands.key=LOW.n|n}} low. It ranks how much there is to check in a document, not how likely anyone is to have done something wrong, and it is built only from things the documents state.",
      bn: "প্রতিটি দরপত্রে আছে পড়ার ক্রমের একটি নম্বর: {{priority.bands.key=HIGH.n|n}}টি উচ্চ, {{priority.bands.key=MEDIUM.n|n}}টি মধ্যম, {{priority.bands.key=LOW.n|n}}টি নিম্ন। এটি বলে কোনো নথিতে যাচাইয়ের কতটা আছে, কে অন্যায় করেছে সেই সম্ভাবনা নয়, এবং এটি কেবল নথিতে থাকা তথ্য থেকেই তৈরি।",
    },
  },
  {
    step: { en: "6 · Check the figures against the pages again", bn: "৬ · সংখ্যাগুলো আবার পৃষ্ঠার সঙ্গে মেলানো" },
    note: {
      en: "Every figure was recomputed from the files and compared with the analyst's own summary. Four values were corrected and two figures could not be reproduced; all six are recorded below with what changed.",
      bn: "প্রতিটি সংখ্যা ফাইল থেকে আবার গোনা হয়েছে এবং বিশ্লেষকের নিজের সারসংক্ষেপের সঙ্গে মিলিয়ে দেখা হয়েছে। চারটি মান সংশোধিত হয়েছে, দুটি সংখ্যা আবার তৈরি করা যায়নি; ছয়টিই নিচে কী বদলেছে তা সহ লেখা আছে।",
    },
  },
  {
    step: { en: "7 · Say what is missing", bn: "৭ · কী নেই তা বলা" },
    note: {
      en: "Where a document does not state something, no value was inferred. The cell says what is missing instead, and the largest of those gaps are listed below because they set the ceiling on what this investigation can conclude.",
      bn: "কোনো নথি কিছু না বললে সেখানে কোনো মান অনুমান করা হয়নি। ঘরটি বলে কী নেই — আর সবচেয়ে বড় ফাঁকগুলো নিচে তালিকাভুক্ত, কারণ এই অনুসন্ধান কতদূর পৌঁছাতে পারে তার সীমা ওগুলোই ঠিক করে।",
    },
  },
];

/* ---------------------------------------------------------------- the sections */

/** The two limits that govern the rules tab. Printed at the top of the tab, not
    the bottom, because a reader who takes a deviation count for a breach of law
    has been misled by the order of the page. */
function instrument(corpus) {
  const cat = corpus.meta.rule_catalogue || {};
  return el("aside", { class: "note" }, [
    el("p", { class: "note-title", text: t(W.firstHead) }),
    el("p", { text: t({
      en: "A deviation counted on this site means one thing: the tender does not match a clause printed in a standard document that is in this folder. It does not mean a law was broken, and for most of the counts it cannot mean that.",
      bn: "এই সাইটে গোনা একটি বিচ্যুতির অর্থ একটিই: দরপত্রটি এই ফোল্ডারে থাকা কোনো আদর্শ দস্তাবেজে ছাপা ধারার সঙ্গে মেলে না। এর মানে আইন ভাঙা হয়েছে তা নয়, আর বেশিরভাগ হিসাবের ক্ষেত্রে তা হতেই পারে না।",
    }) }),
    cat.instrument_note ? el("p", { text: cat.instrument_note }) : null,
    el("p", { text: t({
      en: "That is why every rule on the rules tab prints, above its count, which document the clause came from, whether the clause is worded as an obligation or as a recommended band, and how many of the rows cite a clause dated after the tender they are applied to.",
      bn: "সে কারণেই নিয়ম ট্যাবের প্রতিটি নিয়ম তার হিসাবের ওপরে লেখে — ধারাটি কোন দস্তাবেজ থেকে, ধারাটি বাধ্যবাধকতা হিসেবে লেখা না সুপারিশকৃত সীমা হিসেবে, এবং কতটি সারি এমন ধারা উদ্ধৃত করছে যার তারিখ সংশ্লিষ্ট দরপত্রের পরে।",
    }) }),
  ].filter(Boolean));
}

function quoteNote(corpus) {
  const cat = corpus.meta.rule_catalogue || {};
  if (!cat.quote_note) return null;
  return el("details", { class: "open" }, [
    el("summary", null, [
      el("span", { text: t(W.quoteHead) }),
      el("span", { class: "open-note", text: t({ en: "three extraction artefacts", bn: "তিনটি নিষ্কাশন-ত্রুটি" }) }),
    ]),
    el("div", { class: "open-body" }, el("p", { class: "measure", text: cat.quote_note })),
  ]);
}

/* --------------------------------------------------------------- citation
   How to read a source line. The order is not a stylistic choice and it is not
   the order a Western footnote uses, so the tab states it: a procurement file
   in Bangladesh is cited from the office answerable for it outwards. */

const PARTS = [
  { what: { en: "Procuring entity", bn: "ক্রয়কারী সংস্থা" },
    why: { en: "The office that issued the document and the office a reader writes to. It comes first because it is who is answerable, not who wrote the file.",
      bn: "যে অফিস নথিটি জারি করেছে এবং যে অফিসে পাঠক চিঠি লিখবেন। এটি প্রথমে আসে কারণ জবাবদিহি তারই, নথিটি কে টাইপ করেছে তা নয়।" } },
  { what: { en: "e-GP tender ID", bn: "e-GP দরপত্র আইডি" },
    why: { en: "The number the portal issues. It is the only handle that survives a renamed file, so every citation carries it.",
      bn: "পোর্টাল যে নম্বর দেয়। ফাইলের নাম বদলে গেলেও এটিই টিকে থাকে, তাই প্রতিটি উদ্ধৃতিতে এটি থাকে।" } },
  { what: { en: "Package", bn: "প্যাকেজ" },
    why: { en: "The package description as the notice prints it, when a tender covers more than one.",
      bn: "বিজ্ঞপ্তিতে যেভাবে ছাপা, প্যাকেজের বিবরণ — একটি দরপত্রে একাধিক প্যাকেজ থাকলে।" } },
  { what: { en: "Clause", bn: "ধারা" },
    why: { en: "In the form the standard document itself uses: the ITT number, the TDS entry that varies it, and the Rule of the Public Procurement Rules that the TDS entry cites. Never renumbered here.",
      bn: "আদর্শ দস্তাবেজ নিজে যে রূপে লেখে সেভাবেই: ITT নম্বর, যে TDS ভুক্তি তা বদলায়, এবং সেই TDS ভুক্তি যে পাবলিক প্রকিউরমেন্ট রুলসের ধারা উদ্ধৃত করে। এখানে নতুন করে নম্বর দেওয়া হয়নি।" } },
  { what: { en: "Printed page (PDF page)", bn: "ছাপা পৃষ্ঠা (পিডিএফ পৃষ্ঠা)" },
    why: { en: "The number printed on the page comes first, because that is the number an official will quote back. A standard tender document restarts its numbering in every section, so the PDF's own page follows in brackets whenever the two differ.",
      bn: "পৃষ্ঠায় ছাপা নম্বরটি আগে, কারণ কর্মকর্তা ওই নম্বরই উদ্ধৃত করবেন। আদর্শ দরপত্র দস্তাবেজ প্রতিটি অংশে নতুন করে নম্বর শুরু করে, তাই দুটি আলাদা হলে বন্ধনীতে পিডিএফের নিজের পৃষ্ঠা থাকে।" } },
  { what: { en: "File and column", bn: "ফাইল ও কলাম" },
    why: { en: "The machine trail, in monospace: the PDF on disk and the CSV column the figure was read from, so the number can be re-run rather than taken on trust.",
      bn: "যন্ত্রের পথ, মনোস্পেসে: ডিস্কের পিডিএফ ও যে সিএসভি কলাম থেকে সংখ্যাটি পড়া হয়েছে — যাতে সংখ্যাটি বিশ্বাস করে নেওয়ার বদলে আবার চালানো যায়।" } },
];

function citation(corpus) {
  const x = (corpus.exhibits || [])[0];
  const kids = [
    el("p", { class: "note-title", text: t(W.citeHead) }),
    el("p", { class: "measure", text: t(W.citeNote) }),
    el("ul", { class: "dl-list" }, PARTS.map((p) => el("li", { class: "dl-row" }, [
      el("span", { class: "dl-what", text: t(p.what) }),
      el("span", { class: "dl-note", text: t(p.why) }),
    ]))),
  ];

  /* One worked citation, built from the corpus rather than typed, so the order
     above can be checked against a line the site actually prints. */
  if (x) {
    kids.push(el("div", { class: "exhibit" }, [
      el("p", { class: "exhibit-label", text: t(W.citeWorked) }),
      el("p", { class: "src" }, cite({
        entity: x.agency, tender: x.tender_id, pkg: x.package, page: x.page,
        file: x.notice && x.notice.file ? x.notice.file : null, column: x.column,
        links: x.notice && x.notice.file
          ? [el("a", { href: href(x.notice.dir, x.notice.file), text: t(UI.words.open) })]
          : [],
      })),
    ]));
  }

  kids.push(el("p", { class: "src measure", text: t(W.citeScript) }));
  return el("div", null, kids);
}

function chain(corpus) {
  return el("ul", { class: "dl-list" }, CHAIN.map((s) => el("li", { class: "dl-row" }, [
    el("span", { class: "dl-what", text: t(s.step) }),
    el("span", { class: "dl-note", html: fill(t(s.note), corpus) }),
  ])));
}

/** What the documents never say. This is the ceiling on the investigation, and
    the four largest gaps are the reason three of the questions a reader will
    ask cannot be answered from this folder at all. */
function gaps(corpus) {
  const rows = (corpus.qa && corpus.qa.gaps) || [];
  if (!rows.length) return null;
  return el("div", null, [
    el("p", { class: "note-title", text: t(W.gapsHead) }),
    el("ul", { class: "dl-list" }, rows.map((g) => el("li", { class: "dl-row" }, [
      el("span", { class: "dl-what", text: g.key }),
      el("span", { class: "dl-note", text: t({
        en: "on " + n(g.n) + " of " + n(corpus.counts.tenders) + " tenders",
        bn: n(corpus.counts.tenders) + "টির মধ্যে " + n(g.n) + "টিতে",
      }) }),
      el("span", { class: "dl-size", text: digits(Math.round((g.n / corpus.counts.tenders) * 100)) + "%" }),
    ]))),
  ]);
}

/* Four values were wrong the first time they were computed, in the same
   direction and for the same reason: a notice writes "Tk. 8,25,000 (Eight Lac
   Twenty Five Thousand) only" and a first pass read the spelled-out words as
   another figure. Printing the before, the after and the sentence itself is
   the only way a reader can check that the correction went the right way. */
function corrections(corpus) {
  const rows = (corpus.qa && corpus.qa.corrections) || [];
  if (!rows.length) return null;
  return el("div", null, [
    el("p", { class: "note-title", text: t(W.qaHead) }),
    table(
      [UI.words.tender, { en: "Column", bn: "কলাম" }, W.before, W.after, W.because],
      rows.map((c) => [digits(c.tender_id) + " (" + c.agency + ")", c.column,
        taka(c.before), taka(c.after), c.quote]),
      { textCols: true }
    ),
    el("p", { class: "src", text: t({
      en: "The correction script that made these four changes is in the repository and is listed below, so the change can be re-run and checked rather than taken on trust.",
      bn: "এই চারটি বদল যে সংশোধন-স্ক্রিপ্ট করেছে তা রিপোজিটরিতে আছে এবং নিচে তালিকাভুক্ত, যাতে বদলটি আবার চালিয়ে যাচাই করা যায়, বিশ্বাসে নিতে না হয়।",
    }) }),
  ]);
}

/** Where the fact check could not reproduce the analyst's own figure. Both
    disagreements are printed with what the site publishes instead, because a
    figure quietly replaced is a figure a reader cannot audit. */
function notes(corpus) {
  const rows = (corpus.qa && corpus.qa.notes) || [];
  if (!rows.length) return null;
  return el("div", null, [
    el("p", { class: "note-title", text: t(W.notesHead) }),
    el("div", null, rows.map((note) => el("aside", { class: "note" }, [
      el("p", { class: "note-title", text: note.kind }),
      el("p", null, [el("b", { text: t(W.claimed) + ": " }), note.what]),
      el("p", null, [el("b", { text: t(W.instead) + ": " }), note.instead]),
    ]))),
  ]);
}

function confidence(corpus) {
  const rows = (corpus.qa && corpus.qa.extraction_confidence) || [];
  if (!rows.length) return null;
  const total = rows.reduce((s, r) => s + r.n, 0);
  return figure({
    title: fillText(t({
      en: "How confident each of the {{n}} readings is",
      bn: "{{n}}টি পাঠের প্রতিটিতে কতটা আস্থা",
    }), { n: total }),
    deck: {
      en: "Confidence is recorded per tender, not per figure. The middle row is not a failure: it is a notice that publishes no criteria at all, where the honest reading is that there is nothing to parse.",
      bn: "আস্থা লেখা হয় দরপত্রপ্রতি, সংখ্যাপ্রতি নয়। মাঝের সারিটি ব্যর্থতা নয়: সেটি এমন বিজ্ঞপ্তি যা কোনো শর্তই প্রকাশ করে না, যেখানে সৎ পাঠ হলো পড়ার কিছু নেই।",
    },
    plot: table(
      [W.confHead, UI.words.tenders, { en: "Share", bn: "হার" }],
      rows.map((r) => [
        LABELS.extraction[r.key] ? t(LABELS.extraction[r.key]) : r.key,
        n(r.n),
        digits(((r.n / total) * 100).toFixed(1)) + "%",
      ]),
      { textCols: true }
    ),
    source: {
      en: t(UI.words.source) + ": <code>investigation_output/master_tender_investigation.csv</code>, column <code>extraction_confidence</code>.",
      bn: t(UI.words.source) + ": <code>investigation_output/master_tender_investigation.csv</code>, <code>extraction_confidence</code> কলাম।",
    },
  });
}

/* Everything a reader needs to rebuild the site: the four analysis files, the
   nine payloads the browser actually loads, and the scripts that made both. */
function downloads(corpus) {
  const srcs = (corpus.meta && corpus.meta.sources) || [];
  const payloads = [
    ["site/data/corpus.json", { en: "Every figure the article prints, and only those", bn: "প্রতিবেদন যে সংখ্যাগুলো ছাপে, কেবল সেগুলো" }],
    ["site/data/tenders.json", { en: "The register: one row per tender", bn: "নিবন্ধন: দরপত্রপ্রতি একটি সারি" }],
    ["site/data/details.json", { en: "The per-tender notes, hypotheses and gaps", bn: "দরপত্রপ্রতি টীকা, অনুমান ও ফাঁক" }],
    ["site/data/deviations.json", { en: "Every rule test, with its excerpt and page", bn: "প্রতিটি নিয়ম-পরীক্ষা, উদ্ধৃতি ও পৃষ্ঠাসহ" }],
    ["site/data/bidders.json", { en: "Every named bidder and award row", bn: "নামসহ প্রতিটি দরদাতা ও চুক্তির সারি" }],
    ["site/data/winners.json", { en: "The winning firms, grouped, with their spellings", bn: "বিজয়ী প্রতিষ্ঠান, দলবদ্ধ, বানানসহ" }],
    ["site/data/documents.json", withCount({ en: "The index of all {{counts.pdfs|n}} PDFs", bn: "{{counts.pdfs|n}}টি পিডিএফের তালিকা" }, corpus)],
    ["site/data/doctext.json", { en: "The extracted eligibility text, by section", bn: "তোলা যোগ্যতার লেখা, অংশ অনুসারে" }],
    ["site/data/rules.json", withCount({ en: "The {{counts.rules|n}} clauses and their test results", bn: "{{counts.rules|n}}টি ধারা ও তাদের ফলাফল" }, corpus)],
  ];
  const scripts = [
    ["investigation_output/rule_scripts/rule_catalogue.py", withCount({ en: "The {{counts.rules|n}} clauses, each with its file, page, wording and force", bn: "{{counts.rules|n}}টি ধারা, প্রতিটির ফাইল, পৃষ্ঠা, ভাষা ও ওজনসহ" }, corpus)],
    ["investigation_output/rule_scripts/run_rules.py", { en: "Runs every clause against every tender and writes rule_deviations.csv", bn: "প্রতিটি ধারা প্রতিটি দরপত্রে চালিয়ে rule_deviations.csv লেখে" }],
    ["investigation_output/rule_scripts/fix_liquid_asset_bug.py", { en: "The correction logged above, as it was applied", bn: "ওপরে লেখা সংশোধন, যেভাবে প্রয়োগ হয়েছে" }],
    ["site/build/build.py", { en: "Turns the three CSVs into the payloads this page lists", bn: "তিনটি সিএসভি থেকে এই পাতার তালিকাভুক্ত পেলোড তৈরি করে" }],
  ];

  return el("div", null, [
    el("p", { class: "note-title", text: t(W.filesHead) }),
    el("ul", { class: "dl-list" }, srcs.map(fileRow)),
    el("p", { class: "note-title", text: t(W.payloadHead) }),
    el("ul", { class: "dl-list" }, payloads.map(([p, note]) => linkRow(p, note))),
    el("p", { class: "note-title", text: t(W.scriptsHead) }),
    el("ul", { class: "dl-list" }, scripts.map(([p, note]) => linkRow(p, note))),
  ]);
}

/** The tools, linked from here as well as from the tab bar, because a reader who
    has just read how a number was made is the reader most likely to want to
    check one. */
function toolLinks(corpus) {
  return el("div", null, [
    el("p", { class: "note-title", text: t(W.toolsHead) }),
    el("ul", { class: "dl-list" }, [
      tabRow("#tools", { en: "Search every document", bn: "সব নথিতে খুঁজুন" },
        withCount({ en: "Words, phrases, tender numbers, firm names and clause text across all {{counts.tenders|n}} records, with column filters and ranges.", bn: "{{counts.tenders|n}}টি নথিতে শব্দ, বাক্যাংশ, দরপত্র নম্বর, প্রতিষ্ঠানের নাম ও ধারার লেখা — কলাম ও পরিসর ধরে ছাঁকা যায়।" }, corpus)),
      tabRow("#tools", { en: "Filter the tenders", bn: "দরপত্র ছেঁকে দেখুন" },
        { en: "The whole register by authority, competition, how the criteria read and reading order, each row opening a full record.", bn: "সংস্থা, প্রতিযোগিতা, শর্তের ধরন ও পড়ার ক্রম অনুসারে পুরো নিবন্ধন; প্রতিটি সারি পূর্ণ নথি খোলে।" }),
      tabRow("#tools", { en: "The winning firms", bn: "বিজয়ী প্রতিষ্ঠানগুলো" },
        withCount({ en: "All {{concentration.distinct_winners|n}}, with what each won, where, the spellings the notices use and whether a name was ever merged.", bn: "সব {{concentration.distinct_winners|n}}টি — কে কী পেয়েছে, কোথায়, বিজ্ঞপ্তিতে কী বানান, আর কোনো নাম এক করা হয়েছে কি না।" }, corpus)),
      tabRow("#tools", { en: "Eligibility wording that recurs", bn: "পুনরাবৃত্ত যোগ্যতার ভাষা" },
        { en: "The sentences that appear in more than one tender, each openable onto the tenders that use it.", bn: "একাধিক দরপত্রে থাকা বাক্যগুলো; প্রতিটি খুললে ব্যবহারকারী দরপত্রগুলো দেখা যায়।" }),
      tabRow("#rules", withCount({ en: "The {{counts.rules|n}} rules, one by one", bn: "{{counts.rules|n}}টি নিয়ম, একে একে" }, corpus),
        { en: "Each clause as printed, its file and page, its force, what was compared, the count and the limit on it.", bn: "প্রতিটি ধারা যেভাবে ছাপা, তার ফাইল ও পৃষ্ঠা, ওজন, কী মিলিয়ে দেখা হয়েছে, হিসাব ও সীমা।" }),
      tabRow("#docs", { en: "Open the source PDFs", bn: "মূল পিডিএফগুলো খুলুন" },
        withCount({ en: "All {{counts.pdfs|n}} files, filterable by kind and authority, each one a link to the document itself.", bn: "সব {{counts.pdfs|n}}টি ফাইল, ধরন ও সংস্থা অনুসারে ছাঁকা যায়; প্রতিটি নথির সরাসরি লিংক।" }, corpus)),
    ]),
  ]);
}

/** Build the data & method tab into `root`. Everything on it is read from
    corpus.json's own meta and qa blocks — the build records what it did, and
    this tab prints that record rather than a description of it. */
export function renderMethod(root, corpus) {
  root.appendChild(el("div", { class: "measure" }, [
    el("p", { html: fill(t(W.intro), corpus) }),
  ]));

  root.appendChild(instrument(corpus));

  const qn = quoteNote(corpus);
  if (qn) root.appendChild(el("div", { class: "open-stack" }, qn));

  root.appendChild(el("p", { class: "note-title", text: t(W.chainHead) }));
  root.appendChild(chain(corpus));

  root.appendChild(citation(corpus));

  const g = gaps(corpus);
  if (g) root.appendChild(g);

  const conf = confidence(corpus);
  if (conf) root.appendChild(conf);

  const corr = corrections(corpus);
  if (corr) root.appendChild(corr);

  const nn = notes(corpus);
  if (nn) root.appendChild(nn);

  root.appendChild(downloads(corpus));
  root.appendChild(toolLinks(corpus));

  const meta = corpus.meta || {};
  root.appendChild(el("p", { class: "src", text: [
    t(W.byline) + ": " + (meta.byline || dash()),
    t(W.built) + ": " + (meta.built ? date(String(meta.built).slice(0, 10)) : dash()),
  ].join("  ·  ") }));

  root.appendChild(el("p", { class: "src measure", text: t({
    en: "This site loads nothing from outside this folder: no map service, no font service, no analytics, no external dataset. Every figure, every quote and every link resolves to a file listed on this page.",
    bn: "এই সাইট এই ফোল্ডারের বাইরে থেকে কিছু আনে না: কোনো ম্যাপ সেবা নয়, ফন্ট সেবা নয়, অ্যানালিটিক্স নয়, বাইরের কোনো ডেটাসেট নয়। প্রতিটি সংখ্যা, প্রতিটি উদ্ধৃতি ও প্রতিটি লিংক এই পাতায় তালিকাভুক্ত কোনো ফাইলেই পৌঁছায়।",
  }) }));

  return root;
}
