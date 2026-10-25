# Ad posts: workflow and look (set by Ali, 23 Oct)

Every social media graphic or ad post must look like a high-end Photoshop studio composite or a commercial photo
manipulation, never like a coded web layout or a template.

## Phase 1: pitch first, design after
When a post or ad is asked for, don't design or write code yet. Pitch 3 distinct concepts, each with:
1. Composition and staging: where the product cut-outs, props, surface and background depth go.
2. Lighting and mood: light direction, colour harmony, atmosphere.
3. Typography and hook layout: how the Arabic headline, subtext and CTA sit against the product (asymmetric
   balance, rule of thirds).

Wait for Ali to pick one before building.

## Phase 2: the build

Never:
- Web UI containers: translucent rounded cards, floating boxes, bordered frames, info panels.
- Pill badges or web buttons for the CTA or subtext, dashed borders, glowing boxes.
- Line icons, icon-font glyphs, check marks or emojis. Only real photographic cut-outs and editorial type.
- Web-style centred stacking (title, image, button down the middle).
- Plain two-colour gradients or flat solid backgrounds.

Always:
1. Grounded staging: the product stands on a real surface (wooden tray, marble or stone, a tabletop) or is shot
   from a strong camera angle, like the Syom Sept 4 post (pouch beside the teapot, cups and spilled herbs).
   Foreground pieces (loose herbs, petals, steam, drops, props) overlap the base of the product.
2. Three shadows on every product and prop: a tight, very dark contact shadow (2-4 px blur) where it touches the
   surface; a directional cast shadow (15-35 px blur) away from the key light; a large soft ambient occlusion
   (60 px+, low opacity) under the whole group.
3. A layered background (4+ layers): a rich brand base tone, an off-centre studio light behind the hero product,
   large out-of-focus leaf shadow overlays (8-15 %, multiply or soft-light), and a subtle vignette.
4. Light wrap and rim light on the cut-outs matching the background light, and a colour-matched ambient glow, so
   nothing looks pasted on.
5. Asymmetric editorial Arabic type in the brand's fonts and colours: the logo clean in a corner (e.g. top left),
   a bold high-contrast headline in the negative space against the product (e.g. upper right), a calm CTA at the
   bottom or in a corner with no box. Line height 1.2-1.35, proper kerning, a limited measure, like a magazine
   or billboard ad.
6. A final grade over the whole canvas: a gentle contrast curve, a warm/cool highlight split, and about 2.5 %
   monochrome grain, so type, background and photos share one pixel texture like a Photoshop export.

These sit alongside the -noAI rules in /CLAUDE.md. Where they meet: the studio light behind the product is a lit
area in a real scene (not an even radial gradient as the whole background), and the vignette stays subtle.

## The approved standard: Syom Tea ad 1 (`marketing/syom-tea/adD`)
Approved by the client on 23 Oct with no changes. Start every new ad post from it.

How it is built:
- Product: the cleanest real image of the product, facing the camera. The client's shoot photos looked tired and
  leaned back; the brand's own mockup, its front panel warped square to the camera (`cut.py`), read as premium.
- Prop: rendered alone in Blender (`tape.py`). Its camera is solved so a stand-in box lands exactly on the product
  photo's base; it writes `cut/camera.json`, which `compose.py` reads for the table's perspective and where the
  product goes. Passes: shadow (shadow catcher), back (goes under the product photo), front (goes over it).
- Scene (`compose.py`): CC0 walnut and plaster textures in that perspective, a warm light behind the product, a
  soft palm shadow, contact/cast/ambient shadows, rim light, loose tea from the shoot overlapping the base.
- Type (`ad.html`, `ad-post.html`): logo top left, a huge headline top right, its answer right under it, the claim
  and the call to action beside the product, no boxes. `grade.py` puts one grade and grain over everything.
- Feed post: render the same scene wider (`tape.py ... 228`, `compose.py 228`), then frame it tight on the product
  so there is no empty wall or table.

Lessons from the rounds with the user and the client:
- Zoom into every place where things meet before sending (base, edges, shadows, overlaps). Things the user had to
  point out: a floating product, tape that seemed to pass through it, a hand-darkened shadow patch, white halos.
- A prop that goes behind a cut-out must pass behind it out on the table, never at its corners.
- Don't mirror a product photo to change its angle (the print reads backwards).
- The question and its answer sit together; the claim and the call to action go beside the product.
- No AI-generated images, even from the client's own folders (two Syom mockups look generated).
