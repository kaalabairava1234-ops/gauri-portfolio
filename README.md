# Gauri Tichkule — from the campaign desk to the strategy table

The personal portfolio of Gauri Tichkule, a Milton Keynes-based marketing professional working across US national TV planning and buying, digital advertising, B2B marketing, CRM and Answer Engine Optimisation, with an MSc in Strategic Marketing from Cranfield University.

An editorial portfolio for a marketing professional working across digital and broadcast media, B2B marketing and research-led strategy.

## What's on it

One page, seven sections:

| Section | What it holds |
| --- | --- |
| Hero | Positioning, "open to" roles, CV download, an index of the four channels |
| 01 Journey | Six chapters, 2019–2026, with a sticky year that changes as you read |
| 02 Experience | Six headline numbers, then each role with highlights and expandable responsibilities |
| 03 Leadership | Careers Representative, Art & Craft Society, Hult Prize |
| 04 Research | The MSc thesis on trust and AI safety adoption |
| 05 Field notes | Two MSc moments, each opening into a full note |
| 06 About | Story, education, skills and life beyond work |
| 07 Contact | Email, LinkedIn, CV |

## Where things live

- `src/lib/content.ts`: **every fact on the site** (journey, roles, research, education, skills, leadership, notes). Edit words here, not in the page.
- `src/routes/index.tsx`: the page and its sections
- `src/components/photos.tsx`: the photos and the editorial frame they open in
- `src/components/spotlight.tsx`: the accessible dialog for field notes
- `src/lib/motion.ts`: shared reveal and count-up helpers (all respect reduced motion)
- `src/lib/seo.ts`: titles, share card, structured data
- `src/styles.css`: colour tokens, typography and the motion system
- `public/Gauri_Tichkule_CV.pdf`: the CV every download link points to

## Before going live

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
- Animation is hand-written: CSS masks, clip-path wipes and IntersectionObserver reveals. No animation libraries.
- Type: Fraunces, Instrument Sans and IBM Plex Mono (Google Fonts); palette of ivory, navy and terracotta

## Credits

Started from [SomehowLiving/portfolio-template](https://github.com/SomehowLiving/portfolio-template) (MIT, see `LICENSE`) as a structural base; the design, content and visuals are Gauri Tichkule's.
