'use client';
import {useState} from 'react';
import {ArrowUpRight,Search} from 'lucide-react';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {Input} from '@/components/ui/input';
import {events,EarthEvent,formatAge} from '@/lib/earth/history';
const humanEvents=events.filter(e=>['Humanity','Migration','Civilization'].includes(e.category));
export default function HumanAtlas({open,onOpenChange,onSelect}:{open:boolean;onOpenChange:(open:boolean)=>void;onSelect:(event:EarthEvent)=>void}){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('All');
 const matches=humanEvents.filter(e=>(category==='All'||e.category===category)&&query.toLowerCase().trim().split(/\s+/).every(word=>`${e.title} ${e.place} ${e.description} ${e.keywords??''}`.toLowerCase().includes(word)));
 return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="atlas-sheet human-atlas-sheet"><SheetHeader><SheetTitle>Human Story Atlas</SheetTitle><SheetDescription>Explore human origins, dispersal, agriculture, early cities and metalworking societies. Choose an entry to visit its time and location.</SheetDescription></SheetHeader><div className="sheet-body"><label className="human-atlas-search" htmlFor="human-atlas-query"><Search size={16}/><Input aria-label="Search human history" id="human-atlas-query" placeholder="Species, places, cities, metals…" value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="human-atlas-filters" aria-label="Human history categories">{['All','Humanity','Migration','Civilization'].map(c=><button key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c==='Humanity'?'Origins':c}</button>)}</div><output className="human-atlas-count" aria-live="polite">{matches.length} {matches.length===1?'entry':'entries'}</output><div className="human-atlas-results">{matches.map(e=><button key={e.id} onClick={()=>{onSelect(e);onOpenChange(false);}}><span>{formatAge(e.age)} · {e.category==='Humanity'?'Human origins':e.category}</span><strong>{e.title}<ArrowUpRight size={15}/></strong><small>{e.place}</small></button>)}</div>{!matches.length&&<p>No entries match this search. Try a place, species or civilization name.</p>}</div></SheetContent></Sheet>;
}

