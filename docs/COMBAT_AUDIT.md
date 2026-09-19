# Combat audit — September 18, 2026

## Verdict and scope

Trinity has a working Combat Lab foundation, not a AAA-quality combat system yet. The core rules support the original brief's real-time sword-skill fantasy: build SP, commit to an Art, execute a timing input, Break an enemy, and exploit the opening. The discovery/mastery/buildcraft half of that fantasy is still absent. A successful automated encounter proves functionality; it cannot certify animation quality, long-term depth, fairness, or fun.

This is an engineering/design assessment against `PROJECT_BRIEF.md`, particularly sections 6–30, 33, 46–51, and 61–65. “SAO-inspired” means the supplied brief's aspirational sword-technique, discovery, and mastery fantasy; it does not mean copying another game's mechanics or claiming equivalence to a commercial title.

Later user decisions supersede the original brief's timed basics and three-input starter Art: basics are untimed, beginner Arts use one timing event, Perfect Parry negates all damage and gains SP, and failed counters must carry extra damage. Preserve the original brief as history rather than silently rewriting it.

## Capability assessment

| Area | Verified foundation | Gap before expansion |
| --- | --- | --- |
| Responsiveness / commitment | Explicit states, millisecond timing, legal recovery buffer, remappable inputs, pause/focus handling | No authored cancel windows or controller adapter; most rejected commands remain silent. Test input-to-contact latency and audio drift under long frame stalls. |
| Basic / Art identity | 5-damage starter basic grants 10 SP; 30-SP Crescent Break has one input and one stronger strike | One Art cannot prove build diversity. Add mobility, Break and counter roles while retaining four slots. |
| Defense / skill expression | Directional dodge, guard, facing-dependent Perfect Parry, consecutive counters, new failure penalty | Basic parry window is generous (260 ms vs skill 170 ms). Dodge invulnerability spans 290 ms. Counter costs 8 stamina vs dodge 24: validate dominant strategies with players before treating balance as final. |
| Enemy readability | Basic cleave alternates with double-hit and sweep skills; windup, tracking lock, recovery | Only one enemy type and fixed pattern order. No attack director, offscreen threat treatment, navigation, enemy-enemy separation, or boss phase logic. |
| Contact / animation | Deduplicated range/angle hit volumes, procedural poses, trails, sparks | Damage uses horizontal sectors, not authored blade contacts. Basic damage occurs at the first active substep; enemies entering later active frames are not reconsidered. Art posing uses its first node. Visual and mechanical contact need an explicit shared timeline. |
| Audio / UI | Art musical priority, short defensive warnings, animation-led basics, distinct dodge/parry effects | Audio chooses nearest skill; HUD chooses earliest impact; floor warning chooses first matching enemy. They can identify different threats. Priority currently suppresses enemy prompts throughout an Art, including recovery. Audio scheduling has no measured device-latency calibration or drift correction after capped frame gaps. |
| World scalability | Simulation separated from renderer/input/save, data definitions, versioned save, original asset pipeline | Simulation owns Sentinel spawning/AI and generic player combat together. No actor definitions or reusable encounter configuration. Arena collision/camera are circular-room approximations. |
| Discovery / mastery | Four-slot data, aggregate counters, save migration | No learned-Art ownership, weapon eligibility enforcement, mastery, acquisition, Event Ledger, equipment, trainer or quest systems. Counters count debug/tutorial/whiff activity; they are unsafe as progression evidence. |
| Production presentation | Actual GLB imports, WebGPU/WebGL, quality options and effects | Rigid prototype actors, no skinned animation/blending/contact markers, no production sound mix or camera obstruction solver. These are major quality gaps, not cosmetic finishing tasks. |

## Counter risk implemented in this audit

Failed parry commitment now multiplies incoming damage by **1.5**, configured in `balance.parry.failureDamageMultiplier`. A 24-damage cleave becomes 36; an 18-damage skill hit becomes 27; the unparryable 36-damage sweep becomes 54. Wrong-facing attempts also fail. Success still grants **zero incoming damage, 14 SP, and 32 Break**, with SP capped at 100.

The risk lasts while the player is in the 430 ms Parry action. A basic counter succeeds during its first 260 ms; skills allow 170 ms. An incoming hit during unsuccessful commitment gets the penalty, then transitions to hit reaction normally. The penalty does not linger after recovery, stack on later unrelated hits, or apply to a rejected input that never started a parry. Pressing after a hit has already resolved does not retroactively change that hit. Evading the attack by positioning remains valid; failed attempts do not cause damage by themselves.

The tutorial and title instructions explain the rule; the live HUD displays `COUNTER FAILED · 50% EXTRA DAMAGE`. Unit coverage compares neutral/success/early recovery/wrong-facing/unparryable/lethal/rejected/reset cases. Browser coverage uses real keyboard input against live enemy attacks.

## Architecture gates before more content

1. **Shared attack timeline and defensive outcome contract.** Extract attack-instance and hit-outcome types with actor/encounter/phase IDs, target, timing offset, damage, Break, defensive result and progression eligibility. Make poise, interruption protection, cancel windows, arc and movement policies per-Art data. Current nonlethal Art protection is unconditional across Arts; that will not scale to different commitment designs. Keep input, animation contacts, damage and cues driven from one timeline. Preserve late-input resolution without duplicate hits.
2. **One authoritative threat selector.** Feed audio, HUD, floor warnings and camera from the same imminent-threat result; retain a small visual warning when an Art owns the musical channel. Add an encounter attack budget and readable offscreen treatment before increasing enemy counts. Preserve independent enemy movement; do not turn combat into turns.
3. **A polished one-on-one encounter.** Author sword anticipation/contact/recovery, dodge, parry recoil, hit and Break clips through Blender. Verify weapon reach and contact in the actual game, including muted cues, unlock/lock, edge-of-range and camera-obstructed situations. Add reduced-flash/shake and cue volume/calibration options.
4. **Prove four-slot buildcraft.** Add three distinct Art roles through data without controller branches. Render every slot from the actual equipped definition; current slot titles/cost labels assume the starter loadout. Validate ownership, weapon requirements and duplicates. Add typed validated progression outcomes before awarding mastery. Keep tutorial/debug events ineligible for rewards and hidden quest conditions.
5. **Save and discovery boundary.** Version learned Arts, mastery variants, equipment and bounded ledger facts with migrations and roundtrip tests. Trainers and deterministic hidden quests consume these facts; they must not inspect transient UI messages or raw telemetry counters. Build a small trainer/encounter loop before the town or world.

Do not introduce networking or a large framework to solve the room's current problems. Focused modules and explicit data contracts are enough for the next slice.

## Release gates

- One duel is readable with musical cues disabled; players can explain normal damage, failed counter damage, and the reason for a missed Art.
- Contact markers match damage and effects at 30/60/120 Hz; late inputs, interruption, pause and slow motion never double-hit or leave stale notes. Current tests verify simulation outcomes across rates, not hardware input/audio latency.
- Five-enemy combat cannot overlap unannounced attacks or select contradictory threats. A five-enemy rendering benchmark alone does not meet this gate.
- Three additional Arts can be authored/equipped without controller edits; legitimate mastery persists while whiffs, practice, cheats and reset loops award none.
- Measure the brief's 1080p/60 FPS target (45 FPS prototype floor) across representative hardware, sustained combat and both rendering backends. Headless samples on this machine are limited evidence, not a shipping performance guarantee.

The highest-impact next task is the shared attack/contact timeline with one properly animated duel, followed by unified threat selection. More regions or dozens of abilities would amplify the current weaknesses.


## Verification recorded for this audit

- 51 unit/system tests passed, including identical Perfect Art outcomes at simulated 30/60/120 Hz, failure damage, reset and lethal cases.
- 10 Edge browser scenarios passed: movement, camera, resources, Art timing, live dodge/parry/combo, Break, deaths/reset, remapping/persistence, all tutorial lessons, cue priority, live counter damage comparison and five-enemy rendering. These are automated interactions with the running game, not a subjective human playtest.
- Screenshots of failed-counter feedback and the five-enemy scene were inspected. The crowd confirms the need for separation and threat direction before treating multi-enemy combat as production-ready.
- WebGPU, 1920×1080, high quality, one enemy: mean 8.33 ms (~120 FPS), p95 9.5 ms; sampled 520 draw calls / 179 active meshes.
- WebGPU, 1440×900, medium quality, five enemies: mean 8.53 ms (~117 FPS), p95 10.3 ms; sampled 796 draw calls / 279 active meshes. Debug invulnerability kept the benchmark alive. This was a short headless run; it is not evidence for a sustained five-enemy 1080p/high budget or other hardware.
- TypeScript/Vite build passes with the existing roughly 5.9 MB minified entry chunk warning. The production startup check verifies local assets and absence of development hooks.
