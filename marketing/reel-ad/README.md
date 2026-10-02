# VizionIQ — Instagram Reel ad (30s)

A 1080×1920, 30fps reel made with [Remotion](https://remotion.dev), using the website's own look:
navy and electric blue, glass cards, Tajawal type, and the same spring and blur motion.
All text stays inside the Instagram Reels safe area.

## Timeline

| Time | Scene | On screen |
|---|---|---|
| 0:00–0:03.5 | **Hook** | The inbox floods with "بيش؟" messages, then the line "بس ولا طلب!" hits. Counter: 127 messages, 0 orders |
| 0:03.5–0:07 | **Pain** | Cost per message climbs to $3.40 while the ad budget drains, and the money flies away |
| 0:07–0:17 | **AI advisor** | The advisor chat opens. It diagnoses the ad, writes a WhatsApp reply that sells, and calculates profit in dinars |
| 0:17–0:23.5 | **Results** | Cost per message drops into the green (target under $1.5), then what the course teaches: 11 chapters, 13 tools, advisor 24/7 |
| 0:23.5–0:30 | **CTA** | "لا تصرف ولا دولار بعد بدون خطة". 29,000 IQD lifetime, advisor 14,000 IQD/month, a "اشترك هسة" button press, "الرابط بالبايو" |

## Voiceover script (Iraqi dialect)

Record it in one take, at an energetic, confident, conversational pace (about 70 words in 30 seconds).
Each line is timed to its scene.

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
so the default render only has the built-in sound effects.

## Commands

```bash
npm install
npm run studio   # live preview and timeline scrubbing in the browser
npm run render   # writes out/vizion-reel.mp4
npm run still    # writes out/cover.png (use it as the reel cover)
```

If Remotion can't download its browser (offline or CI), pass `--browser-executable=/path/to/chrome-headless-shell`.

## Editing

- **Copy:** each scene lives in `src/scenes/*.tsx`. The text is at the top of each file.
- **Prices and link:** set in `src/scenes/Cta.tsx` (`COURSE_PRICE`, `ADVISOR_PRICE`, `SITE`).
- **Timing:** scene start frames and lengths are in `T`, in `src/theme.ts`.
- **Colors:** set in `src/theme.ts`. They mirror the site's `@theme` tokens.

The $3.40 → $1.20 gauge is labeled "*مثال توضيحي" (illustrative example). The $1.5 target comes from the course content.
Keep that label unless you swap in a real student result.
