// Section 14's lab: The Threshold Mover. A continuous decision-threshold
// slider plus a model toggle that swaps the entire underlying 10-row
// scored dataset between Model H (real, separating) and Model Z
// (ROC-AUC~0.43, barely better than random). Every row's score/label pair
// is fixed and was independently verified (dual-method confusion-matrix
// scripts plus hand-derived exact fractions) before being hardcoded here;
// the confusion matrix itself recomputes live as the slider moves.

const MODEL_H_0504=[[0.72,1],[0.61,0],[0.44,0],[0.38,1],[0.35,0],[0.25,0],[0.20,0],[0.18,1],[0.12,0],[0.05,0]]
const MODEL_Z_0504=[[0.90,0],[0.75,0],[0.65,1],[0.55,0],[0.50,0],[0.40,1],[0.30,0],[0.20,0],[0.10,1],[0.05,0]]
const Z_MAX_PRECISION_0504=1/3

const thresholdSlider0504=document.querySelector('#wgThreshold_0504')
const thresholdOut0504=document.querySelector('#wgThresholdOut_0504')
const modelButtons0504=[...document.querySelectorAll('#s14 [data-model]')]
const presetButtons0504=[...document.querySelectorAll('#s14 [data-preset]')]
const barsWrap0504=document.querySelector('#wgThresholdBars_0504')
const readout0504=document.querySelector('#wgThresholdReadout_0504')
const verdict0504=document.querySelector('#wgThresholdVerdict_0504')

let currentModel0504='H'

function syncModelButtons0504(){
  modelButtons0504.forEach(btn=>btn.classList.toggle('active',btn.dataset.model===currentModel0504))
}

function activeRows0504(){
  return currentModel0504==='H'?MODEL_H_0504:MODEL_Z_0504
}

function confusionAt0504(rows,t){
  let TP=0,FP=0,FN=0,TN=0
  for(const [score,label] of rows){
    const flagged=score>=t
    if(flagged&&label===1)TP+=1
    else if(flagged&&label===0)FP+=1
    else if(!flagged&&label===1)FN+=1
    else TN+=1
  }
  return {TP,FP,FN,TN}
}

function prf0504(c){
  const p=c.TP+c.FP>0?c.TP/(c.TP+c.FP):0
  const r=c.TP+c.FN>0?c.TP/(c.TP+c.FN):0
  const f1=p+r>0?2*p*r/(p+r):0
  return {p,r,f1}
}

function render0504(){
  const t=Number(thresholdSlider0504.value)
  if(thresholdOut0504)thresholdOut0504.textContent=t.toFixed(2)

  const rows=activeRows0504()
  const c=confusionAt0504(rows,t)
  const m=prf0504(c)
  const baseline=confusionAt0504(rows,0.50)
  const mBase=prf0504(baseline)

  const dP=(m.p-mBase.p)*100
  const dR=(m.r-mBase.r)*100
  const dF1=(m.f1-mBase.f1)*100
  const sign=v=>(v>=0?'+':'')+v.toFixed(1)

  if(readout0504){
    readout0504.innerHTML=`
      <div><span>THRESHOLD</span><b>t = ${t.toFixed(2)}</b></div>
      <div><span>TP / FP / FN / TN</span><b>${c.TP} / ${c.FP} / ${c.FN} / ${c.TN}</b></div>
      <div><span>PRECISION</span><b>${(m.p*100).toFixed(1)}% (${sign(dP)} pts vs. t=0.50)</b></div>
      <div><span>RECALL</span><b>${(m.r*100).toFixed(1)}% (${sign(dR)} pts vs. t=0.50)</b></div>
      <div><span>F1</span><b>${(m.f1*100).toFixed(1)}% (${sign(dF1)} pts vs. t=0.50)</b></div>
    `
  }

  if(barsWrap0504){
    const maxLen=260
    barsWrap0504.innerHTML=`
      <svg class="vector-plane" viewBox="0 0 460 110" role="img" aria-label="Precision, recall and F1 bars at the current threshold for the selected model">
        <text x="10" y="14" font-size="8" font-family="IBM Plex Mono, monospace" font-weight="700">PRECISION</text>
        <rect x="10" y="20" width="${(m.p*maxLen).toFixed(1)}" height="16" fill="var(--orange)"/>
        <text x="${16+m.p*maxLen}" y="32" font-size="7" font-family="IBM Plex Mono, monospace">${(m.p*100).toFixed(1)}%</text>
        <text x="10" y="52" font-size="8" font-family="IBM Plex Mono, monospace" font-weight="700">RECALL</text>
        <rect x="10" y="58" width="${(m.r*maxLen).toFixed(1)}" height="16" fill="var(--muted)" fill-opacity="0.5"/>
        <text x="${16+m.r*maxLen}" y="70" font-size="7" font-family="IBM Plex Mono, monospace">${(m.r*100).toFixed(1)}%</text>
        <text x="10" y="90" font-size="8" font-family="IBM Plex Mono, monospace" font-weight="700">F1</text>
        <rect x="10" y="96" width="${(m.f1*maxLen).toFixed(1)}" height="10" fill="currentColor" fill-opacity="0.35"/>
      </svg>
    `
  }

  if(verdict0504){
    let label,text,warn
    if(currentModel0504==='H'){
      label='REAL TRADE, ZERO RETRAINING'
      text=`Moving to t=${t.toFixed(2)} trades ${Math.abs(dP).toFixed(1)} points of precision for ${Math.abs(dR).toFixed(1)} points of recall along Model H's real curve -- the same probabilities as t=0.50, no retraining occurred.`
      warn=false
    }else{
      label='DISCRIMINATION FLOOR, NOT A THRESHOLD PROBLEM'
      text=`Moving to t=${t.toFixed(2)} trades ${Math.abs(dP).toFixed(1)} points of precision for ${Math.abs(dR).toFixed(1)} points of recall -- but precision never clears ${(Z_MAX_PRECISION_0504*100).toFixed(1)}% anywhere on Model Z's curve, because ROC-AUC≈0.43 means this model never separated the classes in the first place. No threshold fixes that.`
      warn=true
    }
    verdict0504.className='gate-verdict'+(warn?' warning':'')
    verdict0504.innerHTML=`<b>${label}</b> ${text}`
  }
}

modelButtons0504.forEach(btn=>btn.addEventListener('click',()=>{
  currentModel0504=btn.dataset.model
  syncModelButtons0504()
  render0504()
}))
presetButtons0504.forEach(btn=>btn.addEventListener('click',()=>{
  thresholdSlider0504.value=btn.dataset.preset
  render0504()
}))
thresholdSlider0504?.addEventListener('input',render0504)

syncModelButtons0504()
render0504()
