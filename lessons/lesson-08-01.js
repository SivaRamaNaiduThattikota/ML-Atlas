// Module 08 Concept 01 -- Decision trees, splits and impurity measures.
// Reuses the exact 10-row CFPB-style dataset from Concept 06 (Module 06) and
// Concept 01 (Module 07): x1 = prior_contact_attempts, x2 = satisfaction_score,
// y = 1 (relief) / 0 (no relief). Every Gini/entropy number in this lesson is
// produced by the functions below, live -- nothing is a typed-in fraction.

const POINTS_0801 = [
  { id: 'A', x1: 1,   x2: 4,   y: 0 },
  { id: 'B', x1: 2,   x2: 3,   y: 0 },
  { id: 'C', x1: 3,   x2: 3,   y: 1 },
  { id: 'D', x1: 4,   x2: 2,   y: 1 },
  { id: 'E', x1: 6,   x2: 1,   y: 1 },
  { id: 'G', x1: 0.5, x2: 2.2, y: 0 },
  { id: 'H', x1: 1.5, x2: 1,   y: 0 },
  { id: 'I', x1: 5,   x2: 4,   y: 1 },
  { id: 'J', x1: 2.5, x2: 4.5, y: 1 },
  { id: 'K', x1: 5.5, x2: 2.5, y: 1 },
]

function gini_0801(labels) {
  const n = labels.length
  if (n === 0) return 0
  const p1 = labels.filter(y => y === 1).length / n
  const p0 = 1 - p1
  return 1 - (p0 * p0 + p1 * p1)
}

function entropy_0801(labels) {
  const n = labels.length
  if (n === 0) return 0
  const p1 = labels.filter(y => y === 1).length / n
  const p0 = 1 - p1
  let h = 0
  if (p0 > 0) h -= p0 * Math.log2(p0)
  if (p1 > 0) h -= p1 * Math.log2(p1)
  return h
}

const ROOT_LABELS_0801 = POINTS_0801.map(p => p.y)
const ROOT_GINI_0801 = gini_0801(ROOT_LABELS_0801)
const ROOT_ENTROPY_0801 = entropy_0801(ROOT_LABELS_0801)

// Exhaustive scan over every midpoint threshold for one feature -- the same
// "greedy exhaustive search over all available features and all possible
// thresholds (i.e. midpoints between sorted, distinct feature values)" that
// scikit-learn's own tree documentation describes for splitter='best'.
function scanFeature_0801(feature) {
  const sorted = [...POINTS_0801].sort((a, b) => a[feature] - b[feature])
  const vals = sorted.map(p => p[feature])
  const out = []
  for (let i = 0; i < sorted.length - 1; i++) {
    if (vals[i] === vals[i + 1]) continue
    const t = (vals[i] + vals[i + 1]) / 2
    const left = POINTS_0801.filter(p => p[feature] <= t)
    const right = POINTS_0801.filter(p => p[feature] > t)
    const leftY = left.map(p => p.y), rightY = right.map(p => p.y)
    const nL = left.length, nR = right.length, n = nL + nR
    const giniL = gini_0801(leftY), giniR = gini_0801(rightY)
    const entL = entropy_0801(leftY), entR = entropy_0801(rightY)
    const giniAfter = (nL / n) * giniL + (nR / n) * giniR
    const entAfter = (nL / n) * entL + (nR / n) * entR
    out.push({
      t, nL, nR,
      leftY1: leftY.filter(y => y === 1).length, rightY1: rightY.filter(y => y === 1).length,
      giniL, giniR, giniAfter, giniGain: ROOT_GINI_0801 - giniAfter,
      entL, entR, entAfter, infoGain: ROOT_ENTROPY_0801 - entAfter,
    })
  }
  return out
}

function bestThreshold_0801(feature) {
  const scan = scanFeature_0801(feature)
  return scan.reduce((a, b) => (b.giniGain > a.giniGain ? b : a))
}

const FEATURE_META_0801 = {
  x1: { name: 'prior_contact_attempts', axisMin: 0, axisMax: 6.5, defaultT: 3 },
  x2: { name: 'satisfaction_score', axisMin: 0, axisMax: 5, defaultT: 3 },
}

const advancedLesson0801 = document.querySelector('#advanced-lesson')
function syncAdvancedTarget0801() { if (advancedLesson0801) advancedLesson0801.open = location.hash === '#advanced-lesson' || /^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash) }
addEventListener('hashchange', syncAdvancedTarget0801)
syncAdvancedTarget0801()

// -- Shared track renderer: 10 points along one feature's axis, plus a --
// -- vertical threshold line at t. Used both for the static beginner --
// -- figure and for the live lab, from the same code path. --
function renderTrack_0801(trackEl, feature, t) {
  if (!trackEl) return
  const meta = FEATURE_META_0801[feature]
  const pct = v => ((v - meta.axisMin) / (meta.axisMax - meta.axisMin)) * 100
  const tops = [22, 50, 78, 36, 64, 22, 50, 78, 36, 64]
  const dots = POINTS_0801.map((p, i) => {
    const cls = p.y === 1 ? 'gate-green' : 'gate-red'
    return `<div class="gate-dot ${cls}" style="left:${pct(p[feature]).toFixed(1)}%;top:${tops[i]}%"><b>${p.id} &middot; ${p[feature]}</b></div>`
  }).join('')
  const markLeft = pct(t).toFixed(1)
  trackEl.innerHTML = `
    <div class="gate-baseline-mark" style="left:${markLeft}%"><i>t = ${t.toFixed(2)}</i></div>
    ${dots}
  `
}

// -- Static figure for the beginner path (b05): the winning split, fixed. --
function renderStaticSplit_0801() {
  const track = document.querySelector('#wgSplitStatic_0801')
  if (!track) return
  renderTrack_0801(track, 'x1', 2.25)
}

// -- Static figure for s12: the same 10 rows, but along x2, at x2's own --
// -- best threshold (4.25) -- a losing candidate shown at its own best. --
function renderStaticSplitX2_0801() {
  const track = document.querySelector('#wgSplitStaticX2_0801')
  if (!track) return
  renderTrack_0801(track, 'x2', 4.25)
}

// -- Interactive lab (s18): The Split Finder. --
const trackLab_0801 = document.querySelector('#wgSplitTrack_0801')
const slider_0801 = document.querySelector('#wgThreshold_0801')
const sliderOut_0801 = document.querySelector('#wgThresholdOut_0801')
const featButtons_0801 = [...document.querySelectorAll('#s18 [data-feature]')]
const jumpBtn_0801 = document.querySelector('#wgJumpBest_0801')
const resetBtn_0801 = document.querySelector('#wgReset_0801')
const readout_0801 = document.querySelector('#wgReadout_0801')
const verdict_0801 = document.querySelector('#wgVerdict_0801')

let currentFeature_0801 = 'x1'

function syncFeatureButtons_0801() {
  featButtons_0801.forEach(btn => btn.classList.toggle('active', btn.dataset.feature === currentFeature_0801))
}

function renderLab_0801() {
  if (!slider_0801) return
  const meta = FEATURE_META_0801[currentFeature_0801]
  const t = Number(slider_0801.value)
  if (sliderOut_0801) sliderOut_0801.textContent = t.toFixed(2)

  renderTrack_0801(trackLab_0801, currentFeature_0801, t)

  const left = POINTS_0801.filter(p => p[currentFeature_0801] <= t).map(p => p.y)
  const right = POINTS_0801.filter(p => p[currentFeature_0801] > t).map(p => p.y)
  const giniL = gini_0801(left), giniR = gini_0801(right)
  const entL = entropy_0801(left), entR = entropy_0801(right)
  const n = left.length + right.length
  const giniAfter = n ? (left.length / n) * giniL + (right.length / n) * giniR : ROOT_GINI_0801
  const entAfter = n ? (left.length / n) * entL + (right.length / n) * entR : ROOT_ENTROPY_0801
  const giniGain = ROOT_GINI_0801 - giniAfter
  const infoGain = ROOT_ENTROPY_0801 - entAfter

  if (readout_0801) {
    readout_0801.innerHTML = `
      <div><span>FEATURE</span><b>${meta.name}</b></div>
      <div><span>THRESHOLD t</span><b>${t.toFixed(2)}</b></div>
      <div><span>LEFT (&le; t)</span><b>${left.length} rows, ${left.filter(y => y === 1).length} relief &middot; Gini ${giniL.toFixed(4)}</b></div>
      <div><span>RIGHT (&gt; t)</span><b>${right.length} rows, ${right.filter(y => y === 1).length} relief &middot; Gini ${giniR.toFixed(4)}</b></div>
      <div><span>WEIGHTED GINI AFTER</span><b>${giniAfter.toFixed(4)}</b></div>
      <div><span>GINI GAIN (root 0.48)</span><b>${giniGain.toFixed(4)}</b></div>
      <div><span>INFO GAIN (root ${ROOT_ENTROPY_0801.toFixed(4)})</span><b>${infoGain.toFixed(4)}</b></div>
    `
  }

  if (verdict_0801) {
    let cls, msg
    if (giniGain >= 0.4) {
      cls = 'verdict-green'
      msg = `t=${t.toFixed(2)} on ${meta.name}: both children are pure (Gini 0 on each side) -- this is the maximum possible gain for this root, ${giniGain.toFixed(4)} out of 0.48.`
    } else if (giniGain >= 0.15) {
      cls = 'verdict-amber'
      msg = `t=${t.toFixed(2)} on ${meta.name}: a real reduction in impurity, but neither side is pure yet -- a real tree would keep splitting each child further.`
    } else {
      cls = 'verdict-red'
      msg = `t=${t.toFixed(2)} on ${meta.name}: barely better than not splitting at all -- gain of only ${giniGain.toFixed(4)}, most of the root's own 0.48 impurity is still there.`
    }
    verdict_0801.className = 'gate-verdict ' + cls
    verdict_0801.textContent = msg
  }
}

function setFeature_0801(feature) {
  currentFeature_0801 = feature
  const meta = FEATURE_META_0801[feature]
  if (slider_0801) {
    slider_0801.min = String(meta.axisMin)
    slider_0801.max = String(meta.axisMax)
    slider_0801.step = '0.05'
    slider_0801.value = String(meta.defaultT)
  }
  syncFeatureButtons_0801()
  renderLab_0801()
}

featButtons_0801.forEach(btn => btn.addEventListener('click', () => setFeature_0801(btn.dataset.feature)))
slider_0801?.addEventListener('input', renderLab_0801)
jumpBtn_0801?.addEventListener('click', () => {
  const best = bestThreshold_0801(currentFeature_0801)
  if (slider_0801) slider_0801.value = String(best.t)
  renderLab_0801()
})
resetBtn_0801?.addEventListener('click', () => setFeature_0801('x1'))

renderStaticSplit_0801()
renderStaticSplitX2_0801()
if (slider_0801) setFeature_0801('x1')
