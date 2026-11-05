/* --- DK: the Diskarte companion layer. Added to every simulator at build time, after ws.js. The simulators are not edited: DK reads their globals (s, u, M, ALARMS, steps...) and every hook is guarded, so a missing name turns a feature off instead of breaking the page.
   Parts: device and layout watch, performance tier, floating windows, dock, Training / Professional mode, coach, alarm log with fixes, companion (readings, diagnosis, reports), lessons and quizzes, safety, fidelity ledger.
   ?dk=off turns it all off. ?dk=quiet skips the welcome card. ?tier=low|mid|high forces graphics. ?perf=1 shows the frame rate. --- */
(function(){
'use strict';
const Q=window.DK_PRE?DK_PRE.query:new URLSearchParams(location.search);
if(window.DK||Q.get('dk')==='off')return;
const D=document,html=D.documentElement,body=D.body,q=(s,r)=>(r||D).querySelector(s),qa=(s,r)=>[...(r||D).querySelectorAll(s)],$=id=>D.getElementById(id);
const PLANT=$('bowl')?'pur':$('bms')?'boiler':'fwg',DATA=window.DK_DATA||{},NAME={pur:'Oil Purifier',fwg:'Fresh Water Generator',boiler:'Boiler'},VER='1.0';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),now=()=>Date.now();
const el=(t,c,h)=>{const e=D.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
/* read the simulator's own names without changing them. A function made with new Function sees the page's top-level let, const and function names. */
const R=ex=>{let f;try{f=new Function('return ('+ex+')');}catch(e){return()=>undefined;}return()=>{try{return f();}catch(e){return undefined;}};};
const RX=(args,ex)=>{let f;try{f=new Function(args,ex);}catch(e){return()=>undefined;}return(...a)=>{try{return f(...a);}catch(e){return undefined;}};};
const fx=(v,n)=>Number.isFinite(v)?v.toFixed(n==null?1:n):'--';
const clk=t=>{if(!Number.isFinite(t))return'--:--:--';t=Math.floor(t);return[Math.floor(t/3600),Math.floor(t/60)%60,t%60].map(v=>String(v).padStart(2,'0')).join(':');};
const wall=t=>{if(!t)return'--';const d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');};

/* ---------- store: the app's own storage on Android, the browser's otherwise ---------- */
const NS=window.DiskarteStore;
const store={
 get(k,d,p){const K='dk.'+(p||PLANT)+'.'+k;try{let r=NS?NS.get(K):null;if(r==null)r=localStorage.getItem(K);return r==null?d:JSON.parse(r);}catch(e){return d;}},
 set(k,v,p){const K='dk.'+(p||PLANT)+'.'+k;try{const j=JSON.stringify(v);localStorage.setItem(K,j);if(NS)NS.set(K,j);}catch(e){}}};
const G={get:(k,d)=>store.get(k,d,'g'),set:(k,v)=>store.set(k,v,'g')};
const bus={h:{},on(e,f){(this.h[e]=this.h[e]||[]).push(f);},emit(e,a){(this.h[e]||[]).forEach(f=>{try{f(a);}catch(x){console.error('DK',e,x);}});}};
const IC={orb:'<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.8 2.8M16.2 16.2L19 19M19 5l-2.8 2.8M7.8 16.2L5 19"/>',
 mode:'<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="17" r="2"/>',
 coach:'<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
 alarm:'<path d="M12 3a6 6 0 0 1 6 6c0 6 2 7 2 8H4c0-1 2-2 2-8a6 6 0 0 1 6-6zM10 20a2 2 0 0 0 4 0"/>',
 comp:'<path d="M5 4h14v16H5zM8 9h8M8 13h8M8 17h5"/>',
 learn:'<path d="M3 8l9-4 9 4-9 4zM7 10v5c0 1.5 2.2 3 5 3s5-1.500 5-3v-5"/>',
 panels:'<rect x="3" y="4" width="11" height="9" rx="1.5"/><rect x="10" y="11" width="11" height="9" rx="1.5"/>',
 safety:'<path d="M12 3l9 16H3zM12 10v4M12 17v.5"/>',
 fid:'<path d="M5 4h11l3 3v13H5zM9 10h6M9 14h4M14 17l1.500 1.500 3-3"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M18.400 5.600l-2.100 2.100M7.700 16.300l-2.100 2.100"/>',
 min:'<path d="M6 12h12"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>'};
const ico=n=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(IC[n]||'')+'</svg>';

/* ---------- toasts ---------- */
const toastBox=el('div','dkToasts');toastBox.id='dkToasts';toastBox.setAttribute('role','status');toastBox.setAttribute('aria-live','polite');body.append(toastBox);
function toast(msg,o){o=o||{};const t=el('div','dkToast'+(o.kind?' '+o.kind:''),'<span>'+esc(msg)+'</span>');if(o.act){const b=el('button','',esc(o.act[0]));b.type='button';b.onclick=()=>{t.remove();o.act[1]();};t.append(b);}
 const x=el('button','dkx','✕');x.type='button';x.setAttribute('aria-label','Dismiss');x.onclick=()=>t.remove();t.append(x);toastBox.append(t);while(toastBox.children.length>3)toastBox.firstChild.remove();setTimeout(()=>t.remove(),o.ms||6000);}

/* ---------- device, layout watch ---------- */
const dev={cls:'desktop',orient:'landscape',coarse:false};let layoutT=0;
function updDev(){const d=window.DK_PRE?DK_PRE.detect():{cls:'desktop',coarse:false,layoutPhone:false};dev.cls=d.cls;dev.coarse=d.coarse;dev.orient=innerWidth>=innerHeight?'landscape':'portrait';
 html.dataset.dkDev=dev.cls;html.dataset.dkOrient=dev.orient;const vv=window.visualViewport;html.style.setProperty('--dk-vh',(vv?vv.height:innerHeight)+'px');html.style.setProperty('--dk-vw',(vv?vv.width:innerWidth)+'px');
 clearTimeout(layoutT);const forced=Q.get('layout')||/[?&]app=1/.test(location.search);
 if(!forced&&window.DK_PRE&&d.layoutPhone!==!!window.WS_PHONE&&!sessionStorage.getItem('dk.lay.no'))layoutT=setTimeout(()=>{const want=DK_PRE.detect().layoutPhone;if(want===!!window.WS_PHONE)return;
  toast('This screen suits the '+(want?'phone':'desktop')+' layout. Switching restarts the simulator.',{ms:15000,act:['Switch',()=>{const p=new URLSearchParams(location.search);p.set('layout',want?'phone':'desktop');location.search=p.toString();}]});
  try{sessionStorage.setItem('dk.lay.no','1');}catch(e){}},1500);
 bus.emit('dev',dev);}
let devRaf=0;const devSoon=()=>{if(!devRaf)devRaf=requestAnimationFrame(()=>{devRaf=0;updDev();fitAll();});};
addEventListener('resize',devSoon);addEventListener('orientationchange',devSoon);if(window.visualViewport)visualViewport.addEventListener('resize',devSoon);

/* ---------- performance: tier, frame rate, reduced motion ---------- */
const perf={tier:'high',fps:60,low:0,hud:null};
const TIERS=['low','mid','high'];
function tierStart(){const f=Q.get('tier');if(TIERS.includes(f))return f;const sv=G.get('tier.'+dev.cls,null);if(TIERS.includes(sv))return sv;
 const mem=navigator.deviceMemory||4,cores=navigator.hardwareConcurrency||4,sd=navigator.connection&&navigator.connection.saveData;
 if(sd)return'low';if(dev.coarse||dev.cls!=='desktop')return mem<=2||cores<=4?'low':'mid';return'high';}
function setTier(t,why){if(!TIERS.includes(t))return;perf.tier=t;html.dataset.dkTier=t;bus.emit('tier',{t,why});}
const rm=matchMedia('(prefers-reduced-motion: reduce)');const motion=()=>{html.dataset.dkMotion=(rm.matches||G.get('reduce',false))?'reduced':'full';};motion();if(rm.addEventListener)rm.addEventListener('change',motion);
(function fps(){let n=0,t0=performance.now(),bad=0,boot=t0;const loop=t=>{n++;if(t-t0>=1000){const v=n*1000/(t-t0);n=0;t0=t;perf.fps=Math.round(v);if(perf.hud)perf.hud.textContent=perf.fps+' fps · '+perf.tier;
  if(!D.hidden&&t-boot>5000&&!Q.get('tier')&&G.get('tier.mode','auto')==='auto'){if(v<22){if(++bad>=3&&perf.tier!=='low'){bad=0;const n2=TIERS[Math.max(0,TIERS.indexOf(perf.tier)-1)];setTier(n2,'slow');G.set('tier.'+dev.cls,n2);toast('Graphics eased to '+n2+' to keep the plant smooth. Change it in Settings.',{ms:7000});}}else if(v>=40)bad=0;}}requestAnimationFrame(loop);};requestAnimationFrame(loop);})();

/* ---------- windows: floating, draggable, resizable, minimise to a chip, optional auto-hide ---------- */
const layer=el('div','dkLayer');layer.id='dkLayer';body.append(layer);const chips=el('div','dkChips');chips.id='dkChips';body.append(chips);
const WIN={};let zTop=10;const VW=()=>html.clientWidth||innerWidth,VH=()=>(window.visualViewport?visualViewport.height:innerHeight)||html.clientHeight;
function place(o,idx){const w0=VW(),h0=VH(),ph=dev.cls==='phone',w=ph?Math.min(w0-12,o.w||400):Math.min(w0-24,o.w||380),h=ph?Math.min(o.h||440,Math.round(h0*.62)):Math.min(h0-90,o.h||440);
 return{w,h,x:ph?Math.round((w0-w)/2):Math.max(8,w0-w-18-idx*26),y:ph?Math.max(8,h0-h-64):Math.min(h0-h-12,64+idx*26)};}
function win(id,o){
 if(WIN[id])return WIN[id];
 const idx=Object.keys(WIN).length,sv=store.get('w.'+id,null),st=Object.assign(place(o,idx),sv||{},{open:false,min:false});if(sv&&sv.auto==null)st.auto=!!o.auto;if(!sv)st.auto=!!o.auto;
 const e=el('section','dkw');e.id='dkw_'+id;e.setAttribute('role','dialog');e.setAttribute('aria-label',o.title);e.hidden=true;
 e.innerHTML='<header class="dkw-h"><i class="dkw-led"></i><b class="dkw-t">'+esc(o.title)+'</b><span class="dkw-sp"></span><button type="button" class="dkw-b" data-a="auto" title="Auto-hide when idle" aria-label="Auto-hide when idle" aria-pressed="false">'+ico('eye')+'</button><button type="button" class="dkw-b" data-a="min" title="Minimise" aria-label="Minimise">'+ico('min')+'</button><button type="button" class="dkw-b" data-a="x" title="Close" aria-label="Close">'+ico('x')+'</button></header><div class="dkw-c"></div><i class="dkw-rz" aria-hidden="true"></i>';
 layer.append(e);
 const api={id,el:e,body:q('.dkw-c',e),st,o,act:now(),
  isOpen:()=>!e.hidden,
  show(){e.hidden=false;st.open=true;st.min=false;api.act=now();unchip();fit();front();if(o.onShow)o.onShow(api);bus.emit('win',{id,open:true});return api;},
  hide(){e.hidden=true;st.open=false;st.min=false;unchip();if(o.onHide)o.onHide(api);bus.emit('win',{id,open:false});return api;},
  min(){e.hidden=true;st.min=true;chip();return api;},
  toggle(){return api.isOpen()?api.hide():api.show();},
  title(t){q('.dkw-t',e).textContent=t;chipBtn&&(chipBtn.firstChild.textContent=t);}};
 let chipBtn=null;
 function chip(){if(chipBtn)return;chipBtn=el('button','dkchip','<span>'+esc(q('.dkw-t',e).textContent)+'</span><b hidden></b>');chipBtn.type='button';chipBtn.onclick=()=>api.show();chips.append(chipBtn);}
 function unchip(){if(chipBtn){chipBtn.remove();chipBtn=null;}}
 api.badge=n=>{if(chipBtn){const b=q('b',chipBtn);b.hidden=!n;b.textContent=n;}};
 function fit(){const w0=VW(),h0=VH();st.w=clamp(st.w,Math.min(240,w0-8),w0-8);st.h=clamp(st.h,Math.min(150,h0-8),h0-8);st.x=clamp(st.x,-(st.w-90),w0-90);st.y=clamp(st.y,0,Math.max(0,h0-44));
  e.style.width=st.w+'px';e.style.height=st.h+'px';e.style.transform='translate3d('+Math.round(st.x)+'px,'+Math.round(st.y)+'px,0)';}
 api.fit=fit;
 const save=()=>store.set('w.'+id,{x:st.x,y:st.y,w:st.w,h:st.h,auto:st.auto});
 function front(){e.style.zIndex=++zTop;}
 q('[data-a=auto]',e).setAttribute('aria-pressed',st.auto);
 e.addEventListener('pointerdown',()=>{api.act=now();front();},true);e.addEventListener('focusin',()=>{api.act=now();});e.addEventListener('wheel',()=>{api.act=now();},{passive:true});
 e.addEventListener('click',ev=>{const b=ev.target.closest('.dkw-b');if(!b)return;const a=b.dataset.a;if(a==='x')api.hide();else if(a==='min')api.min();else if(a==='auto'){st.auto=!st.auto;b.setAttribute('aria-pressed',st.auto);save();toast(st.auto?'Auto-hide on: this window folds into a chip when idle.':'Auto-hide off.',{ms:2500});}});
 const drag=(h,mv0)=>h.addEventListener('pointerdown',ev=>{if(ev.button>0||(h.classList.contains('dkw-h')&&ev.target.closest('button')))return;ev.preventDefault();h.setPointerCapture(ev.pointerId);const sx=ev.clientX,sy=ev.clientY,o0={x:st.x,y:st.y,w:st.w,h:st.h};let raf=0;
  const mv=m=>{mv0(o0,m.clientX-sx,m.clientY-sy);if(!raf)raf=requestAnimationFrame(()=>{raf=0;fit();});};
  const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);const w0=VW(),h0=VH();if(st.x<14)st.x=0;else if(st.x+st.w>w0-14)st.x=w0-st.w;if(st.y<14)st.y=6;else if(st.y+st.h>h0-14)st.y=h0-st.h-4;fit();save();};
  h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up);});
 drag(q('.dkw-h',e),(o0,dx,dy)=>{st.x=o0.x+dx;st.y=o0.y+dy;});drag(q('.dkw-rz',e),(o0,dx,dy)=>{st.w=o0.w+dx;st.h=o0.h+dy;});
 WIN[id]=api;return api;}
function fitAll(){for(const k in WIN)if(WIN[k].isOpen())WIN[k].fit();}
setInterval(()=>{const t=now();for(const k in WIN){const w=WIN[k];if(w.isOpen()&&w.st.auto&&t-w.act>9000&&!w.el.matches(':hover')&&!w.el.contains(D.activeElement))w.min();}},1000);
/* a panel from the simulator can be lifted onto the plant as a floating window and put back on close */
const FLOAT={};
function floatPanel(k,title){const p=q('.wsp.b_'+k);if(!p)return false;if(FLOAT[k]){FLOAT[k].win.show();return true;}
 const ph=D.createComment('dk-'+k);p.before(ph);const w=win('p_'+k,{title,w:340,h:300,onHide(){if(ph.parentNode)ph.replaceWith(p);p.classList.remove('dkAdopted');delete FLOAT[k];}});w.body.append(p);p.classList.add('dkAdopted');FLOAT[k]={win:w};w.show();dispatchEvent(new Event('resize'));return true;}
const FLOATABLE=[['gauges','Gauges'],['tiles','Alarm tiles'],['read','Readings'],['trend','Trends'],['steps','Procedure'],['alist','Alarm list'],['water','Water test']];

/* ---------- mode: Training or Professional ---------- */
const Mode={v:G.get('mode','train')};
function setMode(v,quiet){Mode.v=v==='pro'?'pro':'train';G.set('mode',Mode.v);html.dataset.dkMode=Mode.v;if(Mode.v==='pro'){if(WIN.coach)WIN.coach.hide();}else if(!quiet&&dev.cls!=='phone')openCoach();setOrb();bus.emit('mode',Mode.v);if(!quiet)toast(Mode.v==='pro'?'Professional mode: free operation, no helper. Use the companion for your real readings.':'Training mode: the coach guides each step and warns when you miss one.',{ms:4500});}
html.dataset.dkMode=Mode.v;

/* ---------- procedure adapters: one shape for three different simulators ---------- */
const P={fSteps:R('steps()'),fDone:R('done[tab]'),fCur:R('curStep()'),fTab:R('tab'),pSteps:R('steps()'),pProc:R('proc'),bProc:R('(PROC[M.id]||PROC.mission)'),bAdv:RX('st','return autoAdvance(st)'),unit:R('M.id'),tab:R('M.tab||M.name||M.id'),simT:R('s.t')};
function readProc(){
 if(PLANT==='fwg'){const L=P.fSteps(),d=P.fDone();if(!L||!d)return null;const tb=P.fTab();return{key:'fwg:'+tb+':'+P.unit(),title:tb==='stop'?'Stop procedure':'Start procedure',items:L.map((x,i)=>({t:x.t,why:x.why,ok:!!d[i],sticky:true,act:x.act?(dt=>x.act(dt)):null}))};}
 if(PLANT==='pur'){const L=P.pSteps();if(!L)return null;const pr=P.pProc();return{key:'pur:'+pr+':'+P.unit(),title:pr==='stop'?'Stop procedure':'Start procedure',items:L.map(r=>({t:r[0],why:r[3],okf:r[1],act:r[2]?(()=>r[2]()):null}))};}
 const L=P.bProc();if(!L)return null;return{key:'boiler:'+P.unit(),title:'Start procedure',items:L.map(x=>({t:x.t,why:x.why,okf:x.ok,act:()=>P.bAdv(x)}))};}
const okOf=p=>p.items.map(x=>{try{return x.sticky?!!x.ok:!!x.okf();}catch(e){return false;}});

/* ---------- coach ---------- */
const Coach={prev:null,userAt:0,fb:[],sc:{ooo:0,undo:0,blk:0,hint:0,ok:0},finished:false,key:'',busy:0};
const score=()=>Math.max(0,100-10*Coach.sc.ooo-6*Coach.sc.undo-5*Coach.sc.blk-3*Coach.sc.hint);
function say(kind,msg){Coach.fb.unshift({kind,msg,t:now()});if(Coach.fb.length>30)Coach.fb.pop();if(kind==='warn'||kind==='bad')toast(msg,{kind,ms:5500});drawCoach();}
const UI_SKIP='.dkw,#dkDock,#dkChips,#dkToasts,.dkm';
['pointerdown','keydown','input','change'].forEach(ev=>D.addEventListener(ev,e=>{if(!(e.target&&e.target.closest&&e.target.closest(UI_SKIP)))Coach.userAt=now();},true));
function coachTick(){
 if(Mode.v!=='train')return;const p=readProc();if(!p)return;const ok=okOf(p),cur=ok.indexOf(false);
 if(Coach.key!==p.key){Coach.key=p.key;Coach.prev=null;Coach.sc={ooo:0,undo:0,blk:0,hint:0,ok:0};Coach.finished=false;Coach.fb=[];}
 const pv=Coach.prev;
 if(pv&&pv.ok.length===ok.length){const recent=now()-Coach.userAt<1800,pc=pv.ok.indexOf(false);
  for(let i=0;i<ok.length;i++){
   if(!pv.ok[i]&&ok[i]){if(i===pc){Coach.sc.ok++;say('ok','Step '+(i+1)+' done: '+p.items[i].t);}
    else if(pc>=0&&i>pc&&!ok[pc]&&recent){Coach.sc.ooo++;say('warn','Out of order. You did step '+(i+1)+' before step '+(pc+1)+'. Next: '+p.items[pc].t);}}
   if(pv.ok[i]&&!ok[i]&&recent&&!p.items[i].sticky){Coach.sc.undo++;say('warn','You undid step '+(i+1)+': '+p.items[i].t);}}}
 Coach.prev={ok,cur};
 if(cur<0&&!Coach.finished&&p.items.length){Coach.finished=true;if(Coach.sc.ok>=Math.ceil(p.items.length/2)){const r={t:now(),plant:PLANT,unit:P.tab(),proc:p.title,score:score(),ooo:Coach.sc.ooo,undo:Coach.sc.undo,blk:Coach.sc.blk,hint:Coach.sc.hint};const L=store.get('learn',{}),runs=L.runs||[];runs.unshift(r);L.runs=runs.slice(0,40);store.set('learn',L);say('ok',p.title+' complete. Score '+r.score+'.');bus.emit('run',r);}}
 drawCoach(p,ok,cur);}
setInterval(coachTick,350);
/* FWG already blocks steps out of order. Training mode explains why. Professional mode lets everything through. */
if(PLANT==='fwg'&&typeof window.allow==='function'){const o0=window.allow;window.allow=function(k){if(Mode.v==='pro')return true;const r=o0.apply(this,arguments);if(r===false&&Mode.v==='train'){const p=readProc(),c=p?okOf(p).indexOf(false):-1;Coach.sc.blk++;say('bad','Blocked. That control belongs to a later step.'+(c>=0?' Do this first: '+p.items[c].t:''));}return r;};}
function drawCoach(p,ok,cur){const w=WIN.coach;if(!w||!w.isOpen())return;if(!p){p=readProc();if(!p){w.body.innerHTML='<p class="dkn">No procedure on this page.</p>';return;}ok=okOf(p);cur=ok.indexOf(false);}
 const n=p.items.length,d=ok.filter(Boolean).length,it=cur>=0?p.items[cur]:null,safe=sessionStorage.getItem('dk.safe')==='1';
 w.body.innerHTML='<div class="dkc-top"><div class="dkbar"><i style="width:'+Math.round(d/Math.max(1,n)*100)+'%"></i></div><span>'+d+'/'+n+'</span><b class="dkscore" title="Training score">'+score()+'</b></div>'
 +(safe?'':'<button type="button" class="dkwarn" data-act="safety">Safety check not done yet. Tap to read it.</button>')
 +'<div class="dkc-now">'+(it?'<small>'+esc(p.title)+' · step '+(cur+1)+' of '+n+'</small><p>'+esc(it.t)+'</p>'+(Coach.showWhy===p.key+cur&&it.why?'<p class="dkwhy">'+esc(it.why)+'</p>':'')
  +'<div class="dkc-btns"><button type="button" data-act="why">Why?</button><button type="button" data-act="where">Show me</button><button type="button" data-act="do">Do it for me</button></div>':'<p class="dkok">All steps done.</p><p class="dkn">Nothing left to coach. Load a cold plant to practise the start from the beginning.</p><div class="dkc-btns"><button type="button" data-act="cold">Practise a cold start</button></div>')+'</div>'
 +'<div class="dkfb">'+Coach.fb.slice(0,8).map(f=>'<div class="'+f.kind+'"><i>'+wall(f.t)+'</i>'+esc(f.msg)+'</div>').join('')+'</div>'
 +'<details class="dkall"><summary>All steps</summary><ol>'+p.items.map((x,i)=>'<li class="'+(ok[i]?'done':i===cur?'now':'')+'">'+esc(x.t)+'</li>').join('')+'</ol></details>';}
function openCoach(){const w=win('coach',{title:'Coach',w:350,h:430,onShow:()=>drawCoach()});w.show();return w;}
/* the hint ladder: why, where, then do it. Each use costs points. */
function locate(text){const toks=(String(text).match(/\b(?:SV|PT|RV|CV|V)\s?-?\d+[A-Za-z]?\b|\bAUTO (?:START|STOP)\b|\bSTART\b|\bSTOP\b/gi)||[]).map(t=>t.replace(/[\s-]/g,'').toLowerCase());if(!toks.length)return null;
 const nodes=qa('#mimic text, #mimic tspan');for(const t of toks){const n=nodes.find(x=>x.textContent.replace(/[\s-]/g,'').toLowerCase()===t);if(n)return n.closest('g')||n;}return null;}
function ring(target){if(!target||!target.getBoundingClientRect)return false;const r=el('div','dkring');layer.append(r);const t0=now();const f=()=>{const b=target.getBoundingClientRect(),s=Math.max(36,Math.max(b.width,b.height)+16);r.style.cssText='left:'+(b.left+b.width/2-s/2)+'px;top:'+(b.top+b.height/2-s/2)+'px;width:'+s+'px;height:'+s+'px';if(now()-t0<6000)requestAnimationFrame(f);else r.remove();};f();return true;}
function coachAct(a){const p=readProc();if(!p)return;const ok=okOf(p),cur=ok.indexOf(false);if(cur<0)return;const it=p.items[cur];Coach.sc.hint++;
 if(a==='why'){Coach.showWhy=p.key+cur;if(!it.why)say('warn','No extra reason is written for this step.');drawCoach();}
 else if(a==='where'){const t=locate(it.t);if(t&&ring(t)){say('warn','Look at the pulsing ring on the plant.');}else say('warn','Use the control named in the step. It is on the Control or Starter page.');}
 else if(a==='do'){if(!it.act){say('warn','This step is a wait or a check. Watch the plant until it is satisfied.');return;}let n=0;clearInterval(Coach.busy);Coach.busy=setInterval(()=>{const pp=readProc();if(!pp||++n>40){clearInterval(Coach.busy);return;}const o2=okOf(pp);const c2=o2.indexOf(false);if(c2<0||pp.items[c2].t!==it.t){clearInterval(Coach.busy);return;}try{pp.items[c2].act(.2);}catch(e){clearInterval(Coach.busy);}},200);say('warn','Coach did the step for you. It costs points.');}
 drawCoach();}

/* ---------- alarm log with fixes ---------- */
const AL={
 fwg:{list:R('ALARMS.map(a=>({id:a[0],label:a[1],l:aState[a[0]].l,ack:aState[a[0]].ack,msg:aState[a[0]].msg}))'),ack:RX('id','aState[id].ack=true'),tag:RX('id','return ALARM_TAG[id]')},
 pur:{list:R('Object.keys(s.alarm).map(k=>{const a=s.alarm[k];return{id:k,label:a.txt,l:a.on?a.lv:0,ack:!!a.ack,msg:a.txt};})'),ack:RX('id','s.alarm[id].ack=true'),tag:()=>null},
 boiler:{list:R('ALARMS.map(a=>({id:a.id,label:a.lab,l:s.trips[a.id]?a.sev:0,ack:!!s.acks[a.id]}))'),ack:RX('id','s.acks[id]=true;paintAlarms()'),tag:()=>null}}[PLANT];
/* records kept from an earlier visit are closed: the plant they came from is gone */
const AlR={recs:store.get('alog',[]).map(r=>Object.assign(r,{cl:r.cl||now()})),act:{},lastT:0,unit:'',sel:null,filter:'act',names:{}};
function alarmTick(){
 const L=AL.list();if(!Array.isArray(L))return;const t=P.simT(),u=P.unit();AlR.names=AlR.names||{};
 if(AlR.unit&&(AlR.unit!==u||(Number.isFinite(t)&&t<AlR.lastT-1))){for(const id in AlR.act){const r=AlR.act[id];r.cl=now();r.why='plant reset';}AlR.act={};}
 AlR.unit=u;if(Number.isFinite(t))AlR.lastT=t;let changed=false;
 for(const a of L){AlR.names[a.id]=a.label||a.id;const r=AlR.act[a.id];
  if(a.l>0&&!r){const n={id:a.id,label:a.label||a.id,l:a.l,msg:a.msg||'',t0:t,w0:now(),ack:!!a.ack,wa:a.ack?now():0,cl:0,unit:u};AlR.recs.unshift(n);AlR.act[a.id]=n;changed=true;bus.emit('alarm',n);}
  else if(a.l>0&&r){if(a.l>r.l){r.l=a.l;changed=true;}if(a.msg&&a.msg!==r.msg){r.msg=a.msg;}if(a.ack&&!r.ack){r.ack=true;r.wa=now();changed=true;}}
  else if(!(a.l>0)&&r){r.cl=now();r.t1=t;delete AlR.act[a.id];changed=true;}}
 if(AlR.recs.length>120)AlR.recs.length=120;
 const na=Object.keys(AlR.act).length,hi=Object.values(AlR.act).some(r=>r.l>1);
 if(changed){store.set('alog',AlR.recs.map(r=>({id:r.id,label:r.label,l:r.l,msg:r.msg,t0:r.t0,t1:r.t1,w0:r.w0,wa:r.wa,cl:r.cl,ack:r.ack,unit:r.unit})));drawAlarms();}
 const b=$('dkOrbB');if(b){b.hidden=!na;b.textContent=na;b.dataset.l=hi?2:1;}if(WIN.alarms)WIN.alarms.badge(na);}
setInterval(alarmTick,450);
function kb(id){const k=((DATA.alarms||{})[PLANT]||{})[id]||{};let w;if(PLANT==='pur')w=(R('ALW')()||{})[id];else if(PLANT==='fwg')w=(R('F_ALW')()||{})[id];return{why:k.why||(w&&w[0])||'',now:k.now||'',fix:k.fix||(w&&w[1])||'',esc:k.esc||''};}
function drawAlarms(){const w=WIN.alarms;if(!w||!w.isOpen())return;const show=AlR.filter==='act'?AlR.recs.filter(r=>!r.cl):AlR.recs;
 const list=show.length?show.map(r=>'<button type="button" class="dkal l'+(r.cl?0:r.l)+(AlR.sel&&AlR.sel.id===r.id&&AlR.sel.w0===r.w0?' sel':'')+'" data-act="alsel" data-i="'+AlR.recs.indexOf(r)+'"><i></i><span class="n">'+esc(r.label)+'</span><span class="s">'+(r.cl?'CLEARED':r.ack?'ACK':'ACTIVE')+'</span><span class="t">'+wall(r.w0)+'</span></button>').join(''):'<p class="dkn">'+(AlR.filter==='act'?'No active alarms.':'The log is empty.')+'</p>';
 const sel=AlR.sel;let det='';if(sel){const k=kb(sel.id),tag=AL.tag(sel.id);const dur=(sel.cl||now())-sel.w0;
  det='<div class="dkdet"><h4>'+esc(sel.label)+'</h4><p class="dkmeta">Raised '+wall(sel.w0)+' · '+(sel.wa?'acknowledged '+wall(sel.wa):'not acknowledged')+' · '+(sel.cl?'cleared '+wall(sel.cl):'still active')+' · '+Math.round(dur/1000)+' s</p>'+(sel.msg&&sel.msg!==sel.label?'<p class="dkmsg">'+esc(sel.msg)+'</p>':'')
  +(k.why?'<h5>Why it happens</h5><p>'+esc(k.why)+'</p>':'')+(k.now?'<h5>Do this first</h5><p>'+esc(k.now)+'</p>':'')+(k.fix?'<h5>How to rectify</h5><p>'+esc(k.fix)+'</p>':'')+(k.esc?'<h5 class="esc">Stop and call the Chief Engineer if</h5><p class="esc">'+esc(k.esc)+'</p>':'')
  +(!k.why&&!k.now&&!k.fix?'<p class="dkn">No guidance is written for this alarm yet. See Troubleshoot.</p>':'')
  +'<div class="dkc-btns">'+(!sel.ack&&!sel.cl?'<button type="button" data-act="alack">Acknowledge</button>':'')+(tag?'<button type="button" data-act="alwhere">Show on plant</button>':'')+'<button type="button" data-act="altrb">Troubleshoot</button></div><p class="dkdisc">'+esc(DATA.disclaimer||'')+'</p></div>';}
 w.body.innerHTML='<div class="dkseg"><button type="button" data-act="alf" data-v="act" aria-pressed="'+(AlR.filter==='act')+'">Active</button><button type="button" data-act="alf" data-v="all" aria-pressed="'+(AlR.filter==='all')+'">All</button><button type="button" data-act="alcsv">Export</button></div><div class="dklist">'+list+'</div>'+det;}
function openAlarms(sel){const w=win('alarms',{title:'Alarm log',w:360,h:470,onShow:drawAlarms});if(sel)AlR.sel=sel;w.show();drawAlarms();return w;}
/* click an alarm tile on the plant to read about it, active or not */
D.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#tiles .tile');if(!t)return;let id=null;const m=/^(?:tl_|t_)(.+)$/.exec(t.id||'');if(m)id=m[1];else{const lab=t.textContent.trim();id=Object.keys(AlR.names||{}).find(k=>AlR.names[k]===lab);}if(!id)return;
 const r=AlR.act[id]||AlR.recs.find(x=>x.id===id)||{id,label:(AlR.names||{})[id]||t.textContent.trim(),l:0,w0:now(),cl:now(),ack:true};openAlarms(r);},true);

/* ---------- companion: your readings, diagnosis, snapshots, reports ---------- */
const Comp={snaps:store.get('snaps',[]),boil:store.get('boil',{})};
function readTyped(){return qa('#actTbl input').filter(i=>i.value!==''&&Number.isFinite(parseFloat(i.value))).map(i=>{const tr=i.closest('tr');return{k:i.id.replace(/^(?:ai_|ac_)/,''),label:(i.getAttribute('aria-label')||'').replace(/, actual,.*$/,'').replace(/^Your /,''),value:parseFloat(i.value),unit:(q('.b',tr)||{}).textContent||''};});}
function readDx(){return qa('#actDx .dx').map(d=>({n:+d.dataset.n||0,title:(q('b',d)||{}).textContent||'',why:(qa('p',d)[0]||{}).textContent||'',action:((qa('p',d)[1]||{}).textContent||'').replace(/^Action:\s*/,'')}));}
/* boiler: the simulator has no readings page, so the companion has its own */
const BAND={pAlk:[6,18],pH:[9.5,11],Cl:[0,80],cond:[0,400],scav:[.2,1],cPH:[8.5,9.5]};
const BR=[['Steam and level',[['P','Steam pressure','bar a','s.P',2],['lvG','Level, gauge glass','%','s.level*100',0],['lvT','Level, transmitter','%','s.level*100',0],['stm','Total steam','t/h','s.totalSteam',2]]],
 ['Fuel oil',[['FOT','FO temperature','°C','s.FO_T',0],['FOP','FO pressure','bar','s.FO_P',1]]],
 ['Exhaust gas',[['egT','EG outlet temperature','°C','s.egT',0],['egDP','EG gas-side ΔP','as gauge','s.egDP',2]]],
 ['Water test',[['pAlk','P-alkalinity','','s.chem.pAlk',1],['pH','pH','','s.chem.pH',1],['Cl','Chloride','ppm','s.chem.Cl',0],['cond','Conductivity','','s.chem.cond',0],['scav','Scavenger','','s.chem.scav',2],['cPH','Condensate pH','','s.chem.condPH',1]]]];
const BSIM={};BR.forEach(g=>g[1].forEach(r=>{BSIM[r[0]]=R(r[3]);}));
function boilerDx(T){const S=R('s')(),U=R('u')()||{},Mx=R('M')()||{},FU=(R('FUELS')()||{})[U.fuel]||{},out=[];const add=(n,t,why,action,esc2)=>out.push({n,title:t,why,action,esc:esc2||''});const has=k=>T[k]!=null;
 if(has('lvG')&&has('lvT')&&Math.abs(T.lvG-T.lvT)>10)add(2,'Gauge glass and level transmitter disagree','Glass '+T.lvG+' %, transmitter '+T.lvT+' %.','Blow through the glass: steam, water and drain cocks in turn. Trust neither reading until they agree. Treat a doubtful level as low water.','Tell the Chief Engineer if they still disagree.');
 const lv=has('lvG')?T.lvG:T.lvT;
 if(lv!=null&&Mx.Llwl!=null){if(lv/100<=Mx.Llwl+.02)add(3,'Level at the low-low trip','Level '+lv+' %. The trip is near '+fx(Mx.Llwl*100,0)+' %.','Stop the burner. Do not feed cold water into a hot boiler. Check the glass, let it cool, then find the cause.','Always tell the Chief Engineer.');
  else if(lv/100<=Mx.Lwl+.02)add(2,'Level at the low-water mark','Level '+lv+' %. Low water is near '+fx(Mx.Lwl*100,0)+' %.','Start the standby feed pump. Check the hot well level, the feed valve and the suction strainer.','If the level is not visible in the glass, stop the burner and call the Chief Engineer.');
  else if(lv/100>=Mx.Lhi-.03)add(2,'Level near the high-water mark','Level '+lv+' %.','Stop feeding. A swell after a load change falls back. If it stays high, check the feed valve and the level control.','Water carried into the steam system is serious. Tell the Chief Engineer if it stays high.');}
 if(has('P')&&Mx.Prated!=null){if(T.P>Mx.Prated-.3)add(3,'Steam pressure at the cut-out','Pressure '+T.P+' bar a. The rated limit is '+Mx.Prated+'.','Check the steam stop and the dump valve. Dump steam to the condenser. The burner should be off.','If pressure keeps rising towards the safety valve setting, tell the Chief Engineer at once.');
  else if(U.Psp!=null&&T.P>U.Psp+.6)add(1,'Pressure above the set point','Pressure '+T.P+' against a set point of '+fx(U.Psp,1)+'.','Check that the dump valve opens and the burner is modulating down.');
  else if(U.Psp!=null&&T.P<U.Psp-1&&S&&S.flame)add(1,'Pressure below the set point with the burner on','Pressure '+T.P+' against '+fx(U.Psp,1)+'.','Check demand, steam leaks, FO temperature and pressure, and the air damper.');}
 if(has('FOT')&&FU.Tmin!=null&&T.FOT<FU.Tmin-3)add(2,'FO too cold to atomise','FO '+T.FOT+' °C. The viscosity gate for '+U.fuel+' is '+FU.Tmin+' °C.','Check the heater steam, its trap and the thermostat. Hold the burner until the oil is hot enough.');
 if(has('FOP')&&S&&S.flame&&S.FO_P>1&&T.FOP<.7*S.FO_P)add(2,'FO pressure low against the model','FO pressure '+T.FOP+' bar against about '+fx(S.FO_P,1)+' bar.','Change over the duplex filter and clean the dirty basket. Then check the FO pump.');
 if(has('egT')&&has('egDP')&&T.egT>450&&T.egDP>1.8)add(3,'Possible soot fire in the EG section','EG outlet '+T.egT+' °C and ΔP '+T.egDP+'. Both are above the limits used in the simulator (450 °C, 1.8).','Tell the Chief Engineer and the bridge. Do not soot blow. Reduce main engine load as the Chief orders and follow the ship\'s exhaust gas boiler fire procedure.','Treat this as an emergency until proven otherwise.');
 else{if(has('egDP')&&T.egDP>1.8)add(1,'EG gas-side ΔP high','ΔP '+T.egDP+' against a limit of 1.8 in the simulator. The tubes are probably sooted.','Soot blow with the steam stop open. ΔP should fall and EG steam rise.');
  if(has('egT')&&T.egT>450)add(2,'EG outlet temperature high','EG outlet '+T.egT+' °C.','Check for soot and for low water in the EG section. Tell the Chief Engineer.');}
 const w=(k,l,fn)=>{if(has(k)&&BAND[k]){const[a,b]=BAND[k];if(T[k]<a||T[k]>b)fn(T[k]<a,a,b);}};
 w('pAlk','',(lo,a,b)=>add(1,'P-alkalinity '+(lo?'low':'high'),T.pAlk+' against '+a+' to '+b+'.',lo?'Dose boiler water treatment and retest.':'Blow down. Too much alkalinity can cause foaming and carry-over.'));
 w('pH','',(lo,a,b)=>add(1,'Boiler water pH '+(lo?'low':'high'),'pH '+T.pH+' against '+a+' to '+b+'.',lo?'Dose alkalinity and retest. Low pH attacks the metal.':'Blow down and retest.'));
 w('Cl','',()=>add(2,'Chloride high','Chloride '+T.Cl+' ppm against under '+BAND.Cl[1]+'.','Dosing does not lower chloride. Find and stop the sea water leak (condenser, cooler, dump condenser). Then blow down.','If chloride keeps climbing, stop and tell the Chief Engineer.'));
 w('cond','',()=>add(1,'Conductivity high','Conductivity '+T.cond+' against under '+BAND.cond[1]+'.','Blow down to lower the dissolved solids.'));
 w('scav','',(lo)=>add(1,'Oxygen scavenger '+(lo?'low':'high'),'Scavenger '+T.scav+' against '+BAND.scav[0]+' to '+BAND.scav[1]+'.',lo?'Dose scavenger. Low scavenger lets oxygen pit the metal.':'Reduce the dose.'));
 w('cPH','',(lo)=>add(1,'Condensate pH '+(lo?'low':'high'),'Condensate pH '+T.cPH+' against '+BAND.cPH[0]+' to '+BAND.cPH[1]+'.',lo?'Dose condensate amine. Low pH means carbonic acid is attacking the condensate lines.':'Reduce the amine dose.'));
 return out.sort((a,b)=>b.n-a.n);}
function compDraw(){const w=WIN.comp;if(!w||!w.isOpen())return;let h='';
 if(PLANT==='boiler'){h+='<p class="dkn">Type what your boiler shows. Bands are the simulator\'s own and have no recorded source. Use your treatment supplier\'s limits.</p><table class="dkt"><tr><th></th><th>Yours</th><th>Simulator</th></tr>'
  +BR.map(g=>'<tr class="g"><td colspan="3">'+g[0]+'</td></tr>'+g[1].map(r=>'<tr><td>'+esc(r[1])+(r[2]?' <small>'+esc(r[2])+'</small>':'')+'</td><td><input class="dkin" type="number" step="any" inputmode="decimal" data-k="'+r[0]+'" aria-label="'+esc(r[1])+'" value="'+(Comp.boil[r[0]]!=null?Comp.boil[r[0]]:'')+'"></td><td class="v" data-s="'+r[0]+'">--</td></tr>').join('')).join('')+'</table>';}
 else h+='<p class="dkn">Type your real readings on the <b>Actual</b> page. The diagnosis appears here too. <button type="button" data-act="compgo" class="dklink">Open Actual page</button></p><p class="dkmeta" id="dkRd"></p>';
 h+='<div id="dkDx"></div><div class="dkc-btns"><button type="button" data-act="snap">Save these readings</button><button type="button" data-act="rep">Report</button><button type="button" data-act="json">JSON</button><button type="button" data-act="csv">CSV</button></div><h5>Saved readings</h5><div id="dkSn"></div><p class="dkdisc">'+esc(DATA.disclaimer||'')+'</p>';
 w.body.innerHTML=h;compLive();}
function compData(){return PLANT==='boiler'?{typed:BR.flatMap(g=>g[1]).filter(r=>Comp.boil[r[0]]!=null).map(r=>({k:r[0],label:r[1],value:Comp.boil[r[0]],unit:r[2]})),dx:boilerDx(Comp.boil)}:{typed:readTyped(),dx:readDx()};}
function compLive(){const w=WIN.comp;if(!w||!w.isOpen())return;const d=compData();const rd=$('dkRd');if(rd)rd.textContent=d.typed.length+' reading'+(d.typed.length===1?'':'s')+' typed';
 const dx=$('dkDx');if(dx){const html2=d.typed.length?(d.dx.length?d.dx.map(x=>'<div class="dkx n'+(x.n||0)+'"><b>'+esc(x.title)+'</b><p>'+esc(x.why)+'</p><p><u>Action</u> '+esc(x.action)+'</p>'+(x.esc?'<p class="esc"><u>Call the Chief Engineer</u> '+esc(x.esc)+'</p>':'')+'</div>').join(''):'<div class="dkx n0"><b>No problem found</b><p>Your readings are inside the limits that are checked.</p></div>'):'<p class="dkn">No readings yet.</p>';if(dx.dataset.h!==html2){dx.dataset.h=html2;dx.innerHTML=html2;}}
 if(PLANT==='boiler')qa('[data-s]',w.body).forEach(c=>{const r=BR.flatMap(g=>g[1]).find(x=>x[0]===c.dataset.s),v=BSIM[c.dataset.s]();c.textContent=Number.isFinite(v)?fx(v,r[4]):'--';});
 const sn=$('dkSn');if(sn){const h2=Comp.snaps.length?Comp.snaps.map((s2,i)=>'<div class="dksn"><span>'+new Date(s2.t).toLocaleString()+'</span><span>'+s2.unit+'</span><span>'+s2.typed.length+' rd · '+s2.dx.length+' finding'+(s2.dx.length===1?'':'s')+'</span><button type="button" data-act="sndel" data-i="'+i+'" aria-label="Delete">✕</button></div>').join(''):'<p class="dkn">None saved.</p>';if(sn.dataset.h!==h2){sn.dataset.h=h2;sn.innerHTML=h2;}}}
setInterval(compLive,1200);
function reportHtml(){const d=compData(),u=P.tab();return'<!doctype html><meta charset="utf-8"><title>Diskarte report</title><style>body{font:14px/1.45 Arial,sans-serif;margin:24px;color:#111}h1{font-size:20px}h2{font-size:15px;border-bottom:1px solid #999;margin-top:18px}table{border-collapse:collapse}td,th{border:1px solid #bbb;padding:3px 8px;text-align:left}.n3,.n2{color:#a00}small{color:#555}</style><h1>Diskarte companion report</h1><p>'+esc(NAME[PLANT])+' · '+esc(u)+' · '+new Date().toLocaleString()+' · simulated time '+clk(P.simT())+'</p><h2>Readings</h2>'
 +(d.typed.length?'<table><tr><th>Reading</th><th>Value</th></tr>'+d.typed.map(r=>'<tr><td>'+esc(r.label)+'</td><td>'+r.value+' '+esc(r.unit)+'</td></tr>').join('')+'</table>':'<p>None.</p>')
 +'<h2>Findings</h2>'+(d.dx.length?d.dx.map(x=>'<p class="n'+x.n+'"><b>'+esc(x.title)+'</b><br>'+esc(x.why)+'<br>Action: '+esc(x.action)+(x.esc?'<br>Call the Chief Engineer: '+esc(x.esc):'')+'</p>').join(''):'<p>No problem found.</p>')
 +'<h2>Alarm log</h2>'+(AlR.recs.length?'<table><tr><th>Raised</th><th>Alarm</th><th>Level</th><th>Acknowledged</th><th>Cleared</th></tr>'+AlR.recs.slice(0,60).map(r=>'<tr><td>'+wall(r.w0)+'</td><td>'+esc(r.label)+'</td><td>'+(r.l>1?'Alarm':'Warning')+'</td><td>'+wall(r.wa)+'</td><td>'+wall(r.cl)+'</td></tr>').join('')+'</table>':'<p>None.</p>')+'<p><small>'+esc(DATA.disclaimer||'')+'</small></p>';}
function download(name,mime,text){try{const b=new Blob([text],{type:mime}),a=el('a');a.href=URL.createObjectURL(b);a.download=name;D.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},800);}catch(e){toast('The download did not start on this device.',{kind:'warn'});}}
const csvc=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
function exportCsv(){const d=compData(),rows=[['section','name','value','unit','note']];d.typed.forEach(r=>rows.push(['reading',r.label,r.value,r.unit,'']));d.dx.forEach(x=>rows.push(['finding',x.title,'','',x.action]));AlR.recs.forEach(r=>rows.push(['alarm',r.label,r.l>1?'alarm':'warning','',wall(r.w0)+' to '+wall(r.cl)]));return rows.map(r=>r.map(csvc).join(',')).join('\r\n');}
const stamp=()=>new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
function openComp(){const w=win('comp',{title:'Companion',w:400,h:520,onShow:compDraw});w.show();compDraw();return w;}

/* ---------- lessons and quizzes ---------- */
const Learn={L:store.get('learn',{}),view:'list',mod:null,quiz:null,role:G.get('role','cadet')};
const LD=((DATA.learn||{})[PLANT])||{mods:[],quiz:[]};
const keepL=()=>store.set('learn',Learn.L);
/* a cold plant to practise on: the FWG and boiler pick it from the scenario list, the purifier from its Drills page */
function loadCold(){const sel=$('scenario'),i=sel?[...sel.options].findIndex(o=>/cold/i.test(o.textContent)):-1;
 if(sel&&i>=0){sel.value=sel.options[i].value;sel.dispatchEvent(new Event('change',{bubbles:true}));const b=$('scInit');if(b){b.click();return true;}}
 const d=qa('#drills .drillbtn').find(x=>/cold start/i.test(x.textContent)),g=$('drInit');if(d&&g){d.click();g.click();return true;}return false;}
function lessonOp(m){setMode('train',true);const ok=loadCold(),tb=m.op==='start'?$('tabStart'):null;if(tb)tb.click();openCoach();if(ok){Learn.L.op=Learn.L.op||{};Learn.L.op[m.id]=true;keepL();}
 toast(ok?'Cold start loaded. Follow the coach.':'Could not load the cold start here. Pick it from the scenarios.',{ms:4000,kind:ok?'':'warn'});}
function quizQs(){const r=Learn.role,all=LD.quiz||[];return all.filter(x=>r==='cadet'?x.lv<=2:r==='engineer'?x.lv>=2:true);}
function learnDraw(){const w=WIN.learn;if(!w||!w.isOpen())return;let h='';const th=Learn.L.th||{},op=Learn.L.op||{},best=(Learn.L.quiz||{}).best;
 const tabs='<div class="dkseg"><button type="button" data-act="lv" data-v="list" aria-pressed="'+(Learn.view==='list'||Learn.view==='mod')+'">Lessons</button><button type="button" data-act="lv" data-v="quiz" aria-pressed="'+(Learn.view==='quiz')+'">Quiz</button><button type="button" data-act="lv" data-v="prog" aria-pressed="'+(Learn.view==='prog')+'">Progress</button></div>';
 if(Learn.view==='mod'){const m=LD.mods.find(x=>x.id===Learn.mod);h=tabs+'<h4>'+esc(m.t)+'</h4><ul class="dkth">'+m.th.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><div class="dkc-btns"><button type="button" data-act="thread" data-id="'+m.id+'">'+(th[m.id]?'Theory read ✓':'Mark theory read')+'</button>'+(m.op?'<button type="button" data-act="op" data-id="'+m.id+'">Practise: cold start with the coach</button>':'')+'<button type="button" data-act="drills">Drills and faults</button><button type="button" data-act="lv" data-v="list">Back</button></div>';}
 else if(Learn.view==='quiz'){const z=Learn.quiz;if(!z){const n=quizQs().length;h=tabs+'<p>Role: <b>'+Learn.role+'</b>. '+n+' questions. '+(best!=null?'Best score '+best+' %.':'')+'</p><div class="dkc-btns"><button type="button" data-act="qstart">Start quiz</button></div>';}
  else if(z.i>=z.qs.length){const pc=Math.round(z.ok/z.qs.length*100);h=tabs+'<h4>Score '+z.ok+' of '+z.qs.length+' ('+pc+' %)</h4><div class="dkc-btns"><button type="button" data-act="qstart">Try again</button></div>';}
  else{const x=z.qs[z.i];h=tabs+'<small>Question '+(z.i+1)+' of '+z.qs.length+'</small><p class="dkqq">'+esc(x.q)+'</p>'+x.o.map((o,j)=>'<button type="button" class="dkopt'+(z.pick!=null?(j===x.a?' right':j===z.pick?' wrong':''):'')+'" data-act="qpick" data-j="'+j+'"'+(z.pick!=null?' disabled':'')+'>'+esc(o)+'</button>').join('')+(z.pick!=null?'<p class="dkwhy">'+esc(x.why)+'</p><div class="dkc-btns"><button type="button" data-act="qnext">'+(z.i+1<z.qs.length?'Next':'Finish')+'</button></div>':'');}}
 else if(Learn.view==='prog'){const runs=Learn.L.runs||[];h=tabs+'<p>Role <select class="dkin" data-act="role">'+['cadet','rating','engineer'].map(r=>'<option'+(Learn.role===r?' selected':'')+'>'+r+'</option>').join('')+'</select></p><p>Theory read: '+Object.keys(th).length+' of '+LD.mods.length+'. Practised: '+Object.keys(op).length+'. Best quiz: '+(best!=null?best+' %':'none')+'.</p><h5>Procedure runs</h5>'+(runs.length?'<table class="dkt"><tr><th>When</th><th>Run</th><th>Score</th></tr>'+runs.slice(0,12).map(r=>'<tr><td>'+new Date(r.t).toLocaleDateString()+'</td><td>'+esc(r.unit+' · '+r.proc)+'</td><td class="v">'+r.score+'</td></tr>').join('')+'</table>':'<p class="dkn">No runs yet. Practise a start with the coach.</p>')+'<div class="dkc-btns"><button type="button" data-act="lexp">Export my record</button></div>';}
 else h=tabs+'<p class="dkn">Theory first, then practise, then the quiz.</p>'+LD.mods.map(m=>'<button type="button" class="dkmod" data-act="mod" data-id="'+m.id+'"><span>'+esc(m.t)+'</span><i>'+(th[m.id]?'●':'○')+(op[m.id]?'●':(m.op?'○':''))+'</i></button>').join('');
 w.body.innerHTML=h;}
function openLearn(){const w=win('learn',{title:'Learn · '+(LD.title||NAME[PLANT]),w:390,h:500,onShow:learnDraw});w.show();learnDraw();return w;}
function exportRecord(){const rec={app:'Diskarte',ver:VER,when:new Date().toISOString(),profile:{role:Learn.role},plants:{}};['pur','fwg','boiler'].forEach(p=>{rec.plants[p]={learn:store.get('learn',{},p),snapshots:store.get('snaps',[],p),alarms:store.get('alog',[],p)};});download('diskarte-record-'+stamp()+'.json','application/json',JSON.stringify(rec,null,1));}

/* ---------- safety and fidelity ---------- */
function openSafety(){const w=win('safety',{title:'Safety',w:380,h:480,onShow:safetyDraw});w.show();safetyDraw();return w;}
function safetyDraw(){const w=WIN.safety;if(!w||!w.isOpen())return;const S=DATA.safety||{},ok=sessionStorage.getItem('dk.safe')==='1';
 w.body.innerHTML='<h4>Before you start</h4><ul class="dkth">'+(S.all||[]).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><h4>'+esc(NAME[PLANT])+' hazards</h4>'+(S[PLANT]||[]).map(a=>'<div class="dkhaz"><b>'+esc(a[0])+'</b><span>'+esc(a[1])+'</span></div>').join('')+'<div class="dkc-btns"><button type="button" data-act="safeok">'+(ok?'Read ✓':'I have read this')+'</button></div><p class="dkdisc">'+esc(DATA.disclaimer||'')+'</p>';}
const FSTAT={v:['Verified','ok'],p:['Partly','mid'],e:['Estimated','est'],u:['No source','no']};
function openFid(){const w=win('fid',{title:'Fidelity',w:400,h:500,onShow:fidDraw});w.show();fidDraw();return w;}
function fidDraw(){const w=WIN.fid;if(!w||!w.isOpen())return;const cur=(R('M.id')()||'')+' '+(R('M.tab')()||''),L=(DATA.fidelity||{})[PLANT]||[];
 const mine=L.filter(x=>x.m.test(cur)),rest=L.filter(x=>!x.m.test(cur));
 const row=x=>'<div class="dkfid"><span class="dkst '+FSTAT[x.s][1]+'">'+FSTAT[x.s][0]+'</span><div><b>'+esc(x.u)+'</b><p>'+esc(x.t)+'</p><small>Source: '+esc(x.src)+'</small></div></div>';
 w.body.innerHTML='<p class="dkn">How closely each part follows the real machine. Built from the project notes. The owner should review it. Anything marked Estimated or No source is a teaching approximation.</p><h5>This unit</h5>'+(mine.map(row).join('')||'<p class="dkn">Nothing recorded.</p>')+'<h5>Other units and general</h5>'+rest.map(row).join('');}

/* ---------- settings and panels ---------- */
function openSet(){const w=win('set',{title:'Settings',w:340,h:430,onShow:setDraw});w.show();setDraw();return w;}
function setDraw(){const w=WIN.set;if(!w||!w.isOpen())return;const tm=G.get('tier.mode','auto');
 w.body.innerHTML='<h5>Graphics</h5><p class="dkn">Now: <b>'+perf.tier+'</b> · '+perf.fps+' fps. Auto lowers it if the frame rate stays low.</p><div class="dkseg">'+['auto','low','mid','high'].map(t=>'<button type="button" data-act="tier" data-v="'+t+'" aria-pressed="'+(tm===t)+'">'+t+'</button>').join('')+'</div>'
 +'<label class="dkchk"><input type="checkbox" data-act="reduce"'+(G.get('reduce',false)?' checked':'')+'> Reduce motion</label><label class="dkchk"><input type="checkbox" data-act="hud"'+(perf.hud?' checked':'')+'> Show frame rate</label>'
 +'<h5>Layout</h5><p class="dkn">Screen: '+dev.cls+' · '+dev.orient+' · '+innerWidth+'×'+innerHeight+'. Layout in use: '+(window.WS_PHONE?'phone':'desktop')+'.</p><div class="dkseg"><button type="button" data-act="lay" data-v="phone">Phone layout</button><button type="button" data-act="lay" data-v="desktop">Desktop layout</button><button type="button" data-act="lay" data-v="auto">Auto</button></div>'
 +'<h5>Data</h5><div class="dkc-btns"><button type="button" data-act="clr">Clear saved companion data</button></div><p class="dkmeta">Diskarte companion layer '+VER+'</p>';}
function openPanels(){const w=win('panels',{title:'Float a panel',w:300,h:320,auto:true,onShow:panelsDraw});w.show();panelsDraw();return w;}
function panelsDraw(){const w=WIN.panels;if(!w||!w.isOpen())return;const L=FLOATABLE.filter(x=>q('.wsp.b_'+x[0]));w.body.innerHTML='<p class="dkn">Lift a panel onto the plant. Drag it by its title. Close it to put it back.</p>'+L.map(x=>'<button type="button" class="dkmod" data-act="float" data-k="'+x[0]+'" data-t="'+esc(x[1])+'"><span>'+esc(x[1])+'</span><i>'+(FLOAT[x[0]]?'●':'○')+'</i></button>').join('');}

/* ---------- one click handler for every window ---------- */
layer.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.tagName==='SELECT'||b.type==='checkbox')return;const a=b.dataset.act,go=window.__ws&&window.__ws.go;
 if(a==='why'||a==='where'||a==='do')coachAct(a);
 else if(a==='safety')openSafety();
 else if(a==='cold'){setMode('train',true);const ok=loadCold(),tb=$('tabStart');if(tb)tb.click();toast(ok?'Cold start loaded. Follow the coach.':'Could not load the cold start here. Pick it from the scenarios.',{ms:4000,kind:ok?'':'warn'});setTimeout(()=>drawCoach(),400);}
 else if(a==='alsel'){AlR.sel=AlR.recs[+b.dataset.i];drawAlarms();}
 else if(a==='alf'){AlR.filter=b.dataset.v;drawAlarms();}
 else if(a==='alcsv')download('diskarte-alarms-'+stamp()+'.csv','text/csv',['time,alarm,level,acknowledged,cleared'].concat(AlR.recs.map(r=>[wall(r.w0),csvc(r.label),r.l>1?'alarm':'warning',wall(r.wa),wall(r.cl)].join(','))).join('\r\n'));
 else if(a==='alack'){if(AlR.sel){AL.ack(AlR.sel.id);AlR.sel.ack=true;AlR.sel.wa=now();alarmTick();drawAlarms();}}
 else if(a==='alwhere'){const t=AlR.sel&&AL.tag(AlR.sel.id),n=t&&$('m_'+t);if(n){ring(n);}else toast('This alarm has no marker on the plant.',{ms:2500});}
 else if(a==='altrb'){if(go)go('trb');}
 else if(a==='compgo'){if(go)go('act');}
 else if(a==='snap'){const d=compData();if(!d.typed.length){toast('Type at least one reading first.',{kind:'warn'});return;}Comp.snaps.unshift({t:now(),unit:P.tab(),simT:P.simT(),typed:d.typed,dx:d.dx.map(x=>({n:x.n,title:x.title,action:x.action}))});Comp.snaps.length=Math.min(Comp.snaps.length,60);store.set('snaps',Comp.snaps);compLive();toast('Readings saved.',{ms:2000});}
 else if(a==='sndel'){Comp.snaps.splice(+b.dataset.i,1);store.set('snaps',Comp.snaps);compLive();}
 else if(a==='rep')download('diskarte-report-'+stamp()+'.html','text/html',reportHtml());
 else if(a==='json')download('diskarte-readings-'+stamp()+'.json','application/json',JSON.stringify({plant:PLANT,unit:P.tab(),when:new Date().toISOString(),current:compData(),snapshots:Comp.snaps,alarms:AlR.recs},null,1));
 else if(a==='csv')download('diskarte-readings-'+stamp()+'.csv','text/csv',exportCsv());
 else if(a==='lv'){Learn.view=b.dataset.v;if(Learn.view==='quiz')Learn.quiz=null;learnDraw();}
 else if(a==='mod'){Learn.mod=b.dataset.id;Learn.view='mod';learnDraw();}
 else if(a==='thread'){Learn.L.th=Learn.L.th||{};Learn.L.th[b.dataset.id]=true;keepL();learnDraw();}
 else if(a==='op'){lessonOp(LD.mods.find(m=>m.id===b.dataset.id));learnDraw();}
 else if(a==='drills'){if(go)go('drill');}
 else if(a==='qstart'){const qs=quizQs().slice();for(let i=qs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[qs[i],qs[j]]=[qs[j],qs[i]];}Learn.quiz={qs,i:0,ok:0,pick:null};Learn.view='quiz';learnDraw();}
 else if(a==='qpick'){const z=Learn.quiz;if(z.pick!=null)return;z.pick=+b.dataset.j;if(z.pick===z.qs[z.i].a)z.ok++;learnDraw();}
 else if(a==='qnext'){const z=Learn.quiz;z.i++;z.pick=null;if(z.i>=z.qs.length){const pc=Math.round(z.ok/z.qs.length*100);Learn.L.quiz=Learn.L.quiz||{};Learn.L.quiz.best=Math.max(Learn.L.quiz.best||0,pc);Learn.L.quiz.last=pc;keepL();}learnDraw();}
 else if(a==='lexp')exportRecord();
 else if(a==='safeok'){try{sessionStorage.setItem('dk.safe','1');}catch(e){}safetyDraw();drawCoach();}
 else if(a==='tier'){G.set('tier.mode',b.dataset.v);if(b.dataset.v==='auto')setTier(tierStart(),'auto');else setTier(b.dataset.v,'user');G.set('tier.'+dev.cls,perf.tier);setDraw();}
 else if(a==='lay'){const p=new URLSearchParams(location.search);if(b.dataset.v==='auto')p.delete('layout');else p.set('layout',b.dataset.v);try{sessionStorage.removeItem('dk.lay.no');}catch(x){}location.search=p.toString();}
 else if(a==='clr'){try{Object.keys(localStorage).filter(k=>k.startsWith('dk.')).forEach(k=>localStorage.removeItem(k));}catch(x){}toast('Cleared. Reload to start fresh.',{ms:3000});}
 else if(a==='float'){floatPanel(b.dataset.k,b.dataset.t);panelsDraw();}});
layer.addEventListener('input',e=>{const t=e.target;if(t.classList.contains('dkin')&&t.dataset.k){const v=parseFloat(t.value);if(t.value===''||!Number.isFinite(v))delete Comp.boil[t.dataset.k];else Comp.boil[t.dataset.k]=v;store.set('boil',Comp.boil);compLive();}});
layer.addEventListener('change',e=>{const t=e.target,a=t.dataset.act;if(a==='role'){Learn.role=t.value;G.set('role',t.value);}else if(a==='reduce'){G.set('reduce',t.checked);motion();}else if(a==='hud'){if(t.checked){perf.hud=el('div','dkhud');body.append(perf.hud);}else if(perf.hud){perf.hud.remove();perf.hud=null;}}});

/* ---------- dock ---------- */
const dock=el('div','dkDock');dock.id='dkDock';dock.innerHTML='<nav id="dkMenu" hidden role="menu" aria-label="Diskarte tools"></nav><button id="dkOrb" type="button" aria-label="Diskarte tools" aria-expanded="false" aria-haspopup="menu">'+ico('orb')+'<b id="dkOrbB" hidden></b></button><span id="dkOrbL"></span>';body.append(dock);
const menu=$('dkMenu'),orb=$('dkOrb'),dpos=G.get('dock',{x:0,y:0});
function setOrb(){const l=$('dkOrbL');if(l)l.textContent=Mode.v==='pro'?'PRO':'TRAIN';dock.dataset.m=Mode.v;}
function menuItems(){return[['mode',Mode.v==='pro'?'Switch to Training':'Switch to Professional',()=>setMode(Mode.v==='pro'?'train':'pro')],
 ...(Mode.v==='train'?[['coach','Coach',openCoach]]:[]),['alarm','Alarm log',()=>openAlarms()],['comp','Companion',openComp],['learn','Learn',openLearn],['panels','Float a panel',openPanels],['safety','Safety',openSafety],['fid','Fidelity',openFid],['gear','Settings',openSet]];}
function menuDraw(){menu.innerHTML=menuItems().map((m,i)=>'<button type="button" role="menuitem" data-i="'+i+'">'+ico(m[0])+'<span>'+esc(m[1])+'</span></button>').join('');}
function menuOpen(v){menu.hidden=!v;orb.setAttribute('aria-expanded',v);dock.classList.toggle('open',v);if(v){menuDraw();const r=dock.getBoundingClientRect();dock.dataset.up=r.top>VH()/2?'1':'0';dock.dataset.left=r.left>VW()/2?'1':'0';}}
menu.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const m=menuItems()[+b.dataset.i];menuOpen(false);if(m)m[2]();});
D.addEventListener('pointerdown',e=>{if(!menu.hidden&&!dock.contains(e.target))menuOpen(false);});
orb.addEventListener('pointerdown',ev=>{if(ev.button>0)return;orb.setPointerCapture(ev.pointerId);const sx=ev.clientX,sy=ev.clientY,ox=dpos.x,oy=dpos.y;let moved=false,raf=0;
 const mv=m=>{const dx=m.clientX-sx,dy=m.clientY-sy;if(!moved&&Math.hypot(dx,dy)<7)return;moved=true;dpos.x=clamp(ox+dx,-(VW()-70),0+8);dpos.y=clamp(oy+dy,-(VH()-120),20);if(!raf)raf=requestAnimationFrame(()=>{raf=0;dockPlace();});};
 const up=()=>{orb.removeEventListener('pointermove',mv);orb.removeEventListener('pointerup',up);orb.removeEventListener('pointercancel',up);if(moved){G.set('dock',dpos);}else menuOpen(menu.hidden);};
 orb.addEventListener('pointermove',mv);orb.addEventListener('pointerup',up);orb.addEventListener('pointercancel',up);});
function dockPlace(){dpos.x=clamp(dpos.x,-(VW()-70),8);dpos.y=clamp(dpos.y,-(VH()-120),20);dock.style.transform='translate3d('+dpos.x+'px,'+dpos.y+'px,0)';}
orb.addEventListener('keydown',e=>{if(e.key==='Escape')menuOpen(false);});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)menuOpen(false);});
let dimT=0;const dim=()=>{dock.classList.remove('dim');clearTimeout(dimT);dimT=setTimeout(()=>{if(menu.hidden)dock.classList.add('dim');},6000);};['pointerdown','pointermove'].forEach(ev=>dock.addEventListener(ev,dim));dim();

/* ---------- welcome card ---------- */
function welcome(){if(G.get('welcome',0)>=1||Q.get('dk')==='quiet'){setOrb();return;}
 const m=el('div','dkm');m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Welcome');
 m.innerHTML='<div class="dkm-c"><h3>Diskarte companion</h3><p>'+esc(DATA.disclaimer||'')+'</p><h5>I am a</h5><div class="dkseg" id="dkwRole">'+['cadet','rating','engineer'].map(r=>'<button type="button" data-v="'+r+'" aria-pressed="'+(r===Learn.role)+'">'+r+'</button>').join('')+'</div><h5>Start in</h5><div class="dkseg" id="dkwMode"><button type="button" data-v="train" aria-pressed="true">Training (guided)</button><button type="button" data-v="pro" aria-pressed="false">Professional (free)</button></div><div class="dkc-btns"><button type="button" id="dkwGo" class="go">Start</button></div></div>';
 body.append(m);let mode='train';
 m.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.parentNode.id==='dkwRole'){Learn.role=b.dataset.v;G.set('role',Learn.role);qa('button',b.parentNode).forEach(x=>x.setAttribute('aria-pressed',x===b));}
  else if(b.parentNode.id==='dkwMode'){mode=b.dataset.v;qa('button',b.parentNode).forEach(x=>x.setAttribute('aria-pressed',x===b));}
  else if(b.id==='dkwGo'){G.set('welcome',1);m.remove();setMode(mode,true);setOrb();if(mode==='train'&&dev.cls!=='phone')openCoach();}});
 setTimeout(()=>{const b=$('dkwGo');if(b)b.focus();},50);}

/* ---------- start ---------- */
updDev();setTier(tierStart(),'start');dockPlace();setOrb();
if(Q.get('perf')==='1'){perf.hud=el('div','dkhud');body.append(perf.hud);}
welcome();
if(Mode.v==='train'&&G.get('welcome',0)>=1&&dev.cls!=='phone'&&Q.get('dk')!=='quiet'&&store.get('coachOpen',false))openCoach();
bus.on('win',e=>{if(e.id==='coach')store.set('coachOpen',e.open);});
window.DK={ver:VER,plant:PLANT,dev,perf,Mode,Coach,AlR,Comp,Learn,WIN,bus,store,win,toast,setMode,setTier,openCoach,openAlarms,openComp,openLearn,openSafety,openFid,openSet,openPanels,floatPanel,readProc,okOf,coachTick,alarmTick,boilerDx,compData,kb,locate,menuOpen,data:DATA};
})();
