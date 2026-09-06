/* e-GP WATCH — chart primitives.
   ------------------------------------------------------------------
   A figure here is exactly five things, in this order: title, deck, plot,
   legend, source. Nothing else is drawn. That is the whole brief for charts,
   tables and maps in this publication, and figure() is the only way a chart
   reaches the page, so the shape cannot drift.

   Marks are thin, ends are square (the house set has no radius anywhere),
   fills are separated by a 2px gap in the page surface rather than by a
   stroke, and grid and axis sit well behind the data. Text always wears a text
   token — never the series colour — so a value never depends on hue to be
   read. Every chart also ships a table view: identity is never colour-alone.

   The three categorical hues and the six-step ramp come from tokens.css, where
   they are recorded together with the validator command that passes them. */

import { el, svg, clear, t, n, digits } from "./core.js";
import { DISTRICTS, PRINTED, SITES, MAP_BOX } from "./mapshape.js";

export const HUES = ["var(--hue-1)", "var(--hue-2)", "var(--hue-3)"];
export const SEQ = ["var(--seq-1)", "var(--seq-2)", "var(--seq-3)",
                    "var(--seq-4)", "var(--seq-5)", "var(--seq-6)"];

/* Two canvas widths, because the article's grid gives a figure one of two
   widths: the breakout column at 54rem, which is what CANVAS is drawn for, and
   the full width of the page for the few figures marked wide.

   A chart is drawn on a canvas of fixed units and scaled to its column by the
   viewBox, so the canvas has to match the column or the scaling shows. Stretch
   the 820-unit canvas across the full column and every label is magnified with
   the bars: an 11px category label renders at 16px, larger than the body text
   beside it. Drawn on the wider canvas instead, the label stays 11px and the
   extra width goes where it was wanted — into the length of the bars. */
export const CANVAS = 820;
export const CANVAS_WIDE = 1200;

/** The canvas for a figure marked wide: the width that column will actually
    have, so the drawing is scaled as little as possible and its type stays the
    size it was set at. Measured off the page box rather than computed from the
    numbers in the stylesheet, because that padding changes with the breakpoint.

    CANVAS is the floor. Below it there is nothing to gain — labelW and valueW
    are canvas units chosen for a canvas about that wide, and a narrower one
    would leave no room for the bars — so on a phone a wide figure is scaled
    down to the column exactly as every other figure there is. */
export function wideCanvas() {
  const box = document.querySelector(".wrap");
  if (!box) return CANVAS;
  const pad = getComputedStyle(box);
  const inner = box.clientWidth - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight);
  if (!(inner > 0)) return CANVAS;
  return Math.max(CANVAS, Math.min(CANVAS_WIDE, Math.round(inner)));
}

/** The same measurement without the floor. wideCanvas clamps up to CANVAS because
    a bar chart drawn narrower has no room left for its labels and is scaled down
    to the column instead; the map can be rearranged rather than scaled, and to do
    that it has to know how narrow the column actually is. */
export function columnWidth() {
  const box = document.querySelector(".wrap");
  if (!box) return CANVAS;
  const pad = getComputedStyle(box);
  const inner = box.clientWidth - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight);
  return inner > 0 ? Math.round(inner) : CANVAS;
}

/** The track a figure that is not marked wide is laid out in: the measure plus
    both breakout gutters, which the stylesheet sets at 7 + 40 + 7 rem and lets
    collapse towards the measure when the window has no free space left. Read off
    the root font size rather than written as 864, so a reader who enlarges the
    page gets a drawing sized to the column they actually have.

    A chart that is scaled to its column by the stylesheet does not need this —
    the 5% magnification between the 820 canvas and this track is the compromise
    the stylesheet already makes. The map does need it: its svg is sized in pixels
    so that the type in its key is never scaled, which means the number handed to
    it has to be the width of the column and not an approximation of it. */
export function midColumn() {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return Math.min(columnWidth(), Math.round(54 * rem));
}

/** The canvas for a drawing that is allowed to scroll sideways rather than be
    scaled down — the matrix, whose row labels and tail column are set in type
    that a phone cannot afford to shrink. The column, so that the drawing fills
    the grid and nothing scrolls, until the column falls below the width the
    drawing actually needs; from there the canvas holds at that width and the
    reader gets a scroller instead of five-pixel type.

    `min` is that width, and it belongs to the drawing rather than to the page:
    CANVAS is a floor for a bar chart with a 210-unit label gutter and too high
    for a matrix with a 120-unit one. Passing the floor where the column is only
    a little narrower than it is what put a 32px scroller on an 820px window. */
export function scrollCanvas(min) {
  return Math.max(min, Math.min(CANVAS_WIDE, columnWidth()));
}

/** A hidden tab and a hidden preview pane both stop firing rAF, and a chart
    that never gets its hover layer wired is a chart that looks finished and is
    not. Fall back to a timer, which keeps running either way. */
function requestFrame(fn) {
  if (document.hidden) setTimeout(fn, 0);
  else requestAnimationFrame(fn);
}

/** Round axis stops. Four or five of them, never labelled below the tick. */
function niceTicks(max, count) {
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const out = [];
  for (let v = 0; v <= max + step * 0.001; v += step) out.push(+v.toFixed(6));
  return out;
}


/** Hues are assigned in fixed order and never cycled. Past the third series a
    chart must fold the remainder into one part or facet instead, so asking for
    a fourth hue returns the sequential ramp's darkest step rather than
    inventing a colour that no validator has seen. */
export function hue(i) { return i < HUES.length ? HUES[i] : SEQ[SEQ.length - 1]; }

/* ------------------------------------------------------------------- figure */

export function figure(spec) {
  const kids = [];
  if (spec.title) kids.push(el("h3", { class: "fig-title", text: t(spec.title) }));
  if (spec.deck) kids.push(el("p", { class: "fig-deck", text: t(spec.deck) }));

  const plot = el("div", { class: "fig-plot" }, spec.plot || null);
  kids.push(plot);

  if (spec.legend && spec.legend.length > 1) {
    kids.push(el("ul", { class: "legend" }, spec.legend.map((s) =>
      el("li", null, [
        el("span", { class: "swatch" + (s.edge ? " swatch-edge" : ""),
          style: "background:" + s.color }),
        t(s.label),
      ])
    )));
  }

  if (spec.table) {
    kids.push(el("details", { class: "open" }, [
      el("summary", null, t({ en: "Show these figures as a table", bn: "এই সংখ্যাগুলো টেবিলে দেখুন" })),
      el("div", { class: "open-body" }, spec.table),
    ]));
  }

  if (spec.source) kids.push(el("p", { class: "src", html: t(spec.source) }));
  return el("figure", { class: "fig" + (spec.wide ? " fig-wide" : "") }, kids);
}

/* ------------------------------------------------------------------ tooltip */

function tipFor(plot) {
  const tip = el("div", { class: "tip", hidden: true });
  plot.appendChild(tip);
  return {
    show(x, y, title, rows) {
      clear(tip);
      tip.appendChild(el("b", { text: title }));
      if (rows && rows.length) {
        tip.appendChild(el("dl", null, rows.flatMap((r) => [
          el("dt", { text: t(r[0]) }), el("dd", { text: r[1] }),
        ])));
      }
      tip.hidden = false;
      const w = plot.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
      tip.style.left = Math.max(0, Math.min(w - tw, x - tw / 2)) + "px";
      tip.style.top = Math.max(0, y - th - 10) + "px";
    },
    hide() { tip.hidden = true; },
  };
}

/* -------------------------------------------------------------------- table
   Built from the same rows the plot is built from, so the two can never
   disagree.

   A cell is normally a string or an {en, bn} pair. It may also be an attribute
   pair — {text} or {html} — which is what core's said() returns: a sentence
   pulled from a data file, in the Bangla edition, with its ITT number still in
   <code> where a reader can copy it. That is the only reason markup is allowed
   in a cell, and the pair form is why a plain string can never reach innerHTML
   by accident. */

/** One cell's attributes. A ready-made {text}/{html} pair passes through; every
    other value goes through t() as text. */
/* A cell takes a ready-made pair when the caller has one — {text} for a string
   it has already formatted, {html} for one carrying a locator in <code>. Either
   may name a class: a column of company names is the document's own spelling
   rather than ours, and the type says so. */
function cell(c, num) {
  const pair = c && typeof c === "object" && ("html" in c || "text" in c);
  const attrs = pair
    ? ("html" in c ? { html: c.html } : { text: c.text })
    : { text: t(c) };
  attrs.class = [num ? "n" : "", pair && c.cls ? c.cls : ""].filter(Boolean).join(" ");
  return attrs;
}

/** One cell as its <td>. A cell may also arrive as a ready-made node, or a list
    of them, which is what core's clauses() returns: a sentence off a data file
    already split into its translated clauses, its <code> locators and its
    printed fragments. Those go in as children, because there is no string form
    of them left to attribute — and building the string by hand is exactly the
    escaping hazard cell() exists to avoid. */
function td(c, num) {
  const one = c && typeof c === "object" && typeof c.nodeType === "number";
  const kids = one ? [c] : (Array.isArray(c) ? c : null);
  if (kids) return el("td", { class: num ? "n" : "" }, kids);
  return el("td", cell(c, num));
}

export function table(head, rows, opts) {
  const o = opts || {};
  /* Which columns hold numbers, and so are right-aligned in the tabular face.
     By default every column but the first, which is almost always the row's
     name; `textCols` makes them all text; `num` names the numeric ones outright,
     for a table that mixes numbers and words after the first column. */
  const isNum = (i) => (o.num ? o.num.indexOf(i) >= 0 : Boolean(i && !o.textCols));
  return el("div", { class: "tbl-scroll" }, el("table", { class: "tbl" }, [
    el("thead", null, el("tr", null, head.map((h, i) =>
      el("th", { class: isNum(i) ? "n" : "", scope: "col", text: t(h) })))),
    el("tbody", null, rows.map((r) =>
      el("tr", null, r.map((c, i) => td(c, isNum(i)))))),
  ]));
}

/* -------------------------------------------------------------- horizontal bars
   The default form for "how big is each of these named things", which is most
   of this investigation. Labels sit outside the plot on the left and values at
   the end of each bar, so the chart needs no axis at all: the numbers are
   already there. */

export function barsH(rows, opts) {
  const o = opts || {};
  const fmt = o.fmt || ((v) => n(v));
  const max = o.max || Math.max(1, ...rows.map((r) => Math.abs(r.value)));
  const rowH = o.rowH || 30, gap = 2, labelW = o.labelW || 190, valueW = o.valueW || 86;
  const h = rows.length * rowH;
  const w = o.width || CANVAS;
  const barX = labelW + 10;
  const barW = Math.max(60, w - barX - valueW);

  const marks = [];
  rows.forEach((r, i) => {
    const y = i * rowH;
    const len = Math.max(1, (Math.abs(r.value) / max) * barW);
    const fillCol = r.color || o.color || hue(0);
    marks.push(svg("text", {
      x: labelW, y: y + rowH / 2,
      class: "t-cat" + (o.labelClass ? " " + o.labelClass : ""), "text-anchor": "end",
      "dominant-baseline": "middle",
    }, t(r.label)));
    marks.push(svg("rect", {
      class: "mark", x: barX, y: y + gap, width: len, height: rowH - gap * 2,
      fill: fillCol,
    }));
    marks.push(svg("text", {
      x: barX + len + 7, y: y + rowH / 2, class: "t-val",
      "dominant-baseline": "middle",
    }, fmt(r.value)));
    if (r.note) {
      marks.push(svg("title", null, t(r.label) + " — " + t(r.note)));
    }
  });

  return svg("svg", {
    viewBox: "0 0 " + w + " " + h, width: "100%", height: h,
    role: "img", "aria-label": o.alt || "",
  }, [svg("g", { class: "marks" }, marks)]);
}

/* --------------------------------------------------------------------- lines
   Change over time, one unit on one axis. Two series maximum here, because a
   third line on a 13-point series is unreadable at this width. Comes with the
   crosshair by default: an SVG chart in a browser is interactive, and a reader
   who wants the value for 2021 should not have to count gridlines. */

export function lines(cats, series, opts) {
  const o = opts || {};
  const fmt = o.fmt || ((v) => n(v));
  const w = o.width || CANVAS, h = o.height || 260;
  /* The right pad carries half of the last category label, which is centred on
     the last point and would otherwise be cut by the canvas edge. A four-figure
     year in Bengali numerals is the widest label this chart takes. */
  const padL = o.padL || 44, padR = o.padR || 20, padT = 10, padB = 26;
  const iw = w - padL - padR, ih = h - padT - padB;
  const max = o.max || Math.max(1, ...series.flatMap((s) => s.values.map((v) => v || 0)));
  const X = (i) => padL + (cats.length < 2 ? iw / 2 : (i / (cats.length - 1)) * iw);
  const Y = (v) => padT + ih - ((v || 0) / max) * ih;

  const ticks = niceTicks(max, 4);
  const grid = svg("g", { class: "grid" }, ticks.map((v) =>
    svg("line", { x1: padL, x2: w - padR, y1: Y(v), y2: Y(v) })));
  const ylab = svg("g", null, ticks.map((v) =>
    svg("text", { x: padL - 8, y: Y(v), "text-anchor": "end", "dominant-baseline": "middle" }, fmt(v))));

  const step = Math.ceil(cats.length / (o.maxLabels || 8));
  const xlab = svg("g", null, cats.map((c, i) =>
    i % step === 0 || i === cats.length - 1
      ? svg("text", { x: X(i), y: h - 8, "text-anchor": "middle" }, digits(String(c)))
      : null).filter(Boolean));

  const paths = series.map((s, si) => svg("path", {
    class: "mark-line", stroke: s.color || hue(si),
    d: s.values.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join(" "),
  }));

  const dots = series.map((s, si) => svg("g", null, s.values.map((v, i) =>
    svg("circle", { class: "mark-dot", cx: X(i), cy: Y(v), r: 4, fill: s.color || hue(si) }))));

  const cross = svg("line", { class: "cross", y1: padT, y2: padT + ih, x1: -99, x2: -99 });
  const hit = svg("rect", { class: "hit", x: padL, y: padT, width: iw, height: ih });

  const node = svg("svg", {
    viewBox: "0 0 " + w + " " + h, width: "100%", height: h,
    role: "img", "aria-label": o.alt || "",
  }, [grid, ylab, xlab, cross, paths, dots, hit].flat());

  requestFrame(() => {
    const plot = node.parentNode;
    if (!plot) return;
    const tip = tipFor(plot);
    const move = (ev) => {
      const box = node.getBoundingClientRect();
      const sx = ((ev.clientX - box.left) / box.width) * w;
      let i = Math.round(((sx - padL) / iw) * (cats.length - 1));
      i = Math.max(0, Math.min(cats.length - 1, i));
      cross.setAttribute("x1", X(i)); cross.setAttribute("x2", X(i));
      tip.show((X(i) / w) * box.width, (Y(max) / h) * box.height + 8, digits(String(cats[i])),
        series.map((s) => [s.label, fmt(s.values[i])]));
    };
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerdown", move);
    hit.addEventListener("pointerleave", () => {
      cross.setAttribute("x1", -99); cross.setAttribute("x2", -99); tip.hide();
    });
  });

  return node;
}

/* ------------------------------------------------------------------- columns
   The same job as lines but for a quantity that is a total for the period
   rather than a level at a moment — money signed in a year. Adjacent fills are
   held apart by a gap in the page surface, not by a stroke. */

export function columns(cats, values, opts) {
  const o = opts || {};
  const fmt = o.fmt || ((v) => n(v));
  const w = o.width || CANVAS, h = o.height || 240;
  const padL = o.padL || 52, padR = 12, padT = 10, padB = 26;
  const iw = w - padL - padR, ih = h - padT - padB;
  const max = o.max || Math.max(1, ...values);
  const bw = Math.max(4, iw / cats.length - 2);
  const X = (i) => padL + (i + 0.5) * (iw / cats.length) - bw / 2;
  const Y = (v) => padT + ih - ((v || 0) / max) * ih;

  const ticks = niceTicks(max, 4);
  const grid = svg("g", { class: "grid" }, ticks.map((v) =>
    svg("line", { x1: padL, x2: w - padR, y1: Y(v), y2: Y(v) })));
  const ylab = svg("g", null, ticks.map((v) =>
    svg("text", { x: padL - 8, y: Y(v), "text-anchor": "end", "dominant-baseline": "middle" }, fmt(v))));
  const xlab = svg("g", null, cats.map((c, i) =>
    svg("text", { x: X(i) + bw / 2, y: h - 8, "text-anchor": "middle" }, digits(String(c)))));

  const bars = values.map((v, i) => svg("rect", {
    class: "mark", x: X(i), y: Y(v), width: bw, height: Math.max(1, padT + ih - Y(v)),
    fill: o.color || hue(0),
  }));

  const node = svg("svg", {
    viewBox: "0 0 " + w + " " + h, width: "100%", height: h,
    role: "img", "aria-label": o.alt || "",
  }, [grid, ylab, xlab, svg("g", null, bars)]);

  requestFrame(() => {
    const plot = node.parentNode;
    if (!plot) return;
    const tip = tipFor(plot);
    bars.forEach((b, i) => {
      const enter = () => {
        const box = node.getBoundingClientRect();
        tip.show(((X(i) + bw / 2) / w) * box.width, (Y(values[i]) / h) * box.height,
          digits(String(cats[i])), [[o.label || { en: "Value", bn: "মান" }, fmt(values[i])]]);
      };
      b.addEventListener("pointerenter", enter);
      b.addEventListener("pointerdown", enter);
      b.addEventListener("pointerleave", tip.hide);
      b.style.cursor = "pointer";
    });
  });

  return node;
}

/* ---------------------------------------------------------- percentile strip
   build.py summarises each measured distribution as min / p10 / median / p90 /
   max. Drawing that honestly means drawing exactly those five: a light span
   for the full range, a darker one for the middle eighty per cent, and a mark
   on the median. It is not a box plot and does not pretend to be — there are no
   quartiles in the summary, so none are drawn. */

export function percentileStrip(rows, opts) {
  const o = opts || {};
  const fmt = o.fmt || ((v) => n(v, 2));
  const w = o.width || CANVAS, rowH = o.rowH || 42, labelW = o.labelW || 150;
  const padR = 16;
  const h = rows.length * rowH;
  const x0 = labelW + 10, iw = w - x0 - padR;
  const max = o.max || Math.max(...rows.map((r) => r.max));
  const min = o.min === undefined ? 0 : o.min;
  const X = (v) => x0 + ((v - min) / (max - min || 1)) * iw;

  const marks = [];
  rows.forEach((r, i) => {
    const cy = i * rowH + rowH / 2 - 4;
    marks.push(svg("text", {
      x: labelW, y: cy, class: "t-cat", "text-anchor": "end", "dominant-baseline": "middle",
    }, t(r.label)));
    marks.push(svg("rect", { class: "mark", x: X(r.min), y: cy - 2, height: 4,
      width: Math.max(1, X(r.max) - X(r.min)), fill: "var(--seq-2)" }));
    marks.push(svg("rect", { class: "mark", x: X(r.p10), y: cy - 5, height: 10,
      width: Math.max(1, X(r.p90) - X(r.p10)), fill: "var(--seq-4)" }));
    marks.push(svg("rect", { class: "mark", x: X(r.median) - 1.5, y: cy - 9, height: 18,
      width: 3, fill: "var(--hue-1)" }));
    marks.push(svg("text", { x: x0, y: cy + 16, class: "t-val" },
      t({ en: "middle value ", bn: "মাঝের মান " }) + fmt(r.median) +
      "  ·  n=" + digits(String(r.n)) +
      "  ·  " + fmt(r.min) + "–" + fmt(r.max)));
  });

  if (o.reference !== undefined) {
    marks.unshift(svg("line", { class: "cross", x1: X(o.reference), x2: X(o.reference), y1: 0, y2: h }));
  }

  return svg("svg", {
    viewBox: "0 0 " + w + " " + h, width: "100%", height: h,
    role: "img", "aria-label": o.alt || "",
  }, [svg("g", null, marks)]);
}

/** The five marks in words, so the strip never has to be decoded by eye. */
export function stripLegend() {
  return [
    { label: { en: "Full range, lowest to highest", bn: "সর্বনিম্ন থেকে সর্বোচ্চ পূর্ণ পরিসর" }, color: "var(--seq-2)" },
    { label: { en: "Middle 80% (10th to 90th percentile)", bn: "মধ্যবর্তী ৮০% (১০ম–৯০তম পার্সেন্টাইল)" }, color: "var(--seq-4)" },
    { label: { en: "Middle value (the median)", bn: "মাঝের মান (মধ্যক)" }, color: "var(--hue-1)" },
  ];
}

/* -------------------------------------------------------------- stacked share
   One bar, one hundred per cent, parts in a lightness-ordered ramp so the order
   survives any colour vision. Segments are held apart by a 2px gap in the page
   surface. Used where the question is "how is one whole divided", and only
   where the parts are few enough to label directly. */

export function stackedShare(parts, opts) {
  const o = opts || {};
  const w = o.width || CANVAS, gap = 2;
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  let x = 0;
  const marks = [], labels = [];
  parts.forEach((p, i) => {
    const pw = Math.max(1, (p.value / total) * w - gap);
    marks.push(svg("rect", {
      class: "mark", x, y: 0, width: pw, height: 18,
      fill: p.color || SEQ[Math.max(0, SEQ.length - 1 - i)],
    }));
    if (pw > 46) {
      labels.push(svg("text", { x: x, y: 34, class: "t-val" },
        digits(((p.value / total) * 100).toFixed(1)) + "%"));
      labels.push(svg("text", { x: x, y: 48, class: "t-cat" }, t(p.label)));
    }
    x += pw + gap;
  });
  return svg("svg", {
    viewBox: "0 0 " + w + " 56", width: "100%", height: 56,
    role: "img", "aria-label": o.alt || "",
  }, [svg("g", null, marks), svg("g", null, labels)]);
}

/* -------------------------------------------------------------------- funnel
   A count that falls in stages — bids submitted, ruled responsive, lost. Same
   unit throughout, so it is drawn as plain bars against one scale rather than
   as a tapering shape that would distort the ratios. */

export function funnel(rows, opts) {
  const o = opts || {};
  return barsH(rows.map((r, i) => ({
    label: r.label, value: r.value,
    color: SEQ[Math.max(0, SEQ.length - 1 - i * 2)],
  })), Object.assign({ rowH: 34 }, o));
}

/* -------------------------------------------------------------------- matrix
   Six named bodies measured six ways, which is the shape the question takes
   when it is "which of these is worst". If the six were places on a map this
   would be a choropleth; no map is drawn here, because no boundary geometry
   exists in the supplied documents and those documents are the only source this
   investigation may use. What is drawn is the same comparison without the
   geography, and the district each body's own notices print rides on its row.

   A cell is a bar, not a filled block. A block would have to carry its number
   on top of itself, and the ramp cannot hold small text at contrast either way
   round: its dark steps fail in light mode and its light steps fail in dark,
   because tokens.css inverts the ramp between the two. So magnitude is a length
   and the number sits on the page surface, where it is readable in both. Colour
   is that same magnitude a second time — the redundancy any colour vision
   needs — and never the only carrier of anything.

   Each column is scaled to its own highest value, because six measures in six
   units share no axis and one drawn across them would be a lie. The thin upright
   is that column's middle value, so "above the middle" is something a reader can
   see rather than a number they have to take on trust. */

/* Only the ramp's upper steps colour the bars. tokens.css inverts the ramp
   between the two modes, so a step has to clear the page surface in both, and
   measured against #ffffff and #151719 the first three steps land between 1.2:1
   and 3.3:1 in one mode or the other — a seven-pixel bar at that contrast is a
   bar nobody can see. From --seq-4 up, every step clears 3:1 either way round.
   Three steps is also all the colour has to carry: the figure is printed above
   each bar and the upright already marks the middle, so the ramp says magnitude
   a second time and is never the only thing saying it. */
const BARS = SEQ.slice(3);

export function matrix(rows, cols, opts) {
  const o = opts || {};
  const w = o.width || CANVAS_WIDE;
  const labelW = o.labelW || 150, tailW = o.tailW || 74;
  const rowH = o.rowH || 46, headH = o.headH || 40, gap = 16;
  const cw = (w - labelW - 10 - tailW) / cols.length;
  const barW = cw - gap;
  const h = headH + rows.length * rowH;
  const colX = (j) => labelW + 10 + j * cw;
  const head = [], marks = [];

  cols.forEach((c, j) => (c.head || []).forEach((line, k) => head.push(
    svg("text", { x: colX(j), y: 11 + k * 13, class: "t-cat" }, t(line)))));
  (o.tail || []).forEach((line, k) => head.push(svg("text", {
    x: w, y: 11 + k * 13, class: "t-cat", "text-anchor": "end" }, t(line))));

  rows.forEach((r, i) => {
    const y = headH + i * rowH;
    marks.push(svg("text", { x: 0, y: y + 15, class: "t-cat" }, t(r.label)));
    if (r.sub) marks.push(svg("text", { x: 0, y: y + 29 }, t(r.sub)));
    cols.forEach((c, j) => {
      const x = colX(j), max = c.max || 100, cell = r.cells[j] || {};
      /* Nothing recorded is not a value of zero, and it is not drawn as one:
         the cell carries the absence mark and no bar at all. */
      if (cell.v === null || cell.v === undefined) {
        marks.push(svg("text", { x, y: y + 15, class: "t-val" }, o.absent || "—"));
      } else {
        const len = Math.max(1, (cell.v / max) * barW);
        const step = Math.min(BARS.length - 1, Math.floor((cell.v / max) * BARS.length));
        marks.push(svg("text", { x, y: y + 15, class: "t-val" },
          (c.fmt || ((v) => n(v)))(cell.v)));
        marks.push(svg("rect", { class: "mark", x, y: y + 22, width: len, height: 7,
          fill: BARS[step] }));
        if (c.middle !== undefined && c.middle !== null) {
          const mx = x + Math.min(barW, (c.middle / max) * barW);
          marks.push(svg("line", { class: "cross", x1: mx, x2: mx, y1: y + 19, y2: y + 32 }));
        }
      }
      /* The hover target is the whole cell rather than the seven pixels of the
         bar, and it goes on last so it is the thing under the pointer. */
      if (cell.tip) marks.push(svg("rect", { class: "hit", x, y: y + 2,
        width: Math.max(barW, 24), height: rowH - 4 }, svg("title", null, cell.tip)));
    });
    if (r.tail !== undefined) marks.push(svg("text", {
      x: w, y: y + 15, class: "t-val", "text-anchor": "end" }, r.tail));
  });

  /* Fixed px, not a percentage: below about 820 units a six-column matrix
     scaled to the column would print its labels at three pixels. It keeps its
     size and the wrapper scrolls instead, exactly as a wide table does. */
  return svg("svg", {
    viewBox: "0 0 " + w + " " + h, width: w + "px", height: h,
    role: "img", "aria-label": o.alt || "",
  }, [svg("g", null, head), svg("g", { class: "marks" }, marks)]);
}

/** The ramp and the upright in words, so the matrix never has to be decoded.
    The two swatches are the ends of the range the bars actually use. */
export function matrixLegend() {
  return [
    { label: { en: "Lower share within that column", bn: "ওই কলামের মধ্যে কম হার" }, color: BARS[0] },
    { label: { en: "Higher share within that column", bn: "ওই কলামের মধ্যে বেশি হার" }, color: BARS[BARS.length - 1] },
    { label: { en: "The middle value of the six (the upright)", bn: "ছয়টির মাঝের মান (খাড়া দাগ)" }, color: "var(--axis)" },
  ];
}

/* ----------------------------------------------------------------- map figure
   The 64 districts of Bangladesh, shaded by how many notices name each one, with
   one mark for each of the six authorities standing in the district its own
   notices print most often.

   Two layers, two jobs, and they must not be confused for one another. The
   shading is the measure: notices published, off pe_district, on the ramp. The
   six marks are a locator, all one colour, carrying no value at all — which is
   why they are warm on a cool ramp, a hue no data class can ever take, and why
   "which body is worse" is left to the matrix directly below, where six measures
   sit on six honest denominators.

   A district no notice names is not shaded pale. It takes the recessive base
   surface, the same fill the sea of undocumented districts takes, because
   nothing recorded is not a count of zero.

   The classes are four fixed bands rather than a continuous scale, because the
   counts run 1, 1, 1, 1, 1, 1, 2, 20, 49, 64, 140, 177, 693: stretched linearly
   every district but Dhaka would land in the first step. The bands are named in
   the legend in the same numbers a reader can check in the table.

   Text never sits on a fill. The marks carry their names in a key beside the
   map, joined by a hairline, so the ramp inverting between light and dark can
   never take a label below contrast. */

/* Notices published from that district. `upTo` is inclusive; the last band
   catches everything above it. The legend is generated from this same list, so
   a swatch and its range cannot drift apart. */
export const DOC_BANDS = [
  { upTo: 9, fill: SEQ[1], label: { en: "1–9 notices", bn: "১–৯টি বিজ্ঞপ্তি" } },
  { upTo: 99, fill: SEQ[2], label: { en: "10–99", bn: "১০–৯৯" } },
  { upTo: 299, fill: SEQ[3], label: { en: "100–299", bn: "১০০–২৯৯" } },
  { upTo: Infinity, fill: SEQ[5], label: { en: "300 or more", bn: "৩০০ বা তার বেশি" } },
];

const SEAT_FILL = "var(--hue-2)";

/** How many districts the boundary file carries, so a sentence about how many
    are unnamed counts them rather than repeating a number typed by hand. */
export const DISTRICT_N = DISTRICTS.length;

function band(v) {
  return DOC_BANDS.find((b) => v <= b.upTo) || DOC_BANDS[DOC_BANDS.length - 1];
}

/** The ramp, the absence, and the mark, in words. Every row is a fill a reader
    can actually meet on the map, and nothing else is listed. The absence row is
    not a colour at all but an outline, because that is what the map draws for a
    district no notice names: nothing recorded, nothing filled. */
export function mapLegend() {
  return DOC_BANDS.map((b) => ({ label: b.label, color: b.fill })).concat([
    { label: { en: "No notice names this district", bn: "কোনো বিজ্ঞপ্তিতে এই জেলার নাম নেই" },
      color: "var(--surface-page)", edge: true },
    { label: { en: "Where an authority works", bn: "সংস্থার কাজের জেলা" }, color: SEAT_FILL },
  ]);
}

/** The widest key row the map will have to hold, in canvas units.

    Measured, not estimated, because the same six rows are Latin in one edition
    and Bangla in the other and the counts come from the corpus, so no constant
    could be right for both. A detached 2D context is the only text-measuring
    tool available before the svg is in the document; it substitutes a generic
    face for the page's, which measured 11% narrow against the rendered rows, so
    the result carries that back plus a little air. The context is made once and
    kept. */
let keyCtx = null;
function measureKey(seats) {
  if (!keyCtx) keyCtx = document.createElement("canvas").getContext("2d");
  keyCtx.font = "11px sans-serif";
  let max = 0;
  seats.forEach((s) => {
    max = Math.max(max, keyCtx.measureText(t(s.label)).width,
      keyCtx.measureText(s.read + " · " + t(s.sub)).width);
  });
  return Math.ceil(max * 1.15) + 10;
}

/**
 * Fold a tally of printed district spellings onto the boundary each one belongs
 * to. The notices print two spellings of one district — Chattogram and
 * Chittagong — and Laksmipur for Lakshmipur, so their counts are one number on
 * one shape here. Nothing else collapses: the crosswalk is authored by hand in
 * build/mapshape_gen.py, which fails the build if the notices print a spelling
 * it does not carry, so a district can never be silently dropped off the map.
 *
 * @param rows  [{key, n}] as the corpus tallies them, one row per spelling.
 * @returns     boundary name → {v, printed: [spelling, …]}, largest first.
 */
export function byBoundary(rows) {
  const out = {};
  rows.forEach((r) => {
    const b = PRINTED[r.key];
    if (!b) return;
    const cell = out[b] || (out[b] = { v: 0, printed: [] });
    cell.v += r.n;
    cell.printed.push(r.key);
  });
  Object.values(out).forEach((c) => c.printed.sort());
  return out;
}

/**
 * @param shade  district key → {v, name} for every district a notice names.
 * @param seats  one row per authority: {key, label, sub, read}. `key` indexes
 *               SITES; the row is drawn in the flank key, never on the map.
 */
export function districtMap(shade, seats, opts) {
  const o = opts || {};
  const w = o.width || CANVAS_WIDE;
  const [bx, by] = MAP_BOX;
  /* The column the figure will really be laid out in, unfloored — see midColumn.
     A phone gets a different arrangement of the same two layers, not a smaller
     copy of this one, because the type in the key does not survive being scaled
     to a third of its size. */
  const col = o.col || w;
  /* Below this the two-flank canvas no longer fits the column, and a scroller
     that opens on 220px of empty west flank with the country off to the right is
     worse than no map. So a narrow column gets the same two layers rearranged:
     the map alone at the column's full width, and the key stacked underneath it
     in two columns. Nothing scrolls and nothing is scaled down.

     The leaders go with it, and lose nothing. A leader ties a mark to a row, and
     the row already names the district the mark stands in — on a wide canvas
     that redundancy is a convenience, but at this size six hairlines crossing the
     country to reach one flank stripe the map for information it is not carrying.
     The marks keep their tooltips; the rows keep their district names. */
  const stacked = col < 760;
  /* A key row is two lines: the body's name, then its count and its district.
     19px between the two baselines and 46px between rows, because the Bengali
     face's ink box measures 18.5px at 14px — the matra of the lower line reaches
     into the descender of the upper one at the 14px spacing the Latin face is
     happy with. One spacing, set by the tighter of the two editions. */
  const rowH = o.rowH || 46, lineH = 19, gap = 46, side = 13;
  /* How wide a flank has to be is a question about type, so it is measured rather
     than assumed: the rows are Bangla in one edition and Latin in the other, and
     the counts come from the corpus. Every pixel of canvas past this is white
     space between the key and the coast, and a fixed 880 canvas was spending 160
     of them on exactly that. */
  const flank = gap + side + 8 + measureKey(seats);
  /* The country is portrait — 366 by 519 — so height, not width, is what the map
     is sized by: at this aspect a map drawn to fit the width would be three times
     as wide as it is allowed to be tall. So the height is taken first and the
     width follows from it, and the flanks the key needs are then measured off the
     canvas the column gives, rather than the canvas being cut to the drawing.

     The height is whatever leaves room for both flanks, capped at 640. The cap is
     higher than a locator map needs, and deliberately: at 64 areas the small
     central districts have to survive, and Bhola and Hatiya have to read as
     islands rather than as noise on the coast. It also stops a very wide column
     from turning a portrait country into a 1,000px-tall figure that a reader
     scrolls through in pieces. Stacked, the height comes from the column instead,
     up to a ceiling of its own, so on a phone the map is exactly as wide as the
     column and the whole country is on screen at once. */
  const mh = stacked
    ? Math.round(Math.min(560, col * (by / bx)))
    : Math.round(Math.min(640, Math.max(320, (w - 2 * flank) * (by / bx))));
  const k = mh / by;
  const mw = Math.round(bx * k);
  const S = (v) => Math.round(v * k * 10) / 10;

  /* On a wide canvas the labels go on the flank the body sits on — the western
     half of the six west of the map, the eastern half east of it — so the type is
     spread across the width instead of banked up one side, and the map is centred
     between them. The split is by rank rather than by a line down the middle,
     because four bodies east of centre and two west would leave one flank crowded
     and the other nearly empty. On each side the rows keep the vertical order of
     their marks and are pushed apart to a legible minimum, so a leader never has
     to cross another leader.

     The canvas is the column, never less. The map and its two flanks are the
     minimum it can be — below that the key runs off the edge — but where the
     height ceiling has left the drawing narrower than the track it is laid out
     in, the leftover goes into the flanks instead of standing as white space
     outside the svg: this figure is the one drawing on the page whose svg is
     sized in pixels rather than stretched to 100% of its parent, so a canvas cut
     to the drawing is a canvas that visibly fails to reach the ends of the grid
     it shares with the title above it. What keeps that leftover small is the
     column the figure is given — the 54rem measure, not the full page width;
     that choice is made where the figure is built. */
  const cw = Math.max(stacked ? mw : mw + 2 * flank, Math.min(w, col));
  const mapX = Math.round((cw - mw) / 2);
  const pins = seats.filter((s) => SITES[s.key]).map((s) => ({
    s,
    x: mapX + S(SITES[s.key][0]),
    y: S(SITES[s.key][1]),
  }));
  let h;
  if (stacked) {
    /* Two columns across the canvas, filled left to right, north to south. Not by
       count: these marks carry no value, and a key ranked by size would say they
       did. 22px of air under the coast so the first row is not read as a label
       on the sea. */
    const half = Math.floor(cw / 2);
    pins.slice().sort((a, b) => a.y - b.y).forEach((p, i) => {
      p.kx = (i % 2) * half;
      p.ky = mh + 22 + Math.floor(i / 2) * rowH;
    });
    h = mh + 22 + Math.ceil(pins.length / 2) * rowH;
  } else {
    const westward = pins.slice().sort((a, b) => a.x - b.x)
      .slice(0, Math.ceil(pins.length / 2));
    pins.forEach((p) => { p.west = westward.indexOf(p) >= 0; });
    let low = 0;
    [true, false].forEach((flank) => {
      let last = -Infinity;
      pins.filter((p) => p.west === flank).sort((a, b) => a.y - b.y)
        .forEach((p) => { p.ky = Math.max(p.y, last + rowH); last = p.ky; });
      low = Math.max(low, last);
    });
    /* The lowest row's second line sits lineH below its own baseline and its ink
       descends a few px further, so the canvas has to reserve for that or the last
       district name is clipped by the viewBox. */
    h = Math.max(mh, Math.round(low) + lineH + 6);
  }

  /* One polygon per island, so Bhola and Hatiya are islands and not a bridge to
     the mainland. A shaded district carries a tooltip naming itself and its
     count; an unshaded one carries none, because there is nothing to disclose
     and a name in the wrong language is worse than no name. */
  const areas = [];
  DISTRICTS.forEach((d) => {
    const got = shade[d.key];
    const fill = got ? band(got.v).fill : null;
    d.p.forEach((ring) => {
      const pts = [];
      for (let i = 0; i < ring.length; i += 2) {
        pts.push((mapX + S(ring[i])) + "," + S(ring[i + 1]));
      }
      areas.push(svg("polygon", {
        class: got ? "area zone lit" : "area zone", points: pts.join(" "),
        fill: fill || null,
      }, got && got.tip ? svg("title", null, got.tip) : null));
    });
  });

  const marks = [], key = [];
  pins.forEach((p) => {
    const s = p.s;
    if (!stacked) {
      marks.push(svg("line", {
        class: "leader",
        x1: p.west ? p.x - 7 : p.x + 7, y1: p.y,
        x2: p.west ? mapX - gap + 6 : mapX + mw + gap - 6, y2: p.ky - 6,
      }));
    }
    marks.push(svg("rect", {
      class: "mark seat", x: p.x - 6, y: p.y - 6, width: 12, height: 12,
      fill: SEAT_FILL,
    }, s.tip ? svg("title", null, s.tip) : null));
    const swX = stacked ? p.kx
      : (p.west ? mapX - gap - side : mapX + mw + gap);
    const end = !stacked && p.west;
    const txX = end ? swX - 8 : swX + side + 8;
    key.push(svg("rect", {
      class: "mark", x: swX, y: p.ky - side, width: side, height: side,
      fill: SEAT_FILL,
    }));
    key.push(svg("text", {
      class: "t-cat", x: txX, y: p.ky - 2, "text-anchor": end ? "end" : "start",
    }, t(s.label)));
    key.push(svg("text", {
      class: "t-val", x: txX, y: p.ky - 2 + lineH, "text-anchor": end ? "end" : "start",
    }, s.read + " · " + t(s.sub)));
  });

  return svg("svg", {
    viewBox: "0 0 " + cw + " " + h, width: cw + "px", height: h,
    role: "img", "aria-label": o.alt || "",
  }, [
    svg("g", { class: "geo" }, areas),
    svg("g", { class: "marks" }, [...marks, ...key]),
  ]);
}







