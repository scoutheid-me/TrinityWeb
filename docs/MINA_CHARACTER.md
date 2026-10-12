# Mina town guide

The user supplied `stylized+fantasy+character+3d+model.glb` on October 12, 2026. Its unchanged source is `art/imports/mina/mina_original.glb`. Metadata identifies Tripo as the generator. No license certificate accompanied the file; retain the user's source/export license record with production asset records.

`Tools/Blender/rig_mina.py` builds `art/blender/mina_guide.blend` and `public/assets/characters/mina_guide.glb`. The source contains 22,723 triangles, 18 textured parts and no skeleton. The derivative retains those surfaces and embedded textures, adds a 20-bone humanoid skin, normalizes height to 1.72 metres, and authors in-place `idle` and `greet` clips. Weights follow the segmented anatomy; shoulder cloth blends into the chest. No geometry decimation was required for this single guide. The 18 materials remain a future atlas optimization opportunity.

The town guide uses simulation-driven animation sampling and a rate-limited turn toward nearby players. Greeting plays once per proximity entry. Dialogue uses a matching transparent 700×1000 render produced by `Tools/Blender/render_mina.py`. Displayed name is Mina Vale; legacy `mira` save/contact/interaction IDs are retained so existing quest progress survives.

This is a rigged stationary NPC presentation, not a player combat rig. There is no lip sync, finger animation, cloth simulation, or validated walking/combat library yet. The old static guide and portrait remain in source history/assets for reference. Do not regenerate the old `build_mira.py` asset expecting it to update Mina.

Blender MCP was not exposed; installed Blender 5.2 headless automation completed import, rigging, export and portrait rendering. Browser checks load the skin and both clips inside the town scene; screenshots are `docs/screenshots/mina-town-idle.png` and `mina-town-greeting.png`. Core combat regression: 157 tests pass. Further browser/release results are reported with deployment.

Release validation: four targeted browser checks passed (town skin/clip load and screenshots; cavern opening/save; both quest reward outcomes), plus two public-build hosting checks. Pages build and TypeScript check passed. Export is 9.25 MB; production source is 8.63 MB. Existing bundle-size warning remains.
