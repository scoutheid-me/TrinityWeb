import {it,expect} from 'vitest';
import {CombatSimulation} from '../src/combat/simulation';
import {enemyTimingPhrases} from '../src/audio/timing';
import {sentinelPatterns,boarPatterns} from '../src/data/enemies';
it('counter melodies resolve 80ms before each hit and follow-up phrases do not overlap',()=>{
 for(const pattern of [sentinelPatterns[0],sentinelPatterns[1],boarPatterns[0]]){
  const s=new CombatSimulation();s.spawnEnemy();const e=s.enemies[0];e.pattern=pattern;e.attackStart=100;e.state='Telegraph';
  const notes=enemyTimingPhrases(s)[0].notes;
  expect(notes.filter(n=>n.chord).map(n=>n.at)).toEqual(pattern.hits.map(at=>at+100-80));
  for(let i=0;i<pattern.hits.length;i++){const phrase=notes.slice(i*5,i*5+5);expect(phrase).toHaveLength(5);expect(phrase[0].at).toBeGreaterThanOrEqual(i?100+pattern.hits[i-1]+80:100);expect(phrase.every((n,j)=>j===0||n.frequency>phrase[j-1].frequency&&n.at>phrase[j-1].at&&n.level!>phrase[j-1].level!)).toBe(true);}
 }
});
it('red attacks never use the counter chord and dead enemies never produce cues',()=>{
 const s=new CombatSimulation();s.spawnEnemy();const e=s.enemies[0];e.pattern=boarPatterns[1];e.state='Telegraph';
 expect(enemyTimingPhrases(s)[0].notes.some(n=>n.chord)).toBe(false);e.hp=0;expect(enemyTimingPhrases(s)).toEqual([]);
});
