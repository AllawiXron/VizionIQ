/**
 * Attribute-driven scroll reveals.
 *
 * Any element with `data-reveal` fades up out of a soft blur the first time it
 * enters the viewport (CSS in index.css does the animation; this file only
 * flips the `is-revealed` class). `data-reveal-delay="1".."6"` staggers
 * siblings. One shared IntersectionObserver, unobserved after reveal, plus a
 * MutationObserver so lazily-mounted sections are picked up automatically.
 */

export function initScrollReveal(): () => void {
  if (typeof window === "undefined") return () => {};
  const root = document.documentElement;

  if (!("IntersectionObserver" in window)) {
    root.classList.add("reveal-disabled");
    return () => {};
  }
  root.classList.add("reveal-ready");

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  const scan = (node: ParentNode) => {
    node.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)").forEach((el) => io.observe(el));
  };

  scan(document);

  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        const el = n as HTMLElement;
        if (el.hasAttribute("data-reveal") && !el.classList.contains("is-revealed")) io.observe(el);
        scan(el);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    io.disconnect();
    mo.disconnect();
  };
}
