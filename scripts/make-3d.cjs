/* Step 2 of the 3D logos: turns brand/3d/layers.json into real 3D models and HD renders with a transparent background.
   Run: npx electron scripts/make-3d.cjs   Writes brand/3d/<name>-3d.png (2048 px) and <name>.glb */
const {app,BrowserWindow}=require('electron'),path=require('path'),fs=require('fs'),esbuild=require('esbuild');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'brand','3d'),TMP=path.join(OUT,'_page.js');
const PAGE=String.raw`
import * as THREE from 'three';
import {shapesFrom} from '${ROOT.replace(/\\/g,'/')}/scripts/logo-shapes.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
const S=2048,renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(S,S);renderer.setClearColor(0,0);renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;document.body.append(renderer.domElement);
const pm=new THREE.PMREMGenerator(renderer),env=pm.fromScene(new RoomEnvironment(),.03).texture;
const clean=pts=>{const o=[];for(const p of pts)if(!o.length||p.distanceTo(o[o.length-1])>2.5)o.push(p);if(o.length>2&&o[0].distanceTo(o[o.length-1])<2.5)o.pop();return o;};
window.build=async(name,L,light)=>{const scene=new THREE.Scene();scene.environment=env;scene.environmentIntensity=.42;
 const key=new THREE.DirectionalLight(0xffffff,1.5);key.position.set(-2.2,3,5);const rim=new THREE.DirectionalLight(0xbfefff,.7);rim.position.set(4,1,2);scene.add(key,rim);
 const g=new THREE.Group(),unit=1/L.size;
 for(const l of L.layers){const shapes=shapesFrom(l.d);if(!shapes.length)continue;const dp=l.depth*L.size,bv=Math.min(dp*.3,L.size*.0021);
  const geo=new THREE.ExtrudeGeometry(shapes,{depth:dp,bevelEnabled:true,bevelThickness:bv,bevelSize:bv*.8,bevelOffset:-bv*.8,bevelSegments:5,curveSegments:12});
  const mat=new THREE.MeshPhysicalMaterial({color:l.color,metalness:l.metal,roughness:.36,clearcoat:.55,clearcoatRoughness:.22,side:THREE.DoubleSide});
  const m=new THREE.Mesh(geo,mat);m.position.z=l.z*L.size;g.add(m);}
 g.scale.set(unit,-unit,unit);const piv=new THREE.Group();piv.add(g);const bx=new THREE.Box3().setFromObject(piv),c=bx.getCenter(new THREE.Vector3()),sz=bx.getSize(new THREE.Vector3());g.position.sub(c);const hold=new THREE.Group();hold.add(piv);hold.scale.setScalar(1/Math.max(sz.x,sz.y));hold.rotation.set(-.09,.24,.012);scene.add(hold);
 const cam=new THREE.PerspectiveCamera(22,1,.1,20);cam.position.set(0,0,2.85);cam.lookAt(0,0,0);renderer.render(scene,cam);
 const png=renderer.domElement.toDataURL('image/png');
 let glb=null;if(!light){const ab=await new Promise((ok,no)=>new GLTFExporter().parse(hold,ok,no,{binary:true}));glb=btoa(new Uint8Array(ab).reduce((s,b)=>s+String.fromCharCode(b),''));}
 for(const o of g.children){o.geometry.dispose();o.material.dispose();}
 return{png:png.split(',')[1],glb};};
window.ready=true;`;
app.commandLine.appendSwitch('ignore-gpu-blocklist');app.disableHardwareAcceleration=undefined;
app.whenReady().then(async()=>{fs.writeFileSync(TMP,PAGE);const js=esbuild.buildSync({entryPoints:[TMP],bundle:true,format:'iife',write:false,absWorkingDir:ROOT,nodePaths:[path.join(ROOT,'node_modules')]}).outputFiles[0].text;fs.unlinkSync(TMP);
 const html=path.join(OUT,'_page.html'),jsf=path.join(OUT,'_page.bundle.js');fs.writeFileSync(jsf,js);fs.writeFileSync(html,'<!doctype html><body style="margin:0;background:transparent"><script src="_page.bundle.js"></script>');
 const w=new BrowserWindow({width:400,height:400,show:false,webPreferences:{backgroundThrottling:false}});await w.loadFile(html);
 const all=JSON.parse(fs.readFileSync(path.join(OUT,'layers.json'),'utf8'));
 for(const name of Object.keys(all).filter(n=>!process.env.ONLY||process.env.ONLY.split(',').includes(n))){const light=/light/.test(name);fs.writeFileSync(path.join(OUT,'_one.json'),'');const r=await w.webContents.executeJavaScript('build('+JSON.stringify(name)+','+JSON.stringify(all[name])+','+light+')');fs.writeFileSync(path.join(OUT,name+'-3d.png'),Buffer.from(r.png,'base64'));if(r.glb)fs.writeFileSync(path.join(OUT,name+'.glb'),Buffer.from(r.glb,'base64'));console.log(name,'done');}
 for(const f of['_page.html','_page.bundle.js','_one.json'])fs.rmSync(path.join(OUT,f),{force:true});app.quit();}).catch(e=>{console.error(e);app.exit(1);});
