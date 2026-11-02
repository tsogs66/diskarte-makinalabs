/* --- control unit faces: EPC 50 (S), EPC 60 (P), Samgong panel and Multi-Monitor (SJ) --- */
let info=0,pm={i:-1,ed:false,v:0,buf:''},sg={mode:'mon',ad:0,v:0},mmRow=0,KEYS={};
const INFO=[['TT1',()=>fx(s.T,0)+' C'],['TT2',()=>fx(s.T-.5,0)+' C'],['Flow',()=>fx(s.Q/1000,1)+' m3/h'],['PT1',()=>fx(s.Pin,1)+' bar'],['PT4',()=>fx(s.Pout,1)+' bar'],['PT5',()=>fx(s.Pwo,1)+' bar'],['MT',()=>fx(80+s.mtW*45,1)],['Run time',()=>fx(s.tRun/3600,0)+'h'],['Rpm',()=>String(Math.round(s.rpm*M.rpmR))]];
const lim=(lab,k,unit,a,b,st,desc)=>[lab,()=>u.lim[k],v=>{u.lim[k]=v;},unit,a,b,st,desc];
const PARAMS=()=>M.alcap?[['Pr 1',()=>u.iv,v=>{u.iv=v;},'min',M.ivMin,M.ivMax,1,'Time to discharge'],['Pr 4',()=>u.pr4,v=>{u.pr4=v;if($('pr4'))$('pr4').checked=!v;},'',0,1,1,'Alcap 1 On, 0 Stb.'],lim('Pr 10','hiO','bar',0,6,.1,'High oil pressure'),lim('Pr 11','loO','bar',0,6,.1,'Low oil pressure'),lim('Pr 13','loW','bar',0,6,.1,'Low water pressure'),lim('Pr 14','hiF','bar',0,6,.1,'High feed pressure'),lim('Pr 16','hiT','C',0,115,1,'High temp limit'),lim('Pr 17','loT','C',0,115,1,'Low temp limit'),['Pr 18',()=>u.Ts,v=>{u.Ts=v;},'C',0,110,1,'Temp setpoint']]:[['Discharge interval',()=>u.iv,v=>{u.iv=v;},'min',M.ivMin,M.ivMax,1],['Oil feed temp',()=>u.Ts,v=>{u.Ts=v;},'C',30,105,1]];
const kS=()=>M.id==='p605'?'SEPARATOR':'SEPARATION';
function fKey(id,x,y,w,h,lab,fn,o){o=o||{};KEYS[id]=fn;const ls=String(lab).split('|'),fs=o.fs||13,col=o.tc||'#1b2321';
 return `<g class="fkey" data-key="${id}" tabindex="0" role="button" aria-label="${(o.aria||lab).replace('|',' ')}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx??5}" fill="${o.bg||'#d9d6c9'}" stroke="#1b2321" stroke-width="1.3"/>${ls.map((t,i)=>`<text x="${x+w/2}" y="${y+h/2+fs*.35+(i-(ls.length-1)/2)*fs*1.05}" text-anchor="middle" style="font-size:${fs}px;fill:${col}">${t}</text>`).join('')}</g>`;}
const fLed=(id,x,y,r)=>`<circle id="${id}" cx="${x}" cy="${y}" r="${r||5}" fill="#3a3f3c" stroke="#1b2321"/>`;
const sL=(id,c)=>{const e=$(id);if(e)e.setAttribute('fill',c==='g'?'#3ee07f':c==='y'?'#ffc53d':c==='r'?'#ff4a3f':(e.dataset.off||'#3a3f3c'));};
const sT=(id,t)=>{const e=$(id);if(e&&e.textContent!==t)e.textContent=t;};
const screws=(w,h)=>[[14,14],[w-14,14],[14,h-14],[w-14,h-14]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#9a9f98" stroke="#1b2321"/><path d="M${x-4} ${y}H${x+4}" stroke="#1b2321"/>`).join('');
/* panel faces are drawn in faces.js; hot spots and lamps use the same coordinates */
const pImg=(n,w,h,lab,inner)=>`<svg viewBox="0 0 ${w} ${h}" class="face" role="group" aria-label="${lab}">${FACE[n]()}${inner}</svg>`;
const hk=(id,[x,y,w,h],fn,lab)=>{KEYS[id]=fn;return `<g class="hk" data-key="${id}" tabindex="0" role="button" aria-label="${lab}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/></g>`;};
const hkT=(id,[x,y,w,h],fn,lab)=>{KEYS[id]=fn;return `<g class="hk ht" data-key="${id}" tabindex="0" role="button" aria-label="${lab}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" style="fill:#fff;stroke:#1f5fae"/><text x="${x+w/2}" y="${y+31}" text-anchor="middle" class="pnote" style="font-size:26px">${lab}</text></g>`;};
const iLed=(id,x,y,r)=>`<circle id="${id}" cx="${x}" cy="${y}" r="${r||14}" fill="none" data-off="none" class="ilamp"/>`;
function buildEPC50(){
 return pImg('epc50',1680,944,'EPC 50 control unit',[['lPump',270,176],['lHeat',352,175],['lTT',433,175],['lP1',510,176],['lV1',590,176],['lMT',749,176],['lP4',829,176],['lV4',905,176],['lClose',147,304],['lOpen',228,304],['lSeal',311,304],['lP5',791,304],['lV5',868,304],['lMot',831,430],['lsH',1179,139],['lsS',1179,296],['lsT',1179,449],['lsO',1179,657],['lsA',1179,739]].map(l=>iLed(l[0],l[1],l[2])).join('')+
 `<rect id="lsD" x="1102" y="496" width="109" height="96" rx="12" fill="none" data-off="none" class="ilamp" fill-opacity=".45"/><text id="d50" x="540" y="664" class="seg16"></text>
 <text id="d50n" x="60" y="700" class="pnote" style="fill:#1f4f9e"></text><text x="60" y="748" class="pnote" style="font-size:25px">+ next, ENTER list or edit</text>`+(/mobile-/.test(location.pathname)?'<text x="60" y="796" class="pnote" style="font-size:25px">Two keys: hold both</text><text x="60" y="844" class="pnote" style="font-size:25px">with two fingers</text>':hkT('k50b1',[52,768,400,44],bothEP,'ENTER and + together')+hkT('k50b2',[52,822,400,44],bothPM,'+ and − together'))+
 hk('k50m',[534,761,107,103],()=>epc50('-'),'Minus, NO')+hk('k50p',[699,761,106,103],()=>epc50('+'),'Plus, YES')+hk('k50e',[862,761,162,103],()=>epc50('e'),'Enter')+
 hk('k50h',[1107,164,99,92],()=>setHeater(!s.heaterOn),'Heater')+hk('k50s',[1107,324,99,95],pressSep,'Separation and stop')+hk('k50d',[1108,501,98,86],pressDis,'Discharge')+hk('k50a',[1107,763,99,95],resetAl,'Alarm, acknowledge and reset'));}
function buildEPC60(){const nb=[['7',857,173],['8',988,173],['9',1118,173],['4',857,319],['5',988,319],['6',1118,319],['1',857,465],['2',988,465],['3',1118,465],['.',857,611],['0',988,611]];
 return pImg('epc60',1264,1264,'EPC 60 control unit',[['lsH',287,809],['lsS',443,809],['lsD',600,809],['lsR',755,808],['lsP',287,990],['lsA',444,989],['lsL',600,990],['lsC',755,990]].map(l=>iLed(l[0],l[1],l[2],11)).join('')+
 [0,1,2,3].map(i=>`<text id="d60_${i}" x="192" y="${386+i*47}" class="lcd60"></text>`).join('')+
 hk('k60I',[100,792,134,137],()=>epc60('I'),'Start')+hk('k60O',[101,972,133,136],()=>epc60('O'),'Stop')+
 hk('k60h',[272,793,118,136],()=>setHeater(!s.heaterOn),'Heater')+hk('k60s',[427,792,121,137],pressSep,'Separator')+hk('k60d',[584,793,119,131],pressDis,'Discharge')+hk('k60r',[738,793,120,131],()=>{u.rem=u.rem?0:1;note(u.rem?'Remote control selected':'Local control selected');},'Remote control')+
 hk('k60p',[272,974,120,133],()=>setPump(!s.pump),'Feed pump')+hk('k60a',[427,974,121,123],resetAl,'Alarm, acknowledge and reset')+hk('k60l',[584,974,119,123],()=>{s.slp=s.slp?0:1;},'Sludge pump')+hk('k60c',[738,974,120,133],()=>note(s.rpm>0?'CIP is available only at standstill, with the cleaning kit connected.':'CIP needs the cleaning kit connected. Not simulated.','w'),'Cleaning in place')+
 nb.map((n,i)=>hk('k60n'+i,[n[1],n[2],100,102],()=>epc60(n[0]),n[0])).join('')+
 hk('k60e',[1118,611,100,102],()=>epc60('e'),'Enter')+hk('k60u',[997,779,105,110],()=>epc60('u'),'Up')+hk('k60b',[889,902,105,103],()=>epc60('b'),'Back')+hk('k60i',[1113,902,100,110],()=>epc60('i'),'Information')+hk('k60v',[998,1017,105,110],()=>epc60('v'),'Down'));}
const SGM=()=>[['00','Next discharge, h.mm',()=>{const m=Math.max(0,u.iv-s.tSince/60);return Math.floor(m/60)*100+Math.floor(m%60);}],['q0','Output Q0, SV1 opening',()=>s.sv.open],['q1','Output Q1, SV2 closing',()=>s.sv.close],['q2','Output Q2, SV3 seal',()=>s.sv.seal],['q3','Output Q3, SV4 feed',()=>s.sv.feed],['15','Output Q15, feeding',()=>s.v1],['16','Output Q16, discharging',()=>s.ph==='dis'?1:0]];
const rowT=rx=>[...M.scr.start,...M.scr.dis].filter(r=>rx.test(r[0]));
const tRow=(ad,nm,rx,a,b)=>[ad,nm,()=>rowT(rx)[0][1],[a,b,v=>{for(const r of rowT(rx))r[1]=v;}]];
const SGS=()=>[['15','C015 Discharge interval, min',()=>u.iv,[M.ivMin,M.ivMax,v=>{u.iv=v;syncSet();}]]].concat(M.hid?[['11','T011 Partial discharge, 0.1 s',()=>Math.round(M.scr.par[3][1]*10),[1,30,v=>{M.scr.par[3][1]=v/10;}]],['22','C022 Monitoring time, min',()=>M.mon,[1,60,v=>{M.mon=v;}]]]:[['11','T011 Partial discharge, not used',()=>6,null]],[tRow('01','Opening, s',/Opening/,1,9),tRow('02','Replacement, s',/eplacement/,0,40),tRow('03','Closing, s',/Closing/,2,15),tRow('04','Sealing, s',/Sealing/,1,40),['06','Set temperature, C',()=>u.Ts,[30,105,v=>{u.Ts=v;syncSet();}]]]);
function buildSG(){
 return pImg('samgong',1680,944,'Purifier control panel',[['lSV3',171,141,20],['lSV2',258,141,20],['lSV1',345,141,20],['lSV9',437,141,20],['lSV4',903,141,20],['lMot',608,576,22],['lLeak',232,799,13],['lNd',389,799,13],['lHd',543,799,13],['lTH',710,799,13],['lTL',862,799,13]].map(l=>iLed(...l)).join('')+
 `<rect id="lMon" x="1276" y="409" width="112" height="99" rx="12" fill="none" data-off="none" fill-opacity=".72"/><text id="dA" x="1284" y="205" text-anchor="end" class="seg7"></text><text id="dD" x="1540" y="205" text-anchor="end" class="seg7"></text><text id="dN" x="1335" y="290" text-anchor="middle" class="pnote" style="fill:#e8e8e2"></text>
 <text x="1125" y="800" class="pnote" style="fill:#e8e8e2">Mon: watch outputs, ▲▼</text><text x="1125" y="838" class="pnote" style="fill:#e8e8e2">Set: pick timer, Ent, ▲▼, Ent</text><text x="1125" y="876" class="pnote" style="fill:#e8e8e2">DIS-T: forces a discharge</text>`+
 hk('kEnt',[1125,409,113,99],()=>sgKey('e'),'Enter')+hk('kMon',[1276,409,112,99],()=>sgKey('m'),'Monitor')+hk('kAS',[1427,409,114,99],autoStart,'Auto start')+hk('kSet',[1125,526,112,98],()=>sgKey('s'),'Set')+hk('kDT',[1276,526,112,98],()=>sgKey('d'),'DIS-T, force discharge')+hk('kSt',[1428,527,112,97],autoStop,'Auto stop')+hk('kDn',[1125,643,113,99],()=>sgKey('v'),'Down')+hk('kUp',[1276,643,112,99],()=>sgKey('u'),'Up')+hk('kRst',[1428,644,112,97],resetAl,'Alarm reset'));}
function buildMM(){const h=M.hid,D='#2a2620',scr=(x,y)=>`<circle cx="${x}" cy="${y}" r="11" fill="#a9a59a" stroke="#3a3833" stroke-width="1.5"/><path d="M${x-8} ${y+3}L${x+8} ${y-3}" stroke="#3a3833" stroke-width="2.4"/>`;return `<svg viewBox="0 0 340 400" class="face mm" role="group" aria-label="Multi-Monitor">
 <rect width="340" height="400" rx="5" fill="#1d4a9c" stroke="#0c1f45" stroke-width="2"/><rect x="14" y="14" width="312" height="240" rx="3" fill="#d9d3bf" stroke="#8d8772"/>${scr(30,30)}${scr(310,30)}${scr(26,372)}${scr(314,372)}<text x="170" y="36" text-anchor="middle" class="ftx" style="fill:${D};font-size:15px">Multi-Monitor (MM22)</text>
 <rect x="30" y="46" width="180" height="178" fill="#120707" stroke="#000"/>
 <text id="mm1" x="202" y="92" text-anchor="end" class="seg7m"></text><text id="mm2" x="202" y="146" text-anchor="end" class="seg7m"></text><text id="mm3" x="202" y="204" text-anchor="end" class="seg7m"></text>
 ${fKey('kSW',222,46,32,28,'▲',()=>{mmRow=(mmRow+1)%(M.hid?3:2);},{bg:'#1b1d20',tc:'#e8e8e2',fs:13,rx:2,aria:'SW, pressure or speed'})}<text x="260" y="66" class="ftx" style="fill:${D};font-size:12px">SW.</text>
 ${[['mF',92,'Flow rate (L/h)'],['mX',110,'× 10'],['mT',132,'Temp. (°C)'],['mP',152,'L. press. (MPa)'],['mR',172,'Rev. (min⁻¹)']].concat(h?[['mW',190,'Circ. (MPa)']]:[]).map(([i,y,t])=>`${fLed(i,226,y,5)}<text x="236" y="${y+4}" class="ftx" style="fill:${D};font-size:11.5px;font-weight:500">${t}</text>`).join('')}
 ${fLed('mE',226,h?208:204,5)}<text x="236" y="${h?212:208}" class="ftx" style="fill:${D};font-size:11.5px;font-weight:500">Error</text>
 <text x="170" y="244" text-anchor="middle" class="ftx" style="fill:${D};font-size:11px">MITSUBISHI KAKOKI KAISHA, LTD.</text>
 ${fKey('kMM',30,264,h?90:136,28,'FUNCTION',()=>{u.mm=u.mm?0:1;if(u.mm)s.lmT=0;},{bg:'#e4e1d5',fs:11.5})}${fLed('mMM',40,278,4)}${fKey('kLM',h?126:174,264,h?90:136,28,h?'LM OUTPUT':'LM ALARM OUTPUT',()=>{u.lmOn=u.lmOn?0:1;},{bg:'#e4e1d5',fs:11.5})}${fLed('mLM',h?136:186,278,4)}${h?fKey('kWD',222,264,88,28,'WD OUTPUT',()=>{u.wd=u.wd?0:1;},{bg:'#e4e1d5',fs:11.5})+fLed('mWD',232,278,4):''}
 ${fLed('mAdj',42,308,4.5)}<text x="52" y="312" class="ftx" style="fill:#fff;font-size:11px;font-weight:500">Press. adjust</text>${fLed('mDD',174,308,4.5)}<text x="184" y="312" class="ftx" style="fill:#fff;font-size:11px;font-weight:500">Rotation (DD)</text>
 <rect x="72" y="334" width="196" height="38" rx="3" fill="#e6dfca" stroke="#111" stroke-width="2"/><text x="170" y="360" text-anchor="middle" font-family="Arial,Roboto,sans-serif" font-size="20" font-weight="700" fill="#111">MULTI-MONITOR</text>
 </svg>`;}
/* EPC 50 keys held together make a combination, as on the real panel: a press counts when the finger lifts, unless a second key joined it */
function wireChord(root){const K={k50p:'p',k50m:'m',k50e:'e'},dn=new Map();let used=false;
 for(const g of root.querySelectorAll('[data-key]')){const c=K[g.dataset.key];if(!c)continue;g.dataset.chord=1;
  g.addEventListener('pointerdown',e=>{try{g.setPointerCapture(e.pointerId);}catch(x){}if(!dn.size)used=false;dn.set(e.pointerId,c);g.classList.add('dn');if(dn.size===2){const v=[...dn.values()].sort().join('');used=true;if(v==='ep')bothEP();else if(v==='mp')bothPM();}});
  const up=e=>{if(!dn.has(e.pointerId))return;dn.delete(e.pointerId);g.classList.remove('dn');if(e.type==='pointerup'&&!used&&!dn.size)KEYS[g.dataset.key]();};
  g.addEventListener('pointerup',up);g.addEventListener('pointercancel',up);
  /* two fingers on a key must not start the pop-up's pinch zoom */
  g.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();},{passive:false});g.addEventListener('touchmove',e=>{e.preventDefault();e.stopPropagation();},{passive:false});}}
function buildCP(){KEYS={};info=0;mmRow=0;pm={i:-1,ed:false,v:0,buf:'',sub:0,lv:0,l:'Pr',m:0,tst:0};sg={mode:'mon',ad:0,v:0,ed:false};
 $('cpTitle').textContent=isA()?M.ctrl+' control unit':'Control panel and Multi-Monitor';
 $('cp').className='cpface'+(isA()?'':' two');$('cp').innerHTML=M.id==='s826'?buildEPC50():M.id==='p605'?buildEPC60():buildSG()+buildMM();
 wireChord($('cp'));for(const g of $('cp').querySelectorAll('[data-key]')){const fn=e=>{if(e.detail&&g.dataset.chord)return;g.classList.add('dn');setTimeout(()=>g.classList.remove('dn'),120);KEYS[g.dataset.key]();};g.addEventListener('click',fn);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}});}}
function paramStore(){const r=PARAMS()[pm.i],v=+clamp(pm.v,r[4],r[5]).toFixed(2);r[2](v);syncSet();note(`${r[0]} set to ${v} ${r[3]}`);}
function epc60(k){const P=PARAMS();
 if(s.asked){if(k==='I'||k==='e')lcdKey('+');else if(k==='O'||k==='b')lcdKey('-');return;}
 if(pm.ed){if(/[0-9.]/.test(k)){pm.buf=(pm.buf+k).slice(0,5);return;}if(k==='e'){const v=parseFloat(pm.buf);if(isFinite(v)){pm.v=v;paramStore();}pm.ed=false;pm.buf='';return;}if(k==='b'){pm.ed=false;pm.buf='';}return;}
 if(k==='I'){if(['standst','rundown'].includes(s.ph))pressSep();else if(!s.motor)setMotor(1);return;}
 if(k==='O'){if(['sep','closing','dis','wait'].includes(s.ph))pressSep();return;}
 if(k==='i'){pm.help=!pm.help;return;}
 if(info===3&&pm.sub){if(k==='b'){pm.sub=0;return;}if(pm.sub===1){if(k==='u'||k==='v')pm.i=pm.i===1?0:1;if(k==='e'){pm.ed=true;pm.buf='';}}return;}
 if(info===3&&'123'.includes(k)){pm.sub=+k;pm.i=0;return;}
 if(k==='u')info=(info+3)%4;if(k==='v')info=(info+1)%4;if(k==='b')info=0;}
function sgKey(k){
 if(k==='m'){sg.mode='mon';sg.ad=0;sg.ed=false;return;}if(k==='s'){sg.mode='set';sg.ad=0;sg.ed=false;return;}
 if(k==='d'){if(!sg.ed)pressDis();return;}
 const L=sg.mode==='mon'?SGM():SGS(),r=L[sg.ad];
 if(sg.ed){if(k==='u'||k==='v')sg.v=clamp(sg.v+(k==='u'?1:-1),r[3][0],r[3][1]);else if(k==='e'){r[3][2](sg.v);note(`${r[1]} set to ${sg.v}`);sg.ed=false;}return;}
 if(k==='e'&&sg.mode==='set'){if(r[3]){sg.ed=true;sg.v=r[2]();}else note('This timer is read only here.','w');return;}
 if(k==='u')sg.ad=(sg.ad+1)%L.length;if(k==='v')sg.ad=(sg.ad+L.length-1)%L.length;}
function statusText(){
 if(s.asked===1)return 'Has the bowl been dismantled? + = YES, - = NO';if(s.asked===2)return 'Assembled according to manual? + = YES, - = NO';if(s.asked===3)return 'Bowl cleaned? + = YES, - = NO';
 const act=Object.values(s.alarm).find(a=>a.on);if(act)return act.txt;
 if(s.ph==='hold')return 'Feed stopped';return s.msg||(s.ph==='standst'?'Standst.':s.ph==='off'?'Stopped':'-');}
function scroll16(t,n){if(t.length<=n)return t;const p=t+'     ',o=Math.floor(Date.now()/320)%p.length;return (p+p).slice(o,o+n);}
const H60={sep:'Separation',wait:'Standby',start:'Start',closing:'Start',dis:'Discharge',stopseq:'Stop',rundown:'Stop',standst:'Standstill',hold:'Feed stopped',estop:'Emergency stop',safety:'Safety stop'};
function d60(){const P=PARAMS(),pad=t=>String(t).slice(0,31);
 if(s.asked){const t=statusText().split(' + =')[0];return [t.slice(0,31),t.slice(31,62),'','I = YES          O = NO'];}
 if(pm.ed){const r=P[pm.i];return [r[0],'Now '+r[1]()+' '+r[3],'New '+pm.buf+'_','↵ store   ⟲ cancel'];}
 if(pm.help){const n=steps().find(r=>!r[1]()),t=n?n[0]:'Procedure complete';return ['Next step:',t.slice(0,31),t.slice(31,62),'i to close'];}
 if(info===0){const a=Object.entries(s.alarm).filter(x=>x[1].on);
  if(a.length){const i=Math.floor(Date.now()/3000)%a.length,[id,x]=a[i];return [`Alarm page ${i+1}/${a.length}`,'*Alarm'+({loT:' A21',sludge:' A120'}[id]||''),pad(x.txt),''];}
  const left=Math.max(0,u.iv*60-s.tSince);return [`___${H60[s.ph]||s.ph}___`,`Flow = ${fx(s.Q/1000,1).replace('.',',')} m3h`,`Temp = ${fx(s.T,0)}`,`Discharge = ${Math.floor(left/60)}m ${Math.floor(left%60)}s`];}
 if(info===1)return [`Speed = ${Math.round(s.rpm*M.rpmR)}rpm`,`PT 1 = ${fx(s.Pin,1).replace('.',',')} bar`,`PT 4 = ${fx(s.Pout,1).replace('.',',')} bar`,''];
 if(info===2)return ['TT1  TT2  Vib',`${fx(s.T,0)}   ${fx(s.T-.5,0)}   ${fx(s.vib,1)}`,'',''];
 if(pm.sub===1)return ['___Parameters___',(pm.i===0?'> ':'  ')+P[0][0]+' '+P[0][1]()+' '+P[0][3],(pm.i===1?'> ':'  ')+P[1][0]+' '+P[1][1]()+' '+P[1][3],'▲▼ pick, ↵ edit, ⟲ back'];
 if(pm.sub===2){const c=M.scr.dis;return ['___Time settings___',pad(c[0][0]+' '+c[0][1]+' s'),pad(c[1][0]+' '+c[1][1]+' s'),pad(c[2][0]+' '+c[2][1]+' s')];}
 if(pm.sub===3)return ['___Operation info___',`Run time ${fx(s.tRun/3600,1)} h`,`Discharges ${s.nDis}`,`Oil lost ${fx(s.loss,1)} L`];
 return ['___Settings___','1. Parameters','2. Time settings','3. Operation info'];}
function renderCP(){const al=Object.values(s.alarm).some(a=>a.on),sepOn=['sep','dis','closing'].includes(s.ph);
 if(M.id==='s826'){sT('d50',scroll16(d50(),16));sT('d50n',d50n());
  const m={lPump:s.pump&&'g',lHeat:s.heaterOn&&'g',lV1:s.v1&&'g',lV4:u.out&&'g',lV5:s.sv.drain&&'g',lSeal:s.sv.seal&&'g',lOpen:s.sv.open&&'g',lClose:s.sv.close&&'g',lMot:s.motor&&'g',lTT:s.alarm.hiT||s.alarm.loT?'r':'g',lP1:s.alarm.feedL?'r':s.Pin>0&&'g',lP4:s.alarm.ptH||s.alarm.ptL?'r':s.Pout>0&&'g',lP5:s.alarm.pt5?'r':s.Pwo>0&&'g',lMT:s.alarm.tHi?'r':s.ph==='sep'&&'g',lsH:s.heaterOn&&'g',lsS:sepOn&&'g',lsT:['stopseq','rundown'].includes(s.ph)&&'y',lsD:s.ph==='dis'&&'y',lsO:'g',lsA:al&&'r'};for(const k in m)sL(k,m[k]);}
 else if(M.id==='p605'){d60().forEach((t,i)=>sT('d60_'+i,t));const m={lsH:s.heaterOn&&'g',lsS:sepOn&&'g',lsD:s.ph==='dis'&&'y',lsR:u.rem&&'g',lsP:s.pump&&'g',lsA:al&&'r',lsL:s.slp&&'g',lsC:0};for(const k in m)sL(k,m[k]);}
 else{const on=u.pw,set=sg.mode==='set',L=set?SGS():SGM(),r=L[sg.ad],pad4=v=>String(Math.round(v)).padStart(4,'0'),bl=sg.ed&&Math.floor(Date.now()/350)%2;
  sT('dA',on?r[0]:'');sT('dD',!on||bl?'':pad4(sg.ed?sg.v:r[2]()));sT('dN',on?r[1]:'');sL('lMon',on&&!set&&'y');
  const m={lSV1:on&&s.sv.open&&'g',lSV2:on&&s.sv.close&&'g',lSV3:on&&s.sv.seal&&'g',lSV9:on&&s.sv.par&&'g',lSV4:on&&s.sv.feed&&'g',lMot:s.motor&&'g',lLeak:(s.alarm.leak||s.alarm.lm)&&'r',lNd:s.alarm.nodis&&'r',lHd:s.alarm.hidens&&'r',lTH:s.alarm.hiT&&'r',lTL:s.alarm.loT&&'r'};for(const k in m)sL(k,m[k]);
  const x10=s.Q>=1000,dp=Math.abs(s.Pout-1.5)/1.5;sT('mm1',on?fx(x10?s.Q/10:s.Q,0):'');sT('mm2',on?fx(s.T,0):'');sT('mm3',on?(mmRow===2?fx(s.Pwd,3):mmRow?fx(s.rpm*M.rpmR,0):fx(s.Pout/10,3)):'');
  const n={mF:on&&'g',mX:on&&x10&&'g',mT:on&&'g',mP:on&&!mmRow&&'g',mR:on&&mmRow===1&&'g',mW:on&&mmRow===2&&'g',mWD:u.wd&&'g',mE:0,mMM:u.mm&&'g',mLM:u.lmOn&&'g',mDD:s.rpm>.1&&Math.floor(Date.now()/500)%2&&'g',mAdj:s.ph==='sep'&&dp<.15&&(dp<.03||Math.floor(Date.now()/400)%2)&&'y'};for(const k in n)sL(k,n[k]);}}
