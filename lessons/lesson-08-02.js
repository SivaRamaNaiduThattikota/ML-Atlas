// Module 08 Concept 02 -- Overfitting in trees: depth and pruning.
// The Depth Explorer lab renders a real, Node-verified 60-row synthetic
// depth sweep (seed 10007, 20% label noise, script:
// nb_scratch/m08c02_depth_sweep_verify.js) -- not fabricated data. The
// train/val error and leaf count below are copied straight from that
// script's own printed output; nothing here is computed live in-browser
// because building 8 real trees from scratch on every slider drag isn't
// worth the cost when the sweep itself is already fixed and reproducible.

// Coordinate mapping (documented so the numbers stay auditable):
// x positions are 8 evenly-spaced stops, one per depth 1-8, 22px apart,
// starting at x=30 -- the same axis Concept 01's own diagrams use.
// y positions use y = 190 - (errorValue / 0.5) * 160, i.e. error 0 maps
// to the baseline (y=190) and error 0.5 maps to the plot's own top (y=30),
// the same 0.5-ceiling convention this repo already uses for Gini's own
// 0-0.5 range on a binary node.
const DEPTH_DATA_0802 = {
  1: { train: 0.125, val: 0.25, leaves: 2, tx: 30,  ty: 150, vx: 30,  vy: 110 },
  2: { train: 0.125, val: 0.25, leaves: 3, tx: 52,  ty: 150, vx: 52,  vy: 110 },
  3: { train: 0.075, val: 0.20, leaves: 5, tx: 74,  ty: 166, vx: 74,  vy: 126 },
  4: { train: 0.050, val: 0.25, leaves: 7, tx: 96,  ty: 174, vx: 96,  vy: 110 },
  5: { train: 0.025, val: 0.40, leaves: 8, tx: 118, ty: 182, vx: 118, vy: 62  },
  6: { train: 0.025, val: 0.40, leaves: 8, tx: 140, ty: 182, vx: 140, vy: 62  },
  7: { train: 0.025, val: 0.40, leaves: 8, tx: 162, ty: 182, vx: 162, vy: 62  },
  8: { train: 0.025, val: 0.40, leaves: 8, tx: 184, ty: 182, vx: 184, vy: 62  },
}

// Best depth is computed from the table itself, not hardcoded -- the
// lowest validation error, first occurrence if there's ever a tie.
const BEST_DEPTH_0802 = Object.keys(DEPTH_DATA_0802)
  .map(Number)
  .reduce((best, d) => (DEPTH_DATA_0802[d].val < DEPTH_DATA_0802[best].val ? d : best), 1)

const advancedLesson0802 = document.querySelector('#advanced-lesson')
function syncAdvancedTarget0802() { if (advancedLesson0802) advancedLesson0802.open = location.hash === '#advanced-lesson' || /^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash) }
addEventListener('hashchange', syncAdvancedTarget0802)
syncAdvancedTarget0802()

// -- Interactive lab (s18): The Depth Explorer. --
const slider_0802 = document.querySelector('#wgDepth_0802')
const sliderOut_0802 = document.querySelector('#wgDepthOut_0802')
const trainMarker_0802 = document.querySelector('#trainMarker_0802')
const valMarker_0802 = document.querySelector('#valMarker_0802')
const jumpBtn_0802 = document.querySelector('#wgJumpBest_0802')
const resetBtn_0802 = document.querySelector('#wgReset_0802')
const readout_0802 = document.querySelector('#wgReadout_0802')
const verdict_0802 = document.querySelector('#wgVerdict_0802')

const DEFAULT_DEPTH_0802 = 3

function pct_0802(v) { return (v * 100).toFixed(1) + '%' }

function renderLab_0802() {
  if (!slider_0802) return
  const depth = Number(slider_0802.value)
  const d = DEPTH_DATA_0802[depth]
  if (!d) return
  if (sliderOut_0802) sliderOut_0802.textContent = String(depth)

  if (trainMarker_0802) {
    trainMarker_0802.setAttribute('cx', String(d.tx))
    trainMarker_0802.setAttribute('cy', String(d.ty))
  }
  if (valMarker_0802) {
    valMarker_0802.setAttribute('cx', String(d.vx))
    valMarker_0802.setAttribute('cy', String(d.vy))
  }

  const gap = d.val - d.train

  if (readout_0802) {
    readout_0802.innerHTML = `
      <div><span>DEPTH</span><b>max_depth = ${depth}</b></div>
      <div><span>TRAIN ERROR</span><b>${pct_0802(d.train)}</b></div>
      <div><span>VAL ERROR</span><b>${pct_0802(d.val)}</b></div>
      <div><span>GAP (val - train)</span><b>${pct_0802(gap)}</b></div>
      <div><span>LEAF COUNT</span><b>${d.leaves}</b></div>
    `
  }

  if (verdict_0802) {
    let cls, msg
    if (depth < BEST_DEPTH_0802) {
      cls = 'verdict-amber'
      msg = `max_depth=${depth}: underfitting -- validation error (${pct_0802(d.val)}) is still falling as depth increases toward ${BEST_DEPTH_0802}, so the tree hasn't been given enough splits to learn the real pattern yet.`
    } else if (depth === BEST_DEPTH_0802) {
      cls = 'verdict-green'
      msg = `max_depth=${depth}: the sweet spot -- validation error bottoms out here at ${pct_0802(d.val)}, the lowest point on the whole sweep.`
    } else {
      cls = 'verdict-red'
      msg = `max_depth=${depth}: overfitting -- training error keeps falling (${pct_0802(d.train)}) but validation error has climbed to ${pct_0802(d.val)}, and leaf count has plateaued at ${d.leaves} because there's nothing left to split.`
    }
    verdict_0802.className = 'gate-verdict ' + cls
    verdict_0802.textContent = msg
  }
}

function setDepth_0802(depth) {
  if (slider_0802) slider_0802.value = String(depth)
  renderLab_0802()
}

slider_0802?.addEventListener('input', renderLab_0802)
jumpBtn_0802?.addEventListener('click', () => setDepth_0802(BEST_DEPTH_0802))
resetBtn_0802?.addEventListener('click', () => setDepth_0802(DEFAULT_DEPTH_0802))

if (slider_0802) setDepth_0802(DEFAULT_DEPTH_0802)
