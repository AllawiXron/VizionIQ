import React from 'react';
import { Composition, Still } from 'remotion';
import { Avatar } from './Avatar';
import { EPISODES } from './episodes';
import { DUR, FPS, H, Reminder, W } from './Reminder';

export const RemotionRoot: React.FC = () => (
  <>
    {EPISODES.map((ep) => (
      <Composition key={ep.id} id={ep.id} component={Reminder} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ ep }} />
    ))}
    <Still id="avatar" component={Avatar} width={1080} height={1080} />
  </>
);
