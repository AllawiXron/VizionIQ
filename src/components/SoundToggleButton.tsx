/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundMuted, toggleSoundMute, soundEngine } from "../lib/soundEngine";
import { motion } from "motion/react";
import { SPRING_SNAPPY } from "../lib/motion";

interface SoundToggleButtonProps {
  className?: string;
  variant?: "compact" | "pill";
}

export function SoundToggleButton({ className = "", variant = "compact" }: SoundToggleButtonProps) {
  const [muted, setMuted] = useState<boolean>(true);

  useEffect(() => {
    setMuted(isSoundMuted());

    const handleToggleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ muted: boolean }>;
      if (customEvent.detail) {
        setMuted(customEvent.detail.muted);
      }
    };

    window.addEventListener("sales_guide_sound_toggled", handleToggleEvent);
    return () => window.removeEventListener("sales_guide_sound_toggled", handleToggleEvent);
  }, []);

  const handleToggle = () => {
    const newMutedState = toggleSoundMute();
    setMuted(newMutedState);
  };

  if (variant === "pill") {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        transition={SPRING_SNAPPY}
        onClick={handleToggle}
        onMouseEnter={() => soundEngine.playHover()}
        className={`px-3.5 min-h-[40px] rounded-full border flex items-center gap-2 text-xs font-bold transition-colors duration-300 cursor-pointer ${
          !muted
            ? "bg-white text-[#050506] border-white shadow-[inset_0_1px_0_#fff,0_6px_18px_-8px_rgba(255,255,255,0.35)]"
            : "bg-white/[0.05] border-white/10 text-white/60 hover:text-white"
        } ${className}`}
        title={muted ? "تشغيل المؤثرات الصوتية" : "كتم المؤثرات الصوتية"}
      >
        {!muted ? (
          <>
            <Volume2 className="w-4 h-4" />
            <span>الصوت مفعّل</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-white/70" />
            <span>الصوت مكتوم</span>
          </>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      transition={SPRING_SNAPPY}
      onClick={handleToggle}
      onMouseEnter={() => soundEngine.playHover()}
      className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors duration-300 cursor-pointer ${
        !muted
          ? "bg-white/[0.12] border-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
          : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-white/55 hover:text-white"
      } ${className}`}
      title={muted ? "تشغيل المؤثرات الصوتية" : "كتم المؤثرات الصوتية"}
    >
      {!muted ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4 text-white/70" />
      )}
    </motion.button>
  );
}
