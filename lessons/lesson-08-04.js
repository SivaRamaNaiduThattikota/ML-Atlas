// Module 08 Concept 04 -- Random forests, decorrelating trees.
// Drives Section 20's lab, "The Decorrelation Lab." This lab deliberately
// runs on a DIFFERENT dataset than the lesson's own worked-example prose:
// the prose (Sections 05-13) uses Module 06 Concept 12's 8-row/3-feature
// CFPB relief table, because that set has a genuine miss for a forest to
// improve on. This lab reuses Concept 01's own 10-row/2-feature set
// (POINTS_0801, copied here as POINTS_0804 since scripts don't share state
// across lesson pages) because that set stays perfectly separable on x1
// alone -- which is exactly the point the lab demonstrates: when every
// tree can see x1, x1 wins every single split, and B trees look like B
// near-copies of one tree. Forcing some trees onto x2 only is what breaks
// that copy-paste effect. Two different datasets, two different jobs --
// not an oversight.

const POINTS_0804 = [
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

// The one row this lab predicts on, every redraw: an unseen point sitting
// between B (x1=2) and J (x1=2.5), with a low, uninformative x2.
const QUERY_0804 = { x1: 2.3, x2: 1.2 }

function gini_0804(labels) {
  const n = labels.length
  if (n === 0) return 0
  const p1 = labels.filter(y => y === 1).length / n
  const p0 = 1 - p1
  return 1 - (p0 * p0 + p1 * p1)
}

// Ties break toward relief (1) -- documented in the lab's own caption,
// not a silent convention. Only matters on tiny bootstrap draws where a
// leaf's own sample happens to land exactly 50/50.
function majorityLabel_0804(labels, fallback = 1) {
  const n = labels.length
  if (n === 0) return fallback
  const ones = labels.filter(y => y === 1).length
  const zeros = n - ones
  if (ones === zeros) return fallback
  return ones > zeros ? 1 : 0
}

// N draws from an N-row sample, with replacement -- Math.random() each
// time, live, not the seeded PRNG the lesson text's worked example uses.
function bootstrapSample_0804(rows) {
  const n = rows.length
  const out = []
  for (let i = 0; i < n; i++) out.push(rows[Math.floor(Math.random() * n)])
  return out
}

// Same exhaustive-midpoint-threshold scan as Concept 01's scanFeature_0801,
// parameterized on a bootstrap sample instead of the full dataset.
function scanFeatureOnSample_0804(sample, feature) {
  const sorted = [...sample].sort((a, b) => a[feature] - b[feature])
  const vals = sorted.map(p => p[feature])
  const rootGini = gini_0804(sample.map(p => p.y))
  const out = []
  for (let i = 0; i < sorted.length - 1; i++) {
    if (vals[i] === vals[i + 1]) continue
    const t = (vals[i] + vals[i + 1]) / 2
    const left = sample.filter(p => p[feature] <= t)
    const right = sample.filter(p => p[feature] > t)
    const leftY = left.map(p => p.y), rightY = right.map(p => p.y)
    const nL = left.length, nR = right.length, n = nL + nR
    const giniAfter = (nL / n) * gini_0804(leftY) + (nR / n) * gini_0804(rightY)
    out.push({ t, leftY, rightY, giniAfter, gain: rootGini - giniAfter })
  }
  return out
}

// Fits one stump on one bootstrap sample. mtry===2 lets the stump see
// both features (bagging only); mtry===1 hides one of them by coin flip
// before the scan ever runs (the random-forest restriction). Falls back
// to a constant-label leaf if no valid threshold exists on whatever
// feature(s) survived the restriction.
function fitStump_0804(sample, mtry) {
  const available = mtry === 1 ? [Math.random() < 0.5 ? 'x1' : 'x2'] : ['x1', 'x2']
  let best = null
  available.forEach(feature => {
    scanFeatureOnSample_0804(sample, feature).forEach(cand => {
      if (!best || cand.gain > best.gain) best = { ...cand, feature }
    })
  })
  if (!best) {
    return { isLeaf: true, leafLabel: majorityLabel_0804(sample.map(p => p.y)), feature: available[0] }
  }
  return {
    isLeaf: false,
    feature: best.feature,
    t: best.t,
    leftLabel: majorityLabel_0804(best.leftY),
    rightLabel: majorityLabel_0804(best.rightY),
    gain: best.gain,
  }
}

function predictStump_0804(stump, point) {
  if (stump.isLeaf) return stump.leafLabel
  return point[stump.feature] <= stump.t ? stump.leftLabel : stump.rightLabel
}

let currentMtry_0804 = 2
let currentForest_0804 = []

const mtryGroup_0804 = document.querySelector('#wgMtryGroup_0804')
const mtryButtons_0804 = mtryGroup_0804 ? [...mtryGroup_0804.querySelectorAll('[data-mtry]')] : []
const treesSlider_0804 = document.querySelector('#wgTreesSlider_0804')
const treesOut_0804 = document.querySelector('#wgTreesOut_0804')
const drawBtn_0804 = document.querySelector('#wgDrawForest_0804')
const resetBtn_0804 = document.querySelector('#wgReset_0804')
const forestGrid_0804 = document.querySelector('#wgForestGrid_0804')
const readout_0804 = document.querySelector('#wgReadout_0804')
const voteBars_0804 = document.querySelector('#wgVoteBars_0804')
const verdict_0804 = document.querySelector('#wgVerdict_0804')

function syncMtryButtons_0804() {
  mtryButtons_0804.forEach(btn => btn.classList.toggle('active', Number(btn.dataset.mtry) === currentMtry_0804))
}

function renderForest_0804() {
  const B = currentForest_0804.length
  if (!B) return

  if (forestGrid_0804) {
    forestGrid_0804.innerHTML = currentForest_0804.map((tree, i) => {
      const onX1 = !tree.stump.isLeaf && tree.stump.feature === 'x1'
      const rule = tree.stump.isLeaf
        ? 'no valid split -- constant leaf'
        : `${tree.stump.feature} &le; ${tree.stump.t.toFixed(2)}`
      const voteLabel = tree.vote === 1 ? 'relief' : 'no relief'
      return `<div class="diagram-node${onX1 ? ' active' : ''}"><b>Tree ${i + 1}</b><small>${rule}<br>vote: ${voteLabel}</small></div>`
    }).join('')
  }

  const onX1 = currentForest_0804.filter(t => !t.stump.isLeaf && t.stump.feature === 'x1').length
  const onX2 = currentForest_0804.filter(t => !t.stump.isLeaf && t.stump.feature === 'x2').length
  const diversityPct = Math.round((onX2 / B) * 100)
  const reliefVotes = currentForest_0804.filter(t => t.vote === 1).length
  const noReliefVotes = B - reliefVotes

  if (readout_0804) {
    readout_0804.innerHTML = `
      <div><span>TREES ON prior_contact_attempts</span><b>${onX1} of ${B}</b></div>
      <div><span>TREES FORCED ONTO satisfaction_score</span><b>${onX2} of ${B}</b></div>
      <div><span>DIVERSITY</span><b>${diversityPct}%</b></div>
      <div><span>UNSEEN ROW</span><b>x1=${QUERY_0804.x1}, x2=${QUERY_0804.x2}</b></div>
    `
  }

  if (voteBars_0804) {
    const reliefPct = (reliefVotes / B) * 100
    const noReliefPct = (noReliefVotes / B) * 100
    voteBars_0804.innerHTML = `
      <div class="prob-row"><span>Relief</span><div class="bar-track"><div class="bar-fill" style="width:${reliefPct}%"></div></div><b>${reliefVotes}/${B}</b></div>
      <div class="prob-row"><span>No relief</span><div class="bar-track"><div class="bar-fill" style="width:${noReliefPct}%"></div></div><b>${noReliefVotes}/${B}</b></div>
    `
  }

  if (verdict_0804) {
    let cls, msg
    if (diversityPct === 0) {
      cls = 'verdict-red'
      msg = `Every one of these ${B} trees split on prior_contact_attempts -- with both features available, x1's own perfect separation wins every single scan, so this forest acts like ${B} near-copies of one tree.`
    } else if (diversityPct < 50) {
      cls = 'verdict-amber'
      msg = `${onX2} of ${B} trees got forced onto satisfaction_score -- some decorrelation, but prior_contact_attempts still controls most of this forest's votes.`
    } else {
      cls = 'verdict-green'
      msg = `${onX2} of ${B} trees got forced onto satisfaction_score -- restricting each split's own feature choice, not just resampling rows, is what decorrelates this forest.`
    }
    verdict_0804.className = 'gate-verdict ' + cls
    verdict_0804.textContent = msg
  }
}

function drawForest_0804() {
  if (!treesSlider_0804) return
  const B = Number(treesSlider_0804.value)
  if (treesOut_0804) treesOut_0804.textContent = String(B)
  currentForest_0804 = []
  for (let i = 0; i < B; i++) {
    const sample = bootstrapSample_0804(POINTS_0804)
    const stump = fitStump_0804(sample, currentMtry_0804)
    const vote = predictStump_0804(stump, QUERY_0804)
    currentForest_0804.push({ stump, vote })
  }
  renderForest_0804()
}

mtryButtons_0804.forEach(btn => btn.addEventListener('click', () => {
  currentMtry_0804 = Number(btn.dataset.mtry)
  syncMtryButtons_0804()
  drawForest_0804()
}))
treesSlider_0804?.addEventListener('input', drawForest_0804)
drawBtn_0804?.addEventListener('click', drawForest_0804)
resetBtn_0804?.addEventListener('click', () => {
  currentMtry_0804 = 2
  if (treesSlider_0804) treesSlider_0804.value = '5'
  syncMtryButtons_0804()
  drawForest_0804()
})

// -- Hash-sync boilerplate, same convention as the rest of this module. --
const advancedLesson0804 = document.querySelector('#advanced-lesson')
function syncAdvancedTarget0804() { if (advancedLesson0804) advancedLesson0804.open = location.hash === '#advanced-lesson' || /^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash) }
addEventListener('hashchange', syncAdvancedTarget0804)
syncAdvancedTarget0804()

syncMtryButtons_0804()
drawForest_0804()
