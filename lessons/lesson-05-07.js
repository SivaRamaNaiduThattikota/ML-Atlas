// Section 14's lab: The Difficulty Dial. A p_t slider (how confidently
// correct a row already is) plus a gamma toggle -- the down-weighting
// factor 1/(1-p_t)^gamma recomputes live, with no class input at all,
// showing focal loss's per-example mechanism directly.

const ptSlider0507=document.querySelector('#wgPt_0507')
const ptOut0507=document.querySelector('#wgPtOut_0507')
const gammaButtons0507=[...document.querySelectorAll('#s14 [data-gamma]')]
const barsWrap0507=document.querySelector('#wgFocalBars_0507')
const readout0507=document.querySelector('#wgFocalReadout_0507')
const verdict0507=document.querySelector('#wgFocalVerdict_0507')

let currentGamma0507=2

function syncButtons0507(){
  gammaButtons0507.forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.gamma)===currentGamma0507))
}

function render0507(){
  const pt=Number(ptSlider0507.value)
  if(ptOut0507)ptOut0507.textContent=pt.toFixed(2)

  const gamma=currentGamma0507
  const ce=-Math.log(pt)
  const downWeight=Math.pow(1-pt,gamma)
  const focal=downWeight*ce
  const ratio=downWeight>0?1/downWeight:Infinity

  if(readout0507){
    readout0507.innerHTML=`
      <div><span>p_t</span><b>${pt.toFixed(2)}</b></div>
      <div><span>PLAIN CROSS-ENTROPY</span><b>${ce.toFixed(6)} nats</b></div>
      <div><span>(1 − p_t)^&gamma; — DOWN-WEIGHT FACTOR</span><b>${downWeight.toFixed(6)}</b></div>
      <div><span>FOCAL LOSS (&alpha;=1)</span><b>${focal.toFixed(6)} nats</b></div>
      <div><span>CE IS THIS MANY × BIGGER</span><b>${gamma===0?'1× (no down-weighting)':ratio>=1000?ratio.toExponential(2)+'×':ratio.toFixed(2)+'×'}</b></div>
    `
  }

  if(barsWrap0507){
    const maxLen=260
    const scale=Math.max(ce,focal,0.0001)
    barsWrap0507.innerHTML=`
      <svg class="vector-plane" viewBox="0 0 460 90" role="img" aria-label="Cross-entropy versus focal loss bars at the current probability and gamma">
        <text x="10" y="14" font-size="8" font-family="IBM Plex Mono, monospace" font-weight="700">PLAIN CROSS-ENTROPY</text>
        <rect x="10" y="20" width="${(ce/scale*maxLen).toFixed(1)}" height="18" fill="var(--muted)" fill-opacity="0.5"/>
        <text x="${16+ce/scale*maxLen}" y="33" font-size="8" font-family="IBM Plex Mono, monospace">${ce.toFixed(4)}</text>
        <text x="10" y="56" font-size="8" font-family="IBM Plex Mono, monospace" font-weight="700">FOCAL LOSS</text>
        <rect x="10" y="62" width="${(focal/scale*maxLen).toFixed(1)}" height="18" fill="var(--orange)"/>
        <text x="${16+focal/scale*maxLen}" y="75" font-size="8" font-family="IBM Plex Mono, monospace">${focal.toFixed(6)}</text>
      </svg>
    `
  }

  if(verdict0507){
    let text
    if(gamma===0){
      text=`At &gamma;=0, focal loss equals plain cross-entropy exactly -- no down-weighting at any p_t. This is Concept 03's own weighted cross-entropy once &alpha; is set to a class weight.`
    }else if(pt>0.85){
      text=`This row is already easy (p_t=${pt.toFixed(2)}) -- focal loss shrinks its contribution by ${ratio>=1000?ratio.toExponential(2):ratio.toFixed(1)}×, automatically, with no class lookup at all.`
    }else{
      text=`This row is still hard (p_t=${pt.toFixed(2)}) -- focal loss barely down-weights it (${ratio.toFixed(2)}×), keeping it prominent in the loss.`
    }
    verdict0507.innerHTML=`<b>${gamma===0?'PLAIN CROSS-ENTROPY':pt>0.85?'AUTOMATICALLY DOWN-WEIGHTED':'STILL HARD, KEPT PROMINENT'}</b> ${text}`
  }
}

gammaButtons0507.forEach(btn=>btn.addEventListener('click',()=>{
  currentGamma0507=Number(btn.dataset.gamma)
  syncButtons0507()
  render0507()
}))
ptSlider0507?.addEventListener('input',render0507)

syncButtons0507()
render0507()
