'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import type {GlobeApi} from './earth-globe';
import {boundaryKind,geometryLines,sphericalSegments,type GeographicGeometry} from '@/lib/earth/tectonic-geometry';

type Props={age:number;autoRotate:boolean;onReady:(api:GlobeApi)=>void;onStatus:(text:string)=>void;onBuffering?:(waiting:boolean)=>void};
type Feature={geometry:GeographicGeometry;properties?:{type?:string}};
const colors={coast:'#c6d4bd',subduction:'#e5ae82',ridge:'#8dcfd0',transform:'#b6a1d8',other:'#788b95'};
const cache=new Map<number,{coasts:Feature[];boundaries:Feature[]}>();

export default function TectonicGlobe(props:Props){
 const host=useRef<HTMLDivElement>(null),current=useRef(props),request=useRef<(age:number)=>void>(()=>{});
 const [message,setMessage]=useState('Loading tectonic reconstruction…'),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{current.current=props;request.current(props.age);},[props.age,props.autoRotate]);
 useEffect(()=>{
  const el=host.current!;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{setFailed(true);setMessage('The tectonic view could not start. Turn off Plate tectonics to return to Earth.');return;}
  let alive=true,contextLost=false,frame=0,controller:AbortController|undefined,selected=-1,rendered:number|null=null;
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));el.appendChild(renderer.domElement);
  renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Historical tectonic globe. Drag to rotate, scroll to zoom, or use arrow keys.');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(3.7,1.2,-1.65);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.minDistance=1.55;controls.maxDistance=6.5;controls.autoRotateSpeed=.24;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;controls.enableDamping=!reduced;
  const sphere=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),new THREE.MeshPhongMaterial({color:'#101e2a',shininess:22}));scene.add(sphere);
  scene.add(new THREE.AmbientLight('#bfd5df',1.2));const light=new THREE.DirectionalLight('#ddebdc',2);light.position.set(3,4,5);scene.add(light);
  let drawing=new THREE.Group();scene.add(drawing);
  const clear=(group:THREE.Group)=>{group.traverse(o=>{if(o instanceof THREE.LineSegments){o.geometry.dispose();(o.material as THREE.Material).dispose();}});};
  const lines=(features:Feature[],coast=false)=>{const group=new THREE.Group(),buckets=new Map<string,number[]>();for(const feature of features){const color=coast?colors.coast:colors[boundaryKind(feature.properties?.type||'')];const values=buckets.get(color)||[];for(const value of sphericalSegments(geometryLines(feature.geometry),coast?1.004:1.008))values.push(value);buckets.set(color,values);}for(const [color,values] of buckets){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(values,3));group.add(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity:coast?.65:.95})));}return group;};
  async function load(age:number){
   renderer.domElement.dataset.requestedAge=String(age);
   const target=Math.max(0,Math.min(1800,Math.round(age)));if(target===selected)return;selected=target;controller?.abort();controller=new AbortController();const signal=controller.signal;
   current.current.onBuffering?.(true);setFailed(false);setMessage(`Loading ${target} Ma tectonic reconstruction…`);
   renderer.domElement.dataset.requestedAge=String(age);renderer.domElement.dataset.loading='true';
   const timer=setTimeout(()=>controller?.signal===signal&&controller.abort(),20000);
   try{
    let data=cache.get(target);
    if(!data){
     const get=async(path:string)=>{const response=await fetch(`https://gws.gplates.org/${path}/?time=${target}&model=CAO2024&wrap=true`,{signal});if(!response.ok)throw Error('Unavailable reconstruction');const body=await response.json() as {features?:Feature[]};if(!Array.isArray(body.features)||!body.features.length)throw Error('Empty reconstruction');return body.features as Feature[];};
     const [coasts,boundaries]=await Promise.all([get('reconstruct/coastlines'),get('topology/plate_boundaries')]);data={coasts,boundaries};
     if(signal.aborted)return;cache.set(target,data);while(cache.size>8)cache.delete(cache.keys().next().value!);
    }
    if(!alive||signal.aborted||selected!==target)return;
    // Rasterize the matching coastline polygons into a flat cartographic
    // surface. No relief or vegetation is invented for this model.
    const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;const ctx=canvas.getContext('2d')!;
    ctx.fillStyle='#0a1724';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#526b69';
    for(const feature of data.coasts){const polygons=feature.geometry.type==='MultiPolygon'?(feature.geometry.coordinates as unknown[]).map(coordinates=>({type:'Polygon',coordinates})):[feature.geometry];for(const polygon of polygons){ctx.beginPath();for(const ring of geometryLines(polygon)){ring.forEach(([lon,lat],i)=>{const x=(lon+180)/360*canvas.width,y=(90-lat)/180*canvas.height;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.closePath();}ctx.fill('evenodd');}}
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());sphere.material.map?.dispose();sphere.material.map=texture;sphere.material.color.set('#ffffff');sphere.material.needsUpdate=true;
    const next=new THREE.Group();next.add(lines(data.boundaries));scene.remove(drawing);clear(drawing);drawing=next;scene.add(drawing);rendered=target;
    renderer.domElement.dataset.renderedAge=String(target);renderer.domElement.dataset.loading='false';setMessage('');current.current.onStatus(`CAO2024 · ${target} Ma snapshot · coastline outlines and plate boundaries`);current.current.onBuffering?.(false);
   }catch{
    if(!alive||selected!==target||controller?.signal!==signal)return;
    cache.delete(target);
    setFailed(true);setMessage(`Could not load ${target} Ma.${rendered!==null?` Still displaying ${rendered} Ma.`:''} Retry or turn off Plate tectonics.`);current.current.onStatus(`Tectonic reconstruction unavailable${rendered!==null?`; showing ${rendered} Ma`:''}.`);
   }finally{clearTimeout(timer);}
  }
  request.current=load;load(current.current.age);
  current.current.onReady({zoom:f=>camera.position.multiplyScalar(f).clampLength(1.55,6.5),reset:()=>camera.position.set(3.7,1.2,-1.65),focus:(lat,lon)=>{const a=lat*Math.PI/180,b=lon*Math.PI/180;camera.position.set(Math.cos(a)*Math.cos(b),Math.sin(a),-Math.cos(a)*Math.sin(b)).multiplyScalar(3.4);}});
  const key=(e:KeyboardEvent)=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();const p=new THREE.Spherical().setFromVector3(camera.position);p.theta+=e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0;p.phi=THREE.MathUtils.clamp(p.phi+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0),.1,Math.PI-.1);camera.position.setFromSpherical(p);};renderer.domElement.addEventListener('keydown',key);
  const resize=new ResizeObserver(()=>{if(!el.clientWidth||!el.clientHeight)return;renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;const scale=Number(getComputedStyle(el).getPropertyValue("--globe-framing-scale"))||1;camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(17))*scale));camera.updateProjectionMatrix();});resize.observe(el);
  const lost=(e:Event)=>{e.preventDefault();contextLost=true;current.current.onBuffering?.(true);setMessage('The tectonic view is recovering…');};
  const restored=()=>{contextLost=false;selected=-1;load(current.current.age);};
  renderer.domElement.addEventListener('webglcontextlost',lost);renderer.domElement.addEventListener('webglcontextrestored',restored);
  const animate=()=>{if(!alive)return;frame=requestAnimationFrame(animate);if(document.hidden||contextLost)return;controls.autoRotate=current.current.autoRotate&&!reduced;controls.update();renderer.render(scene,camera);};animate();
  return()=>{alive=false;controller?.abort();request.current=()=>{};cancelAnimationFrame(frame);resize.disconnect();controls.dispose();clear(drawing);sphere.geometry.dispose();sphere.material.map?.dispose();sphere.material.dispose();renderer.dispose();renderer.domElement.remove();};
 },[retry]);
 return <div className="globe-host" ref={host}>{message ? <div className="globe-pending" role="status">{message}{failed&&<button onClick={()=>setRetry(x=>x+1)}>Retry reconstruction</button>}</div> : null}</div>;
}



