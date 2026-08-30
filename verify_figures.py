#!/usr/bin/env python3
"""Recompute every published figure from the raw sources and diff it.

The pages claim that each number is reproducible from the repository. This is that
claim, executable. It reads the sources on their own terms — importing nothing from
the scripts that produced the aggregates — and compares the result with the two
places a reader sees numbers:

  * article_data.json          — everything the charts and tables render
  * the OFF block in story.html — the hand-checked officer-level constants

There are two sources, because two columns of the register cannot be trusted and
the article says so:

  Procurement_Database.json   the register as scraped. Everything except the two
                              cases below is recomputed from it.
  pdf_derived.json            what verify_pdfs.py read out of the 1,800 government
                              PDFs. It supplies (a) the tender document price, whose
                              register column holds an unrelated number, and (b) the
                              full procuring-entity names, because the register cuts
                              that column at about 40 characters and the cut merges
                              two different circles into one office. Both corruptions
                              are asserted below, so a later "fix" that quietly
                              reverts to the register fails this script instead of
                              passing it.

    python3 verify_figures.py            # full report
    python3 verify_figures.py --quiet    # only the disagreements

Exit status is 0 when every check agrees, 1 otherwise, so it can gate a commit.

Two normalisations are used, and they are the ones the article's method note
documents:
  supplier names  — upper-cased, "&" expanded to "AND", the "M/S" prefix and the
                    "LTD / LIMITED / PVT / PRIVATE" suffixes dropped, punctuation
                    stripped, so "Daffodil Electric Company" and "DAFFODIL ELECTRIC
                    COMPANY LIMITED" are one firm (310 names as filed -> 308 firms)
  officer names   — lowercased, punctuation dropped, whitespace collapsed, so
                    "Md. Anwar Hossain" and "Md Anwar Hossain" are one official
                    (79 spellings as filed -> 73 officials)
"""

import argparse
import datetime
import io
import json
import os
import re
import statistics
import sys
from collections import Counter, defaultdict

DB = "Procurement_Database.json"
DATA = "article_data.json"
STORY = "story.html"
PDFX = "pdf_derived.json"
MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]


def die(msg):
    sys.stderr.write("verify_figures: %s\n" % msg)
    raise SystemExit(1)


def load(path):
    if not os.path.exists(path):
        die("%s not found — run this from the repository root." % path)
    return json.load(io.open(path, encoding="utf-8"))


def num(v):
    """The register exports numbers as strings, blanks and the occasional '1,024'."""
    if v is None:
        return None
    s = str(v).strip().replace(",", "")
    if not s:
        return None
    return float(s) if re.match(r"^-?\d+(\.\d+)?$", s) else None


def as_int(v):
    n = num(v)
    return None if n is None else int(n)


def date(v):
    """Two formats appear in the same column: 2026-06-25 00:00 and 25-Jun-2026."""
    s = str(v or "").strip()
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        y, mo, d = (int(g) for g in m.groups())
    else:
        m = re.match(r"^(\d{1,2})-([A-Za-z]{3})-(\d{4})", s)
        if not m:
            return None
        d, mo, y = int(m.group(1)), MONTHS.index(m.group(2).lower()[:3]) + 1, int(m.group(3))
    try:
        return datetime.date(y, mo, d)
    except ValueError:
        return None


def firm(s):
    """The de-duplication the method note describes, applied literally."""
    t = (s or "").upper().replace("&", " AND ")
    t = re.sub(r"\bM/S\.?\b", " ", t)
    t = re.sub(r"[^A-Z0-9ঀ-৿ ]+", " ", t)
    t = re.sub(r"\b(LTD|LIMITED|PVT|PRIVATE)\b", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def person(s):
    t = re.sub(r"[^a-z0-9ঀ-৿ ]+", " ", (s or "").lower())
    return re.sub(r"\s+", " ", t).strip()


class Report(object):
    """Collects one row per figure: recomputed value beside published value."""

    def __init__(self):
        self.rows = []

    def chk(self, label, mine, published):
        if published is None:
            return
        if isinstance(mine, float) or isinstance(published, float):
            ok = abs(float(mine) - float(published)) < 0.051
        else:
            ok = mine == published
        self.rows.append((ok, label, mine, published))

    def show(self, quiet=False):
        bad = [r for r in self.rows if not r[0]]
        for ok, label, mine, pub in self.rows:
            if quiet and ok:
                continue
            print("%s  %-44s recomputed %-16s published %s"
                  % ("PASS" if ok else "DIFF", label, mine, pub))
        print("\n%d checks, %d disagreement%s"
              % (len(self.rows), len(bad), "" if len(bad) == 1 else "s"))
        return 0 if not bad else 1


def off_block(html):
    """Pull the hand-checked constants out of story.html's OFF literal.

    They are written there rather than in article_data.json because they involve
    the two name normalisations above; this reads them back out so the numbers a
    reader sees on the page are the numbers being checked.
    """
    m = re.search(r"var OFF=\{(.*?)\n\};", html, re.S)
    if not m:
        die("could not find the OFF block in %s — update this script." % STORY)
    body = m.group(1)

    def one(path):
        pat = r"\b%s\s*:\s*(-?\d+(?:\.\d+)?)" % path[-1]
        if len(path) > 1:
            pat = r"\b%s\s*:\s*\{[^}]*?" % path[0] + pat
        hit = re.search(pat, body, re.S)
        if not hit:
            return None
        raw = hit.group(1)
        return float(raw) if "." in raw else int(raw)

    return {
        "n_officers": one(["n_officers"]),
        "n_units": one(["n_units"]),
        "n_suppliers_dedup": one(["n_suppliers_dedup"]),
        "strict_n": one(["strict", "n"]),
        "strict_base": one(["strict", "base"]),
        "strict_pct": one(["strict", "pct"]),
        "pairs_pe_ge2": one(["pairs_pe", "ge2"]),
        "pairs_pe_ge3": one(["pairs_pe", "ge3"]),
        "pairs_of_ge2": one(["pairs_of", "ge2"]),
        "pairs_of_ge3": one(["pairs_of", "ge3"]),
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("-q", "--quiet", action="store_true", help="print only disagreements")
    args = ap.parse_args()

    db = load(DB)
    A = load(DATA)
    P = load(PDFX)
    OFF = off_block(io.open(STORY, encoding="utf-8").read())
    R = Report()

    rows = [{
        "id": str(r.get("Tender_Proposal_ID") or "").strip(),
        "val": num(r.get("Contract_Value_BDT")),
        "org": (r.get("Organization_Agency") or "").strip(),
        "pe": (r.get("Procuring_Entity_Name") or "").strip(),
        "sup": (r.get("Supplier_Name") or "").strip(),
        "off": (r.get("Authorised_Officer") or "").strip(),
        "sold": as_int(r.get("Tenders_Sold")),
        "recv": as_int(r.get("Tenders_Received")),
        "resp": as_int(r.get("Responsive_Tenders")),
        "noa": date(r.get("Notification_of_Award_Date")),
        "sign": date(r.get("Contract_Signing_Date")),
        "docp": num(r.get("Document_Price_BDT")),
        "secvalid": date(r.get("Security_Valid_Up_To")),
    } for r in db]
    aw = [r for r in rows if r["val"] and r["val"] > 0]

    # The award notices, keyed on tender id. These carry the full procuring-entity
    # name; the register's copy of it is cut short (see the assertions below).
    pdf = {r["id"]: r for r in P["award_rows"]}
    pdf_aw = [r for r in P["award_rows"] if r["value"]]

    # ---- scale -------------------------------------------------------------
    h = A["headline"]
    R.chk("rows in the register file", len(rows), h["tender_rows"])
    R.chk("of those, rows carrying a tender", len([r for r in rows if r["id"]]), h["tenders"])
    R.chk("  duplicate tender ids", len([r for r in rows if r["id"]])
          - len({r["id"] for r in rows if r["id"]}), 0)
    R.chk("awarded contracts", len(aw), h["awarded"])
    R.chk("total award value (crore)", round(sum(r["val"] for r in aw) / 1e7, 1), h["value_crore"])
    R.chk("contractor names as filed", len({r["sup"] for r in aw if r["sup"]}), h["suppliers"])
    R.chk("contractors, name variants merged",
          len({firm(r["sup"]) for r in aw if r["sup"]}), OFF["n_suppliers_dedup"])
    R.chk("authorising officers", len({person(r["off"]) for r in aw if r["off"]}), OFF["n_officers"])
    R.chk("organisational units", len({r["org"] for r in aw if r["org"]}), OFF["n_units"])

    # ---- competition -------------------------------------------------------
    withbid = [r for r in aw if r["resp"] is not None]
    single = [r for r in withbid if r["resp"] == 1]
    contested = [r for r in single if (r["recv"] or 0) > 1 or (r["sold"] or 0) > 1]
    R.chk("awards with a responsive-bid count", len(withbid), h["with_bid_data"])
    R.chk("one responsive bid", len(single), h["single_resp"])
    R.chk("one-responsive share (%)", round(100.0 * len(single) / len(withbid), 1),
          h["single_resp_pct"])
    R.chk("contested yet single-responsive", len(contested), OFF["strict_n"])
    R.chk("  its base", len(withbid), OFF["strict_base"])
    R.chk("  its share (%)", round(100.0 * len(contested) / len(withbid), 1), OFF["strict_pct"])
    R.chk("3+ bids received, then 1 responsive",
          len([r for r in single if (r["recv"] or 0) >= 3]), A["elimination"]["n"])
    R.chk("5+ bids received, then 1 responsive",
          len([r for r in single if (r["recv"] or 0) >= 5]), A["elimination"]["n5"])

    # ---- concentration -----------------------------------------------------
    by_sup = defaultdict(float)
    for r in aw:
        if r["sup"]:
            by_sup[r["sup"]] += r["val"]
    total = sum(by_sup.values())
    rank = sorted(by_sup.items(), key=lambda kv: -kv[1])
    con = A["concentration"]
    R.chk("largest contractor share (%)", round(100.0 * rank[0][1] / total, 1), con["top1_pct"])
    R.chk("top 4 share (%)", round(100.0 * sum(v for _, v in rank[:4]) / total, 1), con["top4_pct"])
    R.chk("top 10 share (%)", round(100.0 * sum(v for _, v in rank[:10]) / total, 1), con["top10_pct"])
    R.chk("HHI", round(sum((100.0 * v / total) ** 2 for _, v in rank), 1), con["hhi"])
    R.chk("largest contractor total (crore)", round(rank[0][1] / 1e7, 2), A["anchor"]["total_crore"])
    R.chk("largest contractor", rank[0][0], A["anchor"]["supplier"])

    # ---- the signing calendar ----------------------------------------------
    lags = [(r["sign"] - r["noa"]).days for r in aw if r["noa"] and r["sign"]]
    lags = [d for d in lags if d >= 0]
    at28 = Counter(lags)[28]
    dl, cl = A["delay"], A["cliff"]
    R.chk("signing lags measured", len(lags), dl["n"])
    R.chk("median signing lag (days)", int(statistics.median(lags)), dl["median"])
    R.chk("signed on day 28", at28, cl["at28"])
    R.chk("day-28 share (%)", round(100.0 * at28 / len(lags), 1), cl["at28_pct"])
    R.chk("signed after day 28", len([d for d in lags if d > 28]), dl["over28"])
    R.chk("longest lag (days)", max(lags), dl["max"])
    R.chk("days 29-37 carrying any signing", len([d for d in lags if 29 <= d <= 37]), cl["void_n"])
    R.chk("signed in the day 24-28 window", len([d for d in lags if 24 <= d <= 28]), cl["win24_28"])

    # the cliff, deduplicated: one office signing one contractor on one day counts once
    ev = {(r["noa"], r["sign"], r["pe"], r["sup"]) for r in aw if r["noa"] and r["sign"]}
    ev28 = {k for k in ev if (k[1] - k[0]).days == 28}
    rb = cl["robust"]
    R.chk("distinct signing events", len(ev), rb["events"])
    R.chk("day-28 events", len(ev28), rb["at28_events"])
    R.chk("offices signing on day 28", len({k[2] for k in ev28}), rb["at28_offices"])
    R.chk("contractors signing on day 28", len({k[3] for k in ev28}), rb["at28_suppliers"])

    # ---- repeat pairs ------------------------------------------------------
    # The office side is counted on the award notices' full procuring-entity names.
    # Counted on the register's truncated column instead, two circles of the same
    # engineering wing collapse into one 76-award office and a third office splits
    # in two, which moves the top pairing from 15 to 14 and ge2 from 99 to 98.
    def repeats(records, keyfn, supfn):
        c = Counter()
        for r in records:
            k, s = keyfn(r), firm(supfn(r))
            if k and s:
                c[(k, s)] += 1
        d = Counter(c.values())
        return (sum(v for n, v in d.items() if n >= 2),
                sum(v for n, v in d.items() if n >= 3),
                max(c.values()))
    pe2, pe3, pemax = repeats(pdf_aw, lambda r: r["pe"], lambda r: r["sup"])
    of2, of3, _ = repeats(aw, lambda r: person(r["off"]), lambda r: r["sup"])
    R.chk("office-contractor pairs seen 2+ times", pe2, OFF["pairs_pe_ge2"])
    R.chk("office-contractor pairs seen 3+ times", pe3, OFF["pairs_pe_ge3"])
    R.chk("largest office-contractor pair", pemax, max(p["n"] for p in A["repeat_pairs"]))
    R.chk("officer-contractor pairs seen 2+ times", of2, OFF["pairs_of_ge2"])
    R.chk("officer-contractor pairs seen 3+ times", of3, OFF["pairs_of_ge3"])

    # every published pairing row, recomputed from the notices
    byoff = defaultdict(list)
    for r in pdf_aw:
        if r["pe"] and r["sup"]:
            byoff[(r["pe"], firm(r["sup"]))].append(r)

    def pairkey(pe, label):
        """Find the group a published pairing row was computed from.

        Grouping is keyed on the contractor string as filed. On joint ventures the
        portal appends the partners and their percentage shares, which is provenance
        rather than the firm's name, so the published label drops that tail — making
        it a prefix of the key. Stripping the tail before grouping instead would
        merge three JVs into other entries and move ge2 from 99 to 100, so the key
        keeps the whole string and the label is matched back onto it here.
        """
        k = firm(label)
        if (pe, k) in byoff:
            return (pe, k)
        hits = [key for key in byoff if key[0] == pe and key[1].startswith(k)]
        return hits[0] if len(hits) == 1 else None

    bad_pairs = bad_pair_val = 0
    for p in A["repeat_pairs"]:
        got = byoff.get(pairkey(p["pe"], p["supplier"]) or ("", ""))
        if not got or len(got) != p["n"]:
            bad_pairs += 1
        elif abs(round(sum(x["value"] for x in got) / 1e7, 2) - p["crore"]) > 0.011:
            bad_pair_val += 1
    R.chk("  published pairing rows whose count is wrong", bad_pairs, 0)
    R.chk("  published pairing rows whose value is wrong", bad_pair_val, 0)

    # ---- office-level concentration, also grouped on the notices' names ----
    pe_rows = defaultdict(list)
    for r in pdf_aw:
        if r["pe"]:
            pe_rows[r["pe"]].append(r)
    bad_cap = 0
    for c in A["pe_capture"]:
        got = pe_rows.get(c["pe"]) or []
        top = Counter(firm(x["sup"]) for x in got if x["sup"])
        n = top.most_common(1)[0][1] if top else 0
        if len(got) != c["total"] or n != c["n"] \
                or abs(round(100.0 * n / max(len(got), 1), 1) - c["pct"]) > 0.051:
            bad_cap += 1
    R.chk("offices in the capture table", len(A["pe_capture"]),
          len([1 for pe, rs in pe_rows.items() if len(rs) >= 12]))
    R.chk("  of those, rows that do not recompute", bad_cap, 0)

    M = A["matrix"]
    R.chk("offices in the office x contractor matrix", len(M["rows"]),
          len([1 for pe, rs in pe_rows.items() if len(rs) >= 20]))
    bad_cell = 0
    for row in M["grid"]:
        got = pe_rows.get(row["pe"]) or []
        if len(got) != row["pe_total"]:
            bad_cell += 1
            continue
        for cell, col in zip(row["cells"], M["cols"]):
            hit = [x for x in got if firm(x["sup"]) == firm(col["sup"])]
            if len(hit) != cell["n"] \
                    or abs(round(sum(x["value"] for x in hit) / 1e7, 2) - cell["crore"]) > 0.011:
                bad_cell += 1
    R.chk("  of those, cells that do not recompute", bad_cell, 0)
    R.chk("  largest cell", max(c["n"] for row in M["grid"] for c in row["cells"]), M["max"])

    # ---- document prices, read off the notice PDFs -------------------------
    prices = sorted(P["doc_price"]["by_tender"].values())
    dp = A["docprice"]
    mode, mode_n = Counter(prices).most_common(1)[0]
    R.chk("document prices present", len(prices), dp["n"])
    R.chk("cheapest document price", float(min(prices)), dp["min"])
    R.chk("median document price", float(statistics.median(prices)), dp["median"])
    R.chk("mean document price", round(statistics.fmean(prices), 1), dp["mean"])
    R.chk("highest document price", float(max(prices)), dp["max"])
    R.chk("commonest document price", float(mode), dp["mode"])
    R.chk("  tenders at that price", mode_n, dp["mode_n"])
    R.chk("distinct document prices", len(set(prices)), dp["distinct"])
    R.chk("tenders at or above 4,000", len([p for p in prices if p >= 4000]), dp.get("ge4k"))
    R.chk("tenders free of charge", len([p for p in prices if p == 0]), 0)
    hist = dp.get("hist") or []
    if hist:
        band = [len([p for p in prices if p <= 1000]),
                len([p for p in prices if 1000 < p <= 2000]),
                len([p for p in prices if 2000 < p <= 5000]),
                len([p for p in prices if 5000 < p <= 10000]),
                len([p for p in prices if p > 10000])]
        R.chk("  price bands sum to the same total", sum(band), len(prices))
        for i, b in enumerate(band):
            R.chk("  band %d of the price histogram" % (i + 1), b,
                  hist[i].get("n") if isinstance(hist[i], dict) else hist[i])

    # ---- the two columns the register gets wrong, asserted -----------------
    # These are not figures; they are the reasons two blocks above read from the
    # PDFs. If the register is ever repaired these checks fail, which is the
    # signal to move those blocks back — not something to silence.
    agree = dom = odd = nodate = 0
    for r in rows:
        want = P["doc_price"]["by_tender"].get(r["id"])
        if want is None or r["docp"] is None:
            continue
        agree += abs(r["docp"] - want) < 0.5
        if not r["secvalid"]:
            nodate += 1
        elif r["docp"] == r["secvalid"].day:
            dom += 1
        else:
            odd += 1
    R.chk("Document_Price_BDT values matching the notice", agree, 1)
    R.chk("  ... equal instead to the day of Security_Valid_Up_To", dom, 1101)
    R.chk("  ... with a security date, equal to neither", odd, 1)
    R.chk("  ... with no security date to compare against", nodate, 26)
    tc = P["truncation"]["columns"]
    R.chk("register rows whose office name is cut short",
          tc["Procuring_Entity_Name"]["rows_differing"], 271)
    R.chk("  truncated office names covering more than one office",
          len(tc["Procuring_Entity_Name"]["keys_covering_more_than_one_name"]), 2)
    R.chk("register rows whose contractor name is cut short",
          tc["Supplier_Name"]["rows_differing"], 49)
    R.chk("  truncated contractor names covering more than one firm",
          len(tc["Supplier_Name"]["keys_covering_more_than_one_name"]), 0)
    R.chk("register rows whose officer name is cut short",
          tc["Authorised_Officer"]["rows_differing"], 0)

    # ---- PDF coverage the page cites ---------------------------------------
    cov, ec = P["coverage"], A["evidence_counts"]
    notices = cov["notice_pdfs_read"] + len(cov["withheld"])
    R.chk("tender-notice PDFs archived", notices, ec["notice"])
    R.chk("  of those, PDFs the portal would not serve", len(cov["withheld"]), 6)
    R.chk("contract-award PDFs read", cov["award_pdfs_read"], ec["award"])
    R.chk("source documents in total", notices + cov["award_pdfs_read"], h["pdfs"])
    R.chk("register rows with no tender behind them", len(cov["empty_rows"]),
          h["tender_rows"] - h["tenders"])
    R.chk("awards on the older template that prints bid counts",
          P["award_template"]["supplier"], OFF["strict_base"])
    R.chk("awards on the newer template that prints none",
          P["award_template"]["economic-operator"], h["awarded"] - h["with_bid_data"])

    # ---- the evidence room reproduces the same rows ------------------------
    cases = A.get("cases") or []
    R.chk("case rows behind the evidence room", len(cases), h["awarded"])
    R.chk("  of those, one responsive bid", len([c for c in cases if c.get("resp") == 1]),
          h["single_resp"])
    R.chk("  of those, contested yet single",
          len([c for c in cases if c.get("resp") == 1
               and ((c.get("recv") or 0) > 1 or (c.get("sold") or 0) > 1)]), OFF["strict_n"])

    raise SystemExit(R.show(args.quiet))


if __name__ == "__main__":
    main()

