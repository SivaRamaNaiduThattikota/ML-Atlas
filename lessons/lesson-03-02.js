const advancedLesson0302=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0302(){if(advancedLesson0302)advancedLesson0302.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0302)
syncAdvancedTarget0302()

// Section 14's lab: the Bin-Width Explorer -- the same 16 CFPB-style narrative
// lengths, rebinned live from 2 bins up to 16. Concept 01 showed a mean alone
// can hide a same-mean, different-shape split. This lab shows the technique
// this concept actually supplies -- a histogram -- and the risk that comes
// with it: the same 16 numbers look like one lump, two clean clusters, or
// sixteen noisy spikes, purely depending on how many bins you choose.

const LENGTHS_0302=[105,130,150,170,190,210,230,250,780,830,880,930,980,1040,1110,1190]

function meanOf0302(values){
  return values.reduce((sum,v)=>sum+v,0)/values.length
}

function medianOf0302(values){
  const sorted=[...values].sort((a,b)=>a-b)
  const mid=Math.floor(sorted.length/2)
  return sorted.length%2===0 ? (sorted[mid-1]+sorted[mid])/2 : sorted[mid]
}

function binCounts0302(values,k){
  const min=Math.min(...values)
  const max=Math.max(...values)
  const width=(max-min)/k
  const counts=new Array(k).fill(0)
  values.forEach(v=>{
    let idx=Math.floor((v-min)/width)
    if(idx>=k)idx=k-1
    counts[idx]++
  })
  const edges=Array.from({length:k},(_,i)=>[Math.round(min+i*width),Math.round(min+(i+1)*width)])
  return {counts,edges}
}

const BIN_VERDICTS_0302={
  2:{cls:'verdict-amber',text:'Two bins split the data 8 and 8 -- enough to notice the count is even, nowhere near enough to say why. One wide bin over the whole 780-1190 stretch hides whatever is actually happening inside it.'},
  4:{cls:'verdict-green',text:'Four bins show the gap directly: 8 short narratives, then a bin with zero complaints in it, then 3 and 5 long ones. That empty middle bin is the discovery -- nothing else on this page states "these are two separate groups" this plainly.'},
  8:{cls:'verdict-green',text:'Eight bins keep the gap visible and start splitting each cluster internally -- useful once you specifically need structure inside the short group or the long group, at the cost of thinner, noisier counts per bar.'},
  16:{cls:'verdict-amber',text:'Sixteen bins for sixteen complaints puts roughly one complaint per bar. More detailed on paper, but every bar is now a single data point -- you are reading individual rows, not a distribution.'}
}

const binBoard0302=document.querySelector('#binExplorer0302')
const binReadout0302=document.querySelector('#binReadout0302')
const binVerdict0302=document.querySelector('#binVerdict0302')
let activeBins0302=4

function binRowMarkup0302(count,edge,maxCount){
  const pct=maxCount?Math.round((count/maxCount)*100):0
  return `<div class="prob-row">
    <span>${edge[0]}-${edge[1]} chars</span>
    <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
    <output>${count}</output>
  </div>`
}

function render0302(){
  if(!binBoard0302)return
  const {counts,edges}=binCounts0302(LENGTHS_0302,activeBins0302)
  const maxCount=Math.max(...counts)
  binBoard0302.innerHTML=`<div class="prob-bars">${counts.map((c,i)=>binRowMarkup0302(c,edges[i],maxCount)).join('')}</div>`
  document.querySelectorAll('button[data-bins]').forEach(btn=>{
    const active=Number(btn.dataset.bins)===activeBins0302
    btn.classList.toggle('active',active)
  })
  if(binReadout0302){
    binReadout0302.innerHTML=`
      <div><span>MEAN NARRATIVE LENGTH</span><b>${meanOf0302(LENGTHS_0302).toFixed(2)} chars</b></div>
      <div><span>MEDIAN NARRATIVE LENGTH</span><b>${medianOf0302(LENGTHS_0302)} chars</b></div>
      <div><span>REAL COMPLAINTS AT EITHER VALUE</span><b>0 of 16</b></div>
    `
  }
  if(binVerdict0302){
    const v=BIN_VERDICTS_0302[activeBins0302]
    binVerdict0302.className=`gate-verdict ${v.cls}`
    binVerdict0302.textContent=v.text
  }
}

document.querySelectorAll('button[data-bins]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    activeBins0302=Number(btn.dataset.bins)
    render0302()
  })
})

render0302()
