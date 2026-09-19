import { balance, chargeTime, clamp, defaultAttributes, maxHp, maxStamina, physicalDamage, type Attributes } from '../data/balance';
import { arts, type ArtDefinition } from '../data/arts';
import { sentinelPatterns, sentinelSequence, type AttackPattern } from '../data/enemies';
import { artMultiplier, equipArts, gainSp, HitRegistry, inHitVolume, spendSp, StateMachine, timingGrade, type Grade } from './rules';

export interface Point { x: number; z: number; }
export interface CombatEvent { type: 'hit' | 'slash' | 'grade' | 'parry' | 'dodge' | 'break' | 'death' | 'art' | 'notice'; text: string; x: number; z: number; amount?: number; grade?: Grade; target?: string; strong?: boolean; }
export interface Enemy extends Point { id: string; yaw: number; hp: number; maxHp: number; break: number; state: 'Idle' | 'Chase' | 'Telegraph' | 'Attack' | 'Recovery' | 'Broken' | 'Dead'; until: number; attackStart: number; pattern: AttackPattern | null; nextPattern: number; hits: Set<number>; flashUntil: number; }
export class CombatSimulation {
  now = 0;
  attributes: Attributes = { ...defaultAttributes };
  player = { x: 0, z: -4, yaw: 0, hp: maxHp(10), stamina: maxStamina(10), sp: 0, vx: 0, vz: 0 };
  state = new StateMachine();
  enemies: Enemy[] = [];
  loadout = equipArts(['crescent-break', null, null, null]);
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
  basicHit = false;
  attackSerial = 0;
  hits = new HitRegistry();
  art: { definition: ArtDefinition; start: number; grades: (Grade | null)[]; resolved: Set<number>; finisher: boolean } | null = null;
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
    this.player = { x: 0, z: -4, yaw: 0, hp: this.hpMax, stamina: this.staminaMax, sp: 0, vx: 0, vz: 0 };
    this.cancelBufferedInput(); this.state.reset(); this.art = null; this.actionEnd = 0; this.hits.clear(); this.lockedId = null; this.events = []; this.hitStopUntil = 0;
    this.input = { x: 0, z: 0, sprint: false, guard: false }; this.enemies = []; this.spawnEnemy();
  }
  spawnEnemy() {
    if (this.enemies.filter(e => e.hp > 0).length >= 5) return;
    const index = this.enemies.length;
    this.enemies.push({ id: `sentinel-${index}`, x: index ? Math.sin(index * 2.4) * 5 : 0, z: index ? Math.cos(index * 2.4) * 5 : 2.5, yaw: Math.PI, hp: balance.enemy.hp, maxHp: balance.enemy.hp, break: 0, state: 'Idle', until: this.now + 1200, attackStart: 0, pattern: null, nextPattern: 0, hits: new Set(), flashUntil: 0 });
  }
  resetEnemies() { this.enemies = []; this.spawnEnemy(); this.lockedId = null; }
  toggleLock(switchTarget = false) {
    const targets = this.enemies.filter(e => e.hp > 0 && Math.hypot(e.x - this.player.x, e.z - this.player.z) < 20);
    if (!switchTarget && this.lockedId) { this.lockedId = null; return; }
    const index = targets.findIndex(e => e.id === this.lockedId);
    this.lockedId = targets[(index + 1) % targets.length]?.id ?? null;
  }
  faceTarget() { const target = this.target; if (target) this.player.yaw = Math.atan2(target.x - this.player.x, target.z - this.player.z); }
  pressAttack() {
    if (this.art && this.state.state !== 'ArtRecovery') { this.artInput(); return; }
    if(this.buffer('attack'))return;
    if (!this.state.set('BasicAttackStartup')) return;
    this.faceTarget(); this.actionStart = this.now; this.actionEnd = this.now + chargeTime(this.attributes.dexterity);
  }
  releaseAttack() { /* Basic attacks commit on press; release has no timing role. */ }
  private beginBasicImpact() {
    if (this.state.state !== 'BasicAttackStartup') return;
    this.basicGrade = 'Normal';
    this.state.set('BasicAttackActive'); this.actionStart = this.now; this.actionEnd = this.now + balance.basic.active; this.basicHit = false; this.attackSerial++; this.hits.clear();
    this.emit('slash', 'Basic', this.player, { grade: this.basicGrade });
  }
  activateArt(slot: number) {
    if(this.buffer('art',slot))return true;
    const id = this.loadout[slot], def = id ? arts[id] : null;
    if (!def) { this.emit('notice', 'No Art equipped'); return false; }
    if (!this.state.can('ArtStartup')) { this.emit('notice', 'Recovering — wait for the opening'); return false; }
    const after = spendSp(this.player.sp, def.cost);
    if (after === null && !this.flags.infiniteSp) { this.emit('notice', `Requires ${def.cost} SP`); return false; }
    this.player.sp = this.flags.infiniteSp ? this.player.sp : after!;
    this.state.set('ArtStartup'); this.faceTarget(); this.actionStart = this.now;
    this.art = { definition: def, start: this.now, grades: def.nodes.map(() => null), resolved: new Set(), finisher: false };
    this.attackSerial++; this.hits.clear(); this.counters.arts++; this.emit('art', def.name); return true;
  }
  artInput() {
    const art = this.art; if (!art || this.state.state === 'ArtRecovery') return;
    const elapsed = this.now - art.start;
    const index = art.definition.nodes.findIndex((n, i) => art.grades[i] === null && Math.abs(elapsed - n.at) <= balance.timing.good);
    if (index < 0) { this.emit('notice', 'Follow the next pulse'); return; }
    art.grades[index] = timingGrade(elapsed - art.definition.nodes[index].at, true); this.grade(art.grades[index]!);
  }
  useStamina(cost: number) { if (this.player.stamina < cost) return false; this.player.stamina -= cost; this.lastStaminaUse = this.now; return true; }
  dodge() {
    if(this.buffer('dodge'))return true;
    if (!this.state.can('Dodge') || !this.useStamina(balance.dodge.cost)) return false;
    this.state.set('Dodge'); this.actionStart = this.now; this.actionEnd = this.now + balance.dodge.duration;
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
    if (enemy.break >= balance.enemy.breakThreshold) { enemy.state = 'Broken'; enemy.until = this.now + balance.enemy.stagger; enemy.pattern = null; this.counters.breaks++; this.emit('break', 'BREAK · punish the opening', enemy, { strong: true }); }
  }
  hitEnemy(enemy: Enemy, damage: number, breakDamage: number, grade: Grade, phase: string) {
    if (enemy.hp <= 0 || !this.hits.accept(`${this.attackSerial}:${phase}`, enemy.id)) return false;
    const actual = Math.round(damage * (enemy.state === 'Broken' ? 1.6 : 1));
    enemy.hp = Math.max(0, enemy.hp - actual); enemy.flashUntil = this.now + 170;
    this.emit('hit', String(actual), enemy, { amount: actual, grade, target: enemy.id, strong: grade === 'Perfect' });
    this.hitStopUntil = this.now + balance.hitStop;
    if (enemy.hp === 0) { enemy.state = 'Dead'; enemy.pattern = null; this.counters.kills++; this.emit('death', 'Sentinel defeated', enemy); if (this.lockedId === enemy.id) this.lockedId = null; }
    else this.applyBreak(enemy, breakDamage);
    return true;
  }
  strike(damage: number, breakDamage: number, range: number, grade: Grade, phase: string, basic = false) {
    let landed = false;
    for (const enemy of this.enemies) if (inHitVolume(this.player.x, this.player.z, this.player.yaw, enemy.x, enemy.z, range, balance.basic.arc)) {
      landed = this.hitEnemy(enemy, physicalDamage(damage, this.attributes.strength), breakDamage, grade, phase) || landed;
    }
    if (basic && landed) this.player.sp = gainSp(this.player.sp, balance.sp.normal);
  }
  receiveAttack(enemy: Enemy, pattern: AttackPattern) {
    if (this.state.state === 'Dead' || this.flags.invulnerable) return;
    const elapsed = this.now - this.actionStart;
    if (this.state.state === 'Dodge' && elapsed >= balance.dodge.iframeStart && elapsed <= balance.dodge.iframeEnd) { this.emit('notice', 'Evaded'); return; }
    if (pattern.parryable && this.state.state === 'Parry' && elapsed <= (pattern.kind === 'basic' ? balance.parry.basicWindow : balance.parry.window) && inHitVolume(this.player.x, this.player.z, this.player.yaw, enemy.x, enemy.z, 4, 1.7)) {
      this.player.sp = gainSp(this.player.sp, balance.sp.parry); this.counters.parries++; this.applyBreak(enemy, balance.parry.break);
      this.emit('parry', `PERFECT PARRY · +${balance.sp.parry} SP · NO DAMAGE`, enemy, { strong: true, grade:'Perfect' }); this.state.set('Idle'); return;
    }
    const failedCounter = this.state.state === 'Parry';
    let damage = pattern.damage * (failedCounter ? balance.parry.failureDamageMultiplier : 1);
    if (failedCounter) this.emit('notice', `COUNTER FAILED · ${Math.round((balance.parry.failureDamageMultiplier - 1) * 100)}% EXTRA DAMAGE`);
    if (this.state.state === 'Guard' && this.useStamina(balance.guard.cost)) damage *= balance.guard.damageMultiplier;
    this.player.hp = Math.max(0, this.player.hp - damage); this.emit('hit', `−${Math.round(damage)}`, this.player, { amount: damage, target: 'player', strong: true });
    // A committed Art retains its timing through nonlethal hits; damage still matters.
    if(this.art && this.player.hp > 0 && ['ArtStartup','ArtSequence'].includes(this.state.state))return;
    this.art = null; this.cancelBufferedInput();
    if (this.player.hp <= 0) { this.state.set('Dead'); this.emit('death', 'You fell. Rise again.'); }
    else { this.state.set('HitReaction'); this.actionStart = this.now; this.actionEnd = this.now + 330; }
  }
  update(deltaMs: number) {
    // Bounded substeps preserve collision/AI windows even on slow render frames.
    let remaining = clamp(deltaMs, 0, 100);
    while (remaining > 0) { const step = Math.min(remaining, 1000 / 120); this.step(step); remaining -= step; }
  }
  private step(ms: number) {
    this.now += ms; const dt = ms / 1000;
    if (this.state.state === 'Dead') return;
    const state = this.state.state;
    if (this.now - this.lastStaminaUse > 650) this.player.stamina = Math.min(this.staminaMax, this.player.stamina + balance.staminaRegen * dt);
    if (state === 'BasicAttackStartup' && this.now >= this.actionEnd) this.beginBasicImpact();
    if (state === 'BasicAttackActive') {
      if (!this.basicHit) { this.strike(balance.basic.damage, balance.basic.break, balance.basic.range, this.basicGrade, 'basic', true); this.basicHit = true; }
      if (this.now >= this.actionEnd) { this.state.set('BasicAttackRecovery'); this.actionEnd = this.now + balance.basic.recovery; }
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
  }
  private updateArt(dt: number) {
    const art = this.art!, def = art.definition, elapsed = this.now - art.start;
    if (elapsed >= def.startup && this.state.state === 'ArtStartup') this.state.set('ArtSequence');
    if (elapsed < def.startup) { this.player.x += Math.sin(this.player.yaw) * def.movement / (def.startup / 1000) * dt; this.player.z += Math.cos(this.player.yaw) * def.movement / (def.startup / 1000) * dt; }
    def.nodes.forEach((node, i) => {
      if (!art.resolved.has(i) && elapsed >= node.at && (art.grades[i] !== null || elapsed >= node.at + balance.timing.good)) {
        const grade = art.grades[i] ?? 'Miss'; if (!art.grades[i]) this.grade(grade);
        art.grades[i] = grade; art.resolved.add(i);
        this.strike(node.damage * artMultiplier(grade), node.break * artMultiplier(grade), node.range, grade, `art-${i}`);
        this.emit('slash', `Cut ${i + 1}`, this.player, { grade });
      }
    });
    if (!def.finisher && art.resolved.size === def.nodes.length) { this.state.set('ArtRecovery'); this.actionEnd = this.now + def.recovery; }
    if (def.finisher && elapsed >= def.finisher.at && !art.finisher) {
      art.finisher = true; const perfect = art.grades.every(g => g === 'Perfect'); const multiplier = perfect ? def.finisher.perfectBonus : 1;
      this.strike(def.finisher.damage * multiplier, def.finisher.break * multiplier, def.finisher.range, perfect ? 'Perfect' : 'Good', 'finisher');
      this.emit('slash', perfect ? 'Lunar finish' : 'Finisher', this.player, { strong: true, grade: perfect ? 'Perfect' : 'Good' });
      this.state.set('ArtRecovery'); this.actionEnd = this.now + def.recovery;
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
      if (this.target) this.faceTarget();
      else if (moving) { const desired = Math.atan2(vx, vz), diff = Math.atan2(Math.sin(desired - this.player.yaw), Math.cos(desired - this.player.yaw)); this.player.yaw += diff * Math.min(1, dt * 16); }
    }
    const smoothing = this.state.state === 'Dodge' ? 1 : Math.min(1, dt * (vx || vz ? balance.movement.acceleration : balance.movement.deceleration));
    this.player.vx += (vx - this.player.vx) * smoothing; this.player.vz += (vz - this.player.vz) * smoothing;
    this.player.x += this.player.vx * dt; this.player.z += this.player.vz * dt;
    this.bound(this.player);
  }
  private bound(point: Point) { const distance = Math.hypot(point.x, point.z); if (distance > balance.arenaRadius) { point.x *= balance.arenaRadius / distance; point.z *= balance.arenaRadius / distance; } }
  private resolveBodies() {
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0) continue;
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
        enemy.hits.add(i); this.emit('slash', pattern.name, enemy, { target: enemy.id, strong: !pattern.parryable });
        if (inHitVolume(enemy.x, enemy.z, enemy.yaw, this.player.x, this.player.z, pattern.range, pattern.arc)) this.receiveAttack(enemy, pattern);
        else if (this.state.state === 'Dodge' && this.now-this.actionStart >= balance.dodge.iframeStart && this.now-this.actionStart <= balance.dodge.iframeEnd && distance <= pattern.range + 3.3) this.emit('notice', 'Evaded');
        if (enemy.state as string === 'Broken') return;
      }
      if (elapsed >= pattern.hits.at(-1)! + 220) { enemy.pattern = null; enemy.state = 'Recovery'; enemy.until = this.now + pattern.recovery; }
      return;
    }
    if (distance > balance.enemy.aggro || this.now < enemy.until) { enemy.state = 'Idle'; return; }
    enemy.yaw = Math.atan2(dx, dz);
    if (distance > 2.25) { enemy.state = 'Chase'; enemy.x += dx / distance * balance.enemy.speed * dt; enemy.z += dz / distance * balance.enemy.speed * dt; this.bound(enemy); }
    else { enemy.pattern = sentinelPatterns[sentinelSequence[enemy.nextPattern++ % sentinelSequence.length]]; enemy.attackStart = this.now; enemy.hits.clear(); enemy.state = 'Telegraph'; }
  }
}
