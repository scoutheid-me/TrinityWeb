**[Play the latest Trinity](https://scoutheid-me.github.io/TrinityWeb/)**

Updates publish automatically after tests pass on main. See [hosting instructions](docs/HOSTING.md).

# Trinity — Beneath the First Dawn

An original single-player anime action RPG prototype. Create a character and explore the connected under-town cavern, fight goblins and their captain, discover treasure, and reach the Town of Beginnings. Accepting the optional exit quest awards a choice of introductory Skill Book. Formal combat lessons and Linear remain in the Guild Hall's separate Training Room.

## Play and controls

The mouse is captured during play. Move it to look without holding a button. **M** opens the live personal menu and releases the cursor. **Esc** releases the mouse and opens settings where allowed; click the scene to recapture if the browser requires it. Capture can be disabled in Controls. Lock-on still faces the target unless disabled in settings.

| Input | Action |
| --- | --- |
| WASD / Shift | Move / sprint |
| E | Interact with nearby chest, door, rack, orb or NPC |
| Left mouse or J | Untimed basic attack; generates SP |
| Hold/release 1–4 | Charge and release an equipped Art |
| Q / F | Counter / hold Guard |
| Space + movement | Dodge |
| Tab / T | Lock / switch or clear a lone target |
| M | Live personal menu, inventory and Arts |
| Esc | Settings outside combat; release cursor |
| R | Retry after defeat (development builds also reset) |

All gameplay bindings are editable in paused settings. New characters receive Focused Strike on joining. Perfect Art timing gives full effect, Good gives 60%, and Miss spends SP without a strike. Perfect Counter negates damage, returns weapon-scaled damage and grants SP/Break; failed Counter commitment increases damage taken. Greatsword leads damage and Break, rapier prioritizes fast single-target combat, and sword is versatile.

The stone door beyond the captain leads into a small town square. Interact with the Guild Hall entrance for training. The Town Square doorway at the back of the Training Room returns you outside using E. The wider town and eastern watch are not yet implemented; the intended 15–20 minute route still needs human pacing tests.

## Run locally

With Node.js and npm installed:

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Add ?webgl to test the WebGL fallback. No account or backend is required. Character progression, controls, treasure, quest choice and journey position save locally in the browser. Export/import your save in settings when moving between localhost and the permanent site.

```powershell
npm test
npm run test:browser
npm run build:pages
npm run test:pages
```

Local browser tests use Microsoft Edge; CI uses Chromium. Development-only window.trinity allows repeatable simulation checks and is omitted from the hosted playtest build. See [cavern implementation and validation limits](docs/CAVERN_PROLOGUE.md).

## Assets and scope

Original Blender-generated GLBs and editable `.blend` sources are included. Rebuild them with:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python-exit-code 1 --python Tools/Blender/build_lab.py
```

The player and enemy are articulated prototype models with procedural poses, not production anime characters or skinned animation assets. The arena shell and distant scenery remain procedural prototype geometry. See [asset conventions](docs/ASSET_PIPELINE.md) and [verification status](docs/STATUS.md).

Design references: [GDD](docs/GDD.md), [architecture](docs/ARCHITECTURE.md), [combat](docs/COMBAT.md), [Arts](docs/SKILLS.md), [future quests](docs/QUESTS.md), [art direction](docs/ART_BIBLE.md), and [performance](docs/PERFORMANCE.md).

The [combat quality and scalability audit](docs/COMBAT_AUDIT.md) records the production gaps, current verification, and next implementation gates.

Enemy attack warnings now show their actual gameplay footprint: a narrow cleave lane, a fan for the double cut, or a full disk for the radial sweep. Their reach stays fixed during windup. Muted decorative floor inlays are separate from these attack outlines. The duel uses Blender-authored contact-marked motion curves on the existing prototype characters.

The current HUD uses a compact floating-glass style based on the supplied visual references. Use the right-side menu for pause, controls and tutorial. Performance telemetry is available in Lab tools. See the [current expansion plan](docs/EXPANSION_PLAN.md) for the Guild Trial implementation and remaining expansion gates.

## Guild Trial

Choose **Guild board** from the title screen or right-side menu. Complete Footwork (three basic hits and an evade), Break the guard (Art hit and Break), and Counter discipline (three Perfect Parries) to earn Aether Step, Resonant Cleave, and Stillwater Cut. Each challenge describes its reward; completion automatically opens a result screen with the Art's purpose and controls. Equip learned Arts in four unique slots between challenges, then defeat the two-Sentinel Guild Trial.

Complete two different challenges with a landed Good/Perfect Crescent Break to earn its mastery choice: 200 ms recovery, or +35% Break with 460 ms recovery. Each challenge gives at most one credit; replay can earn a missing credit. Practice modifiers, tutorial activity, resets and whiffs grant no unlocks. Challenges use standard attributes.

The original supplied HUD images are preserved under [References/HUD](References/HUD/README.md), outside shipped runtime assets.

## The Lantern Oath

Ilyra’s induction now leads into the Lantern Guild journal. Four trials teach footing, guard-breaking, nerve and the combined oath. Early rewards are simple single-release Arts. Complete the final trial to earn the **Wayfarer** title and **Wayfarer’s Oath**, a two-event Art: release the first charge, then hold and release the same slot again. Five learned Arts still fit into only four equipped slots.

Use **First person** on the right menu to switch views. Hold your mapped orbit input (right mouse by default) to look. The **Guild journal** becomes a personal screen-mounted window and keeps combat/movement running. Close it with × or Escape; Escape again pauses. Focus loss still pauses safely. Journey and Arts tabs keep the journal compact; highlighted summaries expand, and dotted HUD terms reveal hover/focus/click help.

The current location is **Guild Hall Training Room**. Walk to the **weapon rack** and press **G** to switch weapons. Use **Edit Arts** for skill slots, stat cards and the downloadable bank. Press **M** to reveal the side menu. First-person settings remain translucent and live; Controls includes a saved target-facing toggle. See [training skills](docs/SKILLS.md) and [Blender MCP setup](docs/BLENDER_MCP_SETUP.md).

### Quick supplies and camera

C uses a health potion; V uses a stamina draught. Both share a five-second cooldown and work between actions, including ordinary combat. Click the supply icons or change their keyboard/mouse bindings in Controls. Full resources do not consume stock.

Native pointer lock drives the camera without right-drag, using raw mouse input where supported. Esc or opening a menu releases camera control. Native pointer capture is attempted automatically after gameplay interactions; browsers may require a click before allowing it. If denied, click the game to request native capture; cursor hover no longer rotates the view. Resume after focus loss restores gameplay safely.

Restart from **Esc → Comfort, calibration & saves → Restart adventure**. Confirming returns to name, character and starting weapon selection. Controls are retained and the prior adventure is available through the recovery-backup download.

The dungeon now follows a main tunnel with optional supply and camp/aqueduct offshoots. Goblins drop Col and can drop their carried cleaver, iron fragments or worn leather scraps. The camp cache contains a dagger; supply caches contain potions. Material details explain their source and future crafting use. Select carried weapons in the personal menu’s Items section.
