# -*- coding: utf-8 -*-
"""
Give every broken-rule line something a reader can open and check.

Three gaps are closed here.

1. THE AWARD-STAGE RULES HAD NO EXCERPT.
   R01 (ownership not published), R02 (signed outside the band) and R04 (awarded
   with no award notice) were all scored from parsed fields, so their evidence
   cells were empty. Each now carries the page and the verbatim lines from the
   published PDF. For R01 the evidence is necessarily a negative, so the excerpt
   quotes the two adjacent lines between which disclosing notices print the
   ownership table, and says plainly that nothing sits between them.

2. THE PAGE COLUMN HELD A WHOLE MAP, NOT A PAGE.
   Notice-sourced rows inherited the master's compound provenance string
   ("eligibility p.1; bid counts p.1; ..."). The single page relevant to each
   rule is now parsed out into evidence_page; the full string is kept in
   evidence_page_map.

3. THE PORTAL'S OWN COMPLIANCE FIELD IS RECORDED AND TESTED.
   Every award notice prints "Was the Contract Singed in due time?" (the typo is
   the portal's). Over the 591 notices that answer it and publish both dates,
   the answer is a pure function of a FLAT 28-day test - yes if and only if the
   gap is 28 days or less, with zero exceptions. PPR 2025 Rule 123(9), as cited
   by the e-PG3A Tender Data Sheet, sets a sliding 14 / 21 / 28-day scale by
   contract value. Applying only the loosest cap, the portal certifies as
   "in due time" 331 contracts that ran past the cap applicable to their value.
   This is logged as a column, not as a rule breach: no clause in the corpus
   governs how the portal computes its own indicator, so grading it as a
   violation would fail the same citation test applied everywhere else.
"""
import csv, os, re, subprocess, collections, datetime

REPO = "/sessions/exciting-laughing-curie/mnt/EGP-CDA"
OUT = os.path.join(REPO, "investigation_output")
AWARD_DIR = os.path.join(REPO, "Contract_Awards_PDFs")
NOTICE_DIR = os.path.join(REPO, "Tender Notice_PDFs")
BROKEN = os.path.join(OUT, "rules_broken_line_by_line.csv")
DEV = os.path.join(OUT, "rule_deviations.csv")
MASTER = os.path.join(OUT, "master_tender_investigation.csv")
CACHE = "/tmp/pagetxt"


def pages(pdf_dir, fname):
    """Per-page text of one PDF, cached. Returns list of page strings."""
    if not fname:
        return []
    path = os.path.join(pdf_dir, fname)
    if not os.path.exists(path):
        return []
    os.makedirs(CACHE, exist_ok=True)
    cp = os.path.join(CACHE, fname.replace("/", "_") + ".txt")
    if not os.path.exists(cp):
        subprocess.run(["pdftotext", "-layout", path, cp],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if not os.path.exists(cp):
        return []
    return open(cp, encoding="utf-8", errors="replace").read().split("\f")


def find_line(pgs, needle):
    """(1-based page, line text) of the first line containing needle."""
    for i, p in enumerate(pgs, 1):
        for ln in p.split("\n"):
            if needle in ln:
                return i, ln.strip()
    return None, ""


def sq(s):
    """Collapse the layout padding inside a quoted line."""
    return re.sub(r"\s{2,}", "  ", (s or "").strip())


# --- which token of the master's page map belongs to which rule -------------
PAGE_TOKEN = {
    "R03": "eligibility", "R05": "eligibility", "R06": "eligibility",
    "R07": "eligibility", "R09": "eligibility", "R08": "tender security",
}


def page_from_map(mapstr, code):
    """Pull the one page number a given rule's evidence sits on."""
    tok = PAGE_TOKEN.get(code)
    if tok:
        m = re.search(re.escape(tok) + r"\s*p\.\s*(\d+)", mapstr or "", re.I)
        if m:
            return m.group(1)
    m = re.search(r"p\.\s*(\d+)", mapstr or "")
    return m.group(1) if m else ""


SUPPLIER = "Name of Supplier/Contractor/Consultant"
LOCATION = "Location of Supplier/Contractor/Consultant"
# The 54 ECONOMIC_OPERATOR notices label the same two fields differently, and
# omit the bid counts and the signing-compliance field altogether.
SUPPLIER_EO = "Name of the Economic Operator"
LOCATION_EO = "Business Address of the Economic Operator"


def r01_evidence(pgs):
    """The negative: no ownership block between the supplier and location lines."""
    pg, sup = find_line(pgs, SUPPLIER)
    lpg, loc = find_line(pgs, LOCATION)
    tmpl = ""
    if pg is None:
        pg, sup = find_line(pgs, SUPPLIER_EO)
        lpg, loc = find_line(pgs, LOCATION_EO)
        tmpl = (" This notice uses the economic-operator template, which also prints "
                "no tender counts and no signing-compliance field.")
    if pg is None:
        return "", ""
    ex = ('"%s" is followed immediately by "%s". Award notices that do disclose '
          'print "Beneficial Ownership Information :" and a Name / Beneficial '
          "Ownership (%%) / Country table between these two lines. On this notice "
          "there is nothing between them.%s") % (sq(sup), sq(loc), tmpl)
    return str(pg), ex


def r02_evidence(pgs):
    """The two dates and the portal's own compliance answer, verbatim."""
    pg, sig = find_line(pgs, "Date of Contract Signing")
    if pg is None:
        return "", "", ""
    _, noa = find_line(pgs, "Date of Notification of Award")
    _, adv = find_line(pgs, "Date of Advertisement")
    cert = ""
    for p in pgs:
        m = re.search(r"Was the Contract Singed in due time\?\s*([a-zA-Z]*)"
                      r"(?:\s*\n\s*([a-zA-Z]+))?", p)
        if m:
            cert = (m.group(1) or m.group(2) or "").strip().lower()
            break
    ex = '"%s" / "%s" / the notice\'s own field "Was the Contract Singed in due time?" answers "%s".' % (
        sq(noa), sq(sig), cert or "not printed on the economic-operator template")
    if adv:
        ex += ' Advertised "%s".' % sq(adv)
    return str(pg), ex, cert


def r04_evidence(pgs):
    """The tender notice's own status field."""
    pg, ln = find_line(pgs, "Tender/Proposal Status")
    if pg is None:
        return "", ""
    m = re.search(r"Tender/Proposal Status\s*:?\s*(.*)$", ln)
    return str(pg), ('"%s" - and the corpus holds no Contract Award Notice PDF for '
                     "this tender ID, so the supplier, the contract value, the number of "
                     "tenders received and responsive, and both dates are all "
                     "unpublished.") % sq(m.group(1) if m else ln)


def r08_evidence(pgs, amount):
    """The tender-security figure as printed in the notice's own lot table."""
    if not amount:
        return "", ""
    try:
        whole = "%d" % round(float(amount))
    except ValueError:
        return "", ""
    for i, p in enumerate(pgs, 1):
        for ln in p.split("\n"):
            if whole in ln or "{:,}".format(int(whole)) in ln:
                return str(i), ('the notice\'s own lot table, under the column headed '
                                '"Tender/Proposal security (Amount in BDT)", prints: "%s"'
                                % sq(ln))
    return "", ""


CERT_NOTE = (    "The portal's own indicator is computed against a flat 28-day test: over the 591 "
    "award notices that answer the field and print both dates, it reads yes if and only "
    "if the gap is 28 days or fewer, with zero exceptions. Rule 123(9) sets 14 days up "
    "to BDT 50 million, 21 days from 50 to 250 million and 28 days above that, so on a "
    "contract under BDT 250 million a yes here does not mean the contract was signed in "
    "time. No clause in the corpus governs how the portal computes this field, so this "
    "is reported as a defect in the indicator, not as a rule broken by the buyer."
)

NEW_COLS = ["evidence_page_map", "portal_self_certified_signed_in_due_time",
            "portal_indicator_note"]


def rewrite(path, fn, extra):
    rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
    cols = list(rows[0].keys()) + [c for c in extra if c not in rows[0]]
    n = 0
    for r in rows:
        if fn(r):
            n += 1
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=cols, quoting=csv.QUOTE_ALL, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, "") for c in cols})
    print("  %-38s %5d rows x %3d cols, %d rows given evidence" % (
        os.path.basename(path), len(rows), len(cols), n))
    return rows


def main():
    mrows = list(csv.DictReader(open(MASTER, encoding="utf-8-sig")))
    master = {r["tender_id"]: r for r in mrows}
    certs, stats = {}, collections.Counter()

    def fill(r):
        code = r.get("rule_code", "")
        tid = r["tender_id"]
        anp = r.get("award_notice_pdf", "") or ""
        tnp = r.get("tender_notice_pdf", "") or ""
        pcol = "evidence_page" if "evidence_page" in r else "tender_evidence_page"
        xcol = "evidence_excerpt" if "evidence_excerpt" in r else "tender_evidence_excerpt"
        old = r.get(pcol, "")
        if "p." in old and ";" in old:
            r["evidence_page_map"] = old
            r[pcol] = page_from_map(old, code)
        else:
            r.setdefault("evidence_page_map", "")
        r.setdefault("portal_self_certified_signed_in_due_time", "")
        r.setdefault("portal_indicator_note", "")
        if r.get(xcol, "").strip() and code not in ("R02",):
            return False
        if code == "R01" and anp:
            p, ex = r01_evidence(pages(AWARD_DIR, anp))
        elif code == "R02" and anp:
            p, ex, c = r02_evidence(pages(AWARD_DIR, anp))
            certs[tid] = c
            r["portal_self_certified_signed_in_due_time"] = c
            if c == "yes":
                r["portal_indicator_note"] = CERT_NOTE
        elif code == "R04" and tnp:
            p, ex = r04_evidence(pages(NOTICE_DIR, tnp))
        elif code == "R08" and tnp:
            p, ex = r08_evidence(pages(NOTICE_DIR, tnp),
                                 master.get(tid, {}).get("tender_security_bdt", ""))
        else:
            return False
        if not ex:
            return False
        r[pcol], r[xcol] = p, ex
        stats[code] += 1
        return True

    print("filling evidence:")
    rewrite(BROKEN, fill, NEW_COLS)
    rewrite(DEV, fill, NEW_COLS)

    # the portal-indicator column also belongs on the master, for all 645 awards
    for r in mrows:
        anp = r.get("award_source_file", "")
        r["portal_self_certified_signed_in_due_time"] = (
            r02_evidence(pages(AWARD_DIR, anp))[2] if anp else "")
    cols = list(mrows[0].keys())
    with open(MASTER, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=cols, quoting=csv.QUOTE_ALL, extrasaction="ignore")
        w.writeheader()
        for r in mrows:
            w.writerow({c: r.get(c, "") for c in cols})
    print("  %-38s %5d rows x %3d cols" % ("master_tender_investigation.csv", len(mrows), len(cols)))

    print("\nevidence added:", dict(stats))
    ok = [t for t, c in certs.items() if c == "yes"]
    print("R02 lines where the portal certifies 'signed in due time': %d of %d" % (
        len(ok), len(certs)))
    print("portal answers across the master:", dict(collections.Counter(
        r.get("portal_self_certified_signed_in_due_time", "") for r in mrows)))


if __name__ == "__main__":
    main()


