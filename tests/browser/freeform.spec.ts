import {test,expect} from '@playwright/test';
import {createTestCharacter} from '../uiHelpers';
test('T releases the sole target in both camera perspectives and allows a freeform hit',async({page})=>{
 await page.goto('/?webgl');await createTestCharacter(page);await page.locator('#begin').click();
 for(const firstPerson of [false,true]){
  await page.evaluate(firstPerson=>{const {sim:s,view}=window.trinity;s.reset();s.spawnEnemy();s.flags.freezeAI=true;s.player.z=0;s.enemies[0].x=0;s.enemies[0].z=2;if(view.firstPerson!==firstPerson)view.togglePerspective();},firstPerson);
  await page.keyboard.press('t');expect(await page.evaluate(()=>window.trinity.sim.lockedId)).not.toBeNull();await page.keyboard.press('t');expect(await page.evaluate(()=>window.trinity.sim.lockedId)).toBeNull();
  await page.locator('#game').click();await expect.poll(()=>page.evaluate(()=>window.trinity.sim.enemies[0].hp)).toBeLessThan(460);expect(await page.evaluate(()=>window.trinity.sim.lockedId)).toBeNull();
 }
 await page.screenshot({path:'test-results/freeform-fight.png'});
});
