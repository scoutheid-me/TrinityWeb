# Combat contract

Central configuration: `src/data/balance.ts`; formulas for Strength damage, Dexterity preparation, Vitality HP, and Endurance stamina live there. Initial attributes are 10 each: 200 HP, 100 stamina, ~87 ms basic startup.

## Basics and Arts

Basic attacks commit on press and automatically strike after Dexterity-adjusted startup (100 ms base, 60 ms floor). No timing grade or release is required. Base damage is 4 (5 at initial Strength), Break is 2, and a landed phase grants 10 SP once regardless of victim count. SP caps at 100.

Hold the equipped Art button to charge; release that same button at its target time. Crescent Break spends 30 SP and targets 620 ms (Perfect ±55 ms; Good ±120 ms). Perfect gives 100% damage/Break, Good 60%, and Miss fails with no strike. Holding too long also fails. Successful release begins the movement/swing; Crescent contacts after another 280 ms for 70 base damage / 40 Break before grade/stat modifiers. Recovery is 340 ms. There is no second tap or automatic finisher. Per-Art protection determines interruption; lethal damage always cancels it. Cyan sectors show the actual range/arc and move with the released lunge.

A basic attack, dodge or parry may be buffered in the last 100 ms of basic/Art recovery; it executes only upon reaching a legal free state. Pause/reset/hit interruption clears it.

State transitions prevent attack, Art, dodge, and parry overlap. Unreleased charges cancel/refund on pause or focus loss. Released Arts stay committed, until their authored recovery ends. Incoming unavoided damage interrupts into hit reaction; death blocks all combat actions until encounter reset.

## Defense and enemies

Dodge costs 24 stamina, moves at 10 m/s for 460 ms, and grants invulnerability from 40–330 ms. Direction follows movement intent; without input it follows facing. Parry costs 8 stamina, has a 260 ms window against basics and 170 ms against skills, requires facing the attacker, grants 14 SP and 32 Break, and releases the state on success so another parry can follow. Red sweeps cannot be parried. Guard consumes 24 stamina per hit and reduces damage to 20% if stamina suffices.

The Sentinel cycles through a telegraphed cleave, two-hit refrain, and un-parryable radial sweep. Basics alternate with skills. Basic cleaves use narrower arcs, stop tracking 500 ms before contact, and rely on a visible lift/drop rather than musical or geometric countdowns. Skill tracking stops 260 ms before impact. All attacks have recovery. Break at 100 produces 3400 ms vulnerability and ×1.6 damage taken; Break then resets. Current poise behavior is simple: ordinary hits produce visible reactions without cancelling committed enemy attacks; full Break interrupts them.

Hit volumes are horizontal range-and-angle sectors evaluated by the renderer-independent simulation. Each attack phase deduplicates victims. This is a gameplay hit-volume prototype, not physically exact blade collision. Debug overlays expose volumes and sampled visual attack arcs.

Visual feedback includes weapon timing flashes, trails, impact sparks, floating damage, brief pose hit-stop, restrained camera shake, procedural hit/stagger/death poses, and synthesized cues. No production animation clips yet.

Timing guide: converging squares and a bright note mark the release of the held Art slot button. Defensive diamonds mark parries and open rings mark dodges, with explicit action labels. Rising original enemy phrases culminate 80 ms before a parryable impact or 150 ms before a sweep; these lead times fit the defensive windows. Each hit of a combo has its own phrase. Pause, reset, death, AI freeze, and Break cancel obsolete enemy notes. These synthesized action phrases are not a full background score.

A successful parry within its attack-specific window (260 ms basic / 170 ms skill) is explicitly labeled **Perfect Parry**: all incoming damage is negated, 14 SP is awarded up to the 100 cap, and 32 Break is applied. This names the existing successful outcome; it does not add a second, undocumented defensive timing tier. Late inputs and the un-parryable red sweep retain their previous behavior.

Reset clears encounter resources, positions, enemies, lock, and actions; counters persist. Debug cheat toggles remain selected during reset. Enemy AI freeze also freezes its pattern/recovery clocks.

Failed counter risk: if a hit catches an unsuccessful Parry action, damage is multiplied by `balance.parry.failureDamageMultiplier` (1.5). Neutral cleave 24 → failed counter 36. Wrong-facing and unparryable attacks also receive the penalty. Successful counters still take zero damage and gain 14 SP / 32 Break. Exposure ends with the 430 ms action or its interruption; it does not carry into later hits or retroactively affect hits taken before the input. Basic/skill success windows are centralized in balance data.

See [combat audit](COMBAT_AUDIT.md) for current quality and scalability gates.

## September 19: contact and footprint pass

Enemy indicators are the fixed-size ground projection of the shapes used by damage checks: Measured Cleave is a 2.6 m × 0.96 m forward box, Twin Refrain is a 2.9 m forward sector (1.3 rad half-angle), and Seismic Sweep is a true 3.4 m radial disk. They rotate with tracked facing until tracking locks. Color/opacity changes signal anticipation/contact; geometry does not grow to fake the reach. Every attacking enemy has its own footprint. They disappear on reset, death, Break, or after the contact flash. The cyan lock marker remains a targeting marker, not an attack volume.

Tests use the target ground center, not the visible mesh or a capsule radius. This is a deliberate simplified gameplay volume: toe/weapon overlap alone does not cause a hit. Curved boundaries are rendered with 64 segments (sub-centimeter approximation at these radii). Damage still resolves once per phase at its contact timestamp; the short flash is visual persistence, not another active damage window.

Blender-authored rigid-joint clips now replace generic sine-wave attack motion. Each phase samples a contact-marked clip against simulation time. The second refrain cut mirrors its yaw. The sweep uses a horizontal spin and ground wave; the cleave uses a downward slash effect, and player cuts use their configured sector reach. Successful Art resolution records its actual contact timestamp for follow-through; failed charges produce no contact. These are improvements to prototype joint animation, not production skinned clips or continuous blade collision.

Audio and the defensive HUD now share the imminent-skill selector. Ground footprints show all attacking enemies rather than silently selecting just one.

Wayfarer’s Oath is the first paired Art, earned only by completing all Guild trials. Each cut has a separate hold/release charge; after contact one, press and hold the same Art button within 1.6 seconds. Good/Perfect/Miss rules apply to each event. Missing the follow-up ends the chain without undoing the first hit; pausing/cancelling after a landed cut does not refund SP. Basic learned Arts no longer require a prior counter or a special dodge cancel.
