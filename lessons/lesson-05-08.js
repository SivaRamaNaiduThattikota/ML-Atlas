// Section 14's lab: The Staleness Gap. One threshold stays FROZEN at the
// value CFPB deployed 18 months ago (Concept 05's t*≈0.0909); a second
// threshold recomputes LIVE from today's real false-positive cost slider.
// Both are scored against this concept's own fixed 10-row set, under
// TODAY's costs, so the gap between them is the price of leaving a
// decision unrevisited while the real world it was built against drifted.

const rows0508 = [
  { s: 0.90, y: 1 },
  { s: 0.70, y: 1 },
  { s: 0.30, y: 1 },
  { s: 0.50, y: 0 },
  { s: 0.20, y: 0 },
  { s: 0.18, y: 0 },
  { s: 0.15, y: 0 },
  { s: 0.12, y: 0 },
  { s: 0.05, y: 0 },
  { s: 0.02, y: 0 },
]

const FROZEN_T_0508 = 1 / 11 // Concept 05's deployed threshold, ≈0.0909
const C_FN_0508 = 500 // held fixed by design -- this lab isolates C(FP) drift

function confusionAndCost0508(rows, threshold, cfn, cfp) {
  let tp = 0, fp = 0, fn = 0, tn = 0
  rows.forEach(row => {
    const pred = row.s >= threshold ? 1 : 0
    if (pred === 1 && row.y === 1) tp++
    else if (pred === 1 && row.y === 0) fp++
    else if (pred === 0 && row.y === 1) fn++
    else tn++
  })
  return { tp, fp, fn, tn, cost: fn * cfn + fp * cfp }
}

const cfpSlider0508 = document.querySelector('#wgCfp_0508')
const cfpOut0508 = document.querySelector('#wgCfpOut_0508')
const presetButtons0508 = [...document.querySelectorAll('#s14 .lab-actions [data-preset]')]
const barsWrap0508 = document.querySelector('#wgStaleBars_0508')
const readout0508 = document.querySelector('#wgStaleReadout_0508')
const verdict0508 = document.querySelector('#wgStaleVerdict_0508')

function render0508() {
  const cfp = Number(cfpSlider0508.value)
  if (cfpOut0508) cfpOut0508.textContent = `$${cfp}`

  const tLive = cfp / (cfp + C_FN_0508)
  const frozen = confusionAndCost0508(rows0508, FROZEN_T_0508, C_FN_0508, cfp)
  const live = confusionAndCost0508(rows0508, tLive, C_FN_0508, cfp)
  const gap = frozen.cost - live.cost
  const ratio = live.cost > 0 ? frozen.cost / live.cost : Infinity

  if (readout0508) {
    readout0508.innerHTML = `
      <div><span>FROZEN THRESHOLD (18 MONTHS OLD)</span><b>${FROZEN_T_0508.toFixed(4)}</b></div>
      <div><span>FROZEN THRESHOLD'S COST TODAY</span><b>$${frozen.cost.toLocaleString()}</b></div>
      <div><span>LIVE OPTIMAL THRESHOLD (RECOMPUTED)</span><b>${tLive.toFixed(4)}</b></div>
      <div><span>LIVE THRESHOLD'S COST TODAY</span><b>$${live.cost.toLocaleString()}</b></div>
    `
  }

  if (barsWrap0508) {
    const maxLen = 260
    const scale = Math.max(frozen.cost, live.cost, 1)
    barsWrap0508.innerHTML = `
      <svg class="vector-plane" viewBox="0 0 460 90" role="img" aria-label="Frozen threshold cost versus live threshold cost, today">
        <text x="10" y="14" font-size="8" font-family="IBM Plex Mono, monospace" font-weight="700">FROZEN THRESHOLD -- COST TODAY</text>
        <rect x="10" y="20" width="${(frozen.cost / scale * maxLen).toFixed(1)}" height="18" fill="var(--muted)" fill-opacity="0.5"/>
        <text x="${16 + frozen.cost / scale * maxLen}" y="33" font-size="8" font-family="IBM Plex Mono, monospace">$${frozen.cost.toLocaleString()}</text>
        <text x="10" y="56" font-size="8" font-family="IBM Plex Mono, monospace" font-weight="700">LIVE THRESHOLD -- COST TODAY</text>
        <rect x="10" y="62" width="${(live.cost / scale * maxLen).toFixed(1)}" height="18" fill="var(--orange)"/>
        <text x="${16 + live.cost / scale * maxLen}" y="75" font-size="8" font-family="IBM Plex Mono, monospace">$${live.cost.toLocaleString()}</text>
      </svg>
    `
  }

  if (verdict0508) {
    let label, text
    if (gap === 0) {
      label = 'NO DRIFT YET'
      text = `No drift yet -- the frozen threshold and today's optimal threshold are identical, so staying stale costs nothing.`
    } else if (gap <= 400) {
      label = 'A MODEST GAP HAS OPENED'
      text = `A real but modest gap has opened -- the frozen threshold is starting to cost more than it needs to.`
    } else {
      label = 'STALENESS IS NOW EXPENSIVE'
      text = `The frozen threshold is now costing $${gap.toLocaleString()} more than necessary -- a ${ratio.toFixed(1)}× multiple, purely from a decision nobody revisited after costs changed.`
    }
    verdict0508.innerHTML = `<b>${label}</b> ${text}`
  }
}

presetButtons0508.forEach(btn => {
  btn.addEventListener('click', () => {
    cfpSlider0508.value = btn.dataset.preset
    render0508()
  })
})

cfpSlider0508?.addEventListener('input', render0508)

render0508()
