#!/usr/bin/env python3
"""Phase 3-4 - the master dataset, and every normalisation with its reason.

Reads data/extracted.json and writes one table per entity into data/tables/,
plus master_dataset.csv / master_dataset.json joining a tender to its award.

Two rules govern this stage.

  * Nothing is discarded. Every normalised value keeps the original beside it,
    and every rule that changed a value is logged in normalization.csv with the
    reason it fired and a confidence, so a reader can undo any of it.

  * Nothing is merged on resemblance. Two names become one entity only when
    they are identical after case, punctuation and the "M/S." prefix are set
    aside. Names that merely look related are recorded as candidate pairs for a
    human to judge, never silently joined.

    .venv/bin/python -P investigation/parser/03_dataset.py
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

NORMLOG = []
SEEN_RULE = collections.Counter()


def note(field, original, normalized, rule, reason, confidence):
    """Record one normalisation so it can be read back and undone."""
    if original == normalized:
        return normalized
    key = (field, rule, original, normalized)
    SEEN_RULE[key] += 1
    if SEEN_RULE[key] == 1:
        NORMLOG.append({"field": field, "original": original,
                        "normalized": normalized, "rule": rule,
                        "reason": reason, "confidence": confidence})
    return normalized


def flat(s):
    return re.sub(r"\s+", " ", s or "").strip()


AMEND_NO = re.compile(r"^\s*(\d+)\b")


def amendment_number(printed):
    """The amendment's serial number, and the cell as it was printed.

    Some notices print the serial number and then the narrative of the change in
    the same cell with no label between them, so the cell reads "1 Corrigendum
    Last Date and Time For Tender/proposal closing...". The number is taken from
    the front and the whole cell is kept beside it.
    """
    s = flat(printed)
    m = AMEND_NO.match(s)
    if not m:
        return "", s
    if m.group(1) != s:
        note("amendment_no", s, m.group(1), "leading-serial-number",
             "the amendment cell prints the serial number and then the "
             "narrative of the change, with no label between them", "high")
    return m.group(1), s


def label_rx(text):
    """A label as printed, tolerant of the portal wrapping it mid-phrase."""
    return re.escape(text).replace("\\ ", r"\s*").replace(" ", r"\s*")


SUSPECT_VALUES = set()


def layout_warnings(ext):
    """Documents where one field's value contains another field's label.

    A handful of notices are printed in two columns whose text order interleaves
    a label with its neighbour's value, so "Rajdhani Unnayan Procuring Entity
    Name office of the Chief Kartripakkha (RAJUK) : Engineer" is one cell. Those
    values cannot be cleanly separated by any rule, so the documents are counted
    and named here instead of being quietly trimmed.

    Every offending value is also remembered in SUSPECT_VALUES, so that an
    entity whose name is one of them carries the warning into its own row.
    """
    labels = set()
    for rec in ext["documents"]:
        for f in (rec["fields"] or {}).values():
            lb = flat(f.get("label") or "")
            # long, multi-word labels only: a one-word label like "Organization"
            # or "Description" also occurs in ordinary prose, and flagging that
            # would bury the real layout faults in noise.
            if len(lb) >= 14 and lb.count(" ") >= 2:
                labels.add(lb)
    rx = re.compile("|".join(label_rx(l)
                             for l in sorted(labels, key=len, reverse=True)))
    out = {}
    for rec in ext["documents"]:
        for key, f in (rec["fields"] or {}).items():
            value = f.get("value") or ""
            if key in BLOCK_FIELDS or len(value) < 12:
                continue
            for m in rx.finditer(value):
                if m.start() == 0:
                    continue
                SUSPECT_VALUES.add(flat(value))
                out.setdefault(rec["file"], []).append(
                    "%s contains the label %s" % (key, flat(m.group(0))))
    return out


# fields whose value is a block of printed text that legitimately contains other
# labels: the address block is sub-parsed, and eligibility prose quotes the
# notice's own headings back at the reader.
BLOCK_FIELDS = set("inviting_block eligibility eligibility_consultant "
                   "amendment_text amendment_no experience_required".split())


# --------------------------------------------------------------- match keys
# A key is only ever used to decide whether two printed names are the same
# name. It is never shown to a reader in place of what the document printed.
MS_PREFIX = re.compile(r"^\s*(?:m\s*/\s*s|m\s*\.\s*s)\s*\.?\s+", re.I)
PUNCT = re.compile(r"[^A-Z0-9 ]+")


def company_key(name):
    """Same firm, same key: case, punctuation and the "M/S." prefix set aside.

    Legal-form words are deliberately kept. "Rahman Builders" and "Rahman
    Builders Ltd." stay two entities, because the documents do not say they are
    one and a merge would invent a fact.
    """
    s = MS_PREFIX.sub("", flat(name)).upper()
    return re.sub(r"\s+", " ", PUNCT.sub(" ", s)).strip()


def person_key(name):
    """Same person, same key. Honorifics are kept - "Md." is part of a name."""
    return re.sub(r"\s+", " ", PUNCT.sub(" ", flat(name).upper())).strip()


org_key = person_key


POSTCODE = re.compile(r"\s*[-,]\s*\d{4}\s*$")


def district_name(value):
    """District as printed, with the postal code the address block appends cut."""
    s = flat(value)
    out = POSTCODE.sub("", s)
    if out != s:
        note("district", s, out, "strip-postcode",
             "the address block prints the postal code after the district name",
             "high")
    return out


STATUSES = ["Contract Awarded", "Contract Terminated", "To be Re-Tendered",
            "Re-Tendered", "Being processed", "Rejected", "Cancelled", "Live",
            "Amendment/Corrigendum issued"]


def status_name(value):
    """The portal's own status word, with any wrapped reference-number tail cut.

    The status cell is followed on the page by the tail of the invitation
    reference number, so a raw slice reads "Contract Awarded 26/OTM/Goods/
    Furniture". The vocabulary is closed - these nine values account for every
    non-blank status in the archive - so the leading term is the status and the
    remainder belongs to the neighbouring field.
    """
    s = flat(value)
    if not s:
        return ""
    for want in STATUSES:
        if s.lower().startswith(want.lower()):
            if s != want:
                note("status", s, want, "leading-status-term",
                     "the status cell is followed by the wrapped tail of the "
                     "invitation reference number", "high")
            return want
    note("status", s, "", "unrecognised-status",
         "not one of the nine status terms the portal prints", "low")
    return ""


NUM_RE = re.compile(r"-?\d[\d,]*(?:\.\d+)?")
SCALES = [("crore", 10000000.0), ("koti", 10000000.0), ("lakh", 100000.0),
          ("lac", 100000.0), ("lakhs", 100000.0), ("million", 1000000.0),
          ("billion", 1000000000.0), ("thousand", 1000.0)]


def money(value, field="amount"):
    """A figure in taka, the words that scaled it, and what was printed.

    "Tk.15 (Fifteen) Lacs" is fifteen hundred thousand; multiplying by a scale
    word is the one step in this pipeline that could be wrong, so the word that
    was applied is recorded next to the result.
    """
    s = flat(value)
    if not s:
        return {"original": "", "taka": None, "scale": ""}
    m = NUM_RE.search(s.replace(",", ""))
    if not m:
        return {"original": s, "taka": None, "scale": ""}
    taka = float(m.group(0))
    scale = ""
    tail = s[s.find(m.group(0)) + len(m.group(0)):].lower()
    for word, mult in SCALES:
        if re.search(r"\b" + word + r"\b", tail):
            taka, scale = taka * mult, word
            note(field, s, "%.2f" % taka, "scale-word",
                 "the figure is printed in %s; multiplied by %d" % (word, mult),
                 "medium")
            break
    return {"original": s, "taka": taka, "scale": scale}


def value_of(rec, key):
    return flat((rec["fields"].get(key, {}) or {}).get("value", ""))


def page_of(rec, key):
    return (rec["fields"].get(key, {}) or {}).get("page")


def iso_of(rec, key):
    return next((d["iso"] for d in rec["dates"] if d["field"] == key), None)


def raw_date(rec, key):
    return next((d["original"] for d in rec["dates"] if d["field"] == key), "")


def taka_of(rec, key):
    return next((m["taka"] for m in rec["money"] if m["field"] == key), None)


def tender_id_of(rec):
    """The portal's tender id, from the field, or the filename that carries it."""
    got = value_of(rec, "tender_id")
    m = re.match(r"^\d+$", got)
    if m:
        return got
    m = re.search(r"(\d{4,})", os.path.basename(rec["file"]))
    if m:
        note("tender_id", got, m.group(1), "id-from-filename",
             "the field was empty or unparseable; the portal names the file "
             "after the tender id", "medium")
        return m.group(1)
    return ""


# ----------------------------------------------------------------- registries
class Registry(object):
    """Names seen in the documents, grouped only by exact key equality."""

    def __init__(self, prefix, keyfn):
        self.prefix = prefix
        self.keyfn = keyfn
        self.by_key = {}
        self.order = []

    def add(self, printed, file=None, page=None, role=""):
        printed = flat(printed)
        if not printed:
            return ""
        key = self.keyfn(printed)
        if not key:
            return ""
        item = self.by_key.get(key)
        if item is None:
            item = {"id": "%s%04d" % (self.prefix, len(self.order) + 1),
                    "key": key, "name": printed, "names": [printed],
                    "roles": [], "documents": [], "first_page": page}
            self.by_key[key] = item
            self.order.append(item)
        if printed not in item["names"]:
            item["names"].append(printed)
            note(self.prefix, printed, item["name"], "same-key",
                 "identical after case, punctuation and the M/S. prefix are "
                 "set aside", "high")
        if role and role not in item["roles"]:
            item["roles"].append(role)
        if file and file not in item["documents"]:
            item["documents"].append(file)
        return item["id"]

    def id_of(self, printed):
        return (self.by_key.get(self.keyfn(flat(printed))) or {}).get("id", "")

    def rows(self):
        return self.order


COMPANIES = Registry("co", company_key)
PEOPLE = Registry("pp", person_key)
ORGS = Registry("og", org_key)
PROJECTS = Registry("pr", org_key)

RELATIONS = []


def link(src_type, src_id, relation, dst_type, dst_id, file, page, detail=""):
    if not (src_id and dst_id):
        return
    RELATIONS.append({"source_type": src_type, "source_id": src_id,
                      "relation": relation, "target_type": dst_type,
                      "target_id": dst_id, "detail": detail,
                      "evidence_file": file, "evidence_page": page})


TIMELINE = []


def event(when, kind, tender_id, entity, file, page, original=""):
    if not when:
        return
    TIMELINE.append({"date": when, "event": kind, "tender_id": tender_id,
                     "entity": entity, "original": original,
                     "source_file": file, "page": page})


# ------------------------------------------------------------------ the notice
def notice_row(rec):
    """The tender as the invitation described it: who may enter, and when."""
    tid = tender_id_of(rec)
    f = rec["file"]
    ministry = value_of(rec, "ministry")
    agency = value_of(rec, "agency")
    pe = value_of(rec, "pe")
    district = district_name(value_of(rec, "pe_district"))
    ministry_id = ORGS.add(ministry, f, page_of(rec, "ministry"), "ministry")
    agency_id = ORGS.add(agency, f, page_of(rec, "agency"), "agency")
    pe_id = ORGS.add(pe, f, page_of(rec, "pe"), "procuring entity")
    project = value_of(rec, "project")
    project_id = PROJECTS.add(project, f, page_of(rec, "project"),
                              "charged a tender notice")
    officer = value_of(rec, "inviting_name") or value_of(rec, "inviting_officer")
    officer_id = PEOPLE.add(officer, f, page_of(rec, "inviting_name"),
                            "official inviting the tender")

    link("organization", pe_id, "part of", "organization", agency_id, f,
         page_of(rec, "agency"))
    link("organization", agency_id, "part of", "organization", ministry_id, f,
         page_of(rec, "ministry"))
    link("person", officer_id, "invited tender", "tender", tid, f,
         page_of(rec, "inviting_name"), value_of(rec, "inviting_designation"))
    link("organization", pe_id, "advertised", "tender", tid, f, page_of(rec, "pe"))
    if project_id:
        link("tender", tid, "belongs to project", "project", project_id, f,
             page_of(rec, "project"))

    price = money(value_of(rec, "doc_price"), "document price")
    for key, label in (("published", "notice published"),
                       ("last_selling", "last day to buy the document"),
                       ("premeet_start", "pre-tender meeting starts"),
                       ("premeet_end", "pre-tender meeting ends"),
                       ("closing", "bid submission closes"),
                       ("opening", "bids opened"),
                       ("security_last", "last day for bid security"),
                       ("security_valid", "bid security valid until"),
                       ("tender_valid", "tender valid until")):
        event(iso_of(rec, key), label, tid, pe, f, page_of(rec, key),
              raw_date(rec, key))

    elig = rec["eligibility"] or {}
    return {
        "tender_id": tid, "notice_file": f, "notice_pages": rec["pages"],
        "ministry": ministry, "ministry_id": ministry_id,
        "agency": agency, "agency_id": agency_id,
        "procuring_entity": pe, "procuring_entity_id": pe_id,
        "procuring_entity_code": value_of(rec, "pe_code"),
        "district": district, "district_original": value_of(rec, "pe_district"),
        "city": value_of(rec, "city"), "thana": value_of(rec, "thana"),
        "country": value_of(rec, "country"), "phone": value_of(rec, "phone"),
        "procurement_nature": value_of(rec, "nature"),
        "procurement_type": value_of(rec, "ptype"),
        "event_type": value_of(rec, "event"),
        "invitation_for": value_of(rec, "invitation_for"),
        "invitation_ref": value_of(rec, "invitation_ref"),
        "status": status_name(value_of(rec, "status")),
        "status_original": value_of(rec, "status"),
        "app_id": value_of(rec, "app_id"),
        "method": value_of(rec, "method"),
        "budget_type": value_of(rec, "budget_type"),
        "source_of_funds": value_of(rec, "funds"),
        "development_partner": value_of(rec, "partner"),
        "project_code": value_of(rec, "project_code"),
        "project": project, "project_id": project_id,
        "package_no": value_of(rec, "package_no"),
        "package_description": (value_of(rec, "desc_works")
                                or value_of(rec, "desc_goods")
                                or value_of(rec, "desc_services")
                                or value_of(rec, "desc_assignment")),
        "category": value_of(rec, "category"),
        "evaluation_type": value_of(rec, "eval_type"),
        "document_price_taka": price["taka"],
        "document_price_original": price["original"],
        "payment_mode": value_of(rec, "payment_mode"),
        "published_date": iso_of(rec, "published"),
        "last_selling_date": iso_of(rec, "last_selling"),
        "premeeting_start": iso_of(rec, "premeet_start"),
        "premeeting_end": iso_of(rec, "premeet_end"),
        "closing_date": iso_of(rec, "closing"),
        "opening_date": iso_of(rec, "opening"),
        "security_last_date": iso_of(rec, "security_last"),
        "security_valid_until": iso_of(rec, "security_valid"),
        "tender_valid_until": iso_of(rec, "tender_valid"),
        "inviting_officer": officer, "inviting_officer_id": officer_id,
        "inviting_officer_designation": value_of(rec, "inviting_designation"),
        "lots": len(rec["lots"]),
        "eligibility_source_field": elig.get("source_field") or "",
        "eligibility_page": elig.get("page"),
        "eligibility_chars": elig.get("chars", 0),
        "eligibility_clauses": len(elig.get("clauses") or []),
        "eligibility_numbering": elig.get("numbering", ""),
        "eligibility_published": elig.get("criteria_published", False),
        "eligibility_substantive": elig.get("substantive", False),
        "eligibility_categories": ";".join(elig.get("categories") or []),
        "amended": bool(rec["amendment"]),
        "amendment_no": amendment_number(
            (rec["amendment"] or {}).get("number", ""))[0],
        "amendment_no_printed": flat((rec["amendment"] or {}).get("number", "")),
        "amendment_changed_fields": ";".join(
            (rec["amendment"] or {}).get("changed_fields") or []),
        "eligibility_amended": (rec["amendment"] or {}).get("eligibility_changed",
                                                            False),
    }


# ------------------------------------------------------------------- the award
def award_row(rec):
    """The tender as the award described it: who won, for how much, and when.

    The archive prints two generations of this notice. The older one names a
    "Supplier/Contractor/Consultant" and prints the three bid counts; the newer
    one names an "Economic Operator", adds a beneficial-ownership block, and
    prints no bid counts and no contract number. Both are read; which generation
    a row came from is kept in `template`, because a blank count in a newer
    notice means "the portal never printed it", not "nobody bid".
    """
    tid = tender_id_of(rec)
    f = rec["file"]
    ministry = value_of(rec, "ministry")
    agency = value_of(rec, "agency")
    pe = value_of(rec, "pe")
    ministry_id = ORGS.add(ministry, f, page_of(rec, "ministry"), "ministry")
    agency_id = ORGS.add(agency, f, page_of(rec, "agency"), "agency")
    pe_id = ORGS.add(pe, f, page_of(rec, "pe"), "procuring entity")
    project = value_of(rec, "project")
    project_id = PROJECTS.add(project, f, page_of(rec, "project"),
                              "charged an awarded contract")

    new_gen = bool(value_of(rec, "supplier_eo"))
    supplier = value_of(rec, "supplier_eo") or value_of(rec, "supplier")
    supplier_page = page_of(rec, "supplier_eo") or page_of(rec, "supplier")
    supplier_id = COMPANIES.add(supplier, f, supplier_page, "contract awarded")
    officer = value_of(rec, "officer")
    officer_id = PEOPLE.add(officer, f, page_of(rec, "officer"),
                            "official approving the award")

    value = money(value_of(rec, "contract_value"), "contract value")
    link("company", supplier_id, "was awarded", "tender", tid, f, supplier_page,
         value["original"])
    link("organization", pe_id, "awarded contract to", "company", supplier_id, f,
         supplier_page, value["original"])
    link("person", officer_id, "approved award", "tender", tid, f,
         page_of(rec, "officer"), value_of(rec, "officer_designation"))
    link("organization", pe_id, "part of", "organization", agency_id, f,
         page_of(rec, "agency"))
    link("organization", agency_id, "part of", "organization", ministry_id, f,
         page_of(rec, "ministry"))
    if project_id:
        link("tender", tid, "belongs to project", "project", project_id, f,
             page_of(rec, "project"))

    for key, label in (("advertised", "tender advertised"),
                       ("noa_date", "notification of award issued"),
                       ("signed_date", "contract signed"),
                       ("start_date", "contract work starts"),
                       ("completion_date", "contract work completes")):
        event(iso_of(rec, key), label, tid, supplier or pe, f, page_of(rec, key),
              raw_date(rec, key))

    for owner in rec["beneficial_owners"]:
        person_id = PEOPLE.add(owner["name"], f, owner["page"], "beneficial owner")
        link("person", person_id, "declared beneficial owner of", "company",
             supplier_id, f, owner["page"],
             "%s%s" % (owner["designation"] or "",
                       ("" if owner["ownership_pct"] is None
                        else (" %g%%" % owner["ownership_pct"]))))

    return {
        "tender_id": tid, "award_file": f, "award_pages": rec["pages"],
        "award_template": "economic-operator" if new_gen else "supplier",
        "award_ministry": ministry, "award_ministry_id": ministry_id,
        "award_agency": agency, "award_agency_id": agency_id,
        "award_procuring_entity": pe, "award_procuring_entity_id": pe_id,
        "award_procuring_entity_code": value_of(rec, "pe_code"),
        "award_district": district_name(value_of(rec, "pe_district")),
        "award_for": value_of(rec, "award_for"),
        "award_method": value_of(rec, "method"),
        "award_source_of_funds": value_of(rec, "funds"),
        "award_development_partner": value_of(rec, "partner"),
        "award_project": project, "award_project_id": project_id,
        "award_invitation_ref": value_of(rec, "invitation_ref"),
        "award_package_no": value_of(rec, "package_no"),
        "award_package_name": value_of(rec, "package_name"),
        "contract_no": value_of(rec, "contract_no"),
        "contract_description": value_of(rec, "contract_desc"),
        "work_location": value_of(rec, "work_location"),
        "winner": supplier, "winner_id": supplier_id,
        "winner_page": supplier_page,
        "winner_location": (value_of(rec, "supplier_address_eo")
                            or value_of(rec, "supplier_location")),
        "winner_tenderer_id": value_of(rec, "tenderer_id"),
        "contract_value_taka": value["taka"],
        "contract_value_original": value["original"],
        "advertised_date": iso_of(rec, "advertised"),
        "noa_date": iso_of(rec, "noa_date"),
        "signed_date": iso_of(rec, "signed_date"),
        "work_start_date": iso_of(rec, "start_date"),
        "work_completion_date": iso_of(rec, "completion_date"),
        "tenders_sold": count_of(rec, "sold"),
        "tenders_received": count_of(rec, "received"),
        "tenders_responsive": count_of(rec, "responsive"),
        "bid_counts_printed": not new_gen,
        "performance_security_on_time": value_of(rec, "perf_security_ontime"),
        "contract_signed_on_time": value_of(rec, "signed_ontime"),
        "award_officer": officer, "award_officer_id": officer_id,
        "award_officer_designation": value_of(rec, "officer_designation"),
        "beneficial_owners": len(rec["beneficial_owners"]),
    }


def count_of(rec, key):
    """A printed bid count as an integer, or None where nothing was printed."""
    s = value_of(rec, key)
    m = re.match(r"^\d+$", s)
    if m:
        return int(s)
    if s:
        note(key, s, "", "count-not-a-number",
             "the count cell did not hold a plain integer", "low")
    return None


# ------------------------------------------------------------------- csv output
def cell(v):
    if v is None:
        return ""
    if v is True:
        return "yes"
    if v is False:
        return "no"
    if isinstance(v, float):
        # the portal prints contract values to three decimal places, so a figure
        # is written out in full and only the trailing zeros of the format are cut
        return ("%.6f" % v).rstrip("0").rstrip(".")
    return v


def write_csv(name, rows, columns=None, folder=None):
    """One table, UTF-8 with a BOM so Excel opens Bengali text correctly."""
    if columns is None:
        columns = []
        for r in rows:
            for k in r:
                if k not in columns:
                    columns.append(k)
    path = os.path.join(folder or TABLES, name)
    with io.open(path, "w", encoding="utf-8-sig", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(columns)
        for r in rows:
            w.writerow([cell(r.get(c)) for c in columns])
    return {"table": name, "rows": len(rows), "columns": len(columns)}


# ------------------------------------------------------------------ child rows
def eligibility_rows(rec, tid):
    """One row per requirement, with the sentence the notice actually printed.

    The categories are the machine-readable subject of a clause - experience,
    turnover, a certificate, a place, a brand. Whether a requirement is ordinary
    or unusual is a question about the whole archive, not about one clause, so it
    is answered in the analysis stage and not asserted here.
    """
    elig = rec["eligibility"] or {}
    out = []
    for cl in elig.get("clauses") or []:
        out.append({
            "tender_id": tid, "clause_no": cl["n"],
            "source_file": rec["file"], "page": elig.get("page"),
            "source_field": elig.get("source_field") or "",
            "printed_label": elig.get("label") or "",
            "text": cl["text"], "chars": cl["chars"],
            "categories": ";".join(cl["categories"]),
            "defers_to_another_document": "deferred" in cl["categories"],
            "money_taka": ";".join(("%.2f" % m["taka"]) if m["taka"] is not None
                                   else "" for m in cl["money"]),
            "money_original": " | ".join(m["original"] for m in cl["money"]),
            "money_words": " | ".join(m.get("words") or "" for m in cl["money"]),
            "money_scale_words": ";".join(sorted(set(m["scale"] for m in cl["money"]
                                                     if m["scale"]))),
            # why each figure reads as it does, and whether any could not be read
            "money_reading": " | ".join(m.get("basis") or "" for m in cl["money"]),
            "money_unresolved": ("yes" if any(m["taka"] is None
                                              for m in cl["money"]) else ""),
            "years": ";".join(str(y) for y in cl["years"]),
            "contract_counts": ";".join(str(c) for c in cl["contract_counts"]),
            "percentages": ";".join(("%g" % p) for p in cl["percentages"]),
        })
    return out


def lot_rows(rec, tid):
    return [{"tender_id": tid, "source_file": rec["file"], "page": lot["page"],
             "table_generation": lot["generation"], "lot_no": lot["lot_no"],
             "identification": lot["identification"], "location": lot["location"],
             "security_amount_taka": lot["security_amount"],
             "security_amount_original": lot["security_original"],
             "start_date": lot["start"], "completion_date": lot["completion"]}
            for lot in rec["lots"]]


def amendment_rows(rec, tid):
    """The amendment header, and one row per field the portal reprinted."""
    am = rec["amendment"] or {}
    if not am:
        return None, []
    number, printed = amendment_number(am.get("number", ""))
    head = {"tender_id": tid, "source_file": rec["file"], "page": am.get("page"),
            "amendment_no": number, "amendment_no_printed": printed,
            "changed_fields": ";".join(am.get("changed_fields") or []),
            "changed_field_count": len(am.get("changed_fields") or []),
            "eligibility_changed": am.get("eligibility_changed", False),
            "has_change_table": bool(am.get("changes")),
            "notice_text": am.get("text", "")}
    changes = [{"tender_id": tid, "source_file": rec["file"],
                "page": ch.get("page"), "amendment_no": number,
                "field": ch["field"], "old_value": ch["old"],
                "new_value": ch["new"], "value_changed": ch["changed"],
                "old_chars": len(ch["old"]), "new_chars": len(ch["new"])}
               for ch in am.get("changes") or []]
    return head, changes


def owner_rows(rec, tid, winner_id):
    return [{"tender_id": tid, "source_file": rec["file"], "page": o["page"],
             "company": o["company"], "company_id": winner_id,
             "serial": o["serial"], "owner_name": o["name"],
             "owner_id": PEOPLE.id_of(o["name"]),
             "designation": o["designation"],
             "ownership_pct": o["ownership_pct"], "country": o["country"]}
            for o in rec["beneficial_owners"]]


def bid_row(award):
    """The bid funnel exactly as far as the documents carry it, and no further.

    This archive contains no bidder-level record: no list of who bid, no quoted
    price, no evaluated amount, no ranking, no score, and no per-bidder reason
    for rejection. What the award notice prints is three counts and one winner.
    So a row here is a stage count for one tender, not a bid, and the column
    `bidder_level_data_available` says so on every row.

    A stage difference is recorded only where both of its counts were printed.
    "Left after the document was bought" is a count, not a motive: the notice
    never says why a bought document produced no bid.
    """
    sold = award["tenders_sold"]
    recv = award["tenders_received"]
    resp = award["tenders_responsive"]
    both = lambda a, b: None if (a is None or b is None) else a - b
    row = {
        "tender_id": award["tender_id"], "source_file": award["award_file"],
        "award_template": award["award_template"],
        "counts_printed": award["bid_counts_printed"],
        "documents_sold": sold, "bids_received": recv, "bids_responsive": resp,
        "bids_awarded": 1 if award["winner"] else 0,
        "bought_but_did_not_bid": both(sold, recv),
        "received_but_not_responsive": both(recv, resp),
        "responsive_but_not_awarded": (None if resp is None
                                       else resp - (1 if award["winner"] else 0)),
        "winner": award["winner"], "winner_id": award["winner_id"],
        "contract_value_taka": award["contract_value_taka"],
        "single_bid_received": None if recv is None else recv == 1,
        "single_bid_responsive": None if resp is None else resp == 1,
        "all_received_were_responsive": (None if (recv is None or resp is None)
                                         else recv == resp),
        "bidder_level_data_available": False,
        "bidder_level_note": ("the archive prints stage counts and the winner "
                              "only; no bidder list, quoted price, evaluated "
                              "amount, ranking or per-bidder rejection reason "
                              "appears in any supplied document"),
    }
    anomalies = []
    if row["bought_but_did_not_bid"] is not None and row["bought_but_did_not_bid"] < 0:
        anomalies.append("more bids received than documents sold")
    if (row["received_but_not_responsive"] is not None
            and row["received_but_not_responsive"] < 0):
        anomalies.append("more responsive bids than bids received")
    if resp == 0 and award["winner"]:
        anomalies.append("a winner is named although the responsive count is zero")
    row["count_anomaly"] = "; ".join(anomalies)
    return row


# ------------------------------------------------------- names that look alike
# Recorded, never acted on. A pair in this table is a question for a human
# reader: the documents do not say these are the same entity, so the dataset
# keeps them apart and prints the resemblance here instead.
LEGAL_FORM = set("LTD LIMITED PVT PRIVATE COMPANY CO CORP CORPORATION INC "
                 "THE".split())


def edit_within(a, b, limit=2):
    """True when a and b are at most `limit` single-character edits apart."""
    if abs(len(a) - len(b)) > limit:
        return False
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i] + [0] * len(b)
        best = cur[0]
        for j, cb in enumerate(b, 1):
            cur[j] = min(prev[j] + 1, cur[j - 1] + 1,
                         prev[j - 1] + (0 if ca == cb else 1))
            best = min(best, cur[j])
        if best > limit:
            return False
        prev = cur
    return prev[-1] <= limit


def candidate_pairs(registry, kind):
    """Pairs a reader might want to judge, with the reason they resemble."""
    items = registry.rows()
    stripped = []
    for it in items:
        words = [w for w in it["key"].split() if w]
        core = [w for w in words if w not in LEGAL_FORM]
        stripped.append((it, set(words), " ".join(core), frozenset(core)))
    out = []
    for i in range(len(stripped)):
        a, a_words, a_core, a_core_set = stripped[i]
        for j in range(i + 1, len(stripped)):
            b, b_words, b_core, b_core_set = stripped[j]
            reason, sim = "", ""
            if a_core_set and a_core_set == b_core_set:
                if a_core == b_core:
                    reason = "identical once legal-form words are set aside"
                else:
                    reason = "the same words in a different order"
            elif a_words < b_words or b_words < a_words:
                reason = "one name's words are all contained in the other"
            elif edit_within(a["key"], b["key"]):
                reason = "differs by at most two characters"
                sim = "edit distance <= 2"
            if not reason:
                continue
            out.append({"entity_type": kind, "id_a": a["id"], "name_a": a["name"],
                        "id_b": b["id"], "name_b": b["name"], "key_a": a["key"],
                        "key_b": b["key"], "resemblance": reason, "measure": sim,
                        "merged": False,
                        "documents_a": ";".join(a["documents"][:5]),
                        "documents_b": ";".join(b["documents"][:5])})
    return out


# --------------------------------------------------------------- table builders
def document_rows(inv, byfile):
    """Every PDF in the folder, readable or not, with what was read from it."""
    warned = layout_warnings({"documents": list(byfile.values())})
    out = []
    for d in inv["documents"]:
        rec = byfile.get(d["file"]) or {}
        warn = warned.get(d["file"]) or []
        out.append({
            "document_id": d["id"], "file": d["file"], "filename": d["filename"],
            "folder": d["folder"], "kind": d["kind"],
            "tender_id": tender_id_of(rec) if rec else "",
            "pages": d["pages"], "bytes": d["bytes"], "sha256": d["sha256"],
            "characters": d["chars"], "words": d["words"],
            "ruled_tables": d["tables"], "images": d["images"],
            "script": d["script"], "has_text_layer": d["text_layer"],
            "needs_ocr": d["needs_ocr"],
            "second_extractor_chars": d["pdfium_chars"],
            "extractors_agree": d["engines_agree"],
            "duplicate_text_of": d["duplicate_of"] or "",
            "read_error": d["error"] or "",
            "fields_read": len(rec.get("fields") or {}),
            "dates_read": len(rec.get("dates") or []),
            "eligibility_chars": (rec.get("eligibility") or {}).get("chars", 0),
            "lots_read": len(rec.get("lots") or []),
            "beneficial_owners_read": len(rec.get("beneficial_owners") or []),
            "creator": (d["metadata"] or {}).get("Creator", ""),
            "producer": (d["metadata"] or {}).get("Producer", ""),
            "pdf_created": (d["metadata"] or {}).get("CreationDate", ""),
            "pdf_modified": (d["metadata"] or {}).get("ModDate", ""),
            "interleaved_layout_warnings": len(warn),
            "interleaved_layout_detail": " | ".join(warn),
        })
    return out


def location_rows(notices, awards, byfile):
    """Places as the documents print them, counted. The archive has no
    coordinates of any kind, so nothing here can be put on a real map.

    Each place cites the page of the field it was printed in, so a reader can
    turn to it; the page comes from the extraction record rather than the built
    row, which keeps only the values.
    """
    seen = collections.OrderedDict()
    def add(level, printed, normalized, file, page):
        if not printed:
            return
        key = (level, printed)
        it = seen.get(key)
        if it is None:
            it = seen[key] = {"level": level, "printed": printed,
                              "normalized": normalized, "tenders": 0,
                              "first_source_file": file, "first_page": page,
                              "coordinates": "not documented in the supplied "
                                             "documents"}
        it["tenders"] += 1
    for n in notices:
        rec = byfile[n["notice_file"]]
        add("district", n["district_original"], n["district"], n["notice_file"],
            page_of(rec, "pe_district"))
        add("city", n["city"], n["city"], n["notice_file"],
            page_of(rec, "city"))
        add("thana", n["thana"], n["thana"], n["notice_file"],
            page_of(rec, "thana"))
        add("country", n["country"], n["country"], n["notice_file"],
            page_of(rec, "country"))
    for a in awards:
        rec = byfile[a["award_file"]]
        add("district", a["award_district"], a["award_district"],
            a["award_file"], page_of(rec, "pe_district"))
        add("work location", a["work_location"], a["work_location"],
            a["award_file"], page_of(rec, "work_location"))
        add("winner address", a["winner_location"], a["winner_location"],
            a["award_file"], a["winner_page"])
    return list(seen.values())


def push(bag, key, value):
    """Append once, keeping the order the documents introduced the value in."""
    if value and value not in bag[key]:
        bag[key].append(value)


def base(item, extra):
    row = {"id": item["id"], "name": item["name"],
           "match_key": item["key"],
           "other_printed_names": " | ".join(item["names"][1:]),
           "printed_name_variants": len(item["names"]),
           "roles": ";".join(item["roles"]),
           "documents": len(item["documents"]),
           "first_document": item["documents"][0] if item["documents"] else "",
           "first_page": item["first_page"],
           # a name read out of a two-column page can carry a neighbouring
           # label; the row is kept as printed and says so rather than being
           # tidied away
           "name_read_from_interleaved_layout":
               "yes" if any(n in SUSPECT_VALUES for n in item["names"]) else ""}
    row.update(extra)
    return row


def company_rows(awards, owners):
    """Firms named in the documents, with what the documents say they won."""
    agg = {}
    for a in awards:
        cid = a["winner_id"]
        if not cid:
            continue
        it = agg.get(cid)
        if it is None:
            it = agg[cid] = {"contracts_won": 0, "total_contract_value_taka": 0.0,
                             "values_missing": 0, "tenders": [], "buyers": [],
                             "agencies": [], "districts": [], "dates": [],
                             "addresses": [], "tenderer_ids": []}
        it["contracts_won"] += 1
        if a["contract_value_taka"] is None:
            it["values_missing"] += 1
        else:
            it["total_contract_value_taka"] += a["contract_value_taka"]
        push(it, "tenders", a["tender_id"])
        push(it, "buyers", a["award_procuring_entity"])
        push(it, "agencies", a["award_agency"])
        push(it, "districts", a["award_district"])
        push(it, "addresses", a["winner_location"])
        push(it, "tenderer_ids", a["winner_tenderer_id"])
        if a["noa_date"]:
            it["dates"].append(a["noa_date"])
    owned = collections.Counter(o["company_id"] for o in owners if o["company_id"])
    out = []
    for item in COMPANIES.rows():
        it = agg.get(item["id"]) or {}
        dates = sorted(it.get("dates") or [])
        out.append(base(item, {
            "contracts_won": it.get("contracts_won", 0),
            "total_contract_value_taka": it.get("total_contract_value_taka", 0.0),
            "contracts_with_no_value_printed": it.get("values_missing", 0),
            "first_award_date": dates[0] if dates else "",
            "last_award_date": dates[-1] if dates else "",
            "tender_ids": ";".join(it.get("tenders") or []),
            "procuring_entities": " | ".join(it.get("buyers") or []),
            "procuring_entity_count": len(it.get("buyers") or []),
            "agencies": " | ".join(it.get("agencies") or []),
            "districts": ";".join(it.get("districts") or []),
            "addresses_printed": " | ".join(it.get("addresses") or []),
            "tenderer_ids_printed": ";".join(it.get("tenderer_ids") or []),
            "beneficial_owners_declared": owned.get(item["id"], 0),
        }))
    return out


def people_rows(notices, awards, owners):
    """Named individuals: the officials who signed, and declared owners."""
    agg = {}
    def bag(pid):
        it = agg.get(pid)
        if it is None:
            it = agg[pid] = {"invited": 0, "approved": 0, "designations": [],
                             "organizations": [], "tenders": [], "owner_of": [],
                             "pct": []}
        return it
    for n in notices:
        if not n["inviting_officer_id"]:
            continue
        it = bag(n["inviting_officer_id"])
        it["invited"] += 1
        push(it, "designations", n["inviting_officer_designation"])
        push(it, "organizations", n["procuring_entity"])
        push(it, "tenders", n["tender_id"])
    for a in awards:
        if not a["award_officer_id"]:
            continue
        it = bag(a["award_officer_id"])
        it["approved"] += 1
        push(it, "designations", a["award_officer_designation"])
        push(it, "organizations", a["award_procuring_entity"])
        push(it, "tenders", a["tender_id"])
    for o in owners:
        if not o["owner_id"]:
            continue
        it = bag(o["owner_id"])
        push(it, "owner_of", o["company"])
        push(it, "designations", o["designation"])
        if o["ownership_pct"] is not None:
            it["pct"].append("%g%%" % o["ownership_pct"])
    out = []
    for item in PEOPLE.rows():
        it = agg.get(item["id"]) or {}
        out.append(base(item, {
            "tenders_invited": it.get("invited", 0),
            "awards_approved": it.get("approved", 0),
            "designations_printed": " | ".join(it.get("designations") or []),
            "organizations": " | ".join(it.get("organizations") or []),
            "tender_ids": ";".join(it.get("tenders") or []),
            "declared_owner_of": " | ".join(it.get("owner_of") or []),
            "declared_ownership": ";".join(it.get("pct") or []),
        }))
    return out


def organization_rows(notices, awards):
    """Ministries, agencies and procuring entities, and what they published.

    A notice and an award each name all three levels, so a district, a parent
    and a winner are attributed to every level named on the same document, not
    to the procuring entity alone. A ministry's winners are therefore the
    winners of every award published beneath it.
    """
    agg = {}
    def bag(oid):
        it = agg.get(oid)
        if it is None:
            it = agg[oid] = {"notices": 0, "awards": 0, "value": 0.0,
                             "districts": [], "winners": [], "parents": [],
                             "published": 0, "deferred": 0}
        return it
    def levels(ministry_id, agency_id, pe_id, ministry, agency):
        """(id, the name printed one level above it) for the levels named."""
        return [(ministry_id, ""), (agency_id, ministry), (pe_id, agency)]
    for n in notices:
        for oid, parent in levels(n["ministry_id"], n["agency_id"],
                                  n["procuring_entity_id"], n["ministry"],
                                  n["agency"]):
            if not oid:
                continue
            it = bag(oid)
            it["notices"] += 1
            push(it, "districts", n["district"])
            push(it, "parents", parent)
        pid = n["procuring_entity_id"]
        if pid:
            it = bag(pid)
            if n["eligibility_substantive"]:
                it["published"] += 1
            else:
                it["deferred"] += 1
    for a in awards:
        for oid, parent in levels(a["award_ministry_id"], a["award_agency_id"],
                                  a["award_procuring_entity_id"],
                                  a["award_ministry"], a["award_agency"]):
            if not oid:
                continue
            it = bag(oid)
            it["awards"] += 1
            if a["contract_value_taka"] is not None:
                it["value"] += a["contract_value_taka"]
            push(it, "districts", a["award_district"])
            push(it, "parents", parent)
            push(it, "winners", a["winner"])
    out = []
    for item in ORGS.rows():
        it = agg.get(item["id"]) or {}
        out.append(base(item, {
            "notices_published": it.get("notices", 0),
            "awards_published": it.get("awards", 0),
            "total_contract_value_taka": it.get("value", 0.0),
            "districts": ";".join(it.get("districts") or []),
            "parent_named": " | ".join(it.get("parents") or []),
            "notices_with_substantive_criteria": it.get("published", 0),
            "notices_without_substantive_criteria": it.get("deferred", 0),
            "distinct_winners": len(it.get("winners") or []),
            "winners": " | ".join((it.get("winners") or [])[:40]),
        }))
    return out


def project_rows(notices, awards):
    """Named projects or programmes a tender was charged to."""
    agg = {}
    for n in notices:
        pid = n["project_id"]
        if not pid:
            continue
        it = agg.setdefault(pid, {"notices": 0, "awards": 0, "value": 0.0,
                                  "codes": [], "owners": [], "tenders": []})
        it["notices"] += 1
        push(it, "codes", n["project_code"])
        push(it, "owners", n["procuring_entity"])
        push(it, "tenders", n["tender_id"])
    for a in awards:
        pid = a["award_project_id"]
        if not pid:
            continue
        it = agg.setdefault(pid, {"notices": 0, "awards": 0, "value": 0.0,
                                  "codes": [], "owners": [], "tenders": []})
        it["awards"] += 1
        if a["contract_value_taka"] is not None:
            it["value"] += a["contract_value_taka"]
        push(it, "owners", a["award_procuring_entity"])
        push(it, "tenders", a["tender_id"])
    out = []
    for item in PROJECTS.rows():
        it = agg.get(item["id"]) or {}
        out.append(base(item, {
            "notices": it.get("notices", 0), "awards": it.get("awards", 0),
            "total_contract_value_taka": it.get("value", 0.0),
            "project_codes_printed": ";".join(it.get("codes") or []),
            "procuring_entities": " | ".join(it.get("owners") or []),
            "tender_ids": ";".join(it.get("tenders") or []),
        }))
    return out


def master_rows(notices, awards):
    """A tender and its award side by side, joined on the portal's tender id.

    The join is one-to-one in this archive - 1,150 notice ids and 645 award ids
    with no id repeated in either set - so nothing is aggregated away here. A
    notice with no award keeps its award columns empty and says why in
    `award_document_found`; the reverse holds for an award with no notice.
    """
    n_by = collections.OrderedDict((n["tender_id"], n) for n in notices)
    a_by = collections.OrderedDict((a["tender_id"], a) for a in awards)
    ncols = sorted(set(k for n in notices for k in n))
    acols = sorted(set(k for a in awards for k in a))
    out = []
    for tid in list(n_by) + [t for t in a_by if t not in n_by]:
        row = dict((c, None) for c in ncols + acols)
        row.update(n_by.get(tid) or {})
        row.update(a_by.get(tid) or {})
        row["tender_id"] = tid
        row["notice_document_found"] = tid in n_by
        row["award_document_found"] = tid in a_by
        row["outcome_source"] = ("award notice" if tid in a_by
                                 else "tender notice status only")
        out.append(row)
    return out


# ------------------------------------------------------------------------ main
def main():
    started = time.time()
    if not os.path.isdir(TABLES):
        os.makedirs(TABLES)
    inv = json.load(io.open(os.path.join(DATA, "inventory.json"),
                            encoding="utf-8"))
    ext = json.load(io.open(os.path.join(DATA, "extracted.json"),
                            encoding="utf-8"))
    byfile = dict((r["file"], r) for r in ext["documents"])

    notices, awards = [], []
    elig, lots, amends, changes, owners = [], [], [], [], []
    for rec in ext["documents"]:
        if rec["kind"] == "tender_notice":
            row = notice_row(rec)
            notices.append(row)
            elig.extend(eligibility_rows(rec, row["tender_id"]))
            lots.extend(lot_rows(rec, row["tender_id"]))
            head, chs = amendment_rows(rec, row["tender_id"])
            if head:
                amends.append(head)
                changes.extend(chs)
        elif rec["kind"] == "contract_award":
            row = award_row(rec)
            awards.append(row)
            owners.extend(owner_rows(rec, row["tender_id"], row["winner_id"]))
    bids = [bid_row(a) for a in awards]

    docs = document_rows(inv, byfile)
    companies = company_rows(awards, owners)
    people = people_rows(notices, awards, owners)
    orgs = organization_rows(notices, awards)
    projects = project_rows(notices, awards)
    places = location_rows(notices, awards, byfile)
    master = master_rows(notices, awards)
    TIMELINE.sort(key=lambda e: (e["date"], e["tender_id"], e["event"]))

    pairs = (candidate_pairs(COMPANIES, "company")
             + candidate_pairs(PEOPLE, "person")
             + candidate_pairs(ORGS, "organization")
             + candidate_pairs(PROJECTS, "project"))

    written = [
        write_csv("documents.csv", docs),
        write_csv("tenders.csv", notices),
        write_csv("contracts.csv", awards),
        write_csv("bids.csv", bids),
        write_csv("eligibility_criteria.csv", elig),
        write_csv("lots.csv", lots),
        write_csv("amendments.csv", amends),
        write_csv("amendment_changes.csv", changes),
        write_csv("beneficial_owners.csv", owners),
        write_csv("companies.csv", companies),
        write_csv("people.csv", people),
        write_csv("organizations.csv", orgs),
        write_csv("projects.csv", projects),
        write_csv("locations.csv", places),
        write_csv("relationships.csv", RELATIONS),
        write_csv("timeline.csv", TIMELINE),
        write_csv("normalization.csv", NORMLOG),
        write_csv("name_candidate_pairs.csv", pairs),
        write_csv("master_dataset.csv", master, folder=DATA),
    ]
    with io.open(os.path.join(DATA, "master_dataset.json"), "w",
                 encoding="utf-8") as fh:
        json.dump(master, fh, ensure_ascii=False)

    summary = {
        "generated": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "seconds": round(time.time() - started, 1),
        "tables": written,
        "documents": len(docs),
        "tenders": len(notices),
        "contracts": len(awards),
        "master_rows": len(master),
        "master_with_notice_and_award": sum(1 for r in master
                                           if r["notice_document_found"]
                                           and r["award_document_found"]),
        "master_notice_only": sum(1 for r in master
                                  if not r["award_document_found"]),
        "master_award_only": sum(1 for r in master
                                 if not r["notice_document_found"]),
        "companies": len(companies), "people": len(people),
        "organizations": len(orgs), "projects": len(projects),
        "eligibility_criteria": len(elig),
        "eligibility_criteria_deferred": sum(
            1 for e in elig if e["defers_to_another_document"]),
        "lots": len(lots), "amendments": len(amends),
        "amendment_changes": len(changes),
        "amendment_changes_with_a_real_change": sum(1 for c in changes
                                                    if c["value_changed"]),
        "beneficial_owners": len(owners), "locations": len(places),
        "relationships": len(RELATIONS), "timeline_events": len(TIMELINE),
        "normalisations_logged": len(NORMLOG),
        "normalisations_applied": sum(SEEN_RULE.values()),
        "normalisation_rules": sorted(set(n["rule"] for n in NORMLOG)),
        "name_candidate_pairs": len(pairs),
        "names_merged_on_resemblance": 0,
        "bid_rows": len(bids),
        "bid_rows_with_counts": sum(1 for b in bids if b["counts_printed"]),
        "bid_count_anomalies": sum(1 for b in bids if b["count_anomaly"]),
        "bidder_level_records_in_archive": 0,
        "contract_value_total_taka": round(
            sum(a["contract_value_taka"] or 0.0 for a in awards), 2),
        "contracts_without_a_printed_value": sum(
            1 for a in awards if a["contract_value_taka"] is None),
        "documents_with_interleaved_layout_warnings": sum(
            1 for d in docs if d["interleaved_layout_warnings"]),
    }
    with io.open(os.path.join(DATA, "dataset_summary.json"), "w",
                 encoding="utf-8") as fh:
        json.dump({"counts": summary,
                   # carried through from the extractor so the analysis names
                   # each criterion category exactly as the parser named it
                   "criterion_labels": ext.get("criterion_labels") or {}},
                  fh, ensure_ascii=False, indent=1)

    for t in written:
        print("  %-28s %6d rows  %3d columns" % (t["table"], t["rows"],
                                                 t["columns"]))
    print()
    for key in ("documents", "tenders", "contracts", "master_rows",
                "master_with_notice_and_award", "master_notice_only",
                "master_award_only", "companies", "people", "organizations",
                "projects", "eligibility_criteria",
                "eligibility_criteria_deferred", "lots", "amendments",
                "amendment_changes", "amendment_changes_with_a_real_change",
                "beneficial_owners", "locations", "relationships",
                "timeline_events", "normalisations_logged",
                "normalisations_applied", "name_candidate_pairs",
                "names_merged_on_resemblance", "bid_rows",
                "bid_rows_with_counts", "bid_count_anomalies",
                "bidder_level_records_in_archive",
                "contracts_without_a_printed_value",
                "documents_with_interleaved_layout_warnings", "seconds"):
        print("%-38s %s" % (key, summary[key]))
    print("%-38s %.2f" % ("contract_value_total_taka",
                          summary["contract_value_total_taka"]))
    print("rules fired: %s" % ", ".join(summary["normalisation_rules"]))


if __name__ == "__main__":
    main()












