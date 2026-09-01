#!/usr/bin/env python3
"""Runs the whole pipeline, in order, and stops at the first failure.

    python3 -P investigation/scripts/run_pipeline.py            # all nine steps
    python3 -P investigation/scripts/run_pipeline.py --from 5   # analysis onward
    python3 -P investigation/scripts/run_pipeline.py --only 4   # the audit alone
    python3 -P investigation/scripts/run_pipeline.py --dry-run  # print the plan

Each step is a separate interpreter, launched with -P. That flag is the reason this
script exists at all: a module named pytesseract.py sits in the repository root, and
without -P it shadows the real package and an older extraction routine runs in place
of this pipeline's. Running the stages by hand is one forgotten flag away from a
silently different dataset.

The audit is step 4. Its own report is read after it runs and its pass/fail line is
printed here, so a regression is visible without opening a JSON file. A failed audit
stops the run: nothing downstream of it should be published.
"""

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "investigation" / "data"

# step number, path, what it does. Each step's own time is measured and printed as it
# runs; none is estimated here.
STEPS = [
    (1, "investigation/parser/01_inventory.py",
     "find and hash every PDF, extract every page twice"),
    (2, "investigation/parser/02_extract.py",
     "read named fields, clauses, lots, amendments, dates, money"),
    (3, "investigation/parser/03_dataset.py",
     "write the eighteen tables and the master dataset"),
    (4, "investigation/parser/03_audit.py",
     "check the dataset against itself and an earlier parser"),
    (5, "investigation/parser/04_analysis.py",
     "compute every finding and every aggregate"),
    (6, "investigation/parser/05_evidence.py",
     "check every cited value against the page it is cited from"),
    (7, "investigation/parser/06_search.py",
     "build the search index and the per-document page files"),
    (8, "investigation/scripts/split_payload.py",
     "lift the long row lists out, write the file the article loads"),
    (9, "investigation/scripts/build_documentation.py",
     "write the data dictionary and the search reference"),
]


def run(step, path, label):
    print("\n\033[1m%d/%d  %s\033[0m  — %s" % (step, len(STEPS), path, label))
    started = time.time()
    r = subprocess.run([sys.executable, "-P", str(ROOT / path)], cwd=str(ROOT))
    took = time.time() - started
    if r.returncode != 0:
        print("\n%s exited %d after %.0f s. Stopping here: every later step reads "
              "what this one writes." % (path, r.returncode, took))
        return False
    print("   done in %.1f s" % took)
    return True


def audit_verdict():
    """The audit's own numbers, read back out of the report it just wrote."""
    path = DATA / "audit_report.json"
    if not path.exists():
        print("   audit_report.json was not written")
        return False
    a = json.loads(path.read_text())
    failed = a.get("checks_failed") or []
    n = len(failed) if isinstance(failed, list) else int(failed)
    print("   audit: %d checks run, %d failed; %s award cells compared with the "
          "earlier parser"
          % (a.get("checks_run", 0), n,
             f"{a.get('award_cells_compared_with_the_earlier_parser', 0):,}"))
    if n:
        for f in (failed if isinstance(failed, list) else []):
            print("   FAIL %s" % f)
        print("\nThe audit failed. Nothing downstream of it should be published.")
        return False
    return True


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--from", dest="start", type=int, default=1, metavar="N")
    p.add_argument("--to", dest="end", type=int, default=len(STEPS), metavar="N")
    p.add_argument("--only", type=int, metavar="N")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()
    if args.only:
        args.start = args.end = args.only
    plan = [s for s in STEPS if args.start <= s[0] <= args.end]
    if not plan:
        print("no step in that range; steps are 1..%d" % len(STEPS))
        return 2

    print("\033[1mThe e-GP archive pipeline\033[0m — %d of %d steps, in order.\n"
          % (len(plan), len(STEPS)))
    for step, path, label in plan:
        print("  %d  %-44s %s" % (step, path.split("/", 2)[-1], label))
    if args.dry_run:
        return 0

    started = time.time()
    for step, path, label in plan:
        if not run(step, path, label):
            return 1
        if step == 4 and not audit_verdict():
            return 1
    print("\n\033[1mAll %d steps finished in %.0f s.\033[0m" % (len(plan),
                                                               time.time() - started))
    if plan[-1][0] >= 8:
        print("Serve the repository root and open http://localhost:8123/ — the entry "
              "document is index.html beside this folder:\n\n"
              "    python3 -m http.server 8123\n")
    else:
        print("Steps %d..%d were not run. Anything reading what they write is now "
              "older than what you just built." % (plan[-1][0] + 1, len(STEPS)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
