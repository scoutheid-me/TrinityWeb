# Trinity Development Instructions

These instructions apply to the Combat Lab and all future work in this repository.

## Game development

- Build an original, real-time, anime action RPG with third-person and optional first-person views. The immediate scope is one playable Combat Lab; prioritize combat feel before world expansion. Do not add multiplayer or copy assets from other games.
- Use TypeScript, Vite, and Babylon.js with WebGPU detection and WebGL fallback. Keep simulation, rendering, input, UI, balance data, and saves separate. Define Combat Arts and enemy attacks through data, with exactly four equipped Art slots.
- Core loop: untimed low-damage basics generate SP. Hold an equipped Art's selection button to charge, then release that same button at its single musical/visual timing event. Perfect gives full damage/Break, Good gives 60%, Miss produces no strike and spends SP. Show the actual Art hit footprint while charging/executing. Stagger creates an opening. Use elapsed milliseconds, explicit legal state transitions, and phase-level hit deduplication.
- Guild challenges must clearly describe the awarded Art before entry and show its name, purpose, cost and usage on completion. Unlocks/mastery come from eligible encounter outcomes, never tutorial/debug telemetry. Keep four unique learned, weapon-compatible equipped slots and migrate saved controls/progress. Starter/training Arts stay simple single-event moves. The old four-part Guild Trial UI is retired; preserve existing earned skills in save migration. Wayfarer’s Oath remains a two-event Art obtainable through eligible field progression.
- Keep UI text compact, with highlighted hover/focus help and expandable details. The first-person personal journal is viewport-mounted and keeps the simulation running; explicit pause and focus-loss safety still pause.
- Preserve the user's original GUI/HUD reference images in `References/HUD/`; consult them for visual direction while building original runtime UI.
- Perfect Parry negates incoming damage, rewards SP/Break and returns weapon-scaled counter damage; a hit during failed parry commitment deals extra damage. Keep counter windows and the failure multiplier in balance data.
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
- Current basic balance: sword 8 single / 6 per victim in groups, 60° fan; rapier 10 single-target / 3 Break; greatsword 12 per victim / 4 Break. Shared Basic Arts always use original weapon base damage.
- GM item tuning belongs to the paused settings overlay. Persist overrides separately from character progression, validate all edits, offer reset/export, and prevent GM encounters from earning progression. Radar charts use fixed documented scales and expose exact values.

- T clears a lone target; freeform attacks use player facing. Creature turning is rate-limited and committed attacks stop tracking. Rear hits deal +20% damage in a 120° rear arc, measured at contact.
