/* Purifier step 1, driven like an operator with real clicks on every unit, desktop and phone:
   cold start -> Plant tab -> click the bottom of the bowl (sump oil level) -> Starters tab (brake already off completes it;
   brake on keeps it open until unticked) -> low-oil fault (top up) -> helper action / running scenarios still complete it.
   node scripts/dk-sump.cjs [www|vault] [shotdir] */
const {launch}=require('./dk-cdp.cjs'),path=require('path');
const vault=process.argv[2]==='vault',root=vault?'C:/Users/ts0gs/project-mind/vault/projects/upaw':path.resolve(__dirname,'..','www'),shots=process.argv[3];
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:(fail++,console.log('  FAIL '+m));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await launch(9461);try{
 for(const ph of [false,true]){
  const p=await b.newPage(),tag=ph?'phone':'desktop',E=x=>p.eval(x);
  /* mouse events hang under mobile emulation, so a phone "click" is a real touch tap at the element centre */
  if(ph)p.click=async sel=>{const c=await E(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`);if(!c)throw new Error('no element '+sel);
   const t=type=>p.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:c[0],y:c[1],id:1}]});await t('touchStart');await wait(60);await t('touchEnd');};
  const file=ph?(vault?'mobile-purifier.html':'mobile-purifier.html'):(vault?'app-purifier.html':'purifier.html');
  await p.open('file:///'+path.join(root,file).replace(/\\/g,'/')+'?dk=quiet',ph?{w:390,h:844,mobile:true,dpr:2,wait:2500}:{w:1366,h:768,wait:3000});
  const click=async sel=>{if(ph){await E('document.querySelector('+JSON.stringify(sel)+').click()');await wait(450);return;}
   await p.click(sel).catch(async()=>{await E('document.querySelector('+JSON.stringify(sel)+').click()');});await wait(350);};
  /* desktop: left rail tabs. phone: the Control rail button opens a sheet (Starters is its 2nd tab), the sheet's X returns to the plant */
  const tab=async v=>{
   if(!ph){await click(`[role=tab][data-v=${v}]`);return;}
   if(v==='plant'){if(await E(`(()=>{const x=document.getElementById('popX');return !!x&&x.getBoundingClientRect().width>0})()`))await click('#popX');return;}
   await click('#mMenu');await click('[data-p=ctrl]');await click('[data-i="1"]');};
  const units=await E('Object.keys(MODELS)');
  for(const k of units){
   const T=`${tag} ${k}:`;
   await E(`switchUnit('${k}');startDrill(0);1`);await wait(400);
   const s0=await E(`(()=>{const st=steps()[0];return {t:st[0],ok:!!st[1](),oil:!!u.oilChk,seen:!!u.stSeen,brake:u.brake}})()`);
   ok(!/frequency/i.test(s0.t),`${T} step text still mentions frequency: ${s0.t}`);
   ok(s0.ok===false&&s0.oil===false,`${T} cold start should begin with step 1 open ${JSON.stringify(s0)}`);
   ok(s0.seen===false,`${T} starter panel counted as visited while its tab is not open`);
   await tab('plant');
   const hot=await E(`(()=>{const e=document.querySelector('#mimic .sumpHot');if(!e)return null;const r=e.getBoundingClientRect();return {w:r.width,h:r.height}})()`);
   ok(!!hot,`${T} no sump hotspot in the mimic`);if(!hot)continue;
   ok(hot.w>=14&&hot.h>=14,`${T} hotspot tiny ${hot.w.toFixed(0)}x${hot.h.toFixed(0)}`);
   if(shots&&k==='p605')await p.shot(require('path').join(shots,`sump-${tag}.png`));
   await p.click('#mimic .sumpHot');await wait(250);
   const pop=await E(`({hidden:$('vp').hidden,txt:$('vp').textContent,oil:!!u.oilChk,seen:!!u.stSeen,ok:!!steps()[0][1]()})`);
   ok(!pop.hidden&&/oil level/i.test(pop.txt),`${T} popup not shown: ${pop.txt.slice(0,60)}`);
   ok(pop.oil,`${T} reading the level at the mark should count as checked`);
   ok(!pop.ok&&!pop.seen,`${T} step 1 ticked before the starter panel was visited ${JSON.stringify(pop)}`);
   if(shots&&k==='p605')await p.shot(require('path').join(shots,`sump-pop-${tag}.png`));
   await E(`$('vp').hidden=true;1`);
   // A: go to the starter panel with the brake already off -> step 1 completes
   await tab('oper');await wait(300);
   const a=await E(`({b:u.brake,seen:!!u.stSeen,ok:!!steps()[0][1]()})`);
   ok(a.b===0&&a.seen&&a.ok,`${T} brake already off + starter visited should finish step 1 ${JSON.stringify(a)}`);
   // B: brake on at the starter keeps it open; unticking finishes it
   await E(`startDrill(0);u.brake=1;$('brk').checked=true;1`);await wait(400);await tab('plant');await p.click('#mimic .sumpHot');await wait(200);await E(`$('vp').hidden=true;1`);
   await tab('oper');await wait(300);
   const b1=await E(`({b:u.brake,seen:!!u.stSeen,ok:!!steps()[0][1]()})`);
   ok(b1.b===1&&b1.seen&&!b1.ok,`${T} brake applied must keep step 1 open ${JSON.stringify(b1)} ${await E(`JSON.stringify({on:[...document.querySelectorAll('.view.on')].map(v=>v.dataset.v),rail:Math.round((document.querySelector('[data-p=ctrl]')||{getBoundingClientRect:()=>({left:0})}).getBoundingClientRect().left),stVis,shown:stShown()})`)}`);
   await p.click('#brk').catch(()=>E(`$('brk').click()`));await wait(250);
   const b2=await E(`({b:u.brake,ok:!!steps()[0][1]()})`);
   ok(b2.b===0&&b2.ok,`${T} unticking the brake should finish step 1 ${JSON.stringify(b2)}`);
   // C: low oil -> popup offers a top-up, the check does not count until it is at the mark
   await E(`startDrill(0);1`);await wait(300);await E(`f.dryOil=true;u.brake=0;u.stSeen=1;1`);await tab('plant');
   await p.click('#mimic .sumpHot');await wait(250);
   const low=await E(`({btn:!!$('vpS'),oil:!!u.oilChk,ok:!!steps()[0][1]()})`);
   ok(low.btn&&!low.oil&&!low.ok,`${T} low oil should offer top-up and not tick step 1 ${JSON.stringify(low)}`);
   if(low.btn){await p.click('#vpS');await wait(250);const after=await E(`({dry:!!f.dryOil,ok:!!steps()[0][1]()})`);ok(!after.dry&&after.ok,`${T} top up should clear the fault and tick step 1 ${JSON.stringify(after)}`);}
   // helper action and running scenarios must still complete it
   await E(`startDrill(0);1`);await E(`steps()[0][2]()`);ok(await E(`!!steps()[0][1]()`),`${T} helper action does not complete step 1`);
   await E(`startDrill(1);1`);await wait(300);ok(await E(`!!steps()[0][1]()`),`${T} running scenario leaves step 1 open`);
  }
  ok(p.errs.length===0,`${tag}: page errors ${JSON.stringify(p.errs).slice(0,300)}`);
  p.close();
 }
}finally{b.close();}
console.log(`sump flow: ${pass} passed, ${fail} failed`);process.exit(fail?1:0);})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
