# Updated beginner combat direction

Use single-event beginner Arts, distinct offensive/defensive audio, and animation-led enemy basics alternating with skills. Multi-input Arts are reserved for later advanced skills. The current Art retains commitment through nonlethal damage. Test audio priority and readability before adding progression breadth.

# Current implementation update

Implemented: mandatory untimed low-damage basics, fixed 10 SP, a 100 ms recovery input buffer, earlier Art impact resolution, enemy build-up phrases for every hit, defensive geometry, and five replayable combat lessons. The user selected tap-only basics; the old hold/release comparison below is superseded. Skill acquisition/mastery, calibration, a full soundtrack, and Blender animation clips remain future work.

# Trinity: combat readability and skill progression plan

## Direction

Build a satisfying, replayable 10–15 minute training slice before adding a region. The player should learn one coherent timing language, acquire several distinct Arts, choose four, and see mastery change how a favorite Art plays. Real-time movement, positioning, enemy reading, and defensive decisions remain central. Music supports timing; it must never be mandatory to hear or force every action to wait for a background beat.

Use original concentric rings and squared/diamond outlines as abstract visual timing references. Do not reproduce Expedition 33's interface, music, art, animation, or exact effects.

## Review findings

| Finding in the current implementation | Effect on the player | Next action |
| --- | --- | --- |
| `input.ts` used a lateral vector with the wrong sign for the right-handed camera | A/D appeared reversed | Corrected in this revision; test camera-relative strafing and remapped movement |
| Bindings were partly hard-coded and HUD hints were static | Players could not choose their controls or trust updated hints | Added a player-facing controls dialog, alternate bindings, conflicts, reset, live hints, and v1→v2 save migration |
| `main.ts` played a cue only when a render frame happened near the target time | The sound provided little anticipation and could be missed on a slow frame | Replaced with short original musical lead-ins scheduled on the audio clock at simulation deadlines |
| HUD timing bar used different mappings for basics and Arts | The bright band did not consistently communicate the true grading window | Replaced with converging rings for release and squares for taps; band sizes derive from the existing 55/120 ms windows |
| Successful parry already returned before damage and granted 14 SP | Its advantage was not explained clearly | Explicit Perfect Parry reward text and lethal-hit/SP-cap regression tests |
| `updateArt()` resolves each strike at `node.at + goodWindow` | Even a correctly timed input can feel detached from the impact by up to 120 ms | Make input, authored contact pose, impact cue, and damage resolution visibly coherent in the next combat-feel pass |
| Basic attacks require holding/releasing each time; rejected actions have little feedback | New players may think controls dropped input | Add a short legal-state input buffer, explain commitment, and test an optional tap-basic flow |
| Enemy telegraphs mostly use radial rings and rigid arm poses | Different attack patterns lack distinct silhouettes | Author windups, contact/recovery, parry recoil, and explicit sweep geometry in Blender |
| Save data has aggregate counters but no learned-Art collection or mastery | There is no meaningful progression loop | Add progression rules and a save migration; do not repurpose raw counters as mastery XP |
| Perfect counters increase on timing grades even when a strike misses; debug kills/reset are available | Rewarding those counters directly would enable trivial farming | Emit validated combat outcomes with encounter eligibility, target, phase, and actual hit result |
| HUD assumes Crescent Break is in slot one; `weapon` is descriptive data only | More Arts/equipment cannot be safely added through UI alone | Data-driven slot rendering, learned/equipped validation, and weapon eligibility in the executor |
| Animation is rigid-part posing, not a production rig | Sword arcs and defenses lack weight despite functional rules | Replace only the presentation adapter first; preserve tested simulation rules |
| Large Babylon entry bundle and hundreds of draw calls | Startup and weaker-hardware performance will become constraints | Profile and narrow imports; instance repeated environment meshes after combat readability is stable |

The new musical cues are short synthesized phrases, not a full soundtrack. Enemy phrases and practice lessons are now implemented. Latency calibration, new skill progression, and a skill collection menu remain planned.

## 1. Finish the timing and input foundation

**Player outcome:** “I know what to press, when to press it, and why it succeeded or failed.”

- Keep the corrected movement, persistent bindings, and an always-available Escape/menu recovery path. Add layout-aware key labels, controller bindings, and input buffering only after desktop behavior is stable.
- Create a unified timing-event definition: action ID, action type (press/release/parry), target timestamp, anticipation duration, Perfect/Good bounds, input binding, audio phrase, and visual style. Drive the UI, blade flash, animation contact, audio, and grading from it.
- Maintain the new small ring for a release and square for a press. The moving outline meets the static outline at the target; the inner bright band is Perfect, outer band Good. Use explicit RELEASE/TAP labels and distinct shapes, not color alone. Keep the cue near the action without obscuring enemy attacks.
- Add a distinct defensive diamond with a gold parry cue; an open red sweep shape says dodge. Prioritize imminent threats when a player Art and enemy warning overlap.
- Improve musical phrases with original soft percussion and pitched anticipation. Use audio-clock scheduling, cancellation tokens, and a shared simulation/audio time mapping. Pause, death, interruption, time-scale changes, and reset must cancel or rebase pending notes.
- Add separate music/cue/SFX volume, visual-only mode, reduced flashing, cue-size adjustment, and a short audio/display calibration exercise. Account for output latency before shifting grade timestamps; do not silently make the timing window tighter for Bluetooth users.
- Add a ~100 ms input buffer that releases actions only into legal states; never buffer repeated presses into unintended attacks. A rejected Art should say “Recovering” or “Need 30 SP.”
- Prototype tap for a normal basic, with hold/release for precision and higher SP, without removing the existing low-damage resource-building loop. Compare it with the current behavior before committing to a new default.

**Acceptance:** matched musical accents and visual target times across 30/60/120 Hz; repeatable Perfects with sound muted; no notes after pause/reset; no accidental action overlap; remapped bindings appear everywhere; playtesters can explain why they missed. Log early/late offsets in training mode, not on the normal HUD.

## 2. Give sword combat readable physical timing

**Player outcome:** “The sword connects when the motion and sound say it should.”

- Use the approved Blender pipeline to author neutral, run, basic anticipation/contact/recovery, Art transitions, dodge, guard, parry, hit, Break, and death clips. Preserve meter scale, forward axis, and grip/socket conventions.
- Tie each strike phase to an authored contact marker. Decide how the allowed late input window interacts with damage: commit a phase once, finalize its grade once, and avoid a second impact or double damage. Keep hit deduplication tests.
- Strengthen the three existing sentinel silhouettes: overhead cleave, two distinct refrain cuts, and a low sweeping windup. Stop target tracking before impact. Give successful parries visible recoil while preserving consecutive-parry opportunities.
- Keep Perfect Parry at zero damage, +14 SP, and meaningful Break; retain readable failure and non-parryable sweep feedback. Tune stamina only after measuring actual use.
- Add optional gentle facing assistance within a narrow cone, with no teleporting targets or forced camera snapping. Show attack reach and commitment during a guided exercise.

**Acceptance:** players can dodge/parry by watching the enemy; strike animation and hit volume agree; no damage through Perfect Parry; multi-hit phases remain fair; camera does not hide the next telegraph. Complete a short manual playtest in addition to the automated suite.

## 3. Add the smallest meaningful progression loop

**Player outcome:** “I learned something, earned an Art, and can choose a different build.”

- Add typed learned-Art records, per-Art mastery, acquisition source, a training currency, and progression eligibility. Preserve exactly four equipped slots. Add save schema v3 migration from the current v2, keeping controls/settings/counters.
- Award mastery from validated successful hits, graded Art phases, relevant defensive outcomes, and encounter completion. Cap repeat rewards per encounter/target and award none for debug or invulnerable farming, whiffs, menu presses, or reset loops. Existing counters remain telemetry, not XP.
- Add a visible guild instructor/training board for this public training content: one exercise for untimed basics, one for dodge/Perfect Parry, and one for Break + Art execution. These exercises are not hidden quests.
- Supply four complementary original Arts initially: Crescent Break (balanced sequence), Aether Step (gap closer), Resonant Cleave (Break pressure), and Stillwater Return (counter follow-up). Start with Crescent Break; earn the others through short demonstrations. Names/balance are proposed, not implemented content.
- Add an Art collection/loadout panel showing learned skills, cost, role, controls, and a short timing preview. Equip only while paused outside an active attack. Render every slot from data, validate ownership/weapon/duplicates, and make empty slots safe.
- First mastery track: rank 1 unlocks practice replay/feedback, rank 2 offers one mutually exclusive modifier (e.g. lower SP cost or extra Break), rank 3 unlocks a tactical variant. Prototype the choices before expanding to 100 ranks. Avoid percentage-only progression.

**Acceptance:** a fresh save can complete the exercises, learn two additional Arts, swap its four-slot loadout, use distinct builds, gain legitimate mastery, choose a modifier, reload with everything intact, and never duplicate rewards from reset/replay/debug actions.

## 4. Turn the room into a repeatable prototype experience

**Player outcome:** a coherent short session with a reason to return.

- Add practice mode with replayable patterns, adjustable cue assistance, and no damage; add challenge mode with fair rewards and normal damage. Keep developer cheats visibly separate from either mode.
- Add a harder sentinel variant that combines the same learned language rather than introducing hidden rules. Record clear completion statistics: damage taken, Perfect Parries, accuracy, and Break punishments.
- Compose an original looping ambient combat bed with separate intensity stems. Duck the bed under timing lead-ins. Actions trigger or locally align short musical phrases immediately; do not delay a dodge or basic attack to wait for a global music beat.
- Add a short encounter summary and “retry / practice this pattern” controls. Tune pacing, SP starvation, defensive stamina, recovery lengths, and cue readability from actual playtests.
- Profile startup and mid-combat frame pacing at 1080p on more than one machine. Narrow Babylon imports and instance columns as measured bottlenecks warrant. Preserve WebGPU/WebGL paths and offline startup.

**Acceptance:** a new player can understand the loop within a few minutes, finish a 10–15 minute training session, explain their loadout/mastery choice, and want to retry a harder encounter. Only then begin the town/exploration vertical slice.

## Suggested next implementation task

Finish stage 1's shared timing-event layer and calibration, together with one authored basic attack/parry pair from stage 2. Then build the small progression loop. Do not create a large skill tree, dozens of Arts, or a wider world while feedback and timing still feel ambiguous.
