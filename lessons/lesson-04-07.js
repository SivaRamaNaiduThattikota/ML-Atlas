const advancedLesson0407=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0407(){if(advancedLesson0407)advancedLesson0407.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0407)
syncAdvancedTarget0407()

// Section 14's lab: The Feature Audit Console. Unlike every prior Module 04
// lab (each driven by a slider onto a single computed number), this lab has
// no slider at all -- six candidate-select buttons, each producing a fixed
// 4-row PASS/FAIL/N-A checklist trace instead of one metric, because the
// concept being taught is a checklist, not a new formula.

const CANDIDATES_0407={
  contact:{
    label:'prior_contact_attempts', origin:'PASS', fitted:'N/A', anchor:'N/A', inherit:'N/A', verdict:'SAFE',
    reason:'Every applicable check passes -- this is a raw, self-reported, unfitted, non-combined field known at intake. Checks 2-4 are N/A because none of their conditions apply to a raw field.',
  },
  companyFlag:{
    label:'Company-response relief flag', origin:'FAIL', fitted:'N/A', anchor:'N/A', inherit:'N/A', verdict:'LEAKY',
    reason:'FAILS Check 1 -- see Concept 01: this field is only populated after the case closes, not known at the real moment of prediction.',
  },
  tier1:{
    label:'recovery_rate_by_consumer (Tier 1, naive)', origin:'N/A', fitted:'FAIL', anchor:'N/A', inherit:'N/A', verdict:'LEAKY',
    reason:'FAILS Check 2 -- see Concept 03: each row\'s group mean includes that same row\'s own label, the exact singleton self-reproduction signature Concept 03 already flagged for naive target encoding.',
  },
  caseAge:{
    label:'case_age_days', origin:'N/A', fitted:'N/A', anchor:'FAIL', inherit:'N/A', verdict:'LEAKY',
    reason:'FAILS Check 3 -- see Concept 05: anchored to date_resolved, which is not known at intake. Flagged directly, not via inheritance.',
  },
  engagement:{
    label:'engagement_score', origin:'N/A', fitted:'N/A', anchor:'N/A', inherit:'FAIL', verdict:'LEAKY',
    reason:'FAILS Check 4 -- see Concept 06: built by multiplying prior_contact_attempts (safe) by case_age_days (already leaky). The product inherits the worse input\'s status wholesale.',
  },
  tier2:{
    label:'recovery_rate_by_consumer (Tier 2, leave-out but time-blind)', origin:'N/A', fitted:'PASS', anchor:'FAIL', inherit:'N/A', verdict:'LEAKY',
    reason:'LEAKY -- passed Check 2 (no row\'s own label is used) but fails Check 3: row 101\'s value of 0.5000 was built from complaints 103 and 106, both dated AFTER row 101\'s own filing date. Passing one check never proves the others pass too.',
  },
}
const CANDIDATE_ORDER_0407=['contact','companyFlag','tier1','caseAge','engagement','tier2']

const buttons0407=[...document.querySelectorAll('#s14 .lab-actions [data-candidate]')]
const readout0407=document.querySelector('#auditReadout_0407')
const verdict0407=document.querySelector('#auditVerdict_0407')

let currentCandidate0407='contact'

function syncButtons0407(){
  buttons0407.forEach(btn=>btn.classList.toggle('active',btn.dataset.candidate===currentCandidate0407))
}

function checkRow0407(label,generalizes,value){
  const cls=value==='PASS'?'':value==='FAIL'?' style="color:var(--orange);font-weight:800"':' style="color:var(--ink-muted)"'
  return `<tr><td>${label} <small>(generalizes ${generalizes})</small></td><td${cls}>${value}</td></tr>`
}

function renderAudit0407(){
  const c=CANDIDATES_0407[currentCandidate0407]

  if(readout0407){
    readout0407.innerHTML=`
      <p><b>${c.label}</b></p>
      <table class="worked-table">
        <thead><tr><th>Check</th><th>Result</th></tr></thead>
        <tbody>
          ${checkRow0407('CHECK 1 · ORIGIN TIMING','Concept 01',c.origin)}
          ${checkRow0407('CHECK 2 · FITTED-STATISTIC ISOLATION','Concepts 03 + 04',c.fitted)}
          ${checkRow0407('CHECK 3 · ANCHOR VALIDITY','Concept 05',c.anchor)}
          ${checkRow0407('CHECK 4 · INHERITANCE THROUGH COMBINATION','Concept 06',c.inherit)}
        </tbody>
      </table>
    `
  }

  if(verdict0407){
    verdict0407.classList.remove('verdict-red','verdict-amber','verdict-green')
    verdict0407.classList.add(c.verdict==='SAFE'?'verdict-green':'verdict-red')
    verdict0407.textContent=`${c.verdict}. ${c.reason}`
  }
}

buttons0407.forEach(btn=>btn.addEventListener('click',()=>{
  currentCandidate0407=btn.dataset.candidate
  syncButtons0407()
  renderAudit0407()
}))

syncButtons0407()
renderAudit0407()
