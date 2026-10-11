"""Original basalt/paving PBR textures with consistent metre-scaled UVs."""
import bpy
from town_surfaces import surface

def finish_cavern(root):
 cache={}
 for mat in bpy.data.materials:
  kind='stone' if mat.name.startswith('Cavern basalt') else 'pave' if mat.name.startswith('Cavern worn') else None
  if not kind:continue
  if kind not in cache:cache[kind]=surface(root,'cavern_'+kind,kind,(.40,.46,.52) if kind=='stone' else (.29,.34,.40))
  nodes=mat.node_tree.nodes;links=mat.node_tree.links;p=nodes.get('Principled BSDF')
  tex=nodes.new('ShaderNodeTexImage');tex.image=cache[kind][0];links.new(tex.outputs['Color'],p.inputs['Base Color'])
  tex=nodes.new('ShaderNodeTexImage');tex.image=cache[kind][1];normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.65
  links.new(tex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],p.inputs['Normal']);p.inputs['Roughness'].default_value=.85
 for obj in bpy.context.scene.objects:
  if obj.type!='MESH':continue
  uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='Masonry metres')
  for face in obj.data.polygons:
   axis=max(range(3),key=lambda i:abs(face.normal[i]));axes=[i for i in range(3) if i!=axis]
   for index in face.loop_indices:
    co=obj.matrix_world@obj.data.vertices[obj.data.loops[index].vertex_index].co;uv.data[index].uv=(co[axes[0]]*.5,co[axes[1]]*.5)
