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
                                "before": before, "after": fix[col],
                                "quote": fix["quote"], "agency": r["agency"]})
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
    total_value = sum(num(r, "contract_value_bdt") or 0 for r in AWARDED)
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
            "quote": quote, "column": spec["column"],
            "page": txt(r, "eligibility_page") or "1",
            "notice": docref("notice", txt(r, "notice_source_file"), txt(r, "notice_pages")),
            "award": docref("award", txt(r, "award_source_file"), txt(r, "award_pages")),
            "bids": num(r, "total_bids_received"), "responsive": num(r, "responsive_bids"),
            "value": num(r, "contract_value_bdt"), "winner": winner_of(r),
            "score": num(r, "investigative_priority_score"),
        })
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
        "districts": tally([r for r in MASTER if txt(r, "pe_district")], "pe_district", 12),
        "exhibits": build_exhibits(),
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
