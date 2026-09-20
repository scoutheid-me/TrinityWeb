import {arts} from '../data/arts';
import {weapons} from '../data/weapons';
import {skillCard} from './skillCard';
import type {CombatSimulation} from '../combat/simulation';
/** Direct HUD equipment editing. It never suspends the simulation. */
export class LoadoutTray {
 panel=document.createElement('section');slot=0;
 constructor(private sim:CombatSimulation,private persist:()=>void){this.panel.id='loadout-tray';this.panel.hidden=true;document.getElementById('ui')!.append(this.panel);}
 open(slot=0){this.slot=slot;this.render();this.panel.hidden=false;}
 render(){const sim=this.sim;this.panel.innerHTML=`<div class="tray-heading"><h2>Combat Arts</h2><button id="tray-close" aria-label="Close Art editor">×</button></div><p class="subtle">World live · change equipment between trials, while idle.</p><label>Weapon rack<select id="rack-weapon">${Object.values(weapons).map(w=>`<option value="${w.id}" ${sim.weapon===w.id?'selected':''}>${w.name}</option>`).join('')}</select></label><p>${sim.weaponDefinition.description}</p><div class="tray-tabs">${sim.loadout.map((id,i)=>`<button data-edit-slot="${i}" aria-pressed="${this.slot===i}">${i+1} · ${id?arts[id].name:'Empty'}</button>`).join('')}</div><label>Slot ${this.slot+1}<select id="quick-art"><option value="">Empty</option>${Object.values(arts).filter(a=>sim.progression.learned[a.id]&&(a.weapon==='any'||a.weapon===sim.weapon)).map(a=>`<option value="${a.id}" ${sim.loadout[this.slot]===a.id?'selected':''}>${a.name}</option>`).join('')}</select></label><button id="quick-equip">Equip in slot ${this.slot+1}</button><p id="quick-status" role="status"></p><div id="quick-card">${sim.loadout[this.slot]?skillCard(arts[sim.loadout[this.slot]!],sim):''}</div><a href="/data/skill-bank.json" download="trinity-skill-bank.json">Download skill bank</a>`;
 this.panel.querySelector<HTMLButtonElement>('#tray-close')!.onclick=()=>this.panel.hidden=true;
 this.panel.querySelectorAll<HTMLButtonElement>('[data-edit-slot]').forEach(b=>b.onclick=()=>{this.slot=Number(b.dataset.editSlot);this.render();});
 this.panel.querySelector<HTMLSelectElement>('#quick-art')!.onchange=e=>{const id=(e.target as HTMLSelectElement).value;this.panel.querySelector('#quick-card')!.innerHTML=id?skillCard(arts[id],sim):'';};
 this.panel.querySelector<HTMLButtonElement>('#quick-equip')!.onclick=()=>{const ids=[...sim.loadout];ids[this.slot]=(this.panel.querySelector('#quick-art') as HTMLSelectElement).value||null;const ok=sim.equipLoadout(ids);this.panel.querySelector('#quick-status')!.textContent=ok?'Equipped.':'Finish your current action/trial, and choose a unique learned Art.';if(ok){const tab=this.panel.querySelectorAll('[data-edit-slot]')[this.slot];if(tab)tab.textContent=(this.slot+1)+' · '+(ids[this.slot]?arts[ids[this.slot]!].name:'Empty');this.persist();}};
 this.panel.querySelector<HTMLSelectElement>('#rack-weapon')!.onchange=e=>{if(sim.setWeapon((e.target as HTMLSelectElement).value)){this.persist();this.render();}else{(e.target as HTMLSelectElement).value=sim.weapon;this.panel.querySelector('#quick-status')!.textContent='Finish your action or trial before changing weapon.';}};
 }
}
