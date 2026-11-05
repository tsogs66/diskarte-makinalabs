function openVP(k,e){const vp=$('vp'),w=$('mimicWrap').getBoundingClientRect(),T=M.tag;
 const sw=(lab,get,set,hint)=>`<div class="vph"><span>${lab}</span><button class="vpx" aria-label="Close">×</button></div>${hint?`<div class="note">${hint}</div>`:''}<div class="vpb"><button class="sbtn" id="vpO">Open</button><button class="sbtn" id="vpC">Shut</button></div>`;
 const slide=(lab,val,min,max,unit,hint)=>`<div class="vph"><span>${lab}</span><button class="vpx" aria-label="Close">×</button></div><div class="vpv"><span>${hint}</span><output id="vpOut">${val} ${unit}</output></div><input id="vpR" type="range" min="${min}" max="${max}" value="${val}" aria-label="${lab}">`;
 let html='',on=null;
 const simple={v12:['Circulation back pressure valve V12','v12'],suc:['Tank suction','suc'],ret:['Recirculation','ret'],out:['Outlet valve','out'],stm:['Steam supply','stm'],wOn:['Operating water supply','wOn'],aOn:['Control air supply','aOn'],slv:['Sludge tank valve','slv']};
 if(simple[k]){html=sw(simple[k][0]);on=v=>{u[simple[k][1]]=v;};}
 else if(k==='flow'){html=slide(T.flow+' feed flow',u.q,Math.round(M.Q380*.15),M.Qpump,'L/h',`Rated ${Math.round(s.d.Qr||M.Q380)} L/h at this viscosity`);}
 else if(k==='back'){html=slide(T.back+' back pressure valve',u.rv,4,100,'% open',`Normal ${M.Pb} bar at ${T.pOut}`);}
 else if(k==='pump'){if(M.attached){html=sw('Gear pump')+'<div class="note">Runs with the purifier through the safety joint.</div>';}else{html=sw('Feed pump');on=v=>setPump(v);}}
 else if(k==='slp'){html=sw('Sludge pump');on=v=>{s.slp=v;};}
 else if(k==='heater'){html=sw('Heater');on=v=>setHeater(v);}
 else if(k==='chg'){html=`<div class="vph"><span>Strainer change-over</span><button class="vpx" aria-label="Close">×</button></div><div class="note">In service: ${u.strB?'bypass':'main'} strainer.</div><div class="vpb"><button class="sbtn" id="vpM" ${u.strB?'':'disabled'}>To main</button><button class="sbtn" id="vpB" ${u.strB?'':''}${u.strB?'disabled':''}>To bypass</button></div>`;}
 else if(k==='str'||k==='strb'){const B=k==='strb',use=B===!!u.strB,dirty=B?f.strainerB:f.strainer;html=`<div class="vph"><span>${B?'Bypass':'Main'} strainer</span><button class="vpx" aria-label="Close">×</button></div><div class="note">${dirty?'Blocked.':'Clean.'} ${use?'In service: change over before opening it.':'Isolated: safe to open.'}</div><button class="sbtn" id="vpF" ${use?'disabled':''}>Clean filter</button>`;}
 else if(k==='sv9'){html=`<div class="vph"><span>SV9 partial discharge</span><button class="vpx" aria-label="Close">×</button></div><div class="note">${M.hid?'Partial discharge valve. Opens for T011, 0.6 s, when the water detector trips. Discharge amount is set by the reducing valve, 0.25 MPa.':'Partial discharge valve of the quadruple solenoid unit (GSH-1). The manual says GBC-1 has no SV9, so the SJ30G here runs total discharge only.'}</div>`;}
 else if(k==='sump'){const low=!!f.dryOil,lv=low?.14:.55,nm=M.attached?'Gear oil level':'Sump oil level',y=a=>(4+88*(1-a)).toFixed(1);
  if(!low&&!u.oilChk)note(nm+' checked: at the mark');if(!low)u.oilChk=1;
  html=`<div class="vph"><span>${nm}</span><button class="vpx" aria-label="Close">×</button></div><div class="sumpv"><svg viewBox="0 0 84 96" width="84" height="96" role="img" aria-label="Oil level sight glass: ${low?'below the minimum mark':'at the mark'}"><rect x="8" y="4" width="22" height="88" rx="4" fill="#eef3f7" stroke="#1b2321" stroke-width="2"/><rect x="10" y="${y(lv)}" width="18" height="${(88*lv-2).toFixed(1)}" fill="${low?'#7a4b17':'#9a5f1f'}"/><path d="M4 ${y(.75)}H34M4 ${y(.3)}H34" stroke="#c4211f" stroke-width="2"/><path d="M4 ${y(.55)}H34" stroke="#1b2321" stroke-width="1" stroke-dasharray="3 2"/><text x="38" y="${+y(.75)+4}" class="small">MAX</text><text x="38" y="${+y(.55)+4}" class="small">Mark</text><text x="38" y="${+y(.3)+4}" class="small">MIN</text></svg><div class="note">${low?'Level is below the minimum mark. Run like this and the spindle bearings overheat. Top it up to the mark.':'Level is at the mark and the oil is clear. Good to start.'}</div></div>${low?'<button class="sbtn" id="vpS">Top up to the mark</button>':''}`;}
 else if(k==='wstr'){html=`<div class="vph"><span>Water strainer</span><button class="vpx" aria-label="Close">×</button></div><div class="note">${f.wstr?'Clogged: operating water flow is low.':'Clean.'}</div><button class="sbtn" id="vpW">Clean strainer</button>`;}
 else if(['v1','seal','open','close','drain'].includes(k)){
  const nm=k==='v1'?'feed':k,m=u.man;html=`<div class="vph"><span>${k==='v1'?T.feed:T[k]}</span><button class="vpx" aria-label="Close">×</button></div><div class="note">${m?'Manual solenoid operation is on.':'Run by the sequence. Switch on manual solenoids in the valve block to operate by hand.'}</div>${m?'<div class="vpb"><button class="sbtn" id="vpO">Energise</button><button class="sbtn" id="vpC">Release</button></div>':''}`;
  on=m?v=>{u.msv[nm]=v;}:null;}
 vp.innerHTML=html;vp.hidden=false;const r=(e.target.getBoundingClientRect?e.target.getBoundingClientRect():{left:w.left+60,top:w.top+60});
 vp.style.left=Math.max(4,Math.min(w.width-226,r.left-w.left-30))+'px';vp.style.top=Math.max(4,Math.min(w.height-120,r.top-w.top+22))+'px';
 vp.querySelector('.vpx').onclick=()=>{vp.hidden=true;};
 if($('vpO')&&on){$('vpO').onclick=()=>{on(1);vp.hidden=true;};$('vpC').onclick=()=>{on(0);vp.hidden=true;};}
 if($('vpR')){const R=$('vpR');R.oninput=()=>{const v=+R.value;$('vpOut').textContent=v+(k==='flow'?' L/h':' % open');if(k==='flow')u.q=v;else u.rv=v;syncSet();};}
 if($('vpF'))$('vpF').onclick=()=>{const B=k==='strb';f[B?'strainerB':'strainer']=false;note((B?'Bypass':'Main')+' strainer cleaned. Change back when ready.');vp.hidden=true;renderFaults();};
 if($('vpM'))$('vpM').onclick=()=>{u.strB=0;note('Suction changed over to the main strainer');vp.hidden=true;};
 if($('vpB'))$('vpB').onclick=()=>{u.strB=1;note('Suction changed over to the bypass strainer');vp.hidden=true;};
 if($('vpS'))$('vpS').onclick=()=>{f.dryOil=false;u.oilChk=1;note((M.attached?'Gear oil':'Sump oil')+' topped up to the mark');vp.hidden=true;renderFaults();};
 if($('vpW'))$('vpW').onclick=()=>{f.wstr=false;note('Operating water strainer cleaned');vp.hidden=true;renderFaults();};
}
/* --- gauges --- */
let GA=[],gaSig='';
const scaleTop=x=>{for(const st of [1,2,2.5,5,10]){const d=Math.ceil(x/st);if(d<=6)return{max:d*st,div:d};}return{max:x,div:6};};
/* bands sit on the unit's own alarm limits: red for an alarm, amber for a warning, green between them, grey where the unit has no limit */
function gaugeSpec(){const G='var(--good)',A='var(--warn)',R='var(--bad)',N='var(--screen-dim)';
 const sH=(M.spdH||1.05*M.rpmR)/1000,sL=(M.spdL||.95*M.rpmR)/1000,sp=scaleTop(sH*1.1),am=scaleTop(M.fla*1.4);
 const tL=M.alcap?u.lim.loT:u.Ts-6,tH=M.alcap?u.lim.hiT:u.Ts+8,oL=M.alcap?u.lim.loO:M.Pb-.5,oH=M.alcap?u.lim.hiO:M.Pb+.6;
 return [
 {l:'Bowl speed ×1000 rpm',min:0,...sp,bands:[[0,sL,R],[sL,sH,G],[sH,sp.max,R]],v:()=>s.rpm*M.rpmR/1000,show:()=>s.rpm*M.rpmR,n:0,u:'rpm'},
 {l:'Oil feed °C',min:20,max:140,div:6,bands:[[20,tL,R],[tL,tH,G],[tH,140,R]],v:()=>s.T,n:1,u:'°C'},
 {l:'Feed pressure bar',min:0,max:4,div:4,bands:M.alcap?[[0,u.lim.hiF,G],[u.lim.hiF,4,A]]:[[0,4,N]],v:()=>s.Pin,n:2,u:'bar'},
 {l:'Back pressure bar',min:0,max:4,div:4,bands:[[0,oL,A],[oL,oH,G],[oH,Math.max(oH,M.Pmax),A],[Math.max(oH,M.Pmax),4,R]],v:()=>s.Pout,n:2,u:'bar'},
 {l:'Vibration mm/s',min:0,max:15,div:5,bands:[[0,M.vibW,G],[M.vibW,M.vibS,A],[M.vibS,15,R]],v:()=>s.vib,n:1,u:'mm/s'},
 {l:'Motor A',amm:1,min:0,...am,bands:[[0,M.fla,G],[M.fla,am.max,A]],v:()=>s.amps,n:1,u:'A'}];}
function gaugeFace(o,i){if(o.amm)return `<div class="gauge"><svg viewBox="0 0 120 120" aria-hidden="true">${PK.amm('gam',0,0,120,M.fla,M.fla*7,'Motor ammeter')}</svg><div class="gl">${o.l}</div><div class="gv" id="gv${i}">–</div></div>`;const lim=v=>Math.min(o.max,Math.max(o.min,v)),pol=(v,r)=>{const a=(135+270*(v-o.min)/(o.max-o.min))*Math.PI/180;return[60+r*Math.cos(a),60+r*Math.sin(a)];};
 const arc=(a,b,c)=>{a=lim(a);b=lim(b);if(b<=a)return '';const[p,q]=pol(a,46),[m,n]=pol(b,46),l=(b-a)/(o.max-o.min)*270>180?1:0;return `<path d="M${p} ${q} A46 46 0 ${l} 1 ${m} ${n}" fill="none" stroke="${c}" stroke-width="5"/>`;};
 let t='';for(let k=0;k<=o.div;k++){const v=o.min+(o.max-o.min)*k/o.div,[a,b]=pol(v,44),[c,d]=pol(v,37),[e,g]=pol(v,27.5);
  t+=`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="#dfe8e2"/><text x="${e}" y="${g+3}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff" font-family="var(--mono)">${+v.toFixed(1)}</text>`;}
 return `<div class="gauge"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="57" fill="var(--screen)" stroke="var(--ink)" stroke-width="2"/>${o.bands.map(b=>arc(b[0],b[1],b[2])).join('')}${t}<line id="ndl${i}" x1="60" y1="60" x2="60" y2="20" stroke="#ff7a4a" stroke-width="2.2" stroke-linecap="round"/><circle cx="60" cy="60" r="5" fill="#dfe8e2"/></svg><div class="gl">${o.l}</div><div class="gv" id="gv${i}">–</div></div>`;}
function buildGauges(){GA=gaugeSpec();gaSig=JSON.stringify(GA);$('gauges').innerHTML=GA.map(gaugeFace).join('');}
function renderGauges(){if(JSON.stringify(gaugeSpec())!==gaSig)buildGauges();GA.forEach((o,i)=>{const v=clamp(o.v(),o.min,o.max),a=-135+270*(v-o.min)/(o.max-o.min);if(o.amm)PK.set('gam',s.amps,s.motor);else $('ndl'+i).style.transform=`rotate(${a}deg)`;$('gv'+i).textContent=fx((o.show||o.v)(),o.n)+' '+o.u;});}

const PART=[];for(let i=0;i<34;i++)PART.push({a:Math.random(),r:Math.random(),t:i%3,sd:i%2?1:-1});
