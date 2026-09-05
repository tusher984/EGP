#!/usr/bin/env python3
"""Cross-validation of the security back-out against the other estimate anchors
the corpus publishes, and the rate-invariant form of the competition gradient.

    python3 -P investigation/scripts/security_backout_crosscheck.py
"""
import json
import random
import statistics as st
from collections import defaultdict

T = "/Users/alamintusher/Documents/GitHub/EGP-CDA/site/data/tenders.json"
RAW = "/Users/alamintusher/Documents/GitHub/EGP-CDA/investigation/data/raw_pages.json"
random.seed(20260905)


def num(v):
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return f if f > 0 else None


def med(xs):
    return st.median(xs) if xs else float("nan")


def boot_ratio_ci(a, b, n=4000):
    out = []
    for _ in range(n):
        ra = st.median([a[random.randrange(len(a))] for _ in range(len(a))])
        rb = st.median([b[random.randrange(len(b))] for _ in range(len(b))])
        out.append(ra / rb)
    out.sort()
    return out[int(.025 * n)], out[int(.975 * n)]


allrows = json.load(open(T))
rows = [r for r in allrows if num(r.get("tender_security_bdt")) and num(r.get("contract_value_bdt"))]
for r in rows:
    r["_ratio"] = num(r["tender_security_bdt"]) / num(r["contract_value_bdt"])

print("[1] RATE-INVARIANT competition gradient.")
print("    award/estimate = r / security_ratio, so a RATIO of two groups' medians")
print("    cancels r exactly. These numbers do not depend on the unknown rate.")
g = defaultdict(list)
for r in rows:
    g[r.get("competition_level") or "MISSING"].append(1.0 / r["_ratio"])
base = g["HIGH"]
for k in ["SINGLE_BID", "VERY_LOW", "LOW", "MODERATE", "HIGH"]:
    if k not in g:
        continue
    lo, hi = boot_ratio_ci(g[k], base)
    print("    %-11s n=%-4d implied award/estimate is %+6.2f%% vs HIGH  [95%% %+.2f%%, %+.2f%%]"
          % (k, len(g[k]), 100 * (med(g[k]) / med(base) - 1), 100 * (lo - 1), 100 * (hi - 1)))

g2 = defaultdict(list)
for r in rows:
    g2[r.get("eligibility_restriction_level") or "MISSING"].append(1.0 / r["_ratio"])
base2 = g2["STRONG"]
print("    -- eligibility_restriction_level, against STRONG --")
for k, v in sorted(g2.items(), key=lambda kv: -len(kv[1])):
    lo, hi = boot_ratio_ci(v, base2)
    print("    %-24s n=%-4d %+6.2f%% vs STRONG  [95%% %+.2f%%, %+.2f%%]"
          % (k, len(v), 100 * (med(v) / med(base2) - 1), 100 * (lo - 1), 100 * (hi - 1)))

print("\n[2] median bids by eligibility level, on the same 554 rows")
for k, v in sorted(g2.items(), key=lambda kv: -len(kv[1])):
    b = [num(r.get("total_bids_received")) for r in rows
         if (r.get("eligibility_restriction_level") or "MISSING") == k
         and num(r.get("total_bids_received"))]
    print("    %-24s n=%-4d median bids %.1f" % (k, len(b), med(b)))

print("\n[3] controls: gradient inside procurement_nature and inside procuring_entity")


def ranks(xs):
    order = sorted(range(len(xs)), key=lambda i: xs[i])
    r = [0.0] * len(xs)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and xs[order[j + 1]] == xs[order[i]]:
            j += 1
        for k in range(i, j + 1):
            r[order[k]] = (i + j) / 2.0 + 1
        i = j + 1
    return r


def spearman(a, b):
    ra, rb = ranks(a), ranks(b)
    ma, mb = st.fmean(ra), st.fmean(rb)
    n_ = sum((x - ma) * (y - mb) for x, y in zip(ra, rb))
    d = (sum((x - ma) ** 2 for x in ra) * sum((y - mb) ** 2 for y in rb)) ** .5
    return n_ / d if d else float("nan")


sub = [r for r in rows if num(r.get("total_bids_received"))]
for nat in ("Works", "Goods"):
    s = [r for r in sub if r.get("procurement_nature") == nat]
    print("    %-8s n=%-4d Spearman(bids, 1/security_ratio) = %+.4f"
          % (nat, len(s), spearman([num(r["total_bids_received"]) for r in s],
                                   [1 / r["_ratio"] for r in s])))
pe = defaultdict(list)
for r in sub:
    pe[(r.get("agency"), r.get("procuring_entity"))].append(r)
big = [(k, v) for k, v in pe.items() if len(v) >= 15]
print("    procuring entities with >= 15 rows: %d of %d" % (len(big), len(pe)))
tot, wsum = 0, 0.0
for k, v in sorted(big, key=lambda kv: -len(kv[1])):
    rho = spearman([num(r["total_bids_received"]) for r in v], [1 / r["_ratio"] for r in v])
    print("      %-58s n=%-3d rho=%+.3f" % (str(k)[:58], len(v), rho))
    tot += len(v)
    wsum += rho * len(v)
print("    size-weighted mean within-PE rho = %+.4f over %d rows" % (wsum / tot, tot))

print("\n[4] validation against the +/-10%% band the notices publish")
import re
band = {}
for k, pages in json.load(open(RAW)).items():
    if not k.startswith("Tender Notice_PDFs"):
        continue
    t = " ".join((p.get("text") or "") for p in pages)
    if re.search(r'estimat', t, re.I):
        m = re.search(r'(\d+)\s*(?:\(\s*\w+\s*\))?\s*(?:%|percent)\s*(?:above|less|more)', t, re.I)
        if m:
            band[k.rsplit("_", 1)[-1].replace(".pdf", "")] = int(m.group(1))
hit = [r for r in rows if str(r.get("tender_id")) in band and band[str(r["tender_id"])] == 10]
print("    rows with a published +/-10%% band and both figures: %d" % len(hit))
for rate in (0.03, 0.028, 0.025, 0.02):
    inside = sum(1 for r in hit if 0.9 <= rate / r["_ratio"] <= 1.1)
    print("      back-out at r=%.3f lands inside the published band on %2d of %d rows (%.0f%%)"
          % (rate, inside, len(hit), 100 * inside / len(hit)))

print("\n[5] the security route against the liquid-asset route, same tenders")
print("    Works anchor: '[usually the required liquid asset is the equivalent of one fourth")
print("    of the official estimated cost of the proposed work]' - CDA_Tender_736874 p.1,")
print("    published 04-Oct-2022, so estimate = 4 x required liquid assets.")
pair = [r for r in rows if r.get("procurement_nature") == "Works"
        and num(r.get("required_liquid_assets_bdt"))]
print("    Works rows carrying security, contract value and a liquid-asset bar: %d" % len(pair))
d = []
for r in pair:
    e_sec = num(r["tender_security_bdt"]) / 0.03
    e_liq = 4 * num(r["required_liquid_assets_bdt"])
    d.append(e_liq / e_sec)
print("    estimate from the liquid-asset rule / estimate from the 3%% security ceiling:")
print("      min %.2fx  p25 %.2fx  median %.2fx  p75 %.2fx  max %.2fx"
      % (min(d), sorted(d)[len(d) // 4], med(d), sorted(d)[3 * len(d) // 4], max(d)))
print("      rows where the two routes differ by more than 1.5x: %d of %d"
      % (sum(1 for x in d if x > 1.5 or x < 1 / 1.5), len(d)))
print("    Spearman between the two recovered estimates = %+.4f"
      % spearman([num(r["tender_security_bdt"]) for r in pair],
                 [num(r["required_liquid_assets_bdt"]) for r in pair]))
one = [r for r in pair if str(r.get("tender_id")) == "736874"]
if one:
    r = one[0]
    print("    the notice that printed the rule, tender 736874: security %.0f -> estimate >= %.0f;"
          % (num(r["tender_security_bdt"]), num(r["tender_security_bdt"]) / 0.03))
    print("      liquid bar %.0f -> estimate = %.0f; awarded %.0f. The two routes differ by %.2fx."
          % (num(r["required_liquid_assets_bdt"]), 4 * num(r["required_liquid_assets_bdt"]),
             num(r["contract_value_bdt"]),
             4 * num(r["required_liquid_assets_bdt"]) / (num(r["tender_security_bdt"]) / 0.03)))

print("\n[6] the 177 rows whose security exceeds 3%% of the award")
over = [r for r in rows if r["_ratio"] > 0.03]
mult = sorted(r["_ratio"] / 0.03 for r in over)
print("    n=%d; for the ceiling to hold, the estimate must be at least this multiple of the award:"
      % len(over))
print("      median %.2fx  p75 %.2fx  p90 %.2fx  max %.2fx"
      % (med(mult), mult[3 * len(mult) // 4], mult[9 * len(mult) // 10], max(mult)))
print("    rows needing an estimate more than 1.10x the award, i.e. incompatible with the")
print("    +/-10%% band the notices publish: %d of %d" % (sum(1 for x in mult if x > 1.10), len(over)))
