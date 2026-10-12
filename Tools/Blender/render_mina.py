"""Render a matching dialogue portrait from the preserved rigged character."""
from pathlib import Path
import bpy
from mathutils import Vector
R=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(R/'art/blender/mina_guide.blend'))
bpy.context.scene.frame_set(1)
bpy.ops.object.camera_add(location=(.12,-3,1.52));c=bpy.context.object;c.rotation_euler=(Vector((0,0,1.18))-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=1.45;bpy.context.scene.camera=c
for loc,power in [((1,-3,3),320),((-2,-1,2),160)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.size=3;l.rotation_euler=(Vector((0,0,1))-l.location).to_track_quat('-Z','Y').to_euler()
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=48;s.render.film_transparent=True;s.world.color=(.18,.18,.18);s.render.resolution_x=700;s.render.resolution_y=1000;s.render.resolution_percentage=100;s.render.filepath=str(R/'public/assets/characters/mina_portrait.png');bpy.ops.render.render(write_still=True)
