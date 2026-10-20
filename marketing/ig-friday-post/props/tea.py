# The Friday still: an Iraqi استكان of tea on its saucer, a teaspoon, two sugar cubes and his orange pencil, lit by warm
# morning sun through a window (a window frame between the sun and the desk throws the pane shadows), shot like a photo
# (a 60 mm lens at f/5, focused on the glass). Rendered in Cycles over a shadow catcher at the post's own frame
# (1080×1350), so the PNG lays straight over the page's desk: objects, their shadows and the window shadow.
#   blender -b -P tea.py -- OUT.png HDRI        (SAMPLES=24 PCT=30 for a quick test)
import bpy, bmesh, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
OUT, HDRI = argv[0], argv[1]
CM = 0.01


def srgb(h):
    h = h.lstrip('#')
    return tuple(((c / 255 + 0.055) / 1.055) ** 2.4 if c / 255 > 0.04045 else c / 255 / 12.92 for c in (int(h[i:i + 2], 16) for i in (0, 2, 4))) + (1.0,)


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = int(os.environ.get('SAMPLES', 192))
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 24
sc.cycles.transmission_bounces = 24
sc.cycles.volume_bounces = 2
sc.cycles.caustics_refractive = True
sc.cycles.caustics_reflective = False
sc.cycles.blur_glossy = 0.6
sc.render.film_transparent = True
sc.view_settings.view_transform = 'AgX'
sc.render.resolution_x, sc.render.resolution_y = 1080, 1350
sc.render.resolution_percentage = int(os.environ.get('PCT', 150))
sc.render.image_settings.color_mode = 'RGBA'

# a dim room (the CC0 «Studio Small 09» HDRI, turned down) and the morning sun coming in from the back left
w = bpy.data.worlds.new('w'); w.use_nodes = True; sc.world = w
env = w.node_tree.nodes.new('ShaderNodeTexEnvironment'); env.image = bpy.data.images.load(HDRI)
w.node_tree.links.new(env.outputs['Color'], w.node_tree.nodes['Background'].inputs['Color'])
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.22
L = Vector((-0.62, 0.55, 0.52)).normalized()            # towards the sun
sd = bpy.data.lights.new('sun', 'SUN'); sd.energy = 4.2; sd.angle = math.radians(1.6); sd.color = (1.0, 0.8, 0.58)
so = bpy.data.objects.new('sun', sd); sc.collection.objects.link(so)
so.rotation_euler = (-L).to_track_quat('-Z', 'Y').to_euler()

# the window: a wall with a two-by-two paned opening between the sun and the desk (seen only through its shadow)
def window(dist=0.42, hole=(0.34, 0.44), bar=0.018, off=(0.0, 0.0), bars=(-0.1, 0.1)):
    n = L
    u = n.cross(Vector((0, 0, 1))).normalized()
    v = u.cross(n).normalized()
    c = n * dist
    hw, hh = hole[0] / 2, hole[1] / 2
    ox, oy = off
    rects = [(-3, 3, oy + hh, 3), (-3, 3, -3, oy - hh), (-3, ox - hw, oy - hh, oy + hh), (ox + hw, 3, oy - hh, oy + hh),
             (ox + bars[0] - bar / 2, ox + bars[0] + bar / 2, oy - hh, oy + hh), (ox - hw, ox + hw, oy + bars[1] - bar / 2, oy + bars[1] + bar / 2)]
    bm = bmesh.new()
    for x0, x1, y0, y1 in rects:
        vs = [bm.verts.new(c + u * x + v * y) for x, y in ((x0, y0), (x1, y0), (x1, y1), (x0, y1))]
        bm.faces.new(vs)
    me = bpy.data.meshes.new('window'); bm.to_mesh(me)
    ob = bpy.data.objects.new('window', me); sc.collection.objects.link(ob)
    ob.visible_camera = False
    return ob
window()


def mat(name, color, rough=0.3, metal=0.0, trans=0.0, ior=1.45, sss=0.0, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = srgb(color)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    p.inputs['Transmission Weight'].default_value = trans
    p.inputs['IOR'].default_value = ior
    p.inputs['Subsurface Weight'].default_value = sss
    p.inputs['Coat Weight'].default_value = coat
    return m


def spin(name, prof, mats, closed, segs=160, z0=0.0):
    """A surface of revolution from an (r, z) polyline in cm; open profiles stay open (no closing edge)."""
    bm = bmesh.new()
    vs = [bm.verts.new((r * CM, 0, (z + z0) * CM)) for r, z in prof]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    if closed:
        es.append(bm.edges.new((vs[-1], vs[0])))
    bmesh.ops.spin(bm, geom=vs + es, cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=segs, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); me.shade_smooth()
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    for m in mats:
        me.materials.append(m)
    return ob


def outward(ob, test):
    """Flip every face if the face nearest `test` (a point in cm) does not point the way `test[3:]` says."""
    me = ob.data
    p = Vector(test[:3]) * CM
    f = min(me.polygons, key=lambda f: (f.center - p).length)
    if f.normal.dot(Vector(test[3:])) < 0:
        for f in me.polygons:
            f.flip()
        me.update()


# ── the istikan: a thick base, a waist, a flared lip. The surfaces are the real interfaces: air|glass outside and
# above the tea, glass|tea (IOR 1.33/1.5) on the inner wall and floor below the tea line, tea|air on top.
H, WALL, FLOOR, ZT = 8.6, 0.11, 0.75, 7.55
def r_out(z):
    if z < 3.4:
        return 2.15 - 0.45 * math.sin(z / 3.4 * math.pi / 2)
    return 1.70 + 0.95 * ((z - 3.4) / 5.2) ** 1.5
r_in = lambda z: r_out(z) - WALL
SAU_TOP = 0.33           # the glass stands in the saucer's well
steps = lambda a, b, n: [a + (b - a) * i / n for i in range(n + 1)]
glass_prof = [(r_in(z), z) for z in steps(ZT, H - 0.02, 12)] + [(r_out(H) - 0.03, H + 0.015)] + \
             [(r_out(z), z) for z in steps(H - 0.02, 0.3, 50)] + [(2.13, 0.1), (2.02, 0.0), (1.2, 0.0), (0, 0.06)]
glass = mat('glass', '#ffffff', rough=0.0, trans=1.0, ior=1.5)
g = spin('glass', glass_prof, [glass], closed=False, z0=SAU_TOP)
outward(g, (r_out(5) * math.cos(0.01), r_out(5) * math.sin(0.01), 5 + SAU_TOP, 1, 0, 0))

def tea_mat(name, ior):
    m = mat(name, '#ffffff', rough=0.0, trans=1.0, ior=ior)
    vol = m.node_tree.nodes.new('ShaderNodeVolumeAbsorption')
    vol.inputs['Color'].default_value = srgb('#cc520a'); vol.inputs['Density'].default_value = 80
    m.node_tree.links.new(vol.outputs[0], m.node_tree.nodes['Material Output'].inputs['Volume'])
    return m
tea_wall, tea_top = tea_mat('tea-glass', 1.33 / 1.5), tea_mat('tea-air', 1.33)
tea_prof = [(0, FLOOR), (r_in(FLOOR), FLOOR)] + [(r_in(z), z) for z in steps(FLOOR, ZT, 40)][1:] + [(0, ZT)]
t = spin('tea', tea_prof, [tea_wall, tea_top], closed=True, z0=SAU_TOP)
bm = bmesh.new(); bm.from_mesh(t.data); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(t.data)
for f in t.data.polygons:
    f.material_index = 1 if f.normal.z > 0.9 and abs(f.center.z - (ZT + SAU_TOP) * CM) < 0.001 else 0

gold = mat('gold', '#e3b24a', rough=0.16, metal=1.0)
def ring(r, z, thick=0.07):
    bpy.ops.mesh.primitive_torus_add(major_radius=r * CM, minor_radius=thick * CM, location=(0, 0, z * CM), major_segments=200, minor_segments=12)
    o = bpy.context.active_object; o.data.materials.append(gold); o.data.shade_smooth()
ring(r_out(H) - 0.05, H + SAU_TOP - 0.02)

# ── the saucer: white porcelain, a gold rim and a fine gold line inside it
porc = mat('porc', '#f7f2e9', rough=0.1, sss=0.04, coat=0.5)
LIFT = 0.45
sau = [(0, -0.45), (2.4, -0.45), (2.6, -0.4), (2.85, -0.2), (4.9, 0.2), (5.3, 0.38), (5.25, 0.5), (4.92, 0.41), (2.95, 0.05), (2.7, -0.12), (0, -0.12)]
spin('saucer', sau, [porc], closed=True, z0=LIFT)
s = sc.objects['saucer']; bm = bmesh.new(); bm.from_mesh(s.data); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(s.data)
ring(5.26, 0.47 + LIFT, 0.06)
ring(4.55, 0.33 + LIFT, 0.025)

def z_sau(r):            # the saucer's top surface (cm, above the desk)
    pts = [(0, -0.12), (2.7, -0.12), (2.95, 0.05), (4.92, 0.41), (5.25, 0.5), (9, 0.5)]
    for (a, za), (b, zb) in zip(pts, pts[1:]):
        if r <= b:
            return LIFT + za + (zb - za) * (r - a) / (b - a)
    return LIFT + 0.5

# ── a teaspoon lying across the saucer to the right of the glass
steel = mat('steel', '#d8d9dc', rough=0.12, metal=1.0)
cx, cy, ang = 3.7, -0.9, math.radians(58)
u = Vector((math.sin(ang), math.cos(ang), 0))
P = lambda t: Vector((cx, cy, 0)) + u * t
bowl_t = -2.6
bp = P(bowl_t)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=48, ring_count=24, location=(bp.x * CM, bp.y * CM, (z_sau(bp.length) + 0.16) * CM))
bowl = bpy.context.active_object; bowl.scale = (0.55 * CM, 0.95 * CM, 0.16 * CM); bowl.rotation_euler = (0, 0, -ang)
bowl.data.materials.append(steel); bowl.data.shade_smooth()
cu = bpy.data.curves.new('handle', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.085 * CM; cu.bevel_resolution = 4
sp = cu.splines.new('POLY')
ts = steps(-1.75, 5.2, 14)
sp.points.add(len(ts) - 1)
for p, tt in zip(sp.points, ts):
    q = P(tt)
    p.co = (q.x * CM, q.y * CM, (max(z_sau(q.length), z_sau(min(q.length, 5.25))) + 0.1) * CM, 1)
hd = bpy.data.objects.new('handle', cu); sc.collection.objects.link(hd); cu.materials.append(steel)

# ── two sugar cubes: one on the saucer, one on the desk
sugar = mat('sugar', '#fbfaf6', rough=0.85, sss=0.35)
nz = sugar.node_tree.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1100
bpn = sugar.node_tree.nodes.new('ShaderNodeBump'); bpn.inputs['Strength'].default_value = 0.7
sugar.node_tree.links.new(nz.outputs['Fac'], bpn.inputs['Height']); sugar.node_tree.links.new(bpn.outputs['Normal'], sugar.node_tree.nodes['Principled BSDF'].inputs['Normal'])
for (x, y, z, rz) in ((-3.4, -1.9, z_sau(3.9) + 0.62, 18), (-7.4, -3.6, 0.62, -24)):
    bpy.ops.mesh.primitive_cube_add(size=1.2 * CM, location=(x * CM, y * CM, z * CM), rotation=(0, 0, math.radians(rz)))
    c = bpy.context.active_object; c.data.materials.append(sugar)
    b = c.modifiers.new('bv', 'BEVEL'); b.width = 0.0013; b.segments = 3

# ── his orange pencil, lying in front, out of focus
paint = mat('paint', '#e2541b', rough=0.3, coat=0.35)
wood = mat('wood', '#e3b98c', rough=0.75)
lead = mat('lead', '#141416', rough=0.35, metal=0.4)
pen = bpy.data.objects.new('pencil', None); sc.collection.objects.link(pen)
R = 0.36
def pcyl(name, m, r1, r2, x0, x1, segs, rot=0.0):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r1 * CM, radius2=r2 * CM, depth=(x1 - x0) * CM)
    me = bpy.data.meshes.new(name); bm.to_mesh(me)
    if segs > 6:
        me.shade_smooth()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); me.materials.append(m)
    o.rotation_mode = 'ZYX'; o.rotation_euler = (0, math.radians(90), rot); o.location = ((x0 + x1) / 2 * CM, 0, 0); o.parent = pen
    return o
body = pcyl('body', paint, R, R, -16, 0, 6, math.radians(30))
bv = body.modifiers.new('bv', 'BEVEL'); bv.width = 0.03 * CM; bv.segments = 2
pcyl('cone', wood, R * 0.93, 0.1, 0, 1.9, 48)
pcyl('tip', lead, 0.1, 0.01, 1.9, 2.3, 32)
pen.location = (-6.0 * CM, -8.0 * CM, R * math.cos(math.pi / 6) * CM)
pen.rotation_euler = (0, 0, math.radians(32))

# the desk: a shadow catcher
bpy.ops.mesh.primitive_plane_add(size=3.0)
bpy.context.active_object.is_shadow_catcher = True

# ── the camera: low and close, a 60 mm lens at f/5 focused on the glass
cd = bpy.data.cameras.new('cam'); cd.lens = 60; cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 30
cd.dof.use_dof = True; cd.dof.aperture_fstop = 5.0
co = bpy.data.objects.new('cam', cd); sc.collection.objects.link(co); sc.camera = co
el, az, d = math.radians(26), math.radians(-10), 0.64
tgt = Vector((0.018, 0.02, 0.1))
co.location = tgt + Vector((d * math.cos(el) * math.sin(az), -d * math.cos(el) * math.cos(az), d * math.sin(el)))
co.rotation_euler = (tgt - co.location).to_track_quat('-Z', 'Y').to_euler()
cd.dof.focus_distance = (co.location - Vector((0, 0, 0.045))).length
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
