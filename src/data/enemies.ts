export interface AttackPattern { name: string; telegraph: number; hits: number[]; recovery: number; damage: number; range: number; arc: number; parryable: boolean; }
export const sentinelPatterns: AttackPattern[] = [
  { name: 'Measured cleave', telegraph: 1000, hits: [1000], recovery: 1000, damage: 24, range: 2.8, arc: 1.2, parryable: true },
  { name: 'Twin refrain', telegraph: 900, hits: [900, 1500], recovery: 1100, damage: 18, range: 2.9, arc: 1.3, parryable: true },
  { name: 'Seismic sweep', telegraph: 1400, hits: [1400], recovery: 1300, damage: 36, range: 3.4, arc: Math.PI, parryable: false },
];
