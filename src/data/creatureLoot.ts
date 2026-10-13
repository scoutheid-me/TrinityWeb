/** Equipment and harvest sources are shared by presentation and loot. */
export const creatureEquipment={
 goblin:{weapon:'cleaver',model:'/assets/weapons/goblin_cleaver.glb'},
 captain:{weapon:'cleaver',model:'/assets/weapons/goblin_cleaver.glb'},
} as const;
export const lootItems={
 dagger:{name:'Goblin-forged dagger',source:'Scavenged camp cache',use:'A fast, short-range weapon. Equip it from Items.'},
 cleaver:{name:'Goblin cleaver',source:'The cleaver carried by goblin sentries and their captain',use:'A short, broad chopping weapon. Equip it from Items.'},
 scrapIron:{name:'Iron fragments',source:'Damaged goblin cleavers and metal fittings',use:'Crafting material for metal weapons and armor fittings. Crafting is not available yet.'},
 leatherScraps:{name:'Worn leather scraps',source:'Goblin equipment straps and worn leather gear',use:'Crafting material for leather armor patches and grips. Crafting is not available yet.'},
 hide:{name:'Boar hide',source:'Hide-bearing wild boars',use:'Can be tanned into leather for armor. Crafting is not available yet; Guild practice awards no loot.'},
 wolfPelt:{name:'Wolf pelt',source:'Grassland wolves',use:'A warm crafting material for leather armor and travel clothing. Crafting is not available yet.'},
 token:{name:'Captain’s token',source:'Goblin captain insignia',use:'A crown and three spears. Keep it for the eastern watch.'},
} as const;
export type LootItem=keyof typeof lootItems;
export type LootInventory=Record<LootItem,number>;
export const emptyLoot=():LootInventory=>({dagger:0,cleaver:0,scrapIron:0,leatherScraps:0,hide:0,wolfPelt:0,token:0});
export type LootCreature='goblin'|'captain'|'boar'|'wolf';

/** Color and text are both exposed; common dungeon salvage remains neutral gray. */
export const lootRarities={common:{label:'Common',color:'#737c87'},uncommon:{label:'Uncommon',color:'#6bdc9a'},rare:{label:'Rare',color:'#67adff'},epic:{label:'Epic',color:'#bb85ee'}} as const;
export function itemRarity(id:LootItem):keyof typeof lootRarities{return id==='token'?'uncommon':'common';}
