/* NexoChat · animaciones: el mensaje sale volando del campo de texto (estilo iMessage)
   y al eliminarlo explota en partículas. Cargar DESPUÉS de menu.js.
   Solo usa transform/opacity y un único canvas que se destruye al terminar. */
(()=>{
const SPR='cubic-bezier(.34,1.3,.5,1)';
const st=document.createElement('style');
st.textContent=`.fly{position:fixed;left:0;top:0;margin:0!important;max-width:none!important;box-sizing:border-box;z-index:60;pointer-events:none;will-change:transform,opacity;animation:none!important}
.fx2{position:fixed;z-index:61;pointer-events:none}
.b.dd{animation:ddf .4s var(--e) both}
@keyframes ddf{from{opacity:0}}`;
document.head.appendChild(st);

/* ---------- Envío: la burbuja nace en el campo de texto y vuela a su sitio ---------- */
const _add=addEl;
addEl=function(m,cls){
 if(cls!=='sn'||calm)return _add(m,cls);
 const box=$('msgs'),ip=$('inp').getBoundingClientRect(),el=_add(m,'');
 if(!el)return el;
 el.style.visibility='hidden';
 const r=el.getBoundingClientRect(),
  sc=Math.max(0,box.scrollHeight-box.clientHeight)-box.scrollTop,   /* cuánto va a bajar la lista */
  ty=r.top-sc,tx=r.left,
  dx=(ip.left-13)-tx,dy=(ip.top+ip.height/2)-(ty+r.height/2);
 const t=document.createElement('div');t.innerHTML=bub(m);const f=t.firstChild;
 f.removeAttribute('data-i');f.classList.add('fly');
 f.style.cssText=`left:${tx}px;top:${ty}px;width:${r.width}px`;
 document.body.appendChild(f);
 const a=f.animate([
  {transform:`translate3d(${dx}px,${dy}px,0) scale(.92)`,opacity:0},
  {opacity:1,offset:.14},
  {transform:'translate3d(0,0,0) scale(1)',opacity:1}],{duration:560,easing:SPR});
 a.onfinish=a.oncancel=()=>{el.style.visibility='';f.remove()};
 return el};

/* ---------- Eliminar: explosión de partículas ---------- */
function spawn(r,cols){
 const PAD=130,W=r.width+PAD*2,H=r.height+PAD*2,dpr=Math.min(devicePixelRatio||1,2);
 const cv=document.createElement('canvas');cv.className='fx2';cv.width=W*dpr;cv.height=H*dpr;
 cv.style.cssText=`left:${r.left-PAD}px;top:${r.top-PAD}px;width:${W}px;height:${H}px`;
 document.body.appendChild(cv);
 const x=cv.getContext('2d');x.scale(dpr,dpr);
 const n=Math.max(40,Math.min(150,Math.round(r.width*r.height/45))),cx=W/2,cy=H/2,P=[];
 for(let i=0;i<n;i++){
  const px=PAD+Math.random()*r.width,py=PAD+Math.random()*r.height,
   a=Math.atan2(py-cy,px-cx)+(Math.random()-.5)*.9,s=60+Math.random()*150;
  P.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s-Math.random()*70,s:1.4+Math.random()*3.2,l:.5+Math.random()*.55,c:i%cols.length})}
 const t0=performance.now();let last=t0,end=false;
 const ring=Math.max(r.width,r.height)*.55;
 const loop=now=>{
  const dt=Math.min((now-last)/1000,.034),t=(now-t0)/1000;last=now;
  x.clearRect(0,0,W,H);
  if(t<.28){const k=t/.28;x.globalAlpha=(1-k)*.5;x.lineWidth=2.5*(1-k)+.5;x.strokeStyle=cols[0];
   x.beginPath();x.ellipse(cx,cy,r.width*.5+ring*k,r.height*.5+ring*k*.6,0,0,6.283);x.stroke();x.globalAlpha=1}
  const bk=cols.map(()=>[]),dr=Math.pow(.18,dt);let alive=0;
  for(const p of P){if(t>=p.l)continue;alive++;
   p.vx*=dr;p.vy=p.vy*dr+420*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;bk[p.c].push(p)}
  bk.forEach((b,i)=>{if(!b.length)return;x.fillStyle=cols[i];x.beginPath();
   for(const p of b){const q=p.s*(1-t/p.l);if(q<.2)continue;x.moveTo(p.x+q,p.y);x.arc(p.x,p.y,q,0,6.283)}x.fill()});
  if(alive&&!end)requestAnimationFrame(loop);else cv.remove()};
 requestAnimationFrame(loop);
 setTimeout(()=>{end=true;cv.remove()},1400)}

function squash(el,done){
 const cs=getComputedStyle(el),h=el.getBoundingClientRect().height,gap=parseFloat(getComputedStyle(el.parentNode).rowGap)||0;
 el.style.overflow='hidden';el.style.boxSizing='border-box';
 el.animate([
  {height:h+'px',paddingTop:cs.paddingTop,paddingBottom:cs.paddingBottom,marginBottom:cs.marginBottom},
  {height:'0px',paddingTop:'0px',paddingBottom:'0px',marginBottom:-gap+'px'}],
  {duration:280,easing:'cubic-bezier(.32,.72,0,1)',fill:'forwards'}).onfinish=()=>done&&done()}

/* nxBoom(burbuja, ¿cerrar hueco?, qué hacer al terminar) */
window.nxBoom=function(el,collapse,done){
 if(calm||!el||!el.isConnected){done&&done();return}
 const r=el.getBoundingClientRect(),cs=getComputedStyle(el),
  cols=el.classList.contains('me')?['#FF4A63','#D02240','#FF8FA0','#FFFFFF']:[cs.backgroundColor,cs.backgroundColor,cs.color,cs.color];
 el.animate([
  {transform:'scale(1)',opacity:1},
  {transform:'scale(1.07)',opacity:1,offset:.42},
  {transform:'scale(1.2)',opacity:0}],{duration:260,easing:'cubic-bezier(.2,.8,.3,1)',fill:'forwards'});
 navigator.vibrate&&navigator.vibrate(8);
 setTimeout(()=>spawn(r,cols),105);
 setTimeout(()=>collapse?squash(el,done):done&&done(),250)};

})();
