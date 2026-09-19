# Trinity Development Instructions

These instructions apply to the Combat Lab and all future work in this repository.

## Game development

- Build an original, real-time, third-person anime action RPG. The immediate scope is one playable Combat Lab; prioritize combat feel before world expansion. Do not add multiplayer or copy assets from other games.
- Use TypeScript, Vite, and Babylon.js with WebGPU detection and WebGL fallback. Keep simulation, rendering, input, UI, balance data, and saves separate. Define Combat Arts and enemy attacks through data, with exactly four equipped Art slots.
- Core loop: untimed low-damage basics generate SP, multi-input Arts spend SP and build Break, stagger creates an opening. Use elapsed milliseconds, explicit legal state transitions, and phase-level hit deduplication.
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
