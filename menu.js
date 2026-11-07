/* NexoChat · menú contextual estilo iOS, reacciones y eliminar mensajes.
   Se carga DESPUÉS del script principal de index.html. */
(()=>{
const EM=['❤️','👍','👎','😂','‼️','❓'];
const R=m=>m&&m.r&&typeof m.r==='object'?m.r:{};
const has=m=>Object.keys(R(m)).length>0;
const rOf=r=>r.reactions&&typeof r.reactions==='object'?r.reactions:{};
const rHtml=r=>{const c={};Object.values(r).forEach(e=>c[e]=(c[e]||0)+1);return Object.entries(c).map(([e,n])=>n>1?`${e}<small>${n}</small>`:e).join('')};
const mk=(r,c)=>({...mm(r,c),r:rOf(r),del:!!r.deleted});
const el=id=>document.querySelector(`#msgs .b[data-i="${id}"]`);
const SP='cubic-bezier(.34,1.35,.64,1)';

/* ---------- Estilos ---------- */
const st=document.createElement('style');
st.textContent=`
.mo{position:absolute;inset:0;z-index:30;visibility:hidden;opacity:0;background:color-mix(in srgb,var(--bg) 40%,transparent);backdrop-filter:blur(20px) saturate(1.6);-webkit-backdrop-filter:blur(20px) saturate(1.6);transition:opacity .35s var(--e),visibility 0s .35s}
.mo.on{opacity:1;visibility:visible;transition-delay:0s}
.mc{position:absolute;left:0;right:0;display:flex;flex-direction:column;gap:10px;pointer-events:none}
.mc>*{pointer-events:auto}
.mc .b{animation:none;max-width:none;box-shadow:0 18px 44px var(--sh)}
.mc .b.me{box-shadow:inset 1px 1px 0 rgba(255,255,255,.4),0 18px 44px var(--sh)}
.b.lift{visibility:hidden}
.mgl{background:color-mix(in srgb,var(--s1) 82%,transparent);backdrop-filter:blur(26px) saturate(1.8);-webkit-backdrop-filter:blur(26px) saturate(1.8);border:1px solid var(--line);box-shadow:inset 1px 1px 0 var(--gh),0 16px 40px var(--sh)}
.rxb{display:flex;gap:2px;padding:6px;border-radius:30px;transform-origin:50% 100%;transition:opacity .3s var(--e),transform .4s var(--e)}
.rxb button{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-size:25px;line-height:1;transition:transform .35s var(--sp),background-color .25s}
.rxb button:active{transform:scale(1.4)}
.rxb button.sel{background:color-mix(in srgb,var(--red) 24%,transparent)}
.mc.dl2 .rxb{opacity:0;transform:scale(.8);pointer-events:none}
.am{min-width:220px;border-radius:20px;overflow:hidden;transform-origin:50% 0}
.am button{display:flex;align-items:center;justify-content:space-between;gap:18px;width:100%;padding:13px 16px;font-size:15px;text-align:left;transition:background-color .2s}
.am button+button{border-top:1px solid var(--line)}
.am button:active{background:color-mix(in srgb,var(--ink) 8%,transparent)}
.am .dg{color:var(--red)}
.b.dd>span{font-style:italic;opacity:.75}
.rxw small{font-size:10px;margin-left:2px;color:var(--mut)}
`;
document.head.appendChild(st);
const mo=document.createElement('div');mo.className='mo';mo.id='mo';VIEW.appendChild(mo);

/* ---------- Render de burbujas con reacciones y mensajes eliminados ---------- */
bub=function(m,cls){const q=m.del?null:qOf(m);
 return `<div class="b ${m.me?'me':'th'}${has(m)?' hr':''}${m.del?' dd':''} ${cls||''}" data-i="${m.id}">${q?`<div class="qt"><b>${esc(q.w)}</b><span>${esc(q.t)}</span></div>`:''}<span>${m.del?'🚫 Se eliminó este mensaje':esc(m.t)}</span><div class="mt2"><time>${hm(m.d)}</time>${m.me?sd(m.k):''}</div><div class="rxw">${rHtml(R(m))}</div></div>`};
rx=function(e,m){const w=e.querySelector('.rxw');w.innerHTML=rHtml(R(m));e.classList.toggle('hr',has(m));
 if(!calm&&has(m)){w.style.animation='none';void w.offsetWidth;w.style.animation=''}};

/* ---------- Carga y tiempo real con las columnas nuevas ---------- */
loadMsgs=async function(id,soft){const c=C.find(z=>z.id===id);if(!c)return;
 const {data,error}=await sb.from('messages').select('id,sender_id,body,reply_to,created_at,read_at,reactions,deleted,hidden_for').eq('conversation_id',id).order('id',{ascending:false}).limit(200);
 if(error){console.error(error);toast('No se pudieron cargar los mensajes');return}
 if(curId!==id||!OPEN)return;if(soft&&MS.some(m=>m.id<0))return;
 const nm=data.filter(r=>!(r.hidden_for||[]).includes(ME.id)).reverse().map(r=>mk(r,c)),
  sig=a=>a.map(m=>m.id+m.k+JSON.stringify(R(m))+(m.del?1:0)).join();
 if(soft&&sig(nm)===sig(MS))return;
 const box=$('msgs'),near=!soft||box.scrollHeight-box.scrollTop-box.clientHeight<160;
 MS=nm;renderMsgs();if(near)box.scrollTop=box.scrollHeight};
onMsg=function(r){if(!ME||r.sender_id===ME.id)return;
 const c=C.find(z=>z.id===r.conversation_id);if(!c){loadChats();return}
 c.last=r.body;c.ls=r.sender_id;c.at=r.created_at;
 if(OPEN&&curId===c.id){if(!MS.some(x=>x.id===r.id)){const m=mk(r,c);MS.push(m);addEl(m,'rc')}setTyping(false);if(document.hidden)c.u++;else markRead()}else c.u++;
 bump(c)};
onUpd=function(r){if(!ME||!OPEN||curId!==r.conversation_id)return;const e=el(r.id);
 if((r.hidden_for||[]).includes(ME.id)){MS=MS.filter(x=>x.id!==r.id);if(e)e.remove();return}
 const m=MS.find(x=>x.id===r.id);if(!m)return;
 m.k=r.read_at?'r':'s';m.r=rOf(r);
 if(r.deleted&&!m.del){m.del=true;m.t=r.body;m.r={};const sw=()=>{const y=el(r.id);if(y)y.outerHTML=bub(m)};if(e&&window.nxBoom)window.nxBoom(e,false,sw);else sw();loadChats();return}
 if(!e)return;if(m.me)setK(e,m,m.k);rx(e,m)};
const _open=open;open=function(...a){closeMenu();return _open.apply(this,a)};

/* ---------- Acciones ---------- */
function react(m,e){if(m.id<0||m.del)return;const prev=R(m),n={...prev};
 if(e)n[ME.id]=e;else delete n[ME.id];m.r=n;const x=el(m.id);if(x)rx(x,m);
 sb.rpc('react_message',{p_id:m.id,p_emoji:e||''}).then(({error})=>{
  if(error){console.error(error);m.r=prev;const y=el(m.id);if(y)rx(y,m);toast('No se pudo reaccionar')}})}
async function copy(t){try{await navigator.clipboard.writeText(t)}catch(_){
  const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();
  try{document.execCommand('copy')}catch(__){}a.remove()}toast('Copiado')}
async function del(m,all){const x=el(m.id);
 if(all){const o={t:m.t,r:m.r};m.del=true;m.t='Mensaje eliminado';m.r={};
  const sw=()=>{const y=el(m.id);if(y)y.outerHTML=bub(m)};if(x&&window.nxBoom)window.nxBoom(x,false,sw);else sw();
  const {error}=await sb.rpc('delete_message',{p_id:m.id,p_all:true});
  if(error){console.error(error);Object.assign(m,{del:false,t:o.t,r:o.r});const y=el(m.id);if(y)y.outerHTML=bub(m);toast('No se pudo eliminar');return}
  loadChats()}
 else{const fin=()=>{MS=MS.filter(z=>z.id!==m.id);const y=el(m.id);
   if(y){const p=y.previousElementSibling,n=y.nextElementSibling;y.remove();if(p&&p.classList.contains('day')&&(!n||n.classList.contains('day')))p.remove()}
   if(!MS.length)renderMsgs()};
  if(x&&window.nxBoom)window.nxBoom(x,true,fin);else fin();
  const {error}=await sb.rpc('delete_message',{p_id:m.id,p_all:false});
  if(error){console.error(error);toast('No se pudo eliminar');if(curId)loadMsgs(curId)}}}

/* ---------- Menú ---------- */
const ic={
 re:'<svg class="i" viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>',
 cp:'<svg class="i" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/></svg>',
 tr:'<svg class="i" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',
 x:'<svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>'};
function fill(am,m,step){const b=(a,t,i,red)=>`<button data-a="${a}"${red?' class="dg"':''}><span>${t}</span>${ic[i]}</button>`;
 am.innerHTML=step?(m.me&&!m.del?b('all','Eliminar para todos','tr',1):'')+b('me','Eliminar para mí','tr',1)+b('x','Cancelar','x')
  :m.del?b('me','Eliminar para mí','tr',1)
  :b('re','Responder','re')+b('cp','Copiar','cp')+b('del','Eliminar','tr',1)}
let MN=null;
function openMenu(b){if(MN||!ME||!OPEN)return;const m=MS.find(x=>x.id==b.dataset.i);if(!m||m.id<0)return;
 mo.innerHTML='';
 const v=VIEW.getBoundingClientRect(),r=b.getBoundingClientRect(),mine=m.me,
  al=`align-self:${mine?'flex-end':'flex-start'};margin-${mine?'right':'left'}:${Math.max(8,mine?v.right-r.right:r.left-v.left)}px`;
 const mc=document.createElement('div');mc.className='mc';
 const t=document.createElement('div');t.innerHTML=bub(m);const gh=t.firstChild;gh.removeAttribute('data-i');
 gh.style.cssText=`${al};width:${r.width}px;box-sizing:border-box`;
 const bar=document.createElement('div');
 if(!m.del){bar.className='rxb mgl';bar.style.cssText=al;
  bar.innerHTML=EM.map(e=>`<button data-e="${e}"${R(m)[ME.id]===e?' class="sel"':''} aria-label="${e}">${e}</button>`).join('');mc.appendChild(bar)}
 const am=document.createElement('div');am.className='am mgl';am.style.cssText=al;fill(am,m,0);
 mc.append(gh,am);mo.appendChild(mc);mo.classList.add('on');
 const bh=m.del?0:bar.offsetHeight+10,H=mc.offsetHeight;
 const top=Math.max(76,Math.min(r.top-v.top-bh,v.height-H-14));mc.style.top=top+'px';
 const dy=(r.top-v.top)-(top+bh);
 b.classList.add('lift');MN={id:m.id,m,mc,am,at:Date.now()};
 navigator.vibrate&&navigator.vibrate(12);
 if(!calm){
  gh.animate([{transform:`translate3d(0,${dy}px,0)`},{transform:'none'}],{duration:520,easing:SP});
  if(!m.del)bar.animate([{opacity:0,transform:'scale(.5)'},{opacity:1,transform:'none'}],{duration:480,easing:SP,delay:50,fill:'backwards'});
  am.animate([{opacity:0,transform:'scale(.7)'},{opacity:1,transform:'none'}],{duration:480,easing:SP,delay:90,fill:'backwards'})}}
function closeMenu(){if(!MN)return;const n=MN;MN=null;mo.classList.remove('on');
 const e=el(n.id);if(e)e.classList.remove('lift');
 setTimeout(()=>{if(!MN)mo.innerHTML=''},calm?0:380)}

mo.addEventListener('pointerdown',e=>{if(e.target===mo&&MN&&Date.now()-MN.at>300)closeMenu()});
mo.addEventListener('click',e=>{if(!MN)return;const b=e.target.closest('button');if(!b)return;const m=MN.m;
 if(b.dataset.e){closeMenu();react(m,R(m)[ME.id]===b.dataset.e?'':b.dataset.e);return}
 const a=b.dataset.a;
 if(a==='re'){closeMenu();setReply(m)}
 else if(a==='cp'){closeMenu();copy(m.t)}
 else if(a==='del'){fill(MN.am,m,1);MN.mc.classList.add('dl2')}
 else if(a==='all'){closeMenu();del(m,true)}
 else if(a==='me'){closeMenu();del(m,false)}
 else closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&MN){e.stopImmediatePropagation();closeMenu()}},true);

/* ---------- Mantener pulsado (o clic derecho en PC) ---------- */
let LP=0,lx=0,ly=0;
MSG.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.button)return;const b=e.target.closest('.b');if(!b)return;
 lx=e.clientX;ly=e.clientY;clearTimeout(LP);
 LP=setTimeout(()=>{LP=0;if(G&&G.on)return;G=null;openMenu(b)},380)});
MSG.addEventListener('pointermove',e=>{if(LP&&(Math.abs(e.clientX-lx)>8||Math.abs(e.clientY-ly)>8)){clearTimeout(LP);LP=0}});
['pointerup','pointercancel'].forEach(t=>MSG.addEventListener(t,()=>{clearTimeout(LP);LP=0}));
MSG.addEventListener('contextmenu',e=>{e.preventDefault();const b=e.target.closest('.b');if(b)openMenu(b)});

/* ---------- Doble toque = ❤️ (ahora con el sistema de reacciones) ---------- */
let tq=0,ti=-1;
VIEW.addEventListener('click',e=>{if(sup||MN)return;const b=e.target.closest('#msgs .b');if(!b)return;e.stopPropagation();
 const i=+b.dataset.i,n=Date.now();
 if(i===ti&&n-tq<350){tq=0;const m=MS.find(x=>x.id===i);if(!m||m.id<0||m.del)return;
  const h=R(m)[ME.id]==='❤️';react(m,h?'':'❤️');if(!h)burst(e.clientX,e.clientY);return}
 tq=n;ti=i},true);
})();
