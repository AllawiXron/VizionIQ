// Splits a lesson screen into pages that each fit the stage, so a phone never has to scroll.
// The screen keeps its own markup: pages are made by hiding the blocks that belong to other pages.

const OFF = "data-vz-off";

const shown = (n: Element): n is HTMLElement => {
  const h = n as HTMLElement;
  if (!h.offsetHeight) return false;
  const pos = getComputedStyle(h).position;
  return pos !== "absolute" && pos !== "fixed";
};

// only split containers whose children sit under each other, never a row of things side by side
const stacked = (el: Element) => {
  const kids = [...el.children].filter(shown);
  if (kids.length < 2) return false;
  for (let i = 1; i < kids.length; i++) {
    if (kids[i].getBoundingClientRect().top < kids[i - 1].getBoundingClientRect().bottom - 2) return false;
  }
  return true;
};

// a card, a post or anything with its own frame reads as one piece: shrink it rather than cut it,
// unless it is so tall that shrinking would make it unreadable
const framed = (el: Element) => {
  const cs = getComputedStyle(el);
  const bg = cs.backgroundColor;
  const hasBg = (bg && bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg)) || cs.backgroundImage !== "none";
  const hasBorder = parseFloat(cs.borderTopWidth) > 0 && !/rgba\(.*,\s*0\)$/.test(cs.borderTopColor);
  return hasBg || hasBorder || cs.overflow === "hidden" || cs.overflow === "clip";
};

function chunksOf(root: Element, room: number): HTMLElement[] {
  let el: Element = root;
  for (;;) {
    const kids = [...el.children].filter(shown);
    if (kids.length === 1) el = kids[0];
    else break;
  }
  const kids = [...el.children].filter(shown);
  if (kids.length < 2 || !stacked(el)) return [el as HTMLElement];
  const out: HTMLElement[] = [];
  for (const k of kids) {
    const tooTall = k.offsetHeight > room * 0.9;
    // a framed card around a picture stays whole down to a strong shrink; a framed card of text splits early
    const media = [...k.querySelectorAll("img, svg, canvas, video")].some((m) => (m as HTMLElement).getBoundingClientRect().height > 120);
    const limit = media ? room / 0.62 : room / 0.86;
    if (tooTall && (!framed(k) || k.offsetHeight > limit)) out.push(...chunksOf(k, room));
    else out.push(k);
  }
  return out;
}

export interface PagePlan {
  head: HTMLElement | null;
  chunks: HTMLElement[];
  pages: number[][];
}

// scale the whole screen, and give back the space it no longer takes, so a photo shrinks with its text
const shrink = (screen: HTMLElement, s: number) => {
  const h = screen.offsetHeight;
  screen.style.transformOrigin = "top center";
  screen.style.transform = `scale(${s.toFixed(4)})`;
  screen.style.marginBottom = `${-Math.ceil(h * (1 - s))}px`;
};
const unshrink = (screen: HTMLElement) => {
  screen.style.removeProperty("transform");
  screen.style.removeProperty("transform-origin");
  screen.style.removeProperty("margin-bottom");
};

export const clearPages = (screen: HTMLElement) => {
  screen.querySelectorAll(`[${OFF}]`).forEach((n) => n.removeAttribute(OFF));
  unshrink(screen);
};

/** plan pages for a screen measured with everything visible; returns null when it already fits */
export function planPages(screen: HTMLElement, room: number, shrinkFloor: number): PagePlan | null {
  clearPages(screen);
  const full = screen.offsetHeight;
  if (full <= room) return null;
  if (room / full >= shrinkFloor) {
    shrink(screen, room / full);
    return null;
  }
  const chunks = chunksOf(screen, room);
  if (chunks.length < 2) {
    shrink(screen, Math.max(0.6, room / full));
    return null;
  }
  const top0 = screen.getBoundingClientRect().top;
  const box = chunks.map((c) => {
    const r = c.getBoundingClientRect();
    return { top: r.top - top0, bottom: r.bottom - top0 };
  });
  const hasHead = chunks.length > 2 && box[0].bottom - box[0].top < 72;
  const first = hasHead ? 1 : 0;
  const headRoom = hasHead ? box[1].top : 0;
  const pages: number[][] = [];
  let start = first;
  let cur: number[] = [];
  const tall = (i: number) => box[i].bottom - box[i].top;
  for (let j = first; j < chunks.length; j++) {
    if (cur.length && box[j].bottom - box[start].top + headRoom > room) {
      // a short label stays with the block it introduces
      const carry: number[] = [];
      while (cur.length && tall(cur[cur.length - 1]) < 44) carry.unshift(cur.pop() as number);
      if (cur.length) pages.push(cur);
      cur = carry;
      start = carry.length ? carry[0] : j;
    }
    cur.push(j);
  }
  if (cur.length) pages.push(cur);
  if (pages.length < 2) {
    shrink(screen, Math.max(0.6, room / full));
    return null;
  }
  return { head: hasHead ? chunks[0] : null, chunks, pages };
}

/** show one page of a plan, shrinking it a little if a single block is still taller than the stage */
export function showPage(screen: HTMLElement, plan: PagePlan, page: number, room: number) {
  clearPages(screen);
  const keep = new Set(plan.pages[page] ?? []);
  plan.chunks.forEach((c, i) => {
    if (c === plan.head || keep.has(i)) return;
    c.setAttribute(OFF, "");
  });
  // a frame whose blocks are all on other pages goes too, so no empty card is left behind
  let changed = true;
  while (changed) {
    changed = false;
    screen.querySelectorAll(`[${OFF}]`).forEach((n) => {
      const parent = n.parentElement;
      if (!parent || parent === screen || parent.hasAttribute(OFF)) return;
      const live = [...parent.children].some((k) => !k.hasAttribute(OFF) && (k as HTMLElement).offsetHeight > 0);
      if (!live) {
        parent.setAttribute(OFF, "");
        changed = true;
      }
    });
  }
  const h = screen.offsetHeight;
  if (h > room) shrink(screen, Math.max(0.6, room / h));
}

/** the page that holds the first block that was not there before, or null when nothing new appeared */
export function pageOfNew(plan: PagePlan, before: HTMLElement[]): number | null {
  const old = new Set(before);
  const fresh = plan.chunks.findIndex((c, i) => i > 0 && !old.has(c));
  if (fresh < 0) return null;
  if (plan.chunks.every((c) => !old.has(c))) return 0;
  const p = plan.pages.findIndex((pg) => pg.includes(fresh));
  return p < 0 ? null : p;
}
