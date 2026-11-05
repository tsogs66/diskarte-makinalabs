const fs=require('fs'),path=require('path');const D=__dirname;const rd=f=>fs.readFileSync(path.join(D,f),'utf8');
const sh=fs.readFileSync(path.join(D,'..','shell.html'),'utf8');const SH=f=>fs.readFileSync(path.join(D,'..','shared',f),'utf8');
const a=sh.indexOf('<style>'),b=sh.indexOf('</style>');
const css=sh.slice(a+7,b).replace(/Layout:[\s\S]*?\*\//,`Layout: engine-room control cabinet. Enamel panel face, system mimic in the middle,
   procedure on the left, control unit and annunciator on the right, starters and valve block below.
   Single deliberate look in every viewer theme. */`);
const head=`<title>Oil Purifier Simulator</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&family=Share+Tech+Mono&display=swap">
<style>${css}
${rd('extra.css')}
${SH('polish.css')}</style>
`;
const js=rd('model.js').replace(/if\(typeof module[^\n]*\n/,'')+rd('data.js')+rd('kit.js')+rd('ui1.js')+rd('mimic2.js')+SH('sym3d.js')+rd('mimic3.js')+rd('bowlart.js')+rd('bowlimg.js')+rd('bowl3.js')+rd('mimic4.js')+rd('iso.js')+rd('bowl2.js')+rd('ui2.js')+rd('ui3.js')+rd('faces.js')+rd('panels.js')+rd('epc50menu.js')+SH('chrome.js')+'addEventListener("DOMContentLoaded",()=>0);\nchrome('+JSON.stringify(SH('info-purifier.html'))+',"pur");\n'+rd('ui4.js');
new Function(js);
const html=head+rd('body.html')+'<script>\n'+js+'</script>\n';
const out='C:/Users/ts0gs/project-mind/vault/projects/upaw/purifier-simulator.html';
fs.writeFileSync(out,html);
const hook="window.__p={reset(k){UNITS[k]=mkUnit(k);switchUnit(k);},get hist(){return hist;},get s(){return s;},get u(){return u;},get f(){return f;},get M(){return M;},DR,jumpRun,startDrill,switchUnit,loadFuel,pressSep,lcdKey,setMotor,setPump,setHeater,autoStart,autoStop,pressDis,resetAl,runAuto,steps,typed:()=>typed,applyAct,renderDx,tab,ff(sec){for(let i=0;i<sec*4;i++)simStep(.25);render();},setAuto(v){auto=v;},KEYS:()=>KEYS,epc50,epc60,sgKey};";
fs.writeFileSync(path.join(D,'preview.html'),'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+html.replace('init();\n</script>',()=>'init();\n'+hook+'\n</script>')+'</body></html>');
console.log('built',html.length);
