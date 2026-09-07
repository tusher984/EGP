// =============================================================================
//  THE STORY.  Edit this file to change the article on the page.
// =============================================================================
//  index.html names this file in <meta name="story-src">. The page fetches it,
//  site/scripts/storydoc.js reads it, site/scripts/story.js draws it. No build
//  step, no JavaScript to touch: change a sentence here, reload, it is on the
//  page. Every case study is in here, at the finding it belongs to, as evidence
//  rather than as an essay — the tender named, the passage from its own page with
//  the operative words marked, the figures it turns on, both PDFs. A `# fig` and
//  a `# evidence` block cost this file no words, so the argument can be carried
//  by the documents and the charts while the prose stays under the thousand-word
//  ceiling the gate enforces.
//
//  THE SPINE, AND WHY IT IS THIS ONE
//  This record has one stage that can be measured from outside it. Nothing says
//  why a bid was rejected, but every notice publishing a bid count also publishes
//  how many of those bids survived — so the rejection stage is countable even
//  though its reasons are not. That count is the article's backbone, because it
//  is the only place where the narrowing of a field is visible rather than
//  inferred. The pre-bid requirements come after it, in their measured order,
//  which is not the order a reader would guess: the two clauses governing how a
//  bid already received is treated travel with a thin field far more closely than
//  the paperwork stacks that appear on three hundred notices each. Where a
//  measurement cuts against the argument it is printed in the article, not in a
//  footnote.
//
//  FOUR RULES
//    # kind [argument]   opens a block.
//    en: …               the English text of it.
//    bn: …               the Bangla text of the same block.
//    // …                a comment, never rendered.
//  A line that is none of those continues the line above, so wrap freely. A
//  blank line closes a paragraph and leaves the block open.
//
//  BLOCKS      lede · p · h2 · finding <fact|derived|possible|unresolved>
//              fig <name> · case [id] · evidence <id> · tiles · exhibits · doors
//  FIGURES     filter clause retender funnel competition agencies authorityMap
//              authority restriction bars timeline portal stack winners
//              violations rules
//  EVIDENCE    high_bar no_criteria repeat_clause rule_stack preselection
//              price_band all_rejected portal_yes late_signing single_bid
//              peer_gap biggest
//
//  NUMBERS ARE NEVER TYPED HERE. {{money.crore|cr}} is read from
//  site/data/corpus.json when the page draws, so a rebuild moves every figure in
//  this prose at once and no edit here can leave a stale number on the page.
//  Filters: n n1 n2 · pct pct0 pct2 · cr cr0 taka · x x2 x3 · date human month ·
//  r · agency org place firm method funds work.
//
//  NOTHING HERE MAY OUTRUN THE DOCUMENTS. Every sentence below is either quoted
//  from a published PDF in this repository, or a count off the table built from
//  those PDFs, or plainly marked as something the record does not settle.
// =============================================================================

# kicker
en: e-GP WATCH · Urban development procurement, 2021–2025
bn: e-GP ওয়াচ · নগর উন্নয়ন ক্রয়, ২০২১–২০২৫

# hed
en: Restricting competition keeps the price up
bn: প্রতিযোগিতায় সীমাবদ্ধতা বাড়ায় খরচ

# dek
en: {{counts.pdfs|n}} documents, {{money.crore|cr}} of contracts, six authorities.
  The more companies bid, the more were thrown out. {{field.lost|n}} bids rejected.
  Published reasons: {{field.reasons_published|n}}.
bn: {{counts.pdfs|n}}টি নথি, {{money.crore|cr}} টাকার চুক্তি, ছয়টি সংস্থা।
  যত বেশি প্রতিষ্ঠান দর দিয়েছে, তত বেশি বাদ পড়েছে। বাতিল {{field.lost|n}}টি দর।
  প্রকাশিত কারণ: {{field.reasons_published|n}}টি।

// ---------------------------------------------------------------- the opening
// One tender, in full, before the article widens to all 1,155. Every figure is a
// token off corpus.case, which build.py fills from tender 538256’s own two pages,
// so this scene cannot drift from the record. The five-kilometre highway, the
// walkway and the turnover are quoted in the notice; the arithmetic comparing them
// to the road actually bought is ours and is stated as such.

# lede
en: In February 2021 the Chittagong Development Authority advertised a road in Uttar
  Patenga — a 1.175-kilometre link, drains, a walkway. To bid, a company had to show a
  completed five-kilometre four-lane highway worth {{case.similar_crore|cr}}, a kilometre
  of sea-bank walkway and {{case.turnover_crore|cr}} in yearly turnover. To build one
  kilometre, a bidder had to have already built five.
bn: ২০২১ সালের ফেব্রুয়ারিতে চট্টগ্রাম উন্নয়ন কর্তৃপক্ষ উত্তর পতেঙ্গায় দরপত্র আহ্বান
  করে — ১.১৭৫ কিলোমিটার সংযোগ সড়ক, নর্দমা, হাঁটাপথ। দর দিতে হলে দেখাতে হবে পাঁচ কিলোমিটার
  চার লেনের মহাসড়ক শেষ করার কাজ, মূল্য {{case.similar_crore|cr}}; নদী বা সমুদ্রের তীরে এক
  কিলোমিটার হাঁটাপথ; আর বার্ষিক লেনদেন {{case.turnover_crore|cr}}।

# p
en: {{case.sold|n}} companies bought the documents. {{case.bids|n}} bid. {{case.responsive|n}}
  was found responsive; the work went to {{case.winner|firm}} for {{case.crore|cr}}. Who the
  other {{case.rejected|n}} were, what they offered and why they were ruled out: nowhere in
  the record.
bn: {{case.sold|n}}টি প্রতিষ্ঠান নথি কিনেছিল। দর দিয়েছিল {{case.bids|n}}টি।
  গ্রহণযোগ্য বিবেচিত {{case.responsive|n}}টি; কাজ পায় {{case.winner|firm}},
  মূল্য {{case.crore|cr}}। বাকি {{case.rejected|n}}টি কারা, দর কত, কেন বাদ — নথিতে নেই।

# tiles

// The set over time, before the argument starts: 1,155 notices and 645 awards, and
// where in those four years the money was signed away. It carries its own title and
// source, so it needs no sentence of introduction.

# fig timeline

// ------------------------------------------------- the one countable stage
// The spine. Everything else in this article is a description of paperwork; this
// is the one stage of the process that can be measured from outside the buying
// office, because two published columns bracket it. corpus.filter bins the 591
// notices that publish both by how many bids they drew, and prints the share that
// survived. The bins are the same population throughout — no bin is a different
// set of notices from its neighbour — so the two ends can be compared directly.

# h2
en: The one stage anyone outside can count
bn: বাইরে থেকে গুনে দেখা যায় যে ধাপটি

# p
en: No notice says why a bid was rejected. But every notice with a bid count also
  publishes how many survived. {{filter.n|n}} notices, not one reason.
bn: কোনো বিজ্ঞপ্তিই বলে না কেন কোনো দর বাতিল হলো। তবু দরের সংখ্যা ছাপানো প্রতিটি বিজ্ঞপ্তিই
  বলে কতটি টিকেছে। {{filter.n|n}}টি বিজ্ঞপ্তি — একটিতেও কারণ নেই।

# fig filter

# finding fact
h.en: Where one company bid, the bid was accepted every time
h.bn: যেখানে একটিই প্রতিষ্ঠান দর দিয়েছে, সেখানে দরটি প্রতিবারই গৃহীত হয়েছে
en: In the {{filter.bottom_band.n|n}} tenders with one bid, that bid was responsive every
  time. In the {{filter.top_band.n|n}} with ten or more, {{filter.top_band.lost|n}} of
  {{filter.top_band.submitted|n}} were thrown out — only {{filter.top_band.share|pct}}
  survived. The middle bands both sit near two-thirds; it is the two ends that separate.
bn: একটি দর পড়া {{filter.bottom_band.n|n}}টিতে সেটি প্রতিবারই গ্রহণযোগ্য। দশ বা তার বেশি দর
  পড়া {{filter.top_band.n|n}}টিতে {{filter.top_band.submitted|n}}টির মধ্যে
  {{filter.top_band.lost|n}}টি বাদ — টিকেছে মাত্র {{filter.top_band.share|pct}}।
  মাঝের দুটি ব্যান্ড দুই-তৃতীয়াংশের কাছাকাছি; আলাদা হয় দুই প্রান্ত।

# evidence single_bid

# fig funnel

// The figure above prints the count, the rejections and the three zeros, so the prose
// does not repeat them; it accounts for them instead, out of the two clauses that
// provide for the silence.

# p
en: The silence is written in. The standard document gives a rejected tenderer the reason on
  request but adds the office “is not required to justify those reason(s).” The award form
  has no field for anyone who lost.
bn: নীরবতা বিধিতেই লেখা। আদর্শ দস্তাবেজ বলে বাতিল দরদাতা লিখিত আবেদনে কারণ পাবেন — তবু
  দপ্তর “ওই কারণগুলোর সাফাই দিতে বাধ্য নয়।” চুক্তি-বিজ্ঞপ্তিতে যারা হেরেছে তাদের জন্য
  ঘরই নেই।

# evidence all_rejected

// The portal answers a certification question on every award notice, and on all 585
// that answer it and print both dates, "yes" is exactly (days <= flat_cap) — so the
// figure counts contracts signed later than their own size allows, and the sentence
// says what the answer is measuring instead. Neither is an explanation; none is offered.

# fig portal

# p
en: On all {{portal.answered|n}} notices that answer it, the portal records yes when signed
  within {{portal.flat_cap|n}} days, and no otherwise.
bn: উত্তর আছে এমন {{portal.answered|n}}টিতে পোর্টাল হ্যাঁ বলেছে {{portal.flat_cap|n}}
  দিনের মধ্যে সই হলে, না বলেছে অন্যথায়।

# evidence portal_yes

# evidence late_signing

// ----------------------------------------------------- which clauses travel with it
// The order of this table is the finding, and it is not the order the article used to
// argue. corpus.clause splits twelve clause columns into the ones that decide who may
// enter and the ones that decide how a bid already received is treated, and measures
// each against the same 34 per cent baseline. The rejection pair tops it; the two
// paperwork stacks that appear on more than three hundred notices each barely move.
// CLAUSE_FLOOR = 30 keeps thin rows in the table and out of the prose.

# h2
en: The clauses a thin field travels with are the ones about rejection
bn: পাতলা প্রতিযোগিতার সঙ্গে যে শর্তগুলো চলে, সেগুলো বাতিল করার শর্ত

# fig clause

# finding derived
h.en: The requirement that keeps companies out is not the one that empties the field
h.bn: যে শর্ত প্রতিষ্ঠানকে ঢুকতে দেয় না, মাঠ খালি করে সে শর্তটি নয়
en: Baseline across {{clause.baseline.with_bids|n}} notices: {{clause.baseline.one_resp_pct|pct}}
  ended with one responsive bidder. The two clauses highest above that line are not about
  who may enter — both decide what happens to a bid already received. Forfeiting security
  for a document held false: {{clause.by.false_document_forfeiture_clause.one_resp_pct|pct}}.
  Rejecting a bid too far from the estimate:
  {{clause.by.price_band_nonresponsive_clause.one_resp_pct|pct}}. The licence stack, on
  {{clause.by.licence_document_stack.n|n}} notices, sits within two points of the baseline.
bn: {{clause.baseline.with_bids|n}}টি বিজ্ঞপ্তির ভিত্তিরেখা: {{clause.baseline.one_resp_pct|pct}}
  শেষ হয়েছে একজন গ্রহণযোগ্য দরদাতায়। ওই রেখার সবচেয়ে উপরে দুটি শর্ত — দুটিই বাক্সে পড়া
  দরের সঙ্গে কী হবে তা ঠিক করে। কাগজ মিথ্যা প্রমাণে জামানত বাজেয়াপ্ত:
  {{clause.by.false_document_forfeiture_clause.one_resp_pct|pct}}। প্রাক্কলন থেকে দূরে থাকা
  দর বাতিল: {{clause.by.price_band_nonresponsive_clause.one_resp_pct|pct}}।
  {{clause.by.licence_document_stack.n|n}}টির লাইসেন্স-থাক ভিত্তিরেখার দুই পয়েন্টেই।

# evidence price_band

# finding fact
h.en: A notice that rejects any bid {{estimate.width_common|n}} per cent below the
  estimate has capped its own saving there
h.bn: প্রাক্কলনের {{estimate.width_common|n}} শতাংশ নিচের দর যে বিজ্ঞপ্তি নেবে না, সে
  নিজের সাশ্রয়ের সীমাও ওখানেই বেঁধে ফেলেছে
en: {{estimate.band_notices|n}} notices reject any bid more than {{estimate.width_common|n}}
  per cent from the official estimate. A company that can do the work cheaper is disqualified
  by the saving. The estimate appears in none of the {{counts.pdfs|n}} documents, so no
  bidder can see the band's centre. {{estimate.band_awarded|n}} became contracts worth
  {{estimate.band_crore|cr}}.
bn: {{estimate.band_notices|n}}টি বিজ্ঞপ্তি সরকারি প্রাক্কলন থেকে {{estimate.width_common|n}}
  শতাংশের বেশি দূরের দর বাতিল করে। সস্তায় কাজ করতে পারা প্রতিষ্ঠানকে সেই সাশ্রয়ই অযোগ্য
  করে। প্রাক্কলন একটি নথিতেও নেই, বলয়ের কেন্দ্র কেউ দেখতে পান না।
  {{estimate.band_awarded|n}}টিতে চুক্তি, মূল্য {{estimate.band_crore|cr}}।

# p
en: One entry requirement is circular: {{clause.by.govt_client_experience_required.n|n}}
  notices accept experience only with a government client —
  {{clause.by.govt_client_experience_required.crore|cr}} between them. A firm that has
  never had public work cannot qualify for public work.
bn: একটি শর্ত চক্রাকার: {{clause.by.govt_client_experience_required.n|n}}টি বিজ্ঞপ্তি শুধু
  সরকারি কাজের অভিজ্ঞতাই গোনে — এদের মিলিত মূল্য
  {{clause.by.govt_client_experience_required.crore|cr}}। সরকারি কাজ না পেলে যোগ্যই হওয়া
  যাবে না।

# fig stack

# evidence preselection

// -------------------------------------------------------- the round run twice
// A retender is the buying office recording, in its own notice, that the first attempt
// produced no contract. The link is checkable — retendered_from_id resolves to a notice
// in this set on all 100, and 99 of those pairs share a character-identical package
// description — and what is on the far side of the link is nothing at all. The funnel
// above is five counts on the same 100 notices, so the drop to zero is not a sample.

# h2
en: The round run twice, and nothing left of the first
bn: যে ধাপ দুবার হলো, আর প্রথমটির কিছুই রইল না

# fig retender

# finding fact
h.en: The abandoned round publishes no bid count, no bidder and no price
h.bn: বাতিল হওয়া ধাপটি দরের সংখ্যা, দরদাতা বা দাম — কিছুই প্রকাশ করে না
en: {{retender.flagged|n}} notices record a retender. Every one of the
  {{retender.linked|n}} second attempts names the notice it replaces;
  {{retender.same_package|n}} describe the package in identical words. Of those first
  rounds: {{retender.first_with_bids|n}} publish a bid count,
  {{retender.first_with_winner|n}} name a bidder, {{retender.first_with_value|n}} publish
  a price. {{retender.first_ever_awarded|n}} ever reached a contract. The second attempts
  produced {{retender.second_awarded|n}} contracts worth {{retender.second_crore|cr}}.
bn: {{retender.flagged|n}}টি বিজ্ঞপ্তিতে পুনঃদরপত্রের কথা আছে। {{retender.linked|n}}টি
  দ্বিতীয় ধাপের প্রত্যেকটিই যে বিজ্ঞপ্তির বদলে এসেছে তার নাম লেখে;
  {{retender.same_package|n}}টিতে প্যাকেজের বর্ণনা অক্ষরে অক্ষরে এক। প্রথম ধাপগুলোর:
  {{retender.first_with_bids|n}}টিতে দরের সংখ্যা, {{retender.first_with_winner|n}}টিতে
  দরদাতার নাম, {{retender.first_with_value|n}}টিতে দাম। {{retender.first_ever_awarded|n}}টি
  চুক্তিতে পৌঁছেছে কখনো। দ্বিতীয় ধাপ থেকে {{retender.second_awarded|n}}টি চুক্তি,
  মূল্য {{retender.second_crore|cr}}।

// ------------------------------------------------------- who is allowed to bid
// The bar itself, now as context rather than as the argument. The rule is read off
// the standard document's own pages: ITT 12.1 makes qualification pass or fail, ITT
// 13 and 14 send every level to the tender data sheet the buying office writes, and
// nothing in it sets a ceiling. Then how high the offices actually set it, and the
// two facts about the wording that can be checked without reading intent into it.

# h2
en: The office that buys sets the bar
bn: যে দপ্তর কেনে, মাপকাঠিও ঠিক করে সে-ই

# p
en: None of this breaks a rule. The standard document makes qualification pass or fail,
  then leaves every level — experience, turnover, cash in hand — “as specified in the
  TDS.” The buying office writes the TDS. No rule sets a ceiling.
bn: এর কিছুই নিয়মবিরুদ্ধ নয়। আদর্শ দস্তাবেজ যোগ্যতাকে পাশ-ফেল রাখে, তারপর প্রতিটি মাত্রা
  — অভিজ্ঞতা, লেনদেন, নগদ — ছেড়ে দেয় “দরপত্র উপাত্ত পত্রে যেমন উল্লিখিত”। ওই পত্র লেখে
  দপ্তর নিজেই। কোনো বিধিতে ঊর্ধ্বসীমা নেই।

# fig bars

# finding derived
h.en: {{bars.financial_above_1x|n}} notices asked a bidder to show more money than the
  contract was worth
h.bn: {{bars.financial_above_1x|n}}টি বিজ্ঞপ্তিতে দরদাতাকে চুক্তির মূল্যের চেয়ে বেশি অর্থ
  দেখাতে বলা হয়েছে
en: Across {{bars.financial.n|n}} tenders showing both the money demanded and the contract
  value, the middle demand is {{bars.financial.median|x2}} the contract value;
  {{bars.financial_above_2x|n}} ask more than twice it. Where a rule fixes the figure,
  offices follow it: the bid deposit is in band in {{bars.security_in_band_pct|pct}} of
  the {{bars.security.n|n}} notices that print it. The figures that climb are the ones
  offices set themselves.
bn: চাওয়া অর্থ ও চুক্তিমূল্য দুটিই প্রকাশিত {{bars.financial.n|n}}টি দরপত্রে মাঝের
  দাবি চুক্তিমূল্যের {{bars.financial.median|x2}}; {{bars.financial_above_2x|n}}টিতে
  দ্বিগুণের বেশি। যেখানে বিধি সংখ্যা বাঁধে, সেখানে মানা হয়: জামানত
  {{bars.security_in_band_pct|pct}}-এ সীমার মধ্যে। যা চড়ে সেটা দপ্তর নিজে ঠিক করে।

# evidence high_bar

# p
en: {{eligibility.no_criteria|n}} notices ({{eligibility.no_criteria_pct|pct}}) publish no
  criteria at all, sending the bidder to an unpublished data sheet. Where criteria appear,
  {{reuse.tenders|n}} tenders repeat a qualification sentence word for word from another
  notice here.
bn: {{eligibility.no_criteria|n}}টি বিজ্ঞপ্তি ({{eligibility.no_criteria_pct|pct}}) কোনো
  শর্তই ছাপে না — দরদাতাকে পাঠায় অপ্রকাশিত উপাত্ত পত্রে। আর {{reuse.tenders|n}}টি
  দরপত্রে যোগ্যতার একটি বাক্য অন্য বিজ্ঞপ্তি থেকে অক্ষরে অক্ষরে এক।

# evidence no_criteria

# evidence repeat_clause

# fig agencies

// -------------------------------------------------------- where the money sits
// The map, then the same six authorities measured rather than shaded, then the one
// number that carries the headline: the thin end of the field holds nearly half the
// money. Four documents follow — the tender that drew one bid, the notice whose bar
// sat far above its own peers, the firms that won most often, and the largest single
// contract in the set.

# h2
en: Where the field is thinnest, the money is thickest
bn: প্রতিযোগিতা যেখানে সবচেয়ে কম, টাকা সেখানেই সবচেয়ে বেশি

# fig authorityMap

# fig authority

# p
en: {{money.thin_field_n|n}} tenders drew two bidders or fewer, yet carry
  {{money.thin_field_crore|cr}} — {{money.thin_field_share|pct}} of every taka. The
  {{filter.top_band.n|n}} that drew ten or more share {{filter.top_band.crore|cr}}.
  {{field.single_responsive|n}} tenders ended with one responsive bidder however many bid.
bn: {{money.thin_field_n|n}}টি দরপত্রে দরদাতা দুই বা কম, তবু ওতে {{money.thin_field_crore|cr}} —
  প্রতিটি টাকার {{money.thin_field_share|pct}}। দশ বা তার বেশি দর পাওয়া
  {{filter.top_band.n|n}}টিতে সব মিলিয়ে {{filter.top_band.crore|cr}}।
  {{field.single_responsive|n}}টি শেষ হয়েছে একজন গ্রহণযোগ্য দরদাতায় যতজনই দর দিক।

# fig competition

# evidence peer_gap

# fig winners

# p
en: {{concentration.distinct_winners|n}} firms share {{counts.awards|n}} contracts. One
  holds {{concentration.top1.contracts|n}} contracts worth {{concentration.top1.crore|cr}}
  — {{concentration.top1.share|pct}} of every taka here.
bn: {{concentration.distinct_winners|n}}টি প্রতিষ্ঠান ভাগ করে নিয়েছে {{counts.awards|n}}টি
  চুক্তি। একটি প্রতিষ্ঠান {{concentration.top1.contracts|n}}টি চুক্তিতে পেয়েছে
  {{concentration.top1.crore|cr}} — সব টাকার {{concentration.top1.share|pct}}।

# evidence biggest

// ------------------------------------------------------------- the complication
// The measurement that runs the other way, printed in the article rather than in the
// method note, because a reader who never opens the method should still meet it. The
// restriction score is built out of published criteria text, and 599 notices publish
// none — so the score exists mainly where an office wrote a lot down, which is mainly
// on the larger packages. That is why it tracks disclosure and not exclusion.

# h2
en: What the measurements do not show
bn: মাপগুলো যা দেখায় না

# fig restriction

# p
en: Among the {{correlation.level_vs_bids_276.n|n}} tenders that publish conditions, the
  more demanding ones drew slightly more bidders ({{correlation.level_vs_bids_276.r|r}}).
  Text is printed mostly on bigger packages that draw crowds — the score measures
  disclosure as much as exclusion. High bar and thin field are two separate findings.
bn: শর্ত প্রকাশিত {{correlation.level_vs_bids_276.n|n}}টির মধ্যে কঠিনগুলোতে দরদাতা এসেছে
  কিছু বেশি ({{correlation.level_vs_bids_276.r|r}})। লেখা ছাপা হয় মূলত বড় প্যাকেজে —
  তাই মাপটি প্রকাশের মাপও বটে। উঁচু মাপকাঠি আর পাতলা প্রতিযোগিতা দুটি আলাদা ফলাফল।

// ----------------------------------------------------------------- the rules
// Eighteen rules lifted verbatim from the standard documents in this folder, tested
// row by row. The paragraph exists to keep the large number off the headline: 1,583
// deviations is a screening count, and only the 213 measured against a rule this set
// shows was in force on the notice's own date may be described as anything more.

# fig rules

# p
en: Eighteen rules from the standard documents tested against every notice:
  {{rules_summary.tested_rows|n}} tests, {{rules_summary.deviation_rows|n}} deviations.
  {{rules_summary.plausibly_in_force|n}} are measured against a rule this set shows was
  in force on the day; {{violations.duty_in_force|n}} of those are worded as duties.
bn: আদর্শ দস্তাবেজের আঠারোটি বিধি প্রতিটি বিজ্ঞপ্তিতে পরীক্ষা করা হয়েছে:
  {{rules_summary.tested_rows|n}}টি পরীক্ষা, {{rules_summary.deviation_rows|n}}টি বিচ্যুতি।
  {{rules_summary.plausibly_in_force|n}}টি সেইদিনে বলবৎ বিধির বিরুদ্ধে মাপা;
  তার {{violations.duty_in_force|n}}টির ভাষা বাধ্যবাধকতার।

# evidence rule_stack

# fig violations

// ---------------------------------------------------------------- the close
// Four named, obtainable documents, then the one test that cannot be run without
// them, then the thesis restated as mechanism with no accusation in it.

# h2
en: What would settle it
bn: যা দিয়ে বিষয়টি মিটে যেত

# p
en: Four documents would answer what these do not: the cost estimate for any contract; the
  written reason each of the {{field.lost|n}} bids was ruled out; the losers' names and
  prices; the owners of winning firms, blank on {{ownership.not_disclosed|n}} notices.
  All four exist. None is published.
bn: চারটি নথি এগুলো যা বলে না তার উত্তর দিত: যেকোনো একটি চুক্তির প্রাক্কলিত ব্যয়;
  {{field.lost|n}}টি বাতিল দরের লিখিত কারণ; হেরে যাওয়াদের নাম ও দর; বিজয়ীদের মালিক —
  {{ownership.not_disclosed|n}}টিতে ঘর ফাঁকা। চারটিই আছে। একটিও প্রকাশিত নয়।

# p
en: Without them the central rule cannot be checked once. The award should go to the lowest
  evaluated responsive bid; that test needs the prices it beat, and the estimate is blank
  in all {{counts.tenders|n}} notices.
bn: এগুলো ছাড়া মূল বিধিটি একবারও যাচাই করা যায় না। কাজ পাওয়ার কথা সর্বনিম্ন মূল্যায়িত
  গ্রহণযোগ্য দরের; সেই পরীক্ষায় দরকার হারানো দরগুলোর দাম — আর প্রাক্কলন
  {{counts.tenders|n}}টি বিজ্ঞপ্তির সবগুলোতেই ফাঁকা।

# p
en: The record shows what the rules allow: the buying office sets the bar, decides what
  happens to a bid received, puts a floor under the price, and need never say who it ruled
  out or why. That is a red flag warranting scrutiny, not a finding of wrongdoing.
bn: নথি দেখায় বিধি কী করতে দেয়: ক্রয়কারী দপ্তর মাপকাঠি ঠিক করে, দরের সঙ্গে কী হবে তা
  ঠিক করে, দামের নিচে মেঝে বসায়, কাকে কেন বাদ দিল কখনো না বললেও চলে। এটি খতিয়ে দেখার
  মতো লাল পতাকা, অপরাধ প্রমাণিত হওয়া নয়।

# exhibits

# doors
