# -*- coding: utf-8 -*-
"""
Verification for the two new files, re-derived from the five they were built from.

Nothing here trusts the builders. Seven groups:

  A. shape, encoding, quoting, one row per tender, no tender lost
  B. every one of the 179 master columns is byte-identical in the merged file
  C. the per-rule grid reproduces rule_deviations cell for cell, and an empty
     status cell means, and only means, that the rule was not in scope
  D. the bilingual file's 38 inherited columns are byte-identical to the English
     file, so the quotes and pages verify_all already checked are still the ones
     on the page
  E. no Bengali cell is empty, no Bengali cell carries Bengali numerals, and every
     number in the row's observed value, every page number, the file name and the
     clause citation all appear in the Bengali sentence too - the check that the
     translation did not drift off the figures
  F. the headline recomputed from the merged file alone
  G. the bidder aggregates add back up to bidder_detail, and one row per rule is
     re-found in its PDF as a spot check
"""
import csv, os, re, subprocess, collections
import os, sys
# python3 -P keeps a script's own folder off sys.path, and this repository has
# a stub at its root that must never shadow a real package, so -P is the right
# way to run these. Putting this folder back on the path explicitly is what
# makes the shared paths module importable under it.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import repo_paths as _p

OUT = _p.OUT
REPO = _p.REPO
CACHE = _p.CACHE
MASTER, DEV, BROKEN = ("master_tender_investigation.csv", "rule_deviations.csv",
                       "rules_broken_line_by_line.csv")
BID = "bidder_detail.csv"
BILING, MERGED = "rules_broken_line_by_line_bilingual.csv", "final_merged_investigation.csv"
FAILURES = []


def fail(m):
    FAILURES.append(m)
    print("   FAIL  " + m)


def load(n):
    return list(csv.DictReader(open(os.path.join(OUT, n), encoding="utf-8-sig")))


def money(s):
    try:
        return float((s or "").replace(",", ""))
    except ValueError:
        return 0.0


def check_a(master, merged, biling, broken):
    print("\nA. shape, encoding, and that no tender or line was lost")
    for name, rows in ((BILING, biling), (MERGED, merged)):
        raw = open(os.path.join(OUT, name), "rb").read(3) == b"\xef\xbb\xbf"
        head = open(os.path.join(OUT, name), encoding="utf-8-sig").readline().strip()
        q = head.startswith('"') and head.endswith('"')
        print("   %-44s %5d rows x %3d cols  BOM:%-5s QUOTE_ALL:%s"
              % (name, len(rows), len(rows[0].keys()), raw, q))
        if not raw:
            fail("%s is not UTF-8 with BOM" % name)
        if not q:
            fail("%s header is not fully quoted" % name)
    if [r["tender_id"] for r in merged] != [r["tender_id"] for r in master]:
        fail("merged tender_id sequence differs from the master")
    else:
        print("   merged tender_id sequence identical to the master, %d rows" % len(merged))
    if len({r["tender_id"] for r in merged}) != len(merged):
        fail("merged file has duplicate tender_ids")
    if [r["line_no"] for r in biling] != [r["line_no"] for r in broken]:
        fail("bilingual line_no sequence differs from the English broken file")
    else:
        print("   bilingual line_no sequence identical to the English file, %d rows" % len(biling))


def check_b(master, merged):
    print("\nB. the 179 master columns survive byte-identically")
    mcols = list(master[0].keys())
    miss = [c for c in mcols if c not in merged[0]]
    if miss:
        fail("merged file dropped master columns: %s" % miss[:5])
        return
    bad = 0
    for a, b in zip(master, merged):
        for c in mcols:
            if a[c] != b[c]:
                bad += 1
                if bad < 4:
                    fail("%s / %s changed: %r -> %r" % (a["tender_id"], c, a[c][:40], b[c][:40]))
    print("   %d columns x %d rows compared, %d differences" % (len(mcols), len(master), bad))


EXPECT_TOKEN = {
    "YES_MANDATORY_CLAUSE_AND_EVENT_FALLS_INSIDE_INSTRUMENT_PERIOD": "BROKEN_REPORTABLE",
    "NO_CITED_INSTRUMENT_POSTDATES_THE_EVENT": "BROKEN_BUT_CITED_RULE_POSTDATES_THE_EVENT",
    "NO_RECOMMENDED_BAND_IS_NOT_A_DUTY": "OUTSIDE_RECOMMENDED_BAND_NOT_A_DUTY",
}


def check_c(dev, merged):
    print("\nC. the per-rule grid reproduces rule_deviations cell for cell")
    cols = list(merged[0].keys())
    stem = {}
    for c in cols:
        m = re.match(r"(R\d\d)_.*__status$", c)
        if m:
            stem[m.group(1)] = c[:-len("__status")]
    if len(stem) != 18:
        fail("merged file carries %d rule status columns, expected 18" % len(stem))
    by = {r["tender_id"]: r for r in merged}
    n, blanks = 0, 0
    for d in dev:
        row = by.get(d["tender_id"])
        if row is None:
            fail("rule_deviations references tender %s, absent from the merged file"
                 % d["tender_id"])
            continue
        s = stem.get(d["rule_code"])
        want = (EXPECT_TOKEN[d["publishable_as_a_breach"]] if d["test_result"] == "DEVIATION"
                else d["test_result"])
        got = row[s + "__status"]
        if got != want:
            fail("%s %s status is %r, rule_deviations implies %r"
                 % (d["tender_id"], d["rule_code"], got, want))
        for suffix in ("__finding_en", "__finding_bn"):
            if not row[s + suffix]:
                fail("%s %s has an empty %s" % (d["tender_id"], d["rule_code"], suffix))
        n += 1
    pairs = {(d["tender_id"], d["rule_code"]) for d in dev}
    for row in merged:
        for code, s in stem.items():
            filled = any(row[s + x] for x in ("__status", "__finding_en", "__finding_bn"))
            if filled != ((row["tender_id"], code) in pairs):
                fail("%s %s: cells %s but rule in scope %s"
                     % (row["tender_id"], code, filled, (row["tender_id"], code) in pairs))
            if not filled:
                blanks += 1
    print("   %d rule results checked against the grid, %d empty rule blocks and every one of "
          "them a rule that was not in scope" % (n, blanks))


def check_d(broken, biling):
    print("\nD. the bilingual file's inherited columns are byte-identical")
    shared = list(broken[0].keys())
    bad = collections.Counter()
    for a, b in zip(broken, biling):
        for c in shared:
            if a[c] != b[c]:
                bad[c] += 1
    print("   %d inherited columns compared over %d rows, %d columns differ"
          % (len(shared), len(broken), len(bad)))
    for c, k in bad.most_common(5):
        fail("bilingual file altered inherited column %s in %d rows" % (c, k))
    for c in ("rule_text_verbatim", "evidence_excerpt"):
        if c in bad:
            fail("THE QUOTES CHANGED: %s differs in %d rows" % (c, bad[c]))
    print("   rule_text_verbatim and evidence_excerpt unaltered in all %d rows" % len(biling))


BN_DIGITS = "০১২৩৪৫৬৭৮৯"


def check_e(biling):
    print("\nE. the Bengali columns: filled, ASCII-numbered, and carrying the row's own figures")
    empty = collections.Counter()
    for r in biling:
        for c in r:
            if c.endswith("_bn") and not r[c]:
                empty[c] += 1
    print("   empty Bengali cells: %s" % (dict(empty) or "none"))
    for c, k in empty.items():
        fail("%d rows have an empty %s" % (k, c))

    bnd = [r["line_no"] for r in biling
           if any(ch in r["rule_vs_reality_bn"] for ch in BN_DIGITS)]
    print("   Bengali sentences using Bengali numerals: %d (the file's rule is ASCII digits, so "
          "a figure can be diffed against the PDF)" % len(bnd))
    if bnd:
        fail("Bengali numerals in %d sentences, e.g. line %s" % (len(bnd), bnd[:3]))

    drift = 0
    for r in biling:
        bn = r["rule_vs_reality_bn"]
        want = re.findall(r"\d+(?:\.\d+)?", r["what_the_document_shows"])
        want += re.findall(r"\d+", r["rule_pdf_page"]) + [r["evidence_page"]]
        missing = [w for w in want if w not in bn]
        base = os.path.basename(r["rule_pdf_file"])
        if missing or base not in bn or r["rule_clause_cited"] not in bn:
            drift += 1
            if drift < 4:
                fail("line %s Bengali sentence drops %s" % (r["line_no"], missing or base))
    print("   rows whose Bengali sentence drops a figure, a page, the rule file or the clause: %d"
          % drift)


def check_f(merged, biling):
    print("\nF. the headline, recomputed from the merged file alone")
    rep = [r for r in merged if r["rules_broken_reportable_count"] not in ("", "0")]
    lines = sum(int(r["rules_broken_reportable_count"] or 0) for r in merged)
    val = sum(money(r["contract_value_bdt"]) for r in rep)
    per = collections.Counter()
    for r in rep:
        for c in r["rules_broken_reportable_codes"].split(", "):
            if c:
                per[c] += 1
    print("   reportable lines %d | tenders %d | BDT %.1f crore" % (lines, len(rep), val / 1e7))
    print("   per rule %s" % dict(sorted(per.items())))
    print("   agencies %s" % dict(collections.Counter(r["agency"] for r in rep).most_common()))
    want = {"R01": 63, "R02": 56, "R03": 24, "R04": 3, "R05": 6}
    if dict(per) != want:
        fail("per-rule reportable split is %s, the published headline is %s" % (dict(per), want))
    if lines != 152 or len(rep) != 91:
        fail("headline is %d lines / %d tenders, the published headline is 152 / 91"
             % (lines, len(rep)))
    bl = [r for r in biling if r["rule_status_token"] == "BROKEN_REPORTABLE"]
    if len(bl) != lines or {r["tender_id"] for r in bl} != {r["tender_id"] for r in rep}:
        fail("bilingual file and merged file disagree on which tenders are reportable")
    else:
        print("   the bilingual file names the same %d lines and the same %d tenders"
              % (len(bl), len({r["tender_id"] for r in bl})))


def check_g(bid, merged):
    print("\nG. the bidder aggregates add back up, and a row per rule is re-found in its PDF")
    by = collections.defaultdict(list)
    for r in bid:
        by[r["tender_id"]].append(r)
    tot, bad = 0, 0
    for row in merged:
        src = by.get(row["tender_id"], [])
        want = str(len(src)) if src else ""
        if row["bidder_detail_rows"] != want:
            bad += 1
            if bad < 4:
                fail("%s bidder_detail_rows is %r, bidder_detail has %d rows"
                     % (row["tender_id"], row["bidder_detail_rows"], len(src)))
        tot += len(src)
    print("   %d bidder_detail rows accounted for over %d tenders, %d mismatches"
          % (tot, sum(1 for r in merged if r["bidder_detail_rows"]), bad))
    if tot != len(bid):
        fail("%d of %d bidder_detail rows reached the merged file" % (tot, len(bid)))


def pages(d, f):
    """The pages of one cited PDF. Read with pdftotext where it is installed and
       from the extraction cache in the repository where it is not; which one
       answered is printed at the end of the run."""
    return _p.page_text(d, f)


def flat(s):
    return re.sub(r"\s+", " ", re.sub(r"[^A-Za-z0-9 ]", " ", s or "")).strip().lower()


def probes(text):
    """Same strategy verify_all.py uses: quoted fragments first, then the whole cell.

    A first pass here used the whole cell only, and reported R01, R04 and R08 as
    unfindable. They are findable. Those three cells are commentary wrapped around
    a quote - R01's proof is that two adjacent lines have nothing between them,
    R04's is a single status word, R08's describes a lot-table column - so the
    cell as a whole is not on the page while every quote inside it is. Probing the
    quotes is the check; probing the commentary is a bug in the checker.
    """
    c = sorted(re.findall(r'"([^"]{8,})"', text), key=len, reverse=True)[:3] + [text]
    out = []
    for fr in c:
        w = flat(fr).split()
        if len(w) >= 9:
            w = w[1:9]
        if w:
            out.append(" ".join(w))
    return out


def spot_check_pdfs(biling):
    print("   spot check, one row per rule, excerpt re-found in the PDF the row names:")
    seen = {}
    for r in biling:
        seen.setdefault(r["rule_code"], r)
    for code in sorted(seen):
        r = seen[code]
        d, f = (("Contract_Awards_PDFs", r["award_notice_pdf"])
                if r["source_document_tested"] == "AWARD_NOTICE"
                else ("Tender Notice_PDFs", r["tender_notice_pdf"]))
        pl = pages(d, f)
        n = int(r["evidence_page"])
        here = flat(pl[n - 1]) if 0 < n <= len(pl) else ""
        hits = [p for p in probes(r["evidence_excerpt"]) if p and p in here]
        print("      %-4s %-34s p.%-3s %s" % (code, f[:34], n,
                                              "found (%d probes)" % len(hits) if hits
                                              else "NOT FOUND"))
        if not hits:
            fail("%s excerpt not re-found in %s p.%s" % (code, f, n))



def main():
    _p.check()
    master, dev, broken = load(MASTER), load(DEV), load(BROKEN)
    bid, biling, merged = load(BID), load(BILING), load(MERGED)
    check_a(master, merged, biling, broken)
    check_b(master, merged)
    check_c(dev, merged)
    check_d(broken, biling)
    check_e(biling)
    check_f(merged, biling)
    check_g(bid, merged)
    spot_check_pdfs(biling)
    print("\n" + "=" * 78)
    print(_p.page_source_line())
    if FAILURES:
        print("MERGE VERIFICATION FAILED: %d problem(s)" % len(FAILURES))
        for f in FAILURES:
            print("  - " + f)
    else:
        print("ALL MERGE CHECKS PASSED")
    print("=" * 78)


if __name__ == "__main__":
    main()





