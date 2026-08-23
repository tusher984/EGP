#!/usr/bin/env python3
"""Recompute every published figure from the raw register and diff it.

The pages claim that each number is reproducible from the repository. This is that
claim, executable. It reads Procurement_Database.json on its own terms — importing
nothing from the scripts that produced the aggregates — and compares the result
with the two places a reader sees numbers:

  * article_data.json          — everything the charts and tables render
  * the OFF block in story.html — the hand-checked officer-level constants

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
    } for r in db]
    aw = [r for r in rows if r["val"] and r["val"] > 0]

    # ---- scale -------------------------------------------------------------
    h = A["headline"]
    R.chk("tender records", len(rows), h["tenders"])
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
    def repeats(keyfn):
        c = Counter()
        for r in aw:
            k, s = keyfn(r), firm(r["sup"])
            if k and s:
                c[(k, s)] += 1
        d = Counter(c.values())
        return (sum(v for n, v in d.items() if n >= 2),
                sum(v for n, v in d.items() if n >= 3),
                max(c.values()))
    pe2, pe3, pemax = repeats(lambda r: r["pe"])
    of2, of3, _ = repeats(lambda r: person(r["off"]))
    R.chk("office-contractor pairs seen 2+ times", pe2, OFF["pairs_pe_ge2"])
    R.chk("office-contractor pairs seen 3+ times", pe3, OFF["pairs_pe_ge3"])
    R.chk("largest office-contractor pair", pemax, max(p["n"] for p in A["repeat_pairs"]))
    R.chk("officer-contractor pairs seen 2+ times", of2, OFF["pairs_of_ge2"])
    R.chk("officer-contractor pairs seen 3+ times", of3, OFF["pairs_of_ge3"])

    # ---- document prices ---------------------------------------------------
    docp = [r["docp"] for r in rows if r["docp"] is not None]
    dp = A["docprice"]
    R.chk("document prices present", len(docp), dp["n"])
    R.chk("median document price", float(statistics.median(docp)), dp["median"])
    R.chk("highest document price", float(max(docp)), dp["max"])

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

