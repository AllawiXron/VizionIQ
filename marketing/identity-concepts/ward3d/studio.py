"""WARD product renders (Blender 4.2, Cycles). Builds a seamless studio sweep in a brand colour, soft studio lights and
the products at their real sizes (centimetres, scene unit = 1 cm × 0.01), with gold-foil artwork from tex/*.png.

  python studio.py <shot> [--preview]     shots: lipsticks, skincare, giftbox, bags, compact, hero
"""
import math
import os
import sys

import bpy
import bmesh
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, "tex")
CM = 0.01


def lin(hexstr):
    """sRGB hex -> linear RGBA"""
    h = hexstr.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [1]


WINE, ROSE, GOLD, CHAMP, BLACK, NUDE = "#5e1624", "#b23a4e", "#d8b072", "#eadbc8", "#1b1416", "#e7c3b4"
GOLDLIN = (0.80, 0.60, 0.36, 1)


# ---------------------------------------------------------------- scene
def reset(w=1080, h=1350, samples=160):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = samples
    s.cycles.use_denoising = True
    s.cycles.denoiser = "OPENIMAGEDENOISE"
    s.render.resolution_x, s.render.resolution_y = w, h
    s.render.film_transparent = False
    s.view_settings.view_transform = "Standard"  # keeps the brand colours true (AgX pushes wine to pink)
    s.view_settings.look = "Medium High Contrast"
    s.view_settings.exposure = -0.6
    s.cycles.max_bounces = 8
    world = bpy.data.worlds.new("w")
    s.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.05
    return s


def principled(name, color, rough=0.4, metal=0.0, coat=0.0, spec=0.5, sheen=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(color) if isinstance(color, str) else color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = 0.08
    b.inputs["Specular IOR Level"].default_value = spec
    b.inputs["Sheen Weight"].default_value = sheen
    return m


def gold_bsdf(nt, rough=0.22):
    g = nt.nodes.new("ShaderNodeBsdfPrincipled")
    g.inputs["Base Color"].default_value = (0.80, 0.60, 0.36, 1)
    g.inputs["Metallic"].default_value = 1.0
    g.inputs["Roughness"].default_value = rough
    return g


def printed(name, color, tex, rough=0.32, coat=0.6, foil=True, ink="#d8b072", proj="UV", scale=(1, 1), bump=0.0, plane=None, metal=0.0):
    """a surface with artwork on it: the texture's alpha mixes the base surface with gold foil (or flat ink)"""
    m = principled(name, color, rough, coat=coat, metal=metal)
    nt = m.node_tree
    out = nt.nodes["Material Output"]
    base = nt.nodes["Principled BSDF"]
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(os.path.join(TEX, tex + ".png"))
    img.extension = "CLIP" if scale == (1, 1) else "REPEAT"
    if plane:  # project from above: plane = (width, depth) in cm the image covers, centred on the object
        tc = nt.nodes.new("ShaderNodeTexCoord")
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (1 / (plane[0] * CM), 1 / (plane[1] * CM), 1)
        mp.inputs["Location"].default_value = (0.5, 0.5, 0)
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
        nt.links.new(mp.outputs["Vector"], img.inputs["Vector"])
    img.interpolation = "Cubic"
    if scale != (1, 1):
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (scale[0], scale[1], 1)
        uv = nt.nodes.new("ShaderNodeTexCoord")
        nt.links.new(uv.outputs["UV"], mp.inputs["Vector"])
        nt.links.new(mp.outputs["Vector"], img.inputs["Vector"])
    top = gold_bsdf(nt) if foil else principled("ink", ink, 0.5).node_tree.nodes["Principled BSDF"]
    if not foil:
        top = nt.nodes.new("ShaderNodeBsdfPrincipled")
        top.inputs["Base Color"].default_value = lin(ink)
        top.inputs["Roughness"].default_value = 0.55
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(img.outputs["Alpha"], mix.inputs["Fac"])
    nt.links.new(base.outputs["BSDF"], mix.inputs[1])
    nt.links.new(top.outputs["BSDF"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    if bump:
        bp = nt.nodes.new("ShaderNodeBump")
        bp.inputs["Strength"].default_value = bump
        bp.inputs["Distance"].default_value = 0.0004
        nt.links.new(img.outputs["Alpha"], bp.inputs["Height"])
        nt.links.new(bp.outputs["Normal"], top.inputs["Normal"])
        nt.links.new(bp.outputs["Normal"], base.inputs["Normal"])
    return m


def sweep(color, width=6, depth=3, height=3, radius=0.8):
    """a seamless studio backdrop: floor curving up into a wall"""
    verts, faces = [], []
    prof = []
    for i in range(12):
        prof.append((-depth + i * (depth - radius) / 11, 0))
    for i in range(1, 17):
        a = i / 16 * math.pi / 2
        prof.append((-radius + radius * math.sin(a), radius - radius * math.cos(a)))
    for i in range(1, 12):
        prof.append((0, radius + i * (height - radius) / 11))
    for xi, x in enumerate((-width / 2, width / 2)):
        for y, z in prof:
            verts.append((x, y + 1.0, z))  # the curve starts well behind the products
    n = len(prof)
    for i in range(n - 1):
        faces.append((i, i + 1, n + i + 1, n + i))
    me = bpy.data.meshes.new("sweep")
    me.from_pydata(verts, [], faces)
    ob = bpy.data.objects.new("sweep", me)
    bpy.context.collection.objects.link(ob)
    for p in me.polygons:
        p.use_smooth = True
    ob.data.materials.append(principled("backdrop", color, 0.75, spec=0.3))
    return ob


def area(name, loc, target, size, power, color=(1, 0.97, 0.93)):
    d = bpy.data.lights.new(name, "AREA")
    d.size = size
    d.energy = power
    d.color = color
    o = bpy.data.objects.new(name, d)
    bpy.context.collection.objects.link(o)
    o.location = loc
    direction = Vector(target) - Vector(loc)
    o.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return o


def lights(key=60, fill=16, rim=40):
    area("key", (-0.9, -0.95, 1.1), (0, 0, 0.06), 1.3, key)
    area("fill", (1.1, -0.7, 0.45), (0, 0, 0.06), 1.6, fill, (0.95, 0.96, 1))
    area("rim", (0.35, 0.7, 1.0), (0, 0, 0.08), 1.0, rim)


def camera(loc, target, lens=85):
    c = bpy.data.cameras.new("cam")
    c.lens = lens
    o = bpy.data.objects.new("cam", c)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = o
    return o


# ---------------------------------------------------------------- geometry
def lathe(name, prof, seg=96, mat=None, uv_r=None, uv_z=None, loc=(0, 0, 0), rot=0.0):
    """revolve a profile [(r, z) in cm] around Z. UVs: u around (front, facing -Y, at 0.5), v = z scaled so the
    texture keeps its 2:1 aspect on a circle of radius uv_r centred at height uv_z"""
    rows = len(prof)
    verts, faces, uvs = [], [], []
    for j in range(seg + 1):
        a = -math.pi / 2 + (j / seg - 0.5) * 2 * math.pi  # j = seg/2 -> -90° (front)
        for r, z in prof:
            verts.append((r * math.cos(a) * CM, r * math.sin(a) * CM, z * CM))
    for j in range(seg):
        for i in range(rows - 1):
            a, b = j * rows + i, (j + 1) * rows + i
            faces.append((a, b, b + 1, a + 1))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate()
    uvl = me.uv_layers.new(name="UVMap")
    R = uv_r if uv_r else max(r for r, _ in prof)
    Zc = uv_z if uv_z is not None else (prof[0][1] + prof[-1][1]) / 2
    circ = 2 * math.pi * R
    for poly in me.polygons:
        for li in poly.loop_indices:
            vi = me.loops[li].vertex_index
            j, i = divmod(vi, rows)
            z = prof[i][1]
            uvl.data[li].uv = (j / seg, 0.5 + (z - Zc) / (circ / 2))
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    ob.location = (loc[0] * CM, loc[1] * CM, loc[2] * CM)
    ob.rotation_euler = (0, 0, rot)
    if mat:
        ob.data.materials.append(mat)
    m = ob.modifiers.new("ws", "WEIGHTED_NORMAL")
    return ob


def rounded(r, z0, z1, br=0.15, n=6, top=True, bottom=True):
    """profile of a cylinder with rounded rims (cm)"""
    p = [(0, z0)]
    if bottom:
        for k in range(n + 1):
            a = -math.pi / 2 + k / n * math.pi / 2
            p.append((r - br + br * math.cos(a), z0 + br + br * math.sin(a)))
    else:
        p.append((r, z0))
    if top:
        for k in range(n + 1):
            a = k / n * math.pi / 2
            p.append((r - br + br * math.cos(a), z1 - br + br * math.sin(a)))
    else:
        p.append((r, z1))
    p.append((0, z1))
    return p


def box(name, size, loc, mat_side, mat_top=None, bevel=0.15, rot=0.0):
    """a box (cm); top face gets its own material, UVs per face"""
    bpy.ops.mesh.primitive_cube_add(size=1)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (size[0] * CM, size[1] * CM, size[2] * CM)
    ob.location = (loc[0] * CM, loc[1] * CM, loc[2] * CM + size[2] * CM / 2)
    ob.rotation_euler = (0, 0, rot)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    ob.data.materials.append(mat_side)
    if mat_top:
        ob.data.materials.append(mat_top)
        for p in ob.data.polygons:
            if p.normal.z > 0.9:
                p.material_index = 1
    bv = ob.modifiers.new("bevel", "BEVEL")
    bv.width = bevel * CM
    bv.segments = 4
    bv.limit_method = "ANGLE"
    for p in ob.data.polygons:
        p.use_smooth = True
    ob.modifiers.new("wn", "WEIGHTED_NORMAL")
    return ob


def cut_slant(ob, z, angle_deg):
    """cut the top of a lathe off along a slanted plane through height z (cm) and close it (the lipstick bullet)"""
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    th = math.radians(angle_deg)
    no = Vector((0, -math.sin(th), math.cos(th)))  # tilted towards the camera, so the slope faces it
    res = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, z * CM), plane_no=no, clear_outer=True)
    edges = [e for e in res["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
    bmesh.ops.holes_fill(bm, edges=edges)
    bm.to_mesh(ob.data)
    bm.free()
    for p in ob.data.polygons:
        p.use_smooth = abs(p.normal.dot(no)) < 0.99
    return ob


# ---------------------------------------------------------------- products
def lipstick(loc, rot=0.0, open_=True, shade=ROSE, case=WINE, tilt=0.0):
    x, y, z = loc
    parts = []
    lac = printed("case-" + case, case, "wrap-logo", rough=0.18, coat=1.0) if not open_ else principled("lacquer", case, 0.18, coat=1.0)
    gold = principled("gold", GOLDLIN, 0.2, metal=1.0)
    parts.append(lathe("lip-base", rounded(1.05, 0, 5.0, 0.12), mat=lac, uv_r=1.05 * 2.2, uv_z=2.6, loc=loc, rot=rot))
    if open_:
        parts.append(lathe("lip-sleeve", rounded(0.9, 5.0, 6.1, 0.06, bottom=False), mat=gold, loc=loc, rot=rot))
        bullet = lathe("lip-bullet", rounded(0.68, 6.0, 8.4, 0.05, top=False), mat=principled("bullet-" + shade, shade, 0.42, spec=0.6), loc=loc, rot=rot)
        cut_slant(bullet, 7.9, 40)
        parts.append(bullet)
    else:
        parts.append(lathe("lip-cap", rounded(1.08, 5.0, 8.6, 0.12, bottom=False), mat=gold, loc=loc, rot=rot))
    return parts


def jar(loc, rot=0.0, body=WINE, label="label-jar"):
    lac = printed("jar-" + label, body, label, rough=0.25, coat=0.8)
    gold = principled("gold", GOLDLIN, 0.2, metal=1.0)
    return [lathe("jar", rounded(3.6, 0, 4.4, 0.45), mat=lac, uv_r=3.6, uv_z=2.05, loc=loc, rot=rot),
            lathe("jar-lid", rounded(3.75, 4.3, 6.2, 0.35, bottom=False), mat=gold, loc=loc, rot=rot)]


def pump(loc, rot=0.0, body=WINE, label="label-pump"):
    lac = printed("pump-" + label, body, label, rough=0.22, coat=0.9)
    gold = principled("gold", GOLDLIN, 0.2, metal=1.0)
    prof = [(0, 0)] + [(3.0 - 0.5 + 0.5 * math.cos(-math.pi / 2 + k / 6 * math.pi / 2), 0.5 + 0.5 * math.sin(-math.pi / 2 + k / 6 * math.pi / 2)) for k in range(7)]
    prof += [(3.0, 13.0)] + [(1.25 + 1.75 * math.cos(k / 8 * math.pi / 2), 13.0 + 2.2 * math.sin(k / 8 * math.pi / 2)) for k in range(9)] + [(1.25, 16.0), (0, 16.0)]
    parts = [lathe("pump-body", prof, mat=lac, uv_r=3.0 * 1.25, uv_z=6.8, loc=loc, rot=rot)]
    parts.append(lathe("pump-collar", rounded(1.5, 15.6, 17.4, 0.12), mat=gold, loc=loc, rot=rot))
    parts.append(lathe("pump-stem", rounded(0.45, 17.3, 19.0, 0.05, bottom=False), mat=gold, loc=loc, rot=rot))
    parts.append(lathe("pump-head", rounded(1.15, 19.0, 20.6, 0.3), mat=gold, loc=loc, rot=rot))
    nz = box("pump-nozzle", (0.9, 3.4, 0.7), (loc[0], loc[1] - 2.0, loc[2] + 19.7), gold, bevel=0.3)
    return parts + [nz]


def tube(loc, rot=0.0, body=WINE, label="label-tube", length=15.0, r=1.8):
    """a squeeze tube standing on its cap: round at the cap, flattening to a crimped seal at the top"""
    seg, rows = 96, 48
    verts, faces = [], []
    for j in range(seg + 1):
        a = -math.pi / 2 + (j / seg - 0.5) * 2 * math.pi
        for i in range(rows):
            t = i / (rows - 1)
            k = t ** 1.6
            ax = r * (1 + 0.57 * k)  # wider as it flattens
            ay = r * max(0.02, 1 - k)
            verts.append((ax * math.cos(a) * CM, ay * math.sin(a) * CM, (2.0 + t * length) * CM))
    for j in range(seg):
        for i in range(rows - 1):
            a0, b0 = j * rows + i, (j + 1) * rows + i
            faces.append((a0, b0, b0 + 1, a0 + 1))
    me = bpy.data.meshes.new("tube")
    me.from_pydata(verts, [], faces)
    uvl = me.uv_layers.new(name="UVMap")
    circ = 2 * math.pi * r * 1.25
    for poly in me.polygons:
        for li in poly.loop_indices:
            j, i = divmod(me.loops[li].vertex_index, rows)
            t = i / (rows - 1)
            uvl.data[li].uv = (j / seg, 0.5 + ((2.0 + t * length) - 9.5) / (circ / 2))
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new("tube", me)
    bpy.context.collection.objects.link(ob)
    ob.location = (loc[0] * CM, loc[1] * CM, loc[2] * CM)
    ob.rotation_euler = (0, 0, rot)
    ob.data.materials.append(printed("tube-" + label, body, label, rough=0.3, coat=0.7))
    seal = box("tube-seal", (r * 2 * 1.57 + 0.1, 0.3, 1.2), (loc[0], loc[1], loc[2] + 2.0 + length - 0.2), principled("seal", body, 0.4), bevel=0.1, rot=rot)
    cap = lathe("tube-cap", rounded(1.9, 0, 2.2, 0.2), mat=principled("gold", GOLDLIN, 0.2, metal=1.0), loc=loc, rot=rot)
    return [ob, seal, cap]


def podium(loc, r, h, color, rough=0.6):
    return lathe("podium", rounded(r, 0, h, 0.25), mat=principled("podium-" + color, color, rough, spec=0.3), loc=loc)


def compact(loc, rot=0.0, r=4.2):
    gold = principled("gold", GOLDLIN, 0.2, metal=1.0)
    base = lathe("compact-base", rounded(r, 0, 0.9, 0.3, top=False), mat=gold, loc=loc, rot=rot)
    lid_mat = printed("compact-lid", GOLDLIN, "rose-only", rough=0.24, coat=0.0, foil=False, ink="#5e1624", plane=(r * 1.5, r * 1.5), bump=1.0, metal=1.0)
    lid = lathe("compact-lid", rounded(r, 0.88, 1.75, 0.35, bottom=False), mat=lid_mat, loc=loc, rot=rot)
    return [base, lid]


def giftbox(loc, size=(19, 13, 6.5), rot=0.0, lid_off=False):
    w, d, h = size
    side = printed("box-side", WINE, "pattern", rough=0.55, coat=0.2, scale=(1.15, 1.15))
    top = printed("box-top", WINE, "wrap-logo", rough=0.5, coat=0.2, plane=(w * 1.25, w * 1.25 / 2), bump=0.6)
    parts = [box("box-base", (w, d, h * 0.86), loc, side, None, 0.2, rot)]
    if lid_off:
        parts.append(box("box-lid", (w + 0.4, d + 0.4, 2.4), (loc[0] - 6, loc[1] + 9, loc[2]), side, top, 0.25, rot + 0.35))
    else:
        parts.append(box("box-lid", (w + 0.4, d + 0.4, 2.6), (loc[0], loc[1], loc[2] + h * 0.86 - 2.0), side, top, 0.25, rot))
    return parts


def bag(loc, size=(22, 10, 27), rot=0.0, color=WINE, label="wrap-logo", foil=True):
    w, d, h = size
    paper = principled("bag-" + color, color, 0.8, spec=0.25)
    front = printed("bag-front-" + color, color, label, rough=0.8, coat=0.0, plane=(w * 1.05, w * 1.05 / 2), foil=foil, ink=WINE)
    ob = box("bag", size, loc, paper, None, 0.05, rot)
    me = ob.data
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.normal.z > 0.9], context="FACES")
    bm.to_mesh(me); bm.free()
    ob.data.materials.append(front)
    for p in me.polygons:
        if p.normal.y < -0.9:
            p.material_index = 1
    so = ob.modifiers.new("solid", "SOLIDIFY"); so.thickness = 0.12 * CM
    ob.modifiers.move(len(ob.modifiers) - 1, 0)
    # the front texture is projected from above in object space; make it face the front instead
    nt = front.node_tree
    mp = [n for n in nt.nodes if n.type == "MAPPING"][0]
    W = w * 1.05
    mp.inputs["Scale"].default_value = (1 / (W * CM), 1, 1 / (W / 2 * CM))
    mp.inputs["Rotation"].default_value = (math.radians(-90), 0, 0)
    mp.inputs["Location"].default_value = (0.5, 0.5 - 0.24 * h / W, 0)  # logo a little above the middle
    handles = []
    for side in (-1, 1):
        cu = bpy.data.curves.new("handle", "CURVE"); cu.dimensions = "3D"
        sp = cu.splines.new("BEZIER"); sp.bezier_points.add(2)
        yy = side * d * 0.5 * 0.98
        pts = [(-w * 0.22, yy, h / 2 - 0.2), (0, yy, h / 2 + 8.5), (w * 0.22, yy, h / 2 - 0.2)]
        for bp, (px, py, pz) in zip(sp.bezier_points, pts):
            bp.co = (px * CM, py * CM, pz * CM); bp.handle_left_type = bp.handle_right_type = "AUTO"
        cu.bevel_depth = 0.28 * CM; cu.bevel_resolution = 4
        ho = bpy.data.objects.new("handle", cu); bpy.context.collection.objects.link(ho)
        ho.data.materials.append(principled("rope", GOLDLIN if color != CHAMP else lin(WINE), 0.5, metal=0.6 if color != CHAMP else 0))
        ho.parent = ob
        handles.append(ho)
    return [ob] + handles


def dof(cam, target, fstop=2.8):
    cam.data.dof.use_dof = True
    cam.data.dof.focus_distance = (Vector(target) - cam.location).length
    cam.data.dof.aperture_fstop = fstop


# ---------------------------------------------------------------- shots
def group(parts, loc=(0, 0, 0), rot=(0, 0, 0)):
    """move and turn a set of parts together (cm, degrees)"""
    e = bpy.data.objects.new("grp", None)
    bpy.context.collection.objects.link(e)
    for p in parts:
        p.parent = e
    e.location = (loc[0] * CM, loc[1] * CM, loc[2] * CM)
    e.rotation_euler = [math.radians(a) for a in rot]
    return e


DEEP = "#4d1220"


def shot_lipsticks():
    sweep(DEEP)
    lights()
    lipstick((-2.6, 1.6, 0), 0.0, False)
    lipstick((0, 0, 0), 0.0, True, ROSE)
    lipstick((2.7, 1.2, 0), 0.0, True, "#8a1f30")
    group(lipstick((0, 0, 0), 0.0, True, NUDE), (3.2, -4.2, 1.06), (0, 90, 18))
    group(lipstick((0, 0, 0), 0.0, False), (-4.8, -3.4, 1.06), (0, 90, -12))
    cam = camera((0.0, -0.40, 0.15), (0.0, 0.0, 0.035), 85)
    dof(cam, (0, 0, 0.05), 4.0)


def shot_skincare():
    sweep("#e2ccb4")
    lights(52, 14, 34)
    bpy.context.scene.view_settings.exposure = -1.0
    podium((0, 3, 0), 8.5, 5.0, WINE)
    pump((0, 3, 5.0))
    podium((-9.5, -3, 0), 6.5, 2.2, "#c9ab8e")
    jar((-9.5, -3, 2.2))
    tube((9.5, -2.0, 0), 0.25)
    cam = camera((0.0, -0.78, 0.25), (0.0, 0.0, 0.10), 70)
    dof(cam, (0, 0, 0.1), 5.6)


def shot_giftbox():
    sweep(DEEP)
    lights(56, 16, 40)
    giftbox((0, 2, 0), rot=math.radians(-12))
    group(lipstick((0, 0, 0), 0.0, True, ROSE), (-8.0, -9.0, 1.06), (0, 90, -25))
    compact((8.5, -9.5, 0), 0.0)
    cam = camera((0.0, -0.55, 0.42), (0.0, -0.02, 0.03), 62)
    dof(cam, (0, -0.02, 0.05), 5.6)


def shot_bags():
    sweep("#d8b5a6")
    lights(60, 18, 40)
    bpy.context.scene.view_settings.exposure = -1.0
    bag((-7, 3, 0), rot=math.radians(14))
    bag((9, -2, 0), (18, 8, 22), rot=math.radians(-18), color=CHAMP, label="wrap-logo", foil=False)
    cam = camera((0.0, -1.15, 0.30), (0.01, 0.0, 0.16), 70)
    dof(cam, (0, 0, 0.15), 8)


def shot_compact():
    sweep(DEEP)
    lights(50, 12, 46)
    podium((0, 0, 0), 7.5, 3.0, WINE, 0.45)
    compact((0, 0, 3.0))
    group(lipstick((0, 0, 0), 0.0, True, "#8a1f30"), (6.5, -6.5, 1.06), (0, 90, 30))
    cam = camera((0.0, -0.36, 0.30), (0.0, 0.0, 0.035), 70)
    dof(cam, (0, 0, 0.045), 4.0)


def shot_hero():
    sweep(DEEP)
    lights(56, 16, 44)
    podium((0, 8, 0), 9.0, 7.0, "#6a1a29")
    pump((0, 8, 7.0))
    podium((-11.5, 3, 0), 6.5, 3.0, "#6a1a29")
    jar((-11.5, 3, 3.0))
    tube((11.5, 5, 0), 0.0)
    giftbox((-8.5, -10, 0), (14, 9.5, 5.2), rot=math.radians(14))
    lipstick((2.5, -7.5, 0), 0, True, ROSE)
    lipstick((5.6, -5.8, 0), 0, False)
    compact((11.5, -9.5, 0))
    cam = camera((0.0, -0.86, 0.31), (0.0, -0.01, 0.08), 55)
    dof(cam, (0, -0.03, 0.08), 8)


SHOTS = {"lipsticks": shot_lipsticks, "skincare": shot_skincare, "giftbox": shot_giftbox, "bags": shot_bags, "compact": shot_compact, "hero": shot_hero}

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    shot = args[0] if args else "lipsticks"
    preview = "--preview" in sys.argv
    s = reset(540 if preview else 1080, 675 if preview else 1350, 48 if preview else 128)
    SHOTS[shot]()
    s.render.filepath = os.path.join(HERE, "renders", shot + ("-preview" if preview else "") + ".png")
    bpy.ops.render.render(write_still=True)
    print("wrote", s.render.filepath)
