import {it,expect} from 'vitest';
import {aimedOrb} from '../src/world/lootFocus';
it('selects the crosshair orb rather than the nearest drop to the player',()=>{
 const o={x:0,y:0,z:0},d={x:0,y:0,z:1};
 expect(aimedOrb(o,d,[{id:'near',position:{x:.5,y:0,z:1}},{id:'aimed',position:{x:0,y:0,z:2}}])).toBe('aimed');
 expect(aimedOrb(o,{x:1,y:0,z:0},[{id:'behind',position:{x:0,y:0,z:2}}])).toBeNull();
});
it('occludes overlapping drops by depth and excludes distant and rear drops',()=>{
 const o={x:0,y:0,z:0},d={x:0,y:0,z:1};
 expect(aimedOrb(o,d,[{id:'far',position:{x:0,y:0,z:4}},{id:'front',position:{x:0,y:0,z:2}}])).toBe('front');
 expect(aimedOrb(o,d,[{id:'rear',position:{x:0,y:0,z:-1}},{id:'far',position:{x:0,y:0,z:7}}])).toBeNull();
});
