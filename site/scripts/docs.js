/* e-GP WATCH — the documents tab: all 1,805 PDFs, listed and openable.
   ------------------------------------------------------------------
   The investigation has one source, and this is it. Every file that was read
   is listed here with the number of pages read out of it, the tender it
   belongs to, and a link that opens the PDF itself. Nothing is behind a
   summary: if a figure anywhere on this site came out of a document, that
   document is a row on this page.

   Filenames are printed exactly as they sit on disk, in both editions, because
   an editor checking a number needs to type the same string into a file
   browser. The directory name "Tender Notice_PDFs" contains a space, so every
   link is percent-encoded segment by segment. */

import { el, t, n, digits, date, dash, taka, href, fill, clear, human, ofTotal } from "./core.js";
import { figure, table, barsH, hue } from "./charts.js";
import { UI } from "./content.js";

const W = {
  intro: {
    en: "Every PDF the investigation read, and nothing else. {{counts.notices|n}} tender notices, {{counts.awards|n}} award notices and the {{counts.references|n}} standard documents the {{counts.rules|n}} rules were drawn from. Each row opens the file.",
    bn: "এই অনুসন্ধানে পড়া প্রতিটি পিডিএফ, আর কিছু নয়। {{counts.notices|n}}টি দরপত্র বিজ্ঞপ্তি, {{counts.awards|n}}টি চুক্তির বিজ্ঞপ্তি, এবং {{counts.rules|n}}টি নিয়ম যে {{counts.references|n}}টি আদর্শ দস্তাবেজ থেকে নেওয়া। প্রতিটি সারি ফাইলটি খোলে।",
  },
  refHead: { en: "The {{n}} standard documents the rules came from", bn: "নিয়মগুলো যে {{n}}টি আদর্শ দস্তাবেজ থেকে" },
  refNote: {
    en: "These are the only documents in the folder that state a rule rather than record a tender. Every clause tested on the rules tab is quoted from one of them.",
    bn: "ফোল্ডারের এই দস্তাবেজগুলোই কোনো দরপত্রের বিবরণ নয়, বরং নিয়ম বলে। নিয়ম ট্যাবে পরীক্ষিত প্রতিটি ধারা এগুলোর একটি থেকে উদ্ধৃত।",
  },
  citedBy: { en: "Rules drawn from it", bn: "এখান থেকে নেওয়া নিয়ম" },
  listHead: { en: "The whole index", bn: "সম্পূর্ণ তালিকা" },
  listNote: { en: "{{counts.pdfs|n}} files, filtered and openable", bn: "{{counts.pdfs|n}}টি ফাইল, ছেঁকে দেখা ও খোলা যায়" },
  kind: { en: "Kind of document", bn: "নথির ধরন" },
  q: { en: "Filename, tender number, title or reference", bn: "ফাইলের নাম, দরপত্র নম্বর, শিরোনাম বা রেফারেন্স" },
  pages: { en: "pp.", bn: "পৃ." },
  noHits: { en: "No file matches that.", bn: "এর সঙ্গে কোনো ফাইল মেলেনি।" },
  denied: { en: "Files the portal would not serve", bn: "পোর্টাল যে ফাইল দেয়নি" },
};

const KINDS = {
  notice: { en: "Tender notice", bn: "দরপত্র বিজ্ঞপ্তি" },
  award: { en: "Award notice", bn: "চুক্তির বিজ্ঞপ্তি" },
  reference: { en: "Standard document", bn: "আদর্শ দস্তাবেজ" },
};

const PAGE = 60;

function pages(r) {
  const p = parseInt(r.pages, 10);
  return Number.isNaN(p) ? null : p;
}

/** One row of the index: the filename as it is on disk, what it is, and a link
    that opens it. The link is the whole point of the tab, so it is last and it
    is always there. */
function docRow(r) {
  const p = pages(r);
  /* The procuring entity leads, as it does in every citation on this site. */
  const meta = [
    r.agency,
    t(KINDS[r.kind] || { en: human(r.kind), bn: human(r.kind) }),
    p === null ? null : digits(p) + " " + t(W.pages),
    r.date ? date(r.date) : null,
    r.value === null || r.value === undefined ? null : taka(r.value),
  ].filter(Boolean).join("  ·  ");

  return el("li", { class: "doc-row" }, [
    el("span", { class: "doc-name" }, [
      el("code", { text: r.file }),
      r.title ? el("span", { text: " — " + r.title }) : null,
      r.tender_id ? el("span", { text: " · " + t(UI.words.tender) + " " + digits(r.tender_id) }) : null,
    ].filter(Boolean)),
    el("span", { class: "doc-meta", text: meta }),
    el("a", { class: "doc-open", href: href(r.dir, r.file), text: t(UI.words.open) }),
  ]);
}

/* The five standard documents, separated out because they are a different kind
   of thing: they do not record a tender, they state the rule a tender is tested
   against. Each one lists which of the eighteen tests quote it. */
function refBlock(rows) {
  const refs = rows.filter((r) => r.kind === "reference");
  if (!refs.length) return null;
  return el("div", null, [
    el("p", { class: "note-title", html: fill(t(W.refHead), { n: refs.length }) }),
    el("p", { class: "measure", text: t(W.refNote) }),
    el("ul", { class: "dl-list" }, refs.map((r) => el("li", { class: "dl-row" }, [
      el("span", { class: "dl-what" }, el("code", { text: r.file })),
      el("span", { class: "dl-note", text: (r.cited_by || []).length
        ? t(W.citedBy) + ": " + r.cited_by.join(", ")
        : dash() }),
      el("span", { class: "dl-size" }, el("a", { href: href(r.dir, r.file), text: t(UI.words.open) })),
    ]))),
  ]);
}

/** Documents and pages per authority. One figure, because the only question a
    reader has about a file index is whether it is complete. */
function coverage(rows, corpus) {
  const tally = new Map();
  for (const r of rows) {
    if (!tally.has(r.agency)) tally.set(r.agency, { files: 0, pages: 0 });
    const cell = tally.get(r.agency);
    cell.files += 1;
    cell.pages += pages(r) || 0;
  }
  const ordered = [...tally.entries()].sort((a, b) => b[1].files - a[1].files);
  const totalPages = ordered.reduce((s, x) => s + x[1].pages, 0);

  return figure({
    title: { en: "How many files came from each authority", bn: "কোন সংস্থা থেকে কতটি ফাইল" },
    deck: {
      en: n(rows.length) + " files in all, " + n(totalPages) + " pages read. " +
        "Five of them are standard documents rather than tenders, listed under RULEBOOK.",
      bn: "মোট " + n(rows.length) + "টি ফাইল, " + n(totalPages) + " পৃষ্ঠা পড়া হয়েছে। " +
        "এর পাঁচটি দরপত্র নয়, আদর্শ দস্তাবেজ — RULEBOOK নামে তালিকাভুক্ত।",
    },
    plot: barsH(ordered.map(([key, cell]) => ({ label: key, value: cell.files })), {
      labelW: 110, valueW: 70, rowH: 26, color: hue(0),
      alt: t({ en: "Files per authority.", bn: "সংস্থাপ্রতি ফাইল।" }),
    }),
    table: table(
      [UI.words.agency, { en: "Files", bn: "ফাইল" }, { en: "Pages read", bn: "পড়া পৃষ্ঠা" }],
      ordered.map(([key, cell]) => [key, n(cell.files), n(cell.pages)])
    ),
    source: {
      en: t(UI.words.source) + ": the folders themselves — <code>Tender Notice_PDFs</code>, " +
        "<code>Contract_Awards_PDFs</code> and <code>eGP_Forensic_Engine</code>.",
      bn: t(UI.words.source) + ": ফোল্ডারগুলো নিজেই — <code>Tender Notice_PDFs</code>, " +
        "<code>Contract_Awards_PDFs</code> ও <code>eGP_Forensic_Engine</code>।",
    },
  });
}

/** Distinct values of a column, read off the rows so a value that does not
    occur is never offered as a filter. */
function optionsFor(rows, col, map) {
  const tally = new Map();
  for (const r of rows) tally.set(String(r[col] || ""), (tally.get(String(r[col] || "")) || 0) + 1);
  const out = [{ value: "", label: t(UI.words.all) + " (" + n(rows.length) + ")" }];
  for (const key of [...tally.keys()].sort((a, b) => tally.get(b) - tally.get(a))) {
    const words = map && map[key] ? t(map[key]) : (key || t(UI.words.none));
    out.push({ value: key, label: words + " (" + n(tally.get(key)) + ")" });
  }
  return out;
}

function select(id, labelPair, options) {
  const sel = el("select", { id: id });
  for (const opt of options) sel.appendChild(el("option", { value: opt.value, text: opt.label }));
  return { sel: sel, node: el("div", { class: "ctl" }, [
    el("label", { for: id, text: t(labelPair) }), sel]) };
}

function docIndex(rows) {
  const kind = select("d-kind", W.kind, optionsFor(rows, "kind", KINDS));
  const agency = select("d-agency", UI.words.agency, optionsFor(rows, "agency"));
  const input = el("input", { type: "search", id: "d-q", autocomplete: "off", spellcheck: "false" });
  const status = el("p", { class: "result-count" });
  const list = el("ul", { class: "dl-list" });
  const more = el("button", { class: "btn btn-quiet hide", type: "button", text: t(UI.words.more) });
  let kept = [], shown = 0;

  function draw() {
    for (const r of kept.slice(shown, shown + PAGE)) list.appendChild(docRow(r));
    shown = Math.min(kept.length, shown + PAGE);
    more.classList.toggle("hide", shown >= kept.length);
    more.textContent = t(UI.words.more) + " (" + n(kept.length - shown) + ")";
  }

  function run() {
    const q = input.value.trim().toLowerCase();
    const fk = kind.sel.value, fa = agency.sel.value;
    kept = rows.filter((r) => {
      if (fk && r.kind !== fk) return false;
      if (fa && String(r.agency || "") !== fa) return false;
      if (!q) return true;
      return [r.file, r.title, r.reference, r.tender_id, r.entity]
        .some((v) => v && String(v).toLowerCase().indexOf(q) >= 0);
    });
    clear(list); clear(status); shown = 0;
    status.appendChild(ofTotal(kept.length, rows.length, { en: "files", bn: "ফাইল" }));
    if (!kept.length) list.appendChild(el("li", { class: "tbl-empty", text: t(W.noHits) }));
    else draw();
  }

  let timer = 0;
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(run, 200); });
  kind.sel.addEventListener("change", run);
  agency.sel.addEventListener("change", run);
  more.addEventListener("click", draw);
  run();

  return el("div", null, [
    el("div", { class: "controls" }, [
      el("div", { class: "ctl ctl-grow" }, [el("label", { for: "d-q", text: t(W.q) }), input]),
      kind.node, agency.node,
    ]),
    status, list,
    el("div", { class: "chips" }, more),
  ]);
}

/* Five notices were downloaded but the portal would not release the criteria
   inside them. The files exist and are listed above; what is missing is a
   section of their content, and saying so is more useful than a blank cell. */
function refused(tenders) {
  const rows = (tenders || []).filter((r) => r.notice_access_denied === "yes");
  if (!rows.length) return null;
  return el("aside", { class: "note" }, [
    el("p", { class: "note-title", text: t(W.denied) }),
    el("p", { text: t({
      en: "The notice PDF for these " + n(rows.length) +
        " tenders was obtained, but the portal did not release the eligibility section inside it. They are counted in every total on this site and marked as not documented wherever a criterion would otherwise appear — they are not dropped, and they are not read as having no criteria.",
      bn: "এই " + n(rows.length) +
        "টি দরপত্রের বিজ্ঞপ্তি পিডিএফ পাওয়া গেছে, কিন্তু পোর্টাল ভেতরের যোগ্যতার অংশটি দেয়নি। এগুলো এই সাইটের প্রতিটি হিসাবে ধরা আছে এবং যেখানে শর্ত থাকার কথা সেখানে ‘নথিভুক্ত নয়’ লেখা — বাদ দেওয়া হয়নি, আর শর্তহীন হিসেবেও পড়া হয়নি।",
    }) }),
    el("ul", { class: "dl-list" }, rows.map((r) => el("li", { class: "dl-row" }, [
      el("span", { class: "dl-what", text: digits(r.tender_id) }),
      el("span", { class: "dl-note", text: (r.agency || "") + " — " +
        (r.package_description || r.project_name || dash()) }),
      el("span", { class: "dl-size" }, r.notice && r.notice.file
        ? el("a", { href: href(r.notice.dir, r.notice.file), text: t(UI.words.open) })
        : dash()),
    ]))),
  ]);
}

/** Build the documents tab into `root`. `data.documents` is the file index and
    `data.tenders` is the register, used only for the five refused notices. */
export function renderDocs(root, corpus, data) {
  const rows = data.documents;

  root.appendChild(el("div", { class: "measure" }, [
    el("p", { html: fill(t(W.intro), corpus) }),
    el("p", {
      html: fill(t({
        en: "{{counts.pdfs}} files: {{counts.notices}} tender notices, {{counts.awards}} award notices and {{counts.references}} standard documents. Every one was machine-readable — {{counts.ocr_used}} needed optical character recognition, so no figure on this site was read off a picture of a page.",
        bn: "{{counts.pdfs}}টি ফাইল: {{counts.notices}}টি দরপত্র বিজ্ঞপ্তি, {{counts.awards}}টি চুক্তির বিজ্ঞপ্তি ও {{counts.references}}টি আদর্শ দস্তাবেজ। প্রতিটিই যন্ত্রে-পাঠযোগ্য ছিল — {{counts.ocr_used}}টিতে ওসিআর লাগেনি, তাই এই সাইটের কোনো সংখ্যা পৃষ্ঠার ছবি থেকে পড়া হয়নি।",
      }), corpus),
    }),
  ]));

  root.appendChild(coverage(rows, corpus));

  const ref = refBlock(rows);
  if (ref) root.appendChild(ref);

  const refusedNote = refused(data.tenders);
  if (refusedNote) root.appendChild(refusedNote);

  const body = el("div", { class: "open-body" });
  const disc = el("details", { class: "open", id: "doc-index" }, [
    el("summary", null, [
      el("span", { text: t(W.listHead) }),
      el("span", { class: "open-note", html: fill(t(W.listNote), corpus) }),
    ]),
    body,
  ]);
  const build = () => { if (!body.firstChild) body.appendChild(docIndex(rows)); };
  disc.addEventListener("toggle", () => { if (disc.open) build(); });
  disc.setAttribute("open", "true");
  build();
  root.appendChild(el("div", { class: "open-stack" }, disc));

  root.appendChild(el("p", { class: "src", text: t({
    en: "Filenames are printed exactly as they are on disk in both editions, so the string here can be typed into a file browser. Links open the PDF in this browser; nothing is fetched from outside this folder.",
    bn: "ফাইলের নাম দুই সংস্করণেই ডিস্কে যেমন আছে হুবহু তেমন ছাপা, যাতে এখানকার লেখা ফাইল ব্রাউজারে টাইপ করা যায়। লিংক এই ব্রাউজারেই পিডিএফ খোলে; এই ফোল্ডারের বাইরে থেকে কিছু আনা হয় না।",
  }) }));

  return root;
}
