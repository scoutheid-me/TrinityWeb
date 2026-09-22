import {test,expect} from '@playwright/test';
import {createTestCharacter} from '../uiHelpers';
test('weapon sweeps use current footprint angles and one-handed grips stay attached',async({page})=>{
 await page.goto('/?webgl');await createTestCharacter(page);
 for(const weapon of ['sword','rapier','greatsword']){
  await page.evaluate(id=>{const t=window.trinity;t.sim.reset();t.sim.weapon=id;t.view.update(t.sim,.016);},weapon);await expect.poll(()=>page.evaluate(()=>window.trinity.view.equippedWeapon)).toBe(weapon);
  const result=await page.evaluate(()=>{document.querySelector<HTMLElement>('#overlay')!.hidden=true;const t=window.trinity,s=t.sim,v=t.view;v.camera.alpha=.65;v.cameraDistance=4.2;s.pressAttack();const start=s.actionStart,contact=s.actionEnd;s.now=contact+100;s.state.set('BasicAttackActive');s.lastContact={at:contact,shape:s.weaponDefinition.shape};v.update(s,.016);const sword=v.player.sword,arm=v.player.rightArm,hand=arm.getDescendants().find((n:any)=>n.name.endsWith('right_hand'));sword.computeWorldMatrix(true);hand.computeWorldMatrix(true);const m=sword.getWorldMatrix().m,p=hand.getAbsolutePosition();return {gap:Math.hypot(p.x-m[8]*.08-m[12],p.y-m[9]*.08-m[13],p.z-m[10]*.08-m[14]),yaw:sword.rotationQuaternion.toEulerAngles().y,kind:s.weaponDefinition.shape.kind,half:s.weaponDefinition.shape.halfArc??0};});
  expect(result.gap).toBeLessThan(.01);if(result.kind==='box')expect(result.yaw).toBeCloseTo(0);else expect(Math.abs(result.yaw)).toBeLessThanOrEqual(result.half+.01);
  await page.screenshot({path:`test-results/pose-${weapon}.png`});
 }
});
