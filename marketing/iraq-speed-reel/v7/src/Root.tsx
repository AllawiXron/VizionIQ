import React from 'react';
import { Composition } from 'remotion';
import { Reel, FPS, DUR } from './Reel';

export const Root: React.FC = () => (
  <Composition id="Reel" component={Reel} durationInFrames={Math.round(DUR * FPS)} fps={FPS} width={1080} height={1920} />
);
