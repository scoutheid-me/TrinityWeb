import type {CombatSimulation} from '../combat/simulation';
import type {LabScene} from '../engine/scene';
import {actions,defaultBindings,movementIntent,type Action} from './bindings';
export class GameInput {
  keys=new Set<string>(); sensitivity=1; enabled=false; suspended=false; dragging=false; pointerX=0; pointerY=0;
  bindings=defaultBindings();
  constructor(private sim:CombatSimulation,private view:LabScene,private sync:()=>void,private togglePause:()=>void,private toggleDebug:()=>void,private unlock:()=>void){
    window.addEventListener('keydown',e=>{
      if(this.suspended)return;
      if(e.code==='Escape'){e.preventDefault();if(!e.repeat)this.togglePause();return;}
      if((e.target as HTMLElement).closest('input,select,button,textarea'))return;
      const action=this.actionFor(e.code);if(!action||e.ctrlKey||e.altKey||e.metaKey)return;
      e.preventDefault();if(e.repeat)return;this.down(e.code);
    });
    window.addEventListener('keyup',e=>this.up(e.code));
    view.canvas.addEventListener('pointerdown',e=>{
      if(!this.enabled||this.suspended)return;e.preventDefault();view.canvas.focus();
      this.pointerX=e.clientX;this.pointerY=e.clientY;this.down(`Mouse${e.button}`);
    });
    window.addEventListener('pointerup',e=>this.up(`Mouse${e.button}`));
    window.addEventListener('pointermove',e=>{
      const dx=e.clientX-this.pointerX,dy=e.clientY-this.pointerY;this.pointerX=e.clientX;this.pointerY=e.clientY;
      if(!this.enabled||this.suspended||!this.held('orbit'))return;
      this.view.camera.alpha-=dx*.004*this.sensitivity;this.view.camera.beta=Math.max(.4,Math.min(1.4,this.view.camera.beta+dy*.003*this.sensitivity));
    });
    view.canvas.addEventListener('contextmenu',e=>e.preventDefault());
    view.canvas.addEventListener('wheel',e=>{e.preventDefault();if(this.enabled&&!this.suspended)view.cameraDistance=Math.max(3.5,Math.min(11,view.cameraDistance+e.deltaY*.005));},{passive:false});
    window.addEventListener('blur',()=>this.clear());
  }
  actionFor(code:string):Action|undefined{return actions.find(action=>this.bindings[action].includes(code));}
  held(action:Action){return this.bindings[action].some(code=>code!==null&&this.keys.has(code));}
  private down(code:string){
    if(this.suspended)return;const action=this.actionFor(code);if(!action)return;
    if(action==='pause'){this.togglePause();return;}if(action==='debug'){this.toggleDebug();return;}
    if(!this.enabled)return;this.sync();this.unlock();const already=this.held(action);this.keys.add(code);this.updateMovement();if(already)return;
    if(action==='attack')this.sim.pressAttack();if(action==='dodge')this.sim.dodge();if(action==='parry')this.sim.parry();
    if(action==='lock')this.sim.toggleLock();if(action==='switchTarget')this.sim.toggleLock(true);if(action==='reset')this.sim.reset();
    if(action.startsWith('art'))this.sim.activateArt(Number(action.at(-1))-1);
    this.dragging=this.held('orbit');
  }
  private up(code:string){
    const wasHeld=this.keys.has(code);this.sync();this.keys.delete(code);
    const action=this.actionFor(code);if(wasHeld&&action?.startsWith('art')&&!this.held(action)&&this.enabled&&!this.suspended)this.sim.releaseArt(Number(action.at(-1))-1);
    if(wasHeld&&this.actionFor(code)==='attack'&&!this.held('attack')&&this.enabled&&!this.suspended)this.sim.releaseAttack();
    this.dragging=this.held('orbit');this.updateMovement();
  }
  clear(){this.sim.cancelArtCharge();this.sim.cancelBufferedInput();this.keys.clear();this.dragging=false;this.sim.input={x:0,z:0,sprint:false,guard:false};}
  updateMovement(){
    if(!this.enabled||this.suspended){this.clear();return;}
    const forward=Number(this.held('forward'))-Number(this.held('backward')),right=Number(this.held('right'))-Number(this.held('left'));
    this.sim.input={...movementIntent(this.view.camera.alpha,forward,right),sprint:this.held('sprint'),guard:this.held('guard')};
  }
}
