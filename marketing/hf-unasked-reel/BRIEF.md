---
workflow: general-video
flow: automation
storyboard: no
message: "سوّى إعلانات لأكبر شركات العراق ومحد طلبها منه: تخيّل شيسوي لمحلك. والسعر مو بالخاص: ٣ بوستات بـ٤٠ ألف."
destination: instagram-reels
aspect: 1080x1920
language: ar-IQ
audience: Iraqi shop, restaurant and clinic owners who scroll Instagram, mostly with the sound off
length: 25s
angle: the user's unofficial brand ads, each stamped «محد طلبه», as proof of what he can do for a small shop
voice: gemini-noor
---

## Intent

The sales reel for @allawi.psd, v2. The user wants a reel strong enough that business owners DM him "I want 3 posts".

v1 (`../hf-dm-order-reel`, a mocked-up Instagram DM) was rejected on 9 Oct: "the ad feels like ai made it and its
boring", and "i dont like those posts where its the samoon stuff i hate it". Asked to choose a new direction, the user
said: "idk just try to see other people how they make ad to get people and make better than them", and picked the
posts: "the newest posts which was the pepsi, super qi, iraqi airways, and etc..., ثنينهم (quzi), افحص كلشي (lab)".

What other designers' promo reels do (research, 9 Oct): a montage of posts on mockups with a trending song, a price
list that says «السعر بالخاص», a fake chat, or a plain before/after. There is rarely a hook or a story, and the price
is usually hidden. This reel beats them on three points:
- **A hook with a joke and a surprise:** Pepsi, Qi Card, Iraqi Airways, Asiacell and talabat ads land one per beat,
  then each is stamped «محد طلبه» (nobody asked for it) on the music's drop. The stamp is also the honest label.
- **Proof of craft, not a template:** one ad comes apart into its real layers in 3D.
- **The price out loud:** a «السعر.. بالخاص 🤫» sticky note is crossed out and ripped off; the prices are underneath.

Look: the dollar reel's handmade collage (`../hf-dollar-reel`), which the user loved: paper, tape, pins, marker,
rubber stamps, kraft tags, stop-motion on twos, film grain, flash frames.

## Assets

- `assets/work/`: the five 2026 brand concept ads (`../brand-ads-2026/out`), quzi (`saj`) and the lab (`shifa`).
- `assets/layers/iqa/`: the Iraqi Airways ad's real layers (`../brand-ads-2026/layers/iraqiairways`).
- Banned: `rubu` and `lux` (the samoon / Iraqi-food-as-luxury posts).
- Paper, backgrounds, sound effects and fonts: from `../hf-dollar-reel` and `../brand-ads-2026/fonts`.

## Customizations

- Prices on screen and in the voice (confirmed bundle prices): ٣ بوستات ٤٠ ألف · ٥ بوستات ٦٥ ألف · باقة شهرية ٩٠ ألف
  (٨ بوستات + ٤ ستوري).
- Voice: Noor (`../voice-studio`), third person ("سوّى", "دزّله"), script in `VOICE-SCRIPT.md`.
- Music: "Arab Nights" by Arulo (Mixkit, free licence), from 12.0 s of the track, so its drop lands on the stamps.
- Honesty: the brand ads are unofficial concepts. On screen: «محد طلبه» stamps and «إعلانات غير رسمية · فكرة وتصميم
  @allawi.psd»; in the caption: the concept label and the photo credits.
