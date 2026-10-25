# Studio props for the viZion trial reel, after the user's reference (real objects floating in front of a soft grey
# wall, each with its own shadow): every object is modelled here and rendered in Cycles on a transparent background, lit
# like a product shot (a big soft key from the top left, a rim from the right, a soft fill). The page adds the drop
# shadow on the wall. viZion colours: blue #1769f5, navy #0b2a6e, the logo's yellow #f2b51d.
#   blender -b -P props.py -- OUTDIR [name ...]
import bpy, bmesh, math, sys, os, json
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
OUT = argv[0]
ONLY = set(argv[1:])
HERE = os.path.dirname(os.path.abspath(__file__))
BLUE, NAVY, YELLOW, WHITE = '#1769f5', '#0b2a6e', '#f2b51d', '#f4f6fa'


def srgb(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1.0,)


def reset(res=1100, samples=int(os.environ.get('SAMPLES', 128))):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.exposure = -0.35
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.resolution_x = sc.render.resolution_y = res
    sc.render.resolution_percentage = int(os.environ.get('PCT', 100))
    # a real photo studio (Poly Haven «Studio Small 09», CC0) for the light and every reflection, plus one soft key
    w = bpy.data.worlds.new('w')
    w.use_nodes = True
    nt = w.node_tree
    env = nt.nodes.new('ShaderNodeTexEnvironment')
    env.image = bpy.data.images.load(os.path.join(HERE, 'hdri', 'studio.hdr'))
    mp = nt.nodes.new('ShaderNodeMapping')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp.inputs['Rotation'].default_value = (0, 0, math.radians(200))
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector'])
    nt.links.new(mp.outputs['Vector'], env.inputs['Vector'])
    nt.links.new(env.outputs['Color'], nt.nodes['Background'].inputs['Color'])
    nt.nodes['Background'].inputs['Strength'].default_value = 0.9
    sc.world = w
    ld = bpy.data.lights.new('key', 'AREA')
    ld.size = 1.2
    ld.energy = 160
    lo = bpy.data.objects.new('key', ld)
    sc.collection.objects.link(lo)
    lo.location = (-1.0, -1.2, 1.4)
    lo.rotation_euler = (Vector((0, 0, 0.05)) - lo.location).to_track_quat('-Z', 'Y').to_euler()
    return sc


def camera(sc, dist=1.6, height=0.18, lens=70, target=(0, 0, 0)):
    """Point the camera from this direction, then pull it back until every object fits (finish.py trims the frame)."""
    cd = bpy.data.cameras.new('cam')
    cd.lens = lens
    co = bpy.data.objects.new('cam', cd)
    sc.collection.objects.link(co)
    co.location = (0, -dist, height)
    co.rotation_euler = (Vector(target) - co.location).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = co
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in sc.objects:
        if o.type in ('MESH', 'CURVE'):
            e = o.evaluated_get(dg)
            me = e.to_mesh()
            pts += [c for v in me.vertices for c in (e.matrix_world @ v.co)]
            e.to_mesh_clear()
    loc, _ = co.camera_fit_coords(dg, pts)
    fwd = co.matrix_world.to_quaternion() @ Vector((0, 0, -1))
    co.location = Vector(loc) - fwd * 0.12 * (Vector(loc) - Vector(target)).length


def grain(m, scale=180.0, strength=0.15, detail=8.0, tint=None, tint_amt=0.0):
    """Surface texture: a fine noise bump (paper fibre, plastic, worn metal) and, if asked, a little colour mottling."""
    nt = m.node_tree
    p = nt.nodes['Principled BSDF']
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale
    nz.inputs['Detail'].default_value = detail
    bp = nt.nodes.new('ShaderNodeBump')
    bp.inputs['Strength'].default_value = strength
    bp.inputs['Distance'].default_value = 0.002
    nt.links.new(nz.outputs['Fac'], bp.inputs['Height'])
    nt.links.new(bp.outputs['Normal'], p.inputs['Normal'])
    if tint:
        mx = nt.nodes.new('ShaderNodeMix')
        mx.data_type = 'RGBA'
        nz2 = nt.nodes.new('ShaderNodeTexNoise')
        nz2.inputs['Scale'].default_value = scale / 30
        rm = nt.nodes.new('ShaderNodeMapRange')
        nt.links.new(nz2.outputs['Fac'], rm.inputs['Value'])
        rm.inputs['To Max'].default_value = tint_amt
        nt.links.new(rm.outputs['Result'], mx.inputs['Factor'])
        mx.inputs['A'].default_value = p.inputs['Base Color'].default_value[:]
        mx.inputs['B'].default_value = srgb(tint)
        nt.links.new(mx.outputs['Result'], p.inputs['Base Color'])
    return m


def mat(name, color, rough=0.3, metal=0.0, coat=0.0, sss=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = srgb(color) if isinstance(color, str) else color
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    p.inputs['Coat Weight'].default_value = coat
    p.inputs['Coat Roughness'].default_value = 0.08
    if sss:
        p.inputs['Subsurface Weight'].default_value = sss
    return m


def link(sc, data, name, m=None):
    ob = bpy.data.objects.new(name, data)
    sc.collection.objects.link(ob)
    if m is not None and hasattr(data, 'materials'):
        data.materials.append(m)
    return ob


def to_mesh(ob):
    bpy.context.view_layer.objects.active = ob
    for o in bpy.context.view_layer.objects:
        o.select_set(o == ob)
    bpy.ops.object.convert(target='MESH')
    return ob


def smooth(ob, sub=0, bevel=0.0, seg=4):
    if bevel:
        b = ob.modifiers.new('bv', 'BEVEL')
        b.width = bevel
        b.segments = seg
        b.limit_method = 'ANGLE'
    if sub:
        s = ob.modifiers.new('ss', 'SUBSURF')
        s.levels = s.render_levels = sub
    ob.data.shade_smooth() if hasattr(ob.data, 'shade_smooth') else None
    return ob


def box(sc, name, size, loc, m, bevel=0.004):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    ob = link(sc, me, name, m)
    ob.scale = size
    ob.location = loc
    bpy.context.view_layer.objects.active = ob
    for o in bpy.context.view_layer.objects:
        o.select_set(o == ob)
    bpy.ops.object.transform_apply(scale=True)
    return smooth(ob, bevel=bevel, seg=4)


def cyl(sc, name, r1, r2, depth, loc, m, rot=(0, 0, 0), segs=96):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r1, radius2=r2, depth=depth)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    ob = link(sc, me, name, m)
    ob.location = loc
    ob.rotation_euler = rot
    return smooth(ob, bevel=min(r1, depth) * 0.08, seg=3)


def shape2d(sc, name, polys, extrude, bevel, m, res=10):
    """A filled 2D outline (list of point lists, in the XY plane) extruded and bevelled into a soft, puffy solid."""
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '2D'
    cu.fill_mode = 'BOTH'
    cu.extrude = extrude
    cu.bevel_depth = bevel
    cu.bevel_resolution = res
    for pts in polys:
        sp = cu.splines.new('POLY')
        sp.points.add(len(pts) - 1)
        for p, q in zip(sp.points, pts):
            p.co = (q[0], q[1], 0, 1)
        sp.use_cyclic_u = True
    ob = link(sc, cu, name, m)
    to_mesh(ob)
    ob.data.shade_smooth()
    return ob


def rrect(w, h, r, n=12, cx=0.0, cy=0.0):
    pts = []
    for (ox, oy, a0) in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((cx + ox + r * math.cos(a), cy + oy + r * math.sin(a)))
    return pts


def stand(ob):
    """Turn an XY-plane shape upright so its face looks at the camera (-Y)."""
    ob.rotation_euler = (math.radians(90), 0, 0)
    return ob


def render(sc, name):
    sc.render.filepath = os.path.join(OUT, name + '.png')
    bpy.ops.render.render(write_still=True)
    print('wrote', name)


# ── an inflated speech bubble (front-on; the page writes the message on it), its tail at the bottom left or right
def bubble(name, w, color, tail='l'):
    sc = reset(res=1200)
    h = 0.12
    body = rrect(w, h, h * 0.42, 14)
    s = 1 if tail == 'r' else -1
    # the tail: a short curved wedge out of the bottom corner, merged into the outline
    x0 = s * (w / 2 - h * 0.55)
    tailpts = [(x0 - s * 0.02, -h / 2 + 0.01), (x0 + s * 0.055, -h / 2 - 0.045), (x0 + s * 0.04, -h / 2 + 0.01)]
    m = grain(mat('b', color, rough=0.32, coat=0.45), scale=260, strength=0.04)
    ob = shape2d(sc, 'body', [body], 0.012, 0.016, m)
    t = shape2d(sc, 'tail', [tailpts], 0.01, 0.012, m, res=6)
    for o in (ob, t):
        stand(o)
    camera(sc, dist=0.95 + w * 0.9, height=0.04, lens=85)
    render(sc, name)


# ── a price tag on its string, the paper a little curled
def tag(name):
    sc = reset()
    W, H = 0.16, 0.25
    out = [(-W / 2, -H / 2 + 0.01), (W / 2, -H / 2 + 0.01)] + [(W / 2, H / 2 - 0.06), (0.025, H / 2), (-0.025, H / 2), (-W / 2, H / 2 - 0.06)]
    hole = [(0.012 * math.cos(a * math.pi / 16), H / 2 - 0.04 + 0.012 * math.sin(a * math.pi / 16)) for a in range(32)][::-1]
    paper = grain(mat('p', '#efe4cc', rough=0.75, sss=0.05), scale=420, strength=0.35, tint='#c9b58e', tint_amt=0.4)
    t = shape2d(sc, 'tag', [out, hole], 0.002, 0.0015, paper, res=3)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.016, minor_radius=0.0028, location=(0, H / 2 - 0.04, 0.001), major_segments=64, minor_segments=16)
    ring = bpy.context.active_object
    ring.data.materials.append(mat('steel', (0.8, 0.8, 0.82, 1), rough=0.18, metal=1.0))
    ring.data.shade_smooth()
    # the string, up and out of frame
    cu = bpy.data.curves.new('str', 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = 0.0016
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(1)
    a, b = sp.bezier_points
    a.co, a.handle_left, a.handle_right = (0, H / 2 - 0.04, 0.003), (0, H / 2 - 0.06, 0.003), (0.0, H / 2 + 0.02, 0.01)
    b.co, b.handle_left, b.handle_right = (0.03, H / 2 + 0.2, 0.0), (0.02, H / 2 + 0.12, 0.01), (0.04, H / 2 + 0.3, 0)
    link(sc, cu, 'str', mat('s', '#f4efe6', rough=0.8))
    piv = bpy.data.objects.new('piv', None)
    sc.collection.objects.link(piv)
    for o in sc.collection.objects:
        if o.type in ('MESH', 'CURVE'):
            o.parent = piv
    piv.rotation_euler = (math.radians(90), math.radians(-8), math.radians(-24))
    sm = t.modifiers.new('bend', 'SIMPLE_DEFORM')
    sm.deform_method = 'BEND'
    sm.angle = math.radians(14)
    sm.deform_axis = 'Y'
    camera(sc, dist=1.1, height=0.1, lens=70, target=(0, 0, 0.03))
    render(sc, name)


# ── a megaphone, pointing to the left
def megaphone(name):
    sc = reset()
    white = grain(mat('w', WHITE, rough=0.3, coat=0.4), scale=260, strength=0.04)
    blue = mat('bl', BLUE, rough=0.3, coat=0.5)
    dark = mat('d', '#1b1f2a', rough=0.5)
    r = (0, math.radians(-90), 0)
    cyl(sc, 'horn', 0.035, 0.12, 0.22, (-0.05, 0, 0), white, rot=r)
    cyl(sc, 'lip', 0.124, 0.124, 0.022, (-0.165, 0, 0), blue, rot=r)
    cyl(sc, 'mouth', 0.112, 0.112, 0.024, (-0.166, 0, 0), dark, rot=r)
    cyl(sc, 'back', 0.05, 0.05, 0.08, (0.1, 0, 0), blue, rot=r)
    cyl(sc, 'cap', 0.054, 0.054, 0.012, (0.142, 0, 0), white, rot=r)
    box(sc, 'handle', (0.03, 0.045, 0.11), (0.06, 0, -0.08), dark, bevel=0.01)
    box(sc, 'trig', (0.012, 0.025, 0.04), (0.03, 0, -0.05), blue, bevel=0.004)
    piv = bpy.data.objects.new('piv', None)
    sc.collection.objects.link(piv)
    for o in sc.collection.objects:
        if o.type == 'MESH':
            o.parent = piv
    piv.rotation_euler = (math.radians(4), math.radians(-14), math.radians(-28))
    camera(sc, dist=1.35, height=0.2, lens=70)
    render(sc, name)


# ── a cardboard parcel, taped, with a blue label: an order
def parcel(name):
    sc = reset()
    kraft = grain(mat('k', '#b98b58', rough=0.82), scale=380, strength=0.4, tint='#8f6439', tint_amt=0.45)
    tape = mat('t', '#d9b98c', rough=0.2, coat=0.3)
    label = mat('l', WHITE, rough=0.6)
    blue = mat('bl', BLUE, rough=0.5)
    box(sc, 'box', (0.24, 0.18, 0.16), (0, 0, 0), kraft, bevel=0.006)
    box(sc, 'tape', (0.05, 0.184, 0.0015), (0, 0, 0.0805), tape, bevel=0.0005)
    box(sc, 'tape2', (0.05, 0.0015, 0.06), (0, -0.0905, 0.05), tape, bevel=0.0005)
    box(sc, 'label', (0.09, 0.0012, 0.06), (0.06, -0.0905, -0.03), label, bevel=0.001)
    box(sc, 'lb', (0.07, 0.0013, 0.012), (0.06, -0.0912, -0.012), blue, bevel=0.0005)
    piv = bpy.data.objects.new('piv', None)
    sc.collection.objects.link(piv)
    for o in sc.collection.objects:
        if o.type == 'MESH':
            o.parent = piv
    piv.rotation_euler = (0, 0, math.radians(-26))
    camera(sc, dist=1.25, height=0.55, lens=70)
    render(sc, name)


# ── a target with a dart in the bull
def target(name):
    sc = reset()
    cols = [mat('c0', NAVY, 0.35, coat=0.3), mat('c1', WHITE, 0.4, coat=0.3), mat('c2', BLUE, 0.35, coat=0.3), mat('c3', WHITE, 0.4, coat=0.3), mat('c4', BLUE, 0.35, coat=0.3), mat('c5', YELLOW, 0.35, coat=0.3)]
    rot = (math.radians(90), 0, 0)
    for i, m in enumerate(cols):
        r = 0.15 * (1 - i / len(cols))
        cyl(sc, f'r{i}', r, r, 0.03 + i * 0.002, (0, -i * 0.001, 0), m, rot=rot, segs=128)
    steel = mat('st', (0.8, 0.8, 0.82, 1), rough=0.2, metal=1.0)
    yel = mat('y', YELLOW, 0.4)
    nav = mat('n', NAVY, 0.3, coat=0.4)
    dart = bpy.data.objects.new('dart', None)
    sc.collection.objects.link(dart)
    parts = [cyl(sc, 'tip', 0.002, 0.0005, 0.04, (0, 0, 0.02), steel), cyl(sc, 'barrel', 0.007, 0.006, 0.06, (0, 0, 0.07), nav), cyl(sc, 'shaft', 0.0035, 0.0035, 0.06, (0, 0, 0.13), steel)]
    for k in range(4):
        f = box(sc, f'f{k}', (0.0012, 0.04, 0.05), (0, 0, 0.17), yel, bevel=0.0005)
        f.rotation_euler = (0, 0, math.radians(45 + 90 * k))
        f.location = (0.018 * math.cos(math.radians(45 + 90 * k + 90)), 0.018 * math.sin(math.radians(45 + 90 * k + 90)), 0.17)
        parts.append(f)
    for p in parts:
        p.parent = dart
    dart.location = (0.006, -0.03, 0.01)
    dart.rotation_euler = (math.radians(-62), 0, math.radians(-30))
    piv = bpy.data.objects.new('piv', None)
    sc.collection.objects.link(piv)
    for o in [o for o in sc.collection.objects if o.type == 'MESH' and o.parent is None] + [dart]:
        o.parent = piv
    piv.rotation_euler = (0, 0, math.radians(18))
    camera(sc, dist=1.3, height=0.12, lens=70)
    render(sc, name)


# ── a gift box: the offer
def gift(name):
    sc = reset()
    blue = grain(mat('b', BLUE, rough=0.55), scale=500, strength=0.2)
    rib = mat('r', YELLOW, rough=0.25, coat=0.6)
    box(sc, 'box', (0.2, 0.2, 0.16), (0, 0, 0), blue, bevel=0.004)
    box(sc, 'lid', (0.212, 0.212, 0.04), (0, 0, 0.09), blue, bevel=0.004)
    box(sc, 'r1', (0.03, 0.216, 0.205), (0, 0, 0.0225), rib, bevel=0.001)
    box(sc, 'r2', (0.216, 0.03, 0.205), (0, 0, 0.0225), rib, bevel=0.001)
    for k, a in enumerate((35, 145)):
        bm = bmesh.new()
        bmesh.ops.create_circle(bm, cap_ends=False, radius=0.04, segments=48)
        me = bpy.data.meshes.new(f'loop{k}')
        bm.to_mesh(me)
        lo = link(sc, me, f'loop{k}', rib)
        sol = lo.modifiers.new('so', 'SOLIDIFY')
        sol.thickness = 0.006
        lo.scale = (1.0, 0.55, 1)
        lo.location = (0.035 * math.cos(math.radians(a)) * 1.2, 0.035 * math.sin(math.radians(a)) * 0.2, 0.14)
        lo.rotation_euler = (math.radians(90), math.radians(a - 90 + 20 * (1 if k else -1)), 0)
        ext = box(sc, f'tail{k}', (0.026, 0.07, 0.003), (0, 0, 0.11), rib, bevel=0.0008)
        ext.rotation_euler = (0, 0, math.radians(a + 90))
    cyl(sc, 'knot', 0.016, 0.016, 0.03, (0, 0, 0.122), rib, rot=(math.radians(90), 0, 0))
    piv = bpy.data.objects.new('piv', None)
    sc.collection.objects.link(piv)
    for o in sc.collection.objects:
        if o.type == 'MESH':
            o.parent = piv
    piv.rotation_euler = (0, 0, math.radians(30))
    camera(sc, dist=1.3, height=0.5, lens=70, target=(0, 0, 0.03))
    render(sc, name)


# ── a horseshoe magnet: persuasion
def magnet(name):
    sc = reset()
    blue = grain(mat('b', '#d4262c', rough=0.3, coat=0.6), scale=260, strength=0.05)
    steel = mat('s', (0.82, 0.83, 0.86, 1), rough=0.15, metal=1.0)
    cu = bpy.data.curves.new('u', 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = 0.032
    cu.bevel_resolution = 8
    sp = cu.splines.new('POLY')
    pts = [(-0.07, 0.12)] + [(0.07 * math.cos(math.radians(a)), -0.07 * math.sin(math.radians(a)) * 1.0) for a in range(180, 361, 6)][::-1][::-1] + [(0.07, 0.12)]
    pts = [(-0.07, 0.12), (-0.07, 0.0)] + [(-0.07 * math.cos(math.radians(a)), -0.07 * math.sin(math.radians(a))) for a in range(6, 175, 6)] + [(0.07, 0.0), (0.07, 0.12)]
    sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts):
        p.co = (q[0], 0, q[1], 1)
    u = link(sc, cu, 'u', blue)
    to_mesh(u)
    u.data.shade_smooth()
    for x in (-0.07, 0.07):
        cyl(sc, 'tip', 0.0335, 0.0335, 0.045, (x, 0, 0.14), steel)
    piv = bpy.data.objects.new('piv', None)
    sc.collection.objects.link(piv)
    for o in sc.collection.objects:
        if o.type == 'MESH':
            o.parent = piv
    piv.rotation_euler = (math.radians(-12), math.radians(-38), math.radians(-24))
    camera(sc, dist=1.25, height=0.1, lens=70, target=(0, 0, 0.04))
    render(sc, name)


# ── a stack of gold coins (n), a little uneven, one leaning on it
def coins(name, n, stacks=1):
    sc = reset()
    gold = grain(mat('g', '#e3a93c', rough=0.26, metal=1.0), scale=300, strength=0.12)
    import random
    rnd = random.Random(7)
    for s in range(stacks):
        ox = (s - (stacks - 1) / 2) * 0.13
        cnt = n if s == stacks - 1 else int(n * 0.6)
        for i in range(cnt):
            c = cyl(sc, 'c', 0.05, 0.05, 0.011, (ox + rnd.uniform(-0.004, 0.004), rnd.uniform(-0.004, 0.004), i * 0.0115), gold)
            c.rotation_euler = (rnd.uniform(-0.02, 0.02), rnd.uniform(-0.02, 0.02), 0)
            rim = c.modifiers.new('rim', 'BEVEL')
            rim.width = 0.0016
            rim.segments = 2
    lean = cyl(sc, 'lean', 0.05, 0.05, 0.011, (0.11 if stacks == 1 else 0.2, -0.04, 0.045), gold)
    lean.rotation_euler = (math.radians(64), math.radians(-18), math.radians(-35))
    camera(sc, dist=1.2 + 0.25 * stacks, height=0.32, lens=70, target=(0.03, 0, 0.04 + n * 0.004))
    render(sc, name)


# ── the viZion mark in 3D: the traced logo, extruded, blue with the yellow arrow
def logo(name):
    sc = reset()
    d = json.load(open(os.path.join(HERE, 'vizion-mark.json')))
    vb = d['viewBox']
    objs = []
    for part, col in (('blue', BLUE), ('yellow', YELLOW)):
        p = os.path.join(OUT, f'_{part}.svg')
        open(p, 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]} {vb[1]} {vb[2]} {vb[3]}" width="{vb[2]}" height="{vb[3]}"><path d="{d[part]}"/></svg>')
        before = set(bpy.data.objects)
        bpy.ops.import_curve.svg(filepath=p)
        new = [o for o in bpy.data.objects if o not in before]
        m = mat(part, col, rough=0.22, coat=0.8)
        for o in new:
            o.data.extrude = 0.006 if part == 'blue' else 0.0075
            o.data.bevel_depth = 0.0012
            o.data.bevel_resolution = 4
            o.data.materials.clear()
            o.data.materials.append(m)
            objs.append(o)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    piv = bpy.data.objects.new('piv', None)
    sc.collection.objects.link(piv)
    cx = sum(o.location.x for o in objs) / len(objs)
    cy = sum(o.location.y for o in objs) / len(objs)
    for o in objs:
        o.location.x -= cx
        o.location.y -= cy
        o.parent = piv
        o.data.shade_smooth()
    bpy.context.view_layer.update()
    span = max(max(o.dimensions.x for o in objs), max(o.dimensions.y for o in objs))
    piv.scale = (0.3 / span,) * 3
    piv.rotation_euler = (math.radians(90), math.radians(4), math.radians(-28))
    camera(sc, dist=1.4, height=0.25, lens=70)
    render(sc, name)


JOBS = {
    'bubble-s': lambda: bubble('bubble-s', 0.32, WHITE, 'r'),
    'bubble-m': lambda: bubble('bubble-m', 0.42, WHITE, 'r'),
    'bubble-l': lambda: bubble('bubble-l', 0.56, WHITE, 'l'),
    'bubble-blue': lambda: bubble('bubble-blue', 0.36, BLUE, 'l'),
    'tag': lambda: tag('tag'),
    'megaphone': lambda: megaphone('megaphone'),
    'parcel': lambda: parcel('parcel'),
    'target': lambda: target('target'),
    'gift': lambda: gift('gift'),
    'magnet': lambda: magnet('magnet'),
    'coins': lambda: coins('coins', 7),
    'coins-2': lambda: coins('coins-2', 14, 2),
    'logo': lambda: logo('logo'),
}
for k, f in JOBS.items():
    if not ONLY or k in ONLY:
        f()
