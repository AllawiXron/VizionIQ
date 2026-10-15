#!/usr/bin/env bash
# Copies the sounds this reel uses from the user's own pack (../sfx-pack; run its fetch.sh first) into assets/sfx
# (not committed), as 48 kHz stereo PCM so cue times stay exact. A line with a start and a length cuts one sound out of
# a file that holds several (his «Normal Pop» holds five pops, «Premium And Smooth Pop» four): the word pops.
set -e
cd "$(dirname "$0")"
S=../sfx-pack/files
mkdir -p assets/sfx
while IFS='|' read -r name src ss len; do
  [ -s "assets/sfx/$name.wav" ] && continue
  if [ -n "$ss" ]; then
    ffmpeg -nostdin -loglevel error -y -ss "$ss" -t "$len" -i "$S/$src" -af "afade=t=out:st=$(printf "%.3f" "$(echo "$len - 0.04" | bc)"):d=0.04" \
      -ar 48000 -ac 2 -c:a pcm_s16le "assets/sfx/$name.wav"
  else
    ffmpeg -nostdin -loglevel error -y -i "$S/$src" -ar 48000 -ac 2 -c:a pcm_s16le "assets/sfx/$name.wav"
  fi
done <<'LIST'
data|Data Collect/Data Collect.wav
select|Ui Sound Effects/Ui Granular, Button, Select.wav
click2|Clicks/Click 2.wav
clickb|Clicks/Click_2.wav
sweet|Pop/Sweet UI Open.wav
mpop|Pop/Meadia Pop.wav
softpop|Pop/Slow And Smooth Pop.wav
simple|Whooshes/Simple Whoosh.wav
smooth|Whooshes/Smooth And Fast Whoosh.wav
cinfast|Whooshes/Cinematic Fast Normal Whoosh.wav
cinclick|Clicks/Cinematic Click.wav
airy|Whoosh Airy Tonal Tail.wav
flick|Whooshes/epic-fast-whoosh-345469.mp3
fastwhoosh|Whooshes/Fast Whoosh.wav
mainwhoosh|Whoosh Main.wav
npop1|Pop/Normal Pop.wav|0.09|0.16
npop2|Pop/Normal Pop.wav|0.78|0.18
npop3|Pop/Normal Pop.wav|1.549|0.17
npop4|Pop/Normal Pop.wav|2.061|0.16
npop5|Pop/Normal Pop.wav|2.801|0.15
ppop1|Pop/Premium And Smooth Pop.wav|0.0|0.3
ppop2|Pop/Premium And Smooth Pop.wav|0.989|0.4
ppop3|Pop/Premium And Smooth Pop.wav|1.985|0.38
ppop4|Pop/Premium And Smooth Pop.wav|2.988|0.4
LIST
echo "sounds: $(ls assets/sfx | wc -l)"
