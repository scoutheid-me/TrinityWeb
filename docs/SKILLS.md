# Combat Arts

Exactly four equipped slots. The initial loadout contains Crescent Break in slot 1 and three visibly empty slots. Invalid or duplicate save loadouts recover to defaults. Empty slots fail safely; insufficient SP shows a notice and leaves resources/state unchanged.

Art definitions live in `src/data/arts.ts`, including weapon category, cost, startup, movement, timed hit nodes, damage, Break, range, finisher bonus, and recovery. The executor consumes this data. Current timed input support is press; directional, release, branching, cancellation windows, and status effects are future extensions, not implemented features.

**Crescent Break**: original beginner sword Art with one committed cut. 30 SP, one timed press, stronger Perfect outcomes, useful Break, and committed recovery. The training weapon is always the sword; equipment selection is not implemented.

Future acquisition: Common from merchants/trainers; Uncommon from meaningful NPC conditions; Rare from substantial quests; Legendary from hidden questlines; Mythic from exceptionally secret mastery/discovery chains. Preserve four slots even as the collection grows. Future mastery should change costs, cancels, finishers, or variants rather than merely stack tiny damage bonuses. Acquisition, mastery, and a loadout editing menu are not built in this milestone.
