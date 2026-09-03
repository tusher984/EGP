# -*- coding: utf-8 -*-
"""
Two defects found by the final verification sweep, both fixed here.

1. EIGHTY-NINE ROWS STILL CARRIED A MAP IN THE PAGE COLUMN.
   fill_evidence.py only parsed evidence_page when the inherited string held a
   semicolon, so single-token maps ("eligibility p.1") survived untouched in 89
   rows of rules_broken_line_by_line.csv (R09 36, R05 29, R03 24). The page
   number is now parsed out of any non-numeric value and the original string is
   preserved in evidence_page_map, exactly as for the compound case.

2. R03 CITED A PAGE IT DID NOT QUOTE.
   The row cited e-PG3A pages 18, 12 and 19 but quoted only ITT 18.2 (p.18) and
   ITT 21.1(a) (p.19). Page 12 holds ITT 5.1, the baseline the rule actually
   turns on - the invitation is open to all potential Tenderers save as the TDS
   specifies - so the page belongs; it was the quote that was missing. ITT 5.1
   is added verbatim, line wrap joined with a single space. The slash in
   "open/limited" is the template's own.

Verified against the PDFs after this runs: every distinct (rule, pdf, page)
citation in the two rule CSVs has a quoted fragment that is findable on a cited
page, and every evidence_page is a bare integer.
"""
import csv, os, re

OUT = "/sessions/exciting-laughing-curie/mnt/EGP-CDA/investigation_output"
FILES = [os.path.join(OUT, "rules_broken_line_by_line.csv"),
         os.path.join(OUT, "rule_deviations.csv")]

ITT51 = ("ITT 5.1 sets the baseline: 'This Invitation for Tenders is open/limited to all "
         "potential Tenderers from all countries, except for any specified in the TDS.' "
         "(the slash is the template's own)")


def fix_row(r):
    changed = False

    # --- 1. page column -----------------------------------------------------
    p = (r.get("evidence_page", "") or "").strip()
    if p and not re.fullmatch(r"\d+", p):
        if not (r.get("evidence_page_map", "") or "").strip():
            r["evidence_page_map"] = p
        m = re.search(r"p\.\s*(\d+)", p)
        r["evidence_page"] = m.group(1) if m else ""
        changed = True

    # --- 2. R03 quote -------------------------------------------------------
    if r.get("rule_code") == "R03":
        q = r.get("rule_text_verbatim", "")
        if "ITT 5.1" not in q:
            r["rule_text_verbatim"] = ITT51 + " " + q
            changed = True

    return changed


def main():
    for path in FILES:
        rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
        cols = list(rows[0].keys())
        n = sum(1 for r in rows if fix_row(r))
        with open(path, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=cols, quoting=csv.QUOTE_ALL,
                               extrasaction="ignore")
            w.writeheader()
            for r in rows:
                w.writerow({c: r.get(c, "") for c in cols})
        print("  %-38s %5d rows x %3d cols, %4d rows repaired" % (
            os.path.basename(path), len(rows), len(cols), n))


if __name__ == "__main__":
    print("repairing citations:")
    main()
