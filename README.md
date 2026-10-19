# Gauri Tichkule — Marketing Strategy. Media Intelligence. Measurable Growth.

The personal portfolio of Gauri Tichkule, a Milton Keynes-based marketing professional working across US national TV planning and buying, digital advertising, B2B marketing, CRM and Answer Engine Optimisation, with an MSc in Strategic Marketing from Cranfield University.

Built on [SomehowLiving/portfolio-template](https://github.com/SomehowLiving/portfolio-template) (MIT). The template's structure is kept: a story told along one hand-drawn thread, a work section, a rabbit-hole transition into a second page, and an "oh, hi." ending.

- **Laptop (1024px and up):** the story scrolls sideways. The thread pulls free of a tangle ("every channel, network and touchpoint"), weaves through the channels, the toolkits and the years, ties an optimisation loop, and ends at the work.
- **Phones and tablets:** the same story told vertically, with the thread weaving down the page.

## What's on it

| Section | Where | What it holds |
| --- | --- | --- |
| Hero | `/` story intro | Positioning, intro, location, Explore my work, Download CV |
| About | story | 4+ years, the channels, Cranfield MSc |
| Skills & tools | story ("three toolkits") | Media and campaigns, CRM and content, platforms and tools |
| Experience & education | story timeline | One beat per year; each role opens with its full CV bullets |
| How I work | story loop | research → plan → run → measure → optimise |
| Impact | `#impact` | Six CV metrics with count-up animation |
| Selected work | `#work` | Four experience-based case studies with illustrative visuals |
| The full record | `/work` | Every role, education, skills, leadership and community |
| Contact | `#hi` | Email, CV download, full record |

## Where things live

- `src/lib/content.ts`: **every fact on the site**, taken from the CV. Edit words here, not in the pages.
- `src/routes/index.tsx`: the home page (story, impact, work, contact)
- `src/routes/work.tsx`: the full record, reached through the rabbit hole
- `src/components/marks.tsx`: the line-drawn objects along the thread
- `src/components/case-visuals.tsx`: the illustrative case-study diagrams
- `src/components/spotlight.tsx`: the accessible detail dialog for roles and case studies
- `src/components/rabbit-hole.tsx`: the fall into the full record and the climb back out
- `src/lib/motion.ts`: shared reveal and count-up helpers (all respect reduced motion)
- `src/lib/seo.ts`: titles, share card, structured data
- `src/styles.css`: colour tokens, typography and animations
- `public/Gauri_Tichkule_CV.pdf`: the CV every download link points to

## Before going live

1. **LinkedIn:** paste the profile URL into `LINKEDIN_URL` in `src/lib/content.ts`. LinkedIn links stay hidden until it's set.
2. **Domain:** the site address is set to the GitHub Pages URL. If you connect a custom domain, update `SITE_URL` in `src/lib/seo.ts` and the same address in `public/sitemap.xml`, `public/robots.txt` and `public/llms.txt`.
3. **CV:** replace `public/Gauri_Tichkule_CV.pdf` whenever the CV changes (keep the file name, or update `CV_PATH`).

## Run it locally

```sh
npm install
npm run dev     # Vite prints the local address
npm run build   # production build into .output/
```

## Deploy

**Live site (GitHub Pages):** https://kaalabairava1234-ops.github.io/gauri-portfolio/

Both pages are pre-rendered to static HTML at build time, so the site runs on GitHub Pages. To publish an update:

```sh
npm run deploy:pages
```

This builds the site for the `/gauri-portfolio/` sub-path (`npm run build:pages`) and publishes the result to the `gh-pages` branch, which GitHub Pages serves (Settings → Pages → Deploy from a branch → `gh-pages` / root). Changes go live within a minute or two. Commit and push your source changes to `main` as usual; the `gh-pages` branch only ever holds the built site.

The same project also deploys to [Vercel](https://vercel.com) with zero configuration (import the repo, keep the detected settings). Vercel Web Analytics is wired in for that, and switched off in the GitHub Pages build.

## Built with

- [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router), TypeScript
- Vite, Tailwind CSS 4
- Animation is hand-written: SVG paths for the threads, `requestAnimationFrame` for the scroll story, CSS and IntersectionObserver for reveals. No animation libraries.
- Type: Space Grotesk, Inter, Instrument Serif, JetBrains Mono, Caveat (Google Fonts)

## Credits

Template and thread engine by [Nidhi Prajapati](https://github.com/SomehowLiving/portfolio-template), MIT-licensed (see `LICENSE`). Content, story and visuals are Gauri Tichkule's.
