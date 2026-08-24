// Section 14's lab: The Line Fitter. Six fixed points never move. Two sliders
// (intercept b0, slope b1) drive a live SVG line and six live residual
// verticals, plus a running SSE total. A session-local "best SSE found so
// far" tracker turns dragging sliders into a genuine (if inefficient) search
// -- it deliberately never reveals the true optimal line, since that
// derivation belongs to Concept 02, not this one.

const DATA_0601 = [
  [1, 5],
  [2, 9],
  [3, 10],
  [4, 17],
  [5, 15],
  [6, 20],
]

const MEAN_Y_0601 = DATA_0601.reduce((sum, [, y]) => sum + y, 0) / DATA_0601.length
const SSE_BASELINE_0601 = DATA_0601.reduce((sum, [, y]) => sum + (y - MEAN_Y_0601) ** 2, 0)

// Plot geometry -- viewBox 460x220, x-axis 0-7 (prior contact attempts),
// y-axis 0-22 (case age at resolution, in days).
const PLOT_X0_0601 = 40
const PLOT_X1_0601 = 440
const PLOT_Y0_0601 = 190 // pixel y for data y=0
const PLOT_Y1_0601 = 20  // pixel y for data y=22
const X_MAX_0601 = 7
const Y_MAX_0601 = 22

function pxX0601(x) {
  return PLOT_X0_0601 + (x / X_MAX_0601) * (PLOT_X1_0601 - PLOT_X0_0601)
}
function pxY0601(y) {
  return PLOT_Y0_0601 + (Y_MAX_0601 - y) / Y_MAX_0601 * (PLOT_Y0_0601 - PLOT_Y1_0601)
}

let bestSse0601 = null
let bestB0_0601 = null
let bestB1_0601 = null

const b0Slider0601 = document.querySelector('#wgB0_0601')
const b1Slider0601 = document.querySelector('#wgB1_0601')
const b0Out0601 = document.querySelector('#wgB0Out_0601')
const b1Out0601 = document.querySelector('#wgB1Out_0601')
const presetButtons0601 = [...document.querySelectorAll('#wgPresetGroup_0601 [data-preset]')]
const chartWrap0601 = document.querySelector('#wgLineChart_0601')
const readout0601 = document.querySelector('#wgReadout_0601')
const verdict0601 = document.querySelector('#wgVerdict_0601')

function render0601() {
  if (!b0Slider0601 || !b1Slider0601) return
  const b0 = Number(b0Slider0601.value)
  const b1 = Number(b1Slider0601.value)
  if (b0Out0601) b0Out0601.textContent = b0.toFixed(1)
  if (b1Out0601) b1Out0601.textContent = b1.toFixed(1)

  const rows = DATA_0601.map(([x, y]) => {
    const yhat = b0 + b1 * x
    const resid = y - yhat
    return { x, y, yhat, resid, resid2: resid * resid }
  })
  const sse = rows.reduce((sum, r) => sum + r.resid2, 0)

  if (bestSse0601 === null || sse < bestSse0601) {
    bestSse0601 = sse
    bestB0_0601 = b0
    bestB1_0601 = b1
  }

  if (chartWrap0601) {
    const lineX0 = 0, lineX1 = X_MAX_0601
    const lineY0 = b0 + b1 * lineX0
    const lineY1 = b0 + b1 * lineX1
    const residSegments = rows.map(r => {
      const px = pxX0601(r.x)
      const pyPoint = pxY0601(r.y)
      const pyLine = pxY0601(r.yhat)
      const color = r.resid >= 0 ? 'var(--orange)' : 'var(--green)'
      return `<line x1="${px.toFixed(1)}" y1="${pyLine.toFixed(1)}" x2="${px.toFixed(1)}" y2="${pyPoint.toFixed(1)}" stroke="${color}" stroke-width="2" stroke-dasharray="3,2"/>`
    }).join('')
    const points = rows.map(r => {
      const px = pxX0601(r.x)
      const py = pxY0601(r.y)
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" fill="var(--ink)"/>`
    }).join('')
    chartWrap0601.innerHTML = `
      <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-label="Live scatter plot of six fixed points with the current slider line and each point's residual drawn as a dashed vertical segment">
        <g font-family="IBM Plex Mono, monospace" font-size="8" fill="currentColor">
          <line x1="${PLOT_X0_0601}" y1="${PLOT_Y0_0601}" x2="${PLOT_X1_0601}" y2="${PLOT_Y0_0601}" stroke="currentColor" stroke-width="1"/>
          <line x1="${PLOT_X0_0601}" y1="20" x2="${PLOT_X0_0601}" y2="${PLOT_Y0_0601}" stroke="currentColor" stroke-width="1"/>
          <text x="${PLOT_X0_0601}" y="206" text-anchor="middle">0</text>
          <text x="${PLOT_X1_0601}" y="206" text-anchor="middle">7</text>
          <text x="240" y="216" text-anchor="middle" font-size="7.5">PRIOR CONTACT ATTEMPTS</text>
          <text x="36" y="${PLOT_Y0_0601}" text-anchor="end">0</text>
          <text x="36" y="${pxY0601(10).toFixed(1)}" text-anchor="end">10</text>
          <text x="36" y="${pxY0601(20).toFixed(1)}" text-anchor="end">20</text>
          <line x1="${pxX0601(lineX0).toFixed(1)}" y1="${pxY0601(lineY0).toFixed(1)}" x2="${pxX0601(lineX1).toFixed(1)}" y2="${pxY0601(lineY1).toFixed(1)}" stroke="var(--teal)" stroke-width="2"/>
          ${residSegments}
          ${points}
        </g>
      </svg>
    `
  }

  if (readout0601) {
    const rowsHtml = rows.map(r => `
      <tr><td>${r.x}</td><td>${r.y}</td><td>${r.yhat.toFixed(2)}</td><td>${r.resid >= 0 ? '+' : ''}${r.resid.toFixed(2)}</td><td>${r.resid2.toFixed(2)}</td></tr>
    `).join('')
    readout0601.innerHTML = `
      <table class="notation">
        <thead><tr><th>x</th><th>y</th><th>ŷ</th><th>residual</th><th>residual²</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <p><b>Running SSE: ${sse.toFixed(2)}</b></p>
    `
  }

  if (verdict0601) {
    const pctVsBaseline = (1 - sse / SSE_BASELINE_0601) * 100
    const baselineWord = pctVsBaseline >= 0
      ? `${pctVsBaseline.toFixed(1)}% lower than the mean-only baseline (SSE=${SSE_BASELINE_0601.toFixed(2)})`
      : `${Math.abs(pctVsBaseline).toFixed(1)}% HIGHER than the mean-only baseline (SSE=${SSE_BASELINE_0601.toFixed(2)}) -- worse than just guessing the average`
    const bestLine = bestSse0601 === sse
      ? `This is your best SSE so far.`
      : `Best you've found so far: SSE=${bestSse0601.toFixed(2)} (b0=${bestB0_0601.toFixed(1)}, b1=${bestB1_0601.toFixed(1)}). Can you beat it?`
    verdict0601.innerHTML = `
      <b>Current SSE: ${sse.toFixed(2)}</b> -- ${baselineWord}.
      <br>${bestLine}
    `
  }
}

presetButtons0601.forEach(btn => {
  btn.addEventListener('click', () => {
    const preset = btn.dataset.preset
    if (preset === 'baseline') {
      b0Slider0601.value = String(MEAN_Y_0601)
      b1Slider0601.value = '0'
    } else if (preset === 'twopoint') {
      b0Slider0601.value = '2'
      b1Slider0601.value = '3'
    }
    render0601()
  })
})

b0Slider0601?.addEventListener('input', render0601)
b1Slider0601?.addEventListener('input', render0601)

render0601()
