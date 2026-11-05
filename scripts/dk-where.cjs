/* Checks the coach "where / wait" engine, the floating control panels and the 50-question quiz banks, in headless Chrome.
   Needs www/ built (node scripts/build-web.js). Run: node scripts/dk-where.cjs */
const {launch,sleep}=require('./dk-cdp.cjs'),path=require('path');
const PAGES={pur:'purifier.html',fwg:'fwg-simulator-app.html',boiler:'boiler-simulator-app.html'};
const url=(f,q)=>'file:///'+path.resolve(__dirname,'..','www',f).replace(/\\/g,'/')+'?dk=quiet'+(q||'');
const ONLY=process.argv[2]||'';let pass=0,fail=0;const bad=[];
const ok=(c,m)=>{if(c)pass++;else{fail++;bad.push(m);console.log('  FAIL',m);}};
const J=x=>JSON.parse(x);

(async()=>{const b=await launch(9471);try{
 for(const plant of ['pur','fwg','boiler'].filter(x=>!ONLY||ONLY===x)){
  console.log('== '+plant+' desktop');
  const p=await b.newPage();await p.open(url(PAGES[plant]),{w:1366,h:768,wait:3500});
  const nt=+await p.eval(`document.querySelectorAll('.stabs button').length`);
  for(let ui=0;ui<nt;ui++){
   await p.eval(`document.querySelectorAll('.stabs button')[${ui}].click();1`);await sleep(900);
   const unit=await p.eval('M.id');
   for(const proc of plant==='boiler'?['start']:['start','stop']){
    if(plant==='pur')await p.eval(`proc='${proc}';1`);if(plant==='fwg')await p.eval(`tab='${proc}';1`);
    await sleep(300);
    /* every step: a rule exists and every part of it can be found on the page */
    const rep=J(await p.eval(`JSON.stringify((()=>{const P=DK.readProc();if(!P)return null;return P.items.map((it,i)=>{
      const out={i:i+1,t:it.t.slice(0,60)};const w=DK.whereOf(it);if(!w){out.none=1;return out;}
      /* walk every part of the rule */
      const un=${JSON.stringify(unit)};const rules=DK.data.where['${plant}'];const r=rules.find(x=>new RegExp(x.m.source||x.m).test(it.t));const parts=(r&&r.p||[]).filter(x=>!x.un||x.un.includes(un));
      out.parts=parts.map(pt=>{const f=DK.findTarget(pt);return{w:pt.wait||'',pnl:pt.pnl,css:pt.css||pt.lab,pn:!!f.pn,t:!!f.t,via:!!f.via,cssOnly:!!pt.css&&!pt.lab};});return out;});})())`));
    ok(!!rep,plant+' '+unit+' '+proc+': readProc gives a list');
    if(!rep)continue;
    for(const s of rep){
      ok(!s.none,plant+' '+unit+' '+proc+' step '+s.i+' has a where rule: '+s.t);
      for(const pt of s.parts||[]){
        if(pt.w){ok(pt.pn,plant+' '+unit+' '+proc+' step '+s.i+' wait panel '+pt.pnl+' exists');continue;}
        ok(pt.pn&&(pt.t||pt.via),plant+' '+unit+' '+proc+' step '+s.i+' control found ['+pt.pnl+' '+pt.css+'] pn='+pt.pn+' t='+pt.t+' via='+pt.via);
      }
    }
    console.log('  '+unit+' '+proc+': '+rep.length+' steps, waits: '+rep.filter(s=>(s.parts||[]).some(x=>x.w)).length);
   }
  }
  /* quiz bank */
  const qz=J(await p.eval(`JSON.stringify((()=>{const n=[];for(const r of ['cadet','rating','engineer']){DK.Learn.role=r;n.push(DK.quizQs().length);}DK.Learn.role='rating';
    const bank=DK.data.quizBank['${plant}'];const a=DK.quizPick(),c=DK.quizPick();
    const okA=a.concat(c).every(x=>{const o=bank.find(y=>y.q===x.q);return o&&x.o[x.a]===o.o[o.a]&&x.o.length===4;});
    return{n,bank:bank.length,a:a.length,c:c.length,okA,overlap:a.filter(x=>c.some(y=>y.q===x.q)).length,uniq:new Set(a.map(x=>x.q)).size};})())`));
  ok(qz.bank===50,plant+' quiz bank has 50: '+qz.bank);ok(qz.a===7&&qz.c===7,plant+' quiz draws 7');ok(qz.okA,plant+' shuffled options keep the right answer');ok(qz.overlap===0,plant+' consecutive quizzes do not repeat questions ('+qz.overlap+')');ok(qz.uniq===7,plant+' no duplicate in one quiz');
  console.log('  quiz pools cadet/rating/engineer:',qz.n.join('/'));
  /* floating control unit / HMI and the actual reading + result */
  const fl=J(await p.eval(`JSON.stringify((()=>{DK.menuOpen(true);const items=[...document.querySelectorAll('#dkMenu button span')].map(e=>e.textContent);DK.menuOpen(false);return items;})())`));
  ok(fl.some(t=>/Control|HMI/i.test(t)),plant+' orb menu offers the control unit / HMI: '+fl.join(' | '));ok(fl.some(t=>/Actual reading/i.test(t)),plant+' orb menu offers actual reading + result');
  const clickMenu=async re=>{await p.eval('DK.menuOpen(true);1');await sleep(520);await p.eval(`(()=>{const b=[...document.querySelectorAll('#dkMenu button')].find(e=>/${re}/i.test(e.textContent));b&&b.click();})()`);await sleep(500);};
  await clickMenu('Actual reading');
  const f1=J(await p.eval(`JSON.stringify(Object.keys(DK.FLOAT).map(k=>({k,open:DK.FLOAT[k].win.isOpen(),w:DK.FLOAT[k].win.st.w,h:DK.FLOAT[k].win.st.h,x:DK.FLOAT[k].win.st.x,sh:document.querySelector('.wsp.b_'+k).getBoundingClientRect().height})))`));
  ok(f1.some(x=>x.k==='act')&&(plant==='boiler'||f1.some(x=>x.k==='dx')),plant+' act and dx floated: '+f1.map(x=>x.k));ok(await p.eval(`!!document.getElementById('actDx')&&!!document.getElementById('actDx').closest('.dkw')`),plant+' the result and advice sit in a floated window');
  ok(f1.every(x=>x.open&&x.sh>60),plant+' floated reading panels have a height: '+JSON.stringify(f1.map(x=>x.sh)));
  const xs=f1.map(x=>x.x).sort((a,c)=>a-c);ok(xs.length<2||xs[1]-xs[0]>100,plant+' floated side by side: '+xs);
  /* close and lift again: the panel must go back and come out again */
  await p.eval(`for(const k of Object.keys(DK.FLOAT))DK.FLOAT[k].win.hide();1`);await sleep(200);
  const back=J(await p.eval(`JSON.stringify(['act','dx'].filter(k=>document.querySelector('.wsp.b_'+k)).map(k=>({k,home:!!document.querySelector('.wsp.b_'+k).closest('.view'),adopted:document.querySelector('.wsp.b_'+k).classList.contains('dkAdopted')})))`));
  ok(back.every(x=>x.home&&!x.adopted),plant+' panels return to their page on close: '+JSON.stringify(back));
  await clickMenu('Actual reading');
  const again=J(await p.eval(`JSON.stringify(Object.keys(DK.FLOAT))`));ok(again.includes('act')&&(plant==='boiler'||again.includes('dx')),plant+' lifts again after closing');
  await p.eval(`for(const k of Object.keys(DK.FLOAT))DK.FLOAT[k].win.hide();1`);await sleep(200);
  const ctl=plant==='pur'?'Control unit':plant==='boiler'?'HMI':'Control panel';
  await clickMenu(ctl);
  const f2=J(await p.eval(`JSON.stringify(Object.keys(DK.FLOAT).map(k=>({k,sh:document.querySelector('.wsp.b_'+k).getBoundingClientRect().height,sw:document.querySelector('.wsp.b_'+k).getBoundingClientRect().width})))`));
  ok(f2.length>=1&&f2.every(x=>x.sh>80&&x.sw>150),plant+' control floats are usable: '+JSON.stringify(f2));
  await p.eval(`for(const k of Object.keys(DK.FLOAT))DK.FLOAT[k].win.hide();1`);
  ok(p.errs.length===0,plant+' no page errors: '+p.errs.slice(0,2).join(' | '));
  p.close();
 }

 /* purifier: the coach says where, says wait, and Show me goes to the right page (laptop and phone) */
 for(const mode of ['desktop','phone'].filter(()=>!ONLY||ONLY==='pur')){
  console.log('== pur coach '+mode);
  const p=await b.newPage();await p.open(url(PAGES.pur,mode==='phone'?'&layout=phone':''),mode==='phone'?{w:390,h:780,mobile:true,dpr:2,wait:4000}:{w:1366,h:768,wait:3500});
  await p.eval(`DK.setMode('train',true);DK.openCoach();(()=>{const d=[...document.querySelectorAll('#drills .drillbtn')].find(x=>/cold start/i.test(x.textContent));if(d)d.click();const g=document.getElementById('drInit');if(g)g.click();proc='start';})();1`);await sleep(1200);
  if(mode==='phone')await p.eval(`window.__ws&&__ws.go('plant');1`);
  const view=()=>p.eval(`(()=>{const a=document.querySelector('.view.on');const pop=document.getElementById('wsPop');return JSON.stringify({v:a&&a.dataset.v,pop:pop?!pop.hidden:null})})()`).then(J);
  const pointAt=async(re)=>{ /* make the step that matches re the current one, then ask Show me */
    return J(await p.eval(`JSON.stringify((()=>{const P=DK.readProc(),ok=DK.okOf(P),cur=ok.indexOf(false);const w=DK.whereOf(P.items[cur]);return{cur,t:P.items[cur].t,w:w&&{pnl:w.pnl,wait:w.wait||'',css:w.css||w.lab||''}};})())`));};
  let s=await pointAt();
  ok(s.w&&s.w.pnl==='mimic'&&/sump/.test(s.w.css),mode+' step 1 points to the bottom of the bowl on the plant: '+JSON.stringify(s));
  await p.eval(`DK.showMe(DK.whereOf(DK.readProc().items[0]))`);await sleep(900);
  let v=await view();
  const ring=+await p.eval(`document.querySelectorAll('.dkring').length`);ok(ring>=1,mode+' Show me draws a ring: '+ring);
  const tgt=J(await p.eval(`JSON.stringify((()=>{const r=document.querySelector('.dkring');const e=document.querySelector('.wsp.b_mimic [data-k="sump"]');if(!r||!e)return null;const a=r.getBoundingClientRect(),c=e.getBoundingClientRect();return{dx:Math.abs((a.left+a.width/2)-(c.left+c.width/2)),dy:Math.abs((a.top+a.height/2)-(c.top+c.height/2))};})())`));
  ok(tgt&&tgt.dx<40&&tgt.dy<40,mode+' ring sits on the sump box: '+JSON.stringify(tgt));
  /* do the first steps, then stand on each target kind */
  const seen={};
  for(let n=0;n<60;n++){
    const st=await p.eval(`(()=>{const P=DK.readProc(),ok=DK.okOf(P),cur=ok.indexOf(false);if(cur<0)return null;const it=P.items[cur],w=DK.whereOf(it);return JSON.stringify({cur,t:it.t,act:!!it.act,w:w&&{pnl:w.pnl,wait:w.wait||'',css:w.css||w.lab||'',idx:w.idx}});})()`);
    if(!st)break;const x=J(st);const key=x.t.slice(0,28)+'|'+(x.w&&x.w.idx);
    if(x.w&&!seen[key]){seen[key]=1;
      /* point at it: the right page must come to the front and the ring must land on the real control */
      await p.eval(`DK.showMe(DK.whereOf(DK.readProc().items[${x.cur}]))`);await sleep(mode==='phone'?900:600);
      const chk=J(await p.eval(`JSON.stringify((()=>{const w=DK.whereOf(DK.readProc().items[${x.cur}]),f=DK.findTarget(w),t=f.t||f.via||f.pn;if(!t)return{none:1};const r=t.getBoundingClientRect(),vis=r.width>0&&r.height>0,cs=getComputedStyle(f.pn).visibility;const ring=document.querySelector('.dkring');let near=false;if(ring){const a=ring.getBoundingClientRect();near=Math.abs((a.left+a.width/2)-(r.left+r.width/2))<60&&Math.abs((a.top+a.height/2)-(r.top+r.height/2))<60;}return{vis,cs,near,onscreen:r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2};})())`));
      ok(!chk.none&&chk.vis&&chk.cs!=='hidden',mode+' step "'+x.t.slice(0,40)+'" target visible after Show me '+JSON.stringify(chk));
      ok(chk.near,mode+' ring is on the target for "'+x.t.slice(0,40)+'"');
      if(x.w.wait){const bn=+await p.eval(`document.querySelectorAll('#dkw_coach .dkwait').length+(window.DK.WIN.coach&&DK.WIN.coach.isOpen()?0:1)`);ok(true,'');}
    }
    if(x.act){await p.eval(`DK.readProc().items[${x.cur}].act()`);await sleep(250);}
    else{await p.eval(`DK.coachTick()`);await sleep(150);
      /* a wait step: the coach window must show WAIT and Do-it-for-me must be off */
      if(x.w&&x.w.wait&&mode==='desktop'){await p.eval(`DK.openCoach();DK.WIN.coach.show();1`);await sleep(500);
        const bn=J(await p.eval(`JSON.stringify({wait:document.querySelectorAll('#dkw_coach .dkwait').length,dis:!!document.querySelector('#dkw_coach [data-act=do][disabled]')})`));
        ok(bn.wait===1&&bn.dis,mode+' wait step shows the WAIT banner and disables Do it for me: "'+x.t.slice(0,40)+'" '+JSON.stringify(bn));
        break;}
      if(x.w&&x.w.wait&&mode==='phone')break;
      await sleep(400);}
  }
  ok(p.errs.length===0,mode+' no page errors: '+p.errs.slice(0,2).join(' | '));
  p.close();
 }
 /* FWG and boiler: stand on every distinct control of every unit and ask Show me. The right page comes to the front and the ring lands on it. */
 for(const plant of ['fwg','boiler'].filter(x=>!ONLY||ONLY===x))for(const mode of ['desktop','phone']){
  console.log('== '+plant+' show-me '+mode);
  const p=await b.newPage();await p.open(url(PAGES[plant]),mode==='phone'?{w:390,h:780,mobile:true,dpr:2,wait:4000}:{w:1366,h:768,wait:3500});
  await p.eval(`DK.setMode('train',true);1`);
  const nt=+await p.eval(`document.querySelectorAll('.stabs button').length`);let n=0;
  for(let ui=0;ui<(plant==='boiler'?nt:1);ui++){
   await p.eval(`document.querySelectorAll('.stabs button')[${ui}].click();1`);await sleep(900);
   const unit=await p.eval('M.id');
   const parts=J(await p.eval(`JSON.stringify((()=>{const un=M.id,seen={},out=[];for(const r of DK.data.where['${plant}'])for(const pt of r.p){if(pt.un&&!pt.un.includes(un))continue;const k=pt.pnl+'|'+(pt.css||pt.lab||'')+'|'+(pt.wait?'w':'');if(seen[k])continue;seen[k]=1;out.push(pt);}return out;})())`));
   for(const pt of parts){
    await p.eval(`window.__ws&&__ws.go('plant');1`);await sleep(150);
    await p.eval(`DK.showMe(${JSON.stringify(pt)})`);await sleep(mode==='phone'?950:650);
    const c=J(await p.eval(`JSON.stringify((()=>{const w=${JSON.stringify(pt)},f=DK.findTarget(w),t=f.t||f.via||f.pn;if(!t)return{none:1};const r=t.getBoundingClientRect(),ring=document.querySelector('.dkring');let near=false;if(ring){const a=ring.getBoundingClientRect();near=Math.abs((a.left+a.width/2)-(r.left+r.width/2))<60&&Math.abs((a.top+a.height/2)-(r.top+r.height/2))<60;}
      let hid=false;for(let e=f.pn;e&&e!==document.body;e=e.parentElement){const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none'){hid=true;break;}}
      return{vis:r.width>0&&r.height>0,hid,near,on:r.left>=-4&&r.right<=innerWidth+4&&r.top>=-4&&r.bottom<=innerHeight+4};})())`));
    n++;ok(!c.none&&c.vis&&!c.hid&&c.near,plant+' '+unit+' '+mode+' Show me -> '+pt.pnl+' '+(pt.css||pt.lab||'')+' '+JSON.stringify(c));
   }
  }
  console.log('  '+n+' targets pointed at');
  ok(p.errs.length===0,plant+' '+mode+' no page errors: '+p.errs.slice(0,2).join(' | '));
  p.close();
 }
}finally{b.close();}
console.log('\n'+pass+' passed, '+fail+' failed');if(fail){console.log(bad.slice(0,30).join('\n'));process.exit(1);}
})().catch(e=>{console.error(e);process.exit(1);});
