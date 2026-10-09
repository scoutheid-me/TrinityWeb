# October 6 visual reference pass

Exact user references: [reference gallery](../References/HUD/2026-10-06/comparison.html). The two PNGs are preserved unchanged, with their source attachment names in that folder's README.

Implemented original runtime presentation:
- Slim stepped green HP silhouette, integrated blue SP and gold stamina, translucent status frame.
- Angled pale character pane, actual resources and attributes, five equipment and five quick-item slots.
- Central circular navigation with gold selection; learned skills displayed beside selected details and four equip slots. Filters distinguish shared Basic Arts from restricted Combat Arts.
- Original SVG skill and navigation symbols; no unsupported levels, XP or reference-only skills were added.
- Blender town facade pass: stone arches/courses, burgundy Guild banners, lanterns, planted trees, benches and perimeter curbs. Warm town fill replaces underground blue fill; connected dungeon lighting is retained.

Validation: 150 core tests; browser checks for skill assignment, desktop/compact layouts, character menu, town traversal and hosted asset paths. Actual screenshots are in `docs/screenshots/reference-menu-town.png`, `reference-menu-compact.png`, and `reference-town.png`.

Limits: town and characters remain stylized prototype geometry, not the richly textured environment shown in the supplied concept images. Skill details scroll to expose full numerical data. The first-person journal remains live and viewport-mounted; technical settings still pause.

## October 7 cleanup
- Fixed journal SP fill inheriting absolute HUD positioning by using journal-specific class names. Regression checks exercise 1, 54 and 100 SP, not only the zero-SP start state.
- Right-hand lists use content height with a 440px cap on width; selecting a skill opens its larger detail/equip pane. Overflow remains scrollable.
- Focus/capture loss safely freezes simulation and shows only a compact resume prompt; full Settings remain explicitly opened.
- Removed persistent top-of-screen room labels and floating cavern direction text. Region arrival banners remain. Map landmarks and physical Guild/exit signs remain available.
- User bug screenshot preserved in References/HUD/2026-10-07. Verified desktop/compact screenshots, skill equip, focus pause, dungeon/town traversal and public build.

## October 9 environment and presentation pass

Original assets were rebuilt in installed Blender 5.2.2 using the repository pipeline; no Blender MCP tools were exposed. Town now has metre-scaled original albedo/normal textures for stone, paving, slate and timber, bevelled architectural edges, tower windows, door planks, cloth folds, climbing plants and layered garden crowns. Production sources and deterministic builders are retained. The town GLB is 5.5 MB; textures are embedded and also saved for editing.

Rendering now uses a player-centred 2048px sun shadow map, half-resolution 8-sample contact shading on medium/high when supported, and a small original generated reflection probe. Low quality omits contact shading and shadows. Dungeon/town light intensity changes preserve dark underground areas and warm daylight outside.

Combat avatars retain all shoulder/elbow/grip pivots, with grounded clothing colours and facial details replacing glowing cores/eyes. Mira has a separate original static guide model, merged to nine materials; the placeholder cylinder around her legs is hidden. First-person one-handed weapons now use the existing articulated right arm. Selection portraits were regenerated from the actual player assets. Menu symbols gain light gradients and finer framing; compact list behaviour is preserved.

Validation:
- 150 core tests pass; public build and two production browser checks pass locally.
- Scene screenshots inspected at desktop and compact sizes; nonzero journal resources, selection/equip, safety pause and arrival/return route checked.
- Both greatsword hands retain sub-centimetre contact throughout attack cycles in both views.
- 1920x1080 high-quality WebGPU training benchmark: mean 15.10 ms, p95 16.60 ms, approximately 66.2 FPS over 149 sampled frames. This is local headless Edge, not a cross-device performance guarantee.
- Final medium-quality WebGL town snapshot: 120 FPS, 41 active meshes, 140 draw calls. Runtime scene includes 295,070 total vertices, including preloaded inactive areas. See saved metrics JSON files.

Honest visual assessment: noticeably more detailed and coherent, but not a 9/10 match to the supplied high-detail concept artwork. Character topology/animation, foliage, architectural variety, sky/backdrop and bespoke painted surface art remain the main gaps. Mira is static, not a newly rigged/animated character. No new world content or cinematic-quality assets are claimed.
