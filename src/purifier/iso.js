/* --- isometric system view (pilot, every unit): the plant drawn at 30 degrees like a maker's system drawing. Pipes are shaded tubes run along
   the three axes, equipment are lit boxes and cylinders. It reuses every live id of the flat mimic (pipes c_/f_, valves v_, solenoid lamps,
   pumps, heater, tank levels, the bowl inset), so renderMimic and the valve pop-ups work unchanged. Plan units: x runs down-right on screen,
   y down-left, z up. --- */
const ISOV={p605:1,p626:1,s826:1,sj30g:1,sj30gh:1};
/* flat (2D) is the default; the 3D button switches and is remembered */
const isoOn=()=>{try{return localStorage.getItem('pur.iso')==='1';}catch(e){return false;}};
const IOX=960,IOY=760;
const P3=(x,y,z)=>[Math.round((IOX+(x-y)*.866)*10)/10,Math.round((IOY+(x+y)*.5-(z||0))*10)/10];
const ipath=pts=>'M'+pts.map(p=>P3(...p).join(' ')).join('L');
/* faces of a box lit from the upper left: top light, x face (down-right) mid, y face (down-left) dark */
function ibox(x,y,z,w,d,h,c,id){const f=(...q)=>q.map(p=>P3(...p).join(',')).join(' ');c=c||['#e9edf0','#b8c2c9','#96a2ab'];
  return `<g style="${X3SH}"><polygon points="${f([x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h])}" fill="${c[2]}" stroke="#2b3436" stroke-width="1"/>
  <polygon ${id?`id="${id}" `:''}points="${f([x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h])}" fill="${c[1]}" stroke="#2b3436" stroke-width="1"/>
  <polygon points="${f([x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h])}" fill="${c[0]}" stroke="#2b3436" stroke-width="1"/></g>`;}
/* upright cylinder: body with a side sheen, top ellipse; returns the outline too (for clipping liquid) */
function icylPath(cx,cy,z0,z1,r){const[a,b]=P3(cx,cy,z0),[c,d]=P3(cx,cy,z1),rx=r*1.2247,ry=r*.7071;return `M${c-rx} ${d}L${a-rx} ${b}A${rx} ${ry} 0 0 0 ${a+rx} ${b}L${c+rx} ${d}A${rx} ${ry} 0 0 0 ${c-rx} ${d}Z`;}
function icyl(cx,cy,z0,z1,r,fill,top){const[c,d]=P3(cx,cy,z1),rx=r*1.2247,ry=r*.7071;
  return `<g style="${X3SH}"><path d="${icylPath(cx,cy,z0,z1,r)}" fill="${fill||'url(#x3SteelV)'}" stroke="#2b3436" stroke-width="1.2"/><path d="${icylPath(cx,cy,z0,z1,r)}" fill="url(#x3HiV)" pointer-events="none"/><ellipse cx="${c}" cy="${d}" rx="${rx}" ry="${ry}" fill="${top||'url(#x3Steel)'}" stroke="#2b3436" stroke-width="1.2"/></g>`;}
/* valve on an axis: body turned along the pipe, label kept upright */
const IANG={x:30,y:150,z:90};
function iv(k,p,ax,l,o){o=o||{};const[x,y]=P3(...p),a=IANG[ax],key=!o.nokey;
  return `<g class="vlv"${key?` data-k="${k}" tabindex="0" role="button" aria-label="${l||k}"`:''}><rect x="${x-18}" y="${y-18}" width="36" height="36" fill="transparent"/><g transform="rotate(${ax==='y'?-30:a===90?90:30} ${x} ${y})">${x3Valve(x,y,11,7.5,'v_'+k,'#111',o.t||'hand',1.4)}</g>${l?`<text x="${x+(o.dx??0)}" y="${y+(o.dy??-20)}" text-anchor="${o.an||'middle'}" class="vl">${l}</text>`:''}</g>`;}
/* tube pipes: dark wall, body, top highlight; live colour and flow layers keep the c_/f_ ids */
function itube(d,w){return `<path d="${d}" fill="none" stroke="#2b3436" stroke-width="${w+3}" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#cfd6db" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="${Math.max(1.5,w*.28)}" stroke-linejoin="round" transform="translate(0 -${w*.22})"/>`;}
function isoPipes(){return PIPES.map(([id,c,d])=>{const a=id[0]==='a';return a?`<path d="${d}" fill="none" stroke="#1b2321" stroke-width="2" stroke-dasharray="9 5"/>`:itube(d,8);}).join('')+
  PIPES.map(([id,c,d])=>{const a=id[0]==='a';return `<path id="c_${id}" d="${d}" fill="none" stroke="${c}" stroke-width="${a?3:6.5}" stroke-linejoin="round" stroke-linecap="round" style="display:none"/><path id="f_${id}" d="${d}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="${a?1.4:2.4}" class="flowl" style="display:none"/>`;}).join('');}

function buildIso(){const T=M.tag,C=BOWLS[M.id],tn=(x,y,a,t)=>`<text x="${x}" y="${y}" text-anchor="${a||'start'}" class="vl">${t}</text>`,at=(p,dx,dy,a,t)=>{const[x,y]=P3(...p);return tn(x+dx,y+dy,a,t);};
 const S=M.id==='s826',Fx=M.id==='p626',P=M.id==='p605'||Fx,J=!isA(),H=!!M.hid,A=isA();
 const act=Object.fromEntries(PIPES.map(p=>[p[0],p[3]])),col=Object.fromEntries(PIPES.map(p=>[p[0],p[1]]));
 /* plan positions */
 const ST=[-780,110],SV=[430,-80],SL=[230,330],HX=[-330,380];
 const pipe=(id,pts)=>act[id]?[id,col[id],ipath(pts),act[id]]:null;
 const L=[
  pipe('p1',[[-710,110,30],[-560,110,30],[-560,170,30]]),
  pipe('p1m',[[-560,170,30],[-560,380,30],[-520,380,30]]),
  pipe('p1b',[[-560,170,30],[-700,170,30],[-700,380,30],[-520,380,30]]),
  pipe('p2',[[-480,380,30],[-420,380,30],[-420,380,80],[-390,380,80]]),
  pipe('p3',[[-270,380,110],[-230,380,110],[-230,380,560],[-230,0,560]]),
  pipe('feed',[[-230,0,560],[-16,0,560]]),
  pipe('rec',[[-230,0,560],[-230,-60,560],[-230,-60,290],[-780,-60,290],[-780,90,290],[-780,90,250]]),
  pipe('clean',[[16,0,520],[430,0,520],[430,-80,520],[430,-80,250]]),
  pipe('slg',[[110,40,60],[230,40,60],[230,260,60]]),
  pipe('slo',[[300,330,20],[460,330,20]]),
  pipe('stm',[[-330,560,90],[-330,410,90]]),pipe('con',[[-300,410,40],[-300,560,40]]),
  pipe('wsi',[[-940,-315,70],[-860,-315,70]]),pipe('ws',[[-860,-315,70],[-640,-315,70]]),
  pipe('wh1',[[-600,-300,170],[-600,-150,170],[-120,-150,170],[-120,-150,560],[-120,0,560]]),
  pipe('wh2',[[-540,-300,110],[-540,-60,110],[-110,-60,110]]),
  pipe('wh3',[[-480,-300,60],[-480,-90,60],[-110,-90,60]]),
  pipe('fw',[[-120,0,560],[-16,0,560]]),
  pipe('wh9',[[-430,-300,140],[-430,-100,140],[-110,-100,140]]),
  pipe('circ',[[16,-30,480],[120,-30,480],[120,-30,520]]),
  pipe('wout',[[16,20,470],[230,20,470],[230,20,60],[230,40,60]]),
  pipe('ovf',[[110,-70,40],[200,-70,40],[200,-70,10]]),
  pipe('a5',[[155,-570,290],[155,-570,360],[155,20,360],[190,20,360],[190,20,450]]),
  A?pipe('a0',[[-80,-585,250],[60,-585,250]]):pipe('a0',[[-520,-40,420],[-320,-40,420]]),
  A?pipe('a1',[[100,-570,290],[100,-570,330],[100,-200,330],[-230,-200,330],[-230,-40,330],[-230,-40,540]]):pipe('a1',[[-280,-40,420],[-230,-40,420],[-230,-40,540]]),
  pipe('a4',[[220,-570,290],[220,-570,330],[220,-300,330],[430,-300,330],[430,-300,560],[430,-40,560],[430,-40,540]])].filter(Boolean);
 PIPES=L;
 /* tanks: liquid clipped to the cylinder outline */
 const tankI=(cid,c,r,h,idL,col2,lab,ids)=>{const d=icylPath(c[0],c[1],0,h,r),[,yt]=P3(c[0],c[1],h),[,yb]=P3(c[0],c[1],0);
   return [`${icyl(c[0],c[1],0,h,r,'url(#mBody)')}${tank(cid,d,idL,col2)}<path d="${d}" fill="url(#x3HiV)" pointer-events="none"/><path d="${d}" fill="none" stroke="#1b2321" stroke-width="2"/>`,[yt,yb+r*.7071-yt]];};
 const [tS,gS]=tankI('cL',ST,70,250,'tkOil','#6b421b'),[tD,gD]=tankI('cD',SV,70,250,'tkSvc','#c98a2c'),[tL,gL]=tankI('cS',SL,70,120,'slTk',C_.slg);
 const[stx,sty]=P3(...ST,0);GEO={L:gS,D:gD,Sl:gL,W:sty+40};
 const[px,py]=P3(0,0,300),bw=150,bh=bw*C.vb[3]/C.vb[2];
 const[hx,hy]=P3(HX[0]+60,HX[1],75),BC=J?['#b7cfbe','#86a592','#6a8877']:['#5b8fd6','#2f64ad','#1f4a85'];
 $('mimic').innerHTML=`<svg viewBox="0 0 1800 1180" class="dg iso" role="img" aria-label="Isometric fuel oil separation system of the ${M.name}"><defs>
 <linearGradient id="mBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#eef1f0"/><stop offset="1" stop-color="#d7dcd9"/></linearGradient>
 <linearGradient id="mLiqSheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".18" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
 <radialGradient id="mDome" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d2d8d5"/></radialGradient>
 <linearGradient id="isoBlue" x1="0" y1="0" x2="1" y2="0">${(J?['#5f7d6a','#a9c4b1','#4f6a59']:['#1d4f9a','#4a86d0','#163f7c']).map((c,i)=>`<stop offset="${[0,.45,1][i]}" stop-color="${c}"/>`).join('')}</linearGradient>
 ${x3Defs()}</defs><rect x="0" y="0" width="1800" height="1180" fill="#fff"/>
 <path d="${ipath([[-1000,-700,0],[640,-700,0],[640,640,0],[-1000,640,0]])}Z" fill="#f2f4f3" stroke="#dfe3e1"/>
 ${tS}${tL}
 ${ibox(-640,-330,40,200,30,130,['#e9edf0','#c9d0d5','#aeb7bd'])}${at([-640,-300,40],-8,22,'end',J?(H?'Quadruple solenoid valve unit':'Triple solenoid valve unit'):'Water valve block')}
 ${A?ibox(60,-600,200,220,30,90,['#e9edf0','#c9d0d5','#aeb7bd'])+at([170,-585,290],0,-6,'middle','Air valve block'):''}
 ${isoPipes()}
 <!-- separator: frame, motor, bowl casing with a cutaway window, cover and inlet / outlet stack -->
 ${ibox(-110,-110,0,220,220,160,BC)}
 ${ibox(-60,110,30,120,150,110,BC)}${J?(()=>{const[x,y]=P3(0,260,85);return `<circle id="mMot" cx="${x+20}" cy="${y}" r="9" fill="none" stroke="#1b2321" stroke-width="2"/>`+tn(x+34,y+5,'start','Motor');})():''}${ibox(-50,260,45,100,14,80,['#9aa4ab','#6d777e','#59636a'])}
 ${icyl(0,0,160,420,108,'url(#isoBlue)','#e6ebee')}${icyl(0,0,420,455,62,'url(#x3SteelV)')}${icyl(0,0,455,600,15,'url(#x3SteelV)')}
 <g><rect x="${px-bw/2-6}" y="${py-bh/2-6}" width="${bw+12}" height="${bh+12}" rx="8" fill="#14202a" stroke="#c9d1d6" stroke-width="2"/>
 <svg x="${px-bw/2}" y="${py-bh/2}" width="${bw}" height="${bh}" viewBox="${C.vb.join(' ')}">${bowlSvg('m',C)}</svg></g>
 ${at([0,0,600],18,-16,'start',P&&!Fx?'201 oil in · 220 clean oil · 206 seal':Fx?'Oil in · clean oil · C1 conditioning':S?'Oil in · clean oil · water out':'Oil in · clean oil')}
 ${tn(px,py+bh/2+26,'middle',M.name)}<text id="m_bowl" x="${px}" y="${py+bh/2+48}" text-anchor="middle" class="vl"></text>
 <!-- feed train: suction valve, change-over, main and bypass strainers with their valves, pump, relief -->
 ${iv('suc',[-650,110,30],'x',T.suc||'Suction',{dy:-20})}
 <g class="vlv" data-k="chg" tabindex="0" role="button" aria-label="Strainer change-over valve">${(()=>{const[x,y]=P3(-560,170,30);return `<circle cx="${x}" cy="${y}" r="13" fill="url(#x3Steel)" stroke="#1b2321" stroke-width="2"/><path id="chgH" d="M${x} ${y}V${y-12}" stroke="#c4211f" stroke-width="5" stroke-linecap="round"/>`;})()}</g>${at([-560,170,30],18,-6,'start','Change-over')}
 ${iv('smi',[-560,220,30],'y','',{nokey:1})}${(()=>{const[x,y]=P3(-560,275,30);return stbox('str',x,y,'Main suction strainer');})()}${iv('smo',[-560,330,30],'y','',{nokey:1})}${at([-560,275,30],24,4,'start','Main')}
 ${iv('sbi',[-700,220,30],'y','',{nokey:1})}${(()=>{const[x,y]=P3(-700,275,30);return stbox('strb',x,y,'Bypass suction strainer');})()}${iv('sbo',[-700,330,30],'y','',{nokey:1})}${at([-700,275,30],-14,28,'end','Bypass')}
 ${(()=>{const[x,y]=P3(-500,380,30);return pumpV('pump','pumpC',x,y,20,'Feed pump','d');})()}${at([-500,380,30],-26,26,'end','Feed pump')}
 ${(()=>{const[x,y]=P3(-455,380,30);return relief(x+10,y-34);})()}${at([-455,380,30],-4,-50,'end','Relief')}
 <!-- heater: plate pack with steam in and condensate out, frame and tie bars -->
 ${ibox(HX[0]-60,HX[1]-30,0,120,60,150,['#eceff1','#c9d0d5','#aeb7bd'])}
 <polygon id="htr" points="${[[HX[0]+60,HX[1]-24,12],[HX[0]+60,HX[1]+24,12],[HX[0]+60,HX[1]+24,138],[HX[0]+60,HX[1]-24,138]].map(p=>P3(...p).join(',')).join(' ')}" fill="#f5d9c8" stroke="#1b2321" stroke-width="1.5"/>
 ${[-16,-8,0,8,16].map(dy=>`<path d="${ipath([[HX[0]+61,HX[1]+dy,16],[HX[0]+61,HX[1]+dy,134]])}" stroke="#c98a6a" stroke-width="2"/>`).join('')}
 ${hsT('heater',hx-30,hy-50,60,100,'Heater')}${at([HX[0]+60,HX[1],150],20,-6,'start','Heater')}
 ${iv('stm',[-330,500,90],'y','Steam in',{dx:-24,an:'end',dy:4})}${(()=>{const[x,y]=P3(-300,500,40);return trap(x,y);})()}${at([-300,500,40],-18,24,'end','Trap')}
 <!-- feed riser: TT, PT, flow valve, three-way valve, recirculation -->
 ${(()=>{const[x,y]=P3(-230,380,200);return snS(x+44,y,'TT',20)+`<path d="M${x+22} ${y}H${x+6}" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>`;})()}${(()=>{const[x,y]=P3(-230,380,200);return dTag('T',x+120,y-15,T.tt+' °C');})()}
 ${(()=>{const[x,y]=P3(-230,200,560);return snS(x,y-44,T.pIn,22)+`<path d="M${x} ${y}V${y-22}" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>`+dTag('Pin',x-75,y-40,T.pIn+' bar');})()}
 ${iv('flow',[-230,380,330],'z',T.flow,{t:'flow',dx:26,an:'start',dy:4})}${(()=>{const[x,y]=P3(-230,380,330);return dTag('Q',x+110,y-15,'Flow L/h');})()}
 <g class="vlv" data-k="v1" tabindex="0" role="button" aria-label="Three way valve">${(()=>{const[x,y]=P3(-230,0,560);return `<rect x="${x-22}" y="${y-22}" width="44" height="44" fill="transparent"/><g transform="rotate(-30 ${x} ${y})">${x3Valve3(x,y,16,10,'v_v1L','v_v1R','#fff','#111','dome')}</g>`;})()}</g>${at([-230,0,560],-30,-8,'end',T.feed+' 3-way')}<text id="m_v1" ${(()=>{const[x,y]=P3(-230,0,560);return `x="${x-30}" y="${y+12}"`;})()} text-anchor="end" class="vl"></text>
 ${iv('ret',[-520,-60,290],'x','Recirc',{dy:30})}
 <!-- clean oil: PT4, RV1, V4 to the service tank -->
 ${(()=>{const[x,y]=P3(150,0,520);return snS(x,y-44,T.pOut,26)+`<path d="M${x} ${y}V${y-30}" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>`+dTag('Pout',x,y-110,T.pOut+' bar');})()}
 ${A?iv('back',[260,0,520],'x',T.back,{t:'press',dy:-28})+(()=>{const[x,y]=P3(260,0,520);return dTag('rv',x+70,y+10,'RV1 open',5);})()+iv('out',[430,-40,520],'y','V4',{t:'dome',dx:22,an:'start',dy:-10})
 :iv('back',[240,0,520],'x',T.back+' (13)',{t:'press',dy:-28})+iv('out',[360,0,520],'x',T.out||'V10',{dy:-28})}
 ${S?iv('drain',[190,20,470],'x','V5',{t:'dome',dy:30})+(()=>{const[x,y]=P3(100,20,470);return snS(x,y-44,'PT5',22)+`<path d="M${x} ${y}V${y-22}" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>`+dTag('Pwo',x-90,y-60,'PT5 bar',4);})()+(()=>{const[x,y]=P3(70,0,520);return snS(x,y-44,'MT',22)+`<path d="M${x} ${y}V${y-22}" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>`+dTag('mt',x-90,y-60,'Water %',4);})():''}
 ${H?iv('v12',[120,-30,500],'z','V12',{t:'flow',dx:-22,an:'end',dy:4})+(()=>{const[x,y]=P3(60,-30,480);return snS(x,y+44,'WD',22)+`<path d="M${x} ${y}V${y+22}" stroke="#1b2321" stroke-width="1.5" stroke-dasharray="4 3"/>`+dTag('Pwd',x+92,y+35,'Circ. MPa',5);})():''}
 ${tD}${at([...SV,0],0,40,'middle','Daily service tank')}<text id="m_lvD" ${(()=>{const[x,y]=P3(...SV,170);return `x="${x}" y="${y}"`;})()} text-anchor="middle" class="tkv"></text><text id="m_svc" ${(()=>{const[x,y]=P3(...SV,130);return `x="${x}" y="${y}"`;})()} text-anchor="middle" class="tkv"></text>
 <!-- settling tank texts and the free water at its bottom -->
 ${at([...ST,0],0,40,'middle','Settling tank')}<text id="m_tt" ${(()=>{const[x,y]=P3(...ST,210);return `x="${x}" y="${y}"`;})()} text-anchor="middle" class="tkv"></text><text id="m_lvS" ${(()=>{const[x,y]=P3(...ST,170);return `x="${x}" y="${y}"`;})()} text-anchor="middle" class="tkv"></text><text id="m_xfer" ${(()=>{const[x,y]=P3(...ST,130);return `x="${x}" y="${y}"`;})()} text-anchor="middle" class="tkv"></text>
 <rect id="tkW" x="${stx-60}" y="${GEO.W}" width="120" height="0" fill="#1f6db5"/>
 <!-- sludge: valve, tank, pump to waste -->
 ${iv('slv',[230,140,60],'y','Sludge valve',{dx:22,an:'start',dy:4})}
 ${tL}${at([...SL,0],0,40,'middle','Sludge tank')}<text id="m_sl" ${(()=>{const[x,y]=P3(...SL,70);return `x="${x}" y="${y}"`;})()} text-anchor="middle" class="tkv"></text>
 ${(()=>{const[x,y]=P3(370,330,20);return pumpV('slp','slpC',x,y,16,'Sludge pump','d');})()}${at([460,330,20],14,4,'start','To waste oil')}
 ${at([110,40,60],14,-8,'start',P&&!Fx?'221/222 water and sludge':'Water and sludge')}${P&&!Fx?at([200,-70,10],12,14,'start','377 overflow'):''}
 <!-- water: fresh water in, strainer, solenoids 206 / 372 / 373 -->
 ${iv('wOn',[-900,-315,70],'x','Water in',{dy:-22})}${(()=>{const[x,y]=P3(-780,-315,70);return stbox('wstr',x,y,'Water strainer');})()}${(()=>{const[x,y]=P3(-560,-310,40);return dTag('Pw',x-40,y+30,'Water bar',3);})()}
 ${(()=>{const[x,y]=P3(-600,-315,100);return solS('seal','seal',x,y,T.seal,{sd:1});})()}${(()=>{const[x,y]=P3(-540,-315,100);return solS('open','open',x,y,T.open,{sd:1});})()}${(()=>{const[x,y]=P3(-480,-315,100);return solS('close','close',x,y,T.close,{sd:1});})()}${H?(()=>{const[x,y]=P3(-450,-315,150);return solS('sv9','sv9',x+30,y-10,'SV9',{sd:1});})():''}
 <!-- air: supply valve, block with SV1 and SV4, gauge -->
 ${A?iv('aOn',[-20,-585,250],'x','Air in',{dy:-22})+(()=>{const[x,y]=P3(100,-585,250);return solS('feedS','feed',x,y,T.airFeed,{nokey:1,sd:1});})()+(S?(()=>{const[x,y]=P3(155,-585,250);return solS('drainS','drainS',x,y,'SV5',{nokey:1,sd:1});})():'')+(()=>{const[x,y]=P3(220,-585,250);return solS('outS','outS',x,y,'SV4',{nokey:1,sd:1});})()+(()=>{const[x,y]=P3(280,-585,250);return dTag('Pa',x-20,y+70,'Air bar',3);})()
 :iv('aOn',[-420,-40,420],'x','Air in',{dy:28})+(()=>{const[x,y]=P3(-300,-40,420);return solS('feedS','feed',x,y,T.airFeed,{nokey:1,sd:1});})()+(()=>{const[x,y]=P3(-420,-40,420);return dTag('Pa',x-80,y-30,'Air bar',3);})()}
 </svg>`;
 bindMimic();
}
/* the view switch floats on the drawing's top right corner, so it shows on the phone too (the panel header is hidden there) */
function isoSwitch(){const w=$('mimicWrap')||($('mimic')&&$('mimic').parentElement);if(!w)return;let b=$('isoBtn');
 if(!b){b=document.createElement('button');b.id='isoBtn';b.className='sbtn';b.style.cssText='position:absolute;top:6px;right:6px;z-index:3;font-size:13px;font-weight:700;padding:5px 12px;background:#14202a;color:#fff;border:1px solid #fff;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.35)';w.appendChild(b);b.onclick=e=>{e.stopPropagation();try{localStorage.setItem('pur.iso',isoOn()?'0':'1');}catch(x){}buildMimic();};}
 b.hidden=!ISOV[M.id];b.textContent=isoOn()?'2D':'3D';b.title=isoOn()?'Switch to the 2D diagram':'Switch to the 3D isometric view';b.setAttribute('aria-pressed',isoOn());isoPlace();setTimeout(isoPlace,300);}
/* desktop workspace: the Show / Hide Control & Gauge button holds that corner, so sit just left of it */
function isoPlace(){const b=$('isoBtn'),cg=$('wsCG');if(!b||!cg)return;if(b.parentElement!==cg.parentElement)cg.parentElement.appendChild(b);b.style.top='12px';b.style.right=(cg.offsetWidth+22)+'px';
 if(!b._ro&&window.ResizeObserver){b._ro=new ResizeObserver(isoPlace);b._ro.observe(cg);}}
addEventListener('load',()=>setTimeout(isoPlace,0));
