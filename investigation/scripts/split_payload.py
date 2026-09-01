#!/usr/bin/env python3
"""Split analysis.json into what the page needs at boot and what it needs on demand.

04_analysis.py writes one file, analysis.json, and that file is the investigation's
own record: every finding, every aggregate, and the two long row lists the section
explorers page through — 3,239 eligibility clauses with their full printed text, and
one row per tender in the signals ledger. Together those two lists are nine tenths of
the file.

A reader who opens the article should not download them to read a paragraph. This
script writes three files out of the one:

    data/story.json             every finding and every aggregate, no long lists
    data/eligibility_rows.json  the 3,239 clauses
    data/signals_rows.json      the per-tender ledger

Nothing is recomputed here and no number is touched: the rows are moved, not edited,
and story.json records how many were moved and where they went, so the split is
visible in the file rather than hidden in this script. analysis.json itself is left
in place unchanged, because it is what the downloads section hands over.

Run after 04_analysis.py:  python3 -P investigation/scripts/split_payload.py
"""

import json
import pathlib
import sys

DATA = pathlib.Path("investigation/data")
SRC = DATA / "analysis.json"

# (section, key, file it moves to) — every long list the page loads on demand
MOVES = [
    ("eligibility", "rows", "eligibility_rows.json"),
    ("signals", "rows", "signals_rows.json"),
]


def kb(path):
    return f"{path.stat().st_size / 1024:,.0f} KB"


def main():
    if not SRC.exists():
        sys.exit(f"{SRC} is not there; run investigation/parser/04_analysis.py first")
    whole = json.loads(SRC.read_text(encoding="utf-8"))

    for section, key, name in MOVES:
        rows = whole.get(section, {}).pop(key, None)
        if rows is None:
            sys.exit(f"analysis.json has no {section}.{key}; the split is out of date "
                     f"with 04_analysis.py and would drop data silently")
        out = DATA / name
        out.write_text(json.dumps({
            "moved_from": f"analysis.json {section}.{key}",
            "rows": len(rows),
            "read_this_with": "investigation/data/story.json, which holds every number "
                              "worked out from these rows",
            key: rows,
        }, ensure_ascii=False), encoding="utf-8")
        whole[section][f"{key}_count"] = len(rows)
        whole[section][f"{key}_are_in"] = f"data/{name}"
        print(f"  {out}  {len(rows):,} rows  {kb(out)}")

    story = DATA / "story.json"
    story.write_text(json.dumps(whole, ensure_ascii=False), encoding="utf-8")
    print(f"  {story}  {kb(story)}   (analysis.json, {kb(SRC)}, left as written)")


if __name__ == "__main__":
    main()
