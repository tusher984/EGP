#!/usr/bin/env python3
"""Does the security-implied award/estimate ratio move with competition?

The back-out is  E_min = security / 0.03  (TDS note to ITT 31.1, e-PG3A p.39),
which is a LOWER bound on the estimate, so  contract / E_min  is an UPPER bound
on contract / estimate and is algebraically 0.03 / security_ratio. Every test
below is therefore a test on the security ratio; it is reported in award/estimate
units because that is what the newsroom is asking about.

    python3 -P investigation/scripts/security_backout_tests.py
"""
import json
import random
import statistics as st
from collections import Counter, defaultdict

T = "/Users/alamintusher/Documents/GitHub/EGP-CDA/site/data/tenders.json"
CEIL = 0.03
random.seed(20260905)


def num(v):
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return f if f > 0 else None


def med(xs):
    return st.median(xs) if xs else float("nan")


def ranks(xs):
    order = sorted(range(len(xs)), key=lambda i: xs[i])
    r = [0.0] * len(xs)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and xs[order[j + 1]] == xs[order[i]]:
            j += 1
        avg = (i + j) / 2.0 + 1
        for k in range(i, j + 1):
            r[order[k]] = avg
        i = j + 1
    return r


def spearman(a, b):
    ra, rb = ranks(a), ranks(b)
    n = len(a)
    ma, mb = st.fmean(ra), st.fmean(rb)
    num_ = sum((x - ma) * (y - mb) for x, y in zip(ra, rb))
    den = (sum((x - ma) ** 2 for x in ra) * sum((y - mb) ** 2 for y in rb)) ** .5
    return num_ / den if den else float("nan")


def perm_p(a, b, stat, n=20000):
    obs = stat(a, b)
    b2 = list(b)
    hits = 0
    for _ in range(n):
        random.shuffle(b2)
        if abs(stat(a, b2)) >= abs(obs) - 1e-15:
            hits += 1
    return obs, (hits + 1) / (n + 1)


def boot_med_ci(xs, n=4000):
    ms = []
    k = len(xs)
    for _ in range(n):
        ms.append(st.median([xs[random.randrange(k)] for _ in range(k)]))
    ms.sort()
    return ms[int(.025 * n)], ms[int(.975 * n)]


rows = [r for r in json.load(open(T))
        if num(r.get("tender_security_bdt")) and num(r.get("contract_value_bdt"))]
for r in rows:
    r["_ratio"] = num(r["tender_security_bdt"]) / num(r["contract_value_bdt"])
    r["_ae"] = CEIL / r["_ratio"]          # upper bound on award / estimate
    r["_ae2"] = 0.02 / r["_ratio"]         # same back-out at the JICA 2% benchmark
print("rows with security AND contract value: %d" % len(rows))

print("\n[A] level is unidentified: the same data at the two rates the corpus contains")
for lbl, key in (("BPPA 3%% ceiling  (e-PG3A p.39)", "_ae"),
                 ("JICA 'around 2%%' (chapter2_en p.27)", "_ae2")):
    xs = [r[key] for r in rows]
    lo, hi = boot_med_ci(xs)
    print("  %-38s median award/estimate = %.4f  [95%% boot %.4f, %.4f]  p10=%.3f p90=%.3f"
          % (lbl, med(xs), lo, hi, sorted(xs)[len(xs) // 10], sorted(xs)[9 * len(xs) // 10]))

print("\n[B] does the implied award/estimate ratio fall as bids rise?")
sub = [r for r in rows if num(r.get("total_bids_received"))]
bids = [num(r["total_bids_received"]) for r in sub]
ae = [r["_ae"] for r in sub]
rho, p = perm_p(bids, ae, spearman)
print("  n=%d  Spearman(bids, implied award/estimate) = %+.4f   permutation p = %.4f"
      % (len(sub), rho, p))
print("  (identical in magnitude and opposite in sign to Spearman(bids, security ratio) = %+.4f)"
      % spearman(bids, [r["_ratio"] for r in sub]))

print("\n  by bid count")
g = defaultdict(list)
for r in sub:
    b = int(num(r["total_bids_received"]))
    key = b if b <= 5 else (6 if b <= 9 else 10)
    g[key].append(r["_ae"])
for k in sorted(g):
    lbl = {6: "6-9", 10: "10+"}.get(k, str(k))
    lo, hi = boot_med_ci(g[k]) if len(g[k]) > 4 else (float("nan"),) * 2
    print("    bids %-4s n=%-4d median award/estimate %.4f  [%.4f, %.4f]"
          % (lbl, len(g[k]), med(g[k]), lo, hi))

print("\n[C] competition_level, with bootstrap intervals")
g = defaultdict(list)
for r in rows:
    g[r.get("competition_level") or "MISSING"].append(r["_ae"])
for k in ["SINGLE_BID", "VERY_LOW", "LOW", "MODERATE", "HIGH", "UNKNOWN"]:
    if k not in g:
        continue
    lo, hi = boot_med_ci(g[k])
    print("  %-12s n=%-4d median %.4f  [95%% %.4f, %.4f]  mean %.4f"
          % (k, len(g[k]), med(g[k]), lo, hi, st.fmean(g[k])))
a = g.get("SINGLE_BID", [])
b = g.get("HIGH", [])
if a and b:
    lab = [0] * len(a) + [1] * len(b)
    val = a + b
    rho, p = perm_p(lab, val, spearman)
    print("  SINGLE_BID vs HIGH: median gap %+.4f of the estimate, permutation p = %.4f"
          % (med(a) - med(b), p))

print("\n[D] eligibility_restriction_level")
g = defaultdict(list)
for r in rows:
    g[r.get("eligibility_restriction_level") or "MISSING"].append(r["_ae"])
for k, v in sorted(g.items(), key=lambda kv: -len(kv[1])):
    lo, hi = boot_med_ci(v) if len(v) > 4 else (float("nan"),) * 2
    print("  %-24s n=%-4d median %.4f  [95%% %.4f, %.4f]" % (k, len(v), med(v), lo, hi))

print("\n[E] confounders: the same gradient inside agency, size and PE strata")
print("  contract-value quintile (all bands pooled)")
rows.sort(key=lambda r: num(r["contract_value_bdt"]))
qn = 5
for i in range(qn):
    chunk = rows[i * len(rows) // qn:(i + 1) * len(rows) // qn]
    print("    Q%d n=%-4d cv %10.0f..%12.0f  median award/estimate %.4f  median sec%% %.4f"
          % (i + 1, len(chunk), num(chunk[0]["contract_value_bdt"]),
             num(chunk[-1]["contract_value_bdt"]),
             med([r["_ae"] for r in chunk]), 100 * med([r["_ratio"] for r in chunk])))
print("  Spearman(contract value, implied award/estimate) = %+.4f"
      % spearman([num(r["contract_value_bdt"]) for r in rows], [r["_ae"] for r in rows]))

print("\n  bids-gradient recomputed INSIDE each agency")
for ag in ["RAJUK", "CDA", "COXDA", "KDA", "RDA"]:
    s = [r for r in sub if r.get("agency") == ag]
    if len(s) < 20:
        print("    %-6s n=%-4d too few" % (ag, len(s)))
        continue
    print("    %-6s n=%-4d Spearman(bids, award/estimate) = %+.4f"
          % (ag, len(s), spearman([num(r["total_bids_received"]) for r in s],
                                  [r["_ae"] for r in s])))
print("\n  bids-gradient recomputed INSIDE each contract-value quintile")
sub.sort(key=lambda r: num(r["contract_value_bdt"]))
for i in range(qn):
    chunk = sub[i * len(sub) // qn:(i + 1) * len(sub) // qn]
    print("    Q%d n=%-4d Spearman(bids, award/estimate) = %+.4f"
          % (i + 1, len(chunk), spearman([num(r["total_bids_received"]) for r in chunk],
                                         [r["_ae"] for r in chunk])))

print("\n[F] how much of the security ratio is rounding noise?")
amts = [num(r["tender_security_bdt"]) for r in rows]
grid = []
for a in amts:
    step = 1
    for m in (100000, 50000, 25000, 10000, 5000, 1000, 100, 10, 1):
        if abs(a / m - round(a / m)) < 1e-9:
            step = m
            break
    grid.append(step / a)
print("  median coarsest round-number step as a share of the amount: %.4f%%"
      % (100 * med(grid)))
print("  so a single row's recovered estimate carries about +/-%.2f%% of pure rounding"
      % (100 * med(grid) / 2))
print("  interquartile width of the security ratio: %.4f pct pts"
      % (100 * (sorted(r["_ratio"] for r in rows)[3 * len(rows) // 4]
                - sorted(r["_ratio"] for r in rows)[len(rows) // 4])))

print("\n[G] tenders whose own notice publishes a +/-N%% band against the estimate")
ids = set()
import re
raw = json.load(open("/Users/alamintusher/Documents/GitHub/EGP-CDA/investigation/data/raw_pages.json"))
BAND = re.compile(r'(\d+)\s*(?:\(\s*\w+\s*\))?\s*(?:%|percent)\s*(?:above|less|more)', re.I)
EST = re.compile(r'estimat', re.I)
band_by_id = {}
for k, pages in raw.items():
    if not k.startswith("Tender Notice_PDFs"):
        continue
    tid = k.rsplit("_", 1)[-1].replace(".pdf", "")
    t = " ".join((p.get("text") or "") for p in pages)
    if not EST.search(t):
        continue
    m = BAND.search(t)
    if m:
        band_by_id[tid] = int(m.group(1))
print("  notices with a numeric band: %d  (bands seen: %s)"
      % (len(band_by_id), Counter(band_by_id.values()).most_common()))
hit = [r for r in rows if str(r.get("tender_id")) in band_by_id]
print("  of those, rows that also carry security AND contract value: %d" % len(hit))
if hit:
    rs = [r["_ratio"] for r in hit]
    print("  security ratio on that subset: min %.4f med %.4f max %.4f" % (min(rs), med(rs), max(rs)))
    print("  if the award is within +/-10%% of the estimate, the PE's security rate r must satisfy")
    print("    r in [0.9 * max ratio, 1.1 * min ratio] = [%.4f, %.4f]  -> %s"
          % (0.9 * max(rs), 1.1 * min(rs),
             "EMPTY, so no single rate can hold across these tenders"
             if 0.9 * max(rs) > 1.1 * min(rs) else "non-empty"))
    best, bestfrac = None, -1
    r_ = 0.010
    while r_ <= 0.070:
        frac = sum(1 for x in rs if 0.9 <= r_ / x <= 1.1) / len(rs)
        if frac > bestfrac:
            best, bestfrac = r_, frac
        r_ += 0.0001
    print("  rate that puts the most of this subset inside the published +/-10%% band:"
          " r = %.4f (%.1f%% of %d rows)" % (best, 100 * bestfrac, len(rs)))
