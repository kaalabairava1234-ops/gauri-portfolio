// Everything search engines and AI answer engines read about the site lives
// here: titles, descriptions, the share image, and the structured data that
// says who Gauri is. None of it changes what's on screen.

import { EMAIL, LINKEDIN_URL, NAME } from "./content";

export { NAME };

// The address the site is deployed at (GitHub Pages). If a custom domain is
// connected later, update it here and in public/sitemap.xml, public/robots.txt
// and public/llms.txt, so canonical links and share cards point to the right place.
export const SITE_URL = "https://kaalabairava1234-ops.github.io/gauri-portfolio";
export const OG_IMAGE = `${SITE_URL}/og.png`;

export const ABOUT_SHORT =
  "Gauri Tichkule is a Milton Keynes-based marketing professional with a blended experience across digital and broadcast media: campaign operations at Mediamint, US national TV at IPG Mediabrands and B2B marketing at Navatech, plus an MSc in Strategic Marketing from Cranfield University with research on trust and AI adoption. Open to HR marketing, marketing consulting and B2B roles.";

export const PROFILES = [LINKEDIN_URL].filter(Boolean);

export const person = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: NAME,
  url: SITE_URL,
  image: OG_IMAGE,
  email: `mailto:${EMAIL}`,
  jobTitle: "Marketing Professional",
  description: ABOUT_SHORT,
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Cranfield University" },
    { "@type": "CollegeOrUniversity", name: "City Premium College" },
  ],
  address: { "@type": "PostalAddress", addressLocality: "Milton Keynes", addressCountry: "GB" },
  knowsAbout: [
    "Strategic marketing",
    "B2B marketing",
    "Media planning and buying",
    "US national television advertising",
    "Digital advertising",
    "Retargeting",
    "CRM and marketing automation",
    "Customer journey mapping",
    "SEO",
    "Answer Engine Optimisation",
    "Technology adoption and trust",
    "Go-to-market strategy",
  ],
  ...(PROFILES.length ? { sameAs: PROFILES } : {}),
};

// Turn a JSON-LD object into a <script> entry for a route's head.
export const jsonLd = (data: Record<string, unknown>) => ({
  type: "application/ld+json",
  children: JSON.stringify({ "@context": "https://schema.org", ...data }),
});

// The standard set of tags for a page: title, description, canonical address
// and the share card.
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }) {
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Gauri Tichkule — from the campaign desk to the strategy table" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
