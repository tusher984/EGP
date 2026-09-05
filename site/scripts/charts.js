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
        el("span", { class: "swatch", style: "background:" + s.color }),
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
  return el("div", { class: "tbl-scroll" }, el("table", { class: "tbl" }, [
    el("thead", null, el("tr", null, head.map((h, i) =>
      el("th", { class: i && !o.textCols ? "n" : "", scope: "col", text: t(h) })))),
    el("tbody", null, rows.map((r) =>
      el("tr", null, r.map((c, i) => td(c, i && !o.textCols))))),
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





