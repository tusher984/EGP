#!/usr/bin/env python3
"""Emit site/scripts/mapshape.js.

The polygons are authored here in degrees of longitude and latitude so that
adjacent divisions can share named junction points exactly -- a shared vertex is
what lets one page-colour stroke open the 2px gap between two fills instead of a
hole appearing between them. Longitude is squeezed by cos(24 deg) so the drawing
keeps the country's proportions instead of stretching it east-west.

This is a drawing, not a survey, and nothing in the investigation is computed
from it. The header this script writes into the module says so on the page's
behalf.
"""

import math
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "scripts" / "mapshape.js"

LON0, LAT0 = 88.0, 26.66
KX = 77.7   # 85 * cos(24 deg), so a degree of longitude is drawn shorter
KY = 85.0


def xy(lon, lat):
    return (round((lon - LON0) * KX, 1), round((LAT0 - lat) * KY, 1))


# ---------------------------------------------------------------- junctions
# Points where three or more divisions meet, or where an internal border meets
# the national outline. Named so every ring that touches one uses the same pair.
J = {
    "nw_tip":  (88.35, 26.62),   # the Tetulia neck, the country's north point
    "rang_rajs_w": (88.42, 25.22),
    "rang_rajs_mym": (89.70, 25.08),
    "rang_mym": (89.88, 25.32),
    "mym_syl_n": (91.02, 25.18),
    "mym_syl": (91.05, 24.95),
    "mym_dha_syl": (91.00, 24.62),
    "mym_dha_1": (90.72, 24.70),
    "mym_dha_2": (90.35, 24.75),
    "rajs_mym_dha": (89.95, 24.82),
    "rajs_dha_1": (89.92, 24.45),
    "rajs_dha_2": (89.78, 24.12),
    "rajs_dha_khu": (89.45, 23.90),
    "rajs_khu_1": (89.05, 24.02),
    "rajs_khu_w": (88.72, 24.05),
    "khu_dha_1": (89.42, 23.55),
    "khu_dha_2": (89.62, 23.15),
    "khu_dha_bar": (89.80, 22.78),
    "khu_bar_c": (89.88, 22.40),
    "dha_bar_1": (90.20, 22.85),
    "dha_bar_cht": (90.62, 22.98),
    "dha_cht_1": (90.70, 23.32),
    "dha_cht_2": (90.78, 23.68),
    "dha_cht_3": (90.85, 24.02),
    "dha_syl_cht": (91.02, 24.30),
    "syl_cht_1": (91.35, 24.20),
    "syl_cht_2": (91.70, 24.15),
    "syl_cht_e": (92.05, 24.12),
    "bar_cht_1": (90.75, 22.65),
    "bar_cht_c": (90.88, 22.32),
}


def P(*names_or_pts):
    out = []
    for v in names_or_pts:
        out.append(J[v] if isinstance(v, str) else v)
    return out


DIVISIONS = [
    ("rangpur", "Rangpur", "রংপুর", (89.10, 25.72), P(
        "nw_tip", (88.65, 26.55), (88.78, 26.28), (89.05, 26.32), (89.32, 26.30),
        (89.62, 26.28), (89.85, 25.95), (89.82, 25.62), "rang_mym",
        "rang_rajs_mym", (89.00, 25.15), "rang_rajs_w",
        (88.32, 25.65), (88.28, 26.00), (88.22, 26.30))),

    ("mymensingh", "Mymensingh", "ময়মনসিংহ", (90.32, 25.02), P(
        "rang_mym", (90.08, 25.28), (90.45, 25.20), (90.78, 25.18), "mym_syl_n",
        "mym_syl", "mym_dha_syl", "mym_dha_1", "mym_dha_2", "rajs_mym_dha",
        "rang_rajs_mym")),

    ("sylhet", "Sylhet", "সিলেট", (91.72, 24.70), P(
        "mym_syl_n", (91.38, 25.20), (91.92, 25.18), (92.12, 25.02),
        (92.38, 24.88), (92.50, 24.58), (92.32, 24.25), "syl_cht_e",
        "syl_cht_2", "syl_cht_1", "dha_syl_cht", "mym_dha_syl", "mym_syl")),

    ("rajshahi", "Rajshahi", "রাজশাহী", (89.15, 24.62), P(
        "rang_rajs_w", (89.00, 25.15), "rang_rajs_mym", "rajs_mym_dha",
        "rajs_dha_1", "rajs_dha_2", "rajs_dha_khu", "rajs_khu_1", "rajs_khu_w",
        (88.38, 24.35), (88.05, 24.62), (88.12, 24.92))),

    ("dhaka", "Dhaka", "ঢাকা", (89.95, 23.42), P(
        "rajs_mym_dha", "mym_dha_2", "mym_dha_1", "mym_dha_syl",
        "dha_syl_cht", "dha_cht_3", "dha_cht_2", "dha_cht_1", "dha_bar_cht",
        "dha_bar_1", "khu_dha_bar", "khu_dha_2", "khu_dha_1",
        "rajs_dha_khu", "rajs_dha_2", "rajs_dha_1")),

    ("khulna", "Khulna", "খুলনা", (89.18, 22.32), P(
        "rajs_khu_w", "rajs_khu_1", "rajs_dha_khu", "khu_dha_1", "khu_dha_2",
        "khu_dha_bar", "khu_bar_c", (89.95, 21.88), (89.60, 21.68),
        (89.25, 21.62), (89.05, 21.80), (88.98, 22.15), (88.80, 22.45),
        (88.88, 22.75), (88.72, 23.18), (88.58, 23.72))),

    ("barishal", "Barishal", "বরিশাল", (90.32, 22.48), P(
        "khu_dha_bar", "dha_bar_1", "dha_bar_cht", "bar_cht_1", "bar_cht_c",
        (90.78, 22.05), (90.62, 21.85), (90.25, 21.78), (89.98, 21.88),
        "khu_bar_c")),

    ("chattogram", "Chattogram", "চট্টগ্রাম", (91.28, 23.55), P(
        "dha_syl_cht", "syl_cht_1", "syl_cht_2", "syl_cht_e", (91.95, 23.88),
        (91.55, 23.60), (91.42, 23.32), (91.95, 23.22), (92.22, 23.18),
        (92.62, 22.55), (92.58, 22.10), (92.35, 21.35), (92.28, 20.88),
        (92.32, 20.62), (92.10, 21.15), (91.92, 21.62), (91.82, 22.20),
        (91.58, 22.55), (91.32, 22.72), (91.02, 22.55), "bar_cht_c",
        "bar_cht_1", "dha_bar_cht", "dha_cht_1", "dha_cht_2", "dha_cht_3")),
]

# One point per authority, in the district its own notices print most often.
# Nudged off a coastline or off a neighbour where two marks would otherwise
# overlap, because a mark that straddles a drawn border reads as neither side.
SITES = [
    ("RDA", 88.75, 24.40),
    ("GDA", 90.45, 24.10),
    ("RAJUK", 90.35, 23.68),
    ("KDA", 89.57, 22.82),
    ("CDA", 91.95, 22.30),
    ("COXDA", 92.18, 21.40),
]

HEADER = '''/* ------------------------------------------------------------------ map shape
   The outline of Bangladesh, drawn for this page. What this file is has to be
   said exactly, because the rule this investigation runs on is that the supplied
   documents are its only source — and this geometry is not in them.

   There is no boundary file anywhere in the folder: no shapefile, no GeoJSON, no
   vector map inside any of the 1,809 PDFs. The three reference reports were each
   opened and checked for one. The largest carries its geography as a table of
   city corporation names; the path-heavy pages in the other two are tables and
   bar charts — 357 subpaths inside a box wider than it is tall, not a coastline.
   Nothing was fetched from outside to fill the gap, because nothing may be.

   So these are coarse polygons drawn by hand to be recognisable: one per
   division, plotted from longitude and latitude read off no file but set down by
   hand, with longitude squeezed by cos(24°) so the country keeps its proportions
   instead of stretching east to west. They are a schematic, not a survey. No
   border here is accurate to any distance, and not one figure in this
   investigation is computed from them. The figures come from the notices, and
   the district on every mark is the district those notices print. The outline
   only says roughly where.

   The eight divisions are the frame a reader orients by. The six marks are the
   data. Two of the six bodies sit in one division and two more in another, which
   is why the value is carried by the mark and never by the area: an area cannot
   hold two values honestly.

   Generated by build/mapshape_gen.py, which holds the degrees this was projected
   from and the named junctions the divisions share. Edit that, not this. */

/* Flat [x, y, x, y, …] in a {W} × {H} box. Adjacent divisions share vertices, so
   a stroke in the page surface colour opens the 2px gap between two fills rather
   than a border being drawn between them. `at` is where the division's own name
   sits, chosen to stay clear of every mark. */
'''


def fmt(v):
    return str(int(v)) if float(v) == int(v) else str(v)


def main():
    pts = [xy(*p) for _, _, _, _, ring in DIVISIONS for p in ring]
    w = math.ceil(max(p[0] for p in pts)) + 2
    h = math.ceil(max(p[1] for p in pts)) + 3

    lines = [HEADER.replace("{W}", str(w)).replace("{H}", str(h))]
    lines.append("export const DIVISIONS = [")
    for key, en, bn, at, ring in DIVISIONS:
        ax, ay = xy(*at)
        lines.append('  { key: "%s", en: "%s", bn: "%s", at: [%s, %s],'
                     % (key, en, bn, fmt(ax), fmt(ay)))
        flat = []
        for lon, lat in ring:
            x, y = xy(lon, lat)
            flat.append("%s,%s" % (fmt(x), fmt(y)))
        body, row = [], "    p: ["
        for i, pair in enumerate(flat):
            add = pair + ("" if i == len(flat) - 1 else ", ")
            if len(row) + len(add) > 78:
                body.append(row.rstrip())
                row = "        "
            row += add
        body.append(row + "] },")
        lines.extend(body)
    lines.append("];")
    lines.append("")
    lines.append("/* One point per authority, inside the division its own notices name. The")
    lines.append("   district is the document's; the point on this drawing is ours. */")
    lines.append("export const SITES = {")
    for key, lon, lat in SITES:
        x, y = xy(lon, lat)
        lines.append("  %s: [%s, %s]," % (key, fmt(x), fmt(y)))
    lines.append("};")
    lines.append("")
    lines.append("export const MAP_BOX = [%d, %d];" % (w, h))
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print("wrote %s  box %d x %d  %d divisions  %d sites"
          % (OUT.name, w, h, len(DIVISIONS), len(SITES)))
    for key, en, bn, at, ring in DIVISIONS:
        ax, ay = xy(*at)
        inside = point_in(ax, ay, [xy(*p) for p in ring])
        print("  %-11s %2d pts   label inside: %s" % (key, len(ring), inside))
    ringmap = {key: [xy(*p) for p in ring] for key, _, _, _, ring in DIVISIONS}
    for key, lon, lat in SITES:
        x, y = xy(lon, lat)
        where = [k for k, r in ringmap.items() if point_in(x, y, r)]
        print("  %-6s at [%6s, %6s]  in: %s" % (key, fmt(x), fmt(y), where or "NOWHERE"))


def point_in(x, y, ring):
    """Even-odd test, used only as a build-time check that a label or a mark
    actually falls inside the area it is meant to sit in."""
    inside = False
    n = len(ring)
    for i in range(n):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            xi = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if x < xi:
                inside = not inside
    return inside


if __name__ == "__main__":
    main()
