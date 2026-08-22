# Red Flags in Bangladesh Development-Authority Procurement

### A cross-tender pattern analysis of the e-GP public record

*Working findings — editable draft. Compiled 2026-08-22 from `Procurement_Database.json` (1,158 tenders) and the precomputed aggregates in `article_data.json`.*

---

> **How to read this document.** Everything below is drawn from the *public* e-GP record. The entities and officials named here are named **only because the government's own published data names them** as the authorising officer, procuring entity, or awarded supplier on public contracts. Nothing here is an allegation of a crime. Concentration, speed, and repetition are **red flags that warrant scrutiny** — they have innocent explanations (large specialist works legitimately attract few qualified bidders; a fast signing can mean an efficient office) as often as troubling ones. The purpose of this analysis is to identify *where a reasonable auditor, journalist, or oversight body should look next*, not to reach a verdict. Read the **Limitations** section before quoting any single number.

---

## 1. The headline

Across **1,158 tenders** published by six development authorities and related bodies, **645 resulted in a recorded award**, together worth **৳3,723.7 crore** (≈ ৳37.24 billion). Those awards went to **308 distinct contractors**, authorised by **73 distinct officials**, across **11 organisational units**.

Four patterns in that record stand out as warranting scrutiny:

| # | Pattern | Headline figure |
|---|---------|-----------------|
| 1 | **Value concentration** | One firm holds **28.7%** of all award value; the top 10 hold **52.7%** (HHI ≈ 927). |
| 2 | **The 28-day cliff** | **130** contracts (20.2%) were signed on *exactly* the 28th day after award — the legal deadline — and **zero** on days 29–32. |
| 3 | **Vanishing competition** | In **53** tenders, three or more bidders collapsed to a **single responsive** bidder; in 15 of those, five or more did. |
| 4 | **Repeat pairings** | **98** contractor↔office pairs recur in ≥2 tenders; **40** recur in ≥3. One pairing appears **14** times. |

---

## 2. Methodology

**Source.** `Procurement_Database.json` — 1,158 tender records scraped from the public e-GP portal, one record per tender. Award figures use `Contract_Value_BDT`; the officer dimension uses the `Authorised_Officer` field; competition uses `Tenders_Received`, `Tenders_Sold`, and `Responsive_Tenders`; timing uses `Notification_of_Award_Date` and `Contract_Signing_Date`.

**Scope.** All monetary and concentration figures are computed on the **645 awarded** records (those with a named supplier and a contract value). Competition rates are computed on the **591 awarded records that carry bid-count data**. Timing is computed on all 645.

**Entity de-duplication.** Contractor and office names are normalised before matching (upper-cased; `&`→`AND`; punctuation stripped; corporate suffixes `LTD/LIMITED/PVT/PRIVATE` and the `M/S` prefix removed) so that "Spectra Engineers Ltd." and "Spectra Engineers Ltd" count as one firm. This is imperfect — see Limitations.

**Concentration** is measured with the Herfindahl–Hirschman Index (HHI, sum of squared value-shares ×10,000) and top-1 / top-10 value shares. **Capture** at the office or officer level is flagged when a single contractor holds >50% (and, for the strongest flags below, ≥80%) of that unit's award value across ≥2 tenders.

**Reproducibility.** Every figure in this document is regenerable from the two JSON files in this repository with the analysis scripts described in §9. No figure depends on a private or unpublished source.

---

## 3. Finding 1 — Value is extraordinarily concentrated

Of ৳3,723.7 crore in total awards, **৳1,068 crore — 28.7% — went to a single contractor, Spectra Engineers Ltd.**, across just four tenders. The market-concentration index (HHI ≈ 927) sits at the edge of what competition regulators consider "moderately concentrated," and the top ten contractors together hold **52.7%** of all value.

Spectra's four awards:

| Tender | Value | Bidders received | Responsive | Authorising entity |
|--------|------:|:---:|:---:|--------------------|
| #775105 | **৳881.2 cr** | 2 | 2 | Project Director **(Rajib Das)**, CDA |
| #538256 | ৳96.0 cr | 4 | **1** | Project Director (CCORRP), CDA |
| #781266 | ৳79.2 cr | 3 | **1** | Project Director (Loop Road), CDA |
| #735107 | ৳11.5 cr | 1 | 1 | Project Director (KK Newaz), CDA |

Two features warrant scrutiny. First, the ৳881 crore contract — by itself nearly a quarter of *all* award value in the dataset — drew only **two** bidders. Second, two of the four awards (#538256, #781266) began with three-to-four bidders that **collapsed to a single responsive bidder** at evaluation. All four sit within one authority (Chittagong Development Authority).

---

## 4. Finding 2 — The "28-day cliff"

Bangladesh's Public Procurement Rules (e-PG3A, ITT clause 67.2) set a maximum of **28 days** between the Notification of Award and contract signing. The distribution of actual signing delays does not look like a natural process bounded by a deadline — it looks like one **engineered to the deadline**:

```
Days from award to signing (n = 645), window around the legal limit:
 day 24 │ ██████████████████████                      22
 day 25 │ ██████████████████████████████████          34
 day 26 │ █████████████████                           17
 day 27 │ ███████████████████████████████████████████ 47
 day 28 │ ████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████ 130
 day 29 │                                              0
 day 30 │                                              0
 day 31 │                                              0
 day 32 │                                              0
```

**130 contracts — one in five of all awards — were signed on precisely day 28**, the last legal day, after which the count falls to **zero and stays there**. The median delay overall is 22 days. A hard spike at a regulatory ceiling followed by a cliff is a classic signature of a process being managed *to* the rule rather than *by* the work — the pattern an auditor would want to explain. (Fifty-two contracts exceed 28 days, which is a separate compliance question; forty-four exceed 60.)

---

## 5. Finding 3 — Competition that vanishes at evaluation

How "competitive" the awards were depends on definition, and the range itself is informative:

- **201 awards (34.0%)** recorded exactly **one responsive bidder** — the broadest measure (`Responsive_Tenders == 1`).
- **149 awards (25.3%)** had a single responsive bidder **despite competition existing** (more than one tender received or sold) — i.e., rivals showed up and were then eliminated.
- **53 awards** began with **three or more** bidders and ended with **one** responsive. In **15**, five or more bidders collapsed to one.

The first number counts genuinely uncontested lots (which large specialist works can legitimately be). The last two are the ones that warrant scrutiny: they are cases where a field of competitors was present and then disqualified down to a single survivor. Mass disqualification is lawful and sometimes correct — but 53 instances of it is a population an oversight body would want to sample and review.

*(Note on figures: this document uses 149/25.3% as its primary "single-responsive" rate because it excludes genuinely single-bidder lots; the 201/34.0% figure carried in `article_data.json` uses the broader definition. Both are stated so readers can see the definitional sensitivity.)*

---

## 6. Finding 4 — The same names, over and over

Repeat business is normal in construction. But some contractor↔office pairings recur at a frequency that warrants scrutiny. **98 pairings appear in two or more tenders; 40 appear in three or more.** The most frequent:

| Contractor | Authorising office | Times |
|------------|--------------------|:-----:|
| Nahar Construction | Cox's Bazar Development Authority | **14** |
| M/S. Sany Construction | Office of the Chief Engineer | **14** |
| Aliza Enterprise | Office of the Superintending Engineer | **11** |
| M/S Molla & Brothers | Cox's Bazar Development Authority | **10** |

Viewed from the **official's** side rather than the office's, the same texture appears — 93 officer↔contractor pairs recur ≥2×, 36 recur ≥3×:

| Contractor | Authorising officer (authority) | Times |
|------------|--------------------------------|:-----:|
| M/S. Sany Construction | A S M Raihanul Ferdous (RAJUK) | **13** |
| M/S. Gulzar Trading | A. H. M. Mesbah Uddin (CDA) | **10** |
| M/S Molla & Brothers | Abu Nayeem Md. Talat (Cox's Bazar DA) | **10** |

A recurring pair is not evidence of wrongdoing — a firm may simply be the competent local specialist. It is evidence of *where to look*: these are the relationships whose tender files, disqualification records, and pricing an auditor could most usefully pull.

---

## 7. Finding 5 — Officers whose awards flow to one firm

The sharpest red flags combine the officer and concentration dimensions: officials who, across multiple tenders, directed the overwhelming majority of their authorised value to a **single** contractor.

| Authorising officer (authority) | Tenders | Value | Share to one firm | That firm |
|---------------------------------|:-------:|------:|:-----------------:|-----------|
| Md. Arman Hossain (KDA) | 2 | ৳143.8 cr | **100%** | Ataur Rahman Khan Ltd |
| **Rajib Das (CDA)** | 3 | ৳891.3 cr | **99%** | Spectra Engineers Ltd. |
| Asad Bin Anwar (CDA) | 2 | ৳84.3 cr | **94%** | Spectra Engineers Ltd. |
| Kazi Hasan Bin Shams (CDA) | 2 | ৳112.2 cr | **86%** | Spectra Engineers Ltd. |

One detail warrants particular scrutiny: **Spectra Engineers Ltd. received near-exclusive awards from three different CDA officers** — Rajib Das (99%), Asad Bin Anwar (94%), and Kazi Hasan Bin Shams (86%). A single firm dominating one officer's book can be a specialism; the same firm dominating *three* officers' books within one authority is a firm-and-authority pattern worth explaining. Note too that on the ৳881 crore contract, the procuring-entity field itself reads "Project Director(Rajib Das)" — the authorising officer's name embedded in the entity label.

At the other end of the volume scale, some officers run genuinely broad books — Mohammad Muzaffar Uddin (RAJUK) authorised 43 tenders across 33 suppliers — which is the *absence* of this red flag and a useful control.

---

## 8. Limitations — read before quoting

1. **Association is not causation, and a red flag is not a finding of wrongdoing.** Every pattern here has lawful explanations. This document identifies where scrutiny is warranted; it does not conclude that scrutiny would find misconduct.
2. **Name de-duplication is imperfect.** Contractor and officer names are free-text. Normalisation merges obvious variants but cannot catch every misspelling, transliteration, or genuinely distinct firm sharing a name. Counts of "distinct" entities are therefore approximate.
3. **The estimated-cost field is empty** throughout the dataset, so this analysis **cannot** test whether winning prices sat suspiciously close to the engineer's estimate — the single most direct test of price rigging. That check requires the package-level APP estimates (see §9) and is deferred.
4. **Single-responsive rate is definition-sensitive** (34.0% vs 25.3% vs the 53 mass-disqualification cases). Always state which definition a quoted figure uses.
5. **Coverage.** The dataset is what was scrapeable from the public portal at collection time; it is not guaranteed to be every tender these authorities ran, and status fields reflect the portal's state on that date.
6. **Timing precision.** Award-to-signing delays are computed from the two published dates; a data-entry convention that back-dates or standardises signing dates would itself produce a day-28 spike, which is one (more benign) explanation the cliff analysis cannot rule out.

---

## 9. What would resolve the open questions

For an oversight body or newsroom taking this further, the highest-value next steps are:

- **Pull the APP package estimates** for the concentrated contracts and compare winning bid to engineer's estimate (the price-rigging test this dataset can't run). The scraper `fetch_app_estimates.py` in this repo is built for exactly this once portal access is available.
- **Request the evaluation reports** for the 53 mass-disqualification tenders — the documented reasons each rival was ruled non-responsive.
- **Review the file trail** on the four highest-frequency repeat pairings (§6) and the four single-firm officers (§7).
- **Ask the CDA** to explain Spectra's 28.7% share and its near-exclusive awards from three separate officers.

---

## 10. Reproducibility

All figures regenerate from two files committed to this repository:

- **`Procurement_Database.json`** — 1,158 raw tender records (the source of truth).
- **`article_data.json`** — precomputed verified aggregates (headline, funnel, concentration, cliff, repeat_pairs, pe_capture, elimination, etc.).

The interactive tool **`tool.html`** ("Smart Investigator") reproduces the per-tender forensic scoring and the cross-tender **প্যাটার্ন বিশ্লেষণ** (pattern analysis) view — repeat pairs, contractor/entity leaderboards, and captured-entity detection — directly in the browser. The narrative article lives in **`investigation.html`**.

*Figures verified 2026-08-22: 645 awards · ৳3,723.7 cr · 308 contractors · 73 officers · HHI 927 · top-1 28.7% · top-10 52.7% · 130 signings at day 28 · 149/201 single-responsive · 53 mass-disqualification · 98/40 repeat pairs.*
