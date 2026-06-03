/* =============================================================================
   i18n.js — translation engine
   Translations live in assets/locales/<code>.js (each registers into SS_I18N).
   Works on file:// and https, no fetch, English always present as fallback.
============================================================================= */
(function () {
  var cfg  = window.SS_CONFIG || {};
  var dict = window.SS_I18N || {};
  var KEY  = 'ss-lang';

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var current = cfg.defaultLang || 'en';

  function t(key) {
    var lang = dict[current] || dict.en || {};
    if (lang[key] !== undefined) return lang[key];
    if (dict.en && dict.en[key] !== undefined) return dict.en[key];
    return key;
  }

  function apply() {
    var langConf = (cfg.languages || []).filter(function (l) { return l.code === current; })[0];
    var rtl = langConf && langConf.rtl;
    document.documentElement.lang = current;
    document.documentElement.dir  = rtl ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (val !== undefined) el.innerHTML = val;
    });

    // update active button state
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === current);
    });
  }

  function set(lang) {
    if (!dict[lang]) lang = 'en';
    current = lang;
    store(lang);
    apply();
  }

  // build the language switcher buttons from config
  function buildSwitcher() {
    var host = document.querySelector('.lang-switcher');
    if (!host) return;
    host.innerHTML = '';
    (cfg.languages || []).forEach(function (l) {
      var b = document.createElement('button');
      b.className = 'lang-btn';
      b.textContent = l.label;
      b.setAttribute('data-lang', l.code);
      b.setAttribute('aria-label', l.label);
      b.addEventListener('click', function () { set(l.code); });
      host.appendChild(b);
    });
  }

  // expose
  window.SSi18n = {
    set: set,
    t: t,
    current: function () { return current; },
    init: function () {
      buildSwitcher();
      var initial = stored() || cfg.defaultLang || 'en';
      set(dict[initial] ? initial : 'en');
    }
  };
})();
