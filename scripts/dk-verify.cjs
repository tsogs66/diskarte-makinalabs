/* DK verification: opens each built plant in headless Chrome and checks the nine companion items.
   Usage: node scripts/dk-verify.cjs [www|vault]   (default www). Needs Chrome or Edge. Exit code 1 if any check fails. */
const {launch,sleep}=require('./dk-cdp.cjs'),path=require('path');
const WHERE=process.argv[2]==='vault'?path.resolve(__dirname,'..','..','..','vault','projects','upaw'):path.resolve(__dirname,'..','www');
const PAGES=process.argv[2]==='vault'
 ?[['pur','app-purifier.html'],['fwg','app-fwg-simulator-app.html'],['boiler','app-boiler-simulator-app.html']]
 :[['pur','purifier.html'],['fwg','fwg-simulator-app.html'],['boiler','boiler-simulator-app.html']];
const SIZES=[['desktop',{w:1366,h:768}],['phone',{w:390,h:844,mobile:true,dpr:2}]];
const res=[];const chk=(name,ok,info)=>{res.push({name,ok:!!ok,info});console.log((ok?'  ok   ':'  FAIL ')+name+(info!==undefined&&info!==''?'  '+(typeof info==='string'?info:JSON.stringify(info)):''));};
/* a real touch drag: mouse events do not reach pointer handlers the same way under mobile emulation */
async function touchDrag(p,x0,y0,x1,y1,steps=8){const t=(type,x,y)=>p.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
 await t('touchStart',x0,y0);for(let i=1;i<=steps;i++)await t('touchMove',x0+(x1-x0)*i/steps,y0+(y1-y0)*i/steps);await t('touchEnd',x1,y1);}
const url=f=>'file:///'+path.join(WHERE,f).replace(/\\/g,'/');
(async()=>{
 const b=await launch(9455);
 try{
 for(const [plant,file] of PAGES)for(const [sz,o] of SIZES){
  console.log('\n== '+plant+' · '+sz+' · '+file);
  const p=await b.newPage();
  await p.open(url(file)+'?dk=quiet&perf=1',Object.assign({wait:2500},o));
  if(sz==='phone')await p.send('Emulation.setCPUThrottlingRate',{rate:4});
  const E=x=>p.eval(x);
  chk('no page errors on load',p.errs.length===0,p.errs.slice(0,2));
  chk('DK loaded for '+plant,await E('!!window.DK&&DK.plant==='+JSON.stringify(plant)));
  /* item 2: layout chosen at run time */
  const lay=await E('({ph:!!window.WS_PHONE,dev:document.documentElement.dataset.dkDev,ori:document.documentElement.dataset.dkOrient})');
  chk('layout follows device',(sz==='phone')===lay.ph,lay);
  const ov=await E('(()=>{const d=document.documentElement;return{sw:d.scrollWidth,cw:d.clientWidth}})()');
  chk('no sideways overflow',ov.sw<=ov.cw+2,ov);
  /* item 1: tier, fps, reduced motion */
  const tier=await E('document.documentElement.dataset.dkTier');chk('graphics tier set',['low','mid','high'].includes(tier),tier);
  if(sz==='phone')chk('phone does not start on high',tier!=='high',tier);
  await sleep(2500);const fps=await E('DK.perf.fps');chk('frame rate measured',fps>0,fps+' fps'+(sz==='phone'?' (4x CPU throttle)':''));
  await E('(()=>{const e=document.createElement("style");document.head.append(e);})()');
  /* item 3: modes */
  await E('DK.setMode("train",true)');chk('training mode on',await E('DK.Mode.v==="train"&&document.documentElement.dataset.dkMode==="train"'));
  /* the purifier opens already running; load the cold start the same way the lesson button does */
  const cold=await E(`(()=>{const sel=document.getElementById('scenario'),i=sel?[...sel.options].findIndex(o=>/cold/i.test(o.textContent)):-1;
   if(sel&&i>=0){sel.value=sel.options[i].value;sel.dispatchEvent(new Event('change',{bubbles:true}));const b=document.getElementById('scInit');if(b){b.click();return 'scenario'}}
   const d=[...document.querySelectorAll('#drills .drillbtn')].find(x=>/cold start/i.test(x.textContent)),g=document.getElementById('drInit');if(d&&g){d.click();g.click();return 'drill'}return null})()`);
  chk('cold start can be loaded',!!cold,cold);await sleep(1200);
  await E('DK.openCoach()');await sleep(700);
  const pr=await E('(()=>{const p=DK.readProc();return p?{n:p.items.length,key:p.key,ok:DK.okOf(p).filter(Boolean).length}:null})()');chk('coach reads the procedure',pr&&pr.n>3,pr);
  chk('cold start begins with steps still to do',pr&&pr.ok<pr.n,pr);
  const coachTxt=await E('document.querySelector("#dkw_coach .dkc-now")?document.querySelector("#dkw_coach .dkc-now").textContent.slice(0,80):null');chk('coach shows current step',!!coachTxt&&!/All steps done/.test(coachTxt),coachTxt);
  const hint0=await E('DK.Coach.sc.hint');await E('document.querySelector("#dkw_coach [data-act=where]")&&document.querySelector("#dkw_coach [data-act=where]").click()');
  chk('hint costs points',(await E('DK.Coach.sc.hint'))>hint0);
  const ok0=await E('DK.okOf(DK.readProc()).filter(Boolean).length'),lv0=await E('typeof s!=="undefined"&&s.level!=null?s.level:null');
  await E('document.querySelector("#dkw_coach [data-act=do]")&&document.querySelector("#dkw_coach [data-act=do]").click()');await sleep(3500);
  const ok1=await E('DK.okOf(DK.readProc()).filter(Boolean).length');const lv1=await E('typeof s!=="undefined"&&s.level!=null?s.level:null');
  /* the boiler's current step is a fill that takes minutes at 1x: the coach starts the pump, so the level must be rising even if the step is not yet green */
  chk('"Do it for me" completes the step, or starts a slow one',ok1>ok0||(plant==='boiler'&&lv0!=null&&lv1>lv0),ok0+' -> '+ok1+(lv0!=null?' (level '+lv0.toFixed(3)+' -> '+lv1.toFixed(3)+')':''));
  chk('score drops after help',(await E('document.querySelector("#dkw_coach .dkscore")?+document.querySelector("#dkw_coach .dkscore").textContent:null'))<100);
  await E('DK.setMode("pro",true)');chk('professional mode hides coach',await E('document.getElementById("dkw_coach").hidden===true&&DK.Mode.v==="pro"'));
  await E('DK.setMode("train",true)');
  /* item 4: alarms */
  const nAl=await E('DK.AlR.recs.length');
  const syn=await E(`(()=>{const r={id:'__t',label:'Test alarm',l:2,msg:'',t0:0,w0:Date.now(),ack:false,wa:0,cl:0,unit:'x'};DK.AlR.recs.unshift(r);DK.AlR.act.__t=r;DK.openAlarms(r);return true})()`);
  await sleep(400);
  chk('alarm window lists records',(await E('document.querySelectorAll("#dkw_alarms .dkal").length'))>0);
  chk('clicking an alarm opens its detail',await E('(()=>{const b=document.querySelector("#dkw_alarms .dkal");b.click();return !!document.querySelector("#dkw_alarms .dkdet")})()'));
  await E('DK.AlR.recs.shift();delete DK.AlR.act.__t;DK.AlR.sel=null');
  /* every alarm the simulator can raise should have guidance text */
  const cov=await E(`(()=>{const L=${plant==='pur'?'[...new Set(Object.keys(ALW).concat(Object.keys(s.alarm)))]':plant==='fwg'?'ALARMS.map(a=>a[0])':'ALARMS.map(a=>a.id)'};const miss=L.filter(id=>{const k=DK.kb(id);return !(k.why||k.now||k.fix)});return{total:L.length,missing:miss}})()`);
  chk('every alarm has guidance',cov.missing.length===0,cov);
  /* item 5: companion */
  await E('DK.openComp()');await sleep(500);
  chk('companion window opens',await E('!document.getElementById("dkw_comp").hidden'));
  if(plant==='boiler'){
   await E(`(()=>{DK.Comp.boil={lvG:22,lvT:55,Cl:140,egT:480,egDP:2.4};DK.WIN.comp.show&&0;})()`);
   const dx=await E('DK.boilerDx(DK.Comp.boil).map(x=>x.n+":"+x.title)');
   chk('boiler diagnosis finds the faults typed in',dx.length>=4,dx);
   chk('soot fire advice says do not soot blow',(await E('JSON.stringify(DK.boilerDx(DK.Comp.boil))')).includes('Do not soot blow'));
  }else{
   const has=await E('!!document.getElementById("actTbl")');chk('Actual table present',has);
  }
  await E('DK.Comp.boil={}');
  /* item 6, 8, 9: other windows */
  for(const [fn,id] of [['openFid','fid'],['openSafety','safety'],['openLearn','learn'],['openSet','set'],['openPanels','panels']]){await E('DK.'+fn+'()');await sleep(250);chk(id+' window opens',await E('!document.getElementById("dkw_'+id+'").hidden'));}
  const nodes=await E('document.querySelectorAll("#dkw_fid .dkfid").length');chk('fidelity ledger lists items',nodes>=3,nodes);
  /* quiz runs to the end */
  await E('DK.Learn.view="quiz";DK.openLearn()');await sleep(200);
  const quiz=await E(`(async()=>{const w=document.getElementById('dkw_learn');const c=sel=>w.querySelector(sel);c('[data-act=qstart]').click();let n=0;while(c('[data-act=qpick]')&&n<30){c('[data-act=qpick]').click();c('[data-act=qnext]').click();n++;}return{asked:n,score:/Score/.test(w.textContent)}})()`);
  chk('quiz completes and scores',quiz.asked>=5&&quiz.score,quiz);
  /* item 7: floating windows drag, snap, remember */
  await E('DK.WIN.set.show()');await sleep(200);
  const pos0=await E('(()=>{const r=document.getElementById("dkw_set").getBoundingClientRect();return[r.left,r.top,r.width,r.height]})()');
  if(o.mobile)await touchDrag(p,pos0[0]+40,pos0[1]+14,pos0[0]+40-60,pos0[1]+14+60);else await p.drag(pos0[0]+40,pos0[1]+14,pos0[0]+40-120,pos0[1]+14+60);await sleep(200);
  const pos1=await E('(()=>{const r=document.getElementById("dkw_set").getBoundingClientRect();return[r.left,r.top]})()');
  chk('window drags by its title',Math.abs(pos1[0]-pos0[0])>40||Math.abs(pos1[1]-pos0[1])>20,{from:pos0.slice(0,2),to:pos1});
  const inside=await E('(()=>{const r=document.getElementById("dkw_set").getBoundingClientRect();return r.right>0&&r.left<innerWidth&&r.top>=0&&r.top<innerHeight})()');chk('window stays on screen',inside);
  chk('window position saved',await E('!!DK.store.get("w.set",null)'));
  if(plant!=='boiler'||true){const f=await E('(()=>{const k=["gauges","tiles","read","trend","steps","alist","water"].find(x=>document.querySelector(".wsp.b_"+x));if(!k)return null;const ok=DK.floatPanel(k,k);const a=document.querySelector(".dkAdopted");return{k,ok,adopted:!!a,h:a?Math.round(a.getBoundingClientRect().height):0}})()');await sleep(300);const f2=await E('(()=>{const a=document.querySelector(".dkAdopted");return a?Math.round(a.getBoundingClientRect().height):0})()');chk('a plant panel can be floated',f&&f.ok&&f.adopted,f);chk('a floated panel is visible, not 0 px high',f2>40,f2+' px');}
  /* touch target size on phone */
  if(sz==='phone'){const small=await E('(()=>{const bs=[...document.querySelectorAll(".dkw button,#dkOrb")].filter(x=>x.offsetParent);const s=bs.filter(x=>{const r=x.getBoundingClientRect();return r.width<30||r.height<30});return{count:bs.length,small:s.length,sample:s.slice(0,3).map(x=>x.className+":"+Math.round(x.getBoundingClientRect().width)+"x"+Math.round(x.getBoundingClientRect().height))}})()');chk('touch targets at least 30 px (WCAG min 24, Apple 44)',small.small===0,small);}
  await sleep(300);
  const shot=path.join(require('os').tmpdir(),`dk-${plant}-${sz}.png`);await p.shot(shot);console.log('  shot '+shot);
  chk('no errors at the end',p.errs.length===0,p.errs.slice(0,3));
  p.close();
 }
 }finally{b.close();}
 const bad=res.filter(r=>!r.ok);console.log('\n'+(res.length-bad.length)+'/'+res.length+' checks passed');if(bad.length){console.log('FAILED:\n'+bad.map(r=>' - '+r.name+' '+JSON.stringify(r.info||'')).join('\n'));process.exit(1);}
})().catch(e=>{console.error('CRASH',e);process.exit(2);});
