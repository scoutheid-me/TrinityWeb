import {arts} from '../data/arts';
import {balance,chargeTime,physicalDamage} from '../data/balance';
import {weapons} from '../data/weapons';
import {nearWeaponRack} from '../data/room';
import {bindingText,type Bindings} from '../input/bindings';
import type {CombatSimulation} from '../combat/simulation';
export class WeaponRack {
 panel=document.createElement('section');prompt=document.createElement('button');
 constructor(private sim:CombatSimulation,private bindings:()=>Bindings,private persist:()=>void){
  this.panel.id='weapon-rack';this.panel.hidden=true;this.prompt.id='rack-prompt';this.prompt.hidden=true;
  document.getElementById('ui')!.append(this.panel,this.prompt);this.prompt.onclick=()=>this.open();
 }
 get available(){return nearWeaponRack(this.sim.player)&&this.sim.free&&!this.sim.encounter.active&&!this.sim.practiceMode&&this.sim.player.hp>0;}
 close(){this.panel.hidden=true;}
 update(active:boolean){this.prompt.hidden=!active||!this.available||!this.panel.hidden;this.prompt.textContent=`${bindingText(this.bindings(),'interact')} · Inspect weapon rack`;if(!active||!this.available)this.close();}
 open(){if(!this.available)return;this.panel.hidden=false;this.render();}
 render(){this.panel.innerHTML=`<div class="tray-heading"><h2>Guild weapon rack</h2><button id="rack-close" aria-label="Close weapon rack">×</button></div><p>Choose a training weapon. Step away to close.</p>${Object.values(weapons).map(w=>`<button class="rack-choice" data-weapon="${w.id}" aria-pressed="${this.sim.weapon===w.id}"><b>${w.name}</b><span>${w.description}</span><span class="weapon-stats">${Math.round(physicalDamage(w.damage,this.sim.attributes.strength))} damage (${w.damage} base) · ${Math.round(chargeTime(this.sim.attributes.dexterity)*w.startup/87)+balance.basic.active+w.recovery} ms attack cycle<br>${w.startup} ms nominal wind-up · ${w.recovery} ms recovery<br>${w.shape.range} m reach · ${w.shape.kind==='sector'?Math.round(w.shape.halfArc*360/Math.PI)+'° fan':w.shape.kind==='box'?(w.shape.halfWidth*2).toFixed(2)+' m lane':'radial'} · ${w.maxTargets??'All'} target${w.maxTargets===1?'':'s'}<br>${w.break} Break · ${Math.round((1-w.guard)*100)}% guard reduction${w.practiceArt?'<br>Practice Art: '+arts[w.practiceArt].name:''}</span><small>${this.sim.weapon===w.id?'Equipped':'Take weapon'}</small></button>`).join('')}<p role="status" id="rack-status">Incompatible Arts are unequipped. Specialty practice Arts are learned when taking their weapon; equip them in Menu → Skills. Attack cycle includes wind-up, 140 ms contact and recovery.</p>`;
  this.panel.querySelector<HTMLButtonElement>('#rack-close')!.onclick=()=>this.close();
  this.panel.querySelectorAll<HTMLButtonElement>('[data-weapon]').forEach(b=>b.onclick=()=>{if(this.available&&this.sim.setWeapon(b.dataset.weapon!)){const art=this.sim.weaponDefinition.practiceArt;if(art)this.sim.progression.learned[art]='rack practice';this.persist();this.render();document.getElementById('rack-status')!.textContent='Equipped · '+this.sim.weaponDefinition.name;}else this.close();});
 }
}
