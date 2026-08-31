#!/usr/bin/env python3
"""One row per tender: what rule was broken, on what trigger, and under whose law.

Three sources are joined and nothing is invented in between:

  * `dump_engine_flags.js`  — tool.html's own forensic findings, so a flag in
    this CSV is the same flag a reader sees in the published tool and the same
    flag `audit_ledger.json` carries a hand verdict against.
  * the 1,800 source PDFs  — App ID, money flow, dates and bid counts taken
    from the portal's own printed text (via `pdf_text_cache.json`, the same
    text the engine read), overlaid on `Procurement_Database.json` wherever the
    register is blank or truncated.
  * `eGP_Forensic_Engine/`  — the five rule documents. Every clause carried
    here was re-read from those PDFs; where the engine's clause number puts a
    figure in the wrong place, both the flagged form and the corrected form are
    printed, with a status saying which is which.

The CSV never asserts a violation. `Citation_Status` and `Binding` say how far
each mapping can actually be pushed, because three of the engine's highest
volume flags rest on rules whose text is not in the folder at all.

    python3 build_violations_csv.py           # writes egp_violations_by_tender.csv
"""
import collections
import csv
import json
import os
import re
import subprocess
import sys
from datetime import datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "egp_violations_by_tender.csv")
ENGINE_JSON = os.path.join(ROOT, "engine_flags.json")

sys.path.insert(0, ROOT)
import verify_pdfs as V                                            # noqa: E402

# The value bands in PPR 2025 Rule 123(9), quoted in the e-PG3A Tender Data
# Sheet against ITT 67.2. Contract value stands in for the estimate the
# record does not carry, which is itself the point of the NO_ESTIMATE flag.
SIGNING_BANDS = ((50_000_000, 14), (250_000_000, 21), (float("inf"), 28))
BO_FLOOR = 1_000_000            # Format e-PG3A-C Note 1: "above BDT 10.00 Lac"

BPPA = ("Bangladesh Public Procurement Authority (BPPA), IMED, Ministry of "
        "Planning, Govt of Bangladesh")
EPG = ("e-PG3A — Standard Tender Document (National), Procurement of Goods "
       "using Framework Agreement [OTM/LTM], Dec 2025 (cover: Preliminary "
       "working Draft)")
JICA_DOC = ("JICA Guidelines for Procurement under Japanese ODA Loans, "
            "Chapter 2 (PDF created 2009)")
WB_LOG = ("World Bank, Revisions of the Procurement Regulations for IPF "
          "Borrowers, Sixth Edition, Feb 2025 — 3-page revision note")
PORTAL = "Bangladesh e-GP portal record (eprocure.gov.bd) — own printed fields"

# Status vocabulary, used in the Citation_Status column:
#   VERBATIM_VERIFIED  clause number and text both re-read from a folder PDF
#   CORRECTED          clause exists but the engine put the figure in the wrong
#                      sub-clause; the corrected citation is given
#   SUMMARY_ONLY       requirement appears only in the Bank's own revision note,
#                      not as operative paragraph text
#   NOT_IN_FOLDER      no document in the folder carries this rule at all
#   TRIGGER_NOT_MET    the clause is real but its own precondition is not
#                      satisfied by this dataset, so the flag over-reaches
#
# Binding vocabulary:
#   BINDING_ANACHRONISM_RISK  e-PG3A is a Dec-2025 draft for Framework-Agreement
#                             Goods; these contracts ran 2014-2026, mostly works,
#                             under PPR 2008. Clause numbers may not match the
#                             STD that actually governed them.
#   BENCHMARK_ONLY            the funder's rules do not govern this contract
#   RECORD_OBLIGATION         a publication/disclosure duty on the portal itself
#   NO_LEGAL_BASIS_IN_FOLDER  cannot be argued from the documents to hand

CIT = {}

CIT["সীমিত প্রতিযোগিতা (একক বিডার)"] = dict(
    en="Single responsive tender — competition collapsed at evaluation",
    trigger_en="Tenders received > 1 but only 1 survived as responsive, i.e. "
               "rivals were eliminated at the evaluation stage rather than "
               "never having bid.",
    trigger_bn="একাধিক দর জমা পড়েছে কিন্তু গ্রহণযোগ্য থেকেছে মাত্র একটি — "
               "প্রতিযোগীরা মূল্যায়ন পর্যায়ে বাদ পড়েছে।",
    org=BPPA, doc=EPG,
    clause_flagged="PPR 2008 Rule 98",
    clause_verified="e-PG3A ITT Sub-Clause 56.2(b), p.24",
    status="CORRECTED",
    verbatim="56.2 All Tenders can be rejected, if — (b) there is evidence of "
             "lack of effective competition; such as non-participation by a "
             "number of potential Tenderers",
    binding="BINDING_ANACHRONISM_RISK",
    counter="ITT 44.4 'There shall be no requirement as to the minimum number "
            "of responsive Tenders'; ITT 56.3 tenders may not be rejected if "
            "the lowest evaluated price conforms to market price. 56.2 is "
            "permissive ('can be'), so the question is whether the TEC "
            "considered it and what the HOPE decided — not that a rule was "
            "automatically broken.",
)

CIT["প্রি-টেন্ডার মিটিং জালিয়াতি"] = dict(
    en="Pre-tender meeting called before bidders could read the documents",
    trigger_en="The pre-tender meeting was scheduled fewer than 7 days after "
               "the notice was published, so the meeting fell before any "
               "bidder could reasonably have studied the tender document.",
    trigger_bn="নোটিশ প্রকাশের ৭ দিনের মধ্যেই প্রি-টেন্ডার মিটিং ডাকা হয়েছে — "
               "দরপত্র দলিল পড়ে প্রশ্ন তৈরির সময়ই ছিল না।",
    org=BPPA, doc="Public Procurement Rules — rule number not established",
    clause_flagged="PPR 2008, 'Pre-Tender'",
    clause_verified="NOT ESTABLISHED. e-PG3A sets no minimum interval between "
                    "publication and the pre-tender meeting; the 7-day test is "
                    "the engine's own threshold, not a quoted rule. The PPR "
                    "provision, if any, is in a document not in this folder.",
    status="NOT_IN_FOLDER",
    verbatim="",
    binding="NO_LEGAL_BASIS_IN_FOLDER",
    counter="Highest-volume flag in the dataset (1,144 of 1,158). Publish as a "
            "documented pattern in the portal's own dates, not as a rule "
            "breach, until the governing PPR rule is obtained.",
)

CIT["বেআইনিভাবে স্বল্প দরপত্র সময়"] = dict(
    en="Bidding window under 14 days",
    trigger_en="Fewer than 14 days between publication and closing.",
    trigger_bn="প্রকাশ থেকে জমার শেষ দিন পর্যন্ত ১৪ দিনের কম সময়।",
    org=BPPA, doc="Public Procurement Rules — rule number not established",
    clause_flagged="PPR 2008, 'Bidding Time' (minimum 14 days)",
    clause_verified="NOT ESTABLISHED FROM FOLDER. The minimum advertisement "
                    "period (21/28/42 days in the PPR) is absent from e-PG3A; "
                    "it sits in the Rules themselves, which are not here.",
    status="NOT_IN_FOLDER",
    verbatim="",
    binding="NO_LEGAL_BASIS_IN_FOLDER",
    counter="Obtain the PPR advertisement-period rule before publishing a "
            "day-count breach. The dates themselves are the portal's own.",
)

CIT["স্বল্প দরপত্র সময় (সতর্কতা)"] = dict(
    en="Short bidding window (14-21 days) — warning only",
    trigger_en="Between 14 and 21 days between publication and closing: above "
               "the engine's hard floor but short for a works package.",
    trigger_bn="প্রকাশ থেকে জমা পর্যন্ত ১৪–২১ দিন — ন্যূনতমের উপরে, তবে পূর্ত "
               "কাজের জন্য কম।",
    org=BPPA, doc="Public Procurement Rules — rule number not established",
    clause_flagged="PPR 2008, 'Bidding Time'",
    clause_verified="NOT ESTABLISHED FROM FOLDER — same gap as above. A "
                    "sufficiency judgement, not a threshold in any quoted rule.",
    status="NOT_IN_FOLDER",
    verbatim="",
    binding="NO_LEGAL_BASIS_IN_FOLDER",
    counter="Context for the under-14-day cases, not a finding of its own.",
)

CIT["তরল সম্পদের শর্ত শিথিলকরণ"] = dict(
    en="Liquid-asset qualification set unusually low",
    trigger_en="The liquid-asset / working-capital figure printed in the "
               "eligibility block is small relative to the package, which "
               "lowers the financial bar a bidder has to clear.",
    trigger_bn="যোগ্যতার ঘরে লেখা তরল সম্পদ বা চলতি মূলধনের পরিমাণ প্যাকেজের "
               "তুলনায় কম — আর্থিক সক্ষমতার বাধা নামিয়ে দেওয়া হয়েছে।",
    org=BPPA, doc=EPG,
    clause_flagged="e-PG3A ITT 14.1 — 'minimum liquid asset requirement is "
                   "mandatory'",
    clause_verified="e-PG3A ITT Sub-Clause 14.1(b) read with the Tender Data "
                    "Sheet entry for ITT 14.1(b). 14.1(b) itself fixes no "
                    "amount — it requires liquid assets 'as specified in the "
                    "TDS'; the TDS prints '[state amount]' plus the band.",
    status="CORRECTED",
    verbatim="ITT 14.1(b): availability of minimum financial resources in any "
             "form or combination of forms of liquid assets or credit line(s) "
             "or working capital … of the amount as specified in the TDS. — "
             "TDS note: [the minimum value is recommended to be between 80 and "
             "100 percent of the estimated cost of the proposed supply]",
    binding="BINDING_ANACHRONISM_RISK",
    counter="The 80-100%-of-estimate band is the real test, and it cannot be "
            "run: Estimated_Cost is blank in all 1,158 records. So the honest "
            "claim is 'not testable', and this flag interlocks with the "
            "missing-estimate finding rather than standing alone.",
)

CIT["রিটেনশন মানি মওকুফ বা অস্বাভাবিক কম"] = dict(
    en="Retention money waived or set abnormally low",
    trigger_en="The retention-money figure in the document is zero or far "
               "below the standard rate, removing the contractor's financial "
               "exposure for defective work.",
    trigger_bn="নথিতে রিটেনশন মানি শূন্য বা প্রমিত হারের অনেক নিচে — ত্রুটিপূর্ণ "
               "কাজের জন্য ঠিকাদারের আর্থিক দায় কমে যায়।",
    org=BPPA, doc=EPG,
    clause_flagged="e-PG3A ITT 66.1 — 'PE shall deduct retention amount of 10%'",
    clause_verified="e-PG3A ITT Sub-Clause 66.1 read with the TDS entry for "
                    "ITT 66.1. ITT 66.1 sets the duty; the ten percent is in "
                    "the TDS, not in 66.1.",
    status="CORRECTED",
    verbatim="ITT 66.1: … the Procuring Entity shall deduct from the payment "
             "certificate, a retention amount at the percentage rate as "
             "mentioned in TDS. — TDS ITT 66.1: … a retention amount at the "
             "percentage rate of ten (10) percent … as Retention Money.",
    binding="BINDING_ANACHRONISM_RISK",
    counter="ITT 66.3 caps total contractual security at ten percent, so a low "
            "retention figure can be lawful where performance security is "
            "already at the cap. Check ITT 62.1 for the same contract first.",
)

CIT["গুরুত্বপূর্ণ তারিখ গোপন"] = dict(
    en="Publication or closing date absent from the record",
    trigger_en="The notice carries no publication date, no closing date, or "
               "neither — so the bidding window cannot be measured at all.",
    trigger_bn="নোটিশে প্রকাশের তারিখ, জমার তারিখ বা দুটোই নেই — দরপত্রের সময় "
               "মাপার উপায়ই থাকে না।",
    org=BPPA, doc=EPG,
    clause_flagged="Transparency / PPR 2008",
    clause_verified="e-PG3A ITT Sub-Clause 61.1, p.26, with Format e-PG3A-B "
                    "(which makes Date of Advertisement, No. of Tenders "
                    "Received, No. of Responsive Tenders and Name of "
                    "Responsive Tenderers mandatory fields)",
    status="CORRECTED",
    verbatim="61.1 Immediately, but no later than 24 hours, after issuing the "
             "Notification of Award, the Procuring Entity shall … publish the "
             "contract award details Format e-PG3A-B … Such information shall "
             "remain displayed … for at least twenty-eight (28) days.",
    binding="RECORD_OBLIGATION",
    counter="A blank field on a printed page can be a portal rendering fault "
            "rather than an unpublished date. Re-pull the notice from "
            "eprocure.gov.bd before writing that a date was withheld.",
)

CIT["নির্দিষ্ট ব্র্যান্ডের বাধ্যবাধকতা"] = dict(
    en="Brand-locked specification with no 'or equivalent'",
    trigger_en="The specification names a brand, catalogue number or single "
               "manufacturer and the document carries no 'or equivalent' "
               "wording, which shuts out competing products.",
    trigger_bn="স্পেসিফিকেশনে সরাসরি ব্র্যান্ড বা নির্দিষ্ট প্রস্তুতকারকের নাম, অথচ "
               "'or equivalent' শর্ত নেই — প্রতিযোগী পণ্য বাদ পড়ে যায়।",
    org="Japan International Cooperation Agency (JICA)", doc=JICA_DOC,
    clause_flagged="JICA Sec 4.07",
    clause_verified="JICA Guidelines Section 4.07 'Use of Brand Names', p.90 "
                    "— verified verbatim",
    status="VERBATIM_VERIFIED",
    verbatim="Specifications shall be based on performance capability and shall "
             "only specify brand names, catalogue numbers, or products of a "
             "specific manufacturer if either specific spare parts are required "
             "or it has been determined that a degree of standardization is "
             "necessary … the specifications shall permit offers of alternative "
             "goods which have similar characteristics and provide performance "
             "and quality at least equal to those specified.",
    binding="BENCHMARK_ONLY",
    counter="Only 1 of 1,158 tenders is JICA-funded, so JICA does not govern "
            "these contracts. Use it as the international standard the package "
            "would have had to meet, never as 'JICA violation'.",
)

CIT["আন্তর্জাতিক দরপত্রে স্বল্প সময় (JICA Violation)"] = dict(
    en="Bidding window under 45 days on a foreign-funded tender",
    trigger_en="Publication-to-closing was under 45 days on a tender whose "
               "source of funds is a development partner — too short for a "
               "foreign bidder to prepare.",
    trigger_bn="উন্নয়ন সহযোগীর অর্থে চলা দরপত্রে প্রকাশ থেকে জমা পর্যন্ত ৪৫ দিনের "
               "কম — বিদেশি দরদাতার প্রস্তুতির জন্য অসম্ভব।",
    org="Japan International Cooperation Agency (JICA)", doc=JICA_DOC,
    clause_flagged="JICA Sec 5.01",
    clause_verified="JICA Guidelines Section 5.01(1), p.105 — verified "
                    "verbatim. 5.01(2) adds 90 days for large civil works.",
    status="VERBATIM_VERIFIED",
    verbatim="(1) The time allowed for preparation and submission of bids shall "
             "be determined with due consideration of the particular "
             "circumstances of the project and the size and complexity of the "
             "contract. Generally, not less than 45 days shall be allowed for "
             "international bidding.",
    binding="BENCHMARK_ONLY",
    counter="Two separate over-reaches in the flag's own name. First, 5.01 "
            "governs INTERNATIONAL bidding and every tender here is national "
            "(NCT), so the 45 days never applied. Second, only 1 tender is "
            "JICA-funded. Drop the word 'Violation'; the usable form is that "
            "no window here would have satisfied an ICB timetable.",
)

CIT["Early Market Engagement নেই (WB)"] = dict(
    en="No early market engagement on a World Bank-funded tender",
    trigger_en="Source of funds names the World Bank and the value clears the "
               "USD-10m mark, but the record shows no early market engagement.",
    trigger_bn="অর্থের উৎসে বিশ্বব্যাংক এবং মূল্য ১ কোটি ডলারের উপরে, অথচ "
               "রেকর্ডে আর্লি মার্কেট এনগেজমেন্টের কোনো চিহ্ন নেই।",
    org="The World Bank / IBRD", doc=WB_LOG,
    clause_flagged="WB Regulations Para 4.4",
    clause_verified="Para 4.4 as SUMMARISED in the Bank's own revision note to "
                    "the 6th ed. (Feb 2025). The folder holds no operative "
                    "paragraph text — only this 3-page note.",
    status="TRIGGER_NOT_MET",
    verbatim="Para 4.4 added requiring all projects with international "
             "competitive procurement contracts estimated to cost more than 10 "
             "million USD to undertake Early Market Engagement for each such "
             "contract. The plan and approach to Early Market Engagement to be "
             "detailed in the PPSD;",
    binding="BENCHMARK_ONLY",
    counter="The paragraph bites only on INTERNATIONAL competitive procurement "
            "and this dataset contains none — so the flag fires on a condition "
            "Para 4.4 never reaches. Report the inversion instead: running "
            "these as NCT is what keeps Para 4.4, Para 5.50 and Para 6.14 "
            "('open international competitive procurement is the preferred "
            "approach for contracts of both high and substantial risk') out of "
            "reach. Feb 2025 also postdates most of these contracts.",
)

# ---------------------------------------------------------------- systemic
# Four conditions that hold across the whole register rather than tender by
# tender. The engine does not test for them because they are absences, and an
# absence looks identical in every row until you count how many rows share it.

CIT["মালিকানার তথ্য অনুপস্থিত"] = dict(
    en="Beneficial ownership not disclosed on a contract above the BDT 10 lakh floor",
    trigger_en="Contract awarded above BDT 10,00,000, yet no beneficial-ownership "
               "table appears in the contract-award notice and the register's "
               "Beneficial_Owner, Ownership_Percentage and Owner_Country fields "
               "are all empty. 561 of the 645 award notices sit above the floor; "
               "39 of those do print the table, so this counts the 522 that do "
               "not.",
    trigger_bn="১০ লাখ টাকার উপরে চুক্তি, অথচ চুক্তি-প্রদানের বিজ্ঞপ্তিতে প্রকৃত "
               "মালিকানার ছক নেই এবং রেজিস্টারে প্রকৃত মালিক, মালিকানার হার ও "
               "মালিকের দেশ — তিনটি ঘরই ফাঁকা। ৬৪৫টি বিজ্ঞপ্তির ৫৬১টি এই সীমার "
               "উপরে; তার ৩৯টিতে ছকটি আছে, বাকি ৫২২টিতে নেই।",
    org=BPPA, doc=EPG,
    clause_flagged="(not tested by the engine)",
    clause_verified="e-PG3A ITT Sub-Clause 5.14 (p.6) + ITT Sub-Clause 68.1 "
                    "(p.28) + Format e-PG3A-C Notes 1-2 and 4 (p.79)",
    status="VERBATIM_VERIFIED",
    verbatim="5.14 A Tenderer shall provide its/their Beneficial Ownership "
             "related information, as the specified in Form e-PG3A-2 … and "
             "declare their consent on publishing that information publicly "
             "following the signing of contract. || 68.1 The Procuring Entity "
             "shall also publish, on the BPPA website or web portal, the "
             "contract-related information together with details of the "
             "beneficial ownership of the successful Tenderer. This information "
             "shall be kept posted … for at least thirty (30) days. || Format "
             "e-PG3A-C Note 1: For any agreement above BDT 10.00 Lac, "
             "Information on Beneficial Ownership need to be provided.",
    binding="BINDING_ANACHRONISM_RISK",
    counter="Note 5 excuses State-Owned Enterprises, so check whether a winner "
            "is state-owned before naming it. The duty is split and that is the "
            "strength of this finding: 5.14 puts disclosure on the bidder, 68.1 "
            "puts publication on the procuring entity — neither can blame the "
            "e-GP software, and the 39 notices that do carry the table are the "
            "proof: the field works when someone fills it in.",
)

CIT["প্রাক্কলিত মূল্য রেকর্ডে নেই"] = dict(
    en="No engineer's estimate in the record — price benchmark impossible",
    trigger_en="Estimated_Cost is empty, so the winning price cannot be "
               "compared with the official estimate. True of all 1,158 records "
               "and of the APP lookup as well.",
    trigger_bn="প্রাক্কলিত মূল্যের ঘর ফাঁকা — বিজয়ী দর সরকারি প্রাক্কলনের সঙ্গে "
               "মেলানোর উপায় নেই। ১,১৫৮টি রেকর্ডেই একই।",
    org=BPPA, doc=EPG,
    clause_flagged="(not tested by the engine)",
    clause_verified="e-PG3A ITT Sub-Clause 56.2(a), p.24 — the test this "
                    "absence disables",
    status="VERBATIM_VERIFIED",
    verbatim="56.2 All Tenders can be rejected, if — (a) the price of the "
             "lowest evaluated Tender exceeds the official cost estimate, "
             "provided the estimate is realistic",
    binding="BINDING_ANACHRONISM_RISK",
    counter="ITT 44.5: 'There shall be no automatic exclusion of Tenders which "
            "are above or below the official estimate.' So the finding is that "
            "the most direct test of price manipulation cannot be run — write "
            "'impossible to verify', never 'violated'.",
)

CIT["বড় প্যাকেজ জাতীয় দরপত্রে সীমাবদ্ধ"] = dict(
    en="Large package confined to national tendering (no international competition)",
    trigger_en="Procurement_Type is NCT (or blank) on a contract large enough "
               "to have drawn international bidders. No tender in the register "
               "is marked ICT — 643 of 645 awards are NCT and 2 are blank.",
    trigger_bn="চুক্তির আকার আন্তর্জাতিক দরদাতা টানার মতো, তবু পদ্ধতি জাতীয় "
               "(NCT)। রেজিস্টারে একটিও ICT নেই — ৬৪৫টির ৬৪৩টি NCT, ২টি ফাঁকা।",
    org="Japan International Cooperation Agency (JICA) / The World Bank",
    doc=JICA_DOC + " ; " + WB_LOG,
    clause_flagged="(not tested by the engine)",
    clause_verified="JICA Section 2.02 'Size of Contract', p.74 (verbatim) + "
                    "World Bank Para 6.14 as summarised in the Bank's revision "
                    "note (summary only)",
    status="SUMMARY_ONLY",
    verbatim="JICA 2.02: In the interests of the broadest possible competition, "
             "individual contracts for which bids are invited shall, whenever "
             "feasible, be of a size large enough to attract bids on an "
             "international basis. || WB revision note: Para 6.14 updated to "
             "clarify that open international competitive procurement, is the "
             "preferred approach for contracts of both high and substantial "
             "risk;",
    binding="BENCHMARK_ONLY",
    counter="Neither rule governs a government-funded national tender, and the "
            "largest contract in the set (Spectra, BDT 881.2 cr) is funded "
            "'Government', not JICA. The sharp version is narrow and factual: a "
            "package of this size drew 2 bidders and was never opened to "
            "international competition. All 13 World Bank-funded tenders here "
            "also ran as NCT — that one is worth putting to the Bank directly.",
)

CIT["চুক্তি সইয়ের আইনি সময়সীমা অতিক্রম"] = dict(
    en="Contract signed after the legal deadline from Notification of Award",
    trigger_en="Days from NOA to signing exceed the limit in PPR 2025 Rule "
               "123(9) for that contract's value band (14 days up to BDT 5 cr, "
               "21 days BDT 5-25 cr, 28 days above BDT 25 cr), or the portal "
               "itself answered 'no' to its own on-time question.",
    trigger_bn="NOA থেকে সই পর্যন্ত সময় PPR 2025-এর বিধি ১২৩(৯)-এর সীমা ছাড়িয়েছে "
               "(৫ কোটির নিচে ১৪ দিন, ৫–২৫ কোটিতে ২১ দিন, ২৫ কোটির উপরে ২৮ দিন), "
               "অথবা পোর্টাল নিজেই 'না' লিখেছে।",
    org=BPPA, doc=EPG,
    clause_flagged="e-PG3A ITT 67.2 — 'within 28 days of NOA'",
    clause_verified="e-PG3A ITT Sub-Clause 67.2 (p.27) READ WITH the Tender "
                    "Data Sheet entry for ITT 67.2 (p.32), which cites Rule "
                    "123(9) of the PPR 2025; consequence in ITT 67.3 (p.27)",
    status="CORRECTED",
    verbatim="67.2 Within the timeline mentioned in the TDS from the issuance "
             "of the NOA but not later than the date specified therein … shall "
             "sign the contract. || TDS: within [mention number of days as per "
             "Rule 123(9) of the PPR 2025: 14/21/28] days … fourteen (14) days, "
             "where the estimated cost does not exceed BDT 50 million; "
             "twenty-one (21) days … BDT 50-250 million; twenty-eight (28) "
             "days, where the estimated cost exceeds BDT 250 million. || 67.3 "
             "Failure … to sign the Contract … shall constitute sufficient "
             "grounds for the annulment of the award and forfeiture of the "
             "Tender Security.",
    binding="BINDING_ANACHRONISM_RISK",
    counter="The 28 days is NOT in ITT 67.2 — it is one of three TDS bands, and "
            "only 24 of 645 awards clear BDT 25 cr. Also: the band keys off the "
            "ESTIMATED cost, which is blank everywhere, so contract value is "
            "used as a stand-in here and the band may be wrong in either "
            "direction. Always cite 'ITT 67.2 read with PPR 2025 Rule 123(9)'.",
)

# ---------------------------------------------------------------- data gaps
# Not rule breaches. Each one is a hole in the government's own record that
# stops a specific test from being run, which is why they are carried as their
# own rows instead of being silently dropped.

CIT["কার্যসম্পাদন জামানতের রেকর্ড নেই"] = dict(
    en="No record of whether performance security arrived on time",
    trigger_en="Contract awarded, but the portal's own "
               "'Was the Performance Security provided in due time?' field is "
               "blank in the register (all 645 awards).",
    trigger_bn="চুক্তি হয়েছে, কিন্তু পোর্টালের নিজের 'কার্যসম্পাদন জামানত সময়মতো "
               "দেওয়া হয়েছিল কি?' ঘরটি রেজিস্টারে ফাঁকা — ৬৪৫টিতেই।",
    org=BPPA, doc=EPG,
    clause_flagged="(not tested by the engine)",
    clause_verified="e-PG3A ITT Sub-Clause 63.2, p.27 (14-day deadline); "
                    "amount at ITT 62.1 read with its TDS entry (ten percent)",
    status="VERBATIM_VERIFIED",
    verbatim="63.2 Within fourteen (14) days from the date of receipt of the "
             "NOA, the successful Tenderer shall furnish the Performance "
             "Security for the due performance of the Contract in the amount as "
             "stated under ITT Sub Clauses 62.1 or 62.2.",
    binding="RECORD_OBLIGATION",
    counter="The field is blank in the REGISTER; many award PDFs do print a "
            "yes/no. Where the PDF answers, that answer is used instead and this "
            "flag is not raised. Treat a remaining blank as an unanswerable "
            "question, not as a missed deadline.",
)

CIT["চুক্তি-প্রদানের নথিই নেই"] = dict(
    en="Tender marked contract-awarded but no contract-award notice published",
    trigger_en="Tender_Status says the contract was awarded, yet no award PDF "
               "exists for this tender ID in Contract_Awards_PDFs.",
    trigger_bn="স্ট্যাটাসে লেখা চুক্তি সম্পাদিত, অথচ এই দরপত্র আইডির কোনো "
               "চুক্তি-প্রদান নোটিশ নেই।",
    org=BPPA, doc=EPG,
    clause_flagged="(not tested by the engine)",
    clause_verified="e-PG3A ITT Sub-Clause 61.1 (award details within 24 hours, "
                    "displayed at least 28 days) and ITT 68.1 (contract details "
                    "within 3 days, at least 30 days)",
    status="VERBATIM_VERIFIED",
    verbatim="61.1 Immediately, but no later than 24 hours, after issuing the "
             "Notification of Award, the Procuring Entity shall … publish the "
             "contract award details … || 68.1 Immediately, but no later than "
             "three (3) days after the signing of contract, the Procuring "
             "Entity shall publish the contract-related information …",
    binding="RECORD_OBLIGATION",
    counter="The collection was scraped at a point in time; a notice may have "
            "been published after the scrape, or the status may be stale. "
            "Re-check the tender ID on eprocure.gov.bd before publishing.",
)

CIT["দরপত্রের সংখ্যা রেকর্ডে নেই"] = dict(
    en="Bid counts missing from the award notice",
    trigger_en="An award notice that prints no 'Tenders Sold / Received / "
               "Responsive' figures, so competition cannot be measured for this "
               "contract. The portal's newer award template omits these fields "
               "entirely (54 of the 645 awards).",
    trigger_bn="চুক্তি-প্রদান নোটিশে কত দর বিক্রি/জমা/গ্রহণযোগ্য হয়েছে তার সংখ্যা "
               "নেই — এই চুক্তির প্রতিযোগিতা মাপা যায় না। পোর্টালের নতুন টেমপ্লেটে "
               "এই ঘরগুলো নেই (৬৪৫টির ৫৪টি)।",
    org=BPPA, doc=EPG,
    clause_flagged="(not tested by the engine)",
    clause_verified="Format e-PG3A-B, the mandatory award-reporting format "
                    "under ITT 61.1, requires Date of Advertisement, No. of "
                    "Tenders Received, No. of Responsive Tenders and Name of "
                    "Responsive Tenderers",
    status="VERBATIM_VERIFIED",
    verbatim="Format e-PG3A-B (fields): Date of Advertisement; No. of Tenders "
             "Received; No. of Responsive Tenders; Name of Responsive Tenderers.",
    binding="RECORD_OBLIGATION",
    counter="This is a template change by the portal, not a decision by any one "
            "procuring entity — attribute it to BPPA's form design. Note also "
            "that every competition ratio in this investigation is computed on "
            "the 591 awards that do print counts, not on all 645.",
)

CIT["ঠিকাদার বা চুক্তিমূল্যের ঘর ফাঁকা"] = dict(
    en="Winner name or contract value missing from an award notice",
    trigger_en="An award notice with no supplier name, or with a contract value "
               "of zero or blank — who was paid, or how much, is not on the "
               "record.",
    trigger_bn="চুক্তি-প্রদান নোটিশে ঠিকাদারের নাম নেই, বা চুক্তিমূল্য শূন্য/ফাঁকা — "
               "কে কত টাকা পেল তা রেকর্ডেই নেই।",
    org=BPPA, doc=EPG,
    clause_flagged="e-PG3A ITT 68.1 (engine's wording for its own variant of "
                   "this flag)",
    clause_verified="e-PG3A ITT Sub-Clause 68.1, p.28, with Format e-PG3A-C",
    status="VERBATIM_VERIFIED",
    verbatim="68.1 … the Procuring Entity shall publish the contract-related "
             "information, in the format prescribed in Format e-PG3A-C … "
             "together with details of the beneficial ownership of the "
             "successful Tenderer. This information shall be kept posted … for "
             "at least thirty (30) days.",
    binding="RECORD_OBLIGATION",
    counter="Check the PDF before asserting: the newer 'Economic Operator' "
            "template names the winner in a differently-labelled field, and a "
            "naive read of it produces a false blank.",
)

CIT["নথির পাঠ অসম্পূর্ণ বা পোর্টাল রেকর্ড দেয়নি"] = dict(
    en="Source document unreadable or withheld by the portal",
    trigger_en="The PDF for this tender is blank, truncated, or carries the "
               "portal's own refusal text ('not exists' / 'un-authorized'), so "
               "nothing in this row can be checked against a source document.",
    trigger_bn="এই দরপত্রের পিডিএফ ফাঁকা, অসম্পূর্ণ, বা পোর্টালের প্রত্যাখ্যান-বার্তা "
               "আছে — এই সারির কিছুই মূল নথির সঙ্গে মেলানো যায় না।",
    org=PORTAL, doc="Bangladesh e-GP portal print output",
    clause_flagged="(not tested by the engine)",
    clause_verified="Not a rule question — a limit on the evidence. Any figure "
                    "in this row comes from the register alone and is unverified.",
    status="NOT_IN_FOLDER",
    verbatim="",
    binding="NO_LEGAL_BASIS_IN_FOLDER",
    counter="These rows must be excluded from any count that is described as "
            "verified against source documents.",
)

# The engine defines these too. None fire on the present register, so they add
# no rows; they are mapped anyway so a re-tuned threshold cannot put an
# unlabelled citation into the CSV. (org, doc, flagged, verified, status)
_QUIET = {
    "অতিরিক্ত দলিল মূল্য": (
        "Tender document fee set high enough to deter small bidders",
        BPPA, EPG, "JICA / PPR Sec 4.01",
        "Not established from folder. e-PG3A fixes no document-price ceiling; "
        "JICA Section 4.01 does not carry this text either.", "NOT_IN_FOLDER"),
    "চুক্তি স্বাক্ষরে অস্বাভাবিক বিলম্ব": (
        "Unusually long gap between closing and contract signing",
        BPPA, EPG, "e-PG3A ITT 67.2 (28 days from NOA)",
        "e-PG3A ITT 67.2 read with the TDS entry citing PPR 2025 Rule 123(9) "
        "(14/21/28 days by value band); consequence at ITT 67.3. Note the "
        "engine measures from CLOSING, while the rule runs from NOA.",
        "CORRECTED"),
    "উচ্চ অগ্রিম প্রদান": (
        "Advance payment above the recommended ceiling",
        BPPA, EPG, "e-PG3A GCA 26.1 (max 10%)",
        "Clause number not re-verified in this pass — check before citing.",
        "NOT_IN_FOLDER"),
    "অগ্রিম প্রদানের শর্ত অস্পষ্ট": (
        "Advance payment mentioned but percentage withheld",
        BPPA, EPG, "PPR 2008, 'Advance Payment'",
        "Not established from folder.", "NOT_IN_FOLDER"),
    "গাণিতিক নিয়মে নিম্ন দর বাতিল (ALB)": (
        "Automatic rejection of low bids by formula",
        "The World Bank / JICA", JICA_DOC, "JICA/WB Sec 5.06 Note 7",
        "JICA Section 5.06 'Evaluation and Comparison of Bids' exists (p.110); "
        "the specific Note 7 wording was not re-verified in this pass.",
        "NOT_IN_FOLDER"),
    "ঠিকাদার বা চুক্তিমূল্য গোপন": (
        "Winner or contract value withheld",
        BPPA, EPG, "e-PG3A ITT 68.1",
        "e-PG3A ITT Sub-Clause 68.1, p.28 — verified verbatim.",
        "VERBATIM_VERIFIED"),
    "যৌথ উদ্যোগ (JVCA) নিষিদ্ধ": (
        "Joint ventures barred from bidding",
        BPPA, EPG, "PPR 2008, 'JVCA'",
        "Not established from folder.", "NOT_IN_FOLDER"),
    "অবাস্তব নির্মাণ সময়": (
        "Completion period implausibly short",
        BPPA, EPG, "PPR 2008, 'Schedule'",
        "Not established from folder.", "NOT_IN_FOLDER"),
    "লোকাল সিন্ডিকেট শর্ত": (
        "Eligibility restricted to local or same-agency experience",
        BPPA, EPG, "PPR 2008 Rule 48",
        "Not established from folder; the nearest verified provision is ITT "
        "56.2(b) on lack of effective competition.", "NOT_IN_FOLDER"),
    "ত্রুটি দায়বদ্ধতার মেয়াদ (DLP) মওকুফ": (
        "Defect liability period waived or cut",
        BPPA, EPG, "e-PG3A GCA 32.3",
        "Clause number not re-verified in this pass — check before citing.",
        "NOT_IN_FOLDER"),
    "কম পারফরম্যান্স সিকিউরিটি": (
        "Performance security below the standard rate",
        BPPA, EPG, "e-PG3A ITT 62.1 (10% of contract price)",
        "e-PG3A ITT Sub-Clause 62.1 read with its TDS entry — the ten percent "
        "is in the TDS, not in 62.1 itself.", "CORRECTED"),
    "Rated Criteria অনুপস্থিত (WB)": (
        "Rated Criteria not applied on a World Bank-funded tender",
        "The World Bank / IBRD", WB_LOG, "WB Regulations Para 5.50",
        "Para 5.50 as summarised in the Bank's revision note. Applies only to "
        "international competitive procurement using SPDs — no tender here is "
        "international, so the trigger is not met.", "TRIGGER_NOT_MET"),
    "ভুল Rated Criteria Weighting (WB)": (
        "Rated Criteria weighting outside the Bank's bands",
        "The World Bank / IBRD", WB_LOG, "WB Regulations Para 5.50",
        "Same as above: bands are 50-80 / 60-100 / 10-40 / 20-30 percent by "
        "risk and value, and none apply to national tendering.",
        "TRIGGER_NOT_MET"),
}
for _k, _v in _QUIET.items():
    CIT[_k] = dict(en=_v[0], trigger_en="", trigger_bn="", org=_v[1], doc=_v[2],
                   clause_flagged=_v[3], clause_verified=_v[4], status=_v[5],
                   verbatim="", binding="BINDING_ANACHRONISM_RISK", counter="")


# --------------------------------------------------------------------- load

def jload(name):
    with open(os.path.join(ROOT, name), encoding="utf-8") as fh:
        return json.load(fh)


def strip_html(s):
    """The engine's evidence strings carry the tool's highlight markup."""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s or "")).strip()


def clean(s):
    """Collapse whitespace and drop the portal's own placeholder blanks."""
    s = re.sub(r"\s+", " ", str(s or "")).strip()
    return "" if s.lower() in ("", "na", "n/a", "not applicable", "-", "nil") else s


def engine_flags():
    """Load the engine dump, regenerating it if it is missing or stale."""
    tool = os.path.join(ROOT, "tool.html")
    if (not os.path.exists(ENGINE_JSON)
            or os.path.getmtime(ENGINE_JSON) < os.path.getmtime(tool)):
        sys.stderr.write("running dump_engine_flags.js …\n")
        with open(ENGINE_JSON, "w", encoding="utf-8") as fh:
            subprocess.run(["node", "dump_engine_flags.js"], cwd=ROOT,
                           stdout=fh, check=True)
    return jload(os.path.basename(ENGINE_JSON))


def read_pdfs():
    """Cache basename -> parsed fields, split by which template the page used."""
    cache = jload("pdf_text_cache.json")
    notices, awards, broken = {}, {}, {}
    for name, text in cache.items():
        m = re.search(r"(\d{4,8})\.pdf$", name)
        if not m:
            continue
        tid = m.group(1)
        flat = " ".join((text or "").split())
        if len(flat) < 200:
            broken[tid] = ("portal refused the record"
                           if ("not exists" in flat or "un-authorized" in flat)
                           else "blank print (%d chars)" % len(flat))
            continue
        if re.match(r"^Tender_\d+\.pdf$", name):
            rec = V.parse(text, V.AWARD_FIELDS)
            if rec.get("supplier_eo") and not rec.get("supplier"):
                rec["supplier"] = re.split(r"\s*Company\s*Name\s*:",
                                           rec["supplier_eo"])[0]
                rec["_template"] = "economic-operator"
            else:
                rec["_template"] = "supplier"
            if rec.get("sup_loc_eo") and not rec.get("sup_loc"):
                rec["sup_loc"] = rec["sup_loc_eo"]
            rec["_file"] = name
            awards[tid] = rec
        else:
            rec = V.parse(text, V.NOTICE_FIELDS)
            rec["_file"] = name
            rec["_raw"] = text
            notices[tid] = rec
    return notices, awards, broken


def days(a, b):
    """Whole days from a to b, or None if either date is unreadable."""
    da, db = V.date(a), V.date(b)
    return (db - da).days if da and db else None


def signing_limit(value):
    """PPR 2025 Rule 123(9) band, keyed off value because the estimate the
    rule actually names is blank in every record."""
    if value is None:
        return None
    for cap, lim in SIGNING_BANDS:
        if value <= cap:
            return lim
    return None


def make_flag(key, evidence, extra_en="", extra_bn=""):
    """A flag row: the citation table entry plus this tender's own evidence."""
    c = CIT.get(key) or dict(
        en=key, trigger_en="", trigger_bn="", org="(unmapped)", doc="",
        clause_flagged="", clause_verified="NOT MAPPED — do not cite",
        status="NOT_IN_FOLDER", verbatim="", binding="NO_LEGAL_BASIS_IN_FOLDER",
        counter="")
    return dict(bn=key, en=c["en"],
                trigger_en=(c["trigger_en"] + (" " + extra_en if extra_en else "")).strip(),
                trigger_bn=(c["trigger_bn"] + (" " + extra_bn if extra_bn else "")).strip(),
                evidence=strip_html(evidence),
                org=c["org"], doc=c["doc"],
                clause_flagged=c["clause_flagged"],
                clause_verified=c["clause_verified"], status=c["status"],
                verbatim=c["verbatim"], binding=c["binding"],
                counter=c["counter"])


AWARDED = re.compile(r"contract\s*award", re.I)

# Three notice fields print their label BELOW the value, so the generic
# "Label : value" slicer in verify_pdfs cannot reach them.
PRE_START = re.compile(r"Pre\s*-?\s*Tender/Proposal\s*meeting\s*Start\s*"
                       r"(\d{1,2}-[A-Za-z]{3}-\d{4}(?:\s+[\d:]+)?)", re.I)
DOC_PRICE = re.compile(r"Document\s*Price\s*\(\s*In\s*([\d,]+)\s*BDT\s*\)", re.I)
SECURITY = re.compile(r"Tender/Proposal\s*Security\s*Valid\s*Up\s*to\s*:?\s*"
                      r"(\d{1,2}-[A-Za-z]{3}-\d{4})", re.I)


def notice_extras(raw):
    flat = " ".join((raw or "").split())
    m1, m2, m3 = PRE_START.search(flat), DOC_PRICE.search(flat), SECURITY.search(flat)
    return (m1.group(1) if m1 else "",
            V.num(m2.group(1)) if m2 else None,
            m3.group(1) if m3 else "")


def build():
    reg = jload("Procurement_Database.json")
    eng = engine_flags()
    ledger = jload("audit_ledger.json")["logs"]
    derived = jload("pdf_derived.json")
    notices, awards, broken = read_pdfs()

    verified = {str(r["id"]): r for r in derived["award_rows"]}
    docprice = derived["doc_price"]["by_tender"]
    pkg = {}
    with open(os.path.join(ROOT, "APP_package_lookup.csv"), encoding="utf-8") as fh:
        for r in csv.DictReader(fh):
            pkg[r["App_ID"]] = r

    total_value = sum(float(r["value"]) for r in derived["award_rows"]
                      if r.get("value"))
    rows = []
    for rec in reg:
        tid = clean(rec.get("Tender_Proposal_ID"))
        n = notices.get(tid, {})
        a = awards.get(tid, {})
        v = verified.get(tid, {})
        e = eng.get(tid, {})
        led = ledger.get(tid, {})

        def take(*vals):
            for x in vals:
                c = clean(x)
                if c:
                    return c
            return ""

        app_id = take(n.get("app_id"), rec.get("App_ID"))
        value = v.get("value")
        if value is None:
            value = V.num(a.get("value")) or V.num(rec.get("Contract_Value_BDT"))
        ptype = take(n.get("ptype"), rec.get("Procurement_Type"))
        status = take(n.get("status"), rec.get("Tender_Status"))
        # Two different facts, kept apart on purpose: whether a contract-award
        # notice exists to be read, and whether the register merely says one
        # should. Conflating them makes a missing document look like a blank
        # field, and inflates every award-side count by the 59 tenders that
        # have no award notice at all.
        has_award_doc = bool(v or a)
        says_awarded = bool(AWARDED.search(status))
        is_award = has_award_doc

        sold = v.get("sold", V.num(a.get("sold")))
        recvd = v.get("recv", V.num(a.get("received")))
        resp = v.get("resp", V.num(a.get("responsive")))
        noa = take(v.get("noa"), a.get("noa"), rec.get("Notification_of_Award_Date"))
        sign = take(v.get("sign"), a.get("signed"), rec.get("Contract_Signing_Date"))
        pub = take(n.get("published"), rec.get("Advertised_Date"),
                   a.get("advertised"))
        close = take(n.get("closing"), rec.get("Closing_Date"))
        pre_pdf, price_pdf, sec_valid = notice_extras(n.get("_raw"))
        pre = take(pre_pdf, rec.get("Pre_Tender_Meeting_Start"))
        limit = signing_limit(value) if is_award else None
        gap = days(noa, sign)
        over = (gap - limit) if (gap is not None and limit is not None) else None
        perf = take(a.get("perf_sec"), rec.get("Performance_Security_Provided_On_Time"))
        ontime = take(a.get("signed_ontime"), rec.get("Contract_Signed_On_Time"))
        supplier = take(v.get("sup"), a.get("supplier"), rec.get("Supplier_Name"))
        rows.append(dict(rec=rec, tid=tid, n=n, a=a, v=v, e=e, led=led,
                         app_id=app_id, value=value, ptype=ptype, status=status,
                         is_award=is_award, says_awarded=says_awarded,
                         sold=sold, recvd=recvd, resp=resp,
                         noa=noa, sign=sign, pub=pub, close=close, pre=pre,
                         limit=limit, gap=gap, over=over, perf=perf,
                         ontime=ontime, supplier=supplier, bo=a.get("bo_info"),
                         broken=broken.get(tid),
                         pkg=pkg.get(app_id, {}),
                         docprice=(docprice.get(tid) or price_pdf
                                   or V.num(rec.get("Document_Price_BDT"))),
                         sec_valid=sec_valid, total_value=total_value))
    return rows


# "Contracts estimated to cost at or above 10 million USD are deemed high
# value" — World Bank revision note, Para 5.50. Converted at a flat, stated
# 120 BDT/USD so the threshold in this column can be audited and re-run at
# another rate; no period-specific rate is claimed.
USD = 120
HIGH_VALUE = 10_000_000 * USD


def detect(r):
    """Every flag on one tender, engine flags first so the indices still line
    up with audit_ledger.json, then the register-wide gaps."""
    out = []
    for f in (r["e"].get("findings") or []):
        out.append(make_flag(f["flag"], f.get("evidence", "")))
    n_engine = len(out)

    if r["broken"]:
        out.append(make_flag("নথির পাঠ অসম্পূর্ণ বা পোর্টাল রেকর্ড দেয়নি",
                             "%s: %s" % (r["rec"].get("Source_File", ""), r["broken"])))

    if not clean(r["rec"].get("Estimated_Cost")):
        out.append(make_flag("প্রাক্কলিত মূল্য রেকর্ডে নেই",
                             "Estimated_Cost: blank"))

    if r["is_award"]:
        val = r["value"]
        # The register's own Beneficial_Owner field is blank in all 1,158 rows,
        # so testing it alone flags every contract above the floor. 39 award
        # notices do print the ownership table; read the notice, not the field,
        # or the count becomes the population instead of the violation.
        bo = clean(r["bo"]) or clean(r["rec"].get("Beneficial_Owner"))
        if val and val > BO_FLOOR and not bo:
            out.append(make_flag(
                "মালিকানার তথ্য অনুপস্থিত",
                "Contract BDT %s to %s | no beneficial-ownership table in the "
                "award notice and Beneficial_Owner blank in the register"
                % (f"{val:,.0f}", r["supplier"] or "(no name on record)"),
                extra_en="Here the contract is %.1f times the BDT 10 lakh floor. "
                         "39 of the 561 notices above the floor do carry the "
                         "table, so the field is operable and its absence here "
                         "is a choice, not a portal limitation."
                         % (val / BO_FLOOR)))
        if val and val >= HIGH_VALUE and (r["ptype"] or "").upper() != "ICT":
            out.append(make_flag(
                "বড় প্যাকেজ জাতীয় দরপত্রে সীমাবদ্ধ",
                "Value BDT %s (~USD %.1fm at %d BDT/USD) | Type: %s | "
                "Bidders received: %s"
                % (f"{val:,.0f}", val / USD / 1e6, USD, r["ptype"] or "blank",
                   "?" if r["recvd"] is None else int(r["recvd"]))))
        if (r["over"] is not None and r["over"] > 0) or r["ontime"].lower() == "no":
            out.append(make_flag(
                "চুক্তি সইয়ের আইনি সময়সীমা অতিক্রম",
                "NOA %s -> signed %s = %s days | band limit %s days | "
                "portal's own answer to 'Was the Contract Singed in due time?': %s"
                % (r["noa"] or "?", r["sign"] or "?",
                   "?" if r["gap"] is None else r["gap"],
                   r["limit"] or "?", r["ontime"] or "blank"),
                extra_en=("Over the band limit by %d days." % r["over"])
                         if (r["over"] or 0) > 0 else
                         "Within the band, but the portal itself answered 'no'."))
        if not r["perf"]:
            out.append(make_flag("কার্যসম্পাদন জামানতের রেকর্ড নেই",
                                 "Performance security on time: blank"))
        if r["recvd"] is None or r["resp"] is None:
            out.append(make_flag(
                "দরপত্রের সংখ্যা রেকর্ডে নেই",
                "Sold: %s | Received: %s | Responsive: %s | award template: %s"
                % tuple(["blank" if x is None else int(x)
                         for x in (r["sold"], r["recvd"], r["resp"])]
                        + [r["a"].get("_template", "?")])))
        if not r["supplier"] or not r["value"]:
            out.append(make_flag(
                "ঠিকাদার বা চুক্তিমূল্যের ঘর ফাঁকা",
                "Supplier: %s | Value: %s"
                % (r["supplier"] or "blank",
                   "blank" if not r["value"] else f"{r['value']:,.0f}")))
    elif r["says_awarded"]:
        out.append(make_flag(
            "চুক্তি-প্রদানের নথিই নেই",
            "Status: %s | no contract-award notice PDF exists for tender %s, so "
            "supplier, contract value, bid counts, performance security and the "
            "signing date are all untestable" % (r["status"], r["tid"])))
    return out, n_engine


SEP = " || "          # list separator inside a cell; "|" alone appears in evidence


def joined(flags, key):
    """Parallel numbered list, so [2] in one column is [2] in every other."""
    return SEP.join("[%d] %s" % (i + 1, (f.get(key) or "-").replace(SEP, " / "))
                    for i, f in enumerate(flags))


COLUMNS = [
    "Tender_ID", "App_ID", "Ministry_Division", "Agency", "Procuring_Entity",
    "PE_District", "Invitation_Reference", "Package_No", "Package_Description",
    "Procurement_Nature", "Procurement_Type", "Procurement_Method",
    "Tender_Status", "Notice_PDF", "Award_PDF", "Award_Template",
    "Source_Text_Status",
    "Estimated_Cost_BDT", "Contract_Value_BDT", "Contract_Value_Crore",
    "Share_of_All_Award_Value_pct", "Tender_Security_BDT",
    "Tender_Security_Valid_Upto", "Document_Price_BDT", "Budget_Type",
    "Source_of_Funds", "Development_Partner", "Project_Name", "Supplier_Name",
    "Supplier_Location", "Beneficial_Owner", "Contract_No", "APP_Package_No",
    "APP_Tenders_In_Package", "APP_Contracts_Awarded",
    "APP_Package_Value_Total_BDT", "APP_Distinct_Suppliers",
    "Tenders_Sold", "Tenders_Received", "Tenders_Responsive",
    "Eliminated_At_Evaluation",
    "Advertised_Or_Published", "Pre_Tender_Meeting_Start", "Closing_Date",
    "Bidding_Window_Days", "NOA_Date", "Contract_Signing_Date",
    "Days_NOA_To_Signing", "Legal_Signing_Limit_Days", "Days_Over_Legal_Limit",
    "Portal_Says_Signed_On_Time", "Portal_Says_Perf_Security_On_Time",
    "Risk_Level_Engine", "Risk_Score_Engine", "Flags_Total", "Flags_From_Engine",
    "Flags_Added_Systemic_Or_Gap", "Audit_Status",
    "Audit_Confirmed_In_Document", "Audit_Not_Established",
    "Rules_Broken_BN", "Rules_Broken_EN", "Why_Flagged_Condition_EN",
    "Why_Flagged_Condition_BN", "Evidence_From_Document", "Rule_Organisation",
    "Rule_Document", "Clause_As_Flagged", "Clause_Verified", "Citation_Status",
    "Binding_Status", "Verbatim_Rule_Text", "Counter_Argument",
    "Flags_Detail_Numbered",
]


def emit(rows):
    tally = collections.Counter()
    status_tally = collections.Counter()
    written = 0
    with open(OUT, "w", encoding="utf-8-sig", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=COLUMNS, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            rec, n, a, v, e, led, p = (r["rec"], r["n"], r["a"], r["v"],
                                       r["e"], r["led"], r["pkg"])
            flags, n_engine = detect(r)
            for f in flags:
                tally[f["en"]] += 1
                status_tally[f["status"]] += 1
            fs = (led.get("flagStatuses") or {})
            notok = sum(1 for x in fs.values() if x == "NOT_OK")
            detail = SEP.join(
                "[%d] %s / %s — trigger: %s — evidence: %s — %s, %s "
                "(as flagged: %s) — citation: %s; %s"
                % (i + 1, f["en"], f["bn"], f["trigger_en"] or "-",
                   f["evidence"] or "-", f["org"], f["clause_verified"],
                   f["clause_flagged"] or "-", f["status"], f["binding"])
                for i, f in enumerate(flags))
            val = r["value"]
            row = {
                "Tender_ID": r["tid"], "App_ID": r["app_id"],
                "Ministry_Division": clean(rec.get("Ministry_Division")),
                "Agency": clean(v.get("org") or rec.get("Organization_Agency")),
                "Procuring_Entity": clean(v.get("pe") or a.get("pe")
                                          or n.get("pe")
                                          or rec.get("Procuring_Entity_Name")),
                "PE_District": clean(v.get("district")
                                     or rec.get("Procurement_Entity_District")),
                "Invitation_Reference": clean(n.get("ref")
                                              or rec.get("Invitation_Reference")),
                "Package_No": clean(a.get("pkg_no") or p.get("Package_No")),
                "Package_Description": clean(a.get("pkg_name") or n.get("pkg")
                                             or rec.get("Brief_Description_of_Works"))[:400],
                "Procurement_Nature": clean(n.get("nature")
                                            or rec.get("Procurement_Nature")),
                "Procurement_Type": r["ptype"],
                "Procurement_Method": clean(n.get("method")
                                            or rec.get("Procurement_Method")),
                "Tender_Status": r["status"],
                "Notice_PDF": n.get("_file", ""), "Award_PDF": a.get("_file", ""),
                "Award_Template": a.get("_template", ""),
                "Source_Text_Status": r["broken"] or ("read" if n or a else "no PDF"),
            }
            row.update({
                "Estimated_Cost_BDT": clean(rec.get("Estimated_Cost")),
                "Contract_Value_BDT": "" if val is None else "%.2f" % val,
                "Contract_Value_Crore": "" if val is None else "%.4f" % (val / 1e7),
                "Share_of_All_Award_Value_pct":
                    "" if not val else "%.4f" % (100.0 * val / r["total_value"]),
                "Tender_Security_BDT": clean(rec.get("Lot_Security_BDT")),
                "Tender_Security_Valid_Upto": r["sec_valid"]
                    or clean(rec.get("Security_Valid_Up_To")),
                "Document_Price_BDT": "" if r["docprice"] is None
                    else "%.0f" % r["docprice"],
                "Budget_Type": clean(n.get("budget") or rec.get("Budget_Type")),
                "Source_of_Funds": clean(n.get("funds") or a.get("funds")
                                         or rec.get("Source_of_Fund")),
                "Development_Partner": clean(a.get("partner")
                                             or rec.get("Development_Partner")),
                "Project_Name": clean(a.get("project") or n.get("project")
                                      or rec.get("Project_Name")),
                "Supplier_Name": r["supplier"],
                "Supplier_Location": clean(a.get("sup_loc")
                                           or rec.get("Business_Address")),
                "Beneficial_Owner": clean(rec.get("Beneficial_Owner")
                                          or a.get("bo_info")),
                "Contract_No": clean(a.get("contract_no") or rec.get("Contract_No")),
                "APP_Package_No": clean(p.get("Package_No")),
                "APP_Tenders_In_Package": clean(p.get("Tenders_In_Package")),
                "APP_Contracts_Awarded": clean(p.get("Contracts_Awarded")),
                "APP_Package_Value_Total_BDT": clean(p.get("Contract_Value_Total_BDT")),
                "APP_Distinct_Suppliers": clean(p.get("Distinct_Suppliers")),
                "Tenders_Sold": "" if r["sold"] is None else int(r["sold"]),
                "Tenders_Received": "" if r["recvd"] is None else int(r["recvd"]),
                "Tenders_Responsive": "" if r["resp"] is None else int(r["resp"]),
                "Eliminated_At_Evaluation":
                    "" if (r["recvd"] is None or r["resp"] is None)
                    else int(r["recvd"] - r["resp"]),
                "Advertised_Or_Published": r["pub"],
                "Pre_Tender_Meeting_Start": r["pre"],
                "Closing_Date": r["close"],
                "Bidding_Window_Days": "" if days(r["pub"], r["close"]) is None
                    else days(r["pub"], r["close"]),
                "NOA_Date": r["noa"], "Contract_Signing_Date": r["sign"],
                "Days_NOA_To_Signing": "" if r["gap"] is None else r["gap"],
                "Legal_Signing_Limit_Days": r["limit"] or "",
                "Days_Over_Legal_Limit": "" if r["over"] is None else r["over"],
                "Portal_Says_Signed_On_Time": r["ontime"],
                "Portal_Says_Perf_Security_On_Time": r["perf"],
            })
            row.update({
                "Risk_Level_Engine": e.get("risk_level", ""),
                "Risk_Score_Engine": e.get("risk_score", ""),
                "Flags_Total": len(flags),
                "Flags_From_Engine": n_engine,
                "Flags_Added_Systemic_Or_Gap": len(flags) - n_engine,
                "Audit_Status": clean(led.get("status")),
                "Audit_Confirmed_In_Document": notok,
                "Audit_Not_Established": len(fs) - notok,
                "Rules_Broken_BN": joined(flags, "bn"),
                "Rules_Broken_EN": joined(flags, "en"),
                "Why_Flagged_Condition_EN": joined(flags, "trigger_en"),
                "Why_Flagged_Condition_BN": joined(flags, "trigger_bn"),
                "Evidence_From_Document": joined(flags, "evidence"),
                "Rule_Organisation": joined(flags, "org"),
                "Rule_Document": joined(flags, "doc"),
                "Clause_As_Flagged": joined(flags, "clause_flagged"),
                "Clause_Verified": joined(flags, "clause_verified"),
                "Citation_Status": joined(flags, "status"),
                "Binding_Status": joined(flags, "binding"),
                "Verbatim_Rule_Text": joined(flags, "verbatim"),
                "Counter_Argument": joined(flags, "counter"),
                "Flags_Detail_Numbered": detail,
            })
            w.writerow(row)
            written += 1
    return written, tally, status_tally


def main():
    rows = build()
    written, tally, status_tally = emit(rows)
    print("rows written      : %d  ->  %s" % (written, os.path.basename(OUT)))
    print("columns           : %d" % len(COLUMNS))
    print("flag rows in total: %d" % sum(tally.values()))
    print("\nflags by rule:")
    for k, n in tally.most_common():
        print("  %5d  %s" % (n, k))
    print("\ncitation status of those flag entries:")
    for k, n in status_tally.most_common():
        print("  %5d  %s" % (n, k))
    awards = [r for r in rows if r["is_award"]]
    val = sum(r["value"] for r in awards if r["value"])
    resp_known = [r for r in awards if r["resp"] is not None]

    # Every line here is checked against a figure verified earlier from the raw
    # PDFs and the register, so a change to a threshold or a regex shows up as a
    # MISMATCH instead of quietly moving a published number.
    checks = [
        ("tenders in the register", len(rows), 1158),
        ("contract-award notices read", len(awards), 645),
        ("award value, BDT crore", round(val / 1e7, 1), 3723.7),
        ("awards with bid counts printed", len(resp_known), 591),
        ("single responsive tender",
         sum(1 for r in resp_known if r["resp"] == 1), 201),
        ("portal's own 'signed late' answer",
         sum(1 for r in awards if r["ontime"].lower() == "no"), 52),
        ("records carrying an engineer's estimate",
         sum(1 for r in rows if clean(r["rec"].get("Estimated_Cost"))), 0),
        ("international competitive tenders",
         sum(1 for r in rows if (r["ptype"] or "").upper() == "ICT"), 0),
        # 561 is the population above the floor, not the violation count: 39 of
        # those notices do print the ownership table. Reading only the register's
        # always-blank field conflated the two.
        ("award notices above the BDT 10 lakh floor",
         sum(1 for r in awards
             if (r["value"] or 0) > BO_FLOOR), 561),
        ("of those, ownership actually undisclosed",
         tally.get(CIT["মালিকানার তথ্য অনুপস্থিত"]["en"], 0), 522),
    ]
    print("\nreconciliation against the figures verified from source:")
    bad = 0
    for label, got, want in checks:
        ok = got == want
        bad += not ok
        print("  %-50s %10s  expected %-8s %s"
              % (label, got, want, "OK" if ok else "<-- MISMATCH"))

    # Not a check: these two answer different questions and must not be read as
    # one number. The band in PPR 2025 Rule 123(9) is keyed to the estimated
    # cost, which is blank in all 1,158 records, so contract value stands in for
    # it; the portal's own yes/no is a separate, narrower admission.
    print("\n  derived, no baseline to check against:")
    print("    %-48s %10d" % ("over the Rule 123(9) band (value as proxy)",
                              sum(1 for r in awards if (r["over"] or 0) > 0)))
    print("    %-48s %10d" % ("status says awarded, no notice published",
                              sum(1 for r in rows
                                  if r["says_awarded"] and not r["is_award"])))
    print("\n%s" % ("all reconciliation lines match" if not bad
                    else "%d line(s) do not match — do not publish yet" % bad))


if __name__ == "__main__":
    main()

