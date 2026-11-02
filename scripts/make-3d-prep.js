/* Step 1 of the 3D logos: splits each flat logo into one traced outline per colour, written to brand/3d/layers.json.
   Step 2 is scripts/make-3d.cjs. Needs sharp and potrace, which are not app dependencies: npm i --no-save opentype.js@1.3.4 sharp@0.34.4 potrace@2.1.8 */
const fs=require('fs'),path=require('path'),sharp=require('sharp'),{Potrace}=require('potrace');
const ROOT=path.join(__dirname,'..'),B=path.join(ROOT,'brand'),GH=path.join(ROOT,'..');
const noBg=f=>Buffer.from(fs.readFileSync(f,'utf8').replace(/<!--[\s\S]*?-->/g,'').replace(/<rect width="512" height="512" rx="112" fill="#0f172a"\/>/,''));
const INK='#17262C',SEA='#2A9D8F',SEA2='#1F7F75',NAVY='#0F2A47',TEAL='#14808A',GOLD='#D19A22',BLUE='#1C4A78',WSEA='#5FE0CF',WSEA2='#2FB5A5',SOFT='#EEF3F7';
/* colours: [colour, depth, height above the plate, metal]. plate: a solid backing behind everything */
const LOGOS={
 'diskarte':{src:B+'/diskarte-logo.svg',colours:[[NAVY,.07,0,.25],[TEAL,.07,0,.3],[GOLD,.07,0,.55],[BLUE,.07,0,.3]]},
 'diskarte-mark':{src:B+'/diskarte-mark.svg',colours:[[NAVY,.1,0,.25],[TEAL,.1,0,.3],[GOLD,.1,0,.55],[BLUE,.1,0,.3]]},
 'diskarte-light':{src:B+'/diskarte-logo-white.svg',colours:[['#FFFFFF',.07,0,.35],[SOFT,.07,0,.35],[TEAL,.07,0,.3],[GOLD,.07,0,.55],[BLUE,.07,0,.3]]},
 'makinalabs':{src:B+'/makinalabs-logo.svg',colours:[[INK,.07,0,.35],[SEA,.09,0,.25],[SEA2,.09,0,.25]]},
 'makinalabs-mark':{src:B+'/makinalabs-mark.svg',colours:[[INK,.08,0,.35],[SEA,.12,0,.25],[SEA2,.12,0,.25]]},
 'makinalabs-light':{src:B+'/makinalabs-logo-white.svg',colours:[['#FFFFFF',.07,0,.55],[WSEA,.09,0,.25],[WSEA2,.09,0,.25]]},
 'makinalabs-mark-light':{src:B+'/makinalabs-mark-white.svg',colours:[['#FFFFFF',.08,0,.55],[WSEA,.12,0,.25],[WSEA2,.12,0,.25]]},
 'makinalabs-word-light':{src:B+'/makinalabs-wordmark-white.svg',colours:[['#FFFFFF',.05,0,.55],[WSEA,.05,0,.3]]},
 'purifier-simulator':{src:B+'/purifier-simulator-logo.svg',plate:'#0F2A47',colours:[['#D19A22',.05,.05,.6],['#0F2A47',.012,.05,.2],['#E7ECF5',.06,.07,.7],['#2FC4B2',.05,.07,.35]]},
 'fwg-simulator':{src:B+'/fwg-simulator-logo.svg',plate:'#0F2A47',colours:[['#1E9FD6',.05,.05,.4],['#0F2A47',.012,.05,.2],['#E7ECF5',.05,.07,.6],['#2FC4B2',.04,.07,.35],['#FFFFFF',.07,.08,.3]]},
 'tank-chief':{src:noBg(GH+'/tank-management/public/icons/icon.svg'),plate:'#1A2540',colours:[['#3AA0FF',.05,.05,.4],['#1A2540',.012,.05,.2],['#E6B34D',.04,.05,.6],['#E7ECF5',.06,.09,.7]]},
 'cheng-suite':{src:noBg(GH+'/voyage-manager/icons/icon.svg'),plate:'#1A2540',colours:[['#3AA0FF',.05,.05,.4],['#1A2540',.012,.05,.2],['#E6B34D',.04,.05,.6],['#E7ECF5',.05,.09,.7],['#F97316',.06,.05,.35],['#FFF7ED',.02,.07,.1],['#FDBA74',.03,.06,.3],['#0F172A',.03,.1,.5]]},
 };
/* Voyage Chief comes from a picture, so its discs are true circles and only the white art is traced */
const VOY={src:GH+'/Cheng-Pro/branding/icon.png',discs:[['#4A6178',345,348,205,.1,.3],['#F47521',675,348,201,.1,.35],['#30B5C8',512,677,185,.1,.3]]};
const circle=(x,y,r)=>{const k=r*.5523;return `M${x+r} ${y}C${x+r} ${y+k} ${x+k} ${y+r} ${x} ${y+r}C${x-k} ${y+r} ${x-r} ${y+k} ${x-r} ${y}C${x-r} ${y-k} ${x-k} ${y-r} ${x} ${y-r}C${x+k} ${y-r} ${x+r} ${y-k} ${x+r} ${y}Z`;};
const hex=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const trace=async(buf,w,h)=>{const png=await sharp(buf,{raw:{width:w,height:h,channels:1}}).png().toBuffer();return new Promise((ok,no)=>{const t=new Potrace();t.setParameters({threshold:128,turdSize:40,optTolerance:.35,alphaMax:1,blackOnWhite:true});t.loadImage(png,e=>{if(e)return no(e);const m=t.getPathTag().match(/ d="([^"]*)"/);/* potrace writes corners as one L with two points; spell them out so every loader keeps the corner */
ok(m?m[1].replace(/(\.\d)\d+/g,'$1').replace(/L\s*(-?[\d.]+)[ ,]+(-?[\d.]+)[ ,]+(-?[\d.]+)[ ,]+(-?[\d.]+)/g,'L$1 $2L$3 $4'):'');});});};
/* ONLY=name,name rebuilds those logos and keeps the rest of layers.json */
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null;
(async()=>{const out=ONLY?JSON.parse(fs.readFileSync(B+'/3d/layers.json','utf8')):{};for(const[name,L]of Object.entries(LOGOS)){if(ONLY&&!ONLY.includes(name))continue;const S=2048,{data}=await sharp(L.src,{density:400}).resize(S,S,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const pal=L.colours.map(c=>hex(c[0])),key=L.key?hex(L.key):null,n=S*S,rank=new Int8Array(n).fill(-1);
  for(let i=0;i<n;i++){const o=i*4;if(data[o+3]<128)continue;let b=-1,bd=1e9;for(let k=0;k<pal.length;k++){const q=pal[k],d=(q[0]-data[o])**2+(q[1]-data[o+1])**2+(q[2]-data[o+2])**2;if(d<bd){bd=d;b=k;}}if(key&&(key[0]-data[o])**2+(key[1]-data[o+1])**2+(key[2]-data[o+2])**2<bd)continue;rank[i]=b;}
  const layers=[];if(L.plate){const m=Buffer.alloc(n);for(let i=0;i<n;i++)m[i]=rank[i]>=0?0:255;layers.push({color:L.plate,d:await trace(m,S,S),z:0,depth:.05,metal:.35});}
  for(let k=0;k<L.colours.length;k++){const m=Buffer.alloc(n);for(let i=0;i<n;i++)m[i]=rank[i]===k?0:255;const d=await trace(m,S,S);if(d){const[c,depth,z,metal]=L.colours[k];layers.push({color:c,d,z,depth,metal});}}
  for(const l of layers){l.depth*=.42;l.z*=.42;}out[name]={size:S,layers};console.log(name,layers.length,JSON.stringify(layers).length);}
 if(!ONLY){const S=2048,k=S/1024,{data}=await sharp(VOY.src).resize(S,S).ensureAlpha().raw().toBuffer({resolveWithObject:true}),layers=[],n=S*S;let z=0;
  for(const[i,[c,x,y,r,dp,metal]]of VOY.discs.entries()){const depth=.03,cx=x*k,cy=y*k,R2=(r*k*.93)**2;layers.push({color:c,d:circle(cx,cy,r*k),z,depth,metal});const m=Buffer.alloc(n,255);for(let p=0;p<n;p++){const o=p*4,px=p%S,py=(p-px)/S;if((px-cx)**2+(py-cy)**2>R2)continue;let inside=true;for(const[,x2,y2,r2]of VOY.discs.slice(i+1))if((px-x2*k)**2+(py-y2*k)**2<(r2*k)**2)inside=false;if(inside&&data[o]>200&&data[o+1]>200&&data[o+2]>200)m[p]=0;}layers.push({color:'#FFFFFF',d:await trace(m,S,S),z:z+depth,depth:.014,metal:.3});z+=.012;}
  out['voyage-chief']={size:S,layers};console.log('voyage-chief',layers.length,JSON.stringify(layers).length);}
 fs.mkdirSync(B+'/3d',{recursive:true});fs.writeFileSync(B+'/3d/layers.json',JSON.stringify(out));})();
