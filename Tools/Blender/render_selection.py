"""Render the actual selectable runtime characters for the creation screen."""
import bpy
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
for sex,file in [('man','wayfarer.glb'),('woman','wayfarer_woman.glb')]:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/assets/characters'/file))
 bpy.ops.object.camera_add(location=(2,-5,2.1));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.7;bpy.context.scene.camera=cam
 for pos,power in [((1,-3,4),450),((-2,1,3),300)]:
  bpy.ops.object.light_add(type='AREA',location=pos);bpy.context.object.data.energy=power;bpy.context.object.data.size=4;bpy.context.object.rotation_euler=(Vector((0,0,1))-bpy.context.object.location).to_track_quat('-Z','Y').to_euler()
 s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=24;s.render.film_transparent=True;s.world.color=(.25,.25,.25);s.render.resolution_x=400;s.render.resolution_y=500;s.render.resolution_percentage=100;s.render.filepath=str(ROOT/f'public/assets/characters/selection_{sex}.png');bpy.ops.render.render(write_still=True)
