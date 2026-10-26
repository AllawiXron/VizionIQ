import React from 'react';
import { Composition } from 'remotion';
import { Ad, FPS, DUR } from './Ad';

export const Root: React.FC = () => (
  <>
    <Composition id="AdWide" component={Ad} durationInFrames={Math.round(DUR * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="AdTall" component={Ad} durationInFrames={Math.round(DUR * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
