// Ask a chapter page to open one of its lessons as soon as it shows, the way a free visitor lands straight in lesson 1.

let pending: { chapterId: string; index: number } | null = null;

export function requestLesson(chapterId: string, index: number) {
  pending = { chapterId, index };
}

export function takeLesson(chapterId: string): number | null {
  if (!pending || pending.chapterId !== chapterId) return null;
  const { index } = pending;
  pending = null;
  return index;
}
