import type {Journey} from './journey';
import {creatureEquipment,emptyLoot,type LootCreature,type LootInventory,type LootItem} from '../data/creatureLoot';
export interface CreatureLoot {coins:number;health:number;stamina:number;items:LootInventory;}
/** Stable per adventure and creature. Only carried equipment or biological materials drop. */
export function creatureLoot(seed:number,id:string,creature:LootCreature):CreatureLoot{
 let hash=seed>>>0;for(const ch of id)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
 const roll=()=>{hash=(Math.imul(hash,1664525)+1013904223)>>>0;return hash/4294967296;};
 const items=emptyLoot();
 if(creature==='boar'||creature==='wolf'){items[creature==='wolf'?'wolfPelt':'hide']=roll()<.75?1:0;return {coins:0,health:0,stamina:0,items};}
 const boss=creature==='captain',coins=boss?60:4+Math.floor(roll()*8);
 items[creatureEquipment[creature].weapon]=boss||roll()<.18?1:0;
 items.scrapIron=roll()<.55?1+Math.floor(roll()*2):0;
 items.leatherScraps=roll()<.4?1:0;items.token=boss?1:0;
 return {coins,health:0,stamina:0,items};
}
export const goblinLoot=(seed:number,id:string,boss=false)=>creatureLoot(seed,id,boss?'captain':'goblin');
export interface GroundDrop {id:string;creatureId:string;item:LootItem|'col';amount:number;x:number;z:number;owners:string[];pickedBy?:string;}
export interface LootCredit {contributors:string[];lastHit?:string;}
export const localActorId='player';
export function recordLootDamage(credit:LootCredit,actor:string,damage:number){if(damage<=0||!Number.isFinite(damage))return;if(!credit.contributors.includes(actor))credit.contributors.push(actor);credit.lastHit=actor;}
export function canPickUp(drop:GroundDrop,actor:string){return !drop.pickedBy&&drop.owners.includes(actor);}
/** Defeat commits the roll, not inventory. Old defeated saves never mint replacement loot. */
export function dropGoblinLoot(j:Journey,id:string,position:{x:number;z:number},credit:LootCredit,boss=false,eligible=true,creature:LootCreature=boss?'captain':'goblin'){
 if(!eligible||j.defeated.includes(id))return [];
 const loot=creatureLoot(j.lootSeed,id,creature),owners=boss?(credit.lastHit?[credit.lastHit]:[]):[...new Set(credit.contributors)];
 j.defeated.push(id);const drops:GroundDrop[]=[];
 const add=(item:GroundDrop['item'],amount:number)=>{const index=drops.length,angle=index*2.399,radius=index===0?0:.5+.18*Math.floor(index/5);drops.push({id:id+':'+index,creatureId:id,item,amount,x:position.x+Math.sin(angle)*radius,z:position.z+Math.cos(angle)*radius,owners:[...owners]});};
 if(owners.length){if(loot.coins)add('col',loot.coins);for(const [item,amount] of Object.entries(loot.items))for(let i=0;i<amount;i++)add(item as LootItem,1);}
 j.drops.push(...drops);return drops;
}
export function pickUpDrop(j:Journey,id:string,actor:string,position:{x:number;z:number}){
 const drop=j.drops.find(d=>d.id===id);if(!drop||!canPickUp(drop,actor)||Math.hypot(drop.x-position.x,drop.z-position.z)>1.8)return null;
 if(drop.item==='col'){if(j.coins+drop.amount>999999)return null;j.coins+=drop.amount;}
 else{if(j.items[drop.item]+drop.amount>99)return null;j.items[drop.item]+=drop.amount;}
 drop.pickedBy=actor;return drop;
}
