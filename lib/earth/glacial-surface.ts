import proxy from './glacial-proxy.json';

function smooth(a:number,b:number,x:number){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}

/** Timing is data-driven; intensity is an illustrative transfer, not ice volume.
 * LR04 combines deep-water temperature and ice-volume signals. Never use this
 * normalized display weight as measured coverage or to calculate sea level.
 */
export function glacialSurfaceWeight(age:number){
 if(age<.06||age>=2.58)return 0;
 const ka=age*1000,rows=proxy.rows;
 let low=0,high=rows.length-1;
 while(high-low>1){const mid=(low+high)>>1;if(rows[mid][0]<=ka)low=mid;else high=mid;}
 const a=rows[low],b=rows[high],t=(ka-a[0])/(b[0]-a[0]);
 const isotope=a[1]+(b[1]-a[1])*t;
 return smooth(3.55,4.95,isotope)*(1-smooth(2.4,2.58,age));
}

export function humidSaharaWeight(age:number){
 return smooth(.0045,.006,age)*(1-smooth(.0105,.0117,age));
}

export function glacialBlend(age:number,recentWeight:number){
 const blend=smooth(.06,.08,age);
 return recentWeight*(1-blend)+glacialSurfaceWeight(age)*blend;
}
