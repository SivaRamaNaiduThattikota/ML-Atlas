const advancedLesson0309=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0309(){if(advancedLesson0309)advancedLesson0309.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0309)
syncAdvancedTarget0309()

// Section 14's lab: the Cutoff Scrubber. A single as-of cutoff slider
// (row 1-10) plus an honest/naive mode toggle drive a live 10-dot timeline
// of CFPB's real resolution-time-by-date table. Dragging the cutoff back
// to row 7 and toggling modes reproduces the worked example's 5.00-vs-6.60
// numbers exactly. Unlike the surrounding labs, which scrub a magnitude,
// a count, or a percentage, this one scrubs a POSITION along a fixed
// timeline -- the data itself never changes, only where the boundary sits
// and whether that boundary is honored.

const ROWS_0309=[
  {label:'Jan 3',value:4},
  {label:'Jan 9',value:5},
  {label:'Jan 15',value:4},
  {label:'Jan 22',value:6},
  {label:'Jan 29',value:5},
  {label:'Feb 5',value:6},
  {label:'Feb 12',value:5},
  {label:'Feb 19',value:9},
  {label:'Feb 26',value:10},
  {label:'Mar 5',value:12},
]
const TIMELINE_X0_0309=40,TIMELINE_X1_0309=400,TIMELINE_Y_0309=105

const cutoffSlider0309=document.querySelector('#wgCutoff_0309')
const cutoffOut0309=document.querySelector('#wgCutoffOut_0309')
const modeButtons0309=[...document.querySelectorAll('.lab-actions [data-mode]')]
const dotsGroup0309=document.querySelector('#timelineDots0309')
const cutoffLine0309=document.querySelector('#cutoffLine0309')
const cutoffLineLabel0309=document.querySelector('#cutoffLineLabel0309')
const readout0309=document.querySelector('#wgCutoffReadout_0309')
const verdict0309=document.querySelector('#wgCutoffVerdict_0309')

let cutoff0309=7
let mode0309='honest'

function dotX0309(i){
  return TIMELINE_X0_0309+i*((TIMELINE_X1_0309-TIMELINE_X0_0309)/(ROWS_0309.length-1))
}

// Pre-build one circle plus a two-line "excluded" cross per row, once.
// recompute0309 only ever repositions/restyles them.
const dotEls0309=[]
const crossEls0309=[]
for(let i=0;i<ROWS_0309.length;i++){
  const x=dotX0309(i)
  const circle=document.createElementNS('http://www.w3.org/2000/svg','circle')
  circle.setAttribute('cx',x.toFixed(2))
  circle.setAttribute('cy',TIMELINE_Y_0309)
  circle.setAttribute('r','6')
  dotsGroup0309?.appendChild(circle)
  dotEls0309.push(circle)

  const cross=document.createElementNS('http://www.w3.org/2000/svg','g')
  const d=5
  const l1=document.createElementNS('http://www.w3.org/2000/svg','line')
  l1.setAttribute('x1',(x-d).toFixed(2));l1.setAttribute('y1',(TIMELINE_Y_0309-d).toFixed(2))
  l1.setAttribute('x2',(x+d).toFixed(2));l1.setAttribute('y2',(TIMELINE_Y_0309+d).toFixed(2))
  const l2=document.createElementNS('http://www.w3.org/2000/svg','line')
  l2.setAttribute('x1',(x-d).toFixed(2));l2.setAttribute('y1',(TIMELINE_Y_0309+d).toFixed(2))
  l2.setAttribute('x2',(x+d).toFixed(2));l2.setAttribute('y2',(TIMELINE_Y_0309-d).toFixed(2))
  cross.setAttribute('stroke','currentColor')
  cross.setAttribute('stroke-width','1.5')
  cross.appendChild(l1);cross.appendChild(l2)
  dotsGroup0309?.appendChild(cross)
  crossEls0309.push(cross)
}

function syncModeButtons0309(){
  modeButtons0309.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===mode0309))
}

function recompute0309(){
  const known=ROWS_0309.slice(0,cutoff0309)
  const future=ROWS_0309.slice(cutoff0309)

  if(cutoffOut0309){
    cutoffOut0309.textContent=`Row ${cutoff0309} of ${ROWS_0309.length} known (through ${known[known.length-1].label})`
  }

  // cutoff line sits between the last known dot and the first future dot,
  // or just past the final dot once the cutoff has reached row 10
  const lineX=cutoff0309<ROWS_0309.length
    ? (dotX0309(cutoff0309-1)+dotX0309(cutoff0309))/2
    : dotX0309(ROWS_0309.length-1)+20
  if(cutoffLine0309){cutoffLine0309.setAttribute('x1',lineX.toFixed(2));cutoffLine0309.setAttribute('x2',lineX.toFixed(2))}
  if(cutoffLineLabel0309)cutoffLineLabel0309.setAttribute('x',(lineX+6).toFixed(2))

  ROWS_0309.forEach((row,i)=>{
    const isKnown=i<cutoff0309
    const dot=dotEls0309[i]
    const cross=crossEls0309[i]
    dot.setAttribute('fill',isKnown?'#5ee6c3':'#ff7957')
    // in Honest mode a future dot is dimmed and crossed out -- excluded
    // from the computation; in Naive mode it renders at full opacity,
    // since it is (illegitimately) being pulled in
    const excluded=!isKnown&&mode0309==='honest'
    dot.setAttribute('opacity',excluded?'0.35':'1')
    cross.setAttribute('opacity',excluded?'0.85':'0')
  })

  const usedRows=mode0309==='honest'?known:ROWS_0309
  const n=usedRows.length
  const meanVal=usedRows.reduce((s,r)=>s+r.value,0)/n

  if(readout0309){
    readout0309.innerHTML=`
      <div><span>ROWS USED</span><b>${n} of ${ROWS_0309.length}</b></div>
      <div><span>MEAN RESOLUTION TIME</span><b>${meanVal.toFixed(2)} days</b></div>
    `
  }
  if(!verdict0309)return
  verdict0309.classList.remove('verdict-red','verdict-green')
  const hasFutureRows=cutoff0309<ROWS_0309.length
  if(mode0309==='naive'&&hasFutureRows){
    verdict0309.classList.add('verdict-red')
    verdict0309.textContent=`LEAKAGE -- ${future.length} future row${future.length===1?'':'s'} (after the cutoff) are being averaged in as if they were already known.`
  }else{
    verdict0309.classList.add('verdict-green')
    verdict0309.textContent=hasFutureRows
      ? 'CLEAN -- only rows known as of the cutoff are being used.'
      : 'CLEAN -- the cutoff has reached row 10, so no future rows remain to leak; honest and naive now agree.'
  }
}

cutoffSlider0309?.addEventListener('input',()=>{
  cutoff0309=Number(cutoffSlider0309.value)
  recompute0309()
})
modeButtons0309.forEach(btn=>btn.addEventListener('click',()=>{
  mode0309=btn.dataset.mode
  syncModeButtons0309()
  recompute0309()
}))

syncModeButtons0309()
recompute0309()
