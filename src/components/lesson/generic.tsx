import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, ShieldCheck, User } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";
import { KIT } from "./kit";
import { KIT2 } from "./kit2";
import { KIT3 } from "./kit3";
import { KIT4 } from "./kit4";
import { KIT5 } from "./kit5";
import { KIT6 } from "./kit6";
import { KIT7 } from "./kit7";
import { KIT8 } from "./kit8";
import { KIT9 } from "./kit9";
import { KIT10 } from "./kit10";
import { KIT11 } from "./kit11";

const ease = { duration: 0.5, ease: EASE_OUT };
const fmt = (n: number) => n.toLocaleString("en-US");
const TONE: Record<string, string> = {
  good: "bg-emerald-400",
  bad: "bg-red-400/85",
  warn: "bg-amber-300",
  blue: "bg-gradient-to-l from-vz-blue-light to-vz-blue-deep",
  neutral: "bg-white/35",
};
const TEXT_TONE: Record<string, string> = {
  good: "text-emerald-300",
  bad: "text-red-300",
  warn: "text-amber-200",
  blue: "text-vz-accent",
  neutral: "text-white/70",
};

export interface StagesData {
  stages: { name: string; size: number; details: { k: string; v: string }[] }[];
  highlight?: number;
  highlightLabel?: string;
  lowNote?: string;
  highNote?: string;
}

export function Stages({ d }: { d: StagesData }) {
  const [pick, setPick] = useState(d.highlight ?? 0);
  const s = d.stages[pick];
  const n = d.stages.length;
  return (
    <div>
      <div className={`grid items-end gap-2 sm:gap-3`} style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {d.stages.map((st, i) => (
          <button
            key={st.name}
            type="button"
            onClick={() => setPick(i)}
            className={`relative flex flex-col justify-end items-center rounded-t-3xl rounded-b-xl border px-1.5 pt-6 pb-3 text-center transition-colors duration-300 ${
              pick === i ? "bg-gradient-to-b from-vz-blue/45 to-vz-blue/10 border-vz-blue-light/60" : "bg-white/[0.04] border-white/10 hover:bg-white/[0.07]"
            }`}
            style={{ height: 130 + i * (n > 3 ? 45 : 65) }}
          >
            {d.highlight === i && d.highlightLabel && (
              <span className="absolute -top-3 right-1/2 translate-x-1/2 px-2 py-0.5 rounded-lg bg-emerald-400 text-[#062018] text-[12px] font-black whitespace-nowrap">{d.highlightLabel}</span>
            )}
            <span className="flex flex-wrap justify-center gap-0.5 mb-2">
              {Array.from({ length: st.size }, (_, k) => (
                <span key={k} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/70" />
              ))}
            </span>
            <span className="text-[14px] sm:text-[17px] font-black text-white leading-tight">{st.name}</span>
          </button>
        ))}
      </div>
      {(d.lowNote || d.highNote) && (
        <div className="flex items-center justify-between gap-3 mt-3 text-[13px] font-bold text-white/50">
          <span>{d.lowNote}</span>
          <span>{d.highNote}</span>
        </div>
      )}
      <motion.div key={pick} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="glass-elevated rounded-3xl p-5 sm:p-6 mt-5 space-y-3">
        <p className="text-[20px] font-black text-white">{s.name}</p>
        {s.details.map((x) => (
          <p key={x.k} className="text-[16px] text-white/80 leading-relaxed">
            <span className="font-black text-vz-accent">{x.k}: </span>
            {x.v}
          </p>
        ))}
      </motion.div>
    </div>
  );
}

export interface ScaleData {
  heavy: string;
  light: string;
  prompt: string;
  done: string;
  items: { problem: string; fix: string }[];
}

export function Scale({ d }: { d: ScaleData }) {
  const [fixed, setFixed] = useState<number[]>([]);
  const n = fixed.length;
  const total = d.items.length;
  const angle = 12 - (n / total) * 22;
  const tipped = n === total;
  const lift = Math.sin((angle * Math.PI) / 180) * 120;
  return (
    <div>
      <div className="relative h-[200px] sm:h-[210px] mt-4 mb-2">
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3 h-[130px] rounded-full bg-white/20" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 h-3 rounded-full bg-white/20" />
        <motion.div animate={{ rotate: angle }} transition={{ duration: 0.6, ease: EASE_OUT }} className="absolute left-[6%] right-[6%] top-[66px] h-2.5 rounded-full bg-white/60" />
        <motion.div animate={{ y: lift }} transition={{ duration: 0.6, ease: EASE_OUT }} className="absolute right-[2%] top-[96px] w-[42%] text-center">
          <p className="text-[14px] font-black text-red-300 mb-1">{d.heavy}</p>
          <p className="text-[34px] font-black text-white leading-none">{total - n}</p>
        </motion.div>
        <motion.div animate={{ y: -lift }} transition={{ duration: 0.6, ease: EASE_OUT }} className="absolute left-[2%] top-[96px] w-[42%] text-center">
          <p className="text-[14px] font-black text-emerald-300 mb-1">{d.light}</p>
          <p className="text-[34px] font-black text-white leading-none">{n}</p>
        </motion.div>
      </div>
      <p className={`text-center text-[18px] sm:text-[20px] font-black mb-5 ${tipped ? "text-emerald-300" : "text-white/70"}`}>{tipped ? d.done : d.prompt}</p>
      <div className="grid gap-2.5">
        {d.items.map((f, i) => {
          const ok = fixed.includes(i);
          return (
            <button
              key={f.problem}
              type="button"
              disabled={ok}
              onClick={() => setFixed((x) => [...x, i])}
              className={`w-full text-right rounded-2xl p-4 border transition-colors duration-300 ${ok ? "bg-emerald-400/[0.1] border-emerald-400/40" : "bg-red-500/[0.07] border-red-400/25 hover:bg-red-500/[0.12] cursor-pointer"}`}
            >
              <span className={`block text-[16px] font-black ${ok ? "text-white/50 line-through decoration-red-300/60" : "text-white"}`}>{f.problem}</span>
              {ok && (
                <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 flex items-start gap-2 text-[16px] font-bold text-emerald-200">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  {f.fix}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface RevealData {
  ask: string;
  items: { title: string; meta?: string; problem: string; fix: string; fixLabel?: string; problemLabel?: string }[];
}

export function Reveal({ d }: { d: RevealData }) {
  const [open, setOpen] = useState<number[]>([]);
  return (
    <div className="grid gap-3">
      {d.items.map((r, i) => {
        const shown = open.includes(i);
        return (
          <div key={r.title} className="glass rounded-3xl p-5">
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <p className="text-[18px] sm:text-[19px] font-black text-white leading-snug">{r.title}</p>
              {r.meta && <p className="text-[14px] font-bold text-white/60 shrink-0">{r.meta}</p>}
            </div>
            <p className="text-[16px] text-red-200 font-bold mb-3 leading-relaxed">
              {r.problemLabel ?? "المشكلة"}: {r.problem}
            </p>
            {shown ? (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 rounded-2xl bg-emerald-400/[0.1] border border-emerald-400/35 p-3 text-[16px] font-black text-emerald-200 leading-relaxed">
                <Check className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={3} />
                <span>{r.fixLabel ?? "الحل"}: {r.fix}</span>
              </motion.p>
            ) : (
              <button type="button" onClick={() => setOpen((o) => [...o, i])} className="btn btn-glass min-h-[44px] px-4 rounded-xl text-[15px]">
                {d.ask}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export interface WaterfallData {
  startLabel: string;
  start: number;
  items: { label: string; v: number }[];
  resultLabel: string;
  ghost?: { label: string; v: number };
  unit?: string;
}

export function Waterfall({ d, shown }: { d: WaterfallData; shown: number }) {
  let left = d.start;
  const rows = d.items.map((c) => {
    const from = left;
    left -= c.v;
    return { ...c, from, to: left };
  });
  const result = left;
  const pct = (n: number) => `${Math.max(0, (n / d.start) * 100)}%`;
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[15px] font-black text-white">{d.startLabel}</span>
          <span className="text-[17px] font-black text-white">{fmt(d.start)}</span>
        </div>
        <div className="h-9 rounded-xl bg-white/[0.05] overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.7, ease: EASE_OUT }} className="h-full rounded-xl bg-gradient-to-l from-vz-blue-light to-vz-blue-deep" />
        </div>
      </div>
      {rows.slice(0, Math.max(0, shown - 1)).map((r) => (
        <motion.div key={r.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease}>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[15px] font-bold text-white/80">{r.label}</span>
            <span className="text-[16px] font-black text-red-300" dir="ltr">−{fmt(r.v)}</span>
          </div>
          <div className="relative h-9 rounded-xl bg-white/[0.05] overflow-hidden">
            <div className="absolute inset-y-0 right-0 rounded-xl bg-white/10" style={{ width: pct(r.to) }} />
            <motion.div initial={{ width: 0 }} animate={{ width: pct(r.v) }} transition={{ duration: 0.6, ease: EASE_OUT }} className="absolute inset-y-0 rounded-xl bg-red-400/80" style={{ right: pct(r.to) }} />
          </div>
        </motion.div>
      ))}
      {shown > d.items.length + 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="glass-elevated rounded-3xl p-5 mt-4">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <span className="text-[17px] font-black text-white">{d.resultLabel}</span>
            <span className={`text-[34px] sm:text-[42px] font-black leading-none ${result >= 0 ? "text-emerald-300" : "text-red-300"}`} dir="ltr">
              {result < 0 ? "−" : ""}
              {fmt(Math.abs(result))}
            </span>
          </div>
          <div className="relative h-9 rounded-xl bg-white/[0.05] overflow-hidden">
            {d.ghost && <div className="absolute inset-y-0 right-0 rounded-xl border-2 border-dashed border-amber-200/70" style={{ width: pct(d.ghost.v) }} />}
            <motion.div initial={{ width: 0 }} animate={{ width: pct(Math.max(0, result)) }} transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 }} className="absolute inset-y-0 right-0 rounded-xl bg-emerald-400" />
          </div>
          {d.ghost && <p className="mt-3 text-[15px] font-bold text-amber-100">الخط المنقط: {d.ghost.label} {fmt(d.ghost.v)}</p>}
        </motion.div>
      )}
    </div>
  );
}

export interface FunnelData {
  stages: { label: string; value: number }[];
  unit?: string;
  note?: string;
}

export function Funnel({ d, shown }: { d: FunnelData; shown: number }) {
  const max = d.stages[0].value;
  return (
    <div className="space-y-2">
      {d.stages.slice(0, shown).map((s, i) => {
        const prev = i > 0 ? d.stages[i - 1].value : null;
        const rate = prev ? Math.round((s.value / prev) * 1000) / 10 : null;
        const w = Math.max(14, (Math.sqrt(s.value / max)) * 100);
        return (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease}>
            {rate !== null && <p className="text-center text-[13px] font-black text-amber-200 mb-1">↓ {rate}%</p>}
            <div className="mx-auto rounded-2xl bg-gradient-to-l from-vz-blue/70 to-vz-blue-light/40 border border-vz-blue-light/40 px-4 py-3 flex items-center justify-between gap-3" style={{ width: `${w}%`, minWidth: 170 }}>
              <span className="text-[15px] sm:text-[16px] font-bold text-white">{s.label}</span>
              <span className="text-[19px] sm:text-[22px] font-black text-white">{fmt(s.value)}{d.unit ?? ""}</span>
            </div>
          </motion.div>
        );
      })}
      {shown >= d.stages.length && d.note && <p className="mt-4 text-[16px] text-white/75 leading-relaxed">{d.note}</p>}
    </div>
  );
}

export interface BarsData {
  items: { label: string; value: number; tone?: string; display?: string; sub?: string }[];
  note?: string;
}

export function Bars({ d }: { d: BarsData }) {
  const max = Math.max(...d.items.map((x) => x.value));
  return (
    <div className="glass rounded-3xl p-5 sm:p-6 space-y-4">
      {d.items.map((x, i) => (
        <div key={x.label}>
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-[16px] font-black text-white">{x.label}</span>
            <span className={`text-[16px] font-black ${TEXT_TONE[x.tone ?? "blue"]}`}>{x.display ?? fmt(x.value)}</span>
          </div>
          <div className="h-8 rounded-xl bg-white/[0.05] overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(3, (x.value / max) * 100)}%` }} transition={{ duration: 0.8, ease: EASE_OUT, delay: i * 0.12 }} className={`h-full rounded-xl ${TONE[x.tone ?? "blue"]}`} />
          </div>
          {x.sub && <p className="mt-1 text-[13px] font-bold text-white/55">{x.sub}</p>}
        </div>
      ))}
      {d.note && <p className="text-[15px] text-white/70 leading-relaxed pt-1">{d.note}</p>}
    </div>
  );
}

export interface TimelineData {
  points: { at: string; title: string; text?: string; tone?: string }[];
}

export function Timeline({ d, shown }: { d: TimelineData; shown: number }) {
  return (
    <div className="relative pr-8">
      <div className="absolute right-[13px] top-2 bottom-2 w-1 rounded-full bg-white/10" />
      <motion.div className="absolute right-[13px] top-2 w-1 rounded-full bg-vz-blue-light" animate={{ height: `${(Math.min(shown, d.points.length) / d.points.length) * 100}%` }} transition={{ duration: 0.5, ease: EASE_OUT }} />
      <ol className="space-y-4">
        {d.points.map((p, i) => {
          const on = i < shown;
          return (
            <li key={p.at + p.title} className="relative">
              <span className={`absolute -right-8 top-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${on ? "bg-vz-blue border-vz-blue-light" : "bg-[#040e33] border-white/20"}`}>
                {on && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </span>
              <motion.div animate={{ opacity: on ? 1 : 0.3 }} transition={ease} className={on ? "glass rounded-2xl p-4" : "rounded-2xl p-4"}>
                <p className={`text-[14px] font-black mb-0.5 ${TEXT_TONE[p.tone ?? "blue"]}`}>{p.at}</p>
                <p className="text-[17px] font-black text-white leading-snug">{p.title}</p>
                {p.text && on && <p className="text-[15px] text-white/75 leading-relaxed mt-1">{p.text}</p>}
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export interface SplitData {
  total: string;
  parts: { label: string; pct: number; tone?: string; text?: string }[];
  note?: string;
}

export function Split({ d }: { d: SplitData }) {
  const [pick, setPick] = useState(0);
  const p = d.parts[pick];
  return (
    <div>
      <p className="text-[15px] font-black text-white/70 mb-2">{d.total}</p>
      <div className="flex h-16 rounded-2xl overflow-hidden gap-1">
        {d.parts.map((x, i) => (
          <motion.button
            key={x.label}
            type="button"
            onClick={() => setPick(i)}
            initial={{ flexGrow: 0.01 }}
            animate={{ flexGrow: x.pct }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: i * 0.12 }}
            className={`basis-0 min-w-[44px] flex items-center justify-center text-[15px] font-black text-[#ffffff] ${TONE[x.tone ?? "blue"]} ${pick === i ? "ring-2 ring-white ring-inset" : "opacity-80"}`}
          >
            {x.pct}%
          </motion.button>
        ))}
      </div>
      <motion.div key={pick} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="glass-elevated rounded-3xl p-5 mt-4">
        <p className="text-[19px] font-black text-white mb-1">{p.label}: {p.pct}%</p>
        {p.text && <p className="text-[16px] text-white/80 leading-relaxed">{p.text}</p>}
      </motion.div>
      {d.note && <p className="mt-4 text-[15px] text-white/70 leading-relaxed">{d.note}</p>}
    </div>
  );
}

export interface RangeData {
  label: string;
  min: number;
  max: number;
  step?: number;
  start: number;
  unit: string;
  zones: { to: number; label: string; tone: string; text: string }[];
}

export function Range({ d }: { d: RangeData }) {
  const [v, setV] = useState(d.start);
  const zone = d.zones.find((z) => v <= z.to) ?? d.zones[d.zones.length - 1];
  let from = d.min;
  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <p className="text-[16px] font-black text-white/80 mb-3">{d.label}</p>
      <p className={`text-[48px] sm:text-[60px] font-black leading-none mb-4 ${TEXT_TONE[zone.tone]}`} dir="ltr">
        {fmt(v)}
        {d.unit}
      </p>
      <div className="flex h-3 rounded-full overflow-hidden mb-2" dir="ltr">
        {d.zones.map((z) => {
          const w = ((Math.min(z.to, d.max) - from) / (d.max - d.min)) * 100;
          from = Math.min(z.to, d.max);
          return <span key={z.label} className={`${TONE[z.tone]} opacity-70`} style={{ width: `${w}%` }} />;
        })}
      </div>
      <input type="range" dir="ltr" min={d.min} max={d.max} step={d.step ?? 1} value={v} onChange={(e) => setV(Number(e.target.value))} className="w-full" aria-label={d.label} />
      <motion.div key={zone.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mt-4">
        <p className={`text-[19px] font-black ${TEXT_TONE[zone.tone]}`}>{zone.label}</p>
        <p className="text-[16px] text-white/80 leading-relaxed mt-1">{zone.text}</p>
      </motion.div>
    </div>
  );
}

export interface ChatData {
  messages: { from: "customer" | "seller"; text: string; note?: string }[];
}

export function Chat({ d, shown }: { d: ChatData; shown: number }) {
  return (
    <div className="space-y-3">
      {d.messages.slice(0, shown).map((m, i) => {
        const seller = m.from === "seller";
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`flex flex-col ${seller ? "items-start" : "items-end"}`}>
            <span className={`text-[12px] font-black mb-1 flex items-center gap-1 ${seller ? "text-vz-accent" : "text-white/50"}`}>
              <User className="w-3.5 h-3.5" />
              {seller ? "إنت" : "الزبون"}
            </span>
            <p className={`max-w-[88%] rounded-3xl px-4 py-3 text-[16px] sm:text-[17px] leading-relaxed whitespace-pre-line ${seller ? "bg-vz-blue/35 border border-vz-blue-light/40 text-white rounded-tl-lg" : "bg-white/[0.07] border border-white/10 text-white/90 rounded-tr-lg"}`}>
              {m.text}
            </p>
            {m.note && <p className="max-w-[88%] mt-1.5 text-[13px] font-bold text-amber-200">{m.note}</p>}
          </motion.div>
        );
      })}
    </div>
  );
}

export interface BuildData {
  core: string;
  coreSub?: string;
  pieces: { label: string; text: string }[];
  result: string;
}

export function Build({ d, shown }: { d: BuildData; shown: number }) {
  const done = shown > d.pieces.length;
  return (
    <div>
      <div className="glass-elevated rounded-3xl p-5 sm:p-6 text-center">
        <p className="text-[22px] sm:text-[26px] font-black text-white">{d.core}</p>
        {d.coreSub && <p className="text-[15px] text-white/60 mt-1">{d.coreSub}</p>}
      </div>
      <div className="mt-3 grid gap-2">
        {d.pieces.slice(0, shown).map((x, i) => (
          <motion.div key={x.label} initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={ease} className="flex items-start gap-3 rounded-2xl bg-vz-blue/20 border border-vz-blue-light/35 p-4">
            <span className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-b from-vz-blue-light to-vz-blue-deep text-white text-[18px] font-black flex items-center justify-center">+</span>
            <span>
              <span className="block text-[14px] font-black text-vz-accent">{i + 1}. {x.label}</span>
              <span className="block text-[17px] font-bold text-white leading-relaxed">{x.text}</span>
            </span>
          </motion.div>
        ))}
      </div>
      {done && (
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mt-5 text-[18px] sm:text-[20px] font-black text-emerald-300 leading-relaxed">
          {d.result}
        </motion.p>
      )}
    </div>
  );
}

export interface SplitRowsData {
  rows: { label: string; parts: { label: string; pct: number; tone?: string }[] }[];
  note?: string;
}

export function SplitRows({ d }: { d: SplitRowsData }) {
  return (
    <div className="space-y-5">
      {d.rows.map((r, ri) => (
        <div key={r.label}>
          <p className="text-[16px] font-black text-white mb-2">{r.label}</p>
          <div className="flex h-14 rounded-2xl overflow-hidden gap-1">
            {r.parts.map((x, i) => (
              <motion.div
                key={x.label}
                initial={{ flexGrow: 0.01 }}
                animate={{ flexGrow: x.pct }}
                transition={{ duration: 0.8, ease: EASE_OUT, delay: ri * 0.3 + i * 0.1 }}
                className={`basis-0 min-w-[52px] flex flex-col items-center justify-center text-[#ffffff] ${TONE[x.tone ?? "blue"]}`}
              >
                <span className="text-[15px] font-black leading-none">{x.pct}%</span>
                <span className="text-[11px] font-bold leading-tight mt-0.5 opacity-90 truncate max-w-full px-1">{x.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
      {d.note && <p className="text-[16px] text-white/75 leading-relaxed">{d.note}</p>}
    </div>
  );
}

export interface VersusData {
  a: string;
  b: string;
  aTone?: string;
  bTone?: string;
  rows: { label: string; a: string; b: string }[];
}

export function Versus({ d, shown }: { d: VersusData; shown: number }) {
  const at = d.aTone ?? "bad";
  const bt = d.bTone ?? "good";
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <p className={`text-center text-[16px] sm:text-[18px] font-black ${TEXT_TONE[at]}`}>{d.a}</p>
        <p className={`text-center text-[16px] sm:text-[18px] font-black ${TEXT_TONE[bt]}`}>{d.b}</p>
      </div>
      <div className="space-y-3">
        {d.rows.slice(0, shown).map((r) => (
          <motion.div key={r.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease}>
            <p className="text-[13px] font-black text-white/55 mb-1.5 text-center">{r.label}</p>
            <div className="grid grid-cols-2 gap-2">
              <p className={`rounded-2xl p-3 sm:p-4 text-[15px] sm:text-[16px] leading-relaxed text-white/90 border ${at === "bad" ? "bg-red-500/[0.07] border-red-400/25" : "bg-white/[0.05] border-white/10"}`}>{r.a}</p>
              <p className={`rounded-2xl p-3 sm:p-4 text-[15px] sm:text-[16px] leading-relaxed text-white border ${bt === "good" ? "bg-emerald-400/[0.09] border-emerald-400/35" : "bg-white/[0.05] border-white/10"}`}>{r.b}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export interface PickData {
  prompt: string;
  options: { label: string; title: string; text?: string }[];
}

export function Pick({ d }: { d: PickData }) {
  const [pick, setPick] = useState<number | null>(null);
  const o = pick === null ? null : d.options[pick];
  return (
    <div>
      <p className="text-[17px] font-black text-white/80 mb-3">{d.prompt}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {d.options.map((x, i) => (
          <button
            key={x.label}
            type="button"
            onClick={() => setPick(i)}
            className={`text-right px-4 py-3 rounded-2xl border text-[15px] font-bold leading-snug transition-colors duration-200 ${pick === i ? "bg-vz-blue/40 border-vz-blue-light/60 text-white" : "bg-white/[0.04] border-white/12 text-white/80 hover:bg-white/[0.08]"}`}
          >
            {x.label}
          </button>
        ))}
      </div>
      {o ? (
        <motion.div key={pick} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="glass-elevated rounded-3xl p-5 sm:p-6">
          <p className="text-[20px] sm:text-[22px] font-black text-emerald-300 leading-snug">{o.title}</p>
          {o.text && <p className="text-[16px] text-white/80 leading-relaxed mt-2">{o.text}</p>}
        </motion.div>
      ) : (
        <p className="text-[15px] font-bold text-white/45">اختار وحدة وشوف الرد</p>
      )}
    </div>
  );
}

export const GENERIC: Record<string, { render: (data: any, shown: number) => React.ReactNode; steps?: (data: any) => number }> = {
  stages: { render: (d) => <Stages d={d} /> },
  scale: { render: (d) => <Scale d={d} /> },
  reveal: { render: (d) => <Reveal d={d} /> },
  waterfall: { render: (d, s) => <Waterfall d={d} shown={s} />, steps: (d: WaterfallData) => d.items.length + 2 },
  funnel: { render: (d, s) => <Funnel d={d} shown={s} />, steps: (d: FunnelData) => d.stages.length },
  bars: { render: (d) => <Bars d={d} /> },
  timeline: { render: (d, s) => <Timeline d={d} shown={s} />, steps: (d: TimelineData) => d.points.length },
  split: { render: (d) => <Split d={d} /> },
  range: { render: (d) => <Range d={d} /> },
  chat: { render: (d, s) => <Chat d={d} shown={s} />, steps: (d: ChatData) => d.messages.length },
  build: { render: (d, s) => <Build d={d} shown={s} />, steps: (d: BuildData) => d.pieces.length + 1 },
  splitRows: { render: (d) => <SplitRows d={d} /> },
  versus: { render: (d, s) => <Versus d={d} shown={s} />, steps: (d: VersusData) => d.rows.length },
  pick: { render: (d) => <Pick d={d} /> },
  ...KIT,
  ...KIT2,
  ...KIT3,
  ...KIT4,
  ...KIT5,
  ...KIT6,
  ...KIT7,
  ...KIT8,
  ...KIT9,
  ...KIT10,
  ...KIT11,
};
