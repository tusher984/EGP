# -*- coding: utf-8 -*-
"""
Fix a two-row extraction bug found during the task-13 verification pass.

WHAT WAS WRONG
  financial_bar_to_contract_value_ratio was 80436.99 on tender 119545 and
  43650.22 on tender 113428 - i.e. a liquid-asset bar of roughly BDT 180-200
  billion on contracts of BDT 22-46 lakh. Two compounding faults:

  1. Double Lac multiplier. The notices print the amount as a COMPLETE numeral
     in the South Asian grouping - "20,00,000" - and then repeat it in words as
     "(Twenty) Lac". The extractor stripped the commas to 2000000 and then
     applied the 1e5 Lac multiplier again, giving 2e11. 2e11 / 4,581,878.13 is
     exactly the reported 43650.22, which confirms the mechanism.

  2. On 119545 the reading window also over-ran the liquid-asset clause and
     landed on the NEXT item, "(c) The Minimum Tender Capacity shall be:
     18,00,000 (Eighteen) Lac" - a different requirement entirely.

CORRECT VALUES, read from the excerpt already stored in the master
  119545  "Tk. 8,25,000 (Eight Lac Twenty Five Thousand) only" -> BDT   825,000
          825000 / 2237776.42 = 0.37x  -> COMPLIANT, not a deviation
  113428  "Tk. 20,00,000 (Twenty) Lac only"                    -> BDT 2,000,000
          2000000 / 4581878.13 = 0.44x -> COMPLIANT, not a deviation

Both had been counted as R07 deviations, so R07 goes 150 -> 148 deviations and
99 -> 101 compliant. No other ratio column is affected: turnover max is 7.53x,
specific-experience max 6.19x, security max 0.06, and no value in any of the
four exceeds a plausible ceiling once these two are corrected.

Nothing is guessed here. Each replacement value is the figure printed in the
notice's own liquid-asset sentence, which is preserved verbatim in
evidence_excerpt_liquid_assets on the same row.
"""
import csv, os, shutil

OUT = "/sessions/exciting-laughing-curie/mnt/EGP-CDA/investigation_output"
MASTER = os.path.join(OUT, "master_tender_investigation.csv")
BACKUP165 = "/tmp/master_backup_165col.csv"

FIX = {
    "119545": dict(ratio="0.37", bar=825000.0,
                   note=("CORRECTED_2026-09-02_VERIFICATION: financial bar had been extracted as "
                         "BDT 1.8e11 (ratio 80436.99) by applying the Lac multiplier to an already "
                         "complete numeral AND by reading item (c) Minimum Tender Capacity instead "
                         "of item (b) liquid assets. Notice states liquid assets Tk. 8,25,000 "
                         "(Eight Lac Twenty Five Thousand); ratio 0.37x; result R07 DEVIATION -> COMPLIANT.")),
    "113428": dict(ratio="0.44", bar=2000000.0,
                   note=("CORRECTED_2026-09-02_VERIFICATION: financial bar had been extracted as "
                         "BDT 2.0e11 (ratio 43650.22) by applying the Lac multiplier to the already "
                         "complete numeral 20,00,000. Notice states Tk. 20,00,000 (Twenty) Lac; "
                         "ratio 0.44x; result R07 DEVIATION -> COMPLIANT.")),
}


def patch(path, keep_cols=None):
    rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
    cols = list(rows[0].keys())
    touched = 0
    for r in rows:
        f = FIX.get(r["tender_id"])
        if not f:
            continue
        before = r["financial_bar_to_contract_value_ratio"]
        r["financial_bar_to_contract_value_ratio"] = f["ratio"]
        # append the provenance note to the extraction_method cell, which already
        # documents how each row's numbers were obtained
        if "extraction_method" in r:
            r["extraction_method"] = (r["extraction_method"] + " | " + f["note"]).strip(" |")
        print("  %s: %s -> %s" % (r["tender_id"], before, f["ratio"]))
        touched += 1
    with open(path, "w", newline="", encoding="utf-8-sig") as fh:
        w = csv.DictWriter(fh, fieldnames=cols, quoting=csv.QUOTE_ALL)
        w.writeheader()
        w.writerows(rows)
    print("  patched %d rows in %s (%d cols)" % (touched, os.path.basename(path), len(cols)))


if __name__ == "__main__":
    print("patching the 165-column backup that run_rules.py rebuilds from:")
    patch(BACKUP165)
    print("patching the live master:")
    patch(MASTER)
