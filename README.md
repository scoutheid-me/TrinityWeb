# TRINITY — The Aether Hall

A real-time third-person browser action RPG prototype. This first Combat Lab focuses on quick basic strikes and timed Arts, SP, Combat Arts, dodge/parry, and enemy Break. It is a playable development milestone, not the finished RPG.

## Run locally

Requires Node.js 24 LTS (the installed runtime used for development).

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:5173 and choose **Enter the hall**. Use `?webgl` to explicitly test the WebGL fallback. No account or backend is required.

```powershell
npm test
npm run test:browser
npm run build
npm run test:production
npm run preview
```

Browser tests use the locally installed Microsoft Edge channel. The development-only `window.trinity` interface lets the test suite arrange repeatable encounters, inspect actual simulation state, and measure the real renderer. It is omitted from production builds.

## Controls

| Input | Action |
| --- | --- |
| WASD | Camera-relative movement |
| Shift | Sprint; consumes stamina |
| Tap left mouse or J | Untimed low-damage basic attack |
| 1 | Crescent Break; tap left mouse/J at its single pulse |
| 2–4 | Remaining Art slots; initially empty |
| Space + movement | Directional dodge; forward without movement input |
| Q | Parry |
| Hold F | Guard |
| Tab | Toggle enemy lock |
| E | Switch lock target |
| Hold right mouse and drag | Orbit camera |
| Mouse wheel | Camera distance |
| R | Reset encounter, including after death |
| Escape | Pause/resume |
| Backtick | Developer panel |

Basic attacks commit on press, deal 5 damage at starting Strength, and earn 10 SP per landed hit (cap 100). Holding or releasing does not affect damage or SP. Crescent Break costs 30 SP and has one timed input; misses still attack at reduced strength. Gold attacks can be parried; red sweeps must be dodged. Break creates a 3.4-second opening with ×1.6 damage.

Settings, attributes, four-slot loadout, and aggregate combat counters persist in IndexedDB. Encounter HP/SP/positions and developer cheats intentionally reset each session.

Choose **Controls** from the title/pause screen or the upper-right HUD to remap keyboard and mouse inputs. Every action has primary/alternate slots. Conflicts are reported; clear the old binding before reusing a key. Changes save automatically, and **Restore defaults** resets the profile. Escape always remains a pause/cancel fallback. The A/D strafe direction has been flipped from the initial prototype to correct the camera handedness.

Timing uses defensive diamonds/rings and squares for Art taps, with original musical lead-ins ending on the sweet spot. Musical timing cues can be disabled in Lab tools. A successful **Perfect Parry** blocks all damage, gives **14 SP** (capped at 100), and builds enemy Break.

The reviewed roadmap for skills, mastery, musical combat, and animation is in [PROTOTYPE_PLAN.md](docs/PROTOTYPE_PLAN.md). Those future progression systems are not yet implemented.

Choose **Combat tutorial** on the title/pause screen or HUD for five replayable lessons: basics/SP, dodge, Perfect Parry, Arts, and Break. Each lesson requires an actual combat outcome. Retry restores the practice setup. Exit returns to a fresh encounter. Enemy build-up notes rise toward a final cue 80 ms before parryable hits or 150 ms before sweeps; visual warnings remain available with sound muted.

## Assets and scope

Original Blender-generated GLBs and editable `.blend` sources are included. Rebuild them with:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python-exit-code 1 --python Tools/Blender/build_lab.py
```

The player and enemy are articulated prototype models with procedural poses, not production anime characters or skinned animation assets. The arena shell and distant scenery remain procedural prototype geometry. See [asset conventions](docs/ASSET_PIPELINE.md) and [verification status](docs/STATUS.md).

Design references: [GDD](docs/GDD.md), [architecture](docs/ARCHITECTURE.md), [combat](docs/COMBAT.md), [Arts](docs/SKILLS.md), [future quests](docs/QUESTS.md), [art direction](docs/ART_BIBLE.md), and [performance](docs/PERFORMANCE.md).
