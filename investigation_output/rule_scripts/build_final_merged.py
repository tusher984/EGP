# -*- coding: utf-8 -*-
"""
final_merged_investigation.csv - everything about a tender on one line.

The grain is one row per tender, 1,155 of them, because that is the grain the
whole investigation has been built on and the only grain at which a merged file
can be read. Three sources fold in:

  master_tender_investigation.csv   all 179 columns, unchanged, in order
  bidder_detail.csv                 7 aggregate columns; it has 1,189 rows over
                                    645 tenders, so it can only arrive summarised
  rule_deviations.csv               3 columns per rule x 18 rules, so that each
                                    rule stands in its own column instead of
                                    being concatenated into one cell

The per-rule block is a status token plus a normalised finding in English and in
Bengali. The status token distinguishes the three things a deviation can be -
BROKEN_REPORTABLE, BROKEN_BUT_CITED_RULE_POSTDATES_THE_EVENT and
OUTSIDE_RECOMMENDED_BAND_NOT_A_DUTY - from the seven non-deviation results, so a
filter on one column can never mistake a recorded deviation for a publishable
breach. Where a rule was never in scope for a tender, all three cells are empty:
an empty cell here means the test was not run on this tender, and the status
column of a rule that was run always says so.

The Bengali finding is a translation of the narrative only. Every quote,
filename, page number, clause number and figure is left exactly as the source
files carry it.
"""
import csv, os, sys, collections

OUT = _p.OUT
sys.path.insert(0, os.path.join(OUT, "rule_scripts"))
import bengali_dictionary as B  # noqa: E402
import repo_paths as _p

MASTER = os.path.join(OUT, "master_tender_investigation.csv")
BID = os.path.join(OUT, "bidder_detail.csv")
DEV = os.path.join(OUT, "rule_deviations.csv")
BILING = os.path.join(OUT, "rules_broken_line_by_line_bilingual.csv")
DST = os.path.join(OUT, "final_merged_investigation.csv")

BID_COLS = ["bidder_detail_rows", "bidder_detail_record_types", "awarded_bidder_bid_amount",
            "beneficial_owners_with_share_and_country", "jv_partners_with_share",
            "bidder_detail_rejection_note", "bidder_detail_source_pages"]

ROLLUP = ["rules_tested_on_this_tender", "rules_broken_reportable_count",
          "rules_broken_reportable_codes", "rules_broken_reportable_summary_bn",
          "rules_deviation_not_reportable_codes"]


def load(p):
    return list(csv.DictReader(open(p, encoding="utf-8-sig")))


def bidder_aggregates(rows):
    """One tender's bidder_detail rows, folded into seven cells."""
    kinds = collections.Counter(r["record_type"] for r in rows)
    awarded = [r for r in rows if r["record_type"] == "AWARDED_BIDDER"]
    owners = [r for r in rows if r["record_type"] == "DISCLOSED_BENEFICIAL_OWNER_OF_WINNER"]
    jv = [r for r in rows if r["record_type"] == "JV_PARTNER_OF_WINNER"]
    rej = [r for r in rows if r["record_type"] == "UNNAMED_REJECTED_BIDDERS_AGGREGATE"]

    def owner_str(r):
        bits = [r["beneficial_owner_name"]]
        extra = [x for x in (r["ownership_percentage"], r["owner_country"]) if x]
        return bits[0] + (" (" + ", ".join(extra) + ")" if extra else "")

    def jv_str(r):
        return r["bidder_name"] + ((" (" + r["ownership_percentage"] + ")")
                                   if r["ownership_percentage"] else "")
    pages = sorted({"%s p.%s" % (r["source_file"], r["page_number"])
                    for r in rows if r["source_file"] and r["page_number"]})
    note = "; ".join(x for x in [rej[0]["note"] if rej else "",
                                 rej[0]["rejection_reason"] if rej else "",
                                 rej[0]["rejected_requirement"] if rej else ""] if x)
    return {
        "bidder_detail_rows": str(len(rows)),
        "bidder_detail_record_types": "; ".join("%s x%d" % (k, v) for k, v in
                                               sorted(kinds.items())),
        "awarded_bidder_bid_amount": awarded[0]["bid_amount"] if awarded else "",
        "beneficial_owners_with_share_and_country": "; ".join(
            owner_str(r) for r in owners if r["beneficial_owner_name"]),
        "jv_partners_with_share": "; ".join(jv_str(r) for r in jv if r["bidder_name"]),
        "bidder_detail_rejection_note": note,
        "bidder_detail_source_pages": "; ".join(pages),
    }


def rule_columns(dev_rows):
    """R01..R18 in order, each with the three columns it owns."""
    names = {}
    for r in dev_rows:
        names.setdefault(r["rule_code"], r["rule_short_name"])
    cols, owned = [], {}
    for code in sorted(names):
        stem = "%s_%s" % (code, names[code].lower())
        owned[code] = (stem + "__status", stem + "__finding_en", stem + "__finding_bn")
        cols.extend(owned[code])
    return cols, owned


def main():
    master = load(MASTER)
    mcols = list(master[0].keys())

    bid = collections.defaultdict(list)
    for r in load(BID):
        bid[r["tender_id"]].append(r)

    dev_rows = load(DEV)
    dev = {}
    for r in dev_rows:
        k = (r["tender_id"], r["rule_code"])
        if k in dev:
            print("duplicate rule row for %s, aborting" % (k,))
            return 1
        dev[k] = r

    # the deviation sentences are already written and verified in the bilingual file
    sent = {(r["tender_id"], r["rule_code"]): (r["rule_vs_reality_en"], r["rule_vs_reality_bn"],
                                               r["rule_status_token"]) for r in load(BILING)}

    rcols, owned = rule_columns(dev_rows)
    cols = mcols + BID_COLS + rcols + ROLLUP
    codes = sorted(owned)
    out = []

    for m in master:
        tid = m["tender_id"]
        row = dict(m)
        row.update({c: "" for c in BID_COLS + rcols + ROLLUP})
        if tid in bid:
            row.update(bidder_aggregates(bid[tid]))

        tested, reportable, notreportable = [], [], []
        for code in codes:
            d = dev.get((tid, code))
            if not d:
                continue                      # rule not in scope: three empty cells
            scol, ecol, bcol = owned[code]
            tested.append(code)
            if d["test_result"] == "DEVIATION":
                en, bn, token = sent[(tid, code)]
                if token == "BROKEN_REPORTABLE":
                    reportable.append(code)
                else:
                    notreportable.append(code)
            else:
                token = d["test_result"]
                en, bn = B.finding_other_en(d), B.finding_other_bn(d)
            row[scol], row[ecol], row[bcol] = token, en, bn

        row["rules_tested_on_this_tender"] = "%d (%s)" % (len(tested), ", ".join(tested))
        row["rules_broken_reportable_count"] = str(len(reportable))
        row["rules_broken_reportable_codes"] = ", ".join(reportable)
        row["rules_deviation_not_reportable_codes"] = ", ".join(notreportable)
        row["rules_broken_reportable_summary_bn"] = (
            "প্রকাশযোগ্য লঙ্ঘন %d টি: %s।" % (len(reportable),
                                              "; ".join(B.NAME_BN[c] for c in reportable))
            if reportable else "")
        out.append(row)

    with open(DST, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=cols, quoting=csv.QUOTE_ALL, extrasaction="ignore")
        w.writeheader()
        for r in out:
            w.writerow({c: r.get(c, "") for c in cols})
    return report(out, cols, mcols, rcols, codes, owned)


def report(out, cols, mcols, rcols, codes, owned):
    print("wrote final_merged_investigation.csv: %d rows x %d cols" % (len(out), len(cols)))
    print("   %d master columns + %d bidder aggregates + %d rule columns (%d rules x 3) + %d "
          "roll-ups" % (len(mcols), len(BID_COLS), len(rcols), len(codes), len(ROLLUP)))
    print("\nper-rule status, read down the merged file:")
    for code in codes:
        s = collections.Counter(r[owned[code][0]] for r in out if r[owned[code][0]])
        blank = sum(1 for r in out if not r[owned[code][0]])
        print("   %-4s %-52s not in scope %4d | %s"
              % (code, owned[code][0][:52], blank,
                 ", ".join("%s %d" % kv for kv in s.most_common())))
    rep = [r for r in out if r["rules_broken_reportable_count"] != "0"]
    print("\ntenders with at least one reportable breach: %d" % len(rep))
    print("reportable lines summed over the grid: %d"
          % sum(int(r["rules_broken_reportable_count"]) for r in out))
    print("value of those tenders: BDT %.1f crore"
          % (sum(float((r["contract_value_bdt"] or "0").replace(",", "") or 0)
                 for r in rep) / 1e7))
    print("agency mix: %s" % dict(collections.Counter(r["agency"] for r in rep).most_common()))
    print("bidder aggregates present on %d of %d rows"
          % (sum(1 for r in out if r["bidder_detail_rows"]), len(out)))
    return 0


if __name__ == "__main__":
    sys.exit(main())



