/* --- DK layout picker. Runs before ws.js. The phone or desktop layout is chosen from the device when the page opens, not from which file was opened. ?layout=phone or ?layout=desktop forces one. Inside the apps (?app=1) the build's own default stays. --- */
var DK_PRE=(function(){
 const Q=new URLSearchParams(location.search),mm=s=>{try{return matchMedia(s).matches;}catch(e){return false;}};
 function detect(){
  const coarse=mm('(pointer:coarse)')||(mm('(any-pointer:coarse)')&&!mm('(any-pointer:fine)')),
   sw=(window.screen&&screen.width)||innerWidth,sh=(window.screen&&screen.height)||innerHeight,short=Math.min(sw,sh),
   narrow=innerWidth<=640,
   cls=coarse&&short<=600||narrow?'phone':coarse&&short<=1100?'tablet':'desktop';
  /* the pop-up layout suits phones and small tablets; a big tablet or a laptop gets the tabbed workspace */
  return{cls,coarse,short,layoutPhone:(coarse&&short<=820)||narrow};
 }
 function pick(def){
  const L=Q.get('layout');if(L==='phone')return true;if(L==='desktop')return false;
  if(/[?&]app=1/.test(location.search))return !!def;
  return detect().layoutPhone;
 }
 return{detect,pick,query:Q};
})();
