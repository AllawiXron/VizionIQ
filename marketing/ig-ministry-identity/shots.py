"""Portrait shots for the identity carousel (Blender 4.2, Cycles), built from the identity's own print artwork
(../ministry-identity/print/tex) and scene pieces (../ministry-identity/print/studio.py).

  <python with bpy 4.2> shots.py <shot|all> [--preview]
  shots: sign, foil, grid, swatches, letterhead, stationery, badge, phone, macro
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "ministry-identity", "print"))
import bpy  # noqa: E402
import studio as st  # noqa: E402
from mathutils import Vector  # noqa: E402

OUT = os.path.join(HERE, "renders")
CM = st.CM
STONE = "#cbc6bd"


def res(s, preview, samples=128):
    s.render.resolution_x, s.render.resolution_y = (405, 506) if preview else (1620, 2025)
    s.cycles.samples = 24 if preview else samples


def cam(loc, target, lens, fstop=None, focus=None):
    """a portrait camera at loc (cm) looking at target (cm); fstop sets a shallow focus on focus (cm), the target by default"""
    s = bpy.context.scene
    if s.camera:
        bpy.data.objects.remove(s.camera)
    c = bpy.data.cameras.new("Camera")
    c.lens = lens
    c.sensor_width = 36
    c.clip_start = 0.002                                # close-ups sit nearer than the 10 cm default
    ob = bpy.data.objects.new("Camera", c)
    s.collection.objects.link(ob)
    ob.location = Vector(loc) * CM
    d = Vector(target) * CM - ob.location
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    if fstop:
        c.dof.use_dof = True
        c.dof.focus_distance = (Vector(focus) * CM - ob.location).length if focus else d.length
        c.dof.aperture_fstop = fstop
    s.camera = ob


def foil_card(x, y, rot, z=0.0):
    """the business card front with its gold arches foil-stamped: metallic gold, slightly raised, where the mask is white"""
    ob = st.sheet("card-front-4x", 8.5, 5.5, x, y, rot, z=z, thick=0.045, rough=0.5, gloss=0.1)
    ob.name = "Business Card Front"
    m = ob.data.materials[0]
    nt = m.node_tree
    base = nt.nodes["Principled BSDF"]
    out = nt.nodes["Material Output"]
    mask = nt.nodes.new("ShaderNodeTexImage")
    mask.image = bpy.data.images.load(os.path.join(st.TEX, "card-front-foil-4x.png"), check_existing=True)
    mask.image.colorspace_settings.name = "Non-Color"
    mask.interpolation = "Cubic"
    gold = nt.nodes.new("ShaderNodeBsdfPrincipled")
    gold.inputs["Base Color"].default_value = st.lin("#d6a64a")
    gold.inputs["Metallic"].default_value = 1.0
    gold.inputs["Roughness"].default_value = 0.22
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(mask.outputs["Color"], mix.inputs["Fac"])
    nt.links.new(base.outputs["BSDF"], mix.inputs[1])
    nt.links.new(gold.outputs["BSDF"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.35
    bump.inputs["Distance"].default_value = 0.0003
    nt.links.new(mask.outputs["Color"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], gold.inputs["Normal"])
    return ob


def badge_set(bx, by, rot):
    """the employee ID with its clip and lanyard running off the frame"""
    a = math.radians(rot)
    up = lambda x, y, d: (x - d * math.sin(a), y + d * math.cos(a))
    st.sheet("badge", 5.4, 8.6, bx, by, rot, thick=0.076, rough=0.35, gloss=0.35)
    cx, cy = up(bx, by, 4.3 + 0.55)
    lx, ly = up(cx, cy, 0.8 + 15.0)
    st.textured_plane(st.textured("lanyard", "lanyard", rough=0.85, bump=0.3), 2.0, 30.0, lx, ly, rot, 0.06)
    clip = st.rounded_slab(1.3, 1.9, 0.18, 0.25, cx, cy, rot, z=0.076, edge=0.05)
    clip.name = "Clip"
    clip.data.materials.append(st.plain("steel", "#b9bcc2", rough=0.25, metal=1.0))


def scene(preview, samples=128):
    s = st.reset(1620, 2025, samples)
    res(s, preview, samples)
    return s


# ---------------------------------------------------------------- shots
def sign(preview):
    s = st.sign(preview)
    res(s, preview, 160)
    bpy.data.objects["Wall"].scale[1] *= 2.2              # taller, so the stone runs past the bottom of the frame
    cam((-40, -560, -170), (25, 0, -85), 50)
    return s


def foil(preview):
    s = scene(preview)
    st.surface(STONE)
    for i in range(3):                                   # the stack of backs behind, out of focus
        st.sheet("card-back", 8.5, 5.5, 3.5 + i * 0.05, 8.5 + i * 0.04, 14 - i, z=i * 0.045, thick=0.045)
    foil_card(-0.5, -0.5, -9)
    st.lights(elev=20, azim=200, soft=2.0, power=4.4)
    cam((-2, -21, 13), (-0.5, -0.5, 0.05), 90, 2.8)
    return s


def grid(preview):
    s = scene(preview)
    st.surface(STONE)
    st.sheet("grid-sheet", 21.0, 29.7, -1.0, -3.0, -6)
    foil_card(5.5, -15.5, 16, z=0.012)                    # the foil card on the sheet's corner, a real gold object in front
    st.lights(elev=24, azim=150, soft=2.0, power=4.4)
    cam((-4, -46, 38), (0.0, 0.5, 0), 70, 5.0, focus=(-1.0, -2.0, 0))   # lower angle; the drawing sharp, the card falling soft
    return s


def swatches(preview):
    s = scene(preview)
    st.surface(STONE)
    # fanned from a pivot near their bottom ends, like a printer's colour chips held open
    px, py = 0.0, -9.0
    for i, (sw, ang) in enumerate(zip(["clay", "gold", "night", "blue"], [-24, -9, 6, 21])):
        a = math.radians(ang)
        x, y = px - 4.0 * math.sin(a), py + 4.0 * math.cos(a)
        ob = st.sheet("swatch-" + sw, 5.0, 9.0, x, y, ang, z=i * 0.03, thick=0.03, rough=0.6)
        ob.name = "Swatch " + sw
    st.lights(elev=28, azim=135, soft=2.0, power=4.4)
    cam((0, -10, 29), (0, -3.0, 0), 70, 4.0)
    return s


def letterhead(preview):
    s = scene(preview)
    st.surface(STONE)
    st.sheet("letterhead", 21.0, 29.7, 1.5, 0.5, 4, z=0.0)
    st.sheet("letterhead", 21.0, 29.7, 0.0, 0.0, -3, z=0.012)
    st.lights(elev=26, azim=140, soft=2.0, power=4.4)
    cam((-3, -10, 20), (4.5, 11.0, 0.02), 85, 4.0)
    return s


def stationery(preview):
    s = st.stationery(preview)
    res(s, preview, 128)
    cam((-1.5, -12.0, 50), (-1.5, -9.0, 0), 50)         # framed low, so stone shows under the envelope
    return s


def badge(preview):
    s = scene(preview)
    st.surface(STONE)
    badge_set(0.0, -1.0, 6)
    st.lights(elev=24, azim=140, soft=2.0, power=4.4)
    cam((-2, -17, 22), (0.2, -0.5, 0.08), 85, 2.8)
    return s


def phone(preview):
    s = scene(preview)
    st.surface(STONE)
    badge_set(-11.0, 7.0, 14)
    st.phone(1.0, -0.5, -7)
    st.lights(elev=26, azim=140, soft=2.0, power=4.4)
    cam((3, -23, 29), (1.0, -5.0, 0.8), 70, 2.8, focus=(1.0, -0.5, 0.8))   # the phone high in the frame, stone below it
    return s


def macro(preview):
    s = scene(preview)
    st.surface(STONE)
    foil_card(0.0, 0.0, -9)
    st.lights(elev=18, azim=200, soft=1.5, power=4.6)
    cam((0.6, -10.5, 6.5), (0.0, 0.0, 0.05), 100, 8.0)
    return s


SHOTS = {f.__name__: f for f in [sign, foil, grid, swatches, letterhead, stationery, badge, phone, macro]}

if __name__ == "__main__":
    preview = "--preview" in sys.argv
    names = list(SHOTS) if sys.argv[1] == "all" else [sys.argv[1]]
    os.makedirs(OUT, exist_ok=True)
    for n in names:
        s = SHOTS[n](preview)
        s.render.filepath = os.path.join(OUT, n + ("-preview" if preview else "") + ".png")
        bpy.ops.render.render(write_still=True)
        print("wrote", s.render.filepath, flush=True)
