import {arts} from '../data/arts';
import {challenges,canStart,type ChallengeId,type MasteryChoice} from '../progression/guild';
import type {CombatSimulation} from '../combat/simulation';

/** Paused training board; gameplay outcomes alone unlock its collection. */
export class GuildBoard {
  panel=document.createElement('section');tracker=document.createElement('aside');seenResult=0;
  get visible(){return !this.panel.hidden;}
  constructor(private sim:CombatSimulation,private pause:(value:boolean)=>void,private persist:()=>void){
    this.panel.id='guild-board';this.panel.hidden=true;this.tracker.id='trial-tracker';this.tracker.hidden=true;
    document.getElementById('ui')!.append(this.panel,this.tracker);
  }
  open(){this.pause(true);document.getElementById('overlay')!.hidden=true;this.panel.hidden=false;this.render();this.panel.scrollTop=0;}
  close(){this.panel.hidden=true;this.pause(false);}
  observe(){
    const e=this.sim.encounter,s=e.stats;this.tracker.hidden=!e.active;
    if(e.active)this.tracker.textContent=`${challenges[e.challenge!].name} · ${e.challenge==='positioning'?`${s.basicHits}/3 hits · ${s.evades}/1 evade`:e.challenge==='breaking'?`${s.artHits}/1 Art hit · ${s.breaks}/1 Break`:e.challenge==='countering'?`${s.parries}/3 counters`:`${s.defeats}/2 defeated`}${e.eligible?'':' · PRACTICE ONLY'}`;
    if(e.id!==this.seenResult&&(e.result==='completed'||e.result==='failed')){
      this.seenResult=e.id;this.sim.reset();this.persist();this.open();
    }
  }
  render(){
    const sim=this.sim,p=sim.progression,e=sim.encounter,s=e.stats;
    const rewardId=e.challenge?challenges[e.challenge].reward:null,reward=rewardId?arts[rewardId]:null;
    this.panel.innerHTML=`<div class="guild-sheet"><div class="guild-heading"><div><small>TRINITY / TRAINING GUILD</small><h1>The path of the blade</h1></div><button id="guild-close">${e.active?'Resume challenge':'Return to hall'}</button></div>
    <p>Practice. Earn an Art. Shape your four-slot build. Challenges use standard attributes and no practice modifiers.</p>
    ${e.result==='completed'||e.result==='failed'?`<section class="guild-result"><h2>${e.result==='failed'?'Trial interrupted — you fell':e.eligible?'Challenge complete':'Practice complete · no rewards'}</h2>${e.result==='completed'&&e.eligible&&reward?`<div class="guild-reward"><small>${challenges[e.challenge!].name.toUpperCase()} · ${e.rewardNew?'ART ACQUIRED':'ART ALREADY LEARNED'}</small><h2>${reward.name}</h2><p>${reward.description}</p><p>${reward.cost} SP · Hold its equipped slot button, then release as the squares meet. Perfect: full damage and Break. Good: 60%. Miss: no attack, SP spent.</p><strong>Equip it below in an empty slot to use it.</strong></div>`:''}<p>${e.reason||'Progress is saved automatically. Replays never duplicate unlocks.'}</p><p>${s.parries} perfect counters · ${s.failedCounters} failed counters · ${Math.round(s.damageTaken)} damage taken · ${s.breaks} Breaks · ${s.perfect+s.good}/${s.artPhases} timed Art inputs</p></section>`:''}
    <div class="guild-columns"><section><h2>Guild challenges</h2>${(Object.keys(challenges) as ChallengeId[]).map(id=>{const c=challenges[id];return `<article><h3>${p.completed.includes(id)?'✓ ':''}${c.name}</h3><p>${c.description}</p><div class="challenge-reward">${c.reward?`<strong>Reward · ${arts[c.reward].name}</strong><p>${arts[c.reward].description}</p><small>${arts[c.reward].cost} SP · Hold / release to charge</small>`:'Prove your four-slot build'}</div><button data-challenge="${id}" ${canStart(p,id)?'':'disabled'}>${canStart(p,id)?p.completed.includes(id)?'Replay':'Begin':'Complete previous challenge'}</button></article>`;}).join('')}</section>
    <section><h2>Combat Art collection</h2>${Object.values(arts).map(a=>`<article class="${p.learned[a.id]?'learned':'locked'}"><h3>${a.name} <small>${p.learned[a.id]?'LEARNED':'LOCKED'}</small></h3><p>${a.description}</p><small>${a.cost} SP · ${a.weapon} · hold / timed release</small></article>`).join('')}
    <h2>Your four slots</h2><p>Equip unique learned Arts between challenges. Empty slots are allowed.</p><div class="guild-slots">${sim.loadout.map((id,i)=>`<label>Slot ${i+1}<select data-equip="${i}" ${e.active?'disabled':''}><option value="">Empty</option>${Object.values(arts).filter(a=>p.learned[a.id]).map(a=>`<option value="${a.id}" ${id===a.id?'selected':''}>${a.name}</option>`).join('')}</select></label>`).join('')}</div><button id="guild-equip" ${e.active?'disabled':''}>Save loadout</button><p id="guild-message" role="status"></p>
    <h2>Crescent mastery · ${p.masterySources.length}/2</h2><p>Complete two different challenges with a landed Good or Perfect Crescent Break. Each challenge grants one credit; replay to earn a missing credit.</p><div class="guild-mastery">${([['recovery','Swift recovery','200 ms recovery'],['break','Heavy commitment','35% more Break · 460 ms recovery']] as const).map(([id,name,detail])=>`<button data-mastery="${id}" aria-pressed="${p.masteryChoice===id}" ${p.masterySources.length<2||e.active?'disabled':''}>${name}<small>${detail}</small></button>`).join('')}</div><small>Choose one modifier. You may change it between challenges.</small></section></div></div>`;
    this.panel.querySelector<HTMLButtonElement>('#guild-close')!.onclick=()=>this.close();
    this.panel.querySelectorAll<HTMLButtonElement>('[data-challenge]').forEach(b=>b.onclick=()=>{if(sim.beginChallenge(b.dataset.challenge as ChallengeId))this.close();});
    this.panel.querySelector<HTMLButtonElement>('#guild-equip')!.onclick=()=>{const ids=[...this.panel.querySelectorAll<HTMLSelectElement>('[data-equip]')].map(el=>el.value||null);const ok=sim.equipLoadout(ids);this.panel.querySelector('#guild-message')!.textContent=ok?'Loadout saved.':'Choose unique learned Arts and finish your current action or challenge first.';if(ok)this.persist();};
    this.panel.querySelectorAll<HTMLButtonElement>('[data-mastery]').forEach(b=>b.onclick=()=>{if(!e.active&&p.masterySources.length>=2){p.masteryChoice=b.dataset.mastery as MasteryChoice;this.persist();this.render();}});
  }
}
