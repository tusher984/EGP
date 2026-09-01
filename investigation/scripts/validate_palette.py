"""Check a categorical palette instead of eyeballing it.

Five checks, all arithmetic, so the answer is the same every time anyone runs it:

  lightness band   every hue sits in a narrow OKLab L range, so no series reads
                   as "the important one" merely by being darker
  chroma floor     every hue is actually coloured, not a near-grey that reads as
                   the axis
  CVD separation   adjacent hues stay apart under protanopia, deuteranopia and
                   tritanopia, simulated with the Machado 2009 severity-1.0
                   matrices; distance is OKLab dE x100, floor 8
  normal vision    adjacent hues are far apart for a reader with full colour
                   vision too, floor 15
  contrast         every hue carries at least 3:1 against the page it is drawn
                   on, so a thin mark is still visible

    python -P investigation/scripts/validate_palette.py "#1d4e5f,#b0521f,..." "#f8f7f4"
"""
import sys

CVD = {
    "protanopia": ((0.152286, 1.052583, -0.204868),
                   (0.114503, 0.786281, 0.099216),
                   (-0.003882, -0.048116, 1.051998)),
    "deuteranopia": ((0.367322, 0.860646, -0.227968),
                     (0.280085, 0.672501, 0.047413),
                     (-0.011820, 0.042940, 0.968881)),
    "tritanopia": ((1.255528, -0.076749, -0.178779),
                   (-0.078411, 0.930809, 0.147602),
                   (0.004733, 0.691367, 0.303900)),
}


def rgb(h):
    h = h.strip().lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lin(hexcode):
    return tuple(linear(c) for c in rgb(hexcode))


def oklab(l):
    r, g, b = l
    m = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b,
         0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b,
         0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    s = tuple((v ** (1 / 3)) if v > 0 else -((-v) ** (1 / 3)) for v in m)
    return (0.2104542553 * s[0] + 0.7936177850 * s[1] - 0.0040720468 * s[2],
            1.9779984951 * s[0] - 2.4285922050 * s[1] + 0.4505937099 * s[2],
            0.0259040371 * s[0] + 0.7827717662 * s[1] - 0.8086757660 * s[2])


def simulate(l, kind):
    m = CVD[kind]
    return tuple(max(0.0, min(1.0, sum(m[i][j] * l[j] for j in range(3))))
                 for i in range(3))


def distance(a, b):
    return 100 * sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def luminance(l):
    return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]


def contrast(a, b):
    x, y = sorted((luminance(a), luminance(b)))
    return (y + 0.05) / (x + 0.05)


def unlinear(c):
    c = max(0.0, min(1.0, c))
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


def to_hex(lab):
    """OKLab back to an sRGB hex, clipped. Used to restep a palette for dark mode
    at the same hue angles, so the separations that passed in light mode hold."""
    l, a, b = lab
    s = (l + 0.3963377774 * a + 0.2158037573 * b,
         l - 0.1055613458 * a - 0.0638541728 * b,
         l - 0.0894841775 * a - 1.2914855480 * b)
    m = tuple(v ** 3 for v in s)
    r = (4.0767416621 * m[0] - 3.3077115913 * m[1] + 0.2309699292 * m[2],
         -1.2684380046 * m[0] + 2.6097574011 * m[1] - 0.3413193965 * m[2],
         -0.0041960863 * m[0] - 0.7034186147 * m[1] + 1.7076147010 * m[2])
    return "#" + "".join(f"{round(unlinear(v) * 255):02x}" for v in r)


def restep(hexes, target_l, chroma_scale=1.0):
    out = []
    for h in hexes:
        l, a, b = oklab(lin(h))
        out.append(to_hex((target_l, a * chroma_scale, b * chroma_scale)))
    return out


def report(hexes, surface, low=0.35, high=0.68):
    ok = True
    labs = [oklab(lin(h)) for h in hexes]
    ls = [round(a[0], 3) for a in labs]
    chroma = [round((a[1] ** 2 + a[2] ** 2) ** 0.5, 3) for a in labs]
    print(f"{'hue':<10}{'L':>7}{'chroma':>9}{'contrast':>10}")
    for h, l, c in zip(hexes, ls, chroma):
        k = contrast(lin(h), lin(surface))
        flag = "" if (low <= l <= high and c >= 0.045 and k >= 3.0) else "  <-- check"
        if flag:
            ok = False
        print(f"{h:<10}{l:>7}{c:>9}{k:>9.2f}{flag}")
    print(f"\nlightness band {min(ls)} to {max(ls)} "
          f"(spread {round(max(ls) - min(ls), 3)}, wants <= 0.22)")
    if max(ls) - min(ls) > 0.22:
        ok = False
        print("  FAIL band too wide")
    print("\nadjacent pairs")
    print(f"{'pair':<24}{'normal':>8}{'prot':>8}{'deut':>8}{'trit':>8}")
    for i in range(len(hexes) - 1):
        a, b = lin(hexes[i]), lin(hexes[i + 1])
        d = [distance(oklab(a), oklab(b))]
        for kind in ("protanopia", "deuteranopia", "tritanopia"):
            d.append(distance(oklab(simulate(a, kind)), oklab(simulate(b, kind))))
        bad = d[0] < 15 or min(d[1:]) < 8
        if bad:
            ok = False
        print(f"{hexes[i] + '/' + hexes[i + 1]:<24}"
              + "".join(f"{v:>8.1f}" for v in d) + ("  FAIL" if bad else ""))
    print("\nPASS" if ok else "\nFAIL")
    return ok


if __name__ == "__main__":
    hexes = [h for h in sys.argv[1].split(",") if h.strip()]
    surface = sys.argv[2] if len(sys.argv) > 2 else "#ffffff"
    dark = "--dark" in sys.argv
    if "--restep" in sys.argv:
        at = sys.argv.index("--restep")
        target = float(sys.argv[at + 1])
        scale = float(sys.argv[at + 2]) if len(sys.argv) > at + 2 else 1.0
        hexes = restep(hexes, target, scale)
        print("restepped:", ",".join(hexes), "\n")
    band = (0.62, 0.86) if dark else (0.35, 0.68)
    sys.exit(0 if report(hexes, surface, *band) else 1)
