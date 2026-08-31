"""Check egp_violations_by_tender.csv against the PDFs it claims to summarise.

build_violations_csv.py already reconciles its totals against figures verified
earlier. Totals can agree while individual rows are wrong, so this goes the other
way: it picks rows out of the finished CSV and looks for the same values in the
raw text of the tender's own PDFs, then checks the three structural properties the
CSV's shape depends on — that the numbered list columns stay in step with each
other, that engine flags keep the index audit_ledger.json filed its verdicts
against, and that no citation reaches the file without a status.

Usage: python3 verify_violations_csv.py
Exit status is 1 if any check fails, so it can gate a publish step.
"""
import csv
import json
import os
import random
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(ROOT, "egp_violations_by_tender.csv")
SEP = " || "
NUM = re.compile(r"-?[\d,]*\.?\d+")

fails = []
notes = []


def check(ok, label, detail=""):
    (notes if ok else fails).append(
        "%s %s%s" % ("ok  " if ok else "FAIL", label, ("  — " + detail) if detail else ""))
    return ok


def jload(name):
    with open(os.path.join(ROOT, name), encoding="utf-8") as fh:
        return json.load(fh)


def unnumber(cell):
    """'[1] a || [2] b' -> ['a', 'b']; blank -> []."""
    if not cell:
        return []
    return [re.sub(r"^\[\d+\]\s*", "", p) for p in cell.split(SEP)]


def digits(s):
    """The number in a string, ignoring thousands separators and decimals."""
    m = NUM.search(s or "")
    if not m:
        return None
    try:
        return int(round(float(m.group(0).replace(",", ""))))
    except ValueError:
        return None


rows = list(csv.DictReader(open(CSV_PATH, encoding="utf-8-sig")))
cache = jload("pdf_text_cache.json")
manifest = jload("pdf_manifest.json")
ledger = jload("audit_ledger.json").get("logs", {})
engine = jload("engine_flags.json")

# tender id -> every pdf text the repo holds for it, joined
by_tid = {}
for d, names in manifest["dirs"].items():
    for nm in names:
        m = re.search(r"(\d{5,8})", nm)
        if m and cache.get(nm):
            by_tid.setdefault(m.group(1), []).append((nm, cache[nm]))

print("rows in csv : %d" % len(rows))
print("tenders with pdf text : %d" % len(by_tid))

# ---------------------------------------------------------------- structure
# The thirteen columns that carry one "[n] ..." entry per flag. Index n has to
# mean the same flag in all of them, or a reader lines up a rule with the wrong
# clause.
LIST_COLS = ["Rules_Broken_BN", "Rules_Broken_EN", "Why_Flagged_Condition_EN",
             "Why_Flagged_Condition_BN", "Evidence_From_Document",
             "Rule_Organisation", "Rule_Document", "Clause_As_Flagged",
             "Clause_Verified", "Citation_Status", "Binding_Status",
             "Verbatim_Rule_Text", "Counter_Argument"]
absent = [c for c in LIST_COLS if c not in rows[0]]
check(not absent, "all thirteen numbered list columns are present", str(absent))
LIST_COLS = [c for c in LIST_COLS if c in rows[0]]
ragged = []
for r in rows:
    lens = {c: len(unnumber(r[c])) for c in LIST_COLS}
    n = lens.get("Rules_Broken_EN", 0) or max(lens.values())
    off = {c: v for c, v in lens.items() if v not in (0, n)}
    if off:
        ragged.append((r["Tender_ID"], n, off))
check(not ragged, "numbered list columns stay in step",
      "" if not ragged else "%d ragged rows, e.g. %s" % (len(ragged), ragged[:2]))

# engine flags must come first, in the engine's own order, or the ledger's
# verdict indices land on the wrong flag
misordered = []
for r in rows:
    eng = engine.get(r["Tender_ID"])
    if not eng:
        continue
    want = [f["flag"] for f in eng["findings"]]
    got = unnumber(r["Rules_Broken_BN"])[:len(want)]
    if got != want:
        misordered.append(r["Tender_ID"])
check(not misordered, "engine flags keep their ledger index",
      "" if not misordered else "%d rows drift, e.g. %s" % (len(misordered), misordered[:3]))

unlabelled = [(r["Tender_ID"], i)
              for r in rows
              for i, s in enumerate(unnumber(r["Citation_Status"]))
              if not s.strip()]
check(not unlabelled, "every citation carries a status",
      "" if not unlabelled else "%d blank, e.g. %s" % (len(unlabelled), unlabelled[:3]))

blank_rule = [r["Tender_ID"] for r in rows
              if any(not s.strip() for s in unnumber(r["Rules_Broken_EN"]))]
check(not blank_rule, "every flag names a rule in English")

# Bengali is the reader-facing half of a bilingual file; a missing half is a
# silent gap, not a formatting nit
blank_bn = [r["Tender_ID"] for r in rows
            if len(unnumber(r["Rules_Broken_BN"])) != len(unnumber(r["Rules_Broken_EN"]))]
check(not blank_bn, "English and Bengali flag lists are the same length")

# ------------------------------------------------------- values vs pdf text
random.seed(20260831)
awarded = [r for r in rows if r["Contract_Value_BDT"] and r["Tender_ID"] in by_tid]
sample = random.sample(awarded, min(60, len(awarded)))

miss_val, miss_sup, miss_noa, checked = [], [], [], 0
for r in sample:
    text = " ".join(t for _, t in by_tid[r["Tender_ID"]])
    flat = re.sub(r"\s+", " ", text)
    checked += 1

    # The notice prints three decimals (929999504.713); the CSV keeps two. Match
    # on the taka part plus the two decimals the CSV kept, both with and without
    # thousands separators, so a genuine mismatch still shows up.
    raw = (r["Contract_Value_BDT"] or "").strip()
    if raw:
        try:
            f = float(raw.replace(",", ""))
        except ValueError:
            f = None
        if f is not None:
            plain = "%.2f" % f
            forms = [plain, "{:,.2f}".format(f), plain.split(".")[0],
                     "{:,}".format(int(f))]
            if not any(s in flat for s in forms):
                miss_val.append((r["Tender_ID"], raw))

    sup = (r["Supplier_Name"] or "").strip()
    if sup and sup.split("(")[0].strip()[:24] not in flat:
        miss_sup.append((r["Tender_ID"], sup[:40]))

    noa = (r["NOA_Date"] or "").strip()
    if noa:
        parts = re.findall(r"\d{1,2}|[A-Za-z]{3,}", noa)
        if parts and not all(p in flat for p in parts[:2]):
            miss_noa.append((r["Tender_ID"], noa))

check(not miss_val, "contract value appears in the tender's own pdf (%d sampled)" % checked,
      "" if not miss_val else "%d not found, e.g. %s" % (len(miss_val), miss_val[:3]))
check(not miss_sup, "supplier name appears in the tender's own pdf",
      "" if not miss_sup else "%d not found, e.g. %s" % (len(miss_sup), miss_sup[:3]))
check(not miss_noa, "notification-of-award date appears in the pdf",
      "" if not miss_noa else "%d not found, e.g. %s" % (len(miss_noa), miss_noa[:3]))

# ------------------------------------------------- absence claims are absences
NOTICE = "Tender marked contract-awarded but no contract-award notice published"
wrong_absence = []
for r in rows:
    if NOTICE not in r["Rules_Broken_EN"]:
        continue
    # claiming the notice does not exist, so nothing in the folder may look like
    # an award notice for this tender
    for nm, t in by_tid.get(r["Tender_ID"], []):
        if re.search(r"contract\s*award(ed)?\s*(notice)?", t, re.I) and \
           re.search(r"Contract\s*Value|Awarded\s*(to|Contract)", t, re.I):
            wrong_absence.append((r["Tender_ID"], nm))
check(not wrong_absence, "'no award notice' rows really have no award notice",
      "" if not wrong_absence else "%d have one, e.g. %s" % (len(wrong_absence), wrong_absence[:3]))

BO = "Beneficial ownership not disclosed"
bo_bad = [r["Tender_ID"] for r in rows
          if BO in r["Rules_Broken_EN"]
          and ((r["Beneficial_Owner"] or "").strip()
               or (digits(r["Contract_Value_BDT"]) or 0) <= 1_000_000)]
check(not bo_bad, "ownership flags are all above the floor and all blank",
      "" if not bo_bad else "%d bad, e.g. %s" % (len(bo_bad), bo_bad[:3]))

BRAND = "Brand-locked specification"
brand_rows = [r for r in rows if BRAND in r["Rules_Broken_EN"]]
brand_bad = []
for r in brand_rows:
    text = " ".join(t for _, t in by_tid.get(r["Tender_ID"], []))
    if re.search(r"or\s+equivalent", text, re.I):
        brand_bad.append(r["Tender_ID"])
check(not brand_bad, "brand-lock flags have no 'or equivalent' in the pdf (%d rows)"
      % len(brand_rows),
      "" if not brand_bad else "%d do, e.g. %s" % (len(brand_bad), brand_bad[:3]))

EST = "No engineer's estimate"
est_bad = [r["Tender_ID"] for r in rows
           if EST in r["Rules_Broken_EN"] and (r["Estimated_Cost_BDT"] or "").strip()]
check(not est_bad, "no-estimate flags all have a blank estimate column")

# ------------------------------------------------------------- arithmetic
band_bad = []
for r in rows:
    lim, over, gap = (r["Legal_Signing_Limit_Days"], r["Days_Over_Legal_Limit"],
                      r["Days_NOA_To_Signing"])
    if lim and over and gap:
        if int(over) != int(gap) - int(lim):
            band_bad.append(r["Tender_ID"])
check(not band_bad, "days-over equals gap minus band limit",
      "" if not band_bad else "%d rows, e.g. %s" % (len(band_bad), band_bad[:3]))

share = sum(float(r["Share_of_All_Award_Value_pct"] or 0) for r in rows)
check(abs(share - 100) < 0.5, "award-value shares sum to 100%%",
      "sum = %.2f" % share)

cr_bad = []
for r in rows:
    v, c = digits(r["Contract_Value_BDT"]), r["Contract_Value_Crore"]
    if v and c and abs(float(c) - v / 1e7) > 0.05:
        cr_bad.append(r["Tender_ID"])
check(not cr_bad, "crore column matches the taka column")

# ----------------------------------------------------- ledger cross-check
led_bad = []
for tid, entries in ledger.items():
    r = next((x for x in rows if x["Tender_ID"] == tid), None)
    if not r:
        continue
    bn = unnumber(r["Rules_Broken_BN"])
    for key in entries:
        m = re.search(r"(\d+)$", str(key))
        if not m:
            continue
        i = int(m.group(1))
        if i >= len(bn):
            led_bad.append((tid, key))
check(not led_bad, "every ledger verdict lands on a flag that exists (%d tenders judged)"
      % len(ledger),
      "" if not led_bad else "%d dangle, e.g. %s" % (len(led_bad), led_bad[:3]))

# ----------------------------------------------------------------- report
print()
for line in notes:
    print("  " + line)
for line in fails:
    print("  " + line)
print("\n%d checks, %d failed" % (len(notes) + len(fails), len(fails)))
sys.exit(1 if fails else 0)
