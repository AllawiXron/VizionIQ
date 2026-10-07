#!/usr/bin/env bash
# Mix the placed voiceover over the rendered sound effects and encode the file to post.
#   renders/dollar-reel-master.mp4  (HyperFrames render: picture + sound effects; gitignored, ~190 MB)
#   assets/voice/voice-aligned.wav  (from voice.py)
# -> renders/dollar-reel.mp4        (picture + effects + voice; add only music in CapCut)
# The effects duck under the voice (sidechain), then a limiter keeps peaks under -1 dBFS.
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -y -loglevel error -i renders/dollar-reel-master.mp4 -i assets/voice/voice-aligned.wav -filter_complex \
  "[1:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[v][vsc];\
   [0:a]aformat=sample_rates=48000:channel_layouts=stereo[fx];\
   [fx][vsc]sidechaincompress=threshold=0.04:ratio=4:attack=12:release=280[fxd];\
   [fxd][v]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89:level=false[a]" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 23 -tune grain -maxrate 9M -bufsize 18M -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart renders/dollar-reel.mp4
ffmpeg -y -loglevel error -ss 2.75 -i renders/dollar-reel.mp4 -frames:v 1 -q:v 2 renders/dollar-reel-cover.jpg
echo ok
