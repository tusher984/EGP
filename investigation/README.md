# e-GP Watch

An investigation into what Bangladesh's e-Procurement portal published about 1,150
tenders and the 645 contracts that came out of them: who was allowed to bid, who bid,
how many were set aside, who won, and how much money changed hands.

**One rule governs everything here.** The PDFs in this project folder are the only
source. No figure, name, date or sum on the site comes from anywhere else — not from a
search, an API, an external dataset or prior knowledge. Where the documents do not
settle something, the site says so in those words rather than filling the gap. That is
why the word "unresolved" appears as often as it does.

The site is static: no bundler, no framework, no dependencies, and nothing fetched from
another host. `package.json` exists to hold the commands below; `npm install` has
nothing to install.

## The archive

| | |
|---|---|
| PDFs read | 1,805 — 1,150 tender notices, 645 contract-award notices, 5 reference rulebooks, 5 records the portal did not serve |
| Tables built | 18, plus a master dataset joining each notice to its award |
| Eligibility clauses read | 3,239 |
| Bids received / found responsive / contracts signed | 2,749 / 1,752 / 591 |
| Firms named as winners | 309 |
| Awarded value printed | Tk 37.2 billion |
| Findings published | 29, each carrying one of four labels |
| Audit checks | 26, all passing, including 8,223 award cells compared cell-by-cell against a separately written earlier parser |

Every count above is read out of the tables, and `parser/03_audit.py` re-derives the
headline figures from them independently of the code that wrote them. Nothing here is
typed into the site by hand.

## Running it

The site needs a server only because browsers refuse ES modules and `fetch` over
`file://`. Its entry document is `index.html` at the **repository root**, one level above
this folder — the same file the published site opens on — so the server's root must be
the repository root. `npm run serve` does that from here.

```bash
npm run serve
```

Then open `http://localhost:8123/`.

To rebuild everything from the PDFs — nine stages, in order, stopping at the first
failure and refusing to continue past a failed audit:

```bash
npm run pipeline
```

Or a single stage, and the checks that stand on their own:

| Command | What it does |
|---|---|
| `npm run pipeline:plan` | print the nine stages and stop |
| `npm run audit` | stage 4 alone — the dataset checked against itself and against the earlier parser |
| `npm run docs` | regenerate the data dictionary and the search reference from the built tables |
| `npm run palette` | re-run the colour-vision checks on the chart hues against the light page |
| `npm run palette:night` | the same checks against the dark page |
| `npm run check` | parse every JavaScript module |

`run_pipeline.py` launches each stage as `python3 -P`. **That flag is not optional.** A
module named `pytesseract.py` sits in the repository root; without `-P` it shadows the
real package and an older extraction routine runs instead, overwriting the page-text
cache. Running a stage by hand is one forgotten flag away from a different dataset.
`investigation/documentation/pipeline.md` says what each stage reads and writes, and
which stages to re-run after which kind of change.

## What is where

| Folder | |
|---|---|
| `parser/` | the seven stages: inventory, extraction, dataset, audit, analysis, evidence, search |
| `data/` | the 18 tables, the master dataset, `analysis.json`, and `story.json` — the 160 KB payload the article loads instead of the 2.6 MB analysis |
| `evidence/` | for every cited figure, the page it was found on and what that page prints |
| `search/` | the index: records, a delta-encoded postings list, and page text. Three static files; nothing is queried over a network |
| `app/`, `charts/`, `components/`, `styles/` | the site — plain ES modules, hand-drawn SVG charts, and a palette validated for three kinds of colour blindness in both light and dark |
| `public/` | one small JSON file per document, so any phrase can be checked against the page it sits on. `index.html` here is a redirect: the real entry document is at the repository root |
| `documentation/` | the data dictionary (every column of every table), the search reference, and the pipeline |
| `scripts/` | the runner, the payload splitter, the documentation generator, the palette validator |
| `assets/` | the one icon |

## Verifying a claim

Every figure on the site carries the PDF filename and page it was read from, and the
citation is a link: it opens the document itself. Two files at the repository root exist
for a reader who would rather work from a spreadsheet than a browser:

- **`EVIDENCE_MATRIX.csv`** — 101 rows across the 29 findings: each one's label, the PDF
  and page it was read from, the text found on that page, and the calculation applied to
  it.
- **`EDITOR_QA_REPORT.md`** — what was checked and what could not be. Its final section,
  *Remaining risks*, is the honest part: two links in the chain the documents cannot
  carry, a central statistical test that came back negative, 612 of 1,150 notices that
  publish no eligibility rule at all, and 219 pairs of similar company names that were
  left unmerged because no document says they are the same firm.

## What these documents cannot answer

Of the 2,749 bids that arrived, 997 were set aside. **Not one document in this archive
prints a reason for a single one of them**, and no bidder list, bid price or evaluation
ranking appears anywhere in the 1,805 files. So the funnel on this site is a picture of
*how many* dropped out, never of *who* or *why*. Nothing here identifies a rejected
bidder, and nothing here should be read as saying why a bid failed.

The site follows that limit throughout. A pattern is called an **investigative signal**
and never proof of wrongdoing; firms and officials are named only because the
government's own published record names them; and where the record itself looks wrong —
one contract prints its supplier's name as `Verbal` — the page is reproduced as printed
rather than corrected, and the discrepancy is named in the QA report instead.

