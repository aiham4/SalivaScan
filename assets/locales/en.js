/* English — reference language. When adding keys, add them here first,
   then copy the key into every other locale file so nothing falls back silently. */
window.SS_I18N = window.SS_I18N || {};
window.SS_I18N.en = {
  // nav
  nav_tool: 'Tool', nav_how: 'How it works', nav_learn: 'Learn',
  theme_toggle: 'Toggle dark mode',

  // hero
  hero_eyebrow: 'Research Prototype · TU/e Group 5',
  hero_title: 'Non-invasive diabetes <em>screening</em> from saliva spectra',
  hero_desc: 'Upload an ATR-FTIR infrared spectrum from a saliva sample and get an instant machine-learning screening estimate for Type 2 diabetes risk.',
  hero_disclaimer: 'This tool is a research proof-of-concept only. It does not provide a medical diagnosis. Always consult a healthcare professional.',
  stat_samples: 'Training samples', stat_method: 'Spectroscopy method', stat_task: 'Classification task',

  // model status
  model_loading: 'Loading the AI model…', model_ready: 'AI model ready.',
  model_error: 'The model failed to load.',
  model_wait: 'The model is still loading — please wait a moment.',
  retry: 'Retry',

  // tool
  tool_eyebrow: 'Spectrum Analyzer', tool_title: 'Upload your spectrum file',
  tool_subtitle: 'Accepted formats: CSV (wavenumber, absorbance columns) or a JSON array of absorbance values across 399–4000 cm⁻¹.',
  upload_title: 'Drop file here or click to browse',
  upload_sub: 'Your file never leaves your browser — nothing is uploaded or stored.',
  btn_analyze: 'Analyze Spectrum',
  result_label: 'Screening Result', confidence_label: 'Confidence score',
  meta_points: 'Spectral points', meta_range: 'Wavenumber range', meta_model: 'Model',
  chart_title: 'Uploaded infrared spectrum',
  result_disclaimer: 'This result comes from a research model trained on 1,040 ATR-FTIR saliva spectra. It is not a clinical diagnosis. Saliva composition is affected by diet, hydration, and oral health. Please consult a medical professional for proper testing.',
  low_risk: 'Low risk of Type 2 diabetes detected',
  high_risk: 'Elevated risk — please consult a doctor',
  medium_risk: 'Uncertain — follow-up recommended',

  // how it works
  how_eyebrow: 'The Process', how_title: 'How does it work?',
  how_subtitle: 'From saliva sample to screening result in four steps.',
  step1_title: 'Collect saliva', step1_desc: 'A small saliva sample is collected after fasting. No needles, no blood.',
  step2_title: 'ATR-FTIR scan', step2_desc: 'The sample is scanned with infrared spectroscopy to capture its molecular fingerprint.',
  step3_title: 'Upload spectrum', step3_desc: 'Export the spectrum as a CSV or JSON file and upload it here.',
  step4_title: 'AI screening', step4_desc: 'The neural network analyzes the spectral pattern and outputs a risk confidence score.',

  // learn cards
  edu_eyebrow: 'Type 2 Diabetes — Learn More', edu_title: 'Understanding Type 2 Diabetes',
  learn_more: 'Read more →',
  edu1_title: 'What is Type 2 Diabetes?', edu1_desc: 'A chronic condition where the body does not use insulin effectively, raising blood glucose. It accounts for over 90% of diabetes cases worldwide.',
  edu2_title: 'Risk Factors', edu2_desc: 'Being overweight, physical inactivity, family history, age over 45, and a history of gestational diabetes. Lifestyle changes can reduce risk.',
  edu3_title: 'Why Saliva?', edu3_desc: 'Saliva carries biochemical signals of metabolic change. ATR-FTIR can detect molecular differences between diabetic and non-diabetic saliva.',
  edu4_title: 'Prevention', edu4_desc: 'Regular activity (150 min/week), a balanced low-sugar diet, a healthy weight, and not smoking significantly lower your risk.',
  edu5_title: 'About This Tool', edu5_desc: 'A TU/e Multi-Disciplinary CBL prototype, trained on the SEDENA saliva dataset (Mexico). It is not a certified medical device.',
  edu6_title: 'Get Tested Properly', edu6_desc: 'Official screening uses fasting blood glucose (≥126 mg/dL) or HbA1c (≥6.5%). If concerned, contact your GP — early detection helps.',

  // footer
  footer_note: 'Research prototype — not a medical device. For educational purposes only.',

  // learn hub / articles
  learn_hub_title: 'Learn', learn_hub_sub: 'Background reading, the science behind the tool, and curated resources.',
  learn_back: '← Back to tool',
  res_title: 'Resources', res_sub: 'Hand-picked videos and articles to go deeper.'
};
