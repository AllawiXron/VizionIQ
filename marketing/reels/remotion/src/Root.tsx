import React from 'react';
import {Composition} from 'remotion';
import {DURATION, SalaReel} from './SalaReel';

export const Root: React.FC = () => (
  <Composition id="SalaReel" component={SalaReel} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
);
