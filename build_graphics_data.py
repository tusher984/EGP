#!/usr/bin/env python3
"""Emit graphics/netra-graphics-data.js — the data payload for the standalone chart bundle.

Everything here is read from article_data.json (itself generated from
Procurement_Database.json by enrich_article_data.py), so the graphics bundle can
never drift from the published figures: re-run this and verify_figures.py agrees.

The one thing that is NOT in article_data.json is the officer-level aggregation,
which the article computes from the Authorised_Officer field. Those figures are
transcribed here from story.html's OFF block, which is the same computation, and
are marked as such so a reader can find where they came from.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'graphics', 'netra-graphics-data.js')


def r(v, d=2):
    """Round for transport. Charts do not need float noise, and it halves the payload."""
    return round(float(v), d)


# ---------------------------------------------------------------- Bangla labels
ORG_BN = {'RAJUK': 'রাজউক', 'CDA': 'সিডিএ', 'KDA': 'কেডিএ', 'RDA': 'আরডিএ',
          'CoxDA': 'কক্সডিএ', 'Local Govern': 'স্থানীয় সরকার'}
DIST_BN = {'Dhaka': 'ঢাকা', 'Chattogram': 'চট্টগ্রাম', "Cox's Bazar": 'কক্সবাজার',
           'Khulna': 'খুলনা', 'Rajshahi': 'রাজশাহী', 'Gazipur': 'গাজীপুর',
           'Dinajpur': 'দিনাজপুর', 'Comilla': 'কুমিল্লা', 'Barisal': 'বরিশাল',
           'Pabna': 'পাবনা', 'Satkhira': 'সাতক্ষীরা'}
STAGE_BN = {'Documents sold': 'দস্তাবেজ বিক্রি', 'Bids received': 'জমা পড়া দর',
            'Bids ruled responsive': 'রেসপনসিভ ঘোষিত দর',
            'Contracts awarded': 'কার্যাদেশ পাওয়া চুক্তি'}

# A schematic grid, not a projection. Columns run roughly west to east, rows
# north to south, and every tile is labelled with its district name — so the
# arrangement carries the spatial pattern without asserting a boundary we have
# no data for. Only the districts that appear in the record get a tile.
DIST_GRID = {'Dinajpur': (1, 1), 'Rajshahi': (1, 4), 'Pabna': (2, 4),
             'Gazipur': (4, 3), 'Dhaka': (4, 4), 'Comilla': (5, 5),
             'Satkhira': (1, 6), 'Khulna': (2, 6), 'Barisal': (3, 6),
             'Chattogram': (5, 6), "Cox's Bazar": (5, 7)}


def main():
    with open(os.path.join(ROOT, 'article_data.json'), encoding='utf-8') as f:
        D = json.load(f)
    h, con, cliff = D['headline'], D['concentration'], D['cliff']

    # The portal files Chattogram under two spellings. The article keeps them
    # distinct and says so; a map cannot — two tiles for one place would assert
    # a district that does not exist — so here they are summed, and the source
    # line on the map says the merge happened.
    dist = {}
    for x in D['districts']:
        k = 'Chattogram' if x['d'] in ('Chattogram', 'Chittagong') else x['d']
        e = dist.setdefault(k, {'d': k, 'n': 0, 'crore': 0.0})
        e['n'] += x['n']
        e['crore'] += x['crore']
    dist = sorted(dist.values(), key=lambda x: -x['crore'])

    named = con['treemap'][:14]
    named_crore = sum(x['crore'] for x in named)
    named_n = sum(x['contracts'] for x in named)

    # Where the source PDFs live. Each case carries its notice (`n`) and award (`a`)
    # filename; the bundle builds a link as pdfBase + dir + '/' + filename, exactly
    # as the full story does. pdfBase defaults to the published copies so the links
    # resolve even when the bundle is dropped into another site; a host can override
    # it with data-ntrg-pdf-base="…/" on the .ntrg root.
    cm = D.get('case_meta', {})
    notice_dir = cm.get('notice_dir', 'Tender Notice_PDFs')
    award_dir = cm.get('award_dir', 'Contract_Awards_PDFs')
    pdf_base = 'https://tusher984.github.io/EGP/'

    out = {
        'meta': {
            'verified': '2026-08-30',
            'source': {'en': 'Bangladesh e-GP tender notices and contract-award records',
                       'bn': 'বাংলাদেশ ই-জিপি দরপত্র বিজ্ঞপ্তি ও কার্যাদেশ নথি'},
            'orgBn': ORG_BN, 'distBn': DIST_BN, 'stageBn': STAGE_BN,
            'noticeDir': notice_dir, 'awardDir': award_dir, 'pdfBase': pdf_base,
        },
        'headline': {k: h[k] for k in h},
        'funnel': [{'k': x['stage'], 'v': int(x['v'])} for x in D['funnel']],
        'authorities': [{'org': x['org'], 'n': x['n'], 'awarded': x['awarded'],
                         'single': x['single'], 'singlePct': r(x['single_pct'], 1),
                         'recvPer': r(x['recv_per'], 2), 'respPer': r(x['resp_per'], 2),
                         'crore': r(x['crore'], 1)}
                        for x in sorted(D['authorities'], key=lambda a: -a['single_pct'])],
        'contractorValue': {
            'named': [{'name': x['name'], 'crore': r(x['crore'], 2), 'n': x['contracts']}
                      for x in named],
            'other': {'crore': r(con['total_crore'] - named_crore, 2),
                      'n': con['total_contracts'] - named_n,
                      'firms': con['suppliers'] - len(named)},
            'totalCrore': r(con['total_crore'], 1), 'totalN': con['total_contracts'],
        },
        'contractorCount': [{'name': x['name'], 'n': x['contracts'], 'crore': r(x['crore'], 2)}
                            for x in D['top_suppliers'][:15]],
        'lorenz': [[r(p['pct_sup'], 3), r(p['share'], 2)] for p in con['lorenz']],
        'dumbbell': [{'name': x['name'], 'cPct': r(x['c_pct'], 2), 'vPct': r(x['v_pct'], 2),
                      'n': x['contracts'], 'crore': r(x['crore'], 2)}
                     for x in con['dumbbell'][:12]],
        'concentration': {'hhi': r(con['hhi'], 1), 'top1': r(con['top1_pct'], 1),
                          'top4': r(con['top4_pct'], 1), 'top10': r(con['top10_pct'], 1),
                          'suppliers': con['suppliers'], 'dedup': 308},
        'scatter': [[int(p['recv']), int(p['resp']), p['org'], p['id'], r(p['crore'], 2)]
                    for p in D['scatter']],
        'cliff': {'curve': [[c['day'], c['n']] for c in cliff['curve']],
                  'at28': cliff['at28'], 'at28Pct': r(cliff['at28_pct'], 1),
                  'voidLo': cliff['void_lo'], 'voidHi': cliff['void_hi'],
                  'voidN': cliff['void_n'], 'beyond42': cliff['beyond42_total'],
                  'median': D['delay']['median'], 'over28': D['delay']['over28'],
                  'max': D['delay']['max'], 'n': cliff['n']},
        'cliffByOrg': [{'org': x['org'], 'at28': x['at28'], 'total': x['total'],
                        'pct': r(x['pct'], 1)} for x in cliff['by_org']],
        'years': [{'y': x['y'], 'n': x['n'], 'crore': r(x['crore'], 1)} for x in D['years']],
        'districts': [{'d': x['d'], 'n': x['n'], 'crore': r(x['crore'], 1)} for x in dist],
        'districtGrid': {k: list(v) for k, v in DIST_GRID.items()},
        'matrix': {'rows': [x['pe'] for x in D['matrix']['rows']],
                   'rowTotals': [x['total'] for x in D['matrix']['rows']],
                   'cols': [x['sup'] for x in D['matrix']['cols']],
                   'colTotals': [x['total'] for x in D['matrix']['cols']],
                   'grid': [[c['n'] for c in g['cells']] for g in D['matrix']['grid']],
                   'max': D['matrix']['max']},
        'peCapture': [{'pe': x['pe'], 'total': x['total'], 'sup': x['topsup'],
                       'n': x['n'], 'pct': r(x['pct'], 1)} for x in D['pe_capture']],
        'repeatPairs': [{'pe': x['pe'], 'sup': x['supplier'], 'n': x['n'],
                         'crore': r(x['crore'], 2)} for x in D['repeat_pairs'][:14]],
        'elimination': {'n': D['elimination']['n'], 'n5': D['elimination']['n5'],
                        'cases': [{'id': c['id'], 'org': c['org'], 'recv': int(c['recv']),
                                   'sup': c['sup'][:56], 'crore': r(c['crore'], 2)}
                                  for c in sorted(D['elimination']['cases'],
                                                  key=lambda c: -c['recv'])[:12]]},
        'docprice': {'n': D['docprice']['n'], 'median': D['docprice']['median'],
                     'max': D['docprice']['max'],
                     'hist': [[x['bin'], x['n']] for x in D['docprice']['hist']]},
        'cases': [[c['id'], c['org'], c['sup'][:60], r(c['crore'], 2), c['recv'],
                   c['resp'], c['delay'], c['risk'], c.get('n', ''), c.get('a', '')]
                  for c in D['cases']],
        # Officer aggregation: computed by the article from Authorised_Officer,
        # not present in article_data.json. Transcribed from story.html's OFF block.
        'officers': {
            'nOfficers': 73, 'nUnits': 11, 'strictN': 149, 'strictBase': 591,
            'capture': [
                {'off': 'Md. Arman Hossain', 'auth': 'KDA', 'n': 2, 'crore': 143.8, 'share': 100, 'sup': 'Ataur Rahman Khan Ltd & Mahabub Brothers (Pvt) Ltd JV'},
                {'off': 'Rajib Das', 'auth': 'CDA', 'n': 3, 'crore': 891.3, 'share': 99, 'sup': 'Spectra Engineers Ltd.'},
                {'off': 'Asad Bin Anwar', 'auth': 'CDA', 'n': 2, 'crore': 84.3, 'share': 94, 'sup': 'Spectra Engineers Ltd.'},
                {'off': 'Md. Julfiker Ali Khan', 'auth': 'RAJUK', 'n': 3, 'crore': 0.6, 'share': 92, 'sup': 'M/S Sunny Construction'},
                {'off': 'Md. Anwar Hussain', 'auth': 'RDA', 'n': 6, 'crore': 33.6, 'share': 87, 'sup': 'The Engineers & Architects Limited'},
                {'off': 'Mohammad Abu Issa Anshary', 'auth': 'CDA', 'n': 2, 'crore': 1.2, 'share': 87, 'sup': 'The Decode Ltd.'},
                {'off': 'A. A. M. Habibur Rahman', 'auth': 'CDA', 'n': 4, 'crore': 57.5, 'share': 86, 'sup': 'The Engineers & Architects Limited'},
                {'off': 'Kazi Hasan Bin Shams', 'auth': 'CDA', 'n': 2, 'crore': 112.2, 'share': 86, 'sup': 'Spectra Engineers Ltd.'},
            ],
            'broad': [
                {'off': 'Mohammad Muzaffar Uddin', 'auth': 'RAJUK', 'n': 43, 'crore': 189.1, 'sups': 33},
                {'off': 'Md. Anwar Hossain', 'auth': 'RAJUK', 'n': 32, 'crore': 183.0, 'share': 51},
                {'off': 'Rahat Muslemin', 'auth': 'RAJUK', 'n': 24, 'crore': 159.2, 'share': 52},
                {'off': 'Lt Col Anwar Ul Islam', 'auth': 'CoxDA', 'n': 14, 'crore': 229.0},
                {'off': 'Mortoza Al Mamun', 'auth': 'KDA', 'n': 6, 'crore': 258.9},
            ],
        },
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    body = json.dumps(out, ensure_ascii=False, separators=(',', ':'), sort_keys=False)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('/* Generated by build_graphics_data.py from article_data.json. Do not edit by hand.\n'
                '   Every figure in netra-graphics.js reads from this object, so the standalone\n'
                '   bundle and the published article are guaranteed to show the same numbers. */\n')
        f.write('window.NTRG_DATA = ' + body + ';\n')
    print('wrote %s  (%.1f KB)' % (OUT, os.path.getsize(OUT) / 1024.0))
    print('  districts after merging the two Chattogram spellings: %d' % len(dist))
    print('  named contractors %d + aggregate of %d firms = %s crore'
          % (len(named), out['contractorValue']['other']['firms'],
             r(named_crore + out['contractorValue']['other']['crore'], 1)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
