// This concept's own worked example: does an ALREADY-chosen linear model's
// own math assumptions actually hold against real data? x=complexity_score
// (an ordinal 1-8 intake rating, fresh -- never used by name in Concepts
// 01-10), y=resolution_hours (analyst hours spent closing that complaint).
// Fitting OLS on all 8 rows shows the residuals fanning out: their variance
// grows 6.35x from the low half of x to the high half, the same shape
// Molnar's own house-price heteroscedasticity example and the Wikipedia OLS
// "fanning effect" quote both describe. The Fanning Detector lab (Section
// s14) makes that same growth continuously draggable with one k slider.

const WORKED_X_0611 = [1, 2, 3, 4, 5, 6, 7, 8]
const WORKED_Y_0611 = [13, 12, 19, 14, 25, 16, 31, 18]
const WORKED_SPLIT_X_0611 = 4.5 // between complexity_score 4 and 5

// Plain closed-form OLS -- Concept 02's own sum-of-products formula,
// reused directly rather than re-derived here.
function fitOLS0611(xs, ys) {
  const n = xs.length
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n
  let sxy = 0, sxx = 0
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - meanX) * (ys[i] - meanY)
    sxx += (xs[i] - meanX) * (xs[i] - meanX)
  }
  const b1 = sxy / sxx
  const b0 = meanY - b1 * meanX
  return { b0, b1 }
}

function residualsFor0611(xs, ys, b0, b1) {
  return ys.map((y, i) => y - (b0 + b1 * xs[i]))
}

// Population variance (divide by n, not n-1) -- matches the research
// stage's own split-variance definition exactly.
function popVariance0611(arr) {
  const n = arr.length
  const mean = arr.reduce((a, b) => a + b, 0) / n
  return arr.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n
}

function sampleVariance0611(arr, df) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length
  const sse = arr.reduce((a, b) => a + (b - mean) * (b - mean), 0)
  return { sse, mse: sse / df }
}

// -- Shared plot geometry (viewBox 0 0 460 320, matching Concepts 06-10's own choice) --
const X0_0611 = 60, X1PX_0611 = 400, Y0_0611 = 30, Y1_0611 = 270

function pxX0611(x, cfg) {
  return X0_0611 + (x - cfg.xMin) / (cfg.xMax - cfg.xMin) * (X1PX_0611 - X0_0611)
}
function pxY0611(y, cfg) {
  return Y1_0611 - (y - cfg.yMin) / (cfg.yMax - cfg.yMin) * (Y1_0611 - Y0_0611)
}

function niceRange0611(residualArrays) {
  const flat = residualArrays.flat()
  const maxAbs = Math.max(1, ...flat.map(Math.abs))
  const bound = Math.ceil(maxAbs * 1.2)
  const step = bound <= 6 ? 2 : (bound <= 12 ? 3 : (bound <= 24 ? 6 : 10))
  const yTicks = []
  for (let v = 0; v <= bound; v += step) { yTicks.push(v); if (v !== 0) yTicks.push(-v) }
  yTicks.sort((a, b) => a - b)
  return { yMin: -bound, yMax: bound, yTicks }
}

function axisFrame0611(cfg) {
  const xTicks = cfg.xTicks.map(x => {
    const px = pxX0611(x, cfg).toFixed(1)
    return `<line x1="${px}" y1="${Y1_0611}" x2="${px}" y2="${Y1_0611 + 5}" stroke="currentColor" stroke-width="1"/><text x="${px}" y="${Y1_0611 + 16}" text-anchor="middle" font-size="7">${x}</text>`
  }).join('')
  const yTicks = cfg.yTicks.map(y => {
    const py = pxY0611(y, cfg).toFixed(1)
    return `<line x1="${X0_0611 - 5}" y1="${py}" x2="${X0_0611}" y2="${py}" stroke="currentColor" stroke-width="1"/><text x="${X0_0611 - 9}" y="${(Number(py) + 2.5).toFixed(1)}" text-anchor="end" font-size="7">${y}</text>`
  }).join('')
  return `
    <line x1="${X0_0611}" y1="${Y0_0611}" x2="${X0_0611}" y2="${Y1_0611}" stroke="currentColor" stroke-width="1.2"/>
    <line x1="${X0_0611}" y1="${Y1_0611}" x2="${X1PX_0611}" y2="${Y1_0611}" stroke="currentColor" stroke-width="1.2"/>
    ${xTicks}${yTicks}
    <text x="${(X0_0611 + X1PX_0611) / 2}" y="${Y1_0611 + 28}" text-anchor="middle" font-size="7.5" font-weight="700">${cfg.xLabel}</text>
    <text x="16" y="${(Y0_0611 + Y1_0611) / 2}" text-anchor="middle" font-size="7.5" font-weight="700" transform="rotate(-90 16 ${(Y0_0611 + Y1_0611) / 2})">${cfg.yLabel}</text>
  `
}

function bgSplitRects0611(cfg, splitX) {
  if (splitX == null || splitX <= cfg.xMin || splitX >= cfg.xMax) return ''
  const xSplitPx = pxX0611(splitX, cfg)
  return `<rect x="${X0_0611}" y="${Y0_0611}" width="${(xSplitPx - X0_0611).toFixed(1)}" height="${Y1_0611 - Y0_0611}" fill="var(--teal)" opacity="0.06"/>` +
    `<rect x="${xSplitPx.toFixed(1)}" y="${Y0_0611}" width="${(X1PX_0611 - xSplitPx).toFixed(1)}" height="${Y1_0611 - Y0_0611}" fill="var(--orange)" opacity="0.06"/>`
}

// Renders one residual-vs-x scatter: a zero line, an optional low/high
// split background, and one dot per (x, residual) pair colored by half.
function residualScatterSvg0611({ xs, residuals, cfg, splitX, titleId, titleText, descText }) {
  const zeroPy = pxY0611(0, cfg).toFixed(1)
  const bg = bgSplitRects0611(cfg, splitX)
  const zeroLine = `<line x1="${X0_0611}" y1="${zeroPy}" x2="${X1PX_0611}" y2="${zeroPy}" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2" opacity="0.6"/>`
  const dots = xs.map((x, i) => {
    const cx = pxX0611(x, cfg).toFixed(1)
    const cy = pxY0611(residuals[i], cfg).toFixed(1)
    const color = splitX != null ? (x < splitX ? 'var(--teal)' : '#c0392b') : 'currentColor'
    return `<circle cx="${cx}" cy="${cy}" r="6" fill="${color}" stroke="var(--bg)" stroke-width="1"/>`
  }).join('')
  return `
    <svg class="vector-plane" viewBox="0 0 460 320" role="img" aria-labelledby="${titleId}-title ${titleId}-desc">
      <title id="${titleId}-title">${titleText}</title>
      <desc id="${titleId}-desc">${descText}</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        ${bg}
        ${axisFrame0611(cfg)}
        ${zeroLine}
        ${dots}
      </g>
    </svg>
  `
}

// -- Static figure #1 (beginner, b04): the full 8-row worked example. --
function renderResidualStatic1_0611() {
  const wrap = document.querySelector('#wgResidualStatic1_0611')
  if (!wrap) return
  const fit = fitOLS0611(WORKED_X_0611, WORKED_Y_0611)
  const residuals = residualsFor0611(WORKED_X_0611, WORKED_Y_0611, fit.b0, fit.b1)
  const low = residuals.slice(0, 4)
  const high = residuals.slice(4, 8)
  const ratio = popVariance0611(high) / popVariance0611(low)
  const range = niceRange0611([residuals])
  const cfg = { xMin: 0.4, xMax: 8.6, xTicks: WORKED_X_0611, xLabel: 'x = complexity_score', yLabel: 'residual (hours)', ...range }
  wrap.innerHTML = `
    <div style="max-width:460px;margin:0 auto">
      ${residualScatterSvg0611({
        xs: WORKED_X_0611, residuals, cfg, splitX: WORKED_SPLIT_X_0611,
        titleId: 'c0611-b04', titleText: 'Residuals vs. complexity_score for the 8-row worked example',
        descText: 'A scatter of residual against complexity_score with a dashed zero line: the four low-complexity residuals sit close to the line, while the four high-complexity residuals fan out much wider above and below it.',
      })}
    </div>
    <p class="fine-print" style="text-align:center">b0=${fit.b0.toFixed(4)}, b1=${fit.b1.toFixed(4)}. Low-half (x=1-4) residual variance vs. high-half (x=5-8): ratio ≈ ${ratio.toFixed(4)}x -- the fan Section 06's own diagnostics exist to catch.</p>
  `
}

// -- Static figure #2 (advanced, s07): the Goldfeld-Quandt subset fits. --
function renderGQStatic_0611() {
  const wrap = document.querySelector('#wgGQStatic_0611')
  if (!wrap) return
  const lowX = WORKED_X_0611.slice(0, 4), lowY = WORKED_Y_0611.slice(0, 4)
  const highX = WORKED_X_0611.slice(4, 8), highY = WORKED_Y_0611.slice(4, 8)
  const fitLow = fitOLS0611(lowX, lowY)
  const fitHigh = fitOLS0611(highX, highY)
  const residLow = residualsFor0611(lowX, lowY, fitLow.b0, fitLow.b1)
  const residHigh = residualsFor0611(highX, highY, fitHigh.b0, fitHigh.b1)
  const { sse: sseLow, mse: mseLow } = sampleVariance0611(residLow, 2)
  const { sse: sseHigh, mse: mseHigh } = sampleVariance0611(residHigh, 2)
  const f = mseHigh / mseLow
  const range = niceRange0611([residLow, residHigh])
  const cfgLow = { xMin: 0.4, xMax: 4.6, xTicks: lowX, xLabel: 'x (low subset)', yLabel: 'residual', ...range }
  const cfgHigh = { xMin: 4.4, xMax: 8.6, xTicks: highX, xLabel: 'x (high subset)', yLabel: 'residual', ...range }
  wrap.innerHTML = `
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">${residualScatterSvg0611({
        xs: lowX, residuals: residLow, cfg: cfgLow, splitX: null,
        titleId: 'c0611-s07-low', titleText: 'Low-subset OLS fit, residuals vs. x',
        descText: 'A residual scatter for the separate OLS fit on the four low-complexity rows, with points sitting close to the dashed zero line.',
      })}<p class="fine-print" style="text-align:center">LOW subset: b0=${fitLow.b0}, b1=${fitLow.b1}. SSE=${sseLow}, df=2, MSE=${mseLow}.</p></div>
      <div style="flex:1;min-width:220px">${residualScatterSvg0611({
        xs: highX, residuals: residHigh, cfg: cfgHigh, splitX: null,
        titleId: 'c0611-s07-high', titleText: 'High-subset OLS fit, residuals vs. x',
        descText: 'A residual scatter for the separate OLS fit on the four high-complexity rows, with points swinging much farther from the dashed zero line than the low subset.',
      })}<p class="fine-print" style="text-align:center">HIGH subset: b0=${fitHigh.b0.toFixed(1)}, b1=${fitHigh.b1.toFixed(1)}. SSE=${sseHigh.toFixed(1)}, df=2, MSE=${mseHigh.toFixed(1)}.</p></div>
    </div>
    <p class="fine-print">Goldfeld-Quandt F = MSE_high / MSE_low = ${mseHigh.toFixed(1)} / ${mseLow} = ${f.toFixed(2)}, at df=(2,2). Named-test mechanism, not a formal significance claim on this 8-row toy set (Section 10).</p>
  `
}

// -- Interactive lab (s14): The Fanning Detector. --
const kSlider0611 = document.querySelector('#wgK_0611')
const kOut0611 = document.querySelector('#wgKOut_0611')
const fanPlotEl0611 = document.querySelector('#wgFanPlot_0611')
const ratioOut0611 = document.querySelector('#wgRatioOut_0611')
const verdictEl0611 = document.querySelector('#wgVerdict_0611')
const resetKBtn0611 = document.querySelector('#wgResetK_0611')

const LAB_X_0611 = [1, 2, 3, 4, 5, 6, 7, 8]
const LAB_E_0611 = [1, -1, 1, -1, 1, -1, 1, -1]
const K_DEFAULT_0611 = 1

// y_i(k) = 10 + 2*x_i + e_i*(1 + k*x_i) -- the deterministic generator
// verified at 7 checkpoint k-values in the research stage (k=0 -> ratio
// 1.0000 exactly homoscedastic, up to k=2 -> ratio 5.3022).
function labDataFor0611(k) {
  const ys = LAB_X_0611.map((x, i) => 10 + 2 * x + LAB_E_0611[i] * (1 + k * x))
  const fit = fitOLS0611(LAB_X_0611, ys)
  const residuals = residualsFor0611(LAB_X_0611, ys, fit.b0, fit.b1)
  return { ys, fit, residuals }
}

function renderFanningDetector0611() {
  if (!kSlider0611) return
  const k = Number(kSlider0611.value)
  if (kOut0611) kOut0611.textContent = k.toFixed(2)

  const { residuals } = labDataFor0611(k)
  const low = residuals.slice(0, 4)
  const high = residuals.slice(4, 8)
  const ratio = popVariance0611(high) / popVariance0611(low)

  if (fanPlotEl0611) {
    const range = niceRange0611([residuals])
    const cfg = { xMin: 0.4, xMax: 8.6, xTicks: LAB_X_0611, xLabel: 'x = complexity_score', yLabel: 'residual', ...range }
    fanPlotEl0611.innerHTML = residualScatterSvg0611({
      xs: LAB_X_0611, residuals, cfg, splitX: WORKED_SPLIT_X_0611,
      titleId: 'c0611-lab', titleText: `Live residuals vs. x at k=${k.toFixed(2)}`,
      descText: 'A live residual-vs-x scatter that redraws as the k slider moves, fanning out wider on the right as k increases and flattening toward the left as k approaches zero.',
    })
  }
  if (ratioOut0611) {
    ratioOut0611.textContent = `High/low residual-variance ratio: ${ratio.toFixed(4)}x`
  }
  if (verdictEl0611) {
    const detected = ratio >= 1.5
    verdictEl0611.className = `gate-verdict ${detected ? 'verdict-red' : 'verdict-green'}`
    verdictEl0611.textContent = detected
      ? `Fanning detected -- residual spread is growing with complexity_score, a heteroscedasticity signal (ratio ${ratio.toFixed(4)}x).`
      : `No clear fanning -- residual spread looks roughly constant (ratio ${ratio.toFixed(4)}x).`
  }
}

kSlider0611?.addEventListener('input', renderFanningDetector0611)
resetKBtn0611?.addEventListener('click', () => {
  if (kSlider0611) kSlider0611.value = String(K_DEFAULT_0611)
  renderFanningDetector0611()
})

renderResidualStatic1_0611()
renderGQStatic_0611()
renderFanningDetector0611()
