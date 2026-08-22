const advancedLesson0104=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0104(){if(advancedLesson0104)advancedLesson0104.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0104)
syncAdvancedTarget0104()

const xTrain=[1,2,3,4]
const yTrain=[2,4,6,9]
const xTest=[5,6]
const yTest=[10,12]

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

function mse(preds,actual){
  return preds.reduce((sum,p,i)=>sum+(p-actual[i])**2,0)/preds.length
}

function fitDegree(degree){
  const A=vander(xTrain,degree)
  const coeffs=solveNormalEquations(A,yTrain)
  const trainPred=xTrain.map(x=>evalPoly(coeffs,x))
  const testPred=xTest.map(x=>evalPoly(coeffs,x))
  return {coeffs,trainMse:mse(trainPred,yTrain),testMse:mse(testPred,yTest)}
}

function bar(value,scale){
  return '█'.repeat(Math.max(1,Math.round((value/scale)*30)))
}

const degreeButtons=[...document.querySelectorAll('.degree-button')]
const degreeOutput=document.querySelector('#degreeLabOutput')

function verdictFor(degree,trainMse,testMse){
  const gap=testMse-trainMse
  if(degree===0)return 'underfitting — a flat prediction misses the pattern even on the training rows'
  if(degree===3)return 'overfitting — zero training error, and the worst true error of any degree tried'
  if(gap>5)return 'starting to overfit — training error keeps dropping while true error climbs back up'
  return 'a reasonable fit — both errors are low and close together'
}

function renderDegree(degree){
  if(!degreeOutput)return
  const {coeffs,trainMse,testMse}=fitDegree(degree)
  const rounded=coeffs.map(c=>Math.round(c*1000)/1000)
  const verdict=verdictFor(degree,trainMse,testMse)
  degreeOutput.innerHTML=`<p class="fine-print">Degree ${degree} · fit live to x_train=[1,2,3,4], y_train=[2,4,6,9]</p><p><b>Coefficients</b> (highest power first): ${rounded.join(', ')}</p><p><b>Training MSE</b>: ${trainMse.toFixed(4)}<br>${bar(trainMse,7)}</p><p><b>True MSE</b> (x=5,6, never fit): ${testMse.toFixed(4)}<br>${bar(testMse,60)}</p><p><b>Verdict:</b> ${verdict}</p>`
}

degreeButtons.forEach(button=>button.addEventListener('click',()=>{
  degreeButtons.forEach(other=>other.classList.remove('active'))
  button.classList.add('active')
  renderDegree(Number(button.dataset.degree))
}))

renderDegree(0)
