# -*- coding: utf-8 -*-
"""
Rule catalogue for the e-GP forensic test.

EVERY quote below was re-extracted this session with `pdftotext -layout` from
eGP_Forensic_Engine/2026-01-04-13-47-03-e-PG3A.pdf (89 pages) and page numbers
were read off the extracted page files. `pdf_page` is the physical PDF page;
`printed_page` is the number printed in the document footer (offset = pdf-8).

Nothing in this catalogue is asserted as a proven legal violation. Each rule
carries its own certainty and force so a reader can see exactly how far the
finding can be pushed.

clause_certainty
  VERBATIM_MANDATORY_IN_CORPUS  clause text is in the corpus and says shall / shall not
  VERBATIM_PERMISSIVE_IN_CORPUS clause text is in the corpus and says may / can
  TDS_NOTE_IN_CORPUS            number lives in a Tender Data Sheet note / bracketed guidance
  BENCHMARK_ONLY_NON_BINDING    donor guideline, not Bangladeshi law, and this corpus is not donor-funded
  NOT_IN_CORPUS                 no text for this rule exists in any of the five reference PDFs
"""

EPG = "eGP_Forensic_Engine/2026-01-04-13-47-03-e-PG3A.pdf"
JICA = "eGP_Forensic_Engine/chapter2_en.pdf"

# The instrument itself, stated once so every row inherits the same caveat.
INSTRUMENT_NOTE = (
    "e-PG3A is the BPPA Standard Tender Document (National) for Procurement of GOODS "
    "using Framework Agreement [OTM/LTM], dated December 2025, and its cover page reads "
    "'Preliminary working Draft'. The corpus contains no Public Procurement Rules text at "
    "all (0 hits for PPR 2008 across all five reference PDFs) and no earlier Standard "
    "Tender Document. Contracts here were signed 2015-2026 and 714 of 1,155 tenders are "
    "Works, not Goods."
)

# How to reproduce a quote from the PDF. Written after a verification pass in which
# 6 of 21 quote fragments failed a literal string search of the page they are cited to,
# every one of them for a typesetting reason rather than a transcription error.
QUOTE_REPRODUCTION_NOTE = (
    "Quotes follow the clause's READING ORDER, which is not always the character order "
    "produced by `pdftotext -layout`. Three artefacts break a naive literal search and none "
    "of them means the quote is wrong. (1) e-PG3A sets clause headings in a left margin "
    "column, so the heading is interleaved into the middle of the clause sentence: ITT 61.1 "
    "extracts as 'Immediately, but no later than 24 hours, after issuing the / Contract "
    "Awarding / Notification of Award ...', and ITT 21.1 as '... the following shall / for "
    "LTM Tenders / apply:'. (2) Words are hyphenated across line breaks, e.g. ITT 11.5 prints "
    "'one-' then 'third'. (3) ITT 50.3 prints its formula in mathematical-italic Unicode "
    "(U+1D465, U+1D451) which is transcribed here in ASCII as [x-Sd ]. To verify any quote, "
    "read the cited page as printed rather than grepping the extracted text."
)

RULES = [
  dict(
    code="R01", short="BENEFICIAL_OWNERSHIP_NOT_PUBLISHED",
    clause="ITT 5.14 and ITT 68.1, read with Format e-PG3A-C Note 1",
    source_file=EPG, pdf_page="6, 36, 87", printed_page="s.1 p.6, p.28, p.79",
    force="MANDATORY_SHALL", clause_certainty="VERBATIM_MANDATORY_IN_CORPUS",
    quote=("ITT 68.1: 'The Procuring Entity shall also publish, on the BPPA website or web "
           "portal, the contract-related information together with details of the beneficial "
           "ownership of the successful Tenderer. This information shall be kept posted in the "
           "notice board or websites for at least thirty (30) days.' / Format e-PG3A-C Note 1: "
           "'For any agreement above BDT 10.00 Lac, Information on Beneficial Ownership need to "
           "be provided.'"),
    test="Award notice exists and contract value exceeds BDT 10,00,000, but the notice prints no beneficial-ownership table.",
    severity="HIGH",
    limit=("The BDT 10 lakh floor and the publication duty are document-specific to e-PG3A, dated "
           "December 2025. Decisive timing check run this session: all 60 award notices that DO print "
           "an ownership table were signed in 2025 (13) or 2026 (47) - not one before. So the field "
           "became operable only in 2025, and 459 of the 522 undisclosed contracts were signed "
           "2015-2024, before any instrument in this corpus required it. THE DEFENSIBLE FIGURE IS "
           "63 of 102: within 2025-2026, where disclosure is demonstrably possible, 63 above-floor "
           "contracts still print no table against 39 that do. Use 522 only as the raw count, always "
           "with this split attached."),
  ),
  dict(
    code="R02", short="CONTRACT_SIGNED_OUTSIDE_STATUTORY_BAND",
    clause="ITT 67.2 read with the TDS entry for ITT 67.2, which cites Rule 123(9) of the PPR 2025",
    source_file=EPG, pdf_page="35, 40", printed_page="27, 32",
    force="MANDATORY_SHALL", clause_certainty="VERBATIM_MANDATORY_IN_CORPUS",
    quote=("ITT 67.2: 'Within the timeline mentioned in the TDS from the issuance of the NOA but "
           "not later than the date specified therein, the successful Tenderer and the Procuring "
           "Entity shall sign the contract.' TDS for ITT 67.2: 'within [mention number of days as "
           "per Rule 123(9) of the PPR 2025: 14/21/28] days of issuance of the Notification of "
           "Award (NoA)' - 14 days up to BDT 50 million, 21 days BDT 50-250 million, 28 days above "
           "BDT 250 million."),
    test="days_noa_to_signing exceeds the band for the contract's value.",
    severity="HIGH",
    limit=("Two substitutions. The rule keys off the ESTIMATED cost, which is published nowhere "
           "in the corpus, so awarded contract value is used as a proxy. And PPR 2025 cannot have "
           "governed a contract signed before 2025: of the 383 deviations, only 56 were signed in "
           "2025-2026, and 327 were signed 2015-2024. Those 327 rows are marked "
           "CITED_INSTRUMENT_POSTDATES_EVENT and must not be counted as breaches of Rule 123(9). "
           "The underlying PATTERN is still real and does not depend on the clause: median overrun "
           "13 days past the cap, mean 20.5, and a maximum of 278 days past cap. The two exhibits are "
           "tender 199368, signed 292 days after the NOA, and a batch of THIRTEEN contracts signed at "
           "exactly 150 days - 236241, 236242, 248616, 248617, 248618, 248619, 248621, 248622, "
           "248623, 248625, 248630, 248631, 248633 - every one of them RAJUK, every one to M/S. Sany "
           "Construction, and every one signed on the same day, 25-Dec-2019. (An earlier draft of "
           "this note said 'five contracts at 150 days'; the recount during verification returned 13.) "
           "To convert the pattern into a violation count, obtain the contract-signing rule of the PPR "
           "2008 regime, which is absent from this corpus."),
  ),
  dict(
    code="R03", short="ENLISTMENT_PRECONDITION_IN_OPEN_TENDER",
    clause="ITT 18.2, read with ITT 5.1 and ITT 21.1(a)",
    source_file=EPG, pdf_page="18, 12, 19", printed_page="10, 4, 11",
    force="MANDATORY_SHALL_NOT", clause_certainty="VERBATIM_MANDATORY_IN_CORPUS",
    quote=("ITT 18.2: 'There shall not be any pre-conditions whatsoever, for sale of Tender "
           "Documents and the sale of such Document shall be permitted up to the day prior to the "
           "day of deadline for the submission of Tender.' ITT 21.1(a) confines enlistment to LTM: "
           "'In the event, this Tender is invited under LTM the following shall apply: (a) Tenderers "
           "shall be required to submit documentary evidence of updated valid enlistment under the "
           "Procuring Entity'."),
    test="Notice requires enlistment with the procuring entity while the method is Open Tendering.",
    severity="HIGH",
    limit=("Read the excerpt on every row before using it. The wording is typically 'open to Enlisted "
           "(Electrical) Contractor/Supplier of RAJUK or Other Govt./Semi Govt./Autonomous "
           "Organization/Reputed Bonafide Firm' - 82 of the 88 accept enlistment with any of several "
           "public bodies, so the gate excludes only firms never enlisted anywhere in the public "
           "sector. Roughly 4 name a single authority, which is the genuinely closed form: 424168 "
           "requires up-to-date enlistment of Cox's Bazar Development Authority, 1128572 requires "
           "KGDCL enlistment under category 1.3. Also 58 of the 88 are Works packages, and e-PG3A is "
           "a Goods document, so the clause is being read across categories."),
  ),
  dict(
    code="R04", short="AWARD_RECORD_ABSENT_DESPITE_AWARDED_STATUS",
    clause="ITT 61.1 and ITT 68.1",
    source_file=EPG, pdf_page="34, 36", printed_page="26, 28",
    force="MANDATORY_SHALL", clause_certainty="VERBATIM_MANDATORY_IN_CORPUS",
    quote=("ITT 61.1: 'Immediately, but no later than 24 hours, after issuing the Notification of "
           "Award, the Procuring Entity shall ... publish the contract award details ... on the BPPA "
           "website. Such information shall remain displayed ... for at least twenty-eight (28) days.' "
           "ITT 68.1: 'Immediately, but no later than three (3) days after the signing of contract, "
           "the Procuring Entity shall publish the contract-related information'."),
    test="Tender status says Contract Awarded but the portal returns no award notice at all.",
    severity="HIGH",
    limit=("An absent document is not proof of an unpublished one - the notice may have been "
           "published and later withdrawn, or the 28/30-day display window may simply have expired "
           "before the corpus was captured. This is the weakest inference of the four HIGH rules."),
  ),
  dict(
    code="R05", short="FIXED_PRICE_BAND_RESPONSIVENESS_RULE",
    clause="ITT 50.3 and ITT 50.6",
    source_file=EPG, pdf_page="30, 31", printed_page="22, 23",
    force="MANDATORY_SHALL", clause_certainty="VERBATIM_MANDATORY_IN_CORPUS",
    quote=("ITT 50.3: 'Finally, the lower limit of acceptable prices shall be [x-Sd ]. Any tender quoted below "
           "this limit shall be considered as a significantly low-priced tender and shall be treated "
           "as financially non-responsive and rejected.' ITT 50.6: 'In the case of only one "
           "technically responsive tender ... If the deviation of the evaluated price of the "
           "responsive tender from the official estimate exceeds twenty percent (20%), such tender "
           "shall be deemed non-responsive.' TRANSCRIPTION NOTE: the PDF prints the formula in "
           "mathematical-italic characters as [U+1D465 MINUS S U+1D451], i.e. x-bar minus one standard "
           "deviation, with a space before the closing bracket; it is rendered here in ASCII, so a "
           "literal string search of the PDF for 'x-Sd' will not match. No other character in this "
           "quote is altered."),
    test="Notice imposes its own fixed percentage band (typically 10% above or below the estimate) as an automatic ground of non-responsiveness.",
    severity="HIGH",
    limit=("The standard document sets a COMPUTED lower limit from the actual spread of bids, and a "
           "20% figure only where a single responsive tender exists. A flat 10% both ways is half "
           "the standard document's figure and replaces its statistical test. But ITT 50.3-50.6 are "
           "December 2025 text; the notices run 2019-2025, so the machinery they depart from may not "
           "have existed yet. Cite as a departure from the current standard, not as a 2019 breach."),
  ),
  dict(
    code="R06", short="SPECIFIC_EXPERIENCE_BAR_ABOVE_RECOMMENDED_BAND",
    clause="TDS note to ITT 13.1(b)",
    source_file=EPG, pdf_page="38", printed_page="30",
    force="RECOMMENDED_BAND", clause_certainty="TDS_NOTE_IN_CORPUS",
    quote=("'The minimum specific experience as Supplier in supply of similar Goods of at least "
           "[state number] contract(s) successfully completed within the last [state number] years, "
           "each with a value of at least Tk. [state amount] ... [the minimum value is recommended "
           "to be between 60 and 80 percent of the estimated cost of the proposed supply]'"),
    test="Published minimum past-contract value exceeds 80% of the awarded contract value.",
    severity="MEDIUM",
    limit=("A recommendation, not a duty - exceeding it is not unlawful. And the band is a share of "
           "the ESTIMATED cost, which is absent, so awarded value stands in for it."),
  ),
  dict(
    code="R07", short="FINANCIAL_BAR_ABOVE_RECOMMENDED_BAND",
    clause="TDS note to ITT 14.1(b)",
    source_file=EPG, pdf_page="38", printed_page="30",
    force="RECOMMENDED_BAND", clause_certainty="TDS_NOTE_IN_CORPUS",
    quote=("'The minimum amount of financial resources as liquid asset or working capital or credit "
           "line(s) ... shall be Tk [state amount] ... [the minimum value is recommended to be "
           "between 80 and 100 percent of the estimated cost of the proposed supply]'"),
    test="Published minimum liquid-asset / working-capital requirement exceeds 100% of the awarded contract value.",
    severity="MEDIUM",
    limit=("Same two limits as R06: recommendation only, and contract value substitutes for the "
           "estimate. Distribution of the 148 departures: median 1.62x the awarded value, maximum "
           "7.53x, with 50 above 2x and 27 above 3x - so unlike R08 this is not a set of trivial "
           "overshoots. Two rows were CORRECTED during verification: tenders 119545 and 113428 had "
           "ratios of 80436.99x and 43650.22x because the extractor applied the Lac multiplier to an "
           "already complete numeral (and on 119545 also read the Minimum Tender Capacity clause "
           "instead of the liquid-asset clause). Their true ratios are 0.37x and 0.44x, both "
           "COMPLIANT, which moved this rule from 150 deviations to 148. No other ratio column in the "
           "master contained a comparable artefact."),
  ),
  dict(
    code="R08", short="TENDER_SECURITY_ABOVE_3PCT_CEILING",
    clause="TDS note to ITT 31.1",
    source_file=EPG, pdf_page="39", printed_page="31",
    force="CEILING_IN_TDS_NOTE", clause_certainty="TDS_NOTE_IN_CORPUS",
    quote=("'The amount of the Tender Security shall be [state amount] in favour of [state the name "
           "of the beneficiary] [not exceeding three (3) percent of the official cost estimate but "
           "as a fixed amount]'"),
    test="Tender security exceeds 3% of the awarded contract value.",
    severity="MEDIUM",
    limit=("'not exceeding three (3) percent' is a real ceiling but it is expressed against the "
           "official cost estimate. Because the estimate is normally above the awarded price, a "
           "security above 3% of the awarded price can still sit under 3% of the estimate. The "
           "overshoot is mostly small: of the 171, the median is 3.26% and the maximum 6.32%; only "
           "13 exceed 5%, and those 13 are the only rows where the estimate would have to be more "
           "than two-thirds above the awarded price for the security to be lawful. Treat the other "
           "158 as a question to put to the agency, not a finding."),
  ),
  dict(
    code="R09", short="MANUFACTURER_AUTHORISATION_ON_GOODS",
    clause="TDS entry and bracketed guidance to ITT 28.1(f)",
    source_file=EPG, pdf_page="38, 39", printed_page="30, 31",
    force="GUIDANCE_DEFAULT_IS_NOT_REQUIRED", clause_certainty="TDS_NOTE_IN_CORPUS",
    quote=("The TDS prints 'Manufacturer's Authorization is not required.' as the first option, "
           "followed by 'OR / Manufacturer's Authorisation is required for all the items listed in "
           "Price Schedule', under the guidance '[delete not appropriate; usually Manufacturer's "
           "Authorization is not required for off-the-shelf readily available Goods]'."),
    test="A Goods tender requires manufacturer's authorisation or sole-dealership.",
    severity="MEDIUM",
    limit=("Guidance, and it turns on whether the goods are 'off-the-shelf readily available' - a "
           "judgement this engine does not make. The composition argues for caution: 50 of the 65 are "
           "RAJUK, and the packages are overwhelmingly passenger lifts, stretcher lifts, substations, "
           "generators and rack servers, where manufacturer authorisation has an ordinary and "
           "defensible rationale. So do NOT report 65 as improper requirements. The reportable "
           "residue is narrower: the lift packages are also where Concept Elevators & Engineering Ltd "
           "won 12 contracts, 9 of them in fields of two or fewer - a market-structure question about "
           "how few authorised agents exist, not a rule breach. The one package where the STD's "
           "'off-the-shelf' guidance bites cleanly is furniture: tender 199942 required "
           "manufacturer's authorisation for every item on a furniture supply contract."),
  ),
  dict(
    code="R10", short="LACK_OF_EFFECTIVE_COMPETITION_NOT_ACTED_ON",
    clause="ITT 56.2(b)",
    source_file=EPG, pdf_page="32-33", printed_page="24-25",
    force="PERMISSIVE_CAN", clause_certainty="VERBATIM_PERMISSIVE_IN_CORPUS",
    quote=("'All Tenders can be rejected, if - (b) there is evidence of lack of effective "
           "competition; such as non-participation by a number of potential Tenderers'"
           " PAGINATION NOTE: the stem 'All Tenders can be rejected, if -' is the last line of PDF "
           "page 32; sub-paragraphs (a) to (f) are printed on PDF page 33. The two are quoted here as "
           "one clause, so a search of page 32 alone will not return the sub-paragraph."),
    test="Tender drew a single bid, or ended with a single responsive bidder, and was awarded anyway.",
    severity="NOT_A_BREACH_DISCRETION",
    limit=("'can be rejected' - the clause creates a power, not a duty, and ITT 56.3 expressly "
           "preserves the award where the lowest evaluated price matches the market price. NOTHING "
           "in this row is a violation. The reportable question is whether the Tender Evaluation "
           "Committee considered 56.2(b) and what the Head of the Procuring Entity decided - which "
           "is answerable only by the TEC minutes, and those are not in the corpus."),
  ),
  dict(
    code="R11", short="SINGLE_RESPONSIVE_TENDER_ESTIMATE_TEST_UNVERIFIABLE",
    clause="ITT 50.6",
    source_file=EPG, pdf_page="31", printed_page="23",
    force="MANDATORY_SHALL_BUT_UNVERIFIABLE", clause_certainty="VERBATIM_MANDATORY_IN_CORPUS",
    quote=("'In the case of only one technically responsive tender, the above methodology shall not "
           "be applied; instead, the lowest evaluated price obtained shall be directly compared with "
           "the official cost estimate. If the deviation ... exceeds twenty percent (20%), such "
           "tender shall be deemed non-responsive.'"),
    test="Exactly one responsive tender, so ITT 50.6 governs - but the official cost estimate the clause requires is published in none of the 1,805 documents.",
    severity="HIGH_AS_A_TRANSPARENCY_FINDING",
    limit=("This is not a finding that the comparison was skipped. It is a finding that the one test "
           "the rule prescribes for exactly this situation cannot be checked by anyone outside the "
           "agency, because the benchmark it turns on is never published."),
  ),
  dict(
    code="R12", short="PERFORMANCE_SECURITY_TIMING",
    clause="ITT 63.2, and the TDS entry for ITT 62.1 citing Rule 123(7) of the PPR 2025",
    source_file=EPG, pdf_page="35, 40", printed_page="27, 32",
    force="MANDATORY_SHALL", clause_certainty="VERBATIM_MANDATORY_IN_CORPUS",
    quote=("ITT 63.2: 'Within fourteen (14) days from the date of receipt of the NOA, the successful "
           "Tenderer shall furnish the Performance Security'. But the TDS for ITT 62.1 states a "
           "sliding scale in WORKING days per Rule 123(7) of the PPR 2025: 7 working days up to BDT "
           "50 million, 10 working days BDT 50-250 million, 14 working days above BDT 250 million."),
    test="NOT TESTABLE. The performance-security field is blank on all 645 award notices.",
    severity="NOT_TESTABLE",
    limit=("Worth reporting for a second reason: the standard document contradicts itself. ITT 63.2 "
           "says a flat fourteen (14) days; its own TDS says 7/10/14 WORKING days by value band. "
           "The 14-day figure is the top band, not the general rule."),
  ),
  dict(
    code="R13", short="ADDENDUM_WITHOUT_DEADLINE_EXTENSION",
    clause="ITT 11.5, read with ITT 11.2 and ITT 38.2",
    source_file=EPG, pdf_page="16, 25", printed_page="8, 17",
    force="MANDATORY_SHALL_INTERNALLY_CONTRADICTORY", clause_certainty="VERBATIM_MANDATORY_IN_CORPUS",
    quote=("'If an addendum is issued when time remaining is less than one-third of the time allowed "
           "for the preparation of Tenders, the Procuring Entity at its discretion shall extend the "
           "deadline by an appropriate number of days ... In any case, the minimum time for such "
           "extension shall not be less than three (3) working days.' HYPHENATION NOTE: the PDF breaks "
           "'one-third' across lines 15-16 of page 16 as 'one-' / 'third', so a literal search for "
           "'one-third' on that page fails; the reading order is as quoted."),
    test="NOT TESTABLE. The portal's amendment block prints a corrigendum NUMBER and text but no corrigendum DATE, so the one-third test cannot be evaluated.",
    severity="NOT_TESTABLE",
    limit=("This is the most damaging of the not-testable rules, because 160 tenders were amended and "
           "136 of those amendments touched the qualification criteria. (An earlier draft of this note "
           "said 24; the master's own amendment_touched_eligibility column returns 136 of 160, and the "
           "verification recount confirms it.) Obtaining corrigendum dates "
           "from BPPA would convert a mandatory rule from untestable to testable. Note also that the "
           "clause is internally contradictory as drafted - 'at its discretion shall extend' puts a "
           "power and a duty in the same verb phrase - so even with dates in hand, whether ITT 11.5 "
           "binds at all is a question for a procurement lawyer, not for this dataset."),
  ),
  dict(
    code="R14", short="LOWEST_PRICE_VS_OFFICIAL_ESTIMATE",
    clause="ITT 56.2(a)",
    source_file=EPG, pdf_page="32-33", printed_page="24-25",
    force="PERMISSIVE_CAN", clause_certainty="VERBATIM_PERMISSIVE_IN_CORPUS",
    quote=("'All Tenders can be rejected, if - (a) the price of the lowest evaluated Tender exceeds "
           "the official cost estimate, provided the estimate is realistic'"
           " PAGINATION NOTE: the stem is the last line of PDF page 32 and sub-paragraph (a) is on "
           "PDF page 33."),
    test="NOT TESTABLE. estimated_tender_value is NOT_PUBLISHED_IN_ANY_DOCUMENT_IN_CORPUS in all 1,155 rows, and individual bid amounts are never printed.",
    severity="NOT_TESTABLE",
    limit="The estimate blackout disables R14, R11's arithmetic, and the proper form of R06, R07 and R08 simultaneously. It is the single most consequential gap in the corpus.",
  ),
  dict(
    code="R15", short="BRAND_NAME_WITHOUT_OR_EQUIVALENT",
    clause="JICA Guidelines for Procurement under Japanese ODA Loans, Section 4.07 'Use of Brand Names'",
    source_file=JICA, pdf_page="see chapter2_en.pdf s.4.07", printed_page="s.4.07",
    force="BENCHMARK_ONLY", clause_certainty="BENCHMARK_ONLY_NON_BINDING",
    quote=("'the specifications shall permit offers of alternative goods which have similar "
           "characteristics and provide performance and quality at least equal to those specified'"),
    test="Notice names a brand or model with no 'or equivalent' wording.",
    severity="NOT_SCOREABLE_NO_BANGLADESHI_RULE_IN_CORPUS",
    limit=("There is NO brand-name rule in e-PG3A. Verified by sweep of all 89 pages: zero hits for "
           "'brand name', 'brand names' and 'trade name'; the one apparent hit for 'or equivalent' is "
           "on page 60 and reads 'for equivalent amount' in an advance-payment guarantee clause, "
           "nothing to do with specifications. The only citable text is JICA's, and exactly 1 of 1,155 "
           "tenders is JICA-funded. Never write 'JICA violation'. The Bangladeshi equivalent lives in "
           "the PPA 2006 / PPR, neither of which is in the corpus."),
  ),
  dict(
    code="R16", short="GOVERNMENT_CLIENT_ONLY_EXPERIENCE",
    clause="JICA Guidelines for Procurement under Japanese ODA Loans, Section 1.01(3), read with Annex I Notes 1-2",
    source_file=JICA, pdf_page="see chapter2_en.pdf s.1.01(3) and Annex I", printed_page="Part I s.1.01(3); Annex I notes",
    force="BENCHMARK_ONLY", clause_certainty="BENCHMARK_ONLY_NON_BINDING",
    quote=("JICA 1.01(3): 'The proceeds of Japanese ODA Loans are required to be used with due "
           "attention to considerations of economy, efficiency, transparency in the procurement "
           "process and non-discrimination among eligible bidders for procurement contracts.' "
           "JICA Annex I Note 2: 'Some Borrowers have attempted to broaden the interpretation of these "
           "items or to relax the criteria at the prequalification evaluation stage. However, this is "
           "not acceptable and instructions should be given so that the criteria specified in the "
           "prequalification documents are strictly followed, keeping in mind the non-discrimination "
           "principle and the importance of quality.'"),
    test="Notice requires that past experience be with a government or semi-government client.",
    severity="NOT_SCOREABLE_NO_BINDING_RULE_IN_CORPUS",
    limit=("Corrected during verification: an earlier draft of this catalogue recorded R16 as "
           "NOT_IN_CORPUS. A non-discrimination principle DOES exist in the corpus, but only in the "
           "JICA guidelines, which bind exactly 1 of 1,155 tenders - so the status is benchmark, not "
           "absence. No BINDING Bangladeshi non-discrimination or proportionality clause is in the "
           "corpus: a sweep of all 89 pages of e-PG3A returns zero hits for 'discriminat', "
           "'proportional', 'proportionate', 'equal treatment', 'restrict competition' and 'undue "
           "restriction', and the single hit for 'semi-government' (page 10) is in the definition of "
           "public funds, not a rule about who a bidder's past clients may be. ITT 13.1(b) lets the TDS "
           "set specific experience without restricting who the client may be. So a "
           "government-client-only requirement cannot be called a rule breach from this corpus, "
           "however much it narrows the field."),
  ),
  dict(
    code="R17", short="QUALIFICATION_CRITERIA_NOT_STATED_IN_NOTICE",
    clause="none",
    source_file="NONE_IN_CORPUS", pdf_page="NOT_AVAILABLE", printed_page="NOT_AVAILABLE",
    force="NO_RULE_TEXT_AVAILABLE", clause_certainty="NOT_IN_CORPUS",
    quote="NOT_AVAILABLE",
    test="Notice publishes no thresholds, only 'As per Tender Data Sheet', or the field is blank, or the portal refused access.",
    severity="NOT_SCOREABLE_NO_RULE_IN_CORPUS",
    limit=("What an Invitation for Tenders must itself contain is prescribed by the PPR, which is not "
           "in the corpus, and the Tender Data Sheet is inside the tender document that bidders buy - "
           "so 'As per TDS' may be perfectly lawful. This stays the strongest TRANSPARENCY finding in "
           "the investigation and the weakest RULE finding."),
  ),
  dict(
    code="R18", short="LARGE_PACKAGE_TENDERED_NATIONALLY_ONLY",
    clause="JICA Section 2.02 'Size of Contract'; World Bank Procurement Regulations para 6.14 as summarised in the Bank's own revision note to the 6th ed., Feb 2025",
    source_file=JICA, pdf_page="s.2.02", printed_page="s.2.02",
    force="BENCHMARK_ONLY", clause_certainty="BENCHMARK_ONLY_NON_BINDING",
    quote=("JICA 2.02: 'In the interests of the broadest possible competition, individual contracts "
           "for which bids are invited shall, whenever feasible, be of a size large enough to attract "
           "bids on an international basis.'"),
    test="Contract above BDT 250 million awarded under National Competitive Tendering.",
    severity="NOT_SCOREABLE_BENCHMARK_ONLY",
    limit=("Every tender in this corpus is NCT - 1,150 labelled NCT, 5 unavailable, none international. "
           "JICA binds 1 tender; the World Bank paragraph is available only as a summary in a 3-page "
           "change log and reaches only INTERNATIONAL procurement, which this corpus has none of. The "
           "BDT 250 million cut is mine, taken from the top band of Rule 123(9) because that figure at "
           "least exists in the corpus."),
  ),
]

RULE_BY_CODE = {r["code"]: r for r in RULES}
