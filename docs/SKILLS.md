# Combat Arts and Guild mastery

Exactly four unique equipped slots, initially Crescent Break and three empty slots. The paused Guild board edits learned sword Arts between challenges. Save v3 validates ownership and prerequisites; activation rechecks weapon and loadout legality. Invalid saves recover safely. Tutorial practice cannot unlock Arts.

| Art | Earned from | Cost | Role |
| --- | --- | --- | --- |
| Crescent Break | Starter | 30 SP | Armored committed cut, charge release at 620 ms |
| Aether Step | Footwork | 20 SP | 3 m approach, narrow charge release at 440 ms, interruptible; no follow-up requirement |
| Resonant Cleave | Break the guard | 35 SP | 72 base Break, charge release at 820 ms, 600 ms recovery |
| Stillwater Cut | Counter discipline | 18 SP | Simple fast cut, release at 400 ms; no counter prerequisite |
| Wayfarer’s Oath | Final Guild Trial | 40 SP | Two cuts: hold/release at 620 ms, then hold/release again at 800 ms |

All beginner Arts charge while holding their equipped slot button and grade the release of that same button. Perfect applies 100% damage/Break; Good applies 60%; Miss performs no attack and spends the SP. Holding beyond the Good window also fails. Successful release starts the authored lunge/swing, then contact after the definition startup duration. Basics cannot supply the Art timing input. Their movement, arc, interruption protection, animation reference, cancel/counter windows and recovery live in Art data. Damage still applies during protected Arts. Pause/focus loss cancels an unreleased charge and refunds its SP; released swings remain committed. The cyan preview uses the same sector range and arc as damage. Motion references reuse the prototype rigid-part clips; these are not bespoke skinned animation sets.

Crescent mastery: complete two distinct challenges with a landed Good/Perfect Crescent hit. A unique challenge contributes at most one credit, including replays. Choose 200 ms recovery or +35% Break with 460 ms recovery; modifiers do not stack, and may be changed between challenges. Whiffs and practice/debug sessions provide no credit. Challenge telemetry and earned sources are separate from lifetime counters.

Future acquisition tiers, trainers, branching inputs, additional weapon categories and secret quest discoveries remain in the broader design. The current weapon is a sword; no equipment inventory or hidden-quest system is implemented.

The final trial also earns the visible Wayfarer title. Oath deals 45 + 65 base damage and 20 + 30 Break before grade/stat modifiers. Each release is graded independently; a miss ends the remaining chain and never undoes a hit already landed. The second hold must begin within 1.6 seconds of the first contact. Pausing before the first release refunds SP; cancelling after the first strike never refunds the shared cost. Old saves with the final trial completed acquire the new reward through progression validation. Stillwater retains its original save ID for compatibility.
