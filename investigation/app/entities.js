/* Entity profiles, and the connection explorer.

   Four tables name things: 309 firms, 137 people, 110 organizations, 108 projects.
   A profile prints every column the pipeline wrote for one of them, in the words of
   the documents, with the first document it appears in one click away. Nothing is
   summarised out: if a firm's name is printed four different ways, all four are here.

   Two rules govern this section, and they are the master rule of the investigation
   applied to entities. First, two records are never merged because their names look
   alike — where names resemble each other the pair is printed, with the measure, and
   marked not merged. Second, a link exists here only because a page prints it, and
   every link carries that page. There is no inferred edge anywhere in this section.

   Nothing a document prints is translated here. A firm's name, an address, a
   designation, a tender number, a country, a share — all of it is copied out and
   printed as found, in both editions, because it is the evidence. What is translated
   is the site's own writing: the captions, the counts, the warnings, and the eight
   words the parser uses for a link, which are its coinage rather than a quotation. */

import {
  el, num, taka, exact, clear, chip, cite, dataTable, disclosure, tiles, figure, tabs,
} from "../components/ui.js";
import { t, word, dataText } from "../i18n/i18n.js";
import { egoGraph } from "../charts/charts.js";
import { table, analysis } from "./data.js";

/* [csv, what one row is, the key of the sentence describing the set] */
const TYPES = [
  ["companies", "company", "ent.blurb.companies"],
  ["people", "person", "ent.blurb.people"],
  ["organizations", "organization", "ent.blurb.organizations"],
  ["projects", "project", "ent.blurb.projects"],
];

/* The counts a profile leads with, in reading order. A row carries only some of
   them — a project has no contracts_won — and the missing ones are simply absent. */
const TILES = [
  ["documents", "ent.tile.documents"],
  ["contracts_won", "ent.tile.contractsWon"],
  ["total_contract_value_taka", "ent.tile.value", "money"],
  ["notices_published", "ent.tile.notices"],
  ["awards_published", "ent.tile.awards"],
  ["tenders_invited", "ent.tile.tendersInvited"],
  ["awards_approved", "ent.tile.awardsApproved"],
  ["notices", "ent.tile.noticesCharged"],
  ["awards", "ent.tile.awardsCharged"],
  ["procuring_entity_count", "ent.tile.entities"],
  ["distinct_winners", "ent.tile.winners"],
  ["printed_name_variants", "ent.tile.variants"],
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
    ...TYPES.map(([csv]) => table(csv)),
    table("relationships"), table("name_candidate_pairs"), table("beneficial_owners"),
  ]).then(([companies, people, organizations, projects, rel, pairs, owners]) => {
    const sets = { company: companies, person: people, organization: organizations,
      project: projects };
    const byId = new Map();
    for (const [kind, set] of Object.entries(sets)) {
      for (const row of set.rows) byId.set(row.id, { kind, row, columns: set.columns });
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
  return type === "tender" ? t("ent.tenderNo", { id }) : id;
};

/* The eight words relationships.csv uses for a link. They are the parser's coinage,
   not a quotation from a page, so both editions name them; where a pack does not,
   word() prints the parser's own word. The raw value stays the key everywhere a
   decision is made on it — only what a reader sees is translated. */
const relWord = (r) => word(`rel.${r}`, r);

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
   A lane whose label starts with an arrow is a link printed the other way round.
   A lane is keyed on the raw relation and the direction, so two relations that a
   language happens to render alike still stay two lanes. */
function lanesFor(ix, id) {
  const lanes = new Map();
  const add = (key, label, node) => {
    if (!lanes.has(key)) lanes.set(key, { relation: label, nodes: [] });
    lanes.get(key).nodes.push(node);
  };
  for (const r of ix.out.get(id) || []) {
    add(`out:${r.relation}`, `${relWord(r.relation)} →`,
      { label: labelOf(ix, r.target_id, r.target_type),
        id: r.target_id, type: r.target_type, detail: detailText(r) });
  }
  for (const r of ix.inn.get(id) || []) {
    add(`in:${r.relation}`, `→ ${relWord(r.relation)}`,
      { label: labelOf(ix, r.source_id, r.source_type),
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
    ...(ix.out.get(id) || []).map((r) => ({ ...r, dir: t("ent.rel.dirOut"),
      other: labelOf(ix, r.target_id, r.target_type), other_type: r.target_type,
      other_id: r.target_id })),
    ...(ix.inn.get(id) || []).map((r) => ({ ...r, dir: t("ent.rel.dirIn"),
      other: labelOf(ix, r.source_id, r.source_type), other_type: r.source_type,
      other_id: r.source_id })),
  ];
  return dataTable({
    columns: [
      { key: "dir", label: t("ent.rel.colDir") },
      { key: "relation", label: t("ent.rel.colRelation"),
        cell: (r) => relWord(r.relation) },
      { key: "other", label: t("ent.rel.colOther"), wrap: true },
      { key: "other_type", label: t("ent.rel.colOtherType"),
        cell: (r) => word(`ekind.${r.other_type}`, r.other_type) },
      { key: "detail", label: t("ent.rel.colDetail"),
        cell: (r) => detailNode(r) },
      { key: "evidence_file", label: t("ent.rel.colPrintedOn"),
        cell: (r) => cite(r.evidence_file, +r.evidence_page || null) },
    ],
    rows, per: 20, filename,
    caption: t("ent.rel.caption"),
  });
}

/* Everything the pipeline wrote about one record, printed. Columns that hold a list
   are broken back into their items, tender numbers become searches, and a column
   this record has no value for is left out rather than shown empty.

   A heading is the CSV's own column name with the underscores taken out unless the
   pack names it, for the same reason the table explorer works that way: renaming a
   column upstream should show up on the page rather than be papered over. */
function fieldBlocks(e) {
  const dl = el("dl", { class: "fields" });
  const tiled = new Set(TILES.map((row) => row[0]));
  for (const k of e.columns) {
    if (SKIP.has(k) || tiled.has(k)) continue;
    const v = e.row[k];
    if (v === "" || v === undefined || v === null) continue;
    const label = word(`ecol.${k}`, k.replace(/_/g, " "));
    if (LISTS.has(k)) {
      const items = listOf(v);
      if (!items.length) continue;
      dl.append(el("dt", label), el("dd", el("ul", { class: "plain" },
        items.map((x) => el("li", k === "tender_ids"
          ? el("a", { href: searchHref(`tender:${x}`) }, t("ent.tenderNo", { id: x }))
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
  for (const [k, key, kind] of TILES) {
    const v = e.row[k];
    if (v === "" || v === undefined || v === null) continue;
    items.push(kind === "money"
      ? { value: taka(v), label: t(key), title: exact(v) }
      : { value: num(v), label: t(key) });
  }
  return items;
}

/* Names that resemble each other, and were not merged. The pair is evidence about
   the archive, not about the firms: it says a reader looking for one should also
   look at the other. */
function pairsBlock(ix, id) {
  const rows = ix.pairsFor.get(id) || [];
  if (!rows.length) return null;
  return disclosure(t(rows.length === 1 ? "ent.pairs.one" : "ent.pairs.many",
    { n: num(rows.length) }), () => dataTable({
    columns: [
      { key: "name_a", label: t("ent.pairs.colA"), wrap: true },
      { key: "name_b", label: t("ent.pairs.colB"), wrap: true },
      { key: "resemblance", label: t("ent.pairs.colHow"), wrap: true,
        cell: (r) => dataText(r.resemblance) },
      { key: "measure", label: t("ent.pairs.colMeasure"),
        cell: (r) => (r.measure ? dataText(r.measure) : "") },
      { key: "merged", label: t("ent.pairs.colMerged"),
        cell: (r) => word(`yn.${r.merged}`, r.merged) },
    ],
    rows, per: 10, filter: false,
    caption: t("ent.pairs.caption"),
  }));
}

/* Ownership is declared, not discovered: these rows exist because a page printed a
   schedule of owners. 77 rows in the whole archive, so a firm with none is the norm
   and not a finding. */
function ownersBlock(ix, id, kind) {
  const rows = ix.ownersFor.get(id) || [];
  if (!rows.length) return null;
  const one = rows.length === 1;
  const key = kind === "person"
    ? (one ? "ent.owners.person.one" : "ent.owners.person.many")
    : (one ? "ent.owners.firm.one" : "ent.owners.firm.many");
  return disclosure(t(key, { n: num(rows.length) }), () => dataTable({
    columns: [
      { key: "owner_name", label: t("ent.owners.colOwner"), wrap: true },
      { key: "company", label: t("ent.owners.colFirm"), wrap: true },
      { key: "designation", label: t("ent.owners.colDesignation") },
      { key: "ownership_pct", label: t("ent.owners.colShare"), num: true },
      { key: "country", label: t("ent.owners.colCountry") },
      { key: "tender_id", label: t("ent.owners.colTender"),
        cell: (r) => el("a", { href: searchHref(`tender:${r.tender_id}`) }, r.tender_id) },
      { key: "source_file", label: t("ent.owners.colPrintedOn"),
        cell: (r) => cite(r.source_file, +r.page || null) },
    ],
    rows, per: 10, filter: false,
    caption: t("ent.owners.caption"),
  }));
}

/* The picture and its table, built once and used by both the profiles and the
   connection explorer, so the two sections cannot drift apart. */
function graphFigure(ix, id, e, lanes, opts = {}) {
  const links = lanes.reduce((s, l) => s + l.nodes.length, 0);
  if (!links) return el("p", { class: "note" }, t("ent.graph.noLinks"));
  return el("div",
    figure({
      title: opts.title || t("ent.graph.title"),
      note: t("ent.graph.note", { n: num(links) })
        + (opts.onPick ? t("ent.graph.notePick") : ""),
      build: (p) => egoGraph(p, {
        centre: { label: e.row.name, type: word(`ekind.${e.kind}`, e.kind) },
        lanes,
        onPick: opts.onPick || null,
      }),
      source: t("ent.graph.source"),
    }),
    disclosure(t("ent.graph.asTable"),
      () => relationTable(ix, id, `${id}_links.csv`), { open: opts.tableOpen || false }));
}

export function entityProfile(ix, id, opts = {}) {
  const e = ix.byId.get(id);
  if (!e) return el("p", { class: "warn" }, t("ent.noRecord", { id }));
  const roles = listOf(e.row.roles);

  const art = el("article", { class: "profile", id: `entity-${id}` },
    el("header", { class: "profilehead" },
      el("p", { class: "kicker" }, word(`ekind.${e.kind}`, e.kind)),
      el("h3", e.row.name),
      el("p", { class: "note" }, t("ent.idIs", { id }),
        e.row.first_document ? t("ent.firstNamedIn") : "",
        e.row.first_document ? cite(e.row.first_document, +e.row.first_page || null) : ""),
      roles.length
        ? el("p", { class: "chiprow" }, roles.map((r) => chip(r, { square: true })))
        : null),
    e.row.name_read_from_interleaved_layout
      ? el("p", { class: "warn" }, t("ent.interleaved"))
      : null,
    tiles(tileItems(e)),
    fieldBlocks(e),
    graphFigure(ix, id, e, lanesFor(ix, id), opts));

  const owners = ownersBlock(ix, id, e.kind);
  if (owners) art.append(owners);
  const pairs = pairsBlock(ix, id);
  if (pairs) art.append(pairs);
  art.append(el("p", { class: "note" },
    el("a", { href: searchHref(`"${e.row.name}"`) }, t("ent.findEverywhere"))));
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

function listFor(ix, kind, blurbKey) {
  const set = ix.sets[kind];
  const numeric = TILES.filter(([k]) => set.columns.includes(k)).slice(0, 4);
  return el("div",
    el("p", { class: "note" }, t(blurbKey)),
    dataTable({
      columns: [
        { key: "name", label: t("ent.list.colName"), wrap: true,
          cell: (r) => el("button", { class: "linky", type: "button",
            onclick: () => openProfile(ix, r.id) }, r.name) },
        { key: "roles", label: t("ent.list.colRoles"), wrap: true },
        ...numeric.map(([k, key, kindOf]) => ({
          key: k, label: t(key), num: true,
          cell: kindOf === "money"
            ? (r) => (r[k] === "" ? "" : el("span", { title: exact(r[k]) }, taka(r[k])))
            : undefined,
        })),
      ],
      rows: set.rows, per: 15,
      sort: numeric.length ? numeric[0][0] : "name",
      filename: `${kind}_filtered.csv`,
      caption: t("ent.list.caption", { kind: word(`ekind.${kind}`, kind) }),
    }));
}

export function entityExplorer() {
  const body = el("div", el("p", { class: "loading" }, t("ent.loading")));
  const howMany = el("span", t("ent.whoBare"));
  HOST = el("div", { class: "profilehost", id: "profile" });

  entityIndex().then((ix) => {
    clear(body);
    howMany.textContent = t("ent.whoCounted", { n: num(ix.byId.size) });
    body.append(tabs(TYPES.map(([csv, kind, blurbKey]) => ({
      label: t("ent.tabLabel", { set: word(`eset.${kind}`, csv.replace(/_/g, " ")),
        n: num(ix.sets[kind].rows.length) }),
      build: () => listFor(ix, kind, blurbKey),
    }))));
  }).catch((e) => { clear(body); body.append(el("p", { class: "warn" }, e.message)); });

  return el("section", { class: "band", id: "entities" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, t("ent.kicker")),
      el("h2", t("ent.title")),
      el("div", { class: "prose" },
        el("p", howMany, t("ent.p1rest")),
        el("p", el("b", t("ent.p2lead")), t("ent.p2rest"))),
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
      t("net.addr.lead", { n: num(groups.length) })),
    el("ul", groups.map((g) => el("li",
      el("b", g.address), " — ",
      (g.firms || []).map((f, i) => el("span", i ? "; " : "", same(f, name)
        ? el("mark", f) : f)),
      g.involves_a_joint_venture
        ? el("span", { class: "note" }, t("net.addr.jv"))
        : null))),
    el("p", { class: "note" }, t("net.addr.note")));
}

export function networkExplorer() {
  const list = el("datalist", { id: "entity-names" });
  const pick = el("input", { type: "search", list: "entity-names", autocomplete: "off",
    placeholder: t("net.pickPlaceholder"), "aria-label": t("net.pickAria") });
  const panel = el("div", el("p", { class: "loading" }, t("net.loading")));
  const byName = new Map();

  const show = (ix, a, id) => {
    const e = ix.byId.get(id);
    if (!e) return;
    pick.value = e.row.name;
    clear(panel);
    panel.append(graphFigure(ix, id, e, lanesFor(ix, id), {
      title: t("net.graphTitle", { name: e.row.name }),
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
        t("net.openProfile"))));
  };

  Promise.all([entityIndex(), analysis()]).then(([ix, a]) => {
    for (const [id, e] of ix.byId) {
      byName.set(e.row.name.toLowerCase(), id);
      list.append(el("option", { value: e.row.name }, word(`ekind.${e.kind}`, e.kind)));
    }
    pick.addEventListener("change", () => {
      const id = byName.get(pick.value.trim().toLowerCase());
      if (id) { show(ix, a, id); return; }
      clear(panel);
      panel.append(el("p", { class: "warn" }, t("net.noSuchName")));
    });
    /* Opens on the firm the archive attaches the most contracts to, so the section
       has something in it before a reader types. Chosen by the data, not by hand. */
    const start = ix.sets.company.rows.reduce((best, r) =>
      (+r.contracts_won > +(best ? best.contracts_won : -1) ? r : best), null);
    show(ix, a, start ? start.id : ix.byId.keys().next().value);
  }).catch((e) => { clear(panel); panel.append(el("p", { class: "warn" }, e.message)); });

  return el("section", { class: "band alt", id: "network" },
    el("div", { class: "wrap" },
      el("p", { class: "kicker" }, t("net.kicker")),
      el("h2", t("net.title")),
      el("div", { class: "prose" },
        el("p", t("net.p1")),
        el("p", el("b", t("net.p2lead")), t("net.p2mid"),
          chip("POSSIBLE CONNECTION"), t("net.p2end"))),
      el("div", { class: "tablebar" },
        el("label", { class: "field grow" },
          el("span", { class: "sr" }, t("net.srPick")), pick), list),
      panel));
}
