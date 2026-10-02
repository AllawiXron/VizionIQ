import { useEffect } from "react";

const isEditable = (element: Element | null): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
  element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;

export function useMobileKeyboard() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const body = document.body;
    const viewport = window.visualViewport;
    let focusTimer: number | undefined;
    let resizeTimer: number | undefined;

    // visualViewport fires "scroll"/"resize" on every frame while the mobile
    // URL bar collapses. Writing custom properties on <html> invalidates style
    // for the whole document, so only write when a value really changes, and
    // at most once per frame.
    let lastKeyboard = -1;
    let lastViewport = -1;
    let syncFrame = 0;
    const writeViewport = () => {
      syncFrame = 0;
      if (!viewport) return;
      const keyboard = Math.round(Math.max(0, window.innerHeight - viewport.height));
      const height = Math.round(viewport.height);
      if (keyboard !== lastKeyboard) {
        lastKeyboard = keyboard;
        root.style.setProperty("--keyboard-height", `${keyboard}px`);
      }
      if (height !== lastViewport) {
        lastViewport = height;
        root.style.setProperty("--visual-viewport-height", `${height}px`);
      }
    };
    const syncViewport = () => {
      if (!syncFrame) syncFrame = requestAnimationFrame(writeViewport);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Element | null;
      if (!isEditable(target)) return;
      body.classList.add("keyboard-is-open");
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => {
        target.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      }, 180);
    };

    const onFocusOut = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!isEditable(document.activeElement)) body.classList.remove("keyboard-is-open");
      }, 220);
    };

    const onViewportChange = () => {
      syncViewport();
      // Only keyboard-related changes matter beyond this point.
      if (isEditable(document.activeElement)) {
        body.classList.add("keyboard-is-open");
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          document.activeElement?.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
        }, 80);
      }
    };

    syncViewport();
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    // URL-bar collapse arrives as "resize"; per-frame "scroll" events only
    // matter while the keyboard is up (a field is focused).
    const onViewportScroll = () => {
      if (isEditable(document.activeElement)) onViewportChange();
    };
    viewport?.addEventListener("resize", onViewportChange, { passive: true });
    viewport?.addEventListener("scroll", onViewportScroll, { passive: true });
    return () => {
      window.clearTimeout(focusTimer);
      window.clearTimeout(resizeTimer);
      if (syncFrame) cancelAnimationFrame(syncFrame);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      viewport?.removeEventListener("resize", onViewportChange);
      viewport?.removeEventListener("scroll", onViewportScroll);
      body.classList.remove("keyboard-is-open");
      root.style.removeProperty("--keyboard-height");
      root.style.removeProperty("--visual-viewport-height");
    };
  }, []);
}
