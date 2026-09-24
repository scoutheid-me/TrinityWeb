import {CombatSimulation} from './simulation';
import {chargeDuration} from '../data/arts';
/** Uses the real executor. Stationary fixtures isolate throughput; live duels test risk. */
export function benchmark(weapon:string,targets=1,policy:'basic'|'mixed'|'counter'|'counter-art'='basic',live=false){
 const s=new CombatSimulation();s.weapon=weapon;s.practiceMode=true;s.flags.freezeAI=!live;s.player.z=0;s.player.hp=100000;s.loadout=['focused-strike',null,null,null];
 for(let i=0;i<targets;i++){s.spawnEnemy();const e=s.enemies[i];e.x=(i-(targets-1)/2)*1.1;e.z=2.3;e.hp=e.maxHp=100000;e.until=0;}
 s.lockedId=s.enemies[0].id;let breakApplied=0,damage=0,breaks=0,spSpent=0,hits=0,counters=0;
 for(let t=0;t<30000;t+=10){
  if(s.art&&s.art.releasedAt===null&&s.now>=s.art.start+chargeDuration(s.art.definition,s.art.stage))s.releaseArt(0);
  if(s.free){
   const threat=s.enemies.find(e=>e.pattern?.parryable&&e.pattern.hits.some((at,i)=>!e.hits.has(i)&&e.attackStart+at-s.now>0&&e.attackStart+at-s.now<=80));
   if((policy==='counter'||policy==='counter-art')&&threat){s.lockedId=threat.id;s.parry();}
   else if((policy==='mixed'||policy==='counter-art')&&s.player.sp>=15){if(s.activateArt(0))spSpent+=15;}
   else if(policy!=='counter')s.pressAttack();
  }
  s.update(10);
  for(const e of s.events){if(e.type==='hit'&&e.target!=='player'){damage+=e.amount??0;breakApplied+=e.breakAmount??0;hits++;}if(e.type==='break')breaks++;if(e.type==='parry')counters++;}s.events=[];
  if(!live)for(const e of s.enemies){if(e.state==='Broken'){e.state='Idle';e.break=0;} } // No permanent dummy stagger multiplier.
 }
 return {weapon,targets,policy,live,duration:30,damage,breakApplied,dps:Math.round(damage/30*10)/10,breaks,hits,counters,spSpent,spRemaining:s.player.sp,damageTaken:100000-s.player.hp};
}
