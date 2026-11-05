/* Tiny headless-Chrome driver for the DK checks. No dependencies: it talks the DevTools protocol over Node's built-in WebSocket. */
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path');
const CHROME=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function launch(port=9333){
 if(!CHROME)throw new Error('No Chrome or Edge found');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dkchrome-')),proc=spawn(CHROME,['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+dir,'--no-first-run','--no-default-browser-check','--disable-extensions','--allow-file-access-from-files','--hide-scrollbars','--mute-audio','about:blank'],{stdio:'ignore'});
 let ok=false;for(let i=0;i<60&&!ok;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/json/version');ok=r.ok;}catch(e){await sleep(250);}}
 if(!ok){proc.kill();throw new Error('Chrome did not start');}
 const close=()=>{try{proc.kill();}catch(e){}try{fs.rmSync(dir,{recursive:true,force:true});}catch(e){}};
 return{port,close,newPage:()=>newPage(port)};
}
async function newPage(port){
 const t=await (await fetch('http://127.0.0.1:'+port+'/json/new?about:blank',{method:'PUT'})).json(),ws=new WebSocket(t.webSocketDebuggerUrl);
 await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
 let id=0;const wait={},logs=[],errs=[];
 ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&wait[d.id]){wait[d.id](d);delete wait[d.id];}
  else if(d.method==='Runtime.exceptionThrown')errs.push((d.params.exceptionDetails.exception&&d.params.exceptionDetails.exception.description)||d.params.exceptionDetails.text);
  else if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')logs.push(d.params.args.map(a=>a.value||a.description).join(' '));};
 const send=(method,params={})=>new Promise(res=>{const i=++id;wait[i]=res;ws.send(JSON.stringify({id:i,method,params}));});
 await send('Runtime.enable');await send('Page.enable');
 const api={errs,logs,send,
  async open(url,o={}){const w=o.w||1366,h=o.h||768;await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:o.dpr||1,mobile:!!o.mobile});await send('Emulation.setTouchEmulationEnabled',{enabled:!!o.mobile,maxTouchPoints:o.mobile?5:0});
   if(o.mobile)await send('Emulation.setEmitTouchEventsForMouse',{enabled:true,configuration:'mobile'});
   if(o.clear){await send('Page.navigate',{url:'about:blank'});}
   await send('Page.navigate',{url});await sleep(o.wait||1800);},
  async eval(expr){const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});if(r.result&&r.result.exceptionDetails)throw new Error('eval: '+(r.result.exceptionDetails.exception&&r.result.exceptionDetails.exception.description||r.result.exceptionDetails.text)+'\n'+expr.slice(0,200));return r.result&&r.result.result?r.result.result.value:undefined;},
  async shot(file,o={}){const r=await send('Page.captureScreenshot',Object.assign({format:'png'},o));fs.writeFileSync(file,Buffer.from(r.result.data,'base64'));return file;},
  async click(sel){const p=await api.eval('(()=>{const e=document.querySelector('+JSON.stringify(sel)+');if(!e)return null;const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]})()');if(!p)throw new Error('no element '+sel);
   await send('Input.dispatchMouseEvent',{type:'mousePressed',x:p[0],y:p[1],button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p[0],y:p[1],button:'left',clickCount:1});},
  async drag(x0,y0,x1,y1,steps=8){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x0,y:y0});await send('Input.dispatchMouseEvent',{type:'mousePressed',x:x0,y:y0,button:'left',clickCount:1});
   for(let i=1;i<=steps;i++)await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x0+(x1-x0)*i/steps,y:y0+(y1-y0)*i/steps,button:'left',buttons:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x1,y:y1,button:'left',clickCount:1});},
  close:()=>{try{ws.close();}catch(e){}fetch('http://127.0.0.1:'+port+'/json/close/'+t.id).catch(()=>{});},sleep};
 return api;}
module.exports={launch,sleep,CHROME};
