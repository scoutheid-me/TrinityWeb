import type {HitShape} from '../combat/geometry';
export interface ArtDefinition {
  id: string; name: string; description: string; weapon: string; shape?:HitShape; maxTargets?:number; travelStrike?:boolean; goodMovement?:number; sideMovement?:number; restoreStamina?:number; cost: number;
  startup: number; recovery: number; movement: number; arc:number; armor:boolean; motion:"basic"|"art"; counterWindow?:number; cancelAfter?:number;
  nodes: { at: number; multiplier: number; break: number; range: number; input: 'press' }[];
  finisher?: { at: number; multiplier: number; break: number; range: number; perfectBonus: number };
}
export const arts: Record<string, ArtDefinition> = {
 'focused-strike':{id:'focused-strike',name:'Focused Strike',description:'One precise close-range strike. Hits only the first target in its narrow lane.',weapon:'any',cost:15,startup:180,recovery:260,movement:.15,arc:.25,armor:true,motion:'basic',shape:{kind:'box',range:2.4,halfWidth:.28},maxTargets:1,nodes:[{at:520,multiplier:6,break:20,range:2.4,input:'press'}]},
 'linear':{id:'linear',name:'Linear',description:'A straight piercing dash. Perfect travels through the target; Good is a short thrust that usually stops in front.',weapon:'any',cost:25,startup:320,recovery:360,movement:6,goodMovement:1,arc:.18,armor:true,motion:'basic',travelStrike:true,shape:{kind:'box',range:1.4,halfWidth:.32},maxTargets:1,nodes:[{at:680,multiplier:10,break:25,range:1.4,input:'press'}]},
  'crescent-break': {
    id: 'crescent-break', name: 'Crescent Break', description: 'One committed cut. Hold its slot button; release at the bright note.', weapon: 'sword', cost: 30,
    startup: 280, recovery: 340, movement: 1.2, arc:1.4, armor:true, motion:"art",
    nodes: [{ at: 620, multiplier:17.5, break: 40, range: 3.5, input: 'press' }],
  },
};
Object.assign(arts,{
 'aether-step':{id:'aether-step',name:'Aether Step',description:'Sidestep right into a single diagonal cut; gain lateral space without passing through the target.',weapon:'sword',cost:20,startup:300,recovery:230,movement:0,sideMovement:2,arc:.95,armor:false,motion:'basic',nodes:[{at:440,multiplier:10.5,break:12,range:3.2,input:'press'}]},
 'resonant-cleave':{id:'resonant-cleave',name:'Resonant Cleave',description:'A committed heavy cut that crushes Break. Long recovery.',weapon:'sword',cost:35,startup:320,recovery:600,movement:.3,shape:{kind:'box',range:3,halfWidth:.48},maxTargets:1,arc:1.1,armor:true,motion:'art',nodes:[{at:820,multiplier:13.5,break:72,range:3,input:'press'}]},
 'stillwater-return':{id:'stillwater-return',name:'Stillwater Cut',description:'A compact breath-timed cut. Landing it restores 14 stamina; a miss restores nothing.',weapon:'sword',cost:18,startup:150,recovery:260,movement:0,restoreStamina:14,maxTargets:1,shape:{kind:'box',range:2.2,halfWidth:.3},arc:1.2,armor:true,motion:'basic',nodes:[{at:400,multiplier:11.25,break:18,range:3,input:'press'}]},
 'wayfarer-oath':{id:'wayfarer-oath',name:"Wayfarer's Oath",description:'Two measured cuts. Release the first charge, then hold and release the same slot again for the returning strike.',weapon:'sword',cost:40,startup:220,recovery:420,movement:1,arc:1.3,armor:true,motion:'art',nodes:[{at:620,multiplier:11.25,break:20,range:3.2,input:'press'},{at:1420,multiplier:16.25,break:30,range:3.4,input:'press'}]},
 'needle-step':{id:'needle-step',name:'Needle Step',description:'A fast rapier thrust with a sidestep. Perfect moves 2 m forward and 1.4 m right; Good shortens forward travel. One target only.',weapon:'rapier',cost:20,startup:160,recovery:180,movement:2,goodMovement:.5,sideMovement:1.4,arc:.2,armor:false,motion:'basic',travelStrike:true,maxTargets:1,shape:{kind:'box',range:2,halfWidth:.28},nodes:[{at:430,multiplier:12,break:14,range:2,input:'press'}]},
 'iron-horizon':{id:'iron-horizon',name:'Iron Horizon',description:'A broad two-handed cleave that strikes every foe in front. High damage and Break; commit to the long recovery.',weapon:'greatsword',cost:35,startup:350,recovery:850,movement:.5,arc:1.2,armor:true,motion:'art',shape:{kind:'sector',range:3.6,halfArc:1.2},nodes:[{at:850,multiplier:12,break:60,range:3.6,input:'press'}]},
} satisfies Record<string,ArtDefinition>);
export function chargeDuration(art:ArtDefinition,stage=0){return art.nodes[stage].at-(art.nodes[stage-1]?.at??0);}
export function validateArts() {
  for (const art of Object.values(arts)) {
    if (art.cost < 0 || art.nodes.length === 0 || art.nodes.some((n, i) => n.at <= (art.nodes[i - 1]?.at ?? art.startup)) || (art.finisher && art.finisher.at <= art.nodes.at(-1)!.at)) throw new Error(`Invalid Art: ${art.id}`);
  }
}

export function artShape(def:ArtDefinition,stage=0):HitShape{return def.shape??{kind:'sector',range:def.nodes[stage].range,halfArc:def.arc};}
