import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import sharp from 'sharp';
const js=ts.transpileModule(fs.readFileSync('lib/earth/history.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {events,sources,chronology,scales,toPosition,fromPosition,seaLevel}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
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
assert.equal(new Set(events.map(e=>e.id)).size,events.length);
assert.equal(events.filter(e=>e.category==='Extinction').length,5);
for(const e of events){assert(e.age>=0&&e.age<=4540);assert(e.sources.length>0);for(const s of e.sources)assert(sources[s],`${e.id}: ${s}`);if(e.location){assert(Math.abs(e.location[0])<=90);assert(Math.abs(e.location[1])<=180);}}
const ages=JSON.parse(fs.readFileSync('lib/earth/paleo-ages.json','utf8'));assert.equal(ages.length,109);
const grids=[];for(const age of ages){const {data,info}=await sharp(`public/paleo/${age}.png`).raw().toBuffer({resolveWithObject:true});assert.equal(info.width,361);assert.equal(info.height,181);grids.push(data);}
const h=(lat,lon)=>{const i=((90-lat)*361+lon+180)*3;return grids[0][i]*256+grids[0][i+1]-10000;};
assert(h(0,-30)<0,'Atlantic must be ocean');assert(h(10,20)>0,'Central Africa must be land');
assert.notDeepEqual(grids[0],grids[56],'Pangaea must differ from modern geography');
const plates=JSON.parse(fs.readFileSync('public/plates.json','utf8'));assert(plates.features.length>100);
console.log(`PASS: ${scales.length} time scales, 4,005 round-trip positions, geological boundaries, ${events.length} sourced chapters, 5 extinctions, sea-level anchors, 109 elevation rasters, coordinate orientation and plate geometry.`);
