#!/bin/sh
# final renders, one after another (each ~3-6 min on 4 cores)
cd "$(dirname "$0")"
for sh in hero lipsticks skincare giftbox bags compact; do
  /tmp/claude-0/-home-user-VizionIQ/66d5f669-fb6c-57cc-90e1-5c7550b93c10/scratchpad/bvenv/bin/python studio.py $sh 2>&1 | grep -E "wrote|Error|Traceback"
done
echo ALL-DONE
