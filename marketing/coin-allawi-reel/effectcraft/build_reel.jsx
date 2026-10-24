// The Orange Coin as an EffectCraft project, built from reel.json beside this script:
//   effectcraft-cli script build_reel.jsx --empty --save-as allawi_orange_coin.ecproj
// or, with a project saved in this folder, File > Scripts > Run Script File... in EffectCraft. Install DG Sahabah
// (fonts/) first.
// Every word is an editable text layer, every cut-out a footage layer, the camera worlds are nulls you can move, and
// each clipped scene is a comp with its mask on its layer. The voice and the 47 sound cues sit at the bottom of the
// main comp as green audio layers, and SFX_TIMELINE carries a green marker per cue.
(function () {
  var here = File($.fileName).parent.fsName;
  function readJson(p) {
    var f = File(p);
    f.encoding = "UTF-8";
    f.open("r");
    var s = f.read();
    f.close();
    return JSON.parse(s);
  }
  var R = readJson(here + "/reel.json"), FPS = R.fps, D = R.duration, GREEN = 9, YELLOW = 2;
  var FONT = "DG Sahabah";
  var footage = {}, comps = [], folder = {};

  function bin(name) {
    if (!folder[name]) folder[name] = app.project.items.addFolder(name);
    return folder[name];
  }
  function file(name) {
    if (!footage[name]) {
      footage[name] = app.project.importFile(new ImportOptions(File(here + "/footage/" + name)));
      footage[name].parentFolder = bin(/\.(wav)$/.test(name) ? "sound" : "footage");
    }
    return footage[name];
  }
  var tr = function (L, m) { return L.property("ADBE Transform Group").property(m); };

  // a track from reel.json: one value, or keys at times
  function put(prop, track, map) {
    if (!track) return;
    map = map || function (v) { return v; };
    if (track.t.length === 1) { prop.setValue(map(track.v[0])); return; }
    for (var i = 0; i < track.t.length; i++) prop.setValueAtTime(track.t[i], map(track.v[i]));
  }
  function shape(p) {
    var s = new Shape();
    s.vertices = p.v;
    s.inTangents = p.i;
    s.outTangents = p.o;
    s.closed = true;
    return s;
  }
  function rect(contents, name, w, h, r, fill, stroke, sw) {
    var g = contents.addProperty("ADBE Vector Group");
    g.name = name;
    var v = g.property("ADBE Vectors Group");
    var shp = v.addProperty("ADBE Vector Shape - Rect");
    shp.property("ADBE Vector Rect Size").setValue([w, h]);
    shp.property("ADBE Vector Rect Roundness").setValue(r);
    if (fill) v.addProperty("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue(fill);
    if (stroke) {
      var st = v.addProperty("ADBE Vector Graphic - Stroke");
      st.property("ADBE Vector Stroke Color").setValue(stroke);
      st.property("ADBE Vector Stroke Width").setValue(sw);
    }
  }
  function shadows(L, list) {
    for (var i = 0; list && i < list.length; i++) {
      var s = list[i], fx = L.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
      fx.property("ADBE Drop Shadow-0001").setValue([s.color[0], s.color[1], s.color[2], 1]);
      fx.property("ADBE Drop Shadow-0002").setValue(100 * s.color[3]);
      fx.property("ADBE Drop Shadow-0003").setValue(Math.atan2(s.dx, -s.dy) * 180 / Math.PI);
      fx.property("ADBE Drop Shadow-0004").setValue(Math.sqrt(s.dx * s.dx + s.dy * s.dy));
      fx.property("ADBE Drop Shadow-0005").setValue(2 * s.sigma);
    }
  }

  // one layer of reel.json into comp C
  function make(C, l) {
    var L;
    if (l.type === "solid") {
      L = C.layers.addSolid([l.color[0], l.color[1], l.color[2]], l.name, l.w, l.h, 1, D);
    } else if (l.type === "null") {
      L = C.layers.addNull(D);
    } else if (l.type === "comp") {
      L = C.layers.add(comps[l.comp]);
    } else if (l.type === "footage") {
      L = C.layers.add(file(l.file));
    } else if (l.type === "text") {
      var td = new TextDocument(l.text);
      td.font = FONT;
      td.fontSize = l.size;
      td.fillColor = [l.color[0], l.color[1], l.color[2]];
      td.applyStroke = false;
      td.justification = ParagraphJustification.CENTER_JUSTIFY;
      // Arabic paragraphs run right to left (a trailing comma sits at the left end of the word)
      if (/[\u0600-\u06ff]/.test(l.text)) {
        if (td.__set) td.__set("direction", "rtl");
        else if (typeof ParagraphDirection !== "undefined") td.direction = ParagraphDirection.DIRECTION_RIGHT_TO_LEFT;
      }
      L = C.layers.addText(td);
    } else if (l.type === "shape") {
      L = C.layers.addShape();
      var contents = L.property("ADBE Root Vectors Group");
      if (l.fill) rect(contents, "fill", l.w, l.h, l.radius, [l.fill[0], l.fill[1], l.fill[2]]);
      if (l.stroke) rect(contents, "edge", l.w - l.strokeW, l.h - l.strokeW, Math.max(0, l.radius - l.strokeW / 2), null, [l.stroke[0], l.stroke[1], l.stroke[2]], l.strokeW);
    }
    L.name = l.name;
    if (l.type === "footage" && l.start !== undefined) L.startTime = l.start;
    L.inPoint = Math.max(0, l["in"] || 0);
    L.outPoint = Math.min(D, l.out === undefined ? D : l.out);
    if (l.threeD) L.threeDLayer = true;
    if (l.audio === false) L.audioEnabled = false;
    if (l.blend === "multiply") L.blendingMode = BlendingMode.MULTIPLY;

    // anchor, position, scale, rotation, opacity
    if (l.anchor) tr(L, "ADBE Anchor Point").setValue(l.threeD ? [l.anchor[0], l.anchor[1], 0] : l.anchor);
    if (l.px || l.py) {
      tr(L, "ADBE Position").dimensionsSeparated = true;
      put(tr(L, "ADBE Position_0"), l.px);
      put(tr(L, "ADBE Position_1"), l.py);
    } else if (l.pos) {
      tr(L, "ADBE Position").setValue(l.threeD ? [l.pos[0], l.pos[1], 0] : l.pos);
    } else if (l.cover) {
      tr(L, "ADBE Position").setValue([l.cover[0] / 2, l.cover[1] / 2]);
    }
    if (l.cover) {
      var src = file(l.file), k = 100 * Math.max(l.cover[0] / src.width, l.cover[1] / src.height);
      tr(L, "ADBE Scale").setValue([k, k]);
    } else if (l.scale !== undefined) {
      if (typeof l.scale === "number") tr(L, "ADBE Scale").setValue(l.threeD ? [l.scale, l.scale, l.scale] : [l.scale, l.scale]);
      else put(tr(L, "ADBE Scale"), l.scale, function (v) { return l.threeD ? [v, v, v] : [v, v]; });
    }
    if (l.rot) put(tr(L, "ADBE Rotate Z"), l.rot);
    if (l.rx) put(tr(L, "ADBE Rotate X"), l.rx);
    if (l.ry) put(tr(L, "ADBE Rotate Y"), l.ry);
    if (typeof l.opacity === "number") tr(L, "ADBE Opacity").setValue(l.opacity);
    else if (l.opacity) put(tr(L, "ADBE Opacity"), l.opacity);

    if (l.mask) {
      var m = L.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
      m.name = "clip";
      put(m.property("ADBE Mask Shape"), l.mask, shape);
    }
    if (l.blur && !(l.blur.t.length === 1 && !l.blur.v[0])) {
      var b = L.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");
      put(b.property("ADBE Gaussian Blur 2-0001"), l.blur, function (v) { return 2 * v; });
    }
    shadows(L, l.shadows);
    // moving layers carry motion blur, as the page draws it
    if (l.px || l.py || (l.scale && l.scale.t) || l.rot) L.motionBlur = true;
    return L;
  }

  // every comp first, empty, so that comps can hold each other; then their layers from the bottom up
  for (var c = 0; c < R.comps.length; c++) {
    var spec = R.comps[c];
    comps[c] = app.project.items.addComp(spec.name, spec.w, spec.h, 1, D, FPS);
    comps[c].bgColor = [0, 0, 0];
    if (c !== R.main) comps[c].parentFolder = bin("scenes");
  }
  for (c = 0; c < R.comps.length; c++) {
    var C = comps[c], made = {}, list = R.comps[c].layers;
    C.motionBlur = true;
    C.shutterAngle = 180;
    for (var i = list.length - 1; i >= 0; i--) made[list[i].key] = make(C, list[i]);
    for (i = 0; i < list.length; i++) if (list[i].parent && made[list[i].parent]) made[list[i].key].setParentWithJump(made[list[i].parent]);
    // 3D layers see through a camera with the page's perspective (1400 px)
    var has3D = false;
    for (i = 0; i < list.length; i++) if (list[i].threeD) has3D = true;
    if (has3D) {
      var cam = C.layers.addCamera("perspective", [C.width / 2, C.height / 2]);
      cam.property("ADBE Camera Options Group").property("ADBE Camera Zoom").setValue(1400);
      tr(cam, "ADBE Position").setValue([C.width / 2, C.height / 2, -1400]);
    }
  }

  // sound: the voice, every cue as a green layer, and SFX_TIMELINE with a marker per cue
  var main = comps[R.main];
  var voice = main.layers.add(file(R.audio.voice));
  voice.name = "VOICE";
  voice.label = YELLOW;
  voice.moveToEnd();
  for (var q = 0; q < R.audio.cues.length; q++) {
    var cue = R.audio.cues[q], A = main.layers.add(file("sfx/" + cue.file));
    A.name = cue.name;
    A.startTime = cue.t;
    A.label = GREEN;
    A.comment = cue.at + " " + cue.kind;
    A.moveToEnd();
  }
  var track = main.layers.addNull(D);
  track.name = "SFX_TIMELINE";
  track.label = GREEN;
  for (q = 0; q < R.audio.cues.length; q++) {
    var mv = new MarkerValue(R.audio.cues[q].name);
    mv.duration = R.audio.cues[q].dur;
    track.property("ADBE Marker").setValueAtTime(R.audio.cues[q].t, mv);
  }
  main.openInViewer();
})();
