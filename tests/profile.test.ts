import {it,expect} from 'vitest';
import {migrateSave,defaultSave} from '../src/save/save';
import {validateProfile} from '../src/progression/profile';
import {arts} from '../src/data/arts';
import {CombatSimulation} from '../src/combat/simulation';
it('migrates old profiles and validates names, inventory and exploration',()=>{
 const old:any=defaultSave();delete old.profile;expect(migrateSave(old).profile.name).toBe('Wayfarer');
 const p=validateProfile({name:' <Aria> ',potions:{health:-4,stamina:3},pockets:['health','health','stamina','bad',null],explored:['0,0','bad','99,99'],chats:['guild','bad'],sentinelSeen:true});
 expect(p.name).toBe('Aria');expect(p.created).toBe(false);expect(p.character).toBe('man');expect(validateProfile({...p,created:true,character:'woman'})).toMatchObject({created:true,character:'woman',name:'Aria'});expect(p.potions).toEqual({health:0,stamina:3});expect(p.pockets).toEqual(['health',null,'stamina',null,null]);expect(p.explored).toEqual(['0,0']);expect(p.chats).toEqual(['guild']);expect(migrateSave({...defaultSave(),profile:p}).profile).toEqual(p);
});
it('scales the same general Art with equipped weapon damage and applies timing once',()=>{
 function hit(weapon:string,offset:number){const s=new CombatSimulation();s.weapon=weapon;s.spawnEnemy();s.flags.freezeAI=true;s.player.x=0;s.player.z=0;s.player.yaw=0;s.enemies[0].x=0;s.enemies[0].z=2;s.player.sp=100;const hp=s.enemies[0].hp;s.activateArt(0);for(let n=0;n<520+offset;n+=10)s.update(10);s.releaseArt(0);for(let n=0;n<400;n+=10)s.update(10);return hp-s.enemies[0].hp;}
 expect(hit('sword',0)).toBe(30);expect(hit('greatsword',0)).toBe(90);expect(hit('greatsword',80)).toBe(54);
 expect(arts.linear.nodes[0].multiplier).toBeLessThan(arts['aether-step'].nodes[0].multiplier);
 expect(arts['focused-strike'].nodes[0].multiplier).toBeLessThan(arts['stillwater-return'].nodes[0].multiplier);
});
