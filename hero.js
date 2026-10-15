(() => {
  const canvas = document.querySelector('#city');
  const ctx = canvas.getContext('2d');
  const play = document.querySelector('#play'), reset = document.querySelector('#reset');
  const slider = document.querySelector('#speed'), boost = document.querySelector('#boost');
  const status = document.querySelector('#status'), output = document.querySelector('#speed-value');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let running = !reduced, target = 1, velocity = 1, angle = -1.4, flight = null, boostUntil = 0, last = 0, risk = 0;
  let grab=null,knobDragging=false,resetPress=0,pausePress=0,resetUntil=0,pauseUntil=0;
  let viewYaw=0,orbit=null,sceneDirty=false;
  const rotate=(x,y)=>[x*Math.cos(viewYaw)-y*Math.sin(viewYaw),x*Math.sin(viewYaw)+y*Math.cos(viewYaw)];
  const project=(x,y,z=0)=>{const [u,v]=rotate(x,y);return[690+(u-v)*.98,435+(u+v)*.5658-z]};
  const renderer=new CityDepthRenderer(canvas,project,p=>{const [u,v]=rotate(p[0],p[1]);return u+v+1.1316*p[2]});
  const poly = (points,fill) => renderer.polygon(points,fill);
  function box(x,y,w,d,h,top='#e5e8dd',left='#b8c0af',right='#cdd3c3',z=0) {
    poly([[x,y,z],[x+w,y,z],[x+w,y,z+h],[x,y,z+h]],left);
    poly([[x,y,z],[x,y+d,z],[x,y+d,z+h],[x,y,z+h]],right);
    poly([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],left);
    poly([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],right);
    poly([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],top);
  }
  // The road and vehicle share world-space coordinates and one isometric camera.
  // Heading changes only the horizontal axes; world Z always points upwards.
  const curve = a => [300*Math.sin(a),155*Math.sin(2*a),132*Math.pow(Math.max(0,Math.cos(a)),8)];
  const samples=720, lengths=[0];
  for(let i=1;i<=samples;i++){const p=curve((i-1)/samples*Math.PI*2),q=curve(i/samples*Math.PI*2);lengths.push(lengths[i-1]+Math.hypot(...q.map((v,j)=>v-p[j])))}
  const total=lengths[samples];
  const route = distance => {const d=((distance%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/ (Math.PI*2)*total;let lo=0,hi=samples;while(lo+1<hi){const mid=(lo+hi)>>1;if(lengths[mid]<d)lo=mid;else hi=mid}return curve((lo+(d-lengths[lo])/(lengths[hi]-lengths[lo]))/samples*Math.PI*2)};
  const heading = a => {const p=route(a-.001),q=route(a+.001);return Math.atan2(q[1]-p[1],q[0]-p[0])};
  const line=(points,color,width=1)=>renderer.line(points,color,width);
  function roadSegment(a,b){
    const p=curve(a),q=curve(b);
    const edge=(t,sign,zOffset=0)=>{const c=curve(t),dx=300*Math.cos(t),dy=310*Math.cos(2*t),len=Math.hypot(dx,dy);return[c[0]-dy/len*25*sign,c[1]+dx/len*25*sign,c[2]+zOffset]};
    const l=edge(a,1),r=edge(a,-1),l2=edge(b+.002,1),r2=edge(b+.002,-1);
    if(p[2]>2||q[2]>2){poly([l,l2,edge(b,1,-9),edge(a,1,-9)],'#ad9272');poly([r,r2,edge(b,-1,-9),edge(a,-1,-9)],'#c0a785')}
    poly([l,r,r2,l2],'#5c655b');
    line([l,l2],'#cdbb98',1.7);line([r,r2],'#cdbb98',1.7);
    if(Math.floor(a*32)%2===0)line([[...p.slice(0,2),p[2]+.5],[...q.slice(0,2),q[2]+.5]],'#dfdfc9',1.5);
    if(p[2]>24){line([edge(a,1,8),edge(b,1,8)],'#d6c6a6',2);line([edge(a,-1,8),edge(b,-1,8)],'#d6c6a6',2)}
  }
  function tree(x,y,size=18){
    box(x-2,y-2,4,4,25,'#a28d6c','#927c5d','#b19974');
    const ring=Array.from({length:10},(_,i)=>[x+size*Math.cos(i/10*Math.PI*2),y+size*Math.sin(i/10*Math.PI*2),38]);
    for(let i=0;i<10;i++){const next=ring[(i+1)%10];poly([ring[i],next,[x,y,63]],i<5?'#9ead91':'#84977b');poly([ring[i],next,[x,y,25]],'#8b9c7e')}
  }
  const buildings=[[-228,-30,40,43,67],[-169,4,35,37,41],[157,-42,37,40,108],[208,4,38,41,67]];
  function house(b){const[x,y,w,d,h]=b;box(x,y,w,d,h,'#dfc8a4','#b19875','#c7af88');poly([[x-3,y-3,h],[x+w+3,y-3,h],[x+w/2,y-3,h+25]],'#bba481');poly([[x-3,y-3,h],[x+w/2,y-3,h+25],[x+w/2,y+d+3,h+25],[x-3,y+d+3,h]],'#d2bc98');poly([[x+w/2,y-3,h+25],[x+w+3,y-3,h],[x+w+3,y+d+3,h],[x+w/2,y+d+3,h+25]],'#a28b68');poly([[x-3,y+d+3,h],[x+w+3,y+d+3,h],[x+w/2,y+d+3,h+25]],'#c6ad86');for(let z=18;z<h-10;z+=23){for(let j=8;j<w-5;j+=15)poly([[x+j,y+d+.1,z],[x+j+6,y+d+.1,z],[x+j+6,y+d+.1,z+10],[x+j,y+d+.1,z+10]],'#4e594f')}}
  function car(x,y,a,z=0,spin=0){
    const yaw=a+spin,co=Math.cos(yaw),si=Math.sin(yaw);
    const local=(u,v,h)=>[x+u*co-v*si,y+u*si+v*co,z+h];
    poly([local(-22,-12,.5),local(22,-12,.5),local(22,12,.5),local(-22,12,.5)],'rgba(42,48,36,.18)');
    function prism(u1,u2,v1,v2,h1,h2,colors){
      const verts=[local(u1,v1,h1),local(u2,v1,h1),local(u2,v2,h1),local(u1,v2,h1),local(u1,v1,h2),local(u2,v1,h2),local(u2,v2,h2),local(u1,v2,h2)];
      const faces=[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].map((f,i)=>({points:f.map(j=>verts[j]),color:colors[i],depth:f.reduce((sum,j)=>sum+verts[j][0]+verts[j][1],0)/4}));
      faces.sort((a,b)=>a.depth-b.depth).forEach(f=>poly(f.points,f.color));poly([verts[4],verts[5],verts[6],verts[7]],colors[4]);
    }
    function wheel(u,v){const pts=[];for(let i=0;i<20;i++){const t=i/20*Math.PI*2;pts.push(local(u+4.8*Math.cos(t),v,5+4.8*Math.sin(t)))}poly(pts,'#303730');const hub=[];for(let i=0;i<16;i++){const t=i/16*Math.PI*2;hub.push(local(u+2.5*Math.cos(t),v,5+2.5*Math.sin(t)))}poly(hub,'#c7cabd')}
    const nearSide=(-si+co)>0?1:-1;
    [-12,12].forEach(u=>wheel(u,-nearSide*10.8));
    prism(-22,23,-10,10,5,13,['#bc492b','#d85c31','#a34025','#bd4929','#eb7445']);
    prism(-11,9,-8,8,13,25,['#4c6058','#54756b','#3b5148','#698477','#f19565']);
    // Windshield and side windows are real vertical faces, not a rotated flat sprite.
    poly([local(9.1,-7,15),local(9.1,7,15),local(9.1,7,23),local(9.1,-7,23)],'#98b5aa');
    poly([local(23.1,-8,8),local(23.1,8,8),local(23.1,8,12),local(23.1,-8,12)],'#efe4bf');
    [-12,12].forEach(u=>wheel(u,nearSide*10.8));
  }
  const roadParts=Array.from({length:260},(_,i)=>({a:i/260*Math.PI*2,b:(i+1)/260*Math.PI*2}));
  // All static surfaces enter the same depth buffer, including bridge undersides.
  function buildScene(){
    renderer.depth.fill(-Infinity);renderer.image.data.fill(0);

    box(-355,-207,710,482,15,'#e0d4bc','#bca984','#cbb994',-15);
    roadParts.forEach(p=>roadSegment(p.a,p.b));
    [-.34,.34].forEach(a=>{const [x,y,z]=curve(a),dx=300*Math.cos(a),dy=310*Math.cos(2*a),len=Math.hypot(dx,dy);[-1,1].forEach(side=>{const px=x-dy/len*18*side,py=y+dx/len*18*side;box(px-4,py-4,8,8,z-9,'#ccb48e','#ac9570','#c0a783')})});
    buildings.forEach(house);
    [[-190,61],[-125,-58],[145,48],[250,-43],[-290,-64],[278,62]].forEach(([x,y])=>tree(x,y,15));
    renderer.cache();
  }
  const controlY=241,sliderStart=-240,sliderEnd=75;
  function physicalControls(){
    box(-274,213,580,52,5,'#d1bf9b','#a28b67','#bca780',0);
    box(sliderStart,controlY-3,sliderEnd-sliderStart,6,3,'#756d5a','#655b48','#918369',5);
    const x=sliderStart+(target-.3)/2.9*(sliderEnd-sliderStart);
    box(x-12,controlY-13,24,26,13,'#ece3ce','#b2a387','#cfc1a4',8);
    box(125,controlY-16,44,32,8,'#a23c2c','#712a20','#873225',5);
    box(130,controlY-12,34,24,8,'#d95840','#963c2a','#b44730',13-resetPress*6);
    box(217,controlY-16,44,32,6,'#424f42','#303b31','#394638',3);
    box(221,controlY-12,36,24,8,'#667363','#424f42','#53624f',9-pausePress*6);
  }
  // Screen-space nearest point follows both road decks at their actual heights.
  const makeDropPath=()=>Array.from({length:721},(_,i)=>{const phase=i/720*Math.PI*2,p=route(phase);return {phase,screen:project(p[0],p[1],p[2]+12)}});
  let dropPath=makeDropPath();
  function nearestTrack(pointer){let best={distance:Infinity,phase:0,point:null};for(let i=1;i<dropPath.length;i++){const a=dropPath[i-1],b=dropPath[i],dx=b.screen[0]-a.screen[0],dy=b.screen[1]-a.screen[1],len=dx*dx+dy*dy;const t=len?Math.max(0,Math.min(1,((pointer[0]-a.screen[0])*dx+(pointer[1]-a.screen[1])*dy)/len)):0;const p=[a.screen[0]+dx*t,a.screen[1]+dy*t],distance=Math.hypot(pointer[0]-p[0],pointer[1]-p[1]);if(distance<best.distance)best={distance,phase:a.phase+(b.phase-a.phase)*t,point:p}}return best}
  function animateButton(kind){if(kind==='reset')resetUntil=performance.now()+180;else pauseUntil=performance.now()+180}
  function overlay(){
    ctx.save();ctx.scale(canvas.width/1400,canvas.height/850);
    ctx.font='13px Arial';ctx.fillStyle='#514a3c';
    
    if(grab){
      ctx.beginPath();dropPath.forEach((p,i)=>i?ctx.lineTo(...p.screen):ctx.moveTo(...p.screen));ctx.strokeStyle='rgba(92,132,80,.3)';ctx.lineWidth=14;ctx.stroke();
      const hit=nearestTrack(grab.pointer);if(hit.distance<32){ctx.beginPath();ctx.arc(...hit.point,18,0,Math.PI*2);ctx.strokeStyle='#577b49';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#425e37';ctx.textAlign='center';ctx.fillText('松手，从这里出发',hit.point[0],hit.point[1]-30)}
    }
    ctx.restore();
  }
  function draw(){
    if(sceneDirty){buildScene();dropPath=makeDropPath();sceneDirty=false}
    renderer.begin();
    physicalControls();
    const pos=grab?[grab.x,grab.y,180]:flight?[flight.x,flight.y,flight.z]:route(angle);
    // A derailed/picked-up car is a recoverable foreground object, never hidden under the bridge.
    if(flight)renderer.depth.fill(-Infinity);
    car(pos[0],pos[1],flight?flight.heading:heading(angle),pos[2]+1,flight?flight.spin:0);
    if(velocity>1.6&&!flight&&running)line([route(angle-.06),route(angle-.13)],'rgba(211,74,35,.6)',3);
    renderer.present();overlay();
  }
  buildScene();
  const exportButton=document.createElement('button');
  exportButton.textContent='保存模型 PNG ↗';exportButton.className='export-model';
  document.querySelector('.controls').append(exportButton);
  exportButton.addEventListener('click',()=>{
    renderer.resize(2800);buildScene();draw();
    let link=document.querySelector('#hero-download');if(!link){link=document.createElement('a');link.id='hero-download';link.textContent='下载 PNG';link.style.cssText='display:block;font-size:11px;margin-top:8px';document.querySelector('.controls').append(link)}link.download='hero-transparent.png';link.href=canvas.toDataURL('image/png');
    renderer.resize();buildScene();draw();
  });
  let resizeTimer;
  function refreshResolution(){clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(renderer.resize()){buildScene();draw()}},120)}
  new ResizeObserver(refreshResolution).observe(canvas);
  window.addEventListener('resize',refreshResolution);
  // Moving between monitors can change DPR without changing the CSS viewport.
  function watchDensity(){const density=matchMedia(`(resolution: ${devicePixelRatio}dppx)`);density.addEventListener('change',()=>{refreshResolution();watchDensity()},{once:true})}
  watchDensity();
  function sync(message){play.textContent=running?'暂停 Ⅱ':'播放 ▷';play.disabled=!!flight;boost.disabled=!!flight;slider.disabled=!!flight;output.value=target.toFixed(1)+'×';if(message)status.textContent=message;canvas.dataset.state=flight?'derailed':running?'running':'paused';canvas.dataset.speed=velocity.toFixed(2)}
  function crash(){const [x,y,z]=route(angle);const direction=heading(angle);flight={x,y,z,vz:190,vx:Math.cos(direction)*240,vy:Math.sin(direction)*240,heading:direction,spin:0,age:0};boostUntil=0;sync('飞出去了！把小车拖回赛道任意位置，或按红色按钮重置。')}
  play.addEventListener('click',()=>{animateButton('pause');running=!running;last=0;sync(running?'小车正在绕圈。':'暂停了，城市等你继续。')});
  slider.addEventListener('input',()=>{target=Number(slider.value);sync(target>2.2?'这个速度有点危险。':running?'小车正在绕圈。':'速度已调整，播放后生效。')});
  boost.addEventListener('click',()=>{running=true;boostUntil=performance.now()+2400;sync('加速中，注意下一处转弯！')});
  function restore(start=-1.4,resume=!reduced){animateButton('reset');grab=null;angle=start;flight=null;target=velocity=1;slider.value='1';running=resume;risk=0;boostUntil=0;last=0;sync(running?'归位了，再试一次。':'归位了，点击播放开始。')}
  reset.addEventListener('click',()=>restore());
  // Translate pointers through object-fit:contain letterboxing and HiDPI sizing.
  function pointer(e){const r=canvas.getBoundingClientRect(),w=Math.min(r.width,r.height*1400/850),h=w*850/1400;return[(e.clientX-r.left-(r.width-w)/2)*1400/w,(e.clientY-r.top-(r.height-h)/2)*850/h]}
  function ground(p,z=15){const sum=(p[1]-435+z)/.5658,diff=(p[0]-690)/.98;const u=(sum+diff)/2,v=(sum-diff)/2;return[u*Math.cos(viewYaw)+v*Math.sin(viewYaw),-u*Math.sin(viewYaw)+v*Math.cos(viewYaw)]}
  function setPhysicalSpeed(p){const [x]=ground(p,15);target=Math.max(.3,Math.min(3.2,.3+(x-sliderStart)/(sliderEnd-sliderStart)*2.9));slider.value=String(target);sync(target>2.2?'速度有点危险，试试转弯。':'速度已调整。')}
  canvas.style.touchAction='none';
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;const p=pointer(e),[x,y]=ground(p,15);
    if(flight){const c=project(flight.x,flight.y,flight.z+12);if(Math.hypot(p[0]-c[0],p[1]-c[1])<48){const [gx,gy]=ground(p,180);grab={x:gx,y:gy,pointer:p};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';sync('拖到赛道任意位置，松手就从那里出发。');return}}
    if(Math.abs(y-controlY)<32&&x>118&&x<175){restore();return}
    if(Math.abs(y-controlY)<32&&x>210&&x<270&&!flight){play.click();return}
    if(Math.abs(y-controlY)<28&&x>sliderStart-25&&x<sliderEnd+25&&!flight){knobDragging=true;canvas.setPointerCapture(e.pointerId);setPhysicalSpeed(p);return}
    orbit={startX:e.clientX,yaw:viewYaw};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';
  });
  canvas.addEventListener('pointermove',e=>{const p=pointer(e);if(orbit){viewYaw=orbit.yaw-(e.clientX-orbit.startX)*.006;sceneDirty=true;return}if(grab){const [x,y]=ground(p,180);grab.x=x;grab.y=y;grab.pointer=p;return}if(knobDragging){setPhysicalSpeed(p);return}const [x,y]=ground(p,15);const c=flight?project(flight.x,flight.y,flight.z+12):null;canvas.style.cursor=c&&Math.hypot(p[0]-c[0],p[1]-c[1])<48?'grab':Math.abs(y-controlY)<32&&x>sliderStart-25&&x<275?'pointer':'grab'});
  canvas.addEventListener('pointerup',e=>{orbit=null;knobDragging=false;if(grab){const hit=nearestTrack(pointer(e));grab=null;if(hit.distance<32){restore(hit.phase,true);sync('已放回赛道，从这里继续跑。')}else sync('还没放到赛道上，再捡一次。')}if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);canvas.style.cursor='grab'});
  canvas.addEventListener('pointercancel',()=>{orbit=null;knobDragging=false;grab=null;canvas.style.cursor='grab'});
  // Conventional controls remain available as a keyboard-accessible fallback.
  const fallback=document.createElement('details');fallback.className='keyboard-controls';
  fallback.innerHTML='<summary>键盘 / 备用控制</summary>';
  const host=document.querySelector('.controls');
  [document.querySelector('.play-row'),document.querySelector('label[for="speed"]'),slider,document.querySelector('.range-label'),boost].forEach(el=>fallback.append(el));host.insertBefore(fallback,exportButton);
  document.querySelector('.control-heading').innerHTML='<span>摸摸这个小沙盘</span><span>↙</span>';
  document.querySelector('.hint').innerHTML='拖动空白处旋转沙盘。<br>长边滑块控制速度，红钮重置。<br>飞出后，捡起小车放回赛道任意位置。';
  canvas.setAttribute('aria-label','可拖动空白处水平旋转的等距城市沙盘。长边有速度滑块、红色重置按钮和播放按钮。脱轨小车可拖回赛道任意位置继续行驶；键盘可使用备用控制。');
  document.addEventListener('visibilitychange' ,()=>{last=0});
  function tick(time){const dt=last?Math.min((time-last)/1000,.035):0;last=time;resetPress+=(Number(time<resetUntil)-resetPress)*Math.min(1,dt*22);pausePress+=(Number(running||time<pauseUntil)-pausePress)*Math.min(1,dt*22);if(!document.hidden&&(!document.body.dataset.page||document.body.dataset.page==="home")){if(flight){if(!grab&&flight.age<1.8){flight.age+=dt;flight.x=Math.max(-400,Math.min(400,flight.x+flight.vx*dt));flight.y=Math.max(-245,Math.min(245,flight.y+flight.vy*dt));flight.z=Math.max(0,flight.z+flight.vz*dt);flight.vz-=350*dt;flight.spin+=dt*2;if(flight.z===0&&flight.age>.3){flight.vx*=Math.exp(-dt*6);flight.vy*=Math.exp(-dt*6)}}}else if(running){velocity+=(Math.max(target,time<boostUntil?3.6:target)-velocity)*Math.min(1,dt*3);angle+=dt*.55*velocity;const turn=Math.abs(heading(angle+.025)-heading(angle-.025));risk=velocity>2.2&&turn>.025?risk+dt:Math.max(0,risk-dt);if(risk>.22)crash()}draw(time)}requestAnimationFrame(tick)}
  sync(reduced?'点击播放开始探索。':null);requestAnimationFrame(tick);
})();





