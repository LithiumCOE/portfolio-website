(() => {
  const screens=[...document.querySelectorAll('.screen')];
  const ids=['home','about','work'];
  const top=document.querySelector('.edge-top'), bottom=document.querySelector('.edge-bottom');
  const position=document.querySelector('.page-position');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current=0,locked=false,wheel=0,wheelTimer,drag=null;
  document.body.classList.add('screen-mode');
  function paint(index,animate=true){
    current=index;document.body.dataset.page=ids[index];screens.forEach((s,i)=>s.classList.toggle('about-active',i===index&&s.id==='about'));document.querySelector('.model-tooltip')?.setAttribute('hidden','');
    screens.forEach((s,i)=>{s.style.transition=animate?'':'none';s.style.transform=`translateY(${(i-index)*100}vh)`;s.style.opacity=i===index?'1':'0';s.inert=i!==index;s.setAttribute('aria-hidden',String(i!==index));});
    top.textContent=index?'↑ 向上滚动回到上一页':'';top.hidden=!index;
    bottom.textContent=index<2?'向下滚动前往'+['About me','Category'][index]+' ↓':'';bottom.hidden=index===2;
    position.textContent=`${String(index+1).padStart(2,'0')} / 03 · ${['首页','About me','Category'][index]}`;
    document.querySelectorAll('header nav a').forEach(a=>a.setAttribute('aria-current',a.hash==='#'+ids[index]?'page':'false'));
  }
  function go(index,history=true){if(index<0||index>2||locked)return;locked=true;if(index===1&&current!==1)screens[index].scrollTop=0;paint(index);if(history)window.history.pushState(null,'','#'+ids[index]);setTimeout(()=>locked=false,reduced?30:650)}
  function hash(){const id=location.hash.slice(1);const index=id==='contact'?1:Math.max(0,ids.indexOf(id));paint(index,false);if(id==='contact')document.querySelector('#contact').scrollIntoView({block:'start'})}
  document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||!a.hash||!['#home','#about','#work','#contact','#'].includes(a.getAttribute('href')))return;e.preventDefault();const id=a.hash.slice(1);const index=id==='contact'?1:Math.max(0,ids.indexOf(id));go(index);if(id==='contact')document.querySelector('#contact').scrollIntoView({block:'start',behavior:reduced?'instant':'smooth'})});
  window.addEventListener('popstate',hash);window.addEventListener('hashchange',hash);
  document.addEventListener('wheel',e=>{
    if(e.ctrlKey||e.target.closest('input'))return;
    const s=screens[current];const down=e.deltaY>0;
    const canScroll=down?s.scrollTop+s.clientHeight<s.scrollHeight-3:s.scrollTop>3;
    if(canScroll)return;
    e.preventDefault();if(locked)return;
    const delta=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;
    if(Math.sign(wheel)!==Math.sign(delta))wheel=0;
    wheel+=delta;clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>wheel=0,180);
    if(Math.abs(wheel)>65){go(current+(down?1:-1));wheel=0}
  },{passive:false});
  top.addEventListener('click',()=>go(current-1));bottom.addEventListener('click',()=>go(current+1));
  document.addEventListener('pointermove',e=>{
    document.body.classList.toggle('near-top',e.clientY<90);
    document.body.classList.toggle('near-bottom',e.clientY>innerHeight-90);
    if(!drag)return;const dy=e.clientY-drag.y;const next=current+(dy<0?1:-1);
    if(next<0||next>2)return;drag.next=next;drag.dy=dy;
    screens[current].style.transition='none';screens[next].style.transition='none';
    screens[current].style.transform=`translateY(${dy*.65}px)`;screens[current].style.opacity=String(Math.max(.25,1-Math.abs(dy)/innerHeight));
    screens[next].style.transform=`translateY(${(dy<0?1:-1)*innerHeight+dy*.65}px)`;screens[next].style.opacity=String(Math.min(1,Math.abs(dy)/250));
  });
  document.addEventListener('pointerdown',e=>{
    if(locked||e.button!==0||e.target.closest('a,button,input,canvas')||e.pointerType==='mouse'&&e.clientY>90&&e.clientY<innerHeight-90)return;
    const s=screens[current];if(e.pointerType!=='mouse'&&s.scrollHeight>s.clientHeight+3)return;
    drag={y:e.clientY,dy:0,next:current};
  });
  function release(){if(!drag)return;const d=drag;drag=null;if(Math.abs(d.dy)>75)go(d.next);else paint(current)}
  document.addEventListener('pointerup',release);document.addEventListener('pointercancel',()=>{drag=null;paint(current)});
  document.addEventListener('keydown',e=>{if(e.target.closest('input,button,a')||e.altKey||e.ctrlKey||e.metaKey)return;if(['PageDown','ArrowDown'].includes(e.key)){e.preventDefault();go(current+1)}if(['PageUp','ArrowUp'].includes(e.key)){e.preventDefault();go(current-1)}});
  hash();
})();
