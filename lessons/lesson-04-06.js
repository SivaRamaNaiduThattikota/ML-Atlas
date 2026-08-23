const advancedLesson0406=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0406(){if(advancedLesson0406)advancedLesson0406.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0406)
syncAdvancedTarget0406()

// Section 14's lab: the Feature Combiner. Unlike Concept 05's decoder -- which
// gated a single elapsed-time anchor against one draggable date -- this lab gates
// TWO inputs at once with an OR-rule, across three different derived-feature
// types, and surfaces a second, independent multicollinearity readout alongside
// the leakage verdict.

const ROWS_0406=[
  {id:101,consumer:'C001',product:'Mortgage',received:'2023-01-06',attempts:2,gap:null,caseAge:19},
  {id:102,consumer:'C002',product:'Credit reporting',received:'2023-01-07',attempts:0,gap:null,caseAge:13},
  {id:103,consumer:'C001',product:'Mortgage',received:'2023-02-10',attempts:3,gap:35,caseAge:14},
  {id:104,consumer:'C003',product:'Debt collection',received:'2023-02-13',attempts:1,gap:null,caseAge:21},
  {id:105,consumer:'C002',product:'Credit reporting',received:'2023-03-01',attempts:4,gap:53,caseAge:9},
  {id:106,consumer:'C001',product:'Mortgage',received:'2023-03-15',attempts:2,gap:33,caseAge:15},
]

// Each input's own validity, established by earlier concepts -- reused here,
// not re-derived. Nothing about this lab's arithmetic can change these flags.
const ATTEMPTS_LEAKY_0406=false // self-reported at intake
const GAP_LEAKY_0406=false      // days_since_last_complaint, validated safe in Concept 05
const CASEAGE_LEAKY_0406=true   // case_age_days, flagged leaky in Concept 05

function pearson0406(xs,ys){
  const n=xs.length
  const mx=xs.reduce((a,b)=>a+b,0)/n
  const my=ys.reduce((a,b)=>a+b,0)/n
  let cov=0,vx=0,vy=0
  for(let i=0;i<n;i++){
    cov+=(xs[i]-mx)*(ys[i]-my)
    vx+=(xs[i]-mx)**2
    vy+=(ys[i]-my)**2
  }
  return cov/Math.sqrt(vx*vy)
}
const CORR_R_0406=pearson0406(ROWS_0406.map(r=>r.attempts),ROWS_0406.map(r=>r.caseAge))

function groupMean0406(product){
  const members=ROWS_0406.filter(r=>r.product===product)
  return members.reduce((sum,r)=>sum+r.caseAge,0)/members.length
}

const modeButtons0406=[...document.querySelectorAll('#s14 .lab-actions [data-mode]')]
const rowSlider0406=document.querySelector('#wgRow_0406')
const rowOut0406=document.querySelector('#wgRowOut_0406')
const readout0406=document.querySelector('#combinerReadout_0406')
const verdict0406=document.querySelector('#combinerVerdict_0406')

let mode0406='ratio'

function syncButtons0406(){
  modeButtons0406.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===mode0406))
}

function readoutCard0406(label,value){
  return `<div><span>${label}</span><b>${value}</b></div>`
}

function recompute0406(){
  const rowIndex=rowSlider0406?Number(rowSlider0406.value)-1:0
  const row=ROWS_0406[rowIndex]
  if(rowOut0406)rowOut0406.textContent=String(row.id)

  if(!readout0406||!verdict0406)return
  verdict0406.classList.remove('verdict-red','verdict-amber','verdict-green')

  if(mode0406==='ratio'){
    const leaky=ATTEMPTS_LEAKY_0406||GAP_LEAKY_0406
    const hasGap=row.gap!==null
    const value=hasGap?(row.attempts/row.gap).toFixed(4):'N/A -- first complaint on file, no prior gap to divide by'
    readout0406.innerHTML=[
      readoutCard0406('ROW',row.id),
      readoutCard0406('prior_contact_attempts',row.attempts),
      readoutCard0406('days_since_last_complaint',hasGap?row.gap:'-- (first on file)'),
      readoutCard0406('contact_rate',value),
    ].join('')
    verdict0406.classList.add('verdict-green')
    verdict0406.textContent=`SAFE -- both inputs are known at intake (prior_contact_attempts is self-reported at filing; days_since_last_complaint was validated safe in Concept 05). derived.leaky = ${ATTEMPTS_LEAKY_0406} OR ${GAP_LEAKY_0406} = false. Drag any row; the verdict never changes, because it depends on the inputs' own validity, not on which row is selected.`
  }else if(mode0406==='product'){
    const leaky=ATTEMPTS_LEAKY_0406||CASEAGE_LEAKY_0406
    const value=row.attempts*row.caseAge
    readout0406.innerHTML=[
      readoutCard0406('ROW',row.id),
      readoutCard0406('prior_contact_attempts',row.attempts),
      readoutCard0406('case_age_days (leaky, Concept 05)',row.caseAge),
      readoutCard0406('engagement_score',value),
      readoutCard0406('MULTICOLLINEARITY',`r = ${CORR_R_0406.toFixed(4)}`),
    ].join('')
    verdict0406.classList.add('verdict-red')
    let text=`INHERITED LEAKAGE -- derived.leaky = ${ATTEMPTS_LEAKY_0406} OR ${CASEAGE_LEAKY_0406} = true, because case_age_days already failed Concept 05's anchor check. MULTICOLLINEARITY WATCH: r = ${CORR_R_0406.toFixed(4)} between these same two inputs across all 6 rows -- even ignoring the leakage problem, they already overlap.`
    if(row.attempts===0)text+=` Row ${row.id} evaluates to 0 (0 × ${row.caseAge} = 0) -- a boundary case: the value is zero, but the feature is still structurally leaky.`
    verdict0406.textContent=text
  }else{
    const leaky=CASEAGE_LEAKY_0406
    const mean=groupMean0406(row.product)
    const members=ROWS_0406.filter(r=>r.product===row.product)
    readout0406.innerHTML=[
      readoutCard0406('ROW',row.id),
      readoutCard0406('Product',row.product),
      readoutCard0406('Group members',members.map(r=>r.id).join(', ')),
      readoutCard0406('case_age_days in group',members.map(r=>r.caseAge).join(', ')),
      readoutCard0406('avg_case_age_by_product',mean.toFixed(4)),
    ].join('')
    verdict0406.classList.add('verdict-red')
    verdict0406.textContent=`INHERITED LEAKAGE -- derived.leaky = ${leaky}, because this groups case_age_days by Product and inherits case_age_days' anchor failure wholesale. Distinct from Concept 03's target encoding: this groups a feature by another feature's category, not by the label, so there's no self-inclusion-of-the-target risk -- but the group means should still be fit on the training split only, per Concepts 01/04's general rule.`
  }
}

modeButtons0406.forEach(btn=>btn.addEventListener('click',()=>{
  mode0406=btn.dataset.mode
  syncButtons0406()
  recompute0406()
}))
rowSlider0406?.addEventListener('input',recompute0406)

syncButtons0406()
recompute0406()
