export const actionLabels = {
  forward: 'Move forward', backward: 'Move backward', left: 'Move left', right: 'Move right', sprint: 'Sprint',
  menu: 'Personal menu', interact: 'Interact', attack: 'Basic attack', dodge: 'Dodge', parry: 'Parry', guard: 'Guard',
  lock: 'Toggle lock', switchTarget: 'Switch target', art1: 'Combat Art 1', art2: 'Combat Art 2',
  art3: 'Combat Art 3', art4: 'Combat Art 4', orbit: 'Orbit camera (hold)', reset: 'Reset encounter', pause: 'Pause', debug: 'Lab tools',
} as const;
export type Action = keyof typeof actionLabels;
export type Bindings = Record<Action, [string | null, string | null]>;
export const actions = Object.keys(actionLabels) as Action[];
export function defaultBindings(): Bindings {
  return {forward:['KeyW',null],backward:['KeyS',null],left:['KeyA',null],right:['KeyD',null],sprint:['ShiftLeft','ShiftRight'],
    menu:['KeyM',null],interact:['KeyG',null],attack:['Mouse0','KeyJ'],dodge:['Space',null],parry:['KeyQ',null],guard:['KeyF',null],lock:['Tab',null],switchTarget:['KeyE',null],
    art1:['Digit1',null],art2:['Digit2',null],art3:['Digit3',null],art4:['Digit4',null],orbit:['Mouse2',null],reset:['KeyR',null],pause:['Escape',null],debug:['Backquote',null]};
}
export function supportedBinding(code: unknown): code is string {
  return typeof code === 'string' && /^(Key[A-Z]|Digit[0-9]|Numpad[0-9]|Numpad(Add|Subtract|Multiply|Divide|Decimal|Enter)|Arrow(Up|Down|Left|Right)|Shift(Left|Right)|Space|Tab|Escape|Backquote|Minus|Equal|BracketLeft|BracketRight|Backslash|Semicolon|Quote|Comma|Period|Slash|Enter|Backspace|Insert|Delete|Home|End|PageUp|PageDown|Mouse[0-2])$/.test(code);
}
export function bindingLabel(code: string | null): string {
  if(!code)return 'Unbound';
  const names:Record<string,string>={Mouse0:'LMB',Mouse1:'MMB',Mouse2:'RMB',Space:'Space',Escape:'Esc',Backquote:'`',ShiftLeft:'Left Shift',ShiftRight:'Right Shift',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→'};
  return names[code]??code.replace(/^Key|^Digit/,'').replace(/^Numpad/,'Num ');
}
export function bindingText(bindings:Bindings,action:Action){return bindings[action].filter(Boolean).map(bindingLabel).join(' / ')||'Unbound';}
export function assignBinding(bindings:Bindings,action:Action,slot:0|1,code:string):{bindings:Bindings;error?:string} {
  if(!supportedBinding(code)||(code==='Escape'&&action!=='pause'))return {bindings,error:'Use a letter, number, arrow, Shift, punctuation, or mouse button. Escape stays available to pause.'};
  for(const other of actions)for(let i=0;i<2;i++)if(bindings[other][i]===code&&(other!==action||i!==slot))return {bindings,error:`${bindingLabel(code)} is already assigned to ${actionLabels[other]}. Clear that binding first.`};
  return {bindings:{...bindings,[action]:bindings[action].map((value,i)=>i===slot?code:value)}};
}
export function validateBindings(raw:unknown):Bindings {
  if(!raw||typeof raw!=='object')return defaultBindings();
  const values=raw as Record<string,unknown>,result=defaultBindings(),used=new Set<string>();
  for(const action of actions){const pair=values[action]??(['interact','menu'].includes(action)?[Object.values(values).flat().includes(defaultBindings()[action][0])?null:defaultBindings()[action][0],null]:undefined);if(!Array.isArray(pair)||pair.length!==2)return defaultBindings();
    for(const code of pair){if(code===null)continue;if(!supportedBinding(code)||used.has(code)||(code==='Escape'&&action!=='pause'))return defaultBindings();used.add(code);}
    result[action]=[pair[0],pair[1]];
  }
  return result;
}
/** Correct handedness: the old lateral vector made A and D move in reverse on screen. */
export function movementIntent(alpha:number,forward:number,right:number){return {x:-Math.cos(alpha)*forward+Math.sin(alpha)*right,z:-Math.sin(alpha)*forward-Math.cos(alpha)*right};}
