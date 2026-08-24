// Section 14's lab: The SSE Surface. Unlike Concept 01's Line Fitter, which
// dragged a LINE over fixed data points, this lab drags a POINT through
// parameter space (b0, b1) and watches the loss surface respond. The
// background contours and the live SSE/gradient readout all come from the
// same closed-form quadratic derived in Concept 02's worked example --
// nothing here re-sums the six data rows at runtime.
//
// Also drives two small static figures that never move: b04's single-slice
// parabola (SSE with b0 pinned at the OLS intercept) and s07's simplified
// 3-ellipse contour preview.

// SSE(b0,b1) = 6b0^2 + 42b0b1 - 152b0 + 91b1^2 - 632b1 + 1120 -- the exact
// quadratic expansion verified in the concept's worked example.
function sse0602(b0, b1) {
  return 6 * b0 * b0 + 42 * b0 * b1 - 152 * b0 + 91 * b1 * b1 - 632 * b1 + 1120
}
function dSseDb0_0602(b0, b1) {
  return 12 * b0 + 42 * b1 - 152
}
function dSseDb1_0602(b0, b1) {
  return 42 * b0 + 182 * b1 - 632
}

// The unique OLS minimum on Concept 01's 6-row dataset.
const B0_STAR_0602 = 8 / 3
const B1_STAR_0602 = 20 / 7
const SSE_MIN_0602 = 304 / 21

// Concept 01's own two-point candidate.
const B0_CANDIDATE_0602 = 2
const B1_CANDIDATE_0602 = 3

// Shared (b0, b1) plot geometry -- b0 on 0-6, b1 on 1-5, both ranges chosen
// so the candidate and the minimum sit comfortably inside with margin.
const B0_MIN_0602 = 0, B0_MAX_0602 = 6
const B1_MIN_0602 = 1, B1_MAX_0602 = 5
const PLOT_X0_0602 = 60, PLOT_X1_0602 = 430
const PLOT_Y0_0602 = 200, PLOT_Y1_0602 = 30 // pixel y for b1=min / b1=max

function pxX0602(b0) {
  return PLOT_X0_0602 + (b0 - B0_MIN_0602) / (B0_MAX_0602 - B0_MIN_0602) * (PLOT_X1_0602 - PLOT_X0_0602)
}
function pxY0602(b1) {
  return PLOT_Y0_0602 + (b1 - B1_MIN_0602) / (B1_MAX_0602 - B1_MIN_0602) * (PLOT_Y1_0602 - PLOT_Y0_0602)
}

// One elliptical contour at excess loss k, via the verified radius formula
// r(k,theta) = sqrt(k / (6cos^2(theta) + 42cos(theta)sin(theta) + 91sin^2(theta))),
// swept around the minimum. Only "plugging theta into the radius formula" --
// no new derivation.
function ellipsePath0602(k, samples) {
  const n = samples || 60
  let d = ''
  for (let i = 0; i <= n; i++) {
    const theta = (i / n) * 2 * Math.PI
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    const denom = 6 * c * c + 42 * c * s + 91 * s * s
    const r = Math.sqrt(k / denom)
    const b0 = B0_STAR_0602 + r * c
    const b1 = B1_STAR_0602 + r * s
    const px = pxX0602(b0).toFixed(1)
    const py = pxY0602(b1).toFixed(1)
    d += (i === 0 ? 'M' : 'L') + px + ' ' + py + ' '
  }
  return d + 'Z'
}

function axesSvg0602() {
  const ticksB0 = [0, 2, 4, 6]
  const ticksB1 = [1, 3, 5]
  const tickB0 = ticksB0.map(v => `
    <line x1="${pxX0602(v).toFixed(1)}" y1="${PLOT_Y0_0602}" x2="${pxX0602(v).toFixed(1)}" y2="${PLOT_Y0_0602 + 5}" stroke="currentColor" stroke-width="1"/>
    <text x="${pxX0602(v).toFixed(1)}" y="${PLOT_Y0_0602 + 16}" text-anchor="middle">${v}</text>
  `).join('')
  const tickB1 = ticksB1.map(v => `
    <line x1="${PLOT_X0_0602 - 5}" y1="${pxY0602(v).toFixed(1)}" x2="${PLOT_X0_0602}" y2="${pxY0602(v).toFixed(1)}" stroke="currentColor" stroke-width="1"/>
    <text x="${PLOT_X0_0602 - 9}" y="${(pxY0602(v) + 3).toFixed(1)}" text-anchor="end">${v}</text>
  `).join('')
  return `
    <line x1="${PLOT_X0_0602}" y1="${PLOT_Y0_0602}" x2="${PLOT_X1_0602}" y2="${PLOT_Y0_0602}" stroke="currentColor" stroke-width="1"/>
    <line x1="${PLOT_X0_0602}" y1="${PLOT_Y1_0602 - 10}" x2="${PLOT_X0_0602}" y2="${PLOT_Y0_0602}" stroke="currentColor" stroke-width="1"/>
    ${tickB0}${tickB1}
    <text x="${(PLOT_X0_0602 + PLOT_X1_0602) / 2}" y="${PLOT_Y0_0602 + 32}" text-anchor="middle" font-size="7.5">INTERCEPT b0</text>
    <text x="18" y="${(PLOT_Y0_0602 + PLOT_Y1_0602) / 2}" text-anchor="middle" font-size="7.5" transform="rotate(-90 18 ${(PLOT_Y0_0602 + PLOT_Y1_0602) / 2})">SLOPE b1</text>
  `
}

function fixedMarkers0602() {
  const minX = pxX0602(B0_STAR_0602).toFixed(1)
  const minY = pxY0602(B1_STAR_0602).toFixed(1)
  const candX = pxX0602(B0_CANDIDATE_0602).toFixed(1)
  const candY = pxY0602(B1_CANDIDATE_0602).toFixed(1)
  return `
    <circle cx="${minX}" cy="${minY}" r="5" fill="none" stroke="var(--teal)" stroke-width="2.5"/>
    <text x="${minX}" y="${(Number(minY) - 10).toFixed(1)}" text-anchor="middle" fill="var(--teal)" font-weight="700">the unique minimum</text>
    <circle cx="${candX}" cy="${candY}" r="4" fill="var(--orange)"/>
    <text x="${candX}" y="${(Number(candY) + 15).toFixed(1)}" text-anchor="middle" fill="var(--orange)" font-weight="700">Concept 01's ŷ=2+3x</text>
  `
}

// -- Static preview #1 (beginner, b04): a single slice through the bowl,
// holding b0 pinned at the OLS intercept and sweeping only b1. --
function renderParabolaStatic0602() {
  const wrap = document.querySelector('#wgParabola_0602')
  if (!wrap) return
  const sMax = 450
  const pxXb1 = b1 => 40 + (b1 - 1) / 4 * 400
  const pxYs = s => 190 - (s / sMax) * 170
  let path = ''
  for (let i = 0; i <= 80; i++) {
    const b1 = 1 + (i / 80) * 4
    const s = sse0602(B0_STAR_0602, b1)
    path += (i === 0 ? 'M' : 'L') + pxXb1(b1).toFixed(1) + ' ' + pxYs(Math.min(s, sMax)).toFixed(1) + ' '
  }
  const minX = pxXb1(B1_STAR_0602).toFixed(1)
  const minY = pxYs(SSE_MIN_0602).toFixed(1)
  wrap.innerHTML = `
    <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-labelledby="c0602-b04-svg-title c0602-b04-svg-desc">
      <title id="c0602-b04-svg-title">A single slice through the SSE bowl, holding the intercept fixed at the OLS value and sweeping the slope</title>
      <desc id="c0602-b04-svg-desc">A parabola plots SSE against the slope b1, from 1 to 5, with the intercept held fixed at 8 over 3. The curve falls from about 328 at b1 equals 1 down to a single lowest point near b1 equals 2.857, then rises again to about 432 at b1 equals 5. A dashed line marks that lowest point, where the curve stops sloping in either direction.</desc>
      <g font-family="IBM Plex Mono, monospace" font-size="8" fill="currentColor">
        <line x1="40" y1="190" x2="440" y2="190" stroke="currentColor" stroke-width="1"/>
        <line x1="40" y1="20" x2="40" y2="190" stroke="currentColor" stroke-width="1"/>
        <text x="40" y="206" text-anchor="middle">1</text>
        <text x="240" y="206" text-anchor="middle">3</text>
        <text x="440" y="206" text-anchor="middle">5</text>
        <text x="240" y="216" text-anchor="middle" font-size="7.5">SLOPE b1 (INTERCEPT HELD AT 8/3)</text>
        <text x="36" y="190" text-anchor="end">0</text>
        <text x="36" y="20" text-anchor="end">450</text>
        <text x="18" y="110" text-anchor="middle" font-size="7.5" transform="rotate(-90 18 110)">SSE</text>
        <path d="${path.trim()}" fill="none" stroke="var(--teal)" stroke-width="2"/>
        <line x1="${minX}" y1="190" x2="${minX}" y2="${minY}" stroke="var(--orange)" stroke-width="1.5" stroke-dasharray="3,2"/>
        <circle cx="${minX}" cy="${minY}" r="4" fill="var(--orange)"/>
        <text x="${minX}" y="${(Number(minY) - 8).toFixed(1)}" text-anchor="middle" fill="var(--orange)" font-weight="700">bottom of this slice: b1=20/7, SSE≈14.48</text>
      </g>
    </svg>
  `
}

// -- Static preview #2 (advanced, s07): 3 simplified contours, no sliders. --
function renderContourStatic0602() {
  const wrap = document.querySelector('#wgStaticContour_0602')
  if (!wrap) return
  const levels = [0.524, 3, 10]
  const paths = levels.map((k, i) => `<path d="${ellipsePath0602(k, 48)}" fill="none" stroke="var(--muted)" stroke-width="${i === 0 ? 2 : 1.3}" stroke-dasharray="${i === 0 ? '0' : '4,3'}"/>`).join('')
  wrap.innerHTML = `
    <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-labelledby="c0602-s07-svg-title c0602-s07-svg-desc">
      <title id="c0602-s07-svg-title">A simplified preview of the SSE bowl seen from above, as three nested contour ellipses over the intercept-slope plane</title>
      <desc id="c0602-s07-svg-desc">Three nested ellipses surround a single center point at intercept 8 over 3, slope 20 over 7 -- the unique minimum. Concept 01's candidate line at intercept 2, slope 3 sits just inside the innermost ellipse, showing it was already close to optimal in this parameter space, even though its residuals did not sum to zero.</desc>
      <g font-family="IBM Plex Mono, monospace" font-size="8" fill="currentColor">
        ${axesSvg0602()}
        ${paths}
        ${fixedMarkers0602()}
      </g>
    </svg>
  `
}

// -- Interactive lab (s14): sliders drive a live marker + readout + verdict. --
const b0Slider0602 = document.querySelector('#wgB0_0602')
const b1Slider0602 = document.querySelector('#wgB1_0602')
const b0Out0602 = document.querySelector('#wgB0Out_0602')
const b1Out0602 = document.querySelector('#wgB1Out_0602')
const presetButtons0602 = [...document.querySelectorAll('#wgPresetGroup_0602 [data-preset]')]
const contourWrap0602 = document.querySelector('#wgContour_0602')
const readout0602 = document.querySelector('#wgReadout_0602')
const verdict0602 = document.querySelector('#wgVerdict_0602')

function renderLab0602() {
  if (!b0Slider0602 || !b1Slider0602) return
  const b0 = Number(b0Slider0602.value)
  const b1 = Number(b1Slider0602.value)
  if (b0Out0602) b0Out0602.textContent = b0.toFixed(4)
  if (b1Out0602) b1Out0602.textContent = b1.toFixed(4)

  const sse = sse0602(b0, b1)
  const db0 = dSseDb0_0602(b0, b1)
  const db1 = dSseDb1_0602(b0, b1)

  if (contourWrap0602) {
    const levels = [0.524, 3, 10, 20]
    const contourPaths = levels.map((k, i) => `<path d="${ellipsePath0602(k, 60)}" fill="none" stroke="var(--muted)" stroke-width="${i === 0 ? 2 : 1.2}" stroke-dasharray="${i === 0 ? '0' : '4,3'}"/>`).join('')
    const markerX = pxX0602(b0).toFixed(1)
    const markerY = pxY0602(b1).toFixed(1)
    contourWrap0602.innerHTML = `
      <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-label="Live contour plot of the SSE surface over the intercept-slope plane, with a draggable-style marker at the current slider position">
        <g font-family="IBM Plex Mono, monospace" font-size="8" fill="currentColor">
          ${axesSvg0602()}
          ${contourPaths}
          ${fixedMarkers0602()}
          <circle cx="${markerX}" cy="${markerY}" r="6" fill="var(--ink)" stroke="var(--paper)" stroke-width="1.5"/>
        </g>
      </svg>
    `
  }

  if (readout0602) {
    readout0602.innerHTML = `
      <div><span>CURRENT (b0, b1)</span><b>(${b0.toFixed(4)}, ${b1.toFixed(4)})</b></div>
      <div><span>SSE(b0, b1)</span><b>${sse.toFixed(6)}</b></div>
      <div><span>∂SSE/∂b0</span><b>${db0 >= 0 ? '+' : ''}${db0.toFixed(6)}</b></div>
      <div><span>∂SSE/∂b1</span><b>${db1 >= 0 ? '+' : ''}${db1.toFixed(6)}</b></div>
    `
  }

  if (verdict0602) {
    const atMinimum = Math.abs(db0) <= 0.5 && Math.abs(db1) <= 0.5
    verdict0602.className = `gate-verdict ${atMinimum ? 'verdict-green' : 'verdict-red'}`
    verdict0602.innerHTML = atMinimum
      ? `This is (within rounding of) the exact minimum -- both partial derivatives are zero, exactly as the normal equations require.`
      : `Not the minimum -- the surface still slopes here, calculus says keep moving. (|∂SSE/∂b0|=${Math.abs(db0).toFixed(3)}, |∂SSE/∂b1|=${Math.abs(db1).toFixed(3)}, tolerance 0.5)`
  }
}

presetButtons0602.forEach(btn => {
  btn.addEventListener('click', () => {
    const preset = btn.dataset.preset
    if (preset === 'concept1') {
      b0Slider0602.value = '2'
      b1Slider0602.value = '3'
    } else if (preset === 'reveal') {
      // Direct .value assignment, bypassing the 0.05 step grid -- 8/3 and
      // 20/7 are not exact multiples of 0.05, so only an unconstrained
      // assignment lands exactly on the minimum.
      b0Slider0602.value = String(B0_STAR_0602)
      b1Slider0602.value = String(B1_STAR_0602)
    }
    renderLab0602()
  })
})

b0Slider0602?.addEventListener('input', renderLab0602)
b1Slider0602?.addEventListener('input', renderLab0602)

renderParabolaStatic0602()
renderContourStatic0602()
renderLab0602()
