/** Deterministic, in-place clips driven by actual guide travel. */
export class GuideRoutine {
 x=0;z=161;yaw=Math.PI;time=0;wave=0;near=false;waypoint=0;moving=false;
 update(player:{x:number;z:number},dt:number){
  dt=Math.max(0,Math.min(dt,100));this.time+=dt;this.wave=Math.max(0,this.wave-dt);
  const d=Math.hypot(player.x-this.x,player.z-this.z),near=player.z>148&&d<14;
  if(near&&!this.near)this.wave=3000;this.near=near;this.moving=false;
  let target=player;
  if(!this.wave&&(!near||d>4)){
   const route=[{x:-5,z:155},{x:-5,z:159},{x:0,z:163},{x:0,z:161}];target=route[this.waypoint];const distance=Math.hypot(target.x-this.x,target.z-this.z);
   if(distance<.1)this.waypoint=(this.waypoint+1)%route.length;
   else{const step=Math.min(distance,dt*.00065);this.x+=(target.x-this.x)/distance*step;this.z+=(target.z-this.z)/distance*step;this.moving=true;}
  }
  const desired=Math.atan2(target.x-this.x,target.z-this.z),delta=Math.atan2(Math.sin(desired-this.yaw),Math.cos(desired-this.yaw));this.yaw+=Math.max(-dt*.002,Math.min(dt*.002,delta));
  return {clip:this.wave>0?'wave':this.moving?'walk':'idle',phase:this.wave>0?1-this.wave/3000:(this.time%(this.moving?1250:4000))/(this.moving?1250:4000)};
 }
}
