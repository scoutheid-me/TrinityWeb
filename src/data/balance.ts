export const balance = {
  movement: { speed: 4.4, sprint: 7.4, acceleration: 16, deceleration: 22, sprintCost: 13 },
  basic: { damage: 4, break: 2, charge: 100, minCharge: 60, dexScaling: 0.015, active: 140, recovery: 240, range: 2.9, arc: 1.4 },
  timing: { perfect: 55, good: 120 },
  sp: { max: 100, normal: 10, good: 13, perfect: 16, parry: 14 },
  dodge: { cost: 24, duration: 460, iframeStart: 40, iframeEnd: 330, speed: 10 },
  parry: { window: 170, basicWindow: 260, counterMultiplier: 2, failureDamageMultiplier: 1.5, duration: 430, cost: 8, break: 32 },
  guard: { cost: 24, damageMultiplier: 0.2 },
  staminaRegen: 24,
  enemy: { hp: 460, breakThreshold: 100, stagger: 3400, speed: 2.35, aggro: 15, radius: 0.6 },
  arenaRadius: 11.6, hitStop: 45, shake: 0.045,
} as const;
export type Attributes = { strength: number; dexterity: number; vitality: number; endurance: number };
export const defaultAttributes: Attributes = { strength: 10, dexterity: 10, vitality: 10, endurance: 10 };
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const chargeTime = (dex: number) => Math.max(balance.basic.minCharge, balance.basic.charge / (1 + Math.max(0, dex) * balance.basic.dexScaling));
export const maxHp = (vitality: number) => 120 + Math.max(0, vitality) * 8;
export const maxStamina = (endurance: number) => 80 + Math.max(0, endurance) * 2;
export const physicalDamage = (base: number, strength: number) => base * (1 + Math.max(0, strength) * 0.025);
