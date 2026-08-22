const advancedLesson0202=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0202(){if(advancedLesson0202)advancedLesson0202.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0202)
syncAdvancedTarget0202()

// The Confusion Matrix Builder — 15 CFPB-style complaint rows, 5 real relief cases (circles), 10 non-relief (squares).
// Nothing is fixed here: click any row to flip its prediction and the live 2x2 matrix + accuracy readout below
// recompute from your own clicks. Two presets jump straight to Model A and Model B from Concept 01.
const CM_ROWS=15
const CM_POSITIVE=[1,4,7,10,13]
const CM_PRESET_PARTIAL=[1,4,7,2,9]

const cmGrid=document.querySelector('#cmBuilderGrid')
const cmTable=document.querySelector('#cmBuilderTable')
const cmReadout=document.querySelector('#cmBuilderReadout')
const cmVerdict=document.querySelector('#cmBuilderVerdict')
const cmReset=document.querySelector('#cmResetMajority')
const cmPreset=document.querySelector('#cmPresetPartial')

let predictedPositive=new Set()

function cmBucket(index){
  const actual=CM_POSITIVE.includes(index)
  const predicted=predictedPositive.has(index)
  if(actual&&predicted)return 'tp'
  if(!actual&&predicted)return 'fp'
  if(actual&&!predicted)return 'fn'
  return 'tn'
}

function renderCmBuilder(){
  if(!cmGrid||!cmTable||!cmReadout||!cmVerdict)return
  const counts={tp:0,fp:0,fn:0,tn:0}
  cmGrid.innerHTML=Array.from({length:CM_ROWS},(_,i)=>{
    const bucket=cmBucket(i)
    counts[bucket]++
    const actual=CM_POSITIVE.includes(i)
    const predicted=predictedPositive.has(i)
    const shape=actual?'cm-circle':'cm-square'
    const label=`Row ${i+1}: actual ${actual?'relief':'no relief'}, predicted ${predicted?'relief':'no relief'} — ${bucket.toUpperCase()}`
    return `<button type="button" class="cm-cell cm-${bucket} ${shape}" data-index="${i}" title="${label}" aria-label="${label}" aria-pressed="${predicted}">${bucket.toUpperCase()}</button>`
  }).join('')
  const total=counts.tp+counts.fp+counts.fn+counts.tn
  const accuracy=(counts.tp+counts.tn)/total
  cmTable.innerHTML=`
    <div class="matrix-corner"></div><div class="matrix-axis">Predicted: relief</div><div class="matrix-axis">Predicted: no relief</div>
    <div class="matrix-axis">Actual: relief</div><div class="matrix-cell tp"><b>${counts.tp}</b><span>TP</span></div><div class="matrix-cell fn"><b>${counts.fn}</b><span>FN</span></div>
    <div class="matrix-axis">Actual: no relief</div><div class="matrix-cell fp"><b>${counts.fp}</b><span>FP</span></div><div class="matrix-cell tn"><b>${counts.tn}</b><span>TN</span></div>
  `
  cmReadout.innerHTML=`
    <div><span>ACCURACY</span><b>${(accuracy*100).toFixed(1)}% = (${counts.tp}+${counts.tn}) / ${total}</b></div>
    <div><span>ROW COUNT CHECK</span><b>${counts.tp}+${counts.fp}+${counts.fn}+${counts.tn} = ${total}</b></div>
  `
  const consistent=total===CM_ROWS
  cmVerdict.className=`gate-verdict ${consistent?'verdict-green':'verdict-red'}`
  cmVerdict.textContent=consistent
    ? `Every one of the ${CM_ROWS} rows landed in exactly one cell — that invariant holds no matter which rows you flip.`
    : `Something's off: the four cells should always sum to ${CM_ROWS} rows.`
}

if(cmGrid){
  cmGrid.addEventListener('click',event=>{
    const button=event.target.closest('.cm-cell')
    if(!button)return
    const index=Number(button.dataset.index)
    if(predictedPositive.has(index))predictedPositive.delete(index)
    else predictedPositive.add(index)
    renderCmBuilder()
  })
}
cmReset?.addEventListener('click',()=>{predictedPositive=new Set();renderCmBuilder()})
cmPreset?.addEventListener('click',()=>{predictedPositive=new Set(CM_PRESET_PARTIAL);renderCmBuilder()})
renderCmBuilder()
