import json
import os
from pathlib import Path

import pdfplumber

# Resolve paths relative to this script so it works from any working directory.
BASE_DIR = Path(__file__).resolve().parent
NOTICE_DIR = BASE_DIR / "Tender Notice_PDFs"
AWARD_DIR = BASE_DIR / "Contract_Awards_PDFs"
OUTPUT_CACHE = BASE_DIR / "pdf_text_cache.json"

text_cache = {}


def extract_pdf_text(pdf_path: Path) -> str:
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as exc:
        print(f"Error reading {pdf_path.name}: {exc}")
    return text


print("Scanning Tender Notice PDFs...")
if NOTICE_DIR.exists():
    for pdf_file in sorted(NOTICE_DIR.glob("*.pdf")):
        text_cache[pdf_file.name] = extract_pdf_text(pdf_file)
        print(f"Extracted: {pdf_file.name}")

print("Scanning Contract Award PDFs...")
if AWARD_DIR.exists():
    for pdf_file in sorted(AWARD_DIR.glob("*.pdf")):
        text_cache[pdf_file.name] = extract_pdf_text(pdf_file)
        print(f"Extracted: {pdf_file.name}")

with open(OUTPUT_CACHE, "w", encoding="utf-8") as handle:
    json.dump(text_cache, handle, ensure_ascii=False, indent=2)

print(f"\n✅ All PDF text pre-extracted into: {OUTPUT_CACHE}")
