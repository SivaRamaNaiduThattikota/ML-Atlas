const advancedLesson0107=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0107(){if(advancedLesson0107)advancedLesson0107.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0107)
syncAdvancedTarget0107()

// Fixed 10-row ledger — identical to Sections 06/10/12's worked example.
// Never regenerated: rows 9 and 10 are the only two real relief cases.
const Y_TRUE=[0,0,0,0,0,0,0,0,1,1]
const CANDIDATE=[0,0,0,1,0,0,0,0,1,0]
const RELIEF_ROWS=[8,9] // 0-indexed positions of rows 9 and 10

function score(preds){
  const correct=preds.filter((p,i)=>p===Y_TRUE[i]).length
  const caught=RELIEF_ROWS.filter(i=>preds[i]===1).length
  const falsePositives=preds.filter((p,i)=>p===1&&Y_TRUE[i]===0).length
  return {accuracy:correct/Y_TRUE.length*100,caught,total:RELIEF_ROWS.length,falsePositives}
}

const BASELINES={
  majority:{
    label:'Majority-class',
    preds:[0,0,0,0,0,0,0,0,0,0],
    verdict:'Ties on accuracy — but the candidate catches 1 of 2 real relief cases the majority-class floor catches zero of. Accuracy alone would have hidden this difference.'
  },
  heuristic:{
    label:'Heuristic rule',
    preds:[0,0,0,1,0,0,0,0,1,1],
    verdict:'The candidate loses to this floor on accuracy and catches fewer real cases (1 of 2 versus 2 of 2). Not ready against this bar.'
  },
  prior:{
    label:'Prior simple model',
    preds:[0,0,0,0,0,0,0,0,1,0],
    verdict:'The candidate loses to the model CFPB already has, with no advantage in cases caught and one extra false positive. Not ready against this bar either.'
  }
}

const baselineButtons=[...document.querySelectorAll('.baseline-button')]
const labOutput=document.querySelector('#baselineLabOutput')
const revealToggle=document.querySelector('#baselineRevealToggle')
const ledgerPanel=document.querySelector('#baselineLedgerPanel')
const REVEAL_DEFAULT_LABEL='Reveal the full ledger'
const REVEAL_OPEN_LABEL='Hide the full ledger'

function renderComparison(key){
  const baseline=BASELINES[key]
  if(!baseline||!labOutput)return
  const b=score(baseline.preds)
  const c=score(CANDIDATE)
  const delta=c.accuracy-b.accuracy
  const deltaLabel=delta>0?`+${delta.toFixed(0)}`:delta.toFixed(0)
  labOutput.innerHTML=`<table class="worked-table">
<thead><tr><th></th><th>Accuracy</th><th>Real relief cases caught</th></tr></thead>
<tbody>
<tr><td>${baseline.label}</td><td>${b.accuracy.toFixed(0)}%</td><td>${b.caught} of ${b.total}</td></tr>
<tr><td>Candidate (today's tuned model)</td><td>${c.accuracy.toFixed(0)}%</td><td>${c.caught} of ${c.total}</td></tr>
</tbody>
</table>
<p><b>&Delta; (candidate &minus; baseline): ${deltaLabel} points</b> — ${c.accuracy.toFixed(0)}% vs ${b.accuracy.toFixed(0)}%</p>
<p>${baseline.verdict}</p>`
}

baselineButtons.forEach(button=>button.addEventListener('click',()=>{
  baselineButtons.forEach(other=>other.classList.remove('active'))
  button.classList.add('active')
  renderComparison(button.dataset.baseline)
}))

if(revealToggle&&ledgerPanel){
  revealToggle.addEventListener('click',()=>{
    const isOpen=revealToggle.getAttribute('aria-pressed')==='true'
    revealToggle.setAttribute('aria-pressed',String(!isOpen))
    revealToggle.textContent=isOpen?REVEAL_DEFAULT_LABEL:REVEAL_OPEN_LABEL
    ledgerPanel.hidden=isOpen
  })
}

if(labOutput)labOutput.innerHTML='Pick a baseline above to compare it against today\'s candidate.'
