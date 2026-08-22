const advancedLesson0210=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0210(){if(advancedLesson0210)advancedLesson0210.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0210)
syncAdvancedTarget0210()

// Section 14's lab: The Decision Ledger -- applies Concepts 07-09's three checks
// (guardrail, statistical significance, practical significance) to the exact
// candidate A / candidate B numbers this lesson locks in. Nothing here computes a
// new metric; it only routes the already-computed precision/recall numbers and
// Concept 09's already-computed significance verdict through a floor decision.

const CANDIDATE_A_0210={precision:64.0,recall:71.7}
const CANDIDATE_B_0210={precision:57.7,recall:72.2}
const RECALL_GAP_STAT_SIGNIFICANT_0210=false   // Concept 09: p≈0.92
const RECALL_GAP_PRACTICALLY_SIGNIFICANT_0210=false // Concept 09: 0.4pt gap < 2.0pt floor

const floorSlider0210=document.querySelector('#dlFloorSlider')
const floorOut0210=document.querySelector('#dlFloorOut')
const assumeToggle0210=document.querySelector('#dlAssumeToggle')
const aPassBox0210=document.querySelector('#dlAPass')
const bPassBox0210=document.querySelector('#dlBPass')
const verdictBox0210=document.querySelector('#dlVerdict')

function toggleGroupValue0210(group){return group?.querySelector('button.active')?.dataset.value}
function setToggle0210(group,value){
  if(!group)return
  ;[...group.querySelectorAll('button')].forEach(btn=>btn.classList.toggle('active',btn.dataset.value===value))
}

function render0210(){
  if(!floorSlider0210)return
  const floor=Number(floorSlider0210.value)
  const assumeGapReal=toggleGroupValue0210(assumeToggle0210)==='on'
  if(floorOut0210)floorOut0210.textContent=`Precision floor ≥ ${floor.toFixed(1)}%`

  const aPasses=CANDIDATE_A_0210.precision>=floor
  const bPasses=CANDIDATE_B_0210.precision>=floor
  if(aPassBox0210){aPassBox0210.textContent=aPasses?'PASS':'FAIL';aPassBox0210.classList.toggle('warning',!aPasses)}
  if(bPassBox0210){bPassBox0210.textContent=bPasses?'PASS':'FAIL';bPassBox0210.classList.toggle('warning',!bPasses)}

  const recallGapCounts=assumeGapReal||(RECALL_GAP_STAT_SIGNIFICANT_0210&&RECALL_GAP_PRACTICALLY_SIGNIFICANT_0210)

  let verdict
  if(!aPasses&&!bPasses){
    verdict=`Neither candidate clears a ${floor.toFixed(1)}% precision floor -- at this setting the floor itself needs reconsidering, not the metric choice.`
  }else if(aPasses&&!bPasses){
    verdict=`Only candidate A clears the guardrail -- A wins by default, regardless of the recall gap.`
  }else if(!aPasses&&bPasses){
    verdict=`Only candidate B clears the guardrail -- B wins by default here, even though its recall edge over A is${assumeGapReal?'':' not'} treated as real.`
  }else if(recallGapCounts){
    verdict=`Both candidates clear the guardrail. Treating the recall gap as real and large enough, candidate B's 0.4-point recall edge tips the decision to B.`
  }else{
    verdict=`Both candidates clear the guardrail. Candidate B's 0.4-point recall edge is neither statistically significant (Concept 09: p≈0.92) nor above the 2.0-point practical floor -- it does not tip the decision. Candidate A wins on precision alone (64.0% vs. 57.7%), landing Model 1 on candidate A.`
  }
  if(verdictBox0210)verdictBox0210.textContent=verdict
}

floorSlider0210?.addEventListener('input',render0210)
assumeToggle0210?.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{setToggle0210(assumeToggle0210,btn.dataset.value);render0210()}))
render0210()
