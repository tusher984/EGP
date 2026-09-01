/* The English edition, in one file.

   Every sentence this site writes in its own voice lives here. The modules that build
   the page hold no prose: they name a key and hand over the numbers the sentence needs.
   An entry that takes numbers is a function of them, so the words can be arranged
   however the language arranges them — see bn.js, where they are arranged differently.

   The numbers arriving in these functions are already formatted: num(), pct() and
   taka() in components/ui.js wrote them, in this language's digits and grouping. A
   function here never does arithmetic and never formats. It writes a sentence.

   The order below follows the page: the chrome, then the numbers, then the article from
   the headline down, then the tools, then how it was made and what it cannot tell you.
   Anything printed exactly as a document prints it — a firm's name, a tender number, a
   status, a quoted clause — is not here, because it is not translated. */

export default {

  /* ---- the chrome ---- */

  "wordmark.aria": "e-GP Watch — back to the top of the story",
  "nav.aria": "the sections of this investigation",
  "nav.story": "The story",
  "nav.search": "Search",
  "nav.names": "Names",
  "nav.connections": "Connections",
  "nav.documents": "Documents",
  "nav.tables": "Tables",
  "nav.data": "Data",
  "nav.method": "Method",

  "mode.night": "Night",
  "mode.day": "Day",
  "mode.toDark": "Switch to the dark palette",
  "mode.toLight": "Switch to the light palette",

  "loading.search": "Building the search index",
  "loading.entities": "Reading the names",
  "loading.network": "Reading the printed links",
  "loading.documents": "Reading the document list",
  "loading.tables": "Reading the tables",
  "loading.downloads": "Sizing the files",

  "err.story": ({ message }) => `The story could not be built: ${message}. `
    + "The dataset is still readable in investigation/data/.",
  "err.tool": ({ message }) => `This tool could not be built: ${message}.`,
  "err.file": ({ path, status }) => `${path} did not load (${status})`,

  /* ---- numbers ----
     The digits arrive already grouped. These entries only put the unit where the
     language puts it. */

  "num.none": "not documented",
  "num.pct": ({ n }) => `${n}%`,
  "num.crore": ({ n }) => `${n} crore`,
  "num.lakh": ({ n }) => `${n} lakh`,
  "num.taka": ({ n }) => `Tk ${n}`,
  "num.times": ({ n }) => `${n}×`,
  "list.sep": ", ",

  /* ---- the parts every table and figure is built from ---- */

  "fig.asTable": "Read these numbers as a table",

  "col.page": "Page",
  "col.printedIn": "Printed in",
  "col.source": "Source",
  "col.tender": "Tender",
  "col.tenders": "Tenders",
  "col.notices": "Notices",
  "col.count": "Count",
  "col.clauses": "Clauses",
  "col.contracts": "Contracts",
  "col.label": "Label",
  "col.status": "Status",
  "col.entity": "Procuring entity",
  "col.district": "District",

  "cite.open": ({ file }) => `Open ${file} in a new tab`,
  "cite.openAt": ({ file, page }) => `Open ${file} at page ${page} in a new tab`,
  "cite.printedIn": "Printed in",

  "table.rows": ({ n }) => `${n} rows`,
  "table.rowsOf": ({ shown, all }) => `${shown} of ${all} rows`,
  "table.prev": "Previous",
  "table.next": "Next",
  "table.range": ({ from, to }) => `${from}–${to}`,
  "table.filterLabel": "Filter these rows",
  "table.filterHint": "Filter these rows…",
  "table.csv": "Download these rows (CSV)",

  "axis.clauses": "clauses",
  "axis.count": "count",
  "axis.notices": "notices",
  "axis.tenders": "tenders",
  "axis.shareOfNotices": "share of notices",
  "axis.shareOfTenders": "share of tenders",
  "axis.signedContracts": "signed contracts",

  /* What a chart says for itself: the fallback name of a quantity when a figure did not
     supply one, the reading printed between two funnel steps, the rows of a tooltip. */
  "chart.value": "value",
  "chart.count": "count",
  "chart.tenders": "tenders",
  "chart.fewerThanAbove": ({ n, share }) =>
    `${n} fewer than the step above (${share})`,
  "chart.shareOfFirst": "share of the first step",
  "chart.bandDefault": "the band the document recommends",
  "chart.dotsAt": ({ n, at }) => `${n} tenders at ${at} times`,
  "chart.capAndAbove": ({ n }) => `${n}× and above`,
  "chart.binRange": ({ from, to }) => `${from}–${to}×`,
  "chart.outsideBand": "outside the band",
  "chart.medianTimes": ({ n }) => `median ${n}×`,
  "chart.relation": "relation",
  "chart.pagePrints": "what the page prints",
  "chart.click": "click",
  "chart.recentre": "centre the picture on this one",
  "chart.andMore": ({ n }) => `and ${n} more, all of them in the table below`,
  "chart.egoAria": ({ name, links, kinds }) =>
    `${name}: ${links} links the documents print, in ${kinds} kinds`,

  /* ---- the top of the story ---- */

  "hero.kicker": "An investigation built only from the government's own published "
    + "documents",
  "hero.title": "Who was allowed to compete",
  "hero.standfirst": ({ documents, tenders, awards, money }) =>
    `${documents} notices and award letters published by Bangladesh's electronic `
    + "government procurement portal for Chattogram Development Authority work, read "
    + `end to end. They record ${tenders} tenders, ${awards} awards that print how many `
    + `firms took part, and ${money} of taka in signed contracts. They also record who `
    + "could enter each race before it started.",
  "hero.by": ({ name }) => `By ${name}`,
  "hero.sourced": "Reported from the documents in this folder and nothing else",
  "hero.built": ({ date }) => `Dataset built ${date}`,
  "hero.links": ({ links, events }) =>
    `${links} recorded links, ${events} dated events`,

  "hero.tile.docs": "PDFs read, every page of every one",
  "hero.tile.tenders": "tender notices",
  "hero.tile.criteria": "printed requirements to enter, each classified",
  "hero.tile.money": "taka in contracts signed",
  "hero.tile.firms": "firms named as winners",
  "hero.tile.oneResponsive": "awards where one bid remained standing",

  /* ---- the contents ----
     Every line of it opens something, so every line has a second line saying what it
     opens. A contents block that lists twenty titles and nothing else asks a reader to
     guess which one answers their question. */

  "toc.aria": "the map of this investigation",
  "toc.storyTitle": "The story, in order",
  "toc.checkTitle": "Then check it yourself",
  "toc.filesTitle": "Or open the files themselves",
  "toc.filesNote": "These four open in a new tab, straight out of this folder. The other "
    + "six are listed under the methodology, next to the scripts that wrote them.",

  "toc.summary": "What these documents show",
  "toc.summary.what": "The whole finding in five paragraphs, before any of the detail.",
  "toc.howToRead": "How to read this investigation",
  "toc.howToRead.what": "What the labels mean, and which links in the chain from rule to "
    + "money this folder actually holds.",
  "toc.rules": "One · The rules of the race",
  "toc.rules.what": "The fourteen rules this archive can be tested against, quoted from "
    + "the pages they are printed on.",
  "toc.clock": "Two · The clock",
  "toc.clock.what": "How long bidding stayed open, and how long bidders were asked to "
    + "hold their price.",
  "toc.amendments": "Three · What was rewritten",
  "toc.amendments.what": "What changed after publication — dates, fields, and the "
    + "conditions of entry themselves.",
  "toc.eligibility": "Four · Who was allowed to enter",
  "toc.eligibility.what": "Every printed condition of entry, measured against all the "
    + "others rather than against an opinion.",
  "toc.funnel": "Five · Where the bids dropped out",
  "toc.funnel.what": "Documents sold, bids received, bids set aside, contracts signed — "
    + "and the step nothing here explains.",
  "toc.chain": "Six · The rule of entry, against the result",
  "toc.chain.what": "Whether the stiffest conditions went with the thinnest fields. The "
    + "arithmetic, and why it settles nothing.",
  "toc.outcomes": "Seven · How the tenders ended",
  "toc.outcomes.what": "The status each notice prints, and whether an award notice in "
    + "this folder backs it up.",
  "toc.money": "Eight · The money",
  "toc.money.what": "Who was paid, how much, and how far the total is concentrated.",
  "toc.connections": "Nine · What connects the firms",
  "toc.connections.what": "Shared addresses and declared owners — and how little of "
    + "either the documents print.",
  "toc.signals": "Ten · What to look at, tender by tender",
  "toc.signals.what": "Ten observations re-run mechanically against every tender, with "
    + "the full ledger behind them.",

  "toc.search": "Search every word in the archive",
  "toc.search.what": "Exact, phrase, fuzzy, boolean, by field, by number range, by date.",
  "toc.entities": "Every name the archive prints",
  "toc.entities.what": "Firms, people, offices and districts, each with the documents "
    + "that name it.",
  "toc.network": "Follow one printed line at a time",
  "toc.network.what": "Only the links the documents state. Nothing here is inferred.",
  "toc.documents": "Open any document, page by page",
  "toc.documents.what": "The extracted text of every PDF, beside the PDF itself.",
  "toc.tables": "Every table, open to read",
  "toc.tables.what": "The CSVs the whole article is built from, sortable in the page.",
  "toc.downloads": "Take the whole dataset away",
  "toc.downloads.what": "Every file, with its size, so the work can be checked offline.",
  "toc.methodology": "How this was made",
  "toc.methodology.what": "The scripts, in the order they ran, and what each one "
    + "guarantees.",
  "toc.limits": "What this cannot tell you",
  "toc.limits.what": "Ten limits of the documents, stated before any conclusion is drawn.",

  /* ---- the ten files, wherever they are listed ---- */

  "file.tables": "The eighteen tables (CSV)",
  "file.tables.what": "One folder, one file per table, exactly as the pipeline wrote them.",
  "file.master": "The master dataset (CSV)",
  "file.master.what": "Every row of every table in one flat file.",
  "file.analysis": "Every calculation on this site (JSON)",
  "file.analysis.what": "Each figure with the arithmetic that produced it.",
  "file.audit": "The audit report (JSON)",
  "file.audit.what": "Every check the pipeline ran on itself, and which ones failed.",
  "file.matrix": "The evidence matrix (CSV)",
  "file.matrix.what": "One row per statement, with the file and page it rests on.",
  "file.qa": "The editor's QA report",
  "file.qa.what": "What an editor should check before publishing any of this.",
  "file.pages": "The extracted text, page by page",
  "file.pages.what": "What the parser actually read, mistakes left in.",
  "file.dictionary": "The data dictionary",
  "file.dictionary.what": "Every column of every table, and what fills it.",
  "file.pipeline": "The pipeline, documented",
  "file.pipeline.what": "The nine scripts, in order, and how to re-run them.",
  "file.searchRef": "The search reference",
  "file.searchRef.what": "Every operator the search box accepts, with examples.",

  /* ---- what the whole thing found ---- */

  "sum.kicker": "In short",
  "sum.title": "What these documents show",
  "sum.p1": ({ notices, contracts }) =>
    "A public tender is a race with the rules printed at the start. The notice says what "
    + "a firm must already have to enter — years of experience, a past contract of a "
    + "certain size, cash in the bank — and any firm that meets them may bid. This "
    + "archive lets those rules be read beside the result of the race, because the portal "
    + `published both: the ${notices} notices that set the conditions, and the `
    + `${contracts} award letters that say how it ended.`,
  "sum.p2": ({ criteria, common, unusual, strong, undetermined }) =>
    `The notices print ${criteria} separate conditions of entry. Measured against each `
    + `other, most are ordinary: ${common} ask for something at least a fifth of the `
    + `archive asks for. ${unusual} stand out on one measure. ${strong} either name a `
    + "brand, a model, an origin or a named manufacturer's authorisation, or stack two or "
    + `more such things together. And ${undetermined} state no requirement that can be `
    + "measured at all: they point at a document the portal does not publish, so what "
    + "they demanded cannot be read here by anyone, including the firms deciding whether "
    + "to bid.",
  "sum.p3": ({ sold, received, responsive, signed, aside }) =>
    `Where the awards print counts, ${sold} sets of tender documents were sold, `
    + `${received} bids arrived, ${responsive} were recorded as responsive, and ${signed} `
    + "contracts were signed. The largest single drop is between arriving and remaining: "
    + `${aside} bids were set aside. <b>No document in this archive gives a reason for `
    + "any of them.</b> Not one rejection letter, evaluation report or minute is in the "
    + "folder.",
  "sum.p4": ({ oneResponsive, oneBid }) =>
    `In ${oneResponsive} awards exactly one bid was left standing at the end. In `
    + `${oneBid} only one ever arrived. Both are outcomes a procurement system is allowed `
    + "to reach; the documents record that they were reached, and do not record why.",
  "sum.p5": ({ withSignal, rows, kinds, four }) =>
    "This site does not conclude that any tender was steered, and the documents do not "
    + "establish it. What it does is put the rule of entry, the number of bidders, the "
    + "number that survived and the money next to each other for every tender, with the "
    + "page of the PDF each figure was read from, and mark the places where the record "
    + `contradicts itself or stops short. ${withSignal} of the ${rows} tenders carry at `
    + `least one of ${kinds} such observations; ${four} carry four or more.`,
  "sum.note": "Every figure in this paragraph is linked to its source further down the "
    + "page. Nothing on this site is asserted without the document it came from.",

  /* ---- the reader's instructions ---- */

  "htr.kicker": "Before you start",
  "htr.title": "How to read this investigation",
  "htr.labelsIntro": "Four labels are used on every statement, and they mean exactly "
    + "what they say:",
  "htr.eligIntro": "The conditions of entry carry a second set of labels. These are "
    + "descriptions of how a clause compares with the rest of this archive, and nothing "
    + "more. <b>An unusual requirement is not evidence of wrongdoing.</b> A big project "
    + "needs a big contractor, and the documents rarely say which case they are:",
  "htr.chainIntro": "An investigation is only as good as the parts of the story its "
    + "documents reach. This is the chain from rule to money, and what this folder holds "
    + "of it:",
  "htr.outro": "Every number on this site carries the file it came from and the page it "
    + "was printed on. Clicking one opens that PDF at that page in your own browser. "
    + "Where a page could not be read cleanly, the text is shown exactly as the parser "
    + "saw it rather than tidied, so you can see what it had to work with.",

  /* ---- why some words are not translated ----
     This key exists because of the Bangla edition, and the namespace says so. It prints
     in both, because the claim it makes is about the evidence rather than about a
     language: a string that came off a page is copied, never rewritten. In English that
     is worth one sentence; in Bangla it is what explains why so much of the page is in
     the other script, and bn.js adds a second sentence there about the digits. */
  "bn.note.words": "<b>Every name, number and status on this page is printed the way "
    + "the document prints it.</b> A firm's name, a tender number, a PDF filename, the "
    + "status a notice carries, the wording of a quoted clause, the name of a field in "
    + "the portal's own form: those are the evidence, so they are copied and never "
    + "rewritten — including into the other edition of this page. A reader checking a "
    + "figure against page 3 of a PDF has to find the same characters here as there.",

  "htr.state.here": "in the archive",
  "htr.state.caveat": "in the archive, with a caveat",
  "htr.state.counts": "counts only",
  "htr.state.partly": "partly in the archive",
  "htr.state.absent": "not in the archive",

  "htr.step.rules": "The rules",
  "htr.detail.rules": ({ refs, quoted }) =>
    `${refs} reference documents, ${quoted} rules quoted from them. The standard tender `
    + "document among them is marked on its own first page as a preliminary working "
    + "draft, and no notice says which standard document it was written from.",
  "htr.step.entry": "Who could enter",
  "htr.detail.entry": ({ criteria, deferred }) =>
    `${criteria} conditions printed across the notices, each one classified and each one `
    + `linked to its page. A further ${deferred} clauses point at a document the portal `
    + "does not publish.",
  "htr.step.entered": "Who entered",
  "htr.detail.entered": ({ awards, bidderDocs }) =>
    `${awards} awards print how many bids arrived. ${bidderDocs} documents in this folder `
    + "name a losing bidder, so who entered a tender cannot be known from this archive — "
    + "only how many.",
  "htr.step.responsive": "Who stayed responsive",
  "htr.detail.responsive": "the same awards print a responsive count. Which bids they "
    + "were is not printed.",

  "htr.step.rejected": "Who was rejected, and why",
  "htr.detail.rejected": "no rejection letter, no evaluation report, no committee minute, "
    + "no reason for a single bid being set aside. This is the largest hole in the record "
    + "and no amount of analysis can fill it.",
  "htr.step.evaluated": "How bids were evaluated",
  "htr.detail.evaluated": "no score, no comparison sheet, no evaluation criteria beyond "
    + "the conditions of entry printed in the notice.",
  "htr.step.won": "Who won",
  "htr.detail.won": ({ contracts }) =>
    `${contracts} award notices naming a winner, a value and a date.`,
  "htr.step.money": "How much money",
  "htr.detail.money": ({ money, noValue }) =>
    `${money} of taka across those awards; ${noValue} of them print no value.`,
  "htr.step.connect": "Which entities connect",
  "htr.detail.connect": ({ withOwner, firms, addresses }) =>
    `${withOwner} of ${firms} firms declare an owner. ${addresses} printed addresses are `
    + "shared by more than one firm. Everything else about who owns what is absent.",

  /* ---- chapter one: the rules ---- */

  "ch1.kicker": "Chapter one",
  "ch1.title": "The rules of the race",
  "ch1.p1": ({ refs, pages }) =>
    "Before any tender in this archive opened, the procedure it was meant to follow was "
    + `already written down. The folder holds ${refs} documents that state it, ${pages} `
    + "pages in all. They are the only statements of procedure here, and this "
    + "investigation quotes them rather than describing them.",
  "ch1.p2": ({ quoted }) =>
    `${quoted} of those rules can be checked against the notices — they put a number on `
    + "something the notices also print: how long bidding must stay open, how long a "
    + "tender security must last, how much cash a firm may be asked to hold, how big a "
    + "past contract may be demanded, when a price is too low to accept. Each one below "
    + "opens the page it is printed on.",
  "ch1.fig.title": "The fourteen rules this investigation can test, and where they are "
    + "printed",
  "ch1.fig.note": "Every row opens the PDF at that page. The wording is quoted, not "
    + "paraphrased; where a page is set in two columns the extracted line can carry a "
    + "heading from the margin, and it is left in.",
  "ch1.col.rule": "Rule",
  "ch1.col.decides": "What it decides",
  "ch1.readAll": "Read all fourteen rules exactly as they are printed",
  "ch1.p3": "Two of the rules matter more than the rest for what follows, because they "
    + "are the only two that put a recommended <i>size</i> on a condition of entry — how "
    + "much cash a firm may be asked to have, and how big a past contract it may be asked "
    + "to have finished. Those two are measured against the notices in "
    + "<a href=\"#chain\">chapter six</a>.",
  "ch1.minFound": "One more question has an answer that is not in the folder: how many "
    + "firms must bid before a tender may proceed. The phrase below is the closest the "
    + "reference documents come, and it is about a different situation.",
  "ch1.minAbsent": "One more question has no answer in the folder at all: how many firms "
    + "must bid before a tender may proceed. No page in the reference documents states a "
    + "minimum.",

  /* ---- chapter two: the clock ---- */

  "ch2.kicker": "Chapter two",
  "ch2.title": "The clock",
  "ch2.p1": "The first thing a notice fixes is time. A firm that hears about a tender "
    + "late, or that needs three weeks to assemble a bid and is given two, is out of the "
    + "race without anyone rejecting it.",
  "ch2.p2": ({ median, n, q1, q3, min, max }) =>
    `The typical tender in this archive was open for ${median} days. Half of the ${n} `
    + `that print both dates fall between ${q1} and ${q3} days; the shortest was ${min} `
    + `days and the longest ${max}. Nothing in the folder sets a minimum for a national `
    + "tender, so these numbers can be compared with each other but not measured against "
    + "a rule.",
  "ch2.p3": ({ cleared, short }) =>
    "One rule can be re-run from end to end. The reference documents say the tender "
    + "security must stay valid for a stretch beyond the closing date; every one of the "
    + `${cleared} notices that print both dates clears it, and ${short} fall short.`,
  "ch2.fig1.title": "How long bidding stayed open, by what was being bought",
  "ch2.fig1.note": "Median days between the published date and closing. The three natures "
    + "of procurement are the ones the notices themselves print.",
  "ch2.fig1.source": ({ file }) =>
    `Read from the tender notices; the underlying dates are in ${file}.`,
  "ch2.axis.medianDays": "median days",
  "ch2.days": ({ n }) => `${n} days`,
  "ch2.natureNote": ({ n }) => `${n} tenders`,
  "ch2.col.nature": "Nature of procurement",
  "ch2.col.medianOpen": "Median days open",
  "ch2.fig2.title": "How long each tender asked its bidders to hold their price",
  "ch2.fig2.note": ({ vlo, vhi, above }) =>
    `The standard tender document calls ${vlo} to ${vhi} days normal for a national `
    + `tender. ${above} notices print longer, and no authorisation for the longer period `
    + "is printed with them.",
  "ch2.legend.inside": ({ vlo, vhi }) => `inside the ${vlo}–${vhi} day band`,
  "ch2.legend.above": "longer than the band",
  "ch2.fig2.prefix": "validity",
  "ch2.fig2.axis": "days of tender validity, as printed",
  "ch2.col.validityDays": "Days of validity",
  "ch2.col.againstBand": "Against the band",
  "ch2.note.above": ({ vlo, vhi }) =>
    `longer than the ${vlo}–${vhi} day band the folder calls normal`,
  "ch2.note.inside": ({ vlo, vhi }) => `inside the ${vlo}–${vhi} day band`,

  /* ---- chapter three: the amendments ---- */

  "ch3.kicker": "Chapter three",
  "ch3.title": "What was rewritten after the starting gun",
  "ch3.p1": ({ amended, notices, withTable, lines, unmoved }) =>
    `${amended} of the ${notices} notices were amended after publication, and ${withTable} `
    + "of those print a table of what changed: the old value in one column, the new value "
    + `in the next. ${lines} lines are printed across them. ${unmoved} of those lines `
    + "print the same value twice, so the field was listed as amended without its value "
    + "moving.",
  "ch3.p2": ({ changes, earlier, tenders, gained, first, after, grounds }) =>
    `Every one of the ${changes} date changes moves the date later. ${earlier} move it `
    + `earlier. For the ${tenders} tenders whose closing date moved, the median tender `
    + `gained ${gained} days; a bidding window that was ${first} days as first published `
    + `became ${after} days. Extending a deadline is ordinary and is usually done because `
    + `bidders asked for more time — but ${grounds}.`,
  "ch3.noGrounds": "no amendment in this archive prints a reason",
  "ch3.someGrounds": ({ n, amended }) =>
    `only ${n} of the ${amended} amended notices print any reason at all`,
  "ch3.fig1.title": "When a date moved, how far it moved",
  "ch3.fig1.note": "The median move and the longest single move, for each date the change "
    + "tables list. One axis, in days; the four dates are the ones the portal's own "
    + "amendment form names.",
  "ch3.legend.median": "median move",
  "ch3.legend.longest": "longest single move",
  "ch3.axis.medianMove": "median move (days)",
  "ch3.axis.longestMove": "longest move (days)",
  "ch3.dateNote": ({ n }) => `${n} changes, all of them later`,
  "ch3.col.date": "Date",
  "ch3.col.changes": "Changes",
  "ch3.col.later": "Moved later",
  "ch3.col.earlier": "Moved earlier",
  "ch3.col.medianDays": "Median days",
  "ch3.col.longest": "Longest move",
  "ch3.fig2.title": "Which parts of a notice were listed as amended, and how often the "
    + "value really changed",
  "ch3.fig2.note": ({ fields }) =>
    `The twelve most-listed fields of ${fields}. The gap between the two markers is the `
    + "number of lines that print the same value in the old column and the new one.",
  "ch3.legend.reallyChanged": "value really changed",
  "ch3.legend.listed": "listed in a change table",
  "ch3.axis.reallyChanged": "value really changed",
  "ch3.axis.timesListed": "times listed",
  "ch3.allReal": "every listing was a real change",
  "ch3.someUnmoved": ({ n }) => `${n} listed with the same value on both sides`,
  "ch3.col.field": "Field",
  "ch3.col.timesListed": "Times listed",
  "ch3.col.reallyChanged": "Value really changed",

  "ch3.pair": ({ n, kind }) => `${n} ${kind}`,
  "ch3.p3": ({ tenders, pairs }) =>
    `${tenders} tenders had a condition of entry rewritten after the notice was `
    + `published: ${pairs}. A rewritten condition of entry is worth reading in full, `
    + "because it changes who is allowed to bid after some firms have already decided not "
    + "to. The table below prints the money figure on both sides of every such change and "
    + "opens the page.",
  "ch3.fig3.title": "Every money threshold an amendment moved, old figure beside new",
  "ch3.fig3.note": "Read straight from the change tables. Where the printed scale word is "
    + "not one the parser recognises, the sums are left unread and the row says so rather "
    + "than guessing which was meant.",
  "ch3.col.was": "Was",
  "ch3.col.now": "Now",
  "ch3.col.direction": "Direction",
  "ch3.col.times": "Times",
  "ch3.unreadable": "cannot be read",
  "ch3.col.read": "What could be read",

  /* ---- chapter four: the conditions of entry ---- */

  "ch4.kicker": "Chapter four",
  "ch4.title": "Who was allowed to enter",
  "ch4.p1": ({ clauses }) =>
    "This is the part of a tender that decides the field before a single price is opened. "
    + "Each notice prints its conditions of entry as numbered clauses, and this archive "
    + `holds ${clauses} of them.`,
  "ch4.p2": ({ clauses, years, contracts, turnover, liquid }) =>
    "Reading them one at a time tells you very little. Reading all of them against each "
    + "other tells you which demands are the archive's normal and which are not. That is "
    + `all the labels below do: they compare a clause with the other ${clauses}. A clause `
    + "is marked UNUSUAL when one thing about it sits outside nine in ten of its peers — "
    + `more than ${years} years of experience, more than ${contracts} past contracts, a `
    + `turnover demand above ${turnover} or a cash demand above ${liquid}.`,
  "ch4.p3": "<b>None of these labels is an allegation.</b> A large, complex job needs a "
    + "capable contractor, and a demand that looks steep in the abstract may be exactly "
    + "right for the work. The labels mark where to look, not what was found.",
  "ch4.p4": ({ undetermined }) =>
    `The largest group is the one that cannot be measured at all. ${undetermined} clauses `
    + "state no requirement a reader can check: they refer the bidder to the tender "
    + "document, which this portal does not publish. For those tenders the condition of "
    + "entry is, to the public and to this investigation, unknown.",
  "ch4.fig1.title": ({ clauses }) =>
    `How the ${clauses} printed conditions of entry compare with each other`,
  "ch4.fig1.note": "Darker is further from the archive's own normal. Hover or focus any "
    + "bar for the rule that put a clause in that group.",
  "ch4.col.meaning": "What the label means",

  "ch4.fig2.title": "What the notices ask for, and how often",
  "ch4.fig2.note": "Share of the tender notices that print at least one clause of each "
    + "kind. A notice usually prints several kinds, so these do not add to 100.",
  "ch4.shareNote": "share of the notices that print a clause of this kind",
  "ch4.col.kind": "Kind of requirement",
  "ch4.col.sharePct": "Share of notices (%)",
  "ch4.readAll": ({ n }) => `Read all ${n} conditions of entry, one clause per row`,
  "ch4.loading": "Reading the clauses",
  "ch4.col.asksAbout": "Asks about",
  "ch4.col.moneyPrinted": "Money as printed",
  "ch4.col.clause": "The clause, as printed",
  "ch4.col.whyLabel": "Why this label",
  "ch4.tableCaption": "Filter by tender number, by label, or by any word in the clause.",

  /* ---- chapter five: the funnel ---- */

  "ch5.kicker": "Chapter five",
  "ch5.title": "Where the bids dropped out",
  "ch5.p1": ({ withCounts, withoutCounts }) =>
    "Now the race itself. An award notice in this archive prints three counts and no "
    + "names: how many sets of documents were sold, how many bids arrived, and how many "
    + "were responsive. Responsive means the bid was complete and conforming enough to be "
    + `considered. ${withCounts} awards print these counts; ${withoutCounts} print none.`,
  "ch5.p2": ({ sold, received, noBid, responsive, aside, signed }) =>
    `Read together they make a funnel. ${sold} sets of documents were bought. ${received} `
    + `bids came back — ${noBid} firms bought the papers and did not bid. ${responsive} `
    + `bids were recorded responsive, so ${aside} were set aside. ${signed} contracts were `
    + "signed.",
  "ch5.p3": ({ aside }) =>
    "<b>The middle step is the one to look at, and it is the one the archive cannot "
    + `explain.</b> ${aside} bids were set aside and not a single document in this folder `
    + "gives a reason for any of them. A bid can be set aside for entirely proper reasons "
    + "— a missing signature, an expired licence, an arithmetic error in the price "
    + "schedule. The point is not that the reasons are bad. The point is that they are not "
    + "published, so nobody outside the evaluation room can tell a proper reason from an "
    + "improper one.",
  "ch5.p4": ({ oneResponsive, oneBid }) =>
    `In ${oneResponsive} of those awards exactly one bid was left standing. In ${oneBid} `
    + "only one bid ever arrived, which is a different situation with a different "
    + "explanation, and the two are counted separately here.",
  "ch5.stage.sold": "sets of tender documents sold",
  "ch5.stage.soldNote": "a firm that buys the documents has declared an interest in bidding",
  "ch5.stage.received": "bids received",
  "ch5.stage.receivedNote": "as counted on the award notices themselves",
  "ch5.stage.responsive": "bids recorded responsive",
  "ch5.stage.responsiveNote": "the count the award notice prints; which bids they were is "
    + "not printed",
  "ch5.stage.signed": "contracts signed",
  "ch5.stage.signedNote": "one contract per award notice that prints a count",

  "ch5.fig1.title": "From interest to contract, across every award that prints its counts",
  "ch5.fig1.note": "Bars against a common baseline rather than a tapering ribbon, so each "
    + "step can be read as a number. The label above each bar is how many were lost at "
    + "that step.",
  "ch5.fig1.source": ({ file }) =>
    `Counted from the award notices; every count is in ${file} with the page it was read `
    + "from.",
  "ch5.col.step": "Step",
  "ch5.col.stepMeans": "What the step means",
  "ch5.fig2.title": "How many bids were set aside in a single tender",
  "ch5.fig2.note": ({ worst }) =>
    `Each bar is a number of tenders. The far right of the axis is a single tender in `
    + `which ${worst} bids arrived and were not recorded responsive, the most in the `
    + "archive; no document in the folder says why any of them was set aside.",
  "ch5.fig2.prefix": "bids set aside:",
  "ch5.fig2.axis": "bids that arrived and were not recorded responsive",
  "ch5.aside.none": "every bid that arrived was recorded responsive",
  "ch5.aside.one": ({ n }) =>
    `${n} bid arrived and was not recorded responsive`,
  "ch5.aside.many": ({ n }) =>
    `${n} bids arrived and were not recorded responsive`,
  "ch5.col.setAside": "Bids set aside",
  "ch5.col.reading": "Reading",

  /* ---- chapter six: the rule of entry against the result ---- */

  "ch6.kicker": "Chapter six",
  "ch6.title": "The rule of entry, against the result",
  "ch6.p1": ({ tenders }) =>
    "Chapter four showed which conditions of entry stand out. Chapter five showed where "
    + `bids disappeared. This chapter puts them side by side for the ${tenders} tenders `
    + "that have both: a printed condition of entry and printed counts of who bid.",
  "ch6.p2": "If a stiff condition of entry thinned the field, tenders with the stiffest "
    + "clauses should show fewer bidders and more bids set aside. In this archive they do "
    + "lean that way — and <b>the lean is not large enough to be distinguished from chance "
    + "at this sample size.</b> Both tests are printed below with their p-values so a "
    + "reader can see exactly how weak the signal is.",
  "ch6.p3": ({ dropped, one, strongOf }) =>
    `Whether at least one bid was set aside: ${dropped}. Whether exactly one bid remained `
    + `responsive: ${one}. Neither reaches the conventional threshold. The `
    + `strongest-clause group holds only ${strongOf} tenders, which is too few to settle `
    + "the question either way. <b>This investigation does not claim that unusual "
    + "conditions of entry reduced competition in this archive.</b> It claims that the "
    + "archive cannot answer the question, and shows the arithmetic.",
  "ch6.test": ({ strong, strongOf, strongShare, other, otherOf, otherShare, p }) =>
    `${strong} of ${strongOf} (${strongShare}) against ${other} of ${otherOf} `
    + `(${otherShare}), p = ${p}`,

  "ch6.fig1.title": "Bids that arrived and bids that survived, grouped by the strongest "
    + "condition of entry in the notice",
  "ch6.fig1.note": "Median counts per tender. One axis, in bids. The gap between the "
    + "markers is the median number of bids set aside in that group.",
  "ch6.legend.responsive": "median bids recorded responsive",
  "ch6.legend.received": "median bids received",
  "ch6.axis.medianResponsive": "median responsive",
  "ch6.axis.medianReceived": "median received",
  "ch6.rowNote": ({ n, share }) => `${n} tenders; one responsive in ${share}`,
  "ch6.groupNote": ({ n }) => `${n} tenders carry this as their strongest clause`,
  "ch6.col.strongestInNotice": "Strongest clause in the notice",
  "ch6.col.medianReceived": "Median received",
  "ch6.col.medianResponsive": "Median responsive",
  "ch6.col.oneResponsivePct": "One responsive (%)",
  "ch6.col.someoneAsidePct": "Someone set aside (%)",
  "ch6.col.strongest": "Strongest clause",
  "ch6.col.groupSize": "Group size",
  "ch6.fig2.title": "Share of tenders that ended with exactly one responsive bid",
  "ch6.fig2.note": ({ tenders, labelled }) =>
    `Across all ${tenders} tenders with counts, ${labelled} could be grouped by their `
    + "strongest clause. The differences between these bars are within the range chance "
    + "produces at these group sizes.",
  "ch6.p4": ({ clauses, notices }) =>
    `${clauses} clauses print a money figure this pipeline cannot resolve into a number, `
    + `across ${notices} notices — a scale word that is not a scale word, a figure with no `
    + "unit, a number split across a line break. They are excluded from every ratio above "
    + "and listed in the methodology rather than guessed at.",

  "ch6.band.intro": ({ low, high }) =>
    "The standard tender document in this folder recommends a size for this requirement: "
    + `between ${low} and ${high} of the estimated cost of the work. The estimate is not `
    + "published, so the contract value that was actually signed is used in its place — a "
    + "substitute, and a reader should hold it as one: a contract signed below the estimate "
    + "makes the ratio look higher than the drafters meant, and a contract signed above it "
    + "makes the ratio look lower.",
  "ch6.band.numbers": ({ tenders, median, within, above, aboveShare, max }) =>
    `${tenders} tenders print both the demand and a signed value. The median demanded `
    + `${median}× the contract value. ${within} sit inside the recommended band; ${above} `
    + `(${aboveShare}) sit above it, the highest at ${max}×.`,
  "ch6.band.figTitle": ({ reads }) =>
    `${reads}: what each tender demanded, against the contract it signed`,
  "ch6.band.figNote": ({ beyond }) =>
    "One dot per tender, stacked where dots would overlap. The shaded strip is the band "
    + "the standard tender document recommends. Dots to the right of it demanded more than "
    + `recommended; the axis stops at 2× and the ${beyond} tenders beyond it are stacked in `
    + "the last column.",
  "ch6.band.figSource": "Demands read from the eligibility clauses; contract values from "
    + "the award notices. The five highest open their pages below.",
  "ch6.band.stripLabel": ({ low, high }) =>
    `the band the folder recommends (${low}–${high})`,
  "ch6.band.tableCaption": "The five tenders that demanded the most, relative to the "
    + "contract signed.",
  "ch6.col.demanded": "Demanded",
  "ch6.col.contractSigned": "Contract signed",
  "ch6.col.timesContract": "Times the contract value",

  /* ---- chapter seven: how the tenders ended ---- */
  "ch7.kicker": "Chapter seven",
  "ch7.title": "How the tenders ended",
  "ch7.p1": ({ notices, awards }) =>
    `Each notice carries a status. ${notices} notices print one, and the archive holds `
    + `${awards} award notices to check them against.`,
  "ch7.p2": ({ orphans }) =>
    `${orphans} notices say a contract was awarded and no award notice for them is in this `
    + "folder. That is a gap in what was collected, or a gap in what was published; from "
    + "inside the archive the two cannot be told apart. One award notice runs the other "
    + "way: it names a tender whose notice is not here at all.",
  "ch7.p3": ({ ended }) =>
    `${ended} tenders ended without a contract — re-tendered, cancelled, rejected, or `
    + "still being processed. The documents give no reason for any of these outcomes either.",
  "ch7.fig.title": "The status each notice prints, and whether an award notice backs it up",
  "ch7.fig.note": "Hover or focus a bar for how many tenders in that status have an award "
    + "notice in this archive.",
  "ch7.col.statusPrinted": "Status as printed",
  "ch7.col.withAward": "With an award notice here",
  "ch7.col.sharePct": "Share (%)",
  "ch7.noStatus": "no status printed",
  "ch7.someBacked": ({ n, share }) =>
    `${n} have an award notice in this archive (${share})`,
  "ch7.noneBacked": "no award notice in this archive for any of them",

  /* ---- chapter eight: the money ----
     Two shapes of the same paragraph, because "1 firm accounts" and "3 firms account"
     are different sentences and a language pack is the right place for that, not a
     pluralisation rule buried in the renderer. */
  "ch8.kicker": "Chapter eight",
  "ch8.title": "The money, and who received it",
  "ch8.p1": ({ firms, money, exact }) =>
    `${firms} firms are named as winners across this archive, and the awards total `
    + `${money} of taka — ${exact} as the notices print it.`,
  "ch8.p2.one": ({ half, repeat, acrossEntities }) =>
    `${half} firm accounts for half of that money. ${repeat} firms won more than one `
    + `contract, and ${acrossEntities} won work from more than one procuring entity. `
    + "Concentration on its own says nothing about how it came about: there may be very "
    + "few firms in Bangladesh able to build a fourteen-storey structure, and the same few "
    + "will win that work wherever it is tendered.",
  "ch8.p2.many": ({ half, repeat, acrossEntities }) =>
    `${half} firms account for half of that money. ${repeat} firms won more than one `
    + `contract, and ${acrossEntities} won work from more than one procuring entity. `
    + "Concentration on its own says nothing about how it came about: there may be very "
    + "few firms in Bangladesh able to build a fourteen-storey structure, and the same few "
    + "will win that work wherever it is tendered.",
  "ch8.p3": "The names below are printed in the government's own award notices. They are "
    + "reproduced exactly as printed, including the joint-venture partner shares, because "
    + "the printed string is what can be checked against the page.",
  "ch8.fig.title": "The ten firms with the largest total of signed contracts",
  "ch8.fig.note": "Names are shortened here to fit the axis and printed in full in the "
    + "table below. Hover or focus a bar for the full printed name and the exact sum.",
  "ch8.fig.source": ({ file }) =>
    `Read from the award notices; every row is in ${file} with the tenders it came from.`,
  "ch8.barNote.one": ({ name, n, taka }) => `${name} — ${n} contract, ${taka}`,
  "ch8.barNote.many": ({ name, n, taka }) => `${name} — ${n} contracts, ${taka}`,
  "ch8.col.firm": "Firm, exactly as printed",
  "ch8.col.totalSigned": "Total signed",
  "ch8.tableCaption": "The joint ventures are printed with their partner shares, as the "
    + "award notices print them.",

  /* ---- chapter nine: the connections ---- */
  "ch9.kicker": "Chapter nine",
  "ch9.title": "What connects the firms",
  "ch9.p1.one": ({ withOwner, firms, people, multi }) =>
    "Procurement investigations usually turn on ownership: the same person behind two "
    + "firms that bid against each other, a director who also sits on the buying side. "
    + "<b>This archive cannot support that kind of finding, and it is important to say so "
    + `plainly.</b> Only ${withOwner} of the ${firms} firms declare an owner anywhere in `
    + `these documents. ${people} people are named as owners, and ${multi} of them is named `
    + "as the owner of more than one firm. There is no company register in this folder, so "
    + "for the other firms ownership is simply not in evidence.",
  "ch9.p1.many": ({ withOwner, firms, people, multi }) =>
    "Procurement investigations usually turn on ownership: the same person behind two "
    + "firms that bid against each other, a director who also sits on the buying side. "
    + "<b>This archive cannot support that kind of finding, and it is important to say so "
    + `plainly.</b> Only ${withOwner} of the ${firms} firms declare an owner anywhere in `
    + `these documents. ${people} people are named as owners, and ${multi} of them are `
    + "named as the owner of more than one firm. There is no company register in this "
    + "folder, so for the other firms ownership is simply not in evidence.",
  "ch9.p2": ({ addresses }) =>
    `What the documents do print is addresses. ${addresses} addresses are printed for more `
    + "than one named firm. A shared address is a question, not an answer: firms share "
    + "buildings, agents and accountants, and a joint venture naturally prints one address "
    + "for both partners. Each group below is marked for whether a joint venture explains "
    + "it.",
  "ch9.p3": ({ pairs, merged }) =>
    `A further caution about names. ${pairs} pairs of firm names in this archive resemble `
    + "each other closely enough that they might be the same firm spelled two ways. "
    + `${merged} of them were merged. Merging names on resemblance would invent `
    + "relationships that the documents do not state, so every printed name is kept as its "
    + "own record and the resembling pairs are published as a table for a reader to judge.",
  "ch9.groupsTitle": "The addresses printed for more than one firm",
  "ch9.jvYes": "a joint venture accounts for this grouping",
  "ch9.jvNo": "no joint venture printed among these firms",

  /* ---- chapter ten: the per-tender ledger ---- */
  "ch10.kicker": "Chapter ten",
  "ch10.title": "What to look at, tender by tender",
  "ch10.p1": ({ kinds, rows }) =>
    "Everything above is the archive in aggregate. An editor works the other way round, "
    + `one tender at a time, and needs to know which ones repay the effort. ${kinds} of the `
    + "observations in this investigation can be checked mechanically against every tender, "
    + `and the ledger below records which of them apply to each of the ${rows} tenders.`,
  "ch10.p2": "<b>These are questions to ask, not findings.</b> Every one of them has an "
    + "innocent explanation available, and for most tenders the innocent explanation is "
    + "almost certainly the right one. A tender carrying three or four of them is not "
    + "thereby suspect; it is simply the one an editor should open first, because there is "
    + "more in the record to check.",
  "ch10.p3": ({ withAny, none }) =>
    `${withAny} tenders carry at least one. ${none} carry none.`,
  "ch10.fig1.title": "How often each observation applies",
  "ch10.fig1.note": "Each bar is a count of tenders. Hover or focus a bar for the exact "
    + "test that was applied.",
  "ch10.fig2.title": ({ of }) => `How many of the ${of} apply to a single tender`,
  "ch10.fig2.prefix": "carrying",
  "ch10.fig2.axis": "observations that apply to one tender",
  "ch10.dist.none": "nothing on this list applies to these tenders",
  "ch10.dist.some": ({ n, of }) => `${n} of the ${of} observations apply`,
  "ch10.col.code": "Code",
  "ch10.col.observation": "Observation",
  "ch10.col.theTest": "The test, exactly",
  "ch10.col.howMany": "Observations that apply",
  "ch10.col.observations": "Observations",
  "ch10.col.whichOnes": "Which ones",
  "ch10.col.strongestClause": "Strongest clause",
  "ch10.col.daysOpen": "Days open",
  "ch10.col.notice": "Notice",
  "ch10.nonePrinted": "none printed",
  "ch10.notHere": "not in this archive",
  "ch10.openLedger": ({ n }) => `Open the ledger: all ${n} tenders, one row each`,
  "ch10.loading": "Reading the ledger",
  "ch10.tableCaption": "Filter by tender number, district, procuring entity, status or "
    + "observation code. Sort by the observation count to bring the fullest records to the "
    + "top.",

  /* ---- how it was made ----
     The stage bodies are written as continuations of the filename printed before them,
     so each line reads "01_inventory.py walks the project folder…". Bengali puts its
     verb last, and bn.js writes the same eight lines as whole sentences instead. */
  "meth.kicker": "Behind the work",
  "meth.title": "How this was made",
  "meth.p1": "Every number on this site was produced by a script in "
    + "<span class=\"mono\">investigation/parser/</span>, run over the PDFs in this folder "
    + "and nothing else. No external dataset, no register, no news report and no prior "
    + "knowledge has been used, and there is no hand-entered statistic anywhere in the "
    + "site: each figure is read out of the pipeline's own output when the page loads, so a "
    + "change upstream changes the sentence.",
  "meth.p2": ({ seconds, documents, tables, rows, links, events }) =>
    `The tables were rebuilt in ${seconds} seconds from ${documents} documents into `
    + `${tables} CSVs, ${rows} rows of master dataset, ${links} recorded links and `
    + `${events} dated events.`,
  "meth.stage.inventory": "walks the project folder and lists every PDF in it, with its "
    + "size and checksum, before anything is read. A document that cannot be opened is "
    + "recorded as unreadable rather than dropped.",
  "meth.stage.extract": "reads every page of every PDF twice, with two different "
    + "extractors, and records whether the two agree. Where a page is laid out in columns "
    + "the change table is read by word coordinates instead of linearly.",
  "meth.stage.dataset": "turns the extracted text into the eighteen tables, keeping the "
    + "original printed string beside every value it normalises.",
  "meth.stage.audit": ({ checks, failed, cells }) =>
    `re-checks the tables against the extracted text: ${checks} checks, ${failed} of them `
    + `failing. It also compares ${cells} award cells against an earlier independent parser `
    + "of the same PDFs.",

  "meth.stage.analysis": "does every calculation on this site and writes them, with the "
    + "arithmetic printed beside each one, to analysis.json.",
  "meth.stage.evidence": "walks back from every finding to the page it rests on and reads "
    + "the value off that page again, to catch a number that drifted between stages.",
  "meth.stage.search": "builds the search index and the per-document page files.",
  "meth.stage.split": "lifts the two long row lists out of analysis.json so opening the "
    + "article does not download them.",
  "meth.p3": ({ applied, rules, logged, ruleList }) =>
    `<b>Normalising without losing the original.</b> ${applied} values were normalised `
    + `under ${rules} rules, and ${logged} of them are logged individually with the original `
    + `string, the new value, the rule and the page. The rules are ${ruleList}. Nothing is `
    + "normalised silently.",
  "meth.p4": ({ pairs, merged }) =>
    `<b>Names were not merged on resemblance.</b> ${pairs} pairs of names in this archive `
    + `look alike; ${merged} were merged. Two firms with similar names may be one firm or `
    + "two, and this folder holds no register that could settle it. The pairs are published "
    + "as a table so a reader with better information can judge them.",
  "meth.p5": ({ spellings, offices }) =>
    `<b>Place names likewise.</b> The documents print ${spellings} district spellings, and `
    + `${offices} offices print more than one spelling for their own district. None has been `
    + "merged, for the same reason: the only evidence permitted here is the archive, and the "
    + "archive prints both.",
  "meth.p6": "<b>Where two extractors disagreed</b> the disagreement is recorded on the "
    + "document's own row rather than resolved by preference, and the document browser "
    + "prints it. Every page of extracted text is published exactly as the parser read it, "
    + "mistakes and all, so a reader can see what the numbers were read from.",
  "meth.p7": ({ columns }) =>
    "<b>Blank cells are explained, not left blank.</b> The audit records a reason for every "
    + `column that has any empty cell — ${columns} columns across the eighteen tables — so `
    + "an empty cell can be told from a missing document.",
  "meth.readNotes": "Read the audit's own notes, exactly as it wrote them",

  /* The way from the methodology into the things it describes. A reader who has just been
     told how a number was made wants to open the tool that made it, not scroll back up. */
  "meth.toolsAria": "the tools and the files this investigation was built from",
  "meth.toolsTitle": "Check any of it yourself",
  "meth.filesTitle": "Open the files the scripts wrote",
  "meth.filesNote": "Every one of these opens in a new tab, straight out of this folder. "
    + "Nothing on this page has to be taken on trust: the CSVs are the same ones the "
    + "article reads, and the PDFs they were read from sit beside them.",

  /* ---- what this cannot tell you ----
     Ten limits, each a heading and a paragraph. Every entry receives the same bag of
     numbers whether it uses them or not, so a translator can move a figure from the
     paragraph into the heading, or out of it, without touching the renderer. */
  "lim.kicker": "The honest part",
  "lim.title": "What this investigation cannot tell you",
  "lim.intro": "Every one of these is a limit of the documents, not of the analysis. They "
    + "are listed first-class rather than in a footnote because an editor needs them before "
    + "deciding what can be published.",
  "lim.reasons.head": "No document says why any bid was set aside.",
  "lim.reasons.detail": ({ aside }) =>
    `${aside} bids were set aside across this archive and the folder holds no rejection `
    + "letter, no evaluation report and no committee minute. Any statement about why a bid "
    + "failed would be invention.",
  "lim.losers.head": "Losing bidders are not named.",
  "lim.losers.detail": ({ bidderDocs }) =>
    `${bidderDocs} documents here name a firm that bid and did not win. Who competed for a `
    + "tender cannot be established from this archive — only how many did.",
  "lim.estimate.head": "The estimate is not published.",
  "lim.estimate.detail": "Two rules in the folder size a requirement against the estimated "
    + "cost of the work. No notice prints that estimate, so the contract value signed is "
    + "used in its place throughout. Every ratio on this site inherits that substitution.",
  "lim.draft.head": "The standard tender document here is a draft.",
  "lim.draft.detail": "The copy in this folder is marked on its own first page as a "
    + "preliminary working draft, and no notice in the archive names the standard document "
    + "it was written from. The rules quoted describe the procedure as the supplied copies "
    + "state it, not the procedure proved to have governed any particular tender.",
  "lim.undetermined.head": ({ undetermined }) =>
    `${undetermined} conditions of entry cannot be read at all.`,
  "lim.undetermined.detail": "They refer the bidder to a tender document the portal does "
    + "not publish. Every comparison of conditions of entry on this site is therefore a "
    + "comparison of the conditions that were published, not of all the conditions that "
    + "applied.",

  "lim.smallGroups.head": "The strongest-clause groups are small.",
  "lim.smallGroups.detail": ({ strongOf, otherOf }) =>
    `The two tests in chapter six compare ${strongOf} tenders against ${otherOf}. Neither `
    + "reaches significance, and no amount of care in the arithmetic can make a group of "
    + "that size settle the question.",
  "lim.orphans.head": ({ orphans }) =>
    `${orphans} awarded tenders have no award notice here.`,
  "lim.orphans.detail": "Their money, their winner and their bid counts are missing from "
    + "every total on this site. Whether the notice was never published or simply not "
    + "collected cannot be told from inside the archive.",
  "lim.unreadable.head": ({ figures }) => `${figures} money figures could not be read.`,
  "lim.unreadable.detail": ({ strings }) =>
    "A scale word that is not a scale word, a figure with no unit, a number broken across a "
    + `line. They are excluded from the ratios rather than guessed at, and the ${strings} `
    + "printed strings are listed below so a reader can see exactly what defeated the "
    + "parser.",
  "lim.ownership.head": "Ownership is almost entirely absent.",
  "lim.ownership.detail": ({ withOwner, firms }) =>
    `${withOwner} of ${firms} firms declare an owner anywhere in these documents, and no `
    + "company register is in the folder. Shared addresses are the only connection the "
    + "documents themselves print.",
  "lim.oneBuyer.head": "This is one buyer, not a country.",
  "lim.oneBuyer.detail": "The archive is the work of Chattogram Development Authority as "
    + "published on the portal. Nothing here supports a statement about Bangladeshi public "
    + "procurement in general, and none is made.",
  "lim.openStrings": ({ n }) =>
    `The ${n} money figures the parser could not read, exactly as printed`,
  "lim.stringsNote": ({ notices, list }) => `Printed in ${notices} notices: ${list}.`,

  /* ---- the footer ----
     The last thing a reader sees is what the investigation rests on, what it does not
     rest on, and what naming a firm does and does not mean. */
  "foot.sources": "Every number, name, date and quotation on this page was read out of the "
    + "PDF documents in this folder — the tender notices, amendments and contract-award "
    + "notices published on the government's own e-Procurement portal — and out of nothing "
    + "else. No figure here comes from a news report, an outside database, a website or "
    + "anyone's recollection. Where the documents do not answer a question, this "
    + "investigation says so instead of filling the gap.",
  "foot.noServer": "There is no server behind this page. It is a folder of files: the "
    + "article is assembled in your browser out of the same CSV and JSON files the download "
    + "section hands you, and the PDFs sit beside them. Nothing you type or click is sent "
    + "anywhere, because there is nowhere for it to go.",
  "foot.naming": "The firms, officials and offices named here are named because the "
    + "government's own published record names them. Naming is not an accusation: a pattern "
    + "in these pages is something to look into, and this site is built so that looking "
    + "into it does not require taking anyone's word for anything.",
  "foot.byline": ({ name }) =>
    `Reporting, data and code: ${name}. Every calculation on this page can be re-run from `
    + "the scripts and the PDFs in this folder, and any of it can be checked against the "
    + "page it was read from without asking anyone's permission.",
  "foot.howToRead": "How to read this investigation",
  "foot.method": "How this was made",
  "foot.limits": "What this cannot tell you",
  "foot.files": "Every file it was built from",

  /* ---- the vocabulary the parser wrote, looked up with word() ----
     Three different things happen here, and it matters which is which.

     The label on a chip is the analysis's own vocabulary, so it is translated: the chip
     PRINTS these words, while the token underneath it — the one the stylesheet colours
     by and the one the CSV carries — stays English. In this pack the printed word and
     the token are the same string, which is why these entries look redundant. They are
     not: bn.js prints Bangla here over the same English token.

     The category names are identifiers the parser coined (brand_model, cert_bin), not
     prose. Left alone they would print as "brand model", so both packs give them a
     readable name in their own language.

     The definitions the analysis wrote — what each label means, what each rule decides,
     what each observation tests — are deliberately ABSENT from this pack. word() falls
     back to the string the pipeline wrote, so an English reader gets the analysis's own
     wording, and rewording a definition upstream changes the page without touching a
     translation. bn.js carries those; scripts/check_i18n.js reports which ones it still
     lacks rather than letting the gap go unmeasured. */
  "label.DOCUMENTED FACT": "DOCUMENTED FACT",
  "label.DATA-DERIVED FINDING": "DATA-DERIVED FINDING",
  "label.POSSIBLE CONNECTION": "POSSIBLE CONNECTION",
  "label.UNRESOLVED": "UNRESOLVED",
  "label.COMMON": "COMMON",
  "label.UNUSUAL": "UNUSUAL",
  "label.HIGHLY SPECIFIC": "HIGHLY SPECIFIC",
  "label.RESTRICTIVE-LOOKING PATTERN": "RESTRICTIVE-LOOKING PATTERN",
  "label.UNDETERMINED": "UNDETERMINED",

  /* The fifteen kinds a search result can be — finding, tender, clause, company and the
     rest — go through the same label.* namespace, and are deliberately not listed here
     either. Each one is already an English word, so word() printing the index's own
     token is right; naming them would only add a place for the two to drift apart. The
     Bangla pack lists all fifteen, because there the token is not the word. */

  /* What a clause asks about. Each name says what the bidder has to show, because a
     reader looking at a bar chart of these needs to know what the bar is. */
  "elig.brand_model": "a named brand or model",
  "elig.cert_bin": "a business identification number",
  "elig.cert_licence_class": "a licence of a stated class",
  "elig.cert_other": "some other certificate",
  "elig.cert_tin": "a taxpayer identification number",
  "elig.cert_trade_licence": "a trade licence",
  "elig.cert_vat": "a VAT registration",
  "elig.deferred": "a document the portal does not publish",
  "elig.equipment": "equipment the bidder must hold",
  "elig.experience_count": "a number of past contracts",
  "elig.experience_general": "years in the business",
  "elig.experience_similar": "past work of a similar kind",
  "elig.financial_credit": "a bank credit line",
  "elig.financial_liquid": "cash or working capital",
  "elig.financial_turnover": "annual turnover",
  "elig.geographic": "where the bidder is based or has worked",
  "elig.jv": "how a joint venture may bid",
  "elig.manufacturer_auth": "a manufacturer's authorisation",
  "elig.other": "something else",
  "elig.personnel": "staff the bidder must employ",
  "elig.price_band": "how far the price may sit from the estimate",
  "elig.subcontract": "what may be subcontracted",
  "elig.tax_deduction": "proof of tax deducted at source",

  /* How an amendment changed a clause, and which way it moved a figure. */
  "clausePair.reworded": "reworded",
  "clausePair.added": "added",
  "clausePair.removed": "removed",
  "clausePair.punctuation only": "changed in punctuation only",
  "direction.lowered": "lowered",
  "direction.raised": "raised",
  "direction.not readable": "not readable",

  /* ---- the evidence layer ----
     The sentences a reader meets on the way to a source page. What they wrap — the
     extracted page text, the filename, the citation — is never translated. */
  "ev.check.one": "Check this against the document",
  "ev.check.many": ({ n }) => `Check this against ${n} documents`,
  "ev.wholeDataset": "This finding is arithmetic over the whole dataset rather than a "
    + "single page; the calculation is printed above and the tables it runs on are in "
    + "the downloads.",
  "ev.howWorkedOut": "How it was worked out:",
  "ev.loading": "Reading the pages",
  "ev.docMeta": ({ kind, pages, agree }) =>
    `${kind}, ${pages} pages, second extractor agrees: ${agree}`,
  "ev.notInIndex": "this page is not in the evidence index",
  "ev.quotedWords": "the words this finding quotes, as extracted",
  "ev.showPage": "Show the page as the parser read it",
  "ev.page": ({ n }) => `Page ${n}`,
  "ev.pageContinues": "… page continues",
  "ev.confidence": "Confidence:",

  /* ---- the document browser ----
     doc.itemMeta and doc.meta are assembled from parts rather than printed as one
     sentence, because the parts are counts and flags a translator has to be able to
     reorder. The filename inside doc.reading and doc.openFile is substituted, never
     translated. */
  "doc.filterHint": "Filter by file name, tender number or folder…",
  "doc.loadingList": "Loading the document list",
  "doc.pickerAria": "the documents in the folder",
  "doc.choose": "Choose a document to read the text that was extracted from it.",
  "doc.pages.one": ({ n }) => `${n} page`,
  "doc.pages.many": ({ n }) => `${n} pages`,
  "doc.words.one": ({ n }) => `${n} word`,
  "doc.words.many": ({ n }) => `${n} words`,
  "doc.itemMeta": ({ folder, kind, pages, characters }) =>
    `${folder} · ${kind} · ${pages} · ${characters} characters read`,
  "doc.matchCapped": ({ n, shown }) =>
    `${n} documents match; the first ${shown} are listed`,
  "doc.countOf": ({ n, total }) => `${n} of ${total} documents`,
  "doc.reading": ({ file }) => `Reading ${file}`,
  "doc.openFile": ({ file }) => `Open ${file}`,
  "doc.meta": ({ pages, words, textLayer, ocr, agree }) =>
    `${pages} · ${words} · text layer: ${textLayer} · `
    + `OCR needed: ${ocr} · second extractor agrees: ${agree}`,
  "doc.interleaved": "This document's layout interleaves two columns when it is "
    + "extracted linearly. The parser read its change table by word coordinates "
    + "instead; the text below is the linear reading, so a line may print an old value "
    + "and a new value together.",
  "doc.openThisPage": "open this page",
  "doc.noText": "(no text on this page)",
  "doc.kicker": "The evidence itself",
  "doc.title": "Open any document, page by page",
  "doc.p1": "Every PDF in the folder is listed here with what the parser found in it: "
    + "how many pages, how many words, whether it carried a text layer, whether a "
    + "second extractor read it the same way. Choosing one prints the text of each of "
    + "its pages.",
  "doc.p2": "That text is not a description of the page. It is the text this "
    + "investigation was built from, character for character, so that a reader who "
    + "thinks a number was misread can see the line it was read from. The link at the "
    + "top of each document, and on every page heading, opens the PDF itself at that "
    + "page, which is the only way to be sure.",

  /* The four kinds 01_inventory.py sorts the folder into, and the two flags 02_extract.py
     sets. Both domains are closed, so both are named here rather than left to word()'s
     fallback — "unavailable record" is not a phrase that tells a reader anything, and the
     document behind it is an error page the portal served instead of a notice. */
  "kind.tender_notice": "tender notice",
  "kind.contract_award": "contract award",
  "kind.reference_rulebook": "reference rulebook",
  "kind.proposal_notice": "proposal notice",
  "kind.unavailable_record": "a page the portal served instead of a record",
  "yn.yes": "yes",
  "yn.no": "no",

  /* The field names beside a finding's numbers are written by 04_analysis.py, and
     word() prints them with the underscores taken out, which reads correctly in
     English for all but a handful. Only that handful is named here; adding the rest
     would mean a rewording upstream silently stopped showing on the page. */
  "fnum.of": "the group it is counted out of",
  "fnum.one_responsive_pct": "% of them with one responsive bid",
  "fnum.largest_share_pct": "% held by the largest",
  "fnum.re_tendered": "re-tendered",
  "fnum.ratio_readable_sums_not": "where the ratio reads but the sums do not",

  /* ---- the eighteen tables ----
     One line each, saying what a row of that file is. The names beside them are
     filenames and stay as the parser wrote them. */
  "tbl.documents": "one row per PDF in the folder, with what was read out of it",
  "tbl.tenders": "one row per tender notice",
  "tbl.lots": "one row per lot inside a tender",
  "tbl.contracts": "one row per award notice",
  "tbl.bids": "the bid counts an award notice prints, one row per award",
  "tbl.eligibility_criteria": "every requirement to enter, one row per clause",
  "tbl.amendments": "one row per amendment notice",
  "tbl.amendment_changes": "one row per line of a change table",
  "tbl.companies": "every firm named in the archive",
  "tbl.people": "every person named, with the role they are named in",
  "tbl.organizations": "ministries, agencies and procuring entities",
  "tbl.projects": "the projects contracts are charged to",
  "tbl.beneficial_owners": "the owners a document declares",
  "tbl.locations": "the places the documents name",
  "tbl.relationships": "every link between two records, with the page it came from",
  "tbl.timeline": "every dated event, one row per date",
  "tbl.normalization": "every value this pipeline changed, and why",
  "tbl.name_candidate_pairs": "names that resemble each other, none of them merged",

  /* ---- the table explorer ---- */
  "tab.pickAria": "which table to open",
  "tab.chooseLabel": "Choose a table",
  "tab.rowsCols": ({ rows, cols }) => ` — ${rows} rows, ${cols} columns.`,
  "tab.reading": ({ name }) => `Reading ${name}.csv`,
  "tab.caption": ({ name }) => `${name}.csv, exactly as the pipeline wrote it. `
    + "Filtering and sorting happen in your browser; the download button hands back "
    + "the rows you can see.",
  "tab.kicker": "The dataset itself",
  "tab.title": "Every table, open to read",
  "tab.p1": "These eighteen files are the whole dataset this investigation was written "
    + "from. Nothing on this site is calculated from anything that is not in them, and "
    + "every one of them was written by the parser out of the PDFs. Columns that name a "
    + "document open that document at the page in question.",

  /* ---- the downloads ----
     File sizes and row counts are measured, never written down, so these are the
     frames the measurements are printed in. */
  "down.mb": ({ n }) => `${n} MB`,
  "down.kb": ({ n }) => `${n} KB`,
  "down.bytes": ({ n }) => `${n} bytes`,
  "down.missing": "not on this server",
  "down.missingWith": ({ note }) => `${note} — not on this server`,
  "down.sizeWith": ({ size, note }) => `${size} — ${note}`,
  "down.shape": ({ rows, cols }) => `${rows} rows × ${cols} columns`,
  "down.rows": ({ rows }) => `${rows} rows`,

  "down.kicker": "Take it away",
  "down.title": "Every file this investigation was built from",
  "down.p1": "These are not exports. They are the files the site itself fetched while "
    + "you read it, handed over unchanged, so anything checked in a spreadsheet is "
    + "checked against what the article was written from.",
  "down.p2a": "The PDFs are not listed here, because ",
  "down.themBare": "they",
  "down.themCounted": ({ n }) => `there are ${n} of them and they`,
  "down.p2b": " sit in the same folder as this site. Every citation, every row in the "
    + "document browser and every document column in the tables above opens the PDF "
    + "itself at the page in question. The page-by-page text of each one is in "
    + "investigation/public/pages/, one small file per document.",

  "down.tables.title": "The eighteen tables",
  "down.tables.blurb": "One row per thing counted. These are the files the explorer "
    + "above reads.",
  "down.master.title": "The whole archive in one row per tender",
  "down.master.blurb": "Every notice joined to its award, its lots, its bid count and "
    + "its eligibility clauses, so one row is one procurement from start to finish.",
  "down.analysis.title": "What the analysis worked out",
  "down.analysis.blurb": "Every number on this site is in one of these files. "
    + "story.json is what the article loads; analysis.json is the same thing with the "
    + "two long row lists left in place.",
  "down.evidence.title": "The evidence trail",
  "down.evidence.blurb": "The matrix is the editor's file: one row per finding, with "
    + "the page it rests on and the arithmetic that produced it.",
  "down.extraction.title": "The extraction, before any analysis touched it",
  "down.extraction.blurb": "If you want to start where this investigation started, "
    + "start here: what was found in the folder, and what was read off each page.",
  "down.docs.title": "How to read all of it",
  "down.docs.blurb": "What every column of every table holds, what the search box "
    + "accepts, and how the whole thing is rebuilt. The first two are written out of "
    + "the built dataset itself, so they cannot drift from the files above.",
  "down.index.title": "The search index",
  "down.index.blurb": "The search box on this site is these three files and search.js. "
    + "Nothing is queried over the network.",

  /* What is in each file, one line each. The filename beside it is not translated. */
  "down.f.masterCsv": "one row per procurement, notice joined to award",
  "down.f.masterJson": "the same rows, nested rather than flattened",
  "down.f.eligRows": "every condition of entry, with the text it is printed in",
  "down.f.analysis": "every finding and every aggregate, complete",
  "down.f.story": "analysis.json without the two long lists",
  "down.f.signalRows": "the per-tender ledger, one row per tender",
  "down.f.summary": "what was written, counted after writing it",
  "down.f.audit": "the pipeline checking its own work",
  "down.f.matrix": "finding, type, source PDF, page, quoted evidence, calculation, "
    + "confidence",
  "down.f.qa": "what was checked, what failed, what remains open",
  "down.f.evidenceIndex": "every citation on this site, keyed file#page",
  "down.f.inventory": "every PDF found, with its hash, size and page count",
  "down.f.extracted": "every field read out of every document, each with its page",
  "down.f.rawPages": "the text layer of every page, as extracted",
  "down.f.dictionary": "every column of all eighteen tables: kind, how often filled, "
    + "an example",
  "down.f.searchRef": "the query grammar, the scopes, the numeric and date fields",
  "down.f.pipeline": "what each stage reads and writes, and what to re-run after a change",
  "down.f.records": "one record per searchable thing, repeated values interned",
  "down.f.postings": "token to record lists, delta encoded",
  "down.f.text": "the snippet each result shows",

  /* ---- what the search engine says about its own work ----

     search/search.js prints nothing else. Every one of these is the engine admitting
     it did not find what was typed and saying what it did instead, so a reader is
     never shown a near miss as though it were a hit. The words quoted back inside
     them — what was typed, what the index actually holds, the name of a field — are
     never translated: a spelling is the subject of the sentence. */

  "find.prefix": ({ word, words }) =>
    `“${word}” was read as the start of a word: ${words}`,
  "find.andMore": ({ n }) => ` and ${n} more`,
  "find.loose": ({ word, words }) =>
    `“${word}” shares an OCR-loose spelling with ${words}`,
  "find.near": ({ word, words }) =>
    `“${word}” is not in the index; the closest words that are: ${words}`,
  "find.nowhere": ({ word, documents }) => `“${word}” appears nowhere in the `
    + `${documents} documents or the dataset built from them`,
  "find.noField": ({ name, value }) => `no record has ${name} matching “${value}”`,
  "find.badRange": ({ name, lo, hi }) => `${name}:${lo}..${hi} is not a pair of numbers`,
  "find.emptyRange": ({ name, lo, hi }) =>
    `nothing in the dataset has ${name} between ${lo} and ${hi}`,
  "find.pagesCapped": ({ phrase, more, limit }) => `“${phrase}”: ${more} more documents `
    + `hold all of these words somewhere; only the first ${limit} were opened to check `
    + "whether the words sit together",
  "find.wrongOrder": ({ phrase, n }) => `“${phrase}”: ${n} records hold all of these `
    + "words but not in this order, and are left out",
  "find.onlyExclusions": "this query only says what to leave out, so everything else "
    + "is listed",

  /* ---- the search box itself ---- */

  "srch.kicker": "Look for anything yourself",
  "srch.title": "Search every word the archive prints",
  "srch.p1": "This box reads an index built from the documents themselves: every field "
    + "the parser lifted, every clause of every condition of entry, every name, and the "
    + "text of every page. It runs entirely in your browser. Nothing you type is sent "
    + "anywhere, because there is nowhere for it to go — the site has no server behind it.",
  "srch.p2": "A word the documents do not use returns nothing, and says so. Where an "
    + "exact match fails, the box retries the word as a prefix, then against the "
    + "confusions a scanner makes, then within one or two letters, and it tells you "
    + "which of those it did. A near miss is never presented as a hit.",

  /* The placeholder ends in a query a reader could type, so that fragment stays in
     Latin script in every edition: typed as it appears, it works. */
  "srch.placeholder": "A firm, a tender number, a phrase in quotes, company:niaz…",
  "srch.boxAria": "search every word in the archive",
  "srch.srBox": "Search the archive",
  "srch.kindAria": "narrow to one kind of record",
  "srch.srKind": "Narrow to one kind",
  "srch.everyKind": "every kind of record",

  "srch.idle": "The index is fetched the first time you search, and not before.",
  "srch.emptyQuery": "Type anything above. Everything this box understands is listed "
    + "under the box.",
  "srch.fetching": "Fetching the index, once",
  "srch.searching": ({ q }) => `Searching for ${q}`,
  "srch.indexFailed": ({ message }) => `The index did not load: ${message}`,
  "srch.matchCount": ({ n, shown }) => `${n} records match, showing ${shown}`,
  "srch.noMatch": "Nothing in the archive matches that.",
  "srch.notPrinted": ({ documents }) => "A word the archive does not print is not a "
    + `finding about the world. It means these ${documents} documents do not use it.`,
  "srch.showNext": ({ n }) => `Show the next ${n}`,
  "srch.downloadCsv": "Download these results (CSV)",
  "srch.notOnAPage": "worked out from the dataset, not printed on a page",

  "srch.narrowTo": "narrow to: ",
  "srch.kindCount": ({ kind, n }) => `${kind} (${n})`,
  "srch.kindOption": ({ kind, n }) => `${kind} · ${n} records`,
  "srch.onlyKind": ({ kind }) =>
    `showing ${kind} records only — show every kind again`,

  /* ---- the table of what the box understands ----
     The left column of that table is a query, and lives in searchui.js beside the
     parser rule it exercises. These are the right column: what each one does. */

  "srch.howTo": "How to search this archive",
  "srch.helpCaption": "Everything this box understands",
  "srch.typeThis": "type this",
  "srch.andItMeans": "and it means",
  "srch.namedFields": "named fields",
  "srch.numFields": "fields that take a number range",
  "srch.dateFields": "fields that take a date range",
  "srch.recordKinds": "kinds of record",

  "help.bothWords": "both words, anywhere in a record",
  "help.phrase": "those words in that order, checked against the text",
  "help.either": "either one",
  "help.without": "the first, without the second",
  "help.grouped": "grouped",
  "help.scope": "a named field; the whole list of them is below",
  "help.tender": "everything the archive holds on one tender",
  "help.numRange": "a number between two bounds",
  "help.dateRange": "a date between two bounds",
  "help.label": "the label the analysis gave a record",
  "help.kind": "one kind of record only",
  "help.ocr": "a misreading: the box retries it against OCR-style confusions",

  /* ---- the names, and the profile of one of them ----

     The four tables that name things, the counts a profile leads with, and the
     headings of the tables underneath it. What a profile prints between them — the
     names, addresses, designations, tender numbers — is copied from the page and is
     not here. The names of the sets and the four kinds are left to word(): in English
     the CSV's own word is already the word, so naming them here would only add a
     place for the page and the file to drift apart. bn.js names all of them. */

  "ent.kicker": "Who is in these documents",
  "ent.title": "Every name the archive prints",
  "ent.loading": "Reading the four tables that name things",
  "ent.whoBare": "Firms, people, ministries and offices",
  "ent.whoCounted": ({ n }) => `${n} records: firms, people, ministries and offices`,
  "ent.p1rest": ", and the projects contracts are charged to. A profile prints every "
    + "column the pipeline wrote, in the words of the page, and links to the first "
    + "document the name appears in.",
  "ent.p2lead": "A name in this section is not an allegation about anyone. ",
  "ent.p2rest": "These names are here because the government's own published notices "
    + "and award records print them. Where two names resemble each other closely enough "
    + "to be the same firm, the pair is shown and marked not merged; this pipeline never "
    + "merges two records because their names look alike.",
  "ent.tabLabel": ({ set, n }) => `${set} · ${n}`,

  "ent.blurb.companies": "firms named anywhere in the archive",
  "ent.blurb.people": "people named, with the role they are named in",
  "ent.blurb.organizations": "ministries, agencies and procuring entities",
  "ent.blurb.projects": "the projects contracts are charged to",

  "ent.list.colName": "name as printed",
  "ent.list.colRoles": "named as",
  "ent.list.caption": ({ kind }) => `Every ${kind} the parser found a name for. Select `
    + "a name to open everything the documents say about it.",

  "ent.tile.documents": "documents that name it",
  "ent.tile.contractsWon": "contracts won",
  "ent.tile.value": "value of those contracts",
  "ent.tile.notices": "notices published",
  "ent.tile.awards": "awards published",
  "ent.tile.tendersInvited": "tenders invited",
  "ent.tile.awardsApproved": "awards approved",
  "ent.tile.noticesCharged": "notices charged to it",
  "ent.tile.awardsCharged": "awards charged to it",
  "ent.tile.entities": "procuring entities dealt with",
  "ent.tile.winners": "different winners",
  "ent.tile.variants": "ways its name is printed",

  /* A tender is referred to by its number in every edition, because the number is how
     the portal refers to it and how a reader will search for it. */
  "ent.tenderNo": ({ id }) => `Tender ${id}`,
  "ent.noRecord": ({ id }) => `This archive has no record with id ${id}.`,
  "ent.idIs": ({ id }) => `id ${id}`,
  "ent.firstNamedIn": " · first named in ",
  "ent.interleaved": "This name was read from a page whose columns interleave, so the "
    + "reading is less certain than most. The page is linked above; check it against "
    + "the name printed here.",
  "ent.findEverywhere": "Find this name everywhere in the archive",

  /* The picture of what a record is attached to, and the same links as a table. The
     eight words for a link are the parser's, and are left to word() here for the same
     reason as the kinds. */
  "ent.graph.noLinks": "The documents print no link between this record and any other.",
  "ent.graph.title": "What the documents attach to this record",
  "ent.graph.note": ({ n }) => `${n} links, every one of them a line on a page. A lane `
    + "whose label begins with an arrow is a link printed the other way round: the "
    + "record named on the right is the one the document says did it.",
  "ent.graph.notePick": " Select any of them to move the picture there.",
  "ent.graph.source": "Drawn from relationships.csv, which is written only from lines "
    + "the documents print.",
  "ent.graph.asTable": "Read every link as a table",

  "ent.rel.dirOut": "this record →",
  "ent.rel.dirIn": "→ this record",
  "ent.rel.colDir": "direction",
  "ent.rel.colRelation": "the link, in the parser's words",
  "ent.rel.colOther": "the other record",
  "ent.rel.colOtherType": "what it is",
  "ent.rel.colDetail": "what the page prints beside it",
  "ent.rel.colPrintedOn": "printed on",
  "ent.rel.caption": "Every link the documents print for this record, in both "
    + "directions. No link here is inferred: each one is a line on the page it cites.",

  /* Names that resemble each other and were not merged. What the resemblance is, and
     how it was measured, are sentences the pipeline wrote: they go through dataText(),
     so this pack does not repeat them. */
  "ent.pairs.one": ({ n }) => `${n} name in the archive resembles this one, and was not `
    + "merged with it",
  "ent.pairs.many": ({ n }) => `${n} names in the archive resemble this one, and were `
    + "not merged with it",
  "ent.pairs.colA": "one printed name",
  "ent.pairs.colB": "the other printed name",
  "ent.pairs.colHow": "how they resemble each other",
  "ent.pairs.colMeasure": "measure",
  "ent.pairs.colMerged": "merged by this pipeline",
  "ent.pairs.caption": "Printed for the reader to judge. This pipeline merges nothing "
    + "on the strength of a resemblance.",

  /* Ownership is declared, not discovered. Every heading below says "printed", because
     that is the whole claim being made about the cell underneath it. */
  "ent.owners.person.one": ({ n }) => `${n} declaration of ownership naming this person`,
  "ent.owners.person.many": ({ n }) =>
    `${n} declarations of ownership naming this person`,
  "ent.owners.firm.one": ({ n }) => `${n} owner this firm declared`,
  "ent.owners.firm.many": ({ n }) => `${n} owners this firm declared`,
  "ent.owners.colOwner": "owner as printed",
  "ent.owners.colFirm": "firm as printed",
  "ent.owners.colDesignation": "designation printed",
  "ent.owners.colShare": "share printed",
  "ent.owners.colCountry": "country printed",
  "ent.owners.colTender": "tender",
  "ent.owners.colPrintedOn": "printed on",
  "ent.owners.caption": "Copied from the schedule of beneficial ownership as printed. "
    + "A blank cell is a blank on the page.",

  /* ---- the connection explorer ----
     There is no map here and there is no sentence about one, because the archive
     prints district names and no coordinates. Districts are counted, never plotted. */

  "net.kicker": "Which entities connect",
  "net.title": "Follow one printed line at a time",
  "net.p1": "Every link in this picture is a line on a page: this firm was awarded this "
    + "tender, this office advertised it, this official invited it, this project was "
    + "charged for it. Select any record in the picture and it becomes the centre, so a "
    + "reader can walk the chain outwards and read the page behind every step.",
  "net.p2lead": "Nothing here is inferred. ",
  "net.p2mid": "The archive prints no shareholder registers, no directorships and no "
    + "family relations, so this section cannot show them. Where two firms printed the "
    + "same address, that is shown as a question, marked ",
  "net.p2end": ", and it remains a question.",

  "net.pickPlaceholder": "Type a firm, a person, an office or a project…",
  "net.pickAria": "which record to centre the picture on",
  "net.srPick": "Centre the picture on a record",
  "net.loading": "Reading the links",
  "net.graphTitle": ({ name }) => `${name}: what the documents attach to it`,
  "net.openProfile": "Open the full profile of this record",
  "net.noSuchName": "No record in the archive is printed with exactly that name. The "
    + "search box takes partial names; this box takes the name as the documents print it.",

  "net.addr.lead": ({ n }) => "The address this firm printed is printed by other firms "
    + `too, in ${n} of the groups the analysis found.`,
  "net.addr.jv": " One of these names is a joint venture, so a shared address may be "
    + "the address of the venture itself.",
  "net.addr.note": "A shared address is not shared ownership. Firms share buildings, "
    + "agents and typists, and the documents do not say who occupies which room. It is "
    + "printed here because it is a question worth asking, and the archive does not "
    + "answer it.",
};
