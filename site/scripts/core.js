/* e-GP WATCH — core: DOM helpers, formatting, language state, data loading.
   ------------------------------------------------------------------
   Two rules are enforced here rather than trusted to discipline elsewhere.

   1. NO STATISTIC IS TYPED INTO THE MARKUP. Prose carries tokens like
      {{counts.tenders}} or {{money.crore|cr}}; fill() resolves them against
      site/data/corpus.json, which build.py derives from the three CSVs. If a
      token names a path the data does not have, fill() renders a visible
      "[missing: path]" instead of quietly printing nothing, so a broken claim
      cannot slip into the page looking fine.

   2. NOTHING IS FETCHED FROM A NETWORK HOST. Every load() path is relative to
      this repository, so the site opens from a folder with no connection. */

/* NAMES is the one thing core.js reads from the writing: the Bangla form of a
   name the documents file in English. content.js imports nothing, so this edge
   runs one way only. */
import { NAMES, PHRASE_BN, PHRASE_SHAPES } from "./content.js";

export const DATA = "site/data/";

/* ------------------------------------------------------------------ elements */

export function el(tag, attrs, kids) {
  const n = document.createElement(tag);
  apply(n, attrs);
  add(n, kids);
  return n;
}

const SVGNS = "http://www.w3.org/2000/svg";

export function svg(tag, attrs, kids) {
  const n = document.createElementNS(SVGNS, tag);
  if (attrs) {
    for (const k in attrs) {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      n.setAttribute(k, v);
    }
  }
  add(n, kids);
  return n;
}

function apply(n, attrs) {
  if (!attrs) return;
  for (const k in attrs) {
    const v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k === "html") n.innerHTML = v;
    else if (k === "on") for (const ev in v) n.addEventListener(ev, v[ev]);
    else if (k === "data") for (const d in v) n.dataset[d] = v[d];
    else if (v === true) n.setAttribute(k, "");
    else n.setAttribute(k, v);
  }
}

function add(n, kids) {
  if (kids === null || kids === undefined) return;
  const list = Array.isArray(kids) ? kids : [kids];
  for (const k of list) {
    if (k === null || k === undefined || k === false) continue;
    n.appendChild(typeof k === "object" ? k : document.createTextNode(String(k)));
  }
}

export function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

/* ------------------------------------------------------------------ language
   One flag, read by the formatters and by t(). The document element carries
   lang so CSS (html:lang(bn)) can switch the type stack without JS. */

export const state = { lang: "en" };

export function setLang(lang) {
  state.lang = lang === "bn" ? "bn" : "en";
  document.documentElement.lang = state.lang;
  return state.lang;
}

/** Pick the current language out of a {en, bn} pair. Plain strings pass
    through, so a proper noun or a tender number needs no translation entry. */
export function t(pair) {
  if (pair === null || pair === undefined) return "";
  if (typeof pair === "string" || typeof pair === "number") return String(pair);
  const v = pair[state.lang];
  return v === undefined || v === null ? String(pair.en ?? "") : String(v);
}

/* --------------------------------------------------------------- formatting */

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Bangla readers get Bengali digits; the grouping stays South Asian in both
    languages because that is how every figure is printed in the sources. */
export function digits(s) {
  if (state.lang !== "bn") return s;
  return String(s).replace(/[0-9]/g, (d) => BN_DIGITS[+d]);
}

/** South Asian grouping: 1,15,58,240 — the way the notices themselves print
    money. Intl with en-IN does this correctly and needs no data file. */
function group(x, min, max) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: min, maximumFractionDigits: max,
  }).format(x);
}

export function n(x, dp) {
  if (x === null || x === undefined || x === "" || Number.isNaN(+x)) return dash();
  const d = dp === undefined ? 0 : dp;
  return digits(group(+x, d, d));
}

export function pct(x, dp) {
  if (x === null || x === undefined || x === "" || Number.isNaN(+x)) return dash();
  return digits(group(+x, dp === undefined ? 1 : dp, dp === undefined ? 1 : dp)) + "%";
}

/** Crore, the unit the corpus and every Bangladeshi reader uses for large
    money. The taka symbol goes in front, the word after. */
export function cr(x, dp) {
  if (x === null || x === undefined || x === "" || Number.isNaN(+x)) return dash();
  const d = dp === undefined ? 2 : dp;
  return "৳" + digits(group(+x, d, d)) + " " + t({ en: "crore", bn: "কোটি" });
}

/** A raw taka figure, given in crore or lakh depending on size so a reader is
    never asked to count nine digits. Small values print in full. */
export function taka(x) {
  if (x === null || x === undefined || x === "" || Number.isNaN(+x)) return dash();
  const v = +x;
  if (v >= 1e7) return "৳" + digits(group(v / 1e7, 2, 2)) + " " + t({ en: "crore", bn: "কোটি" });
  if (v >= 1e5) return "৳" + digits(group(v / 1e5, 2, 2)) + " " + t({ en: "lakh", bn: "লাখ" });
  return "৳" + digits(group(v, 0, 0));
}

/** The same figure with every digit, grouped the way the notices group it, and
    the paisa only when the notice carried paisa. This is the form an editor
    checking a record against a PDF needs: "৳5.39 crore" cannot be matched
    against a page that prints 53908596.90. */
export function takaFull(x) {
  if (x === null || x === undefined || x === "" || Number.isNaN(+x)) return dash();
  const v = +x;
  const dp = Math.round(v * 100) % 100 === 0 ? 0 : 2;
  return "৳" + digits(group(v, dp, dp));
}

/** The reading first, then the exact figure — for record surfaces, where one
    number is being checked against one page. Tables and charts keep the scaled
    reading alone, because a column of nine-digit figures is unreadable. Below a
    lakh the two forms are the same string, so only one is printed. */
export function takaBoth(x) {
  if (x === null || x === undefined || x === "" || Number.isNaN(+x)) return dash();
  if (Math.abs(+x) < 1e5) return takaFull(x);
  return taka(x) + " (" + takaFull(x) + ")";
}

export function ratio(x, dp) {
  if (x === null || x === undefined || x === "" || Number.isNaN(+x)) return dash();
  return digits(group(+x, dp === undefined ? 2 : dp, dp === undefined ? 2 : dp)) + "×";
}

export function dash() { return t({ en: "not documented", bn: "নথিভুক্ত নয়" }); }

/* --------------------------------------------------------------- proper names
   A name the documents file in English, printed in the language the reader is
   reading. NAMES lives in content.js with the rest of the writing; these four
   are the lookups, and each falls back to the printed string, so a value the
   maps have never seen appears as itself rather than disappearing.

   Company names and quoted passages deliberately do not pass through here. See
   the note above NAMES. */

function named(map, s) {
  if (!s) return s;
  const pair = map[s];
  return pair ? t(pair) : s;
}

/** An authority in its short form, as a source line prints it: CDA, সিডিএ. */
export function agencyName(s) { return named(NAMES.agency, s); }

/** An authority as a sentence names it. */
export function bodyName(s) { return named(NAMES.org, s); }

/** A district. */
export function placeName(s) { return named(NAMES.place, s); }

/** A company, where a sentence names one. Falls back to the printed spelling, so
    the 304 firms nobody has written a Bangla name for appear as the notices
    print them rather than not at all. */
export function firmName(s) { return termName("firm", s); }

/** How a tender was run, or whose money paid for it. Both are printed in the
    notices with capitalisation that drifts between offices, so the key is
    lower-cased before the lookup and the map holds one spelling of each. */
export function termName(kind, s) {
  if (!s) return s;
  const pair = (NAMES[kind] || {})[String(s).toLowerCase().trim()];
  return pair ? t(pair) : s;
}

/** A string the maps did not translate, wrapped so the page says why. In the
    Bangla edition an untranslated string is the document's own spelling sitting
    inside Bangla, and .verbatim says exactly that in the type — it is also what
    keeps the Latin-script sweep off a line nobody is permitted to translate. In
    the English edition there is nothing to mark, because the whole page is
    already in that script. Every quoting helper below ends here. */
function printed(out, raw) {
  const untranslated = state.lang === "bn" && out === raw;
  return el("span", untranslated ? { class: "verbatim", text: out } : { text: out });
}

/** The same lookup as an element, for the places it matters: a package title, a
    project name, a firm — a whole line off a notice rather than a term. */
export function quoted(kind, s) {
  return printed(termName(kind, s), s);
}

/** The same, for the three maps that are keyed on the exact string the documents
    file rather than on a lower-cased form: an authority, a district. Takes the
    lookup itself, so there is one quoting rule and not two. */
export function quotedName(fn, s) {
  return printed(fn(s), s);
}

/** A value with no map at all — an office name, an address, a status the portal
    printed. Nothing is looked up; the string is the document's, and in the
    Bangla edition it is marked as such. */
export function asPrinted(s) {
  return printed(s, s);
}

/* ------------------------------------------------ sentences from a data file
   A few of this investigation's own sentences live in site/data/rules.json and
   site/data/corpus.json rather than in content.js, because each one travels
   with the figure it explains — the named example under a rule, a gap in the
   record, a note on why a published number did not reproduce. The English there
   is what the figures were audited against and is not translated in place.

   phrase() is the lookup that gives the Bangla edition those sentences. It
   consults the exact map first, then the measured shapes, and returns null when
   it has neither, so the caller prints the English and the Latin-script sweep
   catches it. Silence would be the worse failure. */

/** The Bangla for a sentence carried in a data file, or null if there is none
    and in the English edition. May contain markup: a locator in <code>, words a
    document prints in <span class="verbatim">.

    A shape's template takes its captures two ways. $1 sets the figure in Bengali
    numerals, which is what a measurement wants. @1 inserts the capture exactly
    as the document printed it, which is what a company's registered name wants —
    a firm whose name carries a numeral could not be looked up in any register
    once that numeral had been transliterated. */
export function phrase(s) {
  if (state.lang !== "bn" || !s) return null;
  const exact = PHRASE_BN[s];
  if (exact) return exact;
  for (const shape of PHRASE_SHAPES) {
    const m = shape.re.exec(String(s));
    if (m) {
      return shape.bn
        .replace(/\$(\d)/g, (_, i) => digits(m[+i]))
        .replace(/@(\d)/g, (_, i) => esc(m[+i]));
    }
  }
  return null;
}

/* A capture going into a markup template. The names these documents print carry
   ampersands — M/S Molla & Brothers — and a template is html by the time it
   reaches the page. */
function esc(s) {
  return String(s === undefined ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** The attributes for an element carrying such a sentence: the Bangla as
    markup where there is Bangla, the string as text where there is not. Written
    as an attribute pair rather than a string so that a caller cannot
    accidentally put markup through `text` or a raw string through `html`. */
export function said(s) {
  const bn = phrase(s);
  return bn === null ? { text: s === null || s === undefined ? "" : String(s) } : { html: bn };
}

/* --------------------------------------------------- a run of those sentences
   One cell of the per-tender analysis holds several clauses at once, written by
   the analysis with its own punctuation:

     2 tender(s) received against 3 sold; 2 ruled responsive. contract value
     Tk 2.80 lac. awarded to M/S. Shahid Brothers. contract signed 12 days
     after notification of award.

   The English edition prints that string exactly as the analysis wrote it — it
   is the audited record, and reassembling it could only make it differ from the
   CSV. The Bangla edition has to take it apart, because a clause is the largest
   unit anything here can be translated in.

   Splitting on the analysis's own separators leaves one hazard: a company's name
   contains a full stop. "awarded to M/S. Shahid Brothers" arrives as two
   fragments, and the second is not a clause. So the shape that ends in a printed
   name declares itself open, and an unrecognised fragment following an open
   clause is glued back onto it — repeatedly, which is what "M/S. R. A.
   Enterprise" needs. A fragment that follows anything else stays its own clause
   and, having no Bangla, stays visible for the sweep. */

/** The shape that matches a clause, or null. */
function knows(atom) {
  if (PHRASE_BN[atom]) return { exact: true };
  return PHRASE_SHAPES.find((shape) => shape.re.test(atom)) || null;
}

function open(atom) {
  const shape = knows(atom);
  return !!(shape && shape.open);
}

function atomise(s) {
  const str = String(s);
  const out = [];
  const push = (raw) => {
    const atom = raw.trim();
    if (!atom) return;
    const prev = out.length ? out[out.length - 1] : "";
    if (prev && !knows(atom) && open(prev)) out[out.length - 1] = prev + ". " + atom;
    else out.push(atom);
  };
  /* The colon is kept on the clause it closes: the analysis uses it to introduce
     a hypothesis, and a clause that introduces the next one is not terminated. */
  const re = /([.;:])\s+/g;
  let at = 0, m;
  while ((m = re.exec(str))) {
    push(str.slice(at, m.index) + (m[1] === ":" ? ":" : ""));
    at = m.index + m[0].length;
  }
  push(str.slice(at).replace(/\.\s*$/, ""));
  return out;
}

/** The children of an element holding such a run: one span per clause, joined by
    the terminator the reading language uses. A clause the maps have no Bangla
    for is printed as the analysis wrote it, so the Latin-script sweep finds it
    and the omission is loud rather than silent.

    A clause ending in a colon introduces the next one instead of closing, which
    is how the analysis writes the standing caveat on a hypothesis, so it takes a
    space and not a full stop. */
export function clauses(s) {
  if (s === null || s === undefined || s === "") return [dash()];
  if (state.lang !== "bn") return [String(s)];

  /* A paragraph written as one Bangla sentence rather than as a run of clauses:
     the standing caveat about which rulebook a clause number belongs to, and the
     two verification notes. Taking those apart would only make eight fragments
     needing eight entries, so the whole string is tried first. */
  if (knows(String(s))) return [el("span", said(s))];

  const list = atomise(s);
  const out = [];
  list.forEach((atom, i) => {
    if (i) out.push(/:$/.test(list[i - 1]) ? " " : "। ");
    out.push(el("span", said(atom)));
  });
  if (list.length && !/:$/.test(list[list.length - 1])) out.push("।");
  return out;
}

/** The sentence terminator. Bangla closes a sentence with the danda, not a full
    stop, and a page that mixes the two reads like machine translation. Sentences
    assembled in code — a count and the noun it counts, most often — cannot carry
    their own terminator in the string, so they ask for it here. */
export function stop() { return state.lang === "bn" ? "।" : "."; }

/** "700 of 1,155 tenders." — the line every filter in this site prints to say
    how much of the set survived. The two languages do not share a word order
    here: Bangla names the total first and puts the postposition after it, and
    attaches the classifier টি straight to each numeral. So the sentence is
    written twice rather than assembled out of a translated "of".

    Nodes, not a string, because the figure the reader is being shown is the
    surviving count and it stays emphasised in both editions. `noun` is a bare
    plural pair — no classifier, no terminator; both are added here. */
export function ofTotal(kept, total, noun) {
  const frag = document.createDocumentFragment();
  const strong = el("b", { text: n(kept) });
  if (state.lang === "bn") {
    frag.appendChild(document.createTextNode(n(total) + "টির মধ্যে "));
    frag.appendChild(strong);
    frag.appendChild(document.createTextNode("টি " + t(noun) + "।"));
  } else {
    frag.appendChild(strong);
    frag.appendChild(document.createTextNode(" of " + n(total) + " " + t(noun) + "."));
  }
  return frag;
}

/* ---------------------------------------------------------------- citations
   One citation order, defined once, used by every source line on the site.

   It is the order a procurement file is cited in Bangladesh, and it is not the
   order a Western footnote uses. A footnote starts with the author. A
   procurement citation starts with the PROCURING ENTITY, because the entity is
   the office answerable for the document, and a reader who wants to challenge
   the document writes to that office. Then the e-GP tender ID, which is the
   number the portal issues and the only handle that survives a renamed file.
   Then the clause, in the form the standard document itself uses — ITT, TDS,
   and the rule of the Public Procurement Rules the TDS entry cites. Then the
   page NUMBERED ON THE PAGE, with the PDF's own page after it in brackets when
   the two differ, because a standard tender document restarts its numbering per
   section and the printed number is the one an official will quote back.
   Finally the machine trail: the file on disk and the CSV column, in monospace,
   so an editor can re-run the figure rather than take it on trust.

   Locators stay in Latin script in both editions — a clause number and a
   filename are typed into a search box, not read aloud. Page numbers and tender
   IDs are prose and take Bengali digits in the Bangla edition. */

const CITE = {
  tender: { en: "e-GP tender ID", bn: "e-GP দরপত্র আইডি" },
  pkg: { en: "package", bn: "প্যাকেজ" },
  clause: { en: "clause", bn: "ধারা" },
  page: { en: "page", bn: "পৃষ্ঠা" },
  printed: { en: "printed page", bn: "ছাপা পৃষ্ঠা" },
  pdf: { en: "PDF p.", bn: "পিডিএফ পৃ." },
};

const SEP = "  ·  ";

/** Build a citation from the parts a document actually carries. Anything absent
    is left out rather than guessed at, so a row with no printed page cites the
    PDF page and says that is what it is. `links` are ready-made anchors. */
export function cite(parts) {
  const frag = document.createDocumentFragment();
  let first = true;
  const put = (node) => {
    if (!first) frag.appendChild(document.createTextNode(SEP));
    frag.appendChild(node);
    first = false;
  };
  const say = (s) => put(document.createTextNode(s));

  if (parts.entity) say(String(parts.entity));
  if (parts.doc) say(t(parts.doc));
  if (parts.tender) say(t(CITE.tender) + " " + digits(parts.tender));
  if (parts.pkg) say(t(CITE.pkg) + " " + String(parts.pkg));
  if (parts.clause) say(t(CITE.clause) + " " + String(parts.clause));

  if (parts.printed) {
    say(t(CITE.printed) + " " + digits(parts.printed) +
      (parts.pdf ? " (" + t(CITE.pdf) + " " + digits(parts.pdf) + ")" : ""));
  } else if (parts.pdf) {
    say(t(CITE.pdf) + " " + digits(parts.pdf));
  } else if (parts.page) {
    say(t(CITE.page) + " " + digits(parts.page));
  }

  if (parts.file) put(el("code", { text: parts.file }));
  if (parts.column) put(el("code", { text: parts.column }));
  for (const a of parts.links || []) put(a);
  return frag;
}


/* Months are abbreviated in both editions. A date on this site appears in a
   table column, a record field or a citation line — never in a sentence — and
   the short form keeps a column of dates the same width as the heading above
   it. The two lists are the same length and the same order, so date() indexes
   either one with the month it parsed. */

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MONTHS_BN = ["জানু", "ফেব", "মার্চ", "এপ্রি", "মে", "জুন", "জুল", "আগ", "সেপ", "অক্টো", "নভে", "ডিসে"];

/** Dates arrive from build.py as yyyy-mm-dd, and from the portal's own strip as
    the form it prints there — 11-Mar-2020, or 11-Mar-2020 13:00 where a closing
    time is part of the deadline. Both are read; the clock is kept, because the
    hour a tender closed is a fact about the tender. Anything else is passed
    through with its digits converted and nothing else assumed about it. */
export function date(s) {
  if (!s) return dash();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s));
  if (iso) return stamp(+iso[3], +iso[2] - 1, iso[1], "");
  const portal = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})(?:\s+(\d{1,2}:\d{2}))?\s*$/.exec(String(s));
  if (portal) {
    const i = MONTHS_EN.findIndex((x) => x.toLowerCase() === portal[2].toLowerCase());
    if (i >= 0) return stamp(+portal[1], i, portal[3], portal[4] || "");
  }
  return digits(String(s));
}

function stamp(day, mi, year, clock) {
  const mon = state.lang === "bn" ? MONTHS_BN[mi] : MONTHS_EN[mi];
  return digits(String(day)) + " " + mon + " " + digits(year) +
    (clock ? ", " + digits(clock) : "");
}

/* A month and a year, with no day — the form a rule's commencement is written in
   rather than a date the portal stamped. Spelled out, because this one appears
   inside a sentence rather than in a record strip, and a Bangla sentence should
   not have to say "December". */

const FULL_EN = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const FULL_BN = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

/** "December 2025" → "ডিসেম্বর ২০২৫". A value in any other shape is passed
    through with its digits converted and nothing else assumed about it. */
export function month(s) {
  if (!s) return dash();
  const m = /^\s*([A-Za-z]+)\s+(\d{4})\s*$/.exec(String(s));
  if (!m) return digits(String(s));
  const i = FULL_EN.findIndex((x) => x.toLowerCase().startsWith(m[1].slice(0, 3).toLowerCase()));
  if (i < 0) return digits(String(s));
  return (state.lang === "bn" ? FULL_BN[i] : FULL_EN[i]) + " " + digits(m[2]);
}

/* A machine token from the CSVs — SINGLE_BID, NOT_PUBLISHED_IN_NOTICE — turned
   into something readable when no hand-written label exists for it. The value
   is never altered, only its presentation. */
export function human(s) {
  if (s === null || s === undefined || s === "") return dash();
  /* An empty cell reaches the page as the token BLANK, which the build writes so
     that an absent value still counts as its own row. It is absence, not a
     category, so it reads as absence. The wording matches dash() and is written
     out rather than borrowed from it because this one heads a column or a legend,
     where a lower-case fragment would look like a missing label. */
  if (s === "BLANK") return t({ en: "Not documented", bn: "নথিভুক্ত নয়" });
  return String(s).replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

/* --------------------------------------------------------------------- paths
   "Tender Notice_PDFs" carries a space and package descriptions carry commas
   and brackets, so every segment is encoded separately. Encoding the whole
   path would eat the slashes. */

export function href(dir, file) {
  return [dir, file].map(encodeURIComponent).join("/");
}

/* ------------------------------------------------------------------ loading
   corpus.json is the only payload the article needs. The rest arrive when a
   reader opens the tab that uses them, and each is fetched once. */

const cache = new Map();

export function load(name) {
  if (!cache.has(name)) {
    cache.set(name, fetch(DATA + name + ".json").then((r) => {
      if (!r.ok) throw new Error(name + ".json " + r.status);
      return r.json();
    }));
  }
  return cache.get(name);
}

/* ----------------------------------------------------------- data binding */

/** Walk a dotted path into the corpus. Array steps accept an index or a
    key= match, so {{competition.key=SINGLE_BID.n}} reads a named row. */
export function dig(obj, path) {
  let cur = obj;
  for (const step of String(path).split(".")) {
    if (cur === null || cur === undefined) return undefined;
    if (Array.isArray(cur)) {
      if (/^\d+$/.test(step)) { cur = cur[+step]; continue; }
      const eq = step.indexOf("=");
      if (eq > 0) {
        const f = step.slice(0, eq), v = step.slice(eq + 1);
        cur = cur.find((r) => String(r[f]) === v);
        continue;
      }
      return undefined;
    }
    cur = cur[step];
  }
  return cur;
}

const FILTERS = {
  n: (v) => n(v), n1: (v) => n(v, 1), n2: (v) => n(v, 2),
  pct: (v) => pct(v), pct0: (v) => pct(v, 0), pct2: (v) => pct(v, 2),
  cr: (v) => cr(v), cr0: (v) => cr(v, 0), taka: (v) => taka(v),
  x: (v) => ratio(v), x2: (v) => ratio(v, 2), x3: (v) => ratio(v, 3),
  date: (v) => date(v), human: (v) => human(v), month: (v) => month(v),
  r: (v) => digits((+v >= 0 ? "+" : "−") + Math.abs(+v).toFixed(3)),
  raw: (v) => String(v),
};

/* The filters that resolve a name rather than a figure. A sentence in the Bangla
   edition asks for the authority or the road by token, the same way it asks for
   a count, and gets it in Bangla — an English name dropped into a Bangla
   paragraph reads as an untranslated hole. Each falls back to the printed
   spelling, so a value the maps have not seen appears as itself.

   They are kept apart from FILTERS because the wrapper differs: a figure is
   marked as a figure, a name as a name. Both are emphasised; only one gets the
   tabular numerals and the sans face. */
const NAME_FILTERS = {
  agency: (v) => agencyName(v),
  org: (v) => bodyName(v),
  place: (v) => placeName(v),
  method: (v) => termName("method", v),
  funds: (v) => termName("funds", v),
  work: (v) => termName("work", v),
  firm: (v) => termName("firm", v),
};

/** Resolve {{path}} and {{path|filter}} against the corpus. Wraps each result
    in <span class="num"> so a figure is visibly a figure — or in
    <span class="name"> where the filter resolves a name — and renders a loud
    marker if the path is absent, since silence would be a lie. */
export function fill(str, corpus) {
  return String(str).replace(/\{\{([^}]+)\}\}/g, (_, spec) => {
    const bar = spec.indexOf("|");
    const path = (bar < 0 ? spec : spec.slice(0, bar)).trim();
    const f = bar < 0 ? "n" : spec.slice(bar + 1).trim();
    const v = dig(corpus, path);
    if (v === undefined || v === null) return '<span class="unresolved">[missing: ' + path + "]</span>";
    if (NAME_FILTERS[f]) return '<span class="name">' + NAME_FILTERS[f](v) + "</span>";
    const fn = FILTERS[f] || FILTERS.raw;
    return '<span class="num">' + fn(v) + "</span>";
  });
}

/** The same resolution for a plain-text context (an aria-label, a title
    attribute, a chart label) where markup would show through. */
export function fillText(str, corpus) {
  return fill(str, corpus).replace(/<[^>]+>/g, "");
}
