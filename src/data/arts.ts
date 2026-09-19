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
 'aether-step':{id:'aether-step',name:'Aether Step',description:'Close distance with a quick, narrow cut. Dodge may cancel after the hit.',weapon:'sword',cost:20,startup:300,recovery:230,movement:3,arc:.75,armor:false,motion:'basic',cancelAfter:360,nodes:[{at:440,damage:42,break:12,range:2.5,input:'press'}]},
 'resonant-cleave':{id:'resonant-cleave',name:'Resonant Cleave',description:'A committed heavy cut that crushes Break. Long recovery.',weapon:'sword',cost:35,startup:320,recovery:600,movement:.6,arc:1.1,armor:true,motion:'art',nodes:[{at:820,damage:54,break:72,range:3,input:'press'}]},
 'stillwater-return':{id:'stillwater-return',name:'Stillwater Return',description:'Spend a recent Perfect Parry opportunity on a swift counter-cut.',weapon:'sword',cost:15,startup:150,recovery:260,movement:1,arc:1.2,armor:true,motion:'basic',counterWindow:2200,nodes:[{at:400,damage:82,break:28,range:3,input:'press'}]},
} satisfies Record<string,ArtDefinition>);
export function validateArts() {
  for (const art of Object.values(arts)) {
    if (art.cost < 0 || art.nodes.length === 0 || art.nodes.some((n, i) => n.at <= (art.nodes[i - 1]?.at ?? art.startup)) || (art.finisher && art.finisher.at <= art.nodes.at(-1)!.at)) throw new Error(`Invalid Art: ${art.id}`);
  }
}
