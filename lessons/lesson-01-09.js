const advancedLesson0109=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0109(){if(advancedLesson0109)advancedLesson0109.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0109)
syncAdvancedTarget0109()

const ITEM_LABELS=[
  'Items 1–2 · Real target & correct paradigm',
  'Items 3–5 · Generalization & bias-variance',
  'Item 6 · Honest, never-peeked split',
  'Item 7 · Named baseline before candidate',
  'Item 8 · Leakage audit (all four types)',
]

const SCENARIOS={
  firstDraft:{
    label:"Section 03's first-draft CFPB plan",
    results:['pass','deferred','fail','fail','fail'],
    reasons:[
      'Relief outcome is a real, recorded label; task is supervised classification.',
      'No model has been fit yet — not yet checkable.',
      'The plan shuffles complaints, discarding the weekly-pull time structure.',
      'No baseline was named before the 95% target was proposed.',
      'The scaler is fit on the full dataset before splitting — preprocessing leakage.',
    ],
  },
  churn:{
    label:'A too-good-to-be-true churn model',
    results:['pass','pass','pass','pass','fail'],
    reasons:[
      'Real churn label, correct supervised paradigm.',
      'Training and true error checked together, no overfit signature.',
      'Chronological split correctly respects time order.',
      'Majority-class baseline named and cleared.',
      "'Days since cancellation' cannot exist for a still-active customer — target-via-proxy leakage.",
    ],
  },
  revised:{
    label:'CFPB Model 1, revised and ready',
    results:['pass','pass','pass','pass','pass'],
    reasons:[
      'Real relief-outcome label, correct supervised paradigm.',
      'Bias-variance behavior checked once the candidate was fit.',
      'Chronological, weekly-pull-respecting split.',
      '~77.7% majority-class floor named and logged before scoring the candidate.',
      'Post-resolution fields excluded; Company-encoding fit on train only; no uncontrolled duplicates.',
    ],
  },
}

const scenarioButtons=[...document.querySelectorAll('.scenario-button')]
const output=document.querySelector('#checklistLabOutput')

function renderScenario(key){
  const scenario=SCENARIOS[key]
  if(!scenario||!output)return
  const rows=ITEM_LABELS.map((label,i)=>{
    const result=scenario.results[i]
    const mark=result==='pass'?'✓ PASS':result==='fail'?'✗ FAIL':'… DEFERRED'
    const cls=result==='pass'?'audit-pass':result==='fail'?'audit-fail':'audit-deferred'
    return `<li class="${cls}"><b>${mark}</b> — ${label}<br><span class="fine-print">${scenario.reasons[i]}</span></li>`
  }).join('')
  const failCount=scenario.results.filter(r=>r==='fail').length
  const summary=failCount===0
    ?'All checkable items pass — this plan is ready to proceed to Data.'
    :`${failCount} item${failCount>1?'s':''} failed — fix these before writing any modeling code.`
  output.innerHTML=`<p><b>${scenario.label}</b></p><ol>${rows}</ol><p>${summary}</p>`
}

scenarioButtons.forEach(button=>button.addEventListener('click',()=>{
  scenarioButtons.forEach(other=>other.classList.remove('active'))
  button.classList.add('active')
  renderScenario(button.dataset.scenario)
}))
