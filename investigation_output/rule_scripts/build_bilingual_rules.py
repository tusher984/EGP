# -*- coding: utf-8 -*-
"""
rules_broken_line_by_line_bilingual.csv - the same 1,583 lines, in two languages.

Every column of the English file survives unchanged, and eight are added beside
their English twins: the rule's short name, what the rule requires, what the
document shows, the publishability verdict and the severity in Bengali, the
normalised rule-versus-reality sentence in both languages, and a single status
token so this file and the merged file can be filtered the same way.

What is deliberately NOT translated: rule_text_verbatim and evidence_excerpt.
Those two columns are the evidence. They stay exactly as the PDFs print them, so
that a reader can diff a cell against the page it names. Everything a reader
needs in Bengali to understand what the finding *is* sits in the new columns.

The script refuses to write a row whose Bengali cells came out empty, because a
silently empty Bengali cell would look like an absent value rather than a bug.
"""
import csv, os, sys, collections

OUT = "/sessions/exciting-laughing-curie/mnt/EGP-CDA/investigation_output"
sys.path.insert(0, os.path.join(OUT, "rule_scripts"))
import bengali_dictionary as B  # noqa: E402

SRC = os.path.join(OUT, "rules_broken_line_by_line.csv")
DST = os.path.join(OUT, "rules_broken_line_by_line_bilingual.csv")

# new column -> the existing column it is inserted after
AFTER = [
    ("rule_short_name", "rule_short_name_bn"),
    ("rule_broken_plain_english", "rule_vs_reality_en"),
    ("rule_vs_reality_en", "rule_vs_reality_bn"),
    ("what_the_document_shows", "what_the_document_shows_bn"),
    ("what_the_rule_requires", "what_the_rule_requires_bn"),
    ("publishable_as_a_breach", "publishable_as_a_breach_bn"),
    ("publishable_as_a_breach_bn", "rule_status_token"),
    ("severity_if_deviation", "severity_bn"),
]


def fieldnames(cols):
    out = list(cols)
    for anchor, new in AFTER:
        out.insert(out.index(anchor) + 1, new)
    return out


def main():
    rows = list(csv.DictReader(open(SRC, encoding="utf-8-sig")))
    cols = fieldnames(list(rows[0].keys()))
    bad = []
    for r in rows:
        code = r["rule_code"]
        r["rule_short_name_bn"] = B.NAME_BN.get(code, "")
        r["what_the_rule_requires_bn"] = B.requires_bn(code, r["what_the_rule_requires"])
        r["what_the_document_shows_bn"] = B.shows_bn(code, r["what_the_document_shows"])
        r["publishable_as_a_breach_bn"] = B.VERDICT_BN.get(r["publishable_as_a_breach"], "")
        r["severity_bn"] = B.SEVERITY_BN.get(r["severity_if_deviation"], "")
        r["rule_status_token"] = B.status_token("DEVIATION", r["publishable_as_a_breach"])
        r["rule_vs_reality_en"] = B.sentence_en(r)
        r["rule_vs_reality_bn"] = B.sentence_bn(r)
        for c in ("rule_short_name_bn", "what_the_rule_requires_bn",
                  "what_the_document_shows_bn", "publishable_as_a_breach_bn", "severity_bn"):
            if not r[c]:
                bad.append((r["line_no"], code, c))
    if bad:
        print("REFUSING TO WRITE: %d empty Bengali cells, e.g. %s" % (len(bad), bad[:5]))
        return 1

    with open(DST, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=cols, quoting=csv.QUOTE_ALL, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, "") for c in cols})

    print("wrote rules_broken_line_by_line_bilingual.csv: %d rows x %d cols"
          % (len(rows), len(cols)))
    print("per rule, with the status token that will also appear in the merged file:")
    per = collections.defaultdict(collections.Counter)
    for r in rows:
        per[r["rule_code"]][r["rule_status_token"]] += 1
    for code in sorted(per):
        print("   %-4s %-62s %s" % (code, B.NAME_BN[code][:58], dict(per[code])))
    n = sum(1 for r in rows if r["rule_status_token"] == "BROKEN_REPORTABLE")
    print("reportable lines %d across %d tenders"
          % (n, len({r["tender_id"] for r in rows if r["rule_status_token"] == "BROKEN_REPORTABLE"})))
    return 0


if __name__ == "__main__":
    sys.exit(main())

