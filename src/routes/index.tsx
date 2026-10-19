import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { CaseVisual } from "@/components/case-visuals";
import { marks, type MarkName } from "@/components/marks";
import { photos, Polaroid, PortraitArch, Sparkle } from "@/components/photos";
import { CLIMBED_OUT, RabbitHoleButton, takeFlag } from "@/components/rabbit-hole";
import { Spotlight } from "@/components/spotlight";
import { Button } from "@/components/ui/button";
import { caseStudies, CV_PATH, EMAIL, journal, LINKEDIN_URL, metrics, roles, skillGroups, type CaseStudy, type JournalEntry, type Metric } from "@/lib/content";
import { countUpOnView, observeReveals, prefersReducedMotion } from "@/lib/motion";
import { jsonLd, NAME, pageMeta, person, SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    ...pageMeta({
      title: "Gauri Tichkule — Marketing Strategy. Media Intelligence. Measurable Growth.",
      description:
        "Gauri Tichkule is a Milton Keynes-based marketing professional: US national TV planning and buying at IPG Mediabrands, AdRoll campaign operations at Mediamint, B2B marketing, CRM and AEO at Navatech, and an MSc in Strategic Marketing from Cranfield University.",
      path: "/",
    }),
    scripts: [
      jsonLd({
        "@graph": [
          person,
          { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: NAME, publisher: { "@id": `${SITE_URL}/#person` } },
          { "@type": "ProfilePage", url: SITE_URL, name: `${NAME} — Marketing Strategy. Media Intelligence. Measurable Growth.`, mainEntity: { "@id": `${SITE_URL}/#person` } },
        ],
      }),
    ],
  }),
  component: Portfolio,
});

// The cursor's comment bubble stays quiet until something has a reason to
// speak: a moment in the story, or hovering something that has a comment.
type CursorComment = { id: string; text: string; fade: boolean };
// Only one bubble speaks at a time: "figure-open" tells every other bubble
// (objects, the cursor/phone comment) to go quiet.
const quietOthers = (id: number) => window.dispatchEvent(new CustomEvent<number>("figure-open", { detail: id }));
const say = (id: string, text: string, fade = true) => {
  quietOthers(-1);
  window.dispatchEvent(new CustomEvent<CursorComment>("cursor-comment", { detail: { id, text, fade } }));
};

// The sections the header points at, in page order.
const SECTIONS = [
  { id: "brain", label: "story" },
  { id: "impact", label: "impact" },
  { id: "work", label: "work" },
  { id: "journal", label: "journal" },
  { id: "hi", label: "let's talk" },
] as const;

// The story canvas is CANVAS_VW wide and slides CANVAS_TRAVEL_VW across the
// scroll. Everything on it is placed in vw/vh, and the SVG uses a viewBox of
// (CANVAS_VW * 10) x 1000, so one vw is 10 units and one vh is 10 units.
const CANVAS_VW = 570;
const CANVAS_TRAVEL_VW = 470;

// Place something on the canvas by its vw/vh coordinates.
const at = (x: number, y: number) => ({ left: `${x}vw`, top: `${y}vh` });

// A waypoint for the thread, in vw/vh. `loop` ties a little loop-de-loop at
// that point (radius in vh; negative loops downward).
type Waypoint = [x: number, y: number, loop?: number];

// Horizontal units are ~1.8x wider on screen than vertical ones, so loops are
// narrowed to stay round rather than squashed.
const LOOP_ASPECT = 1.8;

// Where the thread finally ends: at the "see the work" button.
const BUTTON_X = 537;
const BUTTON_Y = 59;

// The big loop the habit is tied around, near the end of the story.
const LOOP_X = 474;
const LOOP_Y = 70;
const LOOP_R = 17;

// The thread is a Catmull-Rom curve through the waypoints (plus the extra
// points each loop adds), written out as cubic Béziers in viewBox units.
type Segment = [x0: number, y0: number, c1x: number, c1y: number, c2x: number, c2y: number, x1: number, y1: number];

// `scale` maps waypoint units to path units (vw/vh → viewBox is 10; pixels
// are 1), and `aspect` squeezes loops to stay round on a stretched canvas.
function threadSegments(waypoints: Waypoint[], scale = 10, aspect = LOOP_ASPECT): Segment[] {
  const pts: [number, number][] = [];
  for (const [wx, wy, loop] of waypoints) {
    const x = wx * scale;
    const y = wy * scale;
    pts.push([x, y]);
    if (loop) {
      const r = loop * scale;
      const rx = Math.abs(r) / aspect;
      pts.push([x + rx, y - r], [x, y - 2 * r], [x - rx, y - r], [x + rx * 0.5, y + r * 0.15]);
    }
  }
  const segments: Segment[] = [];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    segments.push([p1[0], p1[1], p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]]);
  }
  return segments;
}

function threadPath(waypoints: Waypoint[]) {
  return segmentsPath(threadSegments(waypoints));
}

function segmentsPath(segments: Segment[]) {
  const f = (n: number) => n.toFixed(1);
  let d = `M${segments[0]?.[0] ?? 0} ${segments[0]?.[1] ?? 0}`;
  for (const [, , c1x, c1y, c2x, c2y, x1, y1] of segments) d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(x1)} ${f(y1)}`;
  return d;
}

// Points along the thread, evaluated straight from the Bézier maths, with the
// running arc length at each one. This replaces thousands of browser
// getPointAtLength calls, which froze the page for seconds on load.
type ThreadSamples = { xs: Float32Array; ys: Float32Array; lengths: Float32Array; total: number };

function sampleSegments(segments: Segment[], perSegment = 48): ThreadSamples {
  const n = segments.length * perSegment + 1;
  const xs = new Float32Array(n);
  const ys = new Float32Array(n);
  const lengths = new Float32Array(n);
  let k = 0;
  let total = 0;
  segments.forEach(([x0, y0, c1x, c1y, c2x, c2y, x1, y1], index) => {
    for (let step = index === 0 ? 0 : 1; step <= perSegment; step += 1) {
      const t = step / perSegment;
      const u = 1 - t;
      const x = u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x1;
      const y = u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y1;
      if (k > 0) total += Math.hypot(x - xs[k - 1]!, y - ys[k - 1]!);
      xs[k] = x;
      ys[k] = y;
      lengths[k] = total;
      k += 1;
    }
  });
  return { xs, ys, lengths, total };
}

// The tangle is drawn a little smaller than the canvas units it was written
// in, so it sits clear of the hero's words: scaled by TANGLE_SCALE about
// (TANGLE_CX, TANGLE_CY), in viewBox units.
const TANGLE_SCALE = 0.84;
const TANGLE_CX = 520;
const TANGLE_CY = 370;
// The tangle's loose end (569, 199), after that scaling, in vw/vh.
const TANGLE_END: Waypoint = [(TANGLE_CX + (569 - TANGLE_CX) * TANGLE_SCALE) / 10, (TANGLE_CY + (199 - TANGLE_CY) * TANGLE_SCALE) / 10];

// The thread leaves the tangle, runs low through the channels beneath the
// about note, rises through the toolkits, runs straight along the timeline,
// ties the optimisation loop and simply stops at the work.
const THREAD_WAYPOINTS: Waypoint[] = [
  TANGLE_END, [80, 60], [96, 62], [106, 76, 7], [118, 86], [130, 84], [141, 80, -5],
  [150, 70], [157, 52], [164, 31], [171, 33], [174.5, 35.6], [181, 42], [186, 62], [198, 68],
  [205, 68], [216, 50], [229, 34], [233, 50], [242, 60], [254, 72], [270, 50], [288, 42],
  [304, 48], [322, 51], [340, 52], [358, 50], [376, 46], [394, 43], [410, 46],
  [422, 60], [440, 70], [458, 71], [LOOP_X, LOOP_Y, LOOP_R], [496, 76], [514, 78], [528, 70], [BUTTON_X, BUTTON_Y],
];
const THREAD = threadPath(THREAD_WAYPOINTS);

// Sampled once, the first time anything needs points along the thread.
let threadSamples: ThreadSamples | null = null;
const getThreadSamples = () => (threadSamples ??= sampleSegments(threadSegments(THREAD_WAYPOINTS)));

// A deliberately messy scribble ball: every channel, network and touchpoint
// at once. It draws itself on load, and the thread pulls free from it.
const TANGLE = "M412 441 C515 397 634 254 612 324 C514 323 496 516 405 384 C462 554 503 411 563 536 C550 451 352 221 429 252 C463 251 542 590 592 462 C722 444 518 320 633 498 C733 324 559 351 502 325 C451 436 535 231 665 369 C653 189 542 154 453 252 C356 135 579 427 545 447 C580 505 551 553 468 379 C518 265 542 377 549 499 C417 489 679 300 622 421 C560 362 446 473 393 465 C424 562 372 482 401 372 C511 215 515 477 398 393 C299 375 474 580 439 424 C406 450 754 502 668 389 C754 375 628 135 588 240 C647 360 527 578 489 496 C412 647 637 651 506 469 C517 579 481 408 530 253 C626 196 462 257 574 279 C588 381 649 162 652 341 C736 176 676 270 595 393 C551 502 511 179 608 312 C612 397 708 447 616 375 C736 373 748 312 627 469 C552 479 478 362 535 275 C572 284 689 483 596 461 C546 415 740 502 646 350 C568 483 705 479 578 470 C598 357 572 439 563 438 C591 259 667 301 541 295 C514 408 442 336 425 339 C477 175 577 532 566 565 C690 668 539 510 601 520 C501 495 679 640 594 488 C588 419 456 553 539 509 C654 369 727 177 651 357 C569 254 524 516 473 584 C434 629 437 615 543 528 C442 532 526 141 593 255 C601 231 606 485 639 519 C647 390 459 557 538 507 C576 518 628 307 533 264 C629 164 569 587 504 469 C613 399 567 642 617 482 C541 668 630 423 525 561 C455 646 384 347 449 499 C539 470 700 212 622 354 C596 424 286 189 397 302 C446 458 674 337 547 482 C549 579 634 356 633 287 C549 135 414 322 520 498 C534 503 529 135 511 184 C425 135 660 668 568 590 C683 437 488 449 606 279 C596 379 420 421 467 434 C471 407 689 259 661 443 C716 574 443 556 529 573 C594 538 432 461 514 588 C517 405 556 436 450 322 C505 459 612 520 577 556 C604 558 721 555 590 440 C525 596 458 425 392 320 C477 284 564 456 457 313 C510 414 656 303 584 339 C645 177 559 393 602 405 C470 350 507 466 470 418 C398 587 607 453 562 514 C605 541 471 310 462 352 C597 406 484 646 429 547 C559 367 672 461 640 371 C574 334 357 135 479 238 C445 135 484 601 551 447 C565 450 754 442 661 416 C754 468 560 135 476 191 C502 289 516 578 638 416 C547 405 304 412 394 413 C423 246 578 558 458 588 C465 625 583 385 619 466 C661 489 450 271 508 189 C453 135 441 135 510 212 C417 308 529 344 558 194 C625 135 578 668 446 536 C331 668 614 267 632 276 C754 178 412 653 405 488 C465 476 724 388 594 268 C622 135 486 278 453 295 C373 135 426 166 418 308 C403 372 613 387 625 476 C647 446 734 396 660 384 C754 555 570 156 507 255 C403 404 586 275 509 227 C471 141 443 489 393 465 C418 515 700 369 632 486 C564 668 746 567 634 424 C510 258 381 378 443 406 C476 256 497 135 486 246 C374 313 426 307 413 257 C379 248 440 397 518 456 C584 584 366 418 481 562 C565 608 613 381 540 489 C520 398 704 245 621 295 C662 479 342 484 389 465 C455 624 444 499 463 549 C354 668 438 372 552 530 C569 524 619 135 569 199";

function Portfolio() {
  const storyRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const listeners = useRef(new Set<(progress: number) => void>());
  const [introDone, setIntroDone] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openRole, setOpenRole] = useState<number | null>(null);
  // The header floats over the story, but gets the page colour from the
  // impact numbers on, so the links never sit on top of the content.
  const [solidHeader, setSolidHeader] = useState(false);
  const [active, setActive] = useState<string>("brain");
  useEffect(() => {
    const check = () => {
      const impact = document.getElementById("impact");
      if (impact) setSolidHeader(window.scrollY >= impact.offsetTop - 80);
      // The current section is the last one whose top has passed 40% down the screen.
      let current: string = SECTIONS[0].id;
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= window.scrollY + window.innerHeight * 0.4) current = id;
      }
      setActive(current);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  // First the hero arrives, then scrolling takes over. The pause is short,
  // and anyone who scrolls, taps or presses a key skips it.
  useEffect(() => {
    const root = document.documentElement;
    // Climbing back out of the rabbit hole lands straight on the work, no intro.
    if (takeFlag(CLIMBED_OUT) || window.location.hash === "#work") {
      setIntroDone(true);
      setScrollReady(true);
      requestAnimationFrame(() => document.getElementById("work")?.scrollIntoView({ behavior: "instant" }));
      return;
    }
    if (prefersReducedMotion() || window.location.hash) {
      setIntroDone(true);
      setScrollReady(true);
      return;
    }
    root.style.overflow = "hidden";
    window.scrollTo(0, 0);
    let greet = 0;
    const unlock = () => {
      root.style.overflow = "";
      setIntroDone(true);
      setScrollReady(true);
      window.clearTimeout(greet);
      greet = window.setTimeout(() => say("intro", "hi, gauri here. scroll on."), 1600);
      window.clearTimeout(unlockTimer);
      skipEvents.forEach((name) => window.removeEventListener(name, unlock));
    };
    const unlockTimer = window.setTimeout(unlock, 1300);
    const skipEvents = ["wheel", "touchmove", "keydown", "pointerdown"] as const;
    skipEvents.forEach((name) => window.addEventListener(name, unlock, { passive: true }));
    return () => {
      window.clearTimeout(greet);
      window.clearTimeout(unlockTimer);
      skipEvents.forEach((name) => window.removeEventListener(name, unlock));
      root.style.overflow = "";
    };
  }, []);

  // One animation-frame loop runs the whole story. It eases toward the scroll
  // position, so wheel steps become a glide, and then moves the canvas, draws
  // the thread and reveals whatever the thread has reached — all directly on
  // the DOM, without asking React to re-render the page every frame. It only
  // keeps running while there's still distance to cover.
  useEffect(() => {
    let frame = 0;
    let current = -1;
    const spoken = new Set<string>();
    const ease = prefersReducedMotion() ? 1 : SCROLL_EASE;
    const tick = () => {
      frame = 0;
      const section = storyRef.current;
      const canvas = canvasRef.current;
      if (!section) return;
      const distance = section.offsetHeight - window.innerHeight;
      const target = Math.min(1, Math.max(0, (window.scrollY - section.offsetTop) / Math.max(distance, 1)));
      const next = current < 0 || Math.abs(target - current) < 0.00005 ? target : current + (target - current) * ease;
      if (next !== current) {
        current = next;
        if (canvas && window.innerWidth >= DESKTOP_STORY) {
          canvas.style.transform = `translate3d(-${current * CANVAS_TRAVEL_VW}vw,0,0)`;
          const tip = current * CANVAS_TRAVEL_VW + TIP_SCREEN_ANCHOR * 100;
          const edge = current * CANVAS_TRAVEL_VW + 100 - REVEAL_INSET;
          canvas.querySelectorAll<HTMLElement>("[data-at]").forEach((el) => {
            // Most things reveal as they enter the screen; "thread" ones wait
            // for the thread itself (the loop's steps, the story comments).
            const shown = (el.dataset["mode"] === "thread" ? tip : edge) >= Number(el.dataset["at"]);
            el.toggleAttribute("data-shown", shown);
            // Story comments are said once, the first time the thread arrives.
            const line = el.dataset["say"];
            if (shown && line && !spoken.has(line)) {
              spoken.add(line);
              say(`story:${line}`, line);
            }
          });
        }
        listeners.current.forEach((listen) => listen(current));
        frame = requestAnimationFrame(tick);
      }
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    // A resize (or crossing into the desktop layout) re-applies everything.
    const relayout = () => {
      current = -1;
      wake();
    };
    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", relayout);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", relayout);
    };
  }, []);

  const subscribe = (listen: (progress: number) => void) => {
    listeners.current.add(listen);
    return () => {
      listeners.current.delete(listen);
    };
  };

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    setMenuOpen(false);
  };

  return (
    <main>
      <a href="#work" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background">Skip to the work</a>
      <Header solid={solidHeader} ready={scrollReady} active={active} menuOpen={menuOpen} setMenuOpen={setMenuOpen} go={go} />

      <section id="brain" ref={storyRef} aria-label="The story so far" className="relative lg:h-[720vh]">
        <div className="sticky top-0 hidden h-screen overflow-hidden lg:block">
          <AmbientLight />
          <div ref={canvasRef} className="relative h-full will-change-transform max-lg:hidden" style={{ width: `${CANVAS_VW}vw` }}>
            <StringLine subscribe={subscribe} />
            <div className="absolute inset-0 z-10">
              <IntroScene revealed={introDone} onWork={() => go("work")} />
              <AboutScene />
              <ToolkitScene />
              <TimelineScene onRole={setOpenRole} />
              <LoopScene />
              <EnoughScene onWork={() => go("work")} />
            </div>
          </div>
        </div>
        <MobileStory ready={introDone} onWork={() => go("work")} onRole={setOpenRole} />
      </section>

      <Impact />
      <Works />
      <Journal />
      <OhHi />
      <CuriousCursor visible={scrollReady} />
      <PhoneComment />
      {openRole !== null && <RoleSpotlight index={openRole} onClose={() => setOpenRole(null)} onMove={(d) => setOpenRole((openRole + d + roles.length) % roles.length)} />}
    </main>
  );
}

function Header({ solid, ready, active, menuOpen, setMenuOpen, go }: { solid: boolean; ready: boolean; active: string; menuOpen: boolean; setMenuOpen: (open: boolean | ((open: boolean) => boolean)) => void; go: (id: string) => void }) {
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // The phone menu: Escape or a tap outside closes it, and focus moves into
  // it when it opens and back to the toggle when it closes.
  useEffect(() => {
    if (!menuOpen) return;
    // Wait a moment: until its visibility transition starts it can't take focus.
    const timer = window.setTimeout(() => menuRef.current?.querySelector<HTMLElement>("a, button")?.focus(), 60);
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    const away = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !toggleRef.current?.contains(target)) setMenuOpen(false);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", away);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", away);
    };
  }, [menuOpen, setMenuOpen]);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 grid grid-cols-[minmax(0,1fr)_auto] items-center px-5 py-4 transition-[background-color,border-color,opacity] duration-500 sm:px-8 sm:py-5", solid ? "border-b border-border/70 bg-background/80 backdrop-blur-md" : "border-b border-transparent bg-transparent", ready ? "opacity-100" : "animate-reveal [animation-delay:.5s]")}>
      <button aria-label="Back to the top" onClick={() => go("brain")} className="flex w-fit items-baseline gap-0.5 bg-transparent font-display text-2xl font-semibold tracking-tight">
        Gauri<span className="text-primary">.</span>
      </button>
      <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
        {SECTIONS.map(({ id, label }) => (
          <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }} data-active={active === id} aria-current={active === id ? "location" : undefined} className="story-link transition-colors hover:text-foreground">
            {label}
          </a>
        ))}
        <Link to="/work" className="story-link transition-colors hover:text-foreground" data-cursor="every role, every number.">full record</Link>
        <a href={CV_PATH} download className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-foreground transition-colors hover:border-primary hover:text-primary" data-cursor="the one-page version.">
          CV <Download className="h-3.5 w-3.5" />
        </a>
      </nav>
      <button ref={toggleRef} className="relative h-11 w-11 md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((open) => !open)}>
        <span className={cn("absolute left-1/2 top-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-foreground transition-all duration-300", menuOpen ? "rotate-45" : "-translate-y-[5px]")} />
        <span className={cn("absolute left-1/2 top-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-foreground transition-all duration-300", menuOpen ? "-rotate-45" : "translate-y-[4px]")} />
      </button>
      <nav
        ref={menuRef}
        id="mobile-menu"
        aria-label="Main navigation"
        className={cn(
          "absolute inset-x-4 top-[4.25rem] grid gap-1 rounded-xl border border-border bg-surface/95 p-3 text-lg shadow-2xl backdrop-blur-md transition-[opacity,transform,visibility] duration-300 md:hidden",
          menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
        )}
      >
        {SECTIONS.map(({ id, label }) => (
          <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }} className={cn("flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-2", active === id && "text-primary")}>
            {label} {active === id && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </a>
        ))}
        <Link to="/work" className="rounded-lg p-3 transition-colors hover:bg-surface-2">full record</Link>
        <a href={CV_PATH} download className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-2">
          download CV <Download className="h-4 w-4" />
        </a>
      </nav>
    </header>
  );
}

// Ambient light behind the story: two slow colour fields, and on desktop a
// soft glow that follows the pointer. Purely decorative, never in the way.
function AmbientLight() {
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const glow = glowRef.current;
    if (!glow || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      glow.style.setProperty("--mx", `${x}px`);
      glow.style.setProperty("--my", `${y}px`);
      glow.style.opacity = "1";
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
    };
  }, []);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="ambient-a absolute -left-[10vw] -top-[20vh] h-[70vh] w-[55vw] rounded-full bg-primary/[0.09] blur-[110px]" />
      <div className="ambient-b absolute -bottom-[25vh] right-[-5vw] h-[70vh] w-[50vw] rounded-full bg-cyan/[0.06] blur-[120px]" />
      <div ref={glowRef} className="pointer-glow absolute inset-0 opacity-0" />
    </div>
  );
}

// From this width up the story is told sideways on one canvas; below it,
// phones and tablets get the same story told vertically.
const DESKTOP_STORY = 1024;

// While scrolling, the string's tip is anchored to ~55% of the viewport width,
// so the freshly drawn thread always stays on screen instead of lagging behind.
const TIP_SCREEN_ANCHOR = 0.55;
// How quickly the story catches up with the scrollbar each frame (0–1).
const SCROLL_EASE = 0.085;
// Content sharpens in as it enters from the right edge: it's revealed once
// its x is this far (vw) inside the screen, so it's clear by the time you read it.
const REVEAL_INSET = 4;

type Subscribe = (listen: (progress: number) => void) => () => void;

// The thread's ink: violet into cyan and back as it travels the canvas.
function ThreadInk({ id, x2, y2 = 0 }: { id: string; x2: number; y2?: number }) {
  return (
    <defs>
      <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={x2} y2={y2}>
        <stop offset="0" style={{ stopColor: "var(--primary)" }} />
        <stop offset="0.35" style={{ stopColor: "var(--cyan)" }} />
        <stop offset="0.7" style={{ stopColor: "var(--primary)" }} />
        <stop offset="1" style={{ stopColor: "var(--cyan)" }} />
      </linearGradient>
    </defs>
  );
}

function StringLine({ subscribe }: { subscribe: Subscribe }) {
  const pathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const tip = tipRef.current;
    if (!path || !tip) return;
    const { xs, ys, lengths, total } = getThreadSamples();
    const count = xs.length - 1;

    const draw = (progress: number) => {
      // Where the tip should sit: viewport's left edge (in viewBox units) plus
      // 55% of the visible width (1000 units).
      // Over the last stretch the tip runs ahead of its anchor, so the thread
      // reaches the button at the very end instead of stopping mid-screen.
      const catchUp = Math.max(0, (progress - 0.9) / 0.1) * 150;
      const targetX = progress * CANVAS_TRAVEL_VW * 10 + TIP_SCREEN_ANCHOR * 1000 + catchUp;
      let i = 0;
      while (i < count && (xs[i] ?? 0) < targetX) i += 1;
      const length = lengths[i] ?? total;

      path.style.strokeDashoffset = `${1 - length / total}`;
      tip.setAttribute("cx", `${xs[i]}`);
      tip.setAttribute("cy", `${ys[i]}`);
      tip.style.opacity = length <= 0 || length >= total * 0.999 ? "0" : "1";
    };
    draw(0);
    return subscribe(draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${CANVAS_VW * 10} 1000`} preserveAspectRatio="none">
      <ThreadInk id="thread-ink" x2={CANVAS_VW * 10} />
      <path ref={pathRef} pathLength="1" style={{ strokeDashoffset: 1 }} d={THREAD} fill="none" stroke="url(#thread-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1" />
      <g transform={`translate(${TANGLE_CX * (1 - TANGLE_SCALE)} ${TANGLE_CY * (1 - TANGLE_SCALE)}) scale(${TANGLE_SCALE})`}>
        <path className="animate-draw-string opacity-80" pathLength="1" strokeDasharray="1" d={TANGLE} fill="none" stroke="url(#thread-ink)" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      <circle ref={tipRef} r="5.5" cx="0" cy="0" style={{ opacity: 0, filter: "drop-shadow(0 0 6px var(--cyan))" }} className="fill-cyan" />
    </svg>
  );
}

// The hero's words, shared by the desktop canvas and the phone story.
function HeroHeadline({ revealed, className }: { revealed: boolean; className?: string }) {
  // Each line rises in a beat after the last, unless the intro was skipped.
  const step = (delay: number) => (revealed ? {} : { className: "animate-reveal", style: { animationDelay: `${delay}s` } });
  const line = (delay: number, className: string) => {
    const s = step(delay);
    return { className: cn(className, s.className), style: s.style };
  };
  return (
    <div className={className}>
      <p {...line(0.1, "font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground")}>
        Gauri Tichkule <span className="text-primary">/</span> marketing strategy &amp; media
      </p>
      <h1 className="mt-4 font-display text-[clamp(2rem,9.4vw,2.6rem)] font-semibold leading-[1.02] tracking-[-0.035em] md:text-[clamp(2.5rem,4.1vw,4.5rem)] md:leading-[1]">
        <span {...line(0.2, "block")}>Marketing Strategy.</span>
        <span {...line(0.32, "block")}>Media Intelligence.</span>
        <span {...line(0.44, "relative inline-block")}>
          <span className="text-gradient">Measurable Growth.</span>
          <svg aria-hidden="true" viewBox="0 0 400 14" preserveAspectRatio="none" className="absolute -bottom-2.5 left-0 h-3 w-full overflow-visible">
            <ThreadInk id="hero-underline" x2={400} />
            <path d="M3 9 C70 3 120 12 190 7 S320 3 397 8" pathLength="1" strokeDasharray="1" className="animate-draw-string [animation-delay:.9s]" fill="none" stroke="url(#hero-underline)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </span>
      </h1>
    </div>
  );
}

function HeroActions({ revealed, onWork, className }: { revealed: boolean; onWork: () => void; className?: string }) {
  return (
    <div className={cn(className, revealed ? "" : "animate-reveal [animation-delay:.6s]")}>
      <p className="max-w-[26rem] text-[0.98rem] leading-relaxed text-muted-foreground">
        I connect strategic thinking with data-driven execution across digital campaigns, media planning, B2B marketing and customer experience, turning complex marketing challenges into measurable business outcomes.
      </p>
      <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground/80">Milton Keynes, UK · MSc Strategic Marketing, Cranfield</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="ink" onClick={onWork} data-cursor="the good part ↓">
          Explore my work <ArrowDown className="ml-2 h-4 w-4" />
        </Button>
        <Button asChild variant="paper">
          <a href={CV_PATH} download data-cursor="one page, all of it.">
            Download CV <Download className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

function IntroScene({ revealed, onWork }: { revealed: boolean; onWork: () => void }) {
  return (
    <div className="absolute left-0 top-0 h-full w-screen">
      <HeroHeadline revealed={revealed} className="absolute bottom-[8vh] left-8 max-w-[48vw] lg:left-12" />
      <div className={cn("absolute left-[66%] top-[13vh] flex max-w-60 items-start gap-2 text-sm text-muted-foreground", revealed ? "" : "animate-reveal [animation-delay:1s]")}>
        <svg aria-hidden="true" viewBox="0 0 40 30" className="mt-1 h-6 w-8 shrink-0"><path d="M38 4 C24 6 12 14 4 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M4 24 L13 22 M4 24 L7 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        <span>every channel, network and touchpoint. one thread through all of it.</span>
      </div>
      <HeroActions revealed={revealed} onWork={onWork} className="absolute bottom-[8vh] right-8 w-[min(27rem,31vw)] lg:right-12" />
    </div>
  );
}

// A piece of text pinned to the canvas.
// `at` is the canvas x (in vw) the thread must reach before a `.reveal` note shows.
function Note({ x, y, className, at: revealAt, children }: { x: number; y: number; className?: string; at?: number; children: ReactNode }) {
  return <div className={cn("absolute", className)} style={at(x, y)} data-at={revealAt}>{children}</div>;
}

const ABOUT_LINES = {
  eyebrow: "about",
  title: "Strategy, with the platform know-how to back it.",
  body: "4+ years across digital campaigns, US broadcast media buying and B2B marketing: from 150+ AdRoll campaigns a month to national TV for global brands, and now the strategy above both, with an MSc in Strategic Marketing from Cranfield University.",
};

// The channels the work runs through, each with a line of its own.
const channels: { mark: MarkName; alt: string; label: string; x: number; y: number; delay: string }[] = [
  { mark: "tv", alt: "a television", label: "US national TV, planned and bought.", x: 156, y: 9, delay: "0s" },
  { mark: "search", alt: "a search lens with a spark", label: "content built for answer engines.", x: 159, y: 45, delay: ".3s" },
  { mark: "ad", alt: "a display ad with a retargeting loop", label: "150+ campaigns a month on AdRoll.", x: 111, y: 66, delay: ".6s" },
  { mark: "mail", alt: "an email on its way", label: "HubSpot, Marketo and Mailchimp.", x: 127, y: 58, delay: "1.2s" },
  { mark: "chart", alt: "a rising bar chart", label: "bi-weekly GRP and unit-count analysis.", x: 147, y: 60, delay: "1.5s" },
];

const CITY_CAPTION = (
  <>
    hello from the city <span className="text-[#7b66f0]">✦</span>
  </>
);

// About: a taped-down photo, one quiet line beside it, the channels scattered
// around them, and the thread weaving between them underneath.
function AboutScene() {
  return (
    <div>
      <span hidden data-mode="thread" data-at={108} data-say="first, the channels." />
      <Note x={100} y={13} className="reveal w-[clamp(11rem,14vw,16rem)]" at={104}>
        <Polaroid photo={photos.city} caption={CITY_CAPTION} rotate={-5} />
        <Sparkle className="-right-6 -top-6 h-5 w-5 text-cyan" />
      </Note>
      <Note x={118} y={15} className="reveal w-[34vw] text-center" at={120}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{ABOUT_LINES.eyebrow}</p>
        <h2 className="mx-auto mt-3 max-w-[30rem] font-display text-[clamp(2rem,3.1vw,3.4rem)] font-medium leading-[1.05]">{ABOUT_LINES.title}</h2>
        <p className="mx-auto mt-4 max-w-[31rem] text-[0.98rem] leading-relaxed text-muted-foreground">{ABOUT_LINES.body}</p>
      </Note>
      {channels.map((c) => (
        <Prop key={c.mark} mark={c.mark} alt={c.alt} label={c.label} style={at(c.x, c.y)} size="sm" delay={c.delay} />
      ))}
    </div>
  );
}

const toolkits: { mark: MarkName; alt: string; x: number; y: number; title: string; body: string; label: string; items: string[] }[] = [
  { mark: "broadcast", alt: "a broadcast tower", x: 200, y: 56, title: "media & campaigns.", body: "national TV to paid social, planned against the numbers.", label: "20+ networks. 100+ placements a quarter.", items: skillGroups[0]!.items },
  { mark: "journey", alt: "a customer journey path", x: 224, y: 20, title: "crm & content.", body: "journeys, automation and content that answer engines can read.", label: "the journey comes before the CRM.", items: skillGroups[1]!.items },
  { mark: "stack", alt: "a stack of platform layers", x: 248, y: 58, title: "platforms & tools.", body: "hands-on with the platforms the work actually runs on.", label: "50+ media estimates built in Media Ocean.", items: skillGroups[2]!.items },
];

function Chips({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Skills">
      {items.map((item) => (
        <li key={item} className="rounded-full border border-border bg-surface/60 px-2.5 py-1 font-mono text-[0.68rem] text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground">{item}</li>
      ))}
    </ul>
  );
}

// The toolkits: each one an object with a big line, a quiet one and its
// skills beside it, and the thread running calmly between the objects.
function ToolkitScene() {
  return (
    <div>
      <span hidden data-mode="thread" data-at={184} data-say="now, the toolkit." />
      <Note x={178} y={17} className="reveal w-[21rem]" at={180}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">skills &amp; tools</p>
        <h2 className="mt-3 font-display text-[clamp(2.2rem,3.4vw,3.6rem)] font-medium leading-[1.02]">but three toolkits do the <em className="text-gradient pr-1">heavy lifting.</em></h2>
      </Note>
      {toolkits.map((t, index) => (
        <Note key={t.title} x={t.x} y={t.y} className="reveal flex items-center gap-5" at={t.x + 2}>
          <Figure mark={t.mark} alt={t.alt} label={t.label} delay={`${index * 0.5}s`} />
          <div className="w-[min(18rem,21vw)]">
            <p className="font-display text-3xl font-medium leading-tight">{t.title}</p>
            <p className="mt-2 text-sm leading-snug text-muted-foreground">{t.body}</p>
            <Chips items={t.items} className="mt-3" />
          </div>
        </Note>
      ))}
    </div>
  );
}

// One beat per year, told like a story: a short line that moves it forward,
// and for the roles, the whole role a click away.
const timeline: { year: string; title: string; line: string; role?: number }[] = [
  { year: "2018", title: "started business school.", line: "Bachelor of Business Management, City Premium College. CGPA 9.4/10." },
  { year: "2020", title: "went digital.", line: "PG Certification in Digital Marketing, upGrad and MICA." },
  { year: "2021", title: "joined the ad-tech side.", line: "Platform Support Specialist, Mediamint: AdRoll campaigns and CRM integrations.", role: 2 },
  { year: "2024", title: "moved to the buying desk.", line: "Media Planning and Buying, IPG Mediabrands: US national TV.", role: 1 },
  { year: "2025", title: "came to Cranfield.", line: "MSc Strategic Marketing, with a 15% merit scholarship." },
  { year: "2026", title: "went B2B.", line: "B2B Marketing and CRM Intern, Navatech: AEO, content, the buyer journey.", role: 0 },
];
const TIMELINE_FROM = 304;
const TIMELINE_STEP = 18;
const STEM = 11;

// Points on the thread between two x positions, as (x, y) pairs in vw/vh.
function sampleThread(from: number, to: number) {
  const { xs: allX, ys: allY } = getThreadSamples();
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < allX.length; i += 1) {
    const x = allX[i]! / 10;
    if (x >= from - 1 && x <= to + 1) {
      xs.push(x);
      ys.push(allY[i]! / 10);
    }
  }
  return { xs, ys };
}

function RoleButton({ index, onRole, className }: { index: number; onRole: (index: number) => void; className?: string }) {
  return (
    <button onClick={() => onRole(index)} className={cn("story-link mt-2 inline-flex items-center gap-1.5 text-sm text-primary", className)} data-cursor="the whole role.">
      the full role <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

// The thread curves gently through the years. Each year hangs off it on a thin
// stem — alternating above and below — and only appears once the thread
// arrives. Underneath, what all of it keeps adding up to.
function TimelineScene({ onRole }: { onRole: (index: number) => void }) {
  const [ys, setYs] = useState<number[] | null>(null);

  // Hang each stem from exactly where the thread passes.
  useEffect(() => {
    const { xs, ys: samples } = sampleThread(TIMELINE_FROM - 2, TIMELINE_FROM + TIMELINE_STEP * timeline.length);
    setYs(timeline.map((_, index) => {
      const x = TIMELINE_FROM + index * TIMELINE_STEP;
      let k = 0;
      while (k < xs.length - 1 && (xs[k + 1] ?? 0) < x) k += 1;
      return samples[k] ?? 50;
    }));
  }, []);

  return (
    <div>
      <span hidden data-mode="thread" data-at={306} data-say="the short version." />
      <Note x={292} y={14} className="reveal" at={296}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">experience &amp; education</p>
      </Note>
      {ys && timeline.map((stop, index) => {
        const x = TIMELINE_FROM + index * TIMELINE_STEP;
        const y = ys[index] ?? 50;
        const up = index % 2 === 1;
        return (
          <div key={stop.year + stop.title} className="reveal" data-at={x}>
            <span className="absolute w-px bg-muted-foreground/50" style={{ left: `${x}vw`, top: `${up ? y - STEM : y}vh`, height: `${STEM}vh` }} />
            <span className={cn("absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full", stop.role !== undefined ? "bg-primary shadow-[0_0_10px_var(--primary)]" : "bg-muted-foreground")} style={{ left: `calc(${x}vw + 0.5px)`, top: `${up ? y - STEM : y + STEM}vh` }} />
            <Note x={x} y={up ? y - STEM - 2 : y + STEM + 2} className={cn("w-64 -translate-x-1/2 text-center leading-snug", up && "-translate-y-full")}>
              <p className="font-mono text-xs text-primary">{stop.year}</p>
              <p className="mt-1 font-display text-lg font-medium">{stop.title}</p>
              <p className="text-sm text-muted-foreground">{stop.line}</p>
              {stop.role !== undefined && <RoleButton index={stop.role} onRole={onRole} />}
            </Note>
          </div>
        );
      })}
      {/* Each phrase fades in as the thread passes over it, like the years. */}
      <Note x={300} y={84} className="reveal" at={300}><p className="whitespace-nowrap font-display text-[clamp(1.9rem,2.9vw,3rem)] font-medium">every step, <span className="text-muted-foreground">one direction:</span></p></Note>
      <Note x={347} y={84} className="reveal" at={347}><p className="whitespace-nowrap font-display text-[clamp(1.9rem,2.9vw,3rem)] font-medium"><span className="text-muted-foreground">closer to</span> the <em className="text-gradient pr-1">numbers.</em></p></Note>
      <Note x={391} y={82} className="reveal w-[24rem] leading-snug" at={391}>
        <p>I started out running the campaigns, then bought the media behind them. Now I work on the strategy that decides both.</p>
        <p className="mt-1 text-muted-foreground">every step, measured in outcomes.</p>
      </Note>
    </div>
  );
}

// The habit that keeps repeating, told as a cycle: the thread ties one big
// loop beside the line, and the four steps sit around it in the order the
// thread draws them — bottom, right, top, left — with "optimise." in the middle.
const LOOP_RX = LOOP_R / LOOP_ASPECT;
const habit = [
  { step: "research it.", x: LOOP_X, y: LOOP_Y, place: "below" },
  { step: "plan it.", x: LOOP_X + LOOP_RX, y: LOOP_Y - LOOP_R, place: "right" },
  { step: "run it.", x: LOOP_X, y: LOOP_Y - 2 * LOOP_R, place: "above" },
  { step: "measure it.", x: LOOP_X - LOOP_RX, y: LOOP_Y - LOOP_R, place: "left" },
] as const;

const habitLabel = {
  below: "-translate-x-1/2 translate-y-4",
  right: "translate-x-5 -translate-y-1/2",
  above: "-translate-x-1/2 -translate-y-[calc(100%+1rem)]",
  left: "-translate-x-[calc(100%+1.25rem)] -translate-y-1/2",
};

function LoopScene() {
  // The loop is drawn in one go once the thread reaches it, so its steps
  // arrive one after another, in drawing order.
  const looped = LOOP_X + LOOP_RX + 1;
  return (
    <div>
      <span hidden data-mode="thread" data-at={looped} data-say="yes, it's a loop. that's the point." />
      <Note x={426} y={18} className="reveal w-[30rem]" at={426}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">how I work</p>
        <p className="mt-3 font-display text-[clamp(2.2rem,3.4vw,3.6rem)] font-medium leading-[1.04]">apparently, <span className="text-muted-foreground">a campaign is never really finished.</span></p>
      </Note>
      {habit.map(({ step, x, y, place }, index) => (
        <div key={step} className="reveal" data-mode="thread" data-at={looped} style={{ "--reveal-delay": `${index * 0.25}s` } as CSSProperties}>
          <span className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-4 ring-primary/25" style={at(x, y)} />
          <p className={cn("absolute whitespace-nowrap font-display text-lg", habitLabel[place])} style={at(x, y)}>{step}</p>
        </div>
      ))}
      <p className="reveal absolute -translate-x-1/2 -translate-y-1/2 font-serif text-5xl italic text-gradient pr-1" data-mode="thread" data-at={looped} style={{ ...at(LOOP_X, LOOP_Y - LOOP_R), "--reveal-delay": "1s" } as CSSProperties}>optimise.</p>
    </div>
  );
}

// The thread stops. Whitespace. Then the turn into the work.
function EnoughScene({ onWork }: { onWork: () => void }) {
  // The button is pinned to the thread's end point (its left edge, halfway
  // down), so the thread meets it on every screen size; the words sit above.
  return (
    <>
      <span hidden data-mode="thread" data-at={BUTTON_X - 8} data-say="go on. it's the good part." />
      <Note x={BUTTON_X + 4.6} y={BUTTON_Y - 6} className="reveal w-[46vw] -translate-x-1/2 -translate-y-full text-center" at={BUTTON_X - 14}>
        <p className="text-lg text-muted-foreground">enough about the journey.</p>
        <h2 className="mt-3 font-display text-[clamp(2.4rem,4vw,4.2rem)] font-medium leading-[1.02]">let's look at what came out of it.</h2>
      </Note>
      <div className="absolute -translate-y-1/2" style={at(BUTTON_X, BUTTON_Y)}>
        <Button variant="ink" onClick={onWork} data-cursor="show me the work ↓">see the work <ArrowDown className="ml-2 h-4 w-4" /></Button>
      </div>
    </>
  );
}

const figureSizes = { sm: "h-32 w-32 lg:h-40 lg:w-40", md: "h-40 w-40 xl:h-52 xl:w-52" };

// Each object keeps its own line. It types itself out on hover (or tap) and
// springs back into hiding the moment the pointer leaves. The object tilts
// toward the pointer and floats above a soft ground shadow so it reads as 3D.
function Figure({ mark, alt, label, className, delay, size = "md", labelBelow = false }: { mark: MarkName; alt: string; label?: string | undefined; className?: string; delay?: string; size?: keyof typeof figureSizes | undefined; labelBelow?: boolean | undefined }) {
  const Art = marks[mark];
  const [hovered, setHovered] = useState(false);
  const [typed, setTyped] = useState("");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  // On phones, objects near an edge open their bubble toward the middle of
  // the screen instead of centred, so the words never run off-screen.
  const [align, setAlign] = useState<"center" | "left" | "right">("center");
  const hideTimer = useRef(0);

  const open = (el: HTMLElement) => {
    quietOthers(id.current);
    setHovered(true);
    if (window.innerWidth >= DESKTOP_STORY) return;
    const r = el.getBoundingClientRect();
    const middle = r.left + r.width / 2;
    setAlign(middle < 140 ? "left" : middle > window.innerWidth - 140 ? "right" : "center");
  };

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  // Only one line at a time: opening this one closes any other.
  const id = useRef(Math.random());
  useEffect(() => {
    const close = (e: Event) => {
      if ((e as CustomEvent<number>).detail !== id.current) setHovered(false);
    };
    window.addEventListener("figure-open", close);
    return () => window.removeEventListener("figure-open", close);
  }, []);

  // A tap anywhere else closes the line.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hovered) return;
    const away = (e: PointerEvent) => {
      if (e.pointerType === "touch" && !rootRef.current?.contains(e.target as Node)) setHovered(false);
    };
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [hovered]);

  useEffect(() => {
    if (!hovered || !label) {
      setTyped("");
      return;
    }
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(label.slice(0, index));
      if (index >= label.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [hovered, label]);

  return (
    <div
      ref={rootRef}
      className={cn("relative shrink-0 [perspective:900px]", figureSizes[size], className)}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") open(e.currentTarget);
      }}
      // A tap opens the line and keeps it up for a moment; a touch "leaves"
      // as soon as the finger lifts, so it can't rely on hover.
      onPointerDown={(e) => {
        if (e.pointerType !== "touch") return;
        open(e.currentTarget);
        window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setHovered(false), 2500);
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "touch") return;
        setHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
    >
      <div aria-hidden="true" className="absolute bottom-[2%] left-1/2 h-4 w-1/2 rounded-[50%] bg-primary/25 blur-md transition-all duration-500" style={{ transform: `translateX(-50%) scale(${hovered ? 0.8 : 1})`, opacity: hovered ? 0.6 : 1 }} />
      <div className="animate-float-object h-full w-full" style={{ animationDelay: delay }}>
        <div
          style={{ transform: `rotateY(${tilt.x * 14}deg) rotateX(${-tilt.y * 12}deg) scale(${hovered ? 1.07 : 1}) translateZ(0)`, transitionTimingFunction: "var(--ease-spring)" }}
          className="h-full w-full p-[12%] transition-transform duration-500"
        >
          <Art label={alt} />
        </div>
      </div>
      {label && (
        <div
          aria-hidden="true"
          style={{ transitionTimingFunction: "var(--ease-spring)" }}
          className={cn(
            "pointer-events-none absolute z-40 w-max max-w-[min(16rem,calc(100vw-2rem))] whitespace-pre-line",
            align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2",
            labelBelow ? "top-[calc(100%+4px)] rounded-[5px_18px_18px_18px]" : align === "right" ? "bottom-[calc(100%+4px)] rounded-[18px_18px_5px_18px]" : "bottom-[calc(100%+4px)] rounded-[18px_18px_18px_5px]",
            " border border-cursor-border bg-cursor px-4 py-2 text-sm font-medium text-cursor-foreground shadow-lg transition-all duration-300",
            hovered ? "translate-y-0 scale-100 opacity-100" : cn(labelBelow ? "-translate-y-3" : "translate-y-3", "scale-90 opacity-0"),
          )}
        >
          {typed}
          <span className="animate-pulse">|</span>
        </div>
      )}
    </div>
  );
}

function Prop({ mark, alt, label, style, delay, size, labelBelow }: { mark: MarkName; alt: string; label?: string | undefined; style: CSSProperties; delay: string; size?: keyof typeof figureSizes; labelBelow?: boolean }) {
  return <div className="absolute" style={style}><Figure mark={mark} alt={alt} label={label} delay={delay} size={size} labelBelow={labelBelow} /></div>;
}

// ---------------------------------------------------------------------------
// Mobile: the same story told vertically. The thread falls from the tangle and
// weaves down the page between the objects, the years hang off it on little
// stems, and it ties the optimisation loop before ending at the work button.
// Anchor points are read from the laid-out page, so the thread fits any phone.

// Radius (px) of the habit loop on mobile.
const MOBILE_LOOP = 70;

// An object pinned in a mobile block, with the thread passing through its middle.
function MobileProp({ mark, alt, label, style, delay }: { mark: MarkName; alt: string; label: string; style: CSSProperties; delay: string }) {
  return (
    <div className="absolute" style={style}>
      <Figure mark={mark} alt={alt} label={label} size="sm" delay={delay} />
      <span data-anchor className="absolute left-1/2 top-1/2" />
    </div>
  );
}

// An invisible point the thread must pass through, placed within its block.
function Anchor({ x, y, loop }: { x: string; y: number | string; loop?: number }) {
  return <span data-anchor={loop ?? ""} className="absolute" style={{ left: x, top: y }} />;
}

function MobileStory({ ready, onWork, onRole }: { ready: boolean; onWork: () => void; onRole: (index: number) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tangleRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const samplesRef = useRef<ThreadSamples | null>(null);
  const [geo, setGeo] = useState<{ d: string; w: number; h: number } | null>(null);

  // Trace the thread through every anchor, starting at the tangle's loose end.
  useEffect(() => {
    const measure = () => {
      const root = rootRef.current;
      const svg = tangleRef.current;
      if (!root || !svg || root.offsetParent === null) return;
      const r = root.getBoundingClientRect();
      const t = svg.getBoundingClientRect();
      // The tangle's viewBox is 550×600 from (250,100), scaled to fit and
      // centred; its loose end is at (569,199).
      const k = Math.min(t.width / 550, t.height / 600);
      const points: Waypoint[] = [[t.left - r.left + (t.width - 550 * k) / 2 + 319 * k, t.top - r.top + (t.height - 600 * k) / 2 + 99 * k]];
      root.querySelectorAll<HTMLElement>("[data-anchor]").forEach((el) => {
        const a = el.getBoundingClientRect();
        const loop = Number(el.dataset["anchor"]);
        points.push(loop ? [a.left - r.left, a.top - r.top, loop] : [a.left - r.left, a.top - r.top]);
      });
      const segments = threadSegments(points, 1, 1);
      samplesRef.current = sampleSegments(segments, 24);
      setGeo({ d: segmentsPath(segments), w: r.width, h: r.height });
    };
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Draw the thread down to ~70% of the screen as you scroll, like a pen
  // following your thumb; scrolling back up rewinds it.
  useEffect(() => {
    if (!geo) return;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const root = rootRef.current;
      const path = pathRef.current;
      const tip = tipRef.current;
      const samples = samplesRef.current;
      if (!root || !path || !tip || !samples) return;
      const { xs, ys, lengths, total } = samples;
      // Nothing leaves the tangle until you scroll; then the thread grows with
      // the scroll until it catches up with ~70% down the screen.
      const top = root.getBoundingClientRect().top;
      const reach = Math.min(window.innerHeight * 0.7 - top, (ys[0] ?? 0) + Math.max(0, -top) * 1.4);
      let i = 0;
      while (i < xs.length - 1 && (ys[i] ?? 0) < reach) i += 1;
      const length = lengths[i] ?? 0;
      path.style.strokeDashoffset = `${1 - length / total}`;
      tip.setAttribute("cx", `${xs[i]}`);
      tip.setAttribute("cy", `${ys[i]}`);
      tip.style.opacity = length > 0 && length < total * 0.999 ? "1" : "0";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [geo]);

  // Things sharpen in as they scroll into view, and the story's comments are
  // said once each as their moment scrolls up the screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stop = observeReveals(root);
    const talk = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const line = (e.target as HTMLElement).dataset["say"];
        if (!e.isIntersecting || !line) return;
        say(`story:${line}`, line);
        talk.unobserve(e.target);
      }),
      { rootMargin: "0px 0px -40% 0px" },
    );
    root.querySelectorAll("[data-say]").forEach((el) => talk.observe(el));
    return () => {
      stop();
      talk.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative overflow-hidden lg:hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[120svh] overflow-hidden">
        <div className="ambient-a absolute -left-1/3 -top-20 h-[60svh] w-[120%] rounded-full bg-primary/[0.1] blur-[90px]" />
      </div>
      {geo && (
        <svg aria-hidden="true" className={cn("pointer-events-none absolute left-0 top-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")} width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
          <ThreadInk id="mobile-thread-ink" x2={geo.w * 0.3} y2={geo.h} />
          <path ref={pathRef} d={geo.d} pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: 1 }} fill="none" stroke="url(#mobile-thread-ink)" strokeWidth="1.8" strokeLinecap="round" />
          <circle ref={tipRef} r="4.5" cx="0" cy="0" style={{ opacity: 0 }} className="fill-cyan" />
        </svg>
      )}

      {/* hero: the words first, the tangle under them, then what to do next */}
      <div className="relative px-5 pb-14 pt-28">
        <HeroHeadline revealed={ready} className="relative pr-2" />
        <div className="relative mt-6">
          <svg ref={tangleRef} aria-hidden="true" viewBox="250 100 550 600" className="mx-auto h-[34svh] w-full overflow-visible">
            <ThreadInk id="mobile-tangle-ink" x2={1000} y2={600} />
            <path className="animate-draw-string opacity-80" pathLength="1" strokeDasharray="1" d={TANGLE} fill="none" stroke="url(#mobile-tangle-ink)" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <Anchor x="94%" y="26%" />
          <p className={cn("mt-2 max-w-[13rem] text-[0.8rem] leading-snug text-muted-foreground", ready ? "" : "animate-reveal [animation-delay:1s]")}>every channel, network and touchpoint. one thread through all of it.</p>
        </div>
        <HeroActions revealed={ready} onWork={onWork} className="mt-8 pr-7" />
        <Anchor x="94%" y="calc(100% - 1.5rem)" />
      </div>

      {/* about: the channels spread out on alternating sides */}
      <div className="relative h-[1730px]">
        <span data-say="first, the channels." className="absolute left-0 top-0 h-px w-px" />
        <MobileProp mark="tv" alt="a television" label="US national TV, planned and bought." style={{ left: "3%", top: 20 }} delay="0s" />
        <MobileProp mark="search" alt="a search lens with a spark" label="content built for answer engines." style={{ right: "5%", top: 180 }} delay=".4s" />
        <Anchor x="95%" y={380} />
        <div className="reveal absolute inset-x-0 top-[380px] mx-auto max-w-[18.5rem] text-center">
          <div className="relative mx-auto mb-10 w-[13.5rem]">
            <Polaroid photo={photos.city} caption={CITY_CAPTION} rotate={-4} />
            <Sparkle className="-right-7 top-6 h-5 w-5 text-cyan" />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{ABOUT_LINES.eyebrow}</p>
          <h2 className="mt-2 font-display text-[1.9rem] font-medium leading-[1.08]">{ABOUT_LINES.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{ABOUT_LINES.body}</p>
        </div>
        <Anchor x="95%" y={1160} />
        <MobileProp mark="ad" alt="a display ad with a retargeting loop" label="150+ campaigns a month on AdRoll." style={{ left: "4%", top: 1190 }} delay=".8s" />
        <MobileProp mark="mail" alt="an email on its way" label="HubSpot, Marketo and Mailchimp." style={{ right: "3%", top: 1360 }} delay="1.2s" />
        <MobileProp mark="chart" alt="a rising bar chart" label="bi-weekly GRP and unit-count analysis." style={{ left: "6%", top: 1530 }} delay="1.6s" />
        <Anchor x="96%" y={1710} />
      </div>

      {/* the toolkits: object above its words, alternating sides */}
      <div className="relative px-5 pt-6">
        <span data-say="now, the toolkit." className="absolute left-0 top-0 h-px w-px" />
        <Anchor x="5%" y={0} />
        <Anchor x="5%" y={150} />
        <div className="reveal text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">skills &amp; tools</p>
          <h2 className="mt-2 font-display text-[2.2rem] font-medium leading-[1.04]">but three toolkits do the <em className="text-gradient pr-1">heavy lifting.</em></h2>
        </div>
        {toolkits.map((t, index) => {
          const right = index % 2 === 1;
          return (
            <div key={t.title} className={cn("reveal relative mt-10 w-[78%]", right && "ml-auto text-right")}>
              <div className={cn("relative w-fit", right && "ml-auto")}>
                <Figure mark={t.mark} alt={t.alt} label={t.label} size="sm" delay={`${index * 0.5}s`} />
                <span data-anchor className="absolute left-1/2 top-1/2" />
              </div>
              <p className="font-display text-2xl font-medium leading-tight">{t.title}</p>
              <p className="mt-1 text-sm leading-snug text-muted-foreground">{t.body}</p>
              <Chips items={t.items} className={cn("mt-3", right && "justify-end")} />
              {/* leave along the outer edge, below the words */}
              <Anchor x={right ? "calc(100% + 0.25rem)" : "-0.25rem"} y="calc(100% + 0.75rem)" />
            </div>
          );
        })}
      </div>

      {/* experience & education: the years hang off the thread */}
      <div className="relative mt-20 px-5">
        <span data-say="the short version." className="absolute left-0 top-20 h-px w-px" />
        <Anchor x="6%" y={-20} />
        <p className="reveal text-center font-mono text-xs uppercase tracking-[0.2em] text-primary">experience &amp; education</p>
        <ol className="relative mt-8 pl-9">
          {timeline.map((stop) => (
            <li key={stop.year + stop.title} className="reveal relative pb-8">
              <span data-anchor className="absolute -left-[1.1rem] top-[0.7rem]" />
              <span aria-hidden="true" className="absolute -left-[1.1rem] top-[0.7rem] h-px w-3 bg-muted-foreground/60" />
              <span aria-hidden="true" className={cn("absolute left-[-0.4rem] top-[0.55rem] h-1.5 w-1.5 rounded-full", stop.role !== undefined ? "bg-primary" : "bg-muted-foreground")} />
              <p className="font-mono text-xs text-primary">{stop.year}</p>
              <p className="font-display text-lg font-medium">{stop.title}</p>
              <p className="text-sm leading-snug text-muted-foreground">{stop.line}</p>
              {stop.role !== undefined && <RoleButton index={stop.role} onRole={onRole} className="py-1" />}
            </li>
          ))}
        </ol>
        <Anchor x="6%" y="100%" />
      </div>
      <div className="relative px-5 pt-4">
        <p className="reveal text-center font-display text-[1.9rem] font-medium leading-tight">every step, <span className="text-muted-foreground">one direction:</span><br /><span className="text-muted-foreground">closer to</span> the <em className="text-gradient pr-1">numbers.</em></p>
        <div className="reveal mx-auto mt-4 max-w-[19rem] text-center text-sm leading-snug">
          <p>I started out running the campaigns, then bought the media behind them. Now I work on the strategy that decides both.</p>
          <p className="mt-1 text-muted-foreground">every step, measured in outcomes.</p>
        </div>
        <Anchor x="5%" y="calc(100% + 1rem)" />
      </div>

      {/* how I work: tied in a loop */}
      <div className="relative mt-16 px-5">
        <Anchor x="89%" y={-24} />
        <Anchor x="90%" y={170} />
        <p className="reveal font-mono text-xs uppercase tracking-[0.2em] text-primary">how I work</p>
        <p className="reveal mt-2 pr-8 font-display text-[2.2rem] font-medium leading-[1.05]">apparently, <span className="text-muted-foreground">a campaign is never really finished.</span></p>
        <div className="reveal relative mt-4 h-[270px]">
          <span data-say="yes, it's a loop. that's the point." className="absolute left-0 top-1/2 h-px w-px" />
          <Anchor x="86%" y={205} />
          <Anchor x="50%" y={230} loop={MOBILE_LOOP} />
          <span className="absolute -translate-x-1/2 translate-y-3 whitespace-nowrap font-display text-sm" style={{ left: "50%", top: 230 }}>research it.</span>
          <span className="absolute -translate-y-1/2 whitespace-nowrap font-display text-sm" style={{ left: `calc(50% + ${MOBILE_LOOP + 10}px)`, top: 230 - MOBILE_LOOP }}>plan it.</span>
          <span className="absolute -translate-x-1/2 -translate-y-[calc(100%+0.6rem)] whitespace-nowrap font-display text-sm" style={{ left: "50%", top: 230 - 2 * MOBILE_LOOP }}>run it.</span>
          <span className="absolute -translate-x-[calc(100%+0.6rem)] -translate-y-1/2 whitespace-nowrap font-display text-sm" style={{ left: `calc(50% - ${MOBILE_LOOP}px)`, top: 230 - MOBILE_LOOP }}>measure it.</span>
          <span className="text-gradient absolute -translate-x-1/2 -translate-y-1/2 pr-1 font-serif text-3xl italic" style={{ left: "50%", top: 230 - MOBILE_LOOP }}>optimise.</span>
        </div>
      </div>

      {/* enough about the journey: the thread ends at the button */}
      <div className="relative px-5 pb-24 pt-14 text-center">
        <span data-say="go on. it's the good part." className="absolute left-0 top-10 h-px w-px" />
        <Anchor x="94%" y={40} />
        <p className="reveal text-sm text-muted-foreground">enough about the journey.</p>
        <h2 className="reveal mt-2 font-display text-[2.2rem] font-medium leading-tight">let's look at what<br />came out of it.</h2>
        <div className="relative mt-7 inline-block">
          <span data-anchor className="absolute left-[calc(100%+2.75rem)] top-[-0.25rem]" />
          <span data-anchor className="absolute left-full top-1/2" />
          <Button variant="ink" onClick={onWork}>see the work <ArrowDown className="ml-2 h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

// A role from the timeline, up close.
function RoleSpotlight({ index, onClose, onMove }: { index: number; onClose: () => void; onMove: (d: number) => void }) {
  const role = roles[index]!;
  return (
    <Spotlight label={`${role.title}, ${role.company}`} onClose={onClose} onMove={onMove}>
      <div key={role.id} className="animate-reveal mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{role.dates} · {role.place}</p>
        <h2 className="mt-3 font-display text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[1]">{role.company}</h2>
        <p className="mt-3 text-xl text-primary">{role.title}</p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{role.summary}</p>
        <ul className="mt-10 grid gap-5 border-t border-border pt-8">
          {role.points.map((point) => (
            <li key={point} className="grid grid-cols-[auto_1fr] gap-4 leading-relaxed">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 rounded-full bg-cyan" />
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="ink"><Link to="/work">the full record <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          <Button asChild variant="paper"><a href={CV_PATH} download>Download CV <Download className="ml-2 h-4 w-4" /></a></Button>
        </div>
      </div>
    </Spotlight>
  );
}

// A number from the work, counted up the first time it scrolls into view.
function Stat({ metric }: { metric: Metric }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return countUpOnView(ref.current, metric.value, metric.decimals);
  }, [metric]);
  const final = `${metric.prefix ?? ""}${metric.value.toFixed(metric.decimals ?? 0)}${metric.suffix}`;
  return (
    <p className="font-display text-[clamp(3.25rem,5.4vw,5.25rem)] font-semibold leading-none tracking-[-0.04em]">
      <span className="sr-only">{final}</span>
      <span aria-hidden="true" className="tabular-nums">
        {metric.prefix}
        <span ref={ref}>{metric.value.toFixed(metric.decimals ?? 0)}</span>
        <span className="text-gradient">{metric.suffix}</span>
      </span>
    </p>
  );
}

// The numbers, each with what it measured and where it came from.
function Impact() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => (ref.current ? observeReveals(ref.current) : undefined), []);
  return (
    <section id="impact" ref={ref} aria-labelledby="impact-title" className="relative overflow-hidden border-t border-border bg-background px-5 pb-24 pt-28 sm:px-8 md:pb-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden" aria-hidden="true"><p className="translate-y-[-38%] whitespace-nowrap font-display text-[24vw] font-bold leading-none tracking-[-0.05em] text-surface">IMPACT</p></div>
      <div className="relative mx-auto grid max-w-[1500px] gap-14 pt-[14vw] lg:grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)]">
        <div className="reveal h-fit lg:sticky lg:top-28">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">impact / in numbers</p>
          <h2 id="impact-title" className="mt-4 max-w-md font-display text-5xl font-medium leading-[1] sm:text-6xl">results,<br /><em className="text-gradient pr-1">measured.</em></h2>
          <p className="mt-8 max-w-sm leading-relaxed text-muted-foreground">Every figure comes straight from the work, with what it measured and where it was earned.</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric, index) => (
            <li key={metric.label} className="reveal lift-card rounded-xl border border-border bg-surface/50 p-6 sm:p-7" style={{ "--reveal-delay": `${(index % 3) * 0.08}s` } as CSSProperties}>
              <Stat metric={metric} />
              <p className="mt-5 text-lg leading-snug">{metric.label}</p>
              <p className="mt-3 border-t border-border pt-3 font-mono text-[0.7rem] leading-relaxed text-muted-foreground">{metric.context}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const caseFilters = ["All", "Media", "Digital", "B2B & CRM"];

function Works() {
  const ref = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const filtered = caseStudies.map((study, index) => ({ study, index })).filter(({ study }) => filter === "All" || study.tags.includes(filter));
  useEffect(() => (ref.current ? observeReveals(ref.current) : undefined), [filter]);
  return (
    <section id="work" ref={ref} aria-labelledby="work-title" className="relative min-h-screen overflow-hidden border-t border-border bg-background px-5 pb-24 pt-28 sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden" aria-hidden="true"><p className="translate-y-[-38%] whitespace-nowrap font-display text-[26vw] font-bold leading-none tracking-[-0.05em] text-surface">WORK</p></div>
      <div className="relative mx-auto grid max-w-[1500px] gap-16 pt-[18vw] lg:grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)]">
        <aside className="h-fit lg:sticky lg:top-28">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">selected work / 2021—2026</p>
          <h2 id="work-title" className="mt-4 max-w-md font-display text-5xl font-medium leading-[1] sm:text-6xl">four case studies,<br /><em className="text-gradient pr-1">told straight.</em></h2>
          <p className="mt-8 max-w-sm leading-relaxed text-muted-foreground">Drawn from real roles and the numbers on my CV. The visuals are illustrative: client work stays confidential.</p>
          <p className="mb-3 mt-10 text-sm text-muted-foreground" id="filter-label">show me</p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="filter-label">
            {caseFilters.map((item) => <Button key={item} variant="filter" data-active={filter === item} aria-pressed={filter === item} onClick={() => setFilter(item)} data-cursor={`filter: ${item.toLowerCase()}`}>{item}</Button>)}
          </div>
        </aside>
        <div>
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
            {filtered.map(({ study, index }, k) => (
              <CaseCard key={study.id} study={study} onOpen={() => setOpen(index)} delay={k % 2 ? 0.12 : 0} />
            ))}
          </div>
          {/* the way down to everything else */}
          <div className="mt-20 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-border pt-10">
            <p className="font-display text-3xl font-medium">want the whole story? <span className="text-muted-foreground">there's more.</span></p>
            <RabbitHoleButton />
          </div>
        </div>
      </div>
      {open !== null && <CaseSpotlight index={open} onClose={() => setOpen(null)} onMove={(d) => setOpen((open + d + caseStudies.length) % caseStudies.length)} />}
    </section>
  );
}

function CaseCard({ study, onOpen, delay }: { study: CaseStudy; onOpen: () => void; delay: number }) {
  return (
    <article className="reveal group" style={{ "--reveal-delay": `${delay}s` } as CSSProperties}>
      <button tabIndex={-1} aria-hidden="true" onClick={onOpen} className="lift-card block w-full overflow-hidden rounded-xl border border-border" data-cursor="read the case study ↗">
        <CaseVisual kind={study.visual} className="transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
      </button>
      <p className="mt-5 font-mono text-xs text-muted-foreground">{study.number} / {study.tags.join(" · ")}</p>
      <h3 className="mt-2 font-display text-[1.75rem] font-medium leading-[1.1]">{study.title}</h3>
      <p className="mt-2 leading-relaxed text-muted-foreground">{study.blurb}</p>
      <p className="mt-3 text-sm"><span className="text-foreground">{study.employer}</span> <span className="text-muted-foreground">· {study.role}</span></p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {study.results.slice(0, 2).map((r) => (
          <li key={r.label} className="rounded-full border border-border bg-surface/60 px-3 py-1 text-xs"><span className="font-semibold text-cyan">{r.value}</span> <span className="text-muted-foreground">{r.label}</span></li>
        ))}
      </ul>
      <button onClick={onOpen} className="story-link mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary" aria-label={`Read the case study: ${study.title}`}>
        read the case study <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </button>
    </article>
  );
}

// A case study, up close.
function CaseSpotlight({ index, onClose, onMove }: { index: number; onClose: () => void; onMove: (d: number) => void }) {
  const study = caseStudies[index]!;
  return (
    <Spotlight label={`Case study: ${study.title}`} onClose={onClose} onMove={onMove}>
      <div key={study.id} className="animate-reveal grid items-start gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{study.number} / {study.tags.join(" · ")} · {study.dates}</p>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,4.5vw,4rem)] font-semibold leading-[1.02]">{study.title}</h2>
          <p className="mt-4 text-primary">{study.employer} · {study.role}</p>
          <h3 className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">the context</h3>
          <p className="mt-3 text-lg leading-relaxed">{study.context}</p>
          <h3 className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">what I did</h3>
          <ul className="mt-4 grid gap-3">
            {study.did.map((d) => (
              <li key={d} className="grid grid-cols-[auto_1fr] gap-4 leading-relaxed text-muted-foreground">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 rounded-full bg-cyan" />
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-xl border border-border">
            <CaseVisual kind={study.visual} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Illustrative visual, not client material.</p>
          <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">results</h3>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {study.results.map((r) => (
              <li key={r.label} className="rounded-lg border border-border bg-surface/60 p-4">
                <p className="font-display text-3xl font-semibold text-gradient">{r.value}</p>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">{r.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Spotlight>
  );
}

// A sticky note, slapped on at an angle.
function StickyNote({ tone, rotate, className, children }: { tone: "lavender" | "mint"; rotate: number; className?: string; children: ReactNode }) {
  return (
    <p className={cn("absolute z-10 w-36 px-4 pb-4 pt-5 sm:w-40 font-hand text-[1.35rem] leading-[1.05] text-[#1c2030] shadow-[0_18px_30px_-14px_rgb(0_0_0/0.7)] transition-[rotate] duration-500 group-hover:rotate-0", tone === "lavender" ? "bg-[#e4ddff]" : "bg-[#d3f1f7]", className)} style={{ rotate: `${rotate}deg` }}>
      <span aria-hidden="true" className="absolute left-1/2 top-1 h-1.5 w-10 -translate-x-1/2 rounded-full bg-[#1c2030]/10" />
      {children}
    </p>
  );
}

// A round sticker for a result worth shouting about.
function MedalSticker({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <div className={cn("absolute z-10 grid h-28 w-28 rotate-[12deg] place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#c6b9ff,var(--primary)_55%,#6b56e6)] text-center text-primary-foreground shadow-[0_18px_34px_-12px_var(--primary)] ring-4 ring-background transition-[rotate,scale] duration-500 group-hover:rotate-0 group-hover:scale-105 sm:h-32 sm:w-32", className)}>
      <div>
        <p className="font-display text-4xl font-bold leading-none tracking-tight sm:text-5xl">{value}</p>
        <p className="mx-auto mt-1 max-w-[5.5rem] font-mono text-[0.58rem] uppercase leading-tight tracking-[0.08em]">{label}</p>
      </div>
    </div>
  );
}

const journalNotes: Record<string, { text: ReactNode; tone: "lavender" | "mint" }> = {
  brand: { text: <>lesson #1: think like a founder ✦</>, tone: "lavender" },
  circular: { text: <>do better, for longer ♻</>, tone: "mint" },
};

// Notes from the MSc: the moments that changed how Gauri thinks about
// marketing, pinned up like a scrapbook.
function Journal() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => (ref.current ? observeReveals(ref.current) : undefined), []);
  return (
    <section id="journal" ref={ref} aria-labelledby="journal-title" className="relative overflow-hidden border-t border-border bg-background px-5 pb-28 pt-28 sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden" aria-hidden="true"><p className="translate-y-[-38%] whitespace-nowrap font-display text-[24vw] font-bold leading-none tracking-[-0.05em] text-surface">JOURNAL</p></div>
      <div className="relative mx-auto grid max-w-[1500px] gap-16 pt-[14vw] lg:grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)]">
        <div className="reveal h-fit lg:sticky lg:top-28">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">journal / from the MSc</p>
          <h2 id="journal-title" className="mt-4 max-w-md font-display text-5xl font-medium leading-[1] sm:text-6xl">notes from<br /><em className="text-gradient pr-1">the classroom.</em></h2>
          <p className="mt-8 max-w-sm leading-relaxed text-muted-foreground">Two moments at Cranfield that changed how I think about marketing, written up the way I shared them.</p>
          <Scribble className="mt-8 hidden w-44 lg:block" rotate={-6}>the good kind of<br />homework ✎</Scribble>
        </div>
        <div className="grid gap-24 sm:gap-28">
          {journal.map((entry, index) => (
            <JournalCard key={entry.id} entry={entry} flip={index % 2 === 1} onOpen={() => setOpen(index)} />
          ))}
        </div>
      </div>
      {open !== null && <JournalSpotlight index={open} onClose={() => setOpen(null)} onMove={(d) => setOpen((open + d + journal.length) % journal.length)} />}
    </section>
  );
}

function JournalCard({ entry, flip, onOpen }: { entry: JournalEntry; flip: boolean; onOpen: () => void }) {
  const note = journalNotes[entry.id];
  return (
    <article className="reveal group grid items-center gap-20 md:grid-cols-[1.05fr_1fr] md:gap-10">
      <div className={cn("relative mx-auto w-[92%] max-w-[34rem] md:w-full", flip && "md:order-2")}>
        <button onClick={onOpen} tabIndex={-1} aria-hidden="true" className="block w-full cursor-pointer text-left" data-cursor="read the full note ↗">
          <Polaroid photo={photos[entry.photo]} caption={entry.caption} rotate={flip ? 3 : -3} wide />
        </button>
        {entry.badge && <MedalSticker value={entry.badge.value} label={entry.badge.label} className={cn("-top-10", flip ? "-left-6" : "-right-6")} />}
        {note && (
          <StickyNote tone={note.tone} rotate={flip ? -5 : 5} className={cn("-bottom-[4.5rem] sm:-bottom-16", flip ? "-right-2" : "-left-2 sm:-left-8")}>
            {note.text}
          </StickyNote>
        )}
        <Sparkle className={cn("h-5 w-5 text-cyan", flip ? "-left-8 top-1/3" : "-right-8 top-1/2")} />
      </div>
      <div className={cn(flip && "md:order-1")}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">{entry.kicker} <span className="text-primary">·</span> {entry.date}</p>
        <h3 className="mt-3 font-display text-[clamp(1.9rem,2.6vw,2.6rem)] font-medium leading-[1.06]">{entry.title}</h3>
        <p className="mt-4 leading-relaxed text-muted-foreground">{entry.excerpt}</p>
        {entry.quote && (
          <blockquote className="relative mt-10 border-l-2 border-primary/60 pl-5">
            <span aria-hidden="true" className="absolute -left-1 -top-6 font-serif text-6xl leading-none text-primary/40">“</span>
            <p className="font-serif text-xl italic leading-snug">{entry.quote.text}</p>
            <footer className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">{entry.quote.by}</footer>
          </blockquote>
        )}
        <button onClick={onOpen} className="story-link mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary" aria-label={`Read the full note: ${entry.title}`}>
          read the full note <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  );
}

// A journal note, up close.
function JournalSpotlight({ index, onClose, onMove }: { index: number; onClose: () => void; onMove: (d: number) => void }) {
  const entry = journal[index]!;
  return (
    <Spotlight label={`Journal: ${entry.title}`} onClose={onClose} onMove={onMove}>
      <div key={entry.id} className="animate-reveal grid items-start gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{entry.kicker} · {entry.date}</p>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] font-semibold leading-[1.02]">{entry.title}</h2>
          {entry.quote && (
            <blockquote className="mt-8 rounded-xl border border-primary/30 bg-primary/[0.07] p-6">
              <p className="font-serif text-2xl italic leading-snug">“{entry.quote.text}”</p>
              <footer className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">{entry.quote.by}</footer>
            </blockquote>
          )}
          <div className="mt-8 grid gap-5 text-lg leading-relaxed text-muted-foreground">
            {entry.body.map((p) => <p key={p}>{p}</p>)}
          </div>
          <h3 className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{entry.listTitle}</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {entry.list.map((item, i) => (
              <li key={item} className="rounded-full border border-border bg-surface/60 px-4 py-2 text-sm"><span className="mr-2 font-mono text-xs text-primary">0{i + 1}</span>{item}</li>
            ))}
          </ul>
          <p className="mt-10 border-t border-border pt-6 font-display text-xl leading-snug">{entry.closing}</p>
        </div>
        <div className="lg:sticky lg:top-24">
          <div className="relative mx-auto max-w-[34rem] px-4 pt-6">
            <Polaroid photo={photos[entry.photo]} caption={entry.caption} rotate={-2} wide />
            {entry.badge && <MedalSticker value={entry.badge.value} label={entry.badge.label} className="-right-2 -top-4" />}
          </div>
          {entry.stats && (
            <>
              <ul className="mt-10 grid gap-3 sm:grid-cols-3">
                {entry.stats.map((st) => (
                  <li key={st.label} className="rounded-lg border border-border bg-surface/60 p-4">
                    <p className="font-display text-3xl font-semibold text-gradient">{st.value}</p>
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

// Where the closing thread ends — the top of the portrait's arch — in vw/vh
// of the section's first screen.
const END_X = 76;
const END_Y = 20;

// The portrait the thread lands on, with the monogram as a sticker at its foot.
function PortraitEnd({ visible, className }: { visible: boolean; className?: string }) {
  return (
    <PortraitArch visible={visible} className={className}>
      <div className={cn("absolute -bottom-[9%] -left-[14%] w-[40%] transition-[rotate] delay-500 duration-1000", visible ? "rotate-[-8deg]" : "rotate-[-40deg]")}>
        <Medallion visible={visible} sticker />
      </div>
    </PortraitArch>
  );
}

// A handwritten margin note, like scribbles on the page.
function Scribble({ className, rotate = -10, children }: { className?: string; rotate?: number; children: ReactNode }) {
  return (
    <p className={cn("font-hand text-[1.45rem] leading-[1.1] text-foreground/70", className)} style={{ rotate: `${rotate}deg` }}>
      {children}
    </p>
  );
}

// A small hand-drawn arrow. `d` is the stroke; the head is drawn at its end.
function ScribbleArrow({ d, head, className, style }: { d: string; head: string; className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 60 60" className={cn("absolute h-10 w-10 overflow-visible text-foreground/60", className)} style={style}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d={head} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Where the thread lands: a monogram with the positioning running round it.
function Medallion({ visible, className, sticker = false }: { visible: boolean; className?: string; sticker?: boolean }) {
  return (
    <div aria-hidden="true" className={cn("relative aspect-square transition-[opacity,transform] duration-1000 ease-[cubic-bezier(.22,.7,.2,1)]", visible ? "scale-100 opacity-100" : "scale-90 opacity-0", className)}>
      <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_30%_25%,color-mix(in_oklch,var(--primary)_30%,transparent),transparent_60%),radial-gradient(circle_at_75%_80%,color-mix(in_oklch,var(--cyan)_18%,transparent),transparent_55%)] blur-xl" />
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <defs>
          <path id="medallion-ring" d="M100 100 m-82 0 a82 82 0 1 1 164 0 a82 82 0 1 1 -164 0" />
        </defs>
        {sticker && <circle cx="100" cy="100" r="99" className="fill-background/90" />}
        <circle cx="100" cy="100" r="96" fill="none" className="stroke-border" strokeWidth="1" />
        <circle cx="100" cy="100" r="68" className="fill-surface stroke-primary/50" strokeWidth="1.2" />
        <g className="origin-center animate-spin-slow" style={{ transformBox: "fill-box", animationDuration: "40s" }}>
          <text className="fill-muted-foreground font-mono text-[8.6px] uppercase tracking-[0.32em]">
            <textPath href="#medallion-ring">marketing strategy · media intelligence · measurable growth ·</textPath>
          </text>
        </g>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className={cn("font-display font-semibold leading-none tracking-[-0.06em]", sticker ? "text-[clamp(1.4rem,2.2vw,2.2rem)]" : "text-[clamp(2.6rem,5vw,4.6rem)]")}>G<span className="text-gradient">T</span></p>
          {!sticker && <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Milton Keynes, UK</p>}
        </div>
      </div>
    </div>
  );
}

const pill = "inline-flex items-center justify-between gap-8 rounded-xl px-5 text-[1.02rem] transition-[background-color,border-color,color,transform] duration-300 hover:-translate-y-0.5";

// The end. "oh, hi. i'm gauri." — and the thread leaves the "hi." and waves
// its way across to her portrait. Margin notes scribbled around it.
function OhHi() {
  const ref = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const hiRef = useRef<HTMLSpanElement>(null);
  // Only the two moments that change the layout go through React: the words
  // arriving, and the thread reaching the medallion.
  const [stage, setStage] = useState({ seen: false, reached: false });
  const [thread, setThread] = useState("");
  const seen = stage.seen;
  // Phones: the thread runs down the page from "oh, hi." into the medallion.
  const phoneEndRef = useRef<HTMLDivElement>(null);
  const phonePathRef = useRef<SVGPathElement>(null);
  const [phoneThread, setPhoneThread] = useState<{ d: string; y0: number; y1: number; w: number; h: number } | null>(null);
  const [phoneReached, setPhoneReached] = useState(false);

  // The thread starts right after "oh, hi." — wherever the type lands on this
  // screen — so measure it, then wave through to the medallion.
  useEffect(() => {
    const measure = () => {
      const hi = hiRef.current;
      const section = ref.current;
      if (!hi || !section) return;
      const r = hi.getBoundingClientRect();
      const q = section.getBoundingClientRect();
      const sx = ((r.right - q.left) / window.innerWidth) * 100 + 0.8;
      const sy = ((r.top - q.top + r.height * 0.55) / window.innerHeight) * 100;
      // On phones, trace it in pixels: out of the "hi.", down the right edge,
      // and into the top of the medallion.
      const end = phoneEndRef.current;
      if (window.innerWidth < DESKTOP_STORY && end) {
        const m = end.getBoundingClientRect();
        const w = q.width;
        const start: Waypoint = [r.right - q.left + 6, r.top - q.top + r.height * 0.55];
        const stop: Waypoint = [m.left - q.left + m.width / 2, m.top - q.top + m.height * 0.04];
        const d = segmentsPath(threadSegments([start, [w * 0.9, start[1] + 36], [w * 0.95, (start[1] + stop[1]) / 2], [stop[0] + 44, stop[1] - 70], stop], 1, 1));
        setPhoneThread({ d, y0: start[1], y1: stop[1], w, h: q.height });
      }
      const crest = Math.max(sx + 6, 31);
      setThread(threadPath([[sx, sy], [crest, sy - 4], [crest + 12, 34], [55, 50], [63, 38], [68, 24], [73, END_Y - 2], [END_X, END_Y]]));
    };
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!phoneThread) return;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const node = ref.current;
      const path = phonePathRef.current;
      if (!node || !path) return;
      const top = node.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.72 - (top + phoneThread.y0)) / Math.max(1, phoneThread.y1 - phoneThread.y0)));
      path.style.strokeDashoffset = `${1 - p}`;
      setPhoneReached(p >= 0.98);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [phoneThread]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Arrive and the thread travels toward the medallion; scroll back up and
    // it retraces its way out. It animates on its own rather than sticking to
    // the scrollbar, easing toward wherever it should be, and sleeps when settled.
    let frame = 0;
    let current = 0;
    let greeted = false;
    const instant = prefersReducedMotion();
    const tick = () => {
      frame = 0;
      const { top } = node.getBoundingClientRect();
      const target = top < window.innerHeight * 0.45 ? 1 : 0;
      const gap = target - current;
      current = instant || Math.abs(gap) < 0.002 ? target : current + gap * 0.045 + Math.sign(gap) * 0.004;
      current = Math.min(1, Math.max(0, current));
      if (pathRef.current) pathRef.current.style.strokeDashoffset = `${1 - current}`;
      const next = { seen: current > 0.3 || target === 1, reached: current >= 0.98 };
      if (next.reached && !greeted) {
        greeted = true;
        say("hi", "you made it to the end? hi.");
      }
      setStage((s) => (s.seen === next.seen && s.reached === next.reached ? s : next));
      if (current !== target) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
    };
  }, []);

  // Fade and sharpen something in, merged with its own classes and style.
  const arrive = (on: boolean, delay: string, className: string, style?: CSSProperties) => ({
    className: cn(className, "transition-all duration-700", on ? "translate-y-0 opacity-100 blur-0" : "translate-y-3 opacity-0 blur-sm"),
    style: { ...style, transitionDelay: on ? delay : "0s" },
  });

  return (
    <section id="hi" ref={ref} aria-labelledby="hi-title" className="relative min-h-screen overflow-hidden border-t border-border px-5 pb-10 pt-28 sm:px-8 lg:h-screen lg:min-h-[720px] lg:px-[4.5vw] lg:pb-0 lg:pt-[22vh]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="ambient-b absolute -right-[10vw] top-[10vh] h-[70vh] w-[50vw] rounded-full bg-primary/[0.08] blur-[120px]" />
      </div>
      {phoneThread && (
        <svg aria-hidden="true" className="pointer-events-none absolute left-0 top-0 lg:hidden" width={phoneThread.w} height={phoneThread.h} viewBox={`0 0 ${phoneThread.w} ${phoneThread.h}`}>
          <ThreadInk id="phone-hi-ink" x2={phoneThread.w} y2={phoneThread.h} />
          <path ref={phonePathRef} d={phoneThread.d} pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: 1 }} fill="none" stroke="url(#phone-hi-ink)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-screen lg:block">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <ThreadInk id="hi-ink" x2={1000} />
          <path ref={pathRef} pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: 1 }} d={thread} fill="none" stroke="url(#hi-ink)" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="pointer-events-auto absolute -translate-x-1/2" style={{ left: `${END_X}vw`, top: `${END_Y}vh`, width: "min(50vh, 25vw)" }}>
          <PortraitEnd visible={stage.reached} className="w-full" />
        </div>
        <div {...arrive(stage.reached, ".5s", "absolute", { left: `calc(${END_X}vw + min(25vh, 12.5vw) + 1.5rem)`, top: "16vh" })}>
          <Scribble className="w-28" rotate={-12}>the thread<br />ends here.</Scribble>
          <ScribbleArrow className="-left-8 top-14" d="M30 4 C32 20 22 32 6 36" head="M6 36 L16 29 M6 36 L15 42" />
        </div>
        <div {...arrive(stage.reached, ".8s", "absolute", { left: `calc(${END_X}vw + min(25vh, 12.5vw) + 1.5rem)`, top: "62vh" })}>
          <Scribble className="w-28" rotate={-10}>the conversation<br />doesn't.</Scribble>
          <ScribbleArrow className="-left-10 -top-8" d="M40 30 C30 18 18 14 6 18" head="M6 18 L15 12 M6 18 L14 25" />
        </div>
      </div>

      <div {...arrive(seen, "0s", "relative z-20 lg:max-w-[56vw]")}>
        <div className="relative w-fit">
          <Scribble className="absolute -left-1 -top-14 hidden lg:block" rotate={-8}>who's behind this?</Scribble>
          <ScribbleArrow className="-left-8 -top-7 hidden lg:block" d="M26 4 C12 10 6 22 10 36" head="M10 36 L4 27 M10 36 L16 29" />
          <h2 id="hi-title" className="font-display text-[clamp(3.5rem,6.6vw,7.5rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
            <span ref={hiRef}>oh, hi.</span>
            <br />
            i'm <em className="text-gradient pr-2">gauri</em>.
          </h2>
        </div>
        <p className="mt-5 text-[clamp(1.05rem,1.25vw,1.3rem)] leading-[1.3] text-muted-foreground">still curious.<br />still measuring.<br />still optimising.</p>
        <p className="mt-7 font-display text-[clamp(1.75rem,2.6vw,2.8rem)] font-medium leading-[1.08]">let's make the numbers <em className="text-gradient pr-1">move</em>.</p>
        <div className="relative mt-8 flex w-fit max-w-full flex-col items-start gap-3">
          <a href={`mailto:${EMAIL}`} className={cn(pill, "w-full min-w-0 bg-foreground py-3.5 text-background hover:bg-primary hover:text-primary-foreground sm:min-w-72")} data-cursor="say hello.">
            <span className="truncate">{EMAIL}</span> <ArrowUpRight className="h-4 w-4 shrink-0" />
          </a>
          <div className="flex flex-wrap gap-3">
            <a href={CV_PATH} download className={cn(pill, "border border-foreground/40 py-2.5 hover:border-foreground hover:bg-surface")} data-cursor="one page, all of it.">download CV <Download className="h-4 w-4" /></a>
            {LINKEDIN_URL && (
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className={cn(pill, "border border-foreground/40 py-2.5 hover:border-foreground hover:bg-surface")} data-cursor="the professional version.">linkedin <ArrowUpRight className="h-4 w-4" /></a>
            )}
            <Link to="/work" className={cn(pill, "border border-foreground/40 py-2.5 hover:border-foreground hover:bg-surface")} data-cursor="every role, every number.">full record <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">based in Milton Keynes, United Kingdom</p>
        </div>
        <div className="relative ml-auto mr-[4%] mt-20 w-[66%] max-w-[20rem] lg:hidden">
          <div ref={phoneEndRef}>
            <PortraitEnd visible={phoneReached} />
          </div>
          <Scribble className="absolute -left-[42%] top-[38%] w-28 text-[1.25rem]" rotate={-10}>that's me.<br />say hi?</Scribble>
        </div>
      </div>

      <button onClick={() => document.getElementById("brain")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" })} className="story-link z-20 mt-12 block bg-transparent text-xs text-muted-foreground/80 max-lg:relative lg:absolute lg:bottom-6 lg:right-8 lg:mt-0" data-cursor="rewind ↑">© 2026 Gauri Tichkule · back to top ↑</button>
    </section>
  );
}

// Phones have no cursor, so the story's comments pop up as a little chat
// bubble in the bottom corner instead — typed out, then gone.
function PhoneComment() {
  const [comment, setComment] = useState<CursorComment | null>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const onComment = (event: Event) => {
      const next = (event as CustomEvent<CursorComment>).detail;
      if (next.id !== "hover" && window.innerWidth < DESKTOP_STORY) setComment(next);
    };
    const hush = (e: Event) => {
      if ((e as CustomEvent<number>).detail !== -1) setComment(null);
    };
    window.addEventListener("figure-open", hush);
    window.addEventListener("cursor-comment", onComment);
    return () => {
      window.removeEventListener("figure-open", hush);
      window.removeEventListener("cursor-comment", onComment);
    };
  }, []);

  useEffect(() => {
    setTyped("");
    if (!comment) return;
    let index = 0;
    let fade = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(comment.text.slice(0, index));
      if (index >= comment.text.length) {
        window.clearInterval(timer);
        fade = window.setTimeout(() => setComment((c) => (c === comment ? null : c)), 3800);
      }
    }, 32);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(fade);
    };
  }, [comment]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed bottom-5 left-4 z-[90] lg:hidden">
      <div
        className={cn(
          "origin-bottom-left whitespace-nowrap rounded-[24px_24px_24px_2px] border border-cursor-border bg-cursor px-4 py-2 text-sm font-medium text-cursor-foreground shadow-[0_10px_30px_-10px_var(--primary)] transition-[opacity,scale] duration-300",
          comment ? "scale-100 opacity-100" : "scale-75 opacity-0",
        )}
        style={{ transitionTimingFunction: "var(--ease-spring)" }}
      >
        {typed || " "}
      </div>
    </div>
  );
}

// The cursor's comment bubble. It trails the pointer with a touch of easing
// and says nothing by default — it only speaks when the story or the thing
// under the pointer has something to say, types it out, and fades away.
function CuriousCursor({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState<CursorComment | null>(null);
  const [typed, setTyped] = useState("");
  const [moved, setMoved] = useState(false);
  // Re-places the bubble without the pointer moving (e.g. as text types out).
  const reposition = useRef(() => {});

  useEffect(() => {
    const target = { x: -200, y: -200 };
    const pos = { x: -200, y: -200 };
    let frame = 0;
    const tick = () => {
      pos.x += (target.x - pos.x) * 0.28;
      pos.y += (target.y - pos.y) * 0.28;
      const el = ref.current;
      if (el) {
        // Near the right or bottom edge, the bubble flips to the other side of
        // the pointer so it never runs off screen.
        const bubble = el.firstElementChild as HTMLElement | null;
        const w = bubble?.offsetWidth ?? 0;
        const h = bubble?.offsetHeight ?? 0;
        const left = pos.x + 14 + w > window.innerWidth - 8;
        const up = pos.y + 16 + h > window.innerHeight - 8;
        const x = left ? pos.x - 14 - w : pos.x + 14;
        const y = up ? pos.y - 16 - h : pos.y + 16;
        el.style.transform = `translate3d(${Math.max(8, x)}px, ${Math.max(8, y)}px, 0)`;
        // the sharp corner always points back at the cursor
        if (bubble) {
          const r = ["24px", "24px", "24px", "24px"];
          r[up ? (left ? 2 : 3) : left ? 1 : 0] = "2px";
          bubble.style.borderRadius = r.join(" ");
          bubble.style.transformOrigin = `${up ? "bottom" : "top"} ${left ? "right" : "left"}`;
        }
      }
      frame = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    reposition.current = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      // The first move puts the bubble right at the pointer, no glide in.
      if (target.x === -200) {
        pos.x = event.clientX;
        pos.y = event.clientY;
      }
      target.x = event.clientX;
      target.y = event.clientY;
      setMoved(true);
      if (!frame) frame = requestAnimationFrame(tick);
    };
    // Hovering something with a comment says it; moving off it goes quiet.
    let hoverText = "";
    const over = (event: PointerEvent) => {
      const el = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-cursor]") : null;
      const text = el?.dataset["cursor"] ?? "";
      if (text === hoverText) return;
      hoverText = text;
      if (text) setComment({ id: "hover", text, fade: false });
      else setComment((c) => (c?.id === "hover" ? null : c));
    };
    const onComment = (event: Event) => setComment((event as CustomEvent<CursorComment>).detail);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    const hush = (e: Event) => {
      if ((e as CustomEvent<number>).detail !== -1) setComment(null);
    };
    window.addEventListener("figure-open", hush);
    window.addEventListener("cursor-comment", onComment);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("figure-open", hush);
      window.removeEventListener("cursor-comment", onComment);
    };
  }, []);

  // Type the comment out, then let story comments fade after a few seconds.
  // The bubble grows as it types, so keep checking it still fits on screen.
  useEffect(() => {
    reposition.current();
  }, [typed]);

  useEffect(() => {
    setTyped("");
    if (!comment) return;
    let index = 0;
    let fade = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(comment.text.slice(0, index));
      if (index >= comment.text.length) {
        window.clearInterval(timer);
        if (comment.fade) fade = window.setTimeout(() => setComment((c) => (c === comment ? null : c)), 4500);
      }
    }, 32);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(fade);
    };
  }, [comment]);

  const showing = visible && moved && comment !== null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden will-change-transform motion-reduce:hidden lg:block"
      style={{ transform: "translate3d(-200px, -200px, 0)" }}
    >
      <div
        className={cn(
          "origin-top-left whitespace-nowrap rounded-[2px_24px_24px_24px] border border-cursor-border bg-cursor px-4 py-2 text-sm font-medium text-cursor-foreground shadow-[0_10px_30px_-10px_var(--primary)] transition-[opacity,scale] duration-300",
          showing ? "scale-100 opacity-100" : "scale-75 opacity-0",
        )}
        style={{ transitionTimingFunction: "var(--ease-spring)" }}
      >
        {typed || " "}
      </div>
    </div>
  );
}
