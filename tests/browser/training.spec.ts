import {createTestCharacter,dismissInvitation} from '../uiHelpers';
import {test,expect} from '@playwright/test';
test('three weapons, direct Art editor, responsive skill profiles and first-person lock',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?webgl');await createTestCharacter(page);await expect(page.locator('#begin')).toBeEnabled({timeout:45000});await page.locator('#begin').click();await dismissInvitation(page);
 await page.evaluate(()=>{window.trinity.sim.flags.freezeAI=true;});
 await page.evaluate(()=>{window.trinity.sim.player.x=-8;window.trinity.sim.player.z=7;});await page.keyboard.press('g');await expect(page.locator('.rack-choice')).toHaveCount(3);
 for(const id of ['rapier','greatsword','sword']){await page.locator(`[data-weapon="${id}"]`).click();await expect.poll(()=>page.evaluate(()=>window.trinity.view.equippedWeapon)).toBe(id);}
 await page.locator('#rack-close').click();await page.keyboard.press('m');await page.evaluate(()=>{window.trinity.sim.progression.tutorialCompleted=true;window.trinity.sim.progression.learned.linear='induction';window.trinity.loadoutTray.open("linear");});
 await page.locator('[data-equip-slot="1"]').click();
 expect(await page.evaluate(()=>window.trinity.sim.loadout[1])).toBe('linear');
 await expect(page.locator('.skill-detail-body svg')).toBeVisible();
 await expect(page.locator('.skill-detail-body')).toContainText('6.00 / 1.00 m');
 await page.screenshot({path:'test-results/skill-bank.png'});
 await page.setViewportSize({width:640,height:720});await page.screenshot({path:'test-results/skill-bank-compact.png'});
 expect(await page.locator('#loadout-tray').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
 await page.locator('#tray-close').click();await page.setViewportSize({width:1440,height:900});await page.locator('#menu').click();await page.locator('#perspective').click();await page.locator('#begin').click();await dismissInvitation(page);
 const alpha=await page.evaluate(()=>window.trinity.view.camera.alpha);await page.keyboard.down('ArrowRight');await page.waitForTimeout(250);await page.keyboard.up('ArrowRight');
 expect(Math.abs(await page.evaluate(()=>window.trinity.view.camera.alpha)-alpha)).toBeGreaterThan(.1);
 await page.evaluate(()=>{const s=window.trinity.sim;s.spawnEnemy();s.player.x=0;s.player.z=0;s.enemies[0].x=2;s.enemies[0].z=2;s.lockedId=s.enemies[0].id;});
 await expect.poll(()=>page.evaluate(()=>{const t=window.trinity,v=t.view,s=t.sim;const desired=Math.atan2(s.target.z-s.player.z,s.target.x-s.player.x)+Math.PI;return Math.abs(Math.atan2(Math.sin(v.camera.alpha-desired),Math.cos(v.camera.alpha-desired)));})).toBeLessThan(.03);
 await page.screenshot({path:'test-results/first-person-weapon.png'});
 const bank=await page.request.get('/data/skill-bank.json');expect(bank.ok()).toBe(true);const data=await bank.json();expect(data.weapons).toHaveLength(3);expect(data.skills).toHaveLength(7);
 expect(await page.evaluate(()=>window.trinity.view.assetErrors)).toEqual([]);expect(errors).toEqual([]);
});
