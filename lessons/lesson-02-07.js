const advancedLesson0207=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0207(){if(advancedLesson0207)advancedLesson0207.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0207)
syncAdvancedTarget0207()

// The Metric Compass — a decision engine, not a number-cruncher. Four inputs describe a business
// problem's shape in the same terms Concepts 01-06 already built (target type is fixed to
// "classifier" here, since that's Model 1's and Model 2's case); the output names which of the six
// already-defined metrics should be the TUNING target, which should be a GUARDRAIL, and which (if
// any) should be a COMPANION. Every formula it points at was proven in Concepts 01-06 -- this
// function derives none of them again, it only routes between them.

function decideMetric0207({costRatio,balance,stage,probUse}){
  const ruledOut=[]
  if(balance==='rare')ruledOut.push('Accuracy (Concept 01) — a rare outcome makes the majority-class floor look strong while catching nothing')
  else if(costRatio>1)ruledOut.push('Accuracy (Concept 01) — it weighs a false alarm and a missed case identically, which this cost ratio says is wrong')
  ruledOut.push('MAE / RMSE / R² (Concept 05) — built for a numeric target; a classifier predicts a class, not a number')

  let primary,guardrail,rationale
  if(stage==='comparing'){
    primary=balance==='rare'
      ? 'PR-AUC (Concept 04) — the more honest ranking summary once the positive class is this rare'
      : 'PR-AUC or ROC-AUC (Concept 04) — the two summaries track each other closely this close to balanced'
    guardrail='None yet — no threshold is fixed, so there is nothing to protect at a cutoff yet'
    rationale='No deployment threshold exists yet, so the tuning target has to be a metric that summarizes ranking quality across every threshold at once, not one frozen operating point.'
    ruledOut.push('F1 at a fixed threshold (Concept 03) — there is no fixed threshold yet to compute it at')
  }else{
    if(costRatio===1){
      primary='F1 at the deployed threshold (Concept 03) — equal weighting is exactly what F1 already assumes'
      guardrail='None beyond F1 itself — equal costs means no single error type needs separate protection'
    }else if(costRatio<=3){
      primary='Recall at the deployed threshold (Concept 03), tuned upward'
      guardrail=`A precision floor around 40% — enough recall priority for a ${costRatio}:1 cost gap without letting reviewer load run unchecked`
      ruledOut.push('Plain F1 (Concept 03) — its 50/50 weighting undershoots how much this cost gap favors recall')
    }else if(costRatio<=6){
      primary='Recall at the deployed threshold (Concept 03), tuned further upward'
      guardrail=`A looser precision floor around 30% — a ${costRatio}:1 gap tolerates more false alarms to keep missed cases rarer`
      ruledOut.push('Plain F1 (Concept 03) — badly undershoots recall priority at this cost gap')
    }else{
      primary='Recall-maximizing at the deployed threshold (Concept 03)'
      guardrail=`Only a loose precision floor around 20% — at a ${costRatio}:1 gap, most false alarms are an acceptable price for fewer missed cases`
      ruledOut.push('Plain F1 (Concept 03) — treats this cost gap as if it were 1:1, which it is nowhere close to')
    }
    rationale='A threshold is already fixed, so the tuning target is the ratio Concept 03 already defined — recall or precision at that exact operating point — weighted by how lopsided the real costs are.'
  }
  const companion=probUse==='literal'
    ? 'Calibration / Brier score (Concept 06) — monitored because the raw probability is read literally somewhere downstream'
    : 'None needed — the probability is only ever compared to a threshold or used to rank, never read literally'
  return {primary,guardrail,companion,ruledOut,rationale}
}

const mcCostRatio=document.querySelector('#mcCostRatio')
const mcCostRatioOut=document.querySelector('#mcCostRatioOut')
const mcBalanceToggle=document.querySelector('#mcBalanceToggle')
const mcStageToggle=document.querySelector('#mcStageToggle')
const mcProbToggle=document.querySelector('#mcProbToggle')
const mcPrimary=document.querySelector('#mcPrimary')
const mcGuardrail=document.querySelector('#mcGuardrail')
const mcCompanion=document.querySelector('#mcCompanion')
const mcRuledOut=document.querySelector('#mcRuledOut')
const mcVerdict=document.querySelector('#mcVerdict')
const mcPresetModel1=document.querySelector('#mcPresetModel1')
const mcPresetModel2=document.querySelector('#mcPresetModel2')

function toggleGroupValue0207(group){return group?.querySelector('button.active')?.dataset.value}

function setToggle0207(group,value){
  if(!group)return
  ;[...group.querySelectorAll('button')].forEach(btn=>btn.classList.toggle('active',btn.dataset.value===value))
}

function renderMetricCompass0207(){
  if(!mcCostRatio||!mcVerdict)return
  const costRatio=Number(mcCostRatio.value)
  const balance=toggleGroupValue0207(mcBalanceToggle)
  const stage=toggleGroupValue0207(mcStageToggle)
  const probUse=toggleGroupValue0207(mcProbToggle)
  if(mcCostRatioOut)mcCostRatioOut.textContent=costRatio===1?'1 : 1 — equal cost':`${costRatio} : 1 — a missed case costs ${costRatio}× a false alarm`
  const {primary,guardrail,companion,ruledOut,rationale}=decideMetric0207({costRatio,balance,stage,probUse})
  if(mcPrimary)mcPrimary.textContent=primary
  if(mcGuardrail)mcGuardrail.textContent=guardrail
  if(mcCompanion)mcCompanion.textContent=companion
  if(mcRuledOut)mcRuledOut.innerHTML=ruledOut.map(item=>`<li>${item}</li>`).join('')
  mcVerdict.textContent=rationale
}

;[mcBalanceToggle,mcStageToggle,mcProbToggle].forEach(group=>{
  group?.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{setToggle0207(group,btn.dataset.value);renderMetricCompass0207()}))
})
mcCostRatio?.addEventListener('input',renderMetricCompass0207)
mcPresetModel1?.addEventListener('click',()=>{
  mcCostRatio.value='3'
  setToggle0207(mcBalanceToggle,'rare')
  setToggle0207(mcStageToggle,'comparing')
  setToggle0207(mcProbToggle,'threshold')
  renderMetricCompass0207()
})
mcPresetModel2?.addEventListener('click',()=>{
  mcCostRatio.value='1'
  setToggle0207(mcBalanceToggle,'balanced')
  setToggle0207(mcStageToggle,'comparing')
  setToggle0207(mcProbToggle,'threshold')
  renderMetricCompass0207()
})
renderMetricCompass0207()
