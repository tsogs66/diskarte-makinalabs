/* Draws the Diskarte and MakinaLabs logos as vector art in brand/, with every letter as an outline so no font is needed.
   The D of DISKARTE is the right half of the puzzle gear; the M of MakinaLabs is the ship seen from ahead.
   Needs opentype.js and sharp, which are not app dependencies: npm i --no-save opentype.js@1.3.4 sharp@0.34.4 */
const fs=require('fs'),path=require('path'),op=require('opentype.js'),sharp=require('sharp');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'brand'),SH=path.join(ROOT,'src','shared'),RES=path.join(ROOT,'android','app','src','main','res');
const buf=fs.readFileSync(path.join(ROOT,'node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff'));
const font=op.parse(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength));
const NAVY='#0F2A47',TEAL='#14808A',GOLD='#D19A22',BLUE='#1C4A78',INK='#17262C',SEA='#2A9D8F';
const word=(t,x,y,size,track=0)=>{let d='',X=x;for(const g of font.stringToGlyphs(t)){d+=g.getPath(X,y,size).toPathData(1);X+=g.advanceWidth/font.unitsPerEm*size+track;}return{d,w:X-x-track};};
const svg=(w,h,inner)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;

/* the gear of four puzzle pieces, centre 250 195 */
const GEAR='M229.7 66.6L232.8 30.9L267.2 30.9L270.3 66.6L296.6 73.6L317.1 44.3L347 61.5L331.8 94L351 113.2L383.5 98L400.7 127.9L371.4 148.4L378.4 174.7L414.1 177.8L414.1 212.2L378.4 215.3L371.4 241.6L400.7 262.1L383.5 292L351 276.8L331.8 296L347 328.5L317.1 345.7L296.6 316.4L270.3 323.4L267.2 359.1L232.8 359.1L229.7 323.4L203.4 316.4L182.9 345.7L153 328.5L168.2 296L149 276.8L116.5 292L99.3 262.1L128.6 241.6L121.6 215.3L85.9 212.2L85.9 177.8L121.6 174.7L128.6 148.4L99.3 127.9L116.5 98L149 113.2L168.2 94L153 61.5L182.9 44.3L203.4 73.6Z';
/* seams between the pieces are real gaps, cut with a mask, so the art is transparent */
const P4=[['M80 25H250V89.6C311.2 55.6 311.2 164.4 250 130.4V195H185.4C219.4 256.2 110.6 256.2 144.6 195H80Z',NAVY],['M250 25H420V195H355.4C389.4 256.2 280.6 256.2 314.6 195H250V130.4C311.2 164.4 311.2 55.6 250 89.6Z',TEAL],['M80 195H144.6C110.6 256.2 219.4 256.2 185.4 195H250V259.6C311.2 225.6 311.2 334.4 250 300.4V365H80Z',GOLD],['M250 195H314.6C280.6 256.2 389.4 256.2 355.4 195H420V365H250V300.4C311.2 334.4 311.2 225.6 250 259.6Z',BLUE]];
const pieces=(id,c0)=>`<mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="400"><rect width="500" height="400" fill="#fff"/>${P4.map(([d])=>`<path d="${d}" fill="none" stroke="#000" stroke-width="6"/>`).join('')}</mask><g mask="url(#${id}m)">${P4.map(([d,c],i)=>`<path d="${d}" fill="${i||!c0?c:c0}"/>`).join('')}</g>`;
const gear=(id,c0)=>`<clipPath id="${id}"><path d="${GEAR}" transform="rotate(15 250 195)"/></clipPath><g clip-path="url(#${id})">${pieces(id,c0)}</g>`;
/* the D: only the right half of the gear, cut straight down the middle */
const gearD=(id,c0)=>`<clipPath id="${id}a"><path d="${GEAR}" transform="rotate(15 250 195)"/></clipPath><clipPath id="${id}b"><rect x="250" y="0" width="200" height="400"/></clipPath><g clip-path="url(#${id}b)"><g clip-path="url(#${id}a)">${pieces(id,c0)}</g></g>`;

/* the ship from ahead: the superstructure makes the shoulders of the M, the two sides of the hull are its legs */
const shipM=(x,y,h,ink=INK,sea=SEA)=>{const k=h/100,T=`translate(${x} ${y}) scale(${k})`;return `<g transform="${T}"><path d="M0 0H27L50 33L73 0H100V57L50 37L0 57Z" fill="${ink}"/><path d="M0 64L45 46V100H15Z" fill="${sea}"/><path d="M100 64L55 46V100H85Z" fill="${sea}"/></g>`;};
const shipMark=(ink=INK,s1=SEA,s2='#1F7F75')=>`<path d="M143 145Q143 135 153 135H347Q357 135 357 145V279H143Z" fill="none" stroke="${ink}" stroke-width="11"/><path fill-rule="evenodd" d="M125 285H375Q375 298 360 298H140Q125 298 125 285ZM222 285L228 291H272L278 285Z" fill="${ink}"/><path d="M245 157H255V183H288L296 221L250 204L204 221L212 183H245Z" fill="${ink}"/><path d="M191 228L248 207V268H208Z" fill="${s1}"/><path d="M309 228L252 207V268H292Z" fill="${s2}"/>`;

/* DISKARTE: gear D, then the letters */
function diskarteWord(){const cap=140,s=word('ISKARTE',0,0,cap/.7,5),gy=cap*1.26/340,gx=gy*1.5,dw=170*gx,stem=cap*.2,y0=-195*gy-cap/2;return{inner:(id,ox,oy,f=NAVY,st=NAVY,c0)=>`<g transform="translate(${ox} ${oy})"><g transform="translate(${stem-4*gx-250*gx} ${y0}) scale(${gx} ${gy})">${gearD(id,c0)}</g><rect x="0" y="${-cap*1.13}" width="${stem}" height="${cap*1.26}" fill="${st}"/><path transform="translate(${stem+dw+8} 0)" d="${s.d}" fill="${f}"/></g>`,w:stem+dw+8+s.w+6,cap};}
/* MakinaLabs: ship M, then the letters, Labs in the sea colour */
function makinaWord(){const cap=140,a=word('akina',0,0,cap/.7,2),b=word('Labs',0,0,cap/.7,2),mw=cap*1.04;return{inner:(ox,oy,ink=INK,sea=SEA)=>`<g transform="translate(${ox} ${oy})">${shipM(0,-cap,cap,ink,sea)}<path transform="translate(${mw+8} 0)" d="${a.d}" fill="${ink}"/><path transform="translate(${mw+8+a.w+10} 0)" d="${b.d}" fill="${sea}"/></g>`,w:mw+8+a.w+10+b.w,cap};}
const D=diskarteWord(),Mk=makinaWord();
const FILES={
 'diskarte-mark':svg(500,390,gear('g')),
 'diskarte-wordmark':svg(Math.ceil(D.w+24),280,D.inner('w',12,210)),
 'diskarte-logo':svg(1000,1000,`<g transform="translate(125 30) scale(1.5)">${gear('g')}</g><g transform="translate(${500-440} 0)"><g transform="scale(${880/D.w})">${D.inner('w',0,(760+140*880/D.w)/(880/D.w))}</g></g>`),
 'diskarte-logo-white':svg(1000,1000,`<g transform="translate(125 30) scale(1.5)">${gear('g','#EEF3F7')}</g><g transform="translate(${500-440} 0)"><g transform="scale(${880/D.w})">${D.inner('w',0,(760+140*880/D.w)/(880/D.w),'#fff','#fff','#EEF3F7')}</g></g>`),
 'diskarte-wordmark-white':svg(Math.ceil(D.w+24),280,D.inner('w',12,210,'#fff','#fff','#EEF3F7')),
 'makinalabs-mark':svg(500,400,`<g transform="translate(0 -80)">${shipMark()}</g>`),
 'makinalabs-mark-white':svg(500,400,`<g transform="translate(0 -80)">${shipMark('#fff','#5fe0cf','#2fb5a5')}</g>`),
 'makinalabs-logo-white':svg(1000,1000,`<g transform="translate(-100 -160) scale(2.4)">${shipMark('#fff','#5fe0cf','#2fb5a5')}</g><g transform="translate(${500-Mk.w*1.02/2} 0)"><g transform="scale(1.02)">${Mk.inner(0,860,'#fff','#5fe0cf')}</g></g>`),
 'makinalabs-wordmark':svg(Math.ceil(Mk.w+24),220,Mk.inner(12,185)),
 'makinalabs-wordmark-white':svg(Math.ceil(Mk.w+24),220,Mk.inner(12,185,'#fff','#5fe0cf')),
 'makinalabs-logo':svg(1000,1000,`<g transform="translate(-100 -160) scale(2.4)">${shipMark()}</g><g transform="translate(${500-Mk.w*1.02/2} 0)"><g transform="scale(1.02)">${Mk.inner(0,860)}</g></g>`)};
/* square tile for small places: white, rounded, gear only */
const tile=(round=false)=>svg(512,512,`<rect width="512" height="512" rx="${round?256:84}" fill="#fff"/><g transform="translate(46 34) scale(.84)">${gear('t')}</g>`);
(async()=>{fs.mkdirSync(OUT,{recursive:true});
 for(const k in FILES)fs.writeFileSync(path.join(OUT,k+'.svg'),FILES[k]);
 fs.writeFileSync(path.join(OUT,'diskarte-icon.svg'),tile());fs.writeFileSync(path.join(SH,'logo.svg'),tile());
 for(const k of['diskarte-logo','makinalabs-logo','diskarte-wordmark','makinalabs-wordmark'])fs.copyFileSync(path.join(OUT,k+'.svg'),path.join(SH,k+'.svg'));
 const pn=async(src,size,out,o={})=>sharp(Buffer.from(src),{density:300}).resize(size,size,{fit:'contain',background:{r:255,g:255,b:255,alpha:o.bg?1:0}}).png().toFile(out);
 for(const k of['diskarte-logo','makinalabs-logo','diskarte-logo-white','makinalabs-logo-white'])await pn(FILES[k],2048,path.join(OUT,k+'.png'));
 await pn(tile(),512,path.join(ROOT,'electron','icon.png'));
 for(const[n,b,f]of[['mdpi',48,108],['hdpi',72,162],['xhdpi',96,216],['xxhdpi',144,324],['xxxhdpi',192,432]]){const d=path.join(RES,'mipmap-'+n);await pn(tile(),b,path.join(d,'ic_launcher.png'));await pn(tile(true),b,path.join(d,'ic_launcher_round.png'));
  const fg=await sharp(Buffer.from(FILES['diskarte-mark']),{density:300}).resize(Math.round(f*.62),Math.round(f*.62),{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();await sharp({create:{width:f,height:f,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:fg,gravity:'center'}]).png().toFile(path.join(d,'ic_launcher_foreground.png'));}
 console.log('logos written',Object.keys(FILES).length+1);})();
