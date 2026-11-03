/* Headless checks for the marine boiler model. Needs jsdom on NODE_PATH or locally. */
const fs=require('fs'),path=require('path');
let JSDOM;
try{({JSDOM}=require('jsdom'));}
catch(e){
  console.error('boiler-check: install jsdom (NODE_PATH or npm install jsdom)');
  process.exit(1);
}
const file=path.join(__dirname,'..','sim-source','boiler-simulator.html');
let html=fs.readFileSync(file,'utf8').replace('requestAnimationFrame(frame);','/* no loop */');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{
  runScripts:'dangerously',url:'http://localhost/boiler-simulator.html',pretendToBeVisual:true
});
const B=dom.window.__boiler;
if(!B){console.error('missing __boiler');process.exit(1);}
const fail=[];
const ok=(name,cond,extra)=>{if(!cond)fail.push(name+(extra?' '+extra:''));else console.log('ok',name);};
const sim=(n,dt=0.25)=>{for(let i=0;i<n;i++)B.step(dt);};
const sc=id=>B.SC.findIndex(c=>c.id===id);

B.loadScenario(sc('cold'));
const p0=B.s.P;
sim(40);
ok('cold stays dark',!B.s.flame&&B.s.P<2,'P='+B.s.P.toFixed(2));

B.loadScenario(sc('air'));
const casc0=B.s.casc;
sim(20);
ok('air-bound blocks make-up',B.s.airBound&&B.s.casc<=casc0+1,'casc='+B.s.casc.toFixed(0));
B.u.bleed=true;
sim(8);
ok('bleed restores make-up',!B.s.airBound&&B.s.casc>casc0+4,'casc='+B.s.casc.toFixed(0));

B.loadScenario(sc('water'));
const cl0=B.s.chem.Cl;
B.u.dose=true;B.u.doseRate=100;
sim(40);
ok('dose does not clear chloride',B.s.chem.Cl>=cl0-1,'Cl='+B.s.chem.Cl.toFixed(1));
B.applyWaterAct('bd50');
const cl1=B.s.chem.Cl;
sim(40);
ok('blowdown lowers chloride',B.s.chem.Cl<cl1-1,'Cl='+B.s.chem.Cl.toFixed(1));

B.loadScenario(sc('steady'));
B.s.FO_T=40;B.u.fuel='HFO';
sim(2);
ok('viscosity gate cuts flame',!B.s.flame&&B.s.lockout);

B.loadScenario(sc('steady'));
sim(4);
const held=B.s.dump;
B.setDumpAuto(false);
ok('dump manual is bumpless',Math.abs(B.u.dumpMan-held)<0.6,'man='+B.u.dumpMan+' was='+held);

B.loadScenario(sc('steady'));
const phot=B.s.P;
B.s.flame=false;B.s.seq='off';B.u.mode='off';B.u.meLoad=0;B.u.demand=0;B.u.steamStop=false;
B.s.level=B.s.levelTrue=0.35;B.s.mw=B.M.drumKg*0.35;B.u.feed=true;B.u.LvlSp=0.7;
sim(80);
ok('cold feed pulls pressure down',B.s.P<phot-0.15,'P '+phot.toFixed(2)+'→'+B.s.P.toFixed(2));

B.loadScenario(sc('steady'));
sim(160);
ok('steady pressure holds',Math.abs(B.s.P-B.u.Psp)<1.2&&B.s.flame,'P='+B.s.P.toFixed(2)+' SP='+B.u.Psp+' flame='+B.s.flame);

B.loadScenario(sc('steady'));
B.u.mode='off';
sim(40);
ok('post-purge completes with mode off',B.s.seq==='off'&&!B.s.flame,'seq='+B.s.seq);

B.switchModel('saacke');
B.loadScenario(sc('steady'));
B.s.levelTrue=B.M.Llwl;B.u.egCirc=true;
sim(2);
ok('SAACKE EG dry-run trips',B.s.egDryTrip&&!B.u.egCirc);

B.switchModel('mission');
B.loadScenario(sc('soot'));
sim(4);
const egDirty=B.s.egSteam,dpDirty=B.s.egDP,foDirty=B.s.FO_P;
ok('dirty filter drops FO pressure',foDirty<2,'FO_P='+foDirty.toFixed(2));
ok('soot raises EG ΔP',dpDirty>1.8,'dP='+dpDirty.toFixed(2));
B.changeFoFilter();
sim(1);
ok('filter change-over restores FO pressure',B.s.FO_P>2,'FO_P='+B.s.FO_P.toFixed(2));
const started=B.s.sootBlowT===0;
B.startSootBlow();
ok('soot blow accepts steam',B.s.sootBlowT>0);
sim(34);
ok('soot blow clears the bank',!B.f.egSoot&&B.s.sootBlowT===0);
sim(2);
ok('EG steam recovers after soot blow',B.s.egSteam>egDirty+0.05,'EG '+egDirty.toFixed(2)+'→'+B.s.egSteam.toFixed(2));
ok('EG ΔP falls after soot blow',B.s.egDP<dpDirty-0.4,'dP '+dpDirty.toFixed(2)+'→'+B.s.egDP.toFixed(2));
void started;

B.loadScenario(sc('inspect'));
B.runInspection('lwl');
const passBtn=()=>dom.window.document.querySelector('[data-ip="lwl"]');
ok('LWL latches',!!B.s.trips.LWL&&B.f.lwlTest&&B.insp.lwl.saw);
ok('PASS button stays disabled',passBtn()&&passBtn().disabled);
B.finishInspection('lwl',true);
ok('PASS blocked before ack',B.insp.lwl.pass==null);
B.clearInspection('lwl');
ok('clear blocked before ack',B.f.lwlTest&&!B.insp.lwl.cleared);
B.ackAll();
B.clearInspection('lwl');
sim(1);
ok('LWL clears without lockout reset',!B.f.lwlTest&&B.insp.lwl.cleared&&B.inspReady('lwl'));
B.finishInspection('lwl',true);
ok('LWL PASS',B.insp.lwl.pass===true&&/PASS/.test(B.log[0].line));

B.loadScenario(sc('inspect'));
B.runInspection('ff');
ok('flame fail locks out',B.s.lockout&&B.s.trips.FF&&B.s.seq==='trip'&&!B.s.flame);
B.ackAll();
B.resetLockout();
ok('reset blocked while flame-fail test is on',B.s.lockout&&!B.insp.ff.reset);
B.clearInspection('ff');
B.resetLockout();
ok('reset after clear',!B.s.lockout&&B.insp.ff.reset&&B.inspReady('ff'));
B.finishInspection('ff',true);
ok('flame-fail PASS',B.insp.ff.pass===true);

B.loadScenario(sc('inspect'));
B.runInspection('hp');
ok('high P trips and holds dump shut',B.s.trips.HP&&B.s.lockout&&B.f.dumpStuck&&B.s.seq==='trip');
B.ackAll();
B.clearInspection('hp');
ok('clear releases the dump',!B.f.dumpStuck&&!B.f.hpTest);
sim(2);
B.resetLockout();
B.finishInspection('hp',true);
ok('high P PASS',B.insp.hp.pass===true&&!B.s.lockout);

B.loadScenario(sc('cold'));
B.startSootBlow();
ok('soot blow refused when cold',B.s.sootBlowT===0);

B.loadScenario(sc('eye'));
sim(2);
ok('dirty scanner locks the flame out',!B.s.flame&&B.s.lockout&&B.f.flameEye);
ok('reset blocked while scanner is dirty',B.resetLockout()===false&&B.s.lockout);
B.cleanFlameEye();
ok('scanner cleaned',!B.f.flameEye&&B.s.lockout);
ok('reset after the scanner is clean',B.resetLockout()===true&&!B.s.lockout);
B.u.burnerStart=true;
sim(80);
ok('burner relights after clean and reset',B.s.flame&&B.s.seq==='main','seq='+B.s.seq);

B.loadScenario(sc('water'));
ok('water exercise starts with a seawater leak',B.f.cascLeak);
B.applyWaterAct('bd50');
sim(40);
const midCl=B.s.chem.Cl;
B.u.blowdown=0;
sim(80);
ok('chloride rebounds while the leak is open',B.s.chem.Cl>midCl+1,'Cl '+midCl.toFixed(1)+'→'+B.s.chem.Cl.toFixed(1));
B.applyWaterAct('fixLeak');
const heldCl=B.s.chem.Cl;
sim(80);
ok('isolating the leak stops the rebound',!B.f.cascLeak&&B.s.chem.Cl<heldCl+0.6,'Cl '+heldCl.toFixed(1)+'→'+B.s.chem.Cl.toFixed(1));

B.loadScenario(sc('inspect'));
B.runInspection('ff');
B.f.flameEye=true;
B.cleanFlameEye();
ok('scanner clean does not clear an inspection flame test',B.f.flameTest&&B.f.flameEye);

if(fail.length){console.error('FAILED',fail.length);fail.forEach(x=>console.error(' -',x));process.exit(1);}
console.log('boiler-check passed');
