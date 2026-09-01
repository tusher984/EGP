# Data dictionary

Every column of every table in the dataset, with how often it is filled, what kind of value it holds and one real example taken out of the file.

This file is written by `investigation/scripts/build_documentation.py` from the CSVs themselves. Nothing in it is typed by hand except the last column of each table and the notes above it, so a rebuilt dataset cannot leave a count here quietly wrong.

Generated 2026-09-01 07:09 UTC.

**A blank cell is never a zero and never a guess.** Where a document does not print a field, the cell is empty and `master_dataset.csv` carries the reason in `blank_reasons`. Where a value was changed, the original survives — either in a `_original` column beside it or as a row in `normalization.csv`.

## Naming conventions

| Suffix | Meaning |
|---|---|
| `_original` | the value exactly as the document prints it, before any normalisation |
| `_id` | an internal key into another table in this dataset, not an identifier the government prints |
| `_taka` | a sum in Bangladeshi taka, parsed out of the printed figure |
| `_printed` | whether the document prints the thing at all, or the raw printed form of it |
| `source_file`, `evidence_file`, `first_document` | a PDF filename in this folder |
| `page`, `evidence_page`, `first_page` | a 1-based page number in that PDF |

## The tables

| Table | Rows | Columns |
|---|---:|---:|
| [`documents.csv`](#documents) | 1,805 | 31 |
| [`tenders.csv`](#tenders) | 1,150 | 64 |
| [`contracts.csv`](#contracts) | 645 | 46 |
| [`bids.csv`](#bids) | 645 | 20 |
| [`eligibility_criteria.csv`](#eligibility-criteria) | 3,239 | 19 |
| [`lots.csv`](#lots) | 1,152 | 11 |
| [`amendments.csv`](#amendments) | 160 | 10 |
| [`amendment_changes.csv`](#amendment-changes) | 735 | 10 |
| [`beneficial_owners.csv`](#beneficial-owners) | 77 | 11 |
| [`companies.csv`](#companies) | 309 | 23 |
| [`people.csv`](#people) | 137 | 17 |
| [`organizations.csv`](#organizations) | 110 | 19 |
| [`projects.csv`](#projects) | 108 | 16 |
| [`locations.csv`](#locations) | 607 | 7 |
| [`relationships.csv`](#relationships) | 9,694 | 8 |
| [`timeline.csv`](#timeline) | 13,411 | 7 |
| [`normalization.csv`](#normalization) | 245 | 6 |
| [`name_candidate_pairs.csv`](#name-candidate-pairs) | 219 | 12 |
| [`master_dataset.csv`](#master-dataset) | 1,151 | 112 |

---

## documents.csv

One row per PDF found in the folder, and what was read out of it. Every file is here, including the five the portal did not serve and the five reference rulebooks, because a document that was found and could not be used is still a document that was found.

1,805 rows, 31 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `document_id` | text | 1,805 (100%) | 1,805 | Tender_1000267 | this document's own key, taken from its filename |
| `file` | text | 1,805 (100%) | 1,805 | Contract_Awards_PDFs/Tender_1000267.pdf |  |
| `filename` | text | 1,805 (100%) | 1,805 | Tender_1000267.pdf |  |
| `folder` | text | 1,805 (100%) | 3 | Contract_Awards_PDFs |  |
| `kind` | text | 1,805 (100%) | 4 | contract_award |  |
| `tender_id` | number | 1,802 (99%) | 1,157 | 1000267 | the portal's own tender id, the key every table joins on |
| `pages` | number | 1,805 (100%) | 6 | 1 |  |
| `bytes` | number | 1,805 (100%) | 1,667 | 99289 |  |
| `sha256` | text | 1,805 (100%) | 1,805 | 2212e5d11bf9a7b22812aadea732e14652fde31158c9168282835d7cf81… |  |
| `characters` | number | 1,805 (100%) | 1,363 | 1904 |  |
| `words` | number | 1,805 (100%) | 592 | 239 |  |
| `ruled_tables` | number | 1,805 (100%) | 11 | 0 | how many ruled tables were found on the page, and read as tables rather than as an image |
| `images` | number | 1,805 (100%) | 6 | 0 |  |
| `script` | text | 1,805 (100%) | 1 | en | the writing system detected in the text layer. Latin on every row |
| `has_text_layer` | yes / no | 1,805 (100%) | 1 | yes |  |
| `needs_ocr` | yes / no | 1,805 (100%) | 1 | no | no on all 1,805 rows — every PDF in this folder carries a text layer |
| `second_extractor_chars` | number | 1,805 (100%) | 1,355 | 1945 | the character count a second, independent extractor read |
| `extractors_agree` | yes / no | 1,805 (100%) | 1 | yes | whether the two extractors agreed on the text length |
| `duplicate_text_of` | text | 4 (0%) | 1 | Tender Notice_PDFs/CDA_Tender_1100000.pdf | another document whose extracted text is identical. Both are kept; neither is deleted |
| `read_error` | text | 0 (0%) | 0 | — | why a document could not be read, where one could not |
| `fields_read` | number | 1,805 (100%) | 18 | 32 |  |
| `dates_read` | number | 1,805 (100%) | 5 | 5 |  |
| `eligibility_chars` | number | 1,805 (100%) | 385 | 0 |  |
| `lots_read` | number | 1,805 (100%) | 5 | 0 |  |
| `beneficial_owners_read` | number | 1,805 (100%) | 6 | 0 |  |
| `creator` | text | 1,804 (99%) | 7 | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit… |  |
| `producer` | text | 1,805 (100%) | 7 | Skia/PDF m150 |  |
| `pdf_created` | text | 1,805 (100%) | 1,465 | D:20260716092639+00'00' |  |
| `pdf_modified` | text | 1,804 (99%) | 1,464 | D:20260716092639+00'00' |  |
| `interleaved_layout_warnings` | number | 1,805 (100%) | 2 | 0 | how many fields on this page ran a value into the next field's label |
| `interleaved_layout_detail` | text | 1 (0%) | 1 | agency contains the label Procuring Entity Name \| inviting_… |  |

---

## tenders.csv

One row per tender notice: who invited it, what for, under which method, on which dates, and what it required of an entrant.

1,150 rows, 64 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `tender_id` | number | 1,150 (100%) | 1,150 | 1001782 | the portal's own tender id, the key every table joins on |
| `notice_file` | text | 1,150 (100%) | 1,150 | Tender Notice_PDFs/CDA_Tender_1001782.pdf |  |
| `notice_pages` | number | 1,150 (100%) | 3 | 2 |  |
| `ministry` | text | 1,150 (100%) | 6 | Ministry of Housing and Public Works |  |
| `ministry_id` | text | 1,150 (100%) | 6 | og0001 | a key into another table in this dataset |
| `agency` | text | 1,150 (100%) | 12 | Chittagong Development Authority |  |
| `agency_id` | text | 1,150 (100%) | 12 | og0009 | a key into another table in this dataset |
| `procuring_entity` | text | 1,149 (99%) | 78 | Project Director (CDA Square) |  |
| `procuring_entity_id` | text | 1,149 (99%) | 78 | og0010 | a key into another table in this dataset |
| `procuring_entity_code` | text | 256 (22%) | 12 | 2001 |  |
| `district` | text | 1,149 (99%) | 13 | Chattogram |  |
| `district_original` | text | 1,149 (99%) | 13 | Chattogram | the district exactly as printed, before normalisation. Nothing was merged: Chattogram and Chittagong stay apart |
| `city` | text | 1,133 (98%) | 18 | Chittagong |  |
| `thana` | text | 1,133 (98%) | 25 | Kotowali |  |
| `country` | text | 1,133 (98%) | 1 | Bangladesh |  |
| `phone` | text | 1,133 (98%) | 59 | 031-625562 |  |
| `procurement_nature` | text | 1,150 (100%) | 5 | Works |  |
| `procurement_type` | text | 1,150 (100%) | 1 | NCT |  |
| `event_type` | text | 1,150 (100%) | 7 | TENDER |  |
| `invitation_for` | text | 1,129 (98%) | 2 | Tender - Single Lot |  |
| `invitation_ref` | text | 1,129 (98%) | 1,019 | PD/CDASQR/lift/E-65/01 |  |
| `status` | text | 967 (84%) | 9 | Contract Awarded |  |
| `status_original` | text | 967 (84%) | 91 | Contract Awarded | the status exactly as the notice prints it, before any normalisation |
| `app_id` | number | 1,150 (100%) | 326 | 196376 | a key into another table in this dataset |
| `method` | text | 1,150 (100%) | 4 | Open Tendering Method (OTM) |  |
| `budget_type` | text | 1,150 (100%) | 4 | Own Fund |  |
| `source_of_funds` | text | 1,150 (100%) | 6 | Own fund |  |
| `development_partner` | text | 15 (1%) | 3 | Japan International Cooperation agency(JICA) |  |
| `project_code` | text | 1,149 (99%) | 103 | CDA Square-02 |  |
| `project` | text | 1,150 (100%) | 104 | Construction of CDA Square at Nasirabad, Chittagong |  |
| `project_id` | text | 1,150 (100%) | 103 | pr0005 | a key into another table in this dataset |
| `package_no` | text | 1,145 (99%) | 1,026 | PD/CDAsqr/lift/65/02 |  |
| `package_description` | text | 1,148 (99%) | 1,038 | Supply, Installation, Testing & Commissioning of Lift at CD… |  |
| `category` | text | 1,150 (100%) | 386 | Electrical domestic appliances; Domestic appliances; Instal… |  |
| `evaluation_type` | text | 1,150 (100%) | 3 | Lot wise |  |
| `document_price_taka` | number | 1,128 (98%) | 11 | 4000 | a sum in taka, parsed from the printed figure |
| `document_price_original` | number | 1,128 (98%) | 11 | 4000 |  |
| `payment_mode` | text | 1,145 (99%) | 2 | Payment through Bank |  |
| `published_date` | date | 1,129 (98%) | 492 | 2024-07-08 |  |
| `last_selling_date` | date | 1,129 (98%) | 517 | 2024-08-04 |  |
| `premeeting_start` | date | 1,145 (99%) | 491 | 2024-07-08 |  |
| `premeeting_end` | date | 1,145 (99%) | 516 | 2024-07-15 |  |
| `closing_date` | date | 1,129 (98%) | 515 | 2024-08-05 |  |
| `opening_date` | date | 1,129 (98%) | 515 | 2024-08-05 |  |
| `security_last_date` | date | 1,144 (99%) | 521 | 2024-08-05 |  |
| `security_valid_until` | date | 1,118 (97%) | 564 | 2024-12-01 |  |
| `tender_valid_until` | date | 1,118 (97%) | 564 | 2024-11-03 |  |
| `inviting_officer` | text | 1,149 (99%) | 93 | Kazi Kader Newaz |  |
| `inviting_officer_id` | text | 1,149 (99%) | 85 | pp0006 | a key into another table in this dataset |
| `inviting_officer_designation` | text | 1,146 (99%) | 29 | Assistant Engineer |  |
| `lots` | number | 1,150 (100%) | 5 | 1 |  |
| `eligibility_source_field` | text | 1,150 (100%) | 2 | eligibility | which field on the notice the clauses were read out of |
| `eligibility_page` | number | 1,150 (100%) | 1 | 1 |  |
| `eligibility_chars` | number | 1,150 (100%) | 384 | 1182 |  |
| `eligibility_clauses` | number | 1,150 (100%) | 11 | 3 |  |
| `eligibility_numbering` | text | 1,150 (100%) | 6 | (n) |  |
| `eligibility_published` | yes / no | 1,150 (100%) | 2 | no / yes | whether the notice prints any condition of entry at all |
| `eligibility_substantive` | yes / no | 1,150 (100%) | 2 | no / yes | whether it prints one that can be checked, rather than only a pointer to an unpublished document |
| `eligibility_categories` | text | 1,150 (100%) | 146 | cert_licence_class;cert_other;cert_tin;cert_trade_licence;c… |  |
| `amended` | yes / no | 1,150 (100%) | 2 | no / yes |  |
| `amendment_no` | number | 160 (13%) | 5 | 1 |  |
| `amendment_no_printed` | text | 160 (13%) | 47 | 1 |  |
| `amendment_changed_fields` | text | 111 (9%) | 30 | Eligibility of Consultant;TDS/PDS--C. Qualification Criteri… |  |
| `eligibility_amended` | yes / no | 1,150 (100%) | 2 | no / yes |  |

---

## contracts.csv

One row per contract-award notice: who won, for how much, under which contract number, on which dates.

645 rows, 46 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `tender_id` | number | 645 (100%) | 645 | 1000267 | the portal's own tender id, the key every table joins on |
| `award_file` | text | 645 (100%) | 645 | Contract_Awards_PDFs/Tender_1000267.pdf |  |
| `award_pages` | number | 645 (100%) | 2 | 1 |  |
| `award_template` | text | 645 (100%) | 2 | supplier | which of the portal's award-notice layouts this file uses |
| `award_ministry` | text | 645 (100%) | 4 | Ministry of Housing and Public Works |  |
| `award_ministry_id` | text | 645 (100%) | 4 | og0001 | a key into another table in this dataset |
| `award_agency` | text | 645 (100%) | 11 | Rajdhani Unnayan Kartripakkha (RAJUK) |  |
| `award_agency_id` | text | 645 (100%) | 11 | og0002 | a key into another table in this dataset |
| `award_procuring_entity` | text | 645 (100%) | 70 | Superintending Engineer (Civil Circle-3) |  |
| `award_procuring_entity_id` | text | 645 (100%) | 70 | og0003 | a key into another table in this dataset |
| `award_procuring_entity_code` | text | 110 (17%) | 10 | 2001 |  |
| `award_district` | text | 645 (100%) | 14 | Dhaka |  |
| `award_for` | text | 645 (100%) | 3 | Works |  |
| `award_method` | text | 645 (100%) | 2 | OTM |  |
| `award_source_of_funds` | text | 645 (100%) | 7 | Own Fund Own fund |  |
| `award_development_partner` | text | 645 (100%) | 4 | NA |  |
| `award_project` | text | 645 (100%) | 92 | Building Repair and Maintenance |  |
| `award_project_id` | text | 645 (100%) | 91 | pr0001 | a key into another table in this dataset |
| `award_invitation_ref` | text | 645 (100%) | 639 | RAJUK/SECC-3/20 |  |
| `award_package_no` | text | 645 (100%) | 645 | RAJUK/SECC-3/18 |  |
| `award_package_name` | text | 645 (100%) | 642 | Repair and maintenance work of Madani Avenue (100ft) Road D… |  |
| `contract_no` | text | 591 (91%) | 591 | RAJUK/SECC-3/20 |  |
| `contract_description` | text | 591 (91%) | 588 | Repair and maintenance work of Madani Avenue (100ft) Road D… |  |
| `work_location` | text | 645 (100%) | 252 | Madani Avenue Road |  |
| `winner` | text | 645 (100%) | 310 | M/S. Niaz Traders |  |
| `winner_id` | text | 645 (100%) | 309 | co0001 | a key into another table in this dataset |
| `winner_page` | number | 645 (100%) | 1 | 1 |  |
| `winner_location` | text | 645 (100%) | 297 | 154, Motijheel C/A. Masjid Market (2nd Floor), Room No.301-… |  |
| `winner_tenderer_id` | number | 54 (8%) | 32 | 1126694 | a key into another table in this dataset |
| `contract_value_taka` | number | 645 (100%) | 624 | 104498747.1 | a sum in taka, parsed from the printed figure |
| `contract_value_original` | number | 645 (100%) | 624 | 104498747.100 | the contract value as printed, before it was parsed |
| `advertised_date` | date | 645 (100%) | 351 | 2024-06-25 |  |
| `noa_date` | date | 645 (100%) | 375 | 2024-09-10 |  |
| `signed_date` | date | 645 (100%) | 410 | 2024-10-08 |  |
| `work_start_date` | date | 645 (100%) | 387 | 2024-08-14 |  |
| `work_completion_date` | date | 645 (100%) | 392 | 2025-02-10 |  |
| `tenders_sold` | number | 591 (91%) | 24 | 8 |  |
| `tenders_received` | number | 591 (91%) | 20 | 5 |  |
| `tenders_responsive` | number | 591 (91%) | 16 | 5 |  |
| `bid_counts_printed` | yes / no | 645 (100%) | 2 | no / yes |  |
| `performance_security_on_time` | yes / no | 591 (91%) | 1 | yes |  |
| `contract_signed_on_time` | yes / no | 591 (91%) | 2 | no / yes |  |
| `award_officer` | text | 645 (100%) | 79 | Saber Ahmed |  |
| `award_officer_id` | text | 645 (100%) | 73 | pp0001 | a key into another table in this dataset |
| `award_officer_designation` | text | 645 (100%) | 27 | Superintending Engineer |  |
| `beneficial_owners` | number | 645 (100%) | 6 | 0 |  |

---

## bids.csv

The stage counts an award notice prints — sold, received, responsive, awarded — one row per award. This table is where the archive's hardest limit lives: bidder_level_data_available is no on every row.

645 rows, 20 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `tender_id` | number | 645 (100%) | 645 | 1000267 | the portal's own tender id, the key every table joins on |
| `source_file` | text | 645 (100%) | 645 | Contract_Awards_PDFs/Tender_1000267.pdf | the PDF this row was read from |
| `award_template` | text | 645 (100%) | 2 | supplier | which of the portal's award-notice layouts this file uses |
| `counts_printed` | yes / no | 645 (100%) | 2 | no / yes | whether this award notice prints the stage counts at all. No on 54 of the 645 |
| `documents_sold` | number | 591 (91%) | 24 | 8 |  |
| `bids_received` | number | 591 (91%) | 20 | 5 |  |
| `bids_responsive` | number | 591 (91%) | 16 | 5 | the count the notice prints as responsive. No document in this archive names a responsive bidder or prints a bid price |
| `bids_awarded` | number | 645 (100%) | 1 | 1 |  |
| `bought_but_did_not_bid` | number | 591 (91%) | 8 | 3 | sold minus received — arithmetic on the notice's own two printed counts, not a count of anybody |
| `received_but_not_responsive` | number | 591 (91%) | 13 | 0 | received minus responsive. **No document gives a reason for a single one of them** |
| `responsive_but_not_awarded` | number | 591 (91%) | 16 | 4 | responsive minus awarded |
| `winner` | text | 645 (100%) | 310 | M/S. Niaz Traders |  |
| `winner_id` | text | 645 (100%) | 309 | co0001 | a key into another table in this dataset |
| `contract_value_taka` | number | 645 (100%) | 624 | 104498747.1 | a sum in taka, parsed from the printed figure |
| `single_bid_received` | yes / no | 591 (91%) | 2 | no / yes |  |
| `single_bid_responsive` | yes / no | 591 (91%) | 2 | no / yes |  |
| `all_received_were_responsive` | yes / no | 591 (91%) | 2 | no / yes |  |
| `bidder_level_data_available` | yes / no | 645 (100%) | 1 | no | no on every row. The note beside it says what is missing, in the document's terms |
| `bidder_level_note` | text | 645 (100%) | 1 | the archive prints stage counts and the winner only; no bid… | the same sentence on all 645 rows, kept per-row so a downloaded file carries the caveat with the number |
| `count_anomaly` | text | 1 (0%) | 1 | a winner is named although the responsive count is zero | why the printed counts contradict each other, where they do. Filled on one row |

---

## eligibility_criteria.csv

Every printed condition of entry, one row per clause, with the words as printed and the page they are on.

3,239 rows, 19 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `tender_id` | number | 3,239 (100%) | 1,150 | 1001782 | the portal's own tender id, the key every table joins on |
| `clause_no` | number | 3,239 (100%) | 11 | 1 | the clause's position within its notice, counted by this pipeline |
| `source_file` | text | 3,239 (100%) | 1,150 | Tender Notice_PDFs/CDA_Tender_1001782.pdf | the PDF this row was read from |
| `page` | number | 3,239 (100%) | 1 | 1 | the 1-based page of source_file the value is printed on |
| `source_field` | text | 3,239 (100%) | 2 | eligibility |  |
| `printed_label` | text | 3,239 (100%) | 2 | Eligibility of Tenderer | the number or bullet the notice itself puts on the clause |
| `text` | text | 3,239 (100%) | 1,468 | 1. The minimum number of years of general experience of the… |  |
| `chars` | number | 3,239 (100%) | 533 | 655 |  |
| `categories` | text | 3,239 (100%) | 140 | experience_general;experience_similar;financial_turnover;su… | what the clause asks for — turnover, liquid assets, experience, a named product — assigned by matching the printed words |
| `defers_to_another_document` | yes / no | 3,239 (100%) | 2 | no / yes | the clause says 'as stated in the tender document' and that document is not in this folder |
| `money_taka` | text | 1,125 (34%) | 351 | 28000000.00;110000000.00;28000000.00;110000000.00 | a sum in taka, parsed from the printed figure |
| `money_original` | text | 1,133 (34%) | 734 | BDT 280 (Two hundred Eighty) Lac \| Tk 11 (Eleven) Crore \| 2… | the sum as printed, characters and all |
| `money_words` | text | 1,092 (33%) | 275 | Two hundred Eighty \| Eleven \| Two hundred Eighty \| Eleven | the amount written in words, where the clause writes it twice |
| `money_scale_words` | text | 1,133 (34%) | 16 | crore;lac |  |
| `money_reading` | text | 1,133 (34%) | 45 | the digits and the words agree, so the scale word is applie… | how the figure was read, or why it could not be |
| `money_unresolved` | yes / no | 20 (0%) | 1 | yes | digits and words disagree, so the sum is excluded from every money calculation rather than guessed at |
| `years` | text | 1,123 (34%) | 16 | 5;10 |  |
| `contract_counts` | text | 298 (9%) | 4 | 2 |  |
| `percentages` | number | 62 (1%) | 3 | 10 |  |

---

## lots.csv

One row per lot inside a tender. A notice with four lots is one row in tenders.csv and four rows here.

1,152 rows, 11 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `tender_id` | number | 1,152 (100%) | 1,129 | 1001782 | the portal's own tender id, the key every table joins on |
| `source_file` | text | 1,152 (100%) | 1,129 | Tender Notice_PDFs/CDA_Tender_1001782.pdf | the PDF this row was read from |
| `page` | number | 1,152 (100%) | 3 | 1 | the 1-based page of source_file the value is printed on |
| `table_generation` | text | 1,152 (100%) | 2 | lots_legacy | how the lot table was recovered from the page |
| `lot_no` | text | 1,152 (100%) | 67 | 01 |  |
| `identification` | text | 1,152 (100%) | 1,008 | Supply, Installation, Testing & Commissioning of Lift at CD… |  |
| `location` | text | 1,152 (100%) | 353 | Nasirabad, Chattogram |  |
| `security_amount_taka` | number | 1,110 (96%) | 315 | 1400000 | a sum in taka, parsed from the printed figure |
| `security_amount_original` | number | 1,110 (96%) | 315 | 1400000 |  |
| `start_date` | date | 1,140 (98%) | 419 | 2024-08-08 |  |
| `completion_date` | date | 1,150 (99%) | 478 | 2024-12-31 |  |

---

## amendments.csv

One row per amendment notice, and the fields it says it changed.

160 rows, 10 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `tender_id` | number | 160 (100%) | 160 | 100483 | the portal's own tender id, the key every table joins on |
| `source_file` | text | 160 (100%) | 160 | Tender Notice_PDFs/CDA_Tender_100483.pdf | the PDF this row was read from |
| `page` | number | 160 (100%) | 2 | 2 | the 1-based page of source_file the value is printed on |
| `amendment_no` | number | 160 (100%) | 5 | 1 |  |
| `amendment_no_printed` | text | 160 (100%) | 47 | 1 |  |
| `changed_fields` | text | 111 (69%) | 30 | Eligibility of Consultant;TDS/PDS--C. Qualification Criteri… |  |
| `changed_field_count` | number | 160 (100%) | 10 | 2 |  |
| `eligibility_changed` | yes / no | 160 (100%) | 2 | no / yes |  |
| `has_change_table` | yes / no | 160 (100%) | 2 | no / yes |  |
| `notice_text` | text | 158 (98%) | 105 | Tender Notice and Data Sheet Modification |  |

---

## amendment_changes.csv

One row per line of an amendment's change table: the old value in one column, the new value in the next.

735 rows, 10 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `tender_id` | number | 735 (100%) | 144 | 100483 | the portal's own tender id, the key every table joins on |
| `source_file` | text | 735 (100%) | 144 | Tender Notice_PDFs/CDA_Tender_100483.pdf | the PDF this row was read from |
| `page` | number | 735 (100%) | 2 | 2 | the 1-based page of source_file the value is printed on |
| `amendment_no` | number | 735 (100%) | 5 | 1 |  |
| `field` | text | 722 (98%) | 25 | Eligibility of Consultant |  |
| `old_value` | text | 735 (100%) | 444 | # The minimum number of years of general experience of the … |  |
| `new_value` | text | 734 (99%) | 441 | # The minimum number of years of general experience of the … |  |
| `value_changed` | yes / no | 735 (100%) | 2 | no / yes |  |
| `old_chars` | number | 735 (100%) | 173 | 792 |  |
| `new_chars` | number | 735 (100%) | 175 | 773 |  |

---

## beneficial_owners.csv

The owners a document declares, where one does.

77 rows, 11 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `tender_id` | number | 77 (100%) | 60 | 1097226 | the portal's own tender id, the key every table joins on |
| `source_file` | text | 77 (100%) | 60 | Contract_Awards_PDFs/Tender_1097226.pdf | the PDF this row was read from |
| `page` | number | 77 (100%) | 1 | 1 | the 1-based page of source_file the value is printed on |
| `company` | text | 77 (100%) | 34 | Aliza Enterprise |  |
| `company_id` | text | 77 (100%) | 34 | co0005 | a key into another table in this dataset |
| `serial` | number | 77 (100%) | 7 | 1 |  |
| `owner_name` | text | 77 (100%) | 50 | SARKER MARUF AHAMAD |  |
| `owner_id` | text | 77 (100%) | 50 | pp0019 | a key into another table in this dataset |
| `designation` | text | 19 (24%) | 4 | Proprietor |  |
| `ownership_pct` | number | 77 (100%) | 12 | 100 |  |
| `country` | text | 32 (41%) | 3 | BANGLADESH |  |

---

## companies.csv

Every firm named anywhere in the archive, with the roles it is named in and what it won. Names are not merged on resemblance.

309 rows, 23 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `id` | text | 309 (100%) | 309 | co0001 | this row's own key, assigned by the pipeline |
| `name` | text | 309 (100%) | 309 | M/S. Niaz Traders |  |
| `match_key` | text | 309 (100%) | 309 | NIAZ TRADERS | the normalised string used to decide whether two rows are the same entity. Two rows sharing a key were joined; resemblance alone never joined anything |
| `other_printed_names` | text | 1 (0%) | 1 | Rana Builders (Pvt.) Ltd. - M/s. Shafique and Sons (JV) ( J… | every other spelling of this name the archive prints |
| `printed_name_variants` | number | 309 (100%) | 2 | 1 | how many spellings of this name the archive prints |
| `roles` | text | 309 (100%) | 1 | contract awarded | the roles this entity is named in, semicolon separated |
| `documents` | number | 309 (100%) | 14 | 8 | how many documents name this entity |
| `first_document` | text | 309 (100%) | 309 | Contract_Awards_PDFs/Tender_1000267.pdf | the first PDF, in reading order, that names it |
| `first_page` | number | 309 (100%) | 1 | 1 | the page of first_document it is named on |
| `name_read_from_interleaved_layout` | text | 0 (0%) | 0 | — | the name came off a page whose text layer ran fields together, so read it against the PDF |
| `contracts_won` | number | 309 (100%) | 14 | 8 |  |
| `total_contract_value_taka` | number | 309 (100%) | 309 | 546286288.5 | a sum in taka, parsed from the printed figure |
| `contracts_with_no_value_printed` | number | 309 (100%) | 1 | 0 |  |
| `first_award_date` | date | 309 (100%) | 249 | 2019-09-04 |  |
| `last_award_date` | date | 309 (100%) | 232 | 2025-05-19 |  |
| `tender_ids` | text | 309 (100%) | 309 | 1000267;1035179;1044320;1082525;293018;535719;789921;975322 |  |
| `procuring_entities` | text | 309 (100%) | 121 | Superintending Engineer (Civil Circle-3) \| Development of R… |  |
| `procuring_entity_count` | number | 309 (100%) | 7 | 5 |  |
| `agencies` | text | 309 (100%) | 20 | Rajdhani Unnayan Kartripakkha (RAJUK) |  |
| `districts` | text | 309 (100%) | 24 | Dhaka |  |
| `addresses_printed` | text | 309 (100%) | 296 | 154, Motijheel C/A. Masjid Market (2nd Floor), Room No.301-… |  |
| `tenderer_ids_printed` | number | 32 (10%) | 32 | 1030557 |  |
| `beneficial_owners_declared` | number | 309 (100%) | 8 | 0 |  |

---

## people.csv

Every person named, with the designation the document prints for them.

137 rows, 17 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `id` | text | 137 (100%) | 137 | pp0001 | this row's own key, assigned by the pipeline |
| `name` | text | 137 (100%) | 137 | Saber Ahmed |  |
| `match_key` | text | 137 (100%) | 137 | SABER AHMED | the normalised string used to decide whether two rows are the same entity. Two rows sharing a key were joined; resemblance alone never joined anything |
| `other_printed_names` | text | 8 (5%) | 8 | saber ahmed | every other spelling of this name the archive prints |
| `printed_name_variants` | number | 137 (100%) | 3 | 2 | how many spellings of this name the archive prints |
| `roles` | text | 137 (100%) | 5 | official approving the award;official inviting the tender | the roles this entity is named in, semicolon separated |
| `documents` | number | 137 (100%) | 38 | 23 | how many documents name this entity |
| `first_document` | text | 137 (100%) | 117 | Contract_Awards_PDFs/Tender_1000267.pdf | the first PDF, in reading order, that names it |
| `first_page` | number | 137 (100%) | 2 | 1 | the page of first_document it is named on |
| `name_read_from_interleaved_layout` | text | 0 (0%) | 0 | — | the name came off a page whose text layer ran fields together, so read it against the PDF |
| `tenders_invited` | number | 137 (100%) | 27 | 13 |  |
| `awards_approved` | number | 137 (100%) | 25 | 10 |  |
| `designations_printed` | text | 101 (73%) | 42 | Superintending Engineer \| PD ( Gulshan-Banani-Baridhara Lak… |  |
| `organizations` | text | 88 (64%) | 65 | Superintending Engineer (Civil Circle-3) \| Superintending E… |  |
| `tender_ids` | text | 88 (64%) | 88 | 1000267;1035179;1044805;1081213;1082494;1082495;1082496;108… |  |
| `declared_owner_of` | text | 50 (36%) | 35 | Aliza Enterprise |  |
| `declared_ownership` | text | 50 (36%) | 16 | 100%;100%;100%;100%;100% |  |

---

## organizations.csv

Ministries, agencies and procuring entities.

110 rows, 19 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `id` | text | 110 (100%) | 110 | og0001 | this row's own key, assigned by the pipeline |
| `name` | text | 110 (100%) | 110 | Ministry of Housing and Public Works |  |
| `match_key` | text | 110 (100%) | 110 | MINISTRY OF HOUSING AND PUBLIC WORKS | the normalised string used to decide whether two rows are the same entity. Two rows sharing a key were joined; resemblance alone never joined anything |
| `other_printed_names` | text | 0 (0%) | 0 | — | every other spelling of this name the archive prints |
| `printed_name_variants` | number | 110 (100%) | 1 | 1 | how many spellings of this name the archive prints |
| `roles` | text | 110 (100%) | 4 | ministry | the roles this entity is named in, semicolon separated |
| `documents` | number | 110 (100%) | 39 | 1778 | how many documents name this entity |
| `first_document` | text | 110 (100%) | 87 | Contract_Awards_PDFs/Tender_1000267.pdf | the first PDF, in reading order, that names it |
| `first_page` | number | 110 (100%) | 1 | 1 | the page of first_document it is named on |
| `name_read_from_interleaved_layout` | yes / no | 1 (0%) | 1 | yes | the name came off a page whose text layer ran fields together, so read it against the PDF |
| `notices_published` | number | 110 (100%) | 33 | 1141 |  |
| `awards_published` | number | 110 (100%) | 30 | 637 |  |
| `total_contract_value_taka` | number | 110 (100%) | 79 | 37210242324.389999 | a sum in taka, parsed from the printed figure |
| `districts` | text | 108 (98%) | 21 | Chattogram;Chittagong;Cox's Bazar;Gazipur;Khulna;Dhaka;Rajs… |  |
| `parent_named` | text | 102 (92%) | 25 | Ministry of Housing and Public Works |  |
| `notices_with_substantive_criteria` | number | 110 (100%) | 20 | 0 |  |
| `notices_without_substantive_criteria` | number | 110 (100%) | 18 | 0 |  |
| `distinct_winners` | number | 110 (100%) | 23 | 302 |  |
| `winners` | text | 84 (76%) | 75 | M/S. Niaz Traders \| M/s. Moni Construction \| Momotaj Engine… |  |

---

## projects.csv

The projects the notices and awards are charged to.

108 rows, 16 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `id` | text | 108 (100%) | 108 | pr0001 | this row's own key, assigned by the pipeline |
| `name` | text | 108 (100%) | 108 | Building Repair and Maintenance |  |
| `match_key` | text | 108 (100%) | 108 | BUILDING REPAIR AND MAINTENANCE | the normalised string used to decide whether two rows are the same entity. Two rows sharing a key were joined; resemblance alone never joined anything |
| `other_printed_names` | text | 2 (1%) | 2 | Construction of Flyover at Muradpur, 2 No. Gate, GEC Juncti… | every other spelling of this name the archive prints |
| `printed_name_variants` | number | 108 (100%) | 2 | 1 | how many spellings of this name the archive prints |
| `roles` | text | 108 (100%) | 3 | charged an awarded contract | the roles this entity is named in, semicolon separated |
| `documents` | number | 108 (100%) | 28 | 6 | how many documents name this entity |
| `first_document` | text | 108 (100%) | 108 | Contract_Awards_PDFs/Tender_1000267.pdf | the first PDF, in reading order, that names it |
| `first_page` | number | 108 (100%) | 1 | 1 | the page of first_document it is named on |
| `name_read_from_interleaved_layout` | text | 0 (0%) | 0 | — | the name came off a page whose text layer ran fields together, so read it against the PDF |
| `notices` | number | 108 (100%) | 21 | 0 |  |
| `awards` | number | 108 (100%) | 17 | 6 |  |
| `total_contract_value_taka` | number | 108 (100%) | 92 | 121698887.391 | a sum in taka, parsed from the printed figure |
| `project_codes_printed` | text | 102 (94%) | 102 | 9320000 40 |  |
| `procuring_entities` | text | 107 (99%) | 64 | Superintending Engineer (Civil Circle-3) \| Office of the Ch… |  |
| `tender_ids` | text | 108 (100%) | 108 | 1000267;189828;251218;507537;514341;514343 |  |

---

## locations.csv

Every place the documents name, at whichever level they name it.

607 rows, 7 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `level` | text | 607 (100%) | 6 | district | how precise the place name is — district, city, thana |
| `printed` | text | 607 (100%) | 586 | Chattogram | the place name exactly as the document prints it |
| `normalized` | text | 607 (100%) | 586 | Chattogram | the result of the rule, kept beside the original and never instead of it |
| `tenders` | number | 607 (100%) | 43 | 229 |  |
| `first_source_file` | text | 607 (100%) | 437 | Tender Notice_PDFs/CDA_Tender_1001782.pdf |  |
| `first_page` | number | 607 (100%) | 2 | 1 | the page of first_document it is named on |
| `coordinates` | text | 607 (100%) | 1 | not documented in the supplied documents | blank on every row. No supplied document prints a coordinate, and no external gazetteer was consulted |

---

## relationships.csv

Every link between two records, with the file and page the link was read from. Nothing here is inferred.

9,694 rows, 8 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `source_type` | text | 9,694 (100%) | 4 | company | which table the left-hand record is in |
| `source_id` | text | 9,694 (100%) | 1,699 | co0001 | a key into another table in this dataset |
| `relation` | text | 9,694 (100%) | 8 | was awarded | what the link is, in the pipeline's own vocabulary |
| `target_type` | text | 9,694 (100%) | 4 | tender | which table the right-hand record is in |
| `target_id` | text | 9,694 (100%) | 1,592 | 1000267 | a key into another table in this dataset |
| `detail` | text | 3,157 (32%) | 669 | 104498747.100 | what the page prints about the link, in its own words |
| `evidence_file` | text | 9,694 (100%) | 1,795 | Contract_Awards_PDFs/Tender_1000267.pdf | the PDF the link was read from |
| `evidence_page` | number | 9,694 (100%) | 2 | 1 | the page of evidence_file the link is printed on |

---

## timeline.csv

Every dated event, one row per date, so a date can be traced back to the field it came from.

13,411 rows, 7 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `date` | date | 13,411 (100%) | 2,433 | 2014-12-01 |  |
| `event` | text | 13,411 (100%) | 14 | notice published | which field the date came from, so a date can be traced to its label |
| `tender_id` | number | 13,411 (100%) | 1,147 | 15000 | the portal's own tender id, the key every table joins on |
| `entity` | text | 13,411 (100%) | 388 | Grid Maintenance Division, Comilla (PGCB) | what the date is about |
| `original` | text | 13,411 (100%) | 5,628 | 01-Dec-2014 15:00 | the date exactly as printed, before it was parsed |
| `source_file` | text | 13,411 (100%) | 1,790 | Tender Notice_PDFs/CDA_Tender_15000.pdf | the PDF this row was read from |
| `page` | number | 13,411 (100%) | 2 | 1 | the 1-based page of source_file the value is printed on |

---

## normalization.csv

Every value this pipeline changed: the original, the result, the rule and the reason. Nothing is changed silently.

245 rows, 6 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `field` | text | 245 (100%) | 6 | pp |  |
| `original` | text | 238 (97%) | 238 | A H M Mesbah Uddin | the date exactly as printed, before it was parsed |
| `normalized` | text | 245 (100%) | 129 | A. H. M. Mesbah Uddin | the result of the rule, kept beside the original and never instead of it |
| `rule` | text | 245 (100%) | 4 | same-key | which normalisation rule fired |
| `reason` | text | 245 (100%) | 4 | identical after case, punctuation and the M/S. prefix are s… |  |
| `confidence` | text | 245 (100%) | 2 | high | how sure the pipeline is of the normalised value |

---

## name_candidate_pairs.csv

Names that resemble each other. The merged column is no on all of them — resemblance is published for a human to judge, not acted on.

219 rows, 12 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `entity_type` | text | 219 (100%) | 4 | company |  |
| `id_a` | text | 219 (100%) | 108 | co0001 |  |
| `name_a` | text | 219 (100%) | 108 | M/S. Niaz Traders |  |
| `id_b` | text | 219 (100%) | 128 | co0085 |  |
| `name_b` | text | 219 (100%) | 128 | NIAZ-NOONA-KTA JV ( JVCA Partners [Business Share]: KHOKAN … |  |
| `key_a` | text | 219 (100%) | 108 | NIAZ TRADERS |  |
| `key_b` | text | 219 (100%) | 128 | NIAZ NOONA KTA JV JVCA PARTNERS BUSINESS SHARE KHOKAN TRADI… |  |
| `resemblance` | text | 219 (100%) | 4 | one name's words are all contained in the other | how the two names resemble each other, in words |
| `measure` | text | 55 (25%) | 1 | edit distance &lt;= 2 | the arithmetic behind the resemblance |
| `merged` | yes / no | 219 (100%) | 1 | no | no on all 219 rows |
| `documents_a` | text | 219 (100%) | 103 | Contract_Awards_PDFs/Tender_1000267.pdf;Contract_Awards_PDF… |  |
| `documents_b` | text | 219 (100%) | 123 | Contract_Awards_PDFs/Tender_119326.pdf |  |

---

## master_dataset.csv

One row per procurement, notice joined to award, with the lots, bid counts and eligibility summary folded in.

1,151 rows, 112 columns.

| Column | Kind | Filled | Distinct | Example | What it holds |
|---|---|---:|---:|---|---|
| `agency` | text | 1,150 (99%) | 12 | Chittagong Development Authority |  |
| `agency_id` | text | 1,150 (99%) | 12 | og0009 | a key into another table in this dataset |
| `amended` | yes / no | 1,150 (99%) | 2 | no / yes |  |
| `amendment_changed_fields` | text | 111 (9%) | 30 | Eligibility of Consultant;TDS/PDS--C. Qualification Criteri… |  |
| `amendment_no` | number | 160 (13%) | 5 | 1 |  |
| `amendment_no_printed` | text | 160 (13%) | 47 | 1 |  |
| `app_id` | number | 1,150 (99%) | 326 | 196376 | a key into another table in this dataset |
| `budget_type` | text | 1,150 (99%) | 4 | Own Fund |  |
| `category` | text | 1,150 (99%) | 386 | Electrical domestic appliances; Domestic appliances; Instal… |  |
| `city` | text | 1,133 (98%) | 18 | Chittagong |  |
| `closing_date` | date | 1,129 (98%) | 515 | 2024-08-05 |  |
| `country` | text | 1,133 (98%) | 1 | Bangladesh |  |
| `development_partner` | text | 15 (1%) | 3 | Japan International Cooperation agency(JICA) |  |
| `district` | text | 1,149 (99%) | 13 | Chattogram |  |
| `district_original` | text | 1,149 (99%) | 13 | Chattogram | the district exactly as printed, before normalisation. Nothing was merged: Chattogram and Chittagong stay apart |
| `document_price_original` | number | 1,128 (98%) | 11 | 4000 |  |
| `document_price_taka` | number | 1,128 (98%) | 11 | 4000 | a sum in taka, parsed from the printed figure |
| `eligibility_amended` | yes / no | 1,150 (99%) | 2 | no / yes |  |
| `eligibility_categories` | text | 1,150 (99%) | 146 | cert_licence_class;cert_other;cert_tin;cert_trade_licence;c… |  |
| `eligibility_chars` | number | 1,150 (99%) | 384 | 1182 |  |
| `eligibility_clauses` | number | 1,150 (99%) | 11 | 3 |  |
| `eligibility_numbering` | text | 1,150 (99%) | 6 | (n) |  |
| `eligibility_page` | number | 1,150 (99%) | 1 | 1 |  |
| `eligibility_published` | yes / no | 1,150 (99%) | 2 | no / yes | whether the notice prints any condition of entry at all |
| `eligibility_source_field` | text | 1,150 (99%) | 2 | eligibility | which field on the notice the clauses were read out of |
| `eligibility_substantive` | yes / no | 1,150 (99%) | 2 | no / yes | whether it prints one that can be checked, rather than only a pointer to an unpublished document |
| `evaluation_type` | text | 1,150 (99%) | 3 | Lot wise |  |
| `event_type` | text | 1,150 (99%) | 7 | TENDER |  |
| `invitation_for` | text | 1,129 (98%) | 2 | Tender - Single Lot |  |
| `invitation_ref` | text | 1,129 (98%) | 1,019 | PD/CDASQR/lift/E-65/01 |  |
| `inviting_officer` | text | 1,149 (99%) | 93 | Kazi Kader Newaz |  |
| `inviting_officer_designation` | text | 1,146 (99%) | 29 | Assistant Engineer |  |
| `inviting_officer_id` | text | 1,149 (99%) | 85 | pp0006 | a key into another table in this dataset |
| `last_selling_date` | date | 1,129 (98%) | 517 | 2024-08-04 |  |
| `lots` | number | 1,150 (99%) | 5 | 1 |  |
| `method` | text | 1,150 (99%) | 4 | Open Tendering Method (OTM) |  |
| `ministry` | text | 1,150 (99%) | 6 | Ministry of Housing and Public Works |  |
| `ministry_id` | text | 1,150 (99%) | 6 | og0001 | a key into another table in this dataset |
| `notice_file` | text | 1,150 (99%) | 1,150 | Tender Notice_PDFs/CDA_Tender_1001782.pdf |  |
| `notice_pages` | number | 1,150 (99%) | 3 | 2 |  |
| `opening_date` | date | 1,129 (98%) | 515 | 2024-08-05 |  |
| `package_description` | text | 1,148 (99%) | 1,038 | Supply, Installation, Testing & Commissioning of Lift at CD… |  |
| `package_no` | text | 1,145 (99%) | 1,026 | PD/CDAsqr/lift/65/02 |  |
| `payment_mode` | text | 1,145 (99%) | 2 | Payment through Bank |  |
| `phone` | text | 1,133 (98%) | 59 | 031-625562 |  |
| `premeeting_end` | date | 1,145 (99%) | 516 | 2024-07-15 |  |
| `premeeting_start` | date | 1,145 (99%) | 491 | 2024-07-08 |  |
| `procurement_nature` | text | 1,150 (99%) | 5 | Works |  |
| `procurement_type` | text | 1,150 (99%) | 1 | NCT |  |
| `procuring_entity` | text | 1,149 (99%) | 78 | Project Director (CDA Square) |  |
| `procuring_entity_code` | text | 256 (22%) | 12 | 2001 |  |
| `procuring_entity_id` | text | 1,149 (99%) | 78 | og0010 | a key into another table in this dataset |
| `project` | text | 1,150 (99%) | 104 | Construction of CDA Square at Nasirabad, Chittagong |  |
| `project_code` | text | 1,149 (99%) | 103 | CDA Square-02 |  |
| `project_id` | text | 1,150 (99%) | 103 | pr0005 | a key into another table in this dataset |
| `published_date` | date | 1,129 (98%) | 492 | 2024-07-08 |  |
| `security_last_date` | date | 1,144 (99%) | 521 | 2024-08-05 |  |
| `security_valid_until` | date | 1,118 (97%) | 564 | 2024-12-01 |  |
| `source_of_funds` | text | 1,150 (99%) | 6 | Own fund |  |
| `status` | text | 967 (84%) | 9 | Contract Awarded |  |
| `status_original` | text | 967 (84%) | 91 | Contract Awarded | the status exactly as the notice prints it, before any normalisation |
| `tender_id` | number | 1,151 (100%) | 1,151 | 1001782 | the portal's own tender id, the key every table joins on |
| `tender_valid_until` | date | 1,118 (97%) | 564 | 2024-11-03 |  |
| `thana` | text | 1,133 (98%) | 25 | Kotowali |  |
| `advertised_date` | date | 645 (56%) | 351 | 2024-07-08 |  |
| `award_agency` | text | 645 (56%) | 11 | Chittagong Development Authority |  |
| `award_agency_id` | text | 645 (56%) | 11 | og0009 | a key into another table in this dataset |
| `award_development_partner` | text | 645 (56%) | 4 | NA |  |
| `award_district` | text | 645 (56%) | 14 | Chattogram |  |
| `award_file` | text | 645 (56%) | 645 | Contract_Awards_PDFs/Tender_1001782.pdf |  |
| `award_for` | text | 645 (56%) | 3 | Works |  |
| `award_invitation_ref` | text | 645 (56%) | 639 | PD/CDASQR/lift/E-65/01 |  |
| `award_method` | text | 645 (56%) | 2 | OTM |  |
| `award_ministry` | text | 645 (56%) | 4 | Ministry of Housing and Public Works |  |
| `award_ministry_id` | text | 645 (56%) | 4 | og0001 | a key into another table in this dataset |
| `award_officer` | text | 645 (56%) | 79 | Kazi Kader Newaz |  |
| `award_officer_designation` | text | 645 (56%) | 27 | Assistant Engineer |  |
| `award_officer_id` | text | 645 (56%) | 73 | pp0006 | a key into another table in this dataset |
| `award_package_name` | text | 645 (56%) | 642 | Supply, Installation, Testing & Commissioning of Lift at CD… |  |
| `award_package_no` | text | 645 (56%) | 645 | PD/CDAsqr/lift/65/02 |  |
| `award_pages` | number | 645 (56%) | 2 | 1 |  |
| `award_procuring_entity` | text | 645 (56%) | 70 | Project Director (CDA Square) |  |
| `award_procuring_entity_code` | text | 110 (9%) | 10 | 2001 |  |
| `award_procuring_entity_id` | text | 645 (56%) | 70 | og0010 | a key into another table in this dataset |
| `award_project` | text | 645 (56%) | 92 | Construction of CDA Square at Nasirabad, Chittagong |  |
| `award_project_id` | text | 645 (56%) | 91 | pr0005 | a key into another table in this dataset |
| `award_source_of_funds` | text | 645 (56%) | 7 | Own Fund Own fund |  |
| `award_template` | text | 645 (56%) | 2 | supplier | which of the portal's award-notice layouts this file uses |
| `beneficial_owners` | number | 645 (56%) | 6 | 0 |  |
| `bid_counts_printed` | yes / no | 645 (56%) | 2 | no / yes |  |
| `contract_description` | text | 591 (51%) | 588 | Supply, Installation, Testing & Commissioning of Lift at CD… |  |
| `contract_no` | text | 591 (51%) | 591 | PD/CDAsqr/lift/65/02/015 |  |
| `contract_signed_on_time` | yes / no | 591 (51%) | 2 | no / yes |  |
| `contract_value_original` | number | 645 (56%) | 624 | 52490000.531 | the contract value as printed, before it was parsed |
| `contract_value_taka` | number | 645 (56%) | 624 | 52490000.531 | a sum in taka, parsed from the printed figure |
| `noa_date` | date | 645 (56%) | 375 | 2024-08-22 |  |
| `performance_security_on_time` | yes / no | 591 (51%) | 1 | yes |  |
| `signed_date` | date | 645 (56%) | 410 | 2024-09-09 |  |
| `tenders_received` | number | 591 (51%) | 20 | 1 |  |
| `tenders_responsive` | number | 591 (51%) | 16 | 1 |  |
| `tenders_sold` | number | 591 (51%) | 24 | 3 |  |
| `winner` | text | 645 (56%) | 310 | CPDL LTD. |  |
| `winner_id` | text | 645 (56%) | 309 | co0007 | a key into another table in this dataset |
| `winner_location` | text | 645 (56%) | 297 | CPDL LTD. 81/A S.S Khaled Road, Chittagong-4000 Tel:-031-28… |  |
| `winner_page` | number | 645 (56%) | 1 | 1 |  |
| `winner_tenderer_id` | number | 54 (4%) | 32 | 1109887 | a key into another table in this dataset |
| `work_completion_date` | date | 645 (56%) | 392 | 2024-12-31 |  |
| `work_location` | text | 645 (56%) | 252 | Nasirabad, Chattogram |  |
| `work_start_date` | date | 645 (56%) | 387 | 2024-08-10 |  |
| `notice_document_found` | yes / no | 1,151 (100%) | 2 | no / yes |  |
| `award_document_found` | yes / no | 1,151 (100%) | 2 | no / yes |  |
| `outcome_source` | text | 1,151 (100%) | 2 | award notice |  |

