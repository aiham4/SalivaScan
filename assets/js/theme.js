/* =============================================================================
   theme.js — light / dark mode
   - Respects OS preference when set to 'auto'
   - Remembers the user's manual choice (localStorage, guarded)
============================================================================= */
(function () {
  var KEY = 'ss-theme';

  function osPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  function resolve(pref) {
    if (pref === 'light' || pref === 'dark') return pref;
    return osPrefersDark() ? 'dark' : 'light';   // 'auto'
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = theme === 'dark' ? '☀' : '☾';
  }

  // initial: stored manual choice > config default ('auto') > os
  var cfgDefault = (window.SS_CONFIG && window.SS_CONFIG.defaultTheme) || 'auto';
  var initialPref = stored() || cfgDefault;
  apply(resolve(initialPref));

  // expose toggle
  window.SSTheme = {
    toggle: function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      store(next);
      apply(next);
    }
  };

  // react to OS change only when user hasn't pinned a choice
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!stored()) apply(e.matches ? 'dark' : 'light');
    });
  }
})();
