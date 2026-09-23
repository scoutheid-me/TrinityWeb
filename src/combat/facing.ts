/** Radians per second; attack tracking ends before contact. */
export const creatureFacing = {
  sentinel: {turnRate: 2.2, windupTurnRate: .9, rearHalfArc: Math.PI / 3, rearMultiplier: 1.2},
  boar: {turnRate: 1.8, windupTurnRate: .7, rearHalfArc: Math.PI / 3, rearMultiplier: 1.2},
};
export function angleDelta(from:number,to:number){return Math.atan2(Math.sin(to-from),Math.cos(to-from));}
export function turnToward(from:number,to:number,maxStep:number){return from+Math.max(-maxStep,Math.min(maxStep,angleDelta(from,to)));}
export function rearMultiplier(enemy:{x:number;z:number;yaw:number;species?:'sentinel'|'boar'},attacker:{x:number;z:number}){
 const dx=attacker.x-enemy.x,dz=attacker.z-enemy.z,profile=creatureFacing[enemy.species??'sentinel'];
 return Math.hypot(dx,dz)>.01&&Math.abs(angleDelta(enemy.yaw+Math.PI,Math.atan2(dx,dz)))<=profile.rearHalfArc?profile.rearMultiplier:1;
}
