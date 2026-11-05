/* Fills www/ for the Android and Windows apps: the 3D dashboard, the desktop pages, and the phone pages with their shell. Everything works offline: Google Fonts is swapped for bundled copies. */
const fs=require('fs'),path=require('path'),esbuild=require('esbuild');
const ROOT=path.join(__dirname,'..'),SRC=path.join(ROOT,'src'),WWW=path.join(ROOT,'www'),SIM_VAULT='C:/Users/ts0gs/project-mind/vault/projects/upaw/',SIM_REPO=path.join(ROOT,'sim-source')+path.sep;
/* Vault first (owner live edits), else sim-source in this repo. Missing purifier/fwg on cloud is OK — skip those pages. */
const simFile=f=>{const a=path.join(SIM_VAULT,f),b=path.join(SIM_REPO,f);if(fs.existsSync(a))return a;if(fs.existsSync(b))return b;return null;};
const S=f=>fs.readFileSync(path.join(SRC,'shared',f),'utf8'),wsCss=S('ws.css'),wsPhone=S('ws-phone.css'),wsJs=S('ws.js').replace('__STAMP__',()=>S('makinalabs-wordmark.svg').replace(/"/g,"'").replace(/ width='\d+' height='\d+'/,''));
/* The phone sheet is always in the page but switched off (media="not all"). dk-pre.js picks phone or desktop from the device when the page opens, so one page serves both; `phone` here is only the default used inside the apps (?app=1). The DK companion layer (dk-data.js, dk.js, dk.css) goes in after the workspace. */
/* Each page carries only its own plant's DK data (alarm advice, lessons, quiz, safety, fidelity). The purifier and FWG pages, which go on the website, hold no boiler text. */
const vm=require('vm'),dkAll=vm.runInNewContext(S('dk-data.js')+'\n'+S('dk-where.js')+'\n'+S('dk-quiz.js')+';DK_DATA.where=DK_WHERE;DK_DATA.quizBank=DK_QUIZ;DK_DATA'),DKPL=['pur','fwg','boiler'];
const dkData=plant=>{const o={};for(const k in dkAll){const v=dkAll[k];if(v&&typeof v==='object'&&!Array.isArray(v)&&DKPL.some(p=>p in v)){o[k]={};for(const kk in v)if(!DKPL.includes(kk)||kk===plant)o[k][kk]=v[kk];}else o[k]=v;}
 return 'var DK_DATA='+JSON.stringify(o,(k,v)=>Object.prototype.toString.call(v)==='[object RegExp]'?'@@RE'+v.toString()+'@@':v).replace(/"@@RE(.*?)@@"/g,(m,s)=>JSON.parse('"'+s+'"'))+';';};
const dkPre=S('dk-pre.js'),dkCss=S('dk.css'),dkCode=S('dk.js');
const lay=(t,phone,plant)=>{const dkJs=dkData(plant)+'\n'+dkCode;const i=t.lastIndexOf('</script>');return t.slice(0,i+9)+'\n<style>'+wsCss+'</style>\n<style id="dkPhoneCss" media="not all">'+wsPhone+'</style>\n<script>\n'+dkPre+'\nwindow.WS_PHONE=DK_PRE.pick('+phone+');if(window.WS_PHONE)document.getElementById("dkPhoneCss").media="all";\n'+wsJs+'</script>\n<style>'+dkCss+'</style>\n<script>\n'+dkJs+'</script>\n'+t.slice(i+9);};
fs.rmSync(WWW,{recursive:true,force:true});fs.mkdirSync(path.join(WWW,'fonts'),{recursive:true});

const FONTS=[['barlow','Barlow',[400,500,600]],['barlow-condensed','Barlow Condensed',[500,600,700]],['share-tech-mono','Share Tech Mono',[400]]];
let faces='';
for(const [pkg,family,weights] of FONTS)for(const w of weights){
 const f=`${pkg}-latin-${w}-normal.woff2`;
 fs.copyFileSync(path.join(ROOT,'node_modules/@fontsource',pkg,'files',f),path.join(WWW,'fonts',f));
 faces+=`@font-face{font-family:"${family}";font-weight:${w};font-display:swap;src:url(${f}) format("woff2")}\n`;}
fs.writeFileSync(path.join(WWW,'fonts/fonts.css'),faces);
const offline=t=>{const out=t.replace(/<link rel="preconnect"[^>]*>\n?/g,'').replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/,'<link rel="stylesheet" href="fonts/fonts.css">');if(/googleapis/.test(out))throw new Error('Google Fonts link left in page');return out;};
const page=b=>'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+b+'</body></html>';

for(const [src,out,desk] of [['purifier-simulator.html','mobile-purifier.html','purifier.html'],['fwg-simulator.html','mobile-fwg.html','fwg-simulator-app.html'],['boiler-simulator.html','mobile-boiler.html','boiler-simulator-app.html']]){
 const pathSrc=simFile(src);if(!pathSrc){console.warn('skip missing simulator '+src);continue;}
 const raw=fs.readFileSync(pathSrc,'utf8').replace(/\r\n/g,'\n').replace('<meta name="claude:viewport-fit-sides" content="cover">\n','');
 const plant={'purifier-simulator.html':'pur','fwg-simulator.html':'fwg','boiler-simulator.html':'boiler'}[src],d=lay(raw,false,plant),t=lay(raw,true,plant);
 try{fs.writeFileSync(path.join(SIM_VAULT,'app-'+desk),d);fs.writeFileSync(path.join(SIM_VAULT,out),page(t));}catch(e){}
 fs.writeFileSync(path.join(WWW,desk),page(offline(d)));
 fs.writeFileSync(path.join(WWW,out),page(offline(t)));
 /* Keep the sim-source mirror of the hand-edited sources (FWG, boiler) when the vault was the read path, so the cloud can build them.
    The purifier page is generated from src/purifier, so it is not mirrored. Paths are resolved first: the vault path uses / and path.join gives \ on Windows. */
 try{if(src!=='purifier-simulator.html'&&path.resolve(pathSrc).startsWith(path.resolve(SIM_VAULT))){fs.mkdirSync(SIM_REPO,{recursive:true});fs.writeFileSync(path.join(SIM_REPO,src),raw);}}catch(e){}}

/* dashboard: three.js is bundled with the code, split so the cards show before the 3D loads */
esbuild.buildSync({entryPoints:[path.join(SRC,'home','home.js')],bundle:true,minify:true,format:'esm',splitting:true,chunkNames:'home-[name]-[hash]',outdir:WWW,target:['es2020'],legalComments:'none'});
for(const f of ['index.html','home.css'])fs.copyFileSync(path.join(SRC,'home',f),path.join(WWW,f));
fs.copyFileSync(path.join(SRC,'shared','logo.svg'),path.join(WWW,'logo.svg'));for(const n of ['diskarte-logo.svg','makinalabs-logo.svg','makinalabs-wordmark.svg','purifier-simulator-logo.svg','fwg-simulator-logo.svg','boiler-simulator-logo.svg'])fs.copyFileSync(path.join(SRC,'shared',n),path.join(WWW,n));
fs.rmSync(path.join(WWW,'purifier-panels'),{recursive:true,force:true});
console.log('www ready');
