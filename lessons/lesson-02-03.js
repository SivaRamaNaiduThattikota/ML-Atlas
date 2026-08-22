const advancedLesson0203=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0203(){if(advancedLesson0203)advancedLesson0203.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0203)
syncAdvancedTarget0203()

// The Harmonic Mean Stress Test — two independent levers on CFPB's real 1,000-row split (223 relief, 777 non-relief).
// Lever 1 sets how many real relief cases the model catches (drives recall). Lever 2 sets how many false alarms
// it raises among the 777 non-relief complaints (drives precision's cost). Precision, recall, the plain arithmetic
// mean and F1 all recompute live, and a pair of bars shows the two averages pulling apart as the levers get lopsided.
// This is one fixed operating point — no threshold is swept here, that's Concept 04's job.
const PR_RELIEF=223
const PR_NON_RELIEF=777
const PR_PRESET_BALANCED={caught:150,alarms:120}
const PR_PRESET_LOPSIDED={caught:5,alarms:0}

const prCaughtInput=document.querySelector('#prLeverCaught')
const prAlarmsInput=document.querySelector('#prLeverAlarms')
const prReadout=document.querySelector('#prLabReadout')
const prBars=document.querySelector('#prMeanBars')
const prVerdict=document.querySelector('#prLabVerdict')
const prPresetBalanced=document.querySelector('#prPresetBalanced')
const prPresetLopsided=document.querySelector('#prPresetLopsided')
const prCaughtOut=document.querySelector('#prCaughtOut')
const prAlarmsOut=document.querySelector('#prAlarmsOut')

function prCompute(){
  const caught=Number(prCaughtInput.value)
  const alarms=Number(prAlarmsInput.value)
  const missed=PR_RELIEF-caught
  const predictedPositive=caught+alarms
  const precision=predictedPositive>0?caught/predictedPositive:0
  const recall=caught/PR_RELIEF
  const arithmetic=(precision+recall)/2
  const f1=(precision+recall)>0?(2*precision*recall)/(precision+recall):0
  return {caught,alarms,missed,predictedPositive,precision,recall,arithmetic,f1}
}

function renderPrLab(){
  if(!prCaughtInput||!prAlarmsInput||!prReadout||!prBars||!prVerdict)return
  const {caught,alarms,missed,predictedPositive,precision,recall,arithmetic,f1}=prCompute()
  if(prCaughtOut)prCaughtOut.textContent=`${caught} / ${PR_RELIEF}`
  if(prAlarmsOut)prAlarmsOut.textContent=`${alarms} / ${PR_NON_RELIEF}`
  prReadout.innerHTML=`
    <div><span>RECALL</span><b>${(recall*100).toFixed(1)}% = ${caught} / ${PR_RELIEF}</b></div>
    <div><span>PRECISION</span><b>${predictedPositive>0?`${(precision*100).toFixed(1)}% = ${caught} / ${predictedPositive}`:'undefined — 0 predicted positive'}</b></div>
    <div><span>MISSED RELIEF CASES (FN)</span><b>${missed}</b></div>
    <div><span>FALSE ALARMS (FP)</span><b>${alarms}</b></div>
  `
  prBars.innerHTML=`
    <div class="prob-row"><span>Arithmetic mean</span><div class="bar-track"><div class="bar-fill" style="width:${(arithmetic*100).toFixed(1)}%;background:#f0a52a"></div></div><output>${(arithmetic*100).toFixed(1)}%</output></div>
    <div class="prob-row"><span>F1 (harmonic mean)</span><div class="bar-track"><div class="bar-fill" style="width:${(f1*100).toFixed(1)}%;background:#159652"></div></div><output>${(f1*100).toFixed(1)}%</output></div>
  `
  const gapPoints=(arithmetic-f1)*100
  prVerdict.className=`gate-verdict ${gapPoints>15?'verdict-red':gapPoints>5?'verdict-amber':'verdict-green'}`
  prVerdict.textContent=gapPoints>15
    ? `The two means disagree by ${gapPoints.toFixed(1)} points — one of precision or recall is badly lopsided, and F1 refuses to hide it the way the arithmetic mean does.`
    : gapPoints>5
    ? `A ${gapPoints.toFixed(1)}-point gap — the two levers aren't matched yet, so F1 is already discounting the weaker one.`
    : `Only a ${gapPoints.toFixed(1)}-point gap — precision and recall are close enough that F1 and the arithmetic mean nearly agree.`
}

prCaughtInput?.addEventListener('input',renderPrLab)
prAlarmsInput?.addEventListener('input',renderPrLab)
prPresetBalanced?.addEventListener('click',()=>{prCaughtInput.value=PR_PRESET_BALANCED.caught;prAlarmsInput.value=PR_PRESET_BALANCED.alarms;renderPrLab()})
prPresetLopsided?.addEventListener('click',()=>{prCaughtInput.value=PR_PRESET_LOPSIDED.caught;prAlarmsInput.value=PR_PRESET_LOPSIDED.alarms;renderPrLab()})
renderPrLab()
