import type {HitShape} from '../combat/geometry';
export interface AttackPattern { shape: HitShape; motion: 'cleave'|'refrain'|'sweep'; kind: 'basic' | 'skill'; name: string; telegraph: number; hits: number[]; recovery: number; damage: number; parryable: boolean; }
export const sentinelPatterns: AttackPattern[] = [
  { shape: {kind:'box',range:2.6,halfWidth:.48}, motion:'cleave', kind: 'basic', name: 'Measured cleave', telegraph: 1000, hits: [1000], recovery: 1000, damage: 24, parryable: true },
  { shape: {kind:'sector',range:2.9,halfArc:1.3}, motion:'refrain', kind: 'skill', name: 'Twin refrain', telegraph: 900, hits: [900, 1500], recovery: 1100, damage: 18, parryable: true },
  { shape: {kind:'circle',range:3.4}, motion:'sweep', kind: 'skill', name: 'Seismic sweep', telegraph: 1400, hits: [1400], recovery: 1300, damage: 36, parryable: false },
];

export const sentinelSequence = [0, 1, 0, 2] as const;

export const boarPatterns:AttackPattern[]=[
 {shape:{kind:'box',range:2.1,halfWidth:.48},motion:'cleave',kind:'basic',name:'Tusk jab',telegraph:1000,hits:[1000],recovery:1050,damage:18,parryable:true},
 {shape:{kind:'sector',range:2.3,halfArc:.85},motion:'sweep',kind:'skill',name:'Savage head sweep',telegraph:1350,hits:[1350],recovery:1500,damage:30,parryable:false}
];

export const goblinPatterns:AttackPattern[]=[
 {shape:{kind:'box',range:2.5,halfWidth:.5},motion:'cleave',kind:'basic',name:'Scrap-blade chop',telegraph:1150,hits:[1150],recovery:1250,damage:14,parryable:true},
 {shape:{kind:'sector',range:2.9,halfArc:1.15},motion:'sweep',kind:'skill',name:'Reckless sweep',telegraph:1500,hits:[1500],recovery:1600,damage:22,parryable:false}
];
export const captainPatterns:AttackPattern[]=[
 {...goblinPatterns[0],name:'Captain’s cleave',damage:24,recovery:1050},
 {shape:{kind:'sector',range:3,halfArc:1.1},motion:'refrain',kind:'skill',name:'Commanding pair',telegraph:1150,hits:[1150,1850],recovery:1350,damage:20,parryable:true},
 {...goblinPatterns[1],name:'Undergate sweep',shape:{kind:'sector',range:3.5,halfArc:1.4},damage:32}
];
