#!/bin/sh
# Puts the After Effects package together in out/allawi_reel_AE: the builder script and, next to it, the footage it
# imports (the cut-outs it uses, the paper, the four phone clips, the voice and the sounds, my font), then zips it.
set -e
cd "$(dirname "$0")/.."
P=out/allawi_reel_AE
rm -rf "$P" out/allawi_reel_AE.zip
mkdir -p "$P/footage/el" "$P/footage/img" "$P/footage/audio" "$P/footage/clips" "$P/footage/fonts"
cp ae/build_reel_in_AE.jsx "$P/"
for f in $(grep -o 'el/[a-z0-9-]*\.png' ae/build_reel_in_AE.jsx | sort -u); do cp "media/$f" "$P/footage/el/"; done
cp media/img/paper.jpg "$P/footage/img/"
cp media/clips/*.mp4 "$P/footage/clips/"
for f in $(grep -o 'audio/[a-z0-9-]*\.wav' ae/build_reel_in_AE.jsx | sort -u); do cp "media/$f" "$P/footage/audio/"; done
cp media/fonts/DG-Sahabah-Reg.ttf "$P/footage/fonts/"
(cd out && zip -qr -X allawi_reel_AE.zip allawi_reel_AE)
du -sh "$P" out/allawi_reel_AE.zip
