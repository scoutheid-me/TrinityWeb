import type {HitShape} from '../combat/geometry';
export interface TrainingWeapon {id:string;name:string;description:string;damage:number;startup:number;recovery:number;break:number;shape:HitShape;guard:number;model:string;}
const sector=(range:number,halfArc:number):HitShape=>({kind:'sector',range,halfArc});
const box=(range:number,halfWidth:number):HitShape=>({kind:'box',range,halfWidth});
export const weapons:Record<string,TrainingWeapon>=Object.fromEntries([
 ['sword','One-handed sword','Balanced reach, speed and recovery.',4,87,240,2,sector(2.9,1.4),.2],
 ['rapier','Rapier','A fast, narrow thrust; aim carefully.',3,65,200,1,box(3.1,.22),.25],
 ['greatsword','Two-handed sword','A powerful overhead cut down a narrow lane; slow wind-up and exposed recovery.',12,420,520,5,box(2.2,.48),.25],
].map(([id,name,description,damage,startup,recovery,br,shape,guard])=>[id,{id,name,description,damage,startup,recovery,break:br,shape,guard,model:`/assets/weapons/training_${id}.glb`}] as [string,TrainingWeapon]));
