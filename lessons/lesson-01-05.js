const advancedLesson0105=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0105(){if(advancedLesson0105)advancedLesson0105.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0105)
syncAdvancedTarget0105()

// Population rule: y = 2x, exact at x=1,2,3. x=4's true value is 8 but training
// sees a noisy draw c in {7,8,9}. Query points x=5 (true 10) and x=6 (true 12)
// are never in the training set, so every prediction there is a real extrapolation.
const NOISE_VALUES=[7,8,9]
const TRUE_AT_5=10
const TRUE_AT_6=12

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
function fitAndPredict(degree,c){
  const xTrain=[1,2,3,4]
  const yTrain=[2,4,6,c]
  const A=vander(xTrain,degree)
  const coeffs=solveNormalEquations(A,yTrain)
  return {p5:evalPoly(coeffs,5),p6:evalPoly(coeffs,6)}
}
function mean(arr){return arr.reduce((s,v)=>s+v,0)/arr.length}
function variance(arr,mu){return mean(arr.map(v=>(v-mu)**2))}

function summarize(degree){
  const preds5=NOISE_VALUES.map(c=>fitAndPredict(degree,c).p5)
  const preds6=NOISE_VALUES.map(c=>fitAndPredict(degree,c).p6)
  const mean5=mean(preds5),mean6=mean(preds6)
  const bias5=mean5-TRUE_AT_5,bias6=mean6-TRUE_AT_6
  const var5=variance(preds5,mean5),var6=variance(preds6,mean6)
  return {preds5,preds6,bias2:(bias5**2+bias6**2)/2,variance:(var5+var6)/2}
}

const degreeButtons=[...document.querySelectorAll('.bv-degree-button')]
const bvOutput=document.querySelector('#biasVarianceLabOutput')
function bar(value,scale){return '█'.repeat(Math.max(1,Math.round((value/scale)*30)))}

function renderBiasVariance(degree){
  if(!bvOutput)return
  const s=summarize(degree)
  const total=s.bias2+s.variance
  const label=degree===0?'Degree 0 — constant':'Degree 3 — exact interpolation'
  bvOutput.innerHTML=`<p class="fine-print">${label} · refit on all three hypothetical training sets (x=4's noisy value = 7, 8, or 9), evaluated at x=5 and x=6</p>
<p><b>Predictions at x=5</b> across the three resamples: ${s.preds5.map(v=>v.toFixed(2)).join(', ')}</p>
<p><b>Predictions at x=6</b> across the three resamples: ${s.preds6.map(v=>v.toFixed(2)).join(', ')}</p>
<p><b>Bias²</b> (averaged over x=5, x=6): ${s.bias2.toFixed(3)}<br>${bar(s.bias2,49)}</p>
<p><b>Variance</b> (averaged over x=5, x=6): ${s.variance.toFixed(3)}<br>${bar(s.variance,67)}</p>
<p><b>Bias² + Variance:</b> ${total.toFixed(3)}</p>`
}

degreeButtons.forEach(button=>button.addEventListener('click',()=>{
  degreeButtons.forEach(other=>other.classList.remove('active'))
  button.classList.add('active')
  renderBiasVariance(Number(button.dataset.bvDegree))
}))

renderBiasVariance(0)
