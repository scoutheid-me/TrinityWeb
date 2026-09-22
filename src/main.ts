import {GMMenu} from './ui/gm';
import {TrainingOrb} from './ui/trainingOrb';
import {createCharacter,renameSettings,GuildInvitation} from './ui/onboarding';
import {PersonalMenu} from './ui/personalMenu';
import {WeaponRack} from './ui/weaponRack';
import {LoadoutTray} from './ui/loadout';
import {installGlossary} from './ui/glossary';
import {GuildBoard} from './ui/guild';
import './style.css';
import './interface.css';
import './personal-interface.css';
import {CombatTutorial} from './ui/tutorial';
import {Matrix,Vector3} from '@babylonjs/core';
import {CombatSimulation} from './combat/simulation';
import {LabScene} from './engine/scene';
import {HUD} from './ui/hud';
import {GameInput} from './input/input';
import {ControlsMenu} from './ui/controls';
import {bindingText} from './input/bindings';
import {CombatAudio} from './audio/audio';
import {defaultSave,loadSave,saveGame,type SaveData} from './save/save';
import {validateArts} from './data/arts';

async function main(){
  validateArts();
  const sim=new CombatSimulation(),hud=new HUD(sim),audio=new CombatAudio();
  installGlossary();
  let save=defaultSave();
  try{save=await loadSave();}catch(error){console.warn('Local save unavailable; using session settings.',error);hud.notice('Local save unavailable — session mode');}
  sim.profile=save.profile;sim.autoFaceTarget=save.settings.autoFaceTarget;sim.weapon=save.weapon;sim.progression=save.progression;sim.attributes=save.attributes;sim.loadout=save.loadout;sim.counters=save.counters;sim.reset();
  for(const key of Object.keys(sim.attributes))hud.input(`stat-${key}`).value=String(sim.attributes[key as keyof typeof sim.attributes]);
  await createCharacter(sim.profile,async()=>{save.profile=structuredClone(sim.profile);try{await saveGame(save);}catch{hud.notice('Character saved for this session only.');}});
  const view=new LabScene(document.querySelector<HTMLCanvasElement>('#game')!);
  await view.init(sim.profile.character);view.togglePerspective();hud.root.classList.add('first-person');view.canvas.setAttribute('aria-label','Trinity first-person combat arena');view.setQuality(save.settings.quality);audio.enabled=save.settings.sound;audio.timingMusic=save.settings.timingMusic;view.update(sim,0.016);
  let paused=true,started=false,last=performance.now(),lastSave=last;
  const advance=()=>{const current=performance.now();if(!paused){if(hud.slowMotion)sim.invalidateRewards("Slow motion enabled");input.updateMovement();sim.update(Math.min(100,current-last)*(hud.slowMotion?.35:1));}last=current;};
  hud.root.classList.add('game-paused');
  const overlay=hud.el('overlay'),begin=hud.el('begin') as HTMLButtonElement;
  function setPaused(value:boolean){if(!value){const gm=document.getElementById('gm-menu');if(gm)gm.hidden=true;}if(controls&&!controls.panel.hidden){if(!value)return;controls.close();}advance();if(value&&guild?.visible){guild.panel.hidden=true;hud.root.classList.remove('journal-open');}paused=value;hud.root.classList.toggle('game-paused',value);input.enabled=!value;input.clear();audio.stopTiming();overlay.hidden=!value;if(value){begin.textContent=started?'Resume training':'Enter the Training Room';}else{view.canvas.focus();audio.unlock();started=true;}last=performance.now();}
  function requestPause(){if(!paused&&(sim.encounter.active||tutorial.active)&&sim.player.hp>0){hud.notice('Finish the trial before opening game settings.');return;}setPaused(!paused);}
  let orb:TrainingOrb|undefined;let rack:WeaponRack|undefined;let controls:ControlsMenu|undefined;let guild:GuildBoard|undefined;
  const input=new GameInput(sim,view,advance,()=>{if(orb&&!orb.panel.hidden){orb.close();return;}if(rack&&!rack.panel.hidden){rack.close();return;}const tray=document.getElementById('loadout-tray');if(tray&&!tray.hidden){tray.hidden=true;return;}guild?.visible?guild.close():requestPause();},()=>hud.toggleDebug(),()=>audio.unlock(),()=>{if(orb?.available)orb.open();else rack?.open();},()=>togglePersonalMenu());
  input.sensitivity=save.settings.sensitivity;input.bindings=save.settings.bindings;hud.setBindings(input.bindings);
  controls=new ControlsMenu(input,()=>setPaused(true),()=>{hud.setBindings(input.bindings);if(tutorial.active)tutorial.render();void persist();},()=>false);
  const autoFace=controls.panel.querySelector<HTMLInputElement>('#auto-face-target')!;autoFace.checked=sim.autoFaceTarget;autoFace.onchange=()=>{sim.autoFaceTarget=autoFace.checked;void persist();};
  for(const [id,parent] of [['open-controls',hud.root.querySelector('header')!],['intro-controls',hud.root.querySelector('.intro')!]] as const){const button=document.createElement('button');button.id=id;button.className='quiet';button.textContent='Controls';button.onclick=()=>controls!.open();parent.append(button);}
  const tutorial=new CombatTutorial(sim,()=>input.bindings,()=>setPaused(false),()=>{invitation.complete();void persist();});
  guild=new GuildBoard(sim,setPaused,()=>void persist(),()=>true);
  const perspective=document.createElement('button');perspective.id='perspective';perspective.className='quiet';perspective.textContent='Third person';perspective.setAttribute('aria-pressed','true');perspective.onclick=()=>{view.togglePerspective();perspective.textContent=view.firstPerson?'Third person':'First person';perspective.setAttribute('aria-pressed',String(view.firstPerson));document.getElementById('ui')!.classList.toggle('first-person',view.firstPerson);view.canvas.setAttribute('aria-label',view.firstPerson?'Trinity first-person combat arena':'Trinity third-person combat arena');hud.notice(view.firstPerson?'Hold '+bindingText(input.bindings,'orbit')+' or arrow keys to look · Tab locks facing':'Third-person view');if(guild?.visible)guild.open();view.update(sim,.016);perspective.blur();view.canvas.focus();};hud.root.querySelector('header')!.append(perspective);
  function togglePersonalMenu(){const open=hud.root.classList.toggle('personal-menu-open');if(!open){controls?.close();if(guild?.visible)guild.close();const tray=document.getElementById('loadout-tray');if(tray)tray.hidden=true;}view.canvas.focus();}
  const menuButton=document.createElement('button');menuButton.id='personal-menu-toggle';menuButton.textContent='M · Menu';menuButton.onclick=togglePersonalMenu;hud.root.querySelector('header')!.append(menuButton);
  const loadoutTray=new LoadoutTray(sim,()=>void persist());
  const invitation=new GuildInvitation(()=>{hud.root.classList.remove('personal-menu-open');tutorial.start();},()=>{hud.root.classList.add('personal-menu-open');personalMenu.open('arts');loadoutTray.open();});
  const personalMenu=new PersonalMenu(sim,id=>loadoutTray.open(id),()=>void persist());
  // Technical preferences belong to the paused system overlay, above the live artifact.
  hud.root.querySelector('.intro')!.append(hud.el('open-controls'),perspective);
  hud.el('intro-controls').hidden=true;
  orb=new TrainingOrb(sim,()=>input.bindings,()=>tutorial.start(true));
  rack=new WeaponRack(sim,()=>input.bindings,()=>void persist());
  const musicLabel=document.createElement('label');musicLabel.innerHTML='<input id="timing-music" type="checkbox"> Musical timing cues';hud.el('debug').append(musicLabel);
  hud.input('timing-music').checked=audio.timingMusic;hud.input('timing-music').onchange=()=>{audio.timingMusic=hud.input('timing-music').checked;audio.stopTiming();void persist();};
  begin.disabled=false;begin.textContent='Enter the Training Room';hud.el('load-status').textContent=`${view.backend} ready · Headphones recommended`;
  begin.onclick=()=>{const entering=!started;if(sim.player.hp<=0)sim.reset();setPaused(false);if(entering)hud.notice('Touch the entrance orb to begin the Guild Combat Trial.');};hud.el('menu').onclick=()=>requestPause();
  window.addEventListener('blur',()=>{if(started&&!paused)setPaused(true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&started&&!paused)setPaused(true);});
  hud.root.querySelectorAll<HTMLButtonElement>('[data-slot]').forEach(b=>{
    b.oncontextmenu=e=>e.preventDefault();
    b.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();if(!paused){advance();audio.unlock();sim.activateArt(Number(b.dataset.slot));b.setPointerCapture(e.pointerId);}b.blur();view.canvas.focus();};
    b.onpointerup=()=>{if(!paused){advance();sim.releaseArt(Number(b.dataset.slot));}b.blur();view.canvas.focus();};
    b.onpointercancel=()=>sim.cancelArtCharge();
  });
  hud.input('debug-hitboxes').onchange=()=>view.showHitboxes=hud.input('debug-hitboxes').checked;
  hud.input('debug-traces').onchange=()=>view.showTraces=hud.input('debug-traces').checked;
  (hud.el('quality') as HTMLSelectElement).value=save.settings.quality;
  hud.el('quality').onchange=()=>view.setQuality((hud.el('quality') as HTMLSelectElement).value as typeof view.quality);
  hud.input('sensitivity').value=String(input.sensitivity);hud.input('sensitivity').oninput=()=>input.sensitivity=Number(hud.input('sensitivity').value);
  hud.input('sound').checked=audio.enabled;hud.input('sound').onchange=()=>audio.enabled=hud.input('sound').checked;
  const preferences=document.createElement('details');preferences.className='system-preferences';preferences.innerHTML='<summary>Audio & graphics</summary>';hud.root.querySelector('.intro')!.append(preferences);
  for(const id of ['quality','sensitivity','sound','timing-music'])preferences.append(hud.el(id).closest('label')!);
  new GMMenu(sim);
  renameSettings(sim.profile,()=>void persist());
  async function persist(){const data:SaveData={version:3,profile:structuredClone(sim.profile),weapon:tutorial.persistentWeapon,progression:structuredClone(sim.progression),attributes:{...sim.attributes},loadout:[...tutorial.persistentLoadout],settings:{autoFaceTarget:tutorial.persistentAutoFace,quality:view.quality,sensitivity:input.sensitivity,sound:audio.enabled,timingMusic:audio.timingMusic,bindings:structuredClone(input.bindings)},counters:{...sim.counters}};try{await saveGame(data);}catch(error){console.warn('Could not save Trinity settings.',error);hud.notice('Could not save settings');}}
  window.addEventListener('pagehide',()=>void persist());
  view.engine.runRenderLoop(()=>{
    hud.root.classList.toggle('gm-mode',sim.gmMode);
    const before=sim.now;advance();const dt=Math.max(.001,(sim.now-before)/1000);
    audio.syncTiming(sim,paused,hud.slowMotion?.35:1);
    if(!paused){
      view.update(sim,dt);
      tutorial.observe(sim.events);
      for(const event of sim.events){view.effect(event,sim);hud.event(event);audio.event(event);
        if(event.type==='hit'){
          const pos=Vector3.Project(new Vector3(event.x,2,event.z),Matrix.IdentityReadOnly,view.scene.getTransformMatrix(),view.camera.viewport.toGlobal(view.engine.getRenderWidth(),view.engine.getRenderHeight()));
          const text=document.createElement('span');text.className=`damage-number ${event.target==='player'?'player':''}`;text.textContent=event.text;text.style.left=`${pos.x/view.engine.getRenderWidth()*innerWidth}px`;text.style.top=`${pos.y/view.engine.getRenderHeight()*innerHeight}px`;hud.el('damage-layer').append(text);setTimeout(()=>text.remove(),800);
        }
      }sim.events=[];
      if(sim.player.hp<=0){hud.notice(`You fell · Press ${bindingText(input.bindings,'reset')} to rise again`);}
    }
    menuButton.textContent=bindingText(input.bindings,'menu')+' · Menu';personalMenu.update();guild.observe();rack.update(!paused&&!guild.visible);orb.update(!paused&&!guild.visible);hud.update(view);view.scene.render();
    if(performance.now()-lastSave>5000){lastSave=performance.now();void persist();}
  });
  // Stable development-only automation surface: tests use the real simulation and renderer.
  if(import.meta.env.DEV){Object.assign(window,{trinity:{sim,view,input,hud,audio,controls,tutorial,guild,loadoutTray,rack,orb,personalMenu,invitation,pause:setPaused,persist,snapshot:()=>({state:sim.state.state,player:{...sim.player},enemies:sim.enemies.map(e=>({...e,hits:[...e.hits]})),counters:{...sim.counters},loadout:sim.loadout,stats:view.stats(),assets:view.loadedAssets,assetErrors:view.assetErrors,paused})}});}
}
main().catch(error=>{console.error('Trinity could not start.',error);const status=document.getElementById('load-status');if(status)status.textContent=`Startup failed: ${error instanceof Error?error.message:String(error)}. Try reloading with ?webgl.`;});
