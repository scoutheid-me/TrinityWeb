import bpy,re,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];PACK=Path(r'D:/Synty/POLYGON_Goblin_War_Camp_SourceFiles_v3')
for src,name,kind,atlas in [('Weapons/SM_Wep_Cleaver_01.fbx','goblin_cleaver','weapons','01_A'),('Props/SM_Prop_Crate_01.fbx','goblin_crate','props','01_A')]:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);bpy.ops.import_scene.fbx(filepath=str(PACK/'FBX'/src))
 for m in bpy.data.materials:
  if not m.users:continue
  m.use_nodes=True;s=m.node_tree.nodes.get('Principled BSDF');s.inputs['Emission Color'].default_value=(0,0,0,1);s.inputs['Emission Strength'].default_value=0;s.inputs['Roughness'].default_value=.9
  t=m.node_tree.nodes.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(PACK/'Textures/Alts'/f'PolygonGoblinWarCamp_Texture_{atlas}.png'),check_existing=True);t.image.pack();m.node_tree.links.new(t.outputs['Color'],s.inputs['Base Color'])
 bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender'/f'{name}_import.blend'))
 bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets'/kind/f'{name}.glb'),export_format='GLB',export_animations=False)
