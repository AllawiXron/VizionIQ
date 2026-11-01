# One shot of the ad reel as a product photograph: a wooden counter against an orange plaster wall, my cut-outs
# standing on it as cards lit by the scene (so they take real light and throw real shadows), and the key words as
# painted 3D letters mounted on the wall. Run: blender -b -P scene.py -- <shot> <out.png> [samples]
import bpy, math, os, sys
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
SET = os.path.join(HERE, "media/set")
EL = os.path.join(HERE, "../rm-allawi-ad-reel/public/el")
TYPE = os.path.join(HERE, "type")

ORANGE = (0.74, 0.21, 0.05)
CREAM = (0.925, 0.89, 0.83)
BROWN = (0.2, 0.085, 0.045)


def lin(c):
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1,)


def tex_material(name, prefix, tint=None, scale=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    coord = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (scale, scale, scale)
    nt.links.new(coord.outputs["UV"], mapping.inputs["Vector"])

    def img(kind, colour):
        t = nt.nodes.new("ShaderNodeTexImage")
        t.image = bpy.data.images.load(os.path.join(SET, f"{prefix}_{kind}_2k.jpg"))
        if not colour:
            t.image.colorspace_settings.name = "Non-Color"
        nt.links.new(mapping.outputs["Vector"], t.inputs["Vector"])
        return t

    diff = img("diff", True)
    if tint:
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 1.0
        mix.inputs["B"].default_value = lin(tint)
        nt.links.new(diff.outputs["Color"], mix.inputs["A"])
        nt.links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    else:
        nt.links.new(diff.outputs["Color"], bsdf.inputs["Base Color"])
    # a little more matte than the scan, so the counter doesn't mirror everything
    rough = nt.nodes.new("ShaderNodeMath")
    rough.operation = "MULTIPLY_ADD"
    rough.inputs[1].default_value, rough.inputs[2].default_value = 0.8, 0.28
    nt.links.new(img("rough", False).outputs["Color"], rough.inputs[0])
    nt.links.new(rough.outputs["Value"], bsdf.inputs["Roughness"])
    nmap = nt.nodes.new("ShaderNodeNormalMap")
    nt.links.new(img("nor_gl", False).outputs["Color"], nmap.inputs["Color"])
    nt.links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def paint(name, colour, rough=0.55):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(colour)
    b.inputs["Roughness"].default_value = rough
    return m


def box(name, size, loc, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.uv.cube_project(cube_size=1.0)
    bpy.ops.object.mode_set(mode="OBJECT")
    o.data.materials.append(mat)
    return o


# a cut-out as a card standing on the counter, facing the camera; its own photo keeps its colours
def card(name, png, height, x, y, z=0.0, turn=0.0, lean=0.0):
    im = bpy.data.images.load(os.path.join(EL, png))
    w, h = im.size
    bpy.ops.mesh.primitive_plane_add(size=1)
    o = bpy.context.object
    o.name = name
    o.scale = (height * w / h, height, 1)
    bpy.ops.object.transform_apply(scale=True)
    o.rotation_euler = (math.radians(90 + lean), 0, math.radians(turn))
    o.location = (x, y, z + height / 2)
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = im
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    nt.links.new(t.outputs["Alpha"], b.inputs["Alpha"])
    nt.links.new(t.outputs["Color"], b.inputs["Emission Color"])
    b.inputs["Emission Strength"].default_value = 0.22
    b.inputs["Roughness"].default_value = 0.5
    o.data.materials.append(m)
    return o


# a word as painted letters on the wall: each shaped glyph is its own filled, extruded solid (joined Arabic glyphs
# overlap, so one filled curve would cut holes where they meet), merged into one object
def letters(name, word, height, x, z, colour, wall_y, depth=0.025):
    import json
    d = json.load(open(os.path.join(TYPE, word + ".json")))
    objs = []
    for gi, loops in enumerate(d["glyphs"]):
        cu = bpy.data.curves.new(f"{name} {gi}", "CURVE")
        cu.dimensions = "2D"
        cu.fill_mode = "BOTH"
        cu.extrude = depth / 2 / height
        cu.bevel_depth = 0.06 * depth / height
        for loop in loops:
            sp = cu.splines.new("POLY")
            sp.points.add(len(loop) - 1)
            for p, (px, py) in zip(sp.points, loop):
                p.co = (px, py, 0, 1)
            sp.use_cyclic_u = True
        o = bpy.data.objects.new(f"{name} {gi}", cu)
        bpy.context.scene.collection.objects.link(o)
        objs.append(o)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.join()
    o = bpy.context.object
    o.name = name
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    # the glyphs are in em units: one em becomes the height asked for
    o.scale = (height, height, height)
    o.rotation_euler = (math.radians(90), 0, 0)
    o.location = (x, wall_y - depth / 2 - 0.003, z)
    o.data.materials.append(paint(name, colour, 0.62))
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(30))
    return o


def area(name, loc, target, power, size, temp):
    bpy.ops.object.light_add(type="AREA", location=loc)
    l = bpy.context.object
    l.name = name
    l.data.energy = power
    l.data.size = size
    l.data.color = temp
    d = Vector(target) - Vector(loc)
    l.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return l


def spot(name, loc, target, power, angle, blend, colour):
    bpy.ops.object.light_add(type="SPOT", location=loc)
    l = bpy.context.object
    l.name = name
    l.data.energy = power
    l.data.spot_size = math.radians(angle)
    l.data.spot_blend = blend
    l.data.shadow_soft_size = 0.4
    l.data.color = colour
    d = Vector(target) - Vector(loc)
    l.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return l


def stage(wall_y=0.45):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "Medium High Contrast"
    sc.view_settings.exposure = -0.85
    sc.render.film_transparent = False
    w = bpy.data.worlds.new("studio")
    sc.world = w
    w.use_nodes = True
    env = w.node_tree.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(os.path.join(SET, "brown_photostudio_02_2k.hdr"))
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Strength"].default_value = 0.12
    w.node_tree.links.new(env.outputs["Color"], bg.inputs["Color"])
    box("counter", (4.0, 1.6, 0.06), (0, -0.25, -0.03), tex_material("oak counter", "wood_table_001", scale=1.4))
    box("wall", (6.0, 0.08, 4.0), (0, wall_y + 0.04, 1.6), tex_material("orange plaster", "painted_plaster_wall", tint=ORANGE, scale=1.2))
    return sc


def camera(sc, loc, target, lens=50, fstop=5.6, focus=None):
    bpy.ops.object.camera_add(location=loc)
    c = bpy.context.object
    c.name = "camera"
    d = Vector(target) - Vector(loc)
    c.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    c.data.lens = lens
    c.data.dof.use_dof = True
    c.data.dof.aperture_fstop = fstop
    c.data.dof.focus_distance = focus or d.length
    sc.camera = c
    return c


WARM, ROSE, SUN = (1.0, 0.86, 0.72), (1.0, 0.72, 0.55), (1.0, 0.78, 0.55)
WALL = 0.45


# a firm key from the front left that throws the objects' shadows onto the wall, a warm pool of light on the wall
# behind the words, and a rim from behind on the right
def lights(key=(-0.9, -0.75, 0.95), pool=(-0.1, 0.85)):
    area("key softbox", key, (0.05, 0.25, 0.25), 120, 0.22, WARM)
    area("rim", (0.75, 0.38, 0.7), (0.0, 0.2, 0.3), 45, 0.4, ROSE)
    spot("wall light", (0.45, -0.7, 1.3), (pool[0], WALL, pool[1]), 900, 30, 1.0, SUN)


def shot_chess(sc):
    lights(pool=(-0.1, 0.62))
    card("king", "chess-king.png", 0.42, 0.14, 0.26)
    for i, (x, y, h) in enumerate([(-0.15, 0.08, 0.2), (0.36, 0.3, 0.19), (-0.32, 0.3, 0.17)]):
        card(f"pawn {i + 1}", "chess-pawn.png", h, x, y)
    letters("isolates you", "yazlak", 0.15, -0.12, 0.74, BROWN, WALL)
    letters("completely", "tamaman", 0.095, -0.15, 0.58, CREAM, WALL)
    camera(sc, (0.16, -1.05, 0.36), (0.0, 0.45, 0.42), lens=40, fstop=4, focus=1.3)


def shot_till(sc):
    lights(pool=(-0.05, 0.66))
    card("cash register", "register.png", 0.44, 0.13, 0.22)
    card("cash", "cash-fan.png", 0.22, -0.02, 0.12, z=0.4, turn=-8, lean=-15)
    letters("raises", "turfa", 0.085, -0.08, 0.86, CREAM, WALL)
    letters("your sales", "mabee", 0.13, -0.05, 0.72, BROWN, WALL)
    camera(sc, (0.15, -1.1, 0.38), (0.0, 0.45, 0.44), lens=40, fstop=4, focus=1.35)


def shot_owner(sc):
    lights(key=(-0.9, -0.8, 1.1), pool=(-0.14, 0.7))
    card("shop owner", "shop-owner.png", 0.72, 0.17, 0.36, z=-0.12)
    # the front of the shop counter he stands behind
    box("counter front", (1.6, 0.22, 0.16), (0.1, 0.12, 0.08), tex_material("oak front", "wood_table_001", scale=1.4))
    letters("and sell", "tbee", 0.085, -0.17, 0.88, CREAM, WALL)
    letters("in your place", "makan", 0.13, -0.14, 0.74, BROWN, WALL)
    camera(sc, (0.15, -1.1, 0.4), (0.0, 0.45, 0.46), lens=40, fstop=4, focus=1.4)


SHOTS = {"chess": shot_chess, "till": shot_till, "owner": shot_owner}

if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1:]
    name, out = args[0], os.path.abspath(args[1])
    sc = stage()
    SHOTS[name](sc)
    sc.cycles.samples = int(args[2]) if len(args) > 2 else 96
    sc.render.filepath = out
    sc.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
