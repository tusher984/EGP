# -*- coding: utf-8 -*-
"""
One pass over the five deliverables that either prints all-clear or names the row.

Nothing here trusts the scripts that built the files. Every check re-derives its
answer from the CSVs themselves or from the PDFs on disk:

  A. shape, encoding, quoting, duplicate keys
  B. no sentinel string survives anywhere in any file
  C. every broken-rule line has a clause quote, a rule page, an excerpt and a
     numeric document page, and the excerpt is findable verbatim on that page of
     that PDF
  D. every distinct clause citation resolves: a quoted fragment is findable on a
     cited page of the cited rule PDF
  E. the publishable headline (lines, tenders, value, per-rule split) recomputed
     from the file, not quoted from the write-up
  F. cross-file keys: every tender in the rule files and in bidder_detail exists
     in the master
  G. the data dictionary covers every column of every other file
"""
import csv, os, re, subprocess, collections

REPO = "/sessions/exciting-laughing-curie/mnt/EGP-CDA"
OUT = os.path.join(REPO, "investigation_output")
CACHE = "/tmp/vpg"
MASTER, DEV = "master_tender_investigation.csv", "rule_deviations.csv"
BROKEN, BID, DICT = ("rules_broken_line_by_line.csv", "bidder_detail.csv",
                     "data_dictionary.csv")
FAILURES = []


def fail(msg):
    FAILURES.append(msg)
    print("   FAIL  " + msg)


def load(name):
    return list(csv.DictReader(open(os.path.join(OUT, name), encoding="utf-8-sig")))


def pages(d, f):
    if not f:
        return []
    os.makedirs(CACHE, exist_ok=True)
    cp = os.path.join(CACHE, re.sub(r"[^A-Za-z0-9._-]", "_", d + "__" + f) + ".txt")
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


def probes(text):
    c = sorted(re.findall(r'"([^"]{8,})"', text), key=len, reverse=True)[:3] + [text]
    out = []
    for fr in c:
        w = flat(fr).split()
        if len(w) >= 9:
            w = w[1:9]
        if w:
            out.append(" ".join(w))
    return out


def money(s):
    try:
        return float((s or "").replace(",", ""))
    except ValueError:
        return 0.0


SENTINELS = ["NOT_AVAILABLE", "NOT_PUBLISHED_IN_ANY_DOCUMENT_IN_CORPUS", "NOT_PUBLISHED_IN_NOTICE",
             "NO_AWARD_NOTICE_IN_CORPUS", "NONE_IN_CORPUS", "BLANK_ON_NOTICE", "BLANK_IN_NOTICE",
             "WITHHELD_BY_METHOD", "TODO", "FIXME", "nan", "None"]
EXPECT = {MASTER: 1155, DEV: 5525, BROKEN: 1583, BID: 1189}


def check_a_shape(data):
    print("\nA. shape, encoding and keys")
    for name, rows in data.items():
        raw = open(os.path.join(OUT, name), "rb").read(3)
        bom = raw == b"\xef\xbb\xbf"
        head = open(os.path.join(OUT, name), encoding="utf-8-sig").readline()
        allq = head.strip().startswith('"') and head.strip().endswith('"')
        print("   %-38s %5d rows x %3d cols  BOM:%-5s QUOTE_ALL:%s"
              % (name, len(rows), len(rows[0].keys()), bom, allq))
        if not bom:
            fail("%s is not UTF-8 with BOM" % name)
        if not allq:
            fail("%s header is not fully quoted" % name)
        if name in EXPECT and len(rows) != EXPECT[name]:
            fail("%s has %d rows, expected %d" % (name, len(rows), EXPECT[name]))
    ids = [r["tender_id"] for r in data[MASTER]]
    dup = [k for k, v in collections.Counter(ids).items() if v > 1]
    print("   master duplicate tender_ids: %d" % len(dup))
    if dup:
        fail("master has duplicate tender_ids: %s" % dup[:5])


def check_b_sentinels(data):
    print("\nB. residual placeholder strings")
    tot = 0
    for name, rows in data.items():
        hits = collections.Counter()
        for r in rows:
            for c, v in r.items():
                s = (v or "").strip()
                if s in SENTINELS or any(s.startswith(x + "_") or s.startswith(x + ":")
                                         for x in SENTINELS):
                    hits[c] += 1
        tot += sum(hits.values())
        if hits:
            fail("%s still carries placeholders: %s" % (name, dict(hits)))
    print("   placeholder cells across all five files: %d" % tot)


def check_c_excerpts(broken):
    print("\nC. every broken-rule line is checkable against its PDF")
    for col in ("rule_text_verbatim", "rule_pdf_page", "evidence_excerpt", "evidence_page"):
        n = sum(1 for r in broken if not (r.get(col) or "").strip())
        print("   rows with an empty %-20s %d" % (col, n))
        if n:
            fail("%d broken-rule rows have an empty %s" % (n, col))
    bad = [r for r in broken if not re.fullmatch(r"\d+", (r["evidence_page"] or "").strip())]
    if bad:
        fail("%d rows have a non-numeric evidence_page" % len(bad))
    ok, miss = 0, []
    for r in broken:
        d, f = (("Contract_Awards_PDFs", r.get("award_notice_pdf", ""))
                if r.get("source_document_tested") == "AWARD_NOTICE"
                else ("Tender Notice_PDFs", r.get("tender_notice_pdf", "")))
        pl = pages(d, f)
        n = int(r["evidence_page"])
        here = flat(pl[n - 1]) if 0 < n <= len(pl) else ""
        if any(p in here for p in probes(r["evidence_excerpt"])):
            ok += 1
        else:
            miss.append((r["rule_code"], r["tender_id"], f, r["evidence_page"]))
    print("   excerpt found verbatim on the named page: %d of %d" % (ok, len(broken)))
    for m in miss[:10]:
        fail("excerpt not on named page: %s" % (m,))


def check_d_citations(broken):
    print("\nD. every clause citation resolves in the rule PDF")
    seen = {}
    for r in broken:
        seen.setdefault((r["rule_code"], r["rule_pdf_file"], r["rule_pdf_page"],
                         r["rule_text_verbatim"]), r)
    for (code, pdf, pgs, quote) in sorted(seen):
        pl = pages("", pdf)
        nums = [int(x) for x in re.findall(r"\d+", pgs)]
        texts = {n: flat(pl[n - 1]) for n in nums if 0 < n <= len(pl)}
        frags = re.findall(r"'([^']{20,})'", quote) or [quote]

        def found_on(fr, where):
            w = flat(fr).split()
            for i in range(0, max(1, len(w) - 5), 3):
                if " ".join(w[i:i + 6]) in where:
                    return True
            return False

        unfound = [fr[:60] for fr in frags
                   if not any(found_on(fr, t) for t in texts.values())]
        blankpg = [n for n in nums if not any(found_on(fr, texts.get(n, "")) for fr in frags)]
        print("   %-4s %-16s pages %-12s fragments %d, unresolved %d, cited-but-unquoted %s"
              % (code, os.path.basename(pdf)[:16], pgs, len(frags), len(unfound),
                 blankpg or "none"))
        for u in unfound:
            fail("%s quotes text not on its cited pages: %s..." % (code, u))
        for n in blankpg:
            fail("%s cites %s p.%d but quotes nothing from it"
                 % (code, os.path.basename(pdf), n))


def check_e_headline(broken):
    print("\nE. the publishable headline, recomputed from the file")
    yes = [r for r in broken if r["publishable_as_a_breach"].startswith("YES")]
    tenders = {r["tender_id"] for r in yes}
    val = sum(money(r.get("contract_value_bdt", "")) for r in
              {r["tender_id"]: r for r in yes}.values())
    print("   publishable lines            %d" % len(yes))
    print("   distinct tenders             %d" % len(tenders))
    print("   combined contract value      BDT %.1f crore" % (val / 1e7))
    print("   per rule                     %s" % dict(sorted(
        collections.Counter(r["rule_code"] for r in yes).items())))
    print("   agency mix                   %s" % dict(collections.Counter(
        r.get("agency", "") for r in
        {r["tender_id"]: r for r in yes}.values()).most_common()))
    for k, v in collections.Counter(r["publishable_as_a_breach"] for r in broken).most_common():
        print("   %-62s %4d" % (k, v))
    want = {"R01": 63, "R02": 56, "R03": 24, "R04": 3, "R05": 6}
    got = dict(collections.Counter(r["rule_code"] for r in yes))
    if got != want:
        fail("per-rule publishable split is %s, the write-up says %s" % (got, want))
    if len(yes) != 152 or len(tenders) != 91:
        fail("headline is %d lines / %d tenders, the write-up says 152 / 91"
             % (len(yes), len(tenders)))


def check_f_keys(data):
    print("\nF. cross-file keys")
    ids = {r["tender_id"] for r in data[MASTER]}
    for name in (DEV, BROKEN, BID):
        orphan = {r["tender_id"] for r in data[name]} - ids
        print("   %-38s tender_ids not in master: %d" % (name, len(orphan)))
        if orphan:
            fail("%s references %d tender_ids absent from the master: %s"
                 % (name, len(orphan), sorted(orphan)[:5]))


def check_g_dictionary(data):
    print("\nG. the data dictionary covers every column")
    d = load(DICT)
    have = {(r["file"], r["column"]) for r in d}
    missing = []
    for name, rows in data.items():
        for c in rows[0].keys():
            if (name, c) not in have:
                missing.append((name, c))
    print("   dictionary rows %d, columns described %d, undescribed %d"
          % (len(d), len(have), len(missing)))
    for m in missing[:10]:
        fail("data_dictionary.csv does not describe %s / %s" % m)
    unexplained = [(r["file"], r["column"]) for r in d
                   if r["cells_empty"] not in ("", "0") and not r["why_empty_cells_are_empty"]]
    print("   columns with empties but no explanation: %d" % len(unexplained))
    for u in unexplained[:10]:
        fail("no why-empty text for %s / %s" % u)


def main():
    data = {n: load(n) for n in (MASTER, DEV, BROKEN, BID)}
    check_a_shape(data)
    check_b_sentinels(dict(list(data.items()) + [(DICT, load(DICT))]))
    check_c_excerpts(data[BROKEN])
    check_d_citations(data[BROKEN])
    check_e_headline(data[BROKEN])
    check_f_keys(data)
    check_g_dictionary(data)
    print("\n" + "=" * 78)
    if FAILURES:
        print("VERIFICATION FAILED: %d problem(s)" % len(FAILURES))
        for f in FAILURES:
            print("  - " + f)
    else:
        print("ALL CHECKS PASSED")
    print("=" * 78)


if __name__ == "__main__":
    main()
