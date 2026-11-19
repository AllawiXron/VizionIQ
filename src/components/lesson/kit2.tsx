import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronLeft } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";
import { FeedPost, PostImage } from "./audience";

// Chapter 2 visuals: the offer read off a real post, the bundle math, the first line, and quick replies.
const ease = { duration: 0.45, ease: EASE_OUT };
const card = "rounded-2xl bg-white/[0.04] border border-white/[0.09]";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
type Zone = { x: number; y: number; w: number; h: number };

/* ---------- offermap: tap each piece of the offer and see where the post says it ---------- */
type Piece = { label: string; zone?: Zone; line?: number; note: string };
function OfferMap({ d }: { d: { page: string; src: string; alt: string; caption: string[]; pieces: Piece[]; done: string } }) {
  const [i, setI] = useState<number | null>(null);
  const [seen, setSeen] = useState<Record<number, boolean>>({});
  const p = i === null ? null : d.pieces[i];
  const all = Object.keys(seen).length >= d.pieces.length;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {d.pieces.map((x, j) => (
          <button
            key={x.label}
            type="button"
            onClick={() => {
              setI(j);
              setSeen((s) => ({ ...s, [j]: true }));
            }}
            className={`min-h-[40px] px-3.5 rounded-xl text-[14px] font-black border transition-colors duration-200 ${j === i ? "bg-white text-[#040e33] border-white" : seen[j] ? "text-white border-white/30 bg-white/[0.06]" : "text-white/75 border-white/12 bg-white/[0.03]"}`}
          >
            {j + 1}. {x.label}
          </button>
        ))}
      </div>
      <FeedPost
        page={d.page}
        creative={<PostImage src={d.src} alt={d.alt} ring={p?.zone ?? null} />}
        caption={
          <span className="block space-y-1">
            {d.caption.map((l, k) => (
              <span key={k} className={`block rounded-lg px-1.5 -mx-1.5 transition-colors duration-300 ${p?.line === k ? "bg-vz-blue/45 text-white" : ""}`}>
                {l}
              </span>
            ))}
          </span>
        }
      />
      {p ? (
        <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] sm:text-[17px] text-white/85 leading-relaxed">
          {p.note}
        </motion.p>
      ) : (
        <p className="text-[15px] text-white/60">اضغط على كل قطعة وشوف وين مذكورة بالمنشور.</p>
      )}
      {all && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="rounded-2xl bg-emerald-400/[0.08] border border-emerald-300/25 p-4 text-[16px] font-bold text-emerald-100 leading-relaxed">
          {d.done}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- bundle: move the price of two pieces and watch what is left ---------- */
function Bundle({
  d,
}: {
  d: { src: string; alt: string; single: number; cost: number; fixed: number; fee: number; gift: number; start: number; min: number; max: number; three: number; note: string };
}) {
  const [two, setTwo] = useState(d.start);
  const [gift, setGift] = useState(false);
  const profit = (price: number, pieces: number, g: boolean) => price - pieces * d.cost - d.fixed - (price * d.fee) / 100 - (g ? d.gift : 0);
  const one = profit(d.single, 1, false);
  const pair = profit(two, 2, gift);
  const three = profit(d.three, 3, gift);
  const second = two - d.single - d.cost - ((two - d.single) * d.fee) / 100;
  const save = d.single * 2 - two;
  const max = Math.max(one, pair, three, 1);
  const rows = [
    { label: `قطعة وحدة بـ ${fmt(d.single)}`, v: one },
    { label: `قطعتين بـ ${fmt(two)}`, v: pair, main: true },
    { label: `ثلاث قطع بـ ${fmt(d.three)}`, v: three },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[96px_1fr] sm:grid-cols-[120px_1fr] gap-3 items-start">
        <img src={d.src} alt={d.alt} width={900} height={1125} loading="lazy" decoding="async" className="w-full h-auto rounded-xl" />
        <div className="space-y-1.5 text-[14px] text-white/70 leading-relaxed">
          <p>كلفة القطعة الواصلة {fmt(d.cost)}</p>
          <p>التوصيل والإعلان والراجع {fmt(d.fixed)} على الطلب كله</p>
          <p>عمولة الاستلام {d.fee}%</p>
        </div>
      </div>
      <label className="block">
        <span className="block text-[15px] font-black text-white mb-1">سعر القطعتين: {fmt(two)}</span>
        <span className="block text-[13px] text-white/55 mb-2">الزبون يوفر {fmt(save)} عن شراهن منفردات</span>
        <input dir="ltr" type="range" min={d.min} max={d.max} step={1000} value={two} onChange={(e) => setTwo(Number(e.target.value))} className="w-full accent-emerald-300 h-11" />
      </label>
      <button
        type="button"
        onClick={() => setGift((g) => !g)}
        className={`w-full text-right flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-colors duration-200 ${gift ? "bg-emerald-400/[0.08] border-emerald-300/40" : "bg-white/[0.04] border-white/10"}`}
      >
        <span className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${gift ? "bg-emerald-400 border-emerald-300" : "border-white/30"}`}>{gift && <Check className="w-4 h-4 text-[#03140c]" strokeWidth={3} />}</span>
        <span className="text-[15px] font-bold text-white">قنينة ماي هدية ويا البكج، كلفتها {fmt(d.gift)}</span>
      </button>
      <div className={`${card} p-4 space-y-3`}>
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between gap-2 text-[14px] mb-1">
              <span className={`font-bold ${r.main ? "text-white" : "text-white/70"}`}>{r.label}</span>
              <span className={`font-black ${r.v <= 0 ? "text-red-300" : "text-white"}`}>{r.v < 0 ? "خسارة" : ""}{fmt(Math.abs(r.v))}</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div animate={{ width: `${Math.max(0, r.v / max) * 100}%` }} transition={ease} className={`h-full rounded-full ${r.v <= 0 ? "bg-red-400" : r.main ? "bg-emerald-300" : "bg-vz-blue-light/70"}`} />
            </div>
          </div>
        ))}
      </div>
      <motion.div
        key={second > 1500 ? "ok" : "bad"}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={ease}
        className={`rounded-2xl border p-4 ${second > 1500 ? "bg-emerald-400/[0.08] border-emerald-300/25" : "bg-red-500/[0.07] border-red-400/30"}`}
      >
        <p className="text-[13px] font-bold text-white/55">ربح القطعة الثانية وحدها</p>
        <p className={`text-[22px] font-black ${second > 1500 ? "text-emerald-200" : "text-red-200"}`}>{second < 0 ? "خسارة" : ""}{fmt(Math.abs(second))}</p>
        <p className="text-[14px] text-white/75 leading-relaxed mt-1">{second > 1500 ? "الخصم محسوب، والقطعة الثانية هم تربحك." : second < 0 ? "القطعة الثانية دتنباع بأقل من كلفتها. كل بكج تطلعه يخسرك." : "الخصم كبير، والقطعة الثانية تقريبا ما تطلعلك ربح."}</p>
      </motion.div>
      <p className="text-[14px] text-white/55 leading-relaxed">{d.note}</p>
    </div>
  );
}

/* ---------- seemore: the feed cuts the caption after one line; pick the line that earns the tap ---------- */
type Line = { first: string; rest: string; verdict: string; good?: boolean };
function SeeMore({ d }: { d: { page: string; src: string; alt: string; lines: Line[]; prompt: string } }) {
  const [i, setI] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const l = i === null ? null : d.lines[i];
  return (
    <div className="space-y-4">
      <p className="text-[15px] sm:text-[16px] text-white/70 leading-relaxed">{d.prompt}</p>
      <div className="space-y-2">
        {d.lines.map((x, j) => (
          <button
            key={x.first}
            type="button"
            onClick={() => {
              setI(j);
              setOpen(false);
            }}
            className={`w-full text-right rounded-2xl border px-3.5 py-3 text-[15px] leading-relaxed transition-colors duration-200 ${j === i ? (x.good ? "bg-emerald-400/[0.1] border-emerald-300/50 text-white" : "bg-red-500/[0.07] border-red-400/40 text-white") : "bg-white/[0.04] border-white/10 text-white/85 hover:bg-white/[0.08]"}`}
          >
            {x.first}
          </button>
        ))}
      </div>
      {l && (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="space-y-3">
          <FeedPost
            page={d.page}
            creative={<PostImage src={d.src} alt={d.alt} />}
            caption={
              open ? (
                <span className="block whitespace-pre-line">
                  {l.first}
                  {"\n"}
                  {l.rest}
                </span>
              ) : (
                <span className="block">
                  <span className="line-clamp-1">{l.first}</span>
                  <button type="button" onClick={() => setOpen(true)} className="font-black text-white/55 hover:text-white">
                    ... المزيد
                  </button>
                </span>
              )
            }
          />
          <p className={`text-[16px] font-bold leading-relaxed ${l.good ? "text-emerald-200" : "text-red-200"}`}>{l.verdict}</p>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- quickreplies: answer each message with the right saved reply ---------- */
type Msg = { text: string; time: string; reply: string };
function QuickReplies({ d }: { d: { page: string; messages: Msg[]; replies: { key: string; text: string }[]; done: string } }) {
  const [at, setAt] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const finished = at >= d.messages.length;
  const pick = (key: string) => {
    if (finished) return;
    if (key === d.messages[at].reply) {
      setAt((a) => a + 1);
      setWrong(null);
    } else setWrong(key);
  };
  const textOf = (k: string) => d.replies.find((r) => r.key === k)?.text ?? "";
  return (
    <div>
      <div className="rounded-[22px] overflow-hidden border border-white/10">
        <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-[14px] font-black text-white">{d.page.charAt(0)}</span>
          <span className="text-[15px] font-black text-white">{d.page}</span>
          <span className="mr-auto text-[12px] font-bold text-white/70">
            {Math.min(at, d.messages.length)} من {d.messages.length}
          </span>
        </div>
        <div className="bg-[#0b141a] p-3 space-y-2 min-h-[220px]">
          {d.messages.slice(0, Math.min(at + 1, d.messages.length)).map((m, i) => (
            <React.Fragment key={i}>
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-[#202c33] text-white text-[15px] leading-relaxed">
                  {m.text}
                  <span dir="ltr" className="block text-[11px] text-white/45 mt-0.5 text-left">{m.time}</span>
                </div>
              </motion.div>
              {i < at && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-[#005c4b] text-white text-[15px] leading-relaxed">{textOf(m.reply)}</div>
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="bg-[#111b21] p-3 border-t border-white/10">
          <div className="flex flex-wrap gap-2" dir="rtl">
            {d.replies.map((r) => (
              <button
                key={r.key}
                type="button"
                disabled={finished}
                onClick={() => pick(r.key)}
                className={`min-h-[40px] px-3.5 rounded-xl text-[14px] font-black border transition-colors duration-200 disabled:opacity-40 ${wrong === r.key ? "bg-red-500/15 border-red-400/50 text-white" : "bg-white/[0.06] border-white/15 text-white hover:bg-white/[0.12]"}`}
              >
                <span>/{r.key}</span>
              </button>
            ))}
          </div>
          {wrong && !finished && <p className="mt-2 text-[13px] font-bold text-red-200">هذا الرد ما يجاوب على سؤاله، ارجع اقرا رسالته مرة ثانية.</p>}
        </div>
      </div>
      {finished ? (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mt-3 text-[16px] font-bold text-emerald-200 leading-relaxed">
          {d.done}
        </motion.p>
      ) : (
        <p className="mt-3 text-[14px] text-white/60 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> اختار الرد السريع اللي يناسب رسالة الزبون.
        </p>
      )}
    </div>
  );
}

export const KIT2: Record<string, { render: (data: any, shown: number) => React.ReactNode; steps?: (data: any) => number }> = {
  offermap: { render: (d) => <OfferMap d={d} /> },
  bundle: { render: (d) => <Bundle d={d} /> },
  seemore: { render: (d) => <SeeMore d={d} /> },
  quickreplies: { render: (d) => <QuickReplies d={d} /> },
};
