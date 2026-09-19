import { balance, clamp } from '../data/balance';
export type Grade = 'Normal' | 'Good' | 'Perfect' | 'Miss';
export function timingGrade(offset: number, art = false): Grade {
  return Math.abs(offset) <= balance.timing.perfect ? 'Perfect' : Math.abs(offset) <= balance.timing.good ? 'Good' : art ? 'Miss' : 'Normal';
}
export const basicMultiplier = (grade: Grade) => grade === 'Perfect' ? 1.25 : grade === 'Good' ? 1.1 : 1;
export const artMultiplier = (grade: Grade) => grade === 'Perfect' ? 1.25 : grade === 'Good' ? 1 : 0.7;
export function gainSp(current: number, amount: number) { return clamp(current + Math.max(0, amount), 0, balance.sp.max); }
export function spendSp(current: number, cost: number): number | null { return cost < 0 || current < cost ? null : current - cost; }
export function equipArts(ids: (string | null)[]): (string | null)[] {
  if (ids.length !== 4) throw new Error('Exactly four Combat Art slots are required.');
  const occupied = ids.filter(Boolean);
  if (new Set(occupied).size !== occupied.length) throw new Error('An Art can only occupy one slot.');
  return [...ids];
}
export type CombatState = 'Idle' | 'Movement' | 'BasicAttackStartup' | 'BasicAttackActive' | 'BasicAttackRecovery' | 'ArtStartup' | 'ArtSequence' | 'ArtRecovery' | 'Guard' | 'Dodge' | 'Parry' | 'HitReaction' | 'Staggered' | 'KnockedDown' | 'Dead';
const free: CombatState[] = ['Idle', 'Movement'];
const actions: CombatState[] = ['Idle', 'Movement', 'BasicAttackStartup', 'ArtStartup', 'Guard', 'Dodge', 'Parry'];
const transitions: Record<CombatState, CombatState[]> = {
  Idle: actions, Movement: actions,
  BasicAttackStartup: ['BasicAttackActive'], BasicAttackActive: ['BasicAttackRecovery'], BasicAttackRecovery: free,
  ArtStartup: ['ArtSequence'], ArtSequence: ['ArtRecovery'], ArtRecovery: free,
  Guard: [...free, 'Parry', 'Dodge'], Dodge: free, Parry: [...free, 'Guard'],
  HitReaction: free, Staggered: free, KnockedDown: free, Dead: [],
};
export class StateMachine {
  state: CombatState = 'Idle';
  can(next: CombatState): boolean { return this.state !== 'Dead' && (['Dead', 'HitReaction', 'Staggered', 'KnockedDown'].includes(next) || transitions[this.state].includes(next)); }
  set(next: CombatState): boolean { if (!this.can(next)) return false; this.state = next; return true; }
  reset() { this.state = 'Idle'; }
}
export function inHitVolume(ax: number, az: number, yaw: number, tx: number, tz: number, range: number, halfArc: number): boolean {
  const dx = tx - ax, dz = tz - az, dist = Math.hypot(dx, dz);
  if (dist > range) return false;
  return dist < 0.35 || (dx * Math.sin(yaw) + dz * Math.cos(yaw)) / dist >= Math.cos(halfArc);
}
export class HitRegistry {
  private victims = new Set<string>();
  accept(phase: string, victim: string) { const key = `${phase}:${victim}`; if (this.victims.has(key)) return false; this.victims.add(key); return true; }
  clear() { this.victims.clear(); }
}
