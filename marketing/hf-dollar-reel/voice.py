"""Lay the user's AI voiceover (Google AI Studio, Gemini TTS, a female voice) onto the reel's timeline.

The voice came as two takes (assets/voice/part1.wav, part2.wav, 24 kHz mono). Each spoken phrase (cut between the
pauses) is placed on its visual beat, a few are sped up a little (never past 1.12x) so a line ends inside its own shot,
and the result is one track that starts at 0:00 and runs the length of the video:
  assets/voice/voice-aligned.wav   (48 kHz mono, about -16 LUFS)
It also prints when every subtitle word is spoken in the video; those times are the subtitles' data-at in index.html.

  python voice.py          (needs ffmpeg)
then mix it over the rendered sound effects (README: "Voice").

Phrase boundaries come from ffmpeg silencedetect (-40 dB, 0.12 s) on each take; word times inside a phrase come from
faster-whisper (medium, Arabic, VAD on) and are only used for the subtitle times."""
import os, subprocess, json

here = os.path.dirname(os.path.abspath(__file__))
V = lambda n: os.path.join(here, 'assets', 'voice', n)
D = 38.8

# (take, source start, source end, start in the video, tempo)   text for reference
P = [
    ('part1', 0.217, 1.235, 0.08, 1.0),    # 0  الميّة دولار..
    ('part1', 1.530, 3.448, 1.22, 1.0),    # 1  صارت ميّة وثمانين ألف.   («صارت» as the ؟ is torn off)
    ('part1', 3.874, 4.452, 3.20, 1.0),    # 2  وكلها..
    ('part1', 4.815, 5.970, 3.95, 1.0),    # 3  بأسبوع واحد.
    ('part1', 6.622, 7.689, 5.50, 1.0),    # 4  الدولار صعد..   («صعد» as the seesaw slams)
    ('part1', 7.977, 9.003, 6.60, 1.0),    # 5  والدينار نزل.
    ('part1', 9.291, 10.368, 8.10, 1.0),   # 6  الراتب نفسه..
    ('part1', 10.661, 11.503, 9.25, 1.0),  # 7  بس صار أصغر.
    ('part1', 12.078, 13.255, 10.70, 1.0), # 8  صاحب المولدة..
    ('part1', 13.512, 14.614, 11.95, 1.0), # 9  رفع سعر الأمبير.
    ('part1', 15.203, 15.958, 13.22, 1.12),# 10 وأبو المحل
    ('part1', 16.220, 17.169, 13.95, 1.12),# 11 غيّر الأسعار..
    ('part1', 17.436, 17.880, 15.15, 1.0), # 12 وگال:
    ('part1', 18.217, 19.590, 15.75, 1.0), # 13 الدولار صاعد عيوني.   («صاعد» as it gets selected)
    ('part1', 20.150, 21.682, 17.15, 1.05),# 14 حتى لفّة الفلافل..
    ('part1', 21.977, 23.462, 18.68, 1.05),# 15 صارت تنحسب بالدولار.
    ('part1', 24.185, 26.150, 20.30, 1.0), # 16 والكل صار يسأل نفس السؤال..
    ('part1', 26.835, 27.305, 22.68, 1.0), # 17 هو
    ('part1', 27.656, 28.910, 23.27, 1.0), # 18 الدولار راح ينزل؟   («ينزل» as it is circled)
    ('part2', 0.164, 1.797, 24.55, 1.0),   # 19 [sigh] محد يدري.
    ('part2', 2.567, 3.388, 26.30, 1.0),   # 20 بس اللي ندريه..
    ('part2', 4.128, 4.882, 27.90, 1.0),   # 21 إنو العراقي..
    ('part2', 5.485, 6.042, 28.95, 1.0),   # 22 يمشّيها.
    ('part2', 6.984, 8.024, 30.05, 1.0),   # 23 يضحك على الأزمة..
    ('part2', 8.300, 9.080, 31.12, 1.0),   # 24 [chuckle]
    ('part2', 9.330, 9.970, 31.92, 1.0),   # 25 ويكمّل.
    ('part2', 11.189, 11.639, 32.60, 1.0), # 26 وإنتو؟
    ('part2', 12.620, 13.916, 33.12, 1.0), # 27 الميّة عدكم بيش؟
    ('part2', 15.018, 16.086, 34.50, 1.0), # 28 اكتبوها بالتعليقات.
]

# subtitle words: scene -> [(phrase, time of the word in its take)]
W = {
    's2': [(2, 3.874), (3, 4.815), (3, 5.51)],
    's3': [(4, 6.622), (4, 7.18), (5, 7.977), (5, 8.50)],
    's4': [(6, 9.41), (6, 9.99), (7, 10.73), (7, 10.95), (7, 11.13)],
    's5': [(8, 12.12), (8, 12.54), (9, 13.512), (9, 13.83), (9, 14.15)],
    's6a': [(10, 15.203), (10, 15.57), (11, 16.22), (11, 16.62)],
    's7': [(14, 20.27), (14, 20.65), (14, 21.07), (15, 22.0), (15, 22.48), (15, 22.90)],
    's8': [(16, 24.19), (16, 24.67), (16, 25.01), (16, 25.41), (16, 25.69)],
    's9': [(17, 26.85), (18, 27.656), (18, 28.22), (18, 28.50)],
    's10': [(19, 0.96), (19, 1.38)],
    's11': [(20, 2.567), (20, 2.87), (20, 3.01)],
    's12': [(21, 4.128), (21, 4.41), (22, 5.485)],
    's13': [(23, 6.984), (23, 7.49), (23, 7.61), (25, 9.33)],
    's14': [(26, 11.21), (27, 12.67), (27, 13.05), (27, 13.41), (28, 15.018), (28, 15.42)],
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

# one ffmpeg graph: cut each phrase, speed it up if asked, 10 ms fades, delay it to its place, sum, clean up, normalise
ins, fl, lab = [], [], []
for i, (take, a, b, t, k) in enumerate(P):
    chain = f'[{0 if take == "part1" else 1}:a]atrim={a - 0.03:.3f}:{b + 0.06:.3f},asetpts=PTS-STARTPTS'
    if k != 1.0:
        chain += f',atempo={k}'
    d = (b - a + 0.09) / k
    chain += f',afade=t=in:d=0.01,afade=t=out:st={d - 0.03:.3f}:d=0.03,adelay={int(round((t - 0.03) * 1000))}'
    fl.append(chain + f'[p{i}]'); lab.append(f'[p{i}]')
fl.append(''.join(lab) + f'amix=inputs={len(P)}:normalize=0,apad=whole_dur={D},atrim=0:{D},aresample=48000,'
          'highpass=f=80,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-16:TP=-1.5:LRA=7,'
          f'aresample=48000,apad=whole_dur={D},atrim=0:{D}[out]')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', V('part1.wav'), '-i', V('part2.wav'), '-filter_complex', ';'.join(fl),
                '-map', '[out]', '-ac', '1', '-c:a', 'pcm_s16le', V('voice-aligned.wav')], check=True)
print('ok', V('voice-aligned.wav'))
