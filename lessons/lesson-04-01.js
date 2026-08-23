const advancedLesson0401=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0401(){if(advancedLesson0401)advancedLesson0401.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0401)
syncAdvancedTarget0401()

// Section 14's lab: the Feature Signal Tester. Unlike the last three labs
// in Module 03 (C08's continuous K slider + 3 presets driving a comb
// diagram, C09's discrete cutoff slider driving a mean line, C10's
// two-button naive/disciplined toggle flipping 8 rows at once), this lab
// is a 3-way categorical selector -- A/B/C -- driving a fixed rule-based
// verdict engine. The three r-value pairs below are exactly the worked
// example's numbers from Section 10; nothing here is computed fresh in
// the browser, only replayed and classified.

const FEATURES_0401={
  A:{label:'A · Prior contact attempts',rTrain:0.9102,rHoldout:0.9102},
  B:{label:'B · Complaint-ID last digit',rTrain:0.7817,rHoldout:0.0000},
  C:{label:'C · Company-response relief flag',rTrain:1.0000,rHoldout:1.0000},
}

// The same 4-branch rule Section 12's classify_feature() codes in Python.
// Order matters: leakage is checked first because a feature can clear
// the noise/signal branches below it and still be a leakage giveaway.
function classifyFeature0401(rTrain,rHoldout){
  const gap=Math.abs(rTrain-rHoldout)
  if(Math.abs(rTrain)>=0.97&&Math.abs(rHoldout)>=0.97){
    return{cls:'verdict-red',label:'LEAKAGE — INVESTIGATE.',
      note:'A feature that predicts the outcome this perfectly, this consistently, is almost never legitimately available before the outcome exists.'}
  }
  if(gap>=0.30){
    return{cls:'verdict-amber',label:'NOISE — DISCARD.',
      note:'The correlation collapsed on unseen data: this was sampling luck in training, not a real pattern.'}
  }
  if(Math.min(Math.abs(rTrain),Math.abs(rHoldout))>=0.20){
    return{cls:'verdict-green',label:'GOOD SIGNAL.',
      note:'Moderate, stable correlation that survives a holdout split — exactly what a generalizing feature looks like.'}
  }
  return{cls:'verdict-amber',label:'WEAK SIGNAL — MARGINAL.',
    note:'Too small to call good, too stable to call noise -- a marginal contributor, not an automatic reject.'}
}

const featureButtons0401=[...document.querySelectorAll('#s14 .lab-actions [data-feature]')]
const readout0401=document.querySelector('#gateReadout0401')
const verdict0401=document.querySelector('#gateVerdict0401')

let feature0401='A'

function syncFeatureButtons0401(){
  featureButtons0401.forEach(btn=>btn.classList.toggle('active',btn.dataset.feature===feature0401))
}

function recompute0401(){
  const f=FEATURES_0401[feature0401]
  if(!f)return
  const gap=Math.abs(f.rTrain-f.rHoldout)

  if(readout0401){
    readout0401.innerHTML=`
      <div><span>TRAIN r</span><b>${f.rTrain.toFixed(4)}</b></div>
      <div><span>HOLDOUT r</span><b>${f.rHoldout.toFixed(4)}</b></div>
      <div><span>STABILITY GAP |Δr|</span><b>${gap.toFixed(4)}</b></div>
    `
  }
  if(!verdict0401)return
  verdict0401.classList.remove('verdict-red','verdict-amber','verdict-green')
  const v=classifyFeature0401(f.rTrain,f.rHoldout)
  verdict0401.classList.add(v.cls)
  verdict0401.textContent=`${v.label} ${v.note}`
}

featureButtons0401.forEach(btn=>btn.addEventListener('click',()=>{
  feature0401=btn.dataset.feature
  syncFeatureButtons0401()
  recompute0401()
}))

syncFeatureButtons0401()
recompute0401()
