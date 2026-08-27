// Section 14's lab: The Variance Gap. Concepts 04-06 all fit a boundary
// by minimizing a loss over weights (w0, w1, w2), then reread that same
// z three different ways -- probability, log-odds, geometry. This concept
// derives a boundary a completely different way: from two class-conditional
// Gaussian densities and Bayes' rule, with no weight vector anywhere in the
// mechanism. LDA forces the two classes to share one variance (the boundary
// collapses to the exact midpoint of the two means); QDA lets each class
// keep its own variance (the boundary becomes a quadratic with up to two
// roots). Both routes are computed here from one shared closed form.

// The worked example's own numbers, verified in the research stage and
// reused verbatim -- this concept never refits anything against real data,
// it assumes these class-conditional parameters directly.
const MU0_DEFAULT_0607 = 2
const SIGMA0_DEFAULT_0607 = 1
const MU1_DEFAULT_0607 = 6
const SIGMA1_DEFAULT_0607 = 2
const TESTX_DEFAULT_0607 = 3.8

// The worked example's own verified constants, cited directly wherever the
// lesson text states them as fixed facts (independent of the live lab's
// own recomputation at whatever the sliders currently read).
const LDA_BOUNDARY_CITED_0607 = 4.0
const QDA_ROOT_LOW_CITED_0607 = -2.3265763225683034
const QDA_ROOT_HIGH_CITED_0607 = 3.6599096559016364

function gaussianPdf0607(x, mu, sigma) {
  const coeff = 1 / (sigma * Math.sqrt(2 * Math.PI))
  return coeff * Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma))
}

// The LDA case: forcing a single shared variance cancels sigma completely
// out of the equality f0(x)=f1(x), leaving x*=(mu0+mu1)/2 -- true for ANY
// shared sigma, which is exactly why the live lab's LDA line never reacts
// to either sigma slider.
function ldaBoundary0607(mu0, mu1) {
  return (mu0 + mu1) / 2
}

// The general closed form (equal priors, pi0=pi1=0.5): setting the two
// log-densities equal and collecting terms gives A*x^2 + B*x + C = 0, which
// degenerates to a single linear root when sigma0=sigma1 (A=0) -- the LDA
// case is the A=0 special case of this exact same formula, not a separate
// mechanism.
function qdaRoots0607(mu0, sigma0, mu1, sigma1) {
  const s0sq = sigma0 * sigma0
  const s1sq = sigma1 * sigma1
  const A = s0sq - s1sq
  const B = 2 * (s1sq * mu0 - s0sq * mu1)
  const C = s0sq * mu1 * mu1 - s1sq * mu0 * mu0 - 2 * s0sq * s1sq * Math.log(sigma0 / sigma1)
  if (Math.abs(A) < 1e-9) {
    if (Math.abs(B) < 1e-12) return []
    return [-C / B]
  }
  const disc = B * B - 4 * A * C
  if (disc < 0) return []
  const sqrtDisc = Math.sqrt(disc)
  const r1 = (-B + sqrtDisc) / (2 * A)
  const r2 = (-B - sqrtDisc) / (2 * A)
  return [r1, r2].sort((a, b) => a - b)
}

// QDA's actual decision rule under equal priors: predict whichever class's
// density is higher at x, directly -- no root-finding needed to classify a
// single point, only to draw where the switch-overs happen.
function classAtPoint0607(x, mu0, sigma0, mu1, sigma1) {
  const f0 = gaussianPdf0607(x, mu0, sigma0)
  const f1 = gaussianPdf0607(x, mu1, sigma1)
  return f0 >= f1 ? 0 : 1
}

function ldaClassAtPoint0607(x, mu0, mu1) {
  const boundary = ldaBoundary0607(mu0, mu1)
  const class1IsHigher = mu1 >= mu0
  if (class1IsHigher) return x >= boundary ? 1 : 0
  return x >= boundary ? 0 : 1
}

// -- Plot geometry (viewBox 0 0 460 320, matching Concept 06's own frame) --
const X0_0607 = 70, X1PX_0607 = 430, Y0_0607 = 40, Y1_0607 = 280
const XMIN_0607 = -8, XMAX_0607 = 16

function pxX0607(x) {
  return X0_0607 + (x - XMIN_0607) / (XMAX_0607 - XMIN_0607) * (X1PX_0607 - X0_0607)
}
function pxY0607(y, yMax) {
  return Y1_0607 - (y / yMax) * (Y1_0607 - Y0_0607)
}

// The visible density scale grows with the sigma sliders so a narrow,
// tall curve (small sigma) never clips off the top of the plot box.
function computeYMax0607(sigma0, sigma1) {
  const peak0 = 1 / (sigma0 * Math.sqrt(2 * Math.PI))
  const peak1 = 1 / (sigma1 * Math.sqrt(2 * Math.PI))
  const raw = Math.max(peak0, peak1) * 1.15
  return Math.max(0.15, Math.ceil(raw * 20) / 20)
}

function axisFrame0607(yMax) {
  const xTicks = [-8, -4, 0, 4, 8, 12, 16].map(x => {
    const px = pxX0607(x).toFixed(1)
    return `
      <line x1="${px}" y1="${Y1_0607}" x2="${px}" y2="${Y1_0607 + 5}" stroke="currentColor" stroke-width="1"/>
      <text x="${px}" y="${Y1_0607 + 16}" text-anchor="middle" font-size="7">${x}</text>
    `
  }).join('')
  const yVals = [0, yMax / 2, yMax]
  const yTicks = yVals.map(y => {
    const py = pxY0607(y, yMax).toFixed(1)
    return `
      <line x1="${X0_0607 - 5}" y1="${py}" x2="${X0_0607}" y2="${py}" stroke="currentColor" stroke-width="1"/>
      <text x="${X0_0607 - 9}" y="${(Number(py) + 2.5).toFixed(1)}" text-anchor="end" font-size="7">${y.toFixed(2)}</text>
    `
  }).join('')
  return `
    <line x1="${X0_0607}" y1="${Y0_0607}" x2="${X0_0607}" y2="${Y1_0607}" stroke="currentColor" stroke-width="1.2"/>
    <line x1="${X0_0607}" y1="${Y1_0607}" x2="${X1PX_0607}" y2="${Y1_0607}" stroke="currentColor" stroke-width="1.2"/>
    ${xTicks}${yTicks}
    <text x="${(X0_0607 + X1PX_0607) / 2}" y="${Y1_0607 + 30}" text-anchor="middle" font-size="7.5" font-weight="700">resolution_days</text>
    <text x="18" y="${(Y0_0607 + Y1_0607) / 2}" text-anchor="middle" font-size="7.5" font-weight="700" transform="rotate(-90 18 ${(Y0_0607 + Y1_0607) / 2})">density</text>
  `
}

function curvePath0607(mu, sigma, yMax) {
  const steps = 140
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const x = XMIN_0607 + (XMAX_0607 - XMIN_0607) * (i / steps)
    const y = gaussianPdf0607(x, mu, sigma)
    const px = pxX0607(x).toFixed(2)
    const py = pxY0607(Math.min(y, yMax), yMax).toFixed(2)
    d += (i === 0 ? `M${px},${py}` : ` L${px},${py}`)
  }
  return d
}

// Vertical shaded bands: split [XMIN,XMAX] at every QDA root inside the
// window, then classify each resulting interval by its own midpoint's
// density comparison -- this is what makes the shading correct even in
// degenerate cases (0, 1 or 2 roots) without special-casing them here.
function bandsSvg0607(mu0, sigma0, mu1, sigma1, yMax) {
  const roots = qdaRoots0607(mu0, sigma0, mu1, sigma1).filter(r => r > XMIN_0607 && r < XMAX_0607)
  const cuts = [XMIN_0607, ...roots, XMAX_0607]
  let out = ''
  for (let i = 0; i < cuts.length - 1; i++) {
    const a = cuts[i], b = cuts[i + 1]
    const cls = classAtPoint0607((a + b) / 2, mu0, sigma0, mu1, sigma1)
    const fill = cls === 1 ? 'var(--teal)' : 'var(--orange)'
    const opacity = cls === 1 ? 0.14 : 0.10
    out += `<rect x="${pxX0607(a).toFixed(1)}" y="${Y0_0607}" width="${(pxX0607(b) - pxX0607(a)).toFixed(1)}" height="${Y1_0607 - Y0_0607}" fill="${fill}" opacity="${opacity}"/>`
  }
  return out
}

function boundaryLinesSvg0607(mu0, sigma0, mu1, sigma1, yMax) {
  const lda = ldaBoundary0607(mu0, mu1)
  const roots = qdaRoots0607(mu0, sigma0, mu1, sigma1).filter(r => r > XMIN_0607 && r < XMAX_0607)
  let out = ''
  if (lda > XMIN_0607 && lda < XMAX_0607) {
    const px = pxX0607(lda).toFixed(1)
    out += `<line x1="${px}" y1="${Y0_0607}" x2="${px}" y2="${Y1_0607}" stroke="var(--ink)" stroke-width="1.6"/>`
    out += `<text x="${px}" y="${Y0_0607 - 5}" text-anchor="middle" font-size="7" font-weight="700" fill="var(--ink)">LDA ${lda.toFixed(3)}</text>`
  }
  roots.forEach((r, i) => {
    const px = pxX0607(r).toFixed(1)
    out += `<line x1="${px}" y1="${Y0_0607}" x2="${px}" y2="${Y1_0607}" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="4,3"/>`
    out += `<text x="${px}" y="${Y1_0607 + (i === 0 ? 42 : 52)}" text-anchor="middle" font-size="7" fill="var(--muted)">QDA ${r.toFixed(3)}</text>`
  })
  return out
}

function testMarkerSvg0607(x, mu0, sigma0, mu1, sigma1, yMax) {
  const px = pxX0607(x).toFixed(1)
  const f0 = gaussianPdf0607(x, mu0, sigma0)
  const f1 = gaussianPdf0607(x, mu1, sigma1)
  const topY = pxY0607(Math.min(Math.max(f0, f1), yMax), yMax).toFixed(1)
  return `
    <line x1="${px}" y1="${Y1_0607}" x2="${px}" y2="${topY}" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2" opacity="0.7"/>
    <circle cx="${px}" cy="${Y1_0607}" r="4" fill="currentColor"/>
    <text x="${px}" y="${Y1_0607 + 26}" text-anchor="middle" font-size="7" font-weight="700">x=${x.toFixed(2)}</text>
  `
}

// The disagreement zone the worked example demonstrates: the open interval
// between the LDA boundary and the nearest QDA root where the two models'
// predicted class differs. Only drawn for the two static figures, at the
// worked example's own fixed parameters -- not recomputed for arbitrary
// slider positions, since its whole point is to illustrate ONE specific,
// already-verified disagreement (x=3.7-3.9 days).
function disagreementZoneSvg0607() {
  const a = pxX0607(QDA_ROOT_HIGH_CITED_0607).toFixed(1)
  const b = pxX0607(LDA_BOUNDARY_CITED_0607).toFixed(1)
  return `
    <rect x="${a}" y="${Y0_0607}" width="${(Number(b) - Number(a)).toFixed(1)}" height="${Y1_0607 - Y0_0607}" fill="var(--ink)" opacity="0.10" stroke="var(--ink)" stroke-width="1" stroke-dasharray="1,2"/>
    <text x="${(Number(a) + Number(b)) / 2}" y="${Y0_0607 + 14}" text-anchor="middle" font-size="6.5" font-weight="700" fill="var(--ink)">DISAGREE</text>
  `
}

function densityPlotSvg0607({ mu0, sigma0, mu1, sigma1, testX, showTestPoint, highlightDisagreement, titleId, titleText, descText }) {
  const yMax = computeYMax0607(sigma0, sigma1)
  const p0 = curvePath0607(mu0, sigma0, yMax)
  const p1 = curvePath0607(mu1, sigma1, yMax)
  const peak0Px = { x: pxX0607(mu0).toFixed(1), y: pxY0607(Math.min(gaussianPdf0607(mu0, mu0, sigma0), yMax), yMax).toFixed(1) }
  const peak1Px = { x: pxX0607(mu1).toFixed(1), y: pxY0607(Math.min(gaussianPdf0607(mu1, mu1, sigma1), yMax), yMax).toFixed(1) }
  return `
    <svg class="vector-plane" viewBox="0 0 460 320" role="img" aria-labelledby="${titleId}-title ${titleId}-desc">
      <title id="${titleId}-title">${titleText}</title>
      <desc id="${titleId}-desc">${descText}</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        ${axisFrame0607(yMax)}
        ${bandsSvg0607(mu0, sigma0, mu1, sigma1, yMax)}
        ${highlightDisagreement ? disagreementZoneSvg0607() : ''}
        ${boundaryLinesSvg0607(mu0, sigma0, mu1, sigma1, yMax)}
        <path d="${p0}" fill="none" stroke="var(--orange)" stroke-width="2"/>
        <path d="${p1}" fill="none" stroke="var(--teal)" stroke-width="2"/>
        <text x="${peak0Px.x}" y="${(Number(peak0Px.y) - 8).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="700" fill="var(--orange)">class 0</text>
        <text x="${peak1Px.x}" y="${(Number(peak1Px.y) - 8).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="700" fill="var(--teal)">class 1</text>
        ${showTestPoint ? testMarkerSvg0607(testX, mu0, sigma0, mu1, sigma1, yMax) : ''}
      </g>
    </svg>
  `
}

// -- Static figure #1 (beginner, b04): the worked example, no interaction. --
function renderDensityStatic1_0607() {
  const wrap = document.querySelector('#wgDensityStatic1_0607')
  if (!wrap) return
  wrap.innerHTML = densityPlotSvg0607({
    mu0: MU0_DEFAULT_0607, sigma0: SIGMA0_DEFAULT_0607,
    mu1: MU1_DEFAULT_0607, sigma1: SIGMA1_DEFAULT_0607,
    testX: TESTX_DEFAULT_0607, showTestPoint: true, highlightDisagreement: false,
    titleId: 'c0607-b04-svg',
    titleText: 'Two class-conditional Gaussian densities for resolution_days, with the LDA and QDA boundaries marked',
    descText: 'A density plot with resolution_days on the horizontal axis and density on the vertical axis. A narrower orange curve peaks at 2 days (class 0, no relief); a wider, shorter teal curve peaks at 6 days (class 1, relief). A solid black vertical line sits at 4.0 days, labeled LDA. Two dashed vertical lines sit at approximately -2.327 and 3.660 days, labeled QDA. Shaded bands show orange in the middle region and teal in both outer tails, including the far-left tail below -2.327. A marker sits at x=3.8 days, between the QDA upper boundary and the LDA line.',
  })
}

// -- Static figure #2 (advanced, s07): the disagreement zone made explicit. --
function renderDensityStatic2_0607() {
  const wrap = document.querySelector('#wgDensityStatic2_0607')
  if (!wrap) return
  wrap.innerHTML = densityPlotSvg0607({
    mu0: MU0_DEFAULT_0607, sigma0: SIGMA0_DEFAULT_0607,
    mu1: MU1_DEFAULT_0607, sigma1: SIGMA1_DEFAULT_0607,
    testX: TESTX_DEFAULT_0607, showTestPoint: true, highlightDisagreement: true,
    titleId: 'c0607-s07-svg',
    titleText: 'The same two densities, with the LDA-versus-QDA disagreement zone shaded between 3.660 and 4.0 days',
    descText: 'The same density plot as the beginner figure, with a hatched gray rectangle drawn between 3.660 and 4.0 days and labeled DISAGREE -- the open interval where LDA still predicts no relief but QDA has already switched to predicting relief, because the region shading beneath it has already turned teal at that point.',
  })
}

// -- Interactive lab (s14): The Variance Gap. --
const mu0Slider0607 = document.querySelector('#wgMu0_0607')
const mu1Slider0607 = document.querySelector('#wgMu1_0607')
const sigma0Slider0607 = document.querySelector('#wgSigma0_0607')
const sigma1Slider0607 = document.querySelector('#wgSigma1_0607')
const testXSlider0607 = document.querySelector('#wgTestX_0607')
const mu0Out0607 = document.querySelector('#wgMu0Out_0607')
const mu1Out0607 = document.querySelector('#wgMu1Out_0607')
const sigma0Out0607 = document.querySelector('#wgSigma0Out_0607')
const sigma1Out0607 = document.querySelector('#wgSigma1Out_0607')
const testXOut0607 = document.querySelector('#wgTestXOut_0607')
const resetBtn0607 = document.querySelector('#wgReset_0607')
const plotWrap0607 = document.querySelector('#wgDensityPlot_0607')
const readout0607 = document.querySelector('#wgReadout_0607')
const verdict0607 = document.querySelector('#wgVerdict_0607')

function currentParams0607() {
  return {
    mu0: mu0Slider0607 ? Number(mu0Slider0607.value) : MU0_DEFAULT_0607,
    mu1: mu1Slider0607 ? Number(mu1Slider0607.value) : MU1_DEFAULT_0607,
    sigma0: sigma0Slider0607 ? Number(sigma0Slider0607.value) : SIGMA0_DEFAULT_0607,
    sigma1: sigma1Slider0607 ? Number(sigma1Slider0607.value) : SIGMA1_DEFAULT_0607,
    testX: testXSlider0607 ? Number(testXSlider0607.value) : TESTX_DEFAULT_0607,
  }
}

function renderLab0607() {
  if (!mu0Slider0607 || !mu1Slider0607 || !sigma0Slider0607 || !sigma1Slider0607 || !testXSlider0607) return
  const { mu0, mu1, sigma0, sigma1, testX } = currentParams0607()
  if (mu0Out0607) mu0Out0607.textContent = mu0.toFixed(1)
  if (mu1Out0607) mu1Out0607.textContent = mu1.toFixed(1)
  if (sigma0Out0607) sigma0Out0607.textContent = sigma0.toFixed(1)
  if (sigma1Out0607) sigma1Out0607.textContent = sigma1.toFixed(1)
  if (testXOut0607) testXOut0607.textContent = testX.toFixed(1)

  if (plotWrap0607) {
    plotWrap0607.innerHTML = densityPlotSvg0607({
      mu0, sigma0, mu1, sigma1, testX, showTestPoint: true, highlightDisagreement: false,
      titleId: 'c0607-lab-svg',
      titleText: 'Live density plot, updated as the mean, variance and test-point sliders move',
      descText: 'A live version of the two-Gaussian density plot, redrawn from the current slider values, with the LDA line, QDA dashed boundaries, and the test-point marker all recomputed on every change.',
    })
  }

  const ldaBoundary = ldaBoundary0607(mu0, mu1)
  const qdaRoots = qdaRoots0607(mu0, sigma0, mu1, sigma1)
  const ldaClass = ldaClassAtPoint0607(testX, mu0, mu1)
  const qdaClass = classAtPoint0607(testX, mu0, sigma0, mu1, sigma1)
  const agree = ldaClass === qdaClass

  if (readout0607) {
    const rootsText = qdaRoots.length === 0
      ? 'no real boundary in range -- one class dominates everywhere'
      : qdaRoots.map(r => r.toFixed(3)).join(', ')
    readout0607.innerHTML = `
      <div><span>LDA BOUNDARY</span><b>x = ${ldaBoundary.toFixed(3)} (sigma-invariant)</b></div>
      <div><span>QDA BOUNDARY POINT(S)</span><b>${qdaRoots.length}: ${rootsText}</b></div>
      <div class="wide"><span>TEST POINT x=${testX.toFixed(1)}</span><b>LDA predicts class ${ldaClass}, QDA predicts class ${qdaClass}</b></div>
    `
  }

  if (verdict0607) {
    verdict0607.className = `gate-verdict ${agree ? 'verdict-green' : 'verdict-amber'}`
    verdict0607.textContent = agree
      ? `AGREE -- both models predict class ${ldaClass} at x=${testX.toFixed(1)}.`
      : `DISAGREE -- LDA predicts class ${ldaClass} while QDA predicts class ${qdaClass} at x=${testX.toFixed(1)}, because the two class densities have already crossed at this x even though it's still on the LDA-class-${ldaClass} side of the midpoint.`
  }
}

mu0Slider0607?.addEventListener('input', renderLab0607)
mu1Slider0607?.addEventListener('input', renderLab0607)
sigma0Slider0607?.addEventListener('input', renderLab0607)
sigma1Slider0607?.addEventListener('input', renderLab0607)
testXSlider0607?.addEventListener('input', renderLab0607)

resetBtn0607?.addEventListener('click', () => {
  if (mu0Slider0607) mu0Slider0607.value = String(MU0_DEFAULT_0607)
  if (mu1Slider0607) mu1Slider0607.value = String(MU1_DEFAULT_0607)
  if (sigma0Slider0607) sigma0Slider0607.value = String(SIGMA0_DEFAULT_0607)
  if (sigma1Slider0607) sigma1Slider0607.value = String(SIGMA1_DEFAULT_0607)
  if (testXSlider0607) testXSlider0607.value = String(TESTX_DEFAULT_0607)
  renderLab0607()
})

renderDensityStatic1_0607()
renderDensityStatic2_0607()
renderLab0607()
