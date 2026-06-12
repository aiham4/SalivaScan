const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

// ----------------------------------------------------
// 0. SETTINGS
// ----------------------------------------------------

const ALS_LAMBDA = 1e6;
const ALS_P = 0.01;
const ALS_ITERATIONS = 10;

const SG_WINDOW = 11;
const SG_POLYORDER = 3;
const SG_DERIV = 0;

// Plot settings
const MAX_SPECTRA_TO_PLOT = 150;

// Hide extreme processed outliers from the plot only
const FILTER_PLOT_OUTLIERS = true;

// Outlier thresholds for plot only
const MAX_PLOT_ABS_MEAN = 3;
const MAX_PLOT_VALUE = 8;
const MIN_PLOT_VALUE = -8;
const MAX_PLOT_RANGE = 20;

// Change these paths if needed
const filename_in = String.raw`C:\Users\lucas\OneDrive - TU Eindhoven\Courses\Y2_Q4\CBL\TrainingAugmented-EMSA-toNormalize.csv`;
const filename_out = String.raw`C:\Users\lucas\OneDrive - TU Eindhoven\Courses\Y2_Q4\CBL\TrainingAugmented-EMSA-NORMALISED-JS.csv`;

// ----------------------------------------------------
// 1. READ CSV
// ----------------------------------------------------

const csvText = fs.readFileSync(filename_in, "utf8");

const DELIMITER = detectDelimiter(csvText);

console.log(`Detected delimiter: "${DELIMITER}"`);

const rows = parse(csvText, {
  columns: false,
  skip_empty_lines: true,
  delimiter: DELIMITER,
  trim: true,
  relax_column_count: true,
});

if (rows.length < 3) {
  throw new Error(
    "CSV file must contain a header row, a wavenumber row, and at least one spectrum row."
  );
}

// Your file looks like this:
// Row 1: Column1, Column2, Column3, ..., label column
// Row 2: real wavenumbers
// Row 3+: actual spectra
const headerRow = rows[0].map(value => String(value).trim());
const firstDataRow = rows[1];

const columnCount = headerRow.length;

if (columnCount < 3) {
  throw new Error("CSV file does not contain enough columns.");
}

// Last column is the label
const labelHeader = headerRow[columnCount - 1] || "Label";

// All columns except the last one are spectral columns
const spectralColumnCount = columnCount - 1;

// The first data row contains the actual wavenumbers
const wavenumbers = firstDataRow
  .slice(0, spectralColumnCount)
  .map(value => toNumber(value));

// Actual spectra start after the wavenumber row
const dataRows = rows.slice(2);

// Use the real wavenumbers as output headers
const spectralHeaders = wavenumbers.map(value => String(value));
const outputHeaders = spectralHeaders.concat([labelHeader]);

if (wavenumbers.some(value => !Number.isFinite(value))) {
  for (let j = 0; j < wavenumbers.length; j++) {
    if (!Number.isFinite(wavenumbers[j])) {
      throw new Error(
        `Bad wavenumber found in CSV row 2, column ${j + 1}. ` +
        `Value was: "${firstDataRow[j]}"`
      );
    }
  }
}

// Labels are in the last column
const labels = dataRows.map(row => toNumber(row[spectralColumnCount]));

// Spectra are all columns except the last one
const spectra = dataRows.map(row =>
  row.slice(0, spectralColumnCount).map(value => toNumber(value))
);

// Check for bad spectral values
for (let i = 0; i < spectra.length; i++) {
  for (let j = 0; j < spectra[i].length; j++) {
    if (!Number.isFinite(spectra[i][j])) {
      throw new Error(
        `Bad spectral value found at CSV row ${i + 3}, column ${j + 1}. ` +
        `Value was: "${dataRows[i][j]}"`
      );
    }
  }
}

// Check for bad labels
for (let i = 0; i < labels.length; i++) {
  if (!Number.isFinite(labels[i])) {
    throw new Error(
      `Bad label found at CSV row ${i + 3}, column ${spectralColumnCount + 1}. ` +
      `Value was: "${dataRows[i][spectralColumnCount]}"`
    );
  }
}

console.log(`Loaded ${spectra.length} spectra x ${spectra[0].length} wavenumber points`);
console.log("First 5 wavenumbers:", wavenumbers.slice(0, 5));
console.log("Last 5 wavenumbers:", wavenumbers.slice(-5));
console.log(`Using "${labelHeader}" only as class label, not as spectral data.`);

// ----------------------------------------------------
// 2. BASELINE CORRECTION — ALS
// ----------------------------------------------------

console.log("Applying ALS baseline correction...");

const spectraAls = spectra.map((row, i) => {
  if ((i + 1) % 100 === 0 || i === spectra.length - 1) {
    console.log(`  ALS spectrum ${i + 1}/${spectra.length}`);
  }

  return alsBaseline(row, ALS_LAMBDA, ALS_P, ALS_ITERATIONS);
});

const spectraCorrected = spectra.map((row, i) =>
  row.map((value, j) => value - spectraAls[i][j])
);

console.log("Done.");

// ----------------------------------------------------
// 3. NORMALISATION — SNV
// ----------------------------------------------------

console.log("Applying SNV normalisation...");

const spectraSnv = spectraCorrected.map((row, i) => {
  const rowMean = mean(row);
  const rowStd = standardDeviation(row);

  if (!Number.isFinite(rowStd) || rowStd === 0) {
    console.log(`Warning: row ${i + 3} has invalid/zero standard deviation. Replacing with zeros.`);
    return row.map(() => 0);
  }

  return row.map(value => (value - rowMean) / rowStd);
});

console.log("Done.");

// ----------------------------------------------------
// 4. SAVITZKY-GOLAY
// ----------------------------------------------------

console.log(
  `Applying Savitzky-Golay ` +
  `(window=${SG_WINDOW}, poly=${SG_POLYORDER}, deriv=${SG_DERIV})...`
);

const sgCoefficients = savitzkyGolayCoefficients(
  SG_WINDOW,
  SG_POLYORDER,
  SG_DERIV
);

const spectraProc = spectraSnv.map(row =>
  applySavitzkyGolay(row, sgCoefficients)
);

console.log("Done.");

// ----------------------------------------------------
// 4.5 CHECK PROCESSED OUTLIERS
// ----------------------------------------------------

console.log("Checking processed spectra for outliers...");

let outlierCount = 0;

for (let i = 0; i < spectraProc.length; i++) {
  if (isProcessedOutlier(spectraProc[i])) {
    outlierCount++;

    const row = spectraProc[i];
    const rowMean = mean(row);
    const rowMin = Math.min(...row);
    const rowMax = Math.max(...row);
    const rowRange = rowMax - rowMin;

    console.log(
      `Possible outlier processed spectrum at original CSV row ${i + 3}: ` +
      `mean=${rowMean.toFixed(4)}, ` +
      `min=${rowMin.toFixed(4)}, ` +
      `max=${rowMax.toFixed(4)}, ` +
      `range=${rowRange.toFixed(4)}, ` +
      `label=${labels[i]}`
    );
  }
}

console.log(`Found ${outlierCount} possible processed outlier spectra.`);

// ----------------------------------------------------
// 5. SAVE CSV
// ----------------------------------------------------
// This saves ALL spectra, including possible outliers.
// Outliers are only hidden from the plot.

const outputRows = spectraProc.map((row, i) => {
  const obj = {};

  spectralHeaders.forEach((header, j) => {
    obj[header] = row[j];
  });

  obj[labelHeader] = labels[i];

  return obj;
});

const outputCsv = stringify(outputRows, {
  header: true,
  columns: outputHeaders,
  delimiter: DELIMITER,
});

fs.writeFileSync(filename_out, outputCsv, "utf8");

console.log(`Saved processed data to "${filename_out}"`);

// ----------------------------------------------------
// 6. SAVE PLOT HTML
// ----------------------------------------------------

const outFolder = path.dirname(filename_in);
const plotPath = path.join(outFolder, "ftir_spectra_comparison_js.html");

savePlotHtml(
  plotPath,
  wavenumbers,
  spectra,
  spectraProc,
  labels
);

console.log(`Plot saved to "${plotPath}"`);

// ----------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------

function detectDelimiter(csvText) {
  const firstLine = csvText
    .split(/\r?\n/)
    .find(line => line.trim().length > 0);

  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;

  return semicolonCount > commaCount ? ";" : ",";
}

function toNumber(value) {
  if (value === null || value === undefined) return NaN;

  let text = String(value).trim();

  if (text === "") return NaN;

  // Remove invisible BOM character
  text = text.replace(/\uFEFF/g, "");

  // Remove normal spaces
  text = text.replace(/\s/g, "");

  // Convert decimal comma to decimal point
  text = text.replace(",", ".");

  const num = Number(text);

  return Number.isFinite(num) ? num : NaN;
}

function mean(arr) {
  return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

function standardDeviation(arr) {
  if (arr.length < 2) return 0;

  const m = mean(arr);

  const variance =
    arr.reduce((sum, value) => sum + Math.pow(value - m, 2), 0) /
    (arr.length - 1);

  return Math.sqrt(variance);
}

function isProcessedOutlier(row) {
  const rowMean = mean(row);
  const rowMin = Math.min(...row);
  const rowMax = Math.max(...row);
  const rowRange = rowMax - rowMin;

  return (
    Math.abs(rowMean) > MAX_PLOT_ABS_MEAN ||
    rowMax > MAX_PLOT_VALUE ||
    rowMin < MIN_PLOT_VALUE ||
    rowRange > MAX_PLOT_RANGE
  );
}

// ----------------------------------------------------
// ALS BASELINE CORRECTION
// ----------------------------------------------------

function alsBaseline(y, lambda, p, nIter) {
  const L = y.length;
  let w = new Array(L).fill(1);
  let baseline = new Array(L).fill(0);

  for (let iter = 0; iter < nIter; iter++) {
    const system = buildAlsSystem(w, lambda);
    const rhs = y.map((value, i) => w[i] * value);

    baseline = solvePentaDiagonal(system, rhs);

    w = y.map((value, i) => {
      return value > baseline[i] ? p : 1 - p;
    });
  }

  return baseline;
}

function buildAlsSystem(w, lambda) {
  const n = w.length;

  const diag = new Array(n).fill(0);
  const upper1 = new Array(n - 1).fill(0);
  const upper2 = new Array(n - 2).fill(0);
  const lower1 = new Array(n - 1).fill(0);
  const lower2 = new Array(n - 2).fill(0);

  for (let i = 0; i < n; i++) {
    let dtdMain;

    if (i === 0 || i === n - 1) {
      dtdMain = 1;
    } else if (i === 1 || i === n - 2) {
      dtdMain = 5;
    } else {
      dtdMain = 6;
    }

    diag[i] = w[i] + lambda * dtdMain;
  }

  for (let i = 0; i < n - 1; i++) {
    const value = i === 0 || i === n - 2 ? -2 : -4;

    upper1[i] = lambda * value;
    lower1[i] = lambda * value;
  }

  for (let i = 0; i < n - 2; i++) {
    upper2[i] = lambda;
    lower2[i] = lambda;
  }

  return { diag, upper1, upper2, lower1, lower2 };
}

function solvePentaDiagonal(system, rhsOriginal) {
  const n = system.diag.length;

  const diag = system.diag.slice();
  const upper1 = system.upper1.slice();
  const upper2 = system.upper2.slice();
  const lower1 = system.lower1.slice();
  const lower2 = system.lower2.slice();
  const rhs = rhsOriginal.slice();

  function get(i, j) {
    const diff = j - i;

    if (diff === 0) return diag[i];
    if (diff === 1) return upper1[i];
    if (diff === 2) return upper2[i];
    if (diff === -1) return lower1[j];
    if (diff === -2) return lower2[j];

    return 0;
  }

  function set(i, j, value) {
    const diff = j - i;

    if (diff === 0) diag[i] = value;
    else if (diff === 1) upper1[i] = value;
    else if (diff === 2) upper2[i] = value;
    else if (diff === -1) lower1[j] = value;
    else if (diff === -2) lower2[j] = value;
  }

  for (let k = 0; k < n; k++) {
    const pivot = diag[k];

    if (Math.abs(pivot) < 1e-14) {
      throw new Error("Numerical issue: pivot is too close to zero.");
    }

    const maxI = Math.min(n - 1, k + 2);

    for (let i = k + 1; i <= maxI; i++) {
      const aik = get(i, k);

      if (aik === 0) continue;

      const factor = aik / pivot;
      set(i, k, 0);

      const maxJ = Math.min(n - 1, k + 2);

      for (let j = k + 1; j <= maxJ; j++) {
        set(i, j, get(i, j) - factor * get(k, j));
      }

      rhs[i] -= factor * rhs[k];
    }
  }

  const x = new Array(n).fill(0);

  for (let i = n - 1; i >= 0; i--) {
    let sum = rhs[i];

    if (i + 1 < n) sum -= upper1[i] * x[i + 1];
    if (i + 2 < n) sum -= upper2[i] * x[i + 2];

    x[i] = sum / diag[i];
  }

  return x;
}

// ----------------------------------------------------
// SAVITZKY-GOLAY
// ----------------------------------------------------

function savitzkyGolayCoefficients(windowSize, polyOrder, derivativeOrder) {
  if (windowSize % 2 === 0) {
    throw new Error("Savitzky-Golay window size must be odd.");
  }

  if (polyOrder >= windowSize) {
    throw new Error("Polynomial order must be smaller than window size.");
  }

  if (derivativeOrder > polyOrder) {
    throw new Error("Derivative order cannot be larger than polynomial order.");
  }

  const half = Math.floor(windowSize / 2);
  const A = [];

  for (let i = -half; i <= half; i++) {
    const row = [];

    for (let j = 0; j <= polyOrder; j++) {
      row.push(Math.pow(i, j));
    }

    A.push(row);
  }

  const AT = transpose(A);
  const ATA = multiplyMatrices(AT, A);
  const ATAInv = inverseMatrix(ATA);
  const pseudoInverse = multiplyMatrices(ATAInv, AT);

  const coeffs = pseudoInverse[derivativeOrder].map(value =>
    value * factorial(derivativeOrder)
  );

  return coeffs;
}

function applySavitzkyGolay(row, coeffs) {
  const n = row.length;
  const windowSize = coeffs.length;
  const half = Math.floor(windowSize / 2);
  const result = new Array(n);

  for (let i = 0; i < n; i++) {
    let value = 0;

    for (let j = 0; j < windowSize; j++) {
      const offset = j - half;
      const idx = reflectIndex(i + offset, n);

      value += coeffs[j] * row[idx];
    }

    result[i] = value;
  }

  return result;
}

function reflectIndex(index, length) {
  if (index < 0) return -index;
  if (index >= length) return 2 * length - index - 2;
  return index;
}

function factorial(n) {
  let result = 1;

  for (let i = 2; i <= n; i++) {
    result *= i;
  }

  return result;
}

// ----------------------------------------------------
// SMALL MATRIX HELPERS
// ----------------------------------------------------

function transpose(A) {
  return A[0].map((_, colIndex) => A.map(row => row[colIndex]));
}

function multiplyMatrices(A, B) {
  const rows = A.length;
  const cols = B[0].length;
  const inner = B.length;

  const result = Array.from({ length: rows }, () =>
    new Array(cols).fill(0)
  );

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (let k = 0; k < inner; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

function inverseMatrix(A) {
  const n = A.length;

  const augmented = A.map((row, i) => {
    const identityRow = new Array(n).fill(0);
    identityRow[i] = 1;

    return row.slice().concat(identityRow);
  });

  for (let col = 0; col < n; col++) {
    let pivotRow = col;

    for (let row = col + 1; row < n; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivotRow][col])) {
        pivotRow = row;
      }
    }

    if (Math.abs(augmented[pivotRow][col]) < 1e-14) {
      throw new Error("Matrix is singular or nearly singular.");
    }

    [augmented[col], augmented[pivotRow]] = [augmented[pivotRow], augmented[col]];

    const pivot = augmented[col][col];

    for (let j = 0; j < 2 * n; j++) {
      augmented[col][j] /= pivot;
    }

    for (let row = 0; row < n; row++) {
      if (row === col) continue;

      const factor = augmented[row][col];

      for (let j = 0; j < 2 * n; j++) {
        augmented[row][j] -= factor * augmented[col][j];
      }
    }
  }

  return augmented.map(row => row.slice(n));
}

// ----------------------------------------------------
// PLOT HTML
// ----------------------------------------------------

function savePlotHtml(outputPath, wavenumbers, rawSpectra, processedSpectra, labels) {
  const indices = [];

  for (let i = 0; i < rawSpectra.length; i++) {
    const cls = Math.round(labels[i]);

    if (cls !== 0 && cls !== 1) {
      continue;
    }

    if (FILTER_PLOT_OUTLIERS && isProcessedOutlier(processedSpectra[i])) {
      continue;
    }

    indices.push(i);

    if (indices.length >= MAX_SPECTRA_TO_PLOT) {
      break;
    }
  }

  console.log(`Plotting ${indices.length} spectra.`);
  console.log(
    FILTER_PLOT_OUTLIERS
      ? "Extreme outlier spectra are hidden from the plot only."
      : "Outlier filtering is off for the plot."
  );

  const traces = [];

  for (const i of indices) {
    const cls = Math.round(labels[i]);

    const color =
      cls === 0
        ? "rgba(69,130,181,0.25)"
        : "rgba(214,61,61,0.25)";

    traces.push({
      x: wavenumbers,
      y: rawSpectra[i],
      type: "scatter",
      mode: "lines",
      line: { color: color, width: 1 },
      xaxis: "x",
      yaxis: "y",
      showlegend: false,
    });

    traces.push({
      x: wavenumbers,
      y: processedSpectra[i],
      type: "scatter",
      mode: "lines",
      line: { color: color, width: 1 },
      xaxis: "x2",
      yaxis: "y2",
      showlegend: false,
    });
  }

  traces.push({
    x: [null],
    y: [null],
    type: "scatter",
    mode: "lines",
    line: { color: "rgb(69,130,181)", width: 2 },
    name: "Control group",
    xaxis: "x",
    yaxis: "y",
  });

  traces.push({
    x: [null],
    y: [null],
    type: "scatter",
    mode: "lines",
    line: { color: "rgb(214,61,61)", width: 2 },
    name: "Diabetic group",
    xaxis: "x",
    yaxis: "y",
  });

  const layout = {
    title: "FTIR Spectra Comparison JS",

    xaxis: {
      domain: [0.0, 0.47],
      title: "Wavenumber",
      autorange: "reversed",
      anchor: "y",
    },
    yaxis: {
      domain: [0.0, 1.0],
      title: "Raw signal",
      anchor: "x",
    },

    xaxis2: {
      domain: [0.53, 1.0],
      title: "Wavenumber",
      autorange: "reversed",
      anchor: "y2",
    },
    yaxis2: {
      domain: [0.0, 1.0],
      title: "Processed signal",
      anchor: "x2",
      autorange: true,
    },

    annotations: [
      {
        text: "Raw FTIR spectra",
        xref: "paper",
        yref: "paper",
        x: 0.235,
        y: 1.08,
        showarrow: false,
        font: { size: 16 },
      },
      {
        text: "Processed spectra: ALS + SNV + SG second derivative",
        xref: "paper",
        yref: "paper",
        x: 0.765,
        y: 1.08,
        showarrow: false,
        font: { size: 16 },
      },
    ],

    legend: {
      x: 1.02,
      y: 1,
    },
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FTIR Spectra Comparison JS</title>
  <script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
</head>
<body>
  <div id="plot" style="width:100%;height:750px;"></div>

  <script>
    const traces = ${JSON.stringify(traces)};
    const layout = ${JSON.stringify(layout)};
    Plotly.newPlot("plot", traces, layout);
  </script>
</body>
</html>
`;

  fs.writeFileSync(outputPath, html, "utf8");
}