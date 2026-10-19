import type { CSSProperties, ReactNode } from "react";

import city from "@/assets/gauri-city.jpg";
import portrait from "@/assets/gauri-portrait.jpg";
import brand from "@/assets/brand-presentation-day.jpg";
import lecture from "@/assets/lecture-circular-fashion.jpg";
import { cn } from "@/lib/utils";

// Gauri's two photos, and the two ways the site frames them: a taped-down
// polaroid for the story, and an arch for the end of the thread.
export const photos = {
  city: { src: city, width: 1080, height: 1440, alt: "Gauri Tichkule smiling by a window high above the City of London, with the Gherkin behind her", position: "62% 32%" },
  portrait: { src: portrait, width: 896, height: 1050, alt: "Gauri Tichkule smiling with her arms crossed, in a pink jumper", position: "50% 18%" },
  brand: { src: brand, width: 1400, height: 1050, alt: "Gauri with her MSc Strategic Marketing classmates and lecturers at Cranfield on Managing Brands presentation day", position: "50% 62%" },
  lecture: { src: lecture, width: 1280, height: 1240, alt: "Gauri with classmates and guest speaker Tze Ching Yeung at Cranfield, under slides reading “Circular fashion isn’t a design problem”", position: "50% 55%" },
};
type Photo = (typeof photos)[keyof typeof photos];

// A strip of washi tape holding the photo down.
function Tape({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={cn("absolute h-6 w-20 rounded-[2px] opacity-85 shadow-sm backdrop-blur-[1px]", className)} style={style} />;
}

// A small four-point sparkle doodle.
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={cn("absolute", className)}>
      <path d="M12 1 C13 9 15 11 23 12 C15 13 13 15 12 23 C11 15 9 13 1 12 C9 11 11 9 12 1Z" fill="currentColor" />
    </svg>
  );
}

// A polaroid, taped at the corners, tilted a little. Hover (or focus within
// its parent) straightens it and lifts it toward you.
export function Polaroid({ photo, caption, rotate = -4, className, eager = false, wide = false }: { photo: Photo; caption: ReactNode; rotate?: number; className?: string | undefined; eager?: boolean; wide?: boolean }) {
  return (
    <figure
      className={cn("group/polaroid relative w-full rounded-[3px] bg-[#f6f3ec] p-[5%] pb-0 text-[#1c2030] shadow-[0_30px_60px_-25px_rgb(0_0_0/0.75),0_0_0_1px_rgb(255_255_255/0.06)] transition-[rotate,translate,scale,box-shadow] duration-700 ease-[cubic-bezier(.22,.7,.2,1)] hover:-translate-y-2 hover:scale-[1.03] hover:rotate-0 hover:shadow-[0_40px_80px_-30px_var(--primary)]", className)}
      style={{ rotate: `${rotate}deg` }}
    >
      <Tape className="-left-5 -top-2 -rotate-[28deg] bg-primary/55" />
      <Tape className="-right-5 -top-1 rotate-[24deg] bg-cyan/50" />
      <div className="overflow-hidden rounded-[2px] bg-[#d9d6cf]">
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className={cn(wide ? "aspect-[4/3]" : "aspect-[4/5]", "w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,.7,.2,1)] group-hover/polaroid:scale-[1.05]")}
          style={{ objectPosition: photo.position }}
        />
      </div>
      <figcaption className="px-1 pb-[6%] pt-[5%] text-center font-hand text-[clamp(1.2rem,1.5vw,1.6rem)] leading-tight">{caption}</figcaption>
    </figure>
  );
}

// An arch-framed portrait: the soft glow behind it, the photo settling into
// place when it appears, and room for a sticker at its foot.
export function PortraitArch({ visible, className, children }: { visible: boolean; className?: string | undefined; children?: ReactNode }) {
  const photo = photos.portrait;
  return (
    <div className={cn("relative aspect-[4/5] transition-[opacity,translate,scale] duration-1000 ease-[cubic-bezier(.22,.7,.2,1)]", visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-95 opacity-0", className)}>
      <div aria-hidden="true" className="absolute -inset-[8%] rounded-full bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklch,var(--primary)_40%,transparent),transparent_60%),radial-gradient(circle_at_75%_75%,color-mix(in_oklch,var(--cyan)_25%,transparent),transparent_55%)] blur-2xl" />
      {/* a true semicircle on top (4:5 box: 50% of the width = 40% of the height), soft corners below */}
      <div className="group/arch relative h-full w-full overflow-hidden border border-foreground/15 bg-[#ecebee] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)]" style={{ borderRadius: "50% 50% 1.75rem 1.75rem / 40% 40% 1.75rem 1.75rem" }}>
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={cn("h-full w-full object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(.22,.7,.2,1)] group-hover/arch:scale-[1.04]", visible ? "scale-100" : "scale-110")}
          style={{ objectPosition: photo.position }}
        />
        {/* a lavender wash over the studio white, so it belongs to the palette */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,#ddd5ff_0%,#f3f0ff_45%,#d6f3fa_100%)] mix-blend-multiply" />
        {/* a soft fade at the foot, so the photo settles into the page */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background/70 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />
      </div>
      <Sparkle className="-right-3 top-[14%] h-6 w-6 animate-twinkle-rare text-cyan [animation-duration:4s]" />
      <Sparkle className="-left-4 top-[34%] h-4 w-4 animate-twinkle-rare text-primary [animation-delay:1.5s] [animation-duration:5s]" />
      {children}
    </div>
  );
}
