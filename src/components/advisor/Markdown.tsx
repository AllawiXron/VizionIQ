import React, { useState } from "react";
import { BookOpen, Check, Plus, Wrench } from "lucide-react";
import { chaptersList } from "../../data/chaptersData";

/**
 * Small markdown renderer for advisor answers. Handles exactly what the
 * advisor is told to write: headings, lists, "- [ ]" action items, tables,
 * quotes, bold/italic/code, and [[chapterN]] / [[tool:id]] course links.
 * No HTML is ever injected — everything renders as React nodes.
 */

export const TOOL_LABELS: Record<string, string> = {
  diagnostics: "فحص مشروعك",
  "sales-blocker": "ليش ماكو مبيعات؟",
  "customer-types": "دليل أنواع الزبائن",
  competitors: "محلل المنافسين",
  "pricing-calculator": "حاسبة التسعير والربح",
  "profit-leak": "كاشف تسرب الأرباح",
  forecaster: "متوقع الأرباح",
  "budget-planner": "مخطط الميزانية",
  "campaign-advisor": "مستشار الحملات",
  "message-diagnoser": "جودة الرسائل",
  "product-evaluator": "تقييم المنتج",
  "ads-library": "مكتبة الإعلانات",
  roadmap: "مخطط الـ 100 طلب",
};
const TOOL_CATEGORY: Record<string, string> = {
  diagnostics: "understand",
  "sales-blocker": "understand",
  "customer-types": "understand",
  competitors: "understand",
  "pricing-calculator": "calculate",
  "profit-leak": "calculate",
  forecaster: "calculate",
  "budget-planner": "calculate",
  "campaign-advisor": "optimize",
  "message-diagnoser": "optimize",
  "product-evaluator": "optimize",
  "ads-library": "optimize",
  roadmap: "execute",
};

export interface MarkdownActions {
  onChapter?: (chapterId: string) => void;
  onTool?: (toolId: string, category?: string) => void;
  onAddTask?: (task: string) => boolean | void;
}

/* ------------------------------------------------------------------ */
/* Inline                                                              */
/* ------------------------------------------------------------------ */

const INLINE_RE = /(\*\*[^*\n]+\*\*|\[\[[^\]\n]+\]\]|`[^`\n]+`|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)|\*[^*\n]+\*)/g;

function CourseChip({ token, actions }: { key?: React.Key; token: string; actions: MarkdownActions }) {
  const id = token.slice(2, -2).trim();
  if (id.startsWith("tool:")) {
    const toolId = id.slice(5);
    const label = TOOL_LABELS[toolId];
    if (!label) return null;
    return (
      <button type="button" onClick={() => actions.onTool?.(toolId, TOOL_CATEGORY[toolId])} className="vz-md-chip">
        <Wrench className="w-3.5 h-3.5" />
        {label}
      </button>
    );
  }
  const ch = chaptersList.find((c) => c.id === id);
  if (!ch) return null;
  return (
    <button type="button" onClick={() => actions.onChapter?.(ch.id)} className="vz-md-chip" title={ch.title}>
      <BookOpen className="w-3.5 h-3.5" />
      {ch.number}: {ch.title}
    </button>
  );
}

export function Inline({ text, actions }: { text: string; actions: MarkdownActions }) {
  const parts = text.split(INLINE_RE);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (p.startsWith("**") && p.endsWith("**") && p.length > 4) return <strong key={i} className="font-extrabold text-white">{p.slice(2, -2)}</strong>;
        if (p.startsWith("[[") && p.endsWith("]]")) return <CourseChip key={i} token={p} actions={actions} />;
        if (p.startsWith("`") && p.endsWith("`") && p.length > 2) return <code key={i} className="px-1.5 py-0.5 rounded-md bg-white/10 text-[0.92em] font-mono" dir="auto">{p.slice(1, -1)}</code>;
        const link = p.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
        if (link) return <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-vz-sky underline underline-offset-4">{link[1]}</a>;
        if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

type MdBlock =
  | { kind: "h"; level: number; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[]; start: number }
  | { kind: "tasks"; items: { text: string; done: boolean }[] }
  | { kind: "quote"; text: string }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "hr" };

const isTableRow = (l: string) => /^\s*\|.*\|\s*$/.test(l);
const splitRow = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

export function parseMarkdown(src: string): MdBlock[] {
  const lines = src.replace(/\r/g, "").split("\n");
  const out: MdBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) {
      i++;
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = t.match(/^(#{1,4})\s+(.*)$/))) {
      out.push({ kind: "h", level: m[1].length, text: m[2].replace(/\s*#+$/, "") });
      i++;
    } else if (/^(-{3,}|\*{3,}|_{3,}|━+)$/.test(t)) {
      out.push({ kind: "hr" });
      i++;
    } else if (isTableRow(t) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const head = splitRow(t);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) rows.push(splitRow(lines[i++]));
      out.push({ kind: "table", head, rows });
    } else if (/^>\s?/.test(t)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) buf.push(lines[i++].trim().replace(/^>\s?/, ""));
      out.push({ kind: "quote", text: buf.join(" ") });
    } else if (/^[-*•]\s+\[( |x|X)\]\s+/.test(t)) {
      const items: { text: string; done: boolean }[] = [];
      while (i < lines.length && (m = lines[i].trim().match(/^[-*•]\s+\[( |x|X)\]\s+(.*)$/))) {
        items.push({ text: m[2], done: m[1].toLowerCase() === "x" });
        i++;
      }
      out.push({ kind: "tasks", items });
    } else if (/^[-*•]\s+/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim()) && !/^[-*•]\s+\[( |x|X)\]/.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^[-*•]\s+/, ""));
      out.push({ kind: "ul", items });
    } else if ((m = t.match(/^(\d+)[.)-]\s+/))) {
      const start = parseInt(m[1], 10);
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)-]\s+/.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^\d+[.)-]\s+/, ""));
      out.push({ kind: "ol", items, start });
    } else {
      const buf: string[] = [t];
      i++;
      while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|>|[-*•]\s|\d+[.)-]\s|\|)/.test(lines[i].trim())) buf.push(lines[i++].trim());
      out.push({ kind: "p", text: buf.join("\n") });
    }
  }
  return out;
}

function TaskItem({ text, done, actions }: { key?: React.Key; text: string; done: boolean; actions: MarkdownActions }) {
  const [added, setAdded] = useState(false);
  return (
    <li className="flex items-start gap-2.5 py-1.5">
      <span className={`mt-1 w-[18px] h-[18px] rounded-md border flex items-center justify-center shrink-0 ${done || added ? "bg-vz-blue border-vz-blue" : "border-white/30"}`}>
        {(done || added) && <Check className="w-3 h-3 text-white" />}
      </span>
      <span className="flex-1 min-w-0">
        <Inline text={text} actions={actions} />
      </span>
      {actions.onAddTask && (
        <button
          type="button"
          disabled={added}
          onClick={() => {
            if (actions.onAddTask?.(text.replace(/\*\*/g, "")) !== false) setAdded(true);
          }}
          className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors ${
            added ? "border-emerald-400/40 text-emerald-300 bg-emerald-400/10" : "border-white/15 text-vz-accent hover:bg-white/10"
          }`}
          aria-label="أضف هذه الخطوة لخطتي"
        >
          {added ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {added ? "بالخطة" : "خطتي"}
        </button>
      )}
    </li>
  );
}

export function Markdown({ text, actions = {} }: { text: string; actions?: MarkdownActions }) {
  const blocks = parseMarkdown(text);
  return (
    <div className="vz-md space-y-2.5">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h":
            return b.level <= 2 ? (
              <h3 key={i} className="pt-1.5 text-[16px] sm:text-[17px] font-black text-white flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue shrink-0" />
                <Inline text={b.text} actions={actions} />
              </h3>
            ) : (
              <h4 key={i} className="pt-1 text-[15px] font-extrabold text-white/95">
                <Inline text={b.text} actions={actions} />
              </h4>
            );
          case "p":
            return (
              <p key={i} className="whitespace-pre-line">
                <Inline text={b.text} actions={actions} />
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-1.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2.5">
                    <span className="mt-[0.7em] w-1.5 h-1.5 rounded-full bg-vz-blue-light shrink-0" />
                    <span className="flex-1 min-w-0">
                      <Inline text={it} actions={actions} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2.5">
                    <span className="mt-0.5 w-6 h-6 rounded-lg bg-vz-blue/20 border border-vz-blue/40 text-vz-accent text-xs font-black flex items-center justify-center shrink-0">{b.start + j}</span>
                    <span className="flex-1 min-w-0">
                      <Inline text={it} actions={actions} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "tasks":
            return (
              <ul key={i} className="rounded-2xl bg-white/[0.04] border border-white/10 px-3 py-1.5 divide-y divide-white/[0.06]">
                {b.items.map((it, j) => (
                  <TaskItem key={j} text={it.text} done={it.done} actions={actions} />
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={i} className="rounded-2xl border-r-[3px] border-vz-blue-light bg-vz-blue/10 px-4 py-3 text-white font-bold">
                <Inline text={b.text} actions={actions} />
              </blockquote>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
                <table className="w-full text-[13px] sm:text-sm">
                  <thead>
                    <tr className="bg-white/[0.06]">
                      {b.head.map((h, j) => (
                        <th key={j} className="px-3 py-2 text-right font-black text-white whitespace-nowrap">
                          <Inline text={h} actions={actions} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-t border-white/[0.06]">
                        {r.map((c, k) => (
                          <td key={k} className="px-3 py-2 align-top">
                            <Inline text={c} actions={actions} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "hr":
            return <hr key={i} className="border-white/10" />;
        }
      })}
    </div>
  );
}
