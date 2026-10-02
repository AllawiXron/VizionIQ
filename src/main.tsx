import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {MotionConfig} from 'motion/react';
import {SPRING} from './lib/motion';
import App from './App.tsx';
import {initGlassLight} from './lib/glassLight';
import {initScrollReveal} from './lib/scrollReveal';
import './index.css';

// Cursor-reactive lighting for glass cards and buttons (desktop only).
initGlassLight();
// Attribute-driven scroll reveals ([data-reveal]) for blocks across the site.
initScrollReveal();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user": transforms are skipped when the OS asks for reduced motion.
        transition: anything without its own transition moves on the shared spring. */}
    <MotionConfig reducedMotion="user" transition={SPRING}>
      <App />
    </MotionConfig>
  </StrictMode>,
);
