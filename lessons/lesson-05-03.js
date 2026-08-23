// Section 14's lab: The Weight Dial. A slider controlling a NORMALIZED
// weight ratio (w_majority pinned at 1.0, w_minority = slider value) plus
// a pair/batch view toggle -- rendering live pull-magnitude bars and a
// 4-state verdict band keyed to scikit-learn's real "balanced" ratio for
// CFPB's split. Every fixed base-loss number below was computed once via
// two independently-structured Node.js scripts and hardcoded here; only
// the weighted quantities recompute live from the slider.

const LOSS_M1_J1_0503=1.0498221244986778
const LOSS_J2_0503=0.05129329438755058
const BALANCED_RATIO_0503=3.4843049327354256

const ratioSlider0503=document.querySelector('#wgWeightRatio_0503')
const ratioOut0503=document.querySelector('#wgWeightRatioOut_0503')
const viewButtons0503=[...document.querySelectorAll('#s14 [data-view]')]
const barsWrap0503=document.querySelector('#wgWeightBars_0503')
const readout0503=document.querySelector('#wgWeightReadout_0503')
const verdict0503=document.querySelector('#wgWeightVerdict_0503')

let currentView0503='pair'

function syncButtons0503(){
  viewButtons0503.forEach(btn=>btn.classList.toggle('active',btn.dataset.view===currentView0503))
}

function verdictBand0503(ratio){
  if(Math.abs(ratio-1.0)<=0.05)return {label:'UNWEIGHTED',text:`Identical to plain training -- M1's and J1's mistakes pull the shared parameters equally hard despite the class imbalance.`,warn:false}
  if(Math.abs(ratio-BALANCED_RATIO_0503)<=0.05)return {label:"MATCHES 'BALANCED'",text:`Exactly scikit-learn's automatic inverse-class-frequency ratio for CFPB's real 223/777 split.`,warn:false}
  if(ratio>BALANCED_RATIO_0503+0.05)return {label:"BEYOND 'BALANCED'",text:`Deliberately over-correcting past inverse frequency -- defensible only with a stakeholder-supplied cost asymmetry (Concept 05's cost-sensitive framing, named forward only).`,warn:true}
  return {label:"UNDER 'BALANCED'",text:`Pulling harder toward minority mistakes than plain training, but still short of scikit-learn's own inverse-frequency ratio for CFPB's real split.`,warn:false}
}

function render0503(){
  const ratio=Number(ratioSlider0503.value)
  if(ratioOut0503)ratioOut0503.textContent=ratio.toFixed(2)

  const wMin=ratio, wMaj=1.0
  const weightedM1=wMin*LOSS_M1_J1_0503
  const weightedJ1=wMaj*LOSS_M1_J1_0503

  if(currentView0503==='pair'){
    if(readout0503){
      readout0503.innerHTML=`
        <div><span>RATIO (w_minority : w_majority)</span><b>${ratio.toFixed(2)} : 1.00</b></div>
        <div><span>WEIGHTED LOSS — M1 (minority)</span><b>${weightedM1.toFixed(4)}</b></div>
        <div><span>WEIGHTED LOSS — J1 (majority)</span><b>${weightedJ1.toFixed(4)}</b></div>
      `
    }
    if(barsWrap0503){
      const maxLen=200
      const scale=Math.max(weightedM1,weightedJ1,1)
      barsWrap0503.innerHTML=`
        <svg class="vector-plane" viewBox="0 0 460 100" role="img" aria-label="Pull magnitude bars for M1 and J1 at the current weight ratio">
          <text x="10" y="16" font-size="9" font-family="IBM Plex Mono, monospace" font-weight="700">M1 (minority)</text>
          <rect x="10" y="22" width="${(weightedM1/scale*maxLen).toFixed(1)}" height="20" fill="var(--orange)"/>
          <text x="${20+(weightedM1/scale*maxLen)}" y="37" font-size="8" font-family="IBM Plex Mono, monospace">${weightedM1.toFixed(4)}</text>
          <text x="10" y="66" font-size="9" font-family="IBM Plex Mono, monospace" font-weight="700">J1 (majority)</text>
          <rect x="10" y="72" width="${(weightedJ1/scale*maxLen).toFixed(1)}" height="20" fill="var(--muted)" fill-opacity="0.5"/>
          <text x="${20+(weightedJ1/scale*maxLen)}" y="87" font-size="8" font-family="IBM Plex Mono, monospace">${weightedJ1.toFixed(4)}</text>
        </svg>
      `
    }
  }else{
    const weightedTotal=weightedM1+weightedJ1+wMaj*LOSS_J2_0503
    const share=weightedM1/weightedTotal
    if(readout0503){
      readout0503.innerHTML=`
        <div><span>RATIO (w_minority : w_majority)</span><b>${ratio.toFixed(2)} : 1.00</b></div>
        <div><span>WEIGHTED BATCH TOTAL (M1+J1+J2)</span><b>${weightedTotal.toFixed(4)}</b></div>
        <div><span>M1'S SHARE OF THE TOTAL</span><b>${(share*100).toFixed(2)}%</b></div>
      `
    }
    if(barsWrap0503){
      const pct=(share*100).toFixed(2)
      barsWrap0503.innerHTML=`
        <svg class="vector-plane" viewBox="0 0 460 70" role="img" aria-label="M1's share of the weighted 3-row batch total at the current ratio">
          <rect x="10" y="20" width="380" height="24" fill="none" stroke="currentColor" stroke-width="1"/>
          <rect x="10" y="20" width="${3.8*share*100}" height="24" fill="var(--orange)"/>
          <text x="200" y="55" font-size="9" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="700">M1's share: ${pct}%</text>
        </svg>
      `
    }
  }

  if(verdict0503){
    const band=verdictBand0503(ratio)
    verdict0503.className='callout'+(band.warn?' warning':'')
    verdict0503.innerHTML=`<b>${band.label}</b> ${band.text}`
  }
}

viewButtons0503.forEach(btn=>btn.addEventListener('click',()=>{
  currentView0503=btn.dataset.view
  syncButtons0503()
  render0503()
}))
ratioSlider0503?.addEventListener('input',render0503)

syncButtons0503()
render0503()
