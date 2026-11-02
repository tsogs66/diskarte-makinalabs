/* --- EPC 50 menu, book 1810572. Process list by ENTER; End, then ENTER and + together opens Install, Factory, Alarms, Test, Exit;
   + and - together leaves a list. Rows: label, meaning, factory value, min, max, step, unit, get/set when it drives the simulator. --- */
const par=(k,d)=>{u.par=u.par||{};return u.par[k]??d;};
const wired=(g,st)=>({g,s:st});
const limW=k=>wired(()=>u.lim[k],v=>{u.lim[k]=v;});
const LP=()=>[
 ['Pr 1','Time to discharge',120,1,300,1,'min',wired(()=>u.iv,v=>{u.iv=v;syncSet();})],['Pr 2','Oil type','HF380'],['Pr 3','Control location','OPloc'],
 ['Pr 4','Alcap 1 On, 0 Stb.',1,0,1,1,'',wired(()=>u.pr4,v=>{u.pr4=v;if($('pr4'))$('pr4').checked=!v;})],['Pr 5','Service timer x1000 h',0,0,10,.1,''],['Pr 6','Type of service',0,0,9,1,''],['Pr 7','Info keys, 1 timers',0,0,2,1,''],
 ['Pr 10','High oil pressure',3,0,6,.1,'bar',limW('hiO')],['Pr 11','Low oil pressure',1,0,6,.1,'bar',limW('loO')],['Pr 12','High water pressure',5.5,0,6,.1,'bar'],['Pr 13','Low water pressure',.2,0,6,.1,'bar',limW('loW')],
 ['Pr 14','High feed pressure',3,0,6,.1,'bar',limW('hiF')],['Pr 15','Low feed pressure',.2,0,6,.05,'bar'],['Pr 16','HFO high temp limit',105,0,115,1,'C',limW('hiT')],['Pr 17','HFO low temp limit',85,0,115,1,'C',limW('loT')],
 ['Pr 18','HFO temp setpoint',95,0,110,1,'C',wired(()=>u.Ts,v=>{u.Ts=v;syncSet();})],['Pr 19','DO high temp limit',40,0,115,1,'C'],['Pr 20','DO low temp limit',20,0,115,1,'C'],['Pr 21','DO temp setpoint',30,0,110,1,'C'],
 ['Pr 22','P-constant',40,10,500,1,'%'],['Pr 23','I-constant',1.2,.1,10,.1,'min'],['Pr 24','Heater location',0,0,9,1,''],['Pr 25','Sludge tank delay',2,0,240,1,'s'],['Pr 40','Test sludge in bowl',60,0,100,1,'dis'],['Pr 41','Max less displ. water',15,0,100,1,'%']];
const LI=()=>[['In 1','Language','en'],['In 3','Separator type','Alcap'],['In 4','Separator size','826'],['In 5','Separator identity',1,1,9,1,''],['In 17','C or F','C'],['In 18','Heater type','Steam'],['In 20','Steam valve run time',120,0,999,1,'s'],['In 22','Alarm delay time',15,0,30,1,'s'],['In 23','V1 temp alarm delay',15,0,240,1,'s'],['In 24','V1 action, extra alarm','No'],['In 31','Feed pump controlled','No'],['In 32','Flow display unit','m3/h']];
const tiW=(lab)=>wired(()=>{const r=Object.values(M.scr).flat().find(x=>x[0].startsWith(lab+' '));return r?r[1]:null;},v=>{for(const r of Object.values(M.scr).flat())if(r[0].startsWith(lab+' '))r[1]=v;});
const LF=()=>[['Fa 3','Conditioning water',.16,.1,99,.01,'L'],['Fa 6','PT4 bowl filled rise',.2,0,9.9,.1,'bar'],['Fa 10','High speed',13300,0,14000,100,'rpm'],['Fa 11','Low speed',11000,0,14000,100,'rpm'],['Fa 12','Speed drop, discharge',300,0,2000,10,'rpm'],
 ['Fa 21','Trigger limit HFO',100,0,250,1,'%'],['Fa 25','Drain pulse time',25,0,250,1,'s'],['Fa 26','Drain pause',5,0,30,1,'s'],['Fa 27','Stop draining below',70,0,100,1,'%'],['Fa 28','Limit HFO drainings',5,0,20,1,''],
 ['Fa 41','Closing pulse every',5,1,30,1,'min',wired(()=>M.mk,v=>{M.mk=v;})],['Fa 46','Leak test PT4 drop',1,0,4,.1,'bar'],['Fa 49','Max leak tests',5,0,10,1,''],
 ...['Ti 56','Ti 57','Ti 58','Ti 60','Ti 61','Ti 62','Ti 64','Ti 65','Ti 66','Ti 67','Ti 70','Ti 71','Ti 72','Ti 73','Ti 74','Ti 75','Ti 81','Ti 82','Ti 83'].map(t=>[t,(Object.values(M.scr).flat().find(x=>x[0].startsWith(t+' '))||['',0])[0].slice(t.length+1),0,0,300,1,'s',tiW(t)])];
const LT=[['Test V1','feed'],['Test V5','drain'],['Test SV10','seal'],['Test SV15','open'],['Test SV16','close']];
const LMENU=['Install','Factory','AL list','Test','Exit'];
const listOf=l=>l==='Pr'?LP():l==='In'?LI():l==='Fa'?LF():[];
const rowV=r=>r[7]?r[7].g():par(r[0],r[2]);
const alarmRowsLog=()=>(s.log||[]).filter(x=>x.k==='a'||x.k==='w').slice(-20).reverse();
function menuOut(){pm.lv=0;pm.ed=false;if(u.man&&pm.tst){u.man=0;u.msv=SV0();pm.tst=0;}}
function bothEP(){if(s.asked)return;if(pm.lv===1&&pm.i>=LP().length){pm.lv=2;pm.m=0;}else note('ENTER and + together works at End: ENTER, then + until End shows.','w');}
function bothPM(){if(s.asked)return;if(pm.ed){pm.ed=false;return;}if(pm.lv===3){if(pm.l==='Te'&&u.man){u.man=0;u.msv=SV0();pm.tst=0;}pm.lv=2;}else if(pm.lv)menuOut();}
function epc50(k){
 if(s.asked){if(k!=='e')lcdKey(k);return;}
 const sg1=k==='+'?1:-1;
 if(pm.lv===0){if(k==='e'){pm.lv=1;pm.l='Pr';pm.i=0;pm.ed=false;}else info=(info+(k==='+'?1:INFO.length))%(INFO.length+1);return;}
 if(pm.lv===2){if(k==='e'){const m=LMENU[pm.m];if(m==='Exit')menuOut();else{pm.lv=3;pm.l={Install:'In',Factory:'Fa','AL list':'Al',Test:'Te'}[m];pm.i=0;pm.ed=false;}}else pm.m=(pm.m+(sg1>0?1:LMENU.length-1))%LMENU.length;return;}
 if(pm.l==='Al'){const n=alarmRowsLog().length+1;if(k!=='e')pm.i=(pm.i+(sg1>0?1:n-1))%n;return;}
 if(pm.l==='Te'){if(k==='e'){if(s.rpm>0||!['standst'].includes(s.ph)){note('Test list runs only at standstill.','w');return;}u.man=1;pm.tst=1;const t=LT[pm.i][1];u.msv[t]=u.msv[t]?0:1;}else pm.i=(pm.i+(sg1>0?1:LT.length-1))%LT.length;return;}
 const L=listOf(pm.l);
 if(pm.ed){const r=L[pm.i];if(k==='e'){const v=+(+pm.v).toFixed(2);if(r[7])r[7].s(v);else u.par[r[0]]=v;note(`${r[0]} set to ${v} ${r[6]||''}`);pm.ed=false;}else pm.v=clamp(+pm.v+sg1*r[5],r[3],r[4]);return;}
 if(pm.lv===1&&pm.i>=L.length){if(k==='+')menuOut();else if(k==='-')pm.i=L.length-1;return;}
 if(k==='e'){const r=L[pm.i];if(r[3]==null){note(`${r[0]} is set at installation, not changed here.`,'w');return;}pm.v=rowV(r);par(r[0],0);pm.ed=true;return;}
 if(pm.lv===1)pm.i=clamp(pm.i+sg1,0,L.length);else pm.i=(pm.i+(sg1>0?1:L.length-1))%L.length;}
function d50(){const flash=Math.floor(Date.now()/450)%2;
 if(!s.asked&&pm.lv===2)return flash?LMENU[pm.m]:'';
 if(!s.asked&&pm.lv){if(pm.l==='Al'){const a=alarmRowsLog();return pm.i>=a.length?(flash?'End':''):a[pm.i].txt;}
  if(pm.l==='Te'){const t=LT[pm.i];return t[0]+(u.msv[t[1]]?' ON':' off');}
  const L=listOf(pm.l);if(pm.i>=L.length)return flash?'End':'';const r=L[pm.i],v=pm.ed?(+(+pm.v).toFixed(2)):rowV(r);return pm.ed&&!flash?r[0]:r[0]+'  '+v+(r[6]&&String(r[0]).length<6?' '+r[6]:'');}
 const act=Object.values(s.alarm).find(a=>a.on);
 if(!act&&info>0&&!s.asked){const[i,g]=INFO[info-1];return i+' '+g();}
 if(!act&&s.ph==='sep'&&!s.asked)return `${fx(s.mtW,2)}   ${Math.max(0,u.iv-s.tSince/60).toFixed(0)} min`;
 if(!act&&['rundown','stopseq'].includes(s.ph)&&s.rpm>0&&!s.sc)return Math.floor(Date.now()/1000)%2?'Stop':String(Math.round(s.rpm*M.rpmR));
 return statusText();}
function d50n(){if(pm.lv===2)return 'Menu: + next, ENTER open';if(pm.lv&&pm.i>=listOf(pm.l).length&&pm.l==='Pr')return 'End: ENTER and + for menu';if(!pm.lv)return ['Normal','','','',''][0]&&'';if(pm.l==='Al')return 'Alarm list, newest first';if(pm.l==='Te')return 'ENTER switches output';const L=listOf(pm.l);if(pm.i>=L.length)return 'End of list';const r=L[pm.i];return r[1].slice(0,24)+(r[7]?'':' *');}
