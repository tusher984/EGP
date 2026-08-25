/* preview-boot.js — PREVIEW PAGE ONLY. Not part of the bundle.
   Wires the two demo toggles (theme, language) and swaps the demo framing text.
   On your site, your existing theme switch toggles html.dark-mode and your edition
   switch sets lang — the bundle listens for both on its own, so none of this is
   needed in production. */
(function () {
  var html = document.documentElement, wrap = document.getElementById('wrap');
  var themeBtn = document.getElementById('theme'), langBtn = document.getElementById('lang');

  function applyLangText(lang) {
    // The demo byline and note carry their own EN/BN copy; the figures localise
    // themselves through the bundle when #wrap's lang flips.
    [].forEach.call(document.querySelectorAll('[data-en]'), function (el) {
      var v = lang === 'bn' ? (el.getAttribute('data-bn') || el.getAttribute('data-en')) : el.getAttribute('data-en');
      var h = el.querySelector('.ntrg-note__h');
      var body = el.querySelector('b') && !h ? el : el.querySelector('p');
      if (h) {
        h.textContent = lang === 'bn' ? (el.getAttribute('data-bn-h') || el.getAttribute('data-en-h')) : el.getAttribute('data-en-h');
        if (el.querySelector('p')) { el.querySelector('p').textContent = v; }
      } else if (el.classList.contains('ntrg-byline')) {
        el.innerHTML = v;
      }
    });
  }

  themeBtn.addEventListener('click', function () {
    var dark = html.classList.toggle('dark-mode');
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.textContent = dark ? 'Light' : 'Dark';
  });

  langBtn.addEventListener('click', function () {
    var bn = wrap.getAttribute('lang') !== 'bn';
    wrap.setAttribute('lang', bn ? 'bn' : 'en');
    langBtn.setAttribute('aria-pressed', String(bn));
    langBtn.textContent = bn ? 'English' : 'বাংলা';
    applyLangText(bn ? 'bn' : 'en');
  });
})();
