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

// after a new deploy an open tab can ask for files that no longer exist: reload once to get the new ones
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (sessionStorage.getItem('vz_reloaded_after_deploy')) return;
    sessionStorage.setItem('vz_reloaded_after_deploy', '1');
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user" transition={SPRING}>
      <App />
    </MotionConfig>
  </StrictMode>,
);
