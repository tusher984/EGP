/* The evidence layer: the part that lets an editor check the work.

   Every finding on the site is rendered by findingCard, and every card carries the
   documents it rests on. Opening one shows the page exactly as the parser read it,
   beside a link that opens the PDF at that page in the browser's own viewer. The
   page text is not a summary of the page: it is the text the pipeline extracted,
   which is the thing an editor needs to see in order to disagree with it.

   Two things here are never translated, in either edition. The extracted page text is
   printed character for character — translating it would defeat the entire purpose of
   printing it. And a filename is a filename. The sentences around them are the pack's:
   a finding's own headline goes through dataText(), because 04_analysis.py wrote it. */

import { el, chip, cite, num, disclosure, escapeHtml, clear } from "../components/ui.js";
import { t, word, dataText } from "../i18n/i18n.js";
import { evidence, table, pageShard } from "../app/data.js";

export function findingCard(f, index, opts = {}) {
  const cites = (index && index.findings.find((x) => x.id === f.id)) || null;
  const refs = (cites && cites.citations) || f.evidence || [];
  const card = el("article", { class: "finding", id: `finding-${f.id}` },
    el("span", { class: "fid" }, f.id),
    chip(f.type),
    el("h3", dataText(f.headline)),
    f.detail ? el("p", { class: "detail" }, dataText(f.detail)) : null);

  if (f.numbers && Object.keys(f.numbers).length) {
    card.append(el("ul", { class: "numbers" },
      Object.entries(f.numbers)
        .filter(([, v]) => typeof v !== "object")
        .map(([k, v]) => el("li", el("b", typeof v === "number" ? num(v) : String(v)),
          " ", word(`fnum.${k}`, k.replace(/_/g, " "))))));
  }

  const list = refs.slice(0, opts.maxCitations || 8);
  if (list.length) {
    card.append(disclosure(t(list.length === 1 ? "ev.check.one" : "ev.check.many",
      { n: num(list.length) }), () => evidencePanel(list, f)));
  } else {
    card.append(el("p", { class: "note" }, t("ev.wholeDataset")));
  }
  if (f.calculation) {
    card.append(el("p", { class: "source" },
      el("span", t("ev.howWorkedOut")), " ",
      el("span", { class: "mono" }, f.calculation)));
  }
  return card;
}

function evidencePanel(refs, f) {
  const box = el("div");
  box.append(el("p", { class: "loading" }, t("ev.loading")));
  evidence().then((index) => {
    clear(box);
    for (const ref of refs) {
      const key = String(ref).replace(/\s+p/, "#");
      const c = index.citations[key] || index.citations[String(ref)];
      const [file, page] = key.split("#");
      const head = el("p", { class: "source" },
        cite(file, page ? +page : null), c
          ? el("span", t("ev.docMeta", {
            kind: word(`kind.${c.kind}`, c.kind.replace(/_/g, " ")),
            pages: num(c.pages_in_document),
            agree: word(`yn.${c.extractors_agree}`, c.extractors_agree) }))
          : el("span", t("ev.notInIndex")));
      box.append(head);
      if (c && c.quoted_in_the_finding) {
        box.append(el("blockquote", { class: "quote" },
          el("span", { html: `&ldquo;${escapeHtml(c.quoted_in_the_finding)}&rdquo;` }),
          el("span", { class: "src" }, t("ev.quotedWords"))));
      }
      if (c && c.page_text && c.page_text.length) {
        box.append(disclosure(t("ev.showPage"), () =>
          el("div", { class: "pageview" }, c.page_text.map((p) =>
            el("div", el("h4", t("ev.page", { n: num(p.n ?? p.page) })),
              el("pre", p.text + (p.truncated ? `\n${t("ev.pageContinues")}` : "")))))));
      }
    }
    if (f.confidence || (index.findings.find((x) => x.id === f.id) || {}).confidence) {
      const conf = f.confidence
        || index.findings.find((x) => x.id === f.id).confidence;
      box.append(el("p", { class: "note" }, t("ev.confidence"), " ", dataText(conf)));
    }
  }).catch((e) => { clear(box); box.append(el("p", { class: "warn" }, String(e.message))); });
  return box;
}

/* ---- the document browser ----
   Every PDF in the folder, the text read out of each one, and the PDF itself one click
   away. Nothing between the reader and the source.

   The list is sorted with English collation whatever the reader's language is, because
   what it sorts is filenames, and a filename in this archive is ASCII. */
export function documentBrowser() {
  const search = el("input", { type: "search", placeholder: t("doc.filterHint") });
  const count = el("p", { class: "note" }, t("doc.loadingList"));
  const picker = el("div", { class: "picker", role: "listbox",
    "aria-label": t("doc.pickerAria") });
  const view = el("div", { class: "pageview" },
    el("p", { class: "note" }, t("doc.choose")));
  const wrap = el("div",
    el("div", { class: "tablebar" }, el("div", { class: "grow" }, search), count),
    el("div", { class: "split" }, picker, view));

  let rows = [];
  const SHOW = 300;

  function paint() {
    const q = search.value.trim().toLowerCase();
    const hits = !q ? rows : rows.filter((r) =>
      `${r.filename} ${r.tender_id} ${r.folder} ${r.kind}`.toLowerCase().includes(q));
    clear(picker);
    for (const r of hits.slice(0, SHOW)) {
      picker.append(el("button", { type: "button", role: "option",
        onclick: (e) => open(r, e.currentTarget) },
        r.filename,
        el("small", t("doc.itemMeta", {
          folder: r.folder,
          kind: word(`kind.${r.kind}`, r.kind.replace(/_/g, " ")),
          pages: t(+r.pages === 1 ? "doc.pages.one" : "doc.pages.many",
            { n: num(r.pages) }),
          characters: num(r.characters) }))));
    }
    count.textContent = hits.length > SHOW
      ? t("doc.matchCapped", { n: num(hits.length), shown: num(SHOW) })
      : t("doc.countOf", { n: num(hits.length), total: num(rows.length) });
  }

  function open(r, button) {
    [...picker.children].forEach((b) => b.setAttribute("aria-current", "false"));
    if (button) button.setAttribute("aria-current", "true");
    clear(view);
    view.append(el("p", { class: "loading" }, t("doc.reading", { file: r.filename })));
    pageShard(r.document_id).then((shard) => {
      clear(view);
      view.append(el("p", { class: "source" },
        cite(r.file, 1, { label: t("doc.openFile", { file: r.filename }) }),
        el("span", t("doc.meta", {
          pages: t(+r.pages === 1 ? "doc.pages.one" : "doc.pages.many",
            { n: num(r.pages) }),
          words: t(+r.words === 1 ? "doc.words.one" : "doc.words.many",
            { n: num(r.words) }),
          textLayer: word(`yn.${r.has_text_layer}`, r.has_text_layer),
          ocr: word(`yn.${r.needs_ocr}`, r.needs_ocr),
          agree: word(`yn.${r.extractors_agree}`, r.extractors_agree) }))));
      if (+r.interleaved_layout_warnings > 0) {
        view.append(el("p", { class: "warn" }, t("doc.interleaved")));
      }
      for (const p of shard.pages) {
        view.append(el("div", el("h4", t("ev.page", { n: num(p.n) }), " ",
          el("a", { class: "cite", href: cite(r.file, p.n).href, target: "_blank",
            rel: "noopener" }, t("doc.openThisPage"))),
          el("pre", p.text || t("doc.noText"))));
      }
    }).catch((e) => { clear(view); view.append(el("p", { class: "warn" }, String(e.message))); });
  }

  search.addEventListener("input", paint);
  table("documents").then((rowset) => {
    rows = rowset.rows.slice()
      .sort((a, b) => a.filename.localeCompare(b.filename, "en"));
    paint();
  }).catch((e) => { count.textContent = String(e.message); });
  return wrap;
}

/* The band the browser sits in. It belongs here rather than in the page assembler
   because the warning a reader needs before reading extracted text — that this is
   what the parser saw and not a picture of the page — belongs beside the code that
   prints that text. */
export function documentSection() {
  return el("section", { class: "band", id: "documents" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, t("doc.kicker")),
      el("h2", t("doc.title")),
      el("div", { class: "prose" },
        el("p", t("doc.p1")),
        el("p", t("doc.p2"))),
      documentBrowser()));
}
