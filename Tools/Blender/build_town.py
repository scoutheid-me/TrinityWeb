"""Original lightweight town facade and stone exit, in Trinity metres/Y-up exports."""
from pathlib import Path
import bpy, math, random
random.seed(904)
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
# Metre-scaled paving texture supplies the joints without overlay strips.
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
# Recessed window frames, planked doors and battlement towers establish a lived-in guild.
for x in [-8,8]:
 box('Guild stair tower',x,6,16,3.6,12,7,stone)
 for y in [.4,4,8,11.7]:box('Tower cornice',x,y,16,3.95,.22,7.35,trim)
 for dx in [-1.4,0,1.4]:box('Tower merlon',x+dx,12.5,12.5,.75,1.2,.75,trim)
 for y in [3,6.7,9.7]:
  box('Tower window recess',x,y,12.44,1.25,1.8,.06,timber)
  box('Tower amber window',x,y,12.38,.87,1.47,.05,glass)
  box('Window mullion',x,y,12.31,.055,1.5,.04,gold)
  box('Window transom',x,y,12.31,.92,.055,.04,gold)
  arch(x,12.36,.68,y+.86)
for x in [-16,16,-14,14]:
 z=0 if abs(x)==16 else 13
 for dx in [-1.8,1.8]:
  for side in [-.6,.6]:box('Window carved surround',x+dx+side,4.7,z-3.21,.12,1.6,.2,timber)
  box('Window sill',x+dx,3.95,z-3.26,1.5,.13,.38,trim)
  box('Window mullion',x+dx,4.7,z-3.2,.05,1.3,.09,timber)
  box('Window transom',x+dx,4.7,z-3.2,1,.05,.09,timber)
 for y in [.25,2.85]:box('House stone footing',x,y,z-3.12,7,.3,.24,stone)
for x in [-1.2,-.8,-.4,0,.4,.8,1.2]:box('Entry door plank',x,1.6,10.77,.365,3.05,.12,timber)
for y in [.5,2.5]:box('Entry iron strap',0,y,10.68,2.8,.095,.075,gold)
# Subdivided cloth folds retain a readable burgundy/gold silhouette.
for ob in list(bpy.context.scene.objects):
 if ob.name.startswith('Hanging guild banner'):
  bpy.data.objects.remove(ob,do_unlink=True)
for x in [-4,4]:
 verts=[]
 for row in range(8):
  for col in range(9):
   xx=(col/8-.5)*1.4;y=6.1-row*.38-(.3*(1-abs(xx)/.7) if row==7 else 0);z=10.30+math.sin(col*.95)*.10+math.sin(row*.6)*.07
   verts.append((x+xx,y,z))
 faces=[(r*9+c,r*9+c+1,(r+1)*9+c+1,(r+1)*9+c) for r in range(7) for c in range(8)]
 mesh('Folded woven guild banner',verts,faces,cloth)
# More varied crowns, flowers and climbing greenery, using a shared material palette.
leaves=[mat('Foliage '+str(i),c) for i,c in enumerate([(.12,.23,.055),(.23,.34,.08),(.32,.42,.12),(.18,.29,.075)])]
for ob in list(bpy.context.scene.objects):
 if ob.name.startswith(('Garden canopy','Icosphere')):bpy.data.objects.remove(ob,do_unlink=True)
for x in [-10,10]:
 for z in [1,7]:
  for i in range(24):
   a=random.random()*math.tau;r=random.random()*1.3;yy=2.5+random.random()*1.6
   bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.35+random.random()*.4,location=(x+math.cos(a)*r,-z+math.sin(a)*r,yy));bpy.context.object.data.materials.append(leaves[i%4])
for x in [-7,7]:
 for i in range(18):
  bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.25,location=(x+random.uniform(-.45,.45),-8+random.uniform(-.45,.45),.8+random.random()*.45));bpy.context.object.data.materials.append(leaves[i%4])
for x in [-5.3,5.3]:
 for i in range(24):
  bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.19,location=(x+math.sin(i*.5)*.35,-10.4, .5+i*.2));bpy.context.object.data.materials.append(leaves[i%4])
# Soft bevels catch light without adding large texture or draw-call budgets.
for ob in list(bpy.context.scene.objects):
 if ob.type=='MESH' and len(ob.data.polygons)==6 and min(ob.dimensions)>.09:
  bpy.context.view_layer.objects.active=ob;mod=ob.modifiers.new('Crafted edges','BEVEL');mod.width=min(.045,min(ob.dimensions)*.12);mod.segments=2;bpy.ops.object.modifier_apply(modifier=mod.name)
exec((ROOT/'Tools/Blender/town_surfaces.py').read_text(encoding='utf-8'))
finish_town(ROOT)
# Keep windows and lanterns gently luminous at dusk.
p=glass.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(1,.49,.12,1);p.inputs['Emission Strength'].default_value=.2
save('beginnings_gate_square')
# Town-only passes must not rewrite the unrelated exit assets.
if '--town-only' in __import__('sys').argv:raise SystemExit(0)
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
