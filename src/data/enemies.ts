export interface AttackPattern { kind: 'basic' | 'skill'; name: string; telegraph: number; hits: number[]; recovery: number; damage: number; range: number; arc: number; parryable: boolean; }
export const sentinelPatterns: AttackPattern[] = [
  { kind: 'basic', name: 'Measured cleave', telegraph: 1000, hits: [1000], recovery: 1000, damage: 24, range: 2.6, arc: 0.75, parryable: true },
  { kind: 'skill', name: 'Twin refrain', telegraph: 900, hits: [900, 1500], recovery: 1100, damage: 18, range: 2.9, arc: 1.3, parryable: true },
  { kind: 'skill', name: 'Seismic sweep', telegraph: 1400, hits: [1400], recovery: 1300, damage: 36, range: 3.4, arc: Math.PI, parryable: false },
];

export const sentinelSequence = [0, 1, 0, 2] as const;
