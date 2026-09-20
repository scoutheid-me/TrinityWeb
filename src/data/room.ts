export const weaponRack={x:-8,z:9,yaw:-.7,radius:2.4};
export function nearWeaponRack(p:{x:number;z:number}){return Math.hypot(p.x-weaponRack.x,p.z-weaponRack.z)<=weaponRack.radius;}
