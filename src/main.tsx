import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {MotionConfig} from 'motion/react';
import {SPRING} from './lib/motion';
import App from './App.tsx';
import {initGlassLight} from './lib/glassLight';
import {initScrollReveal} from './lib/scrollReveal';
import {initOriginTracker} from './lib/origin';
import './index.css';

initGlassLight();
initScrollReveal();
initOriginTracker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user" transition={SPRING}>
      <App />
    </MotionConfig>
  </StrictMode>,
);
