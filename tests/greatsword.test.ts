import {it,expect} from 'vitest';
import {CombatSimulation} from '../src/combat/simulation';
import {containsHit} from '../src/combat/geometry';
import {weapons} from '../src/data/weapons';
import {greatswordPose} from '../src/engine/greatswordMotion';
it('lands one stronger untimed greatsword hit and earns normal basic SP',()=>{
 const s=new CombatSimulation();s.weapon='greatsword';s.spawnEnemy();s.flags.freezeAI=true;
 s.player.x=0;s.player.z=0;s.player.yaw=0;const e=s.enemies[0];e.x=0;e.z=2;s.lockedId=e.id;const hp=e.hp;
 s.pressAttack();for(let i=0;i<35;i++)s.update(10);expect(e.hp).toBe(hp);
 for(let i=0;i<90;i++)s.update(10);expect(hp-e.hp).toBe(15);expect(s.player.sp).toBe(10);
});
it('heavy cleave covers the front fan but excludes rear targets',()=>{
 const shape=weapons.greatsword.shape,origin={x:0,z:0};
 expect(containsHit(shape,origin,0,{x:.3,z:2.0})).toBe(true);
 expect(containsHit(shape,origin,0,{x:1,z:2})).toBe(true);
 expect(containsHit(shape,origin,0,{x:0,z:-1})).toBe(false);
});
it('winds overhead, swings downward through contact, then recovers without a pose jump',()=>{
 const windup=greatswordPose(280,0,420),contact=greatswordPose(420,0,420),follow=greatswordPose(560,0,420);
 expect(windup.pitch).toBeLessThan(-2);expect(windup.lift).toBeGreaterThan(.3);
 expect(contact.pitch).toBe(0);expect(follow.pitch).toBeGreaterThan(.8);
 expect(Math.abs(greatswordPose(419.999,0,420).pitch-contact.pitch)).toBeLessThan(.001);
 expect(greatswordPose(1080,0,420).pitch).toBeCloseTo(-.95);
});
