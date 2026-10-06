import {test,expect} from '@playwright/test';
test('hosted game loads under its permanent project path with working models and menus',async({page,baseURL})=>{
 const errors:string[]=[],badAssets:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badAssets.push(r.status()+' '+r.url());});
 await page.goto(baseURL+'?webgl');await expect(page.locator('#character-creation')).toBeVisible();
 for(const img of await page.locator('.character-choice img').all())await expect.poll(()=>img.evaluate((e:HTMLImageElement)=>e.naturalWidth)).toBeGreaterThan(0);
 await expect(page.locator('#creation-weapon option')).toHaveCount(3);await page.locator('#creation-name').fill('Hosting Scout');await page.locator('[name=character][value=woman]').check();await page.locator('#creation-weapon').selectOption('rapier');await page.locator('#character-creation button').click();
 await expect(page.locator('#dialogue-next')).toBeVisible({timeout:60000});await page.locator('#dialogue-next').click();await page.locator('#dialogue-next').click();await page.locator('#journey-confirm').click();await page.locator('#accept-exit-quest').click();await expect(page.locator('#journey-modal')).toBeHidden();
 await expect.poll(()=>page.evaluate(()=>document.pointerLockElement?.id)).toBe('game');await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');await page.keyboard.press('m');await expect(page.locator('#personal-artifact')).toBeVisible();await expect(page.locator('#personal-character-name')).toHaveText('Hosting Scout');
 expect(await page.evaluate(()=>Object.hasOwn(window,'trinity'))).toBe(false);await expect(page.locator('#open-gm')).toHaveCount(0);
 const bank=await page.request.get(baseURL+'data/skill-bank.json');expect(bank.ok()).toBe(true);expect((await bank.json()).weapons.map((w:{id:string})=>w.id)).toEqual(expect.arrayContaining(['sword','rapier','greatsword','dagger','cleaver']));
 if(process.env.TRINITY_EXPECTED_REV){await page.locator('#menu').click();await expect(page.locator('#playtest-settings')).toContainText(process.env.TRINITY_EXPECTED_REV.slice(0,7));}
 await page.keyboard.press('Escape');await expect(page.locator('#restart-adventure')).toBeVisible();await page.locator('#begin').click();await expect.poll(()=>page.evaluate(()=>document.pointerLockElement?.id)).toBe('game');await page.keyboard.press('Escape');await page.screenshot({path:'test-results/hosting/permanent-site.png'});expect(errors).toEqual([]);expect(badAssets).toEqual([]);
});

test('new release notice preserves the character when refreshing',async({page,baseURL})=>{
 test.setTimeout(150000);
 await page.route('**/version.json?*',route=>route.fulfill({json:{revision:'newer-release-test'}}));
 await page.goto(baseURL+'?webgl');await page.locator('#creation-name').fill('Update Scout');await page.locator('[name=character][value=man]').check();await page.locator('#character-creation button').click();
 await expect(page.locator('#dialogue-next')).toBeVisible({timeout:60000});await page.keyboard.press('Escape');
 await expect(page.locator('#game-update')).toBeVisible();await page.unroute('**/version.json?*');await Promise.all([page.waitForEvent('domcontentloaded'),page.locator('#game-update button').click()]);
 await expect(page.locator('#begin')).toBeEnabled({timeout:45000});await expect(page.locator('.intro h1')).toHaveText('TRINITY');await expect(page.locator('#settings-name')).toHaveValue('Update Scout');await expect(page.locator('#game-update')).toBeHidden();
 await expect(page.locator('#begin')).toHaveText('Continue adventure',{timeout:60000});await expect(page.locator('#begin')).toBeEnabled();await page.screenshot({path:'test-results/hosting/title-menu.png'});
});
