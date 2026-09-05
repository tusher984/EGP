#!/usr/bin/env python3
"""security-backout: can the official cost estimate be recovered from the
published tender security?

Reads site/data/tenders.json only. Prints every count it claims.

    python3 -P investigation/scripts/security_backout.py
"""
import json
import statistics as st
from collections import Counter

T = "/Users/alamintusher/Documents/GitHub/EGP-CDA/site/data/tenders.json"
CEIL = 0.03  # TDS note to ITT 31.1, e-PG3A PDF p.39 / printed p.31


def num(v):
    if v in (None, "", "NA", "NOT_PUBLISHED"):
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return f if f > 0 else None


def q(xs, p):
    xs = sorted(xs)
    if not xs:
        return None
    k = (len(xs) - 1) * p
    lo, hi = int(k), min(int(k) + 1, len(xs) - 1)
    return xs[lo] + (xs[hi] - xs[lo]) * (k - lo)


def desc(name, xs):
    if not xs:
        print("  %-28s n=0" % name)
        return
    print("  %-28s n=%-5d min=%.4f p10=%.4f p25=%.4f med=%.4f p75=%.4f p90=%.4f max=%.4f mean=%.4f"
          % (name, len(xs), min(xs), q(xs, .10), q(xs, .25), q(xs, .50),
             q(xs, .75), q(xs, .90), max(xs), st.fmean(xs)))


rows = json.load(open(T))
print("tenders.json rows: %d" % len(rows))

sec = [r for r in rows if num(r.get("tender_security_bdt")) is not None]
cv = [r for r in rows if num(r.get("contract_value_bdt")) is not None]
both = [r for r in rows if num(r.get("tender_security_bdt")) is not None
        and num(r.get("contract_value_bdt")) is not None]
ratio_col = [r for r in rows if num(r.get("security_to_contract_value_ratio")) is not None]
print("rows with tender_security_bdt        : %d" % len(sec))
print("rows with contract_value_bdt         : %d" % len(cv))
print("rows with BOTH                       : %d" % len(both))
print("rows with security_to_contract_ratio : %d" % len(ratio_col))

# 1. reproduce the published ratio column from the two raw columns
mism = 0
for r in both:
    a = num(r["tender_security_bdt"]) / num(r["contract_value_bdt"])
    b = num(r.get("security_to_contract_value_ratio"))
    if b is None or abs(a - b) > 1e-6:
        mism += 1
print("\n[1] ratio column recomputed from raw columns; mismatches > 1e-6: %d" % mism)
rr = [num(r["tender_security_bdt"]) / num(r["contract_value_bdt"]) for r in both]
desc("security / contract value", rr)
print("  <= 3%%: %d   > 3%%: %d   (of %d)" % (sum(1 for x in rr if x <= CEIL),
                                              sum(1 for x in rr if x > CEIL), len(rr)))
for band in (0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.10):
    print("     <= %5.3f : %4d" % (band, sum(1 for x in rr if x <= band)))

# 2. is the security a FIXED AMOUNT (round number) or a rate?
print("\n[2] roundness of the published security amount, n=%d" % len(sec))
amts = [num(r["tender_security_bdt"]) for r in sec]
for m in (100, 1000, 5000, 10000, 50000, 100000, 1000000):
    c = sum(1 for a in amts if abs(a / m - round(a / m)) < 1e-9)
    print("  exact multiple of %-9d : %4d  (%.1f%%)" % (m, c, 100.0 * c / len(amts)))
rep = Counter(amts)
print("  distinct amounts             : %d of %d" % (len(rep), len(amts)))
print("  most repeated amounts        : %s" % rep.most_common(8))

# same security amount, different contract values -> the rate cannot be fixed
print("\n[2b] repeated security amounts against the contract values they secured")
byamt = {}
for r in both:
    byamt.setdefault(num(r["tender_security_bdt"]), []).append(num(r["contract_value_bdt"]))
shown = 0
for a, vs in sorted(byamt.items(), key=lambda kv: -len(kv[1])):
    if len(vs) < 3:
        break
    print("  security %12.0f used on %2d tenders; contract value %14.0f .. %14.0f "
          "(spread %5.1fx); implied rate %.4f%% .. %.4f%%"
          % (a, len(vs), min(vs), max(vs), max(vs) / min(vs),
             100 * a / max(vs), 100 * a / min(vs)))
    shown += 1
    if shown == 8:
        break

# 3. the back-out itself: E_min = security / 0.03 is a LOWER bound on the estimate,
#    so contract / E_min is an UPPER bound on contract / estimate.
print("\n[3] recovered estimate LOWER bound  E_min = security / 0.03")
up = []
for r in both:
    s, c = num(r["tender_security_bdt"]), num(r["contract_value_bdt"])
    up.append((c / (s / CEIL), r))
desc("contract / E_min (upper bd)", [x for x, _ in up])
print("  rows where the bound proves contract < estimate (security > 3%% of contract): %d"
      % sum(1 for x, _ in up if x < 1))
print("  rows where the bound is uninformative (>= 1)                                : %d"
      % sum(1 for x, _ in up if x >= 1))
print("  rows where E_min is below 1/2 the contract value (bound useless)             : %d"
      % sum(1 for x, _ in up if x > 2))

# the bound is a pure monotone transform of the ratio column: identity check
ident = max(abs(x - CEIL / (num(r["tender_security_bdt"]) / num(r["contract_value_bdt"])))
            for x, r in up)
print("  max |contract/E_min  -  0.03/security_ratio| = %.3e  (i.e. the same number)" % ident)


def split(key):
    print("\n[4] split by %s" % key)
    g = {}
    for x, r in up:
        g.setdefault(r.get(key) or "MISSING", []).append((x, r))
    print("  %-26s %5s %10s %10s %10s %10s %10s" %
          ("level", "n", "med c/Emin", "med sec%", "med E_min cr", "med cv cr", "n>3%sec"))
    for k, v in sorted(g.items(), key=lambda kv: -len(kv[1])):
        xs = [x for x, _ in v]
        secp = [100 * num(r["tender_security_bdt"]) / num(r["contract_value_bdt"]) for _, r in v]
        emin = [num(r["tender_security_bdt"]) / CEIL / 1e7 for _, r in v]
        cvs = [num(r["contract_value_bdt"]) / 1e7 for _, r in v]
        print("  %-26s %5d %10.4f %10.4f %10.4f %10.4f %10d"
              % (k, len(v), q(xs, .5), q(secp, .5), q(emin, .5), q(cvs, .5),
                 sum(1 for p in secp if p > 3)))


split("competition_level")
split("eligibility_restriction_level")
split("agency")
split("procurement_nature")
