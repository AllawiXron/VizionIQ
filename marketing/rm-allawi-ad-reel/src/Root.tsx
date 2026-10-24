import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { D, FPS, H, W } from "./lib";

export function Root() {
  return <Composition id="AdReel" component={Reel} durationInFrames={Math.round(D * FPS)} fps={FPS} width={W} height={H} />;
}
