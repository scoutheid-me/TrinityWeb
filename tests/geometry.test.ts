import {describe,it,expect} from 'vitest';
import {containsHit,hitOutline,type HitShape} from '../src/combat/geometry';
import {sentinelPatterns} from '../src/data/enemies';
import {CombatSimulation} from '../src/combat/simulation';
import {enemyPhase,imminentThreat} from '../src/combat/timeline';
import {duelPose} from '../src/engine/duelMotion';

describe('attack footprints',()=>{
 const origin={x:0,z:0};
 it('cleave is a forward lane, excluding lateral and rear targets',()=>{
  const shape=sentinelPatterns[0].shape;
  expect(containsHit(shape,origin,0,{x:.47,z:2.5})).toBe(true);
  expect(containsHit(shape,origin,0,{x:.5,z:2})).toBe(false);
  expect(containsHit(shape,origin,0,{x:0,z:2.61})).toBe(false);
  expect(containsHit(shape,origin,0,{x:0,z:-.1})).toBe(false);
  expect(containsHit(shape,{x:3,z:5},Math.PI/2,{x:5,z:5.47})).toBe(true);
 });
 it('sector excludes its rear while the sweep actually covers a full disk',()=>{
  expect(containsHit(sentinelPatterns[1].shape,origin,0,{x:0,z:-2})).toBe(false);
  expect(containsHit(sentinelPatterns[2].shape,origin,1,{x:0,z:-3.39})).toBe(true);
  expect(containsHit(sentinelPatterns[2].shape,origin,1,{x:0,z:-3.41})).toBe(false);
 });
 it.each(sentinelPatterns)('$name outline stays on its gameplay footprint',pattern=>{
  const outline=hitOutline(pattern.shape);expect(outline.length).toBeGreaterThanOrEqual(4);
  for(const p of outline)expect(containsHit(pattern.shape,origin,0,{x:p.x*.999999,z:p.z*.999999})).toBe(true);
 });
 it('the live simulation uses the lane instead of its old radial reach',()=>{
  for(const [x,damage] of [[.3,24],[.8,0]]){const s=new CombatSimulation(),e=s.enemies[0];e.x=0;e.z=0;e.yaw=0;e.pattern=sentinelPatterns[0];e.attackStart=-1000;s.player.x=x;s.player.z=2;s.update(10);expect(s.player.hp).toBe(s.hpMax-damage);}
 });
});
describe('contact timeline and authored motion',()=>{
 it('selects the second contact independently and clears after the last',()=>{
  const s=new CombatSimulation(),e=s.enemies[0];e.pattern=sentinelPatterns[1];e.attackStart=100;
  expect(enemyPhase(e,900)!.contactAt).toBe(1000);expect(enemyPhase(e,1200)!.contactAt).toBe(1600);expect(enemyPhase(e,1800)).toBeNull();
 });
 it('selects imminent skill consistently rather than nearest enemy',()=>{
  const s=new CombatSimulation();s.spawnEnemy();const [a,b]=s.enemies;a.pattern=sentinelPatterns[2];b.pattern=sentinelPatterns[1];a.attackStart=b.attackStart=0;a.z=1;b.z=8;
  expect(imminentThreat(s,true)!.enemy.id).toBe(b.id);
 });
 it('hits the authored contact pose regardless of anticipation length or frame rate',()=>{
  for(const contact of [100,620,1000,1400]){const pose=duelPose('cleave',contact,0,contact);expect(pose.pitch).toBeCloseTo(.55,5);expect(pose.yaw).toBe(0);}
  const before=duelPose('refrain',700,0,900);expect(before.yaw).toBeLessThan(0);expect(duelPose('refrain',700,0,900,-1).yaw).toBeGreaterThan(0);
 });
});
