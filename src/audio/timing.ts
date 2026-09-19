import type {CombatSimulation} from '../combat/simulation';
export interface TimingNote {at:number;frequency:number;accent:boolean; voice?: 'offense' | 'defense';}
export interface TimingPhrase {id:string;notes:TimingNote[];}
/** Absolute simulation deadlines shared with hit grading, never frame-count beats. */
export function timingPhrase(sim:CombatSimulation):TimingPhrase|null {

  if(sim.art&&['ArtStartup','ArtSequence','ArtRecovery'].includes(sim.state.state)){
    const art=sim.art,notes:TimingNote[]=[];
    art.definition.nodes.forEach((node,i)=>{
      const frequency=[440,523.25,659.25][i%3];
      notes.push({at:art.start+node.at-280,frequency:frequency*.5,accent:false},{at:art.start+node.at,frequency,accent:true});
    });
    if(art.definition.finisher)notes.push({at:art.start+art.definition.finisher.at,frequency:880,accent:true});
    return {id:`art:${art.start}`,notes};
  }
  return null;
}

/** Preparation notes per enemy hit, including the second cut. */
export function enemyTimingPhrases(sim:CombatSimulation):TimingPhrase[] {
 if(sim.flags.freezeAI||sim.player.hp<=0||sim.art)return [];
 return sim.enemies.filter(e=>e.pattern?.kind==='skill'&&e.hp>0).sort((a,b)=>Math.hypot(a.x-sim.player.x,a.z-sim.player.z)-Math.hypot(b.x-sim.player.x,b.z-sim.player.z)).slice(0,1).map(e=>{
  const pattern=e.pattern!,notes:TimingNote[]=[];
  pattern.hits.forEach(at=>{
   const cue=e.attackStart+at-(pattern.parryable?80:150),base=pattern.parryable?330:130;
   [-320,0].forEach((offset,i)=>notes.push({at:cue+offset,frequency:base*(i===0?.5:1),accent:i===1,voice:'defense'}));
  });
  return {id:'enemy:'+e.id+':'+e.attackStart,notes};
 });
}
