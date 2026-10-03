export interface CavernArea {name:string;x:number;z:number;radius:number;}
export const cavernAreas:CavernArea[]=[
 {name:'Stillwater Hollow',x:0,z:0,radius:11},
 {name:'Lantern Crossing',x:0,z:30,radius:12},
 {name:'Broken Aqueduct',x:30,z:30,radius:11},
 {name:'Abandoned Cache',x:-30,z:30,radius:10},
 {name:'Goblin Encampment',x:30,z:60,radius:13},
 {name:'Echo Pool',x:0,z:60,radius:11},
 {name:'The Watcher’s Arch',x:-30,z:60,radius:12},
 {name:'Undergate Den',x:-30,z:90,radius:14},
 {name:'Daylight Stair',x:-30,z:120,radius:10},
 {name:'Town of Beginnings',x:0,z:160,radius:15},
];
export const cavernLinks=[ [0,1],[1,2],[1,3],[2,4],[3,6],[4,5],[5,6],[6,7],[7,8],[8,9] ] as const;
export const patrols=[{area:1,count:1,hp:180},{area:2,count:2,hp:220},{area:4,count:2,hp:260},{area:5,count:1,hp:220},{area:6,count:2,hp:280},{area:7,count:1,hp:1400}] as const;
export const chestAreas=[0,2,3,4,5,6,8];
export function nearestArea(x:number,z:number){let best=0,d=Infinity;for(const [i,a] of cavernAreas.entries()){const n=Math.hypot(x-a.x,z-a.z);if(n<d){best=i;d=n;}}return best;}
export function projectToCavern(p:{x:number;z:number},margin=.4){
 let best={...p},distance=Infinity;
 const candidate=(x:number,z:number)=>{const d=(x-p.x)**2+(z-p.z)**2;if(d<distance){distance=d;best={x,z};}};
 for(const a of cavernAreas){const dx=p.x-a.x,dz=p.z-a.z,d=Math.hypot(dx,dz),r=a.radius-margin;candidate(a.x+dx*Math.min(1,r/Math.max(.001,d)),a.z+dz*Math.min(1,r/Math.max(.001,d)));}
 for(const [i,k] of cavernLinks){const a=cavernAreas[i],b=cavernAreas[k],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz))),cx=a.x+dx*t,cz=a.z+dz*t,d=Math.hypot(p.x-cx,p.z-cz),r=3.6-margin;candidate(cx+(p.x-cx)*Math.min(1,r/Math.max(.001,d)),cz+(p.z-cz)*Math.min(1,r/Math.max(.001,d)));}return best;
}
export function insideCavern(p:{x:number;z:number},margin=.4){const q=projectToCavern(p,margin);return Math.hypot(q.x-p.x,q.z-p.z)<.01;}
