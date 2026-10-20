"""Photographic mockups of the ministry's print pieces (Blender 4.2, Cycles): the flat artwork from print/tex/*.png on
paper and card at real sizes, lying on a warm stone surface under soft window light.

  <python with bpy 4.2> print/studio.py <shot> [--preview]      shots: stationery
"""
import math
import os
import sys

import bpy

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


def sheet(tex, w, h, x, y, rot, z=0.0, thick=0.012, rough=0.72, gloss=0.0):
    """a printed sheet or card, w x h cm, centred at (x, y) cm, rotated rot degrees, its underside at z cm"""
    bpy.ops.mesh.primitive_plane_add(size=1)
    ob = bpy.context.object
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
    img.image = bpy.data.images.load(os.path.join(TEX, tex + ".png"))
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
    ob = bpy.data.objects.new("sun", sun)
    ob.rotation_euler = (math.radians(90 - elev), 0, math.radians(azim))
    bpy.context.collection.objects.link(ob)


def camera(frame_w, aspect, tilt=0.0, focal=120):
    cam = bpy.data.cameras.new("cam")
    cam.lens = focal
    cam.sensor_width = 36
    ob = bpy.data.objects.new("cam", cam)
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


SHOTS = {"stationery": stationery}

if __name__ == "__main__":
    shot = sys.argv[1]
    preview = "--preview" in sys.argv
    s = SHOTS[shot](preview)
    os.makedirs(OUT, exist_ok=True)
    s.render.filepath = os.path.join(OUT, shot + ("-preview" if preview else "") + ".png")
    bpy.ops.render.render(write_still=True)
    print("wrote", s.render.filepath)
