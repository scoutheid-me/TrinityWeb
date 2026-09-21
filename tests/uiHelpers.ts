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
