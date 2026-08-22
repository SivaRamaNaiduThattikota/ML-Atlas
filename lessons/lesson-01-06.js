const advancedLesson0106=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0106(){if(advancedLesson0106)advancedLesson0106.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0106)
syncAdvancedTarget0106()

// Fixed dataset — 12 points, y = 2x + noise. Never regenerated: every preset
// below carves this exact list, so what changes across presets is which rows
// land in which lane, not what the rows are.
const X=[1,2,3,4,5,6,7,8,9,10,11,12]
const Y=[2.4,3.7,6.2,9.0,9.5,12.3,13.8,16.6,17.6,20.1,21.4,24.5]

// Fixed shuffle order (1-indexed x values). Every preset's train/val/test are
// prefixes of this one order, so partition identity — not just partition
// size — changes deterministically with the ratio.
const SHUFFLE_ORDER=[7,2,11,4,9,1,6,12,3,8,5,10]

const SPLIT_PRESETS={
  '8-2-2':{sizes:[8,2,2],label:'8 / 2 / 2 — big train'},
  '6-3-3':{sizes:[6,3,3],label:'6 / 3 / 3 — balanced'},
  '4-4-4':{sizes:[4,4,4],label:'4 / 4 / 4 — even thirds'}
}

function vander(xs,degree){
  return xs.map(x=>{
    const row=[]
    for(let p=degree;p>=0;p--)row.push(Math.pow(x,p))
    return row
  })
}
function solveNormalEquations(A,y){
  const cols=A[0].length
  const ATA=Array.from({length:cols},()=>Array(cols).fill(0))
  const ATy=Array(cols).fill(0)
  A.forEach((row,i)=>{
    row.forEach((aij,j)=>{
      ATy[j]+=aij*y[i]
      row.forEach((aik,k)=>{ATA[j][k]+=aij*aik})
    })
  })
  const M=ATA.map((row,i)=>[...row,ATy[i]])
  for(let col=0;col<cols;col++){
    let pivot=col
    for(let r=col+1;r<cols;r++)if(Math.abs(M[r][col])>Math.abs(M[pivot][col]))pivot=r
    ;[M[col],M[pivot]]=[M[pivot],M[col]]
    for(let r=0;r<cols;r++){
      if(r===col)continue
      const factor=M[r][col]/M[col][col]
      for(let c=col;c<=cols;c++)M[r][c]-=factor*M[col][c]
    }
  }
  return M.map((row,i)=>row[cols]/row[i])
}
function evalPoly(coeffs,x){
  const degree=coeffs.length-1
  return coeffs.reduce((sum,c,i)=>sum+c*Math.pow(x,degree-i),0)
}
function mean(arr){return arr.reduce((s,v)=>s+v,0)/arr.length}

// Every preset only ever slices this one fixed order into three prefixes —
// the split is deterministic, not re-shuffled per click.
function splitIndices(sizes){
  const [nTrain,nVal,nTest]=sizes
  const order=SHUFFLE_ORDER.map(v=>v-1)
  return {
    trainIdx:order.slice(0,nTrain),
    valIdx:order.slice(nTrain,nTrain+nVal),
    testIdx:order.slice(nTrain+nVal,nTrain+nVal+nTest)
  }
}
function mseOn(coeffs,idxs){
  return mean(idxs.map(i=>(evalPoly(coeffs,X[i])-Y[i])**2))
}
function fitOnTrain(degree,trainIdx){
  const xs=trainIdx.map(i=>X[i])
  const ys=trainIdx.map(i=>Y[i])
  return solveNormalEquations(vander(xs,degree),ys)
}
function evaluatePreset(sizes){
  const {trainIdx,valIdx,testIdx}=splitIndices(sizes)
  return [0,1,2].map(degree=>{
    const coeffs=fitOnTrain(degree,trainIdx)
    return {
      degree,
      trainMse:mseOn(coeffs,trainIdx),
      valMse:mseOn(coeffs,valIdx),
      testMse:mseOn(coeffs,testIdx)
    }
  })
}

const presetButtons=[...document.querySelectorAll('.split-preset-button')]
const splitOutput=document.querySelector('#splitLabOutput')
const peekToggle=document.querySelector('#splitPeekToggle')
const PEEK_DEFAULT_LABEL="What if you'd picked using test instead?"
const PEEK_OPEN_LABEL='Hide the test-score comparison'

let currentRun=null // {label,candidates,winner} for whichever preset was last clicked

function degreeLabel(degree){
  return degree===0?'Degree 0 — constant':degree===1?'Degree 1 — line':'Degree 2 — curve'
}

function renderPeek(){
  const {candidates,winner}=currentRun
  const lowestTest=candidates.reduce((best,c)=>c.testMse<best.testMse?c:best,candidates[0])
  const rows=candidates.map(c=>{
    const style=c.degree===lowestTest.degree?' style="background:var(--orange);color:#fff"':''
    return `<tr${style}><td>${degreeLabel(c.degree)}</td><td>${c.testMse.toFixed(3)}</td></tr>`
  }).join('')
  const agrees=lowestTest.degree===winner.degree
  const verdict=agrees
    ?`<p>Peeking would have landed on ${degreeLabel(lowestTest.degree)} too — the same candidate validation already picked on its own. That agreement was never guaranteed in advance, so "it worked out this time" isn't a defense of peeking as a practice.</p>`
    :`<p>Peeking would have picked <b>${degreeLabel(lowestTest.degree)}</b> at ${lowestTest.testMse.toFixed(3)}, not validation's honest pick of <b>${degreeLabel(winner.degree)}</b> at ${winner.testMse.toFixed(3)}. The two scores are close, but the peeking pick is no longer an honest estimate of anything — test itself helped choose it.</p>`
  return `<div class="split-peek"><p class="fine-print">What picking by test score instead of validation would have shown</p><table class="worked-table"><thead><tr><th>Candidate</th><th>Test MSE</th></tr></thead><tbody>${rows}</tbody></table>${verdict}</div>`
}

function renderComparison(){
  if(!splitOutput||!currentRun)return
  const {label,candidates,winner}=currentRun
  const rows=candidates.map(c=>{
    const style=c.degree===winner.degree?' style="background:var(--green);color:#fff"':''
    return `<tr${style}><td>${degreeLabel(c.degree)}</td><td>${c.trainMse.toFixed(3)}</td><td>${c.valMse.toFixed(3)}</td></tr>`
  }).join('')
  const peekOpen=peekToggle&&peekToggle.getAttribute('aria-pressed')==='true'
  splitOutput.innerHTML=`<p class="fine-print">${label} · all three candidates fit on train only, compared on validation</p>
<table class="worked-table"><thead><tr><th>Candidate</th><th>Train MSE</th><th>Val MSE</th></tr></thead><tbody>${rows}</tbody></table>
<p><b>Validation selects ${degreeLabel(winner.degree)}</b> — its validation MSE (${winner.valMse.toFixed(3)}) is the lowest of the three.</p>
<p><b>The one honest number — test MSE: ${winner.testMse.toFixed(3)}</b></p>
${peekOpen?renderPeek():''}`
}

function runPreset(key){
  const preset=SPLIT_PRESETS[key]
  if(!preset)return
  const candidates=evaluatePreset(preset.sizes)
  const winner=candidates.reduce((best,c)=>c.valMse<best.valMse?c:best,candidates[0])
  currentRun={label:preset.label,candidates,winner}
  if(peekToggle){
    peekToggle.disabled=false
    peekToggle.setAttribute('aria-pressed','false')
    peekToggle.textContent=PEEK_DEFAULT_LABEL
  }
  renderComparison()
}

presetButtons.forEach(button=>button.addEventListener('click',()=>{
  presetButtons.forEach(other=>other.classList.remove('active'))
  button.classList.add('active')
  runPreset(button.dataset.splitPreset)
}))

if(peekToggle){
  peekToggle.disabled=true
  peekToggle.addEventListener('click',()=>{
    if(!currentRun)return
    const isOpen=peekToggle.getAttribute('aria-pressed')==='true'
    peekToggle.setAttribute('aria-pressed',String(!isOpen))
    peekToggle.textContent=isOpen?PEEK_DEFAULT_LABEL:PEEK_OPEN_LABEL
    renderComparison()
  })
}

if(splitOutput)splitOutput.innerHTML='<p class="fine-print">Pick a split ratio above — the same 12 points, sliced a different way each time.</p>'
