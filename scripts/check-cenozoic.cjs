const {chromium}=require('playwright');
const sharp=require('sharp');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGL/i.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>{window.earthTools={};Object.defineProperty(document,'modelContext',{value:{registerTool:t=>window.earthTools[t.name]=t}});});
  await page.goto(process.env.CHECK_URL||'http://localhost:3004');
  await page.waitForFunction(()=>window.earthTools.explore_earth_time);
  const ages=[66,50,34,20,5,1,.14,.125,.021,.006,.0005,0],shots=[];
  for(const age of ages){
   await page.evaluate(age=>window.earthTools.explore_earth_time.execute({millionYearsAgo:age}),age);
   await page.waitForFunction(age=>{const c=document.querySelector('canvas');return Number(c?.dataset.renderedAge)===age&&c.dataset.loading==='false';},age,{timeout:30000});
   const d=await page.locator('canvas').first().evaluate(c=>({...c.dataset}));
   assert.equal(d.terrainWidth,'1801');assert(Number(d.fineGridCount)<=6);
   const a=age>.12?Math.floor(age/5)*5:0,b=age>.12?a+5:0;
   assert.equal(d.terrainPair,`${a}:${b}`);
   const png=await page.screenshot({animations:'disabled'});
   await sharp(png).extract({left:460,top:110,width:520,height:490}).resize(390,368).png().toFile(`outputs/cenozoic-${age}.png`);
   const pixels=await sharp(png).extract({left:460,top:110,width:520,height:490}).resize(160,150).removeAlpha().raw().toBuffer();
   shots.push({age,pixels});
  }
  for(let i=1;i<shots.length-1;i++){
   let difference=0;for(let k=0;k<shots[i].pixels.length;k++)difference+=Math.abs(shots[i].pixels[k]-shots[i-1].pixels[k]);
   difference/=shots[i].pixels.length;
   assert(difference>.15,`Frozen globe ${shots[i-1].age} to ${shots[i].age}`);
   console.log(`${shots[i-1].age} → ${shots[i].age}: globe pixel change ${difference.toFixed(2)}`);
  }
  for(const age of [66,5,50,1,20,510,65,.14,34,66])await page.evaluate(age=>window.earthTools.explore_earth_time.execute({millionYearsAgo:age}),age);
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.renderedAge==='66'&&document.querySelector('canvas').dataset.loading==='false');
  assert.equal(await page.getByRole('combobox',{name:'Timeline scale',exact:true}).innerText(),'Deep time');
  assert.deepEqual(errors,[]);
  console.log('PASS date-specific fine terrain, cache bound, visible succession, final rapid selection, and scale preservation');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
