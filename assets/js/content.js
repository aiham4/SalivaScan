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
        en: 'Background', nl: 'Context', es: 'Contexto',
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
      url: 'https://www.youtube.com/watch?v=oDOVXww7sSE',
      desc: {
        en: 'A short, plain-language overview of insulin resistance and blood glucose.',
        nl: 'Een korte, toegankelijke uitleg over insulineresistentie en bloedglucose.',
        es: 'Una descripción breve y accesible de la resistencia a la insulina y la glucosa en sangre.',
        pt: 'Uma explicação breve e acessível sobre a resistência à insulina e a glicose no sangue.',
        ar: 'شرح مختصر وميسّر للمقاومة للأنسولين والجلوكوز في الدم.',
        tr: 'İnsülin direnci ve kan şekeri hakkında kısa, anlaşılır bir genel bakış.'
      }
    },
    {
      type: 'video',
      title: 'How FTIR spectroscopy works',
      url: 'https://youtu.be/0e_xBwQ7znI',
      desc: {
        en: 'The basics of infrared spectra and molecular fingerprints.',
        nl: 'De basis van infraroodspectra en moleculaire vingerafdrukken.',
        es: 'Los fundamentos de los espectros infrarrojos y las huellas moleculares.',
        pt: 'Os fundamentos dos espetros infravermelhos e das impressões moleculares.',
        ar: 'أساسيات الأطياف بالأشعة تحت الحمراء والبصمات الجزيئية.',
        tr: 'Kızılötesi spektrumların ve moleküler parmak izlerinin temelleri.'
      }
    },
    {
      type: 'article',
      title: 'IDF Diabetes Atlas — facts & figures',
      url: 'https://idf.org/about-diabetes/diabetes-facts-figures/',
      desc: {
        en: 'Global prevalence statistics used throughout this project.',
        nl: 'Wereldwijde prevalentiecijfers die in dit project zijn gebruikt.',
        es: 'Estadísticas mundiales de prevalencia utilizadas en este proyecto.',
        pt: 'Estatísticas mundiais de prevalência usadas ao longo deste projeto.',
        ar: 'إحصاءات الانتشار العالمية المستخدمة طوال هذا المشروع.',
        tr: 'Bu proje boyunca kullanılan küresel yaygınlık istatistikleri.'
      }
    },
    {
      type: 'article',
      title: 'WHO — Diabetes fact sheet',
      url: 'https://www.who.int/news-room/fact-sheets/detail/diabetes',
      desc: {
        en: 'Authoritative overview of types, symptoms and prevention.',
        nl: 'Gezaghebbend overzicht van typen, symptomen en preventie.',
        es: 'Resumen autorizado de tipos, síntomas y prevención.',
        pt: 'Resumo autoritativo de tipos, sintomas e prevenção.',
        ar: 'نظرة عامة موثوقة على أنواع السكري وأعراضه والوقاية منه.',
        tr: 'Diyabet türleri, belirtileri ve önlenmesine ilişkin güvenilir genel bakış.'
      }
    },
    {
      type: 'article',
      title: 'Type 2 diabetes diagnosis via FTIR saliva spectra and ML — Sanchez-Brito et al. (2021)',
      url: 'https://www.sciencedirect.com/science/article/abs/pii/S1746809421004523',
      desc: {
        en: 'The study underlying the dataset: 1,000 participants, LDA/KNN/SVM/ANN compared on saliva ATR-FTIR spectra for diabetic vs healthy classification.',
        nl: 'De studie achter de dataset: 1.000 deelnemers, LDA/KNN/SVM/ANN vergeleken op speeksel-ATR-FTIR-spectra voor classificatie diabetisch vs. gezond.',
        es: 'El estudio en el que se basa el conjunto de datos: 1.000 participantes, LDA/KNN/SVM/ANN comparados sobre espectros de saliva ATR-FTIR para clasificación diabético vs. sano.',
        pt: 'O estudo subjacente ao conjunto de dados: 1.000 participantes, LDA/KNN/SVM/ANN comparados em espetros de saliva ATR-FTIR para classificação diabético vs. saudável.',
        ar: 'الدراسة التي يستند إليها مجموعة البيانات: 1,000 مشارك، مقارنة بين LDA وKNN وSVM وANN على أطياف اللعاب ATR-FTIR لتصنيف المصابين بالسكري مقابل الأصحاء.',
        tr: 'Veri setinin dayandığı çalışma: 1.000 katılımcıyla LDA/KNN/SVM/ANN yöntemleri, diyabetik ve sağlıklı sınıflandırması için tükürük ATR-FTIR spektrumları üzerinde karşılaştırılmıştır.'
      }
    },
   {
     type: 'data',
     title: 'ATR-FTIR Saliva Dataset for Type 2 Diabetes (SEDENA, Mexico)',
     url: 'https://doi.org/10.6084/m9.figshare.19450916.v1',
     desc: {
       en: '1,040 ATR-FTIR saliva spectra (540 diabetic, 500 control) collected at SEDENA, Mexico. The primary dataset for this project. Sanchez-Brito et al., 2022.',
       nl: '1.040 ATR-FTIR-speekselspectra (540 diabetisch, 500 controle) verzameld bij SEDENA, Mexico. De primaire dataset van dit project. Sanchez-Brito et al., 2022.',
       es: '1.040 espectros de saliva ATR-FTIR (540 diabéticos, 500 control) recopilados en SEDENA, México. El conjunto de datos principal de este proyecto. Sanchez-Brito et al., 2022.',
       pt: '1.040 espetros de saliva ATR-FTIR (540 diabéticos, 500 controlo) recolhidos no SEDENA, México. O conjunto de dados principal deste projeto. Sanchez-Brito et al., 2022.',
       ar: '1,040 طيفًا للعاب بتقنية ATR-FTIR (540 مصابًا بالسكري، 500 ضابط) من SEDENA، المكسيك. مجموعة البيانات الرئيسية لهذا المشروع. Sanchez-Brito وآخرون، 2022.',
       tr: 'SEDENA, Meksika\'da toplanan 1.040 ATR-FTIR tükürük spektrumu (540 diyabetik, 500 kontrol). Bu projenin temel veri kümesi. Sanchez-Brito vd., 2022.'
     }
   },
    /* ── add new resources here ──────────────────────────────────────────── */
  ],

  /* ── TEAM (shown on about.html) ───────────────────────────────────────────
     Edit names and roles freely. `initials` shows in the avatar circle until
     you drop in a photo: set photo:'assets/img/aiham.jpg' to use an image.
     `role` is an object so it can be translated per language (English fallback).
  ────────────────────────────────────────────────────────────────────────── */
  team: [
    { name: 'Aiham', initials: 'AA', photo: '',
      role: { en: 'Team member', nl: 'Teamlid' } },
    { name: 'Deniz', initials: 'DB', photo: '',
      role: { en: 'Team member', nl: 'Teamlid' } },
    { name: 'Lucas L.', initials: 'LL', photo: '',
      role: { en: 'Team member', nl: 'Teamlid' } },
    { name: 'Lucas van Z.', initials: 'LZ', photo: '',
      role: { en: 'Team member', nl: 'Teamlid' } },
    { name: 'Marc', initials: 'ME', photo: '',
      role: { en: 'Team member', nl: 'Teamlid' } },
    { name: 'Ruben', initials: 'RK', photo: '',
      role: { en: 'Team member', nl: 'Teamlid' } }
    /* ── edit team members here ───────────────────────────────────── */
  ]
};
