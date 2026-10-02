import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {MotionConfig} from 'motion/react';
import App from './App.tsx';
import {initGlassLight} from './lib/glassLight';
import './index.css';

// Cursor-reactive lighting for glass cards and buttons (desktop only).
initGlassLight();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user": transforms are skipped when the OS asks for reduced motion. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
