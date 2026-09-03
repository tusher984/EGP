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
  langBtn: { en: "বাংলা", bn: "English" },
  langTitle: { en: "Read in Bangla", bn: "Read in English" },
  loading: { en: "Loading…", bn: "লোড হচ্ছে…" },
  loadFail: {
    en: "That data file did not load. The site reads it from site/data/ in this folder.",
    bn: "ডেটা ফাইলটি লোড হয়নি। সাইটটি এটি এই ফোল্ডারের site/data/ থেকে পড়ে।",
  },

  tabs: {
    story: { en: "The investigation", bn: "অনুসন্ধান" },
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
    MANDATORY_SHALL: { en: "Mandatory — the clause says “shall”", bn: "বাধ্যতামূলক — ধারায় লেখা “shall”" },
    MANDATORY_SHALL_NOT: { en: "Prohibited — the clause says “shall not”", bn: "নিষিদ্ধ — ধারায় লেখা “shall not”" },
    MANDATORY_SHALL_BUT_UNVERIFIABLE: { en: "Mandatory, but not verifiable from these documents", bn: "বাধ্যতামূলক, কিন্তু এই নথি থেকে যাচাই করা যায় না" },
    MANDATORY_SHALL_INTERNALLY_CONTRADICTORY: { en: "Mandatory, but the source text contradicts itself", bn: "বাধ্যতামূলক, কিন্তু মূল লেখাটি নিজের সঙ্গেই সংঘর্ষে" },
    PERMISSIVE_CAN: { en: "Permissive — the clause says “may”", bn: "ঐচ্ছিক — ধারায় লেখা “may”" },
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
  R15: { en: "A brand name is specified without “or equivalent”", bn: "ব্র্যান্ডের নাম দেওয়া হয়েছে, “or equivalent” লেখা নেই" },
  R16: { en: "Only experience with government clients is allowed to count", bn: "কেবল সরকারি কাজের অভিজ্ঞতাই গণ্য করা হয়েছে" },
  R17: { en: "The notice states no qualification criteria at all", bn: "বিজ্ঞপ্তিতে যোগ্যতার কোনো শর্তই লেখা নেই" },
  R18: { en: "A large package was tendered nationally only", bn: "বড় প্যাকেজ কেবল জাতীয়ভাবে দরপত্র আহ্বান করা হয়েছে" },
};

/* ----------------------------------------------------------- exhibit captions
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
  hed: {
    en: "{{field.lost|n}} bids were rejected. The published record does not say why — not once.",
    bn: "{{field.lost|n}}টি দরপত্র বাতিল হয়েছে। প্রকাশিত নথিতে একবারও কারণ লেখা নেই।",
  },
  dek: {
    en: "We read every page of {{counts.pdfs|n}} procurement documents from six of Bangladesh's urban development authorities — {{counts.notices|n}} tender notices and {{counts.awards|n}} contract awards covering {{money.crore|cr}}. The notices name the winner. Across the whole set they do not name one losing bidder, publish one losing price, or record one reason for rejection.",
    bn: "বাংলাদেশের ছয়টি নগর উন্নয়ন সংস্থার {{counts.pdfs|n}}টি ক্রয়-নথির প্রতিটি পৃষ্ঠা আমরা পড়েছি — {{counts.notices|n}}টি দরপত্র বিজ্ঞপ্তি ও {{counts.awards|n}}টি চুক্তির নথি, মোট {{money.crore|cr}} টাকার কাজ। বিজ্ঞপ্তিতে বিজয়ীর নাম আছে। কিন্তু এই নথিগুলোর কোথাও একজন পরাজিত দরদাতার নাম নেই, একটিও পরাজিত দর নেই, বাতিলের একটিও কারণ নেই।",
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

/* ------------------------------------------------------------------- article */

export const STORY = [
  { k: "tiles", id: "headline" },

  {
    k: "lede",
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
    en: "Most of our questions the documents answer. Who published the tender, when it closed, what the contract was worth, who signed it. A few they do not answer at all — and what is missing turns out to be the same thing, in the same place, in almost every file.",
    bn: "আমাদের বেশির ভাগ প্রশ্নের উত্তর নথিতে আছে — কে দরপত্র দিয়েছে, কখন বন্ধ হয়েছে, চুক্তির মূল্য কত, কে স্বাক্ষর করেছে। কয়েকটির উত্তর একেবারেই নেই। আর যা নেই, তা প্রায় প্রতিটি ফাইলে একই জিনিস, একই জায়গায়।",
  },

  /* ---- 1. the field collapses, and the record stops at the winner --------- */

  { k: "h2", en: "The record stops at the winner", bn: "নথি বিজয়ীর কাছে এসে থেমে যায়" },

  {
    k: "p",
    en: "Across the {{counts.with_bid_counts|n}} tenders that publish a bid count, {{field.submitted|n}} bids were submitted. {{field.responsive|n}} of them were ruled responsive — the official word for a bid the committee accepts as meeting the notice's own conditions. The other {{field.lost|n}} were set aside, across {{field.tenders_losing_bids|n}} tenders. Behind each of those was a company that prepared a bid and lost it.",
    bn: "যে {{counts.with_bid_counts|n}}টি দরপত্রে দরদাতার সংখ্যা প্রকাশিত হয়েছে, সেগুলোতে জমা পড়েছিল {{field.submitted|n}}টি দর। তার {{field.responsive|n}}টিকে ‘গ্রহণযোগ্য’ ধরা হয়েছে — কমিটি যে দরকে বিজ্ঞপ্তির নিজের শর্ত মেনেছে বলে মানে, দরপত্রের ভাষায় তাকেই বলা হয় গ্রহণযোগ্য। বাকি {{field.lost|n}}টি সরিয়ে রাখা হয়েছে, {{field.tenders_losing_bids|n}}টি দরপত্রজুড়ে। ওই প্রতিটির পেছনে একটি প্রতিষ্ঠান ছিল, যারা দর তৈরি করেছিল আর হেরেছিল।",
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

  /* ---- 2. how thin the field is, and where the money is ------------------ */

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
        en: "A small field is not by itself evidence of anything improper. Small or specialised jobs attract few bidders everywhere. It is an investigative signal, not a finding of wrongdoing — and the reason it matters here is the section above: because no rejection is ever explained, nothing in the published record lets you tell a tender that happened to draw two bidders from one that was narrowed down to two.",
        bn: "কম দরদাতা থাকা নিজে থেকেই অনিয়মের প্রমাণ নয়। ছোট বা বিশেষায়িত কাজে সব জায়গাতেই কম দর জমা পড়ে। এটি অনুসন্ধানের একটি সংকেত, অন্যায়ের প্রমাণ নয়। এখানে এটি গুরুত্বপূর্ণ উপরের অংশটির কারণেই: বাতিলের কারণ যেহেতু কখনো ব্যাখ্যা করা হয় না, প্রকাশিত নথির কিছুই বলে দেয় না — কোনো দরপত্রে দুজন দরদাতা এমনিতেই এসেছিল, না কি মাঠ কমিয়ে দুজনে নামানো হয়েছিল।",
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

  /* ---- 3. half the notices publish no bar at all -------------------------- */

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

  /* ---- 4. the theory that did not hold ----------------------------------- */

  { k: "h2", en: "The obvious theory does not hold, and we are publishing that", bn: "সহজ অনুমানটি মেলেনি, এবং সেটিও আমরা প্রকাশ করছি" },

  {
    k: "p",
    en: "The usual suspicion about a tailored condition runs like this: an oddly specific requirement keeps rival companies away, few bids arrive, and the company the clause suits wins. We gave every notice that publishes its criteria a restrictiveness score of our own making — a tally of how demanding and how narrow its conditions are — and compared it with the number of bids that arrived. The relationship runs the wrong way.",
    bn: "শর্ত-সাজানো নিয়ে প্রচলিত সন্দেহটি এমন: অস্বাভাবিকভাবে নির্দিষ্ট একটি শর্ত প্রতিদ্বন্দ্বীদের দূরে রাখে, ফলে অল্প দর জমা পড়ে, আর যে প্রতিষ্ঠানের সঙ্গে শর্তটি মেলে তারাই কাজ পায়। শর্ত প্রকাশ করা প্রতিটি বিজ্ঞপ্তিকে আমরা নিজেরা একটি কঠোরতার নম্বর দিয়েছি — শর্তগুলো কতটা কঠিন ও কতটা সংকীর্ণ, তার হিসাব — আর জমা পড়া দরের সংখ্যার সঙ্গে মিলিয়ে দেখেছি। সম্পর্কটি উল্টো দিকে চলছে।",
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

  /* ---- 5. the documents that say it in their own words -------------------- */

  { k: "h2", en: "Four documents that speak for themselves", bn: "চারটি নথি, যেগুলো নিজেরাই কথা বলে" },

  {
    k: "p",
    en: "Almost everything above is a count across {{counts.pdfs|n}} files. The four below are single pages, quoted exactly as published, each linked to the PDF it came from so you can read the sentence where it sits.",
    bn: "উপরের প্রায় সবই {{counts.pdfs|n}}টি ফাইলজুড়ে গণনা। নিচের চারটি একক পৃষ্ঠা, প্রকাশিত অবস্থায় হুবহু উদ্ধৃত — প্রতিটির সঙ্গে মূল পিডিএফের লিংক আছে, যাতে বাক্যটি যেখানে বসে আছে সেখানেই পড়ে নেওয়া যায়।",
  },

  { k: "exhibits" },

  {
    k: "note",
    title: { en: "How to read these four", bn: "এই চারটি কীভাবে পড়বেন" },
    p: [
      {
        en: "The first of the four is the only document in this entire set where a government office says, in its own words, that it adjusted the qualification criteria with a particular kind of bidder in mind. It does not name a company. It does not say who asked for the change. Two bids arrived and one was ruled responsive. We quote it because it is on the public record — and we stop where the page stops.",
        bn: "চারটির প্রথমটি এই পুরো সংগ্রহে একমাত্র নথি, যেখানে একটি সরকারি অফিস নিজের ভাষাতেই লিখেছে যে নির্দিষ্ট ধরনের দরদাতার কথা মাথায় রেখে যোগ্যতার শর্ত সমন্বয় করা হয়েছে। এতে কোনো প্রতিষ্ঠানের নাম নেই। কে বদলাতে বলেছে, তা-ও নেই। দুটি দর জমা পড়েছিল, একটি গ্রহণযোগ্য বিবেচিত হয়। এটি উদ্ধৃত করছি কারণ এটি সরকারি নথিতেই আছে — আর কাগজ যেখানে থামে, আমরাও সেখানেই থামছি।",
      },
    ],
  },

  /* ---- 6. the bars, measured against the contract ------------------------ */

  { k: "h2", en: "What the notices demanded, measured against the job", bn: "বিজ্ঞপ্তি যা চেয়েছে, কাজের মাপে মিলিয়ে" },

  {
    k: "p",
    en: "Where a notice does print its conditions, they can be held up against the contract that followed. A demand for cash in hand, for a minimum yearly income, or for a similar job already finished, set beside what the winning contract turned out to be worth — and read as how many times over.",
    bn: "যেসব বিজ্ঞপ্তিতে শর্ত লেখা আছে, সেগুলো পরের চুক্তির সঙ্গে মিলিয়ে দেখা যায়। হাতে নগদ অর্থ, বছরে সর্বনিম্ন লেনদেন, বা আগে শেষ করা সমমানের কাজের দাবি — বিজয়ী চুক্তির প্রকৃত মূল্যের পাশে রেখে দেখা যায়, দাবিটি তার কত গুণ।",
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

  /* ---- 7. reused clauses, price bands, and the signing window ------------- */

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

  {
    k: "finding",
    tag: "fact",
    h: {
      en: "Some notices reject any price more than 10% away from an estimate they never publish",
      bn: "কিছু বিজ্ঞপ্তিতে এমন প্রাক্কলনের ১০% বাইরের যেকোনো দর বাতিল, যা কখনো প্রকাশ করা হয় না",
    },
    p: [
      {
        en: "The official cost estimate — the government's own view of what a job should cost — is absent from every one of these {{counts.tenders|n}} tenders. Where a notice also carries a clause rejecting any bid more than ten per cent above or below that estimate, a company is being asked to guess a number it is not allowed to see, and to lose the work if it guesses wrong. {{qa.retendered|n}} tenders here were put out a second time.",
        bn: "সরকারি প্রাক্কলিত ব্যয় — কাজটির খরচ কত হওয়া উচিত বলে সরকার নিজে মনে করে — এই {{counts.tenders|n}}টি দরপত্রের প্রতিটিতেই অনুপস্থিত। যেসব বিজ্ঞপ্তিতে আবার শর্ত আছে যে ওই প্রাক্কলনের দশ শতাংশ উপরে বা নিচের যেকোনো দর বাতিল, সেখানে একটি প্রতিষ্ঠানকে এমন একটি সংখ্যা অনুমান করতে বলা হচ্ছে যা তাকে দেখতেই দেওয়া হয়নি — আর অনুমান ভুল হলে কাজটি হারাতে হবে। এখানকার {{qa.retendered|n}}টি দরপত্র দ্বিতীয়বার আহ্বান করা হয়েছে।",
      },
    ],
  },

  { k: "h2", en: "After the award", bn: "কাজ দেওয়ার পর" },

  {
    k: "p",
    en: "Of the {{counts.awarded|n}} awarded contracts, {{signing.within|n}} were signed inside the time the national rules allow. The limit is fourteen, twenty-one or twenty-eight days depending on how the tender was run, and the award notice records which one applied. {{signing.over_total|n}} were signed later than that: {{signing.over_14|n}} past a fourteen-day limit and {{signing.over_21|n}} past a twenty-one-day one. The middle overrun is {{signing.overrun.median|n}} days; the longest is {{signing.overrun.max|n}}.",
    bn: "চুক্তি হওয়া {{counts.awarded|n}}টির মধ্যে {{signing.within|n}}টি স্বাক্ষরিত হয়েছে জাতীয় বিধির অনুমোদিত সময়ের ভেতরে। সীমা চৌদ্দ, একুশ বা আঠাশ দিন — দরপত্র কোন পদ্ধতিতে হয়েছে তার ওপর নির্ভর করে, আর কোনটি প্রযোজ্য তা চুক্তির বিজ্ঞপ্তিতেই লেখা থাকে। {{signing.over_total|n}}টি স্বাক্ষরিত হয়েছে তার পরে: {{signing.over_14|n}}টি চৌদ্দ দিনের সীমা পেরিয়ে, {{signing.over_21|n}}টি একুশ দিনের সীমা পেরিয়ে। বাড়তি সময়ের মাঝের মান {{signing.overrun.median|n}} দিন; সর্বোচ্চ {{signing.overrun.max|n}} দিন।",
  },

  { k: "fig", id: "timeline" },

  /* ---- 8. where the money went ------------------------------------------- */

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
        en: "{{concentration.top1.name|raw}} holds {{concentration.top1.crore|cr}} across {{concentration.top1.contracts|n}} contracts, all with one authority. {{concentration.top1.thin_wins|n}} of those {{concentration.top1.contracts|n}} were won in tenders with two bidders or fewer. We name the firm for one reason only: the government's own award notices name it, and those notices are the source for every figure in this paragraph.",
        bn: "{{concentration.top1.name|raw}}-এর হাতে {{concentration.top1.contracts|n}}টি চুক্তি মিলিয়ে {{concentration.top1.crore|cr}}, সবই একটি সংস্থার সঙ্গে। ওই {{concentration.top1.contracts|n}}টির {{concentration.top1.thin_wins|n}}টি জেতা হয়েছে দুই বা তার কম দরদাতার দরপত্রে। প্রতিষ্ঠানটির নাম আমরা একটি কারণেই লিখছি: সরকারের নিজের চুক্তি-বিজ্ঞপ্তিতেই নামটি আছে, আর এই অনুচ্ছেদের প্রতিটি সংখ্যার সূত্রও সেই বিজ্ঞপ্তিগুলোই।",
      },
      {
        en: "Nothing in these documents says the firm did anything wrong, and nothing here should be read as saying so. One very large package can produce this shape on its own. Across the whole set the measured concentration is {{concentration.hhi|n1}} on the Herfindahl-Hirschman index — a standard way of scoring how few hands a market sits in. It is a number to compare with other procurement portfolios, not a verdict on any one contract.",
        bn: "এই নথিগুলোর কোথাও লেখা নেই যে প্রতিষ্ঠানটি কোনো অন্যায় করেছে, আর এখানকার কিছুই সে অর্থে পড়া উচিত নয়। একটিমাত্র বিশাল কাজই এমন চেহারা তৈরি করতে পারে। পুরো সংগ্রহের মাপা কেন্দ্রীভবন হারফিন্ডাল-হিরশম্যান সূচকে {{concentration.hhi|n1}} — একটি বাজার কত অল্প হাতে জমে আছে, তা মাপার প্রচলিত পদ্ধতি। এই সংখ্যাটি অন্য ক্রয়-তালিকার সঙ্গে তুলনার জন্য, কোনো একক চুক্তির বিচার নয়।",
      },
    ],
  },

  {
    k: "p",
    en: "At the other end of the same table, {{concentration.frequent.0.name|raw}} holds {{concentration.frequent.0.contracts|n}} contracts worth {{concentration.frequent.0.crore|cr}} — many small jobs rather than a few large ones. Both shapes are in Explore the data, firm by firm, with the tenders that make up each total.",
    bn: "একই তালিকার অন্য প্রান্তে {{concentration.frequent.0.name|raw}}-এর হাতে {{concentration.frequent.0.contracts|n}}টি চুক্তি, মূল্য {{concentration.frequent.0.crore|cr}} — কয়েকটি বড় কাজ নয়, বহু ছোট কাজ। দুই ধরনের চেহারাই ‘ডেটা ঘেঁটে দেখুন’ অংশে প্রতিষ্ঠান ধরে ধরে আছে, প্রতিটি যোগফল কোন দরপত্রগুলো দিয়ে তৈরি তা-সহ।",
  },

  /* ---- 9. the rules, and the honest limit on them ------------------------ */

  { k: "h2", en: "Eighteen rules, tested against every tender", bn: "আঠারোটি নিয়ম, প্রতিটি দরপত্রে পরীক্ষা করা" },

  {
    k: "p",
    en: "Bangladesh has a rulebook for all this. The national standard tender document and the procurement rules set out what a notice has to contain and how far a condition is allowed to go — how much money a bidder may be asked to show in the bank, how many days must be left for bids to arrive. We took {{counts.rules|n}} of those requirements and turned each one into a question that can be asked of every tender in a table. Then we asked all of them of all {{counts.tenders|n}} tenders: {{rules_summary.tested_rows|n}} separate checks. Each check is recorded with the clause it came from and the page that clause is printed on, so you can go and read the rule yourself.",
    bn: "এসবের জন্য বাংলাদেশে একটি নিয়মপুস্তিকা আছে। জাতীয় আদর্শ দরপত্র দস্তাবেজ ও ক্রয় বিধিমালায় বলা আছে একটি বিজ্ঞপ্তিতে কী থাকতে হবে এবং কোনো শর্ত কত দূর যেতে পারে — দরদাতার কাছে ব্যাংকে কত টাকা দেখাতে চাওয়া যায়, দর জমা দেওয়ার জন্য কত দিন সময় রাখতে হয়। সেই শর্তগুলোর {{counts.rules|n}}টি নিয়ে আমরা প্রতিটিকে এমন একটি প্রশ্নে রূপ দিয়েছি, যা সারণিতে থাকা প্রতিটি দরপত্রকে করা যায়। তারপর সব প্রশ্নই করেছি {{counts.tenders|n}}টি দরপত্রের সবগুলোকে: মোট {{rules_summary.tested_rows|n}}টি আলাদা পরীক্ষা। প্রতিটি পরীক্ষা লেখা আছে কোন ধারা থেকে এসেছে ও সেই ধারা কোন পৃষ্ঠায় ছাপা, তা-সহ — যাতে আপনি নিজেই নিয়মটি পড়ে দেখতে পারেন।",
  },

  {
    k: "p",
    en: "In {{rules_summary.deviation_rows|n}} of those checks, the document did not match the clause we tested it against. {{rules_summary.tenders_with_any|n}} tenders have at least one such mismatch; {{rules_summary.tenders_with_none|n}} have none.",
    bn: "ওই পরীক্ষাগুলোর {{rules_summary.deviation_rows|n}}টিতে নথি আর যে ধারার বিপরীতে মিলিয়ে দেখা হয়েছে, দুটি মেলেনি। {{rules_summary.tenders_with_any|n}}টি দরপত্রে অন্তত একটি করে এমন অমিল আছে; {{rules_summary.tenders_with_none|n}}টিতে একটিও নেই।",
  },

  { k: "fig", id: "rules" },

  {
    k: "note",
    title: { en: "Read this before you use that number", bn: "ওই সংখ্যাটি ব্যবহারের আগে এটি পড়ুন" },
    p: [
      {
        en: "The rulebook we tested against is dated after many of these tenders were published. Of the {{rules_summary.deviation_rows|n}} mismatches, {{rules_summary.postdates_event|n}} are against a rule written later than the tender it is applied to; only {{rules_summary.plausibly_in_force|n}} are against a rule we can show was already in force at the time. Nobody breaks a rule that does not exist yet. Every row records which document it was checked against, and Rules tested, at the foot of this page, shows that on the row — which is why nothing counted here is a finding that a law was broken.",
        bn: "যে নিয়মপুস্তিকার বিপরীতে আমরা পরীক্ষা করেছি, তার তারিখ এই দরপত্রগুলোর অনেকগুলো প্রকাশের পরের। {{rules_summary.deviation_rows|n}}টি অমিলের {{rules_summary.postdates_event|n}}টি এমন নিয়মের বিপরীতে, যা প্রয়োগ করা হচ্ছে যে দরপত্রে তার চেয়ে পরে লেখা; কেবল {{rules_summary.plausibly_in_force|n}}টির ক্ষেত্রে দেখানো যায় যে নিয়মটি তখনই বলবৎ ছিল। যে নিয়ম এখনো তৈরিই হয়নি, তা কেউ ভাঙতে পারে না। প্রতিটি সারিতে লেখা আছে কোন নথির বিপরীতে মিলিয়ে দেখা হয়েছে, আর এই পৃষ্ঠার নিচে ‘যে নিয়মগুলো পরীক্ষা করা হয়েছে’ অংশে সারির গায়েই তা দেখানো — এ কারণেই এখানে গোনা কোনো কিছুই আইন ভাঙার সিদ্ধান্ত নয়।",
      },
    ],
  },

  /* ---- 10. what the documents cannot tell us ----------------------------- */

  { k: "h2", en: "What these documents cannot tell us", bn: "এই নথিগুলো যা বলতে পারে না" },

  {
    k: "p",
    en: "This is the part of an investigation that usually goes unpublished. Three things are missing from the public record in a way that limits every finding above, and one of them is missing from every single tender.",
    bn: "অনুসন্ধানের এই অংশটিই সাধারণত অপ্রকাশিত থেকে যায়। উপরের প্রতিটি ফলাফলকে সীমিত করে দেয় এমন তিনটি জিনিস প্রকাশিত নথিতে নেই, আর তার একটি নেই একটি দরপত্রেও।",
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
        en: "Before a tender goes out, the office works out what the job ought to cost. That figure is the yardstick a price is judged against, high or low — and it appears in none of these {{counts.tenders|n}} tenders. We can tell you what was paid. On the evidence in this folder we cannot tell you what it should have been, so no price in this investigation is called excessive or suspiciously low.",
        bn: "দরপত্র ছাড়ার আগে অফিস হিসাব করে কাজটির খরচ কত হওয়া উচিত। ওই সংখ্যাটিই সেই মাপকাঠি, যার বিপরীতে কোনো দর বেশি না কম তা বিচার করা হয় — আর এই {{counts.tenders|n}}টি দরপত্রের একটিতেও তা নেই। কত টাকা দেওয়া হয়েছে, তা আমরা বলতে পারি। এই ফোল্ডারের প্রমাণ দিয়ে কত হওয়া উচিত ছিল তা বলতে পারি না, তাই এই অনুসন্ধানে কোনো দরকেই অতিরিক্ত বা সন্দেহজনকভাবে কম বলা হয়নি।",
      },
    ],
  },

  {
    k: "finding",
    tag: "unresolved",
    h: { en: "Who owns the winning firms", bn: "বিজয়ী প্রতিষ্ঠানের মালিক কারা" },
    p: [
      {
        en: "The award notice has a box for the person who actually owns a winning company. It is filled in {{ownership.disclosed|n}} times out of {{counts.awarded|n}}. We are deliberately not making much of that raw number, and it is worth saying why. The duty to publish the name only arrived in {{ownership.instrument_dated|raw}}, and {{ownership.signed_before_2025_undisclosed|n}} of the empty boxes sit on contracts signed years before that duty existed. A blank box on a 2019 notice is not somebody hiding something.",
        bn: "চুক্তির বিজ্ঞপ্তিতে বিজয়ী প্রতিষ্ঠানের প্রকৃত মালিক কে, তা লেখার ঘর আছে। {{counts.awarded|n}}টির মধ্যে সেটি পূরণ করা হয়েছে {{ownership.disclosed|n}} বার। কাঁচা এই সংখ্যাটি নিয়ে আমরা সচেতনভাবেই বড় কিছু বলছি না, আর কেন বলছি না তা বলে রাখা দরকার। নামটি প্রকাশের বাধ্যবাধকতা এসেছে {{ownership.instrument_dated|raw}}-এ, আর খালি ঘরগুলোর {{ownership.signed_before_2025_undisclosed|n}}টি এমন চুক্তিতে, যেগুলো ওই বাধ্যবাধকতা তৈরি হওয়ার বছরখানেক আগেই স্বাক্ষরিত। ২০১৯ সালের বিজ্ঞপ্তির একটি খালি ঘর কারও কিছু লুকিয়ে রাখা নয়।",
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

  /* ---- 11. how to check it ----------------------------------------------- */

  { k: "h2", en: "How to check this", bn: "এটি যাচাই করবেন কীভাবে" },

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











