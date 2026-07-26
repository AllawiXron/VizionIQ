/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { soundEngine } from "../lib/soundEngine";

interface SensoryProviderProps {
  children: React.ReactNode;
}

export function SensoryProvider({ children }: SensoryProviderProps) {
  useEffect(() => {
    // 1. Global Delegated Mouseover / PointerEnter for Subtle Hover ASMR
    let lastHoverTime = 0;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest("button, a, input, select, textarea, [role='button'], .cursor-pointer, .interactive-card");
      if (interactive) {
        const now = Date.now();
        // Debounce micro hovers by 60ms to prevent sound spamming
        if (now - lastHoverTime > 60) {
          lastHoverTime = now;
          soundEngine.playHover();
        }
      }
    };

    // 2. Global Delegated Click Listener for Tactile Action Sounds
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if clicking input checkbox / switch
      if (target.matches("input[type='checkbox'], input[type='radio']")) {
        const input = target as HTMLInputElement;
        soundEngine.playToggle(input.checked);
        return;
      }

      // Check for tab or navigation link click
      const navItem = target.closest("[data-sound='tab'], .tab-button");
      if (navItem) {
        soundEngine.playTabShift();
        return;
      }

      // Check for modal trigger or card expand
      const modalTrigger = target.closest("[data-sound='modal'], .modal-trigger");
      if (modalTrigger) {
        soundEngine.playModalOpen();
        return;
      }

      const interactive = target.closest("button, a, [role='button'], .cursor-pointer");
      if (interactive) {
        soundEngine.playClick();
      }
    };

    // 3. Global Keyboard Typing Sounds for Form Inputs
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.matches("input[type='text'], input[type='password'], input[type='number'], textarea")) {
        // Exclude navigation keys like Arrow keys or Shift
        if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") {
          soundEngine.playKeyTap();
        }
      }
    };

    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("click", handleClick, { capture: true, passive: true });
    window.addEventListener("keydown", handleKeyDown, { passive: true });

    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <>{children}</>;
}
