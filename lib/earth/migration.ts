export type Route={id:string;name:string;from:[number,number];to:[number,number];start:number;end:number;range:string};
// Connections illustrate broad dispersals. They are not inferred tracks or dated individual journeys.
export const routes:Route[]=[
{id:'africa-n',name:'Within Africa',from:[0,25],to:[30,10],start:.3,end:.12,range:'300–120 ka; schematic'},
{id:'africa-s',name:'Within Africa',from:[0,25],to:[-30,25],start:.3,end:.12,range:'300–120 ka; schematic'},
{id:'levant',name:'Southwest Asia',from:[10,38],to:[30,40],start:.075,end:.055,range:'75–55 ka; multiple dispersals'},
{id:'arabia',name:'Arabian connections',from:[12,43],to:[22,55],start:.07,end:.05,range:'70–50 ka; alternative route'},
{id:'india',name:'South Asia',from:[22,55],to:[20,78],start:.065,end:.05,range:'65–50 ka; approximate'},
{id:'europe',name:'Europe',from:[30,40],to:[48,12],start:.055,end:.043,range:'55–43 ka; approximate'},
{id:'asia',name:'East Asia',from:[30,40],to:[36,110],start:.06,end:.04,range:'60–40 ka; approximate'},
{id:'sunda',name:'Southeast Asia',from:[20,78],to:[8,103],start:.06,end:.05,range:'60–50 ka; approximate'},
{id:'sahul',name:'Wallacea to Sahul',from:[8,103],to:[-13,132],start:.065,end:.05,range:'65–50 ka; sea crossings required'},
{id:'siberia',name:'Siberia',from:[36,110],to:[62,140],start:.04,end:.025,range:'40–25 ka; approximate'},
{id:'beringia',name:'Beringia',from:[62,140],to:[65,-165],start:.032,end:.023,range:'Timing and route debated'},
{id:'america',name:'Americas · route uncertain',from:[65,-165],to:[33,-116],start:.026,end:.021,range:'Presence by 23–21 ka; route uncertain'},
{id:'south-america',name:'South America',from:[33,-116],to:[-30,-72],start:.02,end:.0145,range:'By at least ~14.5 ka; earlier evidence debated'},
{id:'pacific-west',name:'Remote Oceania',from:[-6,145],to:[-18,178],start:.0033,end:.0028,range:'~3.3–2.8 ka'},
{id:'pacific-east',name:'Eastern Polynesia',from:[-18,178],to:[-17,-150],start:.0011,end:.0008,range:'~1.1–0.8 ka; varies by archipelago'}
];
export const hominins=[{name:'Australopithecus afarensis',start:3.85,end:2.95,points:[[9,40],[-3,35]],color:'#c8bd8f'},{name:'Homo habilis',start:2.4,end:1.4,points:[[-3,35],[-26,28]],color:'#d7b581'},{name:'Homo erectus',start:1.89,end:.11,points:[[4,36],[42,44],[-7,110]],color:'#dcac7e'},{name:'Neanderthals',start:.4,end:.04,points:[[48,7],[35,45],[51,85]],color:'#e1b698'},{name:'Denisovan-related',start:.2,end:.05,points:[[51,85],[35,103],[24,120]],color:'#b2a4d1'},{name:'Homo sapiens',start:.3,end:0,points:[[31,-8],[9,40],[-28,26]],color:'#bce1ca'}] as const;

