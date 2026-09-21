import {createTestCharacter,dismissInvitation} from '../uiHelpers';
import {test,expect} from '@playwright/test';
test('empty hall, physical rack, two-handed grip, live menu and camera preferences',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?webgl');await createTestCharacter(page);await expect(page.locator('#begin')).toBeEnabled({timeout:45000});await page.locator('#begin').click();await dismissInvitation(page);
 expect(await page.evaluate(()=>window.trinity.sim.enemies.length)).toBe(0);await expect(page.locator('#enemy-hud')).toBeHidden();await expect(page.locator('#open-controls')).toBeHidden();
 await page.keyboard.press('g');await expect(page.locator('#weapon-rack')).toBeHidden();await expect(page.locator('#edit-arts')).toHaveCount(0);await page.keyboard.press('m');await page.locator('#character-menu').click();await page.locator('[data-category=arts]').click();await page.locator('[data-skill=focused-strike]').click();await expect(page.locator('#rack-weapon')).toHaveCount(0);await page.locator('#tray-close').click();await page.keyboard.press('m');
 // Walk to the rack using actual movement, from a nearby starting position.
 await page.evaluate(()=>{const t=window.trinity;t.sim.player.x=-8;t.sim.player.z=5;t.view.camera.alpha=-Math.PI/2;});
 await page.keyboard.down('w');await expect(page.locator('#rack-prompt')).toBeVisible();await page.keyboard.up('w');await page.keyboard.press('g');
 await expect(page.locator('#weapon-rack')).toBeVisible();await page.locator('[data-weapon="greatsword"]').click();await page.locator('#rack-close').click();
 await expect.poll(()=>page.evaluate(()=>window.trinity.view.equippedWeapon)).toBe('greatsword');
 await page.evaluate(()=>{const t=window.trinity;t.sim.player.x=0;t.sim.player.z=0;t.view.camera.alpha=.8;t.view.camera.beta=1.1;t.view.cameraDistance=3.5;});await page.waitForTimeout(300);
 await page.screenshot({path:'test-results/two-handed-idle.png'});
 const gripError=()=>page.evaluate(()=>{const v=window.trinity.view;v.player.sword.computeWorldMatrix(true);return ['left','right'].map(side=>{const arm=v.player[side+'Arm'];const hand=arm.getDescendants().find((n:any)=>n.name.endsWith(side+'_hand'));hand.computeWorldMatrix(true);const m=v.player.sword.getWorldMatrix().m,z=side==='right'?.08:-.15;const p=hand.getAbsolutePosition();return Math.hypot(p.x-(m[8]*z+m[12]),p.y-(m[9]*z+m[13]),p.z-(m[10]*z+m[14]));});});
 expect(Math.max(...await gripError())).toBeLessThan(.025);
 await page.keyboard.press('j');await page.waitForTimeout(100);await page.screenshot({path:'test-results/two-handed-swing.png'});expect(Math.max(...await gripError())).toBeLessThan(.025);
 await page.waitForTimeout(800);await page.keyboard.press('m');await page.locator('#menu').click();await page.locator('#perspective').click();await page.locator('#open-controls').click();
 await expect(page.locator('#controls-menu')).not.toHaveClass(/personal-live/);const before=await page.evaluate(()=>window.trinity.sim.now);await page.waitForTimeout(250);expect(await page.evaluate(()=>window.trinity.sim.now)).toBe(before);await page.locator('#auto-face-target').uncheck();await page.locator('#controls-close').click();await page.locator('#begin').click();await dismissInvitation(page);
 await page.evaluate(()=>{const t=window.trinity,s=t.sim;s.spawnEnemy();s.flags.freezeAI=true;s.player.x=0;s.player.z=0;s.enemies[0].x=2;s.enemies[0].z=2;s.lockedId=s.enemies[0].id;});
 const a=await page.evaluate(()=>window.trinity.view.camera.alpha);await page.mouse.move(550,450);await page.mouse.down({button:'right'});await page.mouse.move(650,470);await page.mouse.up({button:'right'});expect(await page.evaluate(()=>window.trinity.view.camera.alpha)).toBeGreaterThan(a+.2);
 await page.locator('#menu').click();await page.locator('#open-controls').click();await page.locator('#auto-face-target').check();await page.locator('#controls-close').click();await page.locator('#begin').click();await dismissInvitation(page);await page.waitForTimeout(500);
 await expect.poll(()=>page.evaluate(()=>{const t=window.trinity,s=t.sim,want=Math.atan2(s.target.z-s.player.z,s.target.x-s.player.x)+Math.PI;return Math.abs(Math.atan2(Math.sin(t.view.camera.alpha-want),Math.cos(t.view.camera.alpha-want)));})).toBeLessThan(.05);
 await page.locator('#menu').click();await page.locator('#perspective').click();await page.locator('#begin').click();await dismissInvitation(page);await page.keyboard.down('d');await page.waitForTimeout(400);await page.keyboard.up('d');await page.waitForTimeout(500);expect(await page.evaluate(()=>{const t=window.trinity,s=t.sim,yaw=Math.atan2(s.target.x-s.player.x,s.target.z-s.player.z);return Math.abs(Math.atan2(Math.sin(s.player.yaw-yaw),Math.cos(s.player.yaw-yaw)));})).toBeLessThan(.02);await page.evaluate(()=>window.trinity.persist());await page.keyboard.press('r');expect(await page.evaluate(()=>window.trinity.sim.enemies.length)).toBe(0);
 await page.locator('#friends-menu').click();await page.locator('#personal-guild').click();await page.locator('[data-challenge="positioning"]').click();expect(await page.evaluate(()=>window.trinity.sim.enemies.length)).toBe(1);
 expect(errors).toEqual([]);
});
test('both greatsword hands stay on the grip through complete attack cycles in both views',async({page})=>{
 await page.goto('/?webgl');await createTestCharacter(page);await expect(page.locator('#begin')).toBeEnabled({timeout:45000});
 await page.evaluate(()=>{const t=window.trinity;t.sim.weapon='greatsword';t.view.update(t.sim,.016);});await expect.poll(()=>page.evaluate(()=>window.trinity.view.equippedWeapon)).toBe('greatsword');
 const worst=await page.evaluate(()=>{const t=window.trinity,v=t.view,s=t.sim;let max=0;
 for(const first of [false,true]){if(v.firstPerson!==first)v.togglePerspective();for(const art of [false,true]){s.reset();s.player.sp=100;if(art)s.activateArt(0);else s.pressAttack();for(let n=0;n<160;n++){s.update(8);if(art&&s.art?.releasedAt===null&&s.now-s.art.start>=520)s.releaseArt(0);v.update(s,.008);const sword=first?v.firstWeapon:v.player.sword;sword.computeWorldMatrix(true);for(const [i,arm] of (first?v.firstArms:[v.player.leftArm,v.player.rightArm]).entries()){const side=i===0?'left':'right',hand=arm.getDescendants().find((node:any)=>node.name.endsWith(side+'_hand'));hand.computeWorldMatrix(true);const m=sword.getWorldMatrix().m,z=i===0?-.15:.08,p=hand.getAbsolutePosition();max=Math.max(max,Math.hypot(p.x-m[8]*z-m[12],p.y-m[9]*z-m[13],p.z-m[10]*z-m[14]));}}}}
 return max;});expect(worst).toBeLessThan(.01);
});
