from pathlib import Path
import bpy
from mathutils import Vector
R=Path(__file__).resolve().parents[2]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(R/'art/imports/mina/mina_original.glb'))
for o in bpy.context.scene.objects:
 if o.type=='MESH':
  vs=[o.matrix_world@Vector(v) for v in o.bound_box]
  print(o.name, 'bounds', [tuple(round(fn(v[i] for v in vs),3) for i in range(3)) for fn in (min,max)])
bpy.ops.object.camera_add(location=(0,-2.8,.65));c=bpy.context.object;c.rotation_euler=(Vector((0,0,.52))-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=1.25;bpy.context.scene.camera=c
for loc,power,size in [((1,-2,3),180,3),((-2,-1,1),100,2)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(Vector((0,0,.5))-l.location).to_track_quat('-Z','Y').to_euler()
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=16;s.world.color=(.2,.2,.2);s.render.resolution_x=700;s.render.resolution_y=700;s.render.resolution_percentage=100;s.render.filepath=str(R/'art/imports/mina/source_preview.png');bpy.ops.render.render(write_still=True)
