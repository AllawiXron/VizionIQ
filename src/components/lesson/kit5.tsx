import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Heart, MessageCircle, Send, Scissors, Volume2 } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";

// Chapter 5 visuals: real first frames in a reel, the hook rate, the script cut, the shoot setup and the safe zones.
const ease = { duration: 0.45, ease: EASE_OUT };
const card = "rounded-2xl bg-white/[0.04] border border-white/[0.09]";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const pct = (a: number, b: number) => Math.round((a / b) * 100);

/* ---------- the reel frame: a vertical video with the app's buttons on it ---------- */
function Rail() {
  return (
    <div className="absolute left-2.5 bottom-[22%] flex flex-col items-center gap-4 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" aria-hidden="true">
      <span className="flex flex-col items-center text-[10px] font-bold"><Heart className="w-6 h-6" />1,204</span>
      <span className="flex flex-col items-center text-[10px] font-bold"><MessageCircle className="w-6 h-6" />86</span>
      <span className="flex flex-col items-center text-[10px] font-bold"><Send className="w-6 h-6" />31</span>
    </div>
  );
}

function Bottom({ page, caption }: { page: string; caption?: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 pt-10 pb-3 px-3 bg-gradient-to-t from-black/75 via-black/35 to-transparent" aria-hidden="true">
      <p className="text-[13px] font-black text-white flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-[12px]">{page.charAt(0)}</span>
        {page}
        <span className="text-[10px] font-bold text-white/70">إعلان ممول</span>
      </p>
      {caption && <p className="mt-1.5 text-[12px] text-white/90 leading-snug line-clamp-2 pl-10">{caption}</p>}
      <p className="mt-2 rounded-lg bg-white/90 text-[#0b1230] text-[12px] font-black text-center py-1.5">راسلنا</p>
    </div>
  );
}

export function Reel({
  src,
  alt,
  page,
  caption,
  ui = true,
  filter,
  children,
}: {
  src: string;
  alt: string;
  page: string;
  caption?: string;
  ui?: boolean;
  filter?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[290px] aspect-[9/16] rounded-[26px] overflow-hidden bg-black border border-white/12 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]">
      <img src={src} alt={alt} width={540} height={960} decoding="async" className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-500" style={filter ? { filter } : undefined} />
      {children}
      {ui && (
        <>
          <div className="absolute top-2 inset-x-3 flex items-center justify-between text-[12px] font-black text-white drop-shadow" aria-hidden="true">
            <span>ريلز</span>
            <span className="text-white/70">متابعين</span>
          </div>
          <Rail />
          <Bottom page={page} caption={caption} />
        </>
      )}
    </div>
  );
}

/* ---------- reelfeed: the thumb scrolls a feed; a weak first frame goes by, a strong one stops it ---------- */
type Frame = { src: string; alt: string };
function ReelFeed({ d }: { d: { page: string; feed: string[]; weak: Frame; strong: Frame; weakSay: string; strongSay: string; fourth: string } }) {
  const [mode, setMode] = useState<"weak" | "strong">("weak");
  const [t, setT] = useState(0);
  const at = 3;
  const strong = mode === "strong";
  const list = [...d.feed.slice(0, at), strong ? d.strong.src : d.weak.src, ...d.feed.slice(at)];
  const n = list.length;
  useEffect(() => {
    setT(0);
    if (!strong) return;
    let v = 0;
    const start = setTimeout(() => {
      const id = setInterval(() => {
        v += 0.1;
        setT(Math.min(4.2, v));
        if (v >= 4.2) clearInterval(id);
      }, 100);
      (start as any).id = id;
    }, 1700);
    return () => {
      clearTimeout(start);
      if ((start as any).id) clearInterval((start as any).id);
    };
  }, [strong]);
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["weak", "strong"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 min-h-[44px] rounded-xl text-[14px] font-black border transition-colors duration-200 ${mode === m ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/80"}`}
          >
            {m === "weak" ? "تبدي بالعلبة والسلام" : "تبدي بالبقعة"}
          </button>
        ))}
      </div>
      <div className="relative mx-auto w-full max-w-[290px] aspect-[9/16] rounded-[26px] overflow-hidden bg-black border border-white/12">
        <motion.div
          key={mode}
          className="absolute inset-x-0 top-0"
          style={{ height: `${n * 100}%` }}
          initial={{ y: "0%" }}
          animate={strong ? { y: `-${(at / n) * 100}%` } : { y: ["0%", `-${((n - 1) / n) * 100}%`] }}
          transition={strong ? { duration: 1.6, ease: [0.2, 0.7, 0.2, 1] } : { duration: 5.5, ease: "linear", repeat: Infinity }}
        >
          {list.map((s, i) => (
            <div key={i} className="relative w-full" style={{ height: `${100 / n}%` }}>
              <img src={s} alt={i === at ? (strong ? d.strong.alt : d.weak.alt) : ""} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
          ))}
        </motion.div>
        <Rail />
        <Bottom page={d.page} />
        {strong && t > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={ease} className="absolute top-9 left-3 rounded-full bg-black/60 px-3 py-1.5 text-[13px] font-black text-white" dir="ltr">
            0:0{Math.floor(t)}
          </motion.div>
        )}
        {strong && t >= 3.2 && (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="absolute right-3 top-[31.5%] rounded-xl bg-black/65 px-3 py-2 text-[14px] font-black text-white leading-snug">
            {d.fourth}
          </motion.p>
        )}
      </div>
      <motion.p key={mode + (t >= 3.2 ? "4" : "")} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[16px] font-bold leading-relaxed ${strong ? "text-emerald-200" : "text-red-200"}`}>
        {strong ? d.strongSay : d.weakSay}
      </motion.p>
    </div>
  );
}

/* ---------- hookrate: three openings on the same video, which one kept people ---------- */
type Hook = { label: string; line: string; src?: string; shown: number; views: number };
function HookRate({ d }: { d: { hooks: Hook[]; note: string } }) {
  const [guess, setGuess] = useState<number | null>(null);
  const rates = d.hooks.map((h) => pct(h.views, h.shown));
  const best = rates.indexOf(Math.max(...rates));
  const max = Math.max(...rates);
  return (
    <div className="space-y-4">
      <p className="text-[15px] text-white/70 leading-relaxed">نفس الفيديو، بس تغيرت أول 3 ثواني. اختار البداية اللي تتوقع خلت الناس تكمل أكثر.</p>
      <div className="grid grid-cols-3 gap-2">
        {d.hooks.map((h, i) => (
          <button
            key={h.label}
            type="button"
            onClick={() => setGuess(i)}
            className={`rounded-2xl border overflow-hidden text-right transition-colors duration-200 ${guess === i ? "border-white bg-white/[0.1]" : "border-white/10 bg-white/[0.04]"}`}
          >
            {h.src ? (
              <img src={h.src} alt="" className="w-full aspect-[9/12] object-cover object-top" loading="lazy" />
            ) : (
              <span className="w-full aspect-[9/12] flex items-center justify-center p-2 bg-[#0d1a4a] text-[12px] font-black text-white text-center leading-snug">{h.line}</span>
            )}
            <span className="block px-2 py-2 text-[12px] sm:text-[13px] font-black text-white leading-snug">{h.label}</span>
          </button>
        ))}
      </div>
      {guess !== null && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="space-y-3">
          <div className={`${card} p-4 space-y-3`}>
            <p className="text-[13px] font-bold text-white/55">من مدير الإعلانات بعد 3 أيام: مشاهدات أول 3 ثواني ÷ مرات الظهور</p>
            {d.hooks.map((h, i) => (
              <div key={h.label}>
                <div className="flex items-center justify-between gap-2 text-[13px] mb-1">
                  <span className={`font-bold ${i === best ? "text-white" : "text-white/70"}`}>{h.label}</span>
                  <span dir="ltr" className="font-black text-white">
                    {fmt(h.views)} ÷ {fmt(h.shown)} = {rates[i]}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(rates[i] / max) * 100}%` }} transition={{ ...ease, delay: i * 0.12 }} className={`h-full rounded-full ${i === best ? "bg-emerald-300" : "bg-vz-blue-light/60"}`} />
                </div>
              </div>
            ))}
          </div>
          <p className={`text-[16px] font-bold leading-relaxed ${guess === best ? "text-emerald-200" : "text-white/85"}`}>
            {guess === best ? "صح. " : "مو هاي. "}
            {d.note}
          </p>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- reels: real first frames, one per step ---------- */
type ReelItem = { tab: string; page: string; src: string; alt: string; caption: string; comments?: string[]; note: string };
function Reels({ d, shown }: { d: { items: ReelItem[] }; shown: number }) {
  const i = Math.min(shown, d.items.length) - 1;
  const it = d.items[i];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" aria-hidden="true">
        {d.items.map((x, j) => (
          <span key={x.tab} className={`px-3.5 py-1.5 rounded-xl text-[14px] font-black border transition-colors duration-300 ${j === i ? "bg-white text-[#040e33] border-white" : j < i ? "text-white/70 border-white/25" : "text-white/35 border-white/10"}`}>
            {x.tab}
          </span>
        ))}
      </div>
      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={ease}>
        <Reel src={it.src} alt={it.alt} page={it.page} caption={it.caption} />
      </motion.div>
      {it.comments && (
        <div className="space-y-2">
          {it.comments.map((c, k) => (
            <motion.p key={i + c} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...ease, delay: 0.4 + k * 0.3 }} className="w-fit max-w-full rounded-2xl bg-white/[0.07] px-3.5 py-2 text-[14px] text-white/85">
              {c}
            </motion.p>
          ))}
        </div>
      )}
      <motion.p key={"n" + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...ease, delay: 0.3 }} className="text-[16px] sm:text-[17px] text-white/80 leading-relaxed">
        {it.note}
      </motion.p>
    </div>
  );
}

/* ---------- scriptcut: cut the lines that add nothing and watch the clock ---------- */
type SLine = { shot: string; say: string; sec: number; cut: boolean; why: string };
function ScriptCut({ d }: { d: { min: number; max: number; lines: SLine[]; done: string } }) {
  const [off, setOff] = useState<Record<number, boolean>>({});
  const [last, setLast] = useState<number | null>(null);
  const total = d.lines.reduce((t, l, i) => t + (off[i] ? 0 : l.sec), 0);
  const full = d.lines.reduce((t, l) => t + l.sec, 0);
  const wrong = d.lines.some((l, i) => off[i] && !l.cut);
  const finished = d.lines.every((l, i) => !!off[i] === l.cut);
  const inBand = total >= d.min && total <= d.max;
  const scale = (s: number) => `${(s / full) * 100}%`;
  return (
    <div className="space-y-4">
      <div className={`${card} p-4`}>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[14px] font-bold text-white/70">مدة الفيديو</span>
          <motion.span key={total} initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={ease} className={`text-[24px] font-black ${inBand ? "text-emerald-200" : "text-white"}`}>
            {total} ث
          </motion.span>
        </div>
        <div className="relative h-3 rounded-full bg-white/[0.06] overflow-hidden" dir="ltr">
          <span className="absolute inset-y-0 bg-emerald-300/20 border-x border-emerald-300/50" style={{ left: scale(d.min), width: scale(d.max - d.min) }} />
          <motion.span animate={{ width: scale(total) }} transition={ease} className={`absolute inset-y-0 left-0 rounded-full ${inBand ? "bg-emerald-300" : "bg-vz-blue-light/70"}`} />
        </div>
        <p className="mt-1.5 text-[12px] text-white/50">الخط الأخضر من {d.min} لـ {d.max} ثانية</p>
      </div>
      <p className="text-[14px] text-white/60 flex items-center gap-1.5">
        <Scissors className="w-4 h-4" /> اضغط على أي جملة تكدر تشيلها ويبقى الفيديو مفهوم.
      </p>
      <div className="space-y-2">
        {d.lines.map((l, i) => {
          const o = !!off[i];
          return (
            <button
              key={l.say}
              type="button"
              onClick={() => {
                setOff((s) => ({ ...s, [i]: !s[i] }));
                setLast(i);
              }}
              className={`w-full text-right rounded-2xl border px-3.5 py-3 transition-colors duration-200 ${o ? (l.cut ? "bg-white/[0.02] border-white/[0.06]" : "bg-red-500/[0.07] border-red-400/40") : "bg-white/[0.04] border-white/10 hover:bg-white/[0.07]"}`}
            >
              <span className="flex items-start gap-3">
                <span className={`shrink-0 min-w-[40px] text-center rounded-lg px-1.5 py-0.5 text-[12px] font-black ${o ? "bg-white/[0.05] text-white/35" : "bg-white/10 text-white"}`}>
                  {l.sec} ث
                </span>
                <span className="flex-1">
                  <span className={`block text-[12px] font-bold ${o ? "text-white/30" : "text-white/50"}`}>{l.shot}</span>
                  <span className={`block text-[15px] leading-relaxed ${o ? "text-white/35 line-through" : "text-white"}`}>{l.say}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {last !== null && (
        <motion.p
          key={last + String(!!off[last])}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ease}
          className={`text-[15px] font-bold leading-relaxed ${off[last] && !d.lines[last].cut ? "text-red-200" : "text-white/80"}`}
        >
          {off[last] ? (d.lines[last].cut ? d.lines[last].why : "هاي لازم تبقى. " + d.lines[last].why) : d.lines[last].cut ? "رجعتها. هاي الجملة بعدها ما تضيف شي." : "رجعت. هاي من أساس الفيديو."}
        </motion.p>
      )}
      {finished && !wrong && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="rounded-2xl bg-emerald-400/[0.08] border border-emerald-300/25 p-4 text-[16px] font-bold text-emerald-100 leading-relaxed">
          {d.done}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- shootsetup: pick the light and the sound, see and hear the result ---------- */
type LightOpt = { id: string; label: string; src: string; filter?: string; glow?: boolean; ok?: boolean; say: string; comment: string };
type SoundOpt = { id: string; label: string; clarity: number; kind: "clean" | "echo" | "noise" | "far"; ok?: boolean; say: string };
const WAVE = [6, 14, 22, 10, 28, 18, 8, 30, 24, 12, 4, 20, 26, 16, 6, 4, 18, 28, 14, 22, 8, 26, 12, 4];
function Waveform({ kind }: { kind: SoundOpt["kind"] }) {
  return (
    <div className="h-14 flex items-center gap-[3px]" dir="ltr" aria-hidden="true">
      {WAVE.map((h, i) => {
        const v = kind === "far" ? h * 0.35 : h;
        const floor = kind === "noise" ? 12 : 2;
        const echo = kind === "echo" ? (WAVE[(i + 23) % WAVE.length] * 0.6) : 0;
        const bar = Math.max(floor, v, echo);
        return (
          <motion.span
            key={i}
            animate={{ height: [bar * 0.6, bar * 1.6, bar * 0.8] }}
            transition={{ duration: 0.9 + (i % 4) * 0.15, repeat: Infinity, repeatType: "mirror" }}
            className={`flex-1 rounded-full ${kind === "clean" ? "bg-emerald-300" : kind === "noise" ? "bg-red-300/60" : "bg-white/45"}`}
          />
        );
      })}
    </div>
  );
}
function ShootSetup({ d }: { d: { page: string; light: LightOpt[]; sound: SoundOpt[]; done: string } }) {
  const [li, setLi] = useState(0);
  const [si, setSi] = useState(0);
  const l = d.light[li];
  const s = d.sound[si];
  const chip = (on: boolean, ok?: boolean) =>
    `min-h-[42px] px-3 rounded-xl text-[13px] sm:text-[14px] font-black border transition-colors duration-200 ${on ? (ok ? "bg-emerald-400/15 border-emerald-300/60 text-white" : "bg-white text-[#040e33] border-white") : "bg-white/[0.04] border-white/12 text-white/80"}`;
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-black text-white mb-2">الضو</p>
        <div className="flex flex-wrap gap-2">
          {d.light.map((x, j) => (
            <button key={x.id} type="button" onClick={() => setLi(j)} className={chip(j === li, x.ok)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <Reel src={l.src} alt={l.say} page={d.page} filter={l.filter}>
        {l.glow && <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,255,255,0.95),rgba(255,255,255,0.35)_45%,transparent_75%)] mix-blend-screen" aria-hidden="true" />}
      </Reel>
      <motion.p key={"l" + li} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="space-y-2">
        <span className="block w-fit max-w-full rounded-2xl bg-white/[0.07] px-3.5 py-2 text-[14px] text-white/85">{l.comment}</span>
        <span className={`block text-[15px] font-bold leading-relaxed ${l.ok ? "text-emerald-200" : "text-white/80"}`}>{l.say}</span>
      </motion.p>
      <div>
        <p className="text-[14px] font-black text-white mb-2 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4" /> الصوت
        </p>
        <div className="flex flex-wrap gap-2">
          {d.sound.map((x, j) => (
            <button key={x.id} type="button" onClick={() => setSi(j)} className={chip(j === si, x.ok)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <div className={`${card} p-4`}>
        <Waveform kind={s.kind} />
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-[13px] font-bold text-white/60">شكد من كلامك ينفهم</span>
          <span className={`text-[20px] font-black ${s.ok ? "text-emerald-200" : "text-white"}`}>{s.clarity}%</span>
        </div>
        <motion.p key={"s" + si} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={ease} className="mt-1 text-[14px] text-white/75 leading-relaxed">
          {s.say}
        </motion.p>
      </div>
      {l.ok && s.ok && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="rounded-2xl bg-emerald-400/[0.08] border border-emerald-300/25 p-4 text-[16px] font-bold text-emerald-100 leading-relaxed flex gap-2">
          <Check className="w-5 h-5 shrink-0 mt-0.5" /> {d.done}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- safezone: where the words sit on the reel, and if they can be read ---------- */
type Pos = { id: string; label: string; top: number; ok?: boolean; say: string };
type Sty = { id: string; label: string; ok?: boolean; say: string };
function SafeZone({ d }: { d: { page: string; src: string; alt: string; line: string; caption: string; positions: Pos[]; styles: Sty[]; done: string } }) {
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(() => Math.max(0, d.styles.findIndex((x) => x.ok)));
  const [ui, setUi] = useState(true);
  const p = d.positions[pi];
  const s = d.styles[si];
  const look: Record<string, string> = {
    yellow: "text-[#ffe75a]",
    edge: "text-white [paint-order:stroke] [-webkit-text-stroke:5px_#0b0b0b]",
    band: "text-white bg-black/70 rounded-lg px-2 py-1",
  };
  const chip = (on: boolean) => `min-h-[40px] px-3 rounded-xl text-[13px] sm:text-[14px] font-black border transition-colors duration-200 ${on ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/80"}`;
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-black text-white mb-2">وين تحط الكتابة؟</p>
        <div className="flex flex-wrap gap-2">
          {d.positions.map((x, j) => (
            <button key={x.id} type="button" onClick={() => setPi(j)} className={chip(j === pi)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[14px] font-black text-white mb-2">بأي شكل؟</p>
        <div className="flex flex-wrap gap-2">
          {d.styles.map((x, j) => (
            <button key={x.id} type="button" onClick={() => setSi(j)} className={chip(j === si)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <Reel src={d.src} alt={d.alt} page={d.page} caption={d.caption} ui={ui}>
        <motion.div initial={false} animate={{ top: `${p.top}%` }} transition={ease} className="absolute inset-x-5 flex justify-center">
          <span className={`text-center text-[22px] font-black leading-tight ${look[s.id]}`}>{d.line}</span>
        </motion.div>
      </Reel>
      <button type="button" onClick={() => setUi((u) => !u)} className="mx-auto block text-[14px] font-black text-white/70 underline underline-offset-4">
        {ui ? "شيل أزرار التطبيق" : "رجع أزرار التطبيق"}
      </button>
      <motion.div key={pi + "-" + si} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="space-y-1.5">
        <p className={`text-[15px] font-bold leading-relaxed ${p.ok ? "text-emerald-200" : "text-red-200"}`}>{p.say}</p>
        <p className={`text-[15px] font-bold leading-relaxed ${s.ok ? "text-emerald-200" : "text-red-200"}`}>{s.say}</p>
      </motion.div>
      {p.ok && s.ok && (
        <p className="rounded-2xl bg-emerald-400/[0.08] border border-emerald-300/25 p-4 text-[16px] font-bold text-emerald-100 leading-relaxed">{d.done}</p>
      )}
    </div>
  );
}

export const KIT5: Record<string, { render: (data: any, shown: number) => React.ReactNode; steps?: (data: any) => number }> = {
  reelfeed: { render: (d) => <ReelFeed d={d} /> },
  hookrate: { render: (d) => <HookRate d={d} /> },
  reels: { render: (d, s) => <Reels d={d} shown={s} />, steps: (d) => d.items.length },
  scriptcut: { render: (d) => <ScriptCut d={d} /> },
  shootsetup: { render: (d) => <ShootSetup d={d} /> },
  safezone: { render: (d) => <SafeZone d={d} /> },
};
