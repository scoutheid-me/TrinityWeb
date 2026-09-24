# Training skills and item balance

The **Training Room** is inside the Guild Hall, Town of Beginnings. The town itself is not implemented. The room starts empty. Walk to the entrance orb and press **E** (remappable) for the single **Guild Combat Trial**, or repeat Sentinel / Boar sparring. The retired four-part Guild Trials are no longer exposed in the UI. Existing earned skills remain compatible with saves.

Ilyra is an NPC contact. Her only current quest is the Guild Combat Trial. Completion moves it into Friends → Ilyra → Completed quests. Friends does not launch trials or list the Guild Hall as a friend. Characters have no automatic title.

## Skill families

- **Basic Arts:** shared weapon-independent forms. Everyone begins with Focused Strike. Linear is the induction reward. Both use the equipped weapon's original base damage.
- **Combat Arts:** specialist forms, currently restricted by weapon. Class restrictions are a future extension; no class is assigned to a new character.
- **Skill Books:** themed trees with prerequisites. Lantern Road Forms is an inspectable preview of a future tutorial-dungeon reward. Ownership and that dungeon are not implemented yet.

Exactly four unique, learned, compatible Arts can be equipped through M → Character → Skills. Click a skill name for stats, radar guide and slot assignment. The radar guide defines Damage, Reach, Travel, Break, Recovery and SP economy; points expose precise values on hover/focus. Higher Recovery / SP economy scores mean shorter recovery / lower cost.

Perfect is ±55 ms. Good is within ±120 ms and gives 60% damage/Break. Miss spends SP and produces no strike. Hold and release the same assigned key. Perfect Linear travels 6 m; Good travels 1 m. Arena edges can shorten movement.

## Three-weapon rack

Walk close to the rack and press E. It displays original Blender models and comparison radars with exact values. Changing weapons teaches their specialty practice Art and removes incompatible equipped Arts, retaining shared Basic Arts.

| Weapon | Base single damage | Base damage per group victim | Break | Footprint | Wind-up / recovery |
| --- | ---: | ---: | ---: | --- | --- |
| Sword | 8 | 6 when 2+ living targets are caught | 2 | 2.9 m, 60° fan | 87 / 240 ms |
| Rapier | 10 | Single target only | 3 | 3.1 m, 0.44 m lane | 55 / 140 ms |
| Greatsword | 28 | 28 | 9 | 3.2 m, about 155° fan | 320 / 400 ms |

Basic group scaling counts living targets in the strike footprint and applies once per victim. It never changes Art scaling. Final damage rounds after Strength scaling; at starting Strength 10 the sword does 10 single / 8 group damage, rapier 13, and greatsword 35. Basic contact adds 140 ms to the attack cycle. Dexterity scales wind-up. Sword guard is strongest and leaves a future shield hand free; usable shields are not implemented.

Needle Step is a rapier-only mobile thrust. Iron Horizon is a greatsword-only broad cleave. Other retained specialist forms require the sword; regular-combat unlock requirements remain in the bank.

Attack yaw follows the actual sector angle; narrow boxes use thrust poses and straight range trails, with greatsword hand constraints maintained. Existing rigid-part models are reused. Contact still resolves using authored footprints rather than continuous blade-mesh collision; skinned animation and polish remain future work.

## GM item editor

Open **Esc → GM mode · item editor** outside combat. Enable GM, select a weapon, Art or supply, change its fields and press **Apply & save locally**. Fan angles are edited in full degrees. Timing, damage, Break, reach, travel and resource fields are editable; asset identity/type fields are fixed. Invalid numbers or invalid event ordering are rejected atomically. Changes affect combat and charts, persist in separate local storage, and do not rewrite character progression or repository defaults. GM mode blocks progression gains and induction entry. Disable it to return to normal shipped balance. Reset restores shipped values; Download exports a tuned JSON item bank. The GM badge identifies altered play.

The regular skill bank is `public/data/skill-bank.json`, generated from shipped data by `npm run export:skills` and every build. GM overrides are exported separately.

## Positioning and timing feedback

T cycles nearby living targets; with no other target it unlocks for freeform movement and attacks. Tab also unlocks. Sentinel and boar turn at 126°/s and 103°/s, with slower early wind-up tracking; committed attacks and recovery retain their facing. They must turn within 30° of the player before chasing or starting another attack. Circle attacks still cover the rear.

Rear weak points give 20% extra damage within a 120° cone behind the enemy, checked at each actual hit (including Arts). Linear hitting on approach does not retroactively earn a rear bonus; use the resulting opening for the next strike. Floating REAR damage and a brighter hit sound identify the bonus. It stacks with Broken damage, without extra Break.

Art cues build in pitch and volume toward release; enemy Counter cues use a five-note minor-pentatonic ascent ending in a chord, while dodge cues retain a distinct low warning. The defensive accent precedes impact by 80 ms for counters / 150 ms for dodges. Enemy basics now have a quieter five-note Counter melody; player basics remain untimed. Enemy musical cues yield during player Arts. Radar points and labels share visible hover/focus/click help with exact values; expandable guides remain available.

September 23 balance: greatsword is intentionally the highest overall damage/Break weapon, including sustained single target. Rapier remains fast and mobile, and beats sword single-target. Shared/specialist Art Break scales ×1.1 with rapier and ×1.6 with greatsword (shown in skill details). Counter costs 16 stamina; Counter Break is 32 plus twice the weapon Basic Break above 2. Its damage remains twice weapon base, with +14 SP and zero incoming damage on success. See balance/weapon-benchmark.json for real-executor benchmarks.
