#!/usr/bin/env python3
"""The search index: everything the archive holds, findable by name or by number.

A reader who wants to check one firm, one tender or one phrase should not have to
read the investigation to find it. This stage turns the whole archive into one
searchable set of records - every document, tender, contract, firm, person,
organisation, project, eligibility clause, lot, amendment, declared owner,
location, finding and quoted rule - and writes the index the site searches
without a server.

Three files come out of it:

  investigation/search/records.json   one record per thing, with the fields a
                                      scoped query needs and the reference back
                                      to the page it was printed on.
  investigation/search/postings.json  token -> the records that contain it,
                                      delta-encoded, plus the vocabulary a fuzzy
                                      match walks and the loose-spelling map that
                                      makes 0 and O the same query.
  investigation/public/pages/*.json   one shard per document, holding its pages
                                      as extracted, fetched only when a reader
                                      opens that document.

The document text is not copied into records.json. It is 7 MB, it would be loaded
on every visit, and it is only needed once a reader asks for a phrase or opens a
document - so it lives in the shards and is fetched then.

    .venv/bin/python -P investigation/parser/06_search.py
"""

import collections
import csv
import io
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.abspath(os.path.join(HERE, "..", "data"))
TABLES = os.path.join(DATA, "tables")
SEARCH = os.path.abspath(os.path.join(HERE, "..", "search"))
PAGES = os.path.abspath(os.path.join(HERE, "..", "public", "pages"))

# Bengali first, then Latin letters and digits. The archive's 1,805 documents all
# extract as English - documents.csv records script "en" for every one of them -
# but a reader may still type Bengali, and a tokenizer that dropped it would
# return nothing rather than nothing found.
TOK = re.compile(r"[ঀ-৿]+|[a-z0-9]+")

# The confusions a scanned or re-typed reference actually makes. Applied to build
# a second key for every token, so a query for "O" finds a "0" and the other way
# round, without the index having to hold both spellings.
LOOSE = {"0": "o", "1": "l", "i": "l", "5": "s", "8": "b", "2": "z"}


def toks(s):
    return TOK.findall((s or "").lower())


def loose(w):
    return "".join(LOOSE.get(c, c) for c in w)


def table(name):
    with io.open(os.path.join(TABLES, name + ".csv"), encoding="utf-8-sig",
                 newline="") as fh:
        return list(csv.DictReader(fh))


def load():
    names = ("documents tenders contracts bids eligibility_criteria lots "
             "amendments beneficial_owners companies people organizations "
             "projects locations relationships")
    return dict((n, table(n)) for n in names.split())


def pages():
    with io.open(os.path.join(DATA, "raw_pages.json"), encoding="utf-8") as fh:
        return json.load(fh)


def slug(s):
    """A document id as a filename: printable, unambiguous, and reversible."""
    return re.sub(r"_+", "_", re.sub(r"[^A-Za-z0-9._-]", "_", s)).strip("_")


def num(s):
    """A number from a printed value, or None. Commas are separators here."""
    if s is None:
        return None
    m = re.search(r"-?\d[\d,]*(?:\.\d+)?", str(s))
    if not m:
        return None
    try:
        return float(m.group(0).replace(",", ""))
    except ValueError:
        return None


def year_of(*dates):
    for d in dates:
        if d and re.match(r"^\d{4}-", d):
            return int(d[:4])
    return None


# --------------------------------------------------------------- the records
# One record is one thing a reader might look for. "t" is what it is called, "s"
# is the line under the name, "f" holds the values a scoped query matches against,
# "n" the numbers a range query compares, "d" the dates, "x" the extra words that
# should be searchable without being displayed, and "r" the page it was printed
# on. Keys are one letter because this file is downloaded whole.
class Records(object):
    def __init__(self):
        self.rows = []

    def add(self, kind, title, sub="", f=None, n=None, d=None, x="", ref=None,
            key=""):
        row = {"i": len(self.rows), "k": kind, "t": title or "", "s": sub or "",
               "f": dict((a, b.lower()) for a, b in (f or {}).items()
                         if (b or "").strip()),
               "n": dict((a, b) for a, b in (n or {}).items() if b is not None),
               "d": dict((a, b) for a, b in (d or {}).items() if (b or "").strip()),
               "x": x or "", "r": ref or {}, "key": key or ""}
        self.rows.append(row)
        return row


def ref(f, p=None):
    out = {"file": f} if f else {}
    if p not in (None, "", "0"):
        try:
            out["page"] = int(p)
        except (TypeError, ValueError):
            pass
    return out


def documents_in(R, t, raw):
    """Every PDF in the folder, whether or not anything was read out of it."""
    for r in t["documents"]:
        head = ""
        for p in raw.get(r["file"], [])[:1]:
            head = " ".join(p["text"].split())[:220]
        R.add("document", r["filename"],
              "%s, %s page%s, %s characters read"
              % (r["kind"].replace("_", " "), r["pages"],
                 "" if r["pages"] == "1" else "s", r["characters"]),
              {"file": r["file"], "kind": r["kind"], "tender": r["tender_id"],
               "folder": r["folder"]},
              {"pages": num(r["pages"]), "characters": num(r["characters"]),
               "words": num(r["words"])},
              None, head, ref(r["file"], 1), r["document_id"])


def tenders_in(R, t, marks):
    """marks maps a tender id to the observations that apply to it, so a reader
    who has seen signal:S-ONE-RESPONSIVE on the ledger can search for the 201
    tenders it applies to and not only for the sentence defining it."""
    for r in t["tenders"]:
        mk = marks.get(r["tender_id"], {})
        R.add("tender", "Tender %s" % r["tender_id"],
              (r["package_description"] or r["invitation_for"] or "")[:200],
              {"tender": r["tender_id"], "agency": r["procuring_entity"],
               "ministry": r["ministry"], "district": r["district"],
               "status": r["status"], "method": r["method"],
               "project": r["project"], "file": r["notice_file"],
               "package": r["package_no"], "ref": r["invitation_ref"],
               "officer": r["inviting_officer"],
               "signal": ";".join(mk.get("signals", []))},
              {"year": year_of(r["published_date"], r["closing_date"]),
               "amount": num(r["document_price_taka"]),
               "lots": num(r["lots"]),
               "clauses": num(r["eligibility_clauses"]),
               "signals": mk.get("count")},
              {"published": r["published_date"], "closing": r["closing_date"],
               "opening": r["opening_date"]},
              " ".join([r["agency"], r["package_description"], r["invitation_for"],
                        r["category"], r["source_of_funds"], r["thana"],
                        r["city"], r["procurement_nature"], r["event_type"],
                        r["amendment_changed_fields"]]),
              ref(r["notice_file"], 1), r["tender_id"])


def contracts_in(R, t, marks):
    """One tender in this archive exists only as an award notice, its own notice
    having never been served by the portal. The observations that apply to a
    procurement hang on the notice record where there is one; for that one they
    would hang on nothing, so they hang here instead. Attaching them to every
    award as well would count the same procurement twice."""
    for r in t["contracts"]:
        mk = marks.get(r["tender_id"], {})
        orphan = mk.get("notice_in_archive") == "no"
        R.add("contract", "Contract on tender %s" % r["tender_id"],
              "%s%s" % (r["winner"] or "winner not printed",
                        " - %s" % r["contract_value_original"]
                        if r["contract_value_original"] else ""),
              {"tender": r["tender_id"], "company": r["winner"],
               "agency": r["award_procuring_entity"],
               "ministry": r["award_ministry"], "district": r["award_district"],
               "method": r["award_method"], "project": r["award_project"],
               "file": r["award_file"], "package": r["award_package_no"],
               "contract": r["contract_no"], "officer": r["award_officer"],
               "owner": r["beneficial_owners"],
               "signal": ";".join(mk.get("signals", [])) if orphan else ""},
              {"year": year_of(r["noa_date"], r["signed_date"],
                               r["advertised_date"]),
               "amount": num(r["contract_value_taka"]),
               "sold": num(r["tenders_sold"]),
               "received": num(r["tenders_received"]),
               "responsive": num(r["tenders_responsive"])},
              {"advertised": r["advertised_date"], "noa": r["noa_date"],
               "signed": r["signed_date"], "start": r["work_start_date"],
               "completion": r["work_completion_date"]},
              " ".join([r["contract_description"], r["award_package_name"],
                        r["work_location"], r["winner_location"],
                        r["award_source_of_funds"], r["award_for"],
                        r["award_agency"], r["beneficial_owners"]]),
              ref(r["award_file"], 1), r["tender_id"])


ENTITY = (("companies", "company", "company"),
          ("people", "person", "person"),
          ("organizations", "organisation", "agency"),
          ("projects", "project", "project"))


def entities_in(R, t):
    """Firms, people, organisations and projects, as named on the pages."""
    for tbl, kind, scope in ENTITY:
        for r in t[tbl]:
            bits = [r["roles"].replace(";", ", ")]
            if r.get("contracts_won") and r["contracts_won"] not in ("", "0"):
                bits.append("%s contract%s"
                            % (r["contracts_won"],
                               "" if r["contracts_won"] == "1" else "s"))
            if r.get("documents"):
                bits.append("named in %s document%s"
                            % (r["documents"],
                               "" if r["documents"] == "1" else "s"))
            R.add(kind, r["name"], "; ".join(x for x in bits if x),
                  {scope: r["name"], "role": r["roles"],
                   "file": r["first_document"],
                   "district": r.get("districts", ""),
                   "agency": r.get("procuring_entities", ""),
                   "tender": r.get("tender_ids", "")},
                  {"amount": num(r.get("total_contract_value_taka")),
                   "contracts": num(r.get("contracts_won")),
                   "documents": num(r["documents"]),
                   "year": year_of(r.get("first_award_date", ""))},
                  {"first_award": r.get("first_award_date", ""),
                   "last_award": r.get("last_award_date", "")},
                  " ".join([r["other_printed_names"], r["printed_name_variants"],
                            r.get("addresses_printed", ""),
                            r.get("beneficial_owners_declared", ""),
                            r.get("tenderer_ids_printed", ""),
                            r.get("agencies", "")]),
                  ref(r["first_document"], r["first_page"]), r["id"])


def clauses_in(R, t):
    """Every requirement to enter, as printed, with its own label."""
    tn = dict((x["tender_id"], x) for x in t["tenders"])
    for r in t["eligibility_criteria"]:
        p = tn.get(r["tender_id"]) or {}
        R.add("clause", "Requirement %s on tender %s"
              % (r["clause_no"], r["tender_id"]), r["text"][:300],
              {"tender": r["tender_id"], "label": r["categories"],
               "agency": p.get("procuring_entity", ""),
               "district": p.get("district", ""), "file": r["source_file"],
               "field": r["source_field"], "unread": r["money_unresolved"]},
              {"amount": num(r["money_taka"]), "years": num(r["years"]),
               "contracts": num(r["contract_counts"]),
               "year": year_of(p.get("published_date", ""))},
              {"published": p.get("published_date", "")},
              " ".join([r["text"], r["printed_label"], r["money_original"],
                        r["money_words"], r["money_reading"]]),
              ref(r["source_file"], r["page"]),
              "%s-%s" % (r["tender_id"], r["clause_no"]))


def lots_in(R, t):
    tn = dict((x["tender_id"], x) for x in t["tenders"])
    for r in t["lots"]:
        p = tn.get(r["tender_id"]) or {}
        R.add("lot", "Lot %s on tender %s" % (r["lot_no"], r["tender_id"]),
              (r["identification"] or "")[:240],
              {"tender": r["tender_id"], "district": r["location"],
               "agency": p.get("procuring_entity", ""), "file": r["source_file"]},
              {"amount": num(r["security_amount_taka"]),
               "year": year_of(r["start_date"], p.get("published_date", ""))},
              {"start": r["start_date"], "completion": r["completion_date"]},
              " ".join([r["identification"], r["location"],
                        r["security_amount_original"]]),
              ref(r["source_file"], r["page"]),
              "%s-lot-%s" % (r["tender_id"], r["lot_no"]))


def amendments_in(R, t):
    tn = dict((x["tender_id"], x) for x in t["tenders"])
    for r in t["amendments"]:
        p = tn.get(r["tender_id"]) or {}
        R.add("amendment", "Amendment %s on tender %s"
              % (r["amendment_no"] or "1", r["tender_id"]),
              (" ".join(r["notice_text"].split())[:240]
               or "no text printed with the amendment"),
              {"tender": r["tender_id"], "file": r["source_file"],
               "agency": p.get("procuring_entity", ""),
               "district": p.get("district", ""),
               "field": r["changed_fields"]},
              {"changed": num(r["changed_field_count"]),
               "year": year_of(p.get("published_date", ""))},
              {"published": p.get("published_date", "")},
              " ".join([r["notice_text"], r["changed_fields"]]),
              ref(r["source_file"], r["page"]),
              "%s-amend-%s" % (r["tender_id"], r["amendment_no"] or "1"))


def owners_in(R, t):
    for r in t["beneficial_owners"]:
        R.add("owner", r["owner_name"],
              "declared owner of %s%s" % (r["company"],
                                          ", %s" % r["designation"]
                                          if r["designation"] else ""),
              {"person": r["owner_name"], "company": r["company"],
               "tender": r["tender_id"], "file": r["source_file"],
               "role": r["designation"]},
              None, None,
              " ".join([r["company"], r["designation"] or ""]),
              ref(r["source_file"], r["page"]),
              "%s-owner-%s" % (r["tender_id"], r["serial"]))


def locations_in(R, t):
    for r in t["locations"]:
        R.add("location", r["normalized"] or r["printed"],
              "%s named in %s tender%s; %s"
              % (r["level"], r["tenders"], "" if r["tenders"] == "1" else "s",
                 r["coordinates"]),
              {"district": r["normalized"], "level": r["level"],
               "file": r["first_source_file"]},
              {"tenders": num(r["tenders"])}, None, r["printed"],
              ref(r["first_source_file"], r["first_page"]),
              "%s-%s" % (r["level"], r["normalized"] or r["printed"]))


def analysis():
    with io.open(os.path.join(DATA, "analysis.json"), encoding="utf-8") as fh:
        return json.load(fh)


def findings_in(R, a):
    """What the investigation concluded, searchable alongside the evidence."""
    for r in a["findings"]:
        first = (r["evidence"] or [""])[0]
        R.add("finding", r["headline"], r["detail"][:400],
              {"label": r["type"], "finding": r["id"],
               "file": first.split(" p")[0]},
              None, None,
              " ".join([r["id"], r["type"], r["calculation"],
                        json.dumps(r["numbers"], ensure_ascii=False),
                        " ".join(r["evidence"])]),
              ref(*(first.split(" p") + [None])[:2]), r["id"])


def rules_in(R, a):
    """The clauses of the rulebooks the notices are measured against."""
    for r in a["rules"]["quoted"]:
        R.add("rule", "%s - %s" % (r["id"], r["file"].split("/")[-1]),
              r["text"][:400],
              {"rule": r["id"], "file": r["file"]},
              None, None, r["text"], ref(r["file"], r["page"]), r["id"])


def signals_in(R, a):
    """One record per printed observation a tender carries, so a reader can ask
    for every tender that carries it rather than only for one tender."""
    for s in a["signals"]["definitions"]:
        R.add("signal", s["short"], s.get("detail", "") or s.get("long", ""),
              {"signal": s["id"], "label": "observation"},
              {"tenders": a["signals"]["by_signal"].get(s["id"])},
              None, "%s %s" % (s["id"], s["short"]), {}, s["id"])


# ------------------------------------------------------------- the index itself
# A record's own words are worth more than a document's body text, so the two are
# tokenised into separate postings and the site adds the weight. Field values are
# folded into the record's own words: a reader typing a firm's name should reach
# the contract as well as the firm.
def searchable(row):
    return " ".join([row["t"], row["s"], row["key"]]
                    + list(row["f"].values()) + [row["x"]])


def index(rows, raw, by_file):
    """token -> the records holding it, and token -> the records printing it.

    Two maps, because a hit in a record's own name should outrank a hit somewhere
    on page 40 of a rulebook, and the site cannot tell the difference after the
    fact if both went into one list.
    """
    strong = collections.defaultdict(set)
    body = collections.defaultdict(set)
    for row in rows:
        for w in set(toks(searchable(row))):
            strong[w].add(row["i"])
    for f, ps in raw.items():
        i = by_file.get(f)
        if i is None:
            continue
        seen = set()
        for p in ps:
            seen.update(toks(p["text"]))
        for w in seen:
            body[w].add(i)
    return strong, body


def delta(ids):
    """A sorted id list as first-then-gaps, which is what makes the file small."""
    out, last = [], 0
    for i in sorted(ids):
        out.append(i - last)
        last = i
    return out


def postings(strong, body):
    """The two maps packed, plus the vocabulary and the loose-spelling map.

    The vocabulary is shipped as a plain list because a fuzzy match has to walk
    it; there are only about eleven thousand distinct tokens in the whole archive,
    so walking it in the browser costs nothing worth avoiding.
    """
    words = sorted(set(strong) | set(body))
    lax = collections.defaultdict(list)
    for w in words:
        k = loose(w)
        if k != w or len(lax[k]) or k in strong or k in body:
            lax[k].append(w)
    return {"strong": dict((w, delta(strong[w])) for w in sorted(strong)),
            "body": dict((w, delta(body[w])) for w in sorted(body)),
            "vocab": words,
            "loose": dict((k, v) for k, v in lax.items() if len(v) > 1),
            "how_to_read":
                "strong and body are token -> record ids, delta-encoded: the "
                "first number is an id and each one after it is the gap to the "
                "next. strong holds hits in a record's own name, subtitle, "
                "fields and key; body holds hits anywhere in a document's pages. "
                "vocab is every token in the index, for fuzzy matching. loose "
                "maps an OCR-loose spelling - 0 for o, 1 and i for l, 5 for s, 8 "
                "for b, 2 for z - to the real tokens that share it."}


# ------------------------------------------------------------------- the shards
def shards(t, raw):
    """One file per document, holding its pages as extracted.

    This is what a phrase search reads to confirm a hit, and what the document
    viewer shows beside the PDF. It is written per document rather than in one
    file so that opening one notice does not download the other 1,804.
    """
    if not os.path.isdir(PAGES):
        os.makedirs(PAGES)
    written, bytes_out = 0, 0
    keep = set()
    for r in t["documents"]:
        name = slug(r["document_id"]) + ".json"
        keep.add(name)
        out = {"document_id": r["document_id"], "file": r["file"],
               "kind": r["kind"], "tender_id": r["tender_id"],
               "pages": [{"n": p["n"], "text": p["text"]}
                         for p in raw.get(r["file"], [])]}
        path = os.path.join(PAGES, name)
        with io.open(path, "w", encoding="utf-8") as fh:
            json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
        written += 1
        bytes_out += os.path.getsize(path)
    for old in os.listdir(PAGES):
        if old.endswith(".json") and old not in keep:
            os.remove(os.path.join(PAGES, old))
    return written, bytes_out


# ------------------------------------------------------------------ packing
# The same agency name sits on hundreds of tenders and the same file path on every
# record read out of that file, so the field values are interned: records.json
# holds an index into one shared list of strings. It takes the file from eight
# megabytes to under three, which is the difference between a search box that
# works on a phone and one that does not.
def pack(rows):
    strings, seen = [], {}

    def sid(s):
        s = s or ""
        if s not in seen:
            seen[s] = len(strings)
            strings.append(s)
        return seen[s]

    text = []
    for r in rows:
        text.append(r.pop("x"))
        r["f"] = dict((k, sid(v)) for k, v in r["f"].items())
        if r["r"].get("file"):
            r["r"]["file"] = sid(r["r"]["file"])
    return strings, text


def main():
    t = load()
    raw = pages()
    a = analysis()
    R = Records()
    documents_in(R, t, raw)
    by_file = dict((r["r"].get("file"), r["i"]) for r in R.rows
                   if r["k"] == "document")
    marks = dict((r["tender_id"], r) for r in a["signals"]["rows"])
    tenders_in(R, t, marks)
    contracts_in(R, t, marks)
    entities_in(R, t)
    clauses_in(R, t)
    lots_in(R, t)
    amendments_in(R, t)
    owners_in(R, t)
    locations_in(R, t)
    findings_in(R, a)
    rules_in(R, a)
    signals_in(R, a)

    strong, body = index(R.rows, raw, by_file)
    post = postings(strong, body)
    kinds = collections.Counter(r["k"] for r in R.rows)
    scopes = collections.Counter(k for r in R.rows for k in r["f"])
    numbers = collections.Counter(k for r in R.rows for k in r["n"])
    dates = collections.Counter(k for r in R.rows for k in r["d"])
    strings, text = pack(R.rows)

    if not os.path.isdir(SEARCH):
        os.makedirs(SEARCH)
    recs = {"built_from": "investigation/data/tables/*.csv and analysis.json, "
                          "both built from the PDFs in the project folder",
            "records": R.rows, "strings": strings,
            "kinds": dict(kinds),
            "scopes": sorted(scopes), "numeric": sorted(numbers),
            "dates": sorted(dates),
            "how_to_read":
                "one record per thing a reader might look for. k is the kind, t "
                "the name, s the line under it, f the values a scoped query "
                "matches (company:, person:, agency:, tender:, district:, "
                "status:, label:, file: and the rest of scopes), n the numbers a "
                "range query compares (amount:a..b, year:a..b), d the dates "
                "(date:a..b), and r the file and page it was printed on. Values "
                "in f, and r.file, are indexes into strings. The words that are "
                "searchable but not displayed are in text.json, one entry per "
                "record id, fetched only when a query needs a phrase checked. "
                "Document text is not here; it is in investigation/public/pages/."}
    blobs = (("records", recs), ("postings", post),
             ("text", {"how_to_read": "one entry per record id, holding the words "
                                      "that are searchable but not displayed",
                       "text": text}))
    for name, blob in blobs:
        path = os.path.join(SEARCH, name + ".json")
        with io.open(path, "w", encoding="utf-8") as fh:
            json.dump(blob, fh, ensure_ascii=False, separators=(",", ":"))

    n_docs, n_bytes = shards(t, raw)
    print("\nrecords")
    for k, v in kinds.most_common():
        print("  %-14s %6d" % (k, v))
    print("  %-14s %6d  interned strings %d" % ("total", len(R.rows),
                                                len(strings)))
    print("\nindex")
    print("  %-14s %6d tokens, %d postings in a record's own words"
          % ("strong", len(strong), sum(len(v) for v in strong.values())))
    print("  %-14s %6d tokens, %d postings in document text"
          % ("body", len(body), sum(len(v) for v in body.values())))
    print("  %-14s %6d loose spellings covering more than one token"
          % ("loose", len(post["loose"])))
    print("  scopes  %s" % ", ".join(sorted(scopes)))
    print("  numeric %s" % ", ".join(sorted(numbers)))
    print("  dates   %s" % ", ".join(sorted(dates)))
    print("\nwritten")
    for name, _ in blobs:
        p = os.path.join(SEARCH, name + ".json")
        print("  %-46s %.1f MB" % (os.path.relpath(p),
                                   os.path.getsize(p) / 1048576.0))
    print("  %-46s %d files, %.1f MB"
          % (os.path.relpath(PAGES), n_docs, n_bytes / 1048576.0))


if __name__ == "__main__":
    main()
