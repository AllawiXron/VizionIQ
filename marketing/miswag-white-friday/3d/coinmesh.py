"""The silver coin: a bevelled cylinder, its face (coin_height.png) as a bump map with a polished field and frosted
relief, and a reeded edge. build() returns one coin of radius 1; copy it (obj.copy()) for more."""
import math
import os

import bpy  # must come before mathutils when Blender runs as a Python module

HERE = os.path.dirname(os.path.abspath(__file__))


def build():
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
    return coin
