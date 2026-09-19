import {describe,it,expect} from 'vitest';
import {CombatSimulation} from '../src/combat/simulation';
import {StateMachine,HitRegistry,equipArts,gainSp,spendSp,timingGrade,inHitVolume} from '../src/combat/rules';
import {balance,chargeTime} from '../src/data/balance';
import {sentinelPatterns} from '../src/data/enemies';
import {defaultSave,migrateSave} from '../src/save/save';
const advance=(sim:CombatSimulation,ms:number)=>{for(let t=0;t<ms;t+=10)sim.update(Math.min(10,ms-t));};
function encounter(){const s=new CombatSimulation();s.flags.freezeAI=true;s.player.z=0;s.enemies[0].z=2;return s;}
function basic(s:CombatSimulation,offset=0){s.pressAttack();advance(s,chargeTime(s.attributes.dexterity)+offset);s.releaseAttack();advance(s,400);}
describe('resources and timing',()=>{
 it('generates fixed SP on actual hits and caps at 100',()=>{const s=encounter();basic(s);expect(s.player.sp).toBe(10);s.player.sp=96;basic(s);expect(s.player.sp).toBe(100);expect(gainSp(95,16)).toBe(100);});
 it('does not award SP on a whiff or duplicate hit',()=>{const s=encounter();s.enemies[0].z=10;basic(s);expect(s.player.sp).toBe(0);s.enemies[0].z=2;s.attackSerial++;expect(s.hitEnemy(s.enemies[0],1,0,'Normal','one')).toBe(true);expect(s.hitEnemy(s.enemies[0],1,0,'Normal','one')).toBe(false);});
 it('spends SP atomically and rejects insufficient SP',()=>{expect(spendSp(29,30)).toBeNull();expect(spendSp(30,30)).toBe(0);const s=encounter();s.player.sp=29;expect(s.activateArt(0)).toBe(false);expect(s.player.sp).toBe(29);expect(s.state.state).toBe('Idle');s.player.sp=30;expect(s.activateArt(0)).toBe(true);expect(s.player.sp).toBe(0);});
 it('enforces exactly four unique slots and safe empty activation',()=>{expect(()=>equipArts([null])).toThrow();expect(()=>equipArts(['x','x',null,null])).toThrow();const s=encounter();expect(s.activateArt(1)).toBe(false);expect(s.loadout).toHaveLength(4);});
 it.each([[-55,'Perfect'],[55,'Perfect'],[56,'Good'],[-120,'Good'],[121,'Normal']])('grades basic offset %i ms as %s',(ms,grade)=>expect(timingGrade(Number(ms))).toBe(grade));
 it('grades late Art inputs as Miss',()=>expect(timingGrade(121,true)).toBe('Miss'));
 it('clamps extreme Dexterity without changing timing windows',()=>{expect(chargeTime(-999)).toBe(100);expect(chargeTime(999999)).toBe(60);expect(chargeTime(20)).toBeLessThan(chargeTime(10));});
});
describe('state and defense',()=>{
 it('rejects attack/dodge overlap and dead actions',()=>{const state=new StateMachine();expect(state.set('ArtStartup')).toBe(true);expect(state.set('Dodge')).toBe(false);expect(state.set('BasicAttackStartup')).toBe(false);expect(state.set('ArtSequence')).toBe(true);expect(state.set('ArtRecovery')).toBe(true);expect(state.set('Idle')).toBe(true);state.set('Dead');expect(state.set('Idle')).toBe(false);state.reset();expect(state.state).toBe('Idle');});
 it('parries within window, grants SP and Break, and permits next parry',()=>{const s=encounter();s.parry();advance(s,80);const hp=s.player.hp;s.receiveAttack(s.enemies[0],sentinelPatterns[0]);expect(s.player.hp).toBe(hp);expect(s.player.sp).toBe(14);expect(s.enemies[0].break).toBe(32);expect(s.counters.parries).toBe(1);expect(s.parry()).toBe(true);});
 it('late parry fails and red attacks cannot be parried',()=>{const s=encounter();s.parry();advance(s,200);s.receiveAttack(s.enemies[0],sentinelPatterns[0]);expect(s.player.hp).toBe(s.hpMax-24);s.state.reset();s.parry();s.receiveAttack(s.enemies[0],sentinelPatterns[2]);expect(s.player.hp).toBe(s.hpMax-60);});
 it('dodge consumes stamina, moves and avoids hits only inside iframes',()=>{const s=encounter();s.input.x=1;expect(s.dodge()).toBe(true);expect(s.player.stamina).toBe(76);advance(s,100);expect(s.player.x).toBeGreaterThan(.8);s.receiveAttack(s.enemies[0],sentinelPatterns[0]);expect(s.player.hp).toBe(s.hpMax);advance(s,260);s.receiveAttack(s.enemies[0],sentinelPatterns[0]);expect(s.player.hp).toBeLessThan(s.hpMax);});
 it('cannot dodge without stamina and guard reduces damage',()=>{const s=encounter();s.player.stamina=0;expect(s.dodge()).toBe(false);s.player.stamina=100;s.input.guard=true;s.update(10);s.receiveAttack(s.enemies[0],sentinelPatterns[0]);expect(s.player.hp).toBeCloseTo(s.hpMax-24*.2);expect(s.player.stamina).toBe(76);});
});
describe('encounter',()=>{
 it('accumulates Break, staggers and resets after vulnerability',()=>{const s=encounter(),e=s.enemies[0];s.applyBreak(e,60);expect(e.state).not.toBe('Broken');s.applyBreak(e,40);expect(e.state).toBe('Broken');s.hitEnemy(e,10,0,'Normal','a');expect(e.hp).toBe(e.maxHp-16);s.flags.freezeAI=false;advance(s,balance.enemy.stagger+20);expect(e.state).toBe('Recovery');expect(e.break).toBe(0);});
 it('timed Art has three inputs and stronger perfect outcome',()=>{
  const run=(perfect:boolean)=>{const s=encounter();s.player.sp=100;s.activateArt(0);const art=s.art!;if(perfect)for(const node of art.definition.nodes){advance(s,node.at-(s.now-art.start));s.artInput();}advance(s,2800-(s.now-art.start));return s;};
  const p=run(true),m=run(false);expect(p.enemies[0].hp).toBeLessThan(m.enemies[0].hp);expect(p.counters.perfects).toBe(3);expect(p.player.sp).toBe(70);expect(p.state.state).toBe('Idle');
 });
 it('handles enemy death once, player death, and reset',()=>{const s=encounter();s.hitEnemy(s.enemies[0],999,0,'Perfect','kill');s.hitEnemy(s.enemies[0],999,0,'Perfect','again');expect(s.counters.kills).toBe(1);expect(s.enemies[0].state).toBe('Dead');s.player.hp=1;s.receiveAttack(s.enemies[0],sentinelPatterns[0]);expect(s.state.state).toBe('Dead');expect(s.player.hp).toBe(0);s.reset();expect(s.state.state).toBe('Idle');expect(s.enemies[0].hp).toBe(460);expect(s.player.hp).toBe(s.hpMax);});
 it('enemy approaches, telegraphs and damages the player',()=>{const s=new CombatSimulation();advance(s,7000);expect(s.player.hp).toBeLessThan(s.hpMax);expect(s.enemies[0].nextPattern).toBeGreaterThan(0);});
 it('volume rejects enemies behind the player or outside range',()=>{expect(inHitVolume(0,0,0,0,-2,3,1.4)).toBe(false);expect(inHitVolume(0,0,0,0,4,3,1.4)).toBe(false);expect(inHitVolume(0,0,0,1,2,3,1.4)).toBe(true);const hits=new HitRegistry();expect(hits.accept('a','e')).toBe(true);expect(hits.accept('a','e')).toBe(false);expect(hits.accept('b','e')).toBe(true);});
 it('bounded updates prevent focus-loss catchup',()=>{const s=encounter();s.update(10000);expect(s.now).toBeCloseTo(100);});
});
describe('versioned saves',()=>{
 it('serializes and restores valid settings, loadouts and event counters',()=>{const save=defaultSave();save.counters.parries=9;save.attributes.dexterity=42;save.settings.quality='low';expect(migrateSave(JSON.parse(JSON.stringify(save)))).toEqual(save);});
 it('recovers corrupt, future-version and illegal loadout data',()=>{expect(migrateSave(null)).toEqual(defaultSave());expect(migrateSave({version:50})).toEqual(defaultSave());expect(migrateSave({...defaultSave(),loadout:['bad']})).toEqual(defaultSave());});
});


describe('recovery input buffer',()=>{
 it('accepts one late input without allowing action overlap or a chain',()=>{
 const s=encounter();s.pressAttack();advance(s,400);expect(s.state.state).toBe('BasicAttackRecovery');
 s.pressAttack();s.pressAttack();expect(s.state.state).toBe('BasicAttackRecovery');advance(s,700);
 expect(s.player.sp).toBe(20);expect(s.state.state).toBe('Idle');
 });
 it('clears a queued action on interruption and reset',()=>{
 const s=encounter();s.pressAttack();advance(s,400);s.dodge();expect(s.buffered).not.toBeNull();
 s.receiveAttack(s.enemies[0],sentinelPatterns[0]);expect(s.buffered).toBeNull();s.reset();expect(s.buffered).toBeNull();
 });
});
