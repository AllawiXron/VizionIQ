#!/usr/bin/env bash
# Copies the sounds and transition clips this reel uses from the user's own packs (../sfx-pack, ../transitions-pack)
# into assets/sfx and assets/tr (neither is committed). Run ../sfx-pack/fetch.sh and ../transitions-pack/fetch.sh first.
set -e
cd "$(dirname "$0")"
S=../sfx-pack/files; R=../transitions-pack/files
mkdir -p assets/sfx assets/tr
while IFS='|' read -r name src; do
  [ -s "assets/sfx/$name.wav" ] || ffmpeg -nostdin -loglevel error -y -i "$S/$src" -ar 48000 -ac 2 -c:a pcm_s16le "assets/sfx/$name.wav"
done <<'LIST'
gear|Gear/Fast Gear.wav
flick|Whooshes/epic-fast-whoosh-345469.mp3
fastwhoosh|Whooshes/Fast Whoosh.wav
mainwhoosh|Whoosh Main.wav
timestop|time stop.wav
pop|Pop/Smooth Pop.wav
mpop|Pop/Meadia Pop.wav
click|Clicks/Cinematic Click.wav
glitch|Ui Sound Effects/Ui Glitch Click.wav
shutter|Camera Shutters/Smooth Cammera Shutter.wav
riser|Soft Riser 2.wav
money|Money/Cinematic Money 2.wav
key|apple keypord click.mp3
send|Ui Sound Effects/Ui Enter.wav
ding|Synth Sparkle Tone High Pitch Tone Burst Ding 17.wav
correct|Correct.mp3
deep|Whoosh Deep Short.wav
hifast|Whooshes/High And Fast Whoosh.wav
smooth|Whooshes/Smooth And Fast Whoosh.wav
stretch|Ui Sound Effects/Ui stretch.wav
LIST
# the time-stop hit, cut to its first 1.8 s with a fade so it ends clean
[ -s assets/sfx/timestop-cut.wav ] || ffmpeg -nostdin -loglevel error -y -i assets/sfx/timestop.wav -t 1.8 -af "afade=t=out:st=1.0:d=0.8" assets/sfx/timestop-cut.wav
cp --update=none "$R/Flash Transitions 16.mp4" assets/tr/flash16.mp4
cp --update=none "$R/Flash Transitions 19.mp4" assets/tr/flash19.mp4
cp --update=none "$R/Flash Transitions 4.mp4" assets/tr/flash4.mp4
cp --update=none "$R/Flash Transitions 6.mp4" assets/tr/flash6.mp4
cp --update=none "$R/Vip overlaymp4.mp4" assets/tr/vip.mp4
cp --update=none "$R/Premium Transition.mp4" assets/tr/premium.mp4
echo "sounds: $(ls assets/sfx | wc -l), clips: $(ls assets/tr | wc -l)"
