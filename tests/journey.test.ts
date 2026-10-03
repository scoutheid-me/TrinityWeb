import {it,expect} from 'vitest';
import {freshJourney,validateJourney,claimChest,buyPotion,choosePrimer,journalArts,primers,primerArts,canLearnLeaf} from '../src/world/journey';
import {defaultSave,migrateSave} from '../src/save/save';
import {CombatSimulation} from '../src/combat/simulation';
import {goblinPatterns,captainPatterns} from '../src/data/enemies';
it('treasure, purchases and book choices are one-time bounded transactions',()=>{
 const j=freshJourney();expect(claimChest(j,'chest-0',40)).toBe(true);expect(claimChest(j,'chest-0',40)).toBe(false);expect(j.coins).toBe(40);expect(buyPotion(j)).toBe(true);expect(buyPotion(j)).toBe(true);expect(buyPotion(j)).toBe(false);expect(j.coins).toBe(0);expect(choosePrimer(j,'pathfinder')).toBe(false);j.facts.push('boss');j.quest='completed';expect(choosePrimer(j,'pathfinder')).toBe(true);expect(choosePrimer(j,'renewal')).toBe(false);expect(journalArts(j)).toEqual(['trail-step']);
});
it.each(primers)('$name grants only its root and persists a legitimately earned branch',book=>{
 const s=defaultSave();s.journey.cleared=[0,1,2,3,4,5,6,7,8];s.journey.room=9;s.journey.facts=['joined','boss'];s.journey.quest='completed';s.journey.defeated=['cavern-7-0'];choosePrimer(s.journey,book.id);
 let saved=migrateSave(s);expect(saved.progression.learned[book.root]).toBe('skill book');expect(saved.progression.learned[book.leaf]).toBeUndefined();expect(canLearnLeaf(s.journey)).toBe(false);
 s.journey.practice={hits:12,evades:2,parries:2,breaks:2};s.journey.leafLearned=true;s.loadout=[book.root,book.leaf,null,null];saved=migrateSave(s);expect(saved.loadout).toEqual(s.loadout);expect(saved.progression.learned[book.leaf]).toBe('skill book');
 for(const id of [book.root,book.leaf]){expect(primerArts[id].weapon).toBe('any');expect(primerArts[id].nodes).toHaveLength(1);expect(primerArts[id].nodes[0].multiplier).toBeLessThan(6);}
});
it('legacy saves preserve training progress and cannot invent dungeon completion',()=>{
 const s=defaultSave() as any;delete s.journey;s.progression.tutorialCompleted=true;const migrated=migrateSave(s);expect(migrated.journey.active).toBe(false);expect(migrated.progression.learned.linear).toBeTruthy();
 expect(validateJourney({room:9,book:'renewal',facts:['boss'],leafLearned:true})).toMatchObject({room:0,book:null,leafLearned:false});
});
it('debug or training outcomes never earn book practice, and normal play does',()=>{
 const s=new CombatSimulation();s.journey.book='steadfast';s.spawnEnemy('goblin');s.hitEnemy(s.enemies[0],1,1,'Normal','basic');expect(s.journey.practice.hits).toBe(1);s.practiceMode=true;s.hitEnemy(s.enemies[0],1,1,'Normal','basic');expect(s.journey.practice.hits).toBe(1);
});
it('goblin counter and guard report distinct outcomes; captain adds a readable second cut',()=>{
 const s=new CombatSimulation();s.spawnEnemy('goblin');s.player.z=0;s.enemies[0].z=2;s.player.yaw=0;s.parry();s.update(60);s.receiveAttack(s.enemies[0],goblinPatterns[0]);expect(s.player.hp).toBe(s.hpMax);expect(s.events.some(e=>e.source==='counter'&&!e.artId)).toBe(true);
 expect(captainPatterns[1].hits).toEqual([1150,1850]);expect(captainPatterns[2].parryable).toBe(false);
});
import {cavernAreas,cavernLinks,insideCavern,projectToCavern} from '../src/world/cavern';
it('every connecting passage is continuously walkable and outside points stay bounded',()=>{for(const [i,j] of cavernLinks){const a=cavernAreas[i],b=cavernAreas[j];for(let t=0;t<=1;t+=.01)expect(insideCavern({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t})).toBe(true);}expect(insideCavern({x:90,z:90})).toBe(false);expect(insideCavern(projectToCavern({x:90,z:90}))).toBe(true);});
it('declined quests cannot grant a primer even after killing the boss',()=>{const j=freshJourney();j.quest='declined';j.facts=['boss'];expect(choosePrimer(j,'renewal')).toBe(false);});
it('fresh creation owns no Arts and v1 prologue migrates to a clean beginning',()=>{expect(defaultSave().progression.learned).toEqual({});const s=defaultSave() as any;s.journey.version=1;s.profile.created=true;s.progression.learned.linear='induction';const restored=migrateSave(s);expect(restored.profile.created).toBe(false);expect(restored.progression.learned).toEqual({});expect(restored.journey.version).toBe(2);});
