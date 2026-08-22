const advancedLesson0208=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0208(){if(advancedLesson0208)advancedLesson0208.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0208)
syncAdvancedTarget0208()

// The Overoptimization Curve -- an illustrative simulation, not real CFPB data. Ten pressure
// steps (0-10) walk a proxy metric (SLA closure rate) and the real goal it stands in for
// (decision correctness) under two regimes: no guardrail (the proxy is pushed with nothing
// checking whether closures were actually correct) and audited (a sampling review catches and
// disqualifies gamed closures, capping how far the proxy alone can be pushed). Every value below
// was hand-verified for monotonicity/peak shape before being written in -- see the lesson text.

const OVEROPT_UNGATED={
  proxy:    [60,63,66,69,72,75,78,81,84,87,90],
  trueGoal: [80,83,85,86,85,82,78,73,67,61,55],
}
const OVEROPT_AUDITED={
  proxy:    [60,62,64,65,66,67,67,68,68,68,68],
  trueGoal: [80,82,84,85,86,87,87,88,88,88,88],
}
const OVEROPT_PEAK_PRESSURE=3 // pressure step where the ungated trueGoal series peaks (86)

const oopPressure=document.querySelector('#oopPressure')
const oopPressureOut=document.querySelector('#oopPressureOut')
const oopAuditToggle=document.querySelector('#oopAuditToggle')
const oopProxyReadout=document.querySelector('#oopProxyReadout')
const oopGoalReadout=document.querySelector('#oopGoalReadout')
const oopVerdict=document.querySelector('#oopVerdict')
const oopProxyLine=document.querySelector('#oopProxyLine')
const oopGoalLine=document.querySelector('#oopGoalLine')
const oopProxyMarker=document.querySelector('#oopProxyMarker')
const oopGoalMarker=document.querySelector('#oopGoalMarker')

const OOP_CHART_W=280
const OOP_CHART_H=140
const OOP_X_PAD=10
const OOP_Y_TOP=52 // maps value 90 (near the max any series reaches)
const OOP_Y_BOTTOM=132 // maps value 50 (just under the lowest any series reaches)
const OOP_V_MIN=50
const OOP_V_MAX=90

function oopX(step){return OOP_X_PAD+step*((OOP_CHART_W-2*OOP_X_PAD)/10)}
function oopY(value){
  const clamped=Math.max(OOP_V_MIN,Math.min(OOP_V_MAX,value))
  const t=(clamped-OOP_V_MIN)/(OOP_V_MAX-OOP_V_MIN)
  return OOP_Y_BOTTOM-t*(OOP_Y_BOTTOM-OOP_Y_TOP)
}
function oopPoints(series){return series.map((v,i)=>`${oopX(i)},${oopY(v)}`).join(' ')}

function toggleGroupValue0208(group){return group?.querySelector('button.active')?.dataset.value}
function setToggle0208(group,value){
  if(!group)return
  ;[...group.querySelectorAll('button')].forEach(btn=>btn.classList.toggle('active',btn.dataset.value===value))
}

function renderOveroptimization0208(){
  if(!oopPressure||!oopVerdict)return
  const pressure=Number(oopPressure.value)
  const audited=toggleGroupValue0208(oopAuditToggle)==='on'
  const series=audited?OVEROPT_AUDITED:OVEROPT_UNGATED
  if(oopPressureOut)oopPressureOut.textContent=`Pressure ${pressure} / 10`
  if(oopProxyLine)oopProxyLine.setAttribute('points',oopPoints(series.proxy))
  if(oopGoalLine)oopGoalLine.setAttribute('points',oopPoints(series.trueGoal))
  if(oopProxyMarker){oopProxyMarker.setAttribute('cx',oopX(pressure));oopProxyMarker.setAttribute('cy',oopY(series.proxy[pressure]))}
  if(oopGoalMarker){oopGoalMarker.setAttribute('cx',oopX(pressure));oopGoalMarker.setAttribute('cy',oopY(series.trueGoal[pressure]))}
  if(oopProxyReadout)oopProxyReadout.textContent=`${series.proxy[pressure]}%`
  if(oopGoalReadout)oopGoalReadout.textContent=`${series.trueGoal[pressure]}%`

  if(audited){
    oopVerdict.textContent=pressure<=OVEROPT_PEAK_PRESSURE
      ? 'Audited: the closure-rate proxy and real decision-correctness are still rising together, same as the ungated line at this pressure.'
      : 'Audited: the proxy has plateaued below the ungated line\'s peak, but decision-correctness keeps climbing instead of collapsing -- the guardrail traded some proxy upside for a real goal that never falls.'
  }else{
    oopVerdict.textContent=pressure<=OVEROPT_PEAK_PRESSURE
      ? 'No guardrail yet: pushing the proxy is still genuinely helping the real goal too.'
      : `No guardrail: past pressure ${OVEROPT_PEAK_PRESSURE}, the proxy keeps climbing while decision-correctness is now BELOW where it started (80%) -- the measure has stopped being a good measure.`
  }
}

oopPressure?.addEventListener('input',renderOveroptimization0208)
oopAuditToggle?.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{setToggle0208(oopAuditToggle,btn.dataset.value);renderOveroptimization0208()}))
renderOveroptimization0208()
