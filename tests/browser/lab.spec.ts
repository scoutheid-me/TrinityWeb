import {test,expect,type Page} from '@playwright/test';
import {writeFileSync} from 'node:fs';
declare global {interface Window {trinity:any;}}
async function ready(page:Page,webgl=false){await page.goto(webgl?'/?webgl':'/');await expect(page.locator('#begin')).toBeEnabled({timeout:45000});await page.locator('#begin').click();await expect(page.locator('#overlay')).toBeHidden();}
async function setupClose(page:Page){await page.evaluate(()=>{const s=window.trinity.sim;s.reset();s.flags.freezeAI=true;s.player.x=0;s.player.z=0;s.player.yaw=0;s.enemies[0].x=0;s.enemies[0].z=2;});}
test('real controls, assets, timing, Arts, camera, debug and save',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await ready(page);await expect.poll(()=>page.evaluate(()=>window.trinity.view.loadedAssets.length)).toBe(5);
 await page.evaluate(()=>window.trinity.sim.flags.invulnerable=true);
 const start=await page.evaluate(()=>window.trinity.sim.player.z);
 await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');
 expect(await page.evaluate(()=>window.trinity.sim.player.z)).toBeGreaterThan(start+1);
 const stamina=await page.evaluate(()=>window.trinity.sim.player.stamina);
 await page.keyboard.down('Shift');await page.keyboard.down('w');await page.waitForTimeout(300);await page.keyboard.up('w');await page.keyboard.up('Shift');
 expect(await page.evaluate(()=>window.trinity.sim.player.stamina)).toBeLessThan(stamina);
 await page.keyboard.press('Tab');expect(await page.evaluate(()=>window.trinity.sim.lockedId)).not.toBeNull();
 const alpha=await page.evaluate(()=>window.trinity.view.camera.alpha);
 await page.keyboard.press('Tab');await page.mouse.move(700,420);await page.mouse.down({button:'right'});await page.mouse.move(810,450,{steps:10});await page.mouse.up({button:'right'});
 expect(Math.abs(await page.evaluate(()=>window.trinity.view.camera.alpha)-alpha)).toBeGreaterThan(.1);
 await setupClose(page);
 for(let i=0;i<3;i++){
  if(i===0)await page.mouse.down();else await page.keyboard.down('j');await page.waitForTimeout(365);if(i===0)await page.mouse.up();else await page.keyboard.up('j');await page.waitForTimeout(450);
 }
 expect(await page.evaluate(()=>window.trinity.sim.player.sp)).toBeGreaterThanOrEqual(30);
 const sp=await page.evaluate(()=>window.trinity.sim.player.sp);
 await page.keyboard.press('1');expect(await page.evaluate(()=>window.trinity.sim.player.sp)).toBe(sp-30);
 for(const at of [620]){await page.waitForFunction(at=>{const a=window.trinity.sim.art;return a&&window.trinity.sim.now-a.start>=at-20;},at,{polling:'raf'});await page.keyboard.press('j');}
 await expect.poll(()=>page.evaluate(()=>window.trinity.sim.art?.grades.filter((g:string)=>g==='Good'||g==='Perfect').length??0)).toBe(1);
 await expect.poll(()=>page.evaluate(()=>window.trinity.sim.state.state)).toBe('Idle');
 expect(await page.evaluate(()=>window.trinity.sim.enemies[0].hp)).toBeLessThan(380);
 await page.keyboard.press('Space');expect(await page.evaluate(()=>window.trinity.sim.state.state)).toBe('Dodge');await page.waitForTimeout(500);
 await page.keyboard.press('Backquote');await expect(page.locator('#debug')).toBeVisible();
 await page.locator('[data-action="sp"]').click();expect(await page.evaluate(()=>window.trinity.sim.player.sp)).toBe(100);
 await page.locator('#quality').selectOption('low');expect(await page.evaluate(()=>window.trinity.view.quality)).toBe('low');
 await page.locator('#debug-hitboxes').check();expect(await page.evaluate(()=>window.trinity.view.showHitboxes)).toBe(true);
 await page.locator('#debug-hitboxes').uncheck();await page.locator('#quality').selectOption('medium');
 await page.locator('#close-debug').click();await page.locator('#game').focus();
 await page.evaluate(()=>{window.trinity.sim.reset();window.trinity.sim.flags.freezeAI=true;window.trinity.view.camera.alpha=-Math.PI/2;});
 await page.waitForTimeout(600);
 await page.screenshot({path:'test-results/combat-lab.png'});
 const stats=await page.evaluate(()=>window.trinity.view.stats());writeFileSync('test-results/performance.json',JSON.stringify(stats,null,2));await info.attach('performance.json',{body:JSON.stringify(stats),contentType:'application/json'});
 await page.evaluate(()=>window.trinity.persist());await page.reload();await expect(page.locator('#begin')).toBeEnabled({timeout:30000});
 expect(await page.evaluate(()=>window.trinity.sim.counters.arts)).toBeGreaterThan(0);
 expect(errors).toEqual([]);
});
test('live enemy parry, dodge, Break, deaths, restart and focus pause',async({page})=>{
 await ready(page,true);expect(await page.evaluate(()=>window.trinity.view.backend)).toBe('WebGL');await setupClose(page);
 await page.evaluate(()=>{const s=window.trinity.sim;s.flags.freezeAI=false;s.enemies[0].until=0;});
 await page.waitForFunction(()=>{const s=window.trinity.sim,e=s.enemies[0];return e.pattern&&e.pattern.telegraph-(s.now-e.attackStart)<110;},null,{polling:'raf'});
 await page.keyboard.press('q');await expect.poll(()=>page.evaluate(()=>window.trinity.sim.counters.parries)).toBe(1);
 expect(await page.evaluate(()=>window.trinity.sim.player.sp)).toBe(14);
 await setupClose(page);await page.evaluate(()=>{const s=window.trinity.sim;s.flags.freezeAI=false;s.enemies[0].until=0;});
 await page.waitForFunction(()=>{const s=window.trinity.sim,e=s.enemies[0];return e.pattern&&e.pattern.telegraph-(s.now-e.attackStart)<180;},null,{polling:'raf'});
 await page.keyboard.press('Space');await page.waitForTimeout(250);expect(await page.evaluate(()=>window.trinity.sim.player.hp)).toBe(200);
 await setupClose(page);await page.evaluate(()=>{const s=window.trinity.sim;s.flags.freezeAI=false;s.enemies[0].until=0;s.enemies[0].nextPattern=1;});
 const parries=await page.evaluate(()=>window.trinity.sim.counters.parries);
 for(const at of [900,1500]){await page.waitForFunction(at=>{const s=window.trinity.sim,e=s.enemies[0];return e.pattern&&s.now-e.attackStart>at-110;},at,{polling:'raf'});await page.keyboard.press('q');await page.waitForTimeout(130);}
 expect(await page.evaluate(()=>window.trinity.sim.counters.parries)).toBe(parries+2);
 await page.evaluate(()=>{const s=window.trinity.sim;s.flags.freezeAI=true;s.state.reset();s.player.stamina=100;s.applyBreak(s.enemies[0],100);});
 await expect(page.locator('#enemy-state')).toContainText('BROKEN');
 await page.evaluate(()=>{const s=window.trinity.sim;s.enemies[0].hp=1;s.state.reset();s.player.x=0;s.player.z=0;s.enemies[0].z=2;s.player.yaw=0;});
 await page.keyboard.press('j');await expect.poll(()=>page.evaluate(()=>window.trinity.sim.enemies[0].hp)).toBe(0);
 await page.keyboard.press('r');expect(await page.evaluate(()=>window.trinity.sim.enemies[0].hp)).toBe(460);
 await page.evaluate(()=>{const s=window.trinity.sim;s.flags.freezeAI=false;s.player.hp=1;s.player.z=0;s.enemies[0].z=2;s.enemies[0].until=0;});
 await expect.poll(()=>page.evaluate(()=>window.trinity.sim.state.state),{timeout:5000}).toBe('Dead');
 await page.keyboard.press('r');expect(await page.evaluate(()=>window.trinity.sim.player.hp)).toBe(200);
 await page.keyboard.press('Escape');await expect(page.locator('#overlay')).toBeVisible();const now=await page.evaluate(()=>window.trinity.sim.now);await page.waitForTimeout(200);expect(await page.evaluate(()=>window.trinity.sim.now)).toBe(now);
});
test('1080p render benchmark and repeated reset remain stable',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1920,height:1080});await ready(page);
 await page.evaluate(()=>{window.trinity.sim.flags.invulnerable=true;window.trinity.view.setQuality('high');});
 const sample=await page.evaluate(async()=>{
  const samples:number[]=[];let previous=performance.now();
  for(let i=0;i<180;i++){await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));const now=performance.now();if(i>30)samples.push(now-previous);previous=now;}
  const sorted=[...samples].sort((a,b)=>a-b),mean=samples.reduce((a,b)=>a+b,0)/samples.length;
  return {...window.trinity.view.stats(),viewport:'1920x1080',quality:'high',meanFrameMs:mean,p95FrameMs:sorted[Math.floor(sorted.length*.95)],measuredFps:1000/mean};
 });
 writeFileSync('test-results/performance-1080p.json',JSON.stringify(sample,null,2));await info.attach('performance-1080p.json',{body:JSON.stringify(sample),contentType:'application/json'});
 for(let i=0;i<5;i++){await page.keyboard.press('r');await page.keyboard.press('Tab');await page.waitForTimeout(80);}
 expect(await page.evaluate(()=>window.trinity.sim.enemies.length)).toBe(1);
 expect(await page.evaluate(()=>window.trinity.view.assetErrors)).toEqual([]);
 await page.evaluate(()=>{window.trinity.sim.reset();window.trinity.sim.flags.freezeAI=true;});await page.waitForTimeout(500);
 await page.screenshot({path:'test-results/combat-lab-1080p.png'});
 expect(errors).toEqual([]);
});
test('player remaps controls, resolves conflicts, persists them and restores defaults',async({page})=>{
 await ready(page);await page.evaluate(()=>{window.trinity.sim.flags.freezeAI=true;});
 const initial=await page.evaluate(()=>window.trinity.sim.player.x);
 await page.keyboard.down('d');await page.waitForTimeout(250);await page.keyboard.up('d');expect(await page.evaluate(()=>window.trinity.sim.player.x)).toBeLessThan(initial-.4);
 await page.locator('#open-controls').click();await expect(page.locator('#controls-menu')).toBeVisible();
 const frozen=await page.evaluate(()=>window.trinity.sim.now);
 await page.getByRole('button',{name:'Parry primary binding',exact:true}).click();await page.keyboard.press('j');await expect(page.locator('#binding-status')).toContainText('already assigned');
 await page.keyboard.press('k');await expect(page.getByRole('button',{name:'Parry primary binding',exact:true})).toHaveText('K');
 await page.getByRole('button',{name:'Dodge primary binding',exact:true}).click();await page.mouse.down({button:'middle'});await page.mouse.up({button:'middle'});
 await expect(page.getByRole('button',{name:'Dodge primary binding',exact:true})).toHaveText('MMB');
 expect(await page.evaluate(()=>window.trinity.sim.now)).toBe(frozen);
 await page.locator('#controls-done').click();await page.locator('#begin').click();
 await page.keyboard.press('q');expect(await page.evaluate(()=>window.trinity.sim.state.state)).toBe('Idle');
 await page.keyboard.press('k');expect(await page.evaluate(()=>window.trinity.sim.state.state)).toBe('Parry');await page.waitForTimeout(450);
 await page.mouse.click(700,400,{button:'middle'});expect(await page.evaluate(()=>window.trinity.sim.state.state)).toBe('Dodge');
 await page.evaluate(()=>window.trinity.persist());await page.reload();await expect(page.locator('#begin')).toBeEnabled();
 await page.locator('#intro-controls').click();await expect(page.getByRole('button',{name:'Parry primary binding',exact:true})).toHaveText('K');
 await expect(page.getByRole('button',{name:'Dodge primary binding',exact:true})).toHaveText('MMB');
 await page.getByRole('button',{name:'Move forward primary binding',exact:true}).click();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Move forward primary binding',exact:true})).toHaveText('W');
 await page.screenshot({path:'test-results/controls-menu.png'});
 await page.locator('#bindings-defaults').click();await expect(page.getByRole('button',{name:'Parry primary binding',exact:true})).toHaveText('Q');
 await page.locator('#controls-done').click();await page.locator('#begin').click();await page.keyboard.press('q');expect(await page.evaluate(()=>window.trinity.sim.state.state)).toBe('Parry');
});
test('basics are untimed and Art cues align with musical deadlines and stop on pause',async({page})=>{
 await ready(page);await setupClose(page);await page.keyboard.down('j');
 await expect(page.locator('#timing')).toHaveCSS('opacity','0');
 expect(await page.evaluate(()=>window.trinity.audio.scheduledCueTimes.length)).toBe(0);
 await page.waitForTimeout(160);await page.screenshot({path:'test-results/timing-ring.png'});await page.keyboard.up('j');
 await expect.poll(()=>page.evaluate(()=>window.trinity.sim.state.state)).toBe('Idle');
 await page.evaluate(()=>window.trinity.sim.player.sp=100);await page.keyboard.press('1');
 await expect(page.locator('#timing-geometry')).toHaveClass(/art/);
 expect(await page.evaluate(()=>window.trinity.audio.scheduledCueTimes)).toContain(await page.evaluate(()=>window.trinity.sim.art.start+620));
 await page.waitForTimeout(170);await page.screenshot({path:'test-results/timing-square.png'});
 await page.keyboard.press('Escape');expect(await page.evaluate(()=>window.trinity.audio.scheduledCueTimes)).toEqual([]);
});


test('tutorial teaches basics and enemy warnings stop on pause',async({page})=>{
 await ready(page);await page.locator('header .tutorial-open').click();
 await expect(page.locator('#tutorial')).toBeVisible();
 for(let i=0;i<3;i++){await page.keyboard.press('j');await page.waitForTimeout(500);}
 await expect(page.locator('#tutorial-next')).toBeEnabled();
 expect(await page.evaluate(()=>window.trinity.sim.enemies[0].hp)).toBe(445);
 await page.locator('#tutorial-next').click();
 await expect(page.locator('#tutorial h2')).toHaveText('Dodge the sweep');
 await expect(page.locator('#defense-cue')).toBeVisible({timeout:5000});
 await expect(page.locator('#defense-cue')).toContainText('DODGE');
 expect(await page.evaluate(()=>window.trinity.audio.scheduledCueTimes.length)).toBeGreaterThan(0);
 await page.screenshot({path:'test-results/tutorial.png'});
 await page.keyboard.press('Escape');expect(await page.evaluate(()=>window.trinity.audio.scheduledCueTimes)).toEqual([]);
 await page.locator('#begin').click();await page.locator('#tutorial-exit').click();await expect(page.locator('#tutorial')).toBeHidden();
});


test('all tutorial lessons can be completed through combat',async({page})=>{
 await ready(page);await page.locator('header .tutorial-open').click();
 for(let i=0;i<3;i++){await page.keyboard.press('j');await page.waitForTimeout(500);}
 await page.locator('#tutorial-next').click();
 await page.waitForFunction(()=>{const s=window.trinity.sim,e=s.enemies[0];return e.pattern&&e.attackStart+e.pattern.hits[0]-s.now<180;},null,{polling:'raf'});
 await page.keyboard.press('Space');await expect(page.locator('#tutorial-next')).toBeEnabled();await page.locator('#tutorial-next').click();
 await page.waitForFunction(()=>{const s=window.trinity.sim,e=s.enemies[0];return e.pattern&&e.attackStart+e.pattern.hits[0]-s.now<110;},null,{polling:'raf'});
 await page.keyboard.press('q');await expect(page.locator('#tutorial-next')).toBeEnabled();await page.locator('#tutorial-next').click();
 await page.keyboard.press('1');await page.waitForFunction(()=>{const s=window.trinity.sim;return s.art&&s.now-s.art.start>600;},null,{polling:'raf'});await page.keyboard.press('j');
 await expect(page.locator('#tutorial-next')).toBeEnabled();await page.locator('#tutorial-next').click();
 await page.keyboard.press('1');await expect(page.locator('#tutorial-next')).toBeEnabled({timeout:5000});
 await page.locator('#tutorial-next').click();await expect(page.locator('#tutorial')).toBeHidden();expect(await page.evaluate(()=>window.trinity.sim.flags.freezeAI)).toBe(false);
});


test('enemy basics are animation-led and player Art suppresses competing cues',async({page})=>{
 await ready(page);await setupClose(page);
 await page.evaluate(()=>{const s=window.trinity.sim;s.flags.freezeAI=false;s.enemies[0].until=0;});
 await page.waitForFunction(()=>window.trinity.sim.enemies[0].pattern?.kind==='basic');
 await expect(page.locator('#defense-cue')).toBeHidden();expect(await page.evaluate(()=>window.trinity.audio.scheduledCueTimes)).toEqual([]);
 await page.evaluate(()=>{const s=window.trinity.sim;s.reset();s.player.z=0;s.enemies[0].z=2;s.enemies[0].nextPattern=1;s.enemies[0].until=0;s.player.sp=30;});
 await expect(page.locator('#defense-cue')).toBeVisible();await page.keyboard.press('1');
 await expect(page.locator('#defense-cue')).toBeHidden();await expect(page.locator('#timing')).toHaveCSS('opacity','1');
 expect(await page.evaluate(()=>window.trinity.audio.scheduledCueTimes.length)).toBe(2);
 await page.screenshot({path:'test-results/single-art.png'});
});


test('live counter risk compares neutral, failed and successful defense',async({page})=>{
 await ready(page);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const arrange=async()=>{await setupClose(page);await page.evaluate(()=>{const s=window.trinity.sim;s.flags.freezeAI=false;s.enemies[0].until=0;});};
 await arrange();await expect.poll(()=>page.evaluate(()=>window.trinity.sim.player.hp)).toBe(176);
 await arrange();await page.waitForFunction(()=>{const s=window.trinity.sim,e=s.enemies[0];const remaining=e.pattern?e.attackStart+e.pattern.hits[0]-s.now:Infinity;return remaining<360&&remaining>280;},null,{polling:'raf'});await page.keyboard.press('q');
 await expect.poll(()=>page.evaluate(()=>window.trinity.sim.player.hp)).toBe(164);await expect(page.locator('#notice')).toContainText('COUNTER FAILED');await page.screenshot({path:'test-results/counter-risk.png'});
 await arrange();await page.waitForFunction(()=>{const s=window.trinity.sim,e=s.enemies[0];return e.pattern&&e.attackStart+e.pattern.hits[0]-s.now<100;},null,{polling:'raf'});await page.keyboard.press('q');await expect.poll(()=>page.evaluate(()=>window.trinity.sim.player.sp)).toBe(14);expect(await page.evaluate(()=>window.trinity.sim.player.hp)).toBe(200);expect(errors).toEqual([]);
});

test('five-enemy audit benchmark stays bounded and renders without exceptions',async({page},info)=>{
 await ready(page);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(()=>{const s=window.trinity.sim;s.reset();s.flags.invulnerable=true;for(let i=0;i<8;i++)s.spawnEnemy();});
 expect(await page.evaluate(()=>window.trinity.sim.enemies.length)).toBe(5);
 const sample=await page.evaluate(async()=>{const frames:number[]=[];let previous=performance.now();for(let i=0;i<240;i++){await new Promise<void>(r=>requestAnimationFrame(()=>r()));const now=performance.now();if(i>60)frames.push(now-previous);previous=now;}frames.sort((a,b)=>a-b);return {...window.trinity.view.stats(),enemies:window.trinity.sim.enemies.length,meanFrameMs:frames.reduce((a,b)=>a+b,0)/frames.length,p95FrameMs:frames[Math.floor(frames.length*.95)]};});
 writeFileSync('test-results/audit-five-enemies.json',JSON.stringify(sample,null,2));await info.attach('five-enemies',{body:JSON.stringify(sample),contentType:'application/json'});await page.screenshot({path:'test-results/audit-five-enemies.png'});expect(errors).toEqual([]);
});
