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

    const syncViewport = () => {
      if (!viewport) return;
      root.style.setProperty("--keyboard-height", `${Math.max(0, window.innerHeight - viewport.height)}px`);
      root.style.setProperty("--visual-viewport-height", `${viewport.height}px`);
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
    viewport?.addEventListener("resize", onViewportChange);
    viewport?.addEventListener("scroll", onViewportChange);
    return () => {
      window.clearTimeout(focusTimer);
      window.clearTimeout(resizeTimer);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      viewport?.removeEventListener("resize", onViewportChange);
      viewport?.removeEventListener("scroll", onViewportChange);
      body.classList.remove("keyboard-is-open");
      root.style.removeProperty("--keyboard-height");
      root.style.removeProperty("--visual-viewport-height");
    };
  }, []);
}
