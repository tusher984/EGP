# -*- coding: utf-8 -*-
"""
Apply the rule catalogue to every tender and emit
  rule_deviations.csv   one row per tender x rule that was in scope
and the aggregated rule columns that get appended to master_tender_investigation.csv.

Design rules followed here:
  * one row per (tender, rule) - the master keeps one row per tender
  * a row is emitted only when it says something: a determinate result, or a
    condition that is present but cannot be scored. Silent non-applicable
    combinations are not written.
  * every deviation row carries the source file, page and a verbatim excerpt
    where the corpus provides one, and NOT_AVAILABLE where it does not.
"""
import csv, os, re, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rule_catalogue import RULES, RULE_BY_CODE, INSTRUMENT_NOTE, QUOTE_REPRODUCTION_NOTE

BASE = "/sessions/exciting-laughing-curie/mnt/EGP-CDA"
OUT = os.path.join(BASE, "investigation_output")
MASTER = os.path.join(OUT, "master_tender_investigation.csv")

NA = "NOT_AVAILABLE"
CR = 10_000_000.0
LAC = 100_000.0


def num(s):
    if s is None:
        return None
    s = str(s).strip().replace(",", "")
    if s in ("", NA, "NOT_PUBLISHED_IN_ANY_DOCUMENT_IN_CORPUS", "BLANK_ON_NOTICE",
             "WITHHELD_BY_METHOD", "PORTAL_ACCESS_DENIED"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def yes(v):
    return str(v).strip().lower() == "yes"


def sign_year(r):
    m = re.search(r"(20\d\d)", r.get("signing_date") or "")
    return int(m.group(1)) if m else None


def clip(s, n=400):
    s = re.sub(r"\s+", " ", (s or "")).strip()
    if s in ("", NA):
        return NA
    return s[:n] + ("..." if len(s) > n else "")


def band_for_value(v):
    """Rule 123(9) contract-signing band, keyed to value in BDT."""
    if v is None:
        return None, None
    if v <= 50_000_000:
        return 14, "up to BDT 50 million"
    if v <= 250_000_000:
        return 21, "BDT 50-250 million"
    return 28, "above BDT 250 million"


def instrument_scope(r):
    """How close is this tender to the document the clause actually comes from?"""
    nat = (r.get("procurement_nature") or "").strip()
    if nat == "Goods (Framework Agreement)":
        return "EXACT_STD_MATCH_GOODS_FRAMEWORK_AGREEMENT"
    if nat.startswith("Goods"):
        return "SAME_CATEGORY_DIFFERENT_STD_GOODS_NOT_FRAMEWORK"
    if nat in ("", NA):
        return "SCOPE_UNKNOWN_NATURE_NOT_PUBLISHED"
    return "DIFFERENT_CATEGORY_STD_%s" % nat.upper().replace(" ", "_")


def timing(r, statutory):
    """PPR 2025 / a Dec-2025 draft cannot govern an earlier event."""
    y = sign_year(r)
    if y is None:
        return "EVENT_DATE_NOT_PUBLISHED"
    if y <= 2024:
        return "CITED_INSTRUMENT_POSTDATES_EVENT_signed_%d" % y
    return "INSTRUMENT_PLAUSIBLY_IN_FORCE_signed_%d" % y


def has_award(r):
    return r.get("beneficial_ownership_disclosed") in ("yes", "no")


# ---------------------------------------------------------------- the tests
def run_tests(r):
    """Return list of dicts: code, result, observed, required, excerpt_col."""
    out = []
    cv = num(r.get("contract_value_bdt"))
    recv = num(r.get("total_bids_received"))
    resp = num(r.get("responsive_bids"))
    awarded = has_award(r)
    status = (r.get("tender_status") or "").strip()
    nat = (r.get("procurement_nature") or "").strip()
    method = (r.get("procurement_method") or "").strip()

    # R01 beneficial ownership
    if awarded and cv is not None:
        if cv > 10 * LAC:
            dev = r.get("beneficial_ownership_disclosed") == "no"
            out.append(dict(code="R01", result="DEVIATION" if dev else "COMPLIANT",
                            observed=("no ownership table printed" if dev
                                      else "ownership disclosed: " + clip(r.get("beneficial_owner_names"), 120)),
                            required="publication required above BDT 10.00 Lac",
                            excerpt_col=None))
        else:
            out.append(dict(code="R01", result="NOT_APPLICABLE_BELOW_10_LAC_FLOOR",
                            observed="contract value BDT {:,.0f}".format(cv),
                            required="floor is BDT 10.00 Lac", excerpt_col=None))

    # R02 signing band
    d = num(r.get("days_noa_to_signing"))
    if awarded and d is not None:
        cap, bandtxt = band_for_value(cv)
        if cap is not None:
            dev = d > cap
            out.append(dict(code="R02", result="DEVIATION" if dev else "COMPLIANT",
                            observed="%d days from NOA to signing" % int(d),
                            required="%d days (%s, by awarded value used as proxy for the estimate)" % (cap, bandtxt),
                            excerpt_col=None))

    # R03 enlistment precondition in an open tender
    if yes(r.get("agency_enlistment_requirement")):
        openish = "OTM" in method.upper() or method.lower().startswith("open")
        out.append(dict(code="R03",
                        result="DEVIATION" if openish else "NOT_APPLICABLE_METHOD_NOT_OPEN",
                        observed="enlistment with the procuring entity required; method = %s" % (method or NA),
                        required="no pre-conditions for sale of documents; enlistment confined to LTM",
                        excerpt_col="evidence_excerpt_enlistment"))

    # R04 award record absent although status says awarded
    if status.startswith("Contract Awarded") and not awarded:
        out.append(dict(code="R04", result="DEVIATION",
                        observed="status '%s' but no award notice in the portal print" % clip(status, 60),
                        required="award details published within 24 hours and displayed 28 days; contract details within 3 days, kept 30 days",
                        excerpt_col=None))

    # R05 fixed price band as an automatic responsiveness rule
    if yes(r.get("price_band_nonresponsive_clause")):
        out.append(dict(code="R05", result="DEVIATION",
                        observed="notice imposes its own fixed percentage band as automatic non-responsiveness",
                        required="computed lower limit [x-Sd] under ITT 50.3; 20% against the official estimate under ITT 50.6",
                        excerpt_col="evidence_excerpt_price_band"))

    # R06 specific-experience bar vs the 60-80% band
    ratio = num(r.get("similar_project_value_to_contract_value_ratio"))
    if ratio is not None:
        dev = ratio > 0.80
        out.append(dict(code="R06", result="DEVIATION" if dev else "COMPLIANT",
                        observed="past-contract bar = %.2fx awarded contract value" % ratio,
                        required="recommended 0.60-0.80x of the estimated cost",
                        excerpt_col="evidence_excerpt_specific_experience"))

    # R07 financial bar vs the 80-100% band
    fr = num(r.get("financial_bar_to_contract_value_ratio"))
    if fr is not None:
        dev = fr > 1.00
        out.append(dict(code="R07", result="DEVIATION" if dev else "COMPLIANT",
                        observed="financial bar = %.2fx awarded contract value" % fr,
                        required="recommended 0.80-1.00x of the estimated cost",
                        excerpt_col="evidence_excerpt_liquid_assets"))

    # R08 tender security vs the 3% ceiling
    sr = num(r.get("security_to_contract_value_ratio"))
    if sr is not None:
        dev = sr > 0.03
        out.append(dict(code="R08", result="DEVIATION" if dev else "COMPLIANT",
                        observed="tender security = %.2f%% of awarded contract value" % (sr * 100),
                        required="not exceeding 3% of the official cost estimate",
                        excerpt_col=None))

    # R09 manufacturer's authorisation on goods
    if yes(r.get("manufacturer_requirement")) or yes(r.get("dealer_requirement")):
        if nat.startswith("Goods"):
            out.append(dict(code="R09", result="DEVIATION",
                            observed="manufacturer's authorisation and/or sole-dealership required on a Goods package",
                            required="TDS default is 'Manufacturer's Authorization is not required'; usually not required for off-the-shelf readily available Goods",
                            excerpt_col="evidence_excerpt_eligibility"))
        else:
            out.append(dict(code="R09", result="NOT_APPLICABLE_NOT_A_GOODS_PACKAGE",
                            observed="manufacturer/dealer requirement present but nature = %s" % (nat or NA),
                            required="ITT 28.1(f) sits in the Goods standard document",
                            excerpt_col="evidence_excerpt_eligibility"))

    # R10 lack of effective competition, permissive
    if awarded and (resp == 1 or recv == 1):
        out.append(dict(code="R10", result="CONDITION_PRESENT_DISCRETION_NOT_A_BREACH",
                        observed="bids received %s, responsive %s" % (
                            int(recv) if recv is not None else NA,
                            int(resp) if resp is not None else NA),
                        required="ITT 56.2(b) permits rejection of all tenders; ITT 56.3 preserves the award at market price",
                        excerpt_col="evidence_excerpt_competition"))

    # R11 single responsive tender, estimate test unverifiable
    if awarded and resp == 1:
        out.append(dict(code="R11", result="MANDATED_TEST_UNVERIFIABLE",
                        observed="one technically responsive tender; official cost estimate not published in any document",
                        required="direct comparison of the evaluated price with the official cost estimate, 20% threshold",
                        excerpt_col=None))

    # R12 performance security timing
    if awarded:
        out.append(dict(code="R12", result="NOT_TESTABLE_DATA_ABSENT",
                        observed="performance-security field on the award notice is blank",
                        required="7/10/14 working days by value band, per Rule 123(7); ITT 63.2 says 14 days",
                        excerpt_col=None))

    # R13 addendum without a deadline extension
    ac = num(r.get("amendment_count"))
    if ac is not None and ac >= 1:
        out.append(dict(code="R13", result="NOT_TESTABLE_DATA_ABSENT",
                        observed="%d amendment(s); portal prints no corrigendum date%s" % (
                            int(ac),
                            "; amendment touched the qualification criteria" if yes(r.get("amendment_touched_eligibility")) else ""),
                        required="deadline shall be extended by at least 3 working days if the addendum lands in the final third",
                        excerpt_col="amendment_old_to_new"))

    # R14 lowest price vs official estimate
    if awarded:
        out.append(dict(code="R14", result="NOT_TESTABLE_DATA_ABSENT",
                        observed="estimated_tender_value = NOT_PUBLISHED_IN_ANY_DOCUMENT_IN_CORPUS; individual bid amounts never printed",
                        required="comparison of the lowest evaluated price against the official cost estimate",
                        excerpt_col=None))

    # R15 brand name with no equivalent
    if yes(r.get("brand_without_or_equivalent")):
        out.append(dict(code="R15", result="CONDITION_PRESENT_NOT_SCOREABLE",
                        observed="brand or model named with no 'or equivalent' wording",
                        required="no Bangladeshi brand-name rule exists in the corpus; JICA 4.07 binds 1 of 1,155 tenders",
                        excerpt_col="evidence_excerpt_eligibility"))

    # R16 government-client-only experience
    if yes(r.get("govt_client_experience_required")):
        out.append(dict(code="R16", result="CONDITION_PRESENT_NOT_SCOREABLE",
                        observed="past experience restricted to government or semi-government clients",
                        required="no non-discrimination or proportionality clause exists in the corpus",
                        excerpt_col="evidence_excerpt_specific_experience"))

    # R17 criteria absent from the notice
    ep = (r.get("eligibility_published") or "").strip()
    if ep in ("AS_PER_TENDER_DATA_SHEET_ONLY", "BLANK_IN_NOTICE", "PORTAL_ACCESS_DENIED"):
        out.append(dict(code="R17", result="CONDITION_PRESENT_NOT_SCOREABLE",
                        observed="eligibility_published = %s" % ep,
                        required="the content required of an Invitation for Tenders is prescribed by the PPR, which is not in the corpus",
                        excerpt_col=None))

    # R18 large package, national tendering only
    if cv is not None and cv > 250_000_000 and (r.get("procurement_type") or "").strip() == "NCT":
        out.append(dict(code="R18", result="CONDITION_PRESENT_NOT_SCOREABLE",
                        observed="BDT %.1f crore awarded under National Competitive Tendering" % (cv / CR),
                        required="JICA 2.02 benchmark only; the corpus contains zero international tenders",
                        excerpt_col=None))

    return out


DEV_RESULTS = {"DEVIATION"}
STATUTORY = {"R02"}

def main():
    rows = list(csv.DictReader(open(MASTER, encoding="utf-8-sig")))
    fieldnames_master = list(rows[0].keys())
    dev_rows = []
    per_tender = {}

    for r in rows:
        tid = r["tender_id"]
        scope = instrument_scope(r)
        tests = run_tests(r)
        codes_dev, codes_cond, codes_nt = [], [], []
        detail = []
        for t in tests:
            rule = RULE_BY_CODE[t["code"]]
            exc = NA
            if t["excerpt_col"]:
                exc = clip(r.get(t["excerpt_col"]), 400)
            page = NA
            if t["excerpt_col"] and exc != NA:
                page = clip(r.get("evidence_page_numbers"), 200)
            tim = timing(r, t["code"] in STATUTORY) if t["code"] in ("R01", "R02", "R04", "R05", "R12") else "NOT_DATE_DEPENDENT"
            dev_rows.append(dict(
                tender_id=tid,
                tender_reference=r.get("tender_reference", NA),
                agency=r.get("agency", NA),
                procurement_nature=r.get("procurement_nature", NA),
                contract_value_bdt=r.get("contract_value_bdt", NA),
                rule_code=t["code"],
                rule_short_name=rule["short"],
                clause_cited=rule["clause"],
                rule_source_file=rule["source_file"],
                rule_source_pdf_page=rule["pdf_page"],
                rule_source_printed_page=rule["printed_page"],
                clause_force=rule["force"],
                clause_certainty=rule["clause_certainty"],
                clause_quote_verbatim=rule["quote"],
                test_applied=rule["test"],
                test_result=t["result"],
                observed_value=t["observed"],
                required_value=t["required"],
                severity_if_deviation=rule["severity"],
                instrument_scope_vs_this_tender=scope,
                instrument_timing_vs_this_tender=tim,
                tender_evidence_excerpt=exc,
                tender_evidence_source_file=r.get("notice_source_file", NA) if exc != NA else NA,
                tender_evidence_page=page,
                interpretation_limit=rule["limit"],
                quote_reproduction_note=QUOTE_REPRODUCTION_NOTE,
                documented_fact=("Document says: %s. Rule says: %s." % (t["observed"], t["required"])),
                investigative_hypothesis=("Not asserted. %s" % rule["limit"][:200]),
            ))
            if t["result"] == "DEVIATION":
                codes_dev.append(t["code"])
                detail.append("%s %s [%s | observed: %s | required: %s]" % (
                    t["code"], rule["short"], rule["clause"], t["observed"], t["required"]))
            elif t["result"].startswith("CONDITION_PRESENT") or t["result"] in (
                    "MANDATED_TEST_UNVERIFIABLE",):
                codes_cond.append(t["code"])
            elif t["result"].startswith("NOT_TESTABLE"):
                codes_nt.append(t["code"])

        mand = [c for c in codes_dev if RULE_BY_CODE[c]["clause_certainty"] == "VERBATIM_MANDATORY_IN_CORPUS"]
        band = [c for c in codes_dev if RULE_BY_CODE[c]["clause_certainty"] == "TDS_NOTE_IN_CORPUS"]
        per_tender[tid] = dict(
            rule_tests_applied_count=str(len(tests)),
            rule_deviation_count=str(len(codes_dev)),
            rule_deviation_codes="; ".join(codes_dev) if codes_dev else "NONE",
            rule_deviation_mandatory_clause_codes="; ".join(mand) if mand else "NONE",
            rule_deviation_recommended_band_codes="; ".join(band) if band else "NONE",
            rule_condition_present_not_scoreable_codes="; ".join(codes_cond) if codes_cond else "NONE",
            rule_not_testable_codes="; ".join(codes_nt) if codes_nt else "NONE",
            rule_deviation_detail=" || ".join(detail) if detail else "NONE",
            rule_instrument_scope=instrument_scope(r),
            rule_instrument_timing=timing(r, True),
            rule_citation_caveat=INSTRUMENT_NOTE,
        )

    # ---- write rule_deviations.csv
    dev_cols = list(dev_rows[0].keys())
    p = os.path.join(OUT, "rule_deviations.csv")
    with open(p, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=dev_cols, quoting=csv.QUOTE_ALL)
        w.writeheader()
        w.writerows(dev_rows)

    # ---- append aggregated columns to the master
    new_cols = list(next(iter(per_tender.values())).keys())
    out_cols = fieldnames_master + new_cols
    p2 = os.path.join(OUT, "master_tender_investigation.csv")
    with open(p2, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=out_cols, quoting=csv.QUOTE_ALL)
        w.writeheader()
        for r in rows:
            r.update(per_tender[r["tender_id"]])
            w.writerow(r)

    print("rule_deviations.csv rows:", len(dev_rows), "cols:", len(dev_cols))
    print("master cols now:", len(out_cols), "rows:", len(rows))
    import collections
    c = collections.Counter((d["rule_code"], d["test_result"]) for d in dev_rows)
    for code in [r["code"] for r in RULES]:
        tot = {k[1]: v for k, v in c.items() if k[0] == code}
        if tot:
            print(code, RULE_BY_CODE[code]["short"], "->", dict(sorted(tot.items(), key=lambda x: -x[1])))


if __name__ == "__main__":
    main()
