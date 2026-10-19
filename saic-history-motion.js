/** Entry animation for the SAIC brand-history reasoning page. */
export function mountSaicHistoryMotion(host,{reduced}){
  const overview=mountSaicOverviewMotion(host,{reduced});
  const narrative=mountSaicNarrativeMotion(host,{reduced});
  const page=host.querySelector('[data-node-id="279:2387"]')?.closest('.project-ppt-slide');
  if(!page)return {play(){},destroy(){}};
  const q=id=>page.querySelector(`[data-node-id="${id}"]`);
  const panel=q('279:2429'),left=q('279:2387'),diagram=q('279:2389'),notes=q('279:2403');
  const ns='http://www.w3.org/2000/svg';
  const funnel=document.createElementNS(ns,'svg');funnel.classList.add('saic-history-funnel');funnel.setAttribute('viewBox','0 0 1122 575');funnel.setAttribute('aria-hidden','true');
  const shape=document.createElementNS(ns,'path');shape.setAttribute('d','M 252 60 C 415 182 632 264 790 277 L 790 205 L 1010 305 L 790 405 L 790 337 C 632 349 415 425 252 520 Z');funnel.append(shape);panel.prepend(funnel);
  const guide=document.createElementNS(ns,'svg');guide.classList.add('saic-framework-guide');guide.setAttribute('aria-hidden','true');left.prepend(guide);
  function layoutGuide(){
    guide.replaceChildren();guide.setAttribute('viewBox',`0 0 ${left.offsetWidth} ${left.offsetHeight}`);
    const rows=['279:2404','279:2407','279:2410','279:2413'].map(q),x=notes.offsetLeft+3,startX=diagram.offsetLeft+diagram.offsetWidth*.5,startY=diagram.offsetTop+diagram.offsetHeight+6,jointY=notes.offsetTop-20;
    const ys=rows.map(row=>notes.offsetTop+row.offsetTop+14);
    const line=document.createElementNS(ns,'path');line.setAttribute('d',`M ${startX} ${startY} V ${jointY} Q ${startX} ${jointY+8} ${startX-8} ${jointY+8} H ${x+8} Q ${x} ${jointY+8} ${x} ${jointY+16} V ${ys.at(-1)}`);line.setAttribute('pathLength','1');guide.append(line);
    ys.forEach(y=>{const branch=document.createElementNS(ns,'path');branch.setAttribute('d',`M ${x} ${y} h 8`);branch.setAttribute('pathLength','1');guide.append(branch);});
  }
  let animations=[];
  function clear(){animations.forEach(a=>a.cancel());animations=[];}
  function reveal(node,delay,x=0,y=0){if(node)animations.push(node.animate([{opacity:0,translate:`${x}px ${y}px`},{opacity:1,translate:'0 0'}],{duration:560,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));}
  function play(){
    if(page.hidden)return;clear();layoutGuide();if(reduced)return;
    reveal(diagram,80,0,-12);
    guide.querySelectorAll('path').forEach((path,i)=>animations.push(path.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:i?360:1150,delay:500+i*200,easing:'ease-out',fill:'backwards'})));
    ['279:2404','279:2407','279:2410','279:2413'].forEach((id,i)=>reveal(q(id),650+i*240,0,-18));
    const columns=[['279:2424','279:2430'],['279:2425','279:2440','279:2441','279:2442','279:2443'],['279:2426','279:2444','279:2445','279:2446'],['279:2427','279:2447','279:2448','279:2449'],['279:2428','279:2452','279:2450']];
    columns.forEach((ids,i)=>ids.forEach((id,j)=>reveal(q(id),180+i*370+j*65,-22,0)));
    animations.push(funnel.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:1900,delay:400,easing:'cubic-bezier(.22,.6,.25,1)',fill:'backwards'}));
  }
  const observer=new MutationObserver(()=>{if(page.hidden)clear();else play();});observer.observe(page,{attributes:true,attributeFilter:['hidden']});
  overview.play();
  return {play(){overview.play();narrative.play();play();},destroy(){overview.destroy();narrative.destroy();clear();observer.disconnect();funnel.remove();guide.remove();}};
}

function mountSaicOverviewMotion(host,{reduced}){
  const page=host.querySelector('[data-node-id="279:2303"]')?.closest('.project-ppt-slide');
  let animations=[];
  function clear(){animations.forEach(a=>a.cancel());animations=[];}
  function play(){
    if(!page||page.hidden)return;clear();if(reduced)return;
    const groups=[['279:2303','279:2307','279:2308','279:2309'],['279:2312','279:2313','279:2314'],['279:2317','279:2318','279:2319'],['279:2304','279:2299','279:2301','279:2302','279:2300','279:2320']];
    groups.forEach((ids,i)=>ids.forEach((id,j)=>{
      const node=page.querySelector(`[data-node-id="${id}"]`);if(!node)return;
      animations.push(node.animate([{opacity:0,translate:'-24px 0'},{opacity:1,translate:'0 0'}],{duration:580,delay:450+i*380+j*40,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
    }));
    const arrow=page.querySelector('[data-node-id="279:2327"]');
    if(arrow)animations.push(arrow.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:1700,delay:500,easing:'cubic-bezier(.22,.6,.25,1)',fill:'backwards'}));
  }
  const observer=new MutationObserver(()=>{if(page.hidden)clear();else play();});
  if(page)observer.observe(page,{attributes:true,attributeFilter:['hidden']});
  return {play,destroy(){clear();observer.disconnect();}};
}
function mountSaicNarrativeMotion(host,{reduced}){
  const cleanups=[],players=[];
  const q=(page,id)=>page.querySelector(`[data-node-id="279:${id}"]`);
  function setup(anchor,run){
    const page=host.querySelector(`[data-node-id="279:${anchor}"]`)?.closest('.project-ppt-slide');if(!page)return;
    let animations=[];const add=(node,frames,delay=0,duration=700)=>{if(node)animations.push(node.animate(frames,{delay,duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));};
    const reveal=(id,delay,x=0,y=0)=>add(q(page,id),[{opacity:0,translate:`${x}px ${y}px`},{opacity:1,translate:'0 0'}],delay);
    const stop=()=>{animations.forEach(a=>a.cancel());animations=[];};
    const play=()=>{if(page.hidden)return;stop();if(!reduced)run(page,add,reveal);};
    const observer=new MutationObserver(()=>page.hidden?stop():play());observer.observe(page,{attributes:true,attributeFilter:['hidden']});players.push(play);cleanups.push(()=>{stop();observer.disconnect();});
    return page;
  }
  setup(3157,(page,add,reveal)=>{
    const measures=[{title:3147,panel:3157,image:3162,copy:3163},{title:3148,panel:3158,image:3160,copy:3164},{title:3149,panel:3159,image:3161,copy:3165}];
    measures.forEach((item,i)=>{
      const start=250+i*650;
      reveal(item.title,start,0,14);
      add(q(page,item.panel),[{opacity:0,translate:'0 24px'},{opacity:1,translate:'0 0'}],start+100,750);
      add(q(page,item.image),[{opacity:0,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}],start+180,850);
      reveal(item.copy,start+550,0,16);
    });
  });
  setup(3006,(page,add,reveal)=>{
    reveal(3001,180,-14);
    const columns=[{profile:3006,portrait:2998,line:3003,title:3015,quote:3019},{profile:3007,portrait:2999,line:3004,title:3016,quote:3021},{profile:3008,portrait:3000,line:3005,title:3017,quote:3023}];
    columns.forEach((column,i)=>{
      const start=240+i*250;
      reveal(column.profile,start,0,14);
      add(q(page,column.line),[{opacity:0,scale:'1 0'},{opacity:1,scale:'1 1'}],start+100,850);
      add(q(page,column.portrait),[{opacity:0,translate:'0 32px',clipPath:'inset(100% 0 0 0)'},{opacity:1,translate:'0 0',clipPath:'inset(0 0 0 0)'}],start+240,1100);
      reveal(column.title,1000+i*240,0,12);
      add(q(page,column.quote),[{opacity:0,translate:'0 12px',clipPath:'inset(0 0 100% 0)'},{opacity:1,translate:'0 0',clipPath:'inset(0 0 0 0)'}],1200+i*240,850);
    });
    reveal(3002,920,-14);
    reveal(3018,1830,0,12);reveal(3025,2000,0,12);
    add(q(page,3014),[{opacity:0,clipPath:'inset(0 50% 0 50%)'},{opacity:.5,clipPath:'inset(0 0 0 0)'}],2450,850);
    reveal(3013,2750,0,10);
    [3011,3009].forEach((id,i)=>add(q(page,id),[{opacity:0,scale:'.9',translate:'0 16px'},{opacity:1,scale:'1.035',translate:'0 -2px',offset:.7},{opacity:1,scale:'1',translate:'0 0'}],2900+i*220,700));
  });
  const marketPage=setup(2973,(page,add,reveal)=>{
    reveal(2971,100,0,12);
    const ids=[2973,2979,2975,2977];
    ids.forEach((id,i)=>{
      add(q(page,id),[
        {opacity:0,scale:'.35',translate:'0 42px'},
        {opacity:1,scale:'1.1',translate:'0 -10px',offset:.65},
        {opacity:1,scale:'.98',translate:'0 3px',offset:.84},
        {opacity:1,scale:'1',translate:'0 0'}
      ],420+i*260,760);
    });
    add(q(page,2974),[{translate:'0 0'},{translate:'0 -8px',offset:.35},{translate:'0 0',offset:.65},{translate:'0 -3px',offset:.82},{translate:'0 0'}],1250,850);
    page.querySelectorAll('.saic-keyword-spark').forEach((node,i)=>add(node,[{opacity:0,scale:'.2',rotate:'-35deg'},{opacity:1,scale:'1.2',rotate:'12deg',offset:.45},{opacity:0,scale:'.5',rotate:'40deg'}],1510+i*140,950));
    add(q(page,2976),[{translate:'-12px 0',transform:'skewX(-10deg)'},{translate:'10px 0',offset:.3},{translate:'0 0',transform:'skewX(0deg)'}],1840,650);
    page.querySelectorAll('.saic-keyword-speed').forEach((node,i)=>add(node,[{opacity:0,translate:'22px 0',scale:'.2 1'},{opacity:.8,translate:'0 0',scale:'1 1',offset:.35},{opacity:0,translate:'-60px 0',scale:'1.3 1'}],1810+i*100,800));
    add(q(page,2978),[{scale:'1 1'},{scale:'.86 1.03',offset:.4},{scale:'1.03 1',offset:.72},{scale:'1 1'}],2200,800);
    page.querySelectorAll('.saic-budget-bracket').forEach((node,i)=>add(node,[{opacity:0,translate:`${i?18:-18}px 0`},{opacity:.8,translate:'0 0',offset:.45},{opacity:0,translate:'0 0'}],2170,1000));
    reveal(2981,2650,24);
  });
  if(marketPage){
    const decorate=(id,className,text='')=>{const node=document.createElement('span');node.className=className;node.textContent=text;node.setAttribute('aria-hidden','true');q(marketPage,id).append(node);cleanups.push(()=>node.remove());return node;};
    decorate(2979,'saic-keyword-spark spark-one','✦');decorate(2979,'saic-keyword-spark spark-two','✦');
    for(let i=0;i<3;i++)decorate(2975,`saic-keyword-speed speed-${i}`);
    decorate(2977,'saic-budget-bracket bracket-left');decorate(2977,'saic-budget-bracket bracket-right');
  }
  setup(3045,(page,add,reveal)=>{
    [3047,3053].forEach((id,i)=>reveal(id,280+i*90,-125));
    [3049,3057].forEach((id,i)=>reveal(id,280+i*90,125));
    [3051,3052].forEach((id,i)=>add(q(page,id),[{opacity:0,scale:'.2 1',translate:`${i?-70:70}px 0`},{opacity:1,scale:'1 1',translate:'0 0'}],650,850));
    [3045,3034,3043].forEach((id,i)=>reveal(id,1450+i*180,0,20));
  });
  const energyPage=setup(3076,(page,add,reveal)=>{
    [3062,3063,3078,3081,3082].forEach((id,i)=>reveal(id,200+i*70,-25));
    add(q(page,3083),[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],850,1500);
    add(page.querySelector('.saic-energy-person'),[{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0 0)'}],1550,1600);
    add(page.querySelector('.saic-pouring-logo'),[{rotate:'0deg'},{rotate:'-26deg',offset:.3},{rotate:'-26deg',offset:.72},{rotate:'0deg'}],400,2900);
    [3087,3089,3091].forEach((id,i)=>reveal(id,400+i*80,-20));
    [3086,3088,3090,3092].forEach((id,i)=>reveal(id,2450+i*90,0,16));
    reveal(3084,1900,0,-12);
  });
  if(energyPage){
    const person=q(energyPage,3076),colored=person.cloneNode(true);colored.removeAttribute('data-node-id');colored.querySelectorAll('[data-node-id]').forEach(n=>n.removeAttribute('data-node-id'));colored.classList.add('saic-energy-person');person.after(colored);person.classList.add('saic-energy-monochrome');
    const logo=document.createElement('div');logo.classList.add('saic-pouring-logo');
    energyPage.querySelector('.saic-ppt-canvas').append(logo);
    const parts=[3078,3081,3082].map(id=>q(energyPage,id));
    const markers=parts.map(node=>{const marker=document.createComment('pouring-logo');node.before(marker);logo.append(node);return marker;});
    cleanups.push(()=>{parts.forEach((node,i)=>markers[i].replaceWith(node));logo.remove();colored.remove();person.classList.remove('saic-energy-monochrome');});
  }
  setup(3113,(page,add,reveal)=>{
    [3109,3095,3137,3139].forEach((id,i)=>reveal(id,250+i*90,-28));
    [3110,3111,3132].forEach((id,i)=>reveal(id,700+i*100,-20));
    add(q(page,3113),[{opacity:0,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}],950,1300);
    [3112,3133,3134,3135,3136].forEach((id,i)=>reveal(id,2100+i*90,-24));
  });
  return {play(){players.forEach(p=>p());},destroy(){cleanups.forEach(fn=>fn());}};
}
