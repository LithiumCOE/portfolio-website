// CPU depth buffer for the fixed orthographic scene. Static geometry is cached;
// only the vehicle is rasterized per frame. No drawing-order heuristics or WebGL.
class CityDepthRenderer {
  constructor(canvas, project, depthOf = p => p[0]+p[1]+1.1316*p[2]) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.project=project;this.depthOf=depthOf;
    this.surface=document.createElement('canvas');
    this.surfaceCtx=this.surface.getContext('2d');this.colors=new Map();
    this.resize();
  }
  resize(exportWidth){
    const rect=this.canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
    // Match the actual contain-fitted drawing area, including Retina/HiDPI pixels.
    const fitted=Math.min(rect.width,rect.height*1400/850);
    const width=Math.max(1,Math.round(exportWidth||fitted*dpr)),height=Math.max(1,Math.round(width*850/1400));
    if(width===this.width&&height===this.height)return false;
    this.width=width;this.height=height;this.scale=width/1400;
    this.canvas.width=width;this.canvas.height=height;
    this.surface.width=width;this.surface.height=height;
    this.image=this.surfaceCtx.createImageData(width,height);
    this.depth=new Float32Array(width*height);this.depth.fill(-Infinity);
    return true;
  }
  vertex(p){const [x,y]=this.project(...p);return [x*this.scale,y*this.scale,this.depthOf(p)]}
  color(value){if(this.colors.has(value))return this.colors.get(value);const probe=document.createElement('canvas').getContext('2d');probe.fillStyle=value;probe.fillRect(0,0,1,1);const color=[...probe.getImageData(0,0,1,1).data];this.colors.set(value,color);return color}
  pixel(x,y,depth,color){const i=y*this.width+x;if(depth<this.depth[i]-.001)return;this.depth[i]=depth;const j=i*4;const data=this.image.data;if(color[3]===255){data[j]=color[0];data[j+1]=color[1];data[j+2]=color[2];data[j+3]=255;return}const alpha=color[3]/255,old=data[j+3]/255,out=alpha+old*(1-alpha);if(!out)return;for(let k=0;k<3;k++)data[j+k]=(color[k]*alpha+data[j+k]*old*(1-alpha))/out;data[j+3]=out*255}
  triangle(a,b,c,color){
    const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<.00001)return;
    const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(this.width-1,Math.ceil(Math.max(a[0],b[0],c[0])));
    const y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(this.height-1,Math.ceil(Math.max(a[1],b[1],c[1])));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const px=x+.5,py=y+.5;
      const u=((b[1]-c[1])*(px-c[0])+(c[0]-b[0])*(py-c[1]))/den;
      const v=((c[1]-a[1])*(px-c[0])+(a[0]-c[0])*(py-c[1]))/den,w=1-u-v;
      if(u>=-.00001&&v>=-.00001&&w>=-.00001)this.pixel(x,y,u*a[2]+v*b[2]+w*c[2],color);
    }
  }
  polygon(points,fill){const vertices=points.map(p=>this.vertex(p)),color=this.color(fill);for(let i=1;i<vertices.length-1;i++)this.triangle(vertices[0],vertices[i],vertices[i+1],color)}
  line(points,fill,width){const color=this.color(fill),radius=Math.max(.55,width*this.scale/2);for(let i=1;i<points.length;i++){
    const a=this.vertex(points[i-1]),b=this.vertex(points[i]);const dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy;
    const x0=Math.max(0,Math.floor(Math.min(a[0],b[0])-radius)),x1=Math.min(this.width-1,Math.ceil(Math.max(a[0],b[0])+radius));
    const y0=Math.max(0,Math.floor(Math.min(a[1],b[1])-radius)),y1=Math.min(this.height-1,Math.ceil(Math.max(a[1],b[1])+radius));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=len2?Math.max(0,Math.min(1,((x+.5-a[0])*dx+(y+.5-a[1])*dy)/len2)):0;if((x+.5-a[0]-t*dx)**2+(y+.5-a[1]-t*dy)**2<=radius*radius)this.pixel(x,y,a[2]+t*(b[2]-a[2])+.15,color)}
  }}
  cache(){this.staticDepth=this.depth.slice();this.staticImage=this.image.data.slice()}
  begin(){this.depth.set(this.staticDepth);this.image.data.set(this.staticImage)}
  present(){this.surfaceCtx.putImageData(this.image,0,0);this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.ctx.drawImage(this.surface,0,0,this.canvas.width,this.canvas.height)}
}
