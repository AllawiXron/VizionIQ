# Ad reel engine (GSAP) and After Effects export

The ad reel for my page (`../rm-allawi-ad-reel`: same script, fitted voice, sound cues and cut-outs), rebuilt on a
small motion engine of my own. The same timeline renders in the browser and is written out as an After Effects
project, so the reel can be finished or changed by hand in AE.

## How it works

Everything on screen is a node, parented the way an AE layer is (anchor, position, rotation, scale, depth). Every
move is a GSAP tween on a node's channels inside one paused master timeline. A frame is drawn by seeking that timeline.

| Module | File | What it does |
|---|---|---|
| EasingEngine | `engine/ease.js` | The only eases allowed: `whipPan` cubic-bezier(0.87, 0, 0.13, 1), `snapPop` back.out(2.2), `snapElastic` elastic.out(1, 0.5), `kineticSlam` expo.out, `liftOff`, `settle`, `gravity`, `rise`, `kickIn`, `kickOut`, `glide`, `swing`. Each carries the Bézier AE gets. |
| CameraController | `engine/camera.js` | `#viewport` (1080×1920, overflow hidden) holds `#world-canvas`. The 15 shots sit on one stage at their own x, y, rotation and scale. `cameraTo({x, y, scale, rotation, duration, ease}, at)` moves the camera; `kick()` adds the tilt (±7°) and pull-out in the middle of a whip. The projection is AE's one-node camera (zoom 2400), and a velocity blur per depth (SVG feGaussianBlur, X and Y apart) comes from how far the frame moved during the shutter. |
| TextRig | `engine/text.js` | Lines are laid out once with the real font. Each word is its own node and does one of: rises out of its mask (120% to 0, 5° to 0), punches in from 175%, rides a dark block that wipes in, fills an outline, or sits on a pill. Once in, it breathes on a slow sine. |
| EnvironmentRig | `engine/env.js` | Far plane (0.3×): a spotlight that follows the camera a beat late, and a diagonal grid of my key words at 8%. Stage (1.0×): type and cut-outs. Front (1.6×): out-of-focus cut-outs that cross the lens on every whip. Screen layers: paper, grain that jumps 7.5 times a second, soft vignette, the handle. |
| MasterTimeline | `engine/master.js` | One GSAP timeline with a label on every shot's line of the voice, so moves are placed against the audio (`"J2-=0.28"`). Each frame is seeked at t − 1/30 and at t: the difference is each layer's motion blur. The frame steps at 15 fps. Clicking the page plays it with the sound. |
| AE exporter | `engine/exporter.js`, `engine/ae-builder.jsx` | Reads the timeline itself and compiles the stage into AE layers (below). |

The reel is `reel/reel.js` (shots, camera path, every line and cut-out and how they act on each other) and
`reel/sound.js` (voice, a pop on every word, the cues on moves and hits).

## The After Effects project

`ae/build_reel_in_AE.jsx` builds the project and saves `allawi_reel.aep` and `allawi_reel.aepx` next to itself:

- The comp `allawi_reel` is 1080×1920 at 60 fps and 41.2 s, uses Classic 3D, and has motion blur on (shutter 720°,
  phase −360°, 32 samples). A `15 fps steps` adjustment layer on top carries Posterize Time at 15.
- `Camera 1` is a one-node camera (zoom 2400) parented to the 3D null `CAM_CONTROLLER`. The null keys x, y, the
  dolly (z) and the roll. The camera keys the whip's own tilt and pull-out.
- Every tween becomes two keys whose temporal ease is the tween's Bézier: influence is the handle's x, speed comes
  from its slope and the move between the keys, per dimension. The whips come out at 87% / 87%. The elastic is baked
  into keys at 30 per second. The sine micro-motion is an expression added to the keyed Y position and rotation.
- One 3D null per shot, line and word. Cut-outs are footage layers with Tint, Brightness & Contrast, a little Noise
  and a warm Drop Shadow. Front pieces get Gaussian Blur and sit at z −900.
- Every word is an editable text layer in DG Sahabah, with a rectangle as its alpha track matte. Bars and pills are
  shape layers. Outline words have a stroked copy and a filled copy revealed by Linear Wipe. Tatweel stretches are
  Source Text keys.
- The phones are footage layers. Their screens (the reel clips, the orange wipe, the words) are parented to them and
  matted by the screen shape.
- The far plane (spotlight and word grid) sits at z 5600. The orange field is a solid with a Gradient Ramp. Paper,
  grain, vignette and the handle are 2D layers on top.
- The voice and all 124 sound cues are audio layers at their times and gains.

To use it:

1. Install DG Sahabah (`footage/fonts`).
2. In AE before 2024, set Preferences > Type > Text Engine to South Asian and Middle Eastern so the Arabic joins.
3. Run File > Scripts > Run Script File… and pick `build_reel_in_AE.jsx`. It needs the `footage` folder beside it, as
   in the package `tools/pack-ae.sh` makes.

Any notes from steps a version of AE refuses are listed in the alert at the end. On AE 2023 and later, mattes are set
by reference; on older versions the matte layer sits right above its text.

`allawi_reel.aepx` is written by After Effects itself when the script saves. I didn't hand-write an .aepx: the format
wraps undocumented binary chunks, and a file written outside AE can't be trusted to open.

## Build

- `tools/assets.sh` fills `media/` (not committed). It takes the cut-outs, textures and font from
  `../rm-allawi-ad-reel/public`, and the voice and sounds from `../hf-allawi-ad-reel/assets`. It cuts the four phone
  clips to the stretches the reel shows (MP4 for AE, VP9 for the page).
- Preview: open `index.html` from a local server and click to play with sound. `?t=12.3` shows one frame.
- Render: `NODE_PATH=<folder with playwright-core> node tools/render.cjs` writes `out/allawi-ad-reel.mp4`: 618
  steps, each held for two frames at 30 fps, at 10 Mbps, with the sound mixed from `reel/sound.js` and no tags.
- AE script: `node tools/export-ae.cjs` writes `ae/build_reel_in_AE.jsx`. Then `node tools/ae-check.cjs` checks it:
  - it parses the script as ES3 (what ExtendScript reads);
  - it runs the script against a model of the AE scripting API that knows only the property and effect names used;
  - it evaluates the keys with AE's speed and influence rules, the parenting and the camera, and compares where
    every cut-out and word lands with the page. Today that is within 2.4 px over 736 placements; the largest gap is
    on expo.out moves, where AE gets the Bézier fit.

  `tools/pack-ae.sh` then makes `out/allawi_reel_AE.zip` with the script and its footage.

## Credits

- The empty wallet: rawpixel, CC0. The other cut-outs are ones I picked and cut out myself.
- Sounds: only my own sound pack. No music.
- GSAP 3.13 and CustomEase (`engine/vendor`), under GreenSock's standard license.
