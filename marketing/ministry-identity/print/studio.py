"""Photographic mockups of the ministry's print pieces (Blender 4.2, Cycles): the flat artwork from print/tex/*.png on
paper and card at real sizes, lying on a warm stone surface under soft window light.

  <python with bpy 4.2> print/studio.py <shot> [--preview] [--save <file.blend>]      shots: stationery, devices, sign
  --save writes the scene (textures packed in) instead of rendering it.
"""
import math
import os
import sys

import bpy
import bmesh  # noqa: E402  (bmesh loads only after bpy)
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, "tex")
OUT = os.path.join(HERE, "renders")
CM = 0.01


def lin(hexstr):
    h = hexstr.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [1]


def reset(w, h, samples):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = samples
    s.cycles.use_denoising = True
    s.render.resolution_x, s.render.resolution_y = w, h
    s.view_settings.view_transform = "Standard"      # keeps the brand colours true
    s.view_settings.look = "Medium High Contrast"
    s.view_settings.exposure = -0.3
    world = bpy.data.worlds.new("w")
    s.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = lin("#f4f2ee")
    bg.inputs[1].default_value = 0.4
    return s


def surface(color, w=160, d=110):
    """the table: a warm stone with a faint mottle and grain"""
    bpy.ops.mesh.primitive_plane_add(size=1)
    ob = bpy.context.object
    ob.name = "Table"
    ob.scale = (w * CM, d * CM, 1)
    m = bpy.data.materials.new("stone")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.85
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3.0
    noise.inputs["Detail"].default_value = 4.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = [v * 0.95 for v in lin(color)[:3]] + [1]
    ramp.color_ramp.elements[1].color = lin(color)
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    fine = nt.nodes.new("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 2500.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.025
    nt.links.new(fine.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    ob.data.materials.append(m)


NAMES = {"letterhead": "Letterhead", "envelope": "Envelope", "card-front": "Business Card Front", "card-back": "Business Card Back",
         "badge": "ID Card", "lanyard": "Lanyard", "screen": "Phone Screen", "sign": "Sign Face"}


def sheet(tex, w, h, x, y, rot, z=0.0, thick=0.012, rough=0.72, gloss=0.0):
    """a printed sheet or card, w x h cm, centred at (x, y) cm, rotated rot degrees, its underside at z cm"""
    bpy.ops.mesh.primitive_plane_add(size=1)
    ob = bpy.context.object
    ob.name = NAMES.get(tex, tex)
    ob.scale = (w * CM, h * CM, 1)
    ob.location = (x * CM, y * CM, (z + thick) * CM)
    ob.rotation_euler = (0, 0, math.radians(rot))
    bpy.ops.object.transform_apply(scale=True)
    sol = ob.modifiers.new("t", "SOLIDIFY")
    sol.thickness = thick * CM
    sol.offset = -1
    bev = ob.modifiers.new("b", "BEVEL")
    bev.width = min(thick, 0.02) * CM * 0.4
    m = bpy.data.materials.new(tex)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = gloss
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(os.path.join(TEX, tex + ".png"), check_existing=True)
    img.interpolation = "Cubic"
    nt.links.new(img.outputs["Color"], b.inputs["Base Color"])
    fib = nt.nodes.new("ShaderNodeTexNoise")              # paper fibre
    fib.inputs["Scale"].default_value = 1400.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.035
    nt.links.new(fib.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    ob.data.materials.append(m)
    return ob


def lights(elev=24, azim=140, soft=2.5, power=4.6):
    sun = bpy.data.lights.new("sun", "SUN")
    sun.energy = power
    sun.angle = math.radians(soft)
    sun.color = lin("#fffaf2")[:3]
    ob = bpy.data.objects.new("Sun", sun)
    ob.rotation_euler = (math.radians(90 - elev), 0, math.radians(azim))
    bpy.context.collection.objects.link(ob)


def camera(frame_w, aspect, tilt=0.0, focal=120):
    cam = bpy.data.cameras.new("cam")
    cam.lens = focal
    cam.sensor_width = 36
    ob = bpy.data.objects.new("Camera", cam)
    bpy.context.collection.objects.link(ob)
    dist = frame_w * CM * focal / 36
    ob.location = (0, -math.sin(math.radians(tilt)) * dist, math.cos(math.radians(tilt)) * dist)
    ob.rotation_euler = (math.radians(tilt), 0, 0)
    bpy.context.scene.camera = ob


def stationery(preview):
    s = reset(*(960, 504) if preview else (2600, 1365), 24 if preview else 160)
    surface("#cbc6bd")
    sheet("letterhead", 21.0, 29.7, 6.6, -3.0, 0, z=0.012)          # two sheets, the lower one slightly turned
    sheet("letterhead", 21.0, 29.7, 7.8, -3.9, -3.5)
    sheet("envelope", 22.0, 11.0, -11.5, -6.0, 4, z=0.03, thick=0.06)
    for i in range(4):                                             # a small stack of cards, the top one turned
        sheet("card-back", 8.5, 5.5, -13.8 + i * 0.05, 6.4 + i * 0.03, 8 - i * 0.6, z=i * 0.045, thick=0.045)
    sheet("card-front", 8.5, 5.5, -4.6, 7.6, -9, thick=0.045, rough=0.5, gloss=0.2)
    lights()
    camera(46, 2600 / 1365)
    return s


def textured(name, tex, rough=0.6, coat=0.0, emit=0.0, bump=0.0, metal=0.0):
    """a material whose colour is an image from print/tex; emit > 0 makes it glow like a screen"""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = 0.05
    b.inputs["Metallic"].default_value = metal
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(os.path.join(TEX, tex + ".png"), check_existing=True)
    img.interpolation = "Cubic"
    nt.links.new(img.outputs["Color"], b.inputs["Base Color"])
    if emit:
        nt.links.new(img.outputs["Color"], b.inputs["Emission Color"])
        b.inputs["Emission Strength"].default_value = emit
    # the image's alpha cuts the surface out (the phone glass's rounded corners)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(img.outputs["Alpha"], mx.inputs["Fac"])
    nt.links.new(tr.outputs["BSDF"], mx.inputs[1])
    nt.links.new(b.outputs["BSDF"], mx.inputs[2])
    nt.links.new(mx.outputs["Shader"], nt.nodes["Material Output"].inputs["Surface"])
    if bump:
        n = nt.nodes.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = 600.0
        bp = nt.nodes.new("ShaderNodeBump")
        bp.inputs["Strength"].default_value = bump
        nt.links.new(n.outputs["Fac"], bp.inputs["Height"])
        nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def plain(name, color, rough=0.5, metal=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(color)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Coat Weight"].default_value = coat
    return m


def rounded_slab(w, h, t, r, x, y, rot, z=0.0, edge=0.08):
    """a w x h cm slab with corner radius r, t cm thick, lying at (x, y) cm"""
    me = bpy.data.meshes.new("slab")
    bm = bmesh.new()
    vs = [bm.verts.new((sx * w / 2 * CM, sy * h / 2 * CM, 0)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    bm.faces.new(vs)
    bmesh.ops.bevel(bm, geom=vs, offset=r * CM, segments=14, affect="VERTICES")
    bm.to_mesh(me)
    ob = bpy.data.objects.new("slab", me)
    bpy.context.collection.objects.link(ob)
    sol = ob.modifiers.new("t", "SOLIDIFY")
    sol.thickness = t * CM
    sol.offset = 1
    bev = ob.modifiers.new("b", "BEVEL")
    bev.width = edge * CM
    bev.segments = 4
    bev.limit_method = "ANGLE"
    ob.location = (x * CM, y * CM, z * CM)
    ob.rotation_euler = (0, 0, math.radians(rot))
    for p in me.polygons:
        p.use_smooth = True
    return ob


def textured_plane(mat, w, h, x, y, rot, z):
    bpy.ops.mesh.primitive_plane_add(size=1)
    ob = bpy.context.object
    ob.name = NAMES.get(mat.name, mat.name)
    ob.scale = (w * CM, h * CM, 1)
    ob.location = (x * CM, y * CM, z * CM)
    ob.rotation_euler = (0, 0, math.radians(rot))
    ob.data.materials.append(mat)
    return ob


def phone(x, y, rot, length=14.9):
    """the phone model (print/models/phone.glb, "Low Poly Mobile Phone", CC BY) lying face up, length cm long, with the
    app's start screen on its face"""
    bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, "models", "phone.glb"))
    parts = [o for o in bpy.context.selected_objects if o.type == "MESH"]
    case = next(o for o in parts if o.name.startswith("Phone_Case"))
    # the model sits tilted in its file: express every part in the case's own axes (x across, y along, z through)
    to_case = case.matrix_world.inverted()
    mats = {o: to_case @ o.matrix_world for o in parts}
    for o in parts:
        o.parent = None
        o.matrix_world = mats[o]
    for o in [o for o in bpy.data.objects if o.type == "EMPTY"]:     # the importer's empty root node
        bpy.data.objects.remove(o)
    front = next(o for o in parts if o.name.startswith("Camera_Front"))
    flip = front.matrix_world.translation.z < 0                        # the front camera marks the face
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = case
    bpy.ops.object.join()
    ob = bpy.context.object
    ob.name = "Phone"
    if flip:
        ob.rotation_euler = (0, math.radians(180), 0)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    me = ob.data
    face_i = [k for k, m in enumerate(me.materials) if m and m.name.startswith("PhoneFace")][0]
    faces = [p for p in me.polygons if p.material_index == face_i and p.normal.z > 0.9]
    big = max(p.area for p in faces)
    faces = [p for p in faces if p.area > big * 0.1]                  # the face itself, not the lens rims
    k = length * CM / max(ob.dimensions)
    ob.scale = (k, k, k * 0.62)                                        # the low-poly body is thick: slim it to about 7.7 mm
    bpy.ops.object.transform_apply(scale=True)
    vs = [v.co for v in me.vertices]
    lo = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs)))
    hi = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
    mid = (lo + hi) / 2
    for v in me.vertices:
        v.co -= Vector((mid.x, mid.y, lo.z))
    # the screen sits on the face: its size from the face polygons
    fv = [me.vertices[i].co for p in faces for i in p.vertices]
    fw = max(v.x for v in fv) - min(v.x for v in fv)
    fh = max(v.y for v in fv) - min(v.y for v in fv)
    fz = max(v.z for v in fv)
    for m in list(me.materials):
        nm = m.name
        me.materials[me.materials.find(nm)] = (plain("blackglass", "#060607", rough=0.25, coat=0.2) if nm.startswith("PhoneFace")
                                               else plain("graphite", "#2b2d32", rough=0.4, metal=0.5))
    scr = textured_plane(textured("screen", "screen", rough=0.2, coat=0.1, emit=0.45), fw / CM * 0.965, fh / CM * 0.975, 0, 0, 0, fz / CM + 0.004)
    scr.parent = ob                                                    # the screen moves with the phone
    ob.location = (x * CM, y * CM, 0)
    ob.rotation_euler = (0, 0, math.radians(rot))
    return ob, scr


def devices(preview):
    """the employee ID on its lanyard, and a phone showing the app's start screen"""
    s = reset(*(960, 504) if preview else (2600, 1365), 24 if preview else 160)
    surface("#cbc6bd")
    # the lanyard runs off the top of the frame; a metal clip holds the card
    a = math.radians(7)
    up = lambda x, y, d: (x - d * math.sin(a), y + d * math.cos(a))     # d cm further along the card's up direction
    bx, by = -8.4, -0.2
    sheet("badge", 5.4, 8.6, bx, by, 7, thick=0.076, rough=0.35, gloss=0.35)
    cx, cy = up(bx, by, 4.3 + 0.55)
    lx, ly = up(cx, cy, 0.8 + 15.0)
    textured_plane(textured("lanyard", "lanyard", rough=0.85, bump=0.3), 2.0, 30.0, lx, ly, 7, 0.06)
    clip = rounded_slab(1.3, 1.9, 0.18, 0.25, cx, cy, 7, z=0.076, edge=0.05)
    clip.name = "Clip"
    clip.data.materials.append(plain("steel", "#b9bcc2", rough=0.25, metal=1.0))
    phone(5.6, -0.6, -6)
    lights()
    camera(40, 2600 / 1365)
    return s


def sign(preview):
    """the building sign on a limestone wall, in late afternoon light"""
    s = reset(*(960, 504) if preview else (2600, 1365), 24 if preview else 192)
    # the wall stands in the x-z plane at y = 0, built of large limestone blocks
    bpy.ops.mesh.primitive_plane_add(size=1)
    wall = bpy.context.object
    wall.name = "Wall"
    wall.scale = (900 * CM, 500 * CM, 1)
    wall.rotation_euler = (math.radians(90), 0, 0)
    m = bpy.data.materials.new("limestone")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.9
    tc = nt.nodes.new("ShaderNodeTexCoord")
    brick = nt.nodes.new("ShaderNodeTexBrick")
    brick.inputs["Scale"].default_value = 1.0
    brick.inputs["Brick Width"].default_value = 0.6
    brick.inputs["Row Height"].default_value = 0.3
    brick.inputs["Mortar Size"].default_value = 0.004
    brick.inputs["Color1"].default_value = lin("#e4dccd")
    brick.inputs["Color2"].default_value = lin("#dad0be")
    brick.inputs["Mortar"].default_value = lin("#cdc2ae")
    nt.links.new(tc.outputs["Object"], brick.inputs["Vector"])
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 6.0
    noise.inputs["Detail"].default_value = 10.0
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 0.25
    nt.links.new(brick.outputs["Color"], mix.inputs["A"])
    nt.links.new(noise.outputs["Color"], mix.inputs["B"])
    nt.links.new(mix.outputs["Result"], b.inputs["Base Color"])
    fine = nt.nodes.new("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 60.0
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "ADD"
    nt.links.new(fine.outputs["Fac"], add.inputs[0])
    nt.links.new(brick.outputs["Fac"], add.inputs[1])
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = 0.025
    nt.links.new(add.outputs["Value"], bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    wall.data.materials.append(m)
    # the panel: a blue box 4 cm deep, 3 cm off the wall on hidden standoffs, the artwork on its face
    bpy.ops.mesh.primitive_cube_add(size=1)
    box = bpy.context.object
    box.name = "Sign Panel"
    box.scale = (240 * CM, 4 * CM, 60 * CM)
    box.location = (0, -5 * CM, 0)
    bev = box.modifiers.new("b", "BEVEL")
    bev.width = 0.3 * CM
    bev.segments = 3
    box.data.materials.append(plain("panel", "#17357d", rough=0.35, coat=0.3))
    bpy.ops.mesh.primitive_plane_add(size=1)
    face = bpy.context.object
    face.name = "Sign Face"
    face.scale = (239.4 * CM, 59.4 * CM, 1)
    face.rotation_euler = (math.radians(90), 0, 0)
    face.location = (0, -7.02 * CM, 0)
    face.data.materials.append(textured("signface", "sign", rough=0.3, coat=0.4))
    # sun from the upper right, low enough to throw the panel's shadow across the stone
    sun = bpy.data.lights.new("sun", "SUN")
    sun.energy = 5.5
    sun.angle = math.radians(1.0)
    sun.color = lin("#ffe9cc")[:3]
    so = bpy.data.objects.new("Sun", sun)
    so.rotation_euler = Vector((-0.55, 0.5, -0.67)).to_track_quat("-Z", "Y").to_euler()   # travelling left, into the wall, down
    bpy.context.collection.objects.link(so)
    s.world.node_tree.nodes["Background"].inputs[0].default_value = lin("#e6eef7")
    s.world.node_tree.nodes["Background"].inputs[1].default_value = 0.45
    # camera: a little to the left and below, looking up at the panel
    cam = bpy.data.cameras.new("cam")
    cam.lens = 50
    co = bpy.data.objects.new("Camera", cam)
    bpy.context.collection.objects.link(co)
    co.location = (-150 * CM, -420 * CM, -40 * CM)
    d = Vector((25 * CM, 0, -2 * CM)) - co.location
    co.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    s.camera = co
    return s


SHOTS = {"stationery": stationery, "devices": devices, "sign": sign}

if __name__ == "__main__":
    shot = sys.argv[1]
    preview = "--preview" in sys.argv
    s = SHOTS[shot](preview)
    if "--save" in sys.argv:
        bpy.ops.file.pack_all()
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(sys.argv[sys.argv.index("--save") + 1]), compress=True)
        sys.stdout.flush()
        os._exit(0)          # skip bpy's teardown, which can crash after the importer's objects are removed
    os.makedirs(OUT, exist_ok=True)
    s.render.filepath = os.path.join(OUT, shot + ("-preview" if preview else "") + ".png")
    bpy.ops.render.render(write_still=True)
    print("wrote", s.render.filepath)
