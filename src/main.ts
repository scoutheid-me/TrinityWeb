import './style.css';
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
  let save=defaultSave();
  try{save=await loadSave();}catch(error){console.warn('Local save unavailable; using session settings.',error);hud.notice('Local save unavailable — session mode');}
  sim.attributes=save.attributes;sim.loadout=save.loadout;sim.counters=save.counters;sim.reset();
  for(const key of Object.keys(sim.attributes))hud.input(`stat-${key}`).value=String(sim.attributes[key as keyof typeof sim.attributes]);
  const view=new LabScene(document.querySelector<HTMLCanvasElement>('#game')!);
  await view.init();view.setQuality(save.settings.quality);audio.enabled=save.settings.sound;audio.timingMusic=save.settings.timingMusic;view.update(sim,0.016);
  let paused=true,started=false,last=performance.now(),lastSave=last;
  const advance=()=>{const current=performance.now();if(!paused){input.updateMovement();sim.update(Math.min(100,current-last)*(hud.slowMotion?.35:1));}last=current;};
  const overlay=hud.el('overlay'),begin=hud.el('begin') as HTMLButtonElement;
  function setPaused(value:boolean){if(controls&&!controls.panel.hidden)return;advance();paused=value;input.enabled=!value;input.clear();audio.stopTiming();overlay.hidden=!value;if(value){begin.textContent=started?'Resume training':'Enter the hall';}else{view.canvas.focus();audio.unlock();started=true;}last=performance.now();}
  let controls:ControlsMenu|undefined;
  const input=new GameInput(sim,view,advance,()=>setPaused(!paused),()=>hud.toggleDebug(),()=>audio.unlock());
  input.sensitivity=save.settings.sensitivity;input.bindings=save.settings.bindings;hud.setBindings(input.bindings);
  controls=new ControlsMenu(input,()=>setPaused(true),()=>{hud.setBindings(input.bindings);if(tutorial.active)tutorial.render();void persist();});
  for(const [id,parent] of [['open-controls',hud.root.querySelector('header')!],['intro-controls',hud.root.querySelector('.intro')!]] as const){const button=document.createElement('button');button.id=id;button.className='quiet';button.textContent='Controls';button.onclick=()=>controls!.open();parent.append(button);}
  const tutorial=new CombatTutorial(sim,()=>input.bindings,()=>setPaused(false));
  for(const parent of [hud.root.querySelector('header')!,hud.root.querySelector('.intro')!]){const b=document.createElement('button');b.className='quiet tutorial-open';b.textContent='Combat tutorial';b.onclick=()=>tutorial.start();parent.append(b);}
  const musicLabel=document.createElement('label');musicLabel.innerHTML='<input id="timing-music" type="checkbox"> Musical timing cues';hud.el('debug').append(musicLabel);
  hud.input('timing-music').checked=audio.timingMusic;hud.input('timing-music').onchange=()=>{audio.timingMusic=hud.input('timing-music').checked;audio.stopTiming();void persist();};
  begin.disabled=false;begin.textContent='Enter the hall';hud.el('load-status').textContent=`${view.backend} ready · Headphones recommended`;
  begin.onclick=()=>{if(sim.player.hp<=0)sim.reset();setPaused(false);};hud.el('menu').onclick=()=>setPaused(true);
  window.addEventListener('blur',()=>{if(started&&!paused)setPaused(true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&started&&!paused)setPaused(true);});
  hud.root.querySelectorAll<HTMLButtonElement>('[data-slot]').forEach(b=>b.onclick=()=>{if(!paused){advance();sim.activateArt(Number(b.dataset.slot));}b.blur();view.canvas.focus();});
  hud.input('debug-hitboxes').onchange=()=>view.showHitboxes=hud.input('debug-hitboxes').checked;
  hud.input('debug-traces').onchange=()=>view.showTraces=hud.input('debug-traces').checked;
  (hud.el('quality') as HTMLSelectElement).value=save.settings.quality;
  hud.el('quality').onchange=()=>view.setQuality((hud.el('quality') as HTMLSelectElement).value as typeof view.quality);
  hud.input('sensitivity').value=String(input.sensitivity);hud.input('sensitivity').oninput=()=>input.sensitivity=Number(hud.input('sensitivity').value);
  hud.input('sound').checked=audio.enabled;hud.input('sound').onchange=()=>audio.enabled=hud.input('sound').checked;
  async function persist(){const data:SaveData={version:2,attributes:{...sim.attributes},loadout:[...sim.loadout],settings:{quality:view.quality,sensitivity:input.sensitivity,sound:audio.enabled,timingMusic:audio.timingMusic,bindings:structuredClone(input.bindings)},counters:{...sim.counters}};try{await saveGame(data);}catch(error){console.warn('Could not save Trinity settings.',error);hud.notice('Could not save settings');}}
  window.addEventListener('pagehide',()=>void persist());
  view.engine.runRenderLoop(()=>{
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
    hud.update(view);view.scene.render();
    if(performance.now()-lastSave>5000){lastSave=performance.now();void persist();}
  });
  // Stable development-only automation surface: tests use the real simulation and renderer.
  if(import.meta.env.DEV){Object.assign(window,{trinity:{sim,view,input,hud,audio,controls,tutorial,pause:setPaused,persist,snapshot:()=>({state:sim.state.state,player:{...sim.player},enemies:sim.enemies.map(e=>({...e,hits:[...e.hits]})),counters:{...sim.counters},loadout:sim.loadout,stats:view.stats(),assets:view.loadedAssets,assetErrors:view.assetErrors,paused})}});}
}
main().catch(error=>{console.error('Trinity could not start.',error);const status=document.getElementById('load-status');if(status)status.textContent=`Startup failed: ${error instanceof Error?error.message:String(error)}. Try reloading with ?webgl.`;});
