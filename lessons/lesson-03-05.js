const advancedLesson0305=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0305(){if(advancedLesson0305)advancedLesson0305.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0305)
syncAdvancedTarget0305()

// Section 14's lab: the Distribution-Shift Detector. A shift-amount slider
// builds the production array as base+shift; four multiplier buttons
// duplicate both arrays that many times, growing sample size while keeping
// the shift shape identical. D stays fixed while the live critical value and
// verdict change -- no pick/reveal step, matching this module's established
// live-calculator lab convention (Concept 03's mechanism simulator, Concept
// 04's outlier comparator).

const BASE_TRAIN_0305=[3,4,5,5,6,6,7,8]
let shift0305=3
let mult0305=1

function empiricalCdf(sample,x){return sample.filter(v=>v<=x).length/sample.length}
function ksStatistic(a,b){
  const combined=[...new Set([...a,...b])].sort((x,y)=>x-y)
  let maxD=0,atX=null
  combined.forEach(x=>{
    const d=Math.abs(empiricalCdf(a,x)-empiricalCdf(b,x))
    if(d>maxD){maxD=d;atX=x}
  })
  return {D:maxD,atX}
}
function criticalValue(n,m,c=1.36){return c*Math.sqrt((n+m)/(n*m))}

const shiftSlider0305=document.querySelector('#wgShift_0305')
const shiftOut0305=document.querySelector('#wgShiftOut_0305')
const multButtons0305=[...document.querySelectorAll('.lab-actions [data-mult]')]
const readoutBox0305=document.querySelector('#wgShiftReadout_0305')
const verdictBox0305=document.querySelector('#wgShiftVerdict_0305')

function recompute0305(){
  if(shiftOut0305)shiftOut0305.textContent=String(shift0305)
  const trainBase=BASE_TRAIN_0305
  const prodBase=BASE_TRAIN_0305.map(v=>v+shift0305)
  const train=Array(mult0305).fill(trainBase).flat()
  const prod=Array(mult0305).fill(prodBase).flat()
  const {D,atX}=ksStatistic(train,prod)
  const n=train.length,m=prod.length
  const dCrit=criticalValue(n,m)
  const flagged=D>dCrit
  if(readoutBox0305){
    readoutBox0305.innerHTML=`
      <div><span>SAMPLE SIZE (n=m)</span><b>${n}</b></div>
      <div><span>D (LARGEST GAP)</span><b>${D.toFixed(3)}</b></div>
      <div><span>OCCURS AT</span><b>${atX} days</b></div>
      <div><span>CRITICAL VALUE D_crit(0.05)</span><b>${dCrit.toFixed(3)}</b></div>
    `
  }
  if(!verdictBox0305)return
  verdictBox0305.classList.remove('verdict-red','verdict-amber','verdict-green')
  if(shift0305===0){
    verdictBox0305.classList.add('verdict-green')
    verdictBox0305.textContent=`No shift applied -- both snapshots are identical, D=${D.toFixed(3)}.`
  }else if(flagged){
    verdictBox0305.classList.add('verdict-red')
    verdictBox0305.textContent=`FLAGGED -- D=${D.toFixed(3)} exceeds this sample size's threshold of ${dCrit.toFixed(3)}. At n=${n}, this shift is statistically detectable.`
  }else{
    verdictBox0305.classList.add('verdict-amber')
    verdictBox0305.textContent=`NOT FLAGGED -- D=${D.toFixed(3)} is below this sample size's threshold of ${dCrit.toFixed(3)}. The shift could just be sampling noise at n=${n}. Try a larger multiplier -- D won't change, but the threshold will drop.`
  }
}

shiftSlider0305?.addEventListener('input',()=>{
  shift0305=Number(shiftSlider0305.value)
  recompute0305()
})
multButtons0305.forEach(btn=>btn.addEventListener('click',()=>{
  mult0305=Number(btn.dataset.mult)
  multButtons0305.forEach(b=>b.classList.toggle('active',b===btn))
  recompute0305()
}))

recompute0305()
