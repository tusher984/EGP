#!/usr/bin/env python3
"""Exhaustive sweep of every page of every PDF in the corpus for (a) any rule
that fixes the tender-security amount, (b) any published official cost estimate,
(c) the price-band responsiveness clause that names the estimate.

    python3 -P investigation/scripts/security_clause_sweep.py
"""
import json
import os
import re
from collections import Counter

RAW = "/Users/alamintusher/Documents/GitHub/EGP-CDA/investigation/data/raw_pages.json"
COR = os.environ.get("TMPDIR", "/tmp/claude-501") + "/corsc_text.json"

docs = {}
for k, v in json.load(open(RAW)).items():
    docs[k] = v
for k, v in json.load(open(COR, encoding="utf-8")).items():
    docs["COR SC/" + k] = v
print("documents swept: %d   pages swept: %d"
      % (len(docs), sum(len(v) for v in docs.values())))

SEC = re.compile(r'(?:tender|bid|proposal)[\s/]*(?:/\s*proposal\s*)?securit', re.I)
PCT = re.compile(r'(\d+(?:\.\d+)?)\s*(?:%|percent|per\s*cent|\(\s*\d+\s*\)\s*percent)', re.I)
NUMWORD = re.compile(r'\b(one|two|three|four|five|ten|fifteen|twenty|twenty-five|thirty)\s*\(\s*\d+(?:\.\d+)?\s*\)\s*percent', re.I)
FLOOR = re.compile(r'not\s+less\s+than|at\s+least|minimum\s+of|no\s+less\s+than', re.I)


def windows(text, pat, before=260, after=260):
    for m in pat.finditer(text):
        yield text[max(0, m.start() - before): m.end() + after]


print("\n=== A. every percentage figure that appears within 260 chars of a "
      "tender/bid-security mention, anywhere in the corpus ===")
found = Counter()
examples = {}
for name, pages in docs.items():
    for pg in pages:
        t = pg.get("text") or ""
        if not SEC.search(t):
            continue
        for w in windows(t, SEC):
            for m in list(PCT.finditer(w)) + list(NUMWORD.finditer(w)):
                key = m.group(0).strip().lower()
                found[key] += 1
                examples.setdefault(key, (name, pg["n"], " ".join(w.split())[:400]))
for k, c in found.most_common():
    nm, n, ex = examples[k]
    print("  %-24s x%-4d first: %s p.%s" % (k, c, nm, n))

print("\n=== B. any FLOOR language in the same window (a floor is what a "
      "back-out needs and a ceiling does not give) ===")
hits = 0
for name, pages in docs.items():
    for pg in pages:
        t = pg.get("text") or ""
        if not SEC.search(t):
            continue
        for w in windows(t, SEC, 200, 200):
            if FLOOR.search(w) and PCT.search(w):
                hits += 1
                print("  %s p.%s :: %s" % (name, pg["n"], " ".join(w.split())[:400]))
print("  floor-with-percentage windows: %d" % hits)

print("\n=== C. does any document in the corpus print an official cost estimate "
      "as a figure? ===")
EST = re.compile(r'(estimated\s+(?:cost|value|price|amount)|official\s+(?:cost\s+)?estimate|'
                 r'approved\s+estimat\w*|প্রাক্কলিত|প্রাক্কলন)', re.I)
MONEY = re.compile(r'(?:tk\.?|taka|bdt|৳)\s*[\d,]{4,}|[\d,]{6,}\s*(?:tk|taka|bdt)', re.I)
docs_with_est = Counter()
withfig = []
for name, pages in docs.items():
    for pg in pages:
        t = pg.get("text") or ""
        if EST.search(t):
            docs_with_est[name.split("/")[0]] += 1
            for w in windows(t, EST, 120, 200):
                if MONEY.search(w):
                    withfig.append((name, pg["n"], " ".join(w.split())[:300]))
print("  pages mentioning an estimate, by folder: %s" % dict(docs_with_est))
print("  pages where a money figure sits within 200 chars of the estimate phrase: %d"
      % len(withfig))
for r in withfig[:25]:
    print("    %s p.%s :: %s" % r)

print("\n=== D. the +/-10 percent price-band clause in the notices ===")
BAND = re.compile(r'(\d+)\s*%?\s*(?:percent|%)?\s*(?:above|below|more)[^.]{0,80}?estimat', re.I)
GENERIC = re.compile(r'estimat', re.I)
band_docs = {}
for name, pages in docs.items():
    if not name.startswith("Tender Notice_PDFs"):
        continue
    t = " ".join((pg.get("text") or "") for pg in pages)
    if GENERIC.search(t):
        m = BAND.search(t)
        band_docs[name] = m.group(0) if m else None
print("  notices whose text contains 'estimat': %d of 1155" % len(band_docs))
print("  of those, notices stating a numeric band against the estimate: %d"
      % sum(1 for v in band_docs.values() if v))
pat_counter = Counter(re.sub(r'\s+', ' ', v).lower() for v in band_docs.values() if v)
for k, c in pat_counter.most_common(20):
    print("     x%-4d %s" % (c, k))
