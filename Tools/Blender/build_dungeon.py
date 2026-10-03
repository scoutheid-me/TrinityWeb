from pathlib import Path
import bpy,math
ROOT=Path(__file__).resolve().parents[2]
def clear():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,rgb,glow=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*rgb,1);m.use_nodes=True;s=m.node_tree.nodes.get('Principled BSDF');s.inputs['Base Color'].default_value=(*rgb,1);s.inputs['Roughness'].default_value=.82;s.inputs['Emission Color'].default_value=(*rgb,1);s.inputs['Emission Strength'].default_value=glow;return m
def box(name,p,size,m):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(p[0],-p[2],p[1]));o=bpy.context.object;o.name=name;o.scale=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m);return o
def export(name,kind):
 bpy.ops.object.select_all(action='SELECT');meshes=[o for o in bpy.context.selected_objects if o.type=='MESH'];bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join()
 bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender'/f'{name}.blend'))
 bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets'/kind/f'{name}.glb'),export_format='GLB')
clear();wood=mat('Chest wood',(.3,.17,.07));metal=mat('Chest iron',(.2,.27,.27));gold=mat('Chest latch',(.7,.5,.16))
box('Chest base',(0,.4,0),(1.4,.8,.85),wood);box('Chest lid',(0,.85,0),(1.45,.16,.9),wood)
for x in [-.5,.5]:box('Iron bands',(x,.5,0),(.1,1,.91),metal)
box('Latch',(0,.65,.47),(.18,.25,.06),gold);export('dungeon_chest','props')
clear();white=mat('Town limestone',(.63,.58,.44));roof=mat('Town teal roofs',(.12,.28,.29));pave=mat('Town pavement',(.44,.44,.35));water=mat('Clear fountain',(.2,.52,.59),.3)
box('Town square',(0,-.2,0),(45,.4,45),pave)
for x,z,w,h in [(-16,0,6,9),(16,0,6,8),(-13,13,9,10),(13,13,9,7),(0,19,12,11),(-13,-14,8,8),(13,-14,8,9)]:
 box('Town house',(x,h/2,z),(w,h,6),white);box('Roof',(x,h+.2,z),(w+.8,.5,7),roof)
 for dx in [-2,0,2]:box('Window',(x+dx,h*.65,z-3.05),(.8,1.3,.05),roof)
box('Fountain plinth',(-5,.35,3),(3,.7,3),white);box('Fountain water',(-5,.72,3),(2.6,.05,2.6),water);box('Fountain spout',(-5,1.3,3),(.5,1.4,.5),white)
export('beginnings_gate_square','environments')
