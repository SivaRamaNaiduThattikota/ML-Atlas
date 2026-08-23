// Section 14's lab: The Break-Even Line. Two independent continuous sliders
// (minority capture rate, majority false-flag rate) feeding one live
// algebraic formula (deltaE = TP - FP) against a derived break-even
// threshold -- a genuinely different interaction shape from every prior
// Module 04 lab's single-select-plus-secondary-control pattern. Every
// number below was computed once via an executed Node.js script and
// independently checked against the algebraic identity before use.

const N_MINORITY_0501=223
const N_MAJORITY_0501=777
const N_TOTAL_0501=1000
const FLOOR_ERROR_0501=223
const FLOOR_ACC_0501=0.777

const rtpSlider0501=document.querySelector('#wgRTP_0501')
const rfpSlider0501=document.querySelector('#wgRFP_0501')
const rtpOut0501=document.querySelector('#wgRTPOut_0501')
const rfpOut0501=document.querySelector('#wgRFPOut_0501')
const readout0501=document.querySelector('#wgBreakevenReadout_0501')
const verdict0501=document.querySelector('#wgBreakevenVerdict_0501')
const trackWrap0501=document.querySelector('#wgBreakevenTrack_0501')

function render0501(){
  const rTP=Number(rtpSlider0501.value)/100
  const rFP=Number(rfpSlider0501.value)/100
  if(rtpOut0501)rtpOut0501.textContent=(rTP*100).toFixed(1)+'%'
  if(rfpOut0501)rfpOut0501.textContent=(rFP*100).toFixed(1)+'%'

  const TP=rTP*N_MINORITY_0501
  const FP=rFP*N_MAJORITY_0501
  const deltaE=TP-FP
  const newError=FLOOR_ERROR_0501-deltaE
  const newAccuracy=(N_TOTAL_0501-newError)/N_TOTAL_0501
  const breakEvenRTP=rFP*(N_MAJORITY_0501/N_MINORITY_0501)

  if(readout0501){
    readout0501.innerHTML=`
      <div><span>TP (caught)</span><b>${TP.toFixed(2)}</b></div>
      <div><span>FP (false alarms)</span><b>${FP.toFixed(2)}</b></div>
      <div><span>ΔE = TP − FP</span><b style="color:${deltaE>0?'var(--green)':'var(--orange)'}">${deltaE>=0?'+':''}${deltaE.toFixed(2)}</b></div>
      <div><span>NEW TOTAL ERROR</span><b>${newError.toFixed(2)} <small>(floor: ${FLOOR_ERROR_0501})</small></b></div>
      <div><span>NEW ACCURACY</span><b>${(newAccuracy*100).toFixed(2)}% <small>(floor: ${(FLOOR_ACC_0501*100).toFixed(2)}%)</small></b></div>
      <div><span>BREAK-EVEN CAPTURE RATE NEEDED AT THIS FALSE-FLAG RATE</span><b>${(breakEvenRTP*100).toFixed(2)}%</b></div>
    `
  }

  if(verdict0501){
    verdict0501.className='callout'+(deltaE>0?'':' warning')
    if(deltaE>0){
      verdict0501.innerHTML=`<b>BEATS THE NAIVE FLOOR</b> -- naive training would actually keep this move: error drops from ${FLOOR_ERROR_0501} to ${newError.toFixed(2)}, accuracy rises to ${(newAccuracy*100).toFixed(2)}%.`
    }else if(deltaE===0){
      verdict0501.innerHTML=`<b>EXACTLY TIES THE NAIVE FLOOR</b> -- same total error (${FLOOR_ERROR_0501}), same accuracy (${(FLOOR_ACC_0501*100).toFixed(2)}%), different composition. This is exactly where Module 02's own Model B sits.`
    }else{
      verdict0501.innerHTML=`<b>NAIVE TRAINING REVERTS TOWARD MAJORITY-ONLY</b> -- this move raises total error (from ${FLOOR_ERROR_0501} to ${newError.toFixed(2)}); an unweighted objective has no reason to make it, and gravitates back to predicting the majority class.`
    }
  }

  if(trackWrap0501){
    const ratio=rFP>0?rTP/rFP:(rTP>0?Infinity:0)
    const breakEvenRatio=N_MAJORITY_0501/N_MINORITY_0501
    const maxRatio=6
    const clampedRatio=Math.min(ratio,maxRatio)
    const plotX0=40,plotW=380
    const X=r=>(plotX0+Math.min(r,maxRatio)/maxRatio*plotW).toFixed(1)
    const markerX=isFinite(ratio)?X(clampedRatio):X(maxRatio)
    const note=rFP===0
      ?(rTP>0?'No false-flag risk at all -- any capture is a pure win (ΔE=TP&gt;0).':'Both rates at zero -- no move to evaluate yet.')
      :`Current ratio: ${ratio.toFixed(2)}× (break-even: ${breakEvenRatio.toFixed(2)}×)`
    trackWrap0501.innerHTML=`
      <svg class="vector-plane" viewBox="0 0 460 90" role="img" aria-label="A track from ratio 0 to 6, with a fixed break-even marker at 3.48 and a moving marker at the current capture-to-false-flag ratio">
        <line x1="${plotX0}" y1="50" x2="${plotX0+plotW}" y2="50" stroke="currentColor" stroke-width="1.5"/>
        <line x1="${X(breakEvenRatio)}" y1="30" x2="${X(breakEvenRatio)}" y2="70" stroke="var(--orange)" stroke-width="2"/>
        <text x="${X(breakEvenRatio)}" y="24" font-size="9" text-anchor="middle" fill="var(--orange)" font-weight="700">break-even 3.48×</text>
        ${rFP>0||rTP>0?`<circle cx="${markerX}" cy="50" r="6" fill="${deltaE>0?'var(--green)':'var(--orange)'}" stroke="currentColor" stroke-width="1.5"/>`:''}
        <text x="${plotX0}" y="86" font-size="8">0×</text>
        <text x="${plotX0+plotW}" y="86" font-size="8" text-anchor="end">6×</text>
      </svg>
      <p style="margin-top:4px;font:11px 'IBM Plex Mono',monospace;color:var(--muted)">${note}</p>
    `
  }
}

rtpSlider0501?.addEventListener('input',render0501)
rfpSlider0501?.addEventListener('input',render0501)
render0501()
