import type {CombatSimulation,CombatEvent} from '../combat/simulation';
import {bindingText,type Bindings} from '../input/bindings';

/** Replayable practice; completion requires an actual combat outcome. */
export class CombatTutorial {
  panel=document.createElement('section');
  active=false; step=0; completed=false;
  private flags:CombatSimulation['flags']|null=null;
  constructor(private sim:CombatSimulation,private bindings:()=>Bindings,private resume:()=>void){
    this.panel.id='tutorial';this.panel.hidden=true;document.querySelector('#ui')!.append(this.panel);
  }
  start(){if(!this.active)this.flags={...this.sim.flags};this.active=true;this.step=0;this.prepare();}
  exit(){this.active=false;this.panel.hidden=true;if(this.flags)Object.assign(this.sim.flags,this.flags);this.sim.reset();this.resume();}
  prepare(){
    const s=this.sim;s.reset();s.flags.invulnerable=false;s.flags.infiniteSp=false;s.flags.freezeAI=this.step===0||this.step===3||this.step===4;
    s.player.z=0;s.enemies[0].z=2;s.lockedId=s.enemies[0].id;s.faceTarget();
    s.enemies[0].nextPattern=this.step===1?3:0;
    if(this.step>=3)s.player.sp=100;
    if(this.step===4)s.enemies[0].break=80;
    this.completed=false;this.panel.hidden=false;this.render();this.resume();
  }
  observe(events:CombatEvent[]){
    if(!this.active)return;
    const s=this.sim;
    // Repeat only the pattern taught by the current defense lesson.
    if(this.step===1||this.step===2)s.enemies[0].nextPattern=this.step===1?3:0;
    const done=this.step===0?s.player.sp>=30:this.step===1?events.some(e=>e.text==='Evaded'):this.step===2?events.some(e=>e.type==='parry'):this.step===3?events.some(e=>e.type==='hit'&&e.target!=='player'&&(e.grade==='Good'||e.grade==='Perfect')):events.some(e=>e.type==='break');
    if(done&&!this.completed){this.completed=true;s.flags.freezeAI=true;this.render();}
    if(s.player.hp<=0){this.panel.querySelector('p')!.textContent='You fell. Retry this lesson to restore health and practice the same pattern.';}
  }
  render(){
    const k=(a:Parameters<typeof bindingText>[1])=>bindingText(this.bindings(),a);
    const lessons=[
      ['Quick attacks & SP',`Tap ${k('attack')} three times, allowing each swing to recover. No hold or timing test: each hit deals 5 damage at starting Strength and earns 10 SP. Whiffs earn nothing. ${k('lock')} locks your facing; movement controls position you within reach.`, 'Land basics to earn 30 SP.'],
      ['Dodge the sweep',`The low rising sound and red warning mean DODGE. Press ${k('dodge')} on the final cue, shortly before impact. Move sideways while dodging to escape. Dodges cost 24 stamina; invulnerability starts after 40 ms and ends at 330 ms. Red sweeps cannot be parried.`, 'Evade an incoming hit during dodge invulnerability.'],
      ['Perfect Parry',`Face the sentinel. Basic cleaves have no musical timing prompt: watch the sword lift and fall. Press ${k('parry')} as the blade falls, just before impact. Basics allow 260 ms; skills allow 170 ms to parry: zero damage, +14 SP, +32 Break. An early or late attempt can be hit. ${k('guard')} guards for reduced damage at a stamina cost.`, 'Perfect Parry one gold attack.'],
      ['Combat Arts & musical timing',`Practice SP is supplied. Press ${k('art1')} for Crescent Break (30 SP). Tap ${k('attack')} once when the moving square meets its outline and the bright note sounds. One input, one strike. Nonlethal hits do not cancel this committed Art, but still damage you. Perfect is ±55 ms; Good is ±120 ms. Misses are weaker. Basics remain untimed.`, 'Land a Good or Perfect Art strike.'],
      ['Break & the combat loop',`This sentinel starts at 80 Break. Use ${k('art1')} and one timed tap to fill the meter. At 100 Break the enemy staggers for 3.4 seconds and takes ×1.6 damage. In free combat: build SP with basics or parries, spend it on Arts, then punish the opening. Recover stamina between defenses.`, 'Break the sentinel.'],
    ];
    const [title,body,goal]=lessons[this.step];
    this.panel.innerHTML=`<small>COMBAT TUTORIAL · ${this.step+1} / ${lessons.length}</small><h2>${title}</h2><p>${body}</p><strong role="status">${this.completed?'Complete ✓':goal}</strong><div><button id="tutorial-retry">Retry lesson</button><button id="tutorial-next" ${this.completed?'':'disabled'}>${this.step===4?'Finish':'Next lesson'}</button><button id="tutorial-exit">Exit tutorial</button></div>`;
    this.panel.querySelector<HTMLButtonElement>('#tutorial-retry')!.onclick=()=>this.prepare();
    this.panel.querySelector<HTMLButtonElement>('#tutorial-next')!.onclick=()=>{if(this.step===4)this.exit();else{this.step++;this.prepare();}};
    this.panel.querySelector<HTMLButtonElement>('#tutorial-exit')!.onclick=()=>this.exit();
  }
}
