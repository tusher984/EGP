#!/usr/bin/env python3
"""Phase 2 - field extraction, with a page citation on every value.

Reads what Phase 1 wrote (data/inventory.json, data/raw_pages.json) and turns
each document into a record of named fields, eligibility clauses, lots,
amendments, beneficial owners, dates, money and identifiers.

Two things make this trustworthy rather than merely large:

  * Values are sliced between one printed label and the next label that
    actually appears, so a value that wrapped over three lines comes back
    whole. That is the method already proven against this archive in
    verify_pdfs.py, which reproduces 38 published figures without a
    disagreement; it is reused here rather than reinvented.

  * Every field records the page it was read from, so any figure built on it
    can be cited as `file - page n` and checked against the PDF.

Nothing is inferred. A label that the document does not print produces no
field, and the absence is counted in the summary instead of being filled in.

    .venv/bin/python -P investigation/parser/02_extract.py

The -P matters: a module named pytesseract.py in the repository root shadows
the real package and re-runs an old extraction pipeline when imported.
"""

import io
import json
import os
import re
import sys
import time
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.abspath(os.path.join(HERE, "..", "data"))


def lab(s):
    """Label -> tolerant regex: the portal wraps labels mid-phrase."""
    return re.escape(s).replace("\\ ", r"\s*").replace(" ", r"\s*")


def flat(s):
    """One line, single spaces - the form every slice is taken from."""
    return re.sub(r"\s+", " ", s or "").strip()


# ---------------------------------------------------------------- label tables
# (key, label exactly as the portal prints it). Order is documentation only;
# the slicer sorts by where each label is actually found.
AWARD_FIELDS = [
    ("ministry", "Ministry/Division"),
    ("agency", "Agency"),
    ("pe", "Procuring Entity Name"),
    ("pe_code", "Procuring Entity Code"),
    ("pe_district", "Procuring Entity District"),
    ("award_for", "Contract Award for"),
    ("tender_id", "Tender/Proposal ID"),
    ("invitation_ref", "Invitation/Proposal Reference No."),
    ("method", "Procurement Method"),
    ("funds", "Budget and Source of Funds"),
    ("partner", "Development Partner (if applicable)"),
    ("project", "Project/Programme Name (if applicable)"),
    ("package_no", "Tender/Proposal Package No."),
    ("package_name", "Tender/Proposal Package Name"),
    ("advertised", "Date of Advertisement"),
    ("noa_date", "Date of Notification of Award"),
    ("signed_date", "Date of Contract Signing"),
    ("start_date", "Proposed Date of Contract Start"),
    ("completion_date", "Proposed Date of Contract Completion"),
    ("sold", "No. of Tenders/Proposals Sold"),
    ("received", "No. of Tenders/Proposals Received"),
    # the portal drops the "No. of" prefix on the third count, printing
    # "No. of Tenders/Proposals Sold: 8 ... Received: 5 Tenders/Proposals
    # Responsive: 5", so the short form is the label that matches both
    ("responsive", "Tenders/Proposals Responsive"),
    ("contract_no", "Contract No"),
    ("contract_desc", "Brief Description of Contract"),
    ("contract_value", "Contract Value (Taka)"),
    ("supplier", "Name of Supplier/Contractor/Consultant"),
    ("supplier_location", "Location of Supplier/Contractor/Consultant"),
    # The portal changed award template partway through the period. The newer
    # one names the winner "Economic Operator", adds a beneficial-ownership
    # block, and prints no bid counts and no contract number at all.
    ("tenderer_id", "Tenderer ID of the Economic Operator (If any)"),
    ("supplier_eo", "Name of the Economic Operator"),
    ("bo_block", "Beneficial Ownership Information"),
    ("supplier_address_eo", "Business Address of the Economic Operator"),
    ("work_location", "Location of Delivery/Works/Consultancy"),
    ("perf_security_ontime", "Was the Performance Security provided in due time?"),
    ("signed_ontime", "Was the Contract Singed in due time?"),
    ("officer", "Name of Authorised Officer"),
    ("officer_designation", "Designation of Authorised Officer"),
]

NOTICE_FIELDS = [
    ("ministry", "Ministry"),
    ("division", "Division"),
    ("agency", "Organization"),
    ("pe", "Procuring Entity Name"),
    ("pe_code", "Procuring Entity Code"),
    ("pe_district", "Procuring Entity District"),
    ("nature", "Procurement Nature"),
    ("ptype", "Procurement Type"),
    ("event", "Event Type"),
    ("invitation_for", "Invitation for"),
    ("invitation_ref", "Invitation Reference No."),
    ("pps_no", "PPS No."),
    ("status", "Tender/Proposal Status"),
    ("app_id", "App ID"),
    ("tender_id", "Tender/Proposal ID"),
    ("method", "Procurement Method"),
    ("budget_type", "Budget Type"),
    ("funds", "Source of Funds"),
    ("partner", "Development Partner"),
    ("project_code", "Project Code"),
    ("project", "Project Name"),
    ("package_no", "Tender/Proposal Package No. and Description"),
    ("category", "Category"),
    ("published", "Scheduled Tender/Proposal Publication Date and Time"),
    ("published_pps", "PPS Publication Date and Time"),
    ("last_selling", "Tender/Proposal Document last selling / downloading Date and Time"),
    ("last_selling_pps", "Document last selling / downloading Date and Time"),
    ("premeet_start", "Pre - Tender/Proposal meeting Start Date and Time"),
    ("premeet_end", "Pre - Tender/Proposal meeting End Date and Time"),
    ("closing", "Tender/Proposal Closing Date and Time"),
    ("opening", "Tender/Proposal Opening Date and Time"),
    ("security_last", "Last Date and Time for Tender/Proposal Security Submission"),
    ("eligibility", "Eligibility of Tenderer"),
    ("eligibility_consultant", "Eligibility of Consultant"),
    ("experience_required", "Experience, Resources and delivery capacity required"),
    ("foreign_association", "Association with foreign firm"),
    ("desc_works", "Brief Description of Works"),
    ("desc_goods", "Brief Description of Goods"),
    ("desc_services", "Brief Description of Services"),
    ("desc_assignment", "Brief Description of assignment"),
    ("eval_type", "Evaluation Type"),
    ("doc_available", "Document Available"),
    ("doc_fees", "Document Fees"),
    ("doc_price", "Tender/Proposal Document Price (In BDT)"),
    ("doc_price_pps", "PPS Document Price (In BDT)"),
    ("payment_mode", "Mode of Payment"),
    ("security_amount", "Tender/Proposal Security Amount (In BDT)"),
    ("security_amount_pps", "PPS Security Amount (In BDT)"),
    ("security_valid", "Tender/Proposal Security Valid Up to"),
    ("tender_valid", "Tender/Proposal Valid Up to"),
    ("inviting_officer", "Name of Official Inviting"),
    ("inviting_designation", "Designation of Official Inviting"),
    ("inviting_address", "Address of Official Inviting"),
    ("inviting_contact", "Contact details of Official Inviting"),
    ("amendment_no", "Amendment / Corrigendum No."),
    ("amendment_text", "Amendment / Corrigendum Text"),
]

# Labels whose value must not be captured by a shorter label of the same name -
# "District :" also occurs inside "Procuring Entity District :".
BOUNDARY = r"(?<![A-Za-z/])"

# Everything that can end a value, in two kinds, because the portal prints them
# differently and conflating them corrupts values.
#
# LABEL_STOPS are field labels. The portal always prints them as "Label :", so a
# stop only fires on the colon. Without that rule the label "Invitation for"
# fires inside the sentence "This Invitation for Tender (IFT) is open to all
# eligible tenderer..." and truncates a real eligibility clause to the word
# "This" - which it did, in 21 notices, until the colon was made mandatory.
LABEL_STOPS = [l for _k, l in AWARD_FIELDS] + [l for _k, l in NOTICE_FIELDS]

# BLOCK_STOPS are section headings, table mastheads, the standing footnote, and
# the labels the portal prints with no colon at all. The last group has to be
# listed rather than inferred, because it is a printing quirk: in the portal's
# two-column layout a long label wraps and the value lands in the middle of it,
# so the page reads "Brief Description of Goods and Related <value> Service :".
# Each of those was found by counting, across all 1,805 documents, how often
# every label appears with and without its colon.
BLOCK_STOPS = [
    "Information for Tenderer/Consultant",
    "Key Information and Funding Information",
    "Particular Information",
    "KEY INFORMATION", "FUNDING INFORMATION", "PARTICULAR INFORMATION",
    "INFORMATION ON AWARD", "ENTITY DETAILS",
    "Procuring Entity Details",
    "The procuring entity reserves the right",
    "Lot No. Identification of Lot",
    "Ref. No. Phasing of service",
    # the lot table's masthead wraps, and the order the fragments land in varies,
    # so each fragment has to be able to end the value printed before the table
    "Identification of Lot",
    "Phasing of service",
    "Tender/Proposal Tentative",
    "Tentative Start",
    "Tentative Completion",
    "Indicative Start",
    "Indicative Completion",
    "Tender/Proposal Document Price (In",
    "Tender/Proposal Security Amount (In",
    "Amendment / Corrigendum Detail",
    "Field Name Old Value New Value",
    "Beneficial Ownership Information",
    "Company Name Designation",
    "Save As PDF",
    "Note:",
    # labels the portal prints without a colon, value interleaved
    "Brief Description of Goods and Related",
    "Brief Description of",
    "Name of Official Inviting",
    "Designation of Official Inviting",
    "Address of Official Inviting",
    "Contact details of Official Inviting",
    "Name of the Economic Operator",
    "Was the Performance Security provided in due",
    "Was the Contract Singed in due time?",
    # The date and package labels also wrap around their own value, so they too
    # print with no colon where the value sits. Any field printed just before one
    # of them ends there: without these the "Category" value ran on through the
    # whole date block in 1,145 notices, and "Project/Programme Name" swallowed
    # the package number and its description in 1,144.
    "Tender/Proposal Package No. and",
    "Package No. and",
    "Scheduled Tender/Proposal Publication",
    "PPS Publication",
    "Tender/Proposal Document last selling",
    "Document last selling",
    "Pre - Tender/Proposal meeting Start",
    "Pre - Tender/Proposal meeting End",
    "Tender/Proposal Closing",
    "Tender/Proposal Opening",
    "Last Date and Time for",
]

# Fields whose value is printed inside a wrapped label: prefix, then the value,
# then the tail of the label. A tail of None means the value runs to the next
# stop. These are the only fields read this way; everything else is colon-anchored.
INTERLEAVED = [
    ("desc_goods", "Brief Description of Goods and Related", "Service :"),
    ("supplier_eo", "Name of the Economic Operator",
     "(Supplier/Contractor/Service Provider/Consultant):"),
    ("inviting_name", "Name of Official Inviting", "Designation of Official Inviting"),
    ("inviting_designation", "Designation of Official Inviting Tender/Proposal :",
     "Tender/Proposal :"),
    ("inviting_block", "Address of Official Inviting Address :",
     "The procuring entity reserves"),
    ("package_no", "Tender/Proposal Package No. and", "Description :"),
    ("perf_security_ontime", "Was the Performance Security provided in due", "time?"),
    ("signed_ontime", "Was the Contract Singed in due time?", None),
]

# The notice template prints every date this way: label, date, then the tail of
# the label - "Tender/Proposal Closing 05-Aug-2024 16:15 Tender/Proposal Opening
# 05-Aug-2024 16:15 Date and Time : Date and Time :". So the date is read as the
# first one printed after the label, cut short at the next label so that an empty
# cell cannot borrow the following field's date.
INTERLEAVED_DATE = [
    ("published", "Scheduled Tender/Proposal Publication"),
    ("published_pps", "PPS Publication"),
    ("last_selling", "Tender/Proposal Document last selling"),
    ("last_selling_pps", "Document last selling"),
    ("premeet_start", "Pre - Tender/Proposal meeting Start"),
    ("premeet_end", "Pre - Tender/Proposal meeting End"),
    ("closing", "Tender/Proposal Closing"),
    ("opening", "Tender/Proposal Opening"),
    ("security_last", "Last Date and Time for"),
]

# Money prints with the label wrapped around the figure: "Tender/Proposal
# Document Price (In 4000 BDT) :".
INTERLEAVED_NUM = [
    ("doc_price", "Tender/Proposal Document Price (In", "BDT)"),
    ("doc_price_pps", "PPS Document Price (In", "BDT)"),
    ("security_amount", "Tender/Proposal Security Amount (In", "BDT)"),
    ("security_amount_pps", "PPS Security Amount (In", "BDT)"),
]
DT_RE = re.compile(r"\d{1,2}-[A-Za-z]{3}-\d{4}(?:\s+\d{1,2}:\d{2})?")

DATE_RE = re.compile(r"\b(\d{1,2})-([A-Za-z]{3})-(\d{4})\b(?:\s+(\d{1,2}):(\d{2}))?")
DATE_SLASH = re.compile(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b(?:\s+(\d{1,2}):(\d{2}))?")
DATE_ISO = re.compile(r"\b(\d{4})-(\d{2})-(\d{2})\b")
NUM_RE = re.compile(r"-?\d[\d,]*(?:\.\d+)?")


def to_iso(text):
    """First date in a value, as YYYY-MM-DD, or None. Never guesses a year."""
    if not text:
        return None
    m = DATE_RE.search(text)
    if m:
        try:
            return datetime.strptime("%s-%s-%s" % m.group(1, 2, 3), "%d-%b-%Y").date().isoformat()
        except ValueError:
            return None
    m = DATE_ISO.search(text)
    if m:
        try:
            return datetime.strptime(m.group(0), "%Y-%m-%d").date().isoformat()
        except ValueError:
            return None
    m = DATE_SLASH.search(text)
    if m:                                   # the portal prints DD/MM/YYYY
        try:
            return datetime.strptime("%s/%s/%s" % m.group(1, 2, 3), "%d/%m/%Y").date().isoformat()
        except ValueError:
            return None
    return None


def to_number(text):
    """First number in a value. '104498747.100' -> 104498747.1"""
    if text is None:
        return None
    m = NUM_RE.search(str(text).replace(",", ""))
    if not m:
        return None
    try:
        return float(m.group(0))
    except ValueError:
        return None


# Money as the notices write it: "Tk.15 (Fifteen) Lacs", "BDT 11.00 Lakh",
# "Tk 50 (Fifty) Lac", "BDT 4.00 lakh only". Two things can go wrong here, and
# both happen in this archive, so both are decided from the page rather than
# assumed.
#
# The scale word may already be inside the digits. "Tk. 20,00,000 (Twenty) Lac"
# is twenty lakh - the digits say it and the word says it - so multiplying the
# digits by a lakh again would print two hundred billion taka. "Tk 1.20 [One
# point Two] Crore" is the opposite case: there the digits are the multiplicand
# and the scale word must be applied. The words in brackets tell the two apart,
# so they are read and used as the arbiter, and where the digits and the words
# cannot be reconciled the amount is left unresolved rather than guessed.
SCALES = [
    (r"crore|koti", 10000000.0),
    (r"lakhs?|lacs?|lakh", 100000.0),
    (r"millions?", 1000000.0),
    (r"billions?", 1000000000.0),
    (r"thousands?", 1000.0),
]
SCALE_WORDS = ("crore", "koti", "lakh", "lakhs", "lac", "lacs", "million",
               "millions", "billion", "billions", "thousand", "thousands")
MONEY_RE = re.compile(
    r"(?:BDT|Tk\.?|Taka|৳)\s*\.?\s*(\d[\d,]*(?:\.\d+)?)"
    r"(\s*[\(\[][^)\]]{0,40}[\)\]])?\s*"
    r"(crore|koti|lakhs?|lacs?|lakh|millions?|billions?|thousands?)?",
    re.I)
# ...and the other order, "11.00 Lakh BDT" / "15 Lac Taka"
MONEY_RE2 = re.compile(
    r"(\d[\d,]*(?:\.\d+)?)(\s*[\(\[][^)\]]{0,40}[\)\]])?\s*"
    r"(crore|koti|lakhs?|lacs?|lakh|millions?|billions?)\s*(?:BDT|Tk\.?|Taka)?",
    re.I)

ONES = {"zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10, "eleven": 11,
        "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
        "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19}
TENS = {"twenty": 20, "thirty": 30, "forty": 40, "fourty": 40, "fifty": 50,
        "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90}
MULT = {"hundred": 100.0, "thousand": 1000.0, "lac": 100000.0,
        "lacs": 100000.0, "lakh": 100000.0, "lakhs": 100000.0,
        "crore": 10000000.0, "koti": 10000000.0, "million": 1000000.0,
        "billion": 1000000000.0}
SKIP_WORDS = ("and", "only", "taka", "tk", "bdt", "rupees", "in", "words",
              "say", "amount", "of")


def int_words(toks):
    """'twenty five lakh' -> 2500000.0, or None if a token is not a numeral."""
    total, cur, seen = 0.0, 0.0, False
    for tok in toks:
        if tok in ONES:
            cur += ONES[tok]
        elif tok in TENS:
            cur += TENS[tok]
        elif tok in MULT:
            cur = (cur or 1.0)
            if MULT[tok] >= 1000.0:
                total += cur * MULT[tok]
                cur = 0.0
            else:
                cur *= MULT[tok]
        else:
            return None
        seen = True
    return (total + cur) if seen else None


def words_to_number(text):
    """The amount a bracketed phrase spells out, or None if it spells none."""
    toks = [w for w in re.split(r"[^A-Za-z]+", (text or "").lower()) if w]
    toks = [w for w in toks if w not in SKIP_WORDS]
    if not toks:
        return None
    if "point" in toks:
        i = toks.index("point")
        whole = int_words(toks[:i]) if toks[:i] else 0.0
        if whole is None or not toks[i + 1:]:
            return None
        frac = 0.0
        for k, tok in enumerate(toks[i + 1:]):
            digit = ONES.get(tok)
            if digit is None or digit > 9:
                return None
            frac += digit / (10.0 ** (k + 1))
        return whole + frac
    return int_words(toks)


def near(a, b):
    return a is not None and b is not None and abs(a - b) <= 0.005 * max(1.0, abs(b))


def one_letter_off(word):
    """The scale word this is one keystroke away from - 'Core' -> 'crore'."""
    w = (word or "").lower()
    for target in SCALE_WORDS:
        if w == target or abs(len(w) - len(target)) > 1:
            continue
        if len(w) == len(target):
            if sum(1 for x, y in zip(w, target) if x != y) == 1:
                return target
        else:
            longer, shorter = (w, target) if len(w) > len(target) else (target, w)
            if any(longer[:i] + longer[i + 1:] == shorter
                   for i in range(len(longer))):
                return target
    return None


def money_values(text):
    """Every monetary amount in a string, as (original, taka, basis) records.

    The original spelling is kept beside the normalised figure because the
    normalisation - deciding whether the scale word still has to be applied -
    is the only step here that could be wrong, and a reader must be able to see
    what was multiplied and why. Each amount carries the basis on which it was
    read, and an amount that cannot be read is returned with taka None rather
    than with a number nobody can defend.
    """
    body = text or ""
    out, seen = [], set()
    for rx in (MONEY_RE, MONEY_RE2):
        for m in rx.finditer(body):
            span = (m.start(), m.end())
            if span in seen:
                continue
            seen.add(span)
            try:
                base = float(m.group(1).replace(",", ""))
            except (TypeError, ValueError):
                continue
            word = (m.group(3) or "").strip()
            bracket = m.group(2) or ""
            mult = 1.0
            for pat, factor in SCALES:
                if word and re.fullmatch(pat, word, re.I):
                    mult = factor
                    break
            # A scale word can also sit inside the brackets - "Tk. 15,00,00,000
            # (Taka Fifteen Crore)" - and then the bracketed phrase states a
            # total rather than a multiplicand, so it is kept apart from mult.
            imult = 1.0
            if mult == 1.0 and not word:
                inner = re.search(r"(crore|koti|lakhs?|lacs?|millions?|billions?)",
                                  bracket, re.I)
                if inner:
                    for pat, factor in SCALES:
                        if re.fullmatch(pat, inner.group(1), re.I):
                            imult, word = factor, inner.group(1)
                            break
            spelled = words_to_number(bracket)

            tail = body[m.end():m.end() + 24]
            split_digits = re.match(r"\s+\d", tail) and not word
            typo = None
            if mult == 1.0 and imult == 1.0 and not word:
                nxt = re.match(r"\s*([A-Za-z]{3,8})", tail)
                typo = one_letter_off(nxt.group(1)) if nxt else None

            if split_digits:
                taka, basis = None, ("the digits are broken by a space on the "
                                     "page and the figure cannot be read with "
                                     "certainty")
            elif typo:
                taka, basis = None, ("the word printed after the figure is one "
                                     "letter from \"%s\" and the parser does "
                                     "not decide which was meant" % typo)
            elif spelled is None:
                taka = base * mult * imult
                basis = ("the scale word was applied to the digits; no amount "
                         "in words is printed beside them to check it against"
                         if mult * imult != 1.0 else
                         "no scale word is printed; the figure is taken at face "
                         "value in taka")
            elif mult != 1.0:                       # scale word outside brackets
                if near(spelled, base):
                    taka = base * mult
                    basis = ("the digits and the words agree, so the scale word "
                             "is applied to them")
                elif near(spelled, base / mult):
                    taka = base
                    basis = ("the digits already state the total the words "
                             "state, so the scale word is not applied a second "
                             "time")
                elif near(spelled, base * mult):
                    taka = base * mult
                    basis = "the words state the same total the scale word produces"
                else:
                    taka, basis = None, ("the digits and the words printed "
                                         "beside them state different amounts")
            elif imult != 1.0:                      # scale word inside brackets
                if near(spelled, base):
                    taka = base
                    basis = ("the words in brackets state the same total as the "
                             "digits")
                elif near(spelled, base * imult):
                    taka = base * imult
                    basis = ("the digits are the multiplicand and the words in "
                             "brackets state the total they come to")
                else:
                    taka, basis = None, ("the digits and the words printed "
                                         "beside them state different amounts")
            elif near(spelled, base):
                taka = base
                basis = ("the digits and the words agree and no scale word is "
                         "printed")
            else:
                taka, basis = None, ("the digits and the words printed beside "
                                     "them state different amounts")
            out.append({"original": flat(m.group(0)), "taka": taka,
                        "scale": word.lower() or "taka", "basis": basis,
                        "words": flat(bracket).strip("()[] ") or ""})
    return out


# ------------------------------------------------------- eligibility clause map
# (category, human label, pattern). A clause can fall in several categories; all
# matches are kept, because "at least one similar contract worth Tk 15 lakh"
# is simultaneously an experience rule and a money threshold.
CRITERION_KINDS = [
    ("experience_general", "General experience (years in the trade)",
     r"general\s+experience|years?\s+of\s+experience|experience\s+of\s+at\s+least"),
    ("experience_similar", "Similar-work experience",
     r"similar\s+(?:work|nature|type|contract)|specific\s+experience"),
    ("experience_count", "Number of past contracts required",
     r"at\s+least\s+\d+\s*\(?\w*\)?\s*(?:no\.?s?\.?\s*)?contract|"
     r"\d+\s*\(?\w*\)?\s*contracts?\s+(?:of|in|within)"),
    ("financial_turnover", "Annual turnover threshold",
     r"annual\s+(?:construction\s+)?turnover|average\s+annual"),
    ("financial_liquid", "Liquid assets / working capital threshold",
     r"liquid\s+asset|working\s+capital|financial\s+resources?"),
    ("financial_credit", "Credit line or bank commitment",
     r"credit\s+line|credit\s+commitment|credit\s+facilit|bank\s+solvency"),
    ("equipment", "Equipment or machinery required",
     r"\bequipment|machiner|plant\b|mixer|roller|excavator|vehicle"),
    ("personnel", "Personnel or staffing required",
     r"personnel|manpower|engineer|technician|staff\b|graduate"),
    ("cert_trade_licence", "Valid trade licence",
     r"trade\s+lic[eo]n[cs]e"),
    ("cert_vat", "VAT registration",
     r"\bvat\b"),
    ("cert_tin", "Income tax / TIN",
     r"\btin\b|income\s*tax"),
    ("cert_bin", "Business identification number",
     r"\bbin\b|business\s+identification"),
    ("cert_other", "Other certificate demanded",
     r"certificate|enlist|registration\s+certificate"),
    ("jv", "Joint venture rule",
     r"joint\s+venture|\bjv\b|consorti"),
    ("subcontract", "Subcontracting rule",
     r"sub-?\s*contract"),
    ("brand_model", "Named brand, model or origin",
     r"\bbrand\b|\bmodel\b|country\s+of\s+origin|make\b"),
    ("manufacturer_auth", "Manufacturer's authorisation",
     r"manufactur\w*\s+(?:authoriz|authoris|certificat)|authorized\s+dealer|agency\s+agreement"),
    ("price_band", "Rate must fall inside a band around the estimate",
     r"(?:above\s+or\s+below|below\s+or\s+above)[^.]{0,60}estimat|"
     r"\d+\s*%\s*(?:above|below)[^.]{0,40}estimat"),
    ("geographic", "Geographic or client restriction",
     r"government/\s*semi-?government|autonomous\s+organi|public\s*\(government|"
     r"within\s+the\s+(?:district|division)|local\s+authority"),
    ("deferred", "No criteria published - deferred to the purchased document",
     r"^\s*(?:as\s+per|as\s+specified\s+in|according\s+to)?\s*"
     r"(?:the\s+)?(?:tds|itt|tender\s+data\s+sheet|bidding\s+document|tender\s+document"
     r"|tender\s+document\s+sheet|schedule)[\s.\)]*$|"
     r"^any\s+(?:genuine|eligible|qualified)|^all\s+tenderer"),
    ("cert_licence_class", "Licence of a named class or category",
     r"(?:abc|a\s*/?\s*b\s*/?\s*c|bc)\s*(?:categor|class)|"
     r"categor\w*\s+(?:contractor\w*|electrical)|"
     r"(?:electrical|supervisor\w*)\s+(?:abc|licen[cs]e)"),
    ("tax_deduction", "Tax and VAT deducted at source",
     r"(?:vat|tax)[^.]{0,40}(?:deduct|deducted)"),
]
CRITERION_RX = [(k, l, re.compile(p, re.I)) for k, l, p in CRITERION_KINDS]

# A pointer to a document the reader does not have. Enumerating every wording is
# hopeless - the archive prints "As per TDS.", "As per ITT and TDS.", "As per TDS
# of STD.", "As per Bidding Documents.", "As per Tender Data Sheet ( Section-2 )"
# and "As per Section A, Clause No. 5 of Instructions to Tenderer (ITT) and
# Tender Data Sheet (TDS)". So the test is structural instead: the clause names
# one of those documents and states nothing else.
POINTER_RX = re.compile(
    r"\b(?:tds|itt|std|pds|ppr|pparg|bidding\s+documents?|tender\s+documents?|"
    r"tender\s+notice|tender\s+data\s+sheets?|instructions?\s+to\s+tenderers?|"
    r"schedules?)\b", re.I)
FILLER_RX = re.compile(
    r"\b(?:as|per|specified|stated|mentioned|described|given|noted|in|of|on|to|"
    r"the|a|an|and|or|with|according|read|see|refer|referred|relevant|"
    r"respective|above|below|attached|section|sections|clause|clauses|no|nos|"
    r"number|part|annex|annexure|appendix|schedule|document|documents|sheet|"
    r"data|criteria|criterion|requirement|requirements|s)\b", re.I)


def pointer_only(clause):
    """True when a clause names the unavailable document and states nothing else.

    Deleting the document names and the connective filler leaves the substance.
    If almost no substance remains, the notice has published a pointer rather
    than a rule: a reader cannot learn what is required without first buying
    the document. A clause that also states a real threshold - "Experience of
    minimum 5 years as per TDS" - keeps its substance and is not counted here.
    """
    text = flat(clause).lower()
    if len(text) > 200 or not POINTER_RX.search(text):
        return False
    residue = FILLER_RX.sub(" ", POINTER_RX.sub(" ", text))
    return len(re.sub(r"[^a-z]+", "", residue)) <= 12

YEARS_RE = re.compile(r"(\d{1,2})\s*\(?\s*(?:one|two|three|four|five|six|seven|eight|nine|ten|"
                      r"eleven|twelve|fifteen|twenty)?\s*\)?\s*(?:\(\w+\)\s*)?years?", re.I)
COUNT_RE = re.compile(r"(?:at\s+least\s+)?(\d{1,3})\s*\(?\s*\w*\s*\)?\s*"
                      r"(?:no\.?s?\.?\s*)?contracts?", re.I)
PCT_RE = re.compile(r"(\d{1,3}(?:\.\d+)?)\s*(?:%|percent)", re.I)


def split_clauses(block):
    """Break an eligibility block into the clauses the document itself numbered.

    The portal has printed six numbering styles over the period - (1), 1., 1),
    (a), a) and a literal '#' where a bullet glyph failed to map to Unicode.
    Whichever is present is used; a block with no numbering stays one clause,
    and the style is recorded so a reader can see how the split was made.
    """
    text = flat(block)
    if not text:
        return "empty", []
    styles = [
        ("(n)", r"(?=\((\d{1,2})\)\s)"),
        ("n.", r"(?=(?:^|\s)(\d{1,2})\.\s)"),
        ("n)", r"(?=(?:^|\s)(\d{1,2})\)\s)"),
        ("(a)", r"(?=\(([a-z])\)\s)"),
        ("a)", r"(?=(?:^|\s)([a-z])\)\s)"),
        ("#", r"(?=#\s?)"),
    ]
    for name, pattern in styles:
        parts = [p.strip(" #") for p in re.split(pattern, text) if p and p.strip(" #")]
        # a split is only believable if it produced at least two real clauses
        real = [p for p in parts if len(p) > 25]
        if len(real) >= 2:
            return name, real
    return "unnumbered", [text]


def classify(clause):
    """Which requirement kinds a clause states, and the thresholds it names."""
    kinds = [k for k, _l, rx in CRITERION_RX if rx.search(clause)]
    if pointer_only(clause):
        kinds = ["deferred"] + [k for k in kinds if k != "deferred"]
    money = money_values(clause)
    years = [int(m.group(1)) for m in YEARS_RE.finditer(clause) if 0 < int(m.group(1)) <= 60]
    counts = [int(m.group(1)) for m in COUNT_RE.finditer(clause) if 0 < int(m.group(1)) <= 100]
    pcts = [float(m.group(1)) for m in PCT_RE.finditer(clause)]
    return {
        "categories": kinds or ["other"],
        "money": money,
        "years": sorted(set(years)),
        "contract_counts": sorted(set(counts)),
        "percentages": sorted(set(pcts)),
    }


# ------------------------------------------------------------------- the slicer
def compile_stops():
    """One regex that finds any label able to end a value.

    Field labels only count with their colon; section headings count on the
    words alone. See the LABEL_STOPS / BLOCK_STOPS note above for why.
    """
    labels = sorted(set(LABEL_STOPS), key=len, reverse=True)
    blocks = sorted(set(BLOCK_STOPS), key=len, reverse=True)
    parts = [BOUNDARY + lab(s) + r"\s*:" for s in labels]
    parts += [BOUNDARY + lab(s) for s in blocks]
    return re.compile("|".join(parts))


STOP_RX = compile_stops()


def slice_fields(text, fields):
    """`Label : value` pairs, each value ending where the next label starts."""
    body = flat(text)
    found = []
    for key, label in fields:
        m = re.search(BOUNDARY + lab(label) + r"\s*:", body)
        if m:
            found.append((m.start(), m.end(), key, label))
    found.sort()
    out = {}
    for i, (_start, end, key, label) in enumerate(found):
        limit = found[i + 1][0] if i + 1 < len(found) else len(body)
        # a label that is not itself an extracted field can also end the value
        nxt = STOP_RX.search(body, end)
        while nxt and nxt.start() < end + 2:            # skip a match on itself
            nxt = STOP_RX.search(body, nxt.end())
        if nxt and nxt.start() < limit:
            limit = nxt.start()
        out[key] = {"value": body[end:limit].strip(" :-"), "label": label}
    return out


def slice_interleaved(text, out):
    """Read the fields whose value sits inside a wrapped, colon-less label."""
    body = flat(text)
    for key, prefix, tail in INTERLEAVED:
        m = re.search(BOUNDARY + lab(prefix), body)
        if not m:
            continue
        if tail:
            t = re.search(lab(tail), body[m.end():])
            value = body[m.end():m.end() + t.start()] if t else ""
        else:
            nxt = STOP_RX.search(body, m.end())
            value = body[m.end():nxt.start() if nxt else len(body)]
        value = value.strip(" :-")
        if value and not out.get(key, {}).get("value"):
            out[key] = {"value": value, "label": prefix}
    return out


def date_window(body, start):
    """How far after a label a date may be read: to the next label, at most 60."""
    limit = min(start + 60, len(body))
    nxt = STOP_RX.search(body, start)
    if nxt:
        limit = min(limit, nxt.start())
    for _k, other in INTERLEAVED_DATE:
        m = re.compile(BOUNDARY + lab(other)).search(body, start)
        if m:
            limit = min(limit, m.start())
    return body[start:limit]


def pps_shadow(key, out):
    """True when a PPS-notice label would only re-read the tender-notice one.

    The 16 PPS notices print "Document last selling ..." and "PPS Document Price
    (In ... BDT)"; those short labels also sit inside the ordinary notice's
    "Tender/Proposal Document last selling ...". So a _pps field is read only
    when its tender-notice twin was not found.
    """
    return key.endswith("_pps") and bool(out.get(key[:-4], {}).get("value"))


def slice_interleaved_dates(text, out):
    """Read each schedule date as the first date printed after its label."""
    body = flat(text)
    for key, prefix in INTERLEAVED_DATE:
        if out.get(key, {}).get("value") or pps_shadow(key, out):
            continue
        m = re.search(BOUNDARY + lab(prefix), body)
        if not m:
            continue
        found = DT_RE.search(date_window(body, m.end()))
        if found:
            out[key] = {"value": found.group(0), "label": prefix}
    return out


def slice_interleaved_numbers(text, out):
    """Read each money figure printed inside its own wrapped label."""
    body = flat(text)
    for key, prefix, tail in INTERLEAVED_NUM:
        if out.get(key, {}).get("value") or pps_shadow(key, out):
            continue
        m = re.search(BOUNDARY + lab(prefix), body)
        if not m:
            continue
        t = re.search(lab(tail), body[m.end():m.end() + 80])
        seg = body[m.end():m.end() + t.start()] if t else ""
        found = NUM_RE.search(seg)
        if found:
            out[key] = {"value": found.group(0), "label": prefix}
    return out


ADDR_PARTS = [("phone", "Phone No"), ("fax", "Fax No"), ("city", "City"),
              ("thana", "Thana"), ("addr_district", "District"),
              ("country", "Country")]


def split_address(out):
    """Pull the contact parts out of the procuring entity's address block.

    They are read from inside the block rather than from the page, because
    "District :" also occurs in "Procuring Entity District :" and a page-wide
    search would return the wrong one.
    """
    block = out.get("inviting_block", {}).get("value", "")
    if not block:
        return out
    for key, label in ADDR_PARTS:
        m = re.search(BOUNDARY + lab(label) + r"\s*:", block)
        if not m:
            continue
        nxt = None
        for _k2, other in ADDR_PARTS + [("_", "Contact details of Official Inviting"),
                                        ("_", "Tender/Proposal")]:
            m2 = re.search(BOUNDARY + lab(other) + r"\s*:", block[m.end():])
            if m2 and (nxt is None or m2.start() < nxt):
                nxt = m2.start()
        value = block[m.end():m.end() + nxt] if nxt is not None else block[m.end():]
        value = flat(value).strip(" :-,")
        if value:
            out[key] = {"value": value, "label": label}
    return out


def page_of(pages, label):
    """The 1-based page a label is printed on, or None if it is not found."""
    rx = re.compile(BOUNDARY + lab(label) + r"\s*:")
    plain = re.compile(BOUNDARY + lab(label))
    for page in pages:
        flatpage = flat(page["text"])
        if rx.search(flatpage) or plain.search(flatpage):
            return page["n"]
    return None


# --------------------------------------------------------------- ruled tables
def cells(row):
    return [flat(c) if c else "" for c in row]


def header_kind(row):
    """Which of the archive's four ruled tables this header row belongs to."""
    joined = " ".join(cells(row)).lower()
    if "beneficial ownership" in joined and "name" in joined:
        return "beneficial_owners"
    if "field name" in joined and "old value" in joined:
        return "amendment_changes"
    if "lot no" in joined and "identification of lot" in joined:
        return "lots_legacy"
    if "ref. no" in joined and "phasing" in joined:
        return "lots_phased"
    return None


def read_tables(pages):
    """Every ruled table, tagged with what it is and the page it sits on."""
    out = []
    for page in pages:
        for index, table in enumerate(page.get("tables") or []):
            rows = [cells(r) for r in table if any(cells(r))]
            if not rows:
                continue
            kind = None
            for probe in rows[:2]:
                kind = header_kind(probe)
                if kind:
                    break
            out.append({"page": page["n"], "index": index, "kind": kind,
                        "header": rows[0], "rows": rows[1:] if kind else rows,
                        "row_count": max(0, len(rows) - 1)})
    return out


def pick(row, header, *names):
    """A cell by column name, tolerating the portal's header wrapping."""
    low = [h.lower() for h in header]
    for name in names:
        for i, h in enumerate(low):
            if name in h:
                return row[i] if i < len(row) else ""
    return ""


def read_owners(tables, company):
    """The beneficial-ownership block the newer award template prints."""
    out = []
    for t in tables:
        if t["kind"] != "beneficial_owners":
            continue
        for row in t["rows"]:
            name = pick(row, t["header"], "name")
            if not name or name.lower() in ("name", "s. no.", "s.no"):
                continue
            out.append({
                "serial": pick(row, t["header"], "s. no", "s.no", "sl"),
                "name": name,
                "designation": pick(row, t["header"], "designation"),
                "ownership_pct": to_number(pick(row, t["header"], "ownership")),
                "country": pick(row, t["header"], "country"),
                "company": company,
                "page": t["page"],
            })
    return out


def read_changes(tables):
    """The Field Name / Old Value / New Value diff the corrigenda print."""
    out = []
    for t in tables:
        if t["kind"] != "amendment_changes":
            continue
        for row in t["rows"]:
            field = pick(row, t["header"], "field name")
            old = pick(row, t["header"], "old value")
            new = pick(row, t["header"], "new value")
            if not (old or new):
                continue
            out.append({"field": field, "old": old, "new": new,
                        "changed": flat(old) != flat(new), "page": t["page"]})
    return out


def read_lots(tables):
    """Lots, from either generation of the lot table."""
    out = []
    for t in tables:
        if t["kind"] not in ("lots_legacy", "lots_phased"):
            continue
        for row in t["rows"]:
            ident = pick(row, t["header"], "identification of lot", "phasing")
            number = pick(row, t["header"], "lot no", "ref. no")
            if not (ident or number):
                continue
            security = pick(row, t["header"], "security", "amount")
            out.append({
                "lot_no": number,
                "identification": ident,
                "location": pick(row, t["header"], "location"),
                "security_amount": to_number(security),
                "security_original": security,
                "start": to_iso(pick(row, t["header"], "start")),
                "completion": to_iso(pick(row, t["header"], "completion")),
                "generation": t["kind"],
                "page": t["page"],
            })
    return out


# ---------------------------------------------------------------- one document
DATE_KEYS = ("advertised", "noa_date", "signed_date", "start_date", "completion_date",
             "published", "published_pps", "last_selling", "last_selling_pps",
             "premeet_start", "premeet_end", "closing", "opening", "security_last",
             "security_valid", "tender_valid")
MONEY_KEYS = ("contract_value", "doc_price", "doc_price_pps",
              "security_amount", "security_amount_pps")
COUNT_KEYS = ("sold", "received", "responsive")
ID_KEYS = ("tender_id", "app_id", "pe_code", "invitation_ref", "package_no",
           "project_code", "pps_no", "contract_no", "tenderer_id")


def extract_one(doc, pages):
    """Every field, clause, lot, owner and amendment one document supports."""
    text = "\n".join(p["text"] for p in pages)
    fields = slice_fields(text, AWARD_FIELDS if doc["kind"] == "contract_award"
                          else NOTICE_FIELDS)
    slice_interleaved(text, fields)
    slice_interleaved_dates(text, fields)
    slice_interleaved_numbers(text, fields)
    split_address(fields)
    for key, item in fields.items():
        item["page"] = page_of(pages, item["label"])
    tables = read_tables(pages)

    rec = {
        "id": doc["id"], "file": doc["file"], "kind": doc["kind"],
        "pages": doc["pages"], "sha256": doc["sha256"],
        "fields": fields, "tables": tables,
        "dates": [], "money": [], "counts": {}, "identifiers": [],
        "eligibility": None, "lots": read_lots(tables),
        "beneficial_owners": [], "amendment": None, "notes": [],
    }

    for key in DATE_KEYS:
        item = fields.get(key)
        if item and item["value"]:
            iso = to_iso(item["value"])
            rec["dates"].append({"field": key, "label": item["label"],
                                 "original": item["value"], "iso": iso,
                                 "page": item["page"]})
            if iso is None:
                rec["notes"].append("date not parseable: %s = %r" % (key, item["value"]))
    for key in MONEY_KEYS:
        item = fields.get(key)
        if item and item["value"]:
            rec["money"].append({"field": key, "label": item["label"],
                                 "original": item["value"],
                                 "taka": to_number(item["value"]), "page": item["page"]})
    for key in COUNT_KEYS:
        item = fields.get(key)
        if item and item["value"]:
            rec["counts"][key] = to_number(item["value"])
    for key in ID_KEYS:
        item = fields.get(key)
        if item and item["value"]:
            rec["identifiers"].append({"type": key, "value": item["value"],
                                       "label": item["label"], "page": item["page"]})
    return rec, fields, tables


def add_eligibility(rec, fields):
    """The published rules of the race, clause by clause.

    Three labels can carry them - "Eligibility of Tenderer", "Eligibility of
    Consultant" and "Experience, Resources and delivery capacity required".
    Whichever the document prints is used, and which one it was is recorded.
    """
    for key in ("eligibility", "eligibility_consultant", "experience_required"):
        item = fields.get(key)
        if not item or not item["value"]:
            continue
        style, parts = split_clauses(item["value"])
        clauses = []
        for i, part in enumerate(parts, 1):
            info = classify(part)
            clauses.append({"n": i, "text": part, "chars": len(part), **info})
        published = bool(clauses) and not all("deferred" in c["categories"]
                                              for c in clauses)
        cats = sorted(set(c for cl in clauses for c in cl["categories"]))
        rec["eligibility"] = {
            "source_field": key, "label": item["label"], "page": item["page"],
            "raw": item["value"], "chars": len(item["value"]),
            "numbering": style, "clauses": clauses,
            "criteria_published": published,
            "categories": cats,
            # a rule a reader could actually check themselves, as opposed to a
            # cross-reference or a sentence that names no requirement at all
            "substantive": [c for c in cats if c not in ("deferred", "other")] != [],
        }
        return
    rec["eligibility"] = {"source_field": None, "label": None, "page": None,
                          "raw": "", "chars": 0, "numbering": "absent",
                          "clauses": [], "criteria_published": False,
                          "categories": [], "substantive": False}


def add_amendment(rec, fields, tables):
    """The corrigendum, if the notice was amended after publication."""
    no = fields.get("amendment_no", {}).get("value", "")
    txt = fields.get("amendment_text", {}).get("value", "")
    changes = read_changes(tables)
    if not (no or txt or changes):
        return
    rec["amendment"] = {
        "number": no, "text": txt,
        "page": fields.get("amendment_no", {}).get("page")
        or fields.get("amendment_text", {}).get("page"),
        "changes": changes,
        "changed_fields": sorted(set(c["field"] for c in changes
                                     if c["changed"] and c["field"])),
        "eligibility_changed": any(
            c["changed"] and re.search(r"eligib|experience|qualif", c["field"], re.I)
            for c in changes),
    }


def main():
    inv = json.load(io.open(os.path.join(DATA, "inventory.json"), encoding="utf-8"))
    raw = json.load(io.open(os.path.join(DATA, "raw_pages.json"), encoding="utf-8"))
    started = time.time()

    out, missing = [], {}
    for doc in inv["documents"]:
        pages = raw.get(doc["file"]) or []
        rec, fields, tables = extract_one(doc, pages)
        if doc["kind"] == "tender_notice":
            add_eligibility(rec, fields)
            add_amendment(rec, fields, tables)
        if doc["kind"] == "contract_award":
            company = (fields.get("supplier_eo", {}).get("value")
                       or fields.get("supplier", {}).get("value") or "")
            rec["beneficial_owners"] = read_owners(tables, company)
        out.append(rec)
        wanted = AWARD_FIELDS if doc["kind"] == "contract_award" else NOTICE_FIELDS
        for key, _label in wanted:
            if not fields.get(key, {}).get("value"):
                missing.setdefault(doc["kind"], {})
                missing[doc["kind"]][key] = missing[doc["kind"]].get(key, 0) + 1

    awards = [r for r in out if r["kind"] == "contract_award"]
    notices = [r for r in out if r["kind"] == "tender_notice"]
    elig = [r["eligibility"] for r in notices if r["eligibility"]]
    summary = {
        "generated": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "documents": len(out),
        "awards": len(awards),
        "notices": len(notices),
        "other_documents": len(out) - len(awards) - len(notices),
        "fields_extracted": sum(len(r["fields"]) for r in out),
        "dated_values": sum(len(r["dates"]) for r in out),
        "money_values": sum(len(r["money"]) for r in out),
        "identifiers": sum(len(r["identifiers"]) for r in out),
        "ruled_tables": sum(len(r["tables"]) for r in out),
        "lots": sum(len(r["lots"]) for r in out),
        "beneficial_owners": sum(len(r["beneficial_owners"]) for r in out),
        "awards_with_bid_counts": sum(1 for r in awards if r["counts"].get("received")),
        "awards_with_owners": sum(1 for r in awards if r["beneficial_owners"]),
        "notices_with_eligibility_text": sum(1 for e in elig if e["chars"]),
        "notices_publishing_criteria": sum(1 for e in elig if e["criteria_published"]),
        "notices_deferring_criteria": sum(1 for e in elig if e["chars"]
                                          and not e["criteria_published"]),
        "notices_with_no_eligibility_label": sum(1 for e in elig if not e["chars"]),
        "notices_with_substantive_criteria": sum(1 for e in elig if e["substantive"]),
        "notices_without_substantive_criteria": sum(1 for e in elig
                                                    if not e["substantive"]),
        "eligibility_clauses": sum(len(e["clauses"]) for e in elig),
        "amended_notices": sum(1 for r in notices if r["amendment"]),
        "notices_with_change_table": sum(1 for r in notices if r["amendment"]
                                         and r["amendment"]["changes"]),
        "notices_with_eligibility_amended": sum(1 for r in notices if r["amendment"]
                                                and r["amendment"]["eligibility_changed"]),
        "unparsed_dates": sum(len(r["notes"]) for r in out),
        "labels_absent_by_kind": missing,
    }

    with io.open(os.path.join(DATA, "extracted.json"), "w", encoding="utf-8") as fh:
        json.dump({"summary": summary,
                   # the plain-English name of every criterion category, carried
                   # forward so later stages name them the same way
                   "criterion_labels": dict((k, l) for k, l, _ in CRITERION_KINDS),
                   "documents": out}, fh, ensure_ascii=False)

    print("extracted %d documents in %.1fs" % (len(out), time.time() - started))
    for key in ("awards", "notices", "other_documents", "fields_extracted",
                "ruled_tables", "lots", "beneficial_owners", "awards_with_bid_counts",
                "awards_with_owners", "notices_with_eligibility_text",
                "notices_publishing_criteria", "notices_deferring_criteria",
                "notices_with_no_eligibility_label",
                "notices_with_substantive_criteria",
                "notices_without_substantive_criteria", "eligibility_clauses",
                "amended_notices", "notices_with_change_table",
                "notices_with_eligibility_amended", "unparsed_dates"):
        print("  %-38s %s" % (key, summary[key]))


if __name__ == "__main__":
    main()
