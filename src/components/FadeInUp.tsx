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
