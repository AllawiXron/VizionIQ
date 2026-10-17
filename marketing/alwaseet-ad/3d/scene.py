"""Al-Waseet ad — hero render. A Nimrud relief on a royal-blue museum wall; the genie's carved bucket is
replaced by a 3D Waseet parcel hanging from his fist on a blue strap.

Usage: bvenv/bin/python scene.py <out_prefix> [percent] [samples]
Writes <out_prefix>_A.png (with parcel), <out_prefix>_B.png (without), <out_prefix>.json (projected points).
"""
import json
import math
import os
import sys

import bpy  # must come before bmesh / mathutils when Blender runs as a Python module
import bmesh
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Euler, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
PCT = int(sys.argv[2]) if len(sys.argv) > 2 else 100
SAMPLES = int(sys.argv[3]) if len(sys.argv) > 3 else 128

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 6
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1620, 2025, PCT
sc.render.image_settings.file_format = "PNG"
sc.view_settings.view_transform = "AgX"
try:
    sc.view_settings.look = "AgX - Medium High Contrast"
except TypeError:
    pass
sc.view_settings.exposure = float(os.environ.get("EXPOSURE", "0"))

# ---------- relief geometry (texture px -> world metres) ----------
IMW, IMH = 3013, 3815
HS = 2.3
S = HS / IMH
WS = IMW * S
SLAB_Y = -0.12  # front face of the slab; the wall is at y = 0


def tex2world(px, py, y=SLAB_Y):
    return Vector(((px - IMW / 2) * S, y, (IMH / 2 - py) * S))


# ---------- camera ----------
cam_data = bpy.data.cameras.new("cam")
cam_data.sensor_fit = "VERTICAL"
cam_data.sensor_height = 36
cam_data.lens = 85
FRAME_H = 3.6
FRAME_CZ = 0.15
D = (FRAME_H / 2) / math.tan(math.atan(18 / 85))
CAM = Vector((-0.30, SLAB_Y - D, 0.95))
cam = bpy.data.objects.new("cam", cam_data)
cam.location = CAM
cam.rotation_euler = Euler((math.radians(90), 0, 0))
cam_data.shift_x = (0.0 - CAM.x) / FRAME_H
cam_data.shift_y = (FRAME_CZ - CAM.z) / FRAME_H
sc.collection.objects.link(cam)
sc.camera = cam


def on_ray(px, py, y):
    """World point at depth y that the camera sees exactly where texture pixel (px, py) is."""
    q = tex2world(px, py)
    t = (y - CAM.y) / (q.y - CAM.y)
    return CAM + (q - CAM) * t


# ---------- materials ----------
def img(path, colorspace="sRGB"):
    im = bpy.data.images.load(path)
    im.colorspace_settings.name = colorspace
    return im


def mat_principled(name, color=None, rough=0.6, image=None, alpha=False, bump=0.0, glossy_blue=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = rough
    if color:
        bsdf.inputs["Base Color"].default_value = (*color, 1)
    if image:
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = image
        tex.interpolation = "Cubic"
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
        if alpha:
            nt.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
        if bump:
            bn = nt.nodes.new("ShaderNodeBump")
            bn.inputs["Strength"].default_value = bump
            bn.inputs["Distance"].default_value = 0.004
            nt.links.new(tex.outputs["Color"], bn.inputs["Height"])
            nt.links.new(bn.outputs["Normal"], bsdf.inputs["Normal"])
        if glossy_blue:  # tape is glossier than the cardboard
            sep = nt.nodes.new("ShaderNodeSeparateColor")
            nt.links.new(tex.outputs["Color"], sep.inputs["Color"])
            sub = nt.nodes.new("ShaderNodeMath")
            sub.operation = "SUBTRACT"
            nt.links.new(sep.outputs["Blue"], sub.inputs[0])
            nt.links.new(sep.outputs["Red"], sub.inputs[1])
            mr = nt.nodes.new("ShaderNodeMapRange")
            mr.inputs["From Min"].default_value, mr.inputs["From Max"].default_value = 0.15, 0.4
            mr.inputs["To Min"].default_value, mr.inputs["To Max"].default_value = rough, 0.28
            nt.links.new(sub.outputs["Value"], mr.inputs["Value"])
            nt.links.new(mr.outputs["Result"], bsdf.inputs["Roughness"])
    return m


def quad(name, verts, uv=((0, 0), (1, 0), (1, 1), (0, 1)), mat=None):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    vs = [bm.verts.new(v) for v in verts]
    f = bm.faces.new(vs)
    lay = bm.loops.layers.uv.new()
    for loop, t in zip(f.loops, uv):
        loop[lay].uv = t
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    if mat:
        ob.data.materials.append(mat)
    sc.collection.objects.link(ob)
    return ob


# wall (royal blue, Al-Waseet's stage colour)
BLUE = (0.010, 0.034, 0.39)
wall = quad("wall", [(-8, 0, -6), (8, 0, -6), (8, 0, 8), (-8, 0, 8)], mat=mat_principled("wall", BLUE, 0.85))
wall.data.polygons[0].use_smooth = False
# make sure the wall faces the camera
wall.data.flip_normals() if wall.data.polygons[0].normal.y > 0 else None

# relief slab: alpha-cut photo plane + a few darker layers behind it for thickness
relief_img = img(os.path.join(HERE, "relief_tex.png"))
slab_mat = mat_principled("relief", rough=0.85, image=relief_img, alpha=True, bump=0.25)
w, h = WS / 2, HS / 2
quad("relief", [(-w, SLAB_Y, -h), (w, SLAB_Y, -h), (w, SLAB_Y, h), (-w, SLAB_Y, h)], mat=slab_mat)
# stone body behind the photo plane so the slab has real thickness (kept inside the straight left/top/bottom
# edges and the innermost point of the broken right edge, so it never shows through the cut-out)
stone = bpy.data.materials.new("stone")
stone.use_nodes = True
sn = stone.node_tree.nodes
sb = sn["Principled BSDF"]
sb.inputs["Roughness"].default_value = 0.92
noise = sn.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value = 60
ramp = sn.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = (0.36, 0.30, 0.24, 1)
ramp.color_ramp.elements[1].color = (0.52, 0.45, 0.37, 1)
stone.node_tree.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
stone.node_tree.links.new(ramp.outputs["Color"], sb.inputs["Base Color"])
bpy.ops.mesh.primitive_cube_add()
body = bpy.context.active_object
x0, x1 = tex2world(178, 0).x, tex2world(2560, 0).x
z0, z1 = tex2world(0, 3590).z, tex2world(0, 205).z
body.scale = ((x1 - x0) / 2, (abs(SLAB_Y) - 0.004) / 2, (z1 - z0) / 2)
body.location = ((x0 + x1) / 2, (SLAB_Y + 0.004) / 2, (z0 + z1) / 2)
body.data.materials.append(stone)

# ---------- the parcel ----------
BW, BH, BD = 0.54, 0.46, 0.42
YAW = math.radians(25)
faces = {
    "front": ([(-1, -1, -1), (1, -1, -1), (1, -1, 1), (-1, -1, 1)], "front.png"),
    "back": ([(1, 1, -1), (-1, 1, -1), (-1, 1, 1), (1, 1, 1)], "back.png"),
    "left": ([(-1, 1, -1), (-1, -1, -1), (-1, -1, 1), (-1, 1, 1)], "side.png"),
    "right": ([(1, -1, -1), (1, 1, -1), (1, 1, 1), (1, -1, 1)], "plain.png"),
    "top": ([(-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)], "top.png"),
    "bottom": ([(-1, 1, -1), (1, 1, -1), (1, -1, -1), (-1, -1, -1)], "plain.png"),
}
me = bpy.data.meshes.new("parcel")
bm = bmesh.new()
lay = bm.loops.layers.uv.new()
vcache = {}
box = bpy.data.objects.new("parcel", me)
for i, (fname, (corners, tex)) in enumerate(faces.items()):
    vs = []
    for c in corners:
        key = c
        if key not in vcache:
            vcache[key] = bm.verts.new((c[0] * BW / 2, c[1] * BD / 2, c[2] * BH / 2))
        vs.append(vcache[key])
    f = bm.faces.new(vs)
    f.material_index = i
    for loop, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        loop[lay].uv = t
    me.materials.append(mat_principled(f"box_{fname}", rough=0.62, image=img(os.path.join(HERE, tex)), bump=0.02, glossy_blue=True))
bm.normal_update()
bm.to_mesh(me)
bm.free()
bev = box.modifiers.new("bevel", "BEVEL")
bev.width, bev.segments, bev.limit_method = 0.007, 3, "ANGLE"
sc.collection.objects.link(box)

# place it: the midpoint of the two handle anchors lands where the carved bucket handle met the rim
YC = SLAB_Y - 0.03 - 0.5 * (BW * math.sin(YAW) + BD * math.cos(YAW))
mid = on_ray(790, 3100, YC)
box.rotation_euler = Euler((0, 0, YAW))
box.location = mid - Vector((0, 0, BH / 2))
bpy.context.view_layer.update()
mw = box.matrix_world
anchor_l = mw @ Vector((-0.127, 0, BH / 2 + 0.002))
anchor_r = mw @ Vector((0.127, 0, BH / 2 + 0.002))

# ---------- the strap: a flat blue band from the parcel's tabs up into the genie's fist ----------
fy = SLAB_Y - 0.012
path = [anchor_l]
for px, py, blend in [(612, 3020, 0.45), (660, 2935, 0.8), (712, 2880, 1.0), (812, 2862, 1.0), (912, 2880, 1.0), (962, 2935, 0.8), (1000, 3020, 0.45)]:
    y = YC + (fy - YC) * blend
    path.append(on_ray(px, py, y))
path.append(anchor_r)


def catmull(pts, n=10):
    out = []
    P = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for s in range(n):
            t = s / n
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(pts[-1])
    return out


pts = catmull(path, 14)
SW = 0.036
sm = bpy.data.meshes.new("strap")
bm = bmesh.new()
rows = []
for i, p in enumerate(pts):
    tan = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
    view = (CAM - p).normalized()
    side = tan.cross(view).normalized() * (SW / 2)
    rows.append((bm.verts.new(p - side), bm.verts.new(p + side)))
for a, b in zip(rows, rows[1:]):
    bm.faces.new((a[0], b[0], b[1], a[1]))
bm.to_mesh(sm)
bm.free()
strap = bpy.data.objects.new("strap", sm)
sol = strap.modifiers.new("solid", "SOLIDIFY")
sol.thickness = 0.003
strap.data.materials.append(mat_principled("strap", (0.017, 0.045, 0.40), 0.32))
sc.collection.objects.link(strap)

# ---------- lights ----------
def light(name, kind, loc, target, energy, color=(1, 1, 1), size=None, spot=None, blend=None):
    ld = bpy.data.lights.new(name, kind)
    ld.energy = energy
    ld.color = color
    if size is not None:
        if kind == "AREA":
            ld.size = size
        else:
            ld.shadow_soft_size = size
    if spot is not None:
        ld.spot_size = math.radians(spot)
        ld.spot_blend = blend
    ob = bpy.data.objects.new(name, ld)
    ob.location = Vector(loc)
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    sc.collection.objects.link(ob)
    return ob


K = float(os.environ.get("KEY", "1"))
light("key", "SPOT", (-2.4, -4.6, 3.8), (-0.25, SLAB_Y, -0.15), 1500 * K, (1.0, 0.93, 0.84), size=0.45, spot=40, blend=0.8)
light("halo", "SPOT", (0.0, -2.2, 3.6), (0.0, 0.0, 1.75), 650 * K, (0.80, 0.86, 1.0), size=0.8, spot=48, blend=1.0)
light("fill", "AREA", (3.0, -5.5, 0.6), (0.0, SLAB_Y, 0.0), 110 * K, (0.70, 0.78, 1.0), size=3.0)
light("parcel_rim", "AREA", (1.6, -1.6, 0.4), (-0.45, -0.4, -0.9), 45 * K, (1.0, 1.0, 1.0), size=0.8)

world = bpy.data.worlds.new("world")
sc.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.004, 0.012, 0.09, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.55

# ---------- projected points for compositing ----------
rx, ry = sc.render.resolution_x * PCT / 100, sc.render.resolution_y * PCT / 100


def to_px(v):
    c = world_to_camera_view(sc, cam, v)
    return [round(c.x * rx, 1), round((1 - c.y) * ry, 1)]


fist = [(676, 2846), (700, 2812), (760, 2800), (850, 2800), (930, 2826), (948, 2868), (934, 2910), (850, 2922), (760, 2922), (688, 2905), (668, 2875)]
info = {
    "fist": [to_px(tex2world(*p)) for p in fist],
    "slab": [to_px(tex2world(0, 0)), to_px(tex2world(IMW, IMH))],
    "box": [to_px(mw @ Vector((x * BW / 2, y * BD / 2, z * BH / 2))) for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)],
    "anchors": [to_px(anchor_l), to_px(anchor_r)],
    "size": [rx, ry],
}
json.dump(info, open(OUT + ".json", "w"), indent=1)

sc.render.filepath = OUT + "_A.png"
bpy.ops.render.render(write_still=True)
if os.environ.get("ONLY_A") != "1":
    box.hide_render = True
    strap.hide_render = True
    sc.render.filepath = OUT + "_B.png"
    bpy.ops.render.render(write_still=True)
print("done", json.dumps(info))
