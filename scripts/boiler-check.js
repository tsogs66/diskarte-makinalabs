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

const doc=dom.window.document,at=(id,k)=>{const e=doc.getElementById(id);return e?e.getAttribute(k):null;};
B.switchModel('mission');
B.loadScenario(sc('steady'));sim(8);B.paintMimic();
ok('mimic has no EG circ pump on Mission',!doc.getElementById('bmPump'));
ok('mimic flame lit when firing',+at('bmFlame','opacity')===1);
ok('mimic EG arrows lit with ME load',+at('bmEgOut','opacity')>0.35&&+at('bmEgIn','opacity')>0.35);
ok('mimic oil flue lit when firing',+at('bmFlue','opacity')>0.5);
const wyNorm=+at('bmWater','y');
B.s.level=0.2;B.paintMimic();
ok('mimic water line drops with level',+at('bmWater','y')>wyNorm+30,'y '+wyNorm+'→'+at('bmWater','y'));
B.loadScenario(sc('egonly'));sim(4);B.paintMimic();
ok('mimic flame out in EG-only',+at('bmFlame','opacity')===0&&+at('bmFlue','opacity')<0.2);
ok('mimic EG arrows lit in EG-only',+at('bmEgOut','opacity')>0.35);
B.loadScenario(sc('soot'));sim(2);B.paintMimic();
ok('mimic tubes dark when sooted',at('bmTubes','stroke')==='#2a2523');
B.startSootBlow();sim(2);B.paintMimic();
ok('mimic shows soot blow puffs',+at('bmPuffs','opacity')===1);
sim(40);B.paintMimic();
ok('mimic tubes clean after blow',at('bmTubes','stroke')!=='#2a2523'&&+at('bmPuffs','opacity')===0);
B.switchModel('saacke');
B.loadScenario(sc('steady'));sim(4);B.paintMimic();
ok('mimic shows EG circ pump on SAACKE',!!doc.getElementById('bmPump')&&at('bmPump','fill')==='#1c8446');
const lampFill=i=>at('bmL'+i,'fill');
const burnerOf=id=>{B.switchModel(id);B.paintMimic();return doc.querySelector('[data-slot="burner"]').innerHTML;};
const panelOf=id=>{B.switchModel(id);B.paintMimic();return doc.querySelector('[data-slot="panel"]').innerHTML;};
const bs={},ps={};['mission','saacke','kangrim','miura'].forEach(id=>{bs[id]=burnerOf(id);ps[id]=panelOf(id);});
ok('burner glyph differs per maker',new Set(Object.values(bs)).size===4);
ok('control-panel glyph differs per maker',new Set(Object.values(ps)).size===4);
B.switchModel('saacke');B.loadScenario(sc('steady'));sim(4);B.paintMimic();
ok('SAACKE panel Main lamp on when firing',lampFill(2)==='#2fbf5f'&&lampFill(4)==='#3a4448');
ok('SAACKE panel EG circ lamp follows the pump',lampFill(5)==='#2fbf5f');
B.switchModel('mission');B.loadScenario(sc('steady'));sim(4);B.paintMimic();
ok('Mission panel Flame lamp on',lampFill(0)==='#2fbf5f'&&lampFill(1)==='#3a4448');
ok('Mission screen shows firing',/FIRING/.test(doc.getElementById('vScr1').textContent));

B.u.steamStop=true;B.u.demand=0.6;B.u.dumpAuto=false;B.u.dumpMan=0;sim(3);B.paintMimic();
ok('service steam arrow lit with steam stop open',+at('bmSvcArr','opacity')===1);
B.u.steamStop=false;sim(3);B.paintMimic();
ok('service steam arrow dim with steam stop shut',+at('bmSvcArr','opacity')<0.5);

B.u.dumpMan=60;sim(5);B.paintMimic();
ok('dump line turns amber when dumping',at('bmDumpL','stroke')==='#c98a00'&&B.s.retKg>0);
ok('condensate return line live when dumping',at('bmRetL','stroke')==='#2b78c0');
B.u.dumpMan=0;B.u.steamStop=true;

B.u.blowdown=40;sim(2);B.paintMimic();
ok('overboard blowdown arrow lit',+at('bmBdArr','opacity')===1&&at('bmBd','fill')==='#1c8446');
B.u.blowdown=0;sim(2);B.paintMimic();
ok('overboard blowdown arrow dim when shut',+at('bmBdArr','opacity')<0.5);

B.u.dose=true;B.f.doseEmpty=false;B.s.dose=30;sim(2);B.paintMimic();
ok('dosing pump running',at('bmDoseP','fill')==='#1c8446');
B.f.doseEmpty=true;sim(2);B.paintMimic();
ok('dosing pump red when tank empty',at('bmDoseP','fill')==='#c4211f');
B.f.doseEmpty=false;B.u.dose=false;

B.f.cascLeak=true;B.paintMimic();
ok('seawater leak marker shows',+at('bmLeak','opacity')===1);
B.f.cascLeak=false;B.paintMimic();

B.s.chem.Cl=120;B.paintMimic();
ok('salinometer red on high chloride',at('bmSal','fill')==='#c4211f');

B.u.meLoad=0.5;B.paintMimic();
ok('ME load bar follows load',Math.abs(+at('bmMeBar','width')-84)<1);

B.loadScenario(sc('steady'));B.u.steamStop=true;B.u.demand=0.8;B.u.dumpAuto=false;B.u.dumpMan=0;
B.s.casc=B.M.cascKg*0.5;B.s.cascT=45;
const c0=B.s.casc;sim(60);
ok('service steam condensate returns to the hot well',B.s.retKg>0&&B.s.casc>c0-0.5*B.s.feedKg*60-1,'ret '+B.s.retKg.toFixed(3));
B.s.casc=B.M.cascKg*0.5;B.s.cascT=45;B.u.dumpMan=80;sim(120);
ok('dump condensate warms the hot well',B.s.cascT>46,'T '+B.s.cascT.toFixed(1));
ok('hot well never exceeds tank',B.s.casc<=B.M.cascKg+1e-6);
B.u.dumpMan=0;
B.switchModel('mission');

if(fail.length){console.error('FAILED',fail.length);fail.forEach(x=>console.error(' -',x));process.exit(1);}
console.log('boiler-check passed');
