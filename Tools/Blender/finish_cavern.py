"""Original tiled masonry texture and metre-scaled planar UVs for the cavern."""
import bpy, random
from pathlib import Path

def finish_cavern(root):
 random.seed(4104)
 size=256
 texture=bpy.data.images.new('Trinity blue basalt masonry',width=size,height=size)
 pixels=[]
 for y in range(size):
  for x in range(size):
   row=y//64; seam=y%64<3 or (x+(row%2)*64)%128<3
   grain=random.uniform(-.025,.025)
   value=(.13 if seam else .34)+grain
   pixels.extend((value*.78,value*.9,value,1))
 texture.pixels=pixels
 target=root/'public/assets/textures/cavern_masonry.png';target.parent.mkdir(parents=True,exist_ok=True)
 texture.filepath_raw=str(target);texture.file_format='PNG';texture.save();texture.pack()
 for mat in bpy.data.materials:
  if not mat.name.startswith(('Cavern basalt','Cavern worn')):continue
  node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=texture
  mat.node_tree.links.new(node.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
 for obj in bpy.context.scene.objects:
  if obj.type!='MESH':continue
  uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='Masonry metres')
  for face in obj.data.polygons:
   normal=face.normal;axis=max(range(3),key=lambda i:abs(normal[i]));axes=[i for i in range(3) if i!=axis]
   for index in face.loop_indices:
    co=obj.matrix_world@obj.data.vertices[obj.data.loops[index].vertex_index].co
    uv.data[index].uv=(co[axes[0]]*.5,co[axes[1]]*.5)

if __name__=='__main__':
 root=Path(__file__).resolve().parents[2]
 bpy.ops.wm.open_mainfile(filepath=str(root/'art/blender/connected_cavern.blend'))
 finish_cavern(root)
 bpy.ops.wm.save_as_mainfile(filepath=str(root/'art/blender/connected_cavern.blend'))
 bpy.ops.export_scene.gltf(filepath=str(root/'public/assets/environments/connected_cavern.glb'),export_format='GLB')
