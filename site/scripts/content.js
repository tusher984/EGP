/* e-GP WATCH — the article, the interface labels, and the token dictionary.
   ------------------------------------------------------------------
   Three things live here: the interface labels, the article itself, and the
   dictionary that turns every machine token in the CSVs into written words.
   Each one is an {en, bn} pair, so the Bangla edition is the same document
   rather than a second site that can drift out of step with the first.

   A chart's own title and deck sit in the tab module beside the chart, not
   here, because a title that is separated from the plot it describes is a title
   that goes stale. Everything else reader-facing is in this file.

   NO FIGURE IS TYPED INTO THIS FILE. Where a number belongs in a sentence the
   text carries a {{path|filter}} token which core.js fill() resolves against
   site/data/corpus.json at render time. If the data changes, the sentence
   changes; if a path disappears, the page says so out loud. This is the whole
   reason the prose is data and not markup.

   The language rules the investigation is written under are enforced by hand
   here and worth restating, because this is the file where they could be
   broken: a pattern is an investigative signal, never proof of wrongdoing; no
   entity is accused of anything; where the documents do not establish a reason,
   the text says the documents do not establish a reason. */

export const UI = {
  brand: { en: "e-GP WATCH", bn: "e-GP ওয়াচ" },
  brandNote: {
    en: "An investigation built only from the published documents",
    bn: "কেবল প্রকাশিত নথি থেকে তৈরি একটি অনুসন্ধান",
  },
  skip: { en: "Skip to content", bn: "মূল অংশে যান" },
  toTop: { en: "Back to the top", bn: "উপরে ফিরে যান" },
  theme: { en: "Dark", bn: "ডার্ক" },
  themeOn: { en: "Light", bn: "লাইট" },
  /* The one place the Bangla edition says a word in English on purpose. A
     reader who wants the English edition is looking for the word "English", and
     a switch labelled in a script they cannot read is a switch they cannot
     find. Both editions therefore name the edition they lead to. */
  langBtn: { en: "বাংলা", bn: "English" },
  langTitle: { en: "Read in Bangla", bn: "Read in English" },
  loading: { en: "Loading…", bn: "লোড হচ্ছে…" },
  loadFail: {
    en: "That data file did not load. The site reads it from <code>site/data/</code> in this folder.",
    bn: "ডেটা ফাইলটি লোড হয়নি। সাইটটি এটি এই ফোল্ডারের <code>site/data/</code> থেকে পড়ে।",
  },

  /* The label a section is named by in the stack under the article, and in the
     footer. The first two used to be headings inside the article; they are
     headed by the same words in the same order, in the place a reader now opens
     them from. */
  tabs: {
    story: { en: "The investigation", bn: "অনুসন্ধান" },
    limits: { en: "What these documents cannot tell us", bn: "এই নথিগুলো যা বলতে পারে না" },
    check: { en: "How to check this", bn: "এটি যাচাই করবেন কীভাবে" },
    rules: { en: "Rules tested", bn: "যে নিয়মগুলো পরীক্ষা করা হয়েছে" },
    tools: { en: "Explore the data", bn: "ডেটা ঘেঁটে দেখুন" },
    docs: { en: "Documents", bn: "নথিপত্র" },
    method: { en: "Data & method", bn: "ডেটা ও পদ্ধতি" },
  },

  tags: {
    fact: { en: "Documented fact", bn: "নথিভুক্ত তথ্য" },
    derived: { en: "Data-derived finding", bn: "ডেটা থেকে পাওয়া ফলাফল" },
    possible: { en: "Possible connection", bn: "সম্ভাব্য সংযোগ" },
    unresolved: { en: "Unresolved", bn: "অমীমাংসিত" },
  },

  words: {
    tenders: { en: "tenders", bn: "দরপত্র" },
    /* The form used when the count is one. English inflects, Bangla does not;
       the pair still has both members so a caller never has to know which. */
    tender1: { en: "tender", bn: "দরপত্র" },
    tender: { en: "Tender", bn: "দরপত্র" },
    agency: { en: "Authority", bn: "সংস্থা" },
    value: { en: "Contract value", bn: "চুক্তিমূল্য" },
    bids: { en: "Bids received", bn: "প্রাপ্ত দরপত্র" },
    responsive: { en: "Ruled responsive", bn: "গ্রহণযোগ্য বিবেচিত" },
    winner: { en: "Winner", bn: "বিজয়ী" },
    published: { en: "Published", bn: "প্রকাশিত" },
    signed: { en: "Signed", bn: "স্বাক্ষরিত" },
    money: { en: "Money", bn: "অর্থ" },
    share: { en: "Share of the money", bn: "অর্থের অংশ" },
    contracts: { en: "Contracts", bn: "চুক্তি" },
    deviations: { en: "Deviations", bn: "বিচ্যুতি" },
    tested: { en: "Tests run", bn: "পরীক্ষা চালানো হয়েছে" },
    count: { en: "Number of tenders", bn: "দরপত্রের সংখ্যা" },
    pages: { en: "pages", bn: "পৃষ্ঠা" },
    page: { en: "page", bn: "পৃষ্ঠা" },
    open: { en: "Open the PDF", bn: "পিডিএফ খুলুন" },
    noticePdf: { en: "Tender notice (PDF)", bn: "দরপত্র বিজ্ঞপ্তি (পিডিএফ)" },
    awardPdf: { en: "Contract award (PDF)", bn: "চুক্তি প্রদানের নথি (পিডিএফ)" },
    source: { en: "Source", bn: "সূত্র" },
    median: { en: "Middle value", bn: "মাঝের মান" },
    of: { en: "of", bn: "এর মধ্যে" },
    none: { en: "None", bn: "নেই" },
    all: { en: "All", bn: "সব" },
    reset: { en: "Reset", bn: "রিসেট" },
    search: { en: "Search", bn: "খুঁজুন" },
    close: { en: "Close", bn: "বন্ধ করুন" },
    more: { en: "Show more", bn: "আরও দেখুন" },
  },
};

/* -------------------------------------------------------------------- labels
   The CSVs carry machine tokens — SINGLE_BID, NOT_PUBLISHED_IN_NOTICE. A reader
   should never meet one. Every token that reaches the page has a written label
   here, in both editions, and the token itself stays in the data downloads so
   the two can be matched.

   The bid ranges in the competition labels are not assumed: they are read off
   master_tender_investigation.csv, where SINGLE_BID is exactly one bid,
   VERY_LOW is two, LOW is three, MODERATE is four or five, and HIGH is six or
   more. Where a label would have to guess, it says what is missing instead. */

export const LABELS = {
  competition: {
    SINGLE_BID: { en: "One bid only", bn: "কেবল একটি দর" },
    VERY_LOW: { en: "Two bids", bn: "দুটি দর" },
    LOW: { en: "Three bids", bn: "তিনটি দর" },
    MODERATE: { en: "Four or five bids", bn: "চার বা পাঁচটি দর" },
    HIGH: { en: "Six bids or more", bn: "ছয় বা তার বেশি দর" },
    UNKNOWN: { en: "Bid count not published", bn: "দরের সংখ্যা প্রকাশিত নয়" },
  },

  /* The six measures the authorities are set beside each other on. Long form
     for the table, where a column has a whole line to itself. */
  authority: {
    no_criteria: { en: "Notices publishing no eligibility bar at all", bn: "যেসব বিজ্ঞপ্তিতে যোগ্যতার কোনো শর্তই প্রকাশিত নয়" },
    one_resp: { en: "Tenders where one bid survived the responsiveness check", bn: "যেসব দরপত্রে গ্রহণযোগ্যতার যাচাই একটি দরই টিকেছে" },
    band: { en: "Notices carrying the fixed price corridor", bn: "যেসব বিজ্ঞপ্তিতে দামের নির্দিষ্ট বলয় আছে" },
    late: { en: "Contracts signed outside the legal window", bn: "আইনি সময়সীমার বাইরে স্বাক্ষরিত চুক্তি" },
    top1: { en: "The single biggest winner's share of that body's money", bn: "ওই সংস্থার অর্থের কত অংশ একক বৃহত্তম বিজয়ীর" },
    duty: { en: "Notices departing from a clause worded as a duty", bn: "বাধ্যতামূলক ভাষায় লেখা ধারা থেকে বিচ্যুত বিজ্ঞপ্তি" },
  },

  /* The same six over two short lines, which is all a column head has room
     for. Every one of them is a share, so no unit is repeated in the head. */
  authorityHead: {
    no_criteria: [{ en: "No published", bn: "প্রকাশিত শর্ত" }, { en: "bar at all", bn: "নেই" }],
    one_resp: [{ en: "One bid", bn: "একটি দর" }, { en: "survived", bn: "টিকেছে" }],
    band: [{ en: "Price", bn: "দামের" }, { en: "corridor", bn: "বলয়" }],
    late: [{ en: "Signed", bn: "দেরিতে" }, { en: "late", bn: "স্বাক্ষরিত" }],
    top1: [{ en: "Biggest winner's", bn: "বৃহত্তম বিজয়ীর" }, { en: "share", bn: "অংশ" }],
    duty: [{ en: "Departs from", bn: "বাধ্যতা থেকে" }, { en: "a duty clause", bn: "বিচ্যুত" }],
  },

  restriction: {
    NONE_IDENTIFIED: { en: "No restrictive pattern identified", bn: "সীমাবদ্ধকারী কোনো ধরন পাওয়া যায়নি" },
    POSSIBLE: { en: "Possible", bn: "সম্ভাব্য" },
    MODERATE: { en: "Moderate", bn: "মধ্যম" },
    STRONG: { en: "Strong", bn: "জোরালো" },
    NOT_PUBLISHED_IN_NOTICE: { en: "No criteria published in the notice", bn: "বিজ্ঞপ্তিতে কোনো শর্ত প্রকাশিত নয়" },
  },

  results: {
    DEVIATION: { en: "Deviates from the clause", bn: "ধারা থেকে বিচ্যুত" },
    COMPLIANT: { en: "Complies with the clause", bn: "ধারা অনুসারে" },
    NOT_TESTABLE_DATA_ABSENT: { en: "Cannot be tested — the document omits the field", bn: "পরীক্ষা করা যায় না — নথিতে ঘরটিই নেই" },
    CONDITION_PRESENT_NOT_SCOREABLE: { en: "Condition present, not scoreable", bn: "শর্ত আছে, কিন্তু মান দেওয়া যায় না" },
    CONDITION_PRESENT_DISCRETION_NOT_A_BREACH: { en: "Condition present, within the entity's discretion", bn: "শর্ত আছে, সংস্থার এখতিয়ারের মধ্যে" },
    MANDATED_TEST_UNVERIFIABLE: { en: "Required test cannot be verified from the notice", bn: "প্রয়োজনীয় পরীক্ষা বিজ্ঞপ্তি থেকে যাচাই করা যায় না" },
    NOT_APPLICABLE_BELOW_10_LAC_FLOOR: { en: "Not applicable — below the 10 lakh floor", bn: "প্রযোজ্য নয় — ১০ লাখের নিচে" },
    NOT_APPLICABLE_NOT_A_GOODS_PACKAGE: { en: "Not applicable — not a goods package", bn: "প্রযোজ্য নয় — এটি পণ্যের প্যাকেজ নয়" },
  },

  bars: {
    turnover: { en: "Annual turnover demanded, as a multiple of the contract", bn: "দাবি করা বার্ষিক লেনদেন, চুক্তিমূল্যের গুণিতকে" },
    financial: { en: "Liquid assets or credit demanded, as a multiple", bn: "দাবি করা তরল সম্পদ বা ঋণসীমা, গুণিতকে" },
    specific: { en: "Single similar contract demanded, as a multiple", bn: "দাবি করা একক সমমানের কাজ, গুণিতকে" },
    security: { en: "Tender security, as a share of the contract", bn: "দরপত্র জামানত, চুক্তিমূল্যের অনুপাতে" },
    years: { en: "Years of experience demanded", bn: "দাবি করা অভিজ্ঞতার বছর" },
    projects: { en: "Similar projects demanded", bn: "দাবি করা সমমানের কাজের সংখ্যা" },
  },

  /* The same six, short enough to sit beside a plot. */
  barsShort: {
    turnover: { en: "Annual turnover", bn: "বার্ষিক লেনদেন" },
    financial: { en: "Liquid assets or credit", bn: "তরল সম্পদ বা ঋণসীমা" },
    specific: { en: "One similar contract", bn: "একটি সমমানের কাজ" },
    security: { en: "Tender security", bn: "দরপত্র জামানত" },
    years: { en: "Years of experience", bn: "অভিজ্ঞতার বছর" },
    projects: { en: "Similar projects", bn: "সমমানের কাজের সংখ্যা" },
  },

  /* How much weight a clause carries. This is the most important label set in
     the publication: a recommended band and a "shall" are not the same thing,
     and a count that mixes them would be worthless. */
  force: {
    MANDATORY_SHALL: { en: "Mandatory — the clause says “shall”", bn: "বাধ্যতামূলক — ধারাটি বাধ্যকর ভাষায় লেখা" },
    MANDATORY_SHALL_NOT: { en: "Prohibited — the clause says “shall not”", bn: "নিষিদ্ধ — ধারাটি স্পষ্ট ভাষায় নিষেধ করেছে" },
    MANDATORY_SHALL_BUT_UNVERIFIABLE: { en: "Mandatory, but not verifiable from these documents", bn: "বাধ্যতামূলক, কিন্তু এই নথি থেকে যাচাই করা যায় না" },
    MANDATORY_SHALL_INTERNALLY_CONTRADICTORY: { en: "Mandatory, but the source text contradicts itself", bn: "বাধ্যতামূলক, কিন্তু মূল লেখাটি নিজের সঙ্গেই সংঘর্ষে" },
    PERMISSIVE_CAN: { en: "Permissive — the clause says “may”", bn: "ঐচ্ছিক — ধারাটি অনুমতি দেয়, বাধ্য করে না" },
    CEILING_IN_TDS_NOTE: { en: "A ceiling, set in a note to the data sheet", bn: "সর্বোচ্চ সীমা, ডেটা শিটের নোটে দেওয়া" },
    RECOMMENDED_BAND: { en: "A recommended band, not a hard limit", bn: "সুপারিশকৃত সীমা, কঠোর নয়" },
    GUIDANCE_DEFAULT_IS_NOT_REQUIRED: { en: "Guidance — the default is that it is not required", bn: "নির্দেশনা — সাধারণভাবে এটি আবশ্যক নয়" },
    BENCHMARK_ONLY: { en: "A benchmark only — no binding wording for it in these documents", bn: "কেবল একটি মানদণ্ড — এই নথিগুলোতে এর বাধ্যকর ভাষা নেই" },
    NO_RULE_TEXT_AVAILABLE: { en: "No rule text for this exists in the supplied documents", bn: "সরবরাহকৃত নথিতে এই নিয়মের কোনো লেখা নেই" },
  },

  certainty: {
    VERBATIM_MANDATORY_IN_CORPUS: { en: "Quoted word for word from a mandatory clause in the supplied documents", bn: "সরবরাহকৃত নথির বাধ্যতামূলক ধারা থেকে অক্ষরে অক্ষরে উদ্ধৃত" },
    VERBATIM_PERMISSIVE_IN_CORPUS: { en: "Quoted word for word from a permissive clause", bn: "ঐচ্ছিক ধারা থেকে অক্ষরে অক্ষরে উদ্ধৃত" },
    TDS_NOTE_IN_CORPUS: { en: "From a note to the tender data sheet in the supplied documents", bn: "সরবরাহকৃত নথির দরপত্র ডেটা শিটের নোট থেকে" },
    BENCHMARK_ONLY_NON_BINDING: { en: "A benchmark, not binding", bn: "একটি মানদণ্ড, বাধ্যকর নয়" },
    NOT_IN_CORPUS: { en: "Not present in the supplied documents at all", bn: "সরবরাহকৃত নথিতে একেবারেই নেই" },
  },

  severity: {
    HIGH: { en: "High", bn: "উচ্চ" },
    MEDIUM: { en: "Medium", bn: "মধ্যম" },
    HIGH_AS_A_TRANSPARENCY_FINDING: { en: "High as a transparency finding, not as a breach", bn: "স্বচ্ছতার প্রশ্ন হিসেবে উচ্চ, লঙ্ঘন হিসেবে নয়" },
    NOT_A_BREACH_DISCRETION: { en: "Not a breach — the clause leaves it to the entity", bn: "লঙ্ঘন নয় — ধারাটি সংস্থার ওপর ছেড়ে দিয়েছে" },
    NOT_TESTABLE: { en: "Cannot be tested from these documents", bn: "এই নথি থেকে পরীক্ষা করা যায় না" },
    NOT_SCOREABLE_BENCHMARK_ONLY: { en: "Not scored — benchmark only", bn: "মান দেওয়া হয়নি — কেবল মানদণ্ড" },
    NOT_SCOREABLE_NO_BINDING_RULE_IN_CORPUS: { en: "Not scored — no binding rule in the supplied documents", bn: "মান দেওয়া হয়নি — সরবরাহকৃত নথিতে বাধ্যকর নিয়ম নেই" },
    NOT_SCOREABLE_NO_BANGLADESHI_RULE_IN_CORPUS: { en: "Not scored — no Bangladeshi rule on this point in the supplied documents", bn: "মান দেওয়া হয়নি — এই বিষয়ে সরবরাহকৃত নথিতে বাংলাদেশি নিয়ম নেই" },
    NOT_SCOREABLE_NO_RULE_IN_CORPUS: { en: "Not scored — no rule in the supplied documents", bn: "মান দেওয়া হয়নি — সরবরাহকৃত নথিতে নিয়ম নেই" },
  },

  /* Which standard document the clause was found in, relative to the tender it
     is being applied to. This is the caveat that governs every deviation count
     in the publication, so it is written out in full rather than abbreviated. */
  scope: {
    EXACT_STD_MATCH_GOODS_FRAMEWORK_AGREEMENT: { en: "Exact match — the same standard document, goods framework agreement", bn: "হুবহু মিল — একই আদর্শ দস্তাবেজ, পণ্যের কাঠামো চুক্তি" },
    SAME_CATEGORY_DIFFERENT_STD_GOODS_NOT_FRAMEWORK: { en: "Same category, a different standard document — goods, not a framework", bn: "একই শ্রেণি, ভিন্ন আদর্শ দস্তাবেজ — পণ্য, কাঠামো চুক্তি নয়" },
    DIFFERENT_CATEGORY_STD_WORKS: { en: "Different category — the works document, applied to this tender", bn: "ভিন্ন শ্রেণি — পূর্তকাজের দস্তাবেজ, এই দরপত্রে প্রয়োগ করা" },
    DIFFERENT_CATEGORY_STD_SERVICES: { en: "Different category — the services document", bn: "ভিন্ন শ্রেণি — সেবার দস্তাবেজ" },
    DIFFERENT_CATEGORY_STD_PHYSICAL_SERVICES: { en: "Different category — the physical services document", bn: "ভিন্ন শ্রেণি — ভৌত সেবার দস্তাবেজ" },
    SCOPE_UNKNOWN_NATURE_NOT_PUBLISHED: { en: "Unknown — the notice does not publish what kind of procurement this is", bn: "অজানা — বিজ্ঞপ্তিতে ক্রয়ের ধরন প্রকাশিত নয়" },
  },

  /* The signals recorded against a tender in the flags column. Each one is a
     description of something the notice says, never a verdict on it. "Reputed
     qualifier" means the word reputed appears in a criterion, which cannot be
     measured as written; it does not mean the tender was steered at anyone. */
  flags: {
    repeated_rule_present: { en: "The same eligibility wording appears in other tenders", bn: "একই যোগ্যতার ভাষা অন্য দরপত্রেও আছে" },
    licence_document_stack: { en: "Several licences and certificates required together", bn: "একসঙ্গে কয়েকটি লাইসেন্স ও সনদ চাওয়া হয়েছে" },
    govt_client_experience_required: { en: "Past work for a government body required", bn: "সরকারি সংস্থার জন্য পূর্ব কাজের অভিজ্ঞতা চাওয়া হয়েছে" },
    incumbent_advantage_risk: { en: "Wording that favours a firm already doing this work", bn: "যে ভাষা ইতিমধ্যে এই কাজ করা প্রতিষ্ঠানকে সুবিধা দেয়" },
    reputed_qualifier: { en: "Uses the word “reputed”, which cannot be measured", bn: "“সুনামধন্য” শব্দ ব্যবহৃত, যা মাপা যায় না" },
    electrical_licence_requirement: { en: "A specific electrical licence required", bn: "নির্দিষ্ট বৈদ্যুতিক লাইসেন্স চাওয়া হয়েছে" },
    narrow_specification: { en: "A specification narrow enough to fit few products", bn: "এমন সংকীর্ণ বিবরণ যা অল্প কিছু পণ্যের সঙ্গে মেলে" },
    manufacturer_requirement: { en: "A manufacturer’s authorisation required", bn: "উৎপাদকের অনুমোদনপত্র চাওয়া হয়েছে" },
    pwd_authentication_requirement: { en: "PWD authentication of rates required", bn: "দরের পিডব্লিউডি সত্যায়ন চাওয়া হয়েছে" },
    agency_enlistment_requirement: { en: "Enlistment with the authority required", bn: "সংস্থায় তালিকাভুক্তি চাওয়া হয়েছে" },
    mass_disqualification_flag: { en: "Most of the bids received were ruled out", bn: "প্রাপ্ত দরপত্রের অধিকাংশ বাদ পড়েছে" },
    false_document_forfeiture_clause: { en: "Security forfeited for a false document", bn: "মিথ্যা নথির জন্য জামানত বাজেয়াপ্ত" },
    dealer_requirement: { en: "An authorised dealership required", bn: "অনুমোদিত ডিলারশিপ চাওয়া হয়েছে" },
    bank_document_window_requirement: { en: "Bank documents dated inside a narrow window", bn: "সংকীর্ণ সময়সীমার মধ্যে তারিখ দেওয়া ব্যাংক নথি" },
    price_band_nonresponsive_clause: { en: "Bids outside a price band are ruled non-responsive", bn: "দামের নির্দিষ্ট সীমার বাইরের দরপত্র অগ্রহণযোগ্য" },
    brand_requirement: { en: "A brand named in the specification", bn: "বিবরণে ব্র্যান্ডের নাম উল্লেখ" },
    model_specific_requirement: { en: "A specific model named", bn: "নির্দিষ্ট মডেলের নাম উল্লেখ" },
    proprietary_specification: { en: "A specification tied to one product", bn: "একটি পণ্যের সঙ্গে বাঁধা বিবরণ" },
    blanket_rejection_clause: { en: "A clause allowing rejection without a stated reason", bn: "কারণ না জানিয়ে বাতিল করার সুযোগ রাখা ধারা" },
    brand_without_or_equivalent: { en: "A brand named without “or equivalent”", bn: "“বা সমতুল্য” ছাড়াই ব্র্যান্ডের নাম" },
    many_bids_one_responsive_flag: { en: "Many bids received, one ruled responsive", bn: "অনেক দরপত্র জমা, একটি গ্রহণযোগ্য" },
    local_presence_requirement: { en: "An office or presence in the district required", bn: "জেলায় কার্যালয় বা উপস্থিতি চাওয়া হয়েছে" },
    egp_id_on_certificate_required: { en: "The e-GP ID must appear on the certificate", bn: "সনদে e-GP আইডি থাকতে হবে" },
    possible_specification_targeting: { en: "A specification that may fit only one supplier", bn: "এমন বিবরণ যা হয়তো একজন সরবরাহকারীর সঙ্গেই মেলে" },
    or_equivalent_present: { en: "“Or equivalent” is present — the specification is open", bn: "“বা সমতুল্য” আছে — বিবরণ খোলা" },
    iso_certification_requirement: { en: "An ISO certificate required", bn: "আইএসও সনদ চাওয়া হয়েছে" },
  },

  /* A reading order for a newsroom, not a score for a court. HIGH means the
     tender has several of the signals at once and is worth opening first. */
  priority: {
    HIGH: { en: "High — worth opening first", bn: "উচ্চ — আগে দেখা উচিত" },
    MEDIUM: { en: "Medium", bn: "মধ্যম" },
    LOW: { en: "Low", bn: "নিম্ন" },
  },

  preselection: {
    NO_CLEAR_PATTERN: { en: "No clear pattern", bn: "স্পষ্ট কোনো ধরন নেই" },
    POSSIBLE: { en: "Possible — worth checking", bn: "সম্ভাব্য — যাচাই করা উচিত" },
    STRONG_INVESTIGATIVE_LEAD: { en: "A strong lead for a reporter, not a finding", bn: "সাংবাদিকের জন্য জোরালো সূত্র, সিদ্ধান্ত নয়" },
  },

  repeat: {
    NO_REPEAT_PATTERN: { en: "The winner has no repeat pattern here", bn: "বিজয়ীর পুনরাবৃত্তির ধরন নেই" },
    REPEATED_WINNER_WATCH: { en: "The winner has won more than once", bn: "বিজয়ী একাধিকবার জিতেছে" },
    REPEATED_WINNER_PATTERN: { en: "The winner has won repeatedly", bn: "বিজয়ী বারবার জিতেছে" },
    REPEATED_WINNER_PATTERN_MULTI_AGENCY: { en: "The winner has won repeatedly, at more than one authority", bn: "বিজয়ী একাধিক সংস্থায় বারবার জিতেছে" },
  },
  /* Not a judgement on the price. The only benchmark these documents offer is
     the tender security each authority itself asks for, because the official
     cost estimate is absent from every document in the set. */
  price: {
    NO_FLAG: { en: "Nothing unusual against this authority’s own norm", bn: "এই সংস্থার নিজস্ব রীতির তুলনায় অস্বাভাবিক কিছু নেই" },
    CONTRACT_VALUE_LOW_VS_OWN_SECURITY_NORM: { en: "Contract value low against the security this authority usually asks", bn: "এই সংস্থা সাধারণত যে জামানত চায়, তার তুলনায় চুক্তিমূল্য কম" },
    CONTRACT_VALUE_HIGH_VS_OWN_SECURITY_NORM: { en: "Contract value high against the security this authority usually asks", bn: "এই সংস্থা সাধারণত যে জামানত চায়, তার তুলনায় চুক্তিমূল্য বেশি" },
  },

  retender: {
    no: { en: "Not re-tendered", bn: "পুনঃদরপত্র হয়নি" },
    RETENDER: { en: "Re-tendered", bn: "পুনঃদরপত্র" },
    TO_BE_RETENDERED: { en: "To be re-tendered", bn: "পুনঃদরপত্র হবে" },
  },

  /* How the numbers on a tender were read. The middle value is the important
     one: where a notice carries no text at all, the confidence is high that
     nothing was published — which is a different claim from reading a figure. */
  extraction: {
    HIGH: { en: "High", bn: "উচ্চ" },
    HIGH_FOR_ABSENCE_NO_TEXT_TO_PARSE: { en: "High for the absence — there was no text to read", bn: "অনুপস্থিতির ব্যাপারে উচ্চ — পড়ার মতো কোনো লেখা ছিল না" },
    MEDIUM_FLAGS_ONLY_NO_NUMERIC_THRESHOLD_FOUND: { en: "Medium — the wording was found, but no number to read", bn: "মধ্যম — ভাষা পাওয়া গেছে, কিন্তু পড়ার মতো সংখ্যা নেই" },
  },

  /* The part of a document an excerpt was taken from. */
  sections: {
    eligibility: { en: "Eligibility criteria", bn: "যোগ্যতার শর্ত" },
    turnover: { en: "Turnover requirement", bn: "টার্নওভারের শর্ত" },
    liquid_assets: { en: "Liquid assets requirement", bn: "নগদ সম্পদের শর্ত" },
    general_experience: { en: "General experience requirement", bn: "সাধারণ অভিজ্ঞতার শর্ত" },
    specific_experience: { en: "Similar-work experience requirement", bn: "সমজাতীয় কাজের অভিজ্ঞতার শর্ত" },
    competition: { en: "Bids and evaluation", bn: "দরপত্র ও মূল্যায়ন" },
    price_band: { en: "Price band clause", bn: "দামের সীমার ধারা" },
    enlistment: { en: "Enlistment requirement", bn: "তালিকাভুক্তির শর্ত" },
    repeated_clause: { en: "Wording repeated in other tenders", bn: "অন্য দরপত্রে পুনরাবৃত্ত ভাষা" },
    amendment: { en: "Amendments", bn: "সংশোধনী" },
  },

  yesno: {
    yes: { en: "Yes", bn: "হ্যাঁ" },
    no: { en: "No", bn: "না" },
    "": { en: "No award record in this set", bn: "এই সেটে চুক্তির নথি নেই" },
  },

  /* --------------------------------------------------------------------------
     The four portal columns whose vocabulary is not closed. Each map covers the
     head of its distribution — the values the portal's own dropdowns produce —
     and stops there. The tail is a line of the page that came away with the
     value when the notice was read: an evaluation type followed by the phasing
     table's column headings, a status followed by a date stamp or a file number.
     Those are printed as they were filed rather than tidied, because tidying
     them would mean deciding what the portal meant, and nothing here decides
     that on a document's behalf. */

  /* procurement_nature: 6 values, of which 5 are the portal's own. */
  nature: {
    Works: { en: "Works", bn: "পূর্তকাজ" },
    Goods: { en: "Goods", bn: "পণ্য" },
    Services: { en: "Services", bn: "সেবা" },
    "Physical Services": { en: "Physical services", bn: "ভৌত সেবা" },
    "Goods (Framework Agreement)": { en: "Goods, under a framework agreement", bn: "পণ্য, কাঠামো চুক্তির আওতায়" },
  },

  /* evaluation_type: 2 real values; the other 4 carry a phasing table with them. */
  evaluation: {
    "Lot wise": { en: "Lot by lot", bn: "লট ধরে ধরে" },
    "Package wise": { en: "Package by package", bn: "প্যাকেজ ধরে ধরে" },
  },

  /* tender_status: 92 distinct values, 77 of them occurring once, almost all of
     those a stamp that came away with the status. The eight the portal itself
     sets are here. */
  status: {
    "Contract Awarded": { en: "Contract awarded", bn: "চুক্তি হয়েছে" },
    "Re-Tendered": { en: "Re-tendered", bn: "আবার দরপত্র ডাকা হয়েছে" },
    "To be Re-Tendered": { en: "To be re-tendered", bn: "আবার দরপত্র ডাকা হবে" },
    "Being processed": { en: "Being processed", bn: "প্রক্রিয়াধীন" },
    Rejected: { en: "Rejected", bn: "বাতিল ঘোষিত" },
    Cancelled: { en: "Cancelled", bn: "প্রত্যাহৃত" },
    Live: { en: "Open for bids", bn: "দর জমা চলছে" },
  },

  /* How the eligibility criteria reached the reader. The first value is the
     finding this investigation turns on: the notice names no threshold and
     points at a document that has to be bought. */
  published: {
    AS_PER_TENDER_DATA_SHEET_ONLY: {
      en: "Only as a cross-reference to the Tender Data Sheet, inside the paid document",
      bn: "কেবল টাকা দিয়ে কেনা দস্তাবেজের ভেতরের <code>Tender Data Sheet</code>-এর উল্লেখ হিসেবে",
    },
    SUBSTANTIVE_TEXT_PUBLISHED: {
      en: "The criteria themselves are printed in the notice",
      bn: "শর্তগুলো বিজ্ঞপ্তিতেই ছাপা আছে",
    },
    PORTAL_ACCESS_DENIED: {
      en: "The portal would not release this section of the notice",
      bn: "পোর্টাল বিজ্ঞপ্তির এই অংশটি দেয়নি",
    },
    NO_ELIGIBILITY_TEXT_PRINTED_IN_NOTICE: {
      en: "The notice prints no eligibility text at all",
      bn: "বিজ্ঞপ্তিতে যোগ্যতার কোনো লেখাই নেই",
    },
  },

  /* Which of the eight things a record shows. "none" is not a gap: it is the
     finding that this tender shows none of them, and 397 records say it. */
  stages: {
    none: { en: "None of them", bn: "একটিও নয়" },
    few_bids_submitted: { en: "Few bids submitted", bn: "দর জমা পড়েছে অল্প" },
    single_responsive_bidder: { en: "One responsive bidder", bn: "গ্রহণযোগ্য দরদাতা একজন" },
    bidders_ruled_non_responsive: { en: "Bidders ruled non-responsive", bn: "দরদাতা অগ্রহণযোগ্য ঘোষিত" },
    documents_sold_but_bids_not_submitted: { en: "Documents sold, bids not submitted", bn: "দস্তাবেজ বিক্রি হয়েছে, দর জমা পড়েনি" },
    restrictive_or_tailored_requirement: { en: "A requirement that reads restrictive", bn: "সীমাবদ্ধ মনে হওয়া শর্ত" },
    winner_is_a_repeat_winner: { en: "The winner wins here repeatedly", bn: "বিজয়ী এখানে বারবার জেতে" },
    winner_repeatedly_wins_low_competition_tenders: {
      en: "The winner repeatedly wins where competition is thin",
      bn: "প্রতিযোগিতা পাতলা যেখানে, বিজয়ী সেখানেই বারবার জেতে",
    },
  },

  /* The office an award notice names an owner in, and the country it gives for
     them. Four offices and one country across the 49 owner records in these
     files, all of them from the portal's own dropdown — a closed list, so it is
     translated. The person's own name never is. */
  role: {
    Proprietor: { en: "Proprietor", bn: "স্বত্বাধিকারী" },
    "Managing Director": { en: "Managing Director", bn: "ব্যবস্থাপনা পরিচালক" },
    "Managing Partner": { en: "Managing Partner", bn: "ব্যবস্থাপনা অংশীদার" },
    Chairman: { en: "Chairman", bn: "চেয়ারম্যান" },
  },

  /* Two spellings of the one country these notices name. */
  country: {
    Bangladesh: { en: "Bangladesh", bn: "বাংলাদেশ" },
    BANGLADESH: { en: "Bangladesh", bn: "বাংলাদেশ" },
  },
};

/* --------------------------------------------------------------- rule titles
   Each of the eighteen tests, in a sentence a reader can hold. The title says
   what the test looks for, not what it proves: "the notice does not print who
   owns the winning firm" is a description of a document, and it is the reader
   who decides what that is worth. The machine code stays beside it so the row
   can be matched to rule_deviations.csv. */

export const RULE_TITLES = {
  R01: { en: "The award notice does not print who owns the winning firm", bn: "চুক্তির বিজ্ঞপ্তিতে বিজয়ী প্রতিষ্ঠানের মালিক কে, তা ছাপা নেই" },
  R02: { en: "The contract was signed outside the time the clause allows", bn: "ধারায় দেওয়া সময়ের বাইরে চুক্তি স্বাক্ষরিত হয়েছে" },
  R03: { en: "An open tender required the bidder to already be on the authority's own list", bn: "খোলা দরপত্রে দরদাতাকে আগেই সংস্থার নিজের তালিকায় থাকতে বলা হয়েছে" },
  R04: { en: "The tender is marked awarded, but no award record is published", bn: "দরপত্র চুক্তিপ্রাপ্ত দেখানো, কিন্তু চুক্তির কোনো নথি প্রকাশিত নয়" },
  R05: { en: "A price outside a fixed band is declared non-responsive", bn: "নির্দিষ্ট সীমার বাইরের দর সরাসরি অগ্রহণযোগ্য ঘোষণা করা হয়েছে" },
  R06: { en: "The single-contract experience bar sits above the recommended band", bn: "একক কাজের অভিজ্ঞতার শর্ত সুপারিশকৃত সীমার উপরে" },
  R07: { en: "The financial capacity bar sits above the recommended band", bn: "আর্থিক সক্ষমতার শর্ত সুপারিশকৃত সীমার উপরে" },
  R08: { en: "The tender security is above the ceiling in the data sheet note", bn: "দরপত্র জামানত ডেটা শিটের নোটে দেওয়া সর্বোচ্চ সীমার উপরে" },
  R09: { en: "A goods tender required a manufacturer's authorisation letter", bn: "পণ্যের দরপত্রে প্রস্তুতকারকের অনুমোদনপত্র চাওয়া হয়েছে" },
  R10: { en: "Competition was ineffective and the tender went ahead", bn: "প্রতিযোগিতা কার্যকর হয়নি, তবু দরপত্র এগিয়েছে" },
  R11: { en: "With one responsive bid, the price test cannot be verified from the documents", bn: "একটিই গ্রহণযোগ্য দর থাকলে দরের পরীক্ষা নথি থেকে যাচাই করা যায় না" },
  R12: { en: "Whether the performance security arrived on time cannot be checked", bn: "কার্যসম্পাদন জামানত সময়ে এসেছে কি না, যাচাই করা যায় না" },
  R13: { en: "An amendment was issued with no visible extension of the deadline", bn: "সংশোধনী জারি হয়েছে, সময়সীমা বাড়ানোর কোনো চিহ্ন নেই" },
  R14: { en: "The winning price cannot be compared with the official estimate", bn: "বিজয়ী দর সরকারি প্রাক্কলনের সঙ্গে মেলানো যায় না" },
  R15: { en: "A brand name is specified without “or equivalent”", bn: "ব্র্যান্ডের নাম দেওয়া হয়েছে, “অথবা সমতুল্য” লেখা নেই" },
  R16: { en: "Only experience with government clients is allowed to count", bn: "কেবল সরকারি কাজের অভিজ্ঞতাই গণ্য করা হয়েছে" },
  R17: { en: "The notice states no qualification criteria at all", bn: "বিজ্ঞপ্তিতে যোগ্যতার কোনো শর্তই লেখা নেই" },
  R18: { en: "A large package was tendered nationally only", bn: "বড় প্যাকেজ কেবল জাতীয়ভাবে দরপত্র আহ্বান করা হয়েছে" },
};

/* The same eighteen, in three or four words, for the axis of a chart where the
   full sentence above would not fit. Every code has one, including the nine that
   recorded nothing, so a rebuild that moves a count can never fall back to a
   machine string and leak English into the Bangla edition. */
export const RULE_SHORT = {
  R01: { en: "Owner of the winning firm not printed", bn: "বিজয়ী প্রতিষ্ঠানের মালিকের নাম ছাপা নেই" },
  R02: { en: "Signed outside the time allowed", bn: "অনুমোদিত সময়ের বাইরে স্বাক্ষর" },
  R03: { en: "Enlistment demanded in an open tender", bn: "খোলা দরপত্রে তালিকাভুক্তির শর্ত" },
  R04: { en: "Marked awarded, no award record", bn: "চুক্তিপ্রাপ্ত লেখা, চুক্তির নথি নেই" },
  R05: { en: "Fixed price band decides responsiveness", bn: "নির্দিষ্ট দরসীমা দিয়ে গ্রহণযোগ্যতা" },
  R06: { en: "Experience bar above the band", bn: "অভিজ্ঞতার শর্ত সীমার উপরে" },
  R07: { en: "Financial bar above the band", bn: "আর্থিক শর্ত সীমার উপরে" },
  R08: { en: "Security above the 3% ceiling", bn: "জামানত ৩ শতাংশ সীমার উপরে" },
  R09: { en: "Manufacturer’s letter on goods", bn: "পণ্যে প্রস্তুতকারকের অনুমোদনপত্র" },
  R10: { en: "Competition ineffective, tender proceeded", bn: "প্রতিযোগিতা কার্যকর নয়, দরপত্র এগিয়েছে" },
  R11: { en: "Price test unverifiable on one bid", bn: "একটি দরে দরের পরীক্ষা অযাচাইযোগ্য" },
  R12: { en: "Performance security timing unchecked", bn: "কার্যসম্পাদন জামানতের সময় অযাচাই" },
  R13: { en: "Amendment with no visible extension", bn: "সংশোধনী, সময় বাড়ানোর চিহ্ন নেই" },
  R14: { en: "No official estimate to compare", bn: "মেলানোর জন্য সরকারি প্রাক্কলন নেই" },
  R15: { en: "Brand named without “or equivalent”", bn: "ব্র্যান্ডের নাম, “অথবা সমতুল্য” নেই" },
  R16: { en: "Only government experience counted", bn: "কেবল সরকারি অভিজ্ঞতা গণ্য" },
  R17: { en: "No qualification criteria stated", bn: "যোগ্যতার কোনো শর্ত লেখা নেই" },
  R18: { en: "Large package tendered nationally only", bn: "বড় প্যাকেজ কেবল জাতীয়ভাবে" },
};

/* --------------------------------------------------- the rules tab, in Bangla
   Three fields of every rule are written by the analysis rather than by this
   file: the clause it cites, what the test compared, and the limit on the
   finding. They live in site/data/rules.json because each one is traceable to a
   page of a PDF, and the English there is the record — it is not edited here.

   This map carries only the Bangla, keyed by rule code. Bangla only, not an
   {en, bn} pair, and deliberately so: if the English were duplicated here it
   could drift away from the file the figures are audited against, and a reader
   comparing the two editions would have no way to tell which one moved.

   Locators keep the script they are typed in — ITT numbers, TDS, PPR rule
   numbers, column names, the JICA sections — and are wrapped in <code> for the
   same reason they are in a citation line: a reader types them into a search
   box rather than reads them aloud. Everything around them is Bangla. Figures
   are in Bengali numerals, as they are everywhere else on the site.

   MISSING_BN_IS_VISIBLE: a code with no entry falls back to the English in
   rules.json rather than to nothing, so a rule added to the catalogue without
   Bangla shows up in the Latin-script sweep instead of vanishing. */
export const RULE_BN = {
  R01: {
    clause: "<code>ITT 5.14</code> ও <code>ITT 68.1</code>, সঙ্গে <code>Format e-PG3A-C Note 1</code>",
    test: "চুক্তির বিজ্ঞপ্তি আছে এবং চুক্তিমূল্য ১০,০০,০০০ টাকার বেশি, কিন্তু বিজ্ঞপ্তিতে মালিকানার কোনো তালিকা ছাপা নেই।",
    limit: "১০ লাখ টাকার মেঝে আর প্রকাশের দায়, দুটিই কেবল <code>e-PG3A</code>-র — যার তারিখ ডিসেম্বর ২০২৫। এই যাচাইয়ে সময় নিয়ে একটি নির্ণায়ক পরীক্ষা চালানো হয়েছে: যে ৬০টি চুক্তির বিজ্ঞপ্তিতে মালিকানার তালিকা আছে, সেগুলোর সবই সই হয়েছে ২০২৫ (১৩টি) বা ২০২৬ সালে (৪৭টি) — একটিও তার আগে নয়। অর্থাৎ ঘরটি কাজে আসতে শুরু করেছে ২০২৫ সালেই, আর অপ্রকাশিত ৫২২টি চুক্তির ৪৫৯টি সই হয়েছে ২০১৫–২০২৪ সালে, এই সংকলনের কোনো দস্তাবেজ তা দাবি করার আগেই। যে সংখ্যাটি রক্ষা করা যায় তা ১০২-এর মধ্যে ৬৩: ২০২৫–২০২৬ সালে, যখন প্রকাশ করা প্রমাণিতভাবেই সম্ভব, সীমার উপরের ৬৩টি চুক্তিতে এখনো কোনো তালিকা ছাপা হয়নি, বিপরীতে ৩৯টিতে হয়েছে। ৫২২ সংখ্যাটি কেবল কাঁচা গণনা হিসেবে ব্যবহার করুন, আর সর্বদা এই বিভাজনটি সঙ্গে রাখুন।",
  },
  R02: {
    clause: "<code>ITT 67.2</code>, সঙ্গে <code>ITT 67.2</code>-এর <code>TDS</code> ভুক্তি, যা <code>PPR 2025</code>-এর <code>Rule 123(9)</code> উদ্ধৃত করে",
    test: "নোটিশ থেকে সই পর্যন্ত দিনসংখ্যা চুক্তিমূল্যের জন্য বাঁধা সীমা ছাড়িয়ে গেছে।",
    limit: "দুটি জায়গায় বিকল্প বসাতে হয়েছে। নিয়মটি চলে <em>প্রাক্কলিত</em> ব্যয়ের উপর, যা এই সংকলনের কোথাও প্রকাশিত নয়, তাই বদলে চুক্তিমূল্য ধরা হয়েছে। আর <code>PPR 2025</code> ২০২৫-এর আগে সই হওয়া কোনো চুক্তি নিয়ন্ত্রণ করতে পারে না: ৩৮৩টি বিচ্যুতির মাত্র ৫৬টি সই হয়েছে ২০২৫–২০২৬ সালে, ৩২৭টি হয়েছে ২০১৫–২০২৪ সালে। ওই ৩২৭টি সারিতে চিহ্ন দেওয়া আছে যে উদ্ধৃত ধারার তারিখ ঘটনার পরে, এবং সেগুলোকে <code>Rule 123(9)</code> ভাঙা হিসেবে গোনা চলবে না। তবু আচরণটি সত্য, আর তা ধারার উপর নির্ভর করে না: সীমা ছাড়ানোর মধ্যক ১৩ দিন, গড় ২০.৫ দিন, সবচেয়ে বেশি ২৭৮ দিন। দুটি দৃষ্টান্ত: দরপত্র ১৯৯৩৬৮, নোটিশের ২৯২ দিন পর সই; এবং ঠিক ১৫০ দিনে সই হওয়া <em>তেরোটি</em> চুক্তির একটি গুচ্ছ — ২৩৬২৪১, ২৩৬২৪২, ২৪৮৬১৬, ২৪৮৬১৭, ২৪৮৬১৮, ২৪৮৬১৯, ২৪৮৬২১, ২৪৮৬২২, ২৪৮৬২৩, ২৪৮৬২৫, ২৪৮৬৩০, ২৪৮৬৩১, ২৪৮৬৩৩ — প্রতিটি রাজউকের, প্রতিটি মেসার্স স্যানি কনস্ট্রাকশনকে, আর প্রতিটি একই দিনে, ২৫ ডিসেম্বর ২০১৯-এ সই। (এই টীকার আগের একটি খসড়ায় লেখা ছিল “১৫০ দিনে পাঁচটি চুক্তি”; যাচাইয়ের সময় আবার গুনে ১৩ পাওয়া গেছে।) আচরণটিকে লঙ্ঘনের গণনায় বদলাতে চাইলে ২০০৮ সালের বিধিমালার চুক্তি-স্বাক্ষরের নিয়মটি লাগবে, যা এই সংকলনে নেই।",
  },
  R03: {
    clause: "<code>ITT 18.2</code>, সঙ্গে <code>ITT 5.1</code> ও <code>ITT 21.1(a)</code>",
    test: "পদ্ধতি খোলা দরপত্র, তবু বিজ্ঞপ্তি ক্রয়কারী সংস্থার তালিকায় নাম থাকার শর্ত দিচ্ছে।",
    limit: "ব্যবহারের আগে প্রতিটি সারির উদ্ধৃতি পড়ুন। ভাষাটি সাধারণত এই ধরনের — রাজউক বা অন্য সরকারি/আধা-সরকারি/স্বায়ত্তশাসিত সংস্থার তালিকাভুক্ত ঠিকাদার, কিংবা সুপরিচিত প্রকৃত প্রতিষ্ঠানের জন্য খোলা — এবং ৮৮টির ৮২টিতেই একাধিক সরকারি সংস্থার যেকোনোটিতে তালিকাভুক্তি মেনে নেওয়া হয়। ফলে দরজাটি কেবল সেই প্রতিষ্ঠানকেই আটকায় যারা সরকারি খাতের কোথাওই কখনো তালিকাভুক্ত হয়নি। মোটামুটি ৪টিতে একটিমাত্র সংস্থার নাম আছে, আর সেটিই সত্যিকারের বন্ধ রূপ: ৪২৪১৬৮-এ কক্সবাজার উন্নয়ন কর্তৃপক্ষের হালনাগাদ তালিকাভুক্তি লাগে, ১১২৮৫৭২-এ ১.৩ শ্রেণিতে কেজিডিসিএলের তালিকাভুক্তি। আরও একটি কথা: ৮৮টির ৫৮টিই পূর্তকাজের প্যাকেজ, আর <code>e-PG3A</code> পণ্যের দস্তাবেজ — অর্থাৎ ধারাটি এক শ্রেণি থেকে আরেক শ্রেণিতে পড়া হচ্ছে।",
  },
  R04: {
    clause: "<code>ITT 61.1</code> ও <code>ITT 68.1</code>",
    test: "দরপত্রের অবস্থা বলছে চুক্তি হয়েছে, কিন্তু পোর্টালে চুক্তির কোনো বিজ্ঞপ্তিই নেই।",
    limit: "একটি নথি না থাকা মানে সেটি প্রকাশিত হয়নি — তা প্রমাণ হয় না। বিজ্ঞপ্তিটি প্রকাশ হয়ে পরে তুলে নেওয়া হয়ে থাকতে পারে, কিংবা ২৮/৩০ দিনের প্রদর্শনকাল সংকলনটি ধরার আগেই ফুরিয়ে যেতে পারে। চারটি উচ্চ-গুরুত্বের নিয়মের মধ্যে এটির অনুমানই সবচেয়ে দুর্বল।",
  },
  R05: {
    clause: "<code>ITT 50.3</code> ও <code>ITT 50.6</code>",
    test: "বিজ্ঞপ্তি নিজের একটি নির্দিষ্ট শতকরা সীমা (সাধারণত প্রাক্কলনের ১০ শতাংশ উপরে বা নিচে) বসিয়ে তার বাইরে গেলেই দর স্বয়ংক্রিয়ভাবে অগ্রহণযোগ্য বলছে।",
    limit: "আদর্শ দস্তাবেজ নিচের সীমা <em>হিসাব করে</em> বের করে — জমা পড়া দরগুলোর প্রকৃত বিস্তার থেকে — আর ২০ শতাংশের সংখ্যাটি বসায় কেবল তখনই, যখন গ্রহণযোগ্য দর একটিমাত্র। দুদিকেই সমান ১০ শতাংশ আদর্শ দস্তাবেজের সংখ্যার অর্ধেক, এবং তা ওই পরিসংখ্যানভিত্তিক পরীক্ষাটিকেই সরিয়ে দেয়। তবে <code>ITT 50.3</code>–<code>50.6</code> ডিসেম্বর ২০২৫-এর লেখা; বিজ্ঞপ্তিগুলো ২০১৯–২০২৫ সালের, তাই যে ব্যবস্থাটি থেকে তারা সরে এসেছে তা তখন হয়তো ছিলই না। এটিকে চলতি আদর্শ থেকে সরে আসা হিসেবে উদ্ধৃত করুন, ২০১৯ সালের লঙ্ঘন হিসেবে নয়।",
  },
  R06: {
    clause: "<code>ITT 13.1(b)</code>-র <code>TDS</code> টীকা",
    test: "প্রকাশিত পূর্ববর্তী চুক্তির সর্বনিম্ন মূল্য চুক্তিমূল্যের ৮০ শতাংশ ছাড়িয়ে গেছে।",
    limit: "এটি সুপারিশ, দায় নয় — ছাড়িয়ে গেলে তা বেআইনি হয় না। আর সীমাটি <em>প্রাক্কলিত</em> ব্যয়ের একটি অংশ, যা অনুপস্থিত, তাই তার জায়গায় চুক্তিমূল্য বসেছে।",
  },
  R07: {
    clause: "<code>ITT 14.1(b)</code>-র <code>TDS</code> টীকা",
    test: "প্রকাশিত সর্বনিম্ন তরল সম্পদ বা চলতি মূলধনের শর্ত চুক্তিমূল্যের ১০০ শতাংশ ছাড়িয়ে গেছে।",
    limit: "R06-এর মতোই দুটি সীমা: কেবল সুপারিশ, আর প্রাক্কলনের জায়গায় চুক্তিমূল্য। ১৪৮টি বিচ্যুতির বিন্যাস: মধ্যক চুক্তিমূল্যের ১.৬২ গুণ, সর্বোচ্চ ৭.৫৩ গুণ, ৫০টি দুই গুণের উপরে আর ২৭টি তিন গুণের উপরে — অর্থাৎ R08-এর মতো এগুলো ছোটখাটো ছাড়িয়ে যাওয়া নয়। যাচাইয়ের সময় দুটি সারি <em>সংশোধন</em> করা হয়েছে: ১১৯৫৪৫ ও ১১৩৪২৮ দরপত্রে অনুপাত এসেছিল ৮০,৪৩৬.৯৯ গুণ আর ৪৩,৬৫০.২২ গুণ, কারণ নিষ্কাশক ইতিমধ্যেই পূর্ণ একটি সংখ্যার উপর আবার লাখের গুণক বসিয়েছিল (আর ১১৯৫৪৫-এ তরল সম্পদের ধারার বদলে সর্বনিম্ন দরপত্র সক্ষমতার ধারাটি পড়েছিল)। প্রকৃত অনুপাত ০.৩৭ ও ০.৪৪ গুণ, দুটিই নিয়ম মেনে চলা — এতে এই নিয়ম ১৫০ থেকে ১৪৮ বিচ্যুতিতে নেমেছে। মূল তালিকার আর কোনো অনুপাতের কলামে এ ধরনের ত্রুটি পাওয়া যায়নি।",
  },
  R08: {
    clause: "<code>ITT 31.1</code>-র <code>TDS</code> টীকা",
    test: "দরপত্র জামানত চুক্তিমূল্যের ৩ শতাংশ ছাড়িয়ে গেছে।",
    limit: "“তিন (৩) শতাংশের বেশি নয়” সত্যিকারের একটি ছাদ, কিন্তু তা মাপা হয় সরকারি প্রাক্কলিত ব্যয়ের বিপরীতে। প্রাক্কলন সাধারণত চুক্তিমূল্যের উপরে থাকে, তাই চুক্তিমূল্যের ৩ শতাংশের বেশি জামানতও প্রাক্কলনের ৩ শতাংশের নিচে থাকতে পারে। ছাড়িয়ে যাওয়াটা বেশিরভাগই সামান্য: ১৭১টির মধ্যক ৩.২৬ শতাংশ, সর্বোচ্চ ৬.৩২ শতাংশ; কেবল ১৩টি ৫ শতাংশ ছাড়ায়, আর ওই ১৩টিই একমাত্র সারি যেখানে জামানতটি বৈধ হতে প্রাক্কলনকে চুক্তিমূল্যের দুই-তৃতীয়াংশেরও বেশি উপরে থাকতে হবে। বাকি ১৫৮টিকে সংস্থাকে করা একটি প্রশ্ন হিসেবে ধরুন, ফলাফল হিসেবে নয়।",
  },
  R09: {
    clause: "<code>ITT 28.1(f)</code>-র <code>TDS</code> ভুক্তি ও বন্ধনীর নির্দেশনা",
    test: "পণ্যের দরপত্রে প্রস্তুতকারকের অনুমোদন বা একক পরিবেশকের সনদ চাওয়া হয়েছে।",
    limit: "এটি নির্দেশনা, আর তা নির্ভর করে পণ্যটি “দোকানে সহজলভ্য” কিনা তার উপর — এই বিচারটি এই ব্যবস্থা করে না। গঠনটিই সতর্ক থাকার পক্ষে বলে: ৬৫টির ৫০টি রাজউকের, আর প্যাকেজগুলো বিপুলভাবে যাত্রী-লিফট, স্ট্রেচার-লিফট, সাবস্টেশন, জেনারেটর ও র‍্যাক সার্ভার, যেখানে প্রস্তুতকারকের অনুমোদন চাওয়ার সাধারণ ও রক্ষণীয় কারণ আছে। তাই ৬৫টিকে অনুচিত শর্ত হিসেবে <em>প্রকাশ করবেন না</em>। যেটুকু প্রতিবেদনযোগ্য তা সংকীর্ণ: লিফটের প্যাকেজগুলোতেই কনসেপ্ট এলিভেটরস অ্যান্ড ইঞ্জিনিয়ারিং লিমিটেড ১২টি চুক্তি পেয়েছে, তার ৯টি দুই বা তার কম প্রতিদ্বন্দ্বীর মাঠে — এটি অনুমোদিত পরিবেশক কত কম আছে তা নিয়ে বাজার-গঠনের প্রশ্ন, নিয়ম ভাঙা নয়। আদর্শ দস্তাবেজের “দোকানে সহজলভ্য” নির্দেশনাটি পরিষ্কারভাবে যে একটিমাত্র প্যাকেজে খাটে তা আসবাব: ১৯৯৯৪২ দরপত্রে আসবাব সরবরাহের প্রতিটি সামগ্রীর জন্য প্রস্তুতকারকের অনুমোদন চাওয়া হয়েছিল।",
  },
  R10: {
    clause: "<code>ITT 56.2(b)</code>",
    test: "দরপত্রে একটিমাত্র দর পড়েছে, বা শেষে গ্রহণযোগ্য দরদাতা ছিল একজন — তবু চুক্তি দেওয়া হয়েছে।",
    limit: "“বাতিল করা যেতে পারে” — ধারাটি একটি ক্ষমতা তৈরি করে, দায় নয়, আর <code>ITT 56.3</code> স্পষ্ট ভাষায় চুক্তিটি টিকিয়ে রাখে যদি মূল্যায়িত সর্বনিম্ন দর বাজারদরের সঙ্গে মেলে। এই সারির <em>কিছুই</em> নিয়ম ভাঙা নয়। প্রতিবেদনযোগ্য প্রশ্নটি হলো, দরপত্র মূল্যায়ন কমিটি <code>56.2(b)</code> আদৌ বিবেচনা করেছিল কি না এবং ক্রয়কারী সংস্থার প্রধান কী সিদ্ধান্ত নিয়েছিলেন — যার উত্তর কেবল কমিটির কার্যবিবরণীতেই থাকে, আর তা এই সংকলনে নেই।",
  },
  R11: {
    clause: "<code>ITT 50.6</code>",
    test: "গ্রহণযোগ্য দর ঠিক একটি, তাই <code>ITT 50.6</code> প্রযোজ্য — কিন্তু ধারাটি যে সরকারি প্রাক্কলিত ব্যয়ের সঙ্গে মেলাতে বলে, তা ১,৮০৫টি নথির একটিতেও প্রকাশিত নয়।",
    limit: "এটি এমন ফলাফল নয় যে তুলনাটি বাদ দেওয়া হয়েছে। এটি এই ফলাফল যে, ঠিক এই পরিস্থিতির জন্য নিয়মটি যে একটিমাত্র পরীক্ষা বলে দিয়েছে, সংস্থার বাইরের কেউ তা যাচাই করতে পারে না — কারণ যে মানদণ্ডের উপর পরীক্ষাটি দাঁড়ানো, সেটি কখনোই প্রকাশ করা হয় না।",
  },
  R12: {
    clause: "<code>ITT 63.2</code>, এবং <code>PPR 2025</code>-এর <code>Rule 123(7)</code> উদ্ধৃত করা <code>ITT 62.1</code>-এর <code>TDS</code> ভুক্তি",
    test: "পরীক্ষা করা যায় না। ৬৪৫টি চুক্তির বিজ্ঞপ্তির সবগুলোতেই কার্যসম্পাদন জামানতের ঘর ফাঁকা।",
    limit: "আরও একটি কারণে এটি লিখে রাখার মতো: আদর্শ দস্তাবেজ নিজের সঙ্গেই বিরোধ করে। <code>ITT 63.2</code> বলে সমান চৌদ্দ (১৪) দিন; তার নিজের <code>TDS</code> বলে মূল্যের স্তর অনুযায়ী ৭/১০/১৪ <em>কর্মদিবস</em>। ১৪ দিনের সংখ্যাটি সবচেয়ে উঁচু স্তরের, সাধারণ নিয়ম নয়।",
  },
  R13: {
    clause: "<code>ITT 11.5</code>, সঙ্গে <code>ITT 11.2</code> ও <code>ITT 38.2</code>",
    test: "পরীক্ষা করা যায় না। পোর্টালের সংশোধনী ঘরে সংশোধনীর <em>নম্বর</em> ও তার লেখা ছাপা হয়, কিন্তু সংশোধনীর <em>তারিখ</em> নয় — তাই এক-তৃতীয়াংশ সময়ের পরীক্ষাটি চালানোই যায় না।",
    limit: "পরীক্ষা-অযোগ্য নিয়মগুলোর মধ্যে এটিই সবচেয়ে ক্ষতিকর, কারণ ১৬০টি দরপত্র সংশোধন করা হয়েছে আর সেই সংশোধনীর ১৩৬টি যোগ্যতার শর্তে হাত দিয়েছে। (এই টীকার আগের একটি খসড়ায় লেখা ছিল ২৪; মূল তালিকার নিজের সংশোধনী-কলাম ১৬০-এর মধ্যে ১৩৬ দেয়, আর যাচাইয়ে আবার গুনে তা মিলেছে।) বিপিপিএ থেকে সংশোধনীর তারিখ পাওয়া গেলে একটি বাধ্যতামূলক নিয়ম অযাচাইযোগ্য থেকে যাচাইযোগ্য হয়ে যাবে। এটিও খেয়াল রাখুন, ধারাটি যেভাবে লেখা তাতে সে নিজের সঙ্গেই অসংগত — “স্বীয় বিবেচনায় বাড়াইবে” একই ক্রিয়াপদে ক্ষমতা ও দায় দুটোই বসিয়ে দেয় — তাই তারিখ হাতে এলেও <code>ITT 11.5</code> আসলে বাধ্য করে কি না, সেটি এই তথ্যভাণ্ডারের নয়, একজন ক্রয়-আইনজীবীর প্রশ্ন।",
  },
  R14: {
    clause: "<code>ITT 56.2(a)</code>",
    test: "পরীক্ষা করা যায় না। ১,১৫৫টি সারির সবগুলোতেই প্রাক্কলিত দরপত্রমূল্য সংকলনের কোনো নথিতে প্রকাশিত নয়, আর আলাদা আলাদা দরের অঙ্ক কখনোই ছাপা হয় না।",
    limit: "প্রাক্কলনের এই অন্ধকার একসঙ্গে অচল করে দেয় R14, R11-এর হিসাব, এবং R06, R07 ও R08-এর যথাযথ রূপটিকেও। এই সংকলনে এটিই একক সবচেয়ে গুরুত্বপূর্ণ ফাঁক।",
  },
  R15: {
    clause: "<code>JICA Guidelines for Procurement under Japanese ODA Loans</code>, <code>Section 4.07</code> — ব্র্যান্ডের নাম ব্যবহার",
    test: "বিজ্ঞপ্তিতে ব্র্যান্ড বা মডেলের নাম আছে, কিন্তু “অথবা সমতুল্য” কথাটি নেই।",
    limit: "<code>e-PG3A</code>-তে ব্র্যান্ডের নাম নিয়ে <em>কোনো</em> নিয়মই নেই। ৮৯ পৃষ্ঠা ঘেঁটে যাচাই করা হয়েছে: <code>brand name</code>, <code>brand names</code> ও <code>trade name</code> — তিনটিতেই শূন্য ফল; আর <code>or equivalent</code>-এর যে একটিমাত্র আপাত-মিল, তা ৬০ পৃষ্ঠায় আগাম পরিশোধের জামানতের ধারায় <code>for equivalent amount</code> — বিবরণী-শর্তের সঙ্গে যার কোনো সম্পর্ক নেই। উদ্ধৃত করার মতো একমাত্র লেখাটি জাইকার, আর ১,১৫৫টি দরপত্রের ঠিক ১টি জাইকার অর্থে চলে। কখনো “জাইকা লঙ্ঘন” লিখবেন না। এর বাংলাদেশি সমতুল্যটি আছে ২০০৬ সালের ক্রয় আইন ও ২০০৮ সালের বিধিমালায়, যার কোনোটিই এই সংকলনে নেই।",
  },
  R16: {
    clause: "<code>JICA Guidelines for Procurement under Japanese ODA Loans</code>, <code>Section 1.01(3)</code>, সঙ্গে <code>Annex I</code>-এর ১ ও ২ টীকা",
    test: "বিজ্ঞপ্তি শর্ত দিচ্ছে যে পূর্ব অভিজ্ঞতা সরকারি বা আধা-সরকারি ক্রেতার সঙ্গে হতে হবে।",
    limit: "যাচাইয়ের সময় সংশোধিত: এই তালিকার আগের একটি খসড়ায় R16 লেখা ছিল সংকলনে অনুপস্থিত হিসেবে। বৈষম্যহীনতার একটি নীতি সংকলনে <em>আছে</em>, তবে কেবল জাইকার নির্দেশিকায়, যা ১,১৫৫টি দরপত্রের ঠিক ১টিকে বাঁধে — তাই এর অবস্থা “অনুপস্থিত” নয়, “মানদণ্ড”। বাংলাদেশের কোনো <em>বাধ্যতামূলক</em> বৈষম্যহীনতা বা আনুপাতিকতার ধারা সংকলনে নেই: <code>e-PG3A</code>-র ৮৯ পৃষ্ঠায় <code>discriminat</code>, <code>proportional</code>, <code>proportionate</code>, <code>equal treatment</code>, <code>restrict competition</code> ও <code>undue restriction</code> — ছয়টিতেই শূন্য ফল, আর <code>semi-government</code>-এর একমাত্র মিলটি (১০ পৃষ্ঠা) সরকারি অর্থের সংজ্ঞায় — দরদাতার পূর্ব ক্রেতা কে হতে পারে সে সম্পর্কিত কোনো নিয়মে নয়। <code>ITT 13.1(b)</code> <code>TDS</code>-কে নির্দিষ্ট অভিজ্ঞতা বসানোর সুযোগ দেয়, কিন্তু ক্রেতা কে হবে তা বেঁধে দেয় না। তাই কেবল সরকারি ক্রেতার শর্তকে এই সংকলন থেকে নিয়ম ভাঙা বলা যায় না — মাঠ যতই সংকুচিত হোক।",
  },
  R17: {
    clause: "কোনো ধারা নেই",
    test: "বিজ্ঞপ্তি কোনো সীমা প্রকাশ করে না, কেবল “দরপত্র তথ্যপত্র অনুযায়ী” লেখে, বা ঘরটি ফাঁকা, বা পোর্টাল প্রবেশ করতে দেয়নি।",
    limit: "দরপত্র আহ্বানপত্রে নিজে কী কী থাকতে হবে তা ঠিক করে দেয় ক্রয় বিধিমালা, যা এই সংকলনে নেই; আর দরপত্র তথ্যপত্রটি থাকে সেই দস্তাবেজের ভিতরে যা দরদাতারা কিনে নেন — তাই “তথ্যপত্র অনুযায়ী” লেখাটি পুরোপুরি বৈধও হতে পারে। এই অনুসন্ধানে এটি একসঙ্গে <em>স্বচ্ছতার</em> সবচেয়ে শক্ত ফলাফল আর <em>নিয়মের</em> সবচেয়ে দুর্বল ফলাফল।",
  },
  R18: {
    clause: "<code>JICA Section 2.02</code> — চুক্তির আকার; এবং বিশ্বব্যাংকের <code>Procurement Regulations</code>-এর ৬.১৪ অনুচ্ছেদ, ষষ্ঠ সংস্করণের নিজস্ব সংশোধন-তালিকায় (ফেব্রুয়ারি ২০২৫) যেভাবে সংক্ষেপে লেখা",
    test: "২৫ কোটি টাকার উপরের চুক্তি জাতীয় প্রতিযোগিতামূলক দরপত্রে দেওয়া হয়েছে।",
    limit: "এই সংকলনের প্রতিটি দরপত্রই জাতীয় — ১,১৫০টিতে তা লেখা আছে, ৫টির তথ্য নেই, একটিও আন্তর্জাতিক নয়। জাইকা বাঁধে ১টি দরপত্র; বিশ্বব্যাংকের অনুচ্ছেদটি সংকলনে আছে কেবল ৩ পৃষ্ঠার একটি পরিবর্তন-তালিকায় সংক্ষেপে, আর তা পৌঁছায় কেবল <em>আন্তর্জাতিক</em> ক্রয় পর্যন্ত, যা এখানে একটিও নেই। ২৫ কোটি টাকার কাটাটি আমার নিজের, নেওয়া হয়েছে <code>Rule 123(9)</code>-এর সবচেয়ে উঁচু স্তর থেকে — অন্তত ওই সংখ্যাটি সংকলনে আছে বলেই।",
  },
};

/* ------------------------------------ the analysis's own sentences, in Bangla
   Some of the writing on this site was written into a data file rather than
   into this one, because it travels with a figure it describes: the named
   example under a rule, the five gaps the corpus has, the two places a
   published summary did not reproduce, the note on which instrument was
   actually read. The English in those files is the record and is not edited
   here. This map carries the Bangla for it, keyed by the exact English string,
   for the same reason RULE_BN is keyed by rule code: nothing is duplicated, so
   nothing can drift.

   A string with no entry falls through as its English self, which means the
   Latin-script sweep finds it. That is the intended failure: loud, not silent.

   Values may carry markup, because two kinds of Latin belong inside a Bangla
   sentence and neither is prose. A locator goes in <code> — an ITT number, a
   column name, a Unicode code point — because a reader types it into a search
   box. Words a document prints go in .verbatim: a cover-page phrase, the
   interleaved fragment a PDF extractor produces. Translating either would
   destroy the thing that makes it checkable. */
export const PHRASE_BN = {
  /* rules.json — observed_sample[].observed, the fixed forms */
  "no ownership table printed": "মালিকানার কোনো তালিকা ছাপা হয়নি",
  "enlistment with the procuring entity required; method = Open Tendering Method (OTM)":
    "ক্রয়কারী সংস্থার তালিকায় নাম থাকা বাধ্যতামূলক; পদ্ধতি = উন্মুক্ত দরপত্র পদ্ধতি",
  "manufacturer's authorisation and/or sole-dealership required on a Goods package":
    "পণ্যের প্যাকেজে প্রস্তুতকারকের অনুমোদন ও/বা একক পরিবেশকের সনদ চাওয়া হয়েছে",
  "notice imposes its own fixed percentage band as automatic non-responsiveness":
    "বিজ্ঞপ্তি নিজেই একটি নির্দিষ্ট শতকরা সীমা বসিয়ে দিয়েছে, যা ছাড়ালেই দর স্বয়ংক্রিয়ভাবে অগ্রহণযোগ্য",
  "status 'Contract Awarded' but no award notice in the portal print":
    "অবস্থা “চুক্তি প্রদান করা হয়েছে”, কিন্তু পোর্টালের ছাপায় চুক্তির কোনো বিজ্ঞপ্তি নেই",

  /* rules.json — observed_sample[].required */
  "not exceeding 3% of the official cost estimate":
    "সরকারি প্রাক্কলিত ব্যয়ের ৩ শতাংশের বেশি নয়",
  "publication required above BDT 10.00 Lac":
    "১০.০০ লাখ টাকার উপরে প্রকাশ বাধ্যতামূলক",
  "no pre-conditions for sale of documents; enlistment confined to LTM":
    "দস্তাবেজ বিক্রিতে কোনো পূর্বশর্ত নয়; তালিকাভুক্তির শর্ত কেবল সীমিত দরপত্র পদ্ধতিতেই সীমাবদ্ধ",
  "14 days (up to BDT 50 million, by awarded value used as proxy for the estimate)":
    "১৪ দিন (৫ কোটি টাকা পর্যন্ত; প্রাক্কলনের বিকল্প হিসেবে চুক্তিমূল্য ধরা হয়েছে)",
  "award details published within 24 hours and displayed 28 days; contract details within 3 days, kept 30 days":
    "চুক্তি প্রদানের তথ্য ২৪ ঘণ্টার মধ্যে প্রকাশ ও ২৮ দিন প্রদর্শন; চুক্তির তথ্য ৩ দিনের মধ্যে, ৩০ দিন সংরক্ষণ",
  "TDS default is 'Manufacturer's Authorization is not required'; usually not required for off-the-shelf readily available Goods":
    "<code>TDS</code>-এর সাধারণ অবস্থান — “প্রস্তুতকারকের অনুমোদন প্রয়োজন নেই”; দোকানে সহজলভ্য পণ্যের ক্ষেত্রে সাধারণত তা লাগেও না",
  "computed lower limit [x-Sd] under ITT 50.3; 20% against the official estimate under ITT 50.6":
    "<code>ITT 50.3</code> অনুযায়ী হিসাব করা নিম্নসীমা <code>[x-Sd]</code>; <code>ITT 50.6</code> অনুযায়ী সরকারি প্রাক্কলনের বিপরীতে ২০%",

  /* ------------------------------------------- deviations.json — observed
     What each rule test found on one tender, clause by clause. These read like
     a note an analyst wrote in a margin, and that is what they are: the column
     is our own reading of the page, not the page's words. So they are
     translated, while the column names and clause locators inside them stay in
     the script they are filed in. */
  "performance-security field on the award notice is blank":
    "চুক্তির বিজ্ঞপ্তিতে কার্যসম্পাদন জামানতের ঘরটি ফাঁকা",
  "estimated_tender_value = empty (published in no document in the corpus)":
    "<code>estimated_tender_value</code> ফাঁকা — সংকলনের কোনো নথিতেই প্রকাশিত নয়",
  "individual bid amounts never printed":
    "আলাদা আলাদা দরের অঙ্ক কোথাও ছাপা হয়নি",
  "one technically responsive tender":
    "কারিগরিভাবে গ্রহণযোগ্য দর একটি",
  "official cost estimate not published in any document":
    "সরকারি প্রাক্কলিত ব্যয় কোনো নথিতে প্রকাশিত নয়",
  "past experience restricted to government or semi-government clients":
    "অতীত অভিজ্ঞতা কেবল সরকারি বা আধা-সরকারি কাজেই সীমাবদ্ধ",
  "brand or model named with no 'or equivalent' wording":
    "ব্র্যান্ড বা মডেলের নাম বলা আছে, “বা সমমানের” কথাটি নেই",
  "manufacturer/dealer requirement present but nature = Works":
    "প্রস্তুতকারক বা পরিবেশকের সনদ চাওয়া হয়েছে, অথচ ক্রয়ের ধরন পূর্তকাজ",
  "portal prints no corrigendum date":
    "পোর্টাল সংশোধনীর কোনো তারিখ ছাপে না",
  "amendment touched the qualification criteria":
    "সংশোধনী যোগ্যতার শর্তে হাত দিয়েছে",

  /* The same column carrying a coded value rather than a sentence. The code is
     what a reader would search on, so it stays; the reading beside it is the
     one the record surface already gives that value. */
  "eligibility_published = AS_PER_TENDER_DATA_SHEET_ONLY":
    "যোগ্যতার শর্ত প্রকাশের ধরন (<code>eligibility_published</code>) — কেবল টাকা দিয়ে কেনা দস্তাবেজের ভেতরের <code>Tender Data Sheet</code>-এর উল্লেখ হিসেবে (<code>AS_PER_TENDER_DATA_SHEET_ONLY</code>)",
  "eligibility_published = PORTAL_ACCESS_DENIED":
    "যোগ্যতার শর্ত প্রকাশের ধরন (<code>eligibility_published</code>) — পোর্টাল বিজ্ঞপ্তির এই অংশটি দেয়নি (<code>PORTAL_ACCESS_DENIED</code>)",
  "eligibility_published = BLANK_IN_NOTICE":
    "যোগ্যতার শর্ত প্রকাশের ধরন (<code>eligibility_published</code>) — বিজ্ঞপ্তিতে ঘরটি ফাঁকা (<code>BLANK_IN_NOTICE</code>)",

  /* ------------------------------------------- deviations.json — required
     What the clause asks for, against which the reading above was measured. */
  "comparison of the lowest evaluated price against the official cost estimate":
    "সর্বনিম্ন মূল্যায়িত দরের সঙ্গে সরকারি প্রাক্কলিত ব্যয়ের তুলনা",
  "the content required of an Invitation for Tenders is prescribed by the PPR, which is not in the corpus":
    "দরপত্র আহ্বানের বিজ্ঞপ্তিতে কী কী থাকতে হবে তা ঠিক করে দেয় <code>PPR</code>, আর সেটি এই সংকলনে নেই",
  "no non-discrimination or proportionality clause exists in the corpus":
    "বৈষম্যহীনতা বা সমানুপাতিকতার কোনো ধারা এই সংকলনে নেই",
  "no Bangladeshi brand-name rule exists in the corpus":
    "ব্র্যান্ডের নাম নিয়ে বাংলাদেশের কোনো নিয়ম এই সংকলনে নেই",
  "the corpus contains zero international tenders":
    "সংকলনে আন্তর্জাতিক দরপত্র একটিও নেই",

  /* The two remaining signing bands. Written out rather than matched by shape
     because each is one fixed string and the money in it has to be re-scaled
     for a Bangla reader — the rulebook counts in millions and this page counts
     in crore, as the 14-day band above it already does. */
  "21 days (BDT 50-250 million, by awarded value used as proxy for the estimate)":
    "২১ দিন (৫ থেকে ২৫ কোটি টাকা; প্রাক্কলনের বিকল্প হিসেবে চুক্তিমূল্য ধরা হয়েছে)",
  "28 days (above BDT 250 million, by awarded value used as proxy for the estimate)":
    "২৮ দিন (২৫ কোটি টাকার উপরে; প্রাক্কলনের বিকল্প হিসেবে চুক্তিমূল্য ধরা হয়েছে)",
  /* corpus.json — qa.gaps[].key, the five things the record does not contain */
  "individual bid amounts and bidder names other than the winner are never published in this document set":
    "বিজয়ী ছাড়া আর কোনো দরদাতার নাম বা দরের অঙ্ক এই নথিসমগ্রে কোথাও প্রকাশিত নয়",
  "official cost estimate absent corpus-wide":
    "সরকারি প্রাক্কলিত ব্যয় সমগ্র সংকলনে অনুপস্থিত",
  "beneficial ownership left blank on the award notice":
    "চুক্তির বিজ্ঞপ্তিতে প্রকৃত মালিকানার ঘর ফাঁকা",
  "bid counts not published": "দর জমার সংখ্যা প্রকাশিত নয়",
  "portal refused access to this tender's notice content":
    "পোর্টাল এই দরপত্রের বিজ্ঞপ্তির লেখায় প্রবেশ করতে দেয়নি",

  /* corpus.json — qa.notes[], where a published summary did not reproduce */
  "not reproducible": "পুনরুৎপাদন করা যায় না",
  "figure moved by a correction": "সংশোধনে সংখ্যাটি সরে গেছে",
  "The analyst's summary reports r = +0.130 for restriction against bid count. That figure does not reproduce from the three CSVs shipped here under any population this build could construct.":
    "বিশ্লেষকের সারসংক্ষেপে সীমাবদ্ধতার স্কোর ও দর জমার সংখ্যার সম্পর্ক লেখা আছে <code>r</code> = +০.১৩০। এখানে যে তিনটি তালিকা দেওয়া হলো, তা থেকে এই বিল্ড যেভাবেই জনসংখ্যা গড়ুক, ওই সংখ্যাটি আর ফিরে আসে না।",
  "The site prints the reproducible pair instead: on the tenders that both publish criteria and have a bid count, restriction score against bid count is r = 0.331 over n = 276. The direction is the same, and it is the direction that contradicts the tailoring theory.":
    "এর বদলে সাইটে ছাপা হয়েছে যে জোড়াটি পুনরুৎপাদন করা যায়: যেসব দরপত্র শর্তও প্রকাশ করেছে আর যাদের দর জমার সংখ্যাও আছে, সেখানে সীমাবদ্ধতার স্কোর ও দর জমার সংখ্যার <code>r</code> = ০.৩৩১, <code>n</code> = ২৭৬-এর উপর। দিক একই — আর ওই দিকটিই শর্ত সাজিয়ে দেওয়ার তত্ত্বকে খণ্ডন করে।",
  "The summary's prose says 150 notices set a financial bar above contract value, 52 above twice and 5 above five times.":
    "সারসংক্ষেপের লেখায় বলা হয়েছে, ১৫০টি বিজ্ঞপ্তি চুক্তিমূল্যের উপরে আর্থিক সীমা বসিয়েছে, ৫২টি তার দ্বিগুণের উপরে আর ৫টি পাঁচ গুণের উপরে।",
  "Those counts predate the liquid-asset correction recorded below. Recomputed on the corrected column the figures are 148, 50 and 3, and R07 falls to 148 deviations, exactly as the correction script predicted.":
    "ওই গণনাগুলো নিচে লিপিবদ্ধ তরল সম্পদের সংশোধনের আগের। সংশোধিত কলামে আবার হিসাব করলে সংখ্যাগুলো ১৪৮, ৫০ ও ৩, আর R07 নেমে আসে ১৪৮টি বিচ্যুতিতে — সংশোধনের স্ক্রিপ্ট ঠিক যা আগেই বলেছিল।",
  /* corpus.json — meta.rule_catalogue, on which instrument was actually read */
  "e-PG3A is the BPPA Standard Tender Document (National) for Procurement of GOODS using Framework Agreement [OTM/LTM], dated December 2025, and its cover page reads 'Preliminary working Draft'. The corpus contains no Public Procurement Rules text at all (0 hits for PPR 2008 across all five reference PDFs) and no earlier Standard Tender Document. Contracts here were signed 2015-2026 and 714 of 1,155 tenders are Works, not Goods.":
    "<code>e-PG3A</code> হলো বিপিপিএ-র আদর্শ দরপত্র দস্তাবেজ (জাতীয়), কাঠামো চুক্তির আওতায় <em>পণ্য</em> ক্রয়ের জন্য [<code>OTM/LTM</code>], তারিখ ডিসেম্বর ২০২৫ — আর তার প্রচ্ছদেই লেখা <span class=\"verbatim\">Preliminary working Draft</span>। সংকলনে ক্রয় বিধিমালার কোনো লেখাই নেই (পাঁচটি রেফারেন্স পিডিএফ মিলিয়ে <code>PPR 2008</code>-এ শূন্য ফল), আগের কোনো আদর্শ দরপত্র দস্তাবেজও নেই। এখানকার চুক্তিগুলো সই হয়েছে ২০১৫ থেকে ২০২৬ সালে, আর ১,১৫৫টি দরপত্রের ৭১৪টি পূর্তকাজ — পণ্য নয়।",
  "Quotes follow the clause's READING ORDER, which is not always the character order produced by `pdftotext -layout`. Three artefacts break a naive literal search and none of them means the quote is wrong. (1) e-PG3A sets clause headings in a left margin column, so the heading is interleaved into the middle of the clause sentence: ITT 61.1 extracts as 'Immediately, but no later than 24 hours, after issuing the / Contract Awarding / Notification of Award ...', and ITT 21.1 as '... the following shall / for LTM Tenders / apply:'. (2) Words are hyphenated across line breaks, e.g. ITT 11.5 prints 'one-' then 'third'. (3) ITT 50.3 prints its formula in mathematical-italic Unicode (U+1D465, U+1D451) which is transcribed here in ASCII as [x-Sd ]. To verify any quote, read the cited page as printed rather than grepping the extracted text.":
    "উদ্ধৃতিগুলো ধারার <em>পাঠক্রম</em> মেনে চলে, যা সব সময় <code>pdftotext -layout</code>-এর তৈরি অক্ষরক্রম নয়। তিনটি কারণে সরল আক্ষরিক খোঁজ ব্যর্থ হয়, আর তার একটিও উদ্ধৃতিকে ভুল বানায় না। (১) <code>e-PG3A</code> ধারার শিরোনাম বসায় বাঁ দিকের একটি মার্জিন-কলামে, তাই শিরোনামটি ধারার বাক্যের মাঝখানে ঢুকে যায়: <code>ITT 61.1</code> বেরোয় <span class=\"verbatim\">Immediately, but no later than 24 hours, after issuing the / Contract Awarding / Notification of Award …</span> হিসেবে, আর <code>ITT 21.1</code> বেরোয় <span class=\"verbatim\">… the following shall / for LTM Tenders / apply:</span> হিসেবে। (২) লাইন ভাঙার মুখে শব্দে হাইফেন পড়ে — <code>ITT 11.5</code>-এ আগে ছাপা হয় <span class=\"verbatim\">one-</span>, তারপর <span class=\"verbatim\">third</span>। (৩) <code>ITT 50.3</code> তার সূত্রটি ছাপে গাণিতিক-ইটালিক ইউনিকোডে (<code>U+1D465</code>, <code>U+1D451</code>), যা এখানে সাধারণ অক্ষরে <code>[x-Sd ]</code> হিসেবে লেখা হয়েছে। কোনো উদ্ধৃতি যাচাই করতে হলে উদ্ধৃত পৃষ্ঠাটি যেভাবে ছাপা আছে সেভাবেই পড়ুন, নিষ্কাশিত লেখায় খুঁজবেন না।",

  /* ---------------------------------------------------------------------------
     details.json — the per-tender record, one clause at a time.

     These are the fixed clauses the analysis wrote into every tender's own row:
     what the notice published, what the portal's status does not match, what the
     record does not contain at all. The clauses that carry a figure are shapes
     below instead, so that no number is ever restated here.

     The standing caveat on a hypothesis keeps its colon, because it introduces
     the sentence after it rather than closing one. */
  "HYPOTHESIS ONLY, NOT ESTABLISHED:": "কেবল অনুমান, প্রতিষ্ঠিত নয়:",

  "notice publishes no qualification thresholds, only a cross-reference to the Tender Data Sheet inside the paid document":
    "বিজ্ঞপ্তিতে যোগ্যতার কোনো সীমা ছাপা হয়নি — কেবল টাকা দিয়ে কেনা দস্তাবেজের ভেতরের <code>Tender Data Sheet</code>-এর একটি উল্লেখ",
  "portal status says contract awarded but no award notice PDF exists in the corpus":
    "পোর্টালের অবস্থা বলছে চুক্তি হয়ে গেছে, অথচ সংকলনে চুক্তির কোনো পিডিএফ নেই",
  "award notice published but bid counts omitted (economic-operator template)":
    "চুক্তির বিজ্ঞপ্তি প্রকাশিত, কিন্তু দর জমার সংখ্যা বাদ (“ইকোনমিক অপারেটর” ছক)",
  "brand/model named with no 'or equivalent'":
    "ব্র্যান্ড বা মডেলের নাম আছে, “বা সমতুল্য” নেই",
  "notice requires brand/model named with no 'or equivalent'":
    "বিজ্ঞপ্তি ব্র্যান্ড বা মডেলের নাম বলে দিয়েছে, “বা সমতুল্য” লেখেনি",

  /* details.json — investigative_hypothesis, the nine sentences the analysis
     wrote. Each one is a theory being named so it can be tested, which is why
     the label above it says so and why none of them is written as a finding. */
  "no pattern in this record supports the steering theory on the published evidence":
    "প্রকাশিত তথ্যপ্রমাণে এই নথির কোনো ধরনই সাজিয়ে দেওয়ার তত্ত্বকে সমর্থন করে না",
  "requirement stack and bidder count are consistent with entry being deterred, but the notice alone cannot show intent":
    "শর্তের স্তূপ আর দরদাতার সংখ্যা এই সম্ভাবনার সঙ্গে মেলে যে ঢোকার পথ নিরুৎসাহিত হয়েছে — তবে বিজ্ঞপ্তি একা উদ্দেশ্য প্রমাণ করতে পারে না",
  "the winner's record of winning where competition is thin is worth testing against its ownership and its relationship with the entity":
    "প্রতিযোগিতা যেখানে পাতলা সেখানেই বিজয়ীর জেতার নজির — তার মালিকানা ও সংস্থার সঙ্গে সম্পর্কের সঙ্গে মিলিয়ে দেখার মতো",
  "bidders had to price inside a band around a figure never published, which advantages anyone with prior knowledge of the estimate":
    "দরদাতাদের দর দিতে হয়েছে কখনো প্রকাশ না-হওয়া একটি সংখ্যার চারপাশে বাঁধা সীমার ভেতরে — যা প্রাক্কলন আগে থেকে জানা যে কারো জন্য সুবিধা",
  "most firms that bought the document did not bid, which is where a deterrent requirement would show up":
    "দস্তাবেজ কেনা অধিকাংশ প্রতিষ্ঠানই দর দেয়নি — নিরুৎসাহিত করা শর্ত থাকলে তা এখানেই ধরা পড়ে",
  "restricting the field to the authority's own enlisted firms converts an open tender into a closed list whose membership is not published":
    "প্রতিযোগিতা কেবল সংস্থার নিজের তালিকাভুক্ত প্রতিষ্ঠানে সীমিত করা মানে উন্মুক্ত দরপত্রকে একটি বন্ধ তালিকায় বদলে দেওয়া, যে তালিকায় কারা আছে তা প্রকাশিত নয়",
  "naming a brand without an 'or equivalent' clause can narrow the field to one supply chain":
    "“বা সমতুল্য” ধারা ছাড়া ব্র্যান্ডের নাম বলে দেওয়া প্রতিযোগিতাকে একটিমাত্র সরবরাহ-শিকলে নামিয়ে আনতে পারে",
  "contract value sits high against the benchmark implied by the entity's own tender security, a proxy only, because no cost estimate is published":
    "সংস্থার নিজের দরপত্র জামানত থেকে যে মানদণ্ড আসে তার তুলনায় চুক্তিমূল্য উঁচুতে — এটি কেবল একটি বিকল্প মাপ, কারণ কোনো প্রাক্কলিত ব্যয় প্রকাশিত নয়",
  "the evaluation record that would explain it is not published":
    "যে মূল্যায়নের নথি এর ব্যাখ্যা দিত, তা প্রকাশিত নয়",

  /* details.json — journalist_next_step. Four of the six are requests a reporter
     can file; the locator in the sixth stays in the script it is typed in. */
  "ask the procuring entity for the official cost estimate, which is absent from every document":
    "ক্রয়কারী সংস্থার কাছে সরকারি প্রাক্কলিত ব্যয় চাওয়া হোক — প্রতিটি নথিতেই তা নেই",
  "file an RTI request for the Tender Data Sheet and the qualification criteria":
    "<code>Tender Data Sheet</code> ও যোগ্যতার শর্তের জন্য তথ্য অধিকার আইনে আবেদন করা হোক",
  "request the tender evaluation committee report and the list of firms that bought the document":
    "দরপত্র মূল্যায়ন কমিটির প্রতিবেদন এবং দস্তাবেজ কেনা প্রতিষ্ঠানের তালিকা চাওয়া হোক",
  "pull RJSC ownership filings for the winner and check for shared directors or addresses":
    "বিজয়ীর মালিকানার দাখিলা যৌথ মূলধন কোম্পানি ও ফার্মসমূহের পরিদপ্তর থেকে তোলা হোক, আর দেখা হোক পরিচালক বা ঠিকানা মিলে যায় কি না",

  /* details.json — extraction, how the text was got off the page. */
  pdftotext_layout_text_layer:
    "পৃষ্ঠার নিজের লেখার স্তর, <code>pdftotext -layout</code> দিয়ে পড়া",

  /* The two rows re-read by hand carry the marker the correction was filed
     under, and then the rule's corrected result. Both are machine tokens a
     reader may need to search on, so both stay in the script they were filed
     in; the sentence around them does not. */
  "pdftotext_layout_text_layer | CORRECTED_2026-09-02_VERIFICATION:":
    "পৃষ্ঠার নিজের লেখার স্তর, <code>pdftotext -layout</code> দিয়ে পড়া। পরে পৃষ্ঠাটি আবার দেখে সংশোধন করা হয়েছে (<code>CORRECTED_2026-09-02_VERIFICATION</code>):",
  "result R07 DEVIATION -> COMPLIANT":
    "সংশোধনের পর <code>R07</code>-এর ফল: বিচ্যুতি নয়, নিয়ম মানা হয়েছে",
};

/* The same job for the sample strings that carry a measured figure in them, and
   so cannot be listed one by one: a new sample tender would produce a number
   this file has never seen. Each shape is matched in order and the figures are
   lifted straight out of the English, then set in Bengali numerals — so nothing
   is restated here and the two editions cannot disagree about a value.

   Anchored at both ends deliberately. A shape that only matched a prefix would
   quietly drop whatever followed it, and dropping half a measurement is worse
   than leaving the English visible for the sweep to find. */
export const PHRASE_SHAPES = [
  { re: /^(\d+) days from NOA to signing$/,
    bn: "নোটিশ থেকে সই পর্যন্ত $1 দিন" },
  { re: /^financial bar = ([\d.]+)x awarded contract value$/,
    bn: "আর্থিক সক্ষমতার সীমা = চুক্তিমূল্যের $1 গুণ" },
  { re: /^past-contract bar = ([\d.]+)x awarded contract value$/,
    bn: "পূর্ব চুক্তির সীমা = চুক্তিমূল্যের $1 গুণ" },
  { re: /^tender security = ([\d.]+)% of awarded contract value$/,
    bn: "দরপত্র জামানত = চুক্তিমূল্যের $1%" },
  { re: /^recommended ([\d.]+)-([\d.]+)x of the estimated cost$/,
    bn: "প্রাক্কলিত ব্যয়ের $1–$2 গুণ সুপারিশ করা হয়েছে" },

  /* ---------------------------------------------------------------------------
     details.json — documented_fact and its neighbours, clause by clause. Every
     figure below is lifted out of the English by the capture and set in Bengali
     numerals; not one is typed here, so the two editions cannot disagree about a
     number and a corrected CSV changes both at once.

     The four "notice requires" pairs are one shape each with the prefix optional,
     because the analysis writes the same measurement both ways depending on
     whether the clause opens the sentence. */
  { re: /^(\d+) tender\(s\) received against (\d+) sold$/,
    bn: "$2টি দস্তাবেজ বিক্রির বিপরীতে $1টি দর জমা" },
  { re: /^(\d+) ruled responsive$/,
    bn: "$1টি গ্রহণযোগ্য বিবেচিত" },
  { re: /^contract value Tk ([\d.,]+) lac$/,
    bn: "চুক্তিমূল্য $1 লাখ টাকা" },
  { re: /^contract value Tk ([\d.,]+) cr$/,
    bn: "চুক্তিমূল্য $1 কোটি টাকা" },
  /* Below a lakh the analysis writes the figure out in full rather than scaling
     it, so the clause carries no unit word to translate. */
  { re: /^contract value Tk ([\d,]+)$/,
    bn: "চুক্তিমূল্য $1 টাকা" },
  { re: /^contract signed (\d+) days after notification of award$/,
    bn: "চুক্তির নোটিফিকেশনের $1 দিন পর চুক্তি সই" },
  { re: /^its eligibility wording recurs verbatim in ([\d,]+) tenders$/,
    bn: "এর যোগ্যতার ভাষা হুবহু $1টি দরপত্রে ফিরে এসেছে" },
  { re: /^that firm holds (\d+) contracts worth Tk ([\d.,]+) cr across (\d+) of the six authorities$/,
    bn: "সেই প্রতিষ্ঠানের হাতে ছয় সংস্থার $3টিতে $1টি চুক্তি, মূল্য $2 কোটি টাকা" },
  { re: /^that firm holds (\d+) contracts worth Tk ([\d.,]+) lac across (\d+) of the six authorities$/,
    bn: "সেই প্রতিষ্ঠানের হাতে ছয় সংস্থার $3টিতে $1টি চুক্তি, মূল্য $2 লাখ টাকা" },
  { re: /^(?:notice requires )?single past contract of ([\d.,]+)% of this contract required$/,
    bn: "এই চুক্তির $1% মূল্যের একটিমাত্র পূর্ব চুক্তি চাওয়া হয়েছে" },
  { re: /^(?:notice requires )?single past contract of >=([\d.,]+)% of this contract required$/,
    bn: "এই চুক্তির অন্তত $1% মূল্যের একটিমাত্র পূর্ব চুক্তি চাওয়া হয়েছে" },
  { re: /^notice requires financial bar ([\d.,]+)% of contract value$/,
    bn: "বিজ্ঞপ্তিতে আর্থিক সীমা চুক্তিমূল্যের $1%" },
  { re: /^notice requires financial bar ([\d.,]+)x contract value$/,
    bn: "বিজ্ঞপ্তিতে আর্থিক সীমা চুক্তিমূল্যের $1 গুণ" },
  { re: /^(?:notice requires )?(\d+) separate document types demanded$/,
    bn: "$1 ধরনের আলাদা নথি চাওয়া হয়েছে" },
  { re: /^(?:notice requires )?(\d+) similar completed contracts$/,
    bn: "$1টি সমজাতীয় সম্পন্ন চুক্তি চাওয়া হয়েছে" },
  { re: /^(?:notice requires )?(\d+) years general experience$/,
    bn: "$1 বছরের সাধারণ অভিজ্ঞতা চাওয়া হয়েছে" },
  { re: /^(?:notice requires )?experience only counts if within (\d+) years$/,
    bn: "অভিজ্ঞতা গণ্য হবে কেবল $1 বছরের মধ্যেকার হলে" },
  { re: /^a joint venture of (\d+) declared partners$/,
    bn: "$1 জন ঘোষিত অংশীদারের যৌথ উদ্যোগ" },
  { re: /^a field of (\d+) shrinking to one responsive bidder is the pattern the theory predicts$/,
    bn: "$1টির প্রতিযোগিতা সংকুচিত হয়ে একজন গ্রহণযোগ্য দরদাতায় নেমে আসা — তত্ত্ব ঠিক এই ধরনটিই আগে থেকে বলে" },
  { re: /^request the recorded reason each of the (\d+) rejected bids was ruled non-responsive$/,
    bn: "বাদ পড়া $1টি দরপত্রের প্রতিটি কেন অগ্রহণযোগ্য হলো, তার লিপিবদ্ধ কারণ চাওয়া হোক" },
  /* @1 and not $1: a clause number is typed into a search box, not read aloud,
     so it keeps the digits the rulebook prints it with in both editions. */
  { re: /^ask why no contract award notice was published for an awarded tender \(ITT ([\d.]+) requires it\)$/,
    bn: "চুক্তি হয়ে যাওয়া একটি দরপত্রের চুক্তির বিজ্ঞপ্তি কেন প্রকাশিত হয়নি তা জানতে চাওয়া হোক (<code>ITT @1</code> অনুযায়ী তা বাধ্যতামূলক)" },
  { re: /^restriction score ([\d.,]+) with (\d+) bid\(s\) received and (\d+) responsive$/,
    bn: "সীমাবদ্ধতার স্কোর $1, দর জমা $2টি, গ্রহণযোগ্য $3টি" },
  { re: /^restriction score ([\d.,]+) bid counts not published so the link is untestable$/,
    bn: "সীমাবদ্ধতার স্কোর $1; দর জমার সংখ্যা প্রকাশিত নয়, তাই সম্পর্কটি পরীক্ষা করা যায় না" },
  { re: /^no restriction-to-competition link identified$/,
    bn: "সীমাবদ্ধতা ও প্রতিযোগিতার মধ্যে কোনো সম্পর্ক চিহ্নিত হয়নি" },

  /* details.json — evidence_page_numbers, the page each figure was read from. */
  { re: /^eligibility p\.(\d+)$/, bn: "যোগ্যতার শর্ত পৃ. $1" },
  { re: /^contract value p\.(\d+)$/, bn: "চুক্তিমূল্য পৃ. $1" },
  { re: /^winner p\.(\d+)$/, bn: "বিজয়ী পৃ. $1" },
  { re: /^bid counts p\.(\d+)$/, bn: "দর জমার সংখ্যা পৃ. $1" },

  /* details.json — the winner clause, and the only shape whose capture is a name
     rather than a measurement. It is marked open because a company's registered
     name can carry a full stop inside it — M/S. Shahid Brothers — so the clause
     after the split has to be glued back on. @1 puts the name on the page exactly
     as the award notice printed it: nothing here is transliterated, because a
     firm spelled in Bangla of our own choosing could not be looked up in any
     register. */
  { re: /^awarded to (.+)$/, open: true,
    bn: "চুক্তি পেয়েছে <span class=\"verbatim\">@1</span>" },

  /* details.json — the two rows whose extraction was corrected after checking
     the page again. The note says what had been read wrong, what the notice
     actually prints, and what the rule then came out as. It is kept because a
     correction a reader cannot see is not a correction.

     Every figure here is a capture, so nothing is restated in Bangla: the
     erroneous machine reading stays in <code> in the notation it was written in,
     and the notice's own line — with its bracketed words and its abbreviation —
     stays as printed. The abbreviation is why the "Notice states" clause is
     marked open: "Tk." ends in a full stop, and the fragment after the split has
     to be glued back on before the shape can match. */
  { re: /^Notice states Tk$/, open: true, bn: "বিজ্ঞপ্তিতে লেখা" },
  { re: /^Notice states liquid assets Tk$/, open: true,
    bn: "বিজ্ঞপ্তিতে তরল সম্পদ লেখা" },
  { re: /^Notice states Tk\. (.+)$/,
    bn: "বিজ্ঞপ্তিতে লেখা <span class=\"verbatim\">Tk. @1</span>" },
  { re: /^Notice states liquid assets Tk\. (.+)$/,
    bn: "বিজ্ঞপ্তিতে তরল সম্পদ লেখা <span class=\"verbatim\">Tk. @1</span>" },
  { re: /^financial bar had been extracted as BDT (\S+) \(ratio ([\d.,]+)\) by applying the Lac multiplier to the already complete numeral ([\d,]+)$/,
    bn: "আর্থিক সীমা <code>BDT @1</code> হিসেবে পড়া হয়েছিল (অনুপাত $2) — $3 সংখ্যাটি নিজেই পূর্ণ, তার উপর আবার লাখের গুণক বসানো হয়েছিল" },
  { re: /^financial bar had been extracted as BDT (\S+) \(ratio ([\d.,]+)\) by applying the Lac multiplier to an already complete numeral AND by reading item \(c\) Minimum Tender Capacity instead of item \(b\) liquid assets$/,
    bn: "আর্থিক সীমা <code>BDT @1</code> হিসেবে পড়া হয়েছিল (অনুপাত $2) — সংখ্যাটি নিজেই পূর্ণ, তার উপর আবার লাখের গুণক বসানো হয়েছিল, আর <span class=\"verbatim\">item (b) liquid assets</span>-এর বদলে পড়া হয়েছিল <span class=\"verbatim\">item (c) Minimum Tender Capacity</span> ঘরটি" },
  { re: /^ratio ([\d.,]+)x$/, bn: "অনুপাত $1×" },

  /* ---------------------------------------------------------------------------
     deviations.json — the observed and required columns of the per-tender rules
     table. One row per rule per tender, so a shape here is read about a thousand
     times and every figure in it has to be a capture: these strings carry the
     tender's own bid counts, its contract value and the corpus totals, and a
     number typed into this file would be a second, unaudited copy of a measured
     one.

     The clause locators — ITT, JICA, Rule — are @-captures, which keeps them in
     the script they are typed in. A reader who wants the clause reads it in the
     standard document, where it is printed exactly this way. */
  { re: /^bids received (\d+), responsive (\d+)$/,
    bn: "দর জমা পড়েছে $1টি, গ্রহণযোগ্য $2টি" },
  { re: /^(\d+) amendment\(s\)$/, bn: "$1টি সংশোধনী" },
  { re: /^contract value BDT ([\d,]+(?:\.\d+)?)$/, bn: "চুক্তিমূল্য $1 টাকা" },
  { re: /^BDT ([\d.,]+) crore awarded under National Competitive Tendering$/,
    bn: "জাতীয় প্রতিযোগিতামূলক দরপত্রে $1 কোটি টাকার চুক্তি" },
  { re: /^floor is BDT ([\d.,]+) Lac$/, bn: "সর্বনিম্ন সীমা $1 লাখ টাকা" },

  { re: /^ITT ([\d.]+) says (\d+) days$/,
    bn: "<code>ITT @1</code> বলছে $2 দিন" },
  { re: /^ITT ([\d.]+)\(b\) permits rejection of all tenders$/,
    bn: "<code>ITT @1(b)</code> অনুযায়ী সব দর বাতিল করা যায়" },
  { re: /^ITT ([\d.]+) preserves the award at market price$/,
    bn: "<code>ITT @1</code> বাজারদরে চুক্তিটি বহাল রাখে" },
  { re: /^ITT ([\d.]+)\(f\) sits in the Goods standard document$/,
    bn: "<code>ITT @1(f)</code> রয়েছে পণ্যের আদর্শ দস্তাবেজে" },
  { re: /^(\d+)\/(\d+)\/(\d+) working days by value band, per Rule ([\d.]+)\((\d+)\)$/,
    bn: "মূল্যস্তর অনুযায়ী $1/$2/$3 কার্যদিবস (<code>Rule @4(@5)</code>)" },
  { re: /^direct comparison of the evaluated price with the official cost estimate, ([\d.]+)% threshold$/,
    bn: "মূল্যায়িত দরের সঙ্গে সরকারি প্রাক্কলিত ব্যয়ের সরাসরি তুলনা, সীমা $1%" },
  { re: /^deadline shall be extended by at least (\d+) working days if the addendum lands in the final third$/,
    bn: "সংশোধনী যদি সময়ের শেষ এক-তৃতীয়াংশে আসে, তবে সময়সীমা অন্তত $1 কার্যদিবস বাড়াতে হবে" },
  { re: /^JICA ([\d.]+) binds ([\d,]+) of ([\d,]+) tenders$/,
    bn: "<code>JICA @1</code> প্রযোজ্য $3টি দরপত্রের মধ্যে $2টিতে" },
  { re: /^JICA ([\d.]+) benchmark only$/,
    bn: "কেবল <code>JICA @1</code>-এর মানদণ্ড" },

  /* The portal's status field, whatever it happens to hold. The clean value has
     its own entry above and is matched first; this shape is here for the rows
     where a line of the page came away with the status — "Contract Awarded
     Station/Generator/So" — and it prints that as filed rather than tidying it,
     because tidying it would mean deciding what the portal meant. */
  { re: /^status '(.+)' but no award notice in the portal print$/,
    bn: "অবস্থা <span class=\"verbatim\">@1</span>, কিন্তু পোর্টালের ছাপায় চুক্তির কোনো বিজ্ঞপ্তি নেই" },

  /* The ownership test's finding, matched against the whole string rather than
     clause by clause: the names are semicolon-separated and a split would tear
     the list apart. Everything after the colon is a person's name as an award
     notice spells it, so it is printed and never transliterated. */
  { re: /^ownership disclosed: (.+)$/,
    bn: "মালিকানা প্রকাশিত: <span class=\"verbatim\">@1</span>" },
];

/* -------------------------------------------------------------- proper names
   The Bangla edition carries no English. Everything a page prints therefore
   needs a Bangla form, and the names of the authorities and the districts they
   work in are the places where an English string would otherwise leak into a
   Bangla sentence — the notices are filed in English, so that is how the data
   holds them.

   These are renderings of the same names, not new facts: রাজউক and RAJUK are one
   authority, and nothing outside the documents is being added by writing it in
   the other alphabet. Two kinds of string are deliberately NOT in here and are
   printed exactly as the government's own documents print them, in both
   editions — a quotation from a page, and the registered name of a company. A
   quotation that has been translated is no longer evidence, and a firm named in
   a Bangla spelling of our own choosing could not be looked up in any register.
   The line under every quoted passage says so on the page.

   Anything absent from these maps falls back to the printed string, so a new
   authority appearing in the data shows up as itself rather than vanishing. */

export const NAMES = {
  /* The short form the source line prints. */
  agency: {
    RAJUK: { en: "RAJUK", bn: "রাজউক" },
    CDA: { en: "CDA", bn: "সিডিএ" },
    COXDA: { en: "COXDA", bn: "কউক" },
    KDA: { en: "KDA", bn: "কেডিএ" },
    RDA: { en: "RDA", bn: "আরডিএ" },
    GDA: { en: "GDA", bn: "জিডিএ" },
    /* Not an authority. build.py files the five standard documents under this
       key because they belong to no tendering office, and the file index shows
       them as their own row. */
    RULEBOOK: { en: "RULEBOOK", bn: "আদর্শ দস্তাবেজ" },
  },

  /* The authority as a sentence names it. */
  org: {
    "Rajdhani Unnayan Kartripakkha (RAJUK)": { en: "Rajdhani Unnayan Kartripakkha (RAJUK)", bn: "রাজধানী উন্নয়ন কর্তৃপক্ষ (রাজউক)" },
    "Chittagong Development Authority": { en: "Chittagong Development Authority", bn: "চট্টগ্রাম উন্নয়ন কর্তৃপক্ষ" },
    "Cox's Bazar Development Authority": { en: "Cox's Bazar Development Authority", bn: "কক্সবাজার উন্নয়ন কর্তৃপক্ষ" },
    "Khulna Development Authority (KDA)": { en: "Khulna Development Authority (KDA)", bn: "খুলনা উন্নয়ন কর্তৃপক্ষ" },
    "Rajshahi Development Authority": { en: "Rajshahi Development Authority", bn: "রাজশাহী উন্নয়ন কর্তৃপক্ষ" },
    "Gazipur Development Authority": { en: "Gazipur Development Authority", bn: "গাজীপুর উন্নয়ন কর্তৃপক্ষ" },

    /* Not one of the six. Nine notices in the set carry an Agency line naming a
       different public body, and every scene prints the line the document itself
       carries rather than the folder it sat in — so those bodies need names too.
       Each is translated as printed and no further: the fourth of these prints
       "Local Government Engineering" without the word that would normally follow
       it, and it is left that way rather than completed on our own authority. */
    "Bangladesh Water Development Board": { en: "Bangladesh Water Development Board", bn: "বাংলাদেশ পানি উন্নয়ন বোর্ড" },
    "Department of Public Health Engineering": { en: "Department of Public Health Engineering", bn: "জনস্বাস্থ্য ইঞ্জিনিয়ারিং অধিদপ্তর" },
    "Roads & Highways Department (RHD)": { en: "Roads & Highways Department (RHD)", bn: "সড়ক ও জনপথ অধিদপ্তর" },
    "Local Government Engineering": { en: "Local Government Engineering", bn: "স্থানীয় সরকার ইঞ্জিনিয়ারিং" },
    "Power Grid Company of Bangladesh Ltd.": { en: "Power Grid Company of Bangladesh Ltd.", bn: "পাওয়ার গ্রিড কোম্পানি অব বাংলাদেশ লিমিটেড" },
    "Zilla Parishad, Sirajganj": { en: "Zilla Parishad, Sirajganj", bn: "জেলা পরিষদ, সিরাজগঞ্জ" },

    /* One notice prints its Agency line with the form's own label spliced
       through the middle of the name. It is RAJUK — the words are all there, in
       the wrong order — so both editions show the name unspliced. This is the
       only entry in NAMES that repairs rather than translates. */
    "Rajdhani Unnayan Procuring Entity Name office of the Chief Kartripakkha (RAJUK) : Engineer ( Project & Design)":
      { en: "Rajdhani Unnayan Kartripakkha (RAJUK)", bn: "রাজধানী উন্নয়ন কর্তৃপক্ষ (রাজউক)" },
  },

  /* Districts. Both spellings of Chattogram appear in the notices; both are the
     same district and both print the same Bangla name. */
  place: {
    Dhaka: { en: "Dhaka", bn: "ঢাকা" },
    Chattogram: { en: "Chattogram", bn: "চট্টগ্রাম" },
    Chittagong: { en: "Chittagong", bn: "চট্টগ্রাম" },
    "Cox's Bazar": { en: "Cox's Bazar", bn: "কক্সবাজার" },
    Khulna: { en: "Khulna", bn: "খুলনা" },
    Rajshahi: { en: "Rajshahi", bn: "রাজশাহী" },
    Gazipur: { en: "Gazipur", bn: "গাজীপুর" },
    Dinajpur: { en: "Dinajpur", bn: "দিনাজপুর" },
    Comilla: { en: "Comilla", bn: "কুমিল্লা" },
    Satkhira: { en: "Satkhira", bn: "সাতক্ষীরা" },
    Barisal: { en: "Barisal", bn: "বরিশাল" },
    Bagerhat: { en: "Bagerhat", bn: "বাগেরহাট" },
    Narayanganj: { en: "Narayanganj", bn: "নারায়ণগঞ্জ" },
    /* Three districts this map did not yet have. Each appears once in the whole
       set, and a single notice is still a scene somebody may open. */
    Laksmipur: { en: "Laksmipur", bn: "লক্ষ্মীপুর" },
    Sirajganj: { en: "Sirajganj", bn: "সিরাজগঞ্জ" },
    Pabna: { en: "Pabna", bn: "পাবনা" },
  },

  /* How the tender was run, and whose money paid for it. Both are printed in a
     handful of fixed forms, with capitalisation that varies between notices. */
  method: {
    "open tendering method (otm)": { en: "Open Tendering Method (OTM)", bn: "উন্মুক্ত দরপত্র পদ্ধতি (ওটিএম)" },
    "open tendering method": { en: "Open Tendering Method", bn: "উন্মুক্ত দরপত্র পদ্ধতি" },
    "limited tendering method (ltm)": { en: "Limited Tendering Method (LTM)", bn: "সীমিত দরপত্র পদ্ধতি (এলটিএম)" },
    "request for quotation method (rfq)": { en: "Request for Quotation (RFQ)", bn: "উদ্ধৃতি আহ্বান পদ্ধতি (আরএফকিউ)" },
    "selection under a fixed budget (sfb)": { en: "Selection under a Fixed Budget (SFB)", bn: "নির্দিষ্ট বাজেটে নির্বাচন (এসএফবি)" },
    "quality cost based selection (qcbs)": { en: "Quality Cost Based Selection (QCBS)", bn: "গুণ ও ব্যয়ভিত্তিক নির্বাচন (কিউসিবিএস)" },
  },

  funds: {
    "own fund": { en: "Own fund", bn: "নিজস্ব তহবিল" },
    government: { en: "Government", bn: "সরকারি" },
    "revenue government": { en: "Revenue, Government", bn: "রাজস্ব, সরকারি" },
    "government, own fund": { en: "Government, own fund", bn: "সরকারি ও নিজস্ব তহবিল" },
    "government, aid or grant": { en: "Government, aid or grant", bn: "সরকারি, সহায়তা বা অনুদান" },
  },

  /* The works the article names. A road has a name, and a Bangla sentence should
     be able to say it: the portal prints these in English because the portal is
     an English-language system, not because the road is called that in Bangla.

     Only the works this article names in a sentence are here. The rest of the
     set keeps the printed spelling everywhere it is listed, because a table of
     1,155 packages is a record to be checked against the notices, not prose. */
  work: {
    "chattogram city outer ring road (patenga to sagorika)": {
      en: "Chattogram City Outer Ring Road (Patenga to Sagorika)",
      bn: "চট্টগ্রাম সিটি আউটার রিং রোড (পতেঙ্গা থেকে সাগরিকা)",
    },
    "construction of connecting road from natore road (ruet) to rajshahi by-pass road (1st revised)": {
      en: "Construction of Connecting Road From Natore Road (RUET) To Rajshahi By-Pass Road (1st Revised)",
      bn: "নাটোর সড়ক (রুয়েট) থেকে রাজশাহী বাইপাস সড়ক পর্যন্ত সংযোগ সড়ক নির্মাণ (প্রথম সংশোধিত)",
    },
    "widening and improvement of khulna shipyard road.": {
      en: "Widening and Improvement of Khulna Shipyard Road",
      bn: "খুলনা শিপইয়ার্ড সড়ক প্রশস্তকরণ ও উন্নয়ন",
    },
    "supply installation testing and commissioning of fire protection system hydrent system of cda saltgola shopping mall": {
      en: "Supply, installation, testing and commissioning of the fire protection system of the CDA Saltgola Shopping Mall",
      bn: "সিডিএ সল্টগোলা শপিং মলের অগ্নিনির্বাপণ ব্যবস্থা সরবরাহ, স্থাপন, পরীক্ষা ও চালুকরণ",
    },
    "uttara residential model town (3rd phase)": {
      en: "Uttara Residential Model Town (3rd Phase)",
      bn: "উত্তরা আবাসিক মডেল টাউন (তৃতীয় পর্ব)",
    },
    "supply & installation of street light led from avenue 3 part up to baribad at uttara residential model town phase-3.": {
      en: "Supply and installation of LED street lighting from Avenue 3 to Baribad, Uttara Residential Model Town Phase 3",
      bn: "উত্তরা আবাসিক মডেল টাউন তৃতীয় পর্বে অ্যাভিনিউ ৩ থেকে বাড়িবাদ পর্যন্ত এলইডি সড়কবাতি সরবরাহ ও স্থাপন",
    },
  },

  /* The firms the article names in a sentence, and the ones the two firm charts
     plot: the fifteen largest by contract value and the eight that won most
     often. These are Bangladeshi companies whose names the portal romanises;
     writing them in Bangla restores the spelling a Bangla reader expects rather
     than inventing anything. The printed English spelling is what every table,
     the search and the per-tender record still carry, so a name in a sentence
     can always be matched back to the notice it came from.

     Two entries are deliberately not spelled alike. "Sany" and "Sunny" are two
     different companies, and a single Bangla spelling for both would merge two
     firms on the strength of a resemblance — the one thing the normalisation
     rules for this investigation forbid. They are transliterated apart. */
  firm: {
    "spectra engineers ltd.": { en: "Spectra Engineers Ltd.", bn: "স্পেকট্রা ইঞ্জিনিয়ার্স লিমিটেড" },
    "abdul monem ltd": { en: "Abdul Monem Ltd", bn: "আব্দুল মোনেম লিমিটেড" },
    "ataur rahman khan ltd & mahabub brothers (pvt) ltd jv": {
      en: "Ataur Rahman Khan Ltd & Mahabub Brothers (Pvt) Ltd JV",
      bn: "আতাউর রহমান খান লিমিটেড ও মাহবুব ব্রাদার্স (প্রাইভেট) লিমিটেড জেভি",
    },
    "mahabub brothers (pvt) limited": {
      en: "Mahabub Brothers (Pvt) Limited", bn: "মাহবুব ব্রাদার্স (প্রাইভেট) লিমিটেড",
    },
    "national development engineers ltd.": {
      en: "National Development Engineers Ltd.", bn: "ন্যাশনাল ডেভেলপমেন্ট ইঞ্জিনিয়ার্স লিমিটেড",
    },
    "national development engineers ltd. - m/s. niaz traders jv (nde-nt jv)": {
      en: "National Development Engineers Ltd. – M/S. Niaz Traders JV",
      bn: "ন্যাশনাল ডেভেলপমেন্ট ইঞ্জিনিয়ার্স লিমিটেড – মেসার্স নিয়াজ ট্রেডার্স জেভি",
    },
    "the united construction co.": {
      en: "The United Construction Co.", bn: "দ্য ইউনাইটেড কনস্ট্রাকশন কোম্পানি",
    },
    "m jamal & company limited": {
      en: "M Jamal & Company Limited", bn: "এম জামাল অ্যান্ড কোম্পানি লিমিটেড",
    },
    "momotaj engineers ltd.": { en: "Momotaj Engineers Ltd.", bn: "মমতাজ ইঞ্জিনিয়ার্স লিমিটেড" },
    "taher brothers ltd.": { en: "Taher Brothers Ltd.", bn: "তাহের ব্রাদার্স লিমিটেড" },
    "dienco-mir akhter jv": { en: "Dienco – Mir Akhter JV", bn: "ডিয়েনকো – মীর আখতার জেভি" },
    "the engineers & architects limited": {
      en: "The Engineers & Architects Limited", bn: "দ্য ইঞ্জিনিয়ার্স অ্যান্ড আর্কিটেক্টস লিমিটেড",
    },
    "toma construction & co. limited": {
      en: "Toma Construction & Co. Limited", bn: "তমা কনস্ট্রাকশন অ্যান্ড কোং লিমিটেড",
    },
    "ih-rse-shj (jv)": { en: "IH – RSE – SHJ (JV)", bn: "আইএইচ – আরএসই – এসএইচজে (জেভি)" },
    "m/s udayan builders": { en: "M/S Udayan Builders", bn: "মেসার্স উদয়ন বিল্ডার্স" },
    "electromech automation services ltd": {
      en: "Electromech Automation Services Ltd",
      bn: "ইলেকট্রোমেক অটোমেশন সার্ভিসেস লিমিটেড",
    },
    "m/s. a. r. enterprise": { en: "M/S. A. R. Enterprise", bn: "মেসার্স এ. আর. এন্টারপ্রাইজ" },
    "m/s. sany construction": { en: "M/S. Sany Construction", bn: "মেসার্স স্যানি কনস্ট্রাকশন" },
    "m/s sunny construction": { en: "M/S Sunny Construction", bn: "মেসার্স সানি কনস্ট্রাকশন" },
    "aliza enterprise": { en: "Aliza Enterprise", bn: "আলিজা এন্টারপ্রাইজ" },
    "nahar construction": { en: "Nahar Construction", bn: "নাহার কনস্ট্রাকশন" },
    "concept elevators & engineering ltd.": {
      en: "Concept Elevators & Engineering Ltd.", bn: "কনসেপ্ট এলিভেটরস অ্যান্ড ইঞ্জিনিয়ারিং লিমিটেড",
    },
    "t.s enterprise": { en: "T.S Enterprise", bn: "টি.এস এন্টারপ্রাইজ" },
    "m/s molla & brothers": { en: "M/S Molla & Brothers", bn: "মেসার্স মোল্লা অ্যান্ড ব্রাদার্স" },
  },
};

/* ---------------------------------------------------------- exhibit captions

   Four documents are quoted at length in the article. Each carries two pieces of
   our own writing — the caption above the quote and the reading below it — and
   those are written twice, here, because a Bangla reader should not be handed an
   English caption over a document.

   The quote itself is never in this file. It is lifted from the CSV at build
   time, misspellings and all, and stays in the language it was printed in.

   Keyed by tender id and the column the words were read out of, which is how the
   exhibit identifies itself in the data. build.py also writes an English caption
   into corpus.json; story.js falls back to that, so a fifth exhibit renders in
   English rather than not at all if nobody has written its Bangla yet. */

export const EXHIBIT_WORDS = {
  "199942|amendment_old_to_new": {
    label: {
      en: "An amendment says the conditions were changed to get the right kind of bidder",
      bn: "একটি সংশোধনীতে লেখা, উপযুক্ত ধরনের দরদাতা পাওয়ার জন্য শর্ত বদলানো হয়েছে",
    },
    reading: {
      en: "The correction notice gives the reason in the office's own words. It does not say which company, and no document here names one.",
      bn: "সংশোধনী বিজ্ঞপ্তিতে কারণটি অফিসের নিজের ভাষাতেই লেখা। কোন প্রতিষ্ঠানের কথা বলা হচ্ছে তা লেখা নেই, আর এখানকার কোনো নথিতেও কারও নাম নেই।",
    },
  },
  "644083|amendment_old_to_new": {
    label: {
      en: "The deposit needed to bid was cut tenfold after publication",
      bn: "বিজ্ঞপ্তি প্রকাশের পর দর দেওয়ার জামানত দশ ভাগের এক ভাগে নামানো হয়",
    },
    reading: {
      en: "An amendment moved the tender security from BDT 830,000 to BDT 83,000. The notice gives no reason. Two firms bid.",
      bn: "একটি সংশোধনীতে দরপত্র জামানত ৮,৩০,০০০ টাকা থেকে ৮৩,০০০ টাকায় নামানো হয়। বিজ্ঞপ্তিতে কোনো কারণ লেখা নেই। দর দিয়েছিল দুটি প্রতিষ্ঠান।",
    },
  },
  "644083|evidence_excerpt_price_band": {
    label: {
      en: "A price more than 10% either side of an unpublished estimate is rejected",
      bn: "অপ্রকাশিত প্রাক্কলনের ১০% বেশি উপরে বা নিচে হলে দর বাতিল",
    },
    reading: {
      en: "The estimate this band is measured from is not published in any document here, so a bidder cannot know the target it has to hit.",
      bn: "যে প্রাক্কলন থেকে এই সীমা মাপা হয়, তা এখানকার কোনো নথিতেই প্রকাশিত নয় — ফলে দরদাতা জানতেই পারে না তাকে কোন লক্ষ্যে পৌঁছাতে হবে।",
    },
  },
  "514221|evidence_excerpt_eligibility": {
    label: {
      en: "Five conditions stacked on a BDT 10.45 lakh supply package",
      bn: "১০.৪৫ লাখ টাকার একটি সরবরাহ কাজে পাঁচটি শর্ত একের ওপর এক",
    },
    reading: {
      en: "One bid was received and it won. Whether the conditions caused that is not established by any document here.",
      bn: "একটিই দর জমা পড়েছিল, সেটিই জিতেছে। শর্তগুলোর কারণেই তা হয়েছে কি না, এখানকার কোনো নথি তা প্রতিষ্ঠিত করে না।",
    },
  },
};


/* -------------------------------------------------------------------- header */

export const HEAD = {
  kicker: { en: "e-GP Watch · Public procurement", bn: "e-GP ওয়াচ · সরকারি ক্রয়" },
  /* The headline is the finding, and it is a rule rather than a characterisation:
     {{estimate.two_sided}} of the notices in this set reject a price that falls
     more than ten per cent BELOW the government's own cost estimate, and that
     estimate is printed in none of the {{counts.pdfs}} documents. Both halves
     are on the page — the percentage is quoted from each notice's own sentence,
     and the absence of the estimate is what makes {{estimate.lowest_price_test.tested}}
     of the audit's price tests unrunnable.

     It says "you lose" rather than "the tender is rejected" because a reader who
     has never bid for public work still knows what losing is; the technical
     phrase is in the finding underneath, where it belongs.

     The deck then does the counting the headline refuses to do, and it does it
     in prose with verbs rather than as a row of figures, because three zeros
     set as display type read as a dashboard tile and were rejected as one. */
  hed: {
    en: "Bid below the government's estimate and you lose the work. The estimate is published nowhere.",
    bn: "সরকারি প্রাক্কলনের চেয়ে কম দর দিলে কাজ হারাতে হয়। প্রাক্কলনটি কোথাও প্রকাশিত নয়।",
  },
  dek: {
    en: "We read every page of {{counts.pdfs|n}} procurement documents from six of Bangladesh's urban development authorities — {{counts.notices|n}} tender notices and {{counts.awards|n}} contract awards covering {{money.crore|cr}}. {{estimate.band_notices|n}} of those notices declare that any price more than {{estimate.width_common|n}} per cent above or below the official cost estimate will be rejected outright. The estimate itself appears in none of the documents, which is also why the audit could run {{estimate.lowest_price_test.tested|n}} tests of whether the winning price was too high and complete none of them.",
    bn: "বাংলাদেশের ছয়টি নগর উন্নয়ন সংস্থার {{counts.pdfs|n}}টি ক্রয়-নথির প্রতিটি পৃষ্ঠা আমরা পড়েছি — {{counts.notices|n}}টি দরপত্র বিজ্ঞপ্তি ও {{counts.awards|n}}টি চুক্তির নথি, মোট {{money.crore|cr}} টাকার কাজ। এর {{estimate.band_notices|n}}টি বিজ্ঞপ্তিতে লেখা আছে, সরকারি প্রাক্কলিত ব্যয়ের {{estimate.width_common|n}} শতাংশ উপরে বা নিচের যেকোনো দর সরাসরি বাতিল। অথচ প্রাক্কলনটি কোনো নথিতেই নেই — আর সেই কারণেই বিজয়ী দর বেশি ছিল কি না, তা যাচাইয়ের {{estimate.lowest_price_test.tested|n}}টি পরীক্ষা শুরু করা গেলেও একটিও শেষ করা যায়নি।",
  },
  byline: { en: "AL AMIN TUSHER", bn: "আল আমিন তুষার" },
  /* The portrait is a file in this repository; the initials sit behind it and
     show only if that file ever goes missing. */
  portrait: "site/assets/reporter.jpg",
  initials: "AT",
  role: {
    en: "Reporting, data and analysis",
    bn: "প্রতিবেদন, ডেটা ও বিশ্লেষণ",
  },
};

/* --------------------------------------------------------------- the opening
   One tender, told as a scene, before the article widens to all {{counts.tenders}}
   of them. build.py chooses it with a published rule and hands the row to the
   page as corpus.case; every figure below is a token off that row, so the scene
   cannot drift from the data.

   `tender` is the one thing here that is pinned rather than filled: these
   paragraphs are about a particular road in Chattogram, and if the rule ever
   selected a different tender the prose would quietly become wrong about it.
   The page checks the id and says so on the page instead. Every other
   tender-specific number, name and date is a {{case.*}} token.

   The paraphrases of the job and of the conditions are ours, and they are
   faithful to the two pages linked in the source line under the scene: the
   conditions themselves are quoted verbatim in between, unedited, marker and
   all, so a reader never has to take our summary on trust. */

export const CASE = {
  tender: "538256",

  words: {
    quoteLabel: {
      en: "From the notice: who was allowed to bid",
      bn: "বিজ্ঞপ্তি থেকে: কারা দর দিতে পারবে",
    },
    quoteRead: {
      en: "The work on offer included one kilometre of four-lane road. The proof demanded was a finished five-kilometre four-lane highway worth {{case.similar_pct|pct0}} of this entire contract, and a kilometre of waterside walkway on top of it. Nothing in the two published pages explains how those figures were arrived at, and nothing requires them to.",
      bn: "যে কাজের জন্য দর চাওয়া হয়েছে তার মধ্যে চার লেনের সড়ক এক কিলোমিটার। প্রমাণ হিসেবে চাওয়া হয়েছে শেষ হয়ে যাওয়া পাঁচ কিলোমিটার চার লেনের হাইওয়ে, যার মূল্য এই পুরো চুক্তির {{case.similar_pct|pct0}}; তার সঙ্গে এক কিলোমিটার জলতীরবর্তী হাঁটাপথ। এই সংখ্যাগুলো কীভাবে ঠিক হলো, প্রকাশিত দুই পৃষ্ঠার কোথাও তার ব্যাখ্যা নেই — আর ব্যাখ্যা দিতে হবে, এমন বাধ্যবাধকতাও নেই।",
    },
    bids: { en: "Bids submitted", bn: "জমা পড়া দর" },
    responsive: { en: "Ruled responsive", bn: "গ্রহণযোগ্য বিবেচিত" },
    signed: { en: "Contract signed", bn: "চুক্তি স্বাক্ষর" },
    sold: { en: "Documents bought", bn: "নথি কিনেছে" },
    rejected: { en: "Bids set aside", bn: "সরিয়ে রাখা দর" },
    noa: { en: "Award issued", bn: "কাজের চিঠি" },
    days: { en: "Days to signing", bn: "স্বাক্ষরে লাগা দিন" },
    overrun: { en: "Days past the limit", bn: "সীমার পরে দিন" },
    liquid: { en: "Cash demanded", bn: "দাবি করা নগদ" },
    winnerRec: { en: "Contract went to", bn: "কাজ পেয়েছে" },

    /* The rows the later scenes turn on. Each names a field the case carries;
       the three yes/no/unanswered words exist so the portal's own one-word
       answer can be printed as a word in either edition rather than as the
       string the column happens to hold. */
    peerSize: { en: "Notices most like it", bn: "সবচেয়ে মেলে এমন বিজ্ঞপ্তি" },
    peerMedian: { en: "Their middle bid count", bn: "তাদের দরের মাঝের মান" },
    shared: { en: "Sentences shared", bn: "ভাগ করা বাক্য" },
    reuse: { en: "Notices carrying it", bn: "যত বিজ্ঞপ্তিতে আছে" },
    cap: { en: "Days the law allows", bn: "আইনে প্রাপ্য দিন" },
    certified: { en: "Signed in due time, per the portal", bn: "পোর্টাল বলছে যথাসময়ে স্বাক্ষর" },
    yes: { en: "Yes", bn: "হ্যাঁ" },
    no: { en: "No", bn: "না" },
    unanswered: { en: "Not answered", bn: "উত্তর নেই" },
    share: { en: "Share of all contract money", bn: "মোট চুক্তি-অর্থের হার" },
    stages: { en: "Conditions met, of seven", bn: "সাতটির মধ্যে পূরণ" },
    score: { en: "Our priority score", bn: "আমাদের অগ্রাধিকার স্কোর" },
    rejectRate: { en: "Share of the field set aside", bn: "সরিয়ে রাখা দরের হার" },
    ruleLabel: {
      en: "How this tender was selected",
      bn: "এই দরপত্রটি যেভাবে বাছাই করা হয়েছে",
    },
    /* The evidence in the case studies is the document's own text with the
       operative words marked. This line says so, once, wherever a marked
       passage appears, because a reader is entitled to know that the passage
       is the page and the marker is ours. */
    markNote: {
      en: "Quoted from the page as published; the highlight is ours.",
      bn: "প্রকাশিত পৃষ্ঠা থেকে হুবহু উদ্ধৃত; দাগ দেওয়াটি আমাদের।",
    },
    /* The scene is written about one road. If the data moves and the rule
       returns a different tender, the page says so where the scene would have
       been — the two ids appended by the caller — rather than telling a story
       about a road it is no longer describing. */
    mismatch: {
      en: "The opening case study is written about a specific tender, and the selection rule no longer returns it, so the scene is not shown. Written about, then selected:",
      bn: "শুরুর কেস স্টাডিটি একটি নির্দিষ্ট দরপত্র নিয়ে লেখা, এবং বাছাইয়ের নিয়ম এখন সেটি দিচ্ছে না — তাই দৃশ্যটি দেখানো হচ্ছে না। যেটি নিয়ে লেখা, এবং যেটি বাছাই হয়েছে:",
    },
  },

  open: [
    {
      en: "At Uttar Patenga and Halishahar in Chattogram, a link road a little over a kilometre long was to be built, along with a kilometre of four-lane feeder road, drains and culverts, embankment protection, a concrete walkway and a new indoor games complex. On {{case.published|date}} the {{case.organization|org}} published a two-page notice asking companies to bid for the work, part of a project called {{case.project|work}} and part-funded by a development partner. The notice said what the job was, that bids would close on {{case.closed|date}}, and what a company had to prove about itself before it was allowed to offer a price at all.",
      bn: "চট্টগ্রামের উত্তর পতেঙ্গা ও হালিশহরে এক কিলোমিটারের কিছু বেশি একটি সংযোগ সড়ক হবে, সঙ্গে এক কিলোমিটার চার লেনের ফিডার সড়ক, নর্দমা ও কালভার্ট, বাঁধের ঢাল সংরক্ষণ, কংক্রিটের হাঁটাপথ এবং একটি নতুন ইনডোর গেমস কমপ্লেক্স। {{case.published|date}} তারিখে {{case.organization|org}} দুই পৃষ্ঠার একটি বিজ্ঞপ্তি প্রকাশ করে এই কাজের দর আহ্বান করে। কাজটি {{case.project|work}} প্রকল্পের অংশ, এবং এর অর্থের একটি অংশ এসেছে উন্নয়ন সহযোগীর কাছ থেকে। বিজ্ঞপ্তিতে লেখা ছিল কাজটি কী, দর জমার সময় শেষ {{case.closed|date}}, আর দর দেওয়ার অনুমতি পাওয়ার আগে একটি প্রতিষ্ঠানকে নিজের সম্পর্কে কী প্রমাণ করতে হবে।",
    },
    {
      en: "That last part is where a tender notice is worth reading slowly. To be allowed to bid on this work, a company had to have already completed, within five years, a single contract for a new five-kilometre four-lane highway — flexible pavement, DBS binder and wearing course, laid by plant — worth at least {{case.similar|taka}} on its own. It had to show an average annual construction turnover above {{case.turnover|taka}}, liquid assets or a credit line of {{case.liquid_crore|cr}}, and {{case.years|n}} years in construction work. And it had to have built at least a kilometre of five-metre-wide walkway along the bank of a sea or a river.",
      bn: "শেষ অংশটাই ধীরে পড়ার মতো। এই কাজে দর দেওয়ার অনুমতি পেতে একটি প্রতিষ্ঠানকে আগের পাঁচ বছরের মধ্যে একটিমাত্র চুক্তিতে পাঁচ কিলোমিটার নতুন চার লেনের হাইওয়ে শেষ করে থাকতে হবে — ফ্লেক্সিবল পেভমেন্ট, ডিবিএস বাইন্ডার ও ওয়্যারিং কোর্স, প্লান্ট পদ্ধতিতে — এবং সেই একটি কাজের মূল্য অন্তত {{case.similar|taka}}। দেখাতে হবে বার্ষিক গড় নির্মাণ টার্নওভার {{case.turnover|taka}}-এর বেশি, তরল সম্পদ বা ঋণসীমা {{case.liquid_crore|cr}}, এবং নির্মাণকাজে {{case.years|n}} বছরের অভিজ্ঞতা। আর সমুদ্র বা নদীর তীরে অন্তত এক কিলোমিটার দীর্ঘ, পাঁচ মিটার চওড়া হাঁটাপথ তৈরি করে থাকতে হবে।",
    },
  ],

  after: [
    {
      en: "Four companies bought the tender document, at {{case.doc_price|taka}} each. Four submitted a price. When the evaluation committee had finished, one of those four bids was left standing.",
      bn: "চারটি প্রতিষ্ঠান {{case.doc_price|taka}} টাকায় দরপত্রের নথি কিনেছিল। চারটিই দর জমা দিয়েছিল। মূল্যায়ন কমিটির কাজ শেষ হলে ওই চারটি দরের একটি টিকে ছিল।",
    },
    {
      en: "The contract award notice, published eleven months later, is a single page. It names the winner, {{case.winner|firm}}, and the price: {{case.value|taka}}. It gives the day the award was notified, {{case.noa|date}}, and the day the contract was signed, {{case.signed|date}} — {{case.days|n}} days later, inside the period the tender documents allow. It does not name the three companies whose bids were set aside. It does not print what any of them offered. It does not say, in any words at all, why a single one of them was set aside.",
      bn: "এগারো মাস পরে প্রকাশিত চুক্তি প্রদানের বিজ্ঞপ্তিটি এক পৃষ্ঠার। তাতে বিজয়ীর নাম আছে — {{case.winner|firm}} — আর দর: {{case.value|taka}}। চুক্তি প্রদানের বিজ্ঞপ্তির তারিখ {{case.noa|date}}, স্বাক্ষরের তারিখ {{case.signed|date}} — {{case.days|n}} দিন পরে, দরপত্রের নথিতে দেওয়া সময়সীমার ভেতরেই। যে তিনটি প্রতিষ্ঠানের দর সরিয়ে রাখা হয়েছে, তাদের নাম এতে নেই। তারা কত দর দিয়েছিল, তা-ও নেই। আর কেন একটিও সরিয়ে রাখা হলো, সে কথা কোনো ভাষাতেই লেখা নেই।",
    },
  ],

  close: [
    {
      en: "{{case.winner|firm}} holds {{case.winner_contracts|n}} contracts in the set of documents we read, worth {{case.winner_crore|cr}} between them — {{case.winner_share|pct}} of all the contract money in {{counts.awards|n}} award notices. The eligibility wording that decided who could bid for this road appears, word for word, in {{case.reuse|n}} of the {{counts.tenders|n}} notices.",
      bn: "আমরা যে নথিগুলো পড়েছি, তাতে {{case.winner|firm}}-এর হাতে আছে {{case.winner_contracts|n}}টি চুক্তি, মিলিয়ে {{case.winner_crore|cr}} — {{counts.awards|n}}টি চুক্তির নথিতে থাকা মোট অর্থের {{case.winner_share|pct}}। এই সড়কে কারা দর দিতে পারবে তা যে যোগ্যতার শর্তে ঠিক হয়েছিল, হুবহু সেই শর্ত আছে {{counts.tenders|n}}টি বিজ্ঞপ্তির {{case.reuse|n}}টিতে।",
    },
    {
      en: "None of that is proof of wrongdoing, and this report does not offer it as proof. The analysis grades this tender's conditions as moderately restrictive and identifies no red flag in the wording itself; whether the conditions are why three bids failed is not established by any document available to us. These are red flags that warrant scrutiny — and the record that would settle them, the committee's written reason for each rejection, is precisely what the public file does not contain.",
      bn: "এর কোনোটিই অন্যায়ের প্রমাণ নয়, এবং এই প্রতিবেদন তা প্রমাণ হিসেবেও দিচ্ছে না। বিশ্লেষণে এই দরপত্রের শর্তগুলোকে মধ্যম মাত্রার সীমাবদ্ধ বলা হয়েছে, আর শর্তের ভাষায় আলাদা কোনো লাল পতাকা পাওয়া যায়নি; শর্তের কারণেই তিনটি দর বাদ পড়েছে কি না, আমাদের হাতে থাকা কোনো নথি তা প্রতিষ্ঠিত করে না। এগুলো খতিয়ে দেখার মতো লাল পতাকা — আর যা দিয়ে বিষয়টি মিটে যেত, প্রতিটি বাতিলের জন্য কমিটির লিখিত কারণ, ঠিক সেটিই প্রকাশিত নথিতে নেই।",
    },
    {
      en: "This tender was not picked because it looked worst. It was picked by a rule stated in advance — the largest contract in the set where at least three companies bid and exactly one bid was ruled responsive — and {{case.pool|n}} tenders here meet that rule. What the other {{counts.tenders|n}} notices say, taken together, is the rest of this report.",
      bn: "সবচেয়ে খারাপ দেখাচ্ছে বলে এই দরপত্রটি বেছে নেওয়া হয়নি। আগেই ঠিক করা একটি নিয়মে বাছাই হয়েছে — এই সংকলনে যেসব চুক্তিতে অন্তত তিনটি প্রতিষ্ঠান দর দিয়েছে এবং ঠিক একটি দর গ্রহণযোগ্য বিবেচিত হয়েছে, তার মধ্যে সবচেয়ে বড়টি — আর এই নিয়ম মেলে এমন দরপত্র এখানে {{case.pool|n}}টি। বাকি {{counts.tenders|n}}টি বিজ্ঞপ্তি একসঙ্গে কী বলছে, সেটিই এই প্রতিবেদনের বাকি অংশ।",
    },
  ],
};

/* ----------------------------------------------------- the transition studies
   Four more tenders, each standing at a turn in the article. They do the work a
   transition does — close one stretch of counting, open the next — by dropping
   out of the aggregate and back onto one road, one shopping-centre roof, one
   line of street lights. build.py picks each by a rule it publishes beside the
   scene, ranked over all {{counts.awarded}} awarded contracts, and every figure
   here is a token off the row that rule returned.

   `tender` is pinned for the same reason as in the opening: these paragraphs
   describe a particular job, and if the rule ever returned a different one the
   page must say so rather than describe the wrong road. `rec` names the four
   figures that case turns on, so the strip under the scene carries what this
   scene is about and not a fixed set of four.

   `markLabel` and `markRead` frame the highlighted passage: the label says
   which part of which document it is, the passage is the document's own text
   with the operative words marked, and the reading says what it means in the
   article's voice. A reader can therefore check our sentence against the page
   in the same breath as reading it. */

export const CASES = {
  single_bid: {
    tender: "112012",
    rec: ["sold", "bids", "value", "winnerRec"],
    p: [
      {
        en: "Nine hundred kilometres from that road, at Rajshahi, a connecting road was to be built from Natore Road out to the city bypass — a second-revision project the authority had been carrying for years. On {{cases.single_bid.published|date}} the {{cases.single_bid.organization|org}} published the notice. Two companies bought the tender document at {{cases.single_bid.doc_price|taka}} each.",
        bn: "ওই সড়ক থেকে নয়শো কিলোমিটার দূরে রাজশাহীতে নাটোর সড়ক থেকে শহরের বাইপাস পর্যন্ত একটি সংযোগ সড়ক হবে — সংস্থাটি বছরের পর বছর বহন করে আসা একটি দ্বিতীয়বার সংশোধিত প্রকল্প। {{cases.single_bid.published|date}} তারিখে {{cases.single_bid.organization|org}} বিজ্ঞপ্তিটি প্রকাশ করে। দুটি প্রতিষ্ঠান {{cases.single_bid.doc_price|taka}} দিয়ে দরপত্রের নথি কেনে।",
      },
      {
        en: "One of them priced the job. The contract that followed was worth {{cases.single_bid.value|taka}} — the largest single-bid contract anywhere in these {{counts.pdfs|n}} files.",
        bn: "তাদের একটি কাজের দর দেয়। এরপর যে চুক্তি হয়, তার মূল্য {{cases.single_bid.value|taka}} — এই {{counts.pdfs|n}}টি ফাইলের মধ্যে একটিমাত্র দরে হওয়া সবচেয়ে বড় চুক্তি।",
      },
    ],
    markLabel: {
      en: "From the award notice, page one: the whole competition",
      bn: "চুক্তির বিজ্ঞপ্তির প্রথম পৃষ্ঠা থেকে: গোটা প্রতিযোগিতা",
    },
    markRead: {
      en: "Two documents sold, one bid received, one found responsive. That line is the entire record of competition for {{cases.single_bid.value|taka}} of public money. The notice for this work published no qualification criteria of its own either — where the conditions should be, it says only that they are as per the tender data sheet, a document that is not in the published file.",
      bn: "দুটি নথি বিক্রি, একটি দর জমা, একটি গ্রহণযোগ্য। জনগণের {{cases.single_bid.value|taka}} টাকার প্রতিযোগিতার পুরো নথি ওই একটি লাইন। এই কাজের বিজ্ঞপ্তিতে নিজস্ব কোনো যোগ্যতার শর্তও প্রকাশ করা হয়নি — যেখানে শর্ত থাকার কথা, সেখানে কেবল লেখা আছে শর্ত টেন্ডার ডেটা শিট অনুযায়ী, আর সেই নথিটি প্রকাশিত ফাইলে নেই।",
    },
    after: [
      {
        en: "One bid is not by itself wrong. A road nobody else wants to build is a road nobody else bids on. But it is worth knowing how much of this money moved that way — and the answer is not a handful of contracts.",
        bn: "একটি দর নিজে থেকে অন্যায় নয়। যে সড়ক আর কেউ বানাতে চায় না, সেখানে আর কেউ দর দেয় না। তবু জানা দরকার, এই টাকার কত অংশ ওই পথে গেছে — আর উত্তরটি হাতে গোনা কয়েকটি চুক্তি নয়।",
      },
    ],
  },

  no_criteria: {
    tender: "581310",
    rec: ["sold", "bids", "responsive", "value"],
    p: [
      {
        en: "The single largest contract in this entire set is a road in Khulna. {{cases.no_criteria.package|work}} — the widening and improvement of the Shipyard Road — was signed for {{cases.no_criteria.value|taka}}, more than a third again as much as the Chattogram link road the report opened on. The {{cases.no_criteria.organization|org}} published the notice on {{cases.no_criteria.published|date}}, re-tendering work it had put out before. Three companies bought the document; two bid; one bid survived the evaluation.",
        bn: "এই পুরো সংকলনের সবচেয়ে বড় চুক্তিটি খুলনার একটি সড়ক। {{cases.no_criteria.package|work}} — শিপইয়ার্ড সড়ক প্রশস্তকরণ ও উন্নয়ন — {{cases.no_criteria.value|taka}} টাকায় স্বাক্ষরিত হয়, যা এই প্রতিবেদন যে চট্টগ্রামের সংযোগ সড়ক দিয়ে শুরু হয়েছিল তার চেয়েও এক-তৃতীয়াংশ বেশি। {{cases.no_criteria.organization|org}} {{cases.no_criteria.published|date}} তারিখে বিজ্ঞপ্তিটি প্রকাশ করে; এর আগেও একবার আহ্বান করা কাজ দ্বিতীয়বার আহ্বান করে। তিনটি প্রতিষ্ঠান নথি কেনে; দুটি দর দেয়; মূল্যায়ন পেরোয় একটি দর।",
      },
    ],
    markLabel: {
      en: "From the notice, page one: everything it published about who could bid",
      bn: "বিজ্ঞপ্তির প্রথম পৃষ্ঠা থেকে: কারা দর দিতে পারবে, সে বিষয়ে যা প্রকাশ করা হয়েছে",
    },
    markRead: {
      en: "Three words. For {{cases.no_criteria.value|taka}} of road, the published notice's account of what a company had to prove is a pointer to a tender data sheet that is not in the file. There is no years-of-experience figure to check against the job, no turnover figure, no cash requirement, nothing to argue is too high or too narrow — and equally nothing to show that the two companies which bid were held to the same test.",
      bn: "তিনটি শব্দ। {{cases.no_criteria.value|taka}} টাকার একটি সড়কের জন্য একটি প্রতিষ্ঠানকে কী প্রমাণ করতে হবে, প্রকাশিত বিজ্ঞপ্তিতে তার বিবরণ হলো একটি টেন্ডার ডেটা শিটের দিকে আঙুল, যে শিটটি ফাইলে নেই। কাজের সঙ্গে মিলিয়ে দেখার মতো অভিজ্ঞতার বছর নেই, লেনদেনের অঙ্ক নেই, নগদের শর্ত নেই — বেশি বা সংকীর্ণ বলে আপত্তি তোলার মতো কিছুই নেই। আর একইভাবে এটিও দেখানোর কিছু নেই যে, দর দেওয়া দুটি প্রতিষ্ঠানকে একই মাপকাঠিতে মাপা হয়েছে।",
    },
    after: [
      {
        en: "This is not one unlucky notice. It is the more common of the two kinds of notice in this set.",
        bn: "এটি একটিমাত্র দুর্ভাগা বিজ্ঞপ্তি নয়। এখানকার দুই ধরনের বিজ্ঞপ্তির মধ্যে এটিই বেশি দেখা যায়।",
      },
    ],
  },

  high_bar: {
    tender: "436738",
    rec: ["value", "liquid", "bids", "responsive"],
    p: [
      {
        en: "At the other end of the scale, a shopping centre in Chattogram needed a fire-protection system: {{cases.high_bar.package|work}}. The contract came to {{cases.high_bar.value|taka}}. Two companies bought the document, two bid, one was ruled responsive.",
        bn: "মাপের অন্য প্রান্তে, চট্টগ্রামের একটি শপিং সেন্টারে অগ্নিনির্বাপণ ব্যবস্থা দরকার ছিল: {{cases.high_bar.package|work}}। চুক্তির মূল্য দাঁড়ায় {{cases.high_bar.value|taka}}। দুটি প্রতিষ্ঠান নথি কেনে, দুটি দর দেয়, একটি গ্রহণযোগ্য বিবেচিত হয়।",
      },
    ],
    markLabel: {
      en: "From the notice, page one: the money a bidder had to be holding",
      bn: "বিজ্ঞপ্তির প্রথম পৃষ্ঠা থেকে: দরদাতার হাতে যে অর্থ থাকতে হবে",
    },
    markRead: {
      en: "The job was worth {{cases.high_bar.value|taka}}. The cash or credit line a bidder had to show was {{cases.high_bar.liquid|taka}} — {{cases.high_bar.financial_ratio|x2}} the value of the work. A firm that could install the system but could not show that much money sitting in a bank was not allowed to offer a price at all, however good the price would have been. This is the highest such multiple in the set, and it is not an outlier of kind: {{bars.financial_above_1x|n}} notices here ask for more cash than the contract turned out to be worth.",
      bn: "কাজের মূল্য ছিল {{cases.high_bar.value|taka}}। আর দরদাতাকে দেখাতে হতো {{cases.high_bar.liquid|taka}} নগদ বা ঋণসীমা — কাজের মূল্যের {{cases.high_bar.financial_ratio|x2}}। যে প্রতিষ্ঠান ব্যবস্থাটি বসাতে পারত, কিন্তু ব্যাংকে ওই পরিমাণ অর্থ দেখাতে পারত না, তাকে দর দিতেই দেওয়া হয়নি — দরটি যত ভালোই হতো। এই সংকলনে এটিই সবচেয়ে বড় গুণিতক, আর ধরনের দিক থেকে এটি ব্যতিক্রম নয়: এখানকার {{bars.financial_above_1x|n}}টি বিজ্ঞপ্তিতে চুক্তির প্রকৃত মূল্যের চেয়ে বেশি নগদ চাওয়া হয়েছে।",
    },
    after: [
      {
        en: "Read one at a time, a condition like that is a judgement call an engineer could defend. Read across {{counts.tenders|n}} notices, the demands can be set beside the contracts they produced and counted.",
        bn: "একটি একটি করে পড়লে এমন শর্ত একজন ইঞ্জিনিয়ার যুক্তি দিয়ে ব্যাখ্যা করতে পারেন। {{counts.tenders|n}}টি বিজ্ঞপ্তিজুড়ে পড়লে দাবিগুলো তাদের তৈরি করা চুক্তির পাশে রেখে গুনে দেখা যায়।",
      },
    ],
  },

  late_signing: {
    tender: "199368",
    rec: ["bids", "rejected", "noa", "signed"],
    p: [
      {
        en: "In Dhaka, {{cases.late_signing.organization|org}} put out the street lighting for a stretch of Uttara — {{cases.late_signing.package|work}}. Five companies bought the document and all five bid: the busiest field in any of these four scenes. Three of the five bids were set aside. The notice does not say why, or which three.",
        bn: "ঢাকায় {{cases.late_signing.organization|org}} উত্তরার একটি অংশের সড়কবাতির কাজ আহ্বান করে — {{cases.late_signing.package|work}}। পাঁচটি প্রতিষ্ঠান নথি কেনে এবং পাঁচটিই দর দেয়: এই চারটি দৃশ্যের মধ্যে সবচেয়ে ভিড়ের প্রতিযোগিতা। পাঁচটি দরের তিনটি সরিয়ে রাখা হয়। কেন, বা কোন তিনটি, বিজ্ঞপ্তিতে লেখা নেই।",
      },
    ],
    markLabel: {
      en: "From the award notice, page one: five bids, two left",
      bn: "চুক্তির বিজ্ঞপ্তির প্রথম পৃষ্ঠা থেকে: পাঁচটি দর, টিকে থাকল দুটি",
    },
    markRead: {
      en: "Then the clock. The award notice records that the letter of acceptance went out on {{cases.late_signing.noa|date}} and that a {{cases.late_signing.cap|n}}-day limit applied to signing the contract. It was signed on {{cases.late_signing.signed|date}} — {{cases.late_signing.days|n}} days later, {{cases.late_signing.overrun|n}} days past the deadline the same page states. That is the longest such gap in this set. The winning firm, {{cases.late_signing.winner|firm}}, holds {{cases.late_signing.winner_contracts|n}} contracts here.",
      bn: "এরপর সময়ের হিসাব। চুক্তির বিজ্ঞপ্তিতেই লেখা আছে, কাজের চিঠি গেছে {{cases.late_signing.noa|date}} তারিখে, আর চুক্তি স্বাক্ষরের জন্য প্রযোজ্য সীমা ছিল {{cases.late_signing.cap|n}} দিন। চুক্তি হয় {{cases.late_signing.signed|date}} তারিখে — {{cases.late_signing.days|n}} দিন পরে, একই পৃষ্ঠায় লেখা সীমার {{cases.late_signing.overrun|n}} দিন পার করে। এই সংকলনে এটিই সবচেয়ে বড় ব্যবধান। বিজয়ী প্রতিষ্ঠান {{cases.late_signing.winner|firm}}-এর হাতে এখানে {{cases.late_signing.winner_contracts|n}}টি চুক্তি।",
    },
    after: [
      {
        en: "A delay is not a scandal; files move slowly and money moves with them. But the deadline is the notice's own, and how often it is missed is a thing the documents can be made to answer.",
        bn: "দেরি হওয়া কোনো কাণ্ড নয়; ফাইল ধীরে চলে, টাকাও তার সঙ্গে চলে। তবু সময়সীমাটি বিজ্ঞপ্তির নিজেরই, আর তা কতবার পার হয়েছে — এই প্রশ্নের উত্তর নথিগুলো থেকেই বের করা যায়।",
      },
    ],
  },

  /* The fifth turn, at the rules. This one is not chosen for size: it is the
     tender that failed the most clause tests the timing flag does not discount.
     It is also, deliberately, one of the better-contested tenders in the set —
     eight bidders, six of them responsive — because the point of the section is
     that these are failures of the paperwork against its own rulebook, not a
     story about a field that was shut out. */
  rule_stack: {
    tender: "1083760",
    rec: ["bids", "responsive", "value", "days"],
    p: [
      {
        en: "The last scene is not a road. In April 2025 {{cases.rule_stack.organization|org}} needed computers: {{cases.rule_stack.package|work}}. The notice went up on {{cases.rule_stack.published|date}} under reference Rajuk/Electrical-1/24/G-12. Eight companies bought the document, eight bid, six were ruled responsive — a busier field than most of the tenders in this set, and the opposite of the road the report opened on.",
        bn: "শেষ দৃশ্যটি কোনো সড়ক নয়। ২০২৫ সালের এপ্রিলে {{cases.rule_stack.organization|org}}-এর দরকার ছিল কম্পিউটার: {{cases.rule_stack.package|work}}। বিজ্ঞপ্তিটি প্রকাশিত হয় {{cases.rule_stack.published|date}} তারিখে। আটটি প্রতিষ্ঠান নথি কেনে, আটটিই দর দেয়, ছয়টিকে গ্রহণযোগ্য বলা হয় — এই সংকলনের বেশির ভাগ দরপত্রের চেয়ে ভিড়ের প্রতিযোগিতা, আর এই প্রতিবেদন যে সড়ক দিয়ে শুরু হয়েছিল তার ঠিক উল্টো।",
      },
      {
        en: "It is here because of what the paperwork does. Of the {{counts.rules|n}} clause tests, this one tender fails {{cases.rule_stack.deviations|n}} — more than any other contract in the set where the document being cited can be dated to the tender's own year or earlier. It was chosen from a pool of {{cases.rule_stack.pool|n}} such contracts by a rule stated below, not picked out by name.",
        bn: "এটি এখানে আছে কাগজপত্র যা করেছে তার কারণে। {{counts.rules|n}}টি ধারা-পরীক্ষার মধ্যে এই একটি দরপত্রই {{cases.rule_stack.deviations|n}}টিতে বিচ্যুত — যেসব চুক্তিতে উদ্ধৃত দস্তাবেজটিকে দরপত্রের নিজের বছরে বা তার আগে বসানো যায়, তাদের মধ্যে সবচেয়ে বেশি। নিচে লেখা একটি নিয়ম ধরে {{cases.rule_stack.pool|n}}টি এমন চুক্তির মধ্য থেকে এটি বেছে নেওয়া হয়েছে, নাম দেখে তুলে আনা হয়নি।",
      },
    ],
    markLabel: {
      en: "From the notice, page one: the first line of who was allowed to bid",
      bn: "বিজ্ঞপ্তির প্রথম পৃষ্ঠা থেকে: কারা দর দিতে পারবে, তার প্রথম বাক্য",
    },
    markRead: {
      en: "An open tender, and the first condition is that the bidder already be on somebody's list. The standard document is explicit the other way — it says there shall not be any pre-conditions whatsoever for the sale of tender documents, and confines enlistment to the limited method. But read the whole sentence before you use it: enlistment with {{cases.rule_stack.organization|org}} <em>or</em> any other government, semi-government or autonomous body — or a reputed bonafide firm — will do. As written, it shuts out only a company never enlisted anywhere in the public sector. And it is not this office's own wording: the same sentence appears in {{cases.rule_stack.reuse|n}} notices in this set.",
      bn: "খোলা দরপত্র, আর প্রথম শর্তটিই হলো দরদাতাকে আগে থেকেই কারও তালিকায় থাকতে হবে। আদর্শ দস্তাবেজ ঠিক উল্টো কথা বলে — সেখানে লেখা, দরপত্রের নথি বিক্রির ক্ষেত্রে কোনো পূর্বশর্তই থাকবে না, আর তালিকাভুক্তির শর্ত কেবল সীমিত পদ্ধতিতেই চলে। তবু ব্যবহারের আগে পুরো বাক্যটি পড়ে নেওয়া দরকার: {{cases.rule_stack.organization|org}} <em>অথবা</em> অন্য যেকোনো সরকারি, আধা-সরকারি বা স্বায়ত্তশাসিত সংস্থা — এমনকি সুপরিচিত প্রকৃত কোনো প্রতিষ্ঠানের — তালিকায় থাকলেও চলবে। যেভাবে লেখা, তাতে কেবল সেই প্রতিষ্ঠানই বাদ পড়ে যা সরকারি খাতের কোথাও কখনো তালিকাভুক্ত হয়নি। আর ভাষাটি এই দপ্তরের নিজেরও নয়: একই বাক্য এই সংকলনের {{cases.rule_stack.reuse|n}}টি বিজ্ঞপ্তিতে আছে।",
    },
    after: [
      {
        en: "The rest of the notice sets the money. A firm had to hold {{cases.rule_stack.liquid|taka}} in cash or credit — {{cases.rule_stack.financial_ratio|x2}} what the contract was eventually signed for — and to have finished a single earlier package of {{cases.rule_stack.similar|taka}}, or {{cases.rule_stack.similar_ratio|x2}} the job. The security taken with each bid was {{cases.rule_stack.security|taka}}, {{cases.rule_stack.security_pct|pct}} of the award against a ceiling the data sheet sets at 3%. For computers, printers and a UPS, the notice also required a manufacturer's authorisation letter — for goods you can buy off a shelf, and where the standard document's own default is that no such letter is needed.",
        bn: "বিজ্ঞপ্তির বাকিটা টাকার হিসাব ঠিক করে দেয়। একটি প্রতিষ্ঠানের হাতে নগদ বা ঋণসীমা হিসেবে থাকতে হতো {{cases.rule_stack.liquid|taka}} — যে অঙ্কে শেষে চুক্তিটি হয়েছে, তার {{cases.rule_stack.financial_ratio|x2}} — আর আগেই একটিমাত্র প্যাকেজে {{cases.rule_stack.similar|taka}}, অর্থাৎ কাজের {{cases.rule_stack.similar_ratio|x2}} পরিমাণ কাজ শেষ করে থাকতে হতো। প্রতিটি দরের সঙ্গে নেওয়া জামানত ছিল {{cases.rule_stack.security|taka}}, চুক্তিমূল্যের {{cases.rule_stack.security_pct|pct}} — যেখানে ডেটা শিট সর্বোচ্চ সীমা বেঁধে দেয় ৩ শতাংশে। কম্পিউটার, প্রিন্টার ও ইউপিএসের জন্য বিজ্ঞপ্তিতে প্রস্তুতকারকের অনুমোদনপত্রও চাওয়া হয়েছে — যেসব পণ্য দোকান থেকেই কেনা যায়, আর আদর্শ দস্তাবেজে যেগুলোর জন্য সাধারণ নিয়মই হলো এমন কোনো পত্র লাগে না।",
      },
      {
        en: "Then the dates. The award notice prints the letter of acceptance as {{cases.rule_stack.noa|date}} and the signing as {{cases.rule_stack.signed|date}} — {{cases.rule_stack.days|n}} days, against the {{cases.rule_stack.cap|n}} the same rulebook allows for a contract of this size. Two lines below, the notice's own field, “Was the Contract Singed in due time?”, answers “yes”. The misspelling is the document's. That answer is exactly what a single flat twenty-eight-day deadline predicts, which is the one the portal applies to every contract regardless of size: {{cases.rule_stack.days|n}} days is comfortably inside twenty-eight, and {{cases.rule_stack.overrun|n}} days outside the {{cases.rule_stack.cap|n}} this contract's value earns it. Both dates and the answer are on page one of the award notice linked above.",
        bn: "তারপর তারিখগুলো। চুক্তির বিজ্ঞপ্তিতে ছাপা আছে, কাজের চিঠি {{cases.rule_stack.noa|date}} আর স্বাক্ষর {{cases.rule_stack.signed|date}} — অর্থাৎ {{cases.rule_stack.days|n}} দিন, যেখানে এই মাপের চুক্তির জন্য একই নিয়মপুস্তিকা সময় দেয় {{cases.rule_stack.cap|n}} দিন। দুই লাইন নিচেই বিজ্ঞপ্তির নিজের ঘরে প্রশ্ন করা হয়েছে, চুক্তিটি যথাসময়ে স্বাক্ষরিত হয়েছে কি না — উত্তর লেখা “হ্যাঁ”। আটাশ দিনের একটিমাত্র নির্দিষ্ট সময়সীমা ধরলে ঠিক এই উত্তরটিই আসে, আর পোর্টাল আকার নির্বিশেষে প্রতিটি চুক্তিতে সেটিই ধরে: {{cases.rule_stack.days|n}} দিন আটাশের বেশ ভেতরে, আর এই চুক্তির মূল্য অনুযায়ী প্রাপ্য {{cases.rule_stack.cap|n}} দিনের {{cases.rule_stack.overrun|n}} দিন বাইরে। দুটি তারিখ আর ওই উত্তর, তিনটিই উপরে যুক্ত চুক্তির বিজ্ঞপ্তির প্রথম পৃষ্ঠায়।",
      },
      {
        en: "Three of this tender's {{cases.rule_stack.deviations|n}} mismatches are against clauses worded as duties. The other four are against figures a document recommends, or a note, or guidance — and that difference is the whole of what follows.",
        bn: "এই দরপত্রের {{cases.rule_stack.deviations|n}}টি অমিলের তিনটি এমন ধারার বিপরীতে যেগুলো বাধ্যতা হিসেবে লেখা। বাকি চারটি সুপারিশ করা অঙ্ক, একটি নোট বা নির্দেশনার বিপরীতে — আর এই পার্থক্যটিই এরপরের পুরো অংশ।",
      },
    ],
  },
  all_rejected: {
    tender: "95841",
    rec: ["sold", "bids", "responsive", "value"],
    p: [
      {
        en: "Start with the largest crowd in the whole set of documents. At Belkuchi in {{cases.all_rejected.district|place}}, a guide wall was to be built at the Shishu Academy — a small job, put out by the {{cases.all_rejected.organization|org}} under the limited tendering method. {{cases.all_rejected.sold|n}} companies bought the tender document. {{cases.all_rejected.bids|n}} of them submitted a price. No tender in these {{counts.pdfs|n}} files drew a bigger field.",
        bn: "গোটা নথি-সম্ভারের সবচেয়ে বড় ভিড়টি দিয়েই শুরু করা যাক। {{cases.all_rejected.district|place}} জেলার বেলকুচিতে শিশু একাডেমির পাশে একটি গাইড ওয়াল হবে — ছোট কাজ, সীমিত দরপত্র পদ্ধতিতে আহ্বান করেছে {{cases.all_rejected.organization|org}}। {{cases.all_rejected.sold|n}}টি প্রতিষ্ঠান দরপত্রের নথি কিনেছে। তার {{cases.all_rejected.bids|n}}টিই দর জমা দিয়েছে। এই {{counts.pdfs|n}}টি ফাইলের আর কোনো দরপত্রে এত বড় প্রতিযোগিতা হয়নি।",
      },
      {
        en: "The contract award notice is one page. It records the field, then the result of the evaluation — and the number it prints for bids found responsive is zero. Below that zero it names a contractor, {{cases.all_rejected.winner|firm}}, and a price, {{cases.all_rejected.value|taka}}, and its own field confirms the contract was signed, on {{cases.all_rejected.signed|date}}.",
        bn: "চুক্তি প্রদানের বিজ্ঞপ্তিটি এক পৃষ্ঠার। তাতে প্রথমে প্রতিযোগিতার হিসাব, তারপর মূল্যায়নের ফল — আর গ্রহণযোগ্য বিবেচিত দরের ঘরে ছাপা সংখ্যাটি শূন্য। সেই শূন্যের নিচেই এক ঠিকাদারের নাম, {{cases.all_rejected.winner|firm}}, একটি দর, {{cases.all_rejected.value|taka}}, এবং বিজ্ঞপ্তির নিজের ঘরেই লেখা আছে চুক্তিটি স্বাক্ষরিত হয়েছে — {{cases.all_rejected.signed|date}} তারিখে।",
      },
    ],
    markLabel: {
      en: "From the award notice, page one: how the field was counted",
      bn: "চুক্তির বিজ্ঞপ্তির প্রথম পৃষ্ঠা থেকে: প্রতিযোগিতা যেভাবে গোনা হয়েছে",
    },
    markRead: {
      en: "Fifty-four documents sold, fifty-four bids received, nought responsive — and a signed contract underneath. The two readings are that the zero is a mistake in the entry, or that it describes the evaluation. Nothing in the file decides between them: the notice for this tender is one of the {{counts.portal_refused|n}} in this set that the portal will not serve, so the only account of the work is the award page itself. We are not asserting which reading is right. We are pointing out that the public record does not let anyone tell.",
      bn: "চুয়ান্নটি নথি বিক্রি, চুয়ান্নটি দর জমা, গ্রহণযোগ্য শূন্য — আর তার নিচেই স্বাক্ষরিত চুক্তি। দুটি পাঠ সম্ভব: হয় শূন্যটি লেখার ভুল, নয়তো এটিই মূল্যায়নের বিবরণ। নথিতে এমন কিছু নেই যা দুটির মধ্যে মীমাংসা করে: এই দরপত্রের বিজ্ঞপ্তিটি এই সম্ভারের সেই {{counts.portal_refused|n}}টির একটি, যেগুলো পোর্টাল খুলতে দেয় না — ফলে কাজের একমাত্র বিবরণ ওই চুক্তির পৃষ্ঠাটুকুই। কোন পাঠটি ঠিক, আমরা তা দাবি করছি না। আমরা বলছি, প্রকাশিত নথি কাউকে সেটি বুঝতেই দেয় না।",
    },
    after: [
      {
        en: "That is the shape of the whole set, at its sharpest. Across the {{counts.awards|n}} award notices, {{field.lost|n}} bids were set aside. The notices name {{field.losers_named|n}} of the companies that lost, publish {{field.losing_amounts_published|n}} of the prices they offered, and give {{field.reasons_published|n}} reasons.",
        bn: "গোটা সম্ভারের চেহারাটা এখানেই সবচেয়ে স্পষ্ট। {{counts.awards|n}}টি চুক্তির বিজ্ঞপ্তিতে সরিয়ে রাখা হয়েছে {{field.lost|n}}টি দর। যারা হেরেছে, তাদের {{field.losers_named|n}}টি প্রতিষ্ঠানের নাম বিজ্ঞপ্তিগুলোতে আছে, তাদের দেওয়া দরের {{field.losing_amounts_published|n}}টি ছাপা আছে, আর কারণ লেখা আছে {{field.reasons_published|n}}টি।",
      },
    ],
  },
  peer_gap: {
    tender: "826146",
    rec: ["bids", "peerSize", "peerMedian", "value"],
    p: [
      {
        en: "In Sector 18 of Uttara, at the top of {{cases.peer_gap.district|place}}, the {{cases.peer_gap.organization|org}} put out a notice on {{cases.peer_gap.published|date}} for a two-storey Hindu temple with a basement, inside its apartment project. {{cases.peer_gap.sold|n}} companies bought the document; {{cases.peer_gap.bids|n}} bid; both bids were ruled responsive and none was set aside. The contract came to {{cases.peer_gap.value|taka}}.",
        bn: "{{cases.peer_gap.district|place}}র উত্তরে, উত্তরার ১৮ নম্বর সেক্টরে, নিজের অ্যাপার্টমেন্ট প্রকল্পের ভেতরে বেসমেন্টসহ দুই তলা একটি মন্দির নির্মাণের বিজ্ঞপ্তি প্রকাশ করে {{cases.peer_gap.organization|org}} — তারিখ {{cases.peer_gap.published|date}}। {{cases.peer_gap.sold|n}}টি প্রতিষ্ঠান নথি কিনেছে; দর দিয়েছে {{cases.peer_gap.bids|n}}টি; দুটিই গ্রহণযোগ্য বিবেচিত হয়েছে, একটিও সরিয়ে রাখা হয়নি। চুক্তি হয়েছে {{cases.peer_gap.value|taka}} টাকায়।",
      },
      {
        en: "Two bids is not remarkable on its own. What makes this notice the one to look at is the company it keeps. Set beside the {{cases.peer_gap.peer_size|n}} notices closest to it in this set — same authority, same procurement method, same size band — the middle one of those drew {{cases.peer_gap.peer_median|n}} bids. This one drew two. No tender in the set came in further below the notices most like it.",
        bn: "দুটি দর নিজে থেকে বিশেষ কিছু নয়। এই বিজ্ঞপ্তিটিকে দেখার মতো করে তুলেছে তার আশপাশের বিজ্ঞপ্তিগুলো। এই সম্ভারে যেগুলো এর সবচেয়ে কাছাকাছি — একই সংস্থা, একই ক্রয়পদ্ধতি, একই আকারের ঘর — সেই {{cases.peer_gap.peer_size|n}}টি বিজ্ঞপ্তির মধ্যবর্তীটিতে দর পড়েছে {{cases.peer_gap.peer_median|n}}টি। এটিতে দুটি। নিজের মতো বিজ্ঞপ্তিগুলোর তুলনায় এত নিচে আর কোনো দরপত্র নামেনি।",
      },
    ],
    markLabel: {
      en: "From the award notice, page one: the field, against a middle of {{cases.peer_gap.peer_median|n}}",
      bn: "চুক্তির বিজ্ঞপ্তির প্রথম পৃষ্ঠা থেকে: প্রতিযোগিতা, যার মাঝের মান {{cases.peer_gap.peer_median|n}}",
    },
    markRead: {
      en: "Here is what the easy explanation would predict, and what the file actually holds. If tight qualification criteria are what empty a field, this notice should be full of them. It publishes none: where the conditions belong, the page says only that they are as per the instructions to tenderers and the tender data sheet — neither of which is in the published file. The thinnest field in the set, relative to its peers, sits behind a notice with no published bar at all.",
      bn: "সহজ ব্যাখ্যাটি যা বলবে, আর নথিতে সত্যিই যা আছে — দুটি পাশাপাশি রাখা যাক। কঠিন যোগ্যতার শর্তই যদি প্রতিযোগিতা খালি করে, তবে এই বিজ্ঞপ্তিটি শর্তে ভরা থাকা উচিত। এতে একটিও নেই: যেখানে শর্ত থাকার কথা, সেখানে কেবল লেখা আছে শর্ত দরদাতাদের নির্দেশনা ও টেন্ডার ডেটা শিট অনুযায়ী — যার কোনোটিই প্রকাশিত ফাইলে নেই। নিজের সমগোত্রীয়দের তুলনায় সম্ভারের সবচেয়ে পাতলা প্রতিযোগিতাটি রয়েছে এমন এক বিজ্ঞপ্তির পেছনে, যেটি কোনো শর্তই প্রকাশ করেনি।",
    },
    after: [
      {
        en: "One tender proves nothing either way, which is why the figure above it is the aggregate and not this road. But it is a warning about the sentence this report will not write.",
        bn: "একটি দরপত্র কোনো দিকেই কিছু প্রমাণ করে না — সে কারণেই উপরের চিত্রটি সমষ্টির, এই কাজটির নয়। তবু এটি একটি হুঁশিয়ারি, যে বাক্যটি এই প্রতিবেদন লিখবে না তার বিরুদ্ধে।",
      },
    ],
  },
  repeat_clause: {
    tender: "174671",
    rec: ["shared", "reuse", "bids", "responsive"],
    p: [
      {
        en: "Solar panels, for four residential blocks in the {{cases.repeat_clause.organization|org}}'s apartment project at Uttara. The notice went out on {{cases.repeat_clause.published|date}}, closed a month later, and the contract was signed for {{cases.repeat_clause.value|taka}}. It is a small job in a set full of roads and bridges, and it is here for one reason: of every notice we read, this is the one assembled out of the most sentences that appear, word for word, in other notices.",
        bn: "সৌর প্যানেল — উত্তরায় {{cases.repeat_clause.organization|org}}-এর অ্যাপার্টমেন্ট প্রকল্পের চারটি আবাসিক ব্লকের জন্য। বিজ্ঞপ্তি বেরোয় {{cases.repeat_clause.published|date}}, শেষ হয় এক মাস পরে, আর চুক্তি হয় {{cases.repeat_clause.value|taka}} টাকায়। সড়ক-সেতুতে ভরা এই সম্ভারে এটি ছোট কাজ, আর এখানে আছে একটিই কারণে: আমরা যত বিজ্ঞপ্তি পড়েছি, তার মধ্যে এটিই সবচেয়ে বেশি এমন বাক্য দিয়ে গাঁথা, যেগুলো হুবহু অন্য বিজ্ঞপ্তিতেও আছে।",
      },
      {
        en: "{{cases.repeat_clause.shared_clauses|n}} of its sentences are shared. The one below is carried by {{cases.repeat_clause.reuse|n}} notices in this set — the same words, the same bracket, the same hyphen where a word broke across a line in whatever file they were all copied from.",
        bn: "এর {{cases.repeat_clause.shared_clauses|n}}টি বাক্য ভাগ করা। নিচের বাক্যটি এই সম্ভারের {{cases.repeat_clause.reuse|n}}টি বিজ্ঞপ্তিতে আছে — একই শব্দ, একই বন্ধনী, লাইন ভাঙার জায়গায় একই হাইফেন, যে ফাইল থেকে সবগুলো নকল হয়েছে সেখানে যেমন ছিল।",
      },
    ],
    markLabel: {
      en: "The sentence this notice shares with {{cases.repeat_clause.reuse|n}} others",
      bn: "এই বিজ্ঞপ্তিটি আর {{cases.repeat_clause.reuse|n}}টির সঙ্গে যে বাক্যটি ভাগ করে",
    },
    markRead: {
      en: "A shared sentence is not, in itself, a problem. Procurement is meant to be standardised, and reused wording is how standardisation looks on a page. It matters here for a narrower reason: the shared stock is not only boilerplate about deadlines and forms. It includes the sentences that decide who may bid.",
      bn: "ভাগ করা বাক্য নিজে থেকে সমস্যা নয়। ক্রয়প্রক্রিয়া মানসম্মত হওয়ারই কথা, আর পুনর্ব্যবহৃত ভাষা পৃষ্ঠায় সেই মানসম্মততারই চেহারা। এখানে বিষয়টি জরুরি সংকীর্ণ একটি কারণে: ভাগ করা ভাণ্ডারটি কেবল সময়সীমা আর ফরম নিয়ে বাঁধা কথা নয়। তার মধ্যে সেই বাক্যগুলোও আছে, যেগুলো ঠিক করে দেয় কারা দর দিতে পারবে।",
      },
    after: [
      {
        en: "And then this notice does something the easy version of this story would not allow. It is one of the most heavily conditioned in the whole set — a licence category, experience working for a government client, a cap on how many contracts a bidder may hold at once — the kind of stack this investigation counts as restrictive-looking. {{cases.repeat_clause.sold|n}} companies bought the document. {{cases.repeat_clause.bids|n}} bid. Every one of the {{cases.repeat_clause.bids|n}} was ruled responsive; nobody was set aside at all. The hardest notice to qualify for produced the cleanest competition in the file.",
        bn: "তারপর এই বিজ্ঞপ্তিটি এমন কিছু করে, এই গল্পের সহজ সংস্করণে যার জায়গা নেই। পুরো সংকলনে সবচেয়ে বেশি শর্ত চাপানো বিজ্ঞপ্তিগুলোর একটি এটি — লাইসেন্সের শ্রেণি, সরকারি প্রতিষ্ঠানের হয়ে কাজের অভিজ্ঞতা, একসঙ্গে কতগুলো চুক্তি হাতে রাখা যাবে তার সীমা — এই ধরনের শর্তের স্তরকেই এই অনুসন্ধান সীমাবদ্ধতা-সদৃশ হিসেবে গণনা করেছে। {{cases.repeat_clause.sold|n}}টি প্রতিষ্ঠান নথি কিনেছে। দর দিয়েছে {{cases.repeat_clause.bids|n}}টি। ওই {{cases.repeat_clause.bids|n}}টির প্রত্যেকটিই গ্রহণযোগ্য বিবেচিত হয়েছে; একজনকেও সরিয়ে রাখা হয়নি। যে বিজ্ঞপ্তিতে যোগ্য হওয়া সবচেয়ে কঠিন, সেখানেই হয়েছে সংকলনের সবচেয়ে পরিষ্কার প্রতিযোগিতা।",
      },
    ],
  },

  price_band: {
    tender: "1128572",
    rec: ["bids", "responsive", "rejected", "value"],
    p: [
      {
        en: "In July {{cases.price_band.published|date}} the {{cases.price_band.organization|org}} invited tenders to run a gas connection to prepaid meters at its own offices and staff quarters in {{cases.price_band.district|place}} — its hill office, its Mehedibag quarters. A {{cases.price_band.value|taka}} job. Three companies bought the document, all three bid, and {{cases.price_band.responsive|n}} was ruled responsive. The other {{cases.price_band.rejected|n}} were set aside, and, as everywhere else in this set, without a published reason.",
        bn: "{{cases.price_band.published|date}} তারিখে {{cases.price_band.organization|org}} দরপত্র আহ্বান করে {{cases.price_band.district|place}}-এ নিজেদেরই কার্যালয় ও কর্মচারী আবাসনে প্রিপেইড মিটারের গ্যাস সংযোগ বসানোর জন্য — পাহাড়ের অফিস, মেহেদীবাগের কোয়ার্টার। কাজের মূল্য {{cases.price_band.value|taka}} টাকা। তিনটি প্রতিষ্ঠান নথি কেনে, তিনটিই দর দেয়, আর গ্রহণযোগ্য বিবেচিত হয় {{cases.price_band.responsive|n}}টি। বাকি {{cases.price_band.rejected|n}}টিকে সরিয়ে রাখা হয়, আর এই সম্ভারের আর সব জায়গার মতোই, কারণ না জানিয়ে।",
      },
      {
        en: "The notice explains, in advance, one way a bid could be set aside. It is item six on the page.",
        bn: "একটি দর কীভাবে সরিয়ে রাখা হতে পারে, বিজ্ঞপ্তিটি তা আগেই বলে রাখে। পৃষ্ঠার ছয় নম্বর দফা।",
      },
    ],
    markLabel: {
      en: "From the tender notice, page one — spelling as printed",
      bn: "দরপত্র বিজ্ঞপ্তির প্রথম পৃষ্ঠা থেকে — বানান যেমন ছাপা হয়েছে",
    },
    markRead: {
      en: "Price ten per cent above the estimate and you are out. Price ten per cent below it and you are out. The estimate itself is not on the page. It is not on the second page either, and our reading of this set did not find an official cost estimate printed in any of these documents. So the bar every bidder had to clear is a number none of them was shown — and the one company that cleared it is the one that won.",
      bn: "প্রাক্কলনের চেয়ে দশ শতাংশ বেশি দর দিলে আপনি বাদ। দশ শতাংশ কম দিলেও বাদ। প্রাক্কলনটি নিজে ওই পৃষ্ঠায় নেই। দ্বিতীয় পৃষ্ঠাতেও নেই, আর এই সম্ভার পড়ে আমরা এসব নথির কোনোটিতেই সরকারি প্রাক্কলিত ব্যয় ছাপা দেখিনি। অর্থাৎ প্রত্যেক দরদাতাকে যে সীমা ছুঁতে হতো, সেটি এমন একটি সংখ্যা যা তাদের কাউকে দেখানো হয়নি — আর যে একটি প্রতিষ্ঠান সেটি ছুঁতে পেরেছে, তারাই কাজটি পেয়েছে।",
    },
    after: [
      {
        en: "That sentence is not unique to this tender. It stands, with the same misspellings, in {{cases.price_band.reuse|n}} notices in this set, and a flat band of this kind appears in {{violations.rules.code=R05.deviations|n}} of them altogether, together worth {{violations.rules.code=R05.crore|cr}}. Almost all of those, though, we cannot publish as breaches, and the reason is the same one that runs through the last section of this report: the instrument we can quote is dated later than the notices. For {{violations.rules.code=R05.in_force|n}} of the {{violations.rules.code=R05.deviations|n}} the dates line up. Exactly one of those {{violations.rules.code=R05.in_force|n}} went on to become a signed contract. It is this one.",
        bn: "এই বাক্যটি কেবল এই দরপত্রের নয়। একই বানান-ভুল নিয়ে এটি এই সম্ভারের {{cases.price_band.reuse|n}}টি বিজ্ঞপ্তিতে আছে, আর এ ধরনের নির্দিষ্ট দরসীমা মোট {{violations.rules.code=R05.deviations|n}}টিতে দেখা যায়, যেগুলোর মিলিত মূল্য {{violations.rules.code=R05.crore|cr}}। তবে এর প্রায় সবগুলোকেই আমরা বিধি-লঙ্ঘন হিসেবে প্রকাশ করতে পারি না, আর কারণটি এই প্রতিবেদনের শেষ অংশ জুড়ে যা আছে সেটিই: আমরা যে দস্তাবেজটি উদ্ধৃত করতে পারি, তার তারিখ বিজ্ঞপ্তিগুলোর পরে। {{violations.rules.code=R05.deviations|n}}টির মধ্যে {{violations.rules.code=R05.in_force|n}}টিতে তারিখ মেলে। ওই {{violations.rules.code=R05.in_force|n}}টির ঠিক একটি স্বাক্ষরিত চুক্তিতে গড়িয়েছে। সেটি এটিই।",
      },
    ],
  },
  portal_yes: {
    tender: "292111",
    rec: ["noa", "signed", "days", "cap", "certified"],
    p: [
      {
        en: "The last stretch of internal road and surface drain in Sector 8 of Purbachal, the new town {{cases.portal_yes.organization|org}} is building on the eastern edge of Dhaka. The notice went out on {{cases.portal_yes.published|date}}; {{cases.portal_yes.sold|n}} companies bought the document, {{cases.portal_yes.bids|n}} bid, {{cases.portal_yes.responsive|n}} were ruled responsive and one was set aside. {{cases.portal_yes.winner|firm}} signed for {{cases.portal_yes.value|taka}}. Nothing about the competition is unusual. What is unusual is on the last line of the award notice.",
        bn: "পূর্বাচলের ৮ নম্বর সেক্টরের অবশিষ্ট অভ্যন্তরীণ সড়ক ও পৃষ্ঠ-নর্দমা — ঢাকার পূর্ব প্রান্তে {{cases.portal_yes.organization|org}} যে নতুন শহরটি গড়ে তুলছে। বিজ্ঞপ্তি বেরোয় {{cases.portal_yes.published|date}}; {{cases.portal_yes.sold|n}}টি প্রতিষ্ঠান নথি কেনে, দর দেয় {{cases.portal_yes.bids|n}}টি, গ্রহণযোগ্য বিবেচিত হয় {{cases.portal_yes.responsive|n}}টি, আর একটিকে সরিয়ে রাখা হয়। {{cases.portal_yes.winner|firm}} চুক্তি করে {{cases.portal_yes.value|taka}} টাকায়। প্রতিযোগিতার কিছুই অস্বাভাবিক নয়। অস্বাভাবিক যা, তা চুক্তি-বিজ্ঞপ্তির শেষ লাইনে।",
      },
      {
        en: "The award was notified on {{cases.portal_yes.noa|date}}. The contract was signed on {{cases.portal_yes.signed|date}}. That is {{cases.portal_yes.days|n}} days. For a contract of this size, the reference documents in this set allow {{cases.portal_yes.cap|n}}. And in the column where the portal records whether the contract was signed in due time, this contract reads: yes.",
        bn: "চুক্তির নোটিশ যায় {{cases.portal_yes.noa|date}}, স্বাক্ষর হয় {{cases.portal_yes.signed|date}}। অর্থাৎ {{cases.portal_yes.days|n}} দিন। এই আকারের চুক্তির জন্য এই সম্ভারের রেফারেন্স নথিগুলো সময় দেয় {{cases.portal_yes.cap|n}} দিন। আর পোর্টাল যে ঘরে লিখে রাখে চুক্তিটি যথাসময়ে স্বাক্ষরিত হয়েছে কি না, সেখানে এই চুক্তির বিপরীতে লেখা: হ্যাঁ।",
      },
      {
        en: "Both halves of that are printed by the same record. It is the largest contract in the set where they disagree, and it is not the only one: the portal answers this question for {{portal.answered|n}} of the {{counts.awarded|n}} contracts, says yes to {{portal.yes|n}} of them, and on {{portal.over_cap|n}} of those yeses — {{portal.over_pct|pct}}, together worth {{portal.over_crore|cr}} — the two dates it prints beside the answer fall outside the window the contract's own value allows. {{portal.over_week|n}} are more than a week outside it.",
        bn: "এই দুটি তথ্যই ছাপে একই নথি। যেখানে দুটি মেলে না, তার মধ্যে এটিই সম্ভারের সবচেয়ে বড় চুক্তি — আর এটিই একমাত্র নয়: {{counts.awarded|n}}টি চুক্তির {{portal.answered|n}}টির ক্ষেত্রে পোর্টাল এই প্রশ্নের উত্তর দেয়, তার {{portal.yes|n}}টিতে বলে হ্যাঁ, আর ওই হ্যাঁ-গুলোর {{portal.over_cap|n}}টিতে — {{portal.over_pct|pct}}, মিলিত মূল্য {{portal.over_crore|cr}} — উত্তরের পাশে সে যে দুটি তারিখ ছাপে, সেগুলো চুক্তির নিজের মূল্য অনুযায়ী প্রাপ্য সময়ের বাইরে পড়ে। {{portal.over_week|n}}টি ওই সীমার এক সপ্তাহেরও বেশি বাইরে।",
      },
    ],
    markLabel: { en: "", bn: "" },
    markRead: { en: "", bn: "" },
    after: [
      {
        en: "There is an explanation, and it is duller and more useful than a contradiction. Test the portal's yes and no against a single flat deadline of twenty-eight days, applied to every contract regardless of size, and it fits every one of the {{portal.answered|n}} answered contracts without a single exception. The portal is not recording whether each contract met the window its own value earns it. It appears to be applying one deadline to all of them.",
        bn: "একটি ব্যাখ্যা আছে, আর সেটি স্ববিরোধের চেয়ে নীরস এবং বেশি কাজের। পোর্টালের হ্যাঁ ও না-কে যদি আকার নির্বিশেষে সব চুক্তির জন্য একটিমাত্র নির্দিষ্ট আটাশ দিনের সময়সীমার বিপরীতে পরীক্ষা করা হয়, তবে উত্তর পাওয়া {{portal.answered|n}}টি চুক্তির প্রত্যেকটিতে তা মেলে — একটিও ব্যতিক্রম নেই। পোর্টাল লিখে রাখছে না যে প্রতিটি চুক্তি তার নিজের মূল্য অনুযায়ী প্রাপ্য সময় মেনেছে কি না। মনে হচ্ছে সে সবগুলোতেই একটিই সময়সীমা বসাচ্ছে।",
      },
      {
        en: "Which of the two readings is right, these documents cannot settle. Our own window comes from the reference documents in this set, and those documents are dated later than most of the notices they would govern — the caution that runs through the rule tests at the end of this report. Nobody is accused here of signing late. The point is narrower and, for a reader trying to use this portal, worse: on the question of whether a deadline was met, the published record answers with a rule that is not the rule the published documents state.",
        bn: "দুটি পাঠের কোনটি সঠিক, এই নথিগুলো তার নিষ্পত্তি করতে পারে না। আমাদের সময়সীমাটি এসেছে এই সম্ভারের রেফারেন্স নথি থেকে, আর সেসব নথির তারিখ যে বিজ্ঞপ্তিগুলোর ওপর তা খাটবে, তাদের চেয়ে পরে — এই প্রতিবেদনের শেষে নিয়ম-পরীক্ষার অংশ জুড়ে যে সতর্কতা, সেটিই। এখানে কারও বিরুদ্ধে দেরিতে স্বাক্ষরের অভিযোগ নেই। বিষয়টি আরও সংকীর্ণ, এবং এই পোর্টাল ব্যবহার করতে চাওয়া পাঠকের জন্য আরও খারাপ: সময়সীমা মানা হয়েছে কি না — এই প্রশ্নের উত্তরে প্রকাশিত নথি এমন একটি নিয়ম মেনে জবাব দেয়, যা প্রকাশিত দস্তাবেজে লেখা নিয়ম নয়।",
      },
    ],
  },
  biggest: {
    tender: "775105",
    rec: ["sold", "bids", "value", "share", "winnerRec"],
    p: [
      {
        en: "A road along the bank of the Karnafully, from Kalurghat Bridge to Chaktai khal: carriageway, retaining wall, slope protection, a bridge, a regulator, a walkway. {{cases.biggest.organization|org}} published the notice on {{cases.biggest.published|date}}. {{cases.biggest.sold|n}} companies bought the document. {{cases.biggest.bids|n}} bid. Both were ruled responsive, nobody was set aside, and the contract was signed for {{cases.biggest.value|taka}} — {{cases.biggest.value_share|pct2}} of every taka in this set, and the largest single contract in it.",
        bn: "কর্ণফুলীর তীর ধরে একটি সড়ক, কালুরঘাট সেতু থেকে চাক্তাই খাল পর্যন্ত: সড়ক, রিটেইনিং ওয়াল, ঢাল সংরক্ষণ, একটি সেতু, একটি রেগুলেটর, একটি হাঁটাপথ। {{cases.biggest.organization|org}} বিজ্ঞপ্তি প্রকাশ করে {{cases.biggest.published|date}}। নথি কেনে {{cases.biggest.sold|n}}টি প্রতিষ্ঠান। দর দেয় {{cases.biggest.bids|n}}টি। দুটিই গ্রহণযোগ্য বিবেচিত হয়, কাউকে সরিয়ে রাখা হয়নি, আর চুক্তি হয় {{cases.biggest.value|taka}} টাকায় — এই সম্ভারের প্রতি টাকার {{cases.biggest.value_share|pct2}}, এবং এটিই এখানকার একক বৃহত্তম চুক্তি।",
      },
      {
        en: "To bid at all, a company had to show {{cases.biggest.years|n}} years of general construction experience, liquid assets of {{cases.biggest.liquid|taka}}, one completed contract of a similar kind worth {{cases.biggest.similar_crore|cr}} — and this.",
        bn: "দর দেওয়ার জন্যই একটি প্রতিষ্ঠানকে দেখাতে হতো {{cases.biggest.years|n}} বছরের সাধারণ নির্মাণ-অভিজ্ঞতা, {{cases.biggest.liquid|taka}} টাকার তরল সম্পদ, একই ধরনের একটি সম্পন্ন চুক্তি যার মূল্য {{cases.biggest.similar_crore|cr}} — আর এটি।",
      },
    ],
    markLabel: {
      en: "From the tender notice, page one: the turnover a bidder had to show",
      bn: "দরপত্র বিজ্ঞপ্তির প্রথম পৃষ্ঠা থেকে: দরদাতাকে যে বার্ষিক লেনদেন দেখাতে হতো",
    },
    markRead: {
      en: "For a job of this size that bar is not obviously out of proportion, and this report does not suggest it was written for anyone. It is quoted because of what it settles. A company needing three-quarters of the contract's own value in annual turnover, plus a comparable contract already finished, is a company from a very short list — and the record shows the list behaving that way. Four firms bought the document. Two priced the work.",
      bn: "এই আকারের কাজের জন্য ওই সীমা স্পষ্টভাবে অসংগত নয়, আর এই প্রতিবেদন বলছে না যে এটি কারও জন্য লেখা হয়েছিল। এটি উদ্ধৃত হচ্ছে যা এটি নিষ্পত্তি করে সেই কারণে। যে প্রতিষ্ঠানের বার্ষিক লেনদেন চুক্তিমূল্যের তিন-চতুর্থাংশ হতে হবে, তার ওপর একই ধরনের একটি চুক্তি আগেই শেষ করা থাকতে হবে — সে আসবে খুব ছোট একটি তালিকা থেকে। নথিও দেখাচ্ছে তালিকাটি তেমনই আচরণ করেছে। চারটি প্রতিষ্ঠান নথি কিনেছে। দর দিয়েছে দুটি।",
    },
    after: [
      {
        en: "{{concentration.top1.name|firm}} signed it, {{cases.biggest.days|n}} days after being notified — comfortably inside the window, unlike most of the late-signed contracts counted earlier. And the same company appears somewhere else in this report: one of the {{concentration.top1.contracts|n}} contracts it holds here is the road this article opened on.",
        bn: "চুক্তিটি করে {{concentration.top1.name|firm}}, নোটিশ পাওয়ার {{cases.biggest.days|n}} দিন পর — আগে গোনা দেরিতে স্বাক্ষরিত চুক্তিগুলোর বেশির ভাগের মতো নয়, এটি সময়ের ভেতরেই। আর একই প্রতিষ্ঠান এই প্রতিবেদনের আরেক জায়গাতেও আছে: এখানে তার হাতে থাকা {{concentration.top1.contracts|n}}টি চুক্তির একটি হলো সেই সড়ক, যেটি দিয়ে এই লেখা শুরু হয়েছে।",
      },
      {
        en: "Which is the honest way into the rest of this section. Very few firms in any country can price an {{cases.biggest.crore|cr}} river-bank road, so finding the same names on the largest packages is expected rather than suspicious. What follows is not an allegation about any of them. It is the arithmetic of how few names the top of this table has.",
        bn: "এই অংশের বাকিটায় ঢোকার সৎ পথ এটিই। {{cases.biggest.crore|cr}} মূল্যের নদীতীরের সড়কের দর দিতে পারে এমন প্রতিষ্ঠান কোনো দেশেই বেশি নেই, তাই সবচেয়ে বড় কাজগুলোতে একই নাম পাওয়া সন্দেহজনক নয়, প্রত্যাশিতই। এরপর যা আসছে তা তাদের কারও বিরুদ্ধে অভিযোগ নয়। এটি কেবল হিসাব — এই তালিকার শীর্ষে নামের সংখ্যা কত কম।",
      },
    ],
  },
  preselection: {
    tender: "517916",
    rec: ["bids", "responsive", "stages", "score", "winnerRec"],
    p: [
      {
        en: "Street lights along Gulshan Lake Drive Road. {{cases.preselection.organization|org}} published the notice on {{cases.preselection.published|date}}; {{cases.preselection.sold|n}} companies bought the document, {{cases.preselection.bids|n}} bid, {{cases.preselection.responsive|n}} was ruled responsive, one was set aside without a reason, and the contract was signed for {{cases.preselection.value|taka}}. By the standards of this set it is a very small job — {{cases.preselection.value_share|pct2}} of the money. It is here because of what it does to our own tests.",
        bn: "গুলশান লেক ড্রাইভ রোডে সড়কবাতি। {{cases.preselection.organization|org}} বিজ্ঞপ্তি প্রকাশ করে {{cases.preselection.published|date}}; নথি কেনে {{cases.preselection.sold|n}}টি প্রতিষ্ঠান, দর দেয় {{cases.preselection.bids|n}}টি, গ্রহণযোগ্য বিবেচিত হয় {{cases.preselection.responsive|n}}টি, একটিকে কারণ না জানিয়ে সরিয়ে রাখা হয়, আর চুক্তি হয় {{cases.preselection.value|taka}} টাকায়। এই সম্ভারের মাপে কাজটি খুবই ছোট — অর্থের {{cases.preselection.value_share|pct2}}। এটি এখানে আছে আমাদের নিজের পরীক্ষাগুলোর ওপর এর প্রভাবের কারণে।",
      },
      {
        en: "Seven conditions, in the figure above. This notice is the only one in {{counts.tenders|n}} that meets all seven. The first of the seven is the sentence below.",
        bn: "উপরের রেখাচিত্রে সাতটি শর্ত। {{counts.tenders|n}}টি বিজ্ঞপ্তির মধ্যে কেবল এটিই সাতটিই পূরণ করে। সাতটির প্রথমটি নিচের বাক্যটি।",
      },
    ],
    markLabel: {
      en: "From the tender notice, page one: who the tender was open to",
      bn: "দরপত্র বিজ্ঞপ্তির প্রথম পৃষ্ঠা থেকে: দরপত্রটি কাদের জন্য খোলা ছিল",
    },
    markRead: {
      en: "Read it closely before drawing anything from it. It is not a single closed list: enlistment with any government, semi-government or autonomous body will do, and a reputed firm is admitted as well. It excludes a company that has never been enlisted with any public body anywhere. That is a real bar, and it is a much softer one than the words first suggest — which is exactly why it is printed here rather than summarised.",
      bn: "কিছু সিদ্ধান্ত টানার আগে বাক্যটি মন দিয়ে পড়ুন। এটি একটিমাত্র বন্ধ তালিকা নয়: যেকোনো সরকারি, আধা-সরকারি বা স্বায়ত্তশাসিত সংস্থায় তালিকাভুক্তি চলবে, আর সুপরিচিত প্রতিষ্ঠানও গ্রহণযোগ্য। বাদ পড়ে সেই প্রতিষ্ঠান, যে কোনো দিন কোথাও কোনো সরকারি সংস্থায় তালিকাভুক্ত হয়নি। এটি সত্যিকারের একটি বাধা, আর প্রথম পাঠে যা মনে হয় তার চেয়ে অনেক নরম — ঠিক সেই কারণেই এটি সারসংক্ষেপ না করে হুবহু ছাপা হলো।",
    },
    after: [
      {
        en: "The other six followed: few bids, documents sold that never came back as bids, a bidder ruled non-responsive, one responsive bidder left, a winner that wins repeatedly, and a winner whose wins arrive in thin fields. {{cases.preselection.winner|firm}} holds {{cases.preselection.winner_contracts|n}} contracts in this set, all with the same authority, worth {{cases.preselection.winner_crore|cr}} together — and {{cases.preselection.winner_thin|n}} of those {{cases.preselection.winner_contracts|n}} were won in a field of two bidders or fewer.",
        bn: "বাকি ছয়টিও মিলে যায়: অল্প দর, বিক্রি হওয়া দলিল যা দর হয়ে ফেরেনি, একজন দরদাতা অগ্রহণযোগ্য বিবেচিত, শেষে একটিই গ্রহণযোগ্য দর, বারবার জেতা বিজয়ী, এবং যে বিজয়ীর জয় আসে পাতলা প্রতিযোগিতায়। এই সম্ভারে {{cases.preselection.winner|firm}}-এর হাতে {{cases.preselection.winner_contracts|n}}টি চুক্তি, সবই একই সংস্থার, মিলিত মূল্য {{cases.preselection.winner_crore|cr}} — আর ওই {{cases.preselection.winner_contracts|n}}টির {{cases.preselection.winner_thin|n}}টি জেতা হয়েছে দুই বা তার কম দরদাতার প্রতিযোগিতায়।",
      },
      {
        en: "Seven conditions met is not a finding that anything was arranged. They are our tests, not a regulator's, and each has an innocent reading — small jobs draw few bidders, some firms are simply good at this work, a document bought is not a promise to bid. All the stack does is sort {{counts.tenders|n}} notices by how many questions come back with an answer that invites another question. This street-light contract sorts first. And the record on it stops where it stops everywhere else in this set: the bid that was set aside is not named, its price is not published, no reason is given.",
        bn: "সাতটি শর্ত পূরণ হওয়া মানে কোনো কিছু আগে থেকে সাজানো ছিল — তা নয়। এগুলো আমাদের পরীক্ষা, কোনো নিয়ন্ত্রকের নয়, আর প্রত্যেকটির একটি নিরপরাধ পাঠ আছে — ছোট কাজে দরদাতা কম আসে, কোনো প্রতিষ্ঠান এই কাজে এমনিতেই দক্ষ হতে পারে, নথি কেনা মানে দর দেওয়ার প্রতিশ্রুতি নয়। এই স্তরগুলো শুধু {{counts.tenders|n}}টি বিজ্ঞপ্তিকে সাজায় — কোনটিতে কতগুলো প্রশ্নের উত্তর আরেকটি প্রশ্ন ডেকে আনে, সেই হিসেবে। এই সড়কবাতির চুক্তিটি সবার আগে। আর এর নথিও সেখানেই থামে যেখানে এই সম্ভারের আর সব জায়গায় থামে: যে দরটি সরিয়ে রাখা হয়েছিল তার নাম নেই, দাম প্রকাশ করা হয়নি, কারণও লেখা নেই।",
      },
    ],
  },
};

/* ------------------------------------------------------------------- article */

export const STORY = [
  /* The scene first, then the scale. One road a reader can picture, then the
     three counts that say how much of this there is, then the paragraph about
     where the documents came from — which is a better second beat than an
     opening, because by then the reader has a reason to care where they came
     from. The drop cap lives on the case study's first paragraph. */

  { k: "case" },

  { k: "tiles", id: "headline" },

  {
    k: "p",
    en: "Every one of these documents was published by the government itself, on the national e-procurement portal. Nothing in this investigation comes from anywhere else: no leak, no interview, no outside database. We took the {{counts.pdfs|n}} PDFs exactly as they were published, read them page by page into a table with {{counts.columns|n}} fields for each of the {{counts.tenders|n}} tenders, and then asked the documents the questions any official ought to be able to answer about money that belongs to the public.",
    bn: "এই নথিগুলোর প্রতিটি সরকার নিজেই জাতীয় ইলেকট্রনিক ক্রয় পোর্টালে প্রকাশ করেছে। এই অনুসন্ধানের কিছুই অন্য কোথাও থেকে আসেনি — কোনো ফাঁস হওয়া কাগজ নয়, কোনো সাক্ষাৎকার নয়, বাইরের কোনো ডেটাবেস নয়। প্রকাশিত অবস্থাতেই {{counts.pdfs|n}}টি পিডিএফ নিয়ে পৃষ্ঠা ধরে ধরে পড়া হয়েছে, {{counts.tenders|n}}টি দরপত্রের প্রতিটির জন্য {{counts.columns|n}}টি ঘরের একটি সারণিতে তোলা হয়েছে। তারপর নথিগুলোকেই সেই প্রশ্নগুলো করা হয়েছে, জনগণের টাকা নিয়ে যেগুলোর উত্তর যেকোনো কর্মকর্তার দিতে পারা উচিত।",
  },

  {
    k: "p",
    en: "If you have never read a tender document, this is the shape of one. A government office decides to buy something — office furniture, a drain, a stretch of road — and publishes a notice saying what it wants and what a company must prove before it is allowed to bid. Companies send in sealed prices. A committee checks each bid against the conditions in the notice, sets aside the ones it decides do not comply, and picks a winner from what is left. The office then publishes a second notice naming the winner and the price. Those two notices are what we read.",
    bn: "দরপত্রের নথি কখনো না পড়া থাকলে ব্যাপারটা এমন। একটি সরকারি অফিস কিছু কিনতে চায় — অফিসের আসবাব, একটি নর্দমা, এক টুকরো সড়ক। তারা বিজ্ঞপ্তি দিয়ে জানায় কী চাই, আর দর দিতে চাইলে একটি প্রতিষ্ঠানকে আগে কী প্রমাণ করতে হবে। প্রতিষ্ঠানগুলো বন্ধ খামে দর পাঠায়। একটি কমিটি প্রতিটি দর বিজ্ঞপ্তির শর্তের সঙ্গে মিলিয়ে দেখে, যেগুলো শর্ত মানেনি বলে তারা ঠিক করে সেগুলো সরিয়ে রাখে, আর বাকিগুলো থেকে বিজয়ী বেছে নেয়। এরপর অফিস দ্বিতীয় একটি বিজ্ঞপ্তি প্রকাশ করে, তাতে বিজয়ীর নাম ও দর থাকে। আমরা পড়েছি ওই দুটি বিজ্ঞপ্তিই।",
  },

  {
    k: "p",
    en: "Most of our questions the documents answer. Who published the tender, when it closed, what the contract was worth, who signed it. One they never answer — and it is the one every check on the price depends on. It is missing from the same place in the same way in all {{counts.tenders|n}} files, which is where this begins.",
    bn: "আমাদের বেশির ভাগ প্রশ্নের উত্তর নথিতে আছে — কে দরপত্র দিয়েছে, কখন বন্ধ হয়েছে, চুক্তির মূল্য কত, কে স্বাক্ষর করেছে। একটির উত্তর কোথাও নেই — আর দামের প্রতিটি যাচাই ঠিক সেটির ওপরই দাঁড়িয়ে। {{counts.tenders|n}}টি ফাইলের সবগুলোতেই একই জায়গায় একইভাবে সেটি অনুপস্থিত, আর সেখান থেকেই এই লেখার শুরু।",
  },

  /* ---- 1. a band around a number nobody published -------------------------
     The cost section, and the one place in this investigation where a rule can
     be read straight off the page against the money. Everything here is either
     a sentence quoted from a notice or a count off the audit; nothing is
     inferred. The note at the end of the section gives away the two things that
     weaken it, before a reader has to find them.

     Not used here, deliberately: any comparison between what the band notices
     paid and what everything else paid. The band sits almost entirely inside one
     authority, so a price difference between the two groups would be a
     difference between two authorities. The rule and its own arithmetic need no
     comparison group. */

  { k: "case", id: "price_band" },

  { k: "h2", en: "The rule that rejects the cheaper bid", bn: "যে নিয়ম সস্তা দরটিকেই বাতিল করে" },

  {
    k: "p",
    en: "Before a public job is advertised, the office advertising it works out what the job ought to cost. That figure is the official cost estimate, and in the national rulebook it is the reference point almost every price check turns on. It is not published — not in a notice, not in an award, not once in {{counts.pdfs|n}} documents. What some notices do publish is a rule about it.",
    bn: "কোনো সরকারি কাজের বিজ্ঞপ্তি দেওয়ার আগে যে দপ্তর সেটি দিচ্ছে, তারা হিসাব করে কাজটির খরচ কত হওয়া উচিত। ওই হিসাবটির নাম সরকারি প্রাক্কলিত ব্যয়, আর জাতীয় নিয়মপুস্তিকায় দামের প্রায় প্রতিটি যাচাই এই হিসাবটিকেই ভিত্তি ধরে চলে। এটি প্রকাশ করা হয় না — কোনো বিজ্ঞপ্তিতে নয়, কোনো চুক্তিতে নয়, {{counts.pdfs|n}}টি নথির একটিতেও একবার নয়। কিছু বিজ্ঞপ্তি যা প্রকাশ করে, সেটি ওই হিসাব নিয়ে একটি নিয়ম।",
  },

  {
    k: "finding",
    tag: "fact",
    h: {
      en: "{{estimate.band_notices|n}} notices reject any price more than {{estimate.width_common|n}} per cent below the estimate — so no bidder is allowed to save more than that",
      bn: "{{estimate.band_notices|n}}টি বিজ্ঞপ্তিতে প্রাক্কলনের {{estimate.width_common|n}} শতাংশের বেশি নিচের যেকোনো দর বাতিল — অর্থাৎ কোনো দরদাতাই এর চেয়ে বেশি সাশ্রয় করতে পারবে না",
    },
    p: [
      {
        en: "The clause is printed in the notice itself, and it cuts both ways. {{estimate.two_sided|n}} of the {{estimate.band_notices|n}} notices that carry it name both directions: a price too far above the estimate is out, and a price too far below it is out as well. The percentage is in the sentence — {{estimate.widths.0.n|n}} notices set it at {{estimate.widths.0.key|n}} per cent and {{estimate.widths.1.n|n}} at {{estimate.widths.1.key|n}}. That is a ceiling on competition written as arithmetic. A company that can do the work for a fifth less than the government expected cannot say so and win; the saving is not rewarded, it is grounds for rejection.",
        bn: "শর্তটি বিজ্ঞপ্তিতেই ছাপা থাকে, আর তা দুদিকেই কাটে। এটি বহন করা {{estimate.band_notices|n}}টি বিজ্ঞপ্তির {{estimate.two_sided|n}}টিতেই দুটি দিকের কথা লেখা: প্রাক্কলনের অনেক বেশি উপরের দর বাদ, অনেক নিচের দরও বাদ। শতাংশটি ওই বাক্যেই আছে — {{estimate.widths.0.n|n}}টি বিজ্ঞপ্তিতে তা {{estimate.widths.0.key|n}} শতাংশ, {{estimate.widths.1.n|n}}টিতে {{estimate.widths.1.key|n}}। এটি প্রতিযোগিতার ওপর একটি ছাদ, অঙ্ক দিয়ে লেখা। যে প্রতিষ্ঠান সরকারের ধারণার চেয়ে এক-পঞ্চমাংশ কমে কাজটি করতে পারে, সে তা বলে কাজ পেতে পারবে না; সাশ্রয়টির পুরস্কার নেই, বরং সেটিই বাতিলের কারণ।",
      },
      {
        en: "And the bidder cannot see the number it is being measured against. The estimate is unpublished, so a company reading one of these notices is being told to land inside a corridor whose centre it is not allowed to know, and to lose the work if it lands outside. {{estimate.band_awarded|n}} of the {{estimate.band_notices|n}} went on to a contract, worth {{estimate.band_crore|cr}} between them. The middle one of those contracts is {{estimate.band_median_crore|cr}} — small work, priced against a secret.",
        bn: "আর যে সংখ্যার সঙ্গে মেলানো হচ্ছে, দরদাতা সেটি দেখতেই পায় না। প্রাক্কলন অপ্রকাশিত, তাই এই বিজ্ঞপ্তিগুলোর একটি পড়ে একটি প্রতিষ্ঠানকে বলা হচ্ছে এমন একটি বলয়ের ভেতরে দর দিতে, যার কেন্দ্রটি তাকে জানতেই দেওয়া হয়নি — আর বাইরে পড়লে কাজটি হারাতে হবে। {{estimate.band_notices|n}}টির {{estimate.band_awarded|n}}টিতে শেষে চুক্তি হয়েছে, সব মিলিয়ে {{estimate.band_crore|cr}} টাকার। ওই চুক্তিগুলোর মাঝেরটি {{estimate.band_median_crore|cr}} টাকার — ছোট কাজ, দর গোপন হিসাবের বিপরীতে।",
      },
      {
        en: "The clause is concentrated rather than general: {{estimate.band_agencies.0.n|n}} of the {{estimate.band_notices|n}} come from {{estimate.band_agencies.0.key|agency}} and {{estimate.band_agencies.1.n|n}} from {{estimate.band_agencies.1.key|agency}}. The other {{estimate.band_agencies_silent|n}} authorities in this set never use it.",
        bn: "শর্তটি সর্বজনীন নয়, কেন্দ্রীভূত: {{estimate.band_notices|n}}টির {{estimate.band_agencies.0.n|n}}টি {{estimate.band_agencies.0.key|agency}}-এর, আর {{estimate.band_agencies.1.n|n}}টি {{estimate.band_agencies.1.key|agency}}-এর। এই সম্ভারের বাকি {{estimate.band_agencies_silent|n}}টি সংস্থা এটি কখনো ব্যবহার করেনি।",
      },
    ],
  },

  {
    k: "finding",
    tag: "unresolved",
    h: {
      en: "The two checks that would catch an overpriced contract both need the estimate, and neither can be run",
      bn: "অতিরিক্ত দামে দেওয়া চুক্তি ধরার দুটি পরীক্ষাই প্রাক্কলনের ওপর দাঁড়ানো, আর দুটির একটিও চালানো যায় না",
    },
    p: [
      {
        en: "The standard document gives an authority the power to throw out every tender when the lowest evaluated price comes in above the official estimate. Testing that on this set means asking, for each contract, whether the price beat the estimate. We asked it {{estimate.lowest_price_test.tested|n}} times, once for every award, and got the same answer {{estimate.lowest_price_test.unrun|n}} times: the estimate is not there, so the question cannot be answered — not by us, and not by anyone outside the office that holds the figure.",
        bn: "আদর্শ দস্তাবেজ কোনো সংস্থাকে ক্ষমতা দেয় সব দরপত্র বাতিল করার, যদি মূল্যায়িত সর্বনিম্ন দরটিও সরকারি প্রাক্কলনের চেয়ে বেশি হয়। এই সম্ভারে সেটি পরীক্ষা করা মানে প্রতিটি চুক্তির ক্ষেত্রে জিজ্ঞেস করা, দরটি প্রাক্কলনের নিচে ছিল কি না। আমরা {{estimate.lowest_price_test.tested|n}} বার — প্রতিটি চুক্তির জন্য একবার — সেটি জিজ্ঞেস করেছি, আর {{estimate.lowest_price_test.unrun|n}} বারই একই উত্তর পেয়েছি: প্রাক্কলনটি নেই, তাই প্রশ্নটির উত্তর দেওয়া সম্ভব নয় — আমাদের পক্ষেও নয়, যে দপ্তর সংখ্যাটি রাখে তার বাইরে আর কারও পক্ষেও নয়।",
      },
      {
        en: "The second check is the one written for exactly the situation this set is full of. Where only one tender survives evaluation, the standard document does not allow the usual comparison between rival prices — there are none. It orders a direct comparison with the official estimate instead, and says the tender is non-responsive if the gap is more than {{estimate.std_pct|n}} per cent. {{estimate.single_tender_test.tested|n}} tenders here reached that position. On all {{estimate.single_tender_test.unrun|n}}, the comparison the rule requires cannot be verified by a reader, for the same reason.",
        bn: "দ্বিতীয় পরীক্ষাটি ঠিক সেই পরিস্থিতির জন্যই লেখা, যা এই সম্ভারে ভরা। যেখানে মূল্যায়নে টেকে মাত্র একটি দরপত্র, সেখানে আদর্শ দস্তাবেজ প্রতিদ্বন্দ্বী দরের সঙ্গে সাধারণ তুলনার অনুমতি দেয় না — প্রতিদ্বন্দ্বী তো নেই। বদলে সেটি সরাসরি সরকারি প্রাক্কলনের সঙ্গে মেলানোর নির্দেশ দেয়, আর বলে, ফারাক {{estimate.std_pct|n}} শতাংশের বেশি হলে দরপত্রটি গ্রহণযোগ্য নয়। এখানে {{estimate.single_tender_test.tested|n}}টি দরপত্র ঠিক ওই অবস্থায় পৌঁছেছে। {{estimate.single_tender_test.unrun|n}}টিতেই নিয়মের চাওয়া তুলনাটি একজন পাঠকের পক্ষে যাচাই করা যায় না, একই কারণে।",
      },
      {
        en: "Neither of those is a finding that a price was too high. It is a finding that the price cannot be checked. The rule exists, the duty to compare exists, and the number both of them turn on is held by one side only.",
        bn: "এর কোনোটিই এই সিদ্ধান্ত নয় যে দাম বেশি ছিল। এটি এই সিদ্ধান্ত যে দামটি যাচাই করা যায় না। নিয়ম আছে, মেলানোর দায়িত্বও আছে, আর দুটিই যে সংখ্যার ওপর দাঁড়িয়ে সেটি কেবল এক পক্ষের হাতে।",
      },
    ],
  },

  {
    k: "p",
    en: "What no rulebook changes is the arithmetic. A notice that refuses any price more than {{estimate.width_common|n}} per cent below the estimate has capped its own saving at {{estimate.width_common|n}} per cent before the first bid arrives. Two limits sit on this section, and Data & method sets out both.",
    bn: "যে অঙ্কটা কোনো নিয়মপুস্তিকা বদলায় না, সেটি এই: যে বিজ্ঞপ্তি প্রাক্কলনের {{estimate.width_common|n}} শতাংশের বেশি নিচের কোনো দর নেবে না, সেটি প্রথম দর জমা পড়ার আগেই নিজের সাশ্রয়ের সীমা {{estimate.width_common|n}} শতাংশে বেঁধে ফেলেছে। এই অংশটির উপর দুটি সীমা আছে, ‘ডেটা ও পদ্ধতি’ অংশে দুটিই লেখা আছে।",
  },

  /* ---- 2. the bars, measured against the contract ------------------------ */

  { k: "case", id: "high_bar" },

  { k: "h2", en: "What the notices demanded, measured against the job", bn: "বিজ্ঞপ্তি যা চেয়েছে, কাজের মাপে মিলিয়ে" },

  {
    k: "p",
    en: "A price corridor limits what a company may offer. The conditions further up the same notice decide whether it may offer anything at all — cash it must be holding, a minimum yearly income, a similar job already finished. Three of those bars are printed as figures, so all three can be read as a multiple of the contract that followed.",
    bn: "দামের বলয় ঠিক করে দেয় একটি প্রতিষ্ঠান কত দর দিতে পারবে। একই বিজ্ঞপ্তির উপরের দিকের শর্তগুলো ঠিক করে, সে আদৌ দর দিতে পারবে কি না — হাতে রাখতে হওয়া নগদ অর্থ, বছরে সর্বনিম্ন লেনদেন, আগে শেষ করা সমমানের কাজ। এই তিনটি মাপকাঠি সংখ্যায় ছাপা থাকে, তাই তিনটিকেই পরের চুক্তির কত গুণ, সেভাবে পড়া যায়।",
  },

  { k: "fig", id: "bars" },

  {
    k: "finding",
    tag: "derived",
    h: {
      en: "{{bars.financial_above_1x|n}} notices asked a bidder to hold more liquid money than the contract was worth",
      bn: "{{bars.financial_above_1x|n}}টি বিজ্ঞপ্তিতে চুক্তির মূল্যের চেয়ে বেশি নগদ সম্পদ দাবি করা হয়েছে",
    },
    p: [
      {
        en: "Of the {{bars.financial.n|n}} tenders where both the money demanded and the contract value are published, the middle demand is {{bars.financial.median|x2}} the contract value. {{bars.financial_above_2x|n}} ask for more than twice the contract, and {{bars.financial_above_5x|n}} for more than five times it. A company that could do the work but cannot show that much money in the bank is not eligible to bid.",
        bn: "যে {{bars.financial.n|n}}টি দরপত্রে চাওয়া অর্থ ও চুক্তিমূল্য দুটিই প্রকাশিত, সেখানে দাবির মাঝের মান চুক্তিমূল্যের {{bars.financial.median|x2}}। {{bars.financial_above_2x|n}}টিতে চুক্তির দ্বিগুণের বেশি চাওয়া হয়েছে, {{bars.financial_above_5x|n}}টিতে পাঁচ গুণের বেশি। যে প্রতিষ্ঠান কাজটি করতে পারত, কিন্তু ব্যাংকে ওই পরিমাণ অর্থ দেখাতে পারে না, সে দর দেওয়ার যোগ্যই নয়।",
      },
      {
        en: "The deposit a bidder has to put up alongside the bid — the tender security — is, by contrast, almost always inside the range the national rules allow: {{bars.security_in_band|n}} of {{bars.security.n|n}} — {{bars.security_in_band_pct|pct}} — fall between half a per cent and five per cent of the contract value. Where a national rule is specific and easy to check, it is largely followed, and that deserves saying as plainly as the failures.",
        bn: "অন্যদিকে দর জমা দেওয়ার সময় যে জামানত রাখতে হয় — দরপত্র জামানত — তা প্রায় সর্বত্রই জাতীয় বিধির অনুমোদিত সীমার ভেতরে: {{bars.security.n|n}}টির {{bars.security_in_band|n}}টি — {{bars.security_in_band_pct|pct}} — চুক্তিমূল্যের অর্ধ শতাংশ থেকে পাঁচ শতাংশের মধ্যে। যেখানে জাতীয় বিধি নির্দিষ্ট ও সহজে যাচাইযোগ্য, সেখানে তা মোটের ওপর মানা হয়েছে — ব্যর্থতার মতো এটিও স্পষ্ট করে বলা দরকার।",
      },
    ],
  },

  /* ---- 3. half the notices publish no bar at all -------------------------- */

  { k: "case", id: "no_criteria" },

  { k: "h2", en: "Half the notices set no published bar at all", bn: "অর্ধেক বিজ্ঞপ্তিতে কোনো প্রকাশিত যোগ্যতার মাপকাঠিই নেই" },

  {
    k: "p",
    en: "A tender notice is supposed to tell a company what it must prove to qualify: how many years of experience, how much turnover, how much working capital, how many comparable jobs finished. {{eligibility.substantive|n}} of the {{counts.tenders|n}} notices print those conditions in words. The other {{eligibility.no_criteria|n}} — {{eligibility.no_criteria_pct|pct}} — do not. They point to a separate tender data sheet, or to nothing at all.",
    bn: "একটি দরপত্র বিজ্ঞপ্তিতে থাকার কথা, যোগ্য হতে একটি প্রতিষ্ঠানকে কী প্রমাণ করতে হবে: কত বছরের অভিজ্ঞতা, কত টাকার বার্ষিক লেনদেন, কত চলতি মূলধন, কতটি সমমানের কাজ শেষ করা। {{counts.tenders|n}}টি বিজ্ঞপ্তির {{eligibility.substantive|n}}টিতে এই শর্তগুলো লেখা আছে। বাকি {{eligibility.no_criteria|n}}টিতে — অর্থাৎ {{eligibility.no_criteria_pct|pct}}-এ — নেই। সেগুলো আলাদা টেন্ডার ডেটা শিটের কথা বলে, বা কিছুই বলে না।",
  },

  { k: "fig", id: "agencies" },

  {
    k: "finding",
    tag: "derived",
    h: {
      en: "Whether the bar is published depends almost entirely on which authority published the notice",
      bn: "মাপকাঠি প্রকাশিত হবে কি না, তা প্রায় পুরোপুরি নির্ভর করে কোন সংস্থা বিজ্ঞপ্তিটি দিয়েছে তার ওপর",
    },
    p: [
      {
        en: "One authority in this set leaves the criteria unpublished in every single one of its notices. Another publishes them in all but one. The same national rulebook applies to both.",
        bn: "এখানকার একটি সংস্থা তার প্রতিটি বিজ্ঞপ্তিতেই শর্তগুলো অপ্রকাশিত রেখেছে। আরেকটি সংস্থা একটি ছাড়া বাকি সবগুলোতেই প্রকাশ করেছে। অথচ দুটোর জন্যই একই জাতীয় বিধি প্রযোজ্য।",
      },
      {
        en: "This is not only a transparency problem. It is a practical one: those {{eligibility.no_criteria|n}} notices are precisely the ones where nobody outside the office can ask whether a condition was fair for the size of the job, because there is no condition on the page to ask about.",
        bn: "এটি কেবল স্বচ্ছতার প্রশ্ন নয়, হাতে-কলমে একটি বাধাও। শর্ত অপ্রকাশিত থাকা ওই {{eligibility.no_criteria|n}}টি বিজ্ঞপ্তিই ঠিক সেই বিজ্ঞপ্তি, যেগুলো নিয়ে অফিসের বাইরের কেউ প্রশ্নই তুলতে পারেন না — কাজের আকারের তুলনায় শর্তটি ন্যায্য ছিল কি না, তা জিজ্ঞেস করার মতো কোনো শর্তই কাগজে নেই।",
      },
    ],
  },

  /* ---- 4. the same sentences, over and over ------------------------------- */

  { k: "case", id: "repeat_clause" },

  { k: "h2", en: "The same sentences, over and over", bn: "একই বাক্য, বারবার" },

  {
    k: "p",
    en: "Eligibility wording is not written fresh for each job. {{reuse.tenders|n}} tenders share at least one qualification sentence word for word with another tender here, and {{reuse.ten_or_more|n}} of them use a sentence that turns up in ten or more notices. The most-reused sentence of all appears in {{reuse.top.0.n|n}}.",
    bn: "যোগ্যতার শর্ত প্রতিটি কাজের জন্য নতুন করে লেখা হয় না। এখানকার {{reuse.tenders|n}}টি দরপত্রে অন্তত একটি যোগ্যতার বাক্য অন্য দরপত্রের সঙ্গে হুবহু মেলে, আর তার {{reuse.ten_or_more|n}}টিতে এমন বাক্য আছে যা দশ বা তার বেশি বিজ্ঞপ্তিতে দেখা যায়। সবচেয়ে বেশিবার ব্যবহৃত বাক্যটি আছে {{reuse.top.0.n|n}}টিতে।",
  },

  {
    k: "p",
    en: "Reuse on its own is ordinary, and often sensible — a standard clause is a standard clause. It becomes a question only when the sentence being copied is the unusually specific one. That is what the clause explorer is for, in Explore the data at the foot of this page: it lists every shared sentence with the tenders that carry it.",
    bn: "পুনর্ব্যবহার নিজে থেকে স্বাভাবিক, প্রায়ই যুক্তিসংগতও — আদর্শ শর্ত আদর্শ শর্তই। প্রশ্ন ওঠে তখনই, যখন নকল হওয়া বাক্যটিই অস্বাভাবিকভাবে নির্দিষ্ট। শর্ত-অনুসন্ধানী এ কাজেই — এই পৃষ্ঠার নিচে ‘ডেটা ঘেঁটে দেখুন’ অংশে: সেখানে প্রতিটি ভাগ করা বাক্যের সঙ্গে সেসব দরপত্রের তালিকা আছে যেগুলোতে সেটি রয়েছে।",
  },

  /* ---- 5. how thin the field is, and where the money is ------------------ */

  { k: "case", id: "single_bid" },

  { k: "h2", en: "Where the field is thinnest, the money is thickest", bn: "যেখানে প্রতিযোগিতা সবচেয়ে কম, টাকা সেখানেই সবচেয়ে বেশি" },

  {
    k: "p",
    en: "Line the tenders up by how many companies bid and the shape is unremarkable: many tenders with a handful of bidders, a few with a crowd. What is remarkable is where the money sits inside that shape. {{money.thin_field_n|n}} tenders drew two bidders or fewer. Those {{money.thin_field_n|n}} carry {{money.thin_field_crore|cr}} between them — {{money.thin_field_share|pct}} of every taka in this set.",
    bn: "কত দর জমা পড়েছে সেই অনুযায়ী দরপত্রগুলো সাজালে চেহারাটা অস্বাভাবিক কিছু নয়: বেশির ভাগ দরপত্রে হাতে গোনা কয়েকজন দরদাতা, অল্প কয়েকটিতে ভিড়। অস্বাভাবিক ব্যাপারটা হলো, ওই চেহারার ভেতরে টাকা কোথায় বসে আছে। {{money.thin_field_n|n}}টি দরপত্রে দরদাতা ছিল দুই বা তার কম। ওই {{money.thin_field_n|n}}টিতেই আছে {{money.thin_field_crore|cr}} — এই নথিগুলোর প্রতিটি টাকার {{money.thin_field_share|pct}}।",
  },

  { k: "fig", id: "competition" },

  {
    k: "finding",
    tag: "derived",
    h: {
      en: "Nearly half the money moved through tenders with two bidders or fewer",
      bn: "প্রায় অর্ধেক টাকা গেছে দুই বা তার কম দরদাতার দরপত্রে",
    },
    p: [
      {
        en: "{{competition.key=SINGLE_BID.n|n}} tenders received a single bid, worth {{competition.key=SINGLE_BID.crore|cr}} — one company priced the job and nobody else did. A further {{competition.key=VERY_LOW.n|n}} received two or three, and those carry {{competition.key=VERY_LOW.crore|cr}}, or {{competition.key=VERY_LOW.share|pct}} of the total: more than any other group. The busiest group, the tenders with the most bidders, carries {{competition.key=HIGH.share|pct}}.",
        bn: "{{competition.key=SINGLE_BID.n|n}}টি দরপত্রে একটিমাত্র দর জমা পড়েছে, মূল্য {{competition.key=SINGLE_BID.crore|cr}} — একটি প্রতিষ্ঠান দর দিয়েছে, আর কেউ দেয়নি। আরও {{competition.key=VERY_LOW.n|n}}টিতে দুই বা তিনটি দর, আর সেগুলোতে আছে {{competition.key=VERY_LOW.crore|cr}}, অর্থাৎ মোটের {{competition.key=VERY_LOW.share|pct}} — অন্য যেকোনো দলের চেয়ে বেশি। সবচেয়ে ভিড়ের দলটিতে, যেখানে দরদাতা সবচেয়ে বেশি, আছে {{competition.key=HIGH.share|pct}}।",
      },
      {
        en: "A small field is not by itself evidence of anything improper. Small or specialised jobs attract few bidders everywhere. It is an investigative signal, not a finding of wrongdoing. What makes it matter here is what the record leaves out: no rejection is ever explained, so nothing published lets you tell a tender that happened to draw two bidders from one that was narrowed down to two.",
        bn: "কম দরদাতা থাকা নিজে থেকেই অনিয়মের প্রমাণ নয়। ছোট বা বিশেষায়িত কাজে সব জায়গাতেই কম দর জমা পড়ে। এটি অনুসন্ধানের একটি সংকেত, অন্যায়ের প্রমাণ নয়। এখানে এটি গুরুত্বপূর্ণ হয়ে ওঠে নথিতে যা নেই সেটির কারণে: বাতিলের কারণ কখনো ব্যাখ্যা করা হয় না, তাই প্রকাশিত নথি দেখে বোঝার উপায় নেই — কোনো দরপত্রে দুজন দরদাতা এমনিতেই এসেছিল, না কি মাঠ কমিয়ে দুজনে নামানো হয়েছিল।",
      },
    ],
  },

  {
    k: "finding",
    tag: "derived",
    h: {
      en: "In {{field.single_responsive|n}} tenders, exactly one bid survived the evaluation",
      bn: "{{field.single_responsive|n}}টি দরপত্রে মূল্যায়ন পেরিয়েছে ঠিক একটি দর",
    },
    p: [
      {
        en: "That is {{field.single_responsive_pct|pct}} of the tenders that publish a bid count. In {{field.half_lost|n}} tenders more than half the bids were set aside. In {{field.mass_disqualified|n}}, three or more went at once. And in {{field.many_one|n}} tenders — worth {{field.many_one_crore|cr}} — four or more companies bid and exactly one was still standing at the end.",
        bn: "দরদাতার সংখ্যা প্রকাশিত দরপত্রগুলোর এটি {{field.single_responsive_pct|pct}}। {{field.half_lost|n}}টি দরপত্রে অর্ধেকের বেশি দর সরিয়ে রাখা হয়েছে। {{field.mass_disqualified|n}}টিতে একসঙ্গে তিন বা তার বেশি দর বাদ গেছে। আর {{field.many_one|n}}টি দরপত্রে — মূল্য {{field.many_one_crore|cr}} — চার বা তার বেশি প্রতিষ্ঠান দর দিয়েছিল, শেষে টিকে ছিল ঠিক একটি।",
      },
    ],
  },

  /* ---- 6. the theory that did not hold ----------------------------------- */

  { k: "h2", en: "The obvious theory does not hold, and we are publishing that", bn: "সহজ অনুমানটি মেলেনি, এবং সেটিও আমরা প্রকাশ করছি" },

  {
    k: "p",
    en: "The price corridor raises the cost by arithmetic: it forbids the cheap bid. There is a second and more familiar way restriction is supposed to raise cost — an oddly specific requirement keeps rival companies away, few bids arrive, and the firm the clause suits wins. Here it does not happen. We scored every notice that publishes its criteria for how demanding and how narrow its conditions are, then set that score beside the number of bids that arrived. The relationship runs the wrong way.",
    bn: "দামের বলয়টি খরচ বাড়ায় অঙ্কের নিয়মে: সস্তা দরটিকে সে নিষিদ্ধ করে। সীমাবদ্ধতা খরচ বাড়ানোর আরেকটি বেশি পরিচিত পথ আছে — অস্বাভাবিকভাবে নির্দিষ্ট একটি শর্ত প্রতিদ্বন্দ্বীদের দূরে রাখে, অল্প দর জমা পড়ে, আর যে প্রতিষ্ঠানের সঙ্গে শর্তটি মেলে তারাই কাজ পায়। এখানে তা ঘটেনি। শর্ত প্রকাশ করা প্রতিটি বিজ্ঞপ্তির শর্ত কতটা কঠিন ও কতটা সংকীর্ণ, আমরা নিজেরাই তার নম্বর দিয়েছি, তারপর সেই নম্বর জমা পড়া দরের সংখ্যার পাশে রেখেছি। সম্পর্কটি উল্টো দিকে চলছে।",
  },

  { k: "fig", id: "restriction" },

  {
    k: "finding",
    tag: "unresolved",
    h: {
      en: "Notices with the most restrictive-looking conditions attracted more bidders, not fewer",
      bn: "সবচেয়ে কঠোর দেখতে শর্তওয়ালা বিজ্ঞপ্তিতে দরদাতা এসেছে বেশি, কম নয়",
    },
    p: [
      {
        en: "Among the {{correlation.score_vs_bids_276.n|n}} tenders that both publish their criteria and report a bid count, the two figures move together instead of apart. The measured relationship between the restriction score and the number of bids is {{correlation.score_vs_bids_276.r|r}}, and a positive number here means more restriction came with more bidders, not fewer. In plainer terms: the notices we scored as showing no identified restriction drew a middle value of {{restriction.key=NONE_IDENTIFIED.median_bids|n1}} bids, and the ones we scored as strongly restrictive drew {{restriction.key=STRONG.median_bids|n1}}.",
        bn: "যে {{correlation.score_vs_bids_276.n|n}}টি দরপত্র একইসঙ্গে শর্ত প্রকাশ করেছে এবং দরদাতার সংখ্যা জানিয়েছে, সেখানে দুটি সংখ্যা বিপরীত দিকে নয়, একই দিকে চলে। কঠোরতার নম্বর ও দরের সংখ্যার মাপা সম্পর্ক {{correlation.score_vs_bids_276.r|r}}, আর এখানে ধনাত্মক সংখ্যার মানে হলো বেশি কঠোরতার সঙ্গে দরদাতা কমেনি, বেড়েছে। সরল করে বললে: যেসব বিজ্ঞপ্তিতে আমরা কোনো শনাক্তযোগ্য বাধা পাইনি সেখানে দরের মাঝের মান {{restriction.key=NONE_IDENTIFIED.median_bids|n1}}টি, আর যেগুলোকে জোরালোভাবে বাধাদায়ক ধরেছি সেখানে {{restriction.key=STRONG.median_bids|n1}}টি।",
      },
      {
        en: "There is more than one honest reading of that. Restrictive-looking clauses turn up mostly on the larger, more visible jobs, and those draw more companies for reasons of their own. The score is ours, not the documents' — we built the scale, and someone else would build it differently. And the {{eligibility.no_criteria|n}} notices that publish no criteria cannot enter the test at all, which leaves out exactly the tenders where an unpublished condition would be easiest to apply. We could not settle it from these documents, and we are not going to assert a theory the data contradicts.",
        bn: "এর একাধিক সৎ ব্যাখ্যা সম্ভব। কঠোর দেখতে শর্তগুলো বেশি দেখা যায় বড় ও বেশি নজরে আসা কাজে, আর সেগুলোতে নিজের কারণেই বেশি প্রতিষ্ঠান আসে। নম্বরটি আমাদের, নথির নয় — মাপকাঠিটি আমরা বানিয়েছি, অন্য কেউ বানালে অন্যরকম হতো। আর শর্ত প্রকাশ না করা {{eligibility.no_criteria|n}}টি বিজ্ঞপ্তি এই পরীক্ষায় ঢুকতেই পারে না, ফলে বাদ পড়ে যায় ঠিক সেই দরপত্রগুলোই যেখানে অপ্রকাশিত শর্ত প্রয়োগ করা সবচেয়ে সহজ। এই নথি দিয়ে বিষয়টির মীমাংসা হয়নি, আর ডেটা যে অনুমানকে খণ্ডন করে সেটি আমরা দাবি করব না।",
      },
      {
        en: "One thing in the same family is strong and does run the way you would expect: the more bids a tender attracts, the smaller the share of them that survives evaluation ({{correlation.bids_vs_responsive_rate.r|r}} across {{correlation.bids_vs_responsive_rate.n|n}} tenders). Crowded tenders are where bids are lost.",
        bn: "কাছাকাছি আরেকটি সম্পর্ক অবশ্য জোরালো, আর প্রত্যাশিত দিকেই: একটি দরপত্রে যত বেশি দর জমা পড়ে, তার তত কম অংশ মূল্যায়ন পেরোয় ({{correlation.bids_vs_responsive_rate.n|n}}টি দরপত্রে {{correlation.bids_vs_responsive_rate.r|r}})। ভিড় যেখানে বেশি, দর হারায় সেখানেই।",
      },
    ],
  },

  /* ---- 7. the field collapses, and what the file will not show ------------- */

  { k: "case", id: "all_rejected" },

  /* The price sections above turn on a figure the reader is not shown. This one
     is the same problem one step later in the process: the decision that applies
     those conditions is not shown either. The subhead names that consequence
     rather than the count, because the count is in the finding underneath. */
  { k: "h2", en: "The part of the file no one outside can read", bn: "ফাইলের যে অংশ বাইরের কেউ পড়তে পারে না" },

  {
    k: "p",
    en: "So far the missing figure has been the estimate. Here it is the decision. Across the {{counts.with_bid_counts|n}} tenders that publish a bid count, {{field.submitted|n}} bids were submitted. {{field.responsive|n}} of them were ruled responsive — the official word for a bid the committee accepts as meeting the notice's own conditions. The other {{field.lost|n}} were set aside, across {{field.tenders_losing_bids|n}} tenders. Behind each of those was a company that prepared a bid and lost it.",
    bn: "এ পর্যন্ত অনুপস্থিত সংখ্যাটি ছিল প্রাক্কলন। এখানে অনুপস্থিত সিদ্ধান্তটি। যে {{counts.with_bid_counts|n}}টি দরপত্রে দরদাতার সংখ্যা প্রকাশিত হয়েছে, সেগুলোতে জমা পড়েছিল {{field.submitted|n}}টি দর। তার {{field.responsive|n}}টিকে ‘গ্রহণযোগ্য’ ধরা হয়েছে — কমিটি যে দরকে বিজ্ঞপ্তির নিজের শর্ত মেনেছে বলে মানে, দরপত্রের ভাষায় তাকেই বলা হয় গ্রহণযোগ্য। বাকি {{field.lost|n}}টি সরিয়ে রাখা হয়েছে, {{field.tenders_losing_bids|n}}টি দরপত্রজুড়ে। ওই প্রতিটির পেছনে একটি প্রতিষ্ঠান ছিল, যারা দর তৈরি করেছিল আর হেরেছিল।",
  },

  { k: "fig", id: "funnel" },

  {
    k: "finding",
    tag: "fact",
    h: {
      en: "In not one case does any document in this set say why a bid was rejected",
      bn: "এই নথিগুলোর একটি কাগজেও লেখা নেই কেন কোনো দর বাতিল হয়েছে",
    },
    p: [
      {
        en: "The contract award notices carry a field for the reason a bid was found non-responsive. In {{field.rejected_aggregate_rows|n}} tenders where bids were rejected, that field is filled in {{field.reasons_published|n}} times. The number of losing bidders named anywhere in these {{counts.pdfs|n}} files is {{field.losers_named|n}}. The number of losing prices published is {{field.losing_amounts_published|n}}.",
        bn: "চুক্তি প্রদানের বিজ্ঞপ্তিতে দর অগ্রহণযোগ্য হওয়ার কারণ লেখার ঘর আছে। যে {{field.rejected_aggregate_rows|n}}টি দরপত্রে দর বাতিল হয়েছে, সেখানে ওই ঘরটি পূরণ করা হয়েছে {{field.reasons_published|n}} বার। এই {{counts.pdfs|n}}টি ফাইলের কোথাও নাম লেখা আছে এমন পরাজিত দরদাতার সংখ্যা {{field.losers_named|n}}। প্রকাশিত পরাজিত দরের সংখ্যা {{field.losing_amounts_published|n}}।",
      },
      {
        en: "This is not a gap in our reading. It is what the published document contains. A company that loses under this record cannot find out which of its papers failed, so it cannot argue with a decision it is never shown — and no one outside the evaluation committee can check whether the same test was applied to everyone in the room.",
        bn: "এটি আমাদের পড়ার ঘাটতি নয়; প্রকাশিত নথিতে এটুকুই আছে। এই নথির ভিত্তিতে কোনো প্রতিষ্ঠান হারলে সে জানতেই পারে না তার কোন কাগজে ঘাটতি ছিল — যে সিদ্ধান্ত তাকে কখনো দেখানো হয় না, তা নিয়ে সে তর্কও করতে পারে না। আর মূল্যায়ন কমিটির বাইরের কেউ যাচাই করতে পারে না, ঘরের সবার ক্ষেত্রে একই মাপকাঠি ব্যবহার হয়েছে কি না।",
      },
    ],
  },

  /* ---- 8. the documents that say it in their own words -------------------- */

  { k: "case", id: "peer_gap" },

  { k: "h2", en: "Four documents that speak for themselves", bn: "চারটি নথি, যেগুলো নিজেরাই কথা বলে" },

  {
    k: "p",
    en: "Almost everything above is a count across {{counts.pdfs|n}} files. The four below are single pages, quoted exactly as published, each linked to the PDF it came from so you can read the sentence where it sits.",
    bn: "উপরের প্রায় সবই {{counts.pdfs|n}}টি ফাইলজুড়ে গণনা। নিচের চারটি একক পৃষ্ঠা, প্রকাশিত অবস্থায় হুবহু উদ্ধৃত — প্রতিটির সঙ্গে মূল পিডিএফের লিংক আছে, যাতে বাক্যটি যেখানে বসে আছে সেখানেই পড়ে নেওয়া যায়।",
  },

  { k: "exhibits" },

  {
    k: "p",
    en: "The first of those four is the only document in this entire set where a government office says, in its own words, that it adjusted the qualification criteria with a particular kind of bidder in mind. It does not name a company. It does not say who asked for the change. Two bids arrived and one was ruled responsive. We quote it because it is on the public record — and we stop where the page stops.",
    bn: "ওই চারটির প্রথমটি এই পুরো সংগ্রহে একমাত্র নথি, যেখানে একটি সরকারি অফিস নিজের ভাষাতেই লিখেছে যে নির্দিষ্ট ধরনের দরদাতার কথা মাথায় রেখে যোগ্যতার শর্ত সমন্বয় করা হয়েছে। এতে কোনো প্রতিষ্ঠানের নাম নেই। কে বদলাতে বলেছে, তা-ও নেই। দুটি দর জমা পড়েছিল, একটি গ্রহণযোগ্য বিবেচিত হয়। এটি উদ্ধৃত করছি কারণ এটি সরকারি নথিতেই আছে — আর কাগজ যেখানে থামে, আমরাও সেখানেই থামছি।",
  },

  /* ---- 9. after the award ------------------------------------------------- */

  { k: "case", id: "late_signing" },

  { k: "h2", en: "After the award", bn: "কাজ দেওয়ার পর" },

  {
    k: "p",
    en: "Of the {{counts.awarded|n}} awarded contracts, {{signing.within|n}} were signed inside the time the national rules allow. The limit is fourteen, twenty-one or twenty-eight days depending on how the tender was run, and the award notice records which one applied. {{signing.over_total|n}} were signed later than that: {{signing.over_14|n}} past a fourteen-day limit and {{signing.over_21|n}} past a twenty-one-day one. The middle overrun is {{signing.overrun.median|n}} days; the longest is {{signing.overrun.max|n}}.",
    bn: "চুক্তি হওয়া {{counts.awarded|n}}টির মধ্যে {{signing.within|n}}টি স্বাক্ষরিত হয়েছে জাতীয় বিধির অনুমোদিত সময়ের ভেতরে। সীমা চৌদ্দ, একুশ বা আঠাশ দিন — দরপত্র কোন পদ্ধতিতে হয়েছে তার ওপর নির্ভর করে, আর কোনটি প্রযোজ্য তা চুক্তির বিজ্ঞপ্তিতেই লেখা থাকে। {{signing.over_total|n}}টি স্বাক্ষরিত হয়েছে তার পরে: {{signing.over_14|n}}টি চৌদ্দ দিনের সীমা পেরিয়ে, {{signing.over_21|n}}টি একুশ দিনের সীমা পেরিয়ে। বাড়তি সময়ের মাঝের মান {{signing.overrun.median|n}} দিন; সর্বোচ্চ {{signing.overrun.max|n}} দিন।",
  },

  { k: "fig", id: "timeline" },

  /* ---- 10. the portal's own answer to its own question -------------------- */

  { k: "case", id: "portal_yes" },

  { k: "h2", en: "The portal marks its own homework", bn: "পোর্টাল নিজের খাতা নিজেই দেখে" },

  { k: "fig", id: "portal" },

  /* ---- 11. where the money went ------------------------------------------- */

  { k: "case", id: "biggest" },

  { k: "h2", en: "Where the money went", bn: "টাকা কোথায় গেছে" },

  {
    k: "p",
    en: "{{counts.winners|n}} separate firms hold the {{counts.awarded|n}} contracts here, once names printed in different forms — different spellings, different punctuation — had been matched to one another. {{concentration.single_contract_winners|n}} of them hold exactly one contract. The top five hold {{concentration.top5_share|pct}} of the money, the top ten {{concentration.top10_share|pct}}, the top twenty {{concentration.top20_share|pct}}.",
    bn: "ভিন্ন ভিন্ন বানানে, ভিন্ন যতিচিহ্নে ছাপা নামগুলো মিলিয়ে দেখার পর এখানকার {{counts.awarded|n}}টি চুক্তির মালিক {{counts.winners|n}}টি আলাদা প্রতিষ্ঠান। তাদের {{concentration.single_contract_winners|n}}টির হাতে ঠিক একটি চুক্তি। শীর্ষ পাঁচের হাতে টাকার {{concentration.top5_share|pct}}, শীর্ষ দশের {{concentration.top10_share|pct}}, শীর্ষ বিশের {{concentration.top20_share|pct}}।",
  },

  { k: "fig", id: "winners" },

  {
    k: "finding",
    tag: "derived",
    h: {
      en: "One firm holds {{concentration.top1.share|pct}} of the money from {{concentration.top1.contracts|n}} contracts",
      bn: "একটি প্রতিষ্ঠানের হাতে {{concentration.top1.contracts|n}}টি চুক্তি থেকে টাকার {{concentration.top1.share|pct}}",
    },
    p: [
      {
        en: "{{concentration.top1.name|firm}} holds {{concentration.top1.crore|cr}} across {{concentration.top1.contracts|n}} contracts, all with one authority. {{concentration.top1.thin_wins|n}} of those {{concentration.top1.contracts|n}} were won in tenders with two bidders or fewer. We name the firm for one reason only: the government's own award notices name it, and those notices are the source for every figure in this paragraph.",
        bn: "{{concentration.top1.name|firm}}-এর হাতে {{concentration.top1.contracts|n}}টি চুক্তি মিলিয়ে {{concentration.top1.crore|cr}}, সবই একটি সংস্থার সঙ্গে। ওই {{concentration.top1.contracts|n}}টির {{concentration.top1.thin_wins|n}}টি জেতা হয়েছে দুই বা তার কম দরদাতার দরপত্রে। প্রতিষ্ঠানটির নাম আমরা একটি কারণেই লিখছি: সরকারের নিজের চুক্তি-বিজ্ঞপ্তিতেই নামটি আছে, আর এই অনুচ্ছেদের প্রতিটি সংখ্যার সূত্রও সেই বিজ্ঞপ্তিগুলোই।",
      },
      {
        en: "Nothing in these documents says the firm did anything wrong, and nothing here should be read as saying so. One very large package can produce this shape on its own. Across the whole set the measured concentration is {{concentration.hhi|n1}} on the Herfindahl-Hirschman index — a standard way of scoring how few hands a market sits in. It is a number to compare with other procurement portfolios, not a verdict on any one contract.",
        bn: "এই নথিগুলোর কোথাও লেখা নেই যে প্রতিষ্ঠানটি কোনো অন্যায় করেছে, আর এখানকার কিছুই সে অর্থে পড়া উচিত নয়। একটিমাত্র বিশাল কাজই এমন চেহারা তৈরি করতে পারে। পুরো সংগ্রহের মাপা কেন্দ্রীভবন হারফিন্ডাল-হিরশম্যান সূচকে {{concentration.hhi|n1}} — একটি বাজার কত অল্প হাতে জমে আছে, তা মাপার প্রচলিত পদ্ধতি। এই সংখ্যাটি অন্য ক্রয়-তালিকার সঙ্গে তুলনার জন্য, কোনো একক চুক্তির বিচার নয়।",
      },
    ],
  },

  {
    k: "p",
    en: "At the other end of the same table, {{concentration.frequent.0.name|firm}} holds {{concentration.frequent.0.contracts|n}} contracts worth {{concentration.frequent.0.crore|cr}} — many small jobs rather than a few large ones. Both shapes are in Explore the data, firm by firm, with the tenders that make up each total.",
    bn: "একই তালিকার অন্য প্রান্তে {{concentration.frequent.0.name|firm}}-এর হাতে {{concentration.frequent.0.contracts|n}}টি চুক্তি, মূল্য {{concentration.frequent.0.crore|cr}} — কয়েকটি বড় কাজ নয়, বহু ছোট কাজ। দুই ধরনের চেহারাই ‘ডেটা ঘেঁটে দেখুন’ অংশে প্রতিষ্ঠান ধরে ধরে আছে, প্রতিটি যোগফল কোন দরপত্রগুলো দিয়ে তৈরি তা-সহ।",
  },

  /* ---- 12. the rules, and the honest limit on them ----------------------- */

  { k: "case", id: "rule_stack" },

  { k: "h2", en: "Eighteen rules, and where the documents fail them", bn: "আঠারোটি নিয়ম, আর নথিগুলো কোথায় সেগুলো মানেনি" },

  {
    k: "p",
    en: "Bangladesh has a rulebook for all this. The national standard tender document and the procurement rules set out what a notice has to contain and how far a condition is allowed to go — how much money a bidder may be asked to show in the bank, how many days must be left for bids to arrive. We took {{counts.rules|n}} of those requirements and turned each one into a question that can be asked of every tender in a table. Then we asked all of them of all {{counts.tenders|n}} tenders: {{rules_summary.tested_rows|n}} separate checks. Each check is recorded with the clause it came from and the page that clause is printed on, so you can go and read the rule yourself.",
    bn: "এসবের জন্য বাংলাদেশে একটি নিয়মপুস্তিকা আছে। জাতীয় আদর্শ দরপত্র দস্তাবেজ ও ক্রয় বিধিমালায় বলা আছে একটি বিজ্ঞপ্তিতে কী থাকতে হবে এবং কোনো শর্ত কত দূর যেতে পারে — দরদাতার কাছে ব্যাংকে কত টাকা দেখাতে চাওয়া যায়, দর জমা দেওয়ার জন্য কত দিন সময় রাখতে হয়। সেই শর্তগুলোর {{counts.rules|n}}টি নিয়ে আমরা প্রতিটিকে এমন একটি প্রশ্নে রূপ দিয়েছি, যা সারণিতে থাকা প্রতিটি দরপত্রকে করা যায়। তারপর সব প্রশ্নই করেছি {{counts.tenders|n}}টি দরপত্রের সবগুলোকে: মোট {{rules_summary.tested_rows|n}}টি আলাদা পরীক্ষা। প্রতিটি পরীক্ষা লেখা আছে কোন ধারা থেকে এসেছে ও সেই ধারা কোন পৃষ্ঠায় ছাপা, তা-সহ — যাতে আপনি নিজেই নিয়মটি পড়ে দেখতে পারেন।",
  },

  {
    k: "p",
    en: "In {{rules_summary.deviation_rows|n}} of those checks, the document did not match the clause we tested it against. {{rules_summary.tenders_with_any|n}} tenders have at least one such mismatch; {{rules_summary.tenders_with_none|n}} have none. Nine of the {{counts.rules|n}} rules recorded no mismatch anywhere — and one outcome is larger than the mismatches: in {{rules_summary.results.key=NOT_TESTABLE_DATA_ABSENT.n|n}} checks the test could not be run at all, because the field the rule needs is empty on the page.",
    bn: "ওই পরীক্ষাগুলোর {{rules_summary.deviation_rows|n}}টিতে নথি আর যে ধারার বিপরীতে মিলিয়ে দেখা হয়েছে, দুটি মেলেনি। {{rules_summary.tenders_with_any|n}}টি দরপত্রে অন্তত একটি করে এমন অমিল আছে; {{rules_summary.tenders_with_none|n}}টিতে একটিও নেই। {{counts.rules|n}}টি নিয়মের নয়টিতে কোথাও কোনো অমিলই ধরা পড়েনি — আর অমিলের চেয়েও বড় একটি ফলাফল আছে: {{rules_summary.results.key=NOT_TESTABLE_DATA_ABSENT.n|n}}টি পরীক্ষা চালানোই যায়নি, কারণ নিয়মটির যে ঘর দরকার পৃষ্ঠায় সেটি ফাঁকা।",
  },

  { k: "fig", id: "rules" },

  {
    k: "p",
    en: "That count of {{rules_summary.deviation_rows|n}} is not the finding, and we are not going to print it as one. Two things have to come off it first, in the open, and both of them cut it hard.",
    bn: "{{rules_summary.deviation_rows|n}} সংখ্যাটি কোনো সিদ্ধান্ত নয়, আর আমরা সেটিকে সিদ্ধান্ত হিসেবে ছাপছিও না। এর আগে দুটি জিনিস খোলাখুলিভাবে বাদ দিতে হয়, আর দুটিই সংখ্যাটিকে অনেকখানি কমিয়ে দেয়।",
  },

  {
    k: "p",
    en: "The first is time. The standard documents in this folder are dated December 2025; the contracts run from 2015 to 2026. Nobody breaks a rule that does not exist yet, so {{rules_summary.postdates_event|n}} of the {{rules_summary.deviation_rows|n}} mismatches are set aside outright: they cite a document written after the tender they are measured against. That leaves {{violations.in_force|n}} where the document cited can be placed at or before the year of the tender's own event.",
    bn: "প্রথমটি সময়। এই ফোল্ডারের আদর্শ দস্তাবেজগুলোর তারিখ ২০২৫ সালের ডিসেম্বর; চুক্তিগুলো ২০১৫ থেকে ২০২৬ সালের। যে নিয়ম এখনো তৈরিই হয়নি, তা কেউ ভাঙতে পারে না — তাই {{rules_summary.deviation_rows|n}}টি অমিলের {{rules_summary.postdates_event|n}}টি সরাসরি বাদ: এগুলো যে দরপত্রে প্রয়োগ করা হচ্ছে, তার চেয়ে পরে লেখা দস্তাবেজ উদ্ধৃত করে। বাকি থাকে {{violations.in_force|n}}টি, যেখানে উদ্ধৃত দস্তাবেজটিকে দরপত্রের নিজের ঘটনার বছরে বা তার আগে বসানো যায়।",
  },

  {
    k: "p",
    en: "The second is what the clause actually says. A clause that says “shall” is a duty; a figure a document recommends is not. Of the {{violations.in_force|n}}, {{violations.duty_in_force|n}} are against wording that reads as an obligation and {{violations.band_in_force|n}} against a recommended band, a ceiling written into a note, or guidance. The {{violations.duty_in_force|n}} sit across {{violations.duty_tenders|n}} tenders worth {{violations.duty_crore|cr}}. {{violations.by_agency.0.n|n}} of them are {{violations.by_agency.0.key|agency}}'s.",
    bn: "দ্বিতীয়টি ধারাটি আসলে কী বলে। যে ধারা বাধ্যকর ভাষায় লেখা, সেটি কর্তব্য; কোনো দস্তাবেজ যে অঙ্ক সুপারিশ করে, সেটি নয়। ওই {{violations.in_force|n}}টির {{violations.duty_in_force|n}}টি এমন ভাষার বিপরীতে যা বাধ্যবাধকতা হিসেবে পড়া যায়, আর {{violations.band_in_force|n}}টি সুপারিশকৃত সীমা, নোটে লেখা সর্বোচ্চ সীমা বা নির্দেশনার বিপরীতে। ওই {{violations.duty_in_force|n}}টি ছড়িয়ে আছে {{violations.duty_tenders|n}}টি দরপত্রে, যেগুলোর মূল্য {{violations.duty_crore|cr}}। এর {{violations.by_agency.0.n|n}}টি {{violations.by_agency.0.key|agency}}-এর।",
  },

  {
    k: "p",
    en: "{{violations.rules.code=R01.in_force|n}} of the {{violations.duty_in_force|n}} are the ownership field — the award notice not printing who owns the winning firm — and that one deserves less weight than its size suggests. Every notice in this set that does print an ownership table was signed in 2025 or 2026, not one before, so the field only became operable at the very end of the period. Within 2025 and 2026, where the disclosure is demonstrably possible because other notices manage it, {{violations.rules.code=R01.in_force|n}} above-floor contracts still print nothing against 39 that do. Set that rule aside and {{violations.duty_without_ownership|n}} are left. These are the four that name something a document was supposed to do and did not:",
    bn: "ওই {{violations.duty_in_force|n}}টির {{violations.rules.code=R01.in_force|n}}টি মালিকানার ঘর — চুক্তির বিজ্ঞপ্তিতে বিজয়ী প্রতিষ্ঠানের মালিক কে তা না ছাপা — আর আকারের তুলনায় এটির ওজন কম দেওয়াই উচিত। এই সংকলনের যে বিজ্ঞপ্তিগুলোতে মালিকানার তালিকা ছাপা হয়েছে সেগুলোর সবই ২০২৫ বা ২০২৬ সালে স্বাক্ষরিত, তার আগের একটিও নয় — অর্থাৎ ঘরটি কার্যকর হয়েছে এই সময়ের একেবারে শেষে। ২০২৫ ও ২০২৬ সালের ভেতরে, যেখানে অন্য বিজ্ঞপ্তিগুলো পারছে বলেই বোঝা যায় প্রকাশ করা সম্ভব, সেখানে সীমার উপরের {{violations.rules.code=R01.in_force|n}}টি চুক্তিতে কিছুই ছাপা হয়নি — বিপরীতে ৩৯টিতে হয়েছে। ওই নিয়মটি সরিয়ে রাখলে থাকে {{violations.duty_without_ownership|n}}টি। নথির যা করা উচিত ছিল অথচ করেনি, তা নাম ধরে বলে এই চারটি:",
  },

  {
    k: "p",
    en: "<b>{{violations.rules.code=R02.in_force|n}} contracts signed outside the time the clause allows.</b> The rulebook gives 14 days from the letter of acceptance up to BDT 50 million, 21 days to BDT 250 million and 28 above that. The award notice prints the date of the letter and the date of signing, so the arithmetic is the document's own and needs nothing added to it. Across the whole set, before the timing discount is applied at all, {{violations.rules.code=R02.deviations|n}} contracts run past the limit, worth {{violations.rules.code=R02.crore|cr}} between them.",
    bn: "<b>ধারায় দেওয়া সময়ের বাইরে স্বাক্ষরিত {{violations.rules.code=R02.in_force|n}}টি চুক্তি।</b> নিয়মপুস্তিকা কাজের চিঠির পর সময় দেয় পাঁচ কোটি টাকা পর্যন্ত ১৪ দিন, পঁচিশ কোটি পর্যন্ত ২১ দিন, তার বেশি হলে ২৮ দিন। চুক্তির বিজ্ঞপ্তিতে চিঠির তারিখ ও স্বাক্ষরের তারিখ দুটিই ছাপা থাকে, তাই হিসাবটি নথিরই নিজের — বাইরে থেকে কিছু যোগ করতে হয় না। সময়ের ছাড় দেওয়ার আগে পুরো সংকলনে সীমা পার করা চুক্তি {{violations.rules.code=R02.deviations|n}}টি, সব মিলিয়ে মূল্য {{violations.rules.code=R02.crore|cr}}।",
  },

  {
    k: "p",
    en: "<b>{{violations.rules.code=R03.in_force|n}} open tenders that required the bidder to already be enlisted.</b> The standard document says there shall not be any pre-conditions whatsoever for the sale of tender documents, and keeps enlistment for the limited method. {{violations.rules.code=R03.deviations|n}} notices in this set carry such a condition, and reading the wording on every one of them matters more than the count. 82 accept enlistment with any of several public bodies rather than with the office running the tender — the scene above is one of those — so the gate excludes only a firm never enlisted anywhere in the public sector. Four name a single authority and nothing else, which is the genuinely closed form. One asks for “Up-to-date enlistment of Cox's Bazar Development Authority” — the very office running the tender. Another, a gas pipeline job, will take only a contractor already holding “latest enlistment under category 1.3” with the gas utility the notice names. Those four are the ones to ask about.",
    bn: "<b>দরদাতাকে আগেই তালিকাভুক্ত থাকতে বলা {{violations.rules.code=R03.in_force|n}}টি খোলা দরপত্র।</b> আদর্শ দস্তাবেজে লেখা, দরপত্রের নথি বিক্রির ক্ষেত্রে কোনো পূর্বশর্তই থাকবে না, আর তালিকাভুক্তির শর্ত রাখা হয়েছে সীমিত পদ্ধতির জন্য। এই সংকলনের {{violations.rules.code=R03.deviations|n}}টি বিজ্ঞপ্তিতে এমন শর্ত আছে, আর প্রতিটির ভাষা পড়ে দেখা সংখ্যাটির চেয়ে বেশি জরুরি। ৮২টিতে দরপত্র আহ্বানকারী দপ্তরের নয়, কয়েকটি সরকারি সংস্থার যেকোনো একটিতে তালিকাভুক্তি হলেই চলে — উপরের দৃশ্যটি তার একটি — তাই ওই শর্তে কেবল সেই প্রতিষ্ঠানই বাদ পড়ে যা সরকারি খাতের কোথাও কখনো তালিকাভুক্ত হয়নি। চারটিতে একটিমাত্র সংস্থার নাম আছে, আর কিছু নয় — এটিই সত্যিকারের বন্ধ রূপ। একটিতে চাওয়া হয়েছে কক্সবাজার উন্নয়ন কর্তৃপক্ষের হালনাগাদ তালিকাভুক্তি — অর্থাৎ যে দপ্তরটি নিজেই দরপত্র ডেকেছে তারই তালিকা। আরেকটিতে, গ্যাসের পাইপলাইনের কাজে, কেবল সেই ঠিকাদারই চলবে যার বিজ্ঞপ্তিতে নাম থাকা গ্যাস সংস্থার নির্দিষ্ট শ্রেণিতে হালনাগাদ তালিকাভুক্তি আছে। প্রশ্ন করার জায়গা ওই চারটি।",
  },

  {
    k: "p",
    en: "<b>{{violations.rules.code=R05.in_force|n}} notices that decide responsiveness with a fixed price band.</b> A bid more than a set percentage above or below the estimate is declared unacceptable on the spot, usually 10% either way. The standard document does something else: it computes the lower limit from the actual spread of the bids received, and allows a flat percentage only where a single responsive tender exists — and there the figure is 20%, twice the notices'. A fixed band replaces a test that depends on the bids with a number set before they arrive. {{violations.rules.code=R05.deviations|n}} notices in this set do it. Those notices run from 2019, and the clause setting out the computed limit is December 2025 text, so this is a departure from the current standard rather than a breach of a 2019 one.",
    bn: "<b>নির্দিষ্ট দরসীমা দিয়ে গ্রহণযোগ্যতা ঠিক করা {{violations.rules.code=R05.in_force|n}}টি বিজ্ঞপ্তি।</b> প্রাক্কলনের চেয়ে নির্দিষ্ট শতাংশের বেশি উপরে বা নিচের দর সঙ্গে সঙ্গেই অগ্রহণযোগ্য ঘোষণা করা হয় — সাধারণত দুদিকেই ১০ শতাংশ। আদর্শ দস্তাবেজ অন্য কিছু করে: যেসব দর আসলে জমা পড়েছে তাদের প্রকৃত বিস্তার থেকে নিচের সীমাটি হিসাব করে বের করে, আর একটিমাত্র গ্রহণযোগ্য দর থাকলেই থোক শতাংশ ব্যবহার করতে দেয় — সেখানেও অঙ্কটি ২০ শতাংশ, বিজ্ঞপ্তিগুলোর দ্বিগুণ। বাঁধা সীমা দরের উপর নির্ভরশীল একটি পরীক্ষাকে সরিয়ে দিয়ে বসায় এমন একটি সংখ্যা, যা দর আসার আগেই ঠিক করা। এই সংকলনের {{violations.rules.code=R05.deviations|n}}টি বিজ্ঞপ্তি তা-ই করে। ওই বিজ্ঞপ্তিগুলো ২০১৯ সাল থেকে, আর হিসাব করে সীমা বের করার ধারাটি ২০২৫ সালের ডিসেম্বরের লেখা — তাই এটি চলতি আদর্শ থেকে সরে আসা, ২০১৯ সালের কোনো নিয়ম ভাঙা নয়।",
  },

  {
    k: "p",
    en: "<b>{{violations.rules.code=R04.in_force|n}} tenders marked awarded with no award record published at all.</b> Across the whole set that is {{violations.rules.code=R04.deviations|n}} tenders whose status says a contract exists and for which no contract notice was ever released. This is the weakest of the four as an inference — a document missing from a folder is not proof of a document never published — and it is the one to hold most lightly.",
    bn: "<b>চুক্তিপ্রাপ্ত লেখা, অথচ চুক্তির কোনো নথিই প্রকাশিত নয় — এমন {{violations.rules.code=R04.in_force|n}}টি দরপত্র।</b> পুরো সংকলনে এমন দরপত্র {{violations.rules.code=R04.deviations|n}}টি, যেগুলোর অবস্থা বলছে চুক্তি হয়েছে অথচ চুক্তির কোনো বিজ্ঞপ্তি কখনো প্রকাশ করা হয়নি। অনুমান হিসেবে চারটির মধ্যে এটিই সবচেয়ে দুর্বল — ফোল্ডারে একটি নথি না থাকা মানে নথিটি কখনো প্রকাশিত হয়নি তার প্রমাণ নয় — আর এটিকেই সবচেয়ে হালকাভাবে ধরা উচিত।",
  },

  { k: "fig", id: "violations" },

  {
    k: "p",
    en: "The remaining {{violations.band_in_force|n}} are a different kind of thing and we are not calling them breaches. {{violations.rules.code=R07.in_force|n}} ask for more financial capacity than the standard document recommends and {{violations.rules.code=R06.in_force|n}} for a larger single past contract; the document recommends bands there, it does not forbid going above them. {{violations.rules.code=R08.in_force|n}} took a tender security above the 3% the data sheet's note sets as a ceiling — but that ceiling is a share of the official cost estimate, and the estimate is published nowhere in these {{counts.pdfs|n}} files, so the share is measured against the awarded price instead, which is not the same denominator. {{violations.rules.code=R09.in_force|n}} required a manufacturer's authorisation letter on a goods package where the default is that none is needed; most are lifts, substations, generators and servers, where asking for one has an ordinary engineering reason.",
    bn: "বাকি {{violations.band_in_force|n}}টি ভিন্ন ধরনের জিনিস, আর সেগুলোকে আমরা নিয়মভঙ্গ বলছি না। {{violations.rules.code=R07.in_force|n}}টিতে আদর্শ দস্তাবেজের সুপারিশের চেয়ে বেশি আর্থিক সক্ষমতা চাওয়া হয়েছে আর {{violations.rules.code=R06.in_force|n}}টিতে আগের একক কাজের বড় অঙ্ক; ওখানে দস্তাবেজ সীমা সুপারিশ করে, তার উপরে যাওয়া নিষেধ করে না। {{violations.rules.code=R08.in_force|n}}টিতে ডেটা শিটের নোটে দেওয়া ৩ শতাংশ সর্বোচ্চ সীমার বেশি দরপত্র জামানত নেওয়া হয়েছে — তবে ওই সীমা সরকারি প্রাক্কলিত ব্যয়ের অংশ, আর এই {{counts.pdfs|n}}টি ফাইলের কোথাও প্রাক্কলন প্রকাশ করা নেই, তাই অংশটি মাপা হয়েছে চুক্তিমূল্যের বিপরীতে — যা একই ভাজক নয়। {{violations.rules.code=R09.in_force|n}}টিতে পণ্যের প্যাকেজে প্রস্তুতকারকের অনুমোদনপত্র চাওয়া হয়েছে যেখানে সাধারণ নিয়ম হলো লাগে না; এগুলোর বেশির ভাগ লিফট, সাবস্টেশন, জেনারেটর ও সার্ভার, যেখানে ওই পত্র চাওয়ার সাধারণ কৌশলগত কারণ থাকে।",
  },

  {
    k: "p",
    en: "None of that is a finding that a law was broken. Four limits sit on it, and Data & method sets out all four. What is published here is {{violations.duty_without_ownership|n}} places where a government document does not do what the government's own standard document says it must — put on the record so the officials who wrote them can answer.",
    bn: "এর কোনোটিই আইন ভাঙার সিদ্ধান্ত নয়। এর উপর চারটি সীমা আছে, ‘ডেটা ও পদ্ধতি’ অংশে চারটিই লেখা আছে। এখানে যা প্রকাশ করা হলো তা এমন {{violations.duty_without_ownership|n}}টি জায়গা, যেখানে একটি সরকারি নথি সরকারের নিজের আদর্শ দস্তাবেজে যা করতে বলা আছে তা করেনি — নথিতে তোলা হলো, যাতে যাঁরা সেগুলো লিখেছেন তাঁরা উত্তর দিতে পারেন।",
  },

  /* ---- 13. where the signals stack up ------------------------------------
     The composite reading, and the only section built on this investigation's
     own tests rather than the standard document's words. It goes last of the
     findings for that reason, and the figure comes before the scene because the
     scene's second paragraph points up at it. */

  { k: "h2", en: "Where the signals stack up", bn: "যেখানে সংকেতগুলো একসঙ্গে জমে" },

  {
    k: "p",
    en: "Every test in this report has been applied one at a time. A notice can be thin on bidders for an innocent reason, and a demanding clause can simply reflect a demanding job. So we asked the flat question a reporter asks next: how often do these things turn up together on the same tender? Of the {{counts.tenders|n}} notices, {{preselection.stages.key=0.n|n}} meet none of the seven conditions in the figure below and {{preselection.stages.key=1.n|n}} meet exactly one — most of this set looks unremarkable when you test it this way. {{preselection.stages.key=5.n|n}} meet five, {{preselection.stages.key=6.n|n}} meet six, and {{preselection.stages.key=7.n|n}} meets all seven.",
    bn: "এই প্রতিবেদনের প্রতিটি পরীক্ষা এতক্ষণ একটি করে প্রয়োগ করা হয়েছে। নির্দোষ কারণেও কোনো বিজ্ঞপ্তিতে দরদাতা কম হতে পারে, আর কঠিন কাজের বেলায় কঠিন শর্ত থাকাটাই স্বাভাবিক। তাই এরপর একজন প্রতিবেদক যে সরল প্রশ্নটি করেন সেটিই আমরা করেছি: একই দরপত্রে এই জিনিসগুলো একসঙ্গে কতবার আসে? {{counts.tenders|n}}টি বিজ্ঞপ্তির মধ্যে {{preselection.stages.key=0.n|n}}টিতে নিচের চিত্রের সাতটি শর্তের একটিও মেলে না, আর {{preselection.stages.key=1.n|n}}টিতে মেলে ঠিক একটি — এভাবে পরীক্ষা করলে এই সম্ভারের বেশির ভাগই সাধারণ দেখায়। {{preselection.stages.key=5.n|n}}টিতে মেলে পাঁচটি, {{preselection.stages.key=6.n|n}}টিতে ছয়টি, আর {{preselection.stages.key=7.n|n}}টিতে সাতটিই।",
  },

  {
    k: "p",
    en: "The composite score we built from those seven puts {{priority.bands.key=HIGH.n|n}} of the {{counts.tenders|n}} tenders in the top band and {{priority.bands.key=MEDIUM.n|n}} in the middle one, against a median score of {{priority.spread.median|n}} and a highest score anywhere in the set of {{priority.spread.max|n1}}. The seven conditions are this investigation's own tests, not any authority's — no office has classified any of these tenders as anything. That ranking is a reading order for reporters and auditors. It is not a verdict, and nothing in it should be published as one.",
    bn: "ওই সাতটি মিলিয়ে আমরা যে সমন্বিত নম্বর বানিয়েছি, তাতে {{counts.tenders|n}}টি দরপত্রের {{priority.bands.key=HIGH.n|n}}টি পড়ে সবচেয়ে উপরের ধাপে আর {{priority.bands.key=MEDIUM.n|n}}টি মাঝের ধাপে, যেখানে মধ্যক নম্বর {{priority.spread.median|n}} এবং গোটা সম্ভারে সর্বোচ্চ নম্বর {{priority.spread.max|n1}}। সাতটি শর্ত এই অনুসন্ধানের নিজের পরীক্ষা, কোনো সংস্থার নয় — কোনো দপ্তর এই দরপত্রগুলোর কোনোটিকে কোনো শ্রেণিতে ফেলেনি। ওই ক্রম প্রতিবেদক ও নিরীক্ষকদের জন্য পড়ার একটি ক্রম। এটি রায় নয়, আর এর কিছুই রায় হিসেবে প্রকাশ করা উচিত নয়।",
  },

  { k: "fig", id: "stack" },

  { k: "case", id: "preselection" },

  /* ---- 14. the six bodies, side by side -----------------------------------
     Everything this section compares has already been established one measure
     at a time, which is why it goes here and not near the top: the comparison
     is only honest once the reader knows what each column is counting. It is
     also where the article says out loud that the six-way count is ours and
     that the map it would have been cannot be drawn from these documents. */

  { k: "h2", en: "Six authorities, and no single worst one", bn: "ছয় সংস্থা, আর ‘সবচেয়ে খারাপ’ বলে একটিও নেই" },

  {
    k: "p",
    en: "So which of the six is the worst? The record does not answer with a name. {{authority.lead_n|n}} of them sit on the worse side of the middle on {{authority.lead_above|n}} of the six measures below: {{authority.lead.0|agency}}, {{authority.lead.1|agency}} and {{authority.lead.2|agency}}. Between them they hold {{authority.lead_crore|cr}} of the {{money.crore|cr}} in this set — {{authority.lead_share|pct}} of the money.",
    bn: "তাহলে ছয়টির মধ্যে সবচেয়ে খারাপ কোনটি? নথি কোনো একটি নাম দিয়ে উত্তর দেয় না। নিচের ছয়টি মাপের {{authority.lead_above|n}}টিতেই মাঝের মানের খারাপ দিকে আছে {{authority.lead_n|n}}টি সংস্থা: {{authority.lead.0|agency}}, {{authority.lead.1|agency}} ও {{authority.lead.2|agency}}। এদের হাতেই এই সম্ভারের {{money.crore|cr}} টাকার {{authority.lead_crore|cr}} — অর্থের {{authority.lead_share|pct}}।",
  },

  {
    k: "p",
    en: "Which of them is worst depends entirely on which measure you pick, and that is the finding. On notices that publish no bar the highest share is {{authority.measures.no_criteria.worst|agency}}'s, {{authority.measures.no_criteria.worst_pct|pct}} of its notices. On tenders where one bid survived it is {{authority.measures.one_resp.worst|agency}}'s, at {{authority.measures.one_resp.worst_pct|pct}}. On the price corridor, {{authority.measures.band.worst|agency}}'s, at {{authority.measures.band.worst_pct|pct}}. On contracts signed outside the legal window, {{authority.measures.late.worst|agency}}'s, at {{authority.measures.late.worst_pct|pct}}. On one firm's share of a body's money, {{authority.measures.top1.worst|agency}}'s, at {{authority.measures.top1.worst_pct|pct}}. And on departures from a clause worded as a duty, {{authority.measures.duty.worst|agency}}'s, at {{authority.measures.duty.worst_pct|pct}}. Whichever of the six you weight most heavily decides which body you name — and nothing in these documents tells you which to weight most heavily.",
    bn: "কোনটি সবচেয়ে খারাপ, তা পুরোপুরি নির্ভর করে আপনি কোন মাপটি বেছে নিচ্ছেন — এবং সেটিই এখানকার ফলাফল। যেসব বিজ্ঞপ্তিতে কোনো শর্তই প্রকাশিত নয়, সেই হারে সবচেয়ে উপরে {{authority.measures.no_criteria.worst|agency}} — নিজের বিজ্ঞপ্তির {{authority.measures.no_criteria.worst_pct|pct}}। যেসব দরপত্রে একটি দরই টিকেছে, সেখানে {{authority.measures.one_resp.worst|agency}} — {{authority.measures.one_resp.worst_pct|pct}}। দামের বলয়ে {{authority.measures.band.worst|agency}} — {{authority.measures.band.worst_pct|pct}}। আইনি সময়সীমার বাইরে স্বাক্ষরিত চুক্তিতে {{authority.measures.late.worst|agency}} — {{authority.measures.late.worst_pct|pct}}। সংস্থার অর্থের কত অংশ এক প্রতিষ্ঠানের হাতে, সেই মাপে {{authority.measures.top1.worst|agency}} — {{authority.measures.top1.worst_pct|pct}}। আর বাধ্যতামূলক ভাষায় লেখা ধারা থেকে বিচ্যুতিতে {{authority.measures.duty.worst|agency}} — {{authority.measures.duty.worst_pct|pct}}। ছয়টির কোনটিকে আপনি সবচেয়ে বেশি ভার দেবেন, তাতেই ঠিক হয় আপনি কোন সংস্থার নাম বলবেন — আর কোনটিকে বেশি ভার দিতে হবে, এই নথিগুলোর কিছুই তা বলে না।",
  },

  { k: "fig", id: "authorityMap" },

  {
    k: "p",
    en: "The last column is a count we made. It is not a ranking any of these bodies published, and two things sit under it. The six are nowhere near the same size — {{authority.rows.key=RAJUK.tenders|n}} of the notices are {{authority.rows.key=RAJUK.key|agency}}'s and {{authority.rows.key=GDA.tenders|n}} are {{authority.rows.key=GDA.key|agency}}'s — so a share in the smallest column can move on a handful of documents. And a blank is not a clean record: only {{authority.measures.one_resp.measured|n}} of the six publish a bid count anywhere, so the sixth is left out of that column rather than scored as nought, which is why its row reads {{authority.rows.key=GDA.above|n}} of {{authority.rows.key=GDA.measured|n}} where the others read out of {{authority.of|n}}.",
    bn: "শেষ কলামটি আমাদেরই গোনা। এই সংস্থাগুলোর কারও প্রকাশ করা কোনো তালিকা এটি নয়, আর এর নিচে দুটি কথা থাকে। ছয়টির আকার কাছাকাছিও নয় — বিজ্ঞপ্তিগুলোর {{authority.rows.key=RAJUK.tenders|n}}টি {{authority.rows.key=RAJUK.key|agency}}-এর আর {{authority.rows.key=GDA.tenders|n}}টি {{authority.rows.key=GDA.key|agency}}-এর — ফলে সবচেয়ে ছোট ঘরে গুটিকয় নথিতেই হার নড়ে যায়। আর ঘর ফাঁকা থাকা মানে নথি পরিষ্কার নয়: ছয়টির মধ্যে মাত্র {{authority.measures.one_resp.measured|n}}টি কোথাও দরের সংখ্যা প্রকাশ করে, তাই ষষ্ঠটিকে ওই কলামে শূন্য না ধরে বাদ রাখা হয়েছে — এ কারণেই তার সারিতে লেখা {{authority.rows.key=GDA.measured|n}}-এর মধ্যে {{authority.rows.key=GDA.above|n}}, যেখানে বাকিদের বেলায় {{authority.of|n}}।",
  },

  { k: "fig", id: "authority" },

  {
    k: "p",
    en: "The districts on those notices show one more thing. {{authority.districts|n}} district names appear across the set, printed by the authorities themselves — and {{authority.second_named.0|agency}}'s notices print their own under two spellings, {{authority.rows.key=CDA.printed.0.key|place}} on {{authority.rows.key=CDA.printed.0.n|n}} notices and {{authority.rows.key=CDA.printed.1.key|place}} on {{authority.rows.key=CDA.printed.1.n|n}}. Both are reported as printed. Neither is merged into the other.",
    bn: "ওই বিজ্ঞপ্তির জেলার নামগুলো আরও একটি জিনিস দেখায়। গোটা সম্ভারে সংস্থাগুলোর নিজেদের ছাপা {{authority.districts|n}}টি জেলার নাম আছে — আর {{authority.second_named.0|agency}}-এর বিজ্ঞপ্তিতে নিজেদের জেলার নাম দুই বানানে ছাপা হয়েছে: {{authority.rows.key=CDA.printed.0.n|n}}টিতে এক বানানে, {{authority.rows.key=CDA.printed.1.n|n}}টিতে অন্য বানানে। দুটিই যেমন ছাপা হয়েছে তেমনই জানানো হলো; একটিকে অন্যটির সঙ্গে মিলিয়ে দেওয়া হয়নি।",
  },

  {
    k: "p",
    en: "One figure is the same in all six rows, and it is the one that matters most to the argument this article opened with. {{authority.rejected|n}} bids were set aside across the six authorities, and not one of the six publishes a reason for a single one of them. On whether a narrower field costs the public more, the six differ on every measure of how the field was narrowed — and agree exactly on what they do not say.",
    bn: "একটি সংখ্যা ছয়টি সারিতেই এক, আর এই লেখা যে তর্ক নিয়ে শুরু হয়েছিল তার জন্য সেটিই সবচেয়ে জরুরি। ছয় সংস্থায় মিলিয়ে {{authority.rejected|n}}টি দর বাদ দেওয়া হয়েছে, আর ছয়টির একটিও তার একটিরও কারণ প্রকাশ করে না। প্রতিযোগিতা সংকুচিত হলে জনগণের খরচ বাড়ে কি না — এই প্রশ্নে প্রতিযোগিতা কীভাবে সংকুচিত হলো তার প্রতিটি মাপে ছয়টি সংস্থা আলাদা, আর যা তারা বলে না, তাতে ছয়টিই হুবহু এক।",
  },
];

/* --------------------------------------------------- the closing two sections
   The limits, and the doors onto the working material. Both of these used to be
   the last two headings of the article, where a reader who had just finished the
   story met a wall of caution and a list of links before the page would let them
   go. They are not the reading — they are what the reading was built from and
   what it cannot say — so they now sit in the stack at the foot of the page with
   the other sections: closed until a reader opens one, and headed there by the
   same words that headed them here.

   Not one sentence is rewritten. story.js draws these with the same builders it
   draws the article with, so a finding in this stack looks exactly like a
   finding in the article, and "every finding above" still points above. The two
   <h2> blocks are gone and nothing else is: the disclosure a section opens out
   of is its heading, and a second copy of the same words under it would be a
   heading twice. */

export const LIMITS = [
  {
    k: "p",
    en: "This is the part of an investigation that usually goes unpublished. Three things are missing from the public record in a way that limits every finding above — one of them from every single tender — and a fourth limit is in how this set was put together.",
    bn: "অনুসন্ধানের এই অংশটিই সাধারণত অপ্রকাশিত থেকে যায়। উপরের প্রতিটি ফলাফলকে সীমিত করে দেয় এমন তিনটি জিনিস প্রকাশিত নথিতে নেই — তার একটি নেই একটি দরপত্রেও — আর চতুর্থ সীমাটি এই সম্ভার যেভাবে গোছানো হয়েছে তার ভেতরেই।",
  },

  {
    k: "finding",
    tag: "unresolved",
    h: { en: "The evaluation record", bn: "মূল্যায়নের নথি" },
    p: [
      {
        en: "When a bid is set aside, the notice does not say why. The reason each of the {{field.lost|n}} rejected bids failed is nowhere in this set, and neither are the losing firms' names or the prices they offered. So nobody outside the evaluation room can tell a correct rejection from a wrong one — not the company that lost, not an auditor, not us. Every claim in this investigation about how a field narrowed stops at that wall.",
        bn: "কোনো দর বাদ পড়লে বিজ্ঞপ্তিতে লেখা থাকে না কেন বাদ পড়ল। বাতিল হওয়া {{field.lost|n}}টি দরের প্রতিটি কেন ব্যর্থ হলো, তা এই নথিগুলোর কোথাও নেই; পরাজিত প্রতিষ্ঠানের নাম বা তাদের দেওয়া দরও নেই। ফলে মূল্যায়নের ঘরের বাইরের কেউ সঠিক বাতিলকে ভুল বাতিল থেকে আলাদা করতে পারেন না — যে প্রতিষ্ঠান হেরেছে তারা নয়, নিরীক্ষক নয়, আমরাও নই। প্রতিযোগিতা কীভাবে সংকুচিত হলো, সে সম্পর্কে এই অনুসন্ধানের প্রতিটি দাবি ওই দেয়ালেই থেমে যায়।",
      },
    ],
  },

  {
    k: "finding",
    tag: "unresolved",
    h: { en: "The official cost estimate", bn: "সরকারি প্রাক্কলিত ব্যয়" },
    p: [
      {
        en: "This is the limit the top of the article is about, restated as a limit on us. The estimate appears in none of these {{counts.tenders|n}} tenders, so we can tell you what was paid and we cannot tell you what it should have been. No price anywhere in this investigation is called excessive, inflated or suspiciously low, and none of the {{counts.awarded|n}} contracts is presented as good or bad value. What we report is that the checks the rulebook builds on that figure — {{estimate.lowest_price_test.tested|n}} of them on the price and {{estimate.single_tender_test.tested|n}} on the lone survivor — cannot be completed by anyone reading the published record.",
        bn: "লেখার শুরুতে যে সীমাটির কথা, এটি সেটিই — এবার আমাদের নিজেদের সীমা হিসেবে। এই {{counts.tenders|n}}টি দরপত্রের একটিতেও প্রাক্কলনটি নেই, তাই কত টাকা দেওয়া হয়েছে তা আমরা বলতে পারি, কত হওয়া উচিত ছিল তা পারি না। এই অনুসন্ধানের কোথাও কোনো দরকে অতিরিক্ত, বাড়ানো বা সন্দেহজনকভাবে কম বলা হয়নি, আর {{counts.awarded|n}}টি চুক্তির কোনোটিকেই সুলভ বা অসুলভ বলে দেখানো হয়নি। আমরা যা জানাচ্ছি তা হলো, নিয়মপুস্তিকা ওই সংখ্যাটির ওপর যে যাচাইগুলো দাঁড় করিয়েছে — দামের ক্ষেত্রে {{estimate.lowest_price_test.tested|n}}টি, একমাত্র টিকে থাকা দরের ক্ষেত্রে {{estimate.single_tender_test.tested|n}}টি — প্রকাশিত নথি পড়ে কারও পক্ষেই সেগুলো শেষ করা সম্ভব নয়।",
      },
    ],
  },

  {
    k: "finding",
    tag: "unresolved",
    h: { en: "Who owns the winning firms", bn: "বিজয়ী প্রতিষ্ঠানের মালিক কারা" },
    p: [
      {
        en: "The award notice has a box for the person who actually owns a winning company. It is filled in {{ownership.disclosed|n}} times out of {{counts.awarded|n}}. We are deliberately not making much of that raw number, and it is worth saying why. The duty to publish the name only arrived in {{ownership.instrument_dated|month}}, and {{ownership.signed_before_2025_undisclosed|n}} of the empty boxes sit on contracts signed years before that duty existed. A blank box on a 2019 notice is not somebody hiding something.",
        bn: "চুক্তির বিজ্ঞপ্তিতে বিজয়ী প্রতিষ্ঠানের প্রকৃত মালিক কে, তা লেখার ঘর আছে। {{counts.awarded|n}}টির মধ্যে সেটি পূরণ করা হয়েছে {{ownership.disclosed|n}} বার। কাঁচা এই সংখ্যাটি নিয়ে আমরা সচেতনভাবেই বড় কিছু বলছি না, আর কেন বলছি না তা বলে রাখা দরকার। নামটি প্রকাশের বাধ্যবাধকতা এসেছে {{ownership.instrument_dated|month}}-এ, আর খালি ঘরগুলোর {{ownership.signed_before_2025_undisclosed|n}}টি এমন চুক্তিতে, যেগুলো ওই বাধ্যবাধকতা তৈরি হওয়ার বছরখানেক আগেই স্বাক্ষরিত। ২০১৯ সালের বিজ্ঞপ্তির একটি খালি ঘর কারও কিছু লুকিয়ে রাখা নয়।",
      },
      {
        en: "The count that survives that objection is the narrow one: {{ownership.live_window_total|n}} contracts were signed while the duty was demonstrably in force. Of those, {{ownership.live_window_undisclosed|n}} leave the owner blank and {{ownership.live_window_disclosed|n}} name one — {{ownership.live_window_pct|pct}} unfilled. That is a fair question to put to the six authorities about how they fill in their own forms, and it is not, on its own, evidence of anything more than that.",
        bn: "ওই আপত্তির পরেও যে হিসাবটি টেকে, সেটি সংকীর্ণ হিসাবই: {{ownership.live_window_total|n}}টি চুক্তি স্বাক্ষরিত হয়েছে এমন সময়ে, যখন বাধ্যবাধকতাটি প্রমাণিতভাবে বলবৎ ছিল। তার {{ownership.live_window_undisclosed|n}}টিতে মালিকের ঘর খালি, {{ownership.live_window_disclosed|n}}টিতে নাম আছে — অর্থাৎ {{ownership.live_window_pct|pct}} অপূর্ণ। নিজেদের ফর্ম তারা কীভাবে পূরণ করে, তা নিয়ে ছয় সংস্থাকে করার মতো এটি একটি ন্যায্য প্রশ্ন — এবং নিজে থেকে এর বেশি কিছুর প্রমাণ নয়।",
      },
      {
        en: "Where a name is published we have kept it: {{ownership.named_owners|n}} owner names appear across these files, along with {{ownership.jv_partner_rows|n}} rows for partners in joint ventures, {{ownership.jv_share_unpublished|n}} of which give the partner's share as unpublished or as zero. All of it is in the data downloads.",
        bn: "যেখানে নাম প্রকাশিত, সেখানে আমরা তা রেখে দিয়েছি: এই ফাইলগুলোতে {{ownership.named_owners|n}}টি মালিকের নাম পাওয়া গেছে, সঙ্গে যুগ্ম-উদ্যোগের অংশীদারের {{ownership.jv_partner_rows|n}}টি সারি, যার {{ownership.jv_share_unpublished|n}}টিতে অংশীদারের হিস্যা অপ্রকাশিত বা শূন্য দেখানো। সবই ডেটা ডাউনলোডে আছে।",
      },
    ],
  },

  {
    k: "finding",
    tag: "fact",
    h: { en: "Six folders, and nine documents that name a seventh body", bn: "ছয়টি ফোল্ডার, আর নয়টি নথি যেখানে অন্য সংস্থার নাম" },
    p: [
      {
        en: "The six authorities in this report are the six folders these documents arrived in. On {{provenance.other_body_n|n}} of the {{counts.tenders|n}} notices the document's own Agency line names a different public body altogether. {{provenance.other_body_agencies|n}} of the six folders are affected, {{provenance.other_body_awarded|n}} of those notices became contracts, and together they are worth {{provenance.other_body_crore|cr}} — far too small a share of {{money.crore|cr}} to move any figure above. The documents do not say why. It could be one authority running a package on another's behalf, or a file lodged in the wrong folder, and nothing on the page settles which. Every scene on this page prints the body the document itself names rather than the folder it sat in, which is why the first case in this report is filed under one authority and headed by another. On {{provenance.no_body_named|n}} further notices no body is named at all.",
        bn: "এই প্রতিবেদনের ছয়টি সংস্থা মানে সেই ছয়টি ফোল্ডার, যেগুলোতে করে নথিগুলো এসেছে। {{counts.tenders|n}}টি বিজ্ঞপ্তির {{provenance.other_body_n|n}}টিতে নথির নিজের সংস্থার ঘরে সম্পূর্ণ আলাদা একটি সরকারি প্রতিষ্ঠানের নাম লেখা। ছয়টি ফোল্ডারের {{provenance.other_body_agencies|n}}টি এতে পড়ে, ওই বিজ্ঞপ্তিগুলোর {{provenance.other_body_awarded|n}}টি চুক্তিতে গিয়েছে, আর সবগুলোর মিলিত মূল্য {{provenance.other_body_crore|cr}} — উপরের কোনো সংখ্যা নড়াতে হলে {{money.crore|cr}}-এর তুলনায় এই অংশ যথেষ্ট নয়, অনেক কম। কেন এমন, নথিগুলো তা বলে না। হতে পারে এক সংস্থা অন্যের হয়ে কাজটি চালাচ্ছে, হতে পারে ফাইলটি ভুল ফোল্ডারে গেছে — পৃষ্ঠায় এমন কিছু নেই যা এর মধ্যে বেছে দেয়। এই পৃষ্ঠার প্রতিটি দৃশ্যে ফোল্ডারের নাম নয়, নথি নিজে যে প্রতিষ্ঠানের নাম লিখেছে সেটিই ছাপা হয়েছে — এ কারণেই এই প্রতিবেদনের প্রথম ঘটনাটি এক সংস্থার ফোল্ডারে থাকলেও তার মাথায় অন্য সংস্থার নাম। আরও {{provenance.no_body_named|n}}টি বিজ্ঞপ্তিতে কোনো প্রতিষ্ঠানের নামই নেই।",
      },
    ],
  },
];

export const CHECK = [
  {
    k: "p",
    en: "Nothing above has to be taken on trust. Every figure in this article is worked out, as the page is built, from the spreadsheets underneath it; every tender has a record of its own; and every record links back to the PDF pages it was read from. The four doors below open onto that working material.",
    bn: "উপরের কিছুই বিশ্বাসের ওপর নেওয়ার দরকার নেই। এই লেখার প্রতিটি সংখ্যা পাতাটি তৈরি হওয়ার সময়েই নিচের ডেটা ফাইলগুলো থেকে বের করা; প্রতিটি দরপত্রের নিজস্ব নথি আছে; আর প্রতিটি নথি সেই পিডিএফ পৃষ্ঠার সঙ্গে যুক্ত, যেখান থেকে তা পড়া হয়েছে। নিচের চারটি দরজা সেই কাজের উপকরণেই খোলে।",
  },

  { k: "doors" },

  {
    k: "p",
    en: "If a number in this article cannot be reproduced from those files, it is a mistake and we want to be told. Every correction already made to the data is listed at the foot of Data & method, with the figure before, the figure after, and the document that settled it.",
    bn: "এই লেখার কোনো সংখ্যা যদি ওই ফাইলগুলো থেকে আবার বের করা না যায়, সেটি ভুল — এবং আমরা তা জানতে চাই। ডেটায় এ পর্যন্ত করা প্রতিটি সংশোধন ‘ডেটা ও পদ্ধতি’ অংশের শেষে তালিকাভুক্ত: আগের সংখ্যা, পরের সংখ্যা, আর যে নথি বিষয়টি নিষ্পত্তি করেছে।",
  },
];

/* ------------------------------------------------------------- method notes
   Everything a reader has to know before quoting a figure, and nothing a reader
   has to read to follow the story. Three of these groups used to sit inside the
   article as boxed asides, where they stopped the narrative to explain the
   method; the rest are the caveats that used to run on past the first sentence
   of a figure's source line. Both kinds belong here, and the article keeps a
   one-sentence pointer where each of them stood, so nothing is quietly dropped.

   Written as {en, bn} pairs with {{tokens}} like every other string in this
   file: method.js resolves them against corpus.json, so not one figure in a
   caution is typed by hand either. */

export const METHOD_NOTES = [
  {
    title: { en: "Two things that weaken the price-corridor section", bn: "দামের বলয়ের অংশটি যে দুটি কারণে দুর্বল" },
    p: [
      {
        en: "The first is a date. The standard document that sets a computed price floor from the actual spread of bids, and a {{estimate.std_pct|n}} per cent test against the estimate for a lone survivor, is December 2025 text. These notices run from long before that: on the year-granularity test, {{estimate.band_predates_standard|n}} of the {{estimate.band_notices|n}} were published before the machinery they depart from existed, and only {{estimate.band_standard_in_force|n}} were published when it was plausibly in force. Read the flat band as a departure from the current standard, then — not as a breach at the time it was written. What does not depend on the date is the arithmetic: a notice that rejects a price {{estimate.width_common|n}} per cent below the estimate caps the saving at {{estimate.width_common|n}} per cent, whatever rulebook is in force.",
        bn: "প্রথমটি একটি তারিখ। যে আদর্শ দস্তাবেজ দরগুলোর প্রকৃত বিস্তার থেকে দামের একটি গণনাকৃত মেঝে ঠিক করে, আর একটিমাত্র দরপত্র টিকলে প্রাক্কলনের সঙ্গে {{estimate.std_pct|n}} শতাংশের পরীক্ষা দেয়, সেটি ২০২৫ সালের ডিসেম্বরের লেখা। এই বিজ্ঞপ্তিগুলো তার অনেক আগে থেকে: বছরের হিসাবে চলা পরীক্ষায় {{estimate.band_notices|n}}টির {{estimate.band_predates_standard|n}}টিই প্রকাশিত হয়েছে ওই কাঠামো তৈরি হওয়ার আগে, আর কেবল {{estimate.band_standard_in_force|n}}টি প্রকাশিত হয়েছে যখন সেটি সম্ভাব্যভাবে বলবৎ ছিল। তাই নির্দিষ্ট শতাংশের বলয়টিকে পড়ুন বর্তমান আদর্শ থেকে সরে যাওয়া হিসেবে — লেখার সময়ের নিয়ম ভাঙা হিসেবে নয়। তারিখের ওপর যা নির্ভর করে না, সেটি অঙ্ক: যে বিজ্ঞপ্তি প্রাক্কলনের {{estimate.width_common|n}} শতাংশ নিচের দর বাতিল করে, সেটি সাশ্রয়ের সীমা {{estimate.width_common|n}} শতাংশেই বেঁধে দেয় — যে নিয়মপুস্তিকাই বলবৎ থাকুক।",
      },
      {
        en: "The second is what we have not claimed. The band notices did draw a thinner field — a middle of {{estimate.band_median_bids|n}} bidders against {{estimate.rest_median_bids|n}} for the {{estimate.rest_with_bids|n}} other tenders that published a bid count. We are not publishing that as an effect of the clause. {{estimate.band_agencies.0.n|n}} of the {{estimate.band_notices|n}} belong to a single authority, so the comparison is largely a comparison between two authorities and their different kinds of work, and it cannot be separated from either. The clause and its arithmetic need no comparison group; the bid counts are printed in the article so a reader can see what we saw and weigh it themselves.",
        bn: "দ্বিতীয়টি হলো যা আমরা দাবি করিনি। বলয়যুক্ত বিজ্ঞপ্তিগুলোতে প্রতিযোগিতা সত্যিই পাতলা ছিল — মাঝের মান {{estimate.band_median_bids|n}}টি দরদাতা, আর দরদাতার সংখ্যা প্রকাশ করা বাকি {{estimate.rest_with_bids|n}}টি দরপত্রে {{estimate.rest_median_bids|n}}টি। আমরা এটিকে ওই শর্তের ফল হিসেবে প্রকাশ করছি না। {{estimate.band_notices|n}}টির {{estimate.band_agencies.0.n|n}}টিই একটিমাত্র সংস্থার, তাই তুলনাটি মূলত দুটি সংস্থা আর তাদের ভিন্ন ধরনের কাজের মধ্যে তুলনা হয়ে দাঁড়ায়, আর দুটির কোনোটি থেকেই এটিকে আলাদা করা যায় না। শর্ত আর তার অঙ্কের জন্য কোনো তুলনার দল দরকার নেই; দরদাতার সংখ্যাগুলো লেখাতেই ছাপা হলো, যাতে পাঠক আমরা যা দেখেছি তা দেখতে পান এবং নিজেই ওজন করতে পারেন।",
      },
    ],
  },
  {
    title: { en: "Read this before you use any of the clause-test counts", bn: "ধারা-পরীক্ষার সংখ্যাগুলো ব্যবহারের আগে এটি পড়ুন" },
    p: [
      {
        en: "Four limits, all of them ours to declare. The rulebook we tested against is dated after many of these tenders were published, which is why {{rules_summary.postdates_event|n}} of the {{rules_summary.deviation_rows|n}} mismatches are discounted in the article. The timing test that does the discounting works to the year only: a tender published in April 2025 counts as inside the reach of a document dated December 2025. One of the five standard documents carries the words “Preliminary working Draft” on its cover page. And the folder contains no text of the Public Procurement Rules at all — not one line across the five reference PDFs — so where a clause cites a rule, we are reading the standard document's citation of it and not the rule itself.",
        bn: "চারটি সীমা, চারটিই আমাদের নিজে থেকে বলা। যে নিয়মপুস্তিকার বিপরীতে আমরা পরীক্ষা করেছি, তার তারিখ এই দরপত্রগুলোর অনেকগুলো প্রকাশের পরের — এ কারণেই {{rules_summary.deviation_rows|n}}টি অমিলের {{rules_summary.postdates_event|n}}টি লেখায় বাদ দেওয়া হয়েছে। যে সময়-পরীক্ষা দিয়ে ওই বাদ দেওয়া হয়, তা কেবল বছরের হিসাবে চলে: ২০২৫ সালের এপ্রিলে প্রকাশিত দরপত্রও ২০২৫ সালের ডিসেম্বরের দস্তাবেজের আওতার ভেতরে গোনা হয়। পাঁচটি আদর্শ দস্তাবেজের একটির প্রচ্ছদেই নিজেকে প্রাথমিক খসড়া বলে লেখা আছে। আর ফোল্ডারে সরকারি ক্রয় বিধিমালার কোনো লেখাই নেই — পাঁচটি রেফারেন্স পিডিএফের কোথাও একটি লাইনও নয় — তাই কোনো ধারা যখন কোনো বিধির উল্লেখ করে, আমরা পড়ছি আদর্শ দস্তাবেজে দেওয়া সেই উল্লেখটি, বিধিটি নিজে নয়।",
      },
      {
        en: "Every row records which document it was checked against and both flags; Rules tested, at the foot of the page, shows that on the row. The chart of deviations by rule plots only the rows whose timing flag reads <code>INSTRUMENT_PLAUSIBLY_IN_FORCE</code>, and only the {{violations.deviating_rules|n}} of the {{counts.rules|n}} rules that any notice deviated from at all. None of this is a finding that a law was broken. It is a set of {{violations.duty_without_ownership|n}} places where a government document does not do what the government's own standard document says it must, published so that the officials who wrote them can answer.",
        bn: "প্রতিটি সারিতে লেখা আছে কোন নথির বিপরীতে মিলিয়ে দেখা হয়েছে, দুটি চিহ্নসহ; পৃষ্ঠার নিচে ‘যে নিয়মগুলো পরীক্ষা করা হয়েছে’ অংশে সারির গায়েই তা দেখানো। নিয়ম অনুযায়ী বিচ্যুতির চিত্রটিতে কেবল সেই সারিগুলোই আঁকা হয়েছে যাদের সময়-চিহ্নে <code>INSTRUMENT_PLAUSIBLY_IN_FORCE</code> লেখা, আর {{counts.rules|n}}টি নিয়মের মধ্যে কেবল সেই {{violations.deviating_rules|n}}টি, যেগুলোয় কোনো বিজ্ঞপ্তিতে অন্তত একবার বিচ্যুতি আছে। এর কোনোটিই আইন ভাঙার সিদ্ধান্ত নয়। এটি এমন {{violations.duty_without_ownership|n}}টি জায়গার তালিকা, যেখানে একটি সরকারি নথি সরকারের নিজের আদর্শ দস্তাবেজে যা করতে বলা আছে তা করেনি — প্রকাশ করা হলো, যাতে যাঁরা সেগুলো লিখেছেন তাঁরা উত্তর দিতে পারেন।",
      },
    ],
  },
  {
    title: { en: "Which classifications are ours and not an authority's", bn: "কোন শ্রেণিভাগ আমাদের, কোনো সংস্থার নয়" },
    p: [
      {
        en: "Four of the figures in this article rest on tests this investigation wrote, and no office has classified any of these tenders as anything. The restriction levels are our own bands, read off the criteria as printed. The seven preselection conditions are our own tests, and the composite score built from them is a reading order for reporters and auditors rather than a verdict. The count in the last column of the authority matrix is a count of placements above the middle of six measures — six units with no weighting between them written in any of these documents, so none is invented here. And the middle bid count quoted beside each authority is the median of <code>total_bids_received</code>, over only those notices that published one.",
        bn: "এই লেখার চারটি চিত্র দাঁড়িয়ে আছে এই অনুসন্ধানের নিজের লেখা পরীক্ষার উপর, আর কোনো দপ্তর এই দরপত্রগুলোর কোনোটিকে কোনো শ্রেণিতে ফেলেনি। সীমাবদ্ধতার ধাপগুলো আমাদেরই ভাগ, যেমন ছাপা হয়েছে তেমন শর্ত থেকে পড়া। বাছাইয়ের সাতটি শর্তও আমাদের নিজের পরীক্ষা, আর সেগুলো মিলিয়ে বানানো সমন্বিত নম্বরটি প্রতিবেদক ও নিরীক্ষকদের জন্য পড়ার একটি ক্রম — রায় নয়। সংস্থার ছকের শেষ কলামের গোনাটি ছয়টি মাপের মাঝের মানের উপরে থাকার গোনা — ছয়টি ভিন্ন একক, তাদের মধ্যে কোনো ভারের হিসাব এই নথিগুলোর কোথাও লেখা নেই, তাই বানিয়ে নেওয়াও হয়নি। আর প্রতিটি সংস্থার পাশে যে মাঝের দর-সংখ্যা লেখা, সেটি <code>total_bids_received</code>-এর মধ্যক, কেবল যেসব বিজ্ঞপ্তি তা প্রকাশ করেছে সেগুলোর উপরেই।",
      },
      {
        en: "Two rules of counting run under every figure. A share is measured only over the notices that published the thing being measured, so each column of the authority matrix has its own denominator and the article prints it beside the share. And an empty cell is an absence, never a nought: where a body publishes no bid count anywhere, its row is left out of that column in both directions rather than scored zero, which is why one row is out of five where the others are out of six. Firms are grouped on <code>winner_name_normalised</code> and are never merged on a resemblance between two names.",
        bn: "প্রতিটি চিত্রের নিচে গোনার দুটি নিয়ম চলে। কোনো হার মাপা হয়েছে কেবল সেই বিজ্ঞপ্তিগুলোর উপরেই, যেগুলো মাপা জিনিসটি প্রকাশ করেছে — তাই সংস্থার ছকের প্রতিটি কলামের নিজের ভাজক আছে, আর লেখায় হারের পাশেই সেটি ছাপা। আর ফাঁকা ঘর মানে অনুপস্থিতি, কখনো শূন্য নয়: যে সংস্থা কোথাও দরের সংখ্যা প্রকাশ করে না, তাকে ওই কলামে শূন্য না ধরে দুই দিকেই বাদ রাখা হয়েছে — এ কারণেই একটি সারি পাঁচটির মধ্যে, বাকিরা ছয়টির মধ্যে। প্রতিষ্ঠানগুলোকে দল করা হয়েছে <code>winner_name_normalised</code> অনুযায়ী, আর দুটি নামের চেহারা মিলে যাওয়ার কারণে কখনো একটিকে অন্যটির সঙ্গে মেলানো হয়নি।",
      },
    ],
  },
];

/* -------------------------------------------------------------------- doors
   The article ends by handing the reader the working material. Each door names
   a tab, so a reader who wants the evidence never has to hunt for the tab bar.
   The `tab` value is the id app.js routes on; keep the two in step. */

export const DOORS = [
  {
    tab: "rules",
    label: { en: "The eighteen rules, one by one", bn: "আঠারোটি নিয়ম, একে একে" },
    note: {
      en: "Each rule as it is worded in the standard document, what it was tested against, how many tenders deviated, and a worked example with its page number.",
      bn: "প্রতিটি নিয়ম আদর্শ দস্তাবেজে যেভাবে লেখা, কীসের বিপরীতে পরীক্ষা করা হয়েছে, কতটি দরপত্রে বিচ্যুতি, এবং পৃষ্ঠা নম্বর সহ একটি উদাহরণ।",
    },
  },
  {
    tab: "tools",
    label: { en: "Search every tender yourself", bn: "নিজেই প্রতিটি দরপত্র খুঁজুন" },
    note: {
      en: "All {{counts.tenders|n}} tenders, {{counts.winners|n}} winning firms and {{counts.bidder_rows|n}} bidder rows, searchable by text, authority, money, bid count and deviation code.",
      bn: "{{counts.tenders|n}}টি দরপত্র, {{counts.winners|n}}টি বিজয়ী প্রতিষ্ঠান ও {{counts.bidder_rows|n}}টি দরদাতার সারি — লেখা, সংস্থা, অর্থ, দরের সংখ্যা ও বিচ্যুতির কোড ধরে খোঁজা যায়।",
    },
  },
  {
    tab: "docs",
    label: { en: "Open the source PDFs", bn: "মূল পিডিএফগুলো খুলুন" },
    note: {
      en: "The index of all {{counts.pdfs|n}} documents in the folder, each one openable, with the tender it belongs to and the findings that cite it.",
      bn: "ফোল্ডারের {{counts.pdfs|n}}টি নথির তালিকা — প্রতিটি খোলা যায়, সঙ্গে সংশ্লিষ্ট দরপত্র এবং যে ফলাফলগুলো তা উদ্ধৃত করেছে।",
    },
  },
  {
    tab: "method",
    label: { en: "How this was built, and what it cannot show", bn: "এটি কীভাবে তৈরি, আর কী দেখাতে পারে না" },
    note: {
      en: "The source files with their checksums, how the text was pulled out of the PDFs, what the method cannot show, the corrections log, and the scripts behind every figure.",
      bn: "মূল ফাইলগুলো ও তাদের চেকসাম, পিডিএফ থেকে লেখা কীভাবে তোলা হয়েছে, পদ্ধতিটি কী দেখাতে পারে না, সংশোধনের তালিকা, এবং প্রতিটি সংখ্যার পেছনের স্ক্রিপ্ট।",
    },
  },
];











