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

// Single source of truth for the lesson-page nav and footer brand block.
// Every lesson HTML file still carries this markup hardcoded as a no-JS
// fallback, but on any page with body class "lesson-page" this overwrites
// it at runtime -- so changing the nav or the footer brand for all 30+
// lesson files (and every future one) is a one-line edit here, not a
// per-file edit. Site-shell pages (index/roadmap/concept-structure/
// projects) are NOT touched -- they have real per-page nav variation
// (active-link) that isn't worth centralizing.
if(document.body.classList.contains('lesson-page')){
  const LESSON_NAV_LINKS=[
    ['../index.html','Home'],
    ['../roadmap.html','Roadmap'],
    ['../concept-structure.html','Lesson anatomy'],
    ['../projects.html','Projects'],
  ];
  const primaryNavEl=document.querySelector('.topbar nav[aria-label="Primary"]');
  if(primaryNavEl)primaryNavEl.innerHTML=LESSON_NAV_LINKS.map(([href,label])=>`<a href="${href}">${label}</a>`).join('');
  const footerBrandEl=document.querySelector('footer .brand');
  if(footerBrandEl)footerBrandEl.innerHTML='<span class="brand-mark">M</span><span>ML <b>ATLAS</b></span>';

  // Lessons quick-jump dropdown, built from roadmap.js's own phases data so
  // it never duplicates or drifts from the roadmap page's source of truth.
  // roadmap.js is loaded dynamically here (never via a <script> tag in any
  // lesson file's head) so this required zero edits to any lesson file --
  // same one-source-of-truth approach as the nav/footer injection above.
  // Links use bare filenames (no "../") since every lesson file lives in
  // this same lessons/ folder.
  function buildLessonsDropdown(){
    const phases=window.ATLAS_PHASES;
    if(!phases||!primaryNavEl||primaryNavEl.querySelector('.lessons-dropdown'))return;
    const sections=phases.map(phase=>{
      const moduleBlocks=phase.modules.filter(m=>(m.builtCount||0)>0).map(module=>{
        const modId=String(module.n).padStart(2,'0');
        const links=module.concepts.slice(0,module.builtCount||0).map((concept,index)=>{
          const cId=String(index+1).padStart(2,'0');
          return `<a class="lessons-dropdown-link" href="module-${modId}-concept-${cId}.html">${cId} · ${concept}</a>`;
        }).join('');
        return `<div class="lessons-dropdown-module-title">M${modId} · ${module.title}</div>${links}`;
      }).join('');
      if(!moduleBlocks)return '';
      return `<div class="lessons-dropdown-phase-title">Phase ${phase.number} · ${phase.title}</div>${moduleBlocks}`;
    }).join('');
    if(!sections)return;
    const wrap=document.createElement('div');
    wrap.className='lessons-dropdown';
    wrap.innerHTML=`<button type="button" class="lessons-dropdown-trigger" aria-expanded="false" aria-haspopup="true">Lessons</button><div class="lessons-dropdown-panel" hidden>${sections}</div>`;
    primaryNavEl.appendChild(wrap);
    const trigger=wrap.querySelector('.lessons-dropdown-trigger');
    const panel=wrap.querySelector('.lessons-dropdown-panel');
    const closeDropdown=()=>{panel.hidden=true;trigger.setAttribute('aria-expanded','false')};
    trigger.addEventListener('click',event=>{
      event.stopPropagation();
      const open=panel.hidden;
      panel.hidden=!open;
      trigger.setAttribute('aria-expanded',String(open));
    });
    document.addEventListener('click',event=>{if(!wrap.contains(event.target))closeDropdown()});
    document.addEventListener('keydown',event=>{if(event.key==='Escape')closeDropdown()});
  }
  if(window.ATLAS_PHASES){
    buildLessonsDropdown();
  }else{
    addEventListener('atlasphasesready',buildLessonsDropdown,{once:true});
    const roadmapScript=document.createElement('script');
    roadmapScript.src='../roadmap.js';
    document.head.appendChild(roadmapScript);
  }
}

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
