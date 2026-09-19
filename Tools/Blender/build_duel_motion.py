"""Author rigid-joint duel clips in Blender, sample runtime curves at 60 Hz.

The existing prototype has rigid part pivots, not a skinned skeleton. Preserve
the original asset sources; save animation work in separate editable .blend files.
Runtime coordinates: X pitch, Y yaw. Blender uses X pitch, Z yaw.
"""
from pathlib import Path
import json
import bpy

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'assets' / 'animations'
OUT.mkdir(parents=True, exist_ok=True)
# time in normalized frames; frame 36 is the actual contact marker.
CLIPS = {
    'cleave': [(0,-.18,0),(14,-2.1,0),(28,-2.1,0),(36,.55,0),(44,1.15,0),(54,-.18,0)],
    'refrain': [(0,-.18,0),(16,.55,-1.3),(29,.55,-1.3),(36,.55,0),(43,.55,1.3),(54,-.18,0)],
    'sweep': [(0,-.18,0),(18,.85,-3.14),(28,.85,-3.14),(36,.85,0),(45,.85,3.14),(54,-.18,0)],
    'basic': [(0,-.18,0),(20,-1.2,-.4),(28,-1.2,-.4),(36,.55,0),(44,.8,.65),(54,-.18,0)],
    'art': [(0,-.18,0),(15,.55,-1.4),(28,.55,-1.4),(36,.55,0),(44,.55,1.4),(54,-.18,0)],
}
result = {'fps':60,'contactFrame':36,'endFrame':54,'clips':{}}
for asset, names in [('aether_sentinel',['cleave','refrain','sweep']),('wayfarer',['basic','art'])]:
    bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art'/'blender'/f'{asset}.blend'))
    scene=bpy.context.scene
    scene.render.fps=60
    arm=bpy.data.objects['right_arm']
    arm.rotation_mode='XYZ'
    arm.animation_data_clear()
    for index,name in enumerate(names):
        start=1+index*70
        for frame,pitch,yaw in CLIPS[name]:
            arm.rotation_euler=(pitch,0,yaw)
            arm.keyframe_insert(data_path='rotation_euler',frame=start+frame,group=name)
        scene.timeline_markers.new(name+'_start',frame=start)
        scene.timeline_markers.new(name+'_contact',frame=start+36)
        scene.timeline_markers.new(name+'_end',frame=start+54)
    # Linear segments are deliberate: contact timing must not drift through easing overshoot.
    action=arm.animation_data.action
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for curve in bag.fcurves:
                    for key in curve.keyframe_points:
                        key.interpolation='LINEAR'
    for index,name in enumerate(names):
        samples=[]
        for frame in range(55):
            scene.frame_set(1+index*70+frame)
            samples.append([round(arm.rotation_euler.x,6),round(arm.rotation_euler.z,6)])
        result['clips'][name]=samples
    scene.frame_start=1
    scene.frame_end=1+(len(names)-1)*70+54
    scene.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art'/'blender'/f'{asset}_combat.blend'))
(OUT/'duel_motion.json').write_text(json.dumps(result,separators=(',',':'))+'\n')
print('TRINITY_DUEL_CLIPS', ', '.join(result['clips']))
