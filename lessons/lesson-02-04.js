const advancedLesson0204=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0204(){if(advancedLesson0204)advancedLesson0204.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0204)
syncAdvancedTarget0204()

// The Threshold Sweep Explorer — one slider, one underlying score list, two curves.
// "Model D" is 10 CFPB complaints already scored by a relief-risk model (continuous score, not yet thresholded),
// 3 real relief cases and 7 non-relief, sorted by score descending. Moving the slider from k=0 to k=10 changes
// which top-k scored complaints get predicted "relief" — exactly the threshold move Concept 03 froze at one value.
// Both curves and their two AUC numbers are fixed in advance; the slider only ever reveals ONE point on them.
const SWEEP_ROWS=[
  {score:0.95,label:1},
  {score:0.88,label:0},
  {score:0.81,label:1},
  {score:0.72,label:0},
  {score:0.63,label:0},
  {score:0.55,label:1},
  {score:0.44,label:0},
  {score:0.31,label:0},
  {score:0.22,label:0},
  {score:0.10,label:0},
]
const SWEEP_P=SWEEP_ROWS.filter(r=>r.label===1).length
const SWEEP_N=SWEEP_ROWS.length-SWEEP_P
const SWEEP_ROC_AUC=17/21
const SWEEP_PR_AUC=13/18

function sweepStatsAt(k){
  const top=SWEEP_ROWS.slice(0,k)
  const tp=top.filter(r=>r.label===1).length
  const fp=k-tp
  const fn=SWEEP_P-tp
  const tn=SWEEP_N-fp
  const tpr=tp/SWEEP_P
  const fpr=fp/SWEEP_N
  const precision=k>0?tp/k:null
  const recall=tpr
  return {k,tp,fp,fn,tn,tpr,fpr,precision,recall}
}
const SWEEP_TABLE=Array.from({length:11},(_,k)=>sweepStatsAt(k))

const plotX=v=>30+v*160
const plotY=v=>190-v*160

const sweepSlider=document.querySelector('#sweepK')
const sweepReadout=document.querySelector('#sweepReadout')
const sweepRocMarker=document.querySelector('#sweepRocMarker')
const sweepPrMarker=document.querySelector('#sweepPrMarker')
const sweepVerdict=document.querySelector('#sweepVerdict')
const sweepPresetBalanced=document.querySelector('#sweepPresetBalanced')
const sweepPresetFull=document.querySelector('#sweepPresetFull')
const sweepKOut=document.querySelector('#sweepKOut')

function renderSweep(){
  if(!sweepSlider||!sweepReadout||!sweepRocMarker||!sweepPrMarker||!sweepVerdict)return
  const k=Number(sweepSlider.value)
  const s=SWEEP_TABLE[k]
  if(sweepKOut)sweepKOut.textContent=`k = ${k} of 10 complaints flagged "relief"`
  sweepReadout.innerHTML=`
    <div><span>TP · FP · FN · TN</span><b>${s.tp} · ${s.fp} · ${s.fn} · ${s.tn}</b></div>
    <div><span>TPR (RECALL)</span><b>${(s.tpr*100).toFixed(1)}%</b></div>
    <div><span>FPR</span><b>${(s.fpr*100).toFixed(1)}%</b></div>
    <div><span>PRECISION</span><b>${s.precision===null?'undefined — 0 flagged':`${(s.precision*100).toFixed(1)}%`}</b></div>
  `
  sweepRocMarker.setAttribute('cx',plotX(s.fpr))
  sweepRocMarker.setAttribute('cy',plotY(s.tpr))
  const prX=plotX(s.recall)
  const prY=plotY(s.precision===null?1:s.precision)
  sweepPrMarker.setAttribute('cx',prX)
  sweepPrMarker.setAttribute('cy',prY)
  sweepPrMarker.style.opacity=s.precision===null?'0.35':'1'
  sweepVerdict.className=`gate-verdict ${k===0?'verdict-amber':k===SWEEP_TABLE.length-1?'verdict-red':'verdict-green'}`
  sweepVerdict.textContent=k===0
    ? `k=0 flags nobody — this is the top-left corner (0,0) on both curves, before the sweep has caught anything.`
    : k===SWEEP_TABLE.length-1
    ? `k=10 flags everybody — this is the top-right corner (1,1) on the ROC curve, and precision has collapsed to the dataset's own positive rate (${(SWEEP_P/(SWEEP_P+SWEEP_N)*100).toFixed(0)}%) on the PR curve.`
    : `One point on each curve. ROC-AUC (${(SWEEP_ROC_AUC*100).toFixed(1)}%) and PR-AUC (${(SWEEP_PR_AUC*100).toFixed(1)}%) summarize all 11 points like this one — this slider only ever shows you one of them at a time.`
}

sweepSlider?.addEventListener('input',renderSweep)
sweepPresetBalanced?.addEventListener('click',()=>{sweepSlider.value='3';renderSweep()})
sweepPresetFull?.addEventListener('click',()=>{sweepSlider.value='6';renderSweep()})
renderSweep()
