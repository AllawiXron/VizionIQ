import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';

// Sound cues [frame, sound, volume]. Sounds are prepared by sfx_prep.py (Elements SFX, CC0, + one Mixkit UI zoom).
// Kept outside the motion blur, which renders its children several times. Captions have no sound of their own:
// only actions do (clicks, layers landing, the stamp, the cut).
const CUES: [number, string, number][] = [
  [2, 'whoosh', 0.55],                                  // the hook's words breathe in
  [30, 'rewind', 1],                                    // reverse whoosh, peaks as the canvas empties (f50)
  [79, 'click', 1], [80, 'flood', 0.9],                 // ١ brand colour: red floods out
  [124, 'click', 1], [125, 'whoosh', 0.8], [131, 'thump', 1],          // ٢ the basket drops and lands
  [169, 'click', 1], [168, 'swoosh', 0.75],             // ٣ the card slides in
  [195, 'click', 1], [197, 'success', 0.9],             // tap: «✓ أضيفت للسلة»
  [214, 'click', 1], [218, 'keys', 1],                  // ٤ the headline types in
  [244, 'boom', 0.85],                                  // «إلا هاي.» lands (bass peaks at f251)
  [255, 'zoomin', 0.8],                                 // the arrow draws itself
  [299, 'click', 1], [301, 'pop', 0.9],                 // ٥ logo
  [305, 'riser', 0.8], [319, 'whoosh2', 1],             // build into the whip zoom; both peak on the cut (f330)
  [323, 'boom', 0.55], [330, 'reveal', 0.85],           // the end card lands
  [356, 'pop', 0.7],                                    // «راسلني»
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
