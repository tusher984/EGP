# e-GP Watch — Chattogram Development Authority procurement records

A data investigation into 1,158 e-GP tender records (645 awarded contracts,
৳3,723.7 crore) published by Bangladesh's national e-Government Procurement
portal. Every figure on the site is reproducible from the two data files in this
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

- `Procurement_Database.json` — 1,158 scraped tender records, the source of truth.
- `article_data.json` — precomputed verified aggregates, built by `enrich_article_data.py`.
- `Tender Notice_PDFs/` (1,156) and `Contract_Awards_PDFs/` (645) — original documents.

## Rebuilding

`story.html` is the file to edit; `index.html` and `egp-investigation.html` are
generated from it and should never be edited by hand.

```bash
python3 enrich_article_data.py --check      # re-verify the aggregates
python3 build_publish.py -o index.html --base ''   # the site's front page
python3 build_publish.py                    # egp-investigation.html, absolute links
python3 -m http.server 8123                 # then open http://localhost:8123/
```
