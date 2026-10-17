#!/usr/bin/env bash
# Sound effects from the user's own pack on Google Drive (shared 9 Oct 2026):
#   https://drive.google.com/drive/folders/11f5ih2YdrKcxYcawC9mRx7CK99Yb_dl_
# Not committed (it's the user's pack); this script fetches the seven this reel uses and writes them as PCM WAVs to
# assets/sfx-drive/. Some of the pack's ".wav" files are MP3s inside; ffmpeg reads them either way.
set -e
cd "$(dirname "$0")"
mkdir -p assets/sfx-drive/src
get() { [ -s "assets/sfx-drive/src/$2" ] || curl -sSfL -o "assets/sfx-drive/src/$2" "https://drive.usercontent.google.com/download?id=$1&export=download"; }
get 1EXZDX2bgMaAvjwuxzzN-L_cX0nTTAKab riser.src      # Risers/Riser 2.wav (6 s, peaks at 3.0 s)
get 1PviFhEiBNNYZjdZVJf3pYp6JDzgf5Ll9 whoosh.src     # Whooshes/Cinematic Fast Normal Whoosh.wav (peak at 0.30 s)
get 16BSo3QPVlpTtYGQB6GOo-GqOYPyGKGQm whoosh-fly.src # Whooshes/Cinematic Fast Whoosh.wav (peak at 0.50 s)
get 1fEA-c8_MY-yyLbfMnp8mKlpqMnwdrQqt shutter.src    # Camera Shutters/Little Bit Hard Cammera Shutter.wav
get 12jqKEVYCeQ6RLr0w9X3-s1RNHTbuREaL money.src      # Money/Cinematic Money 2.wav
get 1Kl0LBPz1oSX19TBbfLzgC41_FvdVHU6i pop.src        # Pop/Smooth Pop.wav
get 10WCyPZZxP5dkZBYlIh6wZ6XKAjMscnfm click.src      # Clicks/Cinematic Click.wav
pcm() { ffmpeg -v error -y -i "assets/sfx-drive/src/$1.src" "${@:2}" -ar 48000 -ac 2 -c:a pcm_s16le "assets/sfx-drive/$1.wav"; }
pcm riser -af "atrim=1.0:3.0,asetpts=PTS-STARTPTS,afade=t=out:st=1.97:d=0.03"   # the last 2 s of the build, cut at its peak
for n in whoosh whoosh-fly shutter money pop click; do pcm $n; done
ls assets/sfx-drive/*.wav
