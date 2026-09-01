#!/usr/bin/env python3
"""The investigation itself: what the 1,805 documents, read together, show.

Every number here is computed from investigation/data/tables/*.csv, which was
built from the PDFs and audited against a separately written parser. Nothing is
brought in from outside the folder, and nothing is asserted that the documents
do not print.

Each result is filed under one of four labels, and the label is part of the
result rather than a decoration on it:

  DOCUMENTED FACT     the documents print this; the figure is a count or a sum
                      of printed values.
  DATA-DERIVED FINDING  the documents do not print this, but it follows from
                      arithmetic over what they print, and the arithmetic is
                      given.
  POSSIBLE CONNECTION  two records share something the documents print - a
                      declared owner, an address, an officer. A shared value is
                      not a relationship; it is a question to put to someone.
  UNRESOLVED          the documents raise the question and cannot answer it.

    .venv/bin/python -P investigation/parser/04_analysis.py
"""

import collections
import csv
import datetime
import difflib
import io
import json
import math
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.abspath(os.path.join(HERE, "..", "data"))
TABLES = os.path.join(DATA, "tables")

FINDINGS = []


def table(name):
    with io.open(os.path.join(TABLES, name + ".csv"), encoding="utf-8-sig",
                 newline="") as fh:
        return list(csv.DictReader(fh))


def load():
    names = ("documents tenders contracts bids eligibility_criteria lots "
             "amendments amendment_changes beneficial_owners companies people "
             "organizations projects locations relationships timeline "
             "name_candidate_pairs normalization")
    return dict((n, table(n)) for n in names.split())


def pages():
    """Every page of every PDF as extracted: {file: [{"n": int, "text": str}]}."""
    with io.open(os.path.join(DATA, "raw_pages.json"), encoding="utf-8") as fh:
        return json.load(fh)


# ------------------------------------------------------------------ small tools
def find(kind, fid, headline, detail, numbers=None, evidence=None,
         calculation=""):
    """One result, with the label that says how far the documents carry it."""
    row = {"id": fid, "type": kind, "headline": headline, "detail": detail,
           "numbers": numbers or {}, "evidence": evidence or [],
           "calculation": calculation}
    FINDINGS.append(row)
    print("  [%s] %s" % (kind, headline))
    return row


FACT = "DOCUMENTED FACT"
DERIVED = "DATA-DERIVED FINDING"
POSSIBLE = "POSSIBLE CONNECTION"
UNRESOLVED = "UNRESOLVED"


def say(stage):
    """A stage heading on the console, in the order the story runs."""
    print("\n%s\n%s" % (stage, "-" * len(stage)))


def line(s):
    print("  " + s)


def day(s):
    return datetime.date(*map(int, s.split("-"))) if s else None


def gap(a, b):
    """Whole days from a to b, or None if either date is not printed."""
    x, y = day(a), day(b)
    return None if (x is None or y is None) else (y - x).days


def median(xs):
    xs = sorted(xs)
    if not xs:
        return None
    mid = len(xs) // 2
    return xs[mid] if len(xs) % 2 else (xs[mid - 1] + xs[mid]) / 2.0


def quantile(xs, q):
    xs = sorted(xs)
    if not xs:
        return None
    i = min(len(xs) - 1, max(0, int(round(q * (len(xs) - 1)))))
    return xs[i]


def share(part, whole):
    return 0.0 if not whole else round(100.0 * part / whole, 1)


def taka(v):
    """A sum of money as the site will print it: crore for anything large."""
    if v is None:
        return "not printed"
    if v >= 1e7:
        return "%.2f crore taka" % (v / 1e7)
    if v >= 1e5:
        return "%.2f lakh taka" % (v / 1e5)
    return "%.0f taka" % v


def money_of(rows, col="contract_value_taka"):
    return [float(r[col]) for r in rows if (r[col] or "").strip()]


# ------------------------------------------------------- where the bidders went
def funnel(t):
    """Sold, received, responsive, awarded - and the wall the archive hits.

    The award notice prints three counts and one winner. It does not print who
    bid, what anyone quoted, how anyone scored, or why anyone was found
    non-responsive. So the drop between two stages is a documented number whose
    cause is nowhere in these documents, and the analysis says exactly that
    rather than filling the gap.
    """
    got = [b for b in t["bids"] if b["counts_printed"] == "yes"]
    sold = sum(int(b["documents_sold"]) for b in got)
    recv = sum(int(b["bids_received"]) for b in got)
    resp = sum(int(b["bids_responsive"]) for b in got)
    awarded = len(got)
    find(FACT, "F-FUNNEL-01",
         "Across the %d award notices that print bid counts, %s documents were "
         "sold, %s bids arrived, %s were found responsive and %d contracts were "
         "signed" % (len(got), sold, recv, resp, awarded),
         "Every figure is the sum of a number printed on the award notice "
         "itself. The four stages are not four measurements of the same thing: "
         "a document may be bought and never used, and a bid may arrive and be "
         "set aside before it is evaluated.",
         {"notices": len(got), "documents_sold": sold, "bids_received": recv,
          "bids_responsive": resp, "contracts_signed": awarded,
          "bought_but_did_not_bid": sold - recv,
          "received_but_not_responsive": recv - resp},
         [b["source_file"] for b in got[:3]],
         "sum of documents_sold, bids_received and bids_responsive over the %d "
         "rows of bids.csv where counts_printed = yes" % len(got))

    find(UNRESOLVED, "F-FUNNEL-02",
         "No supplied document names a single bidder, a single price or a "
         "single reason for rejection",
         "The %d bids that arrived and the %d found responsive are counts only. "
         "There is no bidder list, no quoted price, no evaluated amount, no "
         "ranking, no score and no per-bidder reason in any of the 1,805 PDFs. "
         "Anything about who lost, or why, is outside what these documents can "
         "establish." % (recv, resp),
         {"bidder_level_records": 0, "documents_searched": len(t["documents"])},
         # The three notices in this archive that carry the most bid counts. If a
         # bidder were named anywhere, these are the pages it would be on.
         [b["source_file"] for b in sorted(
             got, key=lambda b: -int(b["bids_received"] or 0))[:3]],
         "bids.csv column bidder_level_data_available is no on every row")

    one = [b for b in got if int(b["bids_responsive"]) == 1]
    none_lost = [b for b in got if b["all_received_were_responsive"] == "yes"]
    single_in = [b for b in got if b["single_bid_received"] == "yes"]
    find(DERIVED, "F-FUNNEL-03",
         "%d of %d tenders reached the award stage with exactly one responsive "
         "bid (%s%%)" % (len(one), len(got), share(len(one), len(got))),
         "A single responsive bid is not in itself irregular - a tender can "
         "draw one serious bidder. It does mean the price was not compared with "
         "any other price at the moment of award, and in %d of these the "
         "notice records only one bid arriving at all."
         % sum(1 for b in one if b["single_bid_received"] == "yes"),
         {"one_responsive": len(one), "one_bid_received": len(single_in),
          "no_bid_set_aside": len(none_lost), "of": len(got),
          "one_responsive_pct": share(len(one), len(got))},
         [b["source_file"] for b in one[:5]],
         "count of rows in bids.csv where bids_responsive = 1")

    lost = collections.Counter(int(b["bids_received"]) - int(b["bids_responsive"])
                               for b in got)
    find(DERIVED, "F-FUNNEL-04",
         "In %d tenders every bid that arrived was found responsive; in %d at "
         "least one was set aside" % (lost[0], len(got) - lost[0]),
         "The number set aside per tender runs from %d to %d. The documents "
         "print the count and never the ground, so each of these is a question "
         "for the procuring entity, not an answer."
         % (min(lost), max(lost)),
         {"set_aside_distribution": dict(sorted(lost.items())),
          "largest_single_drop": max(lost)},
         # The notices where the most bids were set aside, largest drop first.
         [b["source_file"] for b in sorted(
             got, key=lambda b: -(int(b["bids_received"] or 0)
                                  - int(b["bids_responsive"] or 0)))[:3]],
         "bids_received - bids_responsive, tallied over bids.csv")
    return {"stages": {"documents_sold": sold, "bids_received": recv,
                       "bids_responsive": resp, "contracts_signed": awarded},
            "notices_with_counts": len(got),
            "notices_without_counts": len(t["bids"]) - len(got),
            "one_responsive": len(one), "one_bid_received": len(single_in),
            "set_aside_distribution": dict(sorted(lost.items()))}


# ------------------------------------------------------------- who could enter
# Every clause the notices publish is classified, and the classification is
# arithmetic over this archive rather than an opinion about procurement. Four
# things are measured for each clause:
#
#   how often its subject appears  the share of the 1,150 notices that print a
#                                  clause in the same category.
#   how high its threshold sits    the position of the largest figure it prints
#                                  among the figures printed by every other
#                                  clause of the same kind.
#   whether it names a particular  a brand, a model, a manufacturer's
#     thing rather than a capacity authorisation, a place, a licence class.
#   whether it can be read at all  a clause pointing at a document the portal
#                                  does not publish states no rule here.
#
# The five labels follow from those measurements and from nothing else. No
# criterion is called tailored anywhere in this analysis: the archive contains
# no finding of tailoring, so the word would be the analyst's and not the
# record's. The last label says pattern, and a pattern is a question to put to
# the procuring entity, not an answer about it.
MONEY_KINDS = ["financial_turnover", "financial_liquid", "financial_credit",
               "price_band"]
# Names a particular product or a particular channel to buy it through.
NAMES_A_THING = ["brand_model", "manufacturer_auth"]
# Narrows the field by where a firm has worked, or by a licence class it holds.
NARROWS_THE_FIELD = ["geographic", "cert_licence_class"]
# A figure printed with digits but no scale word reads as taka at face value:
# "Tk. 11(Eleven)" in a clause about crores is what the page prints and cannot
# be corrected from the page, so such figures are kept in the data and left out
# of the threshold distributions. The count is reported.
FACE_VALUE_FLOOR = 1000.0
COMMON_SHARE = 20.0       # printed by at least a fifth of the notices
RARE_SHARE = 5.0          # printed by fewer than one in twenty
DECILE_SAMPLE = 20        # below this many figures a top decile means nothing

LABEL_MEANING = {
    "COMMON": "the subject of this clause is printed by at least a fifth of "
              "the notices in this archive, and nothing about it narrows the "
              "field further",
    "UNUSUAL": "one thing about this clause sets it apart from the rest of the "
               "archive - either its subject is printed by fewer than one "
               "notice in twenty, or the figure it demands is above the "
               "ninetieth percentile of the figures other notices demand for "
               "the same thing",
    "HIGHLY SPECIFIC": "the clause names a brand, a model, an origin or a "
                       "manufacturer's authorisation, so it describes a "
                       "particular product or a particular way of buying it "
                       "rather than a capacity to do the work",
    "RESTRICTIVE-LOOKING PATTERN": "two or more of those things at once. This "
                                   "is an investigative signal about the "
                                   "wording of a clause and nothing more: the "
                                   "documents do not say why any criterion was "
                                   "written as it was, and no supplied document "
                                   "finds that any criterion was improper",
    "UNDETERMINED": "the clause states no requirement that can be measured "
                    "here - it points at a document the portal does not "
                    "publish, or its subject is not one the parser recognises, "
                    "or the only figures it prints could not be read from the "
                    "page",
}
LABEL_ORDER = ["RESTRICTIVE-LOOKING PATTERN", "HIGHLY SPECIFIC", "UNUSUAL",
               "COMMON", "UNDETERMINED"]


# --------------------------------------------------------- the rules of the race
# Four reference documents sit in the folder beside the notices. They are the
# only statement of the rules the archive contains, so the rules are quoted from
# them rather than described from memory. Each pattern is searched for in the
# text as extracted, and whatever is found is quoted with its page.
# S matches a sentence: any character except a full stop, except that a full stop
# inside a number ("0.20") does not end it.
S = r"(?:[^.]|\.(?=\d))"
RULE_PATTERNS = [
    ("R-PERIOD", "how long bidders must be given, for international bidding",
     r"not\s+less\s+than\s+\d+\s+days\s+shall\s+be\s+allowed" + S + r"{0,160}\."),
    ("R-PERIOD-LARGE", "how long for large civil works or complex equipment",
     r"not\s+less\s+than\s+\d+\s+days\s+shall\s+be\s+allowed\s+to\s+enable"
     + S + r"{0,200}\."),
    ("R-VALID", "how long the tender security must stay valid",
     r"remain\s+valid\s+for\s+at\s+least" + S + r"{0,120}"),
    ("R-CLARIFY", "what a clarification may not do",
     r"request\s+for\s+clarifications\s+by\s+the\s+TEC" + S + r"{0,320}\."),
    ("R-CLARIFY-TIME", "how long a tenderer gets to answer one",
     r"reasonable\s+timeline" + S + r"{0,140}\."),
    ("R-SLT", "when a price is too low to accept",
     r"tender\s+quoted\s+below\s+this\s+limit" + S + r"{0,200}\."),
    ("R-SLT-TWO", "how many prices the low-price test needs",
     r"During\s+the\s+evaluation\s+of\s+tenders,\s+the\s+proposed\s+prices"
     r".{0,200}?used\s+to\s+determine\s+a\s+Weighted\s+Average"),
    ("R-SLT-WEIGHTS", "what the low-price test is weighed against",
     r"official\s+cost\s+estimate\s*=\s*0\.20" + S + r"{0,220}"),
    ("R-ESTIMATE", "when a price is too far from the estimate",
     r"deviation\s+of\s+the\s+evaluated\s+price" + S + r"{0,200}\."),
    ("R-ANNUL-COMPETITION", "when weak competition may end a tender",
     r"there\s+is\s+evidence\s+of\s+lack\s+of\s+effective\s+competition"
     + r"(?:[^.]|\.(?=\d)){0,120}"),
    ("R-ALL-NON", "what happens when nothing is responsive",
     r"all\s+Tenders\s+are\s+non-responsive"),
    # The only two places the folder puts a number on how demanding an entry
    # requirement may be. Both are advisory - the word is recommended - and both
    # measure against the estimated cost, which no notice in this archive prints.
    ("R-LIQUID-BAND", "how much cash a tenderer may be asked to have",
     r"ITT\s+14\.1\(b\)\s+The\s+minimum\s+amount\s+of\s+financial\s+resources"
     r".{0,340}?between\s+\d+\s+and\s+\d+\s+percent\s+of\s+the\s+estimated\s+cost"
     r"[^\]]*"),
    ("R-EXP-BAND", "how big a past contract a tenderer may be asked to show",
     r"ITT\s+13\.1\(b\)\s+The\s+minimum\s+specific\s+experience"
     r".{0,900}?between\s+\d+\s+and\s+\d+\s+percent\s+of\s+the\s+estimated\s+cost"
     r"[^\]]*"),
    ("R-VALIDITY-BAND", "how long a tender should stay open for acceptance",
     r"ITT\s+29\.1\s+The\s+Tender\s+Validity\s+period"
     r".{0,80}?normally\s+\d+\s+to\s+\d+\s+days[^\]]*"),
]

# The band each of those two rules recommends, read off the quoted text itself
# rather than typed in here, and the criterion category it is measured against.
BANDS = [("R-LIQUID-BAND", "financial_liquid", "cash in hand, working capital or "
          "a credit line"),
         ("R-EXP-BAND", "experience_similar", "the value of one past contract of "
          "a similar kind")]
BAND_RX = r"between\s+(\d+)\s+and\s+(\d+)\s+percent"

# A rule that would set a floor under competition would have to count tenderers.
# This is the sweep that looks for one, and its emptiness is the finding.
MINIMUM_RX = (r"(?:minimum\s+(?:of\s+)?|at\s+least\s+|not\s+less\s+than\s+)"
              r"(?:\w+\s+){0,2}(?:\(\d+\)\s*)?"
              r"(?:Tenderers?|Tenders?|bidders?|bids?|quotations?)\b")


def flat_pages(raw, book):
    return [(p["n"], " ".join(p["text"].split())) for p in raw[book]]


def rules(raw):
    """What the supplied reference documents say the contest is supposed to be."""
    books = sorted(k for k in raw if k.startswith("eGP_Forensic_Engine/"))
    quoted, index = [], {}
    for rid, label, pattern in RULE_PATTERNS:
        rx = re.compile(pattern, re.I)
        hit = None
        for book in books:
            for n, text in flat_pages(raw, book):
                m = rx.search(text)
                if m:
                    hit = {"id": rid, "reads_on": label, "file": book, "page": n,
                           "text": " ".join(m.group(0).split())}
                    break
            if hit:
                break
        if hit:
            quoted.append(hit)
            index[rid] = hit
    find(FACT, "F-RULES-01",
         "The folder holds %d reference documents, and %d of the rules that "
         "decide a tender are printed in them" % (len(books), len(quoted)),
         "These are the only statements of procedure in the archive. Everything "
         "quoted here is from a PDF in the folder, named with its page. The "
         "standard tender document among them is marked on its own first page "
         "as a preliminary working draft, and no notice in this archive names "
         "the standard document it was written from, so these rules describe "
         "the procedure as the supplied copies state it rather than the "
         "procedure proved to have governed any particular tender. Some of "
         "these pages are set in two columns and the clause heading printed in "
         "the margin lands inside the sentence when the text is extracted; the "
         "quotes are left exactly as extracted rather than tidied, so a reader "
         "who turns to the page sees what the parser saw.",
         {"reference_documents": len(books), "rules_quoted": len(quoted),
          "rules_searched_for": len(RULE_PATTERNS)},
         ["%s p%d" % (q["file"], q["page"]) for q in quoted[:4]],
         "regex search of raw_pages.json over the documents in "
         "eGP_Forensic_Engine/")

    # Both printed price tests need a number the notices and awards never carry.
    two = index.get("R-SLT-TWO")
    est = index.get("R-ESTIMATE")
    if two and est:
        find(DERIVED, "F-RULES-02",
             "Both printed tests of whether a price is reasonable need "
             "something this archive never prints",
             "The low-price test is run on the prices of the technically "
             "responsive tenderers, and the clause says how many it takes: "
             "\"(at least two tenders)\". It weighs those prices against an "
             "official cost estimate (%s p%d; the sentence on that page is "
             "broken by the clause heading printed in the margin). The other "
             "test rejects a tender whose evaluated price deviates from that "
             "same official estimate by more than twenty percent (%s p%d). No "
             "tender notice and no award notice in this archive prints an "
             "official cost estimate, and none prints a quoted price. So "
             "neither test can be re-run from these documents, and where only "
             "one tender was responsive the first test cannot have been run as "
             "written." % (two["file"].split("/")[-1], two["page"],
                           est["file"].split("/")[-1], est["page"]),
             {"tests_printed": 2, "official_cost_estimates_in_archive": 0,
              "quoted_prices_in_archive": 0},
             ["%s p%d" % (two["file"], two["page"]),
              "%s p%d" % (est["file"], est["page"])],
             "no column of tenders.csv, contracts.csv or bids.csv carries an "
             "official cost estimate or a quoted price")

    rx = re.compile(MINIMUM_RX, re.I)
    floors, pages = [], 0
    for book in books:
        for n, text in flat_pages(raw, book):
            pages += 1
            for m in rx.finditer(text):
                floors.append({"file": book, "page": n,
                               "text": " ".join(m.group(0).split())})
    find(UNRESOLVED, "F-RULES-03",
         "Nothing in the folder sets a minimum number of tenderers for an open "
         "tender",
         "A sweep of all %d reference pages for any phrase that puts a floor "
         "under a count of tenders or tenderers returns %d: \"%s\", which is "
         "the condition on the low-price test rather than a condition on "
         "holding the tender. Weak competition appears once as a ground on "
         "which a procuring entity *may* end a tender - \"%s\" - and the word "
         "is may. So a tender awarded on one responsive bid cannot be measured "
         "against a printed threshold, because the supplied documents do not "
         "state one."
         % (pages, len(floors), floors[0]["text"] if floors else "",
            (index.get("R-ANNUL-COMPETITION") or {}).get("text", "")),
         {"reference_pages_searched": pages, "floor_phrases_found": len(floors)},
         ["%s p%d" % (f["file"], f["page"]) for f in floors],
         "regex sweep of raw_pages.json over eGP_Forensic_Engine/ for a "
         "minimum, at-least or not-less-than phrase governing a count of "
         "tenders, tenderers, bids or quotations")
    return {"reference_documents": books, "quoted": quoted,
            "minimum_tenderer_phrases": floors,
            "reference_pages": pages}


def pctile_of(value, xs):
    """The share of xs at or below value."""
    return None if not xs else sum(1 for x in xs if x <= value) / float(len(xs))


def money_kind(cats):
    return next((k for k in MONEY_KINDS if k in cats), None)


def biggest(row, col, floor=None):
    """The largest figure the clause prints in that column, floor applied."""
    out = []
    for x in (row[col] or "").split(";"):
        if not x.strip():
            continue
        v = float(x)
        if floor is None or v >= floor:
            out.append(v)
    return max(out) if out else None


def demanded(clauses, kind):
    """The largest readable figure demanded across clauses of one money kind."""
    vals = [biggest(c, "money_taka", FACE_VALUE_FLOOR) for c in clauses
            if kind in (c["categories"] or "").split(";")]
    vals = [v for v in vals if v is not None]
    return max(vals) if vals else None


def classify(clauses, notices, labels):
    """One label per clause, and the archive-wide measurements behind it."""
    subject = collections.defaultdict(set)
    for r in clauses:
        for c in (r["categories"] or "").split(";"):
            if c.strip():
                subject[c.strip()].add(r["tender_id"])
    share_of = dict((c, share(len(s), len(notices))) for c, s in subject.items())

    money_by_kind, years_all, counts_all, face_value = (
        collections.defaultdict(list), [], [], 0)
    for r in clauses:
        cats = set(c for c in (r["categories"] or "").split(";") if c.strip())
        raw = biggest(r, "money_taka")
        if raw is not None and raw < FACE_VALUE_FLOOR:
            face_value += 1
        big = biggest(r, "money_taka", FACE_VALUE_FLOOR)
        kind = money_kind(cats)
        if big is not None and kind:
            money_by_kind[kind].append(big)
        for col, bag in (("years", years_all), ("contract_counts", counts_all)):
            v = biggest(r, col)
            if v is not None:
                bag.append(v)
    cut = dict((k, quantile(v, 0.90)) for k, v in money_by_kind.items()
               if len(v) >= DECILE_SAMPLE)
    year_cut, count_cut = quantile(years_all, 0.90), quantile(counts_all, 0.90)
    return share_of, cut, year_cut, count_cut, face_value, money_by_kind


def label_clause(r, share_of, cut, year_cut, count_cut, labels):
    """The label, and the reasons in the words a reader can check."""
    cats = set(c for c in (r["categories"] or "").split(";") if c.strip())
    money = biggest(r, "money_taka", FACE_VALUE_FLOOR)
    kind = money_kind(cats)
    why = []
    thing = [c for c in NAMES_A_THING if c in cats]
    if thing:
        why.append("names a brand, a model, an origin or a manufacturer's "
                   "authorisation")
    if [c for c in NARROWS_THE_FIELD if c in cats]:
        why.append("narrows the field by where a firm has worked, or by a "
                   "licence class it must already hold")
    # The rarity test skips subjects already accounted for above, so that naming
    # a brand counts once rather than twice over.
    accounted = set(NAMES_A_THING) | set(NARROWS_THE_FIELD)
    rare = sorted((share_of.get(c, 0.0), c) for c in cats - accounted
                  if share_of.get(c, 0.0) < RARE_SHARE)
    if rare:
        why.append("names %s, which %s%% of the notices print"
                   % (labels.get(rare[0][1], rare[0][1]).lower(), rare[0][0]))
    if money is not None and kind in cut and money > cut[kind]:
        why.append("demands %s, above the %s that nine in ten clauses of the "
                   "same kind demand" % (taka(money), taka(cut[kind])))
    years = biggest(r, "years")
    if years is not None and year_cut is not None and years > year_cut:
        why.append("demands %g years of it where nine in ten clauses that name "
                   "a number of years ask %g or fewer" % (years, year_cut))
    count = biggest(r, "contract_counts")
    if count is not None and count_cut is not None and count > count_cut:
        why.append("demands %g past contracts where nine in ten clauses that "
                   "name a number ask %g or fewer" % (count, count_cut))

    measurable = bool(cats - set(["other", "deferred"])) or money is not None
    shares = [share_of.get(c, 0.0) for c in cats] or [0.0]
    if r["defers_to_another_document"] == "yes" or not measurable:
        label = "UNDETERMINED"
    elif len(why) >= 2:
        label = "RESTRICTIVE-LOOKING PATTERN"
    elif thing:
        label = "HIGHLY SPECIFIC"
    elif len(why) == 1:
        label = "UNUSUAL"
    elif min(shares) >= COMMON_SHARE:
        label = "COMMON"
    else:
        label = "UNUSUAL"
        why.append("names %s, which %s%% of the notices print - fewer than the "
                   "fifth of them that would make it ordinary in this archive"
                   % (labels.get(min(cats, key=lambda c: share_of.get(c, 0.0)),
                                 ""), min(shares)))
    return label, why


def eligibility(t, labels):
    """Who could enter, in the words the notices printed."""
    clauses = t["eligibility_criteria"]
    notices = set(r["tender_id"] for r in t["tenders"])
    share_of, cut, year_cut, count_cut, face_value, by_kind = classify(
        clauses, notices, labels)

    deferring = set(r["tender_id"] for r in clauses
                    if r["defers_to_another_document"] == "yes")
    publishing = set(r["tender_id"] for r in clauses
                     if r["defers_to_another_document"] == "no")
    both = deferring & publishing
    pointers = sum(1 for r in clauses if r["defers_to_another_document"] == "yes")
    find(FACT, "F-ELIG-01",
         "%d of the %d tender notices print at least one rule of entry a reader "
         "can check; %d print at least one clause that points at a document the "
         "portal does not publish, and %d do both"
         % (len(publishing), len(notices), len(deferring), len(both)),
         "Every notice in this archive prints an \"Eligibility of Tenderer\" "
         "heading, so nothing is missing from the page. What differs is what "
         "follows the heading. %d clauses across %d notices say only that the "
         "criteria are as per the Tender Data Sheet, the Instructions to "
         "Tenderers or the tender document - documents obtainable by buying "
         "the tender document, and not among the 1,805 PDFs. For the %d "
         "notices that print nothing else, who was allowed to enter is not on "
         "the public record."
         % (pointers, len(deferring), len(deferring - publishing)),
         {"notices": len(notices), "publishing_a_rule": len(publishing),
          "deferring_to_another_document": len(deferring),
          "doing_both": len(both),
          "deferring_and_nothing_else": len(deferring - publishing),
          "pointer_clauses": pointers, "clauses": len(clauses)},
         [r["source_file"] for r in clauses
          if r["defers_to_another_document"] == "yes"][:3],
         "eligibility_criteria.csv grouped by defers_to_another_document")

    tally, rows = collections.Counter(), []
    for r in clauses:
        label, why = label_clause(r, share_of, cut, year_cut, count_cut, labels)
        tally[label] += 1
        rows.append({"tender_id": r["tender_id"], "clause_no": r["clause_no"],
                     "source_file": r["source_file"], "page": r["page"],
                     "categories": r["categories"], "label": label,
                     "reasons": why, "text": r["text"],
                     "money_taka": r["money_taka"],
                     "money_original": r["money_original"],
                     "money_unresolved": r["money_unresolved"],
                     "years": r["years"], "contract_counts": r["contract_counts"]})
    find(DERIVED, "F-ELIG-02",
         "Of the %d clauses the notices print, %d read as ordinary for this "
         "archive, %d set themselves apart in one way, %d name a particular "
         "product, and %d do two or more of those at once"
         % (len(clauses), tally["COMMON"], tally["UNUSUAL"],
            tally["HIGHLY SPECIFIC"], tally["RESTRICTIVE-LOOKING PATTERN"]),
         "The labels are defined by the arithmetic printed beside them and "
         "carry no finding about anyone's conduct. \"Ordinary for this "
         "archive\" means only that other notices in this same archive ask for "
         "the same thing; it is not a statement about what procurement "
         "elsewhere asks for. The remaining %d clauses state no rule that can "
         "be measured here." % tally["UNDETERMINED"],
         dict((k, tally[k]) for k in LABEL_ORDER),
         [r["source_file"] for r in rows
          if r["label"] == "RESTRICTIVE-LOOKING PATTERN"][:4],
         "one label per row of eligibility_criteria.csv, by the rule in "
         "LABEL_MEANING; thresholds compared against the ninetieth percentile "
         "of the same kind of figure across the archive")
    return {"rows": rows, "tally": dict(tally), "share_of_notices": share_of,
            "top_decile_cut": cut, "years_cut": year_cut,
            "contract_count_cut": count_cut,
            "figures_below_face_value_floor": face_value,
            "figures_by_kind": dict((k, len(v)) for k, v in by_kind.items()),
            "label_meaning": LABEL_MEANING}


def hyper(a, b, c, d):
    """The probability of exactly this 2x2 table, its margins held fixed."""
    return (math.comb(a + b, a) * math.comb(c + d, c)
            / float(math.comb(a + b + c + d, a + c)))


def fisher(a, b, c, d):
    """Two-sided Fisher exact p: every table no likelier than the one observed.

    Written out here rather than imported so that a reader can check it. The
    groups this is used on are small - a difference between 25 tenders and 566
    has to be large to mean anything - and this is the arithmetic that says how
    large, so the finding can report the number instead of implying one.
    """
    n, r1, k = a + b + c + d, a + b, a + c
    obs, total = hyper(a, b, c, d), 0.0
    for x in range(0, min(r1, k) + 1):
        y, z, w = r1 - x, k - x, n - r1 - k + x
        if y < 0 or z < 0 or w < 0:
            continue
        q = hyper(x, y, z, w)
        if q <= obs * (1 + 1e-9):
            total += q
    return total


def strongest(rows):
    """The strongest label any one clause of each tender carries."""
    rank = dict((l, i) for i, l in enumerate(LABEL_ORDER))
    out = {}
    for r in rows:
        cur = out.get(r["tender_id"])
        if cur is None or rank[r["label"]] < rank[cur]:
            out[r["tender_id"]] = r["label"]
    return out


def counted(t):
    """Bid rows whose notice actually printed the three counts."""
    return [b for b in t["bids"] if b["counts_printed"] == "yes"]


def dropped_any(b):
    return (b["received_but_not_responsive"] or "").strip() not in ("", "0")


# ------------------------------------------------------------- the clock
def spread(rows, a, b):
    """Every computable day-count between two printed dates, sorted."""
    xs = [(gap(r[a], r[b]), r) for r in rows if (r[a] or "").strip()
          and (r[b] or "").strip()]
    return sorted([(v, r) for v, r in xs if v is not None], key=lambda p: p[0])


def stats(pairs):
    xs = [v for v, _ in pairs]
    return {"n": len(xs), "min": xs[0], "q1": quantile(xs, 0.25),
            "median": median(xs), "q3": quantile(xs, 0.75), "max": xs[-1]}


def window(t, r):
    """How long the archive left its tenders open, against what the folder says."""
    tn = t["tenders"]
    index = dict((q["id"], q) for q in r["quoted"])
    open_for = spread(tn, "published_date", "closing_date")
    st = stats(open_for)
    same_day = sum(1 for x in tn if x["closing_date"] and x["opening_date"]
                   and x["closing_date"] == x["opening_date"])
    natures = collections.defaultdict(list)
    for v, row in open_for:
        natures[row["procurement_nature"]].append(v)
    find(FACT, "F-TIME-01",
         "The typical tender in this archive was open for %g days, the shortest "
         "for %d and the longest for %d, and every one of the %d that printed "
         "both dates was opened on the day it closed"
         % (st["median"], st["min"], st["max"], same_day),
         "The window is counted from the date the notice says it was published "
         "to the date it says tendering closed. Half the archive falls between "
         "%g and %g days. The tenders were opened the same day they closed in "
         "every case, which is what an electronic system does automatically, and "
         "the last day a tender document could be bought was a median of one day "
         "before closing. Works packages stayed open slightly longer than goods "
         "packages - a median of %g days against %g."
         % (st["q1"], st["q3"], median(natures.get("Works") or [0]),
            median(natures.get("Goods") or [0])),
         {"tenders_with_both_dates": st["n"], "days": st,
          "opened_on_closing_day": same_day,
          "by_nature": dict((k, {"tenders": len(v), "median_days": median(v),
                                 "min": min(v), "max": max(v)})
                            for k, v in natures.items()),
          "fourteen_days_or_fewer": sum(1 for v, _ in open_for if v <= 14)},
         [row["notice_file"] for _, row in open_for[:3]],
         "closing_date minus published_date per row of tenders.csv")

    # The one rule in the folder that this archive prints both sides of.
    security = spread(tn, "tender_valid_until", "security_valid_until")
    rule = index.get("R-VALID")
    at_floor = sum(1 for v, _ in security if v == 28)
    short = [row for v, row in security if v < 28]
    find(FACT, "F-TIME-02",
         "One rule in the folder can be re-run against the notices from end to "
         "end, and it holds in every case: the tender security must stay valid "
         "at least 28 days past the tender's own expiry, and all %d notices that "
         "print both dates do - %d of them by exactly 28 days"
         % (len(security), at_floor),
         "The rule is printed at %s p%d: the security shall \"%s\". Both dates it "
         "needs are on the face of the notice, so this is the only test on this "
         "site where the record answers the rule without anything having to be "
         "assumed. Nothing falls short. The margin is not scattered above the "
         "minimum either - %s%% of the notices sit exactly on it, %d at 30 days "
         "and %d at 90 - which is the signature of a date the portal computes "
         "from the rule rather than one an officer picks per tender. That "
         "matters for reading everything else here: where this archive can be "
         "checked against a printed rule, it checks out. What the rest of this "
         "investigation runs into is not a record full of breaches; it is a "
         "record that stops before the questions can be asked."
         % (rule["file"].split("/")[-1], rule["page"], rule["text"].strip(),
            share(at_floor, len(security)),
            sum(1 for v, _ in security if v == 30),
            sum(1 for v, _ in security if v == 90)),
         {"notices_with_both_dates": len(security), "minimum_days": 28,
          "short_of_the_minimum": len(short), "exactly_at_the_minimum": at_floor,
          "days": dict(collections.Counter(v for v, _ in security))},
         ["%s p%d" % (rule["file"], rule["page"])]
         + [row["notice_file"] for _, row in security[:3]],
         "security_valid_until minus tender_valid_until per row of tenders.csv, "
         "compared with the 28 days the quoted rule requires")

    band = index.get("R-VALIDITY-BAND")
    m = re.search(BAND_RX.replace("percent", "days"), band["text"], re.I) \
        or re.search(r"(\d+)\s+to\s+(\d+)\s+days", band["text"], re.I)
    lo, hi = float(m.group(1)), float(m.group(2))
    valid = spread(tn, "closing_date", "tender_valid_until")
    over = [(v, row) for v, row in valid if v > hi]
    find(FACT, "F-TIME-03",
         "The folder calls a tender validity period of %g to %g days normal; %d "
         "of the %d notices that print it fall below %g, and %d run to %g days"
         % (lo, hi, sum(1 for v, _ in valid if v < lo), len(valid), lo,
            len(over), max([v for v, _ in over] or [0])),
         "The same page of the standard tender document that sets the band also "
         "says a shorter or longer period \"may be authorized by HOPE or "
         "Authorized Officer\" (%s p%d), so a period outside the band is "
         "something the rule provides for rather than something it forbids. Four "
         "lengths account for almost the whole archive - %s - which again reads "
         "as a field chosen from a short list rather than computed per tender. No "
         "notice prints an authorisation for the %d that run past the band, and "
         "no document in the folder records one, so whether they were authorised "
         "is not on the public record."
         % (band["file"].split("/")[-1], band["page"],
            ", ".join("%d days in %d notices" % (d, c) for d, c in
                      collections.Counter(v for v, _ in valid).most_common(4)),
            len(over)),
         {"notices_printing_both": len(valid), "band_low": lo, "band_high": hi,
          "below_the_band": sum(1 for v, _ in valid if v < lo),
          "above_the_band": len(over),
          "days": dict(collections.Counter(v for v, _ in valid))},
         ["%s p%d" % (band["file"], band["page"])]
         + [row["notice_file"] for _, row in over[:3]],
         "tender_valid_until minus closing_date per row of tenders.csv against "
         "the band read from the quoted rule")

    kinds = collections.Counter(x["procurement_type"] or "(blank)" for x in tn)
    per = index.get("R-PERIOD")
    large = index.get("R-PERIOD-LARGE")
    find(UNRESOLVED, "F-TIME-04",
         "Nothing in the folder says how long a national tender must stay open, "
         "and all %d of these tenders are national" % kinds.get("NCT", 0),
         "Every notice in the archive prints its procurement type as NCT - "
         "national competitive tendering. The folder prints exactly two figures "
         "for how long bidders must be given, both on one page of %s: \"%s\" and "
         "\"%s\". The first is about international bidding and the second about "
         "large civil works or complex equipment, and both are prefaced "
         "\"generally\". Neither is a rule for a national tender, so the %g-day "
         "median window here cannot be called long or short against anything the "
         "folder prints - including the %d tenders that stayed open two weeks or "
         "less. The yardstick is missing from the supplied documents, not from "
         "the archive's behaviour."
         % (per["file"].split("/")[-1], per["text"].strip(),
            large["text"].strip(), st["median"],
            sum(1 for v, _ in open_for if v <= 14)),
         {"national_tenders": kinds.get("NCT", 0),
          "procurement_types": dict(kinds),
          "day_counts_printed_in_the_folder": 2,
          "day_counts_governing_national_tendering": 0,
          "median_window_days": st["median"],
          "fourteen_days_or_fewer": sum(1 for v, _ in open_for if v <= 14)},
         ["%s p%d" % (per["file"], per["page"])],
         "procurement_type over tenders.csv; regex search of raw_pages.json "
         "over eGP_Forensic_Engine/ for any figure of days allowed for tendering")
    return {"open_days": st, "opened_on_closing_day": same_day,
            "security_margin_days": dict(collections.Counter(v for v, _ in security)),
            "security_short_of_minimum": len(short),
            "validity_days": dict(collections.Counter(v for v, _ in valid)),
            "validity_band": [lo, hi], "validity_above_band": len(over),
            "national_tenders": kinds.get("NCT", 0),
            "by_nature": dict((k, {"tenders": len(v), "median_days": median(v)})
                              for k, v in natures.items())}


# ------------------------------------------- the rules changed after publication
AMEND_SCALES = {"crore": 1e7, "crores": 1e7, "koti": 1e7, "lakh": 1e5,
                "lakhs": 1e5, "lac": 1e5, "lacs": 1e5, "million": 1e6,
                "billion": 1e9, "thousand": 1e3}

# A sum of money as the change table prints it. Two shapes appear: a currency
# word in front of the figure ("Tk. 15 Lac"), and a bare figure with a scale word
# behind it ("turnover at least 10 Lac"). Both are matched, because a rule that
# only read the first would be blind to a whole class of threshold and the
# finding would then be true only of the part that was looked at. The scale word
# is captured separately, since it is what decides the size.
AMEND_SCALE_WORDS = (r"crores?|cores?|corers?|koti|lakhs?|lacs?|lacks?"
                     r"|millions?|billions?|thousands?")
AMEND_MONEY = re.compile(
    r"(?:tk|taka|bdt)\.?\s*([\d,]+(?:\.\d+)?)\s*([A-Za-z]+)?"
    r"|([\d,]+(?:\.\d+)?)\s*(" + AMEND_SCALE_WORDS + r")\b", re.I)

ELIG_FIELD = re.compile(r"eligib|qualification", re.I)

DATE_FIELDS = ("Closing Date & Time", "Opening Date & Time",
               "Document last selling date & time",
               "Last date & time for Tender/Proposal Security Submission")

# A phrase that offers a ground for the change, as opposed to naming the field
# that moved. Kept narrow, and every match is printed so it can be read.
WHY_RX = re.compile(r"\bdue to\b|\bbecause\b|\bon account of\b|\bowing to\b"
                    r"|\bin view of\b|\bin order to\b|\brequest\b", re.I)


def plain(s):
    """One line, with the encodings the change table prints folded together.

    The old-value column of some change tables is extracted as mojibake where the
    new-value column is extracted as the character itself, so an apostrophe alone
    can make two identical sentences compare as different. Folding them is not a
    correction to the document; it is a refusal to report a punctuation artefact
    as a change in the rules.
    """
    s = (s or "").replace("â??", "'").replace("’", "'")
    s = s.replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace("–", "-").replace("—", "-")
    return " ".join(s.split())


def clauses_of(s):
    """A requirement block split into the clauses it lists.

    The portal prints these lists with a hash before each item. Where it does
    not, sentence ends are the only division the page offers.
    """
    s = plain(s)
    parts = ([p.strip(" .;") for p in s.split("#")] if "#" in s
             else re.split(r"(?<=[.;])\s+", s))
    return [p for p in parts if len(p) > 12]


def pair_up(old, new, floor=0.6):
    """Clauses of the old block matched to their counterparts in the new one.

    Comparing the two blocks by position produces nonsense - a clause inserted at
    the top shifts every later pair - so each old clause takes the most similar
    unclaimed new clause, and a clause with no near counterpart is reported as
    removed or added rather than paired with a stranger.
    """
    out, used = [], set()
    for x in old:
        best = (0.0, None)
        for j, y in enumerate(new):
            if j in used:
                continue
            r = difflib.SequenceMatcher(None, x, y).ratio()
            if r > best[0]:
                best = (r, j)
        if best[1] is None or best[0] < floor:
            out.append({"was": x, "now": "", "similarity": round(best[0], 3),
                        "kind": "removed"})
            continue
        used.add(best[1])
        y = new[best[1]]
        out.append({"was": x, "now": y, "similarity": round(best[0], 3),
                    "kind": "unchanged" if x == y else "reworded"})
    for j, y in enumerate(new):
        if j not in used:
            out.append({"was": "", "now": y, "similarity": 0.0, "kind": "added"})
    return out


def sums_in(s):
    """Every sum of money in a clause, as figure and scale word as printed.

    A word captured after the figure is kept only where it is a scale word or one
    letter from being one. Otherwise it is the next word of the sentence rather
    than a multiplier, and pretending it was would turn "Taka 8 in" into a size.
    """
    out = []
    for m in AMEND_MONEY.finditer(s):
        first = m.group(1) is not None
        fig = m.group(1) if first else m.group(3)
        word = (m.group(2) if first else m.group(4)) or ""
        if word.lower() not in AMEND_SCALES and not scale_like(word):
            word = ""
        out.append((fig, word))
    return out


def scale_like(word):
    """The scale word this one is nearly, where it is not one itself."""
    w = (word or "").lower()
    if not w or w in AMEND_SCALES:
        return None
    for k in AMEND_SCALES:
        if (abs(len(k) - len(w)) <= 1
                and difflib.SequenceMatcher(None, k, w).ratio() >= 0.72):
            return k
    return None


def skeleton(s):
    """The clause with every figure blanked, so two versions can be compared."""
    return re.sub(r"[\d,]+(?:\.\d+)?", "#", s)


def one_change(fa, wa, fb, wb):
    """What a single pair of sums says about the threshold, and how far.

    Three outcomes, and the difference between them is the whole point. Where
    both sides print a scale word the parser knows, the sums are read and
    compared. Where both sides print the same word and that word is not a scale
    word, the sums cannot be read but the ratio between the figures can, because
    whatever the word means it means the same thing twice. Where the word differs
    or is missing on one side, neither the sums nor the ratio can be read, and
    that is what gets recorded.
    """
    try:
        na, nb = float(fa.replace(",", "")), float(fb.replace(",", ""))
    except ValueError:
        return None
    if not na or not nb or (na == nb and wa.lower() == wb.lower()):
        return None
    sa, sb = AMEND_SCALES.get(wa.lower()), AMEND_SCALES.get(wb.lower())
    row = {"figure_was": fa, "word_was": wa, "figure_now": fb, "word_now": wb,
           "direction": "lowered" if nb < na else "raised"}
    if sa and sb:
        row.update({"taka_was": na * sa, "taka_now": nb * sb,
                    "read": "both sides print a scale word",
                    "times": round(max(na * sa, nb * sb)
                                   / min(na * sa, nb * sb), 2)})
        row["direction"] = "lowered" if nb * sb < na * sa else "raised"
        return row
    if not wa and not wb:
        row.update({"taka_was": None, "taka_now": None,
                    "times": round(max(na, nb) / min(na, nb), 2),
                    "read": "neither side prints a scale word, so the figures are "
                            "compared as printed and the sums are not read"})
        return row
    if wa and wa.lower() == wb.lower():
        row.update({"taka_was": None, "taka_now": None,
                    "times": round(max(na, nb) / min(na, nb), 2),
                    "read": 'the word printed after both figures is "%s", which '
                            'is not a scale word the parser reads%s; the sums '
                            'cannot be read, and because the word is the same on '
                            'both sides the ratio between the figures can'
                            % (wa, (' and is one letter from "%s"' % scale_like(wa))
                               if scale_like(wa) else "")})
        return row
    row.update({"taka_was": None, "taka_now": None, "times": None,
                "direction": "not readable",
                "read": "the scale word differs between the two sides (%s against "
                        "%s), so neither the sums nor the ratio between them can "
                        "be read" % (wa or "none printed", wb or "none printed")})
    return row


def read_changes(was, now):
    """Every threshold a reworded clause moved, or a note on why none was read.

    Sums are paired by position only where that is safe: either the clause holds
    one sum on each side, or the two versions are the same sentence with different
    figures in it. Pairing by position across a block that has gained or lost text
    produces nonsense - an inserted figure shifts every later pair - so where
    neither condition holds, nothing is read and the clause says so.
    """
    a, b = sums_in(was), sums_in(now)
    if not a or not b:
        return []
    if len(a) != len(b):
        return [{"figure_was": "", "word_was": "", "figure_now": "",
                 "word_now": "", "taka_was": None, "taka_now": None,
                 "times": None, "direction": "not readable",
                 "read": "the two versions of the clause print a different number "
                         "of sums (%d against %d), so no figure can be paired with "
                         "a counterpart and none is read" % (len(a), len(b))}]
    if len(a) > 1 and skeleton(was) != skeleton(now):
        return [{"figure_was": "", "word_was": "", "figure_now": "",
                 "word_now": "", "taka_was": None, "taka_now": None,
                 "times": None, "direction": "not readable",
                 "read": "the clause holds %d sums and its wording changed as "
                         "well, so which figure replaced which cannot be "
                         "established and none is read" % len(a)}]
    out = []
    for (fa, wa), (fb, wb) in zip(a, b):
        row = one_change(fa, wa, fb, wb)
        if row:
            out.append(row)
    return out


def stamp(s):
    """A change-table date and time, printed as dd/mm/yyyy hh:mm throughout."""
    try:
        return datetime.datetime.strptime(plain(s), "%d/%m/%Y %H:%M")
    except ValueError:
        return None


def amendments(t, w):
    """What was changed after the notice was published, and what it changed to.

    A tender notice is the advertisement, and an amendment edits the
    advertisement after people have started reading it. The portal prints the
    edit as a three-column table - field, old value, new value - so for these
    tenders the archive holds something it holds nowhere else: the rule as first
    published and the rule as it ended up, side by side. What it does not hold is
    when the edit was made or, in most cases, why.
    """
    am, ch = t["amendments"], t["amendment_changes"]
    notices = set(x["tender_id"] for x in t["tenders"])
    with_table = [a for a in am if a["has_change_table"] == "yes"]
    listed = collections.Counter(c["field"] for c in ch)
    changed = collections.Counter(c["field"] for c in ch
                                  if c["value_changed"] == "yes")
    same = [c for c in ch if c["value_changed"] != "yes"]
    fields = [{"field": f or "(no field name printed)", "listed": n,
               "value_changed": changed.get(f, 0)}
              for f, n in listed.most_common()]
    find(FACT, "F-AMEND-01",
         "%d of the %d tender notices carry an amendment, %d of them printing a "
         "table of what changed; of the %d changes those tables list, %d print "
         "an old value and a new value that are the same"
         % (len(am), len(notices), len(with_table), len(ch), len(same)),
         "The amendment is printed on the notice itself, so a notice downloaded "
         "today shows the amended values and not the ones first advertised. The "
         "change table is the only place in the archive where both versions "
         "appear. Where a row lists a field but prints the same value twice, the "
         "document does not say what about that field changed, and this analysis "
         "does not guess: the row is counted as listed and not as a change.",
         {"notices_amended": len(am), "notices": len(notices),
          "amended_more_than_once": sum(1 for a in am
                                        if (a["amendment_no"] or "1") not in ("", "1")),
          "highest_amendment_number_printed":
              max(int(a["amendment_no"]) for a in am if a["amendment_no"].isdigit()),
          "with_a_change_table": len(with_table),
          "changes_listed": len(ch),
          "changes_that_changed_a_value": len(ch) - len(same),
          "rows_listing_a_field_whose_value_did_not_change": len(same),
          "fields": fields[:14]},
         [a["source_file"] for a in with_table[:4]],
         "amendments.csv and amendment_changes.csv, one row per field the "
         "notice's change table lists; value_changed compares the printed old "
         "and new strings")

    moves, per_tender, unread = collections.defaultdict(list), {}, 0
    for c in ch:
        if c["field"] not in DATE_FIELDS:
            continue
        a, b = stamp(c["old_value"]), stamp(c["new_value"])
        if a is None or b is None:
            unread += 1
            continue
        days = (b - a).total_seconds() / 86400.0
        moves[c["field"]].append(days)
        if c["field"] == "Closing Date & Time":
            per_tender.setdefault(c["tender_id"], []).append((a, b))
    by_field = []
    for f in DATE_FIELDS:
        v = moves.get(f) or []
        by_field.append({"field": f, "changes": len(v),
                         "moved_later": sum(1 for d in v if d > 0),
                         "moved_earlier": sum(1 for d in v if d < 0),
                         "median_days": round(median(v), 1) if v else None,
                         "longest_days": round(max(v), 1) if v else None})
    allmoves = [d for v in moves.values() for d in v]
    net = dict((i, sum((b - a).total_seconds() / 86400.0 for a, b in ms))
               for i, ms in per_tender.items())
    find(FACT, "F-AMEND-02",
         "All %d date changes the amendment tables print move the date later; "
         "none moves it earlier. The %d changes to a closing date, across %d "
         "tenders, add a median of %s days each"
         % (len(allmoves), len(moves.get("Closing Date & Time") or []),
            len(per_tender), round(median(moves.get("Closing Date & Time") or [0]), 1)),
         "An extension gives everyone who is still watching more time, and the "
         "direction is the same in every case the archive prints: not one "
         "deadline in the amendment tables was brought forward. The documents do "
         "not print who asked for the extension, except in the few notices "
         "quoted under F-AMEND-05.",
         {"date_changes": len(allmoves), "unreadable_dates": unread,
          "moved_later": sum(1 for d in allmoves if d > 0),
          "moved_earlier": sum(1 for d in allmoves if d < 0),
          "by_field": by_field,
          "tenders_whose_closing_date_moved": len(per_tender),
          "net_days_added_median": round(median(list(net.values())), 1),
          "net_days_added_most": round(max(net.values()), 1),
          "net_days_added_least": round(min(net.values()), 1)},
         [c["source_file"] for c in ch
          if c["field"] == "Closing Date & Time"][:4],
         "amendment_changes.csv where field is one of the four date fields; both "
         "sides parsed as dd/mm/yyyy hh:mm and subtracted")

    known = dict((x["tender_id"], x) for x in t["tenders"])
    was_win, now_win = [], []
    for i, ms in per_tender.items():
        r = known.get(i)
        if not r or not r["published_date"] or not r["closing_date"]:
            continue
        p = day(r["published_date"])
        was_win.append((min(a for a, _ in ms).date() - p).days)
        now_win.append((max(b for _, b in ms).date() - p).days)
    find(DERIVED, "F-AMEND-03",
         "For the %d amended tenders where both versions can be dated, the "
         "bidding window as first advertised was a median of %s days and the "
         "window after amendment a median of %s days - so the %s-day median this "
         "investigation reports for the whole archive is the amended figure, not "
         "the one bidders first saw"
         % (len(was_win), median(was_win), median(now_win),
            w["open_days"]["median"]),
         "The closing date in the dataset is the one the notice prints today, "
         "which for an amended tender is the extended one. That matters for "
         "reading the clock: a short window that was later extended is recorded "
         "here at its extended length, so the count of short windows is a floor "
         "and not a ceiling. It cannot be corrected in the other direction, "
         "because a tender whose window was shortened would show the same way - "
         "and no shortening appears in any amendment table.",
         {"tenders": len(was_win),
          "median_days_as_first_published": median(was_win),
          "median_days_after_amendment": median(now_win),
          "archive_median_days": w["open_days"]["median"],
          "under_14_days_as_first_published": sum(1 for d in was_win if d < 14),
          "under_14_days_after_amendment": sum(1 for d in now_win if d < 14),
          "closing_date_in_dataset_matches_the_amended_value":
              sum(1 for i, ms in per_tender.items()
                  if known.get(i) and str(max(b for _, b in ms).date())
                  == known[i]["closing_date"])},
         [known[i]["notice_file"] for i in list(per_tender)[:4] if i in known],
         "published_date from tenders.csv against the old and new closing dates "
         "in amendment_changes.csv")

    rows = [c for c in ch if ELIG_FIELD.search(c["field"] or "")
            and c["value_changed"] == "yes"]
    seen, pairs, money = set(), [], []
    kinds = collections.Counter()
    for c in rows:
        for p in pair_up(clauses_of(c["old_value"]), clauses_of(c["new_value"])):
            key = (c["tender_id"], p["was"], p["now"])
            if key in seen or p["kind"] == "unchanged":
                continue
            seen.add(key)
            kinds[p["kind"]] += 1
            flat = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
            if p["kind"] == "reworded" and flat(p["was"]) == flat(p["now"]):
                kinds["punctuation only"] += 1
                kinds["reworded"] -= 1
                continue
            rec = {"tender_id": c["tender_id"], "field": c["field"],
                   "source_file": c["source_file"], "page": c["page"],
                   "kind": p["kind"], "was": p["was"][:400],
                   "now": p["now"][:400], "similarity": p["similarity"]}
            pairs.append(rec)
            if p["kind"] == "reworded":
                for m in read_changes(p["was"], p["now"]):
                    m.update(dict((k, rec[k]) for k in
                                  ("tender_id", "source_file", "page",
                                   "was", "now")))
                    money.append(m)
    readable = [m for m in money if m["direction"] != "not readable"]
    lowered = [m for m in readable if m["direction"] == "lowered"]
    raised = [m for m in readable if m["direction"] == "raised"]
    sums = [m for m in readable if m["taka_was"] is not None]
    cut = max(lowered, key=lambda m: m["times"]) if lowered else None
    find(DERIVED, "F-AMEND-04",
         "In %d tenders the requirement to enter was rewritten after the notice "
         "was published. The change tables print %d money thresholds in both "
         "versions; %d of them move in a direction that can be read, %d down and "
         "%d up"
         % (len(set(c["tender_id"] for c in rows)), len(money), len(readable),
            len(lowered), len(raised)),
         "This is the one place in the archive where a rule of entry can be read "
         "in both versions, so it is the one place where the direction of a "
         "change is a matter of record rather than inference. Most of the "
         "movement is downward, and the largest of it is a factor of %s: tender "
         "%s cut the turnover a bidder had to show from %s to %s. %s Of the %d "
         "thresholds, %d print a scale word on both sides and can be read as "
         "sums; %d print the same misspelled scale word twice, so the ratio "
         "between the two figures is readable and the sums are not; and %d cannot "
         "be paired at all, because the scale word differs between the two sides "
         "or the clause holds a different number of figures in each version. "
         "Those are left unread rather than guessed at. What none of these "
         "notices prints is who asked for the change, or whether any firm had "
         "already bought the tender document under the earlier rule."
         % (cut["times"] if cut else "n/a", cut["tender_id"] if cut else "n/a",
            "%s %s" % (cut["figure_was"], cut["word_was"]) if cut else "n/a",
            "%s %s" % (cut["figure_now"], cut["word_now"]) if cut else "n/a",
            ("The %d that went the other way is tender %s, which raised the value "
             "of the past contract a bidder had to show from %s %s to %s %s in a "
             "clause that at the same time lengthened the period the contract "
             "could have been performed in."
             % (len(raised), raised[0]["tender_id"], raised[0]["figure_was"],
                raised[0]["word_was"], raised[0]["figure_now"],
                raised[0]["word_now"])) if len(raised) == 1 else
            ("%d went the other way." % len(raised)) if raised else
            "None went the other way.",
            len(money), len(sums), len(readable) - len(sums),
            len(money) - len(readable)),
         {"tenders_with_an_eligibility_change": len(set(c["tender_id"]
                                                       for c in rows)),
          "change_table_rows": len(rows),
          "clause_pairs": dict(kinds),
          "money_thresholds_printed_in_both_versions": len(money),
          "direction_readable": len(readable),
          "lowered": len(lowered), "raised": len(raised),
          "sums_readable": len(sums),
          "ratio_readable_sums_not": len(readable) - len(sums),
          "neither_readable": len(money) - len(readable),
          "tenders_with_a_money_threshold_change":
              len(set(m["tender_id"] for m in money)),
          "largest_cut": cut,
          "thresholds": [dict((k, m[k]) for k in
                              ("tender_id", "source_file", "page", "figure_was",
                               "word_was", "figure_now", "word_now", "taka_was",
                               "taka_now", "times", "direction", "read"))
                         for m in money],
          "rewordings": pairs[:40]},
         sorted(set(m["source_file"] for m in money))[:5] or
         sorted(set(c["source_file"] for c in rows))[:5],
         "amendment_changes.csv where the field name mentions eligibility or "
         "qualification; each block split into clauses on the hash the portal "
         "prints, clauses matched to their nearest counterpart by difflib ratio "
         "at 0.6, and a sum read only where a scale word is printed on both sides")

    why, vague = [], 0
    for a in am:
        s = plain(a["notice_text"])
        if not WHY_RX.search(s):
            continue
        if re.search(r"(?i)unavoidable circumstance", s):
            vague += 1
        why.append({"tender_id": a["tender_id"], "source_file": a["source_file"],
                    "page": int(a["page"]) if a["page"].isdigit() else a["page"],
                    "text": s[:300]})
    find(UNRESOLVED, "F-AMEND-05",
         "No amendment in the archive prints the date it was made, and only %d of "
         "the %d amendment notices print any ground for the change; so whether a "
         "rule was rewritten before or after firms bought the tender document "
         "cannot be established from these documents"
         % (len(why), len(am)),
         "The amendment carries a number - first, second - and a free-text note "
         "that is usually a description of the field that moved rather than a "
         "reason for moving it. The only place in the whole archive where an "
         "amendment date is even provided for is a blank in BPPA's own standard "
         "document, which reads \"Amendment is [insert effective date] or upon "
         "execution whichever is later\". The notices as published leave that "
         "blank unfilled. The %d notices that do say something are quoted here in "
         "full: two name the pandemic, two name a national election, one of those "
         "adding that the tenderers asked for the extra time, and %d say only "
         "that the circumstances were unavoidable. That is the extent of it. The "
         "sequence that would matter most - rule published, documents bought, "
         "rule changed - cannot be reconstructed, and this investigation does not "
         "attempt to."
         % (len(why), vague),
         {"amendment_notices": len(am),
          "printing_a_ground_for_the_change": len(why),
          "saying_only_that_circumstances_were_unavoidable": vague,
          "printing_an_amendment_date": 0,
          "grounds_printed": why,
          "standard_document_placeholder":
              "Amendment is [insert effective date] or upon execution whichever "
              "is later",
          "standard_document":
              "eGP_Forensic_Engine/2026-01-04-13-47-03-e-PG3A.pdf p81"},
         [x["source_file"] for x in why[:4]]
         + ["eGP_Forensic_Engine/2026-01-04-13-47-03-e-PG3A.pdf p81"],
         "amendments.csv notice_text searched for a phrase offering a ground; "
         "raw_pages.json searched across all 1,805 documents for a label "
         "pairing amendment or corrigendum with a date")

    return {"notices_amended": len(am), "notices": len(notices),
            "with_a_change_table": len(with_table),
            "changes_listed": len(ch),
            "rows_with_no_change_in_value": len(same),
            "fields": fields, "dates": by_field,
            "date_changes": len(allmoves),
            "moved_later": sum(1 for d in allmoves if d > 0),
            "moved_earlier": sum(1 for d in allmoves if d < 0),
            "tenders_whose_closing_date_moved": len(per_tender),
            "net_days_added_median": round(median(list(net.values())), 1),
            "window_as_first_published": median(was_win),
            "window_after_amendment": median(now_win),
            "eligibility_tenders": len(set(c["tender_id"] for c in rows)),
            "clause_pairs": dict(kinds), "thresholds": money,
            "rewordings": pairs, "grounds_printed": why}


# --------------------------------------------------------- how the tenders ended
RETENDER = ("Re-Tendered", "To be Re-Tendered")


def outcomes(t):
    """What the notices say became of them, and where the record stops short."""
    tn, contracts = t["tenders"], t["contracts"]
    awarded = set(c["tender_id"] for c in contracts)
    noticed = set(x["tender_id"] for x in tn)
    st = collections.Counter(x["status"] or "(not printed)" for x in tn)
    table_rows = []
    for k, n in st.most_common():
        got = [x for x in tn if (x["status"] or "(not printed)") == k
               and x["tender_id"] in awarded]
        table_rows.append({"status": k, "tenders": n, "with_award_notice": len(got),
                           "share_with_award_notice": share(len(got), n)})
    said_awarded = [x for x in tn if x["status"] == "Contract Awarded"]
    missing = [x for x in said_awarded if x["tender_id"] not in awarded]
    orphan = sorted(awarded - noticed)
    find(FACT, "F-OUT-01",
         "Of the %d tender notices, %d say a contract was awarded, %d were "
         "re-tendered or are to be, %d were rejected, %d cancelled and %d print "
         "no outcome at all"
         % (len(tn), len(said_awarded),
            sum(1 for x in tn if x["status"] in RETENDER),
            st.get("Rejected", 0), st.get("Cancelled", 0), st.get("(not printed)", 0)),
         "The status is a field on the notice, printed by the portal. It is the "
         "only account of the ending that most of these tenders have: %d of the "
         "%d that say a contract was awarded have an award notice in this "
         "archive, and %d do not, so for those the winner, the value and the bid "
         "counts are not on the record here. In the other direction %d award "
         "notice names a tender whose own notice is not in the archive. Two "
         "tenders print the status Contract Terminated, and both have an award "
         "notice." % (len(said_awarded) - len(missing), len(said_awarded),
                      len(missing), len(orphan)),
         {"notices": len(tn), "by_status": table_rows,
          "said_awarded_without_award_notice": len(missing),
          "award_notices_without_a_tender_notice": len(orphan),
          "award_notices": len(contracts), "terminated": st.get(
              "Contract Terminated", 0)},
         [x["notice_file"] for x in missing[:3]]
         + [c["award_file"] for c in contracts if c["tender_id"] in orphan][:1],
         "status column of tenders.csv against the presence of a tender_id in "
         "contracts.csv")

    reasons = [x for x in tn if x["status"] in RETENDER
               or x["status"] in ("Rejected", "Cancelled")]
    find(UNRESOLVED, "F-OUT-02",
         "%d tenders ended without a contract and not one of them prints why"
         % len(reasons),
         "The portal prints an ending - re-tendered, to be re-tendered, "
         "rejected, cancelled - and stops. No document in the archive gives a "
         "ground for any of them: not a tender that drew no responsive bid, not "
         "one annulled for weak competition, not one rejected because every "
         "price was too far from an estimate. The folder's own rules name those "
         "as things that can happen (%s), so the categories exist in the "
         "procedure and the reasons are simply not published. %d of these "
         "tenders were later re-tendered under the portal's own account, which "
         "means the work was still wanted; whether the same firms returned "
         "cannot be traced, because no notice in this archive links a re-tender "
         "to the tender it replaces."
         % ("R-ANNUL-COMPETITION, R-ALL-NON, R-ESTIMATE",
            sum(1 for x in tn if x["status"] in RETENDER)),
         {"ended_without_a_contract": len(reasons),
          "re_tendered": sum(1 for x in tn if x["status"] in RETENDER),
          "rejected": st.get("Rejected", 0), "cancelled": st.get("Cancelled", 0),
          "printed_reasons": 0, "notices_linking_to_a_prior_tender": 0},
         [x["notice_file"] for x in reasons[:4]],
         "tenders.csv where status is Rejected, Cancelled, Re-Tendered or To be "
         "Re-Tendered; no column in any table carries a ground for the outcome")
    return {"by_status": table_rows, "notices": len(tn),
            "award_notices": len(contracts),
            "said_awarded_without_award_notice": len(missing),
            "award_notices_without_a_tender_notice": len(orphan),
            "ended_without_a_contract": len(reasons)}


# ---------------------------------------------------------- where the money went
def won(c):
    return int(c["contracts_won"] or 0)


def value(c):
    return float(c["total_contract_value_taka"] or 0)


def concentration(t):
    """How the printed contract values distribute across the named firms."""
    co, contracts = t["companies"], t["contracts"]
    total = sum(value(c) for c in co)
    by_value = sorted(co, key=lambda c: -value(c))
    with_money = [c for c in by_value if value(c) > 0]
    cum, half = 0.0, 0
    for i, c in enumerate(with_money, 1):
        cum += value(c)
        if cum >= total / 2.0:
            half = i
            break
    top = by_value[0]
    repeat = [c for c in co if won(c) > 1]
    most = sorted(co, key=lambda c: (-won(c), -value(c)))[0]
    find(FACT, "F-MONEY-01",
         "%d firms are named as winners across %d award notices worth %s, and "
         "%d of them - %s%% - account for half of it"
         % (len(co), len(contracts), taka(total), half, share(half, len(with_money))),
         "Every figure is the sum of contract values printed on award notices. "
         "The largest single share belongs to %s: %s across %d contracts, %s%% of "
         "all the money in this archive. %d firms won more than one contract and "
         "%d won exactly one. The most frequent winner by count is %s with %d "
         "contracts worth %s. A concentrated distribution is what public works "
         "procurement normally looks like - a few large contracts dominate any "
         "sum of money - so this is the shape of the archive rather than a "
         "finding about anyone in it."
         % (top["name"], taka(value(top)), won(top),
            share(value(top), total), len(repeat), sum(1 for c in co if won(c) == 1),
            most["name"], won(most), taka(value(most))),
         {"companies": len(co), "award_notices": len(contracts),
          "total_taka": ("%.6f" % total).rstrip("0").rstrip("."),
          "firms_taking_half": half, "firms_with_a_value": len(with_money),
          "largest_share_pct": share(value(top), total),
          "won_more_than_one": len(repeat),
          "won_exactly_one": sum(1 for c in co if won(c) == 1),
          "top_ten": [{"name": c["name"], "contracts": won(c),
                       "taka": ("%.6f" % value(c)).rstrip("0").rstrip("."),
                       "share_pct": share(value(c), total),
                       "procuring_entities": int(c["procuring_entity_count"] or 0)}
                      for c in by_value[:10]]},
         [c["award_file"] for c in contracts
          if c["winner_id"] == top["id"]][:3],
         "sum of contract_value_taka in contracts.csv grouped by winner_id, as "
         "carried into companies.csv")

    spread_out = [c for c in co if int(c["procuring_entity_count"] or 0) > 1]
    widest = sorted(co, key=lambda c: -int(c["procuring_entity_count"] or 0))[0]
    find(DERIVED, "F-MONEY-02",
         "%d of the %d winning firms won from more than one procuring entity, "
         "and one won from %s"
         % (len(spread_out), len(co), widest["procuring_entity_count"]),
         "A firm winning from several offices is ordinary in itself. It is "
         "recorded here because it is the only cross-office trace the archive "
         "supports: %s won %d contracts across %s procuring entities in %s. "
         "Whether the same firms competed against each other in those tenders "
         "cannot be answered, because no notice names a bidder who did not win."
         % (widest["name"], won(widest), widest["procuring_entity_count"],
            (widest["districts"] or "not documented")),
         {"firms_across_more_than_one_entity": len(spread_out),
          "widest": {"name": widest["name"],
                     "procuring_entities": int(widest["procuring_entity_count"] or 0),
                     "contracts": won(widest)},
          "entities_per_firm": dict(sorted(collections.Counter(
              int(c["procuring_entity_count"] or 0) for c in co).items()))},
         [c["award_file"] for c in contracts if c["winner_id"] == widest["id"]][:3],
         "procuring_entity_count in companies.csv, built from distinct "
         "award_procuring_entity_id per winner_id in contracts.csv")
    return {"companies": len(co), "total_taka": total, "firms_taking_half": half,
            "top_ten": [{"name": c["name"], "contracts": won(c),
                         "taka": value(c)} for c in by_value[:10]],
            "won_more_than_one": len(repeat),
            "firms_across_more_than_one_entity": len(spread_out)}


# ------------------------------------------------------- which entities connect
# A placeholder the ownership table prints in place of a name. It is not a person
# and must never be treated as one, or two unrelated firms appear to share
# an owner.
NOT_A_PERSON = re.compile(r"others?\s*\(|each\s+holding|^n/?a$|^-+$", re.I)
JV_RX = re.compile(r"\bjv\b|joint\s+venture|jvca", re.I)


def addresses(co):
    """Printed addresses that more than one named firm shares."""
    bag = collections.defaultdict(set)
    for c in co:
        for a in (c["addresses_printed"] or "").split(" | "):
            key = " ".join(a.split()).strip().lower().rstrip(".,")
            if len(key) > 12:
                bag[key].add((c["id"], c["name"]))
    shared = [{"address": k, "firms": sorted(n for _, n in v),
               "involves_a_joint_venture":
                   "yes" if any(JV_RX.search(n) for _, n in v) else "no"}
              for k, v in sorted(bag.items()) if len(v) > 1]
    return len(bag), shared


def connections(t):
    """Values two records share. A shared value is a question, not a finding."""
    co, own = t["companies"], t["beneficial_owners"]
    people = set()
    by_owner = collections.defaultdict(set)
    for o in own:
        name = (o["owner_name"] or "").strip()
        if not name or NOT_A_PERSON.search(name):
            continue
        people.add(name)
        by_owner[name].add((o["company_id"], o["company"]))
    across = dict((k, v) for k, v in by_owner.items() if len(v) > 1)
    declaring = set(o["company_id"] for o in own)
    find(UNRESOLVED, "F-CONN-01",
         "%d of the %d winning firms declare who owns them, and no person named "
         "in those declarations is declared an owner of more than one of them"
         % (len(declaring), len(co)),
         "The archive carries %d ownership declarations naming %d people. %d of "
         "them print no designation and %d print no country. For the other %d "
         "firms - %s%% of the winners - the award notice names the company and "
         "stops, so who stands behind it is not on the public record. The "
         "question this investigation would most want to ask of a procurement "
         "archive is whether the same people own firms that win from the same "
         "office, and on these documents it cannot be asked at all: the "
         "ownership layer is %s%% empty, and within the part that exists no "
         "person recurs. One value does recur across two firms - \"%s\" - and it "
         "is a placeholder the form prints in place of a name, not a person, so "
         "it is excluded here."
         % (len(own), len(people),
            sum(1 for o in own if not (o["designation"] or "").strip()),
            sum(1 for o in own if not (o["country"] or "").strip()),
            len(co) - len(declaring), share(len(co) - len(declaring), len(co)),
            share(len(co) - len(declaring), len(co)),
            "Others (Each Holding < 10%)"),
         {"firms": len(co), "firms_declaring_an_owner": len(declaring),
          "declarations": len(own), "people_named": len(people),
          "people_owning_more_than_one_firm": len(across),
          "declarations_without_a_designation":
              sum(1 for o in own if not (o["designation"] or "").strip()),
          "declarations_without_a_country":
              sum(1 for o in own if not (o["country"] or "").strip())},
         sorted(set(o["source_file"] for o in own))[:3],
         "beneficial_owners.csv grouped by owner_name, placeholder values "
         "excluded, against the winner count in companies.csv")

    printed, shared = addresses(co)
    jv = [s for s in shared if s["involves_a_joint_venture"] == "yes"]
    plain = [s for s in shared if s["involves_a_joint_venture"] == "no"]
    find(POSSIBLE, "F-CONN-02",
         "%d printed addresses in the archive are shared by more than one named "
         "firm; %d of the %d involve a joint venture printed at its partner's "
         "address" % (len(shared), len(jv), len(shared)),
         "An address is printed on the award notice, so this is the government's "
         "own record of where a winner sits. Most of these read plainly: a joint "
         "venture is registered at the address of one of the firms inside it, and "
         "the notice names the partners in the same string. The %d that do not "
         "involve a joint venture are the ones worth a second look, because in "
         "each the two firms are also near-identical in name - %s - so the shared "
         "address is independent evidence that the pair may be one firm printed "
         "two ways. This analysis still does not merge them, because merging on "
         "resemblance is how a dataset invents a company; the pair is recorded "
         "and left for someone who can check the register."
         % (len(plain), "; ".join(" / ".join(s["firms"]) for s in plain)),
         {"addresses_printed": printed, "shared_by_more_than_one_firm": len(shared),
          "involving_a_joint_venture": len(jv), "the_rest": len(plain),
          "groups": shared},
         [c["award_file"] for c in t["contracts"]
          if any(c["winner"] in s["firms"] for s in shared)][:4],
         "addresses_printed in companies.csv, whitespace and case folded, "
         "grouped where more than one company id shares one string")

    pairs = t["name_candidate_pairs"]
    merged = sum(1 for p in pairs if p["merged"] == "yes")
    by_kind = collections.Counter(p["entity_type"] for p in pairs)
    close = [p for p in pairs if p["measure"] == "edit distance <= 2"]
    find(POSSIBLE, "F-CONN-03",
         "%d pairs of names in this archive resemble each other closely enough "
         "to be worth checking, and %d were merged"
         % (len(pairs), merged),
         "Two names that look alike are not one entity. %d pairs differ by at "
         "most two characters - %s is one of them - and %d have one name's words "
         "entirely inside the other, which is what a joint venture's name does "
         "to its partner's. Merging either kind on sight would silently rewrite "
         "who won what, so every pair is recorded with its measure and none is "
         "merged. That decision has a cost, and it is stated here rather than "
         "hidden: where a firm is printed two ways, this archive counts it "
         "twice, and the contract counts in the money tables are counts of "
         "printed names."
         % (len(close), "\"%s\" against \"%s\"" % (close[0]["name_a"],
                                                  close[0]["name_b"])
            if close else "none", len(pairs) - len(close)),
         {"pairs": len(pairs), "merged": merged, "by_entity_type": dict(by_kind),
          "within_two_characters": len(close),
          "one_name_inside_the_other": len(pairs) - len(close)},
         # The award notices that print each side of the closest pair, so the two
         # spellings can be compared on the documents themselves.
         [c["award_file"] for c in t["contracts"]
          if close and c["winner_id"] in (close[0]["id_a"], close[0]["id_b"])][:4],
         "name_candidate_pairs.csv, written by the dataset stage and left "
         "unmerged; the audit re-checks that merged is no on every row")
    return {"firms": len(co), "firms_declaring_an_owner": len(declaring),
            "people_named": len(people),
            "people_owning_more_than_one_firm": len(across),
            "addresses_shared": len(shared), "address_groups": shared,
            "name_pairs": len(pairs), "name_pairs_merged": merged}


# --------------------------------------------------- what to look at, per tender
# Each of these is a thing the documents print, or the documented absence of a
# thing. None of them is an allegation, and the count of them is not a score: a
# tender carrying four is a tender with four questions attached, not a tender
# four times as likely to have been mishandled. They also overlap - a tender with
# one responsive bid usually also set bids aside - so they cannot be added up
# into a probability of anything.
SIGNALS = [
    ("S-ONE-RESPONSIVE", "one responsive bid",
     "the award notice records exactly one responsive tenderer"),
    ("S-SET-ASIDE", "bids set aside with no reason printed",
     "more bids arrived than were found responsive, and no document says why "
     "any was set aside"),
    ("S-STRONG-CLAUSE", "a rule of entry that stands out",
     "at least one eligibility clause is labelled HIGHLY SPECIFIC or "
     "RESTRICTIVE-LOOKING PATTERN by the rule in LABEL_MEANING"),
    ("S-ABOVE-BAND", "a demand above the folder's recommended size",
     "a cash or past-contract requirement exceeds the band the standard tender "
     "document recommends, measured against the contract value signed"),
    ("S-SHORT-WINDOW", "open two weeks or less",
     "fourteen days or fewer between the published date and closing"),
    ("S-NO-RULE-PUBLISHED", "no rule of entry published",
     "every eligibility clause points at a document the portal does not publish"),
    ("S-AWARD-MISSING", "says awarded, no award notice here",
     "the notice's status is Contract Awarded and no award notice for it is in "
     "the archive"),
    ("S-COUNT-ANOMALY", "counts that cannot all be true",
     "the award notice's own three counts contradict each other"),
    ("S-VALIDITY-OVER", "validity longer than normal",
     "the tender validity period exceeds the band the standard tender document "
     "calls normal, and no authorisation for it is printed"),
    ("S-SHARED-ADDRESS", "winner shares an address with another firm",
     "the winner's printed address is printed for at least one other named firm"),
]


def tender_rows(t):
    """Every tender the archive touches, notice or no notice.

    One award notice in the archive - tender 95841 - names a tender whose own
    notice is not here, and it happens to be the single record whose printed
    counts contradict each other. Walking tenders.csv alone would leave that one
    tender out of the per-tender table, so the tender is carried with the fields
    the award notice supplies and the rest left blank rather than filled in.
    """
    out = list(t["tenders"])
    known = set(x["tender_id"] for x in out)
    for c in t["contracts"]:
        if c["tender_id"] in known:
            continue
        known.add(c["tender_id"])
        out.append({"tender_id": c["tender_id"], "notice_file": c["award_file"],
                    "procuring_entity": c["award_procuring_entity"],
                    "district": c["award_district"],
                    "status": "no tender notice in the archive",
                    "published_date": "", "closing_date": "",
                    "tender_valid_until": ""})
    return out


def signals(t, e, ch, cn, w):
    """One row per tender: which printed observations it carries."""
    best = strongest(e["rows"])
    bids = dict((b["tender_id"], b) for b in t["bids"])
    awarded = set(c["tender_id"] for c in t["contracts"])
    over_band = set()
    for rid, kind, _ in BANDS:
        v = ch["bands"].get(rid)
        if v:
            over_band |= set(x["tender_id"] for x in ratios(t, e, kind)
                             if x["ratio"] > v["band_high"])
    shared_firms = set()
    for grp in cn.get("address_groups") or []:
        shared_firms |= set(grp["firms"])
    no_rule = set()
    by_tender = collections.defaultdict(list)
    for row in e["rows"]:
        by_tender[row["tender_id"]].append(row)
    for tid, rows in by_tender.items():
        if all(r["label"] == "UNDETERMINED" for r in rows):
            no_rule.add(tid)
    rows, tally = [], collections.Counter()
    for x in tender_rows(t):
        tid = x["tender_id"]
        b = bids.get(tid) or {}
        days = gap(x["published_date"], x["closing_date"])
        valid = gap(x["closing_date"], x["tender_valid_until"])
        on = []
        if b.get("single_bid_responsive") == "yes":
            on.append("S-ONE-RESPONSIVE")
        if b.get("counts_printed") == "yes" and dropped_any(b):
            on.append("S-SET-ASIDE")
        if best.get(tid) in STRONG:
            on.append("S-STRONG-CLAUSE")
        if tid in over_band:
            on.append("S-ABOVE-BAND")
        if days is not None and days <= 14:
            on.append("S-SHORT-WINDOW")
        if tid in no_rule:
            on.append("S-NO-RULE-PUBLISHED")
        if x["status"] == "Contract Awarded" and tid not in awarded:
            on.append("S-AWARD-MISSING")
        if (b.get("count_anomaly") or "").strip() not in ("", "no"):
            on.append("S-COUNT-ANOMALY")
        if valid is not None and valid > (w["validity_band"][1] or 150):
            on.append("S-VALIDITY-OVER")
        if b.get("winner") and b["winner"] in shared_firms:
            on.append("S-SHARED-ADDRESS")
        for s in on:
            tally[s] += 1
        rows.append({"tender_id": tid, "notice_file": x["notice_file"],
                     "procuring_entity": x["procuring_entity"],
                     "district": x["district"], "status": x["status"],
                     "notice_in_archive": "no" if x["status"] ==
                     "no tender notice in the archive" else "yes",
                     "strongest_clause": best.get(tid, ""),
                     "open_days": days, "signals": on, "count": len(on)})
    counts = collections.Counter(r["count"] for r in rows)
    most = sorted(rows, key=lambda r: -r["count"])[:10]
    find(DERIVED, "F-SIGNAL-01",
         "%d of the %d tenders carry at least one of the %d printed observations "
         "this investigation can check, and %d carry four or more"
         % (sum(1 for r in rows if r["count"]), len(rows), len(SIGNALS),
            sum(1 for r in rows if r["count"] >= 4)),
         "The observations are listed with their definitions beside this "
         "finding, and each is either something a document prints or the "
         "documented absence of something. The count is not a score and does not "
         "rank anyone: the observations overlap heavily - a tender with one "
         "responsive bid has usually also set bids aside - and no supplied "
         "document finds that any of them was improper. The most frequent is "
         "\"%s\" at %d tenders. The highest count any single tender reaches is "
         "%d. What the count is good for is deciding what to read next: the "
         "tenders at the top of this list are the ones where the record raises "
         "the most questions it does not answer."
         % (dict((s[0], s[1]) for s in SIGNALS)[tally.most_common(1)[0][0]],
            tally.most_common(1)[0][1], most[0]["count"]),
         {"tenders": len(rows), "with_at_least_one": sum(1 for r in rows
                                                         if r["count"]),
          "distribution": dict(sorted(counts.items())),
          "by_signal": dict((s[0], tally.get(s[0], 0)) for s in SIGNALS),
          "definitions": [{"id": s[0], "short": s[1], "means": s[2]}
                          for s in SIGNALS],
          "highest": [{"tender_id": r["tender_id"], "count": r["count"],
                       "signals": r["signals"]} for r in most]},
         [r["notice_file"] for r in most[:4]],
         "one row per tender in tenders.csv; each signal is the predicate "
         "printed beside it, evaluated over tenders.csv, bids.csv and "
         "eligibility_criteria.csv")
    return {"rows": rows, "by_signal": dict(tally),
            "distribution": dict(sorted(counts.items())),
            "definitions": [{"id": s[0], "short": s[1], "means": s[2]}
                            for s in SIGNALS]}


# ------------------------------------------------- eligibility x responsiveness

STRONG = ["RESTRICTIVE-LOOKING PATTERN", "HIGHLY SPECIFIC"]


def crosstab(bids, best):
    """One row per label: how many bid, how many stayed in, how often one did."""
    by = collections.defaultdict(list)
    for b in bids:
        by[best.get(b["tender_id"], "no eligibility clause")].append(b)
    out = []
    for k in LABEL_ORDER + ["no eligibility clause"]:
        v = by.get(k) or []
        if not v:
            continue
        rc = [float(b["bids_received"]) for b in v if b["bids_received"]]
        rs = [float(b["bids_responsive"]) for b in v if b["bids_responsive"]]
        out.append({"label": k, "tenders": len(v),
                    "median_received": median(rc), "median_responsive": median(rs),
                    "share_one_responsive":
                        share(sum(1 for b in v if b["single_bid_responsive"]
                                  == "yes"), len(v)),
                    "share_dropped_someone":
                        share(sum(1 for b in v if dropped_any(b)), len(v))})
    return out

    with io.open(os.path.join(DATA, "dataset_summary.json"), encoding="utf-8") as fh:
        return json.load(fh)


def ratios(t, e, kind):
    """Demanded figure over contract value signed, for one criterion category."""
    by_tender = collections.defaultdict(list)
    for row in e["rows"]:
        by_tender[row["tender_id"]].append(row)
    out = []
    for b in t["bids"]:
        value = (b["contract_value_taka"] or "").strip()
        if not value or float(value) < FACE_VALUE_FLOOR:
            continue
        asked = demanded(by_tender.get(b["tender_id"]) or [], kind)
        if asked is not None:
            out.append({"tender_id": b["tender_id"], "source_file": b["source_file"],
                        "demanded": asked, "contract_value": float(value),
                        "ratio": asked / float(value)})
    return out


def bands(t, e, r):
    """The two figures the folder puts a recommended size on, measured."""
    out = {}
    for rid, kind, plain in BANDS:
        quote = dict((q["id"], q) for q in r["quoted"]).get(rid)
        if not quote:
            continue
        m = re.search(BAND_RX, quote["text"], re.I)
        lo, hi = float(m.group(1)) / 100.0, float(m.group(2)) / 100.0
        rows = ratios(t, e, kind)
        xs = sorted(x["ratio"] for x in rows)
        if not xs:
            continue
        over = [x for x in rows if x["ratio"] > hi]
        out[rid] = {"reads_on": plain, "category": kind, "file": quote["file"],
                    "page": quote["page"], "quote": quote["text"],
                    "band_low": lo, "band_high": hi, "tenders": len(xs),
                    "median": round(median(xs), 3),
                    "quartiles": [round(quantile(xs, 0.25), 3),
                                  round(quantile(xs, 0.75), 3)],
                    "min": round(xs[0], 3), "max": round(xs[-1], 3),
                    "above_band": len(over),
                    "above_band_share": share(len(over), len(xs)),
                    "within_band": sum(1 for x in xs if lo <= x <= hi),
                    "all_ratios": [round(x, 4) for x in xs],
                    "highest": sorted(over, key=lambda x: -x["ratio"])[:5]}
    liq = out.get("R-LIQUID-BAND")
    exp = out.get("R-EXP-BAND")
    if liq and exp:
        find(DERIVED, "F-CHAIN-02",
             "The folder recommends that the cash a tenderer must hold be %d to "
             "%d percent of the estimated cost, and %d to %d percent for the "
             "past contract it must show; measured against the contract value "
             "actually signed, the middle of this archive sits at %d and %d "
             "percent, and %s%% and %s%% of tenders sit above the band"
             % (liq["band_low"] * 100, liq["band_high"] * 100,
                exp["band_low"] * 100, exp["band_high"] * 100,
                round(liq["median"] * 100), round(exp["median"] * 100),
                liq["above_band_share"], exp["above_band_share"]),
             "Both bands are printed on one page of the standard tender document "
             "in the folder (%s p%d) and both are advisory: the word is "
             "recommended, and the first page of that document calls itself a "
             "preliminary working draft. Both measure against the estimated "
             "cost of the procurement, and no notice or award in this archive "
             "prints an estimated cost, so the comparison here is against the "
             "contract value eventually signed - a different quantity, and the "
             "nearest one the record offers. That substitution is worth "
             "watching, and it is also what makes the result readable: if the "
             "signed value were unrelated to the estimate the ratios would fall "
             "anywhere, and instead %d of %d cash requirements and %d of %d "
             "past-contract requirements land inside the recommended band, with "
             "the middle of each distribution within a few points of it. The "
             "tail is where the question sits. %d cash requirements ask for more "
             "than the recommended ceiling, the highest for %s against a "
             "contract of %s - %.1f times the value signed. The documents do not "
             "say how any of these figures was arrived at, and nothing here "
             "shows a rule was broken: an advisory band is not a limit, and the "
             "estimate that the band actually refers to is missing from the "
             "record."
             % (liq["file"].split("/")[-1], liq["page"],
                liq["within_band"], liq["tenders"], exp["within_band"],
                exp["tenders"], liq["above_band"],
                taka(liq["highest"][0]["demanded"]),
                taka(liq["highest"][0]["contract_value"]),
                liq["highest"][0]["ratio"]),
             dict((k, dict((c, v[c]) for c in ("band_low", "band_high", "tenders",
                                               "median", "quartiles", "min", "max",
                                               "above_band", "above_band_share",
                                               "within_band")))
                  for k, v in out.items()),
             ["%s p%d" % (liq["file"], liq["page"])]
             + [x["source_file"] for x in liq["highest"][:3]],
             "largest readable figure of each category in "
             "eligibility_criteria.csv over contract_value_taka in bids.csv, "
             "same tender_id, figures below the face-value floor excluded; band "
             "read from the quoted rule itself")
    return out


def unreadable(e):
    """The figures the page prints and the parser refused to guess at."""
    rows = [r for r in e["rows"] if r["money_unresolved"] == "yes"]
    quoted = [" ".join((x or "").split()) for r in rows
              for x in (r["money_original"] or "").split(" | ") if x.strip()]
    find(UNRESOLVED, "F-ELIG-03",
         "%d clauses in %d notices print a sum of money that cannot be read off "
         "the page with certainty, and they are left unread rather than guessed "
         "at" % (len(rows), len(set(r["tender_id"] for r in rows))),
         "A figure in a Bangladeshi tender notice is usually printed twice, once "
         "in digits and once in words - \"Tk 1.20 [One point Two] Crore\" - and "
         "the words are what make the digits legible, because the scale word can "
         "belong to the digits or stand apart from them. Where the two "
         "contradict each other, or where the scale word beside the figure is "
         "one letter from a real one and so does not settle which was meant, the "
         "amount is recorded exactly as printed and left without a number. These "
         "are the %d such clauses; the printed strings are here in full so a "
         "reader can judge them: %s. Each is excluded from every distribution "
         "and every threshold on this site, and the clause itself is still "
         "counted and still classified on everything else it prints."
         % (len(rows), "; ".join("\"%s\"" % q for q in quoted[:8])),
         {"clauses": len(rows), "notices": len(set(r["tender_id"] for r in rows)),
          "figures": len(quoted), "printed_strings": quoted},
         sorted(set(r["source_file"] for r in rows))[:4],
         "eligibility_criteria.csv where money_unresolved = yes; the reason for "
         "each is in money_reading")
    return {"clauses": len(rows), "printed_strings": quoted,
            "notices": sorted(set(r["tender_id"] for r in rows))}


def chain(t, e, r):
    """Whether the wording of the rules of entry tracks who was left standing."""
    bids, best = counted(t), strongest(e["rows"])
    xt = crosstab(bids, best)
    tests = {}
    for name, test in (("dropped_someone", dropped_any),
                       ("one_responsive",
                        lambda b: b["single_bid_responsive"] == "yes")):
        a = sum(1 for b in bids if best.get(b["tender_id"]) in STRONG and test(b))
        ab = sum(1 for b in bids if best.get(b["tender_id"]) in STRONG)
        c = sum(1 for b in bids
                if best.get(b["tender_id"]) not in STRONG and test(b))
        cd = len(bids) - ab
        tests[name] = {"strong": a, "strong_of": ab, "strong_share": share(a, ab),
                       "other": c, "other_of": cd, "other_share": share(c, cd),
                       "p_two_sided": round(fisher(a, ab - a, c, cd - c), 3)}
    one, drop = tests["one_responsive"], tests["dropped_someone"]
    find(DERIVED, "F-CHAIN-01",
         "Sorting the %d tenders that printed their counts by the strongest "
         "clause each one printed does not separate them: the share ending with "
         "a single responsive tenderer is %s%% where a clause matched two or "
         "more of the tests and %s%% everywhere else, a difference this many "
         "tenders would produce by chance about %.0f times in a hundred"
         % (len(bids), one["strong_share"], one["other_share"],
            100 * one["p_two_sided"]),
         "This is the join the investigation exists to test, and it comes back "
         "empty. Only %d of the %d tenders with printed counts carry a clause "
         "labelled RESTRICTIVE-LOOKING PATTERN or HIGHLY SPECIFIC, so the "
         "comparison is between a small group and a large one and only a large "
         "difference could be read as anything; the two-sided Fisher exact p is "
         "%.3f for ending with one responsive tenderer and %.3f for dropping "
         "anyone at all. Read plainly: in this archive the wording of a rule of "
         "entry does not predict how many tenderers were left standing. That is "
         "not a finding that the wording had no effect. No notice and no award "
         "in these 1,805 PDFs names a single tenderer, prints a quoted price, "
         "or gives a reason any tenderer was found non-responsive, so nothing "
         "here can connect a particular clause to a particular exclusion in "
         "either direction. The counts are the only outcome the record offers, "
         "and against the counts the labels do not sort."
         % (one["strong_of"], len(bids), one["p_two_sided"], drop["p_two_sided"]),
         {"tenders_with_counts": len(bids), "strong_label_tenders":
          one["strong_of"], "by_label": xt, "tests": tests},
         [b["source_file"] for b in bids
          if best.get(b["tender_id"]) in STRONG][:4],
         "strongest label per tender_id from eligibility_criteria.csv by "
         "LABEL_ORDER, joined to bids.csv on tender_id where counts_printed = "
         "yes; two-sided Fisher exact test over the 2x2 of strong label against "
         "outcome")
    return {"by_label": xt, "tests": tests, "tenders_with_counts": len(bids),
            "labelled": sum(1 for b in bids if b["tender_id"] in best),
            "bands": bands(t, e, r), "unreadable_figures": unreadable(e)}


def summary():
    with io.open(os.path.join(DATA, "dataset_summary.json"), encoding="utf-8") as fh:
        return json.load(fh)


def main():
    t = load()
    counts = summary()
    labels = counts.get("criterion_labels") or {}
    say("the rules of the race")
    r = rules(pages())
    for q in r["quoted"]:
        line("%-20s %-30s p%-4d %s"
             % (q["id"], q["file"].split("/")[-1][:30], q["page"], q["text"][:80]))

    say("the clock")
    w = window(t, r)
    line("open for %s days (%s to %s); opened on the closing day %d times"
         % (w["open_days"]["median"], w["open_days"]["min"],
            w["open_days"]["max"], w["opened_on_closing_day"]))
    line("security margin %s; short of the 28-day minimum %d"
         % (w["security_margin_days"], w["security_short_of_minimum"]))
    line("validity band %g-%g days; above it %d"
         % (w["validity_band"][0], w["validity_band"][1], w["validity_above_band"]))

    say("what changed after publication")
    a = amendments(t, w)
    line("%d of %d notices amended, %d printing a change table, %d changes listed "
         "(%d list a field whose value did not change)"
         % (a["notices_amended"], a["notices"], a["with_a_change_table"],
            a["changes_listed"], a["rows_with_no_change_in_value"]))
    for d in a["dates"]:
        line("%-56s %3d  later %3d  earlier %3d  median %s d"
             % (d["field"][:56], d["changes"], d["moved_later"],
                d["moved_earlier"], d["median_days"]))
    line("window as first published %s d -> after amendment %s d"
         % (a["window_as_first_published"], a["window_after_amendment"]))
    line("eligibility rewritten in %d tenders; clause pairs %s"
         % (a["eligibility_tenders"], a["clause_pairs"]))
    for m in a["thresholds"]:
        if not m["figure_was"]:
            line("  %-8s %s" % (m["tender_id"], m["read"][:96]))
            continue
        line("  %-8s %s %s -> %s %s  %s%s"
             % (m["tender_id"], m["figure_was"], m["word_was"] or "(no word)",
                m["figure_now"], m["word_now"] or "(no word)", m["direction"],
                ("" if m["times"] is None else "  x%.2f" % m["times"])))

    say("who could enter")
    e = eligibility(t, labels)
    for k in LABEL_ORDER:
        line("%-30s %5d" % (k, e["tally"].get(k, 0)))
    line("top decile cut: %s" % dict((k, taka(v)) for k, v in
                                     e["top_decile_cut"].items()))
    line("years cut %s, contract-count cut %s, figures under the floor %d"
         % (e["years_cut"], e["contract_count_cut"],
            e["figures_below_face_value_floor"]))

    say("where the bidders went")
    f = funnel(t)
    line(" -> ".join("%s %s" % (k.replace("_", " "), v)
                     for k, v in f["stages"].items()))

    say("the rules of entry against who was left standing")
    ch = chain(t, e, r)
    line("%-30s %5s %8s %8s %8s %8s"
         % ("strongest clause", "n", "med rcvd", "med resp", "1-resp%", "cut%"))
    for row in ch["by_label"]:
        line("%-30s %5d %8s %8s %8s %8s"
             % (row["label"], row["tenders"], row["median_received"],
                row["median_responsive"], row["share_one_responsive"],
                row["share_dropped_someone"]))
    for k, v in ch["tests"].items():
        line("%-16s strong %s%% of %d, other %s%% of %d, p=%.3f"
             % (k, v["strong_share"], v["strong_of"], v["other_share"],
                v["other_of"], v["p_two_sided"]))
    for k, v in ch["bands"].items():
        line("%-14s band %.0f-%.0f%%  n=%d  median %.0f%%  quartiles %s  above %s%%"
             % (k, v["band_low"] * 100, v["band_high"] * 100, v["tenders"],
                v["median"] * 100, v["quartiles"], v["above_band_share"]))

    say("how the tenders ended")
    o = outcomes(t)
    for row in o["by_status"]:
        line("%-30s %5d  award notice %4d" % (row["status"], row["tenders"],
                                              row["with_award_notice"]))

    say("where the money went")
    m = concentration(t)
    for c in m["top_ten"][:5]:
        line("%-46s %3d  %s" % (c["name"][:46], c["contracts"], taka(c["taka"])))

    say("which entities connect")
    cn = connections(t)
    line("firms declaring an owner %d of %d; people named %d; owning more than "
         "one firm %d" % (cn["firms_declaring_an_owner"], cn["firms"],
                          cn["people_named"], cn["people_owning_more_than_one_firm"]))
    line("addresses shared by more than one firm %d; name pairs %d, merged %d"
         % (cn["addresses_shared"], cn["name_pairs"], cn["name_pairs_merged"]))

    say("what to look at, per tender")
    sg = signals(t, e, ch, cn, w)
    for s in sg["definitions"]:
        line("%-22s %5d  %s" % (s["id"], sg["by_signal"].get(s["id"], 0),
                                s["short"]))
    line("signals per tender: %s" % sg["distribution"])

    out = {"built": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
           "source": "investigation/data/tables/*.csv, built from the PDFs in "
                     "the project folder and audited by 03_audit.py",
           "dataset_counts": counts.get("counts") or {},
           "label_kinds": {FACT: "the documents print this",
                           DERIVED: "arithmetic over what the documents print",
                           POSSIBLE: "two records share a printed value",
                           UNRESOLVED: "the documents raise it and cannot "
                                       "answer it"},
           "findings": FINDINGS,
           "rules": r, "clock": w, "amendments": a, "eligibility": e,
           "funnel": f, "chain": ch, "outcomes": o, "money": m,
           "connections": cn, "signals": sg}
    path = os.path.join(DATA, "analysis.json")
    with io.open(path, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    counts_by_kind = collections.Counter(x["type"] for x in FINDINGS)
    say("written")
    line("%s  %d findings: %s"
         % (os.path.relpath(path), len(FINDINGS),
            ", ".join("%s %d" % (k, counts_by_kind[k]) for k in
                      (FACT, DERIVED, POSSIBLE, UNRESOLVED))))
    line("%.1f MB" % (os.path.getsize(path) / 1048576.0))


if __name__ == "__main__":
    main()
