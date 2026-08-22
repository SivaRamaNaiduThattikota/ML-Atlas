const advancedLesson0201=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0201(){if(advancedLesson0201)advancedLesson0201.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0201)
syncAdvancedTarget0201()

// The Constant-Accuracy Slider — 20 fixed test rows (5 real relief cases, 15 non-relief),
// a fixed budget of 3 wrong predictions that never changes size, only which kind of row it lands on.
// Accuracy stays locked at 17/20 = 85% across the whole slider — only who bears the error moves.
const ACC_ROWS=20
const POSITIVE_ROWS=[2,5,9,13,17]
const FN_ORDER=[2,5,9]
const FP_POOL=[0,7,14]
const TOTAL_ERRORS=3

const accGrid=document.querySelector('#accIllusionGrid')
const accSlider=document.querySelector('#accIllusionSlider')
const accReadout=document.querySelector('#accIllusionReadout')
const accVerdict=document.querySelector('#accIllusionVerdict')

function accState(k){
  const fnRows=FN_ORDER.slice(0,k)
  const fpRows=FP_POOL.slice(0,TOTAL_ERRORS-k)
  const cells=[]
  for(let i=0;i<ACC_ROWS;i++){
    const isPositive=POSITIVE_ROWS.includes(i)
    const wrong=isPositive?fnRows.includes(i):fpRows.includes(i)
    cells.push({index:i,isPositive,wrong})
  }
  const caught=POSITIVE_ROWS.length-fnRows.length
  const falseAlarms=fpRows.length
  return {cells,caught,falseAlarms}
}

function renderAccGrid(k){
  if(!accGrid||!accReadout||!accVerdict)return
  const {cells,caught,falseAlarms}=accState(k)
  accGrid.innerHTML=cells.map(cell=>{
    const kind=cell.isPositive?'acc-pos':'acc-neg'
    const state=cell.wrong?'acc-wrong':'acc-correct'
    const truth=cell.isPositive?'real relief case':'non-relief complaint'
    const verdict=cell.wrong?(cell.isPositive?'missed — predicted no relief':'false alarm — predicted relief'):'predicted correctly'
    return `<div class="acc-cell ${kind} ${state}" title="Row ${cell.index+1}: ${truth}, ${verdict}" aria-label="Row ${cell.index+1}, ${truth}, ${verdict}">${cell.index+1}</div>`
  }).join('')
  accReadout.innerHTML=`
    <div><span>ACCURACY</span><b>85.0% — fixed, every position on this slider</b></div>
    <div><span>REAL RELIEF CASES CAUGHT</span><b>${caught} of 5</b></div>
    <div><span>NON-RELIEF COMPLAINTS WRONGLY FLAGGED</span><b>${falseAlarms} of 15</b></div>
  `
  const verdictClass=falseAlarms===TOTAL_ERRORS?'verdict-amber':caught===POSITIVE_ROWS.length-TOTAL_ERRORS?'verdict-red':'verdict-amber'
  accVerdict.className=`gate-verdict ${verdictClass}`
  accVerdict.textContent=k===0
    ? 'All 3 errors are false alarms: every real relief case is caught, at the cost of 3 unnecessary flags. Same 85% as every other position on this slider.'
    : k===TOTAL_ERRORS
      ? 'All 3 errors are missed relief cases: 3 people who deserved relief are denied it, with zero false alarms. Still exactly 85% accuracy.'
      : `A mixed split: ${caught} of 5 real relief cases caught, ${falseAlarms} false alarms — still exactly 85% accuracy, the same number as both extremes.`
}

if(accSlider){
  accSlider.addEventListener('input',()=>renderAccGrid(Number(accSlider.value)))
  renderAccGrid(Number(accSlider.value))
}
