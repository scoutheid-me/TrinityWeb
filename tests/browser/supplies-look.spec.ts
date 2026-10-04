import {test,expect} from '@playwright/test';
import {createTestCharacter} from '../uiHelpers';
test('hover camera fallback, cursor menus, potion keys, mouse mapping and persistence',async({page})=>{
 await page.goto('/?webgl');await createTestCharacter(page);await page.locator('#begin').click();
 await page.evaluate(()=>{const t=window.trinity;t.input.autoMouseLook=true;Object.defineProperty(t.view.canvas,'requestPointerLock',{configurable:true,value:()=>Promise.reject(new Error('Browser capture denied'))});t.sim.player.hp=80;t.sim.spawnEnemy('goblin');t.sim.enemies[0].z=50;t.sim.lockedId=null;});
 await page.mouse.move(600,400);const alpha=await page.evaluate(()=>window.trinity.view.camera.alpha);await page.mouse.move(760,430);
 expect(await page.evaluate(()=>window.trinity.view.camera.alpha)).not.toBe(alpha);await expect(page.locator('#mouse-capture-hint')).toHaveCount(0);
 await page.keyboard.press('Escape');await expect(page.locator('#overlay')).toBeVisible();const escaped=await page.evaluate(()=>window.trinity.view.camera.alpha);await page.mouse.move(1000,600);expect(await page.evaluate(()=>window.trinity.view.camera.alpha)).toBe(escaped);await page.locator('#begin').click();
 await page.keyboard.press('c');expect(await page.evaluate(()=>window.trinity.sim.player.hp)).toBe(140);expect(await page.evaluate(()=>window.trinity.sim.profile.potions.health)).toBe(1);
 await page.keyboard.press('m');const menuAlpha=await page.evaluate(()=>window.trinity.view.camera.alpha);await page.mouse.move(900,500);expect(await page.evaluate(()=>window.trinity.view.camera.alpha)).toBe(menuAlpha);
 await page.evaluate(()=>{const s=window.trinity.sim;s.supplyReadyAt=0;s.player.stamina=20;});await page.locator('[data-supply=stamina]').click();expect(await page.evaluate(()=>window.trinity.sim.profile.potions.stamina)).toBe(1);
 await page.locator('#menu').click();await page.locator('#open-controls').click();await page.getByRole('button',{name:'Use health potion primary binding',exact:true}).click();await page.mouse.click(700,400,{button:'middle'});await page.locator('#controls-close').click();await page.locator('#begin').click();await page.keyboard.press('m');
 await page.evaluate(()=>{const s=window.trinity.sim;s.supplyReadyAt=0;s.player.hp=80;});await page.mouse.click(700,400,{button:'middle'});expect(await page.evaluate(()=>window.trinity.sim.player.hp)).toBe(140);expect(await page.evaluate(()=>window.trinity.sim.profile.potions.health)).toBe(0);
 await page.evaluate(()=>window.trinity.persist());await page.reload();await expect(page.locator('#begin')).toBeEnabled({timeout:45000});expect(await page.evaluate(()=>window.trinity.input.bindings.healthPotion[0])).toBe('Mouse1');expect(await page.evaluate(()=>window.trinity.sim.profile.potions.health)).toBe(0);
});
