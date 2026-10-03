import {test,expect} from '@playwright/test';
test('hosted game loads under its permanent project path with working models and menus',async({page,baseURL})=>{
 const errors:string[]=[],badAssets:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badAssets.push(r.status()+' '+r.url());});
 await page.goto(baseURL+'?webgl');await expect(page.locator('#character-creation')).toBeVisible();
 for(const img of await page.locator('.character-choice img').all())await expect.poll(()=>img.evaluate((e:HTMLImageElement)=>e.naturalWidth)).toBeGreaterThan(0);
 await page.locator('#creation-name').fill('Hosting Scout');await page.locator('[name=character][value=woman]').check();await page.locator('#creation-weapon').selectOption('rapier');await page.locator('#character-creation button').click();
 await expect(page.locator('#dialogue-next')).toBeVisible({timeout:60000});await page.locator('#dialogue-next').click();await page.locator('#dialogue-next').click();await page.locator('#journey-confirm').click();await page.locator('#accept-exit-quest').click();await expect(page.locator('#journey-modal')).toBeHidden();
 await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');await page.keyboard.press('m');await expect(page.locator('#personal-artifact')).toBeVisible();await expect(page.locator('#personal-character-name')).toHaveText('Hosting Scout');
 expect(await page.evaluate(()=>Object.hasOwn(window,'trinity'))).toBe(false);await expect(page.locator('#open-gm')).toHaveCount(0);
 const bank=await page.request.get(baseURL+'data/skill-bank.json');expect(bank.ok()).toBe(true);expect((await bank.json()).weapons).toHaveLength(3);
 if(process.env.TRINITY_EXPECTED_REV){await page.locator('#menu').click();await expect(page.locator('#playtest-settings')).toContainText(process.env.TRINITY_EXPECTED_REV.slice(0,7));}
 await page.screenshot({path:'test-results/hosting/permanent-site.png'});expect(errors).toEqual([]);expect(badAssets).toEqual([]);
});
