/* scratch probe: print the live state of one expression in one page.
   node scripts/dk-probe.cjs <page-in-www | http://url> "<expr>" [phone] */
const {launch}=require('./dk-cdp.cjs'),path=require('path');
(async()=>{const b=await launch(9460);try{const p=await b.newPage();const f=process.argv[2],ph=process.argv[4]==='phone';
 const url=/^https?:/.test(f)?f:'file:///'+path.resolve(__dirname,'..','www',f).replace(/\\/g,'/')+'?dk=quiet';
 await p.open(url,ph?{w:390,h:844,mobile:true,dpr:2,wait:2500}:{wait:3000});
 console.log(JSON.stringify(await p.eval(process.argv[3]),null,1));console.log('ERRS',JSON.stringify(p.errs));p.close();}finally{b.close();}})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
