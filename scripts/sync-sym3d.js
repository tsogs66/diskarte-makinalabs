/* copies src/shared/sym3d.js into the hand-edited FWG and boiler pages (vault copies, which the build mirrors into sim-source).
   The block sits between the SYM3D markers; the first run places it before the anchor line. */
const fs=require('fs'),path=require('path');
const V='C:/Users/ts0gs/project-mind/vault/projects/upaw/',sym=fs.readFileSync(path.join(__dirname,'..','src','shared','sym3d.js'),'utf8');
const blk='/*SYM3D*/\n'+sym.trim()+'\n/*SYM3D-END*/\n';
for(const[f,anchor]of[['boiler-simulator.html','const MIMIC_IDS='],['fwg-simulator.html','function pumpSvg(']]){
  let t=fs.readFileSync(V+f,'utf8');const a=t.indexOf('/*SYM3D*/'),b=t.indexOf('/*SYM3D-END*/\n');
  if(a>=0&&b>a)t=t.slice(0,a)+blk+t.slice(b+14);
  else{const i=t.indexOf(anchor);if(i<0)throw new Error(f+': anchor not found');t=t.slice(0,i)+blk+t.slice(i);}
  fs.writeFileSync(V+f,t);console.log('sym3d →',f);}
