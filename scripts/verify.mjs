import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import sharp from 'sharp';
const js=ts.transpileModule(fs.readFileSync('lib/earth/history.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {events,sources,chronology,chapterChronology,scales,toPosition,fromPosition,seaLevel,cryogenianIce,latePaleozoicIce,latePleistoceneIce,iceAgeGeography,environment,lifeAt}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
for(let scale=0;scale<scales.length;scale++){
 for(let p=0;p<=100;p+=.125){const age=fromPosition(p,scale);assert(age>=0&&age<=scales[scale].max);assert(Math.abs(toPosition(age,scale)-p)<1e-8,`Timeline round trip ${scale}:${p}`);}
 assert.equal(fromPosition(0,scale),scales[scale].max);assert.equal(fromPosition(100,scale),0);
}
assert.deepEqual(chronology(0),{eon:'Phanerozoic',era:'Cenozoic',period:'Quaternary',epoch:'Holocene'});
assert.equal(chronology(.021).epoch,'Pleistocene');assert.equal(chronology(.0117).epoch,'Holocene');
assert.equal(chronology(66).era,'Cenozoic');assert.equal(chronology(66).period,'Paleogene');assert.equal(chronology(66).epoch,'Paleocene');
assert.equal(chronology(150).period,'Jurassic');assert.equal(chronology(280).period,'Permian');
assert.equal(chronology(538.8).eon,'Phanerozoic');assert.equal(chronology(539).eon,'Proterozoic');assert.equal(chronology(4031).eon,'Archean');assert.equal(chronology(4032).eon,'Hadean');
assert.equal(seaLevel(.021),-120);assert.equal(seaLevel(.05),-75);assert.equal(seaLevel(.065),-85);assert.equal(seaLevel(0),0);
assert.equal(latePleistoceneIce(0),0);assert.equal(latePleistoceneIce(.0117),0);assert.equal(latePleistoceneIce(.021),1);assert.equal(latePleistoceneIce(.08),0);
assert(latePleistoceneIce(.038)>.45&&latePleistoceneIce(.038)<.65,'38 ka ice must remain below its LGM peak');
assert.deepEqual(iceAgeGeography(.021).regions,['Beringia exposed','Sunda Shelf exposed','Sahul joined','Wallacea remains maritime']);
assert.equal(iceAgeGeography(.021).level,-120);assert.deepEqual(iceAgeGeography(0).regions,[]);
assert.equal(new Set(events.map(e=>e.id)).size,events.length);
assert.equal(events.filter(e=>e.category==='Extinction').length,5);
for(const e of events){assert(e.age>=0&&e.age<=4540);assert(e.sources.length>0);for(const s of e.sources)assert(sources[s],`${e.id}: ${s}`);if(e.location){assert(Math.abs(e.location[0])<=90);assert(Math.abs(e.location[1])<=180);}}
const ages=JSON.parse(fs.readFileSync('lib/earth/paleo-ages.json','utf8'));assert.equal(ages.length,109);
const grids=[];for(const age of ages){const {data,info}=await sharp(`public/paleo/${age}.png`).raw().toBuffer({resolveWithObject:true});assert.equal(info.width,361);assert.equal(info.height,181);let min=Infinity,max=-Infinity,land=0,ocean=0;for(let i=0;i<data.length;i+=info.channels){const elevation=data[i]*256+data[i+1]-10000;min=Math.min(min,elevation);max=Math.max(max,elevation);if(elevation>0)land++;if(elevation<-50)ocean++;}assert(max-min>1000,`${age} Ma PaleoDEM is flat`);assert(land>1000,`${age} Ma PaleoDEM has no meaningful land`);assert(ocean>1000,`${age} Ma PaleoDEM has no meaningful ocean`);grids.push(data);}
const h=(lat,lon)=>{const i=((90-lat)*361+lon+180)*3;return grids[0][i]*256+grids[0][i+1]-10000;};
assert(h(0,-30)<0,'Atlantic must be ocean');assert(h(10,20)>0,'Central Africa must be land');
assert.notDeepEqual(grids[0],grids[56],'Pangaea must differ from modern geography');
for(let i=1;i<grids.length;i++)assert.notDeepEqual(grids[i],grids[i-1],`${ages[i]} Ma PaleoDEM duplicates ${ages[i-1]} Ma`);
const plates=JSON.parse(fs.readFileSync('public/plates.json','utf8'));assert(plates.features.length>100);
// Regression: the nonglacial interval must not be presented or shaded as an ice age.
for(const age of [700,680,640,638])assert(cryogenianIce(age)>.99);
for(const age of [725,717,655,650,645,635,600])assert.equal(cryogenianIce(age),0);
for(let age=630;age<=725;age+=.1){const ice=cryogenianIce(age);assert(ice>=0&&ice<=1);}
assert.equal(environment(650).climate,'Between major glaciations');
assert.equal(environment(700).climate,'Sturtian glaciation');
assert.equal(environment(640).climate,'Marinoan glaciation');
assert.equal(latePaleozoicIce(360),0);assert(latePaleozoicIce(330)>.99);assert(latePaleozoicIce(280)>.99);assert.equal(latePaleozoicIce(250),0);
assert.equal(environment(310).climate,'Late Paleozoic icehouse; humid equator');
assert.equal(environment(280).climate,'Drying interior; southern ice wanes');
assert.equal(environment(230).climate,'Hot, strongly seasonal greenhouse');
assert.equal(environment(.0118).climate,'Glacial–interglacial cycles');
assert.equal(environment(.0117).climate,'Holocene interglacial');
for(const age of [0,.01,.1,1,5])assert(!/human|hominin|sapiens/i.test(JSON.stringify(lifeAt(age))),'Earth biosphere overlay must stay separate from Human Odyssey');
for(const [id,period] of [['ordovician','Ordovician'],['devonian','Devonian'],['permian','Permian'],['triassic','Triassic'],['kpg','Cretaceous']])assert.equal(chapterChronology(events.find(e=>e.id===id)).period,period,`${id} chapter must use its ending period`);
console.log(`PASS: ${scales.length} time scales, 4,005 round-trip positions, geological boundaries, ${events.length} sourced chapters, 5 extinctions, sea-level anchors, 109 non-flat elevation rasters, coordinate orientation plate geometry, Cryogenian surface/context agreement and Earth-only biosphere text.`);

for(const age of [.0046,.0033])assert.deepEqual(iceAgeGeography(age).regions,[],'Holocene cities must not show Ice Age land bridges');
