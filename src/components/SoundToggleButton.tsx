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
        className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer ${
          !muted
            ? "bg-white/10 border-white/35 text-zinc-100 md:shadow-[0_0_12px_rgba(0,0,0,0.6)] shadow-xl"
            : "bg-white/5 border-white/10 text-white/60 hover:text-white"
        } ${className}`}
        title={muted ? "تشغيل المؤثرات الصوتية" : "كتم المؤثرات الصوتية"}
      >
        {!muted ? (
          <>
            <Volume2 className="w-4 h-4 text-zinc-100 animate-pulse" />
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
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={handleToggle}
      onMouseEnter={() => soundEngine.playHover()}
      className={`p-2 rounded-xl border transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer ${
        !muted
          ? "bg-white/10 border-white/35 text-zinc-100 md:shadow-[0_0_15px_rgba(0,0,0,0.6)] shadow-xl"
          : "bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white"
      } ${className}`}
      title={muted ? "تشغيل المؤثرات الصوتية" : "كتم المؤثرات الصوتية"}
    >
      {!muted ? (
        <Volume2 className="w-4 h-4 text-zinc-100" />
      ) : (
        <VolumeX className="w-4 h-4 text-white/70" />
      )}
    </motion.button>
  );
}
