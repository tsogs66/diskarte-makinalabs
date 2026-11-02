/* The home screen's engine room: three decks around the main engine, all drawn in code so it needs no model files. Machines are merged by material to keep draw calls low on phones. */
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {makeEngineer} from './engineer.js';

const rnd=(a,b)=>a+Math.random()*(b-a);
function canvasTex(w,h,draw,rx=1,ry=1){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}

class Bake{ /* collects parts, then merges everything of one material into a single mesh */
 constructor(){this.lists=new Map();}
 add(g,mat,m){const c=g.index?g.toNonIndexed():g.clone();c.applyMatrix4(m);if(!this.lists.has(mat))this.lists.set(mat,[]);this.lists.get(mat).push(c);}
 box(mat,w,h,d,x,y,z){this.add(new THREE.BoxGeometry(w,h,d),mat,new THREE.Matrix4().makeTranslation(x,y,z));}
 cyl(mat,r,h,x,y,z,axis='y',seg=20,r2){const g=new THREE.CylinderGeometry(r2??r,r,h,seg);const m=new THREE.Matrix4();if(axis==='x')m.makeRotationZ(Math.PI/2);if(axis==='z')m.makeRotationX(Math.PI/2);m.setPosition(x,y,z);this.add(g,mat,m);}
 torus(mat,r,t,x,y,z,axis='y'){const g=new THREE.TorusGeometry(r,t,8,24);const m=new THREE.Matrix4();if(axis==='y')m.makeRotationX(Math.PI/2);if(axis==='x')m.makeRotationY(Math.PI/2);m.setPosition(x,y,z);this.add(g,mat,m);}
 sph(mat,r,x,y,z,sy=1){const g=new THREE.SphereGeometry(r,18,12);const m=new THREE.Matrix4().makeScale(1,sy,1);m.setPosition(x,y,z);this.add(g,mat,m);}
 pipe(mat,r,pts){for(let i=0;i<pts.length-1;i++){const a=new THREE.Vector3(...pts[i]),b=new THREE.Vector3(...pts[i+1]),l=a.distanceTo(b);const g=new THREE.CylinderGeometry(r,r,l,10);const m=new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()),new THREE.Vector3(1,1,1));this.add(g,mat,m);if(i)this.sph(mat,r*1.12,...pts[i]);}}
 bake(scene,shadow){for(const[mat,l]of this.lists){for(const g of l){if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));}const m=new THREE.Mesh(mergeGeometries(l,false),mat);m.castShadow=m.receiveShadow=shadow;scene.add(m);}this.lists.clear();}
}

export function createScene(canvas,{tier}){
 const hi=tier==='high',low=tier==='low';
 const renderer=new THREE.WebGLRenderer({canvas,antialias:!low,powerPreference:'high-performance'});
 let pr=Math.min(devicePixelRatio||1,hi?2:low?1:1.5);renderer.setPixelRatio(pr);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=hi?1.15:1.4;
 renderer.shadowMap.enabled=!low;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x08131a);scene.fog=new THREE.FogExp2(0x0a1a22,.008);
 try{const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=low?.6:hi?.34:.45;pm.dispose();}catch(e){scene.add(new THREE.AmbientLight(0xffffff,1.4));}
 const cam=new THREE.PerspectiveCamera(42,1,.1,160);
 /* materials */
 const S=(color,metal=.55,rough=.5,extra={})=>new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough,...extra});
 const M={rail:S(0xe0a21c,.35,.45),greenB:S(0x1f7a42,.4,.5),green:S(0x2c8a4a,.4,.5),greenL:S(0x5fb83c,.3,.45),genG:S(0x2f9a5a,.45,.42),blueL:S(0x2a86e0,.35,.38),redE:S(0xd8451f,.35,.4),teal:S(0x3f8a8e,.45,.5),green2:S(0x3b8b78),grey:S(0x7f8c90,.7,.42),dark:S(0x262e33,.7,.5),steel:S(0xb5bfc4,.92,.28),red:S(0xc22f24,.4,.42),yellow:S(0xe6b422,.3,.5),blue:S(0x1f6fc4,.45,.4),orange:S(0xe58a1f,.45,.4),white:S(0xdfe4e2,.2,.55),black:S(0x14181b,.5,.6),brass:S(0xc9a24a,.95,.3),cream:S(0xcfc7ae,.3,.6),lag:S(0xa9afaa,.4,.72)};
 const gridTex=canvasTex(128,128,(c,w,h)=>{c.fillStyle='#20282c';c.fillRect(0,0,w,h);c.strokeStyle='#6f7c80';c.lineWidth=3;for(let i=0;i<=w;i+=12){c.beginPath();c.moveTo(i,0);c.lineTo(i,h);c.stroke();c.beginPath();c.moveTo(0,i);c.lineTo(w,i);c.stroke();}c.strokeStyle='#8d9a9e';c.lineWidth=7;c.strokeRect(0,0,w,h);});
 const wallTex=canvasTex(512,256,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#70797a');g.addColorStop(1,'#565f62');c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='rgba(0,0,0,.3)';for(let x=0;x<w;x+=128)c.fillRect(x,0,6,h);c.fillRect(0,126,w,5);c.fillStyle='rgba(255,255,255,.09)';for(let x=8;x<w;x+=128)c.fillRect(x,0,3,h);c.fillStyle='rgba(210,225,230,.25)';for(let x=30;x<w;x+=64)for(let y=16;y<h;y+=112){c.beginPath();c.arc(x,y,3,0,7);c.fill();}},4,2);
 const wallM=new THREE.MeshStandardMaterial({map:wallTex,metalness:.3,roughness:.72});
 const back=new THREE.Mesh(new THREE.PlaneGeometry(54.4,20),wallM);back.position.set(0,10,-14);scene.add(back);const ceil=new THREE.Mesh(new THREE.PlaneGeometry(54.4,28),S(0x1a2228,.3,.9));ceil.rotation.x=Math.PI/2;ceil.position.set(0,20,0);scene.add(ceil);
 const B=new Bake(),moving=[],blink=[];
 const mat2=(c,e)=>new THREE.MeshStandardMaterial({color:c,emissive:e,emissiveIntensity:1.6,roughness:.35});
 const led=(x,y,z,c)=>{const m=mat2(0x222222,c);const o=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),m);o.position.set(x,y,z);scene.add(o);blink.push({m,p:rnd(0,6),s:rnd(.5,1.6)});};
 const gauge=(x,y,z,r=.2)=>{B.cyl(M.dark,r*1.15,.06,x,y,z,'z',20);B.cyl(M.white,r,.07,x,y,z+.012,'z',20);const n=new THREE.Mesh(new THREE.BoxGeometry(r*1.5,.018,.01),M.red);n.position.set(x,y,z+.055);scene.add(n);moving.push(t=>{n.rotation.z=.7+Math.sin(t*1.3+x)*.14+Math.sin(t*7+y)*.015;});};
 const spinner=(g,mat,x,y,z,axis,speed)=>{const o=new THREE.Mesh(g,mat);o.position.set(x,y,z);o.castShadow=!low;scene.add(o);moving.push(t=>{o.rotation[axis]=t*speed;});return o;};
 const plate=(x,y,z,w,text,bg='#0e2730',fg='#9ff0dc')=>{const t=canvasTex(256,48,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.strokeStyle=fg;c.lineWidth=3;c.strokeRect(3,3,W-6,H-6);c.fillStyle=fg;c.font='600 25px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(text,W/2,H/2+1);});const o=new THREE.Mesh(new THREE.PlaneGeometry(w,w*48/256),new THREE.MeshStandardMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.42}));o.position.set(x,y,z);scene.add(o);};
 const stations=[];const NODES={};const node=(id,x,y,z)=>(NODES[id]={id,x,y,z,to:[]});const link=(...ids)=>{for(let i=0;i<ids.length-1;i++){const a=NODES[ids[i]],b=NODES[ids[i+1]];a.to.push(b);b.to.push(a);}};
 /* decks: the floor, a gallery and an upper flat, open in the middle so the main engine shows through. Characters walk these nodes; stairs are simply links between levels. */
 const Y1=6.5,Y2=13,TOP=20;
 for(const[id,x,y,z]of[['f0',-13,0,4.6],['f1',0,0,4.6],['f2',13,0,4.6],['f3',13,0,-2.5],['f4',13,0,-9],['f5',0,0,-9],['f6',-13,0,-9],['f7',-13,0,.9],['sl0',-15.5,0,4.6],['sr0',15.5,0,4.6],['sl1',-15.5,Y1,-2.4],['sr1',15.5,Y1,-2.4],
  ['m0',-18.5,Y1,-2.4],['m1',-18.5,Y1,4.4],['m2',-18.5,Y1,-9.6],['m3',-9,Y1,-9.6],['m4',0,Y1,-9.6],['m5',9,Y1,-9.6],['m6',18.5,Y1,-9.6],['m7',18.5,Y1,-2.4],['m8',18.5,Y1,4.4],['ul0',-25,Y1,4.4],['ur0',25,Y1,4.4],['ul1',-25,Y2,-5],['ur1',25,Y2,-5],
  ['t0',-25,Y2,-9.6],['t1',-12,Y2,-9.6],['t2',0,Y2,-9.6],['t3',12,Y2,-9.6],['t4',25,Y2,-9.6]])node(id,x,y,z);
 link('f7','f0','f1','f2','f3','f4','f5','f6');link('f0','sl0','sl1','m0','m1','ul0','ul1','t0','t1','t2','t3','t4','ur1','ur0','m8','m7','sr1','sr0','f2');link('m0','m2','m3','m4','m5','m6','m7');
 const WALK=Object.keys(NODES).filter(k=>!/^[su]/.test(k));
 const station=(name,x,y,z,via,box)=>{const id='s'+stations.length,n=node(id,x,y,z);link(id,via);const s={name,x,y,z,node:n,face:Math.atan2(box[0]-x,box[2]-z)};stations.push(s);const h=new THREE.Mesh(new THREE.BoxGeometry(box[3],box[4],box[5]),new THREE.MeshBasicMaterial({visible:false}));h.position.set(box[0],box[1],box[2]);h.userData.s=s;machineHits.push(h);scene.add(h);return s;};
 const machineHits=[];
 const deck=(x1,x2,z1,z2,y)=>{const w=x2-x1,d=z2-z1,t=gridTex.clone();t.repeat.set(w/4,d/4);t.needsUpdate=true;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({map:t,metalness:.6,roughness:.55}));m.rotation.x=-Math.PI/2;m.position.set((x1+x2)/2,y+.012,(z1+z2)/2);m.receiveShadow=!low;scene.add(m);if(y>0)B.box(M.dark,w,.26,d,(x1+x2)/2,y-.13,(z1+z2)/2);};
 const rail=(x1,z1,x2,z2,y)=>{const L=Math.hypot(x2-x1,z2-z1),n=Math.max(1,Math.round(L/2.6));for(let i=0;i<=n;i++){const k=i/n;B.cyl(M.rail,.06,1.3,x1+(x2-x1)*k,y+.65,z1+(z2-z1)*k,'y',6);}B.pipe(M.rail,.06,[[x1,y+1.3,z1],[x2,y+1.3,z2]]);B.pipe(M.rail,.05,[[x1,y+.72,z1],[x2,y+.72,z2]]);};
 const stair=(x,z0,y0,z1,y1)=>{const n=Math.round(Math.abs(y1-y0)/.42),w=1.7;for(let i=1;i<=n;i++){const k=i/n;B.box(M.grey,w,.07,Math.abs(z1-z0)/n*1.15,x,y0+(y1-y0)*k-.04,z0+(z1-z0)*k);}for(const s of[-1,1]){B.pipe(M.rail,.11,[[x+s*w/2,y0,z0],[x+s*w/2,y1,z1]]);B.pipe(M.rail,.055,[[x+s*w/2,y0+1.35,z0],[x+s*w/2,y1+1.35,z1]]);for(let i=0;i<=3;i++){const k=i/3;B.cyl(M.rail,.05,1.35,x+s*w/2,y0+(y1-y0)*k+.67,z0+(z1-z0)*k,'y',6);}}};
 const safety=(x,y,z,w,ry=0)=>{const t=canvasTex(1024,300,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.fillStyle='#0b7a3b';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.fillRect(14,14,W-28,H-28);c.fillStyle='#0b7a3b';c.fillRect(26,26,250,H-52);c.fillStyle='#fff';c.beginPath();c.arc(151,150,92,0,7);c.fill();c.fillStyle='#0b7a3b';c.fillRect(127,84,48,132);c.fillRect(85,126,132,48);c.font='700 150px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('SAFETY',650,88);c.fillText('FIRST',650,218);});const o=new THREE.Mesh(new THREE.PlaneGeometry(w,w*300/1024),new THREE.MeshStandardMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.5,roughness:.5}));o.position.set(x,y,z);o.rotation.y=ry;scene.add(o);};
 const valve=(x,y,z,c=M.red)=>{B.torus(c,.3,.05,x,y,z,'z');B.box(c,.56,.05,.05,x,y,z);B.box(c,.05,.56,.05,x,y,z);};

 deck(-27,27,-14,14,0);
 deck(-27,27,-14,-7.5,Y1);deck(-27,-17,-7.5,7,Y1);deck(17,27,-7.5,7,Y1);deck(-17,-14.5,-3.6,-1.2,Y1);deck(14.5,17,-3.6,-1.2,Y1);
 deck(-27,27,-14,-8,Y2);deck(-27,-19,-8,-5,Y2);deck(19,27,-8,-5,Y2);
 stair(-15.5,4.6,0,-1.6,Y1);stair(15.5,4.6,0,-1.6,Y1);stair(-25,4.4,Y1,-5,Y2);stair(25,4.4,Y1,-5,Y2);
 for(const s of[-1,1]){rail(s*17,-7.5,s*17,-3.6,Y1);rail(s*17,-1.2,s*17,7,Y1);rail(s*17,7,s*23.9,7,Y1);rail(s*26.1,7,s*27,7,Y1);rail(s*14.5,-3.6,s*17,-3.6,Y1);rail(s*14.5,-1.2,s*14.5,-3.6,Y1);rail(s*17,-7.5,s*19,-7.5,Y1);
  rail(s*19,-8,s*19,-5,Y2);rail(s*19,-5,s*24,-5,Y2);rail(s*26,-5,s*27,-5,Y2);
  for(let x=7;x<26;x+=9)B.box(M.dark,.34,Y2-Y1,.34,s*x,(Y1+Y2)/2,-13.6);for(const z of[-7.7,6.8])B.box(M.dark,.34,Y1,.34,s*17.2,Y1/2,z);B.box(M.dark,.34,TOP-Y2,.34,s*19.2,(TOP+Y2)/2,-8.2);}
 rail(-17,-7.5,17,-7.5,Y1);rail(-19,-8,19,-8,Y2);B.box(M.dark,.34,Y1,.34,0,Y1/2,-13.6);
 /* the room shell and steelwork */
 for(const[p,ry]of[[[-27.2,TOP/2,0],Math.PI/2],[[27.2,TOP/2,0],-Math.PI/2]]){const w=new THREE.Mesh(new THREE.PlaneGeometry(28,TOP),wallM);w.position.set(...p);w.rotation.y=ry;scene.add(w);}
 for(let x=-24;x<26;x+=8)B.box(M.dark,.5,.7,28,x,TOP-.5,0);for(const z of[-12,-4,4,12])B.box(M.dark,56,.5,.4,0,TOP-1,z);

 /* main engine: green bedplate and frames, blue cylinder heads, red exhaust, turbocharger and flywheel */
 {const Z=-2.5;B.box(M.greenB,20.4,1.9,7.2,0,.95,Z);B.box(M.green,19,2.6,5.8,0,3.1,Z);B.box(M.cream,19,.5,5,0,4.6,Z);for(let i=0;i<8;i++){const x=-8.4+i*2.4;B.box(M.grey,1.6,1.5,.08,x,3.1,Z+2.93);B.box(M.dark,1.3,1.2,.08,x,3.1,Z+2.97);B.box(M.blue,2,1.5,3.9,x,5.6,Z);B.box(M.blueL,1.7,.7,1.5,x,6.7,Z+.95);B.box(M.blueL,1.7,.7,1.5,x,6.7,Z-.95);B.cyl(M.steel,.14,.5,x,7.2,Z+.95,'y',8);B.box(M.greenL,.9,1.1,.8,x,4.6,Z+2.9);B.pipe(M.yellow,.07,[[x+.2,5.1,Z+2.9],[x+.2,5.7,Z+1.85]]);B.pipe(M.yellow,.07,[[x-.25,5.1,Z+2.95],[x-.25,5.7,Z+3.3]]);B.pipe(M.cream,.26,[[x-.62,4.6,Z+3.3],[x-.62,5.2,Z+1.85]]);B.pipe(M.redE,.34,[[x,6.3,Z-1.7],[x,7.8,Z-1.7]]);B.torus(M.steel,.87,.07,x,7.9,Z-1.7,'x');gauge(x+.5,3.8,Z+2.92,.11);}
  B.cyl(M.redE,.85,18.6,0,7.9,Z-1.7,'x',20);B.sph(M.redE,.85,-9.3,7.9,Z-1.7);B.cyl(M.cream,.72,17.6,0,4.3,Z+3.6,'x',16);B.sph(M.cream,.72,-8.8,4.3,Z+3.6);for(let x=-8;x<9;x+=4)B.box(M.dark,.2,.9,.5,x,3.7,Z+3.4);B.cyl(M.steel,.72,8.5,4.4,1.1,Z+4.2,'x',16);for(let x=1;x<9;x+=1.4)B.torus(M.blue,.76,.05,x,1.1,Z+4.2,'x');B.pipe(M.orange,.14,[[-9.5,.5,Z+3.55],[-9.5,.5,Z+3.85],[9.5,.5,Z+3.85],[9.5,.5,Z+3.55]]);B.pipe(M.orange,.14,[[.15,1.1,Z+4.2],[-.4,1.1,Z+4.2],[-.4,.5,Z+3.85]]);B.pipe(M.orange,.14,[[8.65,1.1,Z+4.2],[9.1,1.1,Z+4.2],[9.1,.5,Z+3.85]]);B.pipe(M.yellow,.11,[[-9,5.7,Z+3.3],[10.4,5.7,Z+3.3],[10.4,.05,Z+3.3]]);B.pipe(M.blue,.13,[[-9.8,.4,Z-3.55],[-9.8,.4,Z-3.9],[9.8,.4,Z-3.9],[9.8,.4,Z-3.55]]);
  /* turbocharger, right end */
  B.pipe(M.redE,.7,[[9.3,7.9,Z-1.7],[10.9,7.9,Z-1.7],[10.9,7.7,Z]]);B.cyl(M.steel,1.35,1.5,11.3,7.7,Z,'x',28);B.torus(M.steel,1.05,.42,10.5,7.7,Z,'x');B.torus(M.grey,.95,.36,12.2,7.7,Z,'x');B.box(M.grey,1.8,4.8,1.8,11.3,3.1,Z);B.pipe(M.cream,.55,[[12.2,6.8,Z],[12.2,4.5,Z+2],[8.6,4.3,Z+3.6]]);B.pipe(M.lag,.72,[[11.3,8.8,Z],[11.3,19.6,Z]]);const rotor=spinner(new THREE.CylinderGeometry(.62,.62,.16,7),M.dark,12.9,7.7,Z,'x',0);rotor.rotation.z=Math.PI/2;moving.push(t=>{rotor.rotation.x=t*22;});B.box(M.grey,2.2,2.4,2.4,13.8,7.7,Z);for(let k=0;k<7;k++)B.box(M.dark,.06,2.2,2.42,13+k*.26,7.7,Z);
  /* flywheel, left end, with the turning gear */
  const wheel=new THREE.Group();const rim=new THREE.Mesh(new THREE.TorusGeometry(2.1,.5,10,36),M.steel),hub=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,.9,20),M.dark);hub.rotation.x=Math.PI/2;wheel.add(rim,hub);for(let k=0;k<5;k++){const s=new THREE.Mesh(new THREE.BoxGeometry(.3,3.8,.25),M.grey);s.rotation.z=k*Math.PI/5;wheel.add(s);}wheel.position.set(-10.7,2.9,Z);wheel.rotation.y=Math.PI/2;wheel.traverse(o=>{o.castShadow=!low;});const wp=new THREE.Group();wp.add(wheel);scene.add(wp);const shaft=new THREE.Group();const sb=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,16.6,20),M.steel);sb.rotation.z=Math.PI/2;shaft.add(sb);for(const x of[-5.2,3])for(let k=0;k<3;k++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,.16,20),M.dark);b.rotation.z=Math.PI/2;b.position.x=x-.1+k*.1;shaft.add(b);}const tag=new THREE.Mesh(new THREE.BoxGeometry(16.6,.1,.1),M.yellow);tag.position.y=.39;shaft.add(tag);shaft.position.set(-19.2,2.9,Z);shaft.traverse(o=>{o.castShadow=!low;});scene.add(shaft);moving.push(t=>{wheel.rotation.z=t*1.2;shaft.rotation.x=t*1.2;});for(const x of[-14,-20])B.box(M.green,1.4,2.2,1.5,x,1.1,Z),B.box(M.grey,1.1,.9,1.3,x,2.9,Z);B.cyl(M.dark,.8,.5,-27,2.9,Z,'x',22);B.box(M.blue,1.2,1,2.2,-9.9,.5,Z);
  for(let i=0;i<7;i++)led(-7+i*2.3,2.2,Z+2.96,i%3?0x35f08a:0xffb02e);
  rail(-11.9,2.6,11.9,2.6,0);rail(-11.9,-7.6,11.9,-7.6,0);rail(-11.9,2.6,-11.9,-1.7,0);rail(-11.9,-3.3,-11.9,-7.6,0);rail(11.9,2.6,11.9,-7.6,0);
  station('Main engine',-4,0,3.4,'f1',[0,3.8,-2.5,19,7.6,7]);station('Main engine',5,0,3.4,'f1',[4.4,1.1,1.7,8.5,1.5,1.5]);station('Flywheel',-12.9,0,-.8,'f7',[-10.7,2.9,-2.5,1.6,6,6]);station('Turbocharger',12.9,0,-2.5,'f3',[12,7.7,-2.5,5,3.6,3.6]);station('Fuel pumps',0,0,-8.8,'f5',[0,4.6,-5.2,18,2,1.4]);
  safety(0,1.42,2.66,3.1);}
 /* floor corners: pump sets under the galleries */
 for(const[i,x]of[-22,-19.5,19.5,22].entries()){const c=[M.green2,M.red,M.blue,M.orange][i];B.box(M.dark,1.7,.3,1.7,x,.15,-10);B.sph(c,.66,x,.95,-10,.84);B.cyl(c,.3,.5,x,1.7,-10,'y',14);B.cyl(M.blue,.44,1.1,x,2.5,-10,'y',18);B.pipe(c,.2,[[x,.95,-10],[x,.95,-12.8],[x,5.8,-12.8]]);gauge(x+.68,1.8,-9.7,.13);}
 station('Sea water pumps',-20.7,0,-7.4,'f6',[-20.7,1.6,-10,6,3.2,2.2]);station('Bilge pumps',20.7,0,-7.4,'f4',[20.7,1.6,-10,6,3.2,2.2]);
 /* gallery, back: purifiers, fuel module, fresh water generator, cabinets */
 {const y=Y1,Z=-12;for(const[i,X]of[-14,-10].entries()){B.box(M.grey,2,.5,2,X,y+.25,Z);B.cyl(M.blue,.85,1.1,X,y+1.1,Z,'y',24,.7);B.cyl(M.blue,.7,.5,X,y+1.9,Z,'y',24,.45);B.cyl(M.steel,.46,.3,X,y+2.3,Z,'y',20);B.cyl(M.dark,.22,.3,X,y+2.6,Z,'y',12);B.cyl(M.green,.42,.9,X+1.2,y+.95,Z,'x',16);B.box(M.white,.9,1.3,.28,X-.2,y+3.7,-13.7);gauge(X-.2,y+3.9,-13.5,.13);led(X-.45,y+3.3,-13.5,0x35f08a);led(X-.05,y+3.3,-13.5,0xff4a3a);B.pipe(M.orange,.08,[[X,y+2.8,Z],[X,y+3.2,Z],[X,y+3.2,-13.7]]);const bowl=new THREE.Mesh(new THREE.TorusGeometry(.72,.03,6,20),M.steel);bowl.rotation.x=Math.PI/2;bowl.position.set(X,y+1.65,Z);scene.add(bowl);moving.push(t=>{bowl.position.y=y+1.65+Math.sin(t*44+i)*.006;});station('Purifier '+(i+1),X,y,-9.8,'m3',[X,y+1.4,Z,2.4,2.8,2.4]);}
  {const X=-3;B.box(M.dark,6,.3,2.4,X,y+.15,Z);for(const k of[-2,0,2]){B.cyl(M.teal,.55,2.2,X+k,y+1.5,Z,'y',20);B.torus(M.steel,.57,.05,X+k,y+2.4,Z);valve(X+k,y+1.2,Z+.65);}B.pipe(M.red,.13,[[X-2.6,y+.6,Z+.8],[X+2.6,y+.6,Z+.8],[X+2.6,y+3,Z+.8],[X+2.6,y+3,-13.4]]);B.pipe(M.blue,.13,[[X-2.6,y+2.8,Z+.8],[X+2,y+2.8,Z+.8]]);station('Fuel oil module',X,y,-9.8,'m4',[X,y+1.6,Z,6,3.2,2.4]);}
  {const X=7;B.box(M.steel,3.2,3.6,1.8,X,y+2,Z);B.box(M.dark,3.3,.3,1.9,X,y+.15,Z);for(let k=0;k<18;k++)B.box(M.grey,.06,3.4,1.82,X-1.5+k*.176,y+2,Z);B.box(M.white,1,1.4,.3,X+2.4,y+1.9,Z+.3);gauge(X+2.4,y+2.2,Z+.48,.16);led(X+2.1,y+1.5,Z+.48,0x35f08a);station('Fresh water generator',X,y,-9.8,'m5',[X+.6,y+1.9,Z,5,3.8,2.2]);}
  {const X=15;B.box(M.teal,4.2,3.2,1,X,y+1.6,-13.3);for(let k=0;k<5;k++){gauge(X-1.6+k*.8,y+2.5,-12.76,.17);led(X-1.6+k*.8,y+1.8,-12.76,k%2?0x35f08a:0xffb02e);}B.box(M.dark,3.6,.8,.08,X,y+1,-12.76);station('Starter panel',X,y,-9.8,'m6',[X,y+1.6,-13.2,4.4,3.4,1.2]);}}
 /* gallery, sides: lube oil coolers on the left, fresh water coolers on the right */
 for(const s of[-1,1]){const y=Y1,X=s*21.6;for(const[i,z]of[-4.6,-.4].entries()){if(s<0){B.box(M.dark,3,.3,3,X,y+.15,z);B.cyl(M.orange,.8,2.6,X,y+1.1,z,'z',20);for(let k=-1;k<2;k++)B.torus(M.blue,.84,.06,X,y+1.1,z+k*.9,'z');B.pipe(M.orange,.16,[[X,y+1.9,z],[X,y+3.4,z],[-27,y+3.4,z]]);gauge(X+.86,y+1.1,z,.001);}else{B.box(M.blue,3,3.2,.4,X,y+1.6,z-1.1);B.box(M.blue,3,3.2,.4,X,y+1.6,z+1.1);for(let k=0;k<16;k++)B.box(k%2?M.steel:M.grey,2.6,2.8,.12,X,y+1.6,z-.9+k*.12);B.box(M.blue,.2,.2,2.6,X-1.2,y+3.1,z);B.box(M.blue,.2,.2,2.6,X+1.2,y+3.1,z);B.pipe(M.green2,.18,[[X-.8,y+2.6,z-1.2],[X-.8,y+2.6,-7],[X-.8,y+5.8,-7]]);}station(s<0?'Lube oil cooler '+(i+1):'Fresh water cooler '+(i+1),s*18.6,y,z,s<0?'m0':'m7',[X,y+1.6,z,3.2,3.4,3.2]);}}
 /* upper flat: generator sets, lube oil unit, control console, boiler */
 {const y=Y2,Z=-11.8;for(const[i,X]of[-17,-9].entries()){B.box(M.dark,6.4,.42,2.8,X,y+.21,Z);B.box(M.genG,3.6,1.7,1.9,X-1.2,y+1.3,Z);B.box(M.greenL,3.5,.32,1.95,X-1.2,y+2.3,Z);for(let k=0;k<6;k++)B.cyl(M.dark,.2,.3,X-2.6+k*.56,y+2.6,Z,'y',10);B.cyl(M.genG,1.05,2.2,X+1.8,y+1.45,Z,'x',28);for(let k=0;k<10;k++)B.torus(M.steel,1.07,.022,X+.85+k*.21,y+1.45,Z,'x');B.box(M.dark,.8,.6,.8,X+1.8,y+2.7,Z);const f=spinner(new THREE.CylinderGeometry(.66,.66,.08,7),M.black,X+3,y+1.45,Z,'x',0);f.rotation.z=Math.PI/2;moving.push(t=>{f.rotation.x=t*24;});B.pipe(M.lag,.22,[[X-2.2,y+2.6,Z-.5],[X-2.2,y+3.8,Z-.5],[X-2.2,TOP-1,-13.2]]);gauge(X-.5,y+1.4,Z+.97,.16);led(X-1.6,y+1.6,Z+.98,0x35f08a);station('Generator '+(i+1),X,y,-9.6,'t1',[X,y+1.6,Z,6.6,3.2,3]);}
  {const X=-1;B.box(M.grey,3.2,2.8,1.8,X,y+1.4,Z);B.box(M.dark,3.3,.3,1.9,X,y+.15,Z);gauge(X-.6,y+2,Z+.92,.2);gauge(X+.6,y+2,Z+.92,.2);B.pipe(M.orange,.14,[[X,y+2.8,Z],[X,y+4.4,Z],[X+5,y+4.4,Z-1.4]]);station('Lube oil unit',X,y,-9.6,'t2',[X,y+1.4,Z,3.4,3,2]);}
  {const X=9;B.box(M.teal,7.4,3.4,.9,X,y+1.7,-13.4);B.box(M.grey,7.6,1.1,1.4,X,y+.55,-12.6);for(const k of[-2.4,0,2.4]){const sc=new THREE.Mesh(new THREE.PlaneGeometry(1.7,1),new THREE.MeshStandardMaterial({color:0x08202a,emissive:0x2fc4ff,emissiveIntensity:1.1,roughness:.3}));sc.position.set(X+k,y+2.4,-12.93);scene.add(sc);}for(let k=0;k<8;k++){led(X-3+k*.85,y+1.2,-11.87,k%3?0x35f08a:0xffb02e);gauge(X-3+k*.85,y+3,-12.92,.15);}station('Engine control panel',X,y,-9.8,'t3',[X,y+1.7,-13,7.8,3.6,1.8]);}
  {const X=20;B.cyl(M.lag,2.1,5.2,X,y+2.8,Z,'y',30);B.sph(M.lag,2.1,X,y+5.4,Z,.42);B.cyl(M.dark,2.25,.32,X,y+.3,Z,'y',30);for(const k of[1.6,3,4.4])B.torus(M.steel,2.13,.05,X,y+k,Z);B.pipe(M.lag,.5,[[X,y+6,Z],[X,TOP,Z]]);B.box(M.red,1.6,1.8,1.4,X-2.4,y+1.2,Z+1);const g=new THREE.MeshStandardMaterial({color:0x331100,emissive:0xff7a18,emissiveIntensity:3}),w=new THREE.Mesh(new THREE.CircleGeometry(.32,20),g);w.position.set(X,y+2.2,Z+2.13);scene.add(w);B.torus(M.brass,.34,.05,X,y+2.2,Z+2.13,'z');const fire=new THREE.PointLight(0xff8a30,hi?18:10,8,2);fire.position.set(X,y+2.2,Z+3);scene.add(fire);moving.push(t=>{const f=.7+.3*Math.sin(t*11)*Math.sin(t*5.3)+.18*Math.sin(t*23);fire.intensity=(hi?18:10)*f;g.emissiveIntensity=2+1.6*f;});gauge(X-.9,y+3.4,Z+2.05,.22);gauge(X+.9,y+3.4,Z+2.05,.22);station('Aux boiler',X,y,-9.3,'t3',[X,y+3,Z,4.4,6.4,4.4]);}}
 /* signs and the colour-coded pipework the photo is full of */
 safety(0,11.2,-13.88,8.4);safety(-27.05,11,1,6.4,Math.PI/2);safety(27.05,11,1,6.4,-Math.PI/2);
 for(const[c,y,z,r]of[[M.orange,12,-13.3,.5],[M.red,11.2,-13.5,.26],[M.blue,10.6,-13.4,.28],[M.green2,5.6,-13.3,.34],[M.orange,4.8,-13.5,.42],[M.yellow,5.1,-12.9,.14],[M.red,18.6,-12,.4],[M.blue,18.2,-10.4,.5],[M.orange,18.9,-8.6,.6],[M.lag,18.5,-6,.46],[M.green2,18.2,-3.6,.3],[M.red,18.7,-1,.34],[M.yellow,18,1.2,.18]]){B.cyl(c,r,54.8,0,y,z,'x',12);for(let x=-24;x<26;x+=8)B.torus(M.steel,r*1.1,.05,x,y,z,'x');}
 for(const[c,x,z,y1,r]of[[M.red,-24,-13.4,TOP-1,.26],[M.blue,-23,-13.4,TOP-1,.22],[M.orange,-21.5,-13.2,12,.3],[M.green2,23,-13.3,TOP-1,.26],[M.red,21.6,-13.4,12,.22],[M.blue,4.2,-13.4,12,.22]]){B.cyl(c,r,y1,x,y1/2,z,'y',12);valve(x,3.6+Math.abs(x)%2,z+.4);}
 B.pipe(M.red,.32,[[-26.6,5.8,6],[-26.6,1,6],[-26.6,1,-6],[-20,1,-13]]);B.pipe(M.blue,.3,[[26.6,5.8,6],[26.6,1.4,6],[26.6,1.4,-6],[20,1.4,-13]]);B.pipe(M.orange,.36,[[-26.5,6.5,3],[-26.5,18.9,3],[-9,18.9,3],[-9,18.9,-8.6]]);
 B.bake(scene,!low);
 /* lights: tubes under each deck, warm enough to bring the paint out */
 scene.add(new THREE.HemisphereLight(0xffeedd,0x3a3f44,hi?1.05:1.7));
 const key=new THREE.DirectionalLight(0xfff0dc,hi?1.3:1.7);key.position.set(8,30,22);key.target.position.set(0,4,-4);key.castShadow=!low;if(!low){const c=key.shadow.camera;c.left=-36;c.right=36;c.top=26;c.bottom=-22;c.far=80;key.shadow.mapSize.set(hi?2048:1024,hi?2048:1024);key.shadow.bias=-.0006;key.shadow.normalBias=.03;}scene.add(key,key.target);
 const lampM=new THREE.MeshBasicMaterial({color:0xfff6e0});
 const lamps=[];const LS=[[-16,TOP-2.2,-2],[0,TOP-2.2,-2],[16,TOP-2.2,-2],[-8,Y2-.5,-11],[10,Y2-.5,-11],[-21,Y2-.5,0],[21,Y2-.5,0],[-8,Y1-.5,-10],[8,Y1-.5,-10],[0,Y1+1,6]];
 for(const[i,[x,y,z]]of LS.entries()){const l=new THREE.Mesh(new THREE.BoxGeometry(3,.12,.26),lampM);l.position.set(x,y,z);scene.add(l);if(low?i%3:hi?0:i%2)continue;const p=new THREE.PointLight(0xfff0d8,low?60:44,26,1.7);p.position.set(x,y-.4,z);scene.add(p);lamps.push({p,b:p.intensity,o:rnd(0,9)});}
 /* steam */
 const steamN=low?22:60,sp=new Float32Array(steamN*3),sv=[];const vents=[[-16,Y2+3,-12],[12,9.5,-2.5],[20,Y2+6,-12],[-14,Y1+3,-12]];
 for(let i=0;i<steamN;i++){const v=vents[i%vents.length];sp.set([v[0],v[1]+rnd(0,3),v[2]],i*3);sv.push({v,u:rnd(.5,1.2),d:rnd(-.2,.2)});}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
 const puff=canvasTex(64,64,(c,w)=>{const g=c.createRadialGradient(w/2,w/2,2,w/2,w/2,w/2);g.addColorStop(0,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,w);});
 scene.add(new THREE.Points(sg,new THREE.PointsMaterial({map:puff,size:1.7,transparent:true,opacity:.22,depthWrite:false,color:0xdff2f8})));
 /* the same crew, now making rounds over all three levels */
 const crew=[makeEngineer({coverall:0xe2701f,skin:0xe8b48a,cup:0xd92b22,hair:0x2b1d14,tool:'spanner',build:1}),makeEngineer({coverall:0x1f5fb0,skin:0xc98d62,cup:0xf0c419,hair:0x121212,tool:'clipboard',build:1.08,cap:0xdfe4e2}),makeEngineer({coverall:0x2f8f72,skin:0xf0c7a4,cup:0x1f6db5,hair:0x6d6a66,tool:'torch',build:.94,moustache:true}),makeEngineer({coverall:0xeceee9,skin:0xcf9668,cup:0x20262c,hair:0x17110e,tool:'clipboard',build:1.02,chief:true})];
 crew[3].chief=true;const workers=crew.slice(0,3);
 const STRIDE=3.6,WALKV=1.7,RUNV=4.6,hits=[];
 ['f1','m4','t2','m0'].forEach((id,i)=>{const e=crew[i],n=NODES[id];e.g.position.set(n.x,n.y,n.z);e.g.scale.setScalar(1.28*e.build);e.st={mode:'idle',t:rnd(.2,2),route:null,i:0,spd:WALKV,target:null};e.glanceT=0;e.glanceS=1;if(!low)e.g.traverse(o=>{if(o.isMesh)o.castShadow=true;});const hit=new THREE.Mesh(new THREE.CapsuleGeometry(.72,1.9,2,8),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1.2;hit.userData.e=e;e.g.add(hit);hits.push(hit);scene.add(e.g);});
 const taken=new Set(),pos=e=>e.g.position;
 const nearest=p=>{let b=null,bd=1e9;for(const k in NODES){const n=NODES[k],d=Math.hypot(n.x-p.x,n.z-p.z)+Math.abs(n.y-p.y)*4;if(d<bd){bd=d;b=n;}}return b;};
 /* shortest way along the decks and stairs */
 function route(p,goal){const a=nearest(p),dist=new Map([[a,0]]),prev=new Map(),open=[a];while(open.length){open.sort((x,y)=>dist.get(x)-dist.get(y));const n=open.shift();if(n===goal)break;for(const m of n.to){const d=dist.get(n)+Math.hypot(n.x-m.x,n.y-m.y,n.z-m.z);if(d<(dist.get(m)??1e9)){dist.set(m,d);prev.set(m,n);if(!open.includes(m))open.push(m);}}}const r=[];for(let n=goal;n;n=prev.get(n))r.unshift(n);return{path:r,len:dist.get(goal)??1e9};}
 const go=(e,goal,spd=WALKV)=>{const st=e.st;st.route=route(pos(e),goal).path;st.i=0;st.spd=spd;st.mode='go';};
 const free=e=>{if(e.st.target){taken.delete(e.st.target);e.st.target=null;}};
 function pick(e){if(e.chief){const busy=workers.filter(w=>w.st.mode==='work'&&w.st.t>3&&!w.react&&!w.down&&w!==e.st.last);busy.sort((a,b)=>route(pos(e),a.st.target.node).len-route(pos(e),b.st.target.node).len);const w=busy[0];e.st.who=w||null;go(e,w?w.st.target.node:NODES[WALK[Math.floor(Math.random()*WALK.length)]],1.45);return;}
  free(e);if(Math.random()<.22){e.st.then='look';go(e,NODES[WALK[Math.floor(Math.random()*WALK.length)]]);return;}const list=stations.filter(s=>!taken.has(s)&&s!==e.st.last);const s=list[Math.floor(Math.random()*list.length)]||stations[0];e.st.target=s;taken.add(s);e.st.then='work';go(e,s.node);}
 const face=(e,x,z,dt,k=6)=>{let r=Math.atan2(x-pos(e).x,z-pos(e).z)-e.g.rotation.y;r=Math.atan2(Math.sin(r),Math.cos(r));e.g.rotation.y+=r*Math.min(1,dt*k);};
 const turn=(e,a,dt,k=7)=>{let r=a-e.g.rotation.y;r=Math.atan2(Math.sin(r),Math.cos(r));e.g.rotation.y+=r*Math.min(1,dt*k);};
 function stepTo(e,n,dt,spd){const p=pos(e),dx=n.x-p.x,dz=n.z-p.z,d=Math.hypot(dx,dz),dy=n.y-p.y;if(d<.09&&Math.abs(dy)<.04){p.set(n.x,n.y,n.z);return true;}const s=Math.min(d,spd*dt);if(d>.001){p.x+=dx/d*s;p.z+=dz/d*s;p.y+=dy*Math.min(1,s/d);turn(e,Math.atan2(dx,dz),dt);}else p.y+=Math.sign(dy)*Math.min(Math.abs(dy),spd*dt);e.lean=spd>3?.26:0;e.walk(dt*spd*STRIDE);return false;}
 /* returns true once the end of the route is reached */
 function follow(e,dt){const st=e.st;if(!st.route||st.i>=st.route.length)return true;if(stepTo(e,st.route[st.i],dt,st.spd))st.i++;return st.i>=st.route.length;}
 const STAND=['kipup','backroll','handspring'],MOVES=['backflip','frontflip','spinkick','cartwheel','butterfly'],FALL=.45,LIE=2,MOVE=1,POSE=.75;
 function knock(e){if(e.down)return;const a=MOVES.slice().sort(()=>Math.random()-.5);e.react=null;e.lean=0;e.glance=0;e.glanceT=0;e.down={t:0,seq:[STAND[Math.floor(Math.random()*3)],a[0],a[1]]};e.g.rotation.y=Math.atan2(cam.position.x-pos(e).x,cam.position.z-pos(e).z);}
 function updateDown(e,dt){const d=e.down;d.t+=dt;const t=d.t;if(t<FALL)return e.fall(t/FALL);if(t<FALL+LIE)return e.fall(1);const u=t-FALL-LIE;if(u<3*MOVE){const i=Math.floor(u/MOVE);e.stunt(d.seq[i],u/MOVE-i);return;}if(u<3*MOVE+POSE){e.stunt('ninja',(u-3*MOVE)/POSE);return;}e.upright();e.down=null;const st=e.st;if(st.target&&st.then==='work'&&st.mode==='go')go(e,st.target.node,st.spd);else{st.mode='idle';st.t=.2;}}
 /* a pulsing ring marks the machine someone was sent to */
 const ping=new THREE.Mesh(new THREE.RingGeometry(.7,1,32),new THREE.MeshBasicMaterial({color:0x3fe0cf,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));ping.rotation.x=-Math.PI/2;ping.visible=false;scene.add(ping);let pingBy=null;
 function dispatch(s){const w=workers.filter(e=>!e.down).map(e=>({e,l:route(pos(e),s.node).len})).sort((a,b)=>a.l-b.l)[0];if(!w)return false;const e=w.e;e.react=null;e.st.greet=0;free(e);if(taken.has(s)){const o=workers.find(q=>q.st.target===s);if(o){free(o);o.st.mode='idle';o.st.t=.2;}}e.st.target=s;taken.add(s);e.st.then='work';e.st.job='inspect';go(e,s.node,RUNV);ping.position.set(s.x,s.y+.05,s.z);ping.visible=true;pingBy=e;return true;}
 function updateChief(e,dt,t){const st=e.st;st.t-=dt;
  if(st.mode==='idle'){e.rest(dt);if(st.t<=0)pick(e);}
  else if(st.mode==='go'){if(follow(e,dt)){if(st.who&&st.who.st.mode==='work'){const w=st.who,q=pos(w),s=q.x<pos(e).x?1.8:-1.8;st.spot={x:q.x+s,y:q.y,z:q.z+.6};st.mode='approach';}else{st.who=null;st.mode='idle';st.t=rnd(1,3);}}}
  else if(st.mode==='approach'){const w=st.who;if(w.st.mode!=='work'){st.mode='idle';st.t=.5;}else if(stepTo(e,st.spot,dt,1.45)){st.mode='supervise';st.t=7;w.st.greet=7;w.st.t=Math.max(w.st.t,7.5);}}
  else if(st.mode==='supervise'){const w=st.who;face(e,pos(w).x,pos(w).z,dt);e.brief(t,dt);if(st.t<=0||w.st.mode!=='work'){w.st.greet=0;st.last=w;st.mode='idle';st.t=rnd(.4,1.4);}}}
 function updateCrew(dt,t){for(const e of crew){const st=e.st;
  if(e.down){updateDown(e,dt);continue;}
  if(e.glanceT>0){e.glanceT-=dt;e.glance+=(e.glanceS*1.25-e.glance)*Math.min(1,dt*8);}else e.glance*=.86;
  if(e.react){e.react.t-=dt;face(e,cam.position.x,cam.position.z,dt,10);if(e.chief)e.salute(dt);else e.cheer(t,dt);if(e.react.t<=0){e.react=null;e.glanceT=3;e.glanceS=Math.random()<.5?-1:1;if(st.mode!=='go'){if(!e.chief)free(e);if(st.who)st.who.st.greet=0;st.mode='idle';st.t=0;}}continue;}
  if(e.chief){updateChief(e,dt,t);continue;}
  if(st.greet>0){st.greet-=dt;st.t-=dt;const c=crew[3];face(e,pos(c).x,pos(c).z,dt,5);if(st.greet>5.6)e.salute(dt);else e.listen(t,dt);continue;}
  st.t-=dt;
  if(st.mode==='idle'){e.rest(dt);if(st.t<=0)pick(e);}
  else if(st.mode==='go'){if(follow(e,dt)){e.lean=0;if(pingBy===e){ping.visible=false;pingBy=null;}if(st.then==='work'&&st.target){st.mode='work';st.t=rnd(4,8);st.job=st.job||['inspect','wrench','note'][Math.floor(Math.random()*3)];}else{st.mode='idle';st.t=rnd(.6,2.2);}}}
  else if(st.mode==='work'){turn(e,st.target.face,dt,5);e.work(st.job,t,dt);if(st.t<=0){st.last=st.target;st.job=null;free(e);st.mode='idle';st.t=rnd(.4,1.6);}}}
  if(ping.visible){const k=1+Math.sin(t*6)*.25;ping.scale.set(k,k,1);}}
 /* camera: drifts through the room by itself; a drag takes it over, and it drifts on again after a few seconds alone */
 let view=null;const look=new THREE.Vector3();let px=0,py=0,sx=0,sy=0,ux=0,uy=7,uz=23,uw=0,idle=99;
 function setPointer(x,y){px=x;py=y;}
 const RX=19,RY0=3.4,RY1=15,Z0=9,Z1=31;
 function drag(dx,dy){if(uw<.02){ux=camX;uy=camY;uz=camZ;}uw=1;idle=0;const k=camDist()*.0021;ux=Math.max(-RX,Math.min(RX,ux-dx*k));uy=Math.max(RY0,Math.min(RY1,uy+dy*k));}
 function zoom(f){if(uw<.02){ux=camX;uy=camY;uz=camZ;}uw=1;idle=0;uz=Math.max(Z0,Math.min(Z1,uz*f));}
 const camDist=()=>camZ+6;let camX=0,camY=7,camZ=23;
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
 const aim=(x,y)=>{const r=canvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(ndc,cam);};
 function at(x,y){aim(x,y);const h=ray.intersectObjects(hits,false)[0];return h?h.object.userData.e:null;}
 function tap(e){if(e.down)return;e.react={t:1};}
 function machine(x,y){aim(x,y);const h=ray.intersectObjects(machineHits,false)[0];return h?dispatch(h.object.userData.s):false;}
 function resize(w,h){renderer.setSize(w,h,false);cam.aspect=w/h;cam.fov=cam.aspect<1.5?50:42;cam.updateProjectionMatrix();}
 let raf=0,running=false,last=0,t=0,fr=0,fAcc=0,slow=0;
 function frame(now){if(!running)return;raf=requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000||.016);last=now;t+=dt;idle+=dt;
  sx+=(px-sx)*.04;sy+=(py-sy)*.04;if(idle>7)uw=Math.max(0,uw-dt*.35);
  const ax=Math.sin(t*.07)*15,ay=8.2+Math.sin(t*.043)*4.6,az=20+Math.sin(t*.031)*7,w=uw*uw*(3-2*uw);camX=ax+(ux-ax)*w;camY=ay+(uy-ay)*w;camZ=az+(uz-az)*w;
  if(view){const q=crew[view.i].g.position;cam.position.set(q.x+(view.dx||0),q.y+2.1,q.z+(view.d||5));look.set(q.x,q.y+(view.ly||1.9),q.z);}else{cam.position.set(camX*.8+sx*1.2,camY+1.4+sy*.5,camZ);look.set(camX+sx*.5,camY-sy*.3,-8);}cam.lookAt(look);
  for(const f of moving)f(t);for(const b of blink)b.m.emissiveIntensity=Math.sin(t*b.s+b.p)>.2?2.2:.2;
  for(const l of lamps)l.p.intensity=l.b*(.95+.05*Math.sin(t*2+l.o)-(Math.sin(t*17+l.o)>.992?.5:0));
  const a=sg.attributes.position;for(let i=0;i<steamN;i++){const v=sv[i];let y=a.getY(i)+v.u*dt,x=a.getX(i)+v.d*dt;if(y>v.v[1]+5){y=v.v[1];x=v.v[0];}a.setX(i,x);a.setY(i,y);}a.needsUpdate=true;
  updateCrew(dt,t);renderer.render(scene,cam);
  /* drop the resolution if this device cannot hold the frame rate */
  fr++;fAcc+=dt;if(fAcc>=2){const fps=fr/fAcc;fr=0;fAcc=0;if(fps<26&&++slow>=2&&pr>.75){pr=Math.max(.75,pr-.25);renderer.setPixelRatio(pr);renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);slow=0;renderer.shadowMap.autoUpdate=pr>1;}else if(fps>=26)slow=0;}}
 return{setView(v){view=v;},resize,setPointer,tap,knock,machine,drag,zoom,over:at,start(){if(running)return;running=true;last=performance.now();raf=requestAnimationFrame(frame);},stop(){running=false;cancelAnimationFrame(raf);},crew,stations,get time(){return t;},dispatch};
}
