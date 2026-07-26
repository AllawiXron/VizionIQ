/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Apple-Grade ASMR Sound Engine using Web Audio API synthesis
// Low-latency, ultra-smooth, zero-network dependency audio engine.

let audioCtx: AudioContext | null = null;
let soundMuted = false;

// Initialize mute state from localStorage
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("sales_guide_sound_muted");
    if (saved === "true") {
      soundMuted = true;
    }
  } catch (e) {
    console.warn("Could not load sound preference", e);
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const isSoundMuted = (): boolean => soundMuted;

export const setSoundMuted = (muted: boolean): void => {
  soundMuted = muted;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("sales_guide_sound_muted", muted ? "true" : "false");
      window.dispatchEvent(new CustomEvent("sales_guide_sound_toggled", { detail: { muted } }));
    } catch (e) {
      console.warn("Failed to save sound preference", e);
    }
  }
};

export const toggleSoundMute = (): boolean => {
  const newMuted = !soundMuted;
  setSoundMuted(newMuted);
  if (!newMuted) {
    // Play subtle chime on unmute
    soundEngine.playSuccess();
  }
  return newMuted;
};

// Global Sound Engine Methods
export const soundEngine = {
  // 1. Soft Pop for Hover / Subtle micro-interactions
  playHover: () => {
    if (soundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Pitch micro-randomization (±4%) for organic feel
      const baseFreq = 580 + (Math.random() * 40 - 20);
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.018, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignore audio autoplay restrictions safely
    }
  },

  // 2. Tactile Button Click / Primary Action Press
  playClick: () => {
    if (soundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      
      // Warm Sine Pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      // Glassy overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(840, now);
      osc2.frequency.exponentialRampToValueAtTime(280, now + 0.04);
      gain2.gain.setValueAtTime(0.02, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.05);
      osc2.stop(now + 0.04);
    } catch {
      // Ignore audio errors
    }
  },

  // 3. Toggle Switch (Ascending for On, Descending for Off)
  playToggle: (isOn: boolean) => {
    if (soundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startFreq = isOn ? 320 : 540;
      const endFreq = isOn ? 640 : 280;

      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.06);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore audio errors
    }
  },

  // 4. Modal Open / Card Expansion Resonant Swell
  playModalOpen: () => {
    if (soundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      
      // Warm chord triad swell (Db major / Golden chord)
      const freqs = [277.18, 349.23, 415.30]; // Db4, F4, Ab4
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(f * 0.5, now + idx * 0.02);
        osc.frequency.exponentialRampToValueAtTime(f, now + 0.15 + idx * 0.02);

        gain.gain.setValueAtTime(0.001, now + idx * 0.02);
        gain.gain.linearRampToValueAtTime(0.025, now + 0.08 + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + idx * 0.02);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.02);
        osc.stop(now + 0.38 + idx * 0.02);
      });
    } catch {
      // Ignore audio errors
    }
  },

  // 5. Modal Close / Dismiss
  playModalClose: () => {
    if (soundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore audio errors
    }
  },

  // 6. Success / Apple Pay Style Triumph Chime
  playSuccess: () => {
    if (soundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Multi-note arpeggio chord (F#4, A#4, C#5, F#5)
      const notes = [369.99, 466.16, 554.37, 739.99];
      
      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.04;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.04, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.48);
      });
    } catch {
      // Ignore audio errors
    }
  },

  // 7. Navigation / Tab Shift Air Sweep
  playTabShift: () => {
    if (soundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.04);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore audio errors
    }
  },

  // 8. Soft Keyboard Tap for Form Typing
  playKeyTap: () => {
    if (soundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const pitch = 700 + Math.random() * 150;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.3, now + 0.015);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.015);
    } catch {
      // Ignore audio errors
    }
  }
};
