"""Miswag White Friday (2.5D), concept 1: «خبّي قرشك الأبيض… لجمعتك البيضاء». A glossy white ceramic piggy bank on
the Miswag-red sweep, silver coins dropping into its slot (one half in, one still falling, with motion blur).

Usage: bvenv/bin/python piggy.py <out.png> [percent] [samples]
"""
import math
import os
import sys

import bpy  # must come before mathutils when Blender runs as a Python module
from mathutils import Euler, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import coinmesh  # noqa: E402
import studio  # noqa: E402

OUT = sys.argv[1]
PCT = int(sys.argv[2]) if len(sys.argv) > 2 else 100
SAMPLES = int(sys.argv[3]) if len(sys.argv) > 3 else 192
sc = studio.setup(PCT, SAMPLES)
studio.cyclorama(sc)

ceramic = studio.material("ceramic", (0.86, 0.86, 0.87, 1), 0.1, **{"Coat Weight": 1.0, "Coat Roughness": 0.04})
dark = studio.material("dark", (0.02, 0.012, 0.012, 1), 0.25)
eye = studio.material("eye", (0.01, 0.01, 0.012, 1), 0.05, **{"Coat Weight": 1.0})

PIG = bpy.data.objects.new("piggy", None)
sc.collection.objects.link(PIG)


def add(o, mat, smooth=True, bevel=0.0):
    o.data.materials.append(mat)
    if smooth:
        for f in o.data.polygons:
            f.use_smooth = True
    if bevel:
        md = o.modifiers.new("bevel", "BEVEL")
        md.width, md.segments = bevel, 4
    o.parent = PIG
    return o


BZ, SX, SY, SZ = 1.08, 1.16, 0.94, 0.9  # body centre height and radii
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=1, location=(0, 0, BZ))
body = bpy.context.active_object
body.scale = (SX, SY, SZ)
add(body, ceramic)

# snout, with nostrils
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.31, depth=0.34, location=(SX - 0.04, 0, BZ - 0.06), rotation=(0, math.radians(90), 0))
add(bpy.context.active_object, ceramic, bevel=0.07)
for s in (-1, 1):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.06, location=(SX + 0.13, s * 0.1, BZ - 0.06))
    n = bpy.context.active_object
    n.scale = (0.4, 0.8, 1.2)
    add(n, dark)
# ears
for s in (-1, 1):
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.27, radius2=0.03, depth=0.38, location=(0.42, s * 0.52, BZ + 0.76))
    e = bpy.context.active_object
    e.scale = (1, 0.5, 1)
    e.rotation_euler = Euler((s * math.radians(-26), math.radians(18), 0))
    add(e, ceramic, bevel=0.03)
# eyes
for s in (-1, 1):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.075, location=(SX * 0.8, s * 0.33, BZ + 0.36))
    add(bpy.context.active_object, eye)
# legs
for x in (-0.55, 0.55):
    for y in (-0.42, 0.42):
        bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.22, depth=0.42, location=(x, y, 0.21))
        add(bpy.context.active_object, ceramic, bevel=0.06)
# curly tail
bpy.ops.mesh.primitive_torus_add(major_radius=0.12, minor_radius=0.035, location=(-SX - 0.02, 0, BZ + 0.12), rotation=(0, math.radians(90), 0))
add(bpy.context.active_object, ceramic)
# the coin slot on top
bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.05, 0, BZ + SZ - 0.01))
slot = bpy.context.active_object
slot.scale = (0.72, 0.075, 0.06)
add(slot, dark, smooth=False, bevel=0.025)

PIG.rotation_euler = Euler((0, 0, math.radians(-32)))
bpy.context.view_layer.update()

# ---------- coins: one half into the slot, one still falling ----------
coin = coinmesh.build()
coin.name = "coin1"
cs = 0.34
slot_w = slot.matrix_world.translation
coins = []
for i, (dz, dx, tilt, spin) in enumerate([(0.12, 0.0, 0, 0), (0.84, 0.34, 16, 28)]):
    c = coin if i == 0 else coin.copy()
    if i:
        c.name = f"coin{i + 1}"
        sc.collection.objects.link(c)
    c.scale = (cs, cs, cs)
    # stood on edge along the slot (the slot runs along the pig's x axis)
    c.rotation_euler = Euler((math.radians(90 + tilt), math.radians(spin), math.radians(-32)))
    c.location = slot_w + Vector((dx, 0, dz + cs * 0.15))
    coins.append(c)
sc.frame_set(1)
for i, c in enumerate(coins[1:], 1):
    base = c.location.copy()
    for f, k in ((0, -1), (1, 0), (2, 1)):
        c.location = base - Vector((0, 0, 0.14 * k))
        c.keyframe_insert("location", frame=f)
sc.render.use_motion_blur = True
sc.render.motion_blur_shutter = 0.5
sc.frame_set(1)

studio.lights(sc, target=(0, 0, 1.4))
studio.camera(sc, (2.3, -6.2, 2.75), (0.1, 0.25, 1.86), lens=46)  # the pig low and large, clean red above it for the line

sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("wrote", OUT)
