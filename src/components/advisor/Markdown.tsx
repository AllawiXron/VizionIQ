import React, { memo, useState } from "react";
import { ArrowLeft, BookOpen, Check, Compass, LifeBuoy, Wrench } from "lucide-react";
import { chaptersList } from "../../data/chaptersData";
import { playbooksList } from "../../data/playbooksData";
import { guideModules } from "../../data/iraqGuideData";


export const TOOL_LABELS: Record<string, string> = {
  diagnostics: "افحص مشروعك",
  "sales-blocker": "ليش ما دتبيع؟",
  "customer-types": "دليل أنواع الزباين",
  competitors: "حلل المنافسين",
  "pricing-calculator": "حاسبة السعر والربح",
  "profit-leak": "كاشف خسائر الأرباح",
  forecaster: "توقع الأرباح",
  "budget-planner": "خطط ميزانيتك",
  "campaign-advisor": "مستشار الإعلانات",
  "message-diagnoser": "قيم جودة رسائلك",
  "product-evaluator": "تقييم المنتج",
  "ads-library": "مكتبة الإعلانات",
  roadmap: "خطة أول 100 طلب",
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
  if (id.startsWith("solution:")) {
    const pb = playbooksList.find((p) => p.id === id.slice(9));
    if (!pb) return null;
    return (
      <button type="button" onClick={() => actions.onChapter?.(id)} className="vz-md-chip" title={pb.problem}>
        <LifeBuoy className="w-3.5 h-3.5" />
        الحل: {pb.title}
      </button>
    );
  }
  if (id.startsWith("guide:")) {
    const gm = guideModules.find((g) => g.id === id.slice(6));
    if (!gm) return null;
    return (
      <button type="button" onClick={() => actions.onChapter?.(id)} className="vz-md-chip" title={gm.subtitle}>
        <Compass className="w-3.5 h-3.5" />
        الدليل العراقي: {gm.title.split(":")[0]}
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

// a line that only points into the course becomes a clear button that says it opens the course
const COURSE_TOKEN = /\[\[[^\]\n]+\]\]/g;
const FILLER = /^(شوف|راجع|اقرا|اقرأ|و|،|,|:|\.|\s)*$/;

function courseTarget(token: string): { kicker: string; title: string; icon: React.ElementType; open: (a: MarkdownActions) => void } | null {
  const id = token.slice(2, -2).trim();
  if (id.startsWith("tool:")) {
    const toolId = id.slice(5);
    const label = TOOL_LABELS[toolId];
    return label ? { kicker: "افتح الأداة", title: label, icon: Wrench, open: (a) => a.onTool?.(toolId, TOOL_CATEGORY[toolId]) } : null;
  }
  if (id.startsWith("solution:")) {
    const pb = playbooksList.find((p) => p.id === id.slice(9));
    return pb ? { kicker: "افتح الحل بالكورس، خطوة بخطوة", title: pb.title, icon: LifeBuoy, open: (a) => a.onChapter?.(id) } : null;
  }
  if (id.startsWith("guide:")) {
    const gm = guideModules.find((g) => g.id === id.slice(6));
    return gm ? { kicker: "افتح بالدليل العراقي", title: gm.title.split(":")[0], icon: Compass, open: (a) => a.onChapter?.(id) } : null;
  }
  const ch = chaptersList.find((c) => c.id === id);
  return ch ? { kicker: `افتح ${ch.number} بالكورس`, title: ch.title, icon: BookOpen, open: (a) => a.onChapter?.(ch.id) } : null;
}

function CourseLinks({ text, actions }: { text: string; actions: MarkdownActions }) {
  const targets = (text.match(COURSE_TOKEN) ?? []).map(courseTarget).filter(Boolean) as NonNullable<ReturnType<typeof courseTarget>>[];
  return (
    <div className="space-y-2 pt-1">
      {targets.map(({ kicker, title, icon: Icon, open }) => (
        <button
          key={kicker + title}
          type="button"
          onClick={() => open(actions)}
          className="w-full min-h-[58px] px-3.5 py-2.5 rounded-2xl bg-vz-blue/20 border border-vz-blue-light/35 flex items-center gap-3 text-right hover:bg-vz-blue/30 active:scale-[0.99] transition"
        >
          <span className="w-9 h-9 rounded-xl bg-gradient-to-b from-vz-blue-light to-vz-blue-deep flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px] text-white" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[11.5px] font-bold text-vz-accent">{kicker}</span>
            <span className="block text-[14px] font-black text-white leading-snug">{title}</span>
          </span>
          <ArrowLeft className="w-5 h-5 text-white/80 shrink-0" />
        </button>
      ))}
    </div>
  );
}

const onlyCourseLinks = (text: string) => /\[\[[^\]\n]+\]\]/.test(text) && FILLER.test(text.replace(COURSE_TOKEN, ""));

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
      {/* the box itself puts the step in the plan, so there is no second button */}
      <button
        type="button"
        disabled={!actions.onAddTask || added || done}
        onClick={() => {
          if (actions.onAddTask?.(text.replace(/\*\*/g, "")) !== false) setAdded(true);
        }}
        aria-label={added ? "موجودة بخطتي" : "ضيفها لخطتي"}
        className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${done || added ? "bg-vz-blue border-vz-blue" : "border-white/35"}`}
      >
        {(done || added) && <Check className="w-3.5 h-3.5 text-white" />}
      </button>
      <span className="flex-1 min-w-0">
        <Inline text={text} actions={actions} />
      </span>
    </li>
  );
}

const NO_ACTIONS: MarkdownActions = {};

const BlockView = memo(
  function BlockView({ block, actions }: { block: MdBlock; sig: string; actions: MarkdownActions }) {
    return renderBlock(block, actions);
  },
  (a, b) => a.sig === b.sig && a.actions === b.actions
);

function MarkdownImpl({ text, actions = NO_ACTIONS }: { text: string; actions?: MarkdownActions }) {
  const blocks = parseMarkdown(text);
  return (
    <div className="vz-md space-y-2.5">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} sig={JSON.stringify(b)} actions={actions} />
      ))}
    </div>
  );
}

export const Markdown = memo(MarkdownImpl);

function renderBlock(b: MdBlock, actions: MarkdownActions): React.ReactElement {
  switch (b.kind) {
    case "h":
      return b.level <= 2 ? (
        <h3 className="pt-1.5 text-[16px] sm:text-[17px] font-black text-white flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue shrink-0" />
          <Inline text={b.text} actions={actions} />
        </h3>
      ) : (
        <h4 className="pt-1 text-[15px] font-extrabold text-white/95">
          <Inline text={b.text} actions={actions} />
        </h4>
      );
    case "p":
      if (onlyCourseLinks(b.text)) return <CourseLinks text={b.text} actions={actions} />;
      return (
        <p className="whitespace-pre-line">
          <Inline text={b.text} actions={actions} />
        </p>
      );
    case "ul":
      return (
        <ul className="space-y-1.5">
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
        <ol className="space-y-2">
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
        <ul className="space-y-0.5">
          {b.items.map((it, j) => (
            <TaskItem key={j} text={it.text} done={it.done} actions={actions} />
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="rounded-2xl border-r-[3px] border-vz-blue-light bg-vz-blue/10 px-4 py-3 text-white font-bold">
          <Inline text={b.text} actions={actions} />
        </blockquote>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
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
      return <hr className="border-white/10" />;
  }
}
