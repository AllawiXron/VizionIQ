# Social media post — OPTES 1.0 Flash (spec launch post)

A 4:5 launch post for OPTES (optes.code on TikTok, optes3.com), the Arabic-first AI platform, made by allawi.psd as a
sample to pitch post design to them. Not commissioned. (v1, a lightning photo with one headline, is in git history.)

**Idea.** Their mascot is the AI. The glowing ring on her headphones is OPTES' "O", so it becomes the centre of the
scene: signal rings spread from it across the poster, small electric arcs crackle on it, and gold and cyan light
trails streak past (Flash). Beside her eyes, an Iraqi line about speed:

> إطلاق النموذج الجديد
> قبل لا ترمش،
> **يجاوبك.**
>
> "Before you blink, it answers."

Below: the name in chrome and gold, "OPTES 1.0 Flash⚡", their tagline «سرعة فائقة • جودة عالية • استهلاك أقل», their
four promises as glass cards (استجابات أسرع، ذكاء متقدم، استهلاك أرخص، لجميع المشتركين), their "four models" claim
(Claude Opus 5.5, Claude Sonnet 5.5, DeepSeek, Qwen) as a strip, and the footer: OPTES wordmark as on their site
(Manrope 600, 0.06em), AI FOR EVERYONE · optes3.com, «جرّبه هسة».

- `out/optes-flash.png`: the post, 1620×2025.
- `psd/optes-flash.psd`: layered, 1080×1350: scene, mascot, shade, headphone bloom + light sweep (Screen), feature
  cards + models, headline & text, title + wordmark, grain (Overlay).
- `ad.html`: the layout. `node render.cjs` re-renders the PNG; `node render.cjs --layers` then `python build_psd.py`
  rebuilds the PSD.
- `photo/bg.py`: the scene (`python bg.py ../img/bg.png`): navy glow, signal rings centred on the headphone,
  procedural electric arcs, tapered light trails, dust, vignette.
- `photo/mascot.py`: the mascot (`python mascot.py mascot_cut.png ../img/mascot.png`). `source-mascot.png` is cropped
  from their own Flash post, upscaled 4× with Real-ESRGAN (ONNX, not committed) and cut out with rembg `isnet-anime`
  (`mascot_cut.png`); the script removes the leftovers of their old layout with a keep-polygon traced along her
  hair, dissolves the lower-left into the dark and adds a cyan rim light from the headphone side.

## Credits

- **Mascot, wordmark, colours and wording:** OPTES' own (their Flash launch post, app icon and optes3.com). Their
  trademarks and art; this is a concept to pitch to them.
- **Fonts (Google Fonts, SIL OFL):** Alexandria, Manrope.
