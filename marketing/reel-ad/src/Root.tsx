import React from "react";
import { Composition } from "remotion";
import { VizionReel, type ReelProps } from "./VizionReel";
import { FPS, HEIGHT, T, WIDTH } from "./theme";

const defaults: ReelProps = { voiceover: "", music: "", sfxVolume: 1 };

export function Root() {
  return (
    <Composition
      id="VizionReel"
      component={VizionReel}
      durationInFrames={T.total}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={defaults}
    />
  );
}
