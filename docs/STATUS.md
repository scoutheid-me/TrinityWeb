# September 21: training orb, boar and skill selection

An entrance orb at (2, -9) uses the saved Interact binding and proximity checks. It offers repeat Aether Sentinel or Woodland Boar fights only when no lesson/trial/live opponent is active. Starting a bout restores player resources and returns the player to the arena start. The room remains empty until an encounter is chosen.

Woodland Boar has 220 HP, a parryable 18-damage tusk jab and an unparryable 30-damage head sweep, with distinct footprints and long recovery. It uses an original Blender-authored quadruped with procedural leg/body poses, not production skeletal animation. Encountering it adds a persistent Monster Manual entry.

Skills now lists learned names, equipped-slot labels and a collapsible Skill Books section. Selecting a name opens its description, radar and stats with four direct equip buttons. Reassigning moves the skill without duplicates; weapon and trial restrictions remain enforced. The stats scroll independently of the title and slot controls.

Validation: 98 unit tests pass; new orb and skill browser checks pass, including remapped interaction, repeat opponent choice, model loading and moving a skill between slots. All 24 browser scenarios pass across the full regression and focused reruns. The initial asset-count assertion was updated from six to seven for the new boar model. TypeScript/Vite build and production startup pass; the existing bundle-size warning remains. First-/third-person screenshots and compact-width overflow checks were inspected.

---

# September 21: character creation and Training Room entry

Added name and man/woman character creation, preserving old save progression while asking existing profiles to finish the new creation step once. Subsequent name changes live in paused game settings; the personal menu name is read-only. Both prototype character appearances load from Blender assets with identical combat capability. The woman variant retains the established rig and weapon sockets.

The location is now Training Room, within the Guild Hall. First person is the launch default. The main screen explains the Guild Challenge; first entry offers a floating invitation. Accept starts all five combat basics lessons; decline leaves the room empty. Completing the lessons awards Linear and opens a reward card explaining Perfect/full damage + 6 m travel, Good/60% + 1 m travel, Miss failure, SP and hold windows. Later Guild trials and their rewards remain available separately.

Interact is a remappable action (default G). Browser coverage changes it to H, verifies the contextual prompt, checks that G no longer opens the rack, uses H to equip a weapon, then reloads to verify persistence.

Validation: 96 unit tests pass. All 23 browser scenarios pass across the full regression and a focused rerun: the five-enemy benchmark timed out during an 8.6-hour execution interruption, then passed on rerun in 5.7 seconds. Character creation, first-person challenge completion, Linear reward, settings rename and interaction remapping pass. TypeScript/Vite build and production startup pass; the existing bundle-size warning remains. Screenshots cover creation, the invitation and the Blender-authored woman character in game.

---

# September 20: character profile, fantasy menu and Skill Books introduction

Added a saved editable character name, exactly five figure equipment slots (head, right hand, left hand, body, feet), and five assignable quick-inventory slots. Two starter supply types have persistent stock and can be consumed between encounters. The actual weapon and its two-handed reservation are reflected in Equipment; starter clothes/boots are cosmetic and the head slot is empty. No new armor acquisition system is implied.

The live personal menu now branches through Character (Items/Skills/Equipment), Friends, Map and Monster Manual. Ilyra becomes a friend after induction; her profile includes location, real Guild quest progress and authored local chats. The floor map records room exploration; the manual remembers encountering a sentinel. Control bindings, camera mode, sound and graphics moved into the higher paused game overlay. Manual pause is blocked during active Guild trials while alive; focus-loss safety can still pause.

Combat Art damage now uses equipped weapon base × node multiplier × Strength scaling × timing grade. General forms have lower coefficients than restricted forms. Skill cards and downloadable bank schema 2 expose the formula and updated data. Skill Books introduce themed variable-size trees: Lantern Road Forms is an interactive four-node preview of the planned future tutorial-dungeon reward. The final induction lesson explains books, prerequisites and practice milestones. Book acquisition/study is intentionally not available before that dungeon exists. Current rewards remain intact. Removed the HUD Edit Arts button and slot-context editor; loadouts are edited through the personal Skills menu.

Validation: 96 unit tests pass. All 21 browser scenarios pass across regression and focused reruns, including the complete tutorial/Guild journey, names and inventory persistence, five-plus-five slots, supplies, friends/chats, explored map, manual discovery, layered pause restrictions, and book-node inspection. An old remapped-mouse test clicked the new map icon; it now clicks the arena and passes. TypeScript/Vite build and production startup pass. Desktop/compact and skill-book screenshots were inspected. The existing bundle-size warning remains.

---

# September 20: overhead greatsword and floating equipment interface

The greatsword now deals 12 base damage (15 at Strength 10), compared with the one-handed sword's 4 base. Its slower 420 ms nominal wind-up and 520 ms recovery accompany a dedicated overhead cut. A 2.2 m by 0.96 m forward footprint replaces the wide fan, with blade-edge orientation corrected in both perspectives. Both hand constraints remain intact.

The M menu now presents an original silhouette/equipment window, inspectable weapon and cosmetic attire sockets, circular icon rail and hover/focus/click character branches. Combat Arts can be edited directly from the character branch. First-person panels remain translucent, viewport-mounted and live, including right-drag camera movement over the windows. HP, SP and stamina now form one stepped status display inspired by the preserved reference sheets. All six additional image attachments were archived under References/HUD; they are reference material only. Final visual checks are under docs/screenshots.

Validation: 94 unit tests pass. All 21 browser scenarios passed across regression and focused runs, including the full tutorial and Guild journey, equipment branching, actual weapon stats, movement while the personal menu is open, and both-hand grip checks through complete basic/Art cycles in both views (under 1 cm separation). One old camera test clicked the new icon rail; it now closes the menu before arena drag and passes. Desktop and compact layouts plus both weapon perspectives were visually inspected and iterated. TypeScript/Vite build and the production startup check pass with the pre-existing bundle-size warning.

Limits: the interface is an original reference-inspired DOM artifact, not a world-occluded 3D panel. The character remains the stylized rigid-part prototype with procedural grip-driven motion; this does not establish production/AAA animation quality. Cosmetic attire is identified as such.

---

# September 20: physical armory, two-handed grip and personal menu

The hall now starts empty. Lessons and Guild trials explicitly spawn opponents; reset, tutorial exit and completed-trial cleanup return to an empty room. Weapon selection moved out of the HUD Art editor and into a proximity-gated physical rack (G / Interact). Walking away closes the rack.

The Wayfarer now has Blender-authored elbow joints. Greatsword attacks drive a shared weapon pose with both hands constrained to separate grip points. First-person arms reuse that hierarchy with shoulder armor hidden to preserve visibility. The model remains a stylized rigid-part rig rather than a skinned production character.

M toggles the side menu. First-person settings are translucent viewport-mounted panels; movement/look and simulation continue outside key-binding capture. Explicit pause and focus loss still pause safely. Right-drag camera movement is inverted on both axes. Automatic locked-target facing applies in both perspectives and can be disabled in Controls; the setting persists. Committed Art trajectories preserve their released direction.

Validation: 91 unit tests pass. All 20 browser scenarios passed across regression and focused runs, including the entire Guild journey, physical rack interaction, empty startup/reset, live first-person movement, camera preferences and grip checks through complete basic/Art cycles in both views (under 1 cm hand/socket separation). Older reset/menu assertions and a conflicting test-only G binding were updated to the new behavior. Rendered idle, swing and first-person menu views were inspected. TypeScript/Vite build and production startup verified. The existing large-bundle warning remains.

---

# September 20: training skills, three weapons and first-person control

Fresh saves start with Focused Strike; finishing induction awards only Linear. Perfect Linear travels six meters through one target; Good travels one meter with reduced damage; Miss does not move or strike. Other Arts have distinct roles: lateral movement, wide coverage, heavy Break, stamina restoration, or a two-event chain. Eligible regular combat also unlocks skills independently of tutorials. Old v3 starter ownership is preserved.

Added a direct HUD Art editor and three-weapon rack (one-handed sword, rapier, two-handed sword), known-skill statistics/radar cards and a generated downloadable bank. Renamed the location Guild Hall Training Room, within the planned Town of Beginnings Guild Hall. First person supports mouse-look, arrow-key look and automatic locked-target orientation. Original Blender exports supply the weapon meshes. MCP setup is documented; it was not installed or connected during this pass.

Validation: 87 unit tests pass. All 18 browser scenarios passed across regression and focused runs, including the full tutorial, four live Guild challenges, saved rewards, three weapon loads, direct slot editing, camera lock and responsive skill cards. Two initial browser failures were resolved: an outdated Aether description assertion and a development reload during the journey run. The complete journey passed on rerun. TypeScript/Vite build and production startup pass. Desktop/compact skill cards and first-person weapon screenshots were inspected; a wrapping menu label was corrected.

Limits: this remains a prototype. Weapon types share the rigid-part animation rig; dedicated two-handed grip animation and skinned first-person hands are not implemented. The town is not built. The existing Babylon bundle-size warning remains. Next work is animation/contact polish and a small Guild foyer before outdoor expansion.

---

# September 19: Lantern Guild presentation and first person

Reorganized the journal into Journey and Arts/loadout tabs, with expandable guidance, reward descriptions, combat records and mastery. Tutorial lessons show one short instruction before optional timing details and lead directly to the Guild. Dotted HUD terms show shared hover/focus/click help. Typography, spacing, reward panels and the live journal use the preserved pale-glass reference direction.

Added an eye-level first-person camera and perspective button. Mouse orbit controls become mouse look; the personal journal stays mounted to the viewport while movement, enemies and damage continue. Explicit pause and focus-loss safety remain. Current first-person view hides the third-person body; a dedicated hands/weapon viewmodel is not part of this pass.

Warden Ilyra’s Lantern Oath connects all four trials. The basic reward Arts stay single-event and Stillwater Cut no longer requires a counter opportunity. The final trial grants the Wayfarer title and Wayfarer’s Oath, with two independently graded hold/release events. Existing completed-trial saves receive the new reward without losing unlocks or loadouts.

Verification: 80 unit tests; the existing 15 browser scenarios, full tutorial, and a real-time browser run of all four Guild trials passed. The full journey test earned/saved/equipped the final reward and landed both timed cuts. A first-person hover test exposed pointer interception; fixed the interactive HUD terms and hid underlying menu buttons while the personal journal is open. The corrected first-person scenario and tutorial/reward scenarios passed on rerun. Across the regression and focused runs, all 17 browser scenarios passed. TypeScript/Vite build and production startup passed; journal and first-person screenshots were inspected.

The world, characters and first-person presentation remain prototype assets. This improves the playable presentation and journey; it does not establish AAA production readiness or replace human feel testing.

---

# September 19: Guild Trial and hold/release Arts

Implemented the first progression slice in the existing hall: Footwork, Break the guard, Counter discipline and a two-Sentinel Guild Trial. Earn three original Arts, equip four unique learned sword Arts, and choose a bounded Crescent mastery modifier. Save v3 migrates settings/bindings and preserves unlocks/builds. Typed phase-deduplicated encounter outcomes grant rewards; resets, tutorial practice, debug changes and whiffs do not. One enemy commits at a time and uncommitted bodies separate.

Arts now require holding their equipped slot button and releasing on the musical/visual charge event. Perfect gives full damage/Break, Good 60%, and Miss completely fails with no strike while spending SP. Successful release starts the swing/lunge; basics remain untimed. The cyan sector uses actual damage range and arc. Keyboard remaps and on-screen pointer holds use the same executor. Pause/focus loss refunds and cancels unreleased charges. Tutorial and HUD explain these rules.

Challenge cards explicitly connect their reward Art to its purpose and cost. Completion pauses into an acquisition panel with the skill name, description and usage. Preserved both original user-supplied HUD reference PNGs under References/HUD and documented them in AGENTS.md.

Validation: 77 unit tests, all 15 Edge browser scenarios, TypeScript/Vite build and production startup passed. The simulation test completes all four authored challenges through live AI/action rules; browser tests earn, equip and reload Aether Step, finish all tutorial lessons, and exercise key/mouse charging, failure, cancellation and matching hitbox geometry. Inspected reward and charge-preview screenshots; corrected the new Guild button placement. Three focused browser checks and production startup rerun after the layout fix.

Limitations: this is the Guild Trial slice, not the complete RPG. Production rigs/reactions, offscreen-pressure validation, calibration/accessibility, trainer/world interaction, equipment and region/quest expansion remain tracked in EXPANSION_PLAN.md. Human timing/feel and session-length validation are still needed. Existing Babylon bundle-size warning remains.

---

# September 19: floating-glass HUD and expansion plan

Restyled the HUD and menus from the supplied visual references using original CSS: pale translucent panels, angular green HP, gold highlights, upper-left resources, upper-right target information, compact bottom Art slots, and a functional right-side menu rail. Removed persistent combat instructions and hid performance telemetry by default (available in Lab tools). Art labels/costs now read the equipped definitions.

Verification: build, all 12 existing browser scenarios, and production startup passed. Inspected combat, controls, tutorial, 1280×720 pause menu, and 640×900 HUD screenshots. Resource/target/Art panels stay inside the smaller viewport; keyboard/mouse remains the supported input. Existing bundle-size warning remains.

`EXPANSION_PLAN.md` is the current roadmap: a Guild Trial inside the existing hall, preceded by per-Art policies and trustworthy outcome/reward events, then earned Arts, four-slot loadouts and a small mastery choice. Enemy/boss expansion, equipment, trainers, deterministic Event Ledger/quests and the first region follow explicit acceptance gates. This is planned work, not implemented progression.

# September 19: actual hit footprints and contact-marked duel motion

Implemented:
- Cleave: forward 2.6 m × 0.96 m box; double cut: 2.9 m sector; sweep: actual 3.4 m disk. Shared shape data drives damage and every enemy's rendered footprint. Opacity pulses without changing reach.
- Blender-authored rigid-joint motion curves with contact markers, saved in separate editable combat sources and sampled into the runtime. Directional slash effects now use real attack reach; second cuts mirror their motion. Player follow-through uses the actual damage resolution time, including late/missed Art inputs.
- Shared imminent-skill selection for audio/HUD; each enemy retains its own ground warning. Decorative floor rings are muted to distinguish them from attack footprints.
- Player debug footprint uses the shared sector geometry; enemy warnings clear after contact, reset, death or Break.

Validation: 60 unit tests and 12 Edge browser scenarios passed, including real inside/outside cleave avoidance and all three footprint shapes. Screenshots inspected; three final focused browser checks passed after the contrast adjustment. Production build and startup passed. Existing large bundle warning remains. Blender source saves and sampled curves succeeded despite thumbnail-cache warnings.

Limitations: these are ground-center hit tests and contact-marked rigid-part animations, not skinned production animation or continuous blade collision. This completes the first contact/footprint pass, not the entire AAA polish milestone. Multi-enemy attack coordination, body separation, production rigs and the remaining audit gates still apply.

# Counter risk and combat audit

Failed parry commitment now takes 1.5× incoming damage; successful counters retain zero damage, +14 SP and +32 Break. Live input tests verified cleave damage of 24 neutral / 36 failed / 0 successful. The audit in `COMBAT_AUDIT.md` concludes this is a working foundation, not yet AAA-ready or ready for world expansion. It details animation/contact, threat coordination, per-Art rules and progression/ledger gaps, with verification and performance measurements.

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
