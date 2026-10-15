#!/usr/bin/env bash
# Copies the sounds this reel uses from the user's own pack (../sfx-pack; run its fetch.sh first) into assets/sfx
# (not committed), as 48 kHz stereo PCM so cue times stay exact.
set -e
cd "$(dirname "$0")"
S=../sfx-pack/files
mkdir -p assets/sfx
while IFS='|' read -r name src; do
  [ -s "assets/sfx/$name.wav" ] || ffmpeg -nostdin -loglevel error -y -i "$S/$src" -ar 48000 -ac 2 -c:a pcm_s16le "assets/sfx/$name.wav"
done <<'LIST'
uiclick|Ui Sound Effects/Ui Click Digital 03.wav
data|Data Collect/Data Collect.wav
select|Ui Sound Effects/Ui Granular, Button, Select.wav
click2|Clicks/Click 2.wav
clickb|Clicks/Click_2.wav
sweet|Pop/Sweet UI Open.wav
mpop|Pop/Meadia Pop.wav
softpop|Pop/Slow And Smooth Pop.wav
simple|Whooshes/Simple Whoosh.wav
cinfast|Whooshes/Cinematic Fast Normal Whoosh.wav
wclick|whoosh click.wav
cinclick|Clicks/Cinematic Click.wav
airy|Whoosh Airy Tonal Tail.wav
flick|Whooshes/epic-fast-whoosh-345469.mp3
fastwhoosh|Whooshes/Fast Whoosh.wav
mainwhoosh|Whoosh Main.wav
riser|Soft Riser 2.wav
money|Money/Cinematic Money 2.wav
LIST
echo "sounds: $(ls assets/sfx | wc -l)"
