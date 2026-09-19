export interface ArtDefinition {
  id: string; name: string; description: string; weapon: 'sword'; cost: number;
  startup: number; recovery: number; movement: number;
  nodes: { at: number; damage: number; break: number; range: number; input: 'press' }[];
  finisher?: { at: number; damage: number; break: number; range: number; perfectBonus: number };
}
export const arts: Record<string, ArtDefinition> = {
  'crescent-break': {
    id: 'crescent-break', name: 'Crescent Break', description: 'One committed cut. Tap once at the bright note.', weapon: 'sword', cost: 30,
    startup: 280, recovery: 340, movement: 1.2,
    nodes: [{ at: 620, damage: 70, break: 40, range: 3.5, input: 'press' }],
  },
};
export function validateArts() {
  for (const art of Object.values(arts)) {
    if (art.cost < 0 || art.nodes.length === 0 || art.nodes.some((n, i) => n.at <= (art.nodes[i - 1]?.at ?? art.startup)) || (art.finisher && art.finisher.at <= art.nodes.at(-1)!.at)) throw new Error(`Invalid Art: ${art.id}`);
  }
}
