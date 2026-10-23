/* Builds my ad reel as an After Effects project: a 1080x1920, 60 fps comp with a 3D camera rig, every cut-out, every
   word as an editable text layer, the voice and every sound cue, all on the timing of the browser engine. Then it saves
   allawi_reel.aep and allawi_reel.aepx next to this file.

   Before running: install DG Sahabah (footage/fonts), keep the footage folder next to this file.
   Run: File > Scripts > Run Script File... and pick this file. */

#target aftereffects

(function () {
    var DOC = /*DOC*/null;

    var ROOT = File($.fileName).parent;
    var notes = [];
    var note = function (s) { if (notes.length < 40) notes.push(s); };
    var safe = function (label, fn) { try { return fn(); } catch (e) { note(label + ": " + e.toString()); } };

    if (!DOC) { alert("The reel data is missing from this script."); return; }
    if (!new Folder(ROOT.fsName + "/footage").exists) { alert("Keep the footage folder next to this script:\n" + ROOT.fsName); return; }

    app.newProject();
    if (!app.project) return;
    app.beginUndoGroup("Build allawi reel");
    safe("expression engine", function () { app.project.expressionEngine = "javascript-1.0"; });

    var C = DOC.comp;
    var comp = app.project.items.addComp(C.name, C.w, C.h, 1, C.duration, C.fps);
    comp.bgColor = C.colour;
    comp.motionBlur = true;
    safe("shutter", function () { comp.shutterAngle = 720; comp.shutterPhase = -360; comp.motionBlurSamplesPerFrame = 32; });
    safe("renderer", function () { comp.renderer = "ADBE Advanced 3d"; });

    // footage, one item per file, in folders
    var bins = {};
    var bin = function (name) {
        if (!bins[name]) { bins[name] = app.project.items.addFolder(name); }
        return bins[name];
    };
    var items = {};
    var footage = function (rel) {
        if (items[rel]) return items[rel];
        var f = new File(ROOT.fsName + "/footage/" + rel);
        if (!f.exists) { note("missing " + rel); return null; }
        var item = app.project.importFile(new ImportOptions(f));
        var top = rel.split("/")[0];
        item.parentFolder = bin(top === "el" ? "cut-outs" : top === "audio" ? "sound" : top === "clips" ? "reels" : "textures");
        items[rel] = item;
        return item;
    };

    var TR = "ADBE Transform Group";
    var tprop = function (l, name) { return l.property(TR).property(name); };

    var setText = function (l, T) {
        var p = l.property("ADBE Text Properties").property("ADBE Text Document");
        var td = p.value;
        safe("text style", function () { td.resetCharStyle(); td.resetParagraphStyle(); });
        td.text = T.str;
        td.font = DOC.font;
        td.fontSize = T.size;
        if (T.fill) { td.applyFill = true; td.fillColor = T.fill; } else { td.applyFill = false; }
        if (T.stroke) {
            td.applyStroke = true; td.strokeColor = T.stroke; td.strokeWidth = T.strokeWidth;
            safe("stroke", function () { td.strokeOverFill = true; });
        } else { td.applyStroke = false; }
        td.justification = T.just === "r" ? ParagraphJustification.RIGHT_JUSTIFY : ParagraphJustification.CENTER_JUSTIFY;
        td.tracking = 0;
        if (T.leading) { safe("leading", function () { td.autoLeading = false; td.leading = T.leading; }); }
        if (typeof ParagraphDirection !== "undefined") {
            safe("direction", function () { td.direction = T.ltr ? ParagraphDirection.DIRECTION_LEFT_TO_RIGHT : ParagraphDirection.DIRECTION_RIGHT_TO_LEFT; });
        }
        p.setValue(td);
    };

    var buildShape = function (l, S) {
        var g = l.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var c = g.property("ADBE Vectors Group");
        if (S.kind === "rect") {
            var r = c.addProperty("ADBE Vector Shape - Rect");
            r.property("ADBE Vector Rect Size").setValue(S.size);
            r.property("ADBE Vector Rect Position").setValue(S.pos);
            r.property("ADBE Vector Rect Roundness").setValue(S.round);
        } else {
            var s = c.addProperty("ADBE Vector Shape - Star");
            s.property("ADBE Vector Star Type").setValue(1);
            s.property("ADBE Vector Star Points").setValue(S.points);
            s.property("ADBE Vector Star Outer Radius").setValue(S.outer);
            s.property("ADBE Vector Star Inner Radius").setValue(S.inner);
            safe("star turn", function () { s.property("ADBE Vector Star Rotation").setValue(90); });
        }
        var f = c.addProperty("ADBE Vector Graphic - Fill");
        f.property("ADBE Vector Fill Color").setValue([S.colour[0], S.colour[1], S.colour[2], 1]);
    };

    var KAPPA = 0.5523;
    var addMask = function (l, M) {
        var e = M.ellipse, cx = e[0], cy = e[1], rx = e[2], ry = e[3];
        var s = new Shape();
        s.vertices = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
        s.inTangents = [[-KAPPA * rx, 0], [0, -KAPPA * ry], [KAPPA * rx, 0], [0, KAPPA * ry]];
        s.outTangents = [[KAPPA * rx, 0], [0, KAPPA * ry], [-KAPPA * rx, 0], [0, -KAPPA * ry]];
        s.closed = true;
        var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        m.property("ADBE Mask Shape").setValue(s);
        m.property("ADBE Mask Feather").setValue([M.feather, M.feather]);
        if (M.inverted) m.inverted = true;
    };

    // keys with the tween's ease: speed and influence for every dimension from its Bezier and the move between the keys
    var dims = function (v) { return v instanceof Array ? v.length : 1; };
    var at = function (v, d) { return v instanceof Array ? v[d] : v; };
    var applyKeys = function (prop, K) {
        var i, k, n = K.length;
        for (i = 0; i < n; i++) prop.setValueAtTime(K[i].t, K[i].v);
        if (prop.propertyValueType === PropertyValueType.TEXT_DOCUMENT) return;
        var spatial = prop.isSpatial;
        for (i = 0; i < n; i++) {
            k = K[i];
            var idx = i + 1;
            var inType = KeyframeInterpolationType.BEZIER, outType = KeyframeInterpolationType.BEZIER;
            if (k.lin || (i > 0 && K[i - 1].lin && !k.i)) inType = KeyframeInterpolationType.LINEAR;
            if (k.lin && !k.o) outType = KeyframeInterpolationType.LINEAR;
            if (k.hold) outType = KeyframeInterpolationType.HOLD;
            prop.setInterpolationTypeAtKey(idx, inType, outType);
            if (inType !== KeyframeInterpolationType.BEZIER && outType !== KeyframeInterpolationType.BEZIER) continue;
            var nd = spatial ? 1 : dims(k.v), eIn = [], eOut = [], d;
            for (d = 0; d < nd; d++) {
                var sIn = 0, fIn = 33.333, sOut = 0, fOut = 33.333;
                if (k.i && i > 0) {
                    var p = K[i - 1], dt = k.t - p.t;
                    var dv = spatial ? dist(p.v, k.v) : at(k.v, d) - at(p.v, d);
                    fIn = Math.max(0.1, Math.min(100, (1 - k.i[0]) * 100));
                    sIn = (1 - k.i[0]) > 1e-4 ? ((1 - k.i[1]) / (1 - k.i[0])) * dv / dt : 0;
                }
                if (k.o && i < n - 1) {
                    var q = K[i + 1], dt2 = q.t - k.t;
                    var dv2 = spatial ? dist(k.v, q.v) : at(q.v, d) - at(k.v, d);
                    fOut = Math.max(0.1, Math.min(100, k.o[0] * 100));
                    sOut = k.o[0] > 1e-4 ? (k.o[1] / k.o[0]) * dv2 / dt2 : 0;
                }
                eIn.push(new KeyframeEase(sIn, fIn));
                eOut.push(new KeyframeEase(sOut, fOut));
            }
            prop.setTemporalEaseAtKey(idx, eIn, eOut);
        }
    };
    var dist = function (a, b) {
        var s = 0, j;
        for (j = 0; j < a.length; j++) s += (b[j] - a[j]) * (b[j] - a[j]);
        return Math.sqrt(s);
    };
    var setOrKey = function (prop, value, K, label) {
        safe(label, function () {
            if (K && K.length) applyKeys(prop, K); else if (value !== undefined && value !== null) prop.setValue(value);
        });
    };

    // ───── make every layer, bottom of the stack first (each new layer goes on top) ─────
    var L = DOC.layers, made = {}, i, d, l;
    for (i = 0; i < L.length; i++) {
        d = L[i];
        l = null;
        if (d.type === "null") { l = comp.layers.addNull(C.duration); }
        else if (d.type === "footage" || d.type === "audio") {
            var it = footage(d.src);
            if (!it) continue;
            l = comp.layers.add(it);
        }
        else if (d.type === "text") { l = comp.layers.addText(d.text.str); setText(l, d.text); }
        else if (d.type === "shape") { l = comp.layers.addShape(); buildShape(l, d.shape); }
        else if (d.type === "solid") { l = comp.layers.addSolid(d.solid.colour, d.name, d.solid.size[0], d.solid.size[1], 1); }
        else if (d.type === "adjustment") { l = comp.layers.addSolid([1, 1, 1], d.name, C.w, C.h, 1); l.adjustmentLayer = true; }
        else if (d.type === "camera") {
            l = comp.layers.addCamera(d.name, [C.w / 2, C.h / 2]);
            l.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
            l.property("ADBE Camera Options Group").property("ADBE Camera Zoom").setValue(d.zoom);
        }
        if (!l) continue;
        l.name = d.name;
        if (d.three) l.threeDLayer = true;
        if (d.blend === "multiply") l.blendingMode = BlendingMode.MULTIPLY;
        if (d.blend === "overlay") l.blendingMode = BlendingMode.OVERLAY;
        if (d.type === "audio") {
            l.startTime = d.start;
            safe("level " + d.name, function () { l.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([d.gain, d.gain]); });
        }
        made[d.id] = l;
    }

    // parents, without moving anything: every value below is already in its parent's space
    for (i = 0; i < L.length; i++) {
        d = L[i];
        if (d.parent && made[d.id] && made[d.parent]) made[d.id].setParentWithJump(made[d.parent]);
    }

    for (i = 0; i < L.length; i++) {
        d = L[i];
        l = made[d.id];
        if (!l) continue;
        var T = d.tf || {}, K = d.keys || {}, X = d.expr || {};
        if (d.type !== "audio") {
            if (d.start !== undefined) l.startTime = d.start;
            if (d.in !== undefined) safe("in " + d.name, function () { l.inPoint = d["in"]; });
            if (d.out !== undefined) safe("out " + d.name, function () { l.outPoint = d.out; });
        }
        if (d.type !== "audio" && d.type !== "adjustment") {
            if (T.anchor && d.type !== "camera") setOrKey(tprop(l, "ADBE Anchor Point"), d.three ? T.anchor : [T.anchor[0], T.anchor[1]], null, "anchor " + d.name);
            var pos = tprop(l, "ADBE Position");
            var split = !!(K.px || K.py || K.pz || X.py);
            if (split) safe("separate " + d.name, function () { pos.dimensionsSeparated = true; });
            if (split && pos.dimensionsSeparated) {
                setOrKey(tprop(l, "ADBE Position_0"), T.pos ? T.pos[0] : null, K.px, "x " + d.name);
                setOrKey(tprop(l, "ADBE Position_1"), T.pos ? T.pos[1] : null, K.py, "y " + d.name);
                if (d.three || d.type === "camera") setOrKey(tprop(l, "ADBE Position_2"), T.pos ? T.pos[2] : null, K.pz, "z " + d.name);
                if (X.py) safe("float " + d.name, function () { tprop(l, "ADBE Position_1").expression = X.py; });
            } else if (split && K.pz && !K.px && !K.py) {
                // a camera whose position cannot be split: whole-vector keys on z alone
                var PK = [], j;
                for (j = 0; j < K.pz.length; j++) PK.push({ t: K.pz[j].t, v: [T.pos[0], T.pos[1], K.pz[j].v], i: K.pz[j].i, o: K.pz[j].o, hold: K.pz[j].hold, lin: K.pz[j].lin });
                setOrKey(pos, null, PK, "position " + d.name);
            } else if (T.pos) {
                setOrKey(pos, d.three || d.type === "camera" ? T.pos : [T.pos[0], T.pos[1]], null, "position " + d.name);
            }
            if (T.rz !== undefined || K.rz) setOrKey(tprop(l, d.three || d.type === "camera" ? "ADBE Rotate Z" : "ADBE Rotate Z"), T.rz, K.rz, "rotation " + d.name);
            if (X.rz) safe("sway " + d.name, function () { tprop(l, "ADBE Rotate Z").expression = X.rz; });
            if ((T.ry || K.ry) && d.three) setOrKey(tprop(l, "ADBE Rotate Y"), T.ry, K.ry, "turn " + d.name);
            if (d.type !== "camera") {
                if (T.scale !== undefined || K.scale) setOrKey(tprop(l, "ADBE Scale"), T.scale !== undefined ? (d.three ? T.scale : [T.scale[0], T.scale[1]]) : null, K.scale, "scale " + d.name);
                if (T.opacity !== undefined || K.opacity) setOrKey(tprop(l, "ADBE Opacity"), T.opacity, K.opacity, "opacity " + d.name);
            }
        }
        if (K.text) safe("source text " + d.name, function () {
            var sp = l.property("ADBE Text Properties").property("ADBE Text Document"), j2;
            for (j2 = 0; j2 < K.text.length; j2++) { var td = sp.value; td.text = K.text[j2].v; sp.setValueAtTime(K.text[j2].t, td); }
        });
        if (d.masks) for (j = 0; j < d.masks.length; j++) safe("mask " + d.name, function () { addMask(l, d.masks[j]); });
        if (d.effects) {
            for (j = 0; j < d.effects.length; j++) {
                var E = d.effects[j];
                var fx = safe("effect " + E.match, function () { return l.property("ADBE Effect Parade").addProperty(E.match); });
                if (!fx || !E.props) continue;
                for (var pm in E.props) {
                    if (E.props.hasOwnProperty(pm)) safe(pm + " on " + d.name, function () { fx.property(pm).setValue(E.props[pm]); });
                }
            }
        }
        if (d.fxKeys) {
            for (var fk in d.fxKeys) {
                if (!d.fxKeys.hasOwnProperty(fk) || !d.fxKeys[fk]) continue;
                var parts = fk.split(":");
                safe("effect keys " + d.name, function () { applyKeys(l.property("ADBE Effect Parade").property(parseInt(parts[0], 10)).property(parts[1]), d.fxKeys[fk]); });
            }
        }
        if (d.type !== "audio" && d.type !== "camera") safe("motion blur " + d.name, function () { l.motionBlur = true; });
    }

    // track mattes: newer versions take the matte by reference, older ones use the layer right above
    for (i = 0; i < L.length; i++) {
        d = L[i];
        if (!d.matte || !made[d.id] || !made[d.matte]) continue;
        l = made[d.id];
        var m = made[d.matte];
        if (typeof l.setTrackMatte === "function") {
            safe("matte " + d.name, function () { l.setTrackMatte(m, TrackMatteType.ALPHA); m.enabled = false; });
        } else {
            safe("matte " + d.name, function () { if (m.index !== l.index - 1) m.moveBefore(l); l.trackMatteType = TrackMatteType.ALPHA; });
        }
    }
    for (i = 0; i < L.length; i++) {
        if (L[i].isMatte && made[L[i].id]) safe("hide matte", function () { made[L[i].id].shy = true; });
    }

    comp.openInViewer();
    app.endUndoGroup();

    var saved = safe("save", function () {
        app.project.save(new File(ROOT.fsName + "/allawi_reel.aep"));
        app.project.save(new File(ROOT.fsName + "/allawi_reel.aepx"));
        return true;
    });
    var msg = "The reel is built: " + comp.numLayers + " layers in " + C.name + ".";
    if (saved) msg += "\nSaved allawi_reel.aep and allawi_reel.aepx in\n" + ROOT.fsName;
    if (notes.length) msg += "\n\nNotes:\n" + notes.join("\n");
    alert(msg);
})();
