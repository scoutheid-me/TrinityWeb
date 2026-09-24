import {test,expect} from '@playwright/test';
import {createTestCharacter} from '../uiHelpers';
import {defaultSave} from '../../src/save/save';
import {backupText} from '../../src/save/backup';
test('public build hides developer tools and supports safe backup preview, import and comfort settings',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?webgl');await createTestCharacter(page);expect(await page.evaluate(()=>Object.hasOwn(window,'trinity'))).toBe(false);await expect(page.locator('#open-gm')).toHaveCount(0);await expect(page.locator('[data-action]')).toHaveCount(0);
 await page.locator('#playtest-settings summary').click();await page.locator('#reduced-motion').check();await page.locator('#reduced-flash').check();await page.locator('#cue-offset').fill('75');
 await page.locator('#import-save').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{}')});await expect(page.locator('#save-tools-status')).toContainText('rejected');await expect(page.locator('#apply-import')).toBeDisabled();
 const download=page.waitForEvent('download');await page.locator('#export-save').click();expect((await download).suggestedFilename()).toBe('trinity-save.json');
 const s=defaultSave();s.profile.name='Imported Hero';s.profile.created=true;s.settings.comfort.cueOffsetMs=45;
 await page.locator('#import-save').setInputFiles({name:'good.json',mimeType:'application/json',buffer:Buffer.from(backupText(s))});await expect(page.locator('#save-tools-status')).toContainText('Imported Hero');await expect(page.locator('#settings-name')).not.toHaveValue('Imported Hero');
 await page.locator('#apply-import').click();await expect(page.locator('#begin')).toBeEnabled({timeout:45000});await expect(page.locator('#settings-name')).toHaveValue('Imported Hero');await page.locator('#playtest-settings summary').click();await expect(page.locator('#cue-offset')).toHaveValue('45');
 const previous=page.waitForEvent('download');await page.locator('#previous-save').click();expect((await previous).suggestedFilename()).toBe('trinity-recovery.json');
 await page.locator('#calibrate-audio').click();await expect(page.locator('#calibration-tap')).toBeEnabled();await page.locator('#begin').click();await expect(page.locator('#calibration-tap')).toBeDisabled();await page.keyboard.press('Backquote');await expect(page.locator('#debug')).toBeHidden();await page.screenshot({path:'test-results/playtest/release.png'});expect(errors).toEqual([]);
});
