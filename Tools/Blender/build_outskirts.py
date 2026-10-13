"""Walled town, discreet undercroft entrance and contiguous starter grassland."""
from pathlib import Path
import bpy,math,random
R=Path(__file__).resolve().parents[2]
random.seed(77)
exec((R/'Tools/Blender/build_town.py').read_text(encoding='utf-8').split("box('Town square'")[0])
# Thick enclosure; east gate is the only outdoor passage.
for x in [-20,20]:
 for a,b in ([(138,185)] if x<0 else [(138,156.4),(163.6,185)]):
  box('Town curtain wall',x,4,(a+b)/2,1.7,8,b-a,stone)
  for z in range(math.ceil(a),math.floor(b),2):box('Wall battlement',x,8.5,z,2,1,1,trim)
for z in [138,185]:
 box('Town end wall',0,4,z,40,8,1.7,stone)
 for x in range(-19,20,2):box('Wall battlement',x,8.5,z,1,1,2,trim)
# The cavern lies below the southwest wall: conceal its exposed roof behind an earth bank.
soil=mat('Mossy earth bank',(.19,.24,.12));grass=mat('Meadow grass',(.22,.34,.095));path=mat('Packed earth',(.40,.31,.18));bark=mat('Field bark',(.16,.105,.055));leaf=mat('Field foliage',(.16,.29,.075))
for x,z in [(-20,138),(20,138),(-20,185),(20,185),(20,153.8),(20,166.2)]:
 box('Watchtower',x,5,z,4.5,10,4.5,stone)
 for dx in [-1.6,0,1.6]:
  for dz in [-1.6,1.6]:box('Tower crenel',x+dx,10.5,z+dz,.9,1,.9,trim)
box('East gate lintel',20,6.8,160,2,1,7.2,trim)
for z in [156.4,163.6]:box('East gate pillar',20,3.4,z,2.1,6.8,.6,trim)
# Recessed roof and retaining wings over the existing underground stone door.
theta=math.atan2(.6,.8)
def entrance(n,lx,y,lz,w,h,d,m):
 o=box(n,-10.8+lx*.8+lz*.6,y,145.6-lx*.6+lz*.8,w,h,d,m);o.rotation_euler.z=-theta;return o
entrance('Undercroft earth roof',0,4.55,-3,8.7,1.1,7,soil)
for x in [-4,4]:entrance('Undercroft retaining wall',x,2,-2.5,1.2,4,7,stone)
entrance('Undercroft lintel cap',0,4.1,.2,8,.3,1,trim)
for x in [-3.4,3.4]:entrance('Undercroft lantern',x,2.7,.8,.24,.45,.25,glass)
# Continuous level meadow; generous terrain beyond the playable boundary hides the void.
box('Grassland earth',58,-.19,160,78,.32,76,grass)
box('East gate track',31,-.008,160,23,.04,6.8,path)
rock=mat('Weathered meadow rock',(.27,.30,.25))
for i in range(36):
 a=i*math.tau/36;x=52+math.cos(a)*27;z=160+math.sin(a)*27
 if x<29 and abs(z-160)<7:continue
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1,location=(x,-z,.9));o=bpy.context.object;o.name='Meadow boundary outcrop';o.scale=(random.uniform(1.7,3.1),random.uniform(1.6,2.5),random.uniform(1.3,2.5));o.rotation_euler.z=random.uniform(0,math.tau);o.data.materials.append(rock)
for i in range(42):
 x=random.uniform(28,90);z=random.uniform(126,194)
 if math.hypot(x-52,z-160)<25:continue
 box('Field tree trunk',x,2,z,.4,4,.4,bark)
 for dx,dy,dz,r in [(0,4.5,0,2),(.8,4,.4,1.5),(-.7,5,-.2,1.4)]:
  bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=r,location=(x+dx,-z-dz,dy));bpy.context.object.data.materials.append(leaf)
flowers=[mat('Meadow gold',(.8,.61,.15)),mat('Meadow lavender',(.45,.3,.56))]
for i in range(550):
 x=random.uniform(29,77);z=random.uniform(136,184)
 if math.hypot(x-52,z-160)>24 or (x<42 and abs(z-160)<3):continue
 h=random.uniform(.13,.32);mesh('Grass tuft',[(x-.12,0,z),(x,h,z),(x+.12,0,z),(x,0,z-.12),(x,h,z),(x,0,z+.12)],[(0,1,2),(3,4,5)],grass if i%8 else flowers[i%2])
exec((R/'Tools/Blender/town_surfaces.py').read_text(encoding='utf-8'));finish_town(R)
save('beginnings_outskirts')
