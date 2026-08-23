const advancedLesson0403=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0403(){if(advancedLesson0403)advancedLesson0403.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0403)
syncAdvancedTarget0403()

// Section 14's lab: the Fold Leakage Console. First lab to combine a
// numeric slider (fold count) with a mode-toggle button group acting on
// the same live table -- and the first whose slider controls a fold
// assignment rather than a category count (M03C08) or a static matrix
// built from two independent button groups (M04C02). The ten-row
// Company/relief_granted dataset is the fixed toy set from Section 03,
// hand-verified there; nothing here recomputes anything different --
// it recomputes the SAME naive/OOF logic live as the controls move.

const ROWS_0403=[
  {company:'A',label:1},
  {company:'B',label:0},
  {company:'C',label:1},
  {company:'D',label:0},
  {company:'E',label:0},
  {company:'F',label:1},
  {company:'G',label:0},
  {company:'H',label:1},
  {company:'I',label:1},
  {company:'I',label:1},
]

function mean0403(values){
  return values.reduce((a,b)=>a+b,0)/values.length
}

// Naive: mean of the target across every row sharing this row's category,
// including the row itself. Fold count is irrelevant -- this is the point.
function naiveEncode0403(){
  return ROWS_0403.map((row,i)=>{
    const same=ROWS_0403.filter(r=>r.company===row.company).map(r=>r.label)
    return mean0403(same)
  })
}

// Out-of-fold: fold = row index i (0-based) mod foldCount, round-robin.
// A row's encoded value comes only from rows in OTHER folds; if no
// same-company row exists outside this row's fold, fall back to that
// other fold's overall mean.
function foldsFor0403(foldCount){
  return ROWS_0403.map((_,i)=>i%foldCount)
}

function oofEncode0403(foldCount){
  const folds=foldsFor0403(foldCount)
  return ROWS_0403.map((row,i)=>{
    const k=folds[i]
    const otherSameCompany=ROWS_0403
      .filter((r,j)=>folds[j]!==k&&r.company===row.company)
      .map(r=>r.label)
    if(otherSameCompany.length)return mean0403(otherSameCompany)
    const otherFold=ROWS_0403.filter((r,j)=>folds[j]!==k).map(r=>r.label)
    return mean0403(otherFold)
  })
}

const modeButtons0403=[...document.querySelectorAll('#s14 .lab-actions [data-mode]')]
const foldSlider0403=document.querySelector('#wgFoldK_0403')
const foldOut0403=document.querySelector('#wgFoldKOut_0403')
const readout0403=document.querySelector('#foldReadout0403')
const verdict0403=document.querySelector('#foldVerdict0403')

let mode0403='naive'

function syncButtons0403(){
  modeButtons0403.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===mode0403))
  if(foldSlider0403)foldSlider0403.disabled=(mode0403==='naive')
}

function recompute0403(){
  const foldCount=foldSlider0403?Number(foldSlider0403.value):2
  if(foldOut0403)foldOut0403.textContent=String(foldCount)

  const encoded=mode0403==='naive'?naiveEncode0403():oofEncode0403(foldCount)
  const folds=foldsFor0403(foldCount)

  let matches=0
  const rowsHtml=ROWS_0403.map((row,i)=>{
    const predicted=encoded[i]>=0.5?1:0
    const isMatch=predicted===row.label
    if(isMatch)matches++
    return `<tr><td>${row.company}</td><td>${row.label}</td><td>${encoded[i].toFixed(3)}</td>`
      +`<td>${mode0403==='oof'?'Fold '+(folds[i]+1):'—'}</td>`
      +`<td>${isMatch?'✓ match':'✗ mismatch'}</td></tr>`
  }).join('')

  if(readout0403){
    readout0403.innerHTML=`
      <p><b>${mode0403==='naive'?'Naive (self-included)':'Out-of-fold'}</b> encoding`
      +`${mode0403==='oof'?`, ${foldCount} folds`:' -- fold count has no effect in this mode'}</p>
      <table class="worked-table"><thead><tr><th>Company</th><th>Label</th><th>Encoded</th><th>Fold</th><th>vs. ≥0.5 rule</th></tr></thead>
      <tbody>${rowsHtml}</tbody></table>
    `
  }

  if(!verdict0403)return
  verdict0403.classList.remove('verdict-red','verdict-amber','verdict-green')
  const rate=`${matches}/10 -- ${Math.round(matches/10*100)}% match`
  if(mode0403==='naive'){
    verdict0403.classList.add('verdict-red')
    verdict0403.textContent=`LEAKAGE. ${rate}, unchanged no matter how many folds you pick, because Naive mode never looks at folds at all.`
  }else{
    const honest=matches<=7
    verdict0403.classList.add(honest?'verdict-green':'verdict-amber')
    verdict0403.textContent=`HONEST. ${rate} -- close to this dataset's own 60% base rate. Company I's two rows still score a confirmed match every time; the eight one-off companies correctly get no free credit.`
  }
}

modeButtons0403.forEach(btn=>btn.addEventListener('click',()=>{
  mode0403=btn.dataset.mode
  syncButtons0403()
  recompute0403()
}))

if(foldSlider0403)foldSlider0403.addEventListener('input',recompute0403)

syncButtons0403()
recompute0403()
