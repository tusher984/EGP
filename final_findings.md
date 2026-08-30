# Red Flags in Bangladesh Development-Authority Procurement

### A cross-tender pattern analysis of the e-GP public record, checked against the source documents

*Final report, 2026-08-30. Compiled from the 1,158-row scraped register
(`Procurement_Database.json`) and from all **1,800 government PDFs** committed to this
repository, which were read in full by `verify_pdfs.py` and used to correct the
register wherever the two disagree.*

---

> **How to read this document.** Everything below is drawn from the *public* e-GP
> record. The entities and officials named here are named **only because the
> government's own published data names them** as the authorising officer, procuring
> entity, or awarded supplier on public contracts. Nothing here is an allegation of a
> crime. Concentration, speed, and repetition are **red flags that warrant scrutiny** —
> they have innocent explanations (large specialist works legitimately attract few
> qualified bidders; a fast signing can mean an efficient office) as often as troubling
> ones. The purpose of this analysis is to identify *where a reasonable auditor,
> journalist, or oversight body should look next*, not to reach a verdict. Read the
> **Limitations** section before quoting any single number.

---

## 1. The headline

The scrape holds **1,158 rows**, of which **1,151 carry a tender** (§2 explains the
seven that do not). Across those 1,151 tenders, published by six development
authorities and related bodies, **645 resulted in a recorded award**, together worth
**৳3,723.7 crore** (≈ ৳37.24 billion). Those awards name **310 contractors as filed —
308 once spelling variants are merged** — authorised by **73 officials** across **11
organisational units**.

Five patterns in that record stand out as warranting scrutiny:

| # | Pattern | Headline figure |
|---|---------|-----------------|
| 1 | **Value concentration** | One firm holds **28.7%** of all award value; the top 10 hold **52.7%** (HHI ≈ 927). |
| 2 | **The 28-day cliff** | **130** contracts (20.2%) were signed on *exactly* the 28th day after award — the legal deadline — and **zero** on days 29–37. **124 of the 130 are RAJUK's.** |
| 3 | **Vanishing competition** | In **53** tenders, three or more bidders collapsed to a **single responsive** bidder; in 15 of those, five or more did. |
| 4 | **Repeat pairings** | **99** contractor↔office pairs recur in ≥2 tenders; **40** recur in ≥3. One pairing appears **15** times. |
| 5 | **A register that misreports itself** | One column holds an unrelated number instead of the tender fee; another silently truncates office names and thereby merges offices that are not the same office. Both were found only by reading the PDFs. |

Pattern 5 is a finding in its own right, and it is first in the order of work: two of
the four numbers above change once the register is corrected against the notices.

---

## 2. What reading all 1,800 PDFs found in the register

Every figure in this document was re-derived from the government's own documents,
not only from the scrape. Three of the register's columns did not survive that check.

**2.1 `Document_Price_BDT` is not a price.** It holds the **day of the month of
`Security_Valid_Up_To`**. Of the 1,128 tenders that carry both a value in that column
and a printed fee on the notice, **1,101 equal that day-of-month**, 26 have no security
date to compare against, and **exactly 1 matches the fee the notice prints**. The column
is discarded: every document-fee figure in this report is read off the notice PDFs.
What the notices actually say is in §9.

**2.2 Seven of the 1,158 rows carry no tender at all.** Five are pages where the portal
answered *"This tender is not exists or You are un-authorized to access information for
this tender"*; one is a blank print (two characters of text); one is an empty e-PG3A form
template. So the honest tender count is **1,151**, with **no duplicate tender ids**. Of the
1,155 archived notice PDFs, **1,149 hold a record** and 6 hold none.

**2.3 The register stores long names cut to about 40 characters, and the cut merges real
offices.** Per column, rows whose stored value differs from the PDF:

| Column | Rows truncated | Truncated values covering more than one real name |
|---|---:|---|
| `Procuring_Entity_Name` | **271** | **2** |
| `Supplier_Name` | 49 | 0 |
| `Organization_Agency` | 7 | 0 |
| `Authorised_Officer_Designation` | 3 | 0 |
| `Authorised_Officer` | 0 | 0 |

The two damaging ones: `Office of the Superintending Engineer` is stored for **both**
the Electrical circle (58 awards) and the Mechanical circle (18) — a fictional 76-award
office; and `Office of the Executive Engineer, LGED,` is stored for **four different
districts** (Barisal, Chittagong, Pabna, Satkhira). A third office is stored both ways,
splitting one 53-award office in two. Anything grouped by office is therefore grouped on
the **notices'** full names by `repair_names.py`. That correction moves four published
figures: the largest office↔contractor pairing is **15**, not 14; pairs recurring twice
or more is **99**, not 98; the captured-office list holds **15** offices, not 14; and the
largest cell of the office × contractor matrix is 15.

**2.4 Resolved, and not a defect.** 54 of the 645 awards carry no bid counts. They are
not missing data: those 54 are printed on the newer *"Name of the Economic Operator"*
award template, which prints no bid counts and no contract number at all, while the
older *"Name of Supplier/Contractor/Consultant"* template — **591** awards — prints both.
591 is therefore the whole of what the record can support as a competition denominator,
not a subset chosen after the fact.

---

## 3. Methodology

**Sources.** Two, and the report says which figure came from which. (a)
`Procurement_Database.json` — 1,158 rows scraped from the public portal, one per tender.
Award value uses `Contract_Value_BDT`; the officer dimension uses `Authorised_Officer`;
competition uses `Tenders_Received`, `Tenders_Sold` and `Responsive_Tenders`; timing uses
`Notification_of_Award_Date` and `Contract_Signing_Date`. (b) `pdf_derived.json` — the
text of all 1,800 PDFs, extracted with the Python standard library only (no third-party
dependency anywhere in this pipeline). Document fees and every office-level grouping come
from (b), for the reasons in §2.

**Scope.** Monetary and concentration figures are computed on the **645 awarded** records.
Competition rates are computed on the **591** awarded records whose template carries bid
counts. Timing is computed on all 645.

**Entity de-duplication.** Contractor and office names are normalised before matching
(upper-cased; `&`→`AND`; punctuation stripped; corporate suffixes `LTD/LIMITED/PVT/PRIVATE`
and a leading `M/S` removed) so that "Spectra Engineers Ltd." and "Spectra Engineers Ltd"
count as one firm: 310 names as filed → **308** firms. Officer names normalise 79 spellings
→ **73** officials. It is imperfect — see Limitations. Joint ventures keep the portal's full
string as their grouping key, because the appended `JVCA Partners [Business Share]` tail is
provenance rather than a name; stripping it before grouping would merge three distinct JVs
into other entries.

**Concentration** is the Herfindahl–Hirschman Index (sum of squared value-shares ×10,000)
plus top-1 / top-4 / top-10 value shares. It is computed on names **as filed**, the
conservative choice: merging variants would raise it. **Capture** at office or officer level
is flagged when one contractor holds >50% (and, for the strongest flags in §8, ≥80%) of that
unit's award value across ≥2 tenders.

**Reproducibility.** Every figure regenerates from the files in this repository, and two
scripts refuse to let it drift: `verify_figures.py` recomputes **82** published figures from
the raw records and exits non-zero on any disagreement, and `verify_pdfs.py` re-derives
**38** of them from the PDF text alone. Both are green as of this report: 82 checks, 0
disagreements; 0 of 38 differ.

---

## 4. Finding 1 — Value is extraordinarily concentrated

Of ৳3,723.7 crore in total awards, **৳1,068 crore — 28.7% — went to a single contractor,
Spectra Engineers Ltd.**, across just four tenders. The concentration index (HHI ≈ 927)
sits at the edge of what competition regulators call "moderately concentrated," the top
four contractors hold **38.5%** of all value, and the top ten hold **52.7%**.

Spectra's four awards:

| Tender | Value | Bidders received | Responsive | Authorising entity |
|--------|------:|:---:|:---:|--------------------|
| #775105 | **৳881.2 cr** | 2 | 2 | Project Director **(Rajib Das)**, CDA |
| #538256 | ৳96.0 cr | 4 | **1** | Project Director (CCORRP), CDA |
| #781266 | ৳79.2 cr | 3 | **1** | Project Director (Loop Road), CDA |
| #735107 | ৳11.5 cr | 1 | 1 | Project Director (KK Newaz), CDA |

Two features warrant scrutiny. First, the ৳881 crore contract — by itself nearly a quarter
of *all* award value in the dataset — drew only **two** bidders. Second, two of the four
(#538256, #781266) began with three-to-four bidders that **collapsed to a single responsive
bidder** at evaluation. All four sit within one authority, the Chittagong Development
Authority.

---

## 5. Finding 2 — The "28-day cliff", and whose cliff it is

Bangladesh's Public Procurement Rules (e-PG3A, ITT clause 67.2) set a maximum of **28 days**
between the Notification of Award and contract signing. The distribution of actual signing
delays does not look like a natural process bounded by a deadline — it looks like one
**engineered to the deadline**:

```
Days from award to signing (n = 645), window around the legal limit:
 day 24 │ ██████████████████                            22
 day 25 │ ████████████████████████████                  34
 day 26 │ ██████████████                                17
 day 27 │ ███████████████████████████████████████       47
 day 28 │ ████████████████████████████████████████████████████████████████████████████████████████████████████████ 130
 day 29 │                                                0
   …    │                                                0   (days 29–37 inclusive)
 day 37 │                                                0
 day 38 │ █                                              1
```

**130 contracts — one in five of all awards — were signed on precisely day 28**, the last
legal day, after which the count falls to **zero and stays there for nine days**. The median
delay overall is 22 days. A hard spike at a regulatory ceiling followed by a void is the
signature of a process being managed *to* the rule rather than *by* the work.

The refinement that matters for anyone acting on this: **the cliff is almost entirely one
authority's.** Of the 130 day-28 signings, **124 are RAJUK's — 34.1% of RAJUK's 364 awards.**
Every other body is in the noise: RDA 1 of 29 (3.4%), KDA 1 of 37 (2.7%), CDA 2 of 96 (2.1%),
Cox's Bazar DA 2 of 103 (1.9%). This is an office-practice pattern, not a sector-wide one,
and it localises the question to a single authority's contracts registry.

Separately, **52 contracts exceeded the 28-day limit** — a compliance question rather than a
cliff question. **44 of the 52 ran more than 60 days past** the deadline, the longest at
**292 days**.

And there the record holds one more oddity worth a document request. The **ten longest signing
delays in the entire dataset all belong to the same contractor at the same authority** — M/S.
Sany Construction at RAJUK — and **nine of those ten are exactly 150 days**, to the day, across
tenders #236241, #236242, #248616–#248619, #248621–#248623. An identical delay repeated nine
times is not a delay; it is one signing event booked against nine tenders, or one date entered
nine times. Which of those it is can be settled by the contracts register, and both answers are
worth knowing. (These are small works — ৳0.15 to ৳0.33 crore each.)

---

## 6. Finding 3 — Competition that vanishes at evaluation

How "competitive" the awards were depends on definition, and the range itself is informative:

- **201 awards (34.0%)** recorded exactly **one responsive bidder** — the broadest measure
  (`Responsive_Tenders == 1`).
- **149 awards (25.2% of the 591)** had a single responsive bidder **despite competition
  existing** (more than one tender received or sold) — i.e. rivals showed up and were then
  eliminated.
- **53 awards** began with **three or more** bidders and ended with **one** responsive. In
  **15**, five or more bidders collapsed to one.

The first number counts genuinely uncontested lots, which large specialist works can
legitimately be. The last two are the ones that warrant scrutiny: a field of competitors was
present and was then disqualified down to a single survivor. Mass disqualification is lawful
and sometimes correct — but 53 instances of it is a population an oversight body would want to
sample and review, and the evaluation reports that would settle each case are not published.

*(On quoting these: state which definition you are using. This report treats 149 / 25.2% as
the primary single-responsive rate because it excludes genuinely single-bidder lots; the
published site leads with the broader 201 / 34.0%. Both are stated so the definitional
sensitivity is visible rather than hidden.)*

---

## 7. Finding 4 — The same names, over and over

Repeat business is normal in construction. But some contractor↔office pairings recur at a
frequency that warrants scrutiny. **99 pairings appear in two or more tenders; 40 appear in
three or more.** The most frequent, grouped on the offices' full names as the notices print
them rather than as the register truncates them (§2.3):

| Contractor | Authorising office | Times | Value |
|------------|--------------------|:-----:|------:|
| M/S. Sany Construction | Office of the Chief Engineer (Project & Design) | **15** | ৳6.26 cr |
| Nahar Construction | Cox's Bazar Development Authority | **14** | ৳1.08 cr |
| M/S Molla & Brothers | Cox's Bazar Development Authority | **10** | ৳0.49 cr |
| M/S Sunny Construction | Office of the Superintending Engineer (Electrical) | **8** | ৳3.58 cr |
| Sherpa Power Engineering Ltd. | Office of the Chief Engineer (Project & Design) | **7** | ৳3.75 cr |
| M/S TANIN ENTERPRISE | Office of the Superintending Engineer (Electrical) | **7** | ৳2.09 cr |
| Aliza Enterprise | Office of the Superintending Engineer (Electrical) | **7** | ৳1.96 cr |

Note what the correction did to this table. On the register's truncated names, Aliza
Enterprise appeared 11 times at a single "Office of the Superintending Engineer" — an office
that does not exist, being the Electrical and Mechanical circles stored under one cut string.
On the notices it is 7 times at the Electrical circle. The correction cuts that pairing down
and raises another to 15. **Every published figure grouped by office was wrong in the same
direction until the PDFs were read**, which is the practical reason §2 leads this report.

Viewed from the **official's** side rather than the office's, the same texture appears — and
these figures are unaffected by the truncation, because `Authorised_Officer` is the one name
column the register stores whole. **93 officer↔contractor pairs recur ≥2×, 36 recur ≥3×:**

| Contractor | Authorising officer (authority) | Times | Value |
|------------|--------------------------------|:-----:|------:|
| M/S. Sany Construction | A S M Raihanul Ferdous (RAJUK) | **13** | ৳2.99 cr |
| M/S. Gulzar Trading | A. H. M. Mesbah Uddin (CDA) | **10** | ৳2.21 cr |
| M/S Molla & Brothers | Abu Nayeem Md. Talat (Cox's Bazar DA) | **10** | ৳0.49 cr |
| Nahar Construction | Abu Nayeem Md. Talat (Cox's Bazar DA) | **8** | ৳0.74 cr |
| Aliza Enterprise | Mohammad Nazmus Sakib Jamali (RAJUK) | **7** | ৳1.96 cr |
| Sherpa Power Engineering Ltd. | Md. Anwar Hossain (RAJUK) | **7** | ৳3.75 cr |

A recurring pair is not evidence of wrongdoing — a firm may simply be the competent local
specialist, and most of these are small-value works. It is evidence of *where to look*: these
are the relationships whose tender files, disqualification records and unit pricing an auditor
could most usefully pull, because a pattern that repeats is a pattern that can be tested.

---

## 8. Finding 5 — Officers whose awards flow to one firm

The sharpest red flags combine the officer and concentration dimensions: officials who, across
multiple tenders, directed the overwhelming majority of their authorised value to a **single**
contractor.

| Authorising officer (authority) | Tenders | Value | Share to one firm | That firm |
|---------------------------------|:-------:|------:|:-----------------:|-----------|
| Md. Arman Hossain (KDA) | 2 | ৳143.8 cr | **100%** | Ataur Rahman Khan Ltd |
| **Rajib Das (CDA)** | 3 | ৳891.3 cr | **99%** | Spectra Engineers Ltd. |
| Asad Bin Anwar (CDA) | 2 | ৳84.3 cr | **94%** | Spectra Engineers Ltd. |
| Md. Julfiker Ali Khan (RAJUK) | 3 | ৳0.6 cr | **92%** | M/S Sunny Construction |
| Md. Anwar Hussain (RDA) | 6 | ৳33.6 cr | **87%** | The Engineers & Architects |
| A. A. M. Habibur Rahman (CDA) | 4 | ৳57.5 cr | **86%** | The Engineers & Architects |
| Kazi Hasan Bin Shams (CDA) | 2 | ৳112.2 cr | **86%** | Spectra Engineers Ltd. |

One detail warrants particular scrutiny: **Spectra Engineers Ltd. received near-exclusive
awards from three different CDA officers** — Rajib Das (99%), Asad Bin Anwar (94%) and Kazi
Hasan Bin Shams (86%). A single firm dominating one officer's book can be a specialism; the
same firm dominating *three* officers' books inside one authority is a firm-and-authority
pattern that wants explaining. Note too that on the ৳881 crore contract the procuring-entity
field itself reads "Project Director(Rajib Das)" — the authorising officer's name embedded in
the entity label.

The caveat these rows carry on their face: **a small denominator inflates a share.** Two
tenders both going to one firm is 100% and means very little on its own; the row that carries
weight is the one where the share is high *and* the value is large. Rajib Das's ৳891.3 crore
at 99% is the only row where both are true.

At the other end of the volume scale, some officers run genuinely broad books — Mohammad
Muzaffar Uddin (RAJUK) authorised 43 tenders across 33 suppliers, ৳189.1 crore — which is the
*absence* of this red flag, and a useful control on the method: the test does not simply flag
whoever signs the most.

---

## 9. Finding 6 — What the document fee is, and what it does not explain

An unusually high fee for tender documents is a recognised way to thin a bidder field before
a single bid is opened, so it had to be tested against Finding 3. Testing it first required
reconstructing the column from the notices, since the register's version of it is not a price
at all (§2.1).

What the **1,128** notices that print a fee actually say: median **৳1,500**, mean ৳1,916.8,
range **৳100 to ৳10,000**, only **11 distinct amounts** in the entire record, and the single
most common value — **৳1,000 — on 518 tenders**. Not one tender is free. The distribution:
551 at or below ৳1,000, 316 between ৳1,000 and ৳2,000, 257 between ৳2,000 and ৳5,000, 4
between ৳5,000 and ৳10,000, none above.

**As a population, this is a schedule, not a barrier** — eleven round values reused across
1,128 tenders is the signature of a fee table being applied, and it cannot explain a collapse
from four bidders to one. That is a negative result and it is reported as one.

It is not a clean bill of health for every tender in it. The screening tool in this repository
raises a fee flag at **৳4,000 and above**, the point at which a fee stops plausibly reflecting
the cost of producing documents; **222 of the 1,128 — about one in five — sit at or above it**
and are worth an auditor's eye one at a time. What they are not is the explanation for
Finding 3.

---

## 10. Limitations — read before quoting

1. **Association is not causation, and a red flag is not a finding of wrongdoing.** Every
   pattern here has lawful explanations. This document identifies where scrutiny is warranted;
   it does not conclude that scrutiny would find misconduct.
2. **The register itself is unreliable in places** — a finding as much as a limitation. One
   column stores an unrelated number instead of the tender fee; another silently truncates
   office and contractor names and thereby merges offices that are not the same office. Both
   were caught only by reading the 1,800 PDFs, so **any figure taken from this portal without
   that check should be treated as unverified**, including figures published elsewhere from the
   same source.
3. **Name de-duplication is imperfect.** Contractor and officer names are free text.
   Normalisation merges obvious variants but cannot catch every misspelling, transliteration, or
   genuinely distinct firm sharing a name. Counts of "distinct" entities are approximate, and
   the report gives both the as-filed and merged figures where they differ (310 / 308).
4. **The estimated-cost field is empty** throughout the dataset, so this analysis **cannot**
   test whether winning prices sat suspiciously close to the engineer's estimate — the single
   most direct test of price rigging. That check needs the package-level APP estimates (§11) and
   is deferred, not answered.
5. **Single-responsive rate is definition-sensitive** (34.0% vs 25.2% vs the 53
   mass-disqualification cases). Always state which definition a quoted figure uses.
6. **Bid counts exist for 591 of 645 awards**, because the newer award template prints none
   (§2.4). Competition rates are rates over 591, not over 645.
7. **Coverage.** The dataset is what was scrapeable from the public portal at collection time.
   It is not guaranteed to be every tender these authorities ran, and status fields reflect the
   portal's state on that date. Six notice PDFs the portal refused to serve are archived as the
   refusals they are, not silently dropped.
8. **Timing precision.** Award-to-signing delays come from the two published dates. A
   data-entry convention that back-dates or standardises signing dates would itself produce a
   day-28 spike — the more benign explanation the cliff analysis cannot rule out, and the reason
   §5 reports *which* authority produces the spike rather than treating it as systemic.
9. **Nothing here reaches beneficial ownership.** Where two firms share owners, this data
   shows two firms. Concentration measured on names is therefore a floor, not a ceiling.

---

## 11. What would resolve the open questions

For an oversight body or newsroom taking this further, in descending order of value:

- **Pull the APP package estimates** for the concentrated contracts and compare winning bid to
  engineer's estimate — the price-rigging test this dataset cannot run. `fetch_app_estimates.py`
  in this repository is built for exactly that once portal access is available.
- **Request the evaluation reports** for the 53 mass-disqualification tenders: the documented
  reason each rival was ruled non-responsive. This is the single highest-value document request
  in the list, because it is the one that would convert a red flag into an answer either way.
- **Ask RAJUK** why 124 of its 364 contracts were signed on the last legal day and none in the
  nine days after it — a registry practice question with a possibly mundane answer.
- **Ask the CDA** to explain Spectra Engineers Ltd.'s 28.7% share of all award value, and its
  near-exclusive awards from three separate officers.
- **Review the file trail** on the highest-frequency repeat pairings (§7) and the single-firm
  officers (§8), starting where high share and high value coincide.
- **Ask the portal operator (CPTU) to fix the two broken columns** (§2). A fee column that
  actually holds a date, and name fields cut at 40 characters, damage every downstream user of
  this data, not just this analysis.

---

## 12. Reproducibility and verification

Everything regenerates from files committed to this repository, with no third-party dependency:

- **`Procurement_Database.json`** — the 1,158 scraped rows, as published.
- **`Tender Notice_PDFs/`** (1,155) and **`Contract_Awards_PDFs/`** (645) — the 1,800 original
  government documents. Every figure on the published site links back to one of them.
- **`pdf_derived.json`** — what those PDFs say: 645 award rows, 1,128 document prices, the
  truncation audit, the coverage counts. Written by `verify_pdfs.py`.
- **`article_data.json`** — the precomputed aggregates the pages render, repaired from the PDFs
  by `repair_names.py`.

```bash
python3 verify_pdfs.py        # read the 1,800 PDFs -> pdf_derived.json
python3 repair_names.py       # patch article_data.json from the PDFs
python3 verify_figures.py     # 82 checks; non-zero exit on any drift
```

`verify_figures.py` **asserts both register defects as facts** — that the fee column equals the
day-of-month, that 271 office rows are truncated — so a later change that quietly reverts to the
register fails this script instead of passing it. Both scripts are idempotent; everything is
keyed on tender id.

The interactive tool **`tool.html`** reproduces the per-tender forensic scoring and the
cross-tender **প্যাটার্ন বিশ্লেষণ** view — repeat pairs, contractor and entity leaderboards,
captured-entity detection — in the browser, with the source PDF beside each verdict. The full
narrative sits at **`index.html`**.

*Verified 2026-08-30 — `verify_figures.py`: 82 checks, 0 disagreements. `verify_pdfs.py`: 0 of
38 recomputed figures differ. 1,151 tenders · 645 awards · ৳3,723.7 cr · 310 contractors (308
merged) · 73 officers · HHI 927 · top-1 28.7% · top-10 52.7% · 130 signings at day 28 (124
RAJUK) · 149/201 single-responsive · 53 mass-disqualification · 99/40 repeat pairs · document
fee median ৳1,500 from 1,128 notices.*






