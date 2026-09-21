import {it,expect} from 'vitest';
import {CombatSimulation} from '../src/combat/simulation';
import {boarPatterns} from '../src/data/enemies';
const step=(s:CombatSimulation,ms:number)=>{for(let i=0;i<ms;i+=10)s.update(10);};
it('boar uses its own attacks, finite health and repeatable encounters',()=>{const s=new CombatSimulation();s.spawnEnemy('boar');const e=s.enemies[0];expect(e.maxHp).toBe(220);s.player.z=1;e.z=2.5;step(s,1210);expect(e.pattern).toBe(boarPatterns[0]);const hp=s.player.hp;step(s,1000);expect(s.player.hp).toBe(hp-18);step(s,2500);expect(e.pattern).toBe(boarPatterns[1]);s.reset();s.spawnEnemy();expect(s.enemies).toHaveLength(1);expect(s.enemies[0].species).toBe('sentinel');});
it('boar tusk counter negates damage while its heavy sweep cannot be parried',()=>{const s=new CombatSimulation();s.spawnEnemy('boar');const e=s.enemies[0];s.player.z=1;e.z=2.5;const hp=s.player.hp;s.parry();s.receiveAttack(e,boarPatterns[0]);expect(s.player.hp).toBe(hp);expect(s.player.sp).toBeGreaterThan(0);s.state.reset();s.parry();s.receiveAttack(e,boarPatterns[1]);expect(s.player.hp).toBeLessThan(hp);});
