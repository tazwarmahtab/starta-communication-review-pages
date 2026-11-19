/* Starta Communication — procedural 3D phone renderer.
 * Actual extruded 3D chassis rendered by WebGL; no image impostor or external CDN.
 * Screen contents are illustrative and do not represent live service telemetry. */
(function(){
'use strict';
const VERT=`attribute vec3 a_pos;
attribute vec3 a_normal;
attribute vec2 a_uv;
attribute float a_mat;
uniform vec3 u_angles;
uniform vec3 u_offset;
uniform float u_scale;
uniform float u_aspect;
varying vec3 v_normal;
varying vec2 v_uv;
varying float v_mat;
void main(){
 vec3 p=a_pos*u_scale;
 float cy=cos(u_angles.y),sy=sin(u_angles.y),cx=cos(u_angles.x),sx=sin(u_angles.x),cz=cos(u_angles.z),sz=sin(u_angles.z);
 p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
 p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);
 p=vec3(p.x*cz-p.y*sz,p.x*sz+p.y*cz,p.z)+u_offset;
 vec3 n=a_normal;
 n=vec3(n.x*cy+n.z*sy,n.y,-n.x*sy+n.z*cy);
 n=vec3(n.x,n.y*cx-n.z*sx,n.y*sx+n.z*cx);
 n=vec3(n.x*cz-n.y*sz,n.x*sz+n.y*cz,n.z);
 v_normal=n;v_uv=a_uv;v_mat=a_mat;
 float depth=max(.25,4.35-p.z);
 gl_Position=vec4(p.x*2.3/u_aspect,p.y*2.3,depth*1.006-.202,depth);
}`;
const FRAG=`precision mediump float;
varying vec3 v_normal;varying vec2 v_uv;varying float v_mat;
uniform sampler2D u_screen;
void main(){
 vec3 n=normalize(v_normal);
 float light=.40+.60*max(0.,dot(n,normalize(vec3(-.5,.7,1.))));
 vec3 base=vec3(.20,.31,.34);
 if(v_mat<.5){
  base=mix(vec3(.08,.115,.15),vec3(.43,.55,.57),light);
  base+=pow(max(0.,n.x),12.)*.26;
 }else if(v_mat<1.5){
  base=vec3(.018,.027,.037)+light*.045;
 }else if(v_mat<2.5){
  vec3 screen=texture2D(u_screen,v_uv).rgb;
  base=screen*(.78+.22*light);
 }else{
  base=vec3(.11,.17,.21)+light*.06;
 }
 gl_FragColor=vec4(base,1.);
}`;
function shader(gl,type,source){
 const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'3D shader');
 return s;
}
function makeProgram(gl){
 const p=gl.createProgram();
 gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,VERT));
 gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,FRAG));
 gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'3D program');
 return p;
}
function outline(w,h,r,n=8){
 const out=[];
 for(const [cx,cy,start] of [[w/2-r,h/2-r,0],[-w/2+r,h/2-r,90],[-w/2+r,-h/2+r,180],[w/2-r,-h/2+r,270]]){
  for(let i=0;i<=n;i++){
   const a=(start+i*90/n)*Math.PI/180;
   out.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);
  }
 }
 return out;
}
function mesh(){
 const v=[],indices=[];let offset=0;
 function tri(a,b,c){for(const p of [a,b,c])v.push(...p)}
 function face(points,z,mat,norm,reverse=false,w=1,h=2){
  for(let i=0;i<points.length;i++){
   const a=points[i],b=points[(i+1)%points.length];
   const center=[0,0,z,...norm,.5,.5,mat];
   const va=[a[0],a[1],z,...norm,a[0]/w+.5,a[1]/h+.5,mat];
   const vb=[b[0],b[1],z,...norm,b[0]/w+.5,b[1]/h+.5,mat];
   if(reverse)tri(center,vb,va);else tri(center,va,vb);
  }
 }
 const outer=outline(.99,2.07,.14,10);
 face(outer,-.094,3,[0,0,-1],true);
 for(let i=0;i<outer.length;i++){
  const a=outer[i],b=outer[(i+1)%outer.length];
  const nx=(a[0]+b[0])/2,ny=(a[1]+b[1])/2,len=Math.hypot(nx,ny)||1;
  const normal=[nx/len,ny/len,.14];
  const v0=[a[0],a[1],-.094,...normal,0,0,0],v1=[b[0],b[1],-.094,...normal,1,0,0];
  const v2=[a[0],a[1],.094,...normal,0,1,0],v3=[b[0],b[1],.094,...normal,1,1,0];
  tri(v0,v2,v1);tri(v1,v2,v3);
 }
 face(outer,.095,1,[0,0,1],false);
 const inner=outline(.915,1.982,.112,12);
 face(inner,.099,2,[0,0,1],false,.915,1.982);
 // Side buttons are true 3D raised shapes, not lines painted onto the front.
 for(const y of [-.34,.38]){
  const a=[-.51,y-.12,-.01,-1,0,0,0,0,0],b=[-.51,y+.12,-.01,-1,0,0,0,1,0];
  const c=[-.51,y-.12,.055,-1,0,0,1,0,0],d=[-.51,y+.12,.055,-1,0,0,1,1,0];
  tri(a,c,b);tri(b,c,d);
 }
 return new Float32Array(v);
}
function screenTexture(mode){
 const el=document.createElement('canvas');el.width=512;el.height=1024;
 const c=el.getContext('2d'),w=512,h=1024;
 const palette={messaging:['#0d2d35','#123f48'],voice:['#102636','#173e58'],cpaas:['#0e3039','#1b5150']};
 const theme=palette[mode]||palette.messaging;
 const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,theme[0]);bg.addColorStop(1,theme[1]);c.fillStyle=bg;c.fillRect(0,0,w,h);
 c.fillStyle='rgba(124,240,206,.13)';c.beginPath();c.arc(430,170,210,0,Math.PI*2);c.fill();
 function text(s,x,y,size,color='#f0faf5',weight='500'){c.fillStyle=color;c.font=weight+' '+size+'px system-ui, sans-serif';c.fillText(s,x,y);}
 function round(x,y,width,height,r,color,stroke){
  c.beginPath();c.roundRect(x,y,width,height,r);c.fillStyle=color;c.fill();
  if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}
 }
 text('9:41',35,45,22,'#eff7f3','600');
 c.fillStyle='#dcf4ed';c.fillRect(412,28,12,14);c.fillRect(431,23,12,19);round(457,24,31,17,5,'#d8f2e8');
 round(185,15,142,26,18,'#051017');
 text('STARTA',32,128,38,'#f7fcf9','800');text('COMMUNICATION',34,156,14,'#a5cdc0','650');
 round(28,191,456,53,18,'rgba(255,255,255,.075)','rgba(178,244,215,.12)');
 text('DEMONSTRATION  /  NOT LIVE DATA',49,225,17,'#c9ede1','650');
 if(mode==='messaging'){
  text('Messaging',33,334,52,'#e8faf3','650');text('Conversation, designed with purpose.',34,372,21,'#a9cec3');
  round(34,432,342,119,22,'rgba(255,255,255,.09)');
  text('Authentication',56,473,25,'#e9fff5','600');text('A message with a clear use case',56,513,18,'#add0c7');
  round(132,586,347,119,22,'rgba(146,232,196,.20)');
  text('Transactional updates',155,633,24,'#e9fff5','600');text('Discuss the destination and volume',155,670,17,'#c5e7d9');
  round(34,755,444,94,20,'rgba(255,255,255,.07)','rgba(196,244,228,.15)');
  text('Requirements first',58,810,25,'#e8fff4','600');
 }else if(mode==='voice'){
  text('Voice',33,334,54,'#e8faf3','650');text('Built around a conversation.',34,373,21,'#a9cec3');
  for(let i=0;i<57;i++){let x=39+i*7.7,val=Math.abs(Math.sin(i*.48)*Math.cos(i*.19)),hh=20+val*170;
   c.fillStyle=i%3===0?'#b4edd9':'#5bbbaa';round(x,580-hh/2,4,hh,2,c.fillStyle);}
  round(34,734,443,114,21,'rgba(255,255,255,.08)','rgba(193,237,218,.12)');
  text('Destinations',55,773,23,'#effaf7','600');text('Traffic  ·  Interconnection',55,816,19,'#b3d4c9');
 }else{
  text('CPaaS',33,334,54,'#e8faf3','650');text('Interfaces for useful experiences.',34,374,20,'#a9cec3');
  const nodes=[[102,495,'APP'],[399,495,'API'],[253,677,'FIT']];
  c.strokeStyle='#6bbaa9';c.lineWidth=4;c.beginPath();c.moveTo(102,495);c.lineTo(399,495);c.lineTo(253,677);c.closePath();c.stroke();
  nodes.forEach(([x,y,label])=>{c.beginPath();c.arc(x,y,65,0,Math.PI*2);c.fillStyle='#194e50';c.fill();c.strokeStyle='#bce8d7';c.lineWidth=2;c.stroke();text(label,x-26,y+8,26,'#edfff6','700')});
  round(34,778,444,81,21,'rgba(255,255,255,.09)');
  text('Integration requirements',55,828,23,'#e8fff4','600');
 }
 text('Concept interface · Service availability subject to review',34,952,15,'#8eb4ae');
 return el;
}
function create(canvas){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,premultipliedAlpha:false});
 if(!gl)return null;
 const program=makeProgram(gl),array=mesh(),buf=gl.createBuffer(),tex=gl.createTexture();
 gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,array,gl.STATIC_DRAW);
 gl.useProgram(program);
 const stride=9*4;
 function attr(name,size,offset){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,stride,offset*4);}
 attr('a_pos',3,0);attr('a_normal',3,3);attr('a_uv',2,6);attr('a_mat',1,8);
 const uniforms={angles:gl.getUniformLocation(program,'u_angles'),offset:gl.getUniformLocation(program,'u_offset'),
 scale:gl.getUniformLocation(program,'u_scale'),aspect:gl.getUniformLocation(program,'u_aspect')};
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.uniform1i(gl.getUniformLocation(program,'u_screen'),0);
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
 let current='',disposed=false;
 function draw(progress,mode='messaging',state={}){
  if(disposed)return;
  let dpr=Math.min(window.devicePixelRatio||1,1.5),w=canvas.clientWidth||1,h=canvas.clientHeight||1;
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){
   canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  }
  gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  if(mode!==current){
   const img=screenTexture(mode);
   gl.bindTexture(gl.TEXTURE_2D,tex);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
   current=mode;
  }
  let p=Math.max(0,Math.min(1,progress));
  let mobile=w<720;
  let scale=mobile?.72:1.03;
  let rotate=.15+Math.sin(p*Math.PI*2)*.34;
  gl.uniform3f(uniforms.angles,-.07+Math.sin(p*Math.PI*1.7)*.11,rotate,.04*Math.sin(p*Math.PI*2.3));
  gl.uniform3f(uniforms.offset,mobile?0:.79,0,.0);
  gl.uniform1f(uniforms.scale,scale);
  gl.uniform1f(uniforms.aspect,w/Math.max(1,h));
  gl.drawArrays(gl.TRIANGLES,0,array.length/9);
 }
 function dispose(){if(disposed)return;disposed=true;gl.deleteTexture(tex);gl.deleteBuffer(buf);gl.deleteProgram(program);}
 return {draw,dispose,kind:'procedural-3d-webgl'};
}
window.StartaPhone3D={create};
})();