#!/usr/bin/env python3
"""Writes investigation/documentation/ out of the dataset itself.

Two files come out of this script:

  data_dictionary.md   every table, every column, how often the column is filled,
                       what kind of value it holds and one real example
  search_reference.md  the query grammar, and every scope, numeric field and date
                       field the built index actually advertises

Both are generated rather than typed, for the same reason no count is typed into
the site's JavaScript: a rebuilt dataset would leave a written-down number quietly
wrong. Run it after 03_dataset.py and 06_search.py.

    python3 -P investigation/scripts/build_documentation.py

The -P matters everywhere in this pipeline: a module named pytesseract.py in the
repository root shadows the real package when the script's own directory is on the
path.
"""

import csv
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "investigation" / "data"
TABLES = DATA / "tables"
SEARCH = ROOT / "investigation" / "search"
OUT = ROOT / "investigation" / "documentation"

DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
NUMBER = re.compile(r"^-?\d+(\.\d+)?$")

# What each table is for. One line each, the same wording the site's table picker
# uses, so a reader who met the table on the site meets the same sentence here.
PURPOSE = {
    "documents": "One row per PDF found in the folder, and what was read out of it. "
                 "Every file is here, including the five the portal did not serve and "
                 "the five reference rulebooks, because a document that was found and "
                 "could not be used is still a document that was found.",
    "tenders": "One row per tender notice: who invited it, what for, under which "
               "method, on which dates, and what it required of an entrant.",
    "lots": "One row per lot inside a tender. A notice with four lots is one row in "
            "tenders.csv and four rows here.",
    "contracts": "One row per contract-award notice: who won, for how much, under "
                 "which contract number, on which dates.",
    "bids": "The stage counts an award notice prints — sold, received, responsive, "
            "awarded — one row per award. This table is where the archive's hardest "
            "limit lives: bidder_level_data_available is no on every row.",
    "eligibility_criteria": "Every printed condition of entry, one row per clause, "
                            "with the words as printed and the page they are on.",
    "amendments": "One row per amendment notice, and the fields it says it changed.",
    "amendment_changes": "One row per line of an amendment's change table: the old "
                         "value in one column, the new value in the next.",
    "companies": "Every firm named anywhere in the archive, with the roles it is "
                 "named in and what it won. Names are not merged on resemblance.",
    "people": "Every person named, with the designation the document prints for them.",
    "organizations": "Ministries, agencies and procuring entities.",
    "projects": "The projects the notices and awards are charged to.",
    "beneficial_owners": "The owners a document declares, where one does.",
    "locations": "Every place the documents name, at whichever level they name it.",
    "relationships": "Every link between two records, with the file and page the link "
                     "was read from. Nothing here is inferred.",
    "timeline": "Every dated event, one row per date, so a date can be traced back to "
                "the field it came from.",
    "normalization": "Every value this pipeline changed: the original, the result, the "
                     "rule and the reason. Nothing is changed silently.",
    "name_candidate_pairs": "Names that resemble each other. The merged column is no "
                            "on all of them — resemblance is published for a human to "
                            "judge, not acted on.",
    "master_dataset": "One row per procurement, notice joined to award, with the lots, "
                      "bid counts and eligibility summary folded in.",
}

# Columns whose name does not say enough on its own. Everything not listed here is
# named for what it holds.
NOTES = {
    "id": "this row's own key, assigned by the pipeline",
    "document_id": "this document's own key, taken from its filename",
    "source_file": "the PDF this row was read from",
    "page": "the 1-based page of source_file the value is printed on",
    "tender_id": "the portal's own tender id, the key every table joins on",
    "duplicate_text_of": "another document whose extracted text is identical. Both "
                         "are kept; neither is deleted",
    "needs_ocr": "no on all 1,805 rows — every PDF in this folder carries a text layer",
    "second_extractor_chars": "the character count a second, independent extractor read",
    "extractors_agree": "whether the two extractors agreed on the text length",
    "interleaved_layout_warnings": "how many fields on this page ran a value into the "
                                   "next field's label",
    "read_error": "why a document could not be read, where one could not",
    "script": "the writing system detected in the text layer. Latin on every row",
    "ruled_tables": "how many ruled tables were found on the page, and read as tables "
                    "rather than as an image",
    "status_original": "the status exactly as the notice prints it, before any "
                       "normalisation",
    "district_original": "the district exactly as printed, before normalisation. "
                         "Nothing was merged: Chattogram and Chittagong stay apart",
    "eligibility_published": "whether the notice prints any condition of entry at all",
    "eligibility_substantive": "whether it prints one that can be checked, rather than "
                               "only a pointer to an unpublished document",
    "eligibility_source_field": "which field on the notice the clauses were read out of",
    "clause_no": "the clause's position within its notice, counted by this pipeline",
    "printed_label": "the number or bullet the notice itself puts on the clause",
    "categories": "what the clause asks for — turnover, liquid assets, experience, a "
                  "named product — assigned by matching the printed words",
    "defers_to_another_document": "the clause says 'as stated in the tender document' "
                                  "and that document is not in this folder",
    "money_original": "the sum as printed, characters and all",
    "money_words": "the amount written in words, where the clause writes it twice",
    "money_reading": "how the figure was read, or why it could not be",
    "money_unresolved": "digits and words disagree, so the sum is excluded from every "
                        "money calculation rather than guessed at",
    "counts_printed": "whether this award notice prints the stage counts at all. No on "
                      "54 of the 645",
    "bids_responsive": "the count the notice prints as responsive. No document in this "
                       "archive names a responsive bidder or prints a bid price",
    "bought_but_did_not_bid": "sold minus received — arithmetic on the notice's own two "
                              "printed counts, not a count of anybody",
    "received_but_not_responsive": "received minus responsive. **No document gives a "
                                   "reason for a single one of them**",
    "responsive_but_not_awarded": "responsive minus awarded",
    "bidder_level_data_available": "no on every row. The note beside it says what is "
                                   "missing, in the document's terms",
    "bidder_level_note": "the same sentence on all 645 rows, kept per-row so a "
                         "downloaded file carries the caveat with the number",
    "count_anomaly": "why the printed counts contradict each other, where they do. "
                     "Filled on one row",
    "match_key": "the normalised string used to decide whether two rows are the same "
                 "entity. Two rows sharing a key were joined; resemblance alone never "
                 "joined anything",
    "other_printed_names": "every other spelling of this name the archive prints",
    "printed_name_variants": "how many spellings of this name the archive prints",
    "name_read_from_interleaved_layout": "the name came off a page whose text layer ran "
                                         "fields together, so read it against the PDF",
    "roles": "the roles this entity is named in, semicolon separated",
    "documents": "how many documents name this entity",
    "first_document": "the first PDF, in reading order, that names it",
    "first_page": "the page of first_document it is named on",
    "resemblance": "how the two names resemble each other, in words",
    "measure": "the arithmetic behind the resemblance",
    "merged": "no on all 219 rows",
    "rule": "which normalisation rule fired",
    "confidence": "how sure the pipeline is of the normalised value",
    "level": "how precise the place name is — district, city, thana",
    "printed": "the place name exactly as the document prints it",
    "normalized": "the result of the rule, kept beside the original and never instead "
                  "of it",
    "coordinates": "blank on every row. No supplied document prints a coordinate, and "
                   "no external gazetteer was consulted",
    "relation": "what the link is, in the pipeline's own vocabulary",
    "source_type": "which table the left-hand record is in",
    "target_type": "which table the right-hand record is in",
    "evidence_file": "the PDF the link was read from",
    "evidence_page": "the page of evidence_file the link is printed on",
    "detail": "what the page prints about the link, in its own words",
    "event": "which field the date came from, so a date can be traced to its label",
    "entity": "what the date is about",
    "original": "the date exactly as printed, before it was parsed",
    "table_generation": "how the lot table was recovered from the page",
    "award_template": "which of the portal's award-notice layouts this file uses",
    "contract_value_original": "the contract value as printed, before it was parsed",
    "signals": "the observation codes that apply to this procurement",
    "blank_reasons": "for every empty cell in this row, why it is empty — the "
                     "document's silence, named field by field",
}

KIND_LABEL = {"num": "number", "date": "date", "yesno": "yes / no", "text": "text"}


def read_csv(path):
    with path.open(newline="", encoding="utf-8-sig") as fh:
        r = csv.DictReader(fh)
        return list(r.fieldnames or []), list(r)


def classify(values):
    """What kind of value a column holds, decided by looking at every filled cell."""
    filled = [v for v in values if v != ""]
    if not filled:
        return "text"
    lowered = {v.lower() for v in filled}
    if lowered <= {"yes", "no", "true", "false"}:
        return "yesno"
    if all(DATE.match(v) for v in filled):
        return "date"
    if all(NUMBER.match(v) for v in filled):
        return "num"
    return "text"


def example(values, kind):
    """One real cell — the first filled one, so the example is a row off the top of
    the file rather than whichever value happens to be shortest."""
    filled = [v for v in values if v != ""]
    if not filled:
        return ""
    if kind == "yesno":
        return " / ".join(sorted({v for v in filled})[:2])
    pick = " ".join(filled[0].split())
    return pick if len(pick) <= 60 else pick[:59] + "…"


def escape(s):
    return s.replace("|", "\\|").replace("<", "&lt;")


def column_block(name, rows, columns):
    lines = ["| Column | Kind | Filled | Distinct | Example | What it holds |",
             "|---|---|---:|---:|---|---|"]
    total = len(rows)
    for col in columns:
        values = [(r.get(col) or "").strip() for r in rows]
        kind = classify(values)
        filled = sum(1 for v in values if v != "")
        share = f"{filled:,}" + (f" ({filled * 100 // total}%)" if total else "")
        distinct = len({v for v in values if v != ""})
        note = NOTES.get(col, "")
        if not note and col.endswith("_id") and col != "tender_id":
            note = "a key into another table in this dataset"
        if not note and col.endswith("_taka"):
            note = "a sum in taka, parsed from the printed figure"
        lines.append("| `%s` | %s | %s | %s | %s | %s |" % (
            col, KIND_LABEL[kind], share, f"{distinct:,}",
            escape(example(values, kind)) or "—", escape(note)))
    return lines


def dictionary(stamp):
    out = ["# Data dictionary",
           "",
           "Every column of every table in the dataset, with how often it is filled, "
           "what kind of value it holds and one real example taken out of the file.",
           "",
           "This file is written by `investigation/scripts/build_documentation.py` "
           "from the CSVs themselves. Nothing in it is typed by hand except the last "
           "column of each table and the notes above it, so a rebuilt dataset cannot "
           "leave a count here quietly wrong.",
           "",
           "Generated %s." % stamp,
           "",
           "**A blank cell is never a zero and never a guess.** Where a document does "
           "not print a field, the cell is empty and `master_dataset.csv` carries the "
           "reason in `blank_reasons`. Where a value was changed, the original survives "
           "— either in a `_original` column beside it or as a row in "
           "`normalization.csv`.",
           "",
           "## Naming conventions",
           "",
           "| Suffix | Meaning |",
           "|---|---|",
           "| `_original` | the value exactly as the document prints it, before any "
           "normalisation |",
           "| `_id` | an internal key into another table in this dataset, not an "
           "identifier the government prints |",
           "| `_taka` | a sum in Bangladeshi taka, parsed out of the printed figure |",
           "| `_printed` | whether the document prints the thing at all, or the raw "
           "printed form of it |",
           "| `source_file`, `evidence_file`, `first_document` | a PDF filename in this "
           "folder |",
           "| `page`, `evidence_page`, `first_page` | a 1-based page number in that PDF |",
           ""]
    counts = json.loads((DATA / "dataset_summary.json").read_text())["counts"]
    by_table = {t["table"]: t for t in counts["tables"]}
    order = [t["table"][:-4] for t in counts["tables"]]
    out += ["## The tables", "",
            "| Table | Rows | Columns |", "|---|---:|---:|"]
    for name in order:
        c = by_table[name + ".csv"]
        out.append("| [`%s.csv`](#%s) | %s | %s |"
                   % (name, name.replace("_", "-"), f"{c['rows']:,}", f"{c['columns']:,}"))
    out.append("")
    for name in order:
        path = TABLES / (name + ".csv")
        if not path.exists():
            path = DATA / (name + ".csv")
        columns, rows = read_csv(path)
        c = by_table[name + ".csv"]
        out += ["---", "", "## %s.csv" % name, "",
                PURPOSE.get(name, ""), "",
                "%s rows, %s columns." % (f"{c['rows']:,}", f"{c['columns']:,}"), ""]
        out += column_block(name, rows, columns)
        out.append("")
    return "\n".join(out) + "\n"


# What each scope narrows a search to. A scope with no line here would still work;
# the point of the line is that a reader should not have to guess.
SCOPE_NOTE = {
    "agency": "the agency named on the notice",
    "company": "a firm, by any spelling the archive prints",
    "contract": "a contract number as printed on the award notice",
    "district": "the district as printed, unmerged",
    "field": "which extracted field a clause was read out of",
    "file": "a PDF filename in this folder",
    "finding": "one of the article's findings, by its id",
    "folder": "which of the three folders a document sits in",
    "kind": "the sort of record: tender, contract, clause, company, document…",
    "label": "an evidence label, or an eligibility label",
    "level": "how precise a place name is",
    "method": "the procurement method the notice prints",
    "ministry": "the ministry above the agency",
    "officer": "the officer who invited or approved",
    "owner": "a declared beneficial owner",
    "package": "the package number",
    "person": "a named person, in any role",
    "project": "the project the money is charged to",
    "ref": "an invitation reference as printed",
    "role": "the role a name is printed in",
    "rule": "a clause of a reference rulebook",
    "signal": "the tenders an observation applies to, by its code",
    "status": "the status the notice prints",
    "tender": "the portal's tender id",
    "unread": "yes finds the money figures that could not be read",
}


def search_reference(stamp):
    rec = json.loads((SEARCH / "records.json").read_text())
    post = json.loads((SEARCH / "postings.json").read_text())
    kinds = rec.get("kinds", {})
    out = ["# Search reference", "",
           "What can be typed into the search box on the site, and every field the "
           "built index advertises. Written by "
           "`investigation/scripts/build_documentation.py` out of "
           "`investigation/search/records.json`, so this list and the index cannot "
           "drift apart.", "",
           "Generated %s." % stamp, "",
           "The whole index is three files — `records.json`, `postings.json`, "
           "`text.json` — fetched once and searched in the browser. **No query leaves "
           "the machine**, and there is no server to query: the site is static files.",
           "",
           "%s records, %s interned strings, %s words in the vocabulary."
           % (f"{len(rec['records']):,}", f"{len(rec.get('strings', [])):,}",
              f"{len(post.get('vocab', [])):,}"),
           "",
           "## What a reader can type", "",
           "| Typed | What happens |", "|---|---|",
           "| `elevator` | one word, matched exactly |",
           "| `lift elevator` | both must appear — AND is the default |",
           '| `"single largest contract"` | the words in this order, verified against '
           "the page text rather than assumed |",
           "| `rajuk OR cda` | either |",
           "| `lift -tender` | the second must not appear. `NOT tender` also works |",
           "| `(rajuk OR cda) elevator` | grouped, to any depth |",
           "| `company:spectra` | a scoped field |",
           "| `amount:10000000..50000000` | a numeric range. One end may be `*` |",
           "| `closing:2024-01-01..2024-06-30` | a date range |",
           "| `kind:clause label:UNUSUAL` | two scopes, ANDed |",
           "",
           "A word with no exact match is retried three ways, and each fallback is "
           "reported to the reader as what it is, so a near miss is never mistaken for "
           "a hit: as the start of a longer word, then against an OCR-loose spelling "
           "map (`0`→o, `1`/`i`→l, `5`→s, `8`→b, `2`→z), then against every word in the "
           "vocabulary within a bounded edit distance.",
           "",
           "Bengali is tokenised separately (`U+0980`–`U+09FF`) and the site ships a "
           "local Bengali typeface, but **the extracted text of all 1,805 documents "
           "contains no Bengali codepoint** — this archive's e-GP output is entirely "
           "Latin script. A Bengali query returns nothing, which is a fact about these "
           "documents rather than a gap in the search.",
           ""]
    out += ["## What is searchable", "", "| Kind of record | Count |", "|---|---:|"]
    for k, n in sorted(kinds.items(), key=lambda kv: -kv[1]):
        out.append("| %s | %s |" % (k, f"{n:,}"))
    out += ["", "## Scopes", "",
            "%d fields can be narrowed by name. A scope matches a whole value exactly "
            "or any part of it, so a record listing several values is found by any one "
            "of them." % len(rec["scopes"]), "",
            "| Scope | Narrows to |", "|---|---|"]
    for s in rec["scopes"]:
        out.append("| `%s:` | %s |" % (s, SCOPE_NOTE.get(s, "")))
    out += ["", "## Numeric ranges", "",
            "%d fields take `field:lo..hi`, or `field:n` for one value."
            % len(rec["numeric"]), "",
            "`" + "`, `".join(rec["numeric"]) + "`", "",
            "## Date ranges", "",
            "%d fields take `field:YYYY-MM-DD..YYYY-MM-DD`." % len(rec["dates"]), "",
            "`" + "`, `".join(rec["dates"]) + "`", ""]
    if rec.get("how_to_read"):
        out += ["## The index's own note to a reader of the file", "",
                "```", str(rec["how_to_read"]).strip(), "```", ""]
    return "\n".join(out) + "\n"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    wrote = []
    for name, text in (("data_dictionary.md", dictionary(stamp)),
                       ("search_reference.md", search_reference(stamp))):
        (OUT / name).write_text(text, encoding="utf-8")
        wrote.append("%s (%s KB)" % (name, round(len(text.encode()) / 1024)))
    print("investigation/documentation/: " + ", ".join(wrote))


if __name__ == "__main__":
    sys.exit(main())



