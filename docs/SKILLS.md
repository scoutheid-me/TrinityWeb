# Combat Arts and Guild mastery

Exactly four unique equipped slots, initially Crescent Break and three empty slots. The paused Guild board edits learned sword Arts between challenges. Save v3 validates ownership and prerequisites; activation rechecks weapon and loadout legality. Invalid saves recover safely. Tutorial practice cannot unlock Arts.

| Art | Earned from | Cost | Role |
| --- | --- | --- | --- |
| Crescent Break | Starter | 30 SP | Armored committed cut, charge release at 620 ms |
| Aether Step | Footwork | 20 SP | 3 m approach, narrow charge release at 440 ms, interruptible; dodge cancel 360 ms after release |
| Resonant Cleave | Break the guard | 35 SP | 72 base Break, charge release at 820 ms, 600 ms recovery |
| Stillwater Return | Counter discipline | 15 SP | Charge release at 400 ms; consumes one Perfect Parry opportunity lasting 2.2 seconds |

All beginner Arts charge while holding their equipped slot button and grade the release of that same button. Perfect applies 100% damage/Break; Good applies 60%; Miss performs no attack and spends the SP. Holding beyond the Good window also fails. Successful release starts the authored lunge/swing, then contact after the definition startup duration. Basics cannot supply the Art timing input. Their movement, arc, interruption protection, animation reference, cancel/counter windows and recovery live in Art data. Damage still applies during protected Arts. Pause/focus loss cancels an unreleased charge and refunds its SP; released swings remain committed. The cyan preview uses the same sector range and arc as damage. Motion references reuse the prototype rigid-part clips; these are not bespoke skinned animation sets.

Crescent mastery: complete two distinct challenges with a landed Good/Perfect Crescent hit. A unique challenge contributes at most one credit, including replays. Choose 200 ms recovery or +35% Break with 460 ms recovery; modifiers do not stack, and may be changed between challenges. Whiffs and practice/debug sessions provide no credit. Challenge telemetry and earned sources are separate from lifetime counters.

Future acquisition tiers, trainers, branching inputs, additional weapon categories and secret quest discoveries remain in the broader design. The current weapon is a sword; no equipment inventory or hidden-quest system is implemented.
