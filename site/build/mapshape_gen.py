#!/usr/bin/env python3
"""Emit site/scripts/mapshape.js from a real district boundary file.

WHAT THIS READS, AND WHY IT IS ALLOWED TO
-----------------------------------------
Every figure in this investigation comes from the supplied procurement PDFs and
from nothing else. Boundary geometry is the one exception, and it is an exception
the editor asked for twice, in writing: use the proper Bangladesh map. There is
no boundary file in the folder -- no shapefile, no GeoJSON, no vector coastline
inside any of the 1,805 documents -- so the outline was drawn by hand for months
and said so on the page. A drawing is not a map, and the editor was right.

So the districts here come from geo/bgd-adm2-districts.geojson: the geoBoundaries
gbOpen release for Bangladesh at ADM2, which traces to the Bangladesh Bureau of
Statistics and OCHA ROAP, published under CC BY 4.0. It is vendored into this
repository beside this script -- sha256
7dbdb186f3b8af10417147a99859196fcd89c619fb5c6ac3804251fb6b449b6a -- so the page
still contacts no network host and the build still runs offline.

The exception is scoped to the outline and stops there. Not one number in this
investigation is computed from this geometry. No area, no distance, no
neighbourhood, no spatial join. The map answers "roughly where"; the notices
answer everything else. The district on every shaded area is the district those
notices print, matched to a boundary by name through PRINTED below, and a name
that does not match is a build failure rather than a guess.

WHAT IT WRITES
--------------
DISTRICTS  64 areas, each one or more rings of flat [x, y, ...] in a projected px
           box. Rings are simplified, so a border here is accurate to about half
           a pixel at the size the page draws it and to nothing finer.
PRINTED    every district spelling the notices actually print, mapped to the
           boundary name it belongs to. Two entries collapse: Chattogram and
           Chittagong are one district under two spellings, and Laksmipur is the
           notices' spelling of Lakshmipur. Nothing else is merged -- similar
           names are not evidence of the same place.
SITES      one point per authority, at the centroid of the district its own
           notices print most often, read from corpus.json rather than typed.
MAP_BOX    the projected bounding box, so the renderer can scale to any width.

Longitude is squeezed by cos(24 deg) so the country keeps its proportions
instead of stretching east to west; the constants are unchanged from the
hand-drawn version this replaces, and the real bbox lands inside the same box.
"""

import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "scripts" / "mapshape.js"
GEO = HERE / "geo" / "bgd-adm2-districts.geojson"
CORPUS = HERE.parent / "data" / "corpus.json"

LON0, LAT0 = 88.0, 26.66
KX = 77.7   # 85 * cos(24 deg), so a degree of longitude is drawn shorter
KY = 85.0

TOL = 0.6      # Douglas-Peucker tolerance, in projected px
AREA_MIN = 1.5  # a ring smaller than this draws as a dot, not an island

# Every district spelling that appears in pe_district, mapped to the name it
# carries in the boundary file. Authored by hand and asserted below: a spelling
# the notices print that is missing here fails the build.
PRINTED = {
    "Dhaka": "Dhaka",
    "Chattogram": "Chittagong",     # the current name of the same district
    "Chittagong": "Chittagong",     # the older spelling, still printed
    "Cox's Bazar": "Cox's Bazar",
    "Khulna": "Khulna",
    "Rajshahi": "Rajshahi",
    "Gazipur": "Gazipur",
    "Dinajpur": "Dinajpur",
    "Comilla": "Comilla",
    "Satkhira": "Satkhira",
    "Barisal": "Barisal",
    "Laksmipur": "Lakshmipur",      # the notices' spelling
    "Sirajganj": "Sirajganj",
    "Pabna": "Pabna",
}


def xy(lon, lat):
    return ((lon - LON0) * KX, (LAT0 - lat) * KY)


def geom_rings(gm):
    """Outer ring of every polygon. Holes are dropped: no district in this file
    encloses another, and a hole at this simplification would be a sliver."""
    polys = [gm["coordinates"]] if gm["type"] == "Polygon" else gm["coordinates"]
    return [[xy(*c) for c in poly[0]] for poly in polys]


def ring_area(r):
    a = 0.0
    for i in range(len(r)):
        x1, y1 = r[i]
        x2, y2 = r[(i + 1) % len(r)]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2


def ring_centroid(r):
    a = cx = cy = 0.0
    for i in range(len(r)):
        x1, y1 = r[i]
        x2, y2 = r[(i + 1) % len(r)]
        f = x1 * y2 - x2 * y1
        a += f
        cx += (x1 + x2) * f
        cy += (y1 + y2) * f
    return (cx / (3 * a), cy / (3 * a)) if a else r[0]


def point_in(x, y, ring):
    """Even-odd test, used only as a build-time check that a mark falls inside
    the district it is meant to stand in."""
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


def simplify(pts, tol):
    """Douglas-Peucker, iterative so a 900-vertex coastline cannot blow the
    stack. Run in projected px, which is the space the border is drawn in."""
    if len(pts) < 4:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        if b <= a + 1:
            continue
        x1, y1 = pts[a]
        x2, y2 = pts[b]
        dx, dy = x2 - x1, y2 - y1
        span = math.hypot(dx, dy)
        far, at = -1.0, -1
        for i in range(a + 1, b):
            x, y = pts[i]
            d = (abs(dx * (y1 - y) - dy * (x1 - x)) / span if span
                 else math.hypot(x - x1, y - y1))
            if d > far:
                far, at = d, i
        if far > tol:
            keep[at] = True
            stack.append((a, at))
            stack.append((at, b))
    return [pts[i] for i in range(len(pts)) if keep[i]]


def quantize(pts):
    """One decimal place, then drop the vertices that rounding made identical
    and the closing vertex, which SVG's polygon closes for us."""
    out = []
    for x, y in pts:
        p = (round(x, 1), round(y, 1))
        if not out or p != out[-1]:
            out.append(p)
    if len(out) > 1 and out[0] == out[-1]:
        out.pop()
    return out


HEADER = '''/* ------------------------------------------------------------------ map shape
   The districts of Bangladesh, and one mark for each of the six authorities.

   Where this geometry comes from has to be said plainly, because everywhere else
   on this page the supplied procurement documents are the only source. There is
   no boundary file among them: no shapefile, no GeoJSON, no vector coastline
   inside any of the {PDFS} PDFs. The three reference reports were each opened and
   checked for one, and the largest carries its geography as a table of city
   corporation names. So the outline here was fetched from outside — the
   geoBoundaries gbOpen release for Bangladesh at ADM2, which traces to the
   Bangladesh Bureau of Statistics and OCHA ROAP, under CC BY 4.0 — on the
   editor's instruction to use the proper map rather than the schematic drawn by
   hand that stood here before. The file is vendored into the repository at
   build/geo/, so the page still contacts no network host.

   That exception covers the outline and nothing else. Not one figure in this
   investigation is computed from this geometry — no area, no distance, no
   neighbour, no spatial join. The district on every shaded area is the district
   the notices print, matched to a boundary by name; the count is the notices'.
   The map says roughly where. The documents say everything else.

   Generated by build/mapshape_gen.py. Edit that, not this. */

/* {AREAS} areas, {RINGS} rings, {PTS} vertices in a {W} × {H} box, simplified to
   about half a pixel at the size the page draws them. `p` holds one flat
   [x, y, x, y, …] ring per island, largest first; SVG closes each one. */
'''


def main():
    geo = json.loads(GEO.read_text(encoding="utf-8"))
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))

    shapes = {}
    for f in geo["features"]:
        name = f["properties"]["shapeName"]
        if name in shapes:
            raise SystemExit("two features named %r in %s" % (name, GEO.name))
        rings = sorted(geom_rings(f["geometry"]), key=ring_area, reverse=True)
        shapes[name] = rings

    # Every spelling the notices print, from both places the corpus carries them.
    spelled = {d["key"] for d in corpus["districts"]}
    spelled |= {p["key"] for r in corpus["authority"]["rows"]
                for p in r.get("printed") or []}
    spelled.discard("BLANK")

    missing = sorted(s for s in spelled if s not in PRINTED)
    if missing:
        raise SystemExit(
            "these district spellings are printed in the notices but PRINTED in "
            "%s does not say which boundary they belong to: %s\n"
            "Add each one by hand. Do not guess, and do not match on spelling."
            % (Path(__file__).name, ", ".join(missing)))
    unknown = sorted({v for v in PRINTED.values() if v not in shapes})
    if unknown:
        raise SystemExit("PRINTED points at names the boundary file does not "
                         "carry: %s" % ", ".join(unknown))
    stale = sorted(k for k in PRINTED if k not in spelled)

    # One mark per authority, at the centroid of the district its own notices
    # print most often. The district is the document's; the point is the
    # boundary file's. Neither is typed here.
    sites = []
    for row in corpus["authority"]["rows"]:
        printed = row["district"]
        ring = shapes[PRINTED[printed]][0]
        cx, cy = ring_centroid(ring)
        sites.append((row["key"], printed, PRINTED[printed],
                      round(cx, 1), round(cy, 1), point_in(cx, cy, ring)))

    kept, drawn = {}, 0
    for name, rings in shapes.items():
        keep = [r for r in rings if ring_area(r) >= AREA_MIN] or rings[:1]
        out = [quantize(simplify(r, TOL)) for r in keep]
        out = [r for r in out if len(r) >= 3]
        if not out:
            raise SystemExit("simplification emptied %s" % name)
        kept[name] = out
        drawn += sum(len(r) for r in out)

    xs = [x for rs in kept.values() for r in rs for x, _ in r]
    ys = [y for rs in kept.values() for r in rs for _, y in r]
    w = math.ceil(max(xs)) + 2
    h = math.ceil(max(ys)) + 3

    lines = [HEADER
             .replace("{PDFS}", "{:,}".format(corpus["counts"]["pdfs"]))
             .replace("{AREAS}", str(len(kept)))
             .replace("{RINGS}", str(sum(len(rs) for rs in kept.values())))
             .replace("{PTS}", "{:,}".format(drawn))
             .replace("{W}", str(w)).replace("{H}", str(h))]

    lines.append("export const DISTRICTS = [")
    for name in sorted(kept):
        lines.append('  { key: %s, p: [' % json.dumps(name))
        for ring in kept[name]:
            flat = ["%s,%s" % (fmt(x), fmt(y)) for x, y in ring]
            row, body = "    [", []
            for i, pair in enumerate(flat):
                add = pair + ("" if i == len(flat) -1 else ", ")
                if len(row) + len(add) > 76:
                    body.append(row.rstrip())
                    row = "     "
                row += add
            body.append(row + "],")
            lines.extend(body)
        lines.append("  ] },")
    lines.append("];")
    lines.append("")

    lines.append("/* Every district spelling the notices print, and the boundary it belongs to.")
    lines.append("   Chattogram and Chittagong are one district under two spellings and")
    lines.append("   Laksmipur is the notices' spelling of Lakshmipur; nothing else collapses.")
    lines.append("   A spelling missing from here fails the build rather than the map. */")
    lines.append("export const PRINTED = {")
    for printed in sorted(PRINTED, key=lambda k: (PRINTED[k], k)):
        lines.append("  %s: %s," % (json.dumps(printed), json.dumps(PRINTED[printed])))
    lines.append("};")
    lines.append("")

    lines.append("/* One point per authority, at the centroid of the district its own notices")
    lines.append("   print most often. The district is the document's; the centroid is the")
    lines.append("   boundary file's. */")
    lines.append("export const SITES = {")
    for key, printed, shape, x, y, _ in sites:
        note = "" if printed == shape else "   /* printed %s */" % printed
        lines.append("  %s: [%s, %s],%s" % (key, fmt(x), fmt(y), note))
    lines.append("};")
    lines.append("")
    lines.append("export const MAP_BOX = [%d, %d];" % (w, h))
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")

    print("wrote %s  box %d x %d" % (OUT.name, w, h))
    print("  %d districts, %d rings, %d vertices, %.0f KB"
          % (len(kept), sum(len(rs) for rs in kept.values()), drawn,
             OUT.stat().st_size / 1024))
    print("  %d spellings printed in the notices, all matched" % len(spelled))
    if stale:
        print("  note: PRINTED carries %d spelling(s) the notices no longer "
              "print: %s" % (len(stale), ", ".join(stale)))
    close = []
    for i in range(len(sites)):
        for j in range(i + 1, len(sites)):
            d = math.dist(sites[i][3:5], sites[j][3:5])
            if d < 20:
                close.append("%s/%s %.0fpx" % (sites[i][0], sites[j][0], d))
    for key, printed, shape, x, y, ok in sites:
        print("  %-6s [%6s, %6s]  %-12s inside: %s"
              % (key, fmt(x), fmt(y), shape, ok))
        if not ok:
            raise SystemExit("%s's mark falls outside %s" % (key, shape))
    if close:
        raise SystemExit("marks overlap at 14px: " + ", ".join(close))


def fmt(v):
    return str(int(v)) if float(v) == int(v) else str(v)


if __name__ == "__main__":
    main()
