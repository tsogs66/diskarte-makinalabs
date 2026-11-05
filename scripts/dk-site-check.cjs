/* Checks a website build made by `site-protect.cjs <dir> test`: serves it on localhost and opens each simulator page in headless Chrome.
   usage: node scripts/dk-site-check.cjs <siteDir>
   Passes only if the scrambled pages run, carry no boiler data, and no boiler page is served. */
const http=require('http'),fs=require('fs'),path=require('path');
const {launch,sleep}=require('./dk-cdp.cjs');
const ROOT=path.resolve(process.argv[2]||'');if(!process.argv[2]||!fs.existsSync(ROOT)){console.error('usage: node scripts/dk-site-check.cjs <siteDir>');process.exit(2);}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(ROOT,p);if(!f.startsWith(ROOT)){r.writeHead(403);r.end();return;}fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end('nf');return;}r.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});r.end(d);});}).listen(8799);
(async()=>{const b=await launch(9470);let bad=0;const chk=(n,ok,i)=>{if(!ok)bad++;console.log((ok?'  ok   ':'  FAIL ')+n+(i!==undefined?'  '+JSON.stringify(i):''));};
 try{
  for(const [pg,plant] of [['app-purifier.html','pur'],['app-fwg-simulator-app.html','fwg'],['mobile-purifier.html','pur'],['mobile-fwg.html','fwg']])for(const [sz,o] of [['desktop',{w:1366,h:768}],['phone',{w:390,h:844,mobile:true,dpr:2}]]){
   console.log('\n== '+pg+' Â· '+sz);const p=await b.newPage();await p.open('http://localhost:8799/'+pg+'?dk=quiet',Object.assign({wait:3500},o));
   chk('no page errors',p.errs.length===0,p.errs.slice(0,2));
   chk('stayed on the page (the test build allows localhost)',(await p.eval('location.pathname')).endsWith(pg));
   const ms=await p.eval('(async()=>{const t0=performance.now();while(!window.DK&&performance.now()-t0<30000)await new Promise(r=>setTimeout(r,50));return Math.round(performance.now())})()');
   chk('DK loaded for '+plant,await p.eval('!!window.DK&&DK.plant==='+JSON.stringify(plant)),ms+' ms after navigation');
   chk('page starts fast (under 6 s, '+sz+', no CPU throttle)',ms<6000,ms+' ms');
   chk('procedure readable',await p.eval('!!DK.readProc()'));
   const d=await p.eval('JSON.stringify(DK.data)');chk('page carries no boiler data',!/"boiler"/.test(d)&&!/Chloride high|soot fire|Composite boiler/i.test(d),d.length+' bytes of DK data');
   await p.eval('DK.openAlarms();DK.openComp();DK.openLearn();DK.openFid()');await sleep(500);
   chk('companion windows open',await p.eval('["alarms","comp","learn","fid"].every(k=>!document.getElementById("dkw_"+k).hidden)'));
   chk('licence line present',await p.eval('!!document.getElementById("mklNotice")'));
   p.close();}
  for(const f of ['boiler-simulator-app.html','mobile-boiler.html','app-boiler-simulator-app.html','boiler-simulator.html']){const r=await fetch('http://localhost:8799/'+f);chk('/'+f+' is not served',r.status===404,r.status);}
  const idx=await (await fetch('http://localhost:8799/index.html')).text();chk('home page has no boiler',!/boiler/i.test(idx));
 }finally{b.close();srv.close();}
 console.log('\n'+(bad?bad+' FAILED':'all site checks passed'));process.exit(bad?1:0);})().catch(e=>{console.error('CRASH',e);process.exit(2);});
