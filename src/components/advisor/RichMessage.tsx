import React, { memo, useEffect, useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { parseRichBlocks } from "../../lib/advisor/blocks";
import { parseCalcBlock } from "../../lib/advisor/calc";
import { stripAdvisorTags, type BusinessProfile } from "../../lib/advisor/profile";
import { Markdown, type MarkdownActions } from "./Markdown";
import { CalcCard } from "./CalcCard";

/**
 * One advisor answer, rendered rich: markdown prose, ready-to-send script
 * bubbles (copy / open in WhatsApp) and live calculator cards. Safe to render
 * on every streamed chunk — partial fences and tags are handled.
 */
export interface RichMessageProps extends MarkdownActions {
  text: string;
  streaming?: boolean;
  onCopy?: (text: string) => void;
  onSaveProfile?: (p: BusinessProfile) => void;
}

function ScriptBubble({ text, open, onCopy }: { key?: React.Key; text: string; open?: boolean; onCopy?: (t: string) => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard blocked: still report so the merchant can long-press */
    }
    setCopied(true);
    onCopy?.(text);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="my-1 rounded-3xl border border-emerald-400/25 bg-gradient-to-b from-emerald-400/[0.10] to-emerald-400/[0.03] overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="flex items-center gap-1.5 text-[12px] font-black text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-[#25d366]" />
          رسالة جاهزة للإرسال
        </span>
      </div>
      <div className="px-4 pt-2 pb-3">
        <div className="relative rounded-2xl rounded-tr-md bg-[#0b3d2c]/70 border border-emerald-300/15 px-4 py-3 text-[15px] leading-[1.9] text-emerald-50 whitespace-pre-wrap">
          {text}
          {open && <span className="vz-caret" />}
        </div>
      </div>
      {!open && (
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          <button
            type="button"
            onClick={copy}
            className={`min-h-[42px] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-colors ${
              copied ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200" : "border-white/12 bg-white/[0.05] text-white hover:bg-white/10"
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "انتسخت" : "نسخ"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[42px] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 bg-[#25d366] text-[#052e1a] hover:brightness-110"
          >
            <MessageCircle className="w-4 h-4" />
            افتح بالواتساب
          </a>
        </div>
      )}
    </div>
  );
}

function RichMessageImpl({ text, streaming, onCopy, onSaveProfile, ...actions }: RichMessageProps) {
  const blocks = parseRichBlocks(stripAdvisorTags(text, streaming), streaming);
  const lastIndex = blocks.length - 1;
  return (
    <div className="space-y-3 text-[15px] sm:text-[16px] leading-[1.9] text-white/90">
      {blocks.map((b, i) => {
        const caret = streaming && i === lastIndex;
        if (b.type === "script") return <ScriptBubble key={i} text={b.content} open={b.open} onCopy={onCopy} />;
        if (b.type === "calc") {
          if (b.open) return <div key={i} className="h-24 rounded-3xl border border-white/10 bg-white/[0.04] animate-pulse" />;
          const input = parseCalcBlock(b.content);
          return input ? <CalcCard key={i} initial={input} onSaveToProfile={onSaveProfile} /> : null;
        }
        if (b.type === "code")
          return (
            <pre key={i} className="rounded-2xl bg-black/40 border border-white/10 p-3 text-[13px] overflow-x-auto" dir="ltr">
              {b.content}
            </pre>
          );
        return (
          <div key={i} className={caret ? "vz-streaming" : undefined}>
            <Markdown text={b.content} actions={actions} />
          </div>
        );
      })}
      {streaming && blocks.length === 0 && <ThinkingDots />}
    </div>
  );
}

export const RichMessage = memo(RichMessageImpl);

/** What the advisor is doing while the first words are on their way. */
const THINKING_STAGES: [number, string][] = [
  [0, "دا أقرا سؤالك…"],
  [2500, "دا أراجع ملف مشروعك ومحتوى الكورس…"],
  [7000, "دا أحسب الأرقام وأرتب الجواب…"],
  [14000, "جواب دسم، ثواني ويبدي…"],
  [26000, "الخوادم عليها ضغط، دا أجرب طريق أسرع…"],
];

export function ThinkingDots({ label }: { label?: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - started), 500);
    return () => clearInterval(id);
  }, []);
  const stage = label ?? [...THINKING_STAGES].reverse().find(([t]) => elapsed >= t)![1];
  return (
    <div className="flex items-center gap-2.5 text-[13px] font-bold text-vz-accent py-1" role="status" aria-live="polite">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="vz-think-dot" style={{ animationDelay: `${i * 0.16}s` }} />
        ))}
      </span>
      {stage}
    </div>
  );
}
