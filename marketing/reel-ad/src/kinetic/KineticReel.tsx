import React from "react";
import { AbsoluteFill, Html5Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, HEIGHT, WIDTH } from "../theme";
import { SfxVolumeContext, clamp, useFonts } from "../kit";
import type { ReelProps } from "../VizionReel";
import { camAt, camVelocity } from "./camera";
import {
  AdvisorBeat,
  BurnBeat,
  ChatBeat,
  CostBeat,
  Deco,
  DinarBeat,
  HookBeat,
  LearnBeats,
  OfferBeat,
  PlanBeat,
  PunchBeat,
  ReplyBeat,
} from "./beats";

/** Paper (light) section: circle wipe in at PAPER_IN, band wipe out at PAPER_OUT. */
const PAPER_IN = 510;
const PAPER_OUT = 701;
const SHAPES_AT = 207;
const BAND_AT = 691;

/**
 * Kinetic-typography cut: one world canvas, a whip-panning camera with real
 * directional motion blur, marker boxes, 3D emoji and graphic wipes.
 */
export function KineticReel({ voiceover, music, sfxVolume }: ReelProps) {
  useFonts();
  const f = useCurrentFrame();
  const cam = camAt(f);
  const { vx, vy } = camVelocity(f);
  const bx = Math.min(70, Math.abs(vx) * 0.24);
  const by = Math.min(70, Math.abs(vy) * 0.24);
  const blurred = bx + by > 0.4;

  return (
    <AbsoluteFill dir="rtl" style={{ fontFamily: FONT, color: C.white, background: C.navyDeep, overflow: "hidden" }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="camblur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} />
        </filter>
      </svg>

      <NavyBackdrop camX={cam.x} camY={cam.y} />
      <PaperBackdrop camX={cam.x} camY={cam.y} />

      <SfxVolumeContext.Provider value={sfxVolume}>
        <AbsoluteFill style={{ filter: blurred ? "url(#camblur)" : undefined }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transformOrigin: "0 0",
              transform: `translate(${WIDTH / 2}px, ${HEIGHT / 2}px) scale(${cam.s}) rotate(${cam.r}deg) translate(${-cam.x}px, ${-cam.y}px)`,
            }}
          >
            <Deco />
            <HookBeat />
            <PunchBeat />
            <CostBeat />
            <BurnBeat />
            <AdvisorBeat />
            <ChatBeat />
            <ReplyBeat />
            <DinarBeat />
            <LearnBeats />
            <PlanBeat />
            <OfferBeat />
          </div>
        </AbsoluteFill>
        <ShapesWipe at={SHAPES_AT} />
        <BandWipe at={BAND_AT} />
      </SfxVolumeContext.Provider>

      {voiceover && <Html5Audio src={staticFile(voiceover)} />}
      {music && <Html5Audio src={staticFile(music)} volume={voiceover ? 0.18 : 0.5} />}
    </AbsoluteFill>
  );
}

/** Deep navy with a soft blue key light that drifts against the camera (parallax). */
function NavyBackdrop({ camX, camY }: { camX: number; camY: number }) {
  const px = 540 - ((camX * 0.04) % 200);
  const py = 900 - ((camY * 0.04) % 200);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(900px 1100px at ${px}px ${py}px, #0d2f93 0%, #06195a 42%, ${C.navyDeep} 100%)`,
      }}
    />
  );
}

/** White grid paper with a soft grey vignette, revealed by a circle wipe. */
function PaperBackdrop({ camX, camY }: { camX: number; camY: number }) {
  const f = useCurrentFrame();
  if (f < PAPER_IN || f >= PAPER_OUT) return null;
  const r = interpolate(f, [PAPER_IN, PAPER_IN + 16], [0, 1250], { ...clamp, easing: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2) });
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at 540px 960px)` }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 50% 48%, #ffffff 0%, #f1f3f8 55%, #cfd5e2 100%)" }} />
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(11,29,88,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(11,29,88,0.07) 2px, transparent 2px)",
          backgroundSize: "72px 72px",
          backgroundPosition: `${-camX}px ${-camY}px`,
        }}
      />
    </AbsoluteFill>
  );
}

/** Big blue graphic shapes (plus, ring, swoosh) whipping across the frame. */
function ShapesWipe({ at }: { at: number }) {
  const f = useCurrentFrame();
  const t = (d: number, len: number) => interpolate(f, [at + d, at + d + len], [0, 1], { ...clamp, easing: (x) => (x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2) });
  if (f < at || f > at + 30) return null;
  const a = t(0, 20);
  const b = t(3, 20);
  const c = t(6, 18);
  const blur = (p: number) => Math.min(30, Math.sin(p * Math.PI) * 30);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="sw1" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={`${blur(a)} ${blur(a) * 0.2}`} />
        </filter>
        <filter id="sw2" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={`${blur(b)} ${blur(b) * 0.2}`} />
        </filter>
      </svg>
      <div style={{ position: "absolute", left: interpolate(a, [0, 1], [1500, -1100]), top: 760, filter: "url(#sw1)", transform: `rotate(${a * 120}deg)` }}>
        <svg width={760} height={760} viewBox="0 0 100 100">
          <path d="M36 4 H64 Q68 4 68 8 V32 H92 Q96 32 96 36 V64 Q96 68 92 68 H68 V92 Q68 96 64 96 H36 Q32 96 32 92 V68 H8 Q4 68 4 64 V36 Q4 32 8 32 H32 V8 Q32 4 36 4 Z" fill={C.blue} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: interpolate(b, [0, 1], [1600, -1000]), top: 120, filter: "url(#sw2)" }}>
        <svg width={720} height={720} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#3d8bff" strokeWidth="16" />
        </svg>
      </div>
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M1180 1700 C 820 1500, 640 1100, 380 900 S -60 500, -200 300"
          fill="none"
          stroke={C.sky}
          strokeWidth={70}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="0.45 1"
          strokeDashoffset={interpolate(c, [0, 1], [0.45, -1])}
        />
      </svg>
    </AbsoluteFill>
  );
}

/** Diagonal blue band that sweeps the whole frame (used to leave the paper section). */
function BandWipe({ at }: { at: number }) {
  const f = useCurrentFrame();
  if (f < at || f > at + 22) return null;
  const p = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2) });
  const left = 1700 - 4300 * p;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", transform: "rotate(-12deg) scale(1.3)" }}>
      <div
        style={{
          position: "absolute",
          top: -400,
          bottom: -400,
          left,
          width: 2300,
          background: `linear-gradient(90deg, ${C.sky} 0, ${C.sky} 90px, transparent 90px, transparent 130px, #3d8bff 130px, #3d8bff 230px, ${C.blue} 230px, ${C.blue} 2070px, rgba(47,107,255,0) 2300px)`,
        }}
      />
    </AbsoluteFill>
  );
}

