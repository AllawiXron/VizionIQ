import React from "react";
import { Composition } from "remotion";
import { VizionReel, type ReelProps } from "./VizionReel";
import { KineticReel } from "./kinetic/KineticReel";
import { FPS, HEIGHT, T, WIDTH } from "./theme";

const defaults: ReelProps = { voiceover: "", music: "", sfxVolume: 1 };

export function Root() {
  return (
    <>
      {/* Kinetic-typography cut (camera whips, marker boxes, 3D emoji). */}
      <Composition id="VizionReel" component={KineticReel} durationInFrames={T.total} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={defaults} />
      {/* First cut: Liquid Glass product demo. */}
      <Composition id="VizionReelGlass" component={VizionReel} durationInFrames={T.total} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={defaults} />
    </>
  );
}
