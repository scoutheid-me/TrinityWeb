import {it,expect} from 'vitest';
import {GuideRoutine} from '../src/world/guide';
import {projectToCavern,insideCavern} from '../src/world/cavern';
import {RegionTracker} from '../src/world/regions';
import {freshJourney,validateJourney} from '../src/world/journey';
import {dropGoblinLoot,pickUpDrop} from '../src/world/loot';
import {cavernSight,updateCavernBehavior} from '../src/combat/creatureBehavior';
import {CombatSimulation} from '../src/combat/simulation';
it('walks a continuous level path through the east gate and announces distinct regions',()=>{
 for(let x=0;x<=52;x+=.1)expect(projectToCavern({x,z:160}).x).toBeCloseTo(x);
 expect(insideCavern({x:20,z:168})).toBe(false);
 const r=new RegionTracker();expect(r.update({x:0,z:160})).toBe(9);expect(r.update({x:24,z:160})).toBe(10);expect(r.update({x:21,z:160})).toBeNull();expect(r.update({x:19,z:160})).toBe(9);
});
it('retains field defeats, positions and individually owned animal materials through save validation',()=>{
 const j=freshJourney();j.position={x:52,z:160};j.room=10;j.visited.push(10);
 for(let seed=1;seed<30&&!j.drops.length;seed++){j.lootSeed=seed;j.defeated=[];dropGoblinLoot(j,'field-wolf-0',j.position,{contributors:['player']},false,true,'wolf');}
 expect(j.drops.map(d=>d.item)).toEqual(['wolfPelt']);const migrated=validateJourney(j);expect(migrated.room).toBe(10);expect(migrated.drops).toEqual(j.drops);expect(pickUpDrop(migrated,j.drops[0].id,'player',j.position)).toBeTruthy();expect(validateJourney(migrated).items.wolfPelt).toBe(1);
});
it('wildlife sees and pursues in the meadow but cannot see or walk into town',()=>{
 const s=new CombatSimulation();s.journey=freshJourney();s.spawnEnemy('wolf');const e=s.enemies.at(-1)!;Object.assign(e,{x:27,z:160,yaw:-Math.PI/2,room:10,home:{x:30,z:160}});
 expect(cavernSight(e,{x:20,z:160},s.journey)).toBe(false);expect(cavernSight(e,{x:35,z:160},s.journey)).toBe(true);
 e.credit={contributors:['player'],lastHit:'player'};for(let t=0;t<12000;t+=16)updateCavernBehavior(e,{x:18,z:160},s.journey,t,.016);
 expect(e.x).toBeGreaterThanOrEqual(24);expect(e.mind?.mode).not.toBe('pursuit');
});
it('Mira walks when alone, waves on arrival and waits within conversation distance',()=>{
 const g=new GuideRoutine();for(let i=0;i<100;i++)g.update({x:0,z:0},16);expect(Math.hypot(g.x,g.z-161)).toBeGreaterThan(.5);
 const p={x:g.x,z:g.z-2};expect(g.update(p,16).clip).toBe('wave');const start={x:g.x,z:g.z};for(let i=0;i<210;i++)g.update(p,16);expect(g.update(p,16).clip).toBe('idle');expect({x:g.x,z:g.z}).toEqual(start);
});
