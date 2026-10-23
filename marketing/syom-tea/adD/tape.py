# The tailor's tape for ad D, rendered alone so it can be laid into the photo composite:
#   blender -b -P tape.py -- <out.png> [samples] [proxy|tapeonly]
# The camera is solved so the pouch base centre lands at (700, 1560) and the pouch stands about 900 px tall.
# A box stands where the pouch photo goes: it hides the tape behind the pouch and throws the pouch's shadow onto a
# shadow catcher, so the PNG holds the tape plus the shadows of tape and pouch on the table. With "proxy" the box
# renders white instead, to check that the pouch photo lines up.
import bpy, bmesh, math, sys, os
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else 'cut/tape.png')
SAMPLES = int(argv[1]) if len(argv) > 1 else 128
PROXY = len(argv) > 2 and argv[2] == 'proxy'
NOFLOOR = len(argv) > 2 and argv[2] == 'tapeonly'   # the tape without the shadow catcher, to split tape from shadows
HERE = os.path.dirname(os.path.abspath(__file__))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# camera: about pouch-top height, a little down onto the table; placed so the pouch base centre lands at (700, 1560)
# and the pouch stands about 900 px tall, as in the composite
bpy.ops.object.camera_add(location=(-0.05, -1.05, 0.34))
cam = bpy.context.object; sc.camera = cam
cam.data.sensor_width = 36; cam.data.sensor_fit = 'AUTO'
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
# the pouch stand-in: 20 x 7 x 34 cm (the gusset as deep as it shows in DSC05052), turned 30 degrees, front to camera right
PX = 0.06                      # the pouch stands 6 cm right of the scene centre
ROT = math.radians(30)
W, D, H = 0.20, 0.07, 0.34
bpy.ops.mesh.primitive_cube_add(size=1, location=(PX, 0, H / 2))
box = bpy.context.object; box.name = 'PouchStandIn'
box.scale = (W, D, H); box.rotation_euler = (0, 0, ROT)
m = bpy.data.materials.new('StandIn'); m.use_nodes = True
nt = m.node_tree
for x in list(nt.nodes):
    nt.nodes.remove(x)
out = nt.nodes.new('ShaderNodeOutputMaterial')
if PROXY:
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = 1
    nt.links.new(em.outputs[0], out.inputs['Surface'])
else:
    ho = nt.nodes.new('ShaderNodeHoldout'); nt.links.new(ho.outputs[0], out.inputs['Surface'])
box.data.materials.append(m)

bpy.ops.mesh.primitive_plane_add(size=6, location=(0, 0, 0))
floor = bpy.context.object; floor.name = 'Table'
floor.is_shadow_catcher = True
if NOFLOOR:
    floor.hide_render = True



def px(v):
    # the larger side (1920) spans the 36 mm sensor; shift is in units of that side
    c = cam.matrix_world.inverted() @ Vector(v)
    f = cam.data.lens / 36 * 1920
    return Vector((540 + c.x / -c.z * f - cam.data.shift_x * 1920, 960 - c.y / -c.z * f + cam.data.shift_y * 1920))


bpy.context.view_layer.update()
base_w = box.matrix_world @ Vector((0, 0, -0.5))
top_w = box.matrix_world @ Vector((0, 0, 0.5))
cam.rotation_euler = (Vector((PX, 0, 0.17)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = 50
bpy.context.view_layer.update()
print('START', tuple(px(base_w)), tuple(px(top_w)))
for _ in range(40):
    b_, t_ = px(base_w), px(top_w)
    cam.data.lens *= min(max(900 / max(b_.y - t_.y, 1), 0.7), 1.4)
    bpy.context.view_layer.update()
    b_ = px(base_w)
    cam.data.shift_x += (b_.x - 700) / 1920
    cam.data.shift_y += (1560 - b_.y) / 1920
    bpy.context.view_layer.update()
b_, t_ = px(base_w), px(top_w)
print('CAM lens %.2f shift %.4f %.4f base %s top %s' % (cam.data.lens, cam.data.shift_x, cam.data.shift_y, tuple(round(c) for c in b_), tuple(round(c) for c in t_)))
WALL_Y = 0.45
print('TABLE', [tuple(round(c, 1) for c in px((x, y, 0))) for x, y in ((-1.0, -0.62), (1.2, -0.62), (1.2, WALL_Y), (-1.0, WALL_Y))])
print('WALLTOP', [tuple(round(c, 1) for c in px((x, WALL_Y, 1.0))) for x in (-1.0, 1.2)])
print('BOX', [tuple(round(c) for c in px(box.matrix_world @ Vector((sx, sy, sz)))) for sx in (-.5, .5) for sy in (-.5, .5) for sz in (-.5, .5)])

# ---------- the tape ----------
TW, TT = 0.020, 0.0005
M = Matrix.Translation((PX, 0, 0)) @ Matrix.Rotation(ROT, 4, 'Z')


def smooth(a, b, x):
    t = min(max((x - a) / (b - a), 0), 1)
    return t * t * (3 - 2 * t)


ctrl = []   # world (x, y, z, roll)
# the end runs in from the bottom left of the frame toward the front of the pouch
for p in [(-0.26, -0.60, 0.0003, 0), (-0.13, -0.44, 0.0003, 0), (-0.05, -0.30, 0.0004, 0.12), (0.02, -0.18, 0.0003, 0)]:
    ctrl.append(p)
# then a loose turn round the foot, starting in front, round the right, behind, and up the left side where it leans
for k in range(0, 21):
    deg = 250 + k * 18                               # 250 .. 610 degrees in the pouch's own frame
    th = math.radians(deg)
    lean = smooth(500, 525, deg) * (1 - smooth(560, 585, deg))
    r = 1 + 0.06 * math.sin(2.7 * th + 0.4)
    ax, by = 0.128 * r, 0.092 * r
    x, y = ax * math.cos(th), by * math.sin(th)
    if lean > 0:                                     # pulled in against the side gusset and standing on its edge
        x = x * (1 - 0.12 * lean)
    roll = -1.25 * lean
    z = 0.0003 + 0.010 * lean + (0.0011 if deg > 585 else 0)
    q = M @ Vector((x, y, 0))
    ctrl.append((q.x, q.y, z, roll))


def catmull(pts, step=0.0025):
    res = []
    P = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = (Vector(P[k][:3]) for k in (i - 1, i, i + 1, i + 2))
        a0, a1 = P[i][3], P[i + 1][3]
        n = max(2, int((p2 - p1).length / step))
        for k in range(n):
            t = k / n
            q = 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3)
            res.append((q, a0 + (a1 - a0) * t))
    res.append((Vector(P[-2][:3]), P[-2][3]))
    return res


path = catmull(ctrl)
bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
rows, L, prev = [], 0.0, None
for i, (q, roll) in enumerate(path):
    nxt = path[min(i + 1, len(path) - 1)][0]; prv = path[max(i - 1, 0)][0]
    t = (nxt - prv).normalized()
    side = Matrix.Rotation(roll, 3, t) @ Vector((0, 0, 1)).cross(t).normalized()
    if prev is not None:
        L += (q - prev).length
    prev = q
    rows.append((bm.verts.new(q - side * TW / 2), bm.verts.new(q + side * TW / 2), L))
for a, b in zip(rows, rows[1:]):
    f = bm.faces.new((a[0], b[0], b[1], a[1]))
    for loop, uv in zip(f.loops, ((a[2], 0), (b[2], 0), (b[2], 1), (a[2], 1))):
        loop[uvl].uv = (uv[0] / 1.5 + 0.03, uv[1])
mesh = bpy.data.meshes.new('Tape'); bm.to_mesh(mesh); bm.free()
tape = bpy.data.objects.new('Tape', mesh); sc.collection.objects.link(tape)
for f in mesh.polygons:
    f.use_smooth = True
so = tape.modifiers.new('Thickness', 'SOLIDIFY'); so.thickness = TT; so.offset = 1
m = bpy.data.materials.new('TapeFabric'); m.use_nodes = True
p = m.node_tree.nodes['Principled BSDF']
tt = m.node_tree.nodes.new('ShaderNodeTexImage')
tt.image = bpy.data.images.load(os.path.join(HERE, '..', 'adB', 'tex', 'tape.png'))
m.node_tree.links.new(tt.outputs['Color'], p.inputs['Base Color'])
p.inputs['Roughness'].default_value = 0.7; p.inputs['Sheen Weight'].default_value = 0.4
tape.data.materials.append(m)
# the brass cap on the end that lies in front
end_q, end_t = path[-1][0], (path[-1][0] - path[-6][0]).normalized()
bpy.ops.mesh.primitive_cube_add(size=1, location=end_q + end_t * 0.004 + Vector((0, 0, 0.0012)))
cap = bpy.context.object; cap.name = 'BrassCap'
cap.scale = (0.008, TW + 0.001, 0.0016)
cap.rotation_euler = (0, 0, math.atan2(end_t.y, end_t.x))
mb = bpy.data.materials.new('Brass'); mb.use_nodes = True
pb = mb.node_tree.nodes['Principled BSDF']
pb.inputs['Base Color'].default_value = (0.62, 0.42, 0.16, 1); pb.inputs['Metallic'].default_value = 1; pb.inputs['Roughness'].default_value = 0.32
cap.data.materials.append(mb)

# ---------- light: low warm sun from the left (late afternoon), soft fill from the room ----------
direction = Vector((0.82, 0.38, -0.43)).normalized()
bpy.ops.object.light_add(type='SUN', location=(0, 0, 2))
sun = bpy.context.object
sun.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
sun.data.energy = 6.5; sun.data.angle = math.radians(2.5); sun.data.color = (1.0, 0.82, 0.62)
world = bpy.data.worlds.new('Room'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.11, 0.12, 0.09, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.4

sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1080, 1920, 100
sc.render.use_stamp = False
for k in dir(sc.render):
    if k.startswith('use_stamp_'):
        setattr(sc.render, k, False)
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
