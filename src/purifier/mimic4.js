/* --- system mimics redrawn on one grid around your unit images. Pipes end at the image's own connections, found by image pixel through pt().
   Symbols: gate bowtie, adjustable valve with arrow, actuated valve with dome, solenoid with its rotating indicator, check, relief, strainer, trap, ISA bubbles.
   Layer order: pipes, flows, machine, valves and instruments, labels. --- */
const pBase=[];
function dgPipes(){const al=[...PIPES.map(p=>[p[0],p[2]]),...pBase.map((d,i)=>['b'+i,d])],base=al.map(([id,d])=>{const a=id[0]==='a';return `<path d="${d}" fill="none" stroke="#1b2321" stroke-width="${a?2:9}" stroke-linejoin="miter" ${a?'stroke-dasharray="9 5"':''}/>${a?'':`<path d="${d}" fill="none" stroke="#f4f5f1" stroke-width="5.6" stroke-linejoin="miter"/>`}`;}).join('');
 return base+PIPES.map(([id,c,d])=>{const a=id[0]==='a';return `<path id="c_${id}" d="${d}" fill="none" stroke="${c}" stroke-width="${a?3:5.6}" stroke-linejoin="miter" style="display:none"/><path id="f_${id}" d="${d}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="${a?1.4:2.4}" class="flowl" style="display:none"/>`;}).join('');}
const chk=(x,y,v)=>{const r=v?` transform="rotate(90 ${x} ${y})"`:'';return `<g${r} style="${X3SH}">${x3Fl(x,y,13,9)}<path d="M${x-12} ${y-12}V${y+12}L${x+10} ${y}Z" fill="url(#x3Steel)" stroke="#1b2321" stroke-width="2.2"/><path d="M${x-12} ${y-12}V${y+12}L${x+10} ${y}Z" fill="url(#x3Hi)"/><path d="M${x+11} ${y-13}V${y+13}" stroke="#1b2321" stroke-width="3.5"/></g>`;};
const stbox=(k,x,y,l)=>`<g class="vlv" data-k="${k}" tabindex="0" role="button" aria-label="${l}"><rect id="b_${k}" x="${x-17}" y="${y-17}" width="34" height="34" rx="4" fill="url(#mBody)" stroke="#1b2321" stroke-width="2.5" style="${X3SH}"/><path d="M${x-13} ${y-13}L${x+13} ${y+13}" stroke="#1b2321" stroke-width="2.5" stroke-dasharray="5 3"/>${x3Strainer(x,y,17)}</g>`;
const tankD=(cid,poly,idL,col)=>`<path d="${poly}" fill="url(#mBody)" stroke="#1b2321" stroke-width="3" style="${X3SH}"/>${tank(cid,poly,idL,col)}<path d="${poly}" fill="url(#x3HiV)" pointer-events="none"/><path d="${poly}" fill="none" stroke="#1b2321" stroke-width="3"/>`;
function pumpV(k,id,x,y,r,l,dir){return `<g class="pmp" data-ax="${x}" data-k="${k}" tabindex="0" role="button" aria-label="${l}">${x3Pump(x,y,r,id,'url(#mDome)',dir||-1)}<path d="M${x-r*.55} ${y+r*.45}L${x} ${y-r*.7}L${x+r*.55} ${y+r*.45}Z" fill="#1b2321"/></g>`;}
const relief=(x,y)=>`<path d="M${x-13} ${y-9}V${y+9}L${x} ${y}ZM${x-9} ${y-13}H${x+9}L${x} ${y}Z" fill="url(#x3Brass)" stroke="#1b2321" stroke-width="2.2" style="${X3SH}"/><path d="M${x} ${y-13}l-6 -4l12 -5l-12 -5l12 -5" fill="none" stroke="#1b2321" stroke-width="1.8"/>`;
const trap=(x,y)=>`<circle cx="${x}" cy="${y}" r="14" fill="url(#x3Steel)" stroke="#1b2321" stroke-width="2.5" style="${X3SH}"/><circle cx="${x}" cy="${y}" r="14" fill="url(#x3HiR)" pointer-events="none"/><path d="M${x-8} ${y-7}H${x+8}M${x} ${y-7}V${y+9}" stroke="#1b2321" stroke-width="2.5"/>`;
const NEST={s826:{k:.62,ox:439,oy:40},p605:{k:.56,ox:446,oy:36},p626:{k:.72,ox:356,oy:40},sj30g:{k:.56,ox:402,oy:83},sj30gh:{k:.56,ox:402,oy:83}};
function buildMimic4(){const T=M.tag,C=BOWLS[M.id],N=NEST[M.id],S=M.id==='s826',F=M.id==='p626',P=M.id==='p605'||F,J=!isA(),H=!!M.hid,pt=(x,y)=>[Math.round(N.ox+N.k*x),Math.round(N.oy+N.k*y)],wAct=()=>u.wOn&&(s.sv.seal||s.sv.open||s.sv.close);
 /* AL 1810571 air valve block, S and P solenoid valve block for water, MKK Fig. 3-32 and 3-33 solenoid valve unit. Columns are chosen so the lines leave without crossing. */
 const WC=J?(H?{seal:540,par:645,open:750,close:855}:{seal:540,open:665,close:790}):S?{seal:540,open:665,close:790}:{seal:540,open:665,close:790},WR=Math.max(...Object.values(WC)),AC=S?{feed:960,drain:1085,out:1210}:{feed:980,out:1105},AR=Math.max(...Object.values(AC)),top=J?-12:-96,ah=-40,sv=Object.values(AC);
 /* water block sits low on the sheet: header WY under the solenoids at SY; air block top right with its supply entering from the left through the air inlet valve */
 const WY=1045,SY=1005,AX=AC.feed-40;
 /* S 826 ports are on the photo: inlet bend, clean oil and water stubs after the oil block and drain valve */
 const q=S?{feed:pt(555,67),cl:pt(995,272),wat:pt(995,116),cls:pt(454,885),opn:pt(190,850),slg:pt(990,700)}:F?{feed:pt(650,75),cl:pt(650,129),wat:pt(650,129),s206:pt(505,2),opn:pt(200,745),cls:pt(505,770),slg:pt(828,640)}:S?{feed:pt(826,51),cl:pt(826,144),wat:pt(826,228),cls:pt(327,1060),opn:pt(908,1040),slg:pt(1170,838)}:P?{feed:pt(570,150),cl:pt(570,218),wat:pt(572,240),s206:pt(492,135),opn:pt(70,1035),t373:pt(788,1273),t377:pt(788,1310),slg:pt(883,693)}:{feed:pt(567,30),cl:pt(617,100),wat:pt(646,150),cls:pt(742,1225),opn:pt(395,1228),slg:pt(1080,808)};
 GEO={L:[800,180],D:[800,180],Sl:[860,120],W:980};pBase.length=0;
 const FD=F||S?`M284 90H390V0H900V${q.feed[1]}H${q.feed[0]}`:P?`M284 90H390V46H810V${q.feed[1]}H${q.feed[0]}`:`M284 90H${q.feed[0]}V${q.feed[1]}`,sealIn=S||J,oy=J?120:q.cl[1],CLd=`M${q.cl[0]} ${J?q.cl[1]+'V120':q.cl[1]}H${J?1320:1380}V800`;
 PIPES=[['p1',C_.oil,'M190 950H260',()=>s.Q>0],['p1m',C_.oil,'M260 950V736',()=>s.Q>0&&!u.strB],['p1b',C_.oil,'M260 950H350V765H260V736',()=>s.Q>0&&u.strB],['p2',C_.oil,'M260 684V540',()=>s.Q>0],['p3',C_.oil,'M260 440V114',()=>s.Q>0],['feed',C_.oil,FD,()=>s.toBowl>0],['rec',C_.oil,'M236 90H100V800',()=>s.Q>0&&!s.toBowl],['clean',C_.cln,CLd,()=>s.Qo>0],
  ['slo',C_.slg,'M1100 980V1040H1124M1172 1040H1250',()=>s.slp&&s.sludgeL>0],
  ['wsi',C_.wat,`M205 ${WY}H270`,()=>wAct()],['ws',C_.wat,`M270 ${WY}H${WR}`,()=>wAct()],
  ['stm',C_.stm,'M120 465H225',()=>s.duty>0],['con',C_.stm,'M225 519H120',()=>s.duty>0],
  ['a0',C_.air,isA()?`M${AX-170} ${ah}H${AR}${sv.map(x=>`M${x} ${ah}V-30`).join('')}`:'M40 22H260',()=>u.aOn],['a1',C_.air,isA()?`M${AC.feed} 8V24H260V66`:'M260 22V66',()=>u.aOn&&s.sv.feed]];
 if(isA())PIPES.push(['a4',C_.air,`M${AC.out} 8V24H1330V${oy-24}`,()=>u.aOn&&u.out]);
 if(sealIn)PIPES.push(['wh1',C_.wat,S?`M${WC.seal} ${WY}V930H420V0`:`M${WC.seal} ${WY}V870H400V90`,()=>s.sv.seal],['fw',C_.wat,S?`M420 0H900V${q.feed[1]}H${q.feed[0]}`:`M400 90H${q.feed[0]}V${q.feed[1]}`,()=>s.sv.seal]);
 else PIPES.push(['wh1',C_.wat,F?`M${WC.seal} ${WY}V930H420V${q.s206[1]}H${q.s206[0]}`:`M${WC.seal} ${WY}V930H400V62H${q.s206[0]}V${q.s206[1]}`,()=>s.sv.seal]);
 if(S)PIPES.push(['wout',C_.wat,`M${q.wat[0]} ${q.wat[1]}H1150V${q.slg[1]}H1100`,()=>s.sv.drain],['a5',C_.air,`M${AC.drain} 8V44H1110V90`,()=>u.aOn&&s.sv.drain],['slg',C_.slg,`M${q.slg[0]} ${q.slg[1]}H1100V860`,()=>s.dipT>0||s.sv.drain],['wh2',C_.wat,`M${WC.open} ${WY}V900H${q.opn[0]}V${q.opn[1]}`,()=>s.sv.open],['wh3',C_.wat,`M${WC.close} ${WY}V900H${q.cls[0]}V${q.cls[1]}`,()=>s.sv.close]);
 if(P)PIPES.push(['slg',C_.slg,`M${q.slg[0]} ${q.slg[1]}H1100V860`,()=>s.dipT>0||s.brk>.05||(s.closed&&s.Vw>.01&&(s.toBowl>0||s.sv.seal))],['wh2',C_.wat,`M${WC.open} ${WY}V900H470V${q.opn[1]}H${q.opn[0]}`,()=>s.sv.open],['wh3',C_.wat,F?`M${WC.close} ${WY}V900H${q.cls[0]}V${q.cls[1]}`:`M${WC.close} ${WY}V900H950V${q.t373[1]}H${q.t373[0]}`,()=>s.sv.close]);
 if(P&&!F)PIPES.push(['ovf',C_.wat,`M${q.t377[0]} ${q.t377[1]}H915V840`,()=>s.sv.close&&s.c>.95]);
 if(J){PIPES.push(['slg',C_.slg,`M${q.slg[0]} ${q.slg[1]}H1100V860`,()=>s.dipT>0],['wh2',C_.wat,`M${WC.open} ${WY}V896H${q.opn[0]}V${q.opn[1]}`,()=>s.sv.open],['wh3',C_.wat,`M${WC.close} ${WY}V896H${q.cls[0]}V${q.cls[1]}`,()=>s.sv.close]);
  if(H)PIPES.push(['wh9',C_.wat,`M${WC.par} ${WY}V800H${q.opn[0]}`,()=>s.sv.par],['circ',C_.cln,`M${q.wat[0]} ${q.wat[1]}V146H1000V120`,()=>s.Qo>0&&u.v12]);
  else PIPES.push(['wout',C_.wat,`M${q.wat[0]} ${q.wat[1]}V146H1100V${q.slg[1]}`,()=>s.closed&&s.Vw>.01&&(s.toBowl>0||s.sv.seal)]);}
 pBase.push('M1100 1000V1020');
 const tn=(x,y,a,t)=>`<text x="${x}" y="${y}" text-anchor="${a||'start'}" class="vl">${t}</text>`,hL=`M${N.ox+C.vb[0]*N.k} ${N.oy+C.vb[1]*N.k}`;
 const tagY=J?168:S?108:88,hot=H?vS('v12',940,146,'V12',{t:'flow',lx:940,ly:192})+snS(850,190,'WD',24)+`<path d="M850 146V175" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>`+dTag('Pwd',855,240,'Circ. MPa',5):'';
 const wOutV=S?vS('drain',1110,q.wat[1],'V5',{t:'dome',lx:1110,ly:q.wat[1]+30})+solS('drainS','drainS',AC.drain,-12,'SV5',{nokey:1,sd:1})+snS(1150,60,'PT5',26)+`<path d="M1150 ${q.wat[1]}V75" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>`+dTag('Pwo',1235,60,'PT5 bar',4):'';
 const sens=S?snS(1100,165,'MT',22)+`<path d="M985 160H1078" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>`+dTag('mt',1095,240,'Water %',4):'';
 const ptX=J?1060:S?1190:995,ptY=J?176:oy-44;
 $('mimic').innerHTML=`<svg viewBox="0 ${top} 1456 ${1110-top}" class="dg" role="img" aria-label="Fuel oil separation system of the ${M.name}"><defs>
 <linearGradient id="mBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#eef1f0"/><stop offset="1" stop-color="#d7dcd9"/></linearGradient>
 <linearGradient id="mLiqSheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".18" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
 <radialGradient id="mDome" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d2d8d5"/></radialGradient>
 ${x3Defs()}
 </defs><rect y="${top}" width="1456" height="${1110-top}" fill="#fff"/>
 <rect x="516" y="965" width="${WR+125-516}" height="92" fill="#e4e8e6" stroke="#1b2321" stroke-width="2.5"/>${isA()?`<rect x="${AX}" y="-62" width="${AR+200-AX}" height="72" fill="#e4e8e6" stroke="#1b2321" stroke-width="2.5"/>`:''}
 ${J?`<rect x="676" y="${pt(567,1300)[1]-6}" width="88" height="56" fill="#c9ced0" stroke="#1b2321" stroke-width="3"/><circle id="mMot" cx="720" cy="${pt(567,1300)[1]+22}" r="13" fill="none" stroke="#1b2321"/><text x="720" y="${pt(567,1300)[1]+76}" text-anchor="middle" class="vl">Motor</text>`:''}
 <svg x="${N.ox+C.vb[0]*N.k}" y="${N.oy+C.vb[1]*N.k}" width="${C.vb[2]*N.k}" height="${C.vb[3]*N.k}" viewBox="${C.vb.join(' ')}">${bowlSvg('m',C)}</svg>
 ${dgPipes()}
 <rect x="26" y="380" width="364" height="200" fill="none" stroke="#6f7a7c" stroke-width="2" stroke-dasharray="8 8"/>
 ${tankD('cL','M40 800H190V940L140 980H40Z','tkOil','#6b421b')}${tankD('cD','M1250 800H1400V940L1350 980H1250Z','tkSvc','#c98a2c')}${tankD('cS','M1056 860H1190V980H1056Z','slTk',C_.slg)}<rect id="tkW" x="41" y="979" width="98" height="0" fill="#1f6db5"/>
 ${tn(115,1002,'middle','Settling tank')}${tn(1325,1002,'middle','Daily service tank')}${tn(1088,1002,'end','Sludge tank')}${tn(112,374,'start','Heating unit')}
 <text id="m_tt" x="115" y="836" text-anchor="middle" class="tkv"></text><text id="m_lvS" x="115" y="869" text-anchor="middle" class="tkv"></text><text id="m_xfer" x="115" y="902" text-anchor="middle" class="tkv"></text>
 <text id="m_lvD" x="1325" y="836" text-anchor="middle" class="tkv"></text><text id="m_svc" x="1325" y="869" text-anchor="middle" class="tkv"></text><text x="1325" y="898" text-anchor="middle" class="tkv" style="font-size:18px">Al+Si mg/kg</text>
 <text id="m_sl" x="1123" y="930" text-anchor="middle" class="tkv"></text>
 ${tn(F?590:720,F?650:P?840:J?1044:800,'middle',M.name)}<text id="m_bowl" x="${F?590:720}" y="${F?676:P?866:J?1070:826}" text-anchor="middle" class="vl"></text>
 <rect id="htr" x="225" y="440" width="70" height="100" fill="#f5d9c8" stroke="#1b2321" stroke-width="3"/><path d="M225 465L285 478L235 490L285 502L225 519" fill="none" stroke="${C_.stm}" stroke-width="3"/>${x3Shell(225,440,70,100)}${hsT('heater',225,440,70,100,'Heater')}${J?tn(305,484,'start','10')+tn(305,512,'start','Heater'):tn(305,496,'start','Heater')}
 ${pumpV('pump','pumpC',260,710,26,'Feed pump')}${tn(296,704,'start',J?'2 Gear':'Feed')}${tn(296,732,'start','pump')}
 ${vS('suc',222,950,J?(T.suc||'V7'):'Suction',{lx:226,ly:990})}${stbox('str',260,850,'Main suction strainer')}${stbox('strb',350,850,'Bypass suction strainer')}${tn(238,858,'end','Main')}${tn(373,858,'start','Bypass')}${['smi',905,'smo',795].map((k,i,a)=>i%2?'':vS(k,260,a[i+1],'',{v:1,nokey:1})).join('')}${['sbi',905,'sbo',795].map((k,i,a)=>i%2?'':vS(k,350,a[i+1],'',{v:1,nokey:1})).join('')}<g class="vlv" data-k="chg" tabindex="0" role="button" aria-label="Strainer change-over valve"><circle cx="260" cy="950" r="15" fill="#fff" stroke="#1b2321" stroke-width="2.5"/><path id="chgH" d="M260 950V936" stroke="#c4211f" stroke-width="5" stroke-linecap="round"/></g>${tn(282,982,'start','Change-over')}
 ${vS('flow',260,330,J?T.flow+' (12)':T.flow,{v:1,t:'flow',lx:288,ly:336,an:'start'})}
 ${snS(170,640,J?'PI':'PT1',26)}<path d="M196 640H260" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>${snS(170,403,'TT',22)}<path d="M192 403H260" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>
 ${dTag('Pin',330,602,T.pIn+' bar')}${dTag('T',330,416,T.tt+' °C')}${dTag('Q',330,230,'Flow L/h')}
 <path d="M260 746H380V674H260" fill="none" stroke="#1b2321" stroke-width="2"/>${relief(380,710)}${tn(340,664,'middle','Relief')}
 ${vS('stm',170,465,'Steam in',{t:'hand',ly:499})}${trap(170,519)}${tn(170,554,'middle','Trap')}
 ${vS('ret',100,300,'Recirc',{v:1,lx:128,ly:306,an:'start'})}${chk(100,700,1)}
 <g class="vlv" data-k="v1" tabindex="0" role="button" aria-label="Three way valve"><rect x="230" y="60" width="60" height="60" fill="transparent"/>${x3Valve3(260,90,22,13,'v_v1L','v_v1R','#fff','#111','dome')}</g>${tn(292,80,'start',T.feed+' 3-way')}<text id="m_v1" x="292" y="${P?118:120}" class="vl"></text>
 ${isA()?solS('feedS','feed',AC.feed,-12,T.airFeed,{nokey:1,sd:1}):solS('feedS','feed',260,44,T.airFeed,{nokey:1,sd:1})}
 ${isA()?vS('aOn',AX-75,ah,'Air in',{t:'hand',ly:ah-20})+dTag('Pa',AR+130,-40,'Air bar',3)+tn(AX,-72,'start','Air valve block'):vS('aOn',90,22,'Air in',{t:'hand',lx:46,ly:58,an:'start'})+dTag('Pa',190,54,'Air bar',3)}
 ${!isA()?'':vS('out',1330,oy,'V4',{t:'dome',ly:oy+34})+solS('outS','outS',AC.out,-12,'SV4',{nokey:1,sd:1})}
 ${J?vS('back',1170,oy,T.back+' (13)',{t:'press',ly:oy+34})+vS('out',1260,oy,T.out||'V10',{t:'hand',ly:oy+34}):vS('back',1260,oy,T.back,{t:'press',ly:oy+34})}
 ${chk(J?1320:1380,720,1)}${snS(ptX,ptY,T.pOut,28)}<path d="M${ptX} ${oy}V${ptY-(ptY>oy?15:-15)}" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>${dTag('Pout',J?ptX:S?1212:1000,J?222:oy+(S?31:36),T.pOut+' bar')}${J?'':dTag('rv',1300,oy+90,'RV1 open',5)}
 ${sens}${wOutV}${hot}
 ${vS('wOn',270,WY,'Water in',{t:'hand',lx:270,ly:WY+42})}${stbox('wstr',360,WY,'Water strainer')}${tn(360,WY+42,'middle','Strainer')}${tn(198,WY+6,'end','Fresh water')}${dTag('Pw',450,WY-50,'Water bar',3)}
 ${solS('seal','seal',WC.seal,SY,T.seal,{sd:1})}${solS('open','open',WC.open,SY,T.open,{sd:1})}${solS('close','close',WC.close,SY,T.close,{sd:1})}${H?solS('sv9','sv9',WC.par,SY,'SV9',{sd:1}):''}${tn(522,WY+38,'start',J?(H?'Quadruple solenoid valve unit':'Triple solenoid valve unit'):'Solenoid valve block, water')}
 
 
 
 
 ${P&&!F?`<path d="M904 840H926M908 846H922M912 852H918" stroke="#1b2321" stroke-width="2.5"/>${tn(962,790,'start','377')}${tn(962,816,'start','Overflow')}`:''}
 ${F?tn(q.s206[0]-14,30,'end','C1 conditioning')+tn(910,84,'start','Oil in')+tn(q.cl[0]+10,q.cl[1]+30,'start','Clean oil')+tn(q.opn[0]-14,q.opn[1]-12,'end','C2 opening')+tn(q.cls[0]+12,q.cls[1]+26,'start','C3 closing')+tn(q.slg[0]+14,q.slg[1]-12,'start','Water and sludge'):''}${P&&!F?tn(q.opn[0]-20,q.opn[1]-10,'end','372')+tn(q.t373[0]+16,q.t373[1]-16,'start','373')+tn(q.s206[0]-12,44,'end','206')+tn(824,84,'start','201')+tn(q.cl[0]+10,q.cl[1]+30,'start','220')+tn(q.slg[0]+14,q.slg[1]-12,'start','221/222'):''}
 ${pumpV('slp','slpC',1148,1040,22,'Sludge pump','d')}${tn(1262,1046,'start','To waste oil')}${vS('slv',1100,820,'Sludge',{v:1,t:'hand',lx:1124,ly:812,an:'start'})}${tn(1124,838,'start','valve')}
 ${snS(1160,884,'LS',20)}
 </svg>`;bindMimic();}
function renderSep(){paintBowl('m');}
