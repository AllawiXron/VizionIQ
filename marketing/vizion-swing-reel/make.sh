#!/usr/bin/env bash
# Renders the frames, builds the sound and encodes out/vizion-swing-reel.mp4 (about 10 Mbps, as the user asked).
set -e
cd "$(dirname "$0")"
NODE_PATH=${NODE_PATH:-/opt/node-tools/node_modules} node render.cjs
python3 sfx.py
ffmpeg -v error -y -framerate 30 -i frames/f_%04d.png -i out/sfx.wav \
  -c:v libx264 -preset slow -b:v 10M -maxrate 12M -bufsize 20M -pix_fmt yuv420p -profile:v high \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart out/vizion-swing-reel.mp4
ls -la out/vizion-swing-reel.mp4
