// Section 14's lab: The Metric Trust Panel. One ratio slider recomputes
// every row's predicted probability via the odds-rescaling transform
// p_weighted=(r*p_raw)/(r*p_raw+(1-p_raw)), then drives three parallel,
// contrasting readouts on the same fixed 10-row toy set from Section 10:
// accuracy, precision/recall/F1, and the calibration gap against the
// true 20% base rate. The 10-row set is fixed and was independently
// verified before use; every readout below recomputes live from the
// single slider.

const TOY_ROWS_0506=[[0.55,1],[0.35,1],[0.25,0],[0.20,0],[0.15,0],[0.12,0],[0.10,0],[0.08,0],[0.05,0],[0.03,0]]
const TRUE_BASE_RATE_0506=0.20

const ratioSlider0506=document.querySelector('#wgTrustRatio_0506')
const ratioOut0506=document.querySelector('#wgTrustRatioOut_0506')
const barsWrap0506=document.querySelector('#wgTrustBars_0506')
const readout0506=document.querySelector('#wgTrustReadout_0506')
const verdict0506=document.querySelector('#wgTrustVerdict_0506')
const presetButtons0506=[...document.querySelectorAll('#s14 .lab-actions [data-preset]')]

function pWeighted0506(pRaw,r){
  return (r*pRaw)/(r*pRaw+(1-pRaw))
}

function confusionAndMetrics0506(rows,r,threshold=0.5){
  let TP=0,FP=0,FN=0,TN=0,sumP=0
  for(const [pRaw,label] of rows){
    const pw=pWeighted0506(pRaw,r)
    sumP+=pw
    const flagged=pw>=threshold
    if(flagged&&label===1)TP+=1
    else if(flagged&&label===0)FP+=1
    else if(!flagged&&label===1)FN+=1
    else TN+=1
  }
  const n=rows.length
  const accuracy=(TP+TN)/n
  const precision=(TP+FP)>0?TP/(TP+FP):NaN
  const recall=(TP+FN)>0?TP/(TP+FN):NaN
  const f1=(precision+recall)>0?(2*precision*recall)/(precision+recall):0
  const meanP=sumP/n
  const gap=meanP-TRUE_BASE_RATE_0506
  return {TP,FP,FN,TN,accuracy,precision,recall,f1,meanP,gap}
}

function bar0506(label,value,color){
  const pct=Math.max(0,Math.min(100,value*100))
  return `<div class="prob-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${pct.toFixed(1)}%;background:${color}"></div></div><output>${(value*100).toFixed(1)}%</output></div>`
}

function render0506(){
  if(!ratioSlider0506||!barsWrap0506||!readout0506||!verdict0506)return
  const r=Number(ratioSlider0506.value)
  if(ratioOut0506)ratioOut0506.textContent=r.toFixed(1)

  const m=confusionAndMetrics0506(TOY_ROWS_0506,r)

  barsWrap0506.innerHTML=`
    <div style="font:11px IBM Plex Mono, monospace;color:var(--orange);margin-bottom:6px">ACCURACY</div>
    <div class="prob-bars">
      ${bar0506('Accuracy',m.accuracy,'var(--orange)')}
    </div>
    <div style="font:11px IBM Plex Mono, monospace;color:var(--orange);margin:18px 0 6px">PRECISION / RECALL / F1 — READ DIRECTLY OFF THE CONFUSION MATRIX</div>
    <div class="prob-bars">
      ${bar0506('Precision',m.precision,'var(--teal)')}
      ${bar0506('Recall',m.recall,'var(--green)')}
      ${bar0506('F1',m.f1,'var(--ink)')}
    </div>
    <div style="font:11px IBM Plex Mono, monospace;color:var(--orange);margin:18px 0 6px">MEAN PREDICTED PROBABILITY VS. TRUE BASE RATE — THE NUMBER WEIGHTING QUIETLY BREAKS</div>
    <div class="prob-bars">
      ${bar0506('Mean p',m.meanP,'var(--orange)')}
      ${bar0506('True rate',TRUE_BASE_RATE_0506,'var(--muted)')}
    </div>
  `

  readout0506.innerHTML=`
    <div><span>CONFUSION MATRIX AT r=${r.toFixed(1)}</span><b>TP=${m.TP} FP=${m.FP} FN=${m.FN} TN=${m.TN}</b></div>
    <div><span>CALIBRATION GAP</span><b>${m.gap>=0?'+':''}${(m.gap*100).toFixed(2)} points</b></div>
  `

  const accPct=(m.accuracy*100)
  const recallPct=(m.recall*100)
  const meanPPct=(m.meanP*100)
  const gapPts=(m.gap*100)
  const accWord=accPct>90?'higher than':accPct<90?'lower than':'exactly the same as'
  verdict0506.innerHTML=`<b>r=${r.toFixed(1)}</b> At r=${r.toFixed(1)}: accuracy sits at ${accPct.toFixed(1)}% — ${accWord} the unweighted 90.0%, while recall reads ${recallPct.toFixed(1)}%. Precision, recall, and F1 are exactly as trustworthy as they were at r=1.0 — they're still honest counts off this matrix. The average predicted probability, ${meanPPct.toFixed(1)}% vs. the true 20.0% base rate, is the number that's quietly stopped meaning what it claims (gap ${gapPts>=0?'+':''}${gapPts.toFixed(2)} points).`
}

ratioSlider0506?.addEventListener('input',render0506)
presetButtons0506.forEach(btn=>{
  btn.addEventListener('click',()=>{
    if(!ratioSlider0506)return
    ratioSlider0506.value=btn.dataset.preset
    render0506()
  })
})

render0506()
