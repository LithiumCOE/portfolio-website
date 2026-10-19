/** Toyota case-study motion follows the reasoning on each independent slide. */
export function mountToyotaMotion(host,{reduced}){
  const pages=[...host.querySelectorAll('.toyota-body-frame')],controllers=[];
  for(const page of pages){
    const canvas=page.querySelector('.toyota-ppt-canvas'),index=pages.indexOf(page);
    const q=id=>canvas.querySelector(`[data-node-id="279:${id}"]`);
    // Align each reasoning column around the same vertical center in its row.
    if(index===2){
      for(const [top,columns] of [[373,[[2522,2518],[2520],[2550,2524]]],[673,[[2523,2519],[2521],[2552,2525]]]]){
        columns.forEach((ids,column)=>{
          const group=document.createElement('div');group.className='toyota-centered-cell';
          group.style.cssText=`position:absolute;left:${[817,1193,1478][column]}px;top:${top}px;width:${[296,210,300][column]}px;height:233px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:18px`;
          ids.forEach(id=>{const node=q(id);if(!node)return;node.style.position='relative';node.style.left='auto';node.style.top='auto';node.style.lineHeight='1.4';group.append(node);});canvas.append(group);
        });
      }
    }
    let animations=[];
    const add=(node,frames,delay=0,duration=750)=>{if(node)animations.push(node.animate(frames,{delay,duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));};
    const reveal=(node,delay,x=0,y=16)=>add(node,[{opacity:0,translate:`${x}px ${y}px`},{opacity:1,translate:'0 0'}],delay);
    const wipe=(node,delay,duration=1100)=>add(node,[{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}],delay,duration);
    const clear=()=>{animations.forEach(a=>a.cancel());animations=[];};
    function play(){
      if(page.hidden)return;clear();if(reduced)return;
      const flatten=node=>[...node.children].flatMap(child=>child.style.display==='contents'?flatten(child):[child]);
      const children=flatten(canvas).filter(n=>parseFloat(n.style.top)>=195);
      for(const node of children){
        const id=Number(node.dataset.nodeId?.split(':')[1]),x=parseFloat(node.style.left)||0,y=parseFloat(node.style.top)||0;
        if(index===0){
          if(id===2359){wipe(node,650,1700);continue;}
          const stage=x>=1400?3:y>=780?2:y>=650?1:0;
          reveal(node,y<460?180:500+stage*450,0,14);
        }else if(index===1){
          const stage=x>=950?1:0;reveal(node,200+stage*450+Math.max(0,y-310)*.9,stage?24:-24,10);
        }else if(index===2){
          if([2510,2511].includes(id)){wipe(node,400+(y>600?200:0),1400);continue;}
          const stage=x>=1470?3:x>=1190?2:x>=810?1:0;reveal(node,250+stage*420+(y>650?150:0),stage? -20:0,12);
        }else if(index===3){
          if(id>=2578&&id<=2585){node.style.transformOrigin='left center';add(node,[{scale:'0 1',opacity:0},{scale:'1 1',opacity:1}],450+(y-400)*1.8,1100);continue;}
          if(id===2577)continue;
          reveal(node,x>=950?1050+Math.max(0,y-350)*1.5:350+Math.max(0,y-350)*1.5,0,12);
        }else if(index===4){
          if(id>=2646&&id<=2713){
            // All vector pieces of each car share the same timing and translation.
            const stage=id<2663?0:id<2680?1:id<2697?3:4;
            reveal(node,450+stage*260,-35,0);continue;
          }
          if([2714,2716,2715,2717,2741].includes(id)){wipe(node,600+(x-300)*.65,750);continue;}
          if(id===2645){wipe(node,350,1600);continue;}
          const stage=y<590?0:1;reveal(node,stage?1750+(x>1000?260:0)+(y-590)*1.2:400+(x/1700)*1000,0,16);
        }else if(index===5){
          if([2798,2821].includes(id)){wipe(node,id===2798?450:1600,1350);continue;}
          const stage=x>=1270?2:x>=830?1:0;reveal(node,250+stage*650+Math.max(0,y-360)*.8,stage? -18:0,12);
          if([2824,2825,2826,2827].includes(id)){node.style.transformOrigin='center';add(node,[{scale:'.88'},{scale:'1'}],1600+(y-550)*1.1,1000);}
        }else if(index===6){
          const stage=x>=990?1:0;
          if([2914,2921].includes(id)){reveal(node,250+stage*700,stage?30:-30,20);continue;}
          if(id===2922){wipe(node,1600,1000);continue;}
          reveal(node,650+stage*700+(y>300?160:0),0,12);
        }else{
          if(id===2928){reveal(node,200,0,25);continue;}
          const stage=x>=1300?2:x>=1000?1:0;reveal(node,900+stage*500,0,14);
        }
      }
    }
    const observer=new MutationObserver(()=>page.hidden?clear():play());observer.observe(page,{attributes:true,attributeFilter:['hidden']});
    controllers.push({play,destroy(){clear();observer.disconnect();}});
  }
  controllers.forEach(c=>c.play());
  return {play(){controllers.forEach(c=>c.play());},destroy(){controllers.forEach(c=>c.destroy());}};
}
