import React from "react";
import { motion } from "motion/react";
import { EASE_OUT } from "../../lib/motion";

interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Actions shown beside the title on wide screens, under it on phones. */
  children?: React.ReactNode;
}

/** The calm, consistent title block every member screen starts with. */
export function PageHeader({ eyebrow, title, subtitle, children }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6 text-right"
    >
      <div className="space-y-2 sm:space-y-3 max-w-2xl">
        {eyebrow && <div className="text-xs sm:text-sm font-bold text-vz-accent flex items-center gap-2">{eyebrow}</div>}
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-sm sm:text-base text-white/60 leading-relaxed">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </motion.header>
  );
}
