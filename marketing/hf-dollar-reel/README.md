# The dollar reel «الدولار صعد» (HyperFrames)

`renders/dollar-reel.mp4` is a 38.8 s reel at 1080×1920 and 30 fps, with the voiceover and sound effects mixed in. Only music is left to add in CapCut, about −18 dB under the voice.

The look follows the user's reference reel (a Baghdad agency's): analog collage, not clean UI.
- Deep red cloth, old paper with a film frame («ALLAWI 400»), a green board.
- Torn slips, black-and-white and sepia prints with white borders and tape.
- Red marker crosses, circles, arrows and underlines, and rubber stamps.
- Heavy moving film grain, a vignette, light leaks, flash frames, and a rack focus on every cut.
- Small subtitles fade in word by word, like the reference.

## v3: what changed and why

The user asked for it to be "10x better". People who watched v2 were also confused by its ending: it was a story the whole way, then «وأسعاري؟ ظلّت مثل ما هي» showed a price list for posts, and nothing had said who was talking or what posts.

- **The ending is a question for the viewer, not a pitch.** «وإنتو؟ الـ١٠٠ عدكم بيش؟ اكتبوها بالتعليقات.» A notebook sheet reads «سعر الـ١٠٠$ اليوم» with Baghdad, Baqubah, Basra, Mosul and Erbil. A red «؟» lands on each, and a marker arrow points down to the comments. The rate differs from city to city, so people have something real to comment. The caption asks the same.
- **A new hook that asks a question on frame one.** The first frame reads «$100 = ؟»: a real note on red cloth, a marker «=», and a «؟» scrap. On «صارت» the «؟» is torn off. «180,000» slaps in, each character cut from a different magazine (a ransom note), then «دينار». The first frame is sharp; v2 opened on a rack-focus blur.
- **A cardboard seesaw** for «الدولار صعد.. والدينار نزل»: it tips, the $100 is thrown up, dinars pile onto the low end, and marker arrows show ↑ and ↓.
- **The salary number itself shrinks** («الراتب نفسه.. بس صار أصغر»). The payslip stays the same while «750,000» and its circle get smaller in four steps.
- **Small story beats:**
  - The generator's power dips with a mains buzz.
  - «صاعد» gets selected in the chat, like a screenshot about to be shared.
  - A «؟» bubble pops over the people's heads on Al-Rashid Street, now a sharp red-and-cream duotone.
  - A hand-drawn chart that only goes up sits behind «هو الدولار راح ينزل؟».
  - The 1932 bazaar's sunbeam breathes, with dust drifting in it.
  - An old coffeehouse print lands under Al-Zahawi's, then and now.
- **It moves like real stop-motion, not software:**
  - Paper pieces move on twos (12 poses a second) and never sit perfectly still. They nudge a pixel or two 12 times a second, like a stop-motion set.
  - Marker lines boil, through an SVG turbulence filter whose seed changes 12 times a second.
  - The camera still glides, like a real camera filming a stop-motion set.
- **Transitions:** a newspaper («جريدة علاوي», a made-up paper) flies past the lens on three cuts (3.0, 20.2, 32.4 s). The cut happens while it covers the whole frame.

| # | Time | Line | Shot |
|---|---|---|---|
| 1 | 0–3.0 | الـ١٠٠ دولار.. صارت ١٨٠ ألف. | «$100 = ؟» on red cloth with notes falling past; the ؟ is torn off and «180,000» slaps in as a ransom note, then «دينار» |
| 2 | 3.0–5.4 | وكلها بأسبوع واحد. | A calendar page pinned to a green board; red crosses on 1–6 October, then the 7th circled |
| 3 | 5.4–8.0 | الدولار صعد.. والدينار نزل. | A cardboard seesaw on paper: it tips, the $100 is thrown up, dinars pile on the low end; ↑ and ↓ in marker |
| 4 | 8.0–10.6 | الراتب نفسه.. بس صار أصغر. | A payslip drops in; «750,000» is circled, then shrinks in four steps |
| 5 | 10.6–13.2 | صاحب المولدة.. رفع سعر الأمبير. | A bulb print and a generator receipt; the power dips; the stamp «زيادة» comes down |
| 6 | 13.2–17.0 | وأبو المحل غيّر الأسعار.. وگال: الدولار صاعد عيوني. | A price tag «٣,٠٠٠» struck and rewritten «٣,٥٠٠», then a chat with «صاعد» selected |
| 7 | 17.0–20.2 | حتى لفّة الفلافل.. صارت تنحسب بالدولار. | A falafel wrap loads line by line in a retro window; a receipt prints «$0.67» |
| 8 | 20.2–22.6 | والكل صار يسأل نفس السؤال.. | Al-Rashid Street, red and cream; a «؟» pops over each head |
| 9 | 22.6–24.6 | هو الدولار راح ينزل؟ | Old paper; a chart that only goes up; «ينزل؟» circled (the circle rides on the word) |
| 10–11 | 24.6–27.8 | محد يدري. / بس اللي ندريه.. | Black with «محد يدري.» echoing, then red |
| 12 | 27.8–30.0 | إنو العراقي.. يمشّيها. | The 1932 coppersmiths' bazaar, its sunbeam and dust moving; «يمشّيها.» underlined |
| 13 | 30.0–32.4 | يضحك على الأزمة.. ويكمّل. | An old Baghdad coffeehouse print, then Al-Zahawi (2025) landing on top |
| 14 | 32.4–35.8 | وإنتو؟ الـ١٠٠ عدكم بيش؟ اكتبوها بالتعليقات. | A fill-in sheet: «سعر الـ١٠٠$ اليوم» with five cities, a «؟» on each, and an arrow down to the comments |
| 15 | 35.8–38.8 | — | The «Allawi» signature writes itself on red, with ALLAWI.PSD; a film burn, then black |

## Voice

The user made the voiceover in Google AI Studio (Gemini TTS, a female voice). They recorded it as two takes, `assets/voice/part1.wav` and `part2.wav`, because AI Studio stops at about 30 s.

`voice.py` places the voice on the reel:
- It cuts each spoken phrase at its pauses, found with ffmpeg silencedetect.
- It places each phrase on its visual beat: «صارت» as the ؟ is torn off, «صعد» on the seesaw's slam, «غيّر» as the price is struck, «صاعد» as it is selected, «ينزل» as it is circled.
- It speeds four phrases up by at most 1.12× so each line ends inside its own shot.
- It writes `assets/voice/voice-aligned.wav`, one 48 kHz track from 0:00 at about −16 LUFS.

The subtitle times (`data-at`) were then set to when each word is actually spoken. The word times inside phrases come from faster-whisper (medium, Arabic). A few beats moved to land on their word:
- the ring around the 7th on «واحد»;
- the salary number shrinking on «أصغر»;
- the circle on «ينزل»;
- the echo after «يدري»;
- the underline on «يمشّيها».

`mix.sh` lays the voice over the rendered sound effects, ducks the effects under it, limits peaks, and encodes `renders/dollar-reel.mp4` and the cover.

## Files

- `index.html`: the composition, 16 timed shots on one GSAP timeline. The subtitle words and their times live in each `.sub`'s `data-words` / `data-at`.
- `prep.py` builds `assets/img/` (Pillow, numpy, scipy):
  - the textures: red cloth, paper, desk, board, newsprint, and a grain tile;
  - the cardboard seesaw (plank and fulcrum);
  - the torn and cut paper pieces;
  - the note cut-outs;
  - the photo prints;
  - the two full-frame plates.
- `sfx.py` builds `assets/sfx/*.wav`: film hiss, paper, slap, marker, scribble, banknote flutter, stamp, receipt printer, message tones, tick, shrink, boom; and for v3 a bubble pop, a cardboard thunk and creak, the generator's buzz and the newspaper swipe. `assets/sfx-kit/` (two whooshes from the user's own kit) is gitignored.
- `timing.txt`: the script and the original timing sheet.
- `voice.py`, `mix.sh`, `assets/voice/`: the voiceover, placed and mixed (see Voice).
- `caption.txt`: the post caption.
- `renders/dollar-reel-cover.jpg`: the cover, the frame at 2.75 s («$100 = 180,000 دينار»).

The render comes out of HyperFrames at about 190 MB, because grain is hard to compress. It is gitignored as `renders/dollar-reel-master.mp4`. `mix.sh` adds the voice and re-encodes it to the posted file:

```bash
export HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx hyperframes@0.8.140 check
npx hyperframes@0.8.140 render -o renders/dollar-reel-master.mp4 --quality delivery
python3 voice.py      # only when the voice or its placement changes
./mix.sh
```

Checks:
- `check` passes.
- `../tools/textcheck.cjs` finds no collisions in any of the 16 shots. Each shot was checked alone, seeked to its last frame. The only hits are the «180,000» scraps overlapping each other's paper on purpose; with the paper hidden, the digits are clear of each other.

## Credits (all public domain or CC0; none needs a credit)

- $100 note: "Obverse of the series 2009 $100 Federal Reserve Note", Wikimedia Commons. Public domain (US government work).
- 25,000 dinar note: "Iraq 25,000 Dinars Banknote", Gary Lee Todd, Flickr. Public Domain Mark.
- Hand fanning $100 notes: Rubel Miah, WordPress Photo Directory. CC0. (Used in v1–v2; `prep.py` still builds it, v3 does not show it.)
- Falafel wrap: "Falafel & Tzatziki Wrap - Lavash", Andy Li, Wikimedia Commons. CC0.
- Baghdad bazaars, 1932: G. Eric and Edith Matson Photograph Collection, Library of Congress (via rawpixel). No known restrictions / CC0.
- Coffee shop, Baghdad (sepia): Museums Victoria. Public domain.
- Al-Zahawi Coffeehouse in 2025: Ayham4002, Wikimedia Commons. CC0.
- Al-Rashid Street: Thegiantofgiants, Wikimedia Commons. CC0.
- Light bulb: Ashesh Magar, WordPress Photo Directory. CC0.
- Fonts: IBM Plex Sans Arabic, Playfair Display, Mrs Saint Delafield, Reem Kufi, Abril Fatface, Anton, Bebas Neue, Courier Prime (SIL OFL).

Only the reference's style is followed. None of its footage, logo or characters is used.
