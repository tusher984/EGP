# The pipeline

Seven scripts turn a folder of PDFs into the site. They run in order, each reading
what the one before it wrote, and none of them reaches outside the folder.

```bash
python3 -P investigation/scripts/run_pipeline.py
```

That runs all of them and stops at the first failure. To run one stage on its own,
run it the same way — always with `-P`.

**`-P` is not optional.** A module named `pytesseract.py` sits in the repository
root. Without `-P` the interpreter puts the script's own directory ahead of
site-packages, that file shadows the real package, and an older extraction routine
runs instead — overwriting `pdf_text_cache.json`. Every command in this
documentation carries the flag for that reason.

## The stages

| # | Script | Reads | Writes |
|---|---|---|---|
| 1 | `parser/01_inventory.py` | every `*.pdf` under the project root | `data/inventory.json`, `data/raw_pages.json` |
| 2 | `parser/02_extract.py` | `inventory.json`, `raw_pages.json` | `data/extracted.json` |
| 3 | `parser/03_dataset.py` | `extracted.json`, `inventory.json` | `data/tables/*.csv` (18), `data/master_dataset.csv`, `data/master_dataset.json`, `data/dataset_summary.json` |
| 4 | `parser/03_audit.py` | the tables, `extracted.json`, `inventory.json` | `data/audit_report.json` |
| 5 | `parser/04_analysis.py` | `data/tables/*.csv`, `raw_pages.json` | `data/analysis.json` |
| 6 | `parser/05_evidence.py` | `analysis.json`, `raw_pages.json`, the tables | `evidence/evidence_index.json` |
| 7 | `parser/06_search.py` | `analysis.json`, the tables, `raw_pages.json` | `search/records.json`, `search/postings.json`, `search/text.json`, `public/pages/*.json` (1,805) |

Then two scripts that finish the build:

| Script | What it does |
|---|---|
| `scripts/split_payload.py` | lifts the two long row lists out of `analysis.json` into `data/eligibility_rows.json` and `data/signals_rows.json`, and writes `data/story.json` — the file the article loads. Opening the site costs 160 KB rather than 2.6 MB because of this step. |
| `scripts/build_documentation.py` | writes `documentation/data_dictionary.md` and `documentation/search_reference.md` out of the tables and the built index |

**`split_payload.py` must run after anything that rewrites `analysis.json`.** Skip it
and the site reads a stale `story.json` while the downloads hand over a fresh
`analysis.json` — the two would disagree, which is the one failure mode this build
cannot detect from the browser.

## What each stage guarantees

**1 — Inventory.** Every PDF under the project root is found and hashed. Nothing is
skipped: the five reference rulebooks and the five records the portal did not serve
are inventoried like any other file, marked for what they are rather than dropped.
Each page's text is extracted twice, by two independent extractors, and both
character counts are kept so a disagreement is visible rather than silent.

**2 — Extraction.** Fields, eligibility clauses, lots, amendments, declared owners,
dates, money and identifiers, each recorded with the page it was read from. Ruled
tables are read as tables. A value that cannot be parsed is kept as printed and
marked unresolved; it is never dropped and never guessed at.

**3 — Dataset.** One table per entity, plus `master_dataset.csv` joining a notice to
its award. Two rules govern this stage: an original value is never discarded, and
two entities are never merged because their names resemble each other. Resembling
names go to `name_candidate_pairs.csv` for a human to judge. Every normalisation is
logged in `normalization.csv` with its rule and its reason.

**4 — Audit.** The dataset is checked against itself and against a separately written
earlier parser, cell by cell. It re-derives every headline figure from the tables
independently of the code that wrote them. The run must end at **0 failed**; if it
does not, nothing downstream should be published.

**5 — Analysis.** Every finding, every aggregate, every distribution — computed from
`data/tables/*.csv` only. Findings carry one of four labels: `DOCUMENTED FACT`,
`DATA-DERIVED FINDING`, `POSSIBLE CONNECTION`, `UNRESOLVED`. Where a comparison is
made, the test and its p-value are computed and published whichever way the result
falls.

**6 — Evidence.** For every cited PDF, each value the dataset holds is looked for in
the extracted text of the pages, and what is found is recorded with its page. A
citation on the site is therefore a claim that has been checked against the page, not
a filename printed beside a number.

**7 — Search.** The whole archive becomes one set of searchable records with a
delta-encoded postings list, plus one small page file per document so a phrase can be
verified against the page it sits on. Nothing is queried over the network; the index
is three static files.

## Re-running after a change

| Changed | Re-run |
|---|---|
| a PDF added or removed | 1 → 7, then `split_payload.py` |
| extraction logic | 2 → 7, then `split_payload.py` |
| a table's shape | 3, 4, then 5 → 7, then `split_payload.py`, then `build_documentation.py` |
| analysis only | 5, then 6 → 7, then `split_payload.py` |
| the site's JavaScript or CSS | nothing — the browser reads those directly |

After any of these, reload the site and check the figures against
`data/audit_report.json`. `run_pipeline.py` prints the audit's pass/fail line so a
regression is visible without opening the file.

## Serving the site

The site is static files and needs no build step. Any static server will do; the
entry document is `investigation/public/index.html`, and the paths inside it resolve
relative to that, so the server's root must be the **repository root**.

```bash
python3 -m http.server 8123
```

Then open `http://localhost:8123/investigation/public/index.html`.

Opening `index.html` from the filesystem will not work: the site is ES modules and
`fetch`, both of which a browser refuses over `file://`.
