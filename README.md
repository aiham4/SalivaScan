# SalivaScan website

Restructured from the old single `index.html` into organised files so we
can edit content, check translations, and add pages without touching the logic.

## Structure

```
salivascan/
├── index.html                  Main page (tool + how + learn cards)
├── CNAME                        Custom domain
├── ann_optuna.onnx             ← ADD THIS: your exported model (not included)
├── assets/
│   ├── css/
│   │   ├── tokens.css          Colours + light/dark themes. Edit colours HERE only.
│   │   └── styles.css          Layout + components (responsive, RTL).
│   ├── js/
│   │   ├── config.js           ⚙ Model contract + languages + theme. Edit this first.
│   │   ├── theme.js            Light/dark toggle.
│   │   ├── i18n.js             Translation engine (no fetch, works offline).
│   │   ├── analyzer.js         File parsing + model load (with progress) + inference.
│   │   └── main.js             Boot.
│   └── locales/                One file per language — translators edit these.
│       ├── en.js  (reference)  nl.js  es.js  pt.js  ar.js  tr.js
└── learn/
    ├── index.html              Learn hub
    ├── what-is-diabetes.html   Article (template — clone for new topics)
    ├── why-saliva.html         Article
    └── resources.html          Curated videos + article links (edit freely)
```

## To deploy
1. Drop your exported model in the root as `ann_optuna.onnx`.
2. Push everything to the GitHub Pages repo.

## To change the model
Edit only `assets/js/config.js → model`. If Deniz re-exports, update
`inputName`, `outputName`, `inputLength`, `threshold` there. Nothing else changes.

## To check / fix a translation
Open `assets/locales/<lang>.js`. Each value sits on its own line next to its key.
Compare against `en.js`. Put your name in the `review` comment at the top once checked.
English is always the fallback, so a missing key never breaks the page.

## To add a language
1. Copy `en.js` → `xx.js`, translate the values.
2. Add `{ code:'xx', label:'XX', rtl:false }` to `config.js → languages`.
3. Add `<script src="assets/locales/xx.js"></script>` before `i18n.js` in every HTML file.

## To add a Learn article
Copy `learn/what-is-diabetes.html`, replace the text inside `<main class="article">`,
and link it from `learn/index.html`.

## Local testing note
Opening `index.html` directly (file://) may block the model download in some
browsers. Run a quick local server instead:  `python3 -m http.server`  then open
`http://localhost:8000`. On GitHub Pages it just works.
