const advancedLesson0301=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0301(){if(advancedLesson0301)advancedLesson0301.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0301)
syncAdvancedTarget0301()

// Section 14's lab: The Investigation Board -- four "checklist" findings on a raw
// CFPB-style complaint pull, each already reported clean. Clicking "Dig deeper" on
// a card is the one move a fixed checklist never makes on its own: asking a specific
// follow-up question of that exact finding. Nothing here computes a new statistic --
// the reveal text is the same kind of hand-checkable fact Section 10 already worked
// through (same mean, different shape), just spread across four illustrative findings.

const FINDINGS_0301=[
  {
    tag:'ROW-COUNT CHECK',
    checklist:'50,000 raw complaints pulled -- matches the expected count for the date range. Nothing missing.',
    question:'Dig deeper: is every column actually populated for all 50,000 rows?',
    reveal:'sub_product is empty for 38% of rows -- and every one of them was filed before CFPB added that field in 2019. The missingness isn’t scattered noise, it’s a hard cutoff a single percentage can’t show (Concept 03, missing-data mechanisms).'
  },
  {
    tag:'CENTRAL-TENDENCY CHECK',
    checklist:'Mean days-to-respond: 10.0 days across the full pull -- an unremarkable, normal-looking average.',
    question:'Dig deeper: does any complaint actually take close to 10 days?',
    reveal:'A 4-row sample closing at 5, 5, 15, 15 days still averages exactly 10.0 -- nobody in that sample waited anywhere near 10 days. A mean alone can’t tell a fast-and-slow split from a genuinely typical case (Concept 02, univariate analysis).'
  },
  {
    tag:'CORRELATION CHECK',
    checklist:'Correlation heatmap across numeric columns: strongest |r| = 0.18 -- no strong linear relationships.',
    question:'Dig deeper: how many of this dataset’s columns are actually numeric?',
    reveal:'Only 3 of 19 raw columns are numeric. Product, sub-product, company, state, and the complaint narrative itself -- 16 columns -- never appeared on that heatmap at all (Concepts 06 and 08, correlation traps and cardinality).'
  },
  {
    tag:'CLASS-BALANCE CHECK',
    checklist:'Overall relief rate: 22.3% -- the exact figure Modules 01-02 already used as CFPB’s fixed class balance.',
    question:'Dig deeper: is 22.3% the same across every product category?',
    reveal:'Broken out by product, relief rates could plausibly range from near 4% in one category to over 60% in another -- one aggregate figure quietly averaging several very different subpopulations (Concept 07, diagnosing class imbalance early).'
  }
]

const board0301=document.querySelector('#investigationBoard0301')
const tally0301=document.querySelector('#investigationTally0301')
const verdict0301=document.querySelector('#investigationVerdict0301')
const investigated0301=new Set()

function cardMarkup0301(finding,index){
  const dug=investigated0301.has(index)
  return `<article class="info-card" data-card="${index}">
    <span>${finding.tag}</span>
    <h3>${finding.checklist}</h3>
    <p>${finding.question}</p>
    <button type="button" class="secondary${dug?' active':''}" data-dig="${index}"${dug?' disabled':''}>${dug?'Investigated':'Dig deeper'}</button>
    ${dug?`<div class="callout warning" style="margin-top:16px"><b>What the checklist missed</b>${finding.reveal}</div>`:''}
  </article>`
}

function renderTally0301(){
  if(!tally0301)return
  tally0301.innerHTML=`
    <div><span>CHECKLIST OUTPUTS</span><b>4 of 4 -- all reported clean</b></div>
    <div><span>FINDINGS INVESTIGATED</span><b>${investigated0301.size} of 4</b></div>
    <div><span>REAL ISSUES SURFACED</span><b>${investigated0301.size} of 4</b></div>
  `
}

function renderVerdict0301(){
  if(!verdict0301)return
  const n=investigated0301.size
  let cls,text
  if(n===0){
    cls='verdict-amber'
    text='Four checklist outputs, zero follow-up questions -- a completed checklist, and zero issues actually surfaced. Every card above is still hiding what the checklist alone couldn’t show.'
  }else if(n<4){
    cls='verdict-amber'
    text=`${n} of 4 findings investigated -- ${n} real issue${n===1?'':'s'} surfaced that the checklist alone reported as clean. Keep digging into the rest.`
  }else{
    cls='verdict-green'
    text='All 4 findings investigated -- every checklist output that looked clean was hiding something a disciplined follow-up question caught. That gap, not the arithmetic, is what this concept is about.'
  }
  verdict0301.className=`gate-verdict ${cls}`
  verdict0301.textContent=text
}

function render0301(){
  if(!board0301)return
  board0301.innerHTML=FINDINGS_0301.map(cardMarkup0301).join('')
  board0301.querySelectorAll('button[data-dig]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const idx=Number(btn.dataset.dig)
      investigated0301.add(idx)
      render0301()
    })
  })
  renderTally0301()
  renderVerdict0301()
}

render0301()
