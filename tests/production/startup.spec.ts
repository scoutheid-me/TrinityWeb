import {createTestCharacter,dismissInvitation} from '../uiHelpers';
import {test,expect} from '@playwright/test';
test('built game starts without runtime CDN requests and omits dev hooks',async({page})=>{
 const errors:string[]=[],remote:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',route=>{const url=route.request().url();if(!url.startsWith('http://127.0.0.1:4173/')&&!url.startsWith('data:')&&!url.startsWith('blob:')){remote.push(url);return route.abort();}return route.continue();});
 await page.goto('/');await createTestCharacter(page);await expect(page.locator('#begin')).toBeEnabled({timeout:30000});
 await page.locator('#begin').click();await dismissInvitation(page);await expect(page.locator('#overlay')).toBeHidden();
 await expect(page.locator('#enemy-hud')).toBeHidden();await page.keyboard.down('s');await expect(page.locator('#orb-prompt')).toBeVisible();await page.keyboard.up('s');await page.keyboard.press('e');await page.locator('#orb-guided').click();await page.keyboard.press('Tab');await expect(page.locator('#lock-label')).toHaveCSS('opacity','1');
 await page.keyboard.down('w');await page.waitForTimeout(350);await page.keyboard.up('w');
 await page.keyboard.press('r');await expect(page.locator('#hp-value')).toContainText('200 / 200');
 expect(await page.evaluate(()=>Object.hasOwn(window,'trinity'))).toBe(false);
 expect(errors).toEqual([]);expect(remote).toEqual([]);
});
