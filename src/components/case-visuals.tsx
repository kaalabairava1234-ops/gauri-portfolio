import { createContext, useContext, useId, type ReactNode } from "react";

import type { CaseStudy } from "@/lib/content";
import { cn } from "@/lib/utils";

// Abstract diagrams for the case studies. They illustrate the shape of the
// work (a flighting plan, an AI answer, a journey, a campaign desk), never
// real client data, so every one is labelled "illustrative" where it's shown.
// They come alive a little when their card is hovered (Tailwind `group`).

const motion = "transition-transform duration-700 ease-[cubic-bezier(.22,.7,.2,1)]";

// Each drawing gets its own gradient ids, so several on one page never clash.
const InkContext = createContext("");
const useInk = () => `url(#${useContext(InkContext)}-ink)`;

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <InkContext.Provider value={id}>
    <svg viewBox="0 0 400 300" aria-hidden="true" className={cn("h-full w-full", className)} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 H0 V20" className="stroke-foreground/[0.06]" strokeWidth="1" />
        </pattern>
        <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--primary)" }} />
          <stop offset="1" style={{ stopColor: "var(--cyan)" }} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-grid)`} />
      {children}
    </svg>
    </InkContext.Provider>
  );
}

// A national TV flighting plan: networks down the side, weeks across, and
// the bought flights as bars.
function MediaVisual() {
  const rows = [
    [0, 3, 5, 7],
    [1, 4],
    [0, 2, 6, 7],
    [2, 5],
    [1, 3, 4, 7],
  ];
  return (
    <Frame>
      {Array.from({ length: 8 }, (_, w) => (
        <text key={w} x={92 + w * 36 + 14} y="46" textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
          W{w + 1}
        </text>
      ))}
      {rows.map((weeks, r) => (
        <g key={r}>
          <rect x="30" y={66 + r * 38} width="44" height="12" rx="6" className="fill-foreground/15" />
          {weeks.map((w, k) => (
            <rect
              key={w}
              x={92 + w * 36}
              y={62 + r * 38}
              width="30"
              height="20"
              rx="3"
              className={cn(motion, "origin-left group-hover:scale-x-110", (r + k) % 3 === 0 ? "fill-cyan/80" : "fill-violet/80")}
              style={{ transformBox: "fill-box", transitionDelay: `${(r * 4 + k) * 25}ms` }}
            />
          ))}
        </g>
      ))}
      <g className={cn(motion, "group-hover:-translate-y-1")}>
        <rect x="262" y="254" width="116" height="28" rx="14" className="fill-background stroke-violet/60" />
        <text x="320" y="272" textAnchor="middle" className="fill-foreground font-mono text-[10px]">10% avg. saving</text>
      </g>
    </Frame>
  );
}

// An AI-generated answer, drawing on the brand's own content and its
// off-site profiles as sources.
function AeoVisual() {
  return (
    <Frame>
      <rect x="40" y="34" width="320" height="38" rx="19" className="fill-background stroke-border" />
      <path d="M62 53 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M67 58 L73 64" className="stroke-muted-foreground" strokeWidth="2" />
      <rect x="86" y="49" width="150" height="8" rx="4" className="fill-foreground/25" />
      <rect x="40" y="90" width="320" height="130" rx="14" className="fill-surface stroke-violet/40" />
      <path d="M64 108 c1 6 2 7 8 8 c-6 1 -7 2 -8 8 c-1 -6 -2 -7 -8 -8 c6 -1 7 -2 8 -8 Z" className="fill-cyan" />
      <rect x="82" y="111" width="70" height="8" rx="4" className="fill-cyan/50" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="58" y={136 + i * 16} width={[270, 250, 280, 170][i]} height="7" rx="3.5" className={cn(motion, "origin-left fill-foreground/20 group-hover:scale-x-[1.04]")} style={{ transformBox: "fill-box" }} />
      ))}
      {[
        { x: 58, label: "website" },
        { x: 158, label: "reviews" },
        { x: 258, label: "blog" },
      ].map((s, i) => (
        <g key={s.label} className={cn(motion, "group-hover:-translate-y-1.5")} style={{ transitionDelay: `${i * 70}ms` }}>
          <path d={`M${s.x + 40} 220 L${s.x + 40} 238`} className="stroke-violet/50" strokeDasharray="2 4" strokeWidth="1.5" />
          <rect x={s.x} y="240" width="80" height="26" rx="13" className="fill-background stroke-violet/60" />
          <text x={s.x + 40} y="257" textAnchor="middle" className="fill-foreground font-mono text-[10px]">{s.label}</text>
        </g>
      ))}
    </Frame>
  );
}

// A buyer journey as a path of stages, each feeding a CRM stage below it.
function JourneyVisual() {
  const ink = useInk();
  const stops = [
    { x: 50, y: 150 },
    { x: 125, y: 110 },
    { x: 200, y: 140 },
    { x: 275, y: 96 },
    { x: 350, y: 120 },
  ];
  return (
    <Frame>
      <path d="M50 150 C88 150 92 110 125 110 S170 140 200 140 S245 96 275 96 S330 120 350 120" stroke={ink} strokeWidth="3" strokeDasharray="2 8" className="transition-[stroke-dashoffset] duration-1000 group-hover:[stroke-dashoffset:-40]" />
      {stops.map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y} r={i === stops.length - 1 ? 11 : 8} className={i === stops.length - 1 ? "fill-violet" : "fill-background stroke-foreground"} strokeWidth="2" />
          <text x={s.x} y={s.y - 18} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">0{i + 1}</text>
          <path d={`M${s.x} ${s.y + 12} V200`} className="stroke-foreground/20" strokeWidth="1.5" strokeDasharray="2 4" />
          <g className={cn(motion, "group-hover:-translate-y-1")} style={{ transitionDelay: `${i * 60}ms` }}>
            <rect x={s.x - 30} y="204" width="60" height="58" rx="6" className="fill-surface stroke-border" />
            <rect x={s.x - 22} y="214" width="28" height="6" rx="3" className={i % 2 ? "fill-cyan/60" : "fill-violet/70"} />
            <rect x={s.x - 22} y="228" width="44" height="5" rx="2.5" className="fill-foreground/20" />
            <rect x={s.x - 22} y="240" width="34" height="5" rx="2.5" className="fill-foreground/20" />
          </g>
        </g>
      ))}
      <text x="30" y="290" className="fill-muted-foreground font-mono text-[9px]">journey stage → CRM stage</text>
    </Frame>
  );
}

// A campaign desk: a wall of running campaigns and the satisfaction score.
function OpsVisual() {
  const ink = useInk();
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <Frame>
      {Array.from({ length: 9 }, (_, i) => {
        const x = 30 + (i % 3) * 66;
        const y = 40 + Math.floor(i / 3) * 76;
        return (
          <g key={i} className={cn(motion, "group-hover:-translate-y-1")} style={{ transitionDelay: `${i * 30}ms` }}>
            <rect x={x} y={y} width="56" height="64" rx="6" className="fill-surface stroke-border" />
            <rect x={x + 8} y={y + 9} width="40" height="18" rx="2" className={i % 4 === 1 ? "fill-cyan/60" : "fill-violet/60"} />
            {[0, 1, 2].map((b) => (
              <rect key={b} x={x + 10 + b * 13} y={y + 54 - [14, 20, 10, 18, 24, 12][(i + b) % 6]!} width="8" height={[14, 20, 10, 18, 24, 12][(i + b) % 6]} rx="1.5" className="fill-foreground/30" />
            ))}
          </g>
        );
      })}
      <g transform="translate(305 150)">
        <circle r={r} className="stroke-foreground/10" strokeWidth="12" />
        <circle r={r} stroke={ink} strokeWidth="12" strokeDasharray={`${c * 0.992} ${c}`} transform="rotate(-90)" />
        <text y="4" textAnchor="middle" className="fill-foreground font-display text-[22px] font-semibold">99.2%</text>
        <text y="24" textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">CSAT</text>
      </g>
    </Frame>
  );
}

const visuals: Record<CaseStudy["visual"], () => ReactNode> = { media: MediaVisual, aeo: AeoVisual, journey: JourneyVisual, ops: OpsVisual };

export function CaseVisual({ kind, className }: { kind: CaseStudy["visual"]; className?: string }) {
  const Visual = visuals[kind];
  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden bg-[radial-gradient(120%_90%_at_0%_0%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_60%),radial-gradient(90%_80%_at_100%_100%,color-mix(in_oklch,var(--cyan)_10%,transparent),transparent_60%)] bg-surface", className)}>
      <Visual />
      <span className="absolute left-3 top-3 rounded-full border border-border bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground backdrop-blur-sm">Illustrative</span>
    </div>
  );
}
