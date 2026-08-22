const advancedLesson0310=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0310(){if(advancedLesson0310)advancedLesson0310.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0310)
syncAdvancedTarget0310()

// Section 14's lab: the EDA Findings Board. Unlike the previous three
// labs in this module -- C06's continuous separation slider driving one
// trend line, C07's continuous minority-share slider driving one bar,
// C08's continuous K slider driving one comb diagram, C09's discrete
// cutoff-position slider driving one mean line -- this lab has no
// slider at all. Its one control is a two-button naive/disciplined
// toggle that flips all 8 rows of a findings grid at once, plus a
// JS-computed tally that always lands on "8 of 8" regardless of which
// mode is currently on screen.

const FINDINGS_0310=[
  {tag:'C02',label:'Univariate / bivariate',
    naive:'Mean narrative length 573.44 characters -- unremarkable.',
    honest:'Histogram shows two separate clusters (short boilerplate, long detailed); nothing sits near 573.44.',
    why:'A single mean implies homogeneity that doesn’t exist.'},
  {tag:'C03',label:'Missing-data mechanism',
    naive:'40% of satisfaction scores missing overall -- treat as random, drop.',
    honest:'Phone-channel missing rate 70% vs. web-channel 10% -- this is MAR, not MCAR.',
    why:'Blind listwise dropping would silently bias the sample toward web-channel complaints.'},
  {tag:'C04',label:'Outlier detection',
    naive:'z-score of the extreme value = 2.655, under the usual 3.0 threshold -- no outlier.',
    honest:'IQR flags it cleanly (upper bound = 9, value is 45); z is capped at 2.667 in this 9-row sample.',
    why:'z-score alone is mathematically capped at (n-1)/√n and can never reach 3 here.'},
  {tag:'C05',label:'Distribution shift',
    naive:'D = 0.625 at n=8 is below the critical value (0.680) -- no significant shift.',
    honest:'The identical D = 0.625 at n=32 clears a critical value of 0.340 -- the shift is real.',
    why:'The small-sample read dismisses a real shift purely for lack of statistical power.'},
  {tag:'C06',label:'Correlation vs. causation',
    naive:'Pooled r = -0.8981 -- a strong negative relationship between resolution time and satisfaction.',
    honest:'Split by product: credit-reporting r=-0.3162, mortgage r=+0.3162 -- both weak, one is even positive.',
    why:'The strong pooled correlation is a confounding artifact of product-type separation.'},
  {tag:'C07',label:'Class imbalance',
    naive:'77.7% accuracy -- looks like a strong model.',
    honest:'777 non-relief vs. 223 relief rows, a 3.48:1 imbalance; 77.7% is exactly the majority-class floor.',
    why:'The accuracy number alone hides that it proves nothing beyond the floor.'},
  {tag:'C08',label:'Cardinality',
    naive:'One-hot encode every categorical column the same way.',
    honest:'Product K=5 (0.5%, LOW) is fine as-is; Company K=340 (34.0%, HIGH) would explode a one-hot matrix.',
    why:'A uniform encoding plan breaks silently on the high-cardinality field.'},
  {tag:'C09',label:'Temporal leakage',
    naive:'Full-dataset mean resolution time, as of Feb 15, = 6.60 days.',
    honest:'5.00 days once the 3 rows dated after Feb 15 are excluded -- a 32.00% inflation.',
    why:'A missing date filter inflates the naive figure by 32.00%.'},
]

const board0310=document.querySelector('#findingsBoard0310')
const modeButtons0310=[...document.querySelectorAll('#s14 .lab-actions [data-mode]')]
const readout0310=document.querySelector('#findingsReadout0310')
const verdict0310=document.querySelector('#findingsVerdict0310')

let mode0310='naive'

// Build the 8 data rows once. recompute0310 only ever swaps each row's
// middle-cell text between the naive and honest strings already stored
// on FINDINGS_0310 -- the row DOM nodes themselves never get rebuilt.
const readingCells0310=[]
FINDINGS_0310.forEach(row=>{
  const rowEl=document.createElement('div')
  rowEl.setAttribute('role','row')

  const tagCell=document.createElement('span')
  tagCell.setAttribute('role','cell')
  tagCell.innerHTML=`<b>${row.tag}</b> · ${row.label}`
  rowEl.appendChild(tagCell)

  const readingCell=document.createElement('span')
  readingCell.setAttribute('role','cell')
  rowEl.appendChild(readingCell)
  readingCells0310.push(readingCell)

  const whyCell=document.createElement('span')
  whyCell.setAttribute('role','cell')
  whyCell.textContent=row.why
  rowEl.appendChild(whyCell)

  board0310?.appendChild(rowEl)
})

function syncModeButtons0310(){
  modeButtons0310.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===mode0310))
}

function recompute0310(){
  FINDINGS_0310.forEach((row,i)=>{
    readingCells0310[i].textContent=mode0310==='naive'?row.naive:row.honest
  })

  // The tally is computed from the two fixed values on each row, not
  // from whichever one happens to be on screen -- so it reads "8 of 8"
  // identically in either mode.
  const disagreements=FINDINGS_0310.filter(row=>row.naive!==row.honest).length

  if(readout0310){
    readout0310.innerHTML=`
      <div><span>ROWS SHOWN</span><b>${FINDINGS_0310.length} of ${FINDINGS_0310.length}</b></div>
      <div><span>ACTIVE MODE</span><b>${mode0310==='naive'?'Naive pass':'Disciplined pass'}</b></div>
      <div><span>DISAGREEMENT TALLY</span><b>${disagreements} of ${FINDINGS_0310.length} rows disagree between passes</b></div>
    `
  }
  if(!verdict0310)return
  verdict0310.classList.remove('verdict-red','verdict-green')
  if(mode0310==='naive'){
    verdict0310.classList.add('verdict-red')
    verdict0310.textContent='This is what a checklist-only pass would report. Every one of these 8 numbers is the wrong one, on all 8 counts.'
  }else{
    verdict0310.classList.add('verdict-green')
    verdict0310.textContent='This is what Concepts 02-09 each derived by hand. Nothing here is computed fresh -- it’s assembled.'
  }
}

modeButtons0310.forEach(btn=>btn.addEventListener('click',()=>{
  mode0310=btn.dataset.mode
  syncModeButtons0310()
  recompute0310()
}))

syncModeButtons0310()
recompute0310()
