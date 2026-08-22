(function loadKatex(){
  const version='0.16.9';
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=`https://cdn.jsdelivr.net/npm/katex@${version}/dist/katex.min.css`;
  document.head.appendChild(link);
  const core=document.createElement('script');
  core.src=`https://cdn.jsdelivr.net/npm/katex@${version}/dist/katex.min.js`;
  core.onload=()=>{
    const auto=document.createElement('script');
    auto.src=`https://cdn.jsdelivr.net/npm/katex@${version}/dist/contrib/auto-render.min.js`;
    auto.onload=()=>{
      renderMathInElement(document.body,{
        delimiters:[
          {left:'$$',right:'$$',display:true},
          {left:'\\(',right:'\\)',display:false}
        ],
        throwOnError:false
      });
    };
    document.head.appendChild(auto);
  };
  document.head.appendChild(core);
})();

const themeButton=document.querySelector('#themeToggle');
const savedTheme=localStorage.getItem('mlAtlasTheme');
if(savedTheme)document.documentElement.dataset.theme=savedTheme;
if(themeButton)themeButton.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem('mlAtlasTheme',next)});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('visible')}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));

const topbar=document.querySelector('.topbar');
const primaryNav=topbar?.querySelector('nav');
if(topbar&&primaryNav){
  const menuButton=document.createElement('button');
  menuButton.className='mobile-nav-toggle';menuButton.type='button';
  menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-controls','mobile-primary-nav');menuButton.setAttribute('aria-label','Open navigation');
  menuButton.innerHTML='<span></span><span></span><span></span>';primaryNav.id='mobile-primary-nav';
  topbar.insertBefore(menuButton,topbar.querySelector('.top-actions'));
  const closeMenu=()=>{topbar.classList.remove('nav-open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation')};
  menuButton.addEventListener('click',()=>{const open=topbar.classList.toggle('nav-open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
  primaryNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
  document.addEventListener('click',event=>{if(topbar.classList.contains('nav-open')&&!topbar.contains(event.target))closeMenu()});
}

const scrollControls=document.createElement('nav');
scrollControls.className='scroll-controls';scrollControls.setAttribute('aria-label','Page scroll controls');
scrollControls.innerHTML='<button type="button" data-scroll="top" aria-label="Scroll to top" title="Scroll to top">↑</button><button type="button" data-scroll="bottom" aria-label="Scroll to bottom" title="Scroll to bottom">↓</button>';
document.body.appendChild(scrollControls);
const topScrollButton=scrollControls.querySelector('[data-scroll="top"]');
const bottomScrollButton=scrollControls.querySelector('[data-scroll="bottom"]');
const preferredScrollBehavior=matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
const updateScrollControls=()=>{
  const maximum=Math.max(0,document.documentElement.scrollHeight-innerHeight);
  topScrollButton.hidden=scrollY<240;
  bottomScrollButton.hidden=maximum-scrollY<120||maximum<240;
};
topScrollButton.addEventListener('click',()=>scrollTo({top:0,behavior:preferredScrollBehavior}));
bottomScrollButton.addEventListener('click',()=>scrollTo({top:document.documentElement.scrollHeight,behavior:preferredScrollBehavior}));
addEventListener('scroll',updateScrollControls,{passive:true});addEventListener('resize',updateScrollControls,{passive:true});updateScrollControls();
