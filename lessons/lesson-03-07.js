const advancedLesson0307=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0307(){if(advancedLesson0307)advancedLesson0307.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0307)
syncAdvancedTarget0307()

// Section 14's lab: the Imbalance Meter. A minority-share slider (0.1-50%)
// plus an N preset (100 / 1,000 / 10,000) drive a stacked bar (majority vs.
// minority segments, always summing to N) and a capped dot row (up to 30
// visible minority-row marks, "+N more" past that). Unlike every prior M03
// lab this has no scatter plot at all -- the statistic family here is
// count/percentage/ratio/absolute-count, not z-score/D/r. Severity is driven
// purely by the minority percentage, never by N -- moving N only moves the
// absolute counts and the post-split survivor line, a contrast the lesson
// states explicitly.

const DOT_CAP_0307=30
const BAR_X0_0307=50,BAR_W_0307=390

const pctSlider0307=document.querySelector('#wgMinPct_0307')
const pctOut0307=document.querySelector('#wgMinPctOut_0307')
const nButtons0307=[...document.querySelectorAll('.lab-actions [data-n]')]
const barMaj0307=document.querySelector('#barMaj0307')
const barMin0307=document.querySelector('#barMin0307')
const barDivider0307=document.querySelector('#barDivider0307')
const majLabel0307=document.querySelector('#majLabel0307')
const minLabel0307=document.querySelector('#minLabel0307')
const dotRow0307=document.querySelector('#dotRow0307')
const moreLabel0307=document.querySelector('#moreLabel0307')
const readout0307=document.querySelector('#wgImbalanceReadout_0307')
const verdict0307=document.querySelector('#wgImbalanceVerdict_0307')

let minorityPct0307=22.3
let n0307=1000

// Pre-build 30 dot squares once; recompute0307 only toggles visibility.
const dotSize0307=10,dotGap0307=3,dotPitch0307=dotSize0307+dotGap0307
const dotEls0307=[]
for(let i=0;i<DOT_CAP_0307;i++){
  const sq=document.createElementNS('http://www.w3.org/2000/svg','rect')
  sq.setAttribute('x',BAR_X0_0307+i*dotPitch0307)
  sq.setAttribute('y',100)
  sq.setAttribute('width',dotSize0307)
  sq.setAttribute('height',dotSize0307)
  sq.setAttribute('fill','#ff7957')
  sq.style.display='none'
  dotRow0307?.appendChild(sq)
  dotEls0307.push(sq)
}

function severityBand0307(pct){
  if(pct>=40)return{label:'ROUGHLY BALANCED',cls:'verdict-green',note:'no special handling needed yet'}
  if(pct>=20)return{label:'MILD IMBALANCE',cls:'verdict-amber',note:"naive accuracy already starts to mislead (Module 02 Concept 01's own CFPB proof)"}
  if(pct>=5)return{label:'MODERATE IMBALANCE',cls:'verdict-amber',note:"Module 05's toolbox becomes directly relevant"}
  return{label:'SEVERE IMBALANCE',cls:'verdict-red',note:'plain accuracy is close to meaningless, and the minority count itself may be too small to learn from or evaluate reliably'}
}

function recompute0307(){
  if(pctOut0307)pctOut0307.textContent=minorityPct0307.toFixed(1)

  const minorityCount=Math.round(n0307*minorityPct0307/100)
  const majorityCount=n0307-minorityCount
  const majorityPct=100-minorityPct0307

  const majWidth=BAR_W_0307*(majorityCount/n0307)
  const minWidth=BAR_W_0307-majWidth
  barMaj0307?.setAttribute('width',majWidth.toFixed(2))
  barMin0307?.setAttribute('x',(BAR_X0_0307+majWidth).toFixed(2))
  barMin0307?.setAttribute('width',minWidth.toFixed(2))
  barDivider0307?.setAttribute('x1',(BAR_X0_0307+majWidth).toFixed(2))
  barDivider0307?.setAttribute('x2',(BAR_X0_0307+majWidth).toFixed(2))
  if(majLabel0307){majLabel0307.setAttribute('x',(BAR_X0_0307+majWidth/2).toFixed(2));majLabel0307.textContent=majorityPct.toFixed(1)+'%'}
  if(minLabel0307){minLabel0307.setAttribute('x',(BAR_X0_0307+majWidth+minWidth/2).toFixed(2));minLabel0307.textContent=minorityPct0307.toFixed(1)+'%'}

  const visibleDots=Math.min(minorityCount,DOT_CAP_0307)
  dotEls0307.forEach((el,i)=>{el.style.display=i<visibleDots?'':'none'})
  if(moreLabel0307){
    if(minorityCount>DOT_CAP_0307){
      moreLabel0307.setAttribute('opacity','.85')
      moreLabel0307.textContent=`+${minorityCount-DOT_CAP_0307} more`
    }else{
      moreLabel0307.setAttribute('opacity','0')
      moreLabel0307.textContent=''
    }
  }

  const ratio=minorityCount>0?(majorityCount/minorityCount):null
  const survivors=Math.round(minorityCount*0.15)

  if(readout0307){
    readout0307.innerHTML=`
      <div><span>MAJORITY COUNT</span><b>${majorityCount.toLocaleString()} rows</b></div>
      <div><span>MINORITY COUNT</span><b>${minorityCount.toLocaleString()} rows</b></div>
      <div><span>MINORITY % / MAJORITY %</span><b>${minorityPct0307.toFixed(1)}% / ${majorityPct.toFixed(1)}%</b></div>
      <div><span>IMBALANCE RATIO</span><b>${ratio===null?'undefined (0 minority rows)':ratio.toFixed(2)+':1'}</b></div>
      <div><span>15% HOLD-OUT SURVIVORS</span><b>~${survivors} minority rows</b></div>
    `
  }
  if(!verdict0307)return
  verdict0307.classList.remove('verdict-red','verdict-amber','verdict-green')
  if(minorityCount===0){
    verdict0307.classList.add('verdict-red')
    verdict0307.textContent=`SEVERE IMBALANCE -- zero minority rows at N=${n0307.toLocaleString()}. There is nothing here to learn from or evaluate, regardless of the ${minorityPct0307.toFixed(1)}% the slider reads.`
    return
  }
  const band=severityBand0307(minorityPct0307)
  verdict0307.classList.add(band.cls)
  let text=`${band.label} -- ${band.note}. At N=${n0307.toLocaleString()}, that's ${minorityCount.toLocaleString()} minority rows against ${majorityCount.toLocaleString()} majority rows, ratio ${ratio.toFixed(2)}:1.`
  if(minorityCount<30){
    text+=` Flag: only ${minorityCount} minority rows exist at this N -- thin by absolute count regardless of what the percentage alone suggests.`
  }
  verdict0307.textContent=text
}

pctSlider0307?.addEventListener('input',()=>{
  minorityPct0307=Number(pctSlider0307.value)
  recompute0307()
})
nButtons0307.forEach(btn=>btn.addEventListener('click',()=>{
  n0307=Number(btn.dataset.n)
  nButtons0307.forEach(b=>b.classList.toggle('active',b===btn))
  recompute0307()
}))

recompute0307()
