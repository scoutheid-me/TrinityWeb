import {test,expect} from '@playwright/test';
import {createTestCharacter} from '../uiHelpers';
test('authored Sentinel and Boar anticipation, contact and recovery render in both views',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?webgl');await createTestCharacter(page);
 for(const species of ['sentinel','boar'])for(const firstPerson of [false,true]){
  const rotations=await page.evaluate(async({species,firstPerson})=>{
   const t=window.trinity,s=t.sim;const {sentinelPatterns,boarPatterns}=await import(/* @vite-ignore */ String('/src/data/enemies.ts'));s.reset();s.spawnEnemy(species);s.player.z=0;const e=s.enemies[0];e.z=2.8;e.until=0;e.pattern=species==='boar'?boarPatterns[0]:sentinelPatterns[0];e.attackStart=0;e.state='Telegraph';s.lockedId=e.id;
   if(t.view.firstPerson!==firstPerson)t.view.togglePerspective();document.getElementById('overlay')!.hidden=true;const out=[];
   for(const now of [700,1000,1700,2220]){s.now=now;t.view.update(s,.016);t.view.scene.render();out.push(t.view.actors.get(e.id).root.rotation.x);}return out;
  },{species,firstPerson});
  expect(Math.abs(rotations[0]-rotations[1])).toBeGreaterThan(.1);expect(Math.abs(rotations[3])).toBeLessThan(.01);
  await page.evaluate(()=>{const t=window.trinity;t.sim.now=950;t.view.update(t.sim,.016);t.view.scene.render();});await page.screenshot({path:`test-results/${species}-${firstPerson?'first':'third'}-polish.png`});
 }
 expect(errors).toEqual([]);
});

