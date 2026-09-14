/** Geographic preparation for a model-consistent tectonic view.
 * Coordinates stay in the model's own reference frame. No PALEOMAP alignment
 * or reconstructed elevation is inferred by these helpers.
 */
export type Position = [number, number];
export type Vector3 = [number, number, number];
export type BoundaryKind = 'subduction' | 'ridge' | 'transform' | 'other';
export type GeographicGeometry = {type:string; coordinates:unknown};

export function boundaryKind(type: string): BoundaryKind {
  if(type==='SubductionZone') return 'subduction';
  if(type==='MidOceanRidge') return 'ridge';
  if(type==='Transform') return 'transform';
  // A fracture zone records past motion; do not label it an active transform.
  return 'other';
}

function line(value:unknown):Position[] {
  if(!Array.isArray(value)) throw new Error('Expected coordinate sequence');
  return value.map(point=>{
    if(!Array.isArray(point)||point.length<2||!Number.isFinite(point[0])||!Number.isFinite(point[1])||Math.abs(point[1])>90)
      throw new Error('Invalid longitude/latitude');
    return [point[0],point[1]];
  });
}

/** Preserve polygon holes, separate parts and service-generated seam splits. */
export function geometryLines(geometry:GeographicGeometry):Position[][] {
  const c=geometry.coordinates;
  switch(geometry.type){
    case 'LineString': return [line(c)];
    case 'MultiLineString':
    case 'Polygon':
      if(!Array.isArray(c)) throw new Error('Expected geometry parts');
      return c.map(line);
    case 'MultiPolygon':
      if(!Array.isArray(c)) throw new Error('Expected polygons');
      return c.flatMap(p=>{if(!Array.isArray(p))throw new Error('Expected polygon rings');return p.map(line);});
    default: throw new Error('Unsupported tectonic geometry: '+geometry.type);
  }
}

export function geographicVector([lon,lat]:Position):Vector3 {
  const a=lat*Math.PI/180,b=lon*Math.PI/180;
  return [Math.cos(a)*Math.cos(b),Math.sin(a),-Math.cos(a)*Math.sin(b)];
}

/** Three.js LineSegments positions. Subdivide great-circle arcs so long
 * edges do not disappear inside the globe; dateline crossings take the short
 * arc. Exact antipodal edges are rejected because their path is ambiguous.
 */
export function sphericalSegments(lines:Position[][],radius=1.006,maxAngleDegrees=1):Float32Array {
  if(!(radius>0)||!(maxAngleDegrees>0&&maxAngleDegrees<=10))throw new Error('Invalid tessellation settings');
  const result:number[]=[];
  for(const points of lines){
    for(let i=1;i<points.length;i++){
      const a=geographicVector(points[i-1]),b=geographicVector(points[i]);
      const angle=Math.acos(Math.max(-1,Math.min(1,a.reduce((s,x,k)=>s+x*b[k],0))));
      if(angle<1e-8)continue;
      if(Math.PI-angle<1e-7)throw new Error('Ambiguous antipodal edge');
      const count=Math.ceil(angle/(maxAngleDegrees*Math.PI/180)),sin=Math.sin(angle);
      const at=(t:number)=>a.map((x,k)=>radius*(Math.sin((1-t)*angle)*x+Math.sin(t*angle)*b[k])/sin);
      for(let j=0;j<count;j++)result.push(...at(j/count),...at((j+1)/count));
    }
  }
  return new Float32Array(result);
}
