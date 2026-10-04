from pathlib import Path
import bpy,math,json,sys
from mathutils import Vector,Matrix
ROOT=Path(__file__).resolve().parents[2]
PACK=Path(r'D:/Synty/POLYGON_Goblin_War_Camp_SourceFiles_v3')
ANIM=Path(r'D:/Synty/ANIMATION_Goblin_Locomotion_SourceFiles_v2/SourceFiles/Animations/Polygon/Neutral')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.fbx(filepath=str(PACK/'FBX/Characters/Characters.fbx'))
rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
boss='--captain' in sys.argv
mesh=bpy.data.objects['SM_Chr_King_01' if boss else 'SM_Chr_Warrior_Male_01']
for o in list(bpy.context.scene.objects):
 if o not in [rig,mesh]:bpy.data.objects.remove(o,do_unlink=True)
print('RIG',rig.rotation_euler[:],rig.scale[:],mesh.rotation_euler[:],mesh.scale[:],[(b.name,list(b.head_local)) for b in rig.data.bones if b.name in ['Hips','Head','Hand_R']])
# Palette atlas supplied by the user. Embed only the texture consumed by this game model.
mat=mesh.data.materials[0];mat.use_nodes=True
shader=mat.node_tree.nodes.get('Principled BSDF');shader.inputs['Roughness'].default_value=.85;shader.inputs['Emission Color'].default_value=(0,0,0,1);shader.inputs['Emission Strength'].default_value=0
for link in list(mat.node_tree.links):
 if link.to_socket==shader.inputs['Normal']:mat.node_tree.links.remove(link)
tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(PACK/'Textures/Alts/PolygonGoblinWarCamp_Texture_01_A.png'));tex.image.pack();mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
# The source uses Y up. One parent conversion fixes mesh, skeleton and every animation together.
root=bpy.data.objects.new('goblin_export_root',None);bpy.context.collection.objects.link(root)
rig.parent=root;root.rotation_euler.z=math.pi
# Retarget joint directions, preserving the destination bind offsets and unit scale.
# Copying source joint translations distorts the War Camp mesh.
from mathutils import Quaternion
root.rotation_euler.z=0
actions=[]
base_poses={}
for clip,source_path in [('idle','Idles/A_POLY_GBL_Idle_Standing_Neut.fbx'),('walk','Locomotion/Walk/A_POLY_GBL_Walk_F_Neut.fbx')]:
 before=set(bpy.data.objects)
 bpy.ops.import_scene.fbx(filepath=str(ANIM/source_path))
 imported=set(bpy.data.objects)-before
 source=next(o for o in imported if o.type=='ARMATURE')
 source_action=source.animation_data.action
 start,end=map(int,source_action.frame_range)
 print('RETARGET',clip,start,end,[b.name for b in source.pose.bones])
 samples=[]
 for frame in range(start,end+1):
  bpy.context.scene.frame_set(frame)
  samples.append({b.name:b.matrix.translation.copy() for b in source.pose.bones})
 rig.animation_data_clear();rig.animation_data_create();action=bpy.data.actions.new(clip);rig.animation_data.action=action
 for frame,sample in enumerate(samples,1):
  for bone in rig.pose.bones:bone.matrix_basis=Matrix.Identity(4);bone.rotation_mode='QUATERNION'
  bpy.context.view_layer.update()
  for bone in rig.pose.bones:
   children=[c for c in bone.children if c.name in sample and not c.name.startswith('IK')]
   if bone.name in sample and children:
    child=children[0]
    rest=child.bone.head_local-bone.bone.head_local
    posed=sample[child.name]-sample[bone.name]
    if rest.length>.01 and posed.length>.01:
     desired=rest.rotation_difference(posed) @ bone.bone.matrix_local.to_quaternion()
     parent_pose=bone.parent.matrix.to_quaternion() if bone.parent else Quaternion()
     parent_rest=bone.parent.bone.matrix_local.to_quaternion() if bone.parent else Quaternion()
     local_rest=parent_rest.inverted() @ bone.bone.matrix_local.to_quaternion()
     bone.rotation_quaternion=local_rest.inverted() @ parent_pose.inverted() @ desired
     bpy.context.view_layer.update()
   bone.location=(0,0,0);bone.scale=(1,1,1)
   bone.keyframe_insert('location',frame=frame);bone.keyframe_insert('rotation_quaternion',frame=frame);bone.keyframe_insert('scale',frame=frame)
  if frame==1:base_poses[clip]={b.name:b.rotation_quaternion.copy() for b in rig.pose.bones}
 action.use_fake_user=True;actions.append(action)
 for o in imported:bpy.data.objects.remove(o,do_unlink=True)
# Weapon attacks are authored here; the supplied pack contains locomotion only.
# Frame 24 is contact. Runtime maps each authoritative attack deadline to this frame.
for clip in ['attack_chop','attack_sweep']:
 rig.animation_data_clear();rig.animation_data_create();action=bpy.data.actions.new(clip);rig.animation_data.action=action
 for frame in range(1,49):
  t=(frame-1)/47
  # Slow anticipation, quick strike, controlled recovery.
  if frame<=19:wind=(frame-1)/18;strike=0;recover=0
  elif frame<=24:wind=1;strike=(frame-19)/5;recover=0
  elif frame<=27:wind=1;strike=1;recover=0
  else:wind=1;strike=1;recover=(frame-27)/21
  strength=1-recover
  for bone in rig.pose.bones:
   bone.location=(0,0,0);bone.scale=(1,1,1);bone.rotation_quaternion=base_poses['idle'][bone.name].copy()
  bpy.context.view_layer.update()
  for name,child_name in [('Shoulder_R','Elbow_R'),('Elbow_R','Hand_R')]:
   bone=rig.pose.bones[name];child=rig.pose.bones[child_name]
   current=(child.matrix.translation-bone.matrix.translation).normalized()
   if clip=='attack_chop':
    wind_dir=Vector((-.15,.95,-.2) if name=='Shoulder_R' else (0,.8,.6))
    hit_dir=Vector((-.1,-.35,1) if name=='Shoulder_R' else (0,-.45,1))
   else:
    wind_dir=Vector((-1,.1,-.2) if name=='Shoulder_R' else (-.5,0,.8))
    hit_dir=Vector((.5,-.1,.8) if name=='Shoulder_R' else (.8,-.15,.5))
   target=current.lerp(wind_dir.normalized(),wind).lerp(hit_dir.normalized(),strike).lerp(current,recover).normalized()
   desired=current.rotation_difference(target) @ bone.matrix.to_quaternion()
   parent_pose=bone.parent.matrix.to_quaternion();parent_rest=bone.parent.bone.matrix_local.to_quaternion()
   local_rest=parent_rest.inverted() @ bone.bone.matrix_local.to_quaternion()
   bone.rotation_quaternion=local_rest.inverted() @ parent_pose.inverted() @ desired
   bpy.context.view_layer.update()
  for bone in rig.pose.bones:
   bone.keyframe_insert('location',frame=frame);bone.keyframe_insert('rotation_quaternion',frame=frame);bone.keyframe_insert('scale',frame=frame)
 action.use_fake_user=True;actions.append(action)
rig.animation_data_clear();rig.animation_data_create()
for action in actions:
 track=rig.animation_data.nla_tracks.new();track.name=action.name;strip=track.strips.new(action.name,int(action.frame_range[0]),action);strip.action_slot=action.slots[0];strip.action_frame_start=action.frame_range[0];strip.action_frame_end=action.frame_range[1]
for bone in rig.pose.bones:bone.rotation_mode='QUATERNION'
for o in bpy.context.scene.objects:o.select_set(True)
bpy.context.view_layer.objects.active=rig
out=ROOT/'public/assets/enemies'/('goblin_captain.glb' if boss else 'goblin.glb');out.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender'/('goblin_captain_import.blend' if boss else 'goblin_import.blend')))
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True)
print('EXPORTED',out,'ACTIONS',[(a.name,list(a.frame_range)) for a in actions])

