/* Català — revisat per: ____  (escriu el teu nom després de revisar-ho) */
window.SS_I18N = window.SS_I18N || {};
window.SS_I18N.ca = {
  // nav
  nav_tool: 'Eina', nav_how: 'Com funciona', nav_learn: 'Aprèn',
  theme_toggle: 'Canvia el mode fosc',

  // hero
  hero_eyebrow: 'Prototip de recerca · 4CBLW010 Grup 5',
  hero_title: 'Cribratge <em>no invasiu</em> de diabetis a partir d\'espectres de saliva',
  hero_desc: 'Puja un espectre infraroig ATR-FTIR d\'una mostra de saliva i obté de seguida una estimació de cribratge per aprenentatge automàtic del risc de diabetis de tipus 2.',
  hero_disclaimer: 'Aquesta eina és només un prototip de recerca. No proporciona un diagnòstic mèdic. Consulta sempre un professional de la salut.',
  stat_samples: 'Mostres d\'entrenament', stat_method: 'Mètode espectroscòpic', stat_task: 'Tasca de classificació',

  // model status
  model_loading: 'Carregant el model d\'IA…', model_ready: 'Model d\'IA llest.',
  model_error: 'No s\'ha pogut carregar el model.',
  model_wait: 'El model encara s\'està carregant — espera un moment.',
  retry: 'Torna-ho a intentar',

  // tool
  tool_eyebrow: 'Analitzador d\'espectres', tool_title: 'Puja el teu fitxer d\'espectre',
  tool_subtitle: 'Formats acceptats: CSV (número d\'ona, absorbància) o una matriu JSON de valors d\'absorbància entre 399 i 4000 cm⁻¹.',
  upload_title: 'Arrossega el fitxer aquí o fes clic per cercar',
  upload_sub: 'El teu fitxer no surt mai del navegador — no es puja ni s\'emmagatzema res.',
  btn_analyze: 'Analitza l\'espectre',
  result_label: 'Resultat del cribratge', confidence_label: 'Confiança en aquest resultat',
  meta_points: 'Punts espectrals', meta_range: 'Rang de número d\'ona', meta_model: 'Model',
  chart_title: 'Espectre infraroig pujat',
  result_disclaimer: 'Aquest resultat prové d\'un model de recerca entrenat amb 1.040 espectres de saliva ATR-FTIR. No és un diagnòstic clínic. La composició de la saliva es veu afectada per la dieta, la hidratació i la salut bucal. Consulta un professional mèdic per a una prova adequada.',
  low_risk: 'Risc baix de diabetis de tipus 2 detectat',
  high_risk: 'Risc elevat — consulta un metge',
  medium_risk: 'Incert — es recomana seguiment',

  // how it works
  how_eyebrow: 'El procés', how_title: 'Com funciona?',
  how_subtitle: 'De la mostra de saliva al resultat en quatre passos.',
  step1_title: 'Recollir saliva', step1_desc: 'Es recull una petita mostra de saliva en dejú. Sense agulles, sense sang.',
  step2_title: 'Escaneig ATR-FTIR', step2_desc: 'La mostra s\'escaneja amb espectroscòpia d\'infraroig per capturar la seva empremta molecular.',
  step3_title: 'Pujar l\'espectre', step3_desc: 'Exporta l\'espectre com a fitxer CSV o JSON i puja\'l aquí.',
  step4_title: 'Cribratge amb IA', step4_desc: 'La xarxa neuronal analitza el patró espectral i produeix una puntuació de risc.',

  // learn cards
  edu_eyebrow: 'Aprèn', edu_title: 'Lectures addicionals',
  learn_more: 'Llegeix més →',
  edu1_title: 'Què és la diabetis de tipus 2?', edu1_desc: 'Una condició crònica en la qual el cos no usa la insulina de manera eficaç, elevant la glucosa en sang. Representa més del 90 % dels casos de diabetis al món.',
  edu2_title: 'Factors de risc', edu2_desc: 'Sobrepès, inactivitat física, antecedents familiars, edat superior a 45 anys i diabetis gestacional prèvia. Els canvis en l\'estil de vida redueixen el risc.',
  edu3_title: 'Per què la saliva?', edu3_desc: 'La saliva porta senyals bioquímics dels canvis metabòlics. L\'ATR-FTIR pot detectar diferències moleculars entre saliva diabètica i no diabètica.',
  edu4_title: 'Prevenció', edu4_desc: 'Activitat regular (150 min/setmana), una dieta equilibrada baixa en sucre, un pes saludable i no fumar redueixen notablement el risc.',
  edu5_title: 'Sobre aquesta eina', edu5_desc: 'Un prototip CBL multidisciplinari de la TU/e, entrenat amb el conjunt de dades de saliva SEDENA (Mèxic). No és un dispositiu mèdic certificat.',
  edu6_title: 'Fes-te la prova correctament', edu6_desc: 'El cribratge oficial utilitza glucosa en dejú (≥126 mg/dL) o HbA1c (≥6,5 %). Si et preocupa, contacta el teu metge — la detecció precoç ajuda.',

  // footer
  footer_note: 'Prototip de recerca — no és un dispositiu mèdic. Només amb finalitats educatives.',

  // learn hub / articles
  learn_hub_title: 'Aprèn', learn_hub_sub: 'Lectures de context, la ciència darrere de l\'eina i recursos seleccionats.',
  learn_back: '← Torna a l\'eina',
  res_title: 'Recursos', res_sub: 'Vídeos i articles seleccionats per aprofundir.',

  // score bar + explanation
  raw_score_label: 'Puntuació de la xarxa neuronal',
  threshold_label: 'Llindar',
  how_computed_btn: 'Com es calcula això?',
  how_p1: 'La xarxa neuronal produeix un número entre 0 i 1 per a cada espectre — la <strong>puntuació del model</strong>. Es genera mitjançant una activació sigmoide a la capa final, de manera que sempre cau en aquest rang.',
  how_p2: "Un <strong>llindar</strong> fix (actualment <code id=\"threshExplain\">0,60</code>, establert durant l'avaluació del model) actua com a frontera de classificació. Les puntuacions iguals o superiors al llindar s'etiqueten com a <em>risc elevat</em>; les inferiors com a <em>risc baix</em>.",
  how_p3: "El <strong>percentatge de confiança</strong> mesura la distància entre la puntuació i la frontera, reescalada a 0–100 %. Una puntuació just al llindar dóna un 0 % (màximament incert); 0,0 o 1,0 dóna el 100 %. Això <em>no</em> és una probabilitat mèdica calibrada — mesura com de decisiva és la sortida del model.",

  // topics + about
  view_all: 'Veure tots els temes →',
  res_sources_note: 'Substitueix aquests pels recursos exactes citats a l\'informe final.',
  nav_about: 'Sobre nosaltres',
  nn_details_btn: 'Mostra la sortida de la xarxa neuronal',
  article_fallback_notice: 'Aquest article encara no està disponible en la llengua seleccionada. Es mostra en anglès.',
  about_title: 'Sobre el projecte',
  about_lead: 'SalivaScan és un prototip de recerca estudiantil creat per a l\'assignatura 4CBLW010 CBL Multidisciplinari de la TU/e. Explora si la diabetis de tipus 2 es pot cribar de manera no invasiva a partir d\'espectres de saliva ATR-FTIR, amb tota l\'anàlisi executant-se de manera privada al teu navegador.',
  about_team_title: 'L\'equip',

  // resource type labels
  type_video: 'Vídeo',
  type_article: 'Article',
  type_data: 'Conjunt de dades'
};
