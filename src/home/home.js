/* Dashboard: 3D engine room behind frosted cards. Programs open in frames that stay alive, so a simulator keeps running while you are on the home page. */
import {PROGRAMS} from './programs.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const phone=/Android/i.test(navigator.userAgent)||(matchMedia('(pointer:coarse)').matches&&Math.min(innerWidth,innerHeight)<560);
const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
const cores=navigator.hardwareConcurrency||4,mem=navigator.deviceMemory||4;
const tier=new URLSearchParams(location.search).get('tier')||(phone?(cores>=8&&mem>=6?'mid':'low'):(cores>=6?'high':'mid'));

/* cards */
$('#cards').innerHTML=PROGRAMS.map(p=>`<article class="card glass${p.soon?' soon':''}" data-id="${p.id}"><div class="sheen"></div><div class="cardTop"><span class="ico">${p.icon}</span><div><h2>${p.name}</h2><p class="mdl">${p.models}</p></div><span class="stat" id="st_${p.id}" hidden></span></div><p class="dsc">${p.desc}</p>${p.soon?'<span class="tag">Coming soon</span>':`<button class="launch mag" data-open="${p.id}" aria-label="Launch ${p.name}"><span>Launch</span></button>`}</article>`).join('');

/* magnetic pull: a button leans toward the pointer as it comes near, and springs back */
const mags=$$('.mag').map(el=>({el,x:0,y:0,tx:0,ty:0,vx:0,vy:0}));
let pmx=-9999,pmy=-9999;
addEventListener('pointermove',e=>{pmx=e.clientX;pmy=e.clientY;if(scene)scene.setPointer(e.clientX/innerWidth*2-1,e.clientY/innerHeight*2-1);for(const c of $$('.card')){const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');}},{passive:true});
addEventListener('pointerout',e=>{if(!e.relatedTarget){pmx=-9999;}},{passive:true});
function magTick(){for(const m of mags){const r=m.el.getBoundingClientRect(),cx=r.left-m.x+r.width/2,cy=r.top-m.y+r.height/2,dx=pmx-cx,dy=pmy-cy,d=Math.hypot(dx,dy),R=Math.max(r.width,120)*1.25;const k=d<R?Math.pow(1-d/R,1.4)*.55:0;m.tx=dx*k;m.ty=dy*k;m.vx=(m.vx+(m.tx-m.x)*.16)*.72;m.vy=(m.vy+(m.ty-m.y)*.16)*.72;m.x+=m.vx;m.y+=m.vy;m.el.style.transform=`translate(${m.x.toFixed(1)}px,${m.y.toFixed(1)}px)`;const s=m.el.firstElementChild;if(s)s.style.transform=`translate(${(m.x*.35).toFixed(1)}px,${(m.y*.35).toFixed(1)}px)`;}if(!stageOpen)requestAnimationFrame(magTick);else magOn=false;}
let magOn=false;const magGo=()=>{if(!magOn&&!still){magOn=true;requestAnimationFrame(magTick);}};
/* touch has no hover, so the button pops toward the finger instead */
for(const m of mags){m.el.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'){const r=m.el.getBoundingClientRect();m.vx+=(e.clientX-r.left-r.width/2)*.3;m.vy+=(e.clientY-r.top-r.height/2)*.3;}});}

/* program frames */
const frames={};let stageOpen=false,current=null;
function open(id,from){const p=PROGRAMS.find(x=>x.id===id);if(!p||p.soon)return;let f=frames[id];if(!f){f=document.createElement('iframe');f.title=p.name;f.src=(phone?p.phone:p.page)+'?app=1';f.allow='autoplay';frames[id]=f;$('#stage').append(f);}
 for(const k in frames)frames[k].classList.toggle('on',k===id);
 if(from){const r=from.getBoundingClientRect();$('#stage').style.setProperty('--ox',(r.left+r.width/2)+'px');$('#stage').style.setProperty('--oy',(r.top+r.height/2)+'px');}
 $('#stage').classList.add('open');stageOpen=true;current=id;mark(id,true);if(scene)setTimeout(()=>stageOpen&&scene.stop(),620);history.pushState({prog:id},'','#'+id);}
function home(push){if(!stageOpen)return;stageOpen=false;current=null;$('#stage').classList.remove('open');if(scene)scene.start();magGo();for(const f of Object.values(frames)){try{f.contentWindow.postMessage({visible:false},'*');}catch(e){}}if(push!==false&&location.hash)history.back();}
function mark(id,run){const s=$('#st_'+id);if(s&&!s.dataset.al){s.hidden=!run;s.textContent='Running';s.className='stat';}}
addEventListener('popstate',()=>{if(stageOpen)home(false);});
addEventListener('message',e=>{const d=e.data;if(!d)return;if(d.home)home();if(d.prog){const s=$('#st_'+d.prog);if(s){if(d.alarms){s.dataset.al=1;s.hidden=false;s.textContent=d.alarms+' alarm'+(d.alarms>1?'s':'');s.className='stat al';}else{delete s.dataset.al;if(frames[d.prog]){s.hidden=false;s.textContent='Running';s.className='stat';}}}}});
/* on the room: drag to roam, two fingers to go closer. On a character: tap and it waves, drag and it goes down. Double tap a machine and the nearest hand runs over. */
const bg=$('#bg'),pts=new Map();let press=null,lastTap={t:0,x:0,y:0},pinchD=0;
bg.addEventListener('pointerdown',e=>{if(!scene)return;try{bg.setPointerCapture(e.pointerId);}catch(x){}pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size===2){press=null;const[a,b]=[...pts.values()];pinchD=Math.hypot(a.x-b.x,a.y-b.y);return;}press={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,who:scene.over(e.clientX,e.clientY),moved:false};});
bg.addEventListener('pointermove',e=>{if(!scene||!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size===2){const[a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinchD)scene.zoom(pinchD/d);pinchD=d;return;}if(!press)return;if(!press.moved&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>9){press.moved=true;if(press.who)scene.knock(press.who);}if(press.moved&&!press.who)scene.drag(e.clientX-press.lx,e.clientY-press.ly);press.lx=e.clientX;press.ly=e.clientY;});
const lift=e=>{pts.delete(e.pointerId);pinchD=0;if(!press||!scene||e.type==='pointercancel'){press=null;return;}const p=press;press=null;if(p.moved)return;if(p.who){scene.tap(p.who);return;}const now=performance.now();if(now-lastTap.t<360&&Math.hypot(p.x-lastTap.x,p.y-lastTap.y)<40){lastTap.t=0;scene.machine(p.x,p.y);}else lastTap={t:now,x:p.x,y:p.y};};
bg.addEventListener('pointerup',lift);bg.addEventListener('pointercancel',lift);
bg.addEventListener('wheel',e=>{if(scene){e.preventDefault();scene.zoom(e.deltaY>0?1.08:.93);}},{passive:false});
let hv=0;$('#bg').addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||hv||!scene)return;hv=setTimeout(()=>{hv=0;},120);$('#bg').style.cursor=scene.over(e.clientX,e.clientY)?'pointer':'';});
for(const b of $$('[data-open]'))b.addEventListener('click',()=>open(b.dataset.open,b));
$('#aboutBtn').addEventListener('click',()=>{$('#about').hidden=false;$('#aboutClose').focus();});$('#aboutClose').addEventListener('click',()=>{$('#about').hidden=true;});
$('#about').addEventListener('click',e=>{if(e.target===$('#about'))$('#about').hidden=true;});
addEventListener('keydown',e=>{if(e.key==='Escape')$('#about').hidden=true;});

/* 3D: loaded after the cards so the page is usable at once, and skipped cleanly if WebGL is missing */
let scene=null;
async function boot(){const c=$('#bg');try{const t=document.createElement('canvas').getContext('webgl2');if(!t)throw 0;const {createScene}=await import('./scene.js');scene=createScene(c,{tier});const fit=()=>scene.resize(innerWidth,innerHeight);fit();addEventListener('resize',fit);new ResizeObserver(fit).observe(document.documentElement);scene.start();document.body.classList.add('live');window.__scene=scene;}
 catch(e){console.warn('3D off',e);document.body.classList.add('no3d');}
 $('#load').classList.add('gone');}
document.addEventListener('visibilitychange',()=>{if(!scene)return;if(document.hidden)scene.stop();else if(!stageOpen)scene.start();});
magGo();boot();
window.__home={open,home,get stageOpen(){return stageOpen;},tier,phone};
