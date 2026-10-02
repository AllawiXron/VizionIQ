import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile } from "remotion";
import { C, FONT, T } from "./theme";
import { Background, SceneShell, SfxVolumeContext, useFonts } from "./kit";
import { Hook } from "./scenes/Hook";
import { Pain } from "./scenes/Pain";
import { Advisor } from "./scenes/Advisor";
import { Results } from "./scenes/Results";
import { Cta } from "./scenes/Cta";

export type ReelProps = {
  /** Path inside public/ to a recorded voiceover (e.g. "voiceover.mp3"). Empty = none. */
  voiceover: string;
  /** Path inside public/ to a music bed. Empty = none (add a trending sound in Instagram instead). */
  music: string;
  /** Sound-effects level, 0–1. Lower it when a voiceover is added. */
  sfxVolume: number;
};

const SCENES = [
  { key: "hook", ...T.hook, C: Hook },
  { key: "pain", ...T.pain, C: Pain },
  { key: "advisor", ...T.advisor, C: Advisor },
  { key: "results", ...T.results, C: Results },
  { key: "cta", ...T.cta, C: Cta },
];

export function VizionReel({ voiceover, music, sfxVolume }: ReelProps) {
  useFonts();
  return (
    <AbsoluteFill dir="rtl" style={{ fontFamily: FONT, color: C.white, background: C.navyDeep }}>
      <Background />
      {SCENES.map(({ key, from, dur, C: Scene }, i) => (
        <Sequence key={key} from={from} durationInFrames={dur} name={key}>
          <SfxVolumeContext.Provider value={sfxVolume}>
            <SceneShell dur={dur} hold={i === SCENES.length - 1}>
              <Scene />
            </SceneShell>
          </SfxVolumeContext.Provider>
        </Sequence>
      ))}
      {voiceover && <Html5Audio src={staticFile(voiceover)} />}
      {music && <Html5Audio src={staticFile(music)} volume={voiceover ? 0.18 : 0.5} />}
    </AbsoluteFill>
  );
}

