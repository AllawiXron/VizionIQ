"""Shared studio for the 2.5D Miswag posts: Cycles settings, a Miswag-red cyclorama (floor curving up into the wall),
soft lights, and a 4:5 camera. Used by piggy.py and giftburst.py."""
import math

import bpy  # must come before bmesh / mathutils when Blender runs as a Python module
import bmesh
from mathutils import Vector

# #de1c24 in linear light, a touch deeper so the lit wall lands on the brand red
RED = (0.62, 0.012, 0.018, 1)


def setup(pct, samples):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 8
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1620, 2025, pct
    sc.render.image_settings.file_format = "PNG"
    sc.view_settings.view_transform = "Standard"  # AgX pulls saturated red towards orange; the brand red must stay red
    sc.view_settings.look = "None"
    sc.view_settings.exposure = -0.2
    return sc


def material(name, color, rough=0.5, **kw):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    for k, v in kw.items():
        b.inputs[k].default_value = v
    return m


def cyclorama(sc, color=RED, back=2.6, radius=1.6):
    """Floor (z=0) running back into a quarter-circle cove and up a wall at y=back."""
    prof = [(-12.0, 0.0), (back - radius, 0.0)]
    for i in range(1, 24):
        a = (math.pi / 2) * i / 24
        prof.append((back - radius + radius * math.sin(a), radius - radius * math.cos(a)))
    prof += [(back, radius), (back, 14.0)]
    bm = bmesh.new()
    rows = []
    for x in (-14.0, 14.0):
        rows.append([bm.verts.new((x, y, z)) for y, z in prof])
    for k in range(len(prof) - 1):
        bm.faces.new((rows[0][k], rows[1][k], rows[1][k + 1], rows[0][k + 1]))
    me = bpy.data.meshes.new("cyc")
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new("cyclorama", me)
    for f in o.data.polygons:
        f.use_smooth = True
    o.data.materials.append(material("backdrop", color, 0.62))
    sc.collection.objects.link(o)
    return o


def area(sc, name, loc, target, size, power, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, "AREA")
    d.size, d.energy, d.color = size, power, color
    o = bpy.data.objects.new(name, d)
    o.location = Vector(loc)
    o.rotation_euler = (Vector(target) - o.location).to_track_quat("-Z", "Y").to_euler()
    o.visible_camera = False  # a soft box, never a white patch in frame
    sc.collection.objects.link(o)
    return o


def lights(sc, target=(0, 0, 0.8)):
    area(sc, "key", (-3.4, -3.6, 5.2), target, 4.5, 620, (1.0, 0.97, 0.94))
    area(sc, "rim", (2.8, 0.9, 3.9), target, 2.0, 300)
    area(sc, "fill", (4.0, -4.2, 1.4), target, 3.0, 150, (1.0, 0.95, 0.95))
    # a big white card behind the camera that only shows up in reflections (silver and glaze need something to mirror)
    bpy.ops.mesh.primitive_plane_add(size=6, location=(0.5, -8.5, 4.2))
    card = bpy.context.active_object
    card.rotation_euler = (Vector(target) - card.location).to_track_quat("Z", "Y").to_euler()
    em = bpy.data.materials.new("reflector")
    em.use_nodes = True
    nodes = em.node_tree.nodes
    nodes.remove(nodes["Principled BSDF"])
    e = nodes.new("ShaderNodeEmission")
    e.inputs["Strength"].default_value = 1.6
    em.node_tree.links.new(e.outputs["Emission"], nodes["Material Output"].inputs["Surface"])
    card.data.materials.append(em)
    card.visible_camera = card.visible_diffuse = card.visible_shadow = False
    w = bpy.data.worlds.new("w")
    sc.world = w
    w.use_nodes = True
    # diffuse light from the world stays a dim red; reflections see a bright grey studio, so silver reads as silver
    wn, wl = w.node_tree.nodes, w.node_tree.links
    bg = wn["Background"]
    bg.inputs["Color"].default_value = (0.4, 0.05, 0.05, 1)
    bg.inputs["Strength"].default_value = 0.25
    glossy = wn.new("ShaderNodeBackground")
    glossy.inputs["Color"].default_value = (0.78, 0.74, 0.74, 1)
    glossy.inputs["Strength"].default_value = 1.0
    lp = wn.new("ShaderNodeLightPath")
    mix = wn.new("ShaderNodeMixShader")
    wl.new(lp.outputs["Is Glossy Ray"], mix.inputs["Fac"])
    wl.new(bg.outputs["Background"], mix.inputs[1])
    wl.new(glossy.outputs["Background"], mix.inputs[2])
    wl.new(mix.outputs["Shader"], wn["World Output"].inputs["Surface"])


def camera(sc, loc, target, lens=50):
    cd = bpy.data.cameras.new("cam")
    cd.lens = lens
    cd.sensor_fit = "VERTICAL"
    cd.sensor_height = 36
    cam = bpy.data.objects.new("cam", cd)
    cam.location = Vector(loc)
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.collection.objects.link(cam)
    sc.camera = cam
    return cam
