#!/usr/bin/env python3
"""Phase 1 - recursive ingest and complete document inventory.

Walks the whole project, finds every PDF, and records for each one: where it
lives, how big it is, its SHA-256, its page count, its embedded metadata, the
per-page character counts, the ruled tables pdfplumber can see, the embedded
images, the script the text is written in, and whether the page carries a text
layer at all (i.e. whether OCR would be needed).

Two independent extractors run over every file - pdfplumber and pypdfium2 - and
their per-page character counts are compared. Agreement is the confidence
signal carried forward into Phase 3; disagreement is recorded, never hidden.

No PDF is skipped. A file that cannot be opened is written into the inventory
with `error` set and `needs_ocr` true, so the count of unreadable documents is
part of the published record instead of a silent gap.

Outputs (all under investigation/data/):
    inventory.json   one record per PDF, plus corpus-level rollups
    raw_pages.json   per-page text and tables, the substrate for Phase 2

Run from the repository root:
    .venv/bin/python -P investigation/parser/01_inventory.py

The -P matters: a module named pytesseract.py in the repository root shadows the
real package and re-runs the old extraction pipeline when imported.
"""

import hashlib
import io
import json
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
DATA = os.path.abspath(os.path.join(HERE, "..", "data"))

SKIP_DIRS = {".git", ".venv", "__pycache__", "node_modules", ".claude"}
BENGALI = re.compile(r"[ঀ-৿]")
# a page with fewer than this many characters has no usable text layer
OCR_CHARS_PER_PAGE = 50


def find_pdfs():
    """Every PDF in the project, depth-first, in a stable order."""
    out = []
    for base, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for name in sorted(files):
            if name.lower().endswith(".pdf"):
                out.append(os.path.join(base, name))
    return out


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def script_of(text):
    """Which script the document is written in, by counting Bengali codepoints."""
    if not text.strip():
        return "none"
    bn = len(BENGALI.findall(text))
    latin = len(re.findall(r"[A-Za-z]", text))
    if bn and latin:
        return "mixed" if bn * 20 > latin else "en+bn"
    if bn:
        return "bn"
    return "en" if latin else "none"


def doc_kind(text, path):
    """What kind of document this is, decided by the document's own words.

    Four kinds occur in this archive: contract-award notices, invitation/tender
    notices, the procurement rulebooks the notices are written under, and the
    e-GP error page that five of the notice URLs returned instead of a record.

    The test is the masthead - the document's own first line - because the body
    of a tender notice can itself say "Contract Awarded" in its status field.
    """
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    masthead = (lines[0] if lines else "").lower()
    head = text[:600].lower()
    if "this tender is not exists" in text.lower() or "un-authorized to access" in text.lower():
        return "unavailable_record"
    if "contract award" in masthead:
        return "contract_award"
    if "view ift" in masthead or "notice details" in masthead \
            or "invitation for tender" in masthead or "tender notice" in masthead \
            or "e-tender notice" in masthead:
        return "tender_notice"
    if "request for proposal" in masthead or "invitation for proposal" in masthead:
        return "proposal_notice"
    if "procurement regulations" in head or "procurement guidance" in head \
            or "guidelines for procurement" in head or "standard tender document" in head \
            or "evaluating bids" in head:
        return "reference_rulebook"
    folder = os.path.basename(os.path.dirname(path)).lower()
    if "award" in folder:
        return "contract_award?"
    if "notice" in folder:
        return "tender_notice?"
    return "unknown"


def clean_meta(meta):
    """PDF metadata, as strings, with the bytes-vs-str inconsistency flattened."""
    out = {}
    for key, val in (meta or {}).items():
        if val is None:
            continue
        if isinstance(val, bytes):
            try:
                val = val.decode("utf-8", "replace")
            except Exception:
                val = repr(val)
        out[str(key).lstrip("/")] = str(val).strip()
    return out


def pdfium_page_chars(path):
    """Second opinion on the text layer, from an unrelated engine."""
    try:
        import pypdfium2 as pdfium
    except ImportError:
        return None
    try:
        doc = pdfium.PdfDocument(path)
        counts = []
        for page in doc:
            tp = page.get_textpage()
            counts.append(len(tp.get_text_range() or ""))
            tp.close()
            page.close()
        doc.close()
        return counts
    except Exception:
        return None


def read_one(path, pdfplumber):
    """Full inventory record for one PDF, plus its per-page text and tables."""
    rel = os.path.relpath(path, ROOT)
    rec = {
        "id": os.path.splitext(os.path.basename(path))[0],
        "file": rel,
        "filename": os.path.basename(path),
        "folder": os.path.dirname(rel) or ".",
        "bytes": os.path.getsize(path),
        "sha256": sha256(path),
        "pages": 0,
        "chars": 0,
        "words": 0,
        "page_chars": [],
        "tables": 0,
        "table_pages": [],
        "images": 0,
        "annexes": [],
        "metadata": {},
        "script": "none",
        "kind": "unknown",
        "needs_ocr": True,
        "text_layer": False,
        "pdfium_chars": None,
        "engines_agree": None,
        "error": None,
    }
    pages = []
    try:
        with pdfplumber.open(path) as pdf:
            rec["metadata"] = clean_meta(pdf.metadata)
            rec["pages"] = len(pdf.pages)
            for i, page in enumerate(pdf.pages, 1):
                text = page.extract_text() or ""
                try:
                    tables = [t for t in (page.extract_tables() or []) if t]
                except Exception:
                    tables = []
                images = len(page.images or [])
                rec["page_chars"].append(len(text))
                rec["chars"] += len(text)
                rec["words"] += len(text.split())
                rec["images"] += images
                if tables:
                    rec["tables"] += len(tables)
                    rec["table_pages"].append(i)
                pages.append({"n": i, "text": text, "tables": tables, "images": images})
    except Exception as exc:                      # a broken file is still inventoried
        rec["error"] = "%s: %s" % (type(exc).__name__, exc)

    full = "\n".join(p["text"] for p in pages)
    rec["script"] = script_of(full)
    rec["kind"] = doc_kind(full, path)
    per_page = (rec["chars"] / rec["pages"]) if rec["pages"] else 0
    rec["text_layer"] = per_page >= OCR_CHARS_PER_PAGE
    rec["needs_ocr"] = not rec["text_layer"]
    # annexes named by the document itself, e.g. "Annexure-A", "Appendix 2"
    rec["annexes"] = sorted(set(
        m.group(0).strip()
        for m in re.finditer(r"\b(?:Annex(?:ure)?|Appendix|Schedule)[\s\-:]*[A-Z0-9IVX]{1,3}\b", full)
    ))

    other = pdfium_page_chars(path)
    if other is not None:
        rec["pdfium_chars"] = sum(other)
        if rec["chars"] == 0 and rec["pdfium_chars"] == 0:
            rec["engines_agree"] = True
        else:
            bigger = max(rec["chars"], rec["pdfium_chars"]) or 1
            # the two engines join words differently; 15% is the noise floor
            rec["engines_agree"] = abs(rec["chars"] - rec["pdfium_chars"]) / bigger <= 0.15
    return rec, pages


def main():
    try:
        import pdfplumber
    except ImportError:
        sys.stderr.write("pdfplumber is required: .venv/bin/python -P -m pip install pdfplumber\n")
        raise SystemExit(1)

    paths = find_pdfs()
    if not paths:
        sys.stderr.write("no PDFs found under %s\n" % ROOT)
        raise SystemExit(1)

    print("inventory: %d PDFs under %s" % (len(paths), ROOT))
    started = time.time()
    records, raw = [], {}
    for i, path in enumerate(paths, 1):
        rec, pages = read_one(path, pdfplumber)
        records.append(rec)
        raw[rec["file"]] = pages
        if i % 200 == 0 or i == len(paths):
            print("  %4d/%d  %5.1fs" % (i, len(paths), time.time() - started))

    # duplicates: byte-identical first, then same text under a different name
    by_hash, by_text = {}, {}
    for rec in records:
        by_hash.setdefault(rec["sha256"], []).append(rec["file"])
        body = "".join(p["text"] for p in raw[rec["file"]]).strip()
        if body:
            key = hashlib.sha256(re.sub(r"\s+", " ", body).encode("utf-8")).hexdigest()
            by_text.setdefault(key, []).append(rec["file"])
    dup_bytes = {k: v for k, v in by_hash.items() if len(v) > 1}
    dup_text = {k: v for k, v in by_text.items() if len(v) > 1}
    dup_files = set()
    for group in list(dup_bytes.values()) + list(dup_text.values()):
        dup_files.update(group[1:])
    for rec in records:
        rec["duplicate_of"] = None
    for group in list(dup_bytes.values()) + list(dup_text.values()):
        for later in group[1:]:
            for rec in records:
                if rec["file"] == later and rec["duplicate_of"] is None:
                    rec["duplicate_of"] = group[0]

    kinds, folders, scripts = {}, {}, {}
    for rec in records:
        kinds[rec["kind"]] = kinds.get(rec["kind"], 0) + 1
        folders[rec["folder"]] = folders.get(rec["folder"], 0) + 1
        scripts[rec["script"]] = scripts.get(rec["script"], 0) + 1

    thin = sorted((r["chars"], r["file"]) for r in records)[:12]
    summary = {
        "generated": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "root": ROOT,
        "documents": len(records),
        "pages": sum(r["pages"] for r in records),
        "bytes": sum(r["bytes"] for r in records),
        "characters": sum(r["chars"] for r in records),
        "words": sum(r["words"] for r in records),
        "tables": sum(r["tables"] for r in records),
        "images": sum(r["images"] for r in records),
        "by_kind": kinds,
        "by_folder": folders,
        "by_script": scripts,
        "needs_ocr": sum(1 for r in records if r["needs_ocr"]),
        "errors": sum(1 for r in records if r["error"]),
        "duplicate_byte_groups": len(dup_bytes),
        "duplicate_text_groups": len(dup_text),
        "duplicate_files": len(dup_files),
        "engine_disagreements": sum(1 for r in records if r["engines_agree"] is False),
        "thinnest_documents": [{"file": f, "chars": c} for c, f in thin],
        "extractors": {"primary": "pdfplumber", "cross_check": "pypdfium2",
                       "ocr": "unavailable - no tesseract binary in this environment"},
    }

    if not os.path.isdir(DATA):
        os.makedirs(DATA)
    with io.open(os.path.join(DATA, "inventory.json"), "w", encoding="utf-8") as fh:
        json.dump({"summary": summary, "documents": records}, fh, ensure_ascii=False, indent=1)
    with io.open(os.path.join(DATA, "raw_pages.json"), "w", encoding="utf-8") as fh:
        json.dump(raw, fh, ensure_ascii=False)

    print("\n%d documents - %d pages - %d tables - %d images"
          % (summary["documents"], summary["pages"], summary["tables"], summary["images"]))
    print("by kind:  " + ", ".join("%s %d" % kv for kv in sorted(kinds.items())))
    print("needs OCR: %d    unreadable: %d    duplicates: %d    engine disagreements: %d"
          % (summary["needs_ocr"], summary["errors"], summary["duplicate_files"],
             summary["engine_disagreements"]))
    print("wrote data/inventory.json and data/raw_pages.json in %.1fs" % (time.time() - started))


if __name__ == "__main__":
    main()
