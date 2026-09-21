"""Female Wayfarer variant; same combat rig, scale and grip sockets."""
from pathlib import Path
import bpy
ROOT=Path(__file__).resolve().parents[2]
exec((ROOT/'Tools/Blender/build_lab.py').read_text().split('\nclear()\nstone =')[0])
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art/blender/wayfarer.blend'))
hair=bpy.data.objects['hair_cap'].data.materials[0]
head=bpy.data.objects['head']
head.scale.x=.94
# A tied-back hairstyle leaves the face and sword shoulder path clear.
sphere('hair_tie', (0,1.94,-.255), (.10,.10,.10), hair)
sphere('hair_tail', (0,1.68,-.30), (.105,.28,.12), hair)
for side in [-1,1]:
    sphere('hair_side_'+str(side), (side*.185,1.80,-.07), (.055,.20,.12), hair)
export('wayfarer_woman','characters')
