// Section 14's lab: The Intake Pipeline Assembler. Unlike every prior Module 04
// lab (single-select buttons picking one candidate/method/strategy), this one
// uses independent, non-exclusive toggles that ACCUMULATE -- building the
// feature set up step by step, fitting a closing concept that chains
// techniques together rather than comparing alternatives. Every number below
// was computed once via two independently-coded Node.js scripts plus a manual
// hand check on two correlations, and hardcoded here.

const FEATURES_0410=[
  {key:'scale',label:'Scale prior_contact_attempts',origin:'Concept 04',audit:'PASS (2/2 applicable checks)',absR:0.6093},
  {key:'encode',label:'OOF-encode Company',origin:'Concepts 02-03',audit:'PASS (3/3 applicable checks)',absR:0.4357},
  {key:'datetime',label:'Add day_of_week / is_weekend',origin:'Concept 05',audit:'PASS (1/1 applicable check)',absR:0.0667},
  {key:'interaction',label:'Add interaction (scaled × company rate)',origin:'Concept 06',audit:'PASS (4/4 checks, inherited)',absR:0.1647,requires:['scale','encode']},
]
const INTERACTION_MAIN_EFFECT_R=0.7986
const MISSING_ROW_MEAN=1.7143

const toggleButtons0410=[...document.querySelectorAll('#s14 .lab-actions [data-feature]')]
const missingCheckbox0410=document.querySelector('#missingRowToggle_0410')
const readout0410=document.querySelector('#assemblerReadout_0410')
const verdict0410=document.querySelector('#assemblerVerdict_0410')

let active0410=new Set()
let missingRowOn0410=false

function dependenciesMet0410(f){
  return !f.requires||f.requires.every(r=>active0410.has(r))
}

function syncButtons0410(){
  toggleButtons0410.forEach(btn=>{
    const f=FEATURES_0410.find(x=>x.key===btn.dataset.feature)
    const enabled=dependenciesMet0410(f)
    btn.classList.toggle('active',active0410.has(f.key))
    btn.disabled=!enabled&&!active0410.has(f.key)
    btn.title=enabled?'':'Needs both inputs first (Concept 06\'s inheritance rule)'
    if(!enabled&&active0410.has(f.key)){active0410.delete(f.key)}
  })
}

function render0410(){
  const built=FEATURES_0410.filter(f=>active0410.has(f.key))

  if(readout0410){
    if(!built.length){
      readout0410.innerHTML=`<p style="color:var(--muted);font-size:13px">No features built yet. Toggle the buttons above to assemble the intake pipeline step by step.</p>`
    }else{
      const rows=built.map(f=>`<tr><td>${f.label}</td><td>${f.origin}</td><td>${f.audit}</td><td>${f.absR.toFixed(4)}</td></tr>`).join('')
      readout0410.innerHTML=`<table class="worked-table"><thead><tr><th>Feature</th><th>Origin</th><th>Audit result</th><th>|r| with relief_granted</th></tr></thead><tbody>${rows}</tbody></table>`
    }
  }

  if(verdict0410){
    verdict0410.className='callout'+(missingRowOn0410?' warning':'')
    let text=`<b>${built.length} of 4 intake-time features built.</b>`
    if(built.length===4){
      text+=` 4/4 pass every applicable Concept 07 check. Filter ranking (Concept 08): prior_contact_attempts_scaled leads at |r|=0.6093, company_relief_rate follows at |r|=0.4357; the interaction trails at |r|=0.1647 and shares r=${INTERACTION_MAIN_EFFECT_R.toFixed(4)} with its own main-effect input -- a wrapper is far more likely to drop it than the filter's |r| alone would suggest.`
    }else if(built.length>0){
      text+=` Keep toggling to see each feature's audit result and filter rank as it joins.`
    }
    if(missingRowOn0410){
      text+=` <br>Row 6's prior_contact_attempts is now missing -- filled with the fit-on-train mean ${MISSING_ROW_MEAN.toFixed(4)} (from the other 7 rows), indicator R=1 for row 6 only, per Concept 09.`
    }
    verdict0410.innerHTML=text
  }
}

toggleButtons0410.forEach(btn=>btn.addEventListener('click',()=>{
  const key=btn.dataset.feature
  const f=FEATURES_0410.find(x=>x.key===key)
  if(!dependenciesMet0410(f)&&!active0410.has(key))return
  if(active0410.has(key))active0410.delete(key)
  else active0410.add(key)
  syncButtons0410()
  render0410()
}))

missingCheckbox0410?.addEventListener('change',e=>{
  missingRowOn0410=e.target.checked
  render0410()
})

syncButtons0410()
render0410()
