import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUpRight, Download, Plus } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Frame, photos } from "@/components/photos";
import { Spotlight } from "@/components/spotlight";
import { community, CV_PATH, education, EMAIL, journal, journey, leadership, LINKEDIN_URL, LOCATION, metrics, research, roles, skillGroups, type JournalEntry, type Metric, type Role } from "@/lib/content";
import { countUpOnView, observeReveals, prefersReducedMotion } from "@/lib/motion";
import { jsonLd, NAME, pageMeta, person, SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    ...pageMeta({
      title: "Gauri Tichkule — Marketing across digital, broadcast and B2B",
      description:
        "Gauri Tichkule brings a blended experience across digital and broadcast media: campaign operations at Mediamint, US national TV at IPG Mediabrands, B2B marketing at Navatech, and an MSc in Strategic Marketing from Cranfield University. Open to HR marketing, marketing consulting and B2B roles.",
      path: "/",
    }),
    scripts: [
      jsonLd({
        "@graph": [
          person,
          { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: NAME, publisher: { "@id": `${SITE_URL}/#person` } },
          { "@type": "ProfilePage", url: SITE_URL, name: `${NAME} — Portfolio`, mainEntity: { "@id": `${SITE_URL}/#person` } },
        ],
      }),
    ],
  }),
  component: Portfolio,
});

const NAV = [
  { id: "journey", label: "Journey" },
  { id: "experience", label: "Experience" },
  { id: "leadership", label: "Leadership" },
  { id: "research", label: "Research" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });

function Portfolio() {
  const rootRef = useRef<HTMLElement>(null);
  // Every .reveal on the page arrives once, as it scrolls into view.
  useEffect(() => (rootRef.current ? observeReveals(rootRef.current) : undefined), []);
  return (
    <>
      <a href="#journey" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400] focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">Skip to my journey</a>
      <Header />
      <main ref={rootRef}>
        <Hero />
        <Journey />
        <Experience />
        <Leadership />
        <Research />
        <FieldNotes />
        <About />
        <Contact />
      </main>
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared pieces

// A heading set line by line: each line rises out of its own mask, either on
// page load (`load`) or when the heading scrolls into view.
function Lines({ lines, load = false }: { lines: ReactNode[]; load?: boolean }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className={cn("mask-line", load && "load-line")} style={{ "--i": i } as CSSProperties}>
          <span>{line}</span>
        </span>
      ))}
    </>
  );
}

// Each section opens the same way: a numbered mono label, a rule that draws
// across like a lower-third, and a headline set in lines.
function SectionHead({ index, label, lines, intro, className }: { index: string; label: string; lines: ReactNode[]; intro?: ReactNode; className?: string }) {
  return (
    <header className={cn("reveal reveal-lines", className)}>
      <div className="flex items-center gap-4 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground">
        <span className="text-terracotta">{index}</span>
        <span>{label}</span>
      </div>
      <div className="rule mt-4 h-px bg-foreground/25" />
      <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
        <h2 className="text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.95] tracking-[-0.025em] lg:col-span-8">
          <Lines lines={lines} />
        </h2>
        {intro && <p className="max-w-md text-lg leading-relaxed text-muted-foreground lg:col-span-4 lg:pb-2">{intro}</p>}
      </div>
    </header>
  );
}

const shell = "mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12";
const mono = "font-mono text-[0.72rem] uppercase tracking-[0.14em]";

function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-2 rounded-full border border-foreground/20 px-3 py-1 text-[0.8rem]", className)}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Header

function Header() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Track the section in view, and tuck the header away while reading
  // downwards; any scroll back up brings it straight back.
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const check = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > 480 && y > last + 2);
      if (y < last - 2 || y < 480) setHidden(false);
      last = y;
      let current = "";
      for (const { id } of NAV) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // The phone menu: a full-screen panel. Escape closes it, focus moves in and
  // back out, and the page underneath stays still while it's open.
  useEffect(() => {
    if (!menuOpen) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    const timer = window.setTimeout(() => menuRef.current?.querySelector<HTMLElement>("a")?.focus(), 80);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", key);
    return () => {
      html.style.overflow = "";
      window.clearTimeout(timer);
      window.removeEventListener("keydown", key);
      toggleRef.current?.focus();
    };
  }, [menuOpen]);

  const jump = (id: string) => {
    setMenuOpen(false);
    window.setTimeout(() => go(id), menuOpen ? 60 : 0);
  };

  // The menu panel sits beside the header, not inside it: the header's
  // transform and backdrop blur would otherwise trap a "fixed" panel inside it.
  return (
    <>
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500", menuOpen ? "border-b border-transparent text-ivory" : scrolled ? "border-b border-[oklch(0.82_0.02_75)] bg-[oklch(0.958_0.012_80/0.92)] backdrop-blur-md" : "border-b border-transparent", hidden && !menuOpen ? "-translate-y-full" : "translate-y-0")}>
      <div className={cn(shell, "flex h-16 items-center justify-between sm:h-[4.5rem]")}>
        <a href="#top" onClick={(e) => { e.preventDefault(); jump("top"); }} className="group flex items-center gap-3" aria-label="Gauri Tichkule, back to the top">
          <span className="grid h-9 w-9 place-items-center bg-navy font-display text-[0.95rem] italic text-ivory ring-1 ring-ivory/20 transition-colors duration-300 group-hover:bg-terracotta">gt</span>
          <span className="font-display text-xl tracking-tight">Gauri Tichkule</span>
        </a>
        <nav className="hidden items-center gap-7 text-[0.92rem] lg:flex" aria-label="Main navigation">
          {NAV.map(({ id, label }) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); jump(id); }} className="sweep pb-1" aria-current={active === id ? "true" : undefined}>{label}</a>
          ))}
          <a href={CV_PATH} download className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-ivory transition-colors hover:bg-terracotta">
            CV <Download className="h-3.5 w-3.5" />
          </a>
        </nav>
        <button ref={toggleRef} onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-controls="menu" className={cn(mono, "relative z-10 flex h-11 items-center gap-3 lg:hidden", menuOpen && "text-ivory")}>
          {menuOpen ? "Close" : "Menu"}
          <span aria-hidden="true" className="relative block h-3 w-6">
            <span className={cn("absolute left-0 h-px w-6 bg-current transition-transform duration-300", menuOpen ? "top-1.5 rotate-45" : "top-0")} />
            <span className={cn("absolute left-0 h-px w-6 bg-current transition-transform duration-300", menuOpen ? "top-1.5 -rotate-45" : "top-3")} />
          </span>
        </button>
      </div>
    </header>
      <div
        ref={menuRef}
        id="menu"
        className={cn("on-navy fixed inset-0 z-40 flex flex-col justify-between px-5 pb-10 pt-24 transition-[clip-path] duration-700 ease-[cubic-bezier(.22,1,.36,1)] sm:px-8 lg:hidden", menuOpen ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none invisible [clip-path:inset(0_0_100%_0)]")}
      >
        <nav aria-label="Main navigation" className="grid gap-2">
          {NAV.map(({ id, label }, i) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); jump(id); }} className={cn("flex items-baseline gap-4 font-display text-[2.6rem] leading-tight transition-[opacity,transform] duration-500", menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")} style={{ transitionDelay: menuOpen ? `${0.15 + i * 0.05}s` : "0s" }}>
              <span className="font-mono text-xs text-terracotta">0{i + 1}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="grid gap-3 text-sm">
          <a href={CV_PATH} download className="inline-flex w-fit items-center gap-2 rounded-full bg-ivory px-5 py-3 text-navy">Download CV <Download className="h-4 w-4" /></a>
          <a href={`mailto:${EMAIL}`} className="text-muted-foreground">{EMAIL}</a>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Hero

const channels = [
  { n: "01", label: "Digital", line: "Campaign operations · Mediamint", years: "2021–24", target: "exp-mediamint" },
  { n: "02", label: "Broadcast", line: "US national TV · IPG Mediabrands", years: "2024–25", target: "exp-ipg" },
  { n: "03", label: "B2B", line: "Health & safety tech · Navatech", years: "2026", target: "exp-navatech" },
  { n: "04", label: "Research", line: "Trust & AI adoption · Cranfield", years: "2026", target: "research" },
];

function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative pt-24 sm:pt-28">
      <div className={shell}>
        <div className={cn(mono, "load-fade flex flex-wrap justify-between gap-2 text-muted-foreground")} style={{ "--d": ".05s" } as CSSProperties}>
          <span>Portfolio · 2026</span>
          <span>{LOCATION}</span>
        </div>
        <div className="load-fade mt-4 h-px bg-foreground/25" style={{ "--d": ".1s" } as CSSProperties} />

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <h1 id="hero-title" className="text-[clamp(2.7rem,7vw,7.4rem)] leading-[0.93] tracking-[-0.03em]">
              <span className="sr-only">Gauri Tichkule: </span>
              <Lines load lines={["From the", "campaign desk", <em key="a" className="text-terracotta">to the strategy</em>, <em key="b" className="text-terracotta">table.</em>]} />
            </h1>
            <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-10">
              <p className="load-fade text-lg leading-relaxed sm:text-xl" style={{ "--d": ".75s" } as CSSProperties}>
                I bring a blended experience across digital and broadcast media, combining campaign operations, client relationships and audience understanding with strategic marketing, to help businesses communicate more clearly and grow.
              </p>
              <div className="load-fade border-l border-foreground/20 pl-5" style={{ "--d": ".9s" } as CSSProperties}>
                <p className={cn(mono, "flex items-center gap-2 text-muted-foreground")}>
                  <span aria-hidden="true" className="on-air-dot h-2 w-2 rounded-full bg-terracotta" /> Open to
                </p>
                <ul className="mt-3 grid gap-1 font-display text-xl">
                  <li>HR marketing</li>
                  <li>Marketing consulting</li>
                  <li>B2B marketing</li>
                </ul>
              </div>
            </div>
            <div className="load-fade mt-10 flex flex-wrap gap-3" style={{ "--d": "1.05s" } as CSSProperties}>
              <button onClick={() => go("journey")} className="group inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-ivory transition-colors hover:bg-terracotta">
                Follow my journey <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              </button>
              <a href={CV_PATH} download className="group inline-flex items-center gap-3 rounded-full border border-foreground/30 px-6 py-3.5 transition-colors hover:border-foreground">
                Download CV <Download className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="lg:col-span-4">
            <Frame photo={photos.portrait} onLoad delay={0.4} offset eager caption="Gauri Tichkule · marketing, media & strategy" className="mx-auto max-w-[24rem] lg:ml-auto lg:mr-5" />
          </div>
        </div>

        {/* The channel index: where the experience comes from, one tap away. */}
        <nav aria-label="Experience at a glance" className="load-fade mt-20 grid border-t border-foreground/25 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4" style={{ "--d": "1.2s" } as CSSProperties}>
          {channels.map((c) => (
            <a key={c.n} href={`#${c.target}`} onClick={(e) => { e.preventDefault(); go(c.target); }} className="group relative flex flex-col gap-1 border-b border-foreground/15 py-6 pr-6 transition-colors hover:bg-card sm:px-5 lg:border-b-0 lg:border-r lg:last:border-r-0">
              <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-terracotta transition-transform duration-500 group-hover:scale-x-100" aria-hidden="true" />
              <span className={cn(mono, "flex justify-between text-muted-foreground")}>
                <span className="text-terracotta">{c.n}</span>
                <span>{c.years}</span>
              </span>
              <span className="mt-3 flex items-center justify-between font-display text-3xl">
                {c.label}
                <ArrowUpRight className="h-5 w-5 opacity-40 transition-[opacity,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
              <span className="text-sm text-muted-foreground">{c.line}</span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Journey: six chapters. On wide screens the year sits large and sticky on the
// left and changes as each chapter reaches the middle of the screen, while a
// rail fills beside the chapters as you read.

function Journey() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>("[data-step]"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset["step"]));
      }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    items.forEach((el) => io.observe(el));
    let frame = 0;
    const paint = () => {
      frame = 0;
      const r = list.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / r.height));
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const current = journey[active]!;
  return (
    <section id="journey" aria-labelledby="journey-title" className="scroll-mt-16 pt-28 sm:pt-36">
      <div className={shell}>
        <SectionHead index="01" label="My journey" lines={["From digital to broadcast,", <em key="e" className="text-terracotta">and into strategy.</em>]} intro="Six chapters, each adding a different way of understanding customers, clients and the businesses behind them." />
        <span id="journey-title" className="sr-only">My journey</span>

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28" aria-hidden="true">
              <p className={cn(mono, "text-muted-foreground")}>
                Chapter {active + 1} / {journey.length} · {current.stage}
              </p>
              <p key={current.year} className="year-swap mt-2 font-display text-[clamp(8rem,15vw,14rem)] leading-[0.85] tracking-[-0.04em] text-terracotta">{current.year}</p>
              <p key={`l${current.year}`} className="year-swap mt-6 max-w-xs font-display text-2xl italic leading-snug" style={{ animationDelay: ".08s" }}>{current.learned}</p>
            </div>
          </div>
          <ol ref={listRef} className="relative lg:col-span-7">
            <div aria-hidden="true" className="absolute bottom-0 left-[5px] top-0 w-px bg-foreground/15" />
            <div ref={fillRef} aria-hidden="true" className="absolute bottom-0 left-[5px] top-0 w-px origin-top bg-terracotta" style={{ transform: "scaleY(0)" }} />
            {journey.map((step, i) => (
              <li key={step.year} data-step={i} className={cn("reveal relative pb-16 pl-10 transition-opacity duration-500 last:pb-0 sm:pl-14", i === active ? "opacity-100" : "lg:opacity-40")}>
                <span aria-hidden="true" className={cn("absolute left-0 top-2 h-[11px] w-[11px] rounded-full border border-terracotta transition-colors duration-500", i <= active ? "bg-terracotta" : "bg-ivory")} />
                <p className="font-display text-6xl leading-none text-terracotta lg:hidden">{step.year}</p>
                <p className={cn(mono, "mt-3 text-muted-foreground lg:mt-0")}>
                  <span className="hidden lg:inline">{step.year} · </span>{step.stage}
                </p>
                <h3 className="mt-3 text-[clamp(1.9rem,3vw,2.6rem)] leading-[1.05] tracking-[-0.015em]">{step.title}</h3>
                <p className="mt-2 text-sm font-medium">{step.org}</p>
                <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">{step.body}</p>
                <p className="mt-5 inline-flex items-center gap-3 text-sm">
                  <span className={cn(mono, "text-terracotta")}>Added</span>
                  <span className="h-px w-6 bg-foreground/30" aria-hidden="true" />
                  {step.learned}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Experience

function Stat({ metric }: { metric: Metric }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => (ref.current ? countUpOnView(ref.current, metric.value, metric.decimals) : undefined), [metric]);
  const final = `${metric.value.toFixed(metric.decimals ?? 0)}${metric.suffix}`;
  return (
    <p className="font-display text-[clamp(2.4rem,3.6vw,3.4rem)] leading-none tracking-[-0.03em]">
      <span className="sr-only">{final}</span>
      <span aria-hidden="true" className="tabular-nums">
        <span ref={ref}>{metric.value.toFixed(metric.decimals ?? 0)}</span>
        <span className="text-terracotta">{metric.suffix}</span>
      </span>
    </p>
  );
}

function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="scroll-mt-16 pt-28 sm:pt-40">
      <div className={shell}>
        <SectionHead index="02" label="Professional experience" lines={["Experience across", <em key="e" className="text-terracotta">every channel.</em>]} intro="Four-plus years of professional work: digital campaign operations, US broadcast media and B2B marketing." />
        <span id="experience-heading" className="sr-only">Professional experience</span>

        <div className="reveal mt-16">
          <p className={cn(mono, "text-muted-foreground")}>By the numbers</p>
          <ul className="mt-4 grid grid-cols-2 border-t border-foreground/25 md:grid-cols-3 xl:grid-cols-6">
            {metrics.map((m, i) => (
              <li key={m.label} className="reveal border-b border-foreground/15 py-6 pr-4 md:pr-6 xl:border-b-0 xl:border-r xl:px-5 xl:first:pl-0 xl:last:border-r-0" style={{ "--delay": `${i * 0.06}s` } as CSSProperties}>
                <Stat metric={m} />
                <p className="mt-3 text-sm leading-snug">{m.label}</p>
                <p className="mt-2 text-xs leading-snug text-muted-foreground">{m.context}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-20">
          {roles.map((role) => (
            <RoleEntry key={role.id} role={role} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RoleEntry({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const panelId = `role-${role.id}`;
  return (
    <article id={`exp-${role.id}`} className="reveal grid scroll-mt-24 gap-8 border-t border-foreground/25 py-12 lg:grid-cols-12 lg:gap-10 lg:py-16">
      <div className="lg:col-span-4">
        <p className={cn(mono, "text-muted-foreground")}>{role.dates}</p>
        <h3 className="mt-3 text-[clamp(2.2rem,3.6vw,3.2rem)] leading-none tracking-[-0.02em]">{role.company}</h3>
        <p className="mt-3 font-medium">{role.title}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag><span className="h-1.5 w-1.5 rounded-full bg-terracotta" aria-hidden="true" />{role.channel}</Tag>
          <Tag>{role.place}</Tag>
        </div>
      </div>
      <div className="lg:col-span-8">
        <p className="max-w-2xl text-xl leading-relaxed">{role.summary}</p>
        <ul className="mt-8 flex flex-wrap gap-x-12 gap-y-6">
          {role.highlights.map((h) => (
            <li key={h.label}>
              <p className="font-display text-4xl leading-none text-terracotta">{h.value}</p>
              <p className="mt-2 max-w-[11rem] text-sm text-muted-foreground">{h.label}</p>
            </li>
          ))}
        </ul>
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={panelId} className="group mt-10 flex w-full items-center justify-between border-y border-foreground/15 py-4 text-left">
          <span className={mono}>{open ? "Hide" : "Show"} all responsibilities · {role.points.length}</span>
          <Plus className={cn("h-5 w-5 transition-transform duration-500", open && "rotate-45")} />
        </button>
        <div id={panelId} className="collapse" data-open={open}>
          <div>
            <ul className="grid gap-4 pt-6">
              {role.points.map((p, i) => (
                <li key={p} className="grid grid-cols-[2rem_1fr] leading-relaxed">
                  <span className="font-mono text-xs text-terracotta">{String(i + 1).padStart(2, "0")}</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Leadership: kept apart from employment, so campus roles never read as jobs.

function Leadership() {
  return (
    <section id="leadership" aria-labelledby="leadership-heading" className="scroll-mt-16 pb-28 pt-28 sm:pb-40 sm:pt-36">
      <div className={shell}>
        <SectionHead index="03" label="Leadership & campus engagement" lines={["Leadership,", <em key="e" className="text-terracotta">beyond the desk.</em>]} intro="Roles alongside the MSc that were about communication, events and getting people into the room." />
        <span id="leadership-heading" className="sr-only">Leadership and campus engagement</span>
        <ul className="mt-16 grid gap-px bg-foreground/15 md:grid-cols-3">
          {leadership.map((role, i) => (
            <li key={role.title} className="reveal group flex flex-col bg-ivory p-7 transition-colors duration-500 hover:bg-card sm:p-8" style={{ "--delay": `${i * 0.1}s` } as CSSProperties}>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-terracotta">0{i + 1}</span>
                <span className={cn(mono, "text-muted-foreground")}>{role.org.split(" · ")[0]}</span>
              </div>
              <p className="mt-10 font-display text-6xl leading-none tracking-[-0.03em] transition-colors duration-500 group-hover:text-terracotta">{role.stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{role.stat.label}</p>
              <h3 className="mt-8 text-2xl leading-tight">{role.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{role.org}</p>
              <p className="mt-4 leading-relaxed">{role.detail}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                {role.skills.map((s) => <Tag key={s}>{s}</Tag>)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Research: the thesis, on navy.

function Research() {
  const cells = [
    { label: "Question", text: research.question },
    { label: "Method", text: research.method },
    { label: "Finding", text: research.finding, key: true },
    { label: "Application", text: research.application },
  ];
  return (
    <section id="research" aria-labelledby="research-heading" className="on-navy scroll-mt-16 py-28 sm:py-36">
      <div className={shell}>
        <SectionHead index="04" label="Featured research · MSc thesis" lines={["Trust, AI and", <em key="e" className="text-terracotta">the people who use it.</em>]} />
        <span id="research-heading" className="sr-only">Research</span>
        <div className="mt-16 grid gap-14 lg:grid-cols-12">
          <div className="reveal lg:col-span-7">
            <p className={cn(mono, "text-muted-foreground")}>{research.school}</p>
            <h3 className="mt-4 text-[clamp(1.8rem,2.8vw,2.6rem)] leading-tight tracking-[-0.015em]">{research.title}</h3>
            <p className="mt-4 font-display text-xl italic text-terracotta">{research.focus}</p>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed">{research.summary}</p>
          </div>
          <div className="reveal flex flex-col justify-between gap-8 border-t border-foreground/20 pt-8 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0" style={{ "--delay": ".15s" } as CSSProperties}>
            <div>
              <p className="font-display text-[clamp(7rem,13vw,11rem)] leading-[0.8] tracking-[-0.05em] text-terracotta">43</p>
              <p className="mt-3 text-lg">people surveyed</p>
            </div>
            <div>
              <p className={cn(mono, "text-muted-foreground")}>Why it matters</p>
              <p className="mt-3 leading-relaxed">{research.why}</p>
            </div>
          </div>
        </div>
        <ol className="mt-16 grid gap-px bg-foreground/15 sm:grid-cols-2 lg:grid-cols-4">
          {cells.map((c, i) => (
            <li key={c.label} className={cn("reveal p-6 sm:p-7", c.key ? "bg-card" : "bg-navy")} style={{ "--delay": `${i * 0.08}s` } as CSSProperties}>
              <p className={cn(mono, "flex justify-between text-muted-foreground")}>
                <span>{c.label}</span>
                <span className="text-terracotta">0{i + 1}</span>
              </p>
              <p className={cn("mt-6 leading-relaxed", c.key && "font-display text-xl leading-snug")}>{c.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Field notes from the MSc: two moments, written up in Gauri's words.

function FieldNotes() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="notes" aria-labelledby="notes-heading" className="scroll-mt-16 pt-28 sm:pt-36">
      <div className={shell}>
        <SectionHead index="05" label="Field notes" lines={["Notes from", <em key="e" className="text-terracotta">the MSc.</em>]} intro="Two moments at Cranfield that changed how I think about brands and the responsibility of marketing." />
        <span id="notes-heading" className="sr-only">Field notes</span>
        <div className="mt-16 grid gap-16 md:grid-cols-2 md:gap-10">
          {journal.map((entry, i) => (
            <article key={entry.id} className="reveal group" style={{ "--delay": `${i * 0.12}s` } as CSSProperties}>
              <button onClick={() => setOpen(i)} tabIndex={-1} aria-hidden="true" className="block w-full overflow-hidden">
                <Frame photo={photos[entry.photo]} aspect="aspect-[4/3]" delay={i * 0.12} className="transition-transform duration-700 group-hover:scale-[1.015]" />
              </button>
              <p className={cn(mono, "mt-6 text-muted-foreground")}>{entry.kicker} · {entry.date}</p>
              <h3 className="mt-3 text-[clamp(1.8rem,2.6vw,2.4rem)] leading-tight tracking-[-0.015em]">{entry.title}</h3>
              <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">{entry.excerpt}</p>
              {entry.badge && <Tag className="mt-5 border-terracotta text-terracotta">{entry.badge.value} · {entry.badge.label}</Tag>}
              <button onClick={() => setOpen(i)} className="sweep mt-6 flex items-center gap-2 pb-1 text-sm font-medium" aria-label={`Read the note: ${entry.title}`}>
                Read the note <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </article>
          ))}
        </div>
      </div>
      {open !== null && <NoteSpotlight entry={journal[open]!} onClose={() => setOpen(null)} onMove={(d) => setOpen((open + d + journal.length) % journal.length)} />}
    </section>
  );
}

function NoteSpotlight({ entry, onClose, onMove }: { entry: JournalEntry; onClose: () => void; onMove: (d: number) => void }) {
  return (
    <Spotlight label={`Field note: ${entry.title}`} onClose={onClose} onMove={onMove}>
      <div key={entry.id} className="grid items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className={cn(mono, "text-muted-foreground")}>{entry.kicker} · {entry.date}</p>
          <h2 className="mt-4 text-[clamp(2.4rem,4.6vw,4.2rem)] leading-[1] tracking-[-0.02em]">{entry.title}</h2>
          {entry.quote && (
            <blockquote className="mt-10 border-l-2 border-terracotta pl-6">
              <p className="font-display text-2xl italic leading-snug">“{entry.quote.text}”</p>
              <footer className={cn(mono, "mt-3 text-muted-foreground")}>{entry.quote.by}</footer>
            </blockquote>
          )}
          <div className="mt-10 grid gap-5 text-lg leading-relaxed">
            {entry.body.map((p) => <p key={p}>{p}</p>)}
          </div>
          <p className={cn(mono, "mt-10 text-muted-foreground")}>{entry.listTitle}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {entry.list.map((item) => <Tag key={item}>{item}</Tag>)}
          </ul>
          <p className="mt-10 border-t border-foreground/20 pt-6 font-display text-2xl italic leading-snug">{entry.closing}</p>
        </div>
        <div className="lg:sticky lg:top-24 lg:col-span-5">
          <Frame photo={photos[entry.photo]} aspect="aspect-[4/3]" onLoad delay={0.1} caption={entry.caption.replace(/[✦✿]/g, "").trim()} />
          {entry.badge && <Tag className="mt-5 border-terracotta text-terracotta">{entry.badge.value} · {entry.badge.label}</Tag>}
          {entry.stats && (
            <>
              <ul className="mt-8 grid gap-px bg-foreground/15 sm:grid-cols-3">
                {entry.stats.map((st) => (
                  <li key={st.label} className="bg-background p-4">
                    <p className="font-display text-3xl text-terracotta">{st.value}</p>
                    <p className="mt-1 text-sm leading-snug text-muted-foreground">{st.label}</p>
                  </li>
                ))}
              </ul>
              {entry.statsNote && <p className="mt-3 text-xs text-muted-foreground">{entry.statsNote}</p>}
            </>
          )}
        </div>
      </div>
    </Spotlight>
  );
}

// ---------------------------------------------------------------------------
// About: who Gauri is, where she's heading, and the foundations.

function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="scroll-mt-16 pb-28 pt-28 sm:pb-40 sm:pt-40">
      <div className={shell}>
        <SectionHead index="06" label="About" lines={["How people", <em key="e" className="text-terracotta">and businesses decide.</em>]} />
        <span id="about-heading" className="sr-only">About</span>
        <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Frame photo={photos.city} offset caption="Above the City of London" className="mx-auto max-w-[26rem] lg:sticky lg:top-28 lg:mx-0" />
          </div>
          <div className="lg:col-span-7">
            <div className="reveal max-w-2xl">
              <p className="text-xl leading-relaxed sm:text-2xl">
                I'm a marketing and media professional who has worked on both sides of the campaign: running digital campaigns for advertisers, and buying national TV for global brands.
              </p>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Working with clients and partners across 10+ countries taught me to adapt how I communicate to the person in front of me. My MSc in Strategic Marketing at Cranfield then added brand management, CRM and research-led strategy, and a thesis on how trust shapes the adoption of new technology.
              </p>
              <p className="mt-6 text-lg leading-relaxed">
                I'm now looking at <strong className="font-medium">HR marketing</strong>, <strong className="font-medium">marketing consulting</strong> and <strong className="font-medium">B2B marketing</strong> roles: work where understanding an audience, communicating with stakeholders and building strategy from evidence all meet.
              </p>
            </div>

            <AboutBlock title="Education">
              <ul className="grid gap-8">
                {education.map((ed) => (
                  <li key={ed.title} className="reveal grid gap-2 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <p className={cn(mono, "pt-1.5 text-muted-foreground")}>{ed.dates}</p>
                    <div>
                      <h4 className="font-display text-2xl leading-tight">{ed.title}</h4>
                      <p className="text-muted-foreground">{ed.school}</p>
                      {ed.notes.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {ed.notes.map((n) => <Tag key={n}>{n}</Tag>)}
                        </div>
                      )}
                      {ed.projects.length > 0 && (
                        <ul className="mt-4 grid gap-1.5 text-sm text-muted-foreground">
                          {ed.projects.map((p) => (
                            <li key={p} className="grid grid-cols-[1rem_1fr]"><span aria-hidden="true" className="text-terracotta">—</span>{p}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </AboutBlock>

            <AboutBlock title="Skills & tools">
              <div className="grid gap-8 sm:grid-cols-3">
                {skillGroups.map((g) => (
                  <div key={g.title} className="reveal">
                    <h4 className="font-display text-xl">{g.title}</h4>
                    <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
                      {g.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </AboutBlock>

            <AboutBlock title="Beyond work">
              <ul className="grid gap-6 sm:grid-cols-3">
                {community.map((c) => (
                  <li key={c.title} className="reveal">
                    <h4 className="font-display text-xl">{c.title}</h4>
                    <p className="mt-1 text-sm font-medium">{c.org}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.detail}</p>
                  </li>
                ))}
              </ul>
            </AboutBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="reveal mt-16">
      <div className="flex items-center gap-4">
        <h3 className={cn(mono, "font-normal text-muted-foreground [font-family:var(--font-mono)]")}>{title}</h3>
        <div className="rule h-px flex-1 bg-foreground/20" />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contact

function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="on-navy scroll-mt-16 pt-28 sm:pt-36">
      <div className={shell}>
        <div className="reveal reveal-lines">
          <p className={cn(mono, "flex items-center gap-4 text-muted-foreground")}><span className="text-terracotta">07</span> Contact</p>
          <div className="rule mt-4 h-px bg-foreground/25" />
          <h2 id="contact-heading" className="mt-12 text-[clamp(3.4rem,11vw,11rem)] leading-[0.88] tracking-[-0.04em]">
            <Lines lines={["Let's talk", <em key="e" className="text-terracotta">strategy.</em>]} />
          </h2>
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="reveal lg:col-span-7">
            <p className="max-w-xl text-xl leading-relaxed">Open to conversations about HR marketing, marketing consulting and B2B marketing roles.</p>
            <a href={`mailto:${EMAIL}`} className="group mt-8 inline-flex max-w-full items-center gap-4 font-display text-[clamp(1.6rem,3.6vw,3rem)] leading-tight">
              <span className="sweep truncate pb-1">{EMAIL}</span>
              <ArrowUpRight className="h-7 w-7 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
          </div>
          <ul className="reveal grid content-start gap-px bg-foreground/15 lg:col-span-5" style={{ "--delay": ".1s" } as CSSProperties}>
            {LINKEDIN_URL && (
              <li className="bg-navy">
                <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="group flex items-center justify-between py-5 pr-2 transition-colors hover:text-terracotta">
                  <span className="text-lg">LinkedIn <span className="text-sm text-muted-foreground">(opens in a new tab)</span></span>
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
            )}
            <li className="bg-navy">
              <a href={CV_PATH} download className="group flex items-center justify-between py-5 pr-2 transition-colors hover:text-terracotta">
                <span className="text-lg">Download CV <span className="text-sm text-muted-foreground">(PDF)</span></span>
                <Download className="h-5 w-5" />
              </a>
            </li>
            <li className="bg-navy">
              <p className="flex items-center justify-between py-5 pr-2 text-lg">
                Based in <span className="text-muted-foreground">{LOCATION}</span>
              </p>
            </li>
          </ul>
        </div>
        <footer className="mt-28 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/20 py-8 text-sm text-muted-foreground">
          <p>© 2026 {NAME}</p>
          <button onClick={() => go("top")} className="sweep pb-0.5">Back to the top ↑</button>
        </footer>
      </div>
    </section>
  );
}
