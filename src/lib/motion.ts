// The small set of motion helpers every section shares, so reveals and
// count-ups behave the same everywhere and all respect reduced motion.

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Things sharpen in as they scroll into view, once. Anything already marked
// `data-shown` is left alone.
export function observeReveals(root: ParentNode, selector = ".reveal") {
  const targets = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((el) => !el.hasAttribute("data-shown"));
  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
    targets.forEach((el) => el.setAttribute("data-shown", ""));
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.setAttribute("data-shown", "");
        io.unobserve(e.target);
      }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  targets.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

// Count a number up from zero the first time it scrolls into view. The final
// value is what the server renders, so it reads correctly without JS, and
// assistive technology gets the final value from a separate label.
export function countUpOnView(el: HTMLElement, value: number, decimals = 0, duration = 1400) {
  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return () => {};
  // Already on screen when the page loads: just leave the final value.
  if (el.getBoundingClientRect().top < window.innerHeight) return () => {};
  const format = (n: number) => n.toFixed(decimals);
  // Below the fold it waits at zero (still hidden by its reveal) until it arrives.
  el.textContent = format(0);
  let frame = 0;
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        el.textContent = format(value * easeOutCubic(t));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  io.observe(el);
  return () => {
    io.disconnect();
    cancelAnimationFrame(frame);
  };
}
