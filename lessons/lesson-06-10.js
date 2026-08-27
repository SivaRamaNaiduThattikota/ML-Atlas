// Section 14's lab: The Separability Test. Concepts 01-09 built the
// mechanics of the linear/logistic/LDA/softmax family -- none of them ever
// asked whether that family was the right tool for a given dataset in the
// first place. This concept puts ONE shared straight-line boundary,
// z=w0+w1*x1+w2*x2, against two small toy datasets: one where a line is
// structurally sufficient, one where no line, however tuned, ever can be.
// The lab lets the reader feel that ceiling directly, by dragging the exact
// same three sliders against both.

// Dataset A -- six fresh CFPB-style points in two well-separated clusters.
// Fresh numbers, sharing nothing with Concepts 04-09's own weights/points.
const DATASET_A_0610 = [
  { label: 'A1', x1: 1, x2: 1, y: 0 },
  { label: 'A2', x1: 2, x2: 1, y: 0 },
  { label: 'A3', x1: 1, x2: 2, y: 0 },
  { label: 'A4', x1: 4, x2: 4, y: 1 },
  { label: 'A5', x1: 5, x2: 4, y: 1 },
  { label: 'A6', x1: 4, x2: 5, y: 1 },
]

// Dataset B -- the classic 4-point XOR square, framed as a toy two-flag
// intake label (escalate = flag1 XOR flag2). Not real CFPB data -- an
// illustrative frame around the standard abstract counterexample.
const DATASET_B_0610 = [
  { label: 'B1', x1: 0, x2: 0, y: 0 },
  { label: 'B2', x1: 1, x2: 1, y: 0 },
  { label: 'B3', x1: 0, x2: 1, y: 1 },
  { label: 'B4', x1: 1, x2: 0, y: 1 },
]

// The worked example's own line -- the slider default and the Reset target.
const W0_DEFAULT_0610 = -5
const W1_DEFAULT_0610 = 1
const W2_DEFAULT_0610 = 1

// Two lines used only in the static contrast figures, both verified in the
// research stage: the independently-derived centroid perpendicular-bisector
// boundary for Dataset A (also 6/6), and one of the many lines tied at
// Dataset B's own 75% ceiling (the (1,1) point stays wrong no matter which
// tied line is picked).
const CENTROID_LINE_A_0610 = { w0: -17 / 3, w1: 1, w2: 1 }
const BEST_LINE_B_0610 = { w0: -0.5, w1: 1, w2: 1 }

const PLOT_CFG_0610 = {
  A: {
    x1Min: 0, x1Max: 6, x2Min: 0, x2Max: 6, tickStep: 1,
    axisX1: 'x1 = prior_contact_attempts', axisX2: 'x2 = case_age_days',
    points: DATASET_A_0610,
  },
  B: {
    x1Min: -0.5, x1Max: 1.5, x2Min: -0.5, x2Max: 1.5, tickStep: 0.5,
    axisX1: 'x1 = flag1', axisX2: 'x2 = flag2',
    points: DATASET_B_0610,
  },
}

function zOf0610(w0, w1, w2, x1, x2) {
  return w0 + w1 * x1 + w2 * x2
}

// -- Plot geometry (viewBox 0 0 460 320, matching Concept 06's own choice) --
const X0_0610 = 60, X1PX_0610 = 400, Y0_0610 = 30, Y1_0610 = 270

function pxX1_0610(x1, cfg) {
  return X0_0610 + (x1 - cfg.x1Min) / (cfg.x1Max - cfg.x1Min) * (X1PX_0610 - X0_0610)
}
function pxX2_0610(x2, cfg) {
  return Y1_0610 - (x2 - cfg.x2Min) / (cfg.x2Max - cfg.x2Min) * (Y1_0610 - Y0_0610)
}

function boxCorners0610(cfg) {
  return [
    { x1: cfg.x1Min, x2: cfg.x2Min }, { x1: cfg.x1Max, x2: cfg.x2Min },
    { x1: cfg.x1Max, x2: cfg.x2Max }, { x1: cfg.x1Min, x2: cfg.x2Max },
  ]
}

// Sutherland-Hodgman clip of the plot box against one half-plane of
// z(x1,x2)=0, done in data space via z itself -- never a slope -- reused
// directly from Concept 06's own approach so it stays correct at any slope.
function clipHalfPlane0610(polygon, zFn, keepPositive) {
  const out = []
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    const p1 = polygon[i]
    const p2 = polygon[(i + 1) % n]
    const z1 = zFn(p1), z2 = zFn(p2)
    const keep1 = keepPositive ? z1 >= 0 : z1 < 0
    if (keep1) out.push(p1)
    if ((z1 >= 0) !== (z2 >= 0)) {
      const t = z1 / (z1 - z2)
      out.push({ x1: p1.x1 + t * (p2.x1 - p1.x1), x2: p1.x2 + t * (p2.x2 - p1.x2) })
    }
  }
  return out
}

function regionPolygons0610(cfg, w0, w1, w2) {
  const zFn = p => zOf0610(w0, w1, w2, p.x1, p.x2)
  const corners = boxCorners0610(cfg)
  return {
    predict1: clipHalfPlane0610(corners, zFn, true),
    predict0: clipHalfPlane0610(corners, zFn, false),
  }
}

function boundaryCrossings0610(cfg, w0, w1, w2) {
  const zFn = p => zOf0610(w0, w1, w2, p.x1, p.x2)
  const corners = boxCorners0610(cfg)
  const pts = []
  const n = corners.length
  for (let i = 0; i < n; i++) {
    const p1 = corners[i], p2 = corners[(i + 1) % n]
    const z1 = zFn(p1), z2 = zFn(p2)
    if ((z1 >= 0) !== (z2 >= 0)) {
      const t = z1 / (z1 - z2)
      pts.push({ x1: p1.x1 + t * (p2.x1 - p1.x1), x2: p1.x2 + t * (p2.x2 - p1.x2) })
    }
  }
  return pts
}

function polygonPoints0610(cfg, poly) {
  return poly.map(p => `${pxX1_0610(p.x1, cfg).toFixed(1)},${pxX2_0610(p.x2, cfg).toFixed(1)}`).join(' ')
}

function lineSvgFor0610(cfg, w0, w1, w2, stroke, dash) {
  const crossings = boundaryCrossings0610(cfg, w0, w1, w2)
  if (crossings.length !== 2) return ''
  const [a, b] = crossings
  return `<line x1="${pxX1_0610(a.x1, cfg).toFixed(1)}" y1="${pxX2_0610(a.x2, cfg).toFixed(1)}" x2="${pxX1_0610(b.x1, cfg).toFixed(1)}" y2="${pxX2_0610(b.x2, cfg).toFixed(1)}" stroke="${stroke}" stroke-width="1.6"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
}

function axisFrame0610(cfg) {
  const ticks = []
  for (let v = cfg.x1Min; v <= cfg.x1Max + 1e-9; v += cfg.tickStep) ticks.push(Math.round(v * 100) / 100)
  const xTicks = ticks.map(x1 => {
    const px = pxX1_0610(x1, cfg).toFixed(1)
    return `<line x1="${px}" y1="${Y1_0610}" x2="${px}" y2="${Y1_0610 + 5}" stroke="currentColor" stroke-width="1"/><text x="${px}" y="${Y1_0610 + 16}" text-anchor="middle" font-size="7">${x1}</text>`
  }).join('')
  const yTicks = ticks.map(x2 => {
    const py = pxX2_0610(x2, cfg).toFixed(1)
    return `<line x1="${X0_0610 - 5}" y1="${py}" x2="${X0_0610}" y2="${py}" stroke="currentColor" stroke-width="1"/><text x="${X0_0610 - 9}" y="${(Number(py) + 2.5).toFixed(1)}" text-anchor="end" font-size="7">${x2}</text>`
  }).join('')
  return `
    <line x1="${X0_0610}" y1="${Y0_0610}" x2="${X0_0610}" y2="${Y1_0610}" stroke="currentColor" stroke-width="1.2"/>
    <line x1="${X0_0610}" y1="${Y1_0610}" x2="${X1PX_0610}" y2="${Y1_0610}" stroke="currentColor" stroke-width="1.2"/>
    ${xTicks}${yTicks}
    <text x="${(X0_0610 + X1PX_0610) / 2}" y="${Y1_0610 + 28}" text-anchor="middle" font-size="7.5" font-weight="700">${cfg.axisX1}</text>
    <text x="16" y="${(Y0_0610 + Y1_0610) / 2}" text-anchor="middle" font-size="7.5" font-weight="700" transform="rotate(-90 16 ${(Y0_0610 + Y1_0610) / 2})">${cfg.axisX2}</text>
  `
}

function accuracyFor0610(datasetKey, w0, w1, w2) {
  const cfg = PLOT_CFG_0610[datasetKey]
  const results = cfg.points.map(p => {
    const z = zOf0610(w0, w1, w2, p.x1, p.x2)
    const predicted = z >= 0 ? 1 : 0
    return { ...p, z, predicted, correct: predicted === p.y }
  })
  const correct = results.filter(r => r.correct).length
  return { results, correct, total: results.length }
}

// Renders one dataset's panel. `interactive` panels get the live boundary
// line, the shaded predicted-class regions, and correctness-colored dots
// (green=correct, red=incorrect). Non-interactive panels stay a plain
// scatter, colored by true label, exactly as Concepts 04-09 always drew it.
function panelSvg0610(datasetKey, { w0, w1, w2, interactive, titleId, titleText, descText, extraLine }) {
  const cfg = PLOT_CFG_0610[datasetKey]
  const { results } = accuracyFor0610(datasetKey, w0, w1, w2)

  let regionsSvg = '', lineSvg = ''
  if (interactive) {
    const { predict1, predict0 } = regionPolygons0610(cfg, w0, w1, w2)
    regionsSvg = `${predict1.length ? `<polygon points="${polygonPoints0610(cfg, predict1)}" fill="var(--teal)" opacity="0.12"/>` : ''}${predict0.length ? `<polygon points="${polygonPoints0610(cfg, predict0)}" fill="var(--orange)" opacity="0.08"/>` : ''}`
    lineSvg = lineSvgFor0610(cfg, w0, w1, w2, 'currentColor', null)
  }
  const extraLineSvg = extraLine ? lineSvgFor0610(cfg, extraLine.w0, extraLine.w1, extraLine.w2, extraLine.stroke || 'var(--green)', extraLine.dash || '4,3') : ''

  const dots = results.map(r => {
    const cx = pxX1_0610(r.x1, cfg).toFixed(1)
    const cy = pxX2_0610(r.x2, cfg).toFixed(1)
    const color = interactive ? (r.correct ? 'var(--teal)' : '#c0392b') : (r.y === 1 ? 'var(--teal)' : 'var(--orange)')
    return `<circle cx="${cx}" cy="${cy}" r="6" fill="${color}" stroke="var(--bg)" stroke-width="1"/><text x="${cx}" y="${(Number(cy) - 10).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="700">${r.label}</text>`
  }).join('')

  return `
    <svg class="vector-plane" viewBox="0 0 460 320" role="img" aria-labelledby="${titleId}-title ${titleId}-desc">
      <title id="${titleId}-title">${titleText}</title>
      <desc id="${titleId}-desc">${descText}</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        ${axisFrame0610(cfg)}
        ${regionsSvg}${lineSvg}${extraLineSvg}
        ${dots}
      </g>
    </svg>
  `
}

// -- Static figure #1 (beginner, b04): the main line, both datasets. --
function renderSeparabilityStatic1_0610() {
  const wrap = document.querySelector('#wgSeparabilityStatic1_0610')
  if (!wrap) return
  const a = accuracyFor0610('A', W0_DEFAULT_0610, W1_DEFAULT_0610, W2_DEFAULT_0610)
  const b = accuracyFor0610('B', W0_DEFAULT_0610, W1_DEFAULT_0610, W2_DEFAULT_0610)
  wrap.innerHTML = `
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">${panelSvg0610('A', {
        w0: W0_DEFAULT_0610, w1: W1_DEFAULT_0610, w2: W2_DEFAULT_0610, interactive: true,
        titleId: 'c0610-b04-a', titleText: 'Dataset A with the boundary line x1+x2=5',
        descText: 'A scatter plot of six points in two tight clusters, split cleanly by one straight line into a teal-shaded predict-class-1 region and an orange-shaded predict-class-0 region, every point colored teal for correct.',
      })}<p class="fine-print" style="text-align:center">Dataset A -- ${a.correct}/${a.total} correct (100%) with one straight line.</p></div>
      <div style="flex:1;min-width:220px">${panelSvg0610('B', {
        w0: W0_DEFAULT_0610, w1: W1_DEFAULT_0610, w2: W2_DEFAULT_0610, interactive: true,
        titleId: 'c0610-b04-b', titleText: 'Dataset B (XOR) with the same boundary line',
        descText: 'A scatter plot of the four XOR corners with the same boundary line now drawn off to one side, leaving two of the four points colored red for incorrect.',
      })}<p class="fine-print" style="text-align:center">Dataset B -- only ${b.correct}/${b.total} correct with this same line.</p></div>
    </div>
    <p class="fine-print">The exact same line, z=-5+x1+x2, is structurally sufficient for Dataset A and structurally poor for Dataset B -- not because the line is wrong, but because Dataset B was never separable by any straight line to begin with (Section 09 in the advanced lesson).</p>
  `
}

// -- Static figure #2 (advanced, s07): the two-line / convex-hull contrast. --
function renderSeparabilityStatic2_0610() {
  const wrap = document.querySelector('#wgSeparabilityStatic2_0610')
  if (!wrap) return
  const bBest = accuracyFor0610('B', BEST_LINE_B_0610.w0, BEST_LINE_B_0610.w1, BEST_LINE_B_0610.w2)
  wrap.innerHTML = `
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">${panelSvg0610('A', {
        w0: W0_DEFAULT_0610, w1: W1_DEFAULT_0610, w2: W2_DEFAULT_0610, interactive: true,
        extraLine: { w0: CENTROID_LINE_A_0610.w0, w1: CENTROID_LINE_A_0610.w1, w2: CENTROID_LINE_A_0610.w2, stroke: 'var(--green)', dash: '4,3' },
        titleId: 'c0610-s07-a', titleText: 'Dataset A with two independently-derived lines, both 6/6',
        descText: 'The same Dataset A scatter with two different straight lines drawn: the solid main-example line, and a dashed second line derived from the perpendicular bisector of the two class centroids -- both achieve full separation, showing separability is a real property of the data, not an artifact of one lucky line.',
      })}<p class="fine-print" style="text-align:center">Solid: x1+x2=5 (6/6). Dashed: the centroid bisector, x1+x2≈5.667 (also 6/6). Many lines work.</p></div>
      <div style="flex:1;min-width:220px">${panelSvg0610('B', {
        w0: BEST_LINE_B_0610.w0, w1: BEST_LINE_B_0610.w1, w2: BEST_LINE_B_0610.w2, interactive: true,
        titleId: 'c0610-s07-b', titleText: 'Dataset B (XOR) at its own 75% ceiling',
        descText: 'The four XOR corners with one of the many tied best-possible lines drawn -- three points colored teal for correct and one colored red for incorrect, the maximum any straight line can achieve on this dataset.',
      })}<p class="fine-print" style="text-align:center">${bBest.correct}/${bBest.total} correct (75%) -- the ceiling for ANY line, confirmed by two independent computational searches (Section 10).</p></div>
    </div>
    <p class="fine-print">Why the ceiling holds: class 0's own convex hull is the diagonal segment from (0,0) to (1,1); class 1's own convex hull is the diagonal segment from (0,1) to (1,0). The two segments cross at (0.5, 0.5) -- and whenever two classes' convex hulls intersect, no single straight line can separate them (the standard linear-separability criterion, named here, not re-derived as a formal proof).</p>
  `
}

// -- Interactive lab (s14): The Separability Test. --
const w0Slider0610 = document.querySelector('#wgW0_0610')
const w1Slider0610 = document.querySelector('#wgW1_0610')
const w2Slider0610 = document.querySelector('#wgW2_0610')
const w0Out0610 = document.querySelector('#wgW0Out_0610')
const w1Out0610 = document.querySelector('#wgW1Out_0610')
const w2Out0610 = document.querySelector('#wgW2Out_0610')
const datasetABtn0610 = document.querySelector('#wgDatasetA_0610')
const datasetBBtn0610 = document.querySelector('#wgDatasetB_0610')
const resetBtn0610 = document.querySelector('#wgReset_0610')
const panelAEl0610 = document.querySelector('#wgSeparabilityPanelA_0610')
const panelBEl0610 = document.querySelector('#wgSeparabilityPanelB_0610')
const accuracyOut0610 = document.querySelector('#wgAccuracyOut_0610')
const bestOut0610 = document.querySelector('#wgBestOut_0610')
const verdict0610 = document.querySelector('#wgVerdict_0610')

let activeDataset0610 = 'A'
const bestFound0610 = { A: 0, B: 0 }

function currentWeights0610() {
  return {
    w0: w0Slider0610 ? Number(w0Slider0610.value) : W0_DEFAULT_0610,
    w1: w1Slider0610 ? Number(w1Slider0610.value) : W1_DEFAULT_0610,
    w2: w2Slider0610 ? Number(w2Slider0610.value) : W2_DEFAULT_0610,
  }
}

function updateToggleButtons0610() {
  if (datasetABtn0610) {
    datasetABtn0610.setAttribute('aria-pressed', String(activeDataset0610 === 'A'))
    datasetABtn0610.classList.toggle('active', activeDataset0610 === 'A')
  }
  if (datasetBBtn0610) {
    datasetBBtn0610.setAttribute('aria-pressed', String(activeDataset0610 === 'B'))
    datasetBBtn0610.classList.toggle('active', activeDataset0610 === 'B')
  }
}

function renderLab0610() {
  if (!w0Slider0610 || !w1Slider0610 || !w2Slider0610) return
  const { w0, w1, w2 } = currentWeights0610()
  if (w0Out0610) w0Out0610.textContent = w0.toFixed(2)
  if (w1Out0610) w1Out0610.textContent = w1.toFixed(2)
  if (w2Out0610) w2Out0610.textContent = w2.toFixed(2)

  const inactiveDataset = activeDataset0610 === 'A' ? 'B' : 'A'

  if (panelAEl0610) {
    panelAEl0610.style.opacity = activeDataset0610 === 'A' ? '1' : '0.42'
    panelAEl0610.innerHTML = panelSvg0610('A', {
      w0, w1, w2, interactive: activeDataset0610 === 'A',
      titleId: 'c0610-lab-a', titleText: 'Dataset A, near-linear cluster pair',
      descText: 'A live scatter plot of Dataset A with the shared boundary line, redrawn from the current slider values when this panel is active.',
    })
  }
  if (panelBEl0610) {
    panelBEl0610.style.opacity = activeDataset0610 === 'B' ? '1' : '0.42'
    panelBEl0610.innerHTML = panelSvg0610('B', {
      w0, w1, w2, interactive: activeDataset0610 === 'B',
      titleId: 'c0610-lab-b', titleText: 'Dataset B, the XOR square',
      descText: 'A live scatter plot of the four XOR corners with the shared boundary line, redrawn from the current slider values when this panel is active.',
    })
  }

  const { correct, total } = accuracyFor0610(activeDataset0610, w0, w1, w2)
  const pct = (correct / total) * 100
  if (correct > bestFound0610[activeDataset0610]) bestFound0610[activeDataset0610] = correct

  if (accuracyOut0610) {
    accuracyOut0610.textContent = `Accuracy: ${correct}/${total} (${pct.toFixed(0)}%)`
  }
  if (bestOut0610) {
    const bestPct = (bestFound0610[activeDataset0610] / total) * 100
    bestOut0610.textContent = `Best found this session on Dataset ${activeDataset0610}: ${bestFound0610[activeDataset0610]}/${total} (${bestPct.toFixed(0)}%)`
  }

  if (verdict0610) {
    let cls, text
    if (activeDataset0610 === 'A') {
      cls = correct === total ? 'verdict-green' : 'verdict-amber'
      text = correct === total
        ? `${correct}/${total} correct -- you found a separating line. Many different w0, w1, w2 combinations reach 100% here; this is only one of them.`
        : `${correct}/${total} correct on Dataset A. Keep dragging -- a fully separating line exists for this dataset (try Reset for a line that already reaches it).`
    } else {
      cls = correct === 3 ? 'verdict-amber' : (correct === 4 ? 'verdict-red' : 'verdict-red')
      text = correct >= 3
        ? `${correct}/${total} correct -- this is the ceiling. No matter how w0, w1 and w2 are dragged, no straight line reaches 4/4 on Dataset B (never observed above 75% across 15,625 grid combinations and 200,000 random lines in the research stage).`
        : `${correct}/${total} correct on Dataset B. Drag further -- the best any line ever reaches here is 3/4 (75%), never 4/4.`
    }
    verdict0610.className = `gate-verdict ${cls}`
    verdict0610.textContent = text
  }

  void inactiveDataset
}

w0Slider0610?.addEventListener('input', renderLab0610)
w1Slider0610?.addEventListener('input', renderLab0610)
w2Slider0610?.addEventListener('input', renderLab0610)

datasetABtn0610?.addEventListener('click', () => {
  activeDataset0610 = 'A'
  updateToggleButtons0610()
  renderLab0610()
})
datasetBBtn0610?.addEventListener('click', () => {
  activeDataset0610 = 'B'
  updateToggleButtons0610()
  renderLab0610()
})

resetBtn0610?.addEventListener('click', () => {
  if (w0Slider0610) w0Slider0610.value = String(W0_DEFAULT_0610)
  if (w1Slider0610) w1Slider0610.value = String(W1_DEFAULT_0610)
  if (w2Slider0610) w2Slider0610.value = String(W2_DEFAULT_0610)
  bestFound0610.A = 0
  bestFound0610.B = 0
  renderLab0610()
})

renderSeparabilityStatic1_0610()
renderSeparabilityStatic2_0610()
updateToggleButtons0610()
renderLab0610()
