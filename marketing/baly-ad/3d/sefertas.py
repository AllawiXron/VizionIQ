"""Baly ad — hero render. An Iraqi enamel سفرطاس (stacked lunch carrier) exploded along its carry frame on a
Baly-blue stage; instead of rice and stew each tier holds a Baly service: a burger, a toy taxi, a parcel, a gift card.
A paper tag on the handle: من: أمك · إلى: الدوام · التوصيل: ٢٧ دقيقة.

Usage: bvenv/bin/python sefertas.py <out.png> [percent] [samples]
"""
import math
import os
import random
import sys

import bpy  # must come before bmesh / mathutils when Blender runs as a Python module
import bmesh
from mathutils import Euler, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
PCT = int(sys.argv[2]) if len(sys.argv) > 2 else 100
SAMPLES = int(sys.argv[3]) if len(sys.argv) > 3 else 128
random.seed(3)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1620, 2025, PCT
sc.view_settings.view_transform = "AgX"
try:
    sc.view_settings.look = os.environ.get("LOOK", "AgX - Punchy")
except TypeError:
    pass
sc.view_settings.exposure = float(os.environ.get("EXPOSURE", "-1.1"))


def tex_path(name):
    return os.path.join(HERE, name)


def mat(name, color, rough=0.5, metal=0.0, coat=0.0, sss=0.0, img=None, bump=0.0, bump_scale=40.0, alpha=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if coat:
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = 0.05
    if sss:
        b.inputs["Subsurface Weight"].default_value = sss
        b.inputs["Subsurface Scale"].default_value = 0.02
    if img:
        t = nt.nodes.new("ShaderNodeTexImage")
        t.image = bpy.data.images.load(tex_path(img))
        t.interpolation = "Cubic"
        nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
        if alpha:
            nt.links.new(t.outputs["Alpha"], b.inputs["Alpha"])
    if bump:
        n = nt.nodes.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = bump_scale
        n.inputs["Detail"].default_value = 6
        bn = nt.nodes.new("ShaderNodeBump")
        bn.inputs["Strength"].default_value = bump
        nt.links.new(n.outputs["Fac"], bn.inputs["Height"])
        nt.links.new(bn.outputs["Normal"], b.inputs["Normal"])
    return m


def link(ob):
    sc.collection.objects.link(ob)
    return ob


def smooth(ob):
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def bevel(ob, w, segs=3):
    b = ob.modifiers.new("bevel", "BEVEL")
    b.width, b.segments = w, segs
    return ob


def textured_box(name, size, loc, rot, mats):
    """Box whose six faces each get their own material and a 0..1 UV (front = -Y)."""
    sx, sy, sz = (s / 2 for s in size)
    faces = {
        "front": [(-1, -1, -1), (1, -1, -1), (1, -1, 1), (-1, -1, 1)],
        "back": [(1, 1, -1), (-1, 1, -1), (-1, 1, 1), (1, 1, 1)],
        "left": [(-1, 1, -1), (-1, -1, -1), (-1, -1, 1), (-1, 1, 1)],
        "right": [(1, -1, -1), (1, 1, -1), (1, 1, 1), (1, -1, 1)],
        "top": [(-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)],
        "bottom": [(-1, 1, -1), (1, 1, -1), (1, -1, -1), (-1, -1, -1)],
    }
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    lay = bm.loops.layers.uv.new()
    cache = {}
    for i, (fname, cs) in enumerate(faces.items()):
        vs = [cache.setdefault(c, bm.verts.new((c[0] * sx, c[1] * sy, c[2] * sz))) for c in cs]
        f = bm.faces.new(vs)
        f.material_index = i
        for loop, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
            loop[lay].uv = t
        me.materials.append(mats.get(fname, mats["default"]))
    bm.to_mesh(me)
    bm.free()
    ob = link(bpy.data.objects.new(name, me))
    ob.location, ob.rotation_euler = loc, rot
    return ob


def cyl(name, r, h, loc, m, rot=(0, 0, 0), verts=64, bev=0.0):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=verts)
    ob = bpy.context.active_object
    ob.name = name
    ob.data.materials.append(m)
    if bev:
        bevel(ob, bev, 3)
        smooth(ob)
    return ob


def sphere(name, r, loc, m, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = scale
    ob.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return ob


def cut_below(ob, axis, limit=-0.0001):
    """Delete the vertices of ob's mesh whose local coordinate on `axis` is below `limit` (bmesh, no edit mode)."""
    bm_ = bmesh.new()
    bm_.from_mesh(ob.data)
    bmesh.ops.delete(bm_, geom=[v for v in bm_.verts if v.co[axis] < limit], context="VERTS")
    bm_.to_mesh(ob.data)
    bm_.free()
    ob.data.update()


# ---------------- stage ----------------
STAGE = tuple(float(v) for v in os.environ.get("STAGE", "0.0,0.056,1.0").split(","))
stage_m = mat("stage", STAGE, rough=0.7)
me = bpy.data.meshes.new("cove")
bm = bmesh.new()
prof = [(-8.0, 0.0), (1.0, 0.0)]
R_ = 1.4
for i in range(1, 13):
    a = math.radians(90 * i / 12)
    prof.append((1.0 + R_ * math.sin(a), R_ * (1 - math.cos(a))))
prof.append((1.0 + R_, 9.0))
rows = [[bm.verts.new((x, y, z)) for y, z in prof] for x in (-9.0, 9.0)]
for i in range(len(prof) - 1):
    bm.faces.new((rows[0][i], rows[1][i], rows[1][i + 1], rows[0][i + 1]))
bm.to_mesh(me)
bm.free()
cove = smooth(link(bpy.data.objects.new("cove", me)))
cove.data.materials.append(stage_m)

# ---------------- the sefertas, exploded: tiers float in a gentle zigzag ----------------
R = 0.14       # tier radius
H = 0.10       # tier height
enamel_band = mat("enamel_band", (1, 1, 1), rough=0.18, coat=0.6, img="band.png")
enamel = mat("enamel", (0.93, 0.92, 0.88), rough=0.2, coat=0.6)
cobalt = mat("cobalt", (0.01, 0.04, 0.55), rough=0.2, coat=0.6)
steel = mat("steel", (0.8, 0.8, 0.82), rough=0.22, metal=1.0)


def holder(name, loc, rot):
    e = link(bpy.data.objects.new(name, None))
    e.location, e.rotation_euler = loc, rot
    return e


def parent(ob, e):
    ob.parent = e
    return ob


def tier(idx, e):
    n = 96
    me = bpy.data.meshes.new(f"tier{idx}")
    bm = bmesh.new()
    lay = bm.loops.layers.uv.new()
    lo = [bm.verts.new((R * math.cos(2 * math.pi * k / n), R * math.sin(2 * math.pi * k / n), 0)) for k in range(n)]
    hi = [bm.verts.new((R * math.cos(2 * math.pi * k / n), R * math.sin(2 * math.pi * k / n), H)) for k in range(n)]
    for k in range(n):
        k2 = (k + 1) % n
        f = bm.faces.new((lo[k], lo[k2], hi[k2], hi[k]))
        u0, u1 = k / n * 2.5, (k + 1) / n * 2.5
        for loop, t in zip(f.loops, ((u0, 0), (u1, 0), (u1, 1), (u0, 1))):
            loop[lay].uv = t
    bottom = bm.faces.new(list(reversed(lo)))
    bottom.material_index = 1
    bm.to_mesh(me)
    bm.free()
    ob = smooth(link(bpy.data.objects.new(f"tier{idx}", me)))
    ob.data.materials.append(enamel_band)
    ob.data.materials.append(enamel)
    sol = ob.modifiers.new("solid", "SOLIDIFY")
    sol.thickness, sol.offset, sol.material_offset = 0.004, -1, 1
    parent(ob, e)
    bpy.ops.mesh.primitive_torus_add(major_radius=R - 0.001, minor_radius=0.0055, location=(0, 0, H), major_segments=96, minor_segments=12)
    rim = bpy.context.active_object
    rim.data.materials.append(cobalt)
    bpy.ops.object.shade_smooth()
    parent(rim, e)
    for sx in (-1, 1):
        lug = bevel(textured_box(f"lug{idx}{sx}", (0.026, 0.018, 0.034), (sx * (R + 0.009), 0, H - 0.022), (0, 0, 0), {"default": steel}), 0.004)
        parent(lug, e)


TIERS = [  # (x, z, tilt_x, tilt_y)
    (0.00, 0.00, 0, 0),
    (0.07, 0.20, 6, -7),
    (-0.05, 0.41, -5, 6),
    (0.05, 0.62, 4, -5),
]
T = []
for i, (x, z, tx, ty) in enumerate(TIERS):
    e = holder(f"T{i}", (x, 0, z), (math.radians(tx), math.radians(ty), 0))
    tier(i, e)
    T.append(e)

# lid with its arched carry handle, floating on top, and the tag hanging from the grip
LZ = 0.84
L = holder("L", (-0.02, 0, LZ), (math.radians(-6), math.radians(8), 0))
bpy.ops.mesh.primitive_uv_sphere_add(radius=R + 0.004, location=(0, 0, 0), segments=96, ring_count=48)
lid = bpy.context.active_object
lid.scale = (1, 1, 0.32)
cut_below(lid, 2)
lid.data.materials.append(enamel_band)
smooth(lid)
lid.modifiers.new("solid", "SOLIDIFY").thickness = 0.004
parent(lid, L)
bpy.ops.mesh.primitive_torus_add(major_radius=R + 0.003, minor_radius=0.006, location=(0, 0, 0), major_segments=96, minor_segments=12)
bpy.context.active_object.data.materials.append(cobalt)
bpy.ops.object.shade_smooth()
parent(bpy.context.active_object, L)
parent(sphere("knob", 0.018, (0, 0, (R + 0.004) * 0.32 + 0.01), cobalt), L)
HX = R + 0.018
bpy.ops.mesh.primitive_torus_add(major_radius=HX, minor_radius=0.0048, location=(0, 0, 0.0), rotation=(math.radians(90), 0, 0), major_segments=96, minor_segments=12)
arch = bpy.context.active_object
arch.data.materials.append(steel)
bpy.ops.object.shade_smooth()
cut_below(arch, 1, -0.0005)
parent(arch, L)
for sx in (-1, 1):
    parent(cyl(f"stub{sx}", 0.0048, 0.06, (sx * HX, 0, -0.02), steel, verts=24), L)
parent(cyl("grip", 0.014, 0.10, (0, 0, HX), mat("grip", (0.02, 0.02, 0.025), rough=0.4), rot=(0, math.radians(90), 0), bev=0.004), L)
string = mat("string", (0.85, 0.78, 0.62), rough=0.8)
a_ = Vector((0.035, -0.014, HX - 0.012))
b_ = Vector((0.11, -0.06, HX - 0.13))
bpy.ops.mesh.primitive_cylinder_add(radius=0.0013, depth=(b_ - a_).length, location=(a_ + b_) / 2)
st = bpy.context.active_object
st.rotation_euler = (b_ - a_).to_track_quat("Z", "Y").to_euler()
st.data.materials.append(string)
parent(st, L)
tag_m = mat("tag", (1, 1, 1), rough=0.85, img="tag.png")
parent(textured_box("tag", (0.14, 0.0016, 0.07), b_ + Vector((0.0, 0, -0.03)), (math.radians(6), 0, math.radians(-24)), {"front": tag_m, "default": mat("tagback", (0.86, 0.79, 0.62), rough=0.9)}), L)

# ---------------- what each tier carries ----------------
# tier 0: a burger (Baly Food), standing proud of the rim
bun = mat("bun", (0.62, 0.30, 0.07), rough=0.45, coat=0.25, sss=0.1, bump=0.05, bump_scale=60)
z = 0.085
bz = [cyl("bun_b", 0.075, 0.03, (0, 0, z), bun, bev=0.011),
      cyl("lettuce", 0.083, 0.007, (0, 0, z + 0.022), mat("lettuce", (0.18, 0.5, 0.06), rough=0.35, sss=0.2), bev=0.002),
      cyl("patty", 0.08, 0.028, (0, 0, z + 0.041), mat("patty", (0.12, 0.05, 0.02), rough=0.6, bump=0.6, bump_scale=120), bev=0.007),
      textured_box("cheese", (0.14, 0.14, 0.005), (0, 0, z + 0.058), (0, 0, math.radians(45)), {"default": mat("cheese", (0.95, 0.62, 0.04), rough=0.3, sss=0.3)}),
      cyl("tomato", 0.067, 0.011, (0, 0, z + 0.066), mat("tomato", (0.7, 0.04, 0.03), rough=0.2, sss=0.3), bev=0.003),
      sphere("bun_t", 0.078, (0, 0, z + 0.074), bun, scale=(1, 1, 0.62))]
seed = mat("seed", (0.95, 0.88, 0.7), rough=0.5)
for k in range(20):
    a = random.uniform(0, 2 * math.pi)
    rr = random.uniform(0.0, 0.058)
    zz = z + 0.074 + 0.62 * math.sqrt(max(0.078 ** 2 - rr ** 2, 0)) + 0.001
    s_ = sphere(f"seed{k}", 0.0042, (rr * math.cos(a), rr * math.sin(a), zz), seed, scale=(1.6, 0.9, 0.6))
    s_.rotation_euler = (0, 0, a)
    bz.append(s_)
for o in bz:
    parent(o, T[0])

# tier 1: a toy taxi driving up out of the tier, side decal to camera
car_white = mat("car", (0.92, 0.92, 0.93), rough=0.15, coat=1.0)
glass = mat("glass", (0.02, 0.03, 0.05), rough=0.05, coat=1.0)
tyre = mat("tyre", (0.02, 0.02, 0.02), rough=0.6)
decal = mat("decal", (1, 1, 1), rough=0.15, coat=1.0, img="decal.png")
car = holder("car", (0.0, -0.02, 0.15), (math.radians(4), math.radians(-24), math.radians(-12)))
parent(car, T[1])
cp = [bevel(textured_box("car_body", (0.22, 0.10, 0.048), (0, 0, 0.0), (0, 0, 0), {"default": car_white, "front": decal, "back": decal}), 0.015, 4),
      bevel(textured_box("car_cabin", (0.12, 0.088, 0.042), (-0.01, 0, 0.043), (0, 0, 0), {"default": glass}), 0.013, 4),
      bevel(textured_box("car_roof", (0.098, 0.09, 0.007), (-0.01, 0, 0.066), (0, 0, 0), {"default": car_white}), 0.003)]
sign_m = mat("sign", (1, 1, 1), rough=0.3, img="sign.png")
cp.append(bevel(textured_box("car_sign", (0.052, 0.018, 0.018), (-0.01, 0, 0.078), (0, 0, 0), {"front": sign_m, "back": sign_m, "default": mat("signy", (1.0, 0.75, 0.12), rough=0.3)}), 0.002))
for wx in (-0.066, 0.066):
    for wy in (-0.052, 0.052):
        cp.append(cyl(f"wheel{wx}{wy}", 0.023, 0.017, (wx, wy, -0.02), tyre, rot=(math.radians(90), 0, 0), bev=0.005))
        cp.append(cyl(f"hub{wx}{wy}", 0.011, 0.0185, (wx, wy, -0.02), steel, rot=(math.radians(90), 0, 0)))
for o in cp:
    parent(o, car)

# tier 2: a parcel (Baly Box)
tape = mat("tape", (1, 1, 1), rough=0.3, img="tape.png")
pface = mat("pface", (1, 1, 1), rough=0.55, img="pface.png")
cardboard = mat("cardboard", (0.9, 0.89, 0.85), rough=0.6)
parcel = bevel(textured_box("parcel", (0.15, 0.12, 0.12), (0.0, 0.0, 0.1), (math.radians(-8), math.radians(12), math.radians(-24)), {"front": pface, "right": pface, "default": cardboard}), 0.007)
parent(parcel, T[2])
parent(bevel(textured_box("parcel_tape", (0.03, 0.124, 0.124), (0, 0, 0), (0, 0, 0), {"default": tape}), 0.002), parcel)

# tier 3: a gift card (Baly Digital) standing up out of the top tier
card_m = mat("card", (1, 1, 1), rough=0.12, coat=1.0, img="card.png")
parent(bevel(textured_box("card", (0.19, 0.003, 0.12), (0.0, 0.0, 0.105), (math.radians(-10), math.radians(-12), math.radians(-14)), {"front": card_m, "default": mat("cardback", (0.0, 0.05, 0.75), rough=0.2, coat=1.0)}), 0.008), T[3])

# ---------------- camera + lights ----------------
cam_d = bpy.data.cameras.new("cam")
cam_d.lens = float(os.environ.get("LENS", "53"))
cam_d.sensor_fit = "VERTICAL"
cam_d.sensor_height = 36
cam = link(bpy.data.objects.new("cam", cam_d))
cam.location = Vector((0.45, -2.35, 0.98))
tgt = Vector((0.0, 0.0, 0.50))
cam.rotation_euler = (tgt - cam.location).to_track_quat("-Z", "Y").to_euler()
cam_d.shift_y = float(os.environ.get("SHIFT_Y", "0.09"))
sc.camera = cam


def light(name, kind, loc, target, energy, color=(1, 1, 1), size=None, spot=None, blend=None):
    ld = bpy.data.lights.new(name, kind)
    ld.energy, ld.color = energy, color
    if size is not None:
        if kind == "AREA":
            ld.size = size
        else:
            ld.shadow_soft_size = size
    if spot:
        ld.spot_size, ld.spot_blend = math.radians(spot), blend
    ob = link(bpy.data.objects.new(name, ld))
    ob.location = Vector(loc)
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()


K = float(os.environ.get("KEY", "1"))
light("key", "SPOT", (-1.8, -2.2, 3.0), (0.0, 0.0, 0.45), 900 * K, (1.0, 0.96, 0.9), size=0.4, spot=40, blend=0.7)
light("rim", "AREA", (1.4, 1.2, 1.8), (0.0, 0.0, 0.5), 220 * K, (0.9, 0.95, 1.0), size=1.0)
light("fill", "AREA", (2.2, -2.4, 0.9), (0.0, 0.0, 0.45), 90 * K, (1.0, 0.97, 0.94), size=2.0)
light("wash", "SPOT", (0.0, -0.4, 4.0), (0.0, 2.2, 2.2), float(os.environ.get("WASH", "450")) * K, (1.0, 1.0, 1.0), size=1.0, spot=70, blend=1.0)

world = bpy.data.worlds.new("w")
sc.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.01, 0.02, 0.08, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.5

sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("done", OUT)
