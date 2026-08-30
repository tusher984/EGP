#!/usr/bin/env python3
"""Verify the published figures against the government's own source PDFs.

verify_figures.py already proves article_data.json is a faithful recomputation of
Procurement_Database.json. That leaves the one link nobody had checked: whether
the register itself matches the 1,800 notices it was scraped from. This reads
every PDF in `Tender Notice_PDFs/` and `Contract_Awards_PDFs/` with no
third-party library, pulls the fields the analysis depends on straight out of the
portal's own printed text, and diffs them against the register field by field —
then recomputes all five findings from the PDF text alone.

    python3 verify_pdfs.py                  # full report
    python3 verify_pdfs.py --json out.json  # also dump the extracted ground truth
"""
import argparse
import collections
import glob
import json
import os
import re
import statistics
import sys
from datetime import datetime

import pdf_text
from verify_figures import off_block

AWARD_DIR = "Contract_Awards_PDFs"
NOTICE_DIR = "Tender Notice_PDFs"
DB = "Procurement_Database.json"
ART = "article_data.json"
STORY = "story.html"
DERIVED = "pdf_derived.json"


def lab(s):
    """Label -> tolerant regex: the portal wraps labels mid-phrase."""
    return re.escape(s).replace("\\ ", r"\s*").replace(" ", r"\s*")


#  (key, label as printed)  in document order
AWARD_FIELDS = [
    ("ministry", "Ministry/Division"), ("org", "Agency"),
    ("pe", "Procuring Entity Name"), ("pe_code", "Procuring Entity Code"),
    ("district", "Procuring Entity District"), ("award_for", "Contract Award for"),
    ("id", "Tender/Proposal ID"), ("ref", "Invitation/Proposal Reference No."),
    ("method", "Procurement Method"), ("funds", "Budget and Source of Funds"),
    ("partner", "Development Partner (if applicable)"),
    ("project", "Project/Programme Name (if applicable)"),
    ("pkg_no", "Tender/Proposal Package No."),
    ("pkg_name", "Tender/Proposal Package Name"),
    ("advertised", "Date of Advertisement"),
    ("noa", "Date of Notification of Award"),
    ("signed", "Date of Contract Signing"),
    ("start", "Proposed Date of Contract Start"),
    ("finish", "Proposed Date of Contract Completion"),
    ("sold", "No. of Tenders/Proposals Sold"),
    ("received", "No. of Tenders/Proposals Received"),
    ("responsive", "Tenders/Proposals Responsive"),
    ("contract_no", "Contract No"),
    ("desc", "Brief Description of Contract"),
    ("value", "Contract Value (Taka)"),
    ("supplier", "Name of Supplier/Contractor/Consultant"),
    ("sup_loc", "Location of Supplier/Contractor/Consultant"),
    # The portal switched award-notice templates during the period. The newer
    # one (54 of the 645 awards) names the winner "Economic Operator", adds a
    # beneficial-ownership block, and — importantly — prints no bid counts and
    # no contract number at all.
    ("tenderer_id", "Tenderer ID of the Economic Operator (If any)"),
    ("supplier_eo", "Name of the Economic Operator "
                    "(Supplier/Contractor/Service Provider/Consultant)"),
    ("bo_info", "Beneficial Ownership Information"),
    ("sup_loc_eo", "Business Address of the Economic Operator"),
    ("work_loc", "Location of Delivery/Works/Consultancy"),
    ("perf_sec", "Was the Performance Security provided in due time?"),
    ("signed_ontime", "Was the Contract Singed in due time?"),
    ("officer", "Name of Authorised Officer"),
    ("officer_desig", "Designation of Authorised Officer"),
]

NOTICE_FIELDS = [
    ("ministry", "Ministry"), ("division", "Division"),
    ("org", "Organization"), ("pe", "Procuring Entity Name"),
    ("pe_code", "Procuring Entity Code"),
    ("district", "Procuring Entity District"),
    ("nature", "Procurement Nature"), ("ptype", "Procurement Type"),
    ("event", "Event Type"), ("inv_for", "Invitation for"),
    ("ref", "Invitation Reference No."),
    ("status", "Tender/Proposal Status"), ("app_id", "App ID"),
    ("id", "Tender/Proposal ID"), ("method", "Procurement Method"),
    ("budget", "Budget Type"), ("funds", "Source of Funds"),
    ("project_code", "Project Code"), ("project", "Project Name"),
    ("pkg", "Tender/Proposal Package No. and Description"),
    ("category", "Category"),
    ("published", "Scheduled Tender/Proposal Publication Date and Time"),
    ("last_sell", "Tender/Proposal Document last selling / downloading Date and Time"),
    ("closing", "Tender/Proposal Closing Date and Time"),
    ("opening", "Tender/Proposal Opening Date and Time"),
    ("desc", "Brief Description of Works"),
    ("eval_type", "Evaluation Type"),
    ("doc_avail", "Document Available"), ("doc_fees", "Document Fees"),
    ("doc_price", "Tender/Proposal Document Price (In BDT)"),
    ("payment", "Mode of Payment"),
    ("inviting", "Name of Official Inviting Tender/Proposal"),
    ("inviting_desig", "Designation of Official Inviting Tender/Proposal"),
]


def parse(text, fields):
    """Slice `Label : value` pairs out of one notice.

    Values are taken as everything between a label's colon and the start of the
    next label that actually appears, which is what makes wrapped multi-line
    values (package names, addresses) come back whole.
    """
    flat = re.sub(r"\s+", " ", text)
    hits = []
    for key, label in fields:
        m = re.search(lab(label) + r"\s*:", flat)
        if m:
            hits.append((m.start(), m.end(), key))
    hits.sort()
    out = {}
    for i, (_s, e, key) in enumerate(hits):
        end = hits[i + 1][0] if i + 1 < len(hits) else len(flat)
        out[key] = flat[e:end].strip()
    return out


NUM = re.compile(r"-?[\d,]*\.?\d+")


def num(v):
    """First number in a field, or None. '104498747.100' -> 104498747.1"""
    if v is None:
        return None
    m = NUM.search(str(v).replace(",", ""))
    return float(m.group(0)) if m else None


def date(v):
    """A date out of either dialect: the PDFs print '08-Oct-2024', the register
    stores '2024-10-08 00:00'. Returns a date, or None."""
    if not v:
        return None
    s = str(v)
    m = re.search(r"(\d{1,2})-([A-Za-z]{3})-(\d{4})", s)
    if m:
        try:
            return datetime.strptime("-".join(m.groups()), "%d-%b-%Y").date()
        except ValueError:
            return None
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        try:
            return datetime.strptime(m.group(0), "%Y-%m-%d").date()
        except ValueError:
            return None
    return None


def norm(s):
    """Register-style name normalisation, as documented in the methodology."""
    s = (s or "").upper().replace("&", " AND ")
    s = re.sub(r"^M/?S\.?\s+", "", s)
    s = re.sub(r"\b(LTD|LIMITED|PVT|PRIVATE|CO)\b", " ", s)
    s = re.sub(r"[^A-Z0-9]+", " ", s)
    return " ".join(s.split())


def pnorm(s):
    """Officer-name normalisation, the other half of the published method note:
    lower-cased, punctuation dropped, whitespace collapsed, so "Md. Anwar
    Hossain" and "Md Anwar Hossain" are one official. Without it the PDF side
    counts spellings (79) where the article counts people (73), and every
    officer-level figure looks like a disagreement when it is not."""
    return " ".join(re.sub(r"[^a-z0-9ঀ-৿ ]+", " ", (s or "").lower()).split())


def scan(directory, fields, tag):
    """Every PDF in a folder -> {tender id: parsed fields}."""
    rows, broken, idmismatch = {}, [], []
    files = sorted(glob.glob(os.path.join(glob.escape(directory), "*.pdf")))
    for path in files:
        base = os.path.basename(path)
        fid = re.search(r"(\d+)\.pdf$", base)
        try:
            text = pdf_text.extract(path)
        except Exception as exc:                                  # noqa: BLE001
            broken.append((base, "unreadable: %s" % exc))
            continue
        if len(text) < 200:
            why = ("the portal refused the record: %r"
                   % " ".join(text.split())[45:140]) \
                if "not exists" in text or "un-authorized" in text \
                else "blank print (%d chars)" % len(text)
            broken.append((base, why))
            continue
        rec = parse(text, fields)
        rec["_file"] = base
        rec["_chars"] = len(text)
        # Coalesce the two award-notice templates onto one set of keys, and
        # record which template the page used.
        if rec.get("supplier_eo") and not rec.get("supplier"):
            rec["supplier"] = re.split(r"\s*Company\s*Name\s*:", rec["supplier_eo"])[0]
            rec["_template"] = "economic-operator"
        elif "supplier" in rec:
            rec["_template"] = "supplier"
        if rec.get("sup_loc_eo") and not rec.get("sup_loc"):
            rec["sup_loc"] = rec["sup_loc_eo"]
        # first number only: the id slice can run on into a following package table
        pm = re.search(r"\d+", rec.get("id", "") or "")
        pid = pm.group(0) if pm else ""
        if fid and pid and fid.group(1) != pid:
            idmismatch.append((base, pid))
        key = pid or (fid.group(1) if fid else base)
        if key in rows:
            rows[key].setdefault("_dupes", []).append(base)
        else:
            rows[key] = rec
    print("  %-22s %4d files -> %4d tender ids  (%d unreadable, %d id mismatch)"
          % (tag, len(files), len(rows), len(broken), len(idmismatch)))
    return rows, broken, idmismatch


#  register field  <-  award-PDF field, and how to compare the two
COMPARE = [
    ("Organization_Agency", "org", "text"),
    ("Procuring_Entity_Name", "pe", "text"),
    ("Procurement_Entity_District", "district", "text"),
    ("Notification_of_Award_Date", "noa", "date"),
    ("Contract_Signing_Date", "signed", "date"),
    ("Tenders_Sold", "sold", "num"),
    ("Tenders_Received", "received", "num"),
    ("Responsive_Tenders", "responsive", "num"),
    ("Contract_Value_BDT", "value", "money"),
    ("Supplier_Name", "supplier", "name"),
    ("Authorised_Officer", "officer", "name"),
    ("Authorised_Officer_Designation", "officer_desig", "text"),
    ("Contract_No", "contract_no", "text"),
]


def agree(kind, dbv, pdfv):
    """Compare one field. Returns None (register blank), True, False, or
    'trunc' — the register's value is a leading slice of the PDF's, which is a
    storage limit in the scrape rather than a different value."""
    empty = dbv in (None, "", " ") or (isinstance(dbv, str) and not dbv.strip())
    if kind in ("num", "money"):
        a, b = num(dbv), num(pdfv)
        if a is None:
            return None
        if b is None:
            return False
        return abs(a - b) <= (max(1.0, abs(a) * 1e-6) if kind == "money" else 0)
    if kind == "date":
        a, b = date(dbv), date(pdfv)
        return None if a is None else a == b
    if empty:
        return None
    a = " ".join(str(dbv).split())
    b = " ".join(str(pdfv or "").split())
    if kind == "name":
        if norm(a) == norm(b):
            return True
        return "trunc" if b and norm(b).startswith(norm(a)) and len(a) > 12 else False
    if a.casefold() == b.casefold():
        return True
    return "trunc" if b and b.casefold().startswith(a.casefold()) and len(a) > 8 \
        else False


def crosscheck(recs, awards, notices):
    """Register vs PDF, field by field."""
    blank = {"checked": 0, "agree": 0, "trunc": 0, "blank": 0, "bad": []}
    stats = collections.OrderedDict(
        (f, dict(blank, bad=[])) for f, _, _ in COMPARE)
    stats["Document_Price_BDT"] = dict(blank, bad=[])

    def one(store, kind, dbv, pdfv, tid):
        v = agree(kind, dbv, pdfv)
        if v is None:
            store["blank"] += 1
            return
        store["checked"] += 1
        if v is True:
            store["agree"] += 1
        elif v == "trunc":
            store["trunc"] += 1
        elif len(store["bad"]) < 40:
            store["bad"].append((tid, dbv, pdfv))

    for r in recs:
        tid = str(r.get("Tender_Proposal_ID") or "").strip()
        pdf = awards.get(tid)
        if pdf:
            for field, pkey, kind in COMPARE:
                one(stats[field], kind, r.get(field), pdf.get(pkey), tid)
        n = notices.get(tid)
        if n:
            one(stats["Document_Price_BDT"], "num",
                r.get("Document_Price_BDT"), n.get("doc_price"), tid)
    return stats


def provenance(recs, awards, notices, afields, nfields):
    """Which PDF field does each register column actually track?

    A mis-mapped scrape looks fine in isolation — the column is populated and
    plausibly typed. It only shows up when every register column is scored
    against every field on the page it came from, which is what this does.
    """
    pairs = [(awards, [k for k, _ in afields]), (notices, [k for k, _ in nfields])]
    cols = [c for c in recs[0].keys() if not c.startswith("_")]
    best = {}
    for col in cols:
        scores = []
        for src, keys in pairs:
            for key in keys:
                hit = tot = 0
                for r in recs:
                    tid = str(r.get("Tender_Proposal_ID") or "").strip()
                    p = src.get(tid)
                    if not p:
                        continue
                    a = str(r.get(col) or "").strip()
                    if not a:
                        continue
                    b = str(p.get(key) or "").strip()
                    if not b:
                        continue
                    tot += 1
                    an, bn = num(a), num(b)
                    if an is not None and bn is not None and abs(an - bn) < 1e-6:
                        hit += 1
                    elif " ".join(a.split()).casefold() == \
                            " ".join(b.split()).casefold():
                        hit += 1
                    elif len(a) > 8 and b.casefold().startswith(a.casefold()):
                        hit += 1
                if tot >= 30:
                    scores.append((hit / tot, key, tot))
        if scores:
            scores.sort(reverse=True)
            best[col] = scores[0]
    return best


def findings(awards, notices):
    """Recompute every published claim from the PDF text alone."""
    rows = []
    for tid, a in awards.items():
        rows.append({
            "id": tid, "org": a.get("org", ""), "pe": a.get("pe", ""),
            "sup": a.get("supplier", ""), "off": a.get("officer", ""),
            "val": num(a.get("value")), "recv": num(a.get("received")),
            "resp": num(a.get("responsive")), "sold": num(a.get("sold")),
            "noa": date(a.get("noa")), "sign": date(a.get("signed")),
        })
    valued = [r for r in rows if r["val"]]
    total = sum(r["val"] for r in valued)
    f = {"awards": len(rows), "with_value": len(valued),
         "value_crore": round(total / 1e7, 1),
         "suppliers_as_filed": len({r["sup"].strip() for r in valued if r["sup"]}),
         "suppliers_merged": len({norm(r["sup"]) for r in valued if r["sup"]}),
         "officers": len({pnorm(r["off"]) for r in rows if r["off"].strip()}),
         "officers_as_filed": len({r["off"].strip() for r in rows if r["off"].strip()}),
         "orgs": len({r["org"].strip() for r in rows if r["org"].strip()}),
         "pes": len({r["pe"].strip() for r in rows if r["pe"].strip()})}

    by_sup = collections.Counter()
    for r in valued:
        by_sup[norm(r["sup"])] += r["val"]
    ranked = by_sup.most_common()
    f["top1"] = round(ranked[0][1] / total * 100, 1)
    f["top1_crore"] = round(ranked[0][1] / 1e7, 2)
    f["top1_name"] = max((r["sup"] for r in valued
                          if norm(r["sup"]) == ranked[0][0]), key=len)
    f["top4"] = round(sum(v for _, v in ranked[:4]) / total * 100, 1)
    f["top10"] = round(sum(v for _, v in ranked[:10]) / total * 100, 1)
    f["hhi"] = round(sum((v / total * 100) ** 2 for _, v in ranked), 1)
    # The published HHI sits beside "310 contractors", i.e. it is computed on
    # names as filed, not on the 308 merged firms. Same definition here, or the
    # two disagree by 0.1 for no reason.
    as_filed = collections.Counter()
    for r in valued:
        if r["sup"].strip():
            as_filed[r["sup"].strip()] += r["val"]
    ft = sum(as_filed.values())
    f["hhi_as_filed"] = round(sum((v / ft * 100) ** 2 for v in as_filed.values()), 1)

    lags = [(r["sign"] - r["noa"]).days for r in rows if r["noa"] and r["sign"]]
    f["lags"] = len(lags)
    f["median_lag"] = int(statistics.median(lags)) if lags else None
    f["day28"] = sum(1 for d in lags if d == 28)
    f["day28_pct"] = round(f["day28"] / len(lags) * 100, 1) if lags else None
    f["after28"] = sum(1 for d in lags if d > 28)
    f["max_lag"] = max(lags) if lags else None
    f["days_29_37"] = sum(1 for d in lags if 29 <= d <= 37)
    f["window_24_28"] = sum(1 for d in lags if 24 <= d <= 28)

    withbids = [r for r in rows if r["resp"] is not None]
    f["with_bid_data"] = len(withbids)
    f["single_resp"] = sum(1 for r in withbids if r["resp"] == 1)
    f["single_resp_pct"] = round(f["single_resp"] / len(withbids) * 100, 1)
    f["contested_single"] = sum(1 for r in withbids if r["resp"] == 1 and
                                ((r["recv"] or 0) > 1 or (r["sold"] or 0) > 1))
    f["contested_single_pct"] = round(f["contested_single"] / len(withbids) * 100, 1)
    f["elim3"] = sum(1 for r in withbids if r["resp"] == 1 and (r["recv"] or 0) >= 3)
    f["elim5"] = sum(1 for r in withbids if r["resp"] == 1 and (r["recv"] or 0) >= 5)

    pe_pairs = collections.Counter((norm(r["sup"]), r["pe"].strip())
                                   for r in valued if r["sup"] and r["pe"].strip())
    f["pairs_pe_ge2"] = sum(1 for n in pe_pairs.values() if n >= 2)
    f["pairs_pe_ge3"] = sum(1 for n in pe_pairs.values() if n >= 3)
    f["pairs_pe_max"] = max(pe_pairs.values()) if pe_pairs else 0
    off_pairs = collections.Counter((norm(r["sup"]), pnorm(r["off"]))
                                    for r in valued if r["sup"] and r["off"].strip())
    f["pairs_off_ge2"] = sum(1 for n in off_pairs.values() if n >= 2)
    f["pairs_off_ge3"] = sum(1 for n in off_pairs.values() if n >= 3)

    cap = []
    byoff = collections.defaultdict(list)
    for r in valued:
        if r["off"].strip():
            byoff[pnorm(r["off"])].append(r)
    for off, rs in byoff.items():
        if len(rs) < 2:
            continue
        tot = sum(x["val"] for x in rs)
        top = collections.Counter()
        for x in rs:
            top[norm(x["sup"])] += x["val"]
        name, share = top.most_common(1)[0]
        cap.append((max((x["off"].strip() for x in rs), key=len),
                    len(rs), round(tot / 1e7, 1),
                    round(share / tot * 100), max((x["sup"] for x in rs
                          if norm(x["sup"]) == name), key=len)))
    f["officer_capture"] = sorted(cap, key=lambda c: (-c[3], -c[2]))[:12]

    # The register's Document_Price_BDT column is unusable (it stores the
    # day-of-month of Security_Valid_Up_To), so the price is taken off the
    # notice PDFs. Keep the per-tender table: it is what lets verify_figures.py
    # recompute the published aggregate instead of trusting it.
    by_id = {}
    for tid, n in notices.items():
        p = num(n.get("doc_price"))
        if p is not None:
            by_id[tid] = p
    f["doc_price_by_id"] = by_id
    prices = sorted(by_id.values())
    f["doc_prices"] = len(prices)
    f["doc_price_min"] = min(prices) if prices else None
    f["doc_price_median"] = statistics.median(prices) if prices else None
    f["doc_price_max"] = max(prices) if prices else None
    f["doc_price_mean"] = round(statistics.fmean(prices), 1) if prices else None
    f["doc_price_distinct"] = len(set(prices))
    f["doc_price_zero"] = sum(1 for p in prices if p == 0)
    f["doc_price_mode"] = f["doc_price_mode_n"] = None
    if prices:
        mode, mode_n = collections.Counter(prices).most_common(1)[0]
        f["doc_price_mode"], f["doc_price_mode_n"] = mode, mode_n
    f["doc_price_hist"] = [
        ["≤1k", sum(1 for p in prices if p <= 1000)],
        ["1–2k", sum(1 for p in prices if 1000 < p <= 2000)],
        ["2–5k", sum(1 for p in prices if 2000 < p <= 5000)],
        ["5–10k", sum(1 for p in prices if 5000 < p <= 10000)],
        ["10k+", sum(1 for p in prices if p > 10000)],
    ]
    f["doc_price_top"] = collections.Counter(prices).most_common(10)
    f["_rows"] = rows
    return f


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", help="also write the extracted PDF fields here")
    args = ap.parse_args()

    print("READING THE SOURCE PDFs (no third-party library)")
    awards, abroken, amis = scan(AWARD_DIR, AWARD_FIELDS, "contract awards")
    notices, nbroken, nmis = scan(NOTICE_DIR, NOTICE_FIELDS, "tender notices")

    recs = json.load(open(DB, encoding="utf-8"))
    art = json.load(open(ART, encoding="utf-8"))
    ids = {str(r.get("Tender_Proposal_ID") or "").strip() for r in recs}

    print("\nCOVERAGE")
    print("  register records                 %d" % len(recs))
    real = [r for r in recs if str(r.get("Tender_Proposal_ID") or "").strip()]
    print("  of those, carrying a tender id   %d" % len(real))
    print("  distinct tender ids              %d" %
          len({str(r["Tender_Proposal_ID"]).strip() for r in real}))
    empty = [r for r in recs if not str(r.get("Tender_Proposal_ID") or "").strip()]
    if empty:
        print("  EMPTY rows (no tender at all)    %d  %s" %
              (len(empty), [r.get("Source_File") for r in empty]))
    print("  award PDFs matched to a record   %d / %d" %
          (len(set(awards) & ids), len(awards)))
    print("  notice PDFs matched to a record  %d / %d" %
          (len(set(notices) & ids), len(notices)))
    orphan_a = sorted(set(awards) - ids)
    orphan_n = sorted(set(notices) - ids)
    no_notice = sorted(ids - set(notices))
    if orphan_a:
        print("  award PDFs with no register row  %d  %s" %
              (len(orphan_a), orphan_a[:6]))
    if orphan_n:
        print("  notice PDFs with no register row %d  %s" %
              (len(orphan_n), orphan_n[:6]))
    if no_notice:
        print("  register rows with no notice PDF %d  %s" %
              (len(no_notice), no_notice[:6]))
    for label, bad in (("award", abroken), ("notice", nbroken)):
        if bad:
            print("  %s PDFs carrying no tender data: %d" % (label, len(bad)))
            for name, why in bad:
                print("      %-28s %s" % (name, why))
    for label, bad in (("award", amis), ("notice", nmis)):
        if bad:
            print("  filename/content id mismatch (%s): %d  %s"
                  % (label, len(bad), bad[:4]))

    print("\nWHY 54 AWARDS CARRY NO BID COUNTS")
    tmpl = collections.Counter(a.get("_template") for a in awards.values())
    print("  award-notice template in use      %s" % dict(tmpl))
    eo = {t for t, a in awards.items() if a.get("_template") == "economic-operator"}
    nobid = {str(r.get("Tender_Proposal_ID") or "").strip() for r in recs
             if str(r.get("Contract_Value_BDT") or "").strip()
             and not str(r.get("Tenders_Received") or "").strip()}
    print("  awarded rows with no bid count    %d" % len(nobid))
    print("  those rows on the newer template  %d / %d" % (len(nobid & eo), len(eo)))
    print("  newer-template PDFs printing any bid count: %d"
          % sum(1 for t in eo if any(awards[t].get(k) for k in
                                     ("sold", "received", "responsive"))))

    print("\nFIELD-BY-FIELD: REGISTER vs THE PDF IT CAME FROM")
    print("  (trunc = the register stored a leading slice of the PDF's value)")
    stats = crosscheck(recs, awards, notices)
    worst = []
    for field, s in stats.items():
        if not s["checked"]:
            print("  %-32s   (no populated values to check)" % field)
            continue
        good = s["agree"] + s["trunc"]
        pct = good / s["checked"] * 100
        flag = "OK  " if pct == 100 else ("WARN" if pct >= 99 else "FAIL")
        print("  %-32s %s %6.2f%%  %d/%d agree  %d truncated  (%d blank)"
              % (field, flag, pct, s["agree"], s["checked"], s["trunc"], s["blank"]))
        if pct < 100:
            worst.append((field, s))
    for field, s in worst:
        print("\n  first real disagreements on %s:" % field)
        for tid, a, b in s["bad"][:6]:
            print("    #%s\n      register %r\n      pdf      %r"
                  % (tid, str(a), str(b)))

    print("\nCOLUMN PROVENANCE: which PDF field each register column tracks")
    print("  (a column whose best match is a different field is mis-mapped)")
    prov = provenance(recs, awards, notices, AWARD_FIELDS, NOTICE_FIELDS)
    expect = {f: p for f, p, _ in COMPARE}
    expect["Document_Price_BDT"] = "doc_price"
    for col, (score, key, tot) in sorted(prov.items(), key=lambda kv: kv[1][0]):
        want = expect.get(col)
        if score >= 0.99 and want in (None, key):
            continue
        note = ""
        if want and want != key:
            note = "  <-- expected %s" % want
        elif want == key and score < 0.99:
            note = "  <-- partial"
        print("  %-32s %5.1f%% -> %-24s (n=%d)%s"
              % (col, score * 100, key, tot, note))

    print("\nFINDINGS RECOMPUTED FROM THE PDF TEXT ALONE")
    f = findings(awards, notices)
    h, c, cl, e = art["headline"], art["concentration"], art["cliff"], art["elimination"]
    dl = art["delay"]
    # The officer-level constants live in story.html's OFF block rather than in
    # article_data.json, so they are read back out of the page instead of being
    # repeated here — a constant typed twice is a constant that drifts.
    OFF = off_block(open(STORY, encoding="utf-8").read())
    checks = [
        ("tenders (rows carrying a tender id)", len(real), h["tenders"]),
        ("awarded contracts", f["awards"], h["awarded"]),
        ("total award value (crore)", f["value_crore"], h["value_crore"]),
        ("contractors, as filed", f["suppliers_as_filed"], h["suppliers"]),
        ("contractors, variants merged", f["suppliers_merged"], OFF["n_suppliers_dedup"]),
        ("authorising officers", f["officers"], OFF["n_officers"]),
        ("organisational units", f["orgs"], OFF["n_units"]),
        ("awards with bid data", f["with_bid_data"], h["with_bid_data"]),
        ("one responsive bid", f["single_resp"], h["single_resp"]),
        ("one-responsive share (%)", f["single_resp_pct"], h["single_resp_pct"]),
        ("contested yet single-responsive", f["contested_single"], OFF["strict_n"]),
        ("3+ received then 1 responsive", f["elim3"], e["n"]),
        ("5+ received then 1 responsive", f["elim5"], e["n5"]),
        ("largest contractor share (%)", f["top1"], c["top1_pct"]),
        ("top 10 share (%)", f["top10"], c["top10_pct"]),
        ("HHI", f["hhi_as_filed"], c["hhi"]),
        ("largest contractor (crore)", f["top1_crore"],
         art["top_by_value"][0]["crore"]),
        ("signing lags measured", f["lags"], dl["n"]),
        ("median signing lag (days)", f["median_lag"], dl["median"]),
        ("signed on day 28", f["day28"], cl["at28"]),
        ("day-28 share (%)", f["day28_pct"], cl["at28_pct"]),
        ("signed after day 28", f["after28"], dl["over28"]),
        ("longest lag (days)", f["max_lag"], dl["max"]),
        ("days 29-37 with any signing", f["days_29_37"], cl["void_n"]),
        ("signed in the day 24-28 window", f["window_24_28"], cl["win24_28"]),
        ("office-contractor pairs 2+", f["pairs_pe_ge2"], OFF["pairs_pe_ge2"]),
        ("office-contractor pairs 3+", f["pairs_pe_ge3"], OFF["pairs_pe_ge3"]),
        ("largest office-contractor pair", f["pairs_pe_max"],
         max(p["n"] for p in art["repeat_pairs"])),
        ("officer-contractor pairs 2+", f["pairs_off_ge2"], OFF["pairs_of_ge2"]),
        ("officer-contractor pairs 3+", f["pairs_off_ge3"], OFF["pairs_of_ge3"]),
        ("document prices present", f["doc_prices"], art["docprice"]["n"]),
        ("cheapest document price", f["doc_price_min"], art["docprice"]["min"]),
        ("median document price", f["doc_price_median"], art["docprice"]["median"]),
        ("mean document price", f["doc_price_mean"], art["docprice"]["mean"]),
        ("highest document price", f["doc_price_max"], art["docprice"]["max"]),
        ("commonest document price", f["doc_price_mode"], art["docprice"]["mode"]),
        ("  tenders at that price", f["doc_price_mode_n"], art["docprice"]["mode_n"]),
        ("distinct document prices", f["doc_price_distinct"], art["docprice"]["distinct"]),
    ]
    bad = 0
    for name, got, pub in checks:
        ok = (got == pub) or (isinstance(got, float) and isinstance(pub, (int, float))
                              and abs(got - pub) < 0.06)
        bad += not ok
        print("  %-4s %-34s from PDFs %-14s published %s"
              % ("PASS" if ok else "DIFF", name, got, pub))
    print("\n  largest contractor from the PDFs: %s" % f["top1_name"])
    print("\n  DOCUMENT PRICE, read from the notice PDFs themselves:")
    print("    n=%d  median=%s  mean=%s  max=%s  free(0 BDT)=%d"
          % (f["doc_prices"], f["doc_price_median"], f["doc_price_mean"],
             f["doc_price_max"], f["doc_price_zero"]))
    print("    histogram   %s" % f["doc_price_hist"])
    print("    published   %s" % [[x["bin"], x["n"]] for x in art["docprice"]["hist"]])
    print("    commonest   %s" % f["doc_price_top"])
    print("  officers whose award value concentrates on one firm (>=2 tenders):")
    for off, n, cr, share, sup in f["officer_capture"][:6]:
        print("    %-30s %2d tenders  %8.1f cr  %3d%% -> %s" % (off, n, cr, share, sup))
    print("\n%d of %d recomputed figures differ from the published value"
          % (bad, len(checks)))

    if args.json:
        f.pop("_rows", None)
        json.dump({"awards": awards, "notices": notices, "recomputed": f},
                  open(args.json, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1, default=str)
        print("wrote %s" % args.json)

    # The committed artifact. Small on purpose: only the facts that exist in the
    # PDFs and nowhere else, so verify_figures.py can check the published
    # document-price figures against a per-tender table rather than against an
    # aggregate that was computed by the same pass that published it.
    def one(rec, key):
        return " ".join((rec.get(key) or "").split())

    # How badly the register's ~40-character storage limit distorts each text
    # column: rows whose stored value is shorter than the PDF's, and — the part
    # that changes published numbers — truncated values standing for more than
    # one real name.
    trunc = {}
    for col, key in (("Procuring_Entity_Name", "pe"), ("Supplier_Name", "supplier"),
                     ("Organization_Agency", "org"),
                     ("Authorised_Officer", "officer"),
                     ("Authorised_Officer_Designation", "officer_desig")):
        seen, differ = collections.defaultdict(set), 0
        for r in recs:
            a = awards.get(str(r.get("Tender_Proposal_ID") or "").strip())
            if not a:
                continue
            rv, pv = " ".join((r.get(col) or "").split()), one(a, key)
            if not rv or not pv:
                continue
            seen[rv].add(pv)
            differ += rv != pv
        trunc[col] = {"rows": differ,
                      "conflated": {k: sorted(v) for k, v in seen.items()
                                    if len(v) > 1}}
    print("\nTHE REGISTER'S 40-CHARACTER STORAGE LIMIT")
    for col, d in trunc.items():
        print("  %-32s %3d rows cut short, %d truncated value(s) standing for "
              "more than one office" % (col, d["rows"], len(d["conflated"])))
        for k, v in d["conflated"].items():
            print("      %r  ->  %s" % (k, v))

    derived = {
        "_source": "written by verify_pdfs.py from the %d notice and %d award "
                   "PDFs in this repository; regenerate with "
                   "'python3 verify_pdfs.py'" % (len(notices), len(awards)),
        "coverage": {
            "register_rows": len(recs),
            "rows_with_tender_id": len(real),
            "distinct_tender_ids": len({str(r["Tender_Proposal_ID"]).strip()
                                        for r in real}),
            "notice_pdfs_read": len(notices),
            "award_pdfs_read": len(awards),
            "empty_rows": sorted(r.get("Source_File") or "" for r in empty),
            "withheld": [{"file": n, "why": w} for n, w in nbroken + abroken],
        },
        "award_template": dict(tmpl),
        "truncation": {
            "_note": "the register stores several text columns cut to about 40 "
                     "characters; the PDF carries the whole string. Where one "
                     "truncated value stands for more than one real name, any "
                     "figure grouped on that column merges offices that are not "
                     "the same office.",
            "columns": {col: {"rows_differing": d["rows"],
                              "keys_covering_more_than_one_name": d["conflated"]}
                        for col, d in trunc.items()},
        },
        "award_rows": [
            {"id": t,
             "org": one(a, "org"), "pe": one(a, "pe"),
             "district": one(a, "district"),
             "sup": one(a, "supplier"), "off": one(a, "officer"),
             "off_desig": one(a, "officer_desig"),
             "value": num(a.get("value")), "sold": num(a.get("sold")),
             "recv": num(a.get("received")), "resp": num(a.get("responsive")),
             "noa": str(date(a.get("noa")) or ""),
             "sign": str(date(a.get("signed")) or ""),
             "template": a.get("_template", "")}
            for t, a in sorted(awards.items())
        ],
        "doc_price": {
            "n": f["doc_prices"], "min": f["doc_price_min"],
            "median": f["doc_price_median"], "mean": f["doc_price_mean"],
            "max": f["doc_price_max"], "mode": f["doc_price_mode"],
            "mode_n": f["doc_price_mode_n"], "distinct": f["doc_price_distinct"],
            "schedule": sorted(collections.Counter(
                f["doc_price_by_id"].values()).items()),
            "by_tender": f["doc_price_by_id"],
        },
    }
    json.dump(derived, open(DERIVED, "w", encoding="utf-8"),
              ensure_ascii=False, indent=1, sort_keys=False)
    print("\nwrote %s (%d award rows, %d document prices, %d withheld PDFs)"
          % (DERIVED, len(awards), f["doc_prices"], len(nbroken) + len(abroken)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
