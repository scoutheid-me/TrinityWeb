export const exitDoor={x:-10.8,z:145.6,yaw:Math.atan2(.6,.8)};
/** Plane across the only town corridor. Shared by collision, mesh and interaction. */
export function stopAtExit(p:{x:number;z:number},open:boolean,townSide=false){
 if(open||p.z<130)return;
 const depth=(p.x-exitDoor.x)*.6+(p.z-exitDoor.z)*.8+.65;
 if(townSide){const back=depth-1.3;if(back<0){p.x-=back*.6;p.z-=back*.8;}return;}
 if(depth>0){p.x-=depth*.6;p.z-=depth*.8;}
}
/** One zone for the whole underground scene; the square is a separate location. */
export class RegionTracker {
 private region:'dungeon'|'town'|null=null;
 update(p:{x:number;z:number}){
  const d=Math.hypot(p.x,p.z-160);
  const next=this.region==='town'?(d>17?'dungeon':'town'):(d<12?'town':'dungeon');
  if(next===this.region)return null;this.region=next;return next==='town'?9:0;
 }
}
