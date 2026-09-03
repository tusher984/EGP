# Competition, eligibility and award patterns in six Bangladeshi development authorities

**A forensic reading of 1,805 e-GP documents (RAJUK, CDA, CoxDA, KDA, RDA, GDA)**
Prepared 2 September 2026. Source: every PDF in `~/Documents/GitHub/EGP-CDA`, read directly — not from any derived register.

---

## 1. The question, and the honest answer

The question put to this corpus was whether the procurement system used eligibility requirements, technical specifications, qualification rules, evaluation criteria or bidder rejection to suppress genuine competition and steer contracts toward already-preferred firms.

The theory to be tested was a chain: *restrictive requirement → fewer eligible bidders → fewer bids submitted → more bidders rejected → one responsive bidder → the preferred firm wins with no real contest.*

**The first link of that chain is not supported by this corpus. It is contradicted by it.** Tenders whose published qualification criteria are the most restrictive attracted *more* bids, not fewer, and ended with a single responsive bidder *less* often. Median bids received, by the restriction level scored from the notice text:

| Published restriction level | Tenders with a bid count | Median bids | Mean bids | Ended with 1 responsive bidder |
|---|---|---|---|---|
| NONE_IDENTIFIED | 27 | 2.0 | 2.44 | 16 (59.3%) |
| POSSIBLE | 56 | 2.0 | 2.91 | 25 (44.6%) |
| MODERATE | 124 | 2.0 | 3.21 | 57 (46.0%) |
| **STRONG** | **69** | **5.0** | **6.06** | **18 (26.1%)** |
| Criteria not published in the notice | 315 | 5.0 | 5.41 | 85 (27.0%) |

The relationship runs the wrong way for the theory, and it survives the obvious confound checks. Across the same 591 tenders that have a published bid count, restriction is very slightly *negatively* correlated with contract size (r = −0.153 against log contract value; r = −0.216 if the analysis is narrowed to the 276 tenders that actually published criteria) while bid counts are slightly *positively* correlated with it (r = +0.130), so "big contracts are both stricter and more attractive" does not explain it. Stratifying by authority and contract-value band did not rescue the theory either: in the only two strata with at least five tenders on both sides — RAJUK below 50 lakh, and RAJUK between 50 lakh and 2 crore — restriction again went with more bids.

The most defensible reading is that a procuring entity that writes out a long qualification list is describing a substantial, real package that many firms want, whereas the thinnest fields appear on small, unglamorous work where the criteria section says nothing at all. Restrictive text is therefore a poor predictor of a thin field in this dataset, and any sentence of the form *"restrictive eligibility criteria reduced the number of bidders"* would be unsupported here.

**What does hold is the second half of the chain.** The field does not collapse at entry. It collapses at evaluation.

Across the 591 tenders where the award notice prints bid counts, **997 submitted bids were ruled non-responsive** in 335 tenders. **201 of those 591 tenders (34.0%) ended with exactly one responsive bidder.** In 31 of them the entity received four or more bids and still finished with one — a combined ৳200.7 crore. One hundred and twenty tenders lost more than half their field at evaluation, and 87 of those meet the stricter mass-disqualification test used in the CSV: at least three bids rejected and 60% or more of the field eliminated.

That is the mechanism worth reporting: not a gate at the door, but a filter in the room.

---

## 2. Where the money actually went

Of ৳3,723.7 crore awarded across 645 contracts, **48.8% passed through tenders that drew two bidders or fewer**:

| Competition level (bids received) | Tenders | Value | Share of awarded value |
|---|---|---|---|
| SINGLE_BID (1) | 87 | ৳284.5 cr | 7.6% |
| VERY_LOW (2) | 134 | ৳1,531.9 cr | 41.1% |
| LOW (3) | 91 | ৳466.5 cr | 12.5% |
| MODERATE (4–5) | 100 | ৳634.0 cr | 17.0% |
| HIGH (6+) | 179 | ৳766.7 cr | 20.6% |
| UNKNOWN (notice prints no count) | 54 | ৳40.2 cr | 1.1% |

The single largest contract in the corpus — CDA tender 775105, ৳881.2 crore to Spectra Engineers Ltd. — drew two bidders. RDA tender 112012, ৳89.9 crore to Abdul Monem Ltd, drew one. Every tender in this corpus was advertised as national competitive tendering; there is not a single international tender in 1,155 notices.

---

## 3. The transparency finding, which is the most robust result here

**599 of 1,155 notices (51.9%) publish no qualification thresholds at all.** They say only "As per TDS" — as per the Tender Data Sheet, a document inside the paid tender package that is not published on the portal. A prospective bidder reading the public notice cannot learn what experience, turnover or liquidity will be demanded of them.

| Authority | Notices | Awarded | Awarded value | Criteria actually published | Ended with 1 responsive bidder |
|---|---|---|---|---|---|
| RAJUK | 700 | 369 | ৳1,271.9 cr | 280 (40.0%) | 79/349 (22.6%) |
| CDA | 180 | 98 | ৳1,332.2 cr | 179 (99.4%) | 49/96 (51.0%) |
| CoxDA | 141 | 104 | ৳314.8 cr | 23 (16.3%) | 46/81 (56.8%) |
| KDA | 64 | 37 | ৳589.3 cr | 54 (84.4%) | 10/37 (27.0%) |
| RDA | 50 | 29 | ৳214.5 cr | 0 (0.0%) | 17/28 (60.7%) |
| GDA | 20 | 8 | ৳1.0 cr | 20 (100.0%) | no bid counts published |

RDA publishes qualification criteria in none of its 50 notices and has the highest single-responsive rate in the corpus at 60.7%. CoxDA publishes in 16.3% and runs at 56.8%. That pairing is the sharpest agency-level pattern in the data.

One caution against over-reading it. Corpus-wide, publishing criteria goes *with* single-responsive outcomes (42.0% of the 276 tenders where criteria were published, against 27.0% of the 315 where they were not — "not published" here means "As per TDS", portal refusal or a blank criteria field, i.e. anything a bidder could not read from the notice). Inside RAJUK the same direction holds strongly (37.1% of 132 versus 13.8% of 217, a 2.7× gap). But it is flat inside CoxDA (58.8% versus 56.2%) and mildly reversed inside KDA on small numbers. So this is a real association within RAJUK and a real cross-agency contrast, not a general law of the system. Report it as such.

---

## 4. Four documents that carry the story

Every quotation below was read off the page of the source PDF and is reproduced with the original's own spelling and punctuation.

**(a) An authority describing, in its own words, adjusting the criteria to control who bids.**
`Tender Notice_PDFs/RAJUK_Tender_199942.pdf`, page 2. The tender is "Supply and Installation of Furniture for PIU Office", published 22 May 2018, awarded at **৳92.65 lakh**. It was amended twice, and both corrigenda say in plain words that the qualification criteria were changed. Corrigendum No. 2:

> \# Specifications are made more focused according the actual need of the procuring entity
> \# Adjustment is brought in the qualification criteria to ensure presence of appropriate tenderer

Corrigendum No. 1, on the same page:

> \- Qualification criteria amended in order to ensure the right product to be obtained
> \- Specification features are amended order to ensure the product durable
> \- Focused guidance has been provided to prepare the effective tender

This is the strongest wording in 1,805 documents: the procuring entity's own stated purpose for amending its qualification criteria was to ensure the presence of the *appropriate* tenderer.

What makes it more than a form of words is that the same page prints the old and new values, so the adjustment itself is visible. The contract-document list was changed from "p) ISO certificate" to **"p) ISO certificate and FSC certificate"** — a second certification added at corrigendum stage. The unchanged items in that list already required "j) Manufacturer's authorization for all item", "n) Manufacturer's production capacity cerificate" and "o) Manufacturer's warranty certificate" (spelling as printed).

The outcome: three documents sold, **two bids received, one responsive**, and the contract went to a furniture manufacturer, Hatil Complex Ltd.

Two disciplines apply. This does **not** prove that a specific firm was chosen in advance, and it must not be reported as if it does — a manufacturer-authorisation requirement on a furniture supply contract has an ordinary procurement rationale, and the winner is one of the largest furniture manufacturers in the country, so its winning is not itself anomalous. What the document does establish is that criteria were consciously adjusted with the composition of the bidding field in mind, and that the adjustment added a certification barrier. Note also that this tender scores `NONE_IDENTIFIED` on published restriction level, because the barriers sit in the contract-document list and the corrigendum rather than in the notice's eligibility field — a reminder that the restriction score reads only what the criteria section says, and therefore understates cases like this one.

**(b) A tenfold cut in the entry deposit, with the qualification bar untouched.**
`Tender Notice_PDFs/CDA_Tender_644083.pdf`, page 2, Corrigendum No. 1: "Tender/Proposal Security — BDT 830000 — BDT 83000". The eligibility list was not amended. Its clause 7, unchanged, reads:

> 7. If Quated Rate is found more thane 10% above or below Estimated cost, Tender will be Non-Responsive

That clause requires bidders to price within ±10% of a figure — the official cost estimate — that appears nowhere in any of the 1,805 documents. **Seventy-eight notices carry a price-band rejection clause of this kind.** Anyone with advance knowledge of the estimate can price safely inside the band; anyone without it is guessing, and a wrong guess is disqualification rather than a losing bid. This is the single most concrete competition-restricting device found in the corpus, and it operates at the evaluation stage — exactly where the data says the field actually collapses.

**(c) A qualification stack far larger than the contract.**
`Tender Notice_PDFs/CDA_Tender_514221.pdf`, page 2. The corrigendum *added* eligibility items, among them ISO9001:2008 certification, "authorization for dealership/retailer ship of international brand", "at least 2 Satisfactory Completion Certificate ... from the government/semi government organization in the last two (02) years", and a "track record of honoring a single tender of min Taka 50 Lac ... in the last two (02) years". The contract was eventually awarded at **৳10.45 lakh** — the demanded past contract was 4.8 times the value of the work. **One bid was received.**

The two-year lookback deserves separate attention. A firm's qualifying experience must have been earned in the previous 24 months and, in this and 332 other notices, from a government or semi-government client. That combination excludes competent private-sector firms and any firm whose comparable public work is three years old. **267 tenders carry conditions of this incumbency-favouring kind.**

**(d) The requirement bar is boilerplate, not bespoke — which is why the tailoring theory fails and why small contracts are hit hardest.**
The same criteria blocks recur verbatim across tenders: one RAJUK electro-mechanical experience clause appears in 88 notices, a CDA rejection clause in 70, a "Reputed Supplier" opening in 40, an average-annual-turnover clause in 22. **508 tenders share at least one substantial clause with another tender**, and 372 share a clause used by ten or more.

Because those blocks are pasted in regardless of package size, the bar routinely exceeds the job. Where both figures can be read, **150 of 249 tenders (60.2%) demand financial capacity greater than the entire contract value** (median 1.11×, 52 above 2×, 5 above 5×), and 36 of 247 demand a single past contract worth more than the contract being awarded. CDA 387658 asked for a Tk 25 lakh past contract and Tk 50 lakh turnover for work worth ৳10.19 lakh; three firms bid and one survived evaluation.

This cuts both ways, and the honest version must include the counter-example: RAJUK 146449 demanded a Tk 30 crore past contract for a ৳4.85 crore job — 6.2× — and still drew four bidders, three of them responsive. Disproportionate bars are real and systematic; they are not reliably followed by thin fields.

---

## 5. The twenty strongest cases

Ranked by `investigative_priority_score` (the brief's weighting: 25 low competition, 25 restrictive or tailored eligibility, 15 rejection, 15 repeated winner, 10 price, 10 cross-tender pattern). **This is a prioritisation ranking for reporting effort. It is not a corruption probability and no row below is an allegation against any named firm.**

| # | Tender | Agency | Value | Bids | Resp. | Rejected | Restriction | Winner | Winner's total wins | Pattern | Score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 360423 | CDA | ৳35.6 lac | 4 | 1 | 3 | MODERATE | M/S. Gulzar Trading | 11 | STRONG LEAD | 70.5 |
| 2 | 294388 | RAJUK | ৳4.3 lac | 4 | 1 | 3 | MODERATE | T.S Enterprise | 12 | POSSIBLE | 69.8 |
| 3 | 888738 | RAJUK | ৳1.79 cr | 1 | 1 | 0 | MODERATE | Concept Elevators & Engineering Ltd. | 12 | STRONG LEAD | 67.5 |
| 4 | 637169 | RAJUK | ৳81.6 lac | 2 | 2 | 0 | MODERATE | Concept Elevators & Engineering Ltd. | 12 | POSSIBLE | 64.8 |
| 5 | 387658 | CDA | ৳10.2 lac | 3 | 1 | 2 | STRONG | M/S. Nice Enterprise | 5 | STRONG LEAD | 64.2 |
| 6 | 1146510 | RAJUK | ৳13.0 lac | 3 | 2 | 1 | STRONG | Aliza Enterprise | 14 | STRONG LEAD | 63.5 |
| 7 | 936248 | RAJUK | ৳3.13 cr | 2 | 1 | 1 | MODERATE | Concept Elevators & Engineering Ltd. | 12 | STRONG LEAD | 63.2 |
| 8 | 427246 | CDA | ৳8.4 lac | 2 | 1 | 1 | MODERATE | M/S. Gulzar Trading | 11 | STRONG LEAD | 62.5 |
| 9 | 517916 | RAJUK | ৳42.7 lac | 2 | 1 | 1 | MODERATE | M/S Sunny Construction | 11 | STRONG LEAD | 62.5 |
| 10 | 536842 | RAJUK | ৳5.2 lac | 2 | 1 | 1 | MODERATE | T.S Enterprise | 12 | STRONG LEAD | 62.5 |
| 11 | 523954 | CDA | ৳8.4 lac | 2 | 1 | 1 | MODERATE | M/S. Gulzar Trading | 11 | STRONG LEAD | 62.2 |
| 12 | 699109 | RAJUK | ৳1.75 cr | 4 | 2 | 2 | MODERATE | Concept Elevators & Engineering Ltd. | 12 | POSSIBLE | 61.8 |
| 13 | 125042 | RAJUK | ৳4.77 cr | 3 | 1 | 2 | STRONG | Daffodil Electric Company | 3 | STRONG LEAD | 61.5 |
| 14 | 536846 | RAJUK | ৳16.4 lac | 2 | 1 | 1 | MODERATE | M/S Sunny Construction | 11 | STRONG LEAD | 61.2 |
| 15 | 948446 | RAJUK | ৳29.0 lac | 2 | 1 | 1 | MODERATE | M/S Sunny Construction | 11 | STRONG LEAD | 61.2 |
| 16 | 309557 | CDA | ৳29.9 lac | 1 | 1 | 0 | STRONG | M/S. Gulzar Trading | 11 | STRONG LEAD | 61.0 |
| 17 | 1059690 | RAJUK | ৳7.0 lac | 6 | 1 | 5 | not published | T.S Enterprise | 12 | POSSIBLE | 61.0 |
| 18 | 1146506 | RAJUK | ৳30.0 lac | 2 | 1 | 1 | MODERATE | M/S Sunny Construction | 11 | STRONG LEAD | 60.8 |
| 19 | 1146511 | RAJUK | ৳11.2 lac | 2 | 1 | 1 | MODERATE | Aliza Enterprise | 14 | STRONG LEAD | 60.0 |
| 20 | 644083 | CDA | ৳23.8 lac | 2 | 2 | 0 | MODERATE | M/S. Gulzar Trading | 11 | POSSIBLE | 59.5 |

Rank 20 is one of a three-way tie at 59.5, with CDA 773275 (M/S. Nice Enterprise) and RAJUK 1146509 (Optimal Technology (Pvt.) Ltd.); 644083 is placed there because it is also the corrigendum exhibit in section 4. The other two belong in the same reading batch.

Why these twenty, in one line each:

**1. CDA 360423** — electrical sub-station and rest house renovation. Five documents sold, four bids received, one survived; the notice demands public-sector-only past experience, sets a financial bar at 141% of the eventual contract value, and carries the ±10% price band against an unpublished estimate. The winner holds eleven CDA contracts. Signed eleven days after notification of award.

**2. RAJUK 294388** — PABX system at a Gulshan apartment project. Open only to "Enlisted (Electrical) Contractor/Supplier of RAjuk & Other Govt./Semi GOvt./Autonomous Organization/Reputed Bonafied Firm" — an enlistment list whose membership is not published. Four bids, one responsive. Contract signed **116 days** after notification of award.

**3. RAJUK 888738** — two 800 kg passenger lifts at RAJUK Annex Building, ৳1.79 crore. Two documents sold, **one bid received**. Requirements are tied to manufacturer or authorised-agent status and a Tk 125 lakh comparable lift contract. Winner: Concept Elevators & Engineering Ltd., which holds twelve RAJUK contracts, nine of them decided in fields of two or fewer.

**4, 7, 12. RAJUK 637169, 936248, 699109** — three more lift and electro-mechanical packages, ৳81.6 lakh, ৳3.13 crore and ৳1.75 crore, all won by Concept Elevators, all carrying manufacturer-tied, sole-agent or licence-category conditions. Taken with 888738 this is the clearest single-supplier cluster in the corpus.

**5. CDA 387658** — water treatment plant at CDA Hill, ৳10.19 lakh. The criteria demand a Tk 25 lakh public-sector past contract and Tk 50 lakh turnover — 2.5× and 4.9× the contract. Three bids, one responsive. Contract signed **two days** after notification of award.

**6, 19. RAJUK 1146510 and 1146511** — brand-named goods with no "or equivalent" wording, restricted to RAJUK-enlisted firms; both won by Aliza Enterprise, which holds fourteen contracts.

**8, 11, 16, 20. CDA 427246, 523954, 309557, 644083** — four small CDA packages won by M/S. Gulzar Trading, which holds eleven CDA contracts, eight of them in fields of two or fewer. 309557 drew a single bid. All four carry the ±10% price-band clause; 644083 is the notice whose security was cut tenfold by corrigendum.

**9, 14, 15, 18. RAJUK 517916, 536846, 948446, 1146506** — four enlistment-restricted, licence-category-tied packages won by M/S Sunny Construction (eleven contracts, five in thin fields), every one of them a two-bid tender that ended with one responsive bidder.

**10. RAJUK 536842** and **17. RAJUK 1059690** — both won by T.S Enterprise (twelve contracts). 1059690 is the starkest rejection case in the top twenty: nine excavator tyres, ৳6.96 lakh, **six documents sold, six bids received, one responsive** — and the notice published no criteria at all, only "As per TDS".

**13. RAJUK 125042** — ৳4.77 crore electro-mechanical package with manufacturer-tied and licence-category conditions; three bids, one responsive; won by Daffodil Electric Company.

---

## 6. What the priority score under-ranks, and why an editor should look here too

The weighting the brief specifies rewards the co-occurrence of indicators, and small maintenance packages are where indicators co-occur most: they are numerous, they reuse the same criteria blocks, and the same handful of firms win them repeatedly. As a result the ranked twenty is dominated by contracts under ৳5 crore, and the largest contracts in the corpus fall outside it. They should not be dropped, because the money is here.

| Tender | Agency | Value | Bids | Resp. | Winner | Score |
|---|---|---|---|---|---|---|
| 775105 | CDA | ৳881.2 cr | 2 | 2 | Spectra Engineers Ltd. | 33.8 |
| 581310 | KDA | ৳143.5 cr | 2 | 1 | Ataur Rahman Khan Ltd & Mahabub Brothers (Pvt) Ltd JV | 31.0 |
| 783087 | KDA | ৳96.5 cr | 2 | 1 | Mahabub Brothers (Pvt) Ltd | 49.0 |
| 538256 | CDA | ৳96.0 cr | 4 | 1 | Spectra Engineers Ltd. | 59.0 |
| 448324 | CoxDA | ৳93.0 cr | 2 | 2 | National Development Engineers Ltd. | 36.8 |
| 112012 | RDA | ৳89.9 cr | **1** | 1 | Abdul Monem Ltd | 35.0 |
| 781266 | CDA | ৳79.2 cr | 3 | 1 | Spectra Engineers Ltd. | 51.8 |
| 223246 | CDA | ৳63.2 cr | 3 | 2 | M Jamal & Company Limited | 46.5 |

Three of these deserve a reporter's time on value alone. **CDA 775105**, the ৳881.2 crore award to Spectra Engineers Ltd., is 23.7% of everything awarded in this corpus and it was decided between two bidders. **RDA 112012**, ৳89.9 crore to Abdul Monem Ltd, is the largest single-bid award in the dataset, and RDA published no qualification criteria in 49 of its 50 notices — the fiftieth is a portal access refusal, so it cannot be read either way. **CDA 538256**, ৳96.0 crore, is the largest instance of the many-bids-to-one-responsive pattern: four bids, one survivor, Spectra again.

Thirty-one tenders worth ৳200.7 crore combined went from four or more bids to a single responsive bidder. The largest, after 538256, are RDA 98996 (৳35.7 crore, four bids, Shamim Enterprise (Pvt) Ltd), RAJUK 1134396 (৳14.7 crore, six bids, Sohel Engineering & Construction Ltd), RAJUK 89106 (৳12.6 crore, five bids, a Starlite–Convoy joint venture) and RAJUK 902293 (৳10.6 crore, five bids, a Rana Builders–Shafique and Sons joint venture). RAJUK 901824 drew **eleven** bids and finished with one responsive bidder.

---

## 7. Who wins, and how concentrated it is

Counting each named entity exactly as the award notice prints it, 645 contracts went to **304 distinct winners**, a Herfindahl–Hirschman index of 928 on value. That number is dominated by one firm: **Spectra Engineers Ltd., four contracts, ৳1,068.0 crore, 28.68% of all awarded value.**

Fifty-nine awards went to joint ventures, and for these the e-GP notice prints the partner firms and their declared business shares. Re-attributing each JV's value to its partners at the published shares — a more faithful measure of who actually receives the money — raises concentration to an HHI of 948 across 291 entities and changes the ranking below the top:

| Entity (JV shares attributed) | Contracts | Value | Share |
|---|---|---|---|
| Spectra Engineers Ltd | 4 | ৳1,068.0 cr | 28.68% |
| Mahabub Brothers (Pvt) Ltd | 4 | ৳190.0 cr | 5.10% |
| Niaz Traders | 10 | ৳131.8 cr | 3.54% |
| National Development Engineers Ltd | 5 | ৳125.2 cr | 3.36% |
| The United Construction Co | 4 | ৳103.9 cr | 2.79% |
| Dienco Ltd | 2 | ৳100.8 cr | 2.71% |
| Abdul Monem Ltd | 1 | ৳89.9 cr | 2.42% |

Mahabub Brothers is the clearest case of concentration hidden by consortium structure: ৳119.7 crore in its own name plus 49% of a ৳143.5 crore KDA joint venture, taking it to ৳190.0 crore and second place. Twelve joint ventures printed all partner shares as "0.000%", so their value could not be split and remains attributed to the consortium; the true partner-level figures are therefore floors, not ceilings.

By frequency rather than value, here is every firm with nine or more contracts, in order of contract count. The column that matters is the last one:

| Winner | Contracts | Value | Won with ≤2 bidders |
|---|---|---|---|
| A R Enterprise | 15 | ৳19.2 cr | 1 |
| Sany Construction | 15 | ৳6.3 cr | 0 |
| Aliza Enterprise | 14 | ৳4.3 cr | 4 |
| Nahar Construction | 14 | ৳1.1 cr | **10** |
| **Concept Elevators & Engineering Ltd** | **12** | **৳16.5 cr** | **9** |
| T S Enterprise | 12 | ৳2.6 cr | 2 |
| Molla Brothers | 12 | ৳0.9 cr | 0 |
| Sunny Construction | 11 | ৳9.4 cr | 5 |
| Gulzar Trading | 11 | ৳2.5 cr | **8** |
| Momotaj Engineers Ltd | 10 | ৳85.4 cr | 1 |
| Maliha Enterprise | 9 | ৳6.2 cr | 2 |
| Tanin Enterprise | 9 | ৳2.2 cr | **6** |

The comparison inside this table is the finding. Sany Construction and Molla Brothers won fifteen and twelve contracts respectively without a single thin-field award between them; Momotaj Engineers took ten contracts worth ৳85.4 crore with one. Nahar Construction, Concept Elevators, Gulzar Trading and Tanin Enterprise won a similar number of contracts with most of the field absent. Frequent winning on its own is not a red flag in this data — frequent winning in fields of one or two is what separates these four.

Concept Elevators and Gulzar Trading are the two names an editor should assign first: three-quarters of their wins were decided in fields of one or two, and in Concept Elevators' case the accompanying notices repeatedly carry manufacturer-tied and sole-agent conditions on lift and escalator packages. **253 tenders carry a repeated-winner pattern flag, 23 of them for firms winning across more than one of the six authorities.**

One limitation must travel with every one of these counts. Names were aggregated conservatively: legal-form words were deliberately *not* stripped, because "M R Construction" and "M R Enterprise" may be different companies and merging them would inflate a publishable figure. The consequence is that genuine variants of the same firm may still be counted separately, so these totals are lower bounds. The `winner_possible_name_variants` column lists the candidate pairs for manual checking.

---

## 8. The reporting questions, answered from the data

**How competitive was the procurement overall?** Thin, and thinnest where the money is largest in relative terms. Of 591 tenders with published bid counts, 87 drew one bid and 134 drew two — 37.4% of the measurable field at two or fewer, carrying 48.8% of all awarded value (৳1,816.4 crore of ৳3,723.7 crore). Median bids received is 3, mean 4.65. Only 179 tenders drew six or more.

**Were eligibility requirements used to restrict competition?** Requirements are frequently disproportionate to the work — 60.2% of measurable tenders demand financial capacity exceeding the contract value — and they are frequently incumbency-favouring: 333 notices require government or semi-government past clients, 267 carry conditions of an incumbent-advantage kind, 88 restrict bidding to the authority's own enlistment list, 79 require sole-agency or dealership status, 56 name a brand with no "or equivalent" alternative. But the corpus does **not** support the claim that these requirements reduced the number of bidders: the most restrictive notices drew the most bids. The requirements are best described as templated barriers of general effect, not as instruments tailored tender by tender.

**Did rejection do the work instead?** Yes, and this is the finding to lead with. 997 bids were ruled non-responsive across 335 tenders. 201 tenders (34.0%) ended with exactly one responsive bidder. One hundred and twenty tenders lost more than half their field, 87 of them under the stricter mass-disqualification test (≥3 bids rejected and ≥60% of the field gone). Thirty-one went from four or more bids to one. **In not a single case does any document in this corpus state why any bid was rejected.**

**Who won repeatedly?** 253 tenders show a repeated-winner pattern. Spectra Engineers Ltd. holds 28.68% of all awarded value across four contracts. Concept Elevators & Engineering Ltd (12 contracts, 9 in fields of ≤2) and Gulzar Trading (11 contracts, 8 in fields of ≤2) are the strongest count-based clusters. Twenty-three tenders were won by firms operating across more than one authority.

**Is there evidence of pre-selection?** There is evidence consistent with it in 67 tenders, which meet five or more of the seven staged conditions and are labelled `STRONG_INVESTIGATIVE_LEAD`; 215 more meet three or four and are labelled `POSSIBLE`. **No tender in this corpus is labelled as proven pre-selection, because nothing in these documents proves it.** The decisive records — the tender evaluation committee report, the bidders' names and prices, the reasons for rejection, and the official cost estimate — are not published anywhere in the corpus. What the documents establish is opportunity and pattern; intent would require the evaluation file.

**Was the process itself run to time?** Measured against the signing window in PPR 2025 Rule 123(9) as read with ITT 67.2 — 14 days up to BDT 50m, 21 days from 50m to 250m, 28 days above 250m — **383 of 645 contracts (59.4%) were signed after the applicable window closed** (339 past the 14-day ceiling, 44 past the 21-day ceiling). Two caveats are load-bearing. First, the sliding scale is from the 2025 rules while these contracts run 2019–2025, so for older awards the then-current window must be confirmed before publication; this is a lead requiring rule verification, not a violation count. Second, the same measurement produced RAJUK 294388 at 116 days and CDA 387658 at two days, and neither extreme can be interpreted without the file.

**What about price?** No estimate, no losing bid and no bid opening sheet appears in any document, so the standard price tests cannot be run at all. What could be built is a proxy: the tender security is tightly clustered at a median of 2.84% of the eventual contract value across 554 single-lot tenders (10th percentile 2.55%, 90th 3.50%, and 97.7% of cases between 0.5% and 5%), so a contract that settles far from its own security-implied level is anomalous relative to its peers. On that measure 72 contracts came in low and 38 high. The index is published as `contract_value_vs_security_norm_index`. A taka-denominated implied estimate was deliberately **not** published, because securities are rounded to the nearest thousand in 973 of 1,017 cases (95.7%) and no Bangladeshi document in the corpus states the statutory percentage.

---

## 9. What these documents cannot show

This is the section to read before writing any sentence about any named firm.

The e-GP contract award notice publishes the winner's name, the contract value, the number of tenders sold, the number received and the number found responsive. It publishes nothing else about the contest. Across all 645 award notices in this corpus there is:

- **no name of any bidder other than the winner**, so no bidding pattern, no repeat-loser analysis and no relationship mapping between competitors is possible;
- **no individual bid amount**, so lowest bid, highest bid, average bid, spread and winning-margin analysis are impossible — these columns are populated with `NOT_AVAILABLE_INDIVIDUAL_BIDS_NEVER_PUBLISHED` rather than estimated;
- **no reason for any rejection**, so the 997 non-responsive bids are a count with no explanation attached anywhere;
- **no official cost estimate in any of the 1,805 documents**, so `estimated_tender_value` is `NOT_PUBLISHED_IN_ANY_DOCUMENT_IN_CORPUS` in every row.

Beneficial ownership is disclosed on only 60 of 645 award notices, despite the standard tender document's own clause 68.1 requiring publication of contract details "together with details of the beneficial ownership of the successful Tenderer". Where it is absent the field reads `BLANK_ON_NOTICE_DESPITE_ITT_68.1`.

Three distinct kinds of absence are kept separate throughout, and should never be merged in reporting. **510 tenders have no award notice at all.** Grouping their status strings, 186 have no status recorded, 111 are re-tendered or to be re-tendered, 49 are being processed, 46 rejected, 26 cancelled, 7 live — and **59 are marked "Contract Awarded" with no award notice published** (57 with that status exactly, 2 with a reference number concatenated onto it). Separately, **54 award notices use the economic-operator template that prints no bid counts at all**. And **5 notices are portal refusals** — the PDF contains only "This tender is not exists or You are un-authorized", so only the tender ID from the filename is known, flagged as `FILENAME_ONLY_PORTAL_REFUSED_ACCESS`.

Those 59 awarded-but-unpublished contracts are themselves a reportable finding, since the standard document's clause 61.1 requires award details including tenders received and responsive to be published within 24 hours and kept up for at least 28 days.

No tender in this corpus was advertised internationally. That is worth noting because the World Bank guidance thresholds for early market engagement and rated criteria, and its preference for open international competition on higher-risk contracts, trigger only on international competitive procurement — so running everything as national tendering keeps those provisions permanently out of reach.

---

## 10. Rule citations: what can and cannot be quoted

The corpus contains five reference documents, and four of the five are weaker than their filenames suggest. Before any clause reaches print:

The Bangladeshi standard tender document in the folder is BPPA's **Standard Tender Document (National) for Goods using Framework Agreement**, dated December 2025 and marked on its cover "Preliminary working Draft". Its clause numbering can be quoted, but these contracts run 2019–2025 under the earlier regime, so every citation to it carries anachronism risk and should be attributed as the current draft standard rather than as the rule that governed the tender in question.

Clauses in it that are verbatim-verified and directly relevant: **56.2(b)**, permitting rejection where "there is evidence of lack of effective competition; such as non-participation by a number of potential Tenderers" — set that against 87 single-bid awards; **4.2(c)**, defining collusive practice as an arrangement "designed to arbitrarily reduce the number of Tenders submitted or fix Tender prices at artificial, non-competitive levels"; **56.2(a)**, rejection where the lowest price exceeds the official cost estimate; **61.1**, publication of award details within 24 hours for at least 28 days; **63.2**, performance security within 14 days; **5.13**, disqualification for common control or conflict of interest; **5.14** and **68.1**, beneficial ownership disclosure and publication, with Format e-PG3A-C Note 1 setting the floor at BDT 10 lakh.

Three traps to avoid. The 28-day signing figure is **not** in ITT 67.2; 67.2 defers to the Tender Data Sheet, which cites PPR 2025 Rule 123(9) and the 14/21/28-day sliding scale — always cite it as "ITT 67.2 read with PPR 2025 Rule 123(9)". The same deferral applies to retention and performance security percentages and to the liquid-assets requirement, all of which live in the TDS rather than in the ITT clause; write "ITT X read with the TDS entry for ITT X". And the TDS note that liquid assets should be 80–100% of the estimated cost **cannot be tested at all here**, because the estimate is blank in every record — the estimate blackout disables that check too.

The three remaining reference PDFs do not carry what their names imply. The JICA document is Chapter 2 of the Guidelines for Procurement under Japanese ODA Loans; exactly one tender in this corpus is JICA-funded, so it is a benchmark for good practice, never a rule that was breached. Its clause 4.07 on brand names is nonetheless a useful yardstick against the 56 notices naming a brand with no equivalent permitted. The World Bank file is a three-page revision note that *summarises* rather than reproduces its operative paragraphs, so those must be cited as summarised in the Bank's own revision note, status summary-only. The ADB file is a two-page printout of a web landing page containing no clause text; **no ADB provision is citable from this corpus**, and the page itself notes the 2017 Regulations were replaced in January 2026.

Three documents still need to be obtained before publication: the full text of PPR 2025, the World Bank Procurement Regulations 6th edition, and the ADB Procurement Directive (2026).

---

## 11. Method, and what the scoring does and does not mean

Every one of the 1,805 PDFs in the folder was read, none was skipped and none was sampled. Text came from the embedded text layer via `pdftotext -layout`; character offsets were mapped back to page numbers so that every extracted value can be cited to a page. Not one file required OCR, because every file in this corpus is a portal-generated print rather than a scan — `ocr_used` is "no" in all 1,155 rows, and that is a finding about the corpus, not a shortcut. Five notices are portal refusals reading "not exists or You are un-authorized"; they are carried as rows with `notice_access_denied` set and their tender ID taken from the filename, flagged `FILENAME_ONLY_PORTAL_REFUSED_ACCESS`, rather than dropped.

Numeric thresholds were read with a window method: locate the keyword, then read the amount inside a bounded character window around it. This replaced sentence-splitting, which failed on these documents because the portal prints criteria as run-on fragments with no reliable full stops. A guard stops an experience window before it can run into a following financial clause, so a turnover figure is never misread as a past-contract value. Bangladeshi money words are normalised including the portal's own misspellings — Lac, Lacs, Lakh, Lakhs, Lack at 10⁵; Crore, Core, Corer, Coror, Koti at 10⁷.

Repeated-rule detection works on clause fingerprints: each clause unit of 45 characters or more is digit-normalised and hashed, so two notices demanding different amounts under identical wording still match as the same rule. That is what exposed the boilerplate finding in section 4.

Company names are matched with a deliberately conservative key that does **not** strip legal-form words. An earlier, more aggressive key merged four of five sampled name pairs that turned out to be different firms, so concentration figures here are floors: real concentration is at least this high and probably higher. Joint ventures are decomposed into their declared partner shares, and a share printed as `0.000%` is carried as not-published rather than as a zero stake — 12 JVs print all shares that way, so their partner-level figures are floors too.

On scoring, the priority score uses exactly the weights specified: 25 for low competition, 25 for restrictive or tailored eligibility, 15 for rejection, 15 for repeated winner, 10 for price, 10 for cross-tender pattern. The bands are the ones specified: 80–100 CRITICAL, 60–79 HIGH, 40–59 MEDIUM, 0–39 LOW.

**No tender reaches CRITICAL.** The maximum score in the corpus is 70.5, the mean 22.0, the median 19.0, producing 0 CRITICAL, 19 HIGH, 184 MEDIUM and 952 LOW. This is worth stating plainly rather than hiding, and the reason is structural: the two largest components are close to mutually exclusive by construction. A tender that drew a single bid scores the full competition weight but cannot also score the rejection weight, because there was nobody to reject; a tender that rejected eleven of twelve bidders scores on rejection but not on thin entry. Reaching 80 would require a tender that simultaneously drew almost nobody and eliminated almost everybody, and no such tender exists. I have **not** rescaled the bands to manufacture CRITICAL cases. The score is a reading order for an editor, not a corruption probability, and the empty band should be read as evidence that this corpus contains no single document that indicts itself on every axis at once — not as evidence that nothing here is worth reporting.

Three columns are hard-set to constants because the underlying number does not exist anywhere in the corpus: `estimated_tender_value` is `NOT_PUBLISHED_IN_ANY_DOCUMENT_IN_CORPUS` in all 1,155 rows, and `lowest_bid`, `highest_bid` and `average_bid` are `NOT_AVAILABLE_INDIVIDUAL_BIDS_NEVER_PUBLISHED`. Price flags therefore compare each contract against the corpus-wide tender-security-to-value norm rather than against an estimate: 72 tenders sit low against that norm, 38 high, 444 unflagged and 601 untestable. `potential_beneficiary` is `WITHHELD_BY_METHOD` in every row, because the brief forbids naming a firm merely because it could theoretically have benefited, and nothing in these documents identifies an intended beneficiary in advance.

Evidence discipline is enforced column by column. `documented_fact` and `investigative_hypothesis` are separate fields and never mixed: 99.0% of rows carry a documented fact, 100% carry an explicitly labelled hypothesis. `evidence_source_files` is populated in 100% of rows, `evidence_page_numbers` in 99.7%, a verbatim eligibility excerpt in 99.6%, a competition excerpt in 51.2% — which is exactly the 591 tenders that have award notices with bid counts. Extraction confidence is HIGH on 759 rows, `HIGH_FOR_ABSENCE_NO_TEXT_TO_PARSE` on 383 (the TDS-only notices, where the absence itself is what is being recorded reliably), and `MEDIUM_FLAGS_ONLY_NO_NUMERIC_THRESHOLD_FOUND` on 13. Eighty-two columns use `NOT_AVAILABLE` where the document is silent. Nothing was inferred to fill a blank.

---

## 12. Quality-assurance log

Corpus accounting closes exactly. 1,805 PDFs = 1,155 tender notices + 645 award notices + 5 reference documents, with no file unclassified and none read twice. The 645 awards join to notices one-to-one, with zero orphan awards and zero duplicate tender IDs across the 1,155 master rows.

All five CSVs re-parse under Python's strict CSV reader with zero malformed rows: `master_tender_investigation.csv` at 1,155 data rows × 179 columns with every row carrying exactly 179 fields, `rule_deviations.csv` at 5,525 rows × 38 columns, `rules_broken_line_by_line.csv` at 1,583 rows × 38 columns, `bidder_detail.csv` at 1,189 rows × 20 columns, and `data_dictionary.csv` at 275 rows × 9. The master gained its rule-aggregate columns when the catalogue was applied and one further column, `portal_self_certified_signed_in_due_time`, when the award notices' own compliance field was read; every tender ID in the deviations file exists in the master, and no tender ID is duplicated in either. All five are UTF-8 with byte-order mark — verified byte-level — and fully quoted, so they open cleanly in Excel, Google Sheets and LibreOffice without a locale-dependent import step. Unavailable values are empty cells throughout; `data_dictionary.csv` carries one row per column per file explaining what an empty cell means there, and a sweep for leftover placeholder strings across all five files returns zero hits outside the columns where a negative verdict is itself the finding. The bidder file breaks down as 645 `AWARDED_BIDDER` rows, 335 `UNNAMED_REJECTED_BIDDERS_AGGREGATE` rows, 134 `JV_PARTNER_OF_WINNER` rows and 75 `DISCLOSED_BENEFICIAL_OWNER_OF_WINNER` rows; losing bidders appear as aggregates rather than names because the portal never prints their names, and inventing rows for them would have been fabrication.

Bengali handling was checked and the honest result is that **this corpus contains no Bengali script at all** — a regex sweep for the Bengali Unicode block returns zero hits in either CSV. The e-GP portal renders these notices entirely in English, including the Bangla-origin money words, which appear transliterated as "Lac" and "Crore". The UTF-8-with-BOM encoding is retained anyway so that any Bengali added later survives.

Headline figures were recomputed from the finished CSV rather than carried forward from intermediate scripts. Total awarded value re-derives to ৳3,723.7 crore over 645 contracts. Tenders with two bidders or fewer re-derive to 221 contracts and ৳1,816.4 crore, 48.78% of value — I had earlier written 48.7% by adding two separately rounded component percentages, and corrected it to 48.8%. Single-responsive tenders re-derive to 201 of 591, 34.0%. Non-responsive bids re-derive to 997. The disconfirmation medians were recomputed by restriction level and reproduce: 2.0, 2.0, 2.0 against STRONG at 5.0.

Two further corrections were made during verification and are recorded here because both had already reached draft text. "Median bids received across the corpus is 4" was wrong and became "median 3, mean 4.65". The breakdown of the 510 tenders with no award notice was rewritten after the raw status counter showed many concatenated status strings, resolving to 186 with no status, 111 re-tendered or awaiting re-tender, 49 in process, 46 rejected, 26 cancelled, 7 live and 59 recorded as "Contract Awarded" — 57 exact matches plus 2 concatenated, which reconciles with the 59 found independently in earlier work. A third slip was caught before it reached any output: a supplier total of 546,286,288 BDT read momentarily as ৳546 crore when it is ৳54.6 crore. A fourth was caught in this pass: draft text said "87 tenders lost more than half their field", but 87 is the count of the stricter `mass_disqualification_flag` (≥3 bids rejected **and** ≥60% of the field eliminated); the number that literally lost more than half is 120. Both figures now appear with their definitions attached.

One genuine data-integrity bug was found and fixed rather than worked around. In 59 rows the winner field had absorbed the entire joint-venture partner share table, producing normalised keys such as `ATAUR RAHMAN KHAN LTD MAHABUB BROTHERS LTD JV LTD 49 000 ATAUR RAHMAN KHAN LTD 51 000`. Separating the consortium title from its partner table fixed it; a post-fix sweep confirms zero rows still carry `JVCA` or `Business Share` inside `winner_name`. This mattered beyond tidiness: before the fix, JV partners were invisible to concentration analysis, and fixing it moved Mahabub Brothers from ৳119.7 crore to ৳190.0 crore and second place.

Four probe scripts returned nonsense during QA and each was a fault in my probe rather than in the pipeline: querying `contract_value` instead of `contract_value_bdt`; testing `eligibility_published == "yes"` when the real values are `SUBSTANTIVE_TEXT_PUBLISHED`, `AS_PER_TENDER_DATA_SHEET_ONLY`, `PORTAL_ACCESS_DENIED` and `BLANK_IN_NOTICE`; testing `amendment_touched_eligibility == "True"` when the value is `"yes"`; and reading `evidence_excerpt_1` when the columns are named per-topic. Each was resolved by dumping the real column schema and re-querying.

Documentary exhibits were re-opened and checked character by character against the source PDF at page level, including the typographical errors, which are reproduced as printed rather than silently corrected: the RAJUK 199942 corrigendum wording on page 2, the CDA 644083 security reduction from BDT 830,000 to BDT 83,000 with its clause 7 reading "If Quated Rate is found more thane 10% above or below Estimated cost, Tender will be Non-Responsive", and the CDA 514221 eligibility stack. All three verified, and in two cases the re-reading produced material the first pass had missed: RAJUK 199942 turns out to carry a *second* corrigendum with the same admission ("Qualification criteria amended in order to ensure the right product to be obtained"), and its old-value/new-value table shows the actual change — an FSC certificate added alongside the existing ISO requirement. On CDA 514221 the amendment table confirms the eligibility items were added by corrigendum rather than present from the start, because they appear only in the new-value column.

Finally, the whole result set was cross-checked against the independently produced register-derived baseline from earlier work on the same authorities, and the two agree on tender counts, total value and the identity of the largest repeat winners.

Two things were changed in this pass as a result of re-verification rather than of new analysis. The frequency table in section 7 originally showed ten firms and silently omitted Momotaj Engineers Ltd, which has more contracts (ten) than the last row shown; it now lists every firm with nine or more contracts in strict count order, which strengthens the finding rather than weakening it, because Momotaj and Maliha are counter-examples of frequent winning in ordinary competition. And rank 20 of the top twenty is a three-way tie at 59.5, now stated as such.

One recomputation deserves a note because it looks like a discrepancy and is not. Recalculating concentration with an ad-hoc name key produced 306 winners and an HHI of 927.0 against the reported 304 and 928.2. The reported figures use the pipeline's own key, which maps LIMITED to LTD and drops parenthetical suffixes; the ad-hoc key did neither. The pipeline figures stand and the JV-attributed HHI of 948.4 reproduced exactly under both.

A second verification pass was run after the rule catalogue was added, covering the eighteen rules, their clause citations and the two new files. Every deviation figure was independently recounted from the finished CSVs and all eighteen reproduced. Six of 21 quoted clause fragments failed a literal string search of their cited page, and all six failed for typesetting reasons that a naive grep cannot see — marginal clause headings interleaved into the middle of a sentence, words hyphenated across line breaks, and a formula printed in mathematical-italic Unicode. Each was re-read against the page as printed and confirmed; a `quote_reproduction_note` column now travels with every row so the artefact is not mistaken for a bad quote. Two of my own probes were also at fault rather than the citations: "twenty (20) percent" failed because the document prints "twenty percent (20%)", and "no pre-condition" failed because the clause reads "pre-conditions" in the plural.

Two page citations were genuinely imprecise and were corrected: ITT 56.2's stem is the last line of PDF page 32 while its sub-paragraphs (a) to (f) print on page 33, so both rules resting on it now cite "32-33". One earlier finding was substantively wrong and was reversed: the government-client-experience rule had been recorded as having no counterpart anywhere in the corpus, but JICA section 1.01(3) does state a non-discrimination principle and Annex I Note 2 adds that relaxing prequalification criteria "is not acceptable". It is now graded as a donor benchmark. The test result is unchanged, because JICA governs one tender in 1,155, but the earlier grade understated what the corpus contains.

One genuine extraction bug surfaced in this pass, affecting two rows of 249. Liquid-asset bars on tenders 119545 and 113428 read 80,437 and 43,650 times contract value. The cause was a doubled Lac multiplier — the notices print a complete numeral in the South Asian grouping and then repeat it in words, so "20,00,000 (Twenty) Lac" was read as two million and multiplied by 100,000 again. The arithmetic confirms the mechanism exactly: 2,000,000 × 100,000 ÷ 4,581,878.13 is 43,650.22 to the last digit. On 119545 the reading window also over-ran the liquid-asset clause and captured the next item, Minimum Tender Capacity. Both were replaced with the figures printed in the notices' own sentences, which were already stored verbatim on the same rows — BDT 825,000 and BDT 2,000,000, ratios of 0.37 and 0.44, both compliant — moving that rule from 150 deviations to 148 and from 99 compliant to 101. Each corrected row carries a `CORRECTED_2026-09-02_VERIFICATION` provenance string in its `extraction_method` cell. The other three ratio columns were bounds-checked against plausibility ceilings and none contains a comparable artefact.

Two figures carried over from draft notes were wrong and were corrected by recount: the batch of contracts signed at exactly 150 days is thirteen, not five, and the number of amendments that touched qualification criteria is 136 of 160, not 24. Both now appear with their tender IDs or denominators attached.


---

## 13. Which rules are broken, and how far each finding can be pushed

This section answers a narrower question than the rest of the file: not whether competition was suppressed, but which written rules these documents depart from. It is reported at three grains. `master_tender_investigation.csv` keeps one row per tender and carries thirteen summary columns naming the rules that tender departs from, the ones that can be published as breaches, and both PDFs the tests read. `rule_deviations.csv` holds one row per tender per rule in scope, 5,525 rows, including the rules each tender passed. And `rules_broken_line_by_line.csv` holds only the broken ones — 1,583 lines, one per rule per tender, sorted so that the publishable lines come first. Every line on that file names the clause, the rule PDF, the PDF page and the printed page, quotes the clause verbatim, quotes what the tender or award document actually says with its own page number, names both the tender notice and the award notice it read, and ends with an explicit verdict on whether the line can be published as a breach and why. There are no empty evidence cells on it: all 1,583 lines carry a clause quote, a document quote and a page.

A fourth file, `data_dictionary.csv`, exists because of a decision made late and applied everywhere. Unavailable values are now empty cells rather than placeholders like `NOT_AVAILABLE` or `NOT_PUBLISHED_IN_ANY_DOCUMENT_IN_CORPUS`. That is cleaner to read and to load, but it throws away the reason a cell is blank, so the reason is preserved instead in the dictionary: one row per column per file, with the fill rate and a sentence saying what an empty cell means there. Genuine negative findings were kept, because a tested-and-clean result is not an absence: `NONE`, `NO_FLAG`, `NO_REPEAT_PATTERN`, `PORTAL_ACCESS_DENIED` and the `NOT_APPLICABLE_*` verdicts all remain as written.

Three structural limits govern everything below, and each was established by sweep rather than assumed.

**There is no Bangladeshi rulebook in the corpus.** A search of all five reference PDFs returns zero hits for "PPR 2008" and zero for "Public Procurement Rules, 2008". The only Bangladeshi standard document present is BPPA's e-PG3A, whose own clause 56.2(f) cross-refers to "Rule 149 of the Public Procurement Rules, 2025" — so the instrument in hand is keyed to a rulebook that is not here, and the rulebook that governed most of these tenders is not here either.

**The one Bangladeshi document present governs four tenders.** e-PG3A is the Standard Tender Document (National) for Procurement of Goods using Framework Agreement, dated December 2025, and its cover page reads "Preliminary working Draft". Exactly 4 of the 1,155 tenders are Goods framework agreements; 714 are Works. Every other citation is therefore read across categories, and every citation at all is read across time, because contracts here were signed between 2015 and 2026. Each row in `rule_deviations.csv` states its own position on both axes in `instrument_scope_vs_this_tender` and `instrument_timing_vs_this_tender`, so a reader can see which rows sit on solid ground and which do not.

**The number five clauses turn on is published nowhere.** The official cost estimate is absent from all 1,155 tenders, and individual bid amounts are never printed. That single gap disables ITT 56.2(a) outright, disables the arithmetic of ITT 50.6, and forces awarded contract value to stand in as a declared proxy in the tender-security, specific-experience and liquid-asset tests. Where that substitution is made, the row says so in `required_value`.

**And every rule is now timed against the event it actually governs, which is what collapses the numbers below.** An earlier version of this catalogue timed only five of the eighteen rules and marked the other thirteen "not date dependent", which was wrong: a December-2025 draft postdates a 2019 tender whatever the rule is about. Each rule now declares the date column it is judged on — the signing date for clauses about what happens at award, the publication date for clauses about what a notice must contain — and each line says which column was used and what year it found, in `event_date_column_used` and `event_year`. Applying that consistently moves 978 of the 1,583 broken-rule lines from arguable to unusable. It is the single largest correction in this investigation, and it cuts against the story rather than for it.

### The five departures from clause text that says "shall"

**Beneficial ownership is not published in 522 of the 645 award notices.** ITT 68.1 requires publication of contract information "together with details of the beneficial ownership of the successful Tenderer" for at least thirty days, and Format e-PG3A-C Note 1 sets the floor at "any agreement above BDT 10.00 Lac". Thirty-nine notices do publish the table and 84 fall below the floor. Together these contracts are worth ৳3,664.0 crore. But the timing check materially narrows what can be said, and it overturns a framing used in earlier work on this dataset: **all 39 disclosing notices were signed in 2025 or 2026, none earlier.** Of the 522 non-disclosing notices, 459 predate any instrument in this corpus that required disclosure. The defensible statement is that 63 of the 102 above-floor contracts signed in 2025–26 do not disclose ownership while 39 do — which is still the strongest single finding in this section, because it shows the field is operable and the omission is a choice, but it cannot be stretched to the full 522.

**383 of 645 contracts were signed outside the applicable window — and the portal's own compliance field says otherwise on 331 of them.** ITT 67.2 defers to the Tender Data Sheet, which prints "within [mention number of days as per Rule 123(9) of the PPR 2025: 14/21/28] days", so the ceiling is 14 days up to BDT 50 million, 21 days to BDT 250 million and 28 above. Median overrun is 13 days past the cap, mean 20.5, maximum 278. Two exhibits carry it: tender 199368 signed 292 days after the notification of award, and a batch of thirteen contracts signed at exactly 150 days — 236241, 236242, 248616, 248617, 248618, 248619, 248621, 248622, 248623, 248625, 248630, 248631 and 248633 — every one of them RAJUK, every one to M/S. Sany Construction, and every one signed on the same day, 25 December 2019. The anachronism bites hardest here: only 56 of the 383 were signed in 2025 or later, and 327 were signed between 2015 and 2024, when PPR 2025 did not exist. Those 327 rows are marked `CITED_INSTRUMENT_POSTDATES_EVENT` and must not be published as breaches of Rule 123(9). The pattern is real; the violation count is not available until the PPR 2008 signing rule is obtained.

Buried in the same field is a finding that needs no rulebook at all, because it is internal to the published record. Every award notice on the standard template prints a self-assessment: "Was the Contract Singed in due time?" — the typo is the portal's. Across the 591 notices that answer it and print both dates, that answer is a pure function of a **flat 28-day test**: it reads yes if and only if the gap is 28 days or fewer, and no if it is more, with zero exceptions in 591 cases. But the cap the Tender Data Sheet points at is not flat. It is 14 days up to BDT 50 million and 21 days to BDT 250 million, and only 24 of the 645 contracts here are large enough for 28 days to be the right number. Applying the loosest of the three caps to everything, the portal certifies as signed "in due time" **331 contracts worth ৳706.5 crore that ran past the cap applicable to their own value** — 294 of them past a 14-day cap and 37 past a 21-day cap, by a median of 11 days and 231 of them by more than a week. None of the 331 ran more than 14 days over, and that is the point: the cases that ran further are exactly the 52 the portal does flag "no". A flat 28-day test catches the egregious overruns and is blind to every moderate one. Tender 1082525 is the plain illustration: notification of award 19 May 2025, signature 15 June 2025, twenty-seven days on a BDT 7.8 crore contract where the cap is 21, and the notice says "yes". This is logged in `portal_self_certified_signed_in_due_time` on every award row, and it is deliberately **not** scored as a rule broken, because no clause in the corpus governs how the portal computes its own indicator. What it is, is a compliance metric that cannot detect a breach of the 14-day or 21-day cap by construction — which is a story about the platform rather than about any one authority, and it applies to every procuring entity in Bangladesh that uses it. A further 54 notices use an economic-operator template that omits the field, and the bid counts, altogether.

**88 notices require enlistment with the procuring entity in an open tender.** ITT 18.2 is unambiguous — "There shall not be any pre-conditions whatsoever, for sale of Tender Documents" — and ITT 21.1(a) confines an enlistment requirement to Limited Tendering. Read the excerpt on each row before using any of them, because the wording matters more than the count. Eighty-five of the 88 name at least one alternative enlisting body, typically "RAJUK or Other Govt./Semi Govt./Autonomous Organization/Reputed Bonafide Firm", which excludes only firms never enlisted anywhere in the public sector. Three name no alternative at all, and only two of those three are genuinely closed: 424168 and 446283, both Cox's Bazar Development Authority, require up-to-date enlistment with the procuring entity itself and nothing else. The third, CDA 629331, restricts to a fixed list of five utilities — "Enlisted regular contractors of BPDB,PWD, CPA, WASA, CCC". One more deserves a line of its own because the gate is narrower than the count suggests: CDA 1128572 requires "latest enlistment under category 1.3 with KGDCL of Petrobangla", an enlistment with a third-party gas utility at a named category. Fifty-eight of the 88 are Works packages, so the clause is also being read across categories. And the same timing test applies here as everywhere: 24 of the 88 were published in 2025 or 2026, the other 64 before the instrument existed.

**59 tenders whose status reads "Contract Awarded" have no award notice at all.** ITT 61.1 requires award details to be published "Immediately, but no later than 24 hours, after issuing the Notification of Award" and displayed for at least twenty-eight days; ITT 68.1 requires contract details within three days of signing, kept for thirty. For these 59 the portal returns nothing, so supplier, value, bid counts, performance security and signing date are all untestable — which is why the contract-value column for this rule is empty in every row. An absent document is not proof of an unpublished one; the notice may have been published and later withdrawn, or the status field may be wrong. Both possibilities are reportable and neither is provable from here. Only 3 of the 59 were advertised in 2025 or later — 1060377, 1060381 and 1081736, all RAJUK — so this is the rule the timing test cuts down hardest.

**78 notices impose their own fixed price band as an automatic ground of non-responsiveness.** This is the sharpest new rule finding in the investigation. The standard document does not permit a flat percentage rule at all: ITT 50.3 sets a *computed* floor from the actual spread of bids — "the lower limit of acceptable prices shall be [x-Sd ]" — and ITT 50.6 supplies a fixed figure only where a single responsive tender exists, at "twenty percent (20%)" against the official estimate. What CDA prints instead, in tender 644083's clause 7, is "If Quated Rate is found more thane 10% above or below Estimated cost, Tender will be Non-Responsive" — typographical errors reproduced as printed. That is half the standard document's figure, applied in both directions, replacing a statistical test with a flat rule, and it rejects bids for being too cheap by reference to an estimate the same authority does not publish. The 78 contracts are worth ৳72.4 crore where value is known. Six were published in 2025 — 1032943, 1036609, 1111428, 1115432, 1123107 and 1128572, every one of them CDA — and those six are the ones that can be put to the authority as a departure from a document that existed when the notice went out.

### The four departures from numbers the Tender Data Sheet only recommends

These are not duties and exceeding them is not unlawful. They are reported because the standard document states a band and these notices sit outside it, and because the direction of travel is consistent.

The past-contract bar exceeds the recommended 60–80% of estimated cost in 69 of the 247 tenders where it can be computed, with 178 inside the band; the median departure is a bar at 1.02 times awarded value and the maximum 6.19 times. The liquid-asset or working-capital bar exceeds the recommended 80–100% in 148 of 249, with 101 inside; here the departures are not marginal — median 1.62 times awarded value, maximum 7.53, with 50 above twice and 27 above three times the value of the work. Tender security exceeds the TDS ceiling of "not exceeding three (3) percent of the official cost estimate" in 171 of 554, but this one is mostly trivial and should be reported as such: the median overshoot is 3.26%, the maximum 6.32%, and only 13 rows exceed 5%. Manufacturer's authorisation or sole dealership is demanded on 65 Goods packages against a TDS default reading "Manufacturer's Authorization is not required"; 50 of the 65 are RAJUK, and 29 of the 65 are lift, generator, substation, server or transformer packages where authorisation has an ordinary engineering rationale and should not be reported as restrictive without more. The cleanest case of the requirement landing on ordinary off-the-shelf goods is GDA 1290616, office furniture for a newly rented building. One caveat runs the other way and matters more than the count: this tally is a floor, not a ceiling. RAJUK 199942 — the furniture package whose corrigendum admits in writing that "Adjustment is brought in the qualification criteria to ensure presence of appropriate tenderer" — demands "Manufacturer's authorization for all item" and a "Manufacturer's production capacity cerificate", yet it is absent from these 65, because on that notice the requirement sits in the contract-document list rather than in the eligibility field the extractor reads. Wherever a bar is printed outside the eligibility field, this catalogue misses it.

### What is explicitly not a breach

Two hundred and one tenders drew a single bid or ended with a single responsive bidder and were awarded anyway. ITT 56.2(b) permits rejection where "there is evidence of lack of effective competition; such as non-participation by a number of potential Tenderers" — permits, not requires — and ITT 56.3 expressly preserves the award where the lowest evaluated price conforms to the market price. **Nothing in these 201 rows is a violation**, and they are carried with the result `CONDITION_PRESENT_DISCRETION_NOT_A_BREACH` so that no one downstream can mistake them for one. The reportable question is whether the evaluation committee considered 56.2(b) and what the head of the procuring entity decided, and that is answerable only from committee minutes which are not in this corpus.

### What cannot be scored, and why that is itself the finding

Eight rules produce rows that record a condition without scoring it. The estimate blackout accounts for three: the ITT 50.6 comparison mandated for exactly the single-responsive situation cannot be checked in any of its 201 cases, the ITT 56.2(a) price test cannot be checked in any of 645, and the performance-security clock cannot be checked in any of 645 because that field is blank on every award notice — where the standard document is also internally inconsistent, ITT 63.2 stating a flat fourteen days while the TDS cites Rule 123(7) and a 7/10/14 working-day scale. Missing metadata accounts for one: 160 tenders were amended and 136 of those amendments touched the qualification criteria, but the portal prints a corrigendum number and its text without a corrigendum date, so ITT 11.5's requirement to extend the deadline when an addendum lands in the final third of the tendering period cannot be evaluated at all. Obtaining corrigendum dates from BPPA would convert a mandatory rule from untestable to testable, and it is the cheapest document request in this investigation.

Missing rules account for the rest, and this is where the corpus is thinnest. There is no brand-name rule in e-PG3A — a sweep of all 89 pages returns zero hits for "brand name", "brand names" and "trade name" — so the 56 notices naming a brand or model with no equivalent permitted can only be measured against JICA's section 4.07, which binds one tender in 1,155. There is no binding non-discrimination or proportionality clause either: zero hits for "discriminat", "proportional", "proportionate", "equal treatment", "restrict competition" and "undue restriction". A non-discrimination principle does exist in the corpus, at JICA 1.01(3), and JICA's Annex I adds that relaxing prequalification criteria at the evaluation stage "is not acceptable" — but again as a donor benchmark, not Bangladeshi law. So the 333 notices restricting past experience to government or semi-government clients, and the 24 packages above BDT 250 million tendered nationally only, are recorded as conditions and not as breaches. And the largest of these is the 599 notices that publish no qualification threshold at all: what an Invitation for Tenders must itself contain is prescribed by the PPR, which is not here, so the single most consequential transparency finding in this investigation has no citable rule attached to it.

### The totals, stated carefully

Of the 1,155 tenders, 1,097 attract at least one rule row and 58 attract none, because a tender with no award notice, no published criteria and no amendment gives the catalogue nothing to test. Seven hundred and thirty tenders carry at least one deviation of any kind and 425 carry none. Six hundred and seventy-eight carry at least one departure from clause text that says "shall"; 324 carry at least one departure from a recommended band. The per-tender distribution runs 425 tenders with none, 240 with one, 263 with two, 135 with three, 56 with four, 31 with five, two with six and three with seven. Of the 1,583 deviation rows, 1,130 cite text graded `VERBATIM_MANDATORY_IN_CORPUS` and 453 cite a Tender Data Sheet note.

Read that against the anachronism test before using any of it, and read it knowing that this paragraph replaces an earlier and more generous version. Timing the eighteen rules consistently, rather than only five of them, leaves **152 broken-rule lines across 91 tenders worth ৳128.9 crore** where the clause says "shall" and the event it governs happened while the cited instrument existed. Those 152 are R01 ownership 63, R02 signing 56, R03 enlistment 24, R04 missing award notice 3, R05 price band 6. Against them stand 978 lines marked `NO_CITED_INSTRUMENT_POSTDATES_THE_EVENT` and 453 marked `NO_RECOMMENDED_BAND_IS_NOT_A_DUTY`. By agency the 91 tenders are RAJUK 74, CDA 7, CoxDA 5, RDA 3, KDA 2 — which is close to the corpus mix and not a finding about RAJUK.

An earlier draft of this section said the 78 price-band clauses, the 88 enlistment gates and the 59 missing award records survive unqualified. **That was wrong**, and it was wrong for the same reason the ownership figure had to be cut from 522 to 63: those three counts run back to 2015 and 2019, and the only Bangladeshi instrument in the corpus is dated December 2025. Netted properly the three become 6, 24 and 3. The four recommended-band tallies survive as departures from a recommendation, which is all they ever were. Everything else is a pattern worth reporting as a pattern and a document request worth making — not a breach.

So the sentence that will hold is not "678 tenders break mandatory procurement rules" and not "730 tenders show deviations". It is that **91 tenders carry 152 departures from clause text that says "shall", on facts dated inside the life of the instrument being cited** — and that the reason the number is not larger is that Bangladesh's actual procurement rulebook is not published in a form this corpus contains, which is itself the finding underneath all the others.

### What verification changed

Six of 21 quoted clause fragments failed a literal string search of the page they are cited to, and every one failed for a typesetting reason rather than a transcription error: e-PG3A sets clause headings in a left margin column, so the heading is interleaved into the middle of the clause sentence; words are hyphenated across line breaks; and ITT 50.3 prints its formula in mathematical-italic Unicode, transcribed here in ASCII. Each quote was re-read against the page as printed and confirmed. A new column, `quote_reproduction_note`, now carries this on every row so that nobody re-running the check reads a layout artefact as a fabricated quote. Two page citations were corrected: ITT 56.2's stem is the last line of PDF page 32 and its sub-paragraphs are on page 33, so both rules citing it now read "32-33". One rule was reclassified upward, from "no rule text exists" to "benchmark only", after JICA 1.01(3) turned up on a second sweep — recorded because the earlier grade was wrong and understated what the corpus contains.

One genuine extraction bug was found and fixed. Two tenders carried liquid-asset ratios of 80,437 and 43,650 times contract value, which is to say bars of roughly BDT 180–200 billion on contracts of BDT 22 and 46 lakh. The cause was a doubled Lac multiplier: the notices print the amount as a complete numeral in the South Asian grouping, "20,00,000", then repeat it in words as "(Twenty) Lac", and the extractor applied the 100,000 multiplier to the already complete numeral. On tender 119545 the reading window also over-ran into the next item and captured Minimum Tender Capacity instead of liquid assets. The true figures, read from the notices' own sentences, are BDT 825,000 and BDT 2,000,000 — ratios of 0.37 and 0.44, both compliant — which moved R07 from 150 deviations to 148. Every other ratio column was re-checked against a plausibility ceiling and none contains a comparable artefact: turnover peaks at 7.53 times, specific experience at 6.19, tender security at 0.06. Two stale figures inherited from draft notes were also corrected against a recount: the 150-day signing batch is thirteen contracts, not five, and the number of amendments touching qualification criteria is 136 of 160, not 24.

Two further corrections came out of the finalisation pass. The first is the timing fault described above: only five of the eighteen rules were being timed, and the other thirteen were labelled "not date dependent", which no rule citing a December-2025 draft can be. Fixing it moved the publishable set from a claimed five categories to 152 lines across 91 tenders, and it removed three counts I had previously reported as surviving unqualified. The second is that the award notices' own compliance field turned out to be testable: reading "Was the Contract Singed in due time?" off all 645 notices and comparing it to the dates on the same page showed it is computed against a flat 28-day rule in 591 of 591 answered cases, which is how 331 late contracts come to be certified as timely.

All five output files re-parse under Python's strict CSV reader with zero malformed rows. `master_tender_investigation.csv` is 1,155 rows by 179 columns with no duplicate tender IDs; `rule_deviations.csv` is 5,525 by 38; `rules_broken_line_by_line.csv` is 1,583 by 38, and every one of those 1,583 lines carries a verbatim clause quote, a page in the rule PDF, a quote from the tender or award document and a page in that document — zero exceptions on all four checks; `bidder_detail.csv` is 1,189 by 20; `data_dictionary.csv` is 275 rows, one per column per file. All five are UTF-8 with byte-order mark and fully quoted. A final sweep for leftover placeholder text across all five files returns zero hits outside the columns where a negative verdict is the finding.
---

## 14. What a reporter should do next

The reporting is not finished by this file; it is aimed by it. Nine lines of follow-up follow directly from what the documents do and do not contain.

**Ask the six authorities, in writing, for the engineer's cost estimate on named contracts.** The estimate is the single most consequential absence here. It is prepared for every tender, it is referenced by the price-band clause that CDA itself prints, and it appears in no document in this corpus. Requesting it for a short list — the 87 single-bid awards and the eight highest-value low-competition contracts in section 6 — converts every price question in this file from untestable to testable. If it is refused, the refusal is itself a story, because the same authorities publish a clause that makes bids non-responsive by reference to a figure they will not disclose.

**Ask for the evaluation reports on the 31 tenders that went from four or more bids to one responsive bidder.** These ৳200.7 crore of contracts are where the field demonstrably collapsed at evaluation, and the reason each bid was ruled non-responsive exists on paper in the tender evaluation committee report even though the portal never prints it. This is the highest-yield document request in the whole investigation, because the mechanism section 1 establishes is exactly the thing these reports describe.

**Put the 51.9% criteria blackout to the Bangladesh Public Procurement Authority and to RDA specifically.** Five hundred and ninety-nine notices publish no qualification threshold at all beyond "As per TDS" — 100% of RDA's, 83.7% of CoxDA's, 60.0% of RAJUK's, against 0.6% at CDA and none at GDA. Two authorities publish their bars and two hide them, under one national portal and one rulebook. The question to BPPA is why the portal permits it; the question to RDA is why an authority whose tenders end with one responsive bidder 60.7% of the time is also the one that publishes least.

**Interview firms that never won.** The 997 non-responsive bids belong to companies whose names the portal withholds, but the trade associations, the tender-security bank documents and the firms' own records do not withhold them. A single contractor willing to describe, on the record, being ruled non-responsive on a documentation technicality is worth more than any correlation in this file. Start with the 87 tenders flagged `mass_disqualification_flag`, where at least three bids were rejected and 60% or more of the field was eliminated.

**Take the RAJUK 199942 corrigendum to a procurement lawyer and to RAJUK's own tender committee.** An entity writing, in a published corrigendum, that "Adjustment is brought in the qualification criteria to ensure presence of appropriate tenderer" is the narrative spine of the story. Ask who drafted it, what "appropriate tenderer" was understood to mean, which criteria changed and who bid before and after. Then do the same for the 136 tenders whose amendments touched eligibility.

**Verify the signing-delay finding against the rule that actually applied — and put the portal's own compliance field to BPPA.** 383 of 645 contracts were signed outside the applicable window on the 14/21/28-day sliding scale, 339 of them past the 14-day ceiling, but only 56 were signed in 2025 or later, so the great majority rest on an instrument that postdates the event. Two things must be checked before any of it is printed as a number of breaches: that the sliding scale applied at the date of each tender, and whether the portal's notification-of-award date is the date the clock legally starts from. The stronger and more immediate question needs no rulebook at all. The e-GP portal prints "Was the Contract Singed in due time?" on every award notice and answers it against a flat 28-day test, so it certifies 331 contracts as timely that ran past the cap for their own value. Ask BPPA what rule that field implements, when it was last aligned to Rule 123(9), and how many contracts across the whole platform — not just these six authorities — carry a "yes" they are not entitled to. That is a national finding sitting in plain sight on every award notice the portal publishes.

**Ask BPPA for the date on every corrigendum.** This is the cheapest document request in the investigation and it unlocks a mandatory rule. One hundred and sixty tenders were amended and 136 of those amendments touched the qualification criteria, but the portal prints the corrigendum text and number without a date, so the requirement in ITT 11.5 to extend the deadline when an addendum lands in the final third of the tendering period cannot be tested even once. Dates alone would convert 160 rows from untestable to testable, and they are metadata the portal already holds.

**Get the Public Procurement Rules themselves, and re-run the catalogue.** This is last on the list only because it is obvious, and it is the request that changes the most. Of the 1,583 broken-rule lines in `rules_broken_line_by_line.csv`, 978 are unusable for one reason: the clause they cite comes from a December-2025 draft and the tender is older. Nothing about the underlying conduct changes if the equivalent PPR 2008 clause says the same thing — and on beneficial ownership, signing deadlines, enlistment and price bands it very likely does. Obtaining PPR 2008 and PPR 2025 in full would let every one of those 978 lines be re-tested against the instrument that governed it, and the scripts in `investigation_output/rule_scripts/` are written so that swapping the clause table and re-running is a day's work, not a re-investigation.

Three disciplines apply to all of it. Do not write that restrictive eligibility criteria reduced the number of bidders — this corpus says the opposite, and the finding will not survive contact with the data. Do not write that 678 tenders break mandatory procurement rules, or that 730 show deviations: once every rule is timed against the event it governs, what survives is 152 lines across 91 tenders, and the three counts an earlier draft of section 13 called unqualified — 78 price bands, 88 enlistment gates, 59 missing award records — net down to 6, 24 and 3. And carry the caution from section 3 in whatever is published: the authorities that disclose their criteria look worse on paper precisely because they disclose, and the ones that disclose nothing cannot be measured at all.
