import type {CombatSimulation} from '../combat/simulation';
export interface TimingNote {at:number;frequency:number;accent:boolean;}
export interface TimingPhrase {id:string;notes:TimingNote[];}
/** Absolute simulation deadlines shared with hit grading, never frame-count beats. */
export function timingPhrase(sim:CombatSimulation):TimingPhrase|null {

  if(sim.art&&['ArtStartup','ArtSequence','ArtRecovery'].includes(sim.state.state)){
    const art=sim.art,notes:TimingNote[]=[];
    art.definition.nodes.forEach((node,i)=>{
      const frequency=[440,523.25,659.25][i%3];
      notes.push({at:art.start+node.at-280,frequency:frequency*.5,accent:false},{at:art.start+node.at,frequency,accent:true});
    });
    notes.push({at:art.start+art.definition.finisher.at,frequency:880,accent:true});
    return {id:`art:${art.start}`,notes};
  }
  return null;
}

/** Preparation notes per enemy hit, including the second cut. */
export function enemyTimingPhrases(sim:CombatSimulation):TimingPhrase[] {
 if(sim.flags.freezeAI||sim.player.hp<=0)return [];
 return sim.enemies.filter(e=>e.pattern&&e.hp>0).map(e=>{
  const pattern=e.pattern!,notes:TimingNote[]=[];
  pattern.hits.forEach(at=>{
   const cue=e.attackStart+at-(pattern.parryable?80:150),base=pattern.parryable?330:130;
   [-500,-280,-140,0].forEach((offset,i)=>notes.push({at:cue+offset,frequency:base*[1,1.25,1.5,2][i],accent:i===3}));
  });
  return {id:'enemy:'+e.id+':'+e.attackStart,notes};
 });
}
