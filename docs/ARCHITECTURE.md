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
