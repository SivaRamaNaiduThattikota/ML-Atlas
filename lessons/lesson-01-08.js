const advancedLesson0108=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0108(){if(advancedLesson0108)advancedLesson0108.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0108)
syncAdvancedTarget0108()

// Real deployment accuracy on genuinely new complaints never moves — 74%,
// regardless of any toggle. Only the reported number below is contaminated.
const REAL_ACCURACY=74
const DELTAS={temporal:14,proxy:25,preprocessing:8,duplicate:12}
const CAPTIONS={
  temporal:'The split was shuffled, so training now contains rows chronologically after some test rows — the model saw the future.',
  proxy:"That field is only recorded after the complaint is resolved — it isn't a feature, it's the answer wearing a disguise.",
  preprocessing:'The encoding statistics were computed using the test rows too, before the split ever happened — the test rows helped set their own encoding.',
  duplicate:"Row 11 is the same boilerplate narrative as row 5, which trained the model. The 'unseen' test row was never actually unseen.",
}

const checkboxes=[...document.querySelectorAll('.leak-checkbox')]
const output=document.querySelector('#leakageLabOutput')

function renderLeakage(){
  if(!output)return
  const active=checkboxes.filter(cb=>cb.checked).map(cb=>cb.dataset.leak)
  const rawLift=active.reduce((sum,key)=>sum+DELTAS[key],0)
  const reported=Math.min(100,REAL_ACCURACY+rawLift)
  const illusoryLift=reported-REAL_ACCURACY

  if(active.length===0){
    output.innerHTML='All four leaks off — reported accuracy equals real accuracy: nothing to hide yet.'
    return
  }

  const captions=active.map(key=>`<li>${CAPTIONS[key]}</li>`).join('')
  const quietNote=(active.length&&!active.includes('proxy')&&illusoryLift<=15)
    ?'<p class="fine-print">Notice this combination lands at a still-plausible, non-alarming number — the quiet leaks (temporal, preprocessing) are dangerous precisely because the score doesn\'t look impossible.</p>'
    :''
  const allFour=active.length===4
    ?'<p><b>Four different failures, one identical tell:</b> a test number that stops being believable, while deployment accuracy hasn\'t moved at all.</p>'
    :''

  output.innerHTML=`<p><b>Real accuracy on next week's complaints:</b> ${REAL_ACCURACY}%<br><b>Reported test accuracy:</b> ${reported}%<br><b>Illusory lift:</b> +${illusoryLift}pp</p>
<ul>${captions}</ul>${quietNote}${allFour}`
}

checkboxes.forEach(cb=>cb.addEventListener('change',renderLeakage))
renderLeakage()
