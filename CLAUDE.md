# Notes for Claude

The user is Ali: an Iraqi graphic designer (@allawi.psd on Instagram) who also sells viZion, an Iraqi e-commerce course
built as this website (vizioniq.vercel.app; Vercel deploys `main`). The site is `src/`, `api/`, `server.ts`;
everything for Instagram (posts, reels, briefs, sound and transition packs) is in `marketing/`.

## Working with Ali (saves the weekly usage)

- When the user says "don't waste usage" or sends a lead or caption question, answer in text: no tools, no reading code.
- Lead replies: viZion leads follow `marketing/vizion-sales-brief.md`; design-page leads and captions follow
  `marketing/allawi-psd-brief.md`. Iraqi dialect, short; gender-neutral wording when you don't know who is writing.
- For a new reel: show the idea or 2–3 still frames first, build after the user approves, then one draft render. For a
  new post or ad: pitch 3 concepts in text first (see "Post and ad designs" below). For a small change, make one pass
  and one render; don't re-check everything.
- The user asked to save usage while keeping the work at its best (20 Oct): read only the code that draws the piece,
  look at one big render to find issues, fix in one pass, then check the result on one contact sheet of slides, not each.
- Documents and proposals (20 Oct): the user wants them to look made by a professional document designer, not AI,
  and the copy to read as written by a person (plain formal Arabic, no slogan-style lines); fonts must not look default.
  Write proposals in the first person singular (the user made and researched the work alone, not a team), and don't
  overuse 3D: realistic renders for print and objects, flat designs for social media and websites (20 Oct).
  No «» quotation marks and no Arabic diacritics (تُ ّ ً and the like) in documents: the user says they read as AI (20 Oct).
  Deliverables carry nothing that points to AI or the tools behind them: file and layer names, document properties
  (author is the user), media tags and paths are clean; the user says how AI was used in their own words (21 Oct).
- When the user states a new like or dislike, add it to this file in a line or two so later sessions know it.
- Tips and education posts (22 Oct): one useful topic explained slide by slide, like the sizes guide and the
  step-by-step explainers the user sent (big bold type, exact numbers, a clear idea per slide). Build them from real
  material (phone screenshots, the user's PSDs and work), not drawn diagrams, and keep clear of the habits in -noAI
  section 2. First tries: `marketing/ig-design-guides` (too many of those habits) and `marketing/ig-design-tips`
  (collage with before/after mock-ups, rejected).
- Design effort (22 Oct): a photo with a text block on it looks lazy to the user. Each slide needs real design work:
  objects cut from big licensed photos and lit with real shadows, a colour world per subject, huge type the object
  overlaps, a visual idea (e.g. the logo's bite cut out of a real apple), and a different composition per slide
  (`marketing/ig-simple-logos`). Explain the design reason on each slide, not only the story.
- Ad reels for the page (22 Oct): the user likes the Brandek style, one cut-out element per line (objects, hands,
  people as PNGs acting out the words), not screenshots or his post designs (`marketing/hf-allawi-ad-reel`). His reels
  may play on phones. He wants it as a true one take in Brandek's visual language: one vivid coral field, big bold
  white type with dark key words, black-and-white cut-outs anchored to the frame edges and acting on the words, ideas
  pushing each other out; no dark or muddy backgrounds, heavy vignettes, blur transitions or one poster per sentence.
  Keep the motion blur and the 15 fps steps. Check every frame of a render before sending it.
- كاكتوس (`marketing/gift-cactus`) is a small project by a girl who crochets by hand, not a shop: never call it محل.
- Be honest: don't invent features, results, clients or prices. No emojis on the site.
- Privacy: never commit voice-artist or applicant recordings, chat exports or screenshots of leads; don't repeat
  phone numbers.
- Commit and push to the session's branch when done. No pull request unless the user asks.

## -noAI

When the user writes **-noAI**, the work must not look, read, or carry anything that points to AI, in any kind of
project: design, posts, reels, documents, websites, apps, games, code. A designer, a client or a teacher looking at it
should see one person's work, not a model's. That means three things: no traces in the files, none of Claude's own
visual and writing habits (its "fingerprint", the way SynthID marks an image), and real material instead of drawn
stand-ins. Worked example for the files: `marketing/ministry-identity/package/`.

### 1. No traces in the files
- No mention of AI, Claude, Anthropic, ChatGPT, Gemini or the tools behind the work in any file, comment, README,
  file/layer/object/asset name, commit message or metadata. Commits carry the user as author (`Ali
  <vizioniraq@gmail.com>`), no Co-Authored-By or "Generated with" lines, and read like a person wrote them.
- Metadata: the user is the author (PDF, Office, image EXIF); strip video/image tags (`ffmpeg -map_metadata -1 -c copy`,
  `exiftool -all=`); remove library names from document properties (e.g. PptxGenJS in a PowerPoint's Company field).
  Don't fake software names (a browser PDF producer stays).
- Images: nothing but pixels. PNGs keep only IHDR/IDAT/IEND (no tEXt, iTXt, eXIf, caBX); JPEGs carry no EXIF, XMP or
  IPTC, no C2PA/JUMBF manifest and no "AI generated" / `trainedAlgorithmicMedia` source type. Blender renders write
  their own stamp text: strip it.
- Clean paths and names: no temp or scratchpad paths in project files; Blender files with named objects, packed
  textures and clean texture paths; SVGs with a title and named layers; layers in PSDs named as a designer would.
- Before delivering, scan every file, binaries included, for
  `claude|anthropic|chatgpt|openai|gemini|copilot|generated by|hyperframes|pptxgenjs|playwright|headless|scratchpad|c2pa|synthid`
  and fix what it finds. (Render scripts in the repo may name their library; what the user posts or sends may not.)

### 2. Claude's visual fingerprint: don't use it
These are the defaults Claude reaches for when it designs with code. Each one alone may be fine; together they read as
"made by Claude". Avoid them unless the user's own work or brief asks for that exact thing.

**Colour**
- Flat cream or beige + near-black + one terracotta/orange accent, as plain fills. This is close to Claude's own brand
  look (the user called it "Claude motion", 15 Oct). The user's brand shares these colours, so carry them through real
  material: paper and print texture, photos, uneven ink, tone shifts, never as flat vector fields with clean shapes.
- The one-neutral-plus-one-accent formula on every slide; the accent on exactly one element per drawing.
- Smooth even radial gradients as backgrounds; dark mode "ink" slide as the obligatory checklist slide.
- Purple/indigo/blue-to-pink gradients, glass, glow, neon (the other common AI palette).

**Type**
- Default fonts: Inter, Roboto, IBM Plex (Sans Arabic, Mono), Alexandria, Readex Pro, Space Grotesk, Poppins,
  Montserrat, JetBrains Mono. Use the user's fonts (DG Sahabah) or a face chosen for this project and say why.
- Tiny spaced-out uppercase English labels as kickers or headers ("SIZE GUIDE · 2026", "DESIGN PROCESS", "EXAMPLE").
- English words on Arabic work for decoration; "01 / 02" numbering in a geometric sans; "·" separators between labels.
- A highlighter stroke or marker block behind the key words of every headline; a coloured last word in every title.
- A perfectly regular type scale with every slide set the same way (title, subline, body in the same places).

**Icons and drawings**
- Icons built from primitives: circles, squares, triangles, diamonds, dot grids, bar charts, with one part in the
  accent colour. Icons in a circle or rounded square. Lucide/Feather/Heroicons/Material look (even 2 px strokes,
  round caps). Emoji as icons. Check and cross glyph pairs for right/wrong.
- Get icons from the user's hand drawing, a licensed set the user picks, or trace real objects. Never draw a set of
  icons from basic shapes.
- Icon sets the user picked (22 Oct): Streamline Ultimate Bold Free, Icons8 iOS Glyphs, and a free Figma community
  pack (1800 icons). Their downloads need the user's account (Icons8 gives free PNGs only, SVG is paid), so list the
  exact icons needed and ask the user to export them as SVG; credit each set in the caption as its licence asks.

**Diagrams**
- Diagonal hatching for zones, dashed outlines, thin boxes joined by arrows, grey wireframe bars with a crossed image
  placeholder, numbered squares or circles, checkbox lists, progress trackers made of little squares, steppers,
  pyramids and flow charts in hairlines.
- Show the real thing instead: screenshots from the user's phone (a reel with the app's buttons, the profile grid
  crop), the user's real PSD at each stage, photos of real objects. Ask the user for them; say exactly which shots.

**Layout**
- The same skeleton on every slide: header bar (handle + spaced label + rule), headline, subline, diagram, footer with
  a swipe cue and a numbered box. Faint grid paper behind everything. Two-column notes with top rules.
- Cards in even grids of 3, 4 or 6 with identical gaps; everything centred or perfectly symmetrical; identical
  margins and hairline rules everywhere; the same soft drop shadow on every object; white photo borders on everything.
- "Handmade" done as a formula: CSS torn strips, tape and kraft tags repeated identically on every slide. The user's
  highlight look uses paper, tape and tags: use scans or photos of real ones, vary them, and let the subject lead.
- Vary the layout from slide to slide as a designer would: a full-bleed photo, a big number, one word alone, a crop.

**Imagery and content**
- Made-up example brands with a neat mock-up product; props modelled from primitives (a lathe cup, a box); studio
  renders on a seamless sweep; fake UI (invented insights cards, app screens, chat bubbles); invented numbers.
- Before/after pairs of the same made-up ad as the default way to teach.
- Use the user's real work, real client products, real screenshots, licensed photos, and 3D models the user downloads
  from Sketchfab (tell the user the search words and a free licence to pick; don't model them).

**Motion**
- Every element fading and sliding up with the same ease, staggered pop-ins, slow constant zooms, captions that all
  enter the same way. Use the user's transitions pack, cut to the voice, and vary the moves.

**Websites and apps**
- The stock page (hero > features > testimonials > CTA), rows of three rounded cards with an icon in a circle,
  Tailwind's default palette, pill buttons and badges everywhere, glass blobs, made-up stats or testimonials.
- Take a real art direction from the brand or subject: chosen typefaces, real photos or custom drawing, an unexpected
  grid, specific details.

**Games**
- An original art direction and UI (not default buttons or a neon/synthwave default), named mechanics, sound from the
  user's own packs.

### 3. Claude's writing fingerprint: don't use it
- Arabic: no «» and no diacritics; Iraqi dialect when casual, plain formal Arabic in documents; no textbook MSA in a
  casual post. Don't stack ".." at the end of every line, and don't end every title with a full stop.
- Patterns to avoid in any language: lists of three; "not just X, but Y" («مو بس.. بل»); a question followed by its
  own answer («الحل؟ ..», «النتيجة؟»); colon reveals; every sentence the same length; a motivational closer; bold
  lead-ins on every bullet; Title Case headings; stacked em dashes; emoji bullets.
- Words to avoid: elevate, unlock, seamless, delve, empower, game-changer, "in today's fast-paced world", journey,
  tapestry, ارتقِ, اطلق العنان, بكل سلاسة, رحلتك.
- Write as the user, first person singular ("I made it", «سويته»), with specific details only the user would know.

### 4. Code
- In the codebase's own style; comments only where they help; no narrating comments, no emoji-heavy README
  boilerplate, no "Generated by" headers.

### 5. Before delivering
- Run the file scan in section 1 and the copy checks in section 3 (a script over the rendered text is fine).
- Look at one contact sheet of the whole piece and ask: could this be from any account or any model? Would a
  designer spot the habits in section 2? If yes, rework those slides before showing the user.
- Leave out anything made with AI image generators (ChatGPT, Gemini, Midjourney and the like), except custom elements the
  user generates in Gemini on request (22 Oct); strip their metadata like any other image.

## Selling: offers, hooks and DMs (Ali asked for this approach, 23 Oct)

- Build offers, reel scripts, posts and pitches on Hormozi's $100M Offers and $100M Leads. Raise the outcome the buyer
  wants and their confidence in getting it (real proof, the free trial, a first test design); cut the wait and the
  effort (ready templates, IQD calculators, done-for-you copy). Stack bonuses only from what Ali really includes.
- Reels and posts: hook in the first second that names the viewer or their pain, hold them with an open loop and real
  proof, give a real insight before the call to action. Match the copy to the viewer's awareness stage and the
  market's sophistication (Schwartz); move leads up a ladder, from free sample or trial to paid work (Brunson); give
  each brand one clear difference from its competitors (Neumeier).
- DMs: diagnose first (what they sell, where it breaks), give one sharp insight, then the offer. Calm, no pressure.
- The honesty rules above still win: no invented guarantees, tiers, bonuses, results or prices, and no promised sales.
  Natural Iraqi dialect, never translated marketing clichés, and hooks follow -noAI section 3 (no question answered by
  itself, no "not just X, but Y"). Each brief has a "How to sell" section for its business.

## Post and ad designs: pitch first, then a studio composite (23 Oct)

- Every new post or ad starts with 3 distinct concepts in text, no code and no render. For each: where the product,
  props, surface and background depth sit; the light (direction, colour, mood); how the Arabic headline, subtext and
  call to action sit around the product (asymmetric, rule of thirds). Build only the one the user picks.
- It must read as a Photoshop studio composite or commercial product photo (the user's reference: a SYOM tea ad, the
  pouch on a table next to the teapot, cups and spilled herbs), never as a web layout. Banned: cards and panels,
  backdrop blur, frames, pill buttons or badges, dashed or glowing boxes, line icons, checkmarks, emojis, title >
  image > button stacked in the centre, plain two-colour gradients or flat fills.
- Products sit on a real surface (wood, marble, stone, a studio table) or are shot from a strong camera angle, with
  foreground props (herbs, petals, steam, drops) overlapping their base. Each object gets three shadows: a tight dark
  contact shadow (2–4 px blur), a cast shadow away from the light (15–35 px), and a wide soft ambient shadow under the
  group (60 px+, low opacity). Rim light and colour-matched glow on the cut-outs so they don't look pasted on.
- Background in 4+ layers: the brand's base colour, an off-centre spotlight behind the product (broken by texture,
  never a smooth even radial), leaf or window shadow at 8–15 % (multiply or soft-light) and a vignette.
- Type: the brand guideline's fonts and colours; logo in a corner; a bold headline in the empty space opposite the
  product; a calm call to action at the bottom or a corner with no box; line height 1.2–1.35, short lines.
- Finish with one grade over the whole canvas (gentle S curve, warm/cool split, about 2.5 % mono grain) so text,
  background and photos share one texture.
- Material is real: the client's product photos, licensed photos (credit them), Blender renders or elements the user
  generates; leaf shadows from real photos or scans, not drawn shapes. If a needed photo is missing, ask for it.

## Reference projects (start from these; copy their structure and look)

- YouTube gaming thumbnails (23 Oct): 1920×1080, three layouts pitched in text first (split, menu showcase, centre
  hero), then the picked one built as a layered composite. Rules and reference notes: `marketing/yt-r6-unlock-all`
  (then `-2` to `-5`). Every element needs an obvious meaning: the user had a sheared padlock and sparks removed as "weird".
  The user wants a clever idea in each one and textured title type, not flat gradient fills (23 Oct). A concrete
  title broken by the hammer was rejected; `-4` now has Sledge smashing a locked operators screen (grey cards with
  padlocks) open onto the same operators unlocked in colour, which the user picked.

- Reel motion (22 Oct, the standard from now on): `marketing/hf-simple-logos-reel`, built on an After Effects project
  the user sent. A camera per shot that lands fast and settles, then speeds into a hard cut with a 0.3 s blur pulse;
  letters out of a blur one at a time; Smart Bounce pop-ins; motion blur on the camera and on every moving object;
  the frame stepping at 15 fps (the user liked 12 but found it laggy on a 30 fps video). Its README gives every number.
- Code-built reels with an After Effects handoff (23 Oct): `marketing/ae-core-reel`, a GSAP engine (camera rig, eases,
  kinetic type, depth layers, one master timeline on the voice) that renders in the browser and writes an ExtendScript
  that rebuilds the same reel as an AE project. The user asked for this over plain CSS transitions.
- Earlier reel standard: `marketing/hf-one-second-reel` (HyperFrames: one-take camera over paper sheets, word pops
  with sound, highlighter pen, real voice-over fitted to captions). Its README explains every part.
- Collage reel: `marketing/hf-dollar-reel`. Photo post: `marketing/ig-diy-haircut`. Collage post and story:
  `marketing/ig-voice-casting`. Highlights: `marketing/ig-highlights`.
- Full style description (for another AI too): `marketing/gemini-style-prompt.md`.
- Render setup: HyperFrames is pinned at `hyperframes@0.8.162`; set `HYPERFRAMES_BROWSER_PATH` to
  `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`. Static posts render with
  `NODE_PATH=/opt/node-tools/node_modules node render.cjs`. Check Arabic text with
  `node marketing/tools/textcheck.cjs <page.html> '<selector>'` (it finds glyph collisions box checks miss).

## Sound in reels and videos

Use only the user's own sound packs in `marketing/sfx-pack/` (two Drive packs, 127 sounds; run `./fetch.sh` there
first; `README.md` lists every sound and its length). Don't synthesize sound effects, don't use HyperFrames-kit or other stock sounds, and don't add
generated or stock music. If a piece needs music, ask the user for a track.

A pop on every word as it appears (softer on the orange key words), a whoosh on each camera move or transition, a
stamp or impact on big moments.

## Voice-over

- Use a real recorded voice (or the ElevenLabs take the user sends). Don't process it: no denoise, EQ, compressor or
  loudness normalising. One fixed gain only (peaks about −1.5 dB), 30 ms fades, and keep the word tails. The user said a
  processed take sounded "weird and bad" next to the original (18 Oct).
- Cut it into lines at the pauses and start each line on its caption (word times from faster-whisper medium); see
  `marketing/hf-one-second-reel/voice_fit.py`. Tighten the visuals to the voice rather than padding pauses: the user found
  a padded section "slow and boring" (18 Oct).

## Transitions in reels and videos

Use the user's own transition clips in `marketing/transitions-pack/` for most transitions (run `./fetch.sh` there
first). `README.md` gives each clip's cut point and how to lay it over a cut (`mix-blend-mode: screen`, muted, with a
sound from the sound pack on the cut). Prefer them to built-in or registry transitions.

## Look of reels and videos

Use the look of the user's Instagram highlights (`marketing/ig-highlights`): paper `#ece3d4`, brown `#1f1510` and
orange `#e2541b`→`#f07a2e` fields under the paper texture (multiply), light film grain and a vignette; headlines and
captions on torn cream strips; designs as taped prints with kraft tags.

Font: the user's own DG Sahabah (`marketing/brand-fonts/DG-Sahabah-Reg.ttf`, one weight: set `font-weight:400` and
`font-synthesis:none`) for all reel text, handwriting included (no Aref Ruqaa), with Alexandria only as a fallback (15 Oct).
It has no «چ» or «گ»: write «ج» on screen («هيج», «حجي») and pick words without «گ» («شعار» for «لوگو»).

Keep the grain light (overlay about .07, not moving every frame) and encode at about 10 Mbps: at .32 the user said the
reel "looks grainy" (15 Oct). For "premium PNG" props, make them (Blender renders with real shadows, noise textures)
rather than taking packs from Pinterest, which are mostly other people's paid or copyrighted work.
3D models (22 Oct): first tell the user what to search for on Sketchfab (search words, a free licence that allows
use); the user downloads the models and sends them, then light and render them in Blender. Only if the user can't find
one, model it yourself.
Elements and PNGs (22 Oct): cut-out items and characters can come from Google images (prefer ones marked free to use,
note the source). For a custom element nothing real covers, write the user a Gemini prompt and ask them to generate it;
the user allows these Gemini images in -noAI work.

No prices in reels unless the user asks for them (15 Oct).

Don't use flat cream + orange + near-black fields with clean UI pills: the user said that reads as "Claude motion" (15 Oct).
The user also rejected a reel as "AI-looking and boring" (9 Oct): keep it handmade (paper, tape, real props) and keep it moving.

Sizes: post 1080×1350, story and reel 1080×1920; keep reel text clear of the top 250 px, the bottom 350 px and the
right-hand buttons. The hook is in the first second.

## Photos and people

Use the client's real product photos, the user's own photos, licensed photos (CC0, public domain, CC-BY with credit),
or made-up AI people the user generates. Never a real celebrity's face or a real person edited as a joke. Ads for big
brands are unofficial concepts: label them «إعلان غير رسمي · فكرة وتصميم @allawi.psd».
