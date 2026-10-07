# The dollar reel «الدولار صعد» (HyperFrames)

`renders/dollar-reel.mp4`: a 38.2 s reel at 1080×1920, 30 fps, 29 MB, with sound effects only. The voice and music go on in CapCut; `timing.txt` gives the time of every line and word.

The look follows the user's reference reel (a Baghdad agency's): analog collage, not clean UI.
- Deep red cloth, old paper with a film frame («ALLAWI 400»), a green board.
- Torn slips: a calendar page, a payslip, a generator receipt, a price tag, a notebook price list.
- Black-and-white and sepia prints with white borders and tape.
- Red marker crosses, circles and underlines, and rubber stamps.
- Heavy moving film grain, a vignette, light leaks on some cuts.
- Every shot opens with a rack focus, then a slow push with a little handheld drift.
- Small subtitles fade in word by word, like the reference.

| # | Time | Line | Shot |
|---|---|---|---|
| 1 | 0–2.6 | أسبوع واحد.. بس أسبوع. | A calendar page pinned to a green board; red crosses on 1–6 October, then the 7th circled |
| 2 | 2.6–5.0 | الدولار صعد.. والدينار نزل. | Red cloth; a $100 note tumbles up through the frame, a 25,000 dinar note tumbles down |
| 3 | 5.0–8.0 | الـ١٠٠ دولار.. صارت ١٨٠ ألف. | A paper wall with old Baghdad prints; a big red «$100» rolls over to «180,000 دينار», underlined |
| 4 | 8.0–10.6 | الراتب نفسه.. بس صار أصغر. | A payslip «750,000»: the amount is circled, then the whole slip shrinks |
| 5 | 10.6–13.2 | صاحب المولدة.. رفع سعر الأمبير. | A bulb print and a generator receipt «وصل اشتراك مولدة»; the stamp «زيادة» comes down |
| 6 | 13.2–17.0 | وأبو المحل غيّر الأسعار.. وگال: الدولار صاعد عيوني. | A price tag «٣,٠٠٠» struck and rewritten «٣,٥٠٠», then a chat: «ليش غيّرت السعر؟» / «الدولار صاعد عيوني» |
| 7 | 17.0–20.2 | حتى لفّة الفلافل.. صارت تنحسب بالدولار. | A falafel wrap in a retro «falafel.jpg» window; a receipt prints out: «$0.67» |
| 8 | 20.2–22.6 | والكل صار يسأل نفس السؤال.. | Al-Rashid Street, dark and red |
| 9 | 22.6–24.6 | هو الدولار راح ينزل؟ | Old paper; «ينزل؟» circled in red |
| 10–11 | 24.6–27.8 | محد يدري. / بس اللي ندريه.. | Black, then red |
| 12 | 27.8–30.0 | إنو العراقي.. يمشّيها. | A 1932 Baghdad coppersmiths' bazaar |
| 13 | 30.0–32.4 | يضحك على الأزمة.. ويكمّل. | Al-Zahawi coffeehouse (2025) as a taped print |
| 14 | 32.4–35.2 | وأسعاري؟ ظلّت مثل ما هي. | A notebook price list (14 / 7 / 40 ألف); the stamp «ثابتة» comes down |
| 15 | 35.2–38.2 | — | The «Allawi» signature writes itself on red, with ALLAWI.PSD under it |

## Files

- `index.html`: the composition, 16 timed shots on one GSAP timeline. The subtitle words and their times live in each `.sub`'s `data-words` / `data-at`.
- `prep.py` builds `assets/img/` (Pillow, numpy, scipy):
  - the textures: red cloth, paper, desk, board, and a grain tile;
  - the torn and cut paper pieces;
  - the note cut-outs;
  - the photo prints;
  - the two full-frame plates.
- `sfx.py` builds `assets/sfx/*.wav`: film hiss, paper, slap, marker, scribble, banknote flutter, stamp, receipt printer, message tones, tick, shrink, boom. `assets/sfx-kit/` (two whooshes from the user's own kit) is gitignored.
- `timing.txt`: the voice timing sheet for CapCut.
- `caption.txt`: the post caption.
- `renders/dollar-reel-cover.jpg`: the cover.

The render comes out of HyperFrames at about 180 MB, because grain is hard to compress. To build the posted file, rename that render to `renders/dollar-reel-master.mp4` (it is gitignored) and re-encode it:

```bash
export HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx hyperframes@0.8.140 check
npx hyperframes@0.8.140 render -o renders/dollar-reel-master.mp4 --quality delivery
ffmpeg -i renders/dollar-reel-master.mp4 -c:v libx264 -preset slow -crf 23 -tune grain -maxrate 9M -bufsize 18M \
  -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart renders/dollar-reel.mp4
```

Checks:
- `check` passes.
- `../tools/textcheck.cjs` finds no collisions in any of the 16 shots. Each shot was checked alone, with every word showing and its final state forced.

## Credits (all public domain or CC0; none needs a credit)

- $100 note: "Obverse of the series 2009 $100 Federal Reserve Note", Wikimedia Commons. Public domain (US government work).
- 25,000 dinar note: "Iraq 25,000 Dinars Banknote", Gary Lee Todd, Flickr. Public Domain Mark.
- Hand fanning $100 notes: Rubel Miah, WordPress Photo Directory. CC0.
- Falafel wrap: "Falafel & Tzatziki Wrap - Lavash", Andy Li, Wikimedia Commons. CC0.
- Baghdad bazaars, 1932: G. Eric and Edith Matson Photograph Collection, Library of Congress (via rawpixel). No known restrictions / CC0.
- Coffee shop, Baghdad (sepia): Museums Victoria. Public domain.
- Al-Zahawi Coffeehouse in 2025: Ayham4002, Wikimedia Commons. CC0.
- Al-Rashid Street: Thegiantofgiants, Wikimedia Commons. CC0.
- Light bulb: Ashesh Magar, WordPress Photo Directory. CC0.
- Fonts: IBM Plex Sans Arabic, Playfair Display, Mrs Saint Delafield (SIL OFL).

Only the reference's style is followed. None of its footage, logo or characters is used.
