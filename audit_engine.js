/* Run tool.html's own forensic engine outside the browser.
 *
 * The tool decides what a red flag is, in what order the flags appear, and what
 * index each one carries. An audit ledger records a verdict against those very
 * indices, so a second implementation of the rules — however careful — would put
 * the verdicts on the wrong flags the first time a regex behaved differently.
 * There is no second implementation here: this file reads the <script> block out
 * of tool.html, evaluates it against a small DOM shim, and calls the tool's own
 * analyzeSingleRecord(). The rules are the same source text the reader runs.
 *
 * Used by build_audit_ledger.js. Node 18+, no dependencies.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const readJSON = (f) => JSON.parse(read(f));

/* The tool's markup declares the ~125 extraction fields as .egp-field inputs,
   each carrying the register key it prefers (data-db) and the notice-text regex
   it falls back to (data-regex). analyzeSingleRecord() walks them through
   document.querySelectorAll, so the shim has to serve the real list. */
function parseEgpFields(html) {
    const tags = html.match(/<(?:input|textarea|select)[^>]*egp-field[^>]*>/g) || [];
    return tags.map(function (tag) {
        const attr = (name) => {
            const m = tag.match(new RegExp('\\b' + name + '="([^"]*)"'));
            return m ? m[1] : null;
        };
        /* the markup is HTML, so the attribute values are HTML-escaped; the browser
           hands getAttribute() the decoded text and the regexes depend on it */
        const dec = (s) => s == null ? null : s
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
        const a = { id: dec(attr('id')), 'data-db': dec(attr('data-db')), 'data-regex': dec(attr('data-regex')) };
        return { id: a.id, value: '', getAttribute: (n) => a[n] != null ? a[n] : null };
    });
}

function stubEl() {
    const el = {
        innerText: '', innerHTML: '', textContent: '', value: '', checked: false,
        style: {}, className: '', href: '', download: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        getAttribute: () => null, setAttribute() {}, appendChild() {}, removeChild() {},
        addEventListener() {}, removeEventListener() {}, click() {}, focus() {},
        scrollIntoView() {}, querySelector: () => null, querySelectorAll: () => [],
        getContext: () => null, remove() {}, closest: () => null, insertAdjacentHTML() {}
    };
    return el;
}

/* Load the engine and return { analyzeSingleRecord, records, sandbox }.
   records are the raw register rows with .fullOCR attached exactly as
   processForensicEngineAsync() attaches it. */
function loadEngine() {
    const html = read('tool.html');
    const open = '\n    <script>\n';
    const i = html.indexOf(open);
    const j = html.indexOf('<' + '/script>', i);
    if (i < 0 || j < 0) throw new Error('tool.html: could not find the main <script> block');
    const source = html.slice(i + open.length, j);
    if (!/function analyzeSingleRecord/.test(source)) {
        throw new Error('tool.html: the extracted <script> block is not the engine');
    }

    const fields = parseEgpFields(html);
    if (fields.length < 100) throw new Error('tool.html: expected ~125 .egp-field inputs, found ' + fields.length);

    const document = {
        readyState: 'complete',
        getElementById: () => stubEl(),
        querySelector: () => stubEl(),
        querySelectorAll: (sel) => (sel === '.egp-field' ? fields : []),
        createElement: () => stubEl(),
        addEventListener() {}, body: stubEl(), head: stubEl()
    };

    const sandbox = {
        console,
        document,
        /* file: keeps the boot IIFE at the end of the script from firing */
        location: { protocol: 'file:', href: 'file:///tool.html', reload() {} },
        localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
        setTimeout, clearTimeout, setInterval, clearInterval,
        Promise, JSON, Math, Date, RegExp, String, Number, Object, Array, Boolean, Error,
        parseInt, parseFloat, isNaN, encodeURI, encodeURIComponent, decodeURIComponent,
        alert() {}, confirm: () => true, prompt: () => null,
        fetch: () => Promise.reject(new Error('no network in the ledger build')),
        URL: { createObjectURL: () => '', revokeObjectURL() {} },
        Blob: function () {}, FileReader: function () {},
        pdfjsLib: { GlobalWorkerOptions: {}, getDocument: () => { throw new Error('no pdf.js'); } },
        Chart: function () {}, $: () => ({ DataTable: () => ({}), on: () => {}, off: () => ({ on: () => {} }) })
    };
    sandbox.window = sandbox;
    sandbox.globalThis = sandbox;
    sandbox.$.fn = { DataTable: { isDataTable: () => false } };

    /* The engine's state lives in top-level `let` bindings, which are lexical to the
       script and so invisible from outside it — a browser has the same rule; the
       difference is only that there we would be running inside the page. An epilogue
       compiled with the same source hands out getter/setter pairs for the handful of
       bindings the ledger has to write, and those are mirrored onto the sandbox
       global. The engine keeps reading its own bindings; nothing is shadowed. */
    const shared = ['globalFilesMap', 'rawTenderData', 'analyzedData', 'pdfCache',
        'repoMode', 'auditLogs', 'currentRecord', 'currentTenderId'];
    const epilogue = '\n;globalThis.__ENGINE_BIND = {' + shared.map(function (n) {
        return n + ': { get: function () { return ' + n + '; }, set: function (v) { ' + n + ' = v; } }';
    }).join(', ') + '};\n';

    vm.createContext(sandbox);
    vm.runInContext(source + epilogue, sandbox, { filename: 'tool.html<script>' });

    if (typeof sandbox.analyzeSingleRecord !== 'function') {
        throw new Error('tool.html: analyzeSingleRecord did not evaluate');
    }
    const bind = sandbox.__ENGINE_BIND;
    shared.forEach(function (n) {
        Object.defineProperty(sandbox, n, { get: bind[n].get, set: bind[n].set, configurable: true });
    });
    return sandbox;
}

/* Reproduce repository mode: globalFilesMap keyed "<dir>/<file>.pdf" holding the
   URL string, pdfCache holding the text already extracted for that key. This is
   registerRepoFiles() with the manifest and the text cache, verbatim. */
function attachRepoFiles(S) {
    const manifest = readJSON('pdf_manifest.json');
    const textCache = readJSON('pdf_text_cache.json');
    const dirs = manifest.dirs;
    Object.keys(dirs).forEach(function (dir) {
        (dirs[dir] || []).forEach(function (name) {
            const key = dir + '/' + name;
            S.globalFilesMap[key] = key;
            if (textCache[name] != null) S.pdfCache[key] = textCache[name];
        });
    });
    S.repoMode = true;
    return { manifest, textCache };
}

/* processForensicEngineAsync()'s per-tender text assembly, without the awaits:
   every text is already in pdfCache, so the loop is pure string work. */
function buildRecords(S) {
    const tenderPdfMap = {};
    for (const key of Object.keys(S.globalFilesMap)) {
        if (key.toLowerCase().endsWith('.pdf')) {
            const m = key.match(/(\d{5,8})/);
            if (m) (tenderPdfMap[m[1]] = tenderPdfMap[m[1]] || []).push(key);
        }
    }
    const out = [];
    for (const t of S.rawTenderData) {
        const tid = String(t.Tender_Proposal_ID).trim();
        const matched = (tenderPdfMap[tid] || []).slice(0, 2);
        let combined = '';
        for (const key of matched) combined += (S.pdfCache[key] || '') + '\n\n';
        t.fullOCR = combined
            .replace(/:\s*\n/g, ': ')
            .replace(/\n\s*:/g, ' :')
            .replace(/\s{2,}/g, ' ');
        out.push({ t: t, tid: tid, files: matched });
    }
    return out;
}

function analyzeAll() {
    const S = loadEngine();
    S.rawTenderData = readJSON('Procurement_Database.json');
    attachRepoFiles(S);
    const rows = buildRecords(S);
    return rows.map(function (r) {
        const rec = S.analyzeSingleRecord(r.t);
        return { tid: r.tid, files: r.files, rec: rec };
    });
}

module.exports = { loadEngine, attachRepoFiles, buildRecords, analyzeAll, readJSON, read, ROOT };

if (require.main === module) {
    const all = analyzeAll();
    const byFlag = {}, byLevel = {};
    let flagged = 0, totalFlags = 0;
    all.forEach(function (a) {
        byLevel[a.rec.riskLevel] = (byLevel[a.rec.riskLevel] || 0) + 1;
        const f = a.rec.forensicFindings || [];
        if (f.length) flagged++;
        totalFlags += f.length;
        f.forEach((x) => { byFlag[x.flag] = (byFlag[x.flag] || 0) + 1; });
    });
    console.log('tenders analysed : ' + all.length);
    console.log('with >=1 flag    : ' + flagged);
    console.log('flags in total   : ' + totalFlags);
    console.log('risk levels      : ' + JSON.stringify(byLevel));
    console.log('flags by rule:');
    Object.entries(byFlag).sort((a, b) => b[1] - a[1])
        .forEach(([k, v]) => console.log('  ' + String(v).padStart(5) + '  ' + k));
}
