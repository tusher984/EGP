/* The evidence layer: the part that lets an editor check the work.

   Every finding on the site is rendered by findingCard, and every card carries the
   documents it rests on. Opening one shows the page exactly as the parser read it,
   beside a link that opens the PDF at that page in the browser's own viewer. The
   page text is not a summary of the page: it is the text the pipeline extracted,
   which is the thing an editor needs to see in order to disagree with it. */

import { el, chip, cite, num, disclosure, escapeHtml, clear } from "../components/ui.js";
import { evidence, table, pageShard } from "../app/data.js";

export function findingCard(f, index, opts = {}) {
  const cites = (index && index.findings.find((x) => x.id === f.id)) || null;
  const refs = (cites && cites.citations) || f.evidence || [];
  const card = el("article", { class: "finding", id: `finding-${f.id}` },
    el("span", { class: "fid" }, f.id),
    chip(f.type),
    el("h3", f.headline),
    f.detail ? el("p", { class: "detail" }, f.detail) : null);

  if (f.numbers && Object.keys(f.numbers).length) {
    card.append(el("ul", { class: "numbers" },
      Object.entries(f.numbers)
        .filter(([, v]) => typeof v !== "object")
        .map(([k, v]) => el("li", el("b", typeof v === "number" ? num(v) : String(v)),
          " ", k.replace(/_/g, " ")))));
  }

  const list = refs.slice(0, opts.maxCitations || 8);
  if (list.length) {
    card.append(disclosure(`Check this against ${list.length === 1 ? "the document"
      : `${list.length} documents`}`, () => evidencePanel(list, f)));
  } else {
    card.append(el("p", { class: "note" },
      "This finding is arithmetic over the whole dataset rather than a single page; "
      + "the calculation is printed above and the tables it runs on are in the downloads."));
  }
  if (f.calculation) {
    card.append(el("p", { class: "source" },
      el("span", "How it was worked out: "), el("span", { class: "mono" }, f.calculation)));
  }
  return card;
}

function evidencePanel(refs, f) {
  const box = el("div");
  box.append(el("p", { class: "loading" }, "Reading the pages"));
  evidence().then((index) => {
    clear(box);
    for (const ref of refs) {
      const key = String(ref).replace(/\s+p/, "#");
      const c = index.citations[key] || index.citations[String(ref)];
      const [file, page] = key.split("#");
      const head = el("p", { class: "source" },
        cite(file, page ? +page : null), c
          ? el("span", `${c.kind.replace(/_/g, " ")}, ${num(c.pages_in_document)} pages, `
            + `second extractor agrees: ${c.extractors_agree}`)
          : el("span", "this page is not in the evidence index"));
      box.append(head);
      if (c && c.quoted_in_the_finding) {
        box.append(el("blockquote", { class: "quote" },
          el("span", { html: `&ldquo;${escapeHtml(c.quoted_in_the_finding)}&rdquo;` }),
          el("span", { class: "src" }, "the words this finding quotes, as extracted")));
      }
      if (c && c.page_text && c.page_text.length) {
        box.append(disclosure("Show the page as the parser read it", () =>
          el("div", { class: "pageview" }, c.page_text.map((p) =>
            el("div", el("h4", `Page ${p.n ?? p.page}`),
              el("pre", p.text + (p.truncated ? "\n… page continues" : "")))))));
      }
    }
    if (f.confidence || (index.findings.find((x) => x.id === f.id) || {}).confidence) {
      const conf = f.confidence
        || index.findings.find((x) => x.id === f.id).confidence;
      box.append(el("p", { class: "note" }, "Confidence: ", conf));
    }
  }).catch((e) => { clear(box); box.append(el("p", { class: "warn" }, String(e.message))); });
  return box;
}

/* ---- the document browser ----
   All 1,805 PDFs, the text read out of each one, and the PDF itself one click away.
   Nothing between the reader and the source. */
export function documentBrowser() {
  const search = el("input", { type: "search",
    placeholder: "Filter by file name, tender number or folder…" });
  const count = el("p", { class: "note" }, "Loading the document list");
  const picker = el("div", { class: "picker", role: "listbox",
    "aria-label": "the documents in the folder" });
  const view = el("div", { class: "pageview" },
    el("p", { class: "note" }, "Choose a document to read the text that was extracted from it."));
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
        el("small", `${r.folder} · ${r.kind.replace(/_/g, " ")} · `
          + `${num(r.pages)} page${+r.pages === 1 ? "" : "s"} · `
          + `${num(r.characters)} characters read`)));
    }
    count.textContent = hits.length > SHOW
      ? `${num(hits.length)} documents match; the first ${SHOW} are listed`
      : `${num(hits.length)} of ${num(rows.length)} documents`;
  }

  function open(r, button) {
    [...picker.children].forEach((b) => b.setAttribute("aria-current", "false"));
    if (button) button.setAttribute("aria-current", "true");
    clear(view);
    view.append(el("p", { class: "loading" }, `Reading ${r.filename}`));
    pageShard(r.document_id).then((shard) => {
      clear(view);
      view.append(el("p", { class: "source" },
        cite(r.file, 1, { label: `Open ${r.filename}` }),
        el("span", `${num(r.pages)} pages · ${num(r.words)} words · `
          + `text layer: ${r.has_text_layer} · OCR needed: ${r.needs_ocr} · `
          + `second extractor agrees: ${r.extractors_agree}`)));
      if (+r.interleaved_layout_warnings > 0) {
        view.append(el("p", { class: "warn" }, "This document's layout interleaves two "
          + "columns when it is extracted linearly. The parser read its change table by "
          + "word coordinates instead; the text below is the linear reading, so a line "
          + "may print an old value and a new value together."));
      }
      for (const p of shard.pages) {
        view.append(el("div", el("h4", `Page ${p.n} `,
          el("a", { class: "cite", href: cite(r.file, p.n).href, target: "_blank",
            rel: "noopener" }, "open this page")),
          el("pre", p.text || "(no text on this page)")));
      }
    }).catch((e) => { clear(view); view.append(el("p", { class: "warn" }, String(e.message))); });
  }

  search.addEventListener("input", paint);
  table("documents").then((t) => {
    rows = t.rows.slice().sort((a, b) => a.filename.localeCompare(b.filename, "en"));
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
      el("p", { class: "kicker" }, "The evidence itself"),
      el("h2", "Open any document, page by page"),
      el("div", { class: "prose" },
        el("p", "Every PDF in the folder is listed here with what the parser found "
          + "in it: how many pages, how many words, whether it carried a text layer, "
          + "whether a second extractor read it the same way. Choosing one prints the "
          + "text of each of its pages."),
        el("p", "That text is not a description of the page. It is the text this "
          + "investigation was built from, character for character, so that a reader "
          + "who thinks a number was misread can see the line it was read from. The "
          + "link at the top of each document, and on every page heading, opens the "
          + "PDF itself at that page, which is the only way to be sure.")),
      documentBrowser()));
}
