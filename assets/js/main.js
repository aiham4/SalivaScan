/* =============================================================================
   main.js — boot. Loaded last, after config / locales / engines.
============================================================================= */
(function () {
  // theme toggle button
  var tb = document.getElementById('themeBtn');
  if (tb) tb.addEventListener('click', function () { window.SSTheme.toggle(); });

  // language switcher + translations
  if (window.SSi18n) window.SSi18n.init();

  // analyzer (only present on the tool page)
  if (document.getElementById('uploadCard') && window.SSAnalyzer) {
    window.SSAnalyzer.init();
  }

  // keep the model status line in the active language after a switch
  document.querySelectorAll('.lang-switcher').forEach(function (s) {
    s.addEventListener('click', function () {
      setTimeout(function () {
        if (window.SSAnalyzer && window.SSAnalyzer.reloadStatusText) {
          window.SSAnalyzer.reloadStatusText();
        }
      }, 0);
    });
  });
})();
