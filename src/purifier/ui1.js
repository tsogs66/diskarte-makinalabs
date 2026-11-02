/* --- state and helpers --- */
const $=id=>document.getElementById(id),fx=(v,n=1)=>(v==null||!isFinite(v))?'–':Number(v).toFixed(n);
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
let key='s826',M=MODELS[key],u,s,f,speed=1,paused=false,auto=false,proc='start',horn=false,motion=true,logN=0,acc=0,alAcc=0,hist=[],curDrill=null,seven='t',typed={},fuelId='ref';
const UNITS={};
function mkUnit(k){const m=MODELS[k],x=coldInputs(k);x.fuel=Object.assign({},F0,FUELS[0]);x.disc=m.discs?bestDisc(m,x.fuel,98,m.Q380):null;x.pw=m.attached?0:1;x.chk=0;x.lmOn=0;
 return {u:x,s:coldState(m),f:{},hist:[],typed:{}};}
for(const k in MODELS)UNITS[k]=mkUnit(k);
function bind(){const o=UNITS[key];u=o.u;s=o.s;f=o.f;hist=o.hist;typed=o.typed;M=MODELS[key];}
bind();
const note=(t,k)=>say(s,t,k||'n');
const isA=()=>!M.attached;

/* --- operator actions --- */
function pressSep(){
 if(['sep','closing','dis'].includes(s.ph)){note(kS()+' pressed: stop sequence');
  if(s.ph==='sep'){s.stopAfter=1;doDischarge(s,u,M,'Stop sequence: last sludge discharge');}else s.stopAfter=1;return;}
 if(s.ph==='wait'){s.ph='stopseq';s.heaterOn=0;s.tBusy=0;return;}
 if(s.ph==='standst'||s.ph==='rundown'){s.asked=1;}}
function lcdKey(k){
 if(s.asked===1){if(k==='-'){s.asked=0;s.ph='start';s.tStart=0;note('Start sequence begins');}else s.asked=2;return;}
 if(s.asked===2){if(k==='+')s.asked=3;else{s.asked=0;note('Bowl not confirmed as assembled. Start cancelled.','w');}return;}
 if(s.asked===3){s.asked=0;s.calib=1;s.ph='start';s.tStart=0;note('Calibration done, start sequence begins');}}
function pressDis(){if(s.ph!=='sep'){note('Discharge is only possible while separating.','w');return;}
 if(s.vib>M.vibW)note('Never discharge a vibrating separator: vibration may become violent.','a');s.pendDis=1;}
function setHeater(on){s.heaterOn=on?1:0;if(on&&!u.stm)note('Heater on with the steam valve shut.','w');if(on&&!s.Q)note('Heater on with no oil flow.','w');}
function setMotor(on){
 if(on){
  if(s.alarm.vibS&&s.rpm>0){note('Restart refused: high vibration alarm while rotating.','a');return;}
  if(!u.mccb){note(M.attached?'Starter breaker is OFF.':'Starter main switch is OFF.','w');return;}
  if(M.attached&&!u.pw)note('Motor started with CONT. SOURCE off. The automatic control panel will not work.','w');
  if(u.brake)note('Motor started with the brake applied.','w');
  s.motor=1;s.tStart=0;if(M.attached&&s.ph==='off')s.ph='start';
  if(!M.attached&&s.ph!=='start'&&s.ph!=='wait'&&s.ph!=='sep')note('Motor started outside the sequence.');
 }else{s.motor=0;if(s.ph==='sep'||s.ph==='wait')note('Motor stopped from the starter with the sequence running. Stop from the control unit instead.','w');if(s.ph!=='off'&&s.ph!=='standst')s.ph='rundown';s.sc=null;}}
function setPump(on){s.pump=on?1:0;if(on&&!u.suc)note('Feed pump started with the suction valve shut.','w');}
function eStop(){s.motor=0;s.heaterOn=0;s.ph='estop';s.sc=null;s.pumpOffT=0;if(M.attached)s.pump=0;note('EMERGENCY STOP. Leave the room until the bowl has stopped.','a');}
function autoStart(){if(M.attached&&!u.pw){note('CONT. SOURCE is OFF. Turn it ON at the automatic control panel.','w');return;}if(s.ph!=='wait'&&s.ph!=='hold'){note(`AUTO START needs rated speed and oil at temperature. Now ${Math.round(s.rpm*M.rpmR)} rpm, ${fx(s.T)} °C.`,'w');return;}beginProcess(s,u,M);}
function autoStop(){if(s.ph==='sep'){s.stopAfter=1;doDischarge(s,u,M,'AUTO STOP: bypass, replacement, sludge discharge');}else if(s.motor){s.motor=0;s.ph='rundown';}}
function resetAl(){if(s.ph==='estop'&&s.rpm>0){note('Emergency stop resets only at zero speed.','w');return;}
 if(s.ph==='estop'){s.ph=M.attached?'off':'standst';}
 if(s.ph==='hold'){s.ph=s.rpm>.97?'wait':'rundown';}s.ndT=0;s.nFast=0;s.tAl30=0;for(const k in s.alarm)if(!s.alarm[k].on)delete s.alarm[k];}
function clearBowl(){if(s.rpm>0){note('Stop and wait for zero speed before opening the bowl.','w');return;}s.foul=0;s.hard=0;s.Vs=0;s.Vw=0;s.Voil=0;f.stack=false;f.unbal=false;f.nozzle=false;f.pilot=false;f.sealRing=false;f.closeLeak=false;note('Bowl opened, cleaned and reassembled');renderFaults();}

/* --- procedures --- */
const A_START=()=>[
 ['Check sump oil level, supply frequency and brake off',()=>u.chk,()=>{u.chk=1;u.brake=0;},'Too much or too little oil damages the bearings. A wrong frequency overspeeds the bowl.'],
 ['Open control air, '+M.Pa.join(' to ')+' bar',()=>u.aOn,()=>u.aOn=1,'Air moves the change-over valve.'],
 ['Open operating water, '+M.Pw.join(' to ')+' bar',()=>u.wOn,()=>u.wOn=1,'Water closes and opens the bowl.'],
 ['Line up tank suction, recirculation, outlet and sludge tank valves',()=>u.suc&&u.ret&&u.out&&u.slv,()=>{u.suc=1;u.ret=1;u.out=1;u.slv=1;},'The sludge valve must be open, or a discharge has nowhere to go.'],
 ['Main switch ON at the separator starter',()=>u.mccb,()=>{u.mccb=1;},'No control voltage without it.'],
 ['Start the feed pump, set flow with '+M.tag.flow,()=>s.pump,()=>setPump(1),'Oil circulates through the heater and back to the tank.'],
 ['Open steam, switch the heater on',()=>u.stm&&s.heaterOn,()=>{u.stm=1;setHeater(1);},'Fuel must reach the correct temperature before it enters the bowl.'],
 [`Press ${kS()} and answer the bowl questions`,()=>!['standst'].includes(s.ph)||s.asked,()=>{pressSep();lcdKey('-');},'Answer YES if the bowl was opened.'],
 ['Answer the display',()=>!s.asked,()=>lcdKey('-'),''],
 ['Push START on the separator starter',()=>s.motor,()=>setMotor(1),'Listen and watch. Vibration near critical speed is normal if it passes.'],
 ['Wait for full speed',()=>s.rpm>=.97,null,'Current peaks, then falls to a low steady value.'],
 ['Wait for '+u.Ts+' °C, display shows Standby',()=>['closing','sep','dis'].includes(s.ph),null,'The bowl closes and the process starts by itself.'],
 ['Sequence closes bowl and adds water',()=>s.ph==='sep'||s.ph==='dis',null,''],
 ['Set back pressure to normal with '+M.tag.back,()=>Math.abs(s.Pout-M.Pb)<.25,()=>{},'Normal value is set at commissioning.'],
 ['Check display, outlets and vibration',()=>s.tSince>60,null,'']];
const A_STOP=()=>[
 [`Press ${kS()}`,()=>['stopseq','rundown','standst','dis'].includes(s.ph)||s.stopAfter,()=>pressSep(),'Never stop by the motor switch.'],
 ['Last sludge discharge runs',()=>['stopseq','rundown','standst'].includes(s.ph),null,''],
 ['Heater off, pump stops when oil cools',()=>['rundown','standst'].includes(s.ph),null,''],
 ['Wait for standstill, '+Math.round(M.tStop/60)+' min without brake',()=>s.rpm<=0,null,'Do not start dismantling until rotation has stopped.'],
 ['Close steam, operating water and air',()=>!u.stm&&!u.wOn&&!u.aOn,()=>{u.stm=0;u.wOn=0;u.aOn=0;},'Close the source valve: water reaching a stopped machine can enter the gear oil.']];
const J_START=()=>[
 ['Check gear oil, brake off, frequency',()=>u.chk,()=>{u.chk=1;u.brake=0;},''],
 ['Confirm V5 to V10 and the sludge tank valve are open, air 0.5 to 0.9 MPa, water 0.3 to 0.5 MPa',()=>u.suc&&u.ret&&u.out&&u.aOn&&u.wOn&&u.slv,()=>{u.suc=1;u.ret=1;u.out=1;u.aOn=1;u.wOn=1;u.slv=1;},''],
 ['Starter breaker ON',()=>u.mccb,()=>{u.mccb=1;},'Power goes on in this order: starter, automatic control panel, Multi-Monitor.'],
 ['CONT. SOURCE ON at the automatic control panel: panel and Multi-Monitor light',()=>u.pw,()=>u.pw=1,'Always in that order.'],
 ['MM FUNCTION on, LM ALARM OUTPUT off',()=>u.mm&&(!u.lmOn||s.ph==='sep'),()=>{u.mm=1;u.lmOn=0;},'Set this before adjusting flow or pressure.'],
 ['Press START on the starter',()=>s.motor,()=>setMotor(1),'Gear pump runs with the purifier. Rated speed in under 5 min, current 50 to 70 % of rating.'],
 ['Start the oil heater',()=>u.stm&&s.heaterOn,()=>{u.stm=1;setHeater(1);},'Oil circulates through the bypass.'],
 ['Wait for rated speed and 98 °C',()=>s.rpm>=.97&&Math.abs(s.T-u.Ts)<6,null,''],
 ['Press AUTO START on the panel',()=>['closing','sep','dis'].includes(s.ph),()=>autoStart(),'Opening bowl, replacement water, discharge, sealing water, feeding.'],
 ['Confirm discharge by current and sound',()=>s.ph==='sep',null,''],
 ['Set feed rate with V5 and V8, check no oil at the outlets',()=>Math.abs(s.Q-u.q)<u.q*.1,null,''],
 ['Adjust V6 to 0.15 MPa',()=>Math.abs(s.Pout-1.5)<.2,()=>{},'Green lamp flashes within 15 %, steady within 3 %.'],
 ['Multi-Monitor FUNCTION off then on, LM ALARM OUTPUT on',()=>u.lmOn,()=>u.lmOn=1,'Recheck after 5 min when temperature settles.']].concat(M.hid?[['Set circulation line to 0.1 MPa with V12, water detector on',()=>u.v12&&u.wd,()=>{u.v12=1;u.wd=1;},'Below 0.15 MPa. Pressure falls when separated water reaches the top disc.']]:[]);
const J_STOP=()=>[
 ['Press AUTO STOP',()=>s.stopAfter||['stopseq','rundown','off'].includes(s.ph),()=>autoStop(),'Feed to bypass, replacement, discharge, then the motor stops.'],
 ['Sequence finishes, motor stops',()=>['rundown','off'].includes(s.ph),null,''],
 ['Stop the oil heater',()=>!s.heaterOn,()=>setHeater(0),''],
 ['Wait for stop, watch the safety joint',()=>s.rpm<=0,null,'Vibration at low speed is normal.'],
 ['Close feed valves V7 and V10, then water and air',()=>!u.suc&&!u.wOn&&!u.aOn,()=>{u.suc=0;u.out=0;u.wOn=0;u.aOn=0;u.stm=0;},'Keep the operating water source shut.']];
const steps=()=>isA()?(proc==='start'?A_START():A_STOP()):(proc==='start'?J_START():J_STOP());
function runAuto(){const st=steps();for(const r of st){if(r[1]())continue;if(r[2])r[2]();return;}auto=false;setAutoBtn();note('Procedure complete');}
function setAutoBtn(){$('auto').setAttribute('aria-pressed',auto);$('auto').textContent=auto?'Stop auto-run':'Auto-run these steps';}
function jumpRun(){u.slv=1;u.chk=1;u.brake=0;u.aOn=u.wOn=u.stm=u.suc=u.ret=u.out=1;u.pw=1;u.mccb=1;u.lmOn=isA()?0:1;u.wd=1;u.v12=1;s.heaterOn=1;s.pump=1;s.motor=1;s.rpm=1;s.T=u.Ts;s.Q=u.q;s.asked=0;s.c=1;s.closed=true;s.bowlOpen=false;s.sc=null;s.stopAfter=0;s.sv=SV0();
 s.Vs=.15*M.Vsm;const p=perf(s,u,f,M);s.Vw=CL(M)?.7:needW(M,Math.min(p.ri,M.Rb),s.Vs);s.Voil=M.Vb-s.Vs-s.Vw;s.ph='sep';s.tSince=120;s.Pout=M.Pb;s.tRun=M.tRun+40;s.I=clamp((u.q/3600*.93*2.05*(u.Ts-u.Tt))/M.heat);s.cAlSi=p.alOut;s.cW=p.wOut;s.cNa=p.naOut;step(s,u,f,M,.01);note('Jumped to normal running');}

/* --- alarms --- */
let tilesFor=null;
function evalAlarms(){const rows=alarmRows(M),p=s.d;let any=false;
 if(s.ph==='start')s.tStart+=1;
 for(const [id,txt,lv,c] of rows){const on=!!c(s,u,p);const a=s.alarm[id];
  if(on&&!a){s.alarm[id]={txt,lv,on:true,ack:false};say(s,txt,lv>1?'a':'w');react(id);if(horn)beep();}
  else if(on)a.on=true;else if(a)a.on=false;
  if(on&&lv>1)any=true;}
 s.tAl30=any?s.tAl30+1:0;
 if(s.tAl30>1800&&s.ph==='sep'){note('Alarm not remedied in 30 minutes: stop sequence begins','a');pressSep();s.tAl30=0;}
 /* Multi-Monitor leakage monitor: pressure drop from the memorised value */
 if(!isA()&&u.lmOn&&u.mm&&s.mem&&s.ph==='sep'&&s.lmT>40){if(s.Pout<s.mem-.2||s.Pout<1.2)s.lmHold+=1;else s.lmHold=0;if(s.lmHold>=15&&!s.alarm.lm){s.alarm.lm={txt:'01 Oil leakage (LEAK) by LM',lv:2,on:true};say(s,'Leakage Monitor: light liquid pressure fell','a');react('leak');}}
}
function react(id){
 if(id==='vibS'){s.motor=0;s.heaterOn=0;s.ph='safety';s.sc=null;note('Safety stop. Keep the bowl filled during rundown.','a');}
 if(id==='spdH'){s.motor=0;s.heaterOn=0;s.ph='safety';s.sc=null;}
 if(id==='hiT'){s.heaterOn=0;}
 if(id==='leak'&&s.ph==='sep'){if(isA()){s.ph='hold';s.sc=null;note('Feed sent to recirculation.','a');}else{s.stopAfter=1;doDischarge(s,u,M,'LEAK: feed stopped, replacement, discharge, then the purifier stops');}}
  if(id==='nodis'&&s.ph==='sep'){s.ph='hold';note('Feed sent to circulation. Motor continues.','a');}
}
let ac=null;function beep(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=680;g.gain.value=.03;o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+.18);}catch(e){}}

/* --- tick --- */
function tankStep(dt){const V=3*M.Q380,o=s.Qo/3600,use=.8*M.Q380/3600;s.lvD+=(o-use)*dt/V;s.lvS-=o*dt/V;if(s.lvD>.92){s.lvS+=s.lvD-.92;s.lvD=.92;}if(s.lvD<.1)s.lvD=.1;if(s.xfer){s.lvS+=3*M.Q380/3600*dt/V;if(s.lvS>=.85)s.xfer=0;}else if(s.lvS<.35)s.xfer=1;}
function simStep(dt){step(s,u,f,M,dt);tankStep(dt);alAcc+=dt;if(alAcc>=1){alAcc-=1;evalAlarms();if(auto)runAuto();if(Math.floor(s.t)%(hist.length>360?30:10)===0)pushHist();}}
function pushHist(){hist.push({t:s.t,T:s.T,Q:s.Q,P:s.Pout,r:s.rpm*M.rpmR,w:s.mtW,V:s.Vs});if(hist.length>500)hist.shift();}
function tick(){if(paused)return;acc+=.1*speed;let n=0;while(acc>=.25&&n<1200){simStep(.25);acc-=.25;n++;}if(n===1200)acc=0;}
setInterval(tick,100);
