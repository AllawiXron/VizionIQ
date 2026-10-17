#!/bin/sh
# final renders, one after another (each ~4-8 min on 4 cores)
cd "$(dirname "$0")"
PY=${BLENDER_PY:-/tmp/claude-0/-home-user-VizionIQ/66d5f669-fb6c-57cc-90e1-5c7550b93c10/scratchpad/bvenv/bin/python}
for sh in cover samoon amba istikan dolma; do
  $PY studio.py $sh 2>&1 | grep -E "wrote|Error|Traceback"
done
echo ALL-DONE
