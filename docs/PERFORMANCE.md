# Performance

Target: desktop 1080p, 60 FPS; prototype minimum 45 FPS. Measurements must identify backend, viewport, quality, and test conditions. The browser HUD exposes FPS, frame time, active meshes, and draw calls; the debug panel includes total vertices.

Quality presets currently control render scale, shadows, FXAA, glow, and spark count. Low uses 1.6 hardware scaling and disables shadows/glow/FXAA; Medium uses 1.2 scaling and shadows; High uses 1.0. These are coherent prototype presets, not automatic hardware benchmarking.

GLBs have no external texture dependencies. Current sources use flat PBR material colors and small meshes. KTX2/Basis, mesh compression, LOD switching, baked environment lighting, instancing, and world streaming are not implemented because this room does not yet need their asset complexity. WebGPU shader compiler scripts/WASM are bundled from the installed Babylon package, and typography uses system fallbacks. Runtime startup does not require a CDN or remote fonts.

The initial broad Babylon import produces a large bundle. Replace it with focused imports and profile startup before expanding content. Repeated column/material draw calls are another optimization opportunity. Avoid presenting desktop development measurements as guarantees on all hardware.

Repeatable browser checks write a screenshot and performance snapshot to ignored `test-results/`. See `docs/STATUS.md` for the verified result of this iteration. Multiple-enemy debug spawning is capped at five to prevent accidental unbounded test scenes.
