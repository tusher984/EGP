# -*- coding: utf-8 -*-
"""
The Bengali half of the rule vocabulary, plus the normalising sentence builder.

Two decisions govern everything in this file.

First, only the *narrative* is translated. rule_text_verbatim, the clause quotes
and every evidence_excerpt stay in the English the PDFs print, because they are
evidence and a translated quote is no longer a quote. What gets Bengali is the
sentence that says what the rule requires and what the document does instead.

Second, every number stays in ASCII digits in both languages - contract values,
day counts, percentages, page numbers, clause numbers, tender ids and file names.
A reader can then hold the Bengali cell, the English cell and the PDF side by
side and diff them. Bengali numerals belong in the published copy, not in an
evidence file.

The terminology follows Bangladeshi government procurement usage: ক্রয়কারী সংস্থা
for procuring entity, দরপত্রদাতা for tenderer, প্রকৃত মালিকানা for beneficial
ownership, দরপত্র জামানত for tender security, উন্মুক্ত দরপত্র পদ্ধতি for the open
method. Where the standard document's own English is the point of the finding -
"Manufacturer's Authorization is not required" - the English is kept inside the
Bengali sentence rather than paraphrased away.
"""
import re

# ---------------------------------------------------------------- rule names

NAME_BN = {
    "R01": "বিজয়ী প্রতিষ্ঠানের প্রকৃত মালিকানা প্রকাশ করা হয়নি",
    "R02": "আইনি সময়সীমার বাইরে চুক্তি সই",
    "R03": "উন্মুক্ত দরপত্রে তালিকাভুক্তির পূর্বশর্ত",
    "R04": "‘চুক্তি প্রদান করা হয়েছে’ দেখানো সত্ত্বেও চুক্তি প্রদানের বিজ্ঞপ্তি নেই",
    "R05": "নিজস্ব নির্দিষ্ট দর-সীমা দিয়ে দরপত্র স্বয়ংক্রিয়ভাবে বাতিলের শর্ত",
    "R06": "সুপারিশকৃত সীমার বেশি পূর্ব-অভিজ্ঞতার শর্ত",
    "R07": "সুপারিশকৃত সীমার বেশি আর্থিক সামর্থ্যের শর্ত",
    "R08": "3 শতাংশ সীমার বেশি দরপত্র জামানত",
    "R09": "পণ্য ক্রয়ে প্রস্তুতকারকের অনুমোদনপত্রের শর্ত",
    "R10": "প্রকৃত প্রতিযোগিতার অভাব সত্ত্বেও ব্যবস্থা নেওয়া হয়নি",
    "R11": "একটিমাত্র গ্রহণযোগ্য দরপত্র: বিধির বাধ্যতামূলক পরীক্ষা যাচাই করা যায়নি",
    "R12": "কার্যসম্পাদন জামানত জমা দেওয়ার সময়",
    "R13": "সময়সীমা না বাড়িয়ে দরপত্র দলিলে সংশোধনী",
    "R14": "সর্বনিম্ন দর বনাম সরকারি প্রাক্কলিত মূল্য",
    "R15": "‘বা সমতুল্য’ শব্দ ছাড়া ব্র্যান্ডের নাম",
    "R16": "কেবল সরকারি প্রতিষ্ঠানের কাজের অভিজ্ঞতার শর্ত",
    "R17": "বিজ্ঞপ্তিতে যোগ্যতার শর্ত উল্লেখ নেই",
    "R18": "বড় প্যাকেজ কেবল জাতীয় পর্যায়ে আহ্বান",
}

# ------------------------------------------------- what the rule requires, BN
# Constant for every rule except R02, whose band depends on the contract value.

REQUIRES_BN = {
    "R01": ("10.00 লক্ষ টাকার বেশি মূল্যের প্রতিটি চুক্তির ক্ষেত্রে বিজয়ী প্রতিষ্ঠানের প্রকৃত "
            "মালিকানার তথ্য চুক্তি প্রদানের বিজ্ঞপ্তিতে প্রকাশ করতে হবে; দরপত্রদাতা নিজেই এ তথ্য "
            "দেবে এবং প্রকাশে সম্মতি দেবে"),
    "R03": ("দরপত্র দলিল বিক্রয়ের ক্ষেত্রে কোনো পূর্বশর্ত আরোপ করা যাবে না, এবং তালিকাভুক্তির "
            "শর্ত কেবল সীমিত দরপত্র পদ্ধতিতে (LTM) প্রযোজ্য"),
    "R04": ("চুক্তি প্রদানের তথ্য 24 ঘণ্টার মধ্যে প্রকাশ করে 28 দিন প্রদর্শন করতে হবে, এবং "
            "চুক্তির বিবরণ 3 দিনের মধ্যে প্রকাশ করে 30 দিন রাখতে হবে"),
    "R05": ("ITT 50.3 অনুযায়ী গ্রহণযোগ্যতার নিম্নসীমা গণনা করে বের করতে হবে [x-Sd], আর "
            "ITT 50.6 অনুযায়ী সরকারি প্রাক্কলিত মূল্যের চেয়ে 20 শতাংশ কম দর হলে ব্যাখ্যা চাইতে "
            "হবে — কোনো নির্দিষ্ট শতাংশে স্বয়ংক্রিয় বাতিলের বিধান নেই"),
    "R06": "আদর্শ দরপত্র দলিলের সুপারিশ: প্রাক্কলিত ব্যয়ের 0.60-0.80 গুণ",
    "R07": "আদর্শ দরপত্র দলিলের সুপারিশ: প্রাক্কলিত ব্যয়ের 0.80-1.00 গুণ",
    "R08": "দরপত্র জামানত সরকারি প্রাক্কলিত ব্যয়ের 3 শতাংশের বেশি হবে না",
    "R09": ("TDS-এর নিজস্ব ডিফল্ট হলো ‘Manufacturer's Authorization is not required’; "
            "বাজারে সহজলভ্য প্রস্তুত পণ্যের ক্ষেত্রে সাধারণত এ অনুমোদনপত্র লাগে না"),
}

BAND_BN = {
    "up to BDT 50 million": "5 কোটি টাকা পর্যন্ত মূল্যের চুক্তি",
    "BDT 50-250 million": "5 থেকে 25 কোটি টাকা মূল্যের চুক্তি",
    "above BDT 250 million": "25 কোটি টাকার বেশি মূল্যের চুক্তি",
}
PROXY_BN = ("প্রাক্কলিত মূল্য কোথাও প্রকাশিত না থাকায় চুক্তিমূল্যকে তার বিকল্প হিসেবে ধরা হয়েছে")


def requires_bn(code, en):
    """Bengali for what_the_rule_requires, carrying the row's own numbers."""
    if code == "R02":
        m = re.match(r"(\d+) days \((.+?), by awarded value", en or "")
        if m:
            band = BAND_BN.get(m.group(2), m.group(2))
            return ("কার্যাদেশ (NOA) দেওয়ার তারিখ থেকে সর্বোচ্চ %s দিনের মধ্যে চুক্তি সই করতে হবে "
                    "(%s; %s)" % (m.group(1), band, PROXY_BN))
    return REQUIRES_BN.get(code, "")


# --------------------------------------------- what the document shows, BN

def shows_bn(code, en):
    """Bengali for what_the_document_shows, carrying the row's own numbers."""
    en = en or ""
    if code == "R01":
        return ("বিজ্ঞপ্তিতে কোনো প্রকৃত মালিকানার তালিকা ছাপা হয়নি; সরবরাহকারীর নামের সারি আর "
                "ঠিকানার সারি পরপর বসানো, মাঝখানে কিছু নেই")
    if code == "R02":
        m = re.match(r"(\d+) days", en)
        if m:
            return ("কার্যাদেশ থেকে চুক্তি সই পর্যন্ত সময় লেগেছে %s দিন" % m.group(1))
    if code == "R03":
        return ("বিজ্ঞপ্তিতে ক্রয়কারী সংস্থার সঙ্গে তালিকাভুক্তি অংশগ্রহণের শর্ত করা হয়েছে, অথচ "
                "ক্রয় পদ্ধতি ঘোষণা করা হয়েছে উন্মুক্ত দরপত্র পদ্ধতি (OTM)")
    if code == "R04":
        m = re.match(r"status '(.+?)' but", en)
        st = m.group(1) if m else "Contract Awarded"
        return ("পোর্টালে অবস্থা ‘%s’ দেখানো হলেও পোর্টালের প্রিন্টে চুক্তি প্রদানের কোনো বিজ্ঞপ্তি "
                "নেই — ফলে সরবরাহকারীর নাম, দর, দরপত্রের সংখ্যা ও তারিখ কিছুই প্রকাশিত হয়নি" % st)
    if code == "R05":
        return ("বিজ্ঞপ্তি নিজেই প্রাক্কলিত ব্যয়ের চারপাশে একটি নির্দিষ্ট শতাংশ সীমা বেঁধে দিয়েছে "
                "এবং সেই সীমার বাইরের দরকে স্বয়ংক্রিয়ভাবে অগ্রহণযোগ্য (non-responsive) ঘোষণা "
                "করেছে — যে প্রাক্কলিত মূল্য ওই একই বিজ্ঞপ্তিতে প্রকাশ করা হয়নি")
    if code in ("R06", "R07"):
        m = re.search(r"=\s*([\d.]+)x", en)
        if m:
            what = ("পূর্বে সম্পন্ন একক কাজের ন্যূনতম মূল্য" if code == "R06"
                    else "তরল সম্পদ বা চলতি মূলধনের ন্যূনতম শর্ত")
            return ("%s ধরা হয়েছে চুক্তিমূল্যের %s গুণ" % (what, m.group(1)))
    if code == "R08":
        m = re.search(r"=\s*([\d.]+)%", en)
        if m:
            return ("দরপত্র জামানত চাওয়া হয়েছে চুক্তিমূল্যের %s শতাংশ" % m.group(1))
    if code == "R09":
        return ("পণ্য ক্রয়ের প্যাকেজে প্রস্তুতকারকের অনুমোদনপত্র এবং/অথবা একক ডিলারশিপের "
                "কাগজ বাধ্যতামূলক করা হয়েছে")
    return ""


# ------------------------------------------------------- verdicts and results

VERDICT_BN = {
    "YES_MANDATORY_CLAUSE_AND_EVENT_FALLS_INSIDE_INSTRUMENT_PERIOD": (
        "প্রকাশযোগ্য লঙ্ঘন — দফাটি ‘shall’ বলে বাধ্যতামূলক, দফাটি কর্পাসের দলিল থেকেই হুবহু "
        "উদ্ধৃত, এবং দফাটি যে ঘটনা নিয়ন্ত্রণ করে সেটি ঘটেছে দলিলটি বিদ্যমান থাকার সময়েই"),
    "NO_CITED_INSTRUMENT_POSTDATES_THE_EVENT": (
        "প্রকাশযোগ্য নয় — উদ্ধৃত দলিলটি ঘটনার পরে তৈরি, তাই ওই সময়ে এটি বাধ্যবাধকতা ছিল "
        "বলা যায় না; বিচ্যুতিটি নথিবদ্ধ রইল, কিন্তু লঙ্ঘন হিসেবে ছাপা যাবে না"),
    "NO_RECOMMENDED_BAND_IS_NOT_A_DUTY": (
        "প্রকাশযোগ্য নয় — সংখ্যাটি বা ডিফল্টটি আদর্শ দলিলের TDS-নোটে দেওয়া ‘সুপারিশ’ বা "
        "নির্দেশনা, আইনি বাধ্যবাধকতা নয়; তা ছাড়িয়ে যাওয়া আদর্শ দলিল থেকে বিচ্যুতি, বেআইনি "
        "কাজ নয়"),
}

VERDICT_PLAIN_EN = {
    "YES_MANDATORY_CLAUSE_AND_EVENT_FALLS_INSIDE_INSTRUMENT_PERIOD": (
        "reportable as a breach - the clause says 'shall', it is quoted verbatim from a "
        "document in the corpus, and the event it governs happened while that document "
        "existed"),
    "NO_CITED_INSTRUMENT_POSTDATES_THE_EVENT": (
        "not reportable as a breach - the document cited postdates the event, so it cannot "
        "be shown to have bound this tender; the deviation is recorded, not published"),
    "NO_RECOMMENDED_BAND_IS_NOT_A_DUTY": (
        "not reportable as a breach - the number or default relied on here is guidance in a "
        "Tender Data Sheet note, a 'recommended' band or a stated default, so departing from "
        "it is a departure from the standard document, not an unlawful act"),
}

RESULT_BN = {
    "DEVIATION": "বিচ্যুতি পাওয়া গেছে",
    "COMPLIANT": "শর্ত মানা হয়েছে",
    "NOT_TESTABLE_DATA_ABSENT": "তথ্যটি কোনো দলিলে প্রকাশিত না থাকায় পরীক্ষা করা যায়নি",
    "CONDITION_PRESENT_NOT_SCOREABLE": (
        "শর্তটি দলিলে উপস্থিত, তবে যে মানদণ্ডে মেপে বিচ্যুতি বলা যায় তা কর্পাসের কোনো দলিলে নেই"),
    "CONDITION_PRESENT_DISCRETION_NOT_A_BREACH": (
        "শর্তটি উপস্থিত, তবে বিধিতে এ বিষয়ে ব্যবস্থা নেওয়া ক্রয়কারী সংস্থার বিবেচনার এলাকা — "
        "নিজে থেকে লঙ্ঘন নয়"),
    "MANDATED_TEST_UNVERIFIABLE": (
        "বিধি যে পরীক্ষা বাধ্যতামূলক করেছে সেটি যাচাই করা যায়নি, কারণ পরীক্ষার জন্য দরকারি "
        "সংখ্যাটি কোথাও প্রকাশিত নেই"),
    "NOT_APPLICABLE_BELOW_10_LAC_FLOOR": "প্রযোজ্য নয় — চুক্তিমূল্য 10.00 লক্ষ টাকার নিচে",
    "NOT_APPLICABLE_NOT_A_GOODS_PACKAGE": "প্রযোজ্য নয় — এটি পণ্য ক্রয়ের প্যাকেজ নয়",
}

SEVERITY_BN = {"HIGH": "উচ্চ", "MEDIUM": "মধ্যম", "LOW": "নিম্ন"}

# ------------------------------------------------------ which document is quoted
# Award notices and tender notices are both named Tender_<id>.pdf in this corpus,
# in two different folders, so the sentence has to say which one it is reading.

DOC_KIND_EN = {
    "AWARD_NOTICE": "the contract award notice",
    "TENDER_NOTICE": "the tender notice",
    "TENDER_NOTICE_BAR_VS_AWARD_NOTICE_VALUE":
        "the tender notice, its bar measured against the value in the award notice",
    "TENDER_NOTICE_SECURITY_VS_AWARD_NOTICE_VALUE":
        "the tender notice, its security measured against the value in the award notice",
    "TENDER_NOTICE_STATUS_FIELD_WITH_AWARD_NOTICE_ABSENT":
        "the tender notice's own status field, with no award notice in the corpus at all",
}

DOC_KIND_BN = {
    "AWARD_NOTICE": "চুক্তি প্রদানের বিজ্ঞপ্তি",
    "TENDER_NOTICE": "দরপত্র আহ্বান বিজ্ঞপ্তি",
    "TENDER_NOTICE_BAR_VS_AWARD_NOTICE_VALUE":
        "দরপত্র আহ্বান বিজ্ঞপ্তি, শর্তের মান মেলানো হয়েছে চুক্তি প্রদানের বিজ্ঞপ্তির মূল্যের সঙ্গে",
    "TENDER_NOTICE_SECURITY_VS_AWARD_NOTICE_VALUE":
        "দরপত্র আহ্বান বিজ্ঞপ্তি, জামানতের পরিমাণ মেলানো হয়েছে চুক্তি প্রদানের বিজ্ঞপ্তির মূল্যের সঙ্গে",
    "TENDER_NOTICE_STATUS_FIELD_WITH_AWARD_NOTICE_ABSENT":
        "দরপত্র আহ্বান বিজ্ঞপ্তির অবস্থা-ঘর; চুক্তি প্রদানের কোনো বিজ্ঞপ্তি কর্পাসে নেই",
}


# ------------------------------------------------------- the per-rule status
# One filterable token per rule for the merged file. A deviation is not the same
# thing as a publishable breach, and the token has to keep them apart.

def status_token(test_result, verdict):
    if test_result != "DEVIATION":
        return test_result
    if verdict.startswith("YES"):
        return "BROKEN_REPORTABLE"
    if verdict == "NO_CITED_INSTRUMENT_POSTDATES_THE_EVENT":
        return "BROKEN_BUT_CITED_RULE_POSTDATES_THE_EVENT"
    if verdict == "NO_RECOMMENDED_BAND_IS_NOT_A_DUTY":
        return "OUTSIDE_RECOMMENDED_BAND_NOT_A_DUTY"
    return "DEVIATION"


# ------------------------------------------------ the normalised sentence pair
# The shape the user asked for: the rule says it should be X, here Y is
# happening. Three clauses, always in the same order, so the column can be read
# down a page - the rule and where to find it, the document and where to find
# it, then how far the finding can be pushed.

def evidence_doc(row):
    return ((row.get("award_notice_pdf") or "")
            if row.get("source_document_tested") == "AWARD_NOTICE"
            else (row.get("tender_notice_pdf") or ""))


def _bits(row):
    import os
    kind = (row.get("source_document_tested") or "").strip()
    return dict(
        clause=(row.get("rule_clause_cited") or "").strip(),
        rulepdf=os.path.basename((row.get("rule_pdf_file") or "").strip()),
        rulepage=(row.get("rule_pdf_page") or "").strip(),
        req=(row.get("what_the_rule_requires") or "").strip().rstrip("."),
        doc=evidence_doc(row) or "the portal print for this tender",
        kind_en=DOC_KIND_EN.get(kind, kind),
        kind_bn=DOC_KIND_BN.get(kind, kind),
        page=(row.get("evidence_page") or "").strip(),
        shows=(row.get("what_the_document_shows") or "").strip().rstrip("."),
        verdict=(row.get("publishable_as_a_breach") or "").strip(),
        code=(row.get("rule_code") or "").strip(),
    )


def sentence_en(row):
    b = _bits(row)
    return ("WHAT THE RULE SAYS - %s (%s, PDF p.%s): %s. WHAT THIS TENDER DOES - %s, %s p.%s: "
            "%s. HOW FAR IT GOES - %s."
            % (b["clause"], b["rulepdf"], b["rulepage"], b["req"], b["kind_en"], b["doc"],
               b["page"], b["shows"], VERDICT_PLAIN_EN.get(b["verdict"], b["verdict"])))


def sentence_bn(row):
    b = _bits(row)
    return ("বিধি যা বলে — %s (%s, PDF পৃষ্ঠা %s): %s। এই দরপত্রে যা ঘটেছে — %s, %s পৃষ্ঠা %s: %s। "
            "কতদূর বলা যায় — %s।"
            % (b["clause"], b["rulepdf"], b["rulepage"], requires_bn(b["code"], b["req"]),
               b["kind_bn"], b["doc"], b["page"], shows_bn(b["code"], b["shows"]),
               VERDICT_BN.get(b["verdict"], b["verdict"])))


# --------------------------------------- the other seven results, both languages
# A tender that did not break a rule still has a result worth reading, and nine
# of the eighteen rules can never produce a deviation at all. So every rule gets
# a one-line Bengali statement of what it requires, and the non-deviation rows
# get their own sentence pair. What stays in English inside the Bengali sentence
# is the engine's recorded observed value, marked as the document's own wording.

TESTS_BN = dict(REQUIRES_BN)
TESTS_BN.update({
    "R02": ("কার্যাদেশ (NOA) দেওয়ার তারিখ থেকে মূল্যভেদে 14 / 21 / 28 দিনের মধ্যে চুক্তি সই করতে "
            "হবে, PPR 2025-এর বিধি 123(9) অনুসারে"),
    "R10": ("ITT 56.2(b) সব দরপত্র বাতিলের ক্ষমতা দেয়, বাধ্য করে না; ITT 56.3 বলছে মূল্যায়িত দর "
            "বাজারদরের সমান হলে একটিমাত্র দর থাকলেও চুক্তি দেওয়া যায়"),
    "R11": ("মূল্যায়িত দর সরকারি প্রাক্কলিত ব্যয়ের সঙ্গে সরাসরি মিলিয়ে দেখতে হবে, 20 শতাংশ সীমা "
            "ধরে"),
    "R12": ("PPR 2025-এর বিধি 123(7) অনুযায়ী মূল্যভেদে 7 / 10 / 14 কর্মদিবস; অথচ ITT 63.2 বলছে "
            "14 দিন — আদর্শ দলিল নিজেই দুই রকম কথা বলছে"),
    "R13": ("সংশোধনী যদি দাখিলের সময়ের শেষ এক-তৃতীয়াংশে আসে, তবে দাখিলের সময়সীমা অন্তত 3 "
            "কর্মদিবস বাড়াতে হবে"),
    "R14": "সর্বনিম্ন মূল্যায়িত দর সরকারি প্রাক্কলিত ব্যয়ের সঙ্গে মিলিয়ে দেখতে হবে",
    "R15": ("কর্পাসে বাংলাদেশের কোনো ব্র্যান্ড-নাম বিধি নেই; JICA-র 4.07 ধারা 1,155টির মধ্যে "
            "মাত্র 1টি দরপত্রে প্রযোজ্য"),
    "R16": ("কর্পাসে বৈষম্যহীনতা বা আনুপাতিকতার কোনো বাধ্যতামূলক দফা নেই; নীতিটির একমাত্র লিখিত "
            "রূপ JICA নির্দেশিকায়, যা কেবল ওই ঋণের ক্রয়ে প্রযোজ্য"),
    "R17": ("দরপত্র আহ্বান বিজ্ঞপ্তিতে কী কী থাকতে হবে তা PPR নির্ধারণ করে, আর PPR-এর কোনো কপি "
            "কর্পাসে নেই"),
    "R18": "JICA-র 2.02 ধারা কেবল তুলনার মাপকাঠি; কর্পাসে একটিও আন্তর্জাতিক দরপত্র নেই",
})

RESULT_PLAIN_EN = {
    "COMPLIANT": "compliant on this test",
    "NOT_TESTABLE_DATA_ABSENT": (
        "not testable - the value the rule turns on is published in no document in the corpus"),
    "CONDITION_PRESENT_NOT_SCOREABLE": (
        "the condition is in the document, but no binding rule in the corpus measures it, so "
        "it cannot be scored as a deviation"),
    "CONDITION_PRESENT_DISCRETION_NOT_A_BREACH": (
        "the condition is present, but the clause creates a power rather than a duty, so this "
        "is not a breach"),
    "MANDATED_TEST_UNVERIFIABLE": (
        "the test the rule makes mandatory cannot be verified from outside the agency, because "
        "the benchmark it needs is published nowhere"),
    "NOT_APPLICABLE_BELOW_10_LAC_FLOOR": (
        "not applicable - the contract is below the BDT 10.00 Lac floor the clause sets"),
    "NOT_APPLICABLE_NOT_A_GOODS_PACKAGE": "not applicable - this is not a Goods package",
}


def _where(dev):
    """The rule's own address, from a rule_deviations row. R17 cites nothing."""
    import os
    pdf = os.path.basename((dev.get("rule_source_file") or "").strip())
    pg = (dev.get("rule_source_pdf_page") or "").strip()
    cl = (dev.get("clause_cited") or "").strip()
    if cl in ("", "none"):
        return "", ""
    at = pdf + (", PDF p." + pg if pg else "")
    return cl, at


def finding_other_en(dev):
    """The sentence for a row that is not a deviation."""
    cl, at = _where(dev)
    rule = ("%s (%s)" % (cl, at) if cl else
            "no clause in the corpus states this duty")
    return ("RESULT - %s. THE RULE - %s requires: %s. THIS TENDER - %s."
            % (RESULT_PLAIN_EN.get(dev["test_result"], dev["test_result"]), rule,
               (dev.get("required_value") or "").strip().rstrip("."),
               (dev.get("observed_value") or "").strip().rstrip(".")))


def finding_other_bn(dev):
    cl, at = _where(dev)
    code = dev["rule_code"]
    rule = ("%s: %s (%s, %s)" % (NAME_BN.get(code, code), TESTS_BN.get(code, ""), cl, at)
            if cl else "%s: %s" % (NAME_BN.get(code, code), TESTS_BN.get(code, "")))
    return ("ফল — %s। বিধি — %s। এই দরপত্রে নথিভুক্ত মান — %s (দলিলের নিজের ভাষায়)।"
            % (RESULT_BN.get(dev["test_result"], dev["test_result"]), rule,
               (dev.get("observed_value") or "").strip().rstrip(".")))






