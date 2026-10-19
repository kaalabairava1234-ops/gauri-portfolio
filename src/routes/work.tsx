import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Download } from "lucide-react";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { photos, Polaroid, Sparkle } from "@/components/photos";
import { ArrivalFade, ClimbBackButton } from "@/components/rabbit-hole";
import { CV_PATH, education, EMAIL, leadership, LINKEDIN_URL, roles, skillGroups } from "@/lib/content";
import { observeReveals } from "@/lib/motion";
import { jsonLd, NAME, pageMeta, SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/work")({
  head: () => ({
    ...pageMeta({
      title: `The full record — ${NAME}`,
      description:
        "Gauri Tichkule's full record: experience at Navatech, IPG Mediabrands and Mediamint, an MSc in Strategic Marketing from Cranfield University, skills and tools, leadership and community.",
      path: "/work",
    }),
    scripts: [
      jsonLd({
        "@type": "ProfilePage",
        url: `${SITE_URL}/work`,
        name: `The full record — ${NAME}`,
        mainEntity: { "@id": `${SITE_URL}/#person` },
      }),
    ],
  }),
  component: RecordPage,
});

const chapters = [
  { id: "experience", label: "experience" },
  { id: "education", label: "education" },
  { id: "skills", label: "skills & tools" },
  { id: "leadership", label: "leadership" },
];

// A fixed scatter of stars, so the sky looks the same on server and client.
// (A proper hash, so the stars scatter instead of lining up in little rows.)
const hash = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
// Rounded, so the server and the browser write exactly the same styles.
const round = (n: number) => Math.round(n * 100) / 100;
const stars = Array.from({ length: 28 }, (_, i) => ({
  x: round(hash(i * 4 + 1) * 100),
  y: round(hash(i * 4 + 2) * 100),
  s: round(1 + hash(i * 4 + 3) * 1.6),
  d: round(hash(i * 4 + 4) * 4),
}));

function Sky() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((st, i) => (
        <span key={i} className="animate-twinkle-rare absolute rounded-full bg-foreground" style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, animationDelay: `${st.d * 2}s`, animationDuration: `${6 + st.d * 1.5}s` }} />
      ))}
    </div>
  );
}

function Chapter({ id, number, title, children }: { id: string; number: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative mx-auto grid max-w-[1300px] scroll-mt-24 gap-10 border-t border-border px-5 py-20 sm:px-8 lg:grid-cols-[minmax(220px,0.5fr)_minmax(0,1.5fr)] lg:py-28">
      <div className="reveal h-fit lg:sticky lg:top-28">
        <p className="font-mono text-xs text-primary">{number}</p>
        <h2 id={`${id}-title`} className="mt-2 font-display text-4xl font-medium sm:text-5xl">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

function RecordPage() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // the page around the record is the deeper navy too
    const body = document.body.style.background;
    document.body.style.background = "var(--background-deep)";
    const stop = mainRef.current ? observeReveals(mainRef.current) : () => {};
    return () => {
      stop();
      document.body.style.background = body;
    };
  }, []);

  return (
    <main ref={mainRef} className="deep-page relative min-h-screen overflow-hidden">
      <ArrivalFade />
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-border/60 bg-[color-mix(in_oklch,var(--background-deep)_80%,transparent)] px-5 py-4 backdrop-blur-md sm:px-8 sm:py-5">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight">Gauri<span className="text-primary">.</span></Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
          <Link to="/" className="story-link transition-colors hover:text-foreground">story</Link>
          <Link to="/" hash="work" className="story-link transition-colors hover:text-foreground">work</Link>
          <span className="story-link text-foreground" data-active="true" aria-current="page">full record</span>
          <a href={`mailto:${EMAIL}`} className="story-link transition-colors hover:text-foreground">let's talk</a>
          <a href={CV_PATH} download className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-foreground transition-colors hover:border-primary hover:text-primary">
            CV <Download className="h-3.5 w-3.5" />
          </a>
        </nav>
        <ClimbBackButton className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:hidden">back to the story ↑</ClimbBackButton>
      </header>

      {/* arrival — the far end of the thread */}
      <section className="relative grid min-h-[100svh] items-center px-5 pb-16 pt-28 sm:px-8">
        <Sky />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="ambient-a absolute -left-[10vw] top-[5vh] h-[60vh] w-[55vw] rounded-full bg-primary/[0.12] blur-[120px]" />
          <div className="ambient-b absolute -bottom-[10vh] right-0 h-[50vh] w-[45vw] rounded-full bg-cyan/[0.07] blur-[120px]" />
        </div>
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <defs>
            <linearGradient id="record-ink" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" style={{ stopColor: "var(--primary)" }} />
              <stop offset="1" style={{ stopColor: "var(--cyan)" }} />
            </linearGradient>
          </defs>
          <path className="animate-draw-string" pathLength="1" strokeDasharray="1" d="M-20 300 C120 200 180 420 260 470 C340 520 300 640 420 680 C560 730 700 620 780 700 C860 780 900 860 1020 820" fill="none" stroke="url(#record-ink)" strokeOpacity=".7" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* the person behind the record, pinned to the corner of the page */}
        <div className="animate-reveal pointer-events-none absolute right-[7vw] top-[22vh] hidden w-[clamp(12rem,17vw,17rem)] [animation-delay:.5s] md:block">
          <div className="pointer-events-auto relative">
            <Polaroid photo={photos.portrait} caption={<>hi, it's gauri <span className="text-[#7b66f0]">♡</span></>} rotate={6} eager />
            <Sparkle className="-left-8 top-10 h-5 w-5 text-cyan" />
            <Sparkle className="-bottom-4 -right-5 h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[1300px]">
          <p className="animate-reveal font-mono text-xs uppercase tracking-[0.2em] text-primary">{NAME} / the full record</p>
          <h1 className="animate-reveal mt-4 font-display text-[clamp(3.2rem,8vw,8rem)] font-semibold leading-[0.92] tracking-[-0.045em] [animation-delay:.1s]">
            the full<br /><em className="text-gradient pr-3">record.</em>
          </h1>
          <p className="animate-reveal mt-6 font-hand text-[clamp(1.6rem,2.4vw,2.2rem)] text-foreground/75 [animation-delay:.25s]">every role, every number. in one place.</p>
          <nav aria-label="Chapters" className="animate-reveal mt-10 flex flex-wrap gap-2 [animation-delay:.4s]">
            {chapters.map((c) => (
              <a key={c.id} href={`#${c.id}`} className="rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">{c.label}</a>
            ))}
            <a href={CV_PATH} download className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">
              download CV <Download className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>
      </section>

      <Chapter id="experience" number="01" title="experience.">
        <ol className="relative grid gap-6 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-px before:bg-gradient-to-b before:from-primary before:via-cyan/50 before:to-transparent">
          {roles.map((role, index) => (
            <li key={role.id} className="reveal relative pl-10" style={{ "--reveal-delay": `${index * 0.08}s` } as CSSProperties}>
              <span aria-hidden="true" className="absolute left-0 top-8 h-[15px] w-[15px] rounded-full border-2 border-primary bg-background-deep shadow-[0_0_14px_var(--primary)]" />
              <article className="lift-card rounded-xl border border-border bg-surface/50 p-6 sm:p-8">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">{role.dates} · {role.place}</p>
                <h3 className="mt-3 font-display text-3xl font-medium">{role.company}</h3>
                <p className="mt-1 text-primary">{role.title}</p>
                <ul className="mt-6 grid gap-3 border-t border-border pt-6">
                  {role.points.map((point) => (
                    <li key={point} className="grid grid-cols-[auto_1fr] gap-4 leading-relaxed text-muted-foreground">
                      <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 rounded-full bg-cyan" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </Chapter>

      <Chapter id="education" number="02" title="education.">
        <div className="grid gap-4 md:grid-cols-3">
          {education.map((item, index) => (
            <article key={item.title} className={cn("reveal lift-card flex flex-col rounded-xl border border-border bg-surface/50 p-6", index === 0 && "md:col-span-3 md:p-8")} style={{ "--reveal-delay": `${index * 0.08}s` } as CSSProperties}>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.dates}</p>
              <h3 className={cn("mt-3 font-display font-medium", index === 0 ? "text-3xl sm:text-4xl" : "text-2xl")}>{item.title}</h3>
              <p className="mt-1 text-primary">{item.school}</p>
              {item.notes.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {item.notes.map((note) => (
                    <li key={note} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">{note}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </Chapter>

      <Chapter id="skills" number="03" title="skills & tools.">
        <div className="grid gap-4 md:grid-cols-3">
          {skillGroups.map((group, index) => (
            <article key={group.title} className="reveal lift-card rounded-xl border border-border bg-surface/50 p-6" style={{ "--reveal-delay": `${index * 0.08}s` } as CSSProperties}>
              <h3 className="font-display text-xl font-medium">{group.title}</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item} className="rounded-full border border-border bg-background-deep/40 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground">{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Chapter>

      <Chapter id="leadership" number="04" title="leadership & community.">
        <ul className="grid gap-4 sm:grid-cols-2">
          {leadership.map((item, index) => (
            <li key={item.title + item.org} className="reveal lift-card rounded-xl border border-border bg-surface/50 p-6" style={{ "--reveal-delay": `${(index % 2) * 0.08}s` } as CSSProperties}>
              <h3 className="font-display text-xl font-medium">{item.title}</h3>
              <p className="mt-1 text-sm text-primary">{item.org}</p>
              <p className="mt-4 leading-relaxed text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ul>
      </Chapter>

      <footer className="relative mx-auto flex max-w-[1300px] flex-wrap items-center justify-between gap-6 border-t border-border px-5 py-12 sm:px-8">
        <div>
          <p className="font-display text-3xl font-medium">that's the record. <span className="text-muted-foreground">let's talk?</span></p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href={`mailto:${EMAIL}`} className="story-link inline-flex items-center gap-1.5 text-primary">{EMAIL} <ArrowUpRight className="h-3.5 w-3.5" /></a>
            {LINKEDIN_URL && <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="story-link inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">linkedin <ArrowUpRight className="h-3.5 w-3.5" /></a>}
          </div>
        </div>
        <ClimbBackButton className="rounded-full border border-foreground/50 px-6 py-3 text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground">back to the story ↑</ClimbBackButton>
      </footer>
    </main>
  );
}
