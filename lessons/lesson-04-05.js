const advancedLesson0405=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0405(){if(advancedLesson0405)advancedLesson0405.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0405)
syncAdvancedTarget0405()

// Section 14's lab: the Intake Timestamp Decoder. Unlike this module's earlier
// labs -- which filtered a fixed row set or rescaled a static sample -- this one
// decomposes a single freely-draggable timestamp into calendar parts live, and
// contrasts two elapsed-time anchor strategies (a fixed valid anchor vs. a
// leakage-trap anchor that is always 19 days after whatever intake date is shown).

const DAY_NAMES_0405=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTH_NAMES_0405=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_MS_0405=86400000
const VALID_ANCHOR_0405=Date.UTC(2022,10,3) // 2022-11-03, always before every day-of-year 2023 slider position

function dateFromDayOfYear0405(doy){
  return Date.UTC(2023,0,1)+(doy-1)*DAY_MS_0405
}
function formatDate0405(ms){
  const d=new Date(ms)
  return `${DAY_NAMES_0405[d.getUTCDay()].slice(0,3)}, ${MONTH_NAMES_0405[d.getUTCMonth()]} ${d.getUTCDate()} ${d.getUTCFullYear()}`
}
function weekdayName0405(ms){return DAY_NAMES_0405[new Date(ms).getUTCDay()]}
function monthNumber0405(ms){return new Date(ms).getUTCMonth()+1}
function isWeekend0405(ms){const wd=new Date(ms).getUTCDay();return wd===0||wd===6}
function daysBetween0405(fromMs,toMs){return Math.round((toMs-fromMs)/DAY_MS_0405)}

const modeButtons0405=[...document.querySelectorAll('#s14 .lab-actions [data-mode]')]
const dateSlider0405=document.querySelector('#wgDate_0405')
const dateOut0405=document.querySelector('#wgDateOut_0405')
const readout0405=document.querySelector('#decoderReadout_0405')
const verdict0405=document.querySelector('#decoderVerdict_0405')

let mode0405='valid'

function syncButtons0405(){
  modeButtons0405.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===mode0405))
}

function readoutCard0405(label,value){
  return `<div><span>${label}</span><b>${value}</b></div>`
}

function recompute0405(){
  const doy=dateSlider0405?Number(dateSlider0405.value):74
  if(dateOut0405)dateOut0405.textContent=String(doy)

  const intakeMs=dateFromDayOfYear0405(doy)
  const weekday=weekdayName0405(intakeMs)
  const monthNum=monthNumber0405(intakeMs)
  const weekend=isWeekend0405(intakeMs)

  let anchorMs,anchorLabel,elapsed
  if(mode0405==='valid'){
    anchorMs=VALID_ANCHOR_0405
    anchorLabel=`${formatDate0405(anchorMs)} (a prior complaint on file)`
    elapsed=daysBetween0405(anchorMs,intakeMs)
  }else{
    anchorMs=intakeMs+19*DAY_MS_0405
    anchorLabel=`${formatDate0405(anchorMs)} (this case's own resolution date)`
    elapsed=daysBetween0405(intakeMs,anchorMs)
  }

  if(readout0405){
    readout0405.innerHTML=[
      readoutCard0405('DATE RECEIVED',formatDate0405(intakeMs)),
      readoutCard0405('DAY OF WEEK',weekday),
      readoutCard0405('MONTH',monthNum),
      readoutCard0405('IS WEEKEND',weekend?'Yes':'No'),
      readoutCard0405(mode0405==='valid'?'DAYS SINCE LAST COMPLAINT':'DAYS SINCE RESOLUTION (TRAP)',elapsed),
      readoutCard0405('ANCHOR DATE',anchorLabel),
    ].join('')
  }

  if(!verdict0405)return
  verdict0405.classList.remove('verdict-red','verdict-amber','verdict-green')
  if(mode0405==='valid'){
    verdict0405.classList.add('verdict-green')
    verdict0405.textContent=`VALID -- anchor (${formatDate0405(VALID_ANCHOR_0405)}) is before every possible intake date on this slider, known at intake time. Drag anywhere; this stays true across the entire range.`
  }else{
    verdict0405.classList.add('verdict-red')
    verdict0405.textContent=`LEAKAGE -- anchor (resolution, ${formatDate0405(anchorMs)}) is 19 days AFTER this intake date (${formatDate0405(intakeMs)}). That information does not exist yet at the moment you would need to make this prediction. Drag anywhere; this stays true across the entire range -- it's structural, not an occasional edge case.`
  }
}

modeButtons0405.forEach(btn=>btn.addEventListener('click',()=>{
  mode0405=btn.dataset.mode
  syncButtons0405()
  recompute0405()
}))
dateSlider0405?.addEventListener('input',recompute0405)

syncButtons0405()
recompute0405()
