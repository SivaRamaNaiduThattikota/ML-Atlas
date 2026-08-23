// Section 14's lab: The Cost Dial. Two independent dollar-cost sliders
// drive a derived threshold t*=C(FP)/(C(FP)+C(FN)), a live confusion
// matrix/cost on the fixed 10-row toy set from Section 10, and a
// comparison against the fixed 0.223 "balanced"-implied marker (Concept
// 03's own already-verified base-rate identity). The 10-row set is fixed
// and was independently verified before use; the confusion matrix and
// costs recompute live from the two sliders.

const TOY_ROWS_0505=[[0.30,1],[0.20,1],[0.10,1],[0.19,0],[0.15,0],[0.12,0],[0.05,0],[0.03,0],[0.02,0],[0.01,0]]
const BALANCED_THRESHOLD_0505=0.223
const CLASS_RATIO_0505=3.4843049327354256

const cfnSlider0505=document.querySelector('#wgCFN_0505')
const cfpSlider0505=document.querySelector('#wgCFP_0505')
const cfnOut0505=document.querySelector('#wgCFNOut_0505')
const cfpOut0505=document.querySelector('#wgCFPOut_0505')
const barsWrap0505=document.querySelector('#wgCostBars_0505')
const readout0505=document.querySelector('#wgCostReadout_0505')
const verdict0505=document.querySelector('#wgCostVerdict_0505')

function confusionAndCost0505(rows,threshold,cfn,cfp){
  let TP=0,FP=0,FN=0,TN=0
  for(const [score,label] of rows){
    const flagged=score>=threshold
    if(flagged&&label===1)TP+=1
    else if(flagged&&label===0)FP+=1
    else if(!flagged&&label===1)FN+=1
    else TN+=1
  }
  const cost=FN*cfn+FP*cfp
  return {TP,FP,FN,TN,cost}
}

function render0505(){
  const cfn=Number(cfnSlider0505.value)
  const cfp=Number(cfpSlider0505.value)
  if(cfnOut0505)cfnOut0505.textContent='$'+cfn
  if(cfpOut0505)cfpOut0505.textContent='$'+cfp

  const costRatio=cfn/cfp
  const tStar=cfp/(cfp+cfn)

  const atTStar=confusionAndCost0505(TOY_ROWS_0505,tStar,cfn,cfp)
  const atBalanced=confusionAndCost0505(TOY_ROWS_0505,BALANCED_THRESHOLD_0505,cfn,cfp)

  if(readout0505){
    readout0505.innerHTML=`
      <div><span>COST RATIO C(FN)/C(FP)</span><b>${costRatio.toFixed(4)}</b></div>
      <div><span>DERIVED THRESHOLD t*</span><b>${(tStar*100).toFixed(2)}%</b></div>
      <div><span>AT t* — TP/FP/FN/TN</span><b>${atTStar.TP}/${atTStar.FP}/${atTStar.FN}/${atTStar.TN}</b></div>
      <div><span>AT t* — COST</span><b>$${atTStar.cost.toLocaleString()}</b></div>
      <div><span>AT 0.223 ("BALANCED"-IMPLIED) — COST</span><b>$${atBalanced.cost.toLocaleString()}</b></div>
    `
  }

  if(barsWrap0505){
    const maxLen=260
    const scale=Math.max(atTStar.cost,atBalanced.cost,1)
    barsWrap0505.innerHTML=`
      <svg class="vector-plane" viewBox="0 0 460 100" role="img" aria-label="Derived threshold marker and cost comparison against the fixed balanced-implied threshold">
        <text x="10" y="14" font-size="8" font-family="IBM Plex Mono, monospace" font-weight="700">THRESHOLD TRACK (0% — 100%)</text>
        <rect x="10" y="20" width="380" height="10" fill="none" stroke="currentColor" stroke-width="1"/>
        <rect x="${10+3.8*22.3}" y="20" width="2" height="10" fill="var(--muted)"/>
        <text x="${10+3.8*22.3}" y="16" font-size="7" text-anchor="middle">0.223</text>
        <rect x="${10+3.8*tStar*100}" y="20" width="2" height="10" fill="var(--orange)"/>
        <text x="${10+3.8*tStar*100}" y="38" font-size="7" text-anchor="middle" fill="var(--orange)">t*=${(tStar*100).toFixed(1)}%</text>
        <text x="10" y="58" font-size="8" font-family="IBM Plex Mono, monospace" font-weight="700">COST AT t*</text>
        <rect x="10" y="64" width="${(atTStar.cost/scale*maxLen).toFixed(1)}" height="14" fill="var(--orange)"/>
        <text x="${16+atTStar.cost/scale*maxLen}" y="75" font-size="7" font-family="IBM Plex Mono, monospace">$${atTStar.cost}</text>
        <text x="10" y="94" font-size="8" font-family="IBM Plex Mono, monospace" font-weight="700">COST AT 0.223</text>
        <rect x="10" y="100" width="0" height="0" fill="none"/>
      </svg>
    `
  }

  if(verdict0505){
    const diff=atBalanced.cost-atTStar.cost
    let text
    if(Math.abs(costRatio-CLASS_RATIO_0505)<0.15){
      text=`These costs are close to CFPB's own 3.48:1 class ratio -- the two thresholds nearly agree (cost $${atTStar.cost} vs. $${atBalanced.cost}).`
    }else if(diff>0){
      text=`At these costs, the cost-derived threshold saves $${diff.toLocaleString()} versus the "balanced"-implied threshold ($${atTStar.cost} vs. $${atBalanced.cost}).`
    }else if(diff<0){
      text=`At these costs, the "balanced"-implied threshold happens to cost $${Math.abs(diff).toLocaleString()} less than t* on this fixed set ($${atBalanced.cost} vs. $${atTStar.cost}) -- t* still minimizes EXPECTED cost in general; this fixed 10-row sample can occasionally favor a different point.`
    }else{
      text=`Both thresholds land on the identical $${atTStar.cost} cost here.`
    }
    verdict0505.innerHTML=`<b>COST RATIO ${costRatio.toFixed(2)} vs. CLASS RATIO 3.48</b> ${text}`
  }
}

cfnSlider0505?.addEventListener('input',render0505)
cfpSlider0505?.addEventListener('input',render0505)

render0505()
