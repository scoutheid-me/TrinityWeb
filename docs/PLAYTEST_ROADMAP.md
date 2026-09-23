# Combat review and external-playtest roadmap — September 23

## Verdict and scope

Trinity is a functional combat prototype, not an AAA-quality combat system yet. AAA is a quality target here, not a certification or feature count. The next milestone should be a small, reliably enjoyable single-player slice that strangers can finish without developer help. This review uses the current simulation, balance definitions, input, camera, audio, save and progression code; the original PROJECT_BRIEF supplies the combat → discovery → mastery vision. Later user decisions take precedence over outdated brief details such as timed basics.

Keep the fantasy of inhabiting an anime RPG world: physical weapon selection, a live personal menu, distinctive sword techniques, NPC relationships, and discoveries that change a four-Art build. Do not simulate an MMO backend. One local authoritative simulation, authored NPCs, persistent world facts and deterministic quest rewards are enough. No multiplayer, full town, giant skill catalog or live-service economy is needed for this milestone.

## What is already working

- Untimed basics generate SP; four learned/compatible Art slots use hold/release grading, movement, resource costs and phase deduplication.
- Counter negates damage, returns a weapon-scaled hit, grants SP/Break, and penalizes a failed commitment by 50% extra incoming damage. Dodge and guard provide alternatives.
- Linear creates a positional opening; rate-limited enemy turns, committed facing, rear +20% damage and Break provide reasons to reposition.
- Original GLBs, a physical rack, two-handed grip constraints, first/third person, remapping, live personal menus and a paused technical overlay exist.
- Guild induction, Linear reward, repeated Sentinel/Boar encounters, field unlock counters and saved progression exist. Skill Book trees are previews; an actual dungeon/book reward loop does not exist.
- Simulation and presentation are separated; attack geometry and timelines are reusable. Automated tests cover behavior, but cannot certify subjective feel or hardware latency.

## Findings that should drive implementation

### 1. Balance roles by encounter outcomes, not a single stat

At starting Strength/Dexterity, approximate repeated basic throughput is:

| Weapon | Damage per target | Full basic cycle | Approximate damage/second per target |
| --- | --- | --- | --- |
| Sword, one target | 10 | 467 ms | 21.4 |
| Sword, group | 8 | 467 ms | 17.1 |
| Rapier | 13, one target | 335 ms | 38.8 |
| Greatsword | 15 | 1240 ms | 12.1 |

These calculations assume every attack connects, no movement/defense, no Break/rear bonuses, and no Arts. Greatsword has broader reach/coverage but currently loses sustained damage per victim to sword when both catch the same group. That conflicts with its intended group-damage role. Shared Arts multiply weapon base damage but generally retain identical cast/recovery times; greatsword can bypass its basic-speed drawback through those Arts. These are tuning findings, not changes made by this review.

Implement a deterministic balance harness that runs identical single-target, clustered-group and mobile-target encounters for each weapon, including SP generation, Arts, defense and recovery. Report kill time, damage per SP, Break cadence, damage taken and downtime. Then tune damage/recovery/coverage together. Keep sword below rapier on a single target and below greatsword in the chosen group benchmark; retain sword's guard, reliability and flexibility. Add per-weapon execution profiles only where necessary, with updated timing displays. Do not automatically make every restricted Art stronger in all situations: price its advantage against reach, commitment, resource cost and opportunity.

### 2. Counter must be an exciting option, not the only rational defense

Counter currently offers zero damage, a 2× base return hit, 14 SP and 32 Break for 8 stamina. Four counters can Break a fresh enemy; stamina regeneration is 24/s. This may dominate against predictable attacks, despite the failure penalty. Measure actual novice/expert counter success, incoming damage and clear times before changing values. Every meaningful encounter should contain a reason to counter, dodge, move out, or guard. Avoid escalating difficulty only by shrinking timing windows.

Add explicit defensive result data (early/late/wrong-facing/out-of-range/un-counterable) and brief optional feedback. Keep logical timestamps authoritative; do not grade against animation frames. A rejected input should explain recovery/stamina constraints. Add an optional practice recap with timing offset and cost, without awarding progression from practice telemetry.

### 3. Animation and contact are the largest presentation gap

Rigid-part posing and authored footprint tests are useful but not a finished action-animation pipeline. Build one polished duel first: anticipation, planted feet, blade-aligned contact, recoil, recovery, turn-in-place, dodge and Break reaction. Use Blender sources and exported clips, retain both greatsword grips, and validate every phase in both cameras. Define contact markers and motion curves per attack; damage, trails, cues and footprint previews consume the same attack instance. Use swept contact volumes for fast moving blades only where static/segment footprints demonstrably fail; do not use expensive full mesh collision everywhere.

Measure contact disagreement at 30/60/120Hz, partial frames, edge of range and high-speed Linear crossings. Avoid hit flashes that imply damage on a miss. Distinguish blocked, Counter, rear hit and Break through short, consistent visual/audio responses. Provide reduced flash/shake options.

### 4. Threat coordination and camera need production rules

The current coordinator allows one committed enemy pattern at a time with a fixed gap. This makes the room readable but becomes conspicuous with groups. Replace it with a small encounter director: visible threats, distance, angular separation, recent attacks and difficulty determine attack permission. Keep non-attacking enemies moving into useful positions instead of surrounding the player silently. Introduce two-enemy encounters before five.

Share threat selection across HUD/audio/camera; preserve a quiet directional visual warning when player Art music owns the audio channel. Add target occlusion/range release, camera obstruction handling beyond the circular room, predictable free-look transitions and first-person close-range framing. Never hide a lethal attack behind the menu or target's body. More ambitious multi-attacks require demonstrated readability, not just adequate rendering FPS.

### 5. Input/audio comfort is a release requirement

This update adds a five-note minor-pentatonic Counter ascent and resolving chord, including quieter basics; red dodge cues remain distinct and player Arts retain music priority. The final Counter accent is 80 ms before impact. It is an input cue, not a promise that any late button press reverses damage. Short follow-up phrases compress their spacing after the previous hit.

Next add separate music/cue/impact volume, an audio-offset calibration exercise and saved bounded offset. Offset presentation scheduling only; do not move authoritative hit deadlines. Test pause/resume, device resume, skipped frames and stale-note cancellation. Test with headphones, speakers and sound off. Audio must reinforce readable animation, not make the game impossible without hearing. Add controller action bindings and glyphs after keyboard/mouse comfort stabilizes.

### 6. Progression needs persistent facts and idempotent rewards

The existing encounter ledger is bounded and typed, but field progression is predominantly counters and the world is still one room. Introduce stable actor/encounter/quest/reward IDs and a versioned WorldFacts store (locations discovered, NPC conversations, eligible boss victories, acquired books). Retain only relevant facts/counters, not every frame or hit forever. Quest/Book prerequisites consume validated facts through pure predicates; reward transactions must be idempotent across reload, death and retries.

Implement one real Skill Book with 3–4 nodes, prerequisites and one mutually exclusive mastery choice. Initial nodes remain single-event; one final node can introduce a two-event Art. Present both restrictions and benefits. Hidden conditions should have discoverable clues and recoverable opportunities, not require an external wiki or permanently punish uninformed players. Keep legacy saves and existing earned Arts; add migrations and rollback/roundtrip fixtures before changing schemas.

## Ordered delivery plan

| Priority | Work package | Implementation boundary | Completion evidence |
| --- | --- | --- | --- |
| P0 | Instrument and balance the three weapon roles | Pure balance harness + encounter summaries; no UI-driven reward logic | Same scenarios prove rapier single-target, greatsword groups, sword flexible defense; no dominant free-counter loop |
| P0 | Polish one Sentinel and one Boar duel | Shared attack instances, authored motion/contact markers, response VFX/audio and camera rules | New players explain hits/misses; no visible/contact mismatch at tested frame rates; mute and both views remain playable |
| P0 | Playtest safety and packaging | Release profile, save backup/import, build ID, recovery/error UI, cue calibration, basic accessibility | Clean-browser startup/reload/death works; invalid import cannot destroy a good save; no debug reward contamination |
| P1 | Two-enemy encounter director | Visibility-aware budget and directional threat feedback | Both attacks readable; no repeated unannounced offscreen damage; stable camera at walls |
| P1 | 15–20 minute exploration/reward slice | Small Guild exit → short route → 3 encounter spaces → miniboss → return to Ilyra | Tutorial gives Linear; dungeon gives one real Book; reward is equipable and remains after reload |
| P1 | Discovery and mastery proof | WorldFacts + quest predicates + Book unlock transaction | One optional clue/reward and one mastery choice work without developer intervention or duplication |
| P2 | Expand content and presentation | Additional enemy roles, environment art, NPC routines, equipment/shield system | Only after playtest evidence supports the loop; avoid duplicating code for new Arts/enemies |

Do not promise the town implementation in the first release. A compact transition and route are sufficient. Keep three weapons and two enemy families plus a miniboss variant, so feedback concerns combat rather than a large amount of unfinished content. Solo progression should be paced through authored encounters, checkpoints and NPC reactions; not multiplayer-style waiting, daily chores or grind gates. No irreversible permadeath for this playtest: death retries the encounter/checkpoint while preserving earned rewards.

## External playtest package and acceptance gates

First distribute a **combat-only build** to 5–8 testers. After corrections, distribute the exploration/Book slice. These are proposed acceptance criteria, not results already achieved:

- At least 80% of new testers finish the induction without verbal help; record confusion points and completion time.
- Testers can distinguish Counter, dodge, guard, basic and Art; identify why a failed Counter hurt more; and deliberately land a rear follow-up after Linear.
- No blocker in a 20-minute session, repeated death/retry, menu use, tab-away/resume or reload. Earned rewards persist exactly once.
- Target 1080p/60FPS on a declared reference machine; keep the brief's 45FPS prototype floor and document a low preset. Capture frame-time p50/p95/p99, memory and asset load time on WebGPU and WebGL. Existing short headless results are not a hardware matrix.
- Package a versioned static build at an HTTPS URL with original local assets, concise controls, known issues, supported desktop browsers and a feedback form. A dev-server link on this machine is not an external release.
- Provide a bounded opt-in diagnostic export with build ID, browser/render backend, settings, frame statistics and encounter outcomes; omit names and unrelated device data. Do not upload telemetry silently. Include save export/import and a clearly separated reset-progress action.
- Hide GM/debug entry points in the public release profile, while keeping developer builds available. Disabling dev hooks alone does not remove the current visible GM interface.
- Audit release assets/source attribution, remove unused exports, and split/load heavy renderer modules where measurements warrant it. The current ~6MB main JS bundle still warns at build time.

Ask each tester: Which action felt unreliable? What told you when to Counter? Did the weapon choices change your play? Could you explain your reward and equip it? Would you want to explore another room? Use observed behavior alongside answers. Choose the next changes from repeated problems, not a growing feature checklist.

## Immediate next implementation recommendation

Build the repeatable three-weapon encounter benchmark and a compact optional post-fight recap first, then use its evidence to tune the Counter/Break/resource economy. In parallel as a workstream (not a requirement to use agents), author one finished attack/defense animation set. Only expand into the short dungeon when those duels remain readable, fair and responsive in both perspectives.
