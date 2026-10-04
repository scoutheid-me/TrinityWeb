import {it,expect} from 'vitest';
import {RegionTracker,stopAtExit,exitDoor} from '../src/world/regions';
import {defaultSave,migrateSave} from '../src/save/save';
it('announces actual entry, suppresses edge jitter, and rearms after leaving',()=>{
 const regions=new RegionTracker();expect(regions.update({x:0,z:0})).toBe(0);expect(regions.update({x:30,z:30})).toBeNull();expect(regions.update({x:-30,z:120})).toBeNull();expect(regions.update({x:0,z:143})).toBeNull();
 expect(regions.update({x:0,z:150})).toBe(9);expect(regions.update({x:0,z:149})).toBeNull();
 regions.update({x:0,z:142});expect(regions.update({x:0,z:150})).toBe(9);
});
it('blocks the stone doorway until opened without disturbing other rooms',()=>{
 const p={x:exitDoor.x+2,z:exitDoor.z+2};stopAtExit(p,false);
 expect((p.x-exitDoor.x)*.6+(p.z-exitDoor.z)*.8).toBeCloseTo(-.65);
 const room={x:0,z:30};stopAtExit(room,false);expect(room).toEqual({x:0,z:30});
 const open={x:0,z:160};stopAtExit(open,true);expect(open).toEqual({x:0,z:160});
});
it('defaults to captured look while preserving a saved opt-out',()=>{
 const save=defaultSave();expect(save.settings.autoMouseLook).toBe(true);
 save.settings.autoMouseLook=false;expect(migrateSave(save).settings.autoMouseLook).toBe(false);
});

it('holds returning players on the town side of the sealed gate',()=>{const p={x:exitDoor.x-1,z:exitDoor.z-1};stopAtExit(p,false,true);expect((p.x-exitDoor.x)*.6+(p.z-exitDoor.z)*.8).toBeCloseTo(.65);});
