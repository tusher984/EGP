#!/usr/bin/env python3
"""Restore the names the register truncated, and recompute what was grouped on them.

The scrape behind Procurement_Database.json stores several text columns cut to
about 40 characters. The government's own award notices carry the whole string,
so pdf_derived.json — written by verify_pdfs.py straight out of the PDFs — is the
repair source. Two kinds of damage, needing different fixes:

  display    271 procuring-entity names, 49 contractor names, 7 agency names and
             3 designations reach the page cut mid-word. Substituting the PDF's
             string changes no number, only what the reader sees.

  grouping   two truncated procuring-entity values each stand for more than one
             real office — "Office of the Superintending Engineer" is both the
             Electrical (58 awards) and the Mechanical (18) circle, and "Office
             of the Executive Engineer, LGED," is four districts — while one
             office, the Chief Engineer (Project & Design), is stored both ways,
             so its 53 awards split 52/1. Any figure grouped on that column
             therefore merges offices that are not the same office and splits one
             that is. Those figures have to be recomputed, not relabelled.

Idempotent: everything is keyed on tender id, so a second run is a no-op.

    python3 repair_names.py             # patch article_data.json in place
    python3 repair_names.py --dry-run   # report what would change, write nothing
"""

import argparse
import collections
import json
import re

ART = "article_data.json"
DERIVED = "pdf_derived.json"
PE_CAPTURE_MIN = 12   # offices with at least this many awards enter §07's table
MATRIX_ROW_MIN = 20   # ... and this many enter the office x contractor matrix
MATRIX_COLS = 11
PAIR_ROWS = 20
PAIR_IDS = 6


def firm(s):
    """The contractor de-duplication the method note describes, applied literally."""
    t = (s or "").upper().replace("&", " AND ")
    t = re.sub(r"\bM/S\.?\b", " ", t)
    t = re.sub(r"[^A-Z0-9ঀ-৿ ]+", " ", t)
    t = re.sub(r"\b(LTD|LIMITED|PVT|PRIVATE)\b", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def label(names):
    """The fullest spelling on record, which after the repair is the PDF's."""
    return max(sorted(set(clean(n) for n in names)), key=len)


def clean(s):
    """The name as a name. On joint ventures the portal appends the partners and
    their percentage shares; that is provenance, not what the firm is called, and
    it is where the register's 60-character cut lands — which is why a dozen
    contractors reach the page ending mid-percentage."""
    return re.split(r"\s*\(\s*JVCA\s+Partners", (s or "").strip())[0].strip()


def crore(v):
    return round(v / 1e7, 2)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("-n", "--dry-run", action="store_true",
                    help="report the changes, write nothing")
    args = ap.parse_args()

    A = json.load(open(ART, encoding="utf-8"))
    P = json.load(open(DERIVED, encoding="utf-8"))
    rows = P["award_rows"]
    by_id = {r["id"]: r for r in rows}
    valued = [r for r in rows if r["value"]]
    changed = []

    # ---- 1. display-only: names carried per tender id ----------------------
    fixed = collections.Counter()
    for case in A.get("cases") or []:
        r = by_id.get(str(case.get("id")))
        if not r:
            continue
        for k, src in (("pe", "pe"), ("sup", "sup")):
            want = clean(r[src])
            if want and case.get(k) and case[k] != want:
                case[k] = want
                fixed[k] += 1
    for case in (A.get("elimination") or {}).get("cases") or []:
        r = by_id.get(str(case.get("id")))
        want = clean(r["sup"]) if r else ""
        if want and case.get("sup") and case["sup"] != want:
            case["sup"] = want
            fixed["elimination.sup"] += 1
    if fixed:
        changed.append("restored %s truncated names in the per-tender tables"
                       % ", ".join("%d %s" % (v, k) for k, v in fixed.items()))

    # A contractor's name is never truncated into another contractor's, so the
    # aggregate contractor tables only need their label swapped for the full one.
    # The published label is a spelling as filed, so it is matched on whichever
    # side is the prefix — the register's cut string, or the PDF's cleaned name.
    spelt = sorted({clean(r["sup"]) for r in valued if r["sup"]}, key=len,
                   reverse=True)

    def full(name):
        name = (name or "").strip()
        hits = [s for s in spelt if s == name or s.startswith(name)
                or name.startswith(s)]
        return hits[0] if len(set(hits)) == 1 or (hits and hits[0] == name) else None

    relabel = 0
    for block, key in (("top_suppliers", "name"), ("top_by_value", "name")):
        for e in A.get(block) or []:
            got = full(e.get(key, ""))
            if got and got != e[key]:
                e[key] = got
                relabel += 1
    for e in (A.get("concentration") or {}).get("treemap") or []:
        for key in ("name", "sup", "label"):
            if isinstance(e.get(key), str):
                got = full(e[key])
                if got and got != e[key]:
                    e[key] = got
                    relabel += 1
    anc = A.get("anchor") or {}
    got = full(anc.get("supplier", ""))
    if got and got != anc.get("supplier"):
        anc["supplier"] = got
        relabel += 1
    if relabel:
        changed.append("relabelled %d contractor names in the aggregate tables"
                       % relabel)

    # ---- 2. recomputed: everything grouped on the office name --------------
    pairs = collections.defaultdict(list)
    for r in valued:
        if r["sup"] and r["pe"]:
            pairs[(firm(r["sup"]), r["pe"])].append(r)

    rp = []
    for (_, pe), rs in pairs.items():
        if len(rs) < 2:
            continue
        rp.append({
            "pe": pe,
            "supplier": label([x["sup"] for x in rs]),
            "n": len(rs),
            "crore": crore(sum(x["value"] for x in rs)),
            "ids": [x["id"] for x in sorted(rs, key=lambda x: -x["value"])][:PAIR_IDS],
        })
    rp.sort(key=lambda p: (-p["n"], -p["crore"]))
    was = A.get("repeat_pairs") or []
    A["repeat_pairs"] = rp[:PAIR_ROWS]
    if was[:1] != A["repeat_pairs"][:1] or len(was) != len(A["repeat_pairs"]):
        changed.append("recomputed repeat_pairs from the notices' full office "
                       "names (top pairing %d -> %d)"
                       % (max([p["n"] for p in was] or [0]), rp[0]["n"]))

    pe_rows = collections.defaultdict(list)
    for r in valued:
        if r["pe"]:
            pe_rows[r["pe"]].append(r)

    cap = []
    for pe, rs in pe_rows.items():
        if len(rs) < PE_CAPTURE_MIN:
            continue
        top = collections.Counter(firm(x["sup"]) for x in rs if x["sup"])
        if not top:
            continue
        key, n = top.most_common(1)[0]
        cap.append({"pe": pe, "total": len(rs),
                    "topsup": label([x["sup"] for x in rs if firm(x["sup"]) == key]),
                    "n": n, "pct": round(n / len(rs) * 100, 1)})
    cap.sort(key=lambda c: (-c["pct"], -c["total"]))
    if [c["pe"] for c in cap] != [c["pe"] for c in A.get("pe_capture") or []]:
        changed.append("recomputed pe_capture (%d offices, was %d)"
                       % (len(cap), len(A.get("pe_capture") or [])))
    A["pe_capture"] = cap

    mrows = sorted((pe for pe, rs in pe_rows.items() if len(rs) >= MATRIX_ROW_MIN),
                   key=lambda pe: -len(pe_rows[pe]))
    inside = collections.Counter()
    for pe in mrows:
        for r in pe_rows[pe]:
            if r["sup"]:
                inside[firm(r["sup"])] += 1
    overall = collections.Counter(firm(r["sup"]) for r in valued if r["sup"])
    mcols = [k for k, _ in inside.most_common(MATRIX_COLS)]
    grid, mx = [], 0
    for pe in mrows:
        cells = []
        for c in mcols:
            rs = [r for r in pe_rows[pe] if firm(r["sup"]) == c]
            cells.append({"n": len(rs), "crore": crore(sum(r["value"] for r in rs))})
            mx = max(mx, len(rs))
        grid.append({"pe": pe, "pe_total": len(pe_rows[pe]), "cells": cells})
    old_mx = (A.get("matrix") or {}).get("max")
    A["matrix"] = {
        "rows": [{"pe": pe, "total": len(pe_rows[pe])} for pe in mrows],
        "cols": [{"sup": label([r["sup"] for r in valued if firm(r["sup"]) == c]),
                  "total": overall[c]} for c in mcols],
        "grid": grid, "max": mx,
    }
    if old_mx != mx:
        changed.append("recomputed the office x contractor matrix "
                       "(largest cell %s -> %d)" % (old_mx, mx))

    # ---- 3. the aggregates story.html hard-codes in its OFF block ----------
    pe_n = collections.Counter(len(rs) for rs in pairs.values())
    off_pairs = collections.Counter()
    for r in valued:
        if r["sup"] and r["off"]:
            off_pairs[(firm(r["sup"]),
                       " ".join(re.sub(r"[^a-z0-9ঀ-৿ ]+", " ",
                                       r["off"].lower()).split()))] += 1
    off_n = collections.Counter(off_pairs.values())
    print("for story.html's OFF block, recomputed from the award notices:")
    print("  pairs_pe: {ge2:%d, ge3:%d}   largest pairing %d"
          % (sum(v for n, v in pe_n.items() if n >= 2),
             sum(v for n, v in pe_n.items() if n >= 3),
             max(pe_n) if pe_n else 0))
    print("  pairs_of: {ge2:%d, ge3:%d}"
          % (sum(v for n, v in off_n.items() if n >= 2),
             sum(v for n, v in off_n.items() if n >= 3)))

    A["names_repaired_from"] = (
        "pdf_derived.json — the register truncates Procuring_Entity_Name (271 "
        "rows), Supplier_Name (49), Organization_Agency (7) and the officer "
        "designation (3) at about 40 characters; every name here is the one "
        "printed on the government's own notice, and §07's office-level figures "
        "are grouped on those full names. See repair_names.py."
    )

    print("\n%s" % ("would change:" if args.dry_run else "changed:"))
    for c in changed or ["nothing — already repaired"]:
        print("  - %s" % c)
    if not args.dry_run:
        json.dump(A, open(ART, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print("wrote %s" % ART)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
