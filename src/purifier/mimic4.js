/* --- system mimics redrawn on one grid around your unit images. Pipes end at the image's own connections, found by image pixel through pt().
   Symbols: gate bowtie, adjustable valve with arrow, actuated valve with dome, solenoid with its rotating indicator, check, relief, strainer, trap, ISA bubbles.
   Layer order: pipes, flows, machine, valves and instruments, labels. --- */
const pBase=[];
function dgPipes(){const al=[...PIPES.map(p=>[p[0],p[2]]),...pBase.map((d,i)=>['b'+i,d])],base=al.map(([id,d])=>{const a=id[0]==='a';return `<path d="${d}" fill="none" stroke="#1b2321" stroke-width="${a?2:9}" stroke-linejoin="miter" ${a?'stroke-dasharray="9 5"':''}/>${a?'':`<path d="${d}" fill="none" stroke="#f4f5f1" stroke-width="5.6" stroke-linejoin="miter"/>`}`;}).join('');
 return base+PIPES.map(([id,c,d])=>{const a=id[0]==='a';return `<path id="c_${id}" d="${d}" fill="none" stroke="${c}" stroke-width="${a?3:5.6}" stroke-linejoin="miter" style="display:none"/><path id="f_${id}" d="${d}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="${a?1.4:2.4}" class="flowl" style="display:none"/>`;}).join('');}
const chk=(x,y,v)=>{const r=v?` transform="rotate(90 ${x} ${y})"`:'';return `<g${r}><path d="M${x-12} ${y-12}V${y+12}L${x+10} ${y}Z" fill="#fff" stroke="#1b2321" stroke-width="2.5"/><path d="M${x+11} ${y-13}V${y+13}" stroke="#1b2321" stroke-width="3.5"/></g>`;};
const stbox=(k,x,y,l)=>`<g class="vlv" data-k="${k}" tabindex="0" role="button" aria-label="${l}"><rect id="b_${k}" x="${x-17}" y="${y-17}" width="34" height="34" fill="#fff" stroke="#1b2321" stroke-width="2.5"/><path d="M${x-13} ${y-13}L${x+13} ${y+13}" stroke="#1b2321" stroke-width="2.5" stroke-dasharray="5 3"/></g>`;
const tankD=(cid,poly,idL,col)=>`<path d="${poly}" fill="#fff" stroke="#1b2321" stroke-width="3"/>${tank(cid,poly,idL,col)}<path d="${poly}" fill="none" stroke="#1b2321" stroke-width="3"/>`;
function pumpV(k,id,x,y,r,l){return `<g class="pmp" data-k="${k}" tabindex="0" role="button" aria-label="${l}"><circle id="${id}" cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#1b2321" stroke-width="3"/><path d="M${x-r*.55} ${y+r*.45}L${x} ${y-r*.7}L${x+r*.55} ${y+r*.45}Z" fill="#1b2321"/></g>`;}
const relief=(x,y)=>`<path d="M${x-13} ${y-9}V${y+9}L${x} ${y}ZM${x-9} ${y-13}H${x+9}L${x} ${y}Z" fill="#fff" stroke="#1b2321" stroke-width="2.2"/><path d="M${x} ${y-13}l-6 -4l12 -5l-12 -5l12 -5" fill="none" stroke="#1b2321" stroke-width="1.8"/>`;
const trap=(x,y)=>`<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="#1b2321" stroke-width="2.5"/><path d="M${x-8} ${y-7}H${x+8}M${x} ${y-7}V${y+9}" stroke="#1b2321" stroke-width="2.5"/>`;
const NEST={s826:{k:.55,ox:381,oy:119},p605:{k:.56,ox:446,oy:36},sj30g:{k:.56,ox:402,oy:83},sj30gh:{k:.56,ox:402,oy:83}};
function buildMimic4(){const T=M.tag,C=BOWLS[M.id],N=NEST[M.id],S=M.id==='s826',P=M.id==='p605',J=!isA(),H=!!M.hid,pt=(x,y)=>[Math.round(N.ox+N.k*x),Math.round(N.oy+N.k*y)],wAct=()=>u.wOn&&(s.sv.seal||s.sv.open||s.sv.close);
 /* AL 1810571 air valve block, S and P solenoid valve block for water, MKK Fig. 3-32 and 3-33 solenoid valve unit. Columns are chosen so the lines leave without crossing. */
 const WC=J?(H?{seal:540,par:645,open:750,close:855}:{seal:540,open:665,close:790}):S?{seal:540,close:665,open:790}:{seal:540,open:665,close:790},WR=Math.max(...Object.values(WC)),AC=S?{feed:350,drain:475,out:600}:{feed:350,out:475},AR=Math.max(...Object.values(AC)),top=J?-12:-84,ah=-72,sv=Object.values(AC);
 const q=S?{feed:pt(826,51),cl:pt(826,144),wat:pt(826,228),cls:pt(327,1060),opn:pt(908,1040),slg:pt(1170,838)}:P?{feed:pt(563,88),cl:pt(563,160),wat:pt(572,240),s206:pt(483,75),opn:pt(78,1006),t373:pt(790,1232),t377:pt(790,1272),slg:pt(886,640)}:{feed:pt(567,30),cl:pt(617,100),wat:pt(646,150),cls:pt(742,1225),opn:pt(395,1228),slg:pt(1080,808)};
 GEO={L:[800,180],D:[800,180],Sl:[860,120],W:980};pBase.length=0;
 const FD=S?`M284 90H900V${q.feed[1]}H${q.feed[0]}`:P?`M284 90H390V46H810V${q.feed[1]}H${q.feed[0]}`:`M284 90H${q.feed[0]}V${q.feed[1]}`,sealIn=S||J,oy=J?120:q.cl[1],CLd=`M${q.cl[0]} ${J?q.cl[1]+'V120':q.cl[1]}H1320V800`;
 PIPES=[['p1',C_.oil,'M190 950H260',()=>s.Q>0],['p1m',C_.oil,'M260 950V836',()=>s.Q>0&&!u.strB],['p1b',C_.oil,'M260 950H335V860H260',()=>s.Q>0&&u.strB],['p2',C_.oil,'M260 784V640',()=>s.Q>0],['p3',C_.oil,'M260 540V114',()=>s.Q>0],['feed',C_.oil,FD,()=>s.toBowl>0],['rec',C_.oil,'M236 90H100V800',()=>s.Q>0&&!s.toBowl],['clean',C_.cln,CLd,()=>s.Qo>0],
  ['slo',C_.slg,'M1100 980V1040H1124M1172 1040H1250',()=>s.slp&&s.sludgeL>0],
  ['wsi',C_.wat,'M205 1030H270',()=>wAct()],['ws',C_.wat,`M270 1030H512V985H${WR}`,()=>wAct()],
  ['stm',C_.stm,'M120 565H225',()=>s.duty>0],['con',C_.stm,'M225 619H120',()=>s.duty>0],
  ['a0',C_.air,isA()?`M40 22H130V${ah}H${AR}${sv.map(x=>`M${x} ${ah}V-30`).join('')}`:'M40 22H260',()=>u.aOn],['a1',C_.air,isA()?'M350 8V26H260V66':'M260 22V66',()=>u.aOn&&s.sv.feed]];
 if(isA())PIPES.push(['a4',C_.air,`M${AC.out} 8V26H1270V${oy-24}`,()=>u.aOn&&u.out]);
 if(sealIn)PIPES.push(['wh1',C_.wat,`M${WC.seal} 985V870H400V90`,()=>s.sv.seal],['fw',C_.wat,S?`M400 90H900V${q.feed[1]}H${q.feed[0]}`:`M400 90H${q.feed[0]}V${q.feed[1]}`,()=>s.sv.seal]);
 else PIPES.push(['wh1',C_.wat,`M${WC.seal} 985V870H400V62H${q.s206[0]}V${q.s206[1]}`,()=>s.sv.seal]);
 if(S)PIPES.push(['wout',C_.wat,`M${q.wat[0]} ${q.wat[1]}H1100V${q.slg[1]}`,()=>s.sv.drain],['a5',C_.air,`M${AC.drain} 8V44H1060V220`,()=>u.aOn&&s.sv.drain],['slg',C_.slg,`M${q.slg[0]} ${q.slg[1]}H1100V860`,()=>s.dipT>0||s.sv.drain],['wh2',C_.wat,`M${WC.open} 985V896H${q.opn[0]}V${q.opn[1]}`,()=>s.sv.open],['wh3',C_.wat,`M${WC.close} 985V${q.cls[1]}H${q.cls[0]}`,()=>s.sv.close]);
 if(P)PIPES.push(['slg',C_.slg,`M${q.slg[0]} ${q.slg[1]}H1100V860`,()=>s.dipT>0||(s.closed&&s.Vw>.01&&(s.toBowl>0||s.sv.seal))],['wh2',C_.wat,`M${WC.open} 985V896H470V${q.opn[1]}H${q.opn[0]}`,()=>s.sv.open],['wh3',C_.wat,`M${WC.close} 985V896H950V${q.t373[1]}H${q.t373[0]}`,()=>s.sv.close],['ovf',C_.wat,`M${q.t377[0]} ${q.t377[1]}H915V840`,()=>s.sv.close&&s.c>.95]);
 if(J){PIPES.push(['slg',C_.slg,`M${q.slg[0]} ${q.slg[1]}H1100V860`,()=>s.dipT>0],['wh2',C_.wat,`M${WC.open} 985V896H${q.opn[0]}V${q.opn[1]}`,()=>s.sv.open],['wh3',C_.wat,`M${WC.close} 985V896H${q.cls[0]}V${q.cls[1]}`,()=>s.sv.close]);
  if(H)PIPES.push(['wh9',C_.wat,`M${WC.par} 985V800H${q.opn[0]}`,()=>s.sv.par],['circ',C_.cln,`M${q.wat[0]} ${q.wat[1]}V146H1000V120`,()=>s.Qo>0&&u.v12]);
  else PIPES.push(['wout',C_.wat,`M${q.wat[0]} ${q.wat[1]}V146H1100V${q.slg[1]}`,()=>s.closed&&s.Vw>.01&&(s.toBowl>0||s.sv.seal)]);}
 pBase.push('M1100 1000V1020');
 const tn=(x,y,a,t)=>`<text x="${x}" y="${y}" text-anchor="${a||'start'}" class="vl">${t}</text>`,hL=`M${N.ox+C.vb[0]*N.k} ${N.oy+C.vb[1]*N.k}`;
 const tagY=J?168:S?108:88,hot=H?vS('v12',940,146,'V12',{t:'flow',lx:940,ly:192})+snS(850,190,'WD',24)+`<path d="M850 146V175" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>`+dTag('Pwd',855,240,'Circ. MPa',5):'';
 const wOutV=S?vS('drain',1060,q.wat[1],'V5',{t:'dome',lx:1072,ly:q.wat[1]+38,an:'start'})+solS('drainS','drainS',AC.drain,-12,'SV5',{nokey:1,sd:1})+snS(930,q.wat[1]+46,'PT5',26)+`<path d="M930 ${q.wat[1]}V${q.wat[1]+31}" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>`+dTag('Pwo',1000,q.wat[1]+40,'PT5 bar',4):'';
 const sens=S?snS(925,q.cl[1]-40,'MT',22)+`<path d="M925 ${q.cl[1]}V${q.cl[1]-25}" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>`+dTag('mt',985,108,'Water %',4):'';
 const ptX=J?1060:S?1125:995,ptY=J?176:oy-44;
 $('mimic').innerHTML=`<svg viewBox="0 ${top} 1456 ${1090-top}" class="dg" role="img" aria-label="Fuel oil separation system of the ${M.name}"><rect y="${top}" width="1456" height="${1090-top}" fill="#fff"/>
 <rect x="516" y="905" width="${WR+125-516}" height="92" fill="#e4e8e6" stroke="#1b2321" stroke-width="2.5"/>${isA()?`<rect x="320" y="-62" width="${AR+190-320}" height="72" fill="#e4e8e6" stroke="#1b2321" stroke-width="2.5"/>`:''}
 ${J?`<rect x="676" y="${pt(567,1300)[1]-6}" width="88" height="56" fill="#c9ced0" stroke="#1b2321" stroke-width="3"/><circle id="mMot" cx="720" cy="${pt(567,1300)[1]+22}" r="13" fill="none" stroke="#1b2321"/><text x="720" y="${pt(567,1300)[1]+76}" text-anchor="middle" class="vl">Motor</text>`:''}
 <svg x="${N.ox+C.vb[0]*N.k}" y="${N.oy+C.vb[1]*N.k}" width="${C.vb[2]*N.k}" height="${C.vb[3]*N.k}" viewBox="${C.vb.join(' ')}">${bowlSvg('m',C)}</svg>
 ${dgPipes()}
 <rect x="26" y="480" width="364" height="200" fill="none" stroke="#6f7a7c" stroke-width="2" stroke-dasharray="8 8"/>
 ${tankD('cL','M40 800H190V940L140 980H40Z','tkOil','#6b421b')}${tankD('cD','M1250 800H1400V940L1350 980H1250Z','tkSvc','#c98a2c')}${tankD('cS','M1056 860H1190V980H1056Z','slTk','#5a4632')}<rect id="tkW" x="41" y="979" width="98" height="0" fill="#1f6db5"/>
 ${tn(115,1002,'middle','Settling tank')}${tn(1325,1002,'middle','Daily service tank')}${tn(1088,1002,'end','Sludge tank')}${tn(112,474,'start','Heating unit')}
 <text id="m_tt" x="115" y="836" text-anchor="middle" class="tkv"></text><text id="m_lvS" x="115" y="869" text-anchor="middle" class="tkv"></text><text id="m_xfer" x="115" y="902" text-anchor="middle" class="tkv"></text>
 <text id="m_lvD" x="1325" y="836" text-anchor="middle" class="tkv"></text><text id="m_svc" x="1325" y="869" text-anchor="middle" class="tkv"></text><text x="1325" y="898" text-anchor="middle" class="tkv" style="font-size:18px">Al+Si mg/kg</text>
 <text id="m_sl" x="1123" y="930" text-anchor="middle" class="tkv"></text>
 ${tn(720,P?840:J?1044:800,'middle',M.name)}<text id="m_bowl" x="720" y="${P?866:J?1070:826}" text-anchor="middle" class="vl"></text>
 <rect id="htr" x="225" y="540" width="70" height="100" fill="#f5d9c8" stroke="#1b2321" stroke-width="3"/><path d="M225 565L285 578L235 590L285 602L225 619" fill="none" stroke="${C_.stm}" stroke-width="3"/>${hsT('heater',225,540,70,100,'Heater')}${J?tn(305,584,'start','10')+tn(305,612,'start','Heater'):tn(305,596,'start','Heater')}
 ${pumpV('pump','pumpC',260,810,26,'Feed pump')}${tn(296,804,'start',J?'2 Gear':'Feed')}${tn(296,832,'start','pump')}
 ${vS('suc',222,950,J?(T.suc||'V7'):'Suction',{lx:226,ly:990})}${stbox('str',260,892,'Main suction strainer')}${stbox('strb',335,892,'Bypass suction strainer')}${tn(238,900,'end','Main')}${tn(358,900,'start','Bypass')}<g class="vlv" data-k="chg" tabindex="0" role="button" aria-label="Strainer change-over valve"><circle cx="260" cy="950" r="15" fill="#fff" stroke="#1b2321" stroke-width="2.5"/><path id="chgH" d="M260 950V936" stroke="#c4211f" stroke-width="5" stroke-linecap="round"/></g>${tn(282,982,'start','Change-over')}
 ${vS('flow',260,430,J?T.flow+' (12)':T.flow,{v:1,t:'flow',lx:288,ly:436,an:'start'})}
 ${snS(170,750,J?'PI':'PT1',26)}<path d="M196 750H260" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>${snS(170,503,'TT',22)}<path d="M192 503H260" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>
 ${dTag('Pin',330,712,T.pIn+' bar')}${dTag('T',330,516,T.tt+' °C')}${dTag('Q',330,330,'Flow L/h')}
 <path d="M260 846H380V774H260" fill="none" stroke="#1b2321" stroke-width="2"/>${relief(380,812)}${tn(340,764,'middle','Relief')}
 ${vS('stm',170,565,'Steam in',{t:'hand',ly:599})}${trap(170,619)}${tn(170,654,'middle','Trap')}
 ${vS('ret',100,300,'Recirc',{v:1,lx:128,ly:306,an:'start'})}${chk(100,700,1)}
 <g class="vlv" data-k="v1" tabindex="0" role="button" aria-label="Three way valve"><rect x="230" y="60" width="60" height="60" fill="transparent"/><path d="M260 90V68" stroke="#1b2321" stroke-width="2.5"/><path d="M242 68a18 14 0 0 1 36 0Z" fill="#fff" stroke="#1b2321" stroke-width="2.5"/><path id="v_v1" d="M236 76L260 90L236 104ZM284 76L260 90L284 104ZM246 114L260 90L274 114Z" fill="#111" stroke="#1b2321" stroke-width="2.5"/></g>${tn(292,80,'start',T.feed+' 3-way')}<text id="m_v1" x="292" y="${P?118:120}" class="vl"></text>
 ${isA()?solS('feedS','feed',AC.feed,-12,T.airFeed,{nokey:1,sd:1}):solS('feedS','feed',260,44,T.airFeed,{nokey:1,sd:1})}
 ${vS('aOn',90,22,'Air in',{t:'hand',lx:46,ly:58,an:'start'})}${isA()?dTag('Pa',AR+140,-26,'Air bar',3)+tn(AR+200,-8,'start','Air valve block'):dTag('Pa',190,54,'Air bar',3)}
 ${!isA()?'':vS('out',1270,oy,'V4',{t:'dome',ly:oy+34})+solS('outS','outS',AC.out,-12,'SV4',{nokey:1,sd:1})}
 ${J?vS('back',1170,oy,T.back+' (13)',{t:'press',ly:oy+34})+vS('out',1260,oy,T.out||'V10',{t:'hand',ly:oy+34}):vS('back',1200,oy,T.back,{t:'press',ly:oy+34})}
 ${chk(1320,720,1)}${snS(ptX,ptY,T.pOut,28)}<path d="M${ptX} ${oy}V${ptY-(ptY>oy?15:-15)}" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>${dTag('Pout',J?ptX:S?1152:1000,J?222:oy+(S?70:36),T.pOut+' bar')}${J?'':dTag('rv',1240,oy+90,'RV1 open',5)}
 ${sens}${wOutV}${hot}
 ${vS('wOn',270,1030,'Water in',{t:'hand',lx:230,ly:1074})}${stbox('wstr',340,1030,'Water strainer')}${tn(340,1068,'middle','Strainer')}${tn(198,1036,'end','Fresh water')}${dTag('Pw',470,1056,'Water bar',3)}
 ${solS('seal','seal',WC.seal,945,T.seal,{sd:1})}${solS('open','open',WC.open,945,T.open,{sd:1})}${solS('close','close',WC.close,945,T.close,{sd:1})}${H?solS('sv9','sv9',WC.par,945,'SV9',{sd:1}):''}${tn(522,1020,'start',J?(H?'Quadruple solenoid valve unit':'Triple solenoid valve unit'):'Solenoid valve block, water')}
 
 
 
 
 ${P?`<path d="M904 840H926M908 846H922M912 852H918" stroke="#1b2321" stroke-width="2.5"/>${tn(962,790,'start','377')}${tn(962,816,'start','Overflow')}`:''}
 ${P?tn(q.opn[0]+6,q.opn[1]-14,'start','372')+tn(q.t373[0]+16,q.t373[1]-16,'start','373')+tn(q.s206[0]-14,q.s206[1]+20,'end','206')+tn(q.feed[0]+6,q.feed[1]-10,'start','201')+tn(q.cl[0]+6,q.cl[1]-8,'start','220')+tn(q.slg[0]+14,q.slg[1]-12,'start','221/222'):''}
 ${pumpV('slp','slpC',1148,1040,22,'Sludge pump')}${tn(1262,1046,'start','To waste oil')}${vS('slv',1100,820,'Sludge',{v:1,t:'hand',lx:1124,ly:812,an:'start'})}${tn(1124,838,'start','valve')}
 ${snS(1160,884,'LS',20)}
 </svg>`;bindMimic();}
function renderSep(){paintBowl('m');}
