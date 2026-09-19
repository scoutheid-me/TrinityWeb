import type {Enemy,CombatSimulation} from './simulation';
/** A phase has a single authoritative contact deadline, reused by damage, pose, and cues. */
export function enemyPhase(enemy:Enemy,now:number,linger=100){
  if(!enemy.pattern||enemy.hp<=0)return null;
  const index=enemy.pattern.hits.findIndex(at=>now<=enemy.attackStart+at+linger);
  if(index<0)return null;
  const contactAt=enemy.attackStart+enemy.pattern.hits[index];
  const startAt=index===0?enemy.attackStart:enemy.attackStart+enemy.pattern.hits[index-1]+180;
  return {index,contactAt,startAt,remaining:contactAt-now,contact:now>=contactAt};
}
export function imminentThreat(sim:CombatSimulation,skillsOnly=false){
  return sim.enemies.filter(e=>!skillsOnly||e.pattern?.kind==='skill').map(enemy=>({enemy,phase:enemyPhase(enemy,sim.now)})).filter(t=>t.phase&&!t.phase.contact).sort((a,b)=>a.phase!.contactAt-b.phase!.contactAt||a.enemy.id.localeCompare(b.enemy.id))[0];
}
