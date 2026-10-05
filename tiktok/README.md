# فَتَرضى: short Qur'an reminders for TikTok and Reels

Short reminder videos (15 s, 1080×1920) made with [Remotion](https://www.remotion.dev). The look started from
[@fy2.e](https://www.tiktok.com/@fy2.e): a white pictogram figure on a black horizon, with Arabic lines fading in. That
video reached 326K views with very simple visuals, so the format works. Ours takes it further:

| | @fy2.e | فَتَرضى |
|---|---|---|
| Size | 576×1024 | 1080×1920 |
| Figure | a still icon | posed and animated: breathes, head bowed; at the verse it lifts its head and opens its hands (or prays, or the rain stops) |
| Ending | a heart-in-hand icon | the verse itself, in Noto Naskh Arabic with full tashkeel, the surah and ayah under it; dawn comes up behind the figure |
| Words | fade in | come in word by word (fade, rise, un-blur), earlier lines dim, then clear for the verse |
| Depth | flat black | stars, drifting dust, a warm rim light on the figure, vignette, fine moving grain |
| Loop | cut | opens from and closes to black, so it loops cleanly (rewatches help reach) |

## The videos

`out/` holds the renders: `<id>.mp4`, `<id>-cover.jpg` (the frame with the verse, for the TikTok cover) and
`avatar.png` (the profile picture).

| File | Scene | Words → verse |
|---|---|---|
| `e01-yusr` | head bowed, lifts at dawn | تمرّ عليك أيام ثقيلة · تعبٌ لا يراه أحد · انتظارٌ طويل · وخوفٌ من القادم · لكنّ الله وعدك → ﴿فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾ الشرح ٥–٦ |
| `e02-fatarda` | hands raised in du'a; a plant grows | تدعو كل ليلة · تنتظر · وتصبر · ولم ترَ الإجابة بعد · اطمئن، فربّك يقول → ﴿وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ﴾ الضحى ٥ |
| `e03-tatmain` | rain, which stops at the verse | قلبك متعب؟ · تفكيرٌ لا يهدأ · وضيقٌ بلا سبب · والدواء أقرب مما تظن → ﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾ الرعد ٢٨ |

The sound is a quiet wind bed (filtered noise made with ffmpeg, no music). On TikTok you can keep it, or turn the
original sound down and add a recitation of the same verse from TikTok's sound library.

## Making a new video

1. Add an entry to `EPISODES` in `src/episodes.ts`: `id`, `scene` (`dawn`, `dua` or `rain`), `intro`, up to 3
   `list` lines, `bridge`, the `verse` split into lines, `ref` and `caption`.
2. **Check the verse letter by letter against a mushaf** (e.g. quran.com) before rendering. Use only Qur'an and
   authentic hadith, and always cite them.
3. `npm run render -- <id>` writes `out/<id>.mp4` and its cover. `node preview.mjs <id> 150 400` renders single frames
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
- **Profile picture:** `out/avatar.png`.
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
