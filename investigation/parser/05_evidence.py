#!/usr/bin/env python3
"""The evidence layer: every cited document, checked line by line against itself.

A citation that only names a file asks a reader to take the extraction on trust.
This stage removes the trust. For every PDF cited by a finding it walks the row
the dataset holds for that document, field by field, and looks for each recorded
value in the extracted text of the pages. What it finds it records with the page
and the line; what it cannot find it says so about, in the same table.

Two kinds of miss are expected and are labelled rather than hidden:

  normalised   the dataset stores a cleaned value and the page prints another
               form of it. The *_original column carries the printed form, and
               this stage prefers it when it exists.
  derived      the value is not printed anywhere - it is counted or computed by
               the parser - so no line can carry it. calculation says how.

Anything else is a genuine extraction question and is listed as such at the end
of the run, so it can be looked at rather than discovered later by a reader.

    .venv/bin/python -P investigation/parser/05_evidence.py
"""

import csv
import difflib
import io
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.abspath(os.path.join(HERE, "..", "data"))
TABLES = os.path.join(DATA, "tables")
EVIDENCE = os.path.abspath(os.path.join(HERE, "..", "evidence"))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))

PAGE_CAP = 4000

# Fields no page can print, because the parser makes them. Naming them here is
# what keeps the "not found on the page" list meaningful.
DERIVED_FIELDS = re.compile(
    r"^(document_id|.*_id|pages|bytes|sha256|characters|words|ruled_tables|"
    r"images|script|has_text_layer|needs_ocr|second_extractor_chars|"
    r"extractors_agree|duplicate_text_of|read_error|fields_read|dates_read|"
    r"eligibility_chars|lots_read|beneficial_owners_read|notice_pages|"
    r"award_pages|.*_original|folder|kind|file|filename|notice_file|award_file|"
    r"source_file|award_template|counts_printed|single_bid_.*|"
    r"all_received_were_responsive|bidder_level_.*|count_anomaly|"
    r"eligibility_(source_field|page|numbering|published|substantive|"
    r"categories|clauses|amended)|amended|amendment_changed_fields|"
    r"interleaved_layout_.*|creator|producer|pdf_created|pdf_modified|"
    r"winner_page|lots|performance_security_on_time|contract_signed_on_time|"
    r"beneficial_owners|chars|categories|defers_to_another_document|"
    r"money_(taka|words|scale_words|reading|unresolved)|years|contract_counts|"
    r"percentages|printed_label|page|clause_no|table_generation|serial|"
    r"bids_awarded|bought_but_did_not_bid|received_but_not_responsive|"
    r"responsive_but_not_awarded|changed_fields|changed_field_count|"
    r"eligibility_changed|has_change_table|amendment_no)$")

# Where a column holds a cleaned value, the column that holds the printed one.
# The printed form is what a page can be searched for; the cleaned form is what
# the dataset joins on, and the two are shown side by side.
PRINTED = {"district": "district_original", "status": "status_original",
           "contract_value_taka": "contract_value_original",
           "document_price_taka": "document_price_original"}


def table(name):
    with io.open(os.path.join(TABLES, name + ".csv"), encoding="utf-8-sig",
                 newline="") as fh:
        return list(csv.DictReader(fh))


def squash(s):
    """Whitespace folded, so a value split across a line break still matches."""
    return " ".join((s or "").split()).lower()


def as_printed(value):
    """The forms a page might print a recorded value in, widest first.

    A date is stored ISO and printed by the portal in its own format; a number
    is stored plain and printed with thousands separators. Each alternative is a
    literal string to look for, never a pattern that could match something else.
    """
    v = (value or "").strip()
    out = [v]
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})$", v)
    if m:
        y, mo, d = m.groups()
        names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                 "Oct", "Nov", "Dec"]
        nm = names[int(mo) - 1]
        out += ["%s-%s-%s" % (d, nm, y), "%d-%s-%s" % (int(d), nm, y),
                "%s/%s/%s" % (d, mo, y), "%s %s %s" % (d, nm, y)]
    if re.match(r"^\d+(\.\d+)?$", v):
        n = float(v)
        whole = int(n)
        out += ["{:,}".format(whole), str(whole),
                "{:,.2f}".format(n), "{:,.3f}".format(n),
                "%.2f" % n, "%.3f" % n]
        if n == whole:
            out += ["%d.00" % whole, "%d.000" % whole]
    return [x for x in dict.fromkeys(out) if x]


def tight(s):
    """All whitespace removed, so a word broken across two lines still matches."""
    return re.sub(r"\s+", "", (s or "")).lower()



def locate(value, pgs):
    """The first page and line where a value is printed, or None.

    A count is often a single digit, and a single digit is a substring of half
    the numbers on a page, so numeric values are matched only where nothing
    numeric adjoins them. A line carrying letters as well as the digit is
    preferred over a bare digit, because the label is what makes the match
    checkable by eye.
    """
    for want in as_printed(value):
        needle = squash(want)
        if not needle:
            continue
        numeric = bool(re.match(r"^[\d.,]+$", needle))
        if numeric:
            rx = re.compile(r"(?<![\d.,])" + re.escape(needle) + r"(?![\d.,])")
        elif len(needle) < 2:
            continue
        best = None
        for p in pgs:
            for ln in p["text"].splitlines():
                flat = squash(ln)
                if not (rx.search(flat) if numeric else needle in flat):
                    continue
                hit = {"page": p["n"], "line": " ".join(ln.split())[:300],
                       "matched_as": want}
                if not numeric or re.search(r"[a-z]{3}", flat):
                    return hit
                best = best or hit
        if best:
            return best
        for p in pgs:
            flat = squash(p["text"])
            if rx.search(flat) if numeric else needle in flat:
                return {"page": p["n"], "line": "", "matched_as": want,
                        "note": "printed across a line break"}
    for want in as_printed(value):
        packed = tight(want)
        if len(packed) < 4:
            continue
        for p in pgs:
            if packed in tight(p["text"]):
                return {"page": p["n"], "line": "", "matched_as": want,
                        "how": "across a line break",
                        "note": "printed with a word broken across two lines; "
                                "matched with all spacing removed"}
    return table_cell(value, pgs) or nearest(value, pgs)


def table_cell(value, pgs):
    """Whether every word of the value is printed on the page, in some order.

    The notices carry a ruled lot table. Extracted linearly, one cell's second
    line lands after the next column's first, so a cell reassembled correctly by
    the parser is not a substring of the page. Every word of it still is, and
    saying that is more use to a reader than reporting nothing.
    """
    words = [tight(w) for w in (value or "").split() if len(tight(w)) > 1]
    if len(words) < 2:
        return None
    for p in pgs:
        flat = tight(p["text"])
        if all(w in flat for w in words):
            return {"page": p["n"], "line": "", "matched_as": value,
                    "how": "assembled from a table cell",
                    "note": "every word of this value is printed on this page; "
                            "the lot table's cells interleave with neighbouring "
                            "columns when the page is read linearly, so the "
                            "value is the parser's reconstruction of one cell"}
    return None


def nearest(value, pgs):
    """The longest run the page and the recorded value share, and how long."""
    want = tight(value)
    if len(want) < 12:
        return None
    best = None
    for p in pgs:
        flat = tight(p["text"])
        sm = difflib.SequenceMatcher(None, want, flat, autojunk=False)
        m = sm.find_longest_match(0, len(want), 0, len(flat))
        if m.size >= 12 and (best is None or m.size > best[0]):
            best = (m.size, p["n"], want[m.a:m.a + m.size])
    if not best or best[0] < 0.5 * len(want):
        return None
    size, page, run = best
    return {"page": page, "line": run[:300], "matched_as": value,
            "how": "wording differs",
            "note": "the page prints this in a different form; the longest run "
                    "the two share is %d of the value's %d characters, so the "
                    "recorded value should be read against the page rather than "
                    "in place of it" % (size, len(want))}





def provenance(row, pgs):
    """Every recorded value in a row, against the pages of its own document."""
    found, absent, derived, other = [], [], [], []
    for col in row:
        if col in PRINTED.values():
            continue
        raw = (row.get(col) or "").strip()
        if not raw:
            continue
        printed_col = PRINTED.get(col)
        value = (row.get(printed_col) or raw).strip() if printed_col else raw
        item = {"field": col, "recorded": raw}
        if printed_col and value != raw:
            item["printed_form"] = value
        if DERIVED_FIELDS.match(col):
            item["why_not_searched"] = "made by the parser, not printed"
            derived.append(item)
            continue
        hit = locate(value, pgs)
        if not hit:
            absent.append(item)
            continue
        item.update(hit)
        if hit.get("how") in ("assembled from a table cell", "wording differs"):
            other.append(item)
        else:
            found.append(item)
    return {"printed_and_found": found, "printed_in_another_form": other,
            "recorded_but_not_found": absent,
            "not_printed_by_design": derived}



CITE_RX = re.compile(r"^(.*?)(?:\s+p(\d+))?$")


def parse_cite(s):
    m = CITE_RX.match(s.strip())
    page = int(m.group(2)) if m.group(2) else None
    return m.group(1), page


def rows_for(path, idx):
    """Every dataset row that came out of one document, with its table name."""
    out = []
    for name, by_file in idx:
        for r in by_file.get(path, []):
            out.append((name, r))
    return out


def build_index(t):
    """Which table rows belong to which file, for every table that names one."""
    keys = [("tenders", "notice_file"), ("contracts", "award_file"),
            ("bids", "source_file"), ("eligibility_criteria", "source_file"),
            ("lots", "source_file"), ("amendments", "source_file"),
            ("beneficial_owners", "source_file"), ("documents", "file")]
    idx = []
    for name, key in keys:
        by_file = {}
        for r in t[name]:
            by_file.setdefault(r.get(key) or "", []).append(r)
        idx.append((name, by_file))
    return idx


def citation(path, page, raw, idx, quote):
    """One cited document, read back against itself."""
    pgs = raw.get(path) or []
    doc = None
    for name, by_file in idx:
        if name == "documents" and by_file.get(path):
            doc = by_file[path][0]
    cited = [p for p in pgs if page is None or p["n"] == page]
    rec = {"file": path, "cited_page": page,
           "pages_in_document": len(pgs),
           "document_id": (doc or {}).get("document_id", ""),
           "kind": (doc or {}).get("kind", "not in the document inventory"),
           "needs_ocr": (doc or {}).get("needs_ocr", ""),
           "extractors_agree": (doc or {}).get("extractors_agree", ""),
           "interleaved_layout_warnings":
               (doc or {}).get("interleaved_layout_warnings", ""),
           "quoted_in_the_finding": quote,
           "page_text": [{"page": p["n"], "text": p["text"][:PAGE_CAP],
                          "truncated": "yes" if len(p["text"]) > PAGE_CAP
                          else "no"} for p in cited],
           "tables": []}
    for name, row in rows_for(path, idx):
        if name == "documents":
            continue
        pr = provenance(row, cited or pgs)
        rec["tables"].append({
            "table": name, "tender_id": row.get("tender_id", ""),
            "clause_no": row.get("clause_no", ""),
            "values_checked": (len(pr["printed_and_found"])
                               + len(pr["printed_in_another_form"])
                               + len(pr["recorded_but_not_found"])),
            "found_on_the_page": len(pr["printed_and_found"]),
            "found_in_another_form": len(pr["printed_in_another_form"]),
            "not_found_on_the_page": len(pr["recorded_but_not_found"]),
            "provenance": pr})
    return rec


CONFIDENCE = {
    "DOCUMENTED FACT":
        "High. The value is printed on the page named here and was re-read by a "
        "second extractor.",
    "DATA-DERIVED FINDING":
        "High for the arithmetic, which is given in full in the Calculation "
        "column; the inputs are printed values.",
    "POSSIBLE CONNECTION":
        "The shared value is certain. The relationship it suggests is not "
        "established by any supplied document.",
    "UNRESOLVED":
        "Certain that the supplied documents do not answer it. Nothing here "
        "asserts what the answer would be.",
}


def notes_for(rec):
    """What an editor should know about this document before trusting the row."""
    out = []
    if rec["needs_ocr"] == "yes":
        out.append("read by OCR; wording may differ from the page")
    if rec["extractors_agree"] == "no":
        out.append("the two extractors disagreed on this document's text")
    if (rec["interleaved_layout_warnings"] or "0") not in ("", "0"):
        out.append("two-column layout: marginal headings interleave with "
                   "sentences, and quotes are left exactly as extracted")
    miss = sum(x["not_found_on_the_page"] for x in rec["tables"])
    if miss:
        out.append("%d recorded value(s) not found as printed on the cited "
                   "page(s); each is listed in evidence_index.json" % miss)
    other = sum(x["found_in_another_form"] for x in rec["tables"])
    if other:
        out.append("%d value(s) are printed in another form - a reassembled "
                   "table cell, or wording that differs - and are shown against "
                   "the page in evidence_index.json" % other)
    if rec["kind"] == "not in the document inventory":
        out.append("this file is not in the document inventory")
    return "; ".join(out)


def snippet(rec):
    """The lines on the page that carry the values behind the finding."""
    if rec["quoted_in_the_finding"]:
        return rec["quoted_in_the_finding"]
    lines = []
    for tb in rec["tables"]:
        for it in tb["provenance"]["printed_and_found"]:
            if it.get("line") and it["line"] not in lines:
                lines.append("%s: %s" % (it["field"], it["line"]))
    return " || ".join(lines[:6])


MATRIX = ["Finding ID", "Finding", "Finding type", "Source PDF", "Page",
          "Extracted evidence", "Dataset records", "Calculation", "Confidence",
          "Notes"]


def records_of(rec):
    """Which rows of which table this citation is the source of."""
    out = []
    for tb in rec["tables"]:
        key = tb["tender_id"] or "-"
        if tb["clause_no"]:
            key += " clause " + tb["clause_no"]
        out.append("%s.csv tender_id=%s (%d/%d recorded values found on the "
                   "page)" % (tb["table"], key, tb["found_on_the_page"],
                              tb["values_checked"]))
    return "; ".join(out) or "no dataset row is keyed to this document"


def main():
    with io.open(os.path.join(DATA, "analysis.json"), encoding="utf-8") as fh:
        analysis = json.load(fh)
    names = ("documents tenders contracts bids eligibility_criteria lots "
             "amendments beneficial_owners")
    t = dict((n, table(n)) for n in names.split())
    with io.open(os.path.join(DATA, "raw_pages.json"), encoding="utf-8") as fh:
        raw = json.load(fh)
    idx = build_index(t)
    quotes = {}
    for q in analysis["rules"]["quoted"]:
        quotes[(q["file"], q["page"])] = q["text"]

    cites, findings, matrix = {}, [], []
    for f in analysis["findings"]:
        seen = []
        for c in f["evidence"]:
            path, page = parse_cite(c)
            key = "%s#%s" % (path, page if page else "all")
            if key in seen:
                continue
            seen.append(key)
            if key not in cites:
                cites[key] = citation(path, page, raw, idx,
                                      quotes.get((path, page), ""))
            rec = cites[key]
            matrix.append([
                f["id"], f["headline"], f["type"], path,
                str(page) if page else "1-%d" % rec["pages_in_document"],
                snippet(rec), records_of(rec), f["calculation"],
                CONFIDENCE[f["type"]], notes_for(rec)])
        findings.append({"id": f["id"], "type": f["type"],
                         "headline": f["headline"], "detail": f["detail"],
                         "numbers": f["numbers"],
                         "calculation": f["calculation"],
                         "confidence": CONFIDENCE[f["type"]],
                         "citations": seen})

    if not os.path.isdir(EVIDENCE):
        os.makedirs(EVIDENCE)
    out = {"built_from": "investigation/data/analysis.json and "
                        "investigation/data/raw_pages.json",
           "how_to_read": "Every finding lists the documents it rests on. Every "
                          "document is read back against the dataset row it "
                          "produced: printed_and_found gives the page and the "
                          "line, recorded_but_not_found lists what could not be "
                          "matched on the page, and not_printed_by_design lists "
                          "the fields the parser makes rather than reads.",
           "citations": cites, "findings": findings}
    path = os.path.join(EVIDENCE, "evidence_index.json")
    with io.open(path, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)

    mpath = os.path.join(ROOT, "EVIDENCE_MATRIX.csv")
    with io.open(mpath, "w", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(MATRIX)
        w.writerows(matrix)

    checked = sum(tb["values_checked"] for c in cites.values()
                  for tb in c["tables"])
    hit = sum(tb["found_on_the_page"] for c in cites.values()
              for tb in c["tables"])
    other = sum(tb["found_in_another_form"] for c in cites.values()
                for tb in c["tables"])
    print("citations       %d documents, %d rows in EVIDENCE_MATRIX.csv"
          % (len(cites), len(matrix)))
    print("read back       %d of %d recorded values found on their own page "
          "(%.1f%%), %d more printed in another form (%.1f%% together)"
          % (hit, checked, 100.0 * hit / max(1, checked), other,
             100.0 * (hit + other) / max(1, checked)))
    print("findings        %d, every one with at least one document: %s"
          % (len(findings),
             "yes" if all(f["citations"] for f in findings) else "NO"))
    misses = {}
    for c in cites.values():
        for tb in c["tables"]:
            for it in tb["provenance"]["recorded_but_not_found"]:
                misses.setdefault(it["field"], []).append(c["file"])
    if misses:
        print("not found on the page, by field:")
        for k in sorted(misses, key=lambda k: -len(misses[k])):
            print("  %-34s %3d  e.g. %s" % (k, len(misses[k]), misses[k][0]))
    print("%-16s%s  %.1f MB" % ("written", os.path.relpath(path, ROOT),
                                os.path.getsize(path) / 1048576.0))
    print("%-16s%s  %.0f KB" % ("", os.path.relpath(mpath, ROOT),
                                os.path.getsize(mpath) / 1024.0))


if __name__ == "__main__":
    main()







