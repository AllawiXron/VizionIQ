import type { Block, CourseChapter, Lesson } from "./types";
import { chapter1 } from "./chapter1.js";

export type { Block, CourseChapter, Lesson } from "./types";

/** Every chapter of the course, by chapter id. */
export const courseChapters: Record<string, CourseChapter> = {
  chapter1,
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
  }
}

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

/** Study time of one lesson in minutes (careful reading pace, at least 4). */
export function lessonMinutes(lesson: Lesson): number {
  const n = words([lesson.intro, ...lesson.blocks.map(blockText), lesson.takeaway].join(" "));
  return Math.max(4, Math.round(n / 80));
}

export function chapterMinutes(chapter: CourseChapter): number {
  return chapter.lessons.reduce((sum, l) => sum + lessonMinutes(l), 0);
}

/** Plain text of a lesson, for search and the advisor's knowledge. */
export function lessonText(lesson: Lesson): string {
  return [lesson.intro, ...lesson.blocks.map(blockText), lesson.takeaway].join("\n");
}
