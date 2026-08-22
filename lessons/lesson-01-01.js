const advancedLesson0101=document.querySelector('#advanced-lesson');
function syncAdvancedTarget0101(){if(advancedLesson0101)advancedLesson0101.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0101,);syncAdvancedTarget0101();
const thresholdPoints=[{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:6,y:1},{x:7,y:1},{x:8,y:1}];
function predictionsFor(threshold){return thresholdPoints.map(p=>({...p,pred:p.x>threshold?1:0}))}
function errorsFor(threshold){return predictionsFor(threshold).filter(p=>p.pred!==p.y).length}
function bestThreshold(){
  let best=thresholdPoints[0].x,bestErrors=Infinity;
  thresholdPoints.forEach(p=>{const candidate=p.x-0.5;const errors=errorsFor(candidate);if(errors<bestErrors){bestErrors=errors;best=candidate}});
  return best;
}
const thresholdButtons=[...document.querySelectorAll('.threshold-button')];
const thresholdOutput=document.querySelector('#thresholdLabOutput');
function renderThreshold(approach){
  const threshold=approach==='rule'?2:bestThreshold();
  const rows=predictionsFor(threshold);
  const errors=rows.filter(p=>p.pred!==p.y).length;
  const rowsHtml=rows.map(p=>`<div class="prob-row"><span>x=${p.x}</span><div class="bar-track"><div class="bar-fill" style="width:${p.pred*100}%"></div></div><span>${p.pred===p.y?'correct':'WRONG'} (actual ${p.y})</span></div>`).join('');
  if(!thresholdOutput)return;
  thresholdOutput.innerHTML=`<p class="fine-print">${approach==='rule'?'Hand-picked rule: predict 1 if x > 2':`Learned threshold: predict 1 if x > ${threshold}`}</p><div class="prob-bars">${rowsHtml}</div><p><b>${errors} of ${rows.length} predictions wrong</b></p>`;
}
function selectThreshold(button){
  thresholdButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.classList.toggle('secondary',!active);item.setAttribute('aria-pressed',String(active))});
  renderThreshold(button.dataset.approach);
}
thresholdButtons.forEach(button=>button.addEventListener('click',()=>selectThreshold(button)));
if(thresholdButtons[0])selectThreshold(thresholdButtons[0]);
