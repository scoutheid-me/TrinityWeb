import {arts} from '../data/arts';
import {skillCard} from './skillCard';
import type {CombatSimulation} from '../combat/simulation';
/** Selected skill details and direct slot assignment, inside the live personal menu. */
export class LoadoutTray {
 panel=document.createElement('section');selected='';
 constructor(private sim:CombatSimulation,private persist:()=>void){this.panel.id='loadout-tray';this.panel.hidden=true;document.getElementById('ui')!.append(this.panel);}
 open(id?:string){this.selected=id&&this.sim.progression.learned[id]?id:Object.keys(this.sim.progression.learned)[0];this.render();this.panel.hidden=false;}
 render(){const s=this.sim,a=arts[this.selected];if(!a)return;const compatible=a.weapon==='any'||a.weapon===s.weapon;
 this.panel.innerHTML=`<div class="tray-heading"><h2>${a.name}</h2><button id="tray-close" aria-label="Close skill details">×</button></div><div class="skill-detail-body">${skillCard(a,s).replace('<details ', '<details open ')}</div><p class="subtle">${compatible?'Equip in a slot · moves an already equipped skill.':'Requires '+a.weapon+' · visit the weapon rack.'}</p><div class="skill-equip-slots">${s.loadout.map((id,i)=>`<button data-equip-slot="${i}" ${compatible?'':'disabled'} aria-pressed="${id===a.id}"><small>SLOT ${i+1}</small><span>${id?arts[id].name:'Empty'}</span></button>`).join('')}</div><p id="quick-status" role="status"></p>`;
 this.panel.querySelector<HTMLButtonElement>('#tray-close')!.onclick=()=>this.panel.hidden=true;
 this.panel.querySelectorAll<HTMLButtonElement>('[data-equip-slot]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.equipSlot),ids=s.loadout.map(id=>id===a.id?null:id);ids[i]=a.id;const ok=s.equipLoadout(ids);if(ok){this.persist();this.render();}this.panel.querySelector('#quick-status')!.textContent=ok?'Equipped in slot '+(i+1)+'.':'Finish your current action or trial before equipping.';});
 }
}
