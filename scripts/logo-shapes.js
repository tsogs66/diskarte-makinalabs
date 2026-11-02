/* Turns a traced outline into three.js shapes. Each closed loop is flattened, and a loop is a hole when an odd number of other loops surround it. */
import * as THREE from 'three';
const flatten=d=>{const t=d.match(/[MLCZ]|-?\d*\.?\d+/g),loops=[];let i=0,c=null,cmd='',p=null;const num=()=>parseFloat(t[i++]),isN=()=>i<t.length&&!/[MLCZ]/.test(t[i]);
 while(i<t.length){if(/[MLCZ]/.test(t[i]))cmd=t[i++];if(cmd==='M'){c=[];loops.push(c);p=new THREE.Vector2(num(),num());c.push(p);cmd='L';}else if(cmd==='L'){if(!isN())continue;p=new THREE.Vector2(num(),num());c.push(p);}else if(cmd==='C'){if(!isN())continue;const a=p,b=new THREE.Vector2(num(),num()),e=new THREE.Vector2(num(),num()),f=new THREE.Vector2(num(),num());for(let k=1;k<=12;k++){const u=k/12,v=1-u;c.push(new THREE.Vector2(v*v*v*a.x+3*v*v*u*b.x+3*v*u*u*e.x+u*u*u*f.x,v*v*v*a.y+3*v*v*u*b.y+3*v*u*u*e.y+u*u*u*f.y));}p=f;}else if(cmd==='Z'){cmd='';}else i++;}
 return loops;};
/* corners rounder than the bevel make it spike, so outlines are simplified until each corner is one point */
const EPS=.4,gap=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy);return l<1e-6?p.distanceTo(a):Math.abs(dy*(p.x-a.x)-dx*(p.y-a.y))/l;};
const rdp=(P,i,j,keep)=>{let m=-1,d=EPS;for(let k=i+1;k<j;k++){const g=gap(P[k],P[i],P[j]);if(g>d){d=g;m=k;}}if(m>=0){keep[m]=1;rdp(P,i,m,keep);rdp(P,m,j,keep);}};
const tidy=pts=>{const P=[];for(const p of pts)if(!P.length||p.distanceTo(P[P.length-1])>.2)P.push(p);if(P.length>2&&P[0].distanceTo(P[P.length-1])<.2)P.pop();let f=0,d=0;P.forEach((p,i)=>{const g=p.distanceTo(P[0]);if(g>d){d=g;f=i;}});const keep=new Uint8Array(P.length+1);keep[0]=keep[f]=1;const Q=[...P,P[0]];rdp(Q,0,f,keep);rdp(Q,f,P.length,keep);const S=P.filter((_,i)=>keep[i]),n=S.length,turn=i=>{const a=S[(i+n-1)%n],b=S[i],c=S[(i+1)%n];let r=Math.abs(Math.atan2(c.y-b.y,c.x-b.x)-Math.atan2(b.y-a.y,b.x-a.x));if(r>Math.PI)r=2*Math.PI-r;return r;},o=[];let last=-1;S.forEach((p,i)=>{const near=last>=0&&p.distanceTo(S[last])<7;if(near&&(turn(i)>.5||turn(last)>.5))return;o.push(p);last=i;});return o;};
const inside=(p,poly)=>{let on=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)on=!on;}return on;};
export function shapesFrom(d){const L=flatten(d).map(tidy).filter(l=>l.length>2).map(pts=>({pts,area:Math.abs(THREE.ShapeUtils.area(pts))})).sort((a,b)=>b.area-a.area);
 for(const l of L){l.parents=L.filter(o=>o!==l&&o.area>l.area&&inside(l.pts[0],o.pts));l.depth=l.parents.length;}
 const out=L.filter(l=>l.depth%2===0);for(const o of out)o.shape=new THREE.Shape(o.pts);
 for(const h of L.filter(l=>l.depth%2)){const host=h.parents.filter(p=>p.depth%2===0).sort((a,b)=>a.area-b.area)[0];if(host)host.shape.holes.push(new THREE.Path(h.pts));}
 return out.map(o=>o.shape);}
