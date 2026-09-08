'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {routes,hominins} from '@/lib/earth/migration';
import {events,EarthEvent,seaLevel} from '@/lib/earth/history';
export type Layers={clouds:boolean;plates:boolean;climate:boolean;ice:boolean;life:boolean;humans:boolean;migration:boolean;civilization:boolean;grid:boolean};
export type GlobeApi={zoom:(factor:number)=>void;reset:()=>void;focus:(lat:number,lon:number)=>void};
type Props={age:number;layers:Layers;selected:EarthEvent|null;onSelect:(e:EarthEvent)=>void;onReady:(api:GlobeApi)=>void;autoRotate:boolean;onStatus:(s:string)=>void;routeIds?:string[]};
const vertex=`varying vec2 vUv;varying vec3 vN;varying vec3 vP;varying vec3 vV;void main(){vUv=uv;vP=position;vN=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vV=-p.xyz;gl_Position=projectionMatrix*p;}`;
const fragment=`
precision highp float;
uniform sampler2D earth;uniform sampler2D mapA;uniform sampler2D mapB;
uniform float blend;uniform float age;uniform float modern;uniform float clouds;uniform float climate;uniform float ice;uniform float grid;uniform float tick;uniform float seaLevel;
varying vec2 vUv;varying vec3 vN;varying vec3 vP;varying vec3 vV;
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.07+4.3;a*=.5;}return v;}
float heightAt(sampler2D tex,vec2 uv){vec2 c=texture2D(tex,uv).rg*255.;return c.x*256.+c.y-10000.;}
void main(){
 vec3 n=normalize(vN);vec3 p=normalize(vP);float lat=abs(p.y);float h=mix(heightAt(mapA,vUv),heightAt(mapB,vUv),blend);
 float early=step(540.1,age);float rough=fbm(p*55.);float terrain=fbm(p*3.8+vec3(age*.00003));
 if(early>.5)h=(terrain-.54)*10000.;
 float glacial=ice*step(.0001,age)*(1.-step(.125,age));float sea=seaLevel*glacial;
 float land=smoothstep(sea-35.,sea+65.,h);float shelf=smoothstep(-1600.,-50.,h);
 vec3 ocean=mix(vec3(.017,.055,.10),vec3(.038,.19,.22),shelf*.8);ocean+=rough*.014;
 vec3 low=mix(vec3(.12,.19,.12),vec3(.36,.32,.19),smoothstep(.15,.55,lat)*.65);
 if(age>470.)low=vec3(.30,.265,.20);
 vec3 ground=mix(low,vec3(.42,.40,.34),smoothstep(500.,5000.,h));ground*=.78+rough*.45;
 vec3 base=mix(ocean,ground,land);
 vec3 sat=pow(texture2D(earth,vUv).rgb,vec3(2.2));base=mix(base,sat,modern*(1.-glacial));
 float cap=smoothstep(.91,.98,lat)*step(age,34.);float paleoIce=step(635.,age)*(1.-step(720.,age));cap=max(cap,paleoIce*smoothstep(.02,.28,lat));
 float lgmNA=exp(-pow((vUv.x-.22)/.12,2.))*smoothstep(.68,.88,p.y);float lgmEU=exp(-pow((vUv.x-.55)/.075,2.))*smoothstep(.73,.86,p.y);
 cap=max(cap,glacial*land*min(1.,lgmNA+lgmEU)*clamp(-sea/120.,0.,1.));base=mix(base,vec3(.66,.78,.83)*(rough*.16+.88),cap);
 float molten=smoothstep(4400.,4520.,age);float lava=pow(max(0.,1.-abs(terrain-.51)*25.),3.);vec3 magma=vec3(.038,.016,.011)+lava*vec3(1.6,.30,.015);base=mix(base,magma,molten);
 float cloudN=fbm(p*8.+vec3(tick*.001,0,0));float cloudShape=smoothstep(.53,.69,cloudN)*clouds*(1.-molten)*.40;cloudShape*=.4+.6*abs(sin(p.y*9.+cloudN*7.));base=mix(base,vec3(.78,.84,.87),cloudShape);
 if(climate>.5){vec3 temp=mix(vec3(.62,.23,.09),vec3(.10,.35,.60),smoothstep(.05,.9,lat));base=mix(base,temp,.53);}
 if(grid>.5){float a=abs(fract(vUv.x*24.+.5)-.5);float b=abs(fract(vUv.y*12.+.5)-.5);float line=1.-smoothstep(.001,.007,min(a,b));base=mix(base,vec3(.40,.60,.62),line*.22);}
 vec3 light=normalize(vec3(-.55,.5,1.));float diffuse=max(0.,dot(n,light));float shade=.065+diffuse*.96;vec3 color=base*shade;
 float spec=pow(max(0.,dot(reflect(-light,n),normalize(vV))),65.)*(1.-land)*.14;color+=vec3(.7,.85,1.)*spec;
 float rim=pow(1.-max(0.,dot(n,normalize(vV))),3.2);color+=vec3(.06,.25,.42)*rim*pow(diffuse,.4)*(1.-molten);
 color+=molten*lava*vec3(.25,.045,.002);gl_FragColor=vec4(pow(max(color,vec3(0)),vec3(1./2.2)),1.);
}`;
function xyz(lat:number,lon:number,r=1){const a=THREE.MathUtils.degToRad(lat),b=THREE.MathUtils.degToRad(lon);return new THREE.Vector3(Math.cos(a)*Math.cos(b)*r,Math.sin(a)*r,-Math.cos(a)*Math.sin(b)*r);}
function disposeTree(obj:THREE.Object3D){obj.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();if(m.material){for(const a of Array.isArray(m.material)?m.material:[m.material])a.dispose();}});}
export default function Globe(props:Props){
 const host=useRef<HTMLDivElement>(null),current=useRef(props);current.current=props;
 const [error,setError]=useState(''),[retry,setRetry]=useState(0);const [loaded,setLoaded]=useState(false);
 useEffect(()=>{
 const el=host.current;if(!el)return;let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{setError('3D rendering is unavailable on this device. The timeline and chapters remain available.');return;}
 let alive=true;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.5:2));renderer.setClearColor(0,0);el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive Earth. Drag to rotate, pinch or scroll to zoom. Use arrow keys to rotate.');renderer.domElement.tabIndex=0;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(3.7,1.2,-1.65);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=!reduced;controls.dampingFactor=.07;controls.enablePan=false;controls.minDistance=1.55;controls.maxDistance=6.5;controls.rotateSpeed=.55;controls.zoomSpeed=.7;controls.autoRotateSpeed=.24;
 const fallback=new THREE.DataTexture(new Uint8Array([39,16,0]),1,1,THREE.RGBFormat);fallback.needsUpdate=true;
 const uniforms={earth:{value:fallback as THREE.Texture},mapA:{value:fallback as THREE.Texture},mapB:{value:fallback as THREE.Texture},blend:{value:0},age:{value:0},modern:{value:0},clouds:{value:1},climate:{value:0},ice:{value:1},grid:{value:0},tick:{value:0},seaLevel:{value:0}};
 const material=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment});
 const planet=new THREE.Mesh(new THREE.SphereGeometry(1,128,80),material);scene.add(planet);
 const airMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:`varying vec3 vN;varying vec3 vV;void main(){float a=pow(max(0.,1.-abs(dot(normalize(vN),normalize(vV)))),4.);gl_FragColor=vec4(.18,.46,.67,a*.19);}`,side:THREE.BackSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
 const air=new THREE.Mesh(new THREE.SphereGeometry(1.027,96,64),airMat);scene.add(air);
 const starArray=new Float32Array(420*3);let seed=83;function rand(){seed=(seed*16807)%2147483647;return seed/2147483647;}
 for(let i=0;i<starArray.length;i+=3){const v=xyz(rand()*180-90,rand()*360-180,12);starArray.set(v.toArray(),i);}
 const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.BufferAttribute(starArray,3));const stars=new THREE.Points(starGeometry,new THREE.PointsMaterial({color:'#93b3bf',size:.014,transparent:true,opacity:.48}));scene.add(stars);
 const texCache=new Map<number,THREE.Texture>(),pending=new Set<number>();const loader=new THREE.TextureLoader();let requestKey='';let earthLoaded=false;let lastLoading=false;let textureFailure=false;
 function loadGrid(age:number){if(texCache.has(age)||pending.has(age))return;pending.add(age);loader.load(`/paleo/${age}.png`,tex=>{pending.delete(age);if(!alive){tex.dispose();return;}tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;tex.generateMipmaps=false;texCache.set(age,tex);if(texCache.size>10){for(const [key,t]of texCache){if(key!==0&&key!==age&&t!==uniforms.mapA.value&&t!==uniforms.mapB.value){t.dispose();texCache.delete(key);break;}}}},undefined,()=>{pending.delete(age);textureFailure=true;if(alive){current.current.onStatus('Reconstruction unavailable; no substitute geography is shown.');setError('This scientific reconstruction could not load. Choose another chapter or reload the globe.');}});}
 loader.load('/textures/earth.webp',tex=>{if(!alive){tex.dispose();return;}tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());uniforms.earth.value=tex;earthLoaded=true;setLoaded(true);},undefined,()=>{if(alive){setLoaded(true);current.current.onStatus('NASA imagery unavailable; showing elevation-derived Earth.');}});loadGrid(0);
 const plates=new THREE.Group();scene.add(plates);let plateFail=false;
 const abort=new AbortController();fetch('/plates.json',{signal:abort.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{if(!alive)return;const vertices:number[]=[];for(const f of (data as {features:{geometry:{type:string;coordinates:number[][]}}[]}).features){if(f.geometry.type!=='LineString')continue;const pts=f.geometry.coordinates;for(let i=1;i<pts.length;i++)vertices.push(...xyz(pts[i-1][1],pts[i-1][0],1.004).toArray(),...xyz(pts[i][1],pts[i][0],1.004).toArray());}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));plates.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:'#edbb7e',transparent:true,opacity:.7})));}).catch(()=>{plateFail=true;});
 const migration=new THREE.Group();scene.add(migration);const routeLines=routes.map(route=>{const a=xyz(...route.from),b=xyz(...route.to);const points=[];for(let i=0;i<=100;i++){const t=i/100;points.push(a.clone().lerp(b,t).normalize().multiplyScalar(1.009+Math.sin(t*Math.PI)*.045));}const g=new THREE.BufferGeometry().setFromPoints(points);const mat=new THREE.LineDashedMaterial({color:'#e0c191',dashSize:.012,gapSize:.005,transparent:true,opacity:.88});const line=new THREE.Line(g,mat);line.computeLineDistances();migration.add(line);return {route,line};});
 const dots=new THREE.Group();scene.add(dots);let lastDots='';const clickable:THREE.Mesh[]=[];
 const ringGeo=new THREE.RingGeometry(.013,.018,32);const dotGeo=new THREE.SphereGeometry(.006,12,8);const dotMat=new THREE.MeshBasicMaterial({color:'#d6e9cb'});
 function addPin(lat:number,lon:number,color:string,event?:EarthEvent,large=false){const group=new THREE.Group();const position=xyz(lat,lon,1.014);const ring=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.95}));ring.lookAt(position);if(large)ring.scale.setScalar(1.6);group.add(ring);const dot=new THREE.Mesh(dotGeo,dotMat);group.add(dot);group.position.copy(position);dots.add(group);if(event){ring.userData.event=event;clickable.push(ring);}}
 let focusTarget:THREE.Vector3|null=null;current.current.onReady({zoom:f=>{camera.position.multiplyScalar(f);camera.position.clampLength(1.55,6.5);},reset:()=>{focusTarget=new THREE.Vector3(3.7,1.2,-1.65);},focus:(lat,lon)=>{focusTarget=xyz(lat,lon,3.4);}});
 const down={x:0,y:0};const pointerdown=(e:PointerEvent)=>{down.x=e.clientX;down.y=e.clientY;focusTarget=null;};const pointerup=(e:PointerEvent)=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;const rect=el.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObjects(clickable)[0];const surface=ray.intersectObject(planet)[0];if(hit&&(!surface||hit.distance<surface.distance))current.current.onSelect(hit.object.userData.event);};
 const key=(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const s=new THREE.Spherical().setFromVector3(camera.position);s.theta+=(e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0);s.phi=THREE.MathUtils.clamp(s.phi+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0),.1,Math.PI-.1);camera.position.setFromSpherical(s);};
 renderer.domElement.addEventListener('pointerdown',pointerdown);renderer.domElement.addEventListener('pointerup',pointerup);renderer.domElement.addEventListener('keydown',key);const contextLost=(e:Event)=>{e.preventDefault();setError('The 3D view paused because the graphics context was lost. Reload the globe to continue.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
 const resize=new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});resize.observe(el);
 let frame=0,last=0;function animate(now:number){if(!alive)return;frame=requestAnimationFrame(animate);if(document.hidden||now-last<24)return;last=now;
 const {age,layers,selected,autoRotate}=current.current;uniforms.age.value=age;uniforms.seaLevel.value=seaLevel(age);uniforms.clouds.value=+layers.clouds;uniforms.climate.value=+layers.climate;uniforms.ice.value=+layers.ice;uniforms.grid.value=+layers.grid;uniforms.tick.value=reduced?0:now/1000;air.visible=age<4400&&layers.clouds;
 const a=age>.12&&age<=540?Math.floor(age/5)*5:0;const b=age>.12&&age<=540?Math.min(540,a+5):0;const key=`${a}:${b}`;
 if(key!==requestKey){requestKey=key;textureFailure=false;setError('');loadGrid(a);loadGrid(b);}
 if(texCache.has(a)&&texCache.has(b)){uniforms.mapA.value=texCache.get(a)!;uniforms.mapB.value=texCache.get(b)!;uniforms.blend.value=a===b?0:(age-a)/(b-a);if(lastLoading){current.current.onStatus('');lastLoading=false;}}
 else if(!textureFailure){if(!lastLoading){current.current.onStatus('Loading scientific reconstruction…');lastLoading=true;}}
 // Do not display a previous epoch's surface beneath the newly selected date.
 planet.visible=age>540||(texCache.has(a)&&texCache.has(b))||(age===0&&earthLoaded);
 air.visible=planet.visible&&age<4400&&layers.clouds;
 uniforms.modern.value=age<=.12&&earthLoaded?1:0;
 plates.visible=layers.plates&&age<=.3;if(plateFail&&plates.visible)current.current.onStatus('Plate boundaries could not load.');
 migration.visible=layers.migration&&age<=.3;for(const {route,line}of routeLines){const progress=THREE.MathUtils.clamp((route.start-age)/(route.start-route.end),0,1);line.visible=progress>0&&(!current.current.routeIds||current.current.routeIds.includes(route.id));line.geometry.setDrawRange(0,Math.max(2,Math.floor(progress*101)));}
 const dotKey=[Math.round(age*100000),layers.life,layers.humans,layers.civilization,selected?.id].join(':');if(dotKey!==lastDots){lastDots=dotKey;for(const c of dots.children){c.traverse(o=>{if(o instanceof THREE.Mesh&&o.material!==dotMat)(o.material as THREE.Material).dispose();});}dots.clear();clickable.length=0;
 if(layers.humans){for(const h of hominins)if(age<=h.start&&age>=h.end)for(const point of h.points)addPin(point[0],point[1],h.color,events.find(e=>e.title.includes(h.name)||e.keywords?.includes(h.name)));}
 if(layers.civilization&&age<=.012)for(const event of events)if(event.category==='Civilization'&&event.age>=age&&event.location)addPin(...event.location,'#dfc18c',event);
 if(layers.life&&age<=10)for(const event of events)if(event.location&&event.category==='Humanity'&&Math.abs(event.age-age)<Math.max(.03,age*.4))addPin(...event.location,'#c4dfbd',event);
 if(selected?.location)addPin(...selected.location,selected.category==='Extinction'?'#eea084':'#c7e7ce',selected,true);
 }
 if(focusTarget){camera.position.lerp(focusTarget,reduced?1:.07);if(camera.position.distanceTo(focusTarget)<.005)focusTarget=null;}
 controls.autoRotate=autoRotate&&!reduced&&!focusTarget;controls.update();renderer.render(scene,camera);
 }frame=requestAnimationFrame(animate);
 return()=>{alive=false;abort.abort();cancelAnimationFrame(frame);resize.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerdown);renderer.domElement.removeEventListener('pointerup',pointerup);renderer.domElement.removeEventListener('keydown',key);renderer.domElement.removeEventListener('webglcontextlost',contextLost);disposeTree(scene);ringGeo.dispose();dotGeo.dispose();dotMat.dispose();for(const t of texCache.values())t.dispose();uniforms.earth.value.dispose();fallback.dispose();renderer.dispose();renderer.domElement.remove();};
 },[retry]);
 return <div className="globe-host" ref={host}>{!loaded&&!error&&<div className="globe-loading"><span/> Bringing Earth into view</div>}{error&&<div className="globe-error"><p>{error}</p><button onClick={()=>{setError('');setRetry(x=>x+1);}}>Reload globe</button></div>}</div>;
}


