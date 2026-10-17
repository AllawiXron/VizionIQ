#!/usr/bin/env bash
# The music bed: "Arab Nights" by Arulo (Mixkit, free licence: https://mixkit.co/license/#musicFree), track 12.0–37.0 s,
# so the drop (track 16.0 s) lands at 4.0 s, on the «محد طلبه» stamps. Big hits every 2 s after that (6, 8, 10 … 24).
# The file is not committed (the licence doesn't allow passing the track on as a file); this script rebuilds it.
set -e
cd "$(dirname "$0")"
mkdir -p assets/music
[ -f assets/music/arab-nights.mp3 ] || curl -sSfL -o assets/music/arab-nights.mp3 https://assets.mixkit.co/music/460/460.mp3
ffmpeg -v error -y -ss 12.0 -t 25.0 -i assets/music/arab-nights.mp3 -af "afade=t=out:st=24.2:d=0.8" -ar 48000 -ac 2 assets/music/bed.wav
echo assets/music/bed.wav
