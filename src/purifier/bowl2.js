/* --- sequence chart: the running script, or the one picked --- */
let seqView='dis',seqKey='';
const SEQN={start:'Start',startC:'Start with calibration',ref:'Bowl close and feed on',dis:'Sludge discharge',disS:'Discharge before stop',par:'Partial discharge',stop:'Stop'};
function buildSeq(){const names=Object.keys(M.scr);if(!M.scr[seqView])seqView='dis';$('seqBtns').innerHTML=names.map(n=>`<button class="sbtn" data-n="${n}" aria-pressed="${n===seqView}">${SEQN[n]||n}</button>`).join('');for(const b of $('seqBtns').children)b.onclick=()=>{seqView=b.dataset.n;seqKey='';for(const c of $('seqBtns').children)c.setAttribute('aria-pressed',c===b);renderSeq();};seqKey='';}
function renderSeq(){const live=s.sc&&s.sc.n,n=live||seqView,R=M.scr[n],i=live?s.sc.i:-1,T=M.tag,C=[['feed',T.feed],['seal',T.seal],['open',T.open],['close',T.close],['drain','V5'],['par','SV9'],['v4x','V4 shut']].filter(c=>R.some(r=>r[2][c[0]]));
 const k=n+'|'+i+'|'+M.id;if(k!==seqKey){seqKey=k;$('seqT').innerHTML=`<tr><th>Step</th><th>s</th>${C.map(c=>`<th>${c[1]}</th>`).join('')}</tr>`+R.map((r,j)=>`<tr class="${j===i?'now':''}"><td>${esc(r[0])}</td><td>${r[1]}</td>${C.map(c=>`<td class="dot">${r[2][c[0]]?'●':''}</td>`).join('')}</tr>`).join('');}
 $('seqNow').textContent=live?`${SEQN[n]||n}: ${fx(Math.max(0,R[i][1]-s.sc.t),0)} s left`:'Idle between sequences';}
