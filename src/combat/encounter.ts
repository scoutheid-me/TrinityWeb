import type {Grade} from './rules';
import type {ChallengeId} from '../progression/guild';
export type OutcomeKind='basic-hit'|'art-hit'|'art-phase'|'evade'|'parry'|'break'|'damage'|'defeat';
export interface CombatOutcome {encounterId:number;actor:string;target:string;attackId:number;phase:string;kind:OutcomeKind;at:number;amount:number;artId?:string;grade?:Grade;offsetMs?:number;failedCounter?:boolean;eligible:boolean;}
export interface TrialStats {basicHits:number;artHits:number;artPhases:number;good:number;perfect:number;miss:number;evades:number;parries:number;breaks:number;damageTaken:number;failedCounters:number;defeats:number;crescentHit:boolean;}
const empty=():TrialStats=>({basicHits:0,artHits:0,artPhases:0,good:0,perfect:0,miss:0,evades:0,parries:0,breaks:0,damageTaken:0,failedCounters:0,defeats:0,crescentHit:false});
/** Session-bounded facts. Presentation events and lifetime counters never grant rewards. */
export class EncounterLedger {
  rewardNew=false;id=0;challenge:ChallengeId|null=null;active=false;eligible=false;reason='';result:'none'|'completed'|'failed'|'abandoned'='none';stats=empty();
  private seen=new Set<string>();outcomes:CombatOutcome[]=[];
  start(challenge:ChallengeId){this.rewardNew=false;this.id++;this.challenge=challenge;this.active=true;this.eligible=true;this.reason='';this.result='none';this.stats=empty();this.seen.clear();this.outcomes=[];}
  invalidate(reason:string){if(this.active){this.eligible=false;this.reason=reason;}}
  end(result:typeof this.result){if(this.active){this.active=false;this.result=result;}}
  record(outcome:Omit<CombatOutcome,'encounterId'|'eligible'>){
    if(!this.active)return;
    const key=`${outcome.actor}:${outcome.attackId}:${outcome.phase}:${outcome.target}:${outcome.kind}`;
    if(this.seen.has(key))return;this.seen.add(key);const o={...outcome,encounterId:this.id,eligible:this.eligible};this.outcomes.push(o);if(this.outcomes.length>128)this.outcomes.shift();
    const s=this.stats;
    if(o.kind==='basic-hit')s.basicHits++;
    if(o.kind==='art-hit'){s.artHits++;if(o.artId==='crescent-break'&&(o.grade==='Good'||o.grade==='Perfect'))s.crescentHit=true;}
    if(o.kind==='art-phase'){s.artPhases++;if(o.grade==='Perfect')s.perfect++;else if(o.grade==='Good')s.good++;else s.miss++;}
    if(o.kind==='evade')s.evades++;if(o.kind==='parry')s.parries++;if(o.kind==='break')s.breaks++;
    if(o.kind==='damage'){s.damageTaken+=o.amount;if(o.failedCounter)s.failedCounters++;}
    if(o.kind==='defeat')s.defeats++;
  }
  get objectiveMet(){const s=this.stats;return this.challenge==='positioning'?s.basicHits>=3&&s.evades>=1:this.challenge==='breaking'?s.artHits>=1&&s.breaks>=1:this.challenge==='countering'?s.parries>=3:this.challenge==='trial'?s.defeats>=2:false;}
}
