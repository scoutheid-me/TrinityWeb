import {describe,it,expect} from 'vitest';
import {CombatSimulation} from '../src/combat/simulation';
import {EncounterLedger} from '../src/combat/encounter';
import {awardChallenge,freshProgression,validLoadout,validateProgression} from '../src/progression/guild';
import {defaultSave,migrateSave} from '../src/save/save';
import {sentinelPatterns} from '../src/data/enemies';
function tick(s:CombatSimulation,ms:number){for(let n=0;n<ms;n+=10)s.update(Math.min(10,ms-n));}
function close(s:CombatSimulation){s.player.x=0;s.player.z=0;s.player.yaw=0;s.enemies[0].x=0;s.enemies[0].z=2;}
describe('Guild progression',()=>{
 it('deduplicates phases per target and never records outside a challenge',()=>{const l=new EncounterLedger();const o={kind:'basic-hit' as const,actor:'player',target:'a',attackId:1,phase:'basic',at:1,amount:5};l.record(o);expect(l.stats.basicHits).toBe(0);l.start('positioning');l.record(o);l.record(o);expect(l.stats.basicHits).toBe(1);l.record({...o,target:'b'});expect(l.stats.basicHits).toBe(2);l.end('abandoned');l.record({...o,attackId:2});expect(l.stats.basicHits).toBe(2);});
 it('earns Footwork through real basics and a timed dodge, then preserves its reward',()=>{const s=new CombatSimulation();s.beginChallenge('positioning');close(s);for(let i=0;i<3;i++){s.pressAttack();tick(s,500);}tick(s,530);s.dodge();tick(s,200);expect(s.encounter.result).toBe('completed');expect(s.progression.learned['aether-step']).toBe('positioning');expect(s.encounter.stats.damageTaken).toBe(0);const data={...defaultSave(),progression:s.progression,loadout:['focused-strike','aether-step',null,null]};expect(migrateSave(JSON.parse(JSON.stringify(data))).loadout).toEqual(data.loadout);});
 it('practice modifiers and resets cannot grant rewards',()=>{const s=new CombatSimulation();s.beginChallenge('positioning');s.flags.invulnerable=true;s.update(1);for(let i=0;i<3;i++)s.encounter.record({kind:'basic-hit',actor:'player',target:'a',attackId:i,phase:'basic',at:i,amount:5});s.encounter.record({kind:'evade',actor:'player',target:'a',attackId:4,phase:'0',at:4,amount:0});s.update(1);expect(s.encounter.result).toBe('completed');expect(s.progression.completed).toEqual([]);s.beginChallenge('positioning');s.reset();expect(s.encounter.result).toBe('abandoned');expect(s.progression.completed).toEqual([]);});
 it('awards each unlock and mastery source once, validates ownership and prerequisites',()=>{const p=freshProgression();awardChallenge(p,'positioning',true);awardChallenge(p,'positioning',true);awardChallenge(p,'breaking',true);expect(p.masterySources).toHaveLength(2);expect(p.completed).toHaveLength(2);expect(validLoadout(['focused-strike','aether-step','resonant-cleave',null],p,'sword')).toBe(true);expect(validLoadout(['crescent-break','stillwater-return',null,null],p,'sword')).toBe(false);expect(validLoadout(['aether-step','aether-step',null,null],p,'sword')).toBe(false);expect(validLoadout(['aether-step',null,null,null],p,'axe')).toBe(false);expect(validateProgression({completed:['trial'],learned:{'stillwater-return':'fake'}})).toEqual(freshProgression());});
 it('migrates v2 settings without inventing unlocks',()=>{const old={...defaultSave(),version:2};old.settings.sound=false;old.settings.bindings.parry=['KeyP',null];const result=migrateSave(old);expect(result.version).toBe(3);expect(result.settings).toEqual(old.settings);expect(result.progression).toEqual(freshProgression());});
 it('keeps Stillwater a simple learned cut with no counter prerequisite',()=>{const s=new CombatSimulation();for(const id of ['positioning','breaking','countering'] as const)awardChallenge(s.progression,id,false);s.loadout=['stillwater-return',null,null,null];s.player.sp=50;expect(s.activateArt(0)).toBe(true);expect(s.player.sp).toBe(32);expect(s.art!.definition.nodes).toHaveLength(1);});
 it('executes mastery policies without mutating shared Art definitions',()=>{const s=new CombatSimulation();s.progression.learned['crescent-break']='legacy';s.loadout=['crescent-break',null,null,null];s.player.sp=100;s.progression.masteryChoice='break';s.activateArt(0);expect(s.art!.definition.nodes[0].break).toBe(54);expect(s.art!.definition.recovery).toBe(460);s.reset();s.player.sp=100;s.progression.masteryChoice='recovery';s.activateArt(0);expect(s.art!.definition.nodes[0].break).toBe(40);expect(s.art!.definition.recovery).toBe(200);});
 it('coordinates two enemies and separates their bodies',()=>{const s=new CombatSimulation();for(const id of ['positioning','breaking','countering'] as const)awardChallenge(s.progression,id,false);s.beginChallenge('trial');s.player.z=0;for(const e of s.enemies){e.x=0;e.z=2;e.until=0;}tick(s,500);expect(s.enemies.filter(e=>e.pattern)).toHaveLength(1);expect(Math.hypot(s.enemies[0].x-s.enemies[1].x,s.enemies[0].z-s.enemies[1].z)).toBeGreaterThan(1.2);});
 it('does not reward empty Art swings or distant dodges',()=>{const s=new CombatSimulation();s.beginChallenge('positioning');s.player.sp=100;s.activateArt(0);tick(s,620);s.releaseArt(0);tick(s,600);expect(s.encounter.stats.artHits).toBe(0);expect(s.encounter.stats.crescentHit).toBe(false);});
});

it('completes the authored progression with live AI and action rules',()=>{
 const s=new CombatSimulation();
 for(const id of ['positioning','breaking','countering','trial'] as const){
  expect(s.beginChallenge(id)).toBe(true);
  for(let elapsed=0;elapsed<180000&&s.encounter.active;elapsed+=10){
   const target=s.enemies.filter(e=>e.hp>0).sort((a,b)=>Math.hypot(a.x-s.player.x,a.z-s.player.z)-Math.hypot(b.x-s.player.x,b.z-s.player.z))[0];
   if(target){s.lockedId=target.id;s.faceTarget();}
   const threat=s.enemies.find(e=>e.pattern);
   const remaining=threat?.pattern?.hits.filter((_,i)=>!threat.hits.has(i)).map(at=>at+threat.attackStart-s.now)[0]??Infinity;
   if(s.art&&s.art.grades[0]===null&&Math.abs(s.now-s.art.start-s.art.definition.nodes[0].at)<15)s.releaseArt(0);
   if(s.free&&target){
    const d=Math.hypot(target.x-s.player.x,target.z-s.player.z);
    s.input.x=d>2?target.x-s.player.x:0;s.input.z=d>2?target.z-s.player.z:0;
    if(remaining<140){s.input.x=0;s.input.z=0;if(id==='positioning'||!threat!.pattern!.parryable)s.dodge();else{s.lockedId=threat!.id;s.parry();}}
    else if(remaining>1100&&d<2.3){
     if(s.player.sp>=30&&(id!=='countering'||s.encounter.stats.parries<2))s.activateArt(0);
     else if(id!=='countering'||s.encounter.stats.parries<2)s.pressAttack();
    }
   }
   s.update(10);
  }
  expect(s.encounter.result,`${id}: ${JSON.stringify(s.encounter.stats)}`).toBe('completed');
  expect(s.progression.completed).toContain(id);
 }
 expect(Object.keys(s.progression.learned)).toEqual(expect.arrayContaining(['focused-strike','aether-step','resonant-cleave','stillwater-return','wayfarer-oath']));
 expect(s.progression.masterySources).toEqual([]); // Focused Strike does not earn Crescent mastery.
});

it('awards the paired Art on trial completion and migrates prior trial saves',()=>{const p=freshProgression();for(const id of ['positioning','breaking','countering','trial'] as const)awardChallenge(p,id,false);expect(p.learned['wayfarer-oath']).toBe('trial');delete p.learned['wayfarer-oath'];expect(validateProgression(p).learned['wayfarer-oath']).toBe('trial');});
it('executes two separate hold/release events and ends the chain on a miss',()=>{
 const run=(second:boolean)=>{const s=new CombatSimulation();for(const id of ['positioning','breaking','countering','trial'] as const)awardChallenge(s.progression,id,false);s.loadout=['wayfarer-oath',null,null,null];s.flags.freezeAI=true;close(s);s.player.sp=100;s.activateArt(0);tick(s,620);s.releaseArt(0);tick(s,230);expect(s.art!.awaitingHold).toBe(true);expect(s.art!.resolved.size).toBe(1);s.activateArt(0);tick(s,second?800:100);s.releaseArt(0);tick(s,1000);return s;};
 const perfect=run(true),miss=run(false);expect(perfect.events.filter(e=>e.type==='slash')).toHaveLength(2);expect(miss.events.filter(e=>e.type==='slash')).toHaveLength(1);expect(perfect.player.sp).toBe(60);expect(miss.player.sp).toBe(60);expect(perfect.enemies[0].hp).toBeLessThan(miss.enemies[0].hp);
});

it('does not create a free second strike or refund after an expired paired follow-up',()=>{const s=new CombatSimulation();for(const id of ['positioning','breaking','countering','trial'] as const)awardChallenge(s.progression,id,false);s.loadout=['wayfarer-oath',null,null,null];s.flags.freezeAI=true;close(s);s.player.sp=100;s.activateArt(0);tick(s,620);s.releaseArt(0);tick(s,250);s.cancelArtCharge();expect(s.player.sp).toBe(60);expect(s.art).toBeNull();s.state.reset();s.player.sp=100;s.activateArt(0);tick(s,620);s.releaseArt(0);tick(s,2600);expect(s.state.state).toBe('Idle');expect(s.player.sp).toBe(60);expect(s.events.filter(e=>e.type==='slash')).toHaveLength(2);});
