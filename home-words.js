/* One word per side, with a fixed half-second offset between the two reels. */
(() => {
  const reels=[...document.querySelectorAll('.home-word-reel')].map(reel=>({items:[...reel.querySelectorAll('li')],index:0,timer:null}));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let epoch=0;const animations=new Set();
  const active=()=>document.body.dataset.page==='home'&&!document.hidden&&!reduced.matches;
  function stop(){reels.forEach(reel=>{clearTimeout(reel.timer);reel.timer=null;});epoch++;animations.forEach(a=>a.cancel());animations.clear();}
  function schedule(reel,delay=1200){if(active())reel.timer=setTimeout(()=>cycle(reel),delay);}
  async function cycle(reel){
    const token=epoch;reel.timer=null;
    const previous=reel.items[reel.index];
    const exit=previous.animate([{opacity:1,translate:'0 0'},{opacity:0,translate:'0 -14px'}],{duration:140,easing:'ease-in',fill:'forwards'});animations.add(exit);
    try{await exit.finished;}catch{return;}
    if(token!==epoch)return;
    previous.hidden=true;exit.cancel();animations.delete(exit);reel.index=(reel.index+1)%reel.items.length;
    const next=reel.items[reel.index];next.hidden=false;
    const enter=next.animate([{opacity:0,translate:'0 14px'},{opacity:1,translate:'0 0'}],{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});animations.add(enter);
    try{await enter.finished;}catch{return;}
    if(token!==epoch)return;animations.delete(enter);schedule(reel);
  }
  function sync(){stop();reels.forEach((reel,i)=>schedule(reel,3200+i*500));}
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-page']});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  sync();
})();
