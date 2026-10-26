import {mountToyotaMotion} from './toyota-motion.js?v=3';
import {mountSaicHistoryMotion} from './saic-history-motion.js?v=7';
import {mountProjectSlides} from './project-slides.js?v=ss-label-5';
import {mountGaChapters} from './ga-chapters.js?v=original-lowfi-10';
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
<section class="project-intro"><div class="project-header-row"><header class="project-heading"><h2 id="project-title"></h2><span class="project-subtitle"></span></header>
<p class="project-category"></p></div><div class="project-markdown intro-markdown" aria-live="polite"></div>
<div class="project-media-row"><div class="project-gallery" aria-label="项目图片浏览器">
<div class="gallery-main"><div class="gallery-video" hidden></div><img class="gallery-image" alt="" hidden><span class="gallery-placeholder"></span>
<button class="gallery-nav previous" type="button" aria-label="上一张图片">‹</button><button class="gallery-nav next" type="button" aria-label="下一张图片">‹</button><span class="gallery-count" aria-live="polite"></span></div>
<div class="gallery-thumbs" role="group" aria-label="图片缩略图"></div></div>
<div class="project-video" hidden></div><figure class="project-award" hidden><figcaption></figcaption><img alt=""></figure>
<a class="project-external" target="_blank" rel="noopener noreferrer"><span class="project-link-icon"><img src="${asset('406434beffae31a3c3c9b2b17472450ec2953807.svg')}" width="32" height="32" alt=""></span><span class="project-link-label"></span></a></div>
<button class="project-more" type="button"><span>MORE</span><img src="${asset(arrow)}" width="80" height="26" alt=""></button></section>
<section class="project-body" hidden><div class="project-markdown body-markdown"></div></section>
</article></div>`;
document.body.append(modal);
const scroller=modal.querySelector('.modal-scroller');
const sheet=modal.querySelector('.project-sheet');
const intro=modal.querySelector('.intro-markdown');
const body=modal.querySelector('.body-markdown');
const bodySection=modal.querySelector('.project-body');
const previewSection=modal.querySelector('.project-intro');
let gaChapters=null,projectBodyMotion=null;
let projectPage='preview',pageSwitch=false,pageTransition=null,finalTimer=null;
let pageWheel=0,pageWheelTimer=null;
const more=modal.querySelector('.project-more');
const external=modal.querySelector('.project-external');
const mainImage=modal.querySelector('.gallery-image');
const placeholder=modal.querySelector('.gallery-placeholder');
const thumbnails=modal.querySelector('.gallery-thumbs');
const galleryElement=modal.querySelector('.project-gallery');
const videoElement=modal.querySelector('.project-video');
const galleryVideo=modal.querySelector('.gallery-video');
const awardElement=modal.querySelector('.project-award');
const linkIcons={
  orange:{file:'eea2e1679e8a8c975f724e6b378c874527bf7447.svg',width:28.5012,height:28.5008},
  'steam-gold':{file:'8846f83f8bbcf1c40700485278c9bd01638facca.svg',width:32,height:32},
  steam:{file:'7c97b2bd333a0fbbf085c15faff396b953c1606f.svg',width:32,height:32},
  green:{file:'a55d878c013b34fdd2e6736d6c05b8cdc09f0f89.svg',width:28.5012,height:28.5008},
  red:{file:'1b365f4f67cf10434ff675bc39f092cff2792c7f.svg',width:28.5012,height:28.5008}
};
function videoFrame(video){
  if(video.local){
    const url=new URL(video.url,contentRoot);
    if(url.origin!==contentRoot.origin||!url.pathname.startsWith(contentRoot.pathname)||!url.pathname.endsWith('.mp4'))return null;
    const player=document.createElement('video');
    player.controls=true;player.preload='none';player.playsInline=true;
    player.setAttribute('aria-label',video.title||'项目演示视频');
    if(video.poster)player.poster=new URL(video.poster,import.meta.url).href;
    player.src=url.href;
    return player;
  }
  const url=new URL(video.url);
  if(url.protocol!=='https:'||url.hostname!=='go.plvideo.cn')return null;
  const iframe=document.createElement('iframe');iframe.title=video.title||'项目演示视频';
  iframe.src=url.href;iframe.allowFullscreen=true;iframe.allow='fullscreen; picture-in-picture; encrypted-media';
  iframe.referrerPolicy='strict-origin-when-cross-origin';return iframe;
}
function clearVideo(container){
  container.querySelectorAll('video').forEach(player=>{player.pause();player.removeAttribute('src');player.load();});
  container.replaceChildren();
}
function setMedia(project){
  clearVideo(videoElement);clearVideo(galleryVideo);videoElement.hidden=!project.video;
  galleryElement.hidden=!!project.video;
  awardElement.hidden=!project.award;
  const awardImage=awardElement.querySelector('img');awardImage.removeAttribute('src');
  if(project.award){awardElement.querySelector('figcaption').textContent=project.award.label;awardImage.src=relativeUrl(project.award.src);awardImage.alt=project.award.label;awardImage.width=project.award.width;awardImage.height=project.award.height;}
  if(project.video){
    gallery=[];const iframe=videoFrame(project.video);
    if(iframe)videoElement.append(iframe);else videoElement.textContent='视频地址暂不可用';
  }else setGallery(project);
}
let gallery=[],imageIndex=0;
let morphAnimation=null,morphElement=null,motionId=0,closing=false,bookAnimations=[];
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
    ...(project.award?[preloadImage(relativeUrl(project.award.src))]:[]),
    ...(project.gallery||[]).map(image=>typeof image==='string'?image:image.src).filter(Boolean).map(path=>preloadImage(relativeUrl(path)))
  ]);
}
function clearMorph(){bookAnimations.forEach(animation=>animation.cancel());bookAnimations=[];morphAnimation?.cancel();morphAnimation=null;morphElement?.remove();morphElement=null;}
function createMorph(tile,rect){
  const element=document.createElement('div');element.className='project-morph';element.setAttribute('aria-hidden','true');
  const preview=tile.cloneNode(true);preview.classList.remove('is-opening-source','is-muted');preview.classList.add('project-morph-card');
  preview.inert=true;preview.tabIndex=-1;preview.removeAttribute('aria-haspopup');preview.style.width=rect.width+'px';preview.style.height=rect.height+'px';
  element.append(preview);modal.append(element);morphElement=element;
  return {element,preview};
}
function rectangleFrame(rect){return {left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'};}
async function expandFromCard(tile,source){
  const id=++motionId;closing=false;pageTransition?.cancel();pageTransition=null;pageSwitch=false;clearTimeout(finalTimer);finalTimer=null;clearTimeout(pageWheelTimer);pageWheel=0;clearMorph();modal.dataset.motion='opening';
  if(motionReduced()){modal.classList.add('is-visible');modal.dataset.motion='open';return;}
  const target=sheet.getBoundingClientRect();
  // The card is the closed book: size, position and cover hinge share one clock.
  const {element,preview}=createMorph(tile,source);
  element.classList.add('project-book');
  Object.assign(element.style,rectangleFrame(target));
  preview.style.width=target.width+'px';preview.style.height=target.height+'px';
  const coverScene=preview.querySelector('.work-cover-scene');
  if(coverScene)coverScene.style.transform=`scale(${target.width/1100},${target.height/1400})`;
  const cover=document.createElement('div');cover.className='project-book-cover';
  const face=document.createElement('div');face.className='project-book-face';
  face.append(preview);cover.append(face);element.append(cover);
  tile.classList.add('is-opening-source');
  modal.classList.remove('is-morphing');
  requestAnimationFrame(()=>{if(id===motionId)modal.classList.add('is-visible');});
  const timing={duration:900,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'};
  // The real inner page expands underneath its cover from exactly the same card bounds.
  const page=sheet.animate([
    {transformOrigin:'top left',transform:`translate(${source.left-target.left}px,${source.top-target.top}px) scale(${source.width/target.width},${source.height/target.height})`},
    {transformOrigin:'top left',transform:'translate(0,0) scale(1,1)'}
  ],timing);
  const travel=element.animate([
    {transform:`translate(${source.left-target.left}px,${source.top-target.top}px) scale(${source.width/target.width},${source.height/target.height})`},
    {transform:'translate(0,0) scale(1,1)'}
  ],timing);
  const turn=cover.animate([
    {transform:'rotateY(0deg)',opacity:1},
    {transform:'rotateY(-24deg)',opacity:1,offset:.28},
    {transform:'rotateY(-65deg)',opacity:.85,offset:.6},
    {transform:'rotateY(-96deg)',opacity:.25,offset:.85},
    {transform:'rotateY(-115deg)',opacity:0}
  ],timing);
  const fade=preview.animate([{opacity:1},{opacity:1,offset:.2},{opacity:.78,offset:.55},{opacity:0}],{duration:680,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  bookAnimations=[page,travel,turn,fade];morphAnimation=travel;
  try{await Promise.all([page.finished,travel.finished,turn.finished]);}catch{return;}
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

const photoDialog=document.createElement('dialog');photoDialog.className='project-photo-dialog';photoDialog.setAttribute('aria-label','放大图片');
photoDialog.innerHTML='<button class="project-close" type="button" aria-label="关闭放大图片"><span aria-hidden="true">×</span></button><img alt="">';document.body.append(photoDialog);
photoDialog.querySelector('button').addEventListener('click',()=>photoDialog.close());
photoDialog.addEventListener('click',event=>{if(event.target===photoDialog)photoDialog.close();});
photoDialog.addEventListener('wheel',event=>{event.stopPropagation();event.preventDefault();},{passive:false});
photoDialog.addEventListener('keydown',event=>event.stopPropagation());
photoDialog.addEventListener('close',()=>photoDialog.querySelector('img').removeAttribute('src'));
function prepareImageZoom(){
  body.querySelectorAll('img').forEach(image=>{
    if(image.closest('.ga-stack-gallery'))return;
    if(!/\.(png|jpe?g|webp)(?:[?#]|$)/i.test(image.src))return;
    const target=image.parentElement;target.style.pointerEvents='auto';target.dataset.zoomSrc=image.src;target.setAttribute('role','button');target.tabIndex=0;target.setAttribute('aria-label','点击放大图片');
  });
}
function openPhoto(target){if(!target)return;photoDialog.querySelector('img').src=target.dataset.zoomSrc;photoDialog.showModal();}
body.addEventListener('click',event=>openPhoto(event.target.closest('[data-zoom-src]')));
body.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)&&event.target.matches('[data-zoom-src]')){event.preventDefault();openPhoto(event.target);}});
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
const coverResize=new ResizeObserver(entries=>{for(const entry of entries)entry.target.style.setProperty('--cover-scale',(entry.borderBoxSize?.[0]?.inlineSize||entry.contentRect.width)/1100);});
function addProjectCover(tile,cover){
  tile.classList.add('has-cover');tile.dataset.coverNode=cover.node;
  const layer=document.createElement('div');layer.className='work-cover';layer.setAttribute('aria-hidden','true');
  const scene=document.createElement('div');scene.className='work-cover-scene';
  const crop=document.createElement('div');crop.className='work-cover-crop';
  const place=(element,bounds)=>{['left','top','width','height'].forEach((key,index)=>element.style[key]=bounds[index]+'px');};
  place(crop,cover.bounds);
  const image=document.createElement('img');image.className='work-cover-image';image.src=new URL(cover.src,import.meta.url).href;image.alt='';image.decoding='async';image.style.objectFit=cover.fit||'cover';
  if(cover.imageBounds){['left','top','width','height'].forEach((key,index)=>image.style[key]=cover.imageBounds[index]+'%');}
  crop.append(image);
  if(cover.tint){const tint=document.createElement('div');tint.className='work-cover-tint';tint.style.opacity=cover.tint;crop.append(tint);}
  scene.append(crop);
  if(cover.logo){const logo=document.createElement('img');logo.className='work-cover-logo';logo.src=new URL(cover.logo.src,import.meta.url).href;logo.alt='';logo.width=cover.logo.bounds[2];logo.height=cover.logo.bounds[3];place(logo,cover.logo.bounds);scene.append(logo);}
  layer.append(scene);tile.prepend(layer);coverResize.observe(tile);
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
    if(project.cover)addProjectCover(tile,project.cover);
    if(project.home){const back=document.createElement('a');back.className='portfolio-return';back.href='#home';back.setAttribute('aria-label','返回首页');back.innerHTML=`<span>返回Home Page</span><img src="${asset('98df61b88da5b1d524d653a1d44874b21bd47542.svg')}" width="141.5" height="15.5" alt="">`;tile.append(back);}
    grid.append(tile);
  });
}

function changeImage(index){
  clearVideo(galleryVideo);galleryVideo.hidden=true;galleryElement.querySelector('.gallery-main').classList.remove('has-video');
  if(!gallery.length){
    mainImage.hidden=true;mainImage.removeAttribute('src');placeholder.hidden=false;placeholder.textContent='';
    modal.querySelector('.gallery-count').textContent='';return;
  }
  imageIndex=(index+gallery.length)%gallery.length;
  const image=gallery[imageIndex];mainImage.hidden=true;mainImage.removeAttribute('src');placeholder.hidden=false;placeholder.textContent=image.src?'图片加载中…':'';
  if(image.type==='video'){
    placeholder.hidden=true;galleryVideo.hidden=false;galleryElement.querySelector('.gallery-main').classList.add('has-video');
    const iframe=videoFrame(image);if(iframe)galleryVideo.append(iframe);
  }
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
  gallery=(project.gallery||[]).map(image=>typeof image==='string'?{src:image}:image).filter(image=>image?.src?.trim()||image?.type==='video'&&image?.url);
  galleryElement.classList.toggle('is-single',gallery.length===1);
  modal.querySelectorAll('.gallery-nav').forEach(button=>button.hidden=gallery.length<2);
  thumbnails.replaceChildren();
  gallery.forEach((image,i)=>{
    const button=document.createElement('button');button.type='button';button.className='gallery-thumb';button.setAttribute('aria-label',image.type==='video'?`查看第 ${i+1} 项视频`:`查看第 ${i+1} 张图片`);
    if(image.src){const img=document.createElement('img');img.src=relativeUrl(image.src);img.alt=image.alt||'';img.loading='lazy';img.addEventListener('error',()=>img.remove(),{once:true});button.append(img);}
    if(image.type==='video'){const label=document.createElement('span');label.className='gallery-video-thumb';label.textContent='▶ 视频';button.append(label);}
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
  sheet.classList.toggle('has-more',!!project.body);
  sheet.classList.toggle('is-ga',project.id==='ga');
  sheet.classList.toggle('is-slide-deck',['ss','mel','saic','toyota'].includes(project.id));
  const category=categories.find(item=>item.id===project.category);
  sheet.style.setProperty('--project-color',category.color);
  modal.querySelector('#project-title').textContent=project.modalTitle||project.title.replaceAll('\n',' ');
  modal.querySelector('.project-subtitle').textContent=project.subtitle||'';
  modal.querySelector('.project-category').textContent=project.categoryLabel||category.label;
  projectBodyMotion?.destroy();projectBodyMotion=null;gaChapters?.destroy();gaChapters=null;intro.textContent='加载中…';body.replaceChildren();bodySection.hidden=true;previewSection.hidden=false;projectPage='preview';pageSwitch=false;more.hidden=!project.body;
  sheet.classList.remove('showing-body','ga-final-focus');
  external.hidden=!project.external;
  external.removeAttribute('href');external.removeAttribute('aria-disabled');
  if(project.external){
    external.querySelector('.project-link-label').textContent=project.external.label;
    const icon=linkIcons[project.external.icon]||linkIcons.steam;
    const iconImage=external.querySelector('img');iconImage.src=asset(icon.file);iconImage.width=icon.width;iconImage.height=icon.height;
    external.classList.toggle('has-link-icon',!project.external.icon?.startsWith('steam'));
    const url=project.external.url&&safeLink(project.external.url,project.external.local?new URL('./',import.meta.url):contentRoot);
    if(url){external.href=url;external.removeAttribute('title');}else{external.setAttribute('aria-disabled','true');external.title='待补充项目实际网址';}
  }
  const load=async(path,target)=>{try{await markdown(path,target,signal);}catch(error){if(error.name!=='AbortError')target.textContent=error.message;}};
  await Promise.all([load(project.intro,intro),project.body?load(project.body,body):Promise.resolve()]);
  // Resolve image sizes and fonts before measuring the expansion destination.
  await Promise.allSettled([...intro.querySelectorAll('img')].map(image=>preloadImage(image.src)));
  await document.fonts.ready;
  setMedia(project);
  preparing=false;tile.removeAttribute('aria-busy');
  if(signal.aborted||screen.getAttribute('aria-hidden')==='true')return;
  const source=tile.getBoundingClientRect();
  modal.showModal();scroller.scrollTop=0;layoutProject();void expandFromCard(tile,source);
}
// Fit the title group to its available row; retain the design's proportions for subtitles.
let storyObserver=null;
function fitProjectHeading(){
  const row=modal.querySelector('.project-header-row');
  const heading=modal.querySelector('.project-heading');
  const title=heading.querySelector('h2'),subtitle=heading.querySelector('.project-subtitle');
  const category=modal.querySelector('.project-category');
  if(!modal.open)return;
  title.style.fontSize='90px';subtitle.style.fontSize='70px';
  const available=Math.max(1,row.clientWidth-category.getBoundingClientRect().width-24);
  const intrinsic=title.scrollWidth+(subtitle.textContent?subtitle.scrollWidth+25:0);
  const factor=Math.min(1,available/intrinsic);
  title.style.fontSize=(90*factor)+'px';subtitle.style.fontSize=(70*factor)+'px';
}
// Native SVG curves connect actual text blocks; coordinates are local to the scaled diagram.
function buildStoryConnectors(story){
  const layout=story.querySelector('.ga-layout');
  layout.querySelectorAll('.ga-connector').forEach(element=>element.remove());
  const links=[
    ['248:4010','250:4189','#58a100'],['248:4014','250:4185','#b48400'],
    ['251:4344','252:4347','#ce6000'],['251:4344','253:4855','#0089a8'],
    ['250:4189','250:4219','#58a100'],['250:4185','250:4227','#b48400'],
    ['252:4347','253:4834','#ce6000'],['253:4855','253:4848','#0089a8']
  ];
  const ns='http://www.w3.org/2000/svg';
  links.forEach(([from,to,color])=>{
    const source=layout.querySelector(`[data-node-id="${from}"]`);
    const target=layout.querySelector(`[data-node-id="${to}"]`);
    const x1=source.offsetLeft+source.offsetWidth/2,y1=source.offsetTop+source.offsetHeight+12;
    const x2=target.offsetLeft+target.offsetWidth/2,y2=target.offsetTop-10;
    const left=Math.min(x1,x2)-30,top=y1-8,width=Math.abs(x2-x1)+60,height=y2-y1+24;
    const wrapper=document.createElement('div');wrapper.className='ga-connector ga-live-connector';wrapper.setAttribute('aria-hidden','true');
    Object.assign(wrapper.style,{position:'absolute',left:left+'px',top:top+'px',width:width+'px',height:height+'px',color});
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`${left} ${top} ${width} ${height}`);svg.setAttribute('width','100%');svg.setAttribute('height','100%');
    const curve=document.createElementNS(ns,'path');curve.classList.add('ga-connection-stroke');
    const bend=Math.max(45,(y2-y1)*.5);
    curve.setAttribute('d',`M ${x1} ${y1} C ${x1} ${y1+bend}, ${x2} ${y2-bend}, ${x2} ${y2}`);
    curve.setAttribute('pathLength','1');curve.setAttribute('fill','none');curve.setAttribute('stroke',color);curve.setAttribute('stroke-width','3');curve.setAttribute('stroke-linecap','round');
    const tip=document.createElementNS(ns,'path');tip.classList.add('ga-connection-tip');tip.setAttribute('d',`M ${x2-7} ${y2-8} L ${x2} ${y2} L ${x2+7} ${y2-8}`);tip.setAttribute('fill','none');tip.setAttribute('stroke',color);tip.setAttribute('stroke-width','3');tip.setAttribute('stroke-linecap','round');tip.setAttribute('stroke-linejoin','round');
    svg.append(curve,tip);wrapper.append(svg);layout.append(wrapper);
  });
}
let connectorFrame=0;
function updateStoryConnectors(){
  connectorFrame=0;
  const bottom=scroller.getBoundingClientRect().bottom-100;
  body.querySelectorAll('.ga-live-connector').forEach(element=>{
    const rect=element.getBoundingClientRect();
    const progress=motionReduced()?1:Math.max(0,Math.min(1,(bottom-rect.top)/Math.max(1,rect.height)));
    element.style.setProperty('--line-progress',progress);
    element.classList.toggle('is-connected',progress>.98);
  });
}
scroller.addEventListener('scroll',()=>{
  if(!connectorFrame)connectorFrame=requestAnimationFrame(updateStoryConnectors);
},{passive:true});
function layoutProject(){
  if(!previewSection.hidden)fitProjectHeading();
  if(['ss','mel','saic','toyota'].includes(openProject?.id)&&!bodySection.hidden){
    if(!gaChapters){gaChapters=mountProjectSlides(body,{onPreview:()=>void switchProjectPage('preview'),reduced:motionReduced()});if(openProject.id==='saic')projectBodyMotion=mountSaicHistoryMotion(body,{reduced:motionReduced()});else if(openProject.id==='toyota')projectBodyMotion=mountToyotaMotion(body,{reduced:motionReduced()});}
    gaChapters.fit();return;
  }
  if(openProject?.id==='ga'&&!bodySection.hidden){
    if(!gaChapters){gaChapters=mountGaChapters(body,{onPreview:()=>void switchProjectPage('preview'),reduced:motionReduced()});prepareImageZoom();}
    gaChapters.fit();return;
  }
  const story=body.querySelector('.ga-story');
  if(story&&!bodySection.hidden){
    const scale=body.clientWidth/Number(story.dataset.designWidth);
    story.style.height=(Number(story.dataset.designHeight)*scale)+'px';
    story.querySelector('.ga-stage').style.transform=`scale(${scale})`;
    scheduleFinalEmphasis(story);
    if(!story.dataset.motionPrepared){
      story.dataset.motionPrepared='true';
      buildStoryConnectors(story);
      // Preserve the static background arrows and divider; reveal actual story content.
      const backgrounds=new Set(['228:3914','250:4200','250:4201','250:4212']);
      const blocks=[...story.querySelector('.ga-layout').children]
        .filter(element=>!backgrounds.has(element.dataset.nodeId));
      const rows=new Map();
      blocks.sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top)).forEach(element=>{
        const row=Math.round(parseFloat(element.style.top)/80);
        const index=rows.get(row)||0;rows.set(row,index+1);
        element.style.setProperty('--reveal-delay',Math.min(index*90,270)+'ms');
        if(!element.classList.contains('ga-connector'))element.classList.add('ga-reveal');
        if(parseFloat(element.style.fontSize)===96)element.classList.add('ga-section-title');
        if(['254:183','254:182','254:208','254:222','254:224','254:232'].includes(element.dataset.nodeId))element.classList.add('ga-media-reveal');
      });
      if(!motionReduced())story.classList.add('motion-ready');
      storyObserver?.disconnect();
      storyObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){entry.target.classList.add('is-revealed');storyObserver.unobserve(entry.target);scheduleFinalEmphasis(story);}
        });
      },{root:scroller,rootMargin:'0px 0px -80px 0px',threshold:.08});
      blocks.forEach(element=>storyObserver.observe(element));
      updateStoryConnectors();
    }
  }
}
new ResizeObserver(()=>{if(modal.open)layoutProject();}).observe(sheet);
function scheduleFinalEmphasis(story){
  if(finalTimer||sheet.classList.contains('ga-final-focus'))return;
  const attempts=['254:222','254:224','254:232'].map(id=>story.querySelector(`[data-node-id="${id}"]`));
  if(attempts.every(element=>element?.classList.contains('is-revealed'))){
    finalTimer=setTimeout(()=>{finalTimer=null;if(modal.open&&projectPage==='body')sheet.classList.add('ga-final-focus');},1400);
  }
}
async function switchProjectPage(next){
  if(!openProject?.body||pageSwitch||projectPage===next||closing)return;
  pageSwitch=true;pageWheel=0;
  const from=projectPage==='preview'?previewSection:bodySection;
  const to=next==='body'?bodySection:previewSection;
  const direction=next==='body'?1:-1;
  if(!motionReduced()){
    pageTransition=from.animate([{opacity:1,translate:'0 0'},{opacity:0,translate:`0 ${-direction*60}px`}],{duration:180,easing:'ease-in',fill:'forwards'});
    try{await pageTransition.finished;}catch{return;}
  }
  if(!modal.open||closing)return;
  from.hidden=true;pageTransition?.cancel();pageTransition=null;
  to.hidden=false;projectPage=next;sheet.classList.toggle('showing-body',next==='body');
  scroller.scrollTo({top:0,behavior:'instant'});const hadChapters=!!gaChapters;layoutProject();if(hadChapters&&next==='body'){gaChapters.activate();projectBodyMotion?.play();}updateStoryConnectors();
  if(!motionReduced()){
    pageTransition=to.animate([{opacity:0,translate:`0 ${direction*80}px`},{opacity:1,translate:'0 0'}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)'});
    try{await pageTransition.finished;}catch{return;}
  }
  pageTransition=null;pageSwitch=false;
}
more.addEventListener('click',()=>void switchProjectPage('body'));

modal.querySelector('.project-close').addEventListener('click',()=>void closeProject());
scroller.addEventListener('click',event=>{if(event.target===scroller)void closeProject();});
modal.addEventListener('cancel',event=>{event.preventDefault();void closeProject();});
modal.addEventListener('close',()=>{
  ++motionId;closing=false;pageTransition?.cancel();pageTransition=null;pageSwitch=false;clearTimeout(finalTimer);finalTimer=null;clearTimeout(pageWheelTimer);pageWheel=0;clearMorph();modal.classList.remove('is-visible','is-morphing');modal.dataset.motion='closed';
  controller?.abort();opener?.classList.remove('is-opening-source');opener?.focus({preventScroll:true});
  projectBodyMotion?.destroy();projectBodyMotion=null;gaChapters?.destroy();gaChapters=null;if(photoDialog.open)photoDialog.close();clearVideo(videoElement);clearVideo(galleryVideo);storyObserver?.disconnect();storyObserver=null;cancelAnimationFrame(connectorFrame);connectorFrame=0;
});
modal.addEventListener('wheel',event=>{
  event.stopPropagation();
  if(!openProject?.body||event.ctrlKey)return;
  if(pageSwitch){event.preventDefault();return;}
  if(projectPage==='body'&&gaChapters){gaChapters.wheel(event);return;}
  const down=event.deltaY>0;
  const atEdge=projectPage==='preview'&&down&&scroller.scrollTop+scroller.clientHeight>=scroller.scrollHeight-3
    ||projectPage==='body'&&!down&&scroller.scrollTop<=2;
  if(!atEdge){pageWheel=0;return;}
  event.preventDefault();
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?scroller.clientHeight:1);
  if(Math.sign(pageWheel)!==Math.sign(delta))pageWheel=0;
  pageWheel+=delta;clearTimeout(pageWheelTimer);pageWheelTimer=setTimeout(()=>pageWheel=0,180);
  if(Math.abs(pageWheel)>55)void switchProjectPage(projectPage==='preview'?'body':'preview');
},{passive:false});
modal.addEventListener('pointerdown',event=>event.stopPropagation());
modal.addEventListener('keydown',event=>{
  event.stopPropagation();
  if(projectPage==='body'&&gaChapters)gaChapters.key(event);
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
