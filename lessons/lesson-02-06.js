const advancedLesson0206=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0206(){if(advancedLesson0206)advancedLesson0206.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0206)
syncAdvancedTarget0206()

// The Confidence Dial — ONE slider (k) rescales every predicted probability on the LOGIT scale:
// p' = sigmoid(k * logit(p)). This is the same "temperature scaling" shape of transform Module 16
// covers as an actual fix; here it's used only to demonstrate a property, not to fix anything.
// Because logit and sigmoid are both strictly increasing, this transform can NEVER change which
// row's score ranks above which other row's — rank order (and therefore ROC-AUC/PR-AUC, Concept 04)
// is identical at every value of k. Only the reliability diagram and the Brier score move.
const MODEL_F_ROWS=[
  {p:0.05,o:0},{p:0.08,o:0},{p:0.10,o:0},{p:0.12,o:1},{p:0.15,o:0},
  {p:0.30,o:0},{p:0.32,o:1},{p:0.35,o:0},{p:0.38,o:1},{p:0.40,o:0},
  {p:0.55,o:1},{p:0.58,o:0},{p:0.60,o:1},{p:0.62,o:1},{p:0.65,o:0},
  {p:0.85,o:1},{p:0.88,o:1},{p:0.90,o:0},{p:0.92,o:1},{p:0.95,o:0},
]
const MODEL_F_BIN_SIZE=5
const MODEL_F_BASE_RATE=MODEL_F_ROWS.reduce((sum,r)=>sum+r.o,0)/MODEL_F_ROWS.length
const MODEL_F_BASELINE_BRIER=MODEL_F_ROWS.reduce((sum,r)=>sum+(MODEL_F_BASE_RATE-r.o)**2,0)/MODEL_F_ROWS.length

function logit(p){return Math.log(p/(1-p))}
function sigmoid(x){return 1/(1+Math.exp(-x))}
function dialTransform(p,k){return sigmoid(k*logit(p))}

function dialStatsAt(k){
  const transformed=MODEL_F_ROWS.map(r=>({p:dialTransform(r.p,k),o:r.o}))
  const bins=[]
  for(let i=0;i<transformed.length;i+=MODEL_F_BIN_SIZE){
    const chunk=transformed.slice(i,i+MODEL_F_BIN_SIZE)
    const meanPred=chunk.reduce((sum,r)=>sum+r.p,0)/chunk.length
    const actualRate=chunk.reduce((sum,r)=>sum+r.o,0)/chunk.length
    bins.push({meanPred,actualRate})
  }
  const brier=transformed.reduce((sum,r)=>sum+(r.p-r.o)**2,0)/transformed.length
  return {bins,brier}
}

const SCREEN_ORIGIN_X=30
const SCREEN_ORIGIN_Y=190
const SCREEN_SPAN=160

function screenX(v){return SCREEN_ORIGIN_X+v*SCREEN_SPAN}
function screenY(v){return SCREEN_ORIGIN_Y-v*SCREEN_SPAN}

const dialSlider=document.querySelector('#confidenceDial')
const dialOut=document.querySelector('#confidenceDialOut')
const dialReadout=document.querySelector('#dialReadout')
const dialDiscrimination=document.querySelector('#dialDiscrimination')
const dialVerdict=document.querySelector('#dialVerdict')
const dialLine=document.querySelector('#dialLine')
const dialPoints=[
  document.querySelector('#dialB1'),
  document.querySelector('#dialB2'),
  document.querySelector('#dialB3'),
  document.querySelector('#dialB4'),
]
const dialPresetIdentity=document.querySelector('#dialPresetIdentity')
const dialPresetExaggerate=document.querySelector('#dialPresetExaggerate')
const dialPresetFlatten=document.querySelector('#dialPresetFlatten')

function renderConfidenceDial(){
  if(!dialSlider||!dialReadout||!dialVerdict)return
  const k=Number(dialSlider.value)
  const {bins,brier}=dialStatsAt(k)
  if(dialOut)dialOut.textContent=`k = ${k.toFixed(1)}`
  const coords=bins.map(b=>({x:screenX(b.meanPred),y:screenY(b.actualRate)}))
  coords.forEach((c,i)=>{
    const point=dialPoints[i]
    if(!point)return
    point.setAttribute('cx',c.x.toFixed(1))
    point.setAttribute('cy',c.y.toFixed(1))
  })
  if(dialLine)dialLine.setAttribute('points',coords.map(c=>`${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' '))
  dialReadout.innerHTML=bins.map((b,i)=>
    `<div><span>BIN ${i+1}</span><b>pred ${b.meanPred.toFixed(2)} · actual ${b.actualRate.toFixed(2)}</b></div>`
  ).join('')+`<div><span>BRIER SCORE</span><b>${brier.toFixed(3)}</b></div>`
  if(dialDiscrimination)dialDiscrimination.textContent=
    `Rank order (discrimination): bins still read 0.20 → 0.40 → 0.60 → 0.60, unchanged at every k — only the x-axis numbers move.`
  dialVerdict.className=`gate-verdict ${brier<=0.235?'verdict-green':brier<=MODEL_F_BASELINE_BRIER?'verdict-amber':'verdict-red'}`
  dialVerdict.textContent=k===1
    ? `k = 1.0 is Model F unchanged: Brier ${brier.toFixed(3)} is already worse than a trivial "always guess ${(MODEL_F_BASE_RATE*100).toFixed(0)}%" baseline (${MODEL_F_BASELINE_BRIER.toFixed(3)}).`
    : brier>MODEL_F_BASELINE_BRIER
    ? `At k = ${k.toFixed(1)}, Brier score ${brier.toFixed(3)} is worse than the ${MODEL_F_BASELINE_BRIER.toFixed(3)} trivial baseline — the dial pushed probabilities further from the diagonal than they started.`
    : brier<=0.235
    ? `At k = ${k.toFixed(1)}, Brier score ${brier.toFixed(3)} clearly beats the ${MODEL_F_BASELINE_BRIER.toFixed(3)} trivial baseline — flattening toward 0.5 hedges away most of Model F's overconfidence.`
    : `At k = ${k.toFixed(1)}, Brier score ${brier.toFixed(3)} edges past the ${MODEL_F_BASELINE_BRIER.toFixed(3)} trivial baseline, but only narrowly.`
}

dialSlider?.addEventListener('input',renderConfidenceDial)
dialPresetIdentity?.addEventListener('click',()=>{dialSlider.value='1';renderConfidenceDial()})
dialPresetExaggerate?.addEventListener('click',()=>{dialSlider.value='2.5';renderConfidenceDial()})
dialPresetFlatten?.addEventListener('click',()=>{dialSlider.value='0.4';renderConfidenceDial()})
renderConfidenceDial()
