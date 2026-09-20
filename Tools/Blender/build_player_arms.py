"""Upgrade only the Wayfarer source and export; preserve other assets."""
from pathlib import Path
import bpy
ROOT=Path(__file__).resolve().parents[2]
exec((ROOT/'Tools/Blender/build_lab.py').read_text().split('\nclear()\nstone =')[0])
exec((ROOT/'Tools/Blender/articulated_arms.py').read_text())
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art/blender/wayfarer.blend'))
for side in ['left','right']:
    arm=bpy.data.objects.get(side+'_arm')
    if arm:
        for obj in list(arm.children_recursive):bpy.data.objects.remove(obj,do_unlink=True)
        bpy.data.objects.remove(arm,do_unlink=True)
body=bpy.data.objects['torso'].data.materials[0]
skin=bpy.data.objects['head'].data.materials[0]
for side,x in [('left',-.4),('right',.4)]:articulated_arm(side,x,body,skin)
export('wayfarer','characters')
