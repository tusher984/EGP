/* The pieces every section is built from. Plain DOM, no framework, no build step:
   the site has to open from a folder with no network and no toolchain. */

import { LANG, t, word } from "../i18n/i18n.js";

export function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  if (attrs && (attrs.nodeType || typeof attrs === "string" || Array.isArray(attrs))) {
    kids.unshift(attrs);
  } else if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k === "text") n.textContent = v;
      else if (k === "style" && typeof v === "object") Object.assign(n.style, v);
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : String(v));
    }
  }
  add(n, kids);
  return n;
}

function add(n, kids) {
  for (const k of kids) {
    if (k === null || k === undefined || k === false) continue;
    if (Array.isArray(k)) add(n, k);
    else n.append(k.nodeType ? k : document.createTextNode(String(k)));
  }
}

export function svgEl(tag, attrs) {
  const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "text") n.textContent = v;
    else n.setAttribute(k, String(v));
  }
  return n;
}

export function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }

/* ---- numbers, written the way the story writes them ----
   The Bangla edition writes its numbers in Bengali digits and groups them the way
   Bengali groups them — ৩৭,২০,০০,০০,০০০, not 37,200,000,000 — because a page that
   spells its sentences in one script and its quantities in another is harder to read
   than either. Intl does the grouping; nothing here reimplements it. The exact figure
   in Latin digits stays reachable in the title attribute on every rounded value, and
   the CSV downloads are unaffected: those carry raw values for a spreadsheet. */
const NF = new Intl.NumberFormat(LANG === "bn" ? "bn-BD" : "en-GB");
export const num = (v) => (v === null || v === undefined || v === "" || Number.isNaN(+v)
  ? t("num.none") : NF.format(Math.round(+v * 100) / 100));
export const pct = (v) => t("num.pct", { n: NF.format(Math.round(+v * 10) / 10) });

/* A p-value keeps the precision it was calculated to. num() rounds to two decimals,
   which would print p = 0.683 as 0.68 and coarsen a statistic the reader is being asked
   to judge the strength of, so this one formats to three places — in the reader's own
   digits, like every other number on the page. */
const NF3 = new Intl.NumberFormat(LANG === "bn" ? "bn-BD" : "en-GB",
  { maximumFractionDigits: 3 });
export const decimal = (v) => (Number.isFinite(+v) ? NF3.format(+v) : t("num.none"));

/* Taka are written in crore above a crore and in lakh above a lakh, because that
   is how the documents themselves print them. The exact figure stays available in
   the title attribute rather than being rounded away. */
export function taka(v, opts = {}) {
  const n = +v;
  if (!Number.isFinite(n)) return t("num.none");
  if (Math.abs(n) >= 1e7) return t("num.crore", { n: NF.format(Math.round(n / 1e5) / 100) });
  if (Math.abs(n) >= 1e5) return t("num.lakh", { n: NF.format(Math.round(n / 1e3) / 100) });
  return opts.bare ? NF.format(n) : t("num.taka", { n: NF.format(Math.round(n)) });
}
export const exact = (v) => (Number.isFinite(+v) ? t("num.taka", { n: NF.format(+v) }) : "");

/* ---- labels ----
   The label's own words are translated; the data-label attribute keeps the English
   token, because that is what the stylesheet matches on to give each label its colour,
   and because it is the label as the analysis wrote it. */
export function chip(label, opts = {}) {
  return el("span", { class: "chip" + (opts.square ? " sq" : ""), "data-label": label },
    opts.short || word(`label.${label}`, label));
}

/* ---- the link back to the page it was printed on ----
   Every number, name and quote on this site reaches the PDF it came from. The folders
   of PDFs sit at the repository root, which is two levels up from this module, and the
   page fragment is what the browser's own viewer understands. Resolving against this
   module's URL rather than the page's means a citation points at the same PDF whether
   the reader opened the site from the root index.html or from anywhere else. */
export const PDF_BASE = new URL("../../", import.meta.url).href;
export function pdfHref(file, page) {
  const parts = String(file).split("/").map(encodeURIComponent).join("/");
  return PDF_BASE + parts + (page ? `#page=${page}` : "");
}

export function cite(file, page, opts = {}) {
  const name = String(file).split("/").pop();
  return el("a", {
    class: "cite", href: pdfHref(file, page), target: "_blank", rel: "noopener",
    title: page ? t("cite.openAt", { file, page }) : t("cite.open", { file }),
  }, opts.label || name, page ? el("span", { class: "pg" }, `p${page}`) : null);
}

export function citeList(refs) {
  const seen = new Set();
  const items = [];
  for (const r of refs || []) {
    const [file, page] = String(r).split(/[#\s]p?/);
    const k = `${file}#${page || ""}`;
    if (seen.has(k)) continue;
    seen.add(k);
    items.push(el("li", cite(file, page ? +page : null)));
  }
  if (!items.length) return null;
  return el("ul", { class: "cites" }, items);
}

/* The filename, the page marker and the quoted words are never translated. They are
   the evidence: a reader checking this sentence against the page has to find the same
   characters here as there, and "p3" is what a PDF viewer's page box takes. */
export function quote(text, file, page) {
  return el("blockquote", { class: "quote" },
    el("span", { html: `&ldquo;${escapeHtml(text)}&rdquo;` }),
    el("span", { class: "src" }, t("cite.printedIn"), " ", cite(file, page)));
}

export const escapeHtml = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---- containers ----
   A tile whose number is explained somewhere further down carries a link to that
   place, because a reader who has just been handed "997 bids set aside" wants the
   chapter that says what happened, not a scroll hunt. A tile with no href is a plain
   figure, as before. */
export function tiles(items) {
  return el("div", { class: "tiles" }, items.map((tile) => {
    const inner = [el("b", { title: tile.title || "" }, tile.value),
      el("span", tile.label)];
    return tile.href
      ? el("a", { class: "tile", href: tile.href }, inner)
      : el("div", { class: "tile" }, inner);
  }));
}

/* A disclosure that builds its contents the first time it is opened, so a section
   with twelve tables does not build twelve tables to show one. */
export function disclosure(summary, build, opts = {}) {
  const box = el("div");
  const d = el("details", { class: "more", open: opts.open || false },
    el("summary", summary), box);
  let built = false;
  const run = () => {
    if (built) return;
    built = true;
    box.append(build());
  };
  if (opts.open) run(); else d.addEventListener("toggle", () => { if (d.open) run(); });
  return d;
}

export function figure(opts) {
  const plot = el("div", { class: "plot" });
  const f = el("figure", { class: "fig" + (opts.wide ? " wide" : ""), id: opts.id || null },
    el("figcaption", el("h3", opts.title), opts.note ? el("p", opts.note) : null),
    opts.legend || null, plot);
  if (opts.source) f.append(el("p", { class: "source" }, opts.source));
  opts.build(plot);
  /* Every chart here is drawn as an SVG carrying role="img", which hides the text
     inside it from a screen reader. Without a name it would be announced as an
     unlabelled image, so the figure's own heading is put on it — the same words a
     sighted reader gets — and the numbers themselves stay available in the table
     every plot() carries underneath. */
  for (const svg of plot.querySelectorAll("svg[role='img']:not([aria-label])")) {
    svg.setAttribute("aria-label", opts.title);
  }
  return f;
}

export function legend(items) {
  return el("ul", { class: "legend" }, items.map((i) => el("li", {},
    el("span", { class: "swatch", style: { "--c": i.color } }, el("i"), i.label))));
}

export function tabs(items) {
  const bar = el("div", { class: "viewtabs", role: "tablist" });
  const panel = el("div");
  const made = new Map();
  const show = (i) => {
    [...bar.children].forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
    clear(panel);
    if (!made.has(i)) made.set(i, items[i].build());
    panel.append(made.get(i));
  };
  items.forEach((it, i) => bar.append(el("button", {
    type: "button", "aria-pressed": "false", onclick: () => show(i),
  }, it.label)));
  show(0);
  return el("div", bar, panel);
}

/* ---- the table ----
   Every chart on this site has one of these behind it, because a reader who cannot
   see the chart, or does not trust it, must be able to read the same numbers. It
   sorts, filters, pages and hands back a CSV of exactly what is on screen. */
export function dataTable(opts) {
  const cols = opts.columns;
  const all = opts.rows;
  const per = opts.per || 25;
  let rows = all.slice();
  let sortKey = opts.sort || null;
  let dir = opts.dir === "asc" ? 1 : -1;
  let at = 0;
  let q = "";

  const body = el("tbody");
  const head = el("tr");
  const cap = el("caption");
  const count = el("span", { class: "note" });
  const pager = el("div", { class: "pager" });

  const value = (r, c) => (c.cell ? c.cell(r) : r[c.key]);
  const cmp = (a, b) => {
    const c = cols.find((x) => x.key === sortKey);
    if (!c) return 0;
    const x = a[c.key], y = b[c.key];
    if (c.num) return dir * ((+x || 0) - (+y || 0));
    return dir * String(x ?? "").localeCompare(String(y ?? ""), LANG);
  };

  function apply() {
    const needle = q.trim().toLowerCase();
    rows = !needle ? all.slice() : all.filter((r) => cols.some((c) =>
      String(r[c.key] ?? "").toLowerCase().includes(needle)));
    if (sortKey) rows.sort(cmp);
    at = 0;
    draw();
  }

  function draw() {
    clear(body);
    const slice = rows.slice(at, at + per);
    for (const r of slice) {
      body.append(el("tr", cols.map((c) => el("td",
        { class: (c.num ? "num" : "") + (c.wrap ? " wrapcell" : "") }, value(r, c)))));
    }
    count.textContent = rows.length === all.length
      ? t("table.rows", { n: num(all.length) })
      : t("table.rowsOf", { shown: num(rows.length), all: num(all.length) });
    clear(pager);
    if (rows.length > per) {
      pager.append(
        el("button", { class: "act ghost", type: "button", disabled: at === 0,
          onclick: () => { at = Math.max(0, at - per); draw(); } }, t("table.prev")),
        el("span", t("table.range", { from: num(at + 1),
          to: num(Math.min(at + per, rows.length)) })),
        el("button", { class: "act ghost", type: "button",
          disabled: at + per >= rows.length,
          onclick: () => { at = Math.min(rows.length - 1, at + per); draw(); } },
        t("table.next")));
    }
  }

  for (const c of cols) {
    head.append(el("th", { scope: "col", "aria-sort": "none" },
      el("button", { type: "button", onclick: (e) => {
        dir = sortKey === c.key ? -dir : (c.num ? -1 : 1);
        sortKey = c.key;
        [...head.children].forEach((th, i) => th.setAttribute("aria-sort",
          cols[i].key === sortKey ? (dir === 1 ? "ascending" : "descending") : "none"));
        e.currentTarget.closest("th").setAttribute("aria-sort",
          dir === 1 ? "ascending" : "descending");
        apply();
      } }, c.label, el("span", { class: "note", "aria-hidden": "true" }, "⇅"))));
  }

  const bar = el("div", { class: "tablebar" });
  if (opts.filter !== false) {
    bar.append(el("div", { class: "grow" }, el("label", { class: "field" },
      el("span", { class: "sr" }, t("table.filterLabel")),
      el("input", { type: "search", placeholder: t("table.filterHint"),
        oninput: (e) => { q = e.target.value; apply(); } }))));
  }
  bar.append(count);
  if (opts.filename) {
    bar.append(el("button", { class: "act ghost", type: "button", onclick: () =>
      downloadCsv(opts.filename, cols, rows) }, t("table.csv")));
  }

  if (opts.caption) cap.textContent = opts.caption;
  /* A table needs a name of its own. Where a caption is printed, that is the name;
     where the table sits inside a figure whose heading already names it, the heading
     is passed in as label instead, so the name is announced once and not twice. */
  const table = el("table", { class: "grid" }, opts.caption ? cap : null,
    el("thead", head), body);
  if (!opts.caption && opts.label) table.setAttribute("aria-label", opts.label);
  apply();
  return el("div", bar, el("div", { class: "tablewrap" }, table), pager);
}

function csvCell(v) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(filename, cols, rows) {
  const lines = [cols.map((c) => csvCell(c.label)).join(",")];
  for (const r of rows) lines.push(cols.map((c) => csvCell(r[c.key])).join(","));
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = el("a", { href: URL.createObjectURL(blob), download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}


