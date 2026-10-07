# Indomie concept reel «آخر الشهر» (HyperFrames)

`renders/indomie-reel.mp4`: an 11 s reel at 1080×1920, 30 fps, with sound. It loops with no seam.

The joke: the salary drains from 750,000 to 2,250 دينار over the month, and then «الراتب يخلص.. الاندومي ما يخلص.»

It was made for likes:
- it is relatable month's-end humour (and topical, with the dollar up);
- the hook is in the first second;
- the joke lands by about 6 s;
- the ad holds for about 3 s;
- the caption asks a question people answer in the comments.

| Time | Picture | Sound |
|---|---|---|
| 0–1.5 | A banking app (generic, no bank's brand) on salary day: «750,000 د.ع» flashes green. Hook: «راتبي من يوم ١.. ليوم ٢٨». | Cha-ching, music in |
| 1.5–5.25 | One expense per beat. Rows push in at the top of the list, the date chip jumps forward, the balance counts down and the "spent" bar fills. The last row is «ما أدري وين راحت −52,750». | A counter tick-roll per expense |
| 5.47–7.2 | «يوم ٢٨..», the balance turns red at 2,250 and the card shakes, then «شيجيب 2,250 دينار؟». | Record scratch, music stops, sad trombone |
| 7.2–10.35 | Whip up to the real plate of Indomie with eggs and tea, with steam rising. «الراتب يخلص.. / الاندومي ما يخلص.», the sticker «2,250 دينار = عشا ملكي 👑», then the Indomie logo with «جاهز بـ٣ دقايق». | Whoosh, boom, music back, thud, pops |
| 10.35–11 | Next month's salary notification «تم إيداع راتبك +750,000 د.ع» drops in, and the app slides back exactly as it opened. | Notification ding, then the loop's cha-ching |

## Files

- `index.html`: the composition, a single scene with one GSAP timeline. The transactions are the `TX` list, and the balance after each is computed from it.
- `BRIEF.md`: the brief.
- `photo.py` builds `assets/img/plate.jpg` from `photo/source-indomie-egg.jpg`:
  - it scales the shot to full width and fades it into a dark floor tone above and below, so the words and logo have room;
  - it tames the flash, warms the image, and darkens the floor around the plate.
- `sfx.py` builds `assets/sfx/*.wav`: cha-ching, tick, tick-roll, record scratch, sad trombone and notification ding. It runs with numpy and scipy.
- `assets/sfx-kit/` and `assets/music/` are gitignored. They are copied from `../hf-allawi-promo/assets/`:
  - the user's own sound kit;
  - "Gummies" from Mixkit.
- `renders/indomie-reel-cover.jpg`: the cover, the plate frame at 9.8 s.
- `caption.txt`: the post caption.

```bash
export HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx hyperframes@0.8.140 check
npx hyperframes@0.8.140 render -o renders/indomie-reel.mp4 --quality delivery
```

Checks:
- `check` passes. Its remaining contrast notes are frames sampled mid-fade.
- `../tools/textcheck.cjs` finds no glyph collisions in six forced states:
  - the opening;
  - mid-drain;
  - day 28;
  - «شيجيب 2,250 دينار؟»;
  - the plate with all its words;
  - the notification.

## Credits

- Photo: "INDOMIE AND EGG" by Myelnafaty10, Wikimedia Commons, https://commons.wikimedia.org/w/index.php?curid=142274242. CC0; no credit needed.
- The Indomie logo is from indomie.com and is a trademark of Indofood. This is concept work that Indomie did not commission; the caption says so.
- Music: "Gummies", Mixkit (Stock Music Free License: social media is fine).
