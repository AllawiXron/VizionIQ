# The first 5 seconds of my ad reel as a Blender file, for rendering on my own machine with EEVEE. A paper stage: my
# orange under my paper texture, the cut-outs standing a few centimetres off it so one soft light throws their shadows
# on it, and every word as raised paper letters that fold up off the page on the voice. One slow camera glide carries
# the frame from the first idea to the next. Everything is packed into the file, sound included.
# Build: blender -b -P build.py -- out/allawi_reel_test.blend [still times in seconds, rendered with Cycles to check]
import bpy, json, math, os, sys
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
EL = os.path.join(HERE, "../rm-allawi-ad-reel/public/el")
PAPER = os.path.join(HERE, "../rm-allawi-ad-reel/public/img/paper.jpg")
AUDIO = os.path.join(HERE, "../ae-core-reel/media/audio")
TYPE = os.path.join(HERE, "type")
FPS, END = 30, 5.5

ORANGE = (0.886, 0.33, 0.106)
CREAM = (0.925, 0.89, 0.83)
BROWN = (0.122, 0.082, 0.063)


def lin(c):
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1,)


def f(t):
    return round(t * FPS) + 1


# ───── keys ─────

def key(o, path, t, value, interp="QUART", easing="EASE_OUT", index=-1):
    if isinstance(value, (tuple, list)):
        setattr(o, path, value)
    elif index >= 0:
        getattr(o, path)[index] = value
    else:
        setattr(o, path, value)
    o.keyframe_insert(path, index=index, frame=f(t))
    fc = o.animation_data.action.fcurves
    for c in fc:
        if c.data_path == path and (index < 0 or c.array_index == index):
            for k in c.keyframe_points:
                if abs(k.co.x - f(t)) < 0.01:
                    k.interpolation = interp
                    k.easing = easing


def move(o, path, t0, t1, a, b, interp="QUART", easing="EASE_OUT", index=-1):
    key(o, path, t0, a, interp, easing, index)
    key(o, path, t1, b, interp, easing, index)


# ───── materials ─────

def paint(name, colour, rough=0.7):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(colour)
    b.inputs["Roughness"].default_value = rough
    return m


def paper_material():
    m = bpy.data.materials.new("orange paper")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = bpy.data.images.load(PAPER)
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 0.55
    mix.inputs["A"].default_value = lin(ORANGE)
    nt.links.new(t.outputs["Color"], mix.inputs["B"])
    nt.links.new(mix.outputs["Result"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.9
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.15
    nt.links.new(t.outputs["Color"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


# ───── the stage: 1 m is 1000 px of the frame; the paper is the plane y = 0, the camera looks along +y ─────

def at(shot, px, py, depth=0.0):
    sx, sz = shot
    return Vector((sx + (px - 540) / 1000, -depth, sz + (960 - py) / 1000))


def card(name, png, shot, left, top, w, depth, hidden=True):
    im = bpy.data.images.load(os.path.join(EL, png))
    iw, ih = im.size
    h = w * ih / iw
    bpy.ops.mesh.primitive_plane_add(size=1)
    o = bpy.context.object
    o.name = name
    o.scale = (w / 1000, h / 1000, 1)
    bpy.ops.object.transform_apply(scale=True)
    o.rotation_euler = (math.radians(90), 0, 0)
    o.location = at(shot, left + w / 2, top + h / 2, depth)
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = im
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    nt.links.new(t.outputs["Alpha"], b.inputs["Alpha"])
    nt.links.new(t.outputs["Color"], b.inputs["Emission Color"])
    b.inputs["Emission Strength"].default_value = 0.18
    b.inputs["Roughness"].default_value = 0.6
    m.use_transparent_shadow = True
    o.data.materials.append(m)
    o.visible_shadow = True
    return o


# a word as raised paper letters (its outline merged into whole shapes, see arabic_svg.py), its origin on the middle
# of its baseline so it can fold up from there
def word(name, wid, shot, cx, base_y, size, colour, depth=0.012):
    d = json.load(open(os.path.join(TYPE, wid + ".json")))
    em = size / 1000
    objs = []
    for gi, loops in enumerate(d["shapes"]):
        cu = bpy.data.curves.new(f"{name} {gi}", "CURVE")
        cu.dimensions = "2D"
        cu.fill_mode = "BOTH"
        # square edges: joined glyphs overlap, and a rounded edge would show as a seam at every join
        cu.extrude = depth / em
        for loop in loops:
            sp = cu.splines.new("POLY")
            sp.points.add(len(loop) - 1)
            for p, (px, py) in zip(sp.points, loop):
                p.co = (px - d["width"] / 2, py, 0, 1)
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
    o.scale = (em, em, em)
    o.location = at(shot, cx, base_y, depth + 0.004)
    o.rotation_euler = (0, 0, 0)
    o.data.materials.append(paint(name, colour))
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(30))
    return o, d["width"] * size


# a line of words set right to left from the right edge of its column, centred on the frame
def line(shot, words, base_y, size, gap=0.28):
    widths = [json.load(open(os.path.join(TYPE, w + ".json")))["width"] * size for w, *_ in words]
    total = sum(widths) + gap * size * (len(words) - 1)
    x = 540 + total / 2
    out = []
    for (wid, colour, name), w in zip(words, widths):
        o, _ = word(name, wid, shot, x - w / 2, base_y, size, colour)
        out.append(o)
        x -= w + gap * size
    return out


# a word comes up out of the page: folded flat its letters go back through the paper, and it folds up on its baseline
def stand(o, t, d=0.42):
    move(o, "rotation_euler", t, t + d, 0.0, math.radians(90), "QUART", "EASE_OUT", index=0)
    show(o, t)


def lie(o, t, d=0.3):
    move(o, "rotation_euler", t, t + d, math.radians(90), 0.0, "CUBIC", "EASE_IN", index=0)
    show(o, t + d, False)


# an object takes part in the render only from (or until) a time
def show(o, t, on=True):
    o.hide_render = on
    o.keyframe_insert("hide_render", frame=max(1, f(t) - 1))
    o.hide_render = not on
    o.keyframe_insert("hide_render", frame=f(t))


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = "allawi reel"
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = 1, f(END)
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "Medium Contrast"
    sc.view_settings.exposure = -0.3
    sc.render.use_motion_blur = True
    sc.render.motion_blur_shutter = 0.5
    for engine in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        try:
            sc.render.engine = engine
            break
        except TypeError:
            pass
    ee = sc.eevee
    ee.taa_render_samples = 64
    for k, v in (("use_shadows", True), ("shadow_ray_count", 2), ("shadow_step_count", 12)):
        if hasattr(ee, k):
            setattr(ee, k, v)

    w = bpy.data.worlds.new("room")
    sc.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = lin((0.55, 0.42, 0.36))
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.55

    bpy.ops.mesh.primitive_plane_add(size=1, location=(1.0, 0.0, 0.0))
    p = bpy.context.object
    p.name = "paper"
    p.scale = (7.0, 5.0, 1)
    p.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.uv.cube_project(cube_size=1.9)
    bpy.ops.object.mode_set(mode="OBJECT")
    p.data.materials.append(paper_material())

    # the camera, and a soft light from the upper left that travels with it
    A, B = (0.0, 0.0), (1.55, -0.35)
    bpy.ops.object.empty_add(location=at(A, 540, 960))
    rig = bpy.context.object
    rig.name = "camera rig"
    bpy.ops.object.camera_add(location=rig.location + Vector((0, -4.53, 0)))
    cam = bpy.context.object
    cam.name = "camera"
    cam.rotation_euler = (math.radians(90), 0, 0)
    cam.data.lens = 85
    cam.parent = rig
    cam.location = (0, -4.53, 0)
    sc.camera = cam
    bpy.ops.object.light_add(type="AREA", location=(0, 0, 0))
    key_light = bpy.context.object
    key_light.name = "soft light"
    key_light.data.energy = 380
    key_light.data.size = 1.6
    key_light.data.color = (1.0, 0.9, 0.8)
    key_light.parent = rig
    key_light.location = (-1.6, -2.2, 1.7)
    key_light.rotation_euler = (Vector((0.2, 0, -0.1)) - key_light.location).to_track_quat("-Z", "Y").to_euler()
    bpy.ops.object.light_add(type="AREA", location=(0, 0, 0))
    fill = bpy.context.object
    fill.name = "fill"
    fill.data.energy = 90
    fill.data.size = 2.5
    fill.parent = rig
    fill.location = (1.8, -2.5, -0.6)
    fill.rotation_euler = (Vector((0, 0, 0)) - fill.location).to_track_quat("-Z", "Y").to_euler()

    # a slow push while the first idea is said, then one glide down and right to the next
    move(rig, "location", 0.0, 2.32, tuple(rig.location), tuple(rig.location + Vector((0.02, 0.0, -0.03))), "SINE", "EASE_IN_OUT")
    move(rig, "location", 2.32, 2.92, tuple(rig.location + Vector((0.02, 0.0, -0.03))), tuple(at(B, 540, 960)), "QUINT", "EASE_IN_OUT")
    move(cam, "location", 0.0, 2.32, (0, -4.53, 0), (0, -4.25, 0), "SINE", "EASE_IN_OUT")
    move(cam, "location", 2.32, 2.92, (0, -4.25, 0), (0, -4.53, 0), "QUINT", "EASE_IN_OUT")
    move(cam, "rotation_euler", 2.32, 2.62, math.radians(0), math.radians(-2.5), "SINE", "EASE_OUT", index=1)
    move(cam, "rotation_euler", 2.62, 2.92, math.radians(-2.5), 0.0, "SINE", "EASE_IN_OUT", index=1)

    # ───── A · مشروعك متعوب عليه، بس أرباحك قليلة ─────
    l1 = line(A, [("w01", CREAM, "مشروعك"), ("w02", CREAM, "متعوب")], 400, 128)
    l2 = line(A, [("w03", CREAM, "عليه،"), ("w04", CREAM, "بس")], 560, 128)
    profit = line(A, [("w05", CREAM, "أرباحك")], 880, 300)[0]
    few = line(A, [("w06", BROWN, "قليلة؟")], 1110, 220)[0]
    for o, t in zip(l1 + l2 + [profit], (0.0, 0.56, 0.88, 1.38, 1.66)):
        stand(o, t)
    # «قليلة؟» falls onto the page and settles
    few.rotation_euler = (math.radians(90), 0, 0)
    z = few.location.z
    move(few, "location", 2.1, 2.36, (few.location.x, few.location.y, z + 1.2), (few.location.x, few.location.y, z), "QUAD", "EASE_IN")
    key(few, "rotation_euler", 2.1, math.radians(-9), "QUAD", "EASE_IN", index=1)
    move(few, "rotation_euler", 2.36, 2.56, math.radians(-9), math.radians(-3), "QUART", "EASE_OUT", index=1)
    show(few, 2.1)

    wallet = card("wallet", "wallet.png", A, 40, 1150, 1000, 0.05)
    wl = wallet.location.copy()
    move(wallet, "location", 0.0, 0.7, tuple(wl + Vector((0, 0, -0.5))), tuple(wl), "QUART", "EASE_OUT")
    move(wallet, "location", 2.42, 2.52, tuple(wl), tuple(wl + Vector((0, 0, 0.025))), "QUAD", "EASE_OUT")
    move(wallet, "location", 2.52, 2.75, tuple(wl + Vector((0, 0, 0.025))), tuple(wl), "QUART", "EASE_OUT")
    coin = card("coin", "coin.png", A, 450, 1020, 170, 0.035)
    cl = coin.location.copy()
    move(coin, "location", 1.95, 2.45, tuple(cl + Vector((0.04, 0, 1.25))), tuple(cl + Vector((0, 0, -0.18))), "QUAD", "EASE_IN")
    move(coin, "rotation_euler", 1.95, 2.45, math.radians(-160), math.radians(0), "QUAD", "EASE_OUT", index=1)

    # ───── B · عدنا نصمملك موشن جرافيك وبوستات إعلانية ─────
    b1 = line(B, [("w07", CREAM, "عدنا"), ("w08", BROWN, "نصمملك")], 380, 128)
    b2 = line(B, [("w09", CREAM, "موشن"), ("w10", CREAM, "جرافيك")], 590, 165)
    for o, t in zip(b1 + b2, (2.65, 2.91, 3.45, 3.73)):
        stand(o, t)
        lie(o, 4.08)
    b3 = line(B, [("w11", CREAM, "وبوستات")], 420, 170)
    b4 = line(B, [("w12", BROWN, "إعلانية")], 740, 250)
    stand(b3[0], 4.2)
    stand(b4[0], 4.73, 0.5)

    film = card("film camera", "film-camera.png", B, 300, 880, 940, 0.06)
    fl = film.location.copy()
    move(film, "location", 2.6, 3.3, tuple(fl + Vector((1.0, 0, 0))), tuple(fl), "QUART", "EASE_OUT")
    move(film, "location", 4.05, 4.5, tuple(fl), tuple(fl + Vector((1.2, 0, 0))), "CUBIC", "EASE_IN")
    show(film, 4.5, False)
    box = card("box in hand", "box-hand.png", B, -60, 1080, 1100, 0.05)
    bl = box.location.copy()
    show(box, 4.2)
    move(box, "location", 4.2, 4.85, tuple(bl + Vector((-1.25, 0, 0))), tuple(bl), "QUART", "EASE_OUT")
    move(box, "location", 4.85, 5.3, tuple(bl), tuple(bl + Vector((0, 0, 0.03))), "SINE", "EASE_IN_OUT")

    # ───── the sound: the voice and its cues for these seconds ─────
    se = sc.sequence_editor_create()
    cues = sound_cues()
    for i, c in enumerate(cues):
        if c["t"] > END:
            continue
        s = se.sequences.new_sound(c["name"], os.path.join(AUDIO, c["file"] + ".wav"), 1 + i % 30, f(c["t"]))
        s.volume = c["gain"]

    out = sc.render
    out.image_settings.file_format = "FFMPEG"
    out.ffmpeg.format = "MPEG4"
    out.ffmpeg.codec = "H264"
    out.ffmpeg.constant_rate_factor = "HIGH"
    out.ffmpeg.audio_codec = "AAC"
    out.ffmpeg.audio_bitrate = 192
    out.filepath = "//allawi_reel_test.mp4"
    return sc


# the same cue list the browser reel uses (reel/sound.js), read here without a JS runtime
def sound_cues():
    import re
    src = open(os.path.join(HERE, "../ae-core-reel/reel/sound.js"), encoding="utf8").read()
    npop = re.findall(r'\["(npop\d)", ([\d.]+)\]', src)
    ppop = re.findall(r'\["(ppop\d)", ([\d.]+)\]', src)
    words = re.findall(r"\[([\d.]+), (true|false)\]", src)
    fx = re.findall(r'\[([\d.]+), "([a-z]+)", ([\d.]+)\]', src)
    out = [{"t": 0.0, "file": "voice", "gain": 1.0, "name": "voice"}]
    ni = pi = 0
    for i, (t, k) in enumerate(words):
        n, g = (ppop[pi % 4] if k == "true" else npop[ni % 5])
        if k == "true":
            pi += 1
        else:
            ni += 1
        out.append({"t": round((float(t) + 0.02) * 30) / 30, "file": n, "gain": float(g), "name": f"pop {i + 1}"})
    for t, n, g in fx:
        out.append({"t": round(float(t) * 30) / 30, "file": n, "gain": float(g), "name": n})
    return out


if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1:]
    path = os.path.abspath(args[0])
    sc = build()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.file.pack_all()
    # packed files keep only a plain name of their own, not where they came from on this machine
    for im in bpy.data.images:
        if im.packed_file:
            im.filepath = im.filepath_raw = "//footage/" + os.path.basename(im.filepath)
    for snd in bpy.data.sounds:
        snd.filepath = "//sound/" + os.path.basename(snd.filepath)
    bpy.ops.wm.save_as_mainfile(filepath=path, compress=True)
    # stills to check here, with Cycles (this machine has no GPU for EEVEE)
    if len(args) > 1:
        sc.render.engine = "CYCLES"
        sc.cycles.samples = 24
        sc.cycles.use_denoising = True
        sc.render.image_settings.file_format = "PNG"
        for t in args[1:]:
            sc.frame_set(f(float(t)))
            sc.render.filepath = os.path.join(os.path.dirname(path), f"still-{float(t):.2f}.png")
            bpy.ops.render.render(write_still=True)
