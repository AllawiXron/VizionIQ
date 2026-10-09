#!/usr/bin/env bash
# The music bed: "Gummies" (Mixkit, Stock Music Free License: social posts and online ads allowed), the 25 s cut in
# ../hf-allawi-promo/assets/music, stretched to the reel's 31 s by repeating four bars. It is 120 BPM with the beat
# grid at 0.03 s + 0.5 s n, so the splice sits on a bar line: 0–16.06 s, then 8.03–23.0 s again (30 ms crossfade),
# then a 1.4 s fade-out so it resolves on the held last frame. -> assets/music/bed.wav (gitignored, like the source)
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -y -loglevel error -i assets/music/gummies.wav -filter_complex \
  "[0:a]asplit[x][y];[x]atrim=0:16.06,asetpts=PTS-STARTPTS[a];[y]atrim=8.03:23.0,asetpts=PTS-STARTPTS[b];\
   [a][b]acrossfade=d=0.03:c1=tri:c2=tri,afade=t=out:st=29.6:d=1.4,atrim=0:31[o]" -map "[o]" -ar 48000 assets/music/bed.wav
ffprobe -v error -show_entries format=duration -of csv=p=0 assets/music/bed.wav
