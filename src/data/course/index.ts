import type { Block, CourseChapter, Lesson } from "./types";
import { chapter1 } from "./chapter1.js";
import { chapter2 } from "./chapter2.js";
import { chapter3 } from "./chapter3.js";
import { chapter4 } from "./chapter4.js";
import { chapter5 } from "./chapter5.js";
import { chapter6 } from "./chapter6.js";
import { chapter7 } from "./chapter7.js";
import { chapter8 } from "./chapter8.js";
import { chapter9 } from "./chapter9.js";
import { chapter10 } from "./chapter10.js";
import { chapter11 } from "./chapter11.js";

export type { Block, CourseChapter, Lesson } from "./types";

export const courseChapters: Record<string, CourseChapter> = {
  chapter1,
  chapter2,
  chapter3,
  chapter4,
  chapter5,
  chapter6,
  chapter7,
  chapter8,
  chapter9,
  chapter10,
  chapter11,
};

function blockText(b: Block): string {
  switch (b.kind) {
    case "p":
    case "tip":
    case "warning":
      return b.text;
    case "points":
      return [b.title ?? "", ...b.items].join(" ");
    case "steps":
      return [b.title ?? "", ...b.items.map((i) => `${i.title} ${i.text}`)].join(" ");
    case "example":
      return `${b.title} ${b.text}`;
    case "table":
      return [b.title ?? "", ...b.head, ...b.rows.flat()].join(" ");
    case "compare":
      return `${b.title ?? ""} ${b.bad.text} ${b.good.text}`;
    case "image":
      return b.caption;
    case "visual":
      return [b.title, b.caption ?? "", b.text ?? ""].join(" ");
    case "check":
      return [b.question, ...b.options, b.explain].join(" ");
    case "apply":
      return [b.title, b.intro, ...b.fields.map((f) => f.label)].join(" ");
  }
}

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

export function lessonMinutes(lesson: Lesson): number {
  const shown = lesson.blocks.map((b) => (b.kind === "visual" ? [b.title, b.caption ?? ""].join(" ") : blockText(b)));
  const reading = words([lesson.intro, ...shown, lesson.takeaway].join(" ")) / 120;
  const doing = lesson.blocks.reduce((t, b) => t + (b.kind === "apply" ? 2 : b.kind === "visual" || b.kind === "check" || b.kind === "compare" ? 0.5 : 0), 0);
  return Math.max(4, Math.round(reading + doing));
}

export function chapterMinutes(chapter: CourseChapter): number {
  return chapter.lessons.reduce((sum, l) => sum + lessonMinutes(l), 0);
}

export function lessonText(lesson: Lesson): string {
  return [lesson.intro, ...lesson.blocks.map(blockText), lesson.takeaway].join("\n");
}
