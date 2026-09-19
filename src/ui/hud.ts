import {balance,chargeTime,type Attributes} from '../data/balance';
import {arts} from '../data/arts';
import type {CombatSimulation,CombatEvent} from '../combat/simulation';
import type {LabScene} from '../engine/scene';
import {bindingText,defaultBindings,type Bindings,type Action} from '../input/bindings';

export class HUD {
  root=document.querySelector<HTMLDivElement>('#ui')!;
  debugOpen=false;showTiming=true;performanceVisible=true;slowMotion=false;noticeUntil=0;
  bindings=defaultBindings();
  constructor(public sim:CombatSimulation){
    this.root.innerHTML=`
      <header><div class="wordmark">TRINITY<span>COMBAT · DISCOVERY · MASTERY</span></div><div class="location"><i></i> THE AETHER HALL <small>COMBAT LAB / 01</small></div><button id="menu" class="quiet">ESC <span>Pause</span></button></header>
      <section id="enemy-hud"><div class="enemy-title"><span>TRAINING CONSTRUCT</span><b>Aether Sentinel</b><small id="enemy-state">AWAITING CHALLENGER</small></div><div class="meter enemy"><i id="enemy-hp"></i></div><div class="break-row"><span>BREAK</span><div class="meter break"><i id="enemy-break"></i></div><small id="enemy-values"></small></div></section>
      <aside class="room-label"><span>GUILD TRAINING GROUNDS</span><h2>Learn the rhythm.<br>Find the opening.</h2><p>Build SP with quick strikes.<br>Spend it on something extraordinary.</p></aside>
      <div id="defense-cue" aria-live="off"><i></i><span></span></div><div id="notice" role="status"></div><div id="grade"></div><div id="lock-label">◇ LOCKED ON</div>
      <div id="timing"><span id="timing-title">RELEASE WHEN THE RINGS MEET</span><svg id="timing-geometry" viewBox="0 0 180 180" aria-label="Converging timing cue"><g class="ring-cue"><circle class="timing-good" cx="90" cy="90" r="32"/><circle class="timing-perfect" cx="90" cy="90" r="32"/><circle class="timing-target" cx="90" cy="90" r="32"/><circle id="incoming-ring" cx="90" cy="90" r="72"/></g><g class="square-cue"><rect class="timing-good" x="58" y="58" width="64" height="64"/><rect class="timing-perfect" x="58" y="58" width="64" height="64"/><rect class="timing-target" x="58" y="58" width="64" height="64"/><rect id="incoming-square" x="18" y="18" width="144" height="144"/></g><path class="timing-cross" d="M86 90h8 M90 86v8"/></svg><span id="timing-action"></span><div id="art-nodes"></div></div>
      <footer><section class="player-panel"><div class="player-name"><div class="crest">✧</div><div><small>WAYFARER</small><b>Initiate of the Hall</b></div></div><div class="resource"><label>HP</label><div class="meter hp"><i id="hp"></i></div><span id="hp-value"></span></div><div class="resource"><label>STA</label><div class="meter stamina"><i id="stamina"></i></div><span id="stamina-value"></span></div><div class="sp-row"><b id="sp-value">0</b><span> / 100 <small>SKILL POINTS</small></span><div class="meter sp"><i id="sp"></i></div></div></section>
      <section class="arts-panel"><div class="section-label">COMBAT ARTS <span>FOUR SLOTS. YOUR EXPRESSION.</span></div><div id="slots">${[0,1,2,3].map(i=>`<button class="art-slot" id="slot-${i}" data-slot="${i}"><kbd>${i+1}</kbd><div class="art-icon">${i===0?'☽':'◇'}</div><b>${i===0?'Crescent Break':'Empty slot'}</b><small>${i===0?'30 SP · ONE TIMED CUT':'UNEQUIPPED'}</small></button>`).join('')}</div></section>
      <section class="control-panel"><div><kbd>W A S D</kbd> Move <kbd>SHIFT</kbd> Sprint</div><div><kbd>LMB / J</kbd> Tap attack · build SP</div><div><kbd>SPACE</kbd> Dodge <kbd>Q</kbd> Parry</div><div><kbd>TAB</kbd> Lock <kbd>RMB</kbd> Orbit</div><div><kbd>F</kbd> Guard <kbd>R</kbd> Reset <kbd>\`</kbd> Lab tools</div></section></footer>
      <div id="performance"></div><div id="damage-layer"></div>
      <section id="overlay"><div class="intro"><span class="eyebrow">TRINITY / FIRST PLAYABLE</span><h1>The Aether Hall</h1><p>A blade. A sentinel. A rhythm worth learning.</p><div class="intro-rule"></div><p class="intro-help">Hold <b>left mouse / J</b>, then release at the flash.<br>Earn <b>30 SP</b>. Press <b>1</b> for Crescent Break.<br>Tap <b>left mouse / J</b> on its single pulse.<br>Read gold attacks. Parry with <b>Q</b>.<br>Red sweep? Dodge with <b>Space</b>.</p><button id="begin" disabled>Preparing the hall…</button><small id="load-status">Loading original Blender assets</small></div></section>
      <section id="debug" hidden><div class="debug-title">COMBAT LAB <button id="close-debug">×</button></div><small>Sandbox changes are deliberate cheats.</small><div class="debug-actions"><button data-action="heal">Heal</button><button data-action="sp">Refill SP</button><button data-action="reset">Reset encounter</button><button data-action="reset-enemy">Reset enemy</button><button data-action="spawn">Spawn sentinel</button><button data-action="kill">Kill enemies</button></div><div class="debug-flags">${[['invulnerable','Invulnerability'],['infiniteSp','Infinite SP'],['freezeAI','Freeze AI'],['hitboxes','Hit volumes'],['traces','Attack traces'],['timing','Timing guide'],['slow','Slow motion'],['performance','Performance']].map(([id,label])=>`<label><input type="checkbox" id="debug-${id}" ${id==='timing'||id==='performance'?'checked':''}>${label}</label>`).join('')}</div><div class="debug-stats">${['strength','dexterity','vitality','endurance'].map(key=>`<label>${key}<input id="stat-${key}" type="number" min="0" max="999" value="10"></label>`).join('')}<label>Enemy HP<input id="set-enemy-hp" type="number" min="0" max="5000" value="460"></label><label>Enemy Break<input id="set-enemy-break" type="number" min="0" max="100" value="0"></label></div><label>Quality<select id="quality"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select></label><label>Camera sensitivity<input id="sensitivity" type="range" min="0.25" max="3" step="0.05" value="1"></label><label><input id="sound" type="checkbox" checked>Sound</label><pre id="debug-state"></pre></section>`;
    this.el('close-debug').onclick=()=>this.toggleDebug();
    this.root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button=>button.onclick=()=>{
      switch(button.dataset.action){case 'heal':sim.player.hp=sim.hpMax;sim.player.stamina=sim.staminaMax;break;case 'sp':sim.player.sp=100;break;case 'reset':sim.reset();break;case 'reset-enemy':sim.resetEnemies();break;case 'spawn':sim.spawnEnemy();break;case 'kill':for(const e of sim.enemies){e.hp=0;e.state='Dead';e.pattern=null;}sim.lockedId=null;break;}
      button.blur();
    });
    for(const key of ['invulnerable','infiniteSp','freezeAI'] as const)this.input(`debug-${key}`).onchange=()=>sim.flags[key]=this.input(`debug-${key}`).checked;
    for(const key of Object.keys(sim.attributes) as (keyof Attributes)[])this.input(`stat-${key}`).onchange=()=>{sim.attributes[key]=Math.max(0,Math.min(999,Number(this.input(`stat-${key}`).value)||0));sim.player.hp=Math.min(sim.player.hp,sim.hpMax);sim.player.stamina=Math.min(sim.player.stamina,sim.staminaMax);};
    this.input('set-enemy-hp').onchange=()=>{for(const e of sim.enemies){e.hp=Math.max(0,Math.min(5000,Number(this.input('set-enemy-hp').value)||0));e.maxHp=Math.max(e.maxHp,e.hp);if(e.hp===0)e.state='Dead';else if(e.state==='Dead'){e.state='Idle';e.until=sim.now+1000;}}};
    this.input('set-enemy-break').onchange=()=>{for(const e of sim.enemies){e.break=0;sim.applyBreak(e,Number(this.input('set-enemy-break').value)||0);}};
    this.input('debug-timing').onchange=()=>this.showTiming=this.input('debug-timing').checked;
    this.input('debug-slow').onchange=()=>this.slowMotion=this.input('debug-slow').checked;
    this.input('debug-performance').onchange=()=>this.performanceVisible=this.input('debug-performance').checked;
    this.root.querySelectorAll<SVGElement>('.timing-perfect').forEach(shape=>shape.style.strokeWidth=String(balance.timing.perfect*.075*2));
    this.root.querySelectorAll<SVGElement>('.timing-good').forEach(shape=>shape.style.strokeWidth=String(balance.timing.good*.075*2));
  }
  el(id:string){return document.getElementById(id)!;}
  input(id:string){return this.el(id) as HTMLInputElement;}
  setBindings(bindings:Bindings){
    this.bindings=bindings;const key=(action:Action)=>bindingText(bindings,action);
    const panel=this.root.querySelector('.control-panel')!;
    panel.innerHTML=`<div><kbd>${key('forward')} ${key('left')} ${key('backward')} ${key('right')}</kbd> Move <kbd>${key('sprint')}</kbd> Sprint</div><div><kbd>${key('attack')}</kbd> Tap attack · build SP</div><div><kbd>${key('dodge')}</kbd> Dodge <kbd>${key('parry')}</kbd> Parry</div><div><kbd>${key('lock')}</kbd> Lock <kbd>${key('orbit')}</kbd> Orbit</div><div><kbd>${key('guard')}</kbd> Guard <kbd>${key('reset')}</kbd> Reset <kbd>${key('debug')}</kbd> Lab tools</div>`;
    for(let i=0;i<4;i++)this.el(`slot-${i}`).querySelector('kbd')!.textContent=key(`art${i+1}` as Action);
    this.el('menu').innerHTML=`${key('pause')} <span>Pause</span>`;
    this.root.querySelector('.intro-help')!.innerHTML=`Tap <b>${key('attack')}</b> for low damage and +10 SP on hit.<br>Earn <b>30 SP</b>. Press <b>${key('art1')}</b> for Crescent Break.<br>Tap <b>${key('attack')}</b> once as the square meets its outline.<br>Follow the musical lead-in; act on the bright note.<br>Failed parry: <b>50% extra damage</b>.<br>Perfect Parry with <b>${key('parry')}</b>: +14 SP, zero damage.<br>Red sweep? Dodge with <b>${key('dodge')}</b>.`;
  }
  toggleDebug(){this.debugOpen=!this.debugOpen;this.el('debug').hidden=!this.debugOpen;}
  notice(text:string){this.el('notice').textContent=text;this.noticeUntil=performance.now()+2200;}
  event(event:CombatEvent){if(['notice','parry','break','art','death'].includes(event.type))this.notice(event.text);}
  update(view:LabScene){
    const sim=this.sim,p=sim.player,e=sim.target??sim.enemies.find(e=>e.hp>0)??sim.enemies[0];
    const bar=(id:string,value:number,max:number)=>this.el(id).style.width=`${Math.max(0,Math.min(100,value/max*100))}%`;
    bar('hp',p.hp,sim.hpMax);bar('stamina',p.stamina,sim.staminaMax);bar('sp',p.sp,100);
    this.el('hp-value').textContent=`${Math.ceil(p.hp)} / ${sim.hpMax}`;this.el('stamina-value').textContent=`${Math.floor(p.stamina)}`;this.el('sp-value').textContent=String(Math.floor(p.sp));
    if(e){bar('enemy-hp',e.hp,e.maxHp);bar('enemy-break',e.break,100);this.el('enemy-values').textContent=`${Math.ceil(e.hp)} / ${e.maxHp}`;this.el('enemy-state').textContent=e.hp<=0?`DEFEATED · ${bindingText(this.bindings,'reset')} TO RESET`:e.state==='Broken'?'BROKEN · DAMAGE ×1.6':e.pattern?`${e.pattern.name.toUpperCase()} · ${e.pattern.parryable?'PARRY OR DODGE':'DODGE'}`:e.state.toUpperCase();}
    const threat=sim.flags.freezeAI||sim.art?undefined:sim.enemies.filter(e=>e.pattern?.kind==='skill'&&e.hp>0).map(e=>({enemy:e,at:e.attackStart+e.pattern!.hits.find((_,i)=>!e.hits.has(i))!})).filter(t=>Number.isFinite(t.at)).sort((a,b)=>a.at-b.at)[0];
    const defense=this.el('defense-cue');defense.hidden=!threat||!this.showTiming;
    if(threat){const parryable=threat.enemy.pattern!.parryable,remaining=threat.at-sim.now-(parryable?80:150);defense.classList.toggle('sweep',!parryable);defense.querySelector('i')!.style.transform='rotate(45deg) scale('+Math.max(.5,Math.min(2,1+remaining/600))+')';defense.querySelector('span')!.textContent=(remaining<=55?'NOW · ':'BUILD-UP · ')+(parryable?'PARRY '+bindingText(this.bindings,'parry'):'DODGE '+bindingText(this.bindings,'dodge'));}
    this.el('lock-label').style.opacity=sim.target?'1':'0';
    this.el('notice').style.opacity=performance.now()<this.noticeUntil?'1':'0';
    const recent=sim.now-sim.lastGradeAt<1000;this.el('grade').textContent=recent?sim.lastGrade:'';this.el('grade').className=sim.lastGrade.toLowerCase();
    const charging=false,art=sim.art;
    this.el('timing').style.opacity=this.showTiming&&(charging||!!art)&&sim.state.state!=='ArtRecovery'?'1':'0';
    let remaining=0;
    if(charging){remaining=chargeTime(sim.attributes.dexterity)-(sim.now-sim.actionStart);this.el('timing-title').textContent='RELEASE WHEN THE RINGS MEET';this.el('art-nodes').innerHTML='';}
    else if(art){const elapsed=sim.now-art.start;const next=art.definition.nodes.find(n=>n.at+balance.timing.good>elapsed);remaining=next?next.at-elapsed:0;this.el('timing-title').textContent=next?'TAP WHEN THE SQUARES MEET':'CRESCENT BREAK · RECOVERY';this.el('art-nodes').innerHTML=art.grades.map((g,i)=>`<span class="${g?.toLowerCase()??''}">${i+1} ${g??'·'}</span>`).join('');}
    const radius=Math.max(12,Math.min(82,32+remaining*.075));
    this.el('incoming-ring').setAttribute('r',String(radius));const square=this.el('incoming-square');
    square.setAttribute('x',String(90-radius));square.setAttribute('y',String(90-radius));square.setAttribute('width',String(radius*2));square.setAttribute('height',String(radius*2));
    this.el('timing-geometry').classList.toggle('art',!!art);this.el('timing-geometry').classList.toggle('sweet-spot',Math.abs(remaining)<=balance.timing.perfect);
    this.el('timing-action').textContent=`${charging?'RELEASE':'TAP'} ${bindingText(this.bindings,'attack')}`;
    for(let i=0;i<4;i++){const id=sim.loadout[i],def=id?arts[id]:null,slot=this.el(`slot-${i}`);slot.classList.toggle('available',!!def&&(p.sp>=def.cost||sim.flags.infiniteSp));slot.classList.toggle('active',!!def&&sim.art?.definition.id===def.id);}
    const stats=view.stats();this.el('performance').hidden=!this.performanceVisible;this.el('performance').textContent=`${stats.backend.toUpperCase()}  ·  ${stats.fps} FPS  /  ${stats.frameMs.toFixed(1)} MS  ·  ${stats.meshes} MESHES  ·  ${stats.drawCalls} DRAWS`;
    if(this.debugOpen)this.el('debug-state').textContent=`State: ${sim.state.state}\nStartup: ${chargeTime(sim.attributes.dexterity).toFixed(0)} ms\nPerfect: ±${balance.timing.perfect} ms / Good: ±${balance.timing.good} ms\nVertices: ${stats.vertices.toLocaleString()}\nParries: ${sim.counters.parries} · Breaks: ${sim.counters.breaks}\nKills: ${sim.counters.kills} · Arts: ${sim.counters.arts}`;
  }
}
