import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

// Something, up close: a role from the timeline or a case study from the
// work. Escape closes it, the arrow keys step through its siblings, focus
// stays inside while it's open and goes back where it came from after.
export function Spotlight({ label, onClose, onMove, children }: { label: string; onClose: () => void; onMove?: (step: number) => void; children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const handlers = useRef({ onClose, onMove });
  handlers.current = { onClose, onMove };

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlers.current.onClose();
      if (e.key === "ArrowRight") handlers.current.onMove?.(1);
      if (e.key === "ArrowLeft") handlers.current.onMove?.(-1);
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", key);
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      html.style.overflow = overflow;
      before?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div ref={panelRef} role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-[150] overflow-y-auto bg-background/95 backdrop-blur-sm" onClick={onClose}>
      <div className="animate-reveal relative mx-auto min-h-full max-w-[1300px] px-5 pb-28 pt-24 sm:px-8" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
      <button ref={closeRef} onClick={onClose} aria-label="Close" className="fixed right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-foreground/30 bg-background text-foreground transition-colors hover:bg-muted sm:right-8 sm:top-7">
        <X className="h-5 w-5" />
      </button>
      {onMove && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center gap-3 bg-gradient-to-t from-background via-background/85 to-transparent pb-6 pt-12" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onMove(-1)} className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/60 hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> previous
          </button>
          <button onClick={() => onMove(1)} className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/60 hover:text-foreground">
            next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
