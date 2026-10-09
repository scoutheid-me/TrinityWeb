"""Original static town guide with tailored clothing; independent of the combat rig."""
from pathlib import Path
import bpy,math
ROOT=Path(__file__).resolve().parents[2]
exec((ROOT/'Tools/Blender/build_lab.py').read_text(encoding='utf-8').split('\nclear()\nstone =')[0])
clear()
skin=material('mira warm skin',(.68,.42,.28),rough=.7);cloth=material('mira forest mantle',(.045,.14,.12),rough=.92);cream=material('mira linen',(.66,.60,.42),rough=.95);leather=material('mira chestnut leather',(.19,.085,.04),rough=.75);hair=material('mira chestnut hair',(.12,.045,.018),rough=.85);gold=material('mira bronze',(.59,.37,.12),metal=.5);white=material('mira eye white',(.84,.81,.7));iris=material('mira amber eyes',(.18,.09,.025));black=material('mira pupils',(.012,.009,.007))
# Anatomical proportions: narrow shoulders, shaped torso, small head, long legs.
sphere('mira torso',(0,1.17,0),(.21,.29,.125),cream)
sphere('mira hips',(0,.91,0),(.20,.16,.13),leather)
cylinder('mira neck',(0,1.51,0),.055,.15,skin,16)
sphere('mira face',(0,1.67,.012),(.137,.177,.115),skin)
sphere('mira hair crown',(0,1.76,-.035),(.145,.11,.127),hair)
for i in range(9):
 x=(i-4)*.033;o=sphere('mira swept fringe',(x,1.77-abs(x)*.4,.088),(.025,.083,.03),hair);o.rotation_euler.y=(i-4)*.11
for x in [-.13,.13]:sphere('mira temple hair',(x,1.66,-.01),(.024,.14,.07),hair)
sphere('mira tied hair',(0,1.57,-.14),(.065,.19,.065),hair);sphere('mira hair tie',(0,1.66,-.15),(.069,.025,.064),gold)
for x in [-.052,.052]:
 sphere('mira eyes',(x,1.692,.119),(.033,.016,.012),white);sphere('mira iris',(x,1.69,.129),(.013,.014,.005),iris);sphere('mira pupil',(x,1.69,.134),(.006,.01,.003),black);sphere('mira eye light',(x-.004,1.695,.137),(.003,.004,.002),white)
 cube('mira brows',(x,1.72,.119),(.049,.008,.008),hair,.003)
sphere('mira nose',(0,1.644,.127),(.014,.024,.017),skin);cube('mira lips',(0,1.603,.121),(.037,.005,.005),leather,.002)
for x in [-.135,.135]:sphere('mira ears',(x,1.66,0),(.021,.036,.028),skin)
for x in [-.245,.245]:
 sphere('mira sleeve',(x,1.3,0),(.078,.155,.095),cloth)
 sphere('mira forearm',(x*1.14,1.04,.015),(.043,.145,.047),skin)
 cube('mira bracer',(x*1.14,.99,.02),(.09,.11,.10),leather,.02)
 sphere('mira palm',(x*1.16,.866,.018),(.042,.067,.035),skin)
 for i in range(4):sphere('mira fingers',(x*1.16+(i-1.5)*.016,.82,.028),(.009,.035,.013),skin)
 sphere('mira leggings',(x*.43,.55,0),(.075,.31,.077),leather)
 cube('mira tall boots',(x*.43,.25,.005),(.14,.37,.16),leather,.045)
 cube('mira boot toes',(x*.43,.065,.07),(.15,.12,.25),leather,.035)
# Draped mantle and skirt use shaped rings rather than block armor.
def garment(name,rings,mat,open_front=False):
 verts=[];N=24
 for yy,rx,rz in rings:
  for i in range(N):
   a=math.tau*i/N;wave=1+.045*math.cos(i*math.pi/2);verts.append(xyz((rx*math.sin(a)*wave,yy,rz*math.cos(a)*wave)))
 faces=[]
 for r in range(len(rings)-1):
  for i in range(N):
   if open_front and (i<4 or i>N-5):continue
   faces.append((r*N+i,r*N+(i+1)%N,(r+1)*N+(i+1)%N,(r+1)*N+i))
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);me.materials.append(mat)
 for p in me.polygons:p.use_smooth=True
 mod=o.modifiers.new('Fabric thickness','SOLIDIFY');mod.thickness=.008;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
garment('mira pleated tunic',[(1.04,.17,.13),(.86,.22,.15),(.68,.24,.17)],cloth)
garment('mira travel mantle',[(1.51,.07,.07),(1.37,.28,.17),(1.10,.25,.16),(.68,.27,.19)],cloth,True)
cube('mira belt',(0,1.03,0),(.36,.05,.28),leather,.015);cube('mira buckle',(0,1.03,.151),(.07,.065,.018),gold,.008)
sphere('mira clasp',(-.1,1.39,.13),(.022,.026,.01),gold)
cube('mira satchel',(-.20,.93,.025),(.095,.16,.135),leather,.024)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender/mira_guide.blend'))
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=next(o for o in bpy.context.scene.objects if o.type=='MESH');bpy.ops.object.join()
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets/characters/mira_guide.glb'),export_format='GLB',export_apply=True)
