# SalivaScan - 4CBLW010 Group 5

A client-side web prototype for non-invasive Type 2 diabetes screening from ATR-FTIR saliva spectra, built as part of the Multi-Disciplinary CBL course at TU/e (2025–2026).

**Live site:** https://cbl.aiham.nl

---

## What it does

A user uploads a raw ATR-FTIR saliva spectrum (CSV or JSON). The browser preprocesses the spectrum and runs it through a trained neural network model, returning a risk classification and confidence score. No data is sent to any server - all computation runs locally in the browser.

## How it works

The full pipeline runs client-side:

1. **Preprocessing** (`normalize.js`) - ALS baseline correction → Standard Normal Variate normalisation → Savitzky–Golay smoothing (poly=3, window=11), reproducing the pipeline described in the report.
2. **Inference** (`analyzer.js`) - the preprocessed 3,736-point spectrum is passed to the ONNX model via ONNX Runtime Web (WebAssembly).
3. **Classification** - scores ≥ 0.60 are labelled elevated risk; scores below are labelled low risk. A confidence percentage shows how far the score is from the threshold.

## Model

`ann_pls_normalized.onnx` - the ANN+PLS model trained on the normalised dataset, selected as the best-performing model in the report (average recall 0.920, average F1 0.922 over 16 randomised trials).

## Repository structure

```
├── index.html                  Main page
├── about.html                  Team and project description
├── ann_pls_normalized.onnx     Exported model
├── assets/
│   ├── css/                    Styling (tokens + layout)
│   ├── js/
│   │   ├── config.js           Model parameters and language configuration
│   │   ├── normalize.js        Client-side preprocessing pipeline
│   │   ├── analyzer.js         File parsing, model loading, inference
│   │   ├── content.js          Article and resource definitions
│   │   ├── i18n.js             Translation engine
│   │   └── main.js             Page initialisation
│   └── locales/                One translation file per language
│       en.js  nl.js  es.js  ca.js  pt.js  ar.js  tr.js
└── learn/
    ├── index.html              Learn hub
    ├── what-is-diabetes.html   Background article
    ├── why-saliva.html         ATR-FTIR and spectroscopy article
    └── resources.html          Curated references and links
```

## Languages

English, Dutch, Spanish, Catalan, Portuguese, Arabic, Turkish.

## Running locally

Opening `index.html` directly via `file://` may block the model from loading in some browsers. To run locally:

```
python3 -m http.server
```

Then open `http://localhost:8000`.
