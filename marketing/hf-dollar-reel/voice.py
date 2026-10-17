"""Lay the user's AI voiceover (Google AI Studio, Gemini TTS, a female voice) onto the reel's timeline.

The voice came as two takes made with the voice profile in ../voice-studio (assets/voice/part1.wav: the script up to
«هو الدولار راح ينزل؟»; part2.wav: «محد يدري» to the end). AI Studio gave them as 44.1 kHz MP3s; each had a spoken
"free audio post-production by auphonic.com" tag and jingle that the TTS made up (at the start of part 1, the end of
part 2). Those were cut off and the takes run through ../voice-studio/studio.sh, which is what the two WAVs are.

The takes read slowly, with up to 1.1 s between lines, about 46 s of speech for a 38.8 s video. Each spoken phrase (cut
between the pauses) is placed on its visual beat, which drops the long pauses; two are sped up a little (1.05x, 1.07x)
so a line ends inside its own shot. The result is one track that starts at 0:00 and runs the length of the video:
  assets/voice/voice-aligned.wav   (48 kHz mono, about -16 LUFS)
It also prints when every subtitle word is spoken in the video; those times are the subtitles' data-at in index.html.

  python voice.py          (needs ffmpeg)
then mix it over the rendered sound effects (README: "Voice").

Phrase boundaries come from ffmpeg silencedetect (-40 dB, 0.12 s) on each take. Word times inside a phrase come from
faster-whisper (medium, Arabic, VAD on): the start of a phrase's first word is its silencedetect edge, the others are
whisper's start moved to the quietest point just before it; they are only used for the subtitle times."""
import os, subprocess, json

here = os.path.dirname(os.path.abspath(__file__))
V = lambda n: os.path.join(here, 'assets', 'voice', n)
D = 38.8

# (take, source start, source end, start in the video, tempo)   text for reference
P = [
    ('part1', 0.147, 1.274, 0.08, 1.0),    # 0  الميّة دولار..
    ('part1', 1.587, 3.614, 1.22, 1.05),   # 1  صارت ميّة وثمانين ألف.   («صارت» as the ؟ is torn off, «ألف» with «دينار»)
    ('part1', 4.231, 4.776, 3.20, 1.0),    # 2  وكلها..
    ('part1', 5.053, 6.241, 3.95, 1.0),    # 3  بأسبوع واحد.   («واحد» as the 7th is ringed)
    ('part1', 7.094, 8.202, 5.50, 1.0),    # 4  الدولار صعد..   («صعد» as the seesaw slams)
    ('part1', 8.675, 9.669, 6.64, 1.0),    # 5  والدينار نزل.
    ('part1', 10.635, 11.740, 8.10, 1.0),  # 6  الراتب نفسه..
    ('part1', 12.316, 13.375, 9.25, 1.0),  # 7  بس صار أصغر.   («أصغر» as the salary starts to shrink)
    ('part1', 14.343, 15.354, 10.70, 1.0), # 8  صاحب المولدة..
    ('part1', 15.657, 16.802, 11.95, 1.0), # 9  رفع سعر الأمبير.
    ('part1', 17.698, 19.533, 13.15, 1.0), # 10 وأبو المحل غيّر الأسعار..   («غيّر» as the price is struck)
    ('part1', 19.863, 20.309, 15.15, 1.0), # 11 وگال:
    ('part1', 21.001, 22.352, 15.75, 1.0), # 12 الدولار صاعد عيوني.   («صاعد» as it gets selected)
    ('part1', 23.425, 24.822, 17.15, 1.0), # 13 حتى لفّة الفلافل..
    ('part1', 25.218, 26.601, 18.68, 1.0), # 14 صارت تنحسب بالدولار.
    ('part1', 27.629, 29.656, 20.30, 1.0), # 15 والكل صار يسأل نفس السؤال..
    ('part1', 30.775, 32.143, 23.10, 1.0), # 16 هو الدولار راح ينزل؟   (a beat before it; «ينزل» as it is circled)
    ('part2', 0.235, 1.709, 24.55, 1.0),   # 17 [sigh] محد يدري.
    ('part2', 2.239, 3.151, 26.30, 1.0),   # 18 بس اللي ندريه..
    ('part2', 3.744, 4.634, 27.90, 1.0),   # 19 إنو العراقي..
    ('part2', 5.119, 5.763, 28.95, 1.0),   # 20 يمشّيها.   (underlined as it is said)
    ('part2', 6.423, 8.368, 30.05, 1.07),  # 21 يضحك على الأزمة..
    ('part2', 8.549, 9.196, 31.90, 1.0),   # 22 ويكمّل.   (before the swipe takes the shot away)
    ('part2', 9.985, 10.411, 32.60, 1.0),  # 23 وإنتو؟
    ('part2', 10.865, 12.236, 33.12, 1.0), # 24 الميّة عدكم بيش؟
    ('part2', 12.698, 13.814, 34.53, 1.0), # 25 اكتبوها بالتعليقات.   (as the arrow points down to the comments)
]

# subtitle words: scene -> [(phrase, time of the word in its take)]
W = {
    's2': [(2, 4.231), (3, 5.053), (3, 5.689)],
    's3': [(4, 7.094), (4, 7.525), (5, 8.675), (5, 9.235)],
    's4': [(6, 10.635), (6, 11.173), (7, 12.316), (7, 12.639), (7, 12.909)],
    's5': [(8, 14.343), (8, 14.676), (9, 15.657), (9, 15.871), (9, 16.383)],
    's6a': [(10, 17.698), (10, 18.206), (10, 18.522), (10, 18.814)],
    's7': [(13, 23.425), (13, 23.791), (13, 24.142), (14, 25.218), (14, 25.599), (14, 25.947)],
    's8': [(15, 27.629), (15, 28.133), (15, 28.44), (15, 28.998), (15, 29.251)],
    's9': [(16, 30.775), (16, 31.08), (16, 31.426), (16, 31.658)],
    's10': [(17, 0.953), (17, 1.282)],
    's11': [(18, 2.239), (18, 2.424), (18, 2.53)],
    's12': [(19, 3.744), (19, 4.066), (20, 5.119)],
    's13': [(21, 6.423), (21, 6.82), (21, 7.593), (22, 8.549)],
    's14': [(23, 9.985), (24, 10.865), (24, 11.4), (24, 11.732), (25, 12.698), (25, 13.16)],
}


def at(i, src):
    take, a, b, t, k = P[i]
    return t + (src - a) / k


# no two phrases overlap
for i in range(1, len(P)):
    prev_end = P[i - 1][3] + (P[i - 1][2] - P[i - 1][1]) / P[i - 1][4]
    assert P[i][3] >= prev_end, (i, P[i][3], prev_end)

times = {sc: [round(at(i, s) - 0.05, 2) for i, s in ws] for sc, ws in W.items()}
print(json.dumps(times, ensure_ascii=False))

# one ffmpeg graph: cut each phrase, speed it up if asked, 10 ms fades, delay it to its place, sum, normalise
ins, fl, lab = [], [], []
for i, (take, a, b, t, k) in enumerate(P):
    chain = f'[{0 if take == "part1" else 1}:a]atrim={a - 0.03:.3f}:{b + 0.06:.3f},asetpts=PTS-STARTPTS'
    if k != 1.0:
        chain += f',atempo={k}'
    d = (b - a + 0.09) / k
    chain += f',afade=t=in:d=0.01,afade=t=out:st={d - 0.03:.3f}:d=0.03,adelay={int(round((t - 0.03) * 1000))}'
    fl.append(chain + f'[p{i}]'); lab.append(f'[p{i}]')
fl.append(''.join(lab) + f'amix=inputs={len(P)}:normalize=0,apad=whole_dur={D},atrim=0:{D},aresample=48000,'
          'loudnorm=I=-16:TP=-1.5:LRA=7,'   # the takes already have the studio finish (highpass, EQ, compression)
          f'aresample=48000,apad=whole_dur={D},atrim=0:{D}[out]')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', V('part1.wav'), '-i', V('part2.wav'), '-filter_complex', ';'.join(fl),
                '-map', '[out]', '-ac', '1', '-c:a', 'pcm_s16le', V('voice-aligned.wav')], check=True)
print('ok', V('voice-aligned.wav'))
