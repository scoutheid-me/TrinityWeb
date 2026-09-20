"""Original training armory. Shared grip origin, metric +Z-forward runtime exports."""
from pathlib import Path
import bpy, math
ROOT=Path(__file__).resolve().parents[2]
exec((ROOT/'Tools/Blender/build_lab.py').read_text().split('\nclear()\nstone =')[0])
silver=material('training_steel',(.55,.68,.72),.8,.3)
gold=material('training_brass',(.6,.39,.14),.65,.35)
wood=material('training_grip',(.07,.12,.15),0,.7)
def blade(length,width,curve=0):
    verts=[]
    for t in [0,.35,.7,1]:
        z=.2+length*t;x=curve*t*t;w=width*(1-.35*t)
        verts += [xyz((x-w,0,z)),xyz((x,.028,z)),xyz((x+w,0,z)),xyz((x,-.028,z))]
    verts.append(xyz((curve*1.2,0,.2+length+.18)))
    faces=[]
    for r in range(3):
        for j in range(4):faces.append((r*4+j,r*4+(j+1)%4,(r+1)*4+(j+1)%4,(r+1)*4+j))
    for j in range(4):faces.append((12+j,12+(j+1)%4,16))
    mesh=bpy.data.meshes.new('blade');mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new('training_blade',mesh);bpy.context.collection.objects.link(obj);obj.data.materials.append(silver)
for name in ['sword','rapier','greatsword']:
    clear()
    cube('grip',(0,0,-.03),(.08,.08,.5 if name=='greatsword' else .32),wood,.025)
    sphere('pommel',(0,0,-.22),(.06,.06,.06),gold)
    length,width={'sword':(1.05,.075),'rapier':(1.3,.025),'greatsword':(1.7,.12)}[name]
    cube('guard',(0,0,.17),(.42,.06,.08),gold,.02)
    if name=='rapier':sphere('cup_guard',(0,0,.16),(.15,.15,.07),gold)
    blade(length,width)
    export('training_'+name,'weapons')
