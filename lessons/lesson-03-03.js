const advancedLesson0303=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0303(){if(advancedLesson0303)advancedLesson0303.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0303)
syncAdvancedTarget0303()

// Section 14's lab: the Missing-Data Mechanism Simulator. Twenty CFPB-style
// complaints, each with an observed field (intake channel: phone or web) and
// a post-resolution satisfaction score most complaints don't actually let you
// see, because it comes from a voluntary follow-up survey. The 20 complaints
// themselves never change. What changes across the three buttons is only WHY
// the survey response is missing -- and that single difference in mechanism
// produces the identical 40% overall missing rate every time, while the two
// breakdowns underneath it (by channel, which you can see, and by the true
// score tier, which normally you can't) tell three completely different
// stories.

const ROWS_0303=[
  {channel:'Phone',score:2},{channel:'Web',score:3},{channel:'Phone',score:5},{channel:'Web',score:6},
  {channel:'Phone',score:8},{channel:'Web',score:9},{channel:'Phone',score:3},{channel:'Web',score:2},
  {channel:'Phone',score:6},{channel:'Web',score:5},{channel:'Phone',score:9},{channel:'Web',score:8},
  {channel:'Phone',score:4},{channel:'Web',score:7},{channel:'Phone',score:1},{channel:'Web',score:2},
  {channel:'Phone',score:7},{channel:'Web',score:4},{channel:'Phone',score:10},{channel:'Web',score:9}
]

function tierOf0303(score){
  if(score<=3)return 'low'
  if(score<=7)return 'mid'
  return 'high'
}

// Row numbers below are 1-indexed to match the worked-by-hand numbers in
// Section 10 of the advanced lesson -- row N is ROWS_0303[N-1].
const MISSING_ROWS_0303={
  mcar:[1,4,6,8,9,17,18,19],
  mar:[1,3,5,7,9,13,14,19],
  mnar:[1,2,4,7,8,10,15,17]
}

function rateByGroup0303(missingRows,keyFn){
  const totals={}
  const missing={}
  ROWS_0303.forEach((row,i)=>{
    const key=keyFn(row)
    totals[key]=(totals[key]||0)+1
    if(missingRows.includes(i+1))missing[key]=(missing[key]||0)+1
  })
  return Object.keys(totals).map(key=>({
    key,
    total:totals[key],
    missing:missing[key]||0,
    pct:Math.round(((missing[key]||0)/totals[key])*1000)/10
  }))
}

const MECHANISM_META_0303={
  mcar:{
    label:'MCAR',
    cls:'verdict-green',
    text:'Phone and Web both sit at exactly 40% missing -- the channel you can see explains nothing. The tier view bounces 33/50/33 with no consistent direction as score rises. That flat-then-bumpy-but-directionless shape, not a perfectly even one, is what "missing completely at random" actually looks like on 20 real rows.'
  },
  mar:{
    label:'MAR',
    cls:'verdict-amber',
    text:'Phone jumps to 70% missing while Web sits at only 10% -- a huge gap, and channel is a column you can actually see. The tier view is the same bumpy 33/50/33 shape as MCAR’s, which is the trap: tier alone can’t tell these two apart. Only checking the observed channel column reveals the pattern here.'
  },
  mnar:{
    label:'MNAR',
    cls:'verdict-red',
    text:'Channel is flat again -- 40% Phone, 40% Web, same as MCAR. But the tier view falls cleanly from 83% (low scores) to 38% (mid) to 0% (high): the least satisfied customers are the ones who never finish the survey. No column in a real dataset shows you that tier breakdown directly -- this is the one mechanism you cannot rule out from observed data alone.'
  }
}

const mechChannelBoard0303=document.querySelector('#mechChannelBoard0303')
const mechTierBoard0303=document.querySelector('#mechTierBoard0303')
const mechReadout0303=document.querySelector('#mechReadout0303')
const mechVerdict0303=document.querySelector('#mechVerdict0303')
let activeMechanism0303='mcar'

function barRowMarkup0303(label,item){
  return `<div class="prob-row">
    <span>${label}</span>
    <div class="bar-track"><div class="bar-fill" style="width:${item.pct}%"></div></div>
    <output>${item.missing}/${item.total}</output>
  </div>`
}

function render0303(){
  if(!mechChannelBoard0303||!mechTierBoard0303)return
  const missingRows=MISSING_ROWS_0303[activeMechanism0303]
  const byChannel=rateByGroup0303(missingRows,row=>row.channel)
  const byTier=rateByGroup0303(missingRows,row=>tierOf0303(row.score))
  const tierOrder=['low','mid','high']
  const sortedTier=tierOrder.map(t=>byTier.find(item=>item.key===t)).filter(Boolean)

  mechChannelBoard0303.innerHTML=`<div class="prob-bars">${byChannel.map(item=>barRowMarkup0303(item.key,item)).join('')}</div>`
  mechTierBoard0303.innerHTML=`<div class="prob-bars">${sortedTier.map(item=>barRowMarkup0303(item.key+' score',item)).join('')}</div>`

  document.querySelectorAll('button[data-mechanism]').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.mechanism===activeMechanism0303)
  })

  const totalMissing=missingRows.length
  if(mechReadout0303){
    mechReadout0303.innerHTML=`
      <div><span>OVERALL MISSING RATE</span><b>${totalMissing}/20 = ${Math.round((totalMissing/20)*1000)/10}%</b></div>
      <div><span>OBSERVED-VARIABLE CHECK</span><b>Phone vs. Web</b></div>
      <div><span>OMNISCIENT CHECK</span><b>Low vs. mid vs. high true score</b></div>
    `
  }
  if(mechVerdict0303){
    const meta=MECHANISM_META_0303[activeMechanism0303]
    mechVerdict0303.className=`gate-verdict ${meta.cls}`
    mechVerdict0303.textContent=meta.text
  }
}

document.querySelectorAll('button[data-mechanism]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    activeMechanism0303=btn.dataset.mechanism
    render0303()
  })
})

render0303()
