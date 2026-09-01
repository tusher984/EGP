# Editor's QA report

What was checked, what failed, and what remains open, for the investigation published
at `investigation/public/index.html`.

Every number below was read out of the pipeline's own output files —
`investigation/data/dataset_summary.json`, `audit_report.json`, `analysis.json` — or
measured in a running browser against the served site. Nothing here was typed from
memory, and nothing here comes from outside the 1,805 PDFs in this folder.

Run checked: 2026-09-01. Dataset written 2026-09-01T01:05:16 by `parser/03_dataset.py`;
audited the same minute by `parser/03_audit.py`.

---

## 1. Documents

**1,805 PDFs found, 1,805 read. None skipped, none unreadable.**

| Folder | PDFs |
|---|---|
| `Tender Notice_PDFs/` | 1,155 |
| `Contract_Awards_PDFs/` | 645 |
| `eGP_Forensic_Engine/` | 5 |

| What the document is | Count |
|---|---|
| Tender notice | 1,150 |
| Contract award notice | 645 |
| Reference rulebook (not e-GP output) | 5 |
| Record the portal did not serve | 5 |

Checks that passed on all 1,805:

- **A text layer is present** — `has_text_layer` is yes for every file, so nothing in
  this archive is an image of a page. `needs_ocr` is no for every file. No OCR was run
  and no OCR confidence is claimed anywhere on the site, because none was needed.
- **Two extractors agree** — every page was read twice, by two independent text
  extractors, and `extractors_agree` is yes for all 1,805. Where they had disagreed the
  field would carry a lowered confidence; none does.
- **Every page's text is on disk** — 1,805 JSON shards in
  `investigation/public/pages/` (11 MB), one per document, so any quote on the site can
  be checked against the page it was read from without opening the PDF.

Flagged, not fixed:

- **4 documents share their extracted text with another document.** They are kept as
  four documents, not merged, and `duplicate_text_of` names the twin in
  `documents.csv`. Deleting one would silently change every count on the site.
- **1 document has an interleaved layout** — `RAJUK_Tender_248630.pdf`, where the text
  layer runs a value into the next field's label ("agency contains the label Procuring
  Entity Name"). Two fields on that one notice are marked accordingly.
- **5 documents are the portal's own failure, captured.** `CDA_Tender_1100000.pdf`,
  `RAJUK_Tender_130206.pdf`, `RAJUK_Tender_95841.pdf`, `RAJUK_Tender_97791.pdf` and
  `RDA_Tender_672890.pdf` are one page and 135 characters each: a page saying the record
  is unavailable. They are counted as documents found and excluded from tender counts.
- **5 files are rulebooks, not procurement records.** `2026-01-04-13-47-03-e-PG3A.pdf`
  (89 pp), `IDU-a052dfd8-…pdf` (69 pp), `IDU10a2d5d23110cc14a561badf1ef6ba448d853.pdf`
  (3 pp), `Procurement Regulations for ADB Borrowers.pdf` (2 pp) and `chapter2_en.pdf`
  (68 pp). They are the source of the thresholds the site tests notices against, and
  they are never counted as tenders.

---

## 2. Dataset

Eighteen tables, plus one row per procurement in `master_dataset.csv`. Row and column
counts are the pipeline's own, written by counting the files it had just written.

| Table | Rows | Columns |
|---|---:|---:|
| `documents.csv` | 1,805 | 31 |
| `tenders.csv` | 1,150 | 64 |
| `contracts.csv` | 645 | 46 |
| `bids.csv` | 645 | 20 |
| `eligibility_criteria.csv` | 3,239 | 19 |
| `lots.csv` | 1,152 | 11 |
| `amendments.csv` | 160 | 10 |
| `amendment_changes.csv` | 735 | 10 |
| `beneficial_owners.csv` | 77 | 11 |
| `companies.csv` | 309 | 23 |
| `people.csv` | 137 | 17 |
| `organizations.csv` | 110 | 19 |
| `projects.csv` | 108 | 16 |
| `locations.csv` | 607 | 7 |
| `relationships.csv` | 9,694 | 8 |
| `timeline.csv` | 13,411 | 7 |
| `normalization.csv` | 245 | 6 |
| `name_candidate_pairs.csv` | 219 | 12 |
| `master_dataset.csv` | 1,151 | 112 |

The master table joins a notice to its award: **644 rows have both**, 506 are a notice
whose award notice is not in the folder, and 1 is an award whose notice is not in the
folder. Those three numbers add to 1,151 and are printed on the site rather than
smoothed over.

**The audit passed: 26 checks run, 0 failed.** `03_audit.py` re-derives every headline
figure from the tables independently of the code that wrote them, and separately
compared **8,223 award cells** against the earlier parser's output cell by cell.

Money reconciles: **Tk 37,236,845,973.56** across 645 award notices, and
`contracts_without_a_printed_value` is **0** — every award notice in this archive prints
a contract value, so the total is a sum of printed figures and not an estimate.

Normalisation is logged, never silent. **245 normalisations** are recorded in
`normalization.csv` with the original value, the normalised value, the rule and the
reason; **473 field values** were touched by four rules only — `id-from-filename`,
`leading-serial-number`, `leading-status-term`, `same-key`. **219 pairs of names
resemble each other and 0 were merged**: they are published as candidate pairs for a
human to judge, because two firms with similar names are not evidence of one firm.

---

## 3. Responsive bids

This is the section the investigation was commissioned around, and it is also the
section with the hardest limit. **The archive contains 0 bidder-level records.** Not one
document in 1,805 names who bid and lost. The funnel is therefore a funnel of *counts*,
printed on the award notices themselves, and the site says so at the figure.

**645 award notices. 591 print bid counts; 54 print none.** Every figure below rests on
those 591.

| Step | Count | Of the step above |
|---|---:|---:|
| Documents sold | 3,436 | — |
| Bids received | 2,749 | 687 fewer (20.0%) |
| Bids recorded responsive | 1,752 | 997 fewer (36.3%) |
| Contracts signed | 591 | 1,161 fewer (66.3%) |

What was checked and holds:

- **201 of 591 tenders (34.0%) reached the award with exactly one responsive bid.** In 87
  of them only one bid ever arrived, so there was nothing to set aside; in the other 114
  more than one arrived and one remained.
- **335 tenders set at least one bid aside; 256 set none aside.** The distribution is
  published in full, including its tail: one tender received 54 bids and recorded none
  of them responsive.
- **No step of the chain is assumed to imply the next.** Responsive is not treated as
  qualified, qualified is not treated as lowest, and lowest is not treated as winner —
  the archive does not print bid prices, so the site never ranks bidders on price.

One anomaly, published as an anomaly:

- **Tender 95841 names a winner while its responsive count reads zero.**
  `bid_count_anomalies` is 1 and this is it. The documents do not explain it. The tender
  notice for that same ID is one of the five records the portal did not serve, so the
  contradiction cannot be resolved from this folder and is left standing.

**Not one rejection reason is printed anywhere in the archive.** 997 bids were set aside
and no document says why any of them was. `bidder_level_data_available` is `no` on all
645 award notices, each carrying the same note: "the archive prints stage counts and the
winner only; no bidder list, quoted price, evaluated amount, ranking or per-bidder
rejection reason appears in any supplied document." The site states this at the funnel
and does not offer a reason for a single set-aside bid.

---

## 4. Eligibility criteria

**3,239 conditions of entry were extracted with the exact words they are printed in**, and
every one carries the file and page it was read from. None was paraphrased.

How they were classified, and the count in each class:

| Label | Clauses | What it means |
|---|---:|---|
| COMMON | 1,327 | The wording recurs across many notices from many offices |
| UNUSUAL | 870 | The wording or the figure is uncommon in this archive |
| UNDETERMINED | 961 | Not enough comparable text in the archive to judge |
| HIGHLY SPECIFIC | 59 | Names a particular product, place, model or credential |
| RESTRICTIVE-LOOKING PATTERN | 22 | Sits in the top decile of this archive's own figures |

The classification is comparative and it says so: a clause is "unusual" *relative to the
other 3,238 clauses in this folder*, never relative to anything outside it. **No clause
is called "tailored" anywhere on the site**, because no supplied document establishes
intent, and the label the site uses for a pattern is "investigative signal."

The cuts the top decile falls at, computed from this archive and printed beside the
figure: **annual turnover Tk 188,000,000**, **liquid assets Tk 38,300,000**, **5.0 years
of experience**, **2.0 similar contracts**. Figures by kind: 347 turnover, 368 liquid
asset, 6 price band, 4 credit-line.

### The chain the investigation exists to test — and it comes back empty

The join is ELIGIBILITY × RESPONSIVENESS: do the notices with the strongest-looking entry
requirements end with fewer bidders standing? Of 591 tenders that print bid counts, 590
carry a classified clause. **25 of them are "strong"** (7 RESTRICTIVE-LOOKING PATTERN, 18
HIGHLY SPECIFIC).

| Test | Strong clause | Every other tender | Two-sided p |
|---|---:|---:|---:|
| Ended with one responsive bid | 12 / 25 = 48.0% | 189 / 566 = 33.4% | **0.137** |
| Set at least one bid aside | 13 / 25 = 52.0% | 322 / 566 = 56.9% | **0.683** |

**Neither test is significant.** The first difference points the way the hypothesis
predicted and the second points the other way, and on 25 tenders neither survives. The
site publishes both numbers, both p-values and the sentence that the data does not
support the inference — it does not report the 48% against 33% and stop.

### What could not be classified, and is not hidden

- **615 clauses in 615 notices defer to a document the portal does not publish** — the
  wording is "as stated in the tender document," and the tender document is not in this
  folder. For **612 of those 1,150 notices that is the only entry rule printed**, so for
  more than half the archive the rules of entry are simply not public. That is itself one
  of the site's ten investigative signals (`S-NO-RULE-PUBLISHED`, 612 tenders).
- **961 clauses are UNDETERMINED** — the archive does not contain enough comparable
  wording to say whether they are ordinary. They are counted, published and left
  unclassified rather than pushed into COMMON to tidy the chart.
- **20 clauses in 17 notices print a sum that cannot be read** — the digits and the words
  disagree, e.g. `Tk. 23(Twenty three)` where the surrounding clause requires a figure in
  lakh. They are marked `money_unresolved` and excluded from every money calculation.
- **7 figures fall below a plausible face value** and are flagged rather than rescaled.
- **36 tenders had their entry requirements rewritten by amendment** — 89 clause pairs in
  all: 51 reworded, 17 added, 19 removed and 2 differing only in punctuation. Both the
  original and the replacement wording are kept.

---

## 5. Data quality

The rule applied throughout: an original value is never discarded, and a blank is never
left unexplained. Every empty cell in `master_dataset.csv` carries a printed reason in
`blank_reasons` — the reason is "the document does not print this field," not a guess.

Contradictions found and published as contradictions:

- **59 notices say a contract was awarded, and no award notice for them is in the
  folder.** Signal `S-AWARD-MISSING`. The site does not infer a winner for any of them.
- **1 award notice has no matching tender notice** in the folder.
- **207 tenders ended without a contract, and not one prints why.** Status alone:
  Re-Tendered 114, Being processed 49, Rejected 46, Cancelled 26, To be Re-Tendered 21,
  Contract Terminated 2. "Rejected" is the portal's own word for the tender, not a
  finding about any bidder.
- **183 notices print no status at all.** Counted as no status, not as any status.
- **Not one of the 160 amendments prints its own date**, so no amendment can be placed on
  the timeline by the day it was issued. Of the 160, **144 print a change table** (735
  listed changes, of which 519 are a real change and 216 restate a value unchanged), and
  **only 16 print a ground** for the change.
- **404 date changes, every one of them moving a deadline later; 0 moved earlier.** 88
  tenders had a closing date moved, median 8 days added; across 83 datable tenders the
  advertised window went from 22 days as first published to 30 after amendment.
- **14 district spellings across 5 offices that print more than one spelling, and nothing
  was merged.** Dhaka 1,056, Cox's Bazar 243, Chattogram 229, Khulna 101, Rajshahi 78,
  Chittagong 45, Gazipur 28, Dinajpur 3, then Comilla, Satkhira, Pabna, Barisal and
  Laksmipur at 2 each and Sirajganj at 1. Chattogram and Chittagong are the same city
  under two spellings; the site says so in words and still counts them separately,
  because merging them would be an edit to the government's own record.
- **The timeline runs 2014-12-01 to 2029-02-28** — dates in the future are contract
  completion dates the documents print. Busiest year 2024, with 2,376 events.

---

## 6. Website QA

**The application was run, not read.** Everything below was measured in a browser at
`http://localhost:8123/investigation/public/index.html`, with all six lazily-built tools
forced to build, not inferred from the source.

Structure and load:

- `documentElement.dataset.ready === "1"`; **20 section bands, 73 ids, 5,538 DOM nodes**
  with every tool built; `loadEventEnd` at 29 ms.
- **59 resources, one host: `localhost:8123`. Zero external hosts.** No CDN, no web font,
  no map tile, no analytics, no API. The only font is a local `@font-face` pointing at
  the repo's own `fonts/` directory.
- **Zero failed requests.** Every one of the **35 download rows** resolves — the section
  asks the server for each file's size with a HEAD request rather than printing a written
  down number, and the section shows **0 "not on this server" warnings**.

Accessibility:

- **749 focusable elements, 0 without an accessible name.** No positive `tabindex`
  anywhere. Skip link lands on `#summary`. One `<h1>`. `lang="en"`.
- **17 chart SVGs carry `role="img"` and all 17 are named.** Because `role="img"` hides
  the text inside an SVG from a screen reader, each figure's own heading is put on the SVG
  and the numbers stay readable in the table every figure carries underneath.
- **4 data tables, all named** — by a printed `<caption>` where the table stands alone,
  by `aria-label` where it sits inside a figure whose heading already names it, so the
  name is announced once rather than twice.
- 0 images without `alt`. 51 disclosures, all native `<details>/<summary>`.
- Dark mode is a **separate validated palette** under `html.night`, applied before first
  paint by an inline script so there is no flash, not an automatic inversion.

Charts:

- **19 figures, 312 text labels, 0 overlapping label pairs at 1280×900** — checked by
  pairwise-intersecting every text bounding box in every figure, not by eye. No SVG
  overflows its figure box.
- Both sequential ramps run monotonically light→dark with the number on the axis, so "no
  bids set aside" reads as the lightest step and not a middling one.
- One axis per chart; no dual-axis chart anywhere; a 2px gap of page colour between
  neighbouring fills; direct labels only where they earn the space.

Mobile:

- At **375×812**, `document.body.scrollWidth === 375` — no horizontal page scroll with all
  20 bands built. At the narrower **423px** pane width, 408. The only sideways scrollers
  are the ones meant to scroll: the wide data tables, the document picker and the page
  viewer.
- Below 46rem the masthead's eight section links take a row of their own rather than
  becoming a 136px scroller showing a link and a half, and `scroll-padding-top` grows to
  match the now two-row sticky bar so an anchored section does not land underneath it.

Search — every query below was typed into the live box and the count read off the page:

| Query | What it exercises | Result |
|---|---|---|
| `company:niaz` | scoped field | 15 records |
| `tender:1001782` | scoped field | 11 records |
| `agency:RAJUK` | scoped field | 62 records |
| `agency:RAJUK year:2018` | two scopes ANDed | 29 records |
| `agency:RAJUK year:2024` | two scopes ANDed | nothing — and that is correct |
| `amount:10000000..50000000` | numeric range | 483 records |
| `closing:2024-01-01..2024-06-30` | date range | 107 records |
| `rajuk OR cda` | boolean OR | 6,621 records |
| `(rajuk OR cda) elevator` | grouping | 3 records |
| `"single largest contract"` | phrase, verified against page text | nothing |
| `ra1uk` | OCR-loose spelling (1 for j) | 4,932 records |
| `signals:4` | numeric range on a derived count | 9 tenders |
| `unread:yes` | the unreadable money figures | 20 clauses |

`agency:RAJUK year:2024` returning nothing was checked against the index rather than
assumed to be a bug: every record whose agency names RAJUK carries a year between 2018 and
2021, so the empty result is a fact about the archive. The two queries that do intersect
return 29 and 23, which match the index exactly.

**Two search defects were found and fixed during this pass.**

1. `signal:` was advertised as a scope but reached only the 10 records that *define* the
   observations, not the 908 tenders that carry them — so an editor searching
   `signal:S-COUNT-ANOMALY` got the definition and not the single anomalous tender. Tender
   records now carry their observations, and all ten signals reconcile exactly with
   `by_signal` in `analysis.json`: 201+1, 335+1, 63+1, 80+1, 75+1, 612+1, 59+1, 17+1,
   28+1, 1+1 — the +1 in each being the definition record itself. A `signals:` numeric
   field was added with it, so `signals:3..4` finds the 106 records carrying the most.
2. Two counts were still typed into the JavaScript by hand — "1,805 documents" in the
   no-match note and "there are 1,805 of them" in the downloads prose. Both now come from
   `dataset_summary.json` and the index's own `kinds` block, so a rebuilt dataset cannot
   leave them quietly wrong.

**Bengali search is present and exercises nothing.** The tokeniser splits the Bengali
block and the local Bengali font is wired up, but a scan of the extracted text of all
1,805 documents finds **zero Bengali codepoints** — this archive's e-GP output is entirely
in Latin script. A Bengali query therefore returns "nothing matches," which is the truth
about these documents rather than a gap in the search. The font correctly reports
`unloaded` in `document.fonts` when no Bengali glyph is on screen.

---

## 7. Remaining risks

Nothing in this section is a bug to be fixed. Each one is a limit of the 1,805 documents
that survives into the published site, and each is printed on the site where it bites.
They are gathered here so an editor can see the whole ceiling at once.

### The chain has two links the documents cannot carry

The investigation was framed as RULES → ELIGIBILITY → BIDS → RESPONSIVENESS → REJECTIONS
→ EVALUATION → AWARD → MONEY → CONNECTIONS. Two of those links are simply not in the
archive.

- **REJECTIONS.** 997 bids were recorded non-responsive and **not one document gives a
  reason for any of them.** There is no bidder list, no quoted price, no evaluated amount
  and no ranking in any of the 1,805 files. The site can say how many were set aside; it
  cannot say who, or why, and it never offers a reason.
- **EVALUATION.** For the same reason nothing can be said about how bids were compared.
  The site never treats responsive as qualified, qualified as lowest, or lowest as winner.

The risk this creates is a reader — or a later editor — reading the funnel as a picture of
*who* dropped out. It is a picture of *how many*. The site says so at the figure and the
figure carries no bidder names, because there are none to carry.

### The central test is negative, and negatives get quoted selectively

The join the whole investigation exists to test — do the strongest-looking entry
requirements end with fewer bidders standing? — rests on **25 tenders**. One difference
runs the way the hypothesis predicted (48.0% against 33.4%) and the other runs the
opposite way (52.0% against 56.9%), and at p = 0.137 and p = 0.683 neither survives.

**The 48% against 33% must never be lifted out of this context.** On 25 tenders it is
consistent with chance. Both p-values are printed beside both figures and the site says in
words that the data does not support the inference.

### More than half the archive publishes no rule to check

**612 of 1,150 notices print no entry requirement other than a pointer to a document the
portal does not publish** — 615 clauses reading "as stated in the tender document." For
those procurements the first link of the chain cannot be inspected at all. That absence is
published as an observation in its own right (`S-NO-RULE-PUBLISHED`), not smoothed over,
but it means any statement about how restrictive this archive's entry rules are is a
statement about the minority of notices that print them.

### The labels are comparative, and one of them invites misreading

A clause is UNUSUAL *relative to the other 3,238 clauses in this folder* — not relative to
Bangladeshi practice, not relative to law, not relative to anything outside the folder.
**961 clauses could not be classified at all** and are published as UNDETERMINED rather
than pushed into COMMON. No clause is called tailored anywhere on the site, and the word
for a pattern is "investigative signal."

### Names are strings, and were left as strings

**219 pairs of company names resemble each other and none was merged.** That cuts both
ways and the site states both: where one firm files under two spellings it is counted
twice, and where two genuinely different firms have similar names they are never conflated.
Every count of companies on the site is therefore a count of *names as printed*. The 219
pairs are published for a human to judge.

The same applies to place: **14 district spellings across 5 offices that print more than
one**, Chattogram and Chittagong among them, counted separately with the overlap stated in
words. Merging them would be an edit to the government's own record.

**28 tenders share a printed address with another** (`S-SHARED-ADDRESS`). An address in
common is an address in common. No supplied document establishes common ownership,
control or coordination, and the site does not assert any.

### The folder is what the portal served, not a census

- **59 notices say a contract was awarded and no award notice for them is in the folder;
  1 award notice has no matching tender notice.** The site infers no winner for any of the
  59.
- **5 records the portal did not serve** are captured as one-page "unavailable" notices and
  counted as documents, never as tenders. One of them is why **tender 95841's contradiction
  cannot be resolved**: it names a winner while its responsive count reads zero, and its
  own notice is one of the five.
- **207 tenders end without a contract and not one prints why.** 183 print no status at
  all. "Re-Tendered" and "Rejected" are the portal's words for the tender; neither is a
  finding about any bidder.
- **4 documents share their extracted text with another.** They are kept as four documents
  and the twin is named in `documents.csv`. Whether the portal served the same record
  twice cannot be determined from the files, so document counts include all four.

Absence in this folder is not evidence of absence in Bangladeshi procurement. Every count
here is a count of what these 1,805 files print.

### Figures that could not be read, and time that could not be placed

- **20 money figures in 17 notices cannot be read** — digits and words disagree, e.g.
  `Tk. 23(Twenty three)` in a clause requiring lakh. They are marked `money_unresolved`
  and excluded from every money calculation, so the money figures on the site rest on the
  sums that could be read, not on all of them. **7 more** fall below a plausible face value
  and are flagged rather than rescaled.
- **Not one of the 160 amendments prints its own date.** No amendment can be placed on the
  timeline by the day it was issued, and the 404 deadline extensions — every one of them
  later, none earlier — cannot be dated either. Only 16 of the 160 print a ground.
- Dates running to **2029-02-28** are contract completion dates the documents print, not
  projections.

### What was not exercised, and what was not consulted

- **The Bengali search path and the local Bengali font are shipped and unexercised**,
  because the extracted text of all 1,805 documents contains zero Bengali codepoints.
  Nothing is wrong with either; this archive's e-GP output is entirely Latin script.
- **No external source was consulted for anything on the site** — no search engine, no
  news archive, no company registry, no external statistic. That is the rule the
  investigation was built under, and it has a cost worth naming: an error in the
  government's own record propagates into this site unchallenged, and nothing here can
  detect it. Where a figure looks wrong, the site flags it and leaves it standing rather
  than correcting it against outside knowledge.
- **The clearest instance of that cost is a company name.** Page 1 of
  `Contract_Awards_PDFs/Tender_836329.pdf` prints `Name of Supplier/Contractor/Consultant:
  Verbal`, and so the dataset carries a firm called *Verbal* — in `bids.csv`, in
  `companies.csv`, and on the site. The extraction is faithful: two independent extractors
  read the same word off that page. What the word means is not recoverable from these
  documents. It may be a truncation, a data-entry artefact in the portal, or a genuine
  trading name; nothing in the folder distinguishes those, and an editor should not read
  the site's firm list as free of that class of error. It was left as printed rather than
  guessed at, which is the same decision applied to the 20 unreadable sums and the 219
  unmerged name pairs.
- The run is a snapshot: the folder as it stood on **2026-09-01**. Rebuilding the pipeline
  on the same folder reproduces every figure, and `03_audit.py` re-derives the headline
  ones independently of the code that wrote them.
- **The one measured value that changes between runs is a build duration.** `analysis.json`
  carries `dataset_counts.seconds` — how long the table build itself took — and the story
  page prints it. A rebuild of the same folder reproduced all 18 tables, `master_dataset.csv`
  and `search/records.json` byte for byte; `analysis.json` differed in exactly three
  places, all of them clocks: its own `built` minute, the dataset's `generated` stamp, and
  that duration. Restoring those three values reproduced the previous file's SHA-256
  exactly. No investigative figure moved.


