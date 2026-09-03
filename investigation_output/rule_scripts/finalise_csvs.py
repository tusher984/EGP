# -*- coding: utf-8 -*-
"""
Finalisation pass over the investigation outputs.

Three things happen here, all of them requested explicitly.

1. EVERY UNAVAILABLE VALUE BECOMES AN EMPTY CELL.
   The pipeline originally wrote self-documenting placeholders - NOT_AVAILABLE,
   NOT_PUBLISHED_IN_ANY_DOCUMENT_IN_CORPUS, NOT_AVAILABLE_NO_AWARD_NOTICE,
   BLANK_ON_NOTICE and so on - so that a reader could see *why* a cell was
   empty. Those are removed here. Nothing is lost, because the reason for every
   empty cell is carried forward into data_dictionary.csv, one row per column.

   A placeholder is only blanked when it stands for absent data. Genuine
   negative findings are results, not absences, and they stay: NONE (tested,
   zero deviations), NO_FLAG, NO_REPEAT_PATTERN, NO_CLEAR_PATTERN, and the
   NOT_APPLICABLE_* values in test_result, which record that a rule was
   correctly out of scope rather than that a value was missing.

2. BOTH DOCUMENT TYPES ARE NAMED ON EVERY LINE.
   Each tender has up to two published PDFs in the corpus - the Invitation for
   Tenders and the Contract Award Notice. Every rule row now says which of the
   two the test read (source_document_tested) and names both files, so a reader
   can open the exact page the finding came from.

3. THE BROKEN RULES ARE WRITTEN OUT LINE BY LINE.
   rules_broken_line_by_line.csv holds one line per broken rule per tender,
   with the clause quoted from the rule PDF in eGP_Forensic_Engine/ next to what
   the tender or award document actually says, and an explicit verdict on
   whether the line can be published as a breach.
"""
import csv, os, collections

OUT = "/sessions/exciting-laughing-curie/mnt/EGP-CDA/investigation_output"
MASTER = os.path.join(OUT, "master_tender_investigation.csv")
DEV = os.path.join(OUT, "rule_deviations.csv")
BIDDER = os.path.join(OUT, "bidder_detail.csv")
BROKEN = os.path.join(OUT, "rules_broken_line_by_line.csv")
DICT = os.path.join(OUT, "data_dictionary.csv")

# --- values that mean "this data does not exist in the corpus" -------------
ABSENT_EXACT = {
    "NOT_AVAILABLE",
    "NOT_PUBLISHED_IN_ANY_DOCUMENT_IN_CORPUS",
    "NOT_PUBLISHED_IN_NOTICE",
    "NO_AWARD_NOTICE_IN_CORPUS",
    "NONE_IN_CORPUS",
    "BLANK_ON_NOTICE",
    "BLANK_IN_NOTICE",
    "WITHHELD_BY_METHOD",
    "UNKNOWN",
}
ABSENT_PREFIX = (
    "NOT_AVAILABLE_",
    "NOT_APPLICABLE_SHARE_NOT_PUBLISHED",
    # potential_beneficiary carried a sentence-long refusal-to-name in all 1,155
    # rows; it holds no data, so the column is emptied and the method note moves
    # to data_dictionary.csv.
    "WITHHELD_BY_METHOD",
    # beneficial_owner_names carried BLANK_ON_NOTICE_DESPITE_ITT_68.1 where the
    # award notice prints no owner. The "despite ITT 68.1" part is not lost: it
    # is rule R01, and every one of those tenders has its own line in
    # rules_broken_line_by_line.csv.
    "BLANK_ON_NOTICE_DESPITE",
)

# --- prose that named a placeholder which is now an empty cell --------------
# These cells are not absent data - they are sentences explaining why a test
# could not run - so they are reworded rather than blanked.
REWORD = [
    ("estimated_tender_value is NOT_PUBLISHED_IN_ANY_DOCUMENT_IN_CORPUS in all 1,155 rows",
     "estimated_tender_value is empty in all 1,155 rows, because no document in the corpus publishes it"),
    ("estimated_tender_value = NOT_PUBLISHED_IN_ANY_DOCUMENT_IN_CORPUS",
     "estimated_tender_value = empty (published in no document in the corpus)"),
    ("NOT_PUBLISHED_IN_ANY_DOCUMENT_IN_CORPUS", "not published in any document in the corpus"),
]

# --- columns whose value is a finding, never blanked ----------------------
KEEP_AS_IS = {
    "eligibility_published",      # PORTAL_ACCESS_DENIED / BLANK_IN_NOTICE are findings here
    "test_result",                # NOT_APPLICABLE_* means correctly out of scope
    "severity_if_deviation",
    "clause_force",
    "clause_certainty",
    "instrument_timing_vs_this_tender",
    "instrument_scope_vs_this_tender",
    "publishable_as_a_breach",
    "rule_instrument_timing",
    "rule_instrument_scope",
    "extraction_confidence",
}


def blank(col, val):
    """Return the cell as it should be written."""
    s = (val or "").strip()
    if col in KEEP_AS_IS:
        return s
    if s in ABSENT_EXACT or s.startswith(ABSENT_PREFIX):
        return ""
    for old, new in REWORD:
        if old in s:
            s = s.replace(old, new)
    return s


# --- why each empty cell is empty, preserved from the removed placeholders --
# Keyed by column name; a prefix match on the key is used, longest first.
WHY_EMPTY = {
    "estimated_tender_value":
        "The official cost estimate is published in no document in the corpus - not in any of the "
        "1,155 tender notices and not in any of the 645 award notices. This column is empty in every "
        "row and that absence is itself a finding, because five separate clauses key off this number.",
    "lowest_bid": "Individual bid amounts are never printed on the e-GP award notice; only the "
                  "awarded contract value is published.",
    "highest_bid": "Individual bid amounts are never printed on the e-GP award notice.",
    "average_bid": "Individual bid amounts are never printed on the e-GP award notice.",
    "winning_bid_vs_estimate_pct": "Cannot be computed: no official cost estimate is published anywhere.",
    "winning_bid_vs_lowest_bid_pct": "Cannot be computed: individual bid amounts are never published.",
    "withdrawn_bids": "The e-GP award notice has no field for withdrawn tenders.",
    "technical_status": "No award notice in the corpus prints a separate technical evaluation status.",
    "rejection_reason": "The award notice states how many tenders were non-responsive but never why. "
                        "The reason exists in the tender evaluation committee report, which is not published.",
    "rejected_requirement": "The award notice never states which requirement a rejected tender failed.",
    "performance_security_on_time": "The performance-security field is printed but left blank on every "
                                    "award notice in the corpus.",
    "bidder_name": "Losing bidders are never named on the e-GP award notice; only counts are published. "
                   "Rows of type UNNAMED_REJECTED_BIDDERS_AGGREGATE therefore carry no name.",
    "beneficial_owner_name": "Only 75 award notices publish an ownership table; the rest print none.",
    "owner_country": "Published on only six ownership rows.",
    "ownership_percentage": "Twelve joint ventures print all partner shares as 0.000%, and most "
                            "ownership tables omit percentages altogether.",
    "award_": "Empty on the 510 tenders that have no award notice in the corpus.",
    "winner_": "Empty on the 510 tenders that have no award notice in the corpus.",
    "contract_value": "Empty on the 510 tenders that have no award notice in the corpus.",
    "noa_date": "Empty on the 510 tenders that have no award notice in the corpus.",
    "signing_date": "Empty on the 510 tenders that have no award notice in the corpus.",
    "days_noa_to_signing": "Empty on the 510 tenders that have no award notice in the corpus.",
    "signing_within_legal_band": "Empty on the 510 tenders that have no award notice in the corpus.",
    "beneficial_ownership_disclosed": "Empty on the 510 tenders that have no award notice.",
    "beneficial_owner_names": "Empty where no award notice exists (510 tenders) or where the award "
        "notice prints no ownership table at all (585 tenders). Those 585 are rule R01 - see "
        "rules_broken_line_by_line.csv for the clause and the page.",
    "potential_beneficiary": "Empty in every row by design, not by accident. A firm is never named as "
        "the beneficiary of a restriction merely because it could have satisfied that restriction; "
        "that inference is not evidence. Use the winner_name, winner_owner and repeat-winner columns "
        "for what the documents actually show.",
    "portal_self_certified_signed_in_due_time": "The award notice's own field 'Was the Contract Singed "
        "in due time?' (the typo is the portal's). Empty on the 510 tenders with no award notice and on "
        "the 54 economic-operator notices, which omit the field. Where it reads 'yes' it means only that "
        "the gap was 28 days or fewer - it is computed against a flat 28-day test, not the 14/21/28 "
        "sliding scale in Rule 123(9).",
    "portal_indicator_note": "Filled only on the R02 lines where the portal certifies compliance and the "
        "sliding-scale cap was nonetheless exceeded.",
    "evidence_page_map": "The master's full page-provenance string, kept where the single evidence page "
        "was parsed out of it into evidence_page.",
    "documents_sold": "Bid and document-sale counts exist on 591 award notices only; 54 use the "
                      "economic-operator template that prints none, and 510 tenders have no award notice.",
    "total_bids_received": "Bid counts exist on 591 award notices only.",
    "responsive_bids": "Bid counts exist on 591 award notices only.",
    "non_responsive_bids_DERIVED": "Derived from bid counts, so empty wherever those are unpublished.",
    "disqualified_bidders": "Derived from bid counts, so empty wherever those are unpublished.",
    "valid_bids": "Derived from bid counts, so empty wherever those are unpublished.",
    "responsive_bid_rate_pct": "Derived from bid counts, so empty wherever those are unpublished.",
    "disqualification_rate_pct": "Derived from bid counts, so empty wherever those are unpublished.",
    "sold_minus_submitted": "Derived from bid counts, so empty wherever those are unpublished.",
    "sold_to_submitted_gap_pct": "Derived from bid counts, so empty wherever those are unpublished.",
    "bidders_rejected_count": "Derived from bid counts, so empty wherever those are unpublished.",
    "competition_level": "Empty where the award notice publishes no bid counts, so the level cannot be set.",
    "competition_score": "Empty where the award notice publishes no bid counts.",
    "competition_risk_score": "Empty where the award notice publishes no bid counts.",
    "single_bid_investigative_score": "Scored only where the tender drew one bid or one responsive bid.",
    "peer_median_bids": "Needs published bid counts for the peer group.",
    "bids_vs_peer_median": "Needs published bid counts for this tender and its peers.",
    "winner_competition_share_pct": "Needs both a named winner and published bid counts.",
    "minimum_years_experience": "Empty where the notice publishes no qualification criteria - 599 of "
                                "1,155 notices print only 'As per Tender Data Sheet' - or where it "
                                "publishes criteria that do not include this particular threshold.",
    "minimum_similar_projects": "Empty where the notice publishes no such threshold.",
    "minimum_similar_project_value_bdt": "Empty where the notice publishes no such threshold.",
    "experience_lookback_years": "Empty where the notice publishes no such threshold.",
    "required_turnover_bdt": "Empty where the notice publishes no such threshold.",
    "required_liquid_assets_bdt": "Empty where the notice publishes no such threshold.",
    "required_working_capital_bdt": "Empty where the notice publishes no such threshold.",
    "financial_capacity_requirement_bdt": "Empty where the notice publishes no such threshold.",
    "tender_security_bdt": "Empty where the notice does not print a tender security amount.",
    "turnover_to_contract_value_ratio": "A ratio needs both a published threshold and an awarded "
                                        "contract value; empty if either is missing.",
    "similar_project_value_to_contract_value_ratio": "Needs both a published threshold and an awarded value.",
    "financial_bar_to_contract_value_ratio": "Needs both a published threshold and an awarded value.",
    "security_to_contract_value_ratio": "Needs both a published security amount and an awarded value.",
    "contract_value_vs_security_norm_index": "Needs both a published security amount and an awarded value.",
    "price_anomaly_flag": "Needs the security-normalised index, so empty wherever that is empty.",
    "eligibility_restriction_level": "Empty on the 599 notices that publish no qualification criteria at "
                                     "all; there is nothing to score. Read eligibility_published on the "
                                     "same row for the reason. Empty here does NOT mean unrestricted.",
    "eligibility_red_flag_type": "Empty where no red-flag pattern was found, or where no criteria were published.",
    "incumbent_advantage_risk": "Flag column: populated only where the pattern is present.",
    "low_competition_investigative_lead": "Flag column: populated only where the pattern is present.",
    "retender_flag": "Flag column: populated only where the portal status shows a re-tender.",
    "evidence_excerpt_": "Excerpt columns are populated only where the notice prints text on that "
                         "specific topic; empty means the notice is silent on it.",
    "evidence_page": "Empty where there is no excerpt to cite a page for.",
    "rule_source_file": "Empty on the 599 rows of rule R17, where no rule text on this point exists in "
                        "any document in the corpus.",
    "rule_source_pdf_page": "Empty where no rule text exists in the corpus.",
    "rule_source_printed_page": "Empty where no rule text exists in the corpus.",
    "clause_quote_verbatim": "Empty where no rule text exists in the corpus.",
    "tender_evidence_excerpt": "Populated where the tender notice prints text on the point tested; "
                               "many rules are tested against dates and counts rather than text.",
    "tender_evidence_source_file": "Empty where there is no text excerpt for this test.",
    "tender_evidence_page": "Empty where there is no text excerpt for this test.",
    "publishable_as_a_breach": "Populated only on rows whose test_result is DEVIATION.",
    "publishability_reason": "Populated only on rows whose test_result is DEVIATION.",
    "event_year": "Empty where the portal print carries no date for the event the clause governs.",
    "tender_reference": "Not printed on 18 notices.",
    "tender_status": "Not printed on 188 notices.",
    "app_id": "Not printed on 5 notices.",
    "publication_date": "Not printed on 26 notices.",
    "closing_date": "Not printed on 26 notices.",
    "opening_date": "Not printed on 26 notices.",
    "document_price_bdt": "Not printed on 11 notices.",
    "documented_fact": "Empty on the 5 notices the portal refused to serve plus a few with no parseable body.",
}
DEFAULT_WHY = ("Empty where the published document does not contain the value. The five portal "
               "refusals ('not exists or You are un-authorized') account for the smallest group.")


def why_empty(col):
    for k in sorted(WHY_EMPTY, key=len, reverse=True):
        if col == k or col.startswith(k):
            return WHY_EMPTY[k]
    return DEFAULT_WHY


# --- plain-English statement of each rule that can be broken ---------------
PLAIN = {
    "R01": "The award notice does not publish who actually owns the winning company, although the "
           "contract is above the BDT 10.00 Lac floor at which publication is required.",
    "R02": "The contract was signed later than the maximum number of days allowed between the "
           "notification of award and signature for a contract of this value.",
    "R03": "The notice makes enlistment with a public body a condition of taking part, in a tender "
           "advertised as open to all bidders.",
    "R04": "The portal records this tender as awarded but publishes no award notice at all, so the "
           "supplier, the price, the bid counts and the dates are all unpublished.",
    "R05": "The notice sets its own fixed percentage band around the cost estimate and makes any bid "
           "outside it automatically non-responsive - replacing the standard document's computed test, "
           "and doing so by reference to an estimate the same authority does not publish.",
    "R06": "The value of past work a bidder must already have completed is higher than the range the "
           "standard document recommends.",
    "R07": "The liquid assets or working capital a bidder must demonstrate is higher than the range the "
           "standard document recommends.",
    "R08": "The tender security demanded is above the ceiling the standard document sets.",
    "R09": "The notice demands a manufacturer's authorisation or a sole dealership on a goods package, "
           "where the standard document's own default is that no such authorisation is required.",
}

BROKEN_COLS = [
    "line_no", "tender_id", "tender_reference", "agency", "package_description",
    "procurement_nature", "procurement_method", "contract_value_bdt", "winner_name",
    "rule_code", "rule_short_name", "rule_broken_plain_english",
    "what_the_document_shows", "what_the_rule_requires",
    "rule_clause_cited", "rule_pdf_file", "rule_pdf_page", "rule_printed_page",
    "rule_text_verbatim", "clause_force", "clause_certainty",
    "source_document_tested", "tender_notice_pdf", "award_notice_pdf",
    "evidence_page", "evidence_excerpt", "evidence_page_map",
    "portal_self_certified_signed_in_due_time", "portal_indicator_note",
    "event_date_column_used", "event_year",
    "instrument_timing_vs_this_tender", "instrument_scope_vs_this_tender",
    "publishable_as_a_breach", "publishability_reason",
    "severity_if_deviation", "interpretation_limit", "quote_reproduction_note",
]


def write(path, cols, rows):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=cols, quoting=csv.QUOTE_ALL, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow({c: blank(c, r.get(c, "")) for c in cols})


def main():
    # ---------------- 1. blank the placeholders in all three existing files
    files = {}
    for path in (MASTER, DEV, BIDDER):
        rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
        cols = list(rows[0].keys())
        write(path, cols, rows)
        files[os.path.basename(path)] = (cols, [
            {c: blank(c, r.get(c, "")) for c in cols} for r in rows])
        print("blanked %-38s %5d rows x %3d cols" % (os.path.basename(path), len(rows), len(cols)))

    devcols, dev = files["rule_deviations.csv"]
    mcols, master = files["master_tender_investigation.csv"]
    M = {r["tender_id"]: r for r in master}

    # ---------------- 2. the broken rules, line by line
    broken = [d for d in dev if d["test_result"] == "DEVIATION"]
    order = {"YES": 0, "UNR": 1, "NO_": 2}
    broken.sort(key=lambda d: (
        order.get(d["publishable_as_a_breach"][:3], 3),
        d["rule_code"],
        -(float(d["contract_value_bdt"]) if d["contract_value_bdt"] else 0.0),
    ))
    out = []
    for i, d in enumerate(broken, 1):
        m = M.get(d["tender_id"], {})
        out.append(dict(
            line_no=str(i),
            tender_id=d["tender_id"],
            tender_reference=d["tender_reference"],
            agency=d["agency"],
            package_description=(m.get("package_description") or "")[:220],
            procurement_nature=d["procurement_nature"],
            procurement_method=m.get("procurement_method", ""),
            contract_value_bdt=d["contract_value_bdt"],
            winner_name=m.get("winner_name", ""),
            rule_code=d["rule_code"],
            rule_short_name=d["rule_short_name"],
            rule_broken_plain_english=PLAIN.get(d["rule_code"], ""),
            what_the_document_shows=d["observed_value"],
            what_the_rule_requires=d["required_value"],
            rule_clause_cited=d["clause_cited"],
            rule_pdf_file=d["rule_source_file"],
            rule_pdf_page=d["rule_source_pdf_page"],
            rule_printed_page=d["rule_source_printed_page"],
            rule_text_verbatim=d["clause_quote_verbatim"],
            clause_force=d["clause_force"],
            clause_certainty=d["clause_certainty"],
            source_document_tested=d["source_document_tested"],
            tender_notice_pdf=d["tender_notice_pdf"],
            award_notice_pdf=d["award_notice_pdf"],
            evidence_page=d["tender_evidence_page"],
            evidence_excerpt=d["tender_evidence_excerpt"],
            evidence_page_map=d.get("evidence_page_map", ""),
            portal_self_certified_signed_in_due_time=d.get(
                "portal_self_certified_signed_in_due_time", ""),
            portal_indicator_note=d.get("portal_indicator_note", ""),
            event_date_column_used=d["event_date_column_used"],
            event_year=d["event_year"],
            instrument_timing_vs_this_tender=d["instrument_timing_vs_this_tender"],
            instrument_scope_vs_this_tender=d["instrument_scope_vs_this_tender"],
            publishable_as_a_breach=d["publishable_as_a_breach"],
            publishability_reason=d["publishability_reason"],
            severity_if_deviation=d["severity_if_deviation"],
            interpretation_limit=d["interpretation_limit"],
            quote_reproduction_note=d["quote_reproduction_note"],
        ))
    write(BROKEN, BROKEN_COLS, out)
    print("wrote    %-38s %5d rows x %3d cols" % ("rules_broken_line_by_line.csv", len(out), len(BROKEN_COLS)))
    files["rules_broken_line_by_line.csv"] = (BROKEN_COLS, out)

    # ---------------- 3. the data dictionary
    dict_rows = []
    for fname, (cols, rows) in files.items():
        n = len(rows)
        for c in cols:
            vals = [(r.get(c) or "").strip() for r in rows]
            filled = sum(1 for v in vals if v)
            ex = next((v for v in vals if v), "")
            dict_rows.append(dict(
                file=fname, column=c, total_rows=str(n),
                cells_filled=str(filled), cells_empty=str(n - filled),
                fill_percent="%.1f" % (100.0 * filled / n) if n else "",
                example_value=ex[:200],
                distinct_values=str(len(set(v for v in vals if v))),
                why_empty_cells_are_empty=("" if filled == n else why_empty(c)),
            ))
    write(DICT, ["file", "column", "total_rows", "cells_filled", "cells_empty", "fill_percent",
                 "distinct_values", "example_value", "why_empty_cells_are_empty"], dict_rows)
    print("wrote    %-38s %5d rows" % ("data_dictionary.csv", len(dict_rows)))

    # ---------------- 4. report
    print()
    print("broken-rule lines by publishability:")
    for k, v in collections.Counter(d["publishable_as_a_breach"] for d in out).most_common():
        print("   %-62s %d" % (k, v))
    print("\nbroken-rule lines by rule:")
    for k, v in sorted(collections.Counter(d["rule_code"] for d in out).items()):
        y = sum(1 for d in out if d["rule_code"] == k and d["publishable_as_a_breach"].startswith("YES"))
        print("   %s %-52s %4d   of which publishable: %d" % (
            k, out and next(x["rule_short_name"] for x in out if x["rule_code"] == k), v, y))


if __name__ == "__main__":
    main()
