export type Block =
  | { kind: "p"; text: string }
  | { kind: "points"; title?: string; items: string[] }
  | { kind: "steps"; title?: string; items: { title: string; text: string }[] }
  | { kind: "example"; title: string; text: string }
  | { kind: "tip"; text: string }
  | { kind: "warning"; text: string }
  | { kind: "table"; title?: string; head: string[]; rows: string[][] }
  | { kind: "compare"; title?: string; bad: { label: string; text: string }; good: { label: string; text: string } }
  | { kind: "image"; src: string; caption: string; alt?: string }
  | { kind: "visual"; name: string; title: string; caption?: string; text?: string; data?: unknown };

export interface Lesson {
  title: string;
  intro: string;
  blocks: Block[];
  takeaway: string;
}

export interface PracticeTask {
  title: string;
  detail: string;
  output: string;
}

export interface Template {
  title: string;
  when: string;
  text: string;
  note?: string;
}

export interface WorkedExample {
  title: string;
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
  answer: number;
  why: string;
}

export interface CourseChapter {
  id: string;
  goal: string;
  outcomes: string[];
  lessons: Lesson[];
  practice: { intro: string; tasks: PracticeTask[] };
  templates: Template[];
  example: WorkedExample;
  mistakes: Mistake[];
  quiz: QuizQuestion[];
}
