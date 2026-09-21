# Training skills and equipment

Fresh characters start with **Focused Strike**. Finishing Ilyra's induction grants **only Linear** as the new reward. Tutorial/debug practice does not advance regular-play unlock counters. Existing v3 characters retain their old Crescent starter.

**Guild Hall Training Room** is planned inside the Town of Beginnings Guild Hall; the town itself is not built. Three weapons are available under **the physical weapon rack (walk close and press G)**: one-handed sword, rapier, two-handed sword. Weapon selection is available only at the rack; M → Character → Skills edits skill slots. Their basics differ in shape, reach, speed, damage and guard efficiency. Focused Strike and Linear work with all three; other Guild forms currently require the one-handed sword.

| Art | Early acquisition | Regular combat alternative | Unique role |
| --- | --- | --- | --- |
| Focused Strike | Starter | Starter | 15 SP, 520 ms hold; compact single-target strike |
| Linear | Finish induction | 12 basic hits + 2 evades | 25 SP, 680 ms hold; Perfect travels 6 m through a target, Good travels 1 m |
| Crescent Break | — | 20 basic hits | 30 SP, 620 ms hold; wide multi-target fan |
| Aether Step | Footwork | 6 evades | 20 SP, 440 ms hold; 2 m right sidestep with diagonal cut, interruptible |
| Resonant Cleave | Break the guard | 3 Breaks | 35 SP, 820 ms hold; narrow heavy guard-breaker, 600 ms recovery |
| Stillwater Cut | Counter discipline | 6 Perfect Parries | 18 SP, 400 ms hold; compact cut restores 14 stamina on Perfect hit, 8.4 on Good |
| Wayfarer's Oath | Final Guild Trial | 8 defeats + 8 parries + 4 Breaks | 40 SP; 620 ms first hold, then 800 ms second hold; two cuts |

Hold an Art button and release on its visual/musical event. Perfect is ±55 ms; Good is within ±120 ms, outside Perfect. Good damage/Break is 60%; Miss does not strike and spends SP. Linear locks direction at release, samples its moving hitbox and hits at most one target once. Arena edges shorten travel. Other Arts strike on their contact frame. Indicators use collision geometry.

Four unique learned, compatible slots can be edited on the HUD or Guild journal. Expanded cards show current-Strength damage, Break, travel, hold windows, shape, targets, recovery, protection and fixed-scale radar charts. Download the bank from either menu: `/data/skill-bank.json`. `npm run export:skills` regenerates it from definitions; every build runs the export.

Crescent mastery requires a landed Crescent hit in two distinct completed trials: choose 200 ms recovery or +35% Break with 460 ms recovery. The final trial grants the Wayfarer title. The second Oath hold must start within 1.6 seconds of first contact. Missing ends the remaining chain; cancelling after contact does not refund SP.

First person supports held mouse-look and arrow keys. Target lock automatically faces the enemy. The personal journal stays live; explicit pause and focus loss still pause safely.

Weapons are original Blender exports. Motion reuses the prototype rigid-part rig. The greatsword uses articulated elbows and two grip constraints in both views. Hands remain stylized rigid meshes; skinned animation, impact polish, inventory and outdoor progression remain future work.

## Hall interaction and camera

The hall starts empty. Starting an induction lesson or Guild trial creates the required enemies; reset/exit/completion returns to an empty room. Debug spawning remains an explicit lab tool.

Walk to the brass weapon rack and press **G** (remappable Interact), or click its proximity prompt, to choose a weapon. Walking away closes it; trials and tutorial lessons prevent equipment changes. Art slots are edited only in M → Character → Skills.

**M** toggles the personal menu; side controls stay hidden until opened. First-person menus are translucent viewport-mounted panels and keep the world running. Movement and camera look continue unless capturing a new key binding. Escape/focus loss still provide explicit pause safety. Right-drag look is inverted on both axes. **Controls → Automatically face locked target** toggles camera tracking and player auto-facing in both perspectives and persists across reloads. Committed Art trajectories keep their released direction.

## Weapon-relative damage (skill bank schema 2)

Art nodes now store multipliers rather than fixed damage. Perfect damage per node is weapon base damage × node multiplier × (1 + Strength × 0.025); Good applies 0.6 and Miss applies zero. Break/stamina effects remain separately authored. Foundation forms are general: Focused Strike 6× and Linear 10×. Weapon-restricted forms receive larger coefficients: Aether Step 10.5×, Stillwater Cut 11.25×, Resonant Cleave 13.5×, Crescent Break 17.5×, and Oath 11.25× + 16.25×. Costs, timing, coverage, recovery and utility still matter; restrictions support stronger coefficients rather than replacing balance. Skill cards and the generated JSON bank share these values.

## Skill Books introduction

Skill Books are cohesive collections that expose branching skill trees with authored prerequisites. The Skills menu contains an interactive four-node Lantern Road Forms preview, and the final induction lesson explains the concept. Nodes show prior-skill dependencies and eligible practice milestones, with known skills distinguished from book ownership. The schema supports different node counts and graph layouts. The book catalogue is included in the downloadable skill bank.

This small primer is planned as the final reward of the future tutorial dungeon. Acquisition, study/spending and that dungeon are not implemented; the tree is explicitly marked NOT OWNED / preview only and cannot grant rewards. Current induction still awards only Linear, and the current Guild Trial still awards Wayfarer's Oath. Future integration must add book ownership, validated study transactions and dungeon completion rewards without duplicating independently learned skills.
