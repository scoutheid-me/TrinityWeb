"""Normalize the carried Synty cleaver for the player +Z blade socket."""
import bpy
from pathlib import Path
from mathutils import Matrix
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art/blender/goblin_cleaver_import.blend'))
# Source blade +Z, grip at origin. Player export blade -Y, edge across X.
basis=Matrix(((0,1,0,0),(0,0,-1,0),(-1,0,0,0),(0,0,0,1)))
for o in bpy.data.objects:
 if o.type=='MESH':
  o.data.transform(basis@o.matrix_world);o.matrix_world=Matrix.Identity(4)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender/loot_cleaver.blend'))
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets/weapons/loot_cleaver.glb'),export_format='GLB',export_animations=False)
