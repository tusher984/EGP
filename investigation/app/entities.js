/* Entity profiles, and the connection explorer.

   Four tables name things: 309 firms, 137 people, 110 organizations, 108 projects.
   A profile prints every column the pipeline wrote for one of them, in the words of
   the documents, with the first document it appears in one click away. Nothing is
   summarised out: if a firm's name is printed four different ways, all four are here.

   Two rules govern this section, and they are the master rule of the investigation
   applied to entities. First, two records are never merged because their names look
   alike — where names resemble each other the pair is printed, with the measure, and
   marked not merged. Second, a link exists here only because a page prints it, and
   every link carries that page. There is no inferred edge anywhere in this section. */

import {
  el, num, taka, exact, clear, chip, cite, dataTable, disclosure, tiles, figure, tabs,
} from "../components/ui.js";
import { egoGraph } from "../charts/charts.js";
import { table, analysis } from "./data.js";

/* [csv, what one row is, what the set is] */
const TYPES = [
  ["companies", "company", "firms named anywhere in the archive"],
  ["people", "person", "people named, with the role they are named in"],
  ["organizations", "organization", "ministries, agencies and procuring entities"],
  ["projects", "project", "the projects contracts are charged to"],
];

/* The counts a profile leads with, in reading order. A row carries only some of
   them — a project has no contracts_won — and the missing ones are simply absent. */
const TILES = [
  ["documents", "documents that name it"],
  ["contracts_won", "contracts won"],
  ["total_contract_value_taka", "value of those contracts", "money"],
  ["notices_published", "notices published"],
  ["awards_published", "awards published"],
  ["tenders_invited", "tenders invited"],
  ["awards_approved", "awards approved"],
  ["notices", "notices charged to it"],
  ["awards", "awards charged to it"],
  ["procuring_entity_count", "procuring entities dealt with"],
  ["distinct_winners", "different winners"],
  ["printed_name_variants", "ways its name is printed"],
];

/* Columns the parser writes as a list. It joins with " | " where a value may hold a
   comma, and with ";" where it may not. */
const LISTS = new Set(["other_printed_names", "roles", "tender_ids", "agencies",
  "procuring_entities", "districts", "addresses_printed", "tenderer_ids_printed",
  "designations_printed", "organizations", "winners", "project_codes_printed",
  "declared_owner_of", "declared_ownership"]);

const SKIP = new Set(["id", "name", "match_key", "roles", "first_document",
  "first_page", "name_read_from_interleaved_layout"]);

const MONEY = new Set(["total_contract_value_taka"]);

const listOf = (v) => String(v || "").split(/\s+\|\s+|;/)
  .map((s) => s.trim()).filter(Boolean);

export const searchHref = (q) => `#q=${encodeURIComponent(q)}`;

/* ---- the index ----
   Six CSVs, fetched once between them, and joined on the ids the parser assigned.
   Tenders appear in relationships.csv as their printed tender number rather than an
   assigned id, so a numeric id is a tender and an id like co0001 is an entity; the
   two cannot collide, which is why they share one map. */
let INDEX = null;

export function entityIndex() {
  if (INDEX) return INDEX;
  INDEX = Promise.all([
    ...TYPES.map(([t]) => table(t)),
    table("relationships"), table("name_candidate_pairs"), table("beneficial_owners"),
  ]).then(([companies, people, organizations, projects, rel, pairs, owners]) => {
    const sets = { company: companies, person: people, organization: organizations,
      project: projects };
    const byId = new Map();
    for (const [kind, t] of Object.entries(sets)) {
      for (const row of t.rows) byId.set(row.id, { kind, row, columns: t.columns });
    }
    const out = new Map(), inn = new Map();
    const push = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
    for (const r of rel.rows) {
      push(out, r.source_id, r);
      push(inn, r.target_id, r);
    }
    const pairsFor = new Map();
    for (const p of pairs.rows) {
      push(pairsFor, p.id_a, p);
      push(pairsFor, p.id_b, p);
    }
    const ownersFor = new Map();
    for (const o of owners.rows) {
      push(ownersFor, o.company_id, o);
      if (o.owner_id) push(ownersFor, o.owner_id, o);
    }
    return { sets, byId, out, inn, pairsFor, ownersFor,
      relColumns: rel.columns, pairColumns: pairs.columns };
  });
  return INDEX;
}

const labelOf = (ix, id, type) => {
  const e = ix.byId.get(id);
  if (e) return e.row.name;
  return type === "tender" ? `Tender ${id}` : id;
};

/* Two relations print a contract value in the detail column and three print a
   designation or a share; the rest print nothing. Money is written the way the rest
   of the site writes it, with the exact figure kept in the title. */
const MONEY_RELATIONS = new Set(["was awarded", "awarded contract to"]);

function detailNode(r) {
  const d = String(r.detail || "").trim();
  if (!d) return "";
  if (MONEY_RELATIONS.has(r.relation) && Number.isFinite(+d)) {
    return el("span", { title: exact(d) }, taka(d));
  }
  return d;
}

function detailText(r) {
  const d = String(r.detail || "").trim();
  if (!d) return "";
  return MONEY_RELATIONS.has(r.relation) && Number.isFinite(+d) ? taka(d) : d;
}

/* Every link the documents print for one id, both directions, each with its page.
   A lane whose label starts with an arrow is a link printed the other way round. */
function lanesFor(ix, id) {
  const lanes = new Map();
  const add = (key, node) => {
    if (!lanes.has(key)) lanes.set(key, { relation: key, nodes: [] });
    lanes.get(key).nodes.push(node);
  };
  for (const r of ix.out.get(id) || []) {
    add(`${r.relation} →`, { label: labelOf(ix, r.target_id, r.target_type),
      id: r.target_id, type: r.target_type, detail: detailText(r) });
  }
  for (const r of ix.inn.get(id) || []) {
    add(`→ ${r.relation}`, { label: labelOf(ix, r.source_id, r.source_type),
      id: r.source_id, type: r.source_type, detail: detailText(r) });
  }
  const out = [...lanes.values()];
  for (const l of out) {
    l.nodes.sort((a, b) => a.label.localeCompare(b.label, "en", { numeric: true }));
  }
  return out.sort((a, b) => b.nodes.length - a.nodes.length);
}

function relationTable(ix, id, filename) {
  const rows = [
    ...(ix.out.get(id) || []).map((r) => ({ ...r, dir: "this record →",
      other: labelOf(ix, r.target_id, r.target_type), other_type: r.target_type,
      other_id: r.target_id })),
    ...(ix.inn.get(id) || []).map((r) => ({ ...r, dir: "→ this record",
      other: labelOf(ix, r.source_id, r.source_type), other_type: r.source_type,
      other_id: r.source_id })),
  ];
  return dataTable({
    columns: [
      { key: "dir", label: "direction" },
      { key: "relation", label: "the link, in the parser's words" },
      { key: "other", label: "the other record", wrap: true },
      { key: "other_type", label: "what it is" },
      { key: "detail", label: "what the page prints beside it",
        cell: (r) => detailNode(r) },
      { key: "evidence_file", label: "printed on",
        cell: (r) => cite(r.evidence_file, +r.evidence_page || null) },
    ],
    rows, per: 20, filename,
    caption: "Every link the documents print for this record, in both directions. "
      + "No link here is inferred: each one is a line on the page it cites.",
  });
}

/* Everything the pipeline wrote about one record, printed. Columns that hold a list
   are broken back into their items, tender numbers become searches, and a column
   this record has no value for is left out rather than shown empty. */
function fieldBlocks(e) {
  const dl = el("dl", { class: "fields" });
  const tiled = new Set(TILES.map((t) => t[0]));
  for (const k of e.columns) {
    if (SKIP.has(k) || tiled.has(k)) continue;
    const v = e.row[k];
    if (v === "" || v === undefined || v === null) continue;
    const label = k.replace(/_/g, " ");
    if (LISTS.has(k)) {
      const items = listOf(v);
      if (!items.length) continue;
      dl.append(el("dt", label), el("dd", el("ul", { class: "plain" },
        items.map((x) => el("li", k === "tender_ids"
          ? el("a", { href: searchHref(`tender:${x}`) }, `Tender ${x}`)
          : x)))));
    } else {
      dl.append(el("dt", label),
        el("dd", MONEY.has(k) ? el("span", { title: exact(v) }, taka(v)) : String(v)));
    }
  }
  return dl;
}

function tileItems(e) {
  const items = [];
  for (const [k, label, kind] of TILES) {
    const v = e.row[k];
    if (v === "" || v === undefined || v === null) continue;
    items.push(kind === "money"
      ? { value: taka(v), label, title: exact(v) }
      : { value: num(v), label });
  }
  return items;
}

/* Names that resemble each other, and were not merged. The pair is evidence about
   the archive, not about the firms: it says a reader looking for one should also
   look at the other. */
function pairsBlock(ix, id) {
  const rows = ix.pairsFor.get(id) || [];
  if (!rows.length) return null;
  return disclosure(`${num(rows.length)} name${rows.length === 1 ? "" : "s"} in the `
    + "archive resemble this one, and were not merged with it", () => dataTable({
    columns: [
      { key: "name_a", label: "one printed name", wrap: true },
      { key: "name_b", label: "the other printed name", wrap: true },
      { key: "resemblance", label: "how they resemble each other", wrap: true },
      { key: "measure", label: "measure" },
      { key: "merged", label: "merged by this pipeline" },
    ],
    rows, per: 10, filter: false,
    caption: "Printed for the reader to judge. This pipeline merges nothing on the "
      + "strength of a resemblance.",
  }));
}

/* Ownership is declared, not discovered: these rows exist because a page printed a
   schedule of owners. 77 rows in the whole archive, so a firm with none is the norm
   and not a finding. */
function ownersBlock(ix, id, kind) {
  const rows = ix.ownersFor.get(id) || [];
  if (!rows.length) return null;
  return disclosure(kind === "person"
    ? `${num(rows.length)} declaration${rows.length === 1 ? "" : "s"} of ownership `
      + "naming this person"
    : `${num(rows.length)} owner${rows.length === 1 ? "" : "s"} this firm declared`,
  () => dataTable({
    columns: [
      { key: "owner_name", label: "owner as printed", wrap: true },
      { key: "company", label: "firm as printed", wrap: true },
      { key: "designation", label: "designation printed" },
      { key: "ownership_pct", label: "share printed", num: true },
      { key: "country", label: "country printed" },
      { key: "tender_id", label: "tender",
        cell: (r) => el("a", { href: searchHref(`tender:${r.tender_id}`) }, r.tender_id) },
      { key: "source_file", label: "printed on",
        cell: (r) => cite(r.source_file, +r.page || null) },
    ],
    rows, per: 10, filter: false,
    caption: "Copied from the schedule of beneficial ownership as printed. A blank "
      + "cell is a blank on the page.",
  }));
}

/* The picture and its table, built once and used by both the profiles and the
   connection explorer, so the two sections cannot drift apart. */
function graphFigure(ix, id, e, lanes, opts = {}) {
  const links = lanes.reduce((s, l) => s + l.nodes.length, 0);
  if (!links) {
    return el("p", { class: "note" }, "The documents print no link between this "
      + "record and any other.");
  }
  return el("div",
    figure({
      title: opts.title || "What the documents attach to this record",
      note: `${num(links)} links, every one of them a line on a page. A lane whose `
        + "label begins with an arrow is a link printed the other way round: the "
        + "record named on the right is the one the document says did it."
        + (opts.onPick ? " Select any of them to move the picture there." : ""),
      build: (p) => egoGraph(p, {
        centre: { label: e.row.name, type: e.kind },
        lanes,
        onPick: opts.onPick || null,
      }),
      source: "Drawn from relationships.csv, which is written only from lines the "
        + "documents print.",
    }),
    disclosure("Read every link as a table",
      () => relationTable(ix, id, `${id}_links.csv`), { open: opts.tableOpen || false }));
}

export function entityProfile(ix, id, opts = {}) {
  const e = ix.byId.get(id);
  if (!e) return el("p", { class: "warn" }, `This archive has no record with id ${id}.`);
  const roles = listOf(e.row.roles);

  const art = el("article", { class: "profile", id: `entity-${id}` },
    el("header", { class: "profilehead" },
      el("p", { class: "kicker" }, e.kind),
      el("h3", e.row.name),
      el("p", { class: "note" }, `id ${id}`,
        e.row.first_document ? " · first named in " : "",
        e.row.first_document ? cite(e.row.first_document, +e.row.first_page || null) : ""),
      roles.length
        ? el("p", { class: "chiprow" }, roles.map((r) => chip(r, { square: true })))
        : null),
    e.row.name_read_from_interleaved_layout
      ? el("p", { class: "warn" }, "This name was read from a page whose columns "
        + "interleave, so the reading is less certain than most. The page is linked "
        + "above; check it against the name printed here.")
      : null,
    tiles(tileItems(e)),
    fieldBlocks(e),
    graphFigure(ix, id, e, lanesFor(ix, id), opts));

  const owners = ownersBlock(ix, id, e.kind);
  if (owners) art.append(owners);
  const pairs = pairsBlock(ix, id);
  if (pairs) art.append(pairs);
  art.append(el("p", { class: "note" },
    el("a", { href: searchHref(`"${e.row.name}"`) },
      "Find this name everywhere in the archive")));
  return art;
}

/* ---- the profiles section ----
   One host for the open profile, so a reader who follows a link from a table, from
   the search results or from the picture always lands in the same place on the page
   rather than opening a fifth panel somewhere below. */
let HOST = null;

function openProfile(ix, id) {
  if (!HOST) return;
  clear(HOST);
  HOST.append(entityProfile(ix, id, {
    onPick: (n) => {
      if (ix.byId.has(n.id)) openProfile(ix, n.id);
      else if (n.type === "tender") window.location.hash = searchHref(`tender:${n.id}`).slice(1);
    },
  }));
  HOST.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Called by the router when a reader arrives at #entity=co0001, and by the search
   results when a hit is an entity rather than a document. */
export function showEntity(id) {
  return entityIndex().then((ix) => {
    if (!ix.byId.has(id)) return false;
    openProfile(ix, id);
    return true;
  });
}

function listFor(ix, kind, blurb) {
  const t = ix.sets[kind];
  const numeric = TILES.filter(([k]) => t.columns.includes(k)).slice(0, 4);
  return el("div",
    el("p", { class: "note" }, blurb),
    dataTable({
      columns: [
        { key: "name", label: "name as printed", wrap: true,
          cell: (r) => el("button", { class: "linky", type: "button",
            onclick: () => openProfile(ix, r.id) }, r.name) },
        { key: "roles", label: "named as", wrap: true },
        ...numeric.map(([k, label, kindOf]) => ({
          key: k, label, num: true,
          cell: kindOf === "money"
            ? (r) => (r[k] === "" ? "" : el("span", { title: exact(r[k]) }, taka(r[k])))
            : undefined,
        })),
      ],
      rows: t.rows, per: 15,
      sort: numeric.length ? numeric[0][0] : "name",
      filename: `${kind}_filtered.csv`,
      caption: `Every ${kind} the parser found a name for. Select a name to open `
        + "everything the documents say about it.",
    }));
}

export function entityExplorer() {
  const body = el("div", el("p", { class: "loading" },
    "Reading the four tables that name things"));
  const howMany = el("span", "Firms, people, ministries and offices");
  HOST = el("div", { class: "profilehost", id: "profile" });

  entityIndex().then((ix) => {
    clear(body);
    howMany.textContent = `${num(ix.byId.size)} records: firms, people, ministries `
      + "and offices";
    body.append(tabs(TYPES.map(([csv, kind, blurb]) => ({
      label: `${csv.replace(/_/g, " ")} · ${num(ix.sets[kind].rows.length)}`,
      build: () => listFor(ix, kind, blurb),
    }))));
  }).catch((e) => { clear(body); body.append(el("p", { class: "warn" }, e.message)); });

  return el("section", { class: "band", id: "entities" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, "Who is in these documents"),
      el("h2", "Every name the archive prints"),
      el("div", { class: "prose" },
        el("p", howMany, ", and the projects contracts are charged to. A profile "
          + "prints every column the pipeline wrote, in the words of the page, and "
          + "links to the first document the name appears in."),
        el("p", el("b", "A name in this section is not an allegation about anyone. "),
          "These names are here because the government's own published notices and "
          + "award records print them. Where two names resemble each other closely "
          + "enough to be the same firm, the pair is shown and marked not merged; "
          + "this pipeline never merges two records because their names look alike.")),
      body, HOST));
}

/* ---- the connection explorer ----

   The same links as a profile, but the question is different: start anywhere and
   walk. Selecting a record in the picture re-centres it, so a reader can go from a
   firm to the tender it won to the office that advertised it to the other firms that
   office has paid, one printed line at a time.

   There is no map in this section. locations.csv carries a coordinates column and
   every row of it reads "not documented in the supplied documents", because the
   documents print district names and no coordinates. Drawing them on a map would
   mean bringing in geography from outside the archive, which this investigation
   does not do. Districts are therefore counted, not plotted. */

const same = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

function addressBlock(a, name) {
  const groups = ((a.connections || {}).address_groups || [])
    .filter((g) => (g.firms || []).some((f) => same(f, name)));
  if (!groups.length) return null;
  return el("div", { class: "callout" },
    el("p", chip("POSSIBLE CONNECTION"), " ",
      `The address this firm printed is printed by other firms too, in `
      + `${num(groups.length)} of the groups the analysis found.`),
    el("ul", groups.map((g) => el("li",
      el("b", g.address), " — ",
      (g.firms || []).map((f, i) => el("span", i ? "; " : "", same(f, name)
        ? el("mark", f) : f)),
      g.involves_a_joint_venture
        ? el("span", { class: "note" }, " One of these names is a joint venture, so a "
          + "shared address may be the address of the venture itself.")
        : null))),
    el("p", { class: "note" }, "A shared address is not shared ownership. Firms share "
      + "buildings, agents and typists, and the documents do not say who occupies "
      + "which room. It is printed here because it is a question worth asking, and "
      + "the archive does not answer it."));
}

export function networkExplorer() {
  const list = el("datalist", { id: "entity-names" });
  const pick = el("input", { type: "search", list: "entity-names", autocomplete: "off",
    placeholder: "Type a firm, a person, an office or a project…",
    "aria-label": "which record to centre the picture on" });
  const panel = el("div", el("p", { class: "loading" }, "Reading the links"));
  const byName = new Map();

  const show = (ix, a, id) => {
    const e = ix.byId.get(id);
    if (!e) return;
    pick.value = e.row.name;
    clear(panel);
    panel.append(graphFigure(ix, id, e, lanesFor(ix, id), {
      title: `${e.row.name}: what the documents attach to it`,
      onPick: (n) => {
        if (ix.byId.has(n.id)) show(ix, a, n.id);
        else if (n.type === "tender") {
          window.location.hash = searchHref(`tender:${n.id}`).slice(1);
        }
      },
    }));
    const addr = e.kind === "company" ? addressBlock(a, e.row.name) : null;
    if (addr) panel.append(addr);
    panel.append(el("p", { class: "note" },
      el("a", { href: `#entity=${id}`, onclick: () => showEntity(id) },
        "Open the full profile of this record")));
  };

  Promise.all([entityIndex(), analysis()]).then(([ix, a]) => {
    for (const [id, e] of ix.byId) {
      byName.set(e.row.name.toLowerCase(), id);
      list.append(el("option", { value: e.row.name }, e.kind));
    }
    pick.addEventListener("change", () => {
      const id = byName.get(pick.value.trim().toLowerCase());
      if (id) { show(ix, a, id); return; }
      clear(panel);
      panel.append(el("p", { class: "warn" }, "No record in the archive is printed "
        + "with exactly that name. The search box takes partial names; this box takes "
        + "the name as the documents print it."));
    });
    /* Opens on the firm the archive attaches the most contracts to, so the section
       has something in it before a reader types. Chosen by the data, not by hand. */
    const start = ix.sets.company.rows.reduce((best, r) =>
      (+r.contracts_won > +(best ? best.contracts_won : -1) ? r : best), null);
    show(ix, a, start ? start.id : ix.byId.keys().next().value);
  }).catch((e) => { clear(panel); panel.append(el("p", { class: "warn" }, e.message)); });

  return el("section", { class: "band alt", id: "network" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, "Which entities connect"),
      el("h2", "Follow one printed line at a time"),
      el("div", { class: "prose" },
        el("p", "Every link in this picture is a line on a page: this firm was awarded "
          + "this tender, this office advertised it, this official invited it, this "
          + "project was charged for it. Select any record in the picture and it "
          + "becomes the centre, so a reader can walk the chain outwards and read the "
          + "page behind every step."),
        el("p", el("b", "Nothing here is inferred. "), "The archive prints no "
          + "shareholder registers, no directorships and no family relations, so this "
          + "section cannot show them. Where two firms printed the same address, that "
          + "is shown as a question, marked ",
        chip("POSSIBLE CONNECTION"), ", and it remains a question.")),
      el("div", { class: "tablebar" },
        el("label", { class: "field grow" },
          el("span", { class: "sr" }, "Centre the picture on a record"), pick), list),
      panel));
}
