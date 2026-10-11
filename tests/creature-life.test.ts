import {expect,it} from 'vitest';
import {freshJourney,validateJourney} from '../src/world/journey';
import {dropGoblinLoot,pickUpDrop,canPickUp,recordLootDamage} from '../src/world/loot';
import {CombatSimulation} from '../src/combat/simulation';
import {seesPlayer,cavernSight,updateCavernBehavior} from '../src/combat/creatureBehavior';
function setup(){const s=new CombatSimulation();s.journey=freshJourney();s.journey.defeated.push('cavern-1-0');s.spawnEnemy('goblin');const e=s.enemies[0];Object.assign(e,{id:'cavern-4-0',x:30,z:60,yaw:Math.PI,room:4,home:{x:30,z:60}});return {s,e,j:s.journey};}
it('normal drop ownership requires damage; boss ownership belongs only to last hitter',()=>{
 const credit={contributors:[] as string[],lastHit:undefined as string|undefined};recordLootDamage(credit,'spectator',0);recordLootDamage(credit,'ally',20);recordLootDamage(credit,'player',1);
 const j=freshJourney(),normal=dropGoblinLoot(j,'cavern-4-0',{x:30,z:60},credit);expect(normal.every(d=>canPickUp(d,'player')&&canPickUp(d,'ally')&&!canPickUp(d,'spectator'))).toBe(true);
 const boss=dropGoblinLoot(j,'cavern-7-0',{x:-30,z:90},credit,true);expect(boss.every(d=>canPickUp(d,'player')&&!canPickUp(d,'ally'))).toBe(true);
 expect(pickUpDrop(j,boss[0].id,'ally',boss[0])).toBeNull();expect(pickUpDrop(j,boss[0].id,'player',{x:0,z:0})).toBeNull();
 expect(pickUpDrop(j,boss[0].id,'player',boss[0])).toBeTruthy();expect(canPickUp(boss[0],'player')).toBe(false);
});
it('legacy credited defeats create no replacement orbs; malformed drops cannot be picked up',()=>{
 const j=freshJourney();j.defeated=['cavern-1-0'];j.coins=40;const migrated=validateJourney({...j,drops:undefined});expect(migrated.coins).toBe(40);expect(migrated.drops).toEqual([]);expect(dropGoblinLoot(migrated,'cavern-1-0',{x:0,z:30},{contributors:['player']})).toEqual([]);
 expect(validateJourney({...j,drops:[{id:'bad',item:'cleaver',owners:['player'],x:NaN,z:30}]}).drops).toEqual([]);
});
it('inventory-full pickup preserves the orb and reload preserves collected status',()=>{
 const j=freshJourney();const drops=dropGoblinLoot(j,'cavern-7-0',{x:-30,z:90},{contributors:['player'],lastHit:'player'},true),blade=drops.find(d=>d.item==='cleaver')!;j.items.cleaver=99;
 expect(pickUpDrop(j,blade.id,'player',blade)).toBeNull();expect(canPickUp(blade,'player')).toBe(true);j.items.cleaver=98;pickUpDrop(j,blade.id,'player',blade);expect(canPickUp(validateJourney(j).drops.find(d=>d.id===blade.id)!,'player')).toBe(false);
});
it('unseen goblins patrol and rest without the player entering their room',()=>{
 const {e,j}=setup();const start={x:e.x,z:e.z},activities=new Set();for(let t=0;t<40000;t+=50){updateCavernBehavior(e,{x:0,z:-6},j,t,.05);activities.add(e.mind!.activity);}expect(activities.has('patrol')).toBe(true);expect(activities.has('rest')).toBe(true);expect(activities.has('lookout')).toBe(true);expect(Math.hypot(e.x-start.x,e.z-start.z)).toBeGreaterThan(.1);
});
it('vision respects walls, view direction and closed gates',()=>{
 const {e,j}=setup();expect(seesPlayer(e,{x:30,z:54},j)).toBe(true);expect(seesPlayer(e,{x:30,z:66},j)).toBe(false);expect(seesPlayer(e,{x:22,z:48},j)).toBe(false);const closed=freshJourney();expect(cavernSight({x:0,z:42},{x:0,z:46},closed)).toBe(false);closed.defeated.push('cavern-1-0');expect(cavernSight({x:0,z:42},{x:0,z:46},closed)).toBe(true);
});
it('pursuit crosses room edges, loses interest faster without sight, and walks home',()=>{
 const {e,j}=setup();e.x=0;e.z=38;e.home={x:0,z:30};e.yaw=0;updateCavernBehavior(e,{x:0,z:45},j,0,.05);expect(e.mind!.mode).toBe('pursuit');
 for(let t=50;t<9000;t+=50)updateCavernBehavior(e,{x:0,z:Math.min(60,45+t*.001)},j,t,.05);expect(e.z).toBeGreaterThan(44);
 const before=e.mind!.pursuit;updateCavernBehavior(e,{x:30,z:60},j,9050,1);expect(before-e.mind!.pursuit).toBeGreaterThan(10);
 const lostAt={x:e.x,z:e.z};for(let t=10000;t<22000;t+=50)updateCavernBehavior(e,{x:30,z:60},j,t,.05);expect(e.mind!.mode).toBe('return');expect(e.z).toBeGreaterThan(30);expect(e.z).toBeLessThan(lostAt.z);
});
it('being damaged from behind starts pursuit and records the contributor',()=>{const {s,e}=setup();s.player.x=30;s.player.z=65;s.hitEnemy(e,5,0,'Normal','test');updateCavernBehavior(e,s.player,s.journey,0,.05);expect(e.credit!.contributors).toEqual(['player']);expect(e.mind!.mode).toBe('pursuit');});
