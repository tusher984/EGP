/* storydoc.js — the article, read out of a text file instead of out of the code.
   ------------------------------------------------------------------------------
   The story a reader sees is written in site/story.md. index.html names that file
   in a <meta name="story-src"> tag; app.js fetches it and hands the text here;
   this module turns it into the same block objects site/scripts/story.js has
   always drawn. Nothing about the drawing changed — only where the words live, so
   the article can be edited, retranslated or reordered by anyone who can edit a
   text file, with no JavaScript touched and no build step run.

   The file format is four rules:

     # kind [argument]     opens a block. Everything after it belongs to it.
     en: …                 the English text of that block.
     bn: …                 the Bangla text of the same block.
     // …                  a comment. Never rendered.

   A line that is neither of those and is not blank continues the value above it,
   so a long paragraph may be wrapped over as many lines as the writer likes. A
   blank line closes the value but leaves the block open — which is how a finding
   carries several paragraphs: each en/bn pair after the heading is one more.

   Figures are named, never inlined: `# fig bars` asks story.js for the bar
   figure. A figure name with no builder shows as a missing-figure line on the
   page rather than a hole, which is the existing behaviour and is left alone.

   Numbers are never typed into the file. `{{money.crore|cr}}` is resolved against
   site/data/corpus.json at render time, so a rebuild moves every figure in the
   prose and no edit here can put a stale number on the page. */

/** The block kinds story.js can draw. A `# kind` this list does not name is
    dropped with a console warning rather than guessed at — a typo in the story
    file should be visible to whoever made it and invisible to the reader. */
const KINDS = {
  lede: "text", p: "text", h2: "text",   /* prose */
  tiles: "bare", exhibits: "bare", doors: "bare",
  case: "arg", fig: "arg",               /* argument is a case id / figure name */
  finding: "finding",                    /* argument is the tag */
};

/** The three head fields, which are not blocks: they are the kicker, the
    headline and the deck above the byline. */
const HEAD_KEYS = ["kicker", "hed", "dek"];

const TAGS = ["fact", "derived", "possible", "unresolved"];

/* A value line: `en:`, `bn:`, or the heading forms `h.en:` / `h.bn:`. */
const VALUE = /^(h\.)?(en|bn)\s*:\s*(.*)$/;

/** Parse the story file.
    @param {string} text raw contents of site/story.md
    @returns {{head: Object, blocks: Array, warnings: string[]}} */
export function parseStory(text) {
  const head = {};
  const blocks = [];
  const warnings = [];

  let block = null;   /* the block being filled */
  let field = null;   /* {obj, key} the en/bn pair being written into */
  let side = null;    /* "en" | "bn" — which member of that pair */

  const lines = String(text).replace(/\r\n?/g, "\n").split("\n");

  /* Close the block under construction and file it. A head field goes to `head`
     under its own name; anything else joins the article in reading order. */
  const close = () => {
    if (!block) return;
    if (block.head) head[block.head] = block.pair;
    else blocks.push(block.out);
    block = null;
    field = null;
    side = null;
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    const where = "story.md line " + (i + 1);

    if (!line || line.startsWith("//")) { field = null; return; }

    if (line.startsWith("#")) {
      close();
      const parts = line.slice(1).trim().split(/\s+/);
      const kind = parts[0];
      const arg = parts.slice(1).join(" ");

      if (HEAD_KEYS.includes(kind)) {
        block = { head: kind, pair: { en: "", bn: "" } };
        return;
      }

      const shape = KINDS[kind];
      if (!shape) { warnings.push(where + ": unknown block “" + kind + "”"); return; }

      if (shape === "finding") {
        const tag = TAGS.includes(arg) ? arg : "derived";
        if (!TAGS.includes(arg)) warnings.push(where + ": unknown finding tag “" + arg + "”, read as derived");
        block = { out: { k: "finding", tag: tag, h: { en: "", bn: "" }, p: [] } };
      } else if (shape === "arg") {
        const out = { k: kind };
        if (arg) out.id = arg;
        else if (kind === "fig") { warnings.push(where + ": figure with no name"); return; }
        block = { out: out };
      } else if (shape === "bare") {
        block = { out: { k: kind } };
      } else {
        block = { out: { k: kind, en: "", bn: "" } };
      }
      return;
    }

    const m = line.match(VALUE);
    if (m) {
      if (!block) { warnings.push(where + ": text before the first block, dropped"); return; }
      const heading = !!m[1];
      side = m[2];

      if (block.head) field = block.pair;
      else if (block.out.k === "finding") {
        /* h.en / h.bn write the heading; a bare en/bn opens or continues the
           current paragraph. English first, Bangla second: the pair the Bangla
           belongs to is the last one opened. */
        if (heading) field = block.out.h;
        else if (side === "en" || !block.out.p.length) {
          field = { en: "", bn: "" };
          block.out.p.push(field);
        } else {
          field = block.out.p[block.out.p.length - 1];
        }
      } else field = block.out;

      field[side] = m[3].trim();
      return;
    }

    /* A continuation of the line above. */
    if (field && side) field[side] = (field[side] ? field[side] + " " : "") + line;
    else warnings.push(where + ": loose text with no en: or bn: above it, dropped");
  });

  close();

  return { head: head, blocks: blocks, warnings: warnings };
}

/** Fetch and parse the story file named by <meta name="story-src"> in the page.
    Returns null if the tag is absent, the file is missing, or it parses to
    nothing — every one of which leaves the article on the copy compiled into
    content.js, so the page is never blank because a text file moved.
    @returns {Promise<?{head: Object, blocks: Array}>} */
export async function loadStory() {
  const tag = document.querySelector('meta[name="story-src"]');
  const src = tag && tag.getAttribute("content");
  if (!src) return null;

  let text;
  try {
    const res = await fetch(src, { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status + " " + res.statusText);
    text = await res.text();
  } catch (err) {
    console.warn("story file " + src + " could not be read (" + err.message + "); using the built-in copy");
    return null;
  }

  const doc = parseStory(text);
  doc.warnings.forEach((w) => console.warn("story file: " + w));
  if (!doc.blocks.length) {
    console.warn("story file " + src + " parsed to no blocks; using the built-in copy");
    return null;
  }
  return doc;
}
