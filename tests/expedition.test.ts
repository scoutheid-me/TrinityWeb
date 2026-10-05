import {emptyLoot,creatureEquipment} from '../src/data/creatureLoot';
import {expect,it} from 'vitest';
import {defaultSave,restartedAdventure,migrateSave} from '../src/save/save';
import {freshJourney,validateJourney} from '../src/world/journey';
import {claimGoblinLoot,goblinLoot,creatureLoot} from '../src/world/loot';
import {cavernLinks,patrols,cavernAreas} from '../src/world/cavern';
import {CombatSimulation} from '../src/combat/simulation';
it('resets the adventure without resetting controls or mutating the old save',()=>{
 const old=defaultSave();old.profile.created=true;old.profile.name='Old hero';old.journey.coins=900;old.journey.items.dagger=2;old.settings.bindings.interact=['KeyH',null];
 const next=restartedAdventure(old);expect(next.profile.created).toBe(false);expect(next.journey.coins).toBe(0);expect(next.journey.items.dagger).toBe(0);expect(next.settings.bindings.interact[0]).toBe('KeyH');expect(old.profile.created).toBe(true);next.settings.sensitivity=2;expect(old.settings.sensitivity).toBe(1);
});
it('goblin loot persists once, rejects debug claims and cannot reroll after reload',()=>{
 const j=freshJourney();j.lootSeed=123;const expected=goblinLoot(123,'cavern-1-0');const drop=claimGoblinLoot(j,'cavern-1-0');expect(drop).toEqual(expected);const saved=validateJourney(j);expect(claimGoblinLoot(saved,'cavern-1-0')).toBeNull();expect(saved.coins).toBe(expected.coins);expect(claimGoblinLoot(j,'cavern-4-0',false,false)).toBeNull();
 const boss=claimGoblinLoot(j,'cavern-7-0',true)!;expect(boss.items.cleaver).toBe(1);expect(boss.items.token).toBe(1);expect(j.items.cleaver).toBeGreaterThan(0);
});
it('every ordinary goblin drops carried cleavers and equipment materials, never unrelated hide or daggers',()=>{
 for(const id of ['cavern-1-0','cavern-2-0','cavern-4-0','cavern-4-1','cavern-6-0']){const rolls=Array.from({length:200},(_,seed)=>goblinLoot(seed,id));expect(rolls.some(r=>r.items[creatureEquipment.goblin.weapon]>0)).toBe(true);expect(rolls.some(r=>r.items.scrapIron>0)).toBe(true);expect(rolls.every(r=>r.coins>0&&r.items.hide===0&&r.items.dagger===0)).toBe(true);}
});
it('keeps a linear spine with optional branches and single sentry/captain encounters',()=>{
 const route=[0,1,5,6,7,8,9];for(let i=1;i<route.length;i++)expect(cavernLinks.some(([a,b])=>a===route[i-1]&&b===route[i])).toBe(true);
 expect(patrols.find(p=>p.area===1)?.count).toBe(1);expect(patrols.find(p=>p.area===7)?.count).toBe(1);expect(patrols.some(p=>Number(p.area)===5)).toBe(false);
 expect(cavernLinks.filter(([a,b])=>Number(a)===3||Number(b)===3)).toHaveLength(1);expect(cavernLinks.filter(([a,b])=>Number(a)===2||Number(b)===2)).toHaveLength(1);
});
it('leashes earlier goblins away from the solo captain chamber',()=>{
 const s=new CombatSimulation();s.journey=freshJourney();s.spawnEnemy('goblin');const e=s.enemies[0],home=cavernAreas[6];e.room=6;e.home={x:home.x,z:home.z};e.x=-30;e.z=88;s.player.x=-30;s.player.z=90;s.update(20);expect(e.state).toBe('Idle');expect(e.pattern).toBeNull();expect(e.z).toBe(60);
});
it('migrates loot fields safely and retains an earned dagger weapon',()=>{
 const save=defaultSave();save.journey.items.dagger=1;save.weapon='dagger';expect(migrateSave(save).weapon).toBe('dagger');const j=validateJourney({...save.journey,items:{dagger:-1,token:Infinity}});expect(j.items).toEqual(emptyLoot());
});
it('opens the first main-route gate only after the lone sentry defeat',()=>{
 const s=new CombatSimulation();s.journey=freshJourney();s.player.x=0;s.player.z=42.9;s.input={x:0,z:1,sprint:false,guard:false};s.update(100);expect(s.player.z).toBeLessThanOrEqual(43);
 s.journey.defeated.push('cavern-1-0');s.update(100);expect(s.player.z).toBeGreaterThan(43);
});

it('reserves biological hide for hide-bearing creatures and gives them no manufactured weapons',()=>{const rolls=Array.from({length:100},(_,seed)=>creatureLoot(seed,'wild-boar','boar'));expect(rolls.some(r=>r.items.hide>0)).toBe(true);expect(rolls.every(r=>r.items.cleaver===0&&r.items.scrapIron===0&&r.coins===0)).toBe(true);});
