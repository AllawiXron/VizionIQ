import React from "react";
import { motion } from "motion/react";

interface FadeInUpProps {
  key?: React.Key;
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  yOffset?: number;
}

/**
 * Reusable FadeInUp component triggered by Intersection Observer (whileInView)
 * Smoothly floats content into view as the user scrolls down on mobile & desktop.
 */
export function FadeInUp({
  children,
  delay = 0,
  duration = 0.5,
  className = "",
  yOffset = 24
}: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -40px 0px" }}
      transition={{ type: "spring", stiffness: 240, damping: 26, mass: 0.72, delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default FadeInUp;
