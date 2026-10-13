# Mira town guide (Mina model asset)

The user-supplied Tripo GLB is preserved unchanged at `art/imports/mina/mina_original.glb`. Production names retain `mina` for source continuity; the displayed character is Mira Vale and legacy `mira` quest/save IDs remain unchanged.

`Tools/Blender/rig_mina.py` builds `art/blender/mina_guide.blend` and `public/assets/characters/mina_guide.glb`: 22,723 triangles, 18 textured parts, a 20-bone skin, normalized to 1.72 metres. The authored clips are idle, greet, walk and wave. The 18 materials and 9 MB export remain optimization opportunities.

`src/world/guide.ts` drives a small town patrol, rate-limited facing and an arrival wave. She stops within conversation distance. Animation is simulation-driven and pauses with narrative dialogue. The dialogue uses the original illustrated `mira_portrait.png`, as requested, rather than the rendered model portrait. The rendered portrait remains available as a source artifact.

This is an NPC rig with simple authored animation, not a finished combat character. No lip sync, finger articulation or cloth simulation. Inspect `docs/screenshots/mira-wave-town.png` and `mira-illustrated-dialogue.png` for the actual in-game result.

Blender Lab's live local server was verified on port 9876, including source clip inspection without changing the user's open scene. Repeatable exports use installed Blender 5.2.2 headless. `Tools/Blender/live_blender.py` exposes the local null-terminated JSON execute bridge for repository scripts.
