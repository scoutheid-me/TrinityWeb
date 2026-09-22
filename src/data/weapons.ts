import type {HitShape} from '../combat/geometry';
export interface TrainingWeapon {id:string;name:string;description:string;maxTargets?:number;multiTargetDamage?:number;practiceArt?:string;damage:number;startup:number;recovery:number;break:number;shape:HitShape;guard:number;model:string;}
const sector=(range:number,halfArc:number):HitShape=>({kind:'sector',range,halfArc});
const box=(range:number,halfWidth:number):HitShape=>({kind:'box',range,halfWidth});
export const weapons:Record<string,TrainingWeapon>=Object.fromEntries([
 ['sword','One-handed sword','Versatile blade with the strongest guard; leaves the off hand free for a future shield. Group hits gain damage per target.',8,87,240,2,sector(2.9,Math.PI/6),.2],
 ['rapier','Rapier','Fast single-target thrusts and mobile precision Arts. Higher single-target damage than the sword.',10,55,140,2,box(3.1,.22),.25],
 ['greatsword','Two-handed sword','Heavy diagonal cleaves catch groups. High damage and Break, with a long vulnerable recovery.',12,420,680,4,sector(3.2,1.35),.4],
].map(([id,name,description,damage,startup,recovery,br,shape,guard])=>[id,{id,name,description,damage,startup,recovery,break:br,shape,guard,model:`/assets/weapons/training_${id}.glb`}] as [string,TrainingWeapon]));

weapons.rapier.maxTargets=1;weapons.rapier.practiceArt='needle-step';weapons.greatsword.practiceArt='iron-horizon';

weapons.sword.multiTargetDamage=10;
/** Group scaling applies per victim and never changes shared Art base damage. */
export function basicWeaponDamage(w:TrainingWeapon,targetCount:number){return targetCount>1?(w.multiTargetDamage??w.damage):w.damage;}
