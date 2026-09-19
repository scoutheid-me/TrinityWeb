import clips from '../../public/assets/animations/duel_motion.json';
export type DuelMotion = keyof typeof clips.clips;
/** Sample the Blender-authored clip against simulation time, never render time. */
export function duelPose(motion:DuelMotion,now:number,start:number,contact:number,mirror=1){
  const frame=now<=contact?(now-start)/Math.max(1,contact-start)*clips.contactFrame:clips.contactFrame+(now-contact)/1000*clips.fps;
  const at=Math.max(0,Math.min(clips.endFrame,frame)),low=Math.floor(at),high=Math.min(clips.endFrame,low+1),blend=at-low;
  const a=clips.clips[motion][low],b=clips.clips[motion][high];
  return {pitch:a[0]+(b[0]-a[0])*blend,yaw:(a[1]+(b[1]-a[1])*blend)*mirror};
}
