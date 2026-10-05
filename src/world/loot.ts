import type {Journey} from './journey';
import {creatureEquipment,emptyLoot,type LootCreature,type LootInventory,type LootItem} from '../data/creatureLoot';
export interface CreatureLoot {coins:number;health:number;stamina:number;items:LootInventory;}
/** Stable per adventure and creature. Only carried equipment or biological materials drop. */
export function creatureLoot(seed:number,id:string,creature:LootCreature):CreatureLoot{
 let hash=seed>>>0;for(const ch of id)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
 const roll=()=>{hash=(Math.imul(hash,1664525)+1013904223)>>>0;return hash/4294967296;};
 const items=emptyLoot();
 if(creature==='boar'){items.hide=roll()<.75?1:0;return {coins:0,health:0,stamina:0,items};}
 const boss=creature==='captain',coins=boss?60:4+Math.floor(roll()*8);
 items[creatureEquipment[creature].weapon]=boss||roll()<.18?1:0;
 items.scrapIron=roll()<.55?1+Math.floor(roll()*2):0;
 items.leatherScraps=roll()<.4?1:0;items.token=boss?1:0;
 return {coins,health:0,stamina:0,items};
}
export const goblinLoot=(seed:number,id:string,boss=false)=>creatureLoot(seed,id,boss?'captain':'goblin');
export function claimGoblinLoot(j:Journey,id:string,boss=false,eligible=true){
 if(!eligible||j.defeated.includes(id))return null;
 const drop=goblinLoot(j.lootSeed,id,boss);j.defeated.push(id);j.coins+=drop.coins;
 for(const key of Object.keys(drop.items) as LootItem[])j.items[key]=Math.min(99,j.items[key]+drop.items[key]);return drop;
}
