import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useLiquidGlass } from "../../lib/liquidGlass";
import { EASE_OUT } from "../../lib/motion";

export interface SegmentItem {
  id: string;
  label: string;
  done?: boolean;
}

interface SegmentedProps {
  items: SegmentItem[];
  active: string;
  onChange: (id: string) => void;
  layoutId: string;
  label: string;
  tabs?: boolean;
}

const GLIDE = { stiffness: 480, damping: 38, mass: 0.75 };

// the current tab is a glass drop; pressing turns it into a lens, and sliding along the strip picks another tab
export function Segmented({ items, active, onChange, label, tabs = true }: SegmentedProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLSpanElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const activeIndex = items.findIndex((i) => i.id === active);
  const [pressed, setPressed] = useState(false);
  const [slidable, setSlidable] = useState(true);
  const press = useRef<{ id: number; startX: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  const placed = useRef(false);
  const dropX = useMotionValue(0);
  const dropW = useMotionValue(0);
  const springX = useSpring(dropX, GLIDE);
  const springW = useSpring(dropW, GLIDE);
  const lensLeft = useTransform([springX, springW], ([x, w]: number[]) => x - w * 0.09);
  const lensWidth = useTransform(springW, (w) => w * 1.18);

  useLiquidGlass(lensRef, { bezel: 10, strength: 14, magnify: 0.18, dispersion: true, extra: "saturate(190%) brightness(1.16)" });

  const placeOn = (i: number) => {
    const b = btns.current[i];
    if (!b) return;
    dropX.set(b.offsetLeft);
    dropW.set(b.offsetWidth);
    if (!placed.current || reduce) {
      springX.jump(b.offsetLeft);
      springW.jump(b.offsetWidth);
      placed.current = true;
    }
  };

  useLayoutEffect(() => {
    if (!pressed && activeIndex >= 0) placeOn(activeIndex);
  }, [activeIndex, pressed, items.length]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      // a strip that scrolls sideways keeps its native scroll, so sliding the lens is only for strips that fit
      setSlidable(el.scrollWidth <= el.clientWidth + 1);
      placed.current = false;
      if (activeIndex >= 0) placeOn(activeIndex);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeIndex]);

  const nearest = (clientX: number) => {
    let best = 0;
    let gap = Infinity;
    btns.current.forEach((b, i) => {
      if (!b) return;
      const r = b.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - clientX);
      if (d < gap) {
        gap = d;
        best = i;
      }
    });
    return best;
  };

  const follow = (clientX: number) => {
    const i = nearest(clientX);
    const b = btns.current[i];
    if (!b) return;
    const r = b.getBoundingClientRect();
    const w = b.offsetWidth;
    const el = wrap.current;
    const max = el ? el.scrollWidth - w - 2 : Infinity;
    dropX.set(Math.max(2, Math.min(max, b.offsetLeft + (clientX - r.left) - w / 2)));
    dropW.set(w);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const hit = (e.target as HTMLElement).closest("button");
    const i = hit ? btns.current.indexOf(hit as HTMLButtonElement) : -1;
    if (i < 0) return;
    press.current = { id: e.pointerId, startX: e.clientX, moved: false };
    setPressed(true);
    placeOn(i);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId || !slidable) return;
    if (!p.moved && Math.abs(e.clientX - p.startX) > 6) {
      p.moved = true;
      wrap.current?.setPointerCapture(e.pointerId);
    }
    if (p.moved) follow(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    press.current = null;
    if (p.moved) {
      const i = nearest(e.clientX);
      placeOn(i);
      skipClick.current = true;
      window.setTimeout(() => (skipClick.current = false), 0);
      if (items[i] && items[i].id !== active) onChange(items[i].id);
    }
    setPressed(false);
  };
  const onPointerCancel = () => {
    press.current = null;
    setPressed(false);
  };

  return (
    <div
      ref={wrap}
      role={tabs ? "tablist" : undefined}
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className={`vz-segmented glass-floating glass-edge select-none ${slidable ? "touch-pan-y" : ""}`}
    >
      <motion.span
        aria-hidden="true"
        style={{ x: springX, width: springW }}
        initial={false}
        animate={{ opacity: activeIndex >= 0 && !pressed ? 1 : 0 }}
        transition={{ duration: pressed ? 0.12 : 0.3, ease: EASE_OUT, delay: pressed ? 0 : 0.1 }}
        className="vz-segment-thumb vz-segment-drop"
      />
      {items.map((it, i) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            ref={(b) => {
              btns.current[i] = b;
            }}
            type="button"
            role={tabs ? "tab" : undefined}
            aria-selected={tabs ? on : undefined}
            aria-current={!tabs && on ? "true" : undefined}
            onClick={() => {
              if (skipClick.current) return;
              onChange(it.id);
            }}
            data-active={on}
            className="vz-segment focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <span className="relative">{it.label}</span>
            {it.done && <span className="vz-segment-dot" aria-hidden="true" />}
          </button>
        );
      })}
      <motion.span
        ref={lensRef}
        aria-hidden="true"
        style={{ left: lensLeft, width: lensWidth }}
        initial={false}
        animate={
          pressed
            ? { opacity: 1, clipPath: reduce ? "inset(4px 8% 4px 8% round 999px)" : "inset(0px 0% 0px 0% round 999px)" }
            : { opacity: 0, clipPath: "inset(4px 8% 4px 8% round 999px)" }
        }
        transition={
          pressed
            ? { type: "spring", stiffness: 520, damping: 26, mass: 0.6, opacity: { duration: 0.1 } }
            : { type: "spring", stiffness: 420, damping: 30, mass: 0.7, opacity: { duration: 0.26, delay: 0.12, ease: EASE_OUT } }
        }
        className="lg-lens vz-segment-lens"
      />
    </div>
  );
}
