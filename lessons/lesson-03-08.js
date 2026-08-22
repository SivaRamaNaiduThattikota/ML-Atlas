const advancedLesson0308=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0308(){if(advancedLesson0308)advancedLesson0308.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0308)
syncAdvancedTarget0308()

// Section 14's lab: the Cardinality Console. A single K slider (2-1000)
// plus three CFPB field presets (Product/Company/Complaint ID) drive a live
// comb of up to 40 vertical slivers -- each sliver narrows as K grows, which
// visualizes why average rows per category collapses as more distinct
// categories compete for the same fixed N=1,000 rows. N is held constant on
// purpose: this lab isolates K as the only variable, unlike the ratio-driven
// labs in the surrounding concepts.

const N_0308=1000
const COMB_CAP_0308=40
const COMB_X0_0308=40,COMB_W_0308=380,COMB_Y_0308=20,COMB_H_0308=60

const kSlider0308=document.querySelector('#wgCardK_0308')
const kOut0308=document.querySelector('#wgCardKOut_0308')
const presetButtons0308=[...document.querySelectorAll('.lab-actions [data-k]')]
const combRow0308=document.querySelector('#combRow0308')
const moreCombLabel0308=document.querySelector('#moreCombLabel0308')
const readout0308=document.querySelector('#wgCardReadout_0308')
const verdict0308=document.querySelector('#wgCardVerdict_0308')

let k0308=5

// Pre-build 40 sliver rects once; recompute0308 resizes and repositions
// only the ones currently in play, hiding the rest.
const combEls0308=[]
for(let i=0;i<COMB_CAP_0308;i++){
  const rect=document.createElementNS('http://www.w3.org/2000/svg','rect')
  rect.setAttribute('y',COMB_Y_0308)
  rect.setAttribute('height',COMB_H_0308)
  rect.setAttribute('fill',i%2===0?'#5ee6c3':'#3fcf9e')
  combRow0308?.appendChild(rect)
  combEls0308.push(rect)
}

function severityBand0308(ratioPct){
  if(ratioPct>=50)return{label:'DEGENERATE / IDENTIFIER-LIKE',cls:'verdict-red',note:'investigate whether this is a real feature at all -- a field this close to K=N carries no cross-row generalizable signal, and risks the same leakage and overfitting trap as training on a row’s own ID'}
  if(ratioPct>=10)return{label:'HIGH CARDINALITY',cls:'verdict-amber',note:'one-hot encoding would add a mostly-empty column per category; Module 04’s out-of-fold target encoding is the tool built for exactly this'}
  if(ratioPct>=1)return{label:'MODERATE CARDINALITY',cls:'verdict-amber',note:'one-hot encoding still works, but watch the resulting column count as K keeps climbing'}
  return{label:'LOW CARDINALITY',cls:'verdict-green',note:'one-hot encoding is fine as-is, no special handling needed'}
}

function syncPresetButtons0308(){
  presetButtons0308.forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.k)===k0308))
}

function recompute0308(){
  if(kOut0308)kOut0308.textContent=k0308.toLocaleString()

  const sliverCount=Math.min(k0308,COMB_CAP_0308)
  const sliverW=COMB_W_0308/sliverCount
  combEls0308.forEach((el,i)=>{
    if(i<sliverCount){
      el.style.display=''
      el.setAttribute('x',(COMB_X0_0308+i*sliverW).toFixed(2))
      el.setAttribute('width',Math.max(sliverW-0.6,0.4).toFixed(2))
    }else{
      el.style.display='none'
    }
  })
  if(moreCombLabel0308){
    if(k0308>COMB_CAP_0308){
      moreCombLabel0308.setAttribute('opacity','.85')
      moreCombLabel0308.textContent=`+${(k0308-COMB_CAP_0308).toLocaleString()} more categories`
    }else{
      moreCombLabel0308.setAttribute('opacity','0')
      moreCombLabel0308.textContent=''
    }
  }

  const ratioPct=k0308/N_0308*100
  const avgRows=N_0308/k0308

  if(readout0308){
    readout0308.innerHTML=`
      <div><span>DISTINCT CATEGORIES (K)</span><b>${k0308.toLocaleString()} out of N = ${N_0308.toLocaleString()} rows</b></div>
      <div><span>CARDINALITY RATIO</span><b>${ratioPct.toFixed(ratioPct<1?4:1)}%</b></div>
      <div><span>AVG ROWS / CATEGORY</span><b>${avgRows.toFixed(4)}</b></div>
      <div><span>ONE-HOT WIDTH</span><b>${k0308.toLocaleString()} columns</b></div>
    `
  }
  if(!verdict0308)return
  verdict0308.classList.remove('verdict-red','verdict-amber','verdict-green')
  const band=severityBand0308(ratioPct)
  verdict0308.classList.add(band.cls)
  verdict0308.textContent=`${band.label} -- ${band.note}.`
}

kSlider0308?.addEventListener('input',()=>{
  k0308=Number(kSlider0308.value)
  syncPresetButtons0308()
  recompute0308()
})
presetButtons0308.forEach(btn=>btn.addEventListener('click',()=>{
  k0308=Number(btn.dataset.k)
  if(kSlider0308)kSlider0308.value=String(k0308)
  syncPresetButtons0308()
  recompute0308()
}))

syncPresetButtons0308()
recompute0308()
