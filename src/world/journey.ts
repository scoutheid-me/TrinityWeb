import type {ArtDefinition} from '../data/arts';
export const primers = [
 {id:'pathfinder',name:'Pathfinder’s Primer',theme:'Short repositioning cuts. Trade raw damage for safer angles.',root:'trail-step',leaf:'turning-cut',requirement:'Land 12 basics and evade 2 attacks after receiving this book.'},
 {id:'steadfast',name:'Steadfast Primer',theme:'Measured close-range blows that chip away at guard.',root:'stone-tap',leaf:'anchored-cut',requirement:'Land 12 basics and cause 2 Breaks after receiving this book.'},
 {id:'renewal',name:'Renewal Primer',theme:'Small stamina returns when a precise cut connects.',root:'breathing-cut',leaf:'second-breath',requirement:'Land 12 basics and perform 2 Counters after receiving this book.'},
] as const;
export type PrimerId=typeof primers[number]['id'];
const form=(id:string,name:string,description:string,cost:number,multiplier:number,br:number,extra:Partial<ArtDefinition>={}):ArtDefinition=>({id,name,description,weapon:'any',cost,startup:150,recovery:320,movement:.1,arc:.4,armor:false,motion:'basic',maxTargets:1,shape:{kind:'box',range:2.4,halfWidth:.3},nodes:[{at:600,multiplier,break:br,range:2.4,input:'press'}],...extra});
export const primerArts:Record<string,ArtDefinition>={
 'trail-step':form('trail-step','Trail Step','A short right sidestep and light cut. No invulnerability; one target.',15,4,12,{sideMovement:1}),
 'turning-cut':form('turning-cut','Turning Cut','A wider sidestep and precise single cut. Positioning, not burst damage.',18,5,16,{sideMovement:1.5}),
 'stone-tap':form('stone-tap','Stone Tap','A compact, stationary guard-breaking tap. Modest damage, extra Break.',18,4,26,{movement:0,recovery:420}),
 'anchored-cut':form('anchored-cut','Anchored Cut','A slow single cut with extra Break. The commitment leaves you exposed.',22,5,34,{movement:0,recovery:520}),
 'breathing-cut':form('breathing-cut','Breathing Cut','A light close strike. Landing it restores 6 stamina, scaled by release quality.',16,4,12,{restoreStamina:6}),
 'second-breath':form('second-breath','Second Breath','One patient strike. Landing it restores 10 stamina, scaled by release quality.',20,5,16,{restoreStamina:10,recovery:420}),
};
export interface Journey {
 version:2; visited:number[]; quest:'offered'|'accepted'|'declined'|'completed';position:{x:number;z:number};checkpoint:{x:number;z:number};defeated:string[];active:boolean; room:number; cleared:number[]; looted:string[]; facts:string[]; coins:number; elapsedMs:number;
 book:PrimerId|null; leafLearned:boolean; practice:{hits:number;evades:number;parries:number;breaks:number};
 checkpointHp:number; purchases:number;
}
export const freshJourney=(active=true):Journey=>({version:2,visited:[0],quest:'offered',position:{x:0,z:-6},checkpoint:{x:0,z:-6},defeated:[],active,room:0,cleared:[],looted:[],facts:[],coins:0,elapsedMs:0,book:null,leafLearned:false,practice:{hits:0,evades:0,parries:0,breaks:0},checkpointHp:200,purchases:0});
const count=(v:unknown,max=100000)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
export function validateJourney(raw:unknown):Journey{
 const j=freshJourney(false);if(!raw||typeof raw!=='object')return j;const r=raw as Partial<Journey>;if(r.version!==2)return freshJourney(r.active!==false);
 j.active=r.active===true;j.cleared=Array.isArray(r.cleared)?[...new Set(r.cleared.filter(v=>Number.isInteger(v)&&v>=0&&v<=8))].sort((a,b)=>a-b):[];
 j.visited=Array.isArray(r.visited)?[...new Set(r.visited.filter(i=>Number.isInteger(i)&&i>=0&&i<=9))]:[0];
 j.room=count(r.room,9);j.quest=['offered','accepted','declined','completed'].includes(r.quest??'')?r.quest!:'offered';j.defeated=Array.isArray(r.defeated)?[...new Set(r.defeated.filter(v=>/^cavern-[124567]-[01]$/.test(v)))]:[];for(const key of ['position','checkpoint'] as const){const v=r[key];if(v&&Number.isFinite(v.x)&&Number.isFinite(v.z)&&Math.abs(v.x)<100&&v.z>=-20&&v.z<190)j[key]={x:v.x,z:v.z};}
 j.looted=Array.isArray(r.looted)?[...new Set(r.looted.filter(v=>/^chest-[0-8]$/.test(v)))]:[];
 const known=['joined','awakened','bought','supplies','boss','mira','town-quest','message-read','quest-resolved','exit-open'];j.facts=Array.isArray(r.facts)?[...new Set(r.facts.filter(v=>known.includes(v)))]:[];
 if(!j.defeated.includes('cavern-7-0')){j.facts=j.facts.filter(v=>!['boss','mira','town-quest'].includes(v));if(j.quest==='completed')j.quest='accepted';}
 if(j.facts.includes('boss')&&j.position.z>148&&!j.facts.includes('exit-open'))j.facts.push('exit-open');
 j.coins=count(r.coins,999999);j.elapsedMs=count(r.elapsedMs,360000000);j.checkpointHp=Math.max(1,count(r.checkpointHp,9999));j.purchases=count(r.purchases,99);
 for(const k of Object.keys(j.practice) as (keyof Journey['practice'])[])j.practice[k]=count(r.practice?.[k]);
 if(j.quest==='completed'&&j.facts.includes('boss')&&primers.some(b=>b.id===r.book))j.book=r.book!;
 j.leafLearned=!!j.book&&r.leafLearned===true&&canLearnLeaf(j);return j;
}
export function claimChest(j:Journey,id:string,coins:number){if(j.looted.includes(id))return false;j.looted.push(id);j.coins+=coins;return true;}
export function buyPotion(j:Journey){if(j.coins<20||j.purchases>=99)return false;j.coins-=20;j.purchases++;if(!j.facts.includes('bought'))j.facts.push('bought');return true;}
export function choosePrimer(j:Journey,id:string){if(j.book||j.quest!=='completed'||!j.facts.includes('boss')||!primers.some(b=>b.id===id))return false;j.book=id as PrimerId;j.practice={hits:0,evades:0,parries:0,breaks:0};return true;}
export function canLearnLeaf(j:Journey){return j.practice.hits>=12&&(j.book==='pathfinder'?j.practice.evades>=2:j.book==='steadfast'?j.practice.breaks>=2:j.book==='renewal'?j.practice.parries>=2:false);}
export function journalArts(j:Journey){const book=primers.find(b=>b.id===j.book);return book?[book.root,...j.leafLearned?[book.leaf]:[]]:[];}
