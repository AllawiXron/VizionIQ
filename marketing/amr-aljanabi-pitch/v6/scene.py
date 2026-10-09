# Blender 4.2 product shots of his two bottles, modelled from his reel photos (photos/mancera.jpg, photos/slazenger-b.jpg).
#   blender -b -P scene.py -- <amber|gold> <out.png> [scale%] [samples]
# amber: the Mancera/Amberful flask on an amber studio sweep (for «شنو عطرك؟»)
# gold:  the Slazenger Gold bottle on a black velvet jeweller's riser with a gold-shop tag on a red thread (for «ذهب.. بلا مصنعية»)
import bpy, bmesh, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
SHOT = argv[0]
OUT = os.path.abspath(argv[1])
SCALE = int(argv[2]) if len(argv) > 2 else 100
SAMPLES = int(argv[3]) if len(argv) > 3 else 256
HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, 'tex')

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# ---------- helpers ----------
def mat(name, color=(1, 1, 1), metal=0.0, rough=0.5, transmission=0.0, ior=1.45, sheen=0.0, coat=0.0, emit=None, emit_strength=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rough
    b.inputs['Transmission Weight'].default_value = transmission
    b.inputs['IOR'].default_value = ior
    b.inputs['Sheen Weight'].default_value = sheen
    b.inputs['Coat Weight'].default_value = coat
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = emit_strength
    return m

def glass(name, tint=(1, 1, 1), rough=0.0, ior=1.5):
    return mat(name, tint, 0.0, rough, 1.0, ior)

def liquid(name, color, density):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (1, 1, 1, 1)
    b.inputs['Roughness'].default_value = 0.0
    b.inputs['Transmission Weight'].default_value = 1.0
    b.inputs['IOR'].default_value = 1.36
    va = nt.nodes.new('ShaderNodeVolumeAbsorption')
    va.inputs['Color'].default_value = (*color, 1); va.inputs['Density'].default_value = density
    nt.links.new(va.outputs[0], nt.nodes['Material Output'].inputs['Volume'])
    return m

def image_mat(name, path, rough=0.45, alpha=False):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(path); t.interpolation = 'Cubic'
    nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
    if alpha: nt.links.new(t.outputs['Alpha'], b.inputs['Alpha'])
    b.inputs['Roughness'].default_value = rough
    b.inputs['Sheen Weight'].default_value = 0.15
    # paper backs seen through the glass read as a second label: show only the printed side
    geo = nt.nodes.new('ShaderNodeNewGeometry'); tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader')
    out = nt.nodes['Material Output']
    nt.links.new(geo.outputs['Backfacing'], mix.inputs['Fac']); nt.links.new(b.outputs['BSDF'], mix.inputs[1]); nt.links.new(tr.outputs['BSDF'], mix.inputs[2])
    nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])
    return m

def obj_from_bm(name, bm, material=None, smooth=True):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    if smooth:
        for p in me.polygons: p.use_smooth = True
    if material: me.materials.append(material)
    return o

def ring_pts(shape, z, n):
    """n points around Z at height z. shape = ('c', r) circle or ('rr', hx, hy, rad) rounded rectangle, sampled by angle"""
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        dx, dy = math.cos(a), math.sin(a)
        if shape[0] == 'c':
            pts.append((shape[1] * dx, shape[1] * dy, z))
        else:
            _, hx, hy, rad = shape
            # ray from centre to the rounded rectangle's boundary
            lo, hi = 0.0, hx + hy
            for _ in range(40):
                t = (lo + hi) / 2; x, y = abs(t * dx), abs(t * dy)
                qx, qy = x - (hx - rad), y - (hy - rad)
                inside = (math.hypot(max(qx, 0), max(qy, 0)) + min(max(qx, qy), 0)) <= rad
                lo, hi = (t, hi) if inside else (lo, t)
            pts.append((lo * dx, lo * dy, z))
    return pts

def loft(name, rings, n=128, material=None, cap_start=True, cap_end=True):
    """rings: list of (shape, z); consecutive rings joined with quads; ends capped with a centre fan"""
    bm = bmesh.new(); prev = None; first = None
    for shape, z in rings:
        vs = [bm.verts.new(p) for p in ring_pts(shape, z, n)]
        if prev:
            for i in range(n):
                bm.faces.new((prev[i], prev[(i + 1) % n], vs[(i + 1) % n], vs[i]))
        else:
            first = vs
        prev = vs
    if cap_start:
        c = bm.verts.new((0, 0, rings[0][1]))
        for i in range(n): bm.faces.new((c, first[(i + 1) % n], first[i]))
    if cap_end:
        c = bm.verts.new((0, 0, rings[-1][1]))
        for i in range(n): bm.faces.new((c, prev[i], prev[(i + 1) % n]))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_from_bm(name, bm, material)

def arc(c, r, t0, t1, steps):
    """points (radius, z) on a circle of radius r around c=(rc, zc), angles in degrees"""
    return [(c[0] + r * math.cos(math.radians(t0 + (t1 - t0) * i / steps)), c[1] + r * math.sin(math.radians(t0 + (t1 - t0) * i / steps))) for i in range(steps + 1)]

def lathe(name, prof, material=None, n=128, closed_axis=True):
    """prof: list of (r, z) from the axis round to the axis"""
    rings = [(('c', r), z) for r, z in prof if r > 1e-6]
    return loft(name, rings, n, material, cap_start=closed_axis and prof[0][0] == 0, cap_end=closed_axis and prof[-1][0] == 0)

def parent(children, p):
    for c in children: c.parent = p

def area(name, loc, rot, size, energy, color=(1, 1, 1), shape='RECTANGLE', size_y=None, spread=180):
    l = bpy.data.lights.new(name, 'AREA'); l.energy = energy; l.color = color; l.shape = shape
    l.size = size; l.size_y = size_y or size; l.spread = math.radians(spread)
    o = bpy.data.objects.new(name, l); o.location = loc; o.rotation_euler = [math.radians(a) for a in rot]; sc.collection.objects.link(o)
    return o

def aim(o, target):
    d = Vector(target) - o.location
    o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

def plane(name, size_x, size_y, loc, rot, material):
    bm = bmesh.new()
    vs = [bm.verts.new((x * size_x / 2, y * size_y / 2, 0)) for x, y in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    f = bm.faces.new(vs)
    uv = bm.loops.layers.uv.new()
    for loop, (u, v) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): loop[uv].uv = (u, v)
    o = obj_from_bm(name, bm, material, smooth=False)
    o.location = loc; o.rotation_euler = [math.radians(a) for a in rot]
    return o

def sweep(name, material, width=60, back=9.0, rise=3.0, height=30):
    """a photo-studio cyclorama: floor running into a curved wall at y=back"""
    prof = [(y, 0.0) for y in (-30, -10, back - rise)]
    prof += [(back - rise + rise * math.sin(math.radians(a)), rise - rise * math.cos(math.radians(a))) for a in range(6, 91, 6)]
    prof += [(back, height)]
    bm = bmesh.new()
    left = [bm.verts.new((-width / 2, y, z)) for y, z in prof]
    right = [bm.verts.new((width / 2, y, z)) for y, z in prof]
    for i in range(len(prof) - 1): bm.faces.new((left[i], right[i], right[i + 1], left[i + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = obj_from_bm(name, bm, material)
    for p in o.data.polygons:
        if p.normal.z < 0: p.flip()
    return o

def bump_ridges(m, count, mask_z=None, strength=0.6):
    """radial ridges (sunburst base, knurled collar) as a bump on a material, from the object's angle around Z"""
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Object'], sep.inputs[0])
    at = nt.nodes.new('ShaderNodeMath'); at.operation = 'ARCTAN2'
    nt.links.new(sep.outputs['Y'], at.inputs[0]); nt.links.new(sep.outputs['X'], at.inputs[1])
    mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = count
    nt.links.new(at.outputs[0], mul.inputs[0])
    sn = nt.nodes.new('ShaderNodeMath'); sn.operation = 'SINE'; nt.links.new(mul.outputs[0], sn.inputs[0])
    h = sn.outputs[0]
    if mask_z is not None:
        lt = nt.nodes.new('ShaderNodeMath'); lt.operation = 'LESS_THAN'; lt.inputs[1].default_value = mask_z
        nt.links.new(sep.outputs['Z'], lt.inputs[0])
        mm = nt.nodes.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'
        nt.links.new(sn.outputs[0], mm.inputs[0]); nt.links.new(lt.outputs[0], mm.inputs[1]); h = mm.outputs[0]
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = strength; bp.inputs['Distance'].default_value = 0.02
    nt.links.new(h, bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])

# ---------- the Mancera / Amberful flask ----------
def mancera_bottle():
    root = bpy.data.objects.new('mancera', None); sc.collection.objects.link(root)
    G = glass('glass')
    # outer wall up to the neck, then back down the inside: a thick-walled shell with a heavy base
    prof = [(0, 0), (0.86, 0)] + arc((0.86, 0.14), 0.14, -90, 0, 8)[1:]
    prof += [(1.0, 1.95)] + arc((0.45, 1.95), 0.55, 0, 90, 14)[1:]
    prof += [(0.42, 2.56), (0.42, 2.70)] + arc((0.38, 2.70), 0.04, 0, 90, 4)[1:] + [(0.31, 2.74), (0.30, 2.70), (0.30, 2.52)]
    prof += [(0.30 + 0.64 * math.cos(math.radians(a)), 1.95 + 0.52 * math.sin(math.radians(a))) for a in range(90, -1, -6)]
    prof += [(0.94, 0.52)] + arc((0.82, 0.52), 0.12, 0, -90, 6)[1:] + [(0, 0.40)]
    body = lathe('flask', prof, G)
    # filled to the shoulders, as in his photo: follow the inner shoulder up to the surface
    lvl = 2.22; shoulder = []
    for a in range(0, 91, 3):
        r, z = 0.30 + 0.632 * math.cos(math.radians(a)), 1.95 + 0.512 * math.sin(math.radians(a))
        if z > lvl: break
        shoulder.append((r, z))
    shoulder.append((0.30 + 0.632 * math.sqrt(max(0.0, 1 - ((lvl - 1.95) / 0.512) ** 2)), lvl))
    liq = lathe('juice', [(0, 0.405), (0.815, 0.405)] + arc((0.815, 0.52), 0.115, -90, 0, 6)[1:] + [(0.932, 1.95)] + shoulder[1:] + [(0, lvl)],
                liquid('amber juice', (0.86, 0.56, 0.08), 1.5))
    tube = lathe('dip tube', [(0, 0.42), (0.022, 0.42), (0.022, 2.7), (0, 2.7)], glass('tube', rough=0.08, ior=1.45), n=24)
    tube.location.x = -0.12
    # thick clear glass collar ring around a rose-bronze sleeve, then the square bronze cap
    BR = mat('bronze', (0.55, 0.33, 0.24), 1.0, 0.16)
    collar = lathe('collar', [(0.33, 2.62), (0.58, 2.62)] + arc((0.58, 2.70), 0.08, -90, 0, 6)[1:] + [(0.66, 3.22)] + arc((0.58, 3.22), 0.08, 0, 90, 6)[1:] + [(0.33, 3.30), (0.33, 2.62)],
                   glass('collar glass'), closed_axis=False)
    sleeve = lathe('sleeve', [(0, 2.45), (0.31, 2.45), (0.31, 3.50), (0, 3.50)], BR)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 3.61)); cap = bpy.context.object; cap.name = 'cap'
    cap.scale = (1.34, 1.34, 0.26); bpy.ops.object.transform_apply(scale=True); cap.data.materials.append(BR)
    bv = cap.modifiers.new('bevel', 'BEVEL'); bv.width = 0.07; bv.segments = 8; bv.affect = 'EDGES'
    for p in cap.data.polygons: p.use_smooth = True
    # his label, wrapped on the front of the flask (97°)
    span, R, z0, z1, nu = math.radians(97), 1.004, 0.40, 1.995, 64
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); grid = []
    for j, z in enumerate((z0, z1)):
        grid.append([bm.verts.new((R * math.sin(-span / 2 + span * i / nu), -R * math.cos(-span / 2 + span * i / nu), z)) for i in range(nu + 1)])
    for i in range(nu):
        f = bm.faces.new((grid[0][i], grid[0][i + 1], grid[1][i + 1], grid[1][i]))
        for loop, uv in zip(f.loops, ((i / nu, 0), ((i + 1) / nu, 0), ((i + 1) / nu, 1), (i / nu, 1))): loop[uvl].uv = uv
    label = obj_from_bm('label', bm, image_mat('label', os.path.join(TEX, 'mancera.png')))
    label.visible_glossy = label.visible_transmission = False  # no ghost copies of it inside the glass
    parent([body, liq, tube, collar, sleeve, cap, label], root)
    return root

# ---------- the Slazenger Gold bottle ----------
def slazenger_bottle():
    root = bpy.data.objects.new('slazenger', None); sc.collection.objects.link(root)
    HX, HY, RAD, H, W, BASE = 1.10, 0.80, 0.30, 2.70, 0.09, 0.55
    def rr(inset): return ('rr', HX - inset, HY - inset, max(RAD - inset, 0.02))
    G = glass('glass')
    bump_ridges(G, 44, mask_z=0.03, strength=0.9)
    rings = [(rr(0.10), 0.0), (rr(0.05), 0.012), (rr(0.02), 0.04), (rr(0.0), 0.10), (rr(0.0), H - 0.10), (rr(0.02), H - 0.04), (rr(0.05), H - 0.012), (rr(0.12), H)]
    rings += [(('c', 0.40), H), (('c', 0.36), H + 0.02), (('c', 0.36), H + 0.24), (('c', 0.26), H + 0.24), (('c', 0.26), H - W)]
    rings += [(rr(W + 0.10), H - W), (rr(W + 0.03), H - W - 0.05), (rr(W), H - W - 0.14), (rr(W), BASE + 0.12), (rr(W + 0.04), BASE + 0.03), (rr(W + 0.10), BASE)]
    body = loft('bottle', rings, n=160, material=G)
    liq = loft('juice', [(rr(W + 0.105), BASE + 0.005), (rr(W + 0.045), BASE + 0.035), (rr(W + 0.005), BASE + 0.125), (rr(W + 0.005), 2.05)],
               n=160, material=liquid('pale juice', (0.98, 0.86, 0.42), 0.35))
    tube = lathe('dip tube', [(0, BASE + 0.02), (0.022, BASE + 0.02), (0.022, H + 0.2), (0, H + 0.2)], glass('tube', rough=0.08, ior=1.45), n=24)
    GOLD = mat('gold', (1.0, 0.74, 0.32), 1.0, 0.18)
    knurl = mat('knurled gold', (1.0, 0.74, 0.32), 1.0, 0.22); bump_ridges(knurl, 90, strength=0.5)
    collar = lathe('collar', [(0, H + 0.02), (0.42, H + 0.02)] + arc((0.40, H + 0.04), 0.02, -90, 0, 3)[1:] + [(0.42, H + 0.30), (0, H + 0.30)], knurl, n=180)
    BLK = mat('cap black', (0.012, 0.012, 0.014), 0.0, 0.32, coat=0.4)
    cap = lathe('cap', [(0, H + 0.30), (0.60, H + 0.30)] + arc((0.57, H + 0.33), 0.03, -90, 0, 3)[1:] + [(0.60, H + 1.04), (0, H + 1.04)], BLK)
    rim = lathe('cap rim', [(0.50, H + 1.03), (0.585, H + 1.03)] + arc((0.565, H + 1.06), 0.04, -60, 90, 8)[1:] + [(0.50, H + 1.10), (0.50, H + 1.03)], GOLD, closed_axis=False)
    top = lathe('cap top', [(0, H + 1.07), (0.51, H + 1.07), (0.51, H + 1.09), (0, H + 1.09)], BLK)
    label = plane('label', 1.50, 1.636, (0, -HY - 0.004, 1.42), (90, 0, 0), image_mat('label', os.path.join(TEX, 'slz.png')))
    label.visible_glossy = label.visible_transmission = False  # no ghost copies of it inside the glass
    parent([body, liq, tube, collar, cap, rim, top, label], root)
    return root, H

def set_look(name):
    try: sc.view_settings.look = name
    except TypeError as e: print('look not set:', e)

# ---------- scenes ----------
cam_data = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cam_data); sc.collection.objects.link(cam); sc.camera = cam
cam_data.sensor_fit = 'VERTICAL'; cam_data.sensor_height = 36

sc.view_settings.view_transform = 'AgX'
world = bpy.data.worlds.new('world'); sc.world = world; world.use_nodes = True
bg = world.node_tree.nodes['Background']

if SHOT == 'amber':
    bg.inputs['Color'].default_value = (0.09, 0.04, 0.015, 1); bg.inputs['Strength'].default_value = 0.6
    studio = mat('amber sweep', (0.55, 0.17, 0.025), 0.0, 0.24)
    sweep('sweep', studio, back=15, rise=11)
    b = mancera_bottle(); b.rotation_euler.z = math.radians(-14)
    # key: big soft box front-left; fill right; two tall strips behind for the glass edges; a warm glow on the wall behind
    k = area('key', (-5.5, -3.5, 3.4), (0, 0, 0), 0.9, 1100, (1.0, 0.92, 0.82), size_y=5); aim(k, (0, 0, 1.8))
    f = area('fill', (5.5, -3.0, 3.4), (0, 0, 0), 0.9, 500, (1.0, 0.85, 0.7), size_y=5); aim(f, (0, 0, 1.6))
    for x in (-4.2, 4.2):
        s = area('strip', (x, 3.0, 3.2), (0, 0, 0), 0.4, 700, (1, 0.95, 0.88), size_y=3.2); aim(s, (0, 0, 2.2))
    g = area('wall glow', (0, 3.5, 1.2), (0, 0, 0), 3, 1600, (1.0, 0.55, 0.18), shape='DISK'); aim(g, (0, 9, 2.5))
    t = area('top', (0, -1, 9), (0, 0, 0), 3, 400, (1, 0.9, 0.8)); aim(t, (0, 0, 3.6))
    black = mat('flag', (0, 0, 0), 0, 1)
    plane('flag L', 2.2, 6, (-4.6, 0.2, 2.6), (90, 0, 80), black); plane('flag R', 2.2, 6, (4.6, 0.2, 2.6), (90, 0, -80), black)
    cam.location = (0.0, -19.4, 4.4); aim(cam, (0.0, 0, 2.4)); cam_data.lens = 85
    cam_data.dof.use_dof = True; cam_data.dof.focus_distance = 18.9; cam_data.dof.aperture_fstop = 8
    set_look('AgX - Punchy')

elif SHOT == 'gold':
    bg.inputs['Color'].default_value = (0.0, 0.0, 0.0, 1); bg.inputs['Strength'].default_value = 0.0
    floor = sweep('sweep', mat('black room', (0.012, 0.010, 0.009), 0.0, 0.2), back=95, rise=12, height=120)
    floor.location.z = -0.60
    VEL = mat('velvet', (0.006, 0.004, 0.004), 0.0, 0.95, sheen=0.35)
    VEL.node_tree.nodes['Principled BSDF'].inputs['Sheen Tint'].default_value = (0.5, 0.32, 0.18, 1)
    GOLD = mat('gold', (1.0, 0.74, 0.32), 1.0, 0.18)
    lathe('riser', [(0, -0.60), (1.75, -0.60), (1.75, -0.02)] + arc((1.70, -0.02), 0.05, 0, 90, 4)[1:] + [(0, 0.03)], VEL)
    lathe('riser band', [(1.752, -0.20), (1.775, -0.20), (1.775, -0.12), (1.752, -0.12)], GOLD, closed_axis=False)
    lathe('riser band low', [(1.752, -0.60), (1.775, -0.60), (1.775, -0.53), (1.752, -0.53)], GOLD, closed_axis=False)
    b, H = slazenger_bottle(); b.location.z = 0.03; b.rotation_euler.z = math.radians(-16)
    # the gold-shop tag on a red thread: a loop round the collar, a strand down to the tag hanging in front-right
    RED = mat('thread', (0.62, 0.02, 0.03), 0, 0.55)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.435, minor_radius=0.012, location=(0, 0, H + 0.18 + 0.03)); loop = bpy.context.object
    loop.data.materials.append(RED); loop.parent = b
    tag = plane('tag', 0.78, 1.22, (1.60, -1.10, 1.12), (88, 4, -6), image_mat('tag', os.path.join(TEX, 'tag.png'), rough=0.6, alpha=True))
    bpy.context.view_layer.update()
    hole = tag.matrix_world @ Vector((0, 1.22 / 2 - 1.22 * 0.116, 0))
    start = b.matrix_world @ Vector((0.30, -0.33, H + 0.21))
    cu = bpy.data.curves.new('strand', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.011; cu.bevel_resolution = 3
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(1)
    p0, p1 = sp.bezier_points
    p0.co = start; p0.handle_left = start; p0.handle_right = start + Vector((0.45, -0.25, -0.15))
    p1.co = hole; p1.handle_left = hole + Vector((-0.05, 0.02, 0.55)); p1.handle_right = hole
    strand = bpy.data.objects.new('strand', cu); sc.collection.objects.link(strand); cu.materials.append(RED)
    # jeweller's lighting: warm spots from above, strips for the glass edges, a dim warm wash on the wall
    for x, e in ((-2.5, 1400), (2.8, 900)):
        s = bpy.data.lights.new('spot', 'SPOT'); s.energy = e * 3; s.spot_size = math.radians(38); s.spot_blend = 0.6; s.color = (1.0, 0.82, 0.55); s.shadow_soft_size = 0.6
        o = bpy.data.objects.new('spot', s); o.location = (x, -2.5, 8.5); sc.collection.objects.link(o); aim(o, (0, 0, 1.2))
    for x in (-5.5, 5.5):
        s = area('strip', (x, 4.0, 3.0), (0, 0, 0), 0.4, 1100, (1, 0.9, 0.75), size_y=3.2); aim(s, (0, 0, 1.9))
    k = area('key', (-5, -7, 4), (0, 0, 0), 4, 900, (1.0, 0.9, 0.75)); aim(k, (0, 0, 1.6))
    k.visible_glossy = k.visible_transmission = False  # its square showed up as pale panels inside the glass
    w = area('wall', (0, 6, 0.5), (0, 0, 0), 6, 1800, (1.0, 0.6, 0.25), shape='DISK'); aim(w, (0, 16, 4))
    # out-of-focus shop lights far behind
    import random; random.seed(4)
    for i in range(40):
        x = random.uniform(-20, 20); z = random.uniform(2, 30); y = random.uniform(60, 80)
        r = random.uniform(0.25, 0.6)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(x, y, z)); o = bpy.context.object
        o.data.materials.append(mat('lamp', (0, 0, 0), emit=(1.0, random.uniform(0.52, 0.70), random.uniform(0.18, 0.32)), emit_strength=random.uniform(4, 15)))
    cam.location = (0.0, -23.4, 4.6); aim(cam, (0.0, 0, 2.45)); cam_data.lens = 85
    cam_data.dof.use_dof = True; cam_data.dof.focus_distance = 23.0; cam_data.dof.aperture_fstop = 0.4
    set_look('AgX - Punchy')

# ---------- render ----------
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES; sc.cycles.use_adaptive_sampling = True; sc.cycles.use_denoising = True
sc.cycles.max_bounces = 24; sc.cycles.transmission_bounces = 24; sc.cycles.glossy_bounces = 8; sc.cycles.transparent_max_bounces = 16
sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False; sc.cycles.blur_glossy = 0.5
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1620, 2025, SCALE
sc.render.image_settings.file_format = 'PNG'; sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print('wrote', OUT)
