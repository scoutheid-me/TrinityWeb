import type {CombatSimulation} from '../combat/simulation';
import {arts} from '../data/arts';
import {physicalDamage} from '../data/balance';

/** Screen-space personal artifact: the world and camera remain live in first person. */
export class PersonalMenu {
 panel=document.createElement('section');
 private weapon='';private loadout='';
 constructor(private sim:CombatSimulation,editArts:()=>void){
   this.panel.id='personal-artifact';this.panel.setAttribute('aria-label','Character equipment');
   this.panel.innerHTML=`<div class="artifact-title">Wayfarer <small>CHARACTER / EQUIPMENT</small></div>
   <div class="equipment-body"><svg viewBox="0 0 260 280" role="img" aria-label="Character silhouette with equipment sockets">
   <ellipse cx="130" cy="252" rx="43" ry="5" fill="#526169" opacity=".18"/>
   <g class="body-silhouette"><circle cx="130" cy="65" r="13"/><path d="M116 82 Q130 77 144 82 L155 132 151 159 142 131 142 165 155 245 137 245 130 188 123 245 105 245 118 165 118 131 109 159 105 132Z"/></g>
   <g class="equipment-lines" fill="none"><path d="M130 46V28 M116 101 73 69H48 M144 101 187 69H212 M114 134 64 120H33 M146 134 196 120H227 M118 159 69 182H43 M142 159 191 182H217 M118 222 70 237H51 M142 222 190 237H209"/>
   ${[[130,28],[48,69],[212,69],[33,120],[227,120],[43,182],[217,182],[51,237],[209,237]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8"/><circle cx="${x}" cy="${y}" r="4" class="socket"/>`).join('')}</g></svg>
   <button class="equipment-hotspot weapon-hotspot" aria-label="Inspect equipped weapon" title="Inspect equipped weapon">◇</button>
   <button class="equipment-hotspot armor-hotspot" aria-label="Inspect training attire" title="Inspect training attire">◇</button></div>
   <div class="equipment-description" aria-live="polite"><small>EQUIPPED WEAPON</small><h2 id="personal-weapon"></h2><p id="personal-weapon-stats"></p><details><summary>Weapon details</summary><p id="personal-weapon-description"></p><p>Change weapons at the training room rack.</p></details></div>
   <div class="personal-attire" hidden><small>TRAINING ATTIRE</small><h2>Wayfarer’s uniform</h2><p>Starter training clothes. Cosmetic equipment; no armor bonus.</p></div>
   <button class="personal-art-edit">Combat Arts <span>›</span></button><div id="personal-art-list"></div>`;
   document.querySelector('#ui')!.append(this.panel);
   const character=document.createElement('button');character.id='character-menu';character.className='quiet';character.dataset.icon='♟';character.textContent='Character';character.setAttribute('aria-label','Character menu');
   const branch=document.createElement('nav');branch.id='character-branch';branch.setAttribute('aria-label','Character categories');branch.innerHTML='<button class="selected" data-category="equipment">◇ &nbsp; Equipment</button><button data-category="arts">⚔ &nbsp; Combat Arts</button>';
   document.querySelector('header')!.append(character);document.querySelector('#ui')!.append(branch);
   const expand=()=>{branch.classList.add('expanded');character.setAttribute('aria-expanded','true');};
   character.onpointerenter=expand;character.onfocus=expand;character.onclick=()=>{branch.classList.toggle('expanded');character.setAttribute('aria-expanded',String(branch.classList.contains('expanded')));};
   branch.querySelector<HTMLButtonElement>('[data-category="equipment"]')!.onclick=()=>{this.panel.querySelector<HTMLDetailsElement>('details')!.open=true;};
   branch.querySelector<HTMLButtonElement>('[data-category="arts"]')!.onclick=editArts;
   this.panel.querySelector<HTMLButtonElement>('.personal-art-edit')!.onclick=editArts;
   for(const [selector,armor] of [['.weapon-hotspot',false],['.armor-hotspot',true]] as const){
     const b=this.panel.querySelector<HTMLButtonElement>(selector)!;
     b.onclick=()=>{(this.panel.querySelector('.personal-attire') as HTMLElement).hidden=!armor;(this.panel.querySelector('.equipment-description') as HTMLElement).hidden=armor;};
   }
   const labels:[string,string,string][]=[['#menu','Ⅱ','Pause'],['#open-controls','⚙','Options'],['.tutorial-open','?','Induction'],['.guild-open','⌖','Guild journal'],['#perspective','◉','Camera']];
   for(const [selector,icon,label] of labels){
     const b=document.querySelector<HTMLButtonElement>('header '+selector)!;b.dataset.icon=icon;b.title=label;
     b.addEventListener('pointerenter',()=>b.classList.add('expanded'));
     b.addEventListener('pointerenter',()=>{branch.classList.remove('expanded');character.setAttribute('aria-expanded','false');});
     b.addEventListener('focus',()=>{branch.classList.remove('expanded');character.setAttribute('aria-expanded','false');});
     b.addEventListener('pointerleave',()=>b.classList.remove('expanded'));
   }
 }
 update(){
   const w=this.sim.weaponDefinition,key=w.id+this.sim.attributes.strength;
   if(this.weapon!==key){this.weapon=key;this.panel.querySelector('#personal-weapon')!.textContent=w.name;
     this.panel.querySelector('#personal-weapon-stats')!.textContent=`${Math.round(physicalDamage(w.damage,this.sim.attributes.strength))} damage · ${w.shape.range} m reach`;
     this.panel.querySelector('#personal-weapon-description')!.textContent=w.description;
   }
   const keyArts=this.sim.loadout.join('|');if(this.loadout!==keyArts){this.loadout=keyArts;this.panel.querySelector('#personal-art-list')!.replaceChildren(...this.sim.loadout.map((id,i)=>{const row=document.createElement('span');row.textContent=`${i+1} · ${id?arts[id].name:'Empty'}`;return row;}));}
 }
}
