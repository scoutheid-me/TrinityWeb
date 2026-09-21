export interface Profile {name:string;created:boolean;character:'man'|'woman';potions:{health:number;stamina:number};pockets:(string|null)[];explored:string[];sentinelSeen:boolean;chats:string[];}
export function cleanName(value:unknown){return typeof value==='string'?value.replace(/[<>\x00-\x1f]/g,'').trim().slice(0,24)||'Wayfarer':'Wayfarer';}
export function freshProfile():Profile{return {name:'Wayfarer',created:false,character:'man',potions:{health:2,stamina:2},pockets:['health','stamina',null,null,null],explored:[],sentinelSeen:false,chats:[]};}
export function validateProfile(raw:unknown):Profile{
 const p=freshProfile();if(!raw||typeof raw!=='object')return p;const r=raw as Partial<Profile>;p.name=cleanName(r.name);p.created=r.created===true;p.character=r.character==='woman'?'woman':'man';
 for(const k of ['health','stamina'] as const){const n=r.potions?.[k];if(typeof n==='number'&&Number.isFinite(n))p.potions[k]=Math.max(0,Math.min(99,Math.floor(n)));}
 if(Array.isArray(r.pockets)&&r.pockets.length===5){const seen=new Set<string>();p.pockets=r.pockets.map(v=>{if((v==='health'||v==='stamina')&&!seen.has(v)){seen.add(v);return v;}return null;});}
 if(Array.isArray(r.explored))p.explored=[...new Set(r.explored.filter(v=>typeof v==='string'&&/^-?[0-3],-?[0-3]$/.test(v)))];
 p.sentinelSeen=r.sentinelSeen===true;if(Array.isArray(r.chats))p.chats=[...new Set(r.chats.filter(v=>['guild','oath'].includes(v)))];return p;
}
