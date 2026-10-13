export interface AimPoint {x:number;y:number;z:number;}
/** Nearest sphere actually under the crosshair, never a nearby substitute. */
export function aimedOrb(origin:AimPoint,direction:AimPoint,orbs:{id:string;position:AimPoint}[],maxDistance=6){
 let selected:string|null=null,best=maxDistance;
 for(const orb of orbs){const x=orb.position.x-origin.x,y=orb.position.y-origin.y,z=orb.position.z-origin.z,t=x*direction.x+y*direction.y+z*direction.z;if(t<=0||t>maxDistance)continue;
  const perpendicular=x*x+y*y+z*z-t*t,radius=.21;if(perpendicular>radius*radius)continue;
  const contact=t-Math.sqrt(Math.max(0,radius*radius-perpendicular));if(contact<best){best=contact;selected=orb.id;}
 }return selected;
}
