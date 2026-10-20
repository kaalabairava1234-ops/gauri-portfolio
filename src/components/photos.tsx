import type { CSSProperties, ReactNode } from "react";

import brand from "@/assets/brand-presentation-day.jpg";
import city from "@/assets/gauri-city.jpg";
import portrait from "@/assets/gauri-portrait.jpg";
import lecture from "@/assets/lecture-circular-fashion.jpg";
import { cn } from "@/lib/utils";

// Gauri's photos: two of her, two from the MSc. Real photos only.
export const photos = {
  portrait: { src: portrait, width: 896, height: 1050, alt: "Gauri Tichkule smiling with her arms crossed, in a pink jumper", position: "50% 20%" },
  city: { src: city, width: 1080, height: 1440, alt: "Gauri Tichkule smiling by a window high above the City of London, with the Gherkin behind her", position: "62% 32%" },
  brand: { src: brand, width: 1400, height: 1050, alt: "Gauri with her MSc Strategic Marketing classmates and lecturers at Cranfield on Managing Brands presentation day", position: "50% 62%" },
  lecture: { src: lecture, width: 1280, height: 1240, alt: "Gauri with classmates and guest speaker Tze Ching Yeung at Cranfield, under slides reading “Circular fashion isn’t a design problem”", position: "50% 55%" },
};
export type Photo = (typeof photos)[keyof typeof photos];

// An editorial frame: the photo opens with a wipe (on load, or when it
// scrolls into view), with an optional terracotta block offset behind it and
// a small mono caption underneath.
export function Frame({
  photo,
  aspect = "aspect-[4/5]",
  caption,
  offset = false,
  onLoad = false,
  delay = 0,
  eager = false,
  className,
}: {
  photo: Photo;
  aspect?: string;
  caption?: ReactNode;
  offset?: boolean;
  onLoad?: boolean;
  delay?: number;
  eager?: boolean;
  className?: string | undefined;
}) {
  const timing = { [onLoad ? "--d" : "--delay"]: `${delay}s` } as CSSProperties;
  return (
    <figure className={cn("relative", !onLoad && "reveal reveal-wipe", className)} style={timing}>
      <div className="relative">
        {offset && <div aria-hidden="true" className={cn("absolute -bottom-4 -right-4 left-6 top-8 bg-terracotta sm:-bottom-5 sm:-right-5", onLoad && "load-fade")} style={timing} />}
        <div className={cn("wipe-box relative overflow-hidden bg-sand", aspect, onLoad && "load-wipe")} style={timing}>
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover"
          style={{ objectPosition: photo.position }}
        />
        </div>
      </div>
      {caption && <figcaption className="relative mt-7 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
