// Section 14's lab: The Metric Fork. Same six-point dataset, same fixed
// query, two swappable distance functions (Euclidean, Manhattan) and five
// values of k -- watching the exact same vote disagree, tie, then agree
// as k rises, with nothing about the data ever changing.

const POINTS_0702 = [
  { id: 'A', x1: 3, x2: 3, y: 0 },
  { id: 'B', x1: 5, x2: 0, y: 1 },
  { id: 'C', x1: 4, x2: 4, y: 1 },
  { id: 'D', x1: 0, x2: 6, y: 0 },
  { id: 'E', x1: 6, x2: 2, y: 0 },
  { id: 'F', x1: 2, x2: 6, y: 1 },
]

const QX1_0702 = 0
const QX2_0702 = 0
const K_DEFAULT_0702 = 3
const METRIC_DEFAULT_0702 = 'euclidean'

function euclidDist_0702(p) { return Math.sqrt((p.x1 - QX1_0702) ** 2 + (p.x2 - QX2_0702) ** 2) }
function manhattanDist_0702(p) { return Math.abs(p.x1 - QX1_0702) + Math.abs(p.x2 - QX2_0702) }

function nearestK_0702(k, metric) {
  const distFn = metric === 'manhattan' ? manhattanDist_0702 : euclidDist_0702
  const withDist = POINTS_0702.map((p, i) => ({ ...p, dist: distFn(p), idx: i }))
  withDist.sort((a, b) => a.dist - b.dist || a.idx - b.idx)
  const neighbors = withDist.slice(0, k)
  const votes1 = neighbors.filter(n => n.y === 1).length
  const votes0 = neighbors.length - votes1
  const predicted = votes1 > votes0 ? 'escalate' : votes1 < votes0 ? 'resolve' : 'tie'
  return { ranked: withDist, neighbors, votes1, votes0, predicted }
}

const advancedLesson0702 = document.querySelector('#advanced-lesson')
function syncAdvancedTarget0702() { if (advancedLesson0702) advancedLesson0702.open = location.hash === '#advanced-lesson' || /^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash) }
addEventListener('hashchange', syncAdvancedTarget0702)
syncAdvancedTarget0702()

// -- Plot geometry, renamed from Concept 01's own pxX1_0701/pxX2_0701/axisFrame0701. --
const X0_0702 = 70, X1PX_0702 = 430, Y0_0702 = 40, Y1_0702 = 280
const X1_MIN_0702 = 0, X1_MAX_0702 = 7, X2_MIN_0702 = 0, X2_MAX_0702 = 7

function pxX1_0702(x1) { return X0_0702 + (x1 - X1_MIN_0702) / (X1_MAX_0702 - X1_MIN_0702) * (X1PX_0702 - X0_0702) }
function pxX2_0702(x2) { return Y1_0702 - (x2 - X2_MIN_0702) / (X2_MAX_0702 - X2_MIN_0702) * (Y1_0702 - Y0_0702) }

function axisFrame0702() {
  const xTicks = [0, 1, 2, 3, 4, 5, 6, 7].map(x1 => {
    const px = pxX1_0702(x1).toFixed(1)
    return `<line x1="${px}" y1="${Y1_0702}" x2="${px}" y2="${Y1_0702 + 5}" stroke="currentColor" stroke-width="1"/><text x="${px}" y="${Y1_0702 + 16}" text-anchor="middle" font-size="7">${x1}</text>`
  }).join('')
  const yTicks = [0, 1, 2, 3, 4, 5, 6, 7].map(x2 => {
    const py = pxX2_0702(x2).toFixed(1)
    return `<line x1="${X0_0702 - 5}" y1="${py}" x2="${X0_0702}" y2="${py}" stroke="currentColor" stroke-width="1"/><text x="${X0_0702 - 9}" y="${(Number(py) + 2.5).toFixed(1)}" text-anchor="end" font-size="7">${x2}</text>`
  }).join('')
  return `
    <line x1="${X0_0702}" y1="${Y0_0702}" x2="${X0_0702}" y2="${Y1_0702}" stroke="currentColor" stroke-width="1.2"/>
    <line x1="${X0_0702}" y1="${Y1_0702}" x2="${X1PX_0702}" y2="${Y1_0702}" stroke="currentColor" stroke-width="1.2"/>
    ${xTicks}${yTicks}
    <text x="${(X0_0702 + X1PX_0702) / 2}" y="${Y1_0702 + 30}" text-anchor="middle" font-size="7.5" font-weight="700">x1 = delay_days</text>
    <text x="18" y="${(Y0_0702 + Y1_0702) / 2}" text-anchor="middle" font-size="7.5" font-weight="700" transform="rotate(-90 18 ${(Y0_0702 + Y1_0702) / 2})">x2 = severity_score</text>
  `
}

function metricPlotSvg_0702({ k, metric, titleId, titleText, descText }) {
  const result = nearestK_0702(k, metric)
  const neighborIds = new Set(result.neighbors.map(n => n.id))
  const points = POINTS_0702.map(p => {
    const isNeighbor = neighborIds.has(p.id)
    const cx = pxX1_0702(p.x1).toFixed(1), cy = pxX2_0702(p.x2).toFixed(1)
    const fill = p.y === 1 ? 'var(--teal)' : 'var(--orange)'
    let rankLabel = ''
    const rankIdx = result.neighbors.findIndex(n => n.id === p.id)
    if (rankIdx >= 0) {
      rankLabel = `<text x="${cx}" y="${(Number(cy) - 10).toFixed(1)}" text-anchor="middle" font-size="6.5" font-weight="700">#${rankIdx + 1} d=${result.neighbors[rankIdx].dist.toFixed(3)}</text>`
    }
    const connector = isNeighbor ? `<line x1="${pxX1_0702(QX1_0702).toFixed(1)}" y1="${pxX2_0702(QX2_0702).toFixed(1)}" x2="${cx}" y2="${cy}" stroke="var(--ink)" stroke-width="1.2" stroke-dasharray="3,3"/>` : ''
    return `
      ${connector}
      <circle cx="${cx}" cy="${cy}" r="5" fill="${fill}" opacity="${isNeighbor ? 1 : 0.35}" stroke="var(--ink)" stroke-width="${isNeighbor ? 1.2 : 0}"/>
      <text x="${cx}" y="${(Number(cy) + 14).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="700">${p.id}</text>
      ${rankLabel}
    `
  }).join('')
  const qx = pxX1_0702(QX1_0702).toFixed(1), qy = pxX2_0702(QX2_0702).toFixed(1)
  return `
    <svg class="vector-plane" viewBox="0 0 460 320" role="img" aria-labelledby="${titleId}-title ${titleId}-desc">
      <title id="${titleId}-title">${titleText}</title>
      <desc id="${titleId}-desc">${descText}</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        ${axisFrame0702()}
        ${points}
        <circle cx="${qx}" cy="${qy}" r="7" fill="none" stroke="var(--ink)" stroke-width="2"/>
        <line x1="${(Number(qx) - 10).toFixed(1)}" y1="${qy}" x2="${(Number(qx) + 10).toFixed(1)}" y2="${qy}" stroke="var(--ink)" stroke-width="1"/>
        <line x1="${qx}" y1="${(Number(qy) - 10).toFixed(1)}" x2="${qx}" y2="${(Number(qy) + 10).toFixed(1)}" stroke="var(--ink)" stroke-width="1"/>
        <text x="${qx}" y="${(Number(qy) - 12).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="700">Q</text>
      </g>
    </svg>
  `
}

// -- Interactive lab (s14): The Metric Fork. --
const metricButtons_0702 = [...document.querySelectorAll('#s14 [data-metric]')]
const kButtons_0702 = [...document.querySelectorAll('#s14 [data-k]')]
const resetBtn_0702 = document.querySelector('#wgReset_0702')
const plotWrap_0702 = document.querySelector('#wgMetricPlot_0702')
const readout_0702 = document.querySelector('#wgReadout_0702')
const verdict_0702 = document.querySelector('#wgVerdict_0702')

let currentK_0702 = K_DEFAULT_0702
let currentMetric_0702 = METRIC_DEFAULT_0702

function syncButtons_0702() {
  metricButtons_0702.forEach(btn => btn.classList.toggle('active', btn.dataset.metric === currentMetric_0702))
  kButtons_0702.forEach(btn => btn.classList.toggle('active', Number(btn.dataset.k) === currentK_0702))
}

function verdictForK_0702(k) {
  const eu = nearestK_0702(k, 'euclidean')
  const man = nearestK_0702(k, 'manhattan')
  if (eu.predicted !== man.predicted) {
    return { cls: 'verdict-red', msg: `k=${k}: disagreement -- Euclidean predicts ${eu.predicted.toUpperCase()}, Manhattan predicts ${man.predicted.toUpperCase()}. Same six points, same query, only the ruler changed.` }
  }
  if (eu.predicted === 'tie' || man.predicted === 'tie') {
    return { cls: 'verdict-amber', msg: `k=${k}: tied vote, no disagreement -- both metrics land on ${eu.votes1}-${eu.votes0} (or the reverse split), a coin flip either way rather than a clean call.` }
  }
  return { cls: 'verdict-green', msg: `k=${k}: both metrics agree -- ${eu.predicted.toUpperCase()} either way. Try k=1 or k=3 to see them split.` }
}

function renderLab_0702() {
  const result = nearestK_0702(currentK_0702, currentMetric_0702)

  if (plotWrap_0702) {
    plotWrap_0702.innerHTML = metricPlotSvg_0702({
      k: currentK_0702, metric: currentMetric_0702,
      titleId: 'c0702-lab-svg',
      titleText: 'Live neighbor plot, updated as the metric and k controls change',
      descText: 'A scatter plot of six labeled points and a fixed query at the origin, redrawn as the active distance metric and k change which points are highlighted as nearest.',
    })
  }

  if (readout_0702) {
    const neighborList = result.neighbors.map((n, i) => `<div><span>NEAREST #${i + 1}</span><b>${n.id} (d=${n.dist.toFixed(3)})</b></div>`).join('')
    readout_0702.innerHTML = `
      <div><span>QUERY</span><b>(0.0, 0.0)</b></div>
      <div><span>METRIC</span><b>${currentMetric_0702 === 'manhattan' ? 'Manhattan' : 'Euclidean'}</b></div>
      <div><span>k</span><b>${currentK_0702}</b></div>
      <div><span>VOTE</span><b>${result.votes1} escalate, ${result.votes0} resolve</b></div>
      <div class="wide"><span>PREDICTION</span><b>${result.predicted === 'tie' ? 'Tie' : result.predicted === 'escalate' ? 'Escalate' : 'Resolve'}</b></div>
      ${neighborList}
    `
  }

  if (verdict_0702) {
    const v = verdictForK_0702(currentK_0702)
    verdict_0702.className = 'gate-verdict ' + v.cls
    verdict_0702.textContent = v.msg
  }
}

metricButtons_0702.forEach(btn => btn.addEventListener('click', () => {
  currentMetric_0702 = btn.dataset.metric
  syncButtons_0702()
  renderLab_0702()
}))
kButtons_0702.forEach(btn => btn.addEventListener('click', () => {
  currentK_0702 = Number(btn.dataset.k)
  syncButtons_0702()
  renderLab_0702()
}))
resetBtn_0702?.addEventListener('click', () => {
  currentK_0702 = K_DEFAULT_0702
  currentMetric_0702 = METRIC_DEFAULT_0702
  syncButtons_0702()
  renderLab_0702()
})

// -- Static cosine-magnitude-invariance figure (not part of the lab above). --
function cosineFigureSvg_0702() {
  const X0 = 70, X1PX = 430, Y0 = 20, Y1 = 260
  const MIN = -1, MAX = 7
  const px = v => X0 + (v - MIN) / (MAX - MIN) * (X1PX - X0)
  const py = v => Y1 - (v - MIN) / (MAX - MIN) * (Y1 - Y0)
  const origin = [px(0).toFixed(1), py(0).toFixed(1)]
  const P = [2, 1], Pp = [6, 3]
  const pPx = [px(P[0]).toFixed(1), py(P[1]).toFixed(1)]
  const ppPx = [px(Pp[0]).toFixed(1), py(Pp[1]).toFixed(1)]
  return `
    <svg class="vector-plane" viewBox="0 0 460 280" role="img" aria-labelledby="c0702-cosine-title c0702-cosine-desc">
      <title id="c0702-cosine-title">Two vectors on the same ray from the origin</title>
      <desc id="c0702-cosine-desc">P at (2,1) and P-prime at (6,3), three times as long as P but pointing in the exact same direction from the origin. A dashed arc marks the zero angle between them.</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        <line x1="${origin[0]}" y1="${py(MAX).toFixed(1)}" x2="${origin[0]}" y2="${py(MIN).toFixed(1)}" stroke="currentColor" stroke-width="1" opacity="0.4"/>
        <line x1="${px(MIN).toFixed(1)}" y1="${origin[1]}" x2="${px(MAX).toFixed(1)}" y2="${origin[1]}" stroke="currentColor" stroke-width="1" opacity="0.4"/>
        <line x1="${origin[0]}" y1="${origin[1]}" x2="${ppPx[0]}" y2="${ppPx[1]}" stroke="var(--orange)" stroke-width="2"/>
        <line x1="${origin[0]}" y1="${origin[1]}" x2="${pPx[0]}" y2="${pPx[1]}" stroke="var(--teal)" stroke-width="2.5"/>
        <circle cx="${pPx[0]}" cy="${pPx[1]}" r="4.5" fill="var(--teal)"/>
        <circle cx="${ppPx[0]}" cy="${ppPx[1]}" r="4.5" fill="var(--orange)"/>
        <text x="${(Number(pPx[0]) + 8).toFixed(1)}" y="${(Number(pPx[1]) - 6).toFixed(1)}" font-size="8" font-weight="700">P (2, 1)</text>
        <text x="${(Number(ppPx[0]) + 8).toFixed(1)}" y="${(Number(ppPx[1]) - 6).toFixed(1)}" font-size="8" font-weight="700">P' (6, 3) = 3×P</text>
        <text x="${origin[0]}" y="${(Number(origin[1]) + 14).toFixed(1)}" font-size="7">Q origin</text>
      </g>
    </svg>
  `
}
function renderCosineFigure_0702() {
  const wrap = document.querySelector('#wgCosineFigure_0702')
  if (!wrap) return
  wrap.innerHTML = cosineFigureSvg_0702()
}

syncButtons_0702()
renderLab_0702()
renderCosineFigure_0702()
