// Section 14's lab: The Sigmoid Reader. Unlike Concept 03's Shrinking
// Constraint, which dragged a lambda dial over a fixed pair of
// constraint-region shapes, this lab drags TWO things at once over a
// live sigma(k*z) curve -- a z slider that slides a marker point along
// the x-axis, and a steepness dial k that reshapes the curve itself by
// scaling z before squashing. Five preset buttons jump straight to the
// worked example's own five rows (A-E), reloading their z, y and loss.
//
// Also drives two small static figures that never move: b04's fixed
// sigmoid curve with the five worked-example points labeled, and s07's
// three-overlaid-curves preview at k=0.5/1/2.

// The worked example's own weights (Section 10) -- given, already fitted,
// not derived from these five rows.
const W0_0604 = -4
const W1_0604 = 1.5
const W2_0604 = -0.5

// The five worked-example rows, with their verified z, sigma(z) and BCE
// loss (Section 10). Stored here for the lab's preset buttons and the
// static beginner-core figure -- the sigmoid value itself is still
// computed live from z at render time, never read off this table.
const ROWS_0604 = [
  { label: 'A', x1: 1, x2: 4, z: -4.5, y: 0, loss: 0.0110 },
  { label: 'B', x1: 2, x2: 3, z: -2.5, y: 0, loss: 0.0789 },
  { label: 'C', x1: 3, x2: 3, z: -1.0, y: 1, loss: 1.3133 },
  { label: 'D', x1: 4, x2: 2, z: 1.0, y: 1, loss: 0.3133 },
  { label: 'E', x1: 6, x2: 1, z: 4.5, y: 1, loss: 0.0110 },
]

// The sigmoid itself. The z-domain in this lab is capped at [-8, 8], so
// e^-z never gets large enough to risk overflow here -- Section 12's
// sign-split form is the production-safe version, shown as code there.
function sigma0604(z) {
  return 1 / (1 + Math.exp(-z))
}

// Shared plot geometry -- z on the x-axis (-8 to 8), sigma(k*z) on the
// y-axis (0 to 1). p=0 sits at the bottom, p=1 at the top.
const Z_MIN_0604 = -8, Z_MAX_0604 = 8
const P_MIN_0604 = 0, P_MAX_0604 = 1
const PLOT_X0_0604 = 50, PLOT_X1_0604 = 430
const PLOT_Y0_0604 = 190, PLOT_Y1_0604 = 20

function pxX0604(z) {
  return PLOT_X0_0604 + (z - Z_MIN_0604) / (Z_MAX_0604 - Z_MIN_0604) * (PLOT_X1_0604 - PLOT_X0_0604)
}
function pxY0604(p) {
  return PLOT_Y0_0604 + (p - P_MIN_0604) / (P_MAX_0604 - P_MIN_0604) * (PLOT_Y1_0604 - PLOT_Y0_0604)
}

// The curve path for sigma(k*z), swept across the full z domain.
function curvePath0604(k, samples) {
  const n = samples || 80
  let d = ''
  for (let i = 0; i <= n; i++) {
    const z = Z_MIN_0604 + (i / n) * (Z_MAX_0604 - Z_MIN_0604)
    const p = sigma0604(k * z)
    d += (i === 0 ? 'M' : 'L') + pxX0604(z).toFixed(1) + ' ' + pxY0604(p).toFixed(1) + ' '
  }
  return d.trim()
}

function axesSvg0604() {
  const ticksZ = [-8, -4, 0, 4, 8]
  const ticksP = [0, 0.5, 1]
  const tickZ = ticksZ.map(v => `
    <line x1="${pxX0604(v).toFixed(1)}" y1="${PLOT_Y0_0604}" x2="${pxX0604(v).toFixed(1)}" y2="${PLOT_Y0_0604 + 5}" stroke="currentColor" stroke-width="1"/>
    <text x="${pxX0604(v).toFixed(1)}" y="${PLOT_Y0_0604 + 16}" text-anchor="middle">${v}</text>
  `).join('')
  const tickP = ticksP.map(v => `
    <line x1="${PLOT_X0_0604 - 5}" y1="${pxY0604(v).toFixed(1)}" x2="${PLOT_X0_0604}" y2="${pxY0604(v).toFixed(1)}" stroke="currentColor" stroke-width="1"/>
    <text x="${PLOT_X0_0604 - 9}" y="${(pxY0604(v) + 3).toFixed(1)}" text-anchor="end">${v}</text>
  `).join('')
  return `
    <line x1="${PLOT_X0_0604}" y1="${PLOT_Y0_0604}" x2="${PLOT_X1_0604}" y2="${PLOT_Y0_0604}" stroke="currentColor" stroke-width="1"/>
    <line x1="${PLOT_X0_0604}" y1="${PLOT_Y1_0604 - 10}" x2="${PLOT_X0_0604}" y2="${PLOT_Y0_0604}" stroke="currentColor" stroke-width="1"/>
    ${tickZ}${tickP}
    <text x="${(PLOT_X0_0604 + PLOT_X1_0604) / 2}" y="${PLOT_Y0_0604 + 32}" text-anchor="middle" font-size="7.5">Z (RAW/LINEAR SCORE)</text>
    <text x="18" y="${(PLOT_Y0_0604 + PLOT_Y1_0604) / 2}" text-anchor="middle" font-size="7.5" transform="rotate(-90 18 ${(PLOT_Y0_0604 + PLOT_Y1_0604) / 2})">SIGMA(K·Z)</text>
  `
}

// Dashed reference lines at the sigmoid's own midpoint -- p=0.5 and z=0.
// Captioned only as the midpoint, never as a decision boundary (Concept 06).
function midpointLines0604() {
  const y = pxY0604(0.5).toFixed(1)
  const x = pxX0604(0).toFixed(1)
  return `
    <line x1="${PLOT_X0_0604}" y1="${y}" x2="${PLOT_X1_0604}" y2="${y}" stroke="var(--muted)" stroke-width="0.8" stroke-dasharray="3,3"/>
    <line x1="${x}" y1="${PLOT_Y1_0604 - 10}" x2="${x}" y2="${PLOT_Y0_0604}" stroke="var(--muted)" stroke-width="0.8" stroke-dasharray="3,3"/>
    <text x="${PLOT_X1_0604 - 4}" y="${(Number(y) - 4).toFixed(1)}" text-anchor="end" font-size="7">sigmoid's own midpoint</text>
  `
}

// -- Static figure #1 (beginner, b04): fixed k=1 curve, five labeled points. --
function renderSigmoidStatic0604() {
  const wrap = document.querySelector('#wgSigmoidStatic_0604')
  if (!wrap) return
  const curve = curvePath0604(1)
  const points = ROWS_0604.map(row => {
    const p = sigma0604(row.z)
    const x = pxX0604(row.z).toFixed(1)
    const y = pxY0604(p).toFixed(1)
    return `
      <circle cx="${x}" cy="${y}" r="4" fill="var(--orange)"/>
      <text x="${x}" y="${(Number(y) - 8).toFixed(1)}" text-anchor="middle" fill="var(--orange)" font-weight="700">${row.label}</text>
    `
  }).join('')
  wrap.innerHTML = `
    <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-labelledby="c0604-b04-svg-title c0604-b04-svg-desc">
      <title id="c0604-b04-svg-title">The sigmoid curve, with the five worked-example rows plotted at their own z values</title>
      <desc id="c0604-b04-svg-desc">An S-shaped curve rises from near zero on the left to near one on the right, crossing 0.5 at z equals zero. Point A sits far left near the bottom, point E sits far right near the top, and point C sits closest to the middle of the curve.</desc>
      <g font-family="IBM Plex Mono, monospace" font-size="8" fill="currentColor">
        ${axesSvg0604()}
        ${midpointLines0604()}
        <path d="${curve}" fill="none" stroke="var(--teal)" stroke-width="2"/>
        ${points}
      </g>
    </svg>
  `
}

// -- Static figure #2 (advanced, s07): three overlaid curves, k=0.5/1/2. --
function renderSteepnessPreview0604() {
  const wrap = document.querySelector('#wgSteepnessPreview_0604')
  if (!wrap) return
  const curveFlat = curvePath0604(0.5)
  const curveMid = curvePath0604(1)
  const curveSteep = curvePath0604(2)
  wrap.innerHTML = `
    <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-labelledby="c0604-s07-svg-title c0604-s07-svg-desc">
      <title id="c0604-s07-svg-title">Three sigmoid curves at steepness values 0.5, 1, and 2</title>
      <desc id="c0604-s07-svg-desc">Three S-shaped curves, all crossing 0.5 at z equals zero. The flattest curve rises gradually across the whole range. The middle curve is the canonical sigmoid. The steepest curve rises sharply near z equals zero, approaching a step function.</desc>
      <g font-family="IBM Plex Mono, monospace" font-size="8" fill="currentColor">
        ${axesSvg0604()}
        ${midpointLines0604()}
        <path d="${curveFlat}" fill="none" stroke="var(--muted)" stroke-width="1.6"/>
        <path d="${curveMid}" fill="none" stroke="var(--teal)" stroke-width="2"/>
        <path d="${curveSteep}" fill="none" stroke="var(--orange)" stroke-width="1.6"/>
        <text x="${(PLOT_X1_0604 - 10)}" y="${(pxY0604(sigma0604(0.5 * 6)) - 6).toFixed(1)}" text-anchor="end" fill="var(--muted)" font-weight="700">k=0.5</text>
        <text x="${(PLOT_X1_0604 - 10)}" y="${(pxY0604(sigma0604(1 * 5)) - 6).toFixed(1)}" text-anchor="end" fill="var(--teal)" font-weight="700">k=1</text>
        <text x="${(PLOT_X1_0604 - 10)}" y="${(pxY0604(sigma0604(2 * 2)) - 6).toFixed(1)}" text-anchor="end" fill="var(--orange)" font-weight="700">k=2</text>
      </g>
    </svg>
  `
}

// -- Interactive lab (s14): live z + k drive a marker + curve + readout. --
const zSlider0604 = document.querySelector('#wgZ_0604')
const zOut0604 = document.querySelector('#wgZOut_0604')
const kSlider0604 = document.querySelector('#wgK_0604')
const kOut0604 = document.querySelector('#wgKOut_0604')
const presetButtons0604 = [...document.querySelectorAll('#wgPresetGroup_0604 [data-preset]')]
const plotWrap0604 = document.querySelector('#wgSigmoidPlot_0604')
const readout0604 = document.querySelector('#wgReadout_0604')
const verdict0604 = document.querySelector('#wgVerdict_0604')

let activePreset0604 = null

function clearPreset0604() {
  activePreset0604 = null
}

function renderLab0604() {
  if (!zSlider0604 || !kSlider0604) return
  const z = Number(zSlider0604.value)
  const k = Number(kSlider0604.value)
  if (zOut0604) zOut0604.textContent = z.toFixed(1)
  if (kOut0604) kOut0604.textContent = k.toFixed(1)

  const p = sigma0604(k * z)
  const row = activePreset0604 ? ROWS_0604.find(r => r.label === activePreset0604) : null

  if (plotWrap0604) {
    const curve = curvePath0604(k)
    const markerX = pxX0604(z).toFixed(1)
    const markerY = pxY0604(p).toFixed(1)
    plotWrap0604.innerHTML = `
      <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-label="Live plot of sigma of k times z, with a draggable marker at the current z">
        <g font-family="IBM Plex Mono, monospace" font-size="8" fill="currentColor">
          ${axesSvg0604()}
          ${midpointLines0604()}
          <path d="${curve}" fill="none" stroke="var(--teal)" stroke-width="2"/>
          <circle cx="${markerX}" cy="${markerY}" r="6" fill="var(--ink)" stroke="var(--paper)" stroke-width="1.5"/>
        </g>
      </svg>
    `
  }

  if (readout0604) {
    readout0604.innerHTML = `
      <div><span>Z</span><b>${z.toFixed(1)}</b></div>
      <div><span>K</span><b>${k.toFixed(1)}</b></div>
      <div><span>SIGMA(K·Z)</span><b>${p.toFixed(4)}</b></div>
      ${row ? `<div><span>ROW ${row.label} -- ACTUAL y</span><b>${row.y}</b></div><div><span>ROW ${row.label} -- BCE LOSS</span><b>${row.loss.toFixed(4)}</b></div>` : ''}
    `
  }

  if (verdict0604) {
    let cls = 'verdict-amber'
    let text = ''
    if (Math.abs(p - 0.5) < 0.03) {
      cls = 'verdict-amber'
      text = 'Near the 50% boundary -- maximally uncertain.'
    } else if (row) {
      const predicted = p >= 0.5 ? 1 : 0
      if (predicted === row.y) {
        cls = 'verdict-green'
        text = 'Confidently correct.'
      } else {
        cls = 'verdict-red'
        text = 'Confidently wrong -- large BCE penalty.'
      }
    } else {
      cls = p >= 0.5 ? 'verdict-green' : 'verdict-amber'
      text = `Reads as ${(p * 100).toFixed(1)}% likely -- no worked-example label attached at this exact point.`
    }
    verdict0604.className = `gate-verdict ${cls}`
    verdict0604.textContent = text
  }
}

presetButtons0604.forEach(btn => {
  btn.addEventListener('click', () => {
    const label = btn.dataset.preset
    const row = ROWS_0604.find(r => r.label === label)
    if (!row) return
    activePreset0604 = label
    zSlider0604.value = String(row.z)
    kSlider0604.value = '1.0'
    renderLab0604()
  })
})

zSlider0604?.addEventListener('input', () => {
  clearPreset0604()
  renderLab0604()
})
kSlider0604?.addEventListener('input', () => {
  clearPreset0604()
  renderLab0604()
})

renderSigmoidStatic0604()
renderSteepnessPreview0604()
renderLab0604()
