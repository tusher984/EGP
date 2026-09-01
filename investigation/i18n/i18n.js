/* Two languages, one investigation.

   Every sentence this site writes in its own voice — headings, explanations, chart
   titles, column labels, the findings, the limitations — exists twice: once in
   i18n/en.js and once in i18n/bn.js. The modules that build the page hold no prose at
   all. They name a key and hand over the numbers the sentence needs, and the pack for
   the reader's language turns that into a sentence. Bengali word order is not English
   word order, so a translation cannot be a substitution inside an English template;
   each entry is a function that writes its own sentence from the same values.

   What is NOT translated, and why. Every string that came off a page — a firm's name,
   a tender number, a PDF filename, the status a notice prints, the wording of a
   quoted clause, the name of a field in the portal's own amendment form — stays
   exactly as the document prints it, in both languages. Those strings are the
   evidence: a reader checking a figure against page 3 of a PDF has to find the same
   characters here as there, and a translated firm name cannot be looked up in
   anything. The Bangla page says so where a reader first meets one of them.

   The pack for the other language is never fetched. A reader of one language pays
   nothing for the existence of the other. */

export const LANGS = [
  ["en", "English", "English"],
  ["bn", "বাংলা", "Bangla"],
];

const KEY = "egp-watch-lang";
const CODES = LANGS.map(([c]) => c);

/* The URL wins over the remembered choice, so a link someone shares opens in the
   language they were reading. Otherwise the remembered choice, and otherwise English.
   Resolved once, synchronously, before any module formats a number: ui.js reads it at
   module scope to decide whether to write ১,১৫০ or 1,150. */
function resolve() {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && CODES.includes(q)) return q;
  } catch { /* no URL: fall through */ }
  try {
    const kept = localStorage.getItem(KEY);
    if (kept && CODES.includes(kept)) return kept;
  } catch { /* private browsing: fall through */ }
  return "en";
}

export const LANG = resolve();

/* ---- the pack ---- */

let PACK = null;
const MISSING = new Set();

export async function loadStrings() {
  if (PACK) return PACK;
  const mod = await import(`./${LANG}.js`);
  PACK = mod.default;
  return PACK;
}

/* A key with no entry is a bug, not a fallback. It is recorded rather than hidden:
   scripts/check_i18n.js reads the packs and fails on a key one has and the other does
   not, and window.__i18n.missing() lists anything that slipped through at run time.
   The visible result is the key itself, which is ugly on purpose — an untranslated
   sentence should be obvious in the page, not quietly plausible. */
export function t(key, vars) {
  const v = PACK && PACK[key];
  if (v === undefined) {
    MISSING.add(key);
    return `[${key}]`;
  }
  return typeof v === "function" ? v(vars || {}) : v;
}

export const missing = () => [...MISSING].sort();

/* Parser vocabulary — the kind of a record, the role a name plays, the short name of
   a label — is looked up the same way, but a key with no entry falls back to the token
   itself rather than shouting. These tokens are open sets: a new relation type appearing
   in the data should print as the parser named it, not as [role.something]. The parity
   check across the two packs still catches one pack having a word the other lacks. */
export function word(key, fallback) {
  const v = PACK && PACK[key];
  if (v === undefined) return fallback;
  return typeof v === "function" ? v({}) : v;
}

/* ---- the sentences the analysis wrote ----
   Not every sentence on this site was written by hand. A finding's headline, its detail
   and its arithmetic, the reason a clause carries the label it carries, the note the
   audit wrote about itself: 04_analysis.py and 03_audit.py write those into the data,
   in English, keyed by nothing. So the Bangla pack carries a map from the exact English
   sentence to its Bangla counterpart, and a sentence with no entry prints in English.

   That fallback is deliberate and it is the honest one. A Bangla reader gets the
   translated sentence where there is one and the original where there is not, which can
   be read either way; [prose.4f2a] can be read neither way. The gap is measured rather
   than guessed at: scripts/check_i18n.js counts the analysis strings the Bangla pack
   does not cover, and untranslated() lists at run time whatever the page actually met. */
const UNTRANSLATED = new Set();

/* ---- the same sentence with a different number in it ----
   Most of what 04_analysis.py writes is one of a handful of sentences with a figure
   dropped into it. "demands 5.50 crore taka, above the 3.83 crore taka that nine in ten
   clauses of the same kind demand" is printed 41 times over with 41 different pairs of
   figures, and there are five shapes like it behind all 55 of the clause reasons this
   archive produces. Listing them one by one in __data would mean a Bangla entry keyed to
   5.50, which is a translation with a number baked into it: re-run the pipeline on more
   documents and every one of those entries silently stops matching.

   So a pack may also carry patterns. Each is an anchored regular expression and the
   Bangla sentence for it, with $1 and $2 standing where the captured figures go. The
   figures are read out of the live string every time, so they cannot go stale, and the
   pack's own digits are used for them. If the analysis ever rewords the sentence, the
   pattern stops matching and the English prints — the same honest failure as a missing
   __data entry, never a wrong number.

   Patterns are tried in order and only after an exact __data entry has been looked for,
   so a sentence that wants its own wording can always have it. */
function localDigits(s) {
  const set = PACK && PACK.__digits;
  if (!set) return s;
  return s.replace(/[0-9]/g, (d) => set[+d]);
}

function fromPattern(key) {
  for (const [re, out] of (PACK && PACK.__patterns) || []) {
    const m = re.exec(key);
    if (m) return out.replace(/\$(\d)/g, (_, i) => localDigits(m[+i] || ""));
  }
  return undefined;
}

export function dataText(s) {
  if (s === null || s === undefined) return "";
  const key = String(s);
  const map = PACK && PACK.__data;
  let v = map && map[key];
  if (v === undefined) v = fromPattern(key);
  if (v === undefined) {
    if (LANG !== "en") UNTRANSLATED.add(key);
    return key;
  }
  return v;
}

export const untranslated = () => [...UNTRANSLATED].sort();

/* One handle on the window, for a checker in the browser console and for nothing else.
   Nothing in the site reads it. */
try {
  window.__i18n = { LANG, missing, untranslated, t, word, dataText };
} catch { /* no window: the parity checker imports this module under node */ }

/* ---- the switch ----
   Changing language rebuilds the page rather than re-rendering it in place. Four of
   the six tools are built only when they come into view and two of them hold tables
   of several thousand rows; re-labelling those in place would mean every section
   carrying an update path it is never otherwise asked for. A reload is one line, it
   cannot leave half the page in the other language, and the hash goes with it so the
   reader lands back on the section they were reading. */
export function switchTo(code) {
  try { localStorage.setItem(KEY, code); } catch { /* private mode: the URL carries it */ }
  const url = new URL(location.href);
  url.searchParams.set("lang", code);
  location.assign(url.toString());
}

/* The label names the language the button switches TO, in that language, so a reader
   who cannot read the current one can still find the way out. */
export function langButton() {
  const next = CODES[(CODES.indexOf(LANG) + 1) % CODES.length];
  const [, own, english] = LANGS.find(([c]) => c === next);
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "mode lang";
  btn.lang = next;
  btn.textContent = own;
  btn.setAttribute("aria-label", `Read this investigation in ${english}`);
  btn.addEventListener("click", () => switchTo(next));
  return btn;
}
