# Combat clarity follow-up

Crescent Break now uses one timing input and one strike. Nonlethal hits preserve a committed Art (HP damage still applies). Sentinel basics alternate with skills; basics use narrower arcs, earlier tracking lock, a 260 ms parry window, and animation-only anticipation. Only the nearest skill plays a short low warning; player Arts take audio/UI priority. Dodge uses an airy swish and ground wake, parry a bright metallic response and gold sparks, and Arts pitched notes with a square target. Existing rigid procedural poses were improved; no production animation clips were authored.

Validation: 45 unit tests, all eight browser scenarios, production startup, and build passed. One initial WebGL page startup timed out before the HUD loaded; the targeted live-enemy rerun passed. The Art-priority screenshot was inspected. Audio hardware latency and subjective combat feel still need player feedback.

# September 18 update: quick basics and guided combat

Implemented and verified:
- Basics commit on press, require no timing, deal 5 damage at initial Strength, and generate 10 SP on a landed phase. Holding does not repeat or improve them.
- One input can buffer during the final 100 ms of basic/Art recovery; interruption, pause, and reset clear it.
- Accepted Art phases resolve at the target time or the next substep for late inputs, instead of always waiting until the grading window ends.
- Enemy attacks have rising preparation notes for every hit. Defensive diamonds/rings and action labels mirror the counter cue. Sound can be muted while visual cues remain.
- Five replayable tutorial lessons require real outcomes: basics/SP, dodge, Perfect Parry, Arts, and Break. Practice supplies resources/setup; it does not implement skill unlocks or mastery.
- Perfect Parry still completely negates damage and awards 14 SP plus 32 Break.

Validation on this update: 41 unit tests, 7 Edge browser scenarios (including completing every lesson), production startup smoke test, and TypeScript/Vite build passed. Tutorial screenshot inspected and button contrast corrected. The existing large Babylon bundle warning remains. Audio scheduling is tested; perceived audio/display latency still needs player feedback and calibration.

Local source, game assets, Blender sources, tooling, docs, lockfile, and tests are preserved in this repository. Dependencies and generated builds are reproducible and ignored by Git.

---

# Combat Lab verification

First playable implementation, September 18, 2026. The functional Combat Lab exists; the full RPG and production anime art do not.

## Verified functionality

- Browser launch and entry into a real Babylon 3D arena.
- Camera-relative WASD movement, sprint/stamina, drag orbit, zoom, analytic camera bounds, lock and target-switch implementation.
- Held/released basics with real-time grading, hit volumes, SP gain/cap, hit deduplication, and recovery commitment.
- Exactly four Art slots; Crescent Break spends 30 SP, accepts three timed presses, applies grade-dependent damage/Break, and finishes/recoveries without free cancellation.
- Directional dodge with stamina and invulnerability windows; parry with SP/Break rewards; consecutive parries; simple guard.
- Three telegraphed enemy patterns, approach, recovery, HP/Break, full Break stagger, vulnerability, death, and reset.
- Player damage/death, immediate R restart, pause/focus safety, HUD, audio/visual cues, debug controls, quality presets, and performance overlay.
- Versioned IndexedDB settings, attributes, loadout, and aggregate counters survive reload.

## Automated and visual verification

`npm test`: **37 passing tests** covering the original combat/save suite plus control profile validation, corrected strafe direction, binding conflicts, v1→v2 save migration, musical deadline alignment, and lethal-hit/SP-cap Perfect Parry behavior.

Playwright runs the real game in locally installed Microsoft Edge. Two functional scenarios verify movement/sprint, orbit/lock, actual keyboard and mouse attacks, SP, all three timed Art nodes, action commitment, debug/quality controls, save/reload, live parry, live dodge, consecutive parries, Break, enemy/player death, reset, and pause. A third scenario measures 1080p High and repeats reset/lock five times. Dev-only setup hooks arrange encounters; the tested player actions use browser input. WebGPU and explicit WebGL are covered. No known gameplay-breaking console exceptions remain.

Two further passing browser scenarios verify the player-facing controls menu, keyboard/mouse remapping, conflict handling, capture cancellation, paused simulation, restored defaults, reload persistence, ring/square timing geometry, musical cue deadlines, and cancellation on pause. Total: **5 passing development browser scenarios**. Controls and timing screenshots were inspected. Audio scheduling is verified programmatically; subjective musical feel still needs listening/playtesting.

Screenshots from the running browser were inspected directly. The in-app browser also reached a WebGPU-ready scene with no logged errors, but its subsequent interaction tool timed out; functional interaction verification was completed through Playwright, not claimed as a human playtest.

Measured local Edge/WebGPU benchmark at **1920×1080, High**: approximately **120 FPS**, **8.32 ms mean frame time**, **10.20 ms p95**, 179 active meshes / 520 draws in the sampled encounter. These are this machine's short-run results, not a cross-device guarantee. Browser test runs write machine-readable samples and screenshots to ignored `test-results/`.

`npm run build` passed. `npm run test:production` passed its additional smoke test against the built game with external network requests blocked, confirming local WebGPU startup, input/reset, and absence of development hooks. The build emits a bundle-size warning, documented below.

## Remaining limitations

- Character models and rigid procedural animation are prototypes. No production anime rig, authored motion clips, facial animation, cloth, or deformation.
- Arena shell/scenery remain temporary geometry. Collision is analytic, with no Havok/terrain or physically exact weapon sweep.
- One Art, three empty slots. No acquisition, mastery, loadout editor, quests, NPCs, inventory, progression world, or multiplayer.
- Hit-stop holds presentation poses while combat timing continues. Sound is synthesized cues, not a production mix.
- The broad Babylon import yields a large (~5.9 MB minified entry before compression) chunk warning. Startup/bundle and repeated draw-call optimization remain useful work.
- Desktop keyboard/mouse only; the Controls menu now supports persistent primary/alternate bindings, with sensitivity exposed in Lab tools. Controller, touch, and keyboard-layout-aware labels are not implemented.
- Combat fun and accessibility need extended human playtesting. Passing the functional checks does not establish final combat polish.

## Next priority

Replace rigid procedural sword motion with authored anticipation, strike, recovery, and defensive animation clips, then tune enemy telegraphs and hit feedback through playtesting before expanding the world.

See `docs/PROTOTYPE_PLAN.md` for the reviewed progression and musical-combat roadmap. The first ring/square and musical lead-in pass is implemented; calibration, full score, skill acquisition/mastery, and the larger progression loop are planned work.
