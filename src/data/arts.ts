export interface ArtDefinition {
  id: string; name: string; description: string; weapon: 'sword'; cost: number;
  startup: number; recovery: number; movement: number; arc:number; armor:boolean; motion:"basic"|"art"; counterWindow?:number; cancelAfter?:number;
  nodes: { at: number; damage: number; break: number; range: number; input: 'press' }[];
  finisher?: { at: number; damage: number; break: number; range: number; perfectBonus: number };
}
export const arts: Record<string, ArtDefinition> = {
  'crescent-break': {
    id: 'crescent-break', name: 'Crescent Break', description: 'One committed cut. Hold its slot button; release at the bright note.', weapon: 'sword', cost: 30,
    startup: 280, recovery: 340, movement: 1.2, arc:1.4, armor:true, motion:"art",
    nodes: [{ at: 620, damage: 70, break: 40, range: 3.5, input: 'press' }],
  },
};
Object.assign(arts,{
 'aether-step':{id:'aether-step',name:'Aether Step',description:'A short forward step and a single light cut.',weapon:'sword',cost:20,startup:300,recovery:230,movement:3,arc:.75,armor:false,motion:'basic',nodes:[{at:440,damage:42,break:12,range:2.5,input:'press'}]},
 'resonant-cleave':{id:'resonant-cleave',name:'Resonant Cleave',description:'A committed heavy cut that crushes Break. Long recovery.',weapon:'sword',cost:35,startup:320,recovery:600,movement:.6,arc:1.1,armor:true,motion:'art',nodes:[{at:820,damage:54,break:72,range:3,input:'press'}]},
 'stillwater-return':{id:'stillwater-return',name:'Stillwater Cut',description:'A quick, inexpensive cut for a small opening.',weapon:'sword',cost:18,startup:150,recovery:260,movement:1,arc:1.2,armor:true,motion:'basic',nodes:[{at:400,damage:45,break:18,range:3,input:'press'}]},
 'wayfarer-oath':{id:'wayfarer-oath',name:"Wayfarer's Oath",description:'Two measured cuts. Release the first charge, then hold and release the same slot again for the returning strike.',weapon:'sword',cost:40,startup:220,recovery:420,movement:1,arc:1.3,armor:true,motion:'art',nodes:[{at:620,damage:45,break:20,range:3.2,input:'press'},{at:1420,damage:65,break:30,range:3.4,input:'press'}]},
} satisfies Record<string,ArtDefinition>);
export function chargeDuration(art:ArtDefinition,stage=0){return art.nodes[stage].at-(art.nodes[stage-1]?.at??0);}
export function validateArts() {
  for (const art of Object.values(arts)) {
    if (art.cost < 0 || art.nodes.length === 0 || art.nodes.some((n, i) => n.at <= (art.nodes[i - 1]?.at ?? art.startup)) || (art.finisher && art.finisher.at <= art.nodes.at(-1)!.at)) throw new Error(`Invalid Art: ${art.id}`);
  }
}
