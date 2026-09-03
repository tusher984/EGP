# -*- coding: utf-8 -*-
"""
R01 cited a table-of-contents page. Fixed here, with the cause.

The row's clause reference reads "ITT 5.14 and ITT 68.1, read with Format
e-PG3A-C Note 1" and rule_printed_page reads "s.1 p.6, p.28, p.79". The PDF-page
column had 6 for the first of those, which is the PRINTED page 6, not the PDF's
sixth page - the PDF's page 6 is part of the table of contents. e-PG3A's front
matter runs eight pages, so printed p.6 is PDF p.14, printed p.28 is PDF p.36 and
printed p.79 is PDF p.87: the other two were already correct, the first was the
printed number left in the PDF column.

PDF page 14 carries ITT 5.14, which is the duty the row was always citing, so the
fix is to point at 14 and to quote it, giving R01 the pair it needs - the
tenderer's duty to supply beneficial-ownership information and consent to its
publication, and the procuring entity's duty to publish it.
"""
import csv, os

OUT = "/sessions/exciting-laughing-curie/mnt/EGP-CDA/investigation_output"
FILES = ["rules_broken_line_by_line.csv", "rule_deviations.csv"]

ITT514 = ("ITT 5.14: 'A Tenderer shall provide its/their Beneficial Ownership related "
          "information, as the specified in Form e-PG3A-2, if it/they will be awarded the "
          "contract and declare their consent on publishing that information publicly "
          "following the signing of contract.' (the grammar is the draft's own) ")


def main():
    for name in FILES:
        p = os.path.join(OUT, name)
        rows = list(csv.DictReader(open(p, encoding="utf-8-sig")))
        cols = list(rows[0].keys())
        # the two files name these columns differently
        pcol = "rule_pdf_page" if "rule_pdf_page" in cols else "rule_source_pdf_page"
        qcol = "rule_text_verbatim" if "rule_text_verbatim" in cols else "clause_quote_verbatim"
        n = 0
        for r in rows:
            if r.get("rule_code") != "R01":
                continue
            if r.get(pcol, "").strip() == "6, 36, 87":
                r[pcol] = "14, 36, 87"
                n += 1
            if "ITT 5.14" not in r.get(qcol, ""):
                r[qcol] = ITT514 + r.get(qcol, "")
        with open(p, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=cols, quoting=csv.QUOTE_ALL,
                               extrasaction="ignore")
            w.writeheader()
            for r in rows:
                w.writerow({c: r.get(c, "") for c in cols})
        print("  %-38s %d R01 rows re-pointed from PDF p.6 to p.14" % (name, n))


if __name__ == "__main__":
    print("fixing the R01 printed-page / PDF-page conflation:")
    main()
