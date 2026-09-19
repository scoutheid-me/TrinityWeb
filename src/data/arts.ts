export interface ArtDefinition {
  id: string; name: string; description: string; weapon: 'sword'; cost: number;
  startup: number; recovery: number; movement: number;
  nodes: { at: number; damage: number; break: number; range: number; input: 'press' }[];
  finisher: { at: number; damage: number; break: number; range: number; perfectBonus: number };
}
export const arts: Record<string, ArtDefinition> = {
  'crescent-break': {
    id: 'crescent-break', name: 'Crescent Break', description: 'Three rising cuts. A luminous finisher. Press at each pulse.', weapon: 'sword', cost: 30,
    startup: 280, recovery: 520, movement: 1.2,
    nodes: [{ at: 620, damage: 22, break: 14, range: 3.2, input: 'press' }, { at: 1180, damage: 24, break: 16, range: 3.2, input: 'press' }, { at: 1740, damage: 30, break: 20, range: 3.5, input: 'press' }],
    finisher: { at: 2100, damage: 34, break: 24, range: 3.8, perfectBonus: 1.5 },
  },
};
export function validateArts() {
  for (const art of Object.values(arts)) {
    if (art.cost < 0 || art.nodes.length === 0 || art.nodes.some((n, i) => n.at <= (art.nodes[i - 1]?.at ?? art.startup)) || art.finisher.at <= art.nodes.at(-1)!.at) throw new Error(`Invalid Art: ${art.id}`);
  }
}
