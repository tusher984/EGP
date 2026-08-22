#!/usr/bin/env python3
"""Add the missing `sold` field to every case row in article_data.json.

The evidence room in story.html lets a reader reproduce each headline figure by
filtering the 645 award rows. One figure could not be reproduced: the article's
primary single-responsive rate counts a tender as contested when rivals showed up
*or* when documents were sold to more than one firm — and `Tenders_Sold` was never
carried into the case rows. Without it the filter returned 114 rows where the
article says 149.

This joins each case back to Procurement_Database.json on Tender_Proposal_ID and
writes `sold` alongside the existing `recv` / `resp` counts. It is idempotent and
changes nothing else in the file.

    python3 enrich_article_data.py            # patch in place
    python3 enrich_article_data.py --check    # report only, write nothing
"""

import argparse
import io
import json
import os
import sys

DATA = "article_data.json"
DB = "Procurement_Database.json"


def die(msg):
    sys.stderr.write("enrich_article_data: %s\n" % msg)
    raise SystemExit(1)


def load(path):
    if not os.path.exists(path):
        die("%s not found — run this from the repository root." % path)
    return json.load(io.open(path, encoding="utf-8"))


def as_int(v):
    """e-GP exports these counts as strings, blanks and the occasional '1,024'."""
    if v is None:
        return None
    s = str(v).strip().replace(",", "")
    if not s:
        return None
    try:
        return int(float(s))
    except ValueError:
        return None


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true", help="report only, write nothing")
    args = ap.parse_args()

    data = load(DATA)
    db = load(DB)

    cases = data.get("cases") or []
    if not cases:
        die("%s carries no `cases` array." % DATA)

    by_id = {}
    for r in db:
        tid = str(r.get("Tender_Proposal_ID") or "").strip()
        if tid:
            by_id.setdefault(tid, []).append(r)

    missing = [c["id"] for c in cases if str(c["id"]) not in by_id]
    if missing:
        die("%d case ids are absent from %s (e.g. %s) — refusing to guess."
            % (len(missing), DB, missing[:5]))

    ambiguous = sorted(str(c["id"]) for c in cases if len(by_id[str(c["id"])]) > 1)
    if ambiguous:
        die("%d case ids match more than one database row (e.g. %s)."
            % (len(ambiguous), ambiguous[:5]))

    filled = blank = 0
    for c in cases:
        sold = as_int(by_id[str(c["id"])][0].get("Tenders_Sold"))
        c["sold"] = sold
        if sold is None:
            blank += 1
        else:
            filled += 1

    def contested(c):
        return c.get("resp") == 1 and ((c.get("recv") or 0) > 1 or (c.get("sold") or 0) > 1)

    resp1 = sum(1 for c in cases if c.get("resp") == 1)
    recv_only = sum(1 for c in cases if c.get("resp") == 1 and (c.get("recv") or 0) > 1)
    both = sum(1 for c in cases if contested(c))

    print("%d cases joined · %d carry a documents-sold count, %d blank"
          % (len(cases), filled, blank))
    print("one responsive bid                          : %d" % resp1)
    print("  ...with more than one bid received        : %d" % recv_only)
    print("  ...or documents sold to more than one firm: %d   <- the article's figure"
          % both)

    if args.check:
        print("--check: %s left untouched" % DATA)
        return

    with io.open(DATA, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    print("wrote %s (%.0f KB)" % (DATA, os.path.getsize(DATA) / 1024.0))


if __name__ == "__main__":
    main()
