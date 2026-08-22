const advancedLesson0209=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0209(){if(advancedLesson0209)advancedLesson0209.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0209)
syncAdvancedTarget0209()

// The Significance Grid -- an interactive two-proportion z-test. Candidate A's baseline recall
// (71.75%, matching the lesson's worked 160/223 example) stays fixed; the two sliders ask "what
// if this same observed gap had shown up on a different-sized test set?" The z-test formula and
// every step value below were hand-verified in Node before being written in -- see the lesson text.

const SIG_BASELINE_RECALL=0.7175 // candidate A, ~160/223 -- fixed across every what-if below
const SIG_PRACTICAL_FLOOR_PP=2.0 // CFPB's illustrative "worth switching models" floor, a business call, not a computed number
const SIG_N_STEPS=[100,223,500,1000,2000,5000,10000,20000,50000,100000]
const SIG_N_DEFAULT_INDEX=1 // n = 223, the lesson's canonical CFPB test set

function erf0209(x){
  const sign=x>=0?1:-1
  x=Math.abs(x)
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911
  const t=1/(1+p*x)
  const y=1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x)
  return sign*y
}
function normalCdf0209(x){return 0.5*(1+erf0209(x/Math.sqrt(2)))}

function computeSignificance0209(deltaPP,n){
  const pA=SIG_BASELINE_RECALL
  const pB=pA+deltaPP/100
  const pooled=(pA+pB)/2
  const se=Math.sqrt(2*pooled*(1-pooled)/n)
  const z=(deltaPP/100)/se
  const p=2*(1-normalCdf0209(Math.abs(z)))
  return {pA,pB,pooled,se,z,p}
}

const sigDeltaSlider=document.querySelector('#sigDeltaSlider')
const sigDeltaOut=document.querySelector('#sigDeltaOut')
const sigNSlider=document.querySelector('#sigNSlider')
const sigNOut=document.querySelector('#sigNOut')
const sigZReadout=document.querySelector('#sigZReadout')
const sigPReadout=document.querySelector('#sigPReadout')
const sigVerdict=document.querySelector('#sigVerdict')
const sigMarker=document.querySelector('#sigMarker')
const sigThresholdLineV=document.querySelector('#sigThresholdLineV')
const sigThresholdLineH=document.querySelector('#sigThresholdLineH')

const SIG_X_MIN=10,SIG_X_MAX=270,SIG_Y_TOP=14,SIG_Y_BOTTOM=140
const SIG_DELTA_MAX=5,SIG_Z_CAP=4.5,SIG_Z_THRESHOLD=1.96

function sigX0209(deltaPP){
  const clamped=Math.max(0,Math.min(SIG_DELTA_MAX,deltaPP))
  return SIG_X_MIN+(clamped/SIG_DELTA_MAX)*(SIG_X_MAX-SIG_X_MIN)
}
function sigY0209(z){
  const clamped=Math.max(0,Math.min(SIG_Z_CAP,z))
  return SIG_Y_BOTTOM-(clamped/SIG_Z_CAP)*(SIG_Y_BOTTOM-SIG_Y_TOP)
}
function formatPValue0209(p){return p<0.0001?'< 0.0001':p.toFixed(4)}

function renderSignificanceGrid0209(){
  if(!sigDeltaSlider||!sigNSlider||!sigVerdict)return
  const deltaPP=Number(sigDeltaSlider.value)
  const n=SIG_N_STEPS[Number(sigNSlider.value)]
  const {z,p}=computeSignificance0209(deltaPP,n)
  const statSig=p<0.05
  const practicalSig=deltaPP>=SIG_PRACTICAL_FLOOR_PP

  if(sigDeltaOut)sigDeltaOut.textContent=`Δ = ${deltaPP.toFixed(1)} points (B minus A)`
  if(sigNOut)sigNOut.textContent=n===223?`n = 223 (CFPB's real test set)`:`n = ${n.toLocaleString()} (what-if)`
  if(sigZReadout)sigZReadout.textContent=z.toFixed(2)
  if(sigPReadout)sigPReadout.textContent=formatPValue0209(p)
  if(sigMarker){sigMarker.setAttribute('cx',sigX0209(deltaPP));sigMarker.setAttribute('cy',sigY0209(z))}
  if(sigThresholdLineV){const x=sigX0209(SIG_PRACTICAL_FLOOR_PP);sigThresholdLineV.setAttribute('x1',x);sigThresholdLineV.setAttribute('x2',x)}
  if(sigThresholdLineH){const y=sigY0209(SIG_Z_THRESHOLD);sigThresholdLineH.setAttribute('y1',y);sigThresholdLineH.setAttribute('y2',y)}

  const verdictClass=statSig&&practicalSig?'verdict-green':!statSig&&!practicalSig?'verdict-red':'verdict-amber'
  sigVerdict.className=`gate-verdict ${verdictClass}`
  if(statSig&&practicalSig){
    sigVerdict.textContent=`Real AND big enough to matter: p = ${formatPValue0209(p)}, ${deltaPP.toFixed(1)} points clears the ${SIG_PRACTICAL_FLOOR_PP.toFixed(1)}-point floor. This is the case for shipping candidate B.`
  }else if(statSig&&!practicalSig){
    sigVerdict.textContent=`Real, but too small to matter: p = ${formatPValue0209(p)} says this gap probably isn't chance, but ${deltaPP.toFixed(1)} points doesn't clear the ${SIG_PRACTICAL_FLOOR_PP.toFixed(1)}-point floor. Not worth the switch on its own.`
  }else if(!statSig&&practicalSig){
    sigVerdict.textContent=`Looks big enough to matter, but p = ${formatPValue0209(p)} means it isn't distinguishable from noise at this sample size yet. Verify before trusting it.`
  }else{
    sigVerdict.textContent=`Indistinguishable from noise, and wouldn't have mattered anyway: p = ${formatPValue0209(p)}, well short of both bars. This is CFPB's actual 0.4-point result at n = 223.`
  }
}

sigDeltaSlider?.addEventListener('input',renderSignificanceGrid0209)
sigNSlider?.addEventListener('input',renderSignificanceGrid0209)
if(sigDeltaSlider)sigDeltaSlider.value='0.4'
if(sigNSlider)sigNSlider.value=String(SIG_N_DEFAULT_INDEX)
renderSignificanceGrid0209()
