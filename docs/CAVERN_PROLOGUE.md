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

Goblin Warrior Male 01, King 01, cleaver, crate and sparkle texture derive from the user's local Synty Goblin War Camp / Particle FX packs. Only used runtime derivatives and useful production sources are included. These are Synty assets, not original Trinity models. Imported locomotion has incompatible joint translations; the October 3 exporter retargets joint directions while preserving original bind offsets. Walking/idle derive from the supplied locomotion; overhead/sweep attacks are original baked clips. Further transition and foot-contact polish remains.

Mira portrait is an original generated illustration, created with the built-in imagegen tool (new image, no reference-image edit), saved as `public/assets/characters/mira_portrait.png`. Prompt/design: original adult anime RPG town wayfinder, auburn bob with braid, hazel eyes, ivory shirt, teal short cape, brown satchel, brass sun/compass brooch, holding a folded map; welcoming expression; polished static dialogue portrait, no text, no existing franchise character. The character-creation images instead render the actual game meshes with `render_selection.py`.

The Message/Alert references are archived in `References/HUD/sao-message-window.png` and `sao-alert-window.png`. Runtime panels are original HTML/CSS with translucent content bands, angled viewport placement and blue accept/red decline controls.

## Validation limits

Automated tests exercise real simulation outcomes with staged positions for the long quest route, plus live browser input for creation, interaction and rendering. They do not establish a human 15–20 minute completion time. Cavern geometry, lighting and character animation remain prototype presentation. The town contains only an introductory endpoint; eastern watch and the wider world are future work.

Next playtest: measure route completion and navigation confusion with new players using all three weapons; tune patrol health and landmarks from observations. Check the captain's two-beat Counter readability, narrow corridor camera behavior, optional-quest refusal expectations and low-end GPU frame time before wider distribution.

Measured exported assets: connected cavern 281,104 bytes / 3,398 triangles; goblin 2,787,532 bytes / 3,986 triangles / 50 joints; captain 2,916,888 bytes / 4,142 triangles / 50 joints. These October 2 exports contained idle and walk clips; October 3 adds overhead and sweep clips. These are asset counts, not a device performance guarantee.

Validation on October 2: 133 unit tests passed; all 34 browser integration scenarios passed (4.9 minutes); the public-build save/import, settings and developer-tool exclusion check passed. The three cavern scenarios also passed after adding focus-loss overlay coverage. Both normal and playtest builds compile successfully. Vite still reports a large JavaScript bundle warning; low-end performance and real-user pacing remain release gates.

## October 3 controls, goblin motion, and town arrival

- Mouse look captures on the click that finishes entry or resumes play. Browsers require a user gesture, so a returning player may need one click in the scene. Focus loss releases capture and pauses safely. Clicking Resume explicitly reacquires it; native capture is required for free mouse look, with no recapture button. M releases the cursor for the live personal menu; closing it requests capture again. Esc releases the cursor; capture loss safely pauses even in combat. Controls includes a persistent opt-out for right-drag look.
- Synty Polygon idle/walk clips are retargeted by joint directions without copying incompatible bone translations. Original overhead and sweeping attack clips use the War Camp bind rig. Each attack's contact time samples the same normalized authored contact frame, including the captain's second strike. These are prototype animations, not a mocap-quality combat library.
- `Tools/Blender/build_town.py` exports a stone corridor/portal, rising stone slab, and an original half-timber town square with a slate-roof Guild Hall and indigo banners. Production Blender sources are retained. The square remains a small endpoint, not a full town.
- E opens the final stone door after the captain is defeated. Collision stays closed during its initial lift; the opened state persists. The Guild Hall entrance leads to the existing Training Room. The labelled Town Square doorway at the rear of the Training Room returns to the square with E (or the rebound interaction key); leaving cancels an active lesson cleanly.
- `src/world/regions.ts` defines the door plane and hysteresis-based region entry zones. The entire dungeon is one Under-town Caverns zone; the town square is the other. Crossing their boundary shows a five-second location banner; internal rooms do not retrigger it. Reduced-motion preference uses a fade without sliding. References/HUD/town-location-banner.png preserves the supplied visual direction.
- Regression coverage: default pointer capture and menu release, retargeted clip loading, stone-door interaction, town arrival/expiry, Guild entry, optional quest acceptance and decline, treasure/save, plus pure collision/region/migration checks. Duration and human combat-readability still require playtesting.

Fresh, unawakened characters always begin at (0, -6) facing down the connected cavern route toward its far-end daylight exit. Existing awakened saves resume their position. The direct practice shortcut is hidden during the unfinished prologue, preventing accidental bypass of the dungeon.

October 3 validation: 136 unit tests pass. The full 35-scenario browser suite passed before the focus/return-door follow-up; its eight affected arrival, cavern, onboarding and room scenarios passed again after those changes. The final arrival scenario also checks walking through the opened exit and returning from Training Room. Hosted-path production smoke test passes. Blender renders and in-game wind-up/contact/arrival images were inspected. These checks do not establish final animation quality or human route duration.

## Mouse look and quick supplies

Gameplay attempts browser pointer capture on entry and play gestures. If browser policy denies it, click the game to request native lock. Cursor hover never rotates the view. Escape and live menus release look. Native capture still requires browser permission/user activation; no recapture button is shown. Focus loss retains safety pause.

C uses a health potion; V uses a stamina draught. Both actions support keyboard, standard mouse buttons and side buttons through Controls. Older custom mappings are preserved; if C/V is already occupied, the new action remains unbound rather than stealing the key. Quick-supply HUD buttons and inventory use the same simulation method. Supplies work with living enemies (including distant cavern patrols), between actions; they share a five-second cooldown. Full/dead/busy/empty/lesson failures do not consume stock. Counts persist immediately after use.

Validation: 139 unit tests; browser coverage checks captured mouse look, menu/escape release, focus/resume, default potion keys, clickable supplies, mouse remapping, saved stock/bindings, and the existing inventory flow.

## October 4: stone passage and gate pass

Preserved new architecture references in `References/Dungeon/`. Existing HP/SP silhouettes and pale, angled Message/Alert panels retain the earlier HUD references. Chamber centers and encounter IDs stay stable for saves; smaller chambers expose longer connecting corridors. Original Blender architecture adds dressed columns, segmented arches, paving and blue emissive braziers. The final passage climbs three metres using stair treads and a continuous ground-height ramp; actors, camera, footprints, props and damage text follow the same elevation. Town remains at height zero.

The town gate seals on arrival. Approach its town side and press the saved Interact key (E by default) to reopen the cavern route. Returning preserves chest claims, defeated enemies and rewards. Monsters are confined to the underground side even while the player opens the gate. The Guild Hall remains the repeatable formal combat-training destination; revisiting the cavern does not reset its quest or duplicate its rewards.

This is stylized prototype architecture, not a claim of matching the reference render fidelity. Current blue flames are emissive authored geometry. Duration still needs human playtesting.

Validation: 142 unit tests; seven browser scenarios cover onboarding, quest acceptance/decline, supplies, focus/camera recovery, gate return and Guild Hall exit. Arrival rechecked after geometry corrections. The cavern export is 25,774 triangles, eight materials and approximately 2.1 MiB including embedded original masonry texture. Hosted-path production smoke test passes.

## Linear expedition and loot revision

Main route: Stillwater Hollow (wake, supplies) → Lantern Crossing (one sentry opens a portcullis) → Echo Pool (quiet recovery supplies) → Watcher’s Arch (one slow, powerful brute) → Undergate Den (captain alone) → Daylight Stair (last supplies) → Town.

Optional branches: Lantern Crossing → Abandoned Cache (health supply shelves and provision shop); Echo Pool → Goblin Encampment (two fast skirmishers, canvas shelters and guaranteed dagger stash) → Broken Aqueduct (one skirmisher, Col and stamina treasure). Stable room centers/IDs preserve saved progress; returning players are projected onto the updated walkable layout. Room-bound enemies cannot join another encounter, especially the solo boss.

Each eligible goblin awards 4–11 Col and can drop its carried cleaver (18%), iron fragments from damaged equipment (55%), or worn leather scraps (40%). Captain guarantees 60 Col, its cleaver and its story token. Potions and the dagger come from supply caches, not unrelated monster rolls. Wild-boar hide is defined for future eligible field encounters; the current Guild practice boar cannot award it. Drops auto-collect into Items. Creature/adventure seeded rolls, defeat deduplication and validated inventory prevent rerolls or duplicated rewards. Debug encounters remain ineligible. The dagger has a new original Blender model, 7 base damage, 1 Break and 1.7 m single-target range; starter/rack choices remain sword, rapier and greatsword. Starting weapon can be re-equipped from Items.

Mouse input now uses actual Pointer Lock deltas with unadjusted movement when supported. The previous hover fallback was removed because it allowed HUD cursor flashes and screen-edge stops. Native lock hides the cursor globally. Esc/unexpected capture loss pauses safely, menus intentionally release it, and the recapture click does not attack. Browser gesture requirements remain: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API.

Restart is an explicit two-step option in paused save settings. It replaces progression with a fresh adventure, retains preferences, and backs up the old save in the same IndexedDB transaction. The normal save queue is suspended before replacement; character creation again offers man/woman, name, and the three weapon choices.

Validation for this revision: 149 unit tests passed. The 39-scenario browser suite exposed two drag-control regressions and an obsolete three-total-weapons assertion; those were corrected and passed targeted reruns, along with native capture, focus recovery, potions, loot equipment, restart/recovery backup and room visuals. TypeScript checks pass. Rendered creation, camp, aqueduct, shrine and solo-captain scenes were inspected. Visual fidelity and encounter pacing remain prototype work, not an AAA-quality claim.

October 5 loot follow-up: shared creature equipment data now supplies both the goblin weapon model and drop identity. Items lists recovered weapons and expandable material source/use descriptions. Crafting remains unimplemented. Legacy dagger ownership is preserved; missing new inventory fields migrate to zero. The carried Synty cleaver has a separate normalized player-socket export using the same mesh/atlas. 150 unit tests pass, with browser loot/equip/material/restart and native-capture checks passing.

Release checks: public Pages build and project-path browser smoke test passed after updating the downloadable bank checks for three starter weapons plus two recovered weapons. The four affected expedition/training browser scenarios pass (the bank-count assertion was updated and rerun).
