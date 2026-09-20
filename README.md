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
| 1 | Hold to charge Crescent Break; release when the squares meet |
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

Basic attacks commit on press, deal 5 damage at starting Strength, and earn 10 SP per landed hit (cap 100). Holding or releasing does not affect damage or SP. Crescent Break costs 30 SP. Hold its slot button and release on the bright note: Perfect gives full damage and Break, Good gives 60%, and a Miss fails completely with no strike (SP is spent). Its cyan sector shows the actual attack area and tracks the released lunge. Gold attacks can be parried; red sweeps must be dodged. Break creates a 3.4-second opening with ×1.6 damage.

Learned Arts, challenge completions, mastery choice, settings, attributes, four-slot loadout, and aggregate combat counters persist in IndexedDB. Encounter HP/SP/positions and developer cheats intentionally reset each session.

Choose **Controls** from the title/pause screen or the upper-right HUD to remap keyboard and mouse inputs. Every action has primary/alternate slots. Conflicts are reported; clear the old binding before reusing a key. Changes save automatically, and **Restore defaults** resets the profile. Escape always remains a pause/cancel fallback. The A/D strafe direction has been flipped from the initial prototype to correct the camera handedness.

Timing uses defensive diamonds/rings and squares for Art taps, with original musical lead-ins ending on the sweet spot. Musical timing cues can be disabled in Lab tools. A hit during a failed parry deals **50% extra damage**. A successful **Perfect Parry** blocks all damage, gives **14 SP** (capped at 100), and builds enemy Break.

The reviewed roadmap for skills, mastery, musical combat, and animation is in [PROTOTYPE_PLAN.md](docs/PROTOTYPE_PLAN.md). The first earned-Art and mastery slice is available through the Guild board.

Choose **Combat tutorial** on the title/pause screen or HUD for five replayable lessons: basics/SP, dodge, Perfect Parry, Arts, and Break. Each lesson requires an actual combat outcome. Retry restores the practice setup. Exit returns to a fresh encounter. Enemy build-up notes rise toward a final cue 80 ms before parryable hits or 150 ms before sweeps; visual warnings remain available with sound muted.

## Assets and scope

Original Blender-generated GLBs and editable `.blend` sources are included. Rebuild them with:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python-exit-code 1 --python Tools/Blender/build_lab.py
```

The player and enemy are articulated prototype models with procedural poses, not production anime characters or skinned animation assets. The arena shell and distant scenery remain procedural prototype geometry. See [asset conventions](docs/ASSET_PIPELINE.md) and [verification status](docs/STATUS.md).

Design references: [GDD](docs/GDD.md), [architecture](docs/ARCHITECTURE.md), [combat](docs/COMBAT.md), [Arts](docs/SKILLS.md), [future quests](docs/QUESTS.md), [art direction](docs/ART_BIBLE.md), and [performance](docs/PERFORMANCE.md).

The [combat quality and scalability audit](docs/COMBAT_AUDIT.md) records the production gaps, current verification, and next implementation gates.

Enemy attack warnings now show their actual gameplay footprint: a narrow cleave lane, a fan for the double cut, or a full disk for the radial sweep. Their reach stays fixed during windup. Muted decorative floor inlays are separate from these attack outlines. The duel uses Blender-authored contact-marked motion curves on the existing prototype characters.

The current HUD uses a compact floating-glass style based on the supplied visual references. Use the right-side menu for pause, controls and tutorial. Performance telemetry is available in Lab tools. See the [current expansion plan](docs/EXPANSION_PLAN.md) for the Guild Trial implementation and remaining expansion gates.

## Guild Trial

Choose **Guild board** from the title screen or right-side menu. Complete Footwork (three basic hits and an evade), Break the guard (Art hit and Break), and Counter discipline (three Perfect Parries) to earn Aether Step, Resonant Cleave, and Stillwater Cut. Each challenge describes its reward; completion automatically opens a result screen with the Art's purpose and controls. Equip learned Arts in four unique slots between challenges, then defeat the two-Sentinel Guild Trial.

Complete two different challenges with a landed Good/Perfect Crescent Break to earn its mastery choice: 200 ms recovery, or +35% Break with 460 ms recovery. Each challenge gives at most one credit; replay can earn a missing credit. Practice modifiers, tutorial activity, resets and whiffs grant no unlocks. Challenges use standard attributes.

The original supplied HUD images are preserved under [References/HUD](References/HUD/README.md), outside shipped runtime assets.

## The Lantern Oath

Ilyra’s induction now leads into the Lantern Guild journal. Four trials teach footing, guard-breaking, nerve and the combined oath. Early rewards are simple single-release Arts. Complete the final trial to earn the **Wayfarer** title and **Wayfarer’s Oath**, a two-event Art: release the first charge, then hold and release the same slot again. Five learned Arts still fit into only four equipped slots.

Use **First person** on the right menu to switch views. Hold your mapped orbit input (right mouse by default) to look. The **Guild journal** becomes a personal screen-mounted window and keeps combat/movement running. Close it with × or Escape; Escape again pauses. Focus loss still pauses safely. Journey and Arts tabs keep the journal compact; highlighted summaries expand, and dotted HUD terms reveal hover/focus/click help.

The current location is **Guild Hall Training Room**. Open **Edit Arts · Weapon rack** to switch between the three training weapons or change Art slots. Skill cards and the downloadable skill bank are available there and in the Guild journal. See [training skills](docs/SKILLS.md) and [Blender MCP setup](docs/BLENDER_MCP_SETUP.md).
