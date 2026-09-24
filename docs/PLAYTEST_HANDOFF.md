# Trinity combat playtest — 2026-09-23

This package is a combat-only prototype. There is no playable town, dungeon or Skill Book reward yet.

## Running and hosting

Run npm run build:playtest to produce dist-playtest. The release ZIP contains those static files and can be hosted at the root of an HTTPS static site. It has no server/database requirement and makes no runtime CDN requests. Do not double-click index.html: browsers require HTTP(S) for module/asset loading. For a local preview with this repository installed: npm run preview -- --outDir dist-playtest --port 4174. A public hosting URL has not been provisioned by this change.

Supported test target: desktop Edge/Chrome with keyboard and mouse. WebGPU detection falls back to WebGL; append ?webgl to force the fallback. Start on Medium, try Low if needed. Mobile/controller play is not supported yet.

## Ten-minute test

1. Create a character; enter the Training Room. Walk to the entrance orb and press E. Complete the Guild Combat Trial to earn Linear.
2. Walk to the rack and try sword, rapier and greatsword. Greatsword should lead damage and Break; rapier should feel fastest; sword has the best guard and flexible coverage.
3. Repeat Sentinel and Boar fights at the orb. Counter with Q on the resolving chord, dodge red attacks with Space, guard with F. Basics use left-click/J; hold/release equipped Arts with 1–4.
4. Try Linear past an attacking enemy and hit its rear. Tab locks/unlocks; T cycles or releases a lone target. Test both camera views from paused settings.
5. M opens the live personal menu; Esc opens settings outside trials. Losing focus safely pauses. Death permits a retry.
6. In settings, try cue/impact volumes, reduced shake/flash and audio calibration. Calibration's suggested offset includes your tap response; fine-tune it by feel. It does not change hit windows.
7. Download a save backup, reload, then preview/import it. Imports preserve a recovery backup. Save data belongs to the browser and site address; keep an exported backup before clearing browser data or moving hosts.

## Feedback to return

- Build ID (shown in settings), browser, renderer and quality preset.
- Was any attack/counter timing confusing? Which weapon and enemy? Could you explain the hit or miss?
- Did a menu obscure an attack? Did first-person framing or motion feel uncomfortable?
- Did any controls fail or settings/progress disappear after reload?
- Rate responsiveness, readability and weapon distinction from 1–5; describe the worst moment.
- Attach an optional anonymous diagnostics download and screenshot. Export does not upload anything. Do not share your save unless you want to share your character name/progress.

## Known limits

Original rigid-part models and additive motion remain prototype art. Collision uses authored footprints rather than continuous blade-mesh contact. The arena camera does not provide a general dungeon-obstacle solution. Eight-beat audio calibration is an estimate, not a measured hardware-latency benchmark. Headless performance is not a promise of 60 FPS on every PC. Public builds hide GM/debug functionality; local saves are not an anti-cheat boundary.

Maintainer verification commands: npm test; npm run benchmark; npm run test:browser; npm run build:playtest; npm run test:playtest.
