const advancedLesson0402=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0402(){if(advancedLesson0402)advancedLesson0402.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0402)
syncAdvancedTarget0402()

// Section 14's lab: the Encoding Matrix Builder. Unlike the prior three
// labs (C08's continuous K slider + presets driving a comb, C09's cutoff
// slider driving a mean line, C01's single 3-way A/B/C button group
// driving a fixed verdict), this lab crosses two independent 2-way
// button groups -- field and encoding mode -- and renders a live small
// matrix for whichever combination is selected. All four combinations
// are fixed, hand-verified facts from Section 10's worked example;
// nothing here is computed fresh, only replayed and displayed.

const FIELDS_0402={
  product:{
    label:'Product',
    rows:['Credit reporting','Debt collection','Mortgage','Credit card','Checking or savings account','Credit reporting'],
    categories:['Checking or savings account','Credit card','Credit reporting','Debt collection','Mortgage'],
    order:null, // no genuine order -- nominal field
  },
  length:{
    label:'Narrative length',
    rows:['Short','Medium','Long','Medium','Short','Long'],
    categories:['Short','Medium','Long'],
    order:['Short','Medium','Long'], // genuine order -- ordinal-valid
  },
}

function buildOneHot0402(rows,categories){
  const index=Object.fromEntries(categories.map((c,i)=>[c,i]))
  return rows.map(v=>{
    const vec=new Array(categories.length).fill(0)
    vec[index[v]]=1
    return vec
  })
}

function buildOrdinal0402(rows,order){
  const index=Object.fromEntries(order.map((c,i)=>[c,i]))
  return rows.map(v=>index[v])
}

// The 4-way correctness verdict, computed live from the two toggles --
// this is the judgment call the whole concept is about, not just a
// lookup table dressed up as logic.
function classifyCombo0402(fieldKey,mode){
  const hasOrder=!!FIELDS_0402[fieldKey].order
  if(fieldKey==='product'&&mode==='onehot'){
    return{cls:'verdict-green',label:'CORRECT.',
      note:'5 columns, no fabricated order imposed. Product has no genuine order between categories.'}
  }
  if(fieldKey==='product'&&mode==='ordinal'){
    return{cls:'verdict-red',label:'WRONG.',
      note:"Imposes a fake ranking (e.g. Checking=0 < Mortgage=4) that doesn't exist in the real field."}
  }
  if(fieldKey==='length'&&mode==='onehot'){
    return{cls:'verdict-amber',label:'VALID BUT WASTEFUL.',
      note:'3 columns when 1 would do -- throws away the known Short < Medium < Long order.'}
  }
  if(fieldKey==='length'&&mode==='ordinal'){
    return{cls:'verdict-green',label:'CORRECT.',
      note:'1 column, and the order (0, 1, 2) matches the real Short < Medium < Long relationship.'}
  }
  return{cls:'verdict-amber',label:hasOrder?'CORRECT.':'CHECK.',note:''}
}

const fieldButtons0402=[...document.querySelectorAll('#s14 .lab-actions [data-field]')]
const modeButtons0402=[...document.querySelectorAll('#s14 .lab-actions [data-mode]')]
const readout0402=document.querySelector('#matrixReadout0402')
const verdict0402=document.querySelector('#matrixVerdict0402')

let field0402='product'
let mode0402='onehot'

function syncButtons0402(){
  fieldButtons0402.forEach(btn=>btn.classList.toggle('active',btn.dataset.field===field0402))
  modeButtons0402.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===mode0402))
}

function recompute0402(){
  const f=FIELDS_0402[field0402]
  if(!f)return

  let matrix,colCount,colLabels
  if(mode0402==='onehot'){
    matrix=buildOneHot0402(f.rows,f.categories)
    colCount=f.categories.length
    colLabels=f.categories
  }else{
    const order=f.order||f.categories // ordinal on Product still needs *some* stated order to render -- alphabetical, the wrong-but-illustrative one
    matrix=buildOrdinal0402(f.rows,order).map(v=>[v])
    colCount=1
    colLabels=['ordinal code']
  }

  if(readout0402){
    const headerCells=colLabels.map(c=>`<th>${c}</th>`).join('')
    const bodyRows=matrix.map((vec,i)=>`<tr><td>${f.rows[i]}</td>${vec.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')
    readout0402.innerHTML=`
      <p><b>${f.label}</b> — ${mode0402==='onehot'?'one-hot':'ordinal'} encoding, ${colCount} column${colCount===1?'':'s'}</p>
      <table class="worked-table"><thead><tr><th>Row</th>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>
    `
  }
  if(!verdict0402)return
  verdict0402.classList.remove('verdict-red','verdict-amber','verdict-green')
  const v=classifyCombo0402(field0402,mode0402)
  verdict0402.classList.add(v.cls)
  verdict0402.textContent=`${v.label} ${v.note}`
}

fieldButtons0402.forEach(btn=>btn.addEventListener('click',()=>{
  field0402=btn.dataset.field
  syncButtons0402()
  recompute0402()
}))

modeButtons0402.forEach(btn=>btn.addEventListener('click',()=>{
  mode0402=btn.dataset.mode
  syncButtons0402()
  recompute0402()
}))

syncButtons0402()
recompute0402()
