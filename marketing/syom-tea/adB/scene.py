# Syom ad B: the pouch on a walnut table against a green plaster wall, a tailor's tape fallen loose around its foot,
# warm light through the palm and window shadow from the client's own shoot, the headline painted on the wall.
#   blender -b -P scene.py -- <out.png> [scale%] [samples]
# Needs tex/ from prep.py and shot.cjs, and the Poly Haven textures (CC0) listed in README.md.
import bpy, bmesh, math, sys, os
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else 'render/scene.png')
SCALE = int(argv[1]) if len(argv) > 1 else 100
SAMPLES = int(argv[2]) if len(argv) > 2 else 160
HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, 'tex')

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene


def img(name, colour=True):
    im = bpy.data.images.load(os.path.join(TEX, name))
    if not colour:
        im.colorspace_settings.name = 'Non-Color'
    return im


def material(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links, m.node_tree.nodes['Principled BSDF']


def tex_node(nodes, image, uv_scale=None, links=None):
    t = nodes.new('ShaderNodeTexImage')
    t.image = image
    if uv_scale and links:
        tc = nodes.new('ShaderNodeTexCoord')
        mp = nodes.new('ShaderNodeMapping')
        mp.inputs['Scale'].default_value = uv_scale
        links.new(tc.outputs['UV'], mp.inputs['Vector'])
        links.new(mp.outputs['Vector'], t.inputs['Vector'])
    return t


def plane(name, size, loc, rot):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = (size[0], size[1], 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return o


# ---------- room ----------
WALL_Y = 0.30
table = plane('Table', (2.4, 2.4), (0, -0.6 + WALL_Y, 0), (0, 0, 0))
m, n, l, p = material('Walnut')
d = tex_node(n, img('smoked_walnut_veneer_diff.jpg'), (1.7, 1.7, 1), l)
r = tex_node(n, img('smoked_walnut_veneer_rough.jpg', False), (1.7, 1.7, 1), l)
nm = tex_node(n, img('smoked_walnut_veneer_nor_gl.jpg', False), (1.7, 1.7, 1), l)
hs = n.new('ShaderNodeHueSaturation'); hs.inputs['Value'].default_value = 0.40; hs.inputs['Saturation'].default_value = 1.25
l.new(d.outputs['Color'], hs.inputs['Color']); l.new(hs.outputs['Color'], p.inputs['Base Color'])
l.new(r.outputs['Color'], p.inputs['Roughness'])
nmap = n.new('ShaderNodeNormalMap'); nmap.inputs['Strength'].default_value = 0.35
l.new(nm.outputs['Color'], nmap.inputs['Color']); l.new(nmap.outputs['Normal'], p.inputs['Normal'])
p.inputs['Coat Weight'].default_value = 0.35; p.inputs['Coat Roughness'].default_value = 0.18
table.data.materials.append(m)

wall = plane('Wall', (2.4, 1.6), (0, WALL_Y, 0.8), (math.radians(90), 0, 0))
m, n, l, p = material('GreenPlaster')
d = tex_node(n, img('plastered_wall_02_diff.jpg'), (2.4, 1.6, 1), l)
r = tex_node(n, img('plastered_wall_02_rough.jpg', False), (2.4, 1.6, 1), l)
nm = tex_node(n, img('plastered_wall_02_nor_gl.jpg', False), (2.4, 1.6, 1), l)
bw = n.new('ShaderNodeRGBToBW'); l.new(d.outputs['Color'], bw.inputs['Color'])
ramp = n.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position = 0.25; ramp.color_ramp.elements[0].color = (0.0005, 0.014, 0.010, 1)
ramp.color_ramp.elements[1].position = 0.85; ramp.color_ramp.elements[1].color = (0.003, 0.046, 0.032, 1)
l.new(bw.outputs['Val'], ramp.inputs['Fac'])
# the headline, painted on the plaster: it takes the wall's light, shadow and texture
head = img('headline.png')
ht = n.new('ShaderNodeTexImage'); ht.image = head; ht.extension = 'CLIP'
tc = n.new('ShaderNodeTexCoord'); mp = n.new('ShaderNodeMapping')
HW = 0.46                       # headline width on the wall, metres
HH = HW * head.size[1] / head.size[0]
HX, HZ = -0.020, 0.468          # headline centre on the wall
mp.inputs['Scale'].default_value = (2.4 / HW, 1.6 / HH, 1)
mp.inputs['Location'].default_value = (-(HX + 1.2 - HW / 2) / HW * (HW / 2.4) * (2.4 / HW), -(HZ - HH / 2) / HH, 0)
l.new(tc.outputs['UV'], mp.inputs['Vector']); l.new(mp.outputs['Vector'], ht.inputs['Vector'])
paint = n.new('ShaderNodeMixRGB'); paint.blend_type = 'MULTIPLY'; paint.inputs['Fac'].default_value = 0.25
l.new(ht.outputs['Color'], paint.inputs['Color1']); l.new(bw.outputs['Val'], paint.inputs['Color2'])
mix = n.new('ShaderNodeMixRGB')
l.new(ht.outputs['Alpha'], mix.inputs['Fac']); l.new(ramp.outputs['Color'], mix.inputs['Color1']); l.new(paint.outputs['Color'], mix.inputs['Color2'])
l.new(mix.outputs['Color'], p.inputs['Base Color'])
l.new(r.outputs['Color'], p.inputs['Roughness'])
nmap = n.new('ShaderNodeNormalMap'); nmap.inputs['Strength'].default_value = 0.9
l.new(nm.outputs['Color'], nmap.inputs['Color']); l.new(nmap.outputs['Normal'], p.inputs['Normal'])
wall.data.materials.append(m)

# ---------- pouch (box-bottom doypack) ----------
W, S, H = 0.17, 0.097, 0.34     # front width, side gusset width, height (from the die-cut proportions)
STRIP = [944, 1653, 949, 1650]  # side, front, side, back widths in the print strip
U0 = [sum(STRIP[:i]) / sum(STRIP) for i in range(5)]


def smooth(a, b, x):
    t = min(max((x - a) / (b - a), 0), 1)
    return t * t * (3 - 2 * t)


def depth(v):
    return S * (1 - smooth(0.10, 0.90, v)) ** 0.85 + 0.003


def bulge(u, v):
    return 0.011 * math.sin(math.pi * u) ** 1.3 * math.sin(math.pi * min(v / 0.9, 1)) ** 0.8 + (0.0012 if 0.855 < v < 0.865 else 0)


def ring(v, nside=20, nface=44):
    D = depth(v)
    c = math.sqrt(max((S / 2) ** 2 - (D / 2) ** 2, 0))
    pts = []
    # left side: back edge -> crease -> front edge
    for i in range(nside):
        t = i / nside
        y = D / 2 - D * t
        x = -W / 2 + c * (1 - abs(1 - 2 * t))
        pts.append((x, y, U0[0] + (U0[1] - U0[0]) * t))
    for i in range(nface):
        t = i / nface
        pts.append((-W / 2 + W * t, -D / 2 - bulge(t, v), U0[1] + (U0[2] - U0[1]) * t))
    for i in range(nside):
        t = i / nside
        y = -D / 2 + D * t
        x = W / 2 - c * (1 - abs(1 - 2 * t))
        pts.append((x, y, U0[2] + (U0[3] - U0[2]) * t))
    for i in range(nface + 1):
        t = i / nface
        pts.append((W / 2 - W * t, D / 2 + bulge(t, v), U0[3] + (U0[4] - U0[3]) * t))
    return pts


bm = bmesh.new()
uvl = bm.loops.layers.uv.new('UVMap')
ROWS = 110
grid = []
for j in range(ROWS + 1):
    v = j / ROWS
    grid.append([(bm.verts.new((x, y, v * H)), u, v) for x, y, u in ring(v)])
for j in range(ROWS):
    a, b = grid[j], grid[j + 1]
    for i in range(len(a) - 1):
        f = bm.faces.new((a[i][0], a[i + 1][0], b[i + 1][0], b[i][0]))
        for loop, (vert, u, v) in zip(f.loops, (a[i], a[i + 1], b[i + 1], b[i])):
            loop[uvl].uv = (u, v)
bot = bm.faces.new([g[0] for g in grid[0][:-1]][::-1])
for loop in bot.loops:
    loop[uvl].uv = (0.4, 0.0)
mesh = bpy.data.meshes.new('Pouch'); bm.to_mesh(mesh); bm.free()
pouch = bpy.data.objects.new('Pouch', mesh); sc.collection.objects.link(pouch)
for f in mesh.polygons:
    f.use_smooth = True
sub = pouch.modifiers.new('Smooth', 'SUBSURF'); sub.levels = 1; sub.render_levels = 2
tx = bpy.data.textures.new('Crinkle', 'CLOUDS'); tx.noise_scale = 0.06; tx.noise_depth = 3
dsp = pouch.modifiers.new('Crinkle', 'DISPLACE'); dsp.texture = tx; dsp.strength = 0.0007; dsp.mid_level = 0.5
POUCH_ROT = math.radians(-24)
POUCH_LOC = Vector((0.062, 0.035, 0))
pouch.rotation_euler = (0, 0, POUCH_ROT); pouch.location = POUCH_LOC

m, n, l, p = material('PouchPrint')
art = n.new('ShaderNodeTexImage'); art.image = img('pouch_art.jpg')
gold = n.new('ShaderNodeTexImage'); gold.image = img('pouch_gold.png', False)
l.new(art.outputs['Color'], p.inputs['Base Color'])
l.new(gold.outputs['Color'], p.inputs['Metallic'])
rr = n.new('ShaderNodeMapRange'); rr.inputs['To Min'].default_value = 0.40; rr.inputs['To Max'].default_value = 0.20
l.new(gold.outputs['Color'], rr.inputs['Value']); l.new(rr.outputs['Result'], p.inputs['Roughness'])
nz = n.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 900
bump = n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.04
l.new(nz.outputs['Fac'], bump.inputs['Height']); l.new(bump.outputs['Normal'], p.inputs['Normal'])
pouch.data.materials.append(m)

# ---------- tailor's tape, fallen loose around the foot of the pouch ----------
TW, TT = 0.024, 0.0005


def catmull(pts, step=0.003):
    out = []
    P = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = (Vector(P[k][:3]) for k in (i - 1, i, i + 1, i + 2))
        a0, a1 = P[i][3], P[i + 1][3]
        n_ = max(2, int((p2 - p1).length / step))
        for k in range(n_):
            t = k / n_
            q = 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3)
            out.append((q, a0 + (a1 - a0) * t))
    out.append((Vector(P[-2][:3]), P[-2][3]))
    return out


# control points in the pouch's own frame: (x, y, z, roll); roll 0 = lying flat, ~1.4 = standing on its edge
ctrl = []
for k in range(0, 21):
    th = math.radians(95 + k * 19)                 # a little over one turn, starting behind the pouch
    rr_ = 1 + 0.07 * math.sin(3.1 * th + 0.6) + 0.04 * math.sin(5.3 * th)
    x, y = 0.122 * rr_ * math.cos(th), (0.088 if math.sin(th) > 0 else 0.112) * rr_ * math.sin(th)
    z = 0.0003 + (0.0012 if k >= 19 else 0)        # the last stretch lies over the start (hidden at the back)
    roll = 1.30 * smooth(205, 222, math.degrees(th)) * (1 - smooth(244, 262, math.degrees(th)))  # one stretch on its edge
    ctrl.append((x, y, z + (0.006 * math.sin(roll) if roll > 0.01 else 0), roll))
# the free end runs off toward the camera and out of the frame on the right
ctrl += [(0.150, -0.105, 0.0003, 0), (0.135, -0.175, 0.0003, 0), (0.040, -0.215, 0.0003, 0),
         (-0.040, -0.265, 0.003, 0.3), (-0.010, -0.335, 0.0003, 0), (0.110, -0.385, 0.0003, 0),
         (0.300, -0.420, 0.0003, 0)]

M = Matrix.Translation(POUCH_LOC) @ Matrix.Rotation(POUCH_ROT, 4, 'Z')
path = catmull(ctrl)
bm = bmesh.new()
uvl = bm.loops.layers.uv.new('UVMap')
L = 0.0
prev = None
rows = []
for idx, (q, roll) in enumerate(path):
    q = M @ q
    nxt = M @ path[min(idx + 1, len(path) - 1)][0]
    prv = M @ path[max(idx - 1, 0)][0]
    t = (nxt - prv).normalized()
    side = Vector((0, 0, 1)).cross(t).normalized()
    side = Matrix.Rotation(roll, 3, t) @ side
    if prev is not None:
        L += (q - prev).length
    prev = q
    rows.append((bm.verts.new(q - side * TW / 2), bm.verts.new(q + side * TW / 2), L))
TOTAL = L
for a, b in zip(rows, rows[1:]):
    f = bm.faces.new((a[0], b[0], b[1], a[1]))
    for loop, uv in zip(f.loops, ((a[2], 0), (b[2], 0), (b[2], 1), (a[2], 1))):
        loop[uvl].uv = (uv[0] / 1.5 + 0.02, uv[1])    # the texture is 1.5 m of tape
mesh = bpy.data.meshes.new('Tape'); bm.to_mesh(mesh); bm.free()
tape = bpy.data.objects.new('Tape', mesh); sc.collection.objects.link(tape)
for f in mesh.polygons:
    f.use_smooth = True
so = tape.modifiers.new('Thickness', 'SOLIDIFY'); so.thickness = TT; so.offset = 1
m, n, l, p = material('TapeFabric')
tt = n.new('ShaderNodeTexImage'); tt.image = img('tape.png')
l.new(tt.outputs['Color'], p.inputs['Base Color'])
p.inputs['Roughness'].default_value = 0.72
p.inputs['Sheen Weight'].default_value = 0.4
tape.data.materials.append(m)

# ---------- light ----------
direction = Vector((0.42, 0.72, -0.55)).normalized()
bpy.ops.object.light_add(type='SUN', location=(0, 0, 2))
sun = bpy.context.object; sun.name = 'Window'
sun.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
sun.data.energy = 6.0; sun.data.angle = math.radians(0.5); sun.data.color = (1.0, 0.83, 0.64)

# the window and palm shadow, cut from the shoot frame, hung between the sun and the table
target = Vector((0.0, 0.22, 0.34))
gpos = target - direction * 1.4
gobo = plane('WindowShadow', (2.6, 1.51), gpos, (0, 0, 0))
gobo.rotation_euler = direction.to_track_quat('Z', 'Y').to_euler()
gobo.rotation_euler.rotate_axis('Z', math.radians(14))
m = bpy.data.materials.new('WindowShadow'); m.use_nodes = True
n, l = m.node_tree.nodes, m.node_tree.links
for x in list(n):
    n.remove(x)
gt = n.new('ShaderNodeTexImage'); gt.image = img('gobo.png', False)
gtc = n.new('ShaderNodeTexCoord'); gmp = n.new('ShaderNodeMapping'); gmp.inputs['Scale'].default_value = (4.2, 4.2, 1)
gmp.inputs['Rotation'].default_value = (0, 0, math.radians(8))
l.new(gtc.outputs['UV'], gmp.inputs['Vector']); l.new(gmp.outputs['Vector'], gt.inputs['Vector'])
gt.extension = 'MIRROR'
tr = n.new('ShaderNodeBsdfTransparent'); df = n.new('ShaderNodeBsdfDiffuse'); df.inputs['Color'].default_value = (0, 0, 0, 1)
mx = n.new('ShaderNodeMixShader'); out = n.new('ShaderNodeOutputMaterial')
l.new(gt.outputs['Color'], mx.inputs['Fac']); l.new(df.outputs['BSDF'], mx.inputs[1]); l.new(tr.outputs['BSDF'], mx.inputs[2])
l.new(mx.outputs['Shader'], out.inputs['Surface'])
gobo.data.materials.append(m)
gobo.visible_camera = False; gobo.visible_diffuse = False; gobo.visible_glossy = False; gobo.visible_transmission = False

bpy.ops.object.light_add(type='AREA', location=(0.62, -0.55, 0.42))
fill = bpy.context.object; fill.name = 'Fill'
fill.data.size = 0.7; fill.data.energy = 5; fill.data.color = (0.86, 0.93, 1.0)
fill.rotation_euler = (Vector((0.03, 0.03, 0.18)) - fill.location).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.object.light_add(type='AREA', location=(0.28, 0.24, 0.62))
rim = bpy.context.object; rim.name = 'Rim'
rim.data.size = 0.25; rim.data.energy = 7; rim.data.color = (1.0, 0.86, 0.7)
rim.rotation_euler = (Vector((0.03, 0.03, 0.30)) - rim.location).to_track_quat('-Z', 'Y').to_euler()

# a warm glow on the wall behind the pouch, from a lamp low on the table
bpy.ops.object.light_add(type='AREA', location=(0.07, 0.17, 0.03))
glow = bpy.context.object; glow.name = 'WallGlow'
glow.data.shape = 'DISK'; glow.data.size = 0.12; glow.data.energy = 13; glow.data.color = (1.0, 0.78, 0.52)
glow.rotation_euler = (Vector((0.05, WALL_Y, 0.36)) - glow.location).to_track_quat('-Z', 'Y').to_euler()
glow.visible_camera = False

world = bpy.data.worlds.new('Room'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.010, 0.022, 0.018, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35

# ---------- camera ----------
bpy.ops.object.camera_add(location=(-0.03, -1.10, 0.25))
cam = bpy.context.object; cam.name = 'Camera'; sc.camera = cam
cam.rotation_euler = (Vector((-0.005, 0.05, 0.245)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = 52; cam.data.sensor_width = 36; cam.data.sensor_fit = 'AUTO'
cam.data.dof.use_dof = True; cam.data.dof.focus_distance = 1.07; cam.data.dof.aperture_fstop = 4.5

sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
sc.render.resolution_percentage = SCALE
sc.render.use_stamp = False
for k in dir(sc.render):                      # no render notes (date, time, camera, samples) in the PNG
    if k.startswith('use_stamp_'):
        setattr(sc.render, k, False)
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGB'
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Medium High Contrast'
sc.view_settings.exposure = -0.3
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print('TAPE LENGTH', round(TOTAL, 3))
