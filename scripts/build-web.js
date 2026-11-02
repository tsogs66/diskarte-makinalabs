/* Fills www/ for the Android and Windows apps: the 3D dashboard, the desktop pages, and the phone pages with their shell. Everything works offline: Google Fonts is swapped for bundled copies. */
const fs=require('fs'),path=require('path'),esbuild=require('esbuild');
const ROOT=path.join(__dirname,'..'),SRC=path.join(ROOT,'src'),WWW=path.join(ROOT,'www'),SIM='C:/Users/ts0gs/project-mind/vault/projects/upaw/';
const S=f=>fs.readFileSync(path.join(SRC,'shared',f),'utf8'),wsCss=S('ws.css'),wsPhone=S('ws-phone.css'),wsJs=S('ws.js').replace('__STAMP__',()=>S('makinalabs-wordmark.svg').replace(/"/g,"'").replace(/ width='\d+' height='\d+'/,''));
const lay=(t,phone)=>{const i=t.lastIndexOf('</script>');return t.slice(0,i+9)+'\n<style>'+wsCss+(phone?wsPhone:'')+'</style>\n<script>\nwindow.WS_PHONE='+phone+';\n'+wsJs+'</script>\n'+t.slice(i+9);};
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

for(const [src,out,desk] of [['purifier-simulator.html','mobile-purifier.html','purifier.html'],['fwg-simulator.html','mobile-fwg.html','fwg-simulator-app.html']]){
 const raw=fs.readFileSync(SIM+src,'utf8').replace(/\r\n/g,'\n').replace('<meta name="claude:viewport-fit-sides" content="cover">\n','');
 const d=lay(raw,false),t=lay(raw,true);
 fs.writeFileSync(SIM+'app-'+desk,d);
 fs.writeFileSync(path.join(WWW,desk),page(offline(d)));
 fs.writeFileSync(SIM+out,page(t));
 fs.writeFileSync(path.join(WWW,out),page(offline(t)));}

/* dashboard: three.js is bundled with the code, split so the cards show before the 3D loads */
esbuild.buildSync({entryPoints:[path.join(SRC,'home','home.js')],bundle:true,minify:true,format:'esm',splitting:true,chunkNames:'home-[name]-[hash]',outdir:WWW,target:['es2020'],legalComments:'none'});
for(const f of ['index.html','home.css'])fs.copyFileSync(path.join(SRC,'home',f),path.join(WWW,f));
fs.copyFileSync(path.join(SRC,'shared','logo.svg'),path.join(WWW,'logo.svg'));for(const n of ['diskarte-logo.svg','makinalabs-logo.svg','makinalabs-wordmark.svg','purifier-simulator-logo.svg','fwg-simulator-logo.svg'])fs.copyFileSync(path.join(SRC,'shared',n),path.join(WWW,n));
fs.rmSync(path.join(WWW,'purifier-panels'),{recursive:true,force:true});
console.log('www ready');
