# -*- coding: utf-8 -*-
"""
Build every JSON payload the site serves, from investigation_output/ only.

RULE OBEYED HERE: no figure is written by hand. Every count, sum, median,
share and correlation below is computed from the three CSVs and the rule
catalogue that ship in investigation_output/. The site's prose carries
data-bound placeholders, not typed-in statistics, so a rebuilt payload
moves the article's numbers with it.

Run:  python3 -P site/build/build.py       (from the repository root)

-P matters: a module named pytesseract.py sits in the repository root and
shadows the real package; importing it re-runs an old extraction pipeline.
Nothing here needs it, and -P keeps it off sys.path.
"""
import csv, json, os, re, sys, math, statistics as st, collections, datetime, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "investigation_output")
OUT = os.path.join(ROOT, "site", "data")
PDF_DIRS = {
    "notice": "Tender Notice_PDFs",
    "award": "Contract_Awards_PDFs",
    "reference": "eGP_Forensic_Engine",
}
CRORE = 1e7
# Tokens the corpus uses to mean "this was never published". They are absence, not
# content, so they are blanked here and the site says so in its own words. Tokens
# that carry analytic meaning - NOT_PUBLISHED_IN_NOTICE as a restriction level,
# NOT_TESTABLE_DATA_ABSENT as a test result, NOT_PUBLISHED_PRINTED_AS_0.000 as a
# printed zero - are deliberately NOT in this set.
NA = {"", "NOT_AVAILABLE", "NOT_APPLICABLE", "NOT_PUBLISHED", "NONE", "N/A",
      "NOT_AVAILABLE_INDIVIDUAL_BIDS_NEVER_PUBLISHED",
      "NOT_AVAILABLE_NO_AWARD_NOTICE",
      "NOT_AVAILABLE_NOT_PUBLISHED_IN_AWARD_NOTICE",
      "NOT_AVAILABLE_NEVER_PUBLISHED",
      "NOT_AVAILABLE_NO_ESTIMATE_PUBLISHED",
      "NOT_AVAILABLE_IDENTITIES_NEVER_PUBLISHED",
      "NOT_APPLICABLE_SHARE_NOT_PUBLISHED",
      "none_detected",
      "not_applicable_won_the_contract"}


# The one correction the source files document but did not finish applying.
# fix_liquid_asset_bug.py computed bar=825000.0 / 2000000.0, wrote the ratio
# and the extraction_method note, and never wrote the BDT columns back. The
# figures are printed verbatim in evidence_excerpt_liquid_assets on the same
# rows; the corrected ratios in the master confirm them arithmetically.
LIQUID_FIX = {
    "119545": {"required_liquid_assets_bdt": 825000.0,
               "financial_capacity_requirement_bdt": 825000.0,
               "quote": "Tk. 8,25,000 (Eight Lac Twenty Five Thousand) only",
               "was": 180000000000.0, "ratio": 0.37},
    "113428": {"required_liquid_assets_bdt": 2000000.0,
               "financial_capacity_requirement_bdt": 2000000.0,
               "quote": "Tk. 20,00,000 (Twenty) Lac only",
               "was": 200000000000.0, "ratio": 0.44},
}


# ---------------------------------------------------------------- primitives

# Some notices reached the CSVs with their punctuation mis-decoded: a curly
# apostrophe printed as "Bankâ??s", a non-breaking space printed as "Â ". The
# damage is in the extraction, not in the notice - a reader diffing "Bankâ??s
# Undertaking" against the PDF sees "Bank's Undertaking" and thinks the quote is
# wrong. It is repaired here, on the way into the site, so the CSVs stay exactly
# as the investigation's own scripts verified them, and the count is published on
# the method page rather than the repair being made silently.
DAMAGE = re.compile(r"[ÂÃ]|â\?\?|â\?�|�")
LOSSY = [("Ã¯Â¿Â½", "�"), ("â?�", '"'),
         ("â€™", "'"), ("â€˜", "'"), ("â€œ", '"'), ("â€\x9d", '"')]
RESIDUE = re.compile(r"\s*(?:[ÃÂ][ÃÂ?�¢¯¿½€]*\s*)+")
MENDED = collections.Counter()


def undouble(s):
    """Undo UTF-8 that was read as Latin-1, as many times as it round-trips.

    This is the recoverable class: "Â " is the two bytes of a non-breaking space
    read one byte at a time, "Â±" the two bytes of a plus-minus sign. Decoding
    them back is exact, which is why it is done by round-trip and not by a
    substitution table - a table would have to guess, and would turn "Â±" into a
    dropped character instead of "±".
    """
    for _ in range(3):
        if not any(c in s for c in "ÂÃ"):
            return s
        try:
            t = s.encode("latin-1").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            return s
        if t == s:
            return s
        s = t
    return s


def close_up(m):
    """Drop an unrecoverable run when it was glued to a word or sits in front of
    sentence punctuation; leave one space where it already had whitespace beside
    it. So "form<run> of" reads "form of", "Crore. <run> i)" reads "Crore. i)"
    and "Authority <run>." reads "Authority.".
    """
    if m.string[m.end():m.end() + 1] in ("", ".", ",", ";", ":", ")"):
        return ""
    return " " if any(c.isspace() for c in m.group(0)) else ""


def mend(s):
    if not s or not DAMAGE.search(s):
        return s
    was = s
    s = undouble(s)
    for a, b in LOSSY:
        s = s.replace(a, b)
    # "â??" is U+2018/2019/201C with its two trailing bytes replaced by "?".
    # Which one it was is settled by what sits before it: after a letter or digit
    # it closed a possessive (Bank's, goods'), otherwise it opened a quotation.
    s = re.sub(r"(?<=[0-9A-Za-z])â\?\?", "'", s)
    s = s.replace("â??", '"')
    s = s.replace("\xa0", " ").replace("\xad", "")
    if RESIDUE.search(s):
        # Doubly mangled and a byte short of recoverable: the two bytes of a
        # Latin-1 character were re-encoded and then one was replaced by "?".
        # The character cannot be recovered, so the run is closed up rather than
        # guessed at, and both the run and the cell it sat in are counted.
        MENDED["unrecoverable_runs"] += len(RESIDUE.findall(s))
        MENDED["cells_with_unrecoverable_run"] += 1
        s = RESIDUE.sub(close_up, s).strip()
    if s != was:
        MENDED["cells"] += 1
    return s


def load(name):
    with open(os.path.join(SRC, name), encoding="utf-8-sig") as fh:
        rows = list(csv.DictReader(fh))
    for r in rows:
        for k, v in r.items():
            if v and DAMAGE.search(v):
                r[k] = mend(v)
    MENDED["files"] += 1
    return rows


# ------------------------------------------------------- names, for a reader
# The master carries three forms of a winner's name: winner_name as the notice
# printed it, winner_name_verbatim with the joint-venture partner block attached,
# and winner_name_normalised, an upper-cased key with the punctuation stripped so
# that "M/S. Gulzar Trading" and "M/s Gulzar Trading" land in one group. The key
# is the right thing to group on and the wrong thing to read: it sets every firm
# in the story in capitals and loses "(Pvt.)". So grouping still runs on the key
# and the name shown to a reader is a spelling the documents actually print.

KEEP_DOT = {"ltd", "co", "corp", "pvt", "inc", "bros", "no", "dept", "eng", "mfg", "jv"}
NORM = collections.Counter()


def tidy_name(s):
    """Spacing and punctuation only. No word is added, dropped or re-cased."""
    was = s = re.sub(r"\s+", " ", (s or "").strip())
    s = re.sub(r"(?i)\b(m/s)\.?(?=[A-Za-z])", r"\1. ", s)   # M/s.Suraim -> M/s. Suraim
    s = re.sub(r"(?<=[A-Za-z])\(", " (", s)                  # BROTHERS(PVT) -> BROTHERS (PVT)
    s = re.sub(r"\)(?=[A-Za-z])", ") ", s)                   # (PVT)LIMITED -> (PVT) LIMITED
    s = re.sub(r"\(\s+", "(", s)
    s = re.sub(r"\s+\)", ")", s)                             # (Pvt. ) -> (Pvt.)
    s = re.sub(r"\s+([,;])", r"\1", s)
    s = re.sub(r"\s{2,}", " ", s)
    last = s.rsplit(" ", 1)[-1]
    if last.endswith(".") and last[:-1].replace(".", "").lower() not in KEEP_DOT \
            and len(re.sub(r"[^A-Za-z]", "", last)) >= 2:
        s = s[:-1]                                           # Halim Enterprise. -> ...
    s = s.strip()
    if s != was:
        NORM["respaced"] += 1
    return s


def display_name(spellings):
    """One spelling to print for a group, chosen from the spellings on the
    notices: the commonest, then the one without a parenthetical, then the
    shortest, then alphabetical. Deterministic, and never a form the documents
    do not carry."""
    c = collections.Counter(tidy_name(s) for s in spellings if (s or "").strip())
    if not c:
        return ""
    return sorted(c, key=lambda s: (-c[s], s.count("("), len(s), s))[0]


def person(s):
    """A name printed in one table column and a role in the next arrive glued
    together by a run of spaces - "MD. ABDUL BARI      Proprietor". Split them
    back apart; a name with no role attached is returned unchanged."""
    s = re.sub(r"[\s ]+", " ", (s or "").strip()) if "  " not in (s or "") \
        else (s or "").strip()
    parts = re.split(r"\s{2,}", s, maxsplit=1)
    name = re.sub(r"\s+", " ", parts[0]).strip(" ,;")
    role = re.sub(r"\s+", " ", parts[1]).strip(" ,;") if len(parts) > 1 else ""
    if role:
        NORM["owner_role_split"] += 1
    return name, role


def txt(row, col):
    """Cell as text, or "" when the cell is one of the corpus' absence tokens."""
    v = (row.get(col) or "").strip()
    return "" if v in NA else v


def num(row, col):
    """Cell as float, or None. Commas are grouping, not decimals, in this data."""
    v = (row.get(col) or "").replace(",", "").strip()
    if v in NA:
        return None
    try:
        return float(v)
    except ValueError:
        return None


def yes(row, col):
    return (row.get(col) or "").strip().lower() == "yes"


def med(xs):
    xs = [x for x in xs if x is not None]
    return round(st.median(xs), 4) if xs else None


def mean(xs):
    xs = [x for x in xs if x is not None]
    return round(st.fmean(xs), 4) if xs else None


def pct(part, whole, nd=1):
    return round(part / whole * 100, nd) if whole else None


def cr(x):
    """Taka to crore, the unit Bangladeshi readers count large money in."""
    return round((x or 0) / CRORE, 2)


def pearson(xs, ys):
    pairs = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
    if len(pairs) < 3:
        return None
    a = [p[0] for p in pairs]
    b = [p[1] for p in pairs]
    ma, mb = st.fmean(a), st.fmean(b)
    sa = math.sqrt(sum((x - ma) ** 2 for x in a))
    sb = math.sqrt(sum((y - mb) ** 2 for y in b))
    if not sa or not sb:
        return None
    cov = sum((x - ma) * (y - mb) for x, y in pairs)
    return {"r": round(cov / (sa * sb), 3), "n": len(pairs)}


def spread(xs):
    xs = sorted(x for x in xs if x is not None)
    if not xs:
        return None
    return {"n": len(xs), "min": xs[0], "p10": xs[len(xs) // 10],
            "median": st.median(xs), "p90": xs[len(xs) * 9 // 10], "max": xs[-1],
            "mean": round(st.fmean(xs), 2)}


def tally(rows, col, top=None):
    c = collections.Counter((r.get(col) or "").strip() or "BLANK" for r in rows)
    items = [{"key": k, "n": v} for k, v in c.most_common(top)]
    return items


MONTHS = {m: i for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun",
     "jul", "aug", "sep", "oct", "nov", "dec"], 1)}


def iso(d):
    """The notices print dates as 30-Sep-2019 10:00. Also accept dd/mm/yyyy and
    yyyy-mm-dd, because a handful of cells arrive that way."""
    d = (d or "").strip()
    m = re.match(r"^(\d{1,2})[-/ ]([A-Za-z]{3,})[-/ ](\d{4})", d)
    if m and m.group(2)[:3].lower() in MONTHS:
        return "%s-%02d-%02d" % (m.group(3), MONTHS[m.group(2)[:3].lower()],
                                 int(m.group(1)))
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})", d)
    if m:
        return m.group(0)
    m = re.match(r"^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})", d)
    if m:
        return "%s-%02d-%02d" % (m.group(3), int(m.group(2)), int(m.group(1)))
    return ""


def hhmm(d):
    m = re.search(r"(\d{1,2}):(\d{2})", (d or ""))
    return "%02d:%s" % (int(m.group(1)), m.group(2)) if m else ""



# ------------------------------------------------------------------- loading

print("reading investigation_output/")
MASTER = load("master_tender_investigation.csv")
DEV = load("rule_deviations.csv")
BID = load("bidder_detail.csv")
print("  master     %5d rows x %3d cols" % (len(MASTER), len(MASTER[0])))
print("  deviations %5d rows x %3d cols" % (len(DEV), len(DEV[0])))
print("  bidders    %5d rows x %3d cols" % (len(BID), len(BID[0])))

# ------------------------------------------------- absence in an ordered scale
# Two classifications in the master file arrive with an empty cell where an
# earlier snapshot of the same file printed a token. The empty cell is not a new
# fact and not a new category. Cross-tabulating the current file shows it is the
# same absence the token named:
#
#   eligibility_restriction_level is empty on the notices whose
#   eligibility_published is anything other than SUBSTANTIVE_TEXT_PUBLISHED -
#   sent to a data sheet that is not in the set, portal access denied, or blank
#   in the notice. There was no criteria text to score.
#
#   competition_level is empty on exactly the rows with no total_bids_received.
#   There was no bid count to band.
#
# Both feed ordered scales that carry a written label per step, so a bare empty
# cell would drop those rows out of the figure instead of showing them as the
# absence they are. The token is restored here, at the edge, so every count,
# label and download downstream stays the one the label set was written for. The
# CSV is not rewritten, and a row whose emptiness the file does not corroborate
# stops the build rather than being labelled on our word.
ABSENCE = {
    "eligibility_restriction_level": (
        "NOT_PUBLISHED_IN_NOTICE",
        lambda r: (r.get("eligibility_published") or "").strip()
        != "SUBSTANTIVE_TEXT_PUBLISHED"),
    "competition_level": (
        "UNKNOWN",
        lambda r: not (r.get("total_bids_received") or "").strip()),
}
for col, (token, is_absence) in ABSENCE.items():
    filled = 0
    for r in MASTER:
        if (r.get(col) or "").strip():
            continue
        if not is_absence(r):
            raise SystemExit(
                "build stopped: %s is empty on tender %s, but nothing else in "
                "the row shows the value was never published. Check the source "
                "file before publishing." % (col, r.get("tender_id")))
        r[col] = token
        filled += 1
    if filled:
        print("  %-30s %4d empty cells read as %s" % (col, filled, token))

CORRECTIONS = []
for r in MASTER:
    fix = LIQUID_FIX.get(r["tender_id"])
    if not fix:
        continue
    for col in ("required_liquid_assets_bdt", "financial_capacity_requirement_bdt"):
        before = num(r, col)
        if before is not None and before > 1e10:
            r[col] = "%.2f" % fix[col]
            CORRECTIONS.append({"tender_id": r["tender_id"], "column": col,
                                "before": before, "after": fix[col], "unit": "bdt",
                                "quote": fix["quote"], "agency": r["agency"]})
    # The correction script rewrote the ratio column and left the sentence that
    # quotes it standing. documented_fact on these two rows still says the bar is
    # tens of thousands of times the contract value, which is the reading the
    # script had just withdrawn - so the record contradicted itself in the same
    # cell the correction was recorded in.
    #
    # The clause is removed rather than restated. Across the 247 rows that carry a
    # bar ratio the analysis writes this sentence on all 80 at 1.5x or more and on
    # none of the 167 below it; the corrected ratios are 0.44 and 0.37, so by the
    # analysis's own threshold the sentence would never have been written. Nothing
    # is substituted for it: the corrected ratio is on the rules tab, where the
    # test that uses it lives.
    stale = re.search(r"\s*notice requires financial bar ([\d.,]+)x contract value\.",
                      r.get("documented_fact") or "")
    if stale and (num(r, "financial_bar_to_contract_value_ratio") or 0) < 1.5:
        r["documented_fact"] = (r["documented_fact"][:stale.start()]
                                + r["documented_fact"][stale.end():]).strip()
        CORRECTIONS.append({
            "tender_id": r["tender_id"], "column": "documented_fact",
            "before": float(stale.group(1).replace(",", "")),
            "after": num(r, "financial_bar_to_contract_value_ratio"),
            "unit": "ratio", "quote": fix["quote"], "agency": r["agency"]})
if CORRECTIONS:
    print("  applied %d documented liquid-asset corrections" % len(CORRECTIONS))

# The rule catalogue is the authority for clause text, force and limits. It is
# a python module in the same folder; import it rather than restate it.
sys.path.insert(0, os.path.join(SRC, "rule_scripts"))
import rule_catalogue as RC  # noqa: E402
RULES = RC.RULES if hasattr(RC, "RULES") else list(RC.RULE_BY_CODE.values())
print("  rule catalogue %d rules" % len(RULES))

BY_ID = {r["tender_id"]: r for r in MASTER}
AWARDED = [r for r in MASTER if num(r, "contract_value_bdt") is not None]
WITHBIDS = [r for r in MASTER if num(r, "total_bids_received") is not None]

# Every taka in the awarded set, at module level, because a case study needs to
# be able to say what share of the whole one contract is and the figure must be
# the same one the concentration table divides by.
AWARDED_VALUE = sum(num(r, "contract_value_bdt") or 0 for r in AWARDED)

# One spelling per firm, so that a firm named in the article, in a table and in a
# tender record is the same string in all three. Grouping is still the master's
# own upper-case key; only what is shown changes.
_spellings = collections.defaultdict(list)
for _r in AWARDED:
    _k = txt(_r, "winner_name_normalised") or txt(_r, "winner_name")
    if _k and txt(_r, "winner_name"):
        _spellings[_k].append(txt(_r, "winner_name"))
NAME_OF = {k: display_name(v) for k, v in _spellings.items()}
print("  firm names   %d groups, one printed spelling each" % len(NAME_OF))


def winner_of(row):
    """The firm name to show for a tender: the group's chosen spelling, falling
    back to whatever this notice printed."""
    k = txt(row, "winner_name_normalised") or txt(row, "winner_name")
    return NAME_OF.get(k) or tidy_name(txt(row, "winner_name"))


# -------------------------------------------------------------- the documents

def pdf_index():
    """One entry per PDF actually on disk, so no link on the site can 404."""
    have = {}
    for kind, folder in PDF_DIRS.items():
        d = os.path.join(ROOT, folder)
        have[kind] = ({f for f in os.listdir(d) if f.lower().endswith(".pdf")}
                      if os.path.isdir(d) else set())
        print("  %-9s %4d PDFs in %s" % (kind, len(have[kind]), folder))
    return have


HAVE = pdf_index()


def docref(kind, filename, pages):
    if not filename or filename not in HAVE[kind]:
        return None
    return {"kind": kind, "file": filename, "dir": PDF_DIRS[kind],
            "pages": pages or ""}


# ----------------------------------------------------------------- the corpus

def build_corpus():
    total_value = AWARDED_VALUE
    bids = [num(r, "total_bids_received") for r in WITHBIDS]
    resp = [num(r, "responsive_bids") for r in WITHBIDS]
    lost = [(b or 0) - (rs or 0) for b, rs in zip(bids, resp)]

    # where the field disappears: submitted -> responsive
    single_resp = [r for r in WITHBIDS if num(r, "responsive_bids") == 1]
    half_lost = [r for r in WITHBIDS
                 if (num(r, "total_bids_received") or 0) > 1
                 and (num(r, "responsive_bids") or 0) * 2 < (num(r, "total_bids_received") or 0)]
    with_rejects = [r for r in WITHBIDS
                    if (num(r, "total_bids_received") or 0) > (num(r, "responsive_bids") or 0)]

    comp_order = ["SINGLE_BID", "VERY_LOW", "LOW", "MODERATE", "HIGH", "UNKNOWN"]
    comp = []
    for k in comp_order:
        rows = [r for r in AWARDED if r["competition_level"] == k]
        v = sum(num(r, "contract_value_bdt") or 0 for r in rows)
        comp.append({"key": k, "n": len(rows), "crore": cr(v),
                     "share": pct(v, total_value)})
    thin = [r for r in AWARDED if (num(r, "total_bids_received") or 99) <= 2]
    thin_value = sum(num(r, "contract_value_bdt") or 0 for r in thin)

    # the test that failed: does a tighter eligibility bar thin the field?
    lvl_order = ["NONE_IDENTIFIED", "POSSIBLE", "MODERATE", "STRONG",
                 "NOT_PUBLISHED_IN_NOTICE"]
    restriction = []
    for k in lvl_order:
        rows = [r for r in WITHBIDS if r["eligibility_restriction_level"] == k]
        b = [num(r, "total_bids_received") for r in rows]
        one = [r for r in rows if num(r, "responsive_bids") == 1]
        restriction.append({"key": k, "n": len(rows), "median_bids": med(b),
                            "mean_bids": mean(b), "single_responsive": len(one),
                            "single_responsive_pct": pct(len(one), len(rows))})
    score = [num(r, "competition_restriction_score") for r in WITHBIDS]
    # The theory under test: does a tighter bar go with a thinner field? Each
    # correlation names its own population, because the corpus has three of them.
    ORD = {"NONE_IDENTIFIED": 0, "POSSIBLE": 1, "MODERATE": 2, "STRONG": 3}
    pubbids = [r for r in WITHBIDS if r["eligibility_restriction_level"] in ORD]

    def lg(r):
        v = num(r, "contract_value_bdt")
        return math.log10(v) if v and v > 0 else None

    corr = {
        "score_vs_log_value_591": pearson(score, [lg(r) for r in WITHBIDS]),
        "score_vs_log_value_276": pearson(
            [num(r, "competition_restriction_score") for r in pubbids],
            [lg(r) for r in pubbids]),
        "score_vs_bids_276": pearson(
            [num(r, "competition_restriction_score") for r in pubbids],
            [num(r, "total_bids_received") for r in pubbids]),
        "level_vs_bids_276": pearson(
            [ORD[r["eligibility_restriction_level"]] for r in pubbids],
            [num(r, "total_bids_received") for r in pubbids]),
        "score_vs_bids_591": pearson(score, [num(r, "total_bids_received") for r in WITHBIDS]),
        "bids_vs_responsive_rate": pearson(
            [num(r, "total_bids_received") for r in WITHBIDS],
            [num(r, "responsive_bid_rate_pct") for r in WITHBIDS]),
    }

    # money by authority
    agencies = []
    for k, n in collections.Counter(r["agency"] for r in MASTER).most_common():
        rows = [r for r in AWARDED if r["agency"] == k]
        withb = [r for r in WITHBIDS if r["agency"] == k]
        noc = [r for r in MASTER if r["agency"] == k
               and r["eligibility_published"] != "SUBSTANTIVE_TEXT_PUBLISHED"]

        v = sum(num(r, "contract_value_bdt") or 0 for r in rows)
        agencies.append({
            "key": k, "tenders": n, "awarded": len(rows), "crore": cr(v),
            "share": pct(v, total_value),
            "median_bids": med([num(r, "total_bids_received") for r in withb]),
            "no_criteria": len(noc), "no_criteria_pct": pct(len(noc), n),
            "organization": next((txt(r, "organization") for r in MASTER
                                  if r["agency"] == k and txt(r, "organization")), ""),
        })

    return dict(
        total_value=total_value, comp=comp, restriction=restriction, corr=corr,
        agencies=agencies, bids=bids, resp=resp, lost=lost,
        single_resp=single_resp, half_lost=half_lost, with_rejects=with_rejects,
        thin=thin, thin_value=thin_value,
    )


# ------------------------------------------------------- who wins, how often

def build_winners():
    ent = collections.defaultdict(lambda: {
        "contracts": 0, "value": 0.0, "agencies": set(), "thin_wins": 0,
        "tenders": [], "verbatim": set(), "variants": set(), "jv": 0,
        "districts": set(), "owners": []})
    for r in AWARDED:
        key = txt(r, "winner_name_normalised") or txt(r, "winner_name")
        if not key:
            continue
        e = ent[key]
        e["contracts"] += 1
        e["value"] += num(r, "contract_value_bdt") or 0
        e["agencies"].add(r["agency"])
        if (num(r, "total_bids_received") or 99) <= 2:
            e["thin_wins"] += 1
        e["tenders"].append(r["tender_id"])
        if txt(r, "winner_name_verbatim"):
            e["verbatim"].add(txt(r, "winner_name_verbatim"))
        v = txt(r, "winner_possible_name_variants")
        if v:
            e["variants"].update(x.strip() for x in re.split(r"[;|]", v) if x.strip())
        if yes(r, "winner_is_joint_venture"):
            e["jv"] += 1
        if txt(r, "pe_district"):
            e["districts"].add(txt(r, "pe_district"))

    for b in BID:
        if b["record_type"] != "DISCLOSED_BENEFICIAL_OWNER_OF_WINNER":
            continue
        row = BY_ID.get(b["tender_id"])
        if not row:
            continue
        key = txt(row, "winner_name_normalised") or txt(row, "winner_name")
        if key in ent and txt(b, "beneficial_owner_name"):
            who, role = person(txt(b, "beneficial_owner_name"))
            ent[key]["owners"].append({
                "name": who, "role": role,
                "share": txt(b, "ownership_percentage"),
                "country": txt(b, "owner_country"),
                "tender_id": b["tender_id"]})

    total = sum(e["value"] for e in ent.values())
    out = []
    for k, e in ent.items():
        seen = set()
        owners = [o for o in e["owners"]
                  if not (o["name"].upper() in seen or seen.add(o["name"].upper()))]
        out.append({
            "name": NAME_OF.get(k) or tidy_name(k), "key": k,
            "contracts": e["contracts"], "crore": cr(e["value"]),
            "taka": round(e["value"], 2), "share": pct(e["value"], total, 2),
            "agencies": sorted(e["agencies"]), "thin_wins": e["thin_wins"],
            "tenders": e["tenders"], "jv_awards": e["jv"],
            "verbatim": sorted(e["verbatim"])[:4], "variants": sorted(e["variants"])[:6],
            "districts": sorted(e["districts"]), "owners": owners,
        })
    out.sort(key=lambda x: (-x["taka"], x["name"]))
    hhi = sum((x["share"] or 0) ** 2 for x in out)
    return out, round(hhi, 1), total


# --------------------------------------------------- the eighteen rules tested

def build_rules():
    by_code = collections.defaultdict(list)
    for d in DEV:
        by_code[d["rule_code"]].append(d)

    rules = []
    for spec in RULES:
        code = spec["code"]
        rows = by_code.get(code, [])
        res = collections.Counter(d["test_result"] for d in rows)
        devs = [d for d in rows if d["test_result"] == "DEVIATION"]
        dv = sum(num(d, "contract_value_bdt") or 0 for d in devs)
        ag = collections.Counter(d["agency"] for d in devs)
        # the two axes on which every citation in this corpus has to be discounted
        scope = collections.Counter(d["instrument_scope_vs_this_tender"] for d in devs)
        timing = collections.Counter(d["instrument_timing_vs_this_tender"] for d in devs)
        postdates = sum(n for k, n in timing.items() if k.startswith("INSTRUMENT_POSTDATES")
                        or "POSTDATE" in k)
        example = devs[0] if devs else (rows[0] if rows else None)
        rules.append({
            "code": code,
            "short": spec["short"],
            "clause": spec["clause"],
            "source_file": spec["source_file"],
            "pdf_page": spec.get("pdf_page"),
            "printed_page": spec.get("printed_page"),
            "force": spec["force"],
            "certainty": spec["clause_certainty"],
            "quote": spec["quote"],
            "test": spec["test"],
            "severity": spec["severity"],
            "limit": spec["limit"],
            "tested": len(rows),
            "results": [{"key": k, "n": v} for k, v in res.most_common()],
            "deviations": len(devs),
            "deviation_crore": cr(dv),
            "by_agency": [{"key": k, "n": v} for k, v in ag.most_common()],
            "scope": [{"key": k, "n": v} for k, v in scope.most_common()],
            "postdates_event": postdates,
            "example_tender": example["tender_id"] if example else None,
            "example_excerpt": (txt(example, "tender_evidence_excerpt")
                                if example else ""),
            "example_page": (txt(example, "tender_evidence_page") if example else ""),
            "example_file": (txt(example, "tender_evidence_source_file")
                             if example else ""),
            "observed_sample": [
                {"tender_id": d["tender_id"], "observed": txt(d, "observed_value"),
                 "required": txt(d, "required_value")} for d in devs[:3]],
        })
    rules.sort(key=lambda x: -x["deviations"])
    return rules


# ------------------------------------------------- the price nobody can check against
# The official cost estimate is the figure a procuring entity works out before it
# advertises: what the job ought to cost. Three of the eighteen rules tested here
# decide something by comparing a price to it - whether the winning price was the
# lowest evaluated one, whether a lone surviving tender was reasonable, and whether
# a quoted rate fell inside a fixed corridor. The estimate is printed in none of
# the documents, so this block records, per rule, how many tests turned on it and
# how many could therefore be run at all.
#
# The corridor is the one place the estimate does operative work on the page. Where
# a notice declares that any rate more than ten per cent above or below the
# estimate is non-responsive, the percentage is printed in the notice's own
# sentence, so the figure is read out of that sentence rather than assumed.

BAND_PCT = re.compile(r"(\d+(?:\.\d+)?)\s*(?:\(\s*[A-Za-z]+\s*\)\s*)?\s*(?:%|percent|per cent)",
                      re.I)


def build_estimate():
    by_code = collections.defaultdict(list)
    for d in DEV:
        by_code[d["rule_code"]].append(d)

    def turns_on(code, result):
        """One rule that needs the estimate: rows tested, and rows the named
           result was recorded on. The two are equal wherever the estimate is
           what was missing, which is the point being reported."""
        rows = by_code.get(code, [])
        return {"code": code, "tested": len(rows),
                "unrun": sum(1 for d in rows if d["test_result"] == result)}

    band = [r for r in MASTER if yes(r, "price_band_nonresponsive_clause")]
    band_won = [r for r in band if num(r, "contract_value_bdt")]
    band_bids = [num(r, "total_bids_received") for r in band]
    rest_bids = [num(r, "total_bids_received") for r in MASTER
                 if not yes(r, "price_band_nonresponsive_clause")]

    # the corridor width as each notice prints it, not as we assume it
    widths = collections.Counter()
    both = 0
    for r in band:
        ex = txt(r, "evidence_excerpt_price_band")
        m = BAND_PCT.search(ex)
        widths[m.group(1) if m else "NOT_PRINTED_IN_EXCERPT"] += 1
        # a corridor that names both directions rejects the cheap tender as well
        # as the dear one; that is what caps the saving, so count it separately
        if re.search(r"below|less|lower", ex, re.I) and \
           re.search(r"above|more than|exceed|over", ex, re.I):
            both += 1

    # what the standard document itself allows, read out of its own sentence
    q = next((r.get("quote", "") for r in RULES if r.get("code") == "R11"), "")
    m = re.search(r"(\d+)\s*%", q)
    std = m.group(1) if m else None

    # ITT 50.3-50.6 is December 2025 text and these notices run from 2015; the
    # engine's year-granularity timing test says how many were published before
    # the machinery they depart from existed
    timing = collections.Counter(d["instrument_timing_vs_this_tender"]
                                 for d in by_code.get("R05", []))
    return {
        "lowest_price_test": turns_on("R14", "NOT_TESTABLE_DATA_ABSENT"),
        "single_tender_test": turns_on("R11", "MANDATED_TEST_UNVERIFIABLE"),
        "band_rule": "R05",
        "band_notices": len(band),
        "band_pct": pct(len(band), len(MASTER)),
        "band_awarded": len(band_won),
        "band_crore": cr(sum(num(r, "contract_value_bdt") or 0 for r in band_won)),
        "band_share": pct(sum(num(r, "contract_value_bdt") or 0 for r in band_won),
                          AWARDED_VALUE, 2),
        "band_median_crore": cr(med([num(r, "contract_value_bdt") for r in band_won])),
        "band_median_bids": med(band_bids),
        "rest_median_bids": med(rest_bids),
        "rest_with_bids": sum(1 for x in rest_bids if x is not None),
        "band_with_bids": sum(1 for x in band_bids if x is not None),
        "band_agencies": [{"key": k, "n": v} for k, v
                          in collections.Counter(r["agency"] for r in band).most_common()],
        "band_agencies_silent": len({r["agency"] for r in MASTER})
        - len({r["agency"] for r in band}),
        "widths": [{"key": k, "n": v} for k, v in widths.most_common()],
        "width_common": widths.most_common(1)[0][0] if widths else None,
        "two_sided": both,
        "std_pct": std,
        "excerpt_published": sum(1 for r in band
                                 if txt(r, "evidence_excerpt_price_band")),
        "band_predates_standard": sum(n for k, n in timing.items() if "POSTDATE" in k),
        "band_standard_in_force": sum(n for k, n in timing.items()
                                      if "PLAUSIBLY_IN_FORCE" in k),
    }


# ------------------------------------- the deviations that survive both discounts
# A deviation count is only worth printing once two things have been taken off it:
# the tests where the clause cited postdates the event it is measured against, and
# the difference between a clause worded as a duty and a figure a document
# recommends. This block does both subtractions in the build, so the article can
# name the surviving number instead of asking a reader to do the arithmetic.
#
# "In force" here means the engine could place the cited instrument at or before
# the year of the tender's own event - nothing stronger. The test is
# year-granularity only, which the article says where it uses the figure.

DUTY_FORCE = {"MANDATORY_SHALL", "MANDATORY_SHALL_NOT"}


# ------------------------------------------- how closed an enlistment gate really is
# R03 finds 88 open tenders that require the bidder to be enlisted already. Printing
# 88 alone would be false in the direction that matters: read the wording on each one
# and most of them are "Enlisted (Electrical) Contractor/Supplier of RAJUK or Other
# Govt./Semi Govt./Autonomous Organization/Reputed Bonafide Firm", which excludes only
# a firm never enlisted anywhere in the public sector. So the wording is sorted into
# three shapes and the article prints all three, commonest first.
#
#   catch_all     a named body OR any other public body - the widest form
#   named_list    a fixed list of named public bodies and nothing else
#   single_office one named office and nothing else - the genuinely closed form
#   own_office    of those, the ones naming the authority running the tender
#
# The test is on the excerpt the engine kept for the row, so it can be re-read: the
# excerpt is on every R03 row of rule_deviations.csv and in the rules section.

CATCH_ALL = re.compile(r"other\s+govt|any\s+government|semi[-\s]?govt|semi[-\s]?government",
                       re.I)
NAMED_BODY = re.compile(r"\b(RAJUK|CDA|COXDA|KDA|RDA|BPDB|PWD|CPA|WASA|CCC|KGDCL|"
                        r"Petrobangla|Cox'?s\s+Bazar\s+Development\s+Authority)\b", re.I)
AGENCY_SELF = {
    "RAJUK": re.compile(r"\bRAJUK\b", re.I),
    "CDA": re.compile(r"\bCDA\b", re.I),
    "COXDA": re.compile(r"\bCOXDA\b|Cox'?s\s+Bazar\s+Development\s+Authority", re.I),
    "KDA": re.compile(r"\bKDA\b", re.I),
    "RDA": re.compile(r"\bRDA\b", re.I),
    "GDA": re.compile(r"\bGDA\b", re.I),
}


def enlisting_bodies(ex):
    """How many enlisting bodies the wording offers as alternatives.

    Counted by alternation, not by name: the excerpt is split on the separators
    these clauses use to list bodies - "/", ",", "or", "&" - and a segment counts
    once however many names it holds. That is what keeps "KGDCL of Petrobangla",
    a utility named with its parent, one body rather than two, while "CDA/ BPDB/
    PWD/ CPA/ WASA/ CCC" stays six.
    """
    return sum(1 for seg in re.split(r"[/,&]|\bor\b", ex, flags=re.I)
               if NAMED_BODY.search(seg))


def enlistment_shapes():
    rows = [d for d in DEV
            if d["rule_code"] == "R03" and d["test_result"] == "DEVIATION"]
    out = {"n": len(rows), "catch_all": 0, "named_list": 0, "single_office": 0,
           "own_office": 0, "closed": []}
    for d in rows:
        ex = txt(d, "tender_evidence_excerpt")
        if CATCH_ALL.search(ex):
            out["catch_all"] += 1
            continue
        bodies = enlisting_bodies(ex)
        if bodies > 1:
            out["named_list"] += 1
            continue
        out["single_office"] += 1
        self_named = AGENCY_SELF.get(d["agency"])
        own = bool(self_named and self_named.search(ex))
        if own:
            out["own_office"] += 1
        out["closed"].append({
            "tender_id": d["tender_id"],
            "agency": d["agency"],
            "own_office": own,
            "excerpt": ex[:400],
            "file": txt(d, "tender_evidence_source_file"),
            "page": txt(d, "tender_evidence_page"),
        })
    out["closed"].sort(key=lambda x: (not x["own_office"], x["tender_id"]))
    return out


def build_violations():
    dev = [d for d in DEV if d["test_result"] == "DEVIATION"]
    in_force = [d for d in dev
                if "PLAUSIBLY_IN_FORCE" in d["instrument_timing_vs_this_tender"]]

    by_code = collections.defaultdict(list)
    for d in dev:
        by_code[d["rule_code"]].append(d)
    force_of = {}
    short_of = {}
    for spec in RULES:
        force_of[spec["code"]] = spec["force"]
        short_of[spec["code"]] = spec["short"]

    rows = []
    for code in sorted(by_code):
        devs = by_code[code]
        live = [d for d in devs
                if "PLAUSIBLY_IN_FORCE" in d["instrument_timing_vs_this_tender"]]
        rows.append({
            "code": code,
            "short": short_of.get(code, code),
            "force": force_of.get(code, ""),
            "duty": force_of.get(code) in DUTY_FORCE,
            "deviations": len(devs),
            "in_force": len(live),
            "crore": cr(sum(num(d, "contract_value_bdt") or 0 for d in devs)),
            "in_force_crore": cr(sum(num(d, "contract_value_bdt") or 0 for d in live)),
            "tenders": len(set(d["tender_id"] for d in live)),
            # Which authorities the rule is found in, commonest first. Several
            # deviations are concentrated in one or two agencies rather than
            # spread across the six, and the article says so from this list.
            "by_agency": tally(devs, "agency"),
        })

    duty = [d for d in in_force if d["clause_force"] in DUTY_FORCE]
    band = [d for d in in_force if d["clause_force"] not in DUTY_FORCE]
    # R01 is the ownership field, and its own limit shows the field only became
    # operable in this corpus in 2025. The article keeps it in the total and also
    # prints the total without it, rather than choosing one of the two.
    no_own = [d for d in duty if d["rule_code"] != "R01"]

    return {
        "in_force": len(in_force),
        "duty_in_force": len(duty),
        "band_in_force": len(band),
        "duty_without_ownership": len(no_own),
        "duty_tenders": len(set(d["tender_id"] for d in duty)),
        "duty_crore": cr(sum(num(d, "contract_value_bdt") or 0 for d in duty)),
        "deviating_rules": len(rows),
        "duty_rules": sum(1 for r in rows if r["duty"]),
        "rules": rows,
        "force": [{"key": k, "n": v} for k, v in
                  collections.Counter(d["clause_force"] for d in in_force).most_common()],
        "by_agency": [{"key": k, "n": v} for k, v in
                      collections.Counter(d["agency"] for d in duty).most_common()],
    }


# ------------------------------------------- the six authorities, side by side
# The question a reader asks of six public bodies is not how many notices each
# published but whose record is worst, and that cannot honestly be answered with
# one number: the six measures below are in six different units, and no weighting
# between them is written in any of these documents. So none is invented here.
# Each measure is computed on its own denominator, which is carried beside it
# because a denominator left unstated is a claim left unchecked. The six bodies
# are ranked on each, and the only composite printed is a count - on how many of
# the six does this body sit above the middle of the six. That count is ours, and
# the article says so where it prints it.
#
# A body with nothing recorded is not a body with a clean record. Where the
# denominator is zero - no bid count published anywhere, no award to time - the
# measure is None rather than 0, and it is left out of that body's count in both
# directions rather than scored as a clean sheet.
#
# Six bodies in six places is a map, and no map is drawn. No boundary geometry
# exists in the supplied documents, and the documents are the only source this
# investigation may use, so place is carried the one way the documents carry it
# themselves: the district printed on the notice, with the number of notices that
# printed it. Where one body's notices print a district two ways, both spellings
# are carried at their own counts and neither is merged away.

AUTH_MEASURES = [
    ("no_criteria", "notices"),
    ("one_resp", "with_bids"),
    ("band", "notices"),
    ("late", "awarded"),
    ("top1", "awarded"),
    ("duty", "notices"),
]


def frac(part, whole):
    """A share with its own denominator attached, or None where the documents
       record nothing to divide by. Zero out of zero is not zero per cent."""
    if not whole:
        return None
    return {"pct": pct(part, whole), "n": part, "of": whole}


def build_authorities():
    # one set of tender ids per authority: the notices carrying at least one
    # departure from a clause worded as a duty whose instrument the engine could
    # place at or before the year of the tender's own event
    duty_ids = collections.defaultdict(set)
    for d in DEV:
        if d["test_result"] == "DEVIATION" and d["clause_force"] in DUTY_FORCE and \
           "PLAUSIBLY_IN_FORCE" in d["instrument_timing_vs_this_tender"]:
            duty_ids[d["agency"]].add(d["tender_id"])

    rows = []
    for key, notices in collections.Counter(r["agency"] for r in MASTER).most_common():
        mine = [r for r in MASTER if r["agency"] == key]
        awd = [r for r in mine if num(r, "contract_value_bdt")]
        withb = [r for r in mine if num(r, "total_bids_received") is not None]
        noc = [r for r in mine
               if r["eligibility_published"] != "SUBSTANTIVE_TEXT_PUBLISHED"]
        one = [r for r in withb if num(r, "responsive_bids") == 1]
        band = [r for r in mine if yes(r, "price_band_nonresponsive_clause")]
        # the legal window is read off the engine's own verdict string, which
        # names the cap it applied; EXCEEDS is the only way it records an overrun
        timed = [r for r in mine if txt(r, "signing_within_legal_band")]
        late = [r for r in timed
                if txt(r, "signing_within_legal_band").startswith("EXCEEDS")]
        value = sum(num(r, "contract_value_bdt") or 0 for r in awd)

        # the largest single winner inside this authority, keyed the way
        # build_winners keys one, so a reader can reconcile the two lists
        won, wins = collections.defaultdict(float), collections.Counter()
        for r in awd:
            w = txt(r, "winner_name_normalised") or txt(r, "winner_name")
            if w:
                won[w] += num(r, "contract_value_bdt") or 0
                wins[w] += 1
        booked = sum(won.values())
        top = max(won.items(), key=lambda x: x[1]) if booked else None

        # district as printed, commonest first, every spelling kept
        printed = [{"key": p, "n": c} for p, c in collections.Counter(
            txt(r, "pe_district") for r in mine if txt(r, "pe_district")).most_common()]

        rows.append({
            "key": key,
            "organization": next((txt(r, "organization") for r in mine
                                  if txt(r, "organization")), ""),
            "district": printed[0]["key"] if printed else "",
            "district_n": printed[0]["n"] if printed else 0,
            "printed": printed,
            "spellings": len(printed),
            "tenders": notices,
            "awarded": len(awd),
            "crore": cr(value),
            "taka": round(value, 2),
            "share": pct(value, AWARDED_VALUE),
            "median_bids": med([num(r, "total_bids_received") for r in withb]),
            "rejected": int(sum(num(r, "bidders_rejected_count") or 0 for r in mine)),
            "reasons": 0,
            "top1_name": NAME_OF.get(top[0]) or tidy_name(top[0]) if top else "",
            "top1_wins": wins[top[0]] if top else 0,
            "hhi": round(sum((v / booked * 100) ** 2 for v in won.values()), 1)
            if booked else None,
            "winners": len(won),
            "m": {
                "no_criteria": frac(len(noc), notices),
                "one_resp": frac(len(one), len(withb)),
                "band": frac(len(band), notices),
                "late": frac(len(late), len(timed)),
                # a money share, so its parts are money and are named as money
                # rather than dressed as the n-of-N the other five carry
                "top1": {"pct": pct(top[1], booked), "crore": cr(top[1]),
                         "of_crore": cr(booked), "contracts": wins[top[0]]}
                if top else None,
                "duty": frac(len(duty_ids[key]), notices),
            },
        })

    # Each measure ranked on its own: the middle of the six, the body at the top
    # of the list and the body at the bottom. "Worst" throughout means the
    # highest share on that one measure and nothing beyond it.
    measures = {}
    for mk, denom in AUTH_MEASURES:
        got = [(r["key"], r["m"][mk]["pct"]) for r in rows if r["m"].get(mk)]
        if not got:
            continue
        hi = max(got, key=lambda x: x[1])
        lo = min(got, key=lambda x: x[1])
        measures[mk] = {
            "denominator": denom, "measured": len(got),
            "middle": round(st.median([v for _, v in got]), 2),
            "worst": hi[0], "worst_pct": hi[1], "best": lo[0], "best_pct": lo[1],
            "max": max(v for _, v in got),
        }

    for r in rows:
        got = [mk for mk, _ in AUTH_MEASURES if r["m"].get(mk)]
        r["measured"] = len(got)
        r["above"] = sum(1 for mk in got if r["m"][mk]["pct"] > measures[mk]["middle"])
        r["worst_on"] = [mk for mk in got if measures[mk]["worst"] == r["key"]]

    # ordered by the count, then by the money, so the table reads as the answer
    rows.sort(key=lambda r: (-r["above"], -r["taka"]))
    lead = [r for r in rows if r["above"] == rows[0]["above"]]
    return {
        "order": [mk for mk, _ in AUTH_MEASURES],
        "measures": measures,
        "rows": rows,
        "n": len(rows),
        "of": len(AUTH_MEASURES),
        # how many bodies tie at the top of our own count, and their combined
        # share of the money - the article leads on this rather than on a winner
        "lead": [r["key"] for r in lead],
        "lead_n": len(lead),
        "lead_above": rows[0]["above"],
        "lead_crore": cr(sum(r["taka"] for r in lead)),
        "lead_share": pct(sum(r["taka"] for r in lead), AWARDED_VALUE),
        "rejected": int(sum(num(r, "bidders_rejected_count") or 0 for r in MASTER)),
        "reasons": 0,
        "districts": len({p["key"] for r in rows for p in r["printed"]}),
        # bodies whose notices print a second district name more than once. Not
        # a claim that the two names are two places, nor that they are one: both
        # are reported as printed and the reader is told the counts.
        "second_named": [r["key"] for r in rows if r["spellings"] > 1
                         and r["printed"][1]["n"] > 1],
    }


# ---------------------------------------------- one slim row per tender, 1,155

SLIM = [
    "tender_id", "tender_reference", "agency", "organization", "ministry",
    "procuring_entity", "pe_district", "project_name", "package_description",
    "procurement_nature", "procurement_type", "procurement_method",
    "evaluation_type", "source_of_funds", "tender_status",
    "publication_date", "closing_date", "opening_date",
    "documents_sold", "total_bids_received", "responsive_bids",
    "responsive_bid_rate_pct", "bidders_rejected_count", "competition_level",
    "eligibility_published", "eligibility_restriction_level",
    "eligibility_red_flag_type", "competition_restriction_score",
    "minimum_years_experience", "minimum_similar_projects",
    "minimum_similar_project_value_bdt", "required_turnover_bdt",
    "required_liquid_assets_bdt", "financial_capacity_requirement_bdt",
    "turnover_to_contract_value_ratio",
    "similar_project_value_to_contract_value_ratio",
    "financial_bar_to_contract_value_ratio", "security_to_contract_value_ratio",
    "winner_name", "winner_name_normalised", "winner_is_joint_venture",
    "winner_jv_partners_and_shares", "winner_location", "contract_value_bdt",
    "noa_date", "signing_date", "days_noa_to_signing", "signing_within_legal_band",
    "tender_security_bdt", "amendment_count", "amendment_touched_eligibility",
    "beneficial_ownership_disclosed", "repeated_winner_pattern",
    "number_of_tenders_using_rule", "peer_median_bids", "bids_vs_peer_median",
    "investigative_priority_score", "investigative_priority_band",
    "priority_score_components", "potential_preselection_pattern",
    "preselection_stage_count", "preselection_stages_met", "retender_flag",
    "price_anomaly_flag", "rule_deviation_count", "rule_deviation_codes",
    "rule_deviation_mandatory_clause_codes", "extraction_confidence",
    "documented_fact", "investigative_hypothesis", "journalist_next_step",
    "data_gaps", "notice_pages", "award_pages", "notice_access_denied",
]
FLAGS = ["price_band_nonresponsive_clause", "agency_enlistment_requirement",
         "govt_client_experience_required", "pwd_authentication_requirement",
         "dealer_requirement", "manufacturer_requirement", "brand_requirement",
         "brand_without_or_equivalent", "model_specific_requirement",
         "proprietary_specification", "narrow_specification",
         "possible_specification_targeting", "electrical_licence_requirement",
         "local_presence_requirement", "iso_certification_requirement",
         "egp_id_on_certificate_required", "bank_document_window_requirement",
         "blanket_rejection_clause", "reputed_qualifier",
         "false_document_forfeiture_clause", "licence_document_stack",
         "mass_disqualification_flag", "many_bids_one_responsive_flag",
         "incumbent_advantage_risk", "or_equivalent_present",
         "repeated_rule_present"]
EXCERPTS = ["eligibility", "general_experience", "specific_experience",
            "turnover", "liquid_assets", "price_band", "enlistment", "competition"]

NUMERIC = {"documents_sold", "total_bids_received", "responsive_bids",
           "responsive_bid_rate_pct", "bidders_rejected_count",
           "competition_restriction_score", "minimum_years_experience",
           "minimum_similar_projects", "minimum_similar_project_value_bdt",
           "required_turnover_bdt", "required_liquid_assets_bdt",
           "financial_capacity_requirement_bdt", "turnover_to_contract_value_ratio",
           "similar_project_value_to_contract_value_ratio",
           "financial_bar_to_contract_value_ratio",
           "security_to_contract_value_ratio", "contract_value_bdt",
           "days_noa_to_signing", "tender_security_bdt", "amendment_count",
           "number_of_tenders_using_rule", "peer_median_bids",
           "investigative_priority_score", "preselection_stage_count",
           "rule_deviation_count"}


def build_tenders():
    """Two payloads: a light one the table filters on, and the long-form detail
    the reader only pays for when a tender is opened."""
    rows, detail = [], {}
    for r in MASTER:
        o = {}
        for c in SLIM:
            o[c] = num(r, c) if c in NUMERIC else txt(r, c)
        o["flags"] = [c for c in FLAGS if yes(r, c)
                      or (r.get(c) or "").strip() == c.upper()]
        # The firm reads the same on every surface of the site; where this notice
        # spelled it differently, that spelling is kept beside it.
        if txt(r, "winner_name"):
            shown = winner_of(r)
            if shown != txt(r, "winner_name"):
                o["winner_printed"] = txt(r, "winner_name")
            o["winner_name"] = shown
        o["pub"] = iso(txt(r, "publication_date"))
        o["close"] = iso(txt(r, "closing_date"))
        o["sign"] = iso(txt(r, "signing_date"))
        o["notice"] = docref("notice", txt(r, "notice_source_file"), txt(r, "notice_pages"))
        o["award"] = docref("award", txt(r, "award_source_file"), txt(r, "award_pages"))
        detail[r["tender_id"]] = {
            "fact": o.pop("documented_fact"),
            "hypothesis": o.pop("investigative_hypothesis"),
            "next_step": o.pop("journalist_next_step"),
            "gaps": o.pop("data_gaps"),
            "components": o.pop("priority_score_components"),
            "stages_met": o.pop("preselection_stages_met"),
            "red_flags": o.pop("eligibility_red_flag_type"),
            "jv": o.pop("winner_jv_partners_and_shares"),
            "restriction_note": txt(r, "restriction_vs_competition_note"),
            "rejection_reason": txt(r, "rejection_reason"),
            "rejected_requirement": txt(r, "rejected_requirement"),
            "beneficiary": txt(r, "potential_beneficiary"),
            "target_type": txt(r, "potential_target_company_type"),
            "amendment": txt(r, "amendment_old_to_new"),
            "evidence_pages": txt(r, "evidence_page_numbers"),
            "extraction": txt(r, "extraction_method"),
            "variants": txt(r, "winner_possible_name_variants"),
            "lowest": num(r, "lowest_bid"), "highest": num(r, "highest_bid"),
            "average": num(r, "average_bid"),
            "estimate": txt(r, "estimated_tender_value"),
            "citation_caveat": txt(r, "rule_citation_caveat"),
            "excerpts": [[e, txt(r, "evidence_excerpt_" + e)] for e in EXCERPTS
                         if txt(r, "evidence_excerpt_" + e)],
            "reused_clause": txt(r, "repeated_rule_excerpt"),
            "matching": txt(r, "matching_tender_ids"),
        }
        rows.append(o)
    return rows, detail


def build_search_text():
    """Document language, straight out of the notices, for the search tool."""
    idx = {}
    for r in MASTER:
        parts = []
        for e in EXCERPTS:
            v = txt(r, "evidence_excerpt_" + e)
            if v:
                parts.append([e, v])
        rr = txt(r, "repeated_rule_excerpt")
        if rr:
            parts.append(["repeated_clause", rr])
        am = txt(r, "amendment_old_to_new")
        if am:
            parts.append(["amendment", am])
        rj = txt(r, "rejection_reason")
        if rj:
            parts.append(["rejection", rj])
        if parts:
            idx[r["tender_id"]] = parts
    return idx


def build_deviations():
    """Grouped by tender, with the per-rule constants left in rules.json and the
    repeated evidence text interned once. Same 5,525 tests, a third of the bytes."""
    strings, sidx = [], {}

    def intern(s):
        if not s:
            return -1
        i = sidx.get(s)
        if i is None:
            i = sidx[s] = len(strings)
            strings.append(s)
        return i

    by_tender = collections.defaultdict(list)
    for d in DEV:
        by_tender[d["tender_id"]].append([
            d["rule_code"],
            txt(d, "test_result"),
            intern(txt(d, "observed_value")),
            intern(txt(d, "required_value")),
            intern(txt(d, "tender_evidence_excerpt")),
            txt(d, "tender_evidence_page"),
            txt(d, "tender_evidence_source_file"),
            txt(d, "instrument_timing_vs_this_tender"),
            txt(d, "instrument_scope_vs_this_tender"),
            intern(txt(d, "documented_fact")),
        ])
    return {"fields": ["code", "result", "observed", "required", "excerpt", "page",
                       "file", "timing", "scope", "fact"],
            "interned": [2, 3, 4, 9], "strings": strings,
            "byTender": by_tender}


def build_bidders():
    out = []
    for b in BID:
        who, role = person(txt(b, "beneficial_owner_name"))
        shown = tidy_name(txt(b, "bidder_name"))
        o = {
            "tender_id": b["tender_id"], "agency": b["agency"],
            "record_type": b["record_type"],
            "name": shown,
            "normalised": txt(b, "bidder_name_normalised"),
            "amount": num(b, "bid_amount"),
            "responsive": txt(b, "responsive_status"),
            "qualified": txt(b, "qualified_status"),
            "rejection_reason": txt(b, "rejection_reason"),
            "rejected_requirement": txt(b, "rejected_requirement"),
            "owner": who, "owner_role": role,
            "share": txt(b, "ownership_percentage"),
            "country": txt(b, "owner_country"),
            "file": txt(b, "source_file"), "page": txt(b, "page_number"),
            "excerpt": txt(b, "evidence_excerpt"), "note": txt(b, "note"),
        }
        if shown != txt(b, "bidder_name"):
            o["printed"] = txt(b, "bidder_name")
        out.append(o)
    return out


def build_documents():
    """The document shelf: every PDF on disk, with what it belongs to."""
    docs = []
    seen = set()
    for r in MASTER:
        for kind, col, pgcol in (("notice", "notice_source_file", "notice_pages"),
                                 ("award", "award_source_file", "award_pages")):
            fn = txt(r, col)
            if not fn or fn not in HAVE[kind] or (kind, fn) in seen:
                continue
            seen.add((kind, fn))
            docs.append({
                "kind": kind, "file": fn, "dir": PDF_DIRS[kind],
                "pages": txt(r, pgcol), "tender_id": r["tender_id"],
                "reference": txt(r, "tender_reference"), "agency": r["agency"],
                "entity": txt(r, "procuring_entity"),
                "title": txt(r, "package_description") or txt(r, "project_name"),
                "date": iso(txt(r, "publication_date")) if kind == "notice"
                        else iso(txt(r, "signing_date")),
                "value": num(r, "contract_value_bdt") if kind == "award" else None,
            })
    ref_titles = {}
    for spec in RULES:
        f = spec["source_file"].split("/")[-1]
        ref_titles.setdefault(f, []).append(spec["code"])
    for fn in sorted(HAVE["reference"]):
        docs.append({
            "kind": "reference", "file": fn, "dir": PDF_DIRS["reference"],
            "pages": "", "tender_id": "", "reference": "", "agency": "RULEBOOK",
            "entity": "", "title": fn, "date": "",
            "cited_by": sorted(set(ref_titles.get(fn, []))), "value": None,
        })
    docs.sort(key=lambda d: (d["kind"] != "reference", d["agency"], d["file"]))
    return docs


# ----------------------------------------------------- the documentary exhibits
# Each exhibit names a tender and the column that holds the words. The quote is
# lifted from the CSV at build time; nothing is transcribed by hand.
#
# The label and the reading here are the English fallback. The published pair,
# in both languages, lives in EXHIBIT_WORDS in site/scripts/content.js keyed by
# tender_id + "|" + column; keep the English in the two places in step.
EXHIBIT_SPEC = [
    {"tender_id": "199942", "column": "amendment_old_to_new",
     "match": "qualification criteria",
     "label": "An amendment says the conditions were changed to get the right kind of bidder",
     "reading": "The correction notice gives the reason in the office's own words. "
                "It does not say which company, and no document here names one."},
    {"tender_id": "644083", "column": "amendment_old_to_new",
     "match": "Security",
     "label": "The deposit needed to bid was cut tenfold after publication",
     "reading": "An amendment moved the tender security from BDT 830,000 to BDT 83,000. "
                "The notice gives no reason. Two firms bid."},
    {"tender_id": "644083", "column": "evidence_excerpt_price_band",
     "match": "Non-Responsive",
     "label": "A price more than 10% either side of an unpublished estimate is rejected",
     "reading": "The estimate this band is measured from is not published in any "
                "document here, so a bidder cannot know the target it has to hit."},
    {"tender_id": "514221", "column": "evidence_excerpt_eligibility",
     "match": "10 years experience",
     "label": "Five conditions stacked on a BDT 10.45 lakh supply package",
     "reading": "One bid was received and it won. Whether the conditions caused that "
                "is not established by any document here."},
]


# The amendment column prints "<field>: <old> -> <new>". Where the office filled
# in neither the field name nor the old value, the cell opens on ":  -> #" — the
# column's own punctuation and a list marker, not words from the page. An exhibit
# presents itself as a quotation, so that scaffolding is dropped from what is
# shown and the untouched cell is kept beside it as quote_raw. Only leading
# separators go; not one word is changed, and a cell that starts with a word
# (Tender/Proposal Security: BDT 830000 -> BDT 83000) is left exactly as printed.
LEADING_SCAFFOLD = re.compile(r"^\s*:?\s*(?:->|→)\s*|^\s*#\s*")


def shown_quote(s):
    out = (s or "").strip()
    while True:
        cut = LEADING_SCAFFOLD.sub("", out, count=1).strip()
        if cut == out:
            return out
        out = cut


def build_exhibits():
    out = []
    for spec in EXHIBIT_SPEC:
        r = BY_ID.get(spec["tender_id"])
        if not r:
            continue
        raw = txt(r, spec["column"])
        if not raw:
            continue
        seg = [s.strip() for s in raw.split("|") if spec["match"].lower() in s.lower()]
        quote = seg[0] if seg else raw[:400]
        out.append({
            "tender_id": r["tender_id"], "agency": r["agency"],
            "reference": txt(r, "tender_reference"),
            "package": txt(r, "package_description") or txt(r, "project_name"),
            "label": spec["label"], "reading": spec["reading"],
            "quote": shown_quote(quote), "quote_raw": quote, "column": spec["column"],
            "page": txt(r, "eligibility_page") or "1",
            "notice": docref("notice", txt(r, "notice_source_file"), txt(r, "notice_pages")),
            "award": docref("award", txt(r, "award_source_file"), txt(r, "award_pages")),
            "bids": num(r, "total_bids_received"), "responsive": num(r, "responsive_bids"),
            "value": num(r, "contract_value_bdt"), "winner": winner_of(r),
            "score": num(r, "investigative_priority_score"),
        })
    return out


# --------------------------------------------------------------- the case study
# The article opens on one tender, because 1,155 of them is not a thing a reader
# can picture and one road is. Which tender is decided here, by a rule, and the
# rule is published with it: the reader can see that the case was selected and
# not shopped for. Everything the opening scene says is a field of that tender's
# row, so the scene cannot drift from the data.

CASE_RULE = {
    "en": "The largest signed contract in this set where at least three bids "
          "arrived and exactly one was ruled responsive. Ranked on contract "
          "value over the awarded tenders satisfying "
          "<code>total_bids_received &gt;= 3</code> and "
          "<code>responsive_bids == 1</code>.",
    "bn": "এই সংকলনে যেসব স্বাক্ষরিত চুক্তিতে অন্তত তিনটি দর জমা পড়েছে এবং "
          "ঠিক একটি দর গ্রহণযোগ্য বিবেচিত হয়েছে, তার মধ্যে সবচেয়ে বড় চুক্তিটি। "
          "<code>total_bids_received &gt;= 3</code> এবং "
          "<code>responsive_bids == 1</code> শর্ত পূরণ করা চুক্তিগুলোকে "
          "চুক্তিমূল্য অনুযায়ী সাজিয়ে বাছাই করা হয়েছে।",
}


def clause(text, start, end):
    """The stretch of a notice's eligibility paragraph between two of the
    numbered markers it prints, so a quotation is sliced out of the extracted
    text rather than retyped and possibly softened on the way."""
    i = text.find(start)
    if i < 0:
        return ""
    j = text.find(end, i + len(start))
    return text[i:j if j > 0 else len(text)].strip().rstrip(",;")


def as_pct(ratio):
    """A ratio column read as the percentage a sentence wants: 0.7707 of the
    contract value is 77.1% of it."""
    return None if ratio is None else round(ratio * 100, 1)


CAP = re.compile(r"EXCEEDS_(\d+)d_CAP_by_(\d+)d")

# A sum of money as a tender notice writes one, for marking inside a quoted
# clause: "Tk. 740 million", "Tk-58 (Fifty Eight) Lac", "BDT 10,00,000 crore".
MONEY_IN_CLAUSE = (r"(?:Tk|BDT)[-.\s]*[\d,]+(?:\.\d+)?"
                   r"(?:\s*\([A-Za-z ]+\))?"
                   r"(?:\s*(?:[Mm]illion|[Bb]illion|[Cc]rore|[Ll]akh|[Ll]ac))?")


def overrun_of(row):
    """The signing window as two numbers when the award notice records that the
    contract was signed outside it: the cap that applied, and the days past it.
    The column states both in a single token, so both are read from it rather
    than recomputed from dates that may be printed to the day only."""
    m = CAP.search(txt(row, "signing_within_legal_band"))
    return (int(m.group(1)), int(m.group(2))) if m else (None, None)


def highlight(passage, needle):
    """A stretch of extracted document text split into the words on either side
    of the words a finding rests on, so the page can print the passage as
    published and mark the operative phrase inside it. This is the evidence in
    its literal form: not a paraphrase of the clause and not a retyping of it,
    but the clause with a marker laid over the part being read.

    `needle` is a pattern belonging to the case's published rule, never to a
    chosen tender - if it does not match, the passage is returned unmarked
    rather than marked in the wrong place."""
    if not passage:
        return None
    m = re.search(needle, passage) if needle else None
    if not m:
        return {"before": "", "hit": passage, "after": "", "whole": True}
    return {"before": passage[:m.start()], "hit": m.group(0),
            "after": passage[m.end():], "whole": False}


def case_row(r, mark=None):
    """Every figure a case study can print, read off one tender's row. Both the
    opening scene and the transition scenes are built from this, so a sentence
    that works in one works in all of them and no case can quote a field the
    others cannot."""
    val = num(r, "contract_value_bdt")
    elig = txt(r, "evidence_excerpt_eligibility")
    cap, over = overrun_of(r)
    return {
        "mark": highlight(txt(r, mark[0]), mark[1]) if mark else None,
        "cap": cap, "overrun": over,
        "tender_id": r["tender_id"], "agency": r["agency"],
        "organization": txt(r, "organization"),
        "entity": txt(r, "procuring_entity"),
        "reference": txt(r, "tender_reference"),
        "district": txt(r, "pe_district"),
        "project": txt(r, "project_name").split("Tender/Proposal Package No.")[0].strip(),
        "package": txt(r, "package_description"),
        "method": txt(r, "procurement_method"),
        "funds": txt(r, "source_of_funds"),
        "published": iso(txt(r, "publication_date")),
        "closed": iso(txt(r, "closing_date")),
        "doc_price": num(r, "document_price_bdt"),
        "sold": num(r, "documents_sold"),
        "bids": num(r, "total_bids_received"),
        "responsive": num(r, "responsive_bids"),
        "rejected": num(r, "bidders_rejected_count"),
        "value": val, "crore": cr(val),
        "value_share": pct(val, AWARDED_VALUE, 2),
        "winner": winner_of(r),
        "winner_contracts": num(r, "winner_total_tenders"),
        "winner_crore": cr(num(r, "winner_total_contract_value_bdt")),
        "winner_share": num(r, "winner_percentage_of_total_awarded_value"),
        "winner_thin": num(r, "winner_low_competition_wins"),
        "winner_agencies": num(r, "winner_agency_count"),
        "years": num(r, "minimum_years_experience"),
        "similar": num(r, "minimum_similar_project_value_bdt"),
        "similar_crore": cr(num(r, "minimum_similar_project_value_bdt")),
        "similar_ratio": num(r, "similar_project_value_to_contract_value_ratio"),
        "similar_pct": as_pct(num(r, "similar_project_value_to_contract_value_ratio")),
        "turnover": num(r, "required_turnover_bdt"),
        "turnover_crore": cr(num(r, "required_turnover_bdt")),
        "financial_ratio": num(r, "financial_bar_to_contract_value_ratio"),
        "financial_pct": as_pct(num(r, "financial_bar_to_contract_value_ratio")),
        "liquid": num(r, "required_liquid_assets_bdt"),
        "liquid_crore": cr(num(r, "required_liquid_assets_bdt")),
        "security_crore": cr(num(r, "tender_security_bdt")),
        "security_ratio": num(r, "security_to_contract_value_ratio"),
        "security_pct": as_pct(num(r, "security_to_contract_value_ratio")),
        "security": num(r, "tender_security_bdt"),
        "noa": iso(txt(r, "noa_date")), "signed": iso(txt(r, "signing_date")),
        "days": num(r, "days_noa_to_signing"),
        "signing_band": txt(r, "signing_within_legal_band"),
        "reuse": num(r, "number_of_tenders_using_rule"),
        "restriction": txt(r, "eligibility_restriction_level"),
        "red_flag": txt(r, "eligibility_red_flag_type"),

        # How this tender's field compares with tenders of the same authority,
        # method and size band - the like-for-like reading the aggregate cannot
        # give, and the only figure in a case that is relative to other cases.
        "peer_size": num(r, "peer_group_size"),
        "peer_median": num(r, "peer_median_bids"),
        "peer_gap": num(r, "bids_vs_peer_median"),

        # What the portal itself says, in its own fields, about its own deadline
        # and about whether the notice can be opened at all.
        "certified": txt(r, "portal_self_certified_signed_in_due_time"),
        "template": txt(r, "award_template"),
        "notice_denied": txt(r, "notice_access_denied"),

        # How much of the field was set aside, as the master states it.
        "reject_rate": num(r, "disqualification_rate_pct"),
        "mass_flag": txt(r, "mass_disqualification_flag"),

        # The clause-sharing figures: how many other notices carry this one's
        # most-reused sentence, and how many of its sentences are shared at all.
        "shared_clauses": num(r, "shared_clause_count"),
        "price_band_clause": txt(r, "price_band_nonresponsive_clause"),

        # Our own priority score and band, carried on the case so a scene can
        # say where the score put a tender - including when it put it low.
        "score": num(r, "investigative_priority_score"),
        "band": txt(r, "investigative_priority_band"),
        "deviations": num(r, "rule_deviation_count"),
        "codes": txt(r, "rule_deviation_codes"),
        "breach_codes": txt(r, "rule_deviation_publishable_as_breach_codes"),
        "duty_codes": txt(r, "rule_deviation_mandatory_clause_codes"),
        "band_codes": txt(r, "rule_deviation_recommended_band_codes"),
        "timing": txt(r, "rule_instrument_timing"),
        "preselection": txt(r, "potential_preselection_pattern"),
        "stages": num(r, "preselection_stage_count"),
        # The staged conditions this tender actually met, as tokens, so a scene
        # can list them in the reader's language instead of asserting a count.
        "stages_met": [s for s in txt(r, "preselection_stages_met").split(";") if s],
        "quote_experience": clause(elig, "2)The minimum specific experience",
                                   "3)The required average"),
        "quote_bids": txt(r, "evidence_excerpt_competition"),
        "pages": txt(r, "evidence_page_numbers"),
        # A notice the portal refused to serve records eligibility page 0, which
        # is not a page. Cite page 1 instead: the refusal itself is what page 1
        # of that PDF contains, and that is the page the reader will open.
        "page": (txt(r, "eligibility_page")
                 if (num(r, "eligibility_page") or 0) > 0 else "1"),
        "gaps": txt(r, "data_gaps"),
        "next_step": txt(r, "journalist_next_step"),
        "notice": docref("notice", txt(r, "notice_source_file"), txt(r, "notice_pages")),
        "award": docref("award", txt(r, "award_source_file"), txt(r, "award_pages")),
    }


def pick(pool, rank):
    """The top row of a pool under a stated ranking, with the tender id breaking
    ties so the same tender is chosen on every machine and every rebuild."""
    return sorted(pool, key=lambda r: (rank(r), r["tender_id"]))[0] if pool else None


def build_case():
    pool = [r for r in AWARDED
            if (num(r, "total_bids_received") or 0) >= 3
            and num(r, "responsive_bids") == 1]
    r = pick(pool, lambda r: -(num(r, "contract_value_bdt") or 0))
    if r is None:
        return None
    row = case_row(r)
    # The opening scene quotes the specific-experience clause in full, so the
    # highlight is laid over that clause rather than over the whole eligibility
    # paragraph, and it marks the one figure the scene reads out of it.
    row["mark"] = highlight(row["quote_experience"], MONEY_IN_CLAUSE)
    return {**row, "rule": CASE_RULE, "pool": len(pool)}


# ------------------------------------------------------- the transition studies
# Four more tenders, one at each of four turns in the article, so that every
# stretch of counting is anchored to a single road, roof or street light that a
# reader can hold on to. Each is chosen the same way the opening was: by a rule
# stated on the page beside it, ranked over the whole awarded set, with the
# tender id breaking ties. None was searched for by name.
#
# `mark` names the column the highlighted evidence is taken from and the pattern
# marked inside it. The pattern belongs to the rule, not to the tender: it is the
# same pattern whichever row the rule returns, and when it does not match, the
# passage prints unmarked instead of marked in the wrong place.

CASES = [
    {
        "key": "all_rejected",
        "where": "record",
        "pool": lambda r: num(r, "responsive_bids") == 0,
        "rank": lambda r: -(num(r, "total_bids_received") or 0),
        "mark": ("evidence_excerpt_competition", r"Responsive:\s*\d+"),
        "rule": {
            "en": "The signed contract in this set whose award notice records "
                  "that no bid at all was ruled responsive. Ranked on bids "
                  "received over the awarded tenders satisfying "
                  "<code>responsive_bids == 0</code>.",
            "bn": "এই সংকলনে যে স্বাক্ষরিত চুক্তির বিজ্ঞপ্তিতে লেখা আছে একটি দরও "
                  "গ্রহণযোগ্য বিবেচিত হয়নি, সেটি। <code>responsive_bids == 0</code> "
                  "শর্ত পূরণ করা চুক্তিগুলোকে জমা পড়া দরের সংখ্যা অনুযায়ী সাজিয়ে "
                  "বাছাই করা হয়েছে।",
        },
    },
    {
        "key": "single_bid",
        "where": "competition",
        "pool": lambda r: num(r, "total_bids_received") == 1,
        "rank": lambda r: -(num(r, "contract_value_bdt") or 0),
        "mark": ("evidence_excerpt_competition", r"Received:\s*\d+"),
        "rule": {
            "en": "The largest signed contract in this set that drew exactly one "
                  "bid. Ranked on contract value over the awarded tenders "
                  "satisfying <code>total_bids_received == 1</code>.",
            "bn": "এই সংকলনে যে স্বাক্ষরিত চুক্তিতে ঠিক একটি দর জমা পড়েছে, তার "
                  "মধ্যে সবচেয়ে বড়টি। <code>total_bids_received == 1</code> শর্ত "
                  "পূরণ করা চুক্তিগুলোকে চুক্তিমূল্য অনুযায়ী সাজিয়ে বাছাই করা হয়েছে।",
        },
    },
    {
        "key": "no_criteria",
        "where": "eligibility",
        "pool": lambda r: txt(r, "eligibility_restriction_present") == "unknown_not_published",
        "rank": lambda r: -(num(r, "contract_value_bdt") or 0),
        "mark": ("evidence_excerpt_eligibility", None),
        "rule": {
            "en": "The largest signed contract in this set whose tender notice "
                  "prints no qualification criteria of its own. Ranked on "
                  "contract value over the awarded tenders satisfying "
                  "<code>eligibility_restriction_present == "
                  "unknown_not_published</code>.",
            "bn": "এই সংকলনে যে স্বাক্ষরিত চুক্তির দরপত্র বিজ্ঞপ্তিতে নিজস্ব কোনো "
                  "যোগ্যতার শর্ত ছাপা হয়নি, তার মধ্যে সবচেয়ে বড়টি। "
                  "<code>eligibility_restriction_present == "
                  "unknown_not_published</code> শর্ত পূরণ করা চুক্তিগুলোকে "
                  "চুক্তিমূল্য অনুযায়ী সাজিয়ে বাছাই করা হয়েছে।",
        },
    },
    {
        "key": "high_bar",
        "where": "bars",
        "pool": lambda r: num(r, "financial_bar_to_contract_value_ratio") is not None,
        "rank": lambda r: -(num(r, "financial_bar_to_contract_value_ratio") or 0),
        "mark": ("evidence_excerpt_liquid_assets", MONEY_IN_CLAUSE),
        "rule": {
            "en": "The signed contract in this set where the liquid money a "
                  "bidder had to hold was the largest multiple of what the "
                  "contract turned out to be worth. Ranked on "
                  "<code>financial_bar_to_contract_value_ratio</code> over the "
                  "awarded tenders that publish both figures.",
            "bn": "এই সংকলনে যে স্বাক্ষরিত চুক্তিতে দরদাতার কাছে থাকতে হওয়া নগদ "
                  "অর্থ চুক্তির প্রকৃত মূল্যের সবচেয়ে বড় গুণিতক ছিল, সেটি। দুটি "
                  "সংখ্যাই প্রকাশ করা চুক্তিগুলোকে "
                  "<code>financial_bar_to_contract_value_ratio</code> অনুযায়ী "
                  "সাজিয়ে বাছাই করা হয়েছে।",
        },
    },
    {
        "key": "late_signing",
        "where": "signing",
        "pool": lambda r: overrun_of(r)[1] is not None,
        "rank": lambda r: -(overrun_of(r)[1] or 0),
        "mark": ("evidence_excerpt_competition", r"Responsive:\s*\d+"),
        "rule": {
            "en": "The signed contract in this set signed the longest past the "
                  "deadline its own award notice records as applying. Ranked on "
                  "the days-past-cap figure the notice states in "
                  "<code>signing_within_legal_band</code>.",
            "bn": "এই সংকলনে যে স্বাক্ষরিত চুক্তিটি তার নিজের বিজ্ঞপ্তিতে লেখা "
                  "সময়সীমা সবচেয়ে বেশি পেরিয়ে স্বাক্ষরিত হয়েছে, সেটি। "
                  "<code>signing_within_legal_band</code>-এ বিজ্ঞপ্তির নিজের লেখা "
                  "সীমা-অতিক্রমের দিনসংখ্যা অনুযায়ী সাজিয়ে বাছাই করা হয়েছে।",
        },
    },
    # The fifth turn is the one the rules section needs: not the biggest contract
    # or the widest overshoot, but the tender that fell foul of the most tests
    # the timing flag does not discount. One road cannot carry a count of 1,583;
    # it can carry seven tests failed on a single page.
    {
        "key": "rule_stack",
        "where": "rules",
        "pool": lambda r: "PLAUSIBLY_IN_FORCE" in txt(r, "rule_instrument_timing")
                          and (num(r, "rule_deviation_count") or 0) > 0,
        "rank": lambda r: (-(num(r, "rule_deviation_count") or 0),
                           -(num(r, "contract_value_bdt") or 0)),
        "mark": ("evidence_excerpt_enlistment", r"[Ee]nlisted[\s\S]{0,180}?Firm"),
        "rule": {
            "en": "The signed contract in this set that fell foul of the most "
                  "clause tests where the document cited can be placed at or "
                  "before the year of the tender's own event. Ranked on "
                  "<code>rule_deviation_count</code>, then contract value, over "
                  "the awarded tenders whose <code>rule_instrument_timing</code> "
                  "reads <code>INSTRUMENT_PLAUSIBLY_IN_FORCE</code>.",
            "bn": "এই সংকলনে যে স্বাক্ষরিত চুক্তিটি সেই ধারা-পরীক্ষাগুলোর সবচেয়ে "
                  "বেশিতে বিচ্যুত, যেখানে উদ্ধৃত দস্তাবেজটিকে দরপত্রের নিজের "
                  "ঘটনার বছরে বা তার আগে বসানো যায়। যেসব চুক্তির "
                  "<code>rule_instrument_timing</code>-এ "
                  "<code>INSTRUMENT_PLAUSIBLY_IN_FORCE</code> লেখা, সেগুলোকে "
                  "<code>rule_deviation_count</code> ও তারপর চুক্তিমূল্য অনুযায়ী "
                  "সাজিয়ে বাছাই করা হয়েছে।",
        },
    },
    # The sixth turn carries the negative result from the other side. The master
    # compares each tender with the notices of the same authority, method and
    # size band; this is the one that came in furthest below the middle of its
    # own peer group - and it published no bar at all.
    {
        "key": "peer_gap",
        "where": "restriction",
        "pool": lambda r: (num(r, "bids_vs_peer_median") is not None
                           and (num(r, "peer_group_size") or 0) >= 10),
        "rank": lambda r: (num(r, "bids_vs_peer_median"),
                           -(num(r, "contract_value_bdt") or 0)),
        "mark": ("evidence_excerpt_competition", r"Received:\s*\d+"),
        "rule": {
            "en": "The signed contract in this set that drew the fewest bids "
                  "relative to the notices most like it. Ranked on "
                  "<code>bids_vs_peer_median</code>, then contract value, over "
                  "the awarded tenders whose peer group holds at least ten "
                  "notices, so the middle of the group means something.",
            "bn": "এই সংকলনে যে স্বাক্ষরিত চুক্তিতে, তার সঙ্গে সবচেয়ে মেলে এমন "
                  "বিজ্ঞপ্তিগুলোর তুলনায় সবচেয়ে কম দর জমা পড়েছে। যেসব চুক্তির "
                  "তুলনা-দলে অন্তত দশটি বিজ্ঞপ্তি আছে — যাতে দলের মধ্যবর্তী "
                  "সংখ্যাটির অর্থ থাকে — সেগুলোকে "
                  "<code>bids_vs_peer_median</code> ও তারপর চুক্তিমূল্য অনুযায়ী "
                  "সাজিয়ে বাছাই করা হয়েছে।",
        },
    },
    # The seventh turn is the notice most made of other notices' sentences. It is
    # also the counter-example the article has to print: the strictest published
    # bar in the set drew a full field and lost nobody.
    {
        "key": "repeat_clause",
        "where": "reuse",
        "pool": lambda r: (num(r, "shared_clause_count") or 0) > 0,
        "rank": lambda r: (-(num(r, "shared_clause_count") or 0),
                           -(num(r, "number_of_tenders_using_rule") or 0),
                           -(num(r, "contract_value_bdt") or 0)),
        "mark": ("repeated_rule_excerpt",
                 r"general experience[\s\S]*?five \(05\) years"),
        "rule": {
            "en": "The notice in this set assembled from the most sentences it "
                  "shares word for word with other notices. Ranked on "
                  "<code>shared_clause_count</code>, then on how many notices "
                  "carry its most-reused sentence, then contract value, over the "
                  "awarded tenders that share at least one sentence.",
            "bn": "এই সংকলনে যে বিজ্ঞপ্তিটি অন্য বিজ্ঞপ্তিগুলোর সঙ্গে হুবহু মেলে "
                  "এমন সবচেয়ে বেশি বাক্য দিয়ে গাঁথা। অন্তত একটি বাক্য ভাগ করে "
                  "নেওয়া চুক্তিগুলোকে <code>shared_clause_count</code>, তারপর তার "
                  "সবচেয়ে বেশি ব্যবহৃত বাক্যটি কতটি বিজ্ঞপ্তিতে আছে, তারপর "
                  "চুক্তিমূল্য অনুযায়ী সাজিয়ে বাছাই করা হয়েছে।",
        },
    },
    # The eighth turn has no quotation, because the field it turns on is one word
    # long. The portal answered its own question about its own deadline, and the
    # two dates printed beside that answer are the whole of the exhibit.
    {
        "key": "portal_yes",
        "where": "portal",
        "pool": lambda r: (txt(r, "portal_self_certified_signed_in_due_time")
                           == "yes"
                           and txt(r, "signing_within_legal_band")
                           .startswith("EXCEEDS")),
        "rank": lambda r: -(num(r, "contract_value_bdt") or 0),
        "mark": None,
        "rule": {
            "en": "The largest signed contract in this set that the portal "
                  "records as signed in due time and that its own two dates "
                  "place outside the window the size of the contract allows. "
                  "Ranked on contract value over the awarded tenders whose "
                  "<code>portal_self_certified_signed_in_due_time</code> reads "
                  "<code>yes</code> and whose "
                  "<code>signing_within_legal_band</code> begins "
                  "<code>EXCEEDS</code>.",
            "bn": "এই সংকলনে সেই সবচেয়ে বড় স্বাক্ষরিত চুক্তি, যেটিকে পোর্টাল "
                  "নিজেই যথাসময়ে স্বাক্ষরিত বলে লিখে রেখেছে, অথচ তারই ছাপা দুটি "
                  "তারিখ চুক্তির আকার অনুযায়ী প্রাপ্য সময়সীমার বাইরে পড়ে। যেসব "
                  "চুক্তির <code>portal_self_certified_signed_in_due_time</code>-এ "
                  "<code>yes</code> এবং <code>signing_within_legal_band</code> "
                  "<code>EXCEEDS</code> দিয়ে শুরু, সেগুলোকে চুক্তিমূল্য অনুযায়ী "
                  "সাজিয়ে বাছাই করা হয়েছে।",
        },
    },
    # The ninth turn is simply the largest contract in the set, because the money
    # section should open on the money. What it demanded of a bidder is quoted in
    # the same figures the concentration table is built from.
    {
        "key": "biggest",
        "where": "money",
        "pool": lambda r: (num(r, "contract_value_bdt") or 0) > 0,
        "rank": lambda r: -(num(r, "contract_value_bdt") or 0),
        "mark": ("evidence_excerpt_turnover", MONEY_IN_CLAUSE),
        "rule": {
            "en": "The largest signed contract in this set. Ranked on "
                  "<code>contract_value_bdt</code> over every awarded tender "
                  "that prints a contract value.",
            "bn": "এই সংকলনের সবচেয়ে বড় স্বাক্ষরিত চুক্তি। চুক্তিমূল্য ছাপা আছে "
                  "এমন সব চুক্তিকে <code>contract_value_bdt</code> অনুযায়ী সাজিয়ে "
                  "বাছাই করা হয়েছে।",
        },
    },
    # The tenth turn is the one notice in the set whose own words put a number on
    # a rule it appears to break: reject any price more than a tenth away from an
    # estimate the notice never publishes.
    {
        "key": "price_band",
        "where": "band",
        "pool": lambda r: "R05" in txt(
            r, "rule_deviation_publishable_as_breach_codes"),
        "rank": lambda r: -(num(r, "contract_value_bdt") or 0),
        "mark": ("evidence_excerpt_price_band",
                 r"more thane\s*10%\s*above or below Estimated cost[^.]*"),
        "rule": {
            "en": "The signed contract whose notice carries a price-band "
                  "rejection clause and whose citation can be placed at or "
                  "before the tender's own event: the awarded tenders with "
                  "<code>R05</code> among their "
                  "<code>rule_deviation_publishable_as_breach_codes</code>, "
                  "ranked on contract value.",
            "bn": "যে স্বাক্ষরিত চুক্তির বিজ্ঞপ্তিতে দরসীমা-ভিত্তিক বাতিলের ধারা "
                  "আছে এবং উদ্ধৃত দস্তাবেজটিকে দরপত্রের নিজের ঘটনার সময়ে বা তার "
                  "আগে বসানো যায়, সেটি: যেসব চুক্তির "
                  "<code>rule_deviation_publishable_as_breach_codes</code>-এ "
                  "<code>R05</code> আছে, সেগুলোকে চুক্তিমূল্য অনুযায়ী সাজানো "
                  "হয়েছে।",
        },
    },
    # The last turn is the tender that met every one of the seven conditions we
    # test for in sequence. Seven at once is not proof of anything; it is the
    # place a reporter would start, and saying so is the point of the scene.
    {
        "key": "preselection",
        "where": "stack",
        "pool": lambda r: (txt(r, "potential_preselection_pattern")
                           == "STRONG_INVESTIGATIVE_LEAD"),
        "rank": lambda r: (-(num(r, "preselection_stage_count") or 0),
                           -(num(r, "contract_value_bdt") or 0)),
        "mark": ("evidence_excerpt_enlistment",
                 r"Enlisted\s*\(\s*Electrical\)\s*Contractor of RAjuk"
                 r"[\s\S]{0,90}?Firm"),
        "rule": {
            "en": "The signed contract that met the most of the seven conditions "
                  "we test in sequence. Ranked on "
                  "<code>preselection_stage_count</code>, then contract value, "
                  "over the awarded tenders whose "
                  "<code>potential_preselection_pattern</code> reads "
                  "<code>STRONG_INVESTIGATIVE_LEAD</code>.",
            "bn": "আমরা পরপর যে সাতটি শর্ত পরীক্ষা করি, তার সবচেয়ে বেশি পূরণ করেছে "
                  "যে স্বাক্ষরিত চুক্তি। যেসব চুক্তির "
                  "<code>potential_preselection_pattern</code>-এ "
                  "<code>STRONG_INVESTIGATIVE_LEAD</code> লেখা, সেগুলোকে "
                  "<code>preselection_stage_count</code> ও তারপর চুক্তিমূল্য "
                  "অনুযায়ী সাজিয়ে বাছাই করা হয়েছে।",
        },
    },
]


def build_cases():
    out = {}
    for spec in CASES:
        pool = [r for r in AWARDED if spec["pool"](r)]
        r = pick(pool, spec["rank"])
        if r is None:
            continue
        out[spec["key"]] = {**case_row(r, spec["mark"]),
                            "key": spec["key"], "where": spec["where"],
                            "rule": spec["rule"], "pool": len(pool)}
    return out


# ------------------------------------------------------------------- assembly

def build_timeline():
    """Notices by year published, contracts by year signed - so the reader can see
    that the corpus is not evenly spread and that 2025-26 is a different regime."""
    pub = collections.Counter()
    sign = collections.Counter()
    val = collections.Counter()
    thin = collections.Counter()
    for r in MASTER:
        p = iso(txt(r, "publication_date"))
        if p:
            pub[p[:4]] += 1
        s = iso(txt(r, "signing_date"))
        if s:
            sign[s[:4]] += 1
            val[s[:4]] += num(r, "contract_value_bdt") or 0
            if (num(r, "total_bids_received") or 99) <= 2:
                thin[s[:4]] += 1
    years = sorted(set(pub) | set(sign))
    return [{"year": y, "published": pub.get(y, 0), "signed": sign.get(y, 0),
             "crore": cr(val.get(y, 0)), "thin_field": thin.get(y, 0)}
            for y in years]


def build_portal():
    """What the portal says about its own deadline, tested against the two dates
    it prints beside the answer.

    Every award notice answers one question - was the contract signed in due
    time? - and prints the notice-of-award date and the signing date. The law's
    window depends on the size of the contract, so the answer is checkable from
    the notice alone. This block does the check and reports where the portal's
    own answer and its own dates disagree. It asserts nothing about why."""
    yes = [r for r in AWARDED
           if txt(r, "portal_self_certified_signed_in_due_time") == "yes"]
    no = [r for r in AWARDED
          if txt(r, "portal_self_certified_signed_in_due_time") == "no"]
    blank = [r for r in AWARDED
             if not txt(r, "portal_self_certified_signed_in_due_time")]

    # Rows where the field is answered and both dates are present, which is the
    # only population the test can run on.
    dated = [r for r in yes + no if num(r, "days_noa_to_signing") is not None]

    # What the answer tracks. If "yes" is exactly (days <= 28) with no exception,
    # the portal is not testing the window the contract's own size allows - it is
    # testing the longest window any contract can get.
    flat = [r for r in dated
            if (txt(r, "portal_self_certified_signed_in_due_time") == "yes")
            != ((num(r, "days_noa_to_signing") or 0) <= 28)]

    over = [r for r in yes if txt(r, "signing_within_legal_band").startswith("EXCEEDS")]
    caps = collections.Counter()
    days_over = []
    for r in over:
        cap, o = overrun_of(r)
        if cap:
            caps[cap] += 1
        if o is not None:
            days_over.append(o)
    return {
        "yes": len(yes), "no": len(no), "blank": len(blank),
        "answered": len(dated),
        "flat_test_exceptions": len(flat),
        "over_cap": len(over),
        "yes_within": len(yes) - len(over),
        "over_crore": cr(sum(num(r, "contract_value_bdt") or 0 for r in over)),
        "over_pct": pct(len(over), len(yes)),
        "over_14": caps.get(14, 0), "over_21": caps.get(21, 0),
        "over_28": caps.get(28, 0),
        "over_week": sum(1 for d in days_over if d > 7),
        "overrun": spread(days_over),
        "no_over_cap": sum(1 for r in no
                           if txt(r, "signing_within_legal_band").startswith("EXCEEDS")),
        "templates": tally(AWARDED, "award_template"),
    }


def main():
    C = build_corpus()
    winners, hhi, wtotal = build_winners()
    rules = build_rules()
    tenders, details = build_tenders()
    devs = build_deviations()
    docs = build_documents()
    total = len(MASTER)
    tv = C["total_value"]

    # rule bookkeeping, counted from the deviation table rather than restated
    dev_rows = [d for d in DEV if d["test_result"] == "DEVIATION"]
    per_tender = collections.Counter()
    for d in dev_rows:
        per_tender[d["tender_id"]] += 1
    dist = collections.Counter(per_tender.values())
    # The master already records, per tender, which deviations rest on a verbatim
    # mandatory clause and which rest on a recommended band. Use its own columns.
    mand = [r for r in MASTER if txt(r, "rule_deviation_mandatory_clause_codes")]
    band = [r for r in MASTER if txt(r, "rule_deviation_recommended_band_codes")]

    # eligibility disclosure: "publishes a threshold" means substantive text. Every
    # other state - data-sheet reference, portal refusal, blank - publishes none.
    substantive = [r for r in MASTER
                   if r["eligibility_published"] == "SUBSTANTIVE_TEXT_PUBLISHED"]
    no_criteria = [r for r in MASTER
                   if r["eligibility_published"] != "SUBSTANTIVE_TEXT_PUBLISHED"]

    # Ownership. The disclosure field only becomes operable in 2025 in this corpus,
    # so the raw blank count is not a finding. Split it on the date, as R01 does.
    own_yes = [r for r in AWARDED if txt(r, "beneficial_ownership_disclosed") == "yes"]
    own_no = [r for r in AWARDED if txt(r, "beneficial_ownership_disclosed") == "no"]
    r01 = [d for d in DEV if d["rule_code"] == "R01"]
    r01_dev = [d for d in r01 if d["test_result"] == "DEVIATION"]
    r01_ok = [d for d in r01 if d["test_result"] == "COMPLIANT"]
    r01_floor = [d for d in r01 if d["test_result"].startswith("NOT_APPLICABLE")]

    def signed_year(tid):
        s = iso(txt(BY_ID.get(tid, {}), "signing_date"))
        return int(s[:4]) if s else None

    live = [d for d in r01_dev if (signed_year(d["tender_id"]) or 0) >= 2025]
    live_ok = [d for d in r01_ok if (signed_year(d["tender_id"]) or 0) >= 2025]
    eo = [r for r in AWARDED if txt(r, "award_template") == "ECONOMIC_OPERATOR"]

    signing = collections.Counter()
    overrun = []
    for r in MASTER:
        s = txt(r, "signing_within_legal_band")
        m = re.match(r"EXCEEDS_(\d+)d_CAP_by_(\d+)d", s)
        if m:
            signing["over_%s" % m.group(1)] += 1
            overrun.append(int(m.group(2)))
        elif s.lower().startswith("within"):
            signing["within"] += 1

    # the ranking, and the eight biggest contracts the ranking under-weights
    ranked = sorted(
        [r for r in MASTER if num(r, "investigative_priority_score") is not None],
        key=lambda r: (-(num(r, "investigative_priority_score") or 0), r["tender_id"]))

    def card(r):
        return {
            "tender_id": r["tender_id"], "agency": r["agency"],
            "reference": txt(r, "tender_reference"),
            "package": txt(r, "package_description") or txt(r, "project_name"),
            "entity": txt(r, "procuring_entity"),
            "score": num(r, "investigative_priority_score"),
            "band": txt(r, "investigative_priority_band"),
            "components": txt(r, "priority_score_components"),
            "bids": num(r, "total_bids_received"),
            "responsive": num(r, "responsive_bids"),
            "value": num(r, "contract_value_bdt"),
            "crore": cr(num(r, "contract_value_bdt")),
            "winner": winner_of(r),
            "restriction": txt(r, "eligibility_restriction_level"),
            "deviations": num(r, "rule_deviation_count"),
            "codes": txt(r, "rule_deviation_codes"),
            "preselection": txt(r, "potential_preselection_pattern"),
            "stages": num(r, "preselection_stage_count"),
            "stages_met": txt(r, "preselection_stages_met"),
            "fact": txt(r, "documented_fact"),
            "hypothesis": txt(r, "investigative_hypothesis"),
            "next_step": txt(r, "journalist_next_step"),
            "gaps": txt(r, "data_gaps"),
            "notice": docref("notice", txt(r, "notice_source_file"), txt(r, "notice_pages")),
            "award": docref("award", txt(r, "award_source_file"), txt(r, "award_pages")),
        }

    biggest = sorted(AWARDED, key=lambda r: -(num(r, "contract_value_bdt") or 0))[:8]

    bars = {
        "turnover": spread([num(r, "turnover_to_contract_value_ratio") for r in MASTER]),
        "financial": spread([num(r, "financial_bar_to_contract_value_ratio") for r in MASTER]),
        "specific": spread([num(r, "similar_project_value_to_contract_value_ratio")
                            for r in MASTER]),
        "security": spread([num(r, "security_to_contract_value_ratio") for r in MASTER]),
        "years": spread([num(r, "minimum_years_experience") for r in MASTER]),
        "projects": spread([num(r, "minimum_similar_projects") for r in MASTER]),
    }
    fin = [num(r, "financial_bar_to_contract_value_ratio") for r in MASTER]
    fin = [x for x in fin if x is not None]
    sp = [x for x in (num(r, "similar_project_value_to_contract_value_ratio")
                      for r in MASTER) if x is not None]
    secr = [x for x in (num(r, "security_to_contract_value_ratio") for r in MASTER)
            if x is not None]
    bars["financial_above_1x"] = sum(1 for x in fin if x > 1)
    bars["financial_above_2x"] = sum(1 for x in fin if x > 2)
    bars["financial_above_5x"] = sum(1 for x in fin if x > 5)
    bars["specific_above_1x"] = sum(1 for x in sp if x > 1)
    bars["security_in_band"] = sum(1 for x in secr if 0.005 <= x <= 0.05)
    bars["security_in_band_pct"] = pct(bars["security_in_band"], len(secr))

    FLAG_LABEL = {
        "govt_client_experience_required": "Past work must have been for a government client",
        "licence_document_stack": "A stack of licences and certificates demanded together",
        "reputed_qualifier": "The word “reputed” used as a qualification",
        "electrical_licence_requirement": "A specific electrical licence required",
        "manufacturer_requirement": "Manufacturer authorisation required",
        "narrow_specification": "Specification narrow enough to fit few products",
        "pwd_authentication_requirement": "Certificates must be countersigned by PWD",
        "agency_enlistment_requirement": "Bidder must already be enlisted with the agency",
        "bank_document_window_requirement": "Bank papers valid only inside a narrow window",
        "dealer_requirement": "Sole agent or dealership required",
        "price_band_nonresponsive_clause": "A fixed price band decides responsiveness",
        "false_document_forfeiture_clause": "Security forfeited for a document held false",
        "brand_requirement": "A brand name appears in the requirement",
        "model_specific_requirement": "A specific model is named",
        "proprietary_specification": "Specification is proprietary to one product",
        "blanket_rejection_clause": "Blanket discretion to reject",
        "brand_without_or_equivalent": "A brand named with no “or equivalent”",
        "local_presence_requirement": "A local office or presence required",
        "egp_id_on_certificate_required": "The e-GP ID must appear on the certificate",
        "possible_specification_targeting": "Specification may point at one supplier",
        "iso_certification_requirement": "ISO certification required",
        "or_equivalent_present": "“Or equivalent” wording present",
        "mass_disqualification_flag": "Most of the field was ruled out",
        "many_bids_one_responsive_flag": "Many bids, one survivor",
        "incumbent_advantage_risk": "Conditions an existing supplier meets more easily",
        "repeated_rule_present": "A clause reused across other tenders",
    }
    flags = []
    for c in FLAGS:
        n = sum(1 for r in MASTER if yes(r, c) or (r.get(c) or "").strip() == c.upper())
        v = sum(num(r, "contract_value_bdt") or 0 for r in MASTER
                if (yes(r, c) or (r.get(c) or "").strip() == c.upper()))
        flags.append({"key": c, "label": FLAG_LABEL.get(c, c.replace("_", " ")),
                      "n": n, "pct": pct(n, total), "crore": cr(v)})
    flags.sort(key=lambda x: -x["n"])

    reuse_top = {}
    for r in MASTER:
        n = num(r, "number_of_tenders_using_rule")
        ex = txt(r, "repeated_rule_excerpt")
        if n and ex:
            key = re.sub(r"\s+", " ", ex)[:150]
            if key not in reuse_top or n > reuse_top[key]["n"]:
                reuse_top[key] = {"quote": key, "n": int(n), "agency": r["agency"],
                                  "tender_id": r["tender_id"]}
    reuse_list = sorted(reuse_top.values(), key=lambda x: -x["n"])[:12]

    src = []
    for name in ("master_tender_investigation.csv", "rule_deviations.csv",
                 "bidder_detail.csv", "investigative_summary.md"):
        p = os.path.join(SRC, name)
        if not os.path.exists(p):
            continue
        raw = open(p, "rb").read()
        rows = cols = None
        if name.endswith(".csv"):
            data = {"master_tender_investigation.csv": MASTER,
                    "rule_deviations.csv": DEV, "bidder_detail.csv": BID}[name]
            rows, cols = len(data), len(data[0])
        src.append({"name": name, "bytes": len(raw), "rows": rows, "cols": cols,
                    "sha256": hashlib.sha256(raw).hexdigest()[:16]})

    # What this layer changed on the way from the audited CSVs to the page, so a
    # reader diffing a name or a quote against a PDF knows what to expect.
    repairs = {
        "files_read": MENDED["files"],
        "cells_mended": MENDED["cells"],
        "unrecoverable_runs": MENDED["unrecoverable_runs"],
        "cells_with_unrecoverable_run": MENDED["cells_with_unrecoverable_run"],
        "firm_groups": len(NAME_OF),
        "firms_shown_as_printed": sum(1 for w in winners if w["name"] != w["key"]),
        "firm_groups_multi_spelling": sum(
            1 for k, v in _spellings.items() if len(set(tidy_name(x) for x in v)) > 1),
        "names_respaced": NORM["respaced"],
        "owner_roles_split": NORM["owner_role_split"],
    }

    # Where the folder and the document disagree about whose tender it is.
    #
    # The six authorities are the six folders the PDFs arrived in. Nine notices
    # carry an Agency line naming a different public body — an authority running
    # a package on another body's behalf, or a file filed under the wrong office.
    # Every scene on this site prints the document's own line, so each one
    # self-corrects, but the "six authorities" frame has to disclose this. The
    # organisation string is compared against the name that authority's own
    # notices use most; a string containing the authority's short form is a match,
    # which keeps four OCR-mangled RAJUK lines out of the count.
    own_name = {a["key"]: a["organization"] for a in C["agencies"]}
    other_body = []
    prov_blank = 0
    for r in MASTER:
        o = txt(r, "organization")
        if not o:
            prov_blank += 1
            continue
        k = r["agency"]
        if k in o or o == own_name.get(k):
            continue
        other_body.append({
            "tender_id": r["tender_id"], "agency": k, "organization": o,
            "district": txt(r, "pe_district"),
            "value": num(r, "contract_value_bdt"),
            "crore": cr(num(r, "contract_value_bdt")),
        })
    provenance = {
        "other_body_n": len(other_body),
        "other_body_awarded": sum(1 for x in other_body if x["value"]),
        "other_body_crore": cr(sum(x["value"] or 0 for x in other_body)),
        "other_body_agencies": len(set(x["agency"] for x in other_body)),
        "no_body_named": prov_blank,
        "rows": sorted(other_body, key=lambda x: -(x["value"] or 0)),
    }

    corpus = {
        "meta": {
            "built": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "byline": "AL AMIN TUSHER",
            "sources": src,
            "repairs": repairs,
            "rule_catalogue": {"rules": len(RULES),
                               "instrument_note": RC.INSTRUMENT_NOTE,
                               "quote_note": RC.QUOTE_REPRODUCTION_NOTE},
        },
        "counts": {
            "tenders": total, "columns": len(MASTER[0]),
            "awarded": len(AWARDED), "no_award_record": total - len(AWARDED),
            "with_bid_counts": len(WITHBIDS),
            "agencies": len(C["agencies"]),
            "pdfs": sum(len(v) for v in HAVE.values()),
            "notices": len(HAVE["notice"]), "awards": len(HAVE["award"]),
            "references": len(HAVE["reference"]),
            "deviation_rows": len(DEV), "bidder_rows": len(BID),
            "rules": len(RULES), "winners": len(winners),
            "portal_refused": sum(1 for r in MASTER if yes(r, "notice_access_denied")),
            "ocr_used": sum(1 for r in MASTER if yes(r, "ocr_used")),
        },
        "money": {
            "crore": cr(tv), "taka": round(tv, 2),
            "contracts": spread([num(r, "contract_value_bdt") for r in AWARDED]),
            "thin_field_crore": cr(C["thin_value"]),
            "thin_field_n": len(C["thin"]),
            "thin_field_share": pct(C["thin_value"], tv, 2),
            "biggest": [card(r) for r in biggest],
            "security": spread([num(r, "tender_security_bdt") for r in MASTER]),
        },
        "competition": C["comp"],
        "estimate": build_estimate(),
        "authority": build_authorities(),
        "provenance": provenance,
        "field": {
            "submitted": int(sum(x or 0 for x in C["bids"])),
            "responsive": int(sum(x or 0 for x in C["resp"])),
            "lost": int(sum(C["lost"])),
            "tenders_losing_bids": len(C["with_rejects"]),
            "single_responsive": len(C["single_resp"]),
            "single_responsive_pct": pct(len(C["single_resp"]), len(WITHBIDS)),
            "half_lost": len(C["half_lost"]),
            "mass_disqualified": sum(1 for r in MASTER if yes(r, "mass_disqualification_flag")),
            "many_one": sum(1 for r in MASTER if yes(r, "many_bids_one_responsive_flag")),
            "many_one_crore": cr(sum(num(r, "contract_value_bdt") or 0 for r in MASTER
                                     if yes(r, "many_bids_one_responsive_flag"))),
            "rejected_aggregate_rows": sum(
                1 for b in BID if b["record_type"] == "UNNAMED_REJECTED_BIDDERS_AGGREGATE"),
            "reasons_published": sum(
                1 for b in BID if b["record_type"] == "UNNAMED_REJECTED_BIDDERS_AGGREGATE"
                and txt(b, "rejection_reason")),
            "losers_named": sum(1 for b in BID
                                if b["record_type"] == "UNNAMED_REJECTED_BIDDERS_AGGREGATE"
                                and txt(b, "bidder_name")),
            "losing_amounts_published": sum(
                1 for b in BID if b["record_type"] == "UNNAMED_REJECTED_BIDDERS_AGGREGATE"
                and num(b, "bid_amount") is not None),
            "bids": spread(C["bids"]), "responsive_spread": spread(C["resp"]),
            "sold": spread([num(r, "documents_sold") for r in MASTER]),
        },
        "restriction": C["restriction"],
        "correlation": C["corr"],
        "agencies": C["agencies"],
        "eligibility": {
            "no_criteria": len(no_criteria),
            "no_criteria_pct": pct(len(no_criteria), total),
            "substantive": len(substantive),
            "substantive_pct": pct(len(substantive), total),
            "published_breakdown": tally(MASTER, "eligibility_published"),
            "levels": tally(MASTER, "eligibility_restriction_level"),
            "documents_demanded": spread([num(r, "required_document_types_count")
                                          for r in MASTER]),
            "enlistment": enlistment_shapes(),
        },
        "bars": bars,
        "flags": flags,
        "reuse": {
            "tenders": sum(1 for r in MASTER if yes(r, "repeated_rule_present")),
            "ten_or_more": sum(1 for r in MASTER
                               if (num(r, "number_of_tenders_using_rule") or 0) >= 10),
            "top": reuse_list,
        },
        "signing": {
            "within": signing.get("within", 0),
            "over_14": signing.get("over_14", 0), "over_21": signing.get("over_21", 0),
            "over_total": sum(v for k, v in signing.items() if k != "within"),
            "overrun": spread(overrun),
            "days": spread([num(r, "days_noa_to_signing") for r in AWARDED]),
        },
        "ownership": {
            "disclosed": len(own_yes), "not_disclosed": len(own_no),
            "no_award_record": total - len(AWARDED),
            "raw_undisclosed_above_floor": len(r01_dev),
            "below_floor": len(r01_floor),
            "signed_before_2025_undisclosed": len(
                [d for d in r01_dev if (signed_year(d["tender_id"]) or 9999) < 2025]),
            "live_window_total": len(live) + len(live_ok),
            "live_window_undisclosed": len(live),
            "live_window_disclosed": len(live_ok),
            "live_window_pct": pct(len(live), len(live) + len(live_ok)),
            "economic_operator_records": len(eo),
            "instrument_dated": "December 2025",
            "named_owners": sum(1 for b in BID
                                if b["record_type"] == "DISCLOSED_BENEFICIAL_OWNER_OF_WINNER"),
            "jv_partner_rows": sum(1 for b in BID
                                   if b["record_type"] == "JV_PARTNER_OF_WINNER"),
            "jv_awards": sum(1 for r in AWARDED if yes(r, "winner_is_joint_venture")),
            "jv_share_unpublished": sum(
                1 for b in BID if b["record_type"] == "JV_PARTNER_OF_WINNER"
                and (b.get("ownership_percentage") or "").startswith("NOT_PUBLISHED")),
        },
        "concentration": {
            "distinct_winners": len(winners), "hhi": hhi,
            "top1": winners[0] if winners else None,
            "top5_share": round(sum(w["share"] or 0 for w in winners[:5]), 2),
            "top10_share": round(sum(w["share"] or 0 for w in winners[:10]), 2),
            "top20_share": round(sum(w["share"] or 0 for w in winners[:20]), 2),
            "single_contract_winners": sum(1 for w in winners if w["contracts"] == 1),
            "repeat_flag": tally(MASTER, "repeated_winner_pattern"),
            "frequent": [w for w in sorted(winners, key=lambda x: -x["contracts"])[:14]],
        },
        "rules_summary": {
            "tested_rows": len(DEV), "deviation_rows": len(dev_rows),
            "tenders_with_any": len(per_tender),
            "tenders_with_none": total - len(per_tender),
            "mandatory_clause": len(mand), "recommended_band": len(band),
            "per_tender": [{"key": str(k), "n": v} for k, v in sorted(dist.items())],
            "results": tally(DEV, "test_result"),
            "force": tally(DEV, "clause_force"),
            "certainty": tally(DEV, "clause_certainty"),
            "deviation_certainty": [
                {"key": k, "n": v} for k, v in
                collections.Counter(d["clause_certainty"] for d in dev_rows).most_common()],
            "scope": tally(DEV, "instrument_scope_vs_this_tender"),
            "postdates_event": sum(1 for d in dev_rows
                                   if "POSTDATE" in d["instrument_timing_vs_this_tender"]),
            "plausibly_in_force": sum(1 for d in dev_rows
                                      if "PLAUSIBLY_IN_FORCE" in
                                      d["instrument_timing_vs_this_tender"]),
        },
        "violations": build_violations(),
        "preselection": {
            "breakdown": tally(MASTER, "potential_preselection_pattern"),
            "stages": [{"key": str(k), "n": v} for k, v in sorted(collections.Counter(
                int(num(r, "preselection_stage_count") or 0) for r in MASTER).items())],
            "strong": sum(1 for r in MASTER if txt(r, "potential_preselection_pattern")
                          == "STRONG_INVESTIGATIVE_LEAD"),
        },
        "priority": {
            "bands": tally(MASTER, "investigative_priority_band"),
            "spread": spread([num(r, "investigative_priority_score") for r in MASTER]),
            "top": [card(r) for r in ranked[:20]],
        },
        "status": tally(MASTER, "tender_status", 12),
        "nature": tally(MASTER, "procurement_nature"),
        "timeline": build_timeline(),
        "portal": build_portal(),
        "districts": tally([r for r in MASTER if txt(r, "pe_district")], "pe_district"),
        "exhibits": build_exhibits(),
        "case": build_case(),
        "cases": build_cases(),
        "qa": {
            "corrections": CORRECTIONS,
            "notes": [
                {"kind": "not reproducible",
                 "what": "The analyst's summary reports r = +0.130 for restriction "
                         "against bid count. That figure does not reproduce from the "
                         "three CSVs shipped here under any population this build could "
                         "construct.",
                 "instead": "The site prints the reproducible pair instead: on the "
                            "tenders that both publish criteria and have a bid count, "
                            "restriction score against bid count is r = "
                            + str((C["corr"]["score_vs_bids_276"] or {}).get("r"))
                            + " over n = "
                            + str((C["corr"]["score_vs_bids_276"] or {}).get("n"))
                            + ". The direction is the same, and it is the direction that "
                              "contradicts the tailoring theory."},
                {"kind": "figure moved by a correction",
                 "what": "The summary's prose says 150 notices set a financial bar above "
                         "contract value, 52 above twice and 5 above five times.",
                 "instead": "Those counts predate the liquid-asset correction recorded "
                            "below. Recomputed on the corrected column the figures are "
                            + str(bars["financial_above_1x"]) + ", "
                            + str(bars["financial_above_2x"]) + " and "
                            + str(bars["financial_above_5x"]) + ", and R07 falls to "
                            + str(next((x["deviations"] for x in rules
                                        if x["code"] == "R07"), 0)) + " deviations, "
                              "exactly as the correction script predicted."},
            ],
            "extraction_confidence": tally(MASTER, "extraction_confidence"),
            "price_anomaly": tally(MASTER, "price_anomaly_flag"),
            "retendered": sum(1 for r in MASTER if txt(r, "retender_flag")
                              and txt(r, "retender_flag").lower() != "no"),
            "gaps": [{"key": k, "n": v} for k, v in collections.Counter(
                g.strip() for r in MASTER for g in re.split(r"[;|]", txt(r, "data_gaps"))
                if g.strip()).most_common(14)],
        },
    }

    payloads = {
        "corpus.json": corpus, "tenders.json": tenders, "rules.json": rules,
        "deviations.json": devs, "winners.json": winners,
        "bidders.json": build_bidders(), "documents.json": docs,
        "doctext.json": build_search_text(), "details.json": details,
    }
    os.makedirs(OUT, exist_ok=True)
    for name, obj in payloads.items():
        p = os.path.join(OUT, name)
        with open(p, "w", encoding="utf-8") as fh:
            json.dump(obj, fh, ensure_ascii=False, separators=(",", ":"))
        print("  wrote %-16s %8.1f KB" % (name, os.path.getsize(p) / 1024))
    return corpus


if __name__ == "__main__":
    c = main()
    print("\n%d tenders, %d awarded, Tk %s crore, %d PDFs, %d rules, %d deviations"
          % (c["counts"]["tenders"], c["counts"]["awarded"], c["money"]["crore"],
             c["counts"]["pdfs"], c["counts"]["rules"],
             c["rules_summary"]["deviation_rows"]))
