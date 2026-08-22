#!/usr/bin/env python3
"""List the source PDFs so the published tool can find them without a folder pick.

tool.html was written for a reader who has the repository on disk: it asks for the
folder and reads File objects. Published on GitHub Pages there is no folder — the
documents are already served beside the page — but a static host has no directory
listing, so the page cannot discover 1,800 filenames on its own. This writes them
into one small JSON file that ships with the site.

    python3 make_pdf_manifest.py        # -> pdf_manifest.json

Rerun after adding or removing PDFs.
"""

import io
import json
import os
import sys

DIRS = ("Tender Notice_PDFs", "Contract_Awards_PDFs")
OUT = "pdf_manifest.json"


def main():
    dirs, total = {}, 0
    for d in DIRS:
        if not os.path.isdir(d):
            sys.stderr.write("make_pdf_manifest: %s not found — run this from the "
                             "repository root.\n" % d)
            raise SystemExit(1)
        names = sorted(n for n in os.listdir(d) if n.lower().endswith(".pdf"))
        dirs[d] = names
        total += len(names)

    io.open(OUT, "w", encoding="utf-8").write(
        json.dumps({"dirs": dirs, "count": total}, ensure_ascii=False))
    kb = os.path.getsize(OUT) / 1024.0
    print("wrote %s — %d PDFs in %d directories, %.0f KB"
          % (OUT, total, len(dirs), kb))
    for d in DIRS:
        print("  %-22s %d" % (d, len(dirs[d])))


if __name__ == "__main__":
    main()
