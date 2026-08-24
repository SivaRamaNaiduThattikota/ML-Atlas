// Section 14's lab: The Shrinking Constraint. Unlike Concept 02's SSE
// Surface, which dragged a point through (b0,b1) with FIXED contour
// ellipses and no constraint region, this lab drags a live lambda dial and
// an L1/L2 mode toggle over a DIFFERENT plane -- the two standardized
// coefficients b1 (prior_contact_attempts) and b2 (recent_complaint_count).
// Every point plotted here is genuinely computed at render time from this
// concept's own verified Z-sums, never a pre-baked keyframe.
//
// Also drives two small static figures that never move: b04's ridge
// coefficient-path plot (a sweep over lambda, drawn once) and s07's
// simplified circle-vs-diamond preview at a single fixed lambda.

// Standardized-space sums, verified in the worked example (Section 10).
const Z11_0603 = 5
const Z22_0603 = 5
const Z12_0603 = 4.877541
const Z1Y_0603 = 26.726124
const Z2Y_0603 = 25.581319

// The unpenalized (lambda=0) standardized OLS solution -- the center every
// SSE contour below is drawn around.
const BHAT1_0603 = 7.322036
const BHAT2_0603 = -2.026443
const SSE_MIN_0603 = 13.482759

// Ridge closed form: solve (Z'Z + lambda*I) b = Z'y as an exact 2x2 system.
function ridgeSolve0603(lambda) {
  const a11 = Z11_0603 + lambda
  const a22 = Z22_0603 + lambda
  const det = a11 * a22 - Z12_0603 * Z12_0603
  const b1 = (Z1Y_0603 * a22 - Z2Y_0603 * Z12_0603) / det
  const b2 = (Z2Y_0603 * a11 - Z1Y_0603 * Z12_0603) / det
  return { b1, b2 }
}

// Lasso coordinate descent: soft-threshold each coordinate against the
// other's current value, 200 iterations -- cheap and well converged for
// this 2-variable case, per the lab's own design.
function lassoSolve0603(lambda) {
  let b1 = 0
  let b2 = 0
  for (let i = 0; i < 200; i++) {
    const rho1 = Z1Y_0603 - Z12_0603 * b2
    const s1 = rho1 > 0 ? 1 : rho1 < 0 ? -1 : 0
    b1 = s1 * Math.max(Math.abs(rho1) - lambda / 2, 0) / Z11_0603
    const rho2 = Z2Y_0603 - Z12_0603 * b1
    const s2 = rho2 > 0 ? 1 : rho2 < 0 ? -1 : 0
    b2 = s2 * Math.max(Math.abs(rho2) - lambda / 2, 0) / Z22_0603
  }
  return { b1, b2 }
}

// SSE(b1,b2) via the exact quadratic identity SSE = SSE_min + (b-bhat)'(Z'Z)(b-bhat).
function sseAt0603(b1, b2) {
  const d1 = b1 - BHAT1_0603
  const d2 = b2 - BHAT2_0603
  return SSE_MIN_0603 + Z11_0603 * d1 * d1 + 2 * Z12_0603 * d1 * d2 + Z22_0603 * d2 * d2
}

// Shared (b1, b2) plot geometry -- b1 on 0-8, b2 on -3-3, ranges chosen so
// every lambda=0..12 point under either penalty sits comfortably inside.
const B1_MIN_0603 = 0, B1_MAX_0603 = 8
const B2_MIN_0603 = -3, B2_MAX_0603 = 3
const PLOT_X0_0603 = 60, PLOT_X1_0603 = 430
const PLOT_Y0_0603 = 200, PLOT_Y1_0603 = 30 // pixel y for b2=min / b2=max

function pxX0603(b1) {
  return PLOT_X0_0603 + (b1 - B1_MIN_0603) / (B1_MAX_0603 - B1_MIN_0603) * (PLOT_X1_0603 - PLOT_X0_0603)
}
function pxY0603(b2) {
  return PLOT_Y0_0603 + (b2 - B2_MIN_0603) / (B2_MAX_0603 - B2_MIN_0603) * (PLOT_Y1_0603 - PLOT_Y0_0603)
}

// One elliptical SSE contour at excess loss k, via the same "sweep theta,
// solve the radius" technique Concept 02 used -- here the cross-term
// coefficient is 2*Z12 (5, 9.755082, 5) rather than Concept 02's (6, 42, 91),
// but it is the identical formula applied to this concept's own quadratic form.
function ellipsePath0603(k, samples) {
  const n = samples || 60
  let d = ''
  for (let i = 0; i <= n; i++) {
    const theta = (i / n) * 2 * Math.PI
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    const denom = Z11_0603 * c * c + 2 * Z12_0603 * c * s + Z22_0603 * s * s
    const r = Math.sqrt(k / denom)
    const b1 = BHAT1_0603 + r * c
    const b2 = BHAT2_0603 + r * s
    const px = pxX0603(b1).toFixed(1)
    const py = pxY0603(b2).toFixed(1)
    d += (i === 0 ? 'M' : 'L') + px + ' ' + py + ' '
  }
  return d + 'Z'
}

function axesSvg0603() {
  const ticksB1 = [0, 2, 4, 6, 8]
  const ticksB2 = [-3, -1, 1, 3]
  const tickB1 = ticksB1.map(v => `
    <line x1="${pxX0603(v).toFixed(1)}" y1="${PLOT_Y0_0603}" x2="${pxX0603(v).toFixed(1)}" y2="${PLOT_Y0_0603 + 5}" stroke="currentColor" stroke-width="1"/>
    <text x="${pxX0603(v).toFixed(1)}" y="${PLOT_Y0_0603 + 16}" text-anchor="middle">${v}</text>
  `).join('')
  const tickB2 = ticksB2.map(v => `
    <line x1="${PLOT_X0_0603 - 5}" y1="${pxY0603(v).toFixed(1)}" x2="${PLOT_X0_0603}" y2="${pxY0603(v).toFixed(1)}" stroke="currentColor" stroke-width="1"/>
    <text x="${PLOT_X0_0603 - 9}" y="${(pxY0603(v) + 3).toFixed(1)}" text-anchor="end">${v}</text>
  `).join('')
  return `
    <line x1="${PLOT_X0_0603}" y1="${PLOT_Y0_0603}" x2="${PLOT_X1_0603}" y2="${PLOT_Y0_0603}" stroke="currentColor" stroke-width="1"/>
    <line x1="${PLOT_X0_0603}" y1="${PLOT_Y1_0603 - 10}" x2="${PLOT_X0_0603}" y2="${PLOT_Y0_0603}" stroke="currentColor" stroke-width="1"/>
    ${tickB1}${tickB2}
    <text x="${(PLOT_X0_0603 + PLOT_X1_0603) / 2}" y="${PLOT_Y0_0603 + 32}" text-anchor="middle" font-size="7.5">b1 (PRIOR_CONTACT_ATTEMPTS, STANDARDIZED)</text>
    <text x="18" y="${(PLOT_Y0_0603 + PLOT_Y1_0603) / 2}" text-anchor="middle" font-size="7.5" transform="rotate(-90 18 ${(PLOT_Y0_0603 + PLOT_Y1_0603) / 2})">b2 (RECENT_COMPLAINT_COUNT, STANDARDIZED)</text>
  `
}

function bhatMarker0603() {
  const x = pxX0603(BHAT1_0603).toFixed(1)
  const y = pxY0603(BHAT2_0603).toFixed(1)
  return `
    <circle cx="${x}" cy="${y}" r="4" fill="var(--orange)"/>
    <text x="${x}" y="${(Number(y) + 15).toFixed(1)}" text-anchor="middle" fill="var(--orange)" font-weight="700">unpenalized OLS (λ=0): the instability</text>
  `
}

// -- Static preview #1 (beginner, b04): ridge's own coefficient paths as
// lambda sweeps 0-12, both drawn from the live closed form, not baked in. --
function renderCoefPathStatic0603() {
  const wrap = document.querySelector('#wgCoefPath_0603')
  if (!wrap) return
  const lamMax = 12
  const pxXLam = lam => 40 + (lam / lamMax) * 400
  const yMin = -3, yMax = 8
  const pxYb = b => 190 - (b - yMin) / (yMax - yMin) * 170
  let pathB1 = ''
  let pathB2 = ''
  for (let i = 0; i <= 80; i++) {
    const lam = (i / 80) * lamMax
    const { b1, b2 } = ridgeSolve0603(lam)
    pathB1 += (i === 0 ? 'M' : 'L') + pxXLam(lam).toFixed(1) + ' ' + pxYb(b1).toFixed(1) + ' '
    pathB2 += (i === 0 ? 'M' : 'L') + pxXLam(lam).toFixed(1) + ' ' + pxYb(b2).toFixed(1) + ' '
  }
  const zeroX = pxXLam(0).toFixed(1)
  const zeroY = pxYb(0).toFixed(1)
  wrap.innerHTML = `
    <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-labelledby="c0603-b04-svg-title c0603-b04-svg-desc">
      <title id="c0603-b04-svg-title">Ridge's two standardized coefficients plotted against the penalty strength lambda, from 0 to 12</title>
      <desc id="c0603-b04-svg-desc">Two curves fall as lambda increases from 0 to 12. The b1 curve starts near 7.32 and falls to about 1.24. The b2 curve starts near negative 2.03, crosses zero early, and rises to about 1.15 before both curves flatten out. Neither curve touches the zero line and stays there.</desc>
      <g font-family="IBM Plex Mono, monospace" font-size="8" fill="currentColor">
        <line x1="40" y1="190" x2="440" y2="190" stroke="currentColor" stroke-width="1"/>
        <line x1="40" y1="20" x2="40" y2="190" stroke="currentColor" stroke-width="1"/>
        <line x1="40" y1="${zeroY}" x2="440" y2="${zeroY}" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2,3"/>
        <text x="40" y="206" text-anchor="middle">0</text>
        <text x="240" y="206" text-anchor="middle">6</text>
        <text x="440" y="206" text-anchor="middle">12</text>
        <text x="240" y="216" text-anchor="middle" font-size="7.5">PENALTY STRENGTH λ (RIDGE)</text>
        <text x="36" y="190" text-anchor="end">-3</text>
        <text x="36" y="20" text-anchor="end">8</text>
        <text x="18" y="110" text-anchor="middle" font-size="7.5" transform="rotate(-90 18 110)">COEFFICIENT VALUE</text>
        <path d="${pathB1.trim()}" fill="none" stroke="var(--teal)" stroke-width="2"/>
        <path d="${pathB2.trim()}" fill="none" stroke="var(--orange)" stroke-width="2"/>
        <text x="${zeroX}" y="${(pxYb(7.32) - 6).toFixed(1)}" fill="var(--teal)" font-weight="700">b1</text>
        <text x="${zeroX}" y="${(pxYb(-2.03) + 12).toFixed(1)}" fill="var(--orange)" font-weight="700">b2</text>
      </g>
    </svg>
  `
}

// -- Static preview #2 (advanced, s07): circle vs. diamond at lambda=1. --
function renderStaticConstraint0603() {
  const wrap = document.querySelector('#wgStaticConstraint_0603')
  if (!wrap) return
  const lambda = 1
  const ridge = ridgeSolve0603(lambda)
  const lasso = lassoSolve0603(lambda)
  const ridgeRadius = Math.sqrt(ridge.b1 * ridge.b1 + ridge.b2 * ridge.b2)
  const lassoHalfDiag = Math.abs(lasso.b1) + Math.abs(lasso.b2)

  const circlePoints = []
  for (let i = 0; i <= 48; i++) {
    const theta = (i / 48) * 2 * Math.PI
    circlePoints.push(`${pxX0603(ridgeRadius * Math.cos(theta)).toFixed(1)} ${pxY0603(ridgeRadius * Math.sin(theta)).toFixed(1)}`)
  }
  const circlePath = 'M' + circlePoints.join(' L') + ' Z'
  const diamondPath = `M${pxX0603(lassoHalfDiag).toFixed(1)} ${pxY0603(0).toFixed(1)} L${pxX0603(0).toFixed(1)} ${pxY0603(lassoHalfDiag).toFixed(1)} L${pxX0603(-lassoHalfDiag).toFixed(1)} ${pxY0603(0).toFixed(1)} L${pxX0603(0).toFixed(1)} ${pxY0603(-lassoHalfDiag).toFixed(1)} Z`

  const levels = [1, 4, 10]
  const contourPaths = levels.map((k, i) => `<path d="${ellipsePath0603(k, 48)}" fill="none" stroke="var(--muted)" stroke-width="${i === 0 ? 1.4 : 1}" stroke-dasharray="4,3"/>`).join('')

  const ridgeX = pxX0603(ridge.b1).toFixed(1)
  const ridgeY = pxY0603(ridge.b2).toFixed(1)
  const lassoX = pxX0603(lasso.b1).toFixed(1)
  const lassoY = pxY0603(lasso.b2).toFixed(1)

  wrap.innerHTML = `
    <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-labelledby="c0603-s07-svg-title c0603-s07-svg-desc">
      <title id="c0603-s07-svg-title">A simplified preview of the ridge circle and lasso diamond constraint regions at penalty strength lambda equals 1</title>
      <desc id="c0603-s07-svg-desc">Dashed SSE contour ellipses surround the unpenalized solution. A circle, sized to the ridge solution's own norm, touches an SSE contour at a point where both coefficients are nonzero. A diamond, sized to the lasso solution's own norm, touches an SSE contour exactly at its corner on the horizontal axis, where the second coefficient is zero.</desc>
      <g font-family="IBM Plex Mono, monospace" font-size="8" fill="currentColor">
        ${axesSvg0603()}
        ${contourPaths}
        ${bhatMarker0603()}
        <path d="${circlePath}" fill="none" stroke="var(--teal)" stroke-width="1.6"/>
        <path d="${diamondPath}" fill="none" stroke="var(--orange)" stroke-width="1.6"/>
        <circle cx="${ridgeX}" cy="${ridgeY}" r="4" fill="var(--teal)"/>
        <text x="${ridgeX}" y="${(Number(ridgeY) - 8).toFixed(1)}" text-anchor="middle" fill="var(--teal)" font-weight="700">ridge: both nonzero</text>
        <circle cx="${lassoX}" cy="${lassoY}" r="4" fill="var(--orange)"/>
        <text x="${lassoX}" y="${(Number(lassoY) + 15).toFixed(1)}" text-anchor="middle" fill="var(--orange)" font-weight="700">lasso: corner on the axis, b2=0</text>
      </g>
    </svg>
  `
}

// -- Interactive lab (s14): live lambda + mode drive a marker + boundary + readout. --
const lambdaSlider0603 = document.querySelector('#wgLambda_0603')
const lambdaOut0603 = document.querySelector('#wgLambdaOut_0603')
const modeButtons0603 = [...document.querySelectorAll('#wgModeGroup_0603 [data-mode]')]
const presetButtons0603 = [...document.querySelectorAll('#wgPresetGroup_0603 [data-preset]')]
const plotWrap0603 = document.querySelector('#wgConstraintPlot_0603')
const readout0603 = document.querySelector('#wgReadout_0603')
const verdict0603 = document.querySelector('#wgVerdict_0603')

let currentMode0603 = 'ridge'

function setMode0603(mode) {
  currentMode0603 = mode
  modeButtons0603.forEach(btn => {
    const active = btn.dataset.mode === mode
    btn.className = active ? 'primary' : 'secondary'
    btn.setAttribute('aria-pressed', active ? 'true' : 'false')
  })
}

function renderLab0603() {
  if (!lambdaSlider0603) return
  const lambda = Number(lambdaSlider0603.value)
  if (lambdaOut0603) lambdaOut0603.textContent = lambda.toFixed(1)

  const solution = currentMode0603 === 'ridge' ? ridgeSolve0603(lambda) : lassoSolve0603(lambda)
  const { b1, b2 } = solution
  const sse = sseAt0603(b1, b2)
  const penalty = currentMode0603 === 'ridge' ? (b1 * b1 + b2 * b2) : (Math.abs(b1) + Math.abs(b2))
  const objective = sse + lambda * penalty
  const norm1 = Math.abs(b1) + Math.abs(b2)
  const norm2 = Math.sqrt(b1 * b1 + b2 * b2)

  if (plotWrap0603) {
    const levels = [1, 4, 10, 20]
    const contourPaths = levels.map((k, i) => `<path d="${ellipsePath0603(k, 60)}" fill="none" stroke="var(--muted)" stroke-width="${i === 0 ? 1.6 : 1}" stroke-dasharray="4,3"/>`).join('')

    let boundaryPath = ''
    if (currentMode0603 === 'ridge') {
      const pts = []
      for (let i = 0; i <= 60; i++) {
        const theta = (i / 60) * 2 * Math.PI
        pts.push(`${pxX0603(norm2 * Math.cos(theta)).toFixed(1)} ${pxY0603(norm2 * Math.sin(theta)).toFixed(1)}`)
      }
      boundaryPath = 'M' + pts.join(' L') + ' Z'
    } else {
      boundaryPath = `M${pxX0603(norm1).toFixed(1)} ${pxY0603(0).toFixed(1)} L${pxX0603(0).toFixed(1)} ${pxY0603(norm1).toFixed(1)} L${pxX0603(-norm1).toFixed(1)} ${pxY0603(0).toFixed(1)} L${pxX0603(0).toFixed(1)} ${pxY0603(-norm1).toFixed(1)} Z`
    }

    const markerX = pxX0603(b1).toFixed(1)
    const markerY = pxY0603(b2).toFixed(1)
    const boundaryColor = currentMode0603 === 'ridge' ? 'var(--teal)' : 'var(--orange)'

    plotWrap0603.innerHTML = `
      <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-label="Live contour plot of the standardized coefficient plane, with the current penalty's solution point and its constraint boundary">
        <g font-family="IBM Plex Mono, monospace" font-size="8" fill="currentColor">
          ${axesSvg0603()}
          ${contourPaths}
          ${bhatMarker0603()}
          <path d="${boundaryPath}" fill="none" stroke="${boundaryColor}" stroke-width="2"/>
          <circle cx="${markerX}" cy="${markerY}" r="6" fill="var(--ink)" stroke="var(--paper)" stroke-width="1.5"/>
        </g>
      </svg>
    `
  }

  if (readout0603) {
    readout0603.innerHTML = `
      <div><span>MODE</span><b>${currentMode0603 === 'ridge' ? 'Ridge (L2)' : 'Lasso (L1)'}</b></div>
      <div><span>(b1, b2)</span><b>(${b1.toFixed(4)}, ${b2.toFixed(4)})</b></div>
      <div><span>SSE</span><b>${sse.toFixed(4)}</b></div>
      <div><span>PENALTY TERM</span><b>${penalty.toFixed(4)}</b></div>
      <div><span>TOTAL OBJECTIVE</span><b>${objective.toFixed(4)}</b></div>
    `
  }

  if (verdict0603) {
    const zeroed = currentMode0603 === 'lasso' && Math.abs(b2) < 1e-6
    verdict0603.className = `gate-verdict ${zeroed ? 'verdict-green' : currentMode0603 === 'lasso' ? 'verdict-amber' : 'verdict-red'}`
    verdict0603.innerHTML = zeroed
      ? `recent_complaint_count dropped to exactly 0 -- lasso's corner-on-the-axis geometry, matching the verified λ≈0.4963 threshold.`
      : currentMode0603 === 'lasso'
        ? `Both features still retained at this λ -- keep raising the dial past λ≈0.4963 to watch b2 snap to zero.`
        : `Both features retained, shrinking but never zero -- ridge's circle has no corners at any λ.`
  }
}

modeButtons0603.forEach(btn => {
  btn.addEventListener('click', () => {
    setMode0603(btn.dataset.mode)
    renderLab0603()
  })
})

presetButtons0603.forEach(btn => {
  btn.addEventListener('click', () => {
    const preset = btn.dataset.preset
    if (preset === 'zero') lambdaSlider0603.value = '0'
    else if (preset === 'threshold') lambdaSlider0603.value = '0.5'
    else if (preset === 'heavy') lambdaSlider0603.value = '12'
    renderLab0603()
  })
})

lambdaSlider0603?.addEventListener('input', renderLab0603)

renderCoefPathStatic0603()
renderStaticConstraint0603()
setMode0603('ridge')
renderLab0603()
