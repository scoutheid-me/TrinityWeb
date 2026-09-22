import {test,expect} from '@playwright/test';
import {createTestCharacter,dismissInvitation} from '../uiHelpers';
test('rack displays real weapons, comparison data and persistent specialty Arts',async({page})=>{
 await page.goto('/?webgl');await createTestCharacter(page);await page.locator('#begin').click();await dismissInvitation(page);
 await page.evaluate(()=>{const t=window.trinity;t.sim.player.x=-8;t.sim.player.z=7;t.view.camera.alpha=-1.2;t.view.cameraDistance=4;});await page.waitForTimeout(600);await page.screenshot({path:'docs/screenshots/three-weapon-rack.png'});
 expect(await page.evaluate(()=>window.trinity.view.scene.transformNodes.filter((n:any)=>n.name.startsWith('rack display ')).length)).toBe(3);
 await page.keyboard.press('e');await expect(page.locator('#weapon-rack')).toContainText('680 ms recovery');await expect(page.locator('#weapon-rack')).toContainText('140 ms recovery');await page.screenshot({path:'docs/screenshots/weapon-comparison.png'});
 for(const [weapon,skill] of [['rapier','needle-step'],['greatsword','iron-horizon']]){await page.locator(`[data-weapon=${weapon}]`).click();expect(await page.evaluate(id=>window.trinity.sim.progression.learned[id],skill)).toBe('rack practice');}
 await page.evaluate(()=>window.trinity.persist());await page.reload();await expect(page.locator('#begin')).toBeEnabled();expect(await page.evaluate(()=>window.trinity.sim.progression.learned['iron-horizon'])).toBe('rack practice');expect(await page.evaluate(()=>window.trinity.view.assetErrors)).toEqual([]);
});
