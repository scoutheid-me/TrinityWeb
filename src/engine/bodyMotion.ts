import clips from '../../public/assets/animations/body_motion.json';
export type BodyClip=keyof typeof clips.clips;
export function bodyPose(clip:BodyClip,progress:number){
 const at=Math.max(0,Math.min(60,progress*60)),low=Math.floor(at),high=Math.min(60,low+1),t=at-low;
 const a=clips.clips[clip][low],b=clips.clips[clip][high];
 return {pitch:a[0]+(b[0]-a[0])*t,roll:a[1]+(b[1]-a[1])*t,height:a[2]+(b[2]-a[2])*t};
}
export function bodyPhase(now:number,start:number,contact:number,recovery:number){return now<=contact?.6*Math.max(0,(now-start)/Math.max(1,contact-start)):.6+.4*(now-contact)/Math.max(1,recovery);}
