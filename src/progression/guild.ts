import {arts} from '../data/arts';
export const challenges={
  positioning:{name:'Footwork',description:'Land 3 basic hits and evade a strike. Read the cleave lane and move through an opening.',reward:'aether-step',requires:[]},
  breaking:{name:'Break the guard',description:'Land a Combat Art and Break the sentinel. Build SP with basics or counters first.',reward:'resonant-cleave',requires:['positioning']},
  countering:{name:'Counter discipline',description:'Perfect Parry 3 strikes. A failed counter takes 50% extra damage.',reward:'stillwater-return',requires:['breaking']},
  trial:{name:'Guild Trial',description:'Defeat two sentinels with your chosen build. Only one enemy commits to an attack at a time.',reward:'wayfarer-oath',requires:['positioning','breaking','countering']},
} as const;
export type ChallengeId=keyof typeof challenges;
export type MasteryChoice='recovery'|'break';
export interface Progression {tutorialCompleted:boolean;field:{hits:number;evades:number;parries:number;breaks:number;kills:number};learned:Record<string,string>;completed:ChallengeId[];masterySources:ChallengeId[];masteryChoice:MasteryChoice|null;}
export function freshProgression():Progression{return {tutorialCompleted:false,field:{hits:0,evades:0,parries:0,breaks:0,kills:0},learned:{'focused-strike':'starter'},completed:[],masterySources:[],masteryChoice:null};}
export function canStart(progress:Progression,id:ChallengeId){return challenges[id].requires.every(key=>progress.completed.includes(key as ChallengeId));}
export function awardChallenge(progress:Progression,id:ChallengeId,crescentHit:boolean){
  const first=!progress.completed.includes(id);
  if(first){progress.completed.push(id);const reward=challenges[id].reward;if(reward)progress.learned[reward]=id;}
  if(crescentHit&&!progress.masterySources.includes(id))progress.masterySources.push(id);
  return first;
}
export function validateProgression(raw:unknown):Progression{
  const p=freshProgression();if(!raw||typeof raw!=='object')return p;
  const data=raw as Partial<Progression>;
  p.tutorialCompleted=data.tutorialCompleted===true;if(p.tutorialCompleted)p.learned.linear='induction';
  for(const k of Object.keys(p.field) as (keyof Progression['field'])[]){const v=data.field?.[k];if(typeof v==='number'&&Number.isFinite(v))p.field[k]=Math.max(0,Math.min(100000,Math.floor(v)));}
  if(data.learned?.['crescent-break']==='legacy'||(!('tutorialCompleted' in data)&&data.learned?.['crescent-break']==='starter'))p.learned['crescent-break']='legacy';
  for(const id of ['needle-step','iron-horizon'])if(data.learned?.[id]==='rack practice')p.learned[id]='rack practice';
  awardFieldSkills(p);
  // Acquisition follows completed authored challenges, not arbitrary learned-ID claims.
  for(const id of Object.keys(challenges) as ChallengeId[])if(Array.isArray(data.completed)&&data.completed.includes(id)&&canStart(p,id))awardChallenge(p,id,false);
  if(Array.isArray(data.masterySources))p.masterySources=[...new Set(data.masterySources.filter(id=>p.completed.includes(id)))];
  if(p.masterySources.length>=2&&(data.masteryChoice==='recovery'||data.masteryChoice==='break'))p.masteryChoice=data.masteryChoice;
  return p;
}
export function validLoadout(ids:(string|null)[],progress:Progression,weapon:string){return ids.length===4&&new Set(ids.filter(Boolean)).size===ids.filter(Boolean).length&&ids.every(id=>id===null||!!progress.learned[id]&&(arts[id]?.weapon===weapon||arts[id]?.weapon==='any'));}

export const guildStory={
 positioning:{chapter:'I · Keep your footing',brief:'Warden Ilyra: The Lantern Guild keeps the roads open when the watchfires go dark. A blade cannot protect a traveller if its bearer cannot stay standing.',debrief:'You found your footing. Take Aether Step: reach the opening, then leave room to breathe.'},
 breaking:{chapter:'II · Make an opening',brief:'The old sentinels were built to endure. Learn where their guard yields; strength without patience only wears down the traveller.',debrief:'Every guard has a limit. Resonant Cleave will help you find it.'},
 countering:{chapter:'III · Keep your nerve',brief:'A guild blade is a promise of restraint. Meet the blow without flinching, and answer with one clean cut.',debrief:'You held your nerve. Stillwater Cut is yours: a simple answer to a brief opening.'},
 trial:{chapter:'IV · The lantern oath',brief:'Two sentinels guard the oathstone. Carry footing, patience and nerve into one trial. Earn the Wayfarer title and our first paired Art: Wayfarer’s Oath.',debrief:'Ilyra: A lantern is a promise that someone will return. Today, you become one of those people. Bear the Wayfarer title, and carry our paired blade form with you.'}
} as const;

export function awardFieldSkills(p:Progression){const f=p.field;for(const [id,met] of [['linear',f.hits>=12&&f.evades>=2],['crescent-break',f.hits>=20],['aether-step',f.evades>=6],['resonant-cleave',f.breaks>=3],['stillwater-return',f.parries>=6],['wayfarer-oath',f.kills>=8&&f.parries>=8&&f.breaks>=4]] as const)if(met&&!p.learned[id])p.learned[id]='field practice';}
