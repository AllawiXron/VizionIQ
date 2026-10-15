# Desk props for the «ثانية وحدة» reel: each one rendered top-down (orthographic) in Cycles onto a shadow catcher,
# so the PNG carries the object and its soft shadow on a transparent background. Light comes from the top of the
# frame (+Y), like the CSS shadows on the sheets. Scale: 7 px per mm (the reel shows them at ~3.5 px/mm).
#   blender -b -P props.py -- OUTDIR [name ...]     (then: python3 -I finish.py OUTDIR ../assets/props name ...)
import bpy, bmesh, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
OUT = argv[0]
ONLY = set(argv[1:])
PXMM = 7
MM = 0.001


def srgb(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1.0,)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 160
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 8
    sc.render.film_transparent = True
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.compression = 90
    w = bpy.data.worlds.new('w')
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs[0].default_value = (0.32, 0.30, 0.28, 1)
    bg.inputs[1].default_value = 0.75
    sc.world = w
    # key: a big soft box above, towards the top of the frame
    ld = bpy.data.lights.new('key', 'AREA')
    ld.shape = 'DISK'
    ld.size = 0.45
    ld.energy = 16
    lo = bpy.data.objects.new('key', ld)
    sc.collection.objects.link(lo)
    lo.location = (0.05, 0.42, 0.85)
    lo.rotation_euler = (Vector((0, 0, 0)) - lo.location).to_track_quat('-Z', 'Y').to_euler()
    # two strip boxes that only show up in reflections, so metal and glaze have something to mirror
    for i, (loc, sz) in enumerate((((-0.32, 0.18, 0.45), (0.5, 0.08)), ((0.36, -0.12, 0.5), (0.5, 0.06)))):
        me = bpy.data.meshes.new(f'sb{i}')
        bm = bmesh.new()
        bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
        bm.to_mesh(me)
        ob = bpy.data.objects.new(f'sb{i}', me)
        sc.collection.objects.link(ob)
        ob.location = loc
        ob.scale = (sz[0] * 2, sz[1] * 2, 1)
        ob.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        ob.rotation_euler.rotate_axis('X', math.pi)
        m = bpy.data.materials.new('sbm')
        m.use_nodes = True
        nt = m.node_tree
        nt.nodes.clear()
        e = nt.nodes.new('ShaderNodeEmission')
        e.inputs[1].default_value = 1.6
        o = nt.nodes.new('ShaderNodeOutputMaterial')
        nt.links.new(e.outputs[0], o.inputs[0])
        me.materials.append(m)
        ob.visible_camera = False
        ob.visible_diffuse = False
        ob.visible_shadow = False
        ob.visible_transmission = False
    # the shadow catcher (the desk)
    me = bpy.data.meshes.new('floor')
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=1.0)
    bm.to_mesh(me)
    fl = bpy.data.objects.new('floor', me)
    sc.collection.objects.link(fl)
    fl.is_shadow_catcher = True
    return sc


def camera(sc, w_mm, h_mm, cx=0.0, cy=0.0):
    cd = bpy.data.cameras.new('cam')
    cd.type = 'ORTHO'
    cd.ortho_scale = max(w_mm, h_mm) * MM
    co = bpy.data.objects.new('cam', cd)
    sc.collection.objects.link(co)
    co.location = (cx * MM, cy * MM, 1.0)
    sc.camera = co
    sc.render.resolution_x = int(w_mm * PXMM)
    sc.render.resolution_y = int(h_mm * PXMM)
    sc.render.resolution_percentage = 100
    cd.sensor_fit = 'HORIZONTAL' if w_mm >= h_mm else 'VERTICAL'


def mat(name, color, rough=0.4, metal=0.0, coat=0.0, spec=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = srgb(color) if isinstance(color, str) else color
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    p.inputs['Coat Weight'].default_value = coat
    p.inputs['Specular IOR Level'].default_value = spec
    return m


def link(sc, me, name, m=None):
    ob = bpy.data.objects.new(name, me)
    sc.collection.objects.link(ob)
    if m:
        me.materials.append(m)
    return ob


def wire(sc, pts, radius, m, name='wire'):
    """A wire along a polyline (points in mm), as a smooth tube."""
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = radius * MM
    cu.bevel_resolution = 6
    cu.use_fill_caps = True
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts):
        p.co = (q[0] * MM, q[1] * MM, (q[2] if len(q) > 2 else radius) * MM, 1)
    ob = link(sc, cu, name, m)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.shade_smooth()
    ob.select_set(False)
    return ob


def arc(cx, cy, r, a0, a1, n=24, z=None):
    out = []
    for i in range(n + 1):
        a = math.radians(a0 + (a1 - a0) * i / n)
        p = (cx + r * math.cos(a), cy + r * math.sin(a))
        out.append(p if z is None else p + (z,))
    return out


def render(sc, name):
    # two passes, joined by finish.py: the shadow alone (objects hidden from the camera only), then the object alone
    objs = [o for o in sc.objects if o.type == 'MESH' and o.name != 'floor' and not o.name.startswith('sb')]
    fl = sc.objects['floor']
    for o in objs:
        o.visible_camera = False
    sc.render.filepath = os.path.join(OUT, name + '.shadow.png')
    bpy.ops.render.render(write_still=True)
    for o in objs:
        o.visible_camera = True
    fl.hide_render = True
    sc.render.filepath = os.path.join(OUT, name + '.obj.png')
    bpy.ops.render.render(write_still=True)
    fl.hide_render = False
    print('wrote', name)


# ── a gem paper clip, 34 mm, lying flat
def paperclip(name, color, metal):
    sc = reset()
    m = mat('clip', color, rough=0.22 if metal else 0.35, metal=1.0 if metal else 0.0, coat=0 if metal else 0.6)
    r = 0.55 if metal else 0.7
    pts = [(1.6, 7)] + [(1.6, -9)]
    pts += arc(-0.4, -9, 2.0, 0, -180)[1:]
    pts += [(-2.4, 12)]
    pts += arc(0.6, 12, 3.0, 180, 0)[1:]
    pts += [(3.6, -12.5)]
    pts += arc(-0.5, -12.5, 4.1, 0, -180)[1:]
    pts += [(-4.6, 9)]
    ob = wire(sc, pts, r, m)
    ob.location.z = 0.0
    camera(sc, 20, 42, 0, -0.5)
    render(sc, name)


# ── a map pin, pushed in at a slight angle
def pin(name, color):
    sc = reset()
    head = mat('head', color, rough=0.18, coat=0.5)
    steel = mat('steel', (0.75, 0.75, 0.77, 1), rough=0.2, metal=1.0)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=32, radius=4.0 * MM)
    me = bpy.data.meshes.new('head')
    bm.to_mesh(me)
    for f in me.polygons:
        f.use_smooth = True
    h = link(sc, me, 'head', head)
    h.location = (0, 0, 9.5 * MM)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=0.45 * MM, radius2=0.45 * MM, depth=8 * MM)
    me = bpy.data.meshes.new('needle')
    bm.to_mesh(me)
    for f in me.polygons:
        f.use_smooth = True
    n = link(sc, me, 'needle', steel)
    n.location = (0, 0, 3.0 * MM)
    piv = bpy.data.objects.new('piv', None)
    sc.collection.objects.link(piv)
    for o in (h, n):
        o.parent = piv
    piv.rotation_euler = (math.radians(-12), math.radians(16), 0)
    camera(sc, 24, 24, 1.2, -1.5)
    render(sc, name)


# ── a black binder clip on a sheet's edge (the edge runs along X at y=0; the sheet is at y>0)
def binder(name):
    sc = reset()
    black = mat('black', (0.008, 0.008, 0.008, 1), rough=0.38, coat=0.12, spec=0.25)
    steel = mat('steel', (0.8, 0.8, 0.82, 1), rough=0.16, metal=1.0)
    W = 41
    prof = [(4.0, 0.9), (-15.0, 17.0), (-16.5, 16.2), (-16.5, 0.6), (4.0, 0.1)]
    bm = bmesh.new()
    vs = []
    for x in (-W / 2, W / 2):
        vs.append([bm.verts.new((x * MM, y * MM, z * MM)) for y, z in prof])
    n = len(prof)
    bm.faces.new(vs[0][::-1])
    bm.faces.new(vs[1])
    for i in range(n):
        bm.faces.new((vs[0][i], vs[0][(i + 1) % n], vs[1][(i + 1) % n], vs[1][i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('body')
    bm.to_mesh(me)
    b = link(sc, me, 'body', black)
    bv = b.modifiers.new('bv', 'BEVEL')
    bv.width = 0.7 * MM
    bv.segments = 4
    b.modifiers.new('ws', 'WEIGHTED_NORMAL')
    me.shade_smooth()
    # the rolled edge the handles hinge on
    for z0 in (16.9,):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=1.3 * MM, radius2=1.3 * MM, depth=(W - 1) * MM)
        me = bpy.data.meshes.new('roll')
        bm.to_mesh(me)
        me.shade_smooth()
        r = link(sc, me, 'roll', black)
        r.rotation_euler = (0, math.radians(90), 0)
        r.location = (0, -15.6 * MM, z0 * MM)
    # handles: one folded forward over the sheet, one folded back onto the desk
    hw0, hw1 = 15.5, 10.5
    up = [(-hw0, -15.6, 17.4), (-hw1, 4.0, 8.0)] + [(x, y, 8.0) for x, y in arc(0, 4.0, hw1, 180, 0, 20)[1:-1]] + [(hw1, 4.0, 8.0), (hw0, -15.6, 17.4)]
    up = [(-hw0, -15.6, 17.4)] + [(-hw0 + (-hw1 + hw0) * t, -15.6 + 19.6 * t, 17.4 - 9.4 * t) for t in (0.5,)] + up[1:-1] + [(hw0 + (hw1 - hw0) * t, -15.6 + 19.6 * t, 17.4 - 9.4 * t) for t in (0.5,)] + [(hw0, -15.6, 17.4)]
    wire(sc, up, 0.85, steel, 'h1')
    dn = [(-hw0, -16.6, 1.0), (-hw1, -34.0, 0.85)] + [(x, y, 0.85) for x, y in arc(0, -34.0, hw1, 180, 360, 20)[1:-1]] + [(hw1, -34.0, 0.85), (hw0, -16.6, 1.0)]
    wire(sc, dn, 0.85, steel, 'h2')
    # turn it round (it is symmetric in x): the sheet below the clip, the handle folded back up onto the desk
    piv = bpy.data.objects.new('piv', None)
    sc.collection.objects.link(piv)
    for o in sc.collection.objects:
        if o.type == 'MESH' and o.name not in ('floor',) and not o.name.startswith('sb'):
            o.parent = piv
    piv.rotation_euler = (0, 0, math.pi)
    camera(sc, 58, 70, 0, 14)
    render(sc, name)


# ── a sharpened hex pencil in his orange, lying on the desk
def pencil(name):
    sc = reset()
    paint = mat('paint', '#e2541b', rough=0.32, coat=0.35)
    wood = mat('wood', '#e3b98c', rough=0.75)
    lead = mat('lead', (0.03, 0.03, 0.035, 1), rough=0.35, metal=0.4)
    ferr = mat('ferr', (0.78, 0.76, 0.72, 1), rough=0.25, metal=1.0)
    eras = mat('eras', '#e8a79a', rough=0.8)
    R = 3.6
    zc = R * math.cos(math.pi / 6)

    def cyl(name, m, r1, r2, x0, x1, segs, smooth=False, rot=0.0):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r1 * MM, radius2=r2 * MM, depth=(x1 - x0) * MM)
        me = bpy.data.meshes.new(name)
        bm.to_mesh(me)
        if smooth:
            me.shade_smooth()
        o = link(sc, me, name, m)
        o.rotation_mode = 'ZYX'
        o.rotation_euler = (0, math.radians(90), rot)
        o.location = ((x0 + x1) / 2 * MM, 0, zc * MM)
        return o

    L = 150
    body = cyl('body', paint, R, R, -L / 2, L / 2, 6, rot=math.radians(30))
    bv = body.modifiers.new('bv', 'BEVEL')
    bv.width = 0.35 * MM
    bv.segments = 3
    body.modifiers.new('ws', 'WEIGHTED_NORMAL')
    cyl('wood', wood, R * 0.93, 0.95, L / 2, L / 2 + 19, 48, True)
    cyl('lead', lead, 0.95, 0.05, L / 2 + 19, L / 2 + 23, 32, True)
    cyl('ferr', ferr, R * 1.03, R * 1.03, -L / 2 - 10, -L / 2, 48, True)
    for i in range(3):
        cyl(f'rib{i}', ferr, R * 1.08, R * 1.08, -L / 2 - 8.5 + i * 3.2, -L / 2 - 7.6 + i * 3.2, 48, True)
    e = cyl('eras', eras, R * 0.97, R * 0.97, -L / 2 - 17, -L / 2 - 10, 48, True)
    bv = e.modifiers.new('bv', 'BEVEL')
    bv.width = 1.0 * MM
    bv.segments = 4
    camera(sc, 210, 26, 2, -2.5)
    render(sc, name)


# ── a cream mug of black coffee, from above
def mug(name):
    sc = reset()
    glaze = mat('glaze', '#f4ece0', rough=0.12, coat=0.6)
    coffee = mat('coffee', (0.006, 0.0028, 0.0015, 1), rough=0.05, spec=0.5)
    crema = mat('crema', (0.16, 0.075, 0.03, 1), rough=0.35)
    Ro, Ri, H = 41.0, 37.0, 92.0
    # profile (r, z) spun around Z: outside up, round lip, inside down
    prof = [(0.0, 0.0), (Ro - 3, 0.0)] + [(Ro - 3 + 3 * math.sin(math.radians(a)), 3 - 3 * math.cos(math.radians(a))) for a in range(15, 91, 15)]
    prof += [(Ro, H - 2)] + [((Ro + Ri) / 2 + 2 * math.cos(math.radians(a)), H - 2 + 2 * math.sin(math.radians(a))) for a in range(20, 181, 20)]
    prof += [(Ri, 8.0), (Ri - 3, 5.0), (0.0, 5.0)]
    bm = bmesh.new()
    vs = [bm.verts.new((r * MM, 0, z * MM)) for r, z in prof]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    bmesh.ops.spin(bm, geom=vs + es, cent=(0, 0, 0), axis=(0, 0, 1), angle=math.radians(360), steps=96, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('mug')
    bm.to_mesh(me)
    me.shade_smooth()
    link(sc, me, 'mug', glaze)
    # the coffee, with a darker-cream ring where it meets the cup
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=96, radius=(Ri - 0.4) * MM)
    me = bpy.data.meshes.new('coffee')
    bm.to_mesh(me)
    c = link(sc, me, 'coffee', coffee)
    c.location.z = 80 * MM
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=False, segments=96, radius=(Ri - 0.4) * MM)
    inner = bmesh.ops.create_circle(bm, cap_ends=False, segments=96, radius=(Ri - 2.2) * MM)
    bmesh.ops.bridge_loops(bm, edges=bm.edges[:])
    me = bpy.data.meshes.new('crema')
    bm.to_mesh(me)
    cr = link(sc, me, 'crema', crema)
    cr.location.z = 80.05 * MM
    # the handle: a D-shaped loop on the right
    bm = bmesh.new()
    path = []
    for i in range(41):
        a = math.radians(-100 + 200 * i / 40)
        path.append((Ro - 1.5 + 17 * math.cos(a) * (1.0 if math.cos(a) > 0 else 0.4), 0, 50 + 27 * math.sin(a)))
    ob = wire(sc, path, 5.5, glaze, 'handle')
    ob.scale = (1, 1.35, 1)
    camera(sc, 160, 160, 10, -22)
    render(sc, name)


# ── a highlighter pen, held at a slant with its chisel tip on the paper at the origin, the body out to the lower right
# (where a right hand holds it). The reel moves it along each stroke, so its shadow is kept as a separate PNG (lifted:
# shadow further away). Tip in the PNG: 52.5, 52.5 px at 3.5 px/mm.
def highlighter(name):
    sc = reset()
    body = mat('body', '#f07a2e', rough=0.28, coat=0.45)
    capm = mat('cap', '#e2541b', rough=0.28, coat=0.45)
    white = mat('white', '#f4ece0', rough=0.32, coat=0.25)
    felt = mat('felt', '#f2661a', rough=0.95)
    piv = bpy.data.objects.new('piv', None)
    sc.collection.objects.link(piv)

    def part(o):
        o.parent = piv
        return o

    def cyl(nm, m, r1, r2, x0, x1, segs=48):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r1 * MM, radius2=r2 * MM, depth=(x1 - x0) * MM)
        me = bpy.data.meshes.new(nm)
        bm.to_mesh(me)
        me.shade_smooth()
        o = link(sc, me, nm, m)
        o.rotation_euler = (0, math.radians(90), 0)
        o.location = ((x0 + x1) / 2 * MM, 0, 0)
        bv = o.modifiers.new('bv', 'BEVEL')
        bv.width = 0.5 * MM
        bv.segments = 3
        return part(o)

    # the chisel felt tip
    bm = bmesh.new()
    for v in ((0, -2.5, -1.2), (0, 2.5, -1.2), (2.6, -2.5, 1.2), (2.6, 2.5, 1.2), (8, -2.5, -1.2), (8, 2.5, -1.2), (8, -2.5, 1.2), (8, 2.5, 1.2)):
        bm.verts.new(tuple(c * MM for c in v))
    bmesh.ops.convex_hull(bm, input=bm.verts)
    me = bpy.data.meshes.new('felt')
    bm.to_mesh(me)
    part(link(sc, me, 'felt', felt))
    cyl('collar', white, 3.3, 6.2, 6.5, 17, 48)
    cyl('body', body, 6.6, 6.6, 17, 104, 64)
    cyl('cap', capm, 7.3, 7.3, 92, 127, 64)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=7.3 * MM)
    me = bpy.data.meshes.new('dome')
    bm.to_mesh(me)
    me.shade_smooth()
    d = part(link(sc, me, 'dome', capm))
    d.location = (127 * MM, 0, 0)
    d.scale = (0.45, 1, 1)
    # the cap's clip, along its top
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    me = bpy.data.meshes.new('clip')
    bm.to_mesh(me)
    c = part(link(sc, me, 'clip', white))
    c.scale = (30 * MM, 3.6 * MM, 1.4 * MM)
    c.location = (111 * MM, 0, 8.2 * MM)
    bv = c.modifiers.new('bv', 'BEVEL')
    bv.width = 0.5 * MM
    bv.segments = 3
    # tilt it up 42 degrees about the tip, then turn it to point at the lower right
    piv.rotation_euler = (0, math.radians(-42), math.radians(-35))
    piv.location = (0, 0, 1.0 * MM)
    camera(sc, 115, 145, 42.5, -57.5)
    render(sc, name)


JOBS = {
    'clip-silver': lambda: paperclip('clip-silver', (0.82, 0.82, 0.84, 1), True),
    'clip-orange': lambda: paperclip('clip-orange', '#e2541b', False),
    'pin-orange': lambda: pin('pin-orange', '#e2541b'),
    'pin-cream': lambda: pin('pin-cream', '#f4ece0'),
    'pin-brown': lambda: pin('pin-brown', '#3a2418'),
    'binder': lambda: binder('binder'),
    'pencil': lambda: pencil('pencil'),
    'mug': lambda: mug('mug'),
    'highlighter': lambda: highlighter('highlighter'),
}
for k, f in JOBS.items():
    if not ONLY or k in ONLY:
        f()
