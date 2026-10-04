"""Miswag White Friday, concept 2: a white gift box tied with a Miswag-red satin ribbon («بيّض وجهك»).

The box is a base and a slightly larger lid in matte white paper. The ribbon wraps both ways and ties in a bow:
two loops, a knot and two notched tails. The loops and tails are swept bands built here, not modelled by hand.
The floor is a shadow catcher, so the PNG keeps the soft contact shadow on a transparent background.

Usage: bvenv/bin/python gift.py <out.png> [percent] [samples]
"""
import math
import os
import sys

import bpy  # must come before bmesh / mathutils when Blender runs as a Python module
import bmesh
from mathutils import Euler, Matrix, Vector

OUT = sys.argv[1]
PCT = int(sys.argv[2]) if len(sys.argv) > 2 else 100
SAMPLES = int(sys.argv[3]) if len(sys.argv) > 3 else 160

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 8
sc.render.film_transparent = True
sc.render.resolution_x = sc.render.resolution_y = 1400
sc.render.resolution_percentage = PCT
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"
sc.view_settings.view_transform = "AgX"
try:
    sc.view_settings.look = "AgX - Punchy"
except TypeError:
    pass

ROOT = bpy.data.objects.new("gift", None)
sc.collection.objects.link(ROOT)


def link(o):
    if o.name not in sc.collection.objects:
        sc.collection.objects.link(o)
    o.parent = ROOT
    return o


# ---------- materials ----------
def principled(name, color, rough, **kw):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    for k, v in kw.items():
        b.inputs[k].default_value = v
    return m, b


paper, pb = principled("paper", (0.86, 0.86, 0.87, 1), 0.62)
nt = paper.node_tree
noise = nt.nodes.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value = 220
noise.inputs["Detail"].default_value = 6
bump = nt.nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.05
nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
nt.links.new(bump.outputs["Normal"], pb.inputs["Normal"])
# Miswag red #de1c24, satin
satin, sb = principled("satin", (0.5, 0.006, 0.01, 1), 0.32, **{"Anisotropic": 0.6, "Sheen Weight": 0.12})
sb.inputs["Sheen Tint"].default_value = (1, 0.2, 0.2, 1)


# ---------- box ----------
def box(name, size, loc, mat, bevel=0.012):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    md = o.modifiers.new("bevel", "BEVEL")
    md.width, md.segments = bevel, 4
    o.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return link(o)


W, H, LID, LH = 1.0, 0.56, 1.045, 0.19
box("base", (W, W, H), (0, 0, H / 2), paper)
box("lid", (LID, LID, LH), (0, 0, H - 0.06 + LH / 2), paper, 0.01)
TOP = H - 0.06 + LH  # top of the lid
RW, RT = 0.13, 0.008  # ribbon width, thickness
for axis in ("x", "y"):
    # the band over the lid and down both sides, stepping in from the lid to the base
    sx, sy = (LID + 2 * RT, RW) if axis == "x" else (RW, LID + 2 * RT)
    box(f"band_top_{axis}", (sx, sy, RT), (0, 0, TOP + RT / 2), satin, 0.002)
    for s in (-1, 1):
        if axis == "x":
            box(f"band_lid_{axis}{s}", (RT, RW, LH), (s * (LID / 2 + RT / 2), 0, TOP - LH / 2), satin, 0.002)
            box(f"band_base_{axis}{s}", (RT, RW, H - 0.06), (s * (W / 2 + RT / 2), 0, (H - 0.06) / 2), satin, 0.002)
        else:
            box(f"band_lid_{axis}{s}", (RW, RT, LH), (0, s * (LID / 2 + RT / 2), TOP - LH / 2), satin, 0.002)
            box(f"band_base_{axis}{s}", (RW, RT, H - 0.06), (0, s * (W / 2 + RT / 2), (H - 0.06) / 2), satin, 0.002)


# ---------- bow: bands swept along paths ----------
def band(name, pts, width_dir, width=RW, thick=RT, notch=False):
    """A ribbon: rectangle (width x thick) swept along pts; width_dir(i, tangent) gives the across-ribbon vector."""
    bm = bmesh.new()
    rings = []
    n = len(pts)
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
        wv = width_dir(i, t).normalized()
        nv = t.cross(wv).normalized()
        hw = width / 2
        cut = 0.0
        if notch and i == n - 1:
            cut = 1.0
        ring = []
        for a, b in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
            q = p + wv * (a * hw) + nv * (b * thick / 2)
            if cut and a == 0:
                pass
            ring.append(bm.verts.new(q))
        rings.append(ring)
    for r0, r1 in zip(rings, rings[1:]):
        for k in range(4):
            bm.faces.new((r0[k], r0[(k + 1) % 4], r1[(k + 1) % 4], r1[k]))
    bm.faces.new(rings[0][::-1])
    if notch:
        # V-notch at the end: pull the middle of the last edge back
        last = rings[-1]
        mid_top = bm.verts.new((last[2].co + last[3].co) / 2 - (pts[-1] - pts[-2]).normalized() * width * 0.45)
        mid_bot = bm.verts.new((last[0].co + last[1].co) / 2 - (pts[-1] - pts[-2]).normalized() * width * 0.45)
        bm.faces.new((last[0], mid_bot, mid_top, last[3]))
        bm.faces.new((mid_bot, last[1], last[2], mid_top))
    else:
        bm.faces.new(rings[-1])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    o.data.materials.append(satin)
    for f in o.data.polygons:
        f.use_smooth = True
    sc.collection.objects.link(o)
    return link(o)


Z0 = TOP + 0.05  # knot height


def loop_pts(direction, rise, length=0.42, height=0.16, steps=110):
    """A bow loop: out along `direction`, up and over, and back under to the knot."""
    pts = []
    for i in range(steps + 1):
        th = 2 * math.pi * i / steps
        x = length / 2 * (1 - math.cos(th))
        z = height * math.sin(th) if th <= math.pi else 0.3 * height * math.sin(th)
        z += x * math.tan(rise)
        pts.append(Vector((direction.x * x, direction.y * x, Z0 + z)))
    return pts


for ang in (math.radians(-8), math.radians(152)):  # loops out to the left and right as the camera sees them
    d = Vector((math.cos(ang), math.sin(ang), 0))
    across = Vector((-d.y, d.x, 0))
    band(f"loop_{int(math.degrees(ang))}", loop_pts(d, math.radians(18)), lambda i, t, a=across: a, width=0.14)

for ang, ln in ((math.radians(-76), 0.58), (math.radians(-136), 0.52)):  # tails towards the camera
    d = Vector((math.cos(ang), math.sin(ang), 0))
    pts = []
    for i in range(41):
        u = i / 40
        drop = min(1.0, u * 2.6)
        zz = (Z0 - 0.02) + ((TOP + RT * 1.6) - (Z0 - 0.02)) * (1 - (1 - drop) ** 2)
        pts.append(Vector((d.x * ln * u, d.y * ln * u, zz)))
    band(f"tail_{int(math.degrees(ang))}", pts, lambda i, t: Vector((0, 0, 1)).cross(t), width=0.12, notch=True)

knot = box("knot", (0.13, 0.16, 0.08), (0, 0, Z0 - 0.002), satin, 0.03)

ROOT.rotation_euler = Euler((0, 0, math.radians(20)))

# ---------- floor (shadow only) ----------
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
floor = bpy.context.active_object
floor.is_shadow_catcher = True

# ---------- light ----------
w = bpy.data.worlds.new("w")
sc.world = w
w.use_nodes = True
w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.62, 0.62, 0.64, 1)
w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.7


def area(name, loc, size, power):
    d = bpy.data.lights.new(name, "AREA")
    d.size, d.energy = size, power
    o = bpy.data.objects.new(name, d)
    o.location = Vector(loc)
    o.rotation_euler = (Vector((0, 0, 0.4)) - o.location).to_track_quat("-Z", "Y").to_euler()
    sc.collection.objects.link(o)


area("key", (-3.0, -2.4, 4.2), 3.2, 760)
area("fill", (3.4, -2.6, 1.8), 2.6, 260)
area("rim", (1.2, 3.6, 3.0), 2.2, 520)

# ---------- camera ----------
cd = bpy.data.cameras.new("cam")
cd.lens = 70
cam = bpy.data.objects.new("cam", cd)
cam.location = Vector((0.0, -4.1, 2.8))
cam.rotation_euler = (Vector((0, 0, 0.36)) - cam.location).to_track_quat("-Z", "Y").to_euler()
sc.collection.objects.link(cam)
sc.camera = cam

sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("wrote", OUT)
