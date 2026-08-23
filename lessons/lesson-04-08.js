const advancedLesson0408=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0408(){if(advancedLesson0408)advancedLesson0408.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0408)
syncAdvancedTarget0408()

// Section 14's lab: The Selection Method Comparator. The first Module 04 lab
// whose secondary control changes shape depending on which method family is
// selected -- a threshold slider for Filter, a discrete step scrubber for
// Wrapper, and a lambda slider for Embedded -- all three built from the same
// precomputed, script-verified 12-row candidate table.

const FEATURES_0408=[
  {key:'x1',label:'prior_contact_attempts',absR:0.8628,variance:1.5764},
  {key:'x2',label:'satisfaction_score',absR:0.8616,variance:1.8333},
  {key:'x3',label:'narrative_length_words',absR:0.0856,variance:136.4167},
  {key:'x4',label:'channel_flag',absR:0.4472,variance:0.1389},
]

const WRAPPER_STEPS_0408=[
  {step:1,subset:['x1','x2','x3','x4'],loo:0.917,action:'Drop narrative_length_words (lowest |r|, matches the filter finding)'},
  {step:2,subset:['x1','x2','x4'],loo:1.000,action:'Drop satisfaction_score (redundant with prior_contact_attempts, r=-0.9314)'},
  {step:3,subset:['x1','x4'],loo:1.000,action:'Drop channel_flag (no accuracy loss)'},
  {step:4,subset:['x1'],loo:1.000,action:'Final -- x1 alone already separates all 12 rows perfectly'},
]

const EMBEDDED_LAMBDAS_0408=[
  {lambda:0.00,coefs:[-8.974,4.958,-1.000,0.348]},
  {lambda:0.05,coefs:[-2.507,0.824,0.000,0.000]},
  {lambda:0.10,coefs:[-1.376,0.728,0.000,0.000]},
  {lambda:0.20,coefs:[-0.642,0.482,0.000,0.000]},
  {lambda:0.35,coefs:[-0.191,0.151,0.000,0.000]},
]

const methodButtons0408=[...document.querySelectorAll('#s14 .lab-actions [data-method]')]
const secondaryWrap0408=document.querySelector('#selSecondary_0408')
const readout0408=document.querySelector('#selectionReadout_0408')
const verdict0408=document.querySelector('#selectionVerdict_0408')

let currentMethod0408='filter'
let filterThreshold0408=0.40
let wrapperStep0408=1
let embeddedIdx0408=1

function syncMethodButtons0408(){
  methodButtons0408.forEach(btn=>btn.classList.toggle('active',btn.dataset.method===currentMethod0408))
}

function renderSecondaryControl0408(){
  if(!secondaryWrap0408)return
  if(currentMethod0408==='filter'){
    secondaryWrap0408.innerHTML=`
      <div class="control"><label for="selFilterThreshold_0408">Correlation keep-threshold |r| ≥ <output id="selFilterThresholdOut_0408">${filterThreshold0408.toFixed(2)}</output></label>
      <input type="range" id="selFilterThreshold_0408" min="0" max="0.90" step="0.01" value="${filterThreshold0408}"></div>
    `
    document.querySelector('#selFilterThreshold_0408')?.addEventListener('input',e=>{
      filterThreshold0408=Number(e.target.value)
      renderSelection0408()
    })
  }else if(currentMethod0408==='wrapper'){
    secondaryWrap0408.innerHTML=`
      <div class="control"><label for="selWrapperStep_0408">Elimination step <output id="selWrapperStepOut_0408">${wrapperStep0408}</output></label>
      <input type="range" id="selWrapperStep_0408" min="1" max="4" step="1" value="${wrapperStep0408}"></div>
    `
    document.querySelector('#selWrapperStep_0408')?.addEventListener('input',e=>{
      wrapperStep0408=Number(e.target.value)
      renderSelection0408()
    })
  }else{
    secondaryWrap0408.innerHTML=`
      <div class="control"><label for="selEmbeddedIdx_0408">Regularization strength λ <output id="selEmbeddedIdxOut_0408">${EMBEDDED_LAMBDAS_0408[embeddedIdx0408].lambda.toFixed(2)}</output></label>
      <input type="range" id="selEmbeddedIdx_0408" min="0" max="${EMBEDDED_LAMBDAS_0408.length-1}" step="1" value="${embeddedIdx0408}"></div>
    `
    document.querySelector('#selEmbeddedIdx_0408')?.addEventListener('input',e=>{
      embeddedIdx0408=Number(e.target.value)
      renderSelection0408()
    })
  }
}

function renderSelection0408(){
  if(!readout0408||!verdict0408)return

  if(currentMethod0408==='filter'){
    const rows=FEATURES_0408.map(f=>{
      const keep=f.absR>=filterThreshold0408
      const caveat=f.key==='x4'?' <small>(variance 0.1389 -- near-constant, a separate variance-threshold filter would flag it regardless of r)</small>':''
      return `<tr><td>${f.label}</td><td>${f.absR.toFixed(4)}</td><td style="color:${keep?'var(--green)':'var(--orange)'};font-weight:800">${keep?'KEEP':'DROP'}${caveat}</td></tr>`
    }).join('')
    readout0408.innerHTML=`<table class="worked-table"><thead><tr><th>Feature</th><th>|r| with target</th><th>Verdict</th></tr></thead><tbody>${rows}</tbody></table>`
    const keptCount=FEATURES_0408.filter(f=>f.absR>=filterThreshold0408).length
    verdict0408.classList.remove('verdict-red','verdict-amber','verdict-green')
    verdict0408.classList.add(keptCount===0?'verdict-red':'verdict-green')
    verdict0408.textContent=`${keptCount} of 4 kept at threshold ${filterThreshold0408.toFixed(2)}. A filter scores each feature alone against the target -- it cannot see that prior_contact_attempts and satisfaction_score are almost redundant with each other (r=-0.9314), since it never compares features to each other.`

  }else if(currentMethod0408==='wrapper'){
    const s=WRAPPER_STEPS_0408[wrapperStep0408-1]
    const subsetLabels=s.subset.map(k=>FEATURES_0408.find(f=>f.key===k).label).join(', ')
    readout0408.innerHTML=`<table class="worked-table"><thead><tr><th>Step</th><th>Surviving subset</th><th>LOO accuracy</th></tr></thead><tbody><tr><td>${s.step} of 4</td><td>{${subsetLabels}}</td><td>${(s.loo*100).toFixed(1)}%</td></tr></tbody></table><p style="margin-top:10px">${s.action}</p>`
    verdict0408.classList.remove('verdict-red','verdict-amber','verdict-green')
    verdict0408.classList.add(wrapperStep0408===4?'verdict-amber':'verdict-green')
    verdict0408.textContent=wrapperStep0408===4
      ? `Collapsed to prior_contact_attempts alone, at 100% LOO accuracy. This is a real limitation, not a bug: greedy backward elimination with no explicit stopping rule keeps dropping features as long as accuracy doesn't fall -- it resolved the x1/x2 redundancy the filter missed, but it never knows when to stop on its own.`
      : `LOO accuracy ${(s.loo*100).toFixed(1)}% with ${s.subset.length} feature(s) remaining. Each step refits the model and re-evaluates on held-out rows -- real performance, not a univariate proxy.`

  }else{
    const e=EMBEDDED_LAMBDAS_0408[embeddedIdx0408]
    const rows=FEATURES_0408.map((f,i)=>{
      const c=e.coefs[i]
      const isZero=Math.abs(c)<1e-9
      return `<tr><td>${f.label}</td><td style="${isZero?'color:var(--ink-muted);text-decoration:line-through':'font-weight:800'}">${c.toFixed(3)}</td></tr>`
    }).join('')
    readout0408.innerHTML=`<table class="worked-table"><thead><tr><th>Feature</th><th>L1 coefficient at λ=${e.lambda.toFixed(2)}</th></tr></thead><tbody>${rows}</tbody></table>`
    const droppedAtThisLambda=FEATURES_0408.filter((f,i)=>Math.abs(e.coefs[i])<1e-9).map(f=>f.label)
    verdict0408.classList.remove('verdict-red','verdict-amber','verdict-green')
    verdict0408.classList.add(e.lambda===0?'verdict-amber':'verdict-green')
    verdict0408.textContent=e.lambda===0
      ? `Unpenalized (λ=0): all four coefficients nonzero and unstable -- no selection happening yet.`
      : droppedAtThisLambda.length
      ? `Zeroed out: ${droppedAtThisLambda.join(', ')}. channel_flag zeros out despite having the 2nd-highest univariate correlation (0.4472) -- L1 reflects each feature's marginal contribution once the others are already in the model, not its raw filter-style correlation. prior_contact_attempts and satisfaction_score shrink together, never forcing a clean choice between them -- textbook Lasso behavior on correlated features.`
      : `No coefficients zeroed yet at this λ.`
  }
}

methodButtons0408.forEach(btn=>btn.addEventListener('click',()=>{
  currentMethod0408=btn.dataset.method
  syncMethodButtons0408()
  renderSecondaryControl0408()
  renderSelection0408()
}))

syncMethodButtons0408()
renderSecondaryControl0408()
renderSelection0408()
