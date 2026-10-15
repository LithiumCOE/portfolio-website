import {marked} from './vendor/marked.esm.js';
import DOMPurify from './vendor/purify.es.js';

const screen=document.querySelector('#work');
const grid=screen.querySelector('.work-grid');
const filters=screen.querySelector('.work-filters');
const status=screen.querySelector('.works-status');
const contentRoot=new URL('./content/projects/',import.meta.url);
const assetRoot=new URL('./assets/figma/',import.meta.url);
const asset=name=>new URL(name,assetRoot).href;
const arrow='96f093b16ba9b0fb277df6969cf91c96d2d976dc.svg';
let projects=[],categories=[],selected=null,opener=null,controller=null,openProject=null;
let demoTimer=null,demoRunning=false;

const modal=document.createElement('dialog');
modal.className='project-modal';modal.setAttribute('aria-labelledby','project-title');
modal.innerHTML=`<button class="project-close" type="button" aria-label="关闭项目"><img src="${asset('cb25c89c8151c2d294ba1996782aa798d9e36025.svg')}" width="30" height="30" alt=""><span aria-hidden="true">×</span></button>
<div class="modal-scroller"><article class="project-sheet">
<section class="project-intro"><header class="project-heading"><h2 id="project-title"></h2><span class="project-subtitle"></span></header>
<p class="project-category"></p><div class="project-markdown intro-markdown" aria-live="polite"></div>
<div class="project-media-row"><div class="project-gallery" aria-label="项目图片浏览器">
<div class="gallery-main"><img class="gallery-image" alt="" hidden><span class="gallery-placeholder"></span>
<button class="gallery-nav previous" type="button" aria-label="上一张图片">‹</button><button class="gallery-nav next" type="button" aria-label="下一张图片">‹</button><span class="gallery-count" aria-live="polite"></span></div>
<div class="gallery-thumbs" role="group" aria-label="图片缩略图"></div></div>
<a class="project-external" target="_blank" rel="noopener noreferrer"><img src="${asset('406434beffae31a3c3c9b2b17472450ec2953807.svg')}" width="32" height="32" alt=""><span></span></a></div>
<button class="project-more" type="button"><span>MORE</span><img src="${asset(arrow)}" width="80" height="26" alt=""></button></section>
<section class="project-body" hidden><div class="project-markdown body-markdown"></div></section>
</article></div>`;
document.body.append(modal);
const scroller=modal.querySelector('.modal-scroller');
const sheet=modal.querySelector('.project-sheet');
const intro=modal.querySelector('.intro-markdown');
const body=modal.querySelector('.body-markdown');
const bodySection=modal.querySelector('.project-body');
const more=modal.querySelector('.project-more');
const external=modal.querySelector('.project-external');
const mainImage=modal.querySelector('.gallery-image');
const placeholder=modal.querySelector('.gallery-placeholder');
const thumbnails=modal.querySelector('.gallery-thumbs');
let gallery=[],imageIndex=0;
let morphAnimation=null,morphElement=null,motionId=0,closing=false;
const motionReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const markdownCache=new Map(),imageCache=new Map();
let preparing=false;
function cachedMarkdown(path){
  if(!markdownCache.has(path)){
    const request=fetch(relativeUrl(path),{cache:'no-cache'}).then(async response=>{
      if(!response.ok)throw new Error(`无法读取 ${path}（${response.status}）`);
      return DOMPurify.sanitize(marked.parse(await response.text()),{USE_PROFILES:{html:true}});
    }).catch(error=>{markdownCache.delete(path);throw error;});
    markdownCache.set(path,request);
  }
  return markdownCache.get(path);
}
function preloadImage(url){
  if(!imageCache.has(url)){
    const image=new Image();image.src=url;
    const request=image.decode().catch(()=>{});
    imageCache.set(url,request);
  }
  return imageCache.get(url);
}
function warmProject(project){
  return Promise.allSettled([
    ...[project.intro,project.body].filter(Boolean).map(cachedMarkdown),
    ...(project.gallery||[]).map(image=>typeof image==='string'?image:image.src).filter(Boolean).map(path=>preloadImage(relativeUrl(path)))
  ]);
}
function clearMorph(){morphAnimation?.cancel();morphAnimation=null;morphElement?.remove();morphElement=null;}
function createMorph(tile,rect){
  const element=document.createElement('div');element.className='project-morph';element.setAttribute('aria-hidden','true');
  const preview=tile.cloneNode(true);preview.classList.remove('is-opening-source','is-muted');preview.classList.add('project-morph-card');
  preview.inert=true;preview.tabIndex=-1;preview.removeAttribute('aria-haspopup');preview.style.width=rect.width+'px';preview.style.height=rect.height+'px';
  element.append(preview);modal.append(element);morphElement=element;
  return {element,preview};
}
function rectangleFrame(rect){return {left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'};}
async function expandFromCard(tile,source){
  const id=++motionId;closing=false;clearMorph();modal.dataset.motion='opening';
  if(motionReduced()){modal.classList.add('is-visible');modal.dataset.motion='open';return;}
  const target=sheet.getBoundingClientRect();
  // Only morph the card surface. Its text fades out without being stretched.
  const {element,preview}=createMorph(tile,source);
  tile.classList.add('is-opening-source');modal.classList.add('is-morphing');
  requestAnimationFrame(()=>{if(id===motionId)modal.classList.add('is-visible');});
  preview.animate([{opacity:1},{opacity:0}],{duration:120,fill:'forwards'});
  morphAnimation=element.animate([
    {...rectangleFrame(source),borderRightWidth:'5px',borderBottomWidth:'6px'},
    {...rectangleFrame(target),borderRightWidth:'0px',borderBottomWidth:'0px'}
  ],{duration:440,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
  try {await morphAnimation.finished;}catch{return;}
  if(id!==motionId)return;
  // Keep the opaque sheet underneath throughout the handoff. Fading the
  // entire sheet would expose the dark backdrop for a frame.
  modal.classList.remove('is-morphing');
  for(const section of sheet.children){
    section.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:300,easing:'ease-out'});
  }
  morphAnimation=element.animate([{opacity:1},{opacity:0}],{duration:220,easing:'ease-out',fill:'forwards'});
  try {await morphAnimation.finished;}catch{return;}
  if(id!==motionId)return;
  clearMorph();modal.dataset.motion='open';
}
async function closeProject(){
  if(!modal.open||closing)return;
  controller?.abort();
  if(motionReduced()||!opener?.isConnected){modal.close();return;}
  closing=true;const id=++motionId;
  const source=morphElement?.getBoundingClientRect()||sheet.getBoundingClientRect();
  const target=opener.getBoundingClientRect();clearMorph();
  const {element,preview}=createMorph(opener,target);
  modal.classList.add('is-morphing');modal.classList.remove('is-visible');modal.dataset.motion='closing';
  preview.animate([{opacity:0},{opacity:0,offset:.55},{opacity:1}],{duration:280,fill:'forwards'});
  morphAnimation=element.animate([
    {...rectangleFrame(source),borderRightWidth:'0px',borderBottomWidth:'0px'},
    {...rectangleFrame(target),borderRightWidth:'5px',borderBottomWidth:'6px'}
  ],{duration:280,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  try {await morphAnimation.finished;}catch{return;}
  if(id===motionId)modal.close();
}

function relativeUrl(path,base=contentRoot){return new URL(path,base).href;}
function safeLink(path,base){
  try {const url=new URL(path,base);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}
}
async function markdown(path,target,signal){
  const url=relativeUrl(path);
  const html=await cachedMarkdown(path);
  if(signal.aborted)return;
  target.innerHTML=html;
  target.querySelectorAll('img').forEach(img=>{
    const src=safeLink(img.getAttribute('src'),url);
    if(src)img.src=src;else img.removeAttribute('src');
    img.loading='lazy';
    img.addEventListener('error',()=>{img.replaceWith(document.createTextNode(`图片暂不可用：${img.alt}`));},{once:true});
  });
  target.querySelectorAll('a[href]').forEach(link=>{
    const href=link.getAttribute('href');
    if(href.startsWith('#'))return;
    const resolved=safeLink(href,url);
    if(resolved){link.href=resolved;link.target='_blank';link.rel='noopener noreferrer';}else link.removeAttribute('href');
  });
}

function applyCategory(id,announce=false){
  selected=id;
  filters.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===selected)));
  grid.querySelectorAll('.work-tile').forEach(tile=>tile.classList.toggle('is-muted',!!selected&&tile.dataset.category!==selected));
  if(announce)status.textContent=selected?`${categories.find(category=>category.id===selected).label}：已高亮 ${projects.filter(project=>project.category===selected).length} 个项目`:'已恢复全部项目';
}
function stopDemo(){clearTimeout(demoTimer);demoTimer=null;demoRunning=false;}
function selectCategory(id){
  const next=!demoRunning&&selected===id?null:id;
  stopDemo();applyCategory(next,true);
}
function startDemo(){
  stopDemo();applyCategory(null);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  demoRunning=true;let index=0;
  function step(){
    if(index===categories.length){applyCategory(null);stopDemo();return;}
    applyCategory(categories[index++].id);demoTimer=setTimeout(step,300);
  }
  demoTimer=setTimeout(step,850);
}
function watchEntrance(){
  let active=false;
  function syncEntrance(){
    const next=screen.getAttribute('aria-hidden')==='false';
    if(next===active)return;
    active=next;
    if(active)startDemo();else{stopDemo();applyCategory(null);}
  }
  new MutationObserver(syncEntrance).observe(screen,{attributes:true,attributeFilter:['aria-hidden']});
  syncEntrance();
}
function renderProjects(){
  categories.forEach((category,index)=>{
    if(index){const separator=document.createElement('span');separator.textContent='·';separator.setAttribute('aria-hidden','true');filters.append(separator);}
    const button=document.createElement('button');button.type='button';button.className='work-filter';button.dataset.category=category.id;
    button.style.setProperty('--work-color',category.color);button.textContent=category.label;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>selectCategory(category.id));filters.append(button);
  });
  projects.forEach(project=>{
    const category=categories.find(item=>item.id===project.category);
    const tile=document.createElement(project.home?'div':'button');tile.className='work-tile';tile.dataset.id=project.id;tile.dataset.category=project.category;tile.style.setProperty('--work-color',category.color);
    if(project.home){tile.classList.add('is-current');}else{tile.type='button';tile.setAttribute('aria-haspopup','dialog');tile.addEventListener('click',()=>showProject(project,tile));}
    const title=document.createElement('h3');title.textContent=project.title;title.style.whiteSpace='pre-line';
    const description=document.createElement('p');description.textContent=project.description;tile.append(title,description);
    if(project.home){const back=document.createElement('a');back.className='portfolio-return';back.href='#home';back.setAttribute('aria-label','返回首页');back.innerHTML=`<span>返回Home Page</span><img src="${asset('98df61b88da5b1d524d653a1d44874b21bd47542.svg')}" width="141.5" height="15.5" alt="">`;tile.append(back);}
    grid.append(tile);
  });
}

function changeImage(index){
  if(!gallery.length){
    mainImage.hidden=true;mainImage.removeAttribute('src');placeholder.hidden=false;placeholder.textContent='';
    modal.querySelector('.gallery-count').textContent='';return;
  }
  imageIndex=(index+gallery.length)%gallery.length;
  const image=gallery[imageIndex];mainImage.hidden=true;mainImage.removeAttribute('src');placeholder.hidden=false;placeholder.textContent=image.src?'图片加载中…':'';
  mainImage.alt=image.alt||`${openProject.title.replaceAll('\n',' ')} · ${imageIndex+1}`;
  if(image.src){mainImage.src=relativeUrl(image.src);mainImage.hidden=false;}
  thumbnails.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===imageIndex)));
  modal.querySelector('.gallery-count').textContent=`${imageIndex+1} / ${gallery.length}`;
}
mainImage.addEventListener('load',()=>{placeholder.hidden=true;});
mainImage.addEventListener('error',()=>{mainImage.hidden=true;placeholder.hidden=false;placeholder.textContent='图片暂不可用';});
modal.querySelector('.previous').addEventListener('click',()=>changeImage(imageIndex-1));
modal.querySelector('.next').addEventListener('click',()=>changeImage(imageIndex+1));
function setGallery(project){
  gallery=(project.gallery||[]).map(image=>typeof image==='string'?{src:image}:image).filter(image=>image?.src?.trim());
  modal.querySelectorAll('.gallery-nav').forEach(button=>button.hidden=gallery.length<2);
  thumbnails.replaceChildren();
  gallery.forEach((image,i)=>{
    const button=document.createElement('button');button.type='button';button.className='gallery-thumb';button.setAttribute('aria-label',`查看第 ${i+1} 张图片`);
    if(image.src){const img=document.createElement('img');img.src=relativeUrl(image.src);img.alt=image.alt||'';img.loading='lazy';img.addEventListener('error',()=>img.remove(),{once:true});button.append(img);}
    button.addEventListener('click',()=>changeImage(i));thumbnails.append(button);
  });
  changeImage(0);
}

async function showProject(project,tile){
  if(modal.open||preparing)return;
  preparing=true;tile.setAttribute('aria-busy','true');
  await warmProject(project);
  if(demoRunning){stopDemo();applyCategory(null);}
  controller?.abort();controller=new AbortController();const {signal}=controller;
  openProject=project;opener=tile;
  sheet.classList.toggle('is-intro-only',!project.body);
  const category=categories.find(item=>item.id===project.category);
  sheet.style.setProperty('--project-color',category.color);
  modal.querySelector('#project-title').textContent=project.modalTitle||project.title.replaceAll('\n',' ');
  modal.querySelector('.project-subtitle').textContent=project.subtitle||'';
  modal.querySelector('.project-category').textContent=project.categoryLabel||category.label;
  intro.textContent='加载中…';body.replaceChildren();bodySection.hidden=!project.body;more.hidden=!project.body;
  external.hidden=!project.external;
  external.removeAttribute('href');external.removeAttribute('aria-disabled');
  if(project.external){
    external.querySelector('span').textContent=project.external.label;
    const url=project.external.url&&safeLink(project.external.url,contentRoot);
    if(url){external.href=url;external.removeAttribute('title');}else{external.setAttribute('aria-disabled','true');external.title='待补充项目实际网址';}
  }
  const load=async(path,target)=>{try{await markdown(path,target,signal);}catch(error){if(error.name!=='AbortError')target.textContent=error.message;}};
  await Promise.all([load(project.intro,intro),project.body?load(project.body,body):Promise.resolve()]);
  // Resolve image sizes and fonts before measuring the expansion destination.
  await Promise.allSettled([...intro.querySelectorAll('img')].map(image=>preloadImage(image.src)));
  await document.fonts.ready;
  setGallery(project);
  preparing=false;tile.removeAttribute('aria-busy');
  if(signal.aborted||screen.getAttribute('aria-hidden')==='true')return;
  const source=tile.getBoundingClientRect();
  modal.showModal();scroller.scrollTop=0;void expandFromCard(tile,source);
}
more.addEventListener('click',()=>bodySection.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));
modal.querySelector('.project-close').addEventListener('click',()=>void closeProject());
scroller.addEventListener('click',event=>{if(event.target===scroller)void closeProject();});
modal.addEventListener('cancel',event=>{event.preventDefault();void closeProject();});
modal.addEventListener('close',()=>{
  ++motionId;closing=false;clearMorph();modal.classList.remove('is-visible','is-morphing');modal.dataset.motion='closed';
  controller?.abort();opener?.classList.remove('is-opening-source');opener?.focus({preventScroll:true});
});
modal.addEventListener('wheel',event=>event.stopPropagation(),{passive:true});
modal.addEventListener('pointerdown',event=>event.stopPropagation());
modal.addEventListener('keydown',event=>{
  event.stopPropagation();
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
    if(event.target.closest('a,input,textarea'))return;
    event.preventDefault();changeImage(imageIndex+(event.key==='ArrowRight'?1:-1));
  }
});
window.addEventListener('popstate',()=>{if(modal.open)modal.close();});

try {
  const response=await fetch(new URL('projects.json',contentRoot),{cache:'no-cache'});
  if(!response.ok)throw new Error('项目目录暂时无法读取');
  const data=await response.json();projects=data.projects;categories=data.categories;renderProjects();watchEntrance();
  // Warm local content immediately; clicking reuses these same promises.
  for(const project of projects)if(!project.home)void warmProject(project);
} catch(error){status.textContent=error.message;const message=document.createElement('p');message.textContent='项目列表暂时无法加载，请刷新重试。';grid.append(message);}
