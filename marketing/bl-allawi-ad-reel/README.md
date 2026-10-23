# Ad reel in Blender (test: the first 5 seconds)

The opening of my ad reel (`../ae-core-reel`: same script, fitted voice and sound cues, same cut-outs) built as a
Blender file that I render on my own machine with EEVEE.

The look is a paper stage. My orange sits under my paper texture. The cut-outs stand a few centimetres off it, so
one soft light that travels with the camera throws their shadows on the page. Every word is raised paper letters in
DG Sahabah that fold up out of the page on its word, hinged at the baseline, and fold back into it when the line
ends. The camera pushes in slowly on the first idea, then glides down and right to the next. Real motion blur, no
bounces.

| Time | Line | On screen |
|---|---|---|
| 0–2.6 | مشروعك متعوب عليه، بس أرباحك قليلة | the wallet rises in; the words fold up; a coin drops behind the wallet's front and the wallet jumps; «قليلة؟» falls onto the page |
| 2.6–5.5 | عدنا نصمملك موشن جرافيك وبوستات إعلانية | the film camera rolls in and out again; a hand brings the box for «إعلانية» |

## Files

- `build.py` builds `out/allawi_reel_test.blend` with everything packed: the cut-outs, the paper, the voice and the
  sounds for these seconds (as sound strips, so the render has its sound). The output is set to 1080×1920, 30 fps,
  MP4 (H.264, AAC). Run `blender -b -P build.py -- out/allawi_reel_test.blend 1.8 4.0`; the times after the file are
  stills rendered with Cycles to check (this machine has no GPU for EEVEE).
- `type/` holds every word set by `../3d-allawi-ad-reel/arabic_svg.py`. HarfBuzz shapes the Arabic in my font (Blender's
  own text objects don't join Arabic letters), and the glyphs of a word are merged into whole outlines so there is no
  seam where the letters join.

## Rendering it

Open the file in Blender 4.2 or later (it was checked in 5.0.1) and choose Render > Render Animation. The video lands
next to the file as `allawi_reel_test.mp4`. If the render engine isn't EEVEE, pick EEVEE.

## Credits

- The empty wallet: rawpixel, CC0. The other cut-outs are ones I picked and cut out myself.
- Sounds: only my own sound pack.
