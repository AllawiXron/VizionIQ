import React from "react";
import { motion } from "motion/react";

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

const THUMB = { type: "spring", stiffness: 480, damping: 38, mass: 0.75 } as const;

export function Segmented({ items, active, onChange, layoutId, label, tabs = true }: SegmentedProps) {
  return (
    <div
      role={tabs ? "tablist" : undefined}
      aria-label={label}
      className="vz-segmented glass-floating glass-edge"
    >
      {items.map((it) => {
        const on = it.id === active;
        return (
          <motion.button
            key={it.id}
            type="button"
            role={tabs ? "tab" : undefined}
            aria-selected={tabs ? on : undefined}
            aria-current={!tabs && on ? "true" : undefined}
            onClick={() => onChange(it.id)}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            data-active={on}
            className="vz-segment focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            {on && <motion.span layoutId={layoutId} transition={THUMB} className="vz-segment-thumb" aria-hidden="true" />}
            <span className="relative">{it.label}</span>
            {it.done && <span className="vz-segment-dot" aria-hidden="true" />}
          </motion.button>
        );
      })}
    </div>
  );
}
