import type {HitShape} from '../combat/geometry';
/** Direction and extension share the same footprint and contact interval as damage. */
export function footprintPose(shape:HitShape,now:number,start:number,contact:number,recovery:number){
 const clamp=(x:number)=>Math.max(0,Math.min(1,x));
 const wind=clamp((now-start)/Math.max(1,contact-start));
 const active=clamp((now-contact)/140);
 const settle=1-clamp((now-contact-140)/Math.max(1,recovery));
 const arc=shape.kind==='sector'?shape.halfArc:shape.kind==='circle'?Math.PI:0;
 return {yaw:now<contact?-arc*wind:(-arc+2*arc*active)*settle,
  thrust:shape.kind==='box'?(now<contact?-.15*wind:Math.sin(Math.PI*active)*Math.min(.6,shape.range*.18)*settle):0,
  reach:shape.range,halfArc:arc};
}
