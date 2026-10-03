import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';

// Sound cues [frame, sound, volume]. Sounds are prepared by sfx_prep.py (Kenney CC0 + Mixkit free license).
// Kept outside the motion blur, which renders its children several times.
const CUES: [number, string, number][] = [
  [3, 'pop', 1],                                        // hook caption
  [29, 'rewind', 1],                                    // tape rewind, peaks as the canvas empties (f50)
  [52, 'pop', 0.9],                                     // «نبدي من الصفر»
  [79, 'click', 1], [82, 'release', 1], [80, 'air', 1], [81, 'pop', 0.8],                  // ١ brand colour: red floods
  [124, 'click', 1], [127, 'release', 1], [125, 'sweep', 1], [132, 'thud', 1], [126, 'pop', 0.8],   // ٢ basket drops, lands
  [169, 'click', 1], [172, 'release', 1], [168, 'bright', 1], [171, 'pop', 0.8],           // ٣ card slides in
  [195, 'click', 1], [198, 'release', 1], [197, 'chime', 1],                                // tap: «✓ أضيفت للسلة»
  [214, 'click', 1], [217, 'release', 1], [216, 'pop', 0.8],                               // ٤ headline
  [218, 'tick', 1], [221, 'tick', 1], [224, 'tick', 1], [227, 'tick', 1], [230, 'tick', 1], [233, 'tick', 1],
  [239, 'zoomhit', 1], [251, 'punch', 1],               // «إلا هاي.» stamps down
  [255, 'pencil', 1],                                   // the arrow draws itself
  [299, 'click', 1], [302, 'release', 1], [301, 'pop', 0.8], [303, 'pop2', 1], [307, 'pop2', 0.8],  // ٥ logo, CTA
  [309, 'whoosh', 1],                                   // whip zoom, peaks on the cut (f330)
  [330, 'land', 1], [332, 'shimmer', 1],                // end card lands
  [340, 'tick', 1.4], [344, 'tick', 1.4], [348, 'tick', 1.4], [354, 'pop', 1],   // «طبقة فوق طبقة», CTA
];

export const Sound: React.FC = () => (
  <>
    {CUES.map(([f, name, v], i) => (
      <Sequence key={i} from={f} layout="none">
        <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={v} />
      </Sequence>
    ))}
  </>
);
