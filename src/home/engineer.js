/* A caricature marine engineer: big head, coverall with reflective bands, ear muffs, steel-toe safety shoes. Jointed so it can walk and work. */
import * as THREE from 'three';
const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.62,metalness:.05,...o});
const mesh=(g,m,x=0,y=0,z=0,p)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);if(p)p.add(o);return o;};
const cap=(r,l)=>new THREE.CapsuleGeometry(r,l,4,10);
/* the chief, a caricature from the user's photo: oval face tapering to a slim jaw, high forehead, short dark hair, wide thin glasses, straight brows, closed smile. Ear muffs rest on his neck so the face stays clear. */
/* a slim oval from one surface, widest at the cheekbones and tapering to a single chin */
const eggHead=()=>{const g=new THREE.SphereGeometry(.36,36,28),P=g.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i)/.36,k=y<.12?1-.4*Math.pow((.12-y)/1.12,1.6):1;P.setXYZ(i,P.getX(i)*k*.91,P.getY(i)*(y<0?1.32:1.14),P.getZ(i)*k*.93);}g.computeVertexNormals();return g;};
/* a rounded rectangle of thin wire, flatter along the top like the frames in the photo */
const frameRing=(w,h)=>{const r=.03,o=new THREE.Shape(),a=w/2,b=h/2,q=.009;o.moveTo(-a+.012,b);o.lineTo(a-.012,b);o.quadraticCurveTo(a,b,a,b-.012);o.lineTo(a,-b+r);o.quadraticCurveTo(a,-b,a-r,-b);o.lineTo(-a+r,-b);o.quadraticCurveTo(-a,-b,-a,-b+r);o.lineTo(-a,b-.012);o.quadraticCurveTo(-a,b,-a+.012,b);const n=new THREE.Path(),A=a-q,B=b-q,s=r-q;n.moveTo(-A,B);n.lineTo(A,B);n.lineTo(A,-B+s);n.quadraticCurveTo(A,-B,A-s,-B);n.lineTo(-A+s,-B);n.quadraticCurveTo(-A,-B,-A,-B+s);n.closePath();o.holes.push(n);return new THREE.ExtrudeGeometry(o,{depth:.008,bevelEnabled:false,curveSegments:6});};
function chiefHead(head,torso,S,K,Cup,hair){const H=std(hair,{roughness:.85}),Gm=std(0x3a4046,{metalness:.7,roughness:.35}),W=std(0xffffff),Lip=std(0x8c4f40,{roughness:.6});head.position.y=.98;
 mesh(eggHead(),S,0,.15,0,head);{const nk=new THREE.MeshStandardMaterial({color:S.color.clone().multiplyScalar(.78),roughness:.6});mesh(new THREE.CylinderGeometry(.12,.14,.34,16),nk,0,-.34,-.07,head);}
 mesh(new THREE.SphereGeometry(.045,12,10),S,0,.07,.335,head).scale.set(1.25,.9,1.15);
 for(const x of[-.135,.135]){mesh(new THREE.SphereGeometry(.046,12,10),W,x,.172,.296,head).scale.set(1.3,.46,.5);mesh(new THREE.SphereGeometry(.021,10,8),K,x,.172,.316,head);const b=mesh(new THREE.BoxGeometry(.15,.015,.02),H,x,.262,.302,head);b.rotation.z=x<0?.07:-.07;}
 const lens=std(0xcfe0e8,{transparent:true,opacity:.14,roughness:.1,metalness:.2});for(const s of[-1,1]){const r=new THREE.Mesh(frameRing(.215,.145),Gm);r.position.set(s*.128,.175,.325);r.rotation.y=s*.16;head.add(r);const l=mesh(new THREE.PlaneGeometry(.2,.13),lens,s*.128,.175,.33,head);l.rotation.y=s*.16;}
 mesh(new THREE.BoxGeometry(.05,.009,.009),Gm,0,.215,.338,head);for(const s of[-1,1]){const t=mesh(new THREE.BoxGeometry(.008,.009,.36),Gm,s*.238,.21,.15,head);t.rotation.y=s*.055;}
 const m=new THREE.Mesh(new THREE.TorusGeometry(.17,.0105,6,20,Math.PI*.3),Lip);m.position.set(0,.112,.325);m.rotation.z=Math.PI*1.35;head.add(m);
 
 const d=mesh(new THREE.SphereGeometry(.385,24,14,0,Math.PI*2,0,Math.PI*.5),H,0,.2,-.02,head);d.scale.set(.975,1.12,.98);d.rotation.x=-.52;
 for(const s of[-1,1])mesh(new THREE.SphereGeometry(.15,12,10),H,s*.3,.3,-.05,head).scale.set(.42,1.15,1.3);
 const f=mesh(new THREE.SphereGeometry(.17,14,10),H,.09,.5,.2,head);f.scale.set(1.35,.42,.6);f.rotation.z=-.26;f.rotation.x=.5;const f2=mesh(new THREE.SphereGeometry(.13,12,8),H,-.14,.48,.21,head);f2.scale.set(1.05,.4,.55);f2.rotation.z=.34;f2.rotation.x=.5;
 const band=new THREE.Mesh(new THREE.TorusGeometry(.385,.03,8,28,Math.PI),K);band.position.set(0,.13,-.03);band.scale.y=1.56;head.add(band);for(const s of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.12,20),Cup);c.rotation.z=Math.PI/2;c.position.set(s*.37,.12,-.03);head.add(c);mesh(new THREE.CylinderGeometry(.105,.105,.02,16),K,s*.436,.12,-.03,head).rotation.z=Math.PI/2;}
 {const cv=document.createElement('canvas');cv.width=512;cv.height=128;const x=cv.getContext('2d');x.fillStyle='#10233f';x.fillRect(0,0,512,128);x.strokeStyle='#e6b422';x.lineWidth=10;x.strokeRect(5,5,502,118);x.fillStyle='#fff';x.font='700 80px Arial,Roboto,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('ENDOZO',256,68);const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;const p=new THREE.Mesh(new THREE.PlaneGeometry(.27,.0675),new THREE.MeshStandardMaterial({map:tx,roughness:.5}));p.position.set(-.17,.46,.285);p.rotation.y=-.3;torso.add(p);}
 const Bd=std(0x10233f),Gd=std(0xe6b422,{metalness:.7,roughness:.3});for(const s of[-1,1]){const b=new THREE.Group();b.position.set(s*.33,.655,0);b.rotation.z=-s*.3;torso.add(b);mesh(new THREE.BoxGeometry(.3,.028,.17),Bd,0,0,0,b);for(let k=0;k<4;k++)mesh(new THREE.BoxGeometry(.03,.034,.175),Gd,-.09+k*.06,.002,0,b);}
}
export function makeEngineer({coverall,skin,cup,hair,tool,build=1,cap:hat,moustache,chief}){
 const g=new THREE.Group(),body=new THREE.Group();g.add(body);body.position.y=.98;
 const C=std(coverall),S=std(skin,{roughness:.5}),K=std(0x15171a,{roughness:.45,metalness:.2}),R=std(0xe9f2c0,{emissive:0xc8d870,emissiveIntensity:.45,metalness:.4,roughness:.3}),G=std(0xe8c23a),W=std(0xffffff),Cup=std(cup,{roughness:.35,metalness:.2});
 /* torso */
 const torso=new THREE.Group();body.add(torso);
 const chest=mesh(cap(.34,.34),C,0,.3,0,torso);chest.scale.set(1.08,1,.8);
 mesh(new THREE.CylinderGeometry(.36,.36,.07,18),R,0,.42,0,torso).scale.set(1.04,1,.82);
 mesh(new THREE.CylinderGeometry(.36,.36,.07,18),R,0,.14,0,torso).scale.set(1.04,1,.82);
 mesh(new THREE.BoxGeometry(.03,.62,.02),K,0,.3,.285,torso);
 mesh(new THREE.BoxGeometry(.13,.1,.02),std(0xffffff,{roughness:.4}),.17,.46,.262,torso);
 mesh(new THREE.CylinderGeometry(.36,.36,.08,18),K,0,0,0,torso).scale.set(1.02,1,.8);
 /* head */
 const head=new THREE.Group();head.position.y=.84;torso.add(head);
 if(chief){chiefHead(head,torso,S,K,Cup,hair);}else{
 const sk=mesh(new THREE.SphereGeometry(.36,22,16),S,0,.1,0,head);sk.scale.set(1,1.04,.98);
 mesh(new THREE.SphereGeometry(.075,10,8),S,0,.08,.36,head).scale.set(1.1,.9,1.1);
 for(const x of[-.13,.13]){mesh(new THREE.SphereGeometry(.075,12,10),W,x,.17,.3,head);mesh(new THREE.SphereGeometry(.04,10,8),K,x,.17,.365,head);mesh(new THREE.BoxGeometry(.12,.025,.03),std(hair),x,.27,.325,head);}
 const smile=new THREE.Mesh(new THREE.TorusGeometry(.1,.016,6,14,Math.PI*.7),K);smile.position.set(0,-.02,.335);smile.rotation.z=Math.PI+.3;head.add(smile);
 if(moustache){mesh(new THREE.CapsuleGeometry(.03,.16,3,6),std(hair),0,.015,.355,head).rotation.z=Math.PI/2;}
 /* hair, then ear muffs over the top */
 const hr=mesh(new THREE.SphereGeometry(.372,20,10,0,Math.PI*2,0,Math.PI*.46),std(hat||hair,{roughness:.8}),0,.12,-.015,head);hr.rotation.x=-.2;
 if(hat)mesh(new THREE.BoxGeometry(.34,.03,.2),std(hat),0,.3,.34,head);
 const band=new THREE.Mesh(new THREE.TorusGeometry(.385,.032,8,24,Math.PI),K);band.position.y=.11;head.add(band);
 for(const s of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.155,.155,.13,18),Cup);c.rotation.z=Math.PI/2;c.position.set(s*.395,.1,0);head.add(c);mesh(new THREE.CylinderGeometry(.11,.11,.02,14),K,s*.465,.1,0,head).rotation.z=Math.PI/2;}

 }
 /* arms */
 const arm=s=>{const sh=new THREE.Group();sh.position.set(s*.45,.53,0);torso.add(sh);mesh(cap(.115,.24),C,0,-.18,0,sh);const el=new THREE.Group();el.position.y=-.38;sh.add(el);mesh(cap(.1,.22),C,0,-.16,0,el);mesh(new THREE.CylinderGeometry(.115,.115,.05,12),R,0,-.1,0,el);mesh(new THREE.SphereGeometry(.12,12,10),G,0,-.34,0,el);return{sh,el};};
 const aL=arm(-1),aR=arm(1);
 /* tool in the right hand */
 const T=new THREE.Group();T.position.set(0,-.38,.06);aR.el.add(T);const St=std(0xb5bfc4,{metalness:.9,roughness:.3});
 if(tool==='spanner'){mesh(new THREE.BoxGeometry(.05,.46,.03),St,0,-.2,.05,T);mesh(new THREE.TorusGeometry(.07,.024,6,12,4.5),St,0,-.46,.05,T);}
 if(tool==='clipboard'){const b=mesh(new THREE.BoxGeometry(.32,.42,.03),std(0x6b4a2b),0,-.04,.12,T);b.rotation.x=-.6;const p=mesh(new THREE.BoxGeometry(.27,.36,.01),W,0,-.03,.14,T);p.rotation.x=-.6;}
 if(tool==='torch'){mesh(new THREE.CylinderGeometry(.04,.055,.3,10),K,0,-.13,.05,T);mesh(new THREE.SphereGeometry(.058,8,6),std(0xfff0b0,{emissive:0xffe080,emissiveIntensity:2}),0,-.29,.05,T);}
 /* legs and safety shoes */
 const leg=s=>{const hip=new THREE.Group();hip.position.set(s*.19,-.04,0);body.add(hip);mesh(cap(.14,.22),C,0,-.2,0,hip);const kn=new THREE.Group();kn.position.y=-.42;hip.add(kn);mesh(cap(.125,.2),C,0,-.17,0,kn);mesh(new THREE.CylinderGeometry(.14,.14,.05,12),R,0,-.14,0,kn);
  const ft=new THREE.Group();ft.position.y=-.4;kn.add(ft);const bt=mesh(new THREE.BoxGeometry(.26,.15,.46),K,0,-.05,.08,ft);bt.scale.y=1.1;mesh(new THREE.SphereGeometry(.15,12,8),std(0xb8892b,{metalness:.4,roughness:.4}),0,-.05,.27,ft).scale.set(.95,.68,.8);mesh(new THREE.BoxGeometry(.28,.05,.5),std(0x3a2615),0,-.14,.09,ft);mesh(new THREE.CylinderGeometry(.14,.15,.14,12),K,0,.05,0,ft);return{hip,kn,ft};};
 const lL=leg(-1),lR=leg(1);
 let ph=Math.random()*6,blend=0;
 const damp=(o,k,v,a)=>{o[k]+=(v-o[k])*a;};
 const e={g,build,lean:0,glance:0,
  walk(d){ph+=d;const s=Math.sin(ph),c=Math.cos(ph);blend=1;lL.hip.rotation.x=s*.62;lR.hip.rotation.x=-s*.62;lL.kn.rotation.x=Math.max(0,-c)*.95;lR.kn.rotation.x=Math.max(0,c)*.95;lL.ft.rotation.x=-lL.hip.rotation.x*.3;lR.ft.rotation.x=-lR.hip.rotation.x*.3;
   aL.sh.rotation.x=-s*.6;aR.sh.rotation.x=s*.6;aL.sh.rotation.z=-.12;aR.sh.rotation.z=.12;aL.el.rotation.x=-.35;aR.el.rotation.x=-.35;aL.el.rotation.z*=.8;aR.el.rotation.z*=.8;torso.rotation.y*=.8;body.position.y=.98+Math.abs(c)*.05;torso.rotation.z=s*.05;torso.rotation.x=.07+e.lean;head.rotation.y=Math.sin(ph*.5)*.14+e.glance;head.rotation.x=-.04;},
  rest(dt,arms){const a=Math.min(1,dt*6);for(const o of[lL.hip,lR.hip,lL.kn,lR.kn,lL.ft,lR.ft])damp(o.rotation,'x',0,a);if(arms!=='pose'){for(const o of[aL.sh,aR.sh])damp(o.rotation,'x',0,a);for(const o of[aL.sh,aR.sh,aL.el,aR.el])damp(o.rotation,'z',0,a);damp(aL.el.rotation,'x',-.15,a);damp(aR.el.rotation,'x',-.15,a);}damp(torso.rotation,'y',0,a);damp(torso.rotation,'x',0,a);damp(torso.rotation,'z',0,a);damp(body.position,'y',.98+Math.sin(performance.now()/700)*.008,a);head.rotation.y+=(Math.sin(performance.now()/1500)*.4-head.rotation.y)*a*.5;},
  /* flat on the back, arms flung out; p runs 0 to 1 through the fall */
  fall(p){const q=p*p*(3-2*p);body.rotation.set(-q*Math.PI/2,0,0);body.position.set(0,.98-q*.66,0);torso.rotation.set(0,0,0);head.rotation.set(-.15*q,0,0);aL.sh.rotation.set(0,0,-1.3*q);aR.sh.rotation.set(0,0,1.3*q);aL.el.rotation.set(-.2,0,0);aR.el.rotation.set(-.2,0,0);lL.hip.rotation.set(0,0,-.18*q);lR.hip.rotation.set(0,0,.18*q);lL.kn.rotation.x=.15*q;lR.kn.rotation.x=.3*q;lL.ft.rotation.x=lR.ft.rotation.x=0;},
  /* ninja moves: the first three get up from the floor, the rest start and end standing */
  stunt(kind,p){const s=Math.sin(Math.PI*p),q=p*p*(3-2*p),P=Math.PI,tuck=k=>{lL.hip.rotation.set(-1.9*k,0,0);lR.hip.rotation.set(-1.9*k,0,0);lL.kn.rotation.x=2.1*k;lR.kn.rotation.x=2.1*k;aL.sh.rotation.set(-1.5*k,0,0);aR.sh.rotation.set(-1.5*k,0,0);aL.el.rotation.set(-1.2*k,0,0);aR.el.rotation.set(-1.2*k,0,0);},split=(k,w)=>{lL.hip.rotation.set(0,0,-w*k);lR.hip.rotation.set(0,0,w*k);lL.kn.rotation.x=lR.kn.rotation.x=0;},reach=k=>{aL.sh.rotation.set(0,0,-2.6*k);aR.sh.rotation.set(0,0,2.6*k);aL.el.rotation.set(0,0,0);aR.el.rotation.set(0,0,0);};
   body.rotation.set(0,0,0);body.position.set(0,.98,0);
   if(kind==='kipup'){const a=p<.35?p/.35:1,b=p<.35?0:(p-.35)/.65,w=b*b*(3-2*b);body.rotation.x=-P/2-.5*a*(1-w)+(P/2+.5)*w;body.position.y=.32+.66*w+1.1*Math.sin(P*b);tuck(a*(1-w));}
   else if(kind==='backroll'){body.rotation.x=-P/2-q*1.5*P;body.position.y=.34+.64*q*q;tuck(s);}
   else if(kind==='handspring'){body.rotation.x=-P/2-q*1.5*P;body.position.y=.34+.64*q+1.8*s;split(s,.45);reach(s);}
   else if(kind==='backflip'){body.rotation.x=-2*P*q;body.position.y=.98+2.4*s;tuck(s);}
   else if(kind==='frontflip'){body.rotation.x=2*P*q;body.position.y=.98+2.1*s;tuck(s);}
   else if(kind==='spinkick'){body.rotation.y=4*P*q;body.position.y=.98+1.3*s;lL.hip.rotation.set(0,0,-1.45*s);lL.kn.rotation.x=0;lR.hip.rotation.set(0,0,0);lR.kn.rotation.x=1.5*s;aL.sh.rotation.set(0,0,-1.5*s);aR.sh.rotation.set(0,0,1.5*s);aL.el.rotation.set(0,0,0);aR.el.rotation.set(0,0,0);}
   else if(kind==='cartwheel'){body.rotation.z=2*P*q;body.position.y=.98+1.05*s;body.position.x=Math.sin(2*P*p)*.7;split(s,.75);reach(s);}
   else if(kind==='butterfly'){body.rotation.z=2*P*q;body.rotation.y=2*P*q;body.position.y=.98+1.7*s;split(s,1);reach(s*.8);}
   else if(kind==='ninja'){lL.hip.rotation.set(-1.5*s,0,0);lL.kn.rotation.x=1.9*s;lR.hip.rotation.set(0,0,0);lR.kn.rotation.x=.25*s;aL.sh.rotation.set(-1.3*s,0,-.5*s);aL.el.rotation.set(-1.2*s,0,0);aR.sh.rotation.set(-.2*s,0,1.5*s);aR.el.rotation.set(0,0,0);}
   lL.ft.rotation.x=lR.ft.rotation.x=0;torso.rotation.set(0,0,0);head.rotation.set(0,0,0);},
  upright(){body.rotation.set(0,0,0);body.position.set(0,.98,0);for(const o of[aL.sh,aR.sh,aL.el,aR.el,lL.hip,lR.hip])o.rotation.set(0,0,0);lL.kn.rotation.x=lR.kn.rotation.x=0;torso.rotation.set(0,0,0);},
  /* both hands up in a Y, looking out of the screen */
  cheer(t,dt){e.rest(dt,'pose');const a=Math.min(1,dt*10);damp(aL.sh.rotation,'z',-2.45,a);damp(aR.sh.rotation,'z',2.45,a);damp(aL.sh.rotation,'x',0,a);damp(aR.sh.rotation,'x',0,a);damp(aL.el.rotation,'x',0,a);damp(aR.el.rotation,'x',0,a);damp(head.rotation,'y',0,a);damp(head.rotation,'x',-.1,a);body.position.y=.98+Math.abs(Math.sin(t*6))*.05;},
  /* the hand on the viewer's left goes to the brow */
  salute(dt){e.rest(dt,'pose');damp(aR.sh.rotation,'z',0,Math.min(1,dt*6));damp(aR.sh.rotation,'x',0,Math.min(1,dt*6));damp(aR.el.rotation,'x',-.15,Math.min(1,dt*6));const a=Math.min(1,dt*9);damp(aL.sh.rotation,'z',-2.15,a);damp(aL.sh.rotation,'x',-.28,a);damp(aL.el.rotation,'z',-2.1,a);damp(aL.el.rotation,'x',0,a);damp(head.rotation,'y',0,a);damp(head.rotation,'x',-.03,a);damp(torso.rotation,'x',-.03,a);},
  /* a chief giving instructions, and a worker listening */
  brief(t,dt){e.rest(dt);const a=Math.min(1,dt*7);aL.sh.rotation.x=-1.25+Math.sin(t*2.2)*.16;aL.el.rotation.x=-.25;damp(aR.sh.rotation,'x',-.75,a);damp(aR.el.rotation,'x',-1,a);head.rotation.x=Math.sin(t*1.7)*.08;head.rotation.y=Math.sin(t*.9)*.12;},
  listen(t,dt){e.rest(dt);head.rotation.x=.08+Math.max(0,Math.sin(t*3))*.16;head.rotation.y*=.9;},
  work(job,t,dt){e.rest(dt);const a=Math.min(1,dt*7);if(job==='inspect'){damp(torso.rotation,'x',.3,a);damp(aR.sh.rotation,'x',-1.35,a);damp(aR.el.rotation,'x',-.3,a);damp(head.rotation,'x',.12,a);head.rotation.y=Math.sin(t*.9)*.35;}
   if(job==='wrench'){damp(torso.rotation,'x',.22,a);aR.sh.rotation.x=-1.25+Math.sin(t*5)*.28;aR.el.rotation.x=-.55+Math.sin(t*5+1)*.35;damp(aL.sh.rotation,'x',-.9,a);damp(aL.el.rotation,'x',-.7,a);torso.rotation.y=Math.sin(t*5)*.06;}
   if(job==='note'){damp(aR.sh.rotation,'x',-.75,a);damp(aR.el.rotation,'x',-1,a);damp(aL.sh.rotation,'x',-.6,a);aL.el.rotation.x=-1.1+Math.sin(t*8)*.08;head.rotation.x=.28+Math.sin(t*1.6)*.1;}}};
 return e;}
