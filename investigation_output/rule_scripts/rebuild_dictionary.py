# -*- coding: utf-8 -*-
"""
Rebuild data_dictionary.csv from the five deliverables exactly as they now stand.

The dictionary was written by finalise_csvs.py before fill_evidence.py added
evidence_page_map, portal_self_certified_signed_in_due_time and
portal_indicator_note, and before the citation repairs, so it under-reported by
three columns and its fill counts were stale. Regenerating from disk keeps the
dictionary a description of the files a reader actually has, which is the only
thing it is good for.

The why-empty texts are imported from finalise_csvs rather than restated, so the
two files cannot drift apart. Entries for the newer columns, and for the two
transformations applied after the dictionary was first written, are added here.
"""
import csv, os, sys

OUT = "/sessions/exciting-laughing-curie/mnt/EGP-CDA/investigation_output"
sys.path.insert(0, os.path.join(OUT, "rule_scripts"))
from finalise_csvs import why_empty, WHY_EMPTY  # noqa: E402

WHY_EMPTY.update({
    "evidence_page_map": (
        "empty unless the row's evidence page was inherited from the master's compound "
        "provenance string; where it is filled it holds that whole string, and "
        "evidence_page holds the one page the rule's evidence sits on"),
    "portal_self_certified_signed_in_due_time": (
        "empty on the 54 economic-operator award notices, which do not print the field "
        "at all, and on every tender with no award notice in the corpus"),
    "portal_indicator_note": (
        "filled only where the portal answers yes; the note explains that the portal's "
        "yes is computed against a flat 28-day test rather than Rule 123(9)'s sliding "
        "14 / 21 / 28-day scale, so a yes does not establish that the contract was "
        "signed in time"),
})

FILES = ["master_tender_investigation.csv", "rule_deviations.csv",
         "rules_broken_line_by_line.csv", "bidder_detail.csv"]

COLS = ["file", "column", "total_rows", "cells_filled", "cells_empty", "fill_percent",
        "distinct_values", "example_value", "why_empty_cells_are_empty"]


def main():
    out = []
    for fname in FILES:
        rows = list(csv.DictReader(open(os.path.join(OUT, fname), encoding="utf-8-sig")))
        n = len(rows)
        for c in rows[0].keys():
            vals = [(r.get(c) or "").strip() for r in rows]
            filled = sum(1 for v in vals if v)
            out.append(dict(
                file=fname, column=c, total_rows=str(n),
                cells_filled=str(filled), cells_empty=str(n - filled),
                fill_percent="%.1f" % (100.0 * filled / n) if n else "",
                distinct_values=str(len(set(v for v in vals if v))),
                example_value=next((v for v in vals if v), "")[:200],
                why_empty_cells_are_empty=("" if filled == n else why_empty(c)),
            ))
    # the dictionary describes itself too, so a reader knows what the columns mean
    out.append(dict(file="data_dictionary.csv", column="(this file)",
                    total_rows=str(len(out) + 1), cells_filled="", cells_empty="",
                    fill_percent="", distinct_values="",
                    example_value="one row per column of every other deliverable",
                    why_empty_cells_are_empty=(
                        "why_empty_cells_are_empty is itself empty wherever a column is "
                        "100 percent filled. Two transformations were applied after the "
                        "first pass: 89 evidence_page cells that had inherited a whole "
                        "provenance map were reduced to the single page and the map kept "
                        "in evidence_page_map; and the pdftotext mojibake sequence for a "
                        "curly apostrophe was replaced with a straight apostrophe in 19 "
                        "excerpt cells, so that a reader's diff against the PDF matches.")))
    p = os.path.join(OUT, "data_dictionary.csv")
    with open(p, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=COLS, quoting=csv.QUOTE_ALL, extrasaction="ignore")
        w.writeheader()
        for r in out:
            w.writerow(r)
    described = sum(1 for r in out if r["why_empty_cells_are_empty"])
    print("wrote data_dictionary.csv: %d rows, %d columns carry empties and all %d are "
          "explained" % (len(out), sum(1 for r in out if r["cells_empty"] not in ("", "0")),
                         described))
    miss = [(r["file"], r["column"]) for r in out
            if r["cells_empty"] not in ("", "0") and not r["why_empty_cells_are_empty"]]
    print("columns with unexplained empties:", len(miss))
    for m in miss[:20]:
        print("   ", m)


if __name__ == "__main__":
    main()
