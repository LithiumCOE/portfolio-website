/** A static slide per viewport, sharing the project's Preview / Next / End interaction. */
export function mountProjectSlides(host,{onPreview,reduced}){
  const source=host.querySelector('.project-slide-source');
  const width=Number(source.dataset.designWidth)||1920,height=Number(source.dataset.designHeight)||1080;
  const lowfi=[...source.querySelectorAll(':scope > .ss-restored-lowfi')];
  if(lowfi.length>1){
    const long=document.createElement('section');long.className='project-long-slide';long.dataset.slideLabel='邮箱低保真';
    lowfi[0].before(long);
    lowfi.forEach((page,index)=>{if(index>0)[...page.querySelector('.ss-lowfi-canvas').children].filter(node=>node.textContent.trim()==='交互设计工作案例').forEach(node=>node.remove());page.dataset.cropTop=index===0?'80':'320';page.dataset.cropBottom='985';const part=document.createElement('div');part.className='project-long-part';part.append(page);long.append(part);});
  }
  const slides=[...source.children];
  const root=document.createElement('div');root.className='project-slides';
  const window=document.createElement('div');window.className='project-slides-window';
  const arrow=new URL('./assets/figma/96f093b16ba9b0fb277df6969cf91c96d2d976dc.svg',import.meta.url).href;
  const forward=document.createElement('button');forward.type='button';forward.className='ga-chapter-forward';forward.innerHTML=`<span>Next</span><img src="${arrow}" width="80" height="26" alt="">`;
  root.append(window,forward);slides.forEach((slide,i)=>{slide.classList.add('project-ppt-slide');slide.hidden=i!==0;slide.setAttribute('role','group');slide.setAttribute('aria-label',slide.dataset.slideLabel||`第 ${i+1} 页`);window.append(slide);});host.replaceChildren(root);
  let current=0,locked=false,disposed=false,ended=false,transition=null,wheel=0,wheelTimer=null,lastWheel=0;
  function fit(){
    if(disposed)return;
    slides.forEach(slide=>{
      if(slide.classList.contains('project-long-slide')){
        Object.assign(slide.style,{width:window.clientWidth+'px',height:window.clientHeight+'px',left:'0px',top:'0px',transform:'none'});
        slide.querySelectorAll('.project-long-part').forEach(part=>{const page=part.firstElementChild,w=Number(page.dataset.designWidth)||1920,h=Number(page.dataset.designHeight)||1080,scale=window.clientWidth/w;const cropTop=Number(page.dataset.cropTop)||0,cropBottom=Number(page.dataset.cropBottom)||h,gap=part===slide.lastElementChild?24:56;part.style.height=(cropBottom-cropTop)*scale+gap+'px';Object.assign(page.style,{position:'absolute',top:-cropTop*scale+'px',width:w+'px',height:h+'px',transform:`scale(${scale})`,transformOrigin:'top left'});});
        return;
      }
      const w=Number(slide.dataset.designWidth)||width,h=Number(slide.dataset.designHeight)||height;const scale=Math.min(1,window.clientWidth/w,window.clientHeight/h);Object.assign(slide.style,{width:w+'px',height:h+'px',left:(window.clientWidth-w*scale)/2+'px',top:(window.clientHeight-h*scale)/2+'px',transform:`scale(${scale})`});});
  }
  function paint(){const active=slides[current];forward.hidden=active.classList.contains('project-long-slide')&&active.scrollTop+active.clientHeight<active.scrollHeight-3;const end=current===slides.length-1;forward.querySelector('span').textContent=end?'End':'Next';forward.classList.toggle('is-end',end);forward.setAttribute('aria-label',end?'End，返回 Preview':'Next');}
  function warm(index){
    [index,index+1].forEach(i=>slides[i]?.querySelectorAll('img').forEach(image=>{image.loading='eager';if(image.decode)void image.decode().catch(()=>{});}));
  }
  async function go(next){
    if(disposed||locked||next===current||next>=slides.length)return;
    if(next<0){onPreview();return;}
    locked=true;forward.disabled=true;wheel=0;const from=slides[current],to=slides[next],direction=Math.sign(next-current);warm(next);
    if(!reduced){transition=from.animate([{opacity:1,translate:'0 0'},{opacity:0,translate:`0 ${-direction*50}px`}],{duration:170,easing:'ease-in',fill:'forwards'});try{await transition.finished;}catch{return;}}
    if(disposed)return;from.hidden=true;transition?.cancel();to.hidden=false;current=next;fit();if(to.classList.contains('project-long-slide'))to.scrollTop=direction>0?0:to.scrollHeight;paint();
    if(!reduced){transition=to.animate([{opacity:0,translate:`0 ${direction*65}px`},{opacity:1,translate:'0 0'}],{duration:500,easing:'cubic-bezier(.22,1,.36,1)'});try{await transition.finished;}catch{return;}}
    transition=null;locked=false;forward.disabled=false;
  }
  forward.addEventListener('click',()=>{if(locked)return;if(current===slides.length-1){ended=true;onPreview();}else void go(current+1);});
  slides.filter(slide=>slide.classList.contains('project-long-slide')).forEach(slide=>slide.addEventListener('scroll',paint,{passive:true}));
  const resize=new ResizeObserver(()=>{fit();paint();});resize.observe(window);fit();paint();warm(0);
  return {fit,activate(){if(ended){slides[current].hidden=true;current=0;slides[0].hidden=false;ended=false;}fit();paint();warm(current);},wheel(event){event.preventDefault();if(locked)return;
    const active=slides[current],scrollDelta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?window.clientHeight:1);
    if(active.classList.contains('project-long-slide')&&(scrollDelta>0||active.scrollTop>1)){active.scrollTop+=scrollDelta;wheel=0;paint();return;}
    const now=performance.now();if(now-lastWheel<180){lastWheel=now;return;}const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?window.clientHeight:1);if(Math.sign(delta)!==Math.sign(wheel))wheel=0;wheel+=delta;clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>wheel=0,180);if(Math.abs(wheel)>55){lastWheel=now;void go(current+(wheel>0?1:-1));}},key(event){if(['ArrowDown','PageDown','ArrowUp','PageUp'].includes(event.key)){event.preventDefault();const direction=['ArrowDown','PageDown'].includes(event.key)?1:-1,active=slides[current];
    if(active.classList.contains('project-long-slide')&&(direction>0||active.scrollTop>1)){active.scrollTop+=direction*(event.key.startsWith('Page')?active.clientHeight*.85:80);paint();return;}
    void go(current+direction);}},destroy(){disposed=true;transition?.cancel();clearTimeout(wheelTimer);resize.disconnect();}};
}
