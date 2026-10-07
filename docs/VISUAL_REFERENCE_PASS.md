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
