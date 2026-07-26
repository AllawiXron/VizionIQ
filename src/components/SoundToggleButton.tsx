/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundMuted, toggleSoundMute, soundEngine } from "../lib/soundEngine";
import { motion } from "motion/react";

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
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        onMouseEnter={() => soundEngine.playHover()}
        className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
          !muted
            ? "bg-[#D4A017]/20 border-[#D4A017] text-[#F0C040] shadow-[0_0_12px_rgba(212,160,23,0.3)]"
            : "bg-white/5 border-white/10 text-white/60 hover:text-white"
        } ${className}`}
        title={muted ? "تشغيل المؤثرات الصوتية الفاخرة (ASMR)" : "كتم المؤثرات الصوتية"}
      >
        {!muted ? (
          <>
            <Volume2 className="w-4 h-4 text-[#F0C040] animate-pulse" />
            <span>الصوت: مفعّل 🔊</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-white/50" />
            <span>الصوت: مكتوم 🔇</span>
          </>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={handleToggle}
      onMouseEnter={() => soundEngine.playHover()}
      className={`p-2 rounded-xl border transition-all cursor-pointer ${
        !muted
          ? "bg-[#D4A017]/20 border-[#D4A017] text-[#F0C040] shadow-[0_0_15px_rgba(212,160,23,0.35)]"
          : "bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white"
      } ${className}`}
      title={muted ? "تشغيل المؤثرات الصوتية الفاخرة (ASMR)" : "كتم المؤثرات الصوتية"}
    >
      {!muted ? (
        <Volume2 className="w-4 h-4 text-[#F0C040]" />
      ) : (
        <VolumeX className="w-4 h-4 text-white/50" />
      )}
    </motion.button>
  );
}
