/** Grip-space overhead cut. Contact is the instant the edge crosses forward.
 * Runtime pose deliberately shares the simulation clock; IK keeps both hands attached.
 */
export function greatswordPose(now:number,start:number,contact:number,recovery=520){
 const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
 const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 let pitch=-.95,lift=0;
 if(now<contact){
   const t=Math.max(0,(now-start)/Math.max(1,contact-start));
   if(t<.68){const k=smooth(t/.68);pitch=lerp(-.95,-2.35,k);lift=.38*k;}
   else{const k=((t-.68)/.32)**2;pitch=lerp(-2.35,0,k);lift=.38*(1-k);}
 }else{
   const t=now-contact;
   if(t<140){pitch=lerp(0,.85,smooth(t/140));}
   else{pitch=lerp(.85,-.95,smooth((t-140)/recovery));}
 }
 return {pitch,lift};
}
