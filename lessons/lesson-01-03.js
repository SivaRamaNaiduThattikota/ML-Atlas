const advancedLesson0103=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0103(){if(advancedLesson0103)advancedLesson0103.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0103)
syncAdvancedTarget0103()

const sampleButtons=[...document.querySelectorAll('.sample-button')]
const sampleOutput=document.querySelector('#sampleLabOutput')

function bar(value){
  return '█'.repeat(Math.max(1,Math.round(value*40)))
}

function renderSample(n,label){
  if(!sampleOutput)return
  const trainLoss=0.02
  const trueLoss=trainLoss+0.9/Math.sqrt(n)
  const gap=trueLoss-trainLoss
  const note=n<=5
    ?'huge, because five memorized examples tell you almost nothing about the full population.'
    :n<=50
    ?'smaller, but still real — fifty examples is still a thin slice of the true distribution.'
    :'much smaller — five hundred examples track the true distribution far more closely, though the gap never fully reaches zero.'
  sampleOutput.innerHTML=`<p class="fine-print">${label} · the same memorized model, evaluated two ways</p><p><b>Training loss</b> (on the ${n} examples it saw): ${trainLoss.toFixed(3)}<br>${bar(trainLoss)}</p><p><b>True/population loss</b> (on data it never saw): ${trueLoss.toFixed(3)}<br>${bar(trueLoss)}</p><p><b>Generalization gap:</b> ${gap.toFixed(3)} — ${note}</p>`
}

sampleButtons.forEach(button=>button.addEventListener('click',()=>{
  sampleButtons.forEach(other=>other.classList.remove('active'))
  button.classList.add('active')
  renderSample(Number(button.dataset.n),button.textContent)
}))

renderSample(5,'Tiny sample (n = 5)')
