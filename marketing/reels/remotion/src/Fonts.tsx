import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {FONT_CSS} from './fontcss';

const css = FONT_CSS.replace(/url\(([^)]+\.woff2)\)/g, (_, f: string) => `url(${staticFile('fonts/' + f)})`);
const NEEDED = ['900 40px Alexandria', '800 40px Alexandria', '700 40px Alexandria', '600 40px Alexandria', '500 40px Alexandria',
  '500 20px "Readex Pro"', '600 20px "Readex Pro"', '500 20px "IBM Plex Mono"'];

export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(NEEDED.map((f) => document.fonts.load(f, 'ابجد هوز abc 123')))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle));
  }, [handle]);
  return <style>{css}</style>;
};
