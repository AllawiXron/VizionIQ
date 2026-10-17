"""Miswag White Friday, concept 2: «بيّض وجهك». The gift box in a white room in late-afternoon sun, the light coming
through a shanasheel (the carved wooden window screens of old Baghdad houses) and laying its stars over the wall,
the floor and the box. The ribbon is the only strong colour.

The lattice is a gobo: an invisible plane between the sun and the room whose transparency is lattice.png.
Renders the full 4:5 frame (1620×2025 at 100%); ads.html sets the type over the wall.

Usage: bvenv/bin/python gift.py <out.png> [percent] [samples]
"""
import math
import os
import sys

import bpy  # must come before mathutils when Blender runs as a Python module
from mathutils import Euler, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import giftbox  # noqa: E402

OUT = sys.argv[1]
PCT = int(sys.argv[2]) if len(sys.argv) > 2 else 100
SAMPLES = int(sys.argv[3]) if len(sys.argv) > 3 else 192

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 8
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1620, 2025, PCT
sc.render.image_settings.file_format = "PNG"
sc.view_settings.view_transform = "AgX"
try:
    sc.view_settings.look = "AgX - Medium High Contrast"
except TypeError:
    pass
sc.view_settings.exposure = float(os.environ.get("EXPOSURE", "-0.1"))

gift = giftbox.build(sc)
gift.rotation_euler = Euler((0, 0, math.radians(24)))


def matte(name, color, rough=0.85):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    return m


# ---------- the room: a white floor and a white wall behind ----------
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
bpy.context.active_object.data.materials.append(matte("floor", (0.78, 0.77, 0.75, 1)))
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 1.35, 10), rotation=(math.radians(90), 0, 0))
bpy.context.active_object.data.materials.append(matte("wall", (0.8, 0.79, 0.77, 1)))

# ---------- sun through the shanasheel ----------
SUN_DIR = Vector((0.62, 0.52, -0.58)).normalized()  # the way the light travels: from the upper left, towards the wall
sd = bpy.data.lights.new("sun", "SUN")
sd.energy, sd.angle, sd.color = 9.0, math.radians(0.22), (1.0, 0.76, 0.52)
sun = bpy.data.objects.new("sun", sd)
sun.rotation_euler = SUN_DIR.to_track_quat("-Z", "Y").to_euler()
sc.collection.objects.link(sun)

gobo_c = Vector((0.6, 0.9, 0.34)) - SUN_DIR * 7.0  # the window of light lands on the box and the wall beside it
bpy.ops.mesh.primitive_plane_add(size=40, location=gobo_c)  # the window wall; the lattice image covers its middle 8 m
gobo = bpy.context.active_object
gobo.name = "shanasheel"
gobo.rotation_euler = SUN_DIR.to_track_quat("Z", "Y").to_euler()
gobo.visible_camera = False
gobo.visible_glossy = False
gm = bpy.data.materials.new("lattice")
gm.use_nodes = True
N, L = gm.node_tree.nodes, gm.node_tree.links
for n in list(N):
    N.remove(n)
o = N.new("ShaderNodeOutputMaterial")
mix = N.new("ShaderNodeMixShader")
wood = N.new("ShaderNodeBsdfDiffuse")
wood.inputs["Color"].default_value = (0.02, 0.012, 0.008, 1)
hole = N.new("ShaderNodeBsdfTransparent")
tex = N.new("ShaderNodeTexImage")
tex.image = bpy.data.images.load(os.path.join(HERE, "lattice.png"))
tex.image.colorspace_settings.name = "Non-Color"
tex.extension = "CLIP"
uv = N.new("ShaderNodeTexCoord")
mp = N.new("ShaderNodeMapping")
mp.inputs["Scale"].default_value = (5, 5, 1)
mp.inputs["Location"].default_value = (-2, -2, 0)
L.new(uv.outputs["UV"], mp.inputs["Vector"])
L.new(mp.outputs["Vector"], tex.inputs["Vector"])
L.new(tex.outputs["Color"], mix.inputs["Fac"])
L.new(wood.outputs["BSDF"], mix.inputs[1])
L.new(hole.outputs["BSDF"], mix.inputs[2])
L.new(mix.outputs["Shader"], o.inputs["Surface"])
gobo.data.materials.append(gm)

# cool sky fill, and a soft lift from the camera side so the shade side of the box keeps its shape
w = bpy.data.worlds.new("w")
sc.world = w
w.use_nodes = True
w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.5, 0.56, 0.68, 1)
w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.3
fd = bpy.data.lights.new("fill", "AREA")
fd.size, fd.energy, fd.color = 4.0, 110, (0.85, 0.9, 1.0)
fill = bpy.data.objects.new("fill", fd)
fill.location = Vector((1.8, -4.0, 1.6))
fill.rotation_euler = (Vector((0, 0, 0.4)) - fill.location).to_track_quat("-Z", "Y").to_euler()
sc.collection.objects.link(fill)

# ---------- camera ----------
cd = bpy.data.cameras.new("cam")
cd.lens = 58
cd.sensor_fit = "VERTICAL"
cd.sensor_height = 36
cam = bpy.data.objects.new("cam", cd)
cam.location = Vector((0.3, -6.6, 1.3))
cam.rotation_euler = (Vector((0.05, 0.6, 1.42)) - cam.location).to_track_quat("-Z", "Y").to_euler()
sc.collection.objects.link(cam)
sc.camera = cam

sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("wrote", OUT)
