// Orange Coin: the sound design as an After Effects track.
// Run it with the comp open (File > Scripts > Run Script File...). It needs the sfx folder beside it, and uses
// voice.wav and allawi-orange-coin.mp4 too if they are there. Without an open comp it makes allawi_orange_coin
// (1080x1920, 60 fps, 41.2 s). Each cue lands as a green audio layer named after its track, and the null SFX_TIMELINE
// carries a green marker per cue, as long as the sound.
(function () {
  var D = 41.2, FPS = 60, GREEN = 9, YELLOW = 2;
  var CUES = [{"t":0.015,"dur":0.3684,"name":"Counting 8","kind":"count","file":"01_counting-8_count.wav","at":"0:00.02"},
    {"t":0.125,"dur":1.1049,"name":"Whoosh 1","kind":"whoosh1","file":"02_whoosh-1_whoosh1.wav","at":"0:00.13"},
    {"t":2.095,"dur":1.0255,"name":"Deep","kind":"deep","file":"03_deep_deep.wav","at":"0:02.10"},
    {"t":2.095,"dur":0.1289,"name":"UI Pop","kind":"slap","file":"04_ui-pop_slap.wav","at":"0:02.10"},
    {"t":2.735,"dur":0.9734,"name":"FireWhoosh","kind":"fire","file":"05_firewhoosh_fire.wav","at":"0:02.74"},
    {"t":3.445,"dur":0.1921,"name":"Whoosh 3","kind":"swipe","file":"06_whoosh-3_swipe.wav","at":"0:03.45"},
    {"t":3.495,"dur":0.2913,"name":"Counting 8","kind":"count","file":"07_counting-8_count.wav","at":"0:03.50"},
    {"t":4.165,"dur":0.2927,"name":"Whoosh 3","kind":"whoosh3","file":"08_whoosh-3_whoosh3.wav","at":"0:04.17"},
    {"t":5.165,"dur":0.7671,"name":"Whoosh 1","kind":"whoosh1","file":"09_whoosh-1_whoosh1.wav","at":"0:05.17"},
    {"t":5.375,"dur":0.275,"name":"UI Pop","kind":"pop","file":"10_ui-pop_pop.wav","at":"0:05.38"},
    {"t":6.595,"dur":0.8254,"name":"Deep","kind":"deep","file":"11_deep_deep.wav","at":"0:06.60"},
    {"t":7.755,"dur":0.2933,"name":"Whoosh 3","kind":"whoosh3","file":"12_whoosh-3_whoosh3.wav","at":"0:07.76"},
    {"t":8.015,"dur":0.32,"name":"UI Pop","kind":"lens","file":"13_ui-pop_lens.wav","at":"0:08.02"},
    {"t":8.195,"dur":0.9274,"name":"Whoosh 1","kind":"whoosh1","file":"14_whoosh-1_whoosh1.wav","at":"0:08.20"},
    {"t":9.045,"dur":0.6861,"name":"Whoosh 1","kind":"whoosh1","file":"15_whoosh-1_whoosh1.wav","at":"0:09.05"},
    {"t":9.215,"dur":1.5251,"name":"UI Pop","kind":"chime","file":"16_ui-pop_chime.wav","at":"0:09.22"},
    {"t":9.235,"dur":0.7254,"name":"Deep","kind":"deep","file":"17_deep_deep.wav","at":"0:09.24"},
    {"t":10.595,"dur":0.9875,"name":"Whoosh 1","kind":"whoosh1","file":"18_whoosh-1_whoosh1.wav","at":"0:10.60"},
    {"t":10.795,"dur":0.3306,"name":"Counting 8","kind":"count","file":"19_counting-8_count.wav","at":"0:10.80"},
    {"t":11.075,"dur":0.995,"name":"UI Pop","kind":"latch","file":"20_ui-pop_latch.wav","at":"0:11.08"},
    {"t":12.965,"dur":1.1178,"name":"Counting 8","kind":"count","file":"21_counting-8_count.wav","at":"0:12.97"},
    {"t":14.575,"dur":0.2923,"name":"Whoosh 3","kind":"whoosh3","file":"22_whoosh-3_whoosh3.wav","at":"0:14.58"},
    {"t":15.375,"dur":0.3998,"name":"Whoosh 3","kind":"whoosh3","file":"23_whoosh-3_whoosh3.wav","at":"0:15.38"},
    {"t":16.215,"dur":0.9726,"name":"FireWhoosh","kind":"fire","file":"24_firewhoosh_fire.wav","at":"0:16.22"},
    {"t":16.715,"dur":1.0255,"name":"Deep","kind":"deep","file":"25_deep_deep.wav","at":"0:16.72"},
    {"t":19.295,"dur":0.4549,"name":"UI Pop","kind":"stagger","file":"26_ui-pop_stagger.wav","at":"0:19.30"},
    {"t":21.715,"dur":0.9848,"name":"Whoosh 1","kind":"whoosh1","file":"27_whoosh-1_whoosh1.wav","at":"0:21.72"},
    {"t":23.255,"dur":1.1697,"name":"FireWhoosh","kind":"fire","file":"28_firewhoosh_fire.wav","at":"0:23.26"},
    {"t":24.985,"dur":0.275,"name":"UI Pop","kind":"pop","file":"29_ui-pop_pop.wav","at":"0:24.99"},
    {"t":25.365,"dur":0.275,"name":"UI Pop","kind":"pop","file":"30_ui-pop_pop.wav","at":"0:25.37"},
    {"t":25.435,"dur":0.275,"name":"UI Pop","kind":"pop","file":"31_ui-pop_pop.wav","at":"0:25.44"},
    {"t":25.925,"dur":0.9706,"name":"FireWhoosh","kind":"fire","file":"32_firewhoosh_fire.wav","at":"0:25.93"},
    {"t":25.965,"dur":1.0255,"name":"Deep","kind":"deep","file":"33_deep_deep.wav","at":"0:25.97"},
    {"t":25.985,"dur":0.4548,"name":"UI Pop","kind":"stagger","file":"34_ui-pop_stagger.wav","at":"0:25.99"},
    {"t":26.415,"dur":0.9708,"name":"FireWhoosh","kind":"fire","file":"35_firewhoosh_fire.wav","at":"0:26.42"},
    {"t":26.625,"dur":0.2924,"name":"Whoosh 3","kind":"whoosh3","file":"36_whoosh-3_whoosh3.wav","at":"0:26.63"},
    {"t":28.545,"dur":4.5862,"name":"Whoosh 1","kind":"whoosh1","file":"37_whoosh-1_whoosh1.wav","at":"0:28.55"},
    {"t":32.595,"dur":1.0255,"name":"Deep","kind":"deep","file":"38_deep_deep.wav","at":"0:32.60"},
    {"t":32.595,"dur":0.1568,"name":"UI Pop","kind":"slap","file":"39_ui-pop_slap.wav","at":"0:32.60"},
    {"t":34.365,"dur":0.2185,"name":"UI Pop","kind":"padlock","file":"40_ui-pop_padlock.wav","at":"0:34.37"},
    {"t":35.205,"dur":0.9701,"name":"FireWhoosh","kind":"fire","file":"41_firewhoosh_fire.wav","at":"0:35.21"},
    {"t":35.495,"dur":0.1792,"name":"UI Pop","kind":"phone","file":"42_ui-pop_phone.wav","at":"0:35.50"},
    {"t":36.855,"dur":0.275,"name":"UI Pop","kind":"stagger","file":"43_ui-pop_stagger.wav","at":"0:36.86"},
    {"t":36.955,"dur":0.2748,"name":"UI Pop","kind":"stagger","file":"44_ui-pop_stagger.wav","at":"0:36.96"},
    {"t":37.055,"dur":0.2748,"name":"UI Pop","kind":"stagger","file":"45_ui-pop_stagger.wav","at":"0:37.06"},
    {"t":39.375,"dur":0.4536,"name":"Whoosh 3","kind":"whoosh3","file":"46_whoosh-3_whoosh3.wav","at":"0:39.38"},
    {"t":39.815,"dur":0.0449,"name":"UI Pop","kind":"click","file":"47_ui-pop_click.wav","at":"0:39.82"}];
  var here = File($.fileName).parent, notes = [];
  function imp(f) {
    if (!f.exists) return null;
    try { return app.project.importFile(new ImportOptions(f)); } catch (e) { notes.push(f.name + ": " + e.toString()); return null; }
  }
  app.beginUndoGroup("SFX_TIMELINE");
  var comp = app.project.activeItem, fresh = false;
  if (!(comp instanceof CompItem)) {
    comp = null;
    for (var i = 1; i <= app.project.numItems; i++) if (app.project.item(i) instanceof CompItem && app.project.item(i).name == "allawi_orange_coin") comp = app.project.item(i);
    if (!comp) { comp = app.project.items.addComp("allawi_orange_coin", 1080, 1920, 1, D, FPS); fresh = true; }
  }
  var folder = app.project.items.addFolder("SFX");
  if (fresh) {
    var reel = imp(File(here.fsName + "/allawi-orange-coin.mp4"));
    if (reel) { reel.parentFolder = folder; var rl = comp.layers.add(reel); rl.name = "reel"; rl.audioEnabled = false; }
  }
  var voice = imp(File(here.fsName + "/voice.wav"));
  if (voice) { voice.parentFolder = folder; var vl = comp.layers.add(voice); vl.name = "VOICE"; vl.startTime = 0; vl.label = YELLOW; }
  var made = 0;
  for (var c = 0; c < CUES.length; c++) {
    var q = CUES[c], item = imp(File(here.fsName + "/sfx/" + q.file));
    if (!item) { notes.push("missing sfx/" + q.file); continue; }
    item.parentFolder = folder;
    var L = comp.layers.add(item);
    L.name = q.name;
    L.startTime = q.t;
    L.label = GREEN;
    L.comment = q.at + " " + q.kind;
    made++;
  }
  var track = comp.layers.addNull(D);
  track.name = "SFX_TIMELINE";
  track.label = GREEN;
  track.startTime = 0;
  var marks = track.property("ADBE Marker");
  for (var m = 0; m < CUES.length; m++) {
    var mv = new MarkerValue(CUES[m].name);
    mv.duration = CUES[m].dur;
    try { mv.label = GREEN; } catch (e) {}
    marks.setValueAtTime(CUES[m].t, mv);
  }
  app.endUndoGroup();
  alert("SFX_TIMELINE: " + made + " cues placed in " + comp.name + "." + (notes.length ? "\n" + notes.join("\n") : ""));
})();
