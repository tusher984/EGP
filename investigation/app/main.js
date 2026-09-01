/* The page.

   One document, in one order: the story, then the tools that check the story, then
   how it was made and what it cannot tell you. Nothing links away to a second page,
   because a reader who has just been handed a number should be one scroll from the
   box that checks it, not one page load.

   Four of those tools read files of several megabytes. None of them is built until it
   is about to come into view, so opening this page costs the story and nothing else.
   A link straight to one of them — from the contents, from the masthead, or from a
   URL someone shared — builds it at once. */

import { el, clear } from "../components/ui.js";
import { renderStory, renderTail } from "./story.js";
import { searchPanel, runQuery } from "./searchui.js";
import { entityExplorer, networkExplorer, showEntity } from "./entities.js";
import { documentSection } from "../evidence/evidence.js";
import { tableExplorer, downloads } from "./explorer.js";

/* ---- night mode ----

   The default follows the operating system. A click overrides it and the override is
   remembered, because a reader who wants the dark palette wants it on the second
   visit too. Both palettes were validated separately against their own background;
   the dark one is not the light one inverted. index.html sets the class before this
   module runs so the page never flashes the wrong colour. */

const KEY = "egp-watch-night";
const prefers = window.matchMedia("(prefers-color-scheme: dark)");
const kept = () => { try { return localStorage.getItem(KEY); } catch { return null; } };

function apply(on, btn) {
  document.documentElement.classList.toggle("night", on);
  btn.textContent = on ? "Day" : "Night";
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.setAttribute("aria-label", on
    ? "switch to the light palette" : "switch to the dark palette");
}

function modeButton() {
  const btn = el("button", { class: "mode", type: "button" });
  let on = document.documentElement.classList.contains("night");
  apply(on, btn);
  btn.addEventListener("click", () => {
    on = !on;
    apply(on, btn);
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* private mode */ }
  });
  prefers.addEventListener("change", (e) => {
    if (kept() === null) apply(e.matches, btn);
  });
  return btn;
}

/* ---- the masthead ----
   The wordmark is the way back to the top of the story, on every screen, at every
   depth. The nav is the same list twice over — it repeats what the contents block
   under the headline says, for a reader who is already halfway down. */

const NAV = [
  ["summary", "The story"],
  ["search", "Search"],
  ["entities", "Names"],
  ["network", "Connections"],
  ["documents", "Documents"],
  ["tables", "Tables"],
  ["downloads", "Data"],
  ["methodology", "Method"],
];

function masthead(bar) {
  const nav = el("nav", { "aria-label": "sections of this investigation" },
    NAV.map(([id, label]) => el("a", { href: `#${id}` }, label)));
  bar.append(
    el("a", { href: "#top", class: "wordmark",
      "aria-label": "e-GP Watch — back to the top of the story" },
    "e-GP ", el("span", "Watch")),
    nav, modeButton());
  return nav;
}

/* ---- the tools, built when they are nearly in view ----

   Each one stands in as a section with the right id, so a link to it works before it
   exists and the reader lands on a line saying what is being built. */

const TOOLS = [
  ["search", "Building the search box", searchPanel],
  ["entities", "Reading the four tables that name things", entityExplorer],
  ["network", "Reading the printed links between names", networkExplorer],
  ["documents", "Reading the document list", documentSection],
  ["tables", "Opening the eighteen tables", tableExplorer],
  ["downloads", "Asking the server what each file weighs", downloads],
];

const SLOTS = new Map();
let watcher = null;

function slot(id, hint, make) {
  const node = el("section", { class: "band", id, style: "min-height:50vh" },
    el("div", { class: "wrap" }, el("p", { class: "loading" }, hint)));
  SLOTS.set(id, { node, make, done: false });
  return node;
}

function build(id) {
  const s = SLOTS.get(id);
  if (!s || s.done) return;
  s.done = true;
  if (watcher) watcher.unobserve(s.node);
  let real;
  try {
    real = s.make();
  } catch (e) {
    real = el("section", { class: "band", id }, el("div", { class: "wrap" },
      el("p", { class: "warn" }, `This tool did not open: ${e.message}`)));
  }
  s.node.replaceWith(real);
  s.node = real;
}

function watch() {
  if (!("IntersectionObserver" in window)) {
    for (const id of [...SLOTS.keys()]) build(id);
    return;
  }
  watcher = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) build(e.target.id);
  }, { rootMargin: "700px 0px" });
  for (const s of SLOTS.values()) watcher.observe(s.node);
}

/* ---- the router ----

   Three shapes of hash, and every one of them is a link some part of this site emits:
   #q=<query> is a search, #entity=<id> is a profile, anything else is a section. A
   query in the URL therefore behaves exactly like one typed into the box, which is
   what makes a result shareable. */

function goTo(id) {
  const t = document.getElementById(id);
  if (t) t.scrollIntoView({ block: "start" });
}

function route() {
  const raw = location.hash.replace(/^#/, "");
  if (!raw) return;
  if (raw.startsWith("q=")) {
    build("search");
    goTo("search");
    runQuery(decodeURIComponent(raw.slice(2)));
    return;
  }
  if (raw.startsWith("entity=")) {
    build("entities");
    showEntity(decodeURIComponent(raw.slice(7)));
    return;
  }
  const id = decodeURIComponent(raw);
  build(id);
  goTo(id);
}

/* ---- which section the reader is in ----
   Read off the scroll position rather than an observer, because sections here are
   taller than the window and an observer would light up two at once. */

function spy(nav) {
  const links = [...nav.querySelectorAll("a")];
  const mark = () => {
    const line = window.scrollY + 140;
    let now = null;
    for (const a of links) {
      const t = document.getElementById(a.hash.slice(1));
      if (t && t.getBoundingClientRect().top + window.scrollY <= line) now = a;
    }
    for (const a of links) {
      if (a === now) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }
  };
  let queued = false;
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; mark(); });
  }, { passive: true });
  mark();
}

/* ---- the footer: what this is, and what it is not ---- */

function footer(foot) {
  foot.append(el("div", { class: "wrap" },
    el("p", el("a", { href: "#top", class: "wordmark" }, "e-GP ", el("span", "Watch"))),
    el("div", { class: "prose left" },
      el("p", { class: "note" }, "Every number, name, date and quotation on this page "
        + "was read out of the PDF documents in this folder — the tender notices, "
        + "amendments and contract-award notices published on the government's own "
        + "e-Procurement portal — and out of nothing else. No figure here comes from a "
        + "news report, an outside database, a website or anyone's recollection. Where "
        + "the documents do not answer a question, this investigation says so instead "
        + "of filling the gap."),
      el("p", { class: "note" }, "There is no server behind this page. It is a folder "
        + "of files: the article is assembled in your browser out of the same CSV and "
        + "JSON files the download section hands you, and the PDFs sit beside them. "
        + "Nothing you type or click is sent anywhere, because there is nowhere for it "
        + "to go."),
      el("p", { class: "note" }, "The firms, officials and offices named here are named "
        + "because the government's own published record names them. Naming is not an "
        + "accusation: a pattern in these pages is something to look into, and this "
        + "site is built so that looking into it does not require taking anyone's word "
        + "for anything."),
      el("ul", { class: "cont-tools" },
        el("li", el("a", { href: "#how-to-read" }, "How to read this investigation")),
        el("li", el("a", { href: "#methodology" }, "How this was made")),
        el("li", el("a", { href: "#limits" }, "What this cannot tell you")),
        el("li", el("a", { href: "#downloads" }, "Every file it was built from"))))));
}

/* ---- boot ---- */

async function boot() {
  const app = document.getElementById("app");
  const nav = masthead(document.getElementById("bar"));
  const story = el("div");
  const tools = el("div", TOOLS.map(([id, hint, make]) => slot(id, hint, make)));
  const tail = el("div");
  clear(app);
  app.append(story, tools, tail);

  let ctx = null;
  try {
    ctx = await renderStory(story);
  } catch (e) {
    story.append(el("section", { class: "band" }, el("div", { class: "wrap" },
      el("p", { class: "warn" }, `The story did not load: ${e.message}. The files it `
        + "reads are listed in the download section below, and each one opens on its "
        + "own."))));
  }
  if (ctx) renderTail(tail, ctx.a, ctx.audit);
  footer(document.getElementById("foot"));

  watch();
  route();
  window.addEventListener("hashchange", route);
  spy(nav);
  document.documentElement.dataset.ready = "1";
}

boot();
