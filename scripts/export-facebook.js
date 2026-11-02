/* Shrinks the double-size renders from make-facebook.cjs with a sharp filter.
   brand/facebook/set-*: 3280 x 1848 banners and 2048 px profiles, the master art.
   brand/facebook/chosen: what to upload. Facebook keeps a PNG far cleaner when it is 2048 px or less across and under about 1 MB, so these are made to fit that. */
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const F=path.join(__dirname,'..','brand','facebook'),C=path.join(F,'chosen'),CHOSEN='set-1-ocean';
const fit=async(src,w,h,out)=>{const b=await sharp(src).resize(w,h,{kernel:'lanczos3'}).sharpen({sigma:.5}).png({compressionLevel:9,effort:10}).toBuffer();fs.writeFileSync(out,b);console.log(path.basename(out),w+'x'+h,Math.round(b.length/1024)+' KB');};
(async()=>{for(const f of fs.readdirSync(F).filter(n=>/-2x\.png$/.test(n))){const p=path.join(F,f),o=p.replace('-2x.png','.png'),{width}=await sharp(p).metadata();fs.writeFileSync(o,await sharp(p).resize(width/2,null,{kernel:'lanczos3'}).png({compressionLevel:9}).toBuffer());}
 const q=path.join(F,CHOSEN);await fit(q+'-banner-2x.png',2048,1154,path.join(C,'makinalabs-facebook-banner.png'));await fit(q+'-profile-2x.png',1024,1024,path.join(C,'makinalabs-facebook-profile.png'));
 for(const f of fs.readdirSync(F).filter(n=>/-2x\.png$/.test(n)))fs.unlinkSync(path.join(F,f));})();
