/* =============================================================================
   content.js — articles + resources manifest
   ─────────────────────────────────────────────────────────────────────────────
   HOW TO ADD AN ARTICLE
   1. Add an entry to SS_CONTENT.articles below.
   2. Create learn/<slug>.html  (copy any existing article as a template).
   3. In the new HTML file, add <div class="article-lang" data-lang="en">…</div>
      for English and one <div class="article-lang" data-lang="nl">…</div> etc.
      for each language a teammate has translated.
   That is all — the hub page and the main page update automatically.

   HOW TO ADD A RESOURCE (video / article link)
   Add an entry to SS_CONTENT.resources below.
   The resources page auto-generates the list.

   TRANSLATION FIELDS
   Every multilingual field is an object keyed by language code.
   If a code is missing, English is shown as fallback.
============================================================================= */

window.SS_CONTENT = {

  /* ── ARTICLES ─────────────────────────────────────────────────────────────
     slug     : filename inside learn/   (e.g. "what-is-diabetes.html")
     category : short tag shown next to the title
     title    : article heading
     desc     : one-sentence summary shown on hub + main page
     mins     : estimated reading time (optional, shown on hub)
  ────────────────────────────────────────────────────────────────────────── */
  articles: [
    {
      slug: 'what-is-diabetes.html',
      category: {
        en: 'Background', nl: 'Achtergrond', es: 'Contexto',
        pt: 'Contexto',  ar: 'خلفية',        tr: 'Genel Bilgi'
      },
      title: {
        en: 'What is Type 2 Diabetes?',
        nl: 'Wat is diabetes type 2?',
        es: '¿Qué es la diabetes tipo 2?',
        pt: 'O que é a diabetes tipo 2?',
        ar: 'ما هو النوع الثاني من السكري؟',
        tr: 'Tip 2 diyabet nedir?'
      },
      desc: {
        en: 'A chronic condition where the body cannot use insulin effectively, raising blood glucose — and why early detection matters.',
        nl: 'Een chronische aandoening waarbij het lichaam insuline niet effectief gebruikt en waarom vroege opsporing belangrijk is.',
        es: 'Una enfermedad crónica en la que el cuerpo no usa la insulina de forma eficaz y por qué la detección temprana importa.',
        pt: 'Uma doença crónica em que o corpo não usa a insulina de forma eficaz e por que a deteção precoce é importante.',
        ar: 'حالة مزمنة لا يستخدم فيها الجسم الأنسولين بفعالية، ولماذا يهمّ الكشف المبكر.',
        tr: 'Vücudun insülini etkili kullanamadığı kronik bir durum ve erken teşhisin neden önemli olduğu.'
      },
      mins: 3
    },
    {
      slug: 'why-saliva.html',
      category: {
        en: 'Science', nl: 'Wetenschap', es: 'Ciencia',
        pt: 'Ciência', ar: 'علم',          tr: 'Bilim'
      },
      title: {
        en: 'Why Saliva? ATR-FTIR Spectroscopy Explained',
        nl: 'Waarom speeksel? ATR-FTIR-spectroscopie uitgelegd',
        es: '¿Por qué saliva? La espectroscopía ATR-FTIR explicada',
        pt: 'Porquê a saliva? A espetroscopia ATR-FTIR explicada',
        ar: 'لماذا اللعاب؟ شرح تقنية ATR-FTIR الطيفية',
        tr: 'Neden tükürük? ATR-FTIR spektroskopisi açıklaması'
      },
      desc: {
        en: 'Saliva carries molecular signals of metabolic change. Infrared spectroscopy captures these as a fingerprint a neural network can read.',
        nl: 'Speeksel bevat moleculaire signalen van metabole veranderingen die infraroodspectroscopie als vingerafdruk kan vastleggen.',
        es: 'La saliva contiene señales moleculares del metabolismo que la espectroscopía infrarroja captura como una huella legible por la red neuronal.',
        pt: 'A saliva contém sinais moleculares de alterações metabólicas que a espetroscopia infravermelha capta como uma impressão legível pela rede neuronal.',
        ar: 'يحمل اللعاب إشارات جزيئية عن التغيرات الأيضية تلتقطها طيفية الأشعة تحت الحمراء كبصمة تقرأها الشبكة العصبية.',
        tr: 'Tükürük, sinir ağının okuyabileceği bir parmak izi olarak yakalanan metabolik değişimin moleküler sinyallerini taşır.'
      },
      mins: 4
    }
    /* ── add new articles here ─────────────────────────────────────────────
    {
      slug: 'risk-and-prevention.html',
      category: { en: 'Context', nl: 'Context', ... },
      title:    { en: 'Risk Factors & Prevention', nl: '...', ... },
      desc:     { en: '...', nl: '...', ... },
      mins: 3
    },
    ────────────────────────────────────────────────────────────────────── */
  ],

  /* ── RESOURCES ────────────────────────────────────────────────────────────
     type  : 'video' | 'article' | 'data'
     title : link title  (plain English; team can localise if needed)
     url   : external URL
     desc  : one-sentence description
  ────────────────────────────────────────────────────────────────────────── */
  resources: [
    {
      type: 'video',
      title: 'What is Type 2 Diabetes? (animated explainer)',
      url: 'https://www.youtube.com/watch?v=wZAjVQWbMlE',
      desc: 'A short, plain-language overview of insulin resistance and blood glucose.'
    },
    {
      type: 'video',
      title: 'How FTIR spectroscopy works',
      url: 'https://www.youtube.com/watch?v=eM5jrRqDoUw',
      desc: 'The basics of infrared spectra and molecular fingerprints.'
    },
    {
      type: 'article',
      title: 'IDF Diabetes Atlas — facts & figures',
      url: 'https://idf.org/about-diabetes/diabetes-facts-figures/',
      desc: 'Global prevalence statistics used throughout this project.'
    },
    {
      type: 'article',
      title: 'WHO — Diabetes fact sheet',
      url: 'https://www.who.int/news-room/fact-sheets/detail/diabetes',
      desc: 'Authoritative overview of types, symptoms and prevention.'
    },
    {
      type: 'data',
      title: 'Dataset obtained from . Attenuated total reflection FTIR dataset for identification of type 2 diabetes using saliva',
      url: 'https://doi.org/10.6084/m9.figshare.19450916.v1',
      desc: ''
    }
    /* ── add new resources here ──────────────────────────────────────────── */
  ],

  /* ── TEAM (shown on about.html) ───────────────────────────────────────────
     Edit names and roles freely. `initials` shows in the avatar circle until
     you drop in a photo: set photo:'assets/img/aiham.jpg' to use an image.
     `role` is an object so it can be translated per language (English fallback).
  ────────────────────────────────────────────────────────────────────────── */
  team: [
    { name: 'Aiham', photo: '',
      role: { en: 'Team member', nl: 'Teamlid' } },
    { name: 'Deniz', photo: '',
      role: { en: 'Team member', nl: 'Teamlid' } },
    { name: 'Ruben', photo: '',
      role: { en: 'Team member', nl: 'Teamlid' } },
    { name: 'Lucas L.', photo: '',
      role: { en: 'Team member', nl: 'Teamlid' } },
    { name: 'Lucas van Z.', photo: '',
      role: { en: 'Team member', nl: 'Teamlid' } },
    { name: 'Marc', photo: '',
      role: { en: 'Team member', nl: 'Teamlid' } }
    /* ── edit team members here ───────────────────────────────────── */
  ]
};
