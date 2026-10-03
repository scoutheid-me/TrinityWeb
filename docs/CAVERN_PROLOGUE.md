# Beneath the First Dawn — connected cavern prototype

The opening is free exploration, replacing the previous room-by-room combat tutorial. Create a named male/female character and choose sword, rapier or greatsword. The actual runtime models appear in selection previews. Start in first person, wake through two narrative pages, receive Focused Strike for joining, then accept or decline Find an exit.

The optional quest clearly promises one introductory Skill Book. Decline means no official quest or book reward; chests, exploration and the exit remain available. There are no automatic lesson popups or required Counter/dodge/Art checklists. The Guild Hall is separate practice and remains the only induction that grants Linear.

## Playable route

Stillwater Hollow leads to Lantern Crossing. Branch east through the Broken Aqueduct and goblin encampment, or west through the abandoned cache. Echo Pool connects the branches. The Watcher's Arch leads to the captain's den, daylight stair and a small Town of Beginnings endpoint. All geometry and encounters are loaded once. Movement between these spaces does not reset combat, resources or loot.

Discover chests (30 Col and a health potion), rest lanterns (health/stamina and checkpoint), a provision cache (20 Col per potion), goblin patrols and a captain. Counter gold attacks, dodge red sweeps, and punish committed facing/rear openings. Captain gains a second gold cut below half health. Defeating it removes the final barrier.

Mira's portrait conversation thanks the party for clearing the incursion. A sealed drain and crown-and-three-spears token foreshadow an organized threat outside town. An accepted quest concludes with Pathfinder, Steadfast or Renewal Primer. Each has one small universal Art and one practice-gated node. No free Linear, class, title or overpowered signature skill.

## Implementation and recovery

- `src/world/cavern.ts` defines walkable room/corridor union, patrol placements and chest locations. Export its area/link data to `public/data/cavern-layout.json` before regenerating Blender geometry.
- `src/world/dungeon.ts` coordinates opening, optional quest, interactions, permanent enemy defeats and reward transactions. Messages remain live; story dialogue suspends combat input/time. Focus-loss safety still pauses.
- `src/world/journey.ts` validates journey v2, positions, quest acceptance, one-time claims and Book progression. Old v1 lesson-prologue saves reset to character creation. Legacy saves without journey data retain separate Training Room progress.
- Saved defeated patrol IDs do not respawn on retry. Death restores the last rest position; chests cannot be farmed by dying/reloading. Debug/GM invalidates reward eligibility.
- Personal map shows discovered spaces. Main settings remain separate from the live fantasy menu.

## Assets

Blender 5.2 headless automation produced `connected_cavern.glb`, chest, endpoint and actual-model selection previews. No Blender MCP was exposed in this session, so repository Blender scripts were used. Cavern sources are in `art/blender/`, generators in `Tools/Blender/`.

Goblin Warrior Male 01, King 01, cleaver, crate and sparkle texture derive from the user's local Synty Goblin War Camp / Particle FX packs. Only used runtime derivatives and useful production sources are included. These are Synty assets, not original Trinity models. Imported locomotion had incompatible joint translations; current clips use conservative authored FK on each character's original skeleton to avoid deformation. Combat arm motion is procedural and needs further polish.

Mira portrait is an original generated illustration, created with the built-in imagegen tool (new image, no reference-image edit), saved as `public/assets/characters/mira_portrait.png`. Prompt/design: original adult anime RPG town wayfinder, auburn bob with braid, hazel eyes, ivory shirt, teal short cape, brown satchel, brass sun/compass brooch, holding a folded map; welcoming expression; polished static dialogue portrait, no text, no existing franchise character. The character-creation images instead render the actual game meshes with `render_selection.py`.

The Message/Alert references are archived in `References/HUD/sao-message-window.png` and `sao-alert-window.png`. Runtime panels are original HTML/CSS with translucent content bands, angled viewport placement and blue accept/red decline controls.

## Validation limits

Automated tests exercise real simulation outcomes with staged positions for the long quest route, plus live browser input for creation, interaction and rendering. They do not establish a human 15–20 minute completion time. Cavern geometry, lighting and procedural attack animation remain prototype presentation. The town contains only an introductory endpoint; eastern watch and the wider world are future work.

Next playtest: measure route completion and navigation confusion with new players using all three weapons; tune patrol health and landmarks from observations. Check the captain's two-beat Counter readability, narrow corridor camera behavior, optional-quest refusal expectations and low-end GPU frame time before wider distribution.

Measured exported assets: connected cavern 281,104 bytes / 3,398 triangles; goblin 2,787,532 bytes / 3,986 triangles / 50 joints; captain 2,916,888 bytes / 4,142 triangles / 50 joints. Both contain idle and walk clips. These are asset counts, not a device performance guarantee.

Validation on October 2: 133 unit tests passed; all 34 browser integration scenarios passed (4.9 minutes); the public-build save/import, settings and developer-tool exclusion check passed. The three cavern scenarios also passed after adding focus-loss overlay coverage. Both normal and playtest builds compile successfully. Vite still reports a large JavaScript bundle warning; low-end performance and real-user pacing remain release gates.
