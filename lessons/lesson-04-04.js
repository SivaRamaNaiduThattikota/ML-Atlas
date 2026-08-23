const advancedLesson0404=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0404(){if(advancedLesson0404)advancedLesson0404.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0404)
syncAdvancedTarget0404()

// Section 14's lab: The Scaler Stress Test. Eight fixed "normal" resolution-time
// values plus one slider-controlled 9th value -- unlike this module's previous
// three labs (static button-pickers only, or a fold-count slider that never
// touched the underlying data), this slider directly edits a real data value
// and every transform recomputes live against it.

const FIXED8_0404=[3,4,4,5,5,6,6,7]

function mean0404(a){return a.reduce((s,x)=>s+x,0)/a.length}
function sampleStd0404(a){const m=mean0404(a);const v=a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1);return Math.sqrt(v)}
function zscores0404(a){const m=mean0404(a),s=sampleStd0404(a);return a.map(x=>(x-m)/s)}
function minmax0404(a){const mn=Math.min(...a),mx=Math.max(...a);return a.map(x=>(x-mn)/(mx-mn))}
function normalSpreadPct0404(scaled){return (Math.max(...scaled.slice(0,8))-Math.min(...scaled.slice(0,8)))*100}

const modeButtons0404=[...document.querySelectorAll('#s14 .lab-actions [data-mode]')]
const outlierSlider0404=document.querySelector('#wgOutlier_0404')
const outlierOut0404=document.querySelector('#wgOutlierOut_0404')
const readout0404=document.querySelector('#scalerReadout_0404')
const verdict0404=document.querySelector('#scalerVerdict_0404')

let mode0404='raw'

function syncButtons0404(){
  modeButtons0404.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===mode0404))
}

function readoutCard0404(label,value){
  return `<div><span>${label}</span><b>${value}</b></div>`
}

function recompute0404(){
  const v9=outlierSlider0404?Number(outlierSlider0404.value):45
  if(outlierOut0404)outlierOut0404.textContent=String(v9)

  const all9=[...FIXED8_0404,v9]
  const mm=minmax0404(all9)
  const logAll9=all9.map(Math.log)
  const logMm=minmax0404(logAll9)
  const z=zscores0404(all9)

  let transformed9,metricLabel,metricValue
  if(mode0404==='raw'){
    transformed9=v9.toFixed(2)
    metricLabel='NORMAL-POINT SPREAD (RAW MIN-MAX, FOR REFERENCE)'
    metricValue=normalSpreadPct0404(mm).toFixed(2)+'%'
  }else if(mode0404==='zscore'){
    transformed9=z[8].toFixed(4)
    metricLabel='|Z-SCORE| OF THE 9TH VALUE'
    metricValue=Math.abs(z[8]).toFixed(4)
  }else if(mode0404==='minmax'){
    transformed9=mm[8].toFixed(4)
    metricLabel='NORMAL-POINT SPREAD (MIN-MAX)'
    metricValue=normalSpreadPct0404(mm).toFixed(2)+'%'
  }else{
    transformed9=logMm[8].toFixed(4)
    metricLabel='NORMAL-POINT SPREAD (LOG + MIN-MAX)'
    metricValue=normalSpreadPct0404(logMm).toFixed(2)+'%'
  }

  if(readout0404){
    readout0404.innerHTML=[
      readoutCard0404('MODE',{raw:'Raw',zscore:'Z-score',minmax:'Min-max',logminmax:'Log + min-max'}[mode0404]),
      readoutCard0404('9TH VALUE (RAW DAYS)',v9),
      readoutCard0404('9TH VALUE (TRANSFORMED)',transformed9),
      readoutCard0404(metricLabel,metricValue),
    ].join('')
  }

  if(!verdict0404)return
  verdict0404.classList.remove('verdict-red','verdict-amber','verdict-green')
  if(mode0404==='raw'){
    verdict0404.classList.add('verdict-amber')
    verdict0404.textContent=`UNSCALED BASELINE. No transform applied yet -- switch modes above to see what each one does to the 9th value's dominance over the other eight.`
  }else if(mode0404==='zscore'){
    const az=Math.abs(z[8])
    verdict0404.classList.add(az>=2.5?'verdict-amber':'verdict-green')
    verdict0404.textContent=`Z-SCORE ${z[8].toFixed(3)}. ${az>=2.5?'Still a notable outlier by the usual |z|>2-3 convention -- standardization keeps it visible, it does not remove it.':'Within an ordinary range once standardized.'}`
  }else{
    const spread=normalSpreadPct0404(mode0404==='minmax'?mm:logMm)
    verdict0404.classList.add(spread<15?'verdict-red':spread<30?'verdict-amber':'verdict-green')
    const tag=spread<15?'FRAGILE':spread<30?'STRAINED':'STABLE'
    verdict0404.textContent=`${tag}. The 8 normal points occupy ${spread.toFixed(2)}% of the full 0-1 scale. ${spread<15?'The 9th value alone is eating most of the scale.':spread<30?'Getting crowded, but still usable.':'Real spread survives among the normal points.'}`
  }
}

modeButtons0404.forEach(btn=>btn.addEventListener('click',()=>{
  mode0404=btn.dataset.mode
  syncButtons0404()
  recompute0404()
}))
outlierSlider0404?.addEventListener('input',recompute0404)

syncButtons0404()
recompute0404()
