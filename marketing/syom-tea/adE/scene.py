# Ad E scene: the pouch on a natural stone slab, morning sun through leaves, deep green plaster wall behind.
#   blender -b -P scene.py -- <out.png> [samples] [beauty|front|light|proxy] [extra px each side] [percent]
# beauty: the whole scene; the pouch stand-in is unseen but throws its shadow and catches the leaf light
# front:  only the sprigs, on a transparent ground, to lay over the pouch photo where they cross its foot
# light:  only the stand-in in plain white, so compose.py can put the same sun and leaf shadow on the pouch photo
# proxy:  the beauty pass with the stand-in visible, to check that the pouch photo lines up
# The camera is solved so the stand-in's base centre lands at (BX, BY) and it stands PH px tall; it writes
# cut/camera.json for compose.py. Run ./fetch.sh first (rock, plants) and ../adB/fetch-textures.sh (plaster).
import bpy, math, sys, os, json, random
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else 'render/beauty.png')
SAMPLES = int(argv[1]) if len(argv) > 1 else 96
MODE = argv[2] if len(argv) > 2 else 'beauty'
EXT = int(argv[3]) if len(argv) > 3 else 0
PCT = int(argv[4]) if len(argv) > 4 else 100
HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, 'tex')
WALLTEX = os.path.join(HERE, '..', 'adB', 'tex')
os.makedirs(os.path.join(HERE, 'cut'), exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
random.seed(4)


def mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links, m.node_tree.nodes['Principled BSDF']


def img(nodes, path, data=False, mapping=None):
    t = nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(path)
    if data:
        t.image.colorspace_settings.name = 'Non-Color'
    return t


# ---------- camera: pouch-top height, a little down onto the stone; the pouch straight ahead ----------
bpy.ops.object.camera_add(location=(0, -1.05, 0.36))
cam = bpy.context.object; sc.camera = cam; cam.name = 'Camera'
cam.data.sensor_width = 36; cam.data.sensor_fit = 'AUTO'

# the pouch stand-in: 19.4 x 10 x 34 cm, square to the camera
W, D, H = 0.194, 0.10, 0.34
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, H / 2))
box = bpy.context.object; box.name = 'PouchStandIn'
box.scale = (W, D, H)
m, n, l, p = mat('StandIn')
p.inputs['Base Color'].default_value = (0.8, 0.8, 0.8, 1); p.inputs['Roughness'].default_value = 0.9
box.data.materials.append(m)


def px(v):
    c = cam.matrix_world.inverted() @ Vector(v)
    f = cam.data.lens / 36 * 1920
    return Vector((540 + c.x / -c.z * f - cam.data.shift_x * 1920, 960 - c.y / -c.z * f + cam.data.shift_y * 1920))


BX, BY, PH = 305, 1625, 750
bpy.context.view_layer.update()
base_w = box.matrix_world @ Vector((0, 0, -0.5))
top_w = box.matrix_world @ Vector((0, 0, 0.5))
cam.rotation_euler = (Vector((0, 0, 0.17)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = 50
bpy.context.view_layer.update()
for _ in range(40):
    b_, t_ = px(base_w), px(top_w)
    cam.data.lens *= min(max(PH / max(b_.y - t_.y, 1), 0.7), 1.4)
    bpy.context.view_layer.update()
    b_ = px(base_w)
    cam.data.shift_x += (b_.x - BX) / 1920
    cam.data.shift_y += (BY - b_.y) / 1920
    bpy.context.view_layer.update()
print('CAM lens %.2f shift %.4f %.4f' % (cam.data.lens, cam.data.shift_x, cam.data.shift_y))
json.dump({'front_left': list(px(box.matrix_world @ Vector((-.5, -.5, -.5)))),
           'front_right': list(px(box.matrix_world @ Vector((.5, -.5, -.5)))),
           'top_left': list(px(box.matrix_world @ Vector((-.5, -.5, .5)))),
           'base': list(px(base_w)), 'top': list(px(top_w))},
          open(os.path.join(HERE, 'cut', 'camera.json'), 'w'), indent=1)


def on_stone(u, v):
    """the point on the stone's top seen at pixel (u, v)"""
    f = cam.data.lens / 36 * 1920
    d = cam.matrix_world.to_3x3() @ Vector(((u - 540 + cam.data.shift_x * 1920) / f, (960 + cam.data.shift_y * 1920 - v) / f, -1))
    o = cam.matrix_world.translation
    return o + d * (-o.z / d.z)


# ---------- the stone slab: a long block of rough grey-green rock, its back edge in the frame ----------
SLAB_BACK = 0.34
bpy.ops.mesh.primitive_cube_add(size=1, location=(0.3, (SLAB_BACK - 1.6) / 2, -0.07))
slab = bpy.context.object; slab.name = 'StoneSlab'
slab.scale = (2.6, SLAB_BACK + 1.6, 0.14)
bpy.ops.object.transform_apply(scale=True)
bv = slab.modifiers.new('Bevel', 'BEVEL'); bv.width = 0.012; bv.segments = 4
m, n, l, p = mat('Stone')
tc = n.new('ShaderNodeTexCoord'); mp = n.new('ShaderNodeMapping')
mp.inputs['Scale'].default_value = (1.6, 1.6, 1.6)
l.new(tc.outputs['Object'], mp.inputs['Vector'])
dif = img(n, os.path.join(TEX, 'rock_surface_diff.jpg')); rgh = img(n, os.path.join(TEX, 'rock_surface_rough.jpg'), True)
nor = img(n, os.path.join(TEX, 'rock_surface_nor_gl.jpg'), True)
for t in (dif, rgh, nor):
    t.projection = 'BOX'; t.projection_blend = 0.3
    l.new(mp.outputs['Vector'], t.inputs['Vector'])
# take the warm brown out of the rock and lean it grey-green, so it sits in the brand's green world
hs = n.new('ShaderNodeHueSaturation'); hs.inputs['Saturation'].default_value = 0.35; hs.inputs['Value'].default_value = 0.85
l.new(dif.outputs['Color'], hs.inputs['Color'])
tint = n.new('ShaderNodeMix'); tint.data_type = 'RGBA'; tint.blend_type = 'MULTIPLY'; tint.inputs['Factor'].default_value = 1
tint.inputs[7].default_value = (0.78, 0.92, 0.86, 1)
l.new(hs.outputs['Color'], tint.inputs[6]); l.new(tint.outputs[2], p.inputs['Base Color'])
l.new(rgh.outputs['Color'], p.inputs['Roughness'])
nm = n.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = 1.4
l.new(nor.outputs['Color'], nm.inputs['Color']); l.new(nm.outputs['Normal'], p.inputs['Normal'])
slab.data.materials.append(m)

# ---------- the wall: green plaster, well behind the slab so it falls out of focus ----------
WALL_Y = 1.15
bpy.ops.mesh.primitive_plane_add(size=1, location=(0.3, WALL_Y, 0.6), rotation=(math.radians(90), 0, 0))
wall = bpy.context.object; wall.name = 'Wall'; wall.scale = (4, 3, 1)
bpy.ops.object.transform_apply(scale=True)
m, n, l, p = mat('GreenPlaster')
tc = n.new('ShaderNodeTexCoord'); mp = n.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.45, 0.45, 0.45)
l.new(tc.outputs['Object'], mp.inputs['Vector'])
dif = img(n, os.path.join(WALLTEX, 'plastered_wall_02_diff.jpg')); nor = img(n, os.path.join(WALLTEX, 'plastered_wall_02_nor_gl.jpg'), True)
for t in (dif, nor):
    l.new(mp.outputs['Vector'], t.inputs['Vector'])
bw = n.new('ShaderNodeRGBToBW'); l.new(dif.outputs['Color'], bw.inputs['Color'])
ramp = n.new('ShaderNodeValToRGB')                # the plaster's own tone variation, carried in the brand green
ramp.color_ramp.elements[0].position = 0.25; ramp.color_ramp.elements[0].color = (0.0, 0.022, 0.016, 1)
ramp.color_ramp.elements[1].position = 0.85; ramp.color_ramp.elements[1].color = (0.001, 0.055, 0.040, 1)
l.new(bw.outputs['Val'], ramp.inputs['Fac']); l.new(ramp.outputs['Color'], p.inputs['Base Color'])
p.inputs['Roughness'].default_value = 0.92
nm = n.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = 0.35
l.new(nor.outputs['Color'], nm.inputs['Color']); l.new(nm.outputs['Normal'], p.inputs['Normal'])
wall.data.materials.append(m)


# ---------- plants (Poly Haven scans) ----------
def import_gltf(name):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, 'models', name, f'{name}_2k.gltf'))
    return [o for o in bpy.data.objects if o not in before]


# the leaf shadow: the shrub row, scaled up and hung between the sun and the scene, out of frame
SUN_DIR = Vector((-0.52, 0.62, -0.58)).normalized()     # sun to scene: from the front right, high, morning
shrubs = import_gltf('shrub_04')
gobo = [o for o in shrubs if o.type == 'MESH'][0]; gobo.name = 'LeafShadow'
gobo.parent = None
gobo.rotation_mode = 'XYZ'
bpy.context.view_layer.objects.active = gobo; gobo.select_set(True)
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY')
gobo.scale = (7, 7, 7)
# its broad side square to the sun, half way between the wall behind the pouch and the sun
gobo.rotation_mode = 'QUATERNION'; gobo.rotation_quaternion = SUN_DIR.to_track_quat('Y', 'Z')
gobo.location = Vector((0.3, WALL_Y, 0.7)) - SUN_DIR * 1.2
gobo.visible_camera = False
# a second branch nearer the slab dapples the stone in front of the pouch and the pouch itself
gobo2 = gobo.copy(); gobo2.data = gobo.data; sc.collection.objects.link(gobo2); gobo2.name = 'LeafShadowNear'
gobo2.scale = (4, 4, 4)
gobo2.rotation_quaternion = SUN_DIR.to_track_quat('Y', 'Z') @ Vector((0, 1, 0)).to_track_quat('Y', 'X')
gobo2.location = Vector((0.32, -0.12, 0.0)) - SUN_DIR * 0.75
for o in shrubs:
    if o is not gobo and o.type != 'MESH':
        o.hide_render = True

# fresh sprigs: nettle stems laid on their side round the pouch's foot and one close to the lens, out of focus
sprigs = [o for o in import_gltf('nettle_plant') if o.type == 'MESH']
by = {o.name.split('_LOD')[0].replace('nettle_plant_', ''): o for o in sprigs}
LAY = [  # (part, pixel u, v on the Story frame, turn about the vertical, scale)
    ('tall_a', 700, 1690, 200, 1.15),
    ('medium_b', 560, 1640, 140, 1.0),
    ('tall_b', 40, 1700, 330, 1.0),
]
for part, u, v, turn, s in LAY:
    o = by[part]
    q = on_stone(u, v)
    o.parent = None
    o.rotation_mode = 'XYZ'
    o.rotation_euler = (math.radians(-90 + random.uniform(-8, 8)), math.radians(random.uniform(-10, 10)), math.radians(turn))
    o.scale = (s, s, s)
    o.location = (q.x, q.y, 0.004 * s)
    o.name = 'Sprig_' + part
for o in sprigs:
    if o.name.startswith('nettle'):
        o.hide_render = True

# ---------- light ----------
bpy.ops.object.light_add(type='SUN', location=(0, 0, 3))
sun = bpy.context.object; sun.name = 'MorningSun'
sun.rotation_euler = SUN_DIR.to_track_quat('-Z', 'Y').to_euler()
sun.data.energy = 9.0; sun.data.angle = math.radians(2.0); sun.data.color = (1.0, 0.88, 0.70)
# the warm patch of light on the wall behind the pouch, off to its right
bpy.ops.object.light_add(type='SPOT', location=(0.55, -0.6, 1.2))
spot = bpy.context.object; spot.name = 'WallGlow'
spot.rotation_euler = (Vector((0.22, WALL_Y, 0.55)) - spot.location).to_track_quat('-Z', 'Y').to_euler()
spot.data.energy = 450; spot.data.spot_size = math.radians(30); spot.data.spot_blend = 1.0
spot.data.shadow_soft_size = 0.4; spot.data.color = (1.0, 0.80, 0.55)
world = bpy.data.worlds.new('Room'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.07, 0.10, 0.085, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.8

# ---------- passes ----------
if MODE == 'beauty':
    box.visible_camera = False
elif MODE == 'front':
    for o in (slab, wall, box):
        o.visible_camera = False
    sc.render.film_transparent = True
elif MODE == 'light':
    for o in [slab, wall] + [o for o in bpy.data.objects if o.name.startswith('Sprig_')]:
        o.visible_camera = False
    p = box.data.materials[0].node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (1, 1, 1, 1)
    sc.render.film_transparent = True

cam.data.dof.use_dof = MODE != 'light'
cam.data.dof.focus_distance = (cam.location - Vector((0, -0.05, 0.17))).length
cam.data.dof.aperture_fstop = 3.2

sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1080 + 2 * EXT, 1920, PCT
sc.render.use_stamp = False
for k in dir(sc.render):
    if k.startswith('use_stamp_'):
        setattr(sc.render, k, False)
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
