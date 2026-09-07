import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const root=process.argv[2],modern=process.argv[3],license=process.argv[4];
if(!root||!modern||!license)throw Error('Usage: node scripts/prepare-paleo.mjs CSV_DIRECTORY NASA_JPEG LICENSE_FILE');
fs.mkdirSync('public/paleo',{recursive:true});
const manifest=[];
for(const file of fs.readdirSync(root).filter(x=>x.endsWith('.csv'))){
 const age=Number(file.match(/_(\d+)Ma/)[1]);
 const grid=new Float32Array(361*181);
 for(const row of fs.readFileSync(path.join(root,file),'utf8').trim().split(/\r?\n/).slice(1)){
 const [lon,lat,h]=row.split(',').map(Number);if(Number.isFinite(h))grid[Math.round(90-lat)*361+Math.round(lon+180)]=h;
 }
 // Polar rows contain export artifacts; use the immediately adjacent latitude.
 for(let x=0;x<361;x++){grid[x]=grid[361+x];grid[180*361+x]=grid[179*361+x];}
 const bytes=Buffer.alloc(361*181*3);
 for(let i=0;i<grid.length;i++){const n=Math.round(Math.max(0,Math.min(20000,grid[i]+10000)));bytes[i*3]=n>>8;bytes[i*3+1]=n&255;bytes[i*3+2]=0;}
 await sharp(bytes,{raw:{width:361,height:181,channels:3}}).png().toFile(`public/paleo/${age}.png`);
 manifest.push(age);
}
fs.writeFileSync('lib/earth/paleo-ages.json',JSON.stringify(manifest.sort((a,b)=>a-b)));
await sharp(modern).resize(4096,2048).webp({quality:90}).toFile('public/textures/earth.webp');
fs.copyFileSync(license,'public/paleo/LICENSE.txt');
console.log('Prepared '+manifest.length+' scientific elevation grids and NASA Earth texture.');
