/* Does every sentence the site asks for exist in every edition?

   Three separate questions, and this script answers all three, because they fail in
   three different ways:

     1. A t() key a module names and no pack carries. This is a bug in every edition
        at once — the page prints [the.key] in a box. FATAL.
     2. A t() key one pack carries and another lacks. The edition that lacks it prints
        [the.key]. FATAL.
     3. A word() token or a dataText() sentence a pack does not carry. This is not a
        bug: word() falls back to the pipeline's own word and dataText() to the English
        the analysis wrote, both by design, which is how the English pack gets away with
        naming none of them. Counted and listed, never fatal.

   Keys built out of a template — t(`down.${key}.title`) — cannot be read off the
   source, so the prefixes that appear only in that form are listed rather than silently
   passed. They are not unchecked: once a second pack exists, question 2 covers every one
   of them, because a template key that English carries and Bangla does not is a parity
   failure like any other. What the list is for is the case of a template family neither
   pack ever named, which only rendering the page can catch. Run it with `npm run check`.

   No network, no dependencies: it reads the source files and imports the packs. */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SKIP_DIRS = new Set(["node_modules", "public", "data", "parser", "scripts",
  "documentation", "evidence_pages", ".git"]);

function sources(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (!SKIP_DIRS.has(name)) sources(path, out);
    } else if (name.endsWith(".js") && !path.includes(`${join("i18n", "")}`)) {
      out.push(path);
    }
  }
  return out;
}

/* t("a.b") and t('a.b') and t(`a.b`) with no ${} in them. The fourth form —
   t(`a.${x}.b`) — is caught separately and reported, not resolved. */
const STATIC = /\bt\(\s*(?:"([\w.\- ]+)"|'([\w.\- ]+)'|`([\w.\- ]+)`)/g;
const DYNAMIC = /\bt\(\s*`([^`]*\$\{[^`]*)`/g;
const WORDCALL = /\bword\(\s*`([\w.]*?)\$\{/g;

const used = new Map();          // key -> [files]
const dynamic = new Map();       // template -> [files]
const wordNS = new Map();        // namespace -> [files]

for (const file of sources(ROOT)) {
  const src = readFileSync(file, "utf8");
  const where = relative(ROOT, file);
  for (const m of src.matchAll(STATIC)) {
    const key = m[1] || m[2] || m[3];
    if (!key.includes(".")) continue;   /* t("x") with no dot is not a pack key */
    if (!used.has(key)) used.set(key, []);
    if (!used.get(key).includes(where)) used.get(key).push(where);
  }
  for (const m of src.matchAll(DYNAMIC)) {
    if (!dynamic.has(m[1])) dynamic.set(m[1], []);
    dynamic.get(m[1]).push(where);
  }
  for (const m of src.matchAll(WORDCALL)) {
    const ns = m[1].replace(/\.$/, "");
    if (!ns) continue;
    if (!wordNS.has(ns)) wordNS.set(ns, []);
    if (!wordNS.get(ns).includes(where)) wordNS.get(ns).push(where);
  }
}

const PACKS = ["en", "bn"];
const packs = {};
for (const code of PACKS) {
  const path = join(ROOT, "i18n", `${code}.js`);
  if (!existsSync(path)) { packs[code] = null; continue; }
  packs[code] = (await import(`file://${path}`)).default;
}

const problems = [];
const written = PACKS.filter((c) => packs[c]);

/* 1 — a key no pack carries */
const nowhere = [...used.keys()]
  .filter((k) => written.every((c) => !(k in packs[c]))).sort();
for (const k of nowhere) {
  problems.push(`no pack has ${k} — used in ${used.get(k).join(", ")}`);
}

/* 2 — a key one pack carries and another lacks.

   Only the closed vocabulary counts here. A word() namespace is open by construction:
   the call passes the pipeline's own token as the fallback, so a pack that names none of
   `label.*` prints the token and a pack that names all of them prints its own words. The
   English pack does exactly that — it names the nine analysis labels and leaves the
   fifteen record kinds to the index, while the Bangla pack names all twenty-four, because
   there the token is not the word. Counting that as a parity failure would make the two
   packs hostage to each other's vocabulary. It is reported under question 3 instead.

   A key inside such a namespace that some module also names through t() is NOT exempt:
   t() shouts [the.key] when it is missing, so both packs must carry it.

   The members whose name starts with __ are not keys and are not compared: __data and
   __patterns are the translations of sentences the analysis wrote, which exist only in a
   pack that is not the language the analysis wrote in, and __digits is a pack's own
   numerals. Their coverage is question 3's business too. */
const openNS = new Set(wordNS.keys());
const exempt = (k) => openNS.has(k.slice(0, k.indexOf("."))) && !used.has(k);
const isKey = (k) => !k.startsWith("__") && !exempt(k);
const everyKey = new Set(written.flatMap((c) => Object.keys(packs[c])).filter(isKey));
for (const code of written) {
  const missing = [...everyKey].filter((k) => !(k in packs[code])).sort();
  if (missing.length) {
    problems.push(`${code}.js lacks ${missing.length} key(s) another pack has: `
      + `${missing.slice(0, 12).join(", ")}${missing.length > 12 ? ", …" : ""}`);
  }
}

/* 3 — the open vocabularies, counted per pack and never fatal */
const report = [];
for (const code of written) {
  const keys = Object.keys(packs[code]);
  const data = Object.keys(packs[code].__data || {}).length;
  const pats = (packs[code].__patterns || []).length;
  report.push(`${code}.js: ${keys.filter((k) => !k.startsWith("__")).length} keys, `
    + `${data} translated data sentences`
    + (pats ? `, ${pats} sentence patterns` : ""));
  for (const [ns, files] of [...wordNS].sort()) {
    const held = keys.filter((k) => k.startsWith(`${ns}.`)).length;
    report.push(`  word(${ns}.*) — ${held} named; the rest fall back to the `
      + `pipeline's own word (${files.join(", ")})`);
  }
}

console.log(`${used.size} t() keys named in ${sources(ROOT).length} modules`);
for (const line of report) console.log(line);
for (const c of PACKS.filter((x) => !packs[x])) console.log(`${c}.js: not written yet`);
if (dynamic.size) {
  console.log(`${dynamic.size} key(s) built from a template, checked by eye:`);
  for (const [tpl, files] of [...dynamic].sort()) {
    console.log(`  \`${tpl}\` (${[...new Set(files)].join(", ")})`);
  }
}

if (problems.length) {
  console.error("\ni18n check FAILED:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log("every t() key a module names exists in every written pack");
