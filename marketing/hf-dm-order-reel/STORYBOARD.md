---
format: 1080x1920
duration: 31s
message: "تطلب تصاميمك برسالة وحدة: دزّلي «أريد ٣ بوستات» وتوصلك."
arc: Hook (the result) → The message → Samples → Every field → The receipt → Your turn
audience: Iraqi shop, restaurant and small-brand owners scrolling Instagram
mode: collaborative
version: v1
---

# DM order reel (allawi.psd): storyboard v1

## Decisions

- **Message:** ordering designs from allawi.psd takes one message; send «أريد ٣ بوستات» and it's done.
- **Audience and arc:** Iraqi business owners on Instagram, most watching with the sound off. Result first, then the
  whole order replayed as a DM, then the price, then the viewer's turn.
- **Format:** 1080×1920, 31 s, voiceover yes (Noor, Gemini TTS, 6 short lines), music bed yes, chat sounds yes.
  No separate caption track: everything Noor says is also on screen (chat, receipt, headline).
- **The spine:** one Instagram DM with allawi.psd, seen from the customer's side (the viewer is the customer). The
  header «allawi.psd» stays on screen from 0:03 to the end. The **send button** is the hero prop: the customer presses
  it in beat 02; in beat 06 it returns, pulsing, for the viewer.
- **Direction rule:** everything moves upward, the way a chat scrolls. Messages rise, the receipt feeds down and leaves
  upward, the reply chips rise.
- **Brand:** paper `#ece3d4` (canvas, with grain), ink `#1f1510` (text), orange `#e2541b` (customer bubbles, send
  button, stamp, focal accents), orange light `#f07a2e` (glows), cream `#fbf3e6` (allawi.psd bubbles, receipt paper).
  Display: Alexandria 800/900. Chat and UI: IBM Plex Sans Arabic 400/500/600. Both embedded from `assets/fonts`.
- **Bans:** no Instagram purple gradient (orange instead); no verified badge; no real brand presented as a client; no
  gradient text; no glow halos on text. Motion failures to avoid: the slideshow (every beat a fresh card; the chat
  persists instead) and the screensaver (motion with nothing to say).
- **Held frame:** the last 1.5 s of beat 06 do not move: the chips, the pulsing send button settles, the handle holds.
- **Truthfulness:** the chat is a demonstration of how ordering works, with an unnamed restaurant owner; it is not a
  real client conversation. The images are the user's real concept designs, sent as «نماذج من شغلي». The prices are
  the user's confirmed bundle prices.

## Voiceover (Noor) — written after approval, fitted to these beats

1. 0.2 s «تريد تصاميم لمحلك؟»  2. 1.5 s «كلها تبدي برسالة وحدة.»  3. 8.6 s «تشوف نماذج من الشغل قبل لا تقرر.»
4. 14.2 s «لمطعمك، لعيادتك، لمتجرك.. لكل مجال.»  5. 19.6 s «والسعر واضح من أول رسالة.»
6. 25.2 s «اختار باقتك.. ودزّها لـ allawi.psd.»

## Frame 1 — 01-hook (0.0–3.0, 3.0 s)

- status: outline
- src: compositions/frames/01-hook.html
- duration: 3s
- transition_in: cut
- scene: Three finished posts slam down in a fan on paper; a DM notification drops: «تصاميمك جاهزة ✅»
- voiceover: "تريد تصاميم لمحلك؟ كلها تبدي برسالة وحدة."
- blueprint: kinetic-type-beats (Hook) + rules spring-pop-entrance, motion-blur-streak
- audio: three paper slams 0.1 / 0.35 / 0.6 s; notification ding 0.9 s; music bed starts
- why: lands the value first, in outcome language: the finished designs, and that they came from one message.

On screen: brand paper with grain. Three of the user's posts SLAM down one after another, fanned (Saj Al-Reef quzi
offer centre, «چان بربع» left tilted −8°, the luxury samoon box right tilted +7°). An Instagram notification banner
DROPS from the top: allawi.psd avatar, «allawi.psd», «تصاميمك جاهزة ✅ ٣ بوستات». Headline at the bottom, two lines,
Alexandria 900: «كل هذا..» then «برسالة وحدة.» with «وحدة» in orange. First motion within 0.1 s. Constraint: no
logo sting, no title card; the first frame already shows designs. Seam out: the camera pushes into the notification
banner (motion-blur streak), which becomes the chat header.

## Frame 2 — 02-the-message (3.0–8.2, 5.2 s)

- status: outline
- src: compositions/frames/02-the-message.html
- duration: 5.2s
- transition_in: zoom-through (from the notification)
- scene: The DM opens; the customer types «هلو 👋 عندي مطعم، أريد ٣ بوستات» and presses send
- voiceover: (none: the typing carries it)
- blueprint: prompt-type-submit-generate (Adapt: the prompt is a DM, submit is send) + rules discrete-text-sequence,
  press-release-spring
- audio: key clicks under the typing 3.6–6.3 s; send whoosh 6.4 s; incoming tone 7.6 s
- why: shows the exact message to send. People copy what they see.

On screen: the DM card fills the frame (cream screen, rounded corners, 40 px paper margin). Header: avatar,
«allawi.psd», «مصمم إعلانات · نشط الآن». The input field at the bottom TYPES ON «هلو 👋 عندي مطعم، أريد ٣ بوستات»
(a caret blinks, a few letters at a time). The orange send button PRESSES (press-release spring) and the message rises
into an orange bubble on the right, «تم الإرسال». allawi.psd's typing dots pulse on the left, then the reply SLIDES
in: «تدلل 🌹 هاي نماذج من شغلي:». Constraint: no keyboard art; only the input field, so the text stays large (52 px).
Seam out: continuous, the chat scrolls up.

## Frame 3 — 03-samples (8.2–13.6, 5.4 s)

- status: outline
- src: compositions/frames/03-samples.html
- duration: 5.4s
- transition_in: continuous scroll
- scene: Three image messages arrive from allawi.psd; the camera pushes in on each
- voiceover: "تشوف نماذج من الشغل قبل لا تقرر."
- blueprint: device-surface-showcase (Adapt: the chat is the held surface) + rules spring-pop-entrance,
  coordinate-target-zoom
- audio: soft pop 8.4 / 9.9 / 11.4 s; a short whoosh with each push-in
- why: proof. Real work arrives in the same chat the viewer will use.

On screen: three image bubbles arrive on the left, one at a time (Saj Al-Reef, «چان بربع», the samoon box), each
RISING with a small bloom of orange light behind it. The camera PUSHES IN on each image as it lands (holds ~0.9 s at
about 80 % of the frame width, so the design reads), then eases back while the next one rises. A small grey label
under the last one: «نماذج من شغلي». Constraint: no fake "seen" receipts or delivery claims. Seam out: continuous,
the chat scrolls up.

## Frame 4 — 04-every-field (13.6–18.6, 5.0 s)

- status: outline
- src: compositions/frames/04-every-field.html
- duration: 5s
- transition_in: continuous scroll, then the grid grows out of a bubble
- scene: «وتسوي لغير المطاعم؟» → a grid of six samples from other fields assembles out of the chat
- voiceover: "لمطعمك، لعيادتك، لمتجرك.. لكل مجال."
- blueprint: grid-card-assemble (Benefits) + rules waterfall-entry
- audio: six light ticks 15.0–15.5 s (the cascade); a soft whoosh as the grid gathers back at 18.2 s
- why: answers "but I'm not a restaurant": every kind of business gets the same quality.

On screen: the customer asks «وتسوي لغير المطاعم؟» (orange bubble). allawi.psd answers with an album bubble that
EXPANDS into a 2×3 grid over the chat: Al-Shifa lab (عيادة), Al-Faqma (أجهزة), Miswag (متجر), WARD (تجميل),
Kactus (هاند ميد), Sala (بقالة). Tiles ASSEMBLE in a staggered cascade (total stagger ≤ 0.5 s), each with a small
cream field label. A line above: «نماذج من شغلي · لكل مجال». The grid holds ~2.5 s, then GATHERS back into the
bubble. Constraint: no logos wall, no "trusted by"; these are samples. Seam out: the chat scrolls up.

## Frame 5 — 05-receipt (18.6–24.6, 6.0 s)

- status: outline
- src: compositions/frames/05-receipt.html
- duration: 6s
- transition_in: continuous scroll
- scene: «يا سلام 😍 شكد؟» → a paper receipt prints out of the chat: ٣ بوستات, 42,000 struck, 40,000 counts up, stamped
- voiceover: "والسعر واضح من أول رسالة."
- blueprint: agent-progress-theater (Adapt: the receipt cascades) + rules counting-dynamic-scale,
  css-marker-patterns (strike-through), spring-pop-entrance (stamp)
- audio: receipt printer 19.6–21.4 s; count-up ticks 21.5–22.3 s; stamp thunk 22.8 s
- why: the price question is answered before it's asked. A clear price turns interest into a message.

On screen: the customer: «يا سلام 😍 شكد؟». From the top of the chat a cream paper receipt FEEDS DOWN in steps (like
a printer), torn zigzag edges, ink text: «allawi.psd» / «طلبية جديدة» / dotted rule / «٣ بوستات سوشيال ميديا» /
«السعر» with «٤٢,٠٠٠» and an orange marker strike / «٤٠,٠٠٠ د.ع» counting up large / dotted rule / «شكراً لثقتك 🌹».
An orange rubber stamp STAMPS across the corner: «تم الطلب ✓». Constraint: no delivery-time or revision promises
(not confirmed by the user). Seam out: the receipt slides up and out; the chat returns.

## Frame 6 — 06-your-turn (24.6–31.0, 6.4 s)

- status: outline
- src: compositions/frames/06-your-turn.html
- duration: 6.4s
- transition_in: continuous (the receipt leaves upward)
- scene: Quick-reply chips rise: ٣ بوستات · ٥ بوستات · باقة شهرية; a tap fills the input; the send button pulses
- voiceover: "اختار باقتك.. ودزّها لـ allawi.psd."
- blueprint: cta-morph-press (Adapt: chip tap, then the send button pulses for the viewer) + rules
  cursor-click-ripple, press-release-spring, sine-wave-loop
- audio: three soft pops as the chips rise 24.9 / 25.05 / 25.2 s; tap 26.6 s; pulse ping 27.6 s; music resolves 30.5 s
- why: the call to action, made concrete: three ready-made messages and the button to send one. Callback to beat 02's
  send button.

On screen: headline at the top over the paper, Alexandria 900: «دورك 👇» then «دزّلي وحدة منهن». Above the input,
three quick-reply chips RISE: «٣ بوستات · ٤٠ ألف», «٥ بوستات · ٦٥ ألف», «باقة شهرية · ٩٠ ألف» with a small line
«٨ بوستات + ٤ ستوري» under the last. A tap ripple lands on «٣ بوستات»; it fills the input field: «أريد ٣ بوستات».
The orange send button PULSES (it is not pressed; that's the viewer's job). Bottom: «@allawi.psd». The last 1.5 s
hold still (held frame). Constraint: no "link in bio", no phone number; the DM is the only action.
