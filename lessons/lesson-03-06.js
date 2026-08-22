const advancedLesson0306=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0306(){if(advancedLesson0306)advancedLesson0306.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0306)
syncAdvancedTarget0306()

// Section 14's lab: the Confound Revealer. A separation slider s moves the
// mortgage group's means away from the credit group's fixed means while
// holding every row's own within-group residual fixed -- that construction
// is what guarantees credit r and mortgage r stay exactly constant at every
// separation level while only the pooled r moves. A view toggle swaps
// between one pooled trend line and two per-group trend lines. Structurally
// distinct from every earlier M03 lab: this is the first one that redraws a
// live scatter plot and recomputed regression lines on every input event.

const RES_RESID_0306=[-1.5,-0.5,0.5,1.5]
const CREDIT_SAT_RESID_0306=[0,1,-1,0]
const MORT_SAT_RESID_0306=[0,-1,1,0]

function pearsonR0306(xs,ys){
  const n=xs.length
  const mx=xs.reduce((a,b)=>a+b,0)/n
  const my=ys.reduce((a,b)=>a+b,0)/n
  let sxy=0,sxx=0,syy=0
  for(let i=0;i<n;i++){
    const dx=xs[i]-mx,dy=ys[i]-my
    sxy+=dx*dy;sxx+=dx*dx;syy+=dy*dy
  }
  return sxy/Math.sqrt(sxx*syy)
}
function regressionLine0306(xs,ys){
  const n=xs.length
  const mx=xs.reduce((a,b)=>a+b,0)/n
  const my=ys.reduce((a,b)=>a+b,0)/n
  let sxy=0,sxx=0
  for(let i=0;i<n;i++){const dx=xs[i]-mx;sxy+=dx*(ys[i]-my);sxx+=dx*dx}
  const slope=sxy/sxx
  return {slope,intercept:my-slope*mx}
}

const PX_L_0306=50,PX_R_0306=440,PY_T_0306=20,PY_B_0306=210
const X0_0306=0,X1_0306=20,Y0_0306=-2,Y1_0306=10
function scaleX0306(v){return PX_L_0306+(v-X0_0306)/(X1_0306-X0_0306)*(PX_R_0306-PX_L_0306)}
function scaleY0306(v){return PY_B_0306-(v-Y0_0306)/(Y1_0306-Y0_0306)*(PY_B_0306-PY_T_0306)}

const sepSlider0306=document.querySelector('#wgSep_0306')
const sepOut0306=document.querySelector('#wgSepOut_0306')
const viewButtons0306=[...document.querySelectorAll('.lab-actions [data-view]')]
const pooledGroup0306=document.querySelector('#pooledLines0306')
const splitGroup0306=document.querySelector('#splitLines0306')
const poolLine0306=document.querySelector('#poolLine0306')
const creditLine0306=document.querySelector('#creditLine0306')
const mortLine0306=document.querySelector('#mortLine0306')
const readout0306=document.querySelector('#wgConfoundReadout_0306')
const verdict0306=document.querySelector('#wgConfoundVerdict_0306')
const pointEls0306=[0,1,2,3,4,5,6,7].map(i=>document.querySelector(`#pt0306_${i}`))

let sep0306=1
let view0306='pooled'

function setLineFromFit0306(el,xs,ys){
  if(!el)return
  const {slope,intercept}=regressionLine0306(xs,ys)
  const xMin=Math.min(...xs),xMax=Math.max(...xs)
  el.setAttribute('x1',scaleX0306(xMin))
  el.setAttribute('y1',scaleY0306(intercept+slope*xMin))
  el.setAttribute('x2',scaleX0306(xMax))
  el.setAttribute('y2',scaleY0306(intercept+slope*xMax))
}

function recompute0306(){
  if(sepOut0306)sepOut0306.textContent=sep0306.toFixed(2)

  const creditRes=[3,4,5,6]
  const creditSat=CREDIT_SAT_RESID_0306.map(d=>8+d)
  const mortRes=RES_RESID_0306.map(d=>4.5+7*sep0306+d)
  const mortSat=MORT_SAT_RESID_0306.map(d=>8-4*sep0306+d)
  const allRes=creditRes.concat(mortRes)
  const allSat=creditSat.concat(mortSat)

  const creditR=pearsonR0306(creditRes,creditSat)
  const mortR=pearsonR0306(mortRes,mortSat)
  const pooledR=pearsonR0306(allRes,allSat)

  pointEls0306.forEach((el,i)=>{
    if(!el)return
    el.setAttribute('cx',scaleX0306(allRes[i]))
    el.setAttribute('cy',scaleY0306(allSat[i]))
  })

  setLineFromFit0306(poolLine0306,allRes,allSat)
  setLineFromFit0306(creditLine0306,creditRes,creditSat)
  setLineFromFit0306(mortLine0306,mortRes,mortSat)

  if(readout0306){
    readout0306.innerHTML=`
      <div><span>CREDIT REPORTING r</span><b>${creditR.toFixed(4)}</b></div>
      <div><span>MORTGAGE r</span><b>${mortR.toFixed(4)}</b></div>
      <div><span>POOLED r (ALL 8 ROWS)</span><b>${pooledR.toFixed(4)}</b></div>
      <div><span>SEPARATION s</span><b>${sep0306.toFixed(2)}</b></div>
    `
  }
  if(!verdict0306)return
  verdict0306.classList.remove('verdict-red','verdict-amber','verdict-green')
  const withinMag=Math.abs(creditR)
  if(sep0306<0.05){
    verdict0306.classList.add('verdict-green')
    verdict0306.textContent=`No separation, no confounding signal -- credit r (${creditR.toFixed(4)}) and mortgage r (${mortR.toFixed(4)}) never move, and pooled r has collapsed to ${pooledR.toFixed(4)} too. Pooled and within-group results now agree the relationship is weak either way.`
  }else if(Math.abs(pooledR)>withinMag*1.5){
    verdict0306.classList.add('verdict-red')
    verdict0306.textContent=`Confounded -- pooled r is ${pooledR.toFixed(4)}, far past credit r (${creditR.toFixed(4)}) and mortgage r (${mortR.toFixed(4)}), which never move at any separation. This pooled correlation is explained by product type, not a real link between resolution time and satisfaction.`
  }else{
    verdict0306.classList.add('verdict-amber')
    verdict0306.textContent=`Some separation appearing -- pooled r (${pooledR.toFixed(4)}) is drifting away from credit r and mortgage r (locked at ${creditR.toFixed(4)} / ${mortR.toFixed(4)}), but not dramatically yet. Push the slider further.`
  }
}

sepSlider0306?.addEventListener('input',()=>{
  sep0306=Number(sepSlider0306.value)
  recompute0306()
})
viewButtons0306.forEach(btn=>btn.addEventListener('click',()=>{
  view0306=btn.dataset.view
  viewButtons0306.forEach(b=>b.classList.toggle('active',b===btn))
  if(pooledGroup0306)pooledGroup0306.style.display=view0306==='pooled'?'':'none'
  if(splitGroup0306)splitGroup0306.style.display=view0306==='split'?'':'none'
  recompute0306()
}))

recompute0306()
