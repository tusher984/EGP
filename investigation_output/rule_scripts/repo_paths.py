# -*- coding: utf-8 -*-
"""Where the repository is, worked out from where this file is.

Every script in this folder was first written with the absolute path of the
machine it ran on. That made the folder unrunnable anywhere else, which defeats
the point of shipping the scripts at all: the site tells a reader the analysis
can be re-run and checked rather than taken on trust, and it can only be re-run
if the paths resolve on their machine.

This module holds the two paths the scripts need and nothing else. It derives
them from its own location -- rule_scripts sits at <repo>/investigation_output/
rule_scripts -- and lets an environment variable override that for the case
where the CSVs and the PDFs are not in the same tree.

    EGP_REPO   the folder holding the PDF directories
    EGP_OUT    the folder holding the CSV deliverables
    EGP_CACHE  scratch space for extracted page text
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.environ.get("EGP_REPO") or os.path.dirname(os.path.dirname(HERE))
OUT = os.environ.get("EGP_OUT") or os.path.join(REPO, "investigation_output")
CACHE = os.environ.get("EGP_CACHE") or os.path.join(
    os.environ.get("TMPDIR") or "/tmp", "egp_pagetext")

# The extracted page text, kept in the repository because the environment the
# analysis now runs in has no PDF text extractor installed. Keyed
# "dir/file.pdf" -> [{"n": page number, "text": page text}].
PAGES_JSON = os.path.join(REPO, "investigation", "data", "raw_pages.json")


def check():
    """Fail loudly and usefully rather than three frames deep in csv.reader."""
    for name, p in (("EGP_REPO", REPO), ("EGP_OUT", OUT)):
        if not os.path.isdir(p):
            raise SystemExit(
                "%s does not exist: %s\nSet %s to the right folder and run again."
                % (name, p, name))
    return REPO, OUT


# --------------------------------------------------------------- page text
# The checks that matter most re-read the PDF and look for the excerpt on the
# page the CSV cites. That needs page text. pdftotext is used when it is
# installed; where it is not, the text comes from the cache in the repository,
# which is the same extraction the analysis itself ran on. Which of the two
# answered is recorded, because a verification that silently changed its source
# of truth is not a verification.

SOURCE = {"pdftotext": 0, "cache": 0, "missing": 0}
_CACHED = None


def _from_json(key):
    global _CACHED
    if _CACHED is None:
        if not os.path.exists(PAGES_JSON):
            _CACHED = {}
        else:
            import json
            with open(PAGES_JSON, encoding="utf-8") as fh:
                _CACHED = json.load(fh)
    got = _CACHED.get(key)
    if not got:
        return None
    # Page numbers are 1-based and every page is present, so the list index is
    # n-1; it is built by position rather than trusted to be sorted.
    out = [""] * max(int(p["n"]) for p in got)
    for p in got:
        out[int(p["n"]) - 1] = p.get("text") or ""
    return out


def page_text(d, f):
    """The pages of one PDF as a list of strings, page 1 first. [] if unknown.

    Callers pass the directory and the file separately in some places and a
    path that already carries its directory in others, so the two are joined
    with the empty parts dropped rather than with os.path.join, which would
    leave a leading separator and miss the cache key by one character."""
    if not f:
        return []
    key = "/".join(x.strip("/") for x in (d or "", f) if x and x.strip("/"))
    src = os.path.join(REPO, *key.split("/"))
    if os.path.exists(src):
        os.makedirs(CACHE, exist_ok=True)
        import re as _re
        import subprocess
        cp = os.path.join(CACHE, _re.sub(r"[^A-Za-z0-9._-]", "_", key) + ".txt")
        if not os.path.exists(cp):
            try:
                subprocess.run(["pdftotext", "-layout", src, cp],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except (OSError, ValueError):
                pass
        if os.path.exists(cp):
            SOURCE["pdftotext"] += 1
            return open(cp, encoding="utf-8", errors="replace").read().split("\f")
    got = _from_json(key)
    if got:
        SOURCE["cache"] += 1
        return got
    SOURCE["missing"] += 1
    return []


def page_source_line():
    return ("page text: %d PDFs read with pdftotext, %d from %s, %d not found"
            % (SOURCE["pdftotext"], SOURCE["cache"],
               os.path.relpath(PAGES_JSON, REPO), SOURCE["missing"]))

