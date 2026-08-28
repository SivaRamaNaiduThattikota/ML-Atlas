// Module 08 Concept 05 -- Feature importance from trees.
// Drives Section 20's lab, "The Shuffle Lab." Runs on the exact same
// 8-row/3-feature CFPB relief table and 3-tree feature-restricted forest
// the lesson's own worked example (Sections 05-17) uses -- rebuilt here
// in JS rather than imported, since scripts don't share state across
// lesson pages. Draws live Math.random() shuffles (not the seeded
// mulberry32 stream the prose's own 20-repeat average used), so what you
// see here is a genuinely separate, unseeded confirmation of the same
// story, not a replay of the prose's exact numbers.

const ROWS_0805 = [
  { id: 'A', x1: 1, x2: 10, x3: 1, y: 0 },
  { id: 'B', x1: 2, x2: 20, x3: 1, y: 0 },
  { id: 'C', x1: 3, x2: 15, x3: 0, y: 1 },
  { id: 'D', x1: 1, x2: 40, x3: 1, y: 0 },
  { id: 'E', x1: 4, x2: 25, x3: 0, y: 1 },
  { id: 'F', x1: 2, x2: 60, x3: 0, y: 0 },
  { id: 'G', x1: 5, x2: 30, x3: 1, y: 1 },
  { id: 'H', x1: 3, x2: 50, x3: 0, y: 0 },
]

const BOOTS_0805 = {
  1: ['D', 'F', 'B', 'H', 'H', 'G', 'G', 'D'],
  2: ['H', 'D', 'D', 'B', 'E', 'E', 'B', 'A'],
  3: ['E', 'D', 'D', 'B', 'A', 'C', 'C', 'H'],
}
const RESTRICTED_0805 = { 1: ['x2', 'x3'], 2: ['x2', 'x3'], 3: ['x1', 'x3'] }
const BY_ID_0805 = Object.fromEntries(ROWS_0805.map(r => [r.id, r]))

function gini_0805(sample) {
  const n = sample.length
  if (n === 0) return 0
  const p1 = sample.filter(r => r.y === 1).length / n
  const p0 = 1 - p1
  return 1 - (p0 * p0 + p1 * p1)
}

function bestSplit_0805(sample, features) {
  const before = gini_0805(sample)
  let best = null
  features.forEach(f => {
    const vals = [...new Set(sample.map(r => r[f]))].sort((a, b) => a - b)
    for (let i = 0; i < vals.length - 1; i++) {
      const t = (vals[i] + vals[i + 1]) / 2
      const left = sample.filter(r => r[f] <= t)
      const right = sample.filter(r => r[f] > t)
      if (!left.length || !right.length) continue
      const after = (left.length / sample.length) * gini_0805(left) + (right.length / sample.length) * gini_0805(right)
      const gain = before - after
      if (!best || gain > best.gain + 1e-12) best = { f, t, gain }
    }
  })
  return best
}

// The 3 stumps, fit once at load time -- same bootstrap draws and feature
// restriction the lesson prose uses. Fixed for the life of the page; the
// lab shuffles rows, not the forest itself.
const STUMPS_0805 = {}
for (const t of [1, 2, 3]) {
  const sample = BOOTS_0805[t].map(id => BY_ID_0805[id])
  STUMPS_0805[t] = { ...bestSplit_0805(sample, RESTRICTED_0805[t]), sample }
}

function predictStump_0805(t, row) {
  const s = STUMPS_0805[t]
  const left = s.sample.filter(r => r[s.f] <= s.t)
  const right = s.sample.filter(r => r[s.f] > s.t)
  const leftMaj = left.filter(r => r.y === 1).length > left.length / 2 ? 1 : 0
  const rightMaj = right.filter(r => r.y === 1).length > right.length / 2 ? 1 : 0
  return row[s.f] <= s.t ? leftMaj : rightMaj
}

function forestPredict_0805(row) {
  const votes = [1, 2, 3].map(t => predictStump_0805(t, row))
  return votes.reduce((a, b) => a + b, 0) >= 2 ? 1 : 0
}

function accuracy_0805(rows) {
  return rows.filter(r => forestPredict_0805(r) === r.y).length / rows.length
}

const BASE_ACC_0805 = accuracy_0805(ROWS_0805)

function shuffledRows_0805(feature) {
  const vals = ROWS_0805.map(r => r[feature])
  for (let i = vals.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[vals[i], vals[j]] = [vals[j], vals[i]]
  }
  return ROWS_0805.map((r, i) => ({ ...r, [feature]: vals[i] }))
}

let currentFeature_0805 = 'x1'
const dropHistory_0805 = { x1: [], x2: [], x3: [] }

const featureGroup_0805 = document.querySelector('#wgFeatureGroup_0805')
const featureButtons_0805 = featureGroup_0805 ? [...featureGroup_0805.querySelectorAll('[data-feature]')] : []
const drawBtn_0805 = document.querySelector('#wgDrawShuffle_0805')
const resetBtn_0805 = document.querySelector('#wgResetShuffle_0805')
const readout_0805 = document.querySelector('#wgReadout_0805')
const bars_0805 = document.querySelector('#wgImportanceBars_0805')
const verdict_0805 = document.querySelector('#wgVerdict_0805')

const TARGET_0805 = { x1: 0.1875, x2: 0.1625, x3: 0.0875 }

function syncFeatureButtons_0805() {
  featureButtons_0805.forEach(btn => btn.classList.toggle('active', btn.dataset.feature === currentFeature_0805))
}

function mean_0805(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

function render_0805() {
  const history = dropHistory_0805[currentFeature_0805]
  const runningMean = mean_0805(history)
  const target = TARGET_0805[currentFeature_0805]

  if (readout_0805) {
    readout_0805.innerHTML = `
      <div><span>FEATURE</span><b>${currentFeature_0805}</b></div>
      <div><span>SHUFFLES DRAWN</span><b>${history.length}</b></div>
      <div><span>RUNNING MEAN ACCURACY DROP</span><b>${runningMean.toFixed(4)}</b></div>
      <div><span>20-SHUFFLE SCRIPT TARGET</span><b>${target.toFixed(4)}</b></div>
    `
  }

  if (bars_0805) {
    const maxVal = Math.max(...Object.values(TARGET_0805), runningMean, 0.001)
    bars_0805.innerHTML = ['x1', 'x2', 'x3'].map(f => {
      const val = f === currentFeature_0805 ? runningMean : mean_0805(dropHistory_0805[f])
      const pct = (val / maxVal) * 100
      const n = dropHistory_0805[f].length
      return `<div class="prob-row"><span>${f}${f === currentFeature_0805 ? ' (live)' : ''}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><b>${val.toFixed(4)} (n=${n})</b></div>`
    }).join('')
  }

  if (verdict_0805) {
    let cls, msg
    if (history.length === 0) {
      cls = 'verdict-amber'
      msg = `No shuffles drawn yet for ${currentFeature_0805}. Draw one to see the accuracy drop on a single random shuffle -- expect it to swing around before it settles.`
    } else if (history.length < 8) {
      cls = 'verdict-amber'
      msg = `${history.length} shuffle(s) drawn -- running mean ${runningMean.toFixed(4)}, script's own 20-shuffle target ${target.toFixed(4)}. Still early; keep drawing.`
    } else {
      cls = 'verdict-green'
      msg = `${history.length} shuffles drawn -- running mean ${runningMean.toFixed(4)} is settling toward the script's own 20-shuffle target of ${target.toFixed(4)} for ${currentFeature_0805}.`
    }
    verdict_0805.className = 'gate-verdict ' + cls
    verdict_0805.textContent = msg
  }
}

function drawShuffle_0805() {
  const permRows = shuffledRows_0805(currentFeature_0805)
  const permAcc = accuracy_0805(permRows)
  dropHistory_0805[currentFeature_0805].push(BASE_ACC_0805 - permAcc)
  render_0805()
}

featureButtons_0805.forEach(btn => btn.addEventListener('click', () => {
  currentFeature_0805 = btn.dataset.feature
  syncFeatureButtons_0805()
  render_0805()
}))
drawBtn_0805?.addEventListener('click', drawShuffle_0805)
resetBtn_0805?.addEventListener('click', () => {
  dropHistory_0805[currentFeature_0805] = []
  render_0805()
})

// -- Hash-sync boilerplate, same convention as the rest of this module. --
const advancedLesson0805 = document.querySelector('#advanced-lesson')
function syncAdvancedTarget0805() { if (advancedLesson0805) advancedLesson0805.open = location.hash === '#advanced-lesson' || /^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash) }
addEventListener('hashchange', syncAdvancedTarget0805)
syncAdvancedTarget0805()

syncFeatureButtons_0805()
render_0805()
