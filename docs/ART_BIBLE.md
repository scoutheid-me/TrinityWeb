# Art direction

Original identity: ivory stone, deep blue slate, champagne brass, and pale cyan aether. The Aether Hall is an elevated guild arena surrounded by columns, restrained banners, and distant floating spires. UI uses original floating pale-glass panels, thin light borders, condensed sans-serif labels, angular green HP bars, and gold interaction accents, informed by the user-supplied SAO visual references. Player resources sit upper-left, target information upper-right, and four compact Art slots bottom-center. Keep the center clear for sword motion and attack footprints.

The Wayfarer wears a pale coat and dark equipment, with cyan blade details. The Aether Sentinel uses a dark armored silhouette, brass trim, luminous core, and cyan visor. Gold telegraphs communicate parryable attacks; red communicates the sweep that should be dodged.

All prototype models are generated in Blender from repository-owned procedural source and exported to GLB. Their simple rigid parts are placeholders for future expressive, skinned anime characters. Do not mistake the current rounded shapes for the final art target. The arena shell, banners, inlays, motes, and scenery remain temporary runtime geometry.

Production direction: expressive faces and eyes, layered hair/clothing, readable sword silhouettes, good deformation, stylized PBR with controlled face lighting, soft shadow bands and restrained rim light. Ground the architecture/materials more physically than the characters. Avoid film-level mesh complexity or using bloom to hide weak art.

Next visual priority should support combat readability: authored anticipation, slashes, defensive poses, and reactions. Character polish and the wider fantasy world follow that work. No copied franchise assets, music, names, or recognizable locations.

Pause, controls, tutorials and Lab tools share the light-panel theme. Persistent instructions and performance telemetry are hidden from normal combat; the tutorial and Lab tools retain access. Menu entries must operate real features. Do not add decorative party/map/equipment controls before those systems exist. The reference atlas is not shipped as a game asset.

## Personal artifact and status window

Use the archived September 20 references for the slim stepped status ribbon and pale personal menu. HP is green, SP cyan, stamina muted gold in one attached window. M opens the original vector equipment silhouette, socket inspection and circular rail. Hover/focus Character to branch into Equipment and Combat Arts; other icons expose captions and open their functional panels. First-person windows use perspective styling and translucency while staying attached to the viewport, and continue movement/camera input. They are DOM overlays, not world-occluded 3D meshes. Armor remains cosmetic; the weapon name and damage/reach read the actual equipped data.
