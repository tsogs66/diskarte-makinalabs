/* --- starter panel, valve block, settings --- */
function buildStarter(){const J=M.attached,brk=()=>{if(u.mccb&&s.motor)setMotor(0);u.mccb=u.mccb?0:1;note(u.mccb?(J?'Starter breaker ON.':'Starter main switch ON.'):(J?'Starter breaker OFF.':'Starter main switch OFF.'));};
 const lab=(x,y,t)=>`<text x="${x}" y="${y}" class="pkb">${t}</text>`,cell=(x,l)=>`<rect x="${x}" y="44" width="92" height="112" rx="3" fill="none" stroke="#555a58"/><text x="${x+46}" y="62" text-anchor="middle" class="pkb">${l}</text>`;
 const stack=cell(176,'RUN')+cell(270,'START')+cell(364,'STOP')+PK.lamp('pkRun',222,108,18,'g','Motor running')+PK.push('stOn',316,108,23,'g',()=>setMotor(1),'Start motor')+PK.push('stOff',410,108,23,'r',()=>setMotor(0),'Stop motor');
 const main=PK.door(620,270,'#cfd3cc')+PK.plate(176,12,280,23,J?'OIL PURIFIER · No. 1 STARTER':'SEPARATOR STARTER · '+M.tab,11)+PK.screw(604,16,8)+PK.screw(604,254,8)+PK.amm('amM',24,40,132,M.fla,M.fla*7,'Motor ammeter')+PK.hm('hmM',24,182,132,33)+stack+`<foreignObject x="176" y="164" width="280" height="40"><label xmlns="http://www.w3.org/1999/xhtml" class="brkL"><input type="checkbox" id="brk"/> Brake on</label></foreignObject>`+
 (J?PK.mccb('stBr','brH',490,40,96,190,brk,'Starter breaker')+PK.plate(176,212,280,26,'SAMGONG CO., LTD.',11):PK.plate(476,40,124,19,'MAIN SWITCH',10)+PK.rotary('stBr','mainH',538,110,46,brk,'Starter main switch')+PK.plate(476,164,124,19,'EMERGENCY STOP',10)+PK.mush('eS',538,222,23,eStop,'Emergency stop'));
 const mini=(p,t,In,on,off)=>`<svg viewBox="0 0 360 130" class="pkdoor" role="group" aria-label="${t} starter">${PK.door(360,130,'#cfd3cc')}${PK.amm('am'+p,14,14,102,In,In*6.5,t+' ammeter')}${PK.plate(128,14,218,22,t.toUpperCase(),12)}${lab(150,62,'RUN')}${PK.lamp('pk'+p,162,86,13,'g',t+' running')}${lab(218,62,'START')}${PK.push('on'+p,236,88,17,'g',on,'Start '+t)}${lab(290,62,'STOP')}${PK.push('off'+p,306,88,17,'r',off,'Stop '+t)}</svg>`;
 const acp=`<svg viewBox="0 0 360 172" class="pkdoor" role="group" aria-label="Automatic control panel switches">${PK.door(360,172,'#cfd3cc')}${PK.plate(60,10,240,22,'AUTOMATIC CONTROL PANEL',11.5)}${PK.mush('eS',74,94,24,eStop,"Emergency stop")}${PK.plate(24,142,100,20,"EM'CY STOP",10.5)}${PK.sel('mmF','mmS',186,96,20,()=>{u.mm=u.mm?0:1;if(u.mm)s.lmT=0;},'MM function switch','OFF','ON')}${PK.plate(130,142,110,20,'MM FUNCTION',10.5)}${PK.sel('cSrc','csS',296,96,20,()=>{u.pw=u.pw?0:1;},'Control source','OFF','ON')}${PK.plate(246,142,104,20,'CONT. SOURCE',10.5)}</svg>`;
 $('starter').innerHTML=`<div class="pkunit"><svg viewBox="0 0 620 270" class="pkdoor" role="group" aria-label="Motor starter">${main}</svg>${J?acp:mini('P','Feed pump',4,()=>setPump(1),()=>setPump(0))}${mini('S','Sludge pump',2.4,()=>{s.slp=1;},()=>{s.slp=0;})}</div>`;
 PK.wire($('starter'));$('brk').onchange=e=>{u.brake=e.target.checked?1:0;};}
function renderStarter(){const J=M.attached;{const sf=(k,dirty,use)=>{const e=$('b_'+k);if(e){e.setAttribute('fill',dirty?'#ffd6cf':use?'#d8f3e4':'#fff');e.setAttribute('stroke-width',use?'3.5':'2.5');}};sf('str',f.strainer,!u.strB);sf('strb',f.strainerB,!!u.strB);const c=$('chgH');if(c)c.setAttribute('d',spD(u.strB?'M260 950H274':'M260 950V936'));}if(s.motor&&!u.mccb)u.mccb=1;PK.lit('pkRun',s.motor);PK.set('amM',s.amps,s.motor);PK.txt('hmM',String(8420+Math.floor(s.tRun/3600)).padStart(5,'0'));PK.lit('pkS',s.slp);PK.set('amS',s.slp?1.6:0,s.slp);
 if(J){PK.flip('brH',178,62,u.mccb);PK.turn('mmS',u.mm?40:-40);PK.turn('csS',u.pw?40:-40);}else{PK.turn('mainH',u.mccb?90:0);PK.lit('pkP',s.pump);PK.set('amP',s.pump?2.8:0,s.pump);}}
function buildVB(){const T=M.tag;const r=[['wOn','Operating water',`${M.Pw[0]} to ${M.Pw[1]} bar`],['aOn','Control air',`${M.Pa[0]} to ${M.Pa[1]} bar`]];
 $('vblock').innerHTML=r.map(x=>`<div class="vrow"><span class="nm">${x[1]}<small>${x[2]}</small></span><span class="amm" id="vb_${x[0]}">0</span><button class="tgl" id="tg_${x[0]}" aria-pressed="false">SHUT</button></div>`).join('')+
 [['feed',T.feed,'Change-over valve, by air '+T.airFeed],['seal',T.seal,M.alcap?`Displacement, ${M.Qseal} L/min`:`Seal and displacement, ${M.Qseal} L/min`],['open',T.open,`Opening water, ${M.Qopen} L/min`],['close',T.close,`Closing water, ${M.Qclose} L/min`]].concat(M.alcap?[['drain','V5','Water drain, by air SV5']]:M.hid?[['par','SV9','Partial discharge, 0.6 s']]:[]).map(x=>`<div class="vrow"><span class="nm">${x[1]}<small>${x[2]}</small></span><span class="led" id="vl_${x[0]}" style="color:var(--ink)"></span><button class="tgl" id="mv_${x[0]}" aria-pressed="false" hidden>OFF</button></div>`).join('')+
 `<div class="vrow"><label class="nm"><input type="checkbox" id="manS"> Manual solenoid operation<small>Emergency mode. The sequence stops. You open each valve in order.</small></label></div>`+(M.alcap?`<div class="vrow"><label class="nm"><input type="checkbox" id="pr4"> Alcap in standby, Pr 4<small>Transducer disabled, discharge every 15 min, water leaves only by discharge.</small></label></div>`:'');
 for(const k of ['wOn','aOn'])$('tg_'+k).onclick=()=>{u[k]=u[k]?0:1;};
 for(const k of ['feed','seal','open','close','drain','par']){const b=$('mv_'+k);if(b)b.onclick=()=>{u.msv[k]=u.msv[k]?0:1;};}
 $('manS').onchange=e=>{u.man=e.target.checked?1:0;s.sc=null;if(u.man){u.msv=Object.assign(SV0(),s.sv);note('Manual solenoid operation on','w');}else note('Sequence restored');};
 if($('pr4'))$('pr4').onchange=e=>{u.pr4=e.target.checked?0:1;};}
function buildSet(){const dd=M.discs?`<div class="ctl"><label for="discS">Gravity disc <output id="dRec"></output></label><select id="discS" class="tsel" style="background:#fff;color:var(--ink);border-color:var(--line)">${M.discs.map(d=>`<option value="${d}">ø ${d} mm</option>`).join('')}</select><div class="live"><button class="sbtn" id="fitD">Fit recommended disc</button></div></div>`:'';
 const sl=(id,l,min,max,st)=>`<div class="ctl"><label for="${id}">${l} <output id="${id}O"></output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${st}"><div class="live" id="${id}L"></div></div>`;
 $('settings').innerHTML=sl('sQ',`Feed flow, ${M.tag.flow}`,Math.round(M.Q380*.15),M.Qpump,10)+sl('sRv',`Outlet valve, ${M.tag.back}`,4,100,1)+sl('sIv','Discharge interval',M.ivMin,M.ivMax,1)+sl('sTs','Separation temperature',30,105,1)+sl('sTt','Settling tank temperature',30,90,1)+dd;
 const bd=(id,k,c)=>{$(id).oninput=e=>{u[k]=+e.target.value;syncSet();c&&c();};};
 bd('sQ','q');bd('sRv','rv');bd('sIv','iv');bd('sTs','Ts');bd('sTt','Tt');
 if(M.discs){$('discS').onchange=e=>{if(s.rpm>0){note('Fit a gravity disc only at standstill.','w');e.target.value=u.disc;return;}u.disc=+e.target.value;note('Gravity disc ø'+u.disc+' fitted');};
  $('fitD').onclick=()=>{if(s.rpm>0){note('Stop the purifier and wait for zero speed before changing the disc.','w');return;}u.disc=bestDisc(M,u.fuel,u.Ts,Math.min(u.q,M.Q380));note('Gravity disc ø'+u.disc+' fitted');syncSet();};}
 syncSet();}
function syncSet(){const set=(id,v,o)=>{const e=$(id);if(e){e.value=v;$(id+'O').textContent=o;}};
 set('sQ',u.q,u.q+' L/h');set('sRv',u.rv,u.rv+' %');set('sIv',u.iv,u.iv+' min');set('sTs',u.Ts,u.Ts+' °C');set('sTt',u.Tt,u.Tt+' °C');if($('discS'))$('discS').value=u.disc;}
function renderCtl(){const d=s.d||{};
 renderStarter();
 $('vb_wOn').textContent=fx(s.Pw,1)+' bar';$('vb_aOn').textContent=fx(s.Pa,1)+' bar';
 for(const k of ['wOn','aOn']){$('tg_'+k).setAttribute('aria-pressed',!!u[k]);$('tg_'+k).textContent=u[k]?'OPEN':'SHUT';}
 for(const k of ['feed','seal','open','close','drain','par']){const l=$('vl_'+k);if(!l)continue;l.className='led'+(s.sv[k]?' g':'');const b=$('mv_'+k);b.hidden=!u.man;b.textContent=u.msv[k]?'ON':'OFF';b.setAttribute('aria-pressed',!!u.msv[k]);}
 $('vbMode').textContent=u.man?'Manual solenoids':'Sequence control';
 if($('sQL'))$('sQL').textContent=`Rated ${fx(d.Qr,0)} L/h at ${fx(d.nu,0)} cSt, load ${fx((d.load||0)*100,0)} %`;
 if($('sRvL'))$('sRvL').textContent=`Back pressure ${fx(s.Pout,2)} bar, maximum ${fx(d.Pmax,2)}`;
 if($('sIvL'))$('sIvL').textContent=`${fx(s.tSince/60,0)} min since last. Sludge ${fx(s.Vs,2)} L of ${fx(M.Vsm,1)}`;
 if($('sTsL'))$('sTsL').textContent=`Viscosity ${fx(d.nu,0)} cSt, density ${fx(d.rO,0)} kg/m³`;
 if($('dRec'))$('dRec').textContent='Use ø'+bestDisc(M,u.fuel,u.Ts,Math.min(u.q,M.Q380));}

/* --- window table, trends, status --- */
function renderTbl(){const d=s.d||{},row=(l,v,w,st)=>`<tr><td>${l}</td><td class="v">${v}</td><td class="b">${w}</td><td><span class="pill ${st}">${({ok:'OK',lo:'LOW',hi:'HIGH',xx:'ALARM',na:'–'})[st]}</span></td></tr>`;
 const r=s.rpm>.5,run=s.ph==='sep';const band=(v,a,b,on)=>!on?'na':v<a?'lo':v>b?'hi':'ok';
 const pv=d.ri||0;let rows=`<tr class="grp"><td colspan="4">Bowl</td></tr>`+
 row('Bowl speed',Math.round(s.rpm*M.rpmR)+' rpm',M.rpmR+' rpm',band(s.rpm,.97,1.03,s.motor))+
 row('Particle cut size',fx(d.dc,1)+' µm','6 at rated',band(d.dc,0,7.5,run))+
 (CL(M)?row('Water reach, stack edge ø'+M.Rs*2,'ø'+fx(pv*2,0)+' mm','outside ø'+M.Rs*2,band(pv,M.Rs+1,M.Rb,run)):row('Interface','ø'+fx(pv*2,0)+' mm',`ø${M.riMin*2} to ø${M.riMax*2}`,band(pv,M.riMin,M.riMax,run)))+
 row('Separation distance, disc stack edge to interface',fx(d.sep,1)+' mm',CL(M)?'over 3':`0 to ${M.riMax-M.riMin}`,band(d.sep,CL(M)?3:.5,CL(M)?999:M.riMax-M.riMin,run))+
 row('Density difference to water',fx(d.dRho,0)+' kg/m³','over 15',band(d.dRho,15,999,run))+
 row('Sludge in bowl',fx(s.Vs,2)+' L','up to '+M.Vsm,band(s.Vs,0,M.Vsm,r))+
 row('Vibration',fx(s.vib,1)+' mm/s','under '+M.vibW,band(s.vib,0,M.vibW,s.rpm>.1))+
 `<tr class="grp"><td colspan="4">Oil</td></tr>`+
 row('Separation temperature',fx(s.T)+' °C',`${u.Ts} ±4`,band(s.T,u.Ts-4,u.Ts+4,s.Q>0))+
 row('Feed flow',fx(s.Q,0)+' L/h','rated '+fx(d.Qr,0),band(d.load,0,1.02,s.Q>0))+
 row('Back pressure',fx(s.Pout,2)+' bar',`${M.Pb} ±0.3, max ${fx(d.Pmax,1)}`,band(s.Pout,M.Pb-.5,Math.min(M.Pb+.5,d.Pmax||9),run))+
 row('Oil to water or sludge outlet',fx(s.brk*100,0)+' %','0',band(s.brk,0,.02,run))+
 `<tr class="grp"><td colspan="4">Clean oil</td></tr>`+
 row('Al + Si in, out',`${fx(d.alIn,0)}, ${fx(d.alOut,1)}`,'out 15 max',band(d.alOut,0,15,run))+
 row('Al + Si removal',fx((d.etaAlSi||0)*100,0)+' %','65 to 90 typical',band((d.etaAlSi||0)*100,55,100,run))+
 row('Water out',fx(s.wOut,2)+' %','0.2 max',band(s.wOut,0,.2,run))+
 row('Sodium in, out',`${fx(d.naIn,0)}, ${fx(d.naOut,0)}`,'100 ISO, feed',band(d.naOut,0,100,run))+
 row('Vanadium in, out',`${fx(d.fl&&d.fl.v,0)}, ${fx(d.vOut,0)}`,'no removal',band(d.vOut,0,350,run))+
 row('Service tank Al + Si',fx(s.cAlSi,1)+' mg/kg','15 max',band(s.cAlSi,0,15,true))+
 row('Oil lost so far',fx(s.loss,1)+' L',`${fx(s.oilIn>0?s.waste/s.oilIn*100:0,2)} % of feed to waste`,'na');
 $('readings').innerHTML='<tr><th>Reading</th><th style="text-align:right">Now</th><th>Normal</th><th></th></tr>'+rows;}
const TR=[['T','Oil feed, °C',60,110],['Q','Feed, L/h',0,()=>M.Qpump],['P','Back pressure, bar',0,3],['w','Water out, %',0,1],['V','Sludge in bowl, L',0,()=>M.Vsm*1.6]];
function buildStrips(){$('strips').innerHTML=TR.map(t=>`<div class="strip"><div class="st"><span>${t[1]}</span><span id="trv_${t[0]}"></span></div><svg viewBox="0 0 500 60" preserveAspectRatio="none" style="height:56px"><polyline id="tr_${t[0]}" fill="none" stroke="#1f6db5" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg></div>`).join('');}
function renderStrips(){if(!hist.length)return;const n=hist.length;for(const t of TR){const mx=typeof t[3]==='function'?t[3]():t[3];let pts='';hist.forEach((h,i)=>{pts+=`${(i/(Math.max(n-1,1))*500).toFixed(1)},${(58-56*clamp((h[t[0]]-t[2])/(mx-t[2]))).toFixed(1)} `;});$('tr_'+t[0]).setAttribute('points',pts);$('trv_'+t[0]).textContent=fx(hist[n-1][t[0]],t[0]==='w'?2:t[0]==='V'?2:t[0]==='Q'?0:1);}$('trendSpan').textContent=fx((hist[n-1].t-hist[0].t)/60,0)+' min shown';}
/* the plant diagram shows the worst active alarm, and the reading that raised it */
function plantWarn(list){
  const top=list.reduce((a,b)=>b.l>a.l?b:a,{l:0}),fl=list.some(a=>!a.ack),w=$('mimicWrap');
  $('mwarn').dataset.l=top.l;w.dataset.l=top.l;$('mwarn').classList.toggle('flash',fl);w.classList.toggle('flash',fl);
  $('mwarnT').textContent=top.l?`${top.l>1?'ALARM':'WARNING'}: ${top.t}${list.length>1?`  (+${list.length-1} more)`:''}`:'No active alarms';
  const on={};list.forEach(a=>{if(!a.k)return;const o=on[a.k]=on[a.k]||{l:0,fl:false};o.l=Math.max(o.l,a.l);o.fl=o.fl||!a.ack;});
  document.querySelectorAll('#mimic .mAl').forEach(e=>{e.classList.remove('mAl','mAlF');delete e.dataset.l;});
  for(const k in on){const e=$('m_'+k);if(!e)continue;const el=e.previousElementSibling&&e.previousElementSibling.tagName==='rect'?e.parentNode:e;el.classList.add('mAl');el.classList.toggle('mAlF',on[k].fl);el.dataset.l=on[k].l;}
}
const ALARM_TAG={hiT:'T',loT:'T',ptH:'Pout',ptL:'Pout',feedL:'Q',feedH:'Pin',air:'Pa',water:'Pw',pt5:'Pwo',sludge:'sl',leak:'bowl',lm:'bowl',nodis:'bowl',vibW:'bowl',vibS:'bowl',spdH:'bowl',spdL:'bowl',runup:'bowl',foulS:'bowl',hidens:'bowl',tHi:'mt',dinsuf:'mt'};
function renderTiles(){const rows=alarmRows(M);if(tilesFor!==M.id){tilesFor=M.id;$('tiles').innerHTML=rows.map(r=>`<div class="tile" id="tl_${r[0]}">${esc(r[1].replace(/ - /,' '))}</div>`).join('');}
 for(const r of rows){const a=s.alarm[r[0]],e=$('tl_'+r[0]);e.dataset.l=a&&a.on?r[2]:'';e.classList.toggle('flash',!!(a&&a.on&&!a.ack));}
 plantWarn(Object.entries(s.alarm).filter(([,a])=>a.on).map(([k,a])=>({l:a.lv,ack:!!a.ack,t:a.txt.replace(/ - /,' '),k:ALARM_TAG[k]})));}
function renderLog(){const L=s.log||[];const box=$('log');while(logN<L.length){const l=L[logN++],d=document.createElement('div');const c={a:'a',w:'w',n:'n'}[l.k]||'c';d.className=c;d.innerHTML=`<span>${clockOf(l.t)}</span><span>${esc(l.txt)}</span>`;box.appendChild(d);box.scrollTop=box.scrollHeight;}}
const clockOf=t=>{const h=Math.floor(t/3600),m=Math.floor(t/60)%60,x=Math.floor(t)%60;return [h,m,x].map(v=>String(v).padStart(2,'0')).join(':');};
function renderMode(){const t={standst:['STANDSTILL',''],off:['STOPPED',''],start:['STARTING','warn'],wait:['STANDBY','warn'],closing:['CLOSING BOWL','warn'],sep:['SEPARATING','ok'],dis:['DISCHARGE','warn'],stopseq:['STOP SEQUENCE','warn'],rundown:['RUNNING DOWN','warn'],hold:['FEED STOPPED','bad'],safety:['SAFETY STOP','bad'],estop:['EMERGENCY STOP','bad']}[s.ph]||[s.ph.toUpperCase(),''];$('mode').textContent=t[0];$('mode').dataset.s=t[1];$('clock').textContent=clockOf(s.t);$('ovFlag').hidden=!u.act;}
function renderSteps(){const st=steps();let first=true,h='';st.forEach((r,i)=>{const d=r[1]();const c=d?'done':first?'now':'';if(!d&&first)first=false;h+=`<li class="${c}"><span class="n">${i+1}</span><span>${esc(r[0])}${c==='now'&&r[3]?`<span class="why">${esc(r[3])}</span>`:''}</span></li>`;});if($('steps').dataset.h!==h){$('steps').innerHTML=h;$('steps').dataset.h=h;}}
