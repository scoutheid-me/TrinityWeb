import type {CombatSimulation,CombatEvent} from '../combat/simulation';
import {bindingText,type Bindings} from '../input/bindings';

/** Replayable practice; completion requires an actual combat outcome. */
export class CombatTutorial {
  panel=document.createElement('section');
  active=false; step=0; completed=false;
  private guided=false;private facingSetting=true;
  private weapon='sword';
  private loadout:(string|null)[]|null=null;
  private flags:CombatSimulation['flags']|null=null;
  constructor(private sim:CombatSimulation,private bindings:()=>Bindings,private resume:()=>void,private finish:()=>void=()=>{}){
    this.panel.id='tutorial';this.panel.hidden=true;document.querySelector('#ui')!.append(this.panel);
  }
  get persistentAutoFace(){return this.active?this.facingSetting:this.sim.autoFaceTarget;}
  get persistentWeapon(){return this.active?this.weapon:this.sim.weapon;}
  get persistentLoadout(){return this.active&&this.loadout?this.loadout:this.sim.loadout;}
  start(guided=false){if(this.sim.gmMode){this.sim.emit('notice','Exit GM mode before starting the Guild Combat Trial.');return;}if(!this.active){this.facingSetting=this.sim.autoFaceTarget;this.weapon=this.sim.weapon;this.flags={...this.sim.flags};this.loadout=[...this.sim.loadout];}this.sim.practiceMode=true;this.sim.loadout=['focused-strike',null,null,null];this.active=true;this.guided=guided;if(guided)this.sim.autoFaceTarget=true;this.step=guided?-2:0;this.prepare();}
  exit(){this.sim.autoFaceTarget=this.facingSetting;this.sim.practiceMode=false;this.sim.weapon=this.weapon;if(this.loadout)this.sim.loadout=this.loadout;this.active=false;this.panel.hidden=true;if(this.flags)Object.assign(this.sim.flags,this.flags);this.sim.reset();this.resume();}
  prepare(){
    const s=this.sim;s.reset();s.spawnEnemy();s.flags.invulnerable=false;s.flags.infiniteSp=false;s.flags.freezeAI=this.step<=0||this.step===3||this.step===4;
    s.player.z=0;s.enemies[0].z=2;s.lockedId=s.enemies[0].id;s.faceTarget();
    s.enemies[0].nextPattern=this.step===1?3:0;
    if(this.step>=3)s.player.sp=100;
    if(this.step===4)s.enemies[0].break=88;
    if(this.step===-2)s.lockedId=null;this.completed=false;this.panel.hidden=false;this.render();this.resume();
  }
  observe(events:CombatEvent[]){
    if(!this.active)return;
    const s=this.sim;if(!s.enemies.length){this.prepare();return;}
    // Repeat only the pattern taught by the current defense lesson.
    if(this.step===1||this.step===2)s.enemies[0].nextPattern=this.step===1?3:0;
    const done=this.step===-2?!!s.target:this.step===-1?!!s.target&&Math.abs(s.player.x)>.8:this.step===0?s.player.sp>=30:this.step===1?events.some(e=>e.text==='Evaded'):this.step===2?events.some(e=>e.type==='parry'):this.step===3?events.some(e=>e.type==='hit'&&e.target!=='player'&&(e.grade==='Good'||e.grade==='Perfect')):events.some(e=>e.type==='break');
    if(done&&!this.completed){this.completed=true;s.flags.freezeAI=true;this.render();}
    if(s.player.hp<=0){this.panel.querySelector('p')!.textContent='You fell. Retry this lesson to restore health and practice the same pattern.';}
  }
  private renderOrientation(k:(a:Parameters<typeof bindingText>[1])=>string){
    const lock=this.step===-2;
    this.panel.innerHTML=`<small>GUILD COMBAT TRIAL · ${lock?1:2} / 7</small><h2>${lock?'Target your opponent':'Move around your target'}</h2><p>${lock?'Press '+k('lock')+' to lock onto the Sentinel. The camera frames its body; '+k('switchTarget')+' cycles opponents, or unlocks if no other target is nearby.':'Hold '+k('left')+' or '+k('right')+' to move sideways while locked on. Your character and camera keep facing the target. Auto-facing can be disabled in Settings.'}</p><strong role="status">${this.completed?'Complete ✓':lock?'Lock onto the Sentinel.':'Move at least 0.8 m sideways while locked on.'}</strong><div><button id="tutorial-next" ${this.completed?'':'disabled'}>Next lesson</button><button id="tutorial-exit">Exit tutorial</button></div>`;
    this.panel.querySelector<HTMLButtonElement>('#tutorial-next')!.onclick=()=>{this.step++;this.prepare();};this.panel.querySelector<HTMLButtonElement>('#tutorial-exit')!.onclick=()=>this.exit();
  }
  render(){
    const k=(a:Parameters<typeof bindingText>[1])=>bindingText(this.bindings(),a);
    const lessons=[
      ['Quick attacks & SP',`Tap ${k('attack')} three times, allowing each swing to recover. No hold or timing test: each hit deals 5 damage at starting Strength and earns 10 SP. Whiffs earn nothing. ${k('lock')} locks your facing; movement controls position you within reach.`, 'Land basics to earn 30 SP.'],
      ['Dodge the sweep',`The low rising sound and red warning mean DODGE. Press ${k('dodge')} on the final cue, shortly before impact. Move sideways while dodging to escape. Dodges cost 24 stamina; invulnerability starts after 40 ms and ends at 330 ms. Red sweeps cannot be countered.`, 'Evade an incoming hit during dodge invulnerability.'],
      ['Perfect Counter',`Face the sentinel. Listen for the rising five-note melody and press on its final chord. Watch the sword lift and fall as well; audio is optional. Press ${k('parry')} as the blade falls, just before impact. Basics allow 260 ms; skills allow 170 ms to counter: zero incoming damage, a 2× weapon-base counter hit, +14 SP, +32 Break. An attack that catches your failed counter deals 50% EXTRA damage, including red sweeps or attacks from behind. After 430 ms the commitment ends. Pressing after damage cannot undo the hit. ${k('guard')} guards for reduced damage at a stamina cost.`, 'Perfect Counter one gold attack.'],
      ['Combat Arts & musical timing',`Practice SP is supplied. Hold ${k('art1')} to charge Focused Strike (15 SP). Release that same button when the squares meet and the bright note sounds. Perfect releases give full damage and Break; Good releases give 60%; early release or holding too long completely fails and spends the SP. Cyan shows your actual attack area, moving with the released lunge. Nonlethal hits do not cancel this committed Art, but still damage you. Perfect is ±55 ms; Good is ±120 ms. Misses do not strike. Basics remain untimed.`, 'Land a Good or Perfect Art strike.'],
      ['Break & the combat loop',`This sentinel starts at 88 Break. Hold ${k('art1')} and release at the bright note to fill the meter. At 100 Break the enemy staggers for 3.4 seconds and takes ×1.6 damage. In free combat: build SP with basics or counters, spend it on Arts, then punish the opening. Recover stamina between defenses.`, 'Break the sentinel.'],
    ];
    if(this.step<0){this.renderOrientation(k);return;}
    if(this.guided){lessons[2]=['Counter timing',`Listen to the rising melody; press ${k('parry')} on the final chord, just before impact. A Perfect Counter takes zero damage and builds SP. Your Perfect Counter automatically returns a counter hit at 2× weapon base damage, scaled by Strength. Follow up during the opening. A mistimed counter takes 50% extra damage.`, 'Perfect Counter to damage the attacker.'];}
    const [title,body,goal]=lessons[this.step];
    const brief=['Tap '+k('attack')+' to build SP.','Step clear with '+k('dodge')+' as the sweep arrives.','Face the blade. Press '+k('parry')+' just before contact.','Hold '+k('art1')+'. Release when the squares meet.','Fill the Break meter, then punish the opening.'][this.step];
    this.panel.innerHTML=`<small>GUILD COMBAT TRIAL · ${this.step+1+(this.guided?2:0)} / ${lessons.length+(this.guided?2:0)}</small><h2>${title}</h2><p class="lesson-brief">${brief}</p><details class="nested-info"><summary>Ilyra’s lesson · controls & timing</summary><p>${body}</p></details>${this.step===4?'<details class="nested-info"><summary>Beyond training · Skill Books</summary><p>Skill Books open themed skill trees. Advance through their branches by learning earlier forms and meeting practice or quest requirements. A small Lantern Road Forms primer is planned as the final reward of the future tutorial dungeon. Preview its four nodes in Menu → Character → Skills. This induction awards Linear; the book is a future dungeon reward, not a second set of training trials.</p></details>':''}<strong role="status">${this.completed?'Complete ✓':goal}</strong><div><button id="tutorial-retry">Retry lesson</button><button id="tutorial-next" ${this.completed?'':'disabled'}>${this.step===4?'Complete challenge':'Next lesson'}</button><button id="tutorial-exit">Exit tutorial</button></div>`;
    this.panel.querySelector<HTMLButtonElement>('#tutorial-retry')!.onclick=()=>this.prepare();
    this.panel.querySelector<HTMLButtonElement>('#tutorial-next')!.onclick=()=>{if(this.step===4&&this.completed){this.sim.progression.tutorialCompleted=true;this.sim.progression.learned.linear='induction';this.exit();this.sim.emit('notice','INDUCTION COMPLETE · Linear learned. Equip it in Menu → Character → Skills.');this.finish();}else{this.step++;this.prepare();}};
    this.panel.querySelector<HTMLButtonElement>('#tutorial-exit')!.onclick=()=>this.exit();
  }
}
