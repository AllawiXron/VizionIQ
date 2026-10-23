#!/bin/sh
# Fills media/ (not committed) from the other two reel projects: the cut-outs, textures and font from
# ../rm-allawi-ad-reel, the fitted voice and the sounds from ../hf-allawi-ad-reel, and the four phone-screen clips cut
# to the stretches the reel shows (from the full reels in ../rm-allawi-ad-reel/public/clips).
set -e
cd "$(dirname "$0")/.."
RM=../rm-allawi-ad-reel/public
HF=../hf-allawi-ad-reel/assets
mkdir -p media/el media/img media/fonts media/audio media/clips
cp "$RM"/el/*.png media/el/
cp "$RM"/img/paper.jpg "$RM"/img/grain.png media/img/
cp "$RM"/fonts/DG-Sahabah-Reg.ttf media/fonts/
cp "$HF"/voice.wav media/audio/voice.wav
for s in airy softpop flick smooth mpop simple whooshcon hit select money gear cinclick sweet data clickb \
         npop1 npop2 npop3 npop4 npop5 ppop1 ppop2 ppop3 ppop4; do cp "$HF/sfx/$s.wav" media/audio/; done
cut() { ffmpeg -v error -y -ss "$2" -t "$3" -i "$RM/clips/$1.mp4" -an -vf scale=540:960,setsar=1 -r 30 \
  -c:v libx264 -crf 19 -preset slow -pix_fmt yuv420p -map_metadata -1 -fflags +bitexact "media/clips/$4.mp4"; }
cut dollar-reel 1.3 5.6 dollar
cut vizion-reel 7.1 5.2 vizion
cut logos-reel 16.3 3.4 logos-a
cut logos-reel 46.0 4.9 logos-b
# the page plays VP9 copies (some Chromium builds have no H.264); After Effects imports the MP4s
for c in dollar vizion logos-a logos-b; do
  ffmpeg -v error -y -i "media/clips/$c.mp4" -c:v libvpx-vp9 -b:v 0 -crf 30 -row-mt 1 -an "media/clips/$c.webm"
done
