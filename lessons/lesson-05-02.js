// Section 14's lab: The Resampling Bench. Two independent discrete
// controls, each driving a separate visual -- a technique selector
// (composition bars, real/duplicate/synthetic) and a split-timing toggle
// (a train/test boundary diagram with a highlighted leaking duplicate
// pair). Every number below was computed once via two independently-coded
// Node.js scripts and hardcoded here.

const TECHNIQUES_0502={
  over:{label:'Random oversampling',minority:14,real:4,duplicate:10,synthetic:0,majority:14,total:28},
  under:{label:'Random undersampling',minority:4,real:4,duplicate:0,synthetic:0,majority:4,total:8},
  smote:{label:'SMOTE',minority:14,real:4,duplicate:0,synthetic:10,majority:14,total:28},
}
const BEFORE_0502={minority:4,majority:14,total:18}

const techButtons0502=[...document.querySelectorAll('#s14 [data-technique]')]
const timingButtons0502=[...document.querySelectorAll('#s14 [data-timing]')]
const barsWrap0502=document.querySelector('#wgResampleBars_0502')
const readout0502=document.querySelector('#wgResampleReadout_0502')
const splitWrap0502=document.querySelector('#wgSplitDiagram_0502')
const verdict0502=document.querySelector('#wgResampleVerdict_0502')

let currentTechnique0502='over'
let currentTiming0502='after'

function syncButtons0502(){
  techButtons0502.forEach(btn=>btn.classList.toggle('active',btn.dataset.technique===currentTechnique0502))
  timingButtons0502.forEach(btn=>btn.classList.toggle('active',btn.dataset.timing===currentTiming0502))
}

function renderComposition0502(){
  const t=TECHNIQUES_0502[currentTechnique0502]

  if(readout0502){
    readout0502.innerHTML=`
      <div><span>BEFORE</span><b>${BEFORE_0502.minority} minority / ${BEFORE_0502.majority} majority / ${BEFORE_0502.total} total</b></div>
      <div><span>AFTER — ${t.label}</span><b>${t.minority} minority (${t.real} real${t.duplicate?' + '+t.duplicate+' duplicate':''}${t.synthetic?' + '+t.synthetic+' synthetic':''}) / ${t.majority} majority / ${t.total} total</b></div>
    `
  }

  if(barsWrap0502){
    const scale=v=>v*8
    const minoritySegs=[]
    minoritySegs.push({w:t.real,fill:'var(--orange)',label:'real'})
    if(t.duplicate)minoritySegs.push({w:t.duplicate,fill:'var(--orange)',pattern:true,label:'duplicate'})
    if(t.synthetic)minoritySegs.push({w:t.synthetic,fill:'#7b5ee6',label:'synthetic'})
    let x=40
    const segRects=minoritySegs.map(seg=>{
      const w=scale(seg.w)
      const rect=`<rect x="${x}" y="60" width="${w}" height="24" fill="${seg.fill}" ${seg.pattern?'fill-opacity="0.5" stroke="currentColor" stroke-dasharray="3,2"':''} stroke="currentColor" stroke-width="1"/><text x="${x+w/2}" y="76" font-size="8" text-anchor="middle" font-family="IBM Plex Mono, monospace">${seg.label} ${seg.w}</text>`
      x+=w
      return rect
    }).join('')
    const majW=scale(t.majority)
    const beforeMinW=scale(BEFORE_0502.minority)
    const beforeMajW=scale(BEFORE_0502.majority)
    barsWrap0502.innerHTML=`
      <svg class="vector-plane" viewBox="0 0 460 190" role="img" aria-label="Composition bars before and after ${t.label}, showing real, duplicate and synthetic minority rows separately">
        <title>Before and after composition for ${t.label}</title>
        <desc>Before: ${BEFORE_0502.minority} minority, ${BEFORE_0502.majority} majority. After ${t.label}: minority made of ${t.real} real${t.duplicate?', '+t.duplicate+' duplicate':''}${t.synthetic?', '+t.synthetic+' synthetic':''} rows, ${t.majority} majority rows.</desc>
        <text x="40" y="16" font-size="9" font-family="IBM Plex Mono, monospace" font-weight="700">BEFORE</text>
        <rect x="40" y="22" width="${beforeMinW}" height="24" fill="var(--orange)" stroke="currentColor" stroke-width="1"/>
        <text x="${40+beforeMinW/2}" y="38" font-size="8" text-anchor="middle" font-family="IBM Plex Mono, monospace">min ${BEFORE_0502.minority}</text>
        <rect x="${40+beforeMinW+6}" y="22" width="${beforeMajW}" height="24" fill="var(--muted)" fill-opacity="0.4" stroke="currentColor" stroke-width="1"/>
        <text x="${40+beforeMinW+6+beforeMajW/2}" y="38" font-size="8" text-anchor="middle" font-family="IBM Plex Mono, monospace">maj ${BEFORE_0502.majority}</text>
        <text x="40" y="54" font-size="9" font-family="IBM Plex Mono, monospace" font-weight="700">AFTER — ${t.label}</text>
        ${segRects}
        <rect x="${x+6}" y="60" width="${majW}" height="24" fill="var(--muted)" fill-opacity="0.4" stroke="currentColor" stroke-width="1"/>
        <text x="${x+6+majW/2}" y="76" font-size="8" text-anchor="middle" font-family="IBM Plex Mono, monospace">maj ${t.majority}</text>
        <text x="40" y="100" font-size="7.5" font-family="IBM Plex Mono, monospace">Total: ${BEFORE_0502.total} → ${t.total}</text>
      </svg>
    `
  }
}

function renderSplit0502(){
  const wrong=currentTiming0502==='before'
  if(splitWrap0502){
    const trainDotsWrong=['M1','M2','M3','M4','M4′','J1','J2','J3','J4','J5','J6','J7','J8','J9','J10','J11','J12','J13']
    const testDotsWrong=['M2′','J14','J15','J16','J17']
    const trainDotsRight=['M1','M2','M3','J1','J2','J3','J4','J5','J6','J7','J8','J9','J10']
    const testDotsRight=['M4','J11','J12','J13','J14']
    const trainDots=wrong?trainDotsWrong:trainDotsRight
    const testDots=wrong?testDotsWrong:testDotsRight
    const dotRow=(dots,y,highlight)=>dots.map((d,i)=>{
      const isHighlight=highlight&&(d===highlight[0]||d===highlight[1])
      return `<circle cx="${40+i*22}" cy="${y}" r="7" fill="${isHighlight?'var(--orange)':'var(--green)'}" fill-opacity="${isHighlight?0.9:0.5}" stroke="currentColor" stroke-width="${isHighlight?2:1}"/><text x="${40+i*22}" y="${y+3}" font-size="6" text-anchor="middle" font-family="IBM Plex Mono, monospace">${d}</text>`
    }).join('')
    const leakLine=wrong?`<line x1="150" y1="40" x2="106" y2="110" stroke="var(--orange)" stroke-width="2" stroke-dasharray="4,3"/><text x="128" y="78" font-size="7" fill="var(--orange)" font-family="IBM Plex Mono, monospace" font-weight="700">duplicate pair</text>`:''
    splitWrap0502.innerHTML=`
      <svg class="vector-plane" viewBox="0 0 460 150" role="img" aria-label="A train and test boundary diagram, ${wrong?'showing a duplicated row split across both sides':'showing a clean split with no duplicated rows crossing the boundary'}">
        <title>Split diagram, ${wrong?'resample before split (wrong)':'resample after split (correct)'}</title>
        <desc>${wrong?'Train contains the original M2 and 17 other rows including a duplicate M4-prime; test contains M2-prime, a duplicate of a training row, plus 4 majority rows -- a leaking duplicate pair split across the boundary.':'Train contains 13 rows (M1, M2, M3 and 10 majority rows); test contains 5 rows (M4 and 4 majority rows) -- no row appears on both sides.'}</desc>
        <text x="40" y="16" font-size="9" font-family="IBM Plex Mono, monospace" font-weight="700">TRAIN (${trainDots.length})</text>
        ${dotRow(trainDots,40,wrong?['M2','M2′']:null)}
        <line x1="40" y1="65" x2="420" y2="65" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>
        <text x="40" y="98" font-size="9" font-family="IBM Plex Mono, monospace" font-weight="700">TEST (${testDots.length})</text>
        ${dotRow(testDots,116,wrong?['M2','M2′']:null)}
        ${leakLine}
      </svg>
    `
  }
  if(verdict0502){
    verdict0502.className='callout'+(wrong?' warning':'')
    if(wrong){
      verdict0502.innerHTML=`<b>LEAK</b> -- M2 was duplicated into M2′ before the split ever happened. This concrete random split placed the original M2 in train and its exact duplicate M2′ in test: the model didn't have to generalize to M2′ at all, it just had to recognize a row it had already memorized. This is Module 01 Concept 08's group/duplicate leakage, caused by resampling instead of a resubmitted narrative.`
    }else{
      verdict0502.innerHTML=`<b>NO LEAK</b> -- resampling only touched the training fold. The held-out test rows, including M4, a genuinely new relief-granted complaint, were never duplicated, synthesized, or dropped. Whatever score this fold's test rows produce is real.`
    }
  }
}

techButtons0502.forEach(btn=>btn.addEventListener('click',()=>{
  currentTechnique0502=btn.dataset.technique
  syncButtons0502()
  renderComposition0502()
}))
timingButtons0502.forEach(btn=>btn.addEventListener('click',()=>{
  currentTiming0502=btn.dataset.timing
  syncButtons0502()
  renderSplit0502()
}))

syncButtons0502()
renderComposition0502()
renderSplit0502()
