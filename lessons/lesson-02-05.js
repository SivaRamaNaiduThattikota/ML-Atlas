const advancedLesson0205=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0205(){if(advancedLesson0205)advancedLesson0205.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0205)
syncAdvancedTarget0205()

// The Outlier Injector — one slider moves ONE row's prediction; MAE, RMSE and R2 all recompute live.
// "Model E" is 8 CFPB complaints with a real numeric target (days to resolution), not a class.
// 7 rows are fixed with small, ordinary misses. Row 8's predicted value is the only thing the slider
// controls — everything else (the other 7 rows, the dataset's own mean, SS_tot) stays fixed throughout,
// so every change on screen is caused by that one prediction moving, nothing else.
const MODEL_E_FIXED_ROWS=[
  {actual:5,pred:8},
  {actual:10,pred:12},
  {actual:15,pred:17},
  {actual:20,pred:18},
  {actual:25,pred:28},
  {actual:30,pred:33},
  {actual:35,pred:32},
]
const MODEL_E_ALL_ACTUALS=[...MODEL_E_FIXED_ROWS.map(r=>r.actual),40]
const MODEL_E_MEAN=MODEL_E_ALL_ACTUALS.reduce((a,b)=>a+b,0)/MODEL_E_ALL_ACTUALS.length
const MODEL_E_SS_TOT=MODEL_E_ALL_ACTUALS.reduce((total,a)=>total+(a-MODEL_E_MEAN)**2,0)

function outlierStatsAt(pred8){
  const rows=[...MODEL_E_FIXED_ROWS,{actual:40,pred:pred8}]
  const n=rows.length
  const errors=rows.map(r=>r.actual-r.pred)
  const abs=errors.map(Math.abs)
  const sq=errors.map(e=>e*e)
  const sumAbs=abs.reduce((a,b)=>a+b,0)
  const sumSq=sq.reduce((a,b)=>a+b,0)
  const mae=sumAbs/n
  const mse=sumSq/n
  const rmse=Math.sqrt(mse)
  const r2=1-sumSq/MODEL_E_SS_TOT
  return {pred8,mae,rmse,r2,sumSq,n}
}

const BAR_SCALE=6
const BAR_BASELINE=170
const BAR_MAX_HEIGHT=150

const outlierSlider=document.querySelector('#outlierPred')
const outlierPredOut=document.querySelector('#outlierPredOut')
const outlierReadout=document.querySelector('#outlierReadout')
const outlierVerdict=document.querySelector('#outlierVerdict')
const maeBar=document.querySelector('#maeBar')
const rmseBar=document.querySelector('#rmseBar')
const maeBarLabel=document.querySelector('#maeBarLabel')
const rmseBarLabel=document.querySelector('#rmseBarLabel')
const outlierPresetPerfect=document.querySelector('#outlierPresetPerfect')
const outlierPresetWorked=document.querySelector('#outlierPresetWorked')
const outlierPresetExtreme=document.querySelector('#outlierPresetExtreme')

function setBar(bar,label,value,x){
  if(!bar||!label)return
  const h=Math.min(value*BAR_SCALE,BAR_MAX_HEIGHT)
  bar.setAttribute('y',String(BAR_BASELINE-h))
  bar.setAttribute('height',String(h))
  label.setAttribute('x',String(x))
  label.setAttribute('y',String(BAR_BASELINE-h-6))
  label.textContent=value.toFixed(2)
}

function renderOutlierLab(){
  if(!outlierSlider||!outlierReadout||!outlierVerdict)return
  const pred8=Number(outlierSlider.value)
  const s=outlierStatsAt(pred8)
  const miss=pred8-40
  if(outlierPredOut)outlierPredOut.textContent=`Row 8 predicted ${pred8} days (actual: 40 days)`
  outlierReadout.innerHTML=`
    <div><span>ROW 8 MISS</span><b>${miss>=0?'+':''}${miss} days</b></div>
    <div><span>MAE</span><b>${s.mae.toFixed(2)} days</b></div>
    <div><span>RMSE</span><b>${s.rmse.toFixed(2)} days</b></div>
    <div><span>R²</span><b>${s.r2.toFixed(3)}</b></div>
  `
  setBar(maeBar,maeBarLabel,s.mae,70)
  setBar(rmseBar,rmseBarLabel,s.rmse,150)
  outlierVerdict.className=`gate-verdict ${s.r2>=0.5?'verdict-green':s.r2>=0?'verdict-amber':'verdict-red'}`
  outlierVerdict.textContent=pred8===40
    ? `Row 8 is now a perfect prediction — MAE (${s.mae.toFixed(2)}) and RMSE (${s.rmse.toFixed(2)}) sit close together, and R² (${s.r2.toFixed(3)}) is high.`
    : pred8===60
    ? `This is the lesson's worked example. One 20-day miss on row 8 already pulls RMSE (${s.rmse.toFixed(2)}) well above MAE (${s.mae.toFixed(2)}); R² has dropped to ${s.r2.toFixed(3)}.`
    : s.r2<0
    ? `Row 8 is now off by ${Math.abs(miss)} days. MAE only rose to ${s.mae.toFixed(2)}, but RMSE jumped to ${s.rmse.toFixed(2)} and R² went negative (${s.r2.toFixed(3)}) — this model is now worse than just guessing the mean (22.5 days) every time.`
    : `MAE (${s.mae.toFixed(2)}) rises in a straight line as the miss grows; RMSE (${s.rmse.toFixed(2)}) is already pulling ahead of it — the gap is the outlier, not noise.`
}

outlierSlider?.addEventListener('input',renderOutlierLab)
outlierPresetPerfect?.addEventListener('click',()=>{outlierSlider.value='40';renderOutlierLab()})
outlierPresetWorked?.addEventListener('click',()=>{outlierSlider.value='60';renderOutlierLab()})
outlierPresetExtreme?.addEventListener('click',()=>{outlierSlider.value='100';renderOutlierLab()})
renderOutlierLab()
