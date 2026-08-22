const advancedLesson0102=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0102(){if(advancedLesson0102)advancedLesson0102.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0102)
syncAdvancedTarget0102()

const paradigmScenarios=[
  {text:'Predict whether a new complaint will end in monetary relief, using thousands of past complaints that already show whether relief was granted.',answer:'supervised',why:'Each historical example already carries the outcome (relief or not) the model learns to predict.'},
  {text:'Group ten thousand complaint narratives into a handful of natural themes, with no theme labels attached to any of them.',answer:'unsupervised',why:'There is no known "correct" theme per narrative — only structure to discover.'},
  {text:'Classify a complaint narrative into one of four known product categories, using past narratives that already carry their true product label.',answer:'supervised',why:'The product label is a known outcome recorded on every historical example.'},
  {text:'Train a routing agent that picks the next escalation action for a complaint and only finds out days later, after several actions, whether the case resolved well.',answer:'reinforcement',why:'Feedback is delayed, depends on a sequence of actions, and there is no single correct action per step.'},
  {text:'Compress a wide table of numeric complaint features into two dimensions to plot and visually inspect, with no target value involved at all.',answer:'unsupervised',why:'No outcome is being predicted — only the structure of the features themselves matters.'},
  {text:'Score how likely an existing customer is to churn next month, based on thousands of past customers whose actual churn or no-churn outcome is already recorded.',answer:'supervised',why:'A known outcome (churned or not) exists for every historical example.'}
]
let paradigmIndex=0
let paradigmScore=0
const paradigmButtons=[...document.querySelectorAll('.paradigm-button')]
const paradigmOutput=document.querySelector('#paradigmLabOutput')

function renderParadigmScenario(){
  if(!paradigmOutput)return
  if(paradigmIndex>=paradigmScenarios.length){
    paradigmOutput.innerHTML=`<p class="fine-print">Quiz complete.</p><p><b>${paradigmScore} of ${paradigmScenarios.length} correct.</b></p><button type="button" class="paradigm-button secondary" id="paradigmRestart">Restart</button>`
    document.querySelector('#paradigmRestart')?.addEventListener('click',()=>{paradigmIndex=0;paradigmScore=0;renderParadigmScenario()})
    return
  }
  const scenario=paradigmScenarios[paradigmIndex]
  paradigmOutput.innerHTML=`<p class="fine-print">Scenario ${paradigmIndex+1} of ${paradigmScenarios.length} · score ${paradigmScore}</p><p>${scenario.text}</p>`
}

function answerParadigm(choice){
  if(!paradigmOutput||paradigmIndex>=paradigmScenarios.length)return
  const scenario=paradigmScenarios[paradigmIndex]
  const correct=choice===scenario.answer
  if(correct)paradigmScore+=1
  paradigmOutput.innerHTML=`<p class="fine-print">Scenario ${paradigmIndex+1} of ${paradigmScenarios.length}</p><p>${scenario.text}</p><p><b>${correct?'Correct':`Not quite — this is ${scenario.answer}`}.</b> ${scenario.why}</p>`
  paradigmIndex+=1
  setTimeout(renderParadigmScenario,1400)
}

paradigmButtons.forEach(button=>button.addEventListener('click',()=>answerParadigm(button.dataset.paradigm)))
renderParadigmScenario()
