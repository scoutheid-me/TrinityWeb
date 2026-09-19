import type {HitShape} from '../combat/geometry';
export interface AttackPattern { shape: HitShape; motion: 'cleave'|'refrain'|'sweep'; kind: 'basic' | 'skill'; name: string; telegraph: number; hits: number[]; recovery: number; damage: number; parryable: boolean; }
export const sentinelPatterns: AttackPattern[] = [
  { shape: {kind:'box',range:2.6,halfWidth:.48}, motion:'cleave', kind: 'basic', name: 'Measured cleave', telegraph: 1000, hits: [1000], recovery: 1000, damage: 24, parryable: true },
  { shape: {kind:'sector',range:2.9,halfArc:1.3}, motion:'refrain', kind: 'skill', name: 'Twin refrain', telegraph: 900, hits: [900, 1500], recovery: 1100, damage: 18, parryable: true },
  { shape: {kind:'circle',range:3.4}, motion:'sweep', kind: 'skill', name: 'Seismic sweep', telegraph: 1400, hits: [1400], recovery: 1300, damage: 36, parryable: false },
];

export const sentinelSequence = [0, 1, 0, 2] as const;
