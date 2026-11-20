import { courseChapters } from "../data/course";

// What the student wrote in the course's write-your-own steps, as plain lines the advisor can read.
// Saved on this device only, under the same keys the lesson player uses.

const MAX_CHARS = 2500;

export function readLessonNotes(): string | undefined {
  if (typeof localStorage === "undefined") return undefined;
  const out: string[] = [];
  let size = 0;
  Object.entries(courseChapters).forEach(([chapterId, chapter], ci) => {
    chapter.lessons.forEach((lesson, li) => {
      const block = lesson.blocks.find((b) => b.kind === "apply");
      if (!block || block.kind !== "apply") return;
      let saved: Record<string, string> = {};
      try {
        saved = JSON.parse(localStorage.getItem(`vz_apply_${chapterId}_${li}`) || "{}");
      } catch {
        return;
      }
      const lines = block.fields
        .map((f) => [f.label, (saved[f.id] || "").trim()] as const)
        .filter(([, v]) => v.length > 0)
        .map(([label, v]) => `- ${label} ${v.slice(0, 300)}`);
      if (!lines.length) return;
      const entry = `الفصل ${ci + 1}، الدرس ${li + 1} (${block.title}):\n${lines.join("\n")}`;
      if (size + entry.length > MAX_CHARS) return;
      size += entry.length;
      out.push(entry);
    });
  });
  return out.length ? out.join("\n\n") : undefined;
}
