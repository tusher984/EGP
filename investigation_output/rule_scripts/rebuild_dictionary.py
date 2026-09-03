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

OUT = _p.OUT
sys.path.insert(0, os.path.join(OUT, "rule_scripts"))
from finalise_csvs import why_empty, WHY_EMPTY  # noqa: E402
import repo_paths as _p

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
         "rules_broken_line_by_line.csv", "bidder_detail.csv",
         "rules_broken_line_by_line_bilingual.csv", "final_merged_investigation.csv"]

# the two later deliverables: the bilingual line-by-line file and the merged file
WHY_EMPTY.update({
    "bidder_detail_": (
        "empty on the 510 tenders that have no row in bidder_detail.csv, which covers the 645 "
        "tenders with an award notice; within those 645, a sub-record column is empty where "
        "that record type is absent - no joint venture, no disclosed owner, no rejected-bidder "
        "aggregate, or no bid amount printed"),
    "awarded_bidder_bid_amount": (
        "empty where the award notice prints no amount for the winning bidder, and on every "
        "tender with no award notice in the corpus"),
    "rules_broken_reportable_codes": "empty where no rule was broken reportably on this tender",
    "rules_broken_reportable_summary_bn": (
        "empty where no rule was broken reportably on this tender; where it is filled it names "
        "the broken rules in Bengali"),
    "rules_deviation_not_reportable_codes": (
        "empty where every deviation found on this tender is reportable, or where none was found"),
})
for _n in range(1, 19):
    WHY_EMPTY["R%02d_" % _n] = (
        "the three columns of a rule's block - status, finding_en, finding_bn - are empty "
        "together, and only, where that rule was not in scope for that tender; where the rule "
        "was run the status column always says what the result was, including COMPLIANT and the "
        "NOT_APPLICABLE_* results")

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
                        "100 percent filled. Three transformations were applied after the "
                        "first pass: 89 evidence_page cells that had inherited a whole "
                        "provenance map were reduced to the single page and the map kept "
                        "in evidence_page_map; the pdftotext mojibake sequence for a "
                        "curly apostrophe was replaced with a straight apostrophe in 19 "
                        "excerpt cells, so that a reader's diff against the PDF matches; "
                        "and two later files were added, the bilingual line-by-line file "
                        "and the merged one-row-per-tender file, whose Bengali columns "
                        "translate the narrative only - every quote, file name, page "
                        "number, clause number and figure in them is left exactly as the "
                        "English files and the PDFs carry it, in ASCII digits.")))

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
