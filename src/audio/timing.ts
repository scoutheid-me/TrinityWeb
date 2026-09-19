import {chargeDuration} from '../data/arts';
import {imminentThreat} from '../combat/timeline';
import type {CombatSimulation} from '../combat/simulation';
export interface TimingNote {at:number;frequency:number;accent:boolean; voice?: 'offense' | 'defense';}
export interface TimingPhrase {id:string;notes:TimingNote[];}
/** Absolute simulation deadlines shared with hit grading, never frame-count beats. */
export function timingPhrase(sim:CombatSimulation):TimingPhrase|null {

  if(sim.art&&!sim.art.awaitingHold&&sim.art.grades[sim.art.stage]===null){
    const art=sim.art,notes:TimingNote[]=[];
    const at=art.start+chargeDuration(art.definition,art.stage),frequency=art.stage?659.25:440;
    notes.push({at:at-280,frequency:frequency*.5,accent:false},{at,frequency,accent:true});
    return {id:`art:${art.start}:${art.stage}`,notes};
  }
  return null;
}

/** Preparation notes per enemy hit, including the second cut. */
export function enemyTimingPhrases(sim:CombatSimulation):TimingPhrase[] {
 if(sim.flags.freezeAI||sim.player.hp<=0||sim.art)return [];
 const selected=imminentThreat(sim,true);
 return (selected?[selected.enemy]:[]).map(e=>{
  const pattern=e.pattern!,notes:TimingNote[]=[];
  pattern.hits.forEach(at=>{
   const cue=e.attackStart+at-(pattern.parryable?80:150),base=pattern.parryable?330:130;
   [-320,0].forEach((offset,i)=>notes.push({at:cue+offset,frequency:base*(i===0?.5:1),accent:i===1,voice:'defense'}));
  });
  return {id:'enemy:'+e.id+':'+e.attackStart,notes};
 });
}
