# An Iraqi استكان of tea on its saucer with two sugar cubes, for the Friday post. Rendered in Cycles at a three-quarter
# view onto a shadow catcher (the PNG carries the glass and its shadow on transparency), lit by the CC0 «Studio Small 09»
# HDRI plus a soft key from the top left, like the desk props of ../hf-one-second-reel.
#   blender -b -P tea.py -- OUT.png [HDRI]
import bpy, bmesh, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
OUT, HDRI = argv[0], (argv[1] if len(argv) > 1 else None)
CM = 0.01


def srgb(h):
    h = h.lstrip('#')
    return tuple(((c / 255 + 0.055) / 1.055) ** 2.4 if c / 255 > 0.04045 else c / 255 / 12.92 for c in (int(h[i:i + 2], 16) for i in (0, 2, 4))) + (1.0,)


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = int(os.environ.get('SAMPLES', 160))
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 16
sc.cycles.transmission_bounces = 16
sc.cycles.caustics_refractive = True
sc.render.film_transparent = True
sc.view_settings.view_transform = 'AgX'
sc.render.resolution_x = sc.render.resolution_y = 1400
sc.render.image_settings.color_mode = 'RGBA'
w = bpy.data.worlds.new('w'); w.use_nodes = True; sc.world = w
nt = w.node_tree
if HDRI:
    env = nt.nodes.new('ShaderNodeTexEnvironment'); env.image = bpy.data.images.load(HDRI)
    nt.links.new(env.outputs['Color'], nt.nodes['Background'].inputs['Color'])
    nt.nodes['Background'].inputs['Strength'].default_value = 0.7
else:
    nt.nodes['Background'].inputs['Color'].default_value = (0.5, 0.45, 0.4, 1)
ld = bpy.data.lights.new('key', 'AREA'); ld.size = 0.25; ld.energy = 60
lo = bpy.data.objects.new('key', ld); sc.collection.objects.link(lo)
lo.location = (-0.18, 0.32, 0.42)
lo.rotation_euler = (Vector((0, 0, 0.03)) - lo.location).to_track_quat('-Z', 'Y').to_euler()


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


def lathe(name, prof, m, segs=128):
    """A solid of revolution from a closed (r, z) profile in cm."""
    bm = bmesh.new()
    vs = [bm.verts.new((r * CM, 0, z * CM)) for r, z in prof]
    es = [bm.edges.new((vs[i], vs[(i + 1) % len(vs)])) for i in range(len(vs))]
    bmesh.ops.spin(bm, geom=vs + es, cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=segs, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); me.shade_smooth()
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); me.materials.append(m)
    return ob


def curve(z, r0, r1, n, z0, z1):
    return [(r0 + (r1 - r0) * (0.5 - 0.5 * math.cos(math.pi * i / n)), z0 + (z1 - z0) * i / n) for i in range(n + 1)]


# the glass: a thick base, a waist, a flared lip (outer up, inner down)
def r_out(z):   # outer radius at height z (cm)
    if z < 3.4:
        return 2.15 - 0.45 * math.sin(z / 3.4 * math.pi / 2)
    return 1.70 + 0.95 * ((z - 3.4) / 5.2) ** 1.5
H = 8.6
outer = [(0, 0), (2.0, 0), (2.15, 0.12)] + [(r_out(z), z) for z in [0.3 + i * (H - 0.3) / 40 for i in range(41)]]
inner = [(r_out(z) - 0.11, z) for z in [H - i * (H - 0.75) / 40 for i in range(41)]] + [(0, 0.75)]
glass = mat('glass', '#ffffff', rough=0.02, trans=1.0, ior=1.5)
lathe('glass', outer + inner, glass)
# the tea, nearly to the lip, deep amber
tz = 7.7
tea_prof = [(0, 0.74)] + [(r_out(z) - 0.10, z) for z in [0.77 + i * (tz - 0.77) / 30 for i in range(31)]] + [(0, tz)]
tea = mat('tea', '#8a2f08', rough=0.03, trans=1.0, ior=1.34)
vol = tea.node_tree.nodes.new('ShaderNodeVolumeAbsorption')
vol.inputs['Color'].default_value = srgb('#b34a0c'); vol.inputs['Density'].default_value = 140
tea.node_tree.links.new(vol.outputs[0], tea.node_tree.nodes['Material Output'].inputs['Volume'])
lathe('tea', tea_prof, tea)
# a gold line on the lip
gold = mat('gold', '#e0b046', rough=0.18, metal=1.0)
bpy.ops.mesh.primitive_torus_add(major_radius=r_out(H) * CM - 0.0005, minor_radius=0.0007, location=(0, 0, (H - 0.05) * CM), major_segments=128, minor_segments=12)
bpy.context.active_object.data.materials.append(gold)
# the saucer: white porcelain with a gold rim, the glass sitting in its well
porc = mat('porc', '#f6f2ea', rough=0.12, sss=0.05, coat=0.4)
sau = [(0, -0.5), (3.0, -0.5), (3.2, -0.42), (3.4, -0.2), (6.2, 0.25), (6.6, 0.45), (6.55, 0.6), (6.1, 0.48), (3.35, 0.05), (3.1, -0.15), (0, -0.15)]
lathe('saucer', sau, porc)
bpy.ops.mesh.primitive_torus_add(major_radius=6.55 * CM, minor_radius=0.0009, location=(0, 0, 0.55 * CM), major_segments=160, minor_segments=12)
bpy.context.active_object.data.materials.append(gold)
# lift everything so the saucer foot sits on the desk
for o in sc.objects:
    if o.type == 'MESH':
        o.location.z += 0.5 * CM
# two sugar cubes on the saucer
sugar = mat('sugar', '#fbfaf6', rough=0.85, sss=0.3)
nz = sugar.node_tree.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 900
bp = sugar.node_tree.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.6
sugar.node_tree.links.new(nz.outputs['Fac'], bp.inputs['Height']); sugar.node_tree.links.new(bp.outputs['Normal'], sugar.node_tree.nodes['Principled BSDF'].inputs['Normal'])
for (x, y, rz) in ((4.4, -1.6, 20), (4.9, 0.3, -12)):
    bpy.ops.mesh.primitive_cube_add(size=1.25 * CM, location=(x * CM, y * CM, 1.35 * CM), rotation=(0, 0, math.radians(rz)))
    c = bpy.context.active_object; c.data.materials.append(sugar)
    b = c.modifiers.new('bv', 'BEVEL'); b.width = 0.0012; b.segments = 3
# the desk under it: a shadow catcher
bpy.ops.mesh.primitive_plane_add(size=1.0)
bpy.context.active_object.is_shadow_catcher = True
# camera: three-quarter view from the front, a little from the right
cd = bpy.data.cameras.new('cam'); cd.lens = 85
co = bpy.data.objects.new('cam', cd); sc.collection.objects.link(co); sc.camera = co
el, az, d = math.radians(38), math.radians(-12), 0.64
co.location = (d * math.cos(el) * math.sin(az), -d * math.cos(el) * math.cos(az), d * math.sin(el))
co.rotation_euler = (Vector((0, 0, 0.035)) - co.location).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
