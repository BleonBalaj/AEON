import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
// Published numerical data, downloaded unchanged from the author's archive.
const source=fs.readFileSync(process.argv[2]||'outputs/LR04stack.txt','utf8');
const rows=source.split(/\r?\n/).filter(l=>/^\s*\d/.test(l)).map(l=>l.trim().split(/\s+/).map(Number)).filter(r=>r[0]<=2600);
assert(rows.length>500);
assert.deepEqual(rows[0],[0,3.23,.03]);
for(let i=1;i<rows.length;i++)assert(rows[i][0]>rows[i-1][0]&&rows[i].every(Number.isFinite));
fs.writeFileSync('lib/earth/glacial-proxy.json',JSON.stringify({
 citation:'Lisiecki & Raymo (2005), Paleoceanography 20, PA1003, doi:10.1029/2004PA001071',
 source:'https://lorraine-lisiecki.com/LR04stack.txt',sha256:createHash('sha256').update(source).digest('hex'),
 columns:['age_ka','benthic_d18O_per_mil','standard_error_per_mil'],
 note:'Ice volume AND deep-ocean temperature proxy; not a map of ice extent or a sea-level curve.',rows,
})+'\n');
console.log(`Imported ${rows.length} published proxy samples`);
