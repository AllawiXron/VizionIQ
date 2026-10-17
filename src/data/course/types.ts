/**
 * The course, chapter by chapter: lessons written as blocks, a workbook to
 * apply each chapter to the member's own project, ready-to-copy templates, a
 * worked example, common mistakes and a short quiz.
 */

export type Block =
  /** A paragraph. */
  | { kind: "p"; text: string }
  /** A short list of points. */
  | { kind: "points"; title?: string; items: string[] }
  /** Numbered steps, each with a title and an explanation. */
  | { kind: "steps"; title?: string; items: { title: string; text: string }[] }
  /** An example from the Iraqi market. */
  | { kind: "example"; title: string; text: string }
  /** A practical note. */
  | { kind: "tip"; text: string }
  /** Something to watch out for. */
  | { kind: "warning"; text: string }
  /** A small table (first column is the row label). */
  | { kind: "table"; title?: string; head: string[]; rows: string[][] }
  /** The usual way next to the right way. */
  | { kind: "compare"; title?: string; bad: { label: string; text: string }; good: { label: string; text: string } };

export interface Lesson {
  title: string;
  /** One or two sentences: the problem this lesson solves. */
  intro: string;
  blocks: Block[];
  /** The one thing to remember. */
  takeaway: string;
}

export interface PracticeTask {
  title: string;
  /** What to do, concretely. */
  detail: string;
  /** What the member has once it is done. */
  output: string;
}

export interface Template {
  title: string;
  /** When to use it. */
  when: string;
  /** The text to copy. Placeholders in [square brackets]. */
  text: string;
  /** Optional: why it works, or how to adapt it. */
  note?: string;
}

export interface WorkedExample {
  title: string;
  /** The situation, framed as an illustration (not a real named business). */
  setup: string;
  rows: { label: string; before: string; after: string }[];
  whatChanged: string[];
  lesson: string;
}

export interface Mistake {
  mistake: string;
  why: string;
  fix: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  /** Index of the right option. */
  answer: number;
  why: string;
}

export interface CourseChapter {
  id: string;
  /** One sentence: by the end of this chapter you will... */
  goal: string;
  outcomes: string[];
  lessons: Lesson[];
  practice: { intro: string; tasks: PracticeTask[] };
  templates: Template[];
  example: WorkedExample;
  mistakes: Mistake[];
  quiz: QuizQuestion[];
}
