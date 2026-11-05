/* turns the bowl PNGs into SVG path data, written to src/purifier/bowlart.js. Needs potrace and pngjs, which are not app dependencies: npm i --no-save potrace@2.1.8 pngjs@7.0.0 */
const T='',fs=require('fs'),{PNG}=require(T+'pngjs'),{Potrace}=require(T+'potrace');
const D='C:/Users/ts0gs/project-mind/vault/projects/upaw/purifier-panels/',OUT='C:/Users/ts0gs/Documents/GitHub/Engine-Room-Simulators/src/purifier/bowlart.js';
const rd=n=>PNG.sync.read(fs.readFileSync(D+n+'.png'));
const tmp='./_t.png';
const round=d=>d.replace(/-?\d+\.\d+/g,v=>{const r=(+v).toFixed(1);return r.endsWith('.0')?r.slice(0,-2):r;}).replace(/\s*([MLCZ])\s*/g,'$1').replace(/, /g,' ').replace(/,/g,' ');
function trace(w,h,on,opt={}){const o=new PNG({width:w,height:h});for(let i=0;i<w*h;i++){const v=on(i)?0:255;o.data[i*4]=o.data[i*4+1]=o.data[i*4+2]=v;o.data[i*4+3]=255;}fs.writeFileSync(tmp,PNG.sync.write(o));
 return new Promise((ok,no)=>{const t=new Potrace();t.setParameters({threshold:128,turdSize:opt.turd??4,optTolerance:opt.tol??.4,alphaMax:opt.alpha??1,blackOnWhite:true});t.loadImage(tmp,e=>{if(e)return no(e);const m=t.getPathTag().match(/ d="([^"]*)"/);ok(m?round(m[1]):'');});});}
const hex=c=>'#'+c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
const lum=c=>.3*c[0]+.59*c[1]+.11*c[2];
function kmeans(P,K){let C=[];for(let i=0;i<K;i++)C.push(P[Math.floor((i+.5)*P.length/K)].slice());for(let it=0;it<14;it++){const S=C.map(()=>[0,0,0,0]);for(const p of P){let b=0,bd=1e9;for(let k=0;k<K;k++){const c=C[k],d=(c[0]-p[0])**2+(c[1]-p[1])**2+(c[2]-p[2])**2;if(d<bd){bd=d;b=k;}}const s=S[b];s[0]+=p[0];s[1]+=p[1];s[2]+=p[2];s[3]++;}C=C.map((c,k)=>S[k][3]?[S[k][0]/S[k][3],S[k][1]/S[k][3],S[k][2]/S[k][3]]:c);}return C.sort((a,b)=>lum(b)-lum(a));}
const px=(p,i)=>[p.data[i*4],p.data[i*4+1],p.data[i*4+2],p.data[i*4+3]];
const white=c=>c[0]>246&&c[1]>246&&c[2]>246;
const dark=c=>Math.max(c[0],c[1],c[2])<120;
const inked=c=>c[3]>128;
/* a coloured picture becomes stacked flat layers, each laid over the lighter ones so no gaps open between them */
async function layers(p,K){const w=p.width,h=p.height,S=[];for(let i=0;i<w*h;i+=7){const c=px(p,i);if(inked(c)&&!white(c)&&!dark(c))S.push(c.slice(0,3));}const C=kmeans(S,K),rank=new Int8Array(w*h).fill(-1);
 for(let i=0;i<w*h;i++){const c=px(p,i);if(!inked(c)||white(c))continue;let b=0,bd=1e9;for(let k=0;k<K;k++){const q=C[k],d=(q[0]-c[0])**2+(q[1]-c[1])**2+(q[2]-c[2])**2;if(d<bd){bd=d;b=k;}}rank[i]=b;}
 for(let pass=0;pass<3;pass++){const o=rank.slice();for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){const i=y*w+x,n={};let best=rank[i],bc=0;for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const v=rank[i+a*w+b];const c=n[v]=(n[v]||0)+1;if(c>bc){bc=c;best=v;}}o[i]=best;}rank.set(o);}
 const R=[];for(let k=0;k<K;k++){const d=await trace(w,h,i=>rank[i]>=k,{turd:60,tol:1.2,alpha:1.1});if(d)R.push([hex(C[k]),d.replace(/\.\d/g,'')]);}return R;}
const line=p=>trace(p.width,p.height,i=>{const c=px(p,i);return inked(c)&&dark(c);},{turd:8,tol:.5,alpha:.9});
const solid=p=>trace(p.width,p.height,i=>inked(px(p,i)),{turd:6,tol:.5});
const mask=(n)=>{const p=rd(n);return trace(p.width,p.height,i=>px(p,i)[0]>127,{turd:6,tol:.5,alpha:.8});};
(async()=>{const A={};
 for(const[x,col]of[['s',1],['p',1],['j',1]]){const b=rd(`bowl-${x}-base`),sl=rd(`bowl-${x}-slide`),a={line:await line(b),slideLine:await line(sl)};
  a.fill=col?await layers(b,10):[];
  a.slideFill=x!=='s'?await layers(sl,6):[['#fff',await solid(sl)]];
  a.clip={main:await mask(`bowl-${x}-m-main`),hood:await mask(`bowl-${x}-m-hood`),clean:await mask(`bowl-${x}-m-clean`),feed:await mask(`bowl-${x}-m-feed`)};
  if(x==='p')a.clip.tank=await mask('bowl-p-m-tank');
  if(x==='j'){for(const k of['pl','pr']){const q=rd(`bowl-j-${k}`);a[k]={fill:await layers(q,4),line:await line(q)};}}
  A[x]=a;console.log(x,JSON.stringify(a).length);}
 fs.writeFileSync(OUT,'/* --- bowl drawings as vector paths: flat colour layers, moving parts, line work and the passages the liquids fill. Traced once from the section drawings; nothing here is a picture. --- */\nconst BOWLART='+JSON.stringify(A)+';\n');
 fs.unlinkSync(tmp);console.log(fs.statSync(OUT).size);})();
