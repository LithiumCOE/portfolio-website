import * as THREE from './vendor/three.module.js';
import {advanceFlight} from './building-collision.js';

const canvas=document.querySelector('#city');
const status=document.querySelector('#status'),play=document.querySelector('#play'),reset=document.querySelector('#reset'),slider=document.querySelector('#speed'),boost=document.querySelector('#boost'),output=document.querySelector('#speed-value');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try {renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});}
catch(error){status.textContent='当前设备无法启动 WebGL，可打开 Canvas 2D 备份。';const link=document.createElement('a');link.href='backups/canvas2d-2026-10-14/index.html';link.textContent='打开 Canvas 2D 备份 ↗';document.querySelector('.controls').append(link);throw error;}
renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;renderer.autoClear=false;
const scene=new THREE.Scene();
const model=new THREE.Group();scene.add(model);
const camera=new THREE.PerspectiveCamera(20,1,1,20000);
const cameraYaw=Math.PI/4;
let yaw=0,pitch=.59,orbitDistance=2050;
function updateCamera(){
  // Keep depth precision around the model, including when the full-page camera moves back.
  camera.near=Math.max(10,orbitDistance-1800);camera.far=orbitDistance+2600;
  camera.updateProjectionMatrix();
  camera.position.set(Math.sin(cameraYaw)*orbitDistance*Math.cos(pitch),orbitDistance*Math.sin(pitch),Math.cos(cameraYaw)*orbitDistance*Math.cos(pitch));camera.lookAt(0,38,28);camera.updateMatrixWorld();
}
updateCamera();
function lightScene(s){s.add(new THREE.HemisphereLight(0xfff9e9,0xa4b398,2));const light=new THREE.DirectionalLight(0xfff5da,3.2);light.position.set(-280,700,400);light.castShadow=s===scene;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-550,right:550,top:500,bottom:-500,near:1,far:1600});light.shadow.bias=-.0004;light.shadow.normalBias=1; s.add(light);}
lightScene(scene);
const materials=new Map();
function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.83,metalness:0,flatShading:true}));return materials.get(color);}
function box(parent,x,y,z,w,h,d,color){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
const TABLE_Y=-16;
// A single stationary desktop under the model; only real light shadows are visible.
const tabletop=new THREE.Mesh(new THREE.PlaneGeometry(2600,2600),new THREE.ShadowMaterial({opacity:.18}));
tabletop.rotation.x=-Math.PI/2;tabletop.position.y=TABLE_Y;tabletop.receiveShadow=true;scene.add(tabletop);
box(model,0,-8,34,710,16,482,0xddcdb0);
class Track extends THREE.Curve {
  constructor(){super();this.arcLengthDivisions=1400;}
  getPoint(t,target=new THREE.Vector3()){const a=t*Math.PI*2;return target.set(300*Math.sin(a),132*Math.pow(Math.max(0,Math.cos(a)),8)+1,155*Math.sin(2*a));}
}
const track=new Track();
const roadPoints=[];
function edge(t,offset,dy=0){const p=track.getPoint(t),a=t*Math.PI*2,dx=300*Math.cos(a),dz=310*Math.cos(2*a),len=Math.hypot(dx,dz);return p.add(new THREE.Vector3(-dz/len*offset,dy,dx/len*offset));}
function ribbon(width,height=0,side=false){const vertices=[],indices=[],segments=360;
  for(let i=0;i<=segments;i++){const t=i/segments,l=edge(t,width,height),r=edge(t,-width,height);if(side){const p=edge(t,width,height-9);vertices.push(...l.toArray(),...p.toArray());}else vertices.push(...l.toArray(),...r.toArray());}
  for(let i=0;i<segments;i++){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;}
const roadMaterial=new THREE.MeshStandardMaterial({color:0x535d53,roughness:1,side:THREE.DoubleSide});
const road=new THREE.Mesh(ribbon(25),roadMaterial);road.receiveShadow=true;road.castShadow=true;model.add(road);
for(const side of [-25,25]){const m=new THREE.Mesh(ribbon(side,0,true),new THREE.MeshStandardMaterial({color:0xb49c77,roughness:.9,side:THREE.DoubleSide}));m.castShadow=true;model.add(m);}
const under=new THREE.Mesh(ribbon(25,-9),new THREE.MeshStandardMaterial({color:0xac9572,roughness:.9,side:THREE.DoubleSide}));model.add(under);
class EdgeCurve extends THREE.Curve {constructor(offset,raise=0){super();this.offset=offset;this.raise=raise;}getPoint(t,target=new THREE.Vector3()){return target.copy(edge(t,this.offset,this.raise));}}
for(const side of [-24,24])model.add(new THREE.Mesh(new THREE.TubeGeometry(new EdgeCurve(side,.65),360,.9,5,true),material(0xd8c7a6)));
// Subdivide each marking along the same surface as the road, rather than a straight chord.
const markingMaterial=new THREE.MeshStandardMaterial({color:0xe2e0cd,roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
for(let i=0;i<100;i++){
  const vertices=[],indices=[];
  for(let j=0;j<=8;j++){
    const t=track.getUtoTmapping((i+j/8*.43)/100);
    vertices.push(...edge(t,.85,.25).toArray(),...edge(t,-.85,.25).toArray());
    if(j<8){const n=j*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const stripe=new THREE.Mesh(geometry,markingMaterial);stripe.receiveShadow=true;model.add(stripe);
}
for(const a of [-.34,.34]){const p=track.getPoint(a/(Math.PI*2)),dx=300*Math.cos(a),dz=310*Math.cos(2*a),len=Math.hypot(dx,dz);for(const side of [-1,1])box(model,p.x-dz/len*18*side,(p.y-9)/2,p.z+dx/len*18*side,8,p.y-9,8,0xc6ad84);}
// Timber handrails on the raised arch, with real vertical posts.
for(const side of [-24,24]){const points=[];for(let i=0;i<=100;i++){const a=-.68+i/100*1.36;points.push(edge(a/(Math.PI*2),side,8));}model.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),100,1.2,5,false),material(0xd5c09b)));for(let i=0;i<=12;i++){const a=-.68+i/12*1.36,p=edge(a/(Math.PI*2),side,4);box(model,p.x,p.y,p.z,2,8,2,0xcab38f);}}
const buildingBounds=[];
function house(x,z,w,d,h){buildingBounds.push({min:{x:x-3,y:0,z:z-3},max:{x:x+w+3,y:h+25,z:z+d+3}});box(model,x+w/2,h/2,z+d/2,w,h,d,0xd0b38a);const shape=new THREE.Shape();shape.moveTo(-w/2-3,0);shape.lineTo(w/2+3,0);shape.lineTo(0,25);shape.closePath();const roof=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:d+6,bevelEnabled:false}),material(0xa78b63));roof.position.set(x+w/2,h,z-3);roof.castShadow=true;roof.receiveShadow=true;model.add(roof);for(let y=18;y<h-10;y+=23){for(let j=8;j<w-5;j+=15){for(const face of [z-.3,z+d+.3])box(model,x+j+3,y+5,face,6,10,.5,0x46534a);}for(const face of [x-.3,x+w+.3])box(model,face,y+5,z+d/2,.5,10,7,0x46534a);}}
[[-228,-30,40,43,67],[-169,4,35,37,41],[157,-42,37,40,108],[208,4,38,41,67]].forEach(b=>house(...b));
for(const [x,z] of [[-190,61],[-125,-58],[145,48],[250,-43],[-230,-60],[235,60]]){box(model,x,14,z,4,28,4,0xa28d6c);const crown=new THREE.Mesh(new THREE.ConeGeometry(16,36,8),material(0x94a583));crown.position.set(x,43,z);crown.castShadow=true;model.add(crown);}
// Physical control panel, including generous invisible raycast hit volumes.
box(model,16,3,239,580,6,52,0xcab58e);box(model,-82.5,8,241,315,5,6,0x756c58);
const knob=box(model,-164,16,241,24,13,26,0xebe1cc);
box(model,147,9,241,44,8,32,0x8f3025);const red=box(model,147,25,241,34,8,24,0xd14a36);
box(model,239,6,241,44,6,32,0x3e4c3e);const green=box(model,239,13,241,36,8,24,0x61765b);
red.userData.action='reset';green.userData.action='play';knob.userData.action='speed';
const speedHit=new THREE.Mesh(new THREE.BoxGeometry(350,30,45),new THREE.MeshBasicMaterial({visible:false}));speedHit.position.set(-82.5,15,241);speedHit.userData.action='speed';model.add(speedHit);
const redHit=new THREE.Mesh(new THREE.BoxGeometry(48,40,40),new THREE.MeshBasicMaterial({visible:false}));redHit.position.set(147,20,241);redHit.userData.action='reset';model.add(redHit);
const greenHit=redHit.clone();greenHit.position.x=239;greenHit.userData.action='play';model.add(greenHit);
const controlHits=[speedHit,redHit,greenHit];
const car=new THREE.Group();model.add(car);

box(car,0,9,0,44,9,20,0xd75c35);box(car,-1,20,0,22,13,16,0xf28b57);
box(car,10.2,20,0,.6,10,14,0x75968b);box(car,-12.2,20,0,.6,10,14,0x4e6d61);
for(const side of [-1,1])box(car,-1,20,side*8.2,17,9,.5,0x54756a);
for(const x of [-13,13])for(const z of [-11,11]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(5,5,3,14),material(0x29332c));wheel.rotation.x=Math.PI/2;wheel.position.set(x,5,z);car.add(wheel);const hub=new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.8,3.3,12),material(0xc7cabd));hub.rotation.x=Math.PI/2;hub.position.copy(wheel.position);car.add(hub);}
for(const z of [-6,6])box(car,22.3,9,z,.7,4,4,0xf5e2b2);
const highlight=new THREE.Mesh(new THREE.TubeGeometry(track,360,5,6,true),new THREE.MeshBasicMaterial({color:0x8cff47,transparent:true,opacity:.72,depthTest:false,depthWrite:false,toneMapped:false}));highlight.renderOrder=100;highlight.visible=false;model.add(highlight);
const dropRing=new THREE.Mesh(new THREE.TorusGeometry(22,3.2,8,40),new THREE.MeshBasicMaterial({color:0xb2ff67,depthTest:false,depthWrite:false,toneMapped:false}));dropRing.rotation.x=-Math.PI/2;dropRing.renderOrder=110;dropRing.visible=false;model.add(dropRing);
let running=!reduced,target=1,velocity=1,phase=(((-1.4/(Math.PI*2))%1)+1)%1,flight=null,drag=null,resetUntil=0,pauseUntil=0,risk=0,boostUntil=0,prev=0,pressRed=0,pressGreen=0;
const tooltip=document.createElement('div');tooltip.className='model-tooltip';tooltip.hidden=true;tooltip.setAttribute('role','tooltip');document.body.append(tooltip);
// Solid geometry shares the sandbox lighting, perspective and model rotation.
const cueMaterial=new THREE.MeshStandardMaterial({color:0xd4a568,roughness:.38,metalness:.32,flatShading:true,transparent:true});
const cueSide=new THREE.MeshStandardMaterial({color:0xb68549,roughness:.45,metalness:.25,flatShading:true,transparent:true});
function solidPointer(){
  const group=new THREE.Group();
  const shaft=new THREE.Mesh(new THREE.BoxGeometry(9,33,9),cueMaterial);shaft.position.y=38;group.add(shaft);
  const head=new THREE.Mesh(new THREE.ConeGeometry(17,23,4),cueMaterial);head.rotation.z=Math.PI;head.rotation.y=Math.PI/4;head.position.y=11.5;group.add(head);
  return group;
}
const controlCues=[knob,red,green].map((target,index)=>{const arrow=solidPointer();arrow.userData.phase=index*.8;model.add(arrow);return {target,arrow};});
function solidCurvedArrow(){
  const r=43,outer=49,inner=37,a=-1.2,b=1.1,shape=new THREE.Shape();
  shape.moveTo(Math.cos(a)*outer,Math.sin(a)*outer);shape.absarc(0,0,outer,a,b,false);
  shape.lineTo(Math.cos(b)*(r+19),Math.sin(b)*(r+19));
  shape.lineTo(Math.cos(b+.52)*r,Math.sin(b+.52)*r);
  shape.lineTo(Math.cos(b)*(r-19),Math.sin(b)*(r-19));
  shape.lineTo(Math.cos(b)*inner,Math.sin(b)*inner);shape.absarc(0,0,inner,b,a,true);shape.closePath();
  const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:9,bevelEnabled:true,bevelSize:1.1,bevelThickness:1.1,bevelSegments:1,steps:1,curveSegments:28}),[cueMaterial,cueSide]);
  mesh.rotation.x=-Math.PI/2;const group=new THREE.Group();group.add(mesh);return group;
}
const dragCues=[solidCurvedArrow(),solidCurvedArrow()];
dragCues[0].position.set(-345,28,340);dragCues[1].position.set(340,28,-345);
dragCues.forEach(cue=>{cue.children[0].scale.x=-1;model.add(cue);});
let guidesDismissedAt=null,guidesFinished=false;
function dismissGestureGuides(){
  if(guidesDismissedAt!==null)return;
  guidesDismissedAt=performance.now();canvas.dataset.guidance='fading';
}
function updateGestureGuides(time){
  if(guidesFinished)return;
  if(guidesDismissedAt!==null){
    const progress=Math.min(1,(time-guidesDismissedAt)/750),opacity=1-progress*progress*(3-2*progress);
    cueMaterial.opacity=cueSide.opacity=opacity;
    if(progress===1){guidesFinished=true;[...dragCues,...controlCues.map(cue=>cue.arrow)].forEach(cue=>cue.visible=false);canvas.dataset.guidance='dismissed';return;}
  }
  controlCues.forEach(({target,arrow},index)=>{
    arrow.position.copy(target.position);arrow.position.y+=28+(reduced?0:Math.sin(time*.002+index*.8)*3);
    arrow.rotation.y=reduced?.35:time*.0015+index*.8;
  });
  dragCues.forEach((arrow,index)=>{const motion=reduced?0:Math.sin(time*.002+index*.7);arrow.rotation.y=(index?Math.PI:0)+Math.PI*.25+motion*.2;arrow.position.y=28+motion*4;});
}
const recoveryBubble=document.createElement('div');recoveryBubble.className='hero-bubble recovery-bubble';recoveryBubble.textContent='把我拖回赛道吧';recoveryBubble.hidden=true;canvas.parentElement.append(recoveryBubble);
const bubblePoint=new THREE.Vector3();
let viewportWidth=1,viewportHeight=1;
function positionBubble(element,world,below=false){
  model.localToWorld(bubblePoint.copy(world)).project(camera);
  element.style.left=THREE.MathUtils.clamp((bubblePoint.x*.5+.5)*viewportWidth,100,Math.max(100,viewportWidth-100))+'px';
  element.style.top=THREE.MathUtils.clamp((-.5*bubblePoint.y+.5)*viewportHeight+(below?40:-25),64,viewportHeight-(below?64:24))+'px';
}
function updateBubbles(){
  model.updateWorldMatrix(true,false);
  recoveryBubble.hidden=!flight?.settled||drag?.kind==='car';
  if(!recoveryBubble.hidden)positionBubble(recoveryBubble,car.position);
}
function sync(message){play.textContent=running?'暂停 Ⅱ':'播放 ▷';play.disabled=!!flight;slider.disabled=!!flight;boost.disabled=!!flight;output.value=target.toFixed(1)+'×';canvas.dataset.state=flight?'derailed':running?'running':'paused';if(message)status.textContent=message;}
function restore(t=(((-1.4/(Math.PI*2))%1)+1)%1,resume=!reduced){model.add(car);flight=null;drag=null;phase=t;target=velocity=1;slider.value='1';running=resume;risk=0;boostUntil=0;resetUntil=performance.now()+180;sync('归位了，再试一次。');}
function toggle(){if(flight)return;dismissGestureGuides();running=!running;pauseUntil=performance.now()+180;sync(running?'小车正在绕圈。':'暂停了，城市等你继续。');}
play.addEventListener('click',toggle);reset.addEventListener('click',()=>{dismissGestureGuides();restore();});slider.addEventListener('input',()=>{dismissGestureGuides();target=+slider.value;sync(target>2.2?'这个速度有点危险。':'速度已调整。');});boost.addEventListener('click',()=>{dismissGestureGuides();running=true;boostUntil=performance.now()+2400;sync('加速中，注意转弯。');});
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
function setRay(e){model.updateWorldMatrix(true,true);const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);return rect;}
function showTooltip(e,action){if(!action||drag){tooltip.hidden=true;return;}tooltip.textContent=action==='reset'?'重置':action==='play'?(running?'暂停':'播放'):`拖动滑块调整速度 · ${target.toFixed(1)}×`;tooltip.style.left=Math.min(innerWidth-250,Math.max(10,e.clientX+16))+'px';tooltip.style.top=Math.min(innerHeight-60,e.clientY+16)+'px';tooltip.hidden=false;}
const pathSamples=Array.from({length:721},(_,i)=>track.getPointAt(i/720));
function pickCar(){const hit=ray.intersectObject(car,true)[0];if(!hit)return null;
  const blockers=[tabletop,...model.children].filter(o=>o.isMesh&&o.visible&&o!==highlight&&o!==dropRing&&o.material.visible);
  const obstruction=ray.intersectObjects(blockers,false)[0];return !obstruction||obstruction.distance>=hit.distance-.5?hit:null;
}
function screenPoint(p,rect){const v=model.localToWorld(p.clone()).project(camera);return new THREE.Vector2((v.x*.5+.5)*rect.width+rect.left,(-v.y*.5+.5)*rect.height+rect.top);}
function dropTarget(e){const rect=setRay(e),hit=ray.intersectObject(road,false)[0];if(hit){model.worldToLocal(hit.point);let best=0,d=Infinity;pathSamples.forEach((p,i)=>{const n=p.distanceToSquared(hit.point);if(n<d){d=n;best=i;}});return {phase:best/720,point:pathSamples[best]};}let best=null,dist=Infinity;pathSamples.forEach((p,i)=>{const q=screenPoint(p,rect),d=Math.hypot(q.x-e.clientX,q.y-e.clientY);if(d<dist){dist=d;best=i;}});return dist<Math.max(12,rect.width/1400*26)?{phase:best/720,point:pathSamples[best]}:null;}
function updateSpeed(e){setRay(e);const p=new THREE.Vector3();if(ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-20),p)){model.worldToLocal(p);target=THREE.MathUtils.clamp(.3+(p.x+240)/315*2.9,.3,3.2);slider.value=String(target);sync(target>2.2?'速度有点危险。':'速度已调整。');}}
canvas.style.touchAction='none';canvas.style.cursor='grab';
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;setRay(e);tooltip.hidden=true;
  if(flight&&pickCar()){dismissGestureGuides();drag={kind:'car',plane:new THREE.Plane(new THREE.Vector3(0,1,0),-180),original:car.position.clone()};highlight.visible=true;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';sync('拖到赛道任意位置，松手继续跑。');return;}
  const control=ray.intersectObjects(controlHits,false)[0]?.object.userData.action;
  if(control==='reset'){dismissGestureGuides();restore();return;}if(control==='play'){toggle();return;}if(control==='speed'&&!flight){dismissGestureGuides();drag={kind:'speed'};updateSpeed(e);}else drag={kind:'orbit',x:e.clientX,yaw};
  canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';});
canvas.addEventListener('pointermove',e=>{setRay(e);if(drag?.kind==='orbit'){if(Math.abs(e.clientX-drag.x)>3)dismissGestureGuides();yaw=drag.yaw+(e.clientX-drag.x)*.006;model.rotation.y=yaw;model.updateWorldMatrix(true,true);return;}if(drag?.kind==='speed'){updateSpeed(e);return;}if(drag?.kind==='car'){const p=new THREE.Vector3();if(ray.ray.intersectPlane(drag.plane,p))car.position.copy(model.worldToLocal(p));const hit=dropTarget(e);dropRing.visible=!!hit;if(hit){dropRing.position.copy(hit.point);dropRing.position.y+=3;}return;}const action=ray.intersectObjects(controlHits,false)[0]?.object.userData.action;showTooltip(e,action);canvas.style.cursor=flight&&pickCar()?'grab':action?'pointer':'grab';});
function finish(e,cancel=false){if(drag?.kind==='car'){const hit=cancel?null:dropTarget(e);if(hit){restore(hit.phase%1,true);sync('已放回赛道，从这里继续跑。');}else{car.position.copy(drag.original);sync('还没放到赛道上，再捡一次。');}}drag=null;highlight.visible=dropRing.visible=false;tooltip.hidden=true;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);canvas.style.cursor='grab';if(!cancel){setRay(e);showTooltip(e,ray.intersectObjects(controlHits,false)[0]?.object.userData.action);}}
canvas.addEventListener('pointerup',e=>finish(e));canvas.addEventListener('pointercancel',e=>finish(e,true));canvas.addEventListener('pointerleave',()=>tooltip.hidden=true);
function crash(){
  const p=track.getPointAt(phase),t=track.getTangentAt(phase),horizontal=new THREE.Vector3(t.x,0,t.z).normalize();
  car.position.copy(p);car.rotation.set(0,-Math.atan2(t.z,t.x),0);
  flight={position:p.clone(),vx:horizontal.x*300,vz:horizontal.z*300,vy:190,age:0,settled:false};
  boostUntil=0;sync('脱轨了，小车会落到桌面。捡起它，放回赛道。');
}
function resize(){const r=canvas.getBoundingClientRect();viewportWidth=r.width;viewportHeight=r.height;renderer.setPixelRatio(devicePixelRatio||1);renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(1,r.height);orbitDistance=2050*Math.max(1/.46,1.35/camera.aspect)/1.5;camera.setViewOffset(r.width,r.height,0,-r.height*.13,r.width,r.height);camera.updateProjectionMatrix();updateCamera();}
new ResizeObserver(resize).observe(canvas);window.addEventListener('resize',resize);resize();
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();running=false;sync('3D 画面暂时不可用，请刷新或打开 Canvas 2D 备份。');});
function render(){renderer.clear();renderer.render(scene,camera);}
function tick(time){const dt=prev?Math.min((time-prev)/1000,.05):0;prev=time;
  if(!document.hidden&&(!document.body.dataset.page||document.body.dataset.page==='home')){
    pressRed+=(Number(time<resetUntil)-pressRed)*Math.min(1,dt*22);pressGreen+=(Number(running||time<pauseUntil)-pressGreen)*Math.min(1,dt*22);
    red.position.y=25-pressRed*6;green.position.y=13-pressGreen*6;knob.position.x=-240+(target-.3)/2.9*315;
    if(flight){if(drag?.kind!=='car'&&!flight.settled){
      flight.age+=dt;const p=flight.position;
      // Ballistic motion and friction; no generated pad or guided landing point.
      advanceFlight(flight,dt,buildingBounds);
      const onBase=p.x>=-355&&p.x<=355&&p.z>=-207&&p.z<=275;
      const floor=onBase?0:TABLE_Y;
      if(p.y<=floor&&flight.age>.2){p.y=floor;flight.vy=0;flight.vx*=Math.exp(-dt*9);flight.vz*=Math.exp(-dt*9);
        if(Math.hypot(flight.vx,flight.vz)<2){flight.vx=flight.vz=0;flight.settled=true;}
      }else car.rotateY(dt*2);
      car.position.copy(p);
    }}
    else {if(running){velocity+=(Math.max(target,time<boostUntil?3.6:target)-velocity)*Math.min(1,dt*3);phase=(phase+dt*.55*velocity/(Math.PI*2))%1;const a=track.getTangentAt((phase+.004)%1),b=track.getTangentAt((phase-.004+1)%1);risk=velocity>2.2&&a.angleTo(b)>.03?risk+dt:Math.max(0,risk-dt);if(risk>.22)crash();}
      if(!flight){const p=track.getPointAt(phase),forward=track.getTangentAt(phase).normalize(),side=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0)).normalize(),up=new THREE.Vector3().crossVectors(side,forward);car.position.copy(p).addScaledVector(up,1);car.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(forward,up,side));}}
    updateGestureGuides(time);updateBubbles();render();
  }requestAnimationFrame(tick);}
const fallback=document.createElement('details');fallback.className='keyboard-controls';fallback.innerHTML='<summary>键盘 / 备用控制</summary>';const host=document.querySelector('.controls');[document.querySelector('.play-row'),document.querySelector('label[for="speed"]'),slider,document.querySelector('.range-label'),boost].forEach(el=>fallback.append(el));host.append(fallback);
document.querySelector('.control-heading').innerHTML='<span>摸摸这个 3D 沙盘</span><span>↙</span>';document.querySelector('.hint').innerHTML='拖动空白处旋转视角。<br>长边滑块调速，红钮重置，绿钮播放。<br>飞出后，小车落到桌面，捡回赛道。';
const exportButton=document.createElement('button');exportButton.className='export-model';exportButton.textContent='保存模型 PNG ↗';host.append(exportButton);
exportButton.addEventListener('click',()=>{
  const ratio=renderer.getPixelRatio(),size=renderer.getSize(new THREE.Vector2()),aspect=camera.aspect,view={...camera.view},distance=orbitDistance;
  const cues=[...dragCues,...controlCues.map(cue=>cue.arrow)];
  try {
    cues.forEach(cue=>cue.visible=false);
    renderer.setPixelRatio(1);renderer.setSize(2800,1700,false);camera.clearViewOffset();camera.aspect=2800/1700;orbitDistance=2050;camera.updateProjectionMatrix();updateCamera();render();
    let link=document.querySelector('#hero-download');
    if(!link){link=document.createElement('a');link.id='hero-download';link.textContent='下载 PNG';link.style.cssText='display:block;font-size:11px;margin-top:8px';host.append(link);}
    link.download='hero-webgl-transparent.png';link.href=canvas.toDataURL('image/png');
  } finally {
    cues.forEach(cue=>cue.visible=!guidesFinished);
    camera.aspect=aspect;orbitDistance=distance;
    if(view.enabled)camera.setViewOffset(view.fullWidth,view.fullHeight,view.offsetX,view.offsetY,view.width,view.height);
    camera.updateProjectionMatrix();updateCamera();renderer.setPixelRatio(ratio);renderer.setSize(size.x,size.y,false);render();
  }
});
const backup=document.createElement('a');backup.href='backups/canvas2d-2026-10-14/index.html';backup.textContent='查看 Canvas 2D 备份 ↗';backup.className='backup-link';host.append(backup);
canvas.setAttribute('aria-label','WebGL 三维城市沙盘，空白处拖动旋转，实体滑块调速，红色按钮重置，绿色按钮播放或暂停。脱轨小车可拖回赛道。');canvas.dataset.renderer='webgl';canvas.dataset.guidance='visible';sync(reduced?'点击绿色按钮开始探索。':'小车正在绕圈。');requestAnimationFrame(tick);






