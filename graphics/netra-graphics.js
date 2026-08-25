/* netra-graphics.js — standalone, dependency-free renderers for the e-GP investigation.
   ==================================================================================

   WHAT IT DOES
   Finds every <figure data-ntrg="NAME"> on the page and draws NAME into it, using
   the numbers in window.NTRG_DATA (from netra-graphics-data.js) and the styles in
   netra-graphics.css. No libraries, no build step, no network.

   USAGE
     <div class="ntrg">
       <figure data-ntrg="stat-tiles"></figure>
       <figure data-ntrg="cliff"></figure>
       …
     </div>
     <script src="netra-graphics-data.js"></script>
     <script src="netra-graphics.js"></script>

   Each figure fills itself in with title, deck, legend, plot and source — the only
   parts the house rules allow. Titles/decks/sources ship in English and Bangla; set
   lang="bn" on the wrapper (or any ancestor) for the Bangla edition. Override any of
   them per-figure with data-title / data-dek / data-src. Add data-mode="count" (or
   "value") where a figure offers both.

   WHY THE VIEWBOX IS REBUILT FROM PIXEL WIDTH
   The SVG viewBox is set to the container's measured pixel width on every render, so
   one SVG unit equals one CSS pixel and label text is never scaled by the browser —
   it stays at the size the stylesheet asks for at any container width. A debounced
   ResizeObserver redraws when the width changes meaningfully.

   ACCESSIBILITY
   The plot carries role="img" with a one-line aria-label, and every figure also emits
   a visually-hidden data table (.ntrg-sr) carrying the full numbers — so a screen
   reader gets the summary and the detail with zero visual chrome. The pointer tooltip
   is a sighted-user enhancement layered on top.
*/
(function () {
  'use strict';
  var D = window.NTRG_DATA;
  if (!D) { return; }

  /* ============================================================ i18n & format */
  var BN = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  var TK = '৳';
  var NNBSP = ' ';   /* narrow no-break space: keeps ৳ from reading as an 8 */

  function bnDigits(s) { return String(s).replace(/[0-9]/g, function (d) { return BN[+d]; }); }

  /* Integer with thousands separators, digits localised. */
  function nf(n, lang) {
    var s = Math.round(+n).toLocaleString('en-US');
    return lang === 'bn' ? bnDigits(s) : s;
  }
  /* One-decimal number (crore figures are quoted to a tenth). */
  function nf1(n, lang) {
    var s = (Math.round(+n * 10) / 10).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return lang === 'bn' ? bnDigits(s) : s;
  }
  function pct(n, lang) { return nf1(n, lang) + '%'; }
  /* A crore amount with the taka sign and the narrow gap that stops ৳ reading as 8. */
  function crore(n, lang) {
    var num = (+n >= 100) ? nf(Math.round(+n), lang) : nf1(n, lang);
    return TK + NNBSP + num + (lang === 'bn' ? ' কোটি' : ' cr');
  }
  function t(en, bn, lang) { return lang === 'bn' && bn != null ? bn : en; }

  /* ============================================================ DOM & SVG */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  /* Round to one decimal for SVG coordinates — trims payload without visible error. */
  function q(n) { return Math.round(n * 10) / 10; }

  function tag(name, attrs, inner) {
    var s = '<' + name;
    for (var k in attrs) {
      if (attrs[k] == null || attrs[k] === false) { continue; }
      s += ' ' + k + '="' + esc(attrs[k]) + '"';
    }
    s += '>';
    if (inner != null) { s += inner; }
    s += '</' + name + '>';
    return s;
  }
  function rect(x, y, w, h, cls, tip) {
    return tag('rect', { x: q(x), y: q(y), width: q(Math.max(0, w)), height: q(Math.max(0, h)), 'class': cls, 'data-tip': tip });
  }
  /* Source-PDF links. Each case row carries a notice and an award filename; the
     link is pdfBase + encoded(dir/file), opened in a new tab — the same scheme the
     full story uses so the evidence is one click from every row. pdfBase defaults
     to the published copies (from the data payload) and a host can override it with
     data-ntrg-pdf-base="https://…/" on the .ntrg root when it mirrors the PDFs. */
  function encPath(p) { return p.split('/').map(encodeURIComponent).join('/'); }
  function pdfBase() {
    var el = document.querySelector('[data-ntrg-pdf-base]');
    var b = (el && el.getAttribute('data-ntrg-pdf-base')) || (D.meta && D.meta.pdfBase) || '';
    return b && b.slice(-1) !== '/' ? b + '/' : b;
  }
  function pdfLink(dir, file, label) {
    if (!file || !dir) { return tag('span', { 'class': 'ntrg-pdf ntrg-pdf--na' }, '—'); }
    return tag('a', { 'class': 'ntrg-pdf', href: pdfBase() + encPath(dir + '/' + file), target: '_blank', rel: 'noopener' }, esc(label));
  }
  function line(x1, y1, x2, y2, cls) {
    return '<line x1="' + q(x1) + '" y1="' + q(y1) + '" x2="' + q(x2) + '" y2="' + q(y2) + '" class="' + cls + '"/>';
  }
  function txt(x, y, s, cls, extra) {
    return tag('text', mix({ x: q(x), y: q(y), 'class': cls }, extra), esc(s));
  }
  function mix(a, b) { if (b) { for (var k in b) { a[k] = b[k]; } } return a; }
  /* Clip a category label to a pixel gutter so a long name can never spill past the
     plot's left edge (the full name always survives in the tooltip and sr-table).
     No canvas here, so width is estimated from the glyph advance of the UI face. */
  function clipLabel(s, px, fpx) {
    var per = (fpx || 11.5) * 0.56, max = Math.max(3, Math.floor(px / per));
    return s.length > max ? s.slice(0, max - 1).replace(/[\s\-–—]+$/, '') + '…' : s;
  }

  /* ============================================================ tooltip
     One element, reused everywhere, positioned in viewport coordinates so no plot
     can clip it. Marks carry data-tip="Title||body line||body line"; the plot
     delegates pointer events to this. */
  var TIP = null;
  function tipEl() {
    if (!TIP) {
      TIP = document.createElement('div');
      TIP.className = 'ntrg-tip';
      TIP.setAttribute('role', 'status');
      document.body.appendChild(TIP);
    }
    return TIP;
  }
  function tipShow(html, x, y) {
    var e = tipEl();
    e.innerHTML = html;
    e.setAttribute('data-on', '1');
    var w = e.offsetWidth, h = e.offsetHeight, pad = 12;
    var left = x + 14, top = y + 14;
    if (left + w + pad > window.innerWidth) { left = x - w - 14; }
    if (left < pad) { left = pad; }
    if (top + h + pad > window.innerHeight) { top = y - h - 14; }
    if (top < pad) { top = pad; }
    e.style.left = left + 'px';
    e.style.top = top + 'px';
  }
  function tipHide() { if (TIP) { TIP.removeAttribute('data-on'); } }
  function tipHTML(raw) {
    var parts = String(raw).split('||');
    return tag('b', null, esc(parts[0])) + parts.slice(1).map(function (p) {
      return esc(p).replace(/\{([^}]*)\}/g, function (_, v) { return '<i>' + v + '</i>'; });
    }).join('<br>');
  }
  function bindTips(host) {
    function move(ev) {
      var pt = ev.touches ? ev.touches[0] : ev;
      var m = document.elementFromPoint(pt.clientX, pt.clientY);
      var hit = m && m.closest ? m.closest('[data-tip]') : null;
      if (hit && host.contains(hit)) { tipShow(tipHTML(hit.getAttribute('data-tip')), pt.clientX, pt.clientY); }
      else { tipHide(); }
    }
    host.addEventListener('mousemove', move);
    host.addEventListener('mouseleave', tipHide);
    host.addEventListener('touchstart', move, { passive: true });
    host.addEventListener('touchmove', move, { passive: true });
    host.addEventListener('touchend', tipHide);
  }

  /* ============================================================ scales */
  function niceMax(v) {
    if (v <= 0) { return 1; }
    var e = Math.pow(10, Math.floor(Math.log10(v))), f = v / e;
    var n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return n * e;
  }
  function ticks(max, step) {
    var out = [], i = 0;
    for (; i <= max + 1e-9; i += step) { out.push(Math.round(i * 100) / 100); }
    return out;
  }

  /* ============================================================ svg wrapper
     Builds the <svg> with a pixel-locked viewBox and the standard role/label, and
     wires the tooltip once the node is live. W is the measured container width; H
     is whatever the renderer computed. */
  function svg(W, H, body, aria) {
    return tag('svg', {
      'class': 'ntrg-svg', viewBox: '0 0 ' + q(W) + ' ' + q(H),
      width: '100%', height: q(H), preserveAspectRatio: 'xMinYMin meet',
      role: 'img', 'aria-label': aria, focusable: 'false'
    }, body);
  }

  /* ============================================================ source line
     Every figure ends with the same provenance, plus any figure-specific caveat. */
  function srcLine(lang, note) {
    var base = t('Source: ', 'সূত্র: ', lang) +
      t(D.meta.source.en, D.meta.source.bn, lang) + '. ' +
      t('Verified ', 'যাচাই ', lang) + nf(2026, lang).replace(/,/g, '') + (lang === 'bn' ? '-০৮-২৩।' : '-08-23.');
    return note ? base + ' ' + note : base;
  }

  /* ============================================================ content
     Titles, decks and figure-specific source caveats, EN + BN. The house rule is
     title → deck → legend → plot → source, so this is the whole of the prose a
     figure carries. Framing stays "red flags warranting scrutiny", never accusation.
     Override any of them per-figure with data-title / data-dek / data-src. */
  function T(en, bn) { return { en: en, bn: bn }; }
  var TXT = {
    'stat-tiles': {
      title: T('The record, in eight numbers',
        'আট সংখ্যায় নথিটি'),
      dek: T('Every figure below is drawn from the published tender notices and contract-award records — counts, not allegations.',
        'নিচের প্রতিটি সংখ্যা প্রকাশিত দরপত্র বিজ্ঞপ্তি ও কার্যাদেশ নথি থেকে নেওয়া — গণনা, অভিযোগ নয়।')
    },
    'funnel': {
      title: T('From documents sold to contracts awarded',
        'দস্তাবেজ বিক্রি থেকে কার্যাদেশ পর্যন্ত'),
      dek: T('Where the field of bidders narrows at each stage of the 591 tenders that carry bid counts.',
        'বিড সংখ্যাসহ ৫৯১টি দরপত্রের প্রতিটি ধাপে দরদাতার সংখ্যা যেখানে সংকুচিত হয়।')
    },
    'authorities': {
      title: T('Single-responsive share, by authority',
        'কর্তৃপক্ষভেদে একক-রেসপনসিভ হার'),
      dek: T('The share of each authority’s tenders that ended with exactly one responsive bid. A high share is a flag warranting scrutiny, not proof of wrongdoing.',
        'প্রতিটি কর্তৃপক্ষের যে অংশের দরপত্র ঠিক একটিমাত্র রেসপনসিভ দরে শেষ হয়েছে। উচ্চ হার যাচাইযোগ্য একটি সতর্কচিহ্ন, অপরাধের প্রমাণ নয়।')
    },
    'contractor-value': {
      title: T('Award value concentrates in a handful of firms',
        'কার্যাদেশের অর্থমূল্য কয়েকটি প্রতিষ্ঠানে কেন্দ্রীভূত'),
      dek: T('The fourteen firms with the largest award value, against every other supplier combined.',
        'সর্বোচ্চ কার্যাদেশ-মূল্যের চৌদ্দটি প্রতিষ্ঠান, বাকি সব সরবরাহকারীর সম্মিলিত মূল্যের বিপরীতে।')
    },
    'contractor-count': {
      title: T('The most frequent award winners',
        'সবচেয়ে ঘন ঘন কার্যাদেশ পাওয়া প্রতিষ্ঠান'),
      dek: T('Firms ranked by how many contracts they were awarded across the record.',
        'নথিজুড়ে কতগুলো চুক্তি পেয়েছে তার ভিত্তিতে সাজানো প্রতিষ্ঠানসমূহ।')
    },
    'lorenz': {
      title: T('How unequally award value is shared',
        'কার্যাদেশ-মূল্য কতটা অসমভাবে বণ্টিত'),
      dek: T('The cumulative share of value against the cumulative share of suppliers. The further the curve bows from the diagonal, the more concentrated the market.',
        'সরবরাহকারীর ক্রমযোজিত অংশের বিপরীতে মূল্যের ক্রমযোজিত অংশ। রেখা কর্ণ থেকে যত দূরে বাঁকে, বাজার তত বেশি কেন্দ্রীভূত।')
    },
    'dumbbell': {
      title: T('A small count of contracts, a large share of value',
        'অল্প সংখ্যক চুক্তি, মূল্যের বড় অংশ'),
      dek: T('For the top firms, the gap between their share of contracts and their share of value.',
        'শীর্ষ প্রতিষ্ঠানগুলোর জন্য, চুক্তির অংশ ও মূল্যের অংশের মধ্যে ব্যবধান।')
    },
    'scatter': {
      title: T('Bids received against bids ruled responsive',
        'জমা পড়া দর বনাম রেসপনসিভ ঘোষিত দর'),
      dek: T('Each point is one tender. Points on the lowest row ended with a single responsive bidder however many bids arrived — a flag warranting scrutiny.',
        'প্রতিটি বিন্দু একটি দরপত্র। সর্বনিম্ন সারির বিন্দুগুলো যত দরই জমা পড়ুক, একটিমাত্র রেসপনসিভ দরদাতায় শেষ হয়েছে — একটি যাচাইযোগ্য সতর্কচিহ্ন।')
    },
    'cliff': {
      title: T('Awards cluster on the last allowed day',
        'শেষ অনুমোদিত দিনে কার্যাদেশের ভিড়'),
      dek: T('Days from tender close to contract award. A spike at day 28 — the statutory ceiling — is a flag warranting scrutiny.',
        'দরপত্র বন্ধ থেকে কার্যাদেশ পর্যন্ত দিনের সংখ্যা। ২৮তম দিনে — বিধিবদ্ধ সর্বোচ্চ সীমা — একটি চূড়া যাচাইযোগ্য সতর্কচিহ্ন।')
    },
    'cliff-by-org': {
      title: T('The day-28 cluster is not evenly spread',
        '২৮-দিনের ভিড় সমভাবে বণ্টিত নয়'),
      dek: T('The share of each authority’s awards that landed exactly on day 28.',
        'প্রতিটি কর্তৃপক্ষের যে অংশের কার্যাদেশ ঠিক ২৮তম দিনে পড়েছে।')
    },
    'years': {
      title: T('Award value by year',
        'বছরভিত্তিক কার্যাদেশ-মূল্য'),
      dek: T('Total award value recorded in each year of the data.',
        'তথ্যের প্রতিটি বছরে নথিভুক্ত মোট কার্যাদেশ-মূল্য।')
    },
    'districts': {
      title: T('Where the value went, by district',
        'জেলাভেদে মূল্য কোথায় গেল'),
      dek: T('Award value by district. Two portal spellings of Chattogram are summed here.',
        'জেলাভেদে কার্যাদেশ-মূল্য। চট্টগ্রামের দুটি পোর্টাল-বানান এখানে যোগ করা হয়েছে।')
    },
    'cartogram': {
      title: T('The same pattern, arranged in space',
        'একই প্যাটার্ন, স্থানিকভাবে সাজানো'),
      dek: T('A schematic grid, not a map. Each tile is a district, shaded by award value and labelled by name.',
        'একটি পরিকল্পিত গ্রিড, মানচিত্র নয়। প্রতিটি টাইল একটি জেলা, কার্যাদেশ-মূল্য অনুসারে ছায়াঙ্কিত ও নামাঙ্কিত।')
    },
    'matrix': {
      title: T('Buyer–supplier pairs that recur',
        'পুনরাবৃত্ত ক্রেতা–সরবরাহকারী জোড়া'),
      dek: T('Contract counts for the procuring entities and suppliers that meet most often. A dark cell is a recurring pair — a flag warranting scrutiny.',
        'সবচেয়ে বেশি বার মিলিত ক্রয়কারী সংস্থা ও সরবরাহকারীর চুক্তি সংখ্যা। গাঢ় ঘর একটি পুনরাবৃত্ত জোড়া — একটি যাচাইযোগ্য সতর্কচিহ্ন।')
    },
    'pe-capture': {
      title: T('One supplier’s share of a single unit’s awards',
        'একক ইউনিটের কার্যাদেশে এক সরবরাহকারীর অংশ'),
      dek: T('For procuring units where one firm took an outsized share, that firm’s percentage of the unit’s awards.',
        'যেসব ক্রয়কারী ইউনিটে একটি প্রতিষ্ঠান অসামঞ্জস্যপূর্ণ অংশ নিয়েছে, সেই ইউনিটের কার্যাদেশে ওই প্রতিষ্ঠানের শতকরা হার।')
    },
    'officers': {
      title: T('Authorising officers whose awards concentrate on one firm',
        'যেসব অনুমোদনকারী কর্মকর্তার কার্যাদেশ এক প্রতিষ্ঠানে কেন্দ্রীভূত'),
      dek: T('Officers named in the record whose approved awards went overwhelmingly to a single supplier. Named because the public record names them; a flag warranting scrutiny, not a finding of guilt.',
        'নথিতে নামোল্লিখিত কর্মকর্তা যাঁদের অনুমোদিত কার্যাদেশ প্রধানত একটি সরবরাহকারীর কাছে গেছে। সরকারি নথি নাম উল্লেখ করেছে বলেই নাম দেওয়া; একটি যাচাইযোগ্য সতর্কচিহ্ন, দোষী সাব্যস্ত নয়।')
    },
    'elimination': {
      title: T('Many bidders, one survivor',
        'বহু দরদাতা, একজন টিকে'),
      dek: T('Tenders where numerous bids arrived but only one was ruled responsive — ranked by how many were received.',
        'যেসব দরপত্রে বহু দর জমা পড়েছে কিন্তু মাত্র একটি রেসপনসিভ ঘোষিত হয়েছে — কতগুলো জমা পড়েছে তার ক্রমে সাজানো।')
    },
    'docprice': {
      title: T('What the tender documents cost',
        'দরপত্র দস্তাবেজের দাম'),
      dek: T('The distribution of document prices across tenders.',
        'দরপত্রজুড়ে দস্তাবেজ-মূল্যের বণ্টন।')
    },
    'cases': {
      title: T('Every award, searchable',
        'প্রতিটি কার্যাদেশ, অনুসন্ধানযোগ্য'),
      dek: T('The full award record. Filter by authority or by whether the tender is flagged for scrutiny.',
        'সম্পূর্ণ কার্যাদেশ নথি। কর্তৃপক্ষ অনুসারে বা দরপত্রটি যাচাইয়ের জন্য চিহ্নিত কিনা তা অনুসারে ছাঁকুন।')
    }
  };

  /* ============================================================ legend & sr-table */
  function legend(items) {
    if (!items || !items.length) { return ''; }
    return tag('div', { 'class': 'ntrg-legend' }, items.map(function (it) {
      if (it.ramp) {
        var sw = it.ramp.map(function (c) { return tag('span', { 'class': 'ntrg-legend__sw ' + c }); }).join('');
        return tag('span', { 'class': 'ntrg-legend__i' },
          tag('span', { 'class': 'ntrg-legend__ramp' }, sw) + tag('span', null, esc(it.label)));
      }
      return tag('span', { 'class': 'ntrg-legend__i' },
        tag('span', { 'class': 'ntrg-legend__sw' + (it.mod ? ' ntrg-legend__sw--' + it.mod : '') }) +
        tag('span', null, esc(it.label)));
    }).join(''));
  }

  /* A visually-hidden table is the accessible representation of every plot. */
  function srTable(cap, cols, rows) {
    var head = tag('tr', null, cols.map(function (c) { return tag('th', null, esc(c)); }).join(''));
    var body = rows.map(function (r) {
      return tag('tr', null, r.map(function (c) { return tag('td', null, esc(c)); }).join(''));
    }).join('');
    // Wrap in a DIV, not the <table>: a table ignores width:1px under auto layout
    // and would expand to its content, extending the page's horizontal scroll.
    // The DIV honours width:1px + overflow:hidden and clips the table inside it.
    return tag('div', { 'class': 'ntrg-sr' },
      tag('table', null,
        tag('caption', null, esc(cap)) + tag('thead', null, head) + tag('tbody', null, body)));
  }

  /* ============================================================ generic h-bars
     Reused by every ranked-bar figure. rows: [{label, value, cls, dl, tip, out}].
     out=true draws the aggregate class as an outline (never a second grey). A zero
     value draws the empty track and "0" in ink — never a faint mark. */
  function hbars(W, rows, opts) {
    opts = opts || {};
    var rowH = opts.rowH || 26, gap = 8, mt = 6, mb = 6;
    var lw = opts.labelW != null ? opts.labelW : Math.min(210, Math.max(90, Math.round(W * 0.34)));
    var vw = opts.valueW != null ? opts.valueW : 66;
    var ml = lw + 10, mr = vw + 8;
    var iw = Math.max(30, W - ml - mr);
    var H = mt + mb + rows.length * (rowH + gap) - gap;
    var max = opts.max != null ? opts.max : niceMax(Math.max.apply(null, rows.map(function (r) { return r.value; })));
    var bh = Math.min(16, rowH - 8);
    var body = '';
    rows.forEach(function (r, i) {
      var y = mt + i * (rowH + gap), cy = y + rowH / 2;
      var bw = max > 0 ? iw * (r.value / max) : 0;
      var by = cy - bh / 2;
      body += rect(ml, by, iw, bh, 'ntrg-track');
      if (r.value > 0) {
        var cls = r.out ? 'ntrg-mk ntrg-mk--out' : ('ntrg-mk ' + (r.cls || 'ntrg-mk--6'));
        body += rect(ml, by, Math.max(bw, 2), bh, cls, r.tip);
      }
      body += txt(ml - 8, cy + 3.5, clipLabel(r.label, lw, 11.5), 'ntrg-t--cat', { 'text-anchor': 'end' });
      body += txt(ml + iw + 6, cy + 3.5, r.value > 0 ? r.dl : '0', 'ntrg-t--val', { 'text-anchor': 'start' });
    });
    return { svg: svg(W, H, body, opts.aria), H: H };
  }

  /* ============================================================ generic columns
     Reused by year value, doc-price histogram and the day-28 cliff. rows:
     [{label, value, cls, dl, tip}]. opts.annot = [{x, label}] draws a dashed
     reference rule with a note (the statutory-deadline line). */
  function columns(W, rows, opts) {
    opts = opts || {};
    var lang = opts.lang, H = opts.H || 240;
    var mt = 14, mb = opts.mb || 34, ml = opts.ml || 40, mr = 10;
    var iw = Math.max(30, W - ml - mr), ih = H - mt - mb;
    var max = opts.max != null ? opts.max : niceMax(Math.max.apply(null, rows.map(function (r) { return r.value; })));
    var step = opts.step || niceMax(max / 4);
    var n = rows.length, slot = iw / n;
    var bw = Math.min(opts.maxBar || 46, slot * (opts.fill || 0.62));
    function Y(v) { return mt + ih - (max > 0 ? ih * (v / max) : 0); }
    var body = '';
    ticks(max, step).forEach(function (v) {
      var y = Y(v);
      body += line(ml, y, ml + iw, y, 'ntrg-grid');
      body += txt(ml - 6, y + 3.5, opts.fmtY ? opts.fmtY(v) : nf(v, lang), 'ntrg-t--axis', { 'text-anchor': 'end' });
    });
    body += line(ml, mt + ih, ml + iw, mt + ih, 'ntrg-axis');
    rows.forEach(function (r, i) {
      var x = ml + i * slot + (slot - bw) / 2, y = Y(r.value), h = mt + ih - y;
      if (r.value > 0) { body += rect(x, y, bw, h, 'ntrg-mk ' + (r.cls || 'ntrg-mk--6'), r.tip); }
      if (r.dl) { body += txt(x + bw / 2, y - 5, r.dl, 'ntrg-t--val', { 'text-anchor': 'middle' }); }
      if (r.label != null && (opts.everyLabel || i % (opts.labelEvery || 1) === 0)) {
        body += txt(x + bw / 2, mt + ih + 14, r.label, 'ntrg-t--axis', { 'text-anchor': 'middle' });
      }
    });
    (opts.annot || []).forEach(function (a) {
      var x = ml + a.i * slot + slot / 2;
      body += line(x, mt - 4, x, mt + ih, 'ntrg-ln--rule');
      body += txt(x, mt - 6, a.label, 'ntrg-t--note', { 'text-anchor': a.anchor || 'middle' });
    });
    if (opts.xlab) { body += txt(ml + iw / 2, H - 4, opts.xlab, 'ntrg-t--axis', { 'text-anchor': 'middle' }); }
    return { svg: svg(W, H, body, opts.aria), H: H };
  }

  /* ============================================================ renderers
     Each returns { legend?, svg? | html?, sr, aria, note? }. The boot loop wraps
     that in the title/dek/legend/plot/source shell. */
  var R = {};

  /* -- stat tiles: numbers set in type, no box (their size is the structure) -- */
  R['stat-tiles'] = function (W, lang) {
    var h = D.headline, c = D.concentration, cl = D.cliff;
    var tiles = [
      { v: nf(h.tenders, lang), k: t('tender notices', 'দরপত্র বিজ্ঞপ্তি', lang) },
      { v: nf(h.awarded, lang), k: t('contracts awarded', 'কার্যাদেশপ্রাপ্ত চুক্তি', lang) },
      { v: crore(h.value_crore, lang), k: t('total award value', 'মোট কার্যাদেশ-মূল্য', lang) },
      { v: nf(c.dedup, lang), k: t('distinct firms', 'স্বতন্ত্র প্রতিষ্ঠান', lang), n: t('310 names as filed, merged', '৩১০টি নাম, একীভূত', lang) },
      { v: pct(h.single_resp_pct, lang), k: t('tenders with one responsive bid', 'একটি রেসপনসিভ দরসহ দরপত্র', lang), flag: true },
      { v: pct(c.top1, lang), k: t('of value to the top firm', 'শীর্ষ প্রতিষ্ঠানে মূল্যের অংশ', lang), flag: true },
      { v: nf(cl.at28, lang), k: t('awards on day 28, the ceiling', '২৮তম দিনে কার্যাদেশ, সর্বোচ্চ সীমা', lang), n: pct(cl.at28_pct, lang), flag: true },
      { v: nf(D.officers.nOfficers, lang), k: t('authorising officers named', 'নামোল্লিখিত অনুমোদনকারী কর্মকর্তা', lang) }
    ];
    var html = tag('div', { 'class': 'ntrg-tiles' }, tiles.map(function (x) {
      return tag('div', { 'class': 'ntrg-tile' + (x.flag ? ' ntrg-tile--flag' : '') },
        tag('span', { 'class': 'ntrg-tile__v' }, x.v) +
        tag('span', { 'class': 'ntrg-tile__k' }, esc(x.k)) +
        (x.n ? tag('span', { 'class': 'ntrg-tile__n' }, esc(x.n)) : ''));
    }).join(''));
    return {
      html: html,
      aria: t('Eight headline figures from the procurement record.', 'ক্রয় নথি থেকে আটটি শীর্ষ সংখ্যা।', lang),
      sr: srTable(t('Headline figures', 'শীর্ষ সংখ্যা', lang),
        [t('Figure', 'সূচক', lang), t('Value', 'মান', lang)],
        tiles.map(function (x) { return [x.k, x.v]; }))
    };
  };

  /* -- funnel: four stages, one sequential ramp light→dark by stage -- */
  R['funnel'] = function (W, lang) {
    var rows = D.funnel.map(function (s, i) {
      var lab = t(s.k, D.meta.stageBn[s.k], lang);
      return {
        label: lab, value: s.v, cls: 'ntrg-mk--' + [3, 4, 5, 6][i], dl: nf(s.v, lang),
        tip: lab + '||' + t('count', 'সংখ্যা', lang) + ': {' + nf(s.v, lang) + '}'
      };
    });
    var r = hbars(W, rows, { lang: lang, aria: t('Funnel from documents sold to contracts awarded.', 'দস্তাবেজ বিক্রি থেকে কার্যাদেশ পর্যন্ত ফানেল।', lang) });
    return {
      svg: r.svg, aria: r.aria,
      sr: srTable(TXT.funnel.title[lang] || TXT.funnel.title.en,
        [t('Stage', 'ধাপ', lang), t('Count', 'সংখ্যা', lang)],
        rows.map(function (x) { return [x.label, nf(x.value, lang)]; }))
    };
  };

  /* -- authorities: single-responsive share, ranked; the flag hue past 50% -- */
  R['authorities'] = function (W, lang) {
    var rows = D.authorities.map(function (a) {
      var lab = t(a.org, D.meta.orgBn[a.org], lang);
      return {
        label: lab, value: a.singlePct, cls: a.singlePct >= 50 ? 'ntrg-mk--flag' : 'ntrg-mk--4',
        dl: pct(a.singlePct, lang),
        tip: lab + '||' + t('single-responsive', 'একক-রেসপনসিভ', lang) + ': {' + pct(a.singlePct, lang) + '}||' +
          t('single of awarded', 'কার্যাদেশের মধ্যে একক', lang) + ': {' + nf(a.single, lang) + ' / ' + nf(a.awarded, lang) + '}'
      };
    });
    var r = hbars(W, rows, { lang: lang, max: 100, valueW: 52, aria: t('Single-responsive share by authority.', 'কর্তৃপক্ষভেদে একক-রেসপনসিভ হার।', lang) });
    return {
      svg: r.svg, aria: r.aria,
      legend: legend([
        { mod: '', label: t('below 50%', '৫০%-এর নিচে', lang) },
        { mod: 'flag', label: t('50% or above — flag for scrutiny', '৫০% বা তার বেশি — যাচাইযোগ্য', lang) }
      ]),
      sr: srTable(TXT.authorities.title[lang] || TXT.authorities.title.en,
        [t('Authority', 'কর্তৃপক্ষ', lang), t('Single-responsive %', 'একক-রেসপনসিভ %', lang), t('Single / awarded', 'একক / কার্যাদেশ', lang)],
        rows.map(function (x, i) { var a = D.authorities[i]; return [x.label, pct(a.singlePct, lang), nf(a.single, lang) + ' / ' + nf(a.awarded, lang)]; }))
    };
  };

  /* -- contractor value: 14 named firms + the aggregate drawn stroke-only -- */
  R['contractor-value'] = function (W, lang) {
    var cv = D.contractorValue;
    var rows = cv.named.map(function (x) {
      return {
        label: x.name, value: x.crore, dl: nf(x.crore, lang),
        tip: x.name + '||' + t('value', 'মূল্য', lang) + ': {' + crore(x.crore, lang) + '}||' +
          t('contracts', 'চুক্তি', lang) + ': {' + nf(x.n, lang) + '}'
      };
    });
    rows.push({
      label: t('All other firms', 'অন্য সব প্রতিষ্ঠান', lang) + ' (' + nf(cv.other.firms, lang) + ')',
      value: cv.other.crore, out: true, dl: nf(cv.other.crore, lang),
      tip: t('All other firms', 'অন্য সব প্রতিষ্ঠান', lang) + '||' + t('firms', 'প্রতিষ্ঠান', lang) + ': {' + nf(cv.other.firms, lang) + '}||' +
        t('value', 'মূল্য', lang) + ': {' + crore(cv.other.crore, lang) + '}'
    });
    var r = hbars(W, rows, { lang: lang, rowH: 24, aria: t('Award value by firm, top 14 and the rest combined.', 'প্রতিষ্ঠানভেদে কার্যাদেশ-মূল্য, শীর্ষ ১৪ ও বাকিরা সম্মিলিত।', lang) });
    return {
      svg: r.svg, aria: r.aria,
      legend: legend([
        { mod: '', label: t('a named firm', 'নামোল্লিখিত প্রতিষ্ঠান', lang) },
        { mod: 'out', label: t('all other firms combined', 'অন্য সব প্রতিষ্ঠান সম্মিলিত', lang) }
      ]),
      note: t('Values in crore taka.', 'মূল্য কোটি টাকায়।', lang),
      sr: srTable(TXT['contractor-value'].title[lang] || TXT['contractor-value'].title.en,
        [t('Firm', 'প্রতিষ্ঠান', lang), t('Value (crore)', 'মূল্য (কোটি)', lang), t('Contracts', 'চুক্তি', lang)],
        cv.named.map(function (x) { return [x.name, nf1(x.crore, lang), nf(x.n, lang)]; })
          .concat([[t('All other firms', 'অন্য সব প্রতিষ্ঠান', lang), nf1(cv.other.crore, lang), nf(cv.other.n, lang)]]))
    };
  };

  /* -- contractor count: firms ranked by number of contracts won -- */
  R['contractor-count'] = function (W, lang) {
    var rows = D.contractorCount.map(function (x) {
      return {
        label: x.name, value: x.n, cls: 'ntrg-mk--5', dl: nf(x.n, lang),
        tip: x.name + '||' + t('contracts', 'চুক্তি', lang) + ': {' + nf(x.n, lang) + '}||' + t('value', 'মূল্য', lang) + ': {' + crore(x.crore, lang) + '}'
      };
    });
    var r = hbars(W, rows, { lang: lang, rowH: 24, valueW: 46, aria: t('Firms ranked by contracts won.', 'জেতা চুক্তির সংখ্যায় সাজানো প্রতিষ্ঠান।', lang) });
    return {
      svg: r.svg, aria: r.aria,
      sr: srTable(TXT['contractor-count'].title[lang] || TXT['contractor-count'].title.en,
        [t('Firm', 'প্রতিষ্ঠান', lang), t('Contracts', 'চুক্তি', lang), t('Value (crore)', 'মূল্য (কোটি)', lang)],
        D.contractorCount.map(function (x) { return [x.name, nf(x.n, lang), nf1(x.crore, lang)]; }))
    };
  };

  /* -- districts: award value by district (two Chattogram spellings summed) -- */
  R['districts'] = function (W, lang) {
    var rows = D.districts.map(function (x) {
      var lab = t(x.d, D.meta.distBn[x.d], lang);
      return {
        label: lab, value: x.crore, cls: 'ntrg-mk--5', dl: nf(x.crore, lang),
        tip: lab + '||' + t('value', 'মূল্য', lang) + ': {' + crore(x.crore, lang) + '}||' + t('contracts', 'চুক্তি', lang) + ': {' + nf(x.n, lang) + '}'
      };
    });
    var r = hbars(W, rows, { lang: lang, rowH: 24, aria: t('Award value by district.', 'জেলাভেদে কার্যাদেশ-মূল্য।', lang) });
    return {
      svg: r.svg, aria: r.aria,
      note: t('Values in crore taka. Chattogram merges two portal spellings.', 'মূল্য কোটি টাকায়। চট্টগ্রাম দুটি পোর্টাল-বানান একীভূত করে।', lang),
      sr: srTable(TXT.districts.title[lang] || TXT.districts.title.en,
        [t('District', 'জেলা', lang), t('Value (crore)', 'মূল্য (কোটি)', lang), t('Contracts', 'চুক্তি', lang)],
        D.districts.map(function (x) { return [t(x.d, D.meta.distBn[x.d], lang), nf1(x.crore, lang), nf(x.n, lang)]; }))
    };
  };

  /* -- cliff-by-org: share of each authority's awards landing on day 28 -- */
  R['cliff-by-org'] = function (W, lang) {
    var src = D.cliffByOrg.filter(function (x) { return x.total >= 5; });
    var rows = src.map(function (x) {
      var lab = t(x.org, D.meta.orgBn[x.org], lang);
      return {
        label: lab, value: x.pct, cls: x.pct >= 20 ? 'ntrg-mk--flag' : 'ntrg-mk--4', dl: pct(x.pct, lang),
        tip: lab + '||' + t('on day 28', '২৮তম দিনে', lang) + ': {' + pct(x.pct, lang) + '}||{' + nf(x.at28, lang) + ' / ' + nf(x.total, lang) + '}'
      };
    });
    var r = hbars(W, rows, { lang: lang, max: niceMax(Math.max.apply(null, rows.map(function (x) { return x.value; }))), valueW: 52, aria: t('Day-28 share by authority.', '২৮-দিনের অংশ কর্তৃপক্ষভেদে।', lang) });
    return {
      svg: r.svg, aria: r.aria,
      note: t('Authorities with at least 5 awards.', 'অন্তত ৫টি কার্যাদেশসহ কর্তৃপক্ষ।', lang),
      sr: srTable(TXT['cliff-by-org'].title[lang] || TXT['cliff-by-org'].title.en,
        [t('Authority', 'কর্তৃপক্ষ', lang), t('Day-28 %', '২৮-দিন %', lang), t('On day 28 / total', '২৮তম দিনে / মোট', lang)],
        src.map(function (x) { return [t(x.org, D.meta.orgBn[x.org], lang), pct(x.pct, lang), nf(x.at28, lang) + ' / ' + nf(x.total, lang)]; }))
    };
  };

  /* -- pe-capture: one firm's share of a single unit's awards -- */
  R['pe-capture'] = function (W, lang) {
    var src = D.peCapture.slice().sort(function (a, b) { return b.pct - a.pct; }).slice(0, 12);
    var rows = src.map(function (x) {
      var lab = x.pe.length > 30 ? x.pe.slice(0, 29) + '…' : x.pe;
      return {
        label: lab, value: x.pct, cls: x.pct >= 30 ? 'ntrg-mk--flag' : 'ntrg-mk--4', dl: pct(x.pct, lang),
        tip: x.pe + '||' + x.sup + '||' + t('share', 'অংশ', lang) + ': {' + pct(x.pct, lang) + '}  ({' + nf(x.n, lang) + ' / ' + nf(x.total, lang) + '})'
      };
    });
    var r = hbars(W, rows, { lang: lang, rowH: 24, max: niceMax(Math.max.apply(null, rows.map(function (x) { return x.value; }))), valueW: 52, aria: t('Top-supplier share by procuring unit.', 'ক্রয়কারী ইউনিটভেদে শীর্ষ সরবরাহকারীর অংশ।', lang) });
    return {
      svg: r.svg, aria: r.aria,
      sr: srTable(TXT['pe-capture'].title[lang] || TXT['pe-capture'].title.en,
        [t('Procuring unit', 'ক্রয়কারী ইউনিট', lang), t('Top supplier', 'শীর্ষ সরবরাহকারী', lang), '%', t('n / total', 'n / মোট', lang)],
        src.map(function (x) { return [x.pe, x.sup, pct(x.pct, lang), nf(x.n, lang) + ' / ' + nf(x.total, lang)]; }))
    };
  };

  /* -- years: award value per year (mode="count" switches to contract count) -- */
  R['years'] = function (W, lang, mode) {
    var val = mode !== 'count';
    var rows = D.years.map(function (x) {
      return {
        label: bnDigits ? nf(x.y, lang).replace(/,/g, '') : x.y, value: val ? x.crore : x.n,
        dl: val ? (x.crore >= 100 ? nf(x.crore, lang) : nf1(x.crore, lang)) : nf(x.n, lang),
        tip: (lang === 'bn' ? bnDigits(x.y) : x.y) + '||' + t('value', 'মূল্য', lang) + ': {' + crore(x.crore, lang) + '}||' + t('contracts', 'চুক্তি', lang) + ': {' + nf(x.n, lang) + '}'
      };
    });
    var r = columns(W, rows, { lang: lang, H: 240, everyLabel: true, ml: 46, aria: t('Award value by year.', 'বছরভিত্তিক কার্যাদেশ-মূল্য।', lang) });
    return {
      svg: r.svg, aria: r.aria,
      note: val ? t('Values in crore taka.', 'মূল্য কোটি টাকায়।', lang) : null,
      sr: srTable(TXT.years.title[lang] || TXT.years.title.en,
        [t('Year', 'বছর', lang), t('Value (crore)', 'মূল্য (কোটি)', lang), t('Contracts', 'চুক্তি', lang)],
        D.years.map(function (x) { return [lang === 'bn' ? bnDigits(x.y) : x.y, nf1(x.crore, lang), nf(x.n, lang)]; }))
    };
  };

  /* -- doc-price histogram -- */
  R['docprice'] = function (W, lang) {
    var dp = D.docprice;
    var rows = dp.hist.map(function (b) {
      return { label: b[0], value: b[1], dl: b[1] ? nf(b[1], lang) : '', tip: b[0] + '||' + t('tenders', 'দরপত্র', lang) + ': {' + nf(b[1], lang) + '}' };
    });
    var r = columns(W, rows, { lang: lang, H: 220, everyLabel: true, maxBar: 60, aria: t('Distribution of tender document prices.', 'দরপত্র দস্তাবেজ-মূল্যের বণ্টন।', lang) });
    return {
      svg: r.svg, aria: r.aria,
      note: t('Median ', 'মধ্যক ', lang) + TK + NNBSP + nf(dp.median, lang) + '; ' + t('max ', 'সর্বোচ্চ ', lang) + TK + NNBSP + nf(dp.max, lang) + '. ' + t('Prices in taka.', 'মূল্য টাকায়।', lang),
      sr: srTable(TXT.docprice.title[lang] || TXT.docprice.title.en,
        [t('Price band (taka)', 'মূল্য-স্তর (টাকা)', lang), t('Tenders', 'দরপত্র', lang)],
        dp.hist.map(function (b) { return [b[0], nf(b[1], lang)]; }))
    };
  };

  /* -- the day-28 cliff: histogram of award lag with the statutory-ceiling rule -- */
  R['cliff'] = function (W, lang) {
    var cl = D.cliff, curve = cl.curve;
    var rows = curve.map(function (c) {
      var d28 = c[0] === 28;
      return {
        label: (c[0] % 7 === 0) ? (lang === 'bn' ? bnDigits(c[0]) : c[0]) : null, value: c[1],
        cls: d28 ? 'ntrg-mk--flag' : 'ntrg-mk--4', dl: d28 ? nf(c[1], lang) : '',
        tip: t('day', 'দিন', lang) + ' ' + (lang === 'bn' ? bnDigits(c[0]) : c[0]) + '||' + t('awards', 'কার্যাদেশ', lang) + ': {' + nf(c[1], lang) + '}'
      };
    });
    var i28 = curve.findIndex(function (c) { return c[0] === 28; });
    var r = columns(W, rows, {
      lang: lang, H: 250, fill: 0.72, maxBar: 20, mb: 30,
      annot: [{ i: i28, label: t('day 28 — statutory ceiling', '২৮তম দিন — বিধিবদ্ধ সীমা', lang), anchor: 'end' }],
      xlab: t('days from tender close to award', 'দরপত্র বন্ধ থেকে কার্যাদেশ পর্যন্ত দিন', lang),
      aria: t('Award lag in days, with a spike on day 28.', '২৮তম দিনে চূড়াসহ কার্যাদেশ বিলম্ব (দিন)।', lang)
    });
    return {
      svg: r.svg, aria: r.aria,
      legend: legend([
        { mod: '', label: t('awards that day', 'ওই দিনের কার্যাদেশ', lang) },
        { mod: 'flag', label: t('day 28, the ceiling', '২৮তম দিন, সর্বোচ্চ সীমা', lang) }
      ]),
      note: t('Median ', 'মধ্যক ', lang) + nf(cl.median, lang) + t(' days; ', ' দিন; ', lang) + nf(cl.at28, lang) + t(' on day 28 (', ' ২৮তম দিনে (', lang) + pct(cl.at28Pct, lang) + t('); max ', '); সর্বোচ্চ ', lang) + nf(cl.max, lang) + t(' days.', ' দিন।', lang),
      sr: srTable(TXT.cliff.title[lang] || TXT.cliff.title.en,
        [t('Day', 'দিন', lang), t('Awards', 'কার্যাদেশ', lang)],
        curve.map(function (c) { return [lang === 'bn' ? bnDigits(c[0]) : c[0], nf(c[1], lang)]; }))
    };
  };

  /* -- Lorenz / concentration curve: cumulative value against cumulative firms -- */
  R['lorenz'] = function (W, lang) {
    var pts = D.lorenz, con = D.concentration;
    var H = 300, mt = 12, mb = 40, ml = 44, mr = 12;
    var iw = Math.max(30, W - ml - mr), ih = H - mt - mb;
    function X(v) { return ml + iw * (v / 100); }
    function Y(v) { return mt + ih - ih * (v / 100); }
    var body = '';
    [0, 25, 50, 75, 100].forEach(function (g) {
      body += line(ml, Y(g), ml + iw, Y(g), 'ntrg-grid');
      body += txt(ml - 6, Y(g) + 3.5, pct(g, lang), 'ntrg-t--axis', { 'text-anchor': 'end' });
      body += txt(X(g), mt + ih + 15, pct(g, lang), 'ntrg-t--axis', { 'text-anchor': 'middle' });
    });
    body += line(ml, mt + ih, ml + iw, mt + ih, 'ntrg-axis');
    body += line(X(0), Y(0), X(100), Y(100), 'ntrg-ln--ref');   /* line of equality */
    var d = 'M' + q(X(pts[0][0])) + ',' + q(Y(pts[0][1]));
    for (var i = 1; i < pts.length; i++) { d += 'L' + q(X(pts[i][0])) + ',' + q(Y(pts[i][1])); }
    body += tag('path', { d: d + 'L' + q(X(100)) + ',' + q(Y(0)) + 'Z', 'class': 'ntrg-area' });
    body += tag('path', { d: d, 'class': 'ntrg-ln' });
    [1, 5, 10, 25].forEach(function (target) {
      var best = pts[0], bd = 1e9;
      pts.forEach(function (p) { var e = Math.abs(p[0] - target); if (e < bd) { bd = e; best = p; } });
      body += tag('circle', {
        cx: q(X(best[0])), cy: q(Y(best[1])), r: 4.5, 'class': 'ntrg-dot',
        'data-tip': t('top ', 'শীর্ষ ', lang) + pct(best[0], lang) + t(' of firms', ' প্রতিষ্ঠান', lang) + '||' + t('hold', 'ধারণ করে', lang) + ': {' + pct(best[1], lang) + '} ' + t('of value', 'মূল্যের', lang)
      });
    });
    body += txt(ml + iw / 2, H - 4, t('cumulative share of firms (largest first)', 'প্রতিষ্ঠানের ক্রমযোজিত অংশ (বড় থেকে)', lang), 'ntrg-t--axis', { 'text-anchor': 'middle' });
    return {
      svg: svg(W, H, body, t('Concentration curve of award value.', 'কার্যাদেশ-মূল্যের কেন্দ্রীকরণ রেখা।', lang)),
      aria: t('Concentration curve of award value.', 'কার্যাদেশ-মূল্যের কেন্দ্রীকরণ রেখা।', lang),
      legend: legend([
        { mod: 'line', label: t('actual distribution', 'প্রকৃত বণ্টন', lang) },
        { mod: 'ref', label: t('perfect equality', 'পূর্ণ সমতা', lang) }
      ]),
      note: 'HHI ' + nf(con.hhi, lang) + '; ' + t('top firm ', 'শীর্ষ প্রতিষ্ঠান ', lang) + pct(con.top1, lang) + ', ' + t('top 4 ', 'শীর্ষ ৪ ', lang) + pct(con.top4, lang) + ', ' + t('top 10 ', 'শীর্ষ ১০ ', lang) + pct(con.top10, lang) + t(' of value.', ' মূল্যের।', lang),
      sr: srTable(TXT.lorenz.title[lang] || TXT.lorenz.title.en,
        [t('Cumulative firms %', 'ক্রমযোজিত প্রতিষ্ঠান %', lang), t('Cumulative value %', 'ক্রমযোজিত মূল্য %', lang)],
        pts.filter(function (_, ix) { return ix % 20 === 0 || ix === pts.length - 1; }).map(function (p) { return [pct(p[0], lang), pct(p[1], lang)]; }))
    };
  };

  /* -- dumbbell: share of contracts vs share of value, per top firm -- */
  R['dumbbell'] = function (W, lang) {
    var src = D.dumbbell;
    var rowH = 26, gap = 8, mt = 8, mb = 22;
    var lw = Math.min(210, Math.max(90, Math.round(W * 0.34))), ml = lw + 12, mr = 44;
    var iw = Math.max(30, W - ml - mr);
    var H = mt + mb + src.length * (rowH + gap) - gap;
    var max = niceMax(Math.max.apply(null, src.map(function (x) { return Math.max(x.cPct, x.vPct); })));
    function X(v) { return ml + iw * (v / max); }
    var body = '';
    [0, max / 2, max].forEach(function (g) {
      body += line(X(g), mt, X(g), mt + src.length * (rowH + gap) - gap, 'ntrg-grid');
      body += txt(X(g), H - 6, pct(g, lang), 'ntrg-t--axis', { 'text-anchor': 'middle' });
    });
    src.forEach(function (x, i) {
      var y = mt + i * (rowH + gap), cy = y + rowH / 2;
      var lab = clipLabel(x.name, lw, 11.5);
      var tip = x.name + '||' + t('contracts', 'চুক্তি', lang) + ': {' + pct(x.cPct, lang) + '} ({' + nf(x.n, lang) + '})||' + t('value', 'মূল্য', lang) + ': {' + pct(x.vPct, lang) + '} ({' + crore(x.crore, lang) + '})';
      body += line(X(x.cPct), cy, X(x.vPct), cy, 'ntrg-conn');
      body += tag('circle', { cx: q(X(x.cPct)), cy: q(cy), r: 4.5, 'class': 'ntrg-dot ntrg-dot--out', 'data-tip': tip });
      body += tag('circle', { cx: q(X(x.vPct)), cy: q(cy), r: 5, 'class': 'ntrg-dot', 'data-tip': tip });
      body += txt(ml - 10, cy + 3.5, lab, 'ntrg-t--cat', { 'text-anchor': 'end' });
      body += txt(X(x.vPct) + 9, cy + 3.5, pct(x.vPct, lang), 'ntrg-t--val', { 'text-anchor': 'start' });
    });
    return {
      svg: svg(W, H, body, t('Share of contracts against share of value, per firm.', 'প্রতিষ্ঠানভেদে চুক্তির অংশ বনাম মূল্যের অংশ।', lang)),
      aria: t('Share of contracts against share of value, per firm.', 'প্রতিষ্ঠানভেদে চুক্তির অংশ বনাম মূল্যের অংশ।', lang),
      legend: legend([
        { mod: 'out', label: t('share of contracts', 'চুক্তির অংশ', lang) },
        { mod: '', label: t('share of value', 'মূল্যের অংশ', lang) }
      ]),
      sr: srTable(TXT.dumbbell.title[lang] || TXT.dumbbell.title.en,
        [t('Firm', 'প্রতিষ্ঠান', lang), t('Contracts %', 'চুক্তি %', lang), t('Value %', 'মূল্য %', lang)],
        src.map(function (x) { return [x.name, pct(x.cPct, lang), pct(x.vPct, lang)]; }))
    };
  };

  /* -- scatter: bids received against bids ruled responsive. Received and
        responsive are the SAME unit (a count of bids), so one shared scale treats
        them equally and the diagonal reads as the resp = recv ceiling. A handful of
        high-bid tenders (received up to 54) are clamped to the cap so the bulk of
        the distribution isn't squeezed into a sliver on the left. The red floor at
        resp = 1 is the finding; dots that started with 3+ bidders and ended at one
        are drawn on top in the flag hue. -- */
  R['scatter'] = function (W, lang) {
    var pts = D.scatter;
    var mt = 14, mb = 46, ml = 44, mr = 14;
    var iw = Math.max(30, W - ml - mr);
    var ih = Math.round(Math.max(240, Math.min(iw * 0.62, 460)));
    var H = mt + mb + ih;
    var dmax = 0; pts.forEach(function (p) { dmax = Math.max(dmax, p[0], p[1]); });
    var m = Math.min(14, dmax);
    function X(v) { return ml + iw * (Math.min(v, m) / m); }
    function Y(v) { return mt + ih - ih * (Math.min(v, m) / m); }
    function jit(i, k) { var s = Math.sin((i + 1) * (k === 'x' ? 12.9898 : 78.233)) * 43758.5453; return (s - Math.floor(s)) - 0.5; }
    var body = '', g;
    for (g = 0; g <= m; g += 2) {
      body += line(ml, Y(g), ml + iw, Y(g), 'ntrg-grid');
      body += line(X(g), mt, X(g), mt + ih, 'ntrg-grid');
      body += txt(ml - 7, Y(g) + 3.5, nf(g, lang), 'ntrg-t--axis', { 'text-anchor': 'end' });
      body += txt(X(g), mt + ih + 15, nf(g, lang), 'ntrg-t--axis', { 'text-anchor': 'middle' });
    }
    body += line(ml, mt + ih, ml + iw, mt + ih, 'ntrg-axis');
    body += line(ml, mt, ml, mt + ih, 'ntrg-axis');
    /* the resp = recv ceiling: no tender can rule more bids responsive than it received */
    body += line(X(0), Y(0), X(m), Y(m), 'ntrg-ln--ref');
    body += txt(X(m) - 5, Y(m) + 14, t('every bid responsive', 'প্রতিটি দরই রেসপনসিভ', lang), 'ntrg-t--note', { 'text-anchor': 'end' });
    /* the resp = 1 floor: the single-responsive line the story turns on */
    body += line(ml, Y(1), ml + iw, Y(1), 'ntrg-ln--rule');
    body += txt(ml + iw, Y(1) - 6, t('only one bid survives', 'টিকে থাকে একটিমাত্র দর', lang), 'ntrg-t--flag', { 'text-anchor': 'end' });
    var flags = '';
    pts.forEach(function (p, i) {
      var recv = p[0], resp = p[1], flag = resp === 1 && recv >= 3;
      var cx = X(recv + jit(i, 'x') * 0.42), cy = Y(resp + jit(i, 'y') * 0.42);
      var tip = '#' + p[3] + '||' + t(p[2], D.meta.orgBn[p[2]], lang) + '||' + t('received', 'জমা', lang) + ': {' + nf(recv, lang) + '}, ' + t('responsive', 'রেসপনসিভ', lang) + ': {' + nf(resp, lang) + '}||' + t('value', 'মূল্য', lang) + ': {' + crore(p[4], lang) + '}';
      var c = tag('circle', { cx: q(cx), cy: q(cy), r: flag ? 4.4 : 3.2, 'class': flag ? 'ntrg-dot--flag' : 'ntrg-dot--out', 'data-tip': tip });
      if (flag) { flags += c; } else { body += c; }
    });
    body += flags;   /* flagged points drawn last so the floor reads on top */
    body += txt(ml + iw / 2, H - 5, t('bids received', 'জমা পড়া দর', lang), 'ntrg-t--axis', { 'text-anchor': 'middle' });
    body += txt(13, mt + ih / 2, t('bids ruled responsive', 'রেসপনসিভ ঘোষিত দর', lang), 'ntrg-t--axis', { 'text-anchor': 'middle', transform: 'rotate(-90 13 ' + q(mt + ih / 2) + ')' });
    return {
      svg: svg(W, H, body, t('Bids received against responsive bids; the single-responsive floor is flagged.', 'জমা পড়া দর বনাম রেসপনসিভ দর; একক-রেসপনসিভ তল চিহ্নিত।', lang)),
      aria: t('Bids received against responsive bids.', 'জমা পড়া দর বনাম রেসপনসিভ দর।', lang),
      legend: legend([
        { mod: 'out', label: t('one tender', 'একটি দরপত্র', lang) },
        { mod: 'flag', label: t('3+ bidders reduced to a single responsive bid', '৩+ দরদাতা কমে একটিমাত্র রেসপনসিভ দরে', lang) }
      ]),
      note: t('Each point is one of 591 tenders with bid counts; 201 (34%) ended single-responsive, 53 of them after real competition. Axes capped at ' + nf(m, lang) + '.', 'প্রতিটি বিন্দু বিড-সংখ্যাসহ ৫৯১টি দরপত্রের একটি; ২০১টি (৩৪%) একক-রেসপনসিভ, তার ৫৩টি প্রকৃত প্রতিযোগিতার পরও। অক্ষ ' + nf(m, lang) + ' পর্যন্ত সীমিত।', lang),
      sr: srTable(TXT.scatter.title[lang] || TXT.scatter.title.en,
        [t('Tender', 'দরপত্র', lang), t('Authority', 'কর্তৃপক্ষ', lang), t('Received', 'জমা', lang), t('Responsive', 'রেসপনসিভ', lang)],
        pts.slice().sort(function (a, b) { return b[0] - a[0]; }).slice(0, 30).map(function (p) { return ['#' + p[3], t(p[2], D.meta.orgBn[p[2]], lang), nf(p[0], lang), nf(p[1], lang)]; }))
    };
  };

  /* Sequential class for a value 0..max: 0 is an empty track, otherwise one of
     five ramp steps. Used by the heatmap and the cartogram. */
  function shadeCls(v, max) {
    if (v <= 0) { return null; }
    var idx = Math.max(2, Math.min(6, 2 + Math.round((v / max) * 4)));
    return 'ntrg-mk--' + idx;
  }
  /* An <svg> that may be wider than its container: returns {svg, scroll}. */
  function svgFit(W, need, H, body, aria) {
    var Weff = Math.max(W, need), scroll = need > W + 0.5;
    var s = tag('svg', {
      'class': 'ntrg-svg', viewBox: '0 0 ' + q(Weff) + ' ' + q(H),
      width: scroll ? q(Weff) : '100%', height: q(H),
      preserveAspectRatio: 'xMinYMin meet', role: 'img', 'aria-label': aria, focusable: 'false'
    }, body);
    return { svg: scroll ? tag('div', { 'class': 'ntrg-scroll' }, s) : s };
  }

  /* -- heatmap matrix: recurring buyer–supplier pairs -- */
  R['matrix'] = function (W, lang) {
    var m = D.matrix, rows = m.rows, cols = m.cols, grid = m.grid, max = m.max;
    var lw = 150, top = 96, mr = 8, mb = 8;
    var cell = Math.max(26, Math.min(52, Math.round((W - lw - mr) / cols.length)));
    var need = lw + cols.length * cell + mr;
    var H = top + rows.length * cell + mb;
    function shortR(s) { return s.length > 24 ? s.slice(0, 23) + '…' : s; }
    var body = '';
    cols.forEach(function (c, j) {
      var x = lw + j * cell + cell / 2;
      body += tag('text', { x: q(x), y: q(top - 8), 'class': 'ntrg-t', transform: 'rotate(-40 ' + q(x) + ' ' + q(top - 8) + ')', 'text-anchor': 'start' }, esc(c.length > 22 ? c.slice(0, 21) + '…' : c));
    });
    rows.forEach(function (r, i) {
      var y = top + i * cell;
      body += txt(lw - 8, y + cell / 2 + 3.5, shortR(r), 'ntrg-t--cat', { 'text-anchor': 'end' });
      cols.forEach(function (c, j) {
        var v = grid[i][j], x = lw + j * cell;
        var cls = shadeCls(v, max);
        var tip = r + '||' + c + '||' + t('contracts', 'চুক্তি', lang) + ': {' + nf(v, lang) + '}';
        body += tag('rect', { x: q(x + 1), y: q(y + 1), width: q(cell - 2), height: q(cell - 2), 'class': cls ? 'ntrg-mk ' + cls : 'ntrg-track', 'data-tip': v > 0 ? tip : null });
        if (v > 0) { body += txt(x + cell / 2, y + cell / 2 + 3.5, nf(v, lang), 'ntrg-t--cell ntrg-t--halo'); }
      });
    });
    var fit = svgFit(W, need, H, body, t('Contract counts for recurring buyer–supplier pairs.', 'পুনরাবৃত্ত ক্রেতা–সরবরাহকারী জোড়ার চুক্তি সংখ্যা।', lang));
    return {
      svg: fit.svg, aria: t('Heatmap of buyer–supplier contract counts.', 'ক্রেতা–সরবরাহকারী চুক্তি সংখ্যার হিটম্যাপ।', lang),
      legend: legend([{ ramp: ['ntrg-legend__sw--s2', 'ntrg-legend__sw--s3', 'ntrg-legend__sw--s4', 'ntrg-legend__sw--s5', 'ntrg-legend__sw--s6'], label: t('few → many contracts', 'কম → বেশি চুক্তি', lang) }]),
      sr: srTable(TXT.matrix.title[lang] || TXT.matrix.title.en,
        [t('Procuring unit', 'ক্রয়কারী ইউনিট', lang)].concat(cols),
        rows.map(function (r, i) { return [r].concat(grid[i].map(function (v) { return nf(v, lang); })); }))
    };
  };

  /* -- cartogram: schematic grid, one tile per district, shaded by value -- */
  R['cartogram'] = function (W, lang) {
    var grid = D.districtGrid, dist = {};
    D.districts.forEach(function (x) { dist[x.d] = x; });
    var maxCol = 0, maxRow = 0;
    for (var k in grid) { maxCol = Math.max(maxCol, grid[k][0]); maxRow = Math.max(maxRow, grid[k][1]); }
    var mx = 4, mt = 4;
    var cell = Math.max(46, Math.min(84, Math.floor((W - mx * 2) / maxCol)));
    var need = mx * 2 + maxCol * cell;
    var H = mt * 2 + maxRow * cell;
    var max = Math.max.apply(null, D.districts.map(function (x) { return x.crore; }));
    var CODE = { 'Dhaka': 'DHK', 'Chattogram': 'CTG', "Cox's Bazar": 'COX', 'Khulna': 'KHL', 'Rajshahi': 'RAJ', 'Gazipur': 'GAZ', 'Dinajpur': 'DIN', 'Comilla': 'CoM', 'Barisal': 'BAR', 'Pabna': 'PAB', 'Satkhira': 'SAT' };
    var body = '';
    for (var name in grid) {
      var gc = grid[name], x = mx + (gc[0] - 1) * cell, y = mt + (gc[1] - 1) * cell;
      var d = dist[name], v = d ? d.crore : 0, cls = shadeCls(v, max);
      var lab = t(CODE[name] || name.slice(0, 3).toUpperCase(), (D.meta.distBn[name] || name), lang);
      var tip = t(name, D.meta.distBn[name], lang) + '||' + t('value', 'মূল্য', lang) + ': {' + crore(v, lang) + '}||' + t('contracts', 'চুক্তি', lang) + ': {' + nf(d ? d.n : 0, lang) + '}';
      body += tag('rect', { x: q(x + 2), y: q(y + 2), width: q(cell - 4), height: q(cell - 4), 'class': (cls ? 'ntrg-mk ' + cls : 'ntrg-tile-mk--empty') + ' ntrg-tile-mk', 'data-tip': tip });
      body += txt(x + cell / 2, y + cell / 2 + 3.5, lab, 'ntrg-t--tile ntrg-t--halo');
    }
    var fit = svgFit(W, need, H, body, t('Schematic grid of districts shaded by award value.', 'কার্যাদেশ-মূল্য অনুসারে ছায়াঙ্কিত জেলার পরিকল্পিত গ্রিড।', lang));
    return {
      svg: fit.svg, aria: t('Schematic district cartogram of award value.', 'কার্যাদেশ-মূল্যের পরিকল্পিত জেলা কার্টোগ্রাম।', lang),
      legend: legend([{ ramp: ['ntrg-legend__sw--s2', 'ntrg-legend__sw--s3', 'ntrg-legend__sw--s4', 'ntrg-legend__sw--s5', 'ntrg-legend__sw--s6'], label: t('lower → higher value', 'কম → বেশি মূল্য', lang) }]),
      note: t('A schematic arrangement, not a projection; no district boundary is asserted. Chattogram merges two portal spellings.', 'একটি পরিকল্পিত বিন্যাস, প্রক্ষেপণ নয়; কোনো জেলা-সীমানা দাবি করা হয়নি। চট্টগ্রাম দুটি পোর্টাল-বানান একীভূত করে।', lang),
      sr: srTable(TXT.cartogram.title[lang] || TXT.cartogram.title.en,
        [t('District', 'জেলা', lang), t('Code', 'কোড', lang), t('Value (crore)', 'মূল্য (কোটি)', lang)],
        D.districts.map(function (x) { return [t(x.d, D.meta.distBn[x.d], lang), CODE[x.d] || '', nf1(x.crore, lang)]; }))
    };
  };

  /* -- officers: capture table (share to one firm) + a broader-portfolio table.
        The "plot" of a table figure is the table itself. -- */
  R['officers'] = function (W, lang) {
    var o = D.officers;
    function head(cols) { return tag('thead', null, tag('tr', null, cols.map(function (c) { return tag('th', mix({}, c.num ? { 'class': 'num' } : null), esc(c.t)); }).join(''))); }
    var capCols = [{ t: t('Officer', 'কর্মকর্তা', lang) }, { t: t('Authority', 'কর্তৃপক্ষ', lang) }, { t: t('Awards', 'কার্যাদেশ', lang), num: 1 }, { t: t('Value', 'মূল্য', lang), num: 1 }, { t: t('To one firm', 'এক প্রতিষ্ঠানে', lang), num: 1 }, { t: t('That firm', 'সেই প্রতিষ্ঠান', lang) }];
    var capBody = o.capture.map(function (x) {
      return tag('tr', null,
        tag('td', { 'class': 'nm' }, esc(x.off)) +
        tag('td', null, esc(t(x.auth, D.meta.orgBn[x.auth], lang))) +
        tag('td', { 'class': 'num' }, nf(x.n, lang)) +
        tag('td', { 'class': 'num' }, nf1(x.crore, lang)) +
        tag('td', { 'class': 'num' }, tag('span', { 'class': x.share >= 90 ? 'ntrg-flagword' : 'ntrg-warnword' }, pct(x.share, lang))) +
        tag('td', null, esc(x.sup)));
    }).join('');
    var broadCols = [{ t: t('Officer', 'কর্মকর্তা', lang) }, { t: t('Authority', 'কর্তৃপক্ষ', lang) }, { t: t('Awards', 'কার্যাদেশ', lang), num: 1 }, { t: t('Value', 'মূল্য', lang), num: 1 }, { t: t('Suppliers / top share', 'সরবরাহকারী / শীর্ষ অংশ', lang), num: 1 }];
    var broadBody = o.broad.map(function (x) {
      var last = x.sups != null ? nf(x.sups, lang) + t(' firms', ' প্রতিষ্ঠান', lang) : (x.share != null ? pct(x.share, lang) : '—');
      return tag('tr', null,
        tag('td', { 'class': 'nm' }, esc(x.off)) +
        tag('td', null, esc(t(x.auth, D.meta.orgBn[x.auth], lang))) +
        tag('td', { 'class': 'num' }, nf(x.n, lang)) +
        tag('td', { 'class': 'num' }, nf1(x.crore, lang)) +
        tag('td', { 'class': 'num' }, last));
    }).join('');
    var html =
      tag('div', { 'class': 'ntrg-tw' }, tag('table', { 'class': 'ntrg-tb' },
        tag('caption', null, esc(t('Awards concentrated on a single supplier (149 of 591 awards meet the strict test)', 'একক সরবরাহকারীতে কেন্দ্রীভূত কার্যাদেশ (৫৯১টির মধ্যে ১৪৯টি কঠোর মানদণ্ড পূরণ করে)', lang))) +
        head(capCols) + tag('tbody', null, capBody))) +
      tag('div', { 'class': 'ntrg-tw', style: 'margin-top:1.4em' }, tag('table', { 'class': 'ntrg-tb' },
        tag('caption', null, esc(t('Broader portfolios, for comparison', 'তুলনার জন্য বৃহত্তর পোর্টফোলিও', lang))) +
        head(broadCols) + tag('tbody', null, broadBody)));
    return {
      html: html,
      note: t('Values in crore taka. Officers named because the public record names them.', 'মূল্য কোটি টাকায়। সরকারি নথি নাম উল্লেখ করেছে বলেই কর্মকর্তাদের নাম দেওয়া।', lang),
      aria: t('Table of authorising officers whose awards concentrate on one firm.', 'যেসব অনুমোদনকারী কর্মকর্তার কার্যাদেশ এক প্রতিষ্ঠানে কেন্দ্রীভূত তার সারণি।', lang)
    };
  };

  /* -- elimination: many bidders, one survivor -- */
  R['elimination'] = function (W, lang) {
    var e = D.elimination, cols = [{ t: t('Tender', 'দরপত্র', lang) }, { t: t('Authority', 'কর্তৃপক্ষ', lang) }, { t: t('Received', 'জমা', lang), num: 1 }, { t: t('Firm ruled responsive', 'রেসপনসিভ ঘোষিত প্রতিষ্ঠান', lang) }, { t: t('Value', 'মূল্য', lang), num: 1 }];
    var head = tag('thead', null, tag('tr', null, cols.map(function (c) { return tag('th', c.num ? { 'class': 'num' } : null, esc(c.t)); }).join('')));
    var body = e.cases.map(function (x) {
      return tag('tr', null,
        tag('td', { 'class': 'id' }, esc('#' + x.id)) +
        tag('td', null, esc(t(x.org, D.meta.orgBn[x.org], lang))) +
        tag('td', { 'class': 'num' }, tag('span', { 'class': 'ntrg-flagword' }, nf(x.recv, lang))) +
        tag('td', { 'class': 'nm' }, esc(x.sup)) +
        tag('td', { 'class': 'num' }, nf1(x.crore, lang)));
    }).join('');
    return {
      html: tag('div', { 'class': 'ntrg-tw' }, tag('table', { 'class': 'ntrg-tb' }, head + tag('tbody', null, body))),
      note: t('Values in crore taka. ', 'মূল্য কোটি টাকায়। ', lang) + nf(e.n, lang) + t(' tenders drew many bids but ruled only one responsive; ', 'টি দরপত্রে বহু দর জমা পড়ে কিন্তু একটিমাত্র রেসপনসিভ; ', lang) + nf(e.n5, lang) + t(' had five or more.', 'টিতে পাঁচ বা ততোধিক।', lang),
      aria: t('Table of tenders with many bids but a single responsive bidder.', 'বহু দর কিন্তু একক রেসপনসিভ দরদাতাসহ দরপত্রের সারণি।', lang)
    };
  };

  /* small DOM helper for the interactive figures */
  function mk(name, attrs, html) {
    var e = document.createElement(name);
    if (attrs) { for (var k in attrs) { if (attrs[k] != null) { e.setAttribute(k, attrs[k]); } } }
    if (html != null) { e.innerHTML = html; }
    return e;
  }

  /* -- cases: the full award record, filterable by authority and flag, paged.
        Returns a live node (static: does not depend on container width). -- */
  R['cases'] = function (W, lang) {
    var rows = D.cases;    /* [id, org, sup, crore, recv, resp, delay, risk, notice, award] */
    var PER = 25, page = 0, org = null, flagged = false;

    var counts = {}; rows.forEach(function (r) { counts[r[1]] = (counts[r[1]] || 0) + 1; });
    var orgList = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).filter(function (o) { return counts[o] >= 10; });
    var flaggedN = rows.filter(function (r) { return r[7] === 'HIGH'; }).length;

    var wrap = mk('div');
    var ctl = mk('div', { 'class': 'ntrg-ctl' });
    ctl.appendChild(mk('span', { 'class': 'ntrg-ctl__lab' }, esc(t('Authority', 'কর্তৃপক্ষ', lang))));
    var chips = {};
    function chip(key, label, n) {
      var b = mk('button', { 'class': 'ntrg-chip', type: 'button', 'aria-pressed': 'false' },
        esc(label) + tag('span', { 'class': 'ntrg-chip__n' }, nf(n, lang)));
      b.addEventListener('click', function () { org = key; flagged = false; page = 0; render(); });
      chips[key == null ? '_all' : key] = b; ctl.appendChild(b); return b;
    }
    chip(null, t('All', 'সব', lang), rows.length);
    orgList.forEach(function (o) { chip(o, t(o, D.meta.orgBn[o], lang), counts[o]); });
    var fbtn = mk('button', { 'class': 'ntrg-chip', type: 'button', 'aria-pressed': 'false' },
      esc(t('Flagged only', 'শুধু চিহ্নিত', lang)) + tag('span', { 'class': 'ntrg-chip__n' }, nf(flaggedN, lang)));
    fbtn.addEventListener('click', function () { flagged = !flagged; org = null; page = 0; render(); });
    ctl.appendChild(fbtn);
    wrap.appendChild(ctl);

    var cols = [t('Tender', 'দরপত্র', lang), t('Authority', 'কর্তৃপক্ষ', lang), t('Supplier', 'সরবরাহকারী', lang), t('Value', 'মূল্য', lang), t('Bids', 'দর', lang), t('Resp.', 'রেসপ.', lang), t('Days', 'দিন', lang), t('Status', 'অবস্থা', lang), t('Evidence', 'নথি', lang)];
    var numc = { 3: 1, 4: 1, 5: 1, 6: 1 };
    var thead = tag('thead', null, tag('tr', null, cols.map(function (c, i) { return tag('th', numc[i] ? { 'class': 'num' } : null, esc(c)); }).join('')));
    var tbl = mk('table', { 'class': 'ntrg-tb' }, thead + '<tbody></tbody>');
    var tw = mk('div', { 'class': 'ntrg-tw' }); tw.appendChild(tbl);
    wrap.appendChild(tw);

    var pager = mk('div', { 'class': 'ntrg-pager' });
    var prev = mk('button', { type: 'button' }, esc(t('Prev', 'পূর্ব', lang)));
    var next = mk('button', { type: 'button' }, esc(t('Next', 'পরবর্তী', lang)));
    var at = mk('span', { 'class': 'ntrg-pager__at' });
    prev.addEventListener('click', function () { if (page > 0) { page--; render(); } });
    next.addEventListener('click', function () { page++; render(); });
    pager.appendChild(prev); pager.appendChild(at); pager.appendChild(next);
    wrap.appendChild(pager);

    function status(risk, lang) {
      if (risk === 'HIGH') { return tag('span', { 'class': 'ntrg-flagword' }, esc(t('flagged', 'চিহ্নিত', lang))); }
      if (risk === 'MEDIUM') { return tag('span', { 'class': 'ntrg-warnword' }, esc(t('watch', 'নজর', lang))); }
      return '—';
    }
    function render() {
      var list = rows.filter(function (r) { return (!org || r[1] === org) && (!flagged || r[7] === 'HIGH'); });
      var pages = Math.max(1, Math.ceil(list.length / PER));
      if (page >= pages) { page = pages - 1; } if (page < 0) { page = 0; }
      var slice = list.slice(page * PER, page * PER + PER);
      tbl.querySelector('tbody').innerHTML = slice.map(function (r) {
        var sup = r[2].length > 40 ? r[2].slice(0, 39) + '…' : r[2];
        return tag('tr', null,
          tag('td', { 'class': 'id' }, esc('#' + r[0])) +
          tag('td', null, esc(t(r[1], D.meta.orgBn[r[1]], lang))) +
          tag('td', { 'class': 'nm' }, esc(sup)) +
          tag('td', { 'class': 'num' }, nf1(r[3], lang)) +
          tag('td', { 'class': 'num' }, nf(r[4], lang)) +
          tag('td', { 'class': 'num' }, nf(r[5], lang)) +
          tag('td', { 'class': 'num' }, nf(r[6], lang)) +
          tag('td', null, status(r[7], lang)) +
          tag('td', { 'class': 'ntrg-evd' }, pdfLink(D.meta.noticeDir, r[8], t('notice', 'বিজ্ঞপ্তি', lang)) + pdfLink(D.meta.awardDir, r[9], t('award', 'কার্যাদেশ', lang))));
      }).join('');
      for (var key in chips) { chips[key].setAttribute('aria-pressed', String((key === '_all' && !org && !flagged) || key === org)); }
      fbtn.setAttribute('aria-pressed', String(flagged));
      at.textContent = t('Showing ', 'দেখানো হচ্ছে ', lang) + nf(list.length ? page * PER + 1 : 0, lang) + '–' + nf(Math.min(list.length, (page + 1) * PER), lang) + t(' of ', ' / ', lang) + nf(list.length, lang);
      prev.disabled = page === 0; next.disabled = page >= pages - 1;
    }
    render();
    return {
      node: wrap, static: true,
      note: t('Values in crore taka. “Flagged” = a single responsive bidder; a red flag warranting scrutiny, not a finding. Every row links to the government’s own notice and award PDF.', 'মূল্য কোটি টাকায়। “চিহ্নিত” = একক রেসপনসিভ দরদাতা; যাচাইযোগ্য সতর্কচিহ্ন, সিদ্ধান্ত নয়। প্রতিটি সারি সরকারের নিজস্ব বিজ্ঞপ্তি ও কার্যাদেশ পিডিএফে যুক্ত।', lang),
      aria: t('Searchable table of every award.', 'প্রতিটি কার্যাদেশের অনুসন্ধানযোগ্য সারণি।', lang)
    };
  };

  /* ============================================================ boot & shell */
  function langOf(el) {
    var n = el.closest ? el.closest('[lang]') : null;
    var l = n ? n.getAttribute('lang') : '';
    return /^bn/i.test(l || '') ? 'bn' : 'en';
  }

  var uid = 0;
  function build(fig, lang) {
    var name = fig.getAttribute('data-ntrg');
    var fn = R[name];
    if (!fn) { fig.innerHTML = tag('p', { 'class': 'ntrg-empty' }, esc('Unknown figure: ' + name)); return; }
    var W = Math.max(240, Math.floor(fig.getBoundingClientRect().width || fig.clientWidth || 320));
    var mode = fig.getAttribute('data-mode');
    var out;
    try { out = fn(W, lang, mode); }
    catch (e) { fig.innerHTML = tag('p', { 'class': 'ntrg-empty' }, esc('Could not render ' + name)); if (window.console) { console.error('[ntrg]', name, e); } return; }

    var meta = TXT[name] || {};
    var title = fig.getAttribute('data-title') || (meta.title ? t(meta.title.en, meta.title.bn, lang) : name);
    var dek = fig.getAttribute('data-dek') || (meta.dek ? t(meta.dek.en, meta.dek.bn, lang) : '');
    var src = fig.getAttribute('data-src') || srcLine(lang, out.note);
    var tid = 'ntrg-t' + (++uid);

    fig.classList.add('ntrg-fig');
    fig.setAttribute('role', 'group');
    fig.setAttribute('aria-labelledby', tid);
    fig.__ntrgStatic = !!out.static;
    fig.__ntrgW = W;

    fig.innerHTML = '';
    fig.appendChild(mk('h3', { 'class': 'ntrg-fig__title', id: tid }, esc(title)));
    if (dek) { fig.appendChild(mk('p', { 'class': 'ntrg-fig__dek' }, esc(dek))); }
    if (out.legend) { var lg = mk('div', { 'class': 'ntrg-fig__legend' }, out.legend); fig.appendChild(lg); }

    var plot = mk('div', { 'class': 'ntrg-fig__plot' });
    if (out.node) { plot.appendChild(out.node); }
    else { plot.innerHTML = out.svg || out.html || ''; }
    if (out.sr) { plot.insertAdjacentHTML('beforeend', out.sr); }
    fig.appendChild(plot);
    fig.appendChild(mk('p', { 'class': 'ntrg-fig__src' }, src.replace(/Source:|সূত্র:/, function (m) { return '<b>' + m + '</b>'; })));

    /* Pointer tooltip: only where the plot draws marks that carry one. */
    if ((out.svg || (out.node && plot.querySelector('[data-tip]'))) && plot.querySelector('[data-tip]')) {
      bindTips(plot);
    }
  }

  function draw(fig) {
    var lang = langOf(fig);
    /* Skip when nothing that affects the drawn output changed. Colours are
       CSS-driven, so a dark-mode toggle needs no redraw; only a width change
       (which forces __ntrgDrawn=false) or a language flip does. This also
       preserves the cases table's filter and page state across theme toggles. */
    if (fig.__ntrgDrawn && fig.__ntrgLang === lang) { return; }
    build(fig, lang);
    fig.__ntrgDrawn = true;
    fig.__ntrgLang = lang;
  }

  function all() { return [].slice.call(document.querySelectorAll('[data-ntrg]')); }

  function boot() {
    var figs = all();
    figs.forEach(draw);

    /* Debounced redraw on meaningful width change; static figures are skipped. */
    if (window.ResizeObserver) {
      var timers = new WeakMap();
      var ro = new ResizeObserver(function (entries) {
        entries.forEach(function (en) {
          var fig = en.target;
          if (fig.__ntrgStatic) { return; }
          var w = Math.floor(en.contentRect.width);
          if (Math.abs(w - (fig.__ntrgW || 0)) < 3) { return; }
          clearTimeout(timers.get(fig));
          timers.set(fig, setTimeout(function () { fig.__ntrgDrawn = false; draw(fig); }, 140));
        });
      });
      figs.forEach(function (f) { ro.observe(f); });
    }

    /* Redraw on a language flip. Colours are CSS-driven, so a dark-mode toggle
       needs no redraw — draw() short-circuits when only the theme changed, which
       also keeps the cases table's filter/page state intact. */
    if (window.MutationObserver) {
      var mo = new MutationObserver(function () {
        all().forEach(draw);
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'lang'] });
      all().forEach(function (f) {
        var host = f.closest('[lang]');
        if (host && host !== document.documentElement) { mo.observe(host, { attributes: true, attributeFilter: ['lang'] }); }
      });
    }
  }

  /* Public hook so a site can re-render after injecting figures dynamically. */
  window.NTRG = {
    render: function (root) {
      (root ? [].slice.call(root.querySelectorAll('[data-ntrg]')) : all()).forEach(function (f) { f.__ntrgDrawn = false; draw(f); });
    },
    figures: function () { return Object.keys(R); }
  };

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); }
  else { boot(); }
})();














