"""Refine existing rigid character sources without moving combat pivots or grips."""
from pathlib import Path
import bpy
ROOT=Path(__file__).resolve().parents[2]
exec((ROOT/'Tools/Blender/build_lab.py').read_text(encoding='utf-8').split('\nclear()\nstone =')[0])
for name in ['wayfarer','wayfarer_woman']:
 bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art/blender'/f'{name}.blend'))
 # Idempotent: replaces only this pass's adornments, leaving articulated hierarchy intact.
 for o in list(bpy.context.scene.objects):
  if o.name.startswith(('detail_','eye','aether_core')):bpy.data.objects.remove(o,do_unlink=True)
 for m in bpy.data.materials:
  if m.name=='shared_mat_coat':
   c=(.055,.105,.135,1);m.diffuse_color=c;m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=c
  if m.name=='shared_mat_skin':
   c=(.69,.43,.30,1);m.diffuse_color=c;m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=c
 for o in bpy.context.scene.objects:
  if 'pauldron' in o.name:o.scale=(.82,.82,.82)
 skin=bpy.data.objects['head'].data.materials[0]
 ivory=material('detail_cream',(.82,.78,.63));ink=material('detail_ink',(.025,.02,.022));iris=material('detail_iris',(.12,.23,.21));leather=material('detail_leather',(.16,.07,.035));brass=material('detail_brass',(.57,.36,.12),metal=.4);lip=material('detail_lip',(.32,.13,.09))
 for x in [-.08,.08]:
  sphere('detail_eye_white',(x,1.84,.195),(.055,.026,.022),ivory)
  sphere('detail_iris',(x,1.842,.216),(.022,.023,.009),iris)
  sphere('detail_pupil',(x,1.842,.224),(.01,.018,.006),ink)
  sphere('detail_eye_glint',(x-.005,1.85,.229),(.006,.007,.003),ivory)
  cube('detail_brow',(x,1.895,.20),(.084,.018,.018),ink,.005)
 for x in [-.205,.205]:sphere('detail_ear',(x,1.8,0),(.04,.066,.045),skin)
 sphere('detail_nose',(0,1.78,.209),(.026,.043,.035),skin)
 cube('detail_mouth',(0,1.715,.203),(.07,.009,.008),lip,.002)
 for x in [-.085,.085]:
  ob=cube('detail_lapel',(x,1.47,.195),(.1,.30,.035),ivory,.01);ob.rotation_euler.y=(-.22 if x<0 else .22)
 for y in [1.31,1.21,1.11]:sphere('detail_button',(0,y,.227),(.025,.025,.012),brass)
 cube('detail_belt',(0,.99,.035),(.56,.075,.36),leather,.015)
 cube('detail_buckle',(0,.99,.236),(.105,.085,.025),brass,.012)
 cube('detail_satchel',(-.28,.88,-.06),(.16,.24,.23),leather,.035)
 # Hide the former technological chest plate beneath a tailored waistcoat.
 plate=bpy.data.objects.get('chest_plate')
 if plate:plate.data.materials.clear();plate.data.materials.append(leather)
 export(name,'characters')
