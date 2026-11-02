/* --- panel kit: door parts drawn in SVG. Ammeters are square moving-iron meters with a quadrant scale, 0 to rated, compressed to 3 x rated --- */
const PK={am:{},keys:{},
 top(In){for(const t of[1,1.5,2,2.5,3,4,5,6,8,10,12,15,20,25,30,40,50,60,75,100,150])if(t>=In)return t;return Math.ceil(In);},
 frac(a,v){return v<=a.T?.72*Math.max(0,v)/a.T:.72+.28*Math.min(1,(v-a.T)/(a.T*2));},
 ang:f=>186+84*f,
 amm(id,x,y,sz,In,Ist,lab){const T=PK.top(In),a={T,In,Ist,v:0,c:0,run:false,t0:0};PK.am[id]=a;const R=60,P=84;
  const pt=(f,r)=>{const t=PK.ang(f)*Math.PI/180;return[(P+r*Math.cos(t)).toFixed(1),(P+r*Math.sin(t)).toFixed(1)];};
  let tk='';for(let k=0;k<=10;k++){const f=PK.frac(a,T*k/10),[x1,y1]=pt(f,R),[x2,y2]=pt(f,R+(k%5===0?7:4));tk+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111" stroke-width="${k%5===0?1.1:.6}"/>`;}
  for(const m of[1.5,2,2.5,3]){const f=PK.frac(a,T*m),[x1,y1]=pt(f,R),[x2,y2]=pt(f,R+(m===3?7:4));tk+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111" stroke-width="${m===3?1.1:.6}"/>`;}
  const [ax,ay]=pt(.03,R),[bx,by]=pt(.72,R),[cx,cy]=pt(1,R);
  const nt=(v,f)=>{const[tx,ty]=pt(f,R+13);return `<text x="${tx}" y="${(+ty+2.4).toFixed(1)}" text-anchor="middle" class="pkn">${+v.toFixed(1)}</text>`;};
  const [r1,r2]=pt(PK.frac(a,In),R-3),[r3,r4]=pt(PK.frac(a,In),R+7);
  return `<g transform="translate(${x} ${y}) scale(${sz/100})" role="img" aria-label="${lab||'Ammeter'}"><rect width="100" height="100" rx="3" fill="#17191b"/><rect x="5" y="5" width="90" height="90" rx="1.5" fill="#f5f3ea"/>
  <path d="M${ax} ${ay}A${R} ${R} 0 0 1 ${bx} ${by}A${R} ${R} 0 0 1 ${cx} ${cy}" fill="none" stroke="#111" stroke-width=".9"/>${tk}${nt(0,0)}${nt(T/2,PK.frac(a,T/2))}${nt(T,.72)}${nt(T*3,1)}
  <line x1="${r1}" y1="${r2}" x2="${r3}" y2="${r4}" stroke="#c6281f" stroke-width="2.4"/>
  <text x="57" y="72" text-anchor="middle" class="pkA">A</text><text x="57" y="82" text-anchor="middle" class="pks">~ 1.5</text>
  <g id="${id}_n" transform="rotate(${PK.ang(0)-180} ${P} ${P})"><line x1="${P}" y1="${P}" x2="${P-R+1}" y2="${P}" stroke="#101010" stroke-width="1.5"/></g>
  <path d="M95 65A30 30 0 0 0 65 95H95Z" fill="#1b1e20"/></g>`;},
 set(id,val,run){const a=PK.am[id];if(!a)return;const now=performance.now();if(run&&!a.run)a.t0=now;a.run=!!run;let v=val;if(run&&a.t0){const e=(now-a.t0)/1000;if(e<2.4)v=Math.max(v,a.Ist*(1-e/2.4)+val*e/2.4);}a.v=PK.frac(a,v);},
 tick(){for(const id in PK.am){const a=PK.am[id],d=a.v-a.c;if(Math.abs(d)<.0008)continue;a.c+=d*.22;const e=document.getElementById(id+'_n');if(e)e.setAttribute('transform',`rotate(${PK.ang(a.c)-180} 84 84)`);}requestAnimationFrame(PK.tick);},
 lamp(id,x,y,r,col,lab){const off={g:'#17402a',w:'#8f938d',r:'#4e1714',o:'#5a3a10'}[col];return `<circle cx="${x}" cy="${y}" r="${r+3.5}" fill="#c3c6c0" stroke="#3b3f3c" stroke-width="1"/><circle id="${id}" cx="${x}" cy="${y}" r="${r}" fill="${off}" stroke="#222" stroke-width=".8" data-c="${col}" data-off="${off}" aria-label="${lab||''}"/>`;},
 lit(id,on){const e=document.getElementById(id);if(!e||e.dataset.s===(on?'1':'0'))return;e.dataset.s=on?'1':'0';const c={g:'#3df08a',w:'#fffdf0',r:'#ff4a3a',o:'#ffb02e'}[e.dataset.c];e.setAttribute('fill',on?c:e.dataset.off);e.style.filter=on?`drop-shadow(0 0 4px ${c})`:'';},
 hit(key,fn,aria,inner){PK.keys[key]=fn;return `<g class="pk" data-pk="${key}" tabindex="0" role="button" aria-label="${aria}">${inner}</g>`;},
 push(key,x,y,r,col,fn,aria){const c={g:['#1fa35a','#47d487'],r:['#c92a22','#f06a60'],k:['#1d1f21','#4a4e52']}[col];return PK.hit(key,fn,aria,`<circle cx="${x}" cy="${y}" r="${r+4}" fill="#c3c6c0" stroke="#3b3f3c"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c[0]}" stroke="#222"/><ellipse cx="${x-r*.25}" cy="${y-r*.32}" rx="${r*.45}" ry="${r*.28}" fill="${c[1]}" opacity=".75"/>`);},
 rotary(key,id,x,y,r,fn,aria){return PK.hit(key,fn,aria,`<circle cx="${x}" cy="${y}" r="${r}" fill="#f2c318" stroke="#3b3f3c"/><text x="${x}" y="${y-r+11}" text-anchor="middle" class="pkb">0</text><text x="${x+r-8}" y="${y+4}" text-anchor="middle" class="pkb">I</text><g id="${id}" data-x="${x}" data-y="${y}"><rect x="${x-8}" y="${y-r*.62}" width="16" height="${r*1.24}" rx="6" fill="#c9231c" stroke="#5f100c"/><circle cx="${x}" cy="${y}" r="${r*.36}" fill="#c9231c" stroke="#5f100c"/></g>`);},
 turn(id,deg){const e=document.getElementById(id);if(e&&e.dataset.d!==String(deg)){e.dataset.d=deg;e.setAttribute('transform',`rotate(${deg} ${e.dataset.x} ${e.dataset.y})`);}},
 sel(key,id,x,y,r,fn,aria,a,b){return PK.hit(key,fn,aria,`<text x="${x-r-4}" y="${y-r+2}" text-anchor="end" class="pkb">${a}</text><text x="${x+r+4}" y="${y-r+2}" class="pkb">${b}</text><circle cx="${x}" cy="${y}" r="${r}" fill="#222528" stroke="#000"/><g id="${id}" data-x="${x}" data-y="${y}"><rect x="${x-3}" y="${y-r+1}" width="6" height="${r+2}" rx="2" fill="#f1efe6"/></g>`);},
 mccb(key,id,x,y,w,h,fn,aria){return PK.hit(key,fn,aria,`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#25282b" stroke="#000"/><rect x="${x+9}" y="${y+18}" width="${w-18}" height="${h-36}" rx="2" fill="#0f1112"/><text x="${x+w/2}" y="${y+13}" text-anchor="middle" class="pkb" style="fill:#f1efe6">ON</text><text x="${x+w/2}" y="${y+h-6}" text-anchor="middle" class="pkb" style="fill:#f1efe6">OFF</text><rect id="${id}" x="${x+12}" y="${y+h-52}" width="${w-24}" height="30" rx="3" fill="#d9d6c9" stroke="#000"/>`);},
 flip(id,y0,y1,on){const e=document.getElementById(id);if(e)e.setAttribute('y',on?y1:y0);},
 mush(key,x,y,r,fn,aria){return PK.hit(key,fn,aria,`<circle cx="${x}" cy="${y}" r="${r+11}" fill="#f2c318" stroke="#3b3f3c"/><circle cx="${x}" cy="${y}" r="${r}" fill="#c9231c" stroke="#5f100c" stroke-width="1.5"/><ellipse cx="${x-r*.28}" cy="${y-r*.34}" rx="${r*.42}" ry="${r*.24}" fill="#ef6a5e" opacity=".8"/>`);},
 hm(id,x,y,w,h){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#17191b"/><rect x="${x+5}" y="${y+5}" width="${w-22}" height="${h-10}" fill="#f1efe6"/><text id="${id}" x="${x+w-20}" y="${y+h-8.5}" text-anchor="end" class="pkh">00000</text><text x="${x+w-8}" y="${y+h-9}" text-anchor="middle" class="pkb" style="fill:#f1efe6">h</text>`;},
 plate(x,y,w,h,t,fs){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="#f5f4ee" stroke="#555" stroke-width=".7"/><text x="${x+w/2}" y="${y+h/2+(fs||9)*.36}" text-anchor="middle" class="pkp" style="font-size:${fs||9}px">${t}</text>`;},
 screw(x,y,r){r=r||9;return `<circle cx="${x}" cy="${y}" r="${r}" fill="#a9ada8" stroke="#333"/><circle cx="${x}" cy="${y}" r="${r*.5}" fill="#6f736e"/>`;},
 door(w,h,c){return `<rect x="1" y="1" width="${w-2}" height="${h-2}" rx="5" fill="${c}" stroke="#555a58" stroke-width="2"/><rect x="7" y="7" width="${w-14}" height="${h-14}" rx="3" fill="none" stroke="#fff" stroke-opacity=".35"/>`;},
 txt(id,t){const e=document.getElementById(id);if(e&&e.textContent!==t)e.textContent=t;},
 wire(root){for(const g of root.querySelectorAll('[data-pk]')){const go=()=>{g.classList.add('dn');setTimeout(()=>g.classList.remove('dn'),130);PK.keys[g.dataset.pk]();};g.addEventListener('click',go);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});}}};
requestAnimationFrame(PK.tick);
