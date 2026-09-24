import {playtestBuild} from '../release';
import {actions,actionLabels,assignBinding,bindingLabel,defaultBindings,type Action} from '../input/bindings';
import type {GameInput} from '../input/input';

export class ControlsMenu {
  panel=document.createElement('section');
  capture:{action:Action;slot:0|1}|null=null;
  constructor(private input:GameInput,private pause:()=>void,private changed:()=>void,private live:()=>boolean=()=>false){
    this.panel.id='controls-menu';this.panel.hidden=true;this.panel.setAttribute('role','dialog');this.panel.setAttribute('aria-modal','true');this.panel.setAttribute('aria-labelledby','controls-heading');
    this.panel.innerHTML=`<div class="controls-card"><div class="controls-heading"><div><span>MAKE IT YOURS</span><h2 id="controls-heading">Controls</h2></div><button id="controls-close" aria-label="Close controls">×</button></div><p>Choose a binding, then press a key or mouse button. Escape cancels capture and always remains available to pause.</p><div id="binding-status" role="status">Changes save automatically. Movement directions have been corrected.</div><label class="camera-setting"><input type="checkbox" id="auto-face-target"> Automatically face locked target (both views)</label><div class="binding-columns"><span>ACTION</span><span>PRIMARY</span><span>ALTERNATE</span></div><div id="binding-rows"></div><div class="controls-footer"><button id="bindings-defaults">Restore defaults</button><button id="controls-done">Done</button></div></div>`;
    document.querySelector('#ui')!.append(this.panel);
    this.panel.querySelector('#controls-close')!.addEventListener('click',()=>this.close());
    this.panel.querySelector('#controls-done')!.addEventListener('click',()=>this.close());
    this.panel.querySelector('#bindings-defaults')!.addEventListener('click',()=>{this.capture=null;input.bindings=defaultBindings();this.changed();this.render();this.status('Default controls restored.');});
    window.addEventListener('keydown',e=>{
      if(this.panel.hidden)return;
      if(this.capture){e.preventDefault();e.stopImmediatePropagation();if(e.code==='Escape'){this.capture=null;this.input.suspended=!this.live();this.render();this.status('Binding cancelled.');}else if(!e.repeat){if(e.ctrlKey||e.altKey||e.metaKey)this.status('Use a single key without Ctrl, Alt, or the Windows key.');else this.bind(e.code);}return;}
      if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.close();}
      if(e.code==='Tab'){
        const items=[...this.panel.querySelectorAll<HTMLButtonElement>('button')],index=items.indexOf(document.activeElement as HTMLButtonElement);
        if((e.shiftKey&&index<=0)||(!e.shiftKey&&index===items.length-1)){e.preventDefault();items[e.shiftKey?items.length-1:0].focus();}
      }
    },true);
    window.addEventListener('pointerdown',e=>{if(!this.capture)return;e.preventDefault();e.stopImmediatePropagation();this.bind(`Mouse${e.button}`);},true);
    this.panel.addEventListener('contextmenu',e=>e.preventDefault());
    this.render();
  }
  status(text:string){this.panel.querySelector('#binding-status')!.textContent=text;}
  open(){if(!this.live())this.pause();this.panel.classList.toggle('personal-live',this.live());this.panel.setAttribute('aria-modal',String(!this.live()));this.input.suspended=!this.live();this.input.clear();this.panel.hidden=false;this.render();(this.panel.querySelector('#controls-close') as HTMLButtonElement).focus();}
  close(){this.capture=null;this.panel.hidden=true;this.input.suspended=false;this.input.clear();document.querySelector<HTMLButtonElement>('#open-controls')?.focus();}
  private bind(code:string){
    if(!this.capture)return;const {action,slot}=this.capture,result=assignBinding(this.input.bindings,action,slot,code);
    if(result.error){this.status(result.error);return;}
    this.input.bindings=result.bindings;this.capture=null;this.input.suspended=!this.live();this.input.clear();this.changed();this.render();this.status(`${actionLabels[action]} → ${bindingLabel(code)}. Saved.`);
    this.panel.querySelector<HTMLButtonElement>(`[data-bind="${action}:${slot}"]`)?.focus();
  }
  render(){
    const rows=this.panel.querySelector('#binding-rows')!;rows.replaceChildren();
    for(const action of actions){if(playtestBuild&&action==='debug')continue;
      const row=document.createElement('div');row.className='binding-row';const label=document.createElement('span');label.textContent=actionLabels[action];row.append(label);
      for(const slot of [0,1] as const){
        const cell=document.createElement('div'),button=document.createElement('button'),clear=document.createElement('button');cell.className='binding-cell';
        button.dataset.bind=`${action}:${slot}`;button.setAttribute('aria-label',`${actionLabels[action]} ${slot?'alternate':'primary'} binding`);
        button.textContent=this.capture?.action===action&&this.capture.slot===slot?'Press input…':bindingLabel(this.input.bindings[action][slot]);
        button.classList.toggle('listening',this.capture?.action===action&&this.capture.slot===slot);
        button.onclick=()=>{this.capture={action,slot};this.input.suspended=true;this.input.clear();this.render();this.status(`Listening for ${actionLabels[action]}. Escape cancels.`);};
        clear.textContent='×';clear.setAttribute('aria-label',`Clear ${actionLabels[action]} ${slot?'alternate':'primary'}`);
        clear.onclick=()=>{this.input.bindings[action][slot]=null;this.capture=null;this.changed();this.render();this.status('Binding cleared. Escape can always pause.');};
        cell.append(button,clear);row.append(cell);
      }rows.append(row);
    }
  }
}
