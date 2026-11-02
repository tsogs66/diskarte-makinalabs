/* --- program header, shared by every program: Home goes back to the dashboard, Info opens the equipment page, alarms report to the dashboard card --- */
function chrome(html,prog){
 const inApp=/[?&]app=1/.test(location.search),HUB='https://claude.ai/artifact/PG8pAsRRtY1PMwvDLnbyBF';
 const ov=document.createElement('div');ov.id='infoOv';ov.hidden=true;ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','infoT');
 ov.innerHTML=`<div class="infoBox"><div class="infoHd"><b id="infoT">Information</b><button class="tbtn" id="infoClose">Close</button></div><div class="infoBody">${html}</div></div>`;
 document.body.append(ov);
 const show=v=>{ov.hidden=!v;if(v)document.getElementById('infoClose').focus();};
 document.getElementById('info').addEventListener('click',()=>show(true));
 document.getElementById('infoClose').addEventListener('click',()=>show(false));
 ov.addEventListener('click',e=>{if(e.target===ov)show(false);});
 addEventListener('keydown',e=>{if(e.key==='Escape')show(false);});
 document.getElementById('homeBtn').addEventListener('click',()=>{if(inApp)parent.postMessage({home:1},'*');else window.open(HUB,'_top');});
 let last=-1;setInterval(()=>{const n=[...document.querySelectorAll('.tile')].filter(t=>t.dataset.l==='2').length;if(n!==last){last=n;if(inApp)parent.postMessage({prog,alarms:n},'*');}},700);
 addEventListener('message',e=>{if(e.data&&e.data.visible===false)show(false);});
}
