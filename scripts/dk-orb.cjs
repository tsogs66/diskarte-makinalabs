/* Checks the Diskarte orb menu on phones: one tap opens the whole menu inside the screen, and the TRAIN / PRO label is readable.
   Needs www/ built. Run: node scripts/dk-orb.cjs  (shots go to .shots/ when SHOTS=1) */
const {launch,sleep}=require('./dk-cdp.cjs'),path=require('path'),fs=require('fs');
const PAGES={pur:'purifier.html',fwg:'fwg-simulator-app.html',boiler:'boiler-simulator-app.html'};
const url=(f,q)=>'file:///'+path.resolve(__dirname,'..','www',f).replace(/\\/g,'/')+'?dk=quiet'+(q||'');
const tap=async(p,sel)=>{const r=await p.eval('(()=>{const e=document.querySelector('+JSON.stringify(sel)+').getBoundingClientRect();return[e.left+e.width/2,e.top+e.height/2]})()');await p.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r[0],y:r[1]}]});await sleep(60);await p.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('  FAIL',m);}};
const SIZES=[['phone landscape 780x360',780,360],['phone landscape 640x300',640,300],['phone landscape 915x412',915,412],['phone portrait 390x780',390,780],['phone portrait 360x640',360,640]];
const lum=c=>{const m=c.match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2]);};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
(async()=>{const b=await launch(9473);try{
 for(const plant of ['pur','fwg','boiler'])for(const [name,w,h] of SIZES){
  const p=await b.newPage();await p.open(url(PAGES[plant]),{w,h,mobile:true,dpr:2,wait:3500});
  const o0=JSON.parse(await p.eval("JSON.stringify(document.getElementById('dkOrb').getBoundingClientRect())"));await tap(p,'#dkOrb');await sleep(500);
  const r=JSON.parse(await p.eval(`JSON.stringify((()=>{const m=document.getElementById('dkMenu'),bs=[...m.querySelectorAll('button')],rc=m.getBoundingClientRect(),vh=innerHeight,vw=innerWidth;
   const vis=bs.filter(e=>{const q=e.getBoundingClientRect();return q.top>=-1&&q.bottom<=vh+1&&q.left>=-1&&q.right<=vw+1&&q.height>0;}).length;
   const l=document.getElementById('dkOrbL'),cs=getComputedStyle(l),bg=cs.backgroundColor;
   const sc=m.scrollHeight>m.clientHeight+1;
   const setOpen=[...document.querySelectorAll('.dkw')].some(w=>w.getBoundingClientRect().height>0&&/^\s*settings/i.test(w.textContent));const o1=document.getElementById('dkOrb').getBoundingClientRect();return{o1x:o1.left,o1y:o1.top,setOpen,hidden:m.hidden,n:bs.length,vis,top:rc.top,bottom:rc.bottom,vh,vw,scroll:sc,lbl:cs.color,bg,lblText:l.textContent,op:getComputedStyle(document.getElementById('dkDock')).opacity};})())`));
  console.log(plant,name,'menu items',r.n,'fully on screen',r.vis,'scrollable',r.scroll,'label',r.lblText,r.lbl,'on',r.bg);
  ok(!r.hidden,plant+' '+name+': one tap opens the menu');
  ok(Math.abs(r.o1x-o0.left)<2&&Math.abs(r.o1y-o0.top)<2,plant+' '+name+': the orb stays under the finger ('+Math.round(r.o1x-o0.left)+','+Math.round(r.o1y-o0.top)+')');
  if(h>=360&&(w>=780||h>=700))ok(!r.scroll,plant+' '+name+': the whole menu is visible without scrolling');
  ok(!r.setOpen,plant+' '+name+': the tap did not open Settings by itself');
  ok(r.vis===r.n||r.scroll,plant+' '+name+': '+r.vis+' of '+r.n+' items on screen and the menu does not scroll');
  ok(r.top>=0&&r.bottom<=r.vh,plant+' '+name+': menu box inside the screen ('+Math.round(r.top)+'..'+Math.round(r.bottom)+' of '+r.vh+')');
  if(process.env.SHOTS){fs.mkdirSync('.shots',{recursive:true});await p.shot('.shots/orb-'+plant+'-'+w+'x'+h+'.png');}
  /* label: strong contrast against the page (a solid dark pill under the text) */
  const bgc=/rgba?\(/.test(r.bg)&&!/, 0\)$/.test(r.bg)?r.bg:'rgb(255,255,255)';
  ok(ratio(r.lbl,bgc)>=7,plant+' '+name+': label contrast '+ratio(r.lbl,bgc).toFixed(1)+' (need 7)');
  /* a tap on the last menu item must work too */
  await p.eval(`(()=>{const bs=document.querySelectorAll('#dkMenu button');bs[bs.length-1].scrollIntoView({block:'nearest'});return 1;})()`);
  p.close();
 }
}finally{b.close();}
console.log('\n'+pass+' passed, '+fail+' failed');process.exit(fail?1:0);})();
