'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {Orbit,ArrowLeft,ArrowUpRight,Play,Pause,ChevronLeft,ChevronRight,Plus,Minus,RotateCcw,Route,BookOpen,Layers3} from 'lucide-react';
import Globe,{GlobeApi,Layers} from '@/components/earth-globe';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import HumanAtlas from '@/components/human-atlas';
import {events,EarthEvent,formatAge,sources,iceAgeGeography} from '@/lib/earth/history';
import {routes} from '@/lib/earth/migration';

const chapters=[
 {id:'sapiens',name:'Many beginnings',region:'Africa',start:.3,end:.12,focus:[8,23],routes:['africa-n','africa-s'],insight:'Our origins belong to a continent. The points on this globe represent selected evidence, not one birthplace.'},
 {id:'out-africa',name:'Beyond the familiar',region:'Africa → Southwest Asia',start:.075,end:.05,focus:[22,48],routes:['levant','arabia','india'],insight:'Watch the connections branch. These are broad dispersal hypotheses; people moved more than once, in more than one direction.'},
 {id:'sahul',name:'Across the water',region:'Southeast Asia → Sahul',start:.065,end:.05,focus:[-5,119],routes:['sunda','sahul'],insight:'Lower seas joined Australia and New Guinea. They never eliminated every sea crossing between Southeast Asia and Sahul.'},
 {id:'europe',name:'A world of encounters',region:'Europe & Asia',start:.06,end:.04,focus:[42,65],routes:['europe','asia'],insight:'This was a shared human world. Neanderthals and Denisovan-related populations contributed ancestry to later Homo sapiens populations.'},
 {id:'americas',name:'New horizons',region:'Beringia → the Americas',start:.032,end:.0145,focus:[55,-165],routes:['siberia','beringia','america','south-america'],insight:'Evidence of presence and evidence of a route are different. White Sands footprints do not establish the precise path taken into the Americas.'},
 {id:'pacific',name:'An ocean of possibility',region:'Remote Oceania',start:.0033,end:.0008,focus:[-15,-175],routes:['pacific-west','pacific-east'],insight:'The last chapter unfolds across water. Different islands were settled at different times; these lines connect regions, not individual voyages.'},
] as const;
const baseLayers:Layers={clouds:true,plates:false,climate:false,ice:true,life:false,humans:true,migration:true,civilization:false,grid:false};

export default function HumanOdyssey(){
 const [index,setIndex]=useState(0),[progress,setProgress]=useState(0),[playing,setPlaying]=useState(false),[evidence,setEvidence]=useState(false),[allRoutes,setAllRoutes]=useState(false),[layers,setLayers]=useState(baseLayers),[status,setStatus]=useState('');
 const [atlasOpen,setAtlasOpen]=useState(false),[atlasEvent,setAtlasEvent]=useState<EarthEvent|null>(null);
 const api=useRef<GlobeApi|null>(null);const chapter=chapters[index];const age=atlasEvent?.age??(chapter.start+(chapter.end-chapter.start)*progress/100);
 const event=atlasEvent??events.find(e=>e.id===chapter.id)??events.find(e=>e.id==='sapiens')!;
 const geography=iceAgeGeography(age);
 const focus=atlasEvent?.location??chapter.focus,focusLat=focus[0],focusLon=focus[1];
 const focusRef=useRef({lat:focusLat,lon:focusLon});
 useEffect(()=>{focusRef.current={lat:focusLat,lon:focusLon};},[focusLat,focusLon]);
 const ready=useCallback((value:GlobeApi)=>{api.current=value;value.focus(focusRef.current.lat,focusRef.current.lon);},[]);
 const go=(next:number)=>{setAtlasEvent(null);setIndex(next);setProgress(0);setPlaying(false);};
 useEffect(()=>{api.current?.focus(focusLat,focusLon);},[focusLat,focusLon]);
 const visit=(entry:EarthEvent)=>{setPlaying(false);setAtlasEvent(entry);};
 const buffering=useRef(true);
 const onBuffering=useCallback((waiting:boolean)=>{buffering.current=waiting;},[]);
 const progressRef=useRef(progress);
 useEffect(()=>{progressRef.current=progress;},[progress]);
 useEffect(()=>{
  if(!playing)return;
  let frame=0,last=0,position=progressRef.current;
  const tick=(now:number)=>{
   if(buffering.current||document.hidden){last=0;frame=requestAnimationFrame(tick);return;}
   if(last)position=Math.min(100,position+Math.min(now-last,100)/240);
   if(position>=100){
    if(index===chapters.length-1){setProgress(100);setPlaying(false);}
    else{setProgress(0);setIndex(index+1);}
    return;
   }
   setProgress(position);last=now;frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[playing,index]);
 const play=()=>{setAtlasEvent(null);if(progress===100){setProgress(0);if(index===chapters.length-1)setIndex(0);}setPlaying(v=>!v);};
 return <main className="atlas odyssey">
  <a className="skip-link" href="#odyssey-story">Skip to human story</a>
  <header className="topbar"><Link className="brand" href="/" aria-label="AEON home"><Orbit size={30}/><span>AEON</span></Link><span className="brand-note">A LIVING HISTORY<br/>OF EARTH</span><nav aria-label="Main navigation"><Link href="/">Explore Earth</Link><Link href="/human-odyssey" className="active" aria-current="page">Human Odyssey</Link></nav><Link className="odyssey-back" href="/"><ArrowLeft size={15}/><span>Planet explorer</span></Link></header>
  <div className="odyssey-heading"><div><span className="eyebrow"><span className="live-dot"/> A STORY WITHIN THE STORY</span><h1>Human <em>Odyssey.</em></h1></div><p>One species. Many paths.<br/>Follow the journeys that connect us.</p><button className="primary odyssey-start" onClick={play}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'Pause journey':'Play guided demo'}</button><button className="text-link" onClick={()=>{setPlaying(false);setEvidence(true);}}><BookOpen size={15}/> Evidence & uncertainty</button><button className="text-link" onClick={()=>{setPlaying(false);setAtlasOpen(true);}}><BookOpen size={15}/> Human Story Atlas</button></div>
  <section className="odyssey-stage" aria-label="Human migration globe">
   <div className="odyssey-world"><Globe onBuffering={onBuffering} age={age} layers={{...layers,civilization:atlasEvent?.category==='Civilization'}} selected={atlasEvent} onSelect={entry=>{visit(entry);setEvidence(true);}} onReady={ready} autoRotate={false} onStatus={setStatus} routeIds={atlasEvent?[]:allRoutes?undefined:[...chapter.routes]}/><div className="odyssey-world-label"><span className="live-dot"/> {atlasEvent?.place??chapter.region}<small>{status||'Drag to explore · Scroll or pinch to zoom'}</small></div><div className="view-toolbar"><button aria-label="Zoom in" onClick={()=>api.current?.zoom(.85)}><Plus size={17}/></button><button aria-label="Zoom out" onClick={()=>api.current?.zoom(1.15)}><Minus size={17}/></button><button aria-label="Refocus this chapter" onClick={()=>api.current?.focus(focus[0],focus[1])}><RotateCcw size={16}/></button></div></div>
   <article className="odyssey-story" id="odyssey-story"><div className="context-heading"><span className="eyebrow">{atlasEvent?'HUMAN STORY ATLAS':`CHAPTER ${String(index+1).padStart(2,'0')} / 06`}</span><Route size={16}/></div><h2>{atlasEvent?.title??chapter.name}</h2><div className="odyssey-date" aria-live={playing?'off':'polite'}>{formatAge(age)}</div><p>{event.description}</p>{age<=.08&&<div className="paleogeography-readout" aria-label="Ice Age geography"><div><span>SEA LEVEL</span><strong>≈ {geography.level>0?'+':''}{Math.round(geography.level / 5) * 5} m</strong><small>schematic global estimate</small></div><div><span>PALEOGEOGRAPHY</span><ul>{(geography.regions.length ? geography.regions : ['Near-modern coastlines']).map(region=><li key={region}>{region}</li>)}</ul></div></div>}<div className="odyssey-insight"><span className="eyebrow">WHAT TO LOOK FOR</span><p>{atlasEvent?.certainty??chapter.insight}</p></div>{!atlasEvent&&<div className="odyssey-route-key"><i/> Approximate dispersal connection</div>}{atlasEvent&&<button className="text-link" onClick={()=>setAtlasEvent(null)}>Return to guided journey <ArrowUpRight size={14}/></button>}<button className="text-link" onClick={()=>{setEvidence(true);setPlaying(false);}}>Read the evidence <ArrowUpRight size={14}/></button></article>
  </section>
  <section className="odyssey-console" aria-label="Human Odyssey playback"><div className="odyssey-playline"><div className="play-controls"><button className="step-button" aria-label="Previous human chapter" disabled={index===0} onClick={()=>go(index-1)}><ChevronLeft size={18}/></button><button className="play-button" aria-label={playing?'Pause Human Odyssey':'Play Human Odyssey demo'} onClick={play}>{playing?<Pause size={17}/>:<Play size={17}/>}</button><button className="step-button" aria-label="Next human chapter" disabled={index===chapters.length-1} onClick={()=>go(index+1)}><ChevronRight size={18}/></button></div><div className="odyssey-scrubber"><div><span>{atlasEvent?'Select Play to resume the guided journey':playing?'Following the journey':'Explore at your own pace'}</span><span>{atlasEvent?formatAge(atlasEvent.age):`${formatAge(chapter.start,true)} — ${formatAge(chapter.end,true)}`}</span></div><Slider aria-label="Human chapter progress" aria-valuetext={`${chapter.name}: ${formatAge(chapter.start+(chapter.end-chapter.start)*progress/100)}`} value={[progress]} min={0} max={100} step={.1} onValueChange={v=>{setAtlasEvent(null);setPlaying(false);setProgress(Array.isArray(v)?v[0]:v);}}/></div><button className="odyssey-restart" onClick={()=>{setAtlasEvent(null);setIndex(0);setProgress(0);setPlaying(true);}}><RotateCcw size={14}/> Restart demo</button></div><nav className="odyssey-chapters" aria-label="Human story chapters">{chapters.map((c,i)=><button key={c.id} aria-current={!atlasEvent&&i===index?'step':undefined} className={!atlasEvent&&i===index?'selected':''} onClick={()=>go(i)}><small>{String(i+1).padStart(2,'0')}</small><strong>{c.name}</strong><span>{c.region}</span><div className="odyssey-chapter-progress" style={{transform:`scaleX(${i===index?progress/100:i<index?1:0})`}}/></button>)}</nav></section>
  <div className="odyssey-settings"><span><Layers3 size={14}/> Your view</span><label htmlFor="all-routes">All dispersal connections <Switch id="all-routes" size="sm" checked={allRoutes} onCheckedChange={setAllRoutes}/></label><label htmlFor="fossil-locations">Fossil evidence locations <Switch id="fossil-locations" size="sm" checked={layers.humans} onCheckedChange={v=>setLayers(l=>({...l,humans:v}))}/></label><label htmlFor="ice-shelves">Ice & exposed shelves <Switch id="ice-shelves" size="sm" checked={layers.ice} onCheckedChange={v=>setLayers(l=>({...l,ice:v}))}/></label></div>
  <p className="odyssey-footnote">A guided, schematic demonstration. Chapters overlap in time; movement was branching and repeated. Dates are approximate, and connecting lines are not verified tracks. Explore human journeys here; the planet explorer follows geological and environmental change.</p>
  <Sheet open={evidence} onOpenChange={setEvidence}><SheetContent scrollResetKey={event.id} className="atlas-sheet"><SheetHeader><SheetTitle>{atlasEvent?.title??chapter.name}</SheetTitle><SheetDescription>{event.date}</SheetDescription></SheetHeader><div className="sheet-body"><h3>What the evidence tells us</h3><p>{event.description}</p><h3>Why it matters</h3><p>{event.importance}</p><div className="evidence-box"><BookOpen size={17}/><div><h3>What remains uncertain</h3><p>{event.certainty}</p></div></div>{!atlasEvent&&<h3>Connections in this chapter</h3>}{routes.filter(r=>!atlasEvent&&(chapter.routes as readonly string[]).includes(r.id)).map(r=><p key={r.id}>{r.name}<br/><small>{r.range}</small></p>)}<h3>Sources</h3><ul className="sources-list">{event.sources.map(id=><li key={id}><a href={sources[id].url} target="_blank" rel="noreferrer">{sources[id].name}<ArrowUpRight size={14}/></a></li>)}</ul><p className="fine-print">Fossil markers show selected evidence locations, not continuous population ranges. Ice and shelf geography is approximate. Playback speed serves the explanation and is not a population model.</p></div></SheetContent></Sheet>
 <HumanAtlas open={atlasOpen} onOpenChange={setAtlasOpen} onSelect={visit}/>
 </main>;
}



