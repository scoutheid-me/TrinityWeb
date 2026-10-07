# Trinity Development Instructions

These instructions apply to the Combat Lab and all future work in this repository.

## Game development

- Build an original, real-time, anime action RPG with third-person and optional first-person views. The immediate scope is one playable Combat Lab; prioritize combat feel before world expansion. Do not add multiplayer or copy assets from other games.
- Use TypeScript, Vite, and Babylon.js with WebGPU detection and WebGL fallback. Keep simulation, rendering, input, UI, balance data, and saves separate. Define Combat Arts and enemy attacks through data, with exactly four equipped Art slots.
- Core loop: untimed low-damage basics generate SP. Hold an equipped Art's selection button to charge, then release that same button at its single musical/visual timing event. Perfect gives full damage/Break, Good gives 60%, Miss produces no strike and spends SP. Show the actual Art hit footprint while charging/executing. Stagger creates an opening. Use elapsed milliseconds, explicit legal state transitions, and phase-level hit deduplication.
- Guild challenges must clearly describe the awarded Art before entry and show its name, purpose, cost and usage on completion. Unlocks/mastery come from eligible encounter outcomes, never tutorial/debug telemetry. Keep four unique learned, weapon-compatible equipped slots and migrate saved controls/progress. Starter/training Arts stay simple single-event moves. The old four-part Guild Trial UI is retired; preserve existing earned skills in save migration. Wayfarer’s Oath remains a two-event Art obtainable through eligible field progression.
- Keep UI text compact, with highlighted hover/focus help and expandable details. The first-person personal journal is viewport-mounted and keeps the simulation running; explicit pause and focus-loss safety still pause.
- Preserve the user's original GUI/HUD reference images in `References/HUD/`; consult them for visual direction while building original runtime UI.
- Perfect Counter negates incoming damage, rewards SP/Break and returns weapon-scaled counter damage; a hit during failed counter commitment deals extra damage. Keep counter windows and the failure multiplier in balance data.
- Preserve a playable build. Run core combat tests and browser integration checks, inspect the actual scene, and report measured results and honest limitations. Do not claim milestones complete based only on compilation. Keep the design and implementation documents in `docs/` current.

## Blender / 3D Asset Pipeline

- Blender MCP is an approved core Trinity development tool. Treat it as part of the normal toolchain, not a separate manual workflow. For any task involving or benefiting from 3D assets, inspect available MCP/tool integrations first and check Blender availability. This includes models, characters, enemies, weapons, armor, props, buildings, environments, terrain, collision meshes, rigs, skeletons, animation, UVs, materials, mesh cleanup/optimization, LODs, GLB/glTF export, asset modification/conversion, procedural generation, and imported-asset testing or repair.
- When available and appropriate, use Blender autonomously to create or modify assets. Do not ask the user to open Blender, model, export, move files, or perform other steps the available tools can perform. If an operation technically requires a running Blender instance, state the actual limitation accurately; do not assume manual interaction is required.
- Follow [docs/ASSET_PIPELINE.md](docs/ASSET_PIPELINE.md). Preserve useful Blender sources, export game-ready GLB/glTF directly into the correct runtime asset directory, import into Trinity, and test in the running game. Inspect scale, orientation, materials, lighting, animation, attachments, collision, and performance; correct and re-export until the result works. The in-game result is the source of truth.
- Keep assets organized under the game's runtime structure, normally `public/assets/{characters,enemies,weapons,environments,props,animations,textures,materials}/`. Useful production Blender sources may live in `art/blender/`; reusable tooling belongs in `Tools/Blender/`. Ignore temporary/backup files, not production sources. Existing `Assets/Test/` and `Renders/Test/` contain smoke-test artifacts, not production runtime assets.
- Gameplay comes first. Runtime primitives and placeholder meshes are acceptable for early mechanics, collision, movement, layout, combat-range, architecture, and debug experiments. Clearly mark them as temporary and progressively replace programmer art with proper assets when it becomes intended visual presentation. Improve the Combat Lab through Blender once core combat works; do not delay gameplay for prolonged asset polishing.
- Maintain shared scale, axes, skeleton, naming, animation, socket, weapon-origin, export, collision, and LOD conventions in the pipeline document. Fix inconsistent exports at the pipeline level instead of accumulating per-asset runtime compensation, unless a runtime transform is genuinely preferable.
- Target real-time browser performance: reasonable polygon and bone counts, reusable materials, useful atlases/LODs, simplified collision, optimized animation tracks, and supported texture/mesh compression. Automate repetitive cleanup, validation, and export where useful.
- If Blender MCP is unavailable or fails, diagnose the tool/connection state and attempt reasonable available corrections. Use available repository Blender automation where appropriate, or continue gameplay with clearly documented temporary placeholders. Never claim an uncreated or untested production asset is complete; revisit placeholders when tooling is restored.

Keep this section persistent so future sessions do not need the user to repeat these rules.

## Current training scope

- Fresh characters begin with Focused Strike; induction awards only Linear. Keep normal-combat unlocks separate from tutorial/debug practice.
- Limit the test rack to one-handed sword, rapier and two-handed sword. Focused Strike and Linear are shared training forms; other Guild forms currently require the one-handed sword. The rack teaches Needle Step for rapier and Iron Horizon for greatsword; both remain weapon-restricted.
- Call the location Training Room, within the Guild Hall in the Town of Beginnings. Do not imply the surrounding town is implemented.
- Regenerate the downloadable skill bank from balance data with `npm run export:skills`; builds do this automatically. See `docs/SKILLS.md` and `docs/BLENDER_MCP_SETUP.md`.

- Keep the hall empty outside explicitly started lessons/trials. Weapon selection belongs to the physical rack with proximity validation, never the HUD Art editor.
- Preserve both greatsword grip constraints and articulated elbows through animation/equipment changes. Test hand-to-grip contact in both views.
- M opens the live fantasy personal menu in both perspectives. Technical settings belong to the paused game overlay; manual pause is restricted during active trials, while focus-loss safety can always pause. Persist the optional target-facing preference in both perspectives. Right-drag camera movement is inverted on both axes.

- Character creation collects a name and man/woman character before entry; preserve existing progression during migration. Rename only in paused game settings. Start in first person. Entry directs players to the entrance orb for the single Guild Combat Trial, which awards only Linear and explains its Perfect/Good movement. Interact defaults to E (target switching defaults to T) and is remappable; rack prompts must reflect the saved binding.

- Friends lists NPC contacts, not places or trial-launch buttons. Ilyra has one induction quest; completed quests live in its collapsible archive. No automatic Wayfarer title.
- Current basic balance: sword 8 single / 6 per victim in groups, 60° fan; rapier 10 single-target / 3 Break; greatsword 28 per victim / 9 Break. Shared Basic Arts always use original weapon base damage. Rapier Art Break ×1.1; greatsword Art Break ×1.6. Greatsword must lead overall damage and Break, especially AoE; rapier wins speed and sword is versatile. Verify with npm run benchmark.
- GM item tuning belongs to the paused settings overlay. Persist overrides separately from character progression, validate all edits, offer reset/export, and prevent GM encounters from earning progression. Radar charts use fixed documented scales and expose exact values.

- T clears a lone target; freeform attacks use player facing. Creature turning is rate-limited and committed attacks stop tracking. Rear hits deal +20% damage in a 120° rear arc, measured at contact.

- Player-facing terminology is Counter (legacy parry IDs remain for save compatibility). Enemy Counter cues use a five-note musical ascent resolving 80 ms before contact; basic attacks have quieter cues. Keep red dodge cues distinct and player Art music prioritized. See docs/PLAYTEST_ROADMAP.md for current review and release gates.

## Under-town prologue (current expansion)

- New characters select a premade man/woman, name and starting sword/rapier/greatsword, then enter the connected cavern in first person. Version 2 journey migration resets the obsolete version 1 lesson prologue and its learned skills. Legacy training saves remain available.
- The cavern is one preloaded explorable scene. The main spine is 0→1→5→6→7→8→9, with optional supply (3) and camp/aqueduct (4→2) branches. First encounter is exactly one goblin; its portcullis opens on defeat. Room leashes keep the final captain alone. Rooms and corridors share geometry and collision layout in src/world/cavern.ts and public/data/cavern-layout.json. No room transitions, loading gates or required lesson checklists. Formal instruction and Linear remain in the separate Guild Hall Trial.
- Joining grants only Focused Strike. The waking narration precedes a translucent side Message and optional Find an exit Alert. Accepting gives an official quest with a declared Skill Book reward; declining permits exploration but never grants that quest reward. Message/Alert panes stay live; narrative conversations pause.
- Goblins and captain use the supplied Synty models in D:/Synty. Incompatible imported locomotion joint translations distorted the mesh: current export retargets supplied locomotion joint directions while preserving bind offsets, and authors separate attack clips. Preserve attribution and production sources, never copy raw packs or ZIPs into the repository.
- Captain defeat opens the daylight path. Mira thanks the party and foreshadows organized goblins outside town. Accepted quest completion offers exactly one of three weapon-neutral two-node primers. Only its root is granted; the leaf requires eligible subsequent practice. Treasure, Col, checkpoint and reward claims persist without duplication. Debug encounters cannot grant rewards.
- Town is a small endpoint, not a completed world. The 15–20 minute duration remains a human playtest target, not a measured claim. See docs/CAVERN_PROLOGUE.md.

## Permanent play deployment

- Stable play URL: https://scoutheid-me.github.io/TrinityWeb/ . Push tested work to main to publish automatically through .github/workflows/pages.yml; verify the deployment instead of handing the user a temporary localhost link as the primary play address.
- Preserve project-path-safe runtime assets via src/publicUrl.ts. build:pages emits the public playtest (no GM/dev hooks) under /TrinityWeb/. A failed CI check must not replace the last playable deployment. See docs/HOSTING.md.

## Current navigation and capture behavior

- Mouse capture is on by default. Request it from gameplay/resume gestures; release it for menus, dialogue and focus loss. Do not add a recapture button. Attempt native capture on entry and play gestures; use native Pointer Lock (raw input where supported), never hover-look as a substitute. Capture loss/Esc safely pauses; clicking Resume or the game recaptures. Hide the cursor globally while captured. Preserve the Controls opt-out and remapped interaction key.
- Fresh unawakened characters start at the cavern's far end (0, -6), facing toward the connected route to the town exit. Existing awakened saves resume their position. Do not relocate or erase earned progression merely to demonstrate the opening.
- Treat the entire underground dungeon as one location-banner zone (Under-town Caverns). Internal rooms remain map landmarks without additional arrival animations. Town of Beginnings is a separate trigger zone with re-entry hysteresis.
- The stone exit beyond the captain is interactable. The Guild Hall entrance leads into Training Room, and its labelled rear Town Square doorway returns outside using the same interaction binding. Cancel active practice cleanly on exit; never grant trial completion or quest rewards for leaving.

- Preserve dungeon architecture references in References/Dungeon without replacing the established References/HUD styling. Cavern actors, cameras and effects use cavernHeight(z,x); keep the Blender stair ramp and runtime height aligned. Town entry seals the gate; E can reopen it from the town side, and enemies remain underground. Preserve claimed rewards on return.
- Quick supplies default to C (health) and V (stamina), support mouse bindings, and share a five-second cooldown. Permit them between actions in ordinary combat; guided lessons remain restricted.

- Goblin loot is seeded per adventure/creature and committed with defeat claims; never reroll on reload or reward debug kills. Dagger is loot-only, usable from Items, not a fourth starter/rack weapon. Restart is directly visible in the Esc menu with explicit in-game confirmation, retains preferences, and atomically backs up the old adventure.

- Creature loot must match carried equipment or biological materials. Current goblins carry/drop cleavers, with iron and leather equipment scraps; dagger is camp-cache loot. Boar hide is a future field drop, never a Guild practice reward. Source/use descriptions live in Items; crafting is not implemented. Keep rendering and loot linked through `src/data/creatureLoot.ts`, and preserve existing owned items during migration.

## Latest visual reference direction
- The October 6 user references are preserved unchanged in `References/HUD/2026-10-06/`, with a labelled `comparison.html` gallery. Use their pale angled character/skill panes, circular gold navigation, slim stepped HP bar and warm Guild square as the current direction. Retain actual gameplay data rather than copying illustrative skill names or unsupported statistics. See `docs/VISUAL_REFERENCE_PASS.md`.
