/* e-GP WATCH — the shell: one article, four sections under it, two editions.
   ------------------------------------------------------------------
   This file draws nothing a reader reads. It builds the masthead, the article,
   and the four sections beneath it, then hands each section to the module that
   fills it.

   The investigation is the page. Rules tested, the data explorer, the document
   index and the method are not tabs standing beside it: they sit at the bottom,
   closed, and a reader who wants them opens them there. Four decisions here are
   not obvious from the code:

   · A section is built once, on first open, and its data is fetched then. The
     article needs corpus.json alone, so the page paints before the 3.2 MB
     tender register has been asked for. A reader who never opens the document
     index never downloads it.

   · The hash is still the address. #rules #tools #docs #method open a section;
     any other hash naming an element inside one opens that section and scrolls
     to the element, so #rule-R07 and #tool-search are links an editor can send
     to someone. Every jump is instant: the stylesheet asks for smooth
     scrolling, which is right inside a page and wrong for a jump down to a
     section that has just opened.

   · Opening a section by hand writes the hash, so the address bar names what
     is on screen and the back button walks out of it. A section opened by a
     link writes nothing, because the hash it was opened by is already there —
     and overwriting it would break the deep links this whole scheme rests on.

   · Switching edition redraws the article and every section that had been
     built. Nothing is translated in place — each string comes from an {en, bn}
     pair resolved when the node is made, so redrawing is the only way the two
     editions cannot drift. Sections you had open are reopened; disclosures
     inside them are not. */

import { el, t, clear, fill, load, state, setLang } from "./core.js";
import { UI, HEAD } from "./content.js";
import { renderStory } from "./story.js";
import { renderRules } from "./rules.js";
import { renderTools } from "./tools.js";
import { renderDocs } from "./docs.js";
import { renderMethod } from "./method.js";

const STORY = "story";

/* The four sections, in the order a reader meets them. `needs` names the
   payloads in site/data/ the section cannot draw without — fetched on first
   open, never before. `note` is the line beside the heading, written with
   {{tokens}} so that not one figure on a section label is typed here. */
const SECTIONS = [
  {
    key: "rules", needs: ["rules"],
    note: {
      en: "{{counts.rules|n}} rules · {{rules_summary.tested_rows|n}} tests · {{rules_summary.deviation_rows|n}} deviations",
      bn: "{{counts.rules|n}}টি নিয়ম · {{rules_summary.tested_rows|n}}টি পরীক্ষা · {{rules_summary.deviation_rows|n}}টি বিচ্যুতি",
    },
  },
  {
    key: "tools",
    needs: ["tenders", "details", "deviations", "bidders", "winners", "doctext"],
    note: {
      en: "{{counts.tenders|n}} tenders · {{counts.winners|n}} firms · full-text search",
      bn: "{{counts.tenders|n}}টি দরপত্র · {{counts.winners|n}}টি প্রতিষ্ঠান · সম্পূর্ণ লেখায় খোঁজ",
    },
  },
  {
    key: "docs", needs: ["documents", "tenders"],
    note: {
      en: "{{counts.pdfs|n}} PDFs · {{counts.notices|n}} notices · {{counts.awards|n}} awards",
      bn: "{{counts.pdfs|n}}টি পিডিএফ · {{counts.notices|n}}টি বিজ্ঞপ্তি · {{counts.awards|n}}টি চুক্তির নথি",
    },
  },
  {
    key: "method", needs: [],
    note: {
      en: "Sources, extraction, citation, limits, corrections",
      bn: "সূত্র, নিষ্কাশন, উদ্ধৃতির রীতি, সীমা, সংশোধন",
    },
  },
];

const ALL = [{ key: STORY, needs: [] }].concat(SECTIONS);

/* A hash that is not a section name and not an id already on the page: these
   prefixes say which section owns it, so #rule-R07 can be opened cold. */
const DEEP = [
  { prefix: "rule-", tab: "rules" },
  { prefix: "tool-", tab: "tools" },
  { prefix: "doc-", tab: "docs" },
];

const KEYS = { lang: "egp-watch-lang", theme: "egp-watch-theme" };

const W = {
  sections: { en: "Sections of the investigation", bn: "অনুসন্ধানের অংশগুলো" },
  moreTitle: { en: "Everything this was built from", bn: "যা থেকে এটি তৈরি" },
  moreNote: {
    en: "The story ends above. What it was built out of is below, closed until you want it: the rules we tested a tender against, every tender in a table you can search and sort, all {{counts.pdfs|n}} source PDFs, and a plain account of how the whole thing was made and where it falls short. Open one and it stays open. Nothing here is a summary of the story — it is the material, and you are meant to disagree with us using it.",
    bn: "গল্প এখানেই শেষ। যা থেকে এটি তৈরি, তা নিচে — বন্ধ অবস্থায়, আপনি চাইলে খুলবে: যে নিয়মগুলোর সঙ্গে প্রতিটি দরপত্র মিলিয়ে দেখা হয়েছে, খোঁজা ও সাজানো যায় এমন টেবিলে প্রতিটি দরপত্র, উৎসের {{counts.pdfs|n}}টি পিডিএফ, এবং কীভাবে পুরোটা করা হলো ও কোথায় ঘাটতি আছে তার সরল বিবরণ। একটা খুললে খোলাই থাকবে। এখানে গল্পের সারসংক্ষেপ কিছু নেই — এটি উপকরণ, এবং এটি দিয়েই আমাদের সঙ্গে দ্বিমত করা যায়।",
  },
  footNote: {
    en: "Built from the documents in this folder and nothing else. No network host is contacted; no figure on this page was typed by hand.",
    bn: "এই ফোল্ডারের দস্তাবেজ থেকেই তৈরি, আর কিছু থেকে নয়। কোনো নেটওয়ার্ক হোস্টে যোগাযোগ করা হয় না; এই পৃষ্ঠার কোনো সংখ্যা হাতে লেখা নয়।",
  },
  fileHint: {
    en: "Open <code>index.html</code> from the repository root. Every path on this page is relative to it.",
    bn: "রিপোজিটরির মূল ফোল্ডার থেকে <code>index.html</code> খুলুন। এই পৃষ্ঠার প্রতিটি পথ সেটির সাপেক্ষে।",
  },
};

function remember(key, value) {
  try { localStorage.setItem(key, value); } catch (err) { /* private mode */ }
}

function recall(key) {
  try { return localStorage.getItem(key); } catch (err) { return null; }
}

const view = { corpus: null, panels: {}, pending: {} };

/* ------------------------------------------------------------------ scrolling
   The stylesheet asks for smooth scrolling, which is right for a link inside
   the article and wrong for a jump to a section that opened a moment ago. Every
   jump here is instant, and lands below the sticky masthead. */

function toTop() {
  window.scrollTo({ top: 0, behavior: "instant" });
}

function toElement(node) {
  const bar = document.querySelector(".masthead");
  const under = bar ? bar.getBoundingClientRect().height : 0;
  const y = node.getBoundingClientRect().top + window.pageYOffset - under - 8;
  window.scrollTo({ top: y < 0 ? 0 : y, behavior: "instant" });
}

/* ------------------------------------------------------------------ masthead */

/** The wordmark is a link to the top of the page, because that is what a reader
    expects a masthead to be and because the page is now one long article. */
function wordmark() {
  const a = el("a", { class: "brand", href: "#", title: t(UI.toTop) }, [
    el("span", { class: "brand-name", text: t(UI.brand) }),
  ]);
  a.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (location.hash) history.pushState(null, "", location.pathname);
    toTop();
    const app = document.getElementById("app");
    if (app) app.focus({ preventScroll: true });
  });
  return a;
}

function themeButton() {
  const dark = () => document.documentElement.classList.contains("dark-mode");
  const b = el("button", { class: "btn btn-quiet", type: "button" });
  const label = () => {
    b.textContent = dark() ? t(UI.themeOn) : t(UI.theme);
    b.setAttribute("aria-pressed", dark() ? "true" : "false");
  };
  b.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark-mode");
    remember(KEYS.theme, dark() ? "dark" : "light");
    label();
  });
  label();
  return b;
}

/** Switching edition redraws; it does not translate in place. The ?lang query
    is kept in the address so the link a reader copies opens in their edition. */
function langButton() {
  const b = el("button", {
    class: "btn btn-quiet", type: "button", lang: state.lang === "bn" ? "en" : "bn",
    text: t(UI.langBtn), title: t(UI.langTitle),
  });
  b.addEventListener("click", () => switchLang(state.lang === "bn" ? "en" : "bn"));
  return b;
}

function masthead(host) {
  clear(host);
  host.appendChild(el("div", { class: "masthead-in" }, [
    wordmark(),
    el("span", { class: "masthead-note", text: t(UI.brandNote) }),
    el("div", { class: "masthead-tools" }, [langButton(), themeButton()]),
  ]));
}

/* --------------------------------------------------------------------- panels
   The article is a section that is always open. The other four are disclosures
   in a stack under it: closed on arrival, built on first open, and each one
   keyed by the same panel-<key> id the hash router has always used, so every
   link an editor has already sent to someone keeps working. */

function storyPanel() {
  const body = el("div", { class: "wrap" });
  view.panels[STORY] = body;
  return el("section", {
    class: "panel", id: "panel-" + STORY, data: { panel: STORY },
    "aria-label": t(UI.tabs.story),
  }, body);
}

function sectionPanel(spec) {
  const body = el("div", { class: "open-body" });
  view.panels[spec.key] = body;

  const sum = el("summary", null, [
    el("h2", { class: "section-h", text: t(UI.tabs[spec.key]) }),
    el("span", { class: "open-note", html: fill(t(spec.note), view.corpus) }),
  ]);

  const d = el("details", {
    class: "open section", id: "panel-" + spec.key, data: { panel: spec.key },
  }, [sum, body]);

  /* Building is hung off toggle so it happens however the section was opened —
     by a click, by a hash, by the print handler. Writing the hash is hung off
     the click instead: a section opened by a link already has its hash, and
     a deep link like #rule-R07 must not be overwritten with #rules. */
  d.addEventListener("toggle", () => { if (d.open) build(spec.key); });
  sum.addEventListener("click", () => {
    if (d.open) return;                       /* about to close: leave the hash */
    if (location.hash !== "#" + spec.key) history.pushState(null, "", "#" + spec.key);
  });
  return d;
}

function paint(host) {
  clear(host);
  view.panels = {};
  host.appendChild(storyPanel());
  host.appendChild(el("div", { class: "sections" }, el("div", { class: "wrap" }, [
    el("h2", { class: "sections-h", text: t(W.moreTitle) }),
    el("p", { class: "measure sections-note", html: fill(t(W.moreNote), view.corpus) }),
    el("div", { class: "open-stack" }, SECTIONS.map(sectionPanel)),
  ])));
}

/* ---------------------------------------------------------------- drawing
   Memoised: a section is drawn once per edition, and a second request while the
   first is still fetching joins it rather than starting again. */

function build(key) {
  if (!view.pending[key]) {
    view.pending[key] = draw(key).catch(() => { delete view.pending[key]; });
  }
  return view.pending[key];
}

async function draw(key) {
  const spec = ALL.find((x) => x.key === key);
  const host = view.panels[key];
  if (!spec || !host) return;
  const edition = state.lang;
  clear(host);
  if (spec.needs.length) host.appendChild(el("p", { class: "src", text: t(UI.loading) }));

  const data = {};
  try {
    const got = await Promise.all(spec.needs.map((name) => load(name)));
    spec.needs.forEach((name, i) => { data[name] = got[i]; });
  } catch (err) {
    clear(host);
    host.appendChild(trouble(err));
    throw err;
  }
  if (edition !== state.lang) return;   /* edition switched mid-flight */

  clear(host);
  if (key === STORY) renderStory(host, view.corpus);
  else if (key === "rules") renderRules(host, view.corpus, data.rules);
  else if (key === "tools") renderTools(host, view.corpus, data);
  else if (key === "docs") renderDocs(host, view.corpus, data);
  else renderMethod(host, view.corpus);
}

function trouble(err) {
  return el("div", { class: "note" }, [
    /* html because the sentence names the folder the payloads are read from,
       and a path keeps the monospace face in both editions. The string is a
       literal in content.js. */
    el("p", { class: "note-title", html: t(UI.loadFail) }),
    el("p", { class: "src", html: fill(t(W.fileHint), view.corpus) }),
    el("p", { class: "src" }, el("code", { text: String(err && err.message ? err.message : err) })),
  ]);
}

/* ------------------------------------------------------------------- routing */

/** Open a section and wait until it is drawn, so a caller can then look for an
    id inside it. Harmless for the article, which is open and drawn already. */
async function open(key) {
  const host = document.getElementById("panel-" + key);
  if (host && host.tagName === "DETAILS" && !host.open) host.setAttribute("open", "");
  await build(key);
}

/** The hash is the address. A section name opens that section; anything else is
    an id — either already on the page, or inside a section a DEEP prefix names,
    which is opened first and then scrolled to. */
async function route() {
  const id = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!id || id === STORY) { toTop(); return; }

  if (view.panels[id]) {
    await open(id);
    const host = document.getElementById("panel-" + id);
    if (host) toElement(host);
    return;
  }

  const here = document.getElementById(id);
  const owner = here && here.closest ? here.closest("[data-panel]") : null;
  const key = owner ? owner.dataset.panel
    : (DEEP.find((d) => id.indexOf(d.prefix) === 0) || {}).tab;
  if (!key || !view.panels[key]) return;

  await open(key);
  const node = document.getElementById(id);
  if (!node) return;
  if (node.tagName === "DETAILS") node.setAttribute("open", "true");
  toElement(node);
}

/* ------------------------------------------------------------------ editions */

/** The title and the description live in the markup so a reader with no
    JavaScript still gets them; each carries its Bangla twin in data-bn. The
    English original is stashed on first call so switching back is exact. */
function headText() {
  const title = document.querySelector("title");
  const desc = document.querySelector('meta[name="description"]');
  if (title) {
    if (!title.dataset.en) title.dataset.en = title.textContent;
    title.textContent = state.lang === "bn" && title.dataset.bn
      ? title.dataset.bn : title.dataset.en;
  }
  if (desc) {
    if (!desc.dataset.en) desc.dataset.en = desc.getAttribute("content") || "";
    desc.setAttribute("content", state.lang === "bn" && desc.dataset.bn
      ? desc.dataset.bn : desc.dataset.en);
  }
}

function skipText() {
  const skip = document.getElementById("skip");
  if (skip) skip.textContent = t(UI.skip);
}

/** Redraw both editions from the same {en, bn} pairs rather than translating
    the nodes on screen, which is the only way the two cannot drift. Sections
    that were open are reopened and redrawn; disclosures inside them are not,
    because a reader who opened forty rule cards does not want them back. */
function switchLang(lang) {
  const wasOpen = SECTIONS.filter((s) => {
    const d = document.getElementById("panel-" + s.key);
    return d && d.open;
  }).map((s) => s.key);

  setLang(lang);
  remember(KEYS.lang, state.lang);
  const url = new URL(location.href);
  url.searchParams.set("lang", state.lang);
  history.replaceState(null, "", url.pathname + url.search + url.hash);

  view.pending = {};
  headText();
  skipText();
  masthead(document.getElementById("bar"));
  paint(document.getElementById("app"));
  footer(document.getElementById("foot"));
  build(STORY);
  for (const key of wasOpen) open(key);
}

/* -------------------------------------------------------------------- footer
   The four sections again, as links, for a reader who has read to the end and
   scrolled past the stack without noticing it. */

function footer(host) {
  clear(host);
  const links = el("nav", { class: "foot-links", "aria-label": t(W.sections) },
    SECTIONS.map((s) => el("a", { href: "#" + s.key, text: t(UI.tabs[s.key]) })));
  host.appendChild(el("div", { class: "wrap" }, [
    links,
    el("p", { text: t(HEAD.byline) + " · " + t(UI.brandNote) }),
    el("p", { class: "src", text: t(W.footNote) }),
    el("p", { class: "src", html: fill(t(W.fileHint), view.corpus) }),
  ]));
}

/** Printing a page whose evidence is behind disclosures would print the
    argument without the evidence, so every section is opened first. A section
    whose data has not been fetched yet cannot appear in that print run — the
    fetch is asynchronous and print is not — which is why the on-screen page,
    not the paper, is the record. */
function printOpen() {
  for (const s of SECTIONS) {
    const d = document.getElementById("panel-" + s.key);
    if (d && !d.open) d.setAttribute("open", "");
  }
}

/* ---------------------------------------------------------------------- boot */

async function boot() {
  const url = new URL(location.href);
  const asked = url.searchParams.get("lang");
  setLang(asked || recall(KEYS.lang) || "en");
  headText();
  skipText();

  const app = document.getElementById("app");
  try {
    view.corpus = await load("corpus");
  } catch (err) {
    clear(app);
    app.appendChild(el("div", { class: "wrap" }, trouble(err)));
    return;
  }

  masthead(document.getElementById("bar"));
  paint(app);
  footer(document.getElementById("foot"));

  window.addEventListener("hashchange", route);
  window.addEventListener("popstate", route);
  window.addEventListener("beforeprint", printOpen);

  await build(STORY);
  route();
}

boot();
