/* =============================================================================
   SalivaScan — central configuration
   -----------------------------------------------------------------------------
   Everything that the team might need to tweak lives here, so nobody has to
   dig through the analyzer code. Edit this file, not analyzer.js.
============================================================================= */

window.SS_CONFIG = {

  /* ---- ONNX model contract -------------------------------------------------
     These MUST match the names baked into ann_optuna.onnx at export time.
     Verify with Deniz if the model is ever re-exported:
        ortSession.inputNames   -> should contain INPUT_NAME
        ortSession.outputNames  -> should contain OUTPUT_NAME
  ------------------------------------------------------------------------------ */
  model: {
    path:        './ann_optuna.onnx',  // relative to index.html; learn/ pages use ../
    inputName:   'input',              // current deployed export
    outputName:  'type2_confidence',   // current deployed export
    inputLength: 3736,                 // full 399–4000 cm-1 spectrum
    threshold:   0.6,                   // >= this => elevated risk

    /* NOTE FOR THE TEAM:
       The training script (ann_optuna.py) is a REGRESSION on GLUCOSE/500,
       not a true probability. The 0.6 threshold here is the value the
       deployed model was evaluated with. If you switch to the classification
       export, only this block needs to change. */

    // CDN for the onnxruntime-web WASM binaries
    wasmBase: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/'
  },

  /* ---- Languages -----------------------------------------------------------
     code  : matches a file in assets/locales/<code>.js
     label : shown on the switcher button
     rtl   : right-to-left layout (Arabic)
  ------------------------------------------------------------------------------ */
  languages: [
    { code: 'en', label: 'EN', rtl: false },
    { code: 'nl', label: 'NL', rtl: false },
    { code: 'es', label: 'ES', rtl: false },
    { code: 'pt', label: 'PT', rtl: false },
    { code: 'ar', label: 'AR', rtl: true  },
    { code: 'tr', label: 'TR', rtl: false }
  ],
  defaultLang: 'en',

  /* ---- Theme ---------------------------------------------------------------- */
  defaultTheme: 'auto'  // 'auto' = follow OS, or force 'light' / 'dark'
};
