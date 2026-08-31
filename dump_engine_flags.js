/* Dump tool.html's own forensic findings, one JSON object per tender.
 *
 * build_violations_csv.py needs the engine's verdicts, but the engine is
 * browser JavaScript embedded in tool.html. audit_engine.js already knows how
 * to run it headlessly; this file only serialises the result so Python can
 * read it. Every field here is the engine's own wording — nothing is
 * reinterpreted, so a flag in the CSV is the same flag a reader sees in the
 * tool and the same flag audit_ledger.json carries a verdict against.
 *
 * Usage: node dump_engine_flags.js > engine_flags.json
 */
'use strict';
const { analyzeAll } = require('./audit_engine.js');

const all = analyzeAll();
const out = {};

all.forEach(function (a) {
    const rec = a.rec || {};
    const findings = (rec.forensicFindings || []).map(function (f, i) {
        return {
            idx: i,                              // the ledger keys verdicts by this index
            flag: f.flag || '',
            risk: f.risk || '',
            evidence: f.evidence || '',
            violation_logic: f.violation_logic || '',
            rule_detail: f.rule_detail || '',
            rule: f.rule || '',
            clause: f.clause || '',
            targetField: f.targetField || ''
        };
    });
    /* Several register rows share a blank or duplicated tender id; keep the
       first and record the collision rather than silently overwriting. */
    const key = a.tid || ('_noid_' + Object.keys(out).length);
    if (out[key]) {
        out[key].duplicate_rows = (out[key].duplicate_rows || 1) + 1;
        return;
    }
    out[key] = {
        tender_id: a.tid,
        files: a.files,
        risk_level: rec.riskLevel || '',
        risk_score: rec.riskScore != null ? rec.riskScore : '',
        findings: findings
    };
});

process.stdout.write(JSON.stringify(out));
