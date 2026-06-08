/* =============================================================================
   main.js — boot. Loaded last, after config / content / locales / engines.
============================================================================= */
(function () {

  // ── theme toggle ──────────────────────────────────────────────────────────
  var tb = document.getElementById('themeBtn');
  if (tb) tb.addEventListener('click', function () { window.SSTheme.toggle(); });

  // ── i18n init (builds switcher + applies translations) ───────────────────
  if (window.SSi18n) {
    window.SSi18n.init();
  }

  // ── analyzer (tool page only) ─────────────────────────────────────────────
  if (document.getElementById('uploadCard') && window.SSAnalyzer) {
    window.SSAnalyzer.init();
  }

  // ── topic list (main page only) ───────────────────────────────────────────
  renderTopicList();

  // ── hub list (learn/index.html only) ─────────────────────────────────────
  renderHubList();

  // ── resources page (learn/resources.html only) ───────────────────────────
  renderResourceList();

  // ── article page: show correct lang section ───────────────────────────────
  applyArticleLang();

  // re-run rendering + article lang on every language switch
  document.querySelectorAll('.lang-switcher').forEach(function (s) {
    s.addEventListener('click', function () {
      setTimeout(function () {
        renderTopicList();
        renderHubList();
        renderResourceList();
        applyArticleLang();
        if (window.SSAnalyzer && window.SSAnalyzer.reloadStatusText) {
          window.SSAnalyzer.reloadStatusText();
        }
      }, 0);
    });
  });

  // ── helpers ───────────────────────────────────────────────────────────────

  function lang() {
    return window.SSi18n ? window.SSi18n.current() : 'en';
  }
  function t(key) {
    return window.SSi18n ? window.SSi18n.t(key) : key;
  }
  function field(obj) {
    // resolve a multilingual field object → string
    if (!obj) return '';
    return obj[lang()] || obj['en'] || '';
  }
  function typeIcon(type) {
    // returns a tiny inline SVG for resource type
    var icons = {
      video:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
      article: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      data:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>'
    };
    return icons[type] || icons['article'];
  }

  /* ── renderTopicList: article rows on the main page ─────────────────────── */
  function renderTopicList() {
    var host = document.getElementById('topicsList');
    if (!host || !window.SS_CONTENT) return;
    var articles = window.SS_CONTENT.articles;
    var basePath = 'learn/';                     // relative from index.html
    host.innerHTML = '';
    articles.forEach(function (a, i) {
      var el = document.createElement('a');
      el.className = 'topic-row';
      el.href = basePath + a.slug;
      el.innerHTML =
        '<span class="topic-num">0' + (i + 1) + '</span>' +
        '<span class="topic-body">' +
          '<span class="topic-title">' + field(a.title) + '</span>' +
          '<span class="topic-desc">' + field(a.desc) + '</span>' +
        '</span>' +
        '<span class="topic-meta">' +
          '<span class="topic-cat">' + field(a.category) + '</span>' +
          '<span class="topic-arrow">→</span>' +
        '</span>';
      host.appendChild(el);
    });
    // Resources row
    var res = document.createElement('a');
    res.className = 'topic-row';
    res.href = basePath + 'resources.html';
    res.innerHTML =
      '<span class="topic-num">0' + (articles.length + 1) + '</span>' +
      '<span class="topic-body">' +
        '<span class="topic-title">' + t('res_title') + '</span>' +
        '<span class="topic-desc">' + t('res_sub') + '</span>' +
      '</span>' +
      '<span class="topic-meta">' +
        '<span class="topic-cat">Links</span>' +
        '<span class="topic-arrow">→</span>' +
      '</span>';
    host.appendChild(res);
  }

  /* ── renderHubList: article list on learn/index.html ─────────────────────── */
  function renderHubList() {
    var host = document.getElementById('hubList');
    if (!host || !window.SS_CONTENT) return;
    var articles = window.SS_CONTENT.articles;
    host.innerHTML = '';
    articles.forEach(function (a) {
      var el = document.createElement('a');
      el.className = 'hub-row';
      el.href = a.slug;                            // relative from learn/
      el.innerHTML =
        '<div>' +
          '<div class="hub-row-cat">' + field(a.category) + '</div>' +
          '<div class="hub-row-title">' + field(a.title) + '</div>' +
          '<div class="hub-row-desc">' + field(a.desc) + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">' +
          (a.mins ? '<span class="hub-row-mins">' + a.mins + ' min</span>' : '') +
          '<span class="hub-row-arrow">→</span>' +
        '</div>';
      host.appendChild(el);
    });
    // Resources link
    var res = document.createElement('a');
    res.className = 'hub-row';
    res.href = 'resources.html';
    res.innerHTML =
      '<div>' +
        '<div class="hub-row-cat">Links</div>' +
        '<div class="hub-row-title">' + t('res_title') + '</div>' +
        '<div class="hub-row-desc">' + t('res_sub') + '</div>' +
      '</div>' +
      '<div><span class="hub-row-arrow">→</span></div>';
    host.appendChild(res);
  }

  /* ── renderResourceList: cards on learn/resources.html ───────────────────── */
  function renderResourceList() {
    var host = document.getElementById('resourceGrid');
    if (!host || !window.SS_CONTENT) return;
    var resources = window.SS_CONTENT.resources;
    host.innerHTML = '';
    resources.forEach(function (r) {
      var el = document.createElement('a');
      el.className = 'resource-card';
      el.href = r.url;
      el.target = '_blank';
      el.rel = 'noopener';
      el.innerHTML =
        '<div class="resource-type-icon">' + typeIcon(r.type) + '</div>' +
        '<div>' +
          '<div class="resource-type-badge">' + r.type + '</div>' +
          '<div class="resource-card-title">' + r.title + '</div>' +
          '<div class="resource-card-desc">' + r.desc + '</div>' +
        '</div>';
      host.appendChild(el);
    });
  }

  /* ── applyArticleLang: show matching data-lang section in articles ─────────
     Each article page wraps its body in one or more:
       <div class="article-lang" data-lang="en">…</div>
       <div class="article-lang" data-lang="nl">…</div>
     This function shows the matching one, falling back to English.
  ─────────────────────────────────────────────────────────────────────────── */
  function applyArticleLang() {
    var sections = document.querySelectorAll('.article-lang');
    if (!sections.length) return;
    var l = lang();
    var hasMatch = false;
    sections.forEach(function (s) {
      var match = s.getAttribute('data-lang') === l;
      s.classList.toggle('active', match);
      if (match) hasMatch = true;
    });
    // fallback to English if no section for this language
    if (!hasMatch) {
      var fallback = document.querySelector('.article-lang[data-lang="en"]');
      if (fallback) {
        fallback.classList.add('active');
        // show a notice that this language has no translation yet
        var notice = document.getElementById('langNotice');
        if (notice) notice.style.display = 'block';
      }
    } else {
      var notice = document.getElementById('langNotice');
      if (notice) notice.style.display = 'none';
    }
  }

})();
