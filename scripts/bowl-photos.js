/* turns the cutaway photos (passages cut out to transparent) into src/purifier/bowlimg.js: the photo itself as the bowl, the discharge slide as its own moving layer,
   and the liquid passages traced to clip paths. A passage is a see-through pixel inside its rough outline, so the photo's own edges set the exact boundary.
   Needs sharp, @resvg/resvg-js, potrace and pngjs: npm i --no-save sharp @resvg/resvg-js potrace@2.1.8 pngjs@7.0.0 */
const fs=require('fs'),sharp=require('sharp'),{Resvg}=require('@resvg/resvg-js'),{PNG}=require('pngjs'),{Potrace}=require('potrace');
const D='C:/Users/ts0gs/project-mind/vault/projects/upaw/purifier-panels/',OUT=__dirname+'/../src/purifier/bowlimg.js',tmp=__dirname+'/_m.png',K=.5;
const mir=(c,p)=>p.map(([x,y])=>[2*c-x,y]).reverse(),poly=p=>'M'+p.map(q=>q.join(' ')).join('L')+'Z';
const both=(c,p)=>[{d:poly(p)},{d:poly(mir(c,p))}],rect=(x0,y0,x1,y1)=>({d:`M${x0} ${y0}H${x1}V${y1}H${x0}Z`}),tube=(d,w)=>({d,w});
/* full-size photo coordinates, measured on a grid */
const U={
 f:{src:'p626-photo.webp',cx:1010,
  main:c=>both(c,[[830,740],[890,740],[890,1090],[1010,1090],[1010,1320],[720,1300],[495,1105],[600,1045],[680,1020],[830,780]]),
  feed:()=>[rect(982,0,1030,1175),rect(1027,100,1302,203)],
  clean:c=>[rect(960,205,985,858),rect(1030,212,1048,858),{d:poly([[898,208],[965,208],[965,292],[898,292]])},rect(1045,212,1302,304),...both(c,[[848,775],[890,775],[890,858],[982,858],[982,818],[848,818]])],
  hood:c=>both(c,[[700,658],[855,658],[868,700],[668,1032],[628,1022],[812,702],[700,705]]),
  slide:c=>both(c,[[500,1175],[715,1322],[1010,1322],[1010,1352],[705,1352],[488,1200]])},
 s:{src:'s826-photo.webp',cx:908,
  main:c=>both(c,[[725,945],[805,945],[805,1415],[890,1415],[890,1605],[600,1605],[480,1345],[560,1250],[725,1000]]),
  feed:()=>[rect(892,30,938,1392),{d:poly([[936,50],[1112,50],[1112,218],[962,218],[938,262]])}],
  clean:c=>[{d:'M940 575 L985 573 L1118 580 C1200 580 1243 568 1275 595 C1325 645 1385 778 1420 845 C1460 920 1500 995 1560 1025 C1620 1050 1690 1045 1720 1005 C1745 975 1749 956 1749 935',w:110,flood:[[960,575],[1100,580],[1260,590],[1380,760],[1460,920],[1580,1030],[1700,1020],[1745,955]]},...both(c,[[742,945],[890,945],[890,1045],[742,1045]])],
  hood:c=>[rect(832,418,890,668),{d:poly([[936,410],[1005,395],[1005,505],[936,525]])},tube('M985 455L1060 402L1260 396C1350 396 1450 252 1600 232L1625 232',44),...both(c,[[700,798],[800,798],[800,888],[700,888]])],
  slide:c=>both(c,[[470,1385],[600,1610],[908,1610],[908,1650],[590,1650],[455,1405]])}};
function svgMask(W,H,shapes){const s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}"/>${shapes.map(q=>q.w?`<path d="${q.d}" fill="none" stroke="#fff" stroke-width="${q.w}" stroke-linecap="round"/>`:`<path d="${q.d}" fill="#fff"/>`).join('')}</svg>`;
 const {data}=PNG.sync.read(Buffer.from(new Resvg(s).render().asPng()));const m=new Uint8Array(W*H);for(let i=0;i<W*H;i++)m[i]=data[i*4]>127;return m;}
const round=d=>d.replace(/-?\d+\.\d+/g,v=>(+v).toFixed(1).replace(/\.0$/,'')).replace(/\s*([MLCZ])\s*/g,'$1').replace(/, /g,' ').replace(/,/g,' ');
function trace(w,h,on){const o=new PNG({width:w,height:h});for(let i=0;i<w*h;i++){const v=on[i]?0:255;o.data[i*4]=o.data[i*4+1]=o.data[i*4+2]=v;o.data[i*4+3]=255;}fs.writeFileSync(tmp,PNG.sync.write(o));
 return new Promise((ok,no)=>{const t=new Potrace();t.setParameters({threshold:128,turdSize:6,optTolerance:.4,alphaMax:.9,blackOnWhite:true});t.loadImage(tmp,e=>{if(e)return no(e);const m=t.getPathTag().match(/ d="([^"]*)"/);ok(m?round(m[1]):'');});});}
const uri=async(buf,w,h)=>'data:image/webp;base64,'+(await sharp(buf,{raw:{width:w,height:h,channels:4}}).resize(Math.round(w*K),Math.round(h*K)).webp({quality:84,alphaQuality:90}).toBuffer()).toString('base64');
async function half(m,W,H){const b=Buffer.alloc(W*H*4);for(let i=0;i<W*H;i++){const v=m[i]?255:0;b[i*4]=b[i*4+1]=b[i*4+2]=v;b[i*4+3]=255;}
 const w=Math.round(W*K),h=Math.round(H*K),{data}=await sharp(b,{raw:{width:W,height:H,channels:4}}).resize(w,h).raw().toBuffer({resolveWithObject:true});const o=new Uint8Array(w*h);for(let i=0;i<w*h;i++)o[i]=data[i*4]>127;return [o,w,h];}
(async()=>{const A={};
 for(const[k,u]of Object.entries(U)){const {data:px,info}=await sharp(D+u.src).ensureAlpha().raw().toBuffer({resolveWithObject:true}),W=info.width,H=info.height,c=u.cx;
  const see=i=>px[i*4+3]<128,M={};for(const n of['main','feed','clean','hood']){const sh=u[n](c),fl=sh.filter(q=>q.flood),p=svgMask(W,H,sh.filter(q=>!q.flood));for(let i=0;i<W*H;i++)p[i]=p[i]&&see(i);
   /* a pipe drawn in the photo: flood the see-through inside from seeds on its centre line, kept within a band so it cannot run out into the background */
   for(const q of fl){const band=svgMask(W,H,[{d:q.d,w:q.w}]),st=[];for(const[x,y]of q.flood){const i=y*W+x;if(band[i]&&see(i))st.push(i);else console.warn(n,'seed not see-through',x,y);}
    while(st.length){const i=st.pop();if(p[i]||!band[i]||!see(i))continue;p[i]=1;const x=i%W;if(x>0)st.push(i-1);if(x<W-1)st.push(i+1);if(i>=W)st.push(i-W);if(i<W*H-W)st.push(i+W);}}
   M[n]=p;}
  const sl=svgMask(W,H,u.slide(c)),base=Buffer.from(px),slide=Buffer.alloc(W*H*4);
  for(let i=0;i<W*H;i++){const j=i*4,liq=M.main[i]||M.feed[i]||M.clean[i]||M.hood[i];
   if(sl[i]&&!see(i)){px.copy(slide,j,j,j+4);base[j+3]=0;}
   if(liq){base[j]=base[j+1]=base[j+2]=255;base[j+3]=255;}else if(base[j+3]<128){base[j]=base[j+1]=base[j+2]=255;base[j+3]=0;}}
  const a={img:await uri(base,W,H),slideImg:await uri(slide,W,H),clip:{}};
  for(const n of['main','feed','clean','hood']){const [m,w,h]=await half(M[n],W,H);a.clip[n]=await trace(w,h,m);}
  a.W=Math.round(W*K);a.H=Math.round(H*K);A[k]=a;console.log(k,a.W,a.H,JSON.stringify(a).length);}
 fs.writeFileSync(OUT,'/* --- bowls drawn from cutaway photos: the photo, its discharge slide, and the passages the liquids fill. Made by scripts/bowl-photos.js. --- */\nconst BOWLIMG='+JSON.stringify(A)+';\n');
 fs.unlinkSync(tmp);console.log(fs.statSync(OUT).size);})();
