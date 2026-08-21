#!/usr/bin/env python3
"""
Pull "Package Estimated Cost (In BDT)" (and the rest of the APP Package Details
block) from eprocure.gov.bd for every App ID in APP_package_lookup.csv, then
compare each package's estimated cost against the contract value(s) actually
awarded under it.

WHY THIS EXISTS
---------------
The e-GP tender notice PDFs do NOT publish the package estimated cost. We
checked all 1,800 cached notices: the string never appears as a data field.
The only place the figure is public is the Annual Procurement Plan (APP)
package page. So the estimate has to be fetched separately and joined on App ID.

WHAT THE COMPARISON TESTS
-------------------------
If a contract is awarded at or extremely near the official estimate, the
estimate was not effectively secret. Two specific signatures matter:

  ratio == 1.000       contract value identical to the estimate
  0.99 <= ratio <= 1.01  contract value within 1% of the estimate

Neither is proof of anything on its own -- a well-built estimate SHOULD land
close to market price, and rates are often set from the same public schedule of
rates both sides use. What makes it evidential is (a) how often it happens,
(b) whether it clusters in particular offices or suppliers, and (c) whether it
coincides with the single-responsive-bidder and rate-band findings.

IMPORTANT -- ONE PACKAGE CAN HOLD MANY CONTRACTS
------------------------------------------------
184 of 326 packages in this dataset contain more than one tender (the largest
holds 57). The estimate is a PACKAGE figure, so contract values are summed per
App ID before comparing. Per-lot comparison would be meaningless.

CAVEAT ON THE SCRAPER ITSELF
----------------------------
The exact URL and HTML of the APP page could not be verified from the
environment this was written in (no network access to eprocure.gov.bd). The
fetch layer is therefore written to be adjusted in one place: set URL_TEMPLATE
and, if needed, extend LABELS. Run with --probe on a single App ID first, look
at the saved HTML, then adjust. The parser is label-driven, so it survives
markup changes better than positional scraping.

USAGE
-----
    pip install requests beautifulsoup4 lxml

    # 1. look at one page first and save its HTML so you can inspect it
    python3 fetch_app_estimates.py --probe 189321

    # 2. once URL_TEMPLATE/LABELS are right, fetch everything (resumable)
    python3 fetch_app_estimates.py --fetch

    # 3. join + analyse (works on whatever has been fetched so far)
    python3 fetch_app_estimates.py --analyse

Be a good citizen: DELAY is 1.5s between requests by default. This is a public
government portal; do not hammer it. Everything is resumable, so a slow run
that you stop and restart costs you nothing.
"""

import argparse
import csv
import json
import os
import re
import sys
import time

LOOKUP = "APP_package_lookup.csv"
RAW_DIR = "app_pages"           # cached HTML, one file per App ID
OUT = "app_estimates.csv"       # scraped estimates
JOINED = "app_estimate_analysis.csv"  # the comparison
DELAY = 1.5

# --- ADJUST THIS AFTER --probe -----------------------------------------------
# The APP package detail page. {app} is substituted with the App ID.
# Check the real URL by opening an APP package from the portal's APP search and
# copying the address bar. Common shapes look like:
#   https://www.eprocure.gov.bd/resources/common/ViewAppPackageDetail.jsp?appId={app}
#   https://www.eprocure.gov.bd/AppPackageDetails.jsp?id={app}
URL_TEMPLATE = "https://www.eprocure.gov.bd/resources/common/ViewAppPackageDetail.jsp?appId={app}"

# Labels to lift out of the page. Key = output column, value = list of possible
# label spellings on the page (matched case-insensitively, punctuation-loose).
LABELS = {
    "Package_Estimated_Cost_BDT": [
        "Package Estimated Cost (In BDT)",
        "Package Estimated Cost",
        "Estimated Cost (In BDT)",
        "Estimated Cost",
    ],
    "APP_Package_No": ["Package No", "Package Number"],
    "APP_Package_Description": ["Package Description", "Description"],
    "APP_Procurement_Type": ["Procurement Type"],
    "APP_Procurement_Method": ["Procurement Method"],
    "APP_Procurement_Nature": ["Procurement Nature"],
    "APP_Fiscal_Year": ["Fiscal Year", "Financial Year"],
    "APP_Entity": ["Procuring Entity Name", "Procuring Entity"],
    "APP_Organization": ["Organization"],
    "APP_Source_Of_Fund": ["Source of Fund", "Source of Funds"],
}
# ----------------------------------------------------------------------------

MONEY = re.compile(r"(-?[\d,]+(?:\.\d+)?)")


def norm(s):
    """Loose label normaliser: lowercase, strip punctuation and whitespace."""
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def money(s):
    """Pull the first number out of a cell like '1,23,45,678.00 BDT'."""
    if not s:
        return None
    m = MONEY.search(str(s).replace(" ", " "))
    if not m:
        return None
    try:
        return float(m.group(1).replace(",", ""))
    except ValueError:
        return None


def app_ids():
    if not os.path.exists(LOOKUP):
        sys.exit(f"missing {LOOKUP} -- generate it first")
    with open(LOOKUP, newline="", encoding="utf-8") as f:
        return [r["App_ID"] for r in csv.DictReader(f) if r.get("App_ID")]


def fetch_one(session, app, force=False):
    """Fetch and cache one APP page. Returns HTML text or None."""
    os.makedirs(RAW_DIR, exist_ok=True)
    path = os.path.join(RAW_DIR, f"{app}.html")
    if os.path.exists(path) and not force:
        return open(path, encoding="utf-8", errors="replace").read()
    url = URL_TEMPLATE.format(app=app)
    try:
        r = session.get(url, timeout=30)
    except Exception as e:                      # noqa: BLE001
        print(f"  ! {app}: {type(e).__name__} {e}")
        return None
    if r.status_code != 200:
        print(f"  ! {app}: HTTP {r.status_code}")
        return None
    with open(path, "w", encoding="utf-8") as f:
        f.write(r.text)
    return r.text


def parse(html):
    """
    Label-driven extraction. Handles both <td>Label</td><td>Value</td> tables
    and 'Label : Value' text runs, because e-GP pages mix the two.
    """
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "lxml")
    found = {}

    # pass 1: table cells -- value is the next cell after the label cell
    cells = soup.find_all(["td", "th"])
    text = [c.get_text(" ", strip=True) for c in cells]
    ntext = [norm(t) for t in text]
    for col, variants in LABELS.items():
        for v in variants:
            nv = norm(v)
            for i, nt in enumerate(ntext):
                # label cell may be exactly the label, or label + colon
                if nt == nv or nt == nv + ":" or nt.rstrip(":") == nv:
                    for j in (i + 1, i + 2):
                        if j < len(text) and text[j] and norm(text[j]) not in ntext[:i + 1]:
                            found.setdefault(col, text[j])
                            break
                if col in found:
                    break
            if col in found:
                break

    # pass 2: flat 'Label : Value' text, for anything pass 1 missed
    flat = soup.get_text("\n", strip=True)
    for col, variants in LABELS.items():
        if col in found:
            continue
        for v in variants:
            m = re.search(
                re.escape(v).replace(r"\ ", r"\s*") + r"\s*[:\-]\s*([^\n]{1,120})",
                flat, re.I)
            if m:
                found[col] = m.group(1).strip()
                break
    return found


def cmd_probe(app):
    import requests
    s = requests.Session()
    s.headers["User-Agent"] = "Mozilla/5.0 (research; procurement transparency)"
    print(f"GET {URL_TEMPLATE.format(app=app)}")
    html = fetch_one(s, app, force=True)
    if not html:
        print("\nFetch failed. Open the URL in a browser, copy the real address,\n"
              "and update URL_TEMPLATE at the top of this file.")
        return
    print(f"saved -> {RAW_DIR}/{app}.html  ({len(html):,} bytes)")
    got = parse(html)
    print("\nparsed fields:")
    if not got:
        print("  (nothing matched -- open the saved HTML, find the label text for\n"
              "   the estimated cost, and add it to LABELS)")
    for k, v in got.items():
        print(f"  {k:34s} = {v}")
    est = money(got.get("Package_Estimated_Cost_BDT"))
    print(f"\nestimated cost parsed as: {est}")


def cmd_fetch():
    import requests
    ids = app_ids()
    s = requests.Session()
    s.headers["User-Agent"] = "Mozilla/5.0 (research; procurement transparency)"
    rows, ok = [], 0
    for i, app in enumerate(ids, 1):
        cached = os.path.exists(os.path.join(RAW_DIR, f"{app}.html"))
        html = fetch_one(s, app)
        if html:
            got = parse(html)
            got["App_ID"] = app
            rows.append(got)
            if money(got.get("Package_Estimated_Cost_BDT")) is not None:
                ok += 1
        if not cached:
            time.sleep(DELAY)
        if i % 25 == 0 or i == len(ids):
            print(f"  {i}/{len(ids)}  estimates parsed: {ok}")
    cols = ["App_ID"] + list(LABELS.keys())
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    print(f"\nwrote {OUT}: {len(rows)} pages, {ok} with a parseable estimated cost")


def cmd_analyse():
    if not os.path.exists(OUT):
        sys.exit(f"missing {OUT} -- run --fetch first")
    est = {}
    with open(OUT, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            v = money(r.get("Package_Estimated_Cost_BDT"))
            if v and v > 0:
                est[r["App_ID"]] = (v, r)
    with open(LOOKUP, newline="", encoding="utf-8") as f:
        pkgs = list(csv.DictReader(f))

    out, exact, near1, near5, over = [], [], [], [], []
    for p in pkgs:
        aid = p["App_ID"]
        if aid not in est:
            continue
        e, meta = est[aid]
        cv = money(p.get("Contract_Value_Total_BDT")) or 0.0
        if cv <= 0:
            continue
        ratio = cv / e
        row = {
            "App_ID": aid,
            "Tender_IDs": p.get("Tender_IDs", ""),
            "Tenders_In_Package": p.get("Tenders_In_Package", ""),
            "Contracts_Awarded": p.get("Contracts_Awarded", ""),
            "Agency": p.get("Agency", ""),
            "Procuring_Entity": p.get("Procuring_Entity", ""),
            "Suppliers": p.get("Suppliers", ""),
            "Rate_Band_Clause": p.get("Rate_Band_Clause", ""),
            "Estimated_Cost_BDT": round(e, 2),
            "Contract_Value_Total_BDT": round(cv, 2),
            "Ratio_Contract_over_Estimate": round(ratio, 6),
            "Pct_Of_Estimate": round(100 * ratio, 3),
            "Diff_BDT": round(cv - e, 2),
        }
        out.append(row)
        if abs(ratio - 1) < 1e-9:
            exact.append(row)
        elif abs(ratio - 1) <= 0.01:
            near1.append(row)
        elif abs(ratio - 1) <= 0.05:
            near5.append(row)
        if ratio > 1.10:
            over.append(row)

    out.sort(key=lambda r: abs(r["Ratio_Contract_over_Estimate"] - 1))
    with open(JOINED, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(out[0].keys()) if out else ["App_ID"])
        w.writeheader()
        w.writerows(out)

    n = len(out)
    print(f"packages with BOTH an estimate and an awarded value : {n}")
    if not n:
        print("nothing to compare yet")
        return
    print(f"  contract value EXACTLY equals estimate  : {len(exact):4d}  ({100*len(exact)/n:.1f}%)")
    print(f"  within 1% of estimate                   : {len(near1):4d}  ({100*len(near1)/n:.1f}%)")
    print(f"  within 5% of estimate                   : {len(near5):4d}  ({100*len(near5)/n:.1f}%)")
    print(f"  more than 10% ABOVE estimate            : {len(over):4d}  ({100*len(over)/n:.1f}%)")
    rs = sorted(r["Ratio_Contract_over_Estimate"] for r in out)
    print(f"  median ratio                            : {rs[n//2]:.4f}")
    band = [r for r in out if r["Rate_Band_Clause"]]
    if band:
        bn = len(band)
        bexact = sum(1 for r in band if abs(r["Ratio_Contract_over_Estimate"] - 1) <= 0.01)
        print(f"\n  of the {bn} packages carrying the ±10% rate-band clause, "
              f"{bexact} ({100*bexact/bn:.0f}%) landed within 1% of the estimate")
    print(f"\n--- 15 closest to the estimate ---")
    for r in out[:15]:
        print(f"  {r['Pct_Of_Estimate']:9.3f}% of est  App {r['App_ID']:>8}  "
              f"{r['Contract_Value_Total_BDT']/1e7:8.2f} cr  {r['Suppliers'][:34]}")
    print(f"\nwrote {JOINED}")
    print("\nREMINDER: a contract landing on the estimate is a QUESTION, not a finding.\n"
          "Estimates built from the public schedule of rates legitimately predict\n"
          "market price. What is evidential is the RATE of exact matches, whether it\n"
          "concentrates in specific offices/suppliers, and whether those same packages\n"
          "are the ones that ended with a single responsive bidder.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--probe", metavar="APP_ID", help="fetch one page, save HTML, show parsed fields")
    g.add_argument("--fetch", action="store_true", help="fetch all App IDs (resumable)")
    g.add_argument("--analyse", action="store_true", help="join estimates to contract values")
    a = ap.parse_args()
    if a.probe:
        cmd_probe(a.probe)
    elif a.fetch:
        cmd_fetch()
    else:
        cmd_analyse()
