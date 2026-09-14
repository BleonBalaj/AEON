import assert from 'node:assert/strict';
import fs from 'node:fs';
import {boundaryKind,geometryLines,geographicVector,sphericalSegments} from '../lib/earth/tectonic-geometry.ts';

assert.deepEqual(geographicVector([0,0]),[1,0,-0]);
assert(Math.abs(geographicVector([90,0])[2]+1)<1e-12);
assert.equal(boundaryKind('FractureZone'),'other');
assert.equal(boundaryKind('Transform'),'transform');
assert.equal(boundaryKind('SubductionZone'),'subduction');
assert.equal(geometryLines({type:'MultiPolygon',coordinates:[[[[0,0],[1,0],[0,0]],[[.2,0],[.3,0],[.2,0]]],[[[2,0],[3,0],[2,0]]]]}).length,3);
assert.throws(()=>geometryLines({type:'LineString',coordinates:[[0,91]]}),/Invalid/);
assert.throws(()=>sphericalSegments([[[0,0],[180,0]]]),/antipodal/);
const seam=sphericalSegments([[[179,0],[-179,0]]]);
assert(seam.length<=18,'Date line should cross two degrees, not 358');
for(let i=0;i<seam.length;i+=3){assert(seam[i]<-1);assert(Math.abs(Math.hypot(...seam.slice(i,i+3))-1.006)<1e-6);}
const arc=sphericalSegments([[[0,0],[90,0]]]);
for(let i=0;i<arc.length;i+=6){
 const mid=[0,1,2].map(k=>(arc[i+k]+arc[i+3+k])/2);
 assert(Math.hypot(...mid)>1,'Tessellated edge must stay outside unit sphere');
}
// Optional real-provider fixtures from the research probe. No network in tests.
for(const age of [66,300,1000]){
 const path=`outputs/tectonic-candidates/CAO2024-${age}.json`;
 if(!fs.existsSync(path))continue;
 const data=JSON.parse(fs.readFileSync(path));let count=0;
 for(const feature of data.features){const vertices=sphericalSegments(geometryLines(feature.geometry));assert(vertices.every(Number.isFinite));count+=vertices.length/6;}
 console.log(`Validated CAO2024 at ${age} Ma: ${data.features.length} features, ${count} spherical segments`);
}
console.log('PASS multipart geometry, orientation, date line, surface clearance and boundary classification');
