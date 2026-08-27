// Module 07, Concept 04: Naive Bayes for text classification.
// Two static diagrams (beginner + advanced) and Section 14's lab, The
// Word-Count Verdict -- three word-count sliders and a Laplace-smoothing
// toggle re-run the multinomial score live on a fixed 5-doc-per-class
// training set, {refund, urgent, thanks}.

const advancedLesson0704 = document.querySelector('#advanced-lesson')
function syncAdvancedTarget0704() { if (advancedLesson0704) advancedLesson0704.open = location.hash === '#advanced-lesson' || /^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash) }
addEventListener('hashchange', syncAdvancedTarget0704)
syncAdvancedTarget0704()

// -- Beginner-core figure: the zero-frequency crash, then the smoothing fix. --
function crashFigureSvg_0704() {
  return `
    <svg class="vector-plane" viewBox="0 0 460 260" role="img" aria-labelledby="c0704-crash-title c0704-crash-desc">
      <title id="c0704-crash-title">Raw frequencies crash to zero, Laplace smoothing recovers a real posterior</title>
      <desc id="c0704-crash-desc">Escalate and resolve both hit an exact zero product on the test document refund error thanks, because thanks never occurred in escalate training and error never occurred in resolve training. Adding one to every count and five to every denominator recovers 0.615385 for escalate and 0.384615 for resolve.</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor" font-size="8">
        <text x="15" y="18" font-weight="700" font-size="9">UNSMOOTHED -- test doc "refund error thanks"</text>
        <rect x="15" y="26" width="200" height="40" rx="4" fill="none" stroke="var(--orange)" stroke-width="1.4"/>
        <text x="115" y="42" text-anchor="middle" font-weight="700">ESCALATE: .333×.333×0</text>
        <text x="115" y="56" text-anchor="middle" font-weight="700">= 0.000000</text>
        <rect x="235" y="26" width="200" height="40" rx="4" fill="none" stroke="var(--orange)" stroke-width="1.4"/>
        <text x="335" y="42" text-anchor="middle" font-weight="700">RESOLVE: .111×0×.444</text>
        <text x="335" y="56" text-anchor="middle" font-weight="700">= 0.000000</text>
        <text x="230" y="90" text-anchor="middle" font-size="8" fill="var(--orange)">0 vs. 0 -- unclassifiable by raw frequency alone</text>
        <line x1="230" y1="100" x2="230" y2="120" stroke="currentColor" stroke-width="1.2"/>
        <text x="230" y="132" text-anchor="middle" font-size="8" font-weight="700">+ Laplace smoothing (alpha=1, n=5)</text>
        <rect x="15" y="150" width="200" height="40" rx="4" fill="var(--teal)" opacity="0.15" stroke="var(--teal)" stroke-width="1.4"/>
        <text x="115" y="166" text-anchor="middle" font-weight="700">ESCALATE: 4/14×4/14×1/14</text>
        <text x="115" y="180" text-anchor="middle" font-weight="700">joint = 0.002915</text>
        <rect x="235" y="150" width="200" height="40" rx="4" fill="var(--teal)" opacity="0.15" stroke="var(--teal)" stroke-width="1.4"/>
        <text x="335" y="166" text-anchor="middle" font-weight="700">RESOLVE: 2/14×1/14×5/14</text>
        <text x="335" y="180" text-anchor="middle" font-weight="700">joint = 0.001822</text>
        <text x="230" y="212" text-anchor="middle" font-size="9" font-weight="700">Normalized: 0.615385 / 0.384615 -- predicted class: ESCALATE</text>
      </g>
    </svg>
  `
}
function renderCrashFigure_0704() {
  const wrap = document.querySelector('#wgCrashFigure_0704')
  if (!wrap) return
  wrap.innerHTML = crashFigureSvg_0704()
}

// -- Advanced figure would reuse the same visual bar; this concept ships one
//    figure in the beginner core (above) and reuses the lab's own live
//    readout (s14) as its advanced-section visual, per the lesson's own
//    lesson-bridge callout pointing at #s14. --

// -- Section 14 lab: The Word-Count Verdict. --
// Fixed training data, hardcoded, matching the plan exactly.
const VOCAB_SIZE_0704 = 3
const ESCALATE_TOTAL_WORDS_0704 = 14
const RESOLVE_TOTAL_WORDS_0704 = 13
const ESCALATE_COUNTS_0704 = { refund: 7, urgent: 7, thanks: 0 }
const RESOLVE_COUNTS_0704 = { refund: 2, urgent: 1, thanks: 10 }
const PRIOR_0704 = 0.5

const sliderRefund_0704 = document.querySelector('#wgWordRefund_0704')
const sliderUrgent_0704 = document.querySelector('#wgWordUrgent_0704')
const sliderThanks_0704 = document.querySelector('#wgWordThanks_0704')
const smoothingButtons_0704 = [...document.querySelectorAll('#s14 [data-smoothing]')]
const resetBtn_0704 = document.querySelector('#wgReset_0704')

function setText_0704(id, text) {
  const el = document.querySelector('#' + id)
  if (el) el.textContent = text
}

function pWord_0704(counts, total, word, smoothingOn) {
  const count = counts[word]
  if (smoothingOn) return (count + 1) / (total + VOCAB_SIZE_0704)
  return count / total
}

function currentSmoothingOn_0704() {
  const onBtn = smoothingButtons_0704.find(btn => btn.dataset.smoothing === 'on')
  return !!(onBtn && onBtn.classList.contains('active'))
}

function syncSmoothingButtons_0704(onState) {
  smoothingButtons_0704.forEach(btn => btn.classList.toggle('active', (btn.dataset.smoothing === 'on') === onState))
}

function render_0704() {
  const nRefund = Number(sliderRefund_0704?.value ?? 1)
  const nUrgent = Number(sliderUrgent_0704?.value ?? 1)
  const nThanks = Number(sliderThanks_0704?.value ?? 1)
  setText_0704('wgWordRefundOut_0704', String(nRefund))
  setText_0704('wgWordUrgentOut_0704', String(nUrgent))
  setText_0704('wgWordThanksOut_0704', String(nThanks))

  const smoothingOn = currentSmoothingOn_0704()

  const pRefundE = pWord_0704(ESCALATE_COUNTS_0704, ESCALATE_TOTAL_WORDS_0704, 'refund', smoothingOn)
  const pUrgentE = pWord_0704(ESCALATE_COUNTS_0704, ESCALATE_TOTAL_WORDS_0704, 'urgent', smoothingOn)
  const pThanksE = pWord_0704(ESCALATE_COUNTS_0704, ESCALATE_TOTAL_WORDS_0704, 'thanks', smoothingOn)
  const pRefundR = pWord_0704(RESOLVE_COUNTS_0704, RESOLVE_TOTAL_WORDS_0704, 'refund', smoothingOn)
  const pUrgentR = pWord_0704(RESOLVE_COUNTS_0704, RESOLVE_TOTAL_WORDS_0704, 'urgent', smoothingOn)
  const pThanksR = pWord_0704(RESOLVE_COUNTS_0704, RESOLVE_TOTAL_WORDS_0704, 'thanks', smoothingOn)

  setText_0704('wgWordRefundLabel_0704', `refund (×${nRefund})`)
  setText_0704('wgWordUrgentLabel_0704', `urgent (×${nUrgent})`)
  setText_0704('wgWordThanksLabel_0704', `thanks (×${nThanks})`)

  setText_0704('wgWordRefundE_0704', pRefundE.toFixed(6))
  setText_0704('wgWordRefundR_0704', pRefundR.toFixed(6))
  setText_0704('wgWordUrgentE_0704', pUrgentE.toFixed(6))
  setText_0704('wgWordUrgentR_0704', pUrgentR.toFixed(6))
  setText_0704('wgWordThanksE_0704', pThanksE.toFixed(6))
  setText_0704('wgWordThanksR_0704', pThanksR.toFixed(6))

  const scoreE = PRIOR_0704 * Math.pow(pRefundE, nRefund) * Math.pow(pUrgentE, nUrgent) * Math.pow(pThanksE, nThanks)
  const scoreR = PRIOR_0704 * Math.pow(pRefundR, nRefund) * Math.pow(pUrgentR, nUrgent) * Math.pow(pThanksR, nThanks)
  setText_0704('wgWordProductE_0704', scoreE.toFixed(8))
  setText_0704('wgWordProductR_0704', scoreR.toFixed(8))

  const total = scoreE + scoreR
  const verdict = document.querySelector('#wgVerdict_0704')
  if (total > 0) {
    const postE = scoreE / total
    const postR = scoreR / total
    setText_0704('wgReadoutE_0704', postE.toFixed(6))
    setText_0704('wgReadoutR_0704', postR.toFixed(6))
    if (verdict) {
      if (!smoothingOn && scoreE === 0) {
        verdict.className = 'gate-verdict verdict-red'
        verdict.textContent = "Escalate's raw product is exactly 0 -- 'thanks' never appeared in escalate training data, and one zero in the product zeroes the whole class score. Resolve wins by default, not by a real comparison."
      } else if (postE > postR) {
        verdict.className = 'gate-verdict verdict-green'
        verdict.textContent = `Predicted: ESCALATE -- P(escalate|doc)=${postE.toFixed(6)}, P(resolve|doc)=${postR.toFixed(6)}`
      } else {
        verdict.className = 'gate-verdict verdict-green'
        verdict.textContent = `Predicted: RESOLVE -- P(escalate|doc)=${postE.toFixed(6)}, P(resolve|doc)=${postR.toFixed(6)}`
      }
    }
  } else {
    setText_0704('wgReadoutE_0704', 'undefined')
    setText_0704('wgReadoutR_0704', 'undefined')
    if (verdict) {
      verdict.className = 'gate-verdict verdict-red'
      verdict.textContent = "Escalate's raw product is exactly 0 -- 'thanks' never appeared in escalate training data, and one zero in the product zeroes the whole class score. Resolve wins by default, not by a real comparison."
    }
  }
}

sliderRefund_0704?.addEventListener('input', render_0704)
sliderUrgent_0704?.addEventListener('input', render_0704)
sliderThanks_0704?.addEventListener('input', render_0704)
smoothingButtons_0704.forEach(btn => btn.addEventListener('click', () => {
  syncSmoothingButtons_0704(btn.dataset.smoothing === 'on')
  render_0704()
}))
resetBtn_0704?.addEventListener('click', () => {
  if (sliderRefund_0704) sliderRefund_0704.value = '1'
  if (sliderUrgent_0704) sliderUrgent_0704.value = '1'
  if (sliderThanks_0704) sliderThanks_0704.value = '1'
  syncSmoothingButtons_0704(false)
  render_0704()
})

syncSmoothingButtons_0704(false)
render_0704()
renderCrashFigure_0704()
