import {it,expect} from 'vitest';
import {CombatSimulation} from '../src/combat/simulation';
import {angleDelta,rearMultiplier,turnToward} from '../src/combat/facing';
import {sentinelPatterns} from '../src/data/enemies';
import {chargeDuration} from '../src/data/arts';
import {enemyTimingPhrases} from '../src/audio/timing';
const tick=(s:CombatSimulation,ms:number)=>{for(let t=0;t<ms;t+=10)s.update(Math.min(10,ms-t));};
it('T unlocks a sole target, reacquires it, and cycles between live nearby targets',()=>{
 const s=new CombatSimulation();s.spawnEnemy();s.toggleLock(true);expect(s.target).toBe(s.enemies[0]);s.toggleLock(true);expect(s.target).toBeFalsy();
 s.input.x=1;tick(s,200);expect(s.player.yaw).toBeGreaterThan(1);s.toggleLock(true);s.spawnEnemy();s.toggleLock(true);expect(s.target).toBe(s.enemies[1]);s.enemies[0].z=100;s.toggleLock(true);expect(s.target).toBeFalsy();
});
it('turns on the shortest arc with bounded speed, including across the wrap',()=>{
 expect(angleDelta(3.1,turnToward(3.1,-3.1,.01))).toBeCloseTo(.01);
 for(const species of ['sentinel','boar'] as const){const s=new CombatSimulation();s.spawnEnemy(species);const e=s.enemies[0];e.until=0;e.x=0;e.z=0;e.yaw=0;s.player.z=-2;tick(s,100);expect(Math.abs(e.yaw)).toBeLessThan(.23);expect(e.pattern).toBeNull();expect(e.z).toBe(0);tick(s,2000);expect(e.pattern).not.toBeNull();}
});
it('rewards rear contact on basics and Arts, not side/front contact, and deduplicates hits',()=>{
 for(const phase of ['basic','art-0']){const s=new CombatSimulation();s.spawnEnemy();const e=s.enemies[0];e.x=e.z=e.yaw=0;s.player.z=-2;
 expect(rearMultiplier(e,s.player)).toBe(1.2);s.hitEnemy(e,20,2,'Perfect',phase);expect(e.maxHp-e.hp).toBe(24);expect(s.events.at(-1)?.weakPoint).toBe(true);s.hitEnemy(e,20,2,'Perfect',phase);expect(e.maxHp-e.hp).toBe(24);
 expect(rearMultiplier(e,{x:2,z:0})).toBe(1);expect(rearMultiplier(e,{x:0,z:2})).toBe(1);expect(rearMultiplier(e,e)).toBe(1);}
});
it('Perfect Linear passes a committed cleave which misses, leaving a rear attack opening',()=>{
 const s=new CombatSimulation();s.spawnEnemy();const e=s.enemies[0];s.player.z=0;e.x=0;e.z=2;e.yaw=Math.PI;e.until=0;
 s.progression.learned.linear='tutorial';s.loadout=['linear',null,null,null];s.player.sp=100;s.lockedId=e.id;s.activateArt(0);
 tick(s,chargeDuration(s.art!.definition,0));e.pattern=sentinelPatterns[0];e.attackStart=s.now-600;e.hits.clear();e.state='Telegraph';const hp=s.player.hp;
 s.releaseArt(0);tick(s,450);expect(s.player.z).toBeGreaterThan(e.z);expect(s.player.hp).toBe(hp);expect(e.yaw).toBeCloseTo(Math.PI);expect(rearMultiplier(e,s.player)).toBe(1.2);
 tick(s,900);expect(e.state).toBe('Recovery');expect(e.yaw).toBeCloseTo(Math.PI);
});
it('enemy crescendo ends on the defensive timing cue and yields to an Art phrase',()=>{
 const s=new CombatSimulation();s.spawnEnemy();s.player.z=0;const e=s.enemies[0];e.z=2;e.pattern=sentinelPatterns[1];e.attackStart=s.now;e.state='Telegraph';
 const notes=enemyTimingPhrases(s)[0].notes;expect(notes).toHaveLength(10);expect(notes.at(-1)?.at).toBe(e.attackStart+1500-80);expect(notes.slice(0,5).every((n,i)=>i===0||n.level!>notes[i-1].level!)).toBe(true);
 s.player.sp=100;s.activateArt(0);expect(enemyTimingPhrases(s)).toEqual([]);
});
