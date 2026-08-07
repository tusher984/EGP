import os
import json
import pdfplumber
from pathlib import Path

# Try importing OCR libraries for scanned image PDFs
try:
    import pytesseract
    from pdf2image import convert_from_path
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("⚠️ pytesseract/pdf2image not installed. Only digital PDFs will be processed.")

BASE_DIR = Path(os.getcwd())
NOTICE_DIR = BASE_DIR / "Tender Notice_PDFs"
AWARD_DIR = BASE_DIR / "Contract_Awards_PDFs"
OUTPUT_CACHE = BASE_DIR / "pdf_text_cache.json"

text_cache = {}

def extract_pdf_text(pdf_path):
    text = ""
    # Method 1: Try Native Digital Text Extraction
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"Error reading digital text in {pdf_path.name}: {e}")

    # Method 2: If no text was found and OCR is installed, run OCR on scanned pages
    if not text.strip() and OCR_AVAILABLE:
        print(f"  🔍 Running OCR Image Scanner on {pdf_path.name}...")
        try:
            images = convert_from_path(pdf_path)
            for img in images:
                text += pytesseract.image_to_string(img) + "\n"
        except Exception as e:
            print(f"  ❌ OCR Error on {pdf_path.name}: {e}")

    return text.strip()

print("--- Starting e-GP PDF Scanner & OCR Engine ---")

if NOTICE_DIR.exists():
    print(f"\nScanning: {NOTICE_DIR.name}")
    for pdf_file in NOTICE_DIR.glob("*.pdf"):
        print(f"Processing: {pdf_file.name}")
        text_cache[pdf_file.name] = extract_pdf_text(pdf_file)

if AWARD_DIR.exists():
    print(f"\nScanning: {AWARD_DIR.name}")
    for pdf_file in AWARD_DIR.glob("*.pdf"):
        print(f"Processing: {pdf_file.name}")
        text_cache[pdf_file.name] = extract_pdf_text(pdf_file)

# Save extracted text cache
with open(OUTPUT_CACHE, "w", encoding="utf-8") as f:
    json.dump(text_cache, f, ensure_ascii=False, indent=2)

print(f"\n✅ SUCCESS! All PDF text saved to: {OUTPUT_CACHE}")