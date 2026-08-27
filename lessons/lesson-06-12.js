// Section 14's lab: The Relief Predictor. Module 06's closing worked case --
// reuses Concept 04's sigmoid/BCE, Concept 05's odds-ratio identity, and
// Concept 11's VIF check, all unchanged, on one CFPB-flavored dataset with
// a real, live-confirmed feature (timely_response).

const W0_0612 = -2.0
const W1_0612 = 0.8
const W2_0612 = -0.02
const W3_0612 = 1.2

const ROWS_0612 = [
  { id: 'A', x1: 1, x2: 10, x3: 1, y: 0 },
  { id: 'B', x1: 2, x2: 20, x3: 1, y: 0 },
  { id: 'C', x1: 3, x2: 15, x3: 0, y: 1 },
  { id: 'D', x1: 1, x2: 40, x3: 1, y: 0 },
  { id: 'E', x1: 4, x2: 25, x3: 0, y: 1 },
  { id: 'F', x1: 2, x2: 60, x3: 0, y: 0 },
  { id: 'G', x1: 5, x2: 30, x3: 1, y: 1 },
  { id: 'H', x1: 3, x2: 50, x3: 0, y: 0 },
]

const BASELINE_P_0612 = { x1: 2, x2: 30, x3: 0 }

function sigmoid0612(z) {
  return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z))
}
function score0612(x1, x2, x3) {
  return W0_0612 + W1_0612 * x1 + W2_0612 * x2 + W3_0612 * x3
}
function odds0612(x1, x2, x3) {
  const p = sigmoid0612(score0612(x1, x2, x3))
  return p / (1 - p)
}

const advancedLesson0612 = document.querySelector('#advanced-lesson')
function syncAdvancedTarget0612() { if (advancedLesson0612) advancedLesson0612.open = location.hash === '#advanced-lesson' || /^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash) }
addEventListener('hashchange', syncAdvancedTarget0612)
syncAdvancedTarget0612()

// -- Shared z-score strip renderer (used by both static figures). --
const ZMIN_0612 = -2, ZMAX_0612 = 3
const X0_0612 = 40, X1PX_0612 = 420, Y_0612 = 60

function pxZ0612(z) {
  return X0_0612 + (z - ZMIN_0612) / (ZMAX_0612 - ZMIN_0612) * (X1PX_0612 - X0_0612)
}

function zStripSvg0612(rows, titleId, titleText, descText) {
  const zeroPx = pxZ0612(0).toFixed(1)
  const points = rows.map((r, i) => {
    const z = score0612(r.x1, r.x2, r.x3)
    const p = sigmoid0612(z)
    const pred = p >= 0.5 ? 1 : 0
    const miss = pred !== r.y
    const px = pxZ0612(z).toFixed(1)
    const fill = miss ? 'var(--orange)' : (r.y === 1 ? 'var(--teal)' : 'var(--muted)')
    const yOff = 40 + (i % 2) * 22
    return `
      <line x1="${px}" y1="${Y_0612}" x2="${px}" y2="${yOff}" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
      <circle cx="${px}" cy="${Y_0612}" r="${miss ? 6 : 5}" fill="${fill}" stroke="${miss ? 'var(--ink)' : 'none'}" stroke-width="1.4"/>
      <text x="${px}" y="${yOff - 6}" text-anchor="middle" font-size="7" font-weight="700">${r.id}${miss ? ' (miss)' : ''}</text>
      <text x="${px}" y="${yOff + 6}" text-anchor="middle" font-size="6.5">p=${p.toFixed(3)}</text>
    `
  }).join('')
  return `
    <svg class="vector-plane" viewBox="0 0 460 110" role="img" aria-labelledby="${titleId}-title ${titleId}-desc">
      <title id="${titleId}-title">${titleText}</title>
      <desc id="${titleId}-desc">${descText}</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        <line x1="${X0_0612}" y1="${Y_0612}" x2="${X1PX_0612}" y2="${Y_0612}" stroke="currentColor" stroke-width="1.2"/>
        <line x1="${zeroPx}" y1="${Y_0612 - 30}" x2="${zeroPx}" y2="${Y_0612 + 30}" stroke="var(--ink)" stroke-width="1" stroke-dasharray="3,2"/>
        <text x="${zeroPx}" y="${Y_0612 + 42}" text-anchor="middle" font-size="7" font-weight="700">z=0 (decision boundary)</text>
        ${points}
      </g>
    </svg>
  `
}

function renderCaseStatic1_0612() {
  const wrap = document.querySelector('#wgCaseStatic1_0612')
  if (!wrap) return
  wrap.innerHTML = zStripSvg0612(
    ROWS_0612.filter(r => r.id === 'A' || r.id === 'B' || r.id === 'C'),
    'c0612-b04-svg',
    'Three rows plotted by z-score, with row B misclassified',
    'A horizontal axis showing z-score, with a dashed line at z=0 marking the decision boundary. Row A and row C sit on their own correct side of the boundary. Row B sits on the positive side despite its true label being no relief, marked as a miss.'
  )
}
function renderCaseStatic2_0612() {
  const wrap = document.querySelector('#wgCaseStatic2_0612')
  if (!wrap) return
  wrap.innerHTML = zStripSvg0612(
    ROWS_0612,
    'c0612-s07-svg',
    'All eight rows plotted by z-score, one misclassified',
    'A horizontal axis showing all eight rows z-scores, with a dashed line at z=0. Seven rows sit on their own correct side; row B sits on the wrong side, marked as a miss.'
  )
}

// -- Interactive lab (s14): The Relief Predictor. --
const x1Slider0612 = document.querySelector('#wgX1_0612')
const x2Slider0612 = document.querySelector('#wgX2_0612')
const x1Out0612 = document.querySelector('#wgX1Out_0612')
const x2Out0612 = document.querySelector('#wgX2Out_0612')
const x3Buttons0612 = [...document.querySelectorAll('#s14 [data-x3]')]
const resetBtn0612 = document.querySelector('#wgReset_0612')
const readout0612 = document.querySelector('#wgReadout_0612')
const verdict0612 = document.querySelector('#wgVerdict_0612')

const DEFAULT_0612 = { x1: 2, x2: 20, x3: 1 }
let currentX3_0612 = DEFAULT_0612.x3

function syncX3Buttons0612() {
  x3Buttons0612.forEach(btn => btn.classList.toggle('active', Number(btn.dataset.x3) === currentX3_0612))
}

function renderLab0612() {
  if (!x1Slider0612 || !x2Slider0612) return
  const x1 = Number(x1Slider0612.value)
  const x2 = Number(x2Slider0612.value)
  const x3 = currentX3_0612

  if (x1Out0612) x1Out0612.textContent = String(x1)
  if (x2Out0612) x2Out0612.textContent = String(x2)

  const z = score0612(x1, x2, x3)
  const p = sigmoid0612(z)
  const pred = p >= 0.5 ? 1 : 0
  const oddsHere = odds0612(x1, x2, x3)
  const oddsBaseline = odds0612(BASELINE_P_0612.x1, BASELINE_P_0612.x2, BASELINE_P_0612.x3)
  const ratioVsBaseline = oddsHere / oddsBaseline

  if (readout0612) {
    readout0612.innerHTML = `
      <div><span>SCORE</span><b>z=${z.toFixed(4)}, p=${p.toFixed(6)}</b></div>
      <div><span>PREDICTED</span><b>${pred === 1 ? 'Relief' : 'No relief'}</b></div>
      <div><span>ODDS vs. BASELINE (x1=2,x2=30,x3=0)</span><b>${ratioVsBaseline.toFixed(4)}x</b></div>
      <div class="wide"><span>ASSUMPTION CHECK (fixed, from the 8-row dataset)</span><b>VIF(case_age_days, timely_response) = 1.17 -- no problematic multicollinearity</b></div>
    `
  }
  if (verdict0612) {
    const matchesRowB = x1 === DEFAULT_0612.x1 && x2 === DEFAULT_0612.x2 && x3 === DEFAULT_0612.x3
    verdict0612.className = 'gate-verdict ' + (matchesRowB ? 'verdict-amber' : (pred === 1 ? 'verdict-green' : 'verdict-amber'))
    verdict0612.textContent = matchesRowB
      ? `This is exactly row B, the module's own one miss -- predicted Relief (p=${p.toFixed(4)}) but the true label is no relief.`
      : `At x1=${x1}, x2=${x2}, x3=${x3}: predicted ${pred === 1 ? 'Relief' : 'No relief'} (p=${p.toFixed(4)}).`
  }
}

x1Slider0612?.addEventListener('input', renderLab0612)
x2Slider0612?.addEventListener('input', renderLab0612)
x3Buttons0612.forEach(btn => btn.addEventListener('click', () => {
  currentX3_0612 = Number(btn.dataset.x3)
  syncX3Buttons0612()
  renderLab0612()
}))
resetBtn0612?.addEventListener('click', () => {
  if (x1Slider0612) x1Slider0612.value = String(DEFAULT_0612.x1)
  if (x2Slider0612) x2Slider0612.value = String(DEFAULT_0612.x2)
  currentX3_0612 = DEFAULT_0612.x3
  syncX3Buttons0612()
  renderLab0612()
})

renderCaseStatic1_0612()
renderCaseStatic2_0612()
syncX3Buttons0612()
renderLab0612()
