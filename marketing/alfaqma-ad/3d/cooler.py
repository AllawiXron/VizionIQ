"""Al-Faqma ad — hero render. An Iraqi desert air cooler (مبردة) on a seamless stage, its front door swung open
like a fridge: inside, instead of straw pads and a fan, it is packed with layered fruit ice cream.

Usage: bvenv/bin/python cooler.py <out.png> [percent] [samples]
Env: STAGE="r,g,b" (linear) to recolour the stage; EXPOSURE.
"""
import math
import os
import random
import sys

import bpy  # must come before bmesh / mathutils when Blender runs as a Python module
from mathutils import Euler, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
PCT = int(sys.argv[2]) if len(sys.argv) > 2 else 100
SAMPLES = int(sys.argv[3]) if len(sys.argv) > 3 else 160
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1620, 2025, PCT
sc.view_settings.view_transform = "AgX"
try:
    sc.view_settings.look = "AgX - Punchy"
except TypeError:
    pass
sc.view_settings.exposure = float(os.environ.get("EXPOSURE", "-0.7"))


# ---------------- helpers ----------------
def principled(name, color, rough=0.5, metal=0.0, sss=0.0, coat=0.0, bump=0.0, bump_scale=30.0, img=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if sss:
        b.inputs["Subsurface Weight"].default_value = sss
        b.inputs["Subsurface Radius"].default_value = (0.06, 0.03, 0.02)
        b.inputs["Subsurface Scale"].default_value = 0.05
    if coat:
        b.inputs["Coat Weight"].default_value = coat
    if img:
        t = nt.nodes.new("ShaderNodeTexImage")
        t.image = bpy.data.images.load(img)
        nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    if bump:
        n = nt.nodes.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = bump_scale
        n.inputs["Detail"].default_value = 8
        bn = nt.nodes.new("ShaderNodeBump")
        bn.inputs["Strength"].default_value = bump
        nt.links.new(n.outputs["Fac"], bn.inputs["Height"])
        nt.links.new(bn.outputs["Normal"], b.inputs["Normal"])
    return m


def box(name, size, loc, mat, bevel=0.004, rot=(0, 0, 0), parent=None, segs=2):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        bv = ob.modifiers.new("bevel", "BEVEL")
        bv.width, bv.segments = bevel, segs
    ob.data.materials.append(mat)
    if parent:
        ob.parent = parent
        ob.matrix_parent_inverse = parent.matrix_world.inverted()
    return ob


def blob(name, size, loc, mat, rough_amt=0.02, scale_tex=1.4, level=3, rot=(0, 0, 0)):
    """A soft, pillowy ice-cream mass: subdivided box + cloud displacement."""
    ob = box(name, size, loc, mat, bevel=0, rot=rot)
    ob.modifiers.new("sub", "SUBSURF").levels = level
    ob.modifiers[-1].render_levels = level
    tex = bpy.data.textures.new(name + "_tex", "CLOUDS")
    tex.noise_scale = 0.08 * scale_tex
    d = ob.modifiers.new("disp", "DISPLACE")
    d.texture = tex
    d.strength = rough_amt
    d.mid_level = 0.5
    bpy.ops.object.shade_smooth()
    return ob


# ---------------- stage: seamless cove ----------------
STAGE = tuple(float(v) for v in os.environ.get("STAGE", "0.78,0.20,0.035").split(","))
stage = principled("stage", STAGE, rough=0.75)
import bmesh  # noqa: E402

me = bpy.data.meshes.new("cove")
bm = bmesh.new()
prof = [(-8.0, 0.0), (1.2, 0.0)]
R = 1.6
for i in range(1, 13):
    a = math.radians(90 * i / 12)
    prof.append((1.2 + R * math.sin(a), R * (1 - math.cos(a))))
prof.append((1.2 + R, 9.0))
rows = []
for x in (-9.0, 9.0):
    rows.append([bm.verts.new((x, y, z)) for y, z in prof])
for i in range(len(prof) - 1):
    bm.faces.new((rows[0][i], rows[1][i], rows[1][i + 1], rows[0][i + 1]))
bm.to_mesh(me)
bm.free()
cove = bpy.data.objects.new("cove", me)
cove.data.materials.append(stage)
sc.collection.objects.link(cove)
for p in cove.data.polygons:
    p.use_smooth = True

# ---------------- the cooler ----------------
W, D, H = 0.74, 0.64, 0.86
Z0 = 0.10  # top of the legs
BODY = (0.56, 0.49, 0.37)  # classic beige enamel
body = principled("enamel", BODY, rough=0.38, coat=0.25, bump=0.02, bump_scale=120)
dark = principled("dark", (0.05, 0.045, 0.04), rough=0.6)
steel = principled("steel", (0.62, 0.62, 0.64), rough=0.3, metal=1.0)
straw = bpy.data.materials.new("straw")
straw.use_nodes = True
sn = straw.node_tree.nodes
sb = sn["Principled BSDF"]
sb.inputs["Roughness"].default_value = 0.95
tc = sn.new("ShaderNodeTexCoord")
mp = sn.new("ShaderNodeMapping")
mp.inputs["Scale"].default_value = (1.0, 2.0, 60.0)
nz = sn.new("ShaderNodeTexNoise")
nz.inputs["Scale"].default_value = 18
nz.inputs["Detail"].default_value = 10
ramp = sn.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = (0.10, 0.055, 0.015, 1)
ramp.color_ramp.elements[1].color = (0.45, 0.28, 0.09, 1)
L = straw.node_tree.links
L.new(tc.outputs["Object"], mp.inputs["Vector"])
L.new(mp.outputs["Vector"], nz.inputs["Vector"])
L.new(nz.outputs["Fac"], ramp.inputs["Fac"])
L.new(ramp.outputs["Color"], sb.inputs["Base Color"])

ztop = Z0 + H
# legs + base tank + lid + corner posts
for sx in (-1, 1):
    for sy in (-1, 1):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.025, depth=Z0, location=(sx * (W / 2 - 0.05), sy * (D / 2 - 0.05), Z0 / 2))
        bpy.context.active_object.data.materials.append(dark)
box("tank", (W, D, 0.13), (0, 0, Z0 + 0.065), body, bevel=0.01)
box("lid", (W + 0.05, D + 0.05, 0.055), (0, 0, ztop + 0.0275), body, bevel=0.012, segs=3)
for sx in (-1, 1):
    for sy in (-1, 1):
        box("post", (0.045, 0.045, H - 0.13), (sx * (W / 2 - 0.0225), sy * (D / 2 - 0.0225), Z0 + 0.13 + (H - 0.13) / 2), body, bevel=0.006)

# louvered side panels (right, left, back): frame bars + tilted slats + straw pad behind
z_lo, z_hi = Z0 + 0.15, ztop - 0.03
n_sl = 13
pitch = (z_hi - z_lo) / n_sl


def louvers(side):
    for i in range(n_sl):
        z = z_lo + pitch * (i + 0.5)
        if side in ("right", "left"):
            sx = 1 if side == "right" else -1
            box(f"slat_{side}{i}", (0.006, D - 0.10, pitch * 0.46), (sx * (W / 2 + 0.006), 0, z), body, bevel=0.002, rot=(0, math.radians(-38 * sx), 0))
        else:
            box(f"slat_{side}{i}", (W - 0.10, 0.006, pitch * 0.46), (0, D / 2 + 0.006, z), body, bevel=0.002, rot=(math.radians(38), 0, 0))
    if side in ("right", "left"):
        sx = 1 if side == "right" else -1
        box(f"pad_{side}", (0.02, D - 0.09, z_hi - z_lo), (sx * (W / 2 - 0.02), 0, (z_lo + z_hi) / 2), straw, bevel=0)
        for z in (z_lo - 0.012, z_hi + 0.012):
            box("bar", (0.03, D - 0.05, 0.024), (sx * (W / 2 + 0.002), 0, z), body, bevel=0.004)
    else:
        box("pad_back", (W - 0.09, 0.02, z_hi - z_lo), (0, D / 2 - 0.02, (z_lo + z_hi) / 2), straw, bevel=0)


for s in ("right", "left", "back"):
    louvers(s)

# manufacturer plate on the front of the tank (the hidden joke)
plate = principled("plate", (0.8, 0.8, 0.8), rough=0.3, metal=0.6, img=os.path.join(HERE, "plate.png"))
bpy.ops.mesh.primitive_plane_add(size=1, location=(0.12, -D / 2 - 0.004, Z0 + 0.067), rotation=(math.radians(90), 0, 0))
pl = bpy.context.active_object
pl.scale = (0.30, 0.099, 1)
pl.data.materials.append(plate)
# control knob on the right post
bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.03, location=(W / 2 + 0.01, -D / 2 + 0.07, ztop - 0.12), rotation=(0, math.radians(90), 0))
bpy.context.active_object.data.materials.append(dark)

# ---------------- the door, swung open on its left hinge ----------------
hinge = bpy.data.objects.new("hinge", None)
hinge.location = (-W / 2, -D / 2, 0)
sc.collection.objects.link(hinge)
dh = H - 0.13
dz = Z0 + 0.13 + dh / 2
galv = principled("galv", (0.55, 0.56, 0.57), rough=0.45, metal=0.85, bump=0.05, bump_scale=300)
door = box("door", (W, 0.035, dh), (0, -D / 2 - 0.0175, dz), body, bevel=0.008, segs=3)
door_in = box("door_inner", (W - 0.06, 0.008, dh - 0.06), (0, -D / 2 + 0.002, dz), galv, bevel=0.004)
# outer outlet grille (vertical vanes) on the door's outside
for i in range(11):
    x = -W / 2 + 0.12 + i * (W - 0.24) / 10
    box(f"vane{i}", (0.008, 0.03, dh * 0.55), (x, -D / 2 - 0.04, dz + 0.05), dark, bevel=0.002)
# the fan, mounted on the inside of the door: guard rings, spokes, four blades, hub
FY = -D / 2 + 0.07
FZ = dz + 0.06
wire = principled("wire", (0.75, 0.75, 0.76), rough=0.25, metal=1.0)
blade_m = principled("blade", (0.62, 0.64, 0.66), rough=0.3, metal=1.0)
fan_parts = []
for r in (0.06, 0.12, 0.18, 0.235):
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=0.0035, location=(0, FY + 0.03, FZ), rotation=(math.radians(90), 0, 0))
    bpy.context.active_object.data.materials.append(wire)
    fan_parts.append(bpy.context.active_object)
for k in range(8):
    a = k * math.pi / 4
    bpy.ops.mesh.primitive_cylinder_add(radius=0.003, depth=0.235, location=(math.cos(a) * 0.1175, FY + 0.03, FZ + math.sin(a) * 0.1175), rotation=(0, -a + math.pi / 2, 0))
    bpy.context.active_object.data.materials.append(wire)
    fan_parts.append(bpy.context.active_object)
for k in range(4):
    a = k * math.pi / 2 + 0.3
    bpy.ops.mesh.primitive_cube_add(size=1, location=(math.cos(a) * 0.12, FY, FZ + math.sin(a) * 0.12), rotation=(math.radians(25), -a, 0))
    bl = bpy.context.active_object
    bl.scale = (0.17, 0.004, 0.085)
    bl.modifiers.new("b", "BEVEL").width = 0.02
    bl.data.materials.append(blade_m)
    fan_parts.append(bl)
bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.07, location=(0, FY - 0.01, FZ), rotation=(math.radians(90), 0, 0))
bpy.context.active_object.data.materials.append(dark)
fan_parts.append(bpy.context.active_object)
for ob in [door, door_in] + fan_parts + [o for o in bpy.data.objects if o.name.startswith("vane")]:
    ob.parent = hinge
    ob.matrix_parent_inverse = hinge.matrix_world.inverted()
hinge.rotation_euler = Euler((0, 0, math.radians(-102)))

# ---------------- the inside: one packed block of layered fruit ice cream ----------------
flavours = [  # bottom -> top: (name, colour, share of height)
    ("chocolate", (0.13, 0.045, 0.02), 0.16),
    ("strawberry", (0.55, 0.012, 0.035), 0.17),
    ("mango", (0.90, 0.30, 0.005), 0.17),
    ("pistachio", (0.16, 0.36, 0.025), 0.16),
    ("berry", (0.20, 0.008, 0.12), 0.16),
    ("vanilla", (0.86, 0.72, 0.45), 0.18),
]
iw, idp = W - 0.05, D - 0.04
zb, zt = Z0 + 0.135, ztop - 0.012
hb = zt - zb
BULGE = 0.035
ice = bpy.data.materials.new("ice_layers")
ice.use_nodes = True
nt = ice.node_tree
N, Lk = nt.nodes, nt.links
bs = N["Principled BSDF"]
bs.inputs["Roughness"].default_value = 0.3
bs.inputs["Subsurface Weight"].default_value = 0.25
bs.inputs["Subsurface Radius"].default_value = (0.06, 0.03, 0.02)
bs.inputs["Subsurface Scale"].default_value = 0.04
bs.inputs["Coat Weight"].default_value = 0.15
tc = N.new("ShaderNodeTexCoord")
sep = N.new("ShaderNodeSeparateXYZ")
Lk.new(tc.outputs["Object"], sep.inputs["Vector"])
wob = N.new("ShaderNodeTexNoise")
wob.inputs["Scale"].default_value = 3.2
wob.inputs["Detail"].default_value = 3
wsub = N.new("ShaderNodeMath")
wsub.operation = "SUBTRACT"
wsub.inputs[1].default_value = 0.5
Lk.new(wob.outputs["Fac"], wsub.inputs[0])
wmul = N.new("ShaderNodeMath")
wmul.operation = "MULTIPLY"
wmul.inputs[1].default_value = 0.07
Lk.new(wsub.outputs["Value"], wmul.inputs[0])
zadd = N.new("ShaderNodeMath")
Lk.new(sep.outputs["Z"], zadd.inputs[0])
Lk.new(wmul.outputs["Value"], zadd.inputs[1])
mr = N.new("ShaderNodeMapRange")
mr.inputs["From Min"].default_value, mr.inputs["From Max"].default_value = -hb / 2, hb / 2
Lk.new(zadd.outputs["Value"], mr.inputs["Value"])
cr = N.new("ShaderNodeValToRGB")
cr.color_ramp.interpolation = "CONSTANT"
gr = N.new("ShaderNodeValToRGB")  # grooves between layers for the bump
gr.color_ramp.interpolation = "LINEAR"
acc = 0.0
els = cr.color_ramp.elements
els[0].position, els[0].color = 0.0, (*flavours[0][1], 1)
els[1].position, els[1].color = flavours[0][2], (*flavours[1][1], 1)
acc = flavours[0][2]
for name, col, share in flavours[1:-1]:
    acc += share
    e = els.new(acc)
gstops = []
acc = 0.0
for k, (name, col, share) in enumerate(flavours):
    if k > 0:
        gstops.append(acc)
    acc += share
# colours for the remaining stops
acc = 0.0
pos = []
for name, col, share in flavours:
    pos.append(acc)
    acc += share
for e, p_ in zip(sorted(els, key=lambda e: e.position), pos):
    pass
for k, e in enumerate(sorted(els, key=lambda e: e.position)):
    e.position = pos[k]
    e.color = (*flavours[k][1], 1)
ge = gr.color_ramp.elements
ge[0].position, ge[0].color = 0.0, (1, 1, 1, 1)
ge[1].position, ge[1].color = 1.0, (1, 1, 1, 1)
for g in gstops:
    for off, v in ((-0.012, 1.0), (0.0, 0.0), (0.012, 1.0)):
        e = ge.new(min(max(g + off, 0.001), 0.999))
        e.color = (v, v, v, 1)
Lk.new(mr.outputs["Result"], cr.inputs["Fac"])
Lk.new(mr.outputs["Result"], gr.inputs["Fac"])
Lk.new(cr.outputs["Color"], bs.inputs["Base Color"])
cream = N.new("ShaderNodeTexNoise")
cream.inputs["Scale"].default_value = 16
cream.inputs["Detail"].default_value = 3
hmix = N.new("ShaderNodeMath")
hmix.operation = "MULTIPLY"
Lk.new(cream.outputs["Fac"], hmix.inputs[0])
Lk.new(gr.outputs["Color"], hmix.inputs[1])
bn = N.new("ShaderNodeBump")
bn.inputs["Strength"].default_value = 0.14
Lk.new(hmix.outputs["Value"], bn.inputs["Height"])
Lk.new(bn.outputs["Normal"], bs.inputs["Normal"])

bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -BULGE / 2 - 0.004, (zb + zt) / 2))
blk = bpy.context.active_object
blk.name = "ice_block"
blk.scale = (iw, idp + BULGE, hb)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bv = blk.modifiers.new("bevel", "BEVEL")
bv.width, bv.segments = 0.03, 4
sub = blk.modifiers.new("sub", "SUBSURF")
sub.subdivision_type = "SIMPLE"
sub.levels = sub.render_levels = 5
tex = bpy.data.textures.new("lumps", "CLOUDS")
tex.noise_scale = 0.16
dsp = blk.modifiers.new("disp", "DISPLACE")
dsp.texture, dsp.strength, dsp.mid_level = tex, 0.024, 0.5
bpy.ops.object.shade_smooth()
blk.data.materials.append(ice)
FRONT = -D / 2 - BULGE - 0.004

# fruit pressed into the front face: strawberry halves, mango cubes, kiwi slices
def fruit_mat(name, inner, outer=None, radial=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.22
    b.inputs["Subsurface Weight"].default_value = 0.3
    b.inputs["Base Color"].default_value = (*inner, 1)
    if radial:
        n = m.node_tree.nodes
        tcn = n.new("ShaderNodeTexCoord")
        gt = n.new("ShaderNodeTexGradient")
        gt.gradient_type = "SPHERICAL"
        sc_ = n.new("ShaderNodeMapping")
        sc_.inputs["Scale"].default_value = (34, 34, 34)
        rp = n.new("ShaderNodeValToRGB")
        rp.color_ramp.elements[0].color = (*outer, 1)
        rp.color_ramp.elements[1].position = 0.75
        rp.color_ramp.elements[1].color = (*inner, 1)
        m.node_tree.links.new(tcn.outputs["Object"], sc_.inputs["Vector"])
        m.node_tree.links.new(sc_.outputs["Vector"], gt.inputs["Vector"])
        m.node_tree.links.new(gt.outputs["Fac"], rp.inputs["Fac"])
        m.node_tree.links.new(rp.outputs["Color"], b.inputs["Base Color"])
    return m


fruit = {
    "strawberry": fruit_mat("f_straw", (0.95, 0.55, 0.55), (0.62, 0.01, 0.04), radial=True),
    "mango": fruit_mat("f_mango", (1.0, 0.50, 0.01)),
    "kiwi": fruit_mat("f_kiwi", (0.85, 0.92, 0.70), (0.20, 0.48, 0.03), radial=True),
}
fruit["strawberry_skin"] = fruit["strawberry"]
# a scoop that fell out onto the stage, and a strawberry next to it
scoop_m = principled("ice_scoop", (0.55, 0.012, 0.035), rough=0.3, sss=0.25, bump=0.14, bump_scale=16)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=64, ring_count=32, location=(0.34, -D / 2 - 0.18, 0.035))
sc_ob = bpy.context.active_object
sc_ob.scale = (0.085, 0.08, 0.068)
t2 = bpy.data.textures.new("scoop_tex", "CLOUDS")
t2.noise_scale = 0.4
d2 = sc_ob.modifiers.new("d", "DISPLACE")
d2.texture, d2.strength = t2, 0.12
bpy.ops.object.shade_smooth()
sc_ob.data.materials.append(scoop_m)
bpy.ops.mesh.primitive_cylinder_add(radius=1, depth=1, vertices=64, location=(0.36, -D / 2 - 0.17, 0.002))
pud = bpy.context.active_object
pud.scale = (0.105, 0.075, 0.0025)
t3 = bpy.data.textures.new("pud_tex", "CLOUDS")
t3.noise_scale = 0.3
pud.data.materials.append(principled("puddle", (0.30, 0.006, 0.02), rough=0.05, coat=0.8))
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.03, location=(0.50, -D / 2 - 0.12, 0.03))
bpy.context.active_object.scale = (1, 0.85, 1.3)
bpy.ops.object.shade_smooth()
bpy.context.active_object.data.materials.append(fruit["strawberry"])
bpy.ops.mesh.primitive_cube_add(size=0.045, location=(0.18, -D / 2 - 0.26, 0.022), rotation=(0.2, 0.3, 0.7))
bpy.context.active_object.modifiers.new("b", "BEVEL").width = 0.006
bpy.context.active_object.data.materials.append(fruit["mango"])

# ---------------- camera + lights ----------------
cam_d = bpy.data.cameras.new("cam")
cam_d.lens = 60
cam_d.sensor_fit = "VERTICAL"
cam_d.sensor_height = 36
cam = bpy.data.objects.new("cam", cam_d)
cam.location = Vector((1.05, -3.45, 1.45))
target = Vector((-0.12, 0.0, 0.58))
cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
cam_d.shift_y = float(os.environ.get("SHIFT_Y", "0.03"))
sc.collection.objects.link(cam)
sc.camera = cam


def light(name, kind, loc, target, energy, color=(1, 1, 1), size=None, spot=None, blend=None):
    ld = bpy.data.lights.new(name, kind)
    ld.energy = energy
    ld.color = color
    if size is not None:
        if kind == "AREA":
            ld.size = size
        else:
            ld.shadow_soft_size = size
    if spot:
        ld.spot_size, ld.spot_blend = math.radians(spot), blend
    ob = bpy.data.objects.new(name, ld)
    ob.location = Vector(loc)
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    sc.collection.objects.link(ob)


K = float(os.environ.get("KEY", "1"))
light("key", "SPOT", (-2.2, -2.6, 3.4), (0.0, -0.1, 0.5), 900 * K, (1.0, 0.95, 0.88), size=0.35, spot=42, blend=0.7)
light("cold", "AREA", (0.0, -1.0, 0.75), (0.0, 0.0, 0.6), 40 * K, (0.75, 0.88, 1.0), size=0.5)  # cold glow from inside
light("rim", "AREA", (1.8, 1.4, 2.2), (0.0, 0.0, 0.6), 120 * K, (1.0, 0.85, 0.7), size=1.2)
light("fill", "AREA", (2.6, -3.0, 1.2), (0.0, 0.0, 0.6), 60 * K, (1.0, 0.95, 0.9), size=2.5)
light("wash", "SPOT", (0.0, -0.5, 4.5), (0.0, 2.4, 2.4), float(os.environ.get("WASH", "330")) * K, (1.0, 0.9, 0.8), size=1.0, spot=70, blend=1.0)

world = bpy.data.worlds.new("w")
sc.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.05, 0.02, 0.01, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.35

sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("done", OUT)
