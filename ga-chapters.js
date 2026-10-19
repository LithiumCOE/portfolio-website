/** GA chapter presentation. Source text and local artwork come from body.md. */
export function mountGaChapters(host,{onPreview,reduced}){
  const source=host.querySelector('.ga-layout');
  const find=id=>source.querySelector(`[data-node-id="${id}"]`);
  const take=id=>{const element=find(id);if(!element)return document.createElement('div');const clone=element.cloneNode(true);['position','left','top','transform','width'].forEach(prop=>clone.style.removeProperty(prop));return clone;};
  const shell=document.createElement('div');shell.className='ga-chapters';
  const titles=['开场','核心需求与需求拆解','解决方案','低保真','高保真'];
  const arrowUrl=new URL('./assets/figma/96f093b16ba9b0fb277df6969cf91c96d2d976dc.svg',import.meta.url).href;
  shell.innerHTML=`<div class="ga-chapter-window"></div><button type="button" class="ga-chapter-forward"><span>Next</span><img src="${arrowUrl}" width="80" height="26" alt=""></button>`;
  const window=shell.querySelector('.ga-chapter-window'),forward=shell.querySelector('.ga-chapter-forward');
  const pages=titles.map((title,i)=>{const section=document.createElement('section');section.className='ga-chapter';section.hidden=i!==0;section.setAttribute('aria-label',title);section.innerHTML=(i?`<h2>${i===1?'核心需求':title}</h2>`:'')+'<div class="ga-chapter-fit"><div class="ga-chapter-content"></div></div>';window.append(section);return section;});
  const contents=pages.map(p=>p.querySelector('.ga-chapter-content'));
  // Opening copy: preserve all three paragraphs and inline emphasis.
  const opening=[...source.children].find(e=>parseFloat(e.style.top)===1016);
  contents[0].classList.add('ga-opening');contents[0].append(opening.cloneNode(true));contents[0].firstElementChild.removeAttribute('style');
  const core=document.createElement('div');core.className='ga-core-grid';
  ['248:4010','248:4014','251:4344'].forEach(id=>{const card=take(id);card.classList.add('ga-chapter-card');core.append(card);});
  const demands=document.createElement('div');demands.className='ga-demand-cards';
  ['250:4189','250:4185','252:4347','253:4855'].forEach(id=>{const card=take(id);card.classList.add('ga-chapter-card');demands.append(card);});
  contents[1].classList.add('ga-requirements-build');
  contents[1].innerHTML='<div class="ga-requirements-down" aria-hidden="true"></div><p class="ga-build-hint">向下滚动展开需求拆解</p><h3 class="ga-demand-title">需求拆解</h3>';
  contents[1].prepend(core);contents[1].append(demands);
  const coreTitle=pages[1].querySelector('h2');coreTitle.classList.add('ga-core-title');contents[1].prepend(coreTitle);
  // Current Figma solution frame 258:716, including its original axis SVG.
  contents[2].classList.add('ga-solution-canvas','ga-new-solution');
  const originalLayout=host.querySelector('.ga-solution-design .ga-layout').cloneNode(true);
  contents[2].append(originalLayout);
  const axis=originalLayout.querySelector('[data-node-id="258:750"]');
  const axisImage=axis.querySelector('img');axis.replaceChildren();
  ['y','x'].forEach(direction=>{const clip=document.createElement('div');clip.className='ga-design-axis-clip ga-design-axis-'+direction;const reveal=document.createElement('div');reveal.className='ga-design-axis-reveal';reveal.append(axisImage.cloneNode(true));clip.append(reveal);axis.append(clip);});
  // A continuous, locally scrollable low-fidelity article: no tabs or whole-page shrinking.
  contents[3].classList.add('ga-lowfi','ga-lowfi-long');pages[3].classList.add('ga-lowfi-page');
  ['254:183','254:182','254:208'].forEach(id=>{const panel=take(id);panel.classList.add('ga-lowfi-panel');panel.style.cssText='position:relative;width:1250px;height:399px';if(id==='254:182'){
      const diagram=panel.querySelector('[data-node-id="253:4948"]');
      if(diagram){const image=document.createElement('img');image.src=new URL('./content/projects/ga/images/inventory-lowfi-original.png',import.meta.url).href;image.alt='仓库低保真原稿，保留全部编号标注';image.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:contain;margin:0;background:none;aspect-ratio:auto';diagram.replaceChildren(image);}
    }
    contents[3].append(panel);});
  const lowfiBox=pages[3].querySelector('.ga-chapter-fit');
  const lowfiTrack=document.createElement('div');lowfiTrack.className='ga-lowfi-track';lowfiBox.append(lowfiTrack);lowfiTrack.append(contents[3]);
  contents[4].classList.add('ga-highfi','ga-highfi-stacked');
  const highTitle=pages[4].querySelector('h2');contents[4].append(highTitle);
  const attemptImages=['254:222','254:224','254:232'].map(id=>[...find(id).querySelectorAll('img')].map(image=>image.src));
  const labels=['尝试1（废稿）','尝试2（废稿）','尝试3（选定）'];
  const highTabs=document.createElement('div');highTabs.className='ga-highfi-tabs';highTabs.setAttribute('role','tablist');highTabs.setAttribute('aria-label','高保真尝试');
  contents[4].append(highTabs);
  const gallery=document.createElement('div');gallery.className='ga-stack-gallery';
  gallery.innerHTML='<button class="ga-stack-side ga-stack-previous" type="button"><img class="ga-stack-side-back" alt=""><img class="ga-stack-side-front" alt=""></button><button class="ga-stack-main" type="button" aria-label="点击切换前后图片"><img class="ga-stack-back" alt=""><img class="ga-stack-front" alt=""></button><button class="ga-stack-side ga-stack-following" type="button"><img class="ga-stack-side-back" alt=""><img class="ga-stack-side-front" alt=""></button><div class="ga-stack-caption"><span>点击图片区域切换前后图片</span></div>';
  contents[4].append(gallery);
  let selectedAttempt=0,flipping=false;const imageIndices=[0,0,0];
  const main=gallery.querySelector('.ga-stack-main');let front=gallery.querySelector('.ga-stack-front'),back=gallery.querySelector('.ga-stack-back');
  let flipAnimations=[];
  function renderAttempt(){
    [...highTabs.children].forEach((button,i)=>button.setAttribute('aria-selected',String(i===selectedAttempt)));
    const index=imageIndices[selectedAttempt];front.src=attemptImages[selectedAttempt][index];back.src=attemptImages[selectedAttempt][1-index];
    [['.ga-stack-previous',-1],['.ga-stack-following',1]].forEach(([selector,direction])=>{const i=(selectedAttempt+direction+3)%3,button=gallery.querySelector(selector);button.querySelector('.ga-stack-side-front').src=attemptImages[i][imageIndices[i]];button.querySelector('.ga-stack-side-back').src=attemptImages[i][1-imageIndices[i]];button.setAttribute('aria-label',labels[i]);});
  }
  function selectAttempt(index){
    if(flipping)return;selectedAttempt=index;renderAttempt();
    if(!reduced)main.animate([{opacity:.4,translate:'0 12px'},{opacity:1,translate:'0 0'}],{duration:350,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  labels.forEach((label,i)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('role','tab');button.addEventListener('click',()=>selectAttempt(i));highTabs.append(button);});
  gallery.querySelector('.ga-stack-previous').addEventListener('click',()=>selectAttempt((selectedAttempt+2)%3));
  gallery.querySelector('.ga-stack-following').addEventListener('click',()=>selectAttempt((selectedAttempt+1)%3));
  main.addEventListener('click',async()=>{
    if(flipping)return;flipping=true;main.disabled=true;
    // Animate the two decoded layers in place; never change image sources mid-transition.
    const outgoing=front,incoming=back;
    if(!reduced){
      flipAnimations=[
        outgoing.animate([
          {transform:'translate(0,0)',opacity:1,zIndex:2},
          {transform:'translate(32px,-12px) rotate(1.2deg)',opacity:.9,zIndex:2,offset:.45},
          {transform:'translate(30px,-13px) rotate(1deg)',opacity:.85,zIndex:0,offset:.5},
          {transform:'translate(-14px,-14px)',opacity:.72,zIndex:0}
        ],{duration:480,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}),
        incoming.animate([
          {transform:'translate(-14px,-14px)',opacity:.72,zIndex:0},
          {transform:'translate(-3px,-3px)',opacity:1,zIndex:0,offset:.45},
          {transform:'translate(-2px,-2px)',opacity:1,zIndex:2,offset:.5},
          {transform:'translate(0,0)',opacity:1,zIndex:2}
        ],{duration:480,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'})
      ];
      try{await Promise.all(flipAnimations.map(animation=>animation.finished));}catch{}
    }
    if(disposed)return;
    outgoing.className='ga-stack-back';incoming.className='ga-stack-front';front=incoming;back=outgoing;
    imageIndices[selectedAttempt]=1-imageIndices[selectedAttempt];
    flipAnimations.forEach(animation=>animation.cancel());flipAnimations=[];
    flipping=false;main.disabled=false;
  });
  renderAttempt();
  // Decode the six small gallery images in advance for immediate tab and layer switches.
  const decodedImages=attemptImages.flat().map(src=>{const image=new Image();image.src=src;void image.decode().catch(()=>{});return image;});
  host.replaceChildren(shell);
  let lowfiLastScroll=0;
  let current=0,built=false,ended=false,locked=false,disposed=false,animation=null,timer=null,wheel=0,wheelTimer=null,lastWheel=0;
  function fit(){
    if(disposed||!shell.isConnected)return;
    const page=pages[current],box=page.querySelector('.ga-chapter-fit'),content=contents[current];
    content.style.transform='none';
    if(current===3){
      const scale=Math.min(1,box.clientWidth/1250);
      content.style.transform=`scale(${scale})`;content.style.left='0';content.style.top='0';
      lowfiTrack.style.width=(1250*scale)+'px';lowfiTrack.style.height=(content.scrollHeight*scale)+'px';
      return;
    }
    const width=current===2||current===4?1330:1250,height=current===1?650:current===2?1209:current===4?700:content.offsetHeight;
    const scale=Math.min(1,box.clientWidth/width,box.clientHeight/Math.max(1,height));
    content.style.transform=`scale(${scale})`;content.style.setProperty('--chapter-scale',scale);
    content.style.left=((box.clientWidth-width*scale)/2)+'px';content.style.top=((current===0||current===1||current===4)?Math.max(0,(box.clientHeight-height*scale)/2):Math.min(24,Math.max(0,(box.clientHeight-height*scale)/2)))+'px';
    if(current===1&&built)drawDemandConnections(false);
    if(current===2)drawSolutionConnections(false);
  }
  function drawSolutionConnections(animate=true){
    const content=contents[2];content.querySelector('.ga-solution-connections')?.remove();
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
    svg.classList.add('ga-solution-connections');svg.setAttribute('viewBox','0 0 1330 1209');svg.setAttribute('aria-hidden','true');
    const targets=[['258:732','#58a100'],['258:729','#b48400'],['258:718','#ce6000'],['258:725','#0089a8']];
    targets.forEach(([id,color],i)=>{
      const heading=originalLayout.querySelector(`[data-node-id="${id}"]`);
      let x=0,y=0,node=heading;
      while(node&&node!==content){x+=node.offsetLeft;y+=node.offsetTop;node=node.offsetParent;}
      const x1=1330*(i+.5)/4,x2=x+heading.offsetWidth/2,y2=y-12;
      const path=document.createElementNS(ns,'path');path.setAttribute('d',`M ${x1} 0 C ${x1} ${Math.max(60,y2*.45)}, ${x2} ${Math.max(80,y2*.55)}, ${x2} ${y2}`);
      path.setAttribute('pathLength','1');path.setAttribute('stroke',color);path.setAttribute('stroke-width','3');path.setAttribute('stroke-linecap','round');path.setAttribute('fill','none');svg.append(path);
      const tip=document.createElementNS(ns,'path');tip.setAttribute('d',`M ${x2-6} ${y2-8} L ${x2} ${y2} L ${x2+6} ${y2-8}`);tip.setAttribute('stroke',color);tip.setAttribute('stroke-width','3');tip.setAttribute('stroke-linejoin','round');tip.setAttribute('stroke-linecap','round');tip.setAttribute('fill','none');svg.append(tip);
      if(!reduced&&animate){path.animate([{strokeDasharray:'1',strokeDashoffset:1},{strokeDasharray:'1',strokeDashoffset:0}],{duration:1100,delay:200+i*100,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});tip.animate([{opacity:0},{opacity:1}],{duration:200,delay:1200+i*100,fill:'backwards'});}
    });content.prepend(svg);
  }
  function paint(){
    const end=current===4;
    forward.querySelector('span').textContent=end?'End':'Next';
    forward.classList.toggle('is-end',end);forward.setAttribute('aria-label',end?'End，返回 Preview':'Next');
  }
  function enter(){
    clearTimeout(timer);
    if(!reduced){
      const nodes=current===0?[...contents[0].firstElementChild.children]:current===1?[...core.children]:current===4?[highTitle,highTabs,gallery]:[];
      nodes.forEach((node,i)=>node.animate([{opacity:0,translate:'0 24px'},{opacity:1,translate:'0 0'}],{duration:600,delay:i*90,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
    }
    if(current===1&&built)drawDemandConnections();
    if(current===2)drawSolutionConnections();
    if(current===2&&!reduced){
      axis.querySelectorAll('.ga-design-axis-reveal').forEach((node,i)=>node.animate([
        {clipPath:i?'inset(0 100% 0 0)':'inset(100% 0 0 0)'},{clipPath:'inset(0)'}
      ],{duration:1100,delay:150+i*250,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
      originalLayout.querySelectorAll(':scope > [data-node-id]').forEach((node,i)=>node.animate([{opacity:0,translate:'0 15px'},{opacity:1,translate:'0 0'}],{duration:650,delay:Math.min(i*45,360),fill:'backwards'}));
    }

  }
  function advance(direction){
    if(locked)return;
    if(current===1&&(direction>0&&!built||direction<0&&built)){
      built=direction>0;contents[1].classList.toggle('is-built',built);if(built)drawDemandConnections();else contents[1].querySelector('svg')?.remove();
      locked=true;forward.disabled=true;clearTimeout(timer);timer=setTimeout(()=>{locked=false;forward.disabled=false;},reduced?0:750);return;
    }
    void go(current+direction);
  }
  async function go(next){
    if(disposed||locked||next===current||next>4)return;
    if(next<0){onPreview();return;}
    locked=true;forward.disabled=true;wheel=0;clearTimeout(timer);
    const before=pages[current],after=pages[next],direction=Math.sign(next-current);
    if(!reduced){animation=before.animate([{opacity:1,translate:'0 0'},{opacity:0,translate:`0 ${-direction*65}px`}],{duration:170,easing:'ease-in',fill:'forwards'});try{await animation.finished;}catch{return;}}
    if(disposed)return;
    before.hidden=true;animation?.cancel();after.hidden=false;current=next;fit();if(current===3)lowfiBox.scrollTop=direction<0?lowfiBox.scrollHeight:0;paint();enter();
    if(!reduced){animation=after.animate([{opacity:0,translate:`0 ${direction*70}px`},{opacity:1,translate:'0 0'}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)'});try{await animation.finished;}catch{return;}}
    if(disposed)return;animation=null;locked=false;forward.disabled=false;
  }
  function drawDemandConnections(animate=true){
    const content=contents[1];content.querySelector('svg')?.remove();const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.classList.add('ga-demand-lines');svg.setAttribute('viewBox','0 0 1250 650');
    [...demands.children].forEach((card,i)=>{
      const from=core.children[[0,1,2,2][i]],x1=from.offsetLeft+from.offsetWidth/2,y1=core.offsetTop+from.offsetHeight+12,x2=card.offsetLeft+card.offsetWidth/2,y2=demands.offsetTop-12,color=['#58a100','#b48400','#ce6000','#0089a8'][i];
      const path=document.createElementNS(ns,'path');path.setAttribute('d',`M ${x1} ${y1} C ${x1} ${(y1+y2)/2}, ${x2} ${(y1+y2)/2}, ${x2} ${y2}`);path.setAttribute('stroke',color);path.setAttribute('fill','none');path.setAttribute('stroke-width','3');path.setAttribute('pathLength','1');svg.append(path);
      const tip=document.createElementNS(ns,'path');tip.setAttribute('d',`M ${x2-6} ${y2-7} L ${x2} ${y2} L ${x2+6} ${y2-7}`);tip.setAttribute('stroke',color);tip.setAttribute('fill','none');tip.setAttribute('stroke-width','3');svg.append(tip);
      if(!reduced&&animate){path.animate([{strokeDasharray:'1',strokeDashoffset:1},{strokeDasharray:'1',strokeDashoffset:0}],{duration:1000,delay:100+i*80,easing:'ease-in-out',fill:'backwards'});tip.animate([{opacity:0},{opacity:1}],{duration:200,delay:1000+i*80,fill:'backwards'});}
    });content.append(svg);
  }
  forward.addEventListener('click',()=>{if(locked)return;if(current===4){ended=true;onPreview();}else advance(1);});
  const resize=new ResizeObserver(()=>fit());resize.observe(window);
  paint();fit();enter();
  function handleWheel(event){
    event.preventDefault();if(locked)return;
    const now=performance.now(),delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?window.clientHeight:1);
    if(current===3){
      const canScroll=delta>0?lowfiBox.scrollTop+lowfiBox.clientHeight<lowfiBox.scrollHeight-2:lowfiBox.scrollTop>2;
      if(canScroll){lowfiBox.scrollBy({top:delta,behavior:'instant'});lowfiLastScroll=now;wheel=0;return;}
      // Finish reading the edge before a fresh wheel gesture changes chapters.
      if(now-lowfiLastScroll<220){lowfiLastScroll=now;return;}
    }
    if(now-lastWheel<180){lastWheel=now;return;}
    if(Math.sign(delta)!==Math.sign(wheel))wheel=0;wheel+=delta;clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>wheel=0,180);
    if(Math.abs(wheel)>55){lastWheel=now;advance(wheel>0?1:-1);}
  }
  return {fit,activate(){if(ended){pages[current].hidden=true;pages[0].hidden=false;current=0;built=false;contents[1].classList.remove('is-built');contents[1].querySelector('svg')?.remove();ended=false;paint();}fit();enter();},wheel:handleWheel,key(event){
    if(['ArrowDown','PageDown','ArrowUp','PageUp'].includes(event.key)){
      event.preventDefault();const direction=['ArrowDown','PageDown'].includes(event.key)?1:-1;
      if(current===3&&(direction>0?lowfiBox.scrollTop+lowfiBox.clientHeight<lowfiBox.scrollHeight-2:lowfiBox.scrollTop>2))lowfiBox.scrollBy({top:direction*lowfiBox.clientHeight*.8,behavior:reduced?'instant':'smooth'});
      else advance(direction);
    }
  },destroy(){disposed=true;flipAnimations.forEach(item=>item.cancel());animation?.cancel();clearTimeout(timer);clearTimeout(wheelTimer);resize.disconnect();}};
}
