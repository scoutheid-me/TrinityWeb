import {describe,it,expect} from 'vitest';
import {assignBinding,defaultBindings,movementIntent,validateBindings} from '../src/input/bindings';
import {defaultSave,migrateSave} from '../src/save/save';
import {timingPhrase,enemyTimingPhrases} from '../src/audio/timing';
import {CombatSimulation} from '../src/combat/simulation';
import {sentinelPatterns} from '../src/data/enemies';

describe('control profiles',()=>{
 it('flips the old lateral vector while keeping forward movement unchanged',()=>{
  const d=movementIntent(-Math.PI/2,0,1),a=movementIntent(-Math.PI/2,0,-1),w=movementIntent(-Math.PI/2,1,0);
  expect(d.x).toBeCloseTo(-1);expect(a.x).toBeCloseTo(1);expect(w.z).toBeCloseTo(1);
  expect(movementIntent(0,0,1).z).toBeCloseTo(-1);
 });
 it('keeps default profiles independent',()=>{const a=defaultBindings();a.attack[0]='KeyK';expect(defaultBindings().attack[0]).toBe('Mouse0');});
 it('remaps a keyboard or mouse action without mutating the previous profile',()=>{const before=defaultBindings(),result=assignBinding(before,'dodge',0,'Mouse1');expect(result.error).toBeUndefined();expect(result.bindings.dodge[0]).toBe('Mouse1');expect(before.dodge[0]).toBe('Space');});
 it('rejects conflicting primary and alternate inputs',()=>{const before=defaultBindings();expect(assignBinding(before,'dodge',0,'KeyJ').error).toContain('Basic attack');expect(assignBinding(before,'attack',0,'KeyJ').error).toBeTruthy();});
 it('protects Escape and unsupported browser shortcut keys',()=>{expect(assignBinding(defaultBindings(),'dodge',0,'Escape').error).toBeTruthy();expect(assignBinding(defaultBindings(),'dodge',0,'F5').error).toBeTruthy();});
 it('restores defaults for corrupt or duplicate profiles',()=>{const bad=defaultBindings();bad.dodge[0]='KeyQ';expect(validateBindings(bad)).toEqual(defaultBindings());expect(validateBindings({forward:['KeyX',null]})).toEqual(defaultBindings());});
 it('migrates v1 progress and settings without losing them',()=>{const old={...defaultSave(),version:1,settings:{quality:'low',sensitivity:2,sound:false},counters:{kills:4,parries:7,breaks:2,perfects:3,arts:1}};const restored=migrateSave(old);expect(restored.version).toBe(3);expect(restored.counters).toEqual(old.counters);expect(restored.settings.sound).toBe(false);expect(restored.settings.bindings).toEqual(defaultBindings());});
 it('roundtrips custom mappings and the musical cue option',()=>{const save=defaultSave();save.settings.bindings=assignBinding(save.settings.bindings,'parry',0,'Mouse1').bindings;save.settings.timingMusic=false;expect(migrateSave(JSON.parse(JSON.stringify(save)))).toEqual(save);});
});
describe('musical timing and Perfect Parry',()=>{
 it('requires no musical timing for basics',()=>{const s=combatFixture();s.pressAttack();expect(timingPhrase(s)).toBeNull();});
 it('aligns one Art accent to their actual grading deadlines with lead-ins',()=>{const s=combatFixture();s.player.sp=30;s.activateArt(0);const phrase=timingPhrase(s)!;expect(phrase.notes.filter(n=>n.accent).slice(0,3).map(n=>n.at)).toEqual(s.art!.definition.nodes.map(n=>s.art!.start+n.at));expect(phrase.notes.filter(n=>!n.accent).length).toBeGreaterThanOrEqual(2);expect(phrase.notes.every((n,i)=>i===0||n.level!>phrase.notes[i-1].level!)).toBe(true);});
 it('provides no continuing timing phrase after interruption',()=>{const s=combatFixture();s.pressAttack();s.state.set('HitReaction');expect(timingPhrase(s)).toBeNull();});
 it('Perfect Parry negates lethal damage, gains SP, and explains the reward',()=>{const s=combatFixture();s.player.z=0;s.player.yaw=0;s.player.hp=1;s.player.sp=10;s.enemies[0].z=2;s.parry();s.receiveAttack(s.enemies[0],sentinelPatterns[0]);expect(s.player.hp).toBe(1);expect(s.player.sp).toBe(24);expect(s.events.find(e=>e.type==='parry')).toMatchObject({grade:'Perfect',text:'PERFECT COUNTER · +14 SP · COUNTER HIT · NO DAMAGE'});});
 it('caps the Perfect Parry reward without allowing damage through',()=>{const s=combatFixture();s.player.z=0;s.player.sp=99;s.parry();s.receiveAttack(s.enemies[0],sentinelPatterns[0]);expect(s.player.sp).toBe(100);expect(s.player.hp).toBe(s.hpMax);});
});


describe('new combat loop',()=>{
 it('commits one low-damage basic without release, grade, or hold reward',()=>{
 const s=combatFixture();s.flags.freezeAI=true;s.player.z=0;s.enemies[0].z=2;s.pressAttack();
 for(let i=0;i<20;i++)s.update(100);
 expect(s.enemies[0].hp).toBe(450);expect(s.player.sp).toBe(10);expect(s.events.some(e=>e.type==='grade')).toBe(false);
 s.releaseAttack();s.update(100);expect(s.player.sp).toBe(10);
 });
 it('cues both enemy cuts before impact and cancels on freeze or break',()=>{
 const s=combatFixture(),e=s.enemies[0];e.pattern=sentinelPatterns[1];e.attackStart=100;
 expect(enemyTimingPhrases(s)[0].notes.filter(n=>n.accent).map(n=>n.at)).toEqual([920,1520]);
 s.flags.freezeAI=true;expect(enemyTimingPhrases(s)).toEqual([]);s.flags.freezeAI=false;s.applyBreak(e,100);expect(enemyTimingPhrases(s)).toEqual([]);
 });
});


it('gives basic defense a musical counter phrase and gives player Arts audio priority',()=>{const s=combatFixture(),e=s.enemies[0];e.pattern=sentinelPatterns[0];expect(enemyTimingPhrases(s)[0].notes).toHaveLength(5);e.pattern=sentinelPatterns[1];expect(enemyTimingPhrases(s)).toHaveLength(1);s.player.sp=30;s.activateArt(0);expect(enemyTimingPhrases(s)).toEqual([]);expect(timingPhrase(s)!.notes.filter(n=>n.accent)).toHaveLength(1);});

function combatFixture(){const sim=new CombatSimulation();sim.spawnEnemy();return sim;}
