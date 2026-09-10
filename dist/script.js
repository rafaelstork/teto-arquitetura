const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const header=$('[data-header]'), menu=$('.menu-button'), nav=$('.nav'), progress=$('.progress'), cursor=$('.cursor');
let lastScroll=0;

let pageReady=false,readyTimer=0;
function finishLoading(){if(pageReady)return;pageReady=true;clearTimeout(readyTimer);$('.loader')?.classList.add('done');document.body.classList.remove('loading');document.body.classList.add('is-ready');revealVisible?.()}
function scheduleLoadingFinish(){clearTimeout(readyTimer);readyTimer=setTimeout(finishLoading,reduceMotion?0:820)}
if(document.readyState==='complete')scheduleLoadingFinish();else addEventListener('load',scheduleLoadingFinish,{once:true});
addEventListener('pageshow',event=>{if(event.persisted)finishLoading()});
setTimeout(finishLoading,3200);
$('[data-year]').textContent=new Date().getFullYear();

addEventListener('scroll',()=>{
  const y=scrollY, max=document.documentElement.scrollHeight-innerHeight;
  header.classList.toggle('scrolled',y>40);
  header.classList.toggle('hidden',y>lastScroll&&y>220&&!nav.classList.contains('open'));
  progress.style.width=`${max?y/max*100:0}%`; lastScroll=y;
},{passive:true});

menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.classList.toggle('active',open);header.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':''});
$$('.nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.classList.remove('active');header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');document.body.style.overflow=''}));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('in-view');revealObserver.unobserve(entry.target)}),{threshold:.12,rootMargin:'0px 0px -35px'});
const revealTargets=$$('.reveal,.image-reveal');revealTargets.forEach(el=>revealObserver.observe(el));
function revealVisible(){revealTargets.forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight*.94&&r.bottom>0){el.classList.add('in-view');revealObserver.unobserve(el)}})}
function revealHashTarget(){if(!location.hash)return;const target=$(location.hash);if(!target)return;$$('.reveal,.image-reveal',target).forEach(el=>{el.classList.add('in-view');revealObserver.unobserve(el)})}
addEventListener('pageshow',()=>{revealHashTarget();setTimeout(revealVisible,80)});addEventListener('load',()=>{revealHashTarget();setTimeout(revealVisible,80);setTimeout(revealVisible,700)});addEventListener('hashchange',()=>{revealHashTarget();setTimeout(revealVisible,80)});addEventListener('scroll',revealVisible,{passive:true});
const countObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target,target=+el.dataset.count,start=performance.now();const frame=now=>{const p=Math.max(0,Math.min((now-start)/1400,1));el.textContent=Math.round(target*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(frame)};requestAnimationFrame(frame);countObserver.unobserve(el)}),{threshold:.8});
$$('[data-count]').forEach(el=>countObserver.observe(el));

const anatomy=$('.anatomy');
const anatomyScenes=[
  {title:'Matéria que cria identidade.',text:'Madeira, pedra e metal não entram como acabamento. Eles constroem a atmosfera e tornam o espaço reconhecível.'},
  {title:'Luz que transforma percepção.',text:'Natural ou desenhada, a iluminação revela volumes, muda a leitura das superfícies e acompanha cada momento do dia.'},
  {title:'Movimento que vira experiência.',text:'Circulação, proporção e encontros são pensados para que o espaço funcione com naturalidade e permaneça vivo.'}
];
let anatomyIndex=-1,anatomyTick=false;
function setAnatomyScene(index){if(index===anatomyIndex)return;anatomyIndex=index;const scene=anatomyScenes[index];$('[data-anatomy-index]').textContent=`${String(index+1).padStart(2,'0')} / 03`;$('[data-anatomy-title]').textContent=scene.title;$('[data-anatomy-text]').textContent=scene.text;$$('[data-hotspot]').forEach((hotspot,i)=>hotspot.classList.toggle('active',i===index))}
function updateAnatomy(){const rect=anatomy.getBoundingClientRect(),travel=anatomy.offsetHeight-innerHeight,p=Math.max(0,Math.min(1,-rect.top/travel));const scene=Math.min(2,Math.floor(p*3));setAnatomyScene(scene);$('.anatomy-progress b').style.width=`${p*100}%`;if(!reduceMotion)$('.anatomy-image').style.transform=`scale(${1.08-p*.08}) translateY(${(p-.5)*1.8}%)`;anatomyTick=false}
addEventListener('scroll',()=>{if(anatomyTick)return;anatomyTick=true;requestAnimationFrame(updateAnatomy)},{passive:true});updateAnatomy();
$$('[data-hotspot]').forEach((hotspot,index)=>hotspot.addEventListener('click',()=>{const travel=anatomy.offsetHeight-innerHeight;scrollTo({top:anatomy.offsetTop+travel*(index/2),behavior:reduceMotion?'auto':'smooth'})}));

const slides=$$('.hero-slide'),hero=$('.hero');let slideIndex=0,slideTimer;
function restartSlideProgress(){const bar=$('.slide-count i:after');void bar}
function showSlide(index){slides[slideIndex].classList.remove('active');slideIndex=(index+slides.length)%slides.length;slides[slideIndex].classList.add('active');$('[data-current]').textContent=String(slideIndex+1).padStart(2,'0');const counter=$('.slide-count i');counter.style.animation='none';void counter.offsetWidth;counter.style.animation=''}
function autoSlides(){clearInterval(slideTimer);if(!reduceMotion)slideTimer=setInterval(()=>showSlide(slideIndex+1),6000)}
$('[data-next]').addEventListener('click',()=>{showSlide(slideIndex+1);autoSlides()});$('[data-prev]').addEventListener('click',()=>{showSlide(slideIndex-1);autoSlides()});hero.addEventListener('mouseenter',()=>{hero.classList.add('paused');clearInterval(slideTimer)});hero.addEventListener('mouseleave',()=>{hero.classList.remove('paused');autoSlides()});autoSlides();
let touchStart=0;hero.addEventListener('touchstart',e=>touchStart=e.changedTouches[0].clientX,{passive:true});hero.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchStart;if(Math.abs(dx)>55){showSlide(slideIndex+(dx<0?1:-1));autoSlides()}},{passive:true});

const serviceData={
  arquitetura:{image:'assets/portfolio-05.jpg',alt:'Projeto residencial contemporâneo',label:'Arquitetura',text:'Forma, função e contexto reunidos em um projeto inteiramente autoral.'},
  interiores:{image:'assets/portfolio-02.jpg',alt:'Living contemporâneo',label:'Interiores',text:'Layouts, materiais e mobiliário pensados para transformar rotina em experiência.'},
  comercial:{image:'assets/portfolio-04.jpg',alt:'Projeto comercial Seu Bragança',label:'Comercial & corporativo',text:'Espaços que tornam marcas reconhecíveis, experiências memoráveis e operações mais eficientes.'},
  lighting:{image:'assets/portfolio-08.jpg',alt:'Interior com iluminação integrada',label:'Lighting design',text:'A luz desenhada desde o início para revelar volumes, materiais e atmosferas.'}
};
const serviceStage=$('.service-stage');
let serviceTimer=0;
$$('[data-service]').forEach(button=>button.addEventListener('click',()=>{if(button.classList.contains('active'))return;const data=serviceData[button.dataset.service],img=$('[data-service-image]');clearTimeout(serviceTimer);$$('[data-service]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-selected',String(b===button))});serviceStage.classList.add('changing');const preload=new Image();preload.src=data.image;serviceTimer=setTimeout(()=>{img.src=data.image;img.alt=data.alt;$('[data-service-label]').textContent=data.label;$('[data-service-text]').textContent=data.text;requestAnimationFrame(()=>serviceStage.classList.remove('changing'))},240)}));

const rail=$('[data-rail]');let isDown=false,startX=0,startScroll=0,moved=false,downCard=null;
rail.addEventListener('pointerdown',e=>{isDown=true;moved=false;downCard=e.target.closest('[data-project]');startX=e.clientX;startScroll=rail.scrollLeft;rail.classList.add('dragging');rail.setPointerCapture(e.pointerId)});
rail.addEventListener('pointermove',e=>{if(!isDown)return;const dx=e.clientX-startX;if(Math.abs(dx)>6)moved=true;rail.scrollLeft=startScroll-dx*1.25});
rail.addEventListener('pointerup',()=>{const card=downCard,shouldOpen=card&&!moved;isDown=false;downCard=null;rail.classList.remove('dragging');if(shouldOpen)openProject(+card.dataset.project)});rail.addEventListener('pointercancel',()=>{isDown=false;downCard=null;rail.classList.remove('dragging')});
$('[data-rail-next]').addEventListener('click',()=>rail.scrollBy({left:innerWidth*.55,behavior:'smooth'}));$('[data-rail-prev]').addEventListener('click',()=>rail.scrollBy({left:-innerWidth*.55,behavior:'smooth'}));

const projects=[
  {image:'assets/portfolio-05.jpg',type:'Residencial',title:'Arquitetura e paisagem',number:'01'},
  {image:'assets/portfolio-02.jpg',type:'Interiores',title:'Materialidade e conforto',number:'02'},
  {image:'assets/portfolio-03.jpg',type:'Residencial',title:'Linhas que acolhem',number:'03'},
  {image:'assets/portfolio-04.jpg',type:'Comercial',title:'Seu Bragança',number:'04'},
  {image:'assets/portfolio-08.jpg',type:'Interiores',title:'Detalhe, luz e movimento',number:'05'},
  {image:'assets/portfolio-07.jpg',type:'Interiores',title:'Cor com permanência',number:'06'}
];
const lightbox=$('.lightbox');let projectIndex=0;
function renderProject(index){projectIndex=(index+projects.length)%projects.length;const p=projects[projectIndex],img=$('.lightbox img');img.style.opacity='0';setTimeout(()=>{img.src=p.image;img.alt=p.title;$('.lightbox figcaption span').textContent=p.type;$('.lightbox figcaption strong').textContent=p.title;$('.lightbox figcaption small').textContent=`${p.number} / 06`;img.style.opacity='1'},160)}
function openProject(index){renderProject(index);lightbox.showModal();document.body.style.overflow='hidden'}
$$('[data-project]').forEach(card=>card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openProject(+card.dataset.project)}}));
$('.lightbox-close').addEventListener('click',()=>lightbox.close());$('.lightbox-next').addEventListener('click',()=>renderProject(projectIndex+1));$('.lightbox-prev').addEventListener('click',()=>renderProject(projectIndex-1));lightbox.addEventListener('close',()=>document.body.style.overflow='');addEventListener('keydown',e=>{if(!lightbox.open)return;if(e.key==='ArrowRight')renderProject(projectIndex+1);if(e.key==='ArrowLeft')renderProject(projectIndex-1)});

$$('.faq details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)$$('.faq details').forEach(other=>{if(other!==item)other.open=false})}));

if(matchMedia('(pointer:fine)').matches&&!reduceMotion){
  addEventListener('pointermove',e=>{cursor.style.left=`${e.clientX}px`;cursor.style.top=`${e.clientY}px`});
  rail.addEventListener('mouseenter',()=>{cursor.classList.add('drag');cursor.querySelector('span').textContent='ARRASTE'});rail.addEventListener('mouseleave',()=>cursor.classList.remove('drag'));
  $$('.project-card').forEach(card=>{card.addEventListener('mouseenter',()=>{cursor.classList.remove('drag');cursor.classList.add('view');cursor.querySelector('span').textContent='ABRIR'});card.addEventListener('mouseleave',()=>{cursor.classList.remove('view');cursor.classList.add('drag');cursor.querySelector('span').textContent='ARRASTE'})});
  $$('.magnetic').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.11}px,${(e.clientY-r.top-r.height/2)*.16}px)`});el.addEventListener('mouseleave',()=>el.style.transform='')});
  let ticking=false;addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{$$('.about-visual img').forEach(img=>{const r=img.parentElement.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)img.style.transform=`translateY(${(r.top/innerHeight)*-4-7}%)`});ticking=false})},{passive:true});
}
