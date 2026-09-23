import type {Profile} from '../progression/profile';
import {cleanName} from '../progression/profile';
export async function createCharacter(profile:Profile,save:()=>Promise<void>){
 if(profile.created)return;
 const intro=document.querySelector<HTMLElement>('.intro')!;intro.hidden=true;
 const panel=document.createElement('section');panel.id='character-creation';panel.className='onboarding-card';
 panel.innerHTML=`<small>TRINITY · A NEW ADVENTURE</small><h1>Create your character</h1><p>Choose your name and character. Both choices have the same combat abilities.</p><form><label for="creation-name">Your name</label><input id="creation-name" maxlength="24" required autocomplete="off" placeholder="Enter a name"><fieldset><legend>Character</legend><label class="character-choice"><input type="radio" name="character" value="man" required><svg viewBox="0 0 100 110" aria-hidden="true"><circle cx="50" cy="25" r="13"/><path d="M35 18Q50 0 65 18V24H35M30 45L70 45 80 75 70 78 62 58 62 80 66 105H53L50 84 47 105H34L38 80 38 58 30 78 20 75Z"/></svg><b>Man</b></label><label class="character-choice"><input type="radio" name="character" value="woman" required><svg viewBox="0 0 100 110" aria-hidden="true"><path d="M34 25Q30 3 50 5Q72 3 68 34L75 51 63 48 60 30Z"/><circle cx="50" cy="25" r="12"/><path d="M35 44L65 44 76 75 68 78 59 55 59 74 66 105H53L50 84 47 105H34L41 74 41 55 32 78 24 75Z"/></svg><b>Woman</b></label></fieldset><button type="submit">Create character</button><p id="creation-status" role="status">Your name can be changed later in game settings.</p></form>`;
 const name=panel.querySelector<HTMLInputElement>('#creation-name')!;name.value=profile.name==='Wayfarer'?'':profile.name;
 document.querySelector('#overlay')!.append(panel);name.focus();
 await new Promise<void>(resolve=>{panel.querySelector('form')!.onsubmit=async e=>{e.preventDefault();if(!name.value.trim()){name.setCustomValidity('Please enter your character name.');name.reportValidity();return;}const selected=panel.querySelector<HTMLInputElement>('input[name="character"]:checked');if(!selected)return;
 profile.name=cleanName(name.value);profile.character=selected.value==='woman'?'woman':'man';profile.created=true;
 panel.querySelector<HTMLButtonElement>('button')!.disabled=true;await save();panel.remove();intro.hidden=false;resolve();};name.oninput=()=>name.setCustomValidity('');});
}
export function renameSettings(profile:Profile,save:()=>void){
 const form=document.createElement('form');form.className='rename-settings';form.innerHTML='<label for="settings-name">Character name</label><div><input id="settings-name" maxlength="24" required><button>Save name</button></div><small id="rename-status" role="status"></small>';form.querySelector<HTMLInputElement>('input')!.value=profile.name;
 form.onsubmit=e=>{e.preventDefault();const input=form.querySelector<HTMLInputElement>('input')!;profile.name=cleanName(input.value);input.value=profile.name;save();form.querySelector('small')!.textContent='Name saved.';};document.querySelector('.intro')!.append(form);
}
export class GuildInvitation {
 panel=document.createElement('section');
 constructor(private start:()=>void,private skills:()=>void){this.panel.id='guild-invitation';this.panel.hidden=true;this.panel.setAttribute('role','dialog');this.panel.setAttribute('aria-labelledby','invitation-title');document.querySelector('#ui')!.append(this.panel);}
 show(completed:boolean){this.panel.hidden=false;this.panel.innerHTML=`<div class="onboarding-card"><small>WARDEN ILYRA · GUILD HALL</small><h2 id="invitation-title">Guild Combat Trial</h2><p>Welcome to the Training Room. Will you take the Guild’s combat induction?</p><p>Learn basic attacks, dodging, perfect counters, charged Combat Arts and Break.</p><div class="challenge-reward"><b>${completed?'Already learned:':'Completion reward:'} Linear</b><p>Hold to charge, then release. Perfect drives a long 6 m piercing dash through the target; Good deals 60% damage and travels 1 m. Miss fails the Art.</p></div><button id="accept-guild-challenge">${completed?'Practice again':'Accept challenge'}</button><button id="decline-guild-challenge">Not now</button><small>You can return through the entrance orb in the Training Room.</small></div>`;
 this.panel.querySelector<HTMLButtonElement>('#accept-guild-challenge')!.onclick=()=>{this.panel.hidden=true;this.start();};this.panel.querySelector<HTMLButtonElement>('#decline-guild-challenge')!.onclick=()=>this.panel.hidden=true;
 }
 complete(){this.panel.hidden=false;this.panel.innerHTML='<div class="onboarding-card"><small>GUILD COMBAT TRIAL COMPLETE</small><h2 id="invitation-title">Linear learned</h2><p>Ilyra: You have earned your first travelling blade form.</p><p><b>Perfect:</b> full weapon-scaled damage and a 6 m piercing dash, often ending behind your target.</p><p><b>Good:</b> 60% damage and a short 1 m thrust, usually stopping in front. <b>Miss:</b> no hit or dash; SP is spent.</p><p>25 SP · hold 680 ms · Perfect ±55 ms · Good ±120 ms</p><button id="reward-linear-equip">Open equipped Arts</button><button id="reward-linear-close">Continue training</button></div>';
 this.panel.querySelector<HTMLButtonElement>('#reward-linear-equip')!.onclick=()=>{this.panel.hidden=true;this.skills();};this.panel.querySelector<HTMLButtonElement>('#reward-linear-close')!.onclick=()=>this.panel.hidden=true;
 }
}
