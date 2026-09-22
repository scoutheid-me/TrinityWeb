import {freshProfile} from '../progression/profile';
import {weapons} from '../data/weapons';
import {EncounterLedger,type OutcomeKind,type CombatOutcome} from './encounter';
import {freshProgression,awardFieldSkills,canStart,awardChallenge,validLoadout,type ChallengeId} from '../progression/guild';
import {containsHit,type HitShape} from './geometry';
import { balance, chargeTime, clamp, defaultAttributes, maxHp, maxStamina, physicalDamage, type Attributes } from '../data/balance';
import { arts, artShape, chargeDuration, type ArtDefinition } from '../data/arts';
import { boarPatterns, sentinelPatterns, sentinelSequence, type AttackPattern } from '../data/enemies';
import { artMultiplier, equipArts, gainSp, HitRegistry, inHitVolume, spendSp, StateMachine, timingGrade, type Grade } from './rules';

export interface Point { x: number; z: number; }
export interface CombatEvent { type: 'hit' | 'slash' | 'grade' | 'parry' | 'dodge' | 'break' | 'death' | 'art' | 'notice'; text: string; x: number; z: number; amount?: number; grade?: Grade; target?: string; strong?: boolean; shape?:HitShape; motion?:string; }
export interface Enemy extends Point { id: string; species?:'sentinel'|'boar'; yaw: number; hp: number; maxHp: number; break: number; state: 'Idle' | 'Chase' | 'Telegraph' | 'Attack' | 'Recovery' | 'Broken' | 'Dead'; until: number; attackStart: number; pattern: AttackPattern | null; nextPattern: number; hits: Set<number>; flashUntil: number; }
export class CombatSimulation {
  profile=freshProfile();
  now = 0;autoFaceTarget=true;
  private fieldEligible=true;practiceMode=false;progression=freshProgression();weapon:string="sword";encounter=new EncounterLedger();lastParryAt=-Infinity;nextEnemyAttackAt=0;
  get weaponDefinition(){return weapons[this.weapon]??weapons.sword;}
  setWeapon(id:string){if(!weapons[id]||!this.free||this.encounter.active||this.practiceMode)return false;this.weapon=id;this.loadout=this.loadout.map(key=>key&&(arts[key]?.weapon==='any'||arts[key]?.weapon===id)?key:null);if(!this.loadout.some(Boolean))this.loadout=['focused-strike',null,null,null];return true;}
  private recordOutcome(o:Omit<CombatOutcome,'encounterId'|'eligible'>){
    this.encounter.record(o);
    if(!this.fieldEligible||this.practiceMode||Object.values(this.flags).some(Boolean)||Object.entries(defaultAttributes).some(([k,v])=>this.attributes[k as keyof Attributes]!==v)||this.encounter.active&&!this.encounter.eligible)return;
    const f=this.progression.field;
    if(o.kind==='basic-hit')f.hits++;if(o.kind==='evade')f.evades++;if(o.kind==='parry')f.parries++;if(o.kind==='break')f.breaks++;if(o.kind==='defeat')f.kills++;
    const before=Object.keys(this.progression.learned).length;awardFieldSkills(this.progression);if(Object.keys(this.progression.learned).length>before)this.emit('notice','NEW ART LEARNED · check your skill bank');
  }
  invalidateRewards(reason="Lab modifications"){this.fieldEligible=false;this.encounter.invalidate(reason);}
  equipLoadout(ids:(string|null)[]){if(this.practiceMode||this.encounter.active||!this.free||!validLoadout(ids,this.progression,this.weapon))return false;this.loadout=equipArts(ids);return true;}
  beginChallenge(id:ChallengeId){if(!canStart(this.progression,id))return false;this.reset();this.spawnEnemy();this.flags={invulnerable:false,infiniteSp:false,freezeAI:false};this.attributes={...defaultAttributes};this.player.hp=this.hpMax;this.player.stamina=this.staminaMax;this.encounter.start(id);if(id==="trial"){this.spawnEnemy();for(const e of this.enemies)e.hp=e.maxHp=300;}return true;}
  attributes: Attributes = { ...defaultAttributes };
  player = { x: 0, z: -4, yaw: 0, hp: maxHp(10), stamina: maxStamina(10), sp: 0, vx: 0, vz: 0 };
  state = new StateMachine();
  enemies: Enemy[] = [];
  loadout = equipArts(['focused-strike', null, null, null]);
  lockedId: string | null = null;
  flags = { invulnerable: false, infiniteSp: false, freezeAI: false };
  counters = { kills: 0, parries: 0, breaks: 0, perfects: 0, arts: 0 };
  events: CombatEvent[] = [];
  input = { x: 0, z: 0, sprint: false, guard: false };
  buffered: {action:'attack'|'dodge'|'parry'|'art';slot:number;expires:number}|null=null;
  cancelBufferedInput(){this.buffered=null;}
  private buffer(action:'attack'|'dodge'|'parry'|'art',slot=0){
    if(!['BasicAttackRecovery','ArtRecovery'].includes(this.state.state)||this.actionEnd-this.now>100)return false;
    if(!this.buffered)this.buffered={action,slot,expires:this.now+110};
    return true;
  }
  actionStart = 0;
  actionEnd = 0;
  lastStaminaUse = -1000;
  basicGrade: Grade = 'Normal';
  lastContact: {at:number;shape:HitShape}|null=null;
  basicHit = false;
  attackSerial = 0;
  hits = new HitRegistry();
  art: { definition: ArtDefinition; slot:number; stage:number; awaitingHold:boolean; releasedAt:number|null; releaseYaw:number; victims:Set<string>; start: number; grades: (Grade | null)[]; offsets:number[]; resolved: Set<number>; finisher: boolean } | null = null;
  dodgeOrigin:Point={x:0,z:0};
  dodgeVector: Point = { x: 0, z: 1 };
  lastGrade = '';
  lastGradeAt = -5000;
  hitStopUntil = 0;
  constructor() { this.reset(); }
  get target() { return this.enemies.find(e => e.id === this.lockedId && e.hp > 0); }
  get hpMax() { return maxHp(this.attributes.vitality); }
  get staminaMax() { return maxStamina(this.attributes.endurance); }
  get free() { return this.state.state === 'Idle' || this.state.state === 'Movement'; }
  emit(type: CombatEvent['type'], text: string, point: Point = this.player, extra: Partial<CombatEvent> = {}) { this.events.push({ type, text, x: point.x, z: point.z, ...extra }); }
  grade(grade: Grade) { this.lastGrade = grade; this.lastGradeAt = this.now; if (grade === 'Perfect') this.counters.perfects++; this.emit('grade', grade, this.player, { grade }); }
  reset() {
    this.fieldEligible=true;this.encounter.end("abandoned");this.lastParryAt=-Infinity;this.nextEnemyAttackAt=0;
    this.player = { x: 0, z: -4, yaw: 0, hp: this.hpMax, stamina: this.staminaMax, sp: 0, vx: 0, vz: 0 };
    this.lastContact=null; this.cancelBufferedInput(); this.state.reset(); this.art = null; this.actionEnd = 0; this.hits.clear(); this.lockedId = null; this.events = []; this.hitStopUntil = 0;
    this.input = { x: 0, z: 0, sprint: false, guard: false }; this.enemies = [];
  }
  spawnEnemy(species:'sentinel'|'boar'='sentinel') {
    if (this.enemies.filter(e => e.hp > 0).length >= 5) return;
    const index = this.enemies.length;
    this.enemies.push({ id: `${species}-${index}`, species, x: index ? Math.sin(index * 2.4) * 5 : 0, z: index ? Math.cos(index * 2.4) * 5 : 2.5, yaw: Math.PI, hp: species==='boar'?220:balance.enemy.hp, maxHp: species==='boar'?220:balance.enemy.hp, break: 0, state: 'Idle', until: this.now + 1200, attackStart: 0, pattern: null, nextPattern: 0, hits: new Set(), flashUntil: 0 });
  }
  resetEnemies() { this.enemies = []; this.spawnEnemy(); this.lockedId = null; }
  toggleLock(switchTarget = false) {
    const targets = this.enemies.filter(e => e.hp > 0 && Math.hypot(e.x - this.player.x, e.z - this.player.z) < 20);
    if (!switchTarget && this.lockedId) { this.lockedId = null; return; }
    const index = targets.findIndex(e => e.id === this.lockedId);
    this.lockedId = targets[(index + 1) % targets.length]?.id ?? null;
  }
  faceTarget() { const target = this.target; if (target&&this.autoFaceTarget) this.player.yaw = Math.atan2(target.x - this.player.x, target.z - this.player.z); }
  pressAttack() {
    if (this.art && this.state.state !== 'ArtRecovery') return;
    if(this.buffer('attack'))return;
    if (!this.state.set('BasicAttackStartup')) return;
    this.faceTarget(); this.actionStart = this.now; this.actionEnd = this.now + chargeTime(this.attributes.dexterity)*(this.weaponDefinition.startup/87);
  }
  releaseAttack() { /* Basic attacks commit on press; release has no timing role. */ }
  private beginBasicImpact() {
    if (this.state.state !== 'BasicAttackStartup') return;
    this.basicGrade = 'Normal';
    this.state.set('BasicAttackActive'); this.actionStart = this.now; this.actionEnd = this.now + balance.basic.active; this.basicHit = false; this.attackSerial++; this.hits.clear();
    this.lastContact={at:this.now,shape:this.weaponDefinition.shape};
    this.emit('slash', 'Basic', this.player, { grade: this.basicGrade,shape:this.lastContact.shape,motion:'basic' });
  }
  activateArt(slot: number) {
    if(this.art?.slot===slot&&this.art.awaitingHold){this.art.awaitingHold=false;this.art.start=this.now;this.art.releasedAt=null;return true;}
    if(!validLoadout(this.loadout,this.progression,this.weapon)){this.emit('notice','Invalid loadout — visit the Guild board');return false;}
    const id = this.loadout[slot], base = id ? arts[id] : null;
    let def=base?structuredClone(base):null;
    if(def&&(!this.progression.learned[def.id]||def.weapon!=='any'&&this.weapon!==def.weapon)){this.emit("notice","Art not learned or wrong weapon");return false;}
    if(def?.id==="crescent-break"){if(this.progression.masteryChoice==="recovery")def.recovery=200;if(this.progression.masteryChoice==="break"){def.recovery=460;for(const node of def.nodes)node.break*=1.35;}}
    if(def?.counterWindow&&this.now-this.lastParryAt>def.counterWindow){this.emit("notice","Perfect Parry first · counter opportunity required");return false;}
    if (!def) { this.emit('notice', 'No Art equipped'); return false; }
    if (!this.state.can('ArtStartup')) { this.emit('notice', 'Recovering — wait for the opening'); return false; }
    const after = spendSp(this.player.sp, def.cost);
    if (after === null && !this.flags.infiniteSp) { this.emit('notice', `Requires ${def.cost} SP`); return false; }
    this.player.sp = this.flags.infiniteSp ? this.player.sp : after!;
    if(def.counterWindow)this.lastParryAt=-Infinity;
    this.state.set('ArtStartup');this.player.vx=0;this.player.vz=0; this.faceTarget(); this.actionStart = this.now;
    this.art = { definition: def, slot, stage:0, awaitingHold:false, releasedAt:null,releaseYaw:0,victims:new Set(), start: this.now, grades: def.nodes.map(() => null), offsets:[], resolved: new Set(), finisher: false };
    this.attackSerial++; this.hits.clear(); this.counters.arts++; this.emit('art', def.name); return true;
  }
  releaseArt(slot:number) {
    const art=this.art;if(!art||art.awaitingHold||art.slot!==slot||art.grades[art.stage]!==null)return;
    const offset=this.now-art.start-chargeDuration(art.definition,art.stage);
    const grade=timingGrade(offset,true);art.offsets[art.stage]=offset;art.grades[art.stage]=grade;this.grade(grade);
    this.recordOutcome({kind:'art-phase',actor:'player',target:'phase',attackId:this.attackSerial,phase:String(art.stage),at:this.now,amount:0,artId:art.definition.id,grade,offsetMs:offset});
    if(grade==='Miss'){
      art.resolved.add(art.stage);this.state.set('ArtRecovery');this.actionEnd=this.now+art.definition.recovery;
      this.emit('notice','CHARGE FAILED · no strike · SP spent');
    }else{art.releasedAt=this.now;art.releaseYaw=this.player.yaw;this.state.set('ArtSequence');this.emit('notice',grade==='Perfect'?'PERFECT RELEASE · full power':'GOOD RELEASE · 60% power');}
  }
  cancelArtCharge(){
    if(!this.art||this.art.grades[this.art.stage]!==null)return;
    if(this.art.stage===0&&!this.flags.infiniteSp)this.player.sp=gainSp(this.player.sp,this.art.definition.cost);
    this.art=null;this.state.reset();this.cancelBufferedInput();
  }
  useStamina(cost: number) { if (this.player.stamina < cost) return false; this.player.stamina -= cost; this.lastStaminaUse = this.now; return true; }
  dodge() {
    if(this.art?.definition.cancelAfter!==undefined&&this.art.releasedAt!==null&&this.art.resolved.has(0)&&this.now-this.art.releasedAt>=this.art.definition.cancelAfter&&this.player.stamina>=balance.dodge.cost){this.art=null;this.state.reset();}
    if(this.buffer('dodge'))return true;
    if (!this.state.can('Dodge') || !this.useStamina(balance.dodge.cost)) return false;
    this.dodgeOrigin={x:this.player.x,z:this.player.z};this.state.set('Dodge'); this.actionStart = this.now; this.actionEnd = this.now + balance.dodge.duration;
    const length = Math.hypot(this.input.x, this.input.z);
    this.dodgeVector = length > 0 ? { x: this.input.x / length, z: this.input.z / length } : { x: Math.sin(this.player.yaw), z: Math.cos(this.player.yaw) };
    this.emit('dodge', 'Dodge'); return true;
  }
  parry() {
    if(this.buffer('parry'))return true;
    if (!this.state.can('Parry') || !this.useStamina(balance.parry.cost)) return false;
    this.state.set('Parry'); this.actionStart = this.now; this.actionEnd = this.now + balance.parry.duration; this.faceTarget(); return true;
  }
  applyBreak(enemy: Enemy, amount: number) {
    if (enemy.hp <= 0 || enemy.state === 'Broken') return;
    enemy.break = clamp(enemy.break + amount, 0, balance.enemy.breakThreshold);
    if (enemy.break >= balance.enemy.breakThreshold) { enemy.state = 'Broken'; enemy.until = this.now + balance.enemy.stagger; enemy.pattern = null; this.recordOutcome({kind:'break',actor:'player',target:enemy.id,attackId:this.now,phase:'break',at:this.now,amount:amount});this.counters.breaks++; this.emit('break', 'BREAK · punish the opening', enemy, { strong: true }); }
  }
  hitEnemy(enemy: Enemy, damage: number, breakDamage: number, grade: Grade, phase: string) {
    if (enemy.hp <= 0 || !this.hits.accept(`${this.attackSerial}:${phase}`, enemy.id)) return false;
    const actual = Math.round(damage * (enemy.state === 'Broken' ? 1.6 : 1));
    this.recordOutcome({kind:phase==='basic'?'basic-hit':phase.startsWith('counter:')?'counter-hit':'art-hit',actor:'player',target:enemy.id,attackId:this.attackSerial,phase,at:this.now,amount:actual,artId:phase==='basic'?undefined:this.art?.definition.id,grade});
    enemy.hp = Math.max(0, enemy.hp - actual); enemy.flashUntil = this.now + 170;
    this.emit('hit', String(actual), enemy, { amount: actual, grade, target: enemy.id, strong: grade === 'Perfect' });
    this.hitStopUntil = this.now + balance.hitStop;
    if (enemy.hp === 0) { enemy.state = 'Dead'; enemy.pattern = null; this.recordOutcome({kind:'defeat',actor:'player',target:enemy.id,attackId:this.attackSerial,phase,at:this.now,amount:1});this.counters.kills++; this.emit('death', enemy.species==='boar'?'Boar defeated':'Sentinel defeated', enemy); if (this.lockedId === enemy.id) this.lockedId = null; }
    else this.applyBreak(enemy, breakDamage);
    return true;
  }
  strike(damage: number, breakDamage: number, range: number, grade: Grade, phase: string, basic = false) {
    const shape:HitShape=basic?this.weaponDefinition.shape:this.art?artShape(this.art.definition,this.art.stage):{kind:'sector',range,halfArc:balance.basic.arc};
    this.lastContact={at:this.now,shape};
    let landed = false;
    for (const enemy of [...this.enemies].sort((a,b)=>Math.hypot(a.x-this.player.x,a.z-this.player.z)-Math.hypot(b.x-this.player.x,b.z-this.player.z))) if (containsHit(shape,this.player,this.player.yaw,enemy)) {
      if(!basic&&this.art?.definition.maxTargets&&this.art.victims.size>=this.art.definition.maxTargets)break;
      const hit=this.hitEnemy(enemy,physicalDamage(damage,this.attributes.strength),breakDamage,grade,phase);if(hit&&!basic&&this.art){this.art.victims.add(enemy.id);if(this.art.definition.restoreStamina)this.player.stamina=Math.min(this.staminaMax,this.player.stamina+this.art.definition.restoreStamina*artMultiplier(grade));}landed=hit||landed;
    }
    if (basic && landed) this.player.sp = gainSp(this.player.sp, balance.sp.normal);
  }
  defenseOutcome(kind:OutcomeKind,enemy:Enemy,amount=0,failedCounter=false){this.recordOutcome({kind,actor:'player',target:enemy.id,attackId:enemy.attackStart,phase:String([...enemy.hits].at(-1)??0),at:this.now,amount,failedCounter});}
  receiveAttack(enemy: Enemy, pattern: AttackPattern) {
    if (this.state.state === 'Dead' || this.flags.invulnerable) return;
    const elapsed = this.now - this.actionStart;
    if (this.state.state === 'Dodge' && elapsed >= balance.dodge.iframeStart && elapsed <= balance.dodge.iframeEnd) { this.defenseOutcome('evade',enemy);this.emit('notice', 'Evaded'); return; }
    if (pattern.parryable && this.state.state === 'Parry' && elapsed <= (pattern.kind === 'basic' ? balance.parry.basicWindow : balance.parry.window) && inHitVolume(this.player.x, this.player.z, this.player.yaw, enemy.x, enemy.z, 4, 1.7)) {
      this.lastParryAt=this.now;this.defenseOutcome('parry',enemy);this.player.sp = gainSp(this.player.sp, balance.sp.parry); this.counters.parries++;this.hitEnemy(enemy,physicalDamage(this.weaponDefinition.damage*balance.parry.counterMultiplier,this.attributes.strength),balance.parry.break,'Perfect',`counter:${enemy.attackStart}:${[...enemy.hits].at(-1)??0}`);
      this.emit('parry', `PERFECT PARRY · +${balance.sp.parry} SP · COUNTER HIT · NO DAMAGE`, enemy, { strong: true, grade:'Perfect' }); this.state.set('Idle'); return;
    }
    const failedCounter = this.state.state === 'Parry';
    let damage = pattern.damage * (failedCounter ? balance.parry.failureDamageMultiplier : 1);
    if (failedCounter) this.emit('notice', `COUNTER FAILED · ${Math.round((balance.parry.failureDamageMultiplier - 1) * 100)}% EXTRA DAMAGE`);
    if (this.state.state === 'Guard' && this.useStamina(balance.guard.cost)) damage *= this.weaponDefinition.guard;
    this.defenseOutcome('damage',enemy,damage,failedCounter);
    this.player.hp = Math.max(0, this.player.hp - damage); this.emit('hit', `−${Math.round(damage)}`, this.player, { amount: damage, target: 'player', strong: true });
    // A committed Art retains its timing through nonlethal hits; damage still matters.
    if(this.art?.definition.armor && this.player.hp > 0 && ['ArtStartup','ArtSequence'].includes(this.state.state))return;
    this.art = null; this.cancelBufferedInput();
    if (this.player.hp <= 0) { this.state.set('Dead'); this.emit('death', 'You fell. Rise again.'); }
    else { this.state.set('HitReaction'); this.actionStart = this.now; this.actionEnd = this.now + 330; }
  }
  update(deltaMs: number) {
    // Bounded substeps preserve collision/AI windows even on slow render frames.
    if(Object.values(this.flags).some(Boolean))this.invalidateRewards('Practice modifiers enabled');
    let remaining = clamp(deltaMs, 0, 100);
    while (remaining > 0) { const step = Math.min(remaining, 1000 / 120); this.step(step); remaining -= step; }
    if(this.encounter.active){if(this.player.hp<=0)this.encounter.end("failed");else if(this.encounter.objectiveMet){if(this.encounter.eligible)this.encounter.rewardNew=awardChallenge(this.progression,this.encounter.challenge!,this.encounter.stats.crescentHit);this.encounter.end("completed");}}
  }
  private step(ms: number) {
    this.now += ms; const dt = ms / 1000;
    if (this.state.state === 'Dead') return;
    const state = this.state.state;
    if (this.now - this.lastStaminaUse > 650) this.player.stamina = Math.min(this.staminaMax, this.player.stamina + balance.staminaRegen * dt);
    if (state === 'BasicAttackStartup' && this.now >= this.actionEnd) this.beginBasicImpact();
    if (state === 'BasicAttackActive') {
      if (!this.basicHit) { this.strike(this.weaponDefinition.damage, this.weaponDefinition.break, this.weaponDefinition.shape.range, this.basicGrade, 'basic', true); this.basicHit = true; }
      if (this.now >= this.actionEnd) { this.state.set('BasicAttackRecovery'); this.actionEnd = this.now + this.weaponDefinition.recovery; }
    }
    if (['BasicAttackRecovery', 'ArtRecovery', 'Dodge', 'Parry', 'HitReaction', 'Staggered', 'KnockedDown'].includes(state) && this.now >= this.actionEnd) { this.state.set('Idle'); if (state === 'ArtRecovery') this.art = null; }
    if (this.art && (state === 'ArtStartup' || state === 'ArtSequence')) this.updateArt(dt);
    if(this.buffered){const pending=this.buffered;if(this.now>pending.expires)this.buffered=null;else if(this.free){this.buffered=null;if(pending.action==='attack')this.pressAttack();else if(pending.action==='art')this.activateArt(pending.slot);else this[pending.action]();}}
    if (this.free && this.input.guard) this.state.set('Guard');
    if (this.state.state === 'Guard' && !this.input.guard) this.state.set('Idle');
    this.movePlayer(dt);
    if (!this.flags.freezeAI) for (const enemy of this.enemies) this.updateEnemy(enemy, dt);
    else for (const enemy of this.enemies) { enemy.attackStart += ms; enemy.until += ms; }
    this.resolveBodies();
    if(this.target&&this.autoFaceTarget&&!(this.art&&this.art.releasedAt!==null))this.faceTarget();
  }
  private updateArt(dt:number) {
    const art=this.art;if(!art||this.state.state==='ArtRecovery')return;
    const def=art.definition,node=def.nodes[art.stage];
    if(art.awaitingHold){if(this.now>=this.actionEnd){art.awaitingHold=false;art.start=this.now-chargeDuration(def,art.stage)-1000;this.releaseArt(art.slot);}return;}
    if(art.releasedAt===null){if(this.now-art.start>chargeDuration(def,art.stage)+balance.timing.good)this.releaseArt(art.slot);return;}
    const elapsed=this.now-art.releasedAt;this.player.yaw=art.releaseYaw;
    const travelDt=Math.max(0,Math.min(dt,(def.startup-elapsed+dt*1000)/1000));
    if(travelDt>0){
      const travel=art.grades[art.stage]==='Good'?(def.goodMovement??def.movement):def.movement;
      this.player.x+=(Math.sin(art.releaseYaw)*travel+Math.cos(art.releaseYaw)*(def.sideMovement??0))/(def.startup/1000)*travelDt;
      this.player.z+=(Math.cos(art.releaseYaw)*travel-Math.sin(art.releaseYaw)*(def.sideMovement??0))/(def.startup/1000)*travelDt;
      if(def.travelStrike)this.strike(node.multiplier*this.weaponDefinition.damage*artMultiplier(art.grades[art.stage]!),node.break*artMultiplier(art.grades[art.stage]!),node.range,art.grades[art.stage]!,'art-'+art.stage);
      this.bound(this.player);this.resolveBodies();
    }
    if(elapsed>=def.startup&&!art.resolved.has(art.stage)){
      art.resolved.add(art.stage);const grade=art.grades[art.stage]!,power=artMultiplier(grade);
      this.strike(node.multiplier*this.weaponDefinition.damage*power,node.break*power,node.range,grade,'art-'+art.stage);
      this.emit('slash',def.name,this.player,{grade,shape:this.lastContact!.shape,motion:def.motion});
      if(art.stage+1<def.nodes.length){art.victims.clear();art.stage++;art.awaitingHold=true;art.releasedAt=null;this.actionEnd=this.now+1600;this.emit('notice','SECOND CUT · hold the same Art button again');}
      else{this.state.set('ArtRecovery');this.actionEnd=this.now+def.recovery;}
    }
  }
  private movePlayer(dt: number) {
    let vx = 0, vz = 0;
    if (this.state.state === 'Dodge') { vx = this.dodgeVector.x * balance.dodge.speed; vz = this.dodgeVector.z * balance.dodge.speed; }
    else if (this.free || this.state.state === 'Guard') {
      const length = Math.hypot(this.input.x, this.input.z), moving = length > 0;
      let speed: number = balance.movement.speed;
      if (this.input.sprint && moving && this.player.stamina > 1 && this.free) { speed = balance.movement.sprint; this.useStamina(balance.movement.sprintCost * dt); }
      if (this.state.state === 'Guard') speed *= 0.35;
      if (moving) { vx = this.input.x / length * speed; vz = this.input.z / length * speed; }
      if (this.free) this.state.set(moving ? 'Movement' : 'Idle');
      if (this.target&&this.autoFaceTarget) this.faceTarget();
      else if (moving) { const desired = Math.atan2(vx, vz), diff = Math.atan2(Math.sin(desired - this.player.yaw), Math.cos(desired - this.player.yaw)); this.player.yaw += diff * Math.min(1, dt * 16); }
    }
    const smoothing = this.state.state === 'Dodge' ? 1 : Math.min(1, dt * (vx || vz ? balance.movement.acceleration : balance.movement.deceleration));
    this.player.vx += (vx - this.player.vx) * smoothing; this.player.vz += (vz - this.player.vz) * smoothing;
    this.player.x += this.player.vx * dt; this.player.z += this.player.vz * dt;
    this.bound(this.player);
  }
  private bound(point: Point) { const distance = Math.hypot(point.x, point.z); if (distance > balance.arenaRadius) { point.x *= balance.arenaRadius / distance; point.z *= balance.arenaRadius / distance; } }
  private resolveBodies() {
    const live=this.enemies.filter(e=>e.hp>0);
    for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){
      const a=live[i],b=live[j],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);
      if(d<1.3){const x=d>.001?dx/d:1,z=d>.001?dz/d:0,push=(1.3-d)/2;
        // Committed footprints remain anchored to their windup.
        if(!a.pattern){a.x-=x*push;a.z-=z*push;this.bound(a);}
        if(!b.pattern){b.x+=x*push;b.z+=z*push;this.bound(b);}
      }
    }
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0) continue;
      if(this.art?.definition.travelStrike&&this.art.releasedAt!==null&&this.art.grades[this.art.stage]==='Perfect'&&this.state.state==='ArtSequence')continue;
      const dx = this.player.x - enemy.x, dz = this.player.z - enemy.z, distance = Math.hypot(dx, dz);
      if (distance < 1 && distance > 0.001) { this.player.x += dx / distance * (1 - distance); this.player.z += dz / distance * (1 - distance); }
    }
    this.bound(this.player);
  }
  private updateEnemy(enemy: Enemy, dt: number) {
    if (enemy.state === 'Dead') return;
    if (enemy.state === 'Broken') { if (this.now >= enemy.until) { enemy.break = 0; enemy.state = 'Recovery'; enemy.until = this.now + 600; } return; }
    if (enemy.state === 'Recovery') { if (this.now >= enemy.until) enemy.state = 'Chase'; return; }
    const dx = this.player.x - enemy.x, dz = this.player.z - enemy.z, distance = Math.hypot(dx, dz);
    if (enemy.pattern) {
      const elapsed = this.now - enemy.attackStart, pattern = enemy.pattern;
      // Tracking stops before impact, making the windup readable and dodgeable.
      if (elapsed < pattern.telegraph - (pattern.kind === 'basic' ? 500 : 260)) enemy.yaw = Math.atan2(dx, dz);
      enemy.state = elapsed < pattern.telegraph ? 'Telegraph' : 'Attack';
      for (let i = 0; i < pattern.hits.length; i++) if (elapsed >= pattern.hits[i] && !enemy.hits.has(i)) {
        enemy.hits.add(i); this.emit('slash', pattern.name, enemy, { target: enemy.id, strong: !pattern.parryable,shape:pattern.shape,motion:pattern.motion });
        if (containsHit(pattern.shape, enemy, enemy.yaw, this.player)) this.receiveAttack(enemy, pattern);
        else if (this.state.state === 'Dodge' && this.now-this.actionStart >= balance.dodge.iframeStart && this.now-this.actionStart <= balance.dodge.iframeEnd && containsHit(pattern.shape,enemy,enemy.yaw,this.dodgeOrigin)) {this.defenseOutcome('evade',enemy);this.emit('notice', 'Evaded');}
        if (['Broken','Dead'].includes(enemy.state)) return;
      }
      if (elapsed >= pattern.hits.at(-1)! + 220) { enemy.pattern = null; enemy.state = 'Recovery'; enemy.until = this.now + pattern.recovery;this.nextEnemyAttackAt=this.now+350; }
      return;
    }
    if (distance > balance.enemy.aggro || this.now < enemy.until) { enemy.state = 'Idle'; return; }
    enemy.yaw = Math.atan2(dx, dz);
    if (distance > (enemy.species==='boar'?1.8:2.25)) { enemy.state = 'Chase'; enemy.x += dx / distance * balance.enemy.speed * dt; enemy.z += dz / distance * balance.enemy.speed * dt; this.bound(enemy); }
    else {
      if(this.now<this.nextEnemyAttackAt||this.enemies.some(other=>other!==enemy&&other.pattern))return;
      const patternIndex=this.encounter.active&&this.encounter.challenge==='positioning'?0:sentinelSequence[enemy.nextPattern++ % sentinelSequence.length];
      enemy.pattern = enemy.species==='boar'?boarPatterns[patternIndex===0?0:1]:sentinelPatterns[patternIndex]; enemy.attackStart = this.now; enemy.hits.clear(); enemy.state = 'Telegraph'; }
  }
}
