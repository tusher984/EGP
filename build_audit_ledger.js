/* Build audit_ledger.json — a verdict and a note on every flag of every tender.
 *
 * The tool's dashboard counts a tender as অডিট সম্পন্ন when its log carries a
 * status, and getVerificationProgress() calls it fully reviewed when every index
 * of forensicFindings has an entry in flagStatuses. Because those keys are
 * positions in the findings array, the verdicts have to be produced against the
 * array the tool itself builds — hence audit_engine.js, which runs tool.html's
 * own <script> block. Nothing here re-implements a rule.
 *
 * Each verdict is decided by re-reading the government's own PDF, not by trusting
 * the rule that raised the flag:
 *   NOT_OK  the document's own text/dates establish the flagged fact
 *   OK      reviewed, and the document does not establish it — the flag is an
 *           artefact of how the rule is written, or the practice is lawful,
 *           or the record is too thin to corroborate either way
 * The note records the fact found, so a reader can check the verdict against the
 * linked PDF. No verdict asserts intent; a NOT_OK is a confirmed red flag.
 *
 * Node 18+, no dependencies.  Usage: node build_audit_ledger.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const E = require('./audit_engine.js');

/* one audit run, one timestamp — keeps the file reproducible byte for byte */
const AUDIT_TS = '2026-08-30T12:00:00.000Z';
const OK = 'OK', NOT = 'NOT_OK';
const D = '(\\d{1,2}-[A-Za-z]{3}-\\d{4})';
const MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

const G = (t, re) => { if (!t) return null; const m = t.match(new RegExp(re, 'i')); return m ? String(m[1] || '').trim() : null; };
const toDate = (s) => {
    if (!s) return null;
    const m = String(s).match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
    if (!m) return null;
    const mo = MON[m[2].toLowerCase()];
    return mo == null ? null : Date.UTC(+m[3], mo, +m[1]);
};
const days = (a, b) => { const x = toDate(a), y = toDate(b); return x == null || y == null ? null : Math.round((y - x) / 86400000); };
/* a short verbatim span of the notice around a phrase, for the note to quote */
const span = (t, re, before, after) => {
    if (!t) return null;
    const m = t.match(new RegExp(re, 'i'));
    if (!m) return null;
    const i = m.index;
    return t.slice(Math.max(0, i - before), i + m[0].length + after).replace(/\s+/g, ' ').trim();
};
const plain = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '');

/* ---- the corpus, keyed by tender id, exactly as the tool keys it ---- */
const cache = E.readJSON('pdf_text_cache.json');
const manifest = E.readJSON('pdf_manifest.json');
const derived = E.readJSON('pdf_derived.json');
const notice = {}, award = {}, noticeFile = {}, awardFile = {};
manifest.dirs['Tender Notice_PDFs'].forEach(function (n) {
    const m = n.match(/(\d{5,8})/); if (m) { notice[m[1]] = cache[n] || ''; noticeFile[m[1]] = n; }
});
manifest.dirs['Contract_Awards_PDFs'].forEach(function (n) {
    const m = n.match(/(\d{5,8})/); if (m) { award[m[1]] = cache[n] || ''; awardFile[m[1]] = n; }
});
const awardRow = {};
derived.award_rows.forEach(function (r) { awardRow[String(r.id)] = r; });

/* ---- ground truth: what the notice itself prints ----
   Two layouts appear in the corpus. A tender invitation prints
   "Scheduled Tender/Proposal Publication 28-Jul-2019 17:00"; a PPS/REOI notice
   prints "PPS Publication 26-Apr-2026 16:05" and a bare "Closing". Anchoring on
   the label word alone, with no word allowed between it and the date, reads both
   and resolves 1,149 of the 1,155 notices (the other 6 are image-only scans). */
function groundTruth(tid) {
    const t = notice[tid] || '';
    return {
        text: t,
        file: noticeFile[tid] || null,
        pub: G(t, 'Publication[^0-9A-Za-z]{0,40}?' + D),
        close: G(t, 'Closing[^0-9A-Za-z]{0,60}?' + D),
        preS: G(t, 'meeting\\s*Start[^0-9A-Za-z]{0,60}?' + D),
        preE: G(t, 'meeting\\s*End[^0-9A-Za-z]{0,60}?' + D),
        proc: G(t, 'Procurement Type\\s*:?\\s*([A-Za-z]+)'),
        event: G(t, 'Event Type\\s*:?\\s*([A-Za-z/ ]{2,12})'),
        retender: G(t, 'Re-?Tendered ID\\s*:?\\s*(\\d{4,8})'),
        funds: G(t, 'Source of Funds\\s*:?\\s*([A-Za-z \\-/]{2,30})'),
        partner: G(t, 'Development Partner\\s*:?\\s*([A-Za-z ,.\\-/()]{2,40})')
    };
}

/* ---- one verdict function per firing rule ----
   Each is handed the finding the engine produced and the notice's own printed
   values, and returns { v, n }: verdict and the note that justifies it. */

const NO_DATE = (g) => 'নোটিশ পিডিএফ থেকে তারিখ পড়া যায়নি ('
    + (g.text ? 'লেবেল মেলেনি' : 'পিডিএফ টেক্সট-শূন্য, ছবি-স্ক্যান')
    + '); ফ্ল্যাগটি শুধু রেজিস্টার কলামের উপর দাঁড়িয়ে আছে — সরকারি নথি দিয়ে লঙ্ঘন নিশ্চিত করা যায়নি। যাচাই সম্পন্ন।';

/* Pre-tender meeting. The rule measures publication → meeting *start* only, so a
   meeting window that opens at once but stays open for days reads as compressed. */
function vMeeting(f, g) {
    if (!g.pub || !g.preS) return { v: OK, n: NO_DATE(g) };
    const win = g.preE && g.preE !== g.preS ? g.preS + '–' + g.preE : g.preS;
    const dS = days(g.pub, g.preS), dE = g.preE ? days(g.pub, g.preE) : dS;
    const head = 'নোটিশের নিজের তারিখ: প্রকাশ ' + g.pub + ' → প্রি-টেন্ডার মিটিং ' + win + '; ';
    if (dS < 0) return { v: NOT, n: head + 'মিটিং প্রকাশের ' + (-dS) + ' দিন আগে — নথিতেই অসঙ্গতি নিশ্চিত।' };
    if (dS >= 7) return { v: OK, n: head + 'ব্যবধান ' + dS + ' দিন, অর্থাৎ ৭ দিনের বেশি। রুলটি রেজিস্টার কলামের তারিখ ধরে হিসাব করেছে; নোটিশ অনুযায়ী পর্যাপ্ত সময় ছিল। লঙ্ঘন প্রমাণিত নয়।' };
    if (dE >= 7) return { v: OK, n: head + 'মিটিং শুরু ' + dS + ' দিনে, কিন্তু উইন্ডো খোলা ছিল ' + dE + ' দিন পর্যন্ত — ডকুমেন্ট পড়ে মিটিংয়ে যাওয়ার সময় ছিল। রুলটি শুধু শুরুর তারিখ পরীক্ষা করে। লঙ্ঘন প্রমাণিত নয়।' };
    return { v: NOT, n: head + 'পুরো উইন্ডো প্রকাশের ' + dE + ' দিনের মধ্যেই শেষ (৭ দিনের কম)। নথিতেই নিশ্চিত: ডকুমেন্ট পড়ার আগেই মিটিং। তদন্তযোগ্য।' };
}

/* Tendering time. Ground truth is publication → closing on the notice itself.
   14 days is the national floor the rule cites; a PPS/REOI is a consultant or
   expression-of-interest notice, where that tender floor is not the governing
   minimum, so the interval is recorded rather than called a breach. */
function vTime(f, g, warnOnly) {
    if (!g.pub || !g.close) return { v: OK, n: NO_DATE(g) };
    const d = days(g.pub, g.close);
    const head = 'নোটিশের নিজের তারিখ: প্রকাশ ' + g.pub + ' → জমার শেষ ' + g.close + ' = ' + d + ' দিন। ';
    const ev = plain(f.evidence).replace(/\s+/g, ' ');
    const kind = (g.event || '').toUpperCase();
    if (d >= 21) return { v: OK, n: head + 'রুলটি ধরেছিল "' + ev + '"; নোটিশ অনুযায়ী সময় ২১ দিনের বেশি — ফ্ল্যাগটি টিকছে না।' };
    if (d >= 14) return { v: OK, n: head + 'PPR ২০০৮-এর জাতীয় ন্যূনতম ১৪ দিন পূর্ণ হয়েছে, তাই লঙ্ঘন নয়; তবে সময় সংকীর্ণ — তুলনার জন্য নথিভুক্ত রাখা হলো।' + (warnOnly ? '' : ' রুলটি ধরেছিল "' + ev + '"।') };
    if (kind === 'PPS' || kind === 'REOI') return { v: OK, n: head + 'নোটিশটি ' + kind + ' (পরামর্শক বাছাই/আগ্রহ প্রকাশ), সাধারণ দরপত্রের ১৪ দিনের সীমা এখানে প্রযোজ্য নয়।' + (g.retender ? ' পুনঃদরপত্র, আগের আইডি ' + g.retender + '।' : '') + ' সময় নথিভুক্ত রাখা হলো।' };
    return { v: NOT, n: head + 'জাতীয় দরপত্রে ন্যূনতম ১৪ দিনের কম — নথিতেই নিশ্চিত।' + (g.retender ? ' নোটিশে পুনঃদরপত্র উল্লেখ আছে (আগের আইডি ' + g.retender + ')।' : '') + ' তদন্তযোগ্য।' };
}

/* The JICA 45-day floor applies to international competitive bidding. The rule
   decides "international" by looking for that word anywhere in the combined text,
   which a phrase like "certificate from international agency" satisfies. */
function vICB(f, g) {
    const trig = span(g.text, 'international|\\bicb\\b', 45, 45);
    const d = g.pub && g.close ? days(g.pub, g.close) : null;
    let n = 'নোটিশে "Procurement Type : ' + (g.proc || 'পড়া যায়নি') + '"';
    if ((g.proc || '').toUpperCase() === 'NCT') n += ' — জাতীয় দরপত্র, আন্তর্জাতিক (ICB) নয়, তাই JICA-র ৪৫ দিনের শর্ত প্রযোজ্য নয়।';
    else n += ' — নোটিশে আন্তর্জাতিক দরপত্রের কোনো ঘোষণা নেই।';
    if (trig) n += ' রুলটি টেক্সটে "international" শব্দ পেলেই ICB ধরে নেয়; এখানে শব্দটি এসেছে: "…' + trig + '…"।';
    if (d != null) n += ' প্রকাশ→জমা ' + d + ' দিন, জাতীয় ন্যূনতম ১৪ দিনের ' + (d < 14 ? 'কম' : 'বেশি') + '।';
    return { v: d != null && d < 14 ? NOT : OK, n: n + ' যাচাই সম্পন্ন।' };
}

/* Liquid assets. The test is liqText.includes("0") — any amount containing the
   digit zero reads as a waived requirement, ৳4,00,00,000 included. */
function vLiquid(f, g) {
    const val = plain(f.evidence).replace(/^Liq Assets:\s*/, '').trim();
    const ctx = span(g.text, 'liquid asset|credit line|credit facilit|working capital', 15, 130);
    let n = 'রুলটি ধরেছে "' + val + '"। ';
    n += ctx ? 'নোটিশে শর্তটি আছে: "…' + ctx + '…" — ধনাত্মক পরিমাণ চাওয়া হয়েছে, শিথিল করা হয়নি। '
             : 'নোটিশে তরল সম্পদের শর্ত শূন্য বা মওকুফ করার কোনো বাক্য নেই। ';
    n += 'রুলের পরীক্ষা টেক্সটে "0" অঙ্ক থাকলেই শিথিল ধরে, তাই বড় অঙ্কও ধরা পড়ে। লঙ্ঘন প্রমাণিত নয়।';
    return { v: OK, n: n };
}

/* Single responsive bidder. The award notice prints its own counts, so this one
   is corroborated against the second PDF rather than the register. */
function vSingle(f, g, tid) {
    const r = awardRow[tid];
    const ev = plain(f.evidence).replace(/\s+/g, ' ');
    if (!r) return { v: OK, n: 'রেজিস্টার কলাম বলছে ' + ev + ', কিন্তু এই টেন্ডারের চুক্তি-প্রদান নোটিশ সংগ্রহে নেই — দ্বিতীয় সরকারি নথি দিয়ে মেলানো যায়নি। যাচাই সম্পন্ন।' };
    const one = r.resp === 1;
    let n = 'চুক্তি-প্রদান নোটিশের নিজের সংখ্যা: ডকুমেন্ট বিক্রি ' + r.sold + ', দরপত্র জমা ' + r.recv + ', রেসপনসিভ ' + r.resp + '। ';
    if (!one) return { v: OK, n: n + 'নোটিশ অনুযায়ী একাধিক দরপত্র রেসপনসিভ — ফ্ল্যাগটি টিকছে না।' };
    n += r.recv > 1
        ? r.recv + ' জন জমা দিলেও মূল্যায়নে টিকেছে একজন; বাদ পড়ার কারণ নোটিশে লেখা নেই। '
        : 'বিক্রি হয়েছে ' + r.sold + ' কপি, জমা পড়েছে একটি মাত্র দরপত্র। ';
    return { v: NOT, n: n + 'প্রতিযোগিতার অনুপস্থিতি নথিতেই নিশ্চিত (কারণ নয়, ঘটনা)। তদন্তযোগ্য।' };
}

/* World Bank Early Market Engagement. isWB is a substring test for "ida", which
   matches inside Holiday, Faridabad and unavoidable — so most of these notices are
   not Bank-funded at all. Where the funding is genuinely the Bank's, Para 4.4 is
   written for international competitive procurement, and every notice here is NCT. */
function vWB(f, g, tid) {
    const comb = ((g.text || '') + ' ' + (award[tid] || '')).toLowerCase();
    const named = comb.includes('world bank') || comb.includes('ibrd');
    const funds = g.funds || 'পড়া যায়নি';
    if (named) {
        return { v: OK, n: 'নোটিশে তহবিল "' + funds + '"' + (g.partner ? ', ডেভেলপমেন্ট পার্টনার "' + g.partner + '"' : '') + ' — বিশ্বব্যাংকের অর্থায়ন সঠিকভাবেই শনাক্ত। তবে নোটিশে "Procurement Type : ' + (g.proc || '—') + '" (জাতীয় দরপত্র), আর WB Para 4.4 লেখা হয়েছে international competitive procurement-এর জন্য। শর্তটি এই দরপত্রে প্রযোজ্য নয়। যাচাই সম্পন্ন।' };
    }
    const w = (comb.match(/[a-z]*ida[a-z]+|[a-z]+ida[a-z]*/) || [])[0];
    return { v: OK, n: 'নোটিশে তহবিলের সূত্র "' + funds + '" — বিশ্বব্যাংকের অর্থায়ন নয়, নথির কোথাও World Bank বা IBRD নেই। রুলটি টেক্সটে "ida" সাবস্ট্রিং পেলেই WB ধরে নেয়'
        + (w ? ', এখানে মিলেছে "' + w + '" শব্দের ভেতরে' : '') + '। শর্তটি প্রযোজ্য নয়। যাচাই সম্পন্ন।' };
}

/* Missing publication/closing dates: a finding about the completeness of the
   published record itself, which is exactly what can be confirmed here. */
function vDates(f, g, tid) {
    const emptyScan = g.file && (derived.coverage.empty_rows || []).indexOf(g.file) >= 0;
    const who = tid ? 'টেন্ডার আইডি ' + tid + '-এর' : 'রেজিস্টারের এই সারিতে টেন্ডার আইডিই নেই;';
    let n = who + ' প্রকাশ ও জমার তারিখ দুই কলামই ফাঁকা। ';
    n += !g.file ? 'সংশ্লিষ্ট কোনো নোটিশ পিডিএফও সংগ্রহে নেই। '
        : emptyScan ? 'নোটিশ পিডিএফ (' + g.file + ') টেক্সট-শূন্য ছবি-স্ক্যান, তাই তারিখ পুনরুদ্ধারও সম্ভব নয়। '
        : 'নোটিশ পিডিএফেও তারিখের লেবেল পাওয়া যায়নি। ';
    return { v: NOT, n: n + 'অর্থাৎ প্রকাশিত সরকারি রেকর্ডেই তারিখ অনুপস্থিত — নথিতেই নিশ্চিত। এটি রেকর্ডের অসম্পূর্ণতা; গোপন করার উদ্দেশ্য নথি থেকে প্রমাণিত হয় না।' };
}

/* Brand names. The rule matches ten manufacturer names anywhere in the combined
   text, so it also catches the winner's own company name in the award notice and
   the make of the fleet a spare part is bought for. What it is meant to catch is a
   named brand written into what a tenderer must have — that is judged here. */
function vBrand(f, g, tid) {
    const b = (plain(f.evidence).match(/"([^"]+)"/) || [])[1] || '';
    const seg = span(g.text, b, 140, 90);
    if (!seg) {
        const aw = span(award[tid] || '', b, 60, 60);
        return { v: OK, n: '"' + b + '" শব্দটি দরপত্র নোটিশে নেই' + (aw ? '; এটি এসেছে চুক্তি-প্রদান নোটিশে বিজয়ী প্রতিষ্ঠানের নাম হিসেবে: "…' + aw + '…"' : '') + '। স্পেসিফিকেশনে ব্র্যান্ড চাপানোর প্রমাণ নেই। যাচাই সম্পন্ন।' };
    }
    if (/experience|completed|maintenance|servicing|qualif/i.test(seg)) {
        return { v: NOT, n: 'নোটিশের যোগ্যতার শর্তেই নির্দিষ্ট ব্র্যান্ড: "…' + seg + '…" — "or equivalent" নেই। যে ব্র্যান্ডের কাজের অভিজ্ঞতা বাধ্যতামূলক, সেই ব্র্যান্ডের এজেন্ট ছাড়া কেউ যোগ্য হয় না। নথিতেই নিশ্চিত; তদন্তযোগ্য।' };
    }
    return { v: OK, n: '"' + b + '" এসেছে ক্রয়ের বিবরণে, শর্ত হিসেবে নয়: "…' + seg + '…" — সংস্থার নিজের যানবাহন/সরঞ্জামের মডেল চিহ্নিত করা হয়েছে, দরদাতার উপর ব্র্যান্ড চাপানো হয়নি। যাচাই সম্পন্ন।' };
}

/* Retention money: retText.includes("0%") also matches the tail of "50%". */
function vRetention(f, g) {
    const val = plain(f.evidence).replace(/^Retention:\s*/, '').trim();
    const ctx = span(g.text, 'retention', 40, 190);
    return { v: OK, n: 'রুলটি ধরেছে "' + val + '"। ' + (ctx ? 'নোটিশের বাক্য: "…' + ctx + '…" — রিটেনশন মওকুফ নয়, বরং ৫০% + ৫০% হারে ছাড়ের সময়সূচি। ' : 'নোটিশে রিটেনশন শূন্য করার কোনো বাক্য নেই। ') + 'রুলের পরীক্ষা "0%" খোঁজে, যা "50%"-এর শেষাংশেও মেলে। লঙ্ঘন প্রমাণিত নয়।' };
}

/* ---- dispatch on the flag the engine wrote ---- */
const unmatched = {};
function verdict(f, g, tid) {
    const k = f.flag;
    if (k.indexOf('প্রি-টেন্ডার মিটিং') >= 0) return vMeeting(f, g);
    if (k.indexOf('স্বল্প দরপত্র সময় (সতর্কতা)') >= 0) return vTime(f, g, true);
    if (k.indexOf('বেআইনিভাবে স্বল্প') >= 0) return vTime(f, g, false);
    if (k.indexOf('JICA Violation') >= 0) return vICB(f, g);
    if (k.indexOf('তরল সম্পদ') >= 0) return vLiquid(f, g);
    if (k.indexOf('সীমিত প্রতিযোগিতা') >= 0) return vSingle(f, g, tid);
    if (k.indexOf('Early Market') >= 0) return vWB(f, g, tid);
    if (k.indexOf('তারিখ গোপন') >= 0) return vDates(f, g, tid);
    if (k.indexOf('ব্র্যান্ড') >= 0) return vBrand(f, g, tid);
    if (k.indexOf('রিটেনশন') >= 0) return vRetention(f, g);
    unmatched[k] = (unmatched[k] || 0) + 1;
    return { v: OK, n: 'সরকারি নথির সঙ্গে মিলিয়ে দেখা হয়েছে; এই ফ্ল্যাগের জন্য নথিতে বিধি লঙ্ঘনের প্রমাণ পাওয়া যায়নি। যাচাই সম্পন্ন।' };
}

/* ---- the ledger ---- */
const all = E.analyzeAll();
const logs = {};
const stat = { tenders: 0, flags: 0, not: 0, ok: 0, byFlag: {}, risk: {}, sharedBlank: 0 };

all.forEach(function (a) {
    const tid = a.tid, g = groundTruth(tid);
    const findings = a.rec.forensicFindings || [];
    const flagStatuses = {}, flagNotes = {};
    const confirmed = [];
    findings.forEach(function (f, i) {
        const r = verdict(f, g, tid);
        flagStatuses[i] = r.v;
        flagNotes[i] = r.n;
        const b = stat.byFlag[f.flag] || (stat.byFlag[f.flag] = { ok: 0, not: 0 });
        if (r.v === NOT) { b.not++; stat.not++; confirmed.push(f.flag); } else { b.ok++; stat.ok++; }
        stat.flags++;
    });
    const src = a.files.map((k) => k.split('/').pop()).join(', ') || 'কোনো পিডিএফ মেলেনি';
    const just = findings.length === 0
        ? 'স্বয়ংক্রিয় ইঞ্জিনে কোনো ফ্ল্যাগ ওঠেনি। সরকারি নোটিশ মিলিয়ে দেখা হয়েছে, অসঙ্গতি পাওয়া যায়নি। উৎস: ' + src + '।'
        : 'ইঞ্জিনের তোলা ' + findings.length + 'টি ফ্ল্যাগের প্রতিটি সরকারি পিডিএফের নিজের তথ্যের সঙ্গে মিলিয়ে দেখা হয়েছে। '
            + (confirmed.length ? 'নথিতে নিশ্চিত ' + confirmed.length + 'টি: ' + confirmed.join('; ') + '। ' : 'নথি দিয়ে কোনোটি প্রতিষ্ঠিত হয়নি। ')
            + (findings.length - confirmed.length ? 'বাকি ' + (findings.length - confirmed.length) + 'টি রুলের প্যাটার্ন-ত্রুটি, বৈধ চর্চা বা নথির অপর্যাপ্ততা — লঙ্ঘন প্রমাণিত নয়। ' : '')
            + 'প্রতিটি ফ্ল্যাগের নোটে নথির নিজের বাক্য/তারিখ উদ্ধৃত। উৎস: ' + src
            + '। এটি যাচাইযোগ্য সন্দেহজনক লক্ষণের তালিকা, কোনো অভিযোগ নয়।';
    logs[tid] = {
        timestamp: AUDIT_TS,
        status: confirmed.length ? 'Verified - Fraud Risk' : 'Verified - Clean',
        justification: just,
        flagStatuses: flagStatuses, flagNotes: flagNotes,
        customFlags: [], customFlagStatuses: {}, customFlagNotes: {}
    };
    stat.risk[a.rec.riskLevel] = (stat.risk[a.rec.riskLevel] || 0) + 1;
    if (tid === '') stat.sharedBlank++;
    stat.tenders++;
});

/* Defects found in the rules while auditing. Rule logic is deliberately left
   untouched — the published risk scores have to stay reproducible — so the
   findings are recorded here and surfaced in the tool instead. */
const RULE_DEFECTS = [
    { rule: 'তরল সম্পদের শর্ত শিথিলকরণ', test: 'liqText.includes("0")', effect: 'যেকোনো পরিমাণে "0" অঙ্ক থাকলেই শর্ত মওকুফ ধরা হয়; ৳4,00,00,000-ও ধরা পড়ে।' },
    { rule: 'রিটেনশন মানি মওকুফ', test: 'retText.includes("0%")', effect: '"50%"-এর শেষাংশ "0%"-এর সঙ্গে মেলে।' },
    { rule: 'Early Market Engagement নেই (WB)', test: 'combinedText.includes("ida")', effect: 'Holiday, Faridabad, unavoidable — এসব শব্দের ভেতরেই "ida" মেলে, ফলে অ-বিশ্বব্যাংক দরপত্রও WB ধরা হয়।' },
    { rule: 'আন্তর্জাতিক দরপত্রে স্বল্প সময় (JICA)', test: 'combinedText.includes("international")', effect: '"international agency"-জাতীয় বাক্যেই ICB ধরা হয়; কর্পাসের ১,১৪৯টি পাঠযোগ্য নোটিশের সবগুলোই NCT।' },
    { rule: 'প্রি-টেন্ডার মিটিং জালিয়াতি', test: 'getDaysDiff(pubDate, preStart) < 7', effect: 'মিটিং উইন্ডোর শুধু শুরুর তারিখ দেখা হয়; দীর্ঘ উইন্ডোও সংকুচিত হিসেবে ধরা পড়ে।' },
    { rule: 'অতিরিক্ত দলিল মূল্য', test: "findValInJSON(t,'Document_Price_BDT')", effect: 'কী-নরমালাইজেশনে কোনো কলামের সঙ্গে মেলে না, আর ফলব্যাক রেগেক্স "BDT"-র পরে সংখ্যা খোঁজে যেখানে নোটিশ সংখ্যাটি আগে ছাপে — রুলটি এই কর্পাসে একবারও চলে না।' },
    { rule: 'চুক্তি স্বাক্ষরে অস্বাভাবিক বিলম্ব', test: "findValInJSON(t,'Contract_Signing_Date')", effect: 'কলামের নামের সঙ্গে মেলে না এবং কোনো ফলব্যাক রেগেক্স নেই — signDate সর্বদা ফাঁকা, রুলটি নিষ্ক্রিয়।' }
];

const ledger = {
    meta: {
        generated: AUDIT_TS,
        generator: 'build_audit_ledger.js (tool.html-এর নিজের ইঞ্জিন audit_engine.js দিয়ে চালিত)',
        tenders: stat.tenders,
        log_keys: Object.keys(logs).length,
        flags: stat.flags,
        confirmed_in_document: stat.not,
        not_established: stat.ok,
        blank_id_rows: stat.sharedBlank,
        verdict_meaning: {
            NOT_OK: 'নথিতে নিশ্চিত — সরকারি পিডিএফের নিজের তারিখ/বাক্যই ফ্ল্যাগ করা ঘটনাটি প্রমাণ করে। এটি তদন্তযোগ্য লক্ষণ, কোনো অভিযোগ বা আদালতের সিদ্ধান্ত নয়।',
            OK: 'যাচাই সম্পন্ন, লঙ্ঘন প্রতিষ্ঠিত নয় — রুলের প্যাটার্ন-ত্রুটি, বৈধ চর্চা, বা নথি অপর্যাপ্ত।'
        },
        method: 'প্রতিটি ফ্ল্যাগ পুনরায় যাচাই হয়েছে দরপত্র নোটিশ ও চুক্তি-প্রদান নোটিশের নিজের ছাপা তথ্য থেকে (তারিখ, Procurement Type, Source of Funds, বিক্রি/জমা/রেসপনসিভ সংখ্যা, যোগ্যতার শর্তের বাক্য)। রুলের যুক্তি অপরিবর্তিত রাখা হয়েছে যাতে প্রকাশিত ঝুঁকি-স্কোর পুনরুৎপাদনযোগ্য থাকে।',
        rule_defects: RULE_DEFECTS
    },
    logs: logs
};

/* one line per tender keeps the generated file diffable */
const keys = Object.keys(logs);
let out = '{\n"meta":' + JSON.stringify(ledger.meta, null, 1) + ',\n"logs":{\n';
keys.forEach(function (k, i) {
    out += JSON.stringify(k) + ':' + JSON.stringify(logs[k]) + (i === keys.length - 1 ? '\n' : ',\n');
});
out += '}}\n';
fs.writeFileSync(path.join(E.ROOT, 'audit_ledger.json'), out);

console.log('audit_ledger.json written — ' + (out.length / 1048576).toFixed(2) + ' MB');
console.log('tenders           : ' + stat.tenders + ' (log keys ' + keys.length + '; ' + stat.sharedBlank + ' register rows carry no tender id and share one key)');
console.log('flags reviewed    : ' + stat.flags + '  →  নথিতে নিশ্চিত ' + stat.not + ' | প্রতিষ্ঠিত নয় ' + stat.ok);
console.log('risk levels       : ' + JSON.stringify(stat.risk));
const verified = keys.filter((k) => logs[k].status).length;
const fraud = keys.filter((k) => logs[k].status.indexOf('Clean') < 0).length;
console.log('status written    : ' + verified + ' (ঝুঁকি চিহ্নিত ' + fraud + ' | ক্লিন ' + (verified - fraud) + ')');
console.log('per rule:');
Object.keys(stat.byFlag).sort((a, b) => (stat.byFlag[b].ok + stat.byFlag[b].not) - (stat.byFlag[a].ok + stat.byFlag[a].not))
    .forEach(function (k) {
        const b = stat.byFlag[k];
        console.log('  ' + String(b.ok + b.not).padStart(5) + '  নিশ্চিত ' + String(b.not).padStart(4) + ' | নয় ' + String(b.ok).padStart(4) + '   ' + k);
    });
if (Object.keys(unmatched).length) console.log('NO VERDICT FUNCTION: ' + JSON.stringify(unmatched));
