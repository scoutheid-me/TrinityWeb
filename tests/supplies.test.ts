import {it,expect} from 'vitest';
import {CombatSimulation} from '../src/combat/simulation';
import {defaultBindings,validateBindings,assignBinding} from '../src/input/bindings';
it('uses potions with living cavern enemies and shares a cooldown',()=>{
 const s=new CombatSimulation();s.spawnEnemy('goblin');s.player.hp=100;s.player.stamina=20;
 expect(s.useSupply('health').used).toBe(true);expect(s.player.hp).toBe(160);expect(s.profile.potions.health).toBe(1);
 expect(s.useSupply('stamina').used).toBe(false);expect(s.profile.potions.stamina).toBe(2);
 s.now+=5000;expect(s.useSupply('stamina').used).toBe(true);expect(s.player.stamina).toBe(70);
});
it('does not spend supplies when full, empty, dead, busy or in a lesson',()=>{
 const s=new CombatSimulation();expect(s.useSupply('health').used).toBe(false);s.player.hp=100;
 s.practiceMode=true;expect(s.useSupply('health').used).toBe(false);s.practiceMode=false;
 s.pressAttack();expect(s.useSupply('health').used).toBe(false);s.state.reset();
 s.player.hp=0;expect(s.useSupply('health').used).toBe(false);expect(s.profile.potions.health).toBe(2);
 s.player.hp=100;s.profile.potions.health=0;expect(s.useSupply('health').used).toBe(false);
});
it('adds potion defaults without erasing existing custom bindings or stealing keys',()=>{
 const old:any=defaultBindings();delete old.healthPotion;delete old.staminaPotion;old.attack=['KeyC','KeyJ'];
 const migrated=validateBindings(old);expect(migrated.attack).toEqual(old.attack);expect(migrated.healthPotion).toEqual([null,null]);expect(migrated.staminaPotion).toEqual(['KeyV',null]);
 expect(assignBinding(migrated,'healthPotion',0,'Mouse3').error).toBeUndefined();
 expect(validateBindings(assignBinding(migrated,'healthPotion',0,'Mouse3').bindings).healthPotion[0]).toBe('Mouse3');
});
