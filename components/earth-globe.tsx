'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {routes,hominins} from '@/lib/earth/migration';
import {glacialBlend,humidSaharaWeight} from '@/lib/earth/glacial-surface';
import {events,EarthEvent,seaLevel,cryogenianIce,latePaleozoicIce,latePleistoceneIce} from '@/lib/earth/history';
export type Layers={clouds:boolean;plates:boolean;climate:boolean;ice:boolean;life:boolean;humans:boolean;migration:boolean;civilization:boolean;grid:boolean;ghost?:boolean};
export type GlobeApi={zoom:(factor:number)=>void;reset:()=>void;focus:(lat:number,lon:number)=>void};
type Props={age:number;layers:Layers;selected:EarthEvent|null;onSelect:(e:EarthEvent)=>void;onReady:(api:GlobeApi)=>void;autoRotate:boolean;onStatus:(s:string)=>void;onBuffering?:(waiting:boolean)=>void;routeIds?:string[];pinnedLocation?:{lat:number;lon:number;name:string}|null};
const vertex=`varying vec2 vUv;varying vec3 vN;varying vec3 vP;varying vec3 vV;void main(){vUv=uv;vP=position;vN=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vV=-p.xyz;gl_Position=projectionMatrix*p;}`;
const fragment=`
precision highp float;
uniform sampler2D earth;uniform sampler2D mapA;uniform sampler2D mapB;uniform sampler2D modernElev;
uniform vec2 stepA;uniform vec2 stepB;
uniform float humidSahara;
uniform float blend;uniform float age;uniform float modern;uniform float clouds;uniform float climate;uniform float ice;uniform float grid;uniform float tick;uniform float seaLevel;uniform float ancientIce;uniform float latePaleoIce;uniform float pleistoceneIce;uniform float ghost;
varying vec2 vUv;varying vec3 vN;varying vec3 vP;varying vec3 vV;
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.07+4.3;a*=.5;}return v;}
float heightAt(sampler2D tex,vec2 uv){vec2 c=texture2D(tex,uv).rg*255.;return c.x*256.+c.y-10000.;}
float geoMask(vec3 point,float latDeg,float lonDeg,float radiusDeg){
 float la=radians(latDeg),lo=radians(lonDeg),r=radians(radiusDeg);
 vec3 center=vec3(cos(la)*cos(lo),sin(la),-cos(la)*sin(lo));
 return smoothstep(cos(r),cos(r*.70),dot(point,center));
}
void main(){
 vec3 n=normalize(vN);vec3 p=normalize(vP);float lat=abs(p.y);float h=mix(heightAt(mapA,vUv),heightAt(mapB,vUv),blend);
 // Precambrian terrain is a qualitative illustration, not reconstructed coastlines.
 float early=smoothstep(540.,620.,age);float rough=fbm(p*55.);float terrain=fbm(p*3.8);
 float maturity=1.-smoothstep(2500.,4100.,age);float youngCrust=smoothstep(3800.,4450.,age);
 float drift=age*.00085;vec3 ancientP=vec3(cos(drift)*p.x-sin(drift)*p.z,p.y,sin(drift)*p.x+cos(drift)*p.z);
 if(age>540.){float islands=fbm(ancientP*6.2+vec3(4.1,1.7,age*.0005));float cores=fbm(ancientP*2.8+vec3(age*.00045,2.4,5.3));terrain=mix(islands,cores,maturity);h=mix(h,(terrain-mix(.635,.51,maturity))*14000.,early);}
 float glacial=ice*step(.0001,age)*(1.-step(.125,age));float sea=seaLevel*glacial;
 float land=smoothstep(sea-35.,sea+65.,h);float shelf=smoothstep(-1600.,-50.,h);
 vec3 ocean=mix(vec3(.0025,.009,.022),vec3(.009,.10,.12),pow(shelf,2.)*.8);ocean+=rough*.002;
 ocean=mix(ocean,mix(vec3(.012,.037,.049),vec3(.035,.12,.12),shelf*.55),early*smoothstep(2200.,3200.,age));
 // Broad surface character only: PaleoDEM supplies elevation, while these
 // climate belts remain illustrative and must not be read as biome boundaries.
 // Early low-growing land vegetation is distinct from Devonian forest
 // expansion. These weights illustrate surface character, not coverage data.
 float pioneers=(1.-smoothstep(430.,470.,age))*.22;
 float forests=1.-smoothstep(360.,395.,age);
 float plants=mix(pioneers,1.,forests);
 float equator=1.-smoothstep(.10,.38,lat);float subtropics=exp(-pow((lat-.34)/.16,2.));
 float pangaeaDry=smoothstep(180.,235.,age)*(1.-smoothstep(315.,335.,age));
 // Qualitative climate succession, not a reconstructed vegetation dataset.
 // Warm Paleogene forest belts give way gradually to more open Neogene land.
 float cenozoic=1.-smoothstep(66.,75.,age);
 float warmPaleogene=smoothstep(23.,50.,age)*cenozoic;
 float openNeogene=(1.-smoothstep(7.,28.,age))*cenozoic;
 float regional=fbm(p*12.3+vec3(8.,2.,5.));
 float temperate=exp(-pow((lat-.66)/.27,2.));
 float moisture=clamp(.20+equator*.65+temperate*.38+(regional-.48)*1.6-subtropics*.27-pangaeaDry*(.24+.22*rough)+warmPaleogene*(.30+.22*lat)-openNeogene*.15,0.,1.);
 vec3 mineral=mix(vec3(.23,.17,.095),vec3(.12,.105,.077),rough);
 vec3 dryland=mix(vec3(.34,.235,.105),vec3(.16,.135,.055),rough);
 vec3 green=mix(vec3(.014,.065,.018),vec3(.042,.125,.033),rough);
 vec3 low=mix(mineral,mix(dryland,green,moisture),plants);
 // Carboniferous wetlands were concentrated in humid tropical basins, while
 // Permian and Triassic Pangaea developed extensive seasonal dry interiors.
 float coalWet=smoothstep(299.,307.,age)*(1.-smoothstep(335.,350.,age))*equator;
 low=mix(low,vec3(.09,.225,.135),coalWet*moisture*.55);
 low=mix(low,dryland,pangaeaDry*(.24+.26*subtropics));
 if(age>470.)low=mineral;
 low=mix(low,mix(vec3(.21,.19,.16),vec3(.08,.075,.07),youngCrust),early);
 // Resolve relief from the elevation field itself. Fine texture is illustrative;
 // it adds material detail without inventing additional continental boundaries.
 float fine=fbm(p*240.);
 float hx=mix((heightAt(mapA,vUv+vec2(stepA.x,0.))-heightAt(mapA,vUv-vec2(stepA.x,0.)))/(stepA.x*360.),(heightAt(mapB,vUv+vec2(stepB.x,0.))-heightAt(mapB,vUv-vec2(stepB.x,0.)))/(stepB.x*360.),blend);
 float hy=mix((heightAt(mapA,vUv+vec2(0.,stepA.y))-heightAt(mapA,vUv-vec2(0.,stepA.y)))/(stepA.y*180.),(heightAt(mapB,vUv+vec2(0.,stepB.y))-heightAt(mapB,vUv-vec2(0.,stepB.y)))/(stepB.y*180.),blend);
 float relief=clamp(1.+(hx*.00022+hy*.00030)*(1.-early),.48,1.4);
 vec3 ground=mix(low,vec3(.24,.22,.18),smoothstep(1600.,5500.,h));
 ground*=relief*(.70+rough*.30+fine*.30);
 vec3 base=mix(ocean,ground,land);
 // Bathymetry becomes land as global sea level falls. A subdued mineral tint
 // makes Beringia, Sunda and Sahul legible without implying exact vegetation.
 float exposedShelf=glacial*land*(1.-smoothstep(-12.,18.,h))*smoothstep(sea-30.,sea+35.,h);
 base=mix(base,mix(vec3(.34,.31,.225),vec3(.22,.285,.235),equator*.35),exposedShelf*.72);
 // Preserve recent-world detail during glacial cycles. Suppressing the entire
 // satellite surface made every ice age revert to the coarse painted globe.
 // Exposed shelves retain reconstructed land; ice is drawn geographically below.
 vec3 sat=pow(texture2D(earth,vUv).rgb,vec3(2.2));
 base=mix(base,sat,modern*(1.-exposedShelf)*(1.-pleistoceneIce*.18));
 // Antarctic growth and northern ice are separate, continuous transitions.
 float cap=smoothstep(.88,.97,-p.y)*land*(1.-smoothstep(33.5,34.5,age));
 cap=max(cap,geoMask(p,73.,-42.,15.)*land*(1.-smoothstep(2.5,3.5,age)));
 float paleoIce=ancientIce;cap=max(cap,paleoIce*smoothstep(.02,.28,lat));
 float gondwanaIce=latePaleoIce*smoothstep(.43,.82,-p.y)*land;cap=max(cap,gondwanaIce);
 // Simplified geographic footprints, guided by PaleoMIST rather than the
 // former screen-space blobs. Margins remain illustrative at this resolution.
 float northAmerica=max(max(geoMask(p,58.,-92.,24.),geoMask(p,54.,-125.,14.)),geoMask(p,74.,-86.,14.));
 float eurasia=max(max(geoMask(p,64.,24.,21.),geoMask(p,76.,43.,16.)),geoMask(p,55.,-4.,8.));
 float patagonia=geoMask(p,-50.,-73.,9.);float antarcticShelf=smoothstep(.69,.82,-p.y);
 float lgmFootprint=max(max(northAmerica,eurasia),max(patagonia,antarcticShelf));
 cap=max(cap,pleistoceneIce*land*lgmFootprint);base=mix(base,vec3(.66,.78,.83)*(rough*.16+.88),cap);
 // The early/mid-Holocene Sahara supported steppe and savanna. This is a
 // regional illustration (NOAA NCEI), not an exact vegetation reconstruction.
 // The Younger Dryas interruption is deliberately excluded from this envelope.
 float sahara=max(geoMask(p,23.,3.,17.),geoMask(p,22.,22.,14.))*land;
 base=mix(base,mix(vec3(.12,.16,.045),vec3(.19,.22,.08),rough)*relief,humidSahara*sahara*.85);
 float molten=smoothstep(4460.,4520.,age);float lava=pow(max(0.,1.-abs(terrain-.51)*25.),3.);vec3 magma=vec3(.038,.016,.011)+lava*vec3(1.6,.30,.015);base=mix(base,magma,molten);
 float cloudN=fbm(p*8.+vec3(tick*.001+early*age*.0003,0,early*1.7));float cloudShape=smoothstep(.53,.69,cloudN)*clouds*(1.-molten)*.40;cloudShape*=.4+.6*abs(sin(p.y*9.+cloudN*7.));
 float steam=smoothstep(4350.,4460.,age)*(1.-molten);cloudShape=mix(cloudShape,clouds*(.22+.50*smoothstep(.32,.64,cloudN)),steam);base=mix(base,mix(vec3(.78,.84,.87),vec3(.58,.55,.50),steam*.7),cloudShape);
 if(climate>.5){vec3 temp=mix(vec3(.62,.23,.09),vec3(.10,.35,.60),smoothstep(.05,.9,lat));base=mix(base,temp,.53);}
 if(grid>.5){float a=abs(fract(vUv.x*24.+.5)-.5);float b=abs(fract(vUv.y*12.+.5)-.5);float line=1.-smoothstep(.001,.007,min(a,b));base=mix(base,vec3(.40,.60,.62),line*.22);}
 if(ghost>.01&&age>.3){
  float mLand=step(0.,heightAt(modernElev,vUv));
  float mLandR=step(0.,heightAt(modernElev,vUv+vec2(1./1801.,0.)));
  float mLandL=step(0.,heightAt(modernElev,vUv-vec2(1./1801.,0.)));
  float mLandU=step(0.,heightAt(modernElev,vUv+vec2(0.,1./901.)));
  float mLandD=step(0.,heightAt(modernElev,vUv-vec2(0.,1./901.)));
  float mCoast=max(abs(mLand*2.-mLandR-mLandL),abs(mLand*2.-mLandU-mLandD));
  vec3 ghostColor=vec3(.96,.84,.52);
  base=mix(base,ghostColor,mCoast*ghost*.92);
 }
 vec3 light=normalize(vec3(-.55,.5,1.));
 float sunDot=dot(n,light);
 float diffuse=max(0.,sunDot);
 float shade=.28+diffuse*.82;
 vec3 color=base*shade;
 float nightLit=1.-smoothstep(-.1, .3, sunDot);
 float twilight=smoothstep(-.25,.04,sunDot)*smoothstep(.30,.04,sunDot);
 color+=vec3(.16,.08,.03)*twilight*land*.45;

 if(nightLit>.05&&age<=.015&&modern>.01){
  float modernCiv=(1.-smoothstep(0.,.015,age))*modern;
  float habitable=land*(1.-cap)*(1.-exposedShelf);
  float cityN=fbm(p*140.)*.65+fbm(p*60.)*.35;
  float cityGlow=smoothstep(.52,.78,cityN)*habitable;
  vec3 cityColor=vec3(1.0,.84,.45);
  color+=cityColor*cityGlow*nightLit*modernCiv*2.2;
 }

 float sibWindow=smoothstep(2.5,0.,abs(age-251.9));
 float sibArea=geoMask(p,64.,92.,18.);
 float chicWindow=smoothstep(.9,0.,abs(age-66.04));
 float chicArea=geoMask(p,21.4,-89.5,9.);
 vec3 impCenter=vec3(cos(radians(21.4))*cos(radians(-89.5)),sin(radians(21.4)),-cos(radians(21.4))*sin(radians(-89.5)));
 float impDist=length(p-impCenter);
 float shockRing=smoothstep(.04,0.,abs(fract(impDist*22.-tick*1.5)-.5))*chicWindow*smoothstep(.6,0.,impDist);
 float decWindow=smoothstep(1.6,0.,abs(age-66.2));
 float decArea=geoMask(p,18.5,73.5,12.);
 float campWindow=smoothstep(2.0,0.,abs(age-201.5));
 float campArea=geoMask(p,15.0,-25.0,24.);
 float cataclysm=max(max(sibArea*sibWindow,chicArea*chicWindow),max(decArea*decWindow,campArea*campWindow));
 if(cataclysm>.001){
  float fissure=pow(max(0.,1.-abs(fbm(p*45.+vec3(0.,0.,tick*.02))-.5)*16.),2.2);
  vec3 magmaColor=mix(vec3(.85,.15,.01),vec3(1.3,.75,.15),fissure);
  color+=magmaColor*cataclysm*(fissure*.8+.25);
 }
 if(shockRing>.01){color+=vec3(1.1,.9,.7)*shockRing*.7;}

 float spec=pow(max(0.,dot(reflect(-light,n),normalize(vV))),65.)*(1.-land)*.14;color+=vec3(.7,.85,1.)*spec;
 float rim=pow(1.-max(0.,dot(n,normalize(vV))),3.2);color+=vec3(.06,.25,.42)*rim*pow(diffuse,.4)*(1.-molten);
 color+=molten*lava*vec3(.25,.045,.002);gl_FragColor=vec4(pow(max(color,vec3(0)),vec3(1./2.2)),1.);
}`;

function xyz(lat:number,lon:number,r=1){
 const a=THREE.MathUtils.degToRad(lat),b=THREE.MathUtils.degToRad(lon);
 return new THREE.Vector3(Math.cos(a)*Math.cos(b)*r,Math.sin(a)*r,-Math.cos(a)*Math.sin(b)*r);
}
function textureSize(texture:THREE.Texture){
 return texture.image as {width:number;height:number};
}
function disposeTree(obj:THREE.Object3D){
 obj.traverse(o=>{
  const m=o as THREE.Mesh;
  if(m.geometry)m.geometry.dispose();
  if(m.material){for(const a of Array.isArray(m.material)?m.material:[m.material])a.dispose();}
 });
}

// Persistent module-level caches across route switches
let globalEarthTexture: THREE.Texture | null = null;
let globalEarthPromise: Promise<THREE.Texture> | null = null;
const globalTexCache = new Map<number, THREE.Texture>();
let globalPlatesData: any = null;
let globalPlatesPromise: Promise<any> | null = null;

// Eagerly prewarm base textures as early as possible in browser
if (typeof window !== 'undefined') {
  if (!globalEarthPromise) {
    const l = new THREE.TextureLoader();
    globalEarthPromise = new Promise<THREE.Texture>((resolve, reject) => {
      l.load('/textures/earth.webp', tex => {
        tex.anisotropy = 8;
        globalEarthTexture = tex;
        resolve(tex);
      }, undefined, reject);
    }).catch(err => {
      console.warn('Preload earth texture failed', err);
      return null as any;
    });
  }
  if (!globalTexCache.has(0)) {
    const l = new THREE.TextureLoader();
    l.load('/paleo-detail/0.png', tex => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      globalTexCache.set(0, tex);
    });
  }
}

export default function Globe(props:Props){
 return <TerrainGlobe {...props}/>;
}

function TerrainGlobe(props:Props){
 const host=useRef<HTMLDivElement>(null),current=useRef(props);
 useEffect(()=>{current.current=props;},[props]);
 const [error,setError]=useState(''),[retry,setRetry]=useState(0);
 const initialReady = !!globalEarthTexture || globalTexCache.has(0) || (props.age > 620);
 const [loaded,setLoaded]=useState(initialReady),[waiting,setWaiting]=useState(false);

 useEffect(()=>{
  const el=host.current;if(!el)return;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}
  catch{current.current.onBuffering?.(true);setError('3D rendering is unavailable on this device. The timeline and chapters remain available.');return;}
  let alive=true,contextUnavailable=false;current.current.onBuffering?.(!initialReady);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.5:2));renderer.setClearColor(0,0);el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Interactive Earth. Drag to rotate, pinch or scroll to zoom. Use arrow keys to rotate, +/- to zoom, R to reset.');
  renderer.domElement.tabIndex=0;

  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);
  camera.position.set(3.7,1.2,-1.65);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=!reduced;controls.dampingFactor=.07;controls.enablePan=false;controls.minDistance=1.55;controls.maxDistance=6.5;controls.rotateSpeed=.55;controls.zoomSpeed=.7;controls.autoRotateSpeed=.24;

  const fallback=new THREE.DataTexture(new Uint8Array([39,16,0]),1,1,THREE.RGBFormat);
  fallback.needsUpdate=true;

  const uniforms={
   earth:{value:(globalEarthTexture||fallback) as THREE.Texture},
   mapA:{value:(globalTexCache.get(0)||fallback) as THREE.Texture},
   mapB:{value:(globalTexCache.get(0)||fallback) as THREE.Texture},modernElev:{value:(globalTexCache.get(0)||fallback) as THREE.Texture},
   humidSahara:{value:0},stepA:{value:new THREE.Vector2(1/361,1/181)},stepB:{value:new THREE.Vector2(1/361,1/181)},
   blend:{value:0},age:{value:0},modern:{value:0},clouds:{value:1},climate:{value:0},ice:{value:1},grid:{value:0},tick:{value:0},
   seaLevel:{value:0},ancientIce:{value:0},latePaleoIce:{value:0},pleistoceneIce:{value:0},ghost:{value:0}
  };
  const material=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment});
  const planet=new THREE.Mesh(new THREE.SphereGeometry(1,128,80),material);scene.add(planet);

  // Subtle natural Rayleigh atmospheric twilight limb glow
  const airVertex=`varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vV=-p.xyz;gl_Position=projectionMatrix*p;}`;
  const airFragment=`
   varying vec3 vN;varying vec3 vV;
   void main(){
    vec3 n=normalize(vN);vec3 v=normalize(vV);
    vec3 light=normalize(vec3(-.55,.5,1.));
    float sun=dot(n,light);
    float sunLit=smoothstep(-.32,.62,sun);
    float rim=pow(max(0.,1.-abs(dot(n,v))),3.8);
    vec3 dayCyan=vec3(.19,.49,.76);
    vec3 sunsetViolet=vec3(.34,.22,.48);
    vec3 atmosColor=mix(sunsetViolet,dayCyan,smoothstep(-.1,.42,sun));
    float alpha=rim*(.05+sunLit*.24);
    gl_FragColor=vec4(atmosColor,alpha);
   }
  `;
  const airMat=new THREE.ShaderMaterial({vertexShader:airVertex,fragmentShader:airFragment,side:THREE.BackSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  const air=new THREE.Mesh(new THREE.SphereGeometry(1.03,96,64),airMat);scene.add(air);

  // Astronomical starfield with stellar color variation & subtle celestial depth
  const STAR_COUNT=880;
  const starPos=new Float32Array(STAR_COUNT*3);
  const starColors=new Float32Array(STAR_COUNT*3);
  let seed=137;
  function rand(){seed=(seed*16807)%2147483647;return seed/2147483647;}
  for(let i=0;i<STAR_COUNT;i++){
   const r=16+rand()*16;
   const pos=xyz(rand()*180-90,rand()*360-180,r);
   starPos[i*3]=pos.x;starPos[i*3+1]=pos.y;starPos[i*3+2]=pos.z;
   const cType=rand();
   if(cType<0.62){starColors[i*3]=0.82+rand()*0.15;starColors[i*3+1]=0.88+rand()*0.1;starColors[i*3+2]=0.94;}
   else if(cType<0.84){starColors[i*3]=0.94;starColors[i*3+1]=0.84+rand()*0.08;starColors[i*3+2]=0.68+rand()*0.1;}
   else{starColors[i*3]=0.7+rand()*0.1;starColors[i*3+1]=0.85+rand()*0.1;starColors[i*3+2]=0.96;}
  }
  const starGeo=new THREE.BufferGeometry();
  starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));
  starGeo.setAttribute('color',new THREE.BufferAttribute(starColors,3));
  const starMat=new THREE.PointsMaterial({size:0.013,vertexColors:true,transparent:true,opacity:0.58});
  const stars=new THREE.Points(starGeo,starMat);scene.add(stars);

  // Subtle beacon stars for navigational celestial depth
  const BEACON_COUNT=36;
  const beaconPos=new Float32Array(BEACON_COUNT*3);
  for(let i=0;i<BEACON_COUNT;i++){
   const pos=xyz(rand()*180-90,rand()*360-180,20+rand()*8);
   beaconPos[i*3]=pos.x;beaconPos[i*3+1]=pos.y;beaconPos[i*3+2]=pos.z;
  }
  const beaconGeo=new THREE.BufferGeometry();
  beaconGeo.setAttribute('position',new THREE.BufferAttribute(beaconPos,3));
  const beaconMat=new THREE.PointsMaterial({color:'#f0ede1',size:0.024,transparent:true,opacity:0.82});
  const beacons=new THREE.Points(beaconGeo,beaconMat);scene.add(beacons);

  const pending=new Set<number>(),failed=new Set<number>();
  const loader=new THREE.TextureLoader();
  const startA = props.age > 540 && props.age <= 620 ? 540 : props.age > .3 && props.age <= 540 ? Math.floor(props.age / 5) * 5 : 0;
  const startB = props.age > 540 && props.age <= 620 ? 540 : props.age > .3 && props.age <= 540 ? Math.min(540, startA + 5) : 0;
  let renderedAge: number | null = (globalEarthTexture || globalTexCache.has(startA) || globalTexCache.has(0) || props.age > 620) ? props.age : null;
  let requestKey = '';
  let earthLoaded = !!globalEarthTexture;
  let lastLoading=false;
  const queue:number[]=[];let activeLoads=0,prewarmed=false;
  const loadTimers=new Set<ReturnType<typeof setTimeout>>();

  function pumpGrids(){
   while(alive&&activeLoads<4&&queue.length){
    const gridAge=queue.shift()!;activeLoads++;let settled=false;
    const finish=()=>{if(settled)return false;settled=true;clearTimeout(timer);loadTimers.delete(timer);activeLoads--;pending.delete(gridAge);return true;};
    const fail=()=>{
     if(!finish()||!alive)return;failed.add(gridAge);
     if(requestKey.split(':').map(Number).includes(gridAge)){
      current.current.onStatus('The selected reconstruction could not load.');
      setError('The selected terrain did not finish loading. Check your connection and reload the globe to retry.');
     }
     pumpGrids();
    };
    const timer=setTimeout(fail,12000);loadTimers.add(timer);
    loader.load((gridAge<=70?'/paleo-detail/':'/paleo/')+gridAge+'.png',tex=>{
     if(!finish()||!alive){tex.dispose();return;}
     tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;tex.generateMipmaps=false;
     globalTexCache.set(gridAge,tex);if(gridAge===0){uniforms.modernElev.value=tex;}

     // Maintain cache budget without dumping needed anchors
     const protectedAges=requestKey.split(':').map(Number);
     const fineKeys=[...globalTexCache.keys()].filter(a=>a<=70);
     if(fineKeys.length>14){
      for(const cachedAge of fineKeys){
       if(protectedAges.includes(cachedAge)||cachedAge===0||cachedAge===540)continue;
       if(uniforms.mapA.value===globalTexCache.get(cachedAge)||uniforms.mapB.value===globalTexCache.get(cachedAge))continue;
       const t=globalTexCache.get(cachedAge);globalTexCache.delete(cachedAge);t?.dispose();
       if(globalTexCache.size<=24)break;
      }
     }
     pumpGrids();
    },undefined,fail);
   }
  }

  function loadGrid(gridAge:number,priority=true){
   if(globalTexCache.has(gridAge)||failed.has(gridAge))return;
   if(pending.has(gridAge)){
    const queued=queue.indexOf(gridAge);
    if(priority&&queued>=0){queue.splice(queued,1);queue.unshift(gridAge);}
    return;
   }
   pending.add(gridAge);if(priority)queue.unshift(gridAge);else queue.push(gridAge);
   pumpGrids();
  }

  // Load Earth texture once globally or attach to in-flight promise
  if(globalEarthTexture){
   uniforms.earth.value=globalEarthTexture;earthLoaded=true;setLoaded(true);
  }else if(!globalEarthPromise){
   globalEarthPromise=new Promise<THREE.Texture>((resolve,reject)=>{
    loader.load('/textures/earth.webp',tex=>{
     tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
     globalEarthTexture=tex;resolve(tex);
    },undefined,reject);
   });
   globalEarthPromise.then(tex=>{
    if(!alive)return;uniforms.earth.value=tex;earthLoaded=true;setLoaded(true);
   }).catch(()=>{
    if(alive){setLoaded(true);current.current.onStatus('NASA imagery unavailable; showing elevation-derived Earth.');}
   });
  }else{
   globalEarthPromise.then(tex=>{
    if(!alive)return;uniforms.earth.value=tex;earthLoaded=true;setLoaded(true);
   }).catch(()=>{if(alive)setLoaded(true);});
  }

  loadGrid(0);loadGrid(540);

  const plates=new THREE.Group();scene.add(plates);let plateFail=false;
  function buildPlates(data:any){
   const vertices:number[]=[];
   for(const f of data.features){
    if(f.geometry.type!=='LineString')continue;
    const pts=f.geometry.coordinates;
    for(let i=1;i<pts.length;i++)vertices.push(...xyz(pts[i-1][1],pts[i-1][0],1.004).toArray(),...xyz(pts[i][1],pts[i][0],1.004).toArray());
   }
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
   plates.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:'#edbb7e',transparent:true,opacity:.7})));
  }

  if(globalPlatesData){
   buildPlates(globalPlatesData);
  }else if(!globalPlatesPromise){
   globalPlatesPromise=fetch('/plates.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{globalPlatesData=data;return data;});
   globalPlatesPromise.then(data=>{if(alive)buildPlates(data);}).catch(()=>{plateFail=true;});
  }else{
   globalPlatesPromise.then(data=>{if(alive)buildPlates(data);}).catch(()=>{plateFail=true;});
  }

  const migration=new THREE.Group();scene.add(migration);
  const routeLines=routes.map(route=>{
   const a=xyz(...route.from),b=xyz(...route.to);const points=[];
   for(let i=0;i<=100;i++){const t=i/100;points.push(a.clone().lerp(b,t).normalize().multiplyScalar(1.009+Math.sin(t*Math.PI)*.045));}
   const g=new THREE.BufferGeometry().setFromPoints(points);
   const mat=new THREE.LineDashedMaterial({color:'#e0c191',dashSize:.012,gapSize:.005,transparent:true,opacity:.88});
   const line=new THREE.Line(g,mat);line.computeLineDistances();migration.add(line);return {route,line};
  });

  const dots=new THREE.Group();scene.add(dots);let lastDots='';const clickable:THREE.Mesh[]=[];
  const cityPinGroup=new THREE.Group();scene.add(cityPinGroup);
  const cityRingGeo=new THREE.RingGeometry(.016,.022,32);
  const cityPulseGeo=new THREE.RingGeometry(.024,.030,32);
  const cityDotGeo=new THREE.SphereGeometry(.009,16,12);
  const cityRingMat=new THREE.MeshBasicMaterial({color:'#34d399',side:THREE.DoubleSide,transparent:true,opacity:.95});
  const cityPulseMat=new THREE.MeshBasicMaterial({color:'#6ee7b7',side:THREE.DoubleSide,transparent:true,opacity:.6});
  const cityDotMat=new THREE.MeshBasicMaterial({color:'#ffffff'});
  const cityRingMesh=new THREE.Mesh(cityRingGeo,cityRingMat);
  const cityPulseMesh=new THREE.Mesh(cityPulseGeo,cityPulseMat);
  const cityDotMesh=new THREE.Mesh(cityDotGeo,cityDotMat);
  cityPinGroup.add(cityRingMesh);
  cityPinGroup.add(cityPulseMesh);
  cityPinGroup.add(cityDotMesh);
  cityPinGroup.visible=false;
  const ringGeo=new THREE.RingGeometry(.013,.018,32);const dotGeo=new THREE.SphereGeometry(.006,12,8);const dotMat=new THREE.MeshBasicMaterial({color:'#d6e9cb'});
  function addPin(lat:number,lon:number,color:string,event?:EarthEvent,large=false){
   const group=new THREE.Group();const position=xyz(lat,lon,1.014);
   const ring=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.95}));
   ring.lookAt(position);if(large)ring.scale.setScalar(1.6);group.add(ring);
   const dot=new THREE.Mesh(dotGeo,dotMat);group.add(dot);group.position.copy(position);dots.add(group);
   if(event){ring.userData.event=event;clickable.push(ring);}
  }

  // Cinematic spherical camera flight glide
  let flightActive=false;
  const flightStartPos=new THREE.Vector3(),flightTargetPos=new THREE.Vector3();
  let flightStartTime=0,flightDuration=1250;

  function startFlight(target:THREE.Vector3,duration=1250){
   if(reduced){camera.position.copy(target);controls.update();return;}
   flightStartPos.copy(camera.position);
   flightTargetPos.copy(target);
   flightStartTime=performance.now();
   flightDuration=duration;
   flightActive=true;
  }

  current.current.onReady({
   zoom:f=>{flightActive=false;camera.position.multiplyScalar(f);camera.position.clampLength(1.55,6.5);},
   reset:()=>{startFlight(new THREE.Vector3(3.7,1.2,-1.65),1350);},
   focus:(lat,lon)=>{startFlight(xyz(lat,lon,3.4),1250);}
  });

  const down={x:0,y:0};
  const pointerdown=(e:PointerEvent)=>{down.x=e.clientX;down.y=e.clientY;flightActive=false;};
  const dblclick=(e:MouseEvent)=>{
   const rect=el.getBoundingClientRect();
   const ray=new THREE.Raycaster();
   ray.setFromCamera(new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1),camera);
   const hit=ray.intersectObject(planet)[0];
   if(hit&&hit.point){
    const p=hit.point.clone().normalize();
    const lat=THREE.MathUtils.radToDeg(Math.asin(p.y));
    const lon=THREE.MathUtils.radToDeg(Math.atan2(-p.z,p.x));
    startFlight(xyz(lat,lon,3.4),1100);
   }
  };
  renderer.domElement.addEventListener('dblclick',dblclick);
  const pointerup=(e:PointerEvent)=>{
   if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;
   const rect=el.getBoundingClientRect(),ray=new THREE.Raycaster();
   ray.setFromCamera(new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1),camera);
   const hit=ray.intersectObjects(clickable)[0];const surface=ray.intersectObject(planet)[0];
   if(hit&&(!surface||hit.distance<surface.distance))current.current.onSelect(hit.object.userData.event);
  };

  const key=(e:KeyboardEvent)=>{
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    e.preventDefault();const s=new THREE.Spherical().setFromVector3(camera.position);
    s.theta+=e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0;
    s.phi=THREE.MathUtils.clamp(s.phi+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0),.1,Math.PI-.1);
    camera.position.setFromSpherical(s);
   }else if(e.key==='+'||e.key==='='){
    e.preventDefault();camera.position.multiplyScalar(.86).clampLength(1.55,6.5);
   }else if(e.key==='-'||e.key==='_'){
    e.preventDefault();camera.position.multiplyScalar(1.14).clampLength(1.55,6.5);
   }else if(e.key==='r'||e.key==='R'){
    e.preventDefault();startFlight(new THREE.Vector3(3.7,1.2,-1.65),1350);
   }
  };

  renderer.domElement.addEventListener('pointerdown',pointerdown);
  renderer.domElement.addEventListener('pointerup',pointerup);
  renderer.domElement.addEventListener('keydown',key);
  const contextLost=(e:Event)=>{
   e.preventDefault();contextUnavailable=true;current.current.onBuffering?.(true);
   setError('The 3D view is recovering. Playback will resume when it is ready, or you can reload the globe.');
  };
  const contextRestored=()=>{if(!alive)return;contextUnavailable=false;setError('');last=0;};
  renderer.domElement.addEventListener('webglcontextlost',contextLost);
  renderer.domElement.addEventListener('webglcontextrestored',contextRestored);

  const resize=new ResizeObserver(()=>{
   const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;
   renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.5:2,Math.sqrt(3500000/(w*h))));
   renderer.setSize(w,h);camera.aspect=w/h;
   const framingScale=Number(getComputedStyle(el).getPropertyValue('--globe-framing-scale'))||1;
   camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(17))*framingScale));
   camera.updateProjectionMatrix();
  });
  resize.observe(el);

  let frame=0,last=0;
  function animate(now:number){
   if(!alive)return;frame=requestAnimationFrame(animate);
   if(document.hidden||contextUnavailable||now-last<24)return;last=now;

   const {age:requestedAge,layers,selected,autoRotate}=current.current;
   const a=requestedAge>540&&requestedAge<=620?540:requestedAge>.3&&requestedAge<=540?Math.floor(requestedAge/5)*5:0;
   const b=requestedAge>540&&requestedAge<=620?540:requestedAge>.3&&requestedAge<=540?Math.min(540,a+5):0;
   const key=`${a}:${b}`;
   if(key!==requestKey){
    requestKey=key;setError('');loadGrid(a);loadGrid(b);
    if(failed.has(a)||failed.has(b))setError('This scientific reconstruction could not load. Choose another chapter or reload the globe.');
   }
   const surfaceReady=requestedAge>620||(globalTexCache.has(a)&&globalTexCache.has(b));
   current.current.onBuffering?.(!surfaceReady);
   if(surfaceReady){
    setLoaded(true);
    if(!prewarmed&&requestedAge>.12){
     prewarmed=true;for(let gridAge=75;gridAge<=540;gridAge+=5)loadGrid(gridAge,false);
    }
    if(globalTexCache.has(a)&&globalTexCache.has(b)){
     uniforms.mapA.value=globalTexCache.get(a)!;uniforms.mapB.value=globalTexCache.get(b)!;
     const sa=textureSize(uniforms.mapA.value),sb=textureSize(uniforms.mapB.value);
     uniforms.stepA.value.set(1/sa.width,1/sa.height);uniforms.stepB.value.set(1/sb.width,1/sb.height);
     uniforms.blend.value=a===b?0:(requestedAge-a)/(b-a);renderer.domElement.dataset.terrainPair=`${a}:${b}`;
    }
    renderedAge=requestedAge;
    if(lastLoading){setWaiting(false);current.current.onStatus('');current.current.onBuffering?.(false);lastLoading=false;}
    if(requestedAge<=620&&requestedAge>.12){for(const offset of [-5,10]){const neighbor=a+offset;if(neighbor>=0&&neighbor<=540)loadGrid(neighbor);}}
   }else if(!lastLoading){
    setWaiting(true);current.current.onStatus('Updating reconstruction — holding the last loaded world.');current.current.onBuffering?.(true);lastLoading=true;
   }

   const age=renderedAge??requestedAge;
   planet.visible=renderedAge!==null;
   renderer.domElement.dataset.renderedAge=String(renderedAge??'');renderer.domElement.dataset.requestedAge=String(requestedAge);renderer.domElement.dataset.loading=String(!surfaceReady);
   renderer.domElement.dataset.terrainWidth=String(textureSize(uniforms.mapA.value).width);renderer.domElement.dataset.fineGridCount=String([...globalTexCache.keys()].filter(a=>a<=70).length);

   uniforms.age.value=age;uniforms.ancientIce.value=cryogenianIce(age);
   uniforms.latePaleoIce.value=latePaleozoicIce(age)*+layers.ice;
   uniforms.pleistoceneIce.value=glacialBlend(age,latePleistoceneIce(age))*+layers.ice;
   uniforms.humidSahara.value=humidSaharaWeight(age);uniforms.seaLevel.value=seaLevel(age);
   uniforms.clouds.value=+layers.clouds;uniforms.climate.value=+layers.climate;uniforms.ice.value=+layers.ice;uniforms.grid.value=+layers.grid;uniforms.ghost.value=layers.ghost?1:0;
   uniforms.tick.value=reduced?0:now/1000;

   air.visible=planet.visible&&age<4400&&layers.clouds;
   uniforms.modern.value=earthLoaded?1-THREE.MathUtils.smoothstep(age,0,5):0;
   plates.visible=layers.plates&&age<=.3;if(plateFail&&plates.visible)current.current.onStatus('Plate boundaries could not load.');

   migration.visible=layers.migration&&age<=.3;
   for(const {route,line} of routeLines){
    const progress=THREE.MathUtils.clamp((route.start-age)/(route.start-route.end),0,1);
    line.visible=progress>0&&(!current.current.routeIds||current.current.routeIds.includes(route.id));
    line.geometry.setDrawRange(0,Math.max(2,Math.floor(progress*101)));
   }

   const dotKey=[Math.round(age*100000),layers.life,layers.humans,layers.civilization,selected?.id].join(':');
   if(dotKey!==lastDots){
    lastDots=dotKey;
    for(const c of dots.children){
     c.traverse(o=>{if(o instanceof THREE.Mesh&&o.material!==dotMat)(o.material as THREE.Material).dispose();});
    }
    dots.clear();clickable.length=0;

    if(layers.humans){
     for(const h of hominins)if(age<=h.start&&age>=h.end)for(const point of h.points)addPin(point[0],point[1],h.color,events.find(e=>e.title.includes(h.name)||e.keywords?.includes(h.name)));
    }
    if(layers.civilization&&age<=.012)for(const event of events)if(event.category==='Civilization'&&event.age>=age&&event.location)addPin(...event.location,'#dfc18c',event);
    if(layers.life&&age<=10)for(const event of events)if(event.location&&event.category==='Life'&&Math.abs(event.age-age)<Math.max(.03,age*.4))addPin(...event.location,'#c4dfbd',event);
    if(selected?.location)addPin(...selected.location,selected.category==='Extinction'?'#eea084':'#c7e7ce',selected,true);
   }

   // Breathing marker pulse for selected event
   if(selected?.location&&dots.children.length>0){
    const selMesh=dots.children[dots.children.length-1];
    if(selMesh){
     const pulse=1.55+Math.sin(now*.004)*.16;
     selMesh.scale.setScalar(pulse);
    }
   }

   // Gentle celestial rotation
   if(!reduced){
    stars.rotation.y=now*0.000015;
    beacons.rotation.y=now*0.000015;
   }

   if(flightActive){
    const elapsed=now-flightStartTime;
    const progress=Math.min(1,elapsed/flightDuration);
    // Smooth cubic ease in-out
    const t=progress<.5?4*progress*progress*progress:1-Math.pow(-2*progress+2,3)/2;

    const startDir=flightStartPos.clone().normalize();
    const targetDir=flightTargetPos.clone().normalize();
    const dot=THREE.MathUtils.clamp(startDir.dot(targetDir),-1,1);
    const omega=Math.acos(dot);

    let curDir:THREE.Vector3;
    if(omega>.001){
     const sinOmega=Math.sin(omega);
     const w1=Math.sin((1-t)*omega)/sinOmega;
     const w2=Math.sin(t*omega)/sinOmega;
     curDir=startDir.multiplyScalar(w1).add(targetDir.multiplyScalar(w2)).normalize();
    }else{
     curDir=targetDir;
    }

    const startLen=flightStartPos.length();
    const targetLen=flightTargetPos.length();
    const baseLen=THREE.MathUtils.lerp(startLen,targetLen,t);
    // Gentle orbital altitude arc so the camera flies smoothly over continents without clipping
    const altitudeArc=Math.sin(t*Math.PI)*Math.min(.85,omega*.35);

    camera.position.copy(curDir).multiplyScalar(baseLen+altitudeArc);
    controls.update();

    if(progress>=1)flightActive=false;
   }

   if(current.current.pinnedLocation && current.current.age<=540){
     cityPinGroup.visible=true;
     const pos=xyz(current.current.pinnedLocation.lat,current.current.pinnedLocation.lon,1.018);
     cityPinGroup.position.copy(pos);
     const lookTarget=pos.clone().multiplyScalar(2);
     cityRingMesh.lookAt(lookTarget);
     cityPulseMesh.lookAt(lookTarget);
     const pulsePhase=(now%1800)/1800;
     const pulseScale=1+pulsePhase*1.6;
     cityPulseMesh.scale.set(pulseScale,pulseScale,1);
     cityPulseMat.opacity=Math.max(0,.75*(1-pulsePhase));
    }else{
     cityPinGroup.visible=false;
    }
    controls.autoRotate=autoRotate&&!reduced&&!flightActive;controls.update();renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(animate);

  return()=>{
   alive=false;
   for(const timer of loadTimers)clearTimeout(timer);
   loadTimers.clear();
   cancelAnimationFrame(frame);resize.disconnect();controls.dispose();
   renderer.domElement.removeEventListener('pointerdown',pointerdown);
   renderer.domElement.removeEventListener('pointerup',pointerup);renderer.domElement.removeEventListener('dblclick',dblclick);
   renderer.domElement.removeEventListener('keydown',key);
   renderer.domElement.removeEventListener('webglcontextlost',contextLost);
   renderer.domElement.removeEventListener('webglcontextrestored',contextRestored);
   disposeTree(scene);
   ringGeo.dispose();dotGeo.dispose();dotMat.dispose();
   starGeo.dispose();starMat.dispose();
   beaconGeo.dispose();beaconMat.dispose();
   airMat.dispose();material.dispose();fallback.dispose();
   renderer.dispose();renderer.domElement.remove();
  };
 },[retry]);

 return (
  <div className="globe-host" ref={host}>
   {!loaded&&!error&&<div className="globe-loading"><span/> Bringing Earth into view</div>}
   {waiting&&loaded&&!error&&<div className="globe-pending" role="status">Updating selected world…</div>}
   {error&&<div className="globe-error"><p>{error}</p><button onClick={()=>{setError('');setRetry(x=>x+1);}}>Reload globe</button></div>}
  </div>
 );
}
