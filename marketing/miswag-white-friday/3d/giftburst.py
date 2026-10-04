"""Miswag White Friday (2.5D), concept 2: «بيّض وجهك». The white gift box opening on the Miswag-red sweep: the lid,
still tied with its red bow, lifts off and tilts, warm light spills out of the box, and a little confetti flies.

Usage: bvenv/bin/python giftburst.py <out.png> [percent] [samples]
"""
import math
import os
import random
import sys

import bpy  # must come before bmesh / mathutils when Blender runs as a Python module
import bmesh
from mathutils import Euler, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import giftbox  # noqa: E402
import studio  # noqa: E402

OUT = sys.argv[1]
PCT = int(sys.argv[2]) if len(sys.argv) > 2 else 100
SAMPLES = int(sys.argv[3]) if len(sys.argv) > 3 else 192
sc = studio.setup(PCT, SAMPLES)
studio.cyclorama(sc)
random.seed(7)

# ---------- the box, opened: base stays, the lid group flies ----------
root = giftbox.build(sc)
H = 0.56
base = bpy.data.objects["base"]
base.modifiers.clear()
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.045 + 0.35))
inner = bpy.context.active_object
inner.scale = (0.93, 0.93, 0.7)
inner.hide_render = inner.hide_viewport = True
inner.parent = root  # turns with the box, so it only hollows the inside
bo = base.modifiers.new("hollow", "BOOLEAN")
bo.operation, bo.object = "DIFFERENCE", inner
bo.solver = "EXACT"
try:
    bo.material_mode = "TRANSFER"  # the cut faces take the inside material below
except AttributeError:
    pass
inner.data.materials.append(studio.material("tissue", (0.62, 0.015, 0.02, 1), 0.75))  # red tissue lining
base.data.materials.append(inner.data.materials[0])
bv = base.modifiers.new("bevel", "BEVEL")
bv.width, bv.segments, bv.limit_method = 0.01, 3, "ANGLE"
# warm light rising out of the open box
glow = bpy.data.lights.new("glow", "AREA")
glow.size, glow.energy, glow.color = 0.5, 28, (1.0, 0.9, 0.75)
go = bpy.data.objects.new("glow", glow)
go.location = (0, 0, 0.3)
go.rotation_euler = (math.radians(180), 0, 0)  # area lights shine down -Z; flip to shine up
go.visible_camera = False
sc.collection.objects.link(go)

lid = bpy.data.objects.new("lid_group", None)
lid.location = (0, 0, H - 0.06 + 0.19 / 2)
sc.collection.objects.link(lid)
bpy.context.view_layer.update()
for o in list(root.children):
    if o.name == "base" or o.name.startswith("band_base"):
        continue
    mw = o.matrix_world.copy()
    o.parent = lid
    o.matrix_world = mw
lid.location += Vector((0.12, 0.05, 0.5))
lid.rotation_euler = Euler((math.radians(-10), math.radians(16), math.radians(6)))
root.rotation_euler = Euler((0, 0, math.radians(18)))

silver = studio.material("silver_bit", (0.9, 0.9, 0.92, 1), 0.18, Metallic=1.0)

# confetti: white, red and silver paper bits in a cone above the box
conf_mats = [studio.material("conf_white", (0.9, 0.9, 0.9, 1), 0.45), studio.material("conf_red", (0.7, 0.01, 0.02, 1), 0.4),
             silver]
bpy.ops.mesh.primitive_cube_add(size=1)
proto = bpy.context.active_object
proto.scale = (0.07, 0.03, 0.004)
proto.hide_render = proto.hide_viewport = True
for i in range(34):
    t = random.random()
    z = 0.7 + t * 1.25
    r = 0.35 + t * 0.95
    a = random.uniform(0, 2 * math.pi)
    o = proto.copy()
    o.data = proto.data.copy()
    o.data.materials.append(conf_mats[i % 3])
    o.hide_render = o.hide_viewport = False
    o.location = (math.cos(a) * r, math.sin(a) * r * 0.6, z)
    o.rotation_euler = Euler([random.uniform(0, math.pi) for _ in range(3)])
    s = random.uniform(0.8, 1.4)
    o.scale = (0.07 * s, 0.03 * s, 0.004)
    sc.collection.objects.link(o)

studio.lights(sc, target=(0, 0, 0.7))
sc.view_settings.exposure = -0.45  # keep the white box shaded, not clipped
cam = studio.camera(sc, (1.8, -4.35, 1.95), (0.05, 0.12, 1.1), lens=50)
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = (cam.location - Vector((0, 0, 0.7))).length
cam.data.dof.aperture_fstop = 3.2

sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("wrote", OUT)
