import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// The objects that sit along the thread: small line drawings of the things
// the work is made of (a TV plan, a display ad, a CRM email, a search box, a
// performance chart). Drawn in the same stroke as the thread, with one
// offset plate behind each so they read with a little depth.

function Mark({ label, className, children }: { label?: string | undefined; className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 120"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("h-full w-full overflow-visible text-foreground [stroke-linecap:round] [stroke-linejoin:round]", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
    >
      {children}
    </svg>
  );
}

export function TvMark({ label }: { label?: string | undefined }) {
  return (
    <Mark label={label}>
      <rect x="19" y="35" width="92" height="62" rx="8" className="fill-violet/20 stroke-none" />
      <path d="M48 30 L36 12 M72 30 L86 14" />
      <circle cx="36" cy="12" r="3.2" className="fill-cyan stroke-none" />
      <circle cx="86" cy="14" r="3.2" className="fill-cyan stroke-none" />
      <rect x="14" y="30" width="92" height="62" rx="8" className="fill-surface" />
      <rect x="22" y="38" width="76" height="46" rx="4" className="fill-violet/25 stroke-none" />
      <path d="M54 51 L71 61 L54 71 Z" className="fill-cyan stroke-none" />
      <path d="M44 92 L38 104 M76 92 L82 104 M30 104 H90" />
    </Mark>
  );
}

export function AdMark({ label }: { label?: string | undefined }) {
  return (
    <Mark label={label}>
      <rect x="17" y="29" width="92" height="70" rx="6" className="fill-violet/20 stroke-none" />
      <rect x="12" y="24" width="92" height="70" rx="6" className="fill-surface" />
      <path d="M12 36 H104" />
      <circle cx="20" cy="30" r="1.6" className="fill-foreground stroke-none" />
      <circle cx="26" cy="30" r="1.6" className="fill-foreground stroke-none" />
      <rect x="21" y="44" width="54" height="24" rx="3" className="fill-violet stroke-none" />
      <path d="M21 77 H66 M21 85 H52" className="opacity-60" />
      <path d="M80 62 L80 86 L86 80 L91 91 L95 89 L90 78 L98 78 Z" className="fill-foreground stroke-none" />
      <path d="M92 8 A12 12 0 1 1 82 22" className="stroke-cyan" />
      <path d="M82 22 L81 14 M82 22 L89 20" className="stroke-cyan" />
    </Mark>
  );
}

export function MailMark({ label }: { label?: string | undefined }) {
  return (
    <Mark label={label}>
      <rect x="21" y="41" width="84" height="56" rx="6" className="fill-violet/20 stroke-none" />
      <rect x="16" y="36" width="84" height="56" rx="6" className="fill-surface" />
      <path d="M16 41 L58 68 L100 41" />
      <circle cx="98" cy="25" r="4" className="fill-cyan stroke-none" />
      <circle cx="108" cy="15" r="3" className="fill-cyan/70 stroke-none" />
      <circle cx="115" cy="7" r="2" className="fill-cyan/40 stroke-none" />
    </Mark>
  );
}

const SPARKLE = (cx: number, cy: number, r: number) => `M${cx} ${cy - r} C${cx + r * 0.12} ${cy - r * 0.2} ${cx + r * 0.2} ${cy - r * 0.12} ${cx + r} ${cy} C${cx + r * 0.2} ${cy + r * 0.12} ${cx + r * 0.12} ${cy + r * 0.2} ${cx} ${cy + r} C${cx - r * 0.12} ${cy + r * 0.2} ${cx - r * 0.2} ${cy + r * 0.12} ${cx - r} ${cy} C${cx - r * 0.2} ${cy - r * 0.12} ${cx - r * 0.12} ${cy - r * 0.2} ${cx} ${cy - r} Z`;

export function SearchMark({ label }: { label?: string | undefined }) {
  return (
    <Mark label={label}>
      <circle cx="57" cy="57" r="29" className="fill-violet/20 stroke-none" />
      <path d="M74 74 L99 99" strokeWidth="9" className="stroke-violet" />
      <circle cx="52" cy="52" r="29" className="fill-surface" />
      <path d={SPARKLE(52, 52, 15)} className="fill-cyan stroke-none" />
      <path d={SPARKLE(92, 24, 7)} className="fill-violet stroke-none" />
    </Mark>
  );
}

export function ChartMark({ label }: { label?: string | undefined }) {
  return (
    <Mark label={label}>
      <rect x="22" y="72" width="16" height="28" rx="2" className="fill-violet/35 stroke-none" />
      <rect x="45" y="58" width="16" height="42" rx="2" className="fill-violet/60 stroke-none" />
      <rect x="68" y="44" width="16" height="56" rx="2" className="fill-violet stroke-none" />
      <path d="M14 100 H106" />
      <path d="M18 64 C36 60 52 46 66 38 S92 22 100 16" className="stroke-cyan" />
      <circle cx="100" cy="16" r="4.5" className="fill-cyan stroke-none" />
    </Mark>
  );
}

export function BroadcastMark({ label }: { label?: string | undefined }) {
  return (
    <Mark label={label}>
      <path d="M60 46 L42 106 M60 46 L78 106 M50 74 H70 M46 90 H74 M36 106 H84" />
      <circle cx="60" cy="40" r="7" className="fill-violet stroke-none" />
      <path d="M46 26 Q37 40 46 54 M74 26 Q83 40 74 54" className="stroke-cyan" />
      <path d="M33 16 Q19 40 33 64 M87 16 Q101 40 87 64" className="stroke-cyan opacity-55" />
    </Mark>
  );
}

export function JourneyMark({ label }: { label?: string | undefined }) {
  return (
    <Mark label={label}>
      <path d="M14 96 C34 96 30 64 50 64 S66 34 86 34 S100 20 106 16" strokeDasharray="1 7" strokeWidth="3" />
      <circle cx="14" cy="96" r="6" className="fill-surface" />
      <circle cx="50" cy="64" r="6" className="fill-surface" />
      <circle cx="86" cy="34" r="6" className="fill-cyan/60" />
      <circle cx="106" cy="16" r="8" className="fill-violet stroke-none" />
    </Mark>
  );
}

export function StackMark({ label }: { label?: string | undefined }) {
  return (
    <Mark label={label}>
      <path d="M60 64 L102 84 L60 104 L18 84 Z" className="fill-surface" />
      <path d="M60 46 L102 66 L60 86 L18 66 Z" className="fill-cyan/30" />
      <path d="M60 28 L102 48 L60 68 L18 48 Z" className="fill-violet/70" />
      <path d={SPARKLE(60, 48, 8)} className="fill-foreground stroke-none" />
    </Mark>
  );
}

// The rabbit hole's spiral, drawn as one loose hand-drawn line.
export function SpiralMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className={className} fill="none">
      <path
        d="M100 100 m0 -4 a4 4 0 1 1 -4 6 a10 10 0 1 1 15 -11 a18 18 0 1 1 -28 14 a28 28 0 1 1 46 -20 a40 40 0 1 1 -64 26 a54 54 0 1 1 88 -34 a70 70 0 1 1 -112 42"
        stroke="url(#spiral-ink)"
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="spiral-ink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--cyan)" }} />
          <stop offset="1" style={{ stopColor: "var(--primary)" }} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const marks = { tv: TvMark, ad: AdMark, mail: MailMark, search: SearchMark, chart: ChartMark, broadcast: BroadcastMark, journey: JourneyMark, stack: StackMark };
export type MarkName = keyof typeof marks;
