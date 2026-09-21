# Architecture

TypeScript + Vite + Babylon.js 9.27.0. WebGPU is attempted before scene creation, with WebGL initialization fallback and an explicit `?webgl` path. Browser rendering uses Babylon throughout. No accounts, remote game service, or multiplayer.

| Module | Responsibility |
| --- | --- |
| `src/data` | Balance, formulas, Combat Art definitions, enemy attack patterns |
| `src/combat/rules.ts` | Timing, resources, loadouts, legal state machine, hit volumes, deduplication |
| `src/combat/simulation.ts` | Renderer-independent encounter simulation and event production |
| `src/engine/scene.ts` | Babylon renderer, environment, GLB imports, camera, rigid-part posing, visual effects |
| `src/input/input.ts` | Keyboard/mouse adapter with configurable binding map and world-space movement intent |
| `src/ui/hud.ts` | HUD and development controls; consumes simulation state |
| `src/audio/audio.ts` | Original synthesized interaction/impact cues |
| `src/save/save.ts` | Versioned, validated IndexedDB save boundary |
| `src/main.ts` | Composition, high-resolution clock, pause/focus handling, event dispatch |

Input handlers advance the simulation to the current `performance.now()` before evaluating commands. Simulation elapsed milliseconds are split into at most 8.33 ms substeps; dangerous frame gaps clamp at 100 ms. Focus loss pauses the encounter and clears held inputs. Slow motion scales the simulation clock, intentionally widening real-world timing for debugging. Presentation hit-stop holds poses briefly while timing continues.

Simulation emits transient combat events. Rendering/audio/UI consume and discard them each frame. Aggregate kills, parries, breaks, Perfects, and Art uses form a small versioned persistence boundary for future Event Ledger work; no unbounded per-frame history is stored.

Movement uses a constrained circular arena, circular body separation, and an analytic camera bound inside the colonnade. Havok is not needed for this flat room. Future uneven terrain, complex collision, and physics interactions should add a dedicated world/collision adapter rather than putting physics in the HUD.

Save schema v2 stores settings, primary/alternate keyboard and mouse bindings, the musical-cue preference, attributes, loadout, and aggregate counters. The v1→v2 migration preserves existing progress/settings and supplies default bindings. Unknown/corrupt versions recover safely to defaults. Save failures warn and leave the game playable in session mode.

`src/input/bindings.ts` validates control profiles and centralizes the corrected camera-relative movement basis. `src/ui/controls.ts` pauses gameplay while capturing bindings, rejects duplicate inputs, and provides defaults and Escape recovery. HUD instructions are generated from active bindings.

`src/audio/timing.ts` derives Art and enemy-skill phrase timestamps from simulation deadlines; basics have no timing phrase. `CombatAudio` schedules notes ahead on `AudioContext.currentTime`, cancelling/rebasing them on pause, interruption, or slow-motion changes. SVG rings/squares represent the same deadlines; no external audio files or copied music are used. Output-device latency calibration and a full soundtrack remain future work.

Procedural posing is intentionally isolated from combat rules so a skinned GLB animation adapter can replace it. Future controller input should feed the same actions and movement intent. Future Arts use the reusable executor and need no controller branches.

See `COMBAT_AUDIT.md` for required extraction boundaries before expanding content: shared attack/contact timeline, authoritative threat selection, typed progression-eligible outcomes, and learned/equipped Art validation. Existing counters are telemetry, not validated mastery or quest facts.

September 19: `combat/geometry.ts` owns box/sector/disk containment and footprint boundaries; `engine/hitIndicator.ts` renders those boundaries without changing their reach. `combat/timeline.ts` shares phase contact deadlines and skill threat selection. `engine/duelMotion.ts` samples Blender-authored curves using those phase times. Attack events now carry their actual shape to VFX, and player strikes record actual contact time for late-input follow-through.

## Guild Trial and charged Arts

Save v3 adds learned/acquisition records, prerequisite-validated challenge completions and bounded mastery sources/choice. v1/v2 migrate controls, settings, valid loadouts and counters. Ownership, sword compatibility and unique slots are checked at save, equip and execution boundaries. Tutorial practice temporarily equips Crescent while persisting/restoring the real loadout.

`combat/encounter.ts` records phase-deduplicated gameplay outcomes separately from presentation events and lifetime counters. Recent outcomes are capped at 128; totals and deduplication live only for that encounter. `progression/guild.ts` owns reward rules. `ui/guild.ts` pauses the game, displays reward descriptions/results and edits validated loadouts. Reset ends a run; debug resource/stat actions, practice flags and slow motion invalidate rewards. Local saves are not an anti-tamper service.

The input adapter starts an Art on its slot-button down event and grades that same action's final release. On-screen slots use pointer capture. Unreleased charges time out as Miss; basic attacks cannot satisfy Art timing. Successful release begins the movement/swing; damage resolves once at release time plus startup duration. Pause/focus loss refunds and cancels only unreleased charges. Timing music shares the charge deadline; a failed/cancelled charge clears its scheduled notes. Cyan player footprints share the damage sector definition and follow the actor during the released lunge.

Enemy coordination permits one committed pattern at a time with a 350 ms handoff gap. Pairwise body separation moves uncommitted enemies without sliding active footprints. Camera visibility is not yet part of the coordinator.

## Personal journal and paired Arts

The optional FreeCamera follows eye height and uses the existing orbit angles for look direction. The third-person ArcRotateCamera remains the input orientation source. Only the active camera renders; the third-person player mesh is hidden in first person. GuildBoard takes a live-mode predicate: normal journal entry pauses, first-person entry resumes/keeps the world live. UI state stays outside progression state. Native details elements provide keyboard-accessible nested text. A shared glossary handles hover/focus/click explanations without adding persistent HUD paragraphs.

Arts track a current stage and an explicit awaiting-hold phase. Each stage records a distinct hit/grade under the same attack serial. Relative charge durations derive from authored node times; re-pressing the same slot starts the next charge, and missed/expired follow-ups end the chain. SP is charged once. Save ownership remains derived from challenge completion, so prior successful trial saves acquire the final Art on validation.

## Personal profile and menu boundaries

The additive v3 profile stores a sanitized 24-character name, health/stamina supply counts, exactly five unique quick inventory assignments, explored room cells, sentinel discovery and authored dialogue topic history. Migration preserves older saves and initializes missing fields. Equipment inspection derives the five figure slots from the actual weapon plus starter cosmetic clothing: head, right hand, left hand (reserved for a greatsword), body and feet. New armor/equipment acquisition is not implemented.

M toggles the live fantasy interface in either camera mode. Its four categories are Character (Items/Skills/Equipment), Friends, Map and Monster Manual. Ilyra friendship derives from completed induction, quest status from Guild progression, map cells from movement, and sentinel discovery from an encounter. Chats are local authored dialogue, not external messaging. Supplies restore 60 HP or 50 stamina and consume saved stock only outside encounters/lessons.

Escape/Pause opens a separate system overlay containing control bindings, camera perspective, audio and graphics. Manual pause is refused during an active Guild trial while alive; focus-loss/visibility safety always pauses. System overlays sit above the personal interface. Personal Guild pages now remain live in both perspectives.
