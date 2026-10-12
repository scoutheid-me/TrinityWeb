"""Rig the user-supplied segmented Tripo character; metre scale, in-place NPC clips."""
from pathlib import Path
import bpy, math
from mathutils import Vector, Quaternion
R=Path(__file__).resolve().parents[2]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(R/'art/imports/mina/mina_original.glb'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
for o in meshes:
 m=o.matrix_world.copy();o.parent=None;o.matrix_world=m
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
 bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 # Source is one metre tall. Centre the spine and normalize to 1.72m.
 for v in o.data.vertices:v.co.x+=.0125;v.co*=1.72
for o in list(bpy.context.scene.objects):
 if o.type!='MESH':bpy.data.objects.remove(o,do_unlink=True)
bpy.ops.object.armature_add();rig=bpy.context.object;rig.name='mina_rig';bpy.ops.object.mode_set(mode='EDIT');rig.data.edit_bones.remove(rig.data.edit_bones[0])
spec={}
def bone(n,h,t,parent=None):
 b=rig.data.edit_bones.new(n);b.head=Vector(h)*1.72;b.tail=Vector(t)*1.72
 if parent:b.parent=rig.data.edit_bones[parent]
 spec[n]=(b.head.copy(),b.tail.copy())
bone('root',(0,0,0),(0,0,.1))
bone('hips',(0,.02,.52),(0,.02,.62),'root')
bone('spine',(0,.02,.62),(0,.02,.73),'hips')
bone('chest',(0,.02,.73),(0,.02,.81),'spine')
bone('neck',(0,.02,.81),(0,.02,.86),'chest')
bone('head',(0,.02,.86),(0,.02,.98),'neck')
for side,s in [('left',1),('right',-1)]:
 bone(side+'_clavicle',(0,.02,.79),(s*.095,.025,.785),'chest')
 bone(side+'_upper_arm',(s*.095,.025,.785),(s*.225,.025,.785),side+'_clavicle')
 bone(side+'_forearm',(s*.225,.025,.785),(s*.378,.025,.78),side+'_upper_arm')
 bone(side+'_hand',(s*.378,.025,.78),(s*.422,.025,.78),side+'_forearm')
 x=.09 if s==1 else -.09
 bone(side+'_thigh',(x,.02,.54),(x,.01,.285),'hips')
 bone(side+'_shin',(x,.01,.285),(x,.03,.07),side+'_thigh')
 bone(side+'_foot',(x,.03,.07),(x,-.065,.035),side+'_shin')
bpy.ops.object.mode_set(mode='OBJECT')
def mix(a,b,t):return {a:1-t,b:t}
def smooth(v,a,b):
 t=max(0,min(1,(v-a)/(b-a)));return t*t*(3-2*t)
for o in meshes:
 part=int(o.name.split('_')[2]);o.name='mina_'+str(part)
 groups={n:o.vertex_groups.new(name=n) for n in spec}
 for v in o.data.vertices:
  x,y,z=v.co/1.72;side='left' if x>0 else 'right';ax=abs(x)
  if part==0:w={'head':1}
  elif part in (10,11,12,13,20,21):
   if ax<.225:w=mix(side+'_upper_arm',side+'_forearm',smooth(ax,.20,.25))
   else:w=mix(side+'_forearm',side+'_hand',smooth(ax,.36,.395))
  elif part in (3,5):w=mix('chest',side+'_upper_arm',smooth(ax,.065,.16))
  elif part in (4,9):w=mix(side+'_thigh',side+'_shin',1-smooth(z,.265,.31))
  elif part in (22,26):w=mix(side+'_foot',side+'_shin',smooth(z,.055,.115))
  elif part==14:
   if z>.8:w=mix('chest','neck',smooth(z,.8,.855))
   else:w=mix('spine','chest',smooth(z,.68,.76))
  else:w={'hips':1}
  for n,value in w.items():
   if value>0:groups[n].add([v.index],value,'REPLACE')
 mod=o.modifiers.new('Mina skin','ARMATURE');mod.object=rig;o.parent=rig
 for p in o.data.polygons:p.use_smooth=True
for mat in bpy.data.materials:
 if mat.use_nodes:
  bs=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
  if bs:bs.inputs['Roughness'].default_value=.72
rig.animation_data_create()
def turn(n,axis,angle):
 p=rig.pose.bones[n];basis=p.bone.matrix_local.to_quaternion();p.rotation_mode='QUATERNION';p.rotation_quaternion=basis.inverted()@Quaternion(axis,angle)@basis
for clip,frames in [('idle',121),('greet',91)]:
 action=bpy.data.actions.new(clip);rig.animation_data.action=action
 for f in range(1,frames+1,3):
  t=(f-1)/(frames-1);wave=math.sin(t*math.tau);g=math.sin(t*math.pi)**2 if clip=='greet' else 0
  for p in rig.pose.bones:p.rotation_mode='QUATERNION';p.rotation_quaternion=Quaternion();p.location=(0,0,0)
  for side,s in [('left',1),('right',-1)]:
   turn(side+'_upper_arm',(0,1,0),s*math.radians(68+wave*.6-g*(12 if s==-1 else 0)))
   turn(side+'_forearm',(0,0,1),s*math.radians(-9-g*14))
  turn('chest',(1,0,0),math.radians(wave*.65))
  turn('head',(1,0,0),math.radians(g*5))
  turn('head',(0,0,1),math.radians(wave*1.5+g*4))
  for p in rig.pose.bones:p.keyframe_insert('rotation_quaternion',frame=f,group=p.name)
 track=rig.animation_data.nla_tracks.new();track.name=clip;track.strips.new(clip,1,action);track.mute=True
rig.animation_data.action=bpy.data.actions['idle'];bpy.context.scene.frame_set(1)
for image in bpy.data.images:
 if image.pixels and image.name!='Render Result':image.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(R/'art/blender/mina_guide.blend'))
for track in rig.animation_data.nla_tracks:track.mute=False
rig.animation_data.action=None
bpy.ops.export_scene.gltf(filepath=str(R/'public/assets/characters/mina_guide.glb'),export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_skins=True,export_force_sampling=True)
print('Mina export:',len(spec),'bones;',sum(len(o.data.polygons) for o in meshes),'polygons')
