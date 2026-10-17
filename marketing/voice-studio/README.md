# The allawi.psd voice: a Gemini TTS voice profile with a studio finish

The user wanted an AI voice for the reels that sounds like a studio voice-over artist, the same person in every video. None of the women who auditioned for the casting call fit.

There are two parts:
1. **A fixed voice profile** for Google AI Studio (Gemini TTS). The fields below stay word for word the same for every video. Only the script changes, so the voice stays the same person.
2. **`studio.sh`**, a finish for each downloaded take: warmth, presence, even level, softer S sounds, and the top end that Gemini's 24 kHz audio is missing.

## 1. The profile (AI Studio → Generate speech)

- **Model:** `gemini-3.1-flash-tts-preview`. If it isn't listed, `gemini-2.5-pro-preview-tts`; audio tags like `[sighs]` only work on 3.1.
- **Voice:** `Leda` (youthful), with `Despina` (smooth) and `Callirrhoe` (easy-going) as the other candidates. Pick one once by generating the same two lines with each, then keep it for every video; switching voices breaks the "same person" feel.
- **Style:** `Vocal Smile` for light and funny topics, `Conversational` for serious ones. Not Promo/Hype or Newscaster.
- **Pace:** `Natural`.
- **Accent:** `Iraqi Arabic (Baghdadi)`.

**Audio Profile**
```
"Noor", the narrator of the @allawi.psd reels: a 25-year-old woman from Baghdad.
She speaks Iraqi Arabic, Baghdadi dialect only. Never Modern Standard Arabic, never Gulf, Levantine or Egyptian.
A professional voice-over artist with a young, clear, warm voice and a slight smile.
Natural and conversational, like telling a close friend a story, but every word is crisp and well articulated.
She pronounces گ as a hard G ("gaal") and چ as "ch" ("chaan").
```

**Scene**
```
A professional recording studio in Baghdad. She sits close to a high-end condenser microphone in a quiet,
acoustically treated vocal booth: intimate, present and dry, with no room echo and no background noise.
She is relaxed and enjoying the story she is telling.
```

**Sample Context**
```
The voice-over for a 35-40 second Instagram reel. Each line matches a cut in the video, so she takes a short beat
at every ".." and a clear breath between lines. She leans into the key word of each line (the numbers and the
punchlines), and questions rise at the end like real questions. She keeps exactly the same voice, pitch and
energy from the first line to the last.
```

When a script is split in two (see below), add one line to the Sample Context of the second part: `This continues straight on from: «<the last line of part 1>».`

## 2. Writing the script for it

- **Write the dialect the way it sounds:** گ، چ، شكد، هسه، إنو. Gemini reads what is written, so «قال» comes out formal and «گال» comes out Iraqi.
- **Numbers as words:** «ميّة وثمانين ألف», not «180,000».
- **Use «..» for a short beat** and a new line for a breath.
- **Add a shadda where a word could be misread:** الميّة، يمشّيها، غيّر.
- **Use tags sparingly:** at most one or two `[sighs]` or `[laughs]` per video, and only on 3.1.
- **Keep each part to about 25 s.** AI Studio stops at about 30 s. Split at a line break, keep every field the same for both parts, and generate two or three takes of each, keeping the best one.

## 3. The studio finish

```bash
./studio.sh part1.wav            # -> part1-studio.wav (48 kHz, about -16 LUFS)
```

What it does, in order:
- resamples to 48 kHz and cuts rumble below 70 Hz;
- tone: +1.5 dB warmth at 180 Hz, −1.5 dB boxiness at 380 Hz, +1.5 dB presence at 3.5 kHz;
- compression at 2.5:1 for an even, close level;
- S-softening above 5.5 kHz;
- **air, only for a 24 kHz take:** Gemini's 24 kHz audio stops at 12 kHz, a real microphone doesn't. The script doubles the frequencies of the voice's own 6–12 kHz band and mixes back only the new 11.5–15.5 kHz part, quietly. On the dollar reel's first Gemini take (24 kHz, since replaced) this fills the empty 12–16 kHz range (from −41 and −91 dB to −34 and −33 dB relative to 1 kHz) and leaves the sibilance where it was. A 44.1 or 48 kHz download already has a top end, so the script skips this step for it (more would sound harsh);
- loudness to −16 LUFS, true peak −1.5 dBFS.

Then place the takes on the video the way `../hf-dollar-reel/voice.py` places them.

**Listen to the first and last seconds of every take before using it.** On 8 Oct both takes of the dollar reel came with a spoken "free audio post-production by auphonic.com" tag and a jingle, which the TTS made up (it was at the start of one take and the end of the other). Cut it off before the studio finish.

Needs ffmpeg with the `acrossover`, `aeval` and `loudnorm` filters (any recent build).
