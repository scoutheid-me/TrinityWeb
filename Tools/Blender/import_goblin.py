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
# Author conservative FK locomotion on this mesh's own bind rig. The supplied
# locomotion uses incompatible joint offsets; copying its translations tears this mesh.
from mathutils import Quaternion
root.rotation_euler.z=0
actions=[]
for clip,frames in [('idle',60),('walk',32)]:
 rig.animation_data_clear();rig.animation_data_create();action=bpy.data.actions.new(clip);rig.animation_data.action=action
 for frame in range(1,frames+1):
  phase=(frame-1)/(frames-1)*math.tau
  for bone in rig.pose.bones:
   bone.matrix_basis=Matrix.Identity(4);bone.rotation_mode='QUATERNION'
  bpy.context.view_layer.update()
  for side in ['R','L']:
   shoulder=rig.pose.bones.get('Shoulder_'+side)
   sign=1 if shoulder.bone.head_local.x>0 else -1
   q=shoulder.bone.matrix_local.to_quaternion();shoulder.rotation_quaternion=q.inverted() @ Quaternion((0,0,1),-sign*1.12) @ q
   bpy.context.view_layer.update()
  for bone in rig.pose.bones:
   if clip=='walk' and bone.name in ['UpperLeg_R','UpperLeg_L']:
    bone.rotation_quaternion=Quaternion((1,0,0),math.sin(phase)*.3*(1 if bone.name.endswith('R') else -1))
   if bone.name=='Hips':bone.location.y=math.sin(phase)*(.8 if clip=='idle' else 1.5)
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

