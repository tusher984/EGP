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
import { LANG, loadStrings, t, langButton } from "../i18n/i18n.js";
import { renderStory, renderTail, BYLINE } from "./story.js";
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
  btn.textContent = on ? t("mode.day") : t("mode.night");
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.setAttribute("aria-label", on ? t("mode.toLight") : t("mode.toDark"));
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
   under the headline says, for a reader who is already halfway down. The language
   button comes before the palette button because it changes more: it reloads the page,
   and a reader reaching for it is usually reaching for it first. */

const NAV = [
  ["summary", "nav.story"],
  ["search", "nav.search"],
  ["entities", "nav.names"],
  ["network", "nav.connections"],
  ["documents", "nav.documents"],
  ["tables", "nav.tables"],
  ["downloads", "nav.data"],
  ["methodology", "nav.method"],
];

function masthead(bar) {
  const nav = el("nav", { "aria-label": t("nav.aria") },
    NAV.map(([id, key]) => el("a", { href: `#${id}` }, t(key))));
  bar.append(
    el("a", { href: "#top", class: "wordmark", "aria-label": t("wordmark.aria") },
      "e-GP ", el("span", "Watch")),
    nav,
    el("div", { class: "modes" }, langButton(), modeButton()));
  return nav;
}

/* ---- the tools, built when they are nearly in view ----

   Each one stands in as a section with the right id, so a link to it works before it
   exists and the reader lands on a line saying what is being built. */

const TOOLS = [
  ["search", "loading.search", searchPanel],
  ["entities", "loading.entities", entityExplorer],
  ["network", "loading.network", networkExplorer],
  ["documents", "loading.documents", documentSection],
  ["tables", "loading.tables", tableExplorer],
  ["downloads", "loading.downloads", downloads],
];

const SLOTS = new Map();
let watcher = null;

function slot(id, hint, make) {
  const node = el("section", { class: "band", id, style: "min-height:50vh" },
    el("div", { class: "wrap" }, el("p", { class: "loading" }, t(hint))));
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
      el("p", { class: "warn" }, t("err.tool", { message: e.message }))));
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
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ block: "start" });
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
      const target = document.getElementById(a.hash.slice(1));
      if (target && target.getBoundingClientRect().top + window.scrollY <= line) now = a;
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

const FOOT_LINKS = [
  ["how-to-read", "foot.howToRead"],
  ["methodology", "foot.method"],
  ["limits", "foot.limits"],
  ["downloads", "foot.files"],
];

function footer(foot) {
  foot.append(el("div", { class: "wrap" },
    el("p", el("a", { href: "#top", class: "wordmark" }, "e-GP ", el("span", "Watch"))),
    el("div", { class: "prose left" },
      el("p", { class: "note" }, t("foot.sources")),
      el("p", { class: "note" }, t("foot.noServer")),
      el("p", { class: "note" }, t("foot.naming")),
      el("p", { class: "note" }, t("foot.byline", { name: BYLINE })),
      el("ul", { class: "cont-tools" },
        FOOT_LINKS.map(([id, key]) => el("li", el("a", { href: `#${id}` }, t(key))))))));
}

/* ---- boot ----

   The language pack is fetched before anything is built, because every label on the
   page comes out of it. It is one module of a few tens of kilobytes and only the
   reader's own language is fetched. Nothing renders in one language and re-labels
   itself in the other. */

async function boot() {
  document.documentElement.lang = LANG;
  await loadStrings();

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
      el("p", { class: "warn" }, t("err.story", { message: e.message })))));
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
