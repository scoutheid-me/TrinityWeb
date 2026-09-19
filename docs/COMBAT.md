# Combat contract

Central configuration: `src/data/balance.ts`; formulas for Strength damage, Dexterity preparation, Vitality HP, and Endurance stamina live there. Initial attributes are 10 each: 200 HP, 100 stamina, ~87 ms basic startup.

## Basics and Arts

Basic attacks commit on press and automatically strike after Dexterity-adjusted startup (100 ms base, 60 ms floor). No timing grade or release is required. Base damage is 4 (5 at initial Strength), Break is 2, and a landed phase grants 10 SP once regardless of victim count. SP caps at 100.

Crescent Break spends 30 SP before starting. Three input nodes at 620, 1180, and 1740 ms accept a press within ±120 ms; accepted early inputs resolve at the target timestamp, accepted late inputs on the next simulation substep, and misses at the window end. Perfect/Good/Miss produce ×1.25/1/0.7 phase damage and Break. A finisher at 2100 ms gains ×1.5 if all three nodes were Perfect. Recovery lasts 520 ms. Missing inputs does not cancel the Art.

A single action may be buffered in the last 100 ms of basic/Art recovery; it executes only upon reaching a legal free state. Pause/reset/hit interruption clears it.

State transitions prevent attack, Art, dodge, and parry overlap. Current Art phases cannot be freely cancelled. Incoming unavoided damage interrupts into hit reaction; death blocks all combat actions until encounter reset.

## Defense and enemies

Dodge costs 24 stamina, moves at 10 m/s for 460 ms, and grants invulnerability from 40–330 ms. Direction follows movement intent; without input it follows facing. Parry costs 8 stamina, has a 170 ms window, requires facing the attacker, grants 14 SP and 32 Break, and releases the state on success so another parry can follow. Red sweeps cannot be parried. Guard consumes 24 stamina per hit and reduces damage to 20% if stamina suffices.

The Sentinel cycles through a telegraphed cleave, two-hit refrain, and un-parryable radial sweep. Tracking stops 260 ms before the initial impact. All attacks have recovery. Break at 100 produces 3400 ms vulnerability and ×1.6 damage taken; Break then resets. Current poise behavior is simple: ordinary hits produce visible reactions without cancelling committed enemy attacks; full Break interrupts them.

Hit volumes are horizontal range-and-angle sectors evaluated by the renderer-independent simulation. Each attack phase deduplicates victims. This is a gameplay hit-volume prototype, not physically exact blade collision. Debug overlays expose volumes and sampled visual attack arcs.

Visual feedback includes weapon timing flashes, trails, impact sparks, floating damage, brief pose hit-stop, restrained camera shake, procedural hit/stagger/death poses, and synthesized cues. No production animation clips yet.

Timing guide: converging squares mark Art taps. Defensive diamonds mark parries and open rings mark dodges, with explicit action labels. Rising original enemy phrases culminate 80 ms before a parryable impact or 150 ms before a sweep; these lead times fit the defensive windows. Each hit of a combo has its own phrase. Pause, reset, death, AI freeze, and Break cancel obsolete enemy notes. These synthesized action phrases are not a full background score.

A successful parry within the existing 170 ms window is explicitly labeled **Perfect Parry**: all incoming damage is negated, 14 SP is awarded up to the 100 cap, and 32 Break is applied. This names the existing successful outcome; it does not add a second, undocumented defensive timing tier. Late inputs and the un-parryable red sweep retain their previous behavior.

Reset clears encounter resources, positions, enemies, lock, and actions; counters persist. Debug cheat toggles remain selected during reset. Enemy AI freeze also freezes its pattern/recovery clocks.
