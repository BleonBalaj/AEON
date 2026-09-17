import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import ts from 'typescript';
const grids=[];
for(let age=0;age<=70;age+=5){
 const {data,info}=await sharp(`public/paleo-detail/${age}.png`).raw().toBuffer({resolveWithObject:true});
 assert.equal(info.width,1801);assert.equal(info.height,901);
 let land=0,ocean=0;
 for(let i=0;i<data.length;i+=info.channels){const h=data[i]*256+data[i+1]-10000;if(h>0)land++;if(h<-100)ocean++;}
 assert(land>100000&&ocean>500000,`Invalid land/ocean at ${age} Ma`);
 if(grids.length)assert.notDeepEqual(data,grids.at(-1),`${age} Ma duplicates previous grid`);
 grids.push(data);
}
const height=(index,lat,lon)=>{const i=(Math.round((90-lat)*5)*1801+Math.round((lon+180)*5))*3;return grids[index][i]*256+grids[index][i+1]-10000;};
assert(height(0,0,-30)<0,'Atlantic orientation');assert(height(0,10,20)>0,'Africa orientation');
// Check meaningful spatial change, not just different PNG compression.
let coastChanges=0;
for(let i=0;i<grids[0].length;i+=3){const a=grids[0][i]*256+grids[0][i+1]>10000,b=grids[13][i]*256+grids[13][i+1]>10000;if(a!==b)coastChanges++;}
assert(coastChanges>100000,'65 Ma should not retain modern land/ocean coverage');
const proxy=JSON.parse(fs.readFileSync('lib/earth/glacial-proxy.json','utf8'));
let source=fs.readFileSync('lib/earth/glacial-surface.ts','utf8').replace("import proxy from './glacial-proxy.json';",`const proxy=${JSON.stringify(proxy)};`);
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {glacialSurfaceWeight,humidSaharaWeight,glacialBlend}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
assert(glacialSurfaceWeight(.14)>.95);assert.equal(glacialSurfaceWeight(.125),0);
assert(glacialSurfaceWeight(.65)>0);assert.equal(glacialSurfaceWeight(3),0);
assert.equal(humidSaharaWeight(.006),1);assert.equal(humidSaharaWeight(.0005),0);assert.equal(humidSaharaWeight(.0125),0);
for(let age=0;age<3;age+=.0003){const w=glacialSurfaceWeight(age);assert(w>=0&&w<=1);}
assert(Math.abs(glacialBlend(.079999,0)-glacialBlend(.080001,0))<.001,'Proxy handoff must be continuous');
console.log(`PASS 15 finer grids; ${coastChanges} land/ocean samples change from 65 Ma; glacial cycles and Holocene vegetation boundaries`);
