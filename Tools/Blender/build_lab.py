"""Original Trinity prototype assets. Run with Blender --background --python."""
from pathlib import Path
import math
import bpy

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'art' / 'blender'
SOURCE.mkdir(parents=True, exist_ok=True)

def xyz(p):
    return (p[0], -p[2], p[1])

def material(name, color, metal=0, rough=.5, emission=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metal
    shader.inputs['Roughness'].default_value = rough
    shader.inputs['Emission Color'].default_value = (*color, 1)
    shader.inputs['Emission Strength'].default_value = emission
    return mat

def clear():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def cube(name, pos, scale, mat, bevel=.04, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=xyz(pos))
    obj = bpy.context.object
    obj.name = name
    obj.scale = (scale[0], scale[2], scale[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new('Soft crafted edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    obj.data.materials.append(mat)
    if parent:
        matrix = obj.matrix_world.copy()
        obj.parent = parent
        obj.matrix_world = matrix
    return obj

def sphere(name, pos, scale, mat, parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, location=xyz(pos))
    obj = bpy.context.object
    obj.name = name
    obj.scale = (scale[0], scale[2], scale[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    for poly in obj.data.polygons: poly.use_smooth = True
    if parent:
        matrix = obj.matrix_world.copy(); obj.parent = parent; obj.matrix_world = matrix
    return obj

def pivot(name, pos):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.location = xyz(pos)
    return obj

def cylinder(name, pos, radius, depth, mat, vertices=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=xyz(pos))
    obj = bpy.context.object; obj.name = name; obj.data.materials.append(mat)
    mod = obj.modifiers.new('Edge bevel', 'BEVEL'); mod.width=.035; mod.segments=2
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj

def export(name, category):
    directory = ROOT / 'public' / 'assets' / category
    directory.mkdir(parents=True, exist_ok=True)
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1
    bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE / (name + '.blend')))
    bpy.ops.export_scene.gltf(filepath=str(directory / (name + '.glb')), export_format='GLB', export_yup=True, export_apply=True, export_animations=False)
    print('TRINITY_ASSET', name, sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == 'MESH'), 'polygons')

exec((ROOT/'Tools/Blender/articulated_arms.py').read_text())

clear()
stone = material('shared_mat_ivory', (.52,.61,.66), rough=.72)
dark = material('shared_mat_slate', (.045,.105,.16), metal=.2)
gold = material('shared_mat_champagne', (.65,.43,.17), metal=.75, rough=.29)
cyan = material('shared_mat_aether', (.13,.8,1), metal=.25, rough=.25, emission=1.8)
silver = material('shared_mat_blade', (.68,.84,.9), metal=.85, rough=.22)
cloth = material('shared_mat_midnight', (.035,.085,.15), rough=.83)
white = material('shared_mat_coat', (.77,.83,.85), rough=.75)
skin = material('shared_mat_skin', (.72,.49,.37), rough=.8)
hair = material('shared_mat_hair', (.075,.11,.16), rough=.65)

# The blade points along runtime +Z; the grip point is the object origin.
cube('grip', (0,0,.03), (.075,.08,.28), dark, .02)
sphere('pommel', (0,0,-.14), (.07,.055,.07), gold)
cube('guard', (0,0,.2), (.46,.075,.10), gold, .035)
# Diamond cross-section blade, with a sharpened tip.
verts = [xyz(p) for p in [(-.085,0,.25),(0,.025,.25),(.085,0,.25),(0,-.025,.25),(-.065,0,1.13),(0,.022,1.13),(.065,0,1.13),(0,-.022,1.13),(0,0,1.43)]]
faces = [(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,8),(5,6,8),(6,7,8),(7,4,8),(3,2,1,0)]
mesh = bpy.data.meshes.new('blade_mesh'); mesh.from_pydata(verts, [], faces); mesh.update()
blade = bpy.data.objects.new('aether_blade_mesh', mesh); bpy.context.collection.objects.link(blade); blade.data.materials.append(silver)
cube('blade_channel', (0,.028,.7), (.016,.01,.82), cyan, .003)
sphere('guard_jewel', (0,.05,.21), (.045,.02,.045), cyan)
export('aether_sword', 'weapons')

for enemy in [False, True]:
    clear()
    body = dark if enemy else white
    accent = gold if enemy else cyan
    height = 1.18 if enemy else 1
    cube('torso', (0,1.25,0), (.56,.58,.32), body, .12)
    cube('chest_plate', (0,1.34,.18), (.4,.31,.07), gold if enemy else cloth, .06)
    sphere('aether_core', (0,1.37,.23), (.08,.095,.035), cyan)
    cube('belt', (0,.99,0), (.55,.10,.34), gold, .025)
    sphere('head', (0,1.82,0), (.22,.26,.21), dark if enemy else skin)
    if enemy:
        cube('visor', (0,1.85,.19), (.32,.055,.045), cyan, .018)
        cube('crest', (0,2.04,0), (.065,.23,.25), gold, .025)
    else:
        sphere('hair_cap', (0,1.95,-.045), (.24,.17,.23), hair)
        for i in range(7):
            strand = cube('hair_strand_' + str(i), ((i-3)*.062,1.96 + .015*(i%2),.115), (.09,.24,.1), hair, .035)
            strand.rotation_euler[1] = (i-3)*.10
        for x in [-.082,.082]: cube('eye', (x,1.84,.194), (.047,.035,.02), cyan, .009)
        cube('coat_tail_left', (-.19,.80,-.07), (.27,.36,.33), white, .04)
        cube('coat_tail_right', (.19,.80,-.07), (.27,.36,.33), white, .04)
    for side, x in [('left',-.4),('right',.4)]:
        if not enemy:
            articulated_arm(side,x,body,skin)
        else:
            arm = pivot(side + '_arm', (x,1.49,0))
            sphere(side + '_pauldron', (x,1.45,0), (.19,.19,.23), body, arm)
            cube(side + '_forearm', (x,1.1,.025), (.18,.44,.19), body, .07, arm)
            sphere(side + '_hand', (x,.85,.045), (.1,.115,.095), dark if enemy else skin, arm)
        leg = pivot(side + '_leg', (x*.48,.93,0))
        cube(side + '_leg_mesh', (x*.48,.57,0), (.21,.65,.23), cloth if not enemy else stone, .075, leg)
        cube(side + '_boot', (x*.48,.16,.08), (.24,.29,.39), dark, .06, leg)
    if enemy:
        # Enlarge source geometry and pivots together, preserving local animations.
        for obj in list(bpy.context.scene.objects):
            if obj.parent is None:
                obj.location *= height
                obj.scale *= height
    export('aether_sentinel' if enemy else 'wayfarer', 'enemies' if enemy else 'characters')

clear()
cylinder('column_plinth', (0,.15,0), .85,.3,dark)
cylinder('column_base', (0,.36,0), .64,.16,gold)
cylinder('column_shaft', (0,2.2,0), .44,3.6,stone)
cylinder('column_capital', (0,4.04,0), .69,.2,gold)
cube('column_crown', (0,4.28,0), (1.25,.3,1.25),stone,.06)
for i in range(4):
    angle = i*math.pi/2
    cube('column_inlay_'+str(i), (math.sin(angle)*.445,2.2,math.cos(angle)*.445), (.055,2.7,.055), gold,.01)
export('guild_column','environments')

clear()
cube('rack_base', (0,.1,0), (2.2,.2,.7),dark)
for x in [-.9,.9]: cube('rack_upright',(x,1,0),(.14,1.8,.16),gold)
for y in [.55,1.35]: cube('rack_rail',(0,y,0),(2,.1,.16),dark)
for x in [-.6,0,.6]:
    cube('practice_blade',(x,.95,.12),(.07,1.3,.08),silver,.01)
    cube('practice_guard',(x,1.45,.12),(.33,.07,.09),gold,.02)
export('weapon_rack','props')
