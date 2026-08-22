const advancedLesson0304=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0304(){if(advancedLesson0304)advancedLesson0304.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0304)
syncAdvancedTarget0304()

// Section 14's lab: the Outlier Method Comparator. Eight ordinary resolution
// times stay fixed; a slider controls a ninth value directly. Section 09
// proves that for this 9-value sample, no single point's z-score can ever
// cross the conventional threshold of 3 -- the ceiling is (n-1)/sqrt(n) =
// 8/3 ~= 2.667. IQR's upper bound, by contrast, is set entirely by the eight
// fixed values and gets crossed almost immediately. The lab lets a learner
// push the slider as high as they like and watch that ceiling hold every time.

const BASE_0304=[3,4,4,5,5,6,6,7]

function meanOf(xs){return xs.reduce((a,b)=>a+b,0)/xs.length}
function sampleStd(xs){
  const m=meanOf(xs)
  const variance=xs.reduce((a,b)=>a+(b-m)**2,0)/(xs.length-1)
  return Math.sqrt(variance)
}
function quartile(sortedXs,q){
  const pos=(sortedXs.length-1)*q
  const base=Math.floor(pos)
  const rest=pos-base
  return sortedXs[base+1]!==undefined?sortedXs[base]+rest*(sortedXs[base+1]-sortedXs[base]):sortedXs[base]
}
function iqrBounds(xs){
  const sorted=[...xs].sort((a,b)=>a-b)
  const q1=quartile(sorted,0.25)
  const q3=quartile(sorted,0.75)
  const iqr=q3-q1
  return {q1,q3,iqr,lower:q1-1.5*iqr,upper:q3+1.5*iqr}
}

const sliderInput0304=document.querySelector('#wgOutlierX_0304')
const sliderOut0304=document.querySelector('#wgOutlierXOut_0304')
const readoutBox0304=document.querySelector('#wgOutlierReadout_0304')
const verdictBox0304=document.querySelector('#wgOutlierVerdict_0304')

function recomputeOutlier0304(){
  if(!sliderInput0304)return
  const x=Number(sliderInput0304.value)
  if(sliderOut0304)sliderOut0304.textContent=String(x)
  const data=[...BASE_0304,x]
  const n=data.length
  const mean=meanOf(data)
  const std=sampleStd(data)
  const z=(x-mean)/std
  const {upper,lower}=iqrBounds(data)
  const ceiling=(n-1)/Math.sqrt(n)
  const zFlagged=Math.abs(z)>3
  const iqrFlagged=x<lower||x>upper

  if(readoutBox0304){
    readoutBox0304.innerHTML=`
      <div><span>MEAN</span><b>${mean.toFixed(2)}</b></div>
      <div><span>SAMPLE STD</span><b>${std.toFixed(2)}</b></div>
      <div><span>Z-SCORE OF ${x}</span><b>${z.toFixed(3)}</b></div>
      <div><span>Z-SCORE VERDICT (|z|&gt;3?)</span><b>${zFlagged?'Flagged':'Not flagged'}</b></div>
      <div><span>IQR UPPER BOUND</span><b>${upper.toFixed(1)}</b></div>
      <div><span>IQR VERDICT (x&gt;bound?)</span><b>${iqrFlagged?'Flagged':'Not flagged'}</b></div>
    `
  }
  if(!verdictBox0304)return
  verdictBox0304.classList.remove('verdict-red','verdict-amber','verdict-green')
  if(!zFlagged&&!iqrFlagged){
    verdictBox0304.classList.add('verdict-green')
    verdictBox0304.textContent=`Neither method flags ${x} -- it's within the range both would call ordinary for this sample.`
  }else if(iqrFlagged&&!zFlagged){
    verdictBox0304.classList.add('verdict-amber')
    verdictBox0304.textContent=`IQR flags ${x} as an outlier; z-score does not, even at this size. For a 9-value sample, no single point's z-score can ever exceed (n-1)/sqrt(n) = ${ceiling.toFixed(3)} -- push this slider as high as you like, z-score's threshold-3 test will never fire.`
  }else if(zFlagged&&!iqrFlagged){
    verdictBox0304.classList.add('verdict-amber')
    verdictBox0304.textContent=`z-score flags ${x}; IQR does not.`
  }else{
    verdictBox0304.classList.add('verdict-red')
    verdictBox0304.textContent=`Both methods flag ${x} as an outlier.`
  }
}

sliderInput0304?.addEventListener('input',recomputeOutlier0304)
recomputeOutlier0304()
