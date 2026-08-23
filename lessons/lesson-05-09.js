// Section 14's lab: The Product Panel. Four products carry their own fixed
// (n_minority, n_majority), so the weight ratio recomputes live from Concept
// 03's formula but never moves with the sliders. Two cost sliders drive
// Concept 05's threshold formula, which never moves with the product picked.
// The two axes are shown moving independently on purpose -- that independence
// is this concept's whole point.

const PRODUCTS_0509 = {
  credit_reporting: { label: 'Credit reporting', nMin: 60, nMaj: 340 },
  debt_collection: { label: 'Debt collection', nMin: 57, nMaj: 243 },
  mortgage: { label: 'Mortgage', nMin: 76, nMaj: 124 },
  credit_card: { label: 'Credit card', nMin: 30, nMaj: 70 },
}

const GLOBAL_RATIO_0509 = 3.4843049327354256 // Concept 03's pooled 223/777 ratio
const GLOBAL_T_0509 = 1 / 11 // Concept 05's pooled $500/$50 threshold, ≈0.0909

let activeProduct0509 = 'mortgage'

function weightStats0509(nMin, nMaj) {
  const n = nMin + nMaj
  const wMin = n / (2 * nMin)
  const wMaj = n / (2 * nMaj)
  return { n, wMin, wMaj, ratio: wMin / wMaj }
}

const productButtons0509 = [...document.querySelectorAll('#wgProductGroup_0509 [data-product]')]
const presetButtons0509 = [...document.querySelectorAll('#wgPresetGroup_0509 [data-preset]')]
const cfnSlider0509 = document.querySelector('#wgCfn_0509')
const cfpSlider0509 = document.querySelector('#wgCfp_0509')
const cfnOut0509 = document.querySelector('#wgCfnOut_0509')
const cfpOut0509 = document.querySelector('#wgCfpOut_0509')
const barsWrap0509 = document.querySelector('#wgPanelBars_0509')
const readout0509 = document.querySelector('#wgPanelReadout_0509')
const verdict0509 = document.querySelector('#wgPanelVerdict_0509')

function setActiveProduct0509(key) {
  activeProduct0509 = key
  productButtons0509.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.product === key)
  })
  render0509()
}

function render0509() {
  const cfn = Number(cfnSlider0509.value)
  const cfp = Number(cfpSlider0509.value)
  if (cfnOut0509) cfnOut0509.textContent = `$${cfn}`
  if (cfpOut0509) cfpOut0509.textContent = `$${cfp}`

  const product = PRODUCTS_0509[activeProduct0509]
  const stats = weightStats0509(product.nMin, product.nMaj)
  const reliefRate = (product.nMin / stats.n) * 100
  const tStar = cfp / (cfp + cfn)

  if (readout0509) {
    readout0509.innerHTML = `
      <div><span>SELECTED PRODUCT</span><b>${product.label}</b></div>
      <div><span>n / RELIEF RATE</span><b>${stats.n} / ${reliefRate.toFixed(1)}%</b></div>
      <div><span>w_min / w_maj (base-rate axis)</span><b>${stats.wMin.toFixed(4)} / ${stats.wMaj.toFixed(4)}</b></div>
      <div><span>WEIGHT RATIO</span><b>${stats.ratio.toFixed(4)}</b></div>
      <div><span>t* (cost axis, today's sliders)</span><b>${tStar.toFixed(4)}</b></div>
      <div><span>GLOBAL FIX -- ratio / t*</span><b>${GLOBAL_RATIO_0509.toFixed(4)} / ${GLOBAL_T_0509.toFixed(4)}</b></div>
    `
  }

  if (barsWrap0509) {
    const maxRatio = Math.max(stats.ratio, GLOBAL_RATIO_0509, 1) * 1.15
    const maxT = Math.max(tStar, GLOBAL_T_0509, 0.05) * 1.15
    const len = 220
    const ratioGlobalLen = (GLOBAL_RATIO_0509 / maxRatio * len).toFixed(1)
    const ratioProductLen = (stats.ratio / maxRatio * len).toFixed(1)
    const tGlobalLen = (GLOBAL_T_0509 / maxT * len).toFixed(1)
    const tLiveLen = (tStar / maxT * len).toFixed(1)
    barsWrap0509.innerHTML = `
      <svg class="vector-plane" viewBox="0 0 460 130" role="img" aria-label="Weight ratio and threshold, global fix versus selected product">
        <g font-family="IBM Plex Mono, monospace" font-size="8" fill="currentColor">
          <text x="10" y="14" font-weight="700">WEIGHT RATIO -- BASE-RATE AXIS</text>
          <text x="10" y="26">Global fix</text>
          <rect x="90" y="20" width="${ratioGlobalLen}" height="12" fill="var(--muted)" fill-opacity="0.5"/>
          <text x="${96 + Number(ratioGlobalLen)}" y="30">${GLOBAL_RATIO_0509.toFixed(3)}</text>
          <text x="10" y="42">${product.label}</text>
          <rect x="90" y="36" width="${ratioProductLen}" height="12" fill="var(--orange)"/>
          <text x="${96 + Number(ratioProductLen)}" y="46">${stats.ratio.toFixed(3)}</text>
          <text x="10" y="68" font-weight="700">THRESHOLD -- COST AXIS</text>
          <text x="10" y="80">Global fix</text>
          <rect x="90" y="74" width="${tGlobalLen}" height="12" fill="var(--muted)" fill-opacity="0.5"/>
          <text x="${96 + Number(tGlobalLen)}" y="84">${GLOBAL_T_0509.toFixed(4)}</text>
          <text x="10" y="96">Today's sliders</text>
          <rect x="90" y="90" width="${tLiveLen}" height="12" fill="var(--orange)"/>
          <text x="${96 + Number(tLiveLen)}" y="100">${tStar.toFixed(4)}</text>
        </g>
      </svg>
    `
  }

  if (verdict0509) {
    const ratioGapPct = Math.abs(stats.ratio - GLOBAL_RATIO_0509) / GLOBAL_RATIO_0509 * 100
    const tGapPct = Math.abs(tStar - GLOBAL_T_0509) / GLOBAL_T_0509 * 100
    const ratioWord = ratioGapPct > 20 ? 'FAR FROM' : 'CLOSE TO'
    const tWord = tGapPct > 20 ? 'FAR FROM' : 'CLOSE TO'
    verdict0509.innerHTML = `
      <b>${product.label}'s weight ratio is ${ratioWord} the global fix</b> (${stats.ratio.toFixed(3)} vs. ${GLOBAL_RATIO_0509.toFixed(3)}) -- driven entirely by ${product.label.toLowerCase()}'s own relief rate (${reliefRate.toFixed(1)}% vs. 22.3% global), never by today's sliders.
      <br><b>Its threshold is ${tWord} the global fix</b> (${tStar.toFixed(4)} vs. ${GLOBAL_T_0509.toFixed(4)}) -- driven entirely by today's slider costs ($${cfp}/$${cfn}), never by which product is selected. A weight-ratio gap alone never implies a threshold gap; only moving the cost sliders does.
    `
  }
}

productButtons0509.forEach(btn => {
  btn.addEventListener('click', () => setActiveProduct0509(btn.dataset.product))
})

presetButtons0509.forEach(btn => {
  btn.addEventListener('click', () => {
    const preset = btn.dataset.preset
    if (preset === 'global') {
      cfnSlider0509.value = 500
      cfpSlider0509.value = 50
    } else if (preset === 'mortgage') {
      cfnSlider0509.value = 800
      cfpSlider0509.value = 50
      activeProduct0509 = 'mortgage'
    } else if (preset === 'debt_collection') {
      cfnSlider0509.value = 200
      cfpSlider0509.value = 50
      activeProduct0509 = 'debt_collection'
    }
    productButtons0509.forEach(b => b.classList.toggle('active', b.dataset.product === activeProduct0509))
    render0509()
  })
})

cfnSlider0509?.addEventListener('input', render0509)
cfpSlider0509?.addEventListener('input', render0509)

setActiveProduct0509('mortgage')
