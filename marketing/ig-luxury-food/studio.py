"""Iraqi foods as luxury brands: product renders (Blender 4.2, Cycles). Reuses the studio kit from the WARD renders
(../identity-concepts/ward3d/studio.py: sweep backdrop, area lights, lathe, printed foil materials). Sizes in cm.

  python studio.py <shot> [--preview]     shots: samoon, amba, istikan, dolma
"""
import math
import os
import random
import sys

import bpy
import bmesh
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "identity-concepts", "ward3d"))
import studio as K  # noqa: E402

K.TEX = os.path.join(HERE, "tex")
CM = K.CM
lin, principled, lathe, rounded, box, sweep, camera, dof = K.lin, K.principled, K.lathe, K.rounded, K.box, K.sweep, K.camera, K.dof
POWER = 0.28  # these sets are small and the lights sit close, so they need far less power than the WARD studio


def area(name, loc, target, size, power, color=(1, 0.97, 0.93)):
    return K.area(name, loc, target, size, power * POWER, color)
GOLD = (0.80, 0.60, 0.36, 1)


# ---------------------------------------------------------------- materials
def gold(rough=0.2):
    return principled("gold", GOLD, rough, metal=1.0)


def velvet(color, name="velvet"):
    m = principled(name, color, 0.95, spec=0.2)
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Sheen Weight"].default_value = 1.0
    b.inputs["Sheen Roughness"].default_value = 0.35
    b.inputs["Sheen Tint"].default_value = (1, 1, 1, 1)
    return m


def satin(color, name="satin"):
    m = principled(name, color, 0.35, spec=0.6)
    m.node_tree.nodes["Principled BSDF"].inputs["Sheen Weight"].default_value = 0.4
    return m


def glass(name="glass", tint=(1, 1, 1, 1), rough=0.02, ior=1.47):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = tint
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["Roughness"].default_value = rough
    b.inputs["IOR"].default_value = ior
    return m


def liquid(name, color, density):
    """clear surface with coloured absorption inside, so thick parts get deeper (tea, perfume)"""
    m = glass(name, (1, 1, 1, 1), 0.0, 1.34)
    nt = m.node_tree
    ab = nt.nodes.new("ShaderNodeVolumeAbsorption")
    ab.inputs["Color"].default_value = lin(color)
    ab.inputs["Density"].default_value = density
    nt.links.new(ab.outputs["Volume"], nt.nodes["Material Output"].inputs["Volume"])
    return m


def decal(name, tex, size, loc, rot=(0, 0, 0), foil=True, ink="#ffffff", rough=0.22):
    """artwork on a thin plane just above a surface: foil (or ink) where the art is, see-through elsewhere"""
    bpy.ops.mesh.primitive_plane_add(size=1)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (size[0] * CM, size[1] * CM, 1)
    bpy.ops.object.transform_apply(scale=True)
    ob.location = Vector(loc) * CM
    ob.rotation_euler = rot
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(os.path.join(K.TEX, tex + ".png"))
    img.extension = "CLIP"
    img.interpolation = "Cubic"
    top = nt.nodes.new("ShaderNodeBsdfPrincipled")
    if foil:
        top.inputs["Base Color"].default_value = GOLD
        top.inputs["Metallic"].default_value = 1.0
        top.inputs["Roughness"].default_value = rough
    else:
        top.inputs["Base Color"].default_value = lin(ink)
        top.inputs["Roughness"].default_value = 0.6
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(img.outputs["Alpha"], mix.inputs["Fac"])
    nt.links.new(tr.outputs["BSDF"], mix.inputs[1])
    nt.links.new(top.outputs["BSDF"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], nt.nodes["Material Output"].inputs["Surface"])
    ob.data.materials.append(m)
    return ob


def noise_bump(m, scale=60.0, strength=0.25, detail=6.0):
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = scale
    nz.inputs["Detail"].default_value = detail
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = strength
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    nt.links.new(nz.outputs["Fac"], bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def mesh_obj(name, verts, faces, mat=None, smooth=True):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    for p in me.polygons:
        p.use_smooth = smooth
    if mat:
        me.materials.append(mat)
    return ob


def place(ob, loc=(0, 0, 0), rot=(0, 0, 0)):
    ob.location = Vector(loc) * CM
    ob.rotation_euler = rot
    return ob


def shade_smooth_sub(ob, levels=2):
    sd = ob.modifiers.new("sub", "SUBSURF")
    sd.levels = sd.render_levels = levels
    return ob


# ---------------------------------------------------------------- samoon
def bread_mat():
    """golden crust: darker on top, pale where the bread touched the oven floor, with a split seam along the ridge"""
    m = bpy.data.materials.new("crust")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.62
    b.inputs["Subsurface Weight"].default_value = 0.08
    b.inputs["Subsurface Radius"].default_value = (0.4, 0.25, 0.12)
    b.inputs["Subsurface Scale"].default_value = 0.004
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
    # height -> colour (pale bottom, golden middle, deep brown top)
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = 0.0
    mr.inputs["From Max"].default_value = 0.055
    nt.links.new(sep.outputs["Z"], mr.inputs["Value"])
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 18
    nz.inputs["Detail"].default_value = 8
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "MULTIPLY_ADD"
    add.inputs[1].default_value = 0.35
    nt.links.new(nz.outputs["Fac"], add.inputs[0])
    nt.links.new(mr.outputs["Result"], add.inputs[2])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].position, cr.elements[0].color = 0.15, lin("#e9c58c")
    cr.elements[1].position, cr.elements[1].color = 0.95, lin("#8a4a1c")
    e = cr.elements.new(0.55)
    e.color = lin("#c98238")
    nt.links.new(add.outputs["Value"], ramp.inputs["Fac"])
    # the seam: a pale, rough split along the top ridge (|y| small, high up)
    ay = nt.nodes.new("ShaderNodeMath")
    ay.operation = "ABSOLUTE"
    nt.links.new(sep.outputs["Y"], ay.inputs[0])
    nzs = nt.nodes.new("ShaderNodeTexNoise")
    nzs.inputs["Scale"].default_value = 40
    nt.links.new(tc.outputs["Object"], nzs.inputs["Vector"])
    wob = nt.nodes.new("ShaderNodeMath")
    wob.operation = "MULTIPLY_ADD"
    wob.inputs[1].default_value = 0.004
    nt.links.new(nzs.outputs["Fac"], wob.inputs[0])
    nt.links.new(ay.outputs["Value"], wob.inputs[2])
    seam = nt.nodes.new("ShaderNodeMapRange")
    seam.inputs["From Min"].default_value = 0.0065
    seam.inputs["From Max"].default_value = 0.0025
    nt.links.new(wob.outputs["Value"], seam.inputs["Value"])
    high = nt.nodes.new("ShaderNodeMapRange")
    high.inputs["From Min"].default_value = 0.040
    high.inputs["From Max"].default_value = 0.050
    nt.links.new(sep.outputs["Z"], high.inputs["Value"])
    sm = nt.nodes.new("ShaderNodeMath")
    sm.operation = "MULTIPLY"
    nt.links.new(seam.outputs["Result"], sm.inputs[0])
    nt.links.new(high.outputs["Result"], sm.inputs[1])
    mixc = nt.nodes.new("ShaderNodeMix")
    mixc.data_type = "RGBA"
    nt.links.new(sm.outputs["Value"], mixc.inputs["Factor"])
    nt.links.new(ramp.outputs["Color"], mixc.inputs["A"])
    mixc.inputs["B"].default_value = lin("#f1d7a6")
    nt.links.new(mixc.outputs["Result"], b.inputs["Base Color"])
    # crust bumps, and the seam pressed in
    nzb = nt.nodes.new("ShaderNodeTexNoise")
    nzb.inputs["Scale"].default_value = 220
    nzb.inputs["Detail"].default_value = 10
    nt.links.new(tc.outputs["Object"], nzb.inputs["Vector"])
    hb = nt.nodes.new("ShaderNodeMath")
    hb.operation = "MULTIPLY_ADD"
    hb.inputs[1].default_value = -1.5
    nt.links.new(sm.outputs["Value"], hb.inputs[0])
    nt.links.new(nzb.outputs["Fac"], hb.inputs[2])
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = 0.35
    bp.inputs["Distance"].default_value = 0.002
    nt.links.new(hb.outputs["Value"], bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def samoon(loc=(0, 0, 0), rot=0.0, L=8.4, W=4.0, H=5.0):
    """Iraqi samoon: a diamond-shaped loaf. Top view is a rhombus with soft corners, pointed at both ends, domed."""
    nx, nt_ = 64, 48
    verts, faces = [], []
    for i in range(nx + 1):
        x = -L + 2 * L * i / nx
        t = abs(x) / L
        w = W * (1 - t) ** 0.85 * (1 - 0.18 * (1 - t) ** 6) + 0.05
        h = H * (1 - t ** 1.7) ** 0.75 + 0.05
        for j in range(nt_ + 1):
            th = math.pi * j / nt_  # 0 at +y, pi at -y, over the top
            s = math.sin(th)
            y = w * math.cos(th)
            z = h * (s ** 0.65)
            verts.append((x * CM, y * CM, z * CM))
    for i in range(nx):
        for j in range(nt_):
            a = i * (nt_ + 1) + j
            b = a + nt_ + 1
            faces.append((a, b, b + 1, a + 1))
    # flat bottom
    base = len(verts)
    for i in range(nx + 1):
        x = -L + 2 * L * i / nx
        verts.append((x * CM, 0, 0))
    for i in range(nx):
        a, b = i * (nt_ + 1), (i + 1) * (nt_ + 1)
        faces.append((a + nt_, b + nt_, base + i + 1, base + i))
        faces.append((base + i, base + i + 1, b, a))
    ob = mesh_obj("samoon", verts, faces, bread_mat())
    # a gentle bend up at the tips and a little asymmetry, like a hand-shaped loaf
    for v in ob.data.vertices:
        x = v.co.x / (L * CM)
        v.co.z += (x * x) * 0.5 * CM * 1.0
        v.co.y += math.sin(x * 2.2) * 0.25 * CM
    shade_smooth_sub(ob, 1)
    return place(ob, loc, (0, 0, rot))


def open_box(name, size, loc, mat, floor=1.0, wall=0.7, bevel=0.2):
    """a box with an open top: a solid floor and four walls (cm); returns the parts"""
    w, d, h = size
    x, y, z = loc
    parts = [box(name + "-floor", (w, d, floor), (x, y, z), mat, None, bevel)]
    hw = h - floor
    for sx in (-1, 1):
        parts.append(box(name + "-wall", (wall, d, hw), (x + sx * (w - wall) / 2, y, z + floor - 0.01), mat, None, bevel))
    for sy in (-1, 1):
        parts.append(box(name + "-wall", (w - 2 * wall + 0.02, wall, hw), (x, y + sy * (d - wall) / 2, z + floor - 0.01), mat, None, bevel))
    return parts


def band(name, w, d, z, height=0.22, t=0.05, rough=0.25):
    """a thin gold band around the outside of a box (four strips, so the inside stays open)"""
    g = gold(rough)
    for sx in (-1, 1):
        box(name, (t, d + 2 * t, height), (sx * (w / 2 + t / 2), 0, z), g, None, 0.02)
    for sy in (-1, 1):
        box(name, (w + 2 * t, t, height), (0, sy * (d / 2 + t / 2), z), g, None, 0.02)


def jewel_box(size=(23, 14, 6.6), lid_angle=104, lid_h=2.4, outer="#152238", inner="#efe4d2"):
    """an open jewellery box: velvet outside, a satin cushion inside, the lid tipped back showing the foil print"""
    w, d, h = size
    vel = velvet(outer, "box-velvet")
    sat = satin(inner, "box-satin")
    open_box("box", size, (0, 0, 0), vel, floor=h - 1.6, wall=0.8, bevel=0.25)
    box("cushion", (w - 1.6, d - 1.6, 1.62), (0, 0, h - 1.67), sat, None, 0.6)
    box("clasp", (2.6, 0.4, 1.3), (0, -d / 2 - 0.12, h - 1.7), gold(0.18), None, 0.12)
    band("trim", w, d, h - 0.5)
    # the lid: built closed on top of the box, then swung open about the back top edge
    pivot = bpy.data.objects.new("hinge", None)
    bpy.context.collection.objects.link(pivot)
    pivot.location = (0, d / 2 * CM, h * CM)
    lid = box("lid", (w, d, lid_h), (0, 0, 0), vel, None, 0.5)
    lid.parent = pivot
    lid.location = (0, -d / 2 * CM, lid_h / 2 * CM)
    pad = box("lid-satin", (w - 1.6, d - 1.6, 0.4), (0, 0, 0), sat, None, 0.18)
    pad.parent = lid
    pad.location = (0, 0, (-lid_h / 2 + 0.15) * CM)
    art = decal("lid-art", "samoon-lid", (w - 3.8, (w - 3.8) * 13 / 22), (0, 0, 0), (math.pi, 0, 0))
    art.parent = lid
    art.location = (0, 0, (-lid_h / 2 - 0.06) * CM)
    pivot.rotation_euler = (-math.radians(lid_angle), 0, 0)
    return h - 0.05  # the cushion top


def shot_samoon():
    sweep("#1b2740")
    s = bpy.context.scene
    s.view_settings.exposure = -0.4
    area("key", (-0.55, -0.6, 0.75), (0, 0.02, 0.06), 0.9, 60, (1, 0.93, 0.84))
    area("fill", (0.8, -0.55, 0.3), (0, 0, 0.05), 1.4, 12, (0.85, 0.9, 1))
    area("rim", (0.3, 0.6, 0.6), (0, 0.04, 0.08), 0.8, 45, (1, 0.9, 0.8))
    area("top", (0.0, 0.05, 0.9), (0, 0.02, 0.0), 0.5, 18)
    top = jewel_box()
    samoon((0, -0.6, top - 0.12), math.radians(2))
    cam = camera((0.0, -0.62, 0.31), (0.0, 0.03, 0.14), 56)
    dof(cam, (0, -0.006, 0.09), 5.6)


# ---------------------------------------------------------------- amba
def mango(loc, size=2.6):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=32, radius=1)
    ob = bpy.context.active_object
    ob.name = "mango-cap"
    for v in ob.data.vertices:
        x, y, z = v.co
        k = 1 + 0.18 * z  # fuller at the top
        v.co = Vector((x * 0.78 * k, y * 0.62 * k, z * 1.0))
        v.co.x += 0.22 * (1 - z * z)  # the belly of the mango leans to one side
        v.co.x -= 0.25 * max(0, -z) ** 2  # and the tip curls back
    ob.scale = (size / 2 * CM,) * 3
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    ob.data.materials.append(gold(0.16))
    ob.location = Vector(loc) * CM
    ob.rotation_euler = (0, math.radians(-14), 0)
    stem = lathe("stem", rounded(0.18, 0, 0.6, 0.05), mat=gold(0.2))
    stem.parent = ob
    stem.location = (0.08 * CM, 0, size / 2 * CM * 0.9)  # sunk into the top of the mango
    stem.rotation_euler = (0, math.radians(20), 0)
    return ob


def perfume(loc=(0, 0, 0), rot=0.0, w=7.0, d=3.4, h=9.0):
    """a thick-walled glass flacon with amber juice, a gold collar and a gold mango for a cap"""
    parts = []
    g = glass("flacon")
    outer = box("flacon", (w, d, h), (0, 0, 0), g, None, 0.6)
    parts.append(outer)
    juice = box("juice", (w - 1.0, d - 1.0, h - 2.6), (0, 0, 1.3), liquid("amba-juice", "#ffb000", 45.0), None, 0.45)
    parts.append(juice)
    collar = lathe("collar", rounded(1.0, h - 0.1, h + 1.2, 0.12), mat=gold(0.18))
    parts.append(collar)
    cap = mango((0, 0, h + 1.2 + 1.65), 3.3)
    parts.append(cap)
    plate = box("label-plate", (5.2, 0.06, 6.6), (0, -d / 2 - 0.02, h * 0.47 - 3.3), principled("label-black", "#121010", 0.35, coat=0.6), None, 0.02)
    lab = decal("amba-label", "amba-label", (4.6, 4.6 * 8 / 6), (0, -d / 2 - 0.06, h * 0.47), (math.pi / 2, 0, 0))
    parts += [plate, lab]
    root = bpy.data.objects.new("perfume", None)
    bpy.context.collection.objects.link(root)
    for ob in parts:
        ob.parent = root
    root.location = Vector(loc) * CM
    root.rotation_euler = (0, 0, rot)
    return root


def shot_amba():
    sweep("#9a6408")
    s = bpy.context.scene
    s.view_settings.exposure = -0.55
    s.cycles.transmission_bounces = 16
    s.cycles.max_bounces = 16
    s.cycles.volume_bounces = 2
    area("key", (-0.6, -0.55, 0.6), (0, 0, 0.08), 0.9, 55, (1, 0.95, 0.88))
    area("fill", (0.75, -0.5, 0.3), (0, 0, 0.07), 1.4, 14)
    area("back", (0.05, 0.45, 0.25), (0, 0, 0.07), 0.5, 70, (1, 0.85, 0.6))  # glows through the juice
    area("rim", (-0.4, 0.5, 0.5), (0, 0, 0.1), 0.6, 30)
    pod = lathe("plinth", rounded(6.5, 0, 3.0, 0.2), mat=principled("plinth", "#141110", 0.08, coat=1.0, spec=0.7))
    perfume((0, 0, 3.0), math.radians(-14))
    blk = principled("box-black", "#161312", 0.55, spec=0.35)
    pk = box("amba-box", (9, 4.2, 12), (0, 0, 0), blk, None, 0.08)
    art = decal("amba-box-art", "amba-box", (8.0, 8.0 * 12 / 9), (0, 0, 0), (math.pi / 2, 0, 0))
    art.parent = pk
    art.location = (0, -2.112 * CM, 0)
    pk.location = (-9.5 * CM, 6.5 * CM, 6.0 * CM)
    pk.rotation_euler = (0, 0, math.radians(18))
    cam = camera((0.11, -0.74, 0.2), (-0.014, 0.0, 0.125), 70)
    dof(cam, (0, -0.01, 0.08), 4.0)


# ---------------------------------------------------------------- istikan
ISTIKAN_OUT = [(0, 0), (1.85, 0), (2.0, 0.25), (1.95, 0.9), (1.7, 2.0), (1.42, 3.4), (1.45, 4.6), (1.75, 6.1), (2.15, 7.6), (2.32, 8.4)]
ISTIKAN_IN = [(2.2, 8.4), (2.03, 7.6), (1.63, 6.1), (1.33, 4.6), (1.3, 3.4), (1.5, 2.2), (1.4, 1.4), (0, 1.25)]


def istikan(loc=(0, 0, 0), fill=7.2):
    prof = ISTIKAN_OUT + ISTIKAN_IN
    g = lathe("istikan", prof, seg=128, mat=glass("istikan-glass"))
    rim = lathe("istikan-rim", [(2.18, 8.3), (2.35, 8.3), (2.36, 8.45), (2.18, 8.45)], seg=128, mat=gold(0.15))
    band = lathe("istikan-band", [(1.47, 4.3), (1.5, 4.3), (1.5, 4.75), (1.47, 4.75)], seg=128, mat=gold(0.2))
    # the tea follows the inside of the glass up to the fill line
    tea = []
    for r, z in reversed(ISTIKAN_IN[1:]):
        if z <= fill:
            tea.append((r - 0.01, z))
    zs = [p[1] for p in ISTIKAN_IN]
    # radius at the fill line
    for (r0, z0), (r1, z1) in zip(ISTIKAN_IN[1:], ISTIKAN_IN[2:]):
        if min(z0, z1) <= fill <= max(z0, z1):
            rf = r0 + (r1 - r0) * (fill - z0) / (z1 - z0)
    tea = [(0, 1.26)] + [p for p in tea if p[0] > 0] + [(rf - 0.01, fill), (0, fill)]
    t = lathe("tea", tea, seg=128, mat=liquid("tea", "#c2410c", 150.0))
    parts = [g, rim, band, t]
    root = bpy.data.objects.new("istikan-set", None)
    bpy.context.collection.objects.link(root)
    for ob in parts:
        ob.parent = root
    root.location = Vector(loc) * CM
    return root


def saucer(loc=(0, 0, 0)):
    prof = [(0, 0), (2.6, 0), (2.7, 0.25), (3.2, 0.35), (5.2, 0.75), (5.9, 1.25), (6.0, 1.38), (5.85, 1.42), (5.1, 0.95), (3.2, 0.6), (0, 0.55)]
    porcelain = principled("porcelain", "#f6f1e8", 0.12, coat=0.6, spec=0.6)
    s = lathe("saucer", prof, seg=128, mat=porcelain, loc=loc)
    rim = lathe("saucer-rim", [(5.82, 1.3), (6.02, 1.3), (6.03, 1.42), (5.86, 1.44)], seg=128, mat=gold(0.18), loc=loc)
    return [s, rim]


def spoon(loc, rot):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1)
    bowl = bpy.context.active_object
    bowl.name = "spoon"
    bm = bmesh.new()
    bm.from_mesh(bowl.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > 0.02], context="VERTS")
    bm.to_mesh(bowl.data)
    bm.free()
    bowl.scale = (1.0 * CM, 0.62 * CM, 0.32 * CM)
    bpy.ops.object.transform_apply(scale=True)
    sol = bowl.modifiers.new("sol", "SOLIDIFY")
    sol.thickness = 0.06 * CM
    bpy.ops.object.shade_smooth()
    g = gold(0.15)
    bowl.data.materials.append(g)
    handle = box("spoon-handle", (8.0, 0.32, 0.1), (0, 0, 0), g, None, 0.05)
    handle.parent = bowl
    handle.location = (4.6 * CM, 0, 0.3 * CM)
    handle.rotation_euler = (0, math.radians(-5), 0)
    bowl.location = Vector(loc) * CM
    bowl.rotation_euler = (0, 0, rot)
    return bowl


def tin(loc=(0, 0, 0), rot=0.0, r=4.2, h=11.0, color="#0e2e2c"):
    body = lathe("tin", rounded(r, 0, h, 0.15), mat=K.printed("tin-print", color, "istikan-tin", rough=0.3, coat=0.7), uv_r=r * 1.0, uv_z=h * 0.52, loc=loc, rot=rot)
    lid = lathe("tin-lid", rounded(r + 0.12, h - 1.6, h + 0.3, 0.2, bottom=False), mat=gold(0.22), loc=loc, rot=rot)
    return [body, lid]


def cardamom(loc, rot, rng):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=1)
    ob = bpy.context.active_object
    for v in ob.data.vertices:
        x, y, z = v.co
        a = math.atan2(y, z)
        ridge = 1 + 0.07 * math.cos(3 * a)
        taper = 1 - 0.25 * max(0, x) ** 2
        v.co = Vector((x * 1.0, y * 0.42 * ridge * taper, z * 0.4 * ridge * taper))
    ob.scale = (0.85 * CM,) * 3
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    m = noise_bump(principled("cardamom", "#5d7428", 0.55, sheen=0.3), 300, 0.3)
    ob.data.materials.append(m)
    ob.location = Vector(loc) * CM + Vector((0, 0, 0.36 * CM))
    ob.rotation_euler = rot
    return ob


def sugar(loc, rot):
    m = noise_bump(principled("sugar", "#f7f4ee", 0.7, spec=0.4), 900, 0.6, 2)
    m.node_tree.nodes["Principled BSDF"].inputs["Subsurface Weight"].default_value = 0.3
    m.node_tree.nodes["Principled BSDF"].inputs["Subsurface Scale"].default_value = 0.003
    return box("sugar", (1.5, 1.5, 1.5), loc, m, None, 0.12, rot)


def shot_istikan():
    sweep("#0f3a39")
    s = bpy.context.scene
    s.view_settings.exposure = -0.45
    s.cycles.transmission_bounces = 16
    s.cycles.max_bounces = 16
    area("key", (-0.55, -0.5, 0.6), (0, 0, 0.05), 0.8, 50, (1, 0.94, 0.86))
    area("fill", (0.7, -0.5, 0.3), (0, 0, 0.05), 1.3, 12, (0.85, 0.95, 1))
    area("back", (0.1, 0.4, 0.2), (0, 0, 0.05), 0.45, 60, (1, 0.82, 0.6))  # lights the tea from behind
    area("rim", (-0.35, 0.45, 0.45), (0, 0, 0.06), 0.6, 26)
    saucer((0, 0, 0))
    istikan((0, 0, 0.6))
    spoon((4.2, -2.6, 1.24), math.radians(-28))
    tin((-9.5, 8.5, 0), 0.25)
    rng = random.Random(4)
    for x, y in [(7.5, -3.5), (9.4, -1.2), (6.4, 2.8), (-6.5, -4.5), (-8.2, -1.6), (10.5, 1.6), (-4.6, -6.6)]:
        cardamom((x, y, 0), (0, 0, rng.uniform(0, math.pi)), rng)
    sugar((8.6, 6.0, 0), math.radians(20))
    sugar((10.4, 6.6, 0), math.radians(-12))
    sugar((9.5, 6.2, 1.52), math.radians(38))
    cam = camera((0.045, -0.5, 0.19), (-0.016, 0.01, 0.08), 66)
    dof(cam, (0, 0, 0.05), 4.0)


# ---------------------------------------------------------------- dolma
def cup(loc, r=1.95, h=1.5, pleats=28):
    """a pleated gold-foil praline cup"""
    seg, rows = pleats * 6, 10
    verts, faces = [], []
    for j in range(seg):
        a = 2 * math.pi * j / seg
        for i in range(rows):
            t = i / (rows - 1)
            rr = (r * 0.78 + (r - r * 0.78) * t) * (1 + 0.035 * math.sin(pleats * a) * t)
            verts.append((rr * math.cos(a) * CM, rr * math.sin(a) * CM, h * t * CM))
    for j in range(seg):
        for i in range(rows - 1):
            a0, b0 = j * rows + i, ((j + 1) % seg) * rows + i
            faces.append((a0, b0, b0 + 1, a0 + 1))
    c = len(verts)
    verts.append((0, 0, 0))
    for j in range(seg):
        faces.append((c, ((j + 1) % seg) * rows, j * rows))
    ob = mesh_obj("cup", verts, faces, gold(0.3))
    sol = ob.modifiers.new("sol", "SOLIDIFY")
    sol.thickness = 0.03 * CM
    return place(ob, loc)


def leaf_mat():
    """cooked vine leaf: matte olive with darker veins, the leaf's wrap lines and a little oil shine"""
    m = principled("vine-leaf", "#4f5a24", 0.55, coat=0.25, spec=0.45)
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Coat Roughness"].default_value = 0.25
    tc = nt.nodes.new("ShaderNodeTexCoord")
    # wrap lines: bands across the roll, bent by noise like a hand-rolled leaf
    wv = nt.nodes.new("ShaderNodeTexWave")
    wv.wave_type = "BANDS"
    wv.bands_direction = "X"
    wv.wave_profile = "SAW"
    wv.inputs["Scale"].default_value = 26
    wv.inputs["Distortion"].default_value = 9
    wv.inputs["Detail"].default_value = 5
    wv.inputs["Detail Scale"].default_value = 2.5
    nt.links.new(tc.outputs["Object"], wv.inputs["Vector"])
    # veins: thin ridged lines from a voronoi distance
    vo = nt.nodes.new("ShaderNodeTexVoronoi")
    vo.feature = "DISTANCE_TO_EDGE"
    vo.inputs["Scale"].default_value = 55
    nt.links.new(tc.outputs["Object"], vo.inputs["Vector"])
    vr = nt.nodes.new("ShaderNodeMapRange")
    vr.inputs["From Min"].default_value = 0.0
    vr.inputs["From Max"].default_value = 0.06
    nt.links.new(vo.outputs["Distance"], vr.inputs["Value"])
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 45
    nz.inputs["Detail"].default_value = 6
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = lin("#2a3416")
    ramp.color_ramp.elements[1].color = lin("#66722e")
    e = ramp.color_ramp.elements.new(0.6)
    e.color = lin("#4c5823")
    nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
    dark = nt.nodes.new("ShaderNodeMix")
    dark.data_type = "RGBA"
    dark.blend_type = "MULTIPLY"
    inv = nt.nodes.new("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    nt.links.new(vr.outputs["Result"], inv.inputs[1])
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = 0.32
    nt.links.new(inv.outputs["Value"], mul.inputs[0])
    nt.links.new(mul.outputs["Value"], dark.inputs["Factor"])
    nt.links.new(ramp.outputs["Color"], dark.inputs["A"])
    dark.inputs["B"].default_value = lin("#1d2410")
    nt.links.new(dark.outputs["Result"], b.inputs["Base Color"])
    hsum = nt.nodes.new("ShaderNodeMath")
    hsum.operation = "MULTIPLY_ADD"
    hsum.inputs[1].default_value = 0.6
    nt.links.new(vr.outputs["Result"], hsum.inputs[0])
    nt.links.new(wv.outputs["Fac"], hsum.inputs[2])
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = 0.55
    bp.inputs["Distance"].default_value = 0.0015
    nt.links.new(hsum.outputs["Value"], bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def onion_mat():
    m = principled("onion", "#c9934a", 0.45, coat=0.3, spec=0.5)
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Subsurface Weight"].default_value = 0.4
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.6, 0.25)
    b.inputs["Subsurface Scale"].default_value = 0.004
    nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    wv = nt.nodes.new("ShaderNodeTexWave")
    wv.wave_type = "RINGS"
    wv.rings_direction = "X"
    wv.inputs["Scale"].default_value = 22
    wv.inputs["Distortion"].default_value = 3
    nt.links.new(tc.outputs["Object"], wv.inputs["Vector"])
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = 0.25
    nt.links.new(wv.outputs["Fac"], bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def roll(loc, rot, mat, length=3.4, r=0.95, seed=0):
    """a stuffed roll lying on its side: blunt-ended, a little uneven, slightly flattened where it rests"""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=28, radius=1)
    ob = bpy.context.active_object
    cap = 0.55  # short, blunt ends rather than round capsule ends
    half = length / 2 - r * cap
    for v in ob.data.vertices:
        x, y, z = v.co
        sx = math.copysign(half, x) if abs(x) > 1e-4 else 0.0
        v.co = Vector((x * r * cap + sx, y * r, z * r * 0.86))
    ob.scale = (CM,) * 3
    bpy.ops.object.transform_apply(scale=True)
    tex = bpy.data.textures.new("lumpy%d" % seed, "CLOUDS")
    tex.noise_scale = 0.012
    dp = ob.modifiers.new("lumps", "DISPLACE")
    dp.texture = tex
    dp.texture_coords = "GLOBAL"
    dp.strength = 0.0011
    dp.mid_level = 0.5
    bpy.ops.object.shade_smooth()
    ob.data.materials.append(mat)
    ob.location = Vector(loc) * CM + Vector((0, 0, r * 0.86 * CM))
    ob.rotation_euler = rot
    return ob


def dolma_box(cols=4, rows=3, pitch=4.3, floor=1.0, h=2.9):
    w, d = cols * pitch + 1.6, rows * pitch + 1.6
    green = velvet("#18301f", "dolma-velvet")
    open_box("dolma", (w, d, h), (0, 0, 0), green, floor=floor, wall=0.8, bevel=0.2)
    box("dolma-tray", (w - 1.58, d - 1.58, 0.2), (0, 0, floor - 0.02), gold(0.3), None, 0.05)
    band("dolma-rim", w, d, h - 0.45)
    leaf, onion = leaf_mat(), onion_mat()
    rng = random.Random(11)
    z = floor + 0.18
    for i in range(cols):
        for j in range(rows):
            x = (i - (cols - 1) / 2) * pitch
            y = (j - (rows - 1) / 2) * pitch
            cup((x, y, z))
            kind = (i + 2 * j) % 3
            mat = onion if kind == 1 else leaf
            roll((x, y, z + 0.08), (0, 0, rng.uniform(-0.3, 0.3) + (math.pi / 2 if (i + j) % 2 else 0)), mat, (3.0 if kind == 1 else 3.4) * rng.uniform(0.93, 1.05), 0.9 if kind == 1 else 0.84, i * 7 + j)
    # the lid, leaning on the back of the box with its top (and the foil) towards the camera
    lw, ld, lh = w + 0.4, d + 0.4, 1.6
    lid = box("dolma-lid", (lw, ld, lh), (0, 0, 0), green, None, 0.3)
    art = decal("dolma-lid-art", "dolma-lid", (w - 2.0, (w - 2.0) * 18 / 24), (0, 0, 0))
    art.parent = lid
    art.location = (0, 0, (lh / 2 + 0.01) * CM)
    a = math.radians(72)
    lid.rotation_euler = (a, 0, 0)
    lid.location = (0, (d / 2 + lh / 2 * math.sin(a) + ld / 2 * math.cos(a) + 0.3) * CM, (ld / 2 * math.sin(a) + lh / 2 * math.cos(a)) * CM)
    return lid


def shot_dolma():
    sweep("#d7c7a6")
    s = bpy.context.scene
    s.view_settings.exposure = -0.5
    area("key", (-0.55, -0.45, 0.7), (0, 0, 0.03), 0.9, 52, (1, 0.95, 0.87))
    area("fill", (0.7, -0.5, 0.35), (0, 0, 0.03), 1.4, 14)
    area("rim", (0.3, 0.6, 0.55), (0, 0, 0.05), 0.8, 36)
    area("top", (0, 0, 0.9), (0, 0, 0), 0.6, 14)
    dolma_box()
    cam = camera((0.0, -0.5, 0.5), (0.0, 0.07, 0.112), 58)
    dof(cam, (0, -0.02, 0.03), 5.6)


def grouped(build, loc=(0, 0, 0), rot=0.0):
    """run a builder that works around the origin, then move everything it made to loc (cm), turned by rot"""
    before = set(bpy.data.objects)
    out = build()
    root = bpy.data.objects.new("group", None)
    bpy.context.collection.objects.link(root)
    for ob in set(bpy.data.objects) - before - {root}:
        if ob.parent is None:
            ob.parent = root
    root.location = Vector(loc) * CM
    root.rotation_euler = (0, 0, rot)
    return out


def shot_cover():
    """the whole collection together, for the cover"""
    sw = sweep("#1c1714")
    sw.location.y += 0.7  # a wider set: keep the curve of the backdrop out of the frame
    s = bpy.context.scene
    s.view_settings.exposure = -0.45
    s.cycles.transmission_bounces = 16
    s.cycles.max_bounces = 16
    area("key", (-0.9, -0.8, 1.0), (0, 0, 0.06), 1.2, 150, (1, 0.94, 0.86))
    area("fill", (1.1, -0.7, 0.45), (0, 0, 0.05), 1.6, 34, (0.9, 0.94, 1))
    area("rim", (0.3, 0.8, 0.8), (0, 0.05, 0.08), 1.0, 110, (1, 0.88, 0.72))
    area("back-amba", (0.27, 0.34, 0.2), (0.165, 0.02, 0.08), 0.4, 50, (1, 0.85, 0.6))
    grouped(lambda: (jewel_box(), samoon((0, -0.6, 6.6 - 0.05 - 0.12), math.radians(2))), (-1, 12, 0), math.radians(4))
    grouped(dolma_box, (-15.5, -5, 0), math.radians(22))
    grouped(lambda: (K.lathe("plinth", rounded(5.5, 0, 3.0, 0.2), mat=principled("plinth", "#141110", 0.08, coat=1.0, spec=0.7)), perfume((0, 0, 3.0), 0.0)), (16.5, 2, 0), math.radians(-16))
    grouped(lambda: (saucer((0, 0, 0)), istikan((0, 0, 0.6))), (6.5, -14, 0))
    for x, y, r in [(14.0, -15, 20), (15.7, -14.2, -12)]:
        sugar((x, y, 0), math.radians(r))
    rng = random.Random(7)
    for x, y in [(-5, -16), (-2.5, -19), (19, -9), (0.5, -21)]:
        cardamom((x, y, 0), (0, 0, rng.uniform(0, math.pi)), rng)
    cam = camera((0.0, -0.88, 0.44), (0.0, 0.0, 0.135), 53)
    dof(cam, (0, -0.02, 0.06), 8.0)


SHOTS = {"cover": shot_cover, "samoon": shot_samoon, "amba": shot_amba, "istikan": shot_istikan, "dolma": shot_dolma}

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    shot = args[0] if args else "samoon"
    preview = "--preview" in sys.argv
    s = K.reset(540 if preview else 1080, 675 if preview else 1350, 40 if preview else 160)
    SHOTS[shot]()
    s.render.filepath = os.path.join(HERE, "renders", shot + ("-preview" if preview else "") + ".png")
    bpy.ops.render.render(write_still=True)
    print("wrote", s.render.filepath)
