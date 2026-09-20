# Trinity expansion plan — September 19, 2026

## Latest presentation and reward pass

The Lantern Oath now gives the Guild trials an authored narrative and a final two-event Art, Wayfarer’s Oath, plus the Wayfarer title. Starter rewards stay simple single-event cuts. Journey/Arts tabs, expandable guidance and contextual HUD help reduce persistent text. Optional first-person view includes a personal journal that leaves the simulation live. Tutorial completion leads into that journal.

The complete tutorial and all four Guild trials have been exercised in the browser, including persistence and the final paired cut. Remaining art, calibration, offscreen-pressure and human feel gates still apply; first-person hands/weapon viewmodel production is a new art follow-up.

## Implementation update

The Guild Trial gameplay slice is implemented: three reward-bearing challenges, three earned sword Arts, a paused four-slot loadout board, save v3 migration, typed encounter outcomes, one-attack enemy coordination/body separation, a two-Sentinel trial and a bounded Crescent mastery choice. HUD references are preserved in References/HUD/.

Latest combat direction: hold the equipped Art button, then release on its charge cue. Perfect gives full power, Good 60%, and Miss fails with no strike. A cyan footprint shows the actual sector while charging/executing. Challenge cards describe the awarded Art and the automatic result screen explains its use.

Still open: production rigs/reactions, calibration/accessibility controls, camera/offscreen-pressure validation, practice previews, physical world-board/NPC interaction, balance and human feel testing. The functional menu board is not a trainer NPC. The planned 10–15 minute session duration has not been measured in human playtesting.

## Assessment (historical baseline)

The current game demonstrates combat, not yet the complete Combat → Discovery → Mastery loop in `PROJECT_BRIEF.md`. It has one Art, four slots, three Sentinel patterns, a tutorial, configurable controls, shared attack footprints, authored rigid-joint motion, counter risk, and saved settings. There are no learned-Art records, meaningful equipment choices, progression rewards, trainers, quests, or world facts yet.

The latest user decisions remain authoritative: untimed low-damage basics, one timing event for beginner Arts, fully damage-negating successful parries that build SP, 50% extra damage on failed parry commitment, and geometric warnings that match collision. Advanced multi-input Arts can come later. Preserve the single-player browser scope and original assets.

The new interface uses the supplied SAO references for visual direction: translucent pale panels, thin borders, angular green HP bars, gold selection, and compact controls at the screen edges. It uses original CSS and Trinity names, not the reference atlas or branded character names. Do not add nonfunctional inventory, party, map, chat, or equipment buttons just to resemble the reference.

## Next playable goal: the Guild Trial

Build a replayable 10–15 minute session in the existing hall. The player practices, completes three short challenges, earns two new Arts, equips a four-slot build, defeats a trial Sentinel, and returns to a small training board. A reload preserves earned Arts and the equipped build. This is the bridge from the current duel to the larger RPG, not a new world region.

### 1. Close the remaining combat and interface gaps

- Keep the clearer HUD. Add a real paused character/loadout page only when it can read and edit actual game data. Art labels/costs already render from equipped definitions; do not assume slot one is always Crescent Break.
- Introduce an encounter attack budget and enemy separation. Test two enemies before a five-enemy challenge; no unannounced overlapping or offscreen punishments.
- Move attack arc, interruption protection, movement, animation reference, cancellation windows and timing consequences into per-Art data. Current global protection and shared posing are insufficient for multiple tactical roles.
- Continue the contact-marked duel work toward a skinned rig and authored dodge/parry/Break reactions. Preserve collision/contact tests and readable muted-audio play.
- Add cue/SFX volume, reduced flash/shake and calibration before tightening timing windows. Keep keyboard remapping and an always-available pause path.

**Exit gate:** a new player can identify the attack shape, explain counter failure, complete the tutorial without debug tools, and survive a fair two-enemy encounter. No contradictory warnings, double hits, or stale audio after interruption/reset.

### 2. Establish trustworthy progression events and save v3

- Define typed combat outcomes with encounter ID, actor/target, attack/phase, actual hit result, timing grade/offset, defensive result and reward eligibility.
- Separate combat telemetry from rewards. Tutorial, debug, invulnerability, whiffs and reset farming must not award mastery or unlock conditions.
- Add learned Arts, acquisition source, equipped IDs and a small mastery record to the save. Migrate existing v2 controls/settings/loadout/counters without loss.
- Validate learned ownership, weapon eligibility and unique four-slot loadouts in both the UI and executor. Save migration failures must remain recoverable.

**Exit gate:** a challenge reward is awarded once, persists through reload, cannot be duplicated by replay/reset, and cannot be forged by UI counters. The existing counter totals are not XP.

### 3. Prove distinct four-slot sword builds

Keep Crescent Break as the starter. Proposed original Arts for the trial:

| Art | Tactical purpose | Beginner interaction | Acquisition |
| --- | --- | --- | --- |
| Aether Step | Close distance, low Break | One timed contact; constrained movement | Positioning challenge |
| Resonant Cleave | Heavy Break, longer recovery | One readable heavy cut | Break challenge |
| Stillwater Return | Convert a successful counter into pressure | One timed follow-up with an earned activation opportunity | Counter challenge |

These original designs are now implemented as hold/release Arts. Prototype two earned Arts first; introduce the fourth when its follow-up rule is clear. Costs, ranges and rewards should be tuned from play rather than presented as final numbers now. A tactical difference must be visible in actual combat, not just in a tooltip.

Add a functional collection/loadout panel with learned/locked distinction, cost, role, weapon requirement and practice preview. Equip only while safely paused. Keep exactly four active slots as the collection grows.

**Exit gate:** two different loadouts solve the trial differently, consume SP correctly, use the shared executor without special controller branches, and survive reload with their choices intact.

### 4. Add the smallest meaningful mastery choice

- Start with a short, bounded track for one Art. Meaningful use earns progress from validated outcomes, not button presses.
- Offer one mutually exclusive tactical modifier, such as a safer recovery versus greater Break commitment. Define interactions through data and test each choice.
- Add a trial summary with damage taken, successful/failed counters, Art accuracy and Break punishments; allow replay of the troublesome pattern.
- Provide a real training-board interaction in the existing hall, then a trainer NPC when dialogue/training state is ready. Do not build a large tree or dozens of ranks yet.

**Exit gate:** a fresh save can earn an Art, make a mastery choice, notice the changed behavior, reload, and continue without duplicate rewards or lost bindings.

## Expansion after the Guild Trial

1. **Enemy/boss slice:** add a second enemy role and a small boss that combines established telegraph rules. Validate coordinated pressure, recovery openings and camera visibility.
2. **Equipment and trainers:** implement one additional weapon category only after weapon requirements, animation sockets and loadout validation are proven. Trainers consume persistent outcomes through authored conditions.
3. **Event Ledger and quest boundary:** persist bounded facts, counters and flags with deterministic condition evaluation. Build normal quests first. Hidden quests remain absent from the journal until activated; no question-mark entries or visible secret requirement checklists. Add a developer condition inspector.
4. **First region:** one small hub, forest, hidden area, ruin, dungeon, elite and boss—as specified in the original brief. Reuse the proven combat/progression loop, then add streaming/collision budgets based on measurement. No multiplayer in this scope.

## Technical and performance gates

Keep rendering, simulation, input, progression and persistence separate. Extract focused attack/encounter/outcome modules rather than growing the current simulation into a world manager. Preserve the approved Blender pipeline and editable sources. The current rigid-part clips remain a prototype bridge.

Keep the original 1080p/60 FPS target and 45 FPS prototype floor. Existing short headless samples are encouraging but do not prove low-end or sustained performance. Measure both WebGPU and WebGL, two-enemy encounters, asset loading and longer sessions. Profile the large Babylon entry chunk and repeated draw calls before introducing production-scale characters and environments.

Each stage requires unit tests for rules/migrations, real browser interactions, screenshot review, and an honest human playtest before calling combat feel complete. See `COMBAT_AUDIT.md` for the detailed baseline gaps.

**Next gate:** playtest the Guild Trial and charge/release combat, then camera/offscreen-pressure checks, audio/accessibility calibration and authored reactions. Keep the work inside the existing hall until those gates pass.

## September 20 scope update

Training progression now starts with a small single-target Focused Strike and awards Linear on induction completion. Three test weapons only: one-handed sword, rapier and two-handed sword. Direct HUD slot editing, skill radar/stat cards, regular-combat skill acquisition and a downloadable bank support this slice. First-person rotation and automatic locked-target orientation are implemented.

Next priority: weapon-specific contact/grip animations and first-person hands, then a small walkable Guild foyer with Ilyra and a physical rack. Link that space to a minimal Town of Beginnings street and a first outdoor encounter using the same saved skills. Preserve the current training room as a replayable teaching space. Do not expand weapon count before these three feel distinct and readable in human playtests.
