"""Original connected cave architecture. Layout shared with runtime collision; no scene transitions."""
import bpy,math,random,json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2];layout=json.loads((ROOT/'public/data/cavern-layout.json').read_text());areas=layout['areas'];links=layout['links'];random.seed(204)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,color,emission=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=.95;p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission;return m
stone=[mat('Cavern basalt '+str(i),(.105+i*.015,.13+i*.017,.15+i*.018)) for i in range(6)];earth=mat('Cavern worn path',(.16,.20,.27));crystal=mat('Blue glowstone',(.12,.52,.6),1.8);moss=mat('Soft moss',(.1,.22,.16));wood=mat('Old timber',(.22,.13,.06))
def height(z,x):return -3+3*max(0,min(1,((x+30)*.6+(z-120)*.8-10)/17.5))

def mesh(name,verts,faces,mats):
 data=bpy.data.meshes.new(name);data.from_pydata([(x,-z,y+height(z,x)) for x,y,z in verts],[],faces);data.materials.clear()
 for m in mats:data.materials.append(m)
 data.update();o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o)
 for p in data.polygons:p.material_index=random.randrange(len(mats))
 return o
def box(name,p,size,m):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(p[0],-p[2],p[1]+height(p[2],p[0])));o=bpy.context.object;o.name=name;o.scale=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m);return o
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
  bpy.ops.mesh.primitive_cone_add(vertices=5,radius1=.4+random.random()*.5,radius2=.05,depth=1+random.random()*2,location=(px,-pz,1+height(pz,px)));o=bpy.context.object;o.name='Glowstone outcrop' if n%3==0 else 'Stalagmite';o.data.materials.append(crystal if n%3==0 else stone[n%6])
# Unique room silhouettes: aqueduct, supply alcove, camp, pool, brute shrine, throne.
water=mat('Still blue water',(.025,.19,.28),.25)
cloth=mat('Goblin camp canvas',(.28,.16,.09))
for x in [25,28,32,35]:
 box('Aqueduct pier',(x,1.4,36),(.7,2.8,.9),stone[4])
box('Broken water channel',(30,2.9,36),(12,.35,1.3),stone[2])
for n in range(4):box('Provision shelf',(-36,.7+n*.6,30),(1.2,.12,4),wood)
for x in [25,35]:
 mesh('Scavenger canvas shelter',[(x-1.8,0,63),(x,2.4,63),(x+1.8,0,63),(x-1.8,0,66),(x,2.4,66),(x+1.8,0,66)],[(0,1,4,3),(1,2,5,4)],[cloth])
box('Reflecting pool',(3,-.025,65),(5,.04,3),water)
for x,z in [(0,63),(0,67),(6,63),(6,67)]:box('Pool rim',(x,.12,z),(.4,.24,.4),stone[4])
for n in range(5):
 box('Brute shrine steps',(-30,n*.16,66),(5-n*.5,.2,2.5-n*.3),stone[3])
box('Captain throne seat',(-30,.65,98),(2,1.3,1.5),stone[2]);box('Captain throne back',(-30,2,98.8),(2.3,3,.4),stone[4])
for x in [-33,-27]:box('Captain standard',(x,2.5,98),(.15,5,.15),wood);box('Captain banner',(x+.5,3.6,98),(1,1.5,.06),cloth)
for i,j in links:
 a,b=areas[i],areas[j];dx=b['x']-a['x'];dz=b['z']-a['z'];length=math.hypot(dx,dz);ux,uz=dx/length,dz/length;px,pz=-uz,ux
 # Continuous walkable floor, overlaps room floors by 2 cm underneath.
 cx,cz=(a['x']+b['x'])/2,(a['z']+b['z'])/2
 for step in range(math.ceil(length*2)):
  f0=-length/2+step*.5;f1=min(length/2,f0+.5)
  v=[(cx+ux*f+px*w,-.02,cz+uz*f+pz*w) for f,w in [(f0,-3.6),(f0,3.6),(f1,3.6),(f1,-3.6)]];mesh('Connecting path',v,[(0,1,2,3)],[earth])
 start=a['radius']*.82;end=length-b['radius']*.82
 if j==9:end=length-8
 for side in [-1,1]:
  v=[(a['x']+ux*f+px*side*w,y,a['z']+uz*f+pz*side*w) for f,y,w in [(start,0,3.6),(end,0,3.6),(end,6.5,4.1),(start,6.5,4.1)]];mesh('Tunnel rock',v,[(0,1,2),(0,2,3)],stone)
 if j!=9:
  v=[(a['x']+ux*f+px*w,6.5,a['z']+uz*f+pz*w) for f,w in [(start,-4.1),(end,-4.1),(end,4.1),(start,4.1)]];mesh('Tunnel ceiling',v,[(0,1,2,3)],stone[:2])
 # Stone courses, columns and voussoir arches extend the visible corridor.
 for f in range(math.ceil(start)+1,math.floor(end),4):
  for side in [-1,1]:
   x=a['x']+ux*f+px*side*3.35;z=a['z']+uz*f+pz*side*3.35
   for y,radius,depth in [(.18,.62,.36),(2.3,.38,4.1),(4.4,.59,.32)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=radius,depth=depth,location=(x,-z,y+height(z,x)));bpy.context.object.data.materials.append(stone[3]);bpy.context.object.name='Dressed stone column'
   if f%8<4:
    bowl=box('Brazier bracket',(x-px*side*.32,1.8,z-pz*side*.32),(.6,.2,.6),stone[1])
    bpy.ops.mesh.primitive_cone_add(vertices=8,radius1=.19,radius2=.03,depth=.65,location=(x-px*side*.35,-z+pz*side*.35,2.2+height(z,x)));bpy.context.object.name='Aether blue flame';bpy.context.object.data.materials.append(crystal)
  for segment in range(13):
   angle=(segment+.5)*math.pi/13;w=math.cos(angle)*3.3;y=4.35+math.sin(angle)*1.75
   o=box('Stone arch voussoir',(a['x']+ux*f+px*w,y,a['z']+uz*f+pz*w),(.65,.4,.65),stone[segment%6])
  # Low relief flagstones, below feet; no collision obstructions.
 for f in range(math.ceil(start),math.floor(end),2):
  if j==9 and 127<a['z']+uz*f<143:continue
  for side in [-2,0,2]:
   o=box('Worn corridor paving',(a['x']+ux*f+px*side,-.08,a['z']+uz*f+pz*side),(1.94,.16,1.94),stone[(f+side)%6]);o.rotation_euler.z=math.atan2(dx,dz)
 # Stair treads conform to the same analytic climb as runtime feet/camera.
 if j==9:
  for n in range(28):
   z=128+(n+.5)*.5;f=(z-a['z'])/uz;x=a['x']+ux*f
   o=box('Daylight stair tread',(x,-.025,z),(7.1,.12,.625),stone[n%6]);o.rotation_euler.z=math.atan2(dx,dz)
# Combine architecture into material batches; six shared rock palettes, modest vertex count.
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=next(o for o in bpy.context.scene.objects if o.type=='MESH');bpy.ops.object.join()
for m in bpy.context.object.data.materials:m.use_backface_culling=False
import sys
sys.path.insert(0,str(Path(__file__).parent))
from finish_cavern import finish_cavern
finish_cavern(ROOT)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender/connected_cavern.blend'));bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets/environments/connected_cavern.glb'),export_format='GLB')
