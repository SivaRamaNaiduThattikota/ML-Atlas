const advancedLesson0110=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0110(){if(advancedLesson0110)advancedLesson0110.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0110)
syncAdvancedTarget0110()

const GATES=['Gate 1 · Rule already exists','Gate 2 · Guarantee required','Gate 3 · Insufficient data','Gate 4 · Cost of error too high']

const GATE_SCENARIOS={
  spam:{
    label:'Spam filtering',
    failsAt:-1,
    notes:['No deterministic rule catches all spam.','No absolute guarantee required.','Ample labeled examples exist.','An occasional miss is tolerable.'],
    verdict:'Clears all four gates — ML is a reasonable choice.',
  },
  tax:{
    label:'Tax withholding calculation',
    failsAt:0,
    notes:['An exact, deterministic table already computes the correct withholding.'],
    verdict:'Stops at Gate 1 — use the existing rule, not a model.',
  },
  dosing:{
    label:'Life-support device dosing',
    failsAt:1,
    notes:['No rule exists for this specific decision.','The domain demands guaranteed, fully-explainable behavior no statistical model can promise.'],
    verdict:'Stops at Gate 2 — this needs guaranteed behavior, not a statistical model.',
  },
  fraud:{
    label:'50-of-10-million fraud labels',
    failsAt:2,
    notes:['No existing rule solves it.','No absolute guarantee required.','50 positive examples out of 10,000,000 rows is too little signal to learn a real pattern from.'],
    verdict:'Stops at Gate 3 — not enough data yet, revisit once more genuine positives accumulate.',
  },
  cfpb:{
    label:'CFPB relief-risk (Model 1)',
    failsAt:-1,
    notes:['No deterministic relief-eligibility rule exists.','No absolute-guarantee requirement — predictions are human-reviewed.','Real historical labels exist at meaningful volume.','An occasional wrong prediction is reviewable, not catastrophic.'],
    verdict:'Clears all four gates — ML is the right call, then proceed to Concept 09\'s checklist.',
  },
}

const gateButtons=[...document.querySelectorAll('.gate-scenario-button')]
const output=document.querySelector('#gateLabOutput')

function renderGateScenario(key){
  const scenario=GATE_SCENARIOS[key]
  if(!scenario||!output)return
  const rows=GATES.map((gate,i)=>{
    if(scenario.failsAt>=0&&i>scenario.failsAt){
      return `<li class="audit-deferred"><b>… NOT CHECKED</b> — ${gate}<br><span class="fine-print">Already stopped at an earlier gate.</span></li>`
    }
    const failed=i===scenario.failsAt
    const mark=failed?'✗ FAILS':'✓ clears'
    const cls=failed?'audit-fail':'audit-pass'
    return `<li class="${cls}"><b>${mark}</b> — ${gate}<br><span class="fine-print">${scenario.notes[i]}</span></li>`
  }).join('')
  output.innerHTML=`<p><b>${scenario.label}</b></p><ol>${rows}</ol><p><b>${scenario.verdict}</b></p>`
}

gateButtons.forEach(button=>button.addEventListener('click',()=>{
  gateButtons.forEach(other=>other.classList.remove('active'))
  button.classList.add('active')
  renderGateScenario(button.dataset.gateScenario)
}))
