#!/usr/bin/env python3
"""Audit of the master dataset - reconciliation, integrity, and every blank.

Three questions, answered against the files themselves rather than by assertion.

  * Does the dataset say what the documents say? Every award column is compared
    cell by cell with verify_pdfs.py, a parser written separately and earlier,
    and the notice-side aggregates are compared with the figures that parser
    published in pdf_derived.json.

  * Does the dataset hold together? Every id referenced by another table has to
    exist, every evidence citation has to name a PDF that is on disk with at
    least that many pages, and every count has to add up.

  * Is every blank explained? A missing value is only acceptable if the reason
    it is missing can be named. Anything unexplained is printed.

    .venv/bin/python -P investigation/parser/03_audit.py
"""

import collections
import csv
import io
import json
import os
import re
import time

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.abspath(os.path.join(HERE, "..", "data"))
TABLES = os.path.join(DATA, "tables")
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
PDFROOT = ROOT

FAIL = []
NOTE = []
CHECKS = [0]
CELLS = [0]


def check(ok, label, detail=""):
    CHECKS[0] += 1
    print("%-4s %s%s" % ("ok" if ok else "FAIL", label,
                         ("  - " + detail) if detail else ""))
    if not ok:
        FAIL.append(label + ((": " + detail) if detail else ""))


def table(name):
    with io.open(os.path.join(TABLES, name), encoding="utf-8-sig",
                 newline="") as fh:
        return list(csv.DictReader(fh))


def load():
    ext = json.load(io.open(os.path.join(DATA, "extracted.json"),
                            encoding="utf-8"))
    inv = json.load(io.open(os.path.join(DATA, "inventory.json"),
                            encoding="utf-8"))
    proven = json.load(io.open(os.path.join(ROOT, "pdf_derived.json"),
                               encoding="utf-8"))
    t = dict((n, table(n + ".csv")) for n in
             ("documents tenders contracts bids eligibility_criteria lots "
              "amendments amendment_changes beneficial_owners companies people "
              "organizations projects locations relationships timeline "
              "normalization name_candidate_pairs").split())
    with io.open(os.path.join(DATA, "master_dataset.csv"), encoding="utf-8-sig",
                 newline="") as fh:
        t["master"] = list(csv.DictReader(fh))
    return ext, inv, proven, t


# ------------------------------------------------------------- reconciliation
def reconcile(ext, inv, t):
    """Row counts against the two upstream stages, with nothing rounded."""
    s = ext["summary"]
    check(len(t["documents"]) == inv["summary"]["documents"] == 1805,
          "documents.csv holds every PDF in the folder",
          "%d rows" % len(t["documents"]))
    check(len(t["tenders"]) == s["notices"], "tenders.csv = notices extracted",
          "%d vs %d" % (len(t["tenders"]), s["notices"]))
    check(len(t["contracts"]) == s["awards"], "contracts.csv = awards extracted",
          "%d vs %d" % (len(t["contracts"]), s["awards"]))
    check(len(t["eligibility_criteria"]) == s["eligibility_clauses"],
          "eligibility_criteria.csv = clauses extracted",
          "%d vs %d" % (len(t["eligibility_criteria"]), s["eligibility_clauses"]))
    check(len(t["lots"]) == s["lots"], "lots.csv = lots extracted")
    check(len(t["amendments"]) == s["amended_notices"],
          "amendments.csv = amended notices")
    check(len(t["beneficial_owners"]) == s["beneficial_owners"],
          "beneficial_owners.csv = owner rows extracted")
    check(len(t["bids"]) == s["awards"],
          "bids.csv has one funnel row per award notice")
    counted = sum(1 for b in t["bids"] if b["counts_printed"] == "yes")
    check(counted == s["awards_with_bid_counts"],
          "bid rows carrying printed counts = awards printing them",
          "%d" % counted)


AWARD_MAP = [("org", "award_agency"), ("pe", "award_procuring_entity"),
             ("district", "award_district"), ("sup", "winner"),
             ("off", "award_officer"),
             ("off_desig", "award_officer_designation"),
             ("value", "contract_value_taka"), ("sold", "tenders_sold"),
             ("recv", "tenders_received"), ("resp", "tenders_responsive"),
             ("noa", "noa_date"), ("sign", "signed_date"),
             ("template", "award_template")]


def same(want, got):
    if isinstance(want, float):
        return got != "" and abs(float(got) - want) < 1e-6
    return " ".join(str(want).split()).lower() == " ".join(got.split()).lower()


def cross_check(proven, t):
    """Every award cell against a parser written separately from this one."""
    mine = dict((r["tender_id"], r) for r in t["contracts"])
    cells, bad, absent = 0, [], 0
    for row in proven["award_rows"]:
        m = mine.get(row["id"])
        if m is None:
            absent += 1
            continue
        for their, ours in AWARD_MAP:
            if row[their] in (None, ""):
                continue
            cells += 1
            if not same(row[their], m[ours]):
                bad.append("%s %s: %r vs %r" % (row["id"], their, row[their],
                                                m[ours]))
    check(absent == 0, "every award the earlier parser read is in contracts.csv",
          "%d absent" % absent)
    CELLS[0] = cells
    check(not bad, "%d award cells agree with verify_pdfs.py" % cells,
          "; ".join(bad[:4]))
    prices = sorted(float(r["document_price_taka"]) for r in t["tenders"]
                    if r["document_price_taka"])
    dp = proven["doc_price"]
    check(len(prices) == dp["n"], "document prices found = the published count",
          "%d vs %d" % (len(prices), dp["n"]))
    check(abs(sum(prices) / len(prices) - dp["mean"]) < 0.05,
          "mean document price agrees with the published figure",
          "%.4f vs %s" % (sum(prices) / len(prices), dp["mean"]))
    check(prices[0] == dp["min"] and prices[-1] == dp["max"],
          "document price range agrees with the published figures",
          "%g-%g" % (prices[0], prices[-1]))


# ------------------------------------------------------------------- integrity
CITED = [("tenders", "notice_file", None), ("contracts", "award_file", None),
         ("eligibility_criteria", "source_file", "page"),
         ("lots", "source_file", "page"),
         ("amendments", "source_file", "page"),
         ("amendment_changes", "source_file", "page"),
         ("beneficial_owners", "source_file", "page"),
         ("bids", "source_file", None),
         ("relationships", "evidence_file", "evidence_page"),
         ("timeline", "source_file", "page")]


def integrity(t):
    pages = dict((d["file"], int(d["pages"])) for d in t["documents"])
    ondisk, overrun, cites = [], [], 0
    for name, filecol, pagecol in CITED:
        for r in t[name]:
            f = r[filecol]
            cites += 1
            if f not in pages:
                ondisk.append("%s -> %s" % (name, f))
                continue
            if pagecol and r[pagecol]:
                if int(r[pagecol]) > pages[f]:
                    overrun.append("%s %s p%s of %d" % (name, f, r[pagecol],
                                                        pages[f]))
    check(not ondisk, "%d citations name a document in the inventory" % cites,
          "; ".join(ondisk[:3]))
    check(not overrun, "no citation points past the end of its PDF",
          "; ".join(overrun[:3]))
    absent = [d["file"] for d in t["documents"]
              if not os.path.exists(os.path.join(PDFROOT, d["file"]))]
    check(not absent, "every document row names a file that is on disk",
          "; ".join(absent[:3]))

    ids = {"company": set(r["id"] for r in t["companies"]),
           "person": set(r["id"] for r in t["people"]),
           "organization": set(r["id"] for r in t["organizations"]),
           "project": set(r["id"] for r in t["projects"]),
           "tender": set(r["tender_id"] for r in t["tenders"])
                     | set(r["tender_id"] for r in t["contracts"])}
    dangling = []
    for r in t["relationships"]:
        for side in ("source", "target"):
            kind, val = r[side + "_type"], r[side + "_id"]
            if val and val not in ids.get(kind, set()):
                dangling.append("%s %s %s" % (r["relation"], kind, val))
    check(not dangling, "every relationship endpoint resolves to a table row",
          "; ".join(dangling[:3]))


# ------------------------------------------------------------------ every blank
# Which printed field each column is read from. A blank cell is only acceptable
# when the document printed nothing there, so for every blank the extraction
# record is re-read: if it holds a value, the dataset dropped it, and that is a
# fault rather than an absence. Columns naming several fields are the ones the
# portal prints under different labels in different templates.
NOTICE_FIELD = {
    "procuring_entity": ["pe"], "procuring_entity_id": ["pe"],
    "procuring_entity_code": ["pe_code"], "district": ["pe_district"],
    "district_original": ["pe_district"], "city": ["city"], "thana": ["thana"],
    "country": ["country"], "phone": ["phone"],
    "invitation_for": ["invitation_for"], "invitation_ref": ["invitation_ref"],
    "status": ["status"], "status_original": ["status"],
    "development_partner": ["partner"], "project_code": ["project_code"],
    "project": ["project"], "package_no": ["package_no"],
    "package_description": ["desc_works", "desc_goods", "desc_services",
                            "desc_assignment"],
    "category": ["category"], "evaluation_type": ["eval_type"],
    "document_price_taka": ["doc_price"], "document_price_original": ["doc_price"],
    "payment_mode": ["payment_mode"],
    "inviting_officer": ["inviting_name", "inviting_officer"],
    "inviting_officer_id": ["inviting_name", "inviting_officer"],
    "inviting_officer_designation": ["inviting_designation"],
}
NOTICE_DATE = {"published_date": "published", "last_selling_date": "last_selling",
               "premeeting_start": "premeet_start", "premeeting_end": "premeet_end",
               "closing_date": "closing", "opening_date": "opening",
               "security_last_date": "security_last",
               "security_valid_until": "security_valid",
               "tender_valid_until": "tender_valid"}
AWARD_FIELD = {
    "award_procuring_entity_code": ["pe_code"], "contract_no": ["contract_no"],
    "contract_description": ["contract_desc"],
    "winner_tenderer_id": ["tenderer_id"],
    "performance_security_on_time": ["perf_security_ontime"],
    "contract_signed_on_time": ["signed_ontime"],
    "tenders_sold": ["sold"], "tenders_received": ["received"],
    "tenders_responsive": ["responsive"],
    "work_location": ["work_location"], "award_project": ["project"],
    "award_package_no": ["package_no"], "award_method": ["method"],
}


def printed(rec, key):
    """Did the document print a value for this field, under any spelling?"""
    f = (rec["fields"] or {}).get(key) or {}
    return bool((f.get("value") or "").strip())


def no_field_changed(rows):
    """No row of the reprinted change table both names a field and differs."""
    return not any(x["field"] and x["value_changed"] == "yes" for x in rows)


ALWAYS = None  # the blank is itself the meaning: nothing is missing


# Every column that has a blank cell anywhere, with the reason it is blank and
# the test that reason has to pass. Each test reads the row and a small set of
# lookups built in blanks(). A blank not covered here is printed.
EXPLAINED = [
    ("documents", "tender_id", "a reference rulebook carries no tender number",
     lambda r, c: r["kind"] == "reference_rulebook"),
    ("documents", "duplicate_text_of",
     "blank where no other document has identical text", ALWAYS),
    ("documents", "read_error", "blank because the PDF was read without error",
     ALWAYS),
    ("documents", "creator pdf_modified",
     "the PDF's own metadata dictionary prints no such key", ALWAYS),
    ("documents", "interleaved_layout_detail",
     "blank where no field value contained another field's label", ALWAYS),

    ("tenders", "amendment_no amendment_no_printed",
     "the notice is not an amended one", lambda r, c: r["amended"] == "no"),
    ("tenders", "amendment_changed_fields",
     "the notice is not amended, or its amendment reprinted no table of "
     "changes, or no row of that table names a field whose value differs",
     lambda r, c: (r["amended"] == "no"
                   or c["amend"][r["tender_id"]]["has_change_table"] == "no"
                   or no_field_changed(c["changes"].get(r["tender_id"], ())))),

    ("contracts", "contract_no contract_description tenders_sold "
     "tenders_received tenders_responsive performance_security_on_time "
     "contract_signed_on_time",
     "the newer award template prints none of these",
     lambda r, c: r["award_template"] == "economic-operator"),
    ("contracts", "winner_tenderer_id",
     "the older award template prints no tenderer id",
     lambda r, c: r["award_template"] == "supplier"),

    ("bids", "documents_sold bids_received bids_responsive "
     "bought_but_did_not_bid received_but_not_responsive "
     "responsive_but_not_awarded single_bid_received single_bid_responsive "
     "all_received_were_responsive",
     "the award notice printed no bid counts, so no stage count can be given",
     lambda r, c: r["counts_printed"] == "no"),
    ("bids", "count_anomaly",
     "blank where the three counts and the winner are consistent", ALWAYS),

    ("eligibility_criteria", "money_original money_scale_words money_reading",
     "the clause names no sum of money", ALWAYS),
    ("eligibility_criteria", "money_taka",
     "the clause names no sum of money, or the sums it names could not be read "
     "from the page with certainty",
     lambda r, c: (not (r["money_original"] or "").strip()
                   or r["money_unresolved"] == "yes")),
    ("eligibility_criteria", "money_words",
     "no sum of money in the clause prints its amount in words beside the "
     "digits", ALWAYS),
    ("eligibility_criteria", "money_unresolved",
     "no figure of money in the clause was left unread", ALWAYS),
    ("eligibility_criteria", "years", "the clause names no number of years",
     ALWAYS),
    ("eligibility_criteria", "contract_counts",
     "the clause names no number of contracts", ALWAYS),
    ("eligibility_criteria", "percentages", "the clause names no percentage",
     ALWAYS),

    ("lots", "security_amount_taka security_amount_original",
     "the lot table printed no security amount for this lot", ALWAYS),
    ("lots", "start_date completion_date",
     "the lot table printed no such date for this lot", ALWAYS),

    ("amendments", "changed_fields",
     "the amendment reprinted no table of changes, or no row of that table "
     "names a field whose value differs from the one first published",
     lambda r, c: (r["has_change_table"] == "no"
                   or no_field_changed(c["changes"].get(r["tender_id"], ())))),
    ("amendments", "notice_text",
     "the amendment block printed a table of changes and no narrative",
     lambda r, c: r["has_change_table"] == "yes"),
    ("amendment_changes", "field",
     "the row of the change table printed no field name", ALWAYS),
    ("amendment_changes", "new_value",
     "the change table printed an empty new value", ALWAYS),

    ("beneficial_owners", "designation country",
     "the ownership block left this column empty for this owner", ALWAYS),

    ("companies", "other_printed_names", "the name is printed one way only",
     ALWAYS),
    ("companies", "tenderer_ids_printed",
     "no award naming this company printed a tenderer id", ALWAYS),

    ("people", "other_printed_names", "the name is printed one way only",
     ALWAYS),
    ("people", "designations_printed",
     "no document printed a designation beside this name", ALWAYS),
    ("people", "organizations tender_ids",
     "a declared beneficial owner is named in an ownership block, which names "
     "no organisation and no tender",
     lambda r, c: r["roles"] == "beneficial owner"),
    ("people", "declared_owner_of declared_ownership",
     "this person is not named as the beneficial owner of anything",
     lambda r, c: "beneficial owner" not in r["roles"]),

    ("organizations", "other_printed_names", "the name is printed one way only",
     ALWAYS),
    ("organizations", "districts",
     "the only document naming this office is the one two-column notice whose "
     "layout is flagged in documents.csv",
     lambda r, c: r["first_document"] in c["flagged"]),
    ("organizations", "parent_named",
     "a ministry is the top level: no organisation is printed above it",
     lambda r, c: r["roles"] == "ministry"),
    ("organizations", "winners",
     "this office published no contract award in the archive",
     lambda r, c: r["awards_published"] == "0"),

    ("projects", "other_printed_names", "the name is printed one way only",
     ALWAYS),
    ("projects", "project_codes_printed",
     "no document printed a code beside this project name", ALWAYS),
    ("projects", "procuring_entities",
     "the document naming this project named no procuring entity", ALWAYS),

    ("relationships", "detail", "the relation needs no qualifier", ALWAYS),
    ("normalization", "original",
     "the printed field was empty, which is what the rule repaired",
     lambda r, c: r["rule"] == "id-from-filename"),
    ("name_candidate_pairs", "measure",
     "only the edit-distance test yields a number to record",
     lambda r, c: r["resemblance"] != "differs by at most two characters"),
    ("companies people organizations projects",
     "name_read_from_interleaved_layout",
     "blank where the name was not read from a two-column page", ALWAYS),
]

# The columns not_dropped() has already proved: blank because the document
# printed nothing under that label, checked field by field against the
# extraction record rather than asserted.
PRINTED_NOTHING = ("the document printed nothing under this label, proved "
                   "against the extraction record")

TABLES_TO_SWEEP = ("documents tenders contracts bids eligibility_criteria lots "
                   "amendments amendment_changes beneficial_owners companies "
                   "people organizations projects locations relationships "
                   "timeline normalization name_candidate_pairs").split()


def not_dropped(ext, t):
    """No blank in tenders.csv or contracts.csv hides a value that was printed."""
    byfile = dict((r["file"], r) for r in ext["documents"])
    lost, blanks_proved = [], 0
    for name, filecol, fields, dates in (
            ("tenders", "notice_file", NOTICE_FIELD, NOTICE_DATE),
            ("contracts", "award_file", AWARD_FIELD, {})):
        for r in t[name]:
            rec = byfile[r[filecol]]
            for col, keys in fields.items():
                if (r[col] or "").strip():
                    continue
                blanks_proved += 1
                got = [k for k in keys if printed(rec, k)]
                if got:
                    lost.append("%s %s is blank but %s printed %s" %
                                (r[filecol], col, keys[0],
                                 value(rec, got[0])[:40]))
            for col, key in dates.items():
                if (r[col] or "").strip():
                    continue
                blanks_proved += 1
                hit = [d for d in rec["dates"] if d["field"] == key]
                if hit:
                    lost.append("%s %s is blank but the notice printed %s" %
                                (r[filecol], col, hit[0]["original"]))
    check(not lost, "%d blanks are the document printing nothing there" %
          blanks_proved, "; ".join(lost[:4]))


def value(rec, key):
    return ((rec["fields"] or {}).get(key) or {}).get("value") or ""


def blanks(ext, t):
    """Every empty cell in every table, and the named reason it is empty."""
    not_dropped(ext, t)
    flagged = set(d["file"] for d in t["documents"]
                  if d["interleaved_layout_warnings"] not in ("", "0"))
    ctx = {"flagged": flagged,
           "amend": dict((r["tender_id"], r) for r in t["amendments"]),
           "changes": collections.defaultdict(list)}
    for r in t["amendment_changes"]:
        ctx["changes"][r["tender_id"]].append(r)

    covered = {}
    for name, cols, reason, test in EXPLAINED:
        for table_name in name.split():
            for col in cols.split():
                covered[(table_name, col)] = (reason, test)
    for col in list(NOTICE_FIELD) + list(NOTICE_DATE):
        covered.setdefault(("tenders", col), (PRINTED_NOTHING, ALWAYS))
    for col in AWARD_FIELD:
        covered.setdefault(("contracts", col), (PRINTED_NOTHING, ALWAYS))
    proved = dict((k, 0) for k in covered)
    failed = []
    for name in TABLES_TO_SWEEP:
        for r in t[name]:
            for col, raw in r.items():
                if (raw or "").strip():
                    continue
                got = covered.get((name, col))
                if got is None:
                    failed.append("%s.%s has an unexplained blank" % (name, col))
                    covered[(name, col)] = ("UNEXPLAINED", ALWAYS)
                    proved[(name, col)] = 0
                    continue
                proved[(name, col)] += 1
                reason, test = got
                if test is not ALWAYS and not test(r, ctx):
                    failed.append("%s.%s blank in %s but the reason %r does not "
                                  "hold" % (name, col,
                                            r.get("tender_id") or r.get("id")
                                            or r.get("file") or "a row", reason))
    check(not failed, "every blank cell in %d tables has a reason that holds"
          % len(TABLES_TO_SWEEP), "; ".join(sorted(set(failed))[:6]))
    return covered, proved


# ---------------------------------------------------------------- distributions
def num(rows, col):
    return [float(r[col]) for r in rows if (r[col] or "").strip()]


def distributions(t, ext):
    """Counts that have to add up, and the shape of what the documents printed."""
    con, bids = t["contracts"], t["bids"]
    total = sum(num(con, "contract_value_taka"))
    check(abs(total - sum(num(t["master"], "contract_value_taka"))) < 0.01,
          "contract value totals the same in contracts.csv and the master table",
          "%.2f" % total)
    check(not [v for v in num(con, "contract_value_taka") if v <= 0],
          "every printed contract value is a positive number")
    check(len(num(con, "contract_value_taka")) == len(con),
          "every award prints a contract value", "%d of %d" %
          (len(num(con, "contract_value_taka")), len(con)))

    monotone = []
    for b in bids:
        if b["counts_printed"] != "yes":
            continue
        sold, recv, resp = (int(b["documents_sold"]), int(b["bids_received"]),
                            int(b["bids_responsive"]))
        if recv > sold:
            monotone.append("%s received %d of %d sold" % (b["tender_id"], recv,
                                                           sold))
        if resp > recv:
            monotone.append("%s responsive %d of %d received" % (b["tender_id"],
                                                                 resp, recv))
    check(not monotone, "no funnel stage is larger than the stage before it",
          "; ".join(monotone[:3]))
    anomalies = [b["tender_id"] + ": " + b["count_anomaly"] for b in bids
                 if b["count_anomaly"]]
    NOTE.extend("bid count anomaly, printed as the document prints it - " + a
                for a in anomalies)

    st = collections.Counter(r["status"] or "(no status printed)"
                             for r in t["tenders"])
    check(sum(st.values()) == len(t["tenders"]),
          "the status vocabulary accounts for every notice",
          "%d values" % len(st))
    dates = sorted(r["date"] for r in t["timeline"])
    check(all(re.match(r"^\d{4}-\d{2}-\d{2}$", d) for d in dates),
          "every timeline date is a full ISO date",
          "%s to %s" % (dates[0], dates[-1]))
    years = collections.Counter(d[:4] for d in dates)
    NOTE.append("timeline spans %s to %s; busiest year %s with %d events"
                % (dates[0], dates[-1], years.most_common(1)[0][0],
                   years.most_common(1)[0][1]))
    win = collections.Counter(r["winner"] for r in con)
    NOTE.append("%d awards to %d distinct printed winners; the most frequent "
                "won %d" % (len(con), len(win), win.most_common(1)[0][1]))
    return {"contract_value_total_taka": round(total, 2),
            "status_counts": dict(st), "timeline_first": dates[0],
            "timeline_last": dates[-1], "count_anomalies": anomalies}


# ------------------------------------------------------- the district spellings
def alias_evidence(t):
    """Which offices print more than one district spelling, and on which page.

    Two spellings of what may be one district - Chattogram and Chittagong - both
    appear in this archive. Nothing outside the documents may settle that, so the
    question is put to the documents: does one office, identified by the name or
    the code the portal prints for it, print both? The pairs are listed with the
    files that print them and nothing is merged here.
    """
    by = collections.defaultdict(lambda: collections.defaultdict(list))
    for r in t["tenders"]:
        key = r["procuring_entity_code"] or r["procuring_entity"]
        if key and r["district_original"]:
            by[key][r["district_original"]].append(r["notice_file"])
    for r in t["contracts"]:
        key = r["award_procuring_entity_code"] or r["award_procuring_entity"]
        if key and r["award_district"]:
            by[key][r["award_district"]].append(r["award_file"])
    both = []
    for key, spellings in sorted(by.items()):
        if len(spellings) < 2:
            continue
        both.append({"office": key,
                     "spellings": dict((s, len(f)) for s, f in
                                       sorted(spellings.items())),
                     "example_files": dict((s, f[0]) for s, f in
                                           sorted(spellings.items()))})
    spell = collections.Counter()
    for r in t["tenders"]:
        if r["district_original"]:
            spell[r["district_original"]] += 1
    for r in t["contracts"]:
        if r["award_district"]:
            spell[r["award_district"]] += 1
    print("     %d distinct district spellings; %d offices print more than one"
          % (len(spell), len(both)))
    for row in both:
        print("     %s: %s" % (row["office"][:44],
                               ", ".join("%s x%d" % kv for kv in
                                         row["spellings"].items())))
    NOTE.append("%d offices print more than one district spelling; the archive "
                "itself is the only evidence permitted for treating two "
                "spellings as one place, and nothing has been merged"
                % len(both))
    return {"district_spellings": dict(spell),
            "offices_printing_more_than_one": both}


# ------------------------------------------------------------------------- main
def main():
    ext, inv, proven, t = load()
    print("\nreconciliation with the two upstream stages")
    reconcile(ext, inv, t)
    print("\nagreement with a parser written separately (verify_pdfs.py)")
    cross_check(proven, t)
    print("\nintegrity")
    integrity(t)
    print("\nevery blank explained")
    covered, proved = blanks(ext, t)
    print("\ndistributions")
    dist = distributions(t, ext)
    print("\ndistrict spellings")
    alias = alias_evidence(t)

    reasons = {}
    for (name, col), (reason, _) in sorted(covered.items()):
        if proved.get((name, col)):
            reasons.setdefault(name, {})[col] = {
                "blank_cells": proved[(name, col)], "reason": reason}
    report = {"generated": time.strftime("%Y-%m-%dT%H:%M:%S"),
              "checks_run": CHECKS[0], "checks_failed": FAIL,
              "award_cells_compared_with_the_earlier_parser": CELLS[0],
              "blank_reasons": reasons, "distributions": dist,
              "district_spelling_evidence": alias, "notes": NOTE}
    with io.open(os.path.join(DATA, "audit_report.json"), "w",
                 encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=1)

    print("\nnotes for the editor")
    for n in NOTE:
        print("   - %s" % n)
    print("\n%d checks run, %d failed" % (CHECKS[0], len(FAIL)))
    for f in FAIL:
        print("   FAIL %s" % f)
    print("blank reasons written for %d columns across %d tables"
          % (sum(len(v) for v in reasons.values()), len(reasons)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    raise SystemExit(main())





