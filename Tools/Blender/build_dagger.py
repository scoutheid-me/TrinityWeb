"""Original short loot blade, same +Z blade axis and origin as training weapons."""
import bpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def material(name,color):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=.65;p.inputs['Roughness'].default_value=.55
 return m
steel=material('Salvaged steel',(.45,.56,.60));grip=material('Worn leather',(.18,.08,.04));brass=material('Dagger rivets',(.42,.29,.12))
def box(name,x,y,z,w,h,d,mat):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(x,-z,y));o=bpy.context.object;o.name=name;o.scale=(w,d,h);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
box('Leather grip',0,0,-.1,.075,.07,.24,grip);box('Short crossguard',0,0,.025,.27,.055,.045,brass)
data=bpy.data.meshes.new('Forged dagger blade');data.from_pydata([(-.075,-.05,0),(.075,-.05,0),(-.06,-.55,0),(.06,-.55,0),(0,-.8,0),(0,-.07,.035),(0,-.52,.025),(0,-.07,-.035),(0,-.52,-.025)],[],[(0,2,6,5),(1,5,6,3),(2,4,6),(3,6,4),(0,7,8,2),(1,3,8,7),(2,8,4),(3,4,8),(0,5,1,7)])
data.materials.append(steel);obj=bpy.data.objects.new('Goblin-forged dagger',data);bpy.context.collection.objects.link(obj)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender/goblin_dagger.blend'))
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets/weapons/goblin_dagger.glb'),export_format='GLB')
