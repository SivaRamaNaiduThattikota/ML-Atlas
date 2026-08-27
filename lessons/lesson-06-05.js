// Section 14's lab: The Odds Ladder. Unlike Concept 04's Sigmoid Reader,
// which dragged one marker along one curve, this lab drives ONE z value
// across THREE linked rails at once -- log-odds (linear), odds (log
// scale), and probability (linear). Because odds uses a log scale, its
// pixel position for a given z is identical to the log-odds rail's own
// position -- only the tick labels differ. The probability rail is the
// odd one out: its pixel position is sigma(z), so the same z-step covers
// a different amount of pixel width depending on where you start.
//
// Two nudge buttons apply this model's own two fitted weights (w1=1.5,
// w2=-0.5) directly to z, and report the resulting odds ratio -- always
// exp(w1) or exp(w2) exactly, regardless of starting point.
//
// Also drives two static figures that never move: b04's five-row preview
// (Rows A-E) and s07's two-row nudge preview (Row C to Row F).

// Concept 04's own weights, reused verbatim -- not refit here.
const W0_0605 = -4
const W1_0605 = 1.5
const W2_0605 = -0.5

// Concept 04's own five rows (Section 10), plus this concept's own Row F.
// z, sigma(z), odds and log-odds are all recomputed live at render time --
// this table only stores which (x1, x2, y) pair each preset reloads.
const ROWS_0605 = [
  { label: 'A', x1: 1, x2: 4, y: 0 },
  { label: 'B', x1: 2, x2: 3, y: 0 },
  { label: 'C', x1: 3, x2: 3, y: 1 },
  { label: 'D', x1: 4, x2: 2, y: 1 },
  { label: 'E', x1: 6, x2: 1, y: 1 },
  { label: 'F', x1: 4, x2: 3, y: 1 },
]

function zOf0605(x1, x2) {
  return W0_0605 + W1_0605 * x1 + W2_0605 * x2
}

// Overflow-safe sigmoid, matching Concept 04's own Section 12 form. The
// lab's z-domain is capped at [-8, 8] so overflow isn't actually reachable
// here, but the same safe form is kept for consistency with the cited code.
function sigma0605(z) {
  if (z >= 0) return 1 / (1 + Math.exp(-z))
  const ez = Math.exp(z)
  return ez / (1 + ez)
}

function oddsOf0605(p) {
  return p / (1 - p)
}

// Shared rail geometry -- all three rails span the same pixel width, so a
// fixed x-displacement means the same thing on the log-odds and odds
// rails (both driven by the identical linear-in-z mapping below).
const X0_0605 = 96, X1_0605 = 430
const Z_MIN_0605 = -8, Z_MAX_0605 = 8

function pxXLinZ0605(z) {
  return X0_0605 + (z - Z_MIN_0605) / (Z_MAX_0605 - Z_MIN_0605) * (X1_0605 - X0_0605)
}
function pxXProb0605(p) {
  return X0_0605 + p * (X1_0605 - X0_0605)
}

// Rail y-positions, top to bottom: log-odds, odds, probability.
const RAIL_Y_0605 = { logodds: 46, odds: 118, prob: 190 }

function railAxis0605(y, label, sub) {
  return `
    <line x1="${X0_0605}" y1="${y}" x2="${X1_0605}" y2="${y}" stroke="currentColor" stroke-width="1.2"/>
    <text x="${X0_0605 - 8}" y="${y - 14}" text-anchor="start" font-weight="700" font-size="8">${label}</text>
    <text x="${X0_0605 - 8}" y="${y - 4}" text-anchor="start" font-size="6.5" fill="var(--muted)">${sub}</text>
  `
}

// Log-odds rail ticks: z itself, linearly spaced.
function logOddsTicks0605(y) {
  return [-8, -4, 0, 4, 8].map(z => {
    const x = pxXLinZ0605(z).toFixed(1)
    return `
      <line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" stroke="currentColor" stroke-width="1"/>
      <text x="${x}" y="${y + 16}" text-anchor="middle" font-size="7">${z}</text>
    `
  }).join('')
}

// Odds rail ticks: same x-positions as log-odds (log scale => linear in z),
// labeled with the actual odds value, e^z, instead of z.
function oddsTicks0605(y) {
  return [-8, -4, 0, 4, 8].map(z => {
    const x = pxXLinZ0605(z).toFixed(1)
    const odds = Math.exp(z)
    const label = odds < 1 ? odds.toFixed(4) : odds < 100 ? odds.toFixed(2) : Math.round(odds).toString()
    return `
      <line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" stroke="currentColor" stroke-width="1"/>
      <text x="${x}" y="${y + 16}" text-anchor="middle" font-size="7">${label}</text>
    `
  }).join('')
}

// Probability rail ticks: linear 0 to 1.
function probTicks0605(y) {
  return [0, 0.25, 0.5, 0.75, 1].map(p => {
    const x = pxXProb0605(p).toFixed(1)
    return `
      <line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" stroke="currentColor" stroke-width="1"/>
      <text x="${x}" y="${y + 16}" text-anchor="middle" font-size="7">${p}</text>
    `
  }).join('')
}

function ladderFrame0605() {
  return `
    ${railAxis0605(RAIL_Y_0605.logodds, 'LOG-ODDS', 'linear scale')}
    ${logOddsTicks0605(RAIL_Y_0605.logodds)}
    ${railAxis0605(RAIL_Y_0605.odds, 'ODDS', 'log scale')}
    ${oddsTicks0605(RAIL_Y_0605.odds)}
    ${railAxis0605(RAIL_Y_0605.prob, 'PROBABILITY', 'linear scale')}
    ${probTicks0605(RAIL_Y_0605.prob)}
  `
}

// A single row's marker + connector across all three rails, for a given z.
function markerSet0605(z, color, label) {
  const p = sigma0605(z)
  const xLog = pxXLinZ0605(z).toFixed(1)
  const xProb = pxXProb0605(p).toFixed(1)
  const yLog = RAIL_Y_0605.logodds
  const yOdds = RAIL_Y_0605.odds
  const yProb = RAIL_Y_0605.prob
  const tag = label ? `<text x="${xLog}" y="${yLog - 12}" text-anchor="middle" fill="${color}" font-weight="700" font-size="8">${label}</text>` : ''
  return `
    <line x1="${xLog}" y1="${yLog}" x2="${xLog}" y2="${yOdds}" stroke="${color}" stroke-width="1" stroke-dasharray="2,2" opacity="0.7"/>
    <line x1="${xLog}" y1="${yOdds}" x2="${xProb}" y2="${yProb}" stroke="${color}" stroke-width="1" stroke-dasharray="2,2" opacity="0.7"/>
    <circle cx="${xLog}" cy="${yLog}" r="4.5" fill="${color}"/>
    <circle cx="${xLog}" cy="${yOdds}" r="4.5" fill="${color}"/>
    <circle cx="${xProb}" cy="${yProb}" r="4.5" fill="${color}"/>
    ${tag}
  `
}

// -- Static figure #1 (beginner, b04): all five worked rows, A-E. --
function renderOddsLadderStatic0605() {
  const wrap = document.querySelector('#wgOddsLadderStatic_0605')
  if (!wrap) return
  const colors = ['var(--orange)', 'var(--teal)', 'var(--ink)', 'var(--teal)', 'var(--orange)']
  const markers = ROWS_0605.slice(0, 5).map((row, i) => {
    const z = zOf0605(row.x1, row.x2)
    return markerSet0605(z, colors[i % colors.length], row.label)
  }).join('')
  wrap.innerHTML = `
    <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-labelledby="c0605-b04-svg-title c0605-b04-svg-desc">
      <title id="c0605-b04-svg-title">Three linked rails -- log-odds, odds, and probability -- with the five worked-example rows plotted on each</title>
      <desc id="c0605-b04-svg-desc">Three horizontal number lines stacked vertically. Rows A through E sit at the same horizontal position on the top two rails, log-odds and odds, but spread unevenly on the bottom probability rail, bunching up near the ends and spreading apart near the middle.</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        ${ladderFrame0605()}
        ${markers}
      </g>
    </svg>
  `
}

// -- Static figure #2 (advanced, s07): Row C to Row F only, one nudge. --
function renderOddsNudgePreview0605() {
  const wrap = document.querySelector('#wgOddsNudgePreview_0605')
  if (!wrap) return
  const rowC = ROWS_0605.find(r => r.label === 'C')
  const rowF = ROWS_0605.find(r => r.label === 'F')
  const zC = zOf0605(rowC.x1, rowC.x2)
  const zF = zOf0605(rowF.x1, rowF.x2)
  const markers = markerSet0605(zC, 'var(--teal)', 'C') + markerSet0605(zF, 'var(--orange)', 'F')
  wrap.innerHTML = `
    <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-labelledby="c0605-s07-svg-title c0605-s07-svg-desc">
      <title id="c0605-s07-svg-title">Row C and Row F plotted on the three linked rails, showing one fixed log-odds step</title>
      <desc id="c0605-s07-svg-desc">Row C and Row F sit close together on the log-odds and odds rails, a fixed gap of one and a half units. On the probability rail the same two rows sit much further apart, because that region of the sigmoid is the steepest.</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        ${ladderFrame0605()}
        ${markers}
      </g>
    </svg>
  `
}

// -- Interactive lab (s14): one z slider drives all three rails live. --
const zSlider0605 = document.querySelector('#wgZ_0605')
const zOut0605 = document.querySelector('#wgZOut_0605')
const nudgeX1Btn0605 = document.querySelector('#wgNudgeX1_0605')
const nudgeX2Btn0605 = document.querySelector('#wgNudgeX2_0605')
const presetButtons0605 = [...document.querySelectorAll('#wgPresetGroup_0605 [data-preset]')]
const plotWrap0605 = document.querySelector('#wgOddsLadderPlot_0605')
const readout0605 = document.querySelector('#wgReadout_0605')
const verdict0605 = document.querySelector('#wgVerdict_0605')

let activePreset0605 = null
let nudgeBanner0605 = null

function clearPreset0605() {
  activePreset0605 = null
}

function currentZ0605() {
  return zSlider0605 ? Number(zSlider0605.value) : 0
}

function renderLadder0605(z) {
  if (!plotWrap0605) return
  const p = sigma0605(z)
  const marker = markerSet0605(z, 'var(--ink)', null)
  plotWrap0605.innerHTML = `
    <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-label="Live plot of the current z on the log-odds, odds, and probability rails">
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        ${ladderFrame0605()}
        ${marker}
      </g>
    </svg>
  `
  return p
}

function renderLab0605() {
  if (!zSlider0605) return
  const z = currentZ0605()
  if (zOut0605) zOut0605.textContent = z.toFixed(1)
  const p = renderLadder0605(z)
  const odds = Math.exp(z) // == oddsOf0605(p), exact by the log-odds identity

  const row = activePreset0605 ? ROWS_0605.find(r => r.label === activePreset0605) : null

  if (readout0605) {
    readout0605.innerHTML = `
      <div><span>Z (LOG-ODDS)</span><b>${z.toFixed(1)}</b></div>
      <div><span>ODDS = e^z</span><b>${odds < 1000 ? odds.toFixed(4) : odds.toFixed(1)}</b></div>
      <div><span>P = SIGMA(Z)</span><b>${p.toFixed(4)}</b></div>
      ${row ? `<div><span>ROW ${row.label} -- ACTUAL y</span><b>${row.y}</b></div>` : ''}
      ${nudgeBanner0605 ? `<div class="wide"><span>LAST NUDGE</span><b>${nudgeBanner0605}</b></div>` : ''}
    `
  }

  if (verdict0605) {
    let cls = 'verdict-amber'
    let text
    if (Math.abs(z) < 0.05) {
      cls = 'verdict-amber'
      text = 'z near zero -- odds near 1, the "50:50" point. Not a decision boundary; that term belongs to Concept 06.'
    } else if (row) {
      text = `Row ${row.label}: log-odds=${z.toFixed(1)} matches z exactly, odds=${odds.toFixed(4)}, p=${p.toFixed(4)}.`
      cls = p >= 0.5 ? 'verdict-green' : 'verdict-amber'
    } else {
      text = `log-odds=${z.toFixed(1)} equals z exactly; odds=${odds.toFixed(4)}; p=${p.toFixed(4)}.`
      cls = p >= 0.5 ? 'verdict-green' : 'verdict-amber'
    }
    verdict0605.className = `gate-verdict ${cls}`
    verdict0605.textContent = text
  }
}

presetButtons0605.forEach(btn => {
  btn.addEventListener('click', () => {
    const label = btn.dataset.preset
    const row = ROWS_0605.find(r => r.label === label)
    if (!row || !zSlider0605) return
    activePreset0605 = label
    nudgeBanner0605 = null
    zSlider0605.value = String(zOf0605(row.x1, row.x2))
    renderLab0605()
  })
})

zSlider0605?.addEventListener('input', () => {
  clearPreset0605()
  nudgeBanner0605 = null
  renderLab0605()
})

function nudge0605(delta, label) {
  if (!zSlider0605) return
  const zBefore = currentZ0605()
  const oddsBefore = Math.exp(zBefore)
  let zAfter = zBefore + delta
  zAfter = Math.max(Z_MIN_0605, Math.min(Z_MAX_0605, zAfter))
  const oddsAfter = Math.exp(zAfter)
  const ratio = oddsAfter / oddsBefore
  clearPreset0605()
  zSlider0605.value = String(zAfter)
  nudgeBanner0605 = `${label}: odds ${oddsBefore.toFixed(4)} → ${oddsAfter.toFixed(4)}, ratio = ${ratio.toFixed(4)} = exp(${delta}) exactly`
  renderLab0605()
}

nudgeX1Btn0605?.addEventListener('click', () => nudge0605(W1_0605, '+1 prior_contact_attempts (x1)'))
nudgeX2Btn0605?.addEventListener('click', () => nudge0605(W2_0605, '+1 satisfaction_score (x2)'))

renderOddsLadderStatic0605()
renderOddsNudgePreview0605()
renderLab0605()
