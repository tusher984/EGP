// =============================================================================
//  THE STORY.  Edit this file to change the article on the page.
// =============================================================================
//  index.html names this file in <meta name="story-src">. The page fetches it,
//  site/scripts/storydoc.js reads it, site/scripts/story.js draws it. No build
//  step, no JavaScript to touch: change a sentence here, reload, it is on the
//  page. There is no second, longer version of this article anywhere: every one
//  of the twelve case studies is in here, at the finding it belongs to, as
//  evidence rather than as an essay — the tender named, the passage from its own
//  page with the operative words marked, the figures it turns on, both PDFs. A
//  `# fig` and a `# evidence` block cost this file no words, so the argument can
//  be carried by the documents and the charts while the prose stays under the
//  thousand-word ceiling the gate enforces.
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
//  FIGURES     funnel competition agencies authorityMap authority restriction
//              bars timeline portal stack winners violations rules
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
en: e-GP Watch · Public procurement
bn: e-GP ওয়াচ · সরকারি ক্রয়

# hed
en: Restricting competition keeps the price up
bn: প্রতিযোগিতায় সীমাবদ্ধতা বাড়ায় খরচ

# dek
en: Six of Bangladesh’s urban development authorities published {{counts.pdfs|n}}
  procurement documents covering {{money.crore|cr}}. They show how a buying office can
  narrow who is allowed to bid, and how little it must explain. {{field.lost|n}} bids
  were rejected. Published reasons: {{field.reasons_published|n}}.
bn: বাংলাদেশের ছয়টি নগর উন্নয়ন সংস্থার প্রকাশিত {{counts.pdfs|n}}টি ক্রয়-নথিতে
  {{money.crore|cr}} টাকার কাজ। নথিগুলো দেখায়, একটি ক্রয়কারী দপ্তর কীভাবে ঠিক করে দিতে
  পারে কারা দর দিতে পারবে — আর কত কম ব্যাখ্যা তাকে দিতে হয়। বাতিল হয়েছে
  {{field.lost|n}}টি দর। প্রকাশিত কারণ: {{field.reasons_published|n}}টি।

// ---------------------------------------------------------------- the opening
// One tender, in full, before the article widens to all {{counts.tenders}}. Every
// figure is a token off corpus.case, which build.py fills from tender 538256’s
// own two pages, so this scene cannot drift from the record. The five-kilometre
// highway, the walkway and the turnover are quoted in the notice; the arithmetic
// comparing them to the road actually bought is ours and is stated as such.

# lede
en: In February 2021 the Chittagong Development Authority advertised a road in
  Uttar Patenga: a 1.175-kilometre two-lane link, a kilometre of four-lane feeder
  road, drains, culverts, a walkway, a gymnasium. To bid, a company had to have
  finished a five-kilometre four-lane highway worth at least {{case.similar_crore|cr}},
  under one contract. It had to have built a kilometre of five-metre-wide walkway on a
  sea or river bank. It needed {{case.turnover_crore|cr}} in yearly turnover. To build
  one kilometre of four-lane road, a bidder had to have already built five.
bn: ২০২১ সালের ফেব্রুয়ারিতে চট্টগ্রাম উন্নয়ন কর্তৃপক্ষ উত্তর পতেঙ্গায় একটি সড়কের
  দরপত্র আহ্বান করে: ১.১৭৫ কিলোমিটার দুই লেনের সংযোগ সড়ক, এক কিলোমিটার চার লেনের
  ফিডার সড়ক, নর্দমা, কালভার্ট, কংক্রিটের হাঁটাপথ, একটি জিমনেসিয়াম। দর দিতে হলে
  প্রতিষ্ঠানটিকে আগেই একটি চুক্তিতে পাঁচ কিলোমিটার চার লেনের মহাসড়ক শেষ করে থাকতে হবে,
  যার মূল্য অন্তত {{case.similar_crore|cr}}। সমুদ্র বা নদীর তীরে পাঁচ মিটার চওড়া এক
  কিলোমিটার হাঁটাপথও বানিয়ে থাকতে হবে। বার্ষিক লেনদেন চাই {{case.turnover_crore|cr}}।
  অর্থাৎ এক কিলোমিটার চার লেনের সড়ক বানাতে দরদাতাকে আগে পাঁচ কিলোমিটার বানিয়ে থাকতে হবে।

# p
en: {{case.sold|n}} companies bought the documents. {{case.bids|n}} bid.
  {{case.responsive|n}} was found responsive. The work went to {{case.winner|firm}} for
  {{case.crore|cr}}. The published record does not say who the other
  {{case.rejected|n}} were, what they offered, or why they were ruled out. The award
  notice has no line for any of it.
bn: {{case.sold|n}}টি প্রতিষ্ঠান নথি কিনেছিল। দর দিয়েছিল {{case.bids|n}}টি।
  গ্রহণযোগ্য বিবেচিত হয় {{case.responsive|n}}টি। কাজটি পায় {{case.winner|firm}},
  মূল্য {{case.crore|cr}}। বাকি {{case.rejected|n}}টি কারা ছিল, দর কত দিয়েছিল, কেন বাদ
  পড়ল — প্রকাশিত নথি কিছুই বলে না। চুক্তির বিজ্ঞপ্তিতে এর কোনোটির জন্যই ঘর নেই।

// The lender’s own rulebook is in this repository, so it can be quoted against
// this tender rather than paraphrased. Scope is stated in the sentence: the
// strictness warning sits under prequalification, and these bars were set in the
// tender notice, so it is offered as the lender’s standard, not as a breach.

# p
en: A Japanese development loan paid for part of this road. The lender’s procurement
  guidelines are in this folder. Criteria for who may compete, they say, “should not be
  so strict as to limit participation to only certain companies.”
bn: এই সড়কের একটি অংশের অর্থ এসেছে জাপানি উন্নয়ন ঋণ থেকে। ঋণদাতার ক্রয়-নির্দেশিকা এই
  সম্ভারেই আছে। কারা প্রতিযোগিতায় থাকতে পারবে তা ঠিক করার শর্ত, সেখানে বলা আছে, “এত
  কঠিন হওয়া উচিত নয় যে অংশগ্রহণ কেবল নির্দিষ্ট কয়েকটি প্রতিষ্ঠানেই সীমিত হয়ে পড়ে।”

# tiles

// The set over time, before the argument starts: 1,155 notices and 645 awards,
// and where in those four years the money was signed away. It carries its own
// title and source, so it needs no sentence of introduction.

# fig timeline

// ------------------------------------------------------- who is allowed to bid
// The rule, read off the standard document’s own pages, before any judgement.
// ITT 12.1 requires pass/fail qualification; ITT 13 and 14 send every level to
// the tender data sheet the buying office writes; there is no ceiling in it.

# h2
en: The office that buys sets the bar
bn: যে দপ্তর কেনে, মাপকাঠিও ঠিক করে সে-ই

# p
en: None of this breaks a rule. Bangladesh’s standard tender document makes
  qualification pass or fail: criteria “which if not met by the Tenderers, will result
  in consideration of its Tender as non-responsive.” It then leaves every level to the
  buying office — experience, turnover, cash in hand, similar jobs finished, all “as
  specified in the TDS.” The buying office writes the TDS. No rule sets a ceiling.
bn: এর কিছুই নিয়মবিরুদ্ধ নয়। বাংলাদেশের আদর্শ দরপত্র দস্তাবেজ যোগ্যতা যাচাইকে পাশ-ফেলই
  রাখে: এমন শর্ত, “দরদাতা যা পূরণ করতে না পারলে তার দরপত্র গ্রহণযোগ্য নয় বলে বিবেচিত
  হবে।” তারপর প্রতিটি মাত্রা ছেড়ে দেয় ক্রয়কারী দপ্তরের হাতে — অভিজ্ঞতা, লেনদেন, হাতে
  নগদ, কতটি সমমানের কাজ, সবই “দরপত্র উপাত্ত পত্রে যেমন উল্লিখিত”। ওই পত্র লেখে দপ্তরটি
  নিজেই। কোনো বিধিতে ঊর্ধ্বসীমা নেই।

# fig bars

# finding derived
h.en: {{bars.financial_above_1x|n}} notices asked a bidder to show more money than the
  contract was worth
h.bn: {{bars.financial_above_1x|n}}টি বিজ্ঞপ্তিতে দরদাতাকে চুক্তির মূল্যের চেয়ে বেশি অর্থ
  দেখাতে বলা হয়েছে
en: {{bars.financial.n|n}} tenders publish both the money demanded and the contract
  value. The middle demand is {{bars.financial.median|x2}} the contract value.
  {{bars.financial_above_2x|n}} ask for more than twice it. Experience follows the same
  pattern: usually less than the job, but {{bars.specific_above_1x|n}} notices ask for a
  finished contract bigger than the work being bought.
bn: চাওয়া অর্থ ও চুক্তিমূল্য দুটিই প্রকাশিত এমন দরপত্র {{bars.financial.n|n}}টি। দাবির
  মাঝের মান চুক্তিমূল্যের {{bars.financial.median|x2}}। {{bars.financial_above_2x|n}}টিতে
  চাওয়া হয়েছে দ্বিগুণের বেশি। অভিজ্ঞতার ধাঁচও একই: সাধারণত কাজটির চেয়ে কম, তবু
  {{bars.specific_above_1x|n}}টি বিজ্ঞপ্তি চায় হাতের কাজটির চেয়েও বড় একটি শেষ করা
  চুক্তি।
en: Where a national rule fixes the number, offices follow it. The bid deposit sits
  inside the permitted band in {{bars.security_in_band_pct|pct}} of the
  {{bars.security.n|n}} tenders that publish it. The numbers that climb are the ones the
  buying office sets itself.
bn: যেখানে জাতীয় বিধি সংখ্যাটি বেঁধে দেয়, সেখানে দপ্তর তা মানে। দরের জামানত যে
  {{bars.security.n|n}}টি দরপত্রে প্রকাশিত, তার {{bars.security_in_band_pct|pct}}-এ তা
  অনুমোদিত সীমার ভেতরেই। যে সংখ্যাগুলো উঠতে থাকে, সেগুলো ক্রয়কারী দপ্তর নিজে ঠিক করে।

// One notice from the far end of that chart, and then the chart that tests the
// obvious objection to it. The fire-protection tender demanded yearly turnover of
// seven and a half times the contract; the restriction figure asks whether notices
// that look restrictive drew fewer bidders, and answers no — which is why the
// complication is printed further down the article rather than left out of it.

# evidence high_bar

# fig restriction

// ------------------------------------------------- how the criteria get written
// Three checkable things about the wording itself, in this order: how often it is
// published at all, how often it is reused rather than written for the job, and the
// one eligibility clause in the standard document that is a prohibition rather than
// a discretion. The enlistment finding is broken down by wording because the count
// on its own would overstate it — most of these clauses accept enlistment with any
// public body, and corpus.eligibility.enlistment sorts all 88 by shape so the
// article can print the wide form and the closed form side by side.

# h2
en: Half the notices never say what the bar is
bn: অর্ধেক বিজ্ঞপ্তিই বলে না মাপকাঠিটা কী

# fig agencies

# p
en: {{eligibility.no_criteria|n}} of the {{counts.tenders|n}} notices, or
  {{eligibility.no_criteria_pct|pct}}, publish no criteria of their own. They send the
  bidder to a data sheet not published with them. Where criteria are printed, they are
  often not written for the job: {{reuse.tenders|n}} tenders repeat a qualification
  sentence word for word from another notice here.
bn: {{counts.tenders|n}}টি বিজ্ঞপ্তির {{eligibility.no_criteria|n}}টিতে, অর্থাৎ
  {{eligibility.no_criteria_pct|pct}}, নিজস্ব কোনো শর্তই ছাপা হয়নি। দরদাতাকে পাঠানো
  হয়েছে এমন এক উপাত্ত পত্রে, যা বিজ্ঞপ্তির সঙ্গে প্রকাশিত নয়। আর যেখানে শর্ত ছাপা আছে,
  সেখানেও তা প্রায়ই এই কাজটির জন্য লেখা নয়: {{reuse.tenders|n}}টি দরপত্রে যোগ্যতার একটি
  বাক্য অন্য বিজ্ঞপ্তি থেকে অক্ষরে অক্ষরে এক।

// The two halves of that paragraph, each as one document. no_criteria is the
// second largest of the twelve scenes, and everything its notice published about
// who could bid is three words; repeat_clause is the shared sentence itself,
// with the count of other notices carrying it word for word in the label.

# evidence no_criteria

# evidence repeat_clause

# finding derived
h.en: {{eligibility.enlistment.n|n}} notices asked for an enlistment the standard
  document says may not be asked for
h.bn: {{eligibility.enlistment.n|n}}টি বিজ্ঞপ্তিতে আগেই তালিকাভুক্তি চাওয়া হয়েছে, যা
  আদর্শ দস্তাবেজ বলে চাওয়াই যাবে না
en: Its own words: “There shall not be any pre-conditions whatsoever, for sale of
  Tender Documents.” It keeps enlistment for the limited method.
  {{eligibility.enlistment.n|n}} notices ask for it anyway. Most are wide:
  {{eligibility.enlistment.catch_all|n}} accept any public body, shutting out only a firm
  enlisted nowhere. {{eligibility.enlistment.single_office|n}} name one office, and in
  {{eligibility.enlistment.own_office|n}} it is the authority running the tender.
bn: দস্তাবেজের নিজের ভাষা: “দরপত্র দস্তাবেজ বিক্রির ক্ষেত্রে কোনো পূর্বশর্তই থাকবে না।”
  তালিকাভুক্তির শর্তটি সে রেখেছে সীমিত পদ্ধতির জন্য। তবু এখানকার
  {{eligibility.enlistment.n|n}}টি বিজ্ঞপ্তি তা চেয়েছে। বেশিরভাগেরই দরজা চওড়া:
  {{eligibility.enlistment.catch_all|n}}টি যেকোনো সরকারি প্রতিষ্ঠানের তালিকাভুক্তিই মানে,
  ফলে বাদ পড়ে কেবল সেই প্রতিষ্ঠান যে কোথাওই তালিকাভুক্ত নয়।
  {{eligibility.enlistment.single_office|n}}টিতে একটিমাত্র দপ্তরের নাম, আর তার
  {{eligibility.enlistment.own_office|n}}টিতে সেই দপ্তরই দরপত্রটি ডেকেছে।
en: In {{field.mass_disqualified|n}} tenders most of the field was ruled out at once.
  In {{preselection.strong|n}} notices, five or more of seven conditions occur together:
  a restrictive-looking requirement, bidders ruled non-responsive, one responsive bid
  left, a repeat winner. That is a reason to ask questions, not proof of preselection.
bn: {{field.mass_disqualified|n}}টি দরপত্রে প্রতিযোগীদের বড় অংশ একবারেই বাদ পড়েছে।
  {{preselection.strong|n}}টি বিজ্ঞপ্তিতে সাতটি শর্তের পাঁচটি বা তার বেশি একসঙ্গে মেলে:
  সীমাবদ্ধকারী বলে মনে হওয়া শর্ত, অগ্রহণযোগ্য বিবেচিত দরদাতা, শেষে একটিই গ্রহণযোগ্য দর,
  বারবার জেতা বিজয়ী। এটি প্রশ্ন করার কারণ, আগেই বেছে রাখার প্রমাণ নয়।

// The seven conditions as a distribution, then the one notice that meets most of
// them, then what happened when all eighteen rules were tested against every
// notice — and one notice on which several of them stack. The figures carry the
// counts and the definitions, so nothing here is asserted in prose that the
// reader cannot see tested.

# fig stack

# evidence preselection

# fig rules

# evidence rule_stack

// ---------------------------------------------------------------- the price cap
// The one place where a rule, the money and the arithmetic meet on the same page.
// Both weaknesses of this section are in Data & method: the clause sits almost
// entirely inside one authority, and the lender that finances part of this set
// does not itself ask for the estimate to be published before bidding.

# h2
en: A floor under the price, and nobody may see it
bn: দামের নিচে একটি মেঝে, যা কারও দেখার অনুমতি নেই

# p
en: The same discretion reaches the price. {{estimate.band_notices|n}} notices reject
  any bid more than {{estimate.width_common|n}} per cent away from the official cost
  estimate, above or below. A company that can do the job a fifth cheaper cannot offer
  that price and win. The saving disqualifies it. The estimate itself appears in none of
  the {{counts.pdfs|n}} documents, so no bidder can see the centre of the band.
bn: একই স্বেচ্ছাধিকার দামের গায়েও পৌঁছায়। এখানকার {{estimate.band_notices|n}}টি
  বিজ্ঞপ্তি সরকারি প্রাক্কলিত ব্যয়ের {{estimate.width_common|n}} শতাংশের বেশি দূরের দর
  বাতিল করে — উপরে হোক, নিচে হোক। যে প্রতিষ্ঠান এক-পঞ্চমাংশ কমে কাজটি করতে পারে, সে ওই
  দাম বলে কাজ পেতে পারবে না। সাশ্রয়টিই তাকে অযোগ্য করে দেয়। আর প্রাক্কলনটি
  {{counts.pdfs|n}}টি নথির একটিতেও নেই, তাই বলয়ের কেন্দ্রটি কোনো দরদাতাই দেখতে পান না।

// The band as one notice’s own page — the ±10 per cent printed, the estimate it
// is measured from absent — and then where these clauses sit in the rulebook:
// which of the eighteen rules are worded as duties and which are guidance a
// buying office may set aside. The price band is in the second group, which is
// the honest thing to show beside the finding rather than under it.

# evidence price_band

# finding fact
h.en: A notice that rejects any bid {{estimate.width_common|n}} per cent below the
  estimate has capped its own saving there
h.bn: প্রাক্কলনের {{estimate.width_common|n}} শতাংশ নিচের দর যে বিজ্ঞপ্তি নেবে না, সে
  নিজের সাশ্রয়ের সীমাও ওখানেই বেঁধে ফেলেছে
en: The cap is set before the first envelope is opened, and it is set by the office that
  will pay the bill. {{estimate.two_sided|n}} notices name both directions expressly.
  {{estimate.band_awarded|n}} became contracts worth {{estimate.band_crore|cr}}. This is
  not a finding that any price was too high. It is a finding that nobody outside the
  buying office can tell.
bn: প্রথম খামটি খোলার আগেই সীমা বাঁধা হয়ে যায়, আর বাঁধে যে দপ্তর বিলটি দেবে সে-ই।
  {{estimate.two_sided|n}}টি বিজ্ঞপ্তিতে দুই দিকের কথাই স্পষ্ট করে লেখা।
  {{estimate.band_awarded|n}}টিতে চুক্তি হয়েছে, মূল্য {{estimate.band_crore|cr}}। এটি এই
  সিদ্ধান্ত নয় যে কোনো দাম বেশি ছিল। এটি এই সিদ্ধান্ত যে দপ্তরের বাইরের কেউ তা বলতে
  পারবে না।

# fig violations

// ------------------------------------------------------------- the silence
// The three zeros, then the two clauses that account for them. Both are quoted:
// the reasons clause and the award form’s own list of fields. The point is not
// that a form is badly designed — it is that the record’s silence is provided for.
//
// Three documents follow the paragraph, and they widen the subject from what the
// record leaves out to what it fails to hold up: a notice recording fifty-four
// bids and none responsive with a signed contract underneath; the portal’s own
// yes-or-no answer on certification against the dates on the same page; and a
// contract signed long after the window the standard document allows. All three
// are the record disagreeing with itself, which is the same weakness as the
// silence and is checkable in a way the silence is not.

# h2
en: {{field.lost|n}} rejections, and not one published reason
bn: {{field.lost|n}}টি দর বাতিল, প্রকাশিত কারণ একটিও নয়

# fig funnel

// The figure above prints the count, the rejections and the three zeros, so the
// prose does not repeat them; it accounts for them instead, out of the two clauses
// that provide for the silence.

# p
en: The silence is written into the rules. The standard document gives a rejected
  tenderer the reason on written request, then adds that the office “is not required to
  justify those reason(s).” The award form the office must publish has no field for
  anyone who lost. Nothing was withheld here. The record was never asked to hold it.
bn: এই নীরবতা বিধিতেই লেখা আছে। আদর্শ দস্তাবেজ বলে, বাতিল হওয়া দরদাতা লিখিত আবেদনে
  কারণটি জানতে পারবেন — তারপরই যোগ করে, দপ্তর “ওই কারণগুলোর সাফাই দিতে বাধ্য নয়।” আর যে
  চুক্তি-বিজ্ঞপ্তি দপ্তরকে প্রকাশ করতেই হয়, তাতে যারা হেরেছে তাদের জন্য কোনো ঘরই নেই।
  এখানে কিছু লুকানো হয়নি। নথিতে কখনো তা রাখতেই বলা হয়নি।

# evidence all_rejected

# fig portal

// The one sentence the portal's own answer supports, before the notice itself:
// across every award notice that answers the question and prints both dates, "yes"
// is exactly (days <= flat_cap) — corpus.portal.flat_test_exceptions is 0. So the
// figure above counts contracts signed later than their own size allows, and this
// paragraph says what the answer is measuring instead. Both are checkable; neither
// is an explanation, and none is offered.

# p
en: On all {{portal.answered|n}} notices that answer it, the portal says yes when the
  contract was signed within {{portal.flat_cap|n}} days, and no when it was not.
bn: যে {{portal.answered|n}}টি বিজ্ঞপ্তি প্রশ্নটির উত্তর দিয়েছে, তার সবগুলোতেই পোর্টাল
  হ্যাঁ বলেছে যখন চুক্তি {{portal.flat_cap|n}} দিনের মধ্যে সই হয়েছে, আর না বলেছে যখন হয়নি।

# evidence portal_yes

# evidence late_signing

// -------------------------------------------------------- where the money sits
// The map, then the one number that carries the argument, then the complication
// that cuts against it. The counter-signal is published here rather than in the
// method note because a reader who never opens the method should still meet it.
//
// The six-by-six table sits directly under the map because it is the same subject
// measured rather than shaded: the map says who is on the worse side of each
// middle, the table says by how much on all six measures at once. Then the money
// against the size of the field, and four documents against it: the tender that
// drew one bid, the notice whose bar sat far above its own peers, the largest
// single contract in the set, and the firms that won most often.

# h2
en: Where the field is thinnest, the money is thickest
bn: প্রতিযোগিতা যেখানে সবচেয়ে কম, টাকা সেখানেই সবচেয়ে বেশি

# fig authorityMap

# fig authority

# p
en: {{money.thin_field_n|n}} tenders drew two bidders or fewer. Together they carry
  {{money.thin_field_crore|cr}}, or {{money.thin_field_share|pct}} of every taka.
  {{field.single_responsive|n}} ended with one responsive bidder, however many bid.
bn: {{money.thin_field_n|n}}টি দরপত্রে দরদাতা ছিল দুই বা তার কম। ওই দরপত্রগুলোতেই আছে
  {{money.thin_field_crore|cr}}, অর্থাৎ প্রতিটি টাকার {{money.thin_field_share|pct}}।
  {{field.single_responsive|n}}টি শেষ হয়েছে একজন গ্রহণযোগ্য দরদাতা দিয়ে, দর যতজনই দিয়ে
  থাকুক।

# fig competition

# evidence single_bid

# evidence peer_gap

# p
en: One measurement cuts against the argument, and it belongs here. Among the
  {{correlation.level_vs_bids_276.n|n}} tenders that publish their conditions, the more
  demanding ones drew slightly more bidders, not fewer
  ({{correlation.level_vs_bids_276.r|r}}). Bigger jobs ask for more and attract more.
  High bars and thin fields are two separate findings.
bn: একটি মাপ যুক্তিটির বিপক্ষে যায়, আর তার জায়গা এখানেই। যেসব দরপত্রে শর্ত প্রকাশিত, ওই
  {{correlation.level_vs_bids_276.n|n}}টির মধ্যে বেশি কঠিনগুলোতে দরদাতা এসেছে কিছু বেশি,
  কম নয় ({{correlation.level_vs_bids_276.r|r}})। বড় কাজ বেশি চায়, আর বেশি টানেও। উঁচু
  মাপকাঠি ও পাতলা প্রতিযোগিতা দুটি আলাদা ফলাফল।

# fig winners

# evidence biggest

# exhibits

// ---------------------------------------------------------------- the close
// Four named, obtainable documents, and the limit of what this set can support.
// The last sentence is the thesis restated as mechanism, with no accusation in it.

# h2
en: What would settle it
bn: যা দিয়ে বিষয়টি মিটে যেত

# p
en: Four documents would answer what these do not: the cost estimate for any of the
  {{counts.awards|n}} contracts; the written reason each of the {{field.lost|n}} bids was
  ruled non-responsive; the names and prices of the losing companies; and the owners of
  the winning firms, blank on {{ownership.not_disclosed|n}} notices. All four exist. None
  is published.
bn: চারটি নথি এগুলো যা বলে না তার উত্তর দিত: {{counts.awards|n}}টি চুক্তির যেকোনো একটির
  প্রাক্কলিত ব্যয়; {{field.lost|n}}টি বাতিল দরের প্রতিটিকে কেন অগ্রহণযোগ্য বলা হলো তার
  লিখিত কারণ; যারা হেরেছে তাদের নাম আর দর; এবং বিজয়ী প্রতিষ্ঠানগুলোর মালিকদের পরিচয় —
  {{ownership.not_disclosed|n}}টি বিজ্ঞপ্তিতে ঘরটি ফাঁকা। চারটিই আছে। একটিও প্রকাশিত নয়।

# p
en: The record shows what the rules allow: the office that spends the money sets the
  bar, puts a floor under the price, and need never say who it ruled out or why. That is
  a red flag warranting scrutiny, not a finding of wrongdoing.
bn: নথি দেখায় বিধি কী কী করতে দেয়: যে দপ্তর টাকাটা খরচ করে, সে-ই মাপকাঠি ঠিক করে, দামের
  নিচে মেঝে বসায়, আর কাকে কেন বাদ দিল তা কখনো না বললেও চলে। এটি খতিয়ে দেখার মতো লাল
  পতাকা, অপরাধ প্রমাণিত হওয়া নয়।

# doors

