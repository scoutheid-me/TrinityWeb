import {test,expect} from '@playwright/test';
async function start(page:any){
 await page.goto('/?webgl');await page.locator('#creation-name').fill('New dawn');await page.locator('[name=character][value=woman]').check();await page.locator('[name=starting-weapon][value=greatsword]').check();await expect(page.locator('#creation-weapon')).toHaveValue('greatsword');await page.locator('#character-creation button').click();
 await expect(page.locator('#dialogue-next')).toBeVisible({timeout:45000});await page.locator('#dialogue-next').click();await page.locator('#dialogue-next').click();await page.locator('#journey-confirm').click();await page.locator('#accept-exit-quest').click();
}
test('native captured look stays locked through HUD positions, menus and focus recovery',async({page})=>{
 await start(page);await expect.poll(()=>page.evaluate(()=>!!document.pointerLockElement)).toBe(true);
 const before=await page.evaluate(()=>window.trinity.view.camera.alpha);
 for(const [x,y] of [[20,20],[1400,880],[20,880],[1400,20],[700,450]]){await page.mouse.move(x,y);expect(await page.evaluate(()=>document.pointerLockElement?.id)).toBe('game');expect(await page.locator('#personal-menu-toggle').evaluate(e=>getComputedStyle(e).cursor)).toBe('none');}
 expect(await page.evaluate(()=>window.trinity.view.camera.alpha)).not.toBe(before);
 await page.keyboard.press('m');await expect.poll(()=>page.evaluate(()=>!!document.pointerLockElement)).toBe(false);expect(await page.locator('body').evaluate(e=>e.classList.contains('mouse-captured'))).toBe(false);
 await page.keyboard.press('m');await expect.poll(()=>page.evaluate(()=>!!document.pointerLockElement)).toBe(true);
 await page.keyboard.press('m');await page.keyboard.press('Escape');await expect(page.locator('#overlay')).toBeVisible();await page.locator('#begin').click();await expect.poll(()=>page.evaluate(()=>!!document.pointerLockElement)).toBe(true);
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.locator('#overlay')).toBeVisible();await page.locator('#begin').click();await expect.poll(()=>page.evaluate(()=>!!document.pointerLockElement)).toBe(true);
 // A raw-input rejection still gets real native capture through the standard API.
 await page.keyboard.press('m');await page.evaluate(()=>{const canvas=window.trinity.view.canvas,original=canvas.requestPointerLock.bind(canvas);Object.defineProperty(canvas,'requestPointerLock',{configurable:true,value:(options?:PointerLockOptions)=>options?Promise.reject(new DOMException('No raw input','NotSupportedError')):original()});});await page.keyboard.press('m');await expect.poll(()=>page.evaluate(()=>document.pointerLockElement?.id)).toBe('game');
 // No pretend hover-look when the browser refuses capture.
 await page.keyboard.press('m');await page.evaluate(()=>{Object.defineProperty(window.trinity.view.canvas,'requestPointerLock',{configurable:true,value:()=>Promise.reject(new DOMException('Denied','NotAllowedError'))});});await page.keyboard.press('m');
 await expect(page.locator('#overlay')).toBeVisible();await expect(page.locator('#capture-status')).toContainText('Mouse capture was blocked');const denied=await page.evaluate(()=>window.trinity.view.camera.alpha);await page.mouse.move(1000,600);expect(await page.evaluate(()=>window.trinity.view.camera.alpha)).toBe(denied);
});
test('equipment-linked loot works, restart returns to weapon creation, and recovery backup survives',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);expect(await page.evaluate(()=>window.trinity.sim.weapon)).toBe('greatsword');
 await page.evaluate(()=>{const t=window.trinity;t.input.autoMouseLook=false;document.exitPointerLock();const s=t.sim;s.journey.lootSeed=123;for(const e of s.enemies)s.hitEnemy(e,10000,0,'Normal','test');t.dungeon.update(s.events,16);s.state.reset();});
 expect(await page.evaluate(()=>window.trinity.sim.journey.items.cleaver)).toBeGreaterThan(0);await page.keyboard.press('m');await page.locator('#character-menu').click();await page.locator('summary').filter({hasText:'Goblin cleaver'}).click();await page.locator('#equip-loot-cleaver').click();await expect.poll(()=>page.evaluate(()=>window.trinity.view.equippedWeapon)).toBe('cleaver');await page.screenshot({path:'test-results/loot-cleaver-menu.png'});await expect(page.locator('[data-material=scrapIron]')).toBeVisible();await page.locator('[data-material=scrapIron] summary').click();await expect(page.locator('[data-material=scrapIron]')).toContainText('Crafting is not available yet');await page.keyboard.press('m');await page.waitForTimeout(400);await page.screenshot({path:'test-results/cleaver-first-person.png'});await page.keyboard.press('m');
 await page.locator('#equip-starting-weapon').click();expect(await page.evaluate(()=>window.trinity.sim.weapon)).toBe('greatsword');
 await page.keyboard.press('m');await page.keyboard.press('Escape');await page.locator('#restart-adventure').click();await page.locator('#cancel-restart').click();await expect(page.locator('#restart-confirmation')).toBeHidden();
 await page.evaluate(async()=>{const t=window.trinity;t.input.bindings.interact=['KeyH',null];await t.persist();});await page.locator('#restart-adventure').click();await page.locator('#confirm-restart').click();
 await expect(page.locator('#character-creation')).toBeVisible({timeout:45000});await expect(page.locator('#creation-weapon option')).toHaveCount(3);await page.screenshot({path:'test-results/restart-character-creation.png'});
 const data=await page.evaluate(async()=>{const path='/src/save/save.ts',backup='/src/save/backup.ts';const {loadSave}=await import(path);const {previousBackup}=await import(backup);return {current:await loadSave(),backup:await previousBackup()};});
 expect(data.current.profile.created).toBe(false);expect(data.current.journey.items.cleaver).toBe(0);expect(data.current.journey.coins).toBe(0);expect(data.current.settings.bindings.interact[0]).toBe('KeyH');expect(data.backup.journey.items.cleaver).toBeGreaterThan(0);expect(errors).toEqual([]);
});
test('linear route presents distinct encounters and readable room landmarks',async({page})=>{
 await start(page);await page.evaluate(()=>{const t=window.trinity;t.input.autoMouseLook=false;document.exitPointerLock();t.sim.flags.freezeAI=true;t.sim.lockedId=null;});await page.waitForTimeout(5500);
 for(const [name,x,z] of [['sentry-gate',0,38],['recovery-pool',0,58],['goblin-camp',30,58],['aqueduct',30,31],['brute-shrine',-30,56],['solo-captain',-30,87]] as const){
  await page.evaluate(({x,z})=>{const t=window.trinity;t.sim.player.x=x;t.sim.player.z=z;t.view.camera.alpha=-Math.PI/2;t.view.camera.beta=1.5;}, {x,z});await page.waitForTimeout(250);await page.screenshot({path:'test-results/room-'+name+'.png'});
 }
 expect(await page.evaluate(()=>window.trinity.sim.enemies.filter((e:{room?:number})=>e.room===1).length)).toBe(1);
 expect(await page.evaluate(()=>window.trinity.sim.enemies.filter((e:{room?:number})=>e.room===7).map((e:{species?:string})=>e.species))).toEqual(['captain']);
});

test('returning adventure has a title menu with continue and direct restart',async({page})=>{
 await start(page);await page.evaluate(()=>window.trinity.persist());await page.reload();
 await expect(page.locator('#begin')).toBeEnabled({timeout:45000});await expect(page.locator('.intro h1')).toHaveText('TRINITY');
 await expect(page.locator('#begin')).toHaveText('Continue adventure');await expect(page.locator('#restart-adventure')).toBeVisible();
 await page.screenshot({path:'test-results/title-menu.png'});await page.locator('#begin').click();
 await expect.poll(()=>page.evaluate(()=>document.pointerLockElement?.id)).toBe('game');
 await page.keyboard.press('Escape');await expect(page.locator('.intro h1')).toHaveText('Game paused');await expect(page.locator('#restart-adventure')).toBeVisible();
});
