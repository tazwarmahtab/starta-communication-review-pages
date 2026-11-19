/* Starta — a continuous scroll-driven narrative, built around the procedural 3D phone.
 * All globe arcs, screens and signals are explicitly conceptual; no live routes.
 * V4 hero DOM, phone choreography and composition are never rewritten here. */
(function(){
'use strict';
const reduced=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
function mount(){
 const home=document.getElementById('home');
 const story=document.getElementById('story');
 const solutions=document.getElementById('solutions');
 if(!home||!story||!solutions||document.querySelector('[data-cinema-journey]'))return;
 const scenes=[
  {tag:'01 / THE SIGNAL',title:'Every connection begins with a moment.',body:'A need to communicate becomes a possibility. First, understand who needs to reach whom.',mode:'messaging'},
  {tag:'02 / GLOBAL OUTLOOK',title:'Distance becomes part of the conversation.',body:'Markets, expectations and technical fit shape international discussions. Every line here is illustrative, not a verified service route.',mode:'messaging'},
  {tag:'03 / MESSAGING',title:'Small messages. Meaningful moments.',body:'Explore authentication, transactional updates and consent-based messaging around the actual requirements.',mode:'messaging'},
  {tag:'04 / VOICE',title:'Give every conversation its context.',body:'Discuss destinations, traffic and interconnection needs before evaluating a wholesale voice opportunity.',mode:'voice'},
  {tag:'05 / CPAAS',title:'Bring communication into the experience.',body:'Build the discussion around an application, an integration and the people it needs to serve.',mode:'cpaas'},
  {tag:'06 / NEXT STEP',title:'The next connection begins with clarity.',body:'Share your requirements. Starta can explore potential options without making unverified coverage or performance promises.',mode:'cpaas'}
 ];
 const section=document.createElement('section');
 section.className='cinema-journey';section.dataset.cinemaJourney='';
 section.id='cinematic-journey';section.setAttribute('aria-label','Illustrative scroll-driven Starta communication story');
 const stage=document.createElement('div');stage.className='cinema-stage';
 const back=document.createElement('div');back.className='cinema-back';
 const atmospheric=document.createElement('canvas');atmospheric.className='cinema-atmosphere';
 atmospheric.setAttribute('aria-hidden','true');
 const phone=document.createElement('canvas');phone.className='cinema-phone';
 phone.setAttribute('aria-hidden','true');phone.setAttribute('data-starta-3d-phone','');
 const unsupported=document.createElement('div');unsupported.className='cinema-phone-fallback';
 unsupported.setAttribute('aria-hidden','true');
 unsupported.innerHTML='<div class="cinema-fallback-device"><div class="cinema-fallback-notch"></div><span>STARTA</span><strong>MESSAGING<br>VOICE<br>CPAAS</strong><small>ILLUSTRATIVE SCREEN</small></div>';
 const header=document.createElement('div');header.className='cinema-header';
 header.innerHTML='<span>STARTA / THE ART OF CONNECTION</span><span class="cinema-count">01 — 06</span>';
 const chapters=document.createElement('div');chapters.className='cinema-chapters';
 scenes.forEach((s,i)=>{
  const a=document.createElement('article');
  a.className='cinema-chapter';a.dataset.cinemaScene=String(i);
  a.setAttribute('aria-label',s.tag);
  const k=document.createElement('p');k.className='cinema-kicker';k.textContent=s.tag;
  const h=document.createElement('h2');h.textContent=s.title;
  const b=document.createElement('p');b.className='cinema-description';b.textContent=s.body;
  a.append(k,h,b);
  if(i===5){const link=document.createElement('a');link.href='contact.html';link.className='cinema-link';link.textContent='Explore a conversation ↗';a.append(link)}
  chapters.append(a);
 });
 const footer=document.createElement('div');footer.className='cinema-footer';
 footer.innerHTML='<span>CONCEPTUAL VISUALIZATION · NO NETWORK COVERAGE CLAIM</span><span>SCROLL TO DISCOVER <span aria-hidden="true">↓</span></span>';
 const bar=document.createElement('div');bar.className='cinema-progress';
 const fill=document.createElement('span');bar.append(fill);
 stage.append(back,atmospheric,phone,unsupported,header,chapters,footer,bar);
 section.append(stage);
 home.insertAdjacentElement('afterend',section);
 const gl=window.StartaPhone3D?.create(phone)||null;
 if(!gl)section.classList.add('cinema-no-webgl');
 let ctx=atmospheric.getContext('2d',{alpha:true});
 let W=1,H=1,dpr=1,painting=false,last=0,inView=false,chapter=-1;
 const articles=[...section.querySelectorAll('[data-cinema-scene]')];
 const count=section.querySelector('.cinema-count');
 const mobile=()=>window.innerWidth<=720;
 let portrait=mobile(),staticMode=reduced();
 section.classList.toggle('cinema-reduced',staticMode);
 if(staticMode){articles.forEach(a=>a.removeAttribute('aria-hidden'));}
 function resize(){
  const w=stage.clientWidth||window.innerWidth,h=stage.clientHeight||window.innerHeight;
  W=Math.max(1,w);H=Math.max(1,h);portrait=mobile();
  dpr=Math.min(window.devicePixelRatio||1,1.5);
  if(ctx){atmospheric.width=Math.round(W*dpr);atmospheric.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  render();
 }
 function arc(cx,cy,rx,ry,a,b,opacity){
  if(!ctx)return;
  ctx.strokeStyle='rgba(151,236,215,'+opacity+')';ctx.lineWidth=1.05;
  ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,a,b);ctx.stroke();
 }
 function glow(x,y,r,color){
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
 }
 function projected(lat,lon,spin,cx,cy,r){
  const a=lat*Math.PI/180,b=(lon+spin)*Math.PI/180;
  return {x:cx+r*Math.cos(a)*Math.sin(b),y:cy-r*Math.sin(a),visible:Math.cos(a)*Math.cos(b)>.02};
 }
 function drawGlobe(t,alpha){
  if(!ctx||alpha<.003)return;
  const cx=W*(portrait?.52:.72),cy=H*(portrait?.37:.53);
  const radius=Math.min(W*(portrait?.46:.31),H*(portrait?.33:.41));
  ctx.save();ctx.globalAlpha=alpha;
  glow(cx,cy,radius*1.5,'rgba(52,158,178,.19)');
  const gradient=ctx.createRadialGradient(cx-radius*.3,cy-radius*.3,5,cx,cy,radius);
  gradient.addColorStop(0,'#267481');gradient.addColorStop(.65,'#0c3449');gradient.addColorStop(1,'#031824');
  ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.clip();
  for(let lat=-75;lat<=75;lat+=15){
   ctx.beginPath();let drawing=false;
   for(let lon=-180;lon<=180;lon+=3){const p=projected(lat,lon,t*55,cx,cy,radius);
    if(!p.visible){drawing=false;continue;}
    if(!drawing){ctx.moveTo(p.x,p.y);drawing=true;}else ctx.lineTo(p.x,p.y);
   }
   ctx.strokeStyle='rgba(188,249,230,.19)';ctx.lineWidth=1;ctx.stroke();
  }
  for(let lon=-180;lon<=180;lon+=18){
   ctx.beginPath();let drawing=false;
   for(let lat=-90;lat<=90;lat+=3){const p=projected(lat,lon,t*55,cx,cy,radius);
    if(!p.visible){drawing=false;continue;}
    if(!drawing){ctx.moveTo(p.x,p.y);drawing=true;}else ctx.lineTo(p.x,p.y);
   }
   ctx.strokeStyle='rgba(172,241,223,.16)';ctx.lineWidth=1;ctx.stroke();
  }
  // Abstract points and routes intentionally do not map real service coverage.
  const routes=[[[26,-33],[8,25]],[[8,25],[-22,68]],[[-24,-20],[24,58]],[[40,-15],[-33,19]]];
  for(let i=0;i<routes.length;i++){
   const a=projected(routes[i][0][0],routes[i][0][1],t*55,cx,cy,radius);
   const b=projected(routes[i][1][0],routes[i][1][1],t*55,cx,cy,radius);
   if(!a.visible||!b.visible)continue;
   const midx=(a.x+b.x)/2,midy=(a.y+b.y)/2-radius*.17;
   ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(midx,midy,b.x,b.y);
   ctx.strokeStyle='rgba(175,255,220,.65)';ctx.lineWidth=1.5;ctx.stroke();
   const u=(t*1.3+i*.22)%1,x=(1-u)*(1-u)*a.x+2*(1-u)*u*midx+u*u*b.x,
         y=(1-u)*(1-u)*a.y+2*(1-u)*u*midy+u*u*b.y;
   glow(x,y,17,'rgba(183,255,223,.58)');
   ctx.fillStyle='#ccffe9';ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
  arc(cx,cy,radius*1.08,radius*1.08,0,Math.PI*2,.19);
  ctx.restore();
 }
 function drawSignal(t,alpha){
  if(!ctx||alpha<.005)return;
  const x=W*(portrait?.5:.72),y=H*(portrait?.35:.5);
  const r=Math.min(W*.35,H*.44);
  ctx.save();ctx.globalAlpha=alpha;
  glow(x,y,r*1.8,'rgba(89,181,164,.29)');
  for(let i=0;i<6;i++){
   ctx.beginPath();ctx.arc(x,y,r*(.12+i*.155+t*.06),-Math.PI*.7,Math.PI*.7);
   ctx.strokeStyle='rgba(173,241,217,'+(.42-i*.055)+')';ctx.lineWidth=1.5;ctx.stroke();
  }
  glow(x,y,34,'rgba(214,255,231,.52)');ctx.restore();
 }
 function drawAtmosphere(progress){
  if(!ctx)return;
  ctx.clearRect(0,0,W,H);
  const beat=progress*scenes.length,signal=clamp(1-Math.abs(beat-.2)*1.2);
  const globe=clamp(1-Math.abs(beat-1.5)*.85);
  drawSignal(progress,signal);
  drawGlobe(progress,globe);
  if(globe>.05){
   ctx.fillStyle='rgba(170,235,222,'+(.28*globe)+')';ctx.font='600 11px system-ui';
   ctx.fillText('GLOBAL OUTLOOK · ILLUSTRATIVE',W*(portrait?.13:.54),H*(portrait?.73:.83));
  }
 }
 function render(){
  painting=false;
  if(staticMode)return;
  const rect=section.getBoundingClientRect(),length=Math.max(1,section.offsetHeight-window.innerHeight);
  let progress=clamp(-rect.top/length),segment=progress*(scenes.length-1),
      index=Math.min(scenes.length-1,Math.floor(segment+.5));
  fill.style.transform='scaleX('+progress.toFixed(4)+')';
  if(index!==chapter){
   chapter=index;count.textContent=String(index+1).padStart(2,'0')+' — 06';
   articles.forEach((a,i)=>{a.classList.toggle('is-active',i===index);a.setAttribute('aria-hidden',i===index?'false':'true');});
  }
  section.style.setProperty('--cinema-beat',segment.toFixed(3));
  section.style.setProperty('--cinema-phone-alpha',String(clamp(1-Math.max(0,segment-3.65)*.65)));
  const scene=scenes[index];
  if(gl)gl.draw(progress,scene.mode);
  drawAtmosphere(progress);
  last=progress;
 }
 function schedule(){
  if(!painting&&!staticMode&&inView){painting=true;requestAnimationFrame(render);}
 }
 const observer=new IntersectionObserver(entries=>{
  inView=entries.some(e=>e.isIntersecting);
  if(inView){resize();schedule();}
 },{rootMargin:'200px 0px 200px 0px'});
 observer.observe(section);
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',()=>{resize();schedule();},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
 window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',()=>{
  staticMode=reduced();section.classList.toggle('cinema-reduced',staticMode);
  articles.forEach(a=>a.removeAttribute('aria-hidden'));
  resize();
 });
 resize();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
})();