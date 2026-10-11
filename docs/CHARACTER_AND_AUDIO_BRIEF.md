# Character replacement and dungeon audio brief

## Why the current models fall short
The playable prototypes are assembled rigid parts with procedural poses. Mira is a static mesh. More polygons alone will not fix the face, silhouette, clothing deformation or motion. Replace the character and its presentation adapter together, retaining simulation deadlines and weapon grip constraints.

## Recommended: VRoid base, Blender finishing
1. Prepare an original reference sheet: front, side, back and face close-up, neutral A-pose, consistent outfit, flat lighting, no weapon hiding the hands. Pick one hero first.
2. Build the face, hair, body and base clothing in VRoid Studio. It exports VRM and supports editing model/texture appearance: https://vroid.com/en/studio . This is the most direct starting point for Trinity's anime proportions, rather than a guarantee of matching a drawing automatically.
3. Import into Blender through a compatible VRM importer; tailor the coat, boots and armor to the artwork. Rebuild difficult hands/hair rather than accepting broken generated geometry. Convert unsupported toon materials deliberately to the game's rendering setup.
4. Use one skinned humanoid skeleton, proper hand/weapon sockets, deformation weights, idle/walk/run, attacks, Counter, dodge and hit clips. Retarget existing animation only after confirming bone axes and proportions. Keep both greatsword grips solved at runtime.
5. Start with a proposed browser budget of 20–35k triangles for the player, 2k main textures, fewer than 100 bones and limited materials. These are working budgets, not measured guarantees. Export GLB, validate both views and all weapons, and measure frame time before duplicating the workflow for NPCs.

## Other routes
- Image-to-3D: Meshy accepts concept art, can remesh, and offers auto-rigging. https://docs.meshy.ai/en/webapp/image-to-3d and https://help.meshy.ai/en/articles/16231707-how-to-create-3d-animation-with-auto-rigging . Useful for fast candidates; inspect face, separated fingers, hidden back surfaces and deformation. Generated topology is not automatically production-ready.
- Detailed stylized characters: Character Creator provides a character pipeline and Blender integration. https://www.reallusion.com/character-creator/production.html and https://www.reallusion.com/auto-setup/blender/download.html . A stronger option for more realistic proportions, with additional work needed to match anime faces and hair.
- Best control: commission or hand-model a skinned character from the approved turnaround in Blender. Ask for editable sources, textures, a clean rig, animation/export rights, and the same runtime budgets. This has the highest art-direction control but takes more work.

Recommended next asset milestone: one approved hero, checked in close-up and in motion, before replacing every NPC. No new production character or rig was created in this dungeon pass.

## Suno brief — Daylight Beyond the Undergate
Instrumental fantasy JRPG exploration music, 76 BPM. Begin with low warm strings, distant glass bells, airy cavern ambience and sparse piano. Gradually introduce lyrical cello, soft French horns and shimmering strings as the player climbs ancient stone stairs toward daylight. Transition from uneasy D minor toward a hopeful luminous major resolution. A sense of relief, mystery and a much larger world waiting beyond the gate. No vocals, no heavy drums, no sudden impacts, no EDM drop. Leave space for footsteps and combat cues. Original melody. Two to three minutes, gentle opening and loop-friendly sustained ending.

Export an instrumental WAV or high-quality MP3. A quiet exploration loop and a separate 10–15 second arrival swell would allow cleaner adaptive transitions than one long fixed buildup. The current game uses an original sparse synthesized exit chord progression until a produced track is supplied; no external music file has been integrated.
