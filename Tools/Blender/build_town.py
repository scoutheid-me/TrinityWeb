"""Original lightweight town facade and stone exit, in Trinity metres/Y-up exports."""
from pathlib import Path
import bpy, math
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,rgb):
 m=bpy.data.materials.new(name);m.diffuse_color=(*rgb,1);m.use_nodes=True;m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*rgb,1);m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.85;return m
stone=mat('Warm limestone',(.57,.54,.44));trim=mat('Pale carved stone',(.76,.7,.53));timber=mat('Dark oak framing',(.18,.105,.06));plaster=mat('Ivory plaster',(.8,.74,.58));roof=mat('Blue slate',(.09,.2,.24));gold=mat('Guild brass',(.78,.53,.12));cloth=mat('Guild burgundy',(.36,.055,.085));glass=mat('Amber window',(.85,.57,.2));pave=mat('Square paving',(.42,.43,.39))
def box(n,x,y,z,w,h,d,m):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(x,-z,y));o=bpy.context.object;o.name=n;o.scale=(w,d,h);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m);return o
def mesh(n,verts,faces,m):
 data=bpy.data.meshes.new(n);data.from_pydata([(x,-z,y) for x,y,z in verts],[],faces);data.materials.append(m);o=bpy.data.objects.new(n,data);bpy.context.collection.objects.link(o);return o
def gable(x,z,w,h,d):
 mesh('Slate pitched roof',[(x-w/2,h,z-d/2),(x+w/2,h,z-d/2),(x,h+2.4,z-d/2),(x-w/2,h,z+d/2),(x+w/2,h,z+d/2),(x,h+2.4,z+d/2)],[(0,1,2),(3,5,4),(0,2,5,3),(2,1,4,5)],roof)
def banner(x,z):
 box('Banner brass rail',x,6.2,z,1.8,.12,.16,gold)
 mesh('Hanging guild banner',[(x-.7,6.1,z),(x+.7,6.1,z),(x+.68,3.5,z-.1),(x,3,z-.12),(x-.68,3.5,z-.1)],[(0,1,2,3,4)],cloth)
 box('Guild crest vertical',x,4.9,z-.08,.12,1.5,.05,gold);box('Guild crest crossguard',x,5.2,z-.09,.7,.12,.05,gold)
def save(name):
 bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender'/f'{name}.blend'))
 bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=next(o for o in bpy.context.scene.objects if o.type=='MESH');bpy.ops.object.join()
 bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets/environments'/f'{name}.glb'),export_format='GLB')
box('Town square',0,-.15,3,42,.3,36,pave)
# Paving joints, kept to broad strips instead of hundreds of separate stones.
for i in range(-15,19,3):box('Paving seam',i,.006,3,.025,.008,36,stone);box('Paving seam',0,.006,i,40,.008,.025,stone)
for x,z in [(-16,0),(16,0),(-20,-12),(20,-12),(-14,13),(14,13)]:
 box('Half-timber townhouse',x,3,z,7,6,6,plaster);gable(x,z,8,6,7)
 for dx in [-3,0,3]:box('Upright oak beam',x+dx,3,z-3.04,.2,6,.16,timber)
 for y in [1,3.5,5.8]:box('Cross beam',x,y,z-3.05,7,.18,.18,timber)
 for dx in [-1.8,1.8]:box('Town window',x+dx,4.7,z-3.12,1,1.3,.1,glass)
# Hall front at local z=11: reachable inside the square's walkable region.
box('Guild Hall',0,4,15,12,8,8,stone);gable(0,15,13,8,9)
for x in [-5.8,5.8]:box('Guild buttress',x,4,10.7,.65,8.3,1.2,trim)
box('Entry arch lintel',0,3.8,10.65,3.6,.7,.7,trim)
for x in [-1.65,1.65]:box('Entry stone column',x,1.7,10.65,.4,3.4,.7,trim)
box('Guild double oak door',0,1.6,10.9,2.9,3.2,.18,timber)
for x in [-.14,.14]:box('Guild door handle',x,1.5,10.73,.08,.4,.09,gold)
for x in [-4,4]:banner(x,10.35);box('Guild clerestory',x,7,10.9,1.3,.8,.1,glass)
box('Guild sign backing',0,5.6,10.75,4.9,.8,.22,timber)
for x in [-7,7]:
 box('Planter',x,.35,8,1.2,.7,1.2,stone)
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=(x,-8,1.35));bpy.context.object.data.materials.append(mat('Garden green '+str(x),(.16,.29,.14)))
# Original dressed-stone facade, curved voussoirs and warm lanterns.
def arch(x,z,r,y):
 for i in range(13):
  a=i*math.pi/13;b=(i+1)*math.pi/13
  verts=[(x+rr*math.cos(t),y+rr*math.sin(t),zz) for zz in [z-.16,z+.16] for rr,t in [(r,a),(r,b),(r+.28,b),(r+.28,a)]]
  mesh('Carved arch stone',verts,[(0,1,2,3),(4,7,6,5),(0,4,5,1),(2,6,7,3)],trim)
for x in [-4,4]:
 arch(x,10.68,.8,6.8)
 for y in [1,2,3,4,5,6,7]:
  box('Buttress course',x*1.45,y,10.02,.76,.07,1.3,stone)
arch(0,10.28,1.75,3.25)
for y in [.35,3.4,7.8]:box('Guild facade cornice',0,y,10.5,12.6,.19,.5,trim)
for y in [1,2,4,5,6,7]:
 for x in [-5,-3,3,5]:box('Masonry joint',x,y,10.98,1.8,.035,.025,trim)
leaf=mat('Town garden foliage',(.22,.36,.105))
for x in [-10,10]:
 for z in [1,7]:
  box('Garden border',x,.3,z,2,.6,2,trim)
  box('Garden trunk',x,1.7,z,.28,2.8,.28,timber)
  for dx,dy,dz,r in [(0,3,0,1.35),(-.6,2.7,.3,.9),(.7,3.4,-.2,1)]:
   bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=r,location=(x+dx,-z-dz,dy));bpy.context.object.name='Garden canopy';bpy.context.object.data.materials.append(leaf)
  box('Lantern post',x-1.5,1.8,z,.12,3.6,.12,timber)
  box('Lantern brass housing',x-1.5,3.45,z,.46,.75,.46,gold)
  box('Lantern warm glass',x-1.5,3.45,z-.25,.31,.52,.025,glass)
  box('Lantern cap',x-1.5,3.86,z,.62,.12,.62,timber)
# A raised perimeter pavement frames the unobstructed approach to the hall.
for x in [-11.7,11.7]:box('Perimeter curb',x,.12,2,.3,.24,19,trim)
for x in [-8,8]:
 box('Stone bench seat',x,.65,5,2.4,.2,.7,trim)
 for dx in [-.8,.8]:box('Stone bench foot',x+dx,.3,5,.3,.6,.6,stone)
save('beginnings_gate_square')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
# Portal authored at origin; runtime places it across the final corridor.
for x in [-3.3,3.3]:box('Exit carved jamb',x,2,0,.65,4,1.1,trim)
box('Exit lintel',0,4,0,7.25,.65,1.1,trim)
for x in [-3.65,3.65]:box('Exit passage wall',x,2,-2,.55,4,4,stone)
box('Exit passage ceiling',0,4.2,-2,6.5,.45,4,stone)
box('Exit passage floor',0,-.04,-2,6.5,.08,4,stone)
for x in [-3.7,3.7]:
 for z in [-1,-3]:box('Hallway pilaster',x,2,z,.6,4,.35,trim)
save('cavern_exit_portal')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
box('Sliding stone door',0,2,0,5.9,4,.5,stone)
for y in [.2,3.7]:box('Door carved border',0,y,-.3,5.6,.13,.1,trim)
for x in [-2.65,2.65]:box('Door carved border',x,2,-.3,.13,3.6,.1,trim)
box('Door crest',0,2,-.31,.13,1.3,.1,gold);box('Door crest cross',0,2.3,-.32,.7,.13,.1,gold)
save('cavern_exit_door')
