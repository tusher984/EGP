#!/usr/bin/env python3
"""Extract page text from the reference PDFs under 'COR SC/' into a JSON cache.

Run with the repo virtualenv and -P (a stray pytesseract.py at the repo root
shadows the real package):

    .venv/bin/python3 -P investigation/scripts/extract_corsc_text.py OUT.json
"""
import glob
import json
import os
import sys

import pypdfium2 as pdfium

REPO = "/Users/alamintusher/Documents/GitHub/EGP-CDA"
SRC = os.path.join(REPO, "COR SC")


def main(out_path):
    out = {}
    for path in sorted(glob.glob(os.path.join(SRC, "*.pdf"))):
        name = os.path.basename(path)
        doc = pdfium.PdfDocument(path)
        pages = []
        for i in range(len(doc)):
            page = doc[i]
            tp = page.get_textpage()
            pages.append({"n": i + 1, "text": tp.get_text_bounded()})
            tp.close()
            page.close()
        doc.close()
        out[name] = pages
        print("%-70s %4d pages" % (name, len(pages)), flush=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False)
    print("wrote", out_path)


if __name__ == "__main__":
    main(sys.argv[1])
