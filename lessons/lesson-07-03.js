// Module 07, Concept 03: Naive Bayes and the independence assumption.
// Two static diagrams (beginner + advanced) and Section 14's lab, The
// Independence Ledger -- a live re-run of the product-rule computation on
// one fixed CFPB test complaint whose three feature readings can be
// toggled, while the priors and per-feature likelihoods never change.

const advancedLesson0703 = document.querySelector('#advanced-lesson')
function syncAdvancedTarget0703() { if (advancedLesson0703) advancedLesson0703.open = location.hash === '#advanced-lesson' || /^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash) }
addEventListener('hashchange', syncAdvancedTarget0703)
syncAdvancedTarget0703()

// -- Beginner-core figure: the product-rule funnel on the b05/b06 worked example. --
function productFunnelSvg_0703() {
  return `
    <svg class="vector-plane" viewBox="0 0 460 260" role="img" aria-labelledby="c0703-funnel-title c0703-funnel-desc">
      <title id="c0703-funnel-title">Three per-feature lookups funnel into two class products</title>
      <desc id="c0703-funnel-desc">Attachment, repeat and channel readings for the test point each contribute one independently-estimated conditional probability. Multiplying the escalate-side terms gives 0.016; multiplying the resolve-side terms gives 0.064. Resolve wins.</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor" font-size="8">
        <rect x="15" y="15" width="120" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.2"/>
        <text x="75" y="30" text-anchor="middle" font-weight="700">attachment = yes</text>
        <text x="75" y="42" text-anchor="middle" font-size="7">P(yes|E)=0.8  P(yes|R)=0.2</text>
        <rect x="15" y="63" width="120" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.2"/>
        <text x="75" y="78" text-anchor="middle" font-weight="700">repeat = no</text>
        <text x="75" y="90" text-anchor="middle" font-size="7">P(no|E)=0.2  P(no|R)=0.8</text>
        <rect x="15" y="111" width="120" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.2"/>
        <text x="75" y="126" text-anchor="middle" font-weight="700">channel = web</text>
        <text x="75" y="138" text-anchor="middle" font-size="7">P(web|E)=0.2  P(web|R)=0.8</text>
        <text x="150" y="35" font-size="14">×</text>
        <text x="150" y="83" font-size="14">×</text>
        <text x="150" y="131" font-size="14">×</text>
        <line x1="165" y1="32" x2="230" y2="70" stroke="var(--teal)" stroke-width="1.2"/>
        <line x1="165" y1="80" x2="230" y2="80" stroke="var(--teal)" stroke-width="1.2"/>
        <line x1="165" y1="128" x2="230" y2="90" stroke="var(--teal)" stroke-width="1.2"/>
        <line x1="165" y1="32" x2="230" y2="150" stroke="var(--orange)" stroke-width="1.2"/>
        <line x1="165" y1="80" x2="230" y2="150" stroke="var(--orange)" stroke-width="1.2"/>
        <line x1="165" y1="128" x2="230" y2="150" stroke="var(--orange)" stroke-width="1.2"/>
        <rect x="235" y="55" width="200" height="40" rx="4" fill="var(--teal)" opacity="0.15" stroke="var(--teal)" stroke-width="1.4"/>
        <text x="335" y="72" text-anchor="middle" font-weight="700">ESCALATE: 0.5×0.8×0.2×0.2</text>
        <text x="335" y="86" text-anchor="middle" font-weight="700">= 0.016000</text>
        <rect x="235" y="130" width="200" height="40" rx="4" fill="var(--orange)" opacity="0.18" stroke="var(--orange)" stroke-width="1.4"/>
        <text x="335" y="147" text-anchor="middle" font-weight="700">RESOLVE: 0.5×0.2×0.8×0.8</text>
        <text x="335" y="161" text-anchor="middle" font-weight="700">= 0.064000</text>
        <text x="335" y="195" text-anchor="middle" font-size="8" font-weight="700">Normalized: 0.2 / 0.8 -- predicted class: RESOLVE</text>
      </g>
    </svg>
  `
}
function renderProductFunnel_0703() {
  const wrap = document.querySelector('#wgProductFigure_0703')
  if (!wrap) return
  wrap.innerHTML = productFunnelSvg_0703()
}

// -- Advanced figure (s07): factored per-feature terms vs. one joint density. --
function independenceDiagramSvg_0703() {
  return `
    <svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-labelledby="c0703-indep-title c0703-indep-desc">
      <title id="c0703-indep-title">The independence assumption replaces one joint density with three factored terms</title>
      <desc id="c0703-indep-desc">A crossed-out joint box, P of x1 x2 x3 given class, estimated all at once, contrasted with three separate per-feature boxes that are simply multiplied together -- the mechanism LDA and QDA do not use.</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor" font-size="8">
        <rect x="20" y="20" width="180" height="50" rx="4" fill="none" stroke="var(--orange)" stroke-width="1.4" stroke-dasharray="4,3"/>
        <text x="110" y="42" text-anchor="middle" font-weight="700">P(x1,x2,x3 | class)</text>
        <text x="110" y="56" text-anchor="middle" font-size="7">one joint density -- needs covariance (LDA/QDA)</text>
        <line x1="30" y1="30" x2="190" y2="60" stroke="var(--orange)" stroke-width="1.6"/>
        <line x1="30" y1="60" x2="190" y2="30" stroke="var(--orange)" stroke-width="1.6"/>
        <text x="230" y="48" font-size="14" font-weight="700">vs.</text>
        <rect x="260" y="8" width="130" height="30" rx="4" fill="none" stroke="var(--teal)" stroke-width="1.2"/>
        <text x="325" y="27" text-anchor="middle" font-size="7.5">P(x1 | class)</text>
        <rect x="260" y="45" width="130" height="30" rx="4" fill="none" stroke="var(--teal)" stroke-width="1.2"/>
        <text x="325" y="64" text-anchor="middle" font-size="7.5">P(x2 | class)</text>
        <rect x="260" y="82" width="130" height="30" rx="4" fill="none" stroke="var(--teal)" stroke-width="1.2"/>
        <text x="325" y="101" text-anchor="middle" font-size="7.5">P(x3 | class)</text>
        <line x1="325" y1="38" x2="325" y2="45" stroke="var(--teal)" stroke-width="1"/>
        <line x1="325" y1="75" x2="325" y2="82" stroke="var(--teal)" stroke-width="1"/>
        <rect x="230" y="130" width="190" height="34" rx="4" fill="var(--teal)" opacity="0.15" stroke="var(--teal)" stroke-width="1.4"/>
        <text x="325" y="148" text-anchor="middle" font-weight="700">∏ P(xi | class)</text>
        <text x="325" y="160" text-anchor="middle" font-size="7">three independently-estimated terms, multiplied</text>
        <line x1="325" y1="112" x2="325" y2="130" stroke="var(--teal)" stroke-width="1.2"/>
        <text x="110" y="90" text-anchor="middle" font-size="7" fill="var(--orange)">no covariance matrix, no inversion, ever</text>
      </g>
    </svg>
  `
}
function renderIndependenceDiagram_0703() {
  const wrap = document.querySelector('#wgIndependenceDiagram_0703')
  if (!wrap) return
  wrap.innerHTML = independenceDiagramSvg_0703()
}

// -- Section 14 lab: The Independence Ledger. --
// Fixed data from a 10-complaint set (4 escalate, 6 resolve). Only the
// three toggle groups below change; the priors and per-feature
// conditionals never do.
const TABLE_0703 = {
  classPrior: { escalate: 0.4, resolve: 0.6 },
  delay: {
    fast: { escalate: 1 / 4, resolve: 4 / 6 },
    slow: { escalate: 3 / 4, resolve: 2 / 6 },
  },
  sentiment: {
    calm: { escalate: 1 / 4, resolve: 5 / 6 },
    angry: { escalate: 3 / 4, resolve: 1 / 6 },
  },
  prior: {
    none: { escalate: 1 / 4, resolve: 5 / 6 },
    multiple: { escalate: 3 / 4, resolve: 1 / 6 },
  },
}

const STATE_DEFAULT_0703 = { delay: 'slow', sentiment: 'angry', prior: 'multiple' }
let state_0703 = { ...STATE_DEFAULT_0703 }

const delayButtons_0703 = [...document.querySelectorAll('#s14 [data-delay]')]
const sentimentButtons_0703 = [...document.querySelectorAll('#s14 [data-sentiment]')]
const priorButtons_0703 = [...document.querySelectorAll('#s14 [data-prior]')]
const resetBtn_0703 = document.querySelector('#wgReset_0703')

function setText_0703(id, text) {
  const el = document.querySelector('#' + id)
  if (el) el.textContent = text
}

function syncButtons_0703() {
  delayButtons_0703.forEach(btn => btn.classList.toggle('active', btn.dataset.delay === state_0703.delay))
  sentimentButtons_0703.forEach(btn => btn.classList.toggle('active', btn.dataset.sentiment === state_0703.sentiment))
  priorButtons_0703.forEach(btn => btn.classList.toggle('active', btn.dataset.prior === state_0703.prior))
}

function recompute_0703() {
  const delayRow = TABLE_0703.delay[state_0703.delay]
  const sentimentRow = TABLE_0703.sentiment[state_0703.sentiment]
  const priorRow = TABLE_0703.prior[state_0703.prior]

  const prodE = TABLE_0703.classPrior.escalate * delayRow.escalate * sentimentRow.escalate * priorRow.escalate
  const prodR = TABLE_0703.classPrior.resolve * delayRow.resolve * sentimentRow.resolve * priorRow.resolve
  const total = prodE + prodR
  const pctE = (prodE / total) * 100
  const pctR = (prodR / total) * 100

  setText_0703('wgLedgerEPrior_0703', TABLE_0703.classPrior.escalate.toFixed(6))
  setText_0703('wgLedgerRPrior_0703', TABLE_0703.classPrior.resolve.toFixed(6))
  setText_0703('wgLedgerEDelay_0703', delayRow.escalate.toFixed(6))
  setText_0703('wgLedgerRDelay_0703', delayRow.resolve.toFixed(6))
  setText_0703('wgLedgerESent_0703', sentimentRow.escalate.toFixed(6))
  setText_0703('wgLedgerRSent_0703', sentimentRow.resolve.toFixed(6))
  setText_0703('wgLedgerEComp_0703', priorRow.escalate.toFixed(6))
  setText_0703('wgLedgerRComp_0703', priorRow.resolve.toFixed(6))
  setText_0703('wgLedgerEProduct_0703', prodE.toFixed(6))
  setText_0703('wgLedgerRProduct_0703', prodR.toFixed(6))

  setText_0703('wgReadoutE_0703', pctE.toFixed(1) + '%')
  setText_0703('wgReadoutR_0703', pctR.toFixed(1) + '%')

  const verdict = document.querySelector('#wgVerdict_0703')
  if (verdict) {
    if (prodE > prodR) {
      verdict.className = 'gate-verdict verdict-red'
      verdict.textContent = 'Naive Bayes predicts: ESCALATE'
    } else {
      verdict.className = 'gate-verdict verdict-green'
      verdict.textContent = 'Naive Bayes predicts: RESOLVE'
    }
  }
}

delayButtons_0703.forEach(btn => btn.addEventListener('click', () => {
  state_0703.delay = btn.dataset.delay
  syncButtons_0703()
  recompute_0703()
}))
sentimentButtons_0703.forEach(btn => btn.addEventListener('click', () => {
  state_0703.sentiment = btn.dataset.sentiment
  syncButtons_0703()
  recompute_0703()
}))
priorButtons_0703.forEach(btn => btn.addEventListener('click', () => {
  state_0703.prior = btn.dataset.prior
  syncButtons_0703()
  recompute_0703()
}))
resetBtn_0703?.addEventListener('click', () => {
  state_0703 = { ...STATE_DEFAULT_0703 }
  syncButtons_0703()
  recompute_0703()
})

syncButtons_0703()
recompute_0703()
renderProductFunnel_0703()
renderIndependenceDiagram_0703()
