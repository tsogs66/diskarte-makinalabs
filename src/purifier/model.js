/* Purifier model. One lumped bowl plus its fuel, heater, operating water, air and control sequence.
   Maker figures are noted in MODELS; anything marked est is fitted or derived, see the Basis tab. */
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const SV0=()=>({feed:0,seal:0,open:0,close:0,drain:0,par:0,v4x:0});
const CL=M=>M.alcap||M.hid;

/* s826: books 1810571, 1810572 and 1810573 (S-type, EPC 50), parameter list row S 821/S 826; 2400 L/h, 12086 rpm, 6.4 kW from dealer data.
   p605: instruction manual 577460-02, operating water interface 5.8.6; leaflet for capacity on trunk lube oil.
   sj30g: Selfjector G-series Operation Manual 2 and Maintenance Manual; Tables 3-1, 3-3, 3-8, 3-9, 3-15. */
const MODELS={
 s826:{id:'s826',tab:'S 826',name:'Alfa Laval S 826',ctrl:'EPC 50',alcap:true,Q380:2400,Qpump:3200,Qmax:6000,rpmR:12086,kW:6.4,fla:13,
  tRun:360,tStop:1700,tBrake:1700,spdH:13300,spdL:11000,Vb:3.5,Rb:104,R0:35,Rs:80,Vsm:1.2,Vdis:1.6,Qseal:.9,Qopen:11,Qclose:2.8,heat:62,Pb:1.5,P1:1.4,Pmax:3,
  iv:120,ivMin:1,ivMax:300,vibW:7,vibS:11,dip:.05,tCl:12,mk:5,mkT:1,Pw:[2,6],Pa:[5,7],rhoMax:1010,trig:.2,qDrain:90,
  tag:{feed:'V1',seal:'SV10',open:'SV15',close:'SV16',drain:'V5',airFeed:'SV1',airDrain:'SV5',flow:'RV4',back:'RV1',pIn:'PT1',pOut:'PT4',pW:'PT5',tt:'TT1',mt:'MT50'},
   scr:{
   start:[['Ti 56 Discharge, SV15',3,{open:1}],['Ti 57 Pause, draining',15,{}],['Ti 58 Close bowl, SV16',15,{close:1}],['Ti 60 Discharge, SV15',5,{open:1}],['Ti 61 Pause, draining',15,{}]],
   startC:[['Ti 56 Discharge, SV15',3,{open:1}],['Ti 57 Pause, draining',15,{}],['Ti 58 Close bowl, SV16',15,{close:1}],['Ti 59 Flow calibration, V4 and SV10',170,{seal:1,v4x:1}],['Ti 60 Discharge, SV15',5,{open:1}],['Ti 61 Pause, draining',15,{}]],
   ref:[['Ti 62 Close bowl, SV16',15,{close:1}],['Ti 63 Conditioning water, SV10',11,{seal:1}],['Ti 64 Oil feed on, V1',60,{feed:1}],['Ti 65 Transducer test',15,{feed:1}],['Ti 66 Bowl leak test, V4 shut',10,{v4x:1}],['Ti 67 Transducer reference',60,{feed:1}]],
   dis:[['Ti 70 Oil feed off',15,{}],['Ti 71 Displacement of oil, V4 and SV10',20,{seal:1,v4x:1}],['Ti 72 Displacement water, SV10',40,{seal:1}],['Ti 73 Drain valve open, V5',10,{drain:1}],['Ti 74 Discharge, SV15',3,{open:1}],['Ti 75 Pause, discharge feedback',15,{}]],
   stop:[['Ti 81 Close bowl, SV16',15,{close:1}],['Ti 82 Water to 80 % bowl, V4 and SV10',150,{seal:1,v4x:1}],['Ti 83 Drain valve open, V5',10,{drain:1}]]}},
 p605:{id:'p605',tab:'P 605',name:'Alfa Laval P 605',ctrl:'EPC 50',alcap:false,Q380:900,Qpump:1300,Qmax:2200,rpmR:9512,kW:2.2,fla:4.8,
  tRun:170,tStop:840,tBrake:210,Vb:1.5,Rb:99,R0:30,ro:22,riT:75,riMin:67,riMax:92,kq:23,discs:[50.5,52,54,57,61,66,73],Vsm:.6,Vdis:1,Qseal:8,Qopen:18,Qclose:.9,heat:24,Pb:1.5,P1:.25,Pmax:2.5,
  iv:30,ivMin:2,ivMax:60,vibW:7,vibS:9,dip:.04,tCl:30,mk:15,mkT:2,Pw:[1.5,6],Pa:[5,8],rhoMax:991,trig:.5,
  tag:{feed:'V1',seal:'206',open:'372',close:'373',airFeed:'SV1',flow:'RV4',back:'RV1',pIn:'PT1',pOut:'PT4',tt:'TT1'},
  scr:{
   start:[['Initialise, 372 open',1,{open:1}],['Close bowl, 373',40,{close:1}],['Liquid seal, 206',12,{seal:1}]],
   dis:[['Feed off, displacement 206 and 373',8,{seal:1,close:1}],['Bowl opening, 372',1,{seal:1,close:1,open:1}],['Reseal, 206 and 373',12,{seal:1,close:1}]]}},
 sj30g:{id:'sj30g',tab:'SJ30G',name:'Mitsubishi Selfjector SJ30G',ctrl:'Purifier control panel',alcap:false,attached:true,Q380:3200,Qpump:3600,Qmax:7800,rpmR:10000,kW:5.5,fla:9.25,
  tRun:290,tStop:1500,tBrake:420,Vb:3.5,Rb:120,R0:45,ro:29.5,riT:93,riMin:84,riMax:114,kq:30,discs:[65,66.5,68.5,71.5,75,79,82,86,90],Vsm:2,Vdis:3.5,total:true,Qseal:8,Qopen:12,Qclose:1.8,heat:80,Pb:1.5,P1:.6,Pmax:2,
  iv:120,ivMin:15,ivMax:240,vibW:7,vibS:11,dip:.06,tCl:4,mk:10,mkT:5,Pw:[3,5],Pa:[5,9],rhoMax:991,trig:.5,
  tag:{feed:'CV1',seal:'SV3',open:'SV1',close:'SV2',airFeed:'SV4',flow:'V5',back:'V6',pIn:'PI',pOut:'PT',tt:'TI'},
  scr:{
   start:[['Opening bowl, SV1',3,{open:1}],['Interval',15,{}],['Closing water, SV2',5,{close:1}],['Replacement water, SV3',12,{seal:1}],['Interval',15,{}],['Opening bowl, discharge, SV1',3,{open:1}],['Interval',15,{}],['Closing water, SV2',5,{close:1}],['Interval',15,{}],['Sealing water, SV3',12,{seal:1}]],
   dis:[['Feed to bypass, replacement water SV3',12,{seal:1}],['Interval',15,{}],['Opening bowl, SV1',3,{open:1}],['Interval',15,{}],['Closing water, SV2',5,{close:1}],['Interval',15,{}],['Sealing water, SV3',12,{seal:1}]],
   disS:[['Feed to bypass, replacement water SV3',12,{seal:1}],['Interval',15,{}],['Opening bowl, SV1',3,{open:1}],['Interval',15,{}]]}}
};
/* sj30gh: G-HIDENS version with GSH-1 panel. No disc change, water found by pressure in the circulation line, partial discharge by SV9.
   Capacity kept as SJ30G because the GH columns of Table 3-1 cannot be read. */
MODELS.sj30gh=Object.assign({},MODELS.sj30g,{kW:7.5,fla:12.7,id:'sj30gh',tab:'SJ30G HIDENS',name:'Mitsubishi Selfjector SJ30G HIDENS',ctrl:'GSH-1 panel',hid:true,discs:null,Rs:96,rhoMax:1010,Vpar:1.75,mon:15,
 scr:{start:[['Closing water, SV2',5,{close:1}],['Replacement water, SV3',12,{seal:1}],['Interval',15,{}],['Opening bowl, SV1',3,{open:1}],['Interval',15,{}],['Closing water, SV2',5,{close:1}],['Interval',15,{}],['Sealing water, SV3',4,{seal:1}]],
  dis:[['Feed to bypass, replacement water SV3',12,{seal:1}],['Interval',15,{}],['Opening bowl, SV1',3,{open:1}],['Interval',15,{}],['Closing water, SV2',5,{close:1}],['Interval',15,{}],['Sealing water, SV3',4,{seal:1}]],
  disS:[['Feed to bypass, replacement water SV3',12,{seal:1}],['Interval',15,{}],['Opening bowl, SV1',3,{open:1}],['Interval',15,{}]],
  par:[['Feed valve closed, SV4',5,{}],['Closing water, SV2',5,{close:1}],['Replacement water, partial, SV3',5,{seal:1}],['Partial discharge, SV9',.6,{par:1}],['Closing water, SV2',5,{close:1}]]}});
/* Flex P605 / P626: P 605 bowl principle on the Flex platform (P 626 leaflet): EPC 60, CentriShoot discharge, no operating water tank. One water block feeds conditioning C1 (SV10), opening C2 (SV15) and closing C3 (SV16) straight from the 2 to 8 bar line.
   Seal and displacement times follow P 605 manual 8.3.1, opening and closing follow the Flex S sequence on the same water block. Bowl figures are the P 605 ones until a P 626 manual is to hand. */
MODELS.p626=Object.assign({},MODELS.p605,{id:'p626',tab:'Flex P605/P626',name:'Alfa Laval Flex P605 / P626',ctrl:'EPC 60',notank:true,Qclose:2.8,Qopen:11,tCl:12,Pw:[2,8],Pa:[5,8],
 tag:{feed:'V1',seal:'SV10',open:'SV15',close:'SV16',airFeed:'SV1',flow:'RV4',back:'RV1',pIn:'PT1',pOut:'PT4',tt:'TT1'},
 scr:{start:[['Discharge, SV15 (C2)',3,{open:1}],['Pause, draining',15,{}],['Close bowl, SV16 (C3)',15,{close:1}],['Water seal, SV10 (C1)',12,{seal:1}]],
  dis:[['Feed off, displacement water SV10 (C1)',8,{seal:1}],['Bowl opening, SV15 (C2)',3,{open:1}],['Pause, discharge feedback',5,{}],['Close bowl, SV16 (C3)',15,{close:1}],['Water seal, SV10 (C1)',12,{seal:1}]]}});
/* maker's treating capacity: Selfjector Table 3-1, SJ30G column, against viscosity at treating temperature. Other units scale by Q380. */
const CAP=[[3,12000],[14,7800],[23.8,4500],[38.1,3200],[45.1,2550],[50.6,2250],[55.6,2050],[120,900]];

const rhoOil=(r15,T)=>r15-0.64*(T-15);
const rhoWater=T=>1001.3-0.155*T-0.00265*T*T;
function viscAt(f,T){ /* ASTM D341 Walther line through the labelled viscosity, slope 3.5 */
 const a=Math.log10(Math.log10(f.visc+0.7)),b=3.5,k=Math.log10(273+(f.vT||50)),t=Math.log10(273+T);
 return Math.pow(10,Math.pow(10,a-b*(t-k)))-0.7;}
const ccai=f=>f.rho-140.7*Math.log10(Math.log10(f.visc+0.85))-80.6;
function capAt(M,nu){ /* recommended flow at this viscosity */
 const r=M.Q380/3200;let i=0;while(i<CAP.length-2&&nu>CAP[i+1][0])i++;
 const [a,qa]=CAP[i],[b,qb]=CAP[i+1],t=clamp((Math.log(nu)-Math.log(a))/(Math.log(b)-Math.log(a)),-1,3);
 return Math.min(M.Qmax,Math.exp(lerp(Math.log(qa),Math.log(qb),t))*r);}
/* interface radius from the pressure balance across the gravity disc and the level ring, r in mm */
function interfaceR(M,disc,rhoO,rhoW,Q,nu){
 const rd=disc/2,dr=rhoW-rhoO,flow=M.kq*Q/M.Q380*Math.sqrt(nu/37.5);
 if(dr<=0.5)return 999;
 const r2=(rhoW*rd*rd-rhoO*M.ro*M.ro+rhoO*flow)/dr;
 return r2>0?Math.sqrt(r2):0;}
function bestDisc(M,fuel,T,Q){
 const ro=rhoOil(fuel.rho,T),rw=fuel.sea?1025-0.5*(T-15):rhoWater(T),nu=viscAt(fuel,T);let best=null,e=1e9;
 for(const d of M.discs||[]){const r=interfaceR(M,d,ro,rw,Q,nu),x=Math.abs(r-M.riT);if(x<e){e=x;best=d;}}
 return best;}

/* particle bins, micrometres and mass fraction */
const FINES=[[1.5,.08],[3,.17],[5,.3],[8,.25],[12,.13],[20,.07]],SAND=[[3,.1],[6,.2],[10,.3],[20,.25],[40,.15]];
const removal=(bins,dc)=>bins.reduce((t,[d,f])=>t+f*Math.min(1,(d/dc)*(d/dc)),0);

function coldInputs(id){const M=MODELS[id];return {
 slv:1,q:M.Q380,rv:50,iv:M.iv,disc:null,Ts:98,Tt:70,suc:1,ret:1,out:1,oilv:1,stm:0,hd:0,wOn:0,aOn:0,brake:0,man:0,msv:SV0(),
 auto:1,wash:0,act:null,mm:1,lm:0,dd:1,pr4:1,wd:0,v12:1,fuel:null,lim:{hiO:3,loO:1,loW:.2,hiF:3,hiT:105,loT:85}};}
function noFaults(){return {};}
function coldState(M){return {t:0,ph:M.attached?'off':'standst',msg:'',q:0,rpm:0,motor:0,pump:0,slp:0,T:60,I:0,Q:0,Qhs:0,c:0,closed:false,bowlOpen:false,Vw:0,Vs:0,Voil:0,sc:null,sv:SV0(),tRun:0,
 tSince:0,tMk:0,tBusy:0,nDis:0,nDrain:0,tDrain:0,drainHold:0,foul:0,hard:0,seal:0,brk:0,Pout:0,Pin:0,Pwo:0,Pa:0,Pw:0,vib:0,amps:0,mtW:0,wOut:0,Qo:0,duty:0,v1:0,tStart:0,nores:0,sludgeT:20,sludgeL:0,slBack:0,loss:0,lossD:0,waste:0,oilIn:0,cAlSi:10,cW:.05,cNa:20,fb:0,dipT:0,alarm:{},tAl30:0,mem:0,lmT:0,lmHold:0,ndT:0,pendDis:0,estop:0,heaterOn:0,lvS:.75,lvD:.6,xfer:0,Pwd:0,tPar:0,nFast:0,parP:0,nPar:0,pumpOffT:0,asked:0,dnPT4:0,d:{}};}

/* quality and hydraulics at this instant, used by step and by the actual plant comparison */
/* a wrong disc fitted: the next size up or down from the one chosen */
function discNow(M,d,f){const L=M.discs;if(!L||!(f.discBig||f.discSmall))return d;const i=Math.max(0,L.indexOf(d)),j=f.discBig?Math.min(L.length-1,i+2):Math.max(0,i-2);return L[j];}
function perf(s,u,f,M,over){
 const cl=CL(M),o=over||{},fl=Object.assign({},u.fuel,o.fuel||{}),T=o.T??s.T,Q=o.Q??s.Q,rpm=o.rpm??s.rpm;
 const rO=rhoOil(fl.rho,T),seaW=fl.sea?1025-0.5*(T-15):rhoWater(T),nu=viscAt(fl,T);
 const Qr=capAt(M,nu),load=Q/Qr,Vs=s.Vs,dust=clamp((Vs-M.Vsm)/(0.5*M.Vsm));
 const sigma=Math.max(.1,(1-.7*dust)*(1-.75*s.foul)*(f.stack?.55:1)*(rpm*rpm||.001));
 const dc=6*Math.sqrt(Math.max(load,.02)/sigma*(1500/(2400-rO)));
 const dcW=dc*Math.sqrt(1500/Math.max(4,Math.abs(seaW-rO)));
 /* interface */
 let ri=cl?Math.sqrt(Math.max(0,M.Rb*M.Rb-clamp((s.Vw+Vs)/M.Vb)*(M.Rb*M.Rb-M.R0*M.R0))):interfaceR(M,discNow(M,o.disc??u.disc,f),rO,seaW,Q,nu);
 const Pmax=Math.max(.4*M.Pmax,M.Pmax-(M.Pmax*.15)*load*load*Math.pow(nu/37.5,.3));
 const em=clamp((fl.fame||0)/100*.9+(fl.ulo||0)*.5+(fl.stab>=3?.1:0));
 const we=(fl.water||0)+(u.wash||0),etaW=(1-Math.exp(-Math.pow(70/dcW,2)))*(1-em*.5);
 let wOut=.015+we*(1-etaW);
 const brk=!cl&&(ri>M.riMax||!isFinite(ri))?clamp((ri-M.riMax)/6):0;
 if(!cl&&ri<M.riMin)wOut+=(M.riMin-ri)*.07;
 if(cl&&ri<M.Rs+3)wOut+=clamp((M.Rs+3-ri)/4)*.6;
 const sealOK=cl||s.Vw>.45*needW(M,ri,Vs);
 const cat=Math.min(fl.al*2.1,fl.al+fl.si),sand=Math.max(0,fl.al+fl.si-cat);
 const etaC=removal(FINES,dc)*(1-.25*em),etaS=removal(SAND,dc);
 const alOut=cat*(1-etaC)+sand*(1-etaS),etaAlSi=(cat+sand)>0?1-alOut/(cat+sand):0;
 const naW=(fl.sea?(fl.water||0)*108:0)+(u.wash||0)*.15*fl.na;
 const naIn=fl.na+(fl.sea?(fl.water||0)*108:0),naOut=Math.max(0,naIn-(naW*etaW)),vOut=fl.v;
 const sf=(.010+.2*(fl.tsp||0)+.00005*(fl.al+fl.si))*[1,1,1.6,3,6,10][clamp(Math.round(fl.stab||1),1,5)]*(1+(fl.ulo||0)*.5);
 return {sep:ri-(cl?M.Rs:M.riMin),T,Q,rpm,fl,rO,rhoW:seaW,dRho:seaW-rO,nu,Qr,load,dc,dcW,ri,Pmax,em,etaW,wOut,brk,sealOK,cat,sand,etaC,etaS,etaAlSi,alOut,alIn:fl.al+fl.si,naIn,naOut,vOut,sf,sigma,dust,we};}
function needW(M,ri,Vs){return Math.max(.05,M.Vb*(M.Rb*M.Rb-ri*ri)/(M.Rb*M.Rb-M.R0*M.R0)-Vs);}

function say(s,txt,k){(s.log=s.log||[]).push({t:s.t,txt,k:k||'n'});}
function startScript(s,name,then){s.sc={n:name,i:0,t:0,then};s.sv=SV0();}

/* control sequence: everything the EPC or GBC panel does by itself */
function control(s,u,f,M,dt){
 if(u.man){s.sv=Object.assign(SV0(),u.msv);return;}
 if(s.sc){
  const row=M.scr[s.sc.n][s.sc.i];s.msg=row[0];s.sv=Object.assign(SV0(),row[2]);s.sc.t+=dt;
  if(s.sc.t>=row[1]){s.sc.t=0;s.sc.i++;if(s.sc.i>=M.scr[s.sc.n].length){const th=s.sc.then;s.sc=null;s.sv=SV0();th&&th();}}
  return;}
 s.sv=SV0();
 const Tok=Math.abs(s.T-u.Ts)<6&&s.Q>0;
 if(s.ph==='sep'){
  if(!Tok&&!u.auto){}
  s.sv.feed=1;s.msg=M.alcap?`Trigger ${(s.d.wOut||0).toFixed(2)} %  |  ${Math.max(0,u.iv-s.tSince/60).toFixed(0)} min to discharge`:`Separating  |  ${Math.max(0,u.iv-s.tSince/60).toFixed(0)} min to discharge`;
  if(!Tok&&s.T<(M.alcap?u.lim.loT-1:u.Ts-8)){s.ph='wait';say(s,'Oil feed temperature low: feed goes to recirculation','w');return;}
  s.tMk+=dt;if(s.tMk>M.mk*60){s.sv.close=1;if(M.total&&!M.hid&&s.Vw<s.needW)s.sv.seal=1;if(s.tMk>M.mk*60+M.mkT)s.tMk=0;}
  if(M.hid){s.tPar+=dt;if(u.wd&&u.v12&&s.toBowl>0&&s.tPar>30&&s.Pwd<.05){if(s.tPar<M.mon*60)doPartial(s,u,M);else doDischarge(s,u,M,'Water detected after monitoring time: total discharge');return;}}
  if(M.alcap&&u.pr4&&s.tDrain>0){s.sv.drain=1;s.tDrain-=dt;}
  if(M.alcap&&u.pr4&&s.tSince>30&&!s.sv.drain&&s.drainHold<=0){
   if((s.mtW||0)>=M.trig){if(s.nDrain<5){s.tDrain=25;s.drainHold=30;s.nDrain++;say(s,`Trigger reached: V5 opening ${s.nDrain} of 5`);}else{doDischarge(s,u,M,'5 V5 openings used: skip to Ti 74',4);return;}}
   else if((s.mtW||0)<.7*M.trig)s.nDrain=0;}
  s.drainHold=Math.max(0,s.drainHold-dt);
  if(s.pendDis||s.tSince>=u.iv*60*(M.alcap&&!u.pr4?Math.min(1,15/u.iv):1)){s.pendDis=0;doDischarge(s,u,M);}
 }else if(s.ph==='wait'){
  s.msg='Standby';
  if(s.rpm>.97&&Tok&&s.pump)beginProcess(s,u,M);
 }else if(s.ph==='stopseq'){
  s.msg='Stop';
  const lim=M.scr.stop?360:300;if(s.T<u.Ts-(M.scr.stop?5:3)||s.Q<=0||s.tBusy>lim){if(!M.attached)s.pump=0;s.motor=0;s.ph='rundown';say(s,'Feed pump and separator stopped by sequence');}
  s.tBusy+=dt;
 }else if(s.ph==='rundown'){s.msg=`Stop  ${Math.round(s.rpm*M.rpmR)} rpm`;if(s.rpm<=0){s.ph=M.attached?'off':'standst';s.msg='';}}
 else if(s.ph==='start'){s.msg=`Start  ${Math.round(s.rpm*M.rpmR)} rpm`;if(s.rpm>=.97)s.ph='wait';}
 else if(s.ph==='estop'){s.msg='Emergency stop';s.pumpOffT+=dt;if(s.pumpOffT>180&&!M.attached)s.pump=0;}
 else if(s.ph==='safety'){s.msg='Safety stop';}
}
function toSep(s,u,M,msg){s.ph='sep';s.tMk=0;say(s,msg);if(s.stopAfter)doDischarge(s,u,M,'Stop sequence: last sludge discharge');}
function beginProcess(s,u,M){s.ph='closing';say(s,'Bowl closing and water seal sequence started');
 startScript(s,s.calib&&M.scr.startC?'startC':'start',()=>{s.calib=0;const go=()=>{s.tSince=0;toSep(s,u,M,'Oil feed opened: separating');};if(M.scr.ref)startScript(s,'ref',go);else go();});}
function doPartial(s,u,M){s.nFast=s.tPar<90?s.nFast+1:0;if(s.nFast>=3){s.ph='hold';say(s,'Water abnormally collected: feed stopped','a');return;}s.ph='dis';s.nPar++;say(s,'Water detected: partial discharge');startScript(s,'par',()=>{s.tPar=0;s.ph='sep';});}
function doDischarge(s,u,M,why,skip){s.ph='dis';s.fb=0;say(s,why||'Sludge discharge started');
 startScript(s,s.stopAfter&&M.scr.disS?'disS':'dis',()=>{s.tSince=0;s.nDrain=0;s.tPar=0;s.nFast=0;
  if(!s.fb)s.ndT=1;
  if(s.stopAfter){s.stopAfter=0;s.heaterOn=0;s.tBusy=0;
   if(M.scr.stop){s.ph='stopseq';startScript(s,'stop',()=>{s.motor=0;s.tBusy=0;say(s,'Ti 85: separator motor off, feed pump cools the heater');});}
   else if(M.attached){s.motor=0;s.ph='rundown';say(s,'Discharge done: automatic running cut off, motor stopped');}
   else{s.ph='stopseq';say(s,'Discharge done: heater off, waiting for temperature to fall');}}
  else if(M.scr.ref&&!s.ndT){s.ph='closing';startScript(s,'ref',()=>toSep(s,u,M,'Oil feed back on'));}
  else s.ph='sep';});
 if(skip)s.sc.i=skip;}

function discharge(s,u,f,M){ /* the moment the sliding bottom drops */
 const pool=s.Vs+s.Vw+s.Voil;let out=M.total?pool:Math.min(M.Vdis,pool);
 const hardKeep=s.hard*s.Vs*.7;const sOut=Math.min(Math.max(0,s.Vs-hardKeep),out);s.Vs-=sOut;let left=out-sOut;
 const wOut=Math.min(s.Vw,left);s.Vw-=wOut;left-=wOut;const oOut=Math.min(s.Voil,left);s.Voil-=oOut;
 s.sludgeL+=sOut+wOut+oOut;s.waste+=sOut+wOut+oOut;s.loss+=oOut;s.lossD=oOut;s.rpm-=M.dip*clamp(out/M.Vdis+.2);s.dipT=3;s.fb=1;s.nDis++;s.hard=0;
 s.c=s.sv.close?.55:0;s.bowlOpen=true;s.closed=false;
 say(s,oOut>.15*M.Vdis?`Discharge lost ${oOut.toFixed(2)} L of oil: displacement was short`:`Sludge discharged: ${(sOut+wOut).toFixed(2)} L solids and water, ${oOut.toFixed(2)} L oil`,oOut>.15*M.Vdis?'w':'n');}

function partial(s,M){let left=M.Vpar;const a=Math.min(s.Vs,.25*left);s.Vs-=a;left-=a;const b=Math.min(s.Vw,left);s.Vw-=b;left-=b;const c=Math.min(s.Voil,left);s.Voil-=c;s.sludgeL+=a+b+c;s.waste+=a+b+c;s.loss+=c;s.rpm-=M.dip*.3;s.dipT=2;say(s,`Partial discharge: ${(a+b).toFixed(2)} L water and sludge, ${c.toFixed(2)} L oil`);}
function step(s,u,f,M,dt){
 const cl=CL(M);s.t+=dt;s.tRun+=s.rpm>.5?dt:0;
 /* utilities */
 const Pw=u.wOn?(M.Pw[0]+M.Pw[1])/2*(f.wlow?.3:1):0,wFlow=(Pw>=M.Pw[0]*.9?1:Pw/M.Pw[0]*.6)*(f.wstr?.2:1)*(u.wOn?1:0);
 const Pa=u.aOn?(M.Pa[0]+M.Pa[1])/2*(f.alow?.5:1):0,airOK=Pa>=4;
 s.Pw=Pw;s.Pa=Pa;
 control(s,u,f,M,dt);
 /* drive */
 let top=1;if(f.belt)top*=.91;if(f.friction)top*=.9;if(f.overspeed)top=1.2;if(!s.closed&&s.Vs+s.Vw+s.Voil>0&&f.nozzle)top*=.96;
 if(s.motor&&!(f.motorTrip)){const r=f.belt||f.friction?.55:1;s.rpm=s.rpm<top?Math.min(top,s.rpm+dt/M.tRun*r):Math.max(top,s.rpm-dt/90);}
 else s.rpm=Math.max(0,s.rpm-dt/((u.brake?M.tBrake:M.tStop)));
 if(s.dipT>0)s.dipT-=dt;
 /* feed */
 if(M.attached)s.pump=s.motor?1:0;
 const pumpR=M.attached?clamp(s.rpm/.9):1,cold=clamp(1.15-viscAt(u.fuel,u.Tt)/900,.35,1);
 const avail=(s.pump?1:0)*pumpR*(u.suc?1:0)*(u.ret||u.sv?1:1)*((u.strB?f.strainerB:f.strainer)?.45:1)*(f.pumpWorn?.6:1)*(f.joint?0:1)*(f.airIn?.75:1)*cold;
 const target=Math.min(u.q,M.Qpump*avail);
 s.Q+=(target-s.Q)*clamp(dt/4);if(s.Q<1)s.Q=0;
 const v1=(airOK&&s.sv.feed&&!f.v1stuck)?1:(f.v1stuckF?1:0);s.v1=v1;
 const drainV=airOK&&s.sv.drain&&!f.v5stuck;
 /* heater */
 const mcp=s.Q/3600*rhoOil(u.fuel.rho,s.T)/1000*2.05,Cth=(M.Q380/3600*.93*2.05)*45;
 const e=u.Ts-s.T;s.I=clamp(s.I+e*dt*.0025,0,1);
 const on=s.heaterOn&&u.stm&&s.Q>0;const ctl=u.hd?u.hd/100:clamp(e*.09+s.I);
 const Duty=(on||(u.hd&&u.stm&&s.heaterOn))?ctl*M.heat*(f.heatFoul?.45:1)*(f.steamLow?.5:1)*(f.trap?.6:1):0;
 s.duty=Duty;const Tin=f.tankCold?u.Tt-20:u.Tt;
 s.T+=((mcp*(Tin-s.T)+Duty)/Cth-(s.T-30)*.00008)*dt;
 if(f.ttFail)s.T=Math.min(s.T,130);
 /* bowl */
 const wf=(l)=>l/60*wFlow; /* L/s */
 const qSeal=s.sv.seal&&!f.sealNo?wf(M.Qseal)*(f.dispShort&&s.sc&&s.sc.n==='dis'?.1:1):0,qClose=s.sv.close?wf(M.Qclose):0,qOpen=s.sv.open?wf(M.Qopen):0;
 const spinning=s.rpm>.6;
 if(spinning){
  if(qClose>0&&!f.sv16)s.c=clamp(s.c+qClose/M.Qclose*60/M.tCl*dt);
  s.c=clamp(s.c-dt*Math.min(.35,.8*M.mkT/M.tCl)/(M.mk*60)*(f.nozzle?0:1)*(f.closeLeak?6:1));
  const opening=(qOpen>0&&!f.sv15)||(f.sv15leak&&s.t%300<dt);
  const canOpen=(wFlow>.5||f.sv15leak)&&!f.pilot;
  if(opening&&canOpen&&!s.bowlOpen&&s.closed){discharge(s,u,f,M);}
  if(s.bowlOpen&&s.c>.6){s.bowlOpen=false;s.closed=true;}
  if(!s.bowlOpen&&s.c>=.6)s.closed=true;
  if(s.closed&&s.c<.25&&!f.nozzle){discharge(s,u,f,M);say(s,'Bowl opened by itself: closing water pressure lost','a');}
 }else{s.closed=false;s.bowlOpen=false;s.c=Math.max(0,s.c-dt/30);if(s.rpm<.02){s.Vs=s.Vs;}}
 const p=perf(s,u,f,M,u.act);
 const Qact=u.act&&u.act.Q!=null?u.act.Q:s.Q;
 const flowIn=(v1&&spinning)?Qact/3600:0; /* L/s to bowl */
 s.toBowl=flowIn*3600;
 let oilOutW=0,leakS=0,dispO=0;
 const need=cl?M.Scap||.7:needW(M,Math.min(p.ri,M.Rb),s.Vs);s.needW=need;
 if(s.closed){
  /* solids and water arrive with the oil */
  const wIn=flowIn*p.we/100*p.etaW;
  s.Vs+=flowIn*dt*p.sf/100*p.etaAlSi/.7;
  s.Vw+=(qSeal+wIn+(f.sv10leak?.002:0))*dt;
    /* seal slowly boils and washes off without make up */
  if(!cl)s.Vw=Math.max(0,s.Vw-dt*0.00006*clamp((p.T-70)/30)*M.Vb);
  s.Vw=Math.max(0,s.Vw);
  /* outlet of water and volume limit */
  const room=M.Vb-s.Vs;
  if(M.alcap){
   if(drainV){const dq=Math.min(s.Vw,M.qDrain/3600*dt);s.Vw-=dq;s.sludgeL+=dq;s.waste+=dq;}
  }else if(M.hid){if(s.sv.par&&!s.parP&&wFlow>.5)partial(s,M);
  }else{
   /* displacement: with the feed off and 206 open the water goes on filling until all the oil is pushed out to the paring disc */
   const dsp=!flowIn&&s.sv.seal&&s.sc&&s.sc.n==='dis',tgt=flowIn>0?need:dsp?room:Math.max(need,room*.97);
   if(s.Vw>tgt){const dq=(s.Vw-tgt)*clamp(dt/2);s.Vw-=dq;s.sludgeL+=dq;s.waste+=dq;}
  }
  const o0=s.Voil;s.Vw=Math.min(s.Vw,room);
  s.Voil=Math.max(0,room-s.Vw)*(flowIn>0||s.Voil>0?1:0);
  if(flowIn>0&&s.Voil<room-s.Vw)s.Voil=room-s.Vw;
  if(!flowIn&&s.Voil<o0)dispO=(o0-s.Voil)/dt;
  /* broken seal: oil over the gravity disc */
  const pb=(s.Pout||0),pmx=cl?M.Pmax:p.Pmax;const over=pb>pmx?clamp((pb-pmx)/.6):0;
  const leak=flowIn>0?Math.max(p.brk,over,!p.sealOK&&!cl?.9:0,f.sealRing?.3:0):0;s.brk=leak;
  oilOutW=flowIn*leak*(f.sealRing?.5:.8);
  if(oilOutW>0){s.loss+=oilOutW*dt;s.sludgeL+=oilOutW*dt;s.waste+=oilOutW*dt;}
  if(f.sealRing&&flowIn>0){leakS=oilOutW;}
 }else if(s.bowlOpen||!s.closed){
  /* an open bowl passes feed straight out of the sludge ports */
  if(flowIn>0){s.loss+=flowIn*dt;s.sludgeL+=flowIn*dt;s.waste+=flowIn*dt;s.brk=1;oilOutW=flowIn;}else s.brk=0;
  s.Vw=Math.max(0,s.Vw+qSeal*dt-dt*.05);s.Voil=0;
 }
 s.parP=s.sv.par;s.Pwd=M.hid&&flowIn>0&&u.v12?.1*clamp((p.ri-M.Rs-1)/4):0;
 /* time and fouling */
 s.tSince+=flowIn>0?dt:0;
 if(s.tSince>4*3600)s.hard=clamp((s.tSince-4*3600)/7200);
 if(s.Vs>1.5*M.Vsm)s.hard=Math.max(s.hard,.6);
 s.foul=clamp(s.foul+dt*flowIn*3600/M.Q380*(p.fl.stab>=3?4e-6*p.fl.stab:2.5e-7)*(p.dust>.3?5:1));
 /* streams */
 const Qo=Math.max(0,(flowIn-oilOutW)*3600*(1-p.we/100)+dispO*3600);s.Qo=Qo;
 const Pdn=.3+(u.out?0:6)+(s.sv.v4x?1.2:0);
 const Kb=(M.Pb-.3)*.25;
 const Pact=spinning?Pdn+(Kb*Math.pow(Qo/M.Q380,2)/Math.pow(clamp(u.rv/100,.04,1),2)*(1+.0015*(p.nu-37.5))):0;
 const fillHead=spinning&&s.closed&&!flowIn?.35*clamp((s.Vw+s.Voil+s.Vs)/M.Vb):0;
 s.Pout+= ((u.act&&u.act.Pb!=null&&flowIn?u.act.Pb:Pact+fillHead)-(s.Pout||0))*clamp(dt/3);
 const dP=M.P1*Math.pow(Math.max(.01,s.Q/M.Q380),1.4)*(1+.002*(p.nu-37.5))*(f.inletBlk?2.2:1);
 s.Pin=s.Q>0?(v1?dP+.1:dP*.8+.15):0;s.Pwo=M.alcap?(drainV?.2:spinning&&s.closed?clamp(.4+s.Vw/M.Vb*2.5,0,3.5)*(f.paring?.3:1):0):0;
 /* water sensor */
 const wAct=(v1&&flowIn>0?p.wOut:(s.d.wOut||0)*.97);
 const showW=Math.max(0,(u.act&&u.act.wOut!=null?u.act.wOut:wAct)+(f.mtFoul?.25:0));s.wOut=wAct;
 const dis=s.ph==='dis'&&s.sc&&s.sc.i===1&&!s.sv.open&&M.alcap;
 /* service tank fills through the outlet and overflows back */
 const Vt=30000,k=Qo/3600/Vt*dt;s.cAlSi+=(p.alOut-s.cAlSi)*k;s.cW+=(p.wOut-s.cW)*k;s.cNa+=(p.naOut-s.cNa)*k;
 s.oilIn+=flowIn*dt;
 /* sludge tank */
 /* a shut sludge valve stops discharged sludge reaching the tank: it backs up in the sludge line until the valve opens */
 {const dS=s.sludgeL-(s.slPrev??s.sludgeL);if(!u.slv&&dS>0){if(!s.slBack)say(s,'Discharge blocked: the sludge tank valve is shut','a');s.sludgeL-=dS;s.slBack+=dS;}else if(u.slv&&s.slBack>0){const q=Math.min(s.slBack,dt*1.5);s.slBack-=q;s.sludgeL+=q;}}
 if(s.slp&&u.slv)s.sludgeL=Math.max(0,s.sludgeL-dt*(f.slpFail?0:.08));s.slPrev=s.sludgeL;
 /* multi monitor leakage logic */
 if(flowIn>0&&s.ph==='sep'){s.lmT+=dt;if(s.lmT>30&&s.lmT<31)s.mem=s.Pout;}else{s.lmT=0;s.lmHold=0;}
 s.mtW=f.mtFail?0:showW;s.mtFl=!!f.mtFail;
 const ampsRun=.55+.13*s.Q/M.Q380+(s.closed?0:.1)+(f.bearing?.1:0);
 s.amps=!s.motor&&s.rpm>0?0:s.motor?M.fla*(s.rpm<.98?1.15-.25*s.rpm:ampsRun)+(s.dipT>0?M.fla*.3:0):0;
 const crit=4.5*Math.exp(-Math.pow((s.rpm-.33)/.05,2))*(s.rpm>.05?1:0);
 const unb=(s.hard*2.5+Math.max(0,p.dust)*3+(f.unbal?6.5:0)+(f.bearing?4:0)+(f.overspeed?3:0)+(s.bowlOpen&&spinning?1.5:0)+(f.dryOil?2.5:0))*s.rpm*s.rpm;
 s.vib=(s.rpm>.02?1.3:0)+crit+unb;
 s.d={...p,wOut:wAct,Qo,Pdn,flowIn:flowIn*3600,oilOutW:oilOutW*3600,need,rmaxp:p.Pmax};
}

/* alarms: id, text, level 1 warn 2 alarm, condition. Text follows the maker's display. */
function alarmRows(M){const A=!M.attached;const run=s=>s.ph==='sep';
 const rows=[
 ['hiT',A?'Oil feed temperature - HIGH':'Oil temperature high',2,(s,u)=>s.Q>0&&s.T>(M.alcap?u.lim.hiT:u.Ts+8)],
 ['loT',A?'Oil feed temperature - LOW':'Oil temperature low',2,(s,u)=>run(s)&&s.T<(M.alcap?u.lim.loT:u.Ts-6)],
 ['vibW',A?'High vibration - WARNING':'Abnormal vibration',1,(s)=>s.vib>M.vibW],
 ['vibS',A?'High vibration - SHUTDOWN':'Vibration shutdown',2,(s)=>s.vib>M.vibS],
 ['spdH',A?'Bowl speed - HIGH':'Speed high',2,(s)=>s.rpm*M.rpmR>(M.spdH||1.05*M.rpmR)],
 ['spdL',A?'Bowl speed - LOW':'Speed low',2,(s)=>s.motor&&s.ph!=='start'&&s.ph!=='dis'&&s.tSince>30&&s.tRun>M.tRun+30&&s.rpm*M.rpmR<(M.spdL||.95*M.rpmR)],
 ['runup',A?'Separator run-up - TOO LONG':'Rated speed not reached in 10 min',2,(s)=>s.ph==='start'&&s.tStart>M.tRun*1.6],
 ['ptH',A?'Oil backpressure PT4 - HIGH':'Light liquid pressure high',1,(s,u,p)=>run(s)&&s.Pout>(M.alcap?u.lim.hiO:M.Pb+.6)],
 ['ptL',A?'Oil backpressure PT4 - LOW':'Light liquid pressure low',1,(s,u)=>run(s)&&s.tSince>45&&!(M.hid&&s.tPar<45)&&s.Pout<(M.alcap?u.lim.loO:M.Pb-.5)],
 ['feedL',A?'Feed pressure PT1 - LOW':'Low feed rate',1,(s,u)=>s.pump&&s.rpm>(M.attached?.95:.5)&&s.Q<.75*u.q],
 ['leak',A?'OIL LEAKING FROM BOWL':'01 Oil leakage (LEAK)',2,(s)=>run(s)&&s.brk>.15&&s.tSince>30],
 ['nodis',A?'Discharge feedback - ERROR':'02 No opening of bowl (NO-DIS)',2,(s)=>s.ndT>0],
 ['sludge','Sludge tank level - HIGH',1,(s)=>s.sludgeL>M.Vdis*60],
 ['slback','Sludge line blocked - valve shut',2,(s)=>s.slBack>.05],
 ['air',A?'Air supply low':'Control air low',1,(s,u)=>u.aOn&&s.Pa<4.5],
 ['water',A?'Operating water pressure low':'Operating water low',1,(s,u)=>u.wOn&&s.Pw<M.Pw[0]],
 ['foulS','Sludge space full',1,(s)=>s.Vs>1.05*M.Vsm]];
 if(!A)rows.push(['hidens','03 Hidens alarm (HI-AL)',2,M.hid?(s,u)=>s.nFast>=3||(s.rpm>.9&&s.Q>0&&u.fuel.rho>M.rhoMax):(s,u)=>s.rpm>.9&&s.Q>0&&(s.wOut>.6||u.fuel.rho>M.rhoMax)]);
 if(M.alcap)rows.push(['feedH','Feed pressure PT1 - HIGH',1,(s,u)=>run(s)&&s.Pin>u.lim.hiF]);
 if(M.alcap)rows.push(['tHi','Transducer value - HIGH',1,(s)=>run(s)&&s.mtW>1.2],['tFail','Water transducer - FAILURE',1,(s)=>run(s)&&!!s.mtFl],
  ['dinsuf','Water drain - INSUFFICIENT',1,(s)=>s.nDrain>=5&&s.mtW>=.7*M.trig],
  ['ldf','LO DRAINING FREQUENTLY',1,(s)=>s.nDrain>=6&&s.tSince<15*60],
  ['pt5','Pressure in water outlet PT5 - LOW',1,(s,u)=>run(s)&&!s.sv.drain&&s.Pwo<u.lim.loW&&s.tSince>120],
  ['noresp','Transducer - NO RESPONSE',1,(s)=>s.nores>0]);
 return rows;}
if(typeof module!=='undefined')module.exports={toSep,CL,MODELS,perf,step,coldState,coldInputs,noFaults,viscAt,capAt,bestDisc,interfaceR,rhoOil,rhoWater,ccai,alarmRows,beginProcess,doDischarge,say,removal,FINES,SAND,startScript,SV0,clamp,needW};
