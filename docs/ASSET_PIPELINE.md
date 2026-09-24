# Trinity 3D Asset Pipeline

Blender and Blender MCP are approved parts of Trinity's normal development toolchain. This workflow applies to the Combat Lab and future 3D development.

## Tool discovery and operation

For relevant 3D work, inspect available tool/MCP integrations and check whether the Blender server is available. Use the connection directly when appropriate, including asset creation, editing, export, and file placement. Do not delegate automatable steps to the user. Only request manual Blender startup when the installed integration technically requires it and no available automated startup path can perform it.

If the connection fails, inspect its state and attempt reasonable available recovery. The repository also contains headless Blender automation in `Tools/Blender/`; consult its README and launcher before using it. Its existing smoke test creates a sphere and render, not a game-ready asset or evidence of a working MCP connection. Use automated Blender workflows where appropriate. If blocked, keep gameplay moving with an explicitly temporary placeholder and record the missing asset, blocker, and replacement work. Revisit it when Blender becomes available.

## Workflow

Design → Blender model → UVs → materials → rig/animation as needed → collision as needed → LOD/optimization → GLB export → runtime asset directory → game import → run Trinity → inspect → iterate.

1. Establish purpose, dimensions, pivot, gameplay interactions, and an appropriate performance budget.
2. Create or modify the asset in Blender. Preserve a useful editable `.blend` source.
3. Apply the shared conventions below and validate geometry, materials, rigs, and animations as applicable.
4. Export a game-ready GLB (or glTF with all required resources) directly into the runtime asset structure.
5. Load it in the running game, inspect it under actual game lighting, test gameplay interactions, and inspect browser performance.
6. Fix issues in Blender or game code as appropriate, re-export, and repeat. Looking correct in Blender alone does not establish completion. If the game cannot run yet, explicitly record in-game validation as pending.

## Asset locations

| Content | Default location |
| --- | --- |
| Characters and armor/equipment | `public/assets/characters/` |
| Enemies | `public/assets/enemies/` |
| Weapons | `public/assets/weapons/` |
| Architecture, environment, and terrain | `public/assets/environments/` |
| Props | `public/assets/props/` |
| Shared animations | `public/assets/animations/` |
| Textures | `public/assets/textures/` |
| Material resources | `public/assets/materials/` |
| Editable Blender sources | `art/blender/` |
| Reusable Blender scripts/workflows | `Tools/Blender/` |

Use the game's actual runtime asset structure if it differs, and update this document accordingly. Do not scatter production assets around the repository. `Assets/Test/` and `Renders/Test/` currently hold automation smoke-test outputs. Keep important production sources tracked; ignore Blender backups and temporary files.

## Initial shared conventions

The Combat Lab now uses a right-handed Babylon scene with +Y up and +Z character forward. The generated GLBs have been loaded and visually inspected in the running game. These defaults apply to new assets; skeleton, socket, and LOD conventions remain initial contracts until skinned production assets are introduced.

| Area | Convention |
| --- | --- |
| World scale | One runtime unit represents one meter. Author Blender scenes in metric units with unit scale 1.0. Validate against a one-meter reference. |
| Axes | Blender source uses +Z up and -Y forward; intended glTF/runtime convention is +Y up and +Z forward. Use exporter axis conversion and verify with an asymmetric forward marker in-game. |
| Transforms | Apply appropriate mesh rotation/scale before rigging/export; avoid negative/nonuniform scales. Preserve rig bind transforms and verify animations after any transform change. |
| Asset/file naming | Stable descriptive snake_case identifiers, such as `training_sword.glb`. Match source and exported asset identifiers. |
| Mesh naming | `<asset>_mesh`; use descriptive part suffixes and `<asset>_lod0`, `_lod1`, etc. for LODs. Avoid default or duplicate object names. |
| Materials | `<asset>_mat_<surface>` or `shared_mat_<surface>`; reuse compatible materials. Texture names identify asset and channel. |
| Skeletons | A clearly named `root` bone with stable hierarchy and unique bone names; consistent `left_`/`right_` prefixes. Reuse a shared skeleton for compatible characters; document the actual hierarchy when introduced. |
| Animation | Descriptive clips such as `idle`, `walk`, `run`, `attack_01`, `hit`, and `death`. Export only intended clips and explicitly document loop status, sampling, and root-motion policy. Default locomotion to in-place until the game defines root motion. |
| Attachments/sockets | Named attachment nodes such as `socket_weapon_right`, parented to the intended bone. Define their local basis consistently; verify with a reference weapon. |
| Weapon origins | Place origin at the grip/attachment point. Initial sword convention: blade length follows local forward (+Z after export), with local +Y defining its up direction. Validate grip alignment against the shared socket contract. |
| Export | Prefer GLB with required textures included, standard glTF-compatible PBR materials, and only intended asset objects. Exclude staging cameras/lights/debug meshes. Preserve required skinning and named animation clips; verify exporter settings in the installed Blender version. |
| Collision | Use separately named simplified meshes (`<asset>_col`, with suffixes for multiple shapes). Choose primitive/convex shapes where appropriate. Wire them explicitly into the game's physics importer; names alone do not create collision. |
| LOD | LOD0 is highest detail, followed by reduced LOD1/LOD2 as valuable. Preserve pivots, alignment, and material compatibility. Record actual switching distances and loading behavior once supported by the game. |

Record reusable export settings in repository scripts when practical. Fix shared export problems in the pipeline instead of adding independent scale/orientation patches to every imported asset. Use runtime transformations when they serve a deliberate gameplay or attachment purpose.

## Game-ready validation

Before calling an asset finished, verify:

- Correct scale, orientation, appropriately applied transforms, and sensible origin/pivot.
- Clean topology for its purpose, reasonable polygon count, correct normals, no accidental duplicates, and no unnecessary hidden geometry.
- Required UVs, resolving materials/textures, no missing resources, and no unsupported material setup.
- Correct skeleton, animation clips, and weapon/socket attachment where relevant.
- Working collision and gameplay interactions.
- Successful exported GLB/glTF load in Trinity, correct appearance in actual game lighting, and acceptable browser performance.

For important assets, record source/export paths, relevant settings, validation performed, and unresolved issues with the task or asset documentation. Do not describe an asset as validated when a check remains pending.

## Browser performance and automation

Use sensible polygon/bone counts and animation tracks, reusable materials, texture atlases where useful, simplified collision, and LODs where valuable. Use production texture compression and mesh compression when supported by the runtime loader; verify decoder support and loading cost. Establish measured budgets as the game takes shape. Film-production complexity is not an appropriate default for a browser game.

Store reusable Trinity-specific automation in `Tools/Blender/` for export configuration, GLB/batch export, LOD generation, object naming, transform/material cleanup, collision generation, and asset validation. Prefer repeatable operations over correcting the same issue manually on each asset.

## Prototypes and Combat Lab priorities

Temporary runtime geometry is acceptable for testing mechanics, collision, movement, level layouts, combat ranges, architecture, and debug objects. Label placeholders and track intended replacements. Evaluate proper Blender assets once objects become part of the intended visual presentation.

Build core combat first. Then improve the Combat Lab with practical reusable assets: room architecture, walls, floors, columns, stairs, arches, racks, dummies, banners, targets, platforms, swords, player equipment, training constructs, and breakable/test props. Do not spend days polishing art before combat works.

Use Blender for actual production assets when sensible: a first sword, reusable dungeon doorway or pillars, a useful training automaton, model optimization, and LOD creation. Create collision in Blender and/or the engine as appropriate. Repair export orientation at its source unless a runtime transform is genuinely preferable.

## Combat Lab implementation and validation

No Blender MCP tool was exposed during this implementation. The installed Blender 5.2.2 executable was run headlessly through `Tools/Blender/build_lab.py`, with no manual Blender operation required. The existing smoke-test files were preserved.

The script creates five original assets: `wayfarer`, `aether_sentinel`, `aether_sword`, `guild_column`, and `weapon_rack`. Editable sources are in `art/blender/`; GLBs export directly to their runtime categories. Authoring helpers map runtime `(x,y,z)` to Blender `(x,-z,y)`, with the exporter doing its standard Y-up conversion. The sword origin is the grip and its blade points along local +Z after export. All colors are embedded glTF-compatible material values, with no external texture files.

Characters currently use named rigid `left_arm`, `right_arm`, `left_leg`, and `right_leg` pivot nodes. These are articulated prototype assets, not production skeletons. The renderer attaches a sword to the right-arm pivot at the shared grip offset and poses those nodes during movement/attacks. Replace this presentation adapter with proper skinned animation assets during combat polish; no authored animation clips or LODs are claimed.

The arena shell, banners, inlays, distant scenery, and VFX remain explicitly temporary runtime geometry. The flat arena uses analytic boundary/body collision and combat hit volumes; there are no exported collision meshes yet. These are deliberate gameplay-prototype choices to revisit when the environment/physics becomes more complex.

Verification: all five GLBs load in WebGPU and WebGL browser tests, with no fallback assets; screenshots were inspected for material resolution, orientation, relative scale, sword attachment, shadowing, and arena presentation. Movement, attacks, and interaction run against the loaded scene. See `docs/STATUS.md` for the current measured performance and remaining quality limitations.

## Authored prototype duel motion

`Tools/Blender/build_duel_motion.py` opens the existing character sources, authors right-arm pitch/yaw actions with explicit start/contact/end markers, and saves separate `art/blender/{aether_sentinel,wayfarer}_combat.blend` files. The existing GLB geometry is retained. The exporter samples Blender curves at 60 Hz into `public/assets/animations/duel_motion.json`; the runtime interpolates those samples using simulation time. This compact adapter is for the current rigid-part pivots, not a skinned animation solution. Frame 36 is contact and frame 54 is clip end; runtime anticipation stretches to each attack deadline and follow-through remains 300 ms. Blender X/Z become runtime X/Y. Keep this mapping explicit when replacing the pivots with a production rig.

Run: `& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --background --factory-startup --python-exit-code 1 --python Tools/Blender/build_duel_motion.py`. Blender MCP was not exposed during this pass; installed Blender 5.2.2 generated the editable sources and sampled curves successfully. Its thumbnail cache reported a write warning; the actual source saves and curve export succeeded.

## September 20 training armory

The rack is intentionally limited to one-handed sword, rapier and two-handed sword. Original low-poly sources are `art/blender/training_{sword,rapier,greatsword}.blend`; runtime exports are under `public/assets/weapons/`. Rebuild using Blender in background mode with `Tools/Blender/build_armory.py`. All three use a shared grip origin and are loaded by the existing Babylon asset loader. First-person presentation reuses these meshes; dedicated hands and weapon-specific grips remain prototype work.

For interactive Blender access, see [BLENDER_MCP_SETUP.md](BLENDER_MCP_SETUP.md). The headless exporter was used for this pass because no Blender MCP tools were connected.

## Articulated two-handed grip

`Tools/Blender/articulated_arms.py` defines the Wayfarer's shoulder/elbow hierarchy (two 0.32 m segments). `build_player_arms.py` upgrades only the player source and GLB; `build_lab.py` also uses the shared hierarchy for full rebuilds. `twoHandGrip.ts` solves both hands to separate greatsword grip points every pose update. The weapon drives the shared swing, and both arms follow it; first-person arm clones use the same exported geometry. This remains a rigid-part prototype rig, not a skinned production character. Blender MCP was not exposed in this session, so regeneration used the installed headless Blender executable.

## Greatsword edge orientation

The training blade's broad axis is local X, thickness is Y and length is Z. A 90-degree local-Z roll aligns its cutting edge to the runtime vertical swing plane. greatswordMotion.ts samples the simulation deadline, including impact hold, while scene.ts composes the orientation in each perspective. Runtime transforms are intentional: no mesh export change is needed. Blender MCP tool discovery returned no exposed tools for this pass; the existing Blender-authored meshes and articulated elbows are retained.

## Woman character prototype

Tools/Blender/build_woman.py derives wayfarer_woman.blend / wayfarer_woman.glb from the articulated Wayfarer source, preserving shoulder/elbow/hand hierarchy, scale, clothing and grip sockets. It adds a tied-back hairstyle and a slightly adjusted head silhouette; both character choices share combat stats and the prototype rigid-part animation system. The variant contains 3,268 polygons. No Blender MCP tools were exposed for this pass, so the installed Blender 5.2 headless exporter was used. Export succeeded; a nonfatal Blender thumbnail-cache write warning did not affect the saved blend or GLB. The in-game model and two-handed hold were visually inspected.

## Woodland Boar

Tools/Blender/build_boar.py generates art/blender/woodland_boar.blend and public/assets/enemies/woodland_boar.glb. The original 2,248-polygon prototype uses shared axis/scale/material helpers, four rigid leg pivots, tusks and bristles. Runtime hides the humanoid weapon attachment and uses quadruped stride/body anticipation. No MCP tool was exposed; Blender 5.2 headless export succeeded. The model was inspected under in-game lighting with resolved materials and no asset errors. The entrance orb/pedestal remains temporary runtime geometry.

The rack now hides its generic practice_blade/practice_guard meshes and displays the three existing Blender-authored training weapon GLBs at their grip origins. This reuses the shared armory source assets without a new mesh export. No Blender MCP tools were exposed for this pass. Runtime diagonal greatsword sweep retains edge roll and both hand constraints; collision remains an authored attack footprint rather than an exact swept-blade volume.

## September 23 body-motion pass

Blender MCP tools were not exposed. Blender 5.2.2 headless successfully generated art/blender/body_motion.blend and public/assets/animations/body_motion.json using Tools/Blender/build_body_motion.py. The source has named start/contact markers and sampled 60 Hz additive body curves for Sentinel, Boar jab/sweep, Counter, dodge, hit and Break. Runtime bodyPhase maps simulation contact/recovery to the authored marker, preserving authoritative ground position and paired grips. Enemy feet now stop cycling during stationary turns. These improve the existing rigid-part prototype; they are not a new skinned character rig or final production animation library. Blender reported user-preference/thumbnail cache permission warnings, but the source and runtime curve exports succeeded.
