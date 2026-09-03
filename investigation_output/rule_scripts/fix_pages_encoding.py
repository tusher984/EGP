# -*- coding: utf-8 -*-
"""
Last two defects from the verification sweep.

1. ONE ROW POINTED AT THE WRONG PAGE.
   Tender 248630 / R07 quoted the liquid-asset bar correctly but recorded page 1,
   because the eligibility block's recorded page was the block's first page and
   this notice's block runs onto page 2. Every row's excerpt is now re-located in
   the named PDF and evidence_page is set to the page it is actually on. Only
   rows that fail on their recorded page are touched.

2. MOJIBAKE CARRIED THROUGH FROM EXTRACTION.
   A handful of notices encode the apostrophe such that pdftotext emits "â??"
   (e.g. "Bankâ??s Undertaking"). Left in the excerpt this makes a reader's diff
   against the PDF look like a mismatch. The sequence is repaired to a straight
   apostrophe and the substitution is recorded in the data dictionary rather than
   being done silently.

Both are cosmetic in effect and neither moves a rule verdict, but a page number a
reader cannot open is the kind of thing that gets a story killed.
"""
import csv, os, re, subprocess

REPO = "/sessions/exciting-laughing-curie/mnt/EGP-CDA"
OUT = os.path.join(REPO, "investigation_output")
CACHE = "/tmp/vpg"
FILES = [os.path.join(OUT, "rules_broken_line_by_line.csv"),
         os.path.join(OUT, "rule_deviations.csv")]

MOJI = [("â??", "'"), ("â€™", "'"), ("â€", '"'),
        ("â€", '"')]


def pages(d, f):
    if not f:
        return []
    os.makedirs(CACHE, exist_ok=True)
    cp = os.path.join(CACHE, (d.replace("/", "_") + "__" + f) + ".txt")
    if not os.path.exists(cp):
        p = os.path.join(REPO, d, f)
        if not os.path.exists(p):
            return []
        subprocess.run(["pdftotext", "-layout", p, cp],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if not os.path.exists(cp):
        return []
    return open(cp, encoding="utf-8", errors="replace").read().split("\f")


def flat(s):
    return re.sub(r"\s+", " ", re.sub(r"[^A-Za-z0-9 ]", " ", s or "")).strip().lower()


def probes(excerpt):
    """Candidate verbatim fragments, longest quoted first, then the whole cell."""
    c = sorted(re.findall(r'"([^"]{8,})"', excerpt), key=len, reverse=True)[:3]
    c.append(excerpt)
    out = []
    for fr in c:
        w = flat(fr).split()
        if len(w) >= 9:
            w = w[1:9]          # first word may be clipped mid-token
        if w:
            out.append(" ".join(w))
    return out


def main():
    for path in FILES:
        rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
        cols = list(rows[0].keys())
        moved = fixed_moji = 0
        for r in rows:
            for a, b in MOJI:
                for col in ("evidence_excerpt", "tender_evidence_excerpt"):
                    if col in r and a in r[col]:
                        r[col] = r[col].replace(a, b)
                        fixed_moji += 1
            d, f = (("Contract_Awards_PDFs", r.get("award_notice_pdf", ""))
                    if r.get("source_document_tested") == "AWARD_NOTICE"
                    else ("Tender Notice_PDFs", r.get("tender_notice_pdf", "")))
            pl = pages(d, f)
            if not pl or not r.get("evidence_page", "").strip().isdigit():
                continue
            n = int(r["evidence_page"])
            pr = probes(r.get("evidence_excerpt", ""))
            here = flat(pl[n - 1]) if n <= len(pl) else ""
            if any(p in here for p in pr):
                continue
            for i, pg in enumerate(pl, 1):
                if any(p in flat(pg) for p in pr):
                    r["evidence_page"] = str(i)
                    moved += 1
                    break
        with open(path, "w", newline="", encoding="utf-8-sig") as fh:
            w = csv.DictWriter(fh, fieldnames=cols, quoting=csv.QUOTE_ALL,
                               extrasaction="ignore")
            w.writeheader()
            for r in rows:
                w.writerow({c: r.get(c, "") for c in cols})
        print("  %-38s %5d rows, %d page(s) corrected, %d mojibake cell(s) repaired"
              % (os.path.basename(path), len(rows), moved, fixed_moji))


if __name__ == "__main__":
    print("final page/encoding pass:")
    main()
