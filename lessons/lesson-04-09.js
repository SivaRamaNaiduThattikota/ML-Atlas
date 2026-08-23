const advancedLesson0409=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0409(){if(advancedLesson0409)advancedLesson0409.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0409)
syncAdvancedTarget0409()

// Section 14's lab: The Missingness Signal Race. A fixed 12-row CFPB table
// (fresh values, distinct from Concept 08's own table) crossed with four
// strategies -- drop, mean impute, median impute, missing indicator -- and a
// 3-position split control (Train/Holdout/All). Pearson correlation against
// relief_granted is computed live in-browser from the raw rows below, not
// looked up from a precomputed table -- the numbers this produces match the
// lesson's own worked-example text because the underlying rows are identical.

const ROWS_0409=[
  {id:1,x:0,s:9,y:1,split:'train'},
  {id:2,x:1,s:8,y:1,split:'train'},
  {id:3,x:0,s:9,y:1,split:'train'},
  {id:4,x:1,s:7,y:1,split:'train'},
  {id:5,x:2,s:6,y:1,split:'train'},
  {id:6,x:4,s:null,y:0,split:'train'},
  {id:7,x:3,s:null,y:0,split:'train'},
  {id:8,x:2,s:5,y:0,split:'train'},
  {id:9,x:4,s:null,y:0,split:'holdout'},
  {id:10,x:1,s:8,y:1,split:'holdout'},
  {id:11,x:3,s:null,y:0,split:'holdout'},
  {id:12,x:0,s:9,y:1,split:'holdout'},
]

function median0409(arr){
  const sorted=[...arr].sort((a,b)=>a-b)
  const mid=Math.floor(sorted.length/2)
  return sorted.length%2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2
}

const TRAIN_NONMISSING_S_0409=ROWS_0409.filter(r=>r.split==='train'&&r.s!==null).map(r=>r.s)
const TRAIN_MEAN_0409=TRAIN_NONMISSING_S_0409.reduce((a,b)=>a+b,0)/TRAIN_NONMISSING_S_0409.length
const TRAIN_MEDIAN_0409=median0409(TRAIN_NONMISSING_S_0409)

function pearson0409(xs,ys){
  const n=xs.length
  if(n===0)return null
  const mx=xs.reduce((a,b)=>a+b,0)/n
  const my=ys.reduce((a,b)=>a+b,0)/n
  let cov=0,vx=0,vy=0
  for(let i=0;i<n;i++){
    const dx=xs[i]-mx,dy=ys[i]-my
    cov+=dx*dy
    vx+=dx*dx
    vy+=dy*dy
  }
  if(vx===0||vy===0)return null
  return cov/Math.sqrt(vx*vy)
}

function splitRows0409(splitKey){
  if(splitKey==='all')return ROWS_0409
  return ROWS_0409.filter(r=>r.split===splitKey)
}

function fillValueFor0409(strategy){
  return strategy==='median' ? TRAIN_MEDIAN_0409 : TRAIN_MEAN_0409
}

function seriesForStrategy0409(rows,strategy){
  if(strategy==='drop'){
    const kept=rows.filter(r=>r.s!==null)
    return {xs:kept.map(r=>r.s),ys:kept.map(r=>r.y),usedRows:kept,droppedCount:rows.length-kept.length}
  }
  if(strategy==='indicator'){
    return {xs:rows.map(r=>r.s===null?1:0),ys:rows.map(r=>r.y),usedRows:rows,droppedCount:0}
  }
  const fill=fillValueFor0409(strategy)
  return {xs:rows.map(r=>r.s===null?fill:r.s),ys:rows.map(r=>r.y),usedRows:rows,droppedCount:0}
}

function verdictClassFor0409(absR){
  if(absR>=0.6)return 'verdict-green'
  if(absR>=0.3)return 'verdict-amber'
  return 'verdict-red'
}

const strategyButtons0409=[...document.querySelectorAll('#s14 .lab-actions [data-strategy]')]
const secondaryWrap0409=document.querySelector('#missSecondary_0409')
const readout0409=document.querySelector('#missingnessReadout_0409')
const verdict0409=document.querySelector('#missingnessVerdict_0409')

const SPLIT_KEYS_0409=['train','holdout','all']
const SPLIT_LABELS_0409=['Train (8)','Holdout (4)','All (12)']

let currentStrategy0409='mean'
let splitIdx0409=0

function syncStrategyButtons0409(){
  strategyButtons0409.forEach(btn=>btn.classList.toggle('active',btn.dataset.strategy===currentStrategy0409))
}

function renderSecondaryControl0409(){
  if(!secondaryWrap0409)return
  secondaryWrap0409.innerHTML=`
    <div class="control"><label for="missSplit_0409">View split <output id="missSplitOut_0409">${SPLIT_LABELS_0409[splitIdx0409]}</output></label>
    <input type="range" id="missSplit_0409" min="0" max="2" step="1" value="${splitIdx0409}"></div>
  `
  document.querySelector('#missSplit_0409')?.addEventListener('input',e=>{
    splitIdx0409=Number(e.target.value)
    renderMissingness0409()
  })
}

function cellFor0409(row){
  if(currentStrategy0409==='drop'){
    return row.s===null
      ? '<span style="color:var(--ink-muted);text-decoration:line-through">dropped</span>'
      : String(row.s)
  }
  if(currentStrategy0409==='indicator'){
    return row.s===null
      ? '<b style="color:var(--orange)">R=1</b>'
      : 'R=0'
  }
  const fill=fillValueFor0409(currentStrategy0409)
  return row.s===null
    ? `<b style="color:var(--orange)">${fill.toFixed(4)}</b>`
    : String(row.s)
}

function renderMissingness0409(){
  if(!readout0409||!verdict0409)return

  const splitKey=SPLIT_KEYS_0409[splitIdx0409]
  const rows=splitRows0409(splitKey)
  const {xs,ys,usedRows,droppedCount}=seriesForStrategy0409(rows,currentStrategy0409)
  const r=pearson0409(xs,ys)

  const colLabel=currentStrategy0409==='indicator' ? 'R (missingness indicator)' : 'satisfaction_score'
  const tableRows=rows.map(row=>`<tr><td>${row.id}</td><td>${row.x}</td><td>${cellFor0409(row)}</td><td>${row.y}</td></tr>`).join('')

  let statLine
  if(currentStrategy0409==='drop'){
    statLine=`${droppedCount} of ${rows.length} rows dropped outright in this split -- gone from training entirely, and structurally impossible to apply to a live row that still needs a prediction.`
  }else if(currentStrategy0409==='indicator'){
    const missingCount=rows.filter(row=>row.s===null).length
    statLine=`${missingCount} of ${rows.length} rows flagged missing (R=1) in this split.`
  }else{
    const fill=fillValueFor0409(currentStrategy0409)
    statLine=`Fill value in use: ${fill.toFixed(4)} -- fit on TRAIN only (6 non-missing rows), never recomputed on holdout, even while viewing ${SPLIT_LABELS_0409[splitIdx0409]}.`
  }

  readout0409.innerHTML=`<table class="worked-table"><thead><tr><th>id</th><th>prior_contact_attempts</th><th>${colLabel}</th><th>relief_granted</th></tr></thead><tbody>${tableRows}</tbody></table><p style="margin-top:10px">${statLine}</p>`

  // The comparison line always restates mean-impute vs. indicator for the
  // current split, so flipping between the two buttons shows both |r|
  // numbers side by side without leaving the control -- per the lab design.
  const meanSeries=seriesForStrategy0409(rows,'mean')
  const indicatorSeries=seriesForStrategy0409(rows,'indicator')
  const rMean=pearson0409(meanSeries.xs,meanSeries.ys)
  const rIndicator=pearson0409(indicatorSeries.xs,indicatorSeries.ys)
  const comparisonLine=`Same split, side by side: mean-imputed |r|=${rMean===null?'undefined':Math.abs(rMean).toFixed(4)} vs. missing indicator |r|=${rIndicator===null?'undefined':Math.abs(rIndicator).toFixed(4)}.`

  verdict0409.classList.remove('verdict-red','verdict-amber','verdict-green')

  if(r===null){
    verdict0409.classList.add('verdict-amber')
    if(currentStrategy0409==='drop'){
      const sharedY=usedRows.length && usedRows.every(row=>row.y===usedRows[0].y) ? usedRows[0].y : null
      verdict0409.textContent=sharedY===null
        ? `Correlation undefined -- too few rows remain after dropping in this split to compute it. ${comparisonLine}`
        : `Correlation undefined -- only ${usedRows.length} rows remain after dropping here, and they all share the same outcome (relief_granted=${sharedY}), so there's no target variation left to correlate against. ${comparisonLine}`
    }else{
      verdict0409.textContent=`Correlation undefined for this strategy/split combination -- not enough variation in this column here. ${comparisonLine}`
    }
    return
  }

  const absR=Math.abs(r)
  const isHoldoutIndicatorEdgeCase=splitKey==='holdout'&&currentStrategy0409==='indicator'&&Math.abs(absR-1)<1e-9

  if(isHoldoutIndicatorEdgeCase){
    verdict0409.classList.add('verdict-amber')
    verdict0409.textContent=`|r|=${absR.toFixed(4)} -- n=4 here, so a perfect split is a small-sample artifact, not a guarantee this generalizes. ${comparisonLine}`
  }else{
    verdict0409.classList.add(verdictClassFor0409(absR))
    verdict0409.textContent=`|r| with relief_granted = ${absR.toFixed(4)} for ${currentStrategy0409} on ${SPLIT_LABELS_0409[splitIdx0409]}. ${comparisonLine}`
  }
}

strategyButtons0409.forEach(btn=>btn.addEventListener('click',()=>{
  currentStrategy0409=btn.dataset.strategy
  syncStrategyButtons0409()
  renderMissingness0409()
}))

syncStrategyButtons0409()
renderSecondaryControl0409()
renderMissingness0409()
