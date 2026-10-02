# VizionIQ — Instagram Reel ad (30s)

A 1080×1920, 30fps reel built in [Remotion](https://remotion.dev). There are two cuts:

| Composition | Style |
|---|---|
| `VizionReel` (default) | Kinetic typography in the style of the earlier Vizion ad. The camera whips across one big canvas with real motion blur. Thin lead-in lines lead into bold keywords, and marker and selection boxes draw in behind words. 3D emoji pop in, cards fly in tilted, blue graphic wipes and a grid-paper contrast section break it up, and the logo resolves at the end. |
| `VizionReelGlass` | The first cut: a Liquid Glass product demo with glass cards. |

All text sits inside the Instagram Reels safe area. The 3D emoji are Microsoft's Fluent Emoji (MIT license).

## Timeline (VizionReel)

| Time | On screen |
|---|---|
| 0:00 | "إعلانك يجيب رسايل **هواية…**" while "بيش؟" chips pop all over |
| 0:01.7 | Camera whips down to a red box reading "**بس ولا طلب!**" 😱, with "طلبات اليوم: 0" |
| 0:03.5 | Whip right: "وكل رسالة **دا تدفع عليها**" and a coin flip; the price ticks up to $3.40 per message |
| 0:05.4 | Glide down: "وفلوسك دا تروح **بالهوا**" as money with wings flies away |
| 0:07 | Blue shapes wipe in: the VZ logo assembles, "هنا يجي [مستشار فيزيون الذكي]", and the robot card flies in |
| 0:09 | The advisor chat: the seller types the problem, the diagnosis pops in, then "ويشخصلك وين دا تخسر **بالضبط**" 🎯 |
| 0:12.6 | Whip: "ويكتبلك [الرد اللي يبيع]" as the WhatsApp reply card flies in and gets copied 🤑 |
| 0:15 | "ويحسبلك ربحك الصافي **بالدينار**" with a +11,500 IQD counter 💰 |
| 0:17 | Circle wipe to grid paper: "تتعلم شلون…", then three beats: lower the cost per message ($3.40 struck out, $1.20 shown), reach the serious buyer (the "بيش؟" crowd crossed out), turn messages into orders |
| 0:23 | Band wipe back to navy: "لا تصرف ولا دولار بعد / **بدون خطة.**" with a hand-drawn circle |
| 0:25.6 | Logo and the offer card: 29,000 IQD lifetime, advisor 14,000 IQD/month. The "اشترك هسة" button gets tapped, then "الرابط بالبايو" |

## Voiceover script (Iraqi dialect)

Record it in one take, at an energetic, confident, conversational pace (about 70 words in 30 seconds).
The text on screen follows these lines, so pause where the lines break.

```
0:00  إعلانك يجيب رسايل هواية… بس ولا طلب!
0:03  وكل رسالة دا تدفع عليها… وفلوسك دا تروح بالهوا.
0:07  هنا يجي مستشار فيزيون الذكي. تحجيله شنو صاير بإعلانك… ويشخصلك وين دا تخسر بالضبط.
0:12  ويكتبلك الرد اللي يبيع، ويحسبلك ربحك الصافي بالدينار.
0:17  وويا الكورس تتعلم شلون تنزّل سعر الرسالة، توصل للزبون الجاد، وتحوّل الرسايل لطلبات.
0:23  لا تصرف ولا دولار بعد بدون خطة. اشترك هسة… الرابط بالبايو.
```

To add the voiceover, put it in `public/voiceover.mp3` and render with:

```bash
npx remotion render VizionReel out/vizion-reel-vo.mp4 --props='{"voiceover":"voiceover.mp3","music":"","sfxVolume":0.5}'
```

`music` works the same way. Most reels do better with a trending sound added inside Instagram,
so the default render only has the built-in sound effects (whooshes on every camera whip, pops, ticks and chimes).

## Commands

```bash
npm install
npm run studio   # live preview and timeline scrubbing in the browser
npm run render   # writes out/vizion-reel.mp4
npm run still    # writes out/cover.png (use it as the reel cover)
npx remotion render VizionReelGlass out/glass.mp4   # the first cut
```

If Remotion can't download its browser (offline or CI), pass `--browser-executable=/path/to/chrome-headless-shell`.

## Editing (VizionReel)

- **Copy and timing per phrase:** `src/kinetic/beats.tsx`. Each beat sets its text and the frame each element appears on.
- **Camera path:** `src/kinetic/camera.ts`. `P` holds where each beat sits on the canvas; `MOVES` sets when the camera whips or glides there.
- **Primitives:** `src/kinetic/k.tsx`. `Lead`, `Bold`, `Mark` (marker or selection box), `Strike`, `CrossOut`, `HandCircle`, `Emoji`, `FlyCard` and `VZLogo`.
- **Wipes and backgrounds:** `src/kinetic/KineticReel.tsx`.

The $3.40 → $1.20 numbers are labeled "*مثال توضيحي" (illustrative example). The $1.5 target comes from the course content.
Keep that label unless you swap in a real student result.
