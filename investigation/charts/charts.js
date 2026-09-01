/* The chart primitives. Five of them, and every one is used by a figure in the
   story; nothing here is drawn for the sake of having it.

   The rules they follow are the same in each: thin marks, the data end of a bar
   rounded 4px and the baseline end square so the bar still reads as measured from
   zero, a 2px gap of page colour between neighbouring fills, one axis and never
   two, a recessive grid, direct labels only where they earn their place, and a
   hover layer with a tooltip on every mark. Colour comes from the tokens in
   styles/tokens.css, which are the validated palette. */

import { el, svgEl, clear, num } from "../components/ui.js";

const W = 760;               // one coordinate space, scaled by the viewBox
const HUE = ["var(--hue-1)", "var(--hue-2)", "var(--hue-3)"];
export const SEQ = ["var(--seq-1)", "var(--seq-2)", "var(--seq-3)",
  "var(--seq-4)", "var(--seq-5)", "var(--seq-6)"];
export const CAT = HUE;
export const DIV = { low: "var(--div-low)", mid: "var(--div-mid)", high: "var(--div-high)" };

/* a step of the sequential ramp for a value in 0..1 */
export const step = (t) => SEQ[Math.max(0, Math.min(SEQ.length - 1,
  Math.round(t * (SEQ.length - 1))))];

function frame(plot, height) {
  clear(plot);
  const svg = svgEl("svg", {
    viewBox: `0 0 ${W} ${height}`, role: "img",
    preserveAspectRatio: "xMinYMin meet",
    style: `max-height:${Math.round(height * 1.15)}px`,
  });
  plot.append(svg);
  const tip = el("div", { class: "tip", role: "status", "aria-live": "polite" });
  plot.append(tip);
  return { svg, tip };
}

/* One tooltip per plot, moved rather than recreated. The hit target is the mark
   plus a transparent band around it, so a 6px bar is still catchable on a phone. */
function hover(plot, tip, node, build) {
  const show = (ev) => {
    clear(tip);
    tip.append(build());
    const box = plot.getBoundingClientRect();
    const at = node.getBoundingClientRect();
    const x = ev && ev.clientX ? ev.clientX - box.left : at.left + at.width / 2 - box.left;
    tip.style.left = `${Math.max(70, Math.min(box.width - 70, x))}px`;
    tip.style.top = `${at.top - box.top}px`;
    tip.dataset.on = "1";
  };
  const hide = () => { tip.dataset.on = "0"; };
  node.addEventListener("pointerenter", show);
  node.addEventListener("pointermove", show);
  node.addEventListener("pointerleave", hide);
  node.addEventListener("focus", show);
  node.addEventListener("blur", hide);
}

export function tipBody(title, pairs) {
  const dl = el("dl");
  for (const [k, v] of pairs) dl.append(el("dt", k), el("dd", v));
  return el("div", el("b", title), dl);
}

/* a bar whose data end is rounded and whose baseline end is square */
function barRight(x, y, w, h, r) {
  const rr = Math.min(r, w, h / 2);
  return `M${x},${y}H${x + w - rr}a${rr},${rr} 0 0 1 ${rr},${rr}V${y + h - rr}`
    + `a${rr},${rr} 0 0 1 ${-rr},${rr}H${x}Z`;
}
function barUp(x, y, w, h, r) {
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h}V${y + rr}a${rr},${rr} 0 0 1 ${rr},${-rr}H${x + w - rr}`
    + `a${rr},${rr} 0 0 1 ${rr},${rr}V${y + h}Z`;
}

/* ---- horizontal bars: a magnitude read against a name ---- */
export function barsH(plot, o) {
  const rows = o.rows;
  const lab = o.labelWidth || 200;
  const rowH = o.rowHeight || 26;
  const bar = o.barHeight || 12;
  const top = 4;
  const h = top + rows.length * rowH + 26;
  const max = o.max || Math.max(...rows.map((r) => r.value), 1);
  const x0 = lab + 8;
  const plotW = W - x0 - (o.rightPad || 68);
  const { svg, tip } = frame(plot, h);
  const scale = (v) => (v / max) * plotW;

  const axis = svgEl("g", { class: "axis" });
  const ticks = o.ticks || 4;
  for (let i = 0; i <= ticks; i++) {
    const v = (max / ticks) * i;
    const x = x0 + scale(v);
    axis.append(svgEl("line", { class: "gridline", x1: x, y1: top, x2: x,
      y2: top + rows.length * rowH }));
    axis.append(svgEl("text", { x, y: h - 8, "text-anchor": "middle",
      text: o.fmt ? o.fmt(v) : num(v) }));
  }
  svg.append(axis);

  rows.forEach((r, i) => {
    const y = top + i * rowH;
    const g = svgEl("g", { tabindex: "0", role: "listitem",
      "aria-label": `${r.label}: ${o.fmt ? o.fmt(r.value) : num(r.value)}` });
    g.append(svgEl("text", { x: lab, y: y + bar + 2, "text-anchor": "end",
      class: "mark-label", text: r.label, style: "fill:var(--ink-body)" }));
    const w = Math.max(1.5, scale(r.value));
    g.append(svgEl("path", { d: barRight(x0, y + 2, w, bar, 4),
      fill: r.color || "var(--seq-5)" }));
    g.append(svgEl("text", { x: x0 + w + 7, y: y + bar - 1, class: "mark-label",
      text: o.fmt ? o.fmt(r.value) : num(r.value) }));
    g.append(svgEl("rect", { x: 0, y, width: W, height: rowH, fill: "transparent" }));
    svg.append(g);
    hover(plot, tip, g, () => tipBody(r.label,
      [[o.valueLabel || "value", o.fmt ? o.fmt(r.value) : num(r.value)],
        ...(r.note ? [["", r.note]] : [])]));
  });
  return svg;
}

/* ---- vertical bars: a distribution read along a number line ---- */
export function barsV(plot, o) {
  const rows = o.rows;
  const h = o.height || 240;
  /* Two lines of text sit under the baseline when an axis label is asked for — the
     tick under each bar, then the label naming the axis — so the bottom padding has
     to hold both without their boxes touching at 11.5px. */
  const padL = 44, padB = o.axisLabel ? 42 : 30, padT = 14;
  const { svg, tip } = frame(plot, h);
  const plotW = W - padL - 16;
  const max = o.max || Math.max(...rows.map((r) => r.value), 1);
  const slot = plotW / rows.length;
  const bw = Math.max(2, slot - 2);          // the 2px gap of page between fills
  const y = (v) => padT + (1 - v / max) * (h - padT - padB);

  const axis = svgEl("g", { class: "axis" });
  for (let i = 0; i <= 4; i++) {
    const v = (max / 4) * i;
    axis.append(svgEl("line", { class: "gridline", x1: padL, y1: y(v), x2: W - 16, y2: y(v) }));
    axis.append(svgEl("text", { x: padL - 8, y: y(v) + 4, "text-anchor": "end",
      text: num(v) }));
  }
  axis.append(svgEl("line", { x1: padL, y1: y(0), x2: W - 16, y2: y(0) }));
  svg.append(axis);

  rows.forEach((r, i) => {
    const x = padL + i * slot;
    const g = svgEl("g", { tabindex: "0", role: "listitem",
      "aria-label": `${r.label}: ${num(r.value)}` });
    g.append(svgEl("path", { d: barUp(x + 1, y(r.value), bw, y(0) - y(r.value), 4),
      fill: r.color || "var(--seq-5)" }));
    if (r.tick) {
      g.append(svgEl("text", { x: x + 1 + bw / 2, y: y(0) + 15, "text-anchor": "middle",
        class: "mark-label", text: r.label }));
    }
    g.append(svgEl("rect", { x, y: padT, width: slot, height: h - padT - padB + 8,
      fill: "transparent" }));
    svg.append(g);
    hover(plot, tip, g, () => tipBody(o.labelPrefix ? `${o.labelPrefix} ${r.label}` : r.label,
      [[o.valueLabel || "tenders", num(r.value)], ...(r.note ? [["", r.note]] : [])]));
  });
  if (o.axisLabel) {
    svg.append(svgEl("text", { x: padL + plotW / 2, y: h - 3, "text-anchor": "middle",
      class: "mark-label", text: o.axisLabel }));
  }
  return svg;
}

/* ---- the funnel: four counts, each a share of the first ----
   Drawn as bars against a common baseline rather than as a tapering ribbon,
   because a ribbon encodes the number in an area and an area cannot be read. */
export function funnel(plot, o) {
  const rows = o.rows;
  const rowH = 62;
  const h = rows.length * rowH + 8;
  const x0 = 176;
  const plotW = W - x0 - 130;
  const max = rows[0].value;
  const { svg, tip } = frame(plot, h);

  rows.forEach((r, i) => {
    const y = 8 + i * rowH;
    const w = Math.max(2, (r.value / max) * plotW);
    const g = svgEl("g", { tabindex: "0", role: "listitem",
      "aria-label": `${r.label}: ${num(r.value)}` });
    g.append(svgEl("text", { x: x0 - 12, y: y + 15, "text-anchor": "end",
      class: "mark-label", text: r.label, style: "fill:var(--ink);font-size:.8rem" }));
    g.append(svgEl("path", { d: barRight(x0, y, w, 22, 4), fill: SEQ[2 + i] || SEQ[5] }));
    g.append(svgEl("text", { x: x0 + w + 9, y: y + 16, class: "mark-label",
      text: num(r.value), style: "fill:var(--ink);font-size:.86rem" }));
    if (i > 0) {
      const lost = rows[i - 1].value - r.value;
      const share = (lost / rows[i - 1].value) * 100;
      g.append(svgEl("text", { x: x0, y: y - 12, class: "mark-label",
        text: `${num(lost)} fewer than the step above (${Math.round(share * 10) / 10}%)` }));
      g.append(svgEl("line", { class: "gridline", x1: x0 - 4, y1: y - 30, x2: x0 - 4,
        y2: y, stroke: "var(--rule)" }));
    }
    g.append(svgEl("rect", { x: 0, y: y - 8, width: W, height: rowH, fill: "transparent" }));
    svg.append(g);
    hover(plot, tip, g, () => tipBody(r.label, [
      [o.valueLabel || "count", num(r.value)],
      ["share of the first step", `${Math.round((r.value / max) * 1000) / 10}%`],
      ...(r.note ? [["", r.note]] : [])]));
  });
  return svg;
}

/* ---- two measures of the same unit, per row ----
   One axis, two markers, a 2px line between them. This is what a dual axis is for
   and this is how to draw it without one. */
export function dumbbell(plot, o) {
  const rows = o.rows;
  const rowH = 34;
  const lab = o.labelWidth || 226;
  const h = 18 + rows.length * rowH + 26;
  const x0 = lab + 10;
  const plotW = W - x0 - 40;
  const max = o.max || Math.max(...rows.flatMap((r) => [r.from, r.to]), 1);
  const { svg, tip } = frame(plot, h);
  const x = (v) => x0 + (v / max) * plotW;

  const axis = svgEl("g", { class: "axis" });
  for (let i = 0; i <= 4; i++) {
    const v = (max / 4) * i;
    axis.append(svgEl("line", { class: "gridline", x1: x(v), y1: 14, x2: x(v),
      y2: 14 + rows.length * rowH }));
    axis.append(svgEl("text", { x: x(v), y: h - 8, "text-anchor": "middle", text: num(v) }));
  }
  svg.append(axis);

  rows.forEach((r, i) => {
    const y = 18 + i * rowH + rowH / 2 - 6;
    const g = svgEl("g", { tabindex: "0", role: "listitem",
      "aria-label": `${r.label}: ${o.fromLabel} ${num(r.from)}, ${o.toLabel} ${num(r.to)}` });
    g.append(svgEl("text", { x: lab, y: y + 4, "text-anchor": "end", class: "mark-label",
      text: r.label, style: "fill:var(--ink-body)" }));
    g.append(svgEl("line", { x1: x(r.from), y1: y, x2: x(r.to), y2: y,
      stroke: "var(--rule)", "stroke-width": 2 }));
    g.append(svgEl("circle", { cx: x(r.from), cy: y, r: 5, fill: CAT[0],
      stroke: "var(--paper)", "stroke-width": 2 }));
    g.append(svgEl("circle", { cx: x(r.to), cy: y, r: 5, fill: CAT[1],
      stroke: "var(--paper)", "stroke-width": 2 }));
    g.append(svgEl("rect", { x: 0, y: y - rowH / 2, width: W, height: rowH,
      fill: "transparent" }));
    svg.append(g);
    hover(plot, tip, g, () => tipBody(r.label, [
      [o.fromLabel, num(r.from)], [o.toLabel, num(r.to)],
      ...(r.note ? [["", r.note]] : [])]));
  });
  return svg;
}

/* ---- one value per tender against a printed band ----
   Every tender is a dot, binned so that dots stack instead of hiding each other.
   The band the reference document recommends is shaded behind them, so a reader
   sees at once how many sit outside it. */
export function bandStrip(plot, o) {
  const bin = o.bin || 0.05;
  const cap = o.cap || 2;
  const bins = new Map();
  for (const v of o.values) {
    const k = Math.min(Math.floor(v / bin), Math.floor(cap / bin));
    if (!bins.has(k)) bins.set(k, []);
    bins.get(k).push(v);
  }
  const tallest = Math.max(...[...bins.values()].map((b) => b.length), 1);
  const dot = 4.5, gap = 1.5;
  const padB = 40, padT = 16;
  const h = padT + tallest * (dot * 2 + gap) + padB;
  const padL = 26;
  const plotW = W - padL - 26;
  const { svg, tip } = frame(plot, h);
  const x = (v) => padL + (Math.min(v, cap) / cap) * plotW;
  const base = h - padB;

  svg.append(svgEl("rect", { x: x(o.bandLow), y: padT - 6,
    width: x(o.bandHigh) - x(o.bandLow), height: base - padT + 12,
    fill: "var(--seq-1)", stroke: "var(--seq-3)", "stroke-dasharray": "3 3" }));
  svg.append(svgEl("text", { x: (x(o.bandLow) + x(o.bandHigh)) / 2, y: padT - 12,
    "text-anchor": "middle", class: "mark-label",
    text: `${o.bandLabel || "the band the document recommends"}` }));

  const axis = svgEl("g", { class: "axis" });
  const ticks = Math.round(cap / 0.25);
  for (let i = 0; i <= ticks; i++) {
    const v = i * 0.25;
    axis.append(svgEl("line", { class: "gridline", x1: x(v), y1: padT - 6, x2: x(v), y2: base }));
    axis.append(svgEl("text", { x: x(v), y: base + 18, "text-anchor": "middle",
      text: `${v}×` + (v === cap ? "+" : "") }));
  }
  axis.append(svgEl("line", { x1: padL, y1: base, x2: W - 26, y2: base }));
  svg.append(axis);

  for (const [k, vals] of [...bins.entries()].sort((a, b) => a[0] - b[0])) {
    const cx = x((k + 0.5) * bin);
    const over = (k + 1) * bin > cap;
    vals.forEach((v, i) => {
      svg.append(svgEl("circle", { cx, cy: base - 6 - i * (dot * 2 + gap), r: dot,
        fill: v > o.bandHigh ? CAT[1] : (v < o.bandLow ? "var(--seq-3)" : "var(--seq-5)"),
        stroke: "var(--paper)", "stroke-width": 1.5 }));
    });
    const hit = svgEl("rect", { x: cx - (dot + gap), y: padT - 6, width: dot * 2 + gap * 2,
      height: base - padT + 6, fill: "transparent", tabindex: "0",
      "aria-label": `${num(vals.length)} tenders at ${Math.round(k * bin * 100) / 100} times` });
    svg.append(hit);
    hover(plot, tip, hit, () => tipBody(
      over ? `${cap}× and above` : `${Math.round(k * bin * 100) / 100}–${Math.round((k + 1) * bin * 100) / 100}×`,
      [["tenders", num(vals.length)],
        ["outside the band", num(vals.filter((v) => v > o.bandHigh || v < o.bandLow).length)]]));
  }
  if (Number.isFinite(o.median)) {
    svg.append(svgEl("line", { x1: x(o.median), y1: padT - 6, x2: x(o.median), y2: base,
      stroke: "var(--ink)", "stroke-width": 2 }));
    svg.append(svgEl("text", { x: x(o.median), y: base + 34, "text-anchor": "middle",
      class: "mark-label", style: "fill:var(--ink)",
      text: `median ${Math.round(o.median * 1000) / 1000}×` }));
  }
  return svg;
}

/* ---- one entity and what the documents attach to it ----

   Not a force-directed hairball. A hairball hides the one thing a reader of this
   archive needs — which relation an edge is — behind a pretty cloud, and it draws
   itself differently on every load, so no figure could be reproduced. This is laid
   out arithmetically: the entity on the left, one lane per kind of relation, the
   named things in that lane stacked in a fixed order. The same input draws the same
   picture every time, and the lane label says in words what the line means.

   Firm names in this archive run to 200 characters, so a label is clipped on the
   mark and printed whole in the tooltip and in the table beneath the figure. */
export function egoGraph(plot, o) {
  const lanes = o.lanes.filter((l) => l.nodes.length);
  const cap = o.cap || 6;
  const nodeH = 24, nodeGap = 6, laneHead = 20, lanePad = 12;
  const shown = lanes.map((l) => Math.min(l.nodes.length, cap));
  const h = 24 + shown.reduce((s, n, i) =>
    s + laneHead + n * (nodeH + nodeGap) + (lanes[i].nodes.length > cap ? 18 : 0)
    + lanePad, 0);
  const { svg, tip } = frame(plot, h);
  const cw = 168, cx = 4, nx = cx + cw + 54, nw = W - nx - 8;
  const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

  /* the entity itself, vertically centred against the lanes it owns */
  const cy = h / 2;
  const hub = svgEl("g", { role: "img", "aria-label": `${o.centre.type}: ${o.centre.label}` });
  hub.append(svgEl("title", { text: o.centre.label }));
  hub.append(svgEl("rect", { x: cx, y: cy - 26, width: cw, height: 52, rx: 6,
    fill: "var(--hue-1)", stroke: "var(--paper)", "stroke-width": 2 }));
  hub.append(svgEl("text", { x: cx + cw / 2, y: cy - 6, "text-anchor": "middle",
    class: "mark-label on", style: "font-weight:600",
    text: clip(o.centre.label, 26) }));
  hub.append(svgEl("text", { x: cx + cw / 2, y: cy + 12, "text-anchor": "middle",
    class: "mark-label on", text: o.centre.type }));
  svg.append(hub);

  let y = 16;
  lanes.forEach((lane) => {
    svg.append(svgEl("text", { x: nx, y, class: "mark-label", text: lane.relation }));
    y += 4;
    lane.nodes.slice(0, cap).forEach((n) => {
      const top = y;
      const mid = top + nodeH / 2;
      svg.append(svgEl("path", {
        d: `M${cx + cw},${cy} C${cx + cw + 30},${cy} ${nx - 30},${mid} ${nx},${mid}`,
        fill: "none", stroke: "var(--rule)", "stroke-width": 1.5 }));
      const g = svgEl("g", { tabindex: "0", role: "listitem",
        "aria-label": `${lane.relation}: ${n.label}${n.detail ? `, ${n.detail}` : ""}` });
      g.append(svgEl("rect", { x: nx, y: top, width: nw, height: nodeH, rx: 5,
        fill: "var(--paper-sunken)", stroke: "var(--rule)" }));
      /* the accent repeats the hub's colour: it says "attached to the entity on the
         left", and nothing else. The lane label above carries what the link is. */
      g.append(svgEl("rect", { x: nx, y: top, width: 4, height: nodeH,
        fill: "var(--hue-1)" }));
      g.append(svgEl("text", { x: nx + 12, y: mid + 4, class: "mark-label",
        style: "fill:var(--ink)", text: clip(n.label, 74) }));
      if (n.detail) {
        g.append(svgEl("text", { x: nx + nw - 10, y: mid + 4, "text-anchor": "end",
          class: "mark-label", text: n.detail }));
      }
      if (o.onPick) {
        g.setAttribute("style", "cursor:pointer");
        g.addEventListener("click", () => o.onPick(n));
        g.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); o.onPick(n); }
        });
      }
      svg.append(g);
      hover(plot, tip, g, () => tipBody(n.label, [
        ["relation", lane.relation],
        ...(n.detail ? [["what the page prints", n.detail]] : []),
        ...(o.onPick ? [["click", "centre the picture on this one"]] : []),
      ]));
      y = top + nodeH + nodeGap;
    });
    if (lane.nodes.length > cap) {
      svg.append(svgEl("text", { x: nx + 12, y: y + 12, class: "mark-label",
        text: `and ${num(lane.nodes.length - cap)} more, all of them in the table below` }));
      y += 18;
    }
    y += lanePad;
  });
  svg.setAttribute("aria-label", `${o.centre.label}: ${num(o.lanes.reduce((s, l) =>
    s + l.nodes.length, 0))} links the documents print, in ${num(lanes.length)} kinds`);
  return svg;
}

