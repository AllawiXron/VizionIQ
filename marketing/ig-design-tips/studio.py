"""Props for the design-tips carousel (Blender 5, Cycles): a takeaway cup for the made-up roastery «سمرة», and a cafe
table by a window. Scene unit: 1 cm = 0.01.

  python studio.py <shot> [--preview]
    cup     the cup alone on transparent, soft light from the left        -> renders/cup.png
    cold    the same cup lit cold from the right, as a wrong cut-out      -> renders/cup-cold.png
    table   the table and wall in warm window light from the left         -> renders/table.jpg
    scene   the cup standing on that table, shot in the same light        -> renders/scene.jpg
"""
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
CM = 0.01
PREVIEW = "--preview" in sys.argv


def lin(hexstr):
    h = hexstr.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [1]


def reset(w, h, samples, transparent=False):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = 24 if PREVIEW else samples
    s.cycles.use_denoising = True
    s.render.resolution_x, s.render.resolution_y = w, h
    s.render.film_transparent = transparent
    s.view_settings.view_transform = "Standard"
    s.view_settings.look = "Medium High Contrast"
    world = bpy.data.worlds.new("w")
    s.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.0
    return s


def principled(name, color, rough=0.5, coat=0.0, spec=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(color)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Specular IOR Level"].default_value = spec
    return m


def textured(name, path, rough=0.6):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(path)
    img.interpolation = "Cubic"
    nt.links.new(img.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    return m


def noisy(name, color_a, color_b, scale, rough=0.7, bump=0.15, wave=False):
    """a procedural surface: plaster (noise) or wood (stretched waves)"""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = rough
    if wave:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (0.25, 6, 1)
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
        tx = nt.nodes.new("ShaderNodeTexWave")
        tx.inputs["Scale"].default_value = scale
        tx.inputs["Distortion"].default_value = 6
        tx.inputs["Detail"].default_value = 6
        nt.links.new(mp.outputs["Vector"], tx.inputs["Vector"])
        out = tx.outputs["Fac"]
    else:
        tx = nt.nodes.new("ShaderNodeTexNoise")
        tx.inputs["Scale"].default_value = scale
        tx.inputs["Detail"].default_value = 10
        out = tx.outputs["Fac"]
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = lin(color_a)
    ramp.color_ramp.elements[1].color = lin(color_b)
    nt.links.new(out, ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = bump
    nt.links.new(out, bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def lathe(name, prof, mat, seg=128, uv=None):
    """revolve [(r, z) cm] around Z; uv=(z0, z1) maps v across that height band, u around with the front (-Y) at 0.5"""
    rows = len(prof)
    verts, faces = [], []
    for j in range(seg + 1):
        a = -math.pi / 2 - (j / seg - 0.5) * 2 * math.pi
        for r, z in prof:
            verts.append((r * math.cos(a) * CM, r * math.sin(a) * CM, z * CM))
    for j in range(seg):
        for i in range(rows - 1):
            a, b = j * rows + i, (j + 1) * rows + i
            faces.append((a, a + 1, b + 1, b))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate()
    if uv:
        uvl = me.uv_layers.new(name="UVMap")
        for poly in me.polygons:
            for li in poly.loop_indices:
                j, i = divmod(me.loops[li].vertex_index, rows)
                uvl.data[li].uv = (1 - j / seg, (prof[i][1] - uv[0]) / (uv[1] - uv[0]))
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(mat)
    return ob


def cone_r(z, r0=2.75, r1=4.0, h=11.6):
    return r0 + (r1 - r0) * z / h


def cup(x=0.0, y=0.0, turn=0.0):
    """a 12 oz paper cup with a sleeve and a lid, standing at (x, y) cm"""
    H = 11.6
    paper = noisy("paper", "#ebe4d8", "#f6f1e8", 300, rough=0.6, bump=0.03)
    wall = [(0, 0.0), (2.6, 0.0), (2.72, 0.12)] + [(cone_r(z), z) for z in [0.4 + k * (H - 0.4) / 30 for k in range(31)]]
    wall += [(cone_r(H) + 0.12, H + 0.05), (cone_r(H) + 0.14, H + 0.2)]
    parts = [lathe("cup", wall, paper)]
    z0, z1 = 3.2, 8.2
    band = [(cone_r(z) + 0.09, z) for z in [z0 + k * (z1 - z0) / 20 for k in range(21)]]
    band = [(cone_r(z0) + 0.02, z0 - 0.04)] + band + [(cone_r(z1) + 0.02, z1 + 0.04)]
    parts.append(lathe("sleeve", band, textured("sleeve", os.path.join(HERE, "tex", "sleeve.png"), 0.7), uv=(z0, z1)))
    lid_m = principled("lid", "#3a2a20", 0.32, coat=0.3)
    R = cone_r(H) + 0.25
    lid = [(R - 0.1, H - 0.25), (R + 0.05, H - 0.1), (R + 0.12, H + 0.35), (R - 0.05, H + 0.6), (R - 0.5, H + 0.62),
           (R - 0.75, H + 1.25), (R - 0.95, H + 1.35), (1.2, H + 1.38), (0.0, H + 1.38)]
    parts.append(lathe("lid", lid, lid_m))
    for ob in parts:
        ob.location = (x * CM, y * CM, 0)
        ob.rotation_euler = (0, 0, turn)
    return parts


def area(name, loc, target, size, power, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, "AREA")
    d.size = size
    d.energy = power
    d.color = color
    o = bpy.data.objects.new(name, d)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return o


def sun(rot, power, color, angle=1.5):
    d = bpy.data.lights.new("sun", "SUN")
    d.energy = power
    d.color = color
    d.angle = math.radians(angle)
    o = bpy.data.objects.new("sun", d)
    bpy.context.collection.objects.link(o)
    o.rotation_euler = [math.radians(a) for a in rot]
    return o


def camera(loc, target, lens):
    c = bpy.data.cameras.new("cam")
    c.lens = lens
    o = bpy.data.objects.new("cam", c)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = o


def plane(name, size, loc, rot, mat):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (size[0], size[1], 1)
    ob.data.materials.append(mat)
    return ob


def window_frame(x_wall):
    """a wall with a four-pane window, off camera to the left, so the sun throws the panes onto the back wall"""
    dark = principled("frame", "#222222", 0.9)
    ops = []
    W, H, z0 = 0.5, 0.7, 0.0   # the opening, metres, its bottom edge
    t = 0.04
    def blk(cx, cy, cz, sx, sy, sz):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(cx, cy, cz))
        o = bpy.context.active_object
        o.scale = (sx, sy, sz)
        o.data.materials.append(dark)
        ops.append(o)
    y0 = -0.22
    blk(x_wall, y0, z0 - 1, 0.02, 4, 2)                    # below
    blk(x_wall, y0, z0 + H + 1, 0.02, 4, 2)                # above
    blk(x_wall, y0 - W / 2 - 1, z0 + H / 2, 0.02, 2, H)    # front side
    blk(x_wall, y0 + W / 2 + 1, z0 + H / 2, 0.02, 2, H)    # back side
    blk(x_wall, y0, z0 + H / 2, 0.02, t, H)                # mullion
    blk(x_wall, y0, z0 + H / 2, 0.02, W, t)                # transom
    for o in ops:
        o.visible_camera = False
    return ops


def table_set(with_cup):
    wood = noisy("wood", "#4a2c1a", "#7a4a2a", 7.0, rough=0.5, bump=0.04, wave=True)
    plaster = noisy("plaster", "#d9c7ab", "#efe2cc", 40, rough=0.9, bump=0.25)
    plane("table", (1.6, 0.9), (0, 0.1, 0), (0, 0, 0), wood)
    plane("wall", (1.6, 1.2), (0, 0.32, 0.6), (math.radians(90), 0, 0), plaster)
    window_frame(-0.75)
    sun((62, 0, -64), 5.5, (1, 0.82, 0.6))
    area("sky", (0.3, -0.6, 0.5), (0, 0.1, 0.05), 1.2, 9, (0.85, 0.9, 1))
    if with_cup:
        cup(0, 0, math.radians(-8))
    camera((0, -0.62, 0.2), (0, 0.06, 0.075), 70)


def cup_alone(cold):
    cup(0, 0, math.radians(-8))
    if cold:   # hard, blue-white light from the right, nothing like the table's sun
        area("key", (0.45, -0.25, 0.3), (0, 0, 0.06), 0.15, 30, (0.82, 0.9, 1))
        area("fill", (-0.5, -0.4, 0.15), (0, 0, 0.06), 1.2, 3, (0.85, 0.9, 1))
    else:      # soft warm key from the left, a little fill from the right
        area("key", (-0.5, -0.3, 0.35), (0, 0, 0.06), 0.8, 32, (1, 0.9, 0.78))
        area("fill", (0.5, -0.45, 0.15), (0, 0, 0.06), 1.2, 6, (1, 0.97, 0.94))
        area("rim", (0.25, 0.4, 0.35), (0, 0, 0.08), 0.6, 10)
    camera((0, -0.62, 0.2), (0, 0.0, 0.066), 120)


SHOTS = {
    "cup": dict(size=(900, 1100), transparent=True, build=lambda: cup_alone(False), out="cup.png"),
    "cold": dict(size=(900, 1100), transparent=True, build=lambda: cup_alone(True), out="cup-cold.png"),
    "table": dict(size=(1200, 1200), transparent=False, build=lambda: table_set(False), out="table.jpg"),
    "scene": dict(size=(1200, 1200), transparent=False, build=lambda: table_set(True), out="scene.jpg"),
}

if __name__ == "__main__":
    shot = SHOTS[[a for a in sys.argv[1:] if not a.startswith("--")][0]]
    s = reset(*shot["size"], samples=128, transparent=shot["transparent"])
    shot["build"]()
    out = os.path.join(HERE, "renders", shot["out"])
    s.render.image_settings.file_format = "PNG" if out.endswith(".png") else "JPEG"
    if out.endswith(".png"):
        s.render.image_settings.color_mode = "RGBA"
    else:
        s.render.image_settings.quality = 94
    s.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print("wrote", out)
