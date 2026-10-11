import type {Enemy,Point} from './simulation';
import type {Journey} from '../world/journey';
import {cavernAreas,cavernLinks,insideCavern,nearestArea,projectToCavern} from '../world/cavern';
import {angleDelta,turnToward} from './facing';
export const creatureBehavior={vision:14,halfView:Math.PI*.36,closeSense:2,patrolSpeed:.85,pursuitSpeed:2.35,returnSpeed:1.3,pursuitSeconds:32,lostSeconds:8,restSeconds:8} as const;
export interface CreatureMind {mode:'routine'|'pursuit'|'return';activity:'patrol'|'lookout'|'rest'|'return';pursuit:number;lastSeen:Point;waypoint:number;restUntil:number;}
/** Architecture-aware visibility; closed gates also occlude sight and navigation. */
export function cavernSight(a:Point,b:Point,j:Journey,margin=.05){
 const distance=Math.hypot(b.x-a.x,b.z-a.z),steps=Math.max(1,Math.ceil(distance/.25));
 if(a.z>145.1||b.z>145.1)return false;
 for(let i=0;i<=steps;i++){const t=i/steps,p={x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t};if(!insideCavern(p,margin))return false;
  if(!j.defeated.includes('cavern-1-0')&&Math.abs(p.x)<3.7&&Math.abs(p.z-44)<.14)return false;
  if(!j.facts.includes('boss')&&Math.abs(p.x+30)<3.7&&Math.abs(p.z-104.6)<.14)return false;
 }return true;
}
export function seesPlayer(e:Enemy,p:Point,j:Journey){const d=Math.hypot(p.x-e.x,p.z-e.z);return d<=creatureBehavior.vision&&(d<creatureBehavior.closeSense||Math.abs(angleDelta(e.yaw,Math.atan2(p.x-e.x,p.z-e.z)))<=creatureBehavior.halfView)&&cavernSight(e,p,j);}
/** Route via the small connected chamber graph when a straight route cuts masonry. */
export function cavernWaypoint(from:Point,to:Point,j:Journey):Point{
 if(cavernSight(from,to,j,.6))return to;
 const start=nearestArea(from.x,from.z),goal=nearestArea(to.x,to.z),queue=[start],previous=new Map<number,number>([[start,-1]]);
 for(let n=0;n<queue.length;n++){const at=queue[n];if(at===goal)break;for(const [a,b] of cavernLinks){const next=a===at?b:b===at?a:-1;if(next<0||next===9||previous.has(next)||!cavernSight(cavernAreas[at],cavernAreas[next],j,.6))continue;previous.set(next,at);queue.push(next);}}
 if(previous.has(goal)){const route=[goal];while(route[0]!==start)route.unshift(previous.get(route[0])!);for(const index of route.reverse())if(cavernSight(from,cavernAreas[index],j,.6))return cavernAreas[index];}
 return cavernAreas[start];
}
function walk(e:Enemy,to:Point,speed:number,dt:number,j:Journey){const target=cavernWaypoint(e,to,j),dx=target.x-e.x,dz=target.z-e.z,d=Math.hypot(dx,dz);if(d<.12)return;
 const desired=Math.atan2(dx,dz);e.yaw=turnToward(e.yaw,desired,2.3*dt);if(Math.abs(angleDelta(e.yaw,desired))>.65)return;
 const step=Math.min(d,speed*dt),p=projectToCavern({x:e.x+dx/d*step,z:e.z+dz/d*step},.6);if(cavernSight(e,p,j,.55)){e.x=p.x;e.z=p.z;}
}
/** Runs for every live cavern creature regardless of the player's current room. */
export function updateCavernBehavior(e:Enemy,p:Point,j:Journey,now:number,dt:number){
 const home=e.home!;const m=e.mind??={mode:e.credit?.lastHit?'pursuit':'routine',activity:'patrol',pursuit:e.credit?.lastHit?100:0,lastSeen:{...(e.credit?.lastHit?p:home)},waypoint:0,restUntil:0};
 const visible=seesPlayer(e,p,j),d=Math.hypot(p.x-e.x,p.z-e.z);
 if(m.mode==='routine'&&visible){m.mode='pursuit';m.pursuit=100;m.lastSeen={...p};}
 if(m.mode==='pursuit'){
  if(visible)m.lastSeen={...p};
  m.pursuit=Math.max(0,m.pursuit-dt*(visible?(d>3?100/creatureBehavior.pursuitSeconds:.5):100/creatureBehavior.lostSeconds));
  if(m.pursuit<=0){m.mode='return';m.activity='return';m.restUntil=now+creatureBehavior.restSeconds*1000;}
 }
 // Never cancel a committed strike, Break or recovery just because sight changes.
 if(e.pattern||e.state==='Broken'||e.state==='Recovery')return true;
 if(m.mode==='pursuit'){
  if(visible&&d<2.7)return true;
  e.state='Chase';walk(e,m.lastSeen,creatureBehavior.pursuitSpeed,dt,j);if(!visible&&Math.hypot(e.x-m.lastSeen.x,e.z-m.lastSeen.z)<.5)e.yaw+=dt*.8;return false;
 }
 e.state='Idle';
 if(m.mode==='return'){walk(e,home,creatureBehavior.returnSpeed,dt,j);if(Math.hypot(e.x-home.x,e.z-home.z)<.5&&now>=m.restUntil){m.mode='routine';m.activity='lookout';}return false;}
 const offset=[...e.id].reduce((sum,c)=>sum+c.charCodeAt(0),0)%11,phase=(now/1000+offset)%32;
 if(phase<18){m.activity='patrol';const angle=m.waypoint*Math.PI/2,target={x:home.x+Math.sin(angle)*2.4,z:home.z+Math.cos(angle)*2.4};walk(e,target,creatureBehavior.patrolSpeed,dt,j);if(Math.hypot(e.x-target.x,e.z-target.z)<.3)m.waypoint=(m.waypoint+1)%4;}
 else if(phase<24){m.activity='lookout';e.yaw+=dt*.45;}
 else{m.activity='rest';}
 return false;
}
