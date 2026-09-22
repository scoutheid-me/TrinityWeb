import {expect,type Page} from '@playwright/test';
/** Existing combat regressions explicitly use third person; onboarding tests cover the default. */
export async function createTestCharacter(page:Page){
 await page.locator('#character-creation,#begin:not([disabled])').first().waitFor({timeout:45000});
 if(await page.locator('#character-creation').isVisible()){
  await page.locator('#creation-name').fill('Wayfarer');await page.locator('input[name="character"][value="man"]').check();await page.locator('#character-creation button').click();
 }
 await expect(page.locator('#begin')).toBeEnabled({timeout:45000});
 if(await page.locator('#perspective').textContent()==='Third person')await page.locator('#perspective').click();
}
export async function dismissInvitation(page:Page){if(await page.locator('#decline-guild-challenge').isVisible())await page.locator('#decline-guild-challenge').click();}
export async function startCombatTrial(page:Page,skipOrientation=true){
 await page.evaluate(()=>{const s=window.trinity.sim;s.reset();s.player.x=2;s.player.z=-8;});
 if(await page.locator('#ui').evaluate(e=>e.classList.contains('personal-menu-open')))await page.keyboard.press('m');
 await page.keyboard.press('e');await page.locator('#orb-guided').click();await expect(page.locator('#tutorial')).toBeVisible();
 if(skipOrientation){await page.keyboard.press('Tab');await page.locator('#tutorial-next').click();await page.keyboard.down('d');await expect(page.locator('#tutorial-next')).toBeEnabled();await page.keyboard.up('d');await page.locator('#tutorial-next').click();}
}
