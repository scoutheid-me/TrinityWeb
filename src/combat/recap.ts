import type {CombatSimulation,CombatEvent} from './simulation';
/** Presentation-only summary. Never used for progression or rewards. */
export class CombatRecap {
 private active=false;private start=0;
 current={weapon:'',seconds:0,damageDealt:0,damageTaken:0,counters:0,breaks:0,rearHits:0,artMisses:0,result:'none'};
 last:typeof this.current|null=null;
 observe(s:CombatSimulation,events:CombatEvent[]){
  const alive=s.enemies.some(e=>e.hp>0);
  if(alive&&s.player.hp>0&&!this.active){this.active=true;this.start=s.now;this.current={weapon:s.weapon,seconds:0,damageDealt:0,damageTaken:0,counters:0,breaks:0,rearHits:0,artMisses:0,result:'active'};}
  if(!this.active)return;
  for(const e of events){if(e.type==='hit'){if(e.target==='player')this.current.damageTaken+=e.amount??0;else this.current.damageDealt+=e.amount??0;if(e.weakPoint)this.current.rearHits++;}if(e.type==='parry')this.current.counters++;if(e.type==='break')this.current.breaks++;if(e.type==='grade'&&e.grade==='Miss')this.current.artMisses++;}
  if(!alive||s.player.hp<=0){this.current.seconds=Math.round((s.now-this.start)/100)/10;this.current.result=s.player.hp<=0?'Defeated':s.enemies.length?'Completed':'Ended';this.last={...this.current};this.active=false;}
 }
}
