"""Miswag White Friday, concept 1: silver coins («قرشك الأبيض») falling out of the dark into the light.

Each coin is a bevelled cylinder in polished silver. The face (coin_height.png, from coin_face.html) is a bump map:
polished field, slightly frosted relief; the edge is reeded. One hero coin is in focus; the others fall at other
depths, so the lens blurs them, and all of them carry real motion blur from their fall. Rendered as the full 4:5
frame on a transparent background; ads.html puts the dark-to-light ground under it.

Usage: bvenv/bin/python coin.py <out.png> [percent] [samples]
"""
import math
import os
import sys

import bpy  # must come before mathutils when Blender runs as a Python module
from mathutils import Euler, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
PCT = int(sys.argv[2]) if len(sys.argv) > 2 else 100
SAMPLES = int(sys.argv[3]) if len(sys.argv) > 3 else 160

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 8
sc.render.film_transparent = True
sc.render.resolution_x, sc.render.resolution_y = 1620, 2025
sc.render.resolution_percentage = PCT
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"
sc.view_settings.view_transform = "AgX"
try:
    sc.view_settings.look = "AgX - Medium High Contrast"
except TypeError:
    pass

# ---------- coin ----------
R, T = 1.0, 0.13
bpy.ops.mesh.primitive_cylinder_add(vertices=256, radius=R, depth=T)
coin = bpy.context.active_object
coin.name = "coin"
bev = coin.modifiers.new("bevel", "BEVEL")
bev.width, bev.segments, bev.limit_method = 0.028, 6, "ANGLE"
bpy.ops.object.shade_smooth()
coin.data.shade_smooth()
try:
    bpy.ops.object.shade_auto_smooth(angle=math.radians(40))
except Exception:
    pass
coin.rotation_euler = Euler((math.radians(62), math.radians(-14), math.radians(-24)))
coin.location, coin.scale = Vector((0.08, 0, 1.12)), (0.62, 0.62, 0.62)

m = bpy.data.materials.new("silver")
m.use_nodes = True
nt = m.node_tree
N, L = nt.nodes, nt.links
for n in list(N):
    N.remove(n)
out = N.new("ShaderNodeOutputMaterial")
bsdf = N.new("ShaderNodeBsdfPrincipled")
bsdf.inputs["Base Color"].default_value = (0.86, 0.87, 0.89, 1)
bsdf.inputs["Metallic"].default_value = 1.0
L.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

tc = N.new("ShaderNodeTexCoord")
geo = N.new("ShaderNodeNewGeometry")
# face: the height map across the top (generated coords are 0..1 over the bounding box, so the disc fills the image)
img = N.new("ShaderNodeTexImage")
img.image = bpy.data.images.load(os.path.join(HERE, "coin_height.png"))
img.image.colorspace_settings.name = "Non-Color"
img.extension = "CLIP"
L.new(tc.outputs["Generated"], img.inputs["Vector"])
# which faces: top/bottom vs edge, from the object-space normal
sep_n = N.new("ShaderNodeSeparateXYZ")
vt = N.new("ShaderNodeVectorTransform")
vt.vector_type, vt.convert_from, vt.convert_to = "NORMAL", "WORLD", "OBJECT"
L.new(geo.outputs["Normal"], vt.inputs["Vector"])
L.new(vt.outputs["Vector"], sep_n.inputs["Vector"])
absz = N.new("ShaderNodeMath")
absz.operation = "ABSOLUTE"
L.new(sep_n.outputs["Z"], absz.inputs[0])
face = N.new("ShaderNodeMath")
face.operation = "GREATER_THAN"
face.inputs[1].default_value = 0.9
L.new(absz.outputs[0], face.inputs[0])
# edge: reeding, a fine sine round the circumference
sep_p = N.new("ShaderNodeSeparateXYZ")
L.new(tc.outputs["Object"], sep_p.inputs["Vector"])
ang = N.new("ShaderNodeMath")
ang.operation = "ARCTAN2"
L.new(sep_p.outputs["Y"], ang.inputs[0])
L.new(sep_p.outputs["X"], ang.inputs[1])
mul = N.new("ShaderNodeMath")
mul.operation = "MULTIPLY"
mul.inputs[1].default_value = 140
L.new(ang.outputs[0], mul.inputs[0])
sin = N.new("ShaderNodeMath")
sin.operation = "SINE"
L.new(mul.outputs[0], sin.inputs[0])
# height = face ? map : reeding
hmix = N.new("ShaderNodeMix")
hmix.data_type = "FLOAT"
L.new(face.outputs[0], hmix.inputs["Factor"])
L.new(sin.outputs[0], hmix.inputs["A"])
L.new(img.outputs["Color"], hmix.inputs["B"])
bump = N.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 1.0
bump.inputs["Distance"].default_value = 0.022
L.new(hmix.outputs["Result"], bump.inputs["Height"])
L.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
# polished field, frosted relief
rmap = N.new("ShaderNodeMapRange")
rmap.inputs["To Min"].default_value = 0.12
rmap.inputs["To Max"].default_value = 0.34
L.new(img.outputs["Color"], rmap.inputs["Value"])
rmix = N.new("ShaderNodeMix")
rmix.data_type = "FLOAT"
rmix.inputs["A"].default_value = 0.22
L.new(face.outputs[0], rmix.inputs["Factor"])
L.new(rmap.outputs["Result"], rmix.inputs["B"])
L.new(rmix.outputs["Result"], bsdf.inputs["Roughness"])
coin.data.materials.append(m)

# the others: same coin, other depths and angles (x across, y away from the camera, z up)
OTHERS = [((-0.95, 2.2, 1.98), (40, 30, 70), 0.42), ((1.05, 1.3, 1.72), (75, -35, 10), 0.46),
          ((0.3, 3.8, 2.2), (20, 60, -40), 0.36), ((1.22, -2.6, 1.58), (55, 10, 120), 0.34),
          ((-1.08, 0.8, 1.3), (85, 20, -60), 0.3)]
coins = [coin]
for i, (loc, rot, s) in enumerate(OTHERS):
    c = coin.copy()
    c.name = f"coin{i + 2}"
    sc.collection.objects.link(c)
    c.location, c.scale = Vector(loc), (s, s, s)
    c.rotation_euler = Euler(tuple(math.radians(a) for a in rot))
    coins.append(c)
# the fall: keyframe one step down and a little spin either side of the rendered frame, for motion blur
sc.frame_set(1)
for i, c in enumerate(coins):
    drop, spin = (0.025, math.radians(0.5)) if i == 0 else (0.11, math.radians(5))  # the hero stays crisp
    base_loc, base_rot = c.location.copy(), c.rotation_euler.copy()
    for f, k in ((0, -1), (1, 0), (2, 1)):
        c.location = base_loc - Vector((0, 0, drop * k))
        c.rotation_euler = Euler((base_rot.x + spin * k, base_rot.y, base_rot.z))
        c.keyframe_insert("location", frame=f)
        c.keyframe_insert("rotation_euler", frame=f)
sc.render.use_motion_blur = True
sc.render.motion_blur_shutter = 0.5
sc.frame_set(1)

# ---------- studio: soft boxes for the metal to reflect, a dark-to-light world ----------
w = bpy.data.worlds.new("w")
sc.world = w
w.use_nodes = True
wn = w.node_tree.nodes
bg = wn["Background"]
grad_tc = wn.new("ShaderNodeTexCoord")
sepw = wn.new("ShaderNodeSeparateXYZ")
ramp = wn.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position, ramp.color_ramp.elements[0].color = 0.5, (0.008, 0.008, 0.01, 1)
ramp.color_ramp.elements[1].position, ramp.color_ramp.elements[1].color = 0.95, (0.55, 0.55, 0.58, 1)
mid = ramp.color_ramp.elements.new(0.62)
mid.color = (0.05, 0.05, 0.055, 1)
mr = wn.new("ShaderNodeMapRange")
mr.inputs["From Min"].default_value, mr.inputs["From Max"].default_value = -1, 1
w.node_tree.links.new(grad_tc.outputs["Generated"], sepw.inputs["Vector"])
w.node_tree.links.new(sepw.outputs["Z"], mr.inputs["Value"])
w.node_tree.links.new(mr.outputs["Result"], ramp.inputs["Fac"])
w.node_tree.links.new(ramp.outputs["Color"], bg.inputs["Color"])
bg.inputs["Strength"].default_value = 1.0


def softbox(name, loc, size, power, rot):
    d = bpy.data.lights.new(name, "AREA")
    d.shape, d.size, d.size_y, d.energy = "RECTANGLE", size[0], size[1], power
    o = bpy.data.objects.new(name, d)
    o.location = loc
    o.rotation_euler = rot
    sc.collection.objects.link(o)
    return o


def aim(o, target=Vector((0, 0, 0))):
    o.rotation_euler = (target - o.location).to_track_quat("-Z", "Y").to_euler()


for name, loc, size, power in [("key", (-3.2, -3.0, 4.2), (3.0, 0.9), 1100), ("rim", (3.4, 2.6, 2.4), (0.8, 3.0), 800),
                               ("fill", (2.8, -3.6, -0.6), (1.6, 1.6), 160), ("top", (0.4, 0.2, 5.0), (4.0, 0.5), 520)]:
    aim(softbox(name, Vector(loc), size, power, (0, 0, 0)))

# ---------- camera: focused on the hero coin ----------
cd = bpy.data.cameras.new("cam")
cd.lens = 85
cd.sensor_fit = "VERTICAL"
cd.sensor_height = 36
cd.dof.use_dof = True
cd.dof.focus_object = coin
cd.dof.aperture_fstop = 1.6
cam = bpy.data.objects.new("cam", cd)
cam.location = Vector((0, -9.2, 1.0))
aim(cam, Vector((0, 0, 1.0)))
sc.collection.objects.link(cam)
sc.camera = cam

sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("wrote", OUT)
