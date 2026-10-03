import bpy
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art/blender/goblin_import.blend'))
for obj in bpy.context.scene.objects:
 if obj.type=='ARMATURE':
  print('SCALECHECK',[(b.name,list(b.scale)) for b in obj.pose.bones if b.name in ['Hips','Spine','Head','Shoulder_R']])
  obj.animation_data.nla_tracks[1].mute=True
bpy.context.scene.frame_set(10)
bpy.ops.object.camera_add(location=(3,-4,2));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.8))-cam.location).to_track_quat('-Z','Y').to_euler();bpy.context.scene.camera=cam
bpy.ops.object.light_add(type='AREA',location=(1,-3,4));bpy.context.object.data.energy=450;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=4
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=16;s.world.color=(.3,.3,.3);s.render.resolution_x=600;s.render.resolution_y=600;s.render.resolution_percentage=100;s.render.filepath=str(ROOT/'test-results/goblin-blender.png');bpy.ops.render.render(write_still=True)
