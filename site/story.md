// =============================================================================
//  THE STORY.  Edit this file to change the article on the page.
// =============================================================================
//  index.html names this file in <meta name="story-src">. The page fetches it,
//  site/scripts/storydoc.js reads it, site/scripts/story.js draws it. No build
//  step, no JavaScript to touch: change a sentence here, reload, it is on the
//  page. The longer version of this article — every finding, every case, at full
//  length — is kept under “Everything this was built from” at the foot of the
//  page and still lives in site/scripts/content.js.
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
//              fig <name> · case [id] · tiles · exhibits · doors
//  FIGURES     funnel competition agencies authorityMap authority restriction
//              bars timeline portal stack winners violations rules
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
  procurement documents covering {{money.crore|cr}}. Read together, they show how a
  government office may narrow the field it is about to choose from, and how little
  it must ever explain. {{field.lost|n}} bids were rejected here. Published reasons:
  {{field.reasons_published|n}}.
bn: বাংলাদেশের ছয়টি নগর উন্নয়ন সংস্থার প্রকাশিত {{counts.pdfs|n}}টি ক্রয়-নথিতে
  {{money.crore|cr}} টাকার কাজ। একসঙ্গে পড়লে নথিগুলো দেখায়, একটি সরকারি দপ্তর
  কীভাবে নিজের পছন্দের পরিসরটিকেই আগে সংকুচিত করে নিতে পারে — আর কত কমটুকুর ব্যাখ্যা
  তাকে কখনো দিতে হয়। এখানে বাতিল হয়েছে {{field.lost|n}}টি দর। প্রকাশিত কারণ:
  {{field.reasons_published|n}}টি।

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
  already finished, in one contract, a five-kilometre four-lane highway worth at
  least {{case.similar_crore|cr}} — and a kilometre of walkway, five metres wide,
  along a sea or river bank. It wanted {{case.turnover_crore|cr}} in annual turnover,
  {{case.liquid_crore|cr}} in liquid assets. To build one kilometre of four-lane
  road, a bidder had to have already built five.
bn: ২০২১ সালের ফেব্রুয়ারিতে চট্টগ্রাম উন্নয়ন কর্তৃপক্ষ উত্তর পতেঙ্গায় একটি সড়কের
  দরপত্র আহ্বান করে: ১.১৭৫ কিলোমিটার দুই লেনের সংযোগ সড়ক, এক কিলোমিটার চার লেনের
  ফিডার সড়ক, নর্দমা, কালভার্ট, কংক্রিটের হাঁটাপথ, একটি জিমনেসিয়াম। দর দেওয়ার আগে
  বিজ্ঞপ্তি শর্ত দেয়, প্রতিষ্ঠানটিকে আগেই একটি একক চুক্তিতে পাঁচ কিলোমিটার চার লেনের
  মহাসড়ক শেষ করে থাকতে হবে, যার মূল্য অন্তত {{case.similar_crore|cr}} — সঙ্গে সমুদ্র
  বা নদীর তীরে পাঁচ মিটার চওড়া এক কিলোমিটার হাঁটাপথ। বার্ষিক লেনদেন চাই
  {{case.turnover_crore|cr}}, হাতে নগদ সম্পদ {{case.liquid_crore|cr}}। অর্থাৎ এক
  কিলোমিটার চার লেনের সড়ক বানাতে হলে দরদাতাকে আগে পাঁচ কিলোমিটার বানিয়ে থাকতে হবে।

# p
en: {{case.sold|n}} companies bought the documents and {{case.bids|n}} bid.
  {{case.responsive|n}} was found responsive. The work went to
  {{case.winner|firm}} for {{case.crore|cr}}. The other {{case.rejected|n}} bids
  were ruled out, and the record does not say why, name the companies, or print what
  they offered. It cannot: the award notice has no line for any of it.
bn: {{case.sold|n}}টি প্রতিষ্ঠান নথি কিনেছিল, দর দিয়েছিল {{case.bids|n}}টি।
  গ্রহণযোগ্য বিবেচিত হয় {{case.responsive|n}}টি। কাজটি পায় {{case.winner|firm}},
  মূল্য {{case.crore|cr}}। বাকি {{case.rejected|n}}টি দর বাদ পড়ে — আর প্রকাশিত নথি
  বলে না কেন, ওই প্রতিষ্ঠানগুলোর নাম বলে না, তারা কত দর দিয়েছিল তাও ছাপে না। ছাপতে
  পারে না: চুক্তির বিজ্ঞপ্তিতে এর কোনোটির জন্যই কোনো ঘর নেই।

// The lender’s own rulebook is in this repository, so it can be quoted against
// this tender rather than paraphrased. Scope is stated in the sentence: the
// strictness warning sits under prequalification, and these bars were set in the
// tender notice, so it is offered as the lender’s standard, not as a breach.

# p
en: This road was part-financed by a Japanese development loan, whose procurement
  guidelines are in this folder. Criteria deciding who may compete, they say,
  “should not be so strict as to limit participation to only certain companies.”
  They require the borrower to make every bidder’s name and price available to be
  made public, and to tell a losing bidder, on request, why it lost. The record
  carries none of that.
bn: এই সড়কের অর্থায়নের একটি অংশ এসেছে জাপানি উন্নয়ন ঋণ থেকে, আর সেই ঋণদাতার
  ক্রয়-নির্দেশিকা এই সম্ভারেই আছে। কারা প্রতিযোগিতায় থাকতে পারবে তা ঠিক করার শর্ত
  “এত কঠিন হওয়া উচিত নয় যে অংশগ্রহণ কেবল নির্দিষ্ট কয়েকটি প্রতিষ্ঠানেই সীমিত হয়ে
  পড়ে।” নির্দেশিকা ঋণগ্রহীতাকে বলে, প্রত্যেক দরদাতার নাম ও দর যেন প্রকাশযোগ্য অবস্থায়
  থাকে; আর পরাজিত দরদাতা চাইলে তাকে জানাতে বলে, সে কেন হারল। নথি এর কিছুই বলে না।

# tiles

// ------------------------------------------------------- who is allowed to bid
// The rule, read off the standard document’s own pages, before any judgement.
// ITT 12.1 requires pass/fail qualification; ITT 13 and 14 send every level to
// the tender data sheet the buying office writes; there is no ceiling in it.

# h2
en: The office that buys sets the bar
bn: যে দপ্তর কেনে, মাপকাঠিও ঠিক করে সে-ই

# p
en: None of that is out of order. Bangladesh’s standard tender document requires
  qualification to work as pass or fail: criteria “which if not met by the
  Tenderers, will result in consideration of its Tender as non-responsive.” Then it
  hands every level to the buying office — experience, turnover, cash in hand,
  similar jobs finished, each “as specified in the TDS,” which that office writes
  itself. It sets no ceiling. The question is not whether a bar was allowed, but how
  high.
bn: এর কিছুই নিয়মবিরুদ্ধ নয়। বাংলাদেশের আদর্শ দরপত্র দস্তাবেজ যোগ্যতা যাচাইকে পাশ-ফেল
  হিসেবেই চায়: এমন শর্ত, “দরদাতা যা পূরণ করতে না পারলে তার দরপত্র গ্রহণযোগ্য নয় বলে
  বিবেচিত হবে।” এরপর প্রতিটি মাত্রা সে ছেড়ে দেয় ক্রয়কারী দপ্তরের হাতে — অভিজ্ঞতা,
  লেনদেন, হাতে নগদ, কতটি সমমানের কাজ, প্রত্যেকটিই “দরপত্র উপাত্ত পত্রে যেমন উল্লিখিত”,
  আর ওই পত্র লেখে দপ্তরটি নিজেই। কোনো ঊর্ধ্বসীমা সে বাঁধে না। প্রশ্নটি তাই মাপকাঠি
  বাঁধার অনুমতি ছিল কি না, প্রশ্ন কতটা উঁচুতে।

# fig bars

# finding derived
h.en: {{bars.financial_above_1x|n}} notices asked a bidder to hold more cash than
  the contract was worth
h.bn: {{bars.financial_above_1x|n}}টি বিজ্ঞপ্তিতে চুক্তির মূল্যের চেয়ে বেশি নগদ সম্পদ
  দাবি করা হয়েছে
en: On the {{bars.financial.n|n}} tenders where both the money demanded and the
  contract value are published, the middle demand is {{bars.financial.median|x2}}
  the contract; {{bars.financial_above_2x|n}} ask more than twice it. A company
  able to do the work but unable to show that much in the bank is not eligible to
  bid at all.
bn: যে {{bars.financial.n|n}}টি দরপত্রে চাওয়া অর্থ ও চুক্তিমূল্য দুটিই প্রকাশিত, সেখানে
  দাবির মাঝের মান চুক্তিমূল্যের {{bars.financial.median|x2}}; {{bars.financial_above_2x|n}}টিতে
  চাওয়া হয়েছে দ্বিগুণের বেশি। যে প্রতিষ্ঠান কাজটি করতে পারত কিন্তু ব্যাংকে ওই অর্থ
  দেখাতে পারে না, সে দর দেওয়ার যোগ্যই নয়।
en: Where a national rule fixes the number, it is obeyed: the bid deposit sits inside
  the permitted band in {{bars.security_in_band_pct|pct}} of the
  {{bars.security.n|n}} tenders that publish it. Fix the number and it holds; leave
  it to the buyer and the bars climb.
bn: যেখানে জাতীয় বিধি সংখ্যাটি বেঁধে দেয়, সেখানে তা মানা হয়: দরের জামানত যে
  {{bars.security.n|n}}টি দরপত্রে প্রকাশিত, তার {{bars.security_in_band_pct|pct}}-এ
  তা অনুমোদিত সীমার ভেতরেই। সংখ্যা বেঁধে দিলে তা টেকে; ক্রয়কারীর হাতে ছেড়ে দিলে
  মাপকাঠি উঠতে থাকে।

// ---------------------------------------------------------------- the price cap
// The one place where a rule, the money and the arithmetic meet on the same page.
// Both weaknesses of this section are in Data & method: the clause sits almost
// entirely inside one authority, and the lender that finances part of this set
// does not itself ask for the estimate to be published before bidding.

# h2
en: A floor under the price, and nobody may see it
bn: দামের নিচে একটি মেঝে, যা কারও দেখার অনুমতি নেই

# p
en: The same discretion reaches the money. {{estimate.band_notices|n}} notices here
  declare that a price more than {{estimate.width_common|n}} per cent from the
  official cost estimate — above or below — is to be rejected. A company that can do
  the job for a fifth less than the government expected may not say so and win: the
  saving is not a bid, it is a disqualification. The estimate appears in none of the
  {{counts.pdfs|n}} documents, so the centre of that corridor is invisible to
  everyone bidding into it. {{estimate.band_awarded|n}} became contracts worth
  {{estimate.band_crore|cr}}.
bn: একই স্বেচ্ছাধিকার টাকার গায়েও পৌঁছায়। এখানকার {{estimate.band_notices|n}}টি
  বিজ্ঞপ্তিতে লেখা, সরকারি প্রাক্কলিত ব্যয়ের {{estimate.width_common|n}} শতাংশের বেশি
  দূরের দর — উপরে হোক, নিচে হোক — বাতিল হবে। যে প্রতিষ্ঠান সরকারের ধারণার চেয়ে
  এক-পঞ্চমাংশ কমে কাজটি করতে পারে, সে তা বলে কাজ পেতে পারবে না: ওই সাশ্রয় তখন দর নয়,
  অযোগ্যতা। প্রাক্কলনটি {{counts.pdfs|n}}টি নথির একটিতেও নেই, তাই ওই বলয়ের কেন্দ্রটি
  দর দিতে আসা প্রত্যেকের কাছেই অদৃশ্য। {{estimate.band_awarded|n}}টিতে চুক্তি হয়েছে,
  মূল্য {{estimate.band_crore|cr}}।

# finding fact
h.en: A notice that will not take a price {{estimate.width_common|n}} per cent below
  the estimate has capped its own saving at {{estimate.width_common|n}} per cent
h.bn: প্রাক্কলনের {{estimate.width_common|n}} শতাংশ নিচের দর যে বিজ্ঞপ্তি নেবে না, সে
  নিজের সাশ্রয়ের সীমা {{estimate.width_common|n}} শতাংশেই বেঁধে ফেলেছে
en: This is the headline as arithmetic, not opinion. The cap is set before the first
  envelope is opened, by the office that will pay the bill, in its own printed
  notice; {{estimate.two_sided|n}} of the {{estimate.band_notices|n}} name both
  directions expressly. It is not a finding that any price was too high, but that no
  one outside the office can tell.
bn: এখানেই শিরোনামটি মতামত নয়, অঙ্ক। প্রথম খামটি খোলার আগেই সীমা বাঁধা হয়ে যায় — যে
  দপ্তর বিলটি দেবে তার হাতেই, তার নিজের ছাপা বিজ্ঞপ্তিতে;
  {{estimate.band_notices|n}}টির {{estimate.two_sided|n}}টিতেই দুই দিকের কথা স্পষ্ট
  করে লেখা। এটি এই সিদ্ধান্ত নয় যে কোনো দাম বেশি ছিল, বরং এই যে দপ্তরের বাইরের কেউ তা
  বলতে পারবে না।

// ------------------------------------------------------------- the silence
// The three zeros, then the two clauses that account for them. Both are quoted:
// the reasons clause and the award form’s own list of fields. The point is not
// that a form is badly designed — it is that the record’s silence is provided for.

# h2
en: {{field.lost|n}} rejections, and not one published reason
bn: {{field.lost|n}}টি দর বাতিল, প্রকাশিত কারণ একটিও নয়

# fig funnel

# p
en: {{field.submitted|n}} bids were submitted across the tenders that publish a
  count. {{field.lost|n}} of them lost. Reasons published:
  {{field.reasons_published|n}}. Losers named: {{field.losers_named|n}}. Losing
  prices published: {{field.losing_amounts_published|n}}. In
  {{field.mass_disqualified|n}} tenders most of the field was ruled out at once.
bn: যেসব দরপত্রে দরের সংখ্যা প্রকাশিত, সেগুলোতে জমা পড়েছিল {{field.submitted|n}}টি দর।
  এর {{field.lost|n}}টি হেরে যায়। প্রকাশিত কারণ: {{field.reasons_published|n}}টি।
  পরাজিতদের নাম প্রকাশিত: {{field.losers_named|n}}টি। পরাজিত দর প্রকাশিত:
  {{field.losing_amounts_published|n}}টি। {{field.mass_disqualified|n}}টি দরপত্রে
  প্রতিযোগীদের বড় অংশ একবারেই বাদ পড়েছে।

# p
en: That silence is provided for, not accidental. The standard document says a
  rejected tenderer may have the reason on written request — and that the office “is
  not required to justify those reason(s).” The award form it must publish has fields
  for documents sold, tenders received, tenders found responsive, who won and at what
  price. It has no field for anyone who lost. Nothing was withheld here. The public
  record was never asked for it.
bn: এই নীরবতা দুর্ঘটনা নয়, এর ব্যবস্থাই করা আছে। আদর্শ দস্তাবেজ বলে, বাতিল হওয়া দরদাতা
  লিখিত আবেদনে কারণটি জানতে পারবেন — আর দপ্তর “ওই কারণগুলোর সাফাই দিতে বাধ্য নয়।” যে
  চুক্তি-বিজ্ঞপ্তি তাকে প্রকাশ করতে হয়, তাতে ঘর আছে কতটি নথি বিক্রি হয়েছে, কতটি দর
  এসেছে, কতটি গ্রহণযোগ্য হয়েছে, কে জিতেছে আর কত দামে। যারা হেরেছে তাদের জন্য কোনো ঘরই
  নেই। এখানে কিছু লুকানো হয়নি। ওই নথিতে কখনো তা চাওয়াই হয়নি।

// -------------------------------------------------------- where the money sits
// The map, then the one number that carries the argument, then the complication
// that cuts against it. The counter-signal is published here rather than in the
// method note because a reader who never opens the method should still meet it.

# h2
en: Where the field is thinnest, the money is thickest
bn: প্রতিযোগিতা যেখানে সবচেয়ে কম, টাকা সেখানেই সবচেয়ে বেশি

# fig authorityMap

# p
en: {{money.thin_field_n|n}} tenders in this set drew two bidders or fewer. Those
  {{money.thin_field_n|n}} carry {{money.thin_field_crore|cr}} between them —
  {{money.thin_field_share|pct}} of every taka here. {{field.single_responsive|n}}
  tenders ended with exactly one responsive bidder, whoever else had turned up.
bn: এই সম্ভারের {{money.thin_field_n|n}}টি দরপত্রে দরদাতা ছিল দুই বা তার কম। ওই
  {{money.thin_field_n|n}}টিতেই আছে {{money.thin_field_crore|cr}} —
  এখানকার প্রতিটি টাকার {{money.thin_field_share|pct}}। {{field.single_responsive|n}}টি
  দরপত্র শেষ হয়েছে ঠিক একজন গ্রহণযোগ্য দরদাতা দিয়ে, আর যারাই এসে থাকুক।

# p
en: One complication belongs here, not in a footnote, because it cuts against the
  argument. Among tenders that publish their conditions, the more demanding notices
  drew slightly more bidders, not fewer ({{correlation.level_vs_bids_276.r|r}} across
  {{correlation.level_vs_bids_276.n|n}}) — bigger jobs both ask more and attract
  more. High bars and thin fields are two findings here; the record cannot join them
  into one.
bn: একটি জটিলতা পাদটীকায় নয়, এখানেই থাকা উচিত — কারণ তা যুক্তিটির বিপক্ষে যায়। যেসব
  দরপত্রে শর্ত প্রকাশিত, তার মধ্যে বেশি কঠিন বিজ্ঞপ্তিগুলোতে দরদাতা এসেছে কিছু বেশি, কম
  নয় ({{correlation.level_vs_bids_276.n|n}}টিতে
  {{correlation.level_vs_bids_276.r|r}}) — বড় কাজ একইসঙ্গে বেশি চায় এবং বেশি টানে।
  উঁচু মাপকাঠি আর পাতলা প্রতিযোগিতা এখানে দুটি আলাদা ফলাফল; নথি দুটিকে একটিতে জোড়া দিতে
  পারে না।

# exhibits

// ---------------------------------------------------------------- the close
// Four named, obtainable documents, and the limit of what this set can support.
// The last sentence is the thesis restated as mechanism, with no accusation in it.

# h2
en: What would settle it
bn: যা দিয়ে বিষয়টি মিটে যেত

# p
en: Four documents would answer what these cannot: the official cost estimate for
  any one of the {{counts.awards|n}} contracts; the recorded reason each of the
  {{field.lost|n}} rejected bids was ruled non-responsive; the names of the companies
  that lost and what they offered; and the owners behind the winning firms, left
  blank on {{ownership.not_disclosed|n}} award notices here. All four exist in a file
  somewhere. None is published.
bn: চারটি নথি এগুলো যা পারে না তার উত্তর দিত: {{counts.awards|n}}টি চুক্তির যেকোনো
  একটির সরকারি প্রাক্কলিত ব্যয়; {{field.lost|n}}টি বাতিল দরের প্রতিটিকে কেন অগ্রহণযোগ্য
  বলা হলো তার লিখিত কারণ; যারা হেরেছে তাদের নাম আর তাদের দর; এবং বিজয়ী প্রতিষ্ঠানগুলোর
  পেছনের মালিকদের পরিচয় — এখানকার {{ownership.not_disclosed|n}}টি বিজ্ঞপ্তিতে ঘরটি
  ফাঁকা। চারটিই কোনো না কোনো ফাইলে আছে। একটিও প্রকাশিত নয়।

# p
en: Until then this is what the government’s own record shows: the office that spends
  the money may set the height of the bar, put a floor under the price, and need
  never say who it ruled out or why. Everything here is a red flag warranting
  scrutiny, not a finding of wrongdoing. The tests, their limits and the arguments
  against them are in the sections below.
bn: ততদিন সরকারের নিজের নথিই যা দেখায়, সেটি এই: যে দপ্তর টাকাটা খরচ করে, সে-ই মাপকাঠির
  উচ্চতা ঠিক করতে পারে, দামের নিচে মেঝে বসাতে পারে, আর কাকে কেন বাদ দিল তা কখনো না
  বললেও চলে। এখানকার সবকিছুই খতিয়ে দেখার মতো লাল পতাকা, অপরাধ প্রমাণিত হওয়া নয়।
  পরীক্ষাগুলো, তাদের সীমা আর তাদের বিপক্ষের যুক্তি আছে নিচের অংশগুলোতে।

# doors

