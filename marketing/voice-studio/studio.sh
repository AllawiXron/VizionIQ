#!/usr/bin/env bash
# Studio finish for a Gemini TTS take downloaded from Google AI Studio (a 24 kHz WAV).
#   ./studio.sh take.wav [out.wav]      -> 48 kHz mono WAV at about -16 LUFS, peaks under -1.5 dBFS
# Gemini's 24 kHz audio stops at 12 kHz, which is what makes it sound a little dull next to a real microphone.
# The chain, in order:
#   - resample to 48 kHz, cut rumble below 70 Hz;
#   - tone: +1.5 dB warmth at 180 Hz, -1.5 dB boxiness at 380 Hz, +1.5 dB presence at 3.5 kHz;
#   - gentle compression (2.5:1 from -22 dB) for an even, close "radio" level;
#   - S-softening: the band above 5.5 kHz gets its own fast compressor;
#   - air, only for a take at 24 kHz or lower: the 6-12 kHz band is rectified, which doubles its frequencies, and only the
#     new 11.5-15.5 kHz part is mixed back in, 4 dB down, so the top end the TTS never had comes from the voice's own
#     harmonics. A take that already has a top end (44.1/48 kHz downloads) skips it; adding more would make it harsh;
#   - loudness to -16 LUFS (true peak -1.5 dBFS).
set -euo pipefail
in="$1"
out="${2:-${in%.*}-studio.wav}"
rate=$(ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate -of csv=p=0 "$in")
hp6="highpass=f=6000,highpass=f=6000,highpass=f=6000"
hp115="highpass=f=11500,highpass=f=11500,highpass=f=11500,highpass=f=11500"
if [ "$rate" -le 24000 ]; then
  air="asplit[m][h];[h]$hp6,aeval='abs(val(0))',$hp115,lowpass=f=15500,volume=-4dB[air];[m][air]amix=inputs=2:normalize=0,"
else
  air=""
fi
ffmpeg -y -loglevel error -i "$in" -filter_complex "\
[0:a]aresample=48000:resampler=soxr,highpass=f=70:poles=2,\
equalizer=f=180:t=q:w=1:g=1.5,equalizer=f=380:t=q:w=1.4:g=-1.5,equalizer=f=3500:t=q:w=1:g=1.5,\
acompressor=threshold=-22dB:ratio=2.5:attack=5:release=100:knee=4,\
acrossover=split=5500:order=4th[lo][hi];\
[hi]acompressor=threshold=-30dB:ratio=3:attack=0.5:release=40:knee=2[hic];\
[lo][hic]amix=inputs=2:normalize=0,${air}loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000[o]" \
  -map "[o]" -ac 1 -c:a pcm_s16le "$out"
echo "$out (source ${rate} Hz, air $([ -n "$air" ] && echo added || echo skipped))"
