# فَتَرضى: short Qur'an reminders for TikTok and Reels

Short reminder videos (16 s, 1080×1920) made with [Remotion](https://www.remotion.dev). The look started from
[@fy2.e](https://www.tiktok.com/@fy2.e): a white pictogram figure on a black horizon, with Arabic lines fading in. That
video reached 326K views with very simple visuals, so the format works. Ours makes it cinematic.

**The shot list** (`KEYS` in `src/Reminder.tsx`)
1. Close, rolled shot tracking the figure as it walks, with footsteps. The first line pops in over it.
2. A whip back to the wide shot: a mirror lake, three layers of mountains with fog, a crescent moon.
3. A slow sideways truck with parallax (far mountains move least, near dust most). Each list line lands with a
   small camera punch.
4. A tilt up to the moon for the bridge line. A shooting star crosses while the riser builds.
5. A drop back to the horizon on the boom: a flash, a camera shake, and dawn breaks with rays behind the mountains.
   The figure lifts its head and opens its hands, and the verse lands word by word.
6. A slow push in on the verse, then a tilt up into the sky as it fades to black, so it loops.

Each video has its own turn at the climax: birds cross the dawn (`dawn`), lanterns rise from the water (`dua`), or the
rain and its rings on the lake stop (`rain`).

**Sound** (`sfx/make_sfx.py`, all synthesized, so nothing can be claimed; no music)
- A soft bubble pop on every word, climbing a little within each line.
- Deeper water drops on the words of the verse.
- Whooshes on the camera moves, footsteps, a sparkle for the shooting star.
- A riser into a low boom with an airy shimmer at the verse.
- Wind (and rain) underneath. The mix peaks at −2.7 dBFS.

## The videos

`out/` holds the renders: `<id>.mp4`, `<id>-cover.jpg` (the frame with the verse, for the TikTok cover) and
`avatar.png` (the profile picture).

| File | Scene | Words → verse |
|---|---|---|
| `e01-yusr` | walks in head bowed; dawn, birds | تمرّ عليك أيام ثقيلة · تعبٌ لا يراه أحد · انتظارٌ طويل · وخوفٌ من القادم · لكنّ الله وعدك → ﴿فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾ الشرح ٥–٦ |
| `e02-fatarda` | hands raised in du'a; lanterns rise from the lake | تدعو كل ليلة · تنتظر · وتصبر · ولم ترَ الإجابة بعد · اطمئن، فربّك يقول → ﴿وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ﴾ الضحى ٥ |
| `e03-tatmain` | rain on the lake, which stops at the verse | قلبك متعب؟ · تفكيرٌ لا يهدأ · وضيقٌ بلا سبب · والدواء أقرب مما تظن → ﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾ الرعد ٢٨ |

On TikTok keep the original sound (the effects are the point). If you add a recitation from TikTok's sound library
as well, set the original to about 50%.

## Making a new video

1. Add an entry to `EPISODES` in `src/episodes.ts`: `id`, `scene` (`dawn`, `dua` or `rain`), `intro`, up to 3
   `list` lines, `bridge`, the `verse` split into lines, `ref` and `caption`.
2. **Check the verse letter by letter against a mushaf** (e.g. quran.com) before rendering. Use only Qur'an and
   authentic hadith, and always cite them.
3. `python sfx/make_sfx.py` once (or after changing a sound), then `npm run render -- <id>` writes `out/<id>.mp4` and its cover. `node preview.mjs <id> 150 400` renders single frames
   to check, and `npm run studio` opens the live editor.

Setup: `npm install` (Node 18+). The brand name and handle are in `BRAND` in `src/episodes.ts`, and they appear small
under the figure.

Ready verses for the next videos (check each one before use):
﴿لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا﴾ البقرة ٢٨٦ ·
﴿وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ﴾ يوسف ٨٧ ·
﴿وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ﴾ البقرة ١٨٦ ·
﴿وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا﴾ الطلاق ٢ ·
﴿إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ﴾ الزمر ١٠ ·
﴿وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ﴾ البقرة ٢١٦ ·
﴿إِنَّ اللَّهَ مَعَ الصَّابِرِينَ﴾ البقرة ١٥٣ ·
﴿فَاذْكُرُونِي أَذْكُرْكُمْ﴾ البقرة ١٥٢ ·
﴿ادْعُونِي أَسْتَجِبْ لَكُمْ﴾ غافر ٦٠ ·
﴿لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا﴾ التوبة ٤٠

## Account kit

- **Name:** فَتَرضى, handle `@fatarda` (from ﴿وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ﴾). If it's taken, try `@fatarda.iq` or
  `@fatarda_`. Other names: سَكينة · يُسرًا · اطمئن.
- **Profile picture:** `out/avatar.png` (the figure on the lake under the crescent moon, at first light).
- **Bio:**
  > ﴿وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ﴾
  > تذكير يومي بآية تطمّن القلب 🤍
- **Posting:** one video a day, ideally between 9 and 11 pm Iraq time, when people scroll before sleep and this
  content lands best. On Fridays, post a reminder about سورة الكهف and الصلاة على النبي ﷺ.
- **Each post:** paste the episode's `caption`, set `<id>-cover.jpg` as the cover, and pin the 3 best videos.
- **Hashtags:** `#قرآن #تذكير #اكسبلور #fyp`, plus one on the topic (`#دعاء`, `#ذكر_الله`, `#صبر`).

## Credits

Fonts: Readex Pro and Noto Naskh Arabic (Google Fonts, SIL OFL). Remotion is free for individuals and companies of up
to 3 people (see remotion.dev/license).
