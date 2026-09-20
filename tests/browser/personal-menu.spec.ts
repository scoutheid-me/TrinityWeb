import {test,expect} from '@playwright/test';
test('floating equipment branches, actual weapon stats, live movement and compact status',async({page})=>{
 await page.goto('/?webgl');await expect(page.locator('#begin')).toBeEnabled({timeout:45000});await page.locator('#begin').click();
 await expect(page.locator('#personal-artifact')).toBeHidden();await page.keyboard.press('m');await page.locator('#perspective').click();
 await expect(page.locator('#personal-artifact')).toBeVisible();await expect(page.locator('#personal-weapon')).toHaveText('One-handed sword');
 await page.locator('#character-menu').hover();await expect(page.locator('#character-branch')).toBeVisible();await page.locator('[data-category="equipment"]').click();await expect(page.locator('#personal-artifact details')).toHaveAttribute('open','');
 await page.locator('[data-category="arts"]').click();await expect(page.locator('#loadout-tray')).toBeVisible();await page.locator('#tray-close').click();
 const before=await page.evaluate(()=>window.trinity.sim.now);await page.keyboard.down('w');await page.waitForTimeout(250);await page.keyboard.up('w');expect(await page.evaluate(()=>window.trinity.sim.now)).toBeGreaterThan(before+100);
 await page.evaluate(()=>{const t=window.trinity;t.sim.weapon='greatsword';});await expect(page.locator('#personal-weapon')).toHaveText('Two-handed sword');await expect(page.locator('#personal-weapon-stats')).toContainText('15 damage');
 await page.keyboard.press('m');await expect(page.locator('#personal-artifact')).toBeHidden();await expect(page.locator('#character-branch')).toBeHidden();
 for(const width of [1440,640]){await page.setViewportSize({width,height:900});const box=await page.locator('.player-panel').boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThan(width);}
});
