/* Damped letter springs share one pointer/frame loop across the Home typography. */
(() => {
  const home=document.querySelector('#home');if(!home)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),groups=[];
  function mount(root,{material=false,large=false}={}){
    if(!root)return;
    const text=root.dataset.title||root.textContent.trim();root.setAttribute('aria-label',text);root.replaceChildren();
    const letters=[];
    for(const char of text){
      const node=document.createElement('span');node.setAttribute('aria-hidden','true');
      if(char===' '){node.textContent='\u00a0';if(large)node.className='hero-title-space';}
      else{node.className='hero-physics-char'+(large?' hero-title-char':'')+(material&&!large?' hero-material-char':'');node.dataset.char=char;node.textContent=char;letters.push({node,x:0,vx:0,y:0,vy:0,angle:0,va:0,twist:0,vt:0,left:0,width:0});}
      if(large)node.style.setProperty('--entry-index',Math.max(0,letters.length-1));
      root.append(node);
    }
    groups.push({root,letters,material,large,rect:null});
  }
  mount(home.querySelector('.display-title'),{material:true,large:true});
  mount(home.querySelector('.home-signature'),{material:true});
  home.querySelectorAll('.home-word-track li,.home-for').forEach(root=>mount(root));
  // Tighten the visible glyph gaps, rather than the fonts' much taller line boxes.
  const metricsContext=document.createElement('canvas').getContext('2d');
  function inkMetrics(root){
    const style=getComputedStyle(root);metricsContext.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const ink=metricsContext.measureText(root.getAttribute('aria-label')||root.textContent);
    const baseline=document.createElement('i');baseline.setAttribute('aria-hidden','true');baseline.style.cssText='display:inline-block;width:0;height:0;padding:0;margin:0;border:0;vertical-align:baseline';
    root.append(baseline);const offset=baseline.getBoundingClientRect().top-root.getBoundingClientRect().top;baseline.remove();
    return {top:offset-ink.actualBoundingBoxAscent,bottom:offset+ink.actualBoundingBoxDescent};
  }
  function tightenSpacing(){
    const title=home.querySelector('.display-title'),signature=home.querySelector('.home-signature'),masthead=home.querySelector('.home-masthead'),stage=home.querySelector('.home-word-stage'),subtitle=home.querySelector('.home-for');
    if(!metricsContext||!title||!signature||!stage||!subtitle)return;
    home.style.setProperty('--home-title-tighten','0px');home.style.setProperty('--home-subtitle-tighten','0px');
    const titleInk=inkMetrics(title),headerInk=inkMetrics(signature),subtitleInk=inkMetrics(subtitle);
    const titleTop=parseFloat(getComputedStyle(title).top),headerTop=parseFloat(getComputedStyle(masthead).top),subtitleTop=parseFloat(getComputedStyle(stage).top);
    const above=Math.max(0,titleTop+titleInk.top-headerTop-signature.offsetTop-headerInk.bottom),below=Math.max(0,subtitleTop+subtitleInk.top-titleTop-titleInk.bottom);
    home.style.setProperty('--home-title-tighten',above*.75+'px');
    home.style.setProperty('--home-subtitle-tighten',above*.75+below*.5+'px');
    measure();
  }
  document.fonts.ready.then(tightenSpacing);window.addEventListener('resize',tightenSpacing);
  let introStart=performance.now(),frame=0,last=0,stroke=0,mouse={x:-1000,y:-1000,time:0};
  function measure(){for(const group of groups){group.rect=group.root.getBoundingClientRect();for(const letter of group.letters){letter.left=letter.node.offsetLeft;letter.width=letter.node.offsetWidth;}}}
  const resize=new ResizeObserver(measure);groups.forEach(group=>resize.observe(group.root));document.fonts.ready.then(measure);measure();
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
  function spring(letter,key,velocity,target,dt){letter[velocity]+=((target-letter[key])*125-letter[velocity]*14)*dt;letter[key]+=letter[velocity]*dt;}
  function tick(time){
    const dt=last?Math.min((time-last)/1000,.032):1/60;last=time;stroke*=Math.exp(-dt*7);
    const active=!reduced.matches&&document.body.dataset.page==='home'&&!document.hidden,introAge=(time-introStart)/1000,introActive=active&&introAge<6;
    let energy=0,hovering=false;
    for(const group of groups){
      const {root,letters,material,large}=group;
      if(root.hidden||!group.rect?.width)continue;
      const rect=root.getBoundingClientRect(),inside=active&&mouse.y>=rect.top&&mouse.y<=rect.bottom&&mouse.x>=rect.left&&mouse.x<=rect.right;
      hovering ||= inside;const strength=large?1:.5;
      for(const [index,letter] of letters.entries()){
        const localX=mouse.x-rect.left-letter.left,center=localX-letter.width/2,reach=large?Math.max(120,letter.width*1.3):55;
        const influence=inside?Math.exp(-Math.pow(center/reach,2)*2):0;
        const waveAge=introAge-(large?.5:1.15)-index*(large?.08:.04),wave=introActive&&waveAge>0?Math.sin(waveAge*6)*Math.exp(-waveAge*1.25):0;
        spring(letter,'x','vx',influence*clamp(stroke*.38+center*.025,-9,9)*strength,dt);
        spring(letter,'y','vy',(influence*-Math.min(3,Math.abs(stroke)*.1)-wave*4)*strength,dt);
        spring(letter,'angle','va',(influence*clamp(stroke*.15+center*.017,-5,5)+wave*3.5)*strength,dt);
        spring(letter,'twist','vt',(influence*clamp(stroke*.4+center*.045,-13,13)+wave*9)*strength,dt);
        letter.node.style.transform=`translate3d(${letter.x.toFixed(3)}px,${letter.y.toFixed(3)}px,0) rotateY(${letter.twist.toFixed(3)}deg) rotateZ(${letter.angle.toFixed(3)}deg)`;
        if(material){
          const teaser=introActive&&introAge>.8&&introAge<1.2&&!inside,materialX=teaser?rect.width*((introAge-.8)/.4)-letter.left:localX;
          letter.node.style.setProperty('--material-x',materialX+'px');letter.node.style.setProperty('--material-y',teaser?'55%':mouse.y-rect.top+'px');
          letter.node.style.setProperty('--material-alpha',inside||teaser?'1':'0');letter.node.style.setProperty('--metal-position',clamp(50+center*.12,10,90)+'%');
        }
        energy+=Math.abs(letter.x)+Math.abs(letter.y)+Math.abs(letter.angle)+Math.abs(letter.twist)+Math.abs(letter.vx)*.05+Math.abs(letter.va)*.05;
      }
    }
    if(hovering||introActive||energy>.02)frame=requestAnimationFrame(tick);else{frame=0;last=0;}
  }
  function wake(){if(!frame){last=0;frame=requestAnimationFrame(tick);}}
  document.addEventListener('pointermove',event=>{
    if(reduced.matches)return;const elapsed=Math.max(8,event.timeStamp-mouse.time);stroke=clamp((event.clientX-mouse.x)*16/elapsed,-40,40);mouse={x:event.clientX,y:event.clientY,time:event.timeStamp};wake();
  },{passive:true});
  const leave=()=>{mouse.y=-1000;wake();};
  document.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',leave);home.addEventListener('animationend',measure);
  new MutationObserver(()=>{leave();if(document.body.dataset.page==='home'){introStart=performance.now();measure();wake();}}).observe(document.body,{attributes:true,attributeFilter:['data-page']});
  new MutationObserver(()=>{measure();wake();}).observe(home.querySelector('.home-word-stage'),{attributes:true,subtree:true,attributeFilter:['hidden']});
  reduced.addEventListener('change',leave);wake();
})();
