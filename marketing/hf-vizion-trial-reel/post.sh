#!/usr/bin/env bash
# The reference's look: motion "on twos" with real motion blur. The page is rendered at 240 fps; here every 16 frames
# are averaged (a full 1/15 s shutter, so a fast move smears along its path), kept at 15 fps, and each frame is shown
# twice at 30 fps. The audio is copied as it is.
#   ./post.sh renders/raw-240.mp4 renders/vizion-trial-reel.mp4
set -e
ffmpeg -nostdin -loglevel error -y -i "$1" \
  -vf "tmix=frames=16,fps=15,fps=30,format=yuv420p" \
  -c:v libx264 -preset slow -b:v 10M -maxrate 12M -bufsize 20M -c:a copy -movflags +faststart "$2"
