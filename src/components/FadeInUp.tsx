import React from "react";
import { Reveal } from "./ui/Motion";

interface FadeInUpProps {
  key?: React.Key;
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  yOffset?: number;
}

/**
 * Scroll reveal kept for existing call sites: delegates to the shared <Reveal>
 * so every section enters with the same blur → sharp, rise and settle motion.
 */
export function FadeInUp({
  children,
  delay = 0,
  className = "",
  yOffset = 24
}: FadeInUpProps) {
  return (
    <Reveal delay={delay} y={yOffset} amount={0.1} className={className}>
      {children}
    </Reveal>
  );
}

export default FadeInUp;
