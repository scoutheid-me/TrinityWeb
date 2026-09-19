"""Create and render the Trinity smoke test using Blender's bundled Python."""

from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
BLEND_PATH = ROOT / "Assets" / "Test" / "Trinity_Headless_Test.blend"
PNG_PATH = ROOT / "Renders" / "Test" / "Trinity_Headless_Test.png"


def aim_at(obj, target=(0, 0, 0)):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def main():
    if not bpy.app.background:
        raise RuntimeError("Run this script with Blender --background --python.")

    for path in (BLEND_PATH, PNG_PATH):
        path.parent.mkdir(parents=True, exist_ok=True)

    # Remove every object, including the default cube, camera, and light.
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, location=(0, 0, 0))
    sphere = bpy.context.object
    sphere.name = "Trinity_Headless_Test"
    for polygon in sphere.data.polygons:
        polygon.use_smooth = True

    material = bpy.data.materials.new("Trinity_Test_Material")
    material.use_nodes = True
    material.diffuse_color = (0.035, 0.32, 0.48, 1.0)
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = material.diffuse_color
    shader.inputs["Roughness"].default_value = 0.32
    sphere.data.materials.append(material)

    scene = bpy.context.scene
    bpy.ops.object.camera_add(location=(3.5, -5.0, 2.5))
    camera = bpy.context.object
    camera.name = "Trinity_Test_Camera"
    camera.data.lens = 52
    aim_at(camera)
    scene.camera = camera

    for name, location, energy, size in (
        ("Key", (3, -4, 5), 700, 4),
        ("Fill", (-4, -2, 2), 350, 3),
        ("Rim", (1, 3, 3), 900, 3),
    ):
        bpy.ops.object.light_add(type="AREA", location=location)
        light = bpy.context.object
        light.name = "Trinity_Test_" + name
        light.data.energy = energy
        light.data.shape = "DISK"
        light.data.size = size
        aim_at(light)

    scene.world = bpy.data.worlds.new("Trinity_Test_World")
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.055, 0.07, 0.10, 1)
    background.inputs["Strength"].default_value = 0.4

    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 640
    scene.render.resolution_y = 640
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = str(PNG_PATH)
    scene.render.film_transparent = False

    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    bpy.ops.render.render(write_still=True)

    for path in (BLEND_PATH, PNG_PATH):
        if not path.is_file() or path.stat().st_size == 0:
            raise RuntimeError(f"Missing or empty output: {path}")
        print(f"VERIFIED: {path} ({path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
