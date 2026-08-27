// Section 14's lab: The Boundary Line. Concept 04 fit z=w0+w1x1+w2x2 and
// Concept 05 renamed z as log-odds -- both stayed on 1D rails (a sigmoid
// curve, three linked rails). This lab is the module's first live 2D
// feature-space plot: x1 (prior_contact_attempts) on the horizontal axis,
// x2 (satisfaction_score) on the vertical axis, with the two predicted-class
// regions shaded live via a Sutherland-Hodgman half-plane polygon clip of
// the plot box against z(x1,x2)=w0+w1*x1+w2*x2 -- never via a slope/intercept
// computation, so it stays correct even at slopes the readout text can't
// safely divide by.
//
// Also drives two static, non-interactive figures that never move: b04's
// five-row preview (Rows A-E, default weights only) and s07's six-row
// preview (Rows A-F) with Row C's own perpendicular-distance segment.

// Concept 04's own fitted weights, reused verbatim -- this concept refits
// nothing. The lab's sliders default here and can be moved away.
const W0_DEFAULT_0606 = -4
const W1_DEFAULT_0606 = 1.5
const W2_DEFAULT_0606 = -0.5

// Concept 04's five rows (A-E) plus Concept 05's Row F. Row F carries no
// ground-truth label (y: null) -- it was Concept 05's hypothetical
// demonstration row, and this concept keeps saying so rather than
// inventing or silently dropping a label for it.
const ROWS_0606 = [
  { label: 'A', x1: 1, x2: 4, y: 0 },
  { label: 'B', x1: 2, x2: 3, y: 0 },
  { label: 'C', x1: 3, x2: 3, y: 1 },
  { label: 'D', x1: 4, x2: 2, y: 1 },
  { label: 'E', x1: 6, x2: 1, y: 1 },
  { label: 'F', x1: 4, x2: 3, y: null },
]

// Row C's perpendicular foot on the default boundary line, and the
// resulting distance -- both independently verified in the research stage
// (foot=(3.6,2.8) satisfies 1.5(3.6)-0.5(2.8)-4=0 exactly; distance from
// (3,3) to that foot is sqrt(0.4)=0.632456, matching z/||w|| to full float
// precision). Cited here, not recomputed.
const ROW_C_FOOT_0606 = { x1: 3.6, x2: 2.8 }

function zOf0606(w0, w1, w2, x1, x2) {
  return w0 + w1 * x1 + w2 * x2
}

// -- Plot geometry (Section spec, viewBox 0 0 460 320) --
const X0_0606 = 70, X1PX_0606 = 430, Y0_0606 = 40, Y1_0606 = 280
const X1_MIN_0606 = 0, X1_MAX_0606 = 7, X2_MIN_0606 = 0, X2_MAX_0606 = 5

function pxX1_0606(x1) {
  return X0_0606 + (x1 - X1_MIN_0606) / (X1_MAX_0606 - X1_MIN_0606) * (X1PX_0606 - X0_0606)
}
function pxX2_0606(x2) {
  return Y1_0606 - (x2 - X2_MIN_0606) / (X2_MAX_0606 - X2_MIN_0606) * (Y1_0606 - Y0_0606)
}

const BOX_CORNERS_0606 = [
  { x1: 0, x2: 0 }, { x1: 7, x2: 0 }, { x1: 7, x2: 5 }, { x1: 0, x2: 5 },
]

// Standard Sutherland-Hodgman clip of a convex polygon against a single
// half-plane, done in data space using z itself -- never a slope. Walks
// each edge p1->p2 (wrapping); keeps p1 when it satisfies the half-plane
// test, and whenever the edge crosses z=0 (sign(z1) != sign(z2)), inserts
// the interpolated crossing point at t = z1/(z1-z2).
function clipHalfPlane0606(polygon, zFn, keepPositive) {
  const out = []
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    const p1 = polygon[i]
    const p2 = polygon[(i + 1) % n]
    const z1 = zFn(p1)
    const z2 = zFn(p2)
    const keep1 = keepPositive ? z1 >= 0 : z1 < 0
    if (keep1) out.push(p1)
    if ((z1 >= 0) !== (z2 >= 0)) {
      const t = z1 / (z1 - z2)
      out.push({ x1: p1.x1 + t * (p2.x1 - p1.x1), x2: p1.x2 + t * (p2.x2 - p1.x2) })
    }
  }
  return out
}

function regionPolygons0606(w0, w1, w2) {
  const zFn = p => zOf0606(w0, w1, w2, p.x1, p.x2)
  return {
    predict1: clipHalfPlane0606(BOX_CORNERS_0606, zFn, true),
    predict0: clipHalfPlane0606(BOX_CORNERS_0606, zFn, false),
  }
}

// The boundary line's own two crossing points on the box edges -- the
// shared edge between the two shaded polygons. 0 points means the whole
// box lands on one side (a valid, teachable edge case); 2 points is the
// normal case and gets drawn as an explicit stroke for visual crispness.
function boundaryCrossings0606(w0, w1, w2) {
  const zFn = p => zOf0606(w0, w1, w2, p.x1, p.x2)
  const pts = []
  const n = BOX_CORNERS_0606.length
  for (let i = 0; i < n; i++) {
    const p1 = BOX_CORNERS_0606[i]
    const p2 = BOX_CORNERS_0606[(i + 1) % n]
    const z1 = zFn(p1)
    const z2 = zFn(p2)
    if ((z1 >= 0) !== (z2 >= 0)) {
      const t = z1 / (z1 - z2)
      pts.push({ x1: p1.x1 + t * (p2.x1 - p1.x1), x2: p1.x2 + t * (p2.x2 - p1.x2) })
    }
  }
  return pts
}

function polygonPoints0606(poly) {
  return poly.map(p => `${pxX1_0606(p.x1).toFixed(1)},${pxX2_0606(p.x2).toFixed(1)}`).join(' ')
}

function axisFrame0606() {
  const xTicks = [0, 1, 2, 3, 4, 5, 6, 7].map(x1 => {
    const px = pxX1_0606(x1).toFixed(1)
    return `
      <line x1="${px}" y1="${Y1_0606}" x2="${px}" y2="${Y1_0606 + 5}" stroke="currentColor" stroke-width="1"/>
      <text x="${px}" y="${Y1_0606 + 16}" text-anchor="middle" font-size="7">${x1}</text>
    `
  }).join('')
  const yTicks = [0, 1, 2, 3, 4, 5].map(x2 => {
    const py = pxX2_0606(x2).toFixed(1)
    return `
      <line x1="${X0_0606 - 5}" y1="${py}" x2="${X0_0606}" y2="${py}" stroke="currentColor" stroke-width="1"/>
      <text x="${X0_0606 - 9}" y="${(Number(py) + 2.5).toFixed(1)}" text-anchor="end" font-size="7">${x2}</text>
    `
  }).join('')
  return `
    <line x1="${X0_0606}" y1="${Y0_0606}" x2="${X0_0606}" y2="${Y1_0606}" stroke="currentColor" stroke-width="1.2"/>
    <line x1="${X0_0606}" y1="${Y1_0606}" x2="${X1PX_0606}" y2="${Y1_0606}" stroke="currentColor" stroke-width="1.2"/>
    ${xTicks}${yTicks}
    <text x="${(X0_0606 + X1PX_0606) / 2}" y="${Y1_0606 + 30}" text-anchor="middle" font-size="7.5" font-weight="700">x1 = prior_contact_attempts</text>
    <text x="18" y="${(Y0_0606 + Y1_0606) / 2}" text-anchor="middle" font-size="7.5" font-weight="700" transform="rotate(-90 18 ${(Y0_0606 + Y1_0606) / 2})">x2 = satisfaction_score</text>
  `
}

function rowColor0606(row) {
  if (row.y === null) return 'var(--ink)'
  return row.y === 1 ? 'var(--teal)' : 'var(--orange)'
}

function rowMarkers0606(labels, highlightLabel) {
  return ROWS_0606.filter(r => labels.includes(r.label)).map(row => {
    const cx = pxX1_0606(row.x1).toFixed(1)
    const cy = pxX2_0606(row.x2).toFixed(1)
    const color = rowColor0606(row)
    const ring = row.label === highlightLabel
      ? `<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="${color}" stroke-width="2"><animate attributeName="r" values="9;13;9" dur="1.1s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0.35;1" dur="1.1s" repeatCount="indefinite"/></circle>`
      : ''
    return `
      ${ring}
      <circle cx="${cx}" cy="${cy}" r="5" fill="${color}" stroke="var(--bg)" stroke-width="1"/>
      <text x="${cx}" y="${(Number(cy) - 9).toFixed(1)}" text-anchor="middle" font-weight="700" font-size="8" fill="${color}">${row.label}</text>
    `
  }).join('')
}

function boundaryPlotSvg0606({ w0, w1, w2, labels, highlightLabel, showDistance, titleId, descText, titleText }) {
  const { predict1, predict0 } = regionPolygons0606(w0, w1, w2)
  const crossings = boundaryCrossings0606(w0, w1, w2)
  const lineSvg = crossings.length === 2
    ? `<line x1="${pxX1_0606(crossings[0].x1).toFixed(1)}" y1="${pxX2_0606(crossings[0].x2).toFixed(1)}" x2="${pxX1_0606(crossings[1].x1).toFixed(1)}" y2="${pxX2_0606(crossings[1].x2).toFixed(1)}" stroke="currentColor" stroke-width="1.5"/>`
    : ''
  const p1Svg = predict1.length ? `<polygon points="${polygonPoints0606(predict1)}" fill="var(--teal)" opacity="0.14"/>` : ''
  const p0Svg = predict0.length ? `<polygon points="${polygonPoints0606(predict0)}" fill="var(--orange)" opacity="0.10"/>` : ''
  let distanceSvg = ''
  if (showDistance) {
    const rowC = ROWS_0606.find(r => r.label === 'C')
    const cx = pxX1_0606(rowC.x1).toFixed(1), cy = pxX2_0606(rowC.x2).toFixed(1)
    const fx = pxX1_0606(ROW_C_FOOT_0606.x1).toFixed(1), fy = pxX2_0606(ROW_C_FOOT_0606.x2).toFixed(1)
    distanceSvg = `
      <line x1="${cx}" y1="${cy}" x2="${fx}" y2="${fy}" stroke="var(--ink)" stroke-width="1.2" stroke-dasharray="3,3"/>
      <circle cx="${fx}" cy="${fy}" r="2.5" fill="var(--ink)"/>
      <text x="${(Number(fx) + 6).toFixed(1)}" y="${(Number(fy) - 4).toFixed(1)}" font-size="6.5" fill="var(--muted)">0.632456</text>
    `
  }
  return `
    <svg class="vector-plane" viewBox="0 0 460 320" role="img" aria-labelledby="${titleId}-title ${titleId}-desc">
      <title id="${titleId}-title">${titleText}</title>
      <desc id="${titleId}-desc">${descText}</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        ${axisFrame0606()}
        ${p1Svg}${p0Svg}${lineSvg}
        ${distanceSvg}
        ${rowMarkers0606(labels, highlightLabel)}
      </g>
    </svg>
  `
}

// -- Static figure #1 (beginner, b04): Rows A-E only, default weights. --
function renderBoundaryStatic5_0606() {
  const wrap = document.querySelector('#wgBoundaryStatic5_0606')
  if (!wrap) return
  wrap.innerHTML = boundaryPlotSvg0606({
    w0: W0_DEFAULT_0606, w1: W1_DEFAULT_0606, w2: W2_DEFAULT_0606,
    labels: ['A', 'B', 'C', 'D', 'E'],
    highlightLabel: null,
    showDistance: false,
    titleId: 'c0606-b04-svg',
    titleText: 'The fitted boundary line x2=3x1-8, with Rows A through E plotted in feature space',
    descText: 'A scatter plot with prior_contact_attempts on the horizontal axis and satisfaction_score on the vertical axis. A straight line runs from the bottom edge to the top edge of the plot, splitting it into a teal-shaded predict-relief region below the line and an orange-shaded predict-no-relief region above it. Rows A, B and C sit above the line; Rows D and E sit below it. Row C, despite sitting above the line with the rest of the no-relief group, is actually labeled relief -- the one row this boundary gets wrong.',
  })
}

// -- Static figure #2 (advanced, s07): Rows A-F plus Row C's distance. --
function renderBoundaryStatic6_0606() {
  const wrap = document.querySelector('#wgBoundaryStatic6_0606')
  if (!wrap) return
  wrap.innerHTML = boundaryPlotSvg0606({
    w0: W0_DEFAULT_0606, w1: W1_DEFAULT_0606, w2: W2_DEFAULT_0606,
    labels: ['A', 'B', 'C', 'D', 'E', 'F'],
    highlightLabel: null,
    showDistance: true,
    titleId: 'c0606-s07-svg',
    titleText: 'All six rows, A through F, with Row C\'s own perpendicular distance to the boundary line',
    descText: 'The same shaded boundary plot as the beginner figure, with Row F added below and to the right of Row D, in the ink color marking it as a row with no ground-truth label. A short dashed segment runs from Row C down to its nearest point on the boundary line, labeled with the distance value 0.632456 -- this row\'s own distance to today\'s boundary, not a margin.',
  })
}

// -- Interactive lab (s14): The Boundary Line. --
const w0Slider0606 = document.querySelector('#wgW0_0606')
const w1Slider0606 = document.querySelector('#wgW1_0606')
const w2Slider0606 = document.querySelector('#wgW2_0606')
const w0Out0606 = document.querySelector('#wgW0Out_0606')
const w1Out0606 = document.querySelector('#wgW1Out_0606')
const w2Out0606 = document.querySelector('#wgW2Out_0606')
const resetBtn0606 = document.querySelector('#wgReset_0606')
const highlightButtons0606 = [...document.querySelectorAll('#wgHighlightGroup_0606 [data-row]')]
const plotWrap0606 = document.querySelector('#wgBoundaryPlot_0606')
const readout0606 = document.querySelector('#wgReadout_0606')
const verdict0606 = document.querySelector('#wgVerdict_0606')

let highlightedRow0606 = null

function currentWeights0606() {
  return {
    w0: w0Slider0606 ? Number(w0Slider0606.value) : W0_DEFAULT_0606,
    w1: w1Slider0606 ? Number(w1Slider0606.value) : W1_DEFAULT_0606,
    w2: w2Slider0606 ? Number(w2Slider0606.value) : W2_DEFAULT_0606,
  }
}

function isDefaultWeights0606(w0, w1, w2) {
  return w0 === W0_DEFAULT_0606 && w1 === W1_DEFAULT_0606 && w2 === W2_DEFAULT_0606
}

function renderLab0606() {
  if (!w0Slider0606 || !w1Slider0606 || !w2Slider0606) return
  const { w0, w1, w2 } = currentWeights0606()
  if (w0Out0606) w0Out0606.textContent = w0.toFixed(1)
  if (w1Out0606) w1Out0606.textContent = w1.toFixed(1)
  if (w2Out0606) w2Out0606.textContent = w2.toFixed(1)

  if (plotWrap0606) {
    plotWrap0606.innerHTML = boundaryPlotSvg0606({
      w0, w1, w2,
      labels: ['A', 'B', 'C', 'D', 'E', 'F'],
      highlightLabel: highlightedRow0606,
      showDistance: false,
      titleId: 'c0606-lab-svg',
      titleText: 'Live boundary plot, updated as the weight sliders move',
      descText: 'A live scatter plot of the six rows with the current boundary line and its two shaded predicted-class regions, recomputed directly from the three weight sliders.',
    })
  }

  // Slope/intercept readout -- well-defined because w2's slider range is
  // held strictly negative, so this division never hits zero.
  const m = -w1 / w2
  const b = -w0 / w2

  const rowLines = ROWS_0606.map(row => {
    const z = zOf0606(w0, w1, w2, row.x1, row.x2)
    const predicted = z >= 0 ? 1 : 0
    const matchText = row.y === null ? 'no ground truth' : (predicted === row.y ? 'match' : 'MISS')
    return `<div><span>ROW ${row.label} (x1=${row.x1}, x2=${row.x2})</span><b>z=${z.toFixed(2)} → predict ${predicted}${row.y !== null ? `, actual ${row.y} (${matchText})` : ` (${matchText})`}</b></div>`
  }).join('')

  const labeledRows = ROWS_0606.filter(r => r.y !== null)
  const correctCount = labeledRows.filter(row => {
    const z = zOf0606(w0, w1, w2, row.x1, row.x2)
    const predicted = z >= 0 ? 1 : 0
    return predicted === row.y
  }).length

  if (readout0606) {
    readout0606.innerHTML = `
      <div><span>WEIGHTS</span><b>w0=${w0.toFixed(1)}, w1=${w1.toFixed(1)}, w2=${w2.toFixed(1)}</b></div>
      <div><span>BOUNDARY LINE</span><b>x2 = ${m.toFixed(2)}·x1 + ${b.toFixed(2)}</b></div>
      ${rowLines}
      <div class="wide"><span>TALLY (A-E ONLY, F HAS NO LABEL)</span><b>${correctCount}/5 correct</b></div>
    `
  }

  if (verdict0606) {
    let cls = correctCount === 5 ? 'verdict-green' : 'verdict-amber'
    let text
    if (isDefaultWeights0606(w0, w1, w2)) {
      text = `At the fitted weights, the line is x2=3x1-8: 4/5 correct. Row C sits on the "predict 0" side despite its true label being 1 -- geometrically, this is the same row Concept 04's own cross-entropy loss flagged as the confidently-wrong one.`
      cls = 'verdict-amber'
    } else if (correctCount === 5) {
      text = `${correctCount}/5 correct -- this toy set is linearly separable (Wikipedia, Linear separability, Section 24), but the fitted model's own boundary above is not the unique line that achieves it. These five rows are illustrative, not the real training data (Concept 04's own framing).`
    } else {
      text = `${correctCount}/5 correct at these weights. Move the sliders back to w0=-4, w1=1.5, w2=-0.5 (or press Reset) to return to the fitted model's own boundary.`
    }
    verdict0606.className = `gate-verdict ${cls}`
    verdict0606.textContent = text
  }
}

w0Slider0606?.addEventListener('input', renderLab0606)
w1Slider0606?.addEventListener('input', renderLab0606)
w2Slider0606?.addEventListener('input', renderLab0606)

resetBtn0606?.addEventListener('click', () => {
  if (w0Slider0606) w0Slider0606.value = String(W0_DEFAULT_0606)
  if (w1Slider0606) w1Slider0606.value = String(W1_DEFAULT_0606)
  if (w2Slider0606) w2Slider0606.value = String(W2_DEFAULT_0606)
  renderLab0606()
})

highlightButtons0606.forEach(btn => {
  btn.addEventListener('click', () => {
    const label = btn.dataset.row
    highlightedRow0606 = highlightedRow0606 === label ? null : label
    renderLab0606()
  })
})

renderBoundaryStatic5_0606()
renderBoundaryStatic6_0606()
renderLab0606()
