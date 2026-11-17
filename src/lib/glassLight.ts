const SELECTOR = ".glass-interactive, .btn";
const MAX_TILT = 3;

export function initGlassLight(): () => void {
  if (typeof window === "undefined") return () => {};
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!fine.matches) return () => {};

  let frame = 0;
  let lastEvent: PointerEvent | null = null;
  let active: HTMLElement | null = null;

  const reset = (el: HTMLElement) => {
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const update = () => {
    frame = 0;
    const e = lastEvent;
    if (!e) return;
    const target = (e.target as Element | null)?.closest?.(SELECTOR) as HTMLElement | null;

    if (active && active !== target) reset(active);
    active = target;
    if (!target) return;

    const r = target.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    target.style.setProperty("--mx", `${x.toFixed(1)}px`);
    target.style.setProperty("--my", `${y.toFixed(1)}px`);

    if (!reduce.matches && target.hasAttribute("data-tilt")) {
      const px = x / r.width - 0.5;
      const py = y / r.height - 0.5;
      target.style.setProperty("--rx", `${(px * MAX_TILT * 2).toFixed(2)}deg`);
      target.style.setProperty("--ry", `${(-py * MAX_TILT * 2).toFixed(2)}deg`);
    }
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    lastEvent = e;
    if (!frame) frame = requestAnimationFrame(update);
  };

  const onLeaveWindow = () => {
    if (active) reset(active);
    active = null;
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeaveWindow);

  return () => {
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeaveWindow);
    if (frame) cancelAnimationFrame(frame);
  };
}
