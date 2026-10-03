"""Original connected cave architecture. Layout shared with runtime collision; no scene transitions."""
import bpy,math,random,json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2];layout=json.loads((ROOT/'public/data/cavern-layout.json').read_text());areas=layout['areas'];links=layout['links'];random.seed(204)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,color,emission=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=.95;p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission;return m
stone=[mat('Cavern basalt '+str(i),(.105+i*.015,.13+i*.017,.15+i*.018)) for i in range(6)];earth=mat('Cavern worn path',(.22,.19,.15));crystal=mat('Blue glowstone',(.12,.52,.6),1.8);moss=mat('Soft moss',(.1,.22,.16));wood=mat('Old timber',(.22,.13,.06))
def mesh(name,verts,faces,mats):
 data=bpy.data.meshes.new(name);data.from_pydata([(x,-z,y) for x,y,z in verts],[],faces);data.materials.clear()
 for m in mats:data.materials.append(m)
 data.update();o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o)
 for p in data.polygons:p.material_index=random.randrange(len(mats))
 return o
def box(name,p,size,m):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(p[0],-p[2],p[1]));o=bpy.context.object;o.name=name;o.scale=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m);return o
for index,a in enumerate(areas[:-1]):
 x,z,r=a['x'],a['z'],a['radius'];N=48
 verts=[(x,0,z)]+[(x+math.sin(i*2*math.pi/N)*r,0,z+math.cos(i*2*math.pi/N)*r) for i in range(N)]
 mesh(a['name']+' floor',verts,[(0,i+1,(i+1)%N+1) for i in range(N)],[earth])
 neighbors=[areas[j if i==index else i] for i,j in links if i==index or j==index]
 for i in range(N):
  angle=(i+.5)*2*math.pi/N
  if any(abs(math.atan2(math.sin(angle-math.atan2(b['x']-x,b['z']-z)),math.cos(angle-math.atan2(b['x']-x,b['z']-z))))<math.asin(min(.9,4.1/r)) for b in neighbors):continue
  aa=i*2*math.pi/N;bb=(i+1)*2*math.pi/N;rr=r+random.random()*.6
  v=[]
  for y,rad in [(0,r),(3.8,rr),(7.5+random.random(),r*.93)]:
   for ang in [aa,bb]:v.append((x+math.sin(ang)*rad,y,z+math.cos(ang)*rad))
  mesh('Faceted cave wall',v,[(0,1,3),(0,3,2),(2,3,5),(2,5,4)],stone)
 # Rough ceiling dome; normals face into the cave.
 v=[(x,9.5,z)]+[(x+math.sin(i*2*math.pi/N)*r,7.8,z+math.cos(i*2*math.pi/N)*r) for i in range(N)]
 mesh('Vaulted natural ceiling',v,[(0,(i+1)%N+1,i+1) for i in range(N)],stone[:3])
 for n in range(8):
  ang=n*2.399;px=x+math.sin(ang)*(r-1);pz=z+math.cos(ang)*(r-1)
  if any(math.hypot(px-b['x'],pz-b['z'])<math.hypot(x-b['x'],z-b['z'])-r+4 for b in neighbors):continue
  bpy.ops.mesh.primitive_cone_add(vertices=5,radius1=.4+random.random()*.5,radius2=.05,depth=1+random.random()*2,location=(px,-pz,1));o=bpy.context.object;o.name='Glowstone outcrop' if n%3==0 else 'Stalagmite';o.data.materials.append(crystal if n%3==0 else stone[n%6])
for i,j in links:
 a,b=areas[i],areas[j];dx=b['x']-a['x'];dz=b['z']-a['z'];length=math.hypot(dx,dz);ux,uz=dx/length,dz/length;px,pz=-uz,ux
 # Continuous walkable floor, overlaps room floors by 2 cm underneath.
 cx,cz=(a['x']+b['x'])/2,(a['z']+b['z'])/2
 v=[(cx+ux*f+px*w,-.02,cz+uz*f+pz*w) for f,w in [(-length/2,-3.6),(-length/2,3.6),(length/2,3.6),(length/2,-3.6)]];mesh('Connecting path',v,[(0,1,2,3)],[earth])
 start=a['radius']*.82;end=length-b['radius']*.82
 if j==9:end=length-8
 for side in [-1,1]:
  v=[(a['x']+ux*f+px*side*w,y,a['z']+uz*f+pz*side*w) for f,y,w in [(start,0,3.6),(end,0,3.6),(end,6.5,4.1),(start,6.5,4.1)]];mesh('Tunnel rock',v,[(0,1,2),(0,2,3)],stone)
 if j!=9:
  v=[(a['x']+ux*f+px*w,6.5,a['z']+uz*f+pz*w) for f,w in [(start,-4.1),(end,-4.1),(end,4.1),(start,4.1)]];mesh('Tunnel ceiling',v,[(0,1,2,3)],stone[:2])
 for f in [start+1,end-1]:
  for side in [-1,1]:
   o=box('Abandoned support',(a['x']+ux*f+px*side*3.3,2.1,a['z']+uz*f+pz*side*3.3),(.3,4.2,.3),wood)
# Combine architecture into material batches; six shared rock palettes, modest vertex count.
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=next(o for o in bpy.context.scene.objects if o.type=='MESH');bpy.ops.object.join()
for m in bpy.context.object.data.materials:m.use_backface_culling=False
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender/connected_cavern.blend'));bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets/environments/connected_cavern.glb'),export_format='GLB')
