/* =============================================================================
   analyzer.js — the working tool
   - Loads the ONNX model with a real download progress bar
   - Parses CSV / JSON spectra in-browser (nothing is uploaded)
   - Runs inference using the contract defined in config.js
   All model details come from SS_CONFIG.model — do not hard-code them here.
============================================================================= */
(function () {
  var M = (window.SS_CONFIG && window.SS_CONFIG.model) || {};
  var T = function (k) { return window.SSi18n ? window.SSi18n.t(k) : k; };

  var ortSession  = null;
  var uploadedData = null;
  var loadingNow  = false;

  // ---- DOM refs ------------------------------------------------------------
  function $(id) { return document.getElementById(id); }

  // ---- Model status UI -----------------------------------------------------
  function setStatus(state, opts) {
    opts = opts || {};
    var box  = $('modelStatus');
    var txt  = $('modelStatusText');
    var fill = $('modelProgressFill');
    if (!box) return;
    box.setAttribute('data-state', state);
    if (txt) txt.textContent = opts.text || '';
    if (fill && opts.pct != null) fill.style.width = opts.pct + '%';
    // keep analyze button honest about readiness
    refreshAnalyzeBtn();
  }

  function refreshAnalyzeBtn() {
    var btn = $('analyzeBtn');
    if (!btn) return;
    // enabled when a file is loaded; model readiness is checked on click
    btn.disabled = !uploadedData;
  }

  // ---- Model loading with progress ----------------------------------------
  async function loadModel() {
    if (loadingNow || ortSession) return;
    loadingNow = true;
    setStatus('loading', { text: T('model_loading'), pct: 5 });

    try {
      ort.env.wasm.wasmPaths = M.wasmBase;

      var bytes = await fetchWithProgress(M.path, function (pct) {
        setStatus('loading', { text: T('model_loading'), pct: Math.max(5, pct) });
      });

      // building the WASM session is the last, non-measurable step
      setStatus('loading', { text: T('model_loading'), pct: 96 });

      ortSession = await ort.InferenceSession.create(bytes, {
        executionProviders: ['wasm']
      });

      console.log('Model inputs :', ortSession.inputNames);
      console.log('Model outputs:', ortSession.outputNames);
      setStatus('ready', { text: T('model_ready'), pct: 100 });

    } catch (err) {
      console.error('Model load failed:', err);
      // fallback: let ORT load straight from URL (no progress) — covers cases
      // where manual fetch is blocked (e.g. opening via file://)
      try {
        ortSession = await ort.InferenceSession.create(M.path, { executionProviders: ['wasm'] });
        setStatus('ready', { text: T('model_ready'), pct: 100 });
      } catch (err2) {
        console.error('Fallback load failed:', err2);
        setStatus('error', { text: T('model_error') });
      }
    }
    loadingNow = false;
  }

  // stream a file and report download progress 0–95
  async function fetchWithProgress(url, onProgress) {
    var resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status + ' for ' + url);

    var total = parseInt(resp.headers.get('Content-Length') || '0', 10);

    if (!resp.body || !total) {
      // no streaming / unknown size: just return the buffer
      var buf = await resp.arrayBuffer();
      onProgress(95);
      return new Uint8Array(buf);
    }

    var reader = resp.body.getReader();
    var received = 0;
    var chunks = [];
    while (true) {
      var r = await reader.read();
      if (r.done) break;
      chunks.push(r.value);
      received += r.value.length;
      onProgress(Math.min(95, Math.round((received / total) * 95)));
    }
    var out = new Uint8Array(received);
    var pos = 0;
    chunks.forEach(function (c) { out.set(c, pos); pos += c.length; });
    return out;
  }

  // ---- Inference -----------------------------------------------------------
  async function runInference(spectrum) {
    var tensor = new ort.Tensor('float32', new Float32Array(spectrum), [M.inputLength]);
    var feeds = {};
    feeds[M.inputName] = tensor;
    var results = await ortSession.run(feeds);
    return results[M.outputName].cpuData[0];
  }

  // ---- Analyze (public) ----------------------------------------------------
  window.analyze = async function () {
    if (!uploadedData) return;

    // if the model isn't ready yet, tell the user to wait rather than failing
    if (!ortSession) {
      showMessage('medium', T('model_wait'));
      if (!loadingNow) loadModel();
      return;
    }

    $('spinner').classList.add('show');
    $('analyzeBtn').disabled = true;
    $('resultsCard').classList.remove('show');

    try {
      if (uploadedData.length !== M.inputLength) {
        throw new Error('Expected ' + M.inputLength + ' spectral points but got ' +
          uploadedData.length + '. Make sure your file covers the full 399–4000 cm⁻¹ range.');
      }
      var score = await runInference(uploadedData);
      renderResult(score, uploadedData.length);
    } catch (err) {
      console.error(err);
      showMessage('medium', err.message);
    } finally {
      $('spinner').classList.remove('show');
      $('analyzeBtn').disabled = false;
    }
  };

  // ---- Render result -------------------------------------------------------
  function renderResult(score, numPoints) {
    var icon = $('resultIcon'), text = $('resultText');
    var fill = $('confidenceFill'), pct = $('confidencePct');

    $('metaPoints').textContent = numPoints.toLocaleString();
    $('metaRange').textContent  = '399 – 4000 cm⁻¹';

    var threshold = M.threshold;
    var conf;
    if (score < threshold) {
      conf = Math.round((1 - score / threshold) * 100);
      icon.className = 'result-icon low';  icon.textContent = '✓';
      text.className = 'result-value low'; text.textContent = T('low_risk');
      fill.className = 'confidence-fill';
    } else {
      conf = Math.round(((score - threshold) / (1 - threshold)) * 100);
      icon.className = 'result-icon high';  icon.textContent = '!';
      text.className = 'result-value high'; text.textContent = T('high_risk');
      fill.className = 'confidence-fill high-risk';
    }
    fill.style.width = conf + '%';
    pct.textContent  = conf + '%';

    $('resultsCard').classList.add('show');
    drawChart(uploadedData);
    $('resultsCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // generic message into the result card (errors / "please wait")
  function showMessage(kind, msg) {
    $('resultsCard').classList.add('show');
    $('resultIcon').textContent = kind === 'medium' ? '⚠' : 'i';
    $('resultIcon').className    = 'result-icon medium';
    $('resultText').textContent  = msg;
    $('resultText').className     = 'result-value medium';
    $('confidenceFill').style.width = '0%';
    $('confidencePct').textContent  = '';
    $('metaPoints').textContent = '—';
    $('metaRange').textContent  = '—';
  }

  // ---- File handling -------------------------------------------------------
  window.handleFile = function (e) {
    var file = e.target.files[0];
    if (!file) return;

    $('fileName').textContent = file.name;
    $('fileMeta').textContent = (file.size / 1024).toFixed(1) + ' KB · ' + file.name.split('.').pop().toUpperCase();
    $('fileIcon').textContent = file.name.toLowerCase().endsWith('.json') ? '{ }' : '📊';
    $('fileInfo').classList.add('show');

    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var raw = ev.target.result, data;
        if (file.name.toLowerCase().endsWith('.json')) {
          var parsed = JSON.parse(raw);
          data = Array.isArray(parsed) ? parsed : Object.values(parsed);
        } else {
          var lines = raw.trim().split('\n').filter(function (l) {
            return l.trim() && !/[a-df-z]/i.test(l);  // drop header rows with letters
          });
          data = lines.map(function (line) {
            var p = line.split(',').map(function (x) { return parseFloat(x.trim()); });
            return p.length >= 2 ? p[1] : p[0];
          }).filter(function (v) { return !isNaN(v); });
        }
        uploadedData = data;
        console.log('Loaded', data.length, 'spectral points');
      } catch (err) {
        console.error('Parse error:', err);
        uploadedData = null;
      }
      refreshAnalyzeBtn();
    };
    reader.readAsText(file);
  };

  window.clearFile = function () {
    $('fileInfo').classList.remove('show');
    $('fileInput').value = '';
    $('resultsCard').classList.remove('show');
    uploadedData = null;
    refreshAnalyzeBtn();
  };

  // ---- Chart ---------------------------------------------------------------
  window.drawChart = function (data) {
    var canvas = $('spectrumChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth || 600;
    canvas.height = 110;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var pts = (data && data.length > 10) ? data : [];
    if (!pts.length) return;
    var w = canvas.width, h = canvas.height;
    var max = Math.max.apply(null, pts), min = Math.min.apply(null, pts);
    var range = max - min || 1;
    var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2563EB';

    ctx.beginPath();
    pts.forEach(function (v, i) {
      var x = (i / (pts.length - 1)) * w;
      var y = h - ((v - min) / range) * (h * 0.82) - h * 0.08;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, accent + '33');
    grad.addColorStop(1, accent + '00');
    ctx.fillStyle = grad; ctx.fill();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
    ctx.font = '10px Sora, sans-serif';
    ctx.fillText('4000', 4, h - 4);
    ctx.fillText('400 cm⁻¹', w - 56, h - 4);
  };

  // ---- Drag & drop + retry -------------------------------------------------
  window.SSAnalyzer = {
    init: function () {
      var uc = $('uploadCard');
      if (uc) {
        uc.addEventListener('dragover',  function (e) { e.preventDefault(); uc.classList.add('drag-over'); });
        uc.addEventListener('dragleave', function ()  { uc.classList.remove('drag-over'); });
        uc.addEventListener('drop', function (e) {
          e.preventDefault(); uc.classList.remove('drag-over');
          if (e.dataTransfer.files[0]) window.handleFile({ target: { files: e.dataTransfer.files } });
        });
      }
      var retry = $('modelRetry');
      if (retry) retry.addEventListener('click', loadModel);
      loadModel();   // start downloading immediately
    },
    reloadStatusText: function () {
      // called after a language switch so the status line follows the language
      var box = $('modelStatus');
      if (!box) return;
      var state = box.getAttribute('data-state');
      var map = { loading: 'model_loading', ready: 'model_ready', error: 'model_error' };
      if (map[state]) $('modelStatusText').textContent = T(map[state]);
    }
  };
})();
