"""Original additive body poses; gameplay owns translation and contact deadlines."""
from pathlib import Path
import bpy, json
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
rig=bpy.data.objects.new('body_motion_controller',None)
bpy.context.collection.objects.link(rig)
# Frame, pitch, roll, vertical offset. Contact at 36, recovery at 60.
clips={
 'sentinel':[(0,0,0,0),(16,-.12,-.08,-.04),(29,-.16,-.1,-.07),(36,.18,.06,-.04),(43,.23,.09,-.06),(60,0,0,0)],
 'boar_jab':[(0,0,0,0),(14,.08,0,-.08),(29,.18,0,-.16),(36,-.22,0,.04),(43,-.12,0,0),(60,0,0,0)],
 'boar_sweep':[(0,0,0,0),(18,.09,-.2,-.09),(29,.12,-.26,-.13),(36,-.1,0,-.02),(44,0,.25,-.05),(60,0,0,0)],
 'counter':[(0,0,0,0),(9,-.12,-.1,-.05),(30,-.08,-.07,-.05),(36,.1,.08,-.03),(48,.05,.03,-.02),(60,0,0,0)],
 'dodge':[(0,0,0,0),(10,.13,.12,-.14),(30,.18,.18,-.22),(45,.08,.08,-.12),(60,0,0,0)],
 'hit':[(0,-.15,.12,0),(10,-.2,.15,-.04),(30,-.08,.06,-.03),(60,0,0,0)],
 'broken':[(0,.1,0,-.03),(12,.28,.09,-.16),(36,.26,.08,-.14),(53,.18,.05,-.09),(60,0,0,0)],
}
out={'fps':60,'contactFrame':36,'endFrame':60,'clips':{}}
for i,(name,keys) in enumerate(clips.items()):
 start=i*80+1
 for frame,pitch,roll,height in keys:
  rig.rotation_euler=(pitch,roll,0);rig.location.z=height
  rig.keyframe_insert(data_path='rotation_euler',frame=start+frame,group=name)
  rig.keyframe_insert(data_path='location',frame=start+frame,group=name)
 bpy.context.scene.timeline_markers.new(name+'_start',frame=start)
 bpy.context.scene.timeline_markers.new(name+'_contact',frame=start+36)
for layer in rig.animation_data.action.layers:
 for strip in layer.strips:
  for bag in strip.channelbags:
   for curve in bag.fcurves:
    for key in curve.keyframe_points:key.interpolation='LINEAR'
for i,name in enumerate(clips):
 samples=[]
 for f in range(61):
  bpy.context.scene.frame_set(i*80+1+f)
  samples.append([round(rig.rotation_euler.x,6),round(rig.rotation_euler.y,6),round(rig.location.z,6)])
 out['clips'][name]=samples
bpy.context.scene.frame_end=len(clips)*80
bpy.context.scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender/body_motion.blend'))
(ROOT/'public/assets/animations/body_motion.json').write_text(json.dumps(out,separators=(',',':'))+'\n')
print('TRINITY_BODY_MOTION_EXPORTED')
