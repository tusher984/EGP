# e-GP Watch — Chattogram Development Authority procurement records

A data investigation into 1,151 e-GP tenders (645 awarded contracts,
৳3,723.7 crore) published by Bangladesh's national e-Government Procurement
portal. Every figure on the site is reproducible from the data files in this
repository, and every contract links to the original notice and award PDF.

Findings are stated as **red flags warranting scrutiny**, not as accusations. The
limitations section on the article page lists what the data cannot show.

## The published site

<https://tusher984.github.io/EGP/> — GitHub Pages serves the repository root as-is
(`.github/workflows/deploy-pages.yml`, `path: .`), so the 1,800 source PDFs and the
data files are served from the same site. Nothing needs uploading anywhere.

| URL | Page |
|---|---|
| `/` (`index.html`) | **The investigation** — full data story, Bangla + English, light + dark. Self-contained: the data is inlined, so it also works opened from disk. |
| `/tool.html` | Interactive per-tender forensic tool — 18 rules, cross-tender pattern view, inline PDF viewer. |
| `/investigation.html` | The narrative article. |
| `/findings.html` | Findings summary. |
| `/story.html` | Editable source of the investigation (fetches `article_data.json` at runtime; needs a web server). |
| `/egp-investigation.html` | Portable copy of the investigation with absolute links, for a CMS or an email attachment. |

## Data

- `Procurement_Database.json` — 1,158 scraped rows, of which 1,151 carry a tender.
  The register as published; two of its columns are not trustworthy and the article
  says which (see below).
- `pdf_derived.json` — what the 1,800 government PDFs actually say, extracted by
  `verify_pdfs.py`: 645 award rows, 1,128 document prices, the truncation audit and
  the PDF-coverage counts. This is the repair source for anything the register got
  wrong.
- `article_data.json` — the precomputed aggregates the pages render.
- `Tender Notice_PDFs/` (1,155 PDFs) and `Contract_Awards_PDFs/` (645) — the
  original documents. Six notice PDFs hold no record: five where the portal
  answered "this tender is not exists or you are un-authorized", one blank print.

### Two columns the register gets wrong

Found by reading the PDFs, corrected from them, and asserted by `verify_figures.py`
so they cannot be silently reverted:

- **`Document_Price_BDT` is not a price.** It holds the day of the month of
  `Security_Valid_Up_To`; 1 of 1,128 values matches the fee the notice prints. Every
  document-fee figure is read off the notices instead.
- **Long names are stored cut to ~40 characters.** 271 rows lose the end of the
  office name, 49 the end of the contractor's. Two truncated office names each stand
  for more than one real office and a third office is stored both ways, so anything
  grouped by office is grouped on the notices' full names by `repair_names.py`.

## Rebuilding

`story.html` is the file to edit; `index.html` and `egp-investigation.html` are
generated from it and should never be edited by hand.

```bash
python3 verify_pdfs.py                      # read the 1,800 PDFs -> pdf_derived.json
python3 repair_names.py                     # patch article_data.json from the PDFs
python3 build_graphics_data.py              # graphics/netra-graphics-data.js
python3 build_publish.py -o index.html --base ''   # the site's front page
python3 build_publish.py                    # egp-investigation.html, absolute links
python3 verify_figures.py                   # 82 checks; non-zero exit on any drift
python3 -m http.server 8123                 # then open http://localhost:8123/
```

`repair_names.py` and `verify_pdfs.py` are both idempotent — everything is keyed on
tender id, so a second run changes nothing. `verify_pdfs.py` takes about a minute
(it decompresses every PDF with the standard library; there are no third-party
dependencies anywhere in this pipeline).
