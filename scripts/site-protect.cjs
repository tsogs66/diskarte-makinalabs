/* Website build for makinalabs.net: only the purifier and FWG simulators, each locked to the domain, marked and scrambled.
   usage: OBF=<folder holding node_modules/javascript-obfuscator> node scripts/site-protect.cjs <outDir> [test]
   test also allows localhost, for checking before the real build. Deploy <outDir> with wrangler pages deploy (see the upaw Changelog). */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const SP=require('path').dirname(process.argv[2]),SRC='C:/Users/ts0gs/project-mind/vault/projects/upaw',OUT=process.argv[2],TEST=process.argv[3]==='test';
const O=require((process.env.OBF?process.env.OBF+'/node_modules/':'')+'javascript-obfuscator');
const PAGES=['app-purifier.html','app-fwg-simulator-app.html','mobile-purifier.html','mobile-fwg.html'];
const DOMAINS=['makinalabs.net','.makinalabs.net','makinalabs.pages.dev','.makinalabs.pages.dev'].concat(TEST?['localhost']:[]);
const YEAR=2026,DATE='20261105';
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
/* zero-width encoding of the build id: invisible in the page, survives copy and paste of the notice */
const zw=s=>[...Buffer.from(s)].map(b=>b.toString(2).padStart(8,'0').replace(/0/g,'\u200b').replace(/1/g,'\u200c')).join('')+'\u200d';
const NOTICE=`© ${YEAR} MakinaLabs. All rights reserved. Diskarte simulators may be used on makinalabs.net only; copying, downloading, re-hosting, modifying or reverse engineering them is prohibited.`;
const rec=[],NO3D={};
for(const p of PAGES){
  let t=fs.readFileSync(path.join(SRC,p),'utf8');
  const id=`MKL-${DATE}-${crypto.randomBytes(4).toString('hex')}`;
  /* the app pages carry no wrapper: give them a doctype, charset and viewport */
  if(!/^<!doctype/i.test(t.trimStart()))t=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>`+t+`</body></html>`;
  /* scramble every inline script; the build id rides inside the scrambled strings */
  let n=0;
  t=t.replace(/<script>([\s\S]*?)<\/script>/g,(m,js)=>{n++;if(js.includes('const ISOV={p605:1,p626:1,s826:1,sj30g:1,sj30gh:1};'))NO3D[p]=1;
    /* website: no 3D view, so the switch never shows and a stored choice is ignored */
    js=js.replace('const ISOV={p605:1,p626:1,s826:1,sj30g:1,sj30gh:1};','const ISOV={};').replace("const isoOn=()=>{try{return localStorage.getItem('pur.iso')==='1';}catch(e){return false;}};",'const isoOn=()=>false;');
    const src=`var __mkl_b=${JSON.stringify(id)};`+js;
    const out=O.obfuscate(src,{compact:true,simplify:true,target:'browser',identifierNamesGenerator:'hexadecimal',renameGlobals:false,
      /* no base64 on the string array: with the companion layer's many long strings it made the FWG page take 11 s to start (0.5 s without). The strings stay moved out, shuffled and rotated. */
      stringArray:true,stringArrayEncoding:[],stringArrayThreshold:0.75,stringArrayRotate:true,stringArrayShuffle:true,stringArrayWrappersCount:1,
      reservedStrings:['^data:','^[A-Za-z0-9+/=]{200,}$'],controlFlowFlattening:false,deadCodeInjection:false,selfDefending:true,transformObjectKeys:false,unicodeEscapeSequence:false,
      domainLock:DOMAINS,domainLockRedirectUrl:'https://makinalabs.net/#licence',seed:crypto.randomInt(1,2**30)}).getObfuscatedCode();
    return '<script>'+out.replace(/<\/script/gi,'<\\/script')+'</script>';});
  if(n<1)throw new Error('no scripts in '+p);
  if(/purifier/.test(p)&&!NO3D[p])throw new Error('3D view not removed from '+p);
  /* legal: notice in the source, copyright meta, and a small visible line with the hidden build id */
  t=t.replace(/^<!doctype html>/i,`<!doctype html>\n<!-- ${NOTICE} Build ${id}. -->\n`);
  t=t.replace('<head>','<head><meta name="copyright" content="© '+YEAR+' MakinaLabs. All rights reserved.">');
  t=t.replace(/<\/body>\s*<\/html>\s*$/,`<div id="mklNotice" aria-hidden="true" style="position:fixed;left:8px;bottom:4px;z-index:2147483000;font:10px/1.2 Barlow,Arial,sans-serif;color:#8fa3a8;opacity:.75;pointer-events:none;user-select:none">© ${YEAR} MakinaLabs · All rights reserved${zw(id)}</div>\n</body></html>`);
  fs.writeFileSync(path.join(OUT,p),t);
  rec.push({page:p,build:id,bytes:Buffer.byteLength(t),sha256:crypto.createHash('sha256').update(t).digest('hex')});
}
/* the rest of the site: home page and its assets only */
fs.copyFileSync(path.join(SRC,'index.html'),path.join(OUT,'index.html'));
fs.cpSync(path.join(SRC,'site'),path.join(OUT,'site'),{recursive:true});
/* no framing by other sites */
fs.writeFileSync(path.join(OUT,'_headers'),`/*\n  Content-Security-Policy: frame-ancestors 'self'\n  X-Frame-Options: SAMEORIGIN\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
fs.writeFileSync(path.join(SP,'site-builds'+(TEST?'-test':'')+'.json'),JSON.stringify(rec,null,1));
console.log(JSON.stringify(rec,null,1));
