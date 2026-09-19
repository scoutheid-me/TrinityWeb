/** Ground-plane gameplay footprint. Targets are tested at their ground center. */
export type HitShape = {kind:'box';range:number;halfWidth:number}|{kind:'sector';range:number;halfArc:number}|{kind:'circle';range:number};
export interface GroundPoint {x:number;z:number;}
export function containsHit(shape:HitShape,origin:GroundPoint,yaw:number,target:GroundPoint){
  const dx=target.x-origin.x,dz=target.z-origin.z;
  const x=dx*Math.cos(yaw)-dz*Math.sin(yaw),z=dx*Math.sin(yaw)+dz*Math.cos(yaw);
  if(shape.kind==='box')return Math.abs(x)<=shape.halfWidth&&z>=0&&z<=shape.range;
  const distance=Math.hypot(x,z);
  return distance<=shape.range&&(shape.kind==='circle'||distance<1e-8||z/distance>=Math.cos(shape.halfArc));
}
/** Counter-clockwise perimeter in local +Z forward coordinates; used by actual indicators. */
export function hitOutline(shape:HitShape,segments=64):GroundPoint[]{
  if(shape.kind==='box')return [{x:-shape.halfWidth,z:0},{x:-shape.halfWidth,z:shape.range},{x:shape.halfWidth,z:shape.range},{x:shape.halfWidth,z:0}];
  const arc=shape.kind==='circle'?Math.PI:shape.halfArc;
  const points=Array.from({length:segments+1},(_,i)=>({x:Math.sin(-arc+i/segments*arc*2)*shape.range,z:Math.cos(-arc+i/segments*arc*2)*shape.range}));
  return shape.kind==='circle'?points.slice(0,-1):[{x:0,z:0},...points];
}
