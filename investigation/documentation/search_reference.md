# Search reference

What can be typed into the search box on the site, and every field the built index advertises. Written by `investigation/scripts/build_documentation.py` out of `investigation/search/records.json`, so this list and the index cannot drift apart.

Generated 2026-09-01 09:30 UTC.

The whole index is three files — `records.json`, `postings.json`, `text.json` — fetched once and searched in the browser. **No query leaves the machine**, and there is no server to query: the site is static files.

9,552 records, 8,463 interned strings, 13,461 words in the vocabulary.

## What a reader can type

| Typed | What happens |
|---|---|
| `elevator` | one word, matched exactly |
| `lift elevator` | both must appear — AND is the default |
| `"single largest contract"` | the words in this order, verified against the page text rather than assumed |
| `rajuk OR cda` | either |
| `lift -tender` | the second must not appear. `NOT tender` also works |
| `(rajuk OR cda) elevator` | grouped, to any depth |
| `company:spectra` | a scoped field |
| `amount:10000000..50000000` | a numeric range. One end may be `*` |
| `closing:2024-01-01..2024-06-30` | a date range |
| `kind:clause label:UNUSUAL` | two scopes, ANDed |

A word with no exact match is retried three ways, and each fallback is reported to the reader as what it is, so a near miss is never mistaken for a hit: as the start of a longer word, then against an OCR-loose spelling map (`0`→o, `1`/`i`→l, `5`→s, `8`→b, `2`→z), then against every word in the vocabulary within a bounded edit distance.

Bengali is tokenised separately (`U+0980`–`U+09FF`) and the site ships a local Bengali typeface, but **the extracted text of all 1,805 documents contains no Bengali codepoint** — this archive's e-GP output is entirely Latin script. A Bengali query returns nothing, which is a fact about these documents rather than a gap in the search.

## What is searchable

| Kind of record | Count |
|---|---:|
| clause | 3,239 |
| document | 1,805 |
| lot | 1,152 |
| tender | 1,150 |
| contract | 645 |
| location | 607 |
| company | 309 |
| amendment | 160 |
| person | 137 |
| organisation | 110 |
| project | 108 |
| owner | 77 |
| finding | 29 |
| rule | 14 |
| signal | 10 |

## Scopes

25 fields can be narrowed by name. A scope matches a whole value exactly or any part of it, so a record listing several values is found by any one of them.

| Scope | Narrows to |
|---|---|
| `agency:` | the agency named on the notice |
| `company:` | a firm, by any spelling the archive prints |
| `contract:` | a contract number as printed on the award notice |
| `district:` | the district as printed, unmerged |
| `field:` | which extracted field a clause was read out of |
| `file:` | a PDF filename in this folder |
| `finding:` | one of the article's findings, by its id |
| `folder:` | which of the three folders a document sits in |
| `kind:` | the sort of record: tender, contract, clause, company, document… |
| `label:` | an evidence label, or an eligibility label |
| `level:` | how precise a place name is |
| `method:` | the procurement method the notice prints |
| `ministry:` | the ministry above the agency |
| `officer:` | the officer who invited or approved |
| `owner:` | a declared beneficial owner |
| `package:` | the package number |
| `person:` | a named person, in any role |
| `project:` | the project the money is charged to |
| `ref:` | an invitation reference as printed |
| `role:` | the role a name is printed in |
| `rule:` | a clause of a reference rulebook |
| `signal:` | the tenders an observation applies to, by its code |
| `status:` | the status the notice prints |
| `tender:` | the portal's tender id |
| `unread:` | yes finds the money figures that could not be read |

## Numeric ranges

16 fields take `field:lo..hi`, or `field:n` for one value.

`amount`, `changed`, `characters`, `clauses`, `contracts`, `documents`, `lots`, `pages`, `received`, `responsive`, `signals`, `sold`, `tenders`, `words`, `year`, `years`

## Date ranges

10 fields take `field:YYYY-MM-DD..YYYY-MM-DD`.

`advertised`, `closing`, `completion`, `first_award`, `last_award`, `noa`, `opening`, `published`, `signed`, `start`

## The index's own note to a reader of the file

```
one record per thing a reader might look for. k is the kind, t the name, s the line under it, f the values a scoped query matches (company:, person:, agency:, tender:, district:, status:, label:, file: and the rest of scopes), n the numbers a range query compares (amount:a..b, year:a..b), d the dates (date:a..b), and r the file and page it was printed on. Values in f, and r.file, are indexes into strings. The words that are searchable but not displayed are in text.json, one entry per record id, fetched only when a query needs a phrase checked. Document text is not here; it is in investigation/public/pages/.
```

