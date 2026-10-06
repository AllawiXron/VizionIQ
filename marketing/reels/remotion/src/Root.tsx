import React from 'react';
import {Composition} from 'remotion';
import {DURATION, SalaReel} from './SalaReel';
import {ALSHIFA_DURATION, AlshifaReel} from './AlshifaReel';
import {AllawiKinetic, KINETIC_DURATION} from './AllawiKinetic';

export const Root: React.FC = () => (
  <>
    <Composition id="SalaReel" component={SalaReel} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
    <Composition id="AlshifaReel" component={AlshifaReel} durationInFrames={ALSHIFA_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="AllawiKinetic" component={AllawiKinetic} durationInFrames={KINETIC_DURATION} fps={30} width={1080} height={1920} />
  </>
);
