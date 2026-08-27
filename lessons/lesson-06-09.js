// Section 14's lab: The Softmax Simplex. Concept 08 combined several
// already-binary classifiers two different ways (OvR's argmax, OvO's
// majority vote). This concept replaces the combination step entirely --
// one model, K raw scores, normalized ONCE via softmax into a genuine
// probability distribution that sums to 1 by construction. Multiclass
// cross-entropy then scores that distribution against a stated true label.

// The worked example's own fixed weights, verified in the research stage
// and reused verbatim -- fresh numbers, sharing nothing with Concept 08's
// nine OvR/OvO weights or its five test points.
const SOFTMAX_WEIGHTS_0609 = [
  [0.1, 0.3, -0.2],
  [0.4, -0.1, 0.5],
  [-0.2, 0.6, 0.1],
]
const CLASS_LABELS_0609 = ['class 0', 'class 1', 'class 2']

const X1_DEFAULT_0609 = 2
const X2_DEFAULT_0609 = 1
const LABEL_DEFAULT_0609 = 1

// The 2-simplex triangle's fixed vertex coordinates, shared by every static
// figure and the live lab so the visual proportions never shift underneath
// the reader. viewBox matches Concept 08's own 300x250 choice.
const SIMPLEX_V0_0609 = { x: 150, y: 20 }
const SIMPLEX_V1_0609 = { x: 40, y: 220 }
const SIMPLEX_V2_0609 = { x: 260, y: 220 }

function score0609(w, x1, x2) {
  return w[0] + w[1] * x1 + w[2] * x2
}

function softmax0609(zs) {
  const exps = zs.map(z => Math.exp(z))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

function softmaxPredict0609(x1, x2) {
  const scores = SOFTMAX_WEIGHTS_0609.map(w => score0609(w, x1, x2))
  const probs = softmax0609(scores)
  return { scores, probs }
}

function crossEntropy0609(probs, trueLabel) {
  return -Math.log(probs[trueLabel])
}

function bandForLoss0609(loss) {
  if (loss < 0.5) return { cls: 'verdict-green', text: 'confident and correct-ish' }
  if (loss < 1.5) return { cls: 'verdict-amber', text: 'uncertain' }
  return { cls: 'verdict-red', text: 'confidently wrong' }
}

function baryPoint0609(p0, p1, p2) {
  return {
    x: p0 * SIMPLEX_V0_0609.x + p1 * SIMPLEX_V1_0609.x + p2 * SIMPLEX_V2_0609.x,
    y: p0 * SIMPLEX_V0_0609.y + p1 * SIMPLEX_V1_0609.y + p2 * SIMPLEX_V2_0609.y,
  }
}

// -- Panel A: raw score bars, explicitly labeled NOT probabilities. --
function scorePanelSvg0609(x1, x2, titleId, titleText, descText) {
  const { scores } = softmaxPredict0609(x1, x2)
  const yMax = Math.max(2, ...scores.map(s => Math.abs(s))) * 1.2
  const X0 = 40, X1PX = 260, Y0 = 20, YMID = 130, Y1 = 240
  const barW = 50
  const centers = [90, 150, 210]
  const bars = scores.map((s, k) => {
    const cx = centers[k]
    const h = (Math.abs(s) / yMax) * (YMID - Y0)
    const y = s >= 0 ? YMID - h : YMID
    return `
      <rect x="${cx - barW / 2}" y="${y.toFixed(1)}" width="${barW}" height="${Math.max(h, 1).toFixed(1)}" fill="var(--teal)" opacity="0.6"/>
      <text x="${cx}" y="${(s >= 0 ? y - 6 : y + h + 12).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700">${s.toFixed(2)}</text>
      <text x="${cx}" y="${Y1 - 4}" text-anchor="middle" font-size="7.5">${CLASS_LABELS_0609[k]}</text>
    `
  }).join('')
  return `
    <svg class="vector-plane" viewBox="0 0 300 250" role="img" aria-labelledby="${titleId}-title ${titleId}-desc">
      <title id="${titleId}-title">${titleText}</title>
      <desc id="${titleId}-desc">${descText}</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        <line x1="${X0}" y1="${YMID}" x2="${X1PX}" y2="${YMID}" stroke="currentColor" stroke-width="1"/>
        <text x="10" y="${Y0 + 4}" font-size="7">RAW SCORES (NOT PROBABILITIES)</text>
        ${bars}
      </g>
    </svg>
  `
}

// -- Panel B: the 2-simplex triangle, with the live (p0,p1,p2) point. --
function simplexPanelSvg0609(x1, x2, titleId, titleText, descText) {
  const { probs } = softmaxPredict0609(x1, x2)
  const [p0, p1, p2] = probs
  const V0 = SIMPLEX_V0_0609, V1 = SIMPLEX_V1_0609, V2 = SIMPLEX_V2_0609
  const gridLevels = [0.25, 0.5, 0.75]
  const gridLines = gridLevels.map(k => {
    const a = baryPoint0609(k, 1 - k, 0), b = baryPoint0609(k, 0, 1 - k)
    const c = baryPoint0609(1 - k, k, 0), d = baryPoint0609(0, k, 1 - k)
    const e = baryPoint0609(1 - k, 0, k), f = baryPoint0609(0, 1 - k, k)
    return `
      <line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
      <line x1="${c.x.toFixed(1)}" y1="${c.y.toFixed(1)}" x2="${d.x.toFixed(1)}" y2="${d.y.toFixed(1)}" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
      <line x1="${e.x.toFixed(1)}" y1="${e.y.toFixed(1)}" x2="${f.x.toFixed(1)}" y2="${f.y.toFixed(1)}" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
    `
  }).join('')
  const dot = baryPoint0609(p0, p1, p2)
  const sum = (p0 + p1 + p2).toFixed(4)
  return `
    <svg class="vector-plane" viewBox="0 0 300 250" role="img" aria-labelledby="${titleId}-title ${titleId}-desc">
      <title id="${titleId}-title">${titleText}</title>
      <desc id="${titleId}-desc">${descText}</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        <text x="10" y="16" font-size="7">THE PROBABILITY SIMPLEX</text>
        <polygon points="${V0.x},${V0.y} ${V1.x},${V1.y} ${V2.x},${V2.y}" fill="none" stroke="currentColor" stroke-width="1.2"/>
        ${gridLines}
        <text x="${V0.x}" y="${V0.y - 8}" text-anchor="middle" font-size="7.5" font-weight="700">class 0</text>
        <text x="${V1.x - 4}" y="${V1.y + 16}" text-anchor="middle" font-size="7.5" font-weight="700">class 1</text>
        <text x="${V2.x + 4}" y="${V2.y + 16}" text-anchor="middle" font-size="7.5" font-weight="700">class 2</text>
        <circle cx="${dot.x.toFixed(1)}" cy="${dot.y.toFixed(1)}" r="6" fill="var(--teal)" stroke="currentColor" stroke-width="1"/>
        <text x="150" y="243" text-anchor="middle" font-size="7.5" font-weight="700">p = (${p0.toFixed(4)}, ${p1.toFixed(4)}, ${p2.toFixed(4)})  SUM = ${sum}</text>
      </g>
    </svg>
  `
}

// -- Static figure #1 (beginner, b04): the main worked example, high loss. --
function renderSoftmaxStatic1_0609() {
  const wrap = document.querySelector('#wgSoftmaxStatic1_0609')
  if (!wrap) return
  const x1 = X1_DEFAULT_0609, x2 = X2_DEFAULT_0609
  const { probs } = softmaxPredict0609(x1, x2)
  const loss = crossEntropy0609(probs, LABEL_DEFAULT_0609)
  wrap.innerHTML = `
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">${scorePanelSvg0609(x1, x2, 'c0609-b04-score', 'Raw scores at x1=2, x2=1', 'Three bars showing raw scores 0.5, 0.7 and 1.1 for classes 0, 1 and 2, explicitly labeled as not probabilities.')}</div>
      <div style="flex:1;min-width:220px">${simplexPanelSvg0609(x1, x2, 'c0609-b04-simplex', 'Probability simplex at x1=2, x2=1', 'A triangle with a dot at probabilities 0.2473, 0.3021, 0.4506, summing to exactly 1.0000.')}</div>
    </div>
    <p class="fine-print">True label = class 1. Cross-entropy = -ln(0.3021) = ${loss.toFixed(4)} -- confidently wrong, since class 2 actually has the highest probability.</p>
  `
}

// -- Static figure #2 (advanced, s07): the exercise point, low loss. --
function renderSoftmaxStatic2_0609() {
  const wrap = document.querySelector('#wgSoftmaxStatic2_0609')
  if (!wrap) return
  const x1 = -2, x2 = 2
  const { probs } = softmaxPredict0609(x1, x2)
  const loss = crossEntropy0609(probs, LABEL_DEFAULT_0609)
  wrap.innerHTML = `
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">${scorePanelSvg0609(x1, x2, 'c0609-s07-score', 'Raw scores at x1=-2, x2=2', 'Three bars showing raw scores -0.9, 1.6 and -1.2 for classes 0, 1 and 2.')}</div>
      <div style="flex:1;min-width:220px">${simplexPanelSvg0609(x1, x2, 'c0609-s07-simplex', 'Probability simplex at x1=-2, x2=2', 'A triangle with a dot at probabilities 0.0718, 0.8750, 0.0532, summing to exactly 1.0000, near the class 1 corner.')}</div>
    </div>
    <p class="fine-print">True label = class 1 (the argmax here). Cross-entropy = -ln(0.8750) = ${loss.toFixed(4)} -- confident and correct, in direct contrast with b04's confident-but-wrong 1.1971.</p>
  `
}

// -- Interactive lab (s14): The Softmax Simplex. --
const x1Slider0609 = document.querySelector('#wgX1_0609')
const x2Slider0609 = document.querySelector('#wgX2_0609')
const x1Out0609 = document.querySelector('#wgX1Out_0609')
const x2Out0609 = document.querySelector('#wgX2Out_0609')
const labelBtns0609 = [
  document.querySelector('#wgLabel0_0609'),
  document.querySelector('#wgLabel1_0609'),
  document.querySelector('#wgLabel2_0609'),
]
const resetBtn0609 = document.querySelector('#wgReset_0609')
const scorePanelEl0609 = document.querySelector('#wgScorePanel_0609')
const simplexPanelEl0609 = document.querySelector('#wgSimplexPanel_0609')
const readout0609 = document.querySelector('#wgReadout_0609')
const verdict0609 = document.querySelector('#wgVerdict_0609')

let selectedLabel0609 = LABEL_DEFAULT_0609

function currentParams0609() {
  return {
    x1: x1Slider0609 ? Number(x1Slider0609.value) : X1_DEFAULT_0609,
    x2: x2Slider0609 ? Number(x2Slider0609.value) : X2_DEFAULT_0609,
  }
}

function updateLabelButtons0609() {
  labelBtns0609.forEach((btn, k) => {
    if (!btn) return
    const active = k === selectedLabel0609
    btn.setAttribute('aria-pressed', String(active))
    btn.classList.toggle('active', active)
  })
}

function renderLab0609() {
  if (!x1Slider0609 || !x2Slider0609) return
  const { x1, x2 } = currentParams0609()
  if (x1Out0609) x1Out0609.textContent = x1.toFixed(1)
  if (x2Out0609) x2Out0609.textContent = x2.toFixed(1)

  if (scorePanelEl0609) {
    scorePanelEl0609.innerHTML = scorePanelSvg0609(x1, x2, 'c0609-lab-score', 'Live raw score bars, updated as the sliders move', 'A live version of the raw score bar chart, redrawn from the current slider values.')
  }
  if (simplexPanelEl0609) {
    simplexPanelEl0609.innerHTML = simplexPanelSvg0609(x1, x2, 'c0609-lab-simplex', 'Live probability simplex, updated as the sliders move', 'A live version of the probability simplex triangle, redrawn from the current slider values.')
  }

  const { scores, probs } = softmaxPredict0609(x1, x2)
  const loss = crossEntropy0609(probs, selectedLabel0609)
  const band = bandForLoss0609(loss)

  if (readout0609) {
    readout0609.innerHTML = `
      <div><span>RAW SCORES z</span><b>${scores.map(s => s.toFixed(2)).join(', ')}</b></div>
      <div><span>SOFTMAX PROBABILITIES p</span><b>${probs.map(p => p.toFixed(4)).join(', ')} -- SUM = ${probs.reduce((a, b) => a + b, 0).toFixed(4)}</b></div>
      <div><span>FOR COMPARISON</span><b>Concept 08's own OvR scores at its worked point were 0, 1.0, 1.9 -- summing to 2.9, not 1, and not a probability distribution at all.</b></div>
    `
  }

  if (verdict0609) {
    verdict0609.className = `gate-verdict ${band.cls}`
    verdict0609.textContent = `True label = ${CLASS_LABELS_0609[selectedLabel0609]} -- cross-entropy loss = ${loss.toFixed(4)} (${band.text}) at x1=${x1.toFixed(1)}, x2=${x2.toFixed(1)}.`
  }
}

x1Slider0609?.addEventListener('input', renderLab0609)
x2Slider0609?.addEventListener('input', renderLab0609)

labelBtns0609.forEach((btn, k) => {
  btn?.addEventListener('click', () => {
    selectedLabel0609 = k
    updateLabelButtons0609()
    renderLab0609()
  })
})

resetBtn0609?.addEventListener('click', () => {
  if (x1Slider0609) x1Slider0609.value = String(X1_DEFAULT_0609)
  if (x2Slider0609) x2Slider0609.value = String(X2_DEFAULT_0609)
  selectedLabel0609 = LABEL_DEFAULT_0609
  updateLabelButtons0609()
  renderLab0609()
})

renderSoftmaxStatic1_0609()
renderSoftmaxStatic2_0609()
updateLabelButtons0609()
renderLab0609()
